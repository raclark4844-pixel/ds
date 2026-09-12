import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/crypto/education")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
