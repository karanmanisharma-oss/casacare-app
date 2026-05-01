-- Fix infinite recursion in profiles RLS policies
-- The existing policies reference profiles table inside profiles policies
-- causing infinite loop. Replace with security definer functions.

-- Drop all existing profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON profiles;

-- Create a security definer function to get current user role
-- This breaks the recursion by bypassing RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

-- Recreate profile policies using the function (no recursion)
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin view all profiles" ON profiles
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- Fix tickets policies that also cause recursion
DROP POLICY IF EXISTS "Users see own tickets" ON tickets;
DROP POLICY IF EXISTS "Admin full access tickets" ON tickets;
DROP POLICY IF EXISTS "Field force sees assigned" ON tickets;
DROP POLICY IF EXISTS "Users create own tickets" ON tickets;
DROP POLICY IF EXISTS "Users update own tickets" ON tickets;
DROP POLICY IF EXISTS "Field force updates assigned" ON tickets;

CREATE POLICY "Users see own tickets" ON tickets
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    get_user_role(auth.uid()) IN ('admin', 'corporate')
  );

CREATE POLICY "Users create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update tickets" ON tickets
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    get_user_role(auth.uid()) IN ('admin', 'corporate')
  );
