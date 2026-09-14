import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";

const industry = getIndustry("contractors");

export const Route = createFileRoute("/industries/contractors")({
  head: () => pageHead({ title: "Digital Marketing for Contractors | Demore Technology Solutions", description: industry.description, path: "/industries/contractors" }),
  component: () => <IndustryPage industry={industry} />,
});
