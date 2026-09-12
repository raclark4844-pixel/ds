import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/crypto/contractors")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
