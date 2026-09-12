import { createFileRoute } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { automationAnswer, automationGeoQuote } from "@/lib/answers";
import { automationFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/automation")({
  head: () =>
    pageHead({
      title: "Social Bots, Auto-Posting, and Content | Demore Technology Solutions",
      description:
        "Social bots, auto-posting, and short-form content. Each post must hit a converting page. Start a project brief.",
      path: "/automation",
    }),
  component: AutomationPage,
});

const blocks = [
  {
    title: "Social bots and auto-posting",
    body: "The bot logs in so you do not have to. Platforms you already use: Facebook, Instagram, TikTok, YouTube, LinkedIn, X, Google Business Profile, Nextdoor. Cadence is yours. Approval is yours unless you explicitly waive it.",
  },
  {
    title: "Awareness systems",
    body: "Posts without a landing path are a hobby. Awareness systems point traffic at pages built to convert — a service page, a store product, an estimate form, an intake. If the page cannot take the job, we do not scale the post.",
  },
  {
    title: "Short-form audio and video",
    body: "TikTok, Reels, Shorts, and Stories punish widescreen afterthoughts. Vertical audio and video aimed at a URL that does work.",
  },
];

function AutomationPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(automationFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "Social auto-posting and content",
          description: "Bots, calendars, and short-form that point at a converting page.",
          path: "/automation",
          serviceType: ["Social media automation", "Content production"],
        })}
      />
      <PageHero
        kicker="Automation and content"
        title="Posts without a landing path are a hobby."
        lede={
          <p>
            Social bots, auto-posting, awareness systems, and short-form audio
            and video. You approve. The calendar ships.
          </p>
        }
        primary={{ to: "/contact", label: "Start a project brief", search: { need: "automation" } }}
        secondary={{ to: "/claims", label: "Maximize a claim", variant: "claim" }}
        media={{
          src: "/media/automation-pulse.jpg",
          alt: "Pulsing geometric bars on a near-black field, used as the visual for auto-posting systems.",
        }}
      />

      <GeoQuote>{automationGeoQuote}</GeoQuote>

      <DirectAnswer question="What is a social posting system for a local business?">
        <p>{automationAnswer}</p>
      </DirectAnswer>

      <Section kicker="The system" title="Bot, destination, then volume.">
        <ul className="grid gap-4 md:grid-cols-3">
          {blocks.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={automationFaqs} />
      </Section>

      <RelatedOffers current="/automation" />

      <div className="mt-16">
        <CtaBand
          kicker="Next"
          title="Name the networks you actually use."
          body="The brief collects platforms, cadence, and who approves. Conversion lifts from posting are not guaranteed."
          primaryLabel="Start a project brief"
          primaryNeed="automation"
          secondary={{ to: "/growth", label: "See the growth stack" }}
        />
      </div>
    </main>
  );
}
