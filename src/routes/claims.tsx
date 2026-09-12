import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, GeoQuote, Section } from "@/components/section";
import { claimsAnswer, claimsGeoQuote } from "@/lib/answers";
import { claimsFaqs } from "@/lib/site";
import { faqJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/claims")({
  head: () =>
    pageHead({
      title: "Insurance Claim Supplements | Demore Technology Solutions",
      description:
        "Document missed scope and pursue a more complete carrier payout. A supplement is a correction, not a fight. No guaranteed payment. Not a public adjuster unless licensed.",
      path: "/claims",
    }),
  component: ClaimsPage,
});

const missed = [
  {
    title: "Code items",
    body: "Matching, underlayment upgrades, ice-and-water, ventilation. First estimates often skip what the code actually requires.",
  },
  {
    title: "Access and height",
    body: "Steep, high, or tight work costs more to reach. That line is easy to omit and expensive to eat.",
  },
  {
    title: "Flashings",
    body: "Step, counter, pipe, chimney, wall. Water does not care that the estimate stopped at shingles.",
  },
  {
    title: "Waste",
    body: "Ridge, hip, starter, and waste factors. A tight waste number looks cheap until the dumpster fills.",
  },
  {
    title: "Hidden damage",
    body: "Deck, felt, drip, and what shows after tear-off. Document it. Do not invent it.",
  },
];

function ClaimsPage() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(claimsFaqs)} />
      <JsonLd
        data={serviceJsonLd({
          name: "Insurance claim supplements",
          description:
            "Documented corrections to first carrier estimates that missed scope. Not a guaranteed payout. Not public-adjuster status unless licensed.",
          path: "/claims",
          serviceType: "Insurance claim supplement documentation",
        })}
      />
      <PageHero
        kicker="Claims"
        title="A supplement is a documented correction, not a fight."
        lede={
          <p>
            Help homeowners and contractors document missed scope and pursue a
            more complete carrier payout. Payment is not guaranteed.
          </p>
        }
        primary={{ to: "/contact", label: "Maximize a claim", search: { need: "claims" } }}
        secondary={{ to: "/contact", label: "Start a project brief" }}
        media={{
          src: "/media/claims-planes.jpg",
          alt: "Sharp geometric planes on a near-black field, used as the visual for claim documentation.",
        }}
      />

      <GeoQuote>{claimsGeoQuote}</GeoQuote>

      <DirectAnswer question="What is an insurance claim supplement?">
        <p>{claimsAnswer}</p>
      </DirectAnswer>

      <Section
        kicker="Homeowners"
        title="You just had a storm. The first check is not the whole story."
      >
        <p className="max-w-2xl text-muted">
          Respect the mess. A supplement is paperwork that matches the roof,
          siding, or interior to what the policy actually covers. It is not a
          way to pad a claim. Demore Technology Solutions helps gather photos, line items,
          and notes a carrier can read. Policy limits, deductibles, and
          exclusions still apply. We do not invent damage. We do not promise a
          number.
        </p>
      </Section>

      <Section
        kicker="Contractors"
        title="Roofers, siders, remodelers. The estimate is the job."
      >
        <p className="max-w-2xl text-muted">
          Crews that handle insurance work live on what the carrier wrote, not
          on what the storm did. Missed scope becomes a fight on the driveway.
          Document it. Xactimate and Symbility / Cotality stay named tools, not
          magic. Service-area language is ready for city pages later. We do not
          claim public-adjuster status unless licensed in that state.
        </p>
      </Section>

      <Section kicker="Usual misses" title="What first estimates often omit.">
        <ul className="grid gap-4 sm:grid-cols-2">
          {missed.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="Legal limits" title="What this is not.">
        <ul className="max-w-2xl space-y-3 text-muted">
          <li>Not an insurer.</li>
          <li>Not a public adjuster unless licensed in that state.</li>
          <li>Not a guarantee of payment.</li>
          <li>Not a lesson in fabricating damage or inflating a claim.</li>
          <li>No invented recovery dollar amounts. No fake approval rates.</li>
        </ul>
        <p className="mt-6 max-w-2xl text-sm text-muted">
          File the{" "}
          <Link to="/contact" search={{ need: "claims" }} className="text-fg underline">
            project brief
          </Link>{" "}
          marked for insurance claim supplements.
        </p>
      </Section>

      <Section kicker="Questions" title="Direct answers.">
        <FaqList items={claimsFaqs} />
      </Section>

      <RelatedOffers current="/claims" />

      <div className="mt-16">
        <CtaBand
          kicker="Intake"
          title="Mark the brief for claim support."
          body="Consent on submit: this is a project brief, not a contract, and claim support does not guarantee a carrier will increase payment."
          primaryLabel="Maximize a claim"
          primaryNeed="claims"
          secondary={{ to: "/websites", label: "See websites and stores" }}
        />
      </div>
    </main>
  );
}
