import { vaultEndpoint } from "../../../../src/lib/data-vault/endpoint.server";
export default function handler(event: { req: Request }) {
  return vaultEndpoint(event.req);
}
