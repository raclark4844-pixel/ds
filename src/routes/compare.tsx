import { createFileRoute } from "@tanstack/react-router";
import { ComparisonApp } from "@/components/comparison-app";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { WebsiteAudit } from "@/components/website-audit";
import { pageHead, faqJsonLd } from "@/lib/seo";

const faqs = [
  { q: "Is the comparison report a quote or a ranking guarantee?", a: "No. Scores are public-page capability marks. Rankings, AI citations, traffic, leads, and conversion lifts are not guaranteed." },
  { q: "What does Download My Comparison Report do?", a: "It asks the server to generate a multi-page PDF with @react-pdf/renderer and returns application/pdf. It does not open the browser print dialog." },
  { q: "Will I lose the comparison if the PDF or email fails?", a: "No. The scored report is stored first. PDF generation and each email can be retried separately." },
  { q: "What does the website review actually inspect?", a: "A public HTML scan of the URL you enter: titles, descriptions, headings, viewport, HTTPS, alt text, contact routes, forms, calls to action, schema, FAQ copy, and service navigation. It is not a speed test, ranking check, or accessibility certification." },
];

export const Route = createFileRoute("/compare")({
  head: () => pageHead({
    title: "Free Website Comparison Report | Demore Technology Solutions",
    description: "Compare your website with competitors and a connected Demore growth platform. Review a public URL side-by-side. Download a branded PDF. Results are not guaranteed.",
    path: "/compare",
  }),
  component: ComparePage,
});

function ComparePage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(faqs)} />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Free comparison</p>
        <h1 className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">Compare the current site with competitors and a connected platform.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">Paste a public URL for a side-by-side website review, or run the full competitor comparison. We fetch public pages, score what is visible, and generate a branded PDF. No invented revenue. No guaranteed rankings.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="inline-flex min-h-12 items-center rounded-pill bg-fg px-5 font-semibold text-bg" href="#website-review">Review my website</a>
          <a className="inline-flex min-h-12 items-center rounded-pill border border-line px-5 font-semibold" href="#comparison-intake">Open the comparison</a>
        </div>
      </header>
      <GeoQuote>A brochure can look finished. A growth system still has to attract, answer, qualify, follow up, and measure. This report shows the public gap. It is not a contract.</GeoQuote>
      <DirectAnswer question="What does this comparison measure?">
        <p>Public HTML for titles, answers, forms, mobile basics, trust language, and analytics signatures. Private CRM, ad accounts, and passwords are out of scope. If a page cannot be fetched, the score is labeled estimated.</p>
      </DirectAnswer>
      <WebsiteAudit />
      <div id="comparison-intake">
        <ComparisonApp />
      </div>
      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={faqs} />
      </Section>
    </main>
  );
}
