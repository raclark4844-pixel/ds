import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

type SecondaryTo = "/contact" | "/growth" | "/websites" | "/automation" | "/claims" | "/industries";

export function CtaBand({
  kicker,
  title,
  body,
  primaryLabel = "Start a project brief",
  primaryNeed,
  primaryIndustry,
  secondary,
}: {
  kicker: string;
  title: string;
  body: string;
  primaryLabel?: string;
  primaryNeed?: string;
  primaryIndustry?: string;
  secondary?: {
    label: string;
    to: SecondaryTo;
    search?: { need?: string; industry?: string };
    variant?: "claim" | "volt" | "outline";
  };
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-line bg-elevated px-6 py-10 sm:px-10 sm:py-14">
      <div aria-hidden="true" className="orb -right-16 -top-16 size-56 bg-hot/30" />
      <div
        aria-hidden="true"
        className="orb -bottom-20 left-10 size-48 bg-volt/20"
        style={{ animationDelay: "-6s" }}
      />
      <p className="kicker relative">{kicker}</p>
      <h2 className="relative mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="relative mt-4 max-w-xl text-muted">{body}</p>
      <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link
            to="/contact"
            search={primaryNeed ? { need: primaryNeed } : undefined}
          >
            {primaryLabel}
          </Link>
        </Button>
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
    </section>
  );
}
