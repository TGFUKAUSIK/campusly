-- Cached campus payload per Supabase Auth user (synced after VTOP login)
create table if not exists public.campus_cache (
  user_id uuid primary key references auth.users(id) on delete cascade,
  registration_number text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_campus_cache_registration on public.campus_cache(registration_number);

alter table public.campus_cache enable row level security;

create policy "campus_cache_owner_all" on public.campus_cache
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
