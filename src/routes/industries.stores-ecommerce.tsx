import { createFileRoute } from "@tanstack/react-router";
import { IndustryPage } from "@/components/industry-page";
import { getIndustry } from "@/lib/industries";
import { pageHead } from "@/lib/seo";

const industry = getIndustry("stores-ecommerce");

export const Route = createFileRoute("/industries/stores-ecommerce")({
  head: () => pageHead({ title: "Digital Marketing for Retail and Ecommerce | Demore Technology Solutions", description: industry.description, path: "/industries/stores-ecommerce" }),
  component: () => <IndustryPage industry={industry} />,
});
