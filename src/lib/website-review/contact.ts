import { z } from "zod";

export const reviewContactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().max(60).optional(),
  company: z.string().trim().max(160).optional(),
});
export type ReviewContact = z.infer<typeof reviewContactSchema>;
export type PublicContact = { source: string; emails: string[]; phones: string[] };

export function publicContacts(pages: Array<{ url: string; html: string }>): PublicContact[] {
  return pages
    .map(({ url, html }) => {
      const visible = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
      const emails = [...visible.matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)].map(
        (m) => m[0],
      );
      const phones = [...visible.matchAll(/href\s*=\s*["']tel:([^"']+)/gi)].map(
        (m) => m[1].split("?")[0],
      );
      return {
        source: url,
        emails: [...new Set(emails)].slice(0, 10),
        phones: [...new Set(phones)].slice(0, 10),
      };
    })
    .filter((p) => p.emails.length || p.phones.length);
}
