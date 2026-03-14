-- ============================================================
--  Admin RLS Fix
--  Run this in the Supabase SQL Editor
--  Allows admin users to read AND update ALL company profiles
-- ============================================================

-- 1. Allow admins to SELECT all company profiles (pending, approved, banned)
DROP POLICY IF EXISTS "Admins can view all companies" ON public.company_profiles;
CREATE POLICY "Admins can view all companies"
  ON public.company_profiles FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- 2. Allow admins to UPDATE company profiles (approve / reject / remove)
DROP POLICY IF EXISTS "Admins can update all companies" ON public.company_profiles;
CREATE POLICY "Admins can update all companies"
  ON public.company_profiles FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
