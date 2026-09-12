import { PageButtons } from "@/components/page-buttons";
import { allMainPages, laterPages, type AppPath } from "@/lib/nav";

export function RelatedOffers({ current }: { current?: AppPath }) {
  return (
    <PageButtons
      items={allMainPages}
      current={current}
      size="strip"
      label="Crawlable paths"
    />
  );
}

export function LaterPages({ current }: { current?: AppPath }) {
  if (laterPages.length === 0) return null;
  return <PageButtons items={laterPages} current={current} size="strip" label="Later pages" />;
}
