import {
  authenticateCallback,
  persistCallback,
  boundedCallbackBody,
  CallbackError,
} from "../../../../src/lib/base44/callback";
import { ZodError } from "zod";
export default async function handler(event: { req: Request }) {
  if (process.env.BASE44_CALLBACK_ENABLED !== "true")
    return Response.json({ error: "Workflow callbacks are disabled." }, { status: 503 });
  try {
    const verified = authenticateCallback(
      event.req.headers,
      await boundedCallbackBody(event.req),
      process.env.BASE44_INTEGRATION_SECRETS_JSON,
    );
    const { getSql } = await import("../../../../src/lib/db");
    return Response.json(await persistCallback(await getSql(), verified), {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof CallbackError ? error.message : "Workflow callback rejected." },
      {
        status:
          error instanceof CallbackError
            ? error.status
            : error instanceof ZodError || error instanceof SyntaxError
              ? 400
              : 503,
      },
    );
  }
}
