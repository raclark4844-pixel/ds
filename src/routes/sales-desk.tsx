import { createFileRoute } from "@tanstack/react-router";
import { SalesDesk } from "@/components/sales-desk";
export const Route = createFileRoute("/sales-desk")({
  component: SalesDesk,
  head: () => ({
    meta: [
      { title: "Sales workspace | Demore Technology Solutions" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});
