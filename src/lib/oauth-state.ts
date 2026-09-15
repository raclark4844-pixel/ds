import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const STATE_TTL_MS = 10 * 60 * 1000;

function signingSecret() {
  return process.env.COMPARISON_SIGNING_SECRET || process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "demore-compare-signing-v1";
}

export function signOauthState(reportId: string) {
  const payload = Buffer.from(JSON.stringify({ reportId, exp: Date.now() + STATE_TTL_MS, n: randomBytes(8).toString("hex") })).toString("base64url");
  const sig = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readOauthState(state: string): { reportId: string } | null {
  const dot = state.lastIndexOf(".");
  if (dot < 8) return null;
  const payload = state.slice(0, dot);
  const expected = createHmac("sha256", signingSecret()).update(payload).digest("base64url");
  const actual = Buffer.from(state.slice(dot + 1));
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { reportId?: string; exp?: number };
    if (!parsed.reportId || typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    return { reportId: parsed.reportId };
  } catch {
    return null;
  }
}
