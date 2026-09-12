import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  kicker,
  title,
  lede,
  children,
  className,
}: {
  id?: string;
  kicker?: string;
  title?: string;
  lede?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("mt-16 sm:mt-24", className)}>
      {kicker ? <p className="kicker">{kicker}</p> : null}
      {title ? (
        <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
      ) : null}
      {lede ? <div className="mt-4 max-w-2xl text-muted">{lede}</div> : null}
      <div className={title || kicker ? "mt-8" : undefined}>{children}</div>
    </section>
  );
}

export function DirectAnswer({
  question,
  children,
}: {
  question: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-14 rounded-xl border border-line bg-surface p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {question}
      </h2>
      <div className="prose-answer mt-4 text-muted">{children}</div>
    </section>
  );
}

export function GeoQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="mt-10 max-w-3xl border-l-2 border-volt pl-5 text-lg leading-relaxed text-fg">
      {children}
    </blockquote>
  );
}
