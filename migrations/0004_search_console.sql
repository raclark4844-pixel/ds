create table if not exists search_console_connections (
  report_id text primary key references comparison_reports(id) on delete cascade,
  google_sub text not null default '',
  property_url text,
  token_blob text not null,
  connected_at timestamptz not null default now(),
  last_success_at timestamptz,
  last_status text not null default 'authorization_required'
    check (last_status in ('configured', 'connected', 'quota_error', 'authorization_required', 'unavailable')),
  updated_at timestamptz not null default now()
);
