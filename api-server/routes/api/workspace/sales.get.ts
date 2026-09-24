import { salesEndpoint } from "../../../../src/lib/client-sales.server";
export default function handler(event: { req: Request }) {
  return salesEndpoint(event.req, false);
}
