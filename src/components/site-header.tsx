import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { dockTabs, pathMatches } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SiteHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/session")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSignedIn(Boolean(data?.signedIn));
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setAdminOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-bg/75 backdrop-blur-xl">
      {signedIn ? (
        <nav
          aria-label="Workspace shortcuts"
          className="border-b border-line bg-surface"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-2 sm:px-6">
            <a
              href="/workspace"
              className="inline-flex min-h-11 items-center rounded-lg border border-volt bg-volt px-4 py-2 text-sm font-medium text-bg"
            >
              Workspace · all pages
            </a>
          </div>
        </nav>
      ) : null}
      {isAdmin ? (
        <div className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            <button
              type="button"
              aria-expanded={adminOpen}
              aria-controls="admin-pages-nav"
              onClick={() => {
                setAdminOpen((value) => !value);
                setOpen(false);
              }}
              className="min-h-11 rounded-lg border border-volt/30 px-4 py-2 text-sm font-medium text-volt"
            >
              {adminOpen ? "Close admin pages" : "Admin pages"}
            </button>
            {adminOpen ? (
              <nav
                id="admin-pages-nav"
                aria-label="Administrator pages"
                className="mt-2 grid gap-2 sm:grid-cols-3"
              >
                {[
                  {
                    to: "/control-center-admin",
                    label: "Multi-site control center",
                    description: "Bots, specialists, automation and spending controls",
                  },
                  {
                    to: "/admin",
                    label: "Comparison queue",
                    description: "Website reports, follow-up and comparison settings",
                  },
                  {
                    to: "/lead-inbox",
                    label: "Shared lead inbox",
                    description: "Leads and pipelines for both businesses",
                  },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setAdminOpen(false)}
                    className="rounded-lg border border-line px-3 py-3 text-sm hover:bg-elevated"
                  >
                    <span className="font-medium text-fg">{item.label}</span>
                    <span className="mt-1 block text-xs text-muted">{item.description}</span>
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {dockTabs.map((item) => {
            const active = pathMatches(item.to, pathname);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/contact">Start a project</Link>
          </Button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-line bg-surface px-4 py-4 lg:hidden sm:px-6"
        >
          <div className="grid gap-2">
            {dockTabs.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-line px-4 py-3 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild>
              <Link to="/contact" onClick={() => setOpen(false)}>
                Start a project
              </Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
