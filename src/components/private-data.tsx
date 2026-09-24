import { useEffect, useState } from "react";
import { getBearerToken } from "@/lib/auth/client";
type Snapshot = {
  spaces: { id: string; name: string }[];
  orgId: string;
  owner: boolean;
  rows: { id: string; data: Record<string, unknown>; version: number; updated_at: string }[];
  grants: { email: string }[];
  next: string | null;
};
const columns = [
  "providerId",
  "address",
  "unit",
  "city",
  "state",
  "postalCode",
  "ownerName",
  "email",
  "phone",
  "propertyType",
  "yearBuilt",
  "estimatedValue",
  "ownerOccupied",
  "doNotCall",
  "contacts",
];
const labels = [
  "Property ID",
  "Address",
  "Unit",
  "City",
  "State",
  "ZIP",
  "Owner",
  "Email",
  "Phone",
  "Property type",
  "Year built",
  "Value",
  "Owner occupied",
  "Do not call",
  "All returned contacts",
];
async function api(url: string, body?: unknown) {
  const token = getBearerToken();
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    const value = await response.json();
    throw Error(value.error || "Request failed.");
  }
  return response;
}
export function PrivateData() {
  const [data, setData] = useState<Snapshot | null>(null),
    [org, setOrg] = useState(""),
    [after, setAfter] = useState("");
  const [campaign, setCampaign] = useState(""),
    [filter, setFilter] = useState("");
  const [email, setEmail] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const query = new URLSearchParams({ orgId: org, after, campaign: filter }).toString();
  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    api(`/api/private-data?${query}`)
      .then((r) => r.json())
      .then((value) => {
        if (active) setData(value);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [query]);
  async function sharing(target: string, revoke: boolean) {
    if (!data) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/private-data", {
        orgId: data.orgId,
        email: target,
        action: revoke ? "revoke" : "grant",
      });
      setData(await (await api(`/api/private-data?${query}`)).json());
      setEmail("");
      setNotice(
        revoke
          ? "Access removed. Previously downloaded files cannot be recalled."
          : "Read and download access granted.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    setBusy(true);
    setError("");
    try {
      const response = await api(`/api/private-data?${query}&format=csv`),
        url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "batchdata-page.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-12 text-slate-100">
      <h1 className="text-3xl font-semibold">Private BatchData records</h1>
      <p className="my-3 text-slate-300">
        Saved campaign results. New information updates matching properties; each change retains its
        source history.
      </p>
      {error && (
        <p role="alert" className="my-4 text-rose-300">
          {error}{" "}
          <a className="underline" href="/login">
            Sign in
          </a>
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      {!data && !error && <p role="status">Loading private records…</p>}
      {data && (
        <>
          <div className="my-6 flex flex-wrap items-end gap-4">
            <label>
              Company
              <select
                aria-label="Company"
                disabled={busy}
                className="ml-2 rounded bg-slate-800 p-2"
                value={data.orgId}
                onChange={(e) => {
                  setData(null);
                  setOrg(e.target.value);
                  setAfter("");
                  setFilter("");
                  setCampaign("");
                }}
              >
                {data.spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAfter("");
                setFilter(campaign.trim());
              }}
            >
              <label>
                Campaign ID
                <input
                  className="mx-2 rounded bg-slate-800 p-2"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  maxLength={160}
                />
              </label>
              <button className="rounded border p-2">Filter</button>
            </form>
            <button className="rounded border p-2" disabled={busy} onClick={() => void download()}>
              Download this page (CSV)
            </button>
          </div>
          <p className="my-2 text-sm text-slate-400">
            Up to 100 records per page. CSV files open in Excel and other spreadsheet apps. Shared
            viewers can download copies.
          </p>
          <div className="overflow-x-auto rounded border border-slate-700">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Private property and contact results</caption>
              <thead>
                <tr>
                  {labels.map((label) => (
                    <th className="whitespace-nowrap border-b p-3" scope="col" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.id}>
                    {columns.map((key) => (
                      <td className="max-w-xs border-b border-slate-800 p-3" key={key}>
                        {row.data[key] === undefined
                          ? "—"
                          : typeof row.data[key] === "object"
                            ? JSON.stringify(row.data[key])
                            : String(row.data[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.rows.length && <p className="my-8">No saved results for this selection.</p>}
          <div className="my-4 flex gap-3">
            <button className="rounded border p-2" disabled={!after} onClick={() => setAfter("")}>
              First page
            </button>
            <button
              className="rounded border p-2"
              disabled={!data.next}
              onClick={() => setAfter(data.next || "")}
            >
              Next page
            </button>
          </div>
          {data.owner && (
            <section className="my-8 rounded border border-slate-700 p-5">
              <h2 className="text-xl">Manage access</h2>
              <p className="my-2">
                Only you can grant access. Invitees must already have a verified account and
                membership in this company.
              </p>
              <form
                className="flex flex-wrap gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sharing(email, false);
                }}
              >
                <label>
                  Member email
                  <input
                    className="ml-2 rounded bg-slate-800 p-2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <button className="rounded border p-2" disabled={busy}>
                  Grant read and download access
                </button>
              </form>
              <ul className="mt-4">
                {data.grants.map((g) => (
                  <li className="my-2 flex flex-wrap gap-4" key={g.email}>
                    {g.email}
                    <button
                      className="underline"
                      disabled={busy}
                      onClick={() => void sharing(g.email, true)}
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
              {!data.grants.length && (
                <p className="mt-4">Private to you. No additional access granted.</p>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
