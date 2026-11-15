import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { EMAIL, EMAIL_MAILTO, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead({
      title: `Privacy Policy | ${SITE_NAME}`,
      description:
        "How Demore Technology Solutions collects, uses, and protects information, including SMS and text messaging consent, opt-out, and data sharing practices.",
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
        <p className="mt-4 text-sm text-muted">Effective date: November 15, 2026</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Demore Technology Solutions sends text messages and other communications about our
          services and the inquiries and requests you make with us. This policy explains what
          information we collect, how we use it, and the choices you have.
        </p>
        <div className="mt-8">
          <BackButton />
        </div>
      </header>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Information we collect
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>
              <strong className="text-fg">Contact information:</strong> your name, mobile phone
              number, email address, and mailing or property address.
            </li>
            <li>
              <strong className="text-fg">Property and business information:</strong> public-record
              details about property or a business you own or are interested in.
            </li>
            <li>
              <strong className="text-fg">Messaging records:</strong> texts you send us, texts we
              send you, and delivery details such as when a message was sent and whether it was
              delivered.
            </li>
            <li>
              <strong className="text-fg">Consent records:</strong> when, where, and how you agreed
              to receive texts from us, and any opt-out request.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            How we use your information
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>To respond to your questions and requests.</li>
            <li>
              To send the text messages you agreed to receive, including follow-ups about our
              services.
            </li>
            <li>To keep records of your consent and opt-out choices.</li>
            <li>To meet our legal obligations and prevent fraud or misuse.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            SMS / text messaging
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>
              By providing your mobile number and agreeing to receive texts, you consent to receive
              messages from Demore Technology Solutions about your inquiries, appointments, and our
              services.
            </li>
            <li>Message frequency varies. Message and data rates may apply.</li>
            <li>
              Reply <strong className="text-fg">STOP</strong> at any time to stop receiving texts.
              You will receive one message confirming you are unsubscribed. Reply{" "}
              <strong className="text-fg">START</strong> to sign up again.
            </li>
            <li>
              Reply <strong className="text-fg">HELP</strong> for help, or contact us at{" "}
              <a className="text-fg underline-offset-4 hover:underline" href={EMAIL_MAILTO}>
                {EMAIL}
              </a>
              .
            </li>
            <li>Consent to receive texts is not a condition of any purchase.</li>
            <li>Carriers are not liable for delayed or undelivered messages.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            How we share information
          </h2>
          <p className="mt-4">
            We do not sell, rent, or share your mobile number or SMS consent with third parties or
            affiliates for their marketing or promotional purposes. Text messaging opt-in data and
            consent are excluded from all sharing described in this policy and will not be shared
            with any third party.
          </p>
          <p className="mt-4">We share information only:</p>
          <ul className="mt-3 list-disc space-y-3 pl-5">
            <li>
              With service providers who help us operate, such as our text messaging provider
              (Twilio) and our hosting provider. They may use the information only to provide
              services to us.
            </li>
            <li>
              When required by law, or to protect our rights, our customers, or the public.
            </li>
            <li>
              As part of a business transfer, such as a merger or sale, subject to this policy.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Data retention
          </h2>
          <p className="mt-4">
            We keep your information only as long as we need it for the purposes above or as the law
            requires. We keep opt-out records so that we continue to honor your request.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">Security</h2>
          <p className="mt-4">
            We use reasonable administrative and technical safeguards to protect your information.
            No method of transmission or storage is completely secure.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Your choices
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5">
            <li>Reply STOP to any text to opt out.</li>
            <li>
              Contact us to ask what information we have about you, or to ask us to correct or
              delete it.
            </li>
            <li>
              Residents of some states may have additional rights under state law. Contact us to
              exercise them.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">Children</h2>
          <p className="mt-4">
            Our services are not directed to children under 13, and we do not knowingly collect
            their information.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Changes to this policy
          </h2>
          <p className="mt-4">
            We may update this policy from time to time. The effective date at the top shows when it
            last changed.
          </p>
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
          <Link to="/contact">Start a project brief</Link>
        </Button>
      </div>
    </main>
  );
}
