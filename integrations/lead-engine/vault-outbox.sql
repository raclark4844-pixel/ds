-- Apply to the existing employee campaign database, never the ds website DB.
create table if not exists "DtsVaultOutbox" (
 id text primary key,
 customer_id text not null,
 payload jsonb not null,
 digest text not null,
 status text not null default 'ready' check(status in ('ready','sending','accepted','review')),
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 lease_token text,
 lease_until timestamptz,
 created_at timestamptz not null default now(),
 accepted_at timestamptz
);
create index if not exists dts_vault_outbox_pending on "DtsVaultOutbox"(next_attempt_at) where status in ('ready','sending');
