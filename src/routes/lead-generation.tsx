import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { pageHead, serviceJsonLd } from "@/lib/seo";

const description =
  "Demore Technology Solutions connects customer records, campaign planning, lead review, conversations, qualified handoffs, and campaign costs in one workspace.";
export const Route = createFileRoute("/lead-generation")({
  head: () =>
    pageHead({
      title: "Lead Generation & Campaign Management | Demore Technology Solutions",
      description,
      path: "/lead-generation",
    }),
  component: LeadGeneration,
});
const capabilities = [
  [
    "Customer and campaign workspace",
    "Keep customer details, offers, territories, industry choices, lead goals, and campaign history together.",
  ],
  [
    "Lead sourcing and review",
    "Work with configured data providers and approved imports. Review lead quality and contact readiness before outreach.",
  ],
  [
    "Conversations and qualification",
    "Organize replies in a shared inbox. AI-assisted drafts support staff review using approved business information.",
  ],
  [
    "Qualified handoffs",
    "Record the prospect’s needs and agreement to be contacted, then route the opportunity to the responsible team.",
  ],
  [
    "Costs and reporting",
    "Follow campaign activity, costs, lead handoffs, and invoice records while keeping their connection to the original campaign.",
  ],
  [
    "Controlled follow-up",
    "Prepare email, SMS, and calling workflows around approved messaging and configured services. Staff retain control of activation and sending.",
  ],
];
function LeadGeneration() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd
        data={serviceJsonLd({
          name: "Lead generation and campaign management",
          description,
          path: "/lead-generation",
          serviceType: [
            "Lead generation",
            "Campaign management",
            "Customer relationship management",
          ],
        })}
      />
      <PageHero
        kicker="DEMORE TECHNOLOGY SOLUTIONS"
        title="One workspace from first inquiry to qualified opportunity."
        lede="Connect customer records, campaign planning, lead review, conversations, and handoffs around the way your business wins work."
        primary={{
          to: "/contact",
          label: "Plan your lead-generation system",
          search: { need: "leadgen" },
        }}
        secondary={{ to: "/platform", label: "Explore the complete platform" }}
      />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button asChild variant="outline">
          <a href="https://demore-lead-engine.vercel.app/login">Workspace sign in</a>
        </Button>
        <p className="text-sm text-muted">Private access for your authorized team.</p>
      </div>
      <Section kicker="FROM INTEREST TO ACTION" title="Keep the next step clear.">
        <p className="max-w-3xl text-muted">
          A lead list is only the beginning. Demore Technology Solutions helps your team organize
          who to serve, what to offer, how to review opportunities, and when an inquiry is ready for
          a person to take over.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(([title, text]) => (
            <article className="rounded-xl border border-line bg-surface p-6" key={title}>
              <h3 className="font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section kicker="HOW IT WORKS" title="Plan → review → engage → hand off → measure">
        <div className="rounded-xl border border-line bg-elevated p-6 sm:p-8">
          <p className="leading-relaxed text-muted">
            Define the customer, industry, territory, and offer. Prepare an approved source or
            import, review records, and activate the appropriate communication channels when ready.
            Keep conversations, qualified opportunities, and costs tied to the same campaign.
          </p>
          <p className="mt-4 text-sm text-muted">
            Provider connections, customer-list imports, and communication services are configured
            for each implementation. Adding an industry category does not automatically supply
            contacts or activate messaging. Lead volumes and sales are not guaranteed.
          </p>
        </div>
      </Section>
      <Section kicker="INDUSTRY CATEGORIES" title="A workflow shaped around your business.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "restaurants",
              "Restaurants",
              "Catering inquiries, group dining, reservation requests, and permission-based guest follow-up.",
            ],
            [
              "pubs",
              "Pubs",
              "Private events, group bookings, community events, and organized inquiry follow-up.",
            ],
            [
              "pizza-shops",
              "Pizza Shops",
              "Group orders, catering, delivery-area inquiries, and permission-based repeat-customer campaigns.",
            ],
          ].map(([slug, title, text]) => (
            <a
              href={`/industries/${slug}`}
              key={slug}
              className="rounded-xl border border-line bg-surface p-6 no-underline hover:border-volt/60"
            >
              <h3 className="font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
              <span className="mt-5 inline-flex text-sm text-volt">Explore this industry →</span>
            </a>
          ))}
        </div>
        <p className="mt-6 text-muted">
          Also supports contractors, home services, landscaping, and other businesses.{" "}
          <Link to="/industries" className="text-volt underline">
            View all industries.
          </Link>
        </p>
      </Section>
      <Section
        kicker="CONNECTED TO YOUR WEBSITE"
        title="Give every inquiry somewhere useful to go."
      >
        <p className="max-w-3xl leading-relaxed text-muted">
          Plan your website’s inquiry forms, customer records, follow-up process, and staff handoff
          together. We scope integrations around your existing tools and the details your team needs
          to respond. Restaurant, pub, and pizza shop campaigns each have their own industry profile
          and relevant qualification questions.
        </p>
      </Section>
      <div className="mt-16">
        <CtaBand
          kicker="START WITH YOUR WORKFLOW"
          title="Build a clearer path from interest to opportunity."
          body="Tell us about your business, current lead process, and the next step you want to improve."
          primaryLabel="Plan your lead-generation system"
          primaryNeed="leadgen"
        />
      </div>
    </main>
  );
}
