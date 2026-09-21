import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { navIcons } from "@/lib/nav-icons";
import { primaryNav } from "@/lib/site";
import { authClient, authEnabled, signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [authError, setAuthError] = useState("");
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch("/api/admin/review-access", { cache: "no-store" });
        const admin = await response.json();
        if (active) {
          setSignedIn(admin.canSkipContact === true);
          setIsAdmin(admin.canSkipContact === true);
          if (!admin.canSkipContact) setAdminOpen(false);
        }
        const session = authEnabled ? await authClient.getSession() : null;
        if (active) setSignedIn(admin.canSkipContact === true || Boolean(session?.data?.user));
      } catch {
        /* Retain the last confirmed session state. */
      }
    }
    void refresh();
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, []);
  async function logout() {
    setLoggingOut(true);
    setAuthError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Could not log out. Please retry.");
      if (authEnabled) await signOut("/");
      else window.location.href = "/";
    } catch {
      setAuthError("Could not log out. Please retry.");
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
          aria-label="Workspace and Lead Engine shortcuts"
          className="border-b border-line bg-surface"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-2 sm:px-6">
            <a
              href="/workspace"
              className="inline-flex min-h-11 items-center rounded-lg border border-volt bg-volt px-4 py-2 text-sm font-medium text-bg"
            >
              Workspace · all pages
            </a>
            {[
              ["/operations", "Lead Engine"],
              ["/campaigns/new", "New campaign"],
              ["/campaign-history", "All campaigns — current & past"],
            ].map(([path, label]) => (
              <a
                key={path}
                href={`https://demore-lead-engine.vercel.app/api/website-signin/start?next=${encodeURIComponent(path)}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-volt/30 px-4 py-2 text-sm font-medium text-volt hover:bg-elevated"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>
      ) : (
        <div className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
            <span className="text-sm text-muted">Explore the Demore Lead Engine</span>
            <a
              href="/lead-generation#preview"
              className="inline-flex min-h-11 items-center rounded-lg border border-volt/30 px-4 py-2 text-sm font-medium text-volt"
            >
              Preview lead generation
            </a>
          </div>
        </div>
      )}
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
                    activeProps={{ className: "border-volt/50 bg-elevated" }}
                  >
                    <span className="block font-medium text-volt">{item.label}</span>
                    <span className="mt-1 block text-xs text-muted">{item.description}</span>
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      ) : null}
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
          {signedIn ? (
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => void logout()}
              className="shrink-0 px-2 py-2 text-sm font-medium text-volt"
            >
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="shrink-0 px-2 py-2 text-sm font-medium text-volt"
            >
              Log in
            </Link>
          )}
          {authError ? (
            <span role="alert" className="text-xs text-hot">
              {authError}
            </span>
          ) : null}
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
