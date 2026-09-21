import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { Section } from "@/components/section";
import { industries, type IndustryProfile } from "@/lib/industries";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/seo";

export function IndustryPage({ industry }: { industry: IndustryProfile }) {
  const path = `/industries/${industry.slug}`;
  const factors = [
    ["SEO", industry.seo],
    ["GEO", industry.geo],
    ["AEO", industry.aeo],
    ["CRO", industry.cro],
    ["Technical performance & UX", industry.performance],
    ["Automation", industry.automation],
    ["Lead generation", industry.leadGen],
  ] as const;

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
          { name: industry.label, path },
        ])}
      />
      <JsonLd
        data={serviceJsonLd({
          name: `${industry.label} digital growth systems`,
          description: industry.description,
          path,
          serviceType: [
            "Website development",
            "SEO",
            "GEO",
            "AEO",
            "CRO",
            "Lead generation",
            "Marketing automation",
          ],
        })}
      />

      <header className="pt-10 sm:pt-16">
        <p className="kicker">Industry solutions</p>
        <h1 className="mt-4 max-w-4xl font-display text-[2.6rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">
          A custom AI-assisted growth platform for {industry.label.toLowerCase()}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">
          {industry.intro} Demore connects the website, visibility, content, campaigns, lead
          capture, analytics, and automation around that buying journey.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-faint">
          <span className="text-fg">Built for:</span> {industry.audience}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/contact" search={{ industry: industry.label, need: "platform" }}>
              Build my platform
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/platform">Why the platform is different</Link>
          </Button>
        </div>
      </header>

      <Section
        kicker="One industry-specific system"
        title="More than a website. More useful than disconnected marketing services."
      >
        <p className="max-w-3xl text-base leading-relaxed text-muted">
          The platform can include a custom website or ecommerce, SEO, GEO, AEO, CRO, technical
          performance, content, social publishing, campaign pages, lead qualification, analytics,
          CRM handoffs, review workflows, and AI-assisted automation. Each piece is scoped around{" "}
          {industry.label.toLowerCase()} customers and can also be purchased à la carte.
        </p>
        <Link
          to="/platform"
          className="mt-5 inline-flex text-sm font-medium text-volt underline underline-offset-4"
        >
          See the platform comparison
        </Link>
      </Section>

      <Section
        kicker="How we maximize the system"
        title={`SEO, GEO, AEO, CRO, performance, leads, and automation for ${industry.label.toLowerCase()}.`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {factors.map(([title, body]) => (
            <article key={title} className="rounded-xl border border-line bg-surface p-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="Connected system" title="The pieces work together.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/websites"
            className="rounded-xl border border-line bg-elevated p-5 no-underline hover:border-fg/30"
          >
            <h3 className="font-display text-xl font-semibold">Websites</h3>
            <p className="mt-2 text-sm text-muted">
              Conversion-focused pages, ecommerce, landing pages, forms, and technical foundations.
            </p>
          </Link>
          <Link
            to="/growth"
            className="rounded-xl border border-line bg-elevated p-5 no-underline hover:border-fg/30"
          >
            <h3 className="font-display text-xl font-semibold">Growth</h3>
            <p className="mt-2 text-sm text-muted">
              SEO, GEO, AEO, CRO, analytics, visibility, and lead-generation strategy.
            </p>
          </Link>
          <Link
            to="/automation"
            className="rounded-xl border border-line bg-elevated p-5 no-underline hover:border-fg/30"
          >
            <h3 className="font-display text-xl font-semibold">Automation</h3>
            <p className="mt-2 text-sm text-muted">
              AI-assisted marketing, content, routing, CRM handoffs, and repeatable workflows.
            </p>
          </Link>
          <Link
            to="/work"
            className="rounded-xl border border-line bg-elevated p-5 no-underline hover:border-fg/30"
          >
            <h3 className="font-display text-xl font-semibold">Work</h3>
            <p className="mt-2 text-sm text-muted">
              Real, permissioned project examples as they become available.
            </p>
          </Link>
          <Link
            to="/process"
            className="rounded-xl border border-line bg-elevated p-5 no-underline hover:border-fg/30"
          >
            <h3 className="font-display text-xl font-semibold">Process</h3>
            <p className="mt-2 text-sm text-muted">
              Brief, discovery, scope, build, quality review, launch, measurement, and iteration.
            </p>
          </Link>
          <Link
            to="/contact"
            search={{ industry: industry.label, need: "platform" }}
            className="rounded-xl border border-volt/40 bg-volt-dim p-5 no-underline"
          >
            <h3 className="font-display text-xl font-semibold text-volt">
              Build the complete platform
            </h3>
            <p className="mt-2 text-sm text-muted">
              Send the industry, goals, budget, current website, lead flow, and systems you want
              connected.
            </p>
          </Link>
        </div>
      </Section>

      <Section kicker="Campaign workspace" title="Keep inquiries and follow-up together.">
        <p className="text-muted">
          Organize customers, campaigns, lead review, conversations, qualified handoffs, and
          campaign costs in the Demore Technology Solutions workspace.
        </p>
        <Link
          to="/lead-generation"
          className="mt-4 inline-flex text-volt underline underline-offset-4"
        >
          Explore lead generation and campaign management
        </Link>
      </Section>

      <Section kicker="Other industries" title="Explore another industry.">
        <div className="flex flex-wrap gap-2">
          {industries
            .filter((item) => item.slug !== industry.slug)
            .map((item) => (
              <Button key={item.slug} asChild variant="outline" size="sm">
                <a href={`/industries/${item.slug}`}>{item.label}</a>
              </Button>
            ))}
        </div>
      </Section>
    </main>
  );
}
