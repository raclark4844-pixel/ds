alter table dts_control_leads add constraint dts_lead_org_id unique(organization_id,id);
create table dts_client_campaigns (
 id text primary key,
 organization_id text not null references "organization"(id),
 name text not null,
 status text not null default 'draft' check(status in ('draft','active','paused','complete')),
 created_at timestamptz not null default now(),
 unique(organization_id,id)
);
create table dts_client_webhook_logs (
 id text primary key,
 organization_id text not null references "organization"(id),
 request_id text not null,
 workflow text not null,
 status text not null check(status in ('accepted','rejected','failed')),
 created_at timestamptz not null default now(),
 unique(organization_id,request_id)
);
create table dts_client_lead_details (
 organization_id text not null,
 lead_id text not null,
 enrichment jsonb not null default '{}',
 tech_stack jsonb not null default '[]',
 document_text text not null default '',
 primary key(organization_id,lead_id),
 foreign key(organization_id,lead_id) references dts_control_leads(organization_id,id)
);
create table dts_client_activity (
 id text primary key,
 organization_id text not null,
 lead_id text not null,
 channel text not null check(channel in ('sms','email','chat','status','document')),
 body text not null check(length(body)<=10000),
 delivery_status text not null check(delivery_status in ('draft','received','queued','sent','failed','recorded')),
 actor_id text not null,
 created_at timestamptz not null default now(),
 foreign key(organization_id,lead_id) references dts_control_leads(organization_id,id)
);
create index dts_client_activity_recent on dts_client_activity(organization_id,created_at desc,id);
create table dts_client_preferences (
 organization_id text primary key references "organization"(id),
 show_completed boolean not null default true,
 updated_by text not null,
 updated_at timestamptz not null default now()
);
