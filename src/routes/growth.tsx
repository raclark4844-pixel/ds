import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { growthGeoQuote, seoGeoAeoAnswer } from "@/lib/answers";
import { growthFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/growth")({
  head: () =>
    pageHead({
      title: "SEO, GEO, AEO, CRO, and Performance | Demore Technology Solutions",
      description:
        "SEO, GEO, AEO, CRO, and technical performance. How this site is built and what the studio sells. No guaranteed rankings, citations, or lifts.",
      path: "/growth",
    }),
  component: GrowthPage,
});

const disciplines = [
  {
    name: "SEO",
    full: "Search Engine Optimization",
    meaning: "Can they find you.",
    teach: [
      "Unique titles and meta descriptions",
      "One H1, then logical H2 and H3",
      "Service pages and descriptive slugs",
      "Internal links and crawlable nav",
      "Canonicals, sitemap, robots.txt",
    ],
    here: "Every live page has a unique title and description, one H1, canonicals, robots.txt, and sitemap.xml. Offers sit on separate URLs so a crawler does not mash websites, bots, growth, and claims into one blob.",
    sell: "We structure sites so the work can rank, not just look finished. Rankings are not guaranteed.",
  },
  {
    name: "GEO",
    full: "Generative Engine Optimization, and geography",
    meaning:
      "Will ChatGPT, Perplexity, Gemini, or Copilot cite you in a synthesized answer. On contractor pages, service-area language ready for city pages later.",
    teach: [
      "Quotable definitions a model can lift",
      "Named entities: SEO, AEO, GEO, CRO, Xactimate",
      "Clear what this is / what this is not",
      "Separate pages per offer",
      "City and service-area language on contractor work",
    ],
    here: "Definition blocks sit on Home, Growth, Websites, Automation, and Claims. Named entities include Demore Technology Solutions, SEO, GEO, AEO, CRO, Xactimate. Claims copy states what a supplement is and is not.",
    sell: "We write pages people find and pages AI systems can cite. Citations are not guaranteed.",
  },
  {
    name: "UX",
    full: "Technical performance and UX",
    meaning: "The page loads, reads, and taps like a tool, not a poster.",
    teach: [
      "Speed and a light front end",
      "Mobile first, sticky nav, working hamburger",
      "Large tap targets, no horizontal scroll",
      "Contrast that still keeps the fluorescents readable",
      "Visible focus states and reduced-motion respect",
    ],
    here: "Black #050505, white type, fluorescent red #FF2A3A, green #00FF9C, orange #FF6A00. Tap-sized controls. Sticky header. Focus rings. Orbs stop when the visitor asks for reduced motion.",
    sell: "Performance and UX are conversion work, not a developer afterthought.",
  },
  {
    name: "CRO",
    full: "Conversion Rate Optimization",
    meaning: "A visitor who already arrived takes the next useful step.",
    teach: [
      "One primary action per view",
      "Proof near the fold, not fake quotes",
      "Short path to the form",
      "Stepped intake so people finish",
      "A thank-you / summary after submit",
    ],
    here: "Primary CTA is Start a project brief. Claims views also use Maximize a claim. Intake is multi-step with a progress bar. No fake testimonials. No fake numbers.",
    sell: "We design the clicks that create a lead, not just the look of the page. Conversion lifts are not guaranteed.",
  },
  {
    name: "AEO",
    full: "Answer Engine Optimization",
    meaning: "Can search, voice, or an AI Overview lift a clean answer from the page.",
    teach: [
      "Question headings",
      "130 to 170 word direct-answer blocks",
      "FAQ with details/summary",
      "FAQ schema where the questions live",
      "The answer first, then the detail",
    ],
    here: "Home, Growth, Websites, Automation, Claims, and Intake carry real FAQ plus FAQ JSON-LD. Direct-answer blocks sit under the H1. Each answer starts with the answer.",
    sell: "We write pages that can win the snippet and the spoken answer, not only a blue link. Snippets are not guaranteed.",
  },
];

function GrowthPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(growthFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "SEO, GEO, AEO, CRO, and performance",
          description: "Growth stack: search, answer engines, generative citation, conversion, and technical UX.",
          path: "/growth",
          serviceType: [
            "Search engine optimization",
            "Answer engine optimization",
            "Generative engine optimization",
            "Conversion rate optimization",
          ],
        })}
      />
      <PageHero
        kicker="Growth stack"
        title="Found in search. Built to convert."
        lede={
          <p>
            SEO, GEO, AEO, CRO, technical performance, and UX. This is how the
            site is built and what Demore Technology Solutions sells. No guaranteed
            rankings. No guaranteed citations. No guaranteed lifts.
          </p>
        }
        primary={{ to: "/contact", label: "Start a project brief", search: { need: "growth" } }}
        secondary={{ to: "/websites", label: "See websites and stores" }}
        media={{
          src: "/media/growth-rays.jpg",
          alt: "Radial geometric burst on a near-black field, used as the visual for search and citation.",
        }}
      />

      <GeoQuote>{growthGeoQuote}</GeoQuote>

      <DirectAnswer question="What is the difference between SEO, GEO, and AEO?">
        <p>{seoGeoAeoAnswer}</p>
      </DirectAnswer>

      <Section kicker="Plain English" title="Three questions. Then the click.">
        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
          <ul className="space-y-3 text-lg text-fg">
            <li>SEO means can they find you.</li>
            <li>AEO means can a search, voice, or AI Overview lift you as the answer.</li>
            <li>GEO means will ChatGPT, Perplexity, Gemini, or Copilot cite you in a synthesized answer.</li>
            <li>CRO means will they act.</li>
          </ul>
        </div>
      </Section>

      <Section
        kicker="Five disciplines"
        title="Taught here. Built into the live pages."
        lede="Do not treat these as footer buzzwords. Each one has a meaning, a teaching, a build on this site, and a sell line."
      >
        <div className="grid gap-4">
          {disciplines.map((item) => (
            <article key={item.name} className="rounded-xl border border-line bg-surface p-6 sm:p-8">
              <p className="kicker">{item.name}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {item.full}
              </h3>
              <p className="mt-3 max-w-2xl text-muted">{item.meaning}</p>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-volt">On the Growth page we teach</p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                    {item.teach.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-flare">Built into this site</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.here}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-hot">What we sell</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.sell}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="Internal links" title="Crawlable paths between the offers.">
        <RelatedOffers current="/growth" />
        <p className="mt-6 max-w-2xl text-sm text-muted">
          Home,{" "}
          <Link to="/websites" className="text-fg underline">
            Websites
          </Link>
          , Growth,{" "}
          <Link to="/automation" className="text-fg underline">
            Automation
          </Link>
          ,{" "}
          <Link to="/claims" className="text-fg underline">
            Claims
          </Link>
          , and{" "}
          <Link to="/contact" className="text-fg underline">
            Start a Project
          </Link>
          .
        </p>
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={growthFaqs} />
      </Section>

      <div className="mt-16">
        <CtaBand
          kicker="Next"
          title="Put the stack on a real site."
          body="The brief collects URL, what you rank for, and the action you want. Rankings, citations, and lifts are not guaranteed."
          primaryLabel="Start a project brief"
          primaryNeed="growth"
          secondary={{ to: "/claims", label: "Maximize a claim", variant: "claim" }}
        />
      </div>
    </main>
  );
}
