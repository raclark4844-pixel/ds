export type DiscoveredCompetitor = {
  name: string;
  website: string;
  source: "Google Maps" | "Google organic";
  rank: number;
  mapsRank?: number;
  organicRank?: number;
  rating?: number;
  reviewCount?: number;
  placeId?: string;
  discoveredAt: string;
  query: string;
};

type SerpItem = {
  type?: string;
  rank_group?: number;
  rank_absolute?: number;
  title?: string;
  url?: string;
  domain?: string;
  place_id?: string;
  rating?: { value?: number; votes_count?: number } | null;
};
type SerpResponse = {
  status_code?: number;
  status_message?: string;
  tasks?: Array<{
    status_code?: number;
    status_message?: string;
    result?: Array<{ datetime?: string; items?: SerpItem[] }>;
  }>;
};

const INDUSTRY_QUERY: Record<string, string> = {
  contractors: "general contractors",
  landscaping: "landscaping companies",
  hospitality: "restaurants",
  "service-companies": "local service companies",
  "stores-ecommerce": "stores",
  "professional-services": "professional services",
  other: "local businesses",
};

function configured() {
  return Boolean(process.env.DATAFORSEO_LOGIN?.trim() && process.env.DATAFORSEO_PASSWORD?.trim());
}

function marketLocation(market: string) {
  return /united states|usa|u\.s\./i.test(market) ? market.trim() : `${market.trim()}, United States`;
}

function canonicalWebsite(item: SerpItem) {
  const direct = item.url?.trim();
  if (direct) {
    try {
      const parsed = new URL(direct);
      if (!/^(google\.|maps\.google\.)/i.test(parsed.hostname)) return parsed.origin;
    } catch { /* use domain fallback */ }
  }
  const domain = item.domain?.replace(/^www\./i, "").trim();
  return domain && domain.includes(".") ? `https://${domain}` : "";
}

function hostname(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; }
}

const AGGREGATORS = /(^|\.)(google|facebook|instagram|linkedin|yelp|tripadvisor|yellowpages|angi|thumbtack|bbb)\./i;

async function request(type: "maps" | "organic", keyword: string, market: string) {
  const login = process.env.DATAFORSEO_LOGIN?.trim();
  const password = process.env.DATAFORSEO_PASSWORD?.trim();
  if (!login || !password) throw new Error("DataForSEO credentials are not configured.");
  const response = await fetch(`https://api.dataforseo.com/v3/serp/google/${type}/live/advanced`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ keyword, location_name: marketLocation(market), language_code: "en", device: "mobile", depth: 20 }]),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`DataForSEO ${type} HTTP ${response.status}`);
  const data = await response.json() as SerpResponse;
  const task = data.tasks?.[0];
  if (data.status_code !== 20000 || task?.status_code !== 20000) {
    throw new Error(task?.status_message || data.status_message || `DataForSEO ${type} request failed.`);
  }
  const result = task.result?.[0];
  return { items: result?.items || [], discoveredAt: result?.datetime || new Date().toISOString() };
}

export async function discoverCompetitors(input: {
  industry: string;
  market: string;
  website: string;
}): Promise<{ competitors: DiscoveredCompetitor[]; live: boolean; note: string }> {
  if (!configured()) return { competitors: [], live: false, note: "DataForSEO is not configured." };
  const query = INDUSTRY_QUERY[input.industry] || input.industry || INDUSTRY_QUERY.other;
  const ownHost = hostname(input.website);
  const outcomes = await Promise.allSettled([
    request("maps", query, input.market),
    request("organic", query, input.market),
  ]);
  const merged = new Map<string, DiscoveredCompetitor>();
  outcomes.forEach((outcome, index) => {
    if (outcome.status !== "fulfilled") return;
    const source = index === 0 ? "Google Maps" : "Google organic";
    const expectedType = index === 0 ? "maps_search" : "organic";
    for (const item of outcome.value.items) {
      if (item.type !== expectedType) continue;
      const website = canonicalWebsite(item);
      const host = hostname(website);
      if (!host || host === ownHost || host.endsWith(`.${ownHost}`) || AGGREGATORS.test(host)) continue;
      const rank = item.rank_group || item.rank_absolute || 999;
      const existing = merged.get(host);
      const row: DiscoveredCompetitor = existing || {
        name: item.title?.trim() || host,
        website,
        source,
        rank,
        discoveredAt: outcome.value.discoveredAt,
        query: `${query} — ${marketLocation(input.market)}`,
      };
      if (source === "Google Maps") {
        row.mapsRank = rank;
        row.rating = item.rating?.value;
        row.reviewCount = item.rating?.votes_count;
        row.placeId = item.place_id;
      } else {
        row.organicRank = rank;
      }
      row.rank = Math.min(row.rank, rank);
      merged.set(host, row);
    }
  });
  const competitors = [...merged.values()]
    .sort((a, b) => (a.mapsRank ?? 999) - (b.mapsRank ?? 999) || (a.organicRank ?? 999) - (b.organicRank ?? 999))
    .slice(0, 3);
  const errors = outcomes.filter((outcome) => outcome.status === "rejected").length;
  return {
    competitors,
    live: competitors.length > 0,
    note: competitors.length ? `Selected from live Google Maps and organic results.${errors ? " One live source was unavailable." : ""}` : "No eligible business websites were returned by the live provider.",
  };
}
