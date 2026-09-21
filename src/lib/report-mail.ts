import type { ComparisonReport } from "@/lib/report-pdf/report-types";
import { issueHandoffToken } from "@/lib/comparison-store";
import { reportFilename } from "@/lib/report-pdf/render-report.server";
import { unifiedIds } from "@/lib/unified-ids";
import { websiteReviewFilename } from "@/lib/website-review/render-pdf.server";
import type { WebsiteReviewReport } from "@/lib/website-review/types";
import {
  DISCLAIMER,
  mailConfig,
  websiteReviewCopySubject,
  websiteReviewCopyText,
} from "./report-mail-copy.ts";

export type MailResult = { ok: true } | { ok: false; error: string };
export {
  claimInternalCopy,
  mailConfig,
  releaseInternalCopy,
  websiteReviewCopySubject,
  websiteReviewCopyText,
} from "./report-mail-copy.ts";

function attachment(filename: string, pdf: Buffer) {
  return { filename, content: pdf.toString("base64"), content_type: "application/pdf" };
}

async function sendResend(
  payload: Record<string, unknown>,
  idempotencyKey?: string,
): Promise<MailResult> {
  const cfg = mailConfig();
  if (!cfg.apiKey) return { ok: false, error: "Email delivery is not configured." };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("[report-mail] Resend error", res.status, detail.slice(0, 400));
      return { ok: false, error: "Email provider rejected the message." };
    }
    return { ok: true };
  } catch (err) {
    console.error("[report-mail] send failed", err instanceof Error ? err.message : "unknown");
    return { ok: false, error: "Email delivery timed out." };
  }
}

export async function sendInternalPdfCopy(opts: {
  subject: string;
  text: string;
  filename: string;
  pdf: Buffer;
  replyTo?: string;
}): Promise<MailResult> {
  const cfg = mailConfig();
  return sendResend({
    from: `Demore Technology Solutions <${cfg.from}>`,
    to: cfg.internal,
    cc: cfg.internalCc,
    reply_to: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
    attachments: [attachment(opts.filename, opts.pdf)],
  });
}

export async function sendWebsiteReviewCopy(
  report: WebsiteReviewReport,
  pdf: Buffer,
): Promise<MailResult> {
  const cfg = mailConfig();
  return sendResend(
    {
      from: `Demore Technology Solutions <${cfg.from}>`,
      to: ["ryan@demoretechnologysolutions.com"],
      reply_to: report.contact?.email,
      subject: websiteReviewCopySubject(report),
      text: websiteReviewCopyText(report),
      attachments: [attachment(websiteReviewFilename(report.recordId), pdf)],
    },
    `website-review/${report.recordId}/${report.createdAt}/v${(report.revisions?.length || 0) + 1}`,
  );
}

export async function sendInternalComparisonCopy(
  report: ComparisonReport,
  pdf: Buffer,
): Promise<MailResult> {
  const ids = unifiedIds(report.reportNumber);
  return sendInternalPdfCopy({
    subject: `New Website Comparison — ${report.companyName} — ${ids.reportId}`,
    text: [
      `New website comparison — ${report.companyName}`,
      `Demore Report ID: ${ids.reportId}`,
      `customerId: ${ids.customerId}`,
      `leadId: ${ids.leadId}`,
      `comparisonId: ${ids.comparisonId}`,
      `Contact: ${report.contactName} <${report.contactEmail}>`,
      `Industry: ${report.industry}`,
      `Market: ${report.market}`,
      `Website: ${report.website}`,
      `Scores: current ${report.currentTotal}, competitor avg ${report.competitorAverage}, leader ${report.marketLeader}, potential ${report.potential}`,
      `Path: ${report.path}`,
      "",
      DISCLAIMER,
    ].join("\n"),
    filename: reportFilename(report),
    pdf,
    replyTo: report.contactEmail,
  });
}

export async function sendReportEmails(report: ComparisonReport, pdf: Buffer) {
  const cfg = mailConfig();
  const ids = unifiedIds(report.reportNumber);
  if (!cfg.apiKey) {
    return {
      customer: { ok: false as const, error: "Email delivery is not configured." },
      internal: { ok: false as const, error: "Email delivery is not configured." },
    };
  }
  const filename = reportFilename(report);
  const handoffUrl = `${cfg.site}/contact?need=platform&source=compare&reportId=${encodeURIComponent(report.reportNumber)}&handoffToken=${encodeURIComponent(issueHandoffToken(report.reportNumber))}`;
  const file = attachment(filename, pdf);
  const customer = await sendResend({
    from: `Demore Technology Solutions <${cfg.from}>`,
    to: [report.contactEmail],
    subject: "Your Demore Website Comparison Report",
    text: [
      `Your Demore website comparison report is attached.`,
      `Demore Report ID: ${ids.reportId}`,
      `Customer ID / Lead ID / Comparison ID: ${ids.reportId}`,
      `Company: ${report.companyName}`,
      `Path: ${report.path}`,
      `Start a project using this same report ID: ${handoffUrl}`,
      ``,
      DISCLAIMER,
    ].join("\n"),
    attachments: [file],
  });
  const internal = await sendInternalComparisonCopy(report, pdf);
  return { customer, internal };
}

export async function sendAdminPasswordReset(url: string): Promise<MailResult> {
  const cfg = mailConfig();
  return sendResend({
    from: `Demore Technology Solutions <${cfg.from}>`,
    to: ["ryan@demoretechnologysolutions.com"],
    subject: "Reset your Demore website administrator password",
    text: `Use this one-time link to choose a new password:\n\n${url}\n\nThe link expires in 15 minutes. Your current password stays valid until you finish the reset. If you did not request this, ignore this email. This resets the Demore website administrator login, not the separate Lead Engine account.`,
  });
}
