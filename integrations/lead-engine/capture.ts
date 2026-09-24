import { createHash } from "node:crypto";
import { recordSchema } from "../../src/lib/data-vault/records";
import { saveVaultBatch } from "./vault-outbox";
type Tx = Parameters<typeof saveVaultBatch>[0];
type Property = {
  externalRef?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  propertyType?: string;
  yearBuilt?: number;
  estimatedValue?: number;
  ownerOccupied?: boolean;
};
const present = (text: string | undefined) => text?.trim() || undefined;
function propertyRecord(p: Property) {
  return recordSchema.parse({
    providerId: present(p.externalRef),
    address: p.address1,
    unit: present(p.address2),
    city: p.city,
    state: p.state,
    postalCode: p.postalCode,
    propertyType: present(p.propertyType),
    yearBuilt: p.yearBuilt,
    estimatedValue: p.estimatedValue,
    ownerOccupied: p.ownerOccupied,
  });
}
function receipt(jobId: string, part: string) {
  return createHash("sha256")
    .update(JSON.stringify([jobId, part]))
    .digest("hex");
}
export async function capturePropertyPage(
  tx: Tx,
  context: {
    customerId: string;
    campaignId: string;
    jobId: string;
    pageKey: string;
    observedAt: string;
  },
  properties: Property[],
) {
  if (!properties.length) return;
  return saveVaultBatch(tx, context.customerId, {
    version: 1,
    requestId: receipt(context.jobId, context.pageKey),
    campaignId: context.campaignId,
    observedAt: context.observedAt,
    records: properties.map(propertyRecord),
  });
}
export async function captureContactLookup(
  tx: Tx,
  context: { customerId: string; campaignId: string; jobId: string; observedAt: string },
  property: Property,
  result: {
    matched: boolean;
    contacts: {
      type: "MOBILE" | "LANDLINE" | "EMAIL" | "OTHER";
      value: string;
      dnc: boolean;
      restricted: boolean;
    }[];
  },
) {
  if (!result.matched || !result.contacts.length) return;
  const data = recordSchema.parse({
    ...propertyRecord(property),
    contacts: result.contacts,
    doNotCall: result.contacts.some((c) => c.dnc || c.restricted),
  });
  return saveVaultBatch(tx, context.customerId, {
    version: 1,
    requestId: receipt(context.jobId, "contact-lookup"),
    campaignId: context.campaignId,
    observedAt: context.observedAt,
    records: [data],
  });
}
