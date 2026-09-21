create table if not exists dts_inbox_health (
 site_id text primary key check (site_id = 'demore'),
 report jsonb not null,
 received_at timestamptz not null default now()
);
