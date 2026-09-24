-- Private result storage is independent of sales-desk/employee permissions.
create table dts_data_vaults (
 organization_id text primary key references "organization"(id),
 owner_user_id text not null references "user"(id),
 created_at timestamptz not null default now()
);
create table dts_data_vault_grants (
 organization_id text not null references dts_data_vaults(organization_id),
 user_id text not null references "user"(id),
 granted_by text not null references "user"(id),
 created_at timestamptz not null default now(),
 primary key(organization_id,user_id)
);
create table dts_data_vault_access_events (
 id bigint generated always as identity primary key,
 organization_id text not null references dts_data_vaults(organization_id),
 actor_id text not null,
 target_user_id text not null,
 action text not null check(action in ('grant','revoke')),
 created_at timestamptz not null default now()
);
create table dts_batchdata_imports (
 organization_id text not null references dts_data_vaults(organization_id),
 request_id text not null,
 digest text not null,
 campaign_id text not null,
 observed_at timestamptz not null,
 record_count integer not null,
 created_at timestamptz not null default now(),
 primary key(organization_id,request_id)
);
create table dts_batchdata_records (
 id text primary key,
 organization_id text not null references dts_data_vaults(organization_id),
 data jsonb not null,
 field_times jsonb not null,
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(organization_id,id)
);
create index dts_batchdata_records_page on dts_batchdata_records(organization_id,id);
create table dts_batchdata_keys (
 organization_id text not null,
 identity_key text not null,
 record_id text not null,
 primary key(organization_id,identity_key),
 foreign key(organization_id,record_id) references dts_batchdata_records(organization_id,id)
);
create table dts_batchdata_observations (
 organization_id text not null,
 request_id text not null,
 record_id text not null,
 ordinal integer not null,
 previous_data jsonb not null,
 incoming_data jsonb not null,
 resulting_data jsonb not null,
 foreign key(organization_id,request_id) references dts_batchdata_imports(organization_id,request_id),
 foreign key(organization_id,record_id) references dts_batchdata_records(organization_id,id),
 primary key(organization_id,request_id,ordinal)
);
-- Serialize imports per company and commit receipt, updates and history together.
-- API validates fields and authenticates the integration before invoking this.
create function dts_import_batchdata(p_org text,p_request text,p_digest text,p_campaign text,p_observed timestamptz,p_rows jsonb)
returns boolean language plpgsql as $$
declare r jsonb; old dts_batchdata_records%rowtype; ids text[]; rid text;
 incoming jsonb; merged jsonb; times jsonb; kv record; old_digest text; n integer:=0;
begin
 perform 1 from dts_data_vaults where organization_id=p_org for update;
 if not found then raise exception 'VAULT_NOT_CONFIGURED'; end if;
 select digest into old_digest from dts_batchdata_imports where organization_id=p_org and request_id=p_request;
 if found then
  if old_digest<>p_digest then raise exception 'IMPORT_CONFLICT'; end if;
  return false;
 end if;
 insert into dts_batchdata_imports values(p_org,p_request,p_digest,p_campaign,p_observed,jsonb_array_length(p_rows),now());
 for r in select value from jsonb_array_elements(p_rows) loop
  n:=n+1;
  select array_agg(distinct record_id) into ids from dts_batchdata_keys
   where organization_id=p_org and identity_key in(select jsonb_array_elements_text(r->'keys'));
  if coalesce(array_length(ids,1),0)>1 then raise exception 'IDENTITY_CONFLICT'; end if;
  rid:=coalesce(ids[1],r->>'id');
  select * into old from dts_batchdata_records where organization_id=p_org and id=rid;
  incoming:=r->'data'; merged:=coalesce(old.data,'{}'); times:=coalesce(old.field_times,'{}');
  -- Different authoritative provider IDs at one address must be reviewed, not merged.
  if old.data ? 'providerId' and incoming ? 'providerId' and old.data->>'providerId'<>incoming->>'providerId'
   then raise exception 'IDENTITY_CONFLICT'; end if;
  for kv in select * from jsonb_each(incoming) loop
   if not (merged ? kv.key) or p_observed > (times->>kv.key)::timestamptz then
    merged:=jsonb_set(merged,array[kv.key],kv.value);
    times:=jsonb_set(times,array[kv.key],to_jsonb(p_observed));
   elsif p_observed=(times->>kv.key)::timestamptz and merged->kv.key<>kv.value then
    raise exception 'OBSERVATION_CONFLICT';
   end if;
  end loop;
  insert into dts_batchdata_records(id,organization_id,data,field_times) values(rid,p_org,merged,times)
   on conflict(id) do update set data=excluded.data,field_times=excluded.field_times,
    version=dts_batchdata_records.version+case when dts_batchdata_records.data<>excluded.data then 1 else 0 end,
    updated_at=case when dts_batchdata_records.data<>excluded.data then now() else dts_batchdata_records.updated_at end;
  insert into dts_batchdata_keys(organization_id,identity_key,record_id)
   select p_org,jsonb_array_elements_text(r->'keys'),rid on conflict do nothing;
  insert into dts_batchdata_observations values(p_org,p_request,rid,n,coalesce(old.data,'{}'),incoming,merged);
 end loop;
 return true;
end $$;
