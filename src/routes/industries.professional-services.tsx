import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";

const industry = getIndustry("professional-services");

export const Route = createFileRoute("/industries/professional-services")({
  head: () => pageHead({ title: "Digital Marketing for Professional Services | Demore Technology Solutions", description: industry.description, path: "/industries/professional-services" }),
  component: () => <IndustryPage industry={industry} />,
});
