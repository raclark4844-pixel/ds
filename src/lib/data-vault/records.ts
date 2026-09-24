import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Sql } from "../db";
export class VaultError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const text = z.string().trim().min(1).max(300);
export const recordSchema = z.strictObject({
  providerId: text.optional(),
  address: text,
  unit: text.optional(),
  city: text,
  state: z
    .string()
    .regex(/^[A-Za-z]{2}$/)
    .transform((s) => s.toUpperCase()),
  postalCode: z.string().regex(/^\d{5}(?:-\d{4})?$/),
  ownerName: text.optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().min(7).max(40).optional(),
  propertyType: text.optional(),
  yearBuilt: z.number().int().min(1000).max(2200).optional(),
  estimatedValue: z.number().finite().nonnegative().optional(),
  ownerOccupied: z.boolean().optional(),
  doNotCall: z.boolean().optional(),
  contacts: z
    .array(
      z.strictObject({
        type: z.enum(["MOBILE", "LANDLINE", "EMAIL", "OTHER"]),
        value: z.string().min(1).max(254),
        dnc: z.boolean(),
        restricted: z.boolean(),
      }),
    )
    .min(1)
    .max(40)
    .optional(),
});
export const importSchema = z.strictObject({
  version: z.literal(1),
  requestId: z.string().min(8).max(160),
  campaignId: z.string().min(1).max(160),
  observedAt: z.iso.datetime({ offset: true }),
  records: z.array(recordSchema).min(1).max(100),
});
export type VaultRecord = z.infer<typeof recordSchema>;
// Preserve punctuation/unit identity. Conservative exact matches avoid false merges.
const normalized = (s: string) => s.normalize("NFKC").trim().toUpperCase().replace(/\s+/g, " ");
export function identityKeys(row: VaultRecord) {
  const address = [
    row.address,
    row.unit || "",
    row.city,
    row.state,
    row.postalCode.slice(0, 5),
  ].map(normalized);
  return [
    ...(row.providerId ? [`batchdata:${row.providerId}`] : []),
    `address:${createHash("sha256").update(JSON.stringify(address)).digest("hex")}`,
  ];
}
export async function importRecords(sql: Pick<Sql, "query">, org: string, input: unknown) {
  const value = importSchema.parse(input);
  if (!org) throw new VaultError("Workspace required.", 403);
  if (Date.parse(value.observedAt) > Date.now() + 300000)
    throw new VaultError("Observation time is in the future.");
  // Reordering fields cannot change the receipt digest after schema normalization.
  const digest = createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const rows = value.records.map((data) => ({ id: randomUUID(), keys: identityKeys(data), data }));
  try {
    const result = await sql.query<{ inserted: boolean }>(
      "select dts_import_batchdata($1,$2,$3,$4,$5,$6::jsonb) as inserted",
      [org, value.requestId, digest, value.campaignId, value.observedAt, JSON.stringify(rows)],
    );
    return { accepted: true, requestId: value.requestId, duplicate: !result[0].inserted };
  } catch (error) {
    if (/^(IDENTITY_CONFLICT|OBSERVATION_CONFLICT|IMPORT_CONFLICT)$/.test((error as Error).message))
      throw new VaultError("Import conflicts with saved data. Review before retrying.", 409);
    throw new VaultError(
      "Result storage is unavailable. Retry the saved batch; do not purchase it again.",
      503,
    );
  }
}
export function csvCell(value: unknown) {
  let text =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  // Quoting alone does not stop spreadsheet formula execution.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}
export const columns = [
  "providerId",
  "address",
  "unit",
  "city",
  "state",
  "postalCode",
  "ownerName",
  "email",
  "phone",
  "propertyType",
  "yearBuilt",
  "estimatedValue",
  "ownerOccupied",
  "doNotCall",
  "contacts",
] as const;
export function recordsCsv(rows: { data: Record<string, unknown> }[]) {
  return (
    "\uFEFF" +
    [
      columns.map(csvCell).join(","),
      ...rows.map((row) => columns.map((key) => csvCell(row.data[key])).join(",")),
    ].join("\r\n") +
    "\r\n"
  );
}
