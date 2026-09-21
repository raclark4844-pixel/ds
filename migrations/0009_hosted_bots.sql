create table dts_bot_budget (id int primary key check(id=1), enabled boolean not null default false, daily_limit bigint not null default 2000000, monthly_limit bigint not null default 40000000);
insert into dts_bot_budget(id) values(1);
create table dts_bot_runs (
 id text primary key, request_hash text not null, site_id text not null check(site_id in ('demore','demore-technology')), bot_id text not null,
 objective text not null, actor text not null, status text not null,
 day text not null, month text not null, reserved bigint not null, actual bigint,
 artifact text, artifact_hash text, review text, provider_models jsonb, created_at timestamptz not null default now(), completed_at timestamptz
);
create table dts_bot_carryover (id int primary key, day text not null, month text not null, spent bigint not null, held bigint not null);
-- Imported only on explicit budget cutover, before enabling dispatch.
create or replace function dts_reserve_bot(p_id text,p_hash text,p_site text,p_bot text,p_objective text,p_actor text)
returns boolean language plpgsql as $$
declare budget dts_bot_budget%rowtype; old dts_bot_runs%rowtype; d text; m text; day_used bigint; month_used bigint;
begin
 select * into budget from dts_bot_budget where id=1 for update;
 select * into old from dts_bot_runs where id=p_id;
 if found then
  if old.request_hash<>p_hash then raise exception 'Request identifier conflict'; end if;
  return false;
 end if;
 if not budget.enabled then raise exception 'Shared budget cutover required'; end if;
 d=to_char(now() at time zone 'America/New_York','YYYY-MM-DD'); m=left(d,7);
 select coalesce(sum(case when actual is null then reserved when day=d then actual else 0 end),0),
 coalesce(sum(case when actual is null then reserved when month=m then actual else 0 end),0) into day_used,month_used from dts_bot_runs;
 day_used=day_used+(select coalesce(sum(held+case when day=d then spent else 0 end),0) from dts_bot_carryover);
 month_used=month_used+(select coalesce(sum(held+case when month=m then spent else 0 end),0) from dts_bot_carryover);
 if exists(select 1 from dts_bot_runs where actual>reserved) then raise exception 'Cost reconciliation required'; end if;
 if day_used+100000>budget.daily_limit or month_used+100000>budget.monthly_limit then raise exception 'Shared spending limit reached'; end if;
 insert into dts_bot_runs(id,request_hash,site_id,bot_id,objective,actor,status,day,month,reserved)
 values(p_id,p_hash,p_site,p_bot,p_objective,p_actor,'running',d,m,100000);
 return true;
end $$;
