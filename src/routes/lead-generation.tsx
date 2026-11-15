import { createFileRoute, redirect } from "@tanstack/react-router";

/** Public lead-generation marketing page is hidden until re-enabled. */
export const Route = createFileRoute("/lead-generation")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
