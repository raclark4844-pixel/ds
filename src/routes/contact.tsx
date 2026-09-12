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
      title: "Start a Project | Demore Technology Solutions",
      description:
        "Tell us what to build. Website, store, bot, content, growth, or insurance claim supplements. A project brief, not a contract.",
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
          name: "Project intake",
          description: "Multi-step project brief for Demore Technology Solutions.",
          path: "/contact",
          serviceType: "ProfessionalService",
        })}
      />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Start a project</p>
        <h1 className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">
          Tell us what to build.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Digital systems and insurance claim supplements. Five steps. A
          project brief, not a contract.
        </p>
      </header>

      <GeoQuote>
        The brief is the working document, not a contract. Claim support does
        not guarantee a carrier will increase payment. Growth work does not
        guarantee rankings, citations, or conversion lifts.
      </GeoQuote>

      <DirectAnswer question="What goes in the project brief?">
        <p>{intakeStartAnswer}</p>
      </DirectAnswer>

      <div className="mt-10">
        <IntakeForm need={need} />
      </div>

      <Section kicker="Also on this site" title="Which page is this brief for?">
        <RelatedOffers current="/contact" />
      </Section>

      <Section kicker="Questions" title="Is this a contract?">
        <FaqList items={contactFaqs} />
      </Section>
    </main>
  );
}
