import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";

const industry = getIndustry("hospitality");

export const Route = createFileRoute("/industries/hospitality")({
  head: () => pageHead({ title: "Digital Marketing for Hospitality Businesses | Demore Technology Solutions", description: industry.description, path: "/industries/hospitality" }),
  component: () => <IndustryPage industry={industry} />,
});
