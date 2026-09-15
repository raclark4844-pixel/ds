import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContactNeed = { need?: string };
type SecondaryTo = "/contact" | "/platform" | "/growth" | "/websites" | "/automation";

export function PageHero({
  kicker,
  title,
  lede,
  primary,
  secondary,
  media,
  className,
}: {
  kicker: string;
  title: string;
  lede: ReactNode;
  primary?: { to: "/contact"; label: string; search?: ContactNeed };
  secondary?: {
    to: SecondaryTo;
    label: string;
    search?: ContactNeed;
    variant?: "volt" | "outline";
  };
  media?: { src: string; alt: string };
  className?: string;
}) {
  return (
    <section className={cn("pt-10 sm:pt-16", className)}>
      <div className="relative overflow-hidden">
        <div aria-hidden="true" className="orb -left-20 top-8 size-52 bg-hot/25" />
        <div
          aria-hidden="true"
          className="orb right-0 top-4 size-64 bg-volt/15"
          style={{ animationDelay: "-4s" }}
        />
        <div
          aria-hidden="true"
          className="orb bottom-0 left-1/3 size-40 bg-flare/20"
          style={{ animationDelay: "-9s" }}
        />
        <p className="kicker relative">{kicker}</p>
        <h1 className="relative mt-4 max-w-4xl font-display text-[2.6rem] font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <div className="relative mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          {lede}
        </div>
        {(primary || secondary) && (
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
            {primary ? (
              <Button asChild size="lg">
                <Link to={primary.to} search={primary.search}>
                  {primary.label}
                </Link>
              </Button>
            ) : null}
            {secondary ? (
              <Button asChild size="lg" variant={secondary.variant ?? "outline"}>
                {secondary.to === "/contact" ? (
                  <Link to="/contact" search={secondary.search}>
                    {secondary.label}
                  </Link>
                ) : (
                  <Link to={secondary.to}>{secondary.label}</Link>
                )}
              </Button>
            ) : null}
          </div>
        )}
      </div>
      {media ? (
        <figure className="relative mt-12 overflow-hidden rounded-xl border border-line">
          <img
            src={media.src}
            alt={media.alt}
            width={1600}
            height={900}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-auto w-full object-cover"
          />
        </figure>
      ) : null}
    </section>
  );
}
