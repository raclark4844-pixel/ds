import type { PerformanceSignals } from "@/lib/report-pdf/report-types";

type PsiMetric = { percentile?: number; category?: string };
type PsiResponse = {
  analysisUTCTimestamp?: string;
  loadingExperience?: { overall_category?: string; metrics?: Record<string, PsiMetric> };
  originLoadingExperience?: { overall_category?: string; metrics?: Record<string, PsiMetric> };
  lighthouseResult?: {
    fetchTime?: string;
    categories?: Record<string, { score?: number }>;
    audits?: Record<string, { numericValue?: number; displayValue?: string }>;
  };
};

function round(value: number | undefined, digits = 0) {
  if (!Number.isFinite(value)) return undefined;
  const factor = 10 ** digits;
  return Math.round(Number(value) * factor) / factor;
}

export async function measurePerformance(url: string): Promise<PerformanceSignals> {
  const key = process.env.PAGESPEED_API_KEY?.trim();
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  endpoint.searchParams.append("category", "performance");
  endpoint.searchParams.append("category", "seo");
  endpoint.searchParams.append("category", "accessibility");
  if (key) endpoint.searchParams.set("key", key);
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`PageSpeed HTTP ${response.status}`);
    const data = await response.json() as PsiResponse;
    const lighthouse = data.lighthouseResult;
    const field = data.loadingExperience?.metrics || data.originLoadingExperience?.metrics;
    const clsRaw = field?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile;
    return {
      measuredAt: lighthouse?.fetchTime || data.analysisUTCTimestamp || new Date().toISOString(),
      pageSpeed: {
        status: lighthouse ? "available" : "unavailable",
        source: "Google PageSpeed Insights / Lighthouse mobile lab",
        performanceScore: round((lighthouse?.categories?.performance?.score ?? NaN) * 100),
        seoScore: round((lighthouse?.categories?.seo?.score ?? NaN) * 100),
        accessibilityScore: round((lighthouse?.categories?.accessibility?.score ?? NaN) * 100),
        lcpMs: round(lighthouse?.audits?.["largest-contentful-paint"]?.numericValue),
        cls: round(lighthouse?.audits?.["cumulative-layout-shift"]?.numericValue, 3),
        tbtMs: round(lighthouse?.audits?.["total-blocking-time"]?.numericValue),
      },
      coreWebVitals: field ? {
        status: "available",
        source: "Chrome UX Report field data returned by PageSpeed Insights",
        assessment: data.loadingExperience?.overall_category || data.originLoadingExperience?.overall_category || "UNCLASSIFIED",
        lcpMs: round(field.LARGEST_CONTENTFUL_PAINT_MS?.percentile),
        inpMs: round(field.INTERACTION_TO_NEXT_PAINT?.percentile),
        cls: clsRaw === undefined ? undefined : round(clsRaw > 1 ? clsRaw / 100 : clsRaw, 3),
      } : {
        status: "insufficient_data",
        source: "Chrome UX Report",
        assessment: "Not enough public field data for this URL/origin",
      },
      searchConsole: {
        status: "connection_required",
        source: "Google Search Console",
        note: "Private owner data requires verified-property OAuth consent. No impressions, clicks or position values are inferred.",
      },
      trafficEstimate: {
        status: "unavailable",
        source: "DataForSEO Labs",
        note: "Traffic estimate was not requested or no licensed result was returned.",
      },
    };
  } catch (error) {
    return {
      measuredAt: new Date().toISOString(),
      pageSpeed: { status: "unavailable", source: "Google PageSpeed Insights", note: error instanceof Error ? error.message : "Request failed" },
      coreWebVitals: { status: "unavailable", source: "Chrome UX Report", assessment: "Live field data unavailable" },
      searchConsole: { status: "connection_required", source: "Google Search Console", note: "Verified-property OAuth consent is required." },
      trafficEstimate: { status: "unavailable", source: "DataForSEO Labs", note: "Traffic estimate was not requested or no licensed result was returned." },
    };
  }
}

type TrafficResponse = { status_code?: number; tasks?: Array<{ status_code?: number; result?: Array<{ items?: Array<{ target?: string; metrics?: { organic?: { etv?: number; count?: number } } }> }> }> };

export async function estimateOrganicTraffic(urls: string[], market: string) {
  const login = process.env.DATAFORSEO_LOGIN?.trim();
  const password = process.env.DATAFORSEO_PASSWORD?.trim();
  if (!login || !password) return new Map<string, number>();
  const targets = [...new Set(urls.map((url) => {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
  }).filter(Boolean))];
  if (!targets.length) return new Map<string, number>();
  try {
    const response = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_traffic_estimation/live", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ targets, location_name: /nationwide|united states|usa/i.test(market) ? "United States" : `${market}, United States`, language_code: "en", item_types: ["organic"] }]),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return new Map<string, number>();
    const data = await response.json() as TrafficResponse;
    const task = data.tasks?.[0];
    if (data.status_code !== 20000 || task?.status_code !== 20000) return new Map<string, number>();
    return new Map((task.result?.[0]?.items || []).flatMap((item) => item.target && Number.isFinite(item.metrics?.organic?.etv) ? [[item.target, Math.round(item.metrics!.organic!.etv!)]] as const : []));
  } catch {
    return new Map<string, number>();
  }
}
