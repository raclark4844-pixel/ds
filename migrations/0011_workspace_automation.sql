create table dts_automation_settings(id int primary key check(id=1),enabled boolean not null default true,updated_at timestamptz not null default now(),updated_by text not null default 'initial-authorized-setup');
insert into dts_automation_settings(id) values(1);
create table dts_automation_jobs(job_key text primary key,kind text not null,site_id text,status text not null default 'running',details jsonb not null default '{}',created_at timestamptz not null default now(),completed_at timestamptz);
create index dts_automation_jobs_recent on dts_automation_jobs(created_at desc);
create table dts_comparison_triage(report_id text primary key references comparison_reports(id),fingerprint text not null,priority text not null,findings jsonb not null,draft text not null,updated_at timestamptz not null default now());
