import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { navIcons } from "@/lib/nav-icons";
import { primaryNav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.25rem] sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
          {primaryNav.map((item) => {
            const Icon = navIcons[item.to];
            return (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-2 text-sm text-muted transition-colors duration-200 hover:text-fg"
                activeProps={{ className: "text-fg" }}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/industries"
            className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-2 text-sm text-muted transition-colors duration-200 hover:text-fg"
            activeProps={{ className: "text-fg" }}
          >
            <Building2 className="size-4" aria-hidden="true" />
            Industries
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="shrink-0 px-2 py-2 text-sm font-medium text-volt"
          >
            Log in
          </Link>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/contact">Start a Project</Link>
          </Button>
          <Button asChild size="sm" className="sm:hidden">
            <Link to="/contact">Brief</Link>
          </Button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-pill hairline text-fg xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className={cn("xl:hidden", open ? "block border-t border-line bg-bg" : "hidden")}
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-h-[calc(100dvh-4rem)] max-w-6xl flex-col gap-1 overflow-y-auto px-4 py-4"
        >
          {primaryNav.map((item) => {
            const Icon = navIcons[item.to];
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-base text-fg hover:bg-elevated"
              >
                <Icon className="size-5 text-muted" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/industries"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-base text-fg hover:bg-elevated"
          >
            <Building2 className="size-5 text-muted" aria-hidden="true" />
            Industries
          </Link>
          <div className="mt-4 flex flex-col gap-2 pb-4">
            <Button asChild size="lg">
              <Link to="/contact" onClick={() => setOpen(false)}>
                Start a project brief
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
