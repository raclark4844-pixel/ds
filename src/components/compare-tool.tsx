import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { storeReportId } from "@/lib/site-assistant-ids";
import { getRecordId } from "@/lib/website-review/record-id";

const SETUPS = [
  { id: "none", label: "No site, or a dead one", line: "A Facebook page, a card, or a domain that does not convert." },
  { id: "diy", label: "DIY builder", line: "Wix, Squarespace, or a theme you assembled yourself." },
  { id: "template", label: "Template or franchise pack", line: "A leftover industry theme with a new logo." },
  { id: "agency", label: "Brochure agency site", line: "Looks finished. Leads still land in an inbox nobody owns." },
  { id: "system", label: "A connected system already", line: "Site, intake, follow-up, and measurement already talk to each other." },
];

const NEEDS = [
  { id: "pages", label: "Pages that follow how we get paid" },
  { id: "search", label: "Search and local visibility" },
  { id: "geo", label: "AI citation / GEO readiness" },
  { id: "aeo", label: "Direct answers people and models can lift" },
  { id: "convert", label: "A form, book, buy, or estimate path that works" },
  { id: "assist", label: "An AI assistant that qualifies, not chats" },
  { id: "follow", label: "Routing, scoring, and follow-up after the form" },
  { id: "content", label: "Posts that land on a real destination page" },
  { id: "measure", label: "Measurement beyond raw traffic" },
  { id: "improve", label: "Approved improvements on a cadence" },
];

const COLS = [
  { id: "diy", label: "DIY / no site" },
  { id: "template", label: "Template pack" },
  { id: "agency", label: "Brochure agency" },
  { id: "demore", label: "Demore platform" },
] as const;

const MARKS: Record<string, Record<string, "weak" | "partial" | "built">> = {
  pages: { diy: "weak", template: "partial", agency: "partial", demore: "built" },
  search: { diy: "weak", template: "partial", agency: "partial", demore: "built" },
  geo: { diy: "weak", template: "weak", agency: "weak", demore: "built" },
  aeo: { diy: "weak", template: "weak", agency: "partial", demore: "built" },
  convert: { diy: "weak", template: "partial", agency: "partial", demore: "built" },
  assist: { diy: "weak", template: "weak", agency: "weak", demore: "built" },
  follow: { diy: "weak", template: "weak", agency: "weak", demore: "built" },
  content: { diy: "weak", template: "weak", agency: "partial", demore: "built" },
  measure: { diy: "weak", template: "weak", agency: "partial", demore: "built" },
  improve: { diy: "weak", template: "weak", agency: "weak", demore: "built" },
};

const MARK_COPY = { weak: "Weak", partial: "Partial", built: "Built in" };

const VERDICT: Record<string, string> = {
  none: "You do not have a sales path yet. A theme will not invent one. Start with the pages, intake, and measurement that match how the business gets paid.",
  diy: "A builder can publish. It rarely qualifies, routes, or measures the next customer. Keep what is useful. Replace the dead ends.",
  template: "A leftover industry pack is not architecture. Service pages, intake, and follow-up still have to be designed around the actual offer.",
  agency: "A finished-looking brochure is not a system. If leads sit in an inbox and traffic is the only report, the site is not doing the job.",
  system: "If the current system already connects discovery, intake, follow-up, and measurement, the project is a gap review — not a rebuild for sport.",
};

function score(needIds: string[], col: string) {
  return needIds.reduce((sum, id) => {
    const mark = MARKS[id]?.[col];
    if (mark === "built") return sum + 2;
    if (mark === "partial") return sum + 1;
    return sum;
  }, 0);
}

function markClass(mark: string) {
  if (mark === "built") return "font-semibold text-volt";
  if (mark === "partial") return "text-sun";
  return "text-hot/70";
}

export function CompareTool() {
  const [setup, setSetup] = useState("agency");
  const [needs, setNeeds] = useState(() => new Set(["pages", "convert", "follow", "measure"]));
  const [recordId, setRecordId] = useState("");

  useEffect(() => {
    const id = getRecordId();
    setRecordId(id);
    storeReportId(id);
  }, []);

  function toggleNeed(id: string) {
    setNeeds((old) => {
      const next = new Set(old);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selected = useMemo(() => NEEDS.filter((item) => needs.has(item.id)), [needs]);
  const rows = selected.length ? selected : NEEDS;
  const totals = useMemo(() => {
    const ids = rows.map((row) => row.id);
    return Object.fromEntries(COLS.map((col) => [col.id, score(ids, col.id)]));
  }, [rows]);
  const max = rows.length * 2;

  return (
    <div id="tool" className="mt-16 scroll-mt-24 space-y-8">
      <section className="rounded-xl border border-line bg-surface p-5 sm:p-8" aria-labelledby="compare-setup">
        <p className="kicker">Step 1</p>
        <h2 id="compare-setup" className="mt-3 font-display text-3xl font-semibold tracking-tight">What do you have now?</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {SETUPS.map((item) => (
            <label key={item.id} className={`flex min-h-16 cursor-pointer gap-3 rounded-lg border px-4 py-3 ${setup === item.id ? "border-volt bg-volt-dim" : "border-line bg-bg"}`}>
              <input type="radio" name="setup" className="mt-1 size-4 accent-volt" value={item.id} checked={setup === item.id} onChange={() => setSetup(item.id)} />
              <span>
                <strong className="block">{item.label}</strong>
                <small className="mt-1 block text-sm text-muted">{item.line}</small>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section aria-labelledby="compare-needs">
        <p className="kicker">Step 2</p>
        <h2 id="compare-needs" className="mt-3 font-display text-3xl font-semibold tracking-tight">What does the system have to do?</h2>
        <p className="mt-3 max-w-2xl text-muted">Mark the jobs that create revenue. The table only scores what you mark. Leave a row off if it is not the job.</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {NEEDS.map((item) => (
            <label key={item.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${needs.has(item.id) ? "border-volt bg-volt-dim" : "border-line bg-surface"}`}>
              <input type="checkbox" className="size-4 accent-volt" checked={needs.has(item.id)} onChange={() => toggleNeed(item.id)} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 sm:p-8" aria-labelledby="compare-result">
        <p className="kicker">Result</p>
        <h2 id="compare-result" className="mt-3 font-display text-3xl font-semibold tracking-tight">How the common options stack up</h2>
        <p className="mt-3 max-w-2xl text-muted">Marks are qualitative. They are not rankings, conversion lifts, or a quote. Rankings, AI citations, and conversion lifts are not guaranteed.</p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-line" role="table" aria-label="Comparison of DIY, template, brochure agency, and Demore platform">
          <div className="grid min-w-[54rem] grid-cols-[minmax(11rem,1.5fr)_repeat(4,minmax(6.4rem,1fr))]">
            <div className="contents" role="row">
              <span className="sticky top-0 bg-elevated p-3 text-sm font-semibold" role="columnheader">Job</span>
              {COLS.map((col) => (
                <span key={col.id} role="columnheader" className={`sticky top-0 bg-elevated p-3 text-sm font-semibold ${col.id === "demore" ? "bg-volt-dim text-volt" : ""}`}>
                  {col.label}
                </span>
              ))}
            </div>
            {rows.map((row) => (
              <div className="contents" role="row" key={row.id}>
                <span role="rowheader" className="border-t border-line p-3 text-sm">{row.label}</span>
                {COLS.map((col) => {
                  const mark = MARKS[row.id][col.id];
                  return (
                    <span key={col.id} role="cell" className={`border-t border-line p-3 text-sm ${markClass(mark)} ${col.id === "demore" ? "bg-volt-dim/40" : ""}`}>
                      {MARK_COPY[mark]}
                    </span>
                  );
                })}
              </div>
            ))}
            <div className="contents" role="row">
              <span role="rowheader" className="border-t border-line bg-bg p-3 text-sm font-semibold">Coverage of marked jobs</span>
              {COLS.map((col) => (
                <span key={col.id} role="cell" className={`border-t border-line bg-bg p-3 text-sm font-semibold ${col.id === "demore" ? "bg-volt-dim text-volt" : ""}`}>
                  {totals[col.id]} / {max}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 text-sm"><strong>Read of your setup:</strong> {VERDICT[setup]}</p>
        {recordId ? <p className="mt-3 text-sm text-muted">Comparison ID {recordId} — same number as Ask Demore and the project form.</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/contact" search={{ need: "platform", source: "compare", reportId: recordId, rid: recordId }}>
              Start a project from this comparison
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/platform">See the platform</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
