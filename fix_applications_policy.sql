
-- Fix RLS policies for 'applications' and 'jobs' tables

-- 1. JOBS TABLE POLICIES
alter table public.jobs enable row level security;

-- Drop existing policies to be safe
drop policy if exists "Public jobs view" on public.jobs;
drop policy if exists "Companies insert jobs" on public.jobs;
drop policy if exists "Companies update jobs" on public.jobs;
drop policy if exists "Companies delete jobs" on public.jobs;

-- Everyone can view jobs
create policy "Public jobs view"
on public.jobs for select
using ( true );

-- Companies can insert their own jobs
create policy "Companies insert jobs"
on public.jobs for insert
with check ( auth.uid() = company_id );

-- Companies can update their own jobs
create policy "Companies update jobs"
on public.jobs for update
using ( auth.uid() = company_id );

-- Companies can delete their own jobs
create policy "Companies delete jobs"
on public.jobs for delete
using ( auth.uid() = company_id );


-- 2. APPLICATIONS TABLE POLICIES
alter table public.applications enable row level security;

-- Drop existing policies
drop policy if exists "Applicants view own" on public.applications;
drop policy if exists "Applicants insert own" on public.applications;
drop policy if exists "Companies view received" on public.applications;
drop policy if exists "Companies update received" on public.applications;

-- Applicants can view their own applications
create policy "Applicants view own"
on public.applications for select
using ( auth.uid() = user_id );

-- Applicants can create applications
create policy "Applicants insert own"
on public.applications for insert
with check ( auth.uid() = user_id );

-- Companies can view applications for THEIR jobs
create policy "Companies view received"
on public.applications for select
using (
  exists (
    select 1 from public.jobs
    where jobs.id = applications.job_id
    and jobs.company_id = auth.uid()
  )
);

-- Companies can update status of applications for THEIR jobs
create policy "Companies update received"
on public.applications for update
using (
  exists (
    select 1 from public.jobs
    where jobs.id = applications.job_id
    and jobs.company_id = auth.uid()
  )
);
