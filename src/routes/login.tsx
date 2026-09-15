import { createFileRoute } from "@tanstack/react-router";
import { SignInButtons } from "@/lib/auth/gates";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => pageHead({ title: "Admin Sign In | Demore Technology Solutions", description: "Authorized administrator sign in.", path: "/login" }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <main id="main" className="mx-auto min-h-[65vh] max-w-lg px-4 py-16 sm:px-6">
      <p className="kicker">Private administration</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">Sign in to the comparison queue.</h1>
      <p className="mt-4 text-muted">Only email addresses on the administrator allowlist can open customer reports or change scoring.</p>
      <div className="mt-8"><SignInButtons callbackURL="/admin" /></div>
    </main>
  );
}
