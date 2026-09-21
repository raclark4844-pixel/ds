import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { addLead, LeadError } from "./control-leads.ts";
import type { Sql } from "./db";

// Dedicated machine credential, never accepted as an administrator session.
export function requireExteriorBridge(req: Request, secret: string | undefined) {
  secret = secret?.trim();
  if (!secret || !/^[a-f0-9]{64}$/.test(secret))
    throw new LeadError(503, "Exterior inbox connection is not configured.");
  const supplied = req.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  if (Buffer.byteLength(supplied) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)))
    throw new LeadError(401, "Unauthorized.");
  if (req.headers.get("content-type")?.split(";")[0].trim() !== "application/json")
    throw new LeadError(415, "JSON required.");
}

const exteriorSchema = z.object({
  sourceRecordId: z.string().regex(/^[a-zA-Z0-9_-]{8,100}$/),
  name: z.string().trim().min(2).max(120),
  email: z.string().max(254).default(""),
  phone: z.string().max(40).default(""),
  interest: z.string().max(2000).default(""),
}).strict();

export async function captureExteriorLead(sql: Pick<Sql, "query">, body: unknown) {
  const input = exteriorSchema.parse(body);
  const result = await addLead(sql, {
    ...input, siteId: "demore", source: "base44-contact",
  }, "base44-exterior-bridge");
  // Return only a receipt, never other leads or duplicate-contact matches.
  return { id: result.id, duplicate: result.duplicate };
}
