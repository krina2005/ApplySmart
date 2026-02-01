-- Fix RLS policies for company_profiles table to ensure visibility in User Dashboard

-- 1. Enable RLS (idempotent operation)
alter table public.company_profiles enable row level security;

-- 2. Grant basic permissions to anon and authenticated roles
grant select on public.company_profiles to anon, authenticated;
grant insert, update, delete on public.company_profiles to authenticated;

-- 3. Drop ALL existing policies to avoid conflicts or duplicates
drop policy if exists "Users can view own profile" on public.company_profiles;
drop policy if exists "Users can update own profile" on public.company_profiles;
drop policy if exists "Users can update own profile (update)" on public.company_profiles;
drop policy if exists "Enable read access for all users" on public.company_profiles;
drop policy if exists "Users can insert own profile" on public.company_profiles;
drop policy if exists "Users can delete own profile" on public.company_profiles;

-- 4. Create correct policies

-- Allow ANYONE (including unauthenticated users if needed, or just all authenticated users) to VIEW profiles
-- This is essential for the User Dashboard to see Company Profiles
create policy "Enable read access for all users"
  on public.company_profiles for select
  using ( true );

-- Allow companies (authenticated users) to INSERT their OWN profile
create policy "Users can insert own profile"
  on public.company_profiles for insert
  with check ( auth.uid() = id );

-- Allow companies to UPDATE their OWN profile
create policy "Users can update own profile"
  on public.company_profiles for update
  using ( auth.uid() = id );

-- Allow companies to DELETE their OWN profile
create policy "Users can delete own profile"
  on public.company_profiles for delete
  using ( auth.uid() = id );
