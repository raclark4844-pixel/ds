import { Link } from "@tanstack/react-router";
import { CtaBand } from "@/components/cta-band";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { PageCrumbs } from "@/components/page-crumbs";
import { RelatedOffers } from "@/components/related-offers";
import { DirectAnswer, Section } from "@/components/section";
import { IndustryTiles } from "@/components/industry-tiles";
import type { Industry } from "@/lib/industries";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";

export function IndustryPage({ industry }: { industry: Industry }) {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(industry.faqs)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Industries", path: "/industries" },
          { name: industry.h1, path: industry.path },
        ])}
      />
      <JsonLd
        data={serviceJsonLd({
          name: `${industry.title} websites`,
          description: `Custom website, intake, automation, and growth stack for ${industry.title.toLowerCase()}.`,
          path: industry.path,
          serviceType: `Custom website, intake, automation, and growth stack for ${industry.title.toLowerCase()}.`,
        })}
      />

      <header className="pt-10 sm:pt-16">
        <PageCrumbs
          items={[
            { to: "/", label: "Home" },
            { to: "/industries", label: "Industries" },
            { label: industry.h1 },
          ]}
        />
        <p className="kicker mt-8">Industry</p>
        <h1 className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">
          {industry.h1}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{industry.sub}</p>
      </header>

      <DirectAnswer question={industry.question}>
        <p>{industry.answer}</p>
      </DirectAnswer>

      <Section kicker="Must do" title="What this sector’s site has to do">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industry.mustDo.map((item) => (
            <article key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="What we build" title="Site, bots, and the growth stack">
        <div className="grid gap-4 md:grid-cols-3">
          {industry.build.map((item) => (
            <article key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section kicker="What this is not" title="Anti-template. No fake proof.">
        <ul className="max-w-2xl space-y-3 text-muted">
          {industry.not.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Section>

      <Section kicker="Pages that usually ship" title="What typically goes live">
        <ul className="flex flex-wrap gap-2">
          {industry.pages.map((page) => (
            <li
              key={page}
              className="rounded-pill border border-line px-3 py-2 text-sm text-muted"
            >
              {page}
            </li>
          ))}
        </ul>
      </Section>

      <Section kicker="The brief" title="How this brief should be marked">
        <p className="max-w-2xl text-muted">{industry.briefHow}</p>
        <p className="mt-4 max-w-2xl text-sm text-faint">
          Rankings, AI citations, and conversion lifts are not guaranteed.
        </p>
      </Section>

      <Section kicker="Questions" title="FAQ">
        <FaqList items={industry.faqs} />
      </Section>

      <div className="mt-16">
        <CtaBand
          kicker="Start"
          title={`File a ${industry.footerLabel.toLowerCase()} brief.`}
          body="Digital only. A project brief, not a contract."
          primaryLabel={`File a ${industry.footerLabel.toLowerCase()} brief`}
          primaryNeed="website"
          primaryIndustry={industry.slug}
          secondary={{ to: "/industries", label: "All industries" }}
        />
      </div>

      <Section kicker="Tied to the rest of the shop" title="Also on this site">
        <p className="max-w-2xl text-muted">
          <Link to="/websites" className="text-fg underline">
            See websites
          </Link>
          {" · "}
          <Link to="/automation" className="text-fg underline">
            See automation
          </Link>
          {" · "}
          <Link to="/growth" className="text-fg underline">
            See growth
          </Link>
          {" · "}
          <Link to="/industries" className="text-fg underline">
            All industries
          </Link>
          .
        </p>
        <div className="mt-8">
          <RelatedOffers current={industry.path} />
        </div>
        <div className="mt-8">
          <IndustryTiles current={industry.path} />
        </div>
      </Section>
    </main>
  );
}
