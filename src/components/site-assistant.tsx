import {
  activeReview,
  downloadReview,
  registerReview,
  type ReviewDownload,
} from "@/lib/review-download";
import { IndustryMultiselect } from "@/components/industry-multiselect";
import { selectedIndustries } from "@/lib/industry-selection";
import { useEffect, useState } from "react";
import { AssistantWebsiteReview } from "@/components/assistant-website-review";
import { Button } from "@/components/ui/button";
import { ChatCopy } from "@/lib/chat-copy";
import {
  readStoredReportId,
  readStoredReviewBrief,
  storeReportId,
  storeReviewBrief,
} from "@/lib/site-assistant-ids";

type Msg = {
  role: "user" | "assistant";
  content: string;
  pdf?: ReviewDownload;
  citations?: Array<{ url: string; title?: string }>;
  searchedAt?: string | null;
};

const INTRO =
  "Ask about websites, bots, growth, or custom AI platforms. Optionally enter your website above to get a PDF of practical improvements Demore could help with.";

export function SiteAssistant() {
  const [pendingRevision, setPendingRevision] = useState<{
    message: string;
    recordId: string;
  } | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [reportId, setReportId] = useState("");
  const [reviewBrief, setReviewBrief] = useState("");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: INTRO }]);

  useEffect(() => {
    try {
      setIndustries(
        selectedIndustries(JSON.parse(sessionStorage.getItem("demore-chat-industries") || "[]")),
      );
    } catch {
      /* use no selections */
    }
    setReportId(readStoredReportId());
    setReviewBrief(readStoredReviewBrief());
    const onComparisonReady = (event: Event) => {
      const id = (event as CustomEvent<{ reportId?: string }>).detail?.reportId?.trim();
      if (id) setReportId(id);
    };
    const onReviewReady = (event: Event) => {
      const detail =
        (event as CustomEvent<{ reportId?: string; brief?: string; open?: boolean }>).detail || {};
      const id = detail.reportId?.trim();
      const brief = detail.brief?.trim() || "";
      if (id) {
        setPendingRevision(null);
        setReportId(id);
        storeReportId(id);
      }
      if (brief) {
        setReviewBrief(brief);
        storeReviewBrief(brief);
        setMessages([
          {
            role: "assistant",
            content: `I have website review **${id || "ready"}**.\n\n${brief}\n\nAsk what to fix first, or use **Discuss these improvements** on the report.`,
          },
        ]);
      }
      if (detail.open) setOpen(true);
    };
    const onPdfReady = (event: Event) => {
      const data = (event as CustomEvent<ReviewDownload & { brief: string }>).detail;
      setReportId(data.recordId);
      setReviewBrief(data.brief);
      storeReviewBrief(data.brief);
      storeReportId(data.recordId);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Your PDF version ${data.revision} is ready. A copy has been sent to Ryan.`,
          pdf: data,
        },
      ]);
    };
    const openWebsiteReview = () => {
      setOpen(true);
      window.setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>(
          "[data-assistant-panel] input[autocomplete=url]",
        );
        input?.focus({ preventScroll: true });
        input?.scrollIntoView({ block: "nearest" });
      }, 0);
    };
    window.addEventListener("demore:open-review", openWebsiteReview);
    window.addEventListener("demore:pdf-ready", onPdfReady);
    window.addEventListener("demore:comparison-ready", onComparisonReady);
    window.addEventListener("demore:review-ready", onReviewReady);
    return () => {
      window.removeEventListener("demore:open-review", openWebsiteReview);
      window.removeEventListener("demore:pdf-ready", onPdfReady);
      window.removeEventListener("demore:comparison-ready", onComparisonReady);
      window.removeEventListener("demore:review-ready", onReviewReady);
    };
  }, []);

  async function revisePdf(message: string) {
    const review = activeReview();
    if (!review || review.recordId !== reportId) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Generate a website review in this page first, then I can update its PDF. Your existing downloads remain available.",
        },
      ]);
      return;
    }
    const response = await fetch("/api/website-review-revise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...review, message, industries }),
      signal: AbortSignal.timeout(60000),
    });
    const updated = await response.json();
    if (!response.ok) throw new Error(updated.error || "Unable to revise the PDF. Please retry.");
    registerReview(updated);
    setMessages((current) => [...current, { role: "assistant", content: updated.text }]);
    await downloadReview(updated);
  }

  async function confirmRevision(yes: boolean) {
    if (!pendingRevision || busy) return;
    const pending = pendingRevision;
    setPendingRevision(null);
    if (!yes) {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: "I’ll keep the current PDF unchanged." },
      ]);
      return;
    }
    if (activeReview()?.recordId !== pending.recordId) return;
    setBusy(true);
    try {
      await revisePdf(pending.message);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The PDF could not be updated. Your previous copy remains available.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    const message = draft.trim();
    if (!message || busy) return;
    setDraft("");
    if (
      pendingRevision &&
      /^(yes|yes please|please do|go ahead|sure|no|no thanks|not now)[.!]?$/i.test(message)
    ) {
      await confirmRevision(!/^(no|not now)/i.test(message));
      return;
    }
    setPendingRevision(null);
    const next = [...messages, { role: "user" as const, content: message }];
    setMessages(next);
    setBusy(true);
    try {
      const review = activeReview();
      let suggestRevision = false;
      if (review && review.recordId === reportId) {
        const decision = await fetch("/api/website-review-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...review, message }),
          signal: AbortSignal.timeout(55000),
        })
          .then((response) => response.json())
          .catch(() => ({ action: "none" }));
        if (decision.action === "revise") {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content:
                "That changes the improvement plan. I’m updating your PDF and download links now.",
            },
          ]);
          await revisePdf(message);
          return;
        }
        suggestRevision = decision.action === "ask";
      }
      const token = sessionStorage.getItem("demore-report-token") || "";
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          industries,
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
      if (suggestRevision && review) setPendingRevision({ message, recordId: review.recordId });
      setMessages([
        ...next,
        {
          role: "assistant",
          content: suggestRevision
            ? `${reply}\n\nWould you like me to revise your PDF to include this?`
            : reply,
          citations: data.citations,
          searchedAt: data.searchedAt,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The request could not be completed. Your previous PDF is still available.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-20 right-3 z-50 print:hidden sm:bottom-6">
      {open ? (
        <div
          data-assistant-panel
          className="mb-3 flex h-[min(40rem,calc(100dvh-9rem))] w-[min(22rem,calc(100vw-1.5rem))] flex-col rounded-xl border border-line bg-bg shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <div>
              <p className="text-sm font-medium">Ask Demore</p>
              <p className="text-xs text-faint">
                {reportId ? `Demore Report ID ${reportId}` : "No Demore Report ID yet"}
              </p>
            </div>
            <button type="button" className="text-sm text-muted" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <details className="border-b border-line p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Industries{industries.length ? ` (${industries.length} selected)` : " (optional)"}
              </summary>
              <div className="mt-3">
                <IndustryMultiselect
                  optional
                  value={industries}
                  onChange={(items) => {
                    setIndustries(items);
                    try {
                      sessionStorage.setItem("demore-chat-industries", JSON.stringify(items));
                    } catch {
                      /* selections still work */
                    }
                  }}
                />
              </div>
            </details>
            <AssistantWebsiteReview />
            <label className="block border-b border-line px-3 py-2 text-xs">
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
            <div className="space-y-3 p-3 text-sm">
              {messages.map((item, index) => (
                <div key={index} className={item.role === "user" ? "text-fg" : "text-muted"}>
                  <ChatCopy text={item.content} />
                  {item.pdf ? (
                    <a
                      className="mt-2 inline-block rounded-md border border-volt/30 px-3 py-2 text-volt underline"
                      href={item.pdf.href}
                      download={item.pdf.filename}
                    >
                      Download PDF · Version {item.pdf.revision}
                    </a>
                  ) : null}
                  {item.citations?.length ? (
                    <ul className="mt-1 list-disc pl-4 text-xs">
                      {item.citations.map((cite) => (
                        <li key={cite.url}>
                          <a className="underline" href={cite.url} target="_blank" rel="noreferrer">
                            {cite.title || cite.url}
                          </a>
                          {item.searchedAt ? ` · searched ${item.searchedAt}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-line px-3 py-2 text-xs text-muted">
            Share relevant details naturally. I’ll update your report for clear changes and ask
            before adding tentative ideas.
          </div>
          {pendingRevision ? (
            <div className="flex shrink-0 gap-2 px-3 py-2">
              <Button
                type="button"
                size="sm"
                variant="volt"
                disabled={busy}
                onClick={() => void confirmRevision(true)}
              >
                Yes, revise PDF
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => void confirmRevision(false)}
              >
                Keep current PDF
              </Button>
            </div>
          ) : null}
          <form
            className="flex flex-wrap shrink-0 gap-2 border-t border-line p-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              className="min-h-10 min-w-0 flex-1 rounded-md border border-line bg-elevated px-2 text-sm"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Your message"
              placeholder="Ask about services or your review"
            />
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "…" : "Send"}
            </Button>
          </form>
        </div>
      ) : null}
      <Button type="button" size="sm" onClick={() => setOpen((value) => !value)}>
        Ask Demore
      </Button>
    </div>
  );
}
