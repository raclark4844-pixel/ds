import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { PlatformComparison } from "@/components/platform-comparison";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { homeGeoQuote, whoForAnswer } from "@/lib/answers";
import { audiences, engagementSteps, homeFaqs, offerCards, proofPoints } from "@/lib/site";
import { faqJsonLd, pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Demore Technology Solutions | Websites, AI Marketing, Lead Generation & Automation",
      description:
        "Custom websites, ecommerce, AI-assisted digital marketing, lead generation, SEO, GEO, AEO, CRO, analytics, social automation, and content systems.",
      path: "/",
    }),
  component: Home,
});

const accentBar: Record<(typeof offerCards)[number]["accent"], string> = {
  hot: "bg-hot",
  volt: "bg-volt",
  flare: "bg-flare",
};

const platformCapabilities = [
  {
    title: "AI-assisted digital marketing",
    body: "A connected marketing system that helps plan campaigns, create and repurpose content, improve landing pages, organize offers, and keep the brand active without turning every task into a separate manual project.",
  },
  {
    title: "Lead-generation systems",
    body: "Campaign pages, forms, calls to action, tracking, audience targeting, follow-up paths, and conversion-focused intake designed to turn traffic into qualified opportunities for the sales team.",
  },
  {
    title: "Search and answer visibility",
    body: "SEO, GEO, AEO, technical performance, structured content, local and service-area signals, schema, internal linking, and direct-answer content built to improve discoverability across traditional and AI-assisted search.",
  },
  {
    title: "Social and content automation",
    body: "Systems for Facebook, Instagram, Google Business Profile, TikTok, YouTube, LinkedIn, X, and other channels, including content calendars, assisted creation, approvals, publishing workflows, and reuse across platforms.",
  },
  {
    title: "Analytics and optimization",
    body: "Google Analytics, Search Console, conversion events, campaign measurement, behavior review, CRO improvements, and ongoing testing so decisions come from what visitors actually do rather than guesswork.",
  },
  {
    title: "Custom business automation",
    body: "Bots, alerts, intake routing, content workflows, review workflows, CRM handoffs, lead notifications, and custom integrations that reduce repetitive work and connect the website to the rest of the business.",
  },
];

function Home() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(homeFaqs)} />
      <PageHero
        kicker="Demore Technology Solutions"
        title="We build custom AI-assisted digital marketing and lead-generation platforms."
        lede={
          <p>
            One connected system built around your business: website or ecommerce, SEO, GEO, AEO,
            CRO, content, social, campaigns, lead capture, analytics, follow-up, and automation.
            Every service is also available à la carte when you need one focused solution.
          </p>
        }
        primary={{ to: "/contact", label: "Build my platform", search: { need: "platform" } }}
        secondary={{ to: "/platform", label: "See how the platform works", variant: "volt" }}
        media={{
          src: "/media/hero-orbs.jpg",
          alt: "Geometric fluorescent orbs on a near-black field, the visual mark of Demore Technology Solutions.",
        }}
      />

      <GeoQuote>{homeGeoQuote}</GeoQuote>

      <DirectAnswer question="Who is Demore Technology Solutions for?">
        <p>{whoForAnswer}</p>
      </DirectAnswer>

      <Section
        kicker="Why the platform is different"
        title="A connected growth system—not a website surrounded by disconnected tools."
        lede="The website is the conversion hub. Search, content, campaigns, lead capture, measurement, and follow-up are designed around it as one system."
      >
        <PlatformComparison compact />
        <Link
          to="/platform"
          className="mt-6 inline-flex text-sm font-medium text-volt underline underline-offset-4"
        >
          See the complete platform and full comparison
        </Link>
      </Section>

      <Section
        kicker="Proof, not slogans"
        title="What will this shop refuse to fake?"
        lede="No invented revenue. No borrowed logos. No fake testimonials. No fabricated traffic, lead, ranking, or conversion numbers."
      >
        <ol className="grid gap-4 md:grid-cols-3">
          {proofPoints.map((item) => (
            <li key={item.kicker} className="rounded-xl border border-line bg-surface p-6">
              <p className="font-display text-sm text-hot">{item.kicker}</p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        kicker="Complete platform or à la carte"
        title="Build the full system—or start with the service you need now."
        lede="The flagship offer connects every part of the customer journey. Websites, ecommerce, growth, lead generation, content, analytics, and automation also remain available as individual services."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offerCards.map((card) => (
            <li key={card.title}>
              <Link
                to={card.to}
                className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 no-underline transition-colors duration-200 hover:border-fg/25"
              >
                <span className={cn("h-1 w-10 rounded-pill", accentBar[card.accent])} />
                <p className="kicker mt-4">{card.kicker}</p>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{card.body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm text-fg">
                  Open
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        kicker="AI-assisted marketing platform"
        title="One system for visibility, content, leads, and follow-up."
        lede="The platform layer connects the website, search visibility, content engine, social channels, lead capture, analytics, and automation so the marketing stack behaves like one operating system instead of a pile of subscriptions."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platformCapabilities.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/growth" className="text-sm font-medium text-volt underline underline-offset-4">
            Explore search, AI visibility, and lead generation
          </Link>
          <Link
            to="/automation"
            className="text-sm font-medium text-flare underline underline-offset-4"
          >
            Explore bots, publishing, and workflow automation
          </Link>
        </div>
      </Section>

      <Section
        kicker="Who it is for"
        title="Businesses that need a working growth system — not disconnected tactics."
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {audiences.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="How it starts" title="File a brief. Then we pressure-test the offer.">
        <ol className="grid gap-4 md:grid-cols-2">
          {engagementSteps.map((item) => (
            <li key={item.n} className="rounded-xl border border-line bg-surface p-6">
              <p className="font-display text-sm text-volt">{item.n}</p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={homeFaqs} />
      </Section>

      <RelatedOffers current="/" />

      <div className="mt-16">
        <CtaBand
          kicker="Next"
          title="Start a project brief."
          body="Tell us what needs to be built, what needs to generate leads, and what needs to be automated or measured. Rankings, AI citations, lead volume, and conversion lifts are not guaranteed."
          primaryLabel="Build my platform"
          primaryNeed="platform"
          secondary={{ to: "/growth", label: "See the growth stack", variant: "volt" }}
        />
      </div>
    </main>
  );
}
