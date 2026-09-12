import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/crypto/bitcoin")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
