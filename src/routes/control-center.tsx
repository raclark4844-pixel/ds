import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Layers, Workflow } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { capabilities } from "@/lib/control-capabilities";
export const Route = createFileRoute("/control-center")({
  head: () =>
    pageHead({
      title: "AI Control Center | Demore Technology Solutions",
      description:
        "Explore multi-site AI coordination, independent review, approval gates, lead workflows, monitoring and cost controls in a guided capability preview.",
      path: "/control-center",
    }),
  component: ControlCenter,
});
const scenarios = [
  {
    name: "Improve a website",
    risk: "Low risk: analysis",
    steps: [
      "Inspect public pages and record evidence.",
      "Route findings to SEO, accessibility and performance specialists.",
      "Ask a separate reviewer to challenge the proposed changes.",
      "Prepare a preview, verify it, and request approval before publishing.",
    ],
  },
  {
    name: "Follow up with a lead",
    risk: "Medium risk: customer communication",
    steps: [
      "Capture an inquiry with its source and communication preferences.",
      "Check duplicates and route it to the right CRM owner.",
      "Prepare an email or SMS sequence within the approved policy.",
      "Verify consent, handoff and delivery before enabling sending.",
    ],
  },
  {
    name: "Release a site update",
    risk: "High risk: production changes",
    steps: [
      "Prepare a scoped change and a recoverable version.",
      "Run independent review, form checks and preview verification.",
      "Require owner approval tied to the exact reviewed change.",
      "Publish, check the live result and retain rollback evidence.",
    ],
  },
];
export function ControlCenter() {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const scenario = scenarios[selected];
  const filtered = capabilities.filter((b) =>
    (b.name + " " + b.purpose).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="kicker">Demore AI Control Center</p>
      <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold sm:text-6xl">
        One place to coordinate your websites and AI team.
      </h1>
      <p className="mt-6 max-w-3xl text-lg text-muted">
        Connect site knowledge, specialist bots, review, approvals and measurement around your
        business. Keep useful tools you already have, then add capabilities as each integration is
        verified.
      </p>
      <div className="mt-7 flex flex-wrap gap-4">
        <a href="#preview" className="rounded-lg bg-volt px-5 py-3 font-semibold text-black">
          Explore the preview
        </a>
        <Link to="/contact" className="rounded-lg border border-line px-5 py-3">
          Plan your system
        </Link>
        <Link to="/control-center-admin" className="px-2 py-3 text-volt">
          Administrator workspace →
        </Link>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {[
          {
            Icon: Layers,
            title: "Multiple sites, clear boundaries",
            body: "Each business has its own profile, knowledge, provider choices and integration readiness.",
          },
          {
            Icon: Workflow,
            title: "Specialists with a second opinion",
            body: "Route work to the right specialist and review the result independently before action.",
          },
          {
            Icon: ShieldCheck,
            title: "You control the release",
            body: "Low, medium and high-risk gates separate analysis, customer communication and production changes.",
          },
        ].map(({ Icon, title, body }) => (
          <article key={String(title)} className="rounded-2xl border border-line bg-surface p-6">
            {typeof Icon !== "string" && <Icon className="size-6 text-volt" />}
            <h2 className="mt-4 text-xl font-semibold">{String(title)}</h2>
            <p className="mt-3 text-muted">{String(body)}</p>
          </article>
        ))}
      </div>
      <section
        id="preview"
        className="mt-16 scroll-mt-24 rounded-2xl border border-line bg-surface p-5 sm:p-8"
      >
        <p className="kicker">Interactive workflow preview · illustrative data</p>
        <h2 className="mt-3 text-3xl font-semibold">See how a task moves toward action.</h2>
        <p className="mt-3 text-muted">
          This demonstration does not run bots, send messages, spend credits or change a website.
        </p>
        <div className="mt-6 flex flex-wrap gap-3" aria-label="Example workflows">
          {scenarios.map((s, i) => (
            <button
              key={s.name}
              type="button"
              aria-pressed={i === selected}
              onClick={() => setSelected(i)}
              className={
                "rounded-lg border px-4 py-3 " +
                (i === selected ? "border-volt text-volt" : "border-line text-muted")
              }
            >
              {s.name}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          <p className="mt-6 font-semibold text-volt">{scenario.risk}</p>
          <ol className="mt-5 grid gap-4 md:grid-cols-2">
            {scenario.steps.map((s, i) => (
              <li key={s} className="rounded-xl border border-line p-5">
                <span className="text-sm text-volt">0{i + 1}</span>
                <p className="mt-2">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mt-16">
        <p className="kicker">Capability library</p>
        <h2 className="mt-3 text-3xl font-semibold">A specialist for each part of the journey.</h2>
        <p className="mt-4 max-w-3xl text-muted">
          The framework covers search and AI-answer visibility (SEO, GEO and AEO), conversion
          optimization (CRO), content, reputation, social publishing, CRM, email/SMS, phone-agent
          management, compliance review, knowledge sync, analytics, costs and uptime. Individual
          services require configuration and validation before activation.
        </p>
        <label className="mt-6 block max-w-xl text-sm">
          Find a capability
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            className="mt-2 min-h-12 w-full rounded-lg border border-line bg-surface px-4"
            placeholder="Try CRM, review, content or performance"
          />
        </label>
        <p className="mt-3 text-sm text-muted" role="status">
          {filtered.length} of {capabilities.length} capabilities
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <article key={b.id} className="rounded-xl border border-line p-5">
              <h3 className="font-semibold">{b.name}</h3>
              <p className="mt-2 text-sm text-muted">{b.purpose}</p>
              <p className="mt-3 text-xs text-volt">Deliverable: {b.output}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Provider choice, with spending boundaries.</h2>
          <p className="mt-4 text-muted">
            The architecture supports OpenAI, xAI Grok, Anthropic Claude and Base44 integrations.
            Routing, independent review, usage records and budget reservations help make AI activity
            accountable. Provider subscriptions and API usage are separate costs; budgets are agreed
            per deployment.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Build on your existing website.</h2>
          <p className="mt-4 text-muted">
            Start with an audit and site profile, preserve existing content and working automations,
            connect approved services, then verify one workflow at a time. Restaurants, pubs, pizza
            shops, contractors and other businesses can tailor the knowledge and handoffs to their
            operation.
          </p>
        </div>
      </section>
      <section className="mt-14 rounded-xl border border-line p-6">
        <h2 className="text-xl font-semibold">Current rollout</h2>
        <p className="mt-3 text-muted">
          Read-only analysis and independent review have been tested in the owner-operated control
          center. This website provides a capability preview and an administrator readiness
          workspace. Hosted bot execution, customer messaging and unattended publishing are not
          activated by this page. The administrator lead inbox supports manual capture, separate
          business pipelines, duplicate checks, owner assignment and routing history.
        </p>
        <div className="mt-5 flex flex-wrap gap-5">
          <a className="text-volt underline" href="https://demoreexteriorsolutions.com/">
            Demore Exterior Solutions
          </a>
          <a className="text-volt underline" href="https://www.demoretechnologysolutions.com/">
            Demore Technology Solutions
          </a>
        </div>
      </section>
      <Link
        to="/contact"
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-volt px-5 py-3 font-semibold text-black"
      >
        Discuss your control center <ArrowRight className="size-4" />
      </Link>
    </main>
  );
}
