import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";
const industry = getIndustry("pubs");
export const Route = createFileRoute("/industries/pubs")({
  head: () =>
    pageHead({
      title: "Pubs Websites & Lead Generation | Demore Technology Solutions",
      description: industry.description,
      path: "/industries/pubs",
    }),
  component: () => <IndustryPage industry={industry} />,
});
