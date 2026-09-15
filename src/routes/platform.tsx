import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { IndustryLinks } from "@/components/industry-links";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { PlatformComparison } from "@/components/platform-comparison";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, Section } from "@/components/section";
import { pageHead, serviceJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/platform")({
  head: () =>
    pageHead({
      title: "Custom AI-Assisted Digital Marketing & Lead-Generation Platform | Demore",
      description:
        "A custom AI-assisted platform connecting websites, ecommerce, SEO, GEO, AEO, CRO, content, social, lead capture, analytics, follow-up, and automation.",
      path: "/platform",
    }),
  component: PlatformPage,
});

const layers = [
  [
    "01",
    "Foundation",
    "Custom website or ecommerce, landing pages, offer architecture, mobile UX, analytics, and conversion tracking.",
  ],
  [
    "02",
    "Visibility",
    "Technical SEO, geographic relevance, generative and answer-engine optimization, structured data, and content architecture.",
  ],
  [
    "03",
    "Demand",
    "Campaign strategy, organic and paid destinations, social content, short-form media, Google Business Profile, and lead magnets.",
  ],
  [
    "04",
    "Conversion",
    "Calls to action, qualification forms, booking or estimating paths, CRO, trust, proof, and campaign-specific intake.",
  ],
  [
    "05",
    "Follow-up",
    "Lead routing, alerts, CRM handoffs, review workflows, nurture support, reporting, and custom business automation.",
  ],
  [
    "06",
    "Improvement",
    "AI-assisted analysis, controlled content variants, behavior review, attribution, testing, and prioritized optimization.",
  ],
] as const;

const alaCarte = [
  [
    "Websites & ecommerce",
    "/websites",
    "Custom marketing sites, online stores, rebuilds, portals, landing pages, and lead capture.",
  ],
  [
    "Growth & lead generation",
    "/growth",
    "SEO, GEO, AEO, CRO, performance, analytics, campaigns, and conversion systems.",
  ],
  [
    "AI & automation",
    "/automation",
    "Content workflows, social publishing, lead routing, CRM handoffs, and custom bots.",
  ],
] as const;

function PlatformPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd
        data={serviceJsonLd({
          name: "Custom AI-assisted digital marketing and lead-generation platform",
          description:
            "A connected platform combining web, search, content, lead generation, measurement, follow-up, and automation around one business strategy.",
          path: "/platform",
          serviceType: [
            "Digital marketing platform",
            "Lead generation",
            "Website development",
            "Marketing automation",
            "SEO",
            "Conversion optimization",
          ],
        })}
      />
      <PageHero
        kicker="The flagship offer"
        title="A custom AI-assisted digital marketing and lead-generation platform."
        lede={
          <p>
            Not just a website. Not a collection of subscriptions. We design the website, search
            visibility, content engine, campaigns, lead capture, analytics, follow-up, and
            automation as one custom system built around how your business attracts customers and
            closes work.
          </p>
        }
        primary={{ to: "/contact", label: "Build my platform", search: { need: "platform" } }}
        secondary={{ to: "/growth", label: "Explore the growth stack", variant: "volt" }}
        media={{
          src: "/media/hero-orbs.jpg",
          alt: "Connected fluorescent forms representing a unified digital marketing and lead-generation platform.",
        }}
      />

      <DirectAnswer question="What separates the platform from a normal website or marketing package?">
        <p>
          A website is one destination. A marketing package often delivers separate activities.
          Demore builds a connected operating system: every page, campaign, channel, form, event,
          and workflow is designed to support the same customer journey and measurement plan. AI
          assists the high-volume work, while people control strategy, accuracy, approvals, brand,
          and sales decisions.
        </p>
      </DirectAnswer>

      <Section
        kicker="The difference"
        title="One system beats a pile of disconnected tactics."
        lede="The platform is custom-scoped to the business. It can incorporate existing tools when they are useful and replace gaps where the current stack breaks the customer journey."
      >
        <PlatformComparison />
      </Section>

      <Section
        kicker="Six connected layers"
        title="Everything works toward a qualified opportunity."
      >
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {layers.map(([number, title, body]) => (
            <li key={number} className="rounded-xl border border-line bg-surface p-6">
              <p className="font-display text-sm text-hot">{number}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        kicker="Available à la carte"
        title="Start with the complete platform—or the part you need now."
        lede="Individual services remain available. Each can stand alone and can also be designed to connect cleanly with future phases."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {alaCarte.map(([title, to, body]) => (
            <Link
              key={to}
              to={to}
              className="group rounded-xl border border-line bg-elevated p-6 no-underline hover:border-fg/30"
            >
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-volt">
                View services{" "}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        kicker="Industry-specific"
        title="The platform changes with the way your customers buy."
      >
        <IndustryLinks />
      </Section>
      <RelatedOffers current="/platform" />
      <div className="mt-16">
        <CtaBand
          kicker="Start with the system"
          title="Build the growth platform around your actual sales process."
          body="Tell us your industry, offer, audience, service area, current tools, lead flow, budget, and growth goals. We will identify what should connect now and what can be phased."
          primaryLabel="Start the platform brief"
          primaryNeed="platform"
          secondary={{ to: "/process", label: "See the process" }}
        />
      </div>
    </main>
  );
}
