import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/crypto/vs-blockchain")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
