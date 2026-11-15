import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { EMAIL, EMAIL_MAILTO, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead({
      title: `Terms & Conditions | ${SITE_NAME}`,
      description:
        "Terms & Conditions for the Demore Technology Solutions text messaging program, including opt-out, help, carrier disclaimer, and governing law.",
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
        <p className="mt-4 text-sm text-muted">Effective date: November 15, 2026</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          These Terms &amp; Conditions govern the text messaging program and services offered by
          Demore Technology Solutions. By opting in to receive text messages from Demore Technology
          Solutions, you agree to these terms.
        </p>
        <div className="mt-8">
          <BackButton />
        </div>
      </header>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            SMS program
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>
              <strong className="text-fg">Brand name:</strong> Demore Technology Solutions.
            </li>
            <li>
              <strong className="text-fg">Program description:</strong> Demore Technology Solutions
              sends text messages about your inquiries, appointments, requests for information, and
              our services, including follow-ups and replies to messages you send us.
            </li>
            <li>
              <strong className="text-fg">Message frequency:</strong> message frequency varies based
              on your inquiry and interactions with us.
            </li>
            <li>
              Message and data rates may apply. Your mobile carrier&apos;s standard message and data
              rates may apply to messages you send and receive. Check with your carrier for details
              about your plan.
            </li>
            <li>Consent to receive text messages is not a condition of any purchase.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            How to opt out
          </h2>
          <p className="mt-4">
            You can cancel the SMS service at any time. Reply <strong className="text-fg">STOP</strong>{" "}
            to any message from Demore Technology Solutions. After you send STOP, you will receive one
            final message confirming that you have been unsubscribed, and you will receive no further
            texts from us. To join again, reply <strong className="text-fg">START</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            How to get help
          </h2>
          <p className="mt-4">
            Reply <strong className="text-fg">HELP</strong> to any message for help, or contact Demore
            Technology Solutions at{" "}
            <a className="text-fg underline-offset-4 hover:underline" href={EMAIL_MAILTO}>
              {EMAIL}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Carrier disclaimer
          </h2>
          <p className="mt-4">
            Carriers are not liable for delayed or undelivered messages. Delivery of messages is
            subject to effective transmission from your wireless carrier and is not guaranteed.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Your mobile number
          </h2>
          <p className="mt-4">
            You confirm that you are the account holder or an authorized user of the mobile number
            you provide. If you change or deactivate your number, please reply STOP from that number
            or contact us so we can update our records.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">Privacy</h2>
          <p className="mt-4">
            Your information is handled as described in our{" "}
            <Link
              to="/privacy"
              className="text-fg underline decoration-line underline-offset-4 hover:text-volt"
            >
              Privacy Policy
            </Link>
            . We do not sell, rent, or share your mobile number or SMS consent with third parties or
            affiliates for their marketing or promotional purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Limitation of liability
          </h2>
          <p className="mt-4">
            To the fullest extent permitted by law, Demore Technology Solutions is not liable for any
            indirect, incidental, or consequential damages arising from your use of the SMS program,
            including delayed or undelivered messages.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Changes to these terms
          </h2>
          <p className="mt-4">
            We may update these terms from time to time. The effective date at the top shows when they
            last changed. Continuing to receive messages after a change means you accept the updated
            terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Governing law
          </h2>
          <p className="mt-4">These terms are governed by the laws of the State of Ohio.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">Contact us</h2>
          <p className="mt-4">
            Demore Technology Solutions
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
