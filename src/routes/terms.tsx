import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { EMAIL, EMAIL_MAILTO, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: `Terms & Conditions | ${SITE_NAME}`,
      description:
        "Draft terms for the Demore Technology Solutions LLC website and project brief, plus Demore Lead Engine text messages sent by Sendivo.",
      path: "/terms",
    }),
  component: TermsPage,
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

function TermsPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Legal</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-sm text-muted">
          Effective date: [VERIFY: set to publish date]
        </p>
        <p className="mt-1 text-sm text-muted">
          Terms version: [VERIFY: version. The previous page had no version number.]
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          These draft terms cover use of the Demore Technology Solutions LLC website, including the
          project brief, website review, website comparison, lead-generation follow-up form, and Ask
          Demore chat. Text messages are in their own section below, under Demore Lead Engine.
          Statements in [VERIFY: …] are not confirmed. Resolve them before publishing.
        </p>
        <div className="mt-8">
          <BackButton />
        </div>
      </header>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            The website
          </h2>
          <p className="mt-4">
            Demore Technology Solutions LLC publishes this website to describe custom websites,
            ecommerce, growth work, automation, and custom AI platforms. The business is based in
            Mentor, Ohio and serves clients nationwide, including remote work.
          </p>
          <p className="mt-4">We do not sell or share personal information for advertising.</p>
          <p className="mt-4">
            Pages, examples, and scores are informational. [VERIFY: any license, acceptable-use, or
            account rules the business wants added. This repository does not state them.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Project brief
          </h2>
          <p className="mt-4">
            The project brief at /contact is a request for a conversation about scope. The form
            requires this acknowledgment before it will submit: the brief is not a contract, and
            submitting it does not hire Demore Technology Solutions LLC or guarantee rankings, AI
            citations, traffic, lead volume, engagement, or conversion lifts. The same statement is
            in the contact-page questions in the site copy.
          </p>
          <p className="mt-4">
            The form rejects a budget below $600. [VERIFY: whether that figure should appear here
            as a commercial minimum. It is a validation rule in the form, not a price list.]
          </p>
          <p className="mt-4">
            A copy of the brief can remain in the browser until the visitor clears site data. What
            the form collects, and where it is sent, is described in the{" "}
            <Link
              to="/privacy"
              className="text-fg underline decoration-line underline-offset-4 hover:text-volt"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Website review and comparison
          </h2>
          <p className="mt-4">
            The visitor supplies a public website address and the contact details the form
            requires. The server fetches public pages and public files for that address. The
            comparison form says not to enter passwords, API keys, or login links.
          </p>
          <p className="mt-4">
            A review, score, or PDF is a reading of public pages and, for a comparison, of the
            measurement services named in the Privacy Policy. It is not a promise of rankings, AI
            citations, traffic, or conversion lifts. The email copy in the code uses that same
            disclaimer.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Ask Demore
          </h2>
          <p className="mt-4">
            Ask Demore answers from the xAI API when a key is configured, and from fallback text on
            the site when it is not. Some answers use a web search or a public page the visitor
            named. Answers can be incomplete. [VERIFY: whether chat answers should be disclaimed as
            not legal, financial, or other professional advice.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Lead-generation follow-up
          </h2>
          <p className="mt-4">
            The follow-up form on /lead-generation emails the visitor&apos;s name, company, email,
            phone, optional website, and goals to {EMAIL}. The page copy says this does not create
            a campaign or a draft and does not hire Demore Technology Solutions LLC.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Demore Lead Engine text messages
          </h2>
          <p className="mt-4">
            This section is the text-message terms. It does not, by itself, make the rest of these
            terms an SMS-program contract. The previous page said these terms governed a text
            messaging program for the whole business. This draft limits that subject to Demore Lead
            Engine and to the optional checkbox on the project brief.
          </p>
          <p className="mt-4">
            Demore Technology Solutions LLC sends Demore Lead Engine text messages through Sendivo.
            Reply STOP to opt out. Reply HELP for help.
          </p>
          <p className="mt-4">
            [VERIFY: whether email and AI replies should be described here as other live Demore Lead
            Engine features.]
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>
              <strong className="text-fg">Where the checkbox appears:</strong> the project brief.
              The box starts unchecked. The form can be submitted without it. The checkbox says
              consent is not required to submit the form or to make a purchase.
            </li>
            <li>
              <strong className="text-fg">Checkbox text shown on the form:</strong> &quot;I agree to
              receive promotional and marketing text messages from Demore Technology Solutions, such
              as offers and service announcements. Message frequency varies. Message and data rates
              may apply. Reply HELP for help or STOP to opt out at any time. Consent is not required
              to submit this form or to make a purchase.&quot;
            </li>
            <li>
              <strong className="text-fg">What this repository does with that box:</strong> the
              project-brief API is written to store the checkbox value with the brief as an
              sms_opt_in consent event. The disclosure text it stores comes from a server
              environment variable, not from a file in this repository. The current form does not
              send the disclosure version that API requires. [VERIFY: whether a checked box on the
              live site is stored, and the exact disclosure the visitor is shown.]
            </li>
            <li>
              <strong className="text-fg">Sending:</strong> Sendivo sends Demore Lead Engine text
              messages. Replying STOP opts out. Replying HELP gets help. Message frequency varies.
            </li>
            <li>
              Public Lead Engine copy on /lead-generation says email and text history can be kept
              in the workspace inbox, that AI-assisted replies are drafts for staff review, and that
              email, SMS, and AI services require configuration before those live features run.
              [VERIFY: that this description still matches the product the owner confirmed.]
            </li>
          </ul>
          <p className="mt-4">
            [VERIFY: carrier disclaimer language Sendivo or the carriers require. The previous page
            said carriers are not liable for delayed or undelivered messages.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Accounts
          </h2>
          <p className="mt-4">
            The login page is an administrator sign-in. Optional Google and X sign-in exist in the
            auth setup when the broker is configured. [VERIFY: who may create an account, and the
            rules for the separate Lead Engine login at
            https://demore-lead-engine.vercel.app/login.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Limitation of liability
          </h2>
          <p className="mt-4">
            [VERIFY: what liability limit, if any, should be published. The previous page limited
            liability for use of an SMS program, including delayed or undelivered messages. Confirm
            the replacement, including any limit that should cover the website, the project brief,
            reviews, and Demore Lead Engine texts sent by Sendivo.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Changes to these terms
          </h2>
          <p className="mt-4">
            [VERIFY: how changes will be posted, and whether continued use of the website or
            continued text messages counts as acceptance. The previous page said continuing to
            receive text messages meant acceptance of updated terms.]
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Governing law
          </h2>
          <p className="mt-4">
            These terms are governed by the laws of the State of Ohio.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">Contact us</h2>
          <p className="mt-4">
            Demore Technology Solutions LLC
            <br />
            6348 Meldon Dr
            <br />
            Mentor, Ohio 44060
            <br />
            <a className="text-fg underline-offset-4 hover:underline" href={EMAIL_MAILTO}>
              {EMAIL}
            </a>
          </p>
        </section>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <BackButton />
        <Button asChild size="lg" variant="outline">
          <Link to="/privacy">Privacy Policy</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/contact">Start a project brief</Link>
        </Button>
      </div>
    </main>
  );
}
