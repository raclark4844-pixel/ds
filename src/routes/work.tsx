import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { LaterPages, RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { workAnswer } from "@/lib/answers";
import { assertPublished } from "@/lib/publish";
import { workFaqs } from "@/lib/site";
import { faqJsonLd, pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/work")({
  beforeLoad: () => assertPublished("work"),
  head: () =>
    pageHead({
      title: "Work and Case Studies Coming Later | Demore Technology Solutions",
      description:
        "Case studies will live here once clients sign off. Start a project brief. No invented results, fake quotes, or borrowed logos. File the brief.",
      path: "/work",
    }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(workFaqs)} />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Later</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
          Work will live here. Not invented results.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Case studies need a client who will let us publish them. Until that
          page is real, we will not fill it with fake revenue, fake quotes, or
          borrowed logos.
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
        Demore Technology Solutions will not invent testimonials, dollar amounts, or partner
        logos. Proof on this site is process: what happens after you submit a
        brief. Offers stay on their own pages.
      </GeoQuote>

      <DirectAnswer question="Where are the case studies?">
        <p>{workAnswer}</p>
      </DirectAnswer>

      <Section kicker="In this category" title="Other later pages.">
        <LaterPages current="/work" />
      </Section>

      <Section kicker="All pages" title="Jump to an offer.">
        <RelatedOffers current="/work" />
      </Section>

      <Section kicker="Questions" title="Will you invent results to fill this page?">
        <FaqList items={workFaqs} />
      </Section>

      <div className="mt-16">
        <CtaBand
          kicker="Work"
          title="File the brief if you want to be on this page later."
          body="No invented results in the meantime. Roofing, siding, remodel, and other jobs get named when the client says yes."
          secondary={{ to: "/growth", label: "See the growth stack", variant: "outline" }}
        />
      </div>
    </main>
  );
}
