import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { selectedIndustries } from "../../../src/lib/industry-selection";
import { getSql } from "../../../src/lib/db";
import { verifyHandoffToken } from "../../../src/lib/comparison-store";

/*
 * Release prerequisites:
 * - Apply the matching schema migration before enabling this route.
 * - consent_events must deny UPDATE/DELETE to the application role.
 * - project_reports must enforce UNIQUE(project_id, report_id).
 * - Consent, brief, and handoff tables must reference that scoped identity.
 * - Run CI in an isolated database, never against the production binding.
 * This source alone does not establish that migrations, CI, or deployment ran.
 */

type Sql = Awaited<ReturnType<typeof getSql>>;
type Raw = Record<string, unknown>;
type Routing = { to: string[]; cc: string[] };
type ConsentEvidence = {
  id: string;
  value: boolean;
  disclosure: string;
  timestamp: string;
  source: string;
};
type Derived = {
  projectId: string;
  submissionId: string;
  reportId: string | null;
  submittedAt: string;
  industries: string[];
  industry: string;
  name: string;
  email: string;
  wants: string[];
  budget: number;
  consent: ConsentEvidence;
  isTest: boolean;
};
type Config = {
  projectId: string;
  from: string;
  apiKey: string;
  defaultTo: string[];
  routing: Record<string, Routing>;
  origins: Set<string>;
  disclosure: string;
  disclosureVersion: string;
  crm?: { url: string; secret: string };
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

const MAX_BODY_BYTES = 32_768;

function clean(value: unknown, max = 4000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function list(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => clean(item, 200))
        .filter(Boolean)
        .slice(0, 30)
    : [];
}

function requiredEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) throw new HttpError(503, "CONFIGURATION_UNAVAILABLE");
  return value;
}

function addresses(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some(
      (item) =>
        typeof item !== "string" ||
        !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(item),
    )
  ) {
    throw new HttpError(503, "INVALID_ROUTING_CONFIGURATION");
  }
  return [...new Set(value as string[])];
}

function httpsEndpoint(value: string): string {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    (url.port && url.port !== "443")
  ) {
    throw new HttpError(503, "INVALID_CRM_CONFIGURATION");
  }
  return url.href;
}

function loadConfig(): Config {
  // These settings belong exclusively to this deployment's project.
  const projectId = requiredEnv("PROJECT_ID");
  const defaultTo = addresses(JSON.parse(requiredEnv("PROJECT_BRIEF_TO_JSON")));
  const supplied = JSON.parse(requiredEnv("INDUSTRY_ROUTING_JSON"));
  const routing: Record<string, Routing> = Object.create(null);

  for (const [industry, route] of Object.entries(supplied)) {
    if (!route || typeof route !== "object") {
      throw new HttpError(503, "INVALID_ROUTING_CONFIGURATION");
    }
    const entry = route as Record<string, unknown>;
    routing[industry] = {
      to: addresses(entry.to),
      cc:
        Array.isArray(entry.cc) && entry.cc.length === 0
          ? []
          : addresses(entry.cc),
    };
  }

  const origins = new Set<string>();
  for (const value of JSON.parse(requiredEnv("PROJECT_BRIEF_ORIGINS_JSON"))) {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.origin !== value) {
      throw new HttpError(503, "INVALID_ORIGIN_CONFIGURATION");
    }
    origins.add(url.origin);
  }
  if (!origins.size) throw new HttpError(503, "INVALID_ORIGIN_CONFIGURATION");

  const webhook = process.env.CRM_HANDOFF_WEBHOOK_URL?.trim();
  let crm: Config["crm"];
  if (webhook) {
    const url = httpsEndpoint(webhook);
    const approved = JSON.parse(requiredEnv("CRM_ENDPOINTS_BY_PROJECT_JSON"));
    const endpoints = approved[projectId];
    if (
      !Array.isArray(endpoints) ||
      !endpoints.some((endpoint) => httpsEndpoint(endpoint) === url)
    ) {
      throw new HttpError(503, "UNAPPROVED_CRM_DESTINATION");
    }

    const secret = requiredEnv("CRM_WEBHOOK_SECRET");
    if (Buffer.byteLength(secret) < 32) {
      throw new HttpError(503, "INVALID_CRM_CONFIGURATION");
    }
    crm = { url, secret };
  }

  const from = requiredEnv("PROJECT_BRIEF_FROM_EMAIL");
  addresses([from]);

  return {
    projectId,
    from,
    apiKey: requiredEnv("RESEND_API_KEY"),
    defaultTo,
    routing,
    origins,
    disclosure: requiredEnv("SMS_CONSENT_DISCLOSURE"),
    disclosureVersion: requiredEnv("SMS_CONSENT_DISCLOSURE_VERSION"),
    crm,
  };
}

export function resolveRecipients(
  industries: string[],
  defaultTo: string[],
  routing: Record<string, Routing>,
): Routing {
  // Mixed-industry requests never inherit a business-specific CC.
  if (industries.length !== 1) return { to: defaultTo, cc: [] };
  const route = Object.hasOwn(routing, industries[0])
    ? routing[industries[0]]
    : undefined;
  return route ?? { to: defaultTo, cc: [] };
}

export function assertConsentEvidence(
  smsOptIn: boolean,
  evidence: Partial<ConsentEvidence>,
): void {
  if (
    typeof smsOptIn !== "boolean" ||
    evidence.value !== smsOptIn ||
    !evidence.id ||
    !evidence.disclosure?.trim() ||
    !evidence.timestamp ||
    !Number.isFinite(Date.parse(evidence.timestamp)) ||
    !evidence.source
  ) {
    throw new HttpError(400, "SMS_CONSENT_EVIDENCE_REQUIRED");
  }
  const source = new URL(evidence.source);
  if (source.protocol !== "https:" || source.origin !== evidence.source) {
    throw new HttpError(400, "SMS_CONSENT_EVIDENCE_REQUIRED");
  }
}

export function signCrmPayload(
  secret: string,
  timestamp: string,
  eventId: string,
  body: string,
): string {
  return `v1=${createHmac("sha256", secret)
    .update(`${timestamp}.${eventId}.${body}`)
    .digest("hex")}`;
}

function validInternalTestFlag(request: Request): boolean {
  if (process.env.PROJECT_BRIEF_TEST_MODE !== "true") return false;

  const expected = process.env.PROJECT_BRIEF_TEST_SECRET;
  const received = request.headers.get("x-demore-test-secret");
  if (!expected || expected.length < 32 || !received) {
    throw new HttpError(403, "INVALID_TEST_AUTHORIZATION");
  }
  const left = Buffer.from(expected);
  const right = Buffer.from(received);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new HttpError(403, "INVALID_TEST_AUTHORIZATION");
  }
  return true;
}

export function buildHandoffRecord(raw: Raw, d: Derived) {
  return {
    projectId: d.projectId,
    reportId: d.reportId,
    submissionId: d.submissionId,
    submittedAt: d.submittedAt,
    industry: d.industry,
    industries: d.industries,
    name: d.name,
    email: d.email,
    phone: clean(raw.phone, 80),
    businessName: clean(raw.businessName, 160),
    website: clean(raw.website, 500),
    wants: d.wants,
    budget: d.budget,
    goal: clean(raw.goal),
    timeline: clean(raw.timeline, 300),
    crmTools: clean(raw.crmTools),
    smsOptIn: d.consent.value,
    consentEventId: d.consent.id,
    isTest: d.isTest,
    followUpStatus: "new",
  };
}

async function readBody(request: Request): Promise<Raw> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    throw new HttpError(415, "JSON_REQUIRED");
  }
  if (!request.body) throw new HttpError(400, "INVALID_REQUEST");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new HttpError(413, "REQUEST_TOO_LARGE");
      }
      chunks.push(value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error();
    }
    return parsed as Raw;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "INVALID_REQUEST");
  } finally {
    reader.releaseLock();
  }
}

async function verifyBot(request: Request, source: string): Promise<void> {
  // Mandatory managed challenge; never trust a client-supplied IP header.
  const token = request.headers.get("x-turnstile-token");
  if (!token || token.length > 2048) {
    throw new HttpError(403, "BOT_VERIFICATION_REQUIRED");
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: requiredEnv("TURNSTILE_SECRET_KEY"),
        response: token,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!response.ok) throw new HttpError(503, "BOT_VERIFICATION_UNAVAILABLE");

  const result = await response.json();
  if (
    result.success !== true ||
    result.hostname !== new URL(source).hostname ||
    result.action !== "project_brief"
  ) {
    throw new HttpError(403, "BOT_VERIFICATION_FAILED");
  }
}

async function rateLimit(sql: Sql, projectId: string): Promise<void> {
  // Shared, atomic project-wide cap supplements the one-use bot challenge.
  const rows = await sql`
    INSERT INTO project_brief_rate_limits (project_id, bucket, requests)
    VALUES (${projectId}, date_trunc('minute', CURRENT_TIMESTAMP), 1)
    ON CONFLICT (project_id, bucket)
    DO UPDATE SET requests = project_brief_rate_limits.requests + 1
    WHERE project_brief_rate_limits.requests < 30
    RETURNING requests
  `;
  if (!rows.length) throw new HttpError(429, "RATE_LIMITED");
}

async function captureProjectBrief(
  sql: Sql,
  raw: Raw,
  d: Derived,
  disclosureVersion: string,
  handoffToken: string,
): Promise<void> {
  if (
    d.reportId &&
    (!handoffToken || !verifyHandoffToken(d.reportId, handoffToken))
  ) {
    throw new HttpError(403, "INVALID_HANDOFF");
  }

  assertConsentEvidence(d.consent.value, d.consent);
  const record = JSON.stringify(buildHandoffRecord(raw, d));

  // One statement makes consent, brief capture, and initial handoff atomic.
  // Every write derives its identity from the server-scoped eligible row.
  const rows = await sql`
    WITH eligible AS (
      SELECT ${d.projectId}::text AS project_id
      WHERE ${d.reportId}::text IS NULL
         OR EXISTS (
           SELECT 1 FROM project_reports
           WHERE project_id = ${d.projectId}
             AND report_id = ${d.reportId}
         )
    ),
    consent AS (
      INSERT INTO consent_events (
        id, project_id, submission_id, report_id, type, value,
        disclosure_text, disclosure_version, occurred_at, source_origin
      )
      SELECT ${d.consent.id}, project_id, ${d.submissionId}, ${d.reportId},
             'sms_opt_in', ${d.consent.value}, ${d.consent.disclosure},
             ${disclosureVersion}, ${d.consent.timestamp}::timestamptz,
             ${d.consent.source}
      FROM eligible
      RETURNING id, project_id
    ),
    brief AS (
      INSERT INTO project_briefs (
        project_id, submission_id, report_id, consent_event_id, payload
      )
      SELECT project_id, ${d.submissionId}, ${d.reportId}, id, ${record}::jsonb
      FROM consent
      RETURNING project_id, submission_id, report_id, consent_event_id
    ),
    handoff AS (
      INSERT INTO project_handoffs (
        project_id, report_id, submission_id, consent_event_id,
        payload, crm_status
      )
      SELECT project_id, report_id, submission_id, consent_event_id,
             ${record}::jsonb, 'pending'
      FROM brief WHERE report_id IS NOT NULL
      RETURNING submission_id
    )
    SELECT submission_id FROM brief
  `;
  if (rows.length !== 1) throw new HttpError(404, "REPORT_NOT_FOUND");
}

async function recordProjectHandoff(
  sql: Sql,
  d: Derived,
  handoffToken: string,
  status: "crm_sent" | "crm_failed",
): Promise<void> {
  // Re-check the gate before every handoff mutation, including CRM completion.
  if (
    !d.reportId ||
    !handoffToken ||
    !verifyHandoffToken(d.reportId, handoffToken)
  ) {
    throw new HttpError(403, "INVALID_HANDOFF");
  }

  const rows = await sql`
    UPDATE project_handoffs AS h
    SET crm_status = ${status}
    WHERE h.project_id = ${d.projectId}
      AND h.report_id = ${d.reportId}
      AND h.submission_id = ${d.submissionId}
      AND h.consent_event_id = ${d.consent.id}
      AND EXISTS (
        SELECT 1 FROM project_reports AS r
        WHERE r.project_id = h.project_id AND r.report_id = h.report_id
      )
    RETURNING h.submission_id
  `;
  if (rows.length !== 1) throw new HttpError(409, "HANDOFF_SCOPE_MISMATCH");
}

function emailFields(raw: Raw, d: Derived): string {
  const fields: [string, string][] = [
    ["Submitted", d.submittedAt],
    ["Industries", d.industry],
    ["Name", d.name],
    ["Email", d.email],
    ["Looking for", d.wants.join(", ")],
    ["Budget", `$${d.budget.toLocaleString("en-US")}`],
    ["SMS opt-in", d.consent.value ? "Yes — audit recorded" : "No"],
  ];

  const labels: Record<string, string> = {
    role: "Role",
    businessName: "Business",
    phone: "Phone",
    city: "City / market",
    serviceArea: "Service area",
    website: "Website",
    goal: "Goal",
    timeline: "Timeline",
    mustHavePages: "Must-have pages / functions",
    brand: "Brand notes",
    likedSites: "Sites they like",
    competitors: "Competitors",
    buyer: "Ideal buyer",
    frequency: "Posting frequency",
    approver: "Content approver",
    existingContent: "Existing content/assets",
    seoNow: "Current SEO / AI visibility",
    growthPriority: "Growth priority",
    leadProcess: "Current lead process",
    analyticsNow: "Analytics / tracking",
    automationNeeds: "Automation needs",
    crmTools: "CRM / tools",
    anythingElse: "Anything else",
  };
  for (const [key, label] of Object.entries(labels)) {
    fields.push([label, clean(raw[key])]);
  }
  fields.push(
    ["Features", list(raw.features).join(", ")],
    ["Platforms", list(raw.platforms).join(", ")],
  );

  return [
    ...(d.isTest ? ["TEST — discard, not a lead."] : []),
    "DEMORE TECHNOLOGY SOLUTIONS — NEW PROJECT BRIEF",
    ...fields.map(([label, value]) => `${label}: ${value || "—"}`),
  ].join("\n");
}

export default async function projectBrief({ req }: { req: Request }) {
  const correlationId = randomUUID();
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };

  try {
    if (req.method.toUpperCase() !== "POST") {
      return Response.json(
        { error: "METHOD_NOT_ALLOWED" },
        { status: 405, headers: { ...headers, Allow: "POST" } },
      );
    }

    const config = loadConfig();
    const source = req.headers.get("origin") ?? "";
    if (!config.origins.has(source)) {
      throw new HttpError(403, "ORIGIN_NOT_ALLOWED");
    }

    const isTest = validInternalTestFlag(req);
    await verifyBot(req, source);

    const sql = await getSql();
    await rateLimit(sql, config.projectId);
    const raw = await readBody(req);
    const industries = selectedIndustries(raw.industries ?? raw.industry);
    const name = clean(raw.name, 120);
    const email = clean(raw.email, 254);
    const wants = list(raw.wants);
    const budget =
      typeof raw.budget === "string" || typeof raw.budget === "number"
        ? Number(raw.budget)
        : NaN;

    if (
      !industries.length ||
      !name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !wants.length ||
      !Number.isFinite(budget) ||
      budget < 600 ||
      raw.consent !== true ||
      typeof raw.smsOptIn !== "boolean"
    ) {
      throw new HttpError(400, "INVALID_PROJECT_BRIEF");
    }

    // The client must acknowledge the exact disclosure version displayed.
    if (
      raw.smsOptIn &&
      raw.smsDisclosureVersion !== config.disclosureVersion
    ) {
      throw new HttpError(400, "SMS_DISCLOSURE_ACKNOWLEDGMENT_REQUIRED");
    }

    const submittedAt = new Date().toISOString();
    const d: Derived = {
      projectId: config.projectId,
      submissionId: randomUUID(),
      reportId: clean(raw.reportId, 100) || null,
      submittedAt,
      industries,
      industry: industries.join(" | "),
      name,
      email,
      wants,
      budget,
      isTest,
      consent: {
        id: randomUUID(),
        value: raw.smsOptIn,
        disclosure: config.disclosure,
        timestamp: submittedAt,
        source,
      },
    };
    const handoffToken = clean(raw.handoffToken, 512);

    // Fail closed: no email composition or provider call before durable evidence.
    await captureProjectBrief(
      sql,
      raw,
      d,
      config.disclosureVersion,
      handoffToken,
    );

    const recipients = resolveRecipients(
      industries,
      config.defaultTo,
      config.routing,
    );
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `${config.projectId}/${d.submissionId}`,
      },
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        from: config.from,
        to: recipients.to,
        ...(recipients.cc.length ? { cc: recipients.cc } : {}),
        reply_to: email,
        subject: `${isTest ? "TEST — discard — " : ""}New project brief — ${
          d.industry
        } — ${clean(raw.businessName, 100) || name}`.replace(/[\r\n]/g, " "),
        text: emailFields(raw, d),
      }),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new HttpError(502, "EMAIL_DELIVERY_FAILED");
    }
    await response.body?.cancel();

    // Test submissions never send PII into a production CRM.
    if (d.reportId && config.crm && !isTest) {
      let status: "crm_sent" | "crm_failed" = "crm_failed";
      try {
        const body = JSON.stringify({
          ...buildHandoffRecord(raw, d),
          eventId: d.submissionId,
        });
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const crmResponse = await fetch(config.crm.url, {
          method: "POST",
          redirect: "error",
          headers: {
            "Content-Type": "application/json",
            "X-Demore-Event-Id": d.submissionId,
            "X-Demore-Timestamp": timestamp,
            "X-Demore-Signature": signCrmPayload(
              config.crm.secret,
              timestamp,
              d.submissionId,
              body,
            ),
          },
          body,
          signal: AbortSignal.timeout(10_000),
        });
        status = crmResponse.ok ? "crm_sent" : "crm_failed";
        await crmResponse.body?.cancel();
      } catch {
        // Never log provider bodies, exceptions, URLs, or submitted fields.
        console.error({ code: "CRM_DELIVERY_FAILED", correlationId });
      }
      await recordProjectHandoff(sql, d, handoffToken, status);
    }

    return Response.json(
      { ok: true, reportId: d.reportId },
      { headers },
    );
  } catch (error) {
    const known = error instanceof HttpError;
    const status = known ? error.status : 503;
    const code = known ? error.code : "PROJECT_BRIEF_UNAVAILABLE";
    if (status >= 500) console.error({ code, correlationId });

    return Response.json(
      { error: code, correlationId },
      {
        status,
        headers:
          status === 429
            ? { ...headers, "Retry-After": "60" }
            : headers,
      },
    );
  }
}

/*
 * CI RELEASE GATES — configure these as required checks before merging:
 * 1. assertConsentEvidence(true, { value: true }) throws; missing disclosure,
 *    timestamp, or source independently throws; failed audit writes send nothing.
 * 2. Every non-exteriors industry and every mixed-industry selection excludes
 *    the exteriors inbox; an unknown industry uses defaultTo with no CC.
 * 3. Capture CRM fetch calls and independently verify the HMAC over the exact
 *    timestamp.eventId.body bytes; reject altered bodies, missing signatures,
 *    stale timestamps, and replayed event IDs at the receiving endpoint.
 * 4. Cross-project report IDs write nothing; invalid handoff tokens mutate
 *    nothing; rate-limit/bot failures trigger no email or CRM calls.
 * 5. Confirm append-only privileges using the actual application DB role.
 *
 * Keep release blocked until those tests and the full isolated suite pass,
 * the migration/configuration is reviewed, and Vercel confirms the deployed
 * commit is READY with consent persistence and routing smoke-tested.
 */