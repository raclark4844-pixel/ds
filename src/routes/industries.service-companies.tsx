import { createFileRoute } from "@tanstack/react-router";
import { assertPublished } from "@/lib/publish";

export const Route = createFileRoute("/industries/service-companies")({
  beforeLoad: () => assertPublished("industries"),
});
