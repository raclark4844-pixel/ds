import { Building2 } from "lucide-react";
import { industries } from "@/lib/industries";

export function IndustryLinks() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {industries.map((industry) => (
        <a
          key={industry.slug}
          href={`/industries/${industry.slug}`}
          className="group flex min-h-24 items-start gap-3 rounded-xl border border-line bg-surface p-5 no-underline transition-colors hover:border-fg/30"
        >
          <Building2 className="mt-0.5 size-5 shrink-0 text-volt" aria-hidden="true" />
          <span>
            <span className="block font-display text-lg font-semibold tracking-tight text-fg">{industry.label}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">See the industry-specific SEO, GEO, AEO, CRO, performance, lead-generation, and automation strategy.</span>
          </span>
        </a>
      ))}
    </div>
  );
}
