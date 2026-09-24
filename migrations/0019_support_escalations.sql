create table dts_support_escalations (
 id text primary key,
 organization_id text not null references "organization"(id),
 request_id text not null,
 reason text not null check(reason in ('human_requested','pricing_unavailable','billing_issue','technical_issue','safety_issue')),
 summary text not null check(length(summary)<=1000),
 status text not null default 'queued' check(status in ('queued','sending','acknowledged','reconcile')),
 lease_token text,
 lease_until timestamptz,
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 unique(organization_id,request_id)
);
create index dts_support_escalations_pending on dts_support_escalations(status,next_attempt_at);
