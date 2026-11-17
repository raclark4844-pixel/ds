import { createFileRoute, useRouter } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { EMAIL, EMAIL_MAILTO, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title: `Privacy Policy | ${SITE_NAME}`,
      description:
        "Draft privacy policy for Demore Technology Solutions LLC: project brief, website review, comparison, Ask Demore, and Demore Lead Engine text messages.",
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
          Effective date: [VERIFY: set to publish date]
        </p>
        <p className="mt-1 text-sm text-muted">
          Policy version: [VERIFY: version. The previous page said 1.0.]
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          This draft describes information the Demore Technology Solutions LLC website collects in
          the current codebase, and a separate section for Demore Lead Engine text messages.
          Statements in [VERIFY: …] are not confirmed. Resolve them before publishing.
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
            Demore Technology Solutions LLC operates this website at
            https://www.demoretechnologysolutions.com. The business is based in Mentor, Ohio and
            serves clients nationwide.
          </p>
          <p className="mt-4">
            Privacy questions go to{" "}
            <a className="text-fg underline-offset-4 hover:underline" href={EMAIL_MAILTO}>
              {EMAIL}
            </a>
            . [VERIFY: any other privacy contact. This draft does not add a street address.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Information the website collects
          </h2>
          <p className="mt-4">
            The project brief asks for a city or market and a service area that the visitor types.
            It has no street-address field. The previous draft&apos;s mailing-address and
            public-record property language is removed in this draft.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Project brief
          </h3>
          <p className="mt-4">
            The form at /contact collects a project brief. Required before submit: at least one
            industry, full name, email, at least one project type, a budget of at least $600, and a
            checked acknowledgment that the brief is not a contract and that rankings, AI citations,
            traffic, lead volume, engagement, and conversion lifts are not guaranteed. [VERIFY:
            whether $600 should be described as a commercial minimum.]
          </p>
          <p className="mt-4">Optional fields on that form:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Role, business name, and phone.</li>
            <li>City or market, service area, and current website.</li>
            <li>Goal, timeline, site features, and must-have pages.</li>
            <li>Brand notes, sites they like, competitors, and ideal buyer.</li>
            <li>Social platforms, posting frequency, content approver, and assets on hand.</li>
            <li>Current search or AI visibility, and growth priority.</li>
            <li>Current lead process, current analytics tools, automation needs, and CRM or other tools.</li>
            <li>Anything else the visitor writes.</li>
            <li>
              An optional text-message checkbox, described in the Demore Lead Engine section below.
              It starts unchecked.
            </li>
          </ul>
          <p className="mt-4">
            A draft of the brief, including the checkbox state, is stored in this browser under the
            local storage key <span className="text-fg">demore-brief-v5</span> until the visitor
            clears it. If the visitor opened the form from a website comparison, the brief can also
            carry that comparison&apos;s record id and handoff token.
          </p>
          <p className="mt-4">
            Submit sends the brief to <span className="text-fg">/api/project-brief</span>. That API
            is written to save a consent event, the brief, and, when a comparison record id is
            present, a handoff row, then to email the brief through Resend (
            https://api.resend.com/emails ). Recipients come from server environment settings, not
            from a list in the page. [VERIFY: which inboxes receive project briefs in production,
            and the From address (PROJECT_BRIEF_FROM_EMAIL).]
          </p>
          <p className="mt-4">
            When a comparison record id is attached and a CRM webhook URL is configured, the same
            API can POST the handoff, including name, email, phone, business name, website, and the
            text-message checkbox value, to that URL. [VERIFY: whether a CRM webhook is enabled,
            and which system receives it. This repository does not name the vendor.]
          </p>
          <p className="mt-4">
            The API is written to check a Cloudflare Turnstile token at
            https://challenges.cloudflare.com/turnstile/v0/siteverify before it accepts a brief. The
            form in this repository does not load that widget or send the token. [VERIFY: whether
            Turnstile runs on the live site.]
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Website comparison
          </h3>
          <p className="mt-4">
            The form at /compare collects company name, website, industry, market, first and last
            name, phone, email, and a desired timeframe. Optional fields: up to three backup
            competitor websites, tools already in use, domain registrar, website host, who maintains
            the site, source-code access, and overall account access. The form tells the visitor
            not to enter passwords, API keys, or login links.
          </p>
          <p className="mt-4">
            The server fetches the public pages it is scoring, asks Google PageSpeed Insights (
            https://www.googleapis.com/pagespeedonline/v5/runPagespeed ) for measurements of the
            submitted website, and, when DataForSEO credentials are set, sends the site and market
            to https://api.dataforseo.com for search results and a traffic estimate. The report is
            stored in the site database. A later PDF step emails the report to the address the
            visitor entered and to the internal recipients in the mail code. [VERIFY: whether
            PageSpeed and DataForSEO are enabled in production. VERIFY: the internal copy recipient
            hardcoded beside {EMAIL}, and the default From address
            projects@demorehomesolutions.com used when REPORT_FROM_EMAIL is unset.]
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Website review and PDF
          </h3>
          <p className="mt-4">
            The website review on the home page and in Ask Demore collects, unless a signed-in
            administrator skips them, full name, email, phone, and company name, plus the public
            website to review. Industry and a target city or region are optional. The on-page note
            says the report and contact details are sent to Ryan at {EMAIL}, and that public contact
            details found on the reviewed website are included.
          </p>
          <p className="mt-4">
            The server requests the public page, its robots.txt, sitemap.xml, and llms.txt when
            those files exist, and can request additional public pages on the same site. It also
            requests https://demoreexteriorsolutions.com/ and this website&apos;s homepage as
            references. [VERIFY: whether that reference site should be named in this policy.] Email
            addresses and telephone links visible on the reviewed pages are included in the copy
            emailed to {EMAIL} through Resend when the PDF is generated. The report itself is
            carried in a signed token in the browser. This repository does not show a separate
            database table for website-review reports. The record id and a short review brief can
            be stored in this browser&apos;s local storage.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Lead-generation follow-up
          </h3>
          <p className="mt-4">
            The form on /lead-generation collects name, company, email, phone, an optional website,
            and a goals message. It emails that request to {EMAIL} through Resend. The page copy
            says the request does not create a campaign or a draft.
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Ask Demore chat
          </h3>
          <p className="mt-4">
            Ask Demore sends the visitor&apos;s message, up to eight recent turns, optional
            industries, an optional website address, an optional report id and token, and any saved
            review brief to <span className="text-fg">/api/assistant</span>. When an xAI key is
            configured, that content is sent to https://api.x.ai , and some questions also trigger a
            web search through that API. The server may fetch the public page of a website named in
            the chat and include a short extract in the model prompt. If the key is missing, the
            site returns fallback text and does not call xAI. The chat transcript stays in the page
            session. Selected industries are stored in session storage. The request IP is used for
            an in-memory rate limit. [VERIFY: whether the xAI key is set in production, and how long
            xAI keeps prompts.]
          </p>

          <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-fg">
            Accounts, storage, and technical data
          </h3>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>
              The login page collects an administrator access key. Password reset collects an email
              address and a new password and emails a one-time link to {EMAIL}. Session cookies
              used by the auth code are named{" "}
              <span className="text-fg">__Host-grok-auth.session_token</span>,{" "}
              <span className="text-fg">__Host-grok-auth.session_data</span>,{" "}
              <span className="text-fg">__Host-grok-auth.account_data</span>,{" "}
              <span className="text-fg">__Host-grok-auth.dont_remember</span>, and{" "}
              <span className="text-fg">__Host-grok_gate_session</span>. Google and X sign-in are
              coded as optional providers through an auth broker. Email-and-password accounts in
              that auth library are switched off in this repository. [VERIFY: which sign-in methods
              are enabled in production, and who is allowed to create an account.]
            </li>
            <li>
              A signed-in preview can store a bearer token in session storage under{" "}
              <span className="text-fg">grok-auth.bearer-token</span>. Comparison tokens are stored
              in session storage for the browser tab.
            </li>
            <li>
              Website comparison, website review, Ask Demore, and the lead follow-up form read the
              request IP for in-memory rate limits. The project-brief API stores a per-minute
              request count for the project, not the visitor&apos;s IP. [VERIFY: hosting or proxy
              access logs, which are outside this repository.]
            </li>
            <li>
              Every page loads fonts from https://fonts.googleapis.com and
              https://fonts.gstatic.com. The browser contacts Google to load those files.
            </li>
            <li>
              This repository does not include a Google Analytics tag, Google Tag Manager, a Meta
              pixel, or a similar analytics script on the marketing pages. [VERIFY: whether the
              host or a proxy adds analytics that are not in this repository.]
            </li>
            <li>
              Signed-in workspace code can also call OpenAI, Anthropic, and Google Search Console
              OAuth for a verified website property. Those paths are separate from ordinary
              browsing. [VERIFY: which of them are enabled in production.] The words &quot;verified
              property&quot; in that Search Console code mean a website in Google Search Console.
            </li>
          </ul>
          <p className="mt-4">
            Briefs and comparison reports are written to Neon Postgres when DATABASE_URL is set, and
            to an embedded PGLite database when it is not. [VERIFY: which database production uses,
            and where it is hosted.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            How the website uses this information
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>To email the project brief, comparison report, website-review PDF, and lead follow-up to the business.</li>
            <li>To show the visitor a comparison, review, or PDF they asked for.</li>
            <li>To answer Ask Demore from the published site, a saved review, or the model response.</li>
            <li>To store the project-brief acknowledgment and the optional text-message checkbox value with the brief.</li>
            <li>To rate-limit repeated submissions.</li>
            <li>To run administrator and account sign-in.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Demore Lead Engine text messages
          </h2>
          <p className="mt-4">
            This section is only about text messages. It is separate from the website forms above.
          </p>
          <p className="mt-4">
            Demore Technology Solutions LLC sends Demore Lead Engine text messages through Sendivo.
            Reply STOP to opt out. Reply HELP for help.
          </p>
          <p className="mt-4">
            [VERIFY: whether email and AI replies should be described here as other live Demore Lead
            Engine features, and what each one stores.]
          </p>
          <p className="mt-4">What this website&apos;s code shows:</p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              The public site names the product Lead Engine. /lead-generation describes a private
              workspace for customers, campaigns, conversations, and handoffs. Sign-in for an
              existing account is coded to https://demore-lead-engine.vercel.app/login. The public
              preview on this website is described as viewing-only.
            </li>
            <li>
              That page&apos;s copy says the inbox can keep email and text conversation history, that
              AI-assisted replies are drafts for staff review, and that email, SMS, and AI services
              require configuration before the corresponding live features run. The site assistant
              instructions say messaging requires setup and that sending is not automatically
              enabled.
            </li>
            <li>
              The project brief includes an optional, unchecked checkbox with this text: &quot;I
              agree to receive promotional and marketing text messages from Demore Technology
              Solutions, such as offers and service announcements. Message frequency varies. Message
              and data rates may apply. Reply HELP for help or STOP to opt out at any time. Consent
              is not required to submit this form or to make a purchase.&quot;
            </li>
            <li>
              The project-brief API is written to store an <span className="text-fg">sms_opt_in</span>{" "}
              event with the checkbox value, a disclosure string from the server environment, a
              timestamp, and the site origin, in the same database write as the brief. The exact
              disclosure string is the SMS_CONSENT_DISCLOSURE environment variable, which is not
              stored in this repository. [VERIFY: the production disclosure text and version.]
            </li>
            <li>
              The form in this repository does not send the disclosure version the API requires
              before it will accept a checked box. [VERIFY: whether checking the box on the live
              site successfully stores consent.]
            </li>
            <li>
              Sendivo is the provider that sends those text messages. Replying STOP opts out.
              Replying HELP gets help.
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
            Demore Lead Engine text messages are sent through Sendivo. The website code also sends
            information to these services when the related feature runs:
          </p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>Resend, to deliver the emails described above.</li>
            <li>xAI, when Ask Demore has an API key.</li>
            <li>Google PageSpeed Insights, for a website comparison.</li>
            <li>DataForSEO, when comparison credentials are configured.</li>
            <li>Google Fonts, when the browser loads the site fonts.</li>
            <li>Cloudflare Turnstile, if the project-brief check is actually invoked.</li>
            <li>The configured database, and a CRM webhook only when that webhook is configured.</li>
            <li>
              OpenAI, Anthropic, or Google, only on the signed-in workspace paths named above, and
              only when those keys or the Search Console connection are configured.
            </li>
          </ul>
          <p className="mt-4">
            [VERIFY: the contracts, subprocessors, and regions for each service that is actually
            enabled.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Data retention
          </h2>
          <p className="mt-4">
            We keep personal information for as long as we reasonably need it for the business
            purposes described in this policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">Security</h2>
          <p className="mt-4">
            Comparison access tokens are stored as hashes. Auth cookies in the auth setup are marked
            Secure with SameSite Lax. The comparison form tells visitors not to submit passwords or
            API keys. [VERIFY: any other security statement the business wants to publish.] No method
            of transmission or storage is completely secure.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Your choices
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>Leave the text-message checkbox unchecked. The project brief can still be submitted.</li>
            <li>
              Clear this site&apos;s local storage and session storage in the browser to remove the
              saved brief draft, report id, and review brief from that browser.
            </li>
            <li>
              Email {EMAIL} to ask about information from a brief, review, comparison, or chat.
              [VERIFY: the access, correction, and deletion process, and any state privacy rights
              the business will honor.]
            </li>
            <li>Reply STOP to a Demore Lead Engine text to opt out. Reply HELP for help.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
