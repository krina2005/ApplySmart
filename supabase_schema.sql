-- Create a table for Company Profiles
create table if not exists public.company_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  company_name text,
  website text,
  location text,
  industry text,
  size text,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
alter table public.company_profiles enable row level security;

-- Allow users to view their own profile
create policy "Users can view own profile"
  on public.company_profiles for select
  using ( auth.uid() = id );

-- Allow users to insert/update their own profile
create policy "Users can update own profile"
  on public.company_profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile (update)"
  on public.company_profiles for update
  using ( auth.uid() = id );
