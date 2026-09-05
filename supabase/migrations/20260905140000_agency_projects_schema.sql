-- Agency production schema: clients, projects, project_services
-- + link contact_submissions → projects
-- Apply after: 20260905120000_initial_schema.sql
-- Run via Supabase SQL Editor or: npx supabase db push

-- ---------------------------------------------------------------------------
-- Enums (aligned with admin dashboards)
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.project_status as enum (
    'pending',
    'active',
    'review',
    'completed'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.project_step as enum (
    'discovery',
    'strategy',
    'creation',
    'launch'
  );
exception
  when duplicate_object then null;
end $$;

-- service_id values: branding | sites-web | reseaux-sociaux | publicite | automatisation

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_email_idx on public.clients (email);
create index if not exists clients_company_idx on public.clients (company);

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  client_id uuid not null references public.clients (id) on delete restrict,
  status public.project_status not null default 'pending',
  current_step public.project_step not null default 'discovery',
  deadline date,
  budget numeric(12, 2),
  allocated_days integer not null default 0 check (allocated_days >= 0),
  spent_days integer not null default 0 check (spent_days >= 0),
  figma_url text,
  drive_url text,
  staging_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_current_step_idx on public.projects (current_step);
create index if not exists projects_deadline_idx on public.projects (deadline);

-- ---------------------------------------------------------------------------
-- project_services (many-to-many: project ↔ activity dashboard)
-- ---------------------------------------------------------------------------

create table if not exists public.project_services (
  project_id uuid not null references public.projects (id) on delete cascade,
  service_id text not null check (
    service_id in (
      'branding',
      'sites-web',
      'reseaux-sociaux',
      'publicite',
      'automatisation'
    )
  ),
  created_at timestamptz not null default now(),
  primary key (project_id, service_id)
);

create index if not exists project_services_service_id_idx
  on public.project_services (service_id);

-- ---------------------------------------------------------------------------
-- contact_submissions → optional project link
-- ---------------------------------------------------------------------------

alter table public.contact_submissions
  add column if not exists project_id uuid references public.projects (id) on delete set null;

create index if not exists contact_submissions_project_id_idx
  on public.contact_submissions (project_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Admin panel uses SUPABASE_SECRET_KEY server-side (bypasses RLS).
-- No anon/authenticated policies on clients/projects/project_services
-- => public API keys cannot read/write production data.
-- contact_submissions keeps public INSERT for the website form.

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_services enable row level security;

-- Optional: when Supabase Auth is wired for admin users, uncomment:
--
-- create policy "Authenticated admins manage clients"
--   on public.clients for all to authenticated
--   using (true) with check (true);
--
-- create policy "Authenticated admins manage projects"
--   on public.projects for all to authenticated
--   using (true) with check (true);
--
-- create policy "Authenticated admins manage project_services"
--   on public.project_services for all to authenticated
--   using (true) with check (true);
