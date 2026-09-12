import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/crypto/business")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
