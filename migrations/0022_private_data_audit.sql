create table dts_data_vault_reads (
 id bigint generated always as identity primary key,
 organization_id text not null references dts_data_vaults(organization_id),
 actor_id text not null,
 action text not null check(action in ('read','export')),
 record_ids text[] not null,
 created_at timestamptz not null default now()
);
create function dts_vault_address_guard() returns trigger language plpgsql as $$
declare old_address text[]; new_address text[];
begin
 select array_agg(upper(regexp_replace(trim(normalize(v,NFKC)),'\s+',' ','g')) order by n)
 into old_address from unnest(array[old.data->>'address',coalesce(old.data->>'unit',''),old.data->>'city',old.data->>'state',left(old.data->>'postalCode',5)]) with ordinality x(v,n);
 select array_agg(upper(regexp_replace(trim(normalize(v,NFKC)),'\s+',' ','g')) order by n)
 into new_address from unnest(array[new.data->>'address',coalesce(new.data->>'unit',''),new.data->>'city',new.data->>'state',left(new.data->>'postalCode',5)]) with ordinality x(v,n);
 if old_address is distinct from new_address then raise exception 'IDENTITY_CONFLICT'; end if;
 return new;
end $$;
create trigger dts_vault_address_guard before update on dts_batchdata_records
 for each row execute function dts_vault_address_guard();
create index dts_batchdata_observations_record on dts_batchdata_observations(organization_id,record_id,request_id);
create index dts_batchdata_imports_campaign on dts_batchdata_imports(organization_id,campaign_id,request_id);
