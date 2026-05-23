create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  plan_date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'todo' check (status in ('todo', 'doing', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  category text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  plan_date date not null,
  is_done boolean default false,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quick_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  icon text,
  category text,
  is_favorite boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_daily_plans_updated_at on public.daily_plans;
create trigger trg_daily_plans_updated_at
before update on public.daily_plans
for each row execute function public.handle_updated_at();

drop trigger if exists trg_checklist_items_updated_at on public.checklist_items;
create trigger trg_checklist_items_updated_at
before update on public.checklist_items
for each row execute function public.handle_updated_at();

drop trigger if exists trg_quick_links_updated_at on public.quick_links;
create trigger trg_quick_links_updated_at
before update on public.quick_links
for each row execute function public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.daily_plans enable row level security;
alter table public.checklist_items enable row level security;
alter table public.quick_links enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Daily plans are owned by user" on public.daily_plans;
create policy "Daily plans are owned by user"
on public.daily_plans for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Checklist items are owned by user" on public.checklist_items;
create policy "Checklist items are owned by user"
on public.checklist_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Quick links are owned by user" on public.quick_links;
create policy "Quick links are owned by user"
on public.quick_links for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
