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
      title: "Digital Project Process | Demore Technology Solutions",
      description:
        "Project brief, discovery, scope, build, quality review, launch, measurement, and iteration for websites, growth, lead generation, content, analytics, and automation.",
      path: "/process",
    }),
  component: ProcessPage,
});

function ProcessPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(processFaqs)} />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Process</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Business outcome first. Build second.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">The process starts with the business, customer, offer, current stack, and desired result. Pages, content, analytics, and automation are then scoped around that outcome.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/contact">Start a project brief</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/growth">See the growth stack</Link></Button>
        </div>
      </header>
      <GeoQuote>Demore Technology Solutions starts with a project brief, pressure-tests the offer and conversion path, builds the right system, then launches with measurement and room to improve.</GeoQuote>
      <DirectAnswer question="How does a Demore Technology Solutions project start?"><p>{processAnswer}</p></DirectAnswer>
      <Section kicker="Sequence" title="What happens after the brief?">
        <ol className="grid gap-4">
          {engagementSteps.map((item) => <li key={item.n} className="rounded-xl border border-line bg-surface p-6"><p className="font-display text-sm text-volt">{item.n}</p><h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p></li>)}
        </ol>
      </Section>
      <Section kicker="In this category" title="Other supporting pages."><LaterPages current="/process" /></Section>
      <Section kicker="All pages" title="Jump to an offer."><RelatedOffers current="/process" /></Section>
      <Section kicker="Questions" title="Direct answers."><FaqList items={processFaqs} /></Section>
      <div className="mt-16">
        <CtaBand kicker="Process" title="The brief is step one." body="Tell us the offer, audience, current stack, conversion goal, content needs, and repetitive work that should be automated." secondary={{ to: "/growth", label: "See the growth stack", variant: "outline" }} />
      </div>
    </main>
  );
}
