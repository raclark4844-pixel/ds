import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { IndustryLinks } from "@/components/industry-links";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { PlatformComparison } from "@/components/platform-comparison";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { growthGeoQuote, seoGeoAeoAnswer } from "@/lib/answers";
import { growthFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/growth")({
  head: () =>
    pageHead({
      title:
        "AI Digital Marketing, Lead Generation, SEO, GEO, AEO & CRO | Demore Technology Solutions",
      description:
        "Nationwide AI-assisted digital marketing, lead generation, SEO, geographic and generative optimization, AEO, CRO, analytics, performance, and conversion systems.",
      path: "/growth",
    }),
  component: GrowthPage,
});

const disciplines = [
  {
    name: "SEO",
    full: "Search Engine Optimization",
    meaning:
      "Can the right customer find you when they search for the service, product, or problem you solve?",
    teach: [
      "Unique titles and meta descriptions",
      "Logical heading structure and useful service pages",
      "Internal links and crawlable navigation",
      "Canonicals, sitemap, robots.txt, and indexability",
      "Content mapped to real search intent",
    ],
    here: "Every live page has a distinct purpose, descriptive metadata, crawlable internal links, direct-answer content, and a clear conversion path instead of forcing every offer into one undifferentiated page.",
    sell: "We structure and improve sites so search engines can understand the business, the offer, and the next action. Rankings are not guaranteed.",
  },
  {
    name: "GEO",
    full: "Generative and Geographic Optimization",
    meaning:
      "Can AI systems understand the business and can search systems understand where and to whom the company provides its services?",
    teach: [
      "Clear entity, service, and service-area language",
      "Quotable definitions and direct answers",
      "Structured content with useful context",
      "Named services, markets, capabilities, and proof",
      "Local, regional, or nationwide relevance without doorway-page spam",
    ],
    here: "The site states the business identity, Mentor, Ohio base, nationwide service area, individual service offerings, direct answers, schema, and internal links so both geographic and generative systems have explicit context.",
    sell: "We improve machine understanding, geographic relevance, and answer-ready content without pretending citations or rankings can be guaranteed.",
  },
  {
    name: "AEO",
    full: "Answer Engine Optimization",
    meaning:
      "Can a search result, AI overview, assistant, or voice system extract a clean, accurate answer from the page?",
    teach: [
      "Question-led headings",
      "Direct-answer sections",
      "FAQ content and structured data",
      "Short answer first, explanation second",
      "Content that resolves buyer questions without fluff",
    ],
    here: "Core pages use direct-answer content and FAQ structures so a visitor or answer engine can quickly understand what is offered, who it is for, and what the limitations are.",
    sell: "We build pages that are useful in classic search and in answer-driven search experiences. Featured answers are not guaranteed.",
  },
  {
    name: "CRO",
    full: "Conversion Rate Optimization",
    meaning:
      "Once the visitor arrives, does the page make the next useful action obvious and easy?",
    teach: [
      "Clear primary calls to action",
      "Message match from search, social, or campaign to landing page",
      "Shorter paths to forms and contact",
      "Better lead qualification",
      "Behavior-based testing and iteration",
    ],
    here: "Primary actions stay visible, offer pages remain distinct, and intake collects enough information for a useful sales conversation rather than producing empty name-and-email leads.",
    sell: "We improve the path from visitor to qualified opportunity. Conversion lifts are not guaranteed.",
  },
  {
    name: "UX",
    full: "Technical Performance and User Experience",
    meaning: "Does the site load, read, and work like a business tool instead of a visual demo?",
    teach: [
      "Fast mobile-first experiences",
      "Large tap targets and clear navigation",
      "Accessible contrast and focus states",
      "Reduced friction on forms",
      "Stable layouts and practical interaction design",
    ],
    here: "The site keeps the existing high-contrast visual identity while making pages readable, navigable, responsive, stable, and usable on phones.",
    sell: "Performance and usability are part of growth because a slow or confusing page wastes traffic the business already paid or worked to earn.",
  },
];

const leadSystem = [
  {
    title: "Campaign strategy and offer positioning",
    body: "Clarify who the campaign is for, what action matters, what problem the offer solves, and what page should receive the traffic. AI can accelerate research, drafting, variation, and analysis while strategy stays tied to the actual business model.",
  },
  {
    title: "Landing pages and lead capture",
    body: "Dedicated landing pages, service pages, campaign-specific calls to action, forms, qualification questions, and intake paths designed to collect useful information instead of generating low-context leads.",
  },
  {
    title: "Organic search and AI discovery",
    body: "SEO, GEO, AEO, schema, nationwide and service-area signals, answer-focused content, internal linking, and technical indexing work designed to improve the number of ways a prospect can discover the business.",
  },
  {
    title: "Paid and organic campaign support",
    body: "Creative direction, ad-ready landing pages, social content, campaign messaging, offer testing, retargeting concepts, and channel coordination. Media spend and platform accounts remain under the client’s control unless separately agreed.",
  },
  {
    title: "Analytics and conversion tracking",
    body: "Google Analytics, Search Console, conversion events, campaign attribution, behavior review, form measurement, and lead-source analysis so marketing decisions can be based on what is actually happening on the site.",
  },
  {
    title: "AI-assisted optimization",
    body: "Use AI to help summarize performance, surface content gaps, generate controlled variants, repurpose approved material, identify weak conversion paths, and accelerate repetitive marketing analysis without pretending automation replaces business judgment.",
  },
];

function GrowthPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(growthFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "AI-assisted digital marketing, lead generation, SEO, GEO, AEO, CRO, and performance",
          description:
            "Nationwide connected growth systems covering search, geographic relevance, AI visibility, lead capture, conversion, analytics, and technical UX.",
          path: "/growth",
          serviceType: [
            "Digital marketing",
            "Lead generation",
            "Search engine optimization",
            "Geographic optimization",
            "Generative engine optimization",
            "Answer engine optimization",
            "Conversion rate optimization",
            "Analytics implementation",
          ],
        })}
      />
      <PageHero
        kicker="Growth stack"
        title="The growth engine inside the complete AI-assisted platform."
        lede={
          <p>
            AI-assisted digital marketing, lead generation, SEO, GEO, AEO, CRO, analytics, technical
            performance, and UX for businesses serving local, regional, or nationwide markets. The
            system connects discovery, campaign traffic, landing pages, lead capture, and follow-up.
          </p>
        }
        primary={{ to: "/contact", label: "Start a project brief", search: { need: "growth" } }}
        secondary={{ to: "/platform", label: "See the complete platform" }}
        media={{
          src: "/media/growth-rays.jpg",
          alt: "Radial geometric burst representing search visibility, lead generation, and growth optimization.",
        }}
      />

      <GeoQuote>{growthGeoQuote}</GeoQuote>

      <DirectAnswer question="What is an AI-assisted digital marketing and lead-generation platform?">
        <p>
          It is a connected marketing system that combines website and landing-page strategy, search
          visibility, geographic relevance, AI-assisted content workflows, social distribution, lead
          capture, analytics, and conversion optimization. The goal is to reduce the gaps between
          getting attention and getting a qualified inquiry. AI can help accelerate research,
          drafting, analysis, repurposing, and repetitive marketing tasks, while the business offer,
          targeting, approvals, brand standards, and final decisions remain under human control.
        </p>
      </DirectAnswer>

      <Section
        kicker="Connected vs. disconnected"
        title="Why the complete platform produces a stronger operating foundation."
      >
        <PlatformComparison compact />
      </Section>

      <Section
        kicker="Lead-generation platform"
        title="From discovery to qualified opportunity."
        lede="The platform is designed as a connected operating layer for marketing rather than a collection of unrelated tactics."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leadSystem.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <DirectAnswer question="What is the difference between SEO, GEO, and AEO?">
        <p>{seoGeoAeoAnswer}</p>
      </DirectAnswer>

      <Section
        kicker="Plain English"
        title="Visibility, geography, answers, and conversion solve different problems."
      >
        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
          <ul className="space-y-3 text-lg text-fg">
            <li>SEO asks whether the right prospect can find you in search.</li>
            <li>
              GEO asks whether systems understand your brand, expertise, service area, and
              geographic relevance — and whether generative systems can understand and potentially
              cite you.
            </li>
            <li>
              AEO asks whether search and answer systems can lift a clean answer from your page.
            </li>
            <li>CRO asks whether the visitor takes the next useful action.</li>
            <li>Analytics asks whether you can measure what happened and improve it.</li>
          </ul>
        </div>
      </Section>

      <Section
        kicker="Five disciplines"
        title="Each discipline gets its own job."
        lede="These are not interchangeable buzzwords. Each improves a different part of acquisition and conversion."
      >
        <div className="grid gap-4">
          {disciplines.map((item) => (
            <article
              key={item.name}
              className="rounded-xl border border-line bg-surface p-6 sm:p-8"
            >
              <p className="kicker">{item.name}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {item.full}
              </h3>
              <p className="mt-3 max-w-2xl text-muted">{item.meaning}</p>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-volt">What the work includes</p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                    {item.teach.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-flare">How it shows up on the site</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.here}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-hot">What Demore supplies</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.sell}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        kicker="Connected system"
        title="Growth works better when pages, measurement, and automation are connected."
      >
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          Search visibility gets the business discovered. Landing pages explain the offer. Forms
          capture and qualify the opportunity. Analytics show which source and page produced the
          action. Automation can then route, publish, notify, or follow an approved workflow. The
          pieces can be used separately, but they create more value when they share one strategy and
          one measurement plan.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link to="/websites" className="text-fg underline underline-offset-4">
            Websites and landing pages
          </Link>
          <Link to="/automation" className="text-fg underline underline-offset-4">
            Automation and content systems
          </Link>
          <Link to="/contact" className="text-fg underline underline-offset-4">
            Start a project brief
          </Link>
        </div>
      </Section>

      <Section kicker="Industries" title="See how the growth strategy changes by industry.">
        <IndustryLinks />
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={growthFaqs} />
      </Section>
      <RelatedOffers current="/growth" />
      <div className="mt-16">
        <CtaBand
          kicker="Next"
          title="Build a growth system around the actual sales process."
          body="The brief collects the industry, website, offer, audience, service area, channels, budget, and the action you want prospects to take. Rankings, AI citations, traffic, lead volume, and conversion lifts are not guaranteed."
          primaryLabel="Start a project brief"
          primaryNeed="growth"
          secondary={{ to: "/automation", label: "See automation systems" }}
        />
      </div>
    </main>
  );
}
