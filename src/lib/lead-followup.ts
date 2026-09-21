import { z } from "zod";
export const leadFollowupSchema = z.object({
  requestId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(180),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(40)
    .refine((value) => value.replace(/\D/g, "").length >= 7),
  website: z.string().trim().max(300).optional().default(""),
  goals: z.string().trim().min(10).max(3000),
  companyWebsite: z.string().max(0).optional().default(""),
});
export type LeadFollowup = z.infer<typeof leadFollowupSchema>;
export function leadFollowupText(input: LeadFollowup) {
  return [
    "Lead-generation follow-up request from the Demore website viewing-only preview.",
    `Name: ${input.name}`,
    `Company: ${input.company}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Website: ${input.website || "Not provided"}`,
    "",
    "Goals and follow-up details:",
    input.goals,
    "",
    `Request ID: ${input.requestId}`,
    "Source: https://www.demoretechnologysolutions.com/lead-generation#preview",
    "This is a follow-up inquiry only. No campaign or campaign draft was created.",
  ].join("\n");
}
