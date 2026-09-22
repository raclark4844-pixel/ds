-- Attach known Demore owner accounts to the platform org as super_admin.
-- Safe if the user row does not exist yet; the sign-in hook finishes the job.

insert into "organization" ("id", "name", "slug", "metadata", "createdAt")
values (
  'org_demore_technology_solutions',
  'Demore Technology Solutions',
  'demore-technology-solutions',
  '{"platformOperator":true}',
  now()
)
on conflict ("slug") do nothing;

insert into dts_tenant_billing(organization_id, current_day)
select 'org_demore_technology_solutions',
       to_char(now() at time zone 'America/New_York','YYYY-MM-DD')
where exists (select 1 from "organization" where id = 'org_demore_technology_solutions')
on conflict (organization_id) do nothing;

insert into "member" ("id", "organizationId", "userId", "role", "createdAt")
select
  'mem_platform_' || replace("id", '-', ''),
  'org_demore_technology_solutions',
  "id",
  'super_admin',
  now()
from "user"
where lower(email) in (
  'ryan@demoretechnologysolutions.com',
  'raclark4844@gmail.com'
)
on conflict ("userId", "organizationId") do update
set role = excluded.role;

update "session"
set "activeOrganizationId" = 'org_demore_technology_solutions',
    "updatedAt" = now()
where "userId" in (
  select "id" from "user"
  where lower(email) in (
    'ryan@demoretechnologysolutions.com',
    'raclark4844@gmail.com'
  )
);
