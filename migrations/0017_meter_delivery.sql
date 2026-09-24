-- Frozen before provider execution; settlement and outbox insert are atomic.
alter table dts_usage_operations add constraint dts_usage_org_id unique(organization_id,id);
alter table dts_stripe_meter_outbox add constraint dts_meter_operation_tenant
 foreign key(organization_id,operation_id) references dts_usage_operations(organization_id,id);
alter table dts_stripe_accounts add column meter_price_id text;
alter table dts_stripe_accounts add column meter_event_name text;
alter table dts_stripe_meter_outbox add column next_attempt_at timestamptz not null default now();
alter table dts_stripe_meter_outbox add column attempts integer not null default 0;
create table dts_meter_bindings (
 operation_id text primary key,
 organization_id text not null,
 stripe_customer_id text not null,
 subscription_id text not null,
 price_id text not null,
 event_name text not null,
 foreign key(organization_id,operation_id) references dts_usage_operations(organization_id,id)
);
create unique index dts_usage_provider_receipt on dts_usage_operations(provider,provider_receipt)
 where cost_basis='VERIFIED' and provider_receipt is not null;

create function dts_bind_meter(p_org text,p_id text,p_price text,p_event text) returns boolean
language plpgsql as $$
declare a dts_stripe_accounts%rowtype; op dts_usage_operations%rowtype;
begin
 select * into a from dts_stripe_accounts where organization_id=p_org for update;
 if not found or not a.enabled or a.subscription_status<>'active' or a.subscription_id is null
    or a.meter_price_id is distinct from p_price or a.meter_event_name is distinct from p_event
    or p_price is null or p_event is null then raise exception 'BILLING_NOT_ACTIVE'; end if;
 select * into op from dts_usage_operations where organization_id=p_org and id=p_id for update;
 if not found or op.state<>'RESERVED' then raise exception 'RESERVATION_NOT_ACTIVE'; end if;
 insert into dts_meter_bindings values(p_id,p_org,a.stripe_customer_id,a.subscription_id,p_price,p_event);
 return true;
end $$;

create function dts_enqueue_verified_usage() returns trigger language plpgsql as $$
declare b dts_meter_bindings%rowtype;
begin
 if new.state='SETTLED' and new.cost_basis='VERIFIED' and old.state<>'SETTLED' then
  select * into b from dts_meter_bindings where operation_id=new.id and organization_id=new.organization_id;
  if not found or new.provider is null or new.provider_receipt is null then
   raise exception 'VERIFIED_USAGE_REQUIRES_BINDING_AND_RECEIPT';
  end if;
  insert into dts_stripe_meter_outbox(operation_id,organization_id,stripe_customer_id,event_name,price_id,value_microdollars,occurred_at)
   values(new.id,new.organization_id,b.stripe_customer_id,b.event_name,b.price_id,new.billed_cost_microdollars,new.created_at);
 end if;
 return new;
end $$;
create trigger dts_enqueue_verified_usage after update on dts_usage_operations
 for each row execute function dts_enqueue_verified_usage();

alter table dts_stripe_accounts add column meter_lease_token text;
alter table dts_stripe_accounts add column meter_lease_until timestamptz;
create function dts_claim_meter(p_token text) returns setof dts_stripe_meter_outbox language plpgsql as $$
declare a dts_stripe_accounts%rowtype; op text;
begin
 select * into a from dts_stripe_accounts a1
 where (a1.meter_lease_until is null or a1.meter_lease_until<now()) and exists(
  select 1 from dts_stripe_meter_outbox o where o.organization_id=a1.organization_id
  and o.state in ('READY','SENDING') and o.next_attempt_at<=now() and (o.lease_until is null or o.lease_until<now()))
 order by a1.organization_id for update skip locked limit 1;
 if not found then return; end if;
 select operation_id into op from dts_stripe_meter_outbox where organization_id=a.organization_id
 and state in ('READY','SENDING') and next_attempt_at<=now() and (lease_until is null or lease_until<now())
 order by occurred_at for update skip locked limit 1;
 if not found then return; end if;
 update dts_stripe_accounts set meter_lease_token=p_token,meter_lease_until=now()+interval '2 minutes' where organization_id=a.organization_id;
 return query update dts_stripe_meter_outbox set state='SENDING',lease_token=p_token,
  lease_until=now()+interval '2 minutes',first_attempt_at=coalesce(first_attempt_at,now()),attempts=attempts+1
  where operation_id=op returning *;
end $$;
