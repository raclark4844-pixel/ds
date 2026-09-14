import { createFileRoute } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { IndustryLinks } from "@/components/industry-links";
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
      title: "Custom Websites, Ecommerce, Landing Pages, and Lead Capture | Demore Technology Solutions",
      description:
        "Custom websites, ecommerce, campaign landing pages, contractor sites, lead capture, analytics, and conversion-focused web systems built around how the business gets paid.",
      path: "/websites",
    }),
  component: WebsitesPage,
});

const kinds = [
  {
    title: "Marketing and lead-generation sites",
    body: "Custom sites that explain the offer, establish trust, answer buyer questions, and move qualified visitors toward a call, estimate, consultation, booking, or project brief. Page structure follows the sales process rather than a generic template.",
  },
  {
    title: "Online stores and ecommerce",
    body: "Catalog, product and service detail, variants, cart, checkout, pickup or shipping, payment integrations, and conversion-focused mobile flows. Ecommerce is treated as a transaction system, not a brochure with a buy button attached.",
  },
  {
    title: "Contractor and service-company websites",
    body: "Service pages, storm or campaign pages, project galleries, financing and estimate paths where appropriate, reviews and proof, territory or service-area content, and intake forms that collect enough information for a closer or dispatcher to act on the lead.",
  },
  {
    title: "Campaign and landing pages",
    body: "Focused pages for paid ads, social campaigns, seasonal offers, product launches, territory expansion, recruiting, or other specific campaigns. Message, form, tracking, and call to action stay aligned with the traffic source.",
  },
  {
    title: "Business portals and custom web tools",
    body: "Internal or customer-facing tools can be built when a business needs more than public marketing pages — including dashboards, intake systems, workflow interfaces, gated resources, and custom front ends connected to approved data and services.",
  },
  {
    title: "Website rebuilds and modernization",
    body: "Existing sites can be restructured for stronger mobile performance, clearer service architecture, better search visibility, cleaner analytics, stronger conversion paths, and easier integration with the business’s automation and lead-generation stack.",
  },
];

const stakes = [
  {
    title: "Architecture mapped to how you get paid",
    body: "Every major page should have a job in discovery, qualification, trust, conversion, or support. Custom means the structure reflects the business model and the customer journey.",
  },
  {
    title: "Mobile-first interaction",
    body: "Customers, crews, and business owners increasingly arrive from phones. Navigation, forms, calls to action, galleries, and checkout flows are designed to work cleanly on small screens.",
  },
  {
    title: "Lead capture with useful context",
    body: "Forms can collect service, location, project type, timeline, campaign source, and other information that helps the sales team respond intelligently instead of starting from zero.",
  },
  {
    title: "Analytics and conversion measurement",
    body: "Google Analytics, Search Console, conversion events, campaign tracking, and other measurement can be incorporated so the site can be improved based on real behavior and lead sources.",
  },
  {
    title: "Search and AI readability",
    body: "Page titles, headings, structured content, internal links, schema, service definitions, and direct-answer content can be built in from the start to support SEO, GEO, and AEO strategies.",
  },
  {
    title: "Automation-ready by design",
    body: "Forms, content destinations, tracking, reviews, social publishing, and other site actions can be structured so they connect cleanly to approved automation and lead-routing workflows later.",
  },
];

function WebsitesPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(websiteFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "Custom websites, ecommerce, landing pages, and lead capture",
          description: "Web systems mapped to how the client gets discovered, generates leads, and gets paid.",
          path: "/websites",
          serviceType: [
            "Website design",
            "Website development",
            "Ecommerce development",
            "Landing page development",
            "Lead capture systems",
          ],
        })}
      />
      <PageHero
        kicker="Websites and stores"
        title="Mapped to how you get discovered, how you sell, and how you get paid."
        lede={
          <p>
            Marketing sites, ecommerce, landing pages, contractor and service-company websites,
            lead capture, analytics, and custom web tools. The website is built as the center of the growth system — not as a disconnected brochure.
          </p>
        }
        primary={{ to: "/contact", label: "Start a project brief", search: { need: "website" } }}
        secondary={{ to: "/growth", label: "See AI marketing and lead generation" }}
        media={{
          src: "/media/digital-grid.jpg",
          alt: "Geometric grid on a near-black field, used as the visual for custom websites.",
        }}
      />

      <GeoQuote>{websiteGeoQuote}</GeoQuote>

      <DirectAnswer question="What does a custom tailored website include?">
        <p>{websiteCustomAnswer}</p>
      </DirectAnswer>

      <Section
        kicker="Website offerings"
        title="What gets built."
        lede="The site can be a marketing engine, a storefront, a campaign destination, a lead intake system, or a custom business interface depending on what the company needs it to do."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {kinds.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="What custom means" title="A site built to connect with the rest of the business.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stakes.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="Industries" title="See how the website strategy changes by industry.">
        <IndustryLinks />
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={websiteFaqs} />
      </Section>

      <RelatedOffers current="/websites" />

      <div className="mt-16">
        <CtaBand
          kicker="Next"
          title="Tell us what the website needs to make happen."
          body="The brief collects the industry, offer, pages, audience, brand, lead path, ecommerce needs, budget, and growth goals. Rankings and conversion lifts are not guaranteed."
          primaryLabel="Start a project brief"
          primaryNeed="website"
          secondary={{ to: "/growth", label: "See the growth stack" }}
        />
      </div>
    </main>
  );
}
