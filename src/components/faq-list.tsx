import { Link } from "@tanstack/react-router";
import type { AppPath } from "@/lib/nav";

export type FaqItem = {
  q: string;
  a: string;
  links?: readonly { to: AppPath; label: string }[];
};

export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left font-display text-lg font-semibold tracking-tight text-fg marker:hidden [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <span
              aria-hidden="true"
              className="mt-1 grid size-8 shrink-0 place-items-center rounded-pill hairline text-muted transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="prose-answer mt-3 text-muted">{item.a}</p>
          {item.links && item.links.length > 0 ? (
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {item.links.map((link, index) => (
                <span key={link.to} className="inline-flex items-center gap-3">
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-faint">
                      ·
                    </span>
                  ) : null}
                  <Link to={link.to} className="text-fg underline">
                    {link.label}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </details>
      ))}
    </div>
  );
}
