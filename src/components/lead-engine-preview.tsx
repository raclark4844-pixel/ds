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
  const [industry, setIndustry] = useState("Restaurants");
  const [offer, setOffer] = useState("");
  const [notice, setNotice] = useState("");
  const choices = ["All campaigns", "Current", "Past", "New campaign"];
  return (
    <div className="rounded-xl border border-volt/30 bg-surface p-5 sm:p-8">
      <p className="kicker text-volt">Interactive preview · illustrative examples</p>
      <p className="mt-3 max-w-3xl text-sm text-muted">
        Explore campaign planning and an overview of current and past campaigns. These examples are
        fictional. This preview does not create campaigns, collect leads, or send messages.
      </p>
      <div role="group" aria-label="Preview campaign views" className="mt-6 flex flex-wrap gap-2">
        {choices.map((choice) => (
          <Button
            key={choice}
            variant={view === choice ? "volt" : "outline"}
            aria-pressed={view === choice}
            onClick={() => {
              setView(choice);
              setNotice("");
            }}
          >
            {choice}
          </Button>
        ))}
      </div>
      {view === "New campaign" ? (
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setNotice(
              `Preview plan: ${industry} — ${offer || "Your offer"}. Next, choose the customer, territory, goals, and review steps in the signed-in campaign builder.`,
            );
          }}
        >
          <label className="text-sm">
            Industry
            <select
              className="mt-2 block min-h-11 w-full rounded-md border border-line bg-bg p-3"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
            >
              {[
                "Restaurants",
                "Pubs",
                "Pizza Shops",
                "Contractors & Home Services",
                "Professional Services",
                "Other",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Example offer
            <input
              className="mt-2 block min-h-11 w-full rounded-md border border-line bg-bg p-3"
              maxLength={120}
              value={offer}
              placeholder="For example, office catering"
              onChange={(event) => setOffer(event.target.value)}
            />
          </label>
          <Button type="submit" className="justify-self-start">
            Preview my campaign plan
          </Button>
          {notice && (
            <p role="status" className="text-sm text-volt sm:col-span-2">
              {notice}
            </p>
          )}
        </form>
      ) : (
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
      )}
      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
        <Button asChild>
          <a href="https://demore-lead-engine.vercel.app/api/website-signin/start">
            Open my Lead Engine
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href="/contact?need=leadgen">Plan a system for my business</a>
        </Button>
      </div>
    </div>
  );
}
