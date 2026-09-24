-- Fixed website site identifiers are authoritative; names/domains never confer membership.
insert into "organization"(id,name,slug) values(
 'org_demore_exterior_solutions','Demore Exterior Solutions','demore-exterior-solutions'
) on conflict(id) do nothing;
do $$ begin
 if exists(select 1 from dts_control_leads l where l.site_id='demore'
  and l.organization_id='org_demore_technology_solutions'
  and (exists(select 1 from dts_client_lead_details d where d.organization_id=l.organization_id and d.lead_id=l.id)
   or exists(select 1 from dts_client_activity a where a.organization_id=l.organization_id and a.lead_id=l.id)))
 then raise exception 'EXTERIOR_LEAD_BACKFILL_REVIEW_REQUIRED'; end if;
end $$;
update dts_control_leads set organization_id='org_demore_exterior_solutions'
 where site_id='demore' and (organization_id is null or organization_id='org_demore_technology_solutions');
update dts_control_leads set organization_id='org_demore_technology_solutions'
 where site_id='demore-technology' and organization_id is null;
create function dts_scope_website_lead() returns trigger language plpgsql as $$
begin
 if new.organization_id is null then
  new.organization_id:=case new.site_id when 'demore' then 'org_demore_exterior_solutions'
   when 'demore-technology' then 'org_demore_technology_solutions' else null end;
 end if;
 return new;
end $$;
create trigger dts_scope_website_lead before insert on dts_control_leads
 for each row execute function dts_scope_website_lead();
-- No budgets, sessions, membership or access grants are automatically created.
