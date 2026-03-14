-- ============================================================
--  Admin Approval Migration
--  Run this once in the Supabase SQL Editor
-- ============================================================

-- 1. Add approval columns to company_profiles
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned  boolean NOT NULL DEFAULT false;

-- 2. Drop old open-access select policy (everyone could see all companies)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can view own profile"       ON public.company_profiles;

-- 3. Policy: company can always read its own row (needed for login check)
CREATE POLICY "Company can view own profile"
  ON public.company_profiles FOR SELECT
  USING ( auth.uid() = id );

-- 4. Policy: any authenticated or anonymous user sees only APPROVED + NOT BANNED companies
--    (used by the User Dashboard jobs query)
CREATE POLICY "Approved companies visible to all"
  ON public.company_profiles FOR SELECT
  USING ( is_approved = true AND is_banned = false );

-- 5. Allow admin service-role to do anything (handled via service role key)
--    No extra policy needed – service role bypasses RLS by default.

-- ============================================================
-- Optional: mark already-existing companies as approved so
-- current data doesn't break. Remove this if you want to
-- re-approve all existing companies.
-- ============================================================
-- UPDATE public.company_profiles SET is_approved = true WHERE is_banned = false;
