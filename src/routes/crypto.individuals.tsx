import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/crypto/individuals")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
