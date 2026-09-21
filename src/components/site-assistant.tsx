import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatCopy } from "@/lib/chat-copy";
import { readStoredReportId, readStoredReviewBrief, storeReportId, storeReviewBrief } from "@/lib/site-assistant-ids";

type Msg = { role: "user" | "assistant"; content: string; citations?: Array<{ url: string; title?: string }>; searchedAt?: string | null };

const INTRO = "We can review your current website, compare it with relevant competitors, and explain the report. If you already have a Demore Report ID, enter it below. Otherwise start at /compare.";

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [reportId, setReportId] = useState("");
  const [reviewBrief, setReviewBrief] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: INTRO }]);

  useEffect(() => {
    setReportId(readStoredReportId());
    setReviewBrief(readStoredReviewBrief());
    const onComparisonReady = (event: Event) => {
      const id = (event as CustomEvent<{ reportId?: string }>).detail?.reportId?.trim();
      if (id) setReportId(id);
    };
    const onReviewReady = (event: Event) => {
      const detail = (event as CustomEvent<{ reportId?: string; brief?: string; open?: boolean }>).detail || {};
      const id = detail.reportId?.trim();
      const brief = detail.brief?.trim() || "";
      if (id) {
        setReportId(id);
        storeReportId(id);
      }
      if (brief) {
        setReviewBrief(brief);
        storeReviewBrief(brief);
        setMessages([
          { role: "assistant", content: `I have website review **${id || "ready"}**.\n\n${brief}\n\nAsk what to fix first, or use **Discuss these improvements** on the report.` },
        ]);
      }
      if (detail.open) setOpen(true);
    };
    window.addEventListener("demore:comparison-ready", onComparisonReady);
    window.addEventListener("demore:review-ready", onReviewReady);
    return () => {
      window.removeEventListener("demore:comparison-ready", onComparisonReady);
      window.removeEventListener("demore:review-ready", onReviewReady);
    };
  }, []);

  async function send() {
    const message = draft.trim();
    if (!message || busy) return;
    setDraft("");
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setBusy(true);
    try {
      const token = sessionStorage.getItem("demore-report-token") || "";
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: next.slice(-8).map(({ role, content }) => ({ role, content })),
          reportId: reportId || undefined,
          token: token || undefined,
          reviewBrief: reviewBrief || undefined,
        }),
      });
      const data = await res.json();
      if (data.reportId) {
        storeReportId(data.reportId);
        setReportId(data.reportId);
      }
      const reply = data.ok
        ? data.text
        : data.error || "Live web information is temporarily unavailable.";
      setMessages([...next, {
        role: "assistant",
        content: reply,
        citations: data.citations,
        searchedAt: data.searchedAt,
      }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Live web information is temporarily unavailable. Use the saved comparison report or labeled benchmarks." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-20 right-3 z-50 print:hidden sm:bottom-6">
      {open ? (
        <div className="mb-3 flex h-[28rem] w-[min(22rem,calc(100vw-1.5rem))] flex-col rounded-xl border border-line bg-bg shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <div>
              <p className="text-sm font-medium">Ask Demore</p>
              <p className="text-xs text-faint">{reportId ? `Demore Report ID ${reportId}` : "No Demore Report ID yet"}</p>
            </div>
            <button type="button" className="text-sm text-muted" onClick={() => setOpen(false)}>Close</button>
          </div>
          <label className="border-b border-line px-3 py-2 text-xs">
            Demore Report ID
            <input
              className="mt-1 w-full rounded-md border border-line bg-elevated px-2 py-1 text-sm"
              value={reportId}
              onChange={(e) => {
                setReportId(e.target.value);
                storeReportId(e.target.value);
              }}
              placeholder="Paste after /compare submits"
            />
          </label>
          <div className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
            {messages.map((item, index) => (
              <div key={index} className={item.role === "user" ? "text-fg" : "text-muted"}>
                <ChatCopy text={item.content} />
                {item.citations?.length ? (
                  <ul className="mt-1 list-disc pl-4 text-xs">
                    {item.citations.map((cite) => (
                      <li key={cite.url}><a className="underline" href={cite.url} target="_blank" rel="noreferrer">{cite.title || cite.url}</a>{item.searchedAt ? ` · searched ${item.searchedAt}` : ""}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
          <form className="flex gap-2 border-t border-line p-2" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            <input className="min-h-10 flex-1 rounded-md border border-line bg-elevated px-2 text-sm" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about the report or current competitors" />
            <Button type="submit" size="sm" disabled={busy}>{busy ? "…" : "Send"}</Button>
          </form>
        </div>
      ) : null}
      <Button type="button" size="sm" onClick={() => setOpen((value) => !value)}>Ask Demore</Button>
    </div>
  );
}
