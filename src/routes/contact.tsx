import { createFileRoute } from "@tanstack/react-router";
import { FaqList } from "@/components/faq-list";
import { IntakeForm } from "@/components/intake-form";
import { JsonLd } from "@/components/json-ld";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { intakeStartAnswer } from "@/lib/answers";
import { contactFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

type ContactSearch = { need?: string; industry?: string; reportId?: string; handoffToken?: string; source?: string; rid?: string };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    need: typeof search.need === "string" ? search.need : undefined,
    industry: typeof search.industry === "string" ? search.industry : undefined,
    reportId: typeof search.reportId === "string" ? search.reportId : typeof search.rid === "string" ? search.rid : undefined,
    handoffToken: typeof search.handoffToken === "string" ? search.handoffToken : undefined,
    source: typeof search.source === "string" ? search.source : undefined,
    rid: typeof search.rid === "string" ? search.rid : undefined,
  }),
  head: () =>
    pageHead({
      title: "Start a Digital Project | Demore Technology Solutions",
      description:
        "Start a project for a website, ecommerce, custom AI-assisted digital marketing and lead generation, SEO, GEO, AEO, CRO, analytics, content, or business automation.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { need, industry, reportId, handoffToken, rid } = Route.useSearch();

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(contactFaqs)} />
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
          Select your industry first, choose the complete platform or individual services, set your
          project budget, then tell us about your goals, current stack, growth priorities, and
          automation needs. Minimum project budget: $600.
        </p>
      </header>

      <GeoQuote>
        The brief captures the industry, offer, audience, budget, current digital stack, conversion
        goals, and workflows so the project can be scoped around a real business outcome instead of
        a generic package.
      </GeoQuote>

      <DirectAnswer question="What goes in the project brief?">
        <p>{intakeStartAnswer}</p>
      </DirectAnswer>

      <div className="mt-10">
        <IntakeForm need={need} industry={industry} reportId={reportId || rid} handoffToken={handoffToken} />
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
