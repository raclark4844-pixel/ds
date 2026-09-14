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
      title: "AI Digital Marketing, Lead Generation, SEO, GEO, AEO, CRO | Demore Technology Solutions",
      description:
        "AI-assisted digital marketing, lead generation, SEO, GEO, AEO, CRO, analytics, technical performance, and conversion systems for businesses nationwide.",
      path: "/growth",
    }),
  component: GrowthPage,
});

const disciplines = [
  {
    name: "SEO",
    full: "Search Engine Optimization",
    meaning: "Can the right customer find you when they search for the service, product, or problem you solve?",
    teach: [
      "Unique titles and meta descriptions",
      "Logical heading structure and useful service pages",
      "Internal links and crawlable navigation",
      "Canonicals, sitemap, robots.txt, and indexability",
      "Content mapped to real search intent",
    ],
    here: "Every live page is built around a distinct purpose instead of forcing websites, automation, growth, claims, and industries into one undifferentiated page.",
    sell: "We structure and improve sites so search engines can understand the business, the offer, and the next action. Rankings are not guaranteed.",
  },
  {
    name: "GEO",
    full: "Generative Engine Optimization",
    meaning: "Can AI systems understand, retrieve, summarize, and potentially cite your business when people ask conversational questions?",
    teach: [
      "Clear entity and service language",
      "Quotable definitions and direct answers",
      "Structured content with useful context",
      "Named services, industries, markets, and proof",
      "Local and service-area signals where they matter",
    ],
    here: "Definition blocks, service-specific pages, FAQs, schema, and explicit business context make the site easier for both traditional crawlers and AI-assisted answer systems to interpret.",
    sell: "We optimize content for machine understanding as well as human conversion. Citations and AI visibility are not guaranteed.",
  },
  {
    name: "AEO",
    full: "Answer Engine Optimization",
    meaning: "Can a search result, AI overview, assistant, or voice system extract a clean, accurate answer from the page?",
    teach: [
      "Question-led headings",
      "Direct-answer sections",
      "FAQ content and structured data",
      "Short answer first, explanation second",
      "Content that resolves buyer questions without fluff",
    ],
    here: "Core pages use direct-answer content and FAQ structures so a visitor or answer engine can quickly understand what is offered and what the limitations are.",
    sell: "We build pages that are useful in classic search and in answer-driven search experiences. Featured answers are not guaranteed.",
  },
  {
    name: "CRO",
    full: "Conversion Rate Optimization",
    meaning: "Once the visitor arrives, does the page make the next useful action obvious and easy?",
    teach: [
      "Clear primary calls to action",
      "Message match from ad or search to landing page",
      "Shorter paths to forms and contact",
      "Better lead qualification",
      "Behavior-based testing and iteration",
    ],
    here: "Primary actions stay visible, offer pages remain distinct, and intake collects enough information for a real sales conversation rather than producing empty name-and-email leads.",
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
    here: "The site keeps the existing high-contrast visual identity while making pages readable, navigable, responsive, and usable on phones.",
    sell: "Performance and usability are part of growth because a slow or confusing page wastes the traffic you already paid or worked to earn.",
  },
];

const leadSystem = [
  {
    title: "Campaign strategy and offer positioning",
    body: "Clarify who the campaign is for, what action matters, what problem the offer solves, and what page should receive the traffic. AI can accelerate research, drafting, variation, and analysis while the strategy remains tied to the actual business model.",
  },
  {
    title: "Landing pages and lead capture",
    body: "Dedicated landing pages, service pages, campaign-specific calls to action, forms, qualification questions, and intake paths designed to collect useful information instead of generating low-context leads.",
  },
  {
    title: "Organic search and AI discovery",
    body: "SEO, GEO, AEO, schema, local and national service signals, answer-focused content, internal linking, and technical indexing work designed to improve the number of ways a prospect can discover the business.",
  },
  {
    title: "Paid and organic campaign support",
    body: "Creative direction, ad-ready landing pages, social content, campaign messaging, offer testing, retargeting concepts, and channel coordination. Media spend and platform accounts remain under the client’s control unless separately agreed.",
  },
  {
    title: "Analytics and conversion tracking",
    body: "Google Analytics, Search Console, conversion events, campaign attribution, behavior review, form measurement, and lead-source analysis so marketing decisions can be based on what is happening on the site.",
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
          description: "Connected growth systems covering search, AI visibility, lead capture, conversion, analytics, and technical UX.",
          path: "/growth",
          serviceType: [
            "Digital marketing",
            "Lead generation",
            "Search engine optimization",
            "Answer engine optimization",
            "Generative engine optimization",
            "Conversion rate optimization",
            "Analytics implementation",
          ],
        })}
      />
      <PageHero
        kicker="Growth stack"
        title="Found in search. Built to generate and convert demand."
        lede={
          <p>
            AI-assisted digital marketing, lead generation, SEO, GEO, AEO, CRO,
            analytics, technical performance, and UX. The system is designed to
            connect discovery, campaign traffic, landing pages, lead capture, and follow-up.
          </p>
        }
        primary={{ to: "/contact", label: "Start a project brief", search: { need: "growth" } }}
        secondary={{ to: "/automation", label: "See automation systems" }}
        media={{
          src: "/media/growth-rays.jpg",
          alt: "Radial geometric burst on a near-black field, used as the visual for search and citation.",
        }}
      />

      <GeoQuote>{growthGeoQuote}</GeoQuote>

      <DirectAnswer question="What is an AI-assisted digital marketing and lead-generation platform?">
        <p>
          It is a connected marketing system that combines website and landing-page strategy,
          search visibility, AI-assisted content workflows, social distribution, lead capture,
          analytics, and conversion optimization. The goal is to reduce the gaps between getting
          attention and getting a qualified inquiry. AI can help accelerate research, drafting,
          analysis, repurposing, and repetitive marketing tasks, but the business offer, claims,
          targeting, approvals, and final decisions still require human oversight.
        </p>
      </DirectAnswer>

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

      <Section kicker="Plain English" title="Visibility, answers, and conversion all solve different problems.">
        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
          <ul className="space-y-3 text-lg text-fg">
            <li>SEO asks whether the right prospect can find you in search.</li>
            <li>AEO asks whether search and answer systems can lift a clean answer from your page.</li>
            <li>GEO asks whether generative AI systems can understand and potentially cite your business in a synthesized answer.</li>
            <li>CRO asks whether the visitor takes the next useful action.</li>
            <li>Analytics asks whether you can measure what happened and improve it.</li>
          </ul>
        </div>
      </Section>

      <Section
        kicker="Five disciplines"
        title="Each discipline gets its own job."
        lede="These are not interchangeable buzzwords. Each one improves a different part of the acquisition and conversion path."
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

      <Section kicker="Connected system" title="Growth works better when the pages and automation are connected.">
        <p className="max-w-3xl text-sm leading-relaxed text-muted">
          Search visibility gets the business discovered. Landing pages explain the offer. Forms capture and qualify the opportunity.
          Analytics show which source and page produced the action. Automation can then route, publish, notify, or follow an approved workflow.
          The pieces can be used separately, but they create more value when they share one strategy and one measurement plan.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link to="/websites" className="text-fg underline underline-offset-4">Websites and landing pages</Link>
          <Link to="/automation" className="text-fg underline underline-offset-4">Automation and content systems</Link>
          <Link to="/contact" className="text-fg underline underline-offset-4">Start a project brief</Link>
        </div>
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={growthFaqs} />
      </Section>

      <RelatedOffers current="/growth" />

      <div className="mt-16">
        <CtaBand
          kicker="Next"
          title="Build a growth system around the actual sales process."
          body="The brief collects the website, offer, audience, markets, channels, and the action you want prospects to take. Rankings, AI citations, lead volume, and conversion lifts are not guaranteed."
          primaryLabel="Start a project brief"
          primaryNeed="growth"
          secondary={{ to: "/automation", label: "See automation systems" }}
        />
      </div>
    </main>
  );
}
