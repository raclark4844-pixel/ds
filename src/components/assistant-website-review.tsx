import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";

type Download = { href: string; filename: string };

export function AssistantWebsiteReview() {
  const fieldId = useId();
  const helpId = useId();
  const [website, setWebsite] = useState("");
  const [phase, setPhase] = useState<"idle" | "review" | "pdf">("idle");
  const [error, setError] = useState("");
  const [download, setDownload] = useState<Download | null>(null);
  const busy = phase !== "idle";

  useEffect(
    () => () => {
      if (download) URL.revokeObjectURL(download.href);
    },
    [download],
  );

  async function createReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!website.trim() || busy) return;
    setError("");
    setDownload(null);
    setPhase("review");
    try {
      const response = await fetch("/api/website-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: website.trim() }),
        signal: AbortSignal.timeout(30000),
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
      const pdf = await fetch("/api/website-review-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: review.recordId,
          token: review.token,
          downloadOnly: true,
        }),
        signal: AbortSignal.timeout(45000),
      });
      if (!pdf.ok || !pdf.headers.get("content-type")?.includes("application/pdf")) {
        const data = await pdf.json().catch(() => ({}));
        throw new Error(data.error || "The PDF could not be created. Please try again.");
      }
      const blob = await pdf.blob();
      if ((await blob.slice(0, 5).text()) !== "%PDF-")
        throw new Error("The PDF could not be created. Please try again.");
      setDownload({
        href: URL.createObjectURL(blob),
        filename: `Demore-Website-Improvements-${review.recordId}.pdf`,
      });
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
        inquiries. Uses publicly available website information.
      </p>
      <Button
        type="submit"
        size="sm"
        variant="volt"
        disabled={busy || !website.trim()}
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
          This may take up to a minute. You can keep chatting.
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
            Download your improvement PDF
          </a>
          <p className="text-muted">Your review is also ready to discuss in this chat.</p>
        </div>
      ) : null}
    </form>
  );
}
