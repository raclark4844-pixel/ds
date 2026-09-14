import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";

const industry = getIndustry("landscaping");

export const Route = createFileRoute("/industries/landscaping")({
  head: () => pageHead({ title: "Digital Marketing for Landscaping Companies | Demore Technology Solutions", description: industry.description, path: "/industries/landscaping" }),
  component: () => <IndustryPage industry={industry} />,
});
