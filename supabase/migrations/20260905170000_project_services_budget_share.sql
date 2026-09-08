-- Budget ventilation per activity on project_services
alter table public.project_services
  add column if not exists budget_share numeric(12, 2) not null default 0
  check (budget_share >= 0);
