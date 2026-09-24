import { authenticateBatch, readBatchBody } from "../../../../src/lib/data-vault/bridge";
import { importRecords, VaultError } from "../../../../src/lib/data-vault/records";
import { z } from "zod";
export default async function handler(event: { req: Request }) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const raw = await readBatchBody(event.req),
      org = authenticateBatch(event.req, raw);
    const { getSql } = await import("../../../../src/lib/db");
    return Response.json(await importRecords(await getSql(), org, JSON.parse(raw)), {
      status: 202,
      headers,
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof VaultError ? e.message : "Result import rejected." },
      {
        status:
          e instanceof VaultError
            ? e.status
            : e instanceof z.ZodError || e instanceof SyntaxError
              ? 400
              : 503,
        headers,
      },
    );
  }
}
