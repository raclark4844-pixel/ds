import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { VaultError } from "./records";
const integration = z.strictObject({ orgId: z.string().min(1), secret: z.string().min(32) });
export function authenticateBatch(
  req: Request,
  body: string,
  env: NodeJS.ProcessEnv = process.env,
  now = Date.now(),
) {
  if (env.BATCHDATA_VAULT_IMPORT_ENABLED !== "true")
    throw new VaultError("Data import is disabled.", 503);
  let entries: Record<string, z.infer<typeof integration>>;
  try {
    entries = z
      .record(z.string(), integration)
      .parse(JSON.parse(env.BATCHDATA_VAULT_INTEGRATIONS_JSON || "{}"));
  } catch {
    throw new VaultError("Data integration is not configured.", 503);
  }
  if (new Set(Object.values(entries).map((e) => e.secret)).size !== Object.values(entries).length)
    throw new VaultError("Integrations require distinct signing credentials.", 503);
  const id = req.headers.get("x-dts-integration") || "";
  const config = Object.hasOwn(entries, id) ? entries[id] : null;
  const ts = req.headers.get("x-dts-timestamp") || "",
    signature = req.headers.get("x-dts-signature") || "";
  if (
    !config ||
    !/^\d{10}$/.test(ts) ||
    Math.abs(now - Number(ts) * 1000) > 300000 ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    throw new VaultError("Import authentication failed.", 401);
  const expected = createHmac("sha256", config.secret).update(`${ts}.${body}`).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex")))
    throw new VaultError("Import authentication failed.", 401);
  return config.orgId;
}
export async function readBatchBody(req: Request) {
  if (req.headers.get("content-type")?.split(";")[0] !== "application/json")
    throw new VaultError("JSON required.", 415);
  const reader = req.body?.getReader();
  if (!reader) throw new VaultError("Body required.");
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > 256000) {
      await reader.cancel();
      throw new VaultError("Batch too large.", 413);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
