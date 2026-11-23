import { createFileRoute } from "@tanstack/react-router";
import { FaqList } from "@/components/faq-list";
import { IntakeForm } from "@/components/intake-form";
import { JsonLd } from "@/components/json-ld";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { intakeStartAnswer } from "@/lib/answers";
import { contactFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

type ContactSearch = {
  need?: string;
  industry?: string;
  reportId?: string;
  handoffToken?: string;
  source?: string;
  rid?: string;
};

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => {
    // Confirm these bounded, URL-safe formats against the ds backend issuer.
    const isValidToken = (token: string): boolean =>
      token.length >= 16 &&
      token.length <= 512 &&
      !/[^A-Za-z0-9_.-]/.test(token);

    const isValidReportId = (id: string): boolean =>
      id.length >= 1 &&
      id.length <= 128 &&
      !/[^A-Za-z0-9_-]/.test(id);

    const rid =
      typeof search.rid === "string" && isValidReportId(search.rid)
        ? search.rid
        : undefined;

    const reportId =
      typeof search.reportId === "string" && isValidReportId(search.reportId)
        ? search.reportId
        : rid;

    // Drop malformed credentials silently; never log or echo their values.
    return {
      need: typeof search.need === "string" ? search.need : undefined,
      industry: typeof search.industry === "string" ? search.industry : undefined,
      reportId,
      handoffToken:
        typeof search.handoffToken === "string" &&
        isValidToken(search.handoffToken)
          ? search.handoffToken
          : undefined,
      source: typeof search.source === "string" ? search.source : undefined,
      rid,
    };
  },
  head: () =>
    pageHead({
      title: "Start a Digital Project | Demore Technology Solutions",
      description:
        "Start a project for a website, ecommerce, custom AI-assisted digital marketing and lead generation, SEO, GEO, AEO, CRO, analytics, content, or business automation.",
      path: "/contact",
    }),
  component: ContactPage,
});

// Keep the $400 minimum visible in the UI, but omit its FAQ from schema.
const schemaFaqs = contactFaqs.filter(
  (item) => item.q !== "What goes in the project brief?",
);

// Merge remains gated on full changed-file diffs, route-tree external-link audit,
// footer noopener noreferrer, exact llms.txt phone line and trailing newline,
// pricing-free FAQ/service schema, a green ds preview, and manual smoke tests.

function ContactPage() {
  const { need, industry, reportId, handoffToken } = Route.useSearch();

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(schemaFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "Digital project intake",
          description:
            "Project brief for websites, ecommerce, custom AI-assisted marketing and lead generation, growth, analytics, content, and automation.",
          path: "/contact",
          serviceType: "ProfessionalService",
        })}
      />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Start a project</p>
        <h1 className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">
          Start your custom AI-assisted growth platform—or choose à la carte.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Select all applicable industries first, choose the complete platform or
          individual services, set your project budget, then tell us about your
          goals, current stack, growth priorities, and automation needs. Minimum
          project budget: $400.
        </p>
        <p className="mt-4 text-sm text-muted">
          <a
            href="https://www.google.com/maps?cid=11038014414842148303"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-line underline-offset-4 hover:text-volt"
          >
            Find us on Google
          </a>
        </p>
      </header>

      <GeoQuote>
        The brief captures the industry, offer, audience, budget, current digital
        stack, conversion goals, and workflows so the project can be scoped around
        a real business outcome instead of a generic package.
      </GeoQuote>

      <DirectAnswer question="What goes in the project brief?">
        <p>{intakeStartAnswer}</p>
      </DirectAnswer>

      <div className="mt-10">
        {/* Client validation is not authorization. The ds backend must enforce
            ownership and atomic single-use consumption of intake credentials;
            neither credentials nor report IDs may enter logs or error messages. */}
        <IntakeForm
          need={need}
          industry={industry}
          reportId={reportId}
          handoffToken={handoffToken}
        />
      </div>

      <Section kicker="Also on this site" title="Which service is this brief for?">
        <RelatedOffers current="/contact" />
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={contactFaqs} />
      </Section>
    </main>
  );
}