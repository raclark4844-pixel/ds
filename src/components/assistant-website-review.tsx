import {
  downloadReview,
  registerReview,
  latestReviewDownload,
  type ReviewDownload,
} from "@/lib/review-download";
import { ReviewContactFields } from "@/components/review-contact-fields";
import { useReviewContact } from "@/lib/use-review-contact";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";

export function AssistantWebsiteReview({ industries = [], onWebsiteChange, conversation = [], chatBusy = false }: { conversation?: Array<{role: "user" | "assistant"; content: string}>; chatBusy?: boolean; industries?: string[]; onWebsiteChange?: (website: string) => void } = {}) {
  const contactState = useReviewContact();
  const fieldId = useId();
  const helpId = useId();
  const [market, setMarket] = useState("");
  const [website, setWebsite] = useState("");
  const [phase, setPhase] = useState<"idle" | "review" | "pdf">("idle");
  const [error, setError] = useState("");
  const [download, setDownload] = useState<ReviewDownload | null>(latestReviewDownload);
  const busy = phase !== "idle";

  useEffect(() => {
    const ready = () => setDownload(latestReviewDownload());
    window.addEventListener("demore:pdf-ready", ready);
    return () => window.removeEventListener("demore:pdf-ready", ready);
  }, []);

  async function createReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!website.trim() || busy || chatBusy) return;
    setError("");
    setPhase("review");
    try {
      const response = await fetch("/api/website-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: website.trim(),
          industry: industries.join(" | "),
          market,
          conversation: conversation.slice(-20).map(item => ({...item, content: item.content.slice(0, 6000)})),
          contact: contactState.skipContact ? undefined : contactState.contact,
          skipContact: contactState.skipContact,
        }),
        signal: AbortSignal.timeout(65000),
      });
      const review = await response.json();
      if (!response.ok || !review.ok)
        throw new Error(review.error || "Unable to review this website.");
      window.dispatchEvent(
        new CustomEvent("demore:review-ready", {
          detail: { reportId: review.recordId, brief: review.report.assistantBrief },
        }),
      );
      setPhase("pdf");
      const active = {
        recordId: review.recordId,
        token: review.token,
        brief: review.report.assistantBrief,
        revision: 1,
      };
      registerReview(active);
      await downloadReview(active);
    } catch (err) {
      setError(
        err instanceof Error && err.name === "TimeoutError"
          ? "The report took too long. Please try again."
          : err instanceof Error
            ? err.message
            : "Unable to create your report. Please try again.",
      );
    } finally {
      setPhase("idle");
    }
  }

  return (
    <form onSubmit={createReport} className="space-y-2 border-b border-line p-3">
      <label htmlFor={fieldId} className="block text-xs font-medium">
        Your website (optional)
      </label>
      <input
        id={fieldId}
        value={website}
        onChange={(event) => {
          setWebsite(event.target.value);
          onWebsiteChange?.(event.target.value);
          setDownload(null);
          setError("");
        }}
        placeholder="yourbusiness.com"
        autoComplete="url"
        inputMode="url"
        maxLength={2048}
        disabled={busy}
        aria-describedby={helpId}
        className="min-h-10 w-full rounded-md border border-line bg-elevated px-2 text-base"
      />
      <p id={helpId} className="text-xs leading-relaxed text-muted">
        Get a PDF showing how Demore could improve your website, search visibility, and customer
        inquiries. Includes your latest 20 chat messages and replies (up to 6,000 characters each), alongside publicly available website information.
      </p>
      <label className="block text-xs font-medium">Target city or region (optional)<input value={market} onChange={e=>setMarket(e.target.value)} maxLength={150} disabled={busy} placeholder="City, State — for competitor comparison" className="mt-1 min-h-10 w-full rounded-md border border-line bg-elevated px-2 text-base" /></label>
      <ReviewContactFields state={contactState} disabled={busy} />
      <Button
        type="submit"
        size="sm"
        variant="volt"
        disabled={busy || chatBusy || !website.trim()}
        className="w-full"
      >
        {phase === "review"
          ? "Reviewing your website…"
          : phase === "pdf"
            ? "Preparing your PDF…"
            : "Create my improvement PDF"}
      </Button>
      {busy ? (
        <p role="status" className="text-xs text-muted">
          This may take up to a minute. Includes the conversation available when you clicked; new messages can be included in your next PDF.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-hot">
          {error}
        </p>
      ) : null}
      {download ? (
        <div role="status" className="text-xs">
          <a
            href={download.href}
            download={download.filename}
            className="inline-block py-2 font-medium text-volt underline underline-offset-4"
          >
            Download your improvement PDF (v{download.revision})
          </a>
          <p className="text-muted">Your review is also ready to discuss in this chat.</p>
        </div>
      ) : null}
    </form>
  );
}
