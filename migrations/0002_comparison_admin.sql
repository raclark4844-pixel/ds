create table if not exists comparison_reports (
  id text primary key,
  token_hash text not null,
  report jsonb not null,
  pdf_status text not null default 'idle' check (pdf_status in ('idle', 'ok', 'failed')),
  customer_email_status text not null default 'idle' check (customer_email_status in ('idle', 'ok', 'failed')),
  internal_email_status text not null default 'idle' check (internal_email_status in ('idle', 'ok', 'failed')),
  admin_status text not null default 'new' check (admin_status in ('new', 'reviewing', 'contacted', 'closed')),
  internal_notes text not null default '',
  discovery_source text not null default 'benchmark',
  discovered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comparison_reports_created_at_idx on comparison_reports(created_at desc);
create index if not exists comparison_reports_admin_status_idx on comparison_reports(admin_status, created_at desc);

create table if not exists comparison_scoring_settings (
  id text primary key check (id = 'active'),
  weights jsonb not null,
  version integer not null default 1,
  updated_by text not null,
  updated_at timestamptz not null default now()
);

create table if not exists comparison_scoring_revisions (
  revision_id bigserial primary key,
  version integer not null,
  weights jsonb not null,
  updated_by text not null,
  updated_at timestamptz not null default now()
);
