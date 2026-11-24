import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { IndustryLinks } from "@/components/industry-links";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { automationGeoQuote } from "@/lib/answers";
import { automationFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/automation")({
  head: () =>
    pageHead({
      title: "AI Marketing Automation & Business Bots | Demore Tech",
      description:
        "AI-assisted marketing automation: social publishing, content repurposing, Google Business Profile and review workflows, lead routing, and custom bots.",
      path: "/automation",
    }),
  component: AutomationPage,
});

const blocks = [
  {
    title: "Social publishing and auto-posting",
    body: "Build approved workflows for Facebook, Instagram, TikTok, YouTube, LinkedIn, X, Google Business Profile, Nextdoor, and other channels the business actually uses. Content calendars, approvals, scheduling, publishing, and reuse can be coordinated instead of handled one post at a time. Exact integrations depend on the platform APIs, account permissions, and the workflow being automated.",
  },
  {
    title: "AI-assisted content production",
    body: "Use AI to help create first drafts, campaign variations, captions, post concepts, summaries, scripts, FAQs, and repurposed content from approved source material. Human review stays part of the workflow so speed does not replace accuracy or brand judgment.",
  },
  {
    title: "Short-form audio and video workflows",
    body: "Plan and produce vertical content for Reels, TikTok, Shorts, Stories, and other short-form placements. The content is built around a destination — service page, campaign page, product, form, or offer — rather than posting for activity alone.",
  },
  {
    title: "Google Business Profile workflows",
    body: "Create systems for posting approved project photos, updates, offers, service information, and other business content to Google Business Profile when platform permissions and integrations allow it.",
  },
  {
    title: "Review and reputation workflows",
    body: "Build approved processes that surface new reviews, prepare reusable review content for websites and social channels, notify the team, and reduce the manual work involved in keeping reputation proof current.",
  },
  {
    title: "Lead routing and notifications",
    body: "Connect forms and campaign inquiries to email, CRM, dashboards, internal alerts, or other approved destinations. Routing can be based on service, territory, campaign, urgency, or other information captured in the intake.",
  },
  {
    title: "Website and CRM automation",
    body: "Connect website actions to business workflows such as intake organization, follow-up tasks, campaign tagging, data handoff, status notifications, and custom processes built around the way the company actually operates.",
  },
  {
    title: "Custom AI and business bots",
    body: "Build specialized assistants for repetitive business tasks such as content preparation, intake triage, internal knowledge lookup, campaign support, customer-facing Q&A, and operational workflows, subject to the permissions and data sources the business chooses to connect.",
  },
];

function AutomationPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(automationFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "AI-assisted marketing automation, social publishing, content, and business bots",
          description:
            "Connected automation for social publishing, content production, lead routing, review workflows, Google Business Profile, and custom business processes.",
          path: "/automation",
          serviceType: [
            "Marketing automation",
            "Social media automation",
            "Content production",
            "Lead routing",
            "Business process automation",
            "AI assistant development",
          ],
        })}
      />
      <PageHero
        kicker="Automation and content"
        title="AI marketing automation that makes repetitive work run like a system."
        lede={
          <p>
            AI-assisted content, social publishing, Google Business Profile
            workflows, review workflows, lead routing, custom bots, and business
            automation. The goal is not automation for its own sake — it is
            fewer manual handoffs and a faster path from activity to action.
          </p>
        }
        primary={{ to: "/contact", label: "Start a project brief", search: { need: "automation" } }}
        secondary={{ to: "/platform", label: "See the complete platform" }}
        media={{
          src: "/media/automation-pulse.jpg",
          alt: "Pulsing geometric bars on a near-black field, used as the visual for auto-posting systems.",
        }}
      />

      <GeoQuote>{automationGeoQuote}</GeoQuote>

      <DirectAnswer question="What can Demore Technology Solutions automate for marketing and lead generation?">
        <p>
          Demore can build workflows around content creation, approvals, social
          publishing, Google Business Profile activity, review reuse, website
          forms, lead routing, notifications, CRM handoffs, campaign
          organization, and custom AI-assisted business tasks. The exact
          workflow depends on the platforms, permissions, data sources, and
          approval rules available to the business.
        </p>
      </DirectAnswer>

      <Section
        kicker="Automation or full platform"
        title="Use automation à la carte—or connect it to the complete customer journey."
      >
        <p className="max-w-3xl text-base leading-relaxed text-muted">
          Automation delivers more value when it knows where demand came from,
          what the prospect needs, and what the next sales action should be. The
          complete platform connects those workflows to the website, campaigns,
          content, lead capture, analytics, and human approvals.
        </p>
        <Link
          to="/platform"
          preload="intent"
          className="mt-5 inline-flex text-sm font-medium text-volt underline underline-offset-4"
        >
          See the platform comparison
        </Link>
      </Section>

      <Section
        kicker="Automation offerings"
        title="From content queue to lead handoff."
        lede="These systems can stand alone or connect to the website and growth stack so traffic, content, and inquiries move through one coordinated workflow."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blocks.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <FaqList faqs={automationFaqs} />
      <RelatedOffers />
      <IndustryLinks />
      <CtaBand />
    </main>
  );
}