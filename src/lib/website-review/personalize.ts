import { z } from "zod";
import type { WebsiteReviewReport } from "./types";

export const prioritiesSchema = z.object({ priorities: z.array(z.object({
  id: z.string().max(100),
  reason: z.string().trim().min(1).max(600),
  action: z.string().trim().min(1).max(900),
})).max(6) });

export function applyPriorities(report: WebsiteReviewReport, value: unknown): WebsiteReviewReport {
  const {priorities} = prioritiesSchema.parse(value);
  const options = [...report.current.checks, ...report.industry.capabilities];
  const seen = new Set<string>();
  const tailoredPriorities = priorities.map(item => {
    const option = options.find(option => option.id === item.id);
    if (!option || seen.has(item.id)) throw new Error("Invalid recommendation selection");
    seen.add(item.id);
    return {...item, label: option.label};
  });
  // Never carry raw conversation into a signed, downloadable report.
  const {conversation: _discard, ...clean} = report as WebsiteReviewReport & {conversation?: unknown};
  return {...clean, tailoredPriorities};
}
