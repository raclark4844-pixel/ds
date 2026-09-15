import { Check, Minus } from "lucide-react";

const rows = [
  [
    "Strategy",
    "One plan tied to the sales process",
    "Usually limited to site scope",
    "Split across vendors and subscriptions",
  ],
  ["Website & landing pages", "Built as the conversion hub", "Included", "Often separate"],
  [
    "SEO, GEO, AEO & CRO",
    "Designed together from the start",
    "May be an add-on",
    "Handled in separate tools",
  ],
  [
    "Content & social",
    "Connected to campaigns and destinations",
    "Usually separate",
    "Scheduled without a shared funnel",
  ],
  [
    "Lead capture & routing",
    "Qualified, tracked, and handed off",
    "Basic forms",
    "Multiple disconnected handoffs",
  ],
  [
    "Analytics",
    "Shared measurement across the journey",
    "Page-level reporting",
    "Data stays in separate dashboards",
  ],
  [
    "AI assistance",
    "Supports research, creation, analysis, and workflows",
    "Occasional feature",
    "Isolated point solutions",
  ],
  [
    "Ongoing improvement",
    "One measurable system to optimize",
    "Periodic site edits",
    "Each tool is optimized alone",
  ],
] as const;

function CellIcon({ strong }: { strong: boolean }) {
  return strong ? (
    <Check className="size-4 shrink-0 text-volt" aria-hidden="true" />
  ) : (
    <Minus className="size-4 shrink-0 text-faint" aria-hidden="true" />
  );
}

export function PlatformComparison({ compact = false }: { compact?: boolean }) {
  const visibleRows = compact ? rows.slice(0, 6) : rows;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Comparison of Demore's custom AI-assisted platform, a standalone website, and
            disconnected marketing tools.
          </caption>
          <thead>
            <tr className="border-b border-line bg-elevated">
              <th className="p-4 font-medium text-muted">Capability</th>
              <th className="p-4 font-display text-base font-semibold text-volt">
                Custom AI-assisted platform
              </th>
              <th className="p-4 font-medium text-fg">Standalone website</th>
              <th className="p-4 font-medium text-fg">Disconnected tools</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(([capability, platform, website, tools]) => (
              <tr key={capability} className="border-b border-line last:border-0">
                <th scope="row" className="p-4 font-medium text-fg">
                  {capability}
                </th>
                <td className="bg-volt-dim/35 p-4 text-fg">
                  <span className="flex gap-2">
                    <CellIcon strong />
                    {platform}
                  </span>
                </td>
                <td className="p-4 text-muted">
                  <span className="flex gap-2">
                    <CellIcon strong={false} />
                    {website}
                  </span>
                </td>
                <td className="p-4 text-muted">
                  <span className="flex gap-2">
                    <CellIcon strong={false} />
                    {tools}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
