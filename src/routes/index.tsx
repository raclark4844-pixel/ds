import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AssistantWebsiteReview } from "@/components/assistant-website-review";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { PlatformComparison } from "@/components/platform-comparison";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { homeGeoQuote, whoForAnswer } from "@/lib/answers";
import { audiences, engagementSteps, homeFaqs, proofPoints } from "@/lib/site";
import { faqJsonLd, pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Demore Technology Solutions | Website Design, Bots, Growth & AI Platforms",
      description:
        "Custom website design, ecommerce, AI bots, growth marketing, lead generation, and AI-assisted platforms built around your business.",
      path: "/",
    }),
  component: Home,
});

const serviceAreas = [
  {
    number: "01",
    title: "Website design & ecommerce",
    accent: "bg-hot",
    to: "/websites",
    label: "Explore website design",
    body: "Give your business a digital home that looks like you, explains what you offer, and makes the next step easy. We design new sites, refresh existing ones, and build online stores around the way your customers buy.",
    details: [
      "Custom design, mobile layouts, and clear navigation",
      "Service pages, product catalogs, menus, and campaign landing pages",
      "Contact forms, booking paths, checkout, and conversion tracking",
    ],
    outcome: "A clear path from first impression to inquiry, booking, or purchase.",
  },
  {
    number: "02",
    title: "Bots & business automation",
    accent: "bg-flare",
    to: "/automation",
    label: "Explore bots & automation",
    body: "Put useful assistants and repeatable workflows behind your website and daily operations. Connect customer questions, content preparation, lead intake, and follow-up to the tools your team already uses.",
    details: [
      "Website Q&A assistants and internal knowledge bots",
      "Lead routing, CRM handoffs, alerts, and follow-up tasks",
      "Social scheduling, AI-generated content drafts, and approval workflows",
    ],
    outcome: "Less repetitive work, with your team in control of what gets published and sent.",
  },
  {
    number: "03",
    title: "Growth, search & lead generation",
    accent: "bg-volt",
    to: "/growth",
    label: "Explore growth services",
    body: "Help the right people discover your business and understand why to choose it. Bring search visibility, local discovery, content, campaigns, and measurement together around a clear offer.",
    details: [
      "SEO, local search, and visibility in AI-generated answers (GEO / AEO)",
      "Campaign content, social presence, and targeted landing pages",
      "Conversion improvements (CRO), analytics, and lead-generation workflows",
    ],
    outcome: "A measurable customer journey from discovery through follow-up.",
  },
  {
    number: "04",
    title: "Custom AI platforms & business tools",
    accent: "bg-hot",
    to: "/platform",
    label: "Explore custom platforms",
    body: "Turn an idea or a manual process into a purpose-built web platform. We use AI-assisted development to create connected websites, dashboards, portals, and workflows tailored to your business.",
    details: [
      "Custom dashboards, customer portals, and business workspaces",
      "AI-assisted content tools and connected marketing systems",
      "Forms, data, integrations, and workflows shaped around your process",
    ],
    outcome: "A platform built around how your business works, with room to grow.",
  },
] as const;

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
        title="Websites. Bots. Growth. Custom AI platforms."
        lede={
          <p>
            Demore Technology Solutions designs custom websites, builds AI bots, grows your digital
            presence, and creates AI-assisted platforms that connect marketing with everyday
            business. Start with one service or bring them together in a complete system.
          </p>
        }
        primary={{ to: "/contact", label: "Tell us what you want to build" }}
        secondary={{ to: "/platform", label: "See how the platform works", variant: "volt" }}
        extraAction={
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => window.dispatchEvent(new CustomEvent("demore:open-review"))}
          >
            Ask Demore AI: Improve my website
          </Button>
        }
      />

      <Section
        id="services"
        kicker="Four ways to move your business forward"
        title="Choose the service. Shape the system."
        lede="Website design, bots, growth, and AI platforms each have their own purpose. Explore them individually, then connect the parts that fit your goals."
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {serviceAreas.map((service) => (
            <li
              key={service.number}
              className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8"
            >
              <span
                aria-hidden="true"
                className={cn("absolute inset-x-0 top-0 h-1", service.accent)}
              />
              <p className="kicker text-muted">{service.number} / Demore services</p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                {service.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">{service.body}</p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed">
                {service.details.map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className={cn("mt-2 size-1.5 shrink-0 rounded-full", service.accent)}
                    />
                    {detail}
                  </li>
                ))}
              </ul>
              <p className="mb-6 mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
                {service.outcome}
              </p>
              <Link
                to={service.to}
                className="mt-auto inline-flex items-center gap-2 self-start text-sm font-medium text-volt underline underline-offset-4"
              >
                {service.label}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl border border-volt/30 bg-surface p-6 sm:p-8">
          <p className="kicker text-volt">A dedicated workspace for leads</p>
          <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
            Explore the Demore Lead Engine.
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            Bring prospect research, campaign organization, outreach drafts, and follow-up into one
            workspace. Explore industry examples for restaurants, pubs, pizza shops, and
            contractors.
          </p>
          <Link
            to="/lead-generation"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-volt underline underline-offset-4"
          >
            See the lead-generation workspace
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Section>

      <Section
        id="website-improvement-report"
        kicker="Your website, with a next step"
        title="See how Demore could improve your website."
        lede="Add your website below for a downloadable PDF with practical recommendations for design, search visibility, measurement, and customer inquiries. Then ask Demore to help you understand the findings."
      >
        <div className="max-w-2xl rounded-xl border border-volt/30 bg-surface p-3 sm:p-5">
          <AssistantWebsiteReview />
          <p className="px-3 pt-3 text-xs leading-relaxed text-muted">
            No website? You can still explore our services and chat with Ask Demore. Reports review
            public website signals; recommendations are opportunities to verify and discuss.
          </p>
        </div>
      </Section>

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
