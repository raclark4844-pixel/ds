import type { ComparisonReport } from "@/lib/report-pdf/report-types";
import { reportFilename } from "@/lib/report-pdf/render-report.server";

export function mailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.REPORT_FROM_EMAIL || "projects@demorehomesolutions.com",
    internal: process.env.REPORT_RECIPIENT_EMAIL || "ryan@demoretechnologysolutions.com",
    site: process.env.NEXT_PUBLIC_SITE_URL || "https://www.demoretechnologysolutions.com",
  };
}

export async function sendReportEmails(report: ComparisonReport, pdf: Buffer) {
  const cfg = mailConfig();
  if (!cfg.apiKey) {
    return {
      customer: { ok: false as const, error: "Email delivery is not configured." },
      internal: { ok: false as const, error: "Email delivery is not configured." },
    };
  }
  const filename = reportFilename(report);
  const attachment = { filename, content: pdf.toString("base64"), content_type: "application/pdf" };
  async function send(payload: Record<string, unknown>) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("[comparison-email] Resend error", res.status, detail.slice(0, 400));
      return { ok: false as const, error: "Email provider rejected the message." };
    }
    return { ok: true as const };
  }
  const customer = await send({
    from: `Demore Technology Solutions <${cfg.from}>`,
    to: [report.contactEmail],
    subject: "Your Demore Website Comparison Report",
    text: [`Your Demore website comparison report is attached.`, `Company: ${report.companyName}`, `Report: ${report.reportNumber}`, `Path: ${report.path}`, `Start a project: ${cfg.site}/contact?need=platform&source=compare`, ``, `Rankings, AI citations, and conversion lifts are not guaranteed.`].join("\n"),
    attachments: [attachment],
  });
  const internal = await send({
    from: `Demore Technology Solutions <${cfg.from}>`,
    to: [cfg.internal],
    reply_to: report.contactEmail,
    subject: `New Website Comparison — ${report.companyName}`,
    text: [`New website comparison — ${report.companyName}`, `Report: ${report.reportNumber}`, `Contact: ${report.contactName} <${report.contactEmail}>`, `Industry: ${report.industry}`, `Market: ${report.market}`, `Website: ${report.website}`, `Scores: current ${report.currentTotal}, competitor avg ${report.competitorAverage}, leader ${report.marketLeader}, potential ${report.potential}`, `Path: ${report.path}`].join("\n"),
    attachments: [attachment],
  });
  return { customer, internal };
}
