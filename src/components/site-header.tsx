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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="Home">
          <Logo size="header" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const Icon = navIcons[item.to];
            return (
              <Link
                key={item.to}
                to={item.to}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-elevated hover:text-fg"
              >
                {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loggingOut}
              onClick={() => void logout()}
            >
              {loggingOut ? "Signing out…" : "Sign out"}
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
          )}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/contact">Start a project</Link>
          </Button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 text-sm md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>
      {authError ? (
        <p className="border-t border-line px-4 py-2 text-sm text-hot sm:px-6" role="alert">
          {authError}
        </p>
      ) : null}
      {open ? (
        <div className="border-t border-line bg-surface md:hidden">
          <nav id="mobile-nav" aria-label="Mobile" className="mx-auto grid max-w-6xl gap-1 px-4 py-4 sm:px-6">
            {primaryNav.map((item) => {
              const Icon = navIcons[item.to];
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-base text-fg hover:bg-elevated"
                >
                  {Icon ? <Icon className="size-5 text-muted" aria-hidden="true" /> : null}
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
      ) : null}
    </header>
  );
}
