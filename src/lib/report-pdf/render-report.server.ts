import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { ReportDocument } from "./report-document";
import type { ComparisonReport } from "./report-types";

export function sanitizeFilenamePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "company";
}

export function reportFilename(report: ComparisonReport) {
  return `demore-website-comparison-${sanitizeFilenamePart(report.companyName)}-${sanitizeFilenamePart(report.reportNumber)}.pdf`;
}

async function logoSrc() {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "logo.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return undefined;
  }
}

function isPrivateHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return host === "localhost"
    || host.endsWith(".localhost")
    || host.endsWith(".local")
    || host === "0.0.0.0"
    || host === "::1"
    || /^127\./.test(host)
    || /^10\./.test(host)
    || /^192\.168\./.test(host)
    || /^169\.254\./.test(host)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}

async function remoteImageSrc(raw?: string) {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || isPrivateHostname(url.hostname)) return undefined;
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "DemoreComparisonBot/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (!response.ok || !["image/png", "image/jpeg", "image/svg+xml"].includes(contentType) || contentLength > 2_000_000) return undefined;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 2_000_000) return undefined;
    return `data:${contentType};base64,${bytes.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function renderComparisonPdf(report: ComparisonReport): Promise<Buffer> {
  const [providerLogoSrc, customerLogoSrc] = await Promise.all([
    logoSrc(),
    remoteImageSrc(report.customerBrand?.logoUrl),
  ]);
  const document = createElement(ReportDocument, { report, providerLogoSrc, customerLogoSrc }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(document);
  return Buffer.from(buffer);
}
