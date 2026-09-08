-- Project tasks (Mission Control)

create type public.project_task_status as enum (
  'todo',
  'in_progress',
  'blocked',
  'done'
);

create type public.project_task_priority as enum (
  'high',
  'normal',
  'low'
);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  status public.project_task_status not null default 'todo',
  priority public.project_task_priority not null default 'normal',
  assignee text,
  due_date date,
  step public.project_step,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_tasks_project_id_idx
  on public.project_tasks (project_id);

create index if not exists project_tasks_status_idx
  on public.project_tasks (status);

create index if not exists project_tasks_assignee_idx
  on public.project_tasks (assignee);

create index if not exists project_tasks_due_date_idx
  on public.project_tasks (due_date);

drop trigger if exists project_tasks_set_updated_at on public.project_tasks;
create trigger project_tasks_set_updated_at
  before update on public.project_tasks
  for each row execute function public.set_updated_at();

alter table public.project_tasks enable row level security;
