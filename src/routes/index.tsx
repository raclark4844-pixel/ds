import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AssistantWebsiteReview } from "@/components/assistant-website-review";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { EMAIL } from "@/lib/site";
import { faqJsonLd, pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const TITLE = "Website Design, AI Bots & Lead Engine | Demore Tech";
const DESCRIPTION =
  "Custom website design, ecommerce, AI bots, growth marketing, and the Lead Engine campaign workspace. Based in Mentor, Ohio, serving clients nationwide.";

const LOCATION =
  "Based in Mentor, Ohio. We meet clients at their location or a convenient spot nearby, and work remotely nationwide.";
const PHONE_VISIBLE = "440-920-6133";
const PHONE_TEL = "tel:+14409206133";
const MAILTO = `mailto:${EMAIL}`;

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/",
    }),
  component: Home,
});

const serviceAreas = [
  {
    number: "01",
    title: "Website design and ecommerce",
    accent: "bg-hot",
    to: "/websites",
    label: "Explore website design",
    body: "Give your business a digital home that looks like you, explains what you offer, and makes the next step easy. We design new sites, refresh existing ones, and build online stores around the way your customers buy.",
    details: [
      "Custom design, mobile layouts, and clear navigation",
      "Service pages, product catalogs, menus, and campaign landing pages",
      "Contact forms, booking paths, checkout, and conversion tracking",
    ],
    outcome: "A clear path from first impression to inquiry, booking, or purchase.",
  },
  {
    number: "02",
    title: "Bots and business automation",
    accent: "bg-flare",
    to: "/automation",
    label: "Explore bots and automation",
    body: "Put useful assistants and repeatable workflows behind your website and daily operations. Connect customer questions, content preparation, lead intake, and follow-up to the tools your team already uses.",
    details: [
      "Website Q&A assistants and internal knowledge bots",
      "Lead routing, CRM handoffs, alerts, and follow-up tasks",
      "Social scheduling, AI-generated content drafts, and approval workflows",
    ],
    outcome: "Less repetitive work, with your team in control of what gets published and sent.",
  },
  {
    number: "03",
    title: "Lead Engine",
    accent: "bg-sun",
    to: "/lead-generation",
    label: "Explore Lead Engine",
    body: "The private campaign workspace that connects your website, campaigns, conversations, and qualified handoffs. Plan campaigns by industry and territory, review the leads that come in, manage replies, and hand opportunities to your team.",
    details: [
      "Customer records and campaign planning with territories and qualification questions",
      "Lead review, shared inbox for conversations, and qualified handoffs",
      "Campaign history, cost views, and team controls in one workspace",
    ],
    outcome: "A clear path from campaign draft to a qualified opportunity your team can act on.",
  },
  {
    number: "04",
    title: "Growth and search",
    accent: "bg-volt",
    to: "/growth",
    label: "Explore growth services",
    body: "Help the right people discover your business and understand why to choose it. This work covers search-engine optimization (SEO), visibility in AI-generated answers (GEO / AEO), local discovery, campaign content, and conversion-rate optimization (CRO).",
    details: [
      "SEO, local search, and AI-answer visibility",
      "Campaign content, social presence, and targeted landing pages",
      "CRO, analytics, and intake workflows",
    ],
    outcome: "A measurable customer journey from discovery through follow-up.",
  },
  {
    number: "05",
    title: "Custom tools and connected systems",
    accent: "bg-hot",
    to: "/platform",
    label: "Explore custom tools and systems",
    body: "Turn an idea or a manual process into a purpose-built web system. We use AI-assisted development to create connected websites, dashboards, portals, and workflows tailored to your business.",
    details: [
      "Custom dashboards, customer portals, and business workspaces",
      "AI-assisted content tools and connected marketing systems",
      "Forms, data, integrations, and workflows shaped around your process",
    ],
    outcome: "A system built around how your business works, with room to grow.",
  },
] as const;

const audiences = [
  {
    title: "Contractors and home-service companies",
    body: "service pages, galleries, estimate intake, local and service-area search structure, lead routing, and follow-up.",
  },
  {
    title: "Service businesses",
    body: "websites, booking or estimating flows, search visibility, content systems, and lead capture built around how the company sells.",
  },
  {
    title: "Online stores",
    body: "catalog, cart, checkout, product discovery, analytics, and conversion work that moves qualified traffic toward a purchase.",
  },
  {
    title: "Professional and growing businesses",
    body: "lead-generation websites, campaign pages, authority content, analytics, and workflow automation.",
  },
] as const;

const systemParts = [
  {
    title: "AI-assisted digital marketing",
    body: "campaign planning, content creation and reuse, landing-page improvements, and a consistent brand presence, with people retaining control of strategy, approvals, and final decisions.",
  },
  {
    title: "Campaign and intake systems",
    body: "campaign pages, forms, calls to action, tracking, and follow-up paths that turn traffic into qualified opportunities.",
  },
  {
    title: "Search and answer visibility",
    body: "SEO, GEO, AEO, technical performance, structured content, local and service-area signals, and direct-answer content.",
  },
  {
    title: "Social and content automation",
    body: "calendars, assisted drafts, approvals, and publishing workflows for channels such as Facebook, Instagram, Google Business Profile, TikTok, YouTube, LinkedIn, and X.",
  },
  {
    title: "Analytics and optimization",
    body: "Google Analytics, Search Console, conversion events, campaign measurement, and CRO testing based on what visitors actually do.",
  },
  {
    title: "Custom business automation",
    body: "bots, alerts, intake routing, review workflows, CRM handoffs, and integrations that connect the website to the rest of the business.",
  },
] as const;

const projectSteps = [
  {
    n: "01",
    title: "File a brief.",
    body: "Tell us who you serve, what you sell, what you want built, what is working now, and the business outcome the system needs to support. The minimum project budget is $600.",
  },
  {
    n: "02",
    title: "Pressure-test the offer.",
    body: "We review the offer, audience, conversion path, current website, search visibility, content, analytics, and automation opportunities before choosing build priorities.",
  },
  {
    n: "03",
    title: "Build the system.",
    body: "Sites, ecommerce, landing pages, growth optimization, analytics, content workflows, and automation are built as connected parts of the same customer journey.",
  },
  {
    n: "04",
    title: "Launch and improve.",
    body: "The system launches with crawlable structure, measurement, clear conversion paths, and a foundation for ongoing testing, content, and automation.",
  },
] as const;

const buildAnswer =
  "Custom websites and ecommerce, AI bots and business automation, growth and search work (SEO, GEO, AEO, and CRO), analytics, content and social workflows, and custom AI-assisted marketing and lead-generation systems, including the Lead Engine campaign workspace. You can start with one service or connect them so discovery, lead capture, follow-up, and measurement work as one system. AI can help with research, drafting, repurposing, analysis, and repetitive tasks; people keep control of strategy, approvals, brand, and final decisions.";

const whoAnswer =
  "Contractors, service companies, ecommerce businesses, professional practices, restaurants, pubs, pizza shops, other hospitality businesses, landscaping and outdoor-service companies, and other growing companies that want a connected digital growth system instead of disconnected tactics.";

const oneServiceAnswer =
  "Yes. Every service is available à la carte. You can also bring websites, growth, automation, and custom system work together when that better fits the business.";

const locationAnswer = `${LOCATION} Call ${PHONE_VISIBLE}.`;

const resultsAnswer =
  "No. Rankings, AI citations, traffic, lead volume, engagement, and conversion lifts are not guaranteed, and the site does not publish fake proof. Work and case studies will be added only when there is real work and permission to publish it.";

// The project-start answer states the published $600 minimum, so it stays
// visible and is left out of FAQPage. Schema has no Offer, price, or $600.
const schemaFaqs = [
  { q: "What does Demore Technology Solutions build?", a: buildAnswer },
  { q: "Who is Demore Technology Solutions for?", a: whoAnswer },
  { q: "Can I hire you for one service instead of a full connected system?", a: oneServiceAnswer },
  { q: "Where is Demore based, and do you work outside Ohio?", a: locationAnswer },
  { q: "Do you guarantee results or show case studies?", a: resultsAnswer },
] as const;

function linkedPhrase(text: string, phrase: string, href: "/contact" | "/work" | `tel:${string}`) {
  const index = text.indexOf(phrase);
  if (index < 0) return text;
  // prettier-ignore
  const link = href.startsWith("tel:")
    ? <a href={href} className="text-fg underline">{phrase}</a>
    : <Link to={href} className="text-fg underline">{phrase}</Link>;
  // prettier-ignore
  return <>{text.slice(0, index)}{link}{text.slice(index + phrase.length)}</>;
}

function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-display text-lg font-semibold tracking-tight text-fg marker:hidden [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span
          aria-hidden="true"
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-pill hairline text-muted transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="prose-answer mt-3 text-muted">{children}</div>
    </details>
  );
}

function Home() {
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <JsonLd data={faqJsonLd(schemaFaqs)} />
      <PageHero
        kicker="Demore Technology Solutions"
        title="Website design, AI bots, Lead Engine, and growth platforms that work as one system."
        lede={
          <p>
            Demore Technology Solutions designs custom websites, builds AI bots, improves search and
            campaign visibility, and creates connected systems that tie marketing to everyday
            operations. Start with one service, or combine them into one system.
          </p>
        }
        extraAction={
          <div className="flex w-full max-w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <Link to="/contact">Start a project brief</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="whitespace-normal text-center">
              <Link to="/platform">See how a connected system works</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="whitespace-normal text-center">
              <Link to="/compare">Compare your website</Link>
            </Button>
          </div>
        }
      />
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{LOCATION}</p>

      <Section
        id="services"
        title="Choose the service. Shape the system."
        lede="Website design, bots, Lead Engine, growth, and custom business tools each have a job. Use one of them, or connect the parts that fit your goals. Every service is available à la carte or as part of your connected system."
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {serviceAreas.map((service) => (
            <li
              key={service.number}
              className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8 md:last:odd:col-span-2"
            >
              <span
                aria-hidden="true"
                className={cn("absolute inset-x-0 top-0 h-1", service.accent)}
              />
              <p className="kicker text-muted">{service.number}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                {service.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">{service.body}</p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed">
                {service.details.map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className={cn("mt-2 size-1.5 shrink-0 rounded-full", service.accent)}
                    />
                    {detail}
                  </li>
                ))}
              </ul>
              <p className="mb-6 mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
                {service.outcome}
              </p>
              <Link
                to={service.to}
                className="mt-auto inline-flex items-center gap-2 self-start text-sm font-medium text-volt underline underline-offset-4"
              >
                {service.label}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Who this is for">
        <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-muted">
          <p>
            Demore Technology Solutions works with contractors and home-service companies,
            landscaping and outdoor-service businesses, restaurants, pubs, pizza shops and other
            hospitality businesses, professional practices, ecommerce stores, and other growing
            companies that need a connected digital system instead of disconnected tactics.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {audiences.map((item) => (
              <li key={item.title} className="rounded-xl border border-line bg-surface p-6 text-fg">
                <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">— {item.body}</p>
              </li>
            ))}
          </ul>
          <p>
            {"See industry-specific approaches on the "}
            <Link to="/industries" className="text-fg underline">
              Industries
            </Link>
            {
              " page. Engagement scope depends on the business, tools, integrations, data sources, and permissions available."
            }
          </p>
        </div>
      </Section>

      <Section title="A connected system, not a website surrounded by disconnected tools">
        <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <p>
            The website is the conversion hub. Search, content, campaigns, lead capture,
            measurement, and follow-up are designed around it as one system — not a brochure site
            with a pile of separate subscriptions.
          </p>
          <p>That system can include:</p>
        </div>
        <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {systemParts.map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-display text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">— {item.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
          <Link to="/platform" className="text-fg underline">
            See how a connected system works
          </Link>
          {" or "}
          <Link to="/compare" className="text-fg underline">
            compare your current website
          </Link>
          {"."}
        </p>
      </Section>

      <Section title="How a project starts">
        <ol className="grid gap-4 md:grid-cols-2">
          {projectSteps.map((item) => (
            <li key={item.n} className="rounded-xl border border-line bg-surface p-6">
              <p className="font-display text-sm text-volt">{item.n}</p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          {"Submitting a brief is not a contract. "}
          <Link to="/process" className="text-fg underline">
            See the full process
          </Link>
          {"."}
        </p>
      </Section>

      <Section title="Proof we will not invent">
        <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Demore Technology Solutions does not publish invented revenue, fake testimonials,
            borrowed logos, or fabricated traffic, lead, ranking, or conversion numbers. Rankings,
            AI citations, traffic, lead volume, engagement, and conversion lifts are not guaranteed.
          </p>
          <p>
            {"Case studies will appear on the "}
            <Link to="/work" className="text-fg underline">
              Work
            </Link>
            {
              " page when there is real, permissioned client work to show. Until then, the service, industry, and process pages explain the actual offer."
            }
          </p>
        </div>
      </Section>

      <Section title="Direct answers">
        <div className="divide-y divide-line border-y border-line">
          <FaqItem question="What does Demore Technology Solutions build?">
            <p>{buildAnswer}</p>
          </FaqItem>
          <FaqItem question="Who is Demore Technology Solutions for?">
            <p>{whoAnswer}</p>
          </FaqItem>
          <FaqItem question="Can I hire you for one service instead of a full connected system?">
            <p>{oneServiceAnswer}</p>
          </FaqItem>
          <FaqItem question="How does a project start?">
            {/* prettier-ignore */}
            <p>{linkedPhrase("Start with an industry-first project brief. It collects your industry, what you want built, current digital stack, goals, and a project budget (published minimum: $600). The brief is used to pressure-test scope and next steps. Submitting it is not a contract.", "project brief", "/contact")}</p>
          </FaqItem>
          <FaqItem question="Where is Demore based, and do you work outside Ohio?">
            {/* prettier-ignore */}
            <p>{linkedPhrase(locationAnswer, PHONE_VISIBLE, PHONE_TEL)}</p>
          </FaqItem>
          <FaqItem question="Do you guarantee results or show case studies?">
            {/* prettier-ignore */}
            <p>{linkedPhrase(resultsAnswer, "Work and case studies", "/work")}</p>
          </FaqItem>
        </div>
      </Section>

      <Section
        id="website-improvement-report"
        title="See how Demore could improve your website."
        lede="Add your website below for a downloadable PDF with practical recommendations for design, search visibility, measurement, and customer inquiries. Then ask Demore to help you understand the findings."
      >
        <div className="max-w-2xl rounded-xl border border-volt/30 bg-surface p-3 sm:p-5">
          <AssistantWebsiteReview />
          <p className="px-3 pt-3 text-xs leading-relaxed text-muted">
            No website? You can still explore our services and chat with Ask Demore. Reports review
            public website signals; recommendations are opportunities to verify and discuss.
          </p>
        </div>
      </Section>

      <section className="relative mt-16 overflow-hidden rounded-xl border border-line bg-elevated px-6 py-10 sm:mt-24 sm:px-10 sm:py-14">
        <div aria-hidden="true" className="orb -right-16 -top-16 size-56 bg-hot/30" />
        <div
          aria-hidden="true"
          className="orb -bottom-20 left-10 size-48 bg-volt/20"
          style={{ animationDelay: "-6s" }}
        />
        <h2 className="relative max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
          Start a project brief
        </h2>
        <p className="relative mt-4 max-w-xl text-muted">
          Tell us what needs to be built, what needs to be measured, and what needs to be automated.
        </p>
        <p className="relative mt-4 max-w-xl text-muted">{LOCATION}</p>
        <div className="relative mt-8">
          <Button asChild size="lg">
            <Link to="/contact">Start a project brief</Link>
          </Button>
        </div>
        <div className="relative mt-8 space-y-2 text-sm leading-relaxed">
          <p className="font-medium text-fg">Talk with Ryan Bomer</p>
          <p>
            {"Email: "}
            <a href={MAILTO} className="text-fg underline">
              {EMAIL}
            </a>
          </p>
          <p>
            {"Phone: "}
            <a href={PHONE_TEL} className="text-fg underline">
              {PHONE_VISIBLE}
            </a>
          </p>
        </div>
        <p className="relative mt-6 max-w-xl text-sm leading-relaxed text-muted">
          {"You can also "}
          <Link to="/compare" className="text-fg underline">
            compare your website
          </Link>
          {", "}
          <button
            type="button"
            className="text-fg underline"
            onClick={() => window.dispatchEvent(new CustomEvent("demore:open-review"))}
          >
            chat with Ask Demore
          </button>
          {", or "}
          <Link to="/control-center" className="text-fg underline">
            preview the AI Control Center
          </Link>
          {"."}
        </p>
      </section>
      <p className="mt-8 text-xs text-faint">© 2026 Demore Technology Solutions LLC</p>
    </main>
  );
}
