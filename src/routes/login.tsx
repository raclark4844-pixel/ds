import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authEnabled } from "@/lib/auth/client";
import { SignInButtons } from "@/lib/auth/gates";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => pageHead({ title: "Admin Sign In | Demore Technology Solutions", description: "Authorized administrator sign in.", path: "/login" }),
  component: LoginPage,
});

function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/session", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessKey: form.get("accessKey") }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Sign in failed.");
      window.location.href = "/admin";
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign in failed."); setBusy(false); }
  }
  return (
    <main id="main" className="mx-auto min-h-[65vh] max-w-lg px-4 py-16 sm:px-6">
      <p className="kicker">Private administration</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">Sign in to the comparison queue.</h1>
      <p className="mt-4 text-muted">Use the private access key stored in Vercel. It is never included in client code or the database.</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-line bg-surface p-5"><label className="block text-sm">Administrator access key<input required minLength={12} type="password" name="accessKey" autoComplete="current-password" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>{error && <p role="alert" className="text-sm text-hot">{error}</p>}<Button type="submit" disabled={busy}>{busy ? "Signing in…" : "Open admin queue"}</Button></form>
      {authEnabled && <div className="mt-8 border-t border-line pt-8"><p className="mb-4 text-sm text-muted">Or use an allowlisted Grok identity:</p><SignInButtons callbackURL="/admin" /></div>}
    </main>
  );
}
