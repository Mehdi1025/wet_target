-- Custom Arsenal: user-managed drawers and links

create table if not exists public.arsenal_drawers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.arsenal_links (
  id uuid primary key default gen_random_uuid(),
  drawer_id uuid not null references public.arsenal_drawers (id) on delete cascade,
  name text not null,
  description text,
  url text not null,
  icon_key text not null default 'link',
  accent_class text not null default 'text-zinc-400',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists arsenal_links_drawer_id_idx
  on public.arsenal_links (drawer_id);

create index if not exists arsenal_drawers_sort_order_idx
  on public.arsenal_drawers (sort_order);

drop trigger if exists arsenal_drawers_set_updated_at on public.arsenal_drawers;
create trigger arsenal_drawers_set_updated_at
  before update on public.arsenal_drawers
  for each row execute function public.set_updated_at();

drop trigger if exists arsenal_links_set_updated_at on public.arsenal_links;
create trigger arsenal_links_set_updated_at
  before update on public.arsenal_links
  for each row execute function public.set_updated_at();

alter table public.arsenal_drawers enable row level security;
alter table public.arsenal_links enable row level security;
