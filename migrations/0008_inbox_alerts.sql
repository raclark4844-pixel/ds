create table if not exists dts_inbox_alerts (
 id text primary key,
 payload jsonb not null,
 status text not null default 'pending' check (status in ('pending','accepted','failed')),
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 lease_until timestamptz not null default '1970-01-01',
 lease_token text,
 created_at timestamptz not null default now(),
 accepted_at timestamptz,
 provider_id text,
 last_error text
);
create index if not exists dts_inbox_alerts_due on dts_inbox_alerts(status,next_attempt_at);
