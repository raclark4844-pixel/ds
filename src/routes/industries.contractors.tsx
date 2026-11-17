import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { faqJsonLd, pageHead } from "@/lib/seo";
import { COUNTRY, EMAIL, SITE_URL } from "@/lib/site";

const title = "Digital Marketing for Contractors | Demore Technology Solutions";
const description =
  "Digital marketing for contractors: websites, local search, estimate requests, and follow-up automation. Based in Mentor, Ohio. Serving clients nationwide.";
const path = "/industries/contractors";
const pageUrl = `${SITE_URL}${path}`;

const inlineLink =
  "font-medium text-volt underline decoration-volt/40 underline-offset-4 hover:decoration-volt";

type PageHref =
  | "/contact"
  | "/websites"
  | "/growth"
  | "/compare"
  | "/automation"
  | "/platform"
  | "/process"
  | "/work"
  | "/industries/landscaping"
  | "/industries/service-companies";

const tradesQuestion = "Which trades do you build this for?";

const contractorFaqs = [
  {
    q: "What does digital marketing for contractors include at Demore Technology Solutions?",
    a: "It can include contractor websites and ecommerce, local and service-area SEO, visibility in AI-generated answers (GEO / AEO), conversion-rate work on estimate and campaign pages, Google Business Profile and review workflows, campaign or storm pages, lead intake, analytics, and follow-up automation. You can start with one service or connect them as one system.",
  },
  {
    q: "Do you design contractor websites, or only run ads and SEO?",
    a: "Website design for contractors is a core offer, not an add-on. Sites can include service pages, project galleries, service-area content, storm or campaign pages, financing or estimate paths, and intake forms a closer or dispatcher can act on. Growth, automation, and platform work can be added or purchased separately.",
  },
  {
    q: "How does contractor lead generation work in this system?",
    a: "Contractor lead generation here means making the path from local search, profiles, reviews, campaigns, or referrals to an estimate request measurable and usable. That can include landing pages, calls to action, estimate forms, conversion tracking, and routing into the office or CRM.",
  },
  {
    q: "Can this help with missed calls, after-hours inquiries, and quote follow-up?",
    a: "Yes, as scoped workflows. Intake forms, alerts, website Q&A assistants, CRM handoffs, and follow-up tasks can record and assign estimate requests when the crew cannot pick up. After-hours intake can be part of a project when the needed tools and permissions are available.",
  },
  {
    q: tradesQuestion,
    a: "The live offer is built for roofing, siding, gutters, windows, remodeling, HVAC, plumbing, electrical, restoration, concrete, fencing, decking, painting, and other home-service contractor businesses. Landscaping-first companies should see the landscaping and outdoor services page. Broader service companies that are not trades contractors should see service companies.",
  },
  {
    q: "Do you only work with contractors in Mentor and Lake County, Ohio?",
    a: "No. Demore Technology Solutions is based in Mentor, Lake County, Ohio, and serves contractors nationwide, including remote engagements. Local and service-area SEO is still built around the markets the contractor actually serves.",
  },
  {
    q: "Do you guarantee more estimate requests or higher Google rankings?",
    a: "No. Rankings, AI citations, traffic, lead volume, engagement, and conversion lifts are not guaranteed. Demore also does not publish fake reviews, borrowed logos, or invented performance numbers.",
  },
] as const;

const websiteIncludes = [
  "Service pages for trades such as roofing, siding, gutters, windows, and remodeling, written around the offer and the local service area rather than a generic template",
  "Project galleries and proof that can sit next to reviews, not in a disconnected album",
  "Storm or seasonal campaign pages, plus financing or estimate paths where those are part of how the company sells",
  "Territory and service-area content so homeowners can tell whether the contractor actually works where they live",
  "Intake forms that collect enough detail for a closer or dispatcher to act—not a blank “contact us” box that stalls the lead",
  "Ecommerce, booking, or checkout only when the business actually sells products or packaged work that way",
] as const;

const localSeoIncludes = [
  "Local and service-area search structure, internal linking, and technical performance",
  "Visibility in traditional search and in AI-generated answers (GEO / AEO), plus conversion-rate optimization (CRO) on estimate and campaign pages",
  "Google Business Profile support, including approved posts, photos, service information, and other profile updates when permissions and integrations allow",
  "Review workflows that surface new reviews, notify the team, and help reuse permitted review content on the website and social channels",
  "Analytics through tools such as Google Analytics and Search Console, so the company can see which pages and campaigns lead to inquiries",
] as const;

const leadIncludes = [
  "Estimate and campaign forms that route into email, alerts, dashboards, or a CRM, including routing by trade, territory, campaign, or urgency when that information is captured",
  "Website Q&A assistants that answer common questions and hand the conversation to the team, with people still in control of what gets said",
  "Follow-up tasks and CRM handoffs so quote follow-up is a workflow, not a memory",
  "After-hours intake and notification paths so an inquiry is recorded and assigned even when no one can pick up immediately",
  "Content and social scheduling, with approval workflows, so storm or seasonal updates can be prepared without posting unreviewed claims",
] as const;

const platformOffers = [
  {
    name: "Contractor websites and ecommerce",
    detail: "the digital home for services, galleries, service areas, and estimate requests",
  },
  {
    name: "Growth and search",
    detail:
      "local SEO for contractors, GEO, AEO, CRO, campaigns, analytics, and Google Business Profile support",
  },
  {
    name: "Bots and automation",
    detail:
      "assistants, lead routing, quote follow-up, review workflows, and approved social or content publishing",
  },
  {
    name: "Custom AI platforms",
    detail:
      "dashboards, portals, and connected marketing systems shaped around how the contractor actually sells and schedules work",
  },
] as const;

const projectSteps = [
  {
    lead: "File a brief.",
    body: "Tell us the trades you offer, the service area you cover, what you want built, and what happens today when an estimate request comes in. The minimum project budget is $400.",
  },
  {
    lead: "Pressure-test the offer.",
    body: "We review the offer, service area, current website, local search and profile presence, reviews, intake path, and follow-up before choosing build priorities.",
  },
  {
    lead: "Build the system.",
    body: "Contractor websites, landing pages, visibility work, analytics, content workflows, and automation are built as connected parts of the same estimate journey—or as the à la carte pieces you chose.",
  },
  {
    lead: "Launch and improve.",
    body: "The system launches with crawlable structure, measurement, clear estimate paths, and a foundation for ongoing testing and follow-up.",
  },
] as const;

export const Route = createFileRoute("/industries/contractors")({
  head: () => pageHead({ title, description, path }),
  component: ContractorsPage,
});

function InlineLink({ to, children }: { to: PageHref; children: ReactNode }) {
  return (
    <Link to={to} className={inlineLink}>
      {children}
    </Link>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid max-w-3xl gap-3">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-xl border border-line bg-surface px-5 py-4 text-sm leading-relaxed text-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function LinkedTradesAnswer({ answer }: { answer: string }) {
  const landscaping = "landscaping and outdoor services";
  const serviceLabel = "service companies";
  const landscapingAt = answer.indexOf(landscaping);
  const serviceAt = answer.lastIndexOf(serviceLabel);
  if (landscapingAt < 0 || serviceAt < landscapingAt) {
    return <p className="prose-answer mt-3 text-muted">{answer}</p>;
  }
  return (
    <p className="prose-answer mt-3 text-muted">
      {answer.slice(0, landscapingAt)}
      <InlineLink to="/industries/landscaping">{landscaping}</InlineLink>
      {answer.slice(landscapingAt + landscaping.length, serviceAt)}
      <InlineLink to="/industries/service-companies">{serviceLabel}</InlineLink>
      {answer.slice(serviceAt + serviceLabel.length)}
    </p>
  );
}

function ContractorsPage() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            {
              "@type": "ListItem",
              position: 2,
              name: "Industries",
              item: `${SITE_URL}/industries`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Contractors & Home Services",
              item: pageUrl,
            },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${pageUrl}#service`,
          name: "Digital marketing for contractors",
          serviceType: "Digital marketing for contractors",
          url: pageUrl,
          areaServed: { "@type": "Country", name: COUNTRY },
          provider: { "@id": `${SITE_URL}/#organization` },
        }}
      />
      <JsonLd data={faqJsonLd(contractorFaqs)} />

      <header className="pt-10 sm:pt-16">
        <p className="kicker">Contractors & Home Services</p>
        <h1 className="mt-4 max-w-4xl font-display text-[2.6rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl">
          Websites, lead generation, and digital marketing for contractors
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">
          Homeowners look for contractors in local search, on Google Business Profile, through
          reviews, and after storms or seasonal damage. Referrals, paid campaigns, and social posts
          still have to become estimate requests and a sales conversation the office can follow.
          Demore Technology Solutions builds contractor websites, local search and review support,
          lead intake, and follow-up automation around that journey—à la carte or as one connected
          system.
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-faint">
          <span className="text-fg">Built for:</span> roofing, siding, gutters, windows, remodeling,
          HVAC, plumbing, electrical, restoration, concrete, fencing, decking, painting, and other
          home-service contractor businesses listed on this site.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg">
            <Link to="/contact">Start a project brief</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/compare">Compare your current website</Link>
          </Button>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
          See contractor <InlineLink to="/websites">website</InlineLink> and{" "}
          <InlineLink to="/growth">growth</InlineLink> options
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-faint">
          Based in Mentor, Lake County, Ohio. Serving contractors nationwide, including remote
          engagements.
        </p>
      </header>

      <Section title="How homeowners find contractors now">
        <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted">
          <p>
            A homeowner who needs a roof, siding, windows, or a remodel rarely starts with a cold
            call to a company they cannot verify. They search for a trade in their service area,
            open Google Business Profile listings, read reviews, scan project photos, and often
            compare two or three companies before requesting an estimate. Seasonal weather and storm
            events can create sudden demand. Social posts and referrals still matter, but they
            usually send people back to the same checks: is this contractor in the area, does the
            work look real, and is it easy to ask for a quote?
          </p>
          <p>
            Digital marketing for contractors should support that path, not just decorate it. That
            means contractor websites with clear service and service-area pages, local SEO and
            AI-answer visibility (SEO, GEO, and AEO), review and profile workflows, campaign or
            storm pages where they fit, and intake that a closer or dispatcher can actually use.
          </p>
        </div>
      </Section>

      <Section title="Contractor websites designed around estimate requests">
        <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted">
          <p>
            Website design for contractors should follow how the job is sold. Visitors need to see
            the trade, the service area, recent work, and a straightforward way to request an
            estimate—on a phone, after hours, or in the middle of a busy season.
          </p>
          <p>A contractor website from Demore can include:</p>
        </div>
        <div className="mt-4">
          <BulletList items={websiteIncludes} />
        </div>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">
          The website is the conversion hub for contractor lead generation. Search, campaigns,
          reviews, and automation should point back to it. Explore{" "}
          <InlineLink to="/websites">contractor-focused website work</InlineLink> or start with the{" "}
          <InlineLink to="/contact">project brief</InlineLink>.
        </p>
      </Section>

      <Section title="Local SEO for contractors, Google Business Profile, and reviews">
        <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted">
          <p>
            Local SEO for contractors is about being discoverable in the service area when someone
            is ready to request an estimate—and being clear enough, on the site and in profiles,
            that the homeowner understands what the company does.
          </p>
          <p>Growth work for home service contractor marketing can include:</p>
        </div>
        <div className="mt-4">
          <BulletList items={localSeoIncludes} />
        </div>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">
          Demore does not guarantee rankings, AI citations, review volume, or a lift in estimate
          requests. <InlineLink to="/growth">Explore growth and local search services</InlineLink>.
        </p>
      </Section>

      <Section title="Contractor lead generation, missed inquiries, and quote follow-up">
        <div className="max-w-3xl space-y-4 text-base leading-relaxed text-muted">
          <p>
            Many contractor leads are lost after the click: a call comes in while the crew is on a
            roof, an estimate form sits in a shared inbox, or a quoted job is never followed up.
            Home service contractor marketing has to connect the inquiry to the people who sell the
            work.
          </p>
          <p>Demore can help build contractor lead generation around:</p>
        </div>
        <div className="mt-4">
          <BulletList items={leadIncludes} />
        </div>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">
          After-hours intake and notifications can be added to the same automation workflow.{" "}
          <InlineLink to="/automation">Explore bots and automation</InlineLink>.
        </p>
      </Section>

      <Section title="A custom AI-assisted platform—or one contractor service at a time">
        <p className="max-w-3xl text-base leading-relaxed text-muted">
          Some contractors only need a better website. Others need local SEO, review workflows, and
          follow-up connected to the same estimate path. Demore’s offers can be purchased à la carte
          or combined into a custom AI-assisted growth platform:
        </p>
        <ul className="mt-4 grid max-w-3xl gap-3">
          {platformOffers.map((offer) => (
            <li
              key={offer.name}
              className="rounded-xl border border-line bg-surface px-5 py-4 text-sm leading-relaxed text-muted"
            >
              <strong className="font-display text-base font-semibold tracking-tight text-fg">
                {offer.name}
              </strong>
              {" — "}
              {offer.detail}
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">
          AI can assist with research, drafting, repurposing, analysis, and repetitive tasks. People
          keep control of strategy, approvals, brand, and final decisions.{" "}
          <InlineLink to="/platform">See how the platform works</InlineLink>.
        </p>
      </Section>

      <Section title="How a contractor project starts">
        <ol className="grid max-w-3xl gap-4">
          {projectSteps.map((step, index) => (
            <li key={step.lead} className="rounded-xl border border-line bg-surface p-6">
              <p className="font-display text-sm text-volt">{index + 1}</p>
              <p className="mt-2 text-base leading-relaxed text-muted">
                <strong className="font-display text-lg font-semibold tracking-tight text-fg">
                  {step.lead}
                </strong>{" "}
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-muted">
          <p>
            Submitting a brief is not a contract. Demore Technology Solutions is based in Mentor,
            Lake County, Ohio, and serves contractors nationwide.{" "}
            <InlineLink to="/process">See the process</InlineLink>.
          </p>
          <p>
            Case studies will appear on the <InlineLink to="/work">Work</InlineLink> page only when
            there is real, permissioned client work to show. The site does not publish invented
            revenue, fake testimonials, borrowed logos, or fabricated lead or ranking numbers.
            Rankings, AI citations, traffic, lead volume, engagement, and conversion lifts are not
            guaranteed.
          </p>
        </div>
      </Section>

      <Section title="Direct answers">
        <div className="divide-y divide-line border-y border-line">
          {contractorFaqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-display text-lg font-semibold tracking-tight text-fg marker:hidden [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-1 grid size-8 shrink-0 place-items-center rounded-pill hairline text-muted transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              {item.q === tradesQuestion ? (
                <LinkedTradesAnswer answer={item.a} />
              ) : (
                <p className="prose-answer mt-3 text-muted">{item.a}</p>
              )}
            </details>
          ))}
        </div>
      </Section>

      <section className="relative mt-16 overflow-hidden rounded-xl border border-line bg-elevated px-6 py-10 sm:px-10 sm:py-14">
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
          Tell us the trades you offer, your service area, and what should happen when a homeowner
          requests an estimate. Based in Mentor, Ohio. Serving contractors nationwide.
        </p>
        <div className="relative mt-8">
          <Button asChild size="lg">
            <Link to="/contact">Start a project brief</Link>
          </Button>
        </div>
        <p className="relative mt-4 text-sm text-muted">
          Email:{" "}
          <a className={inlineLink} href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </p>
      </section>
    </main>
  );
}
