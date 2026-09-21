import { LeadFollowupForm } from "@/components/lead-followup-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
const examples = [
  {
    name: "Restaurant catering inquiries",
    industry: "Restaurants",
    status: "Current",
    offer: "Office lunches and private dining",
    next: "Review catering requests and confirm dates with the restaurant team.",
  },
  {
    name: "Pub private-event bookings",
    industry: "Pubs",
    status: "Draft",
    offer: "Private parties and group events",
    next: "Set the service area, qualification questions, and campaign schedule.",
  },
  {
    name: "Pizza shop group orders",
    industry: "Pizza Shops",
    status: "Past",
    offer: "Team lunches and event catering",
    next: "Review the campaign history and use the findings to plan the next offer.",
  },
];
export function LeadEnginePreview() {
  const [view, setView] = useState("All campaigns");
  const choices = ["All campaigns", "Current", "Past"];
  return (
    <div className="rounded-xl border border-volt/30 bg-surface p-5 sm:p-8">
      <p className="kicker text-volt">For viewing purposes only · example campaigns</p>
      <p className="mt-3 max-w-3xl text-sm text-muted">
        This public preview is for viewing purposes only. Visitors cannot create or save campaign
        drafts here. The campaigns shown are fictional examples. Creating campaigns requires an
        authorized login.
      </p>
      <div role="group" aria-label="Preview campaign views" className="mt-6 flex flex-wrap gap-2">
        {choices.map((choice) => (
          <Button
            key={choice}
            variant={view === choice ? "volt" : "outline"}
            aria-pressed={view === choice}
            onClick={() => {
              setView(choice);
            }}
          >
            {choice}
          </Button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3" aria-live="polite">
        {examples
          .filter((item) => view === "All campaigns" || item.status === view)
          .map((item) => (
            <article key={item.name} className="rounded-lg border border-line bg-bg p-5">
              <span className="rounded-pill border border-line px-3 py-1 text-xs text-volt">
                {item.status} · Example
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm text-muted">
                {item.industry} · {item.offer}
              </p>
              <p className="mt-4 border-t border-line pt-4 text-sm">{item.next}</p>
            </article>
          ))}
      </div>
      <LeadFollowupForm />
      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
        <Button asChild>
          <a href="https://demore-lead-engine.vercel.app/api/website-signin/start">
            Authorized users: log in to Lead Engine
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href="/contact?need=leadgen">Plan a system for my business</a>
        </Button>
      </div>
    </div>
  );
}
