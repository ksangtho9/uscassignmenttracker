-- Profiles: one row per auth user; secrets stored encrypted at the application layer (bytea).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  brightspace_ical_url_ciphertext bytea,
  google_refresh_token_ciphertext bytea,
  google_calendar_id text,
  use_dedicated_calendar boolean not null default true,
  calendar_color_id text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_last_synced_at_idx on public.profiles (last_synced_at);

alter table public.profiles enable row level security;

create policy "Users can select own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Synced events: written by external automation (e.g. n8n) using the service role.

create table if not exists public.synced_events (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  brightspace_uid text not null,
  google_event_id text not null,
  last_modified_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, brightspace_uid)
);

create index if not exists synced_events_user_id_idx on public.synced_events (user_id);

alter table public.synced_events enable row level security;

create policy "Users can select own synced events"
  on public.synced_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No insert/update/delete policies for authenticated users: only the service role (bypasses RLS).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists synced_events_set_updated_at on public.synced_events;
create trigger synced_events_set_updated_at
  before update on public.synced_events
  for each row
  execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
