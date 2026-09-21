import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";
const industry = getIndustry("restaurants");
export const Route = createFileRoute("/industries/restaurants")({
  head: () =>
    pageHead({
      title: "Restaurants Websites & Lead Generation | Demore Technology Solutions",
      description: industry.description,
      path: "/industries/restaurants",
    }),
  component: () => <IndustryPage industry={industry} />,
});
