import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient, authEnabled } from "@/lib/auth/client";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/workspace")({
  head: () =>
    pageHead({
      title: "Your workspace | Demore Technology Solutions",
      description: "All your Demore workspace tools in one place.",
      path: "/workspace",
    }),
  component: Workspace,
});
const websitePages = [
  {
    title: "Multi-site control center",
    path: "/control-center-admin",
    description:
      "Bots, specialists, automation, provider setup, spending controls, and monitoring.",
  },
  {
    title: "Website report administration",
    path: "/admin",
    description: "Comparison reports, follow-up queue, internal notes, and scoring settings.",
  },
  {
    title: "Shared lead inbox",
    path: "/lead-inbox",
    description:
      "Website leads and pipelines for both businesses, with inbox health and follow-up.",
  },
];
const enginePages = [
  {
    title: "Lead Engine overview",
    path: "/operations",
    description: "Project directory, setup status, activity, and operations.",
  },
  {
    title: "Start a new campaign",
    path: "/campaigns/new",
    description: "Plan the customer, offer, industry, territory, and channels in a draft.",
  },
  {
    title: "All campaigns — current & past",
    path: "/campaign-history",
    description:
      "All customers’ drafts, current activity, and past campaigns together. Open any campaign for details.",
  },
  {
    title: "Customers",
    path: "/customers",
    description: "Find customer records and open individual company profiles.",
  },
  {
    title: "Add a customer",
    path: "/customers/new",
    description: "Create a customer profile for future campaigns.",
  },
  {
    title: "Campaign inbox",
    path: "/inbox",
    description: "Review campaign conversations, replies, and handoffs.",
  },
  {
    title: "Lead review",
    path: "/operations/review",
    description: "Review leads, contact evidence, and campaign readiness.",
  },
  {
    title: "Campaign sending",
    path: "/sending",
    description: "Prepare and review channel activity and sending status.",
  },
  {
    title: "Campaign costs",
    path: "/campaign-costs",
    description: "View recorded costs, estimates, and campaign allocations.",
  },
  {
    title: "Invoices & billing",
    path: "/billing",
    description: "Browse invoice records and open individual invoice details.",
  },
  {
    title: "My account",
    path: "/account",
    description: "Account information and password-management options.",
  },
  {
    title: "Employee administration",
    path: "/admin/users",
    description:
      "Manage employee accounts and access. Lead Engine administrator permission required.",
  },
];
function Workspace() {
  const [access, setAccess] = useState<{ signedIn: boolean; admin: boolean } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/admin/review-access", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const admin = await response.json();
        const session = !admin.canSkipContact && authEnabled ? await authClient.getSession() : null;
        if (active)
          setAccess({
            signedIn: admin.canSkipContact === true || Boolean(session?.data?.user),
            admin: admin.canSkipContact === true,
          });
      } catch {
        if (active) setError("Could not check your login. Refresh this page or sign in again.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="kicker">Your Demore workspace</p>
      <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
        Every tool. One place.
      </h1>
      <p className="mt-5 max-w-3xl text-muted">
        Open your website administration, Lead Engine, campaigns, customer records, and account
        tools from one directory. Each tool opens in its own tab, so you can keep several pages
        available at the same time.
      </p>
      {error ? (
        <p role="alert" className="mt-6 text-hot">
          {error}{" "}
          <a href="/login" className="underline">
            Log in
          </a>
        </p>
      ) : !access ? (
        <p role="status" className="mt-6 text-muted">
          Checking your login…
        </p>
      ) : !access.signedIn ? (
        <div className="mt-8 rounded-xl border border-line bg-surface p-6">
          <h2 className="text-2xl font-semibold">Sign in to open your workspace.</h2>
          <p className="mt-3 text-muted">
            Your existing account permissions determine which private tools you can use.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <a href="/login">Log in</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/lead-generation#preview">Preview lead generation</a>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {access.admin ? (
            <section className="mt-10">
              <h2 className="font-display text-2xl font-semibold">
                Website & automation administration
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {websitePages.map((page) => (
                  <PageCard key={page.path} {...page} href={page.path} />
                ))}
              </div>
            </section>
          ) : null}
          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold">
              Lead Engine — all workspace pages
            </h2>
            <p className="mt-3 text-sm text-muted">
              Uses your website login with your existing active Lead Engine account. Individual
              customer, campaign, and invoice detail pages are available from their directories.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enginePages.map((page) => (
                <PageCard
                  key={page.path}
                  {...page}
                  href={`https://demore-lead-engine.vercel.app/api/website-signin/start?next=${encodeURIComponent(page.path)}`}
                />
              ))}
            </div>
          </section>
          <section className="mt-10 flex flex-wrap gap-3 border-t border-line pt-6">
            <Button asChild variant="outline">
              <a href="/lead-generation">Lead-generation guide & preview</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/control-center">Public AI control-center guide</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/login">Login & password recovery</a>
            </Button>
          </section>
        </>
      )}
    </main>
  );
}
function PageCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-line bg-surface p-6 transition-colors hover:border-volt/60 focus-visible:outline-2 focus-visible:outline-volt"
    >
      <h3 className="font-display text-xl font-semibold text-volt">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      <span className="mt-4 block text-xs text-muted">Open in a new tab ↗</span>
    </a>
  );
}
