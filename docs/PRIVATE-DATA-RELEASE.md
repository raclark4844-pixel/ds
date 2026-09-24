# Stripe-deferred internal release and private BatchData records

Scope: the existing ds website, used by Demore Technology Solutions and Demore Exterior Solutions. Stripe is deferred; no provider purchases, paid campaign runs, or outreach were authorized by this development request. The user authorized direct local implementation with Base44 review and a tested nonbilling production release. Remaining verification prerequisites still prevent production promotion.

## Implemented

- `/private-data`: authenticated spreadsheet-style table, company selection, campaign filter, cursor pagination, CSV download for the displayed page, owner-only grant/revoke controls. Every additional viewer must already be a verified member of the selected organization. A company administrator receives no automatic private-data access. Sharing permits downloads; revocation cannot recall downloaded copies.
- Signed `/api/webhooks/batchdata-results`: integration credentials determine the organization, never the body. Strict fields, 256 KB/100-record maximum, five-minute signature age, per-org durable receipt replay, atomic imports and history. Integration secrets must be distinct. Credentials remain server-only.
- Duplicate matching by provider property ID or normalized full property address including unit. Newer nonempty fields replace older values; missing values preserve saved fields, stale values cannot overwrite newer fields, and conflicting property IDs/addresses/timestamps reject the whole batch with a sanitized 409. No fuzzy person/household matching. Matching is within a company; the two companies retain separate datasets. Contact restrictions and all normalized returned contacts are retained. Capturing data never grants outreach consent.
- Observation history includes previous/incoming/resulting values. Private reads and CSV exports record actor, company, record IDs and time; grant/revoke actions are audited separately. Website access cannot rewrite the observation history.
- `BILLING_MODE=stripe` is now required in addition to each Stripe feature flag. Missing/unknown/deferred mode disables checkout, Stripe callbacks and the scheduled meter entry point. Checkout UI is hidden when unavailable. Verified-cost paid-provider requests remain blocked in deferred mode; usage budgets are not bypassed.
- Internal sales access requires exact `INTERNAL_WORKSPACE_IDS` plus fresh real membership. Company switching uses Better Auth's membership-validated organization API. Website lead ownership is corrected by fixed site identifiers; a backfill with existing linked client details/activity blocks for review instead of moving related data silently.

## Configuration, after isolated staging verification

- `BILLING_MODE=deferred`; keep all Stripe feature flags disabled, no Stripe credentials required for private records/sales.
- `CLIENT_PORTAL_ENABLED=true` and `INTERNAL_WORKSPACE_IDS=org_demore_technology_solutions,org_demore_exterior_solutions` after verifying both organizations and their memberships.
- `PRIVATE_DATA_VAULT_ENABLED=true` only after provisioning the sole initial owner. Run `scripts/provision-private-vault.ts` with privately configured `DATABASE_URL` and the user-confirmed `PRIVATE_VAULT_OWNER_EMAIL`. Default invocation is read-only; `--apply` creates missing membership and vault records only. It refuses ambiguous/unverified users and conflicting existing ownership. It never reassigns an existing vault, grants another viewer, or creates a paid budget.
- `BATCHDATA_VAULT_IMPORT_ENABLED=true` and `BATCHDATA_VAULT_INTEGRATIONS_JSON` mapping integration IDs to `{orgId,secret}`. Each business needs a distinct random credential of at least 32 characters. Keep values in secret storage, never source control.
- Install and test capture hooks in the verified active employee runner and its durable outbox before enabling automatic imports. See `integrations/lead-engine/README.md`. Merely deploying ds does NOT connect the campaign runner. Its Vercel project currently has no linked Git repository. The outbox schema targets that existing campaign database; migrations 0020–0022 target ds.
- Owner approval is still needed to choose the initial login; the two existing candidate owner email addresses must not both be silently granted access.

## Current live inspection and remaining release blockers

Vercel CLI confirmed `ds` links to the intended ds repository, repository root, main production branch, and default build command. Remote Git creation is enabled; this upgrade branch's `git.deploymentEnabled:false` and hosted build hold remain intact. The separate existing campaign runner has no Git link. Remote setting names showed no explicit Better Auth URL/secret/OAuth client configuration; this is a configuration gap to verify, not proof login works or fails.

The Neon connector returns `project_id` missing despite exposing no project ID parameter. Production schema, backup and migrations have NOT been verified. Automatic approval review rejected downloading all production environment secrets; that action was not executed. Use a corrected scoped database connection or a narrowly authorized read-only schema check, never copy unrelated secrets to work around the rejection.

No real owner login, two-company end-to-end OAuth test, live capture hook, production migration, provider purchase or deployment has been performed. Real database/auth provisioning, review of existing lead mappings, owner confirmation and campaign binding remain required. Do not remove `RELEASE-HOLD.md` until these checks pass.

## Verification evidence

- Full local suite: 90 tests passed before final UI-only company-switch adjustment; relevant regression tests are rerun with the final checkpoint.
- Real disposable localhost PostgreSQL: ledger migration/lifecycle and vault migration, duplicate merge, concurrent replay, grants/revocation and isolation passed. This is not a production snapshot test.
- Synthetic durable outbox tests: page/enrichment capture, all returned contacts, signed receipt binding, replay, rollback, transient retry and permanent conflict behavior passed.
- TypeScript and production compilation passed. A local browser check passed desktop/mobile table rendering, owner grant/revoke controls, CSV page download, company switching and zero page errors using synthetic intercepted private-data responses. Actual local private-data, sales and checkout endpoints returned 503 with release flags disabled. This does not verify real OAuth or live campaign capture.
- Base44 source review and caveats are recorded in `BASE44-PRIVATE-DATA-REVIEW.md`.
