# Lead Engine stays native to ds

Confirmed by the user on September 23, 2026: keep the Lead Engine within the primary Demore Technology Solutions website and `raclark4844-pixel/ds`. Do not create `dtslg` or split the customer product into a new site.

## Verified source baseline

Read-only fetch identified remote main commit `84e9664`. Unlike the earlier local snapshot, it already contains:

- Better Auth organization plugins in `src/lib/auth/server.ts` and `client.ts`.
- Session middleware, organization membership resolution and tenant roles.
- SQL tenant schema in `migrations/0013_tenant_orgs.sql`.
- Native AI usage billing in `src/lib/billing/process-billed-ai-request.server.ts`.
- Native `/workspace` and `/lead-inbox` routes and organization-scoped lead-list changes.

This branch starts from that fetched baseline. The original working folder and the earlier isolated Next.js drafts remain preserved. A fetched commit proves repository contents, not the state of the deployed website or production database.

## Implementation boundary

Continue in the existing TanStack website, API routes, Better Auth organization IDs and SQL migrations. Do not add a duplicate Next.js application, a parallel `PortalMember` table, a second organization registry, or the earlier website-to-engine customer login bridge. The conditional monorepo proposal is superseded by the verified native tenant functionality.

Existing internal employee systems retain their current access boundaries. Customer features use verified Better Auth membership and explicit organization-scoped authorization. Existing middleware is present; it needs targeted hardening and coverage rather than replacement with Next.js middleware.

The isolated draft's useful Stripe signature validation, integer cost calculations, durable usage reservations, retry handling, strict AI contracts and feed interface are reference implementations. Port only applicable behavior into this application's existing modules. Their earlier test results do not certify the native ds implementation.

## Current branch changes

- Explicit no-deploy configuration and hosted-build release hold.
- Ported local-auth fallback hardening: shared identity only in explicitly opted-in local development, with no database or Vercel environment.
- Preserved the new organization plugin and all remote tenant/billing work.
- Added native tenant authorization hardening, durable usage reservations, Redis admission, Checkout/signature-verified webhooks, and a receipt-backed Stripe meter outbox/worker.
- Added `/sales-desk` with tenant-scoped feed, enrichment/document drawer, status updates, settings and unsent message drafts.
- Added strict Base44 contracts, signed tenant callbacks, transactional activity/escalation storage and a configured team-webhook delivery worker. All external activation flags remain off by default.
- Fixed built-preview packaging of PGlite data/WASM assets; no remote database was used for local preview.

## Remaining integration work

See [release configuration and remaining integration checks](docs/LEAD-ENGINE-RELEASE.md). Remaining work requires isolated Stripe/Upstash configuration, verified provider receipts and cost bounds, real two-company sign-in checks, existing-channel imports, and configuration of the correct Base44 workflows/receiver. The native implementation is not a claim that the separate legacy employee engine has been fully migrated.

Keep all external tests isolated and all real charges/outreach disabled. Before a repository push, verify the Vercel Git deployment hold. Before publication, complete native ds build/tests, migration upgrade checks, browser sign-in/tenant-isolation checks, Stripe test-mode billing reconciliation and Redis failure tests.
