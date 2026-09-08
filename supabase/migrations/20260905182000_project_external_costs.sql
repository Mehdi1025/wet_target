-- External freelancer / subcontractor costs per project
-- Apply after: 20260905181000_time_logs_per_user_active.sql

create table if not exists public.project_external_costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  cost_type text not null default 'contractor'
    check (cost_type in ('contractor', 'project_charge')),
  freelance_name text,
  role text not null,
  cost_amount numeric(12, 2) not null check (cost_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  constraint project_external_costs_type_name_check check (
    (
      cost_type = 'contractor'
      and freelance_name is not null
      and length(trim(freelance_name)) >= 2
    )
    or (
      cost_type = 'project_charge'
      and freelance_name is null
    )
  )
);

create index if not exists project_external_costs_project_id_idx
  on public.project_external_costs (project_id);

alter table public.project_external_costs enable row level security;
