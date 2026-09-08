-- CRM handoff: link projects to Target OS won leads
-- Apply after: 20260905140000_agency_projects_schema.sql

-- 1. projects.crm_lead_id (UUID, unique — one project per CRM deal)
alter table public.projects
  add column if not exists crm_lead_id uuid;

create unique index if not exists projects_crm_lead_id_unique_idx
  on public.projects (crm_lead_id)
  where crm_lead_id is not null;

-- 2. Verify project_services (created in 20260905140000)
do $$ begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'project_services'
  ) then
    raise exception 'Table public.project_services is missing. Run migration 20260905140000_agency_projects_schema.sql first.';
  end if;
end $$;

-- Sanity check: expected columns on project_services
do $$ begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'project_services'
      and column_name = 'project_id'
  ) then
    raise exception 'Column project_services.project_id is missing.';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'project_services'
      and column_name = 'service_id'
  ) then
    raise exception 'Column project_services.service_id is missing.';
  end if;
end $$;
