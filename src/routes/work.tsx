import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { IndustryLinks } from "@/components/industry-links";
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
      title: "Digital Work and Case Studies | Demore Technology Solutions",
      description:
        "Case-study framework for websites, ecommerce, AI-assisted marketing, lead generation, search optimization, analytics, content systems, and automation.",
      path: "/work",
    }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(workFaqs)} />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Work</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Real work will live here. Not invented results.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">Case studies need real projects and permission to publish them. Until then, Demore Technology Solutions will not fill the page with fake revenue, fake testimonials, fabricated traffic, made-up leads, or borrowed logos.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link to="/contact">Start a project brief</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/growth">See the growth stack</Link></Button>
        </div>
      </header>
      <GeoQuote>Case studies should show the starting problem, what was built, how it was measured, and the actual result without pretending another business is guaranteed the same outcome.</GeoQuote>
      <DirectAnswer question="Where are the case studies?"><p>{workAnswer}</p></DirectAnswer>
      <Section kicker="Industries" title="Explore the work strategy by industry."><IndustryLinks /></Section>
      <Section kicker="In this category" title="Other supporting pages."><LaterPages current="/work" /></Section>
      <Section kicker="All pages" title="Jump to an offer."><RelatedOffers current="/work" /></Section>
      <Section kicker="Questions" title="Direct answers."><FaqList items={workFaqs} /></Section>
      <div className="mt-16">
        <CtaBand kicker="Work" title="Start with a real project." body="Submit your industry, goals, what you need built, and a project budget of at least $600. Results will be documented when there is real, permissioned work to publish." secondary={{ to: "/growth", label: "See the growth stack", variant: "outline" }} />
      </div>
    </main>
  );
}
