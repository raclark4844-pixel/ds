alter table comparison_reports
  add column if not exists handoff jsonb,
  add column if not exists handoff_status text not null default 'not_started'
    check (handoff_status in ('not_started', 'submitted', 'crm_sent', 'crm_failed'));

create index if not exists comparison_reports_handoff_status_idx
  on comparison_reports(handoff_status, updated_at desc);
