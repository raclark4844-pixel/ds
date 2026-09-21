import { industries } from "./industries";

export const industryChoices = [...industries.map((item) => item.label), "Other"];
export function selectedIndustries(value: unknown): string[] {
  const items = Array.isArray(value) ? value : typeof value === "string" ? value.split(" | ") : [];
  return [
    ...new Set(
      items
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => industryChoices.includes(item)),
    ),
  ];
}
export function industryContext(value: unknown) {
  const selected = selectedIndustries(value);
  return selected.length
    ? `Visitor-selected industries: ${selected.join("; ")}. Tailor relevant advice to all selected industries. These are visitor-provided preferences, not verified website findings.`
    : "";
}
