-- Live timer: time_logs + precise spent_seconds on projects
-- Apply after: 20260905170000_project_services_budget_share.sql

create table if not exists public.time_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid,
  admin_username text,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create index if not exists time_logs_project_id_idx
  on public.time_logs (project_id);

create index if not exists time_logs_active_idx
  on public.time_logs (project_id)
  where end_time is null;

alter table public.projects
  add column if not exists spent_seconds integer not null default 0
  check (spent_seconds >= 0);

alter table public.time_logs enable row level security;
