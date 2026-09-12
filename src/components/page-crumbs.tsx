import { Link } from "@tanstack/react-router";
import type { AppPath } from "@/lib/nav";

type Crumb = { to?: AppPath; label: string };

export function PageCrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-faint">
                  /
                </span>
              ) : null}
              {last || !item.to ? (
                <span className="text-fg" aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-fg">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
