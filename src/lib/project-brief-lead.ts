import { randomUUID } from "node:crypto";
import { addLead, LeadError } from "./control-leads.ts";
import type { Sql } from "./db";
export type BriefLeadInput = {
  submissionId?: string;
  name: string;
  email: string;
  phone?: string;
  businessName?: string;
  industry: string;
  wants: string[];
  goal?: string;
  reportId?: string;
};
export function projectBriefLead(input: BriefLeadInput) {
  const reference = input.submissionId?.trim() || randomUUID();
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(reference))
    throw new LeadError(400, "Invalid submission reference. Refresh the page and try again.");
  return {
    siteId: "demore-technology",
    source: "website-brief",
    sourceRecordId: reference,
    name: input.name,
    email: input.email,
    phone: (input.phone || "").trim().slice(0, 40),
    interest: [
      input.businessName ? "Business: " + input.businessName : "",
      "Industry: " + input.industry,
      "Needs: " + input.wants.join(", "),
      input.goal ? "Goal: " + input.goal : "",
      input.reportId ? "Report: " + input.reportId : "",
    ]
      .filter(Boolean)
      .join("\n")
      .slice(0, 2000),
  };
}
export async function captureProjectBrief(sql: Pick<Sql, "query">, input: BriefLeadInput) {
  return addLead(sql, projectBriefLead(input), "website-project-brief");
}
