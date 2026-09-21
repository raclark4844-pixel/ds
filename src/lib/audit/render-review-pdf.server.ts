import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import type { AuditReport } from "./analyze";
import { ReviewDocument } from "./review-document";

export function reviewFilename(report: AuditReport) {
  return `Demore-Website-Report-${report.recordId || "Review"}.pdf`;
}

async function logoSrc() {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "logo.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function renderReviewPdf(report: AuditReport): Promise<Buffer> {
  const providerLogoSrc = await logoSrc();
  const document = createElement(ReviewDocument, { report, logoSrc: providerLogoSrc }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(document);
  return Buffer.from(buffer);
}
