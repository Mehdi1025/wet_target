-- Initial schema for Target Agency (Wetarget)
-- Apply via Supabase Dashboard SQL editor or: npx supabase db push

create extension if not exists "pgcrypto";

-- Contact form submissions
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  message text not null,
  source_page text,
  locale text not null default 'fr',
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

alter table public.contact_submissions enable row level security;

-- Public can insert contact requests (anon key)
create policy "Anyone can submit contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated admins can read/update (configure later)
create policy "Authenticated users can read submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update submissions"
  on public.contact_submissions
  for update
  to authenticated
  using (true)
  with check (true);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contact_submissions_set_updated_at
  before update on public.contact_submissions
  for each row
  execute function public.set_updated_at();
