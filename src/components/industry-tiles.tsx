import { Link } from "@tanstack/react-router";
import { industries, type Industry } from "@/lib/industries";
import { cn } from "@/lib/utils";

const accentBar: Record<Industry["accent"], string> = {
  hot: "bg-hot",
  volt: "bg-volt",
  flare: "bg-flare",
};

const accentText: Record<Industry["accent"], string> = {
  hot: "text-hot",
  volt: "text-volt",
  flare: "text-flare",
};

function IndustryIcon({ kind, label }: { kind: Industry["icon"]; label: string }) {
  const common = "size-10";
  if (kind === "leaf") {
    return (
      <svg viewBox="0 0 40 40" className={common} role="img" aria-label={label}>
        <title>{label}</title>
        <path d="M8 30c10-16 18-20 26-22-1 12-9 22-26 22Z" className="fill-current" />
        <path d="M10 30C16 22 20 14 22 8" className="stroke-bg" fill="none" strokeWidth="1.6" />
      </svg>
    );
  }
  if (kind === "glass") {
    return (
      <svg viewBox="0 0 40 40" className={common} role="img" aria-label={label}>
        <title>{label}</title>
        <path d="M12 6h16l-3 14H15L12 6Z" className="fill-current" />
        <path d="M20 20v10" className="stroke-current" fill="none" strokeWidth="2.2" />
        <path d="M14 34h12" className="stroke-current" fill="none" strokeWidth="2.2" />
      </svg>
    );
  }
  if (kind === "bag") {
    return (
      <svg viewBox="0 0 40 40" className={common} role="img" aria-label={label}>
        <title>{label}</title>
        <path d="M11 14h18l-1.5 18H12.5L11 14Z" className="fill-current" />
        <path d="M16 14c0-4 8-4 8 0" className="stroke-current" fill="none" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === "wrench") {
    return (
      <svg viewBox="0 0 40 40" className={common} role="img" aria-label={label}>
        <title>{label}</title>
        <rect x="18" y="8" width="5" height="22" rx="1" className="fill-current" />
        <rect x="14" y="26" width="13" height="6" rx="1" className="fill-current" />
        <rect x="10" y="8" width="21" height="5" rx="1" className="fill-current" />
      </svg>
    );
  }
  if (kind === "roof") {
    return (
      <svg viewBox="0 0 40 40" className={common} role="img" aria-label={label}>
        <title>{label}</title>
        <path d="M6 20 L20 8 L34 20" className="stroke-current" fill="none" strokeWidth="2.4" strokeLinejoin="miter" />
        <rect x="12" y="20" width="16" height="14" className="fill-current" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className={common} role="img" aria-label={label}>
      <title>{label}</title>
      <rect x="8" y="14" width="24" height="16" className="fill-current" />
      <rect x="12" y="8" width="16" height="4" className="fill-current" />
    </svg>
  );
}

export function IndustryTiles({
  current,
  className,
}: {
  current?: string;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6",
        className,
      )}
    >
      {industries.map((item) => {
        const active = current === item.path;
        return (
          <li key={item.slug}>
            <Link
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-full min-h-36 flex-col gap-3 overflow-hidden rounded-xl border border-line bg-surface p-4 no-underline transition-colors duration-200 hover:border-fg/35 hover:bg-elevated focus-visible:outline-none",
                active && "border-volt/50 bg-volt-dim",
              )}
            >
              <span className={cn("absolute inset-x-0 top-0 h-1", accentBar[item.accent])} />
              <span className={cn(accentText[item.accent])}>
                <IndustryIcon kind={item.icon} label={item.iconAlt} />
              </span>
              <span className="font-display text-base font-semibold leading-tight tracking-tight text-fg">
                {item.navLabel}
              </span>
              <span className="text-sm leading-snug text-muted">{item.tileLine}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
