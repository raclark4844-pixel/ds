import { createFileRoute } from "@tanstack/react-router";
import { PrivateData } from "@/components/private-data";
export const Route = createFileRoute("/private-data")({
  component: PrivateData,
  head: () => ({
    meta: [
      { title: "Private records | Demore Technology Solutions" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});
