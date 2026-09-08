-- Account management notes for Client 360 hub
alter table public.clients
  add column if not exists account_notes text;
