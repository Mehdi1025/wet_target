-- One active timer per admin user per project
create unique index if not exists time_logs_one_active_per_user_idx
  on public.time_logs (project_id, admin_username)
  where end_time is null and admin_username is not null;
