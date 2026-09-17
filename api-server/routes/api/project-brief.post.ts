type ProjectBrief = {
  reportId?: string;
  handoffToken?: string;
  industry?: string;
  name?: string;
  role?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  city?: string;
  serviceArea?: string;
  website?: string;
  wants?: string[];
  budget?: string;
  goal?: string;
  timeline?: string;
  features?: string[];
  mustHavePages?: string;
  brand?: string;
  likedSites?: string;
  competitors?: string;
  buyer?: string;
  platforms?: string[];
  frequency?: string;
  approver?: string;
  existingContent?: string;
  seoNow?: string;
  growthPriority?: string;
  leadProcess?: string;
  analyticsNow?: string;
  automationNeeds?: string;
  crmTools?: string;
  anythingElse?: string;
  consent?: boolean;
  submittedAt?: string;
};

const MIN_BUDGET = 600;
const TO_EMAILS = [
  "clark@demoreexteriorsolutions.com",
  "ryan@demoreexteriorsolutions.com",
];
const FROM_EMAIL = "projects@demorehomesolutions.com";

function clean(value: unknown, max = 4000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 200)).slice(0, 30)
    : [];
}

function textLine(label: string, value: string) {
  return `${label}: ${value || "—"}`;
}

export default async function projectBrief(event: { req: Request }) {
  if (event.req.method.toUpperCase() !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  let raw: ProjectBrief;
  try {
    raw = (await event.req.json()) as ProjectBrief;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const industry = clean(raw.industry, 120);
  const name = clean(raw.name, 120);
  const email = clean(raw.email, 254);
  const budget = Number(raw.budget);
  const wants = list(raw.wants);
  const reportId = clean(raw.reportId, 40);
  const handoffToken = clean(raw.handoffToken, 200);

  if (!industry || !name || !email || !email.includes("@")) {
    return Response.json({ error: "Industry, name, and a valid email are required." }, { status: 400 });
  }
  if (wants.length === 0) {
    return Response.json({ error: "Select at least one project need." }, { status: 400 });
  }
  if (!Number.isFinite(budget) || budget < MIN_BUDGET) {
    return Response.json({ error: `Project budget must be at least $${MIN_BUDGET}.` }, { status: 400 });
  }
  if (raw.consent !== true) {
    return Response.json({ error: "Consent is required." }, { status: 400 });
  }

  if (reportId) {
    const { recordProjectHandoff, verifyHandoffToken } = await import("../../../src/lib/comparison-store");
    if (!handoffToken || !verifyHandoffToken(reportId, handoffToken)) {
      return Response.json({ error: "The Demore Report ID handoff is invalid. Return to your comparison and use Start a project." }, { status: 403 });
    }
    const saved = await recordProjectHandoff(reportId, {
      submittedAt: clean(raw.submittedAt, 80) || new Date().toISOString(),
      industry,
      name,
      email,
      phone: clean(raw.phone, 80),
      businessName: clean(raw.businessName, 160),
      website: clean(raw.website, 500),
      wants,
      budget,
      goal: clean(raw.goal),
      timeline: clean(raw.timeline, 300),
      crmTools: clean(raw.crmTools),
      followUpStatus: "new",
    });
    if (!saved) return Response.json({ error: "That comparison report was not found." }, { status: 404 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[project-brief] RESEND_API_KEY is not configured");
    return Response.json({ error: "Email delivery is not configured yet. Please try again later." }, { status: 503 });
  }

  const fields = [
    "TEST — discard, not a lead.",
    "DEMORE TECHNOLOGY SOLUTIONS — NEW PROJECT BRIEF",
    textLine("Demore Report ID", reportId),
    textLine("Submitted", clean(raw.submittedAt, 80) || new Date().toISOString()),
    "",
    textLine("Industry", industry),
    textLine("Name", name),
    textLine("Role", clean(raw.role, 120)),
    textLine("Business", clean(raw.businessName, 160)),
    textLine("Phone", clean(raw.phone, 80)),
    textLine("Email", email),
    textLine("City / market", clean(raw.city, 160)),
    textLine("Service area", clean(raw.serviceArea, 300)),
    textLine("Website", clean(raw.website, 500)),
    "",
    textLine("Looking for", wants.join(", ")),
    textLine("Budget", `$${budget.toLocaleString("en-US")}`),
    textLine("Goal", clean(raw.goal)),
    textLine("Timeline", clean(raw.timeline, 300)),
    "",
    textLine("Features", list(raw.features).join(", ")),
    textLine("Must-have pages / functions", clean(raw.mustHavePages)),
    textLine("Brand notes", clean(raw.brand)),
    textLine("Sites they like", clean(raw.likedSites)),
    textLine("Competitors", clean(raw.competitors)),
    textLine("Ideal buyer", clean(raw.buyer)),
    "",
    textLine("Platforms", list(raw.platforms).join(", ")),
    textLine("Posting frequency", clean(raw.frequency, 200)),
    textLine("Content approver", clean(raw.approver, 200)),
    textLine("Existing content/assets", clean(raw.existingContent)),
    textLine("Current SEO / AI visibility", clean(raw.seoNow)),
    textLine("Growth priority", clean(raw.growthPriority, 200)),
    "",
    textLine("Current lead process", clean(raw.leadProcess)),
    textLine("Analytics / tracking", clean(raw.analyticsNow)),
    textLine("Automation needs", clean(raw.automationNeeds)),
    textLine("CRM / tools", clean(raw.crmTools)),
    textLine("Anything else", clean(raw.anythingElse)),
  ];

  const isTest = /TEST\s*[\u2014-]\s*discard|TEST ONLY/i.test(clean(raw.anythingElse) + " " + name + " " + clean(raw.businessName, 160));
  if (!isTest) {
    fields.shift();
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Demore Technology Project Brief <${FROM_EMAIL}>`,
      to: TO_EMAILS,
      reply_to: email,
      subject: `${isTest ? "TEST — discard, not a lead — " : ""}New project brief — ${industry} — ${clean(raw.businessName, 100) || name}`,
      text: fields.join("\n"),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("[project-brief] Resend error", response.status, detail.slice(0, 1000));
    return Response.json({ error: "We could not send the project brief. Please try again." }, { status: 502 });
  }

  const crmWebhook = process.env.CRM_HANDOFF_WEBHOOK_URL?.trim();
  if (reportId && crmWebhook) {
    let crmStatus: "crm_sent" | "crm_failed" = "crm_failed";
    try {
      const crmResponse = await fetch(crmWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          customerId: reportId,
          leadId: reportId,
          comparisonId: reportId,
          companyName: clean(raw.businessName, 160),
          contactName: name,
          email,
          phone: clean(raw.phone, 80),
          website: clean(raw.website, 500),
          industry,
          wants,
          budget,
          timeline: clean(raw.timeline, 300),
        }),
        signal: AbortSignal.timeout(10_000),
      });
      crmStatus = crmResponse.ok ? "crm_sent" : "crm_failed";
    } catch {
      crmStatus = "crm_failed";
    }
    const { recordProjectHandoff } = await import("../../../src/lib/comparison-store");
    await recordProjectHandoff(reportId, {
      submittedAt: clean(raw.submittedAt, 80) || new Date().toISOString(),
      industry, name, email,
      phone: clean(raw.phone, 80),
      businessName: clean(raw.businessName, 160),
      website: clean(raw.website, 500),
      wants, budget,
      goal: clean(raw.goal),
      timeline: clean(raw.timeline, 300),
      crmTools: clean(raw.crmTools),
      followUpStatus: "new",
    }, crmStatus);
  }

  return Response.json({ ok: true, reportId: reportId || null });
}
