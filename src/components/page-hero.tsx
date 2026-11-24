import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContactNeed = { need?: string };
type SecondaryTo = "/contact" | "/platform" | "/growth" | "/websites" | "/automation";

const heroImageSizes = "(min-width: 72rem) 72rem, 100vw";

const heroSources: Record<string, readonly { type: string; srcSet: string }[]> = {
  "/media/digital-grid.jpg": [
    {
      type: "image/avif",
      srcSet: "/media/digital-grid-800.avif 800w, /media/digital-grid-1600.avif 1600w",
    },
    {
      type: "image/webp",
      srcSet: "/media/digital-grid-800.webp 800w, /media/digital-grid-1600.webp 1600w",
    },
  ],
  "/media/growth-rays.jpg": [
    {
      type: "image/avif",
      srcSet: "/media/growth-rays-896.avif 896w, /media/growth-rays-1792.avif 1792w",
    },
    {
      type: "image/webp",
      srcSet: "/media/growth-rays-896.webp 896w, /media/growth-rays-1792.webp 1792w",
    },
  ],
};

export function PageHero({
  kicker,
  title,
  lede,
  primary,
  secondary,
  extraAction,
  media,
  className,
}: {
  kicker: string;
  title: string;
  lede: ReactNode;
  primary?: { to: "/contact"; label: string; search?: ContactNeed; variant?: "primary" | "volt" | "outline" };
  secondary?: {
    to: SecondaryTo;
    label: string;
    search?: ContactNeed;
    variant?: "volt" | "outline";
  };
  extraAction?: ReactNode;
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
        {(primary || secondary || extraAction) && (
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {primary ? (
              <Button asChild size="lg" variant={primary.variant ?? "primary"}>
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
            {extraAction}
          </div>
        )}
      </div>
      {media ? (
        <figure className="relative mt-12 overflow-hidden rounded-xl border border-line">
          <picture>
            {(heroSources[media.src] ?? []).map((source) => (
              <source
                key={source.type}
                type={source.type}
                srcSet={source.srcSet}
                sizes={heroImageSizes}
              />
            ))}
            <img
              src={media.src}
              alt={media.alt}
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-cover"
            />
          </picture>
        </figure>
      ) : null}
    </section>
  );
}
