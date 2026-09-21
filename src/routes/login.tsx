import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient, authEnabled } from "@/lib/auth/client";
import { SignInButtons } from "@/lib/auth/gates";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () =>
    pageHead({
      title: "Log in | Demore Technology Solutions",
      description: "Administrator login and password recovery.",
      path: "/login",
    }),
  component: LoginPage,
});
const control = "mt-1 min-h-11 w-full rounded-md border border-line bg-bg px-3 py-2";
function LoginPage() {
  const [mode, setMode] = useState<"login" | "request" | "reset">("login");
  const [destination, setDestination] = useState("/admin");
  const [existingSession, setExistingSession] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("state") || "";
    const challenge = params.get("challenge") || "";
    if (
      params.get("app") === "lead-engine" &&
      /^[a-f0-9]{64}$/.test(state) &&
      /^[A-Za-z0-9_-]{43}$/.test(challenge)
    ) {
      setDestination(`/api/lead-engine/authorize?${new URLSearchParams({ state, challenge })}`);
    }
    void (async () => {
      try {
        const response = await fetch("/api/admin/review-access", { cache: "no-store" });
        const admin = await response.json();
        const session = authEnabled ? await authClient.getSession() : null;
        setExistingSession(
          admin.canSkipContact === true || session?.data?.user?.emailVerified === true,
        );
      } catch {
        /* The sign-in form remains available. */
      }
    })();
    const reset = new URLSearchParams(window.location.hash.slice(1)).get("reset");
    if (reset) {
      setToken(reset);
      setMode("reset");
      window.history.replaceState(null, "", "/login");
    }
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      if (mode === "reset" && form.get("password") !== form.get("confirm"))
        throw new Error("The passwords do not match.");
      const body =
        mode === "login"
          ? { accessKey: form.get("password") }
          : mode === "request"
            ? { action: "request", email: form.get("email") }
            : { action: "complete", token, password: form.get("password") };
      const response = await fetch(
        mode === "login" ? "/api/admin/session" : "/api/admin/password-reset",
        {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again.");
      if (mode === "login") {
        window.location.href = destination;
        return;
      }
      if (mode === "request") setNotice(data.message);
      else {
        setToken("");
        setMode("login");
        setNotice("Your password has been reset. Sign in with your new password.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="mx-auto min-h-[65vh] max-w-lg px-4 py-16 sm:px-6">
      <p className="kicker">Demore account</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">
        {mode === "login"
          ? "Log in."
          : mode === "request"
            ? "Reset your password."
            : "Choose a new password."}
      </h1>
      <p className="mt-4 text-muted">
        {mode === "login"
          ? "Use your website login for Demore and the Lead Engine. Your existing account permissions stay the same."
          : mode === "request"
            ? "Enter your administrator email. We’ll email a one-time reset link valid for 15 minutes."
            : "Use at least 12 characters. Resetting your password signs out existing administrator sessions."}
      </p>
      {mode === "login" && existingSession ? (
        <a
          className="mt-6 inline-block rounded-lg bg-volt px-5 py-3 font-medium text-bg"
          href={destination}
        >
          Continue with your website account
        </a>
      ) : null}
      <form
        key={mode}
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-xl border border-line bg-surface p-5"
      >
        {mode === "request" ? (
          <label className="block text-sm">
            Administrator email
            <input required type="email" name="email" autoComplete="email" className={control} />
          </label>
        ) : (
          <>
            <label className="block text-sm">
              {mode === "reset" ? "New password" : "Password"}
              <input
                required
                minLength={12}
                maxLength={mode === "reset" ? 128 : 500}
                type="password"
                name="password"
                autoComplete={mode === "reset" ? "new-password" : "current-password"}
                className={control}
              />
            </label>
            {mode === "reset" ? (
              <label className="block text-sm">
                Confirm new password
                <input
                  required
                  minLength={12}
                  maxLength={128}
                  type="password"
                  name="confirm"
                  autoComplete="new-password"
                  className={control}
                />
              </label>
            ) : null}
          </>
        )}
        {error ? (
          <p role="alert" className="text-sm text-hot">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="text-sm text-volt">
            {notice}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "login"
              ? "Log in"
              : mode === "request"
                ? "Email reset link"
                : "Save new password"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-5 text-sm text-volt underline"
        disabled={busy}
        onClick={() => {
          setMode(mode === "login" ? "request" : "login");
          setError("");
          setNotice("");
        }}
      >
        {mode === "login" ? "Forgot your password?" : "Back to login"}
      </button>
      <p className="mt-6 text-sm text-muted">
        Open your workspace with your website account:{" "}
        <a
          className="text-volt underline"
          href="https://demore-lead-engine.vercel.app/api/website-signin/start"
        >
          Continue to Lead Engine
        </a>
        .
      </p>
      {authEnabled && mode === "login" ? (
        <div className="mt-8 border-t border-line pt-8">
          <SignInButtons callbackURL={destination} />
        </div>
      ) : null}
    </main>
  );
}
