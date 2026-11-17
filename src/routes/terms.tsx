import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { EMAIL, EMAIL_MAILTO, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: `Terms & Conditions | ${SITE_NAME}`,
      description:
        "Terms for the Demore Technology Solutions LLC website, project brief, and Demore Lead Engine text messages sent by Sendivo.",
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
        <p className="mt-4 text-sm text-muted">Effective date: November 17, 2026</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          These terms cover use of the Demore Technology Solutions LLC website, including the
          project brief, website review, website comparison, lead-generation follow-up form, and Ask
          Demore chat. Text messages are in their own section below, under Demore Lead Engine.
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
          <p className="mt-4">Pages, examples, and scores are informational.</p>
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
            The minimum project budget is $400.00.
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
            Ask Demore gives general information, not legal, financial, or other professional advice,
            and its answers can be wrong. It answers from the xAI API when a key is configured, and
            from fallback text on the site when it is not. Some answers use a web search or a public
            page the visitor named.
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
              sms_opt_in consent event, together with the disclosure for that choice.
            </li>
            <li>
              <strong className="text-fg">Sending:</strong> Sendivo sends Demore Lead Engine text
              messages. Replying STOP opts out. Replying HELP gets help. Message frequency varies.
            </li>
            <li>
              Public Lead Engine copy on /lead-generation says email and text replies stay in one
              inbox, that AI-suggested replies are drafts a person decides whether to send, and that
              email and SMS sending runs only after it is set up for the account and the team
              approves the campaign.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Accounts
          </h2>
          <p className="mt-4">
            The login page is an administrator sign-in. Optional Google and X sign-in exist in the
            auth setup when the broker is configured. An existing Lead Engine account can be opened
            from https://demore-lead-engine.vercel.app/login.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Limitation of liability
          </h2>
          <p className="mt-4">
            To the extent the law allows, Demore Technology Solutions LLC is not liable for indirect
            or consequential damages arising from this website, a project brief, a review, a
            comparison, Ask Demore, or Demore Lead Engine text messages. Our total liability for a
            specific service is limited to the amounts you paid us for that service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Changes to these terms
          </h2>
          <p className="mt-4">
            We may update these terms. The updated terms will be posted on this page, and the
            effective date above will show when they last changed.
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
