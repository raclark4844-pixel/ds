import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { LaterPages, RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { processAnswer } from "@/lib/answers";
import { assertPublished } from "@/lib/publish";
import { engagementSteps, processFaqs } from "@/lib/site";
import { faqJsonLd, pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/process")({
  beforeLoad: () => assertPublished("process"),
  head: () =>
    pageHead({
      title: "How a Demore Technology Solutions Project Starts | Demore Technology Solutions",
      description:
        "Brief, pressure-test, build or document, launch or submit. Start a project brief. Not a contract. No guaranteed rankings or payouts. File the brief.",
      path: "/process",
    }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(processFaqs)} />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Later</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
          Brief first. The rest is a sequence.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          A longer process page — scopes, timelines, what you send, what we send
          back — will expand this later. The working sequence is already public.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/contact">Start a project brief</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/growth">See the growth stack</Link>
          </Button>
        </div>
      </header>

      <GeoQuote>
        A Demore Technology Solutions engagement starts with a project brief, then a
        pressure-test of the offer, then build, then launch. Submitting the
        intake does not hire anyone.
      </GeoQuote>

      <DirectAnswer question="How does a Demore Technology Solutions project start?">
        <p>{processAnswer}</p>
      </DirectAnswer>

      <Section kicker="Sequence" title="What happens after the brief?">
        <ol className="grid gap-4">
          {engagementSteps.map((item) => (
            <li key={item.n} className="rounded-xl border border-line bg-surface p-6">
              <p className="font-display text-sm text-volt">{item.n}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section kicker="In this category" title="Other later pages.">
        <LaterPages current="/process" />
      </Section>

      <Section kicker="All pages" title="Jump to an offer.">
        <RelatedOffers current="/process" />
      </Section>

      <Section kicker="Questions" title="Is the brief a contract?">
        <FaqList items={processFaqs} />
      </Section>

      <div className="mt-16">
        <CtaBand
          kicker="Process"
          title="The brief is step one."
          body="Who you are, what you want built, brand, growth. Copy the summary after submit."
          secondary={{ to: "/growth", label: "See the growth stack", variant: "outline" }}
        />
      </div>
    </main>
  );
}
