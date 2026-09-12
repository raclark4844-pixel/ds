import { createFileRoute } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { websiteCustomAnswer, websiteGeoQuote } from "@/lib/answers";
import { websiteFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/websites")({
  head: () =>
    pageHead({
      title: "Custom Websites and Online Stores | Demore Technology Solutions",
      description:
        "Custom websites and online stores for contractors, service companies, and retailers. Architecture follows how you get paid. Start a project brief.",
      path: "/websites",
    }),
  component: WebsitesPage,
});

const kinds = [
  {
    title: "Marketing sites",
    body: "State the offer, prove you can do it, move a qualified person into a conversation. Pages follow the buyer’s questions, not an agency leftover sitemap.",
  },
  {
    title: "Online stores",
    body: "A store is a payment path. Catalog, variant, cart, checkout, pickup or ship. If a product cannot be bought on a phone with a thumb, the store is not done.",
  },
  {
    title: "Contractor and service sites",
    body: "Storm pages, service pages, galleries that load, and an intake a closer can read one-handed from a driveway. City-ready language for market pages later.",
  },
];

const stakes = [
  {
    title: "Architecture mapped to how you get paid",
    body: "Every page has to earn a place in how the client gets paid. Custom is a constraint, not a synonym for expensive.",
  },
  {
    title: "Mobile navigation that works one-handed",
    body: "Crews tap from a truck. Homeowners tap from a driveway. If it needs two hands, it is not done.",
  },
  {
    title: "Forms that collect facts a closer needs",
    body: "Name-and-email dead ends waste a lead. The brief on this site is the working sample.",
  },
  {
    title: "Speed and accessibility as table stakes",
    body: "The page loads, reads, and taps like a tool. Contrast that still keeps the fluorescents.",
  },
];

function WebsitesPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(websiteFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "Custom websites and online stores",
          description: "Sites and stores mapped to how the client gets paid.",
          path: "/websites",
          serviceType: ["Website design", "Ecommerce development"],
        })}
      />
      <PageHero
        kicker="Websites and stores"
        title="Mapped to how you get paid. Not a leftover theme."
        lede={
          <p>
            Marketing sites, ecommerce, contractor and service sites. Custom
            means the information architecture follows the job.
          </p>
        }
        primary={{ to: "/contact", label: "Start a project brief", search: { need: "website" } }}
        secondary={{ to: "/claims", label: "Maximize a claim", variant: "claim" }}
        media={{
          src: "/media/digital-grid.jpg",
          alt: "Geometric grid on a near-black field, used as the visual for custom websites.",
        }}
      />

      <GeoQuote>{websiteGeoQuote}</GeoQuote>

      <DirectAnswer question="What does a custom tailored website include?">
        <p>{websiteCustomAnswer}</p>
      </DirectAnswer>

      <Section kicker="Kinds" title="What gets built.">
        <ul className="grid gap-4 md:grid-cols-3">
          {kinds.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="Table stakes" title="What custom actually means.">
        <ul className="grid gap-4 sm:grid-cols-2">
          {stakes.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={websiteFaqs} />
      </Section>

      <RelatedOffers current="/websites" />

      <div className="mt-16">
        <CtaBand
          kicker="Next"
          title="Tell us how you get paid."
          body="The brief collects pages, brand, and the buyer. Rankings and conversion lifts are not guaranteed."
          primaryLabel="Start a project brief"
          primaryNeed="website"
          secondary={{ to: "/growth", label: "See the growth stack" }}
        />
      </div>
    </main>
  );
}
