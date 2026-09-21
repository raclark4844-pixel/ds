import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
type Registry = {
  mode: string;
  updatedAt: string;
  sites: {
    id: string;
    name: string;
    url: string;
    email: string;
    platform: string;
    status: string;
  }[];
  capabilities: { id: string; name: string; purpose: string; output: string }[];
  providers: string[];
  gates: string[];
  nextSteps: string[];
};
export const Route = createFileRoute("/control-center-admin")({
  head: () => {
    const h = pageHead({
      title: "Control Center Administration | Demore Technology Solutions",
      description: "Private multi-site readiness workspace.",
      path: "/control-center-admin",
    });
    return {
      ...h,
      meta: h.meta
        .filter((m) => !("name" in m && m.name === "robots"))
        .concat([{ name: "robots", content: "noindex,nofollow" }]),
    };
  },
  component: Admin,
});
function Admin() {
  const [data, setData] = useState<Registry | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("demore");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/control-center", { credentials: "same-origin", signal: controller.signal })
      .then(async (r) => {
        if (!r.ok)
          throw new Error(
            r.status === 401 || r.status === 403 || r.status === 503
              ? "Administrator sign-in is required."
              : "The registry is temporarily unavailable.",
          );
        return r.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, []);
  const site = data?.sites.find((s) => s.id === selected);
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="kicker">Administrator workspace</p>
      <h1 className="mt-4 text-4xl font-semibold">Multi-site control center</h1>
      <Link
        to="/lead-inbox"
        className="mt-5 mr-6 inline-block rounded-lg bg-volt px-5 py-3 font-semibold text-black"
      >
        Open shared lead inbox →
      </Link>
      <Link to="/control-center" className="mt-4 inline-block text-volt">
        View customer preview →
      </Link>
      {error ? (
        <div className="mt-8 rounded-xl border border-line p-6">
          <p role="alert">{error}</p>
          <Link to="/login" className="mt-4 inline-block text-volt underline">
            Log in
          </Link>
          <p className="mt-3 text-sm text-muted">After signing in, return to this page.</p>
        </div>
      ) : !data ? (
        <p className="mt-8" role="status">
          Checking administrator access…
        </p>
      ) : (
        <>
          <p className="mt-6 text-muted">
            {data.mode} · Configuration snapshot {data.updatedAt}. These are readiness records, not
            live telemetry. Automatic inbox first-assignment is connected; general website-editing execution is not connected.
          </p>
          <label className="mt-8 block">
            Site profile
            <select
              className="mt-2 block w-full max-w-xl rounded-lg border border-line bg-surface p-3"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {data.sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          {site && (
            <section className="mt-6 rounded-xl border border-line p-6">
              <h2 className="text-2xl font-semibold">{site.name}</h2>
              <a className="mt-3 block break-all text-volt underline" href={site.url}>
                {site.url}
              </a>
              <p className="mt-3">Public email: {site.email}</p>
              <p className="mt-2 text-muted">
                {site.platform} · {site.status}
              </p>
            </section>
          )}
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Provider architecture</h2>
            <p className="mt-3 text-muted">
              {data.providers.join(" · ")}. Credentials and provider balances are not exposed here.
            </p>
          </section>
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Approval gates</h2>
            <ul className="mt-4 space-y-3">
              {data.gates.map((g) => (
                <li key={g} className="rounded-lg border border-line p-4">
                  {g}
                </li>
              ))}
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="text-xl font-semibold">
              Bot registry · {data.capabilities.length} capabilities
            </h2>
            <p className="mt-3 text-muted">
              All listed capabilities are in scope for both sites. A registry entry is not an active
              integration.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.capabilities.map((b) => (
                <article key={b.id} className="rounded-lg border border-line p-4">
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="mt-2 text-sm text-muted">{b.purpose}</p>
                  <p className="mt-2 text-xs text-volt">Activation requires verified integration</p>
                </article>
              ))}
            </div>
          </section>
          <section className="mt-10">
            <h2 className="text-xl font-semibold">Next integration checks</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted">
              {data.nextSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}
