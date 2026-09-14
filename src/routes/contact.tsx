import { createFileRoute } from "@tanstack/react-router";
import { FaqList } from "@/components/faq-list";
import { IntakeForm } from "@/components/intake-form";
import { JsonLd } from "@/components/json-ld";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { intakeStartAnswer } from "@/lib/answers";
import { contactFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

type ContactSearch = { need?: string };

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    need: typeof search.need === "string" ? search.need : undefined,
  }),
  head: () =>
    pageHead({
      title: "Start a Digital Project | Demore Technology Solutions",
      description:
        "Start a project for a website, ecommerce, AI-assisted marketing, lead generation, SEO, GEO, AEO, CRO, analytics, content, or business automation.",
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { need } = Route.useSearch();

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(contactFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "Digital project intake",
          description: "Project brief for websites, ecommerce, AI-assisted marketing, growth, lead generation, analytics, content, and automation.",
          path: "/contact",
          serviceType: "ProfessionalService",
        })}
      />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Start a project</p>
        <h1 className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">
          Tell us what the system needs to do.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Websites, ecommerce, AI-assisted digital marketing, lead generation,
          SEO, GEO, AEO, CRO, analytics, content, and automation. Five steps.
          A project brief, not a contract.
        </p>
      </header>

      <GeoQuote>
        The brief captures the business, offer, audience, current digital stack,
        conversion goals, and workflows so the project can be scoped around a
        real business outcome instead of a generic package.
      </GeoQuote>

      <DirectAnswer question="What goes in the project brief?">
        <p>{intakeStartAnswer}</p>
      </DirectAnswer>

      <div className="mt-10">
        <IntakeForm need={need} />
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
