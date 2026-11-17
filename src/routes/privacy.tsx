import { createFileRoute, useRouter } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { EMAIL, EMAIL_MAILTO, SITE_NAME } from "@/lib/site";

// Draft only: do not merge or deploy to production until Ryan's written approval
// covers the $400 minimum, Ohio liability limit, and Sendivo SMS terms.
// Review the complete terms.tsx, site-assistant.tsx, and sitemap.xml diffs,
// shared JSON-LD, preview isolation, and typed state before merge.
// Confirm public repository visibility is intentional. This page intentionally
// describes authentication generically rather than publishing cookie identifiers.

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title: `Privacy Policy | ${SITE_NAME}`,
      description:
        "How Demore Technology Solutions LLC collects and uses information from the website, project brief, reviews, and Demore Lead Engine text messages.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function BackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          window.history.back();
          return;
        }
        void router.navigate({ to: "/" });
      }}
    >
      Back
    </Button>
  );
}

function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Legal</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted">
          Effective date: November 17, 2026
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          This policy describes information Demore Technology Solutions LLC
          collects on this website, including the project brief, website tools,
          and Demore Lead Engine text messages.
        </p>
        <div className="mt-8">
          <BackButton />
        </div>
      </header>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Who this policy covers
          </h2>
          <p className="mt-4">
            Demore Technology Solutions LLC operates this website. The business
            is based in Mentor, Ohio and serves clients nationwide.
          </p>
          <p className="mt-4">
            Privacy questions go to{" "}
            <a
              className="text-fg underline-offset-4 hover:underline"
              href={EMAIL_MAILTO}
            >
              {EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Information the website collects
          </h2>
          <p className="mt-4">
            The project brief asks for a city or market and a service area that
            the visitor types. It does not ask for a street address.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Project brief
          </h3>
          {/* Financial terms belong in visible copy, never metadata or JSON-LD. */}
          <p className="mt-4">
            The form at /contact collects a project brief. Required before
            submit: at least one industry, full name, email, at least one project
            type, a minimum project budget of $400.00, and a checked acknowledgment
            that the brief is not a contract and that rankings, AI citations,
            traffic, lead volume, engagement, and conversion lifts are not
            guaranteed.
          </p>
          <p className="mt-4">Optional fields on that form:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Role, business name, and phone.</li>
            <li>City or market, service area, and current website.</li>
            <li>Goal, timeline, site features, and must-have pages.</li>
            <li>Brand notes, sites they like, competitors, and ideal buyer.</li>
            <li>
              Social platforms, posting frequency, content approver, and assets
              on hand.
            </li>
            <li>Current search or AI visibility, and growth priority.</li>
            <li>
              Current lead process, current analytics tools, automation needs,
              and CRM or other tools.
            </li>
            <li>Anything else the visitor writes.</li>
            <li>
              An optional text-message checkbox, described in the Demore Lead
              Engine section below. It starts unchecked.
            </li>
          </ul>
          <p className="mt-4">
            A draft of the brief, including the checkbox state, is stored in this
            browser&apos;s local storage until the visitor clears it. If the
            visitor opened the form from a website comparison, the brief can also
            carry that comparison&apos;s record id and handoff token.
          </p>
          <p className="mt-4">
            Submitting sends the brief to the website&apos;s project-brief API.
            That API is written to save a consent event, the brief, and, when a
            comparison record id is present, a handoff row, then to email the
            brief through Resend.
          </p>
          <p className="mt-4">
            When a comparison record id is attached and a CRM webhook is
            configured, the same API can send that handoff, including name,
            email, phone, business name, website, and the text-message checkbox
            value, to the configured webhook.
          </p>
          <p className="mt-4">
            The project-brief API is written to check a Cloudflare Turnstile
            token before it accepts a brief.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Website comparison
          </h3>
          <p className="mt-4">
            The form at /compare collects company name, website, industry,
            market, first and last name, phone, email, and a desired timeframe.
            Optional fields: up to three backup competitor websites, tools
            already in use, domain registrar, website host, who maintains the
            site, source-code access, and overall account access. The form tells
            the visitor not to enter passwords, API keys, or login links.
          </p>
          <p className="mt-4">
            The server fetches the public pages it is scoring, asks Google
            PageSpeed Insights for measurements of the submitted website, and,
            when DataForSEO credentials are set, sends the site and market to
            DataForSEO for search results and a traffic estimate. The report is
            stored in the site database. A later PDF step emails the report to
            the address the visitor entered and to {EMAIL} through Resend.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Website review and PDF
          </h3>
          <p className="mt-4">
            The website review on the home page and in Ask Demore collects,
            unless a signed-in administrator skips them, full name, email,
            phone, and company name, plus the public website to review. Industry
            and a target city or region are optional. The on-page note says the
            report and contact details are sent to Ryan at {EMAIL}, and that
            public contact details found on the reviewed website are included.
          </p>
          <p className="mt-4">
            The server requests the public page, its robots.txt, sitemap.xml,
            and llms.txt when those files exist, and can request additional public
            pages on the same site. It also requests this website&apos;s homepage
            as a reference. Email addresses and telephone links visible on the
            reviewed pages are included in the copy emailed to {EMAIL} through
            Resend when the PDF is generated. The report itself is carried in a
            signed token in the browser. This repository does not show a separate
            database table for website-review reports. The record id and a short
            review brief can be stored in this browser&apos;s local storage.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Lead-generation follow-up
          </h3>
          <p className="mt-4">
            The form on /lead-generation collects name, company, email, phone, an
            optional website, and a goals message. It emails that request to{" "}
            {EMAIL} through Resend. The page copy says the request does not create
            a campaign or a draft.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Ask Demore chat
          </h3>
          <p className="mt-4">
            Ask Demore sends the visitor&apos;s message, up to eight recent
            turns, optional industries, an optional website address, an optional
            report id and token, and any saved review brief to the website&apos;s
            assistant API. When an xAI key is configured, that content is sent to
            xAI, and some questions also trigger a web search through that API.
            The server may fetch the public page of a website named in the chat
            and include a short extract in the model prompt. If the key is
            missing, the site returns fallback text and does not call xAI. The
            chat transcript stays in the page session. Selected industries are
            stored in session storage. The request IP is used for an in-memory
            rate limit.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Accounts, storage, and technical data
          </h3>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>
              Administrator sign-in collects an administrator credential.
              Account recovery can collect an email address and a new password
              and use a one-time email link. Session cookies support
              authentication and sign-in preferences. Optional third-party
              sign-in providers may process account information when configured.
            </li>
            <li>
              Signed-in features can store authentication information in session
              storage. Comparison access tokens are stored in session storage
              for the browser tab.
            </li>
            <li>
              Website comparison, website review, Ask Demore, and the lead
              follow-up form read the request IP for in-memory rate limits. The
              project-brief API stores a per-minute request count for the
              project, not the visitor&apos;s IP.
            </li>
            <li>
              Every page loads fonts from Google Fonts. The browser contacts
              Google to load those files.
            </li>
            <li>
              This repository does not include a Google Analytics tag, Google
              Tag Manager, a Meta pixel, or a similar analytics script on the
              marketing pages.
            </li>
            <li>
              Signed-in workspace code can also call OpenAI, Anthropic, and
              Google Search Console OAuth for a verified website property. Those
              paths are separate from ordinary browsing. A verified property
              here means a website in Google Search Console.
            </li>
          </ul>
          <p className="mt-4">
            Briefs and comparison reports are written to Neon Postgres when
            configured, and to an embedded PGLite database otherwise.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            How the website uses this information
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>
              To email the project brief, comparison report, website-review PDF,
              and lead follow-up to the business.
            </li>
            <li>
              To show the visitor a comparison, review, or PDF they asked for.
            </li>
            <li>
              To answer Ask Demore from the published site, a saved review, or
              the model response.
            </li>
            <li>
              To store the project-brief acknowledgment and the optional
              text-message checkbox value with the brief.
            </li>
            <li>To rate-limit repeated submissions.</li>
            <li>To run administrator and account sign-in.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Demore Lead Engine text messages
          </h2>
          <p className="mt-4">
            This section is only about text messages. It is separate from the
            website forms above.
          </p>
          <p className="mt-4">
            Demore Technology Solutions LLC sends Demore Lead Engine text
            messages through Sendivo. Reply STOP to opt out. Reply HELP for help.
          </p>
          <p className="mt-4">On this website:</p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              The public site names the product Lead Engine. /lead-generation
              describes a private workspace for customers, campaigns,
              conversations, and handoffs and provides sign-in for existing
              accounts. The public preview on this website is viewing-only.
            </li>
            <li>
              That page&apos;s copy says email and text replies stay in one
              Demore Lead Engine inbox, that AI-suggested replies are drafts a
              person decides whether to send, and that email and SMS sending runs
              only after it is set up for the account and the team approves the
              campaign. The site assistant instructions say messaging requires
              setup and that sending is not automatically enabled.
            </li>
            <li>
              The project brief includes an optional, unchecked checkbox with
              this text: &quot;I agree to receive promotional and marketing text
              messages from Demore Technology Solutions, such as offers and
              service announcements. Message frequency varies. Message and data
              rates may apply. Reply HELP for help or STOP to opt out at any time.
              Consent is not required to submit this form or to make a
              purchase.&quot;
            </li>
            <li>
              The project-brief API is written to store a text-message consent
              event with the checkbox value, the disclosure shown for that
              choice, a timestamp, and the site origin, in the same database write
              as the brief.
            </li>
            <li>
              Sendivo is the provider that sends those text messages. Replying
              STOP opts out. Replying HELP gets help.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            How information is shared
          </h2>
          <p className="mt-4">
            We do not sell or share personal information for advertising.
          </p>
          <p className="mt-4">
            Demore Lead Engine text messages are sent through Sendivo. The
            website code also sends information to these services when the
            related feature runs:
          </p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>Resend, to deliver the emails described above.</li>
            <li>xAI, when Ask Demore has an API key.</li>
            <li>Google PageSpeed Insights, for a website comparison.</li>
            <li>DataForSEO, when comparison credentials are configured.</li>
            <li>Google Fonts, when the browser loads the site fonts.</li>
            <li>
              Cloudflare Turnstile, if the project-brief check is invoked.
            </li>
            <li>
              The configured database, and a CRM webhook only when that webhook
              is configured.
            </li>
            <li>
              OpenAI, Anthropic, or Google, only on the signed-in workspace paths
              named above, and only when those keys or the Search Console
              connection are configured.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Data retention
          </h2>
          <p className="mt-4">
            We keep personal information for as long as we reasonably need it
            for the business purposes described in this policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Security
          </h2>
          <p className="mt-4">
            Comparison access tokens are stored as hashes. Authentication
            cookies use security settings intended to protect sessions. The
            comparison form tells visitors not to submit passwords or API keys.
            No method of transmission or storage is completely secure.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Your choices
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>
              Leave the text-message checkbox unchecked. The project brief can
              still be submitted.
            </li>
            <li>
              Clear this site&apos;s local storage and session storage in the
              browser to remove the saved brief draft, report id, and review
              brief from that browser.
            </li>
            <li>
              Email {EMAIL} to ask about information from a brief, review,
              comparison, or chat.
            </li>
            <li>
              Reply STOP to a Demore Lead Engine text to opt out. Reply HELP for
              help.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}