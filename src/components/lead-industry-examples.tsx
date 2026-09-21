import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { industryExamples } from "@/lib/lead-generation-content";

export function LeadIndustryExamples() {
  const [selected, setSelected] = useState<(typeof industryExamples)[number]["id"]>("restaurants");
  const example = industryExamples.find((item) => item.id === selected)!;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div
        className="flex flex-wrap gap-2 border-b border-line p-4"
        role="group"
        aria-label="Choose an industry example"
      >
        {industryExamples.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected === item.id}
            onClick={() => setSelected(item.id)}
            className={`min-h-11 rounded-pill border px-4 py-2 text-sm transition-colors ${selected === item.id ? "border-volt bg-volt text-black" : "border-line text-muted hover:border-fg/40 hover:text-fg"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2" aria-live="polite" aria-atomic="true">
        <div>
          <p className="kicker text-volt">ILLUSTRATIVE WORKFLOW</p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            {example.title}
          </h3>
          <p className="mt-4 text-sm text-muted">{example.offer}</p>
          <p className="mt-6 leading-relaxed text-muted">{example.entry}</p>
          <a
            href={example.path}
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-volt underline underline-offset-4"
          >
            Explore {example.label.toLowerCase()}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="rounded-xl border border-line bg-bg p-5">
          <h4 className="font-medium">Capture what matters</h4>
          <ul className="mt-4 space-y-3">
            {example.questions.map((question) => (
              <li key={question} className="flex gap-3 text-sm text-muted">
                <Check className="mt-0.5 size-4 shrink-0 text-volt" aria-hidden="true" />
                {question}
              </li>
            ))}
          </ul>
          <h4 className="mt-6 font-medium">Connect the next step</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted">{example.workflow}</p>
          <h4 className="mt-6 font-medium">Review the results</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted">{example.measurement}</p>
        </div>
      </div>
      <p className="border-t border-line px-6 py-4 text-xs leading-relaxed text-faint">
        Examples show how a configured workflow can be used. They are not live customer records or
        promises of results.
      </p>
    </div>
  );
}
