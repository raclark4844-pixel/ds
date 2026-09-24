-- Additive cutover; existing organizations and historical usage remain intact.
do $$ begin
 if exists(select 1 from dts_tenant_billing where current_day='' and current_day_spend_microdollars<>0) then
  raise exception 'LEGACY_DAY_RECONCILIATION_REQUIRED';
 end if;
end $$;
alter table dts_tenant_billing add column if not exists pricing_mode text not null default 'UNREVIEWED';
alter table dts_tenant_billing add column if not exists usage_halted boolean not null default false;
alter table dts_tenant_billing alter column markup_bps set default 16000;
alter table dts_tenant_billing alter column pricing_mode set default 'EXTERNAL';
-- Only the existing fixed platform organization is automatically cost-only.
update dts_tenant_billing set pricing_mode='INTERNAL'
where organization_id='org_demore_technology_solutions' and markup_bps=10000;

create table dts_usage_days (
  organization_id text not null references "organization"(id) on delete restrict,
  day text not null,
  committed_and_reserved_microdollars bigint not null default 0 check(committed_and_reserved_microdollars >= 0),
  primary key(organization_id,day)
);
insert into dts_usage_days(organization_id,day,committed_and_reserved_microdollars)
select organization_id,current_day,current_day_spend_microdollars from dts_tenant_billing where current_day <> '';

create table dts_usage_operations (
  id text primary key,
  organization_id text not null references "organization"(id) on delete restrict,
  operation_key text not null,
  day text not null,
  feature text not null,
  actor_user_id text,
  reserved_microdollars bigint not null check(reserved_microdollars > 0),
  markup_bps integer not null check(markup_bps between 10000 and 20000),
  raw_cost_microdollars bigint,
  billed_cost_microdollars bigint,
  state text not null default 'RESERVED' check(state in ('RESERVED','UNKNOWN','SETTLED','RELEASED','RECONCILE')),
  provider text,
  model text,
  input_tokens integer,
  output_tokens integer,
  provider_receipt text,
  cost_basis text not null default 'ESTIMATE' check(cost_basis in ('ESTIMATE','VERIFIED')),
  created_at timestamptz not null default now(),
  settled_at timestamptz,
  unique(organization_id,operation_key),
  foreign key(organization_id,day) references dts_usage_days(organization_id,day)
);
create index dts_usage_operations_pending on dts_usage_operations(state,created_at);

create or replace function dts_reserve_usage(
  p_id text,p_org text,p_key text,p_feature text,p_actor text,p_raw_max bigint
) returns table(operation_id text,execute boolean,operation_state text,reason text,markup_bps integer)
language plpgsql as $$
declare
  b dts_tenant_billing%rowtype;
  op dts_usage_operations%rowtype;
  today text := to_char(now() at time zone 'America/New_York','YYYY-MM-DD');
  amount bigint;
  total bigint;
begin
  if p_id is null or p_org is null or p_key is null or length(p_key) not between 1 and 200 or
     p_feature is null or length(p_feature) not between 1 and 100 or p_raw_max is null or p_raw_max < 1 or p_raw_max > 1000000000000 then
    raise exception 'INVALID_RESERVATION';
  end if;
  select * into b from dts_tenant_billing where organization_id=p_org for update;
  if not found then return query select null::text,false,'DENIED','MISSING_ACCOUNT',0; return; end if;
  select * into op from dts_usage_operations where organization_id=p_org and operation_key=p_key;
  if found then
    if op.feature<>p_feature or op.actor_user_id is distinct from p_actor or
       op.reserved_microdollars<>ceil(p_raw_max::numeric*op.markup_bps/10000)::bigint then raise exception 'OPERATION_CONFLICT'; end if;
    return query select op.id,false,op.state,'REPLAY',op.markup_bps; return;
  end if;
  if b.usage_halted then return query select null::text,false,'DENIED','RECONCILIATION_REQUIRED',b.markup_bps; return; end if;
  if not ((b.pricing_mode='INTERNAL' and b.markup_bps=10000) or
          (b.pricing_mode='EXTERNAL' and b.markup_bps between 15000 and 20000)) then
    return query select null::text,false,'DENIED','PRICING_REVIEW_REQUIRED',b.markup_bps; return;
  end if;
  amount := ceil(p_raw_max::numeric*b.markup_bps/10000)::bigint;
  insert into dts_usage_days(organization_id,day) values(p_org,today) on conflict do nothing;
  select committed_and_reserved_microdollars into total from dts_usage_days where organization_id=p_org and day=today for update;
  if total+amount>b.daily_cap_microdollars then return query select null::text,false,'DENIED','CAP',b.markup_bps; return; end if;
  update dts_usage_days set committed_and_reserved_microdollars=total+amount where organization_id=p_org and day=today;
  insert into dts_usage_operations(id,organization_id,operation_key,day,feature,actor_user_id,reserved_microdollars,markup_bps)
  values(p_id,p_org,p_key,today,p_feature,p_actor,amount,b.markup_bps);
  update dts_tenant_billing set current_day=today,current_day_spend_microdollars=total+amount,updated_at=now() where organization_id=p_org;
  return query select p_id,true,'RESERVED','OK',b.markup_bps;
end $$;

create or replace function dts_settle_usage(
  p_org text,p_id text,p_outcome text,p_raw bigint,p_provider text,p_model text,
  p_input integer,p_output integer,p_receipt text,p_basis text
) returns text language plpgsql as $$
declare
  op dts_usage_operations%rowtype;
  billed bigint;
  next_state text;
begin
  perform 1 from dts_tenant_billing where organization_id=p_org for update;
  select * into op from dts_usage_operations where id=p_id and organization_id=p_org for update;
  if not found then raise exception 'OPERATION_NOT_FOUND'; end if;
  if p_outcome is null or p_outcome not in ('SUCCESS','UNKNOWN','NO_CHARGE') then raise exception 'INVALID_OUTCOME'; end if;
  if op.state in ('SETTLED','RECONCILE','RELEASED') then
    if (op.state='RELEASED' and p_outcome='NO_CHARGE') or
       (op.state in ('SETTLED','RECONCILE') and p_outcome='SUCCESS' and
        op.raw_cost_microdollars is not distinct from p_raw and op.provider_receipt is not distinct from p_receipt and
        op.provider is not distinct from p_provider and op.model is not distinct from p_model and
        op.input_tokens is not distinct from p_input and op.output_tokens is not distinct from p_output and op.cost_basis=p_basis)
    then return op.state; end if;
    raise exception 'SETTLEMENT_CONFLICT';
  end if;
  if p_outcome='UNKNOWN' then
    update dts_usage_operations set state='UNKNOWN' where id=p_id and organization_id=p_org;
    return 'UNKNOWN';
  end if;
  if p_outcome='NO_CHARGE' then
    billed:=0; next_state:='RELEASED';
  else
    if p_raw is null or p_raw<0 or p_raw>1000000000000 or p_basis is null or p_basis not in ('ESTIMATE','VERIFIED') or
       (p_basis='VERIFIED' and (p_receipt is null or length(p_receipt)=0)) or
       p_input<0 or p_output<0 then raise exception 'INVALID_COST'; end if;
    billed:=ceil(p_raw::numeric*op.markup_bps/10000)::bigint;
    next_state:=case when billed>op.reserved_microdollars then 'RECONCILE' else 'SETTLED' end;
  end if;
  update dts_usage_days set committed_and_reserved_microdollars=committed_and_reserved_microdollars-op.reserved_microdollars+billed
    where organization_id=p_org and day=op.day;
  update dts_usage_operations set state=next_state,raw_cost_microdollars=case when p_outcome='SUCCESS' then p_raw else 0 end,
    billed_cost_microdollars=billed,provider=p_provider,model=p_model,input_tokens=p_input,output_tokens=p_output,
    provider_receipt=p_receipt,cost_basis=coalesce(p_basis,'ESTIMATE'),settled_at=now()
    where id=p_id and organization_id=p_org;
  -- Atomic with settlement: a failed log insert rolls back all balance changes.
  if p_outcome='SUCCESS' then
    insert into dts_api_usage_logs(id,organization_id,actor_user_id,feature,provider,model,input_tokens,output_tokens,raw_cost_microdollars,billed_cost_microdollars,day)
    values(op.id,p_org,op.actor_user_id,op.feature,p_provider,p_model,p_input,p_output,p_raw,billed,op.day);
  end if;
  update dts_tenant_billing set
    current_day_spend_microdollars=case when current_day=op.day then (select committed_and_reserved_microdollars from dts_usage_days where organization_id=p_org and day=op.day) else current_day_spend_microdollars end,
    usage_halted=usage_halted or next_state='RECONCILE',updated_at=now()
    where organization_id=p_org;
  return next_state;
end $$;
