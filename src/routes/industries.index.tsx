import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { industries } from "@/lib/industries";
import { breadcrumbJsonLd, pageHead, serviceJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/industries/")({
  head: () => pageHead({
    title: "Industry Digital Growth Solutions | Demore Technology Solutions",
    description: "Industry-specific websites, SEO, GEO, AEO, CRO, lead generation, technical performance, analytics, and automation for contractors, service companies, hospitality, professional services, landscaping, and ecommerce.",
    path: "/industries",
  }),
  component: IndustriesIndex,
});

function IndustriesIndex() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Industries", path: "/industries" }])} />
      <JsonLd data={serviceJsonLd({
        name: "Industry digital growth solutions",
        description: "Industry-specific digital growth systems combining websites, SEO, GEO, AEO, CRO, lead generation, analytics, technical UX, and automation.",
        path: "/industries",
        serviceType: ["Website development", "SEO", "GEO", "AEO", "CRO", "Lead generation", "Marketing automation"],
      })} />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Industries</p>
        <h1 className="mt-4 max-w-4xl font-display text-[2.6rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">Same growth disciplines. Different buying behavior.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">Each industry page explains how Demore Technology Solutions applies websites, SEO, GEO, AEO, CRO, technical performance and UX, lead generation, analytics, and automation around the way that industry is actually discovered, evaluated, and purchased.</p>
        <div className="mt-8"><Button asChild size="lg"><Link to="/contact">Start a project brief</Link></Button></div>
      </header>
      <section className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => (
          <a key={industry.slug} href={`/industries/${industry.slug}`} className="rounded-xl border border-line bg-surface p-6 no-underline transition-colors hover:border-fg/30">
            <p className="kicker">Industry</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">{industry.label}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{industry.description}</p>
            <span className="mt-5 inline-block text-sm text-volt">Explore the strategy →</span>
          </a>
        ))}
      </section>
    </main>
  );
}
