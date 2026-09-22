-- Multi-tenant orgs for Better Auth organization plugin + Demore billing.
-- Do not put organizationId on "user". Membership lives on "member".

create table if not exists "organization" (
  "id" text primary key,
  "name" text not null,
  "slug" text not null unique,
  "logo" text,
  "metadata" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz
);

create table if not exists "member" (
  "id" text primary key,
  "organizationId" text not null references "organization"("id") on delete cascade,
  "userId" text not null references "user"("id") on delete cascade,
  "role" text not null default 'member',
  "createdAt" timestamptz not null default now()
);
create unique index if not exists member_user_org_idx on "member"("userId", "organizationId");
create index if not exists member_organizationId_idx on "member"("organizationId");
create index if not exists member_userId_idx on "member"("userId");

create table if not exists "invitation" (
  "id" text primary key,
  "organizationId" text not null references "organization"("id") on delete cascade,
  "email" text not null,
  "role" text,
  "status" text not null default 'pending',
  "inviterId" text not null references "user"("id") on delete cascade,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now()
);
create index if not exists invitation_organizationId_idx on "invitation"("organizationId");
create index if not exists invitation_email_idx on "invitation"("email");

alter table "session" add column if not exists "activeOrganizationId" text;

insert into "organization" ("id", "name", "slug", "metadata", "createdAt")
values (
  'org_demore_technology_solutions',
  'Demore Technology Solutions',
  'demore-technology-solutions',
  '{"platformOperator":true}',
  now()
)
on conflict ("slug") do nothing;

alter table dts_control_leads add column if not exists organization_id text;
alter table dts_bot_runs add column if not exists organization_id text;
alter table dts_automation_jobs add column if not exists organization_id text;

update dts_control_leads
  set organization_id = 'org_demore_technology_solutions'
  where organization_id is null;
update dts_bot_runs
  set organization_id = 'org_demore_technology_solutions'
  where organization_id is null;
update dts_automation_jobs
  set organization_id = 'org_demore_technology_solutions'
  where organization_id is null and site_id is not null;

create index if not exists dts_control_leads_org_idx on dts_control_leads(organization_id);
create index if not exists dts_bot_runs_org_idx on dts_bot_runs(organization_id);
create index if not exists dts_automation_jobs_org_idx on dts_automation_jobs(organization_id);

create table if not exists dts_tenant_billing (
  organization_id text primary key references "organization"("id") on delete cascade,
  daily_cap_microdollars bigint not null default 2000000,
  current_day text not null default '',
  current_day_spend_microdollars bigint not null default 0,
  markup_bps integer not null default 10000,
  updated_at timestamptz not null default now()
);

create table if not exists dts_api_usage_logs (
  id text primary key,
  organization_id text not null references "organization"("id") on delete cascade,
  actor_user_id text,
  feature text not null,
  provider text,
  model text,
  input_tokens integer,
  output_tokens integer,
  raw_cost_microdollars bigint not null,
  billed_cost_microdollars bigint not null,
  day text not null,
  created_at timestamptz not null default now()
);
create index if not exists dts_api_usage_logs_org_day_idx on dts_api_usage_logs(organization_id, day, created_at desc);

insert into dts_tenant_billing(organization_id, current_day)
values (
  'org_demore_technology_solutions',
  to_char(now() at time zone 'America/New_York','YYYY-MM-DD')
)
on conflict (organization_id) do nothing;

create or replace function dts_reserve_tenant_spend(p_org text, p_estimate bigint)
returns table(
  allowed boolean,
  day text,
  cap bigint,
  spend bigint,
  markup_bps integer,
  reason text
)
language plpgsql as $$
declare
  billing dts_tenant_billing%rowtype;
  today text;
begin
  if p_estimate is null or p_estimate < 1 then
    p_estimate := 100000;
  end if;
  today := to_char(now() at time zone 'America/New_York','YYYY-MM-DD');

  insert into dts_tenant_billing(organization_id, current_day)
  values (p_org, today)
  on conflict (organization_id) do nothing;

  select * into billing from dts_tenant_billing where organization_id = p_org for update;
  if not found then
    return query select false, today, 0::bigint, 0::bigint, 10000, 'missing_billing'::text;
    return;
  end if;

  if billing.current_day is distinct from today then
    update dts_tenant_billing
      set current_day = today,
          current_day_spend_microdollars = 0,
          updated_at = now()
      where organization_id = p_org;
    billing.current_day := today;
    billing.current_day_spend_microdollars := 0;
  end if;

  if billing.current_day_spend_microdollars + p_estimate > billing.daily_cap_microdollars then
    return query select false, billing.current_day, billing.daily_cap_microdollars,
      billing.current_day_spend_microdollars, billing.markup_bps, 'cap'::text;
    return;
  end if;

  update dts_tenant_billing
    set current_day_spend_microdollars = current_day_spend_microdollars + p_estimate,
        updated_at = now()
    where organization_id = p_org;

  return query select true, billing.current_day, billing.daily_cap_microdollars,
    billing.current_day_spend_microdollars + p_estimate, billing.markup_bps, 'ok'::text;
end $$;

create or replace function dts_release_tenant_spend(p_org text, p_estimate bigint)
returns void
language plpgsql as $$
begin
  if p_estimate is null or p_estimate < 1 then
    return;
  end if;
  update dts_tenant_billing
    set current_day_spend_microdollars = greatest(0, current_day_spend_microdollars - p_estimate),
        updated_at = now()
    where organization_id = p_org;
end $$;

create or replace function dts_commit_tenant_spend(p_org text, p_estimate bigint, p_billed bigint)
returns void
language plpgsql as $$
begin
  if p_estimate is null or p_estimate < 0 then
    p_estimate := 0;
  end if;
  if p_billed is null or p_billed < 0 then
    p_billed := 0;
  end if;
  update dts_tenant_billing
    set current_day_spend_microdollars = greatest(0, current_day_spend_microdollars - p_estimate + p_billed),
        updated_at = now()
    where organization_id = p_org;
end $$;
