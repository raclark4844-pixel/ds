import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { WebsiteReviewDocument } from "./report-document";
import type { WebsiteReviewReport } from "./types";

export function websiteReviewFilename(recordId: string) {
  return `Demore-Website-Report-${recordId || "Review"}.pdf`;
}

async function logoSrc() {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "logo.png"));
    return `data:image/png;base64,${file.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function renderWebsiteReviewPdf(report: WebsiteReviewReport): Promise<Buffer> {
  const logo = await logoSrc();
  const document = createElement(WebsiteReviewDocument, { report, logoSrc: logo }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(document);
  return Buffer.from(buffer);
}
