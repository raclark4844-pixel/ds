import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-4 py-20">
      <p className="kicker">404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
        That page is not here.
      </h1>
      <p className="mt-4 max-w-lg text-muted">
        The URL does not match a live page. Home, the AI growth platform, websites, growth,
        automation, industries, and the project brief are live.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/platform">AI growth platform</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/contact">Start a project brief</Link>
        </Button>
      </div>
    </main>
  );
}
