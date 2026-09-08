-- Add cost type: contractor (freelance) vs project_charge (hosting, tools, etc.)
-- Apply after: 20260905182000_project_external_costs.sql

alter table public.project_external_costs
  add column if not exists cost_type text not null default 'contractor'
  check (cost_type in ('contractor', 'project_charge'));

alter table public.project_external_costs
  alter column freelance_name drop not null;

alter table public.project_external_costs
  drop constraint if exists project_external_costs_type_name_check;

alter table public.project_external_costs
  add constraint project_external_costs_type_name_check check (
    (
      cost_type = 'contractor'
      and freelance_name is not null
      and length(trim(freelance_name)) >= 2
    )
    or (
      cost_type = 'project_charge'
      and freelance_name is null
    )
  );
