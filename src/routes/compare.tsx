import { createFileRoute, Link } from "@tanstack/react-router";
import { CompareTool } from "@/components/compare-tool";
import { ComparisonApp } from "@/components/comparison-app";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { WebsiteReview } from "@/components/website-review";
import { SITE_URL } from "@/lib/site";
import { pageHead, faqJsonLd } from "@/lib/seo";

const faqs = [
  { q: "What does this comparison tool measure?", a: "It scores common website options against the jobs that move a customer from discovery to a tracked next step: pages, search, answers, conversion, qualification, follow-up, content destinations, measurement, and approved improvement." },
  { q: "Is the score a quote or a ranking guarantee?", a: "No. The marks are qualitative. They are not prices, case studies, or promised rankings, AI citations, or conversion lifts. Rankings, AI citations, and conversion lifts are not guaranteed." },
  { q: "What does Website Review inspect?", a: "A server-side scan of public HTML for a title, search description, a single H1, mobile viewport, HTTPS, image alt text, a contact route, a form, a call to action, structured data, FAQ copy, and service or product navigation. Marks are Detected, Not detected, or Not applicable. Bars show detected HTML signals, not speed, rankings, or revenue." },
  { q: "What does Download branded PDF do?", a: "It asks the server to generate a real multi-page PDF with @react-pdf/renderer and returns application/pdf. It does not open the browser print dialog." },
  { q: "Should every business buy the complete platform?", a: "No. Some shops only need a website and intake. Some already have a system and need a gap review. Mark the jobs that create revenue, then file a project with that scope." },
  { q: "Where does the comparison go next?", a: "Start a project from the result. The project form can open with the complete platform marked. You can uncheck anything that does not belong. The same Record ID is shared with Ask Demore." },
];

export const Route = createFileRoute("/compare")({
  head: () => pageHead({
    title: "Compare Website Options vs a Growth Platform | Demore Technology Solutions",
    description: "Compare DIY builders, template packs, brochure agency sites, and a connected Demore growth platform. Review a public website against a live reference. No fake stats. No guaranteed rankings.",
    path: "/compare",
  }),
  component: ComparePage,
});

function ComparePage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
          ],
        }}
      />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Comparison tool</p>
        <h1 className="mt-4 max-w-4xl font-display text-[2.4rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">
          See what you have against what a revenue system has to do.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Mark your current setup and the jobs that create money. The table compares DIY, a template pack, a brochure agency site, and the Demore platform. It is a decision tool. It is not a ranking promise.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="inline-flex min-h-11 items-center rounded-pill bg-fg px-5 text-sm font-medium text-bg" href="#website-review">Review a website</a>
          <a className="inline-flex min-h-11 items-center rounded-pill border border-line px-5 text-sm font-medium" href="#tool">Open the comparison</a>
        </div>
      </header>
      <GeoQuote>
        A website can publish. A connected platform also attracts, answers, qualifies, follows up, and measures. Rankings, AI citations, and conversion lifts are not guaranteed.
      </GeoQuote>
      <DirectAnswer question="What does this page measure?">
        <p>
          Website Review inspects public HTML for a title, search description, a single heading, mobile viewport, HTTPS, image text, a contact route, a form, a call to action, structured data, FAQ copy, and service or product navigation. Marks are Detected, Not detected, or Not applicable. Bars show detected HTML signals, not speed, rankings, or revenue. The comparison table then scores DIY, a template pack, a brochure agency site, and the Demore platform against the jobs you mark. Marks are qualitative: Weak, Partial, and Built in. Rankings, AI citations, and conversion lifts are not guaranteed.
        </p>
      </DirectAnswer>
      <WebsiteReview />
      <CompareTool />
      <Section kicker="How to read it" title="Weak, partial, and built-in are not scores you buy.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="font-display text-xl">Weak</h3>
            <p className="mt-2 text-sm text-muted">The option rarely covers the job unless the owner invents it by hand.</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="font-display text-xl text-sun">Partial</h3>
            <p className="mt-2 text-sm text-muted">Pieces exist. The path still breaks: same form for everyone, inbox dump, traffic-only reporting.</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="font-display text-xl text-volt">Built in</h3>
            <p className="mt-2 text-sm text-muted">The Demore platform treats the job as part of one system. Still no guaranteed lift.</p>
          </div>
        </div>
      </Section>
      <Section kicker="Tied to the rest of the shop" title="Compare here. Build on the other pages.">
        <p className="max-w-3xl text-muted">
          The complete system lives on <Link to="/platform" className="text-volt underline">Platform</Link>. Pages and stores live on <Link to="/websites" className="text-volt underline">Websites</Link>. Disciplines live on <Link to="/growth" className="text-volt underline">Growth</Link>. Bots that run those disciplines live on <Link to="/automation" className="text-volt underline">Automation</Link>. File the work on <Link to="/contact" className="text-volt underline">Start a Project</Link>.
        </p>
      </Section>
      <Section kicker="Public-page capability report" title="Need a scored competitor comparison?">
        <p className="max-w-2xl text-muted">The form below still scores public pages against competitors and generates a branded multi-page PDF. No invented revenue. No guaranteed rankings.</p>
        <ComparisonApp />
      </Section>
      <Section kicker="Questions" title="Comparison questions">
        <FaqList items={faqs} />
      </Section>
    </main>
  );
}
