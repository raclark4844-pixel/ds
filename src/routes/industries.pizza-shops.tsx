import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";
const industry = getIndustry("pizza-shops");
export const Route = createFileRoute("/industries/pizza-shops")({
  head: () =>
    pageHead({
      title: "Pizza Shops Websites & Lead Generation | Demore Technology Solutions",
      description: industry.description,
      path: "/industries/pizza-shops",
    }),
  component: () => <IndustryPage industry={industry} />,
});
