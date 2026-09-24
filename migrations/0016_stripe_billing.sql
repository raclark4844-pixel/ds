-- Stripe mappings are administrator-owned. No automatic customers or paid access.
create table dts_stripe_accounts (
 organization_id text primary key references "organization"(id) on delete restrict,
 stripe_customer_id text not null unique,
 enabled boolean not null default false,
 display_name text not null default 'Demore Technology Solutions',
 button_color text not null default '#2563eb',
 subscription_id text unique,
 subscription_status text not null default 'unconfigured',
 checkout_key text,
 checkout_key_created_at timestamptz,
 checkout_session_id text,
 checkout_url text,
 reconcile_token text,
 reconcile_until timestamptz,
 updated_at timestamptz not null default now()
);
create table dts_stripe_receipts (
 id text primary key,
 organization_id text not null references "organization"(id) on delete restrict,
 type text not null,
 processed_at timestamptz not null default now()
);
-- Only verified provider charges may enter this outbox. ESTIMATE records cannot.
create table dts_stripe_meter_outbox (
 operation_id text primary key references dts_usage_operations(id) on delete restrict,
 organization_id text not null references "organization"(id) on delete restrict,
 stripe_customer_id text not null,
 event_name text not null,
 price_id text not null,
 value_microdollars bigint not null check(value_microdollars>=0),
 occurred_at timestamptz not null,
 state text not null default 'READY' check(state in ('READY','SENDING','ACCEPTED','RECONCILE')),
 lease_token text,
 lease_until timestamptz,
 first_attempt_at timestamptz,
 created_at timestamptz not null default now()
);
create index dts_stripe_meter_pending on dts_stripe_meter_outbox(state,lease_until);
