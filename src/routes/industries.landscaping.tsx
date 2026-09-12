import { createFileRoute } from "@tanstack/react-router";
import { assertPublished } from "@/lib/publish";

export const Route = createFileRoute("/industries/landscaping")({
  beforeLoad: () => assertPublished("industries"),
});
