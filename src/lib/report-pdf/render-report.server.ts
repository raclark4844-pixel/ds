import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
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

export async function renderComparisonPdf(report: ComparisonReport): Promise<Buffer> {
  const logo = await logoSrc();
  const buffer = await renderToBuffer(createElement(ReportDocument, { report, logoSrc: logo }));
  return Buffer.from(buffer);
}
