import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { homeGeoQuote, whoForAnswer } from "@/lib/answers";
import {
  audiences,
  engagementSteps,
  homeFaqs,
  offerCards,
  proofPoints,
} from "@/lib/site";
import { faqJsonLd, pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "Demore Technology Solutions | Websites, Growth, and Claim Supplements",
      description:
        "Custom websites, stores, social systems, and insurance claim supplements. Built loud. Tuned to convert. Start a project brief or maximize a claim.",
      path: "/",
    }),
  component: Home,
});

const accentBar: Record<(typeof offerCards)[number]["accent"], string> = {
  hot: "bg-hot",
  volt: "bg-volt",
  flare: "bg-flare",
};

function Home() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(homeFaqs)} />
      <PageHero
        kicker="Demore Technology Solutions"
        title="Built loud. Tuned to convert."
        lede={
          <p>
            Custom websites, stores, social systems, and insurance claim
            supplements. Digital work and claims are both first-class. Neither
            is a blog topic.
          </p>
        }
        primary={{ to: "/contact", label: "Start a project brief" }}
        secondary={{ to: "/claims", label: "Maximize a claim", variant: "claim" }}
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
        kicker="Proof, not slogans"
        title="What will this shop refuse to fake?"
        lede="No invented revenue. No borrowed logos. No quotes from people who do not exist. No fake recovery numbers."
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
        kicker="Offers, in the open"
        title="What does the studio actually build?"
        lede="Six cards. Two offers. Digital systems and insurance claim supplements both stay in the primary nav."
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

      <Section kicker="Who it is for" title="Crews, carts, and homeowners after a storm.">
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
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{item.title}</h3>
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
          title="Start a brief, or open the claims desk."
          body="Both paths are live. Neither is hidden. Payment increases and rankings are not guaranteed."
          primaryLabel="Start a project brief"
          secondary={{ to: "/claims", label: "Maximize a claim", variant: "claim" }}
        />
      </div>
    </main>
  );
}
