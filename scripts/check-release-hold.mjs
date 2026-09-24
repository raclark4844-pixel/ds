import { existsSync } from "node:fs";

// Local compilation remains available. Hosted builds must wait for release review.
if (
  (process.env.VERCEL || process.env.VERCEL_ENV) &&
  existsSync(new URL("../RELEASE-HOLD.md", import.meta.url))
) {
  throw new Error(
    "Lead Engine upgrades are under release hold. Hosted publication is not approved.",
  );
}
