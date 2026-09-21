import { LeadEnginePreview } from "@/components/lead-engine-preview";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Check, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { CtaBand } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { FaqList } from "@/components/faq-list";
import { LeadIndustryExamples } from "@/components/lead-industry-examples";
import { leadLayers, workspaceModules, leadFaqs } from "@/lib/lead-generation-content";
import { pageHead, serviceJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo";

const description =
  "A Demore Technology Solutions lead-generation platform connecting websites, campaigns, customer records, lead review, conversations, handoffs, costs, and billing.";
export const Route = createFileRoute("/lead-generation")({
  head: () =>
    pageHead({
      title: "Lead Generation & Campaign Management | Demore Technology Solutions",
      description,
      path: "/lead-generation",
    }),
  component: LeadGeneration,
});
const workflow = [
  [
    "Plan the campaign",
    "Choose the customer, industry, territory, offer, schedule, lead goal, and requested channels.",
  ],
  [
    "Prepare and review",
    "Configure the source or import, prepare messaging, and review lead and contact readiness.",
  ],
  [
    "Manage conversations",
    "Review replies, clarify the need, and keep the conversation connected to its campaign.",
  ],
  [
    "Hand off and measure",
    "Deliver qualified opportunities to the right person, then review history, costs, and invoice records.",
  ],
];
const comparison = [
  [
    "Customer context",
    "Contact details scattered across spreadsheets and inboxes",
    "A customer profile connected to campaign records and contacts",
  ],
  [
    "Campaign setup",
    "Offers, lists, dates, and territories maintained separately",
    "A structured draft with industry, territories, goals, and preparation review",
  ],
  [
    "Lead review",
    "A list with unclear status and next steps",
    "Contact records, review evidence, and channel-readiness checks",
  ],
  [
    "Conversations",
    "Replies separated from their original campaign",
    "A shared campaign inbox with context and reviewed reply drafts",
  ],
  [
    "Team handoff",
    "A forwarded message with missing details",
    "A qualified handoff with the request and agreed contact details",
  ],
  [
    "Costs and delivery",
    "Separate invoices and incomplete activity records",
    "Campaign cost views, delivery history, and invoice records",
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
      <JsonLd data={faqJsonLd(leadFaqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Lead generation", path: "/lead-generation" },
        ])}
      />
      <section className="relative grid gap-10 overflow-hidden pt-12 sm:pt-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div>
          <p className="kicker">DEMORE TECHNOLOGY SOLUTIONS · LEAD GENERATION</p>
          <h1 className="mt-5 font-display text-[2.8rem] font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Find the opportunity.
            <br />
            <span className="text-volt">Connect every next step.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Bring your website, customer records, campaigns, conversations, and qualified handoffs
            into one connected growth system.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/contact" search={{ need: "leadgen" }}>
                Plan my lead-generation system
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#preview">
                Preview lead generation <ArrowDown className="ml-2 size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
          <a
            href="https://demore-lead-engine.vercel.app/api/website-signin/start"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted underline underline-offset-4"
          >
            <LockKeyhole className="size-4" aria-hidden="true" />
            Team workspace sign in
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5 sm:p-7">
          <p className="kicker text-faint">ONE CONNECTED CUSTOMER JOURNEY</p>
          <ol className="mt-6 space-y-3">
            {leadLayers.map((layer) => (
              <li
                key={layer.number}
                className={`flex items-center gap-5 rounded-lg border border-line border-t-2 ${layer.color} bg-bg p-4`}
              >
                <span className="font-display text-3xl text-faint">{layer.number}</span>
                <div>
                  <p className="font-display text-xl font-semibold">{layer.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {layer.number === "01"
                      ? "Search · content · campaigns"
                      : layer.number === "02"
                        ? "Answers · intake · clear offers"
                        : layer.number === "03"
                          ? "Conversations · qualification · handoffs"
                          : "History · costs · next decisions"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs leading-relaxed text-muted">
            Website and marketing services connect to a private campaign workspace. Integrations are
            scoped around your business.
          </p>
        </div>
      </section>
      <nav
        aria-label="Lead generation page sections"
        className="mt-10 flex flex-wrap gap-2 border-y border-line py-4"
      >
        {[
          ["#preview", "Interactive preview"],
          ["#campaign-access", "Campaign access"],
          ["#system", "The system"],
          ["#workspace", "Workspace features"],
          ["#workflow", "How it works"],
          ["#industries", "Industry examples"],
          ["#comparison", "Compare workflows"],
          ["#questions", "Questions"],
        ].map(([href, label]) => (
          <a
            className="inline-flex min-h-11 items-center rounded-pill border border-line px-4 text-sm text-muted hover:border-volt/60 hover:text-fg"
            href={href}
            key={href}
          >
            {label}
          </a>
        ))}
      </nav>
      <Section
        id="preview"
        className="scroll-mt-48"
        kicker="TRY THE WORKFLOW"
        title="See your next campaign take shape."
        lede="Browse current and past example campaigns together, or preview the first steps in a new campaign."
      >
        <LeadEnginePreview />
      </Section>
      <Section
        id="campaign-access"
        className="scroll-mt-48"
        kicker="ONE LOGIN. CONNECTED CAMPAIGNS."
        title="Start new work. Keep the full history in view."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Start a new campaign",
              body: "Choose the customer, industry, offer, territory, lead goals, and requested channels. Save a draft, then prepare and review it before any live activity.",
              path: "/campaigns/new",
              label: "New campaign",
            },
            {
              title: "Current and past, together",
              body: "Open all customers’ campaigns in one view, including drafts and previous activity. Narrow by customer and open a campaign to review its recorded status and history.",
              path: "/campaign-history",
              label: "View all campaigns",
            },
            {
              title: "Keep the next step connected",
              body: "Use the Lead Engine overview to move between customers, conversations, lead review, campaign sending, costs, and handoffs. Your existing account permissions apply.",
              path: "/operations",
              label: "Open Lead Engine",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="flex flex-col rounded-xl border border-line bg-surface p-6"
            >
              <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
              <p className="mt-3 mb-5 text-sm leading-relaxed text-muted">{item.body}</p>
              <Button asChild variant="outline" className="mt-auto self-start">
                <a
                  href={`https://demore-lead-engine.vercel.app/api/website-signin/start?next=${encodeURIComponent(item.path)}`}
                >
                  {item.label}
                </a>
              </Button>
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">
          Use your website login with the email on your active workspace account. Public visitors
          can explore the preview above; customer records and live campaign tools require sign-in.
        </p>
      </Section>
      <Section
        id="system"
        className="scroll-mt-24"
        kicker="THE COMPLETE SYSTEM"
        title="Attract. Convert. Follow up. Improve."
      >
        <p className="max-w-3xl text-muted">
          Your website introduces the offer. The lead workspace gives your team somewhere to
          organize the response. Connect those steps with the content, tools, and handoffs your
          business needs.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {leadLayers.map((layer) => (
            <article
              key={layer.number}
              className={`rounded-xl border border-line border-t-4 ${layer.color} bg-surface p-6`}
            >
              <p className="kicker text-faint">{layer.number}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{layer.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{layer.body}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          <Link to="/platform" className="text-volt underline underline-offset-4">
            Explore the complete AI-assisted platform
          </Link>{" "}
          for website, SEO, GEO, AEO, CRO, social content, and automation services.
        </p>
      </Section>
      <Section
        id="workspace"
        className="scroll-mt-24"
        kicker="INSIDE YOUR PRIVATE WORKSPACE"
        title="More of the workflow, in one place."
        lede="The customer database, campaign builder, inbox, lead handoffs, cost views, and administration work together around the same customer and campaign."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {workspaceModules.map((module, index) => (
            <article
              key={module.title}
              className="rounded-xl border border-line bg-surface p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="kicker text-volt">{module.category}</p>
                <span className="text-sm text-faint">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                {module.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{module.body}</p>
              <ul className="mt-5 space-y-3 border-t border-line pt-5">
                {module.details.map((detail) => (
                  <li key={detail} className="flex gap-3 text-sm text-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-volt" aria-hidden="true" />
                    {detail}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
      <Section
        id="workflow"
        className="scroll-mt-24"
        kicker="FROM CAMPAIGN DRAFT TO HANDOFF"
        title="A clear next step at every stage."
      >
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflow.map(([title, body], i) => (
            <li key={title} className="rounded-xl border border-line bg-elevated p-6">
              <span className="grid size-10 place-items-center rounded-full bg-volt text-black font-semibold">
                {i + 1}
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-xl border border-line p-6">
          <h3 className="font-medium">Your team stays in control.</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Campaign preparation, contact review, and staff approval remain part of the workflow.
            AI-assisted replies are drafts. Data providers, email, SMS, calling, verification, and
            AI services require configuration before their corresponding live features can run.
          </p>
        </div>
      </Section>
      <Section
        id="industries"
        className="scroll-mt-24"
        kicker="BUILT AROUND YOUR BUYER"
        title="See how the workflow fits your industry."
        lede="Choose an example to see the offer, the details worth capturing, and the handoff that helps your team respond."
      >
        <LeadIndustryExamples />
      </Section>
      <Section
        id="comparison"
        className="scroll-mt-24"
        kicker="WHY THE CONNECTION MATTERS"
        title="From scattered activity to a traceable workflow."
      >
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[660px] text-left text-sm">
            <caption className="sr-only">
              Typical disconnected workflow compared with a configured Demore Technology Solutions
              workspace
            </caption>
            <thead className="bg-elevated">
              <tr>
                <th scope="col" className="p-5">
                  Workflow
                </th>
                <th scope="col" className="p-5 font-medium text-muted">
                  When tools are disconnected
                </th>
                <th scope="col" className="p-5 font-medium text-volt">
                  With a configured Demore workspace
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([name, before, after]) => (
                <tr key={name} className="border-t border-line bg-surface">
                  <th scope="row" className="p-5 font-medium">
                    {name}
                  </th>
                  <td className="p-5 leading-relaxed text-muted">{before}</td>
                  <td className="p-5 leading-relaxed">{after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-faint">
          Illustrative workflow comparison. Features and integrations depend on the agreed scope and
          configuration.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/compare">Compare your current website</Link>
        </Button>
      </Section>
      <Section kicker="A PRACTICAL ROLLOUT" title="Build the useful pieces in the right order.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Foundation",
              "Website and offer review, customer records, industry choices, campaign structure, and measurement goals.",
            ],
            [
              "Lead workflow",
              "Source or import setup, lead review, qualification questions, inbox, staff roles, and handoff process.",
            ],
            [
              "Connected growth",
              "Approved sending, AI assistance, reporting, and wider website or marketing integrations as the workflow is ready.",
            ],
          ].map(([title, body]) => (
            <article key={title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section
        id="questions"
        className="scroll-mt-24"
        kicker="BEFORE YOU START"
        title="Your lead-generation questions, answered."
      >
        <FaqList items={leadFaqs} />
      </Section>
      <div className="mt-16">
        <CtaBand
          kicker="DEMORE TECHNOLOGY SOLUTIONS"
          title="Connect the next opportunity to the people who can act on it."
          body="Tell us about your business, current lead process, and the steps you want to bring together."
          primaryLabel="Plan my lead-generation system"
          primaryNeed="leadgen"
          secondary={{ to: "/platform", label: "Explore the complete platform" }}
        />
      </div>
    </main>
  );
}
