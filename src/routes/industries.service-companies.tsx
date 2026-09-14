import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";

const industry = getIndustry("service-companies");

export const Route = createFileRoute("/industries/service-companies")({
  head: () => pageHead({ title: "Digital Marketing for Service Companies | Demore Technology Solutions", description: industry.description, path: "/industries/service-companies" }),
  component: () => <IndustryPage industry={industry} />,
});
