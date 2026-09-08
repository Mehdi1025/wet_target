-- Unique email for client deduplication on project creation
create unique index if not exists clients_email_unique_idx
  on public.clients (email)
  where email is not null and trim(email) <> '';
