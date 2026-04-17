-- Allow admin role in profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('individual','nri','corporate','field_force','admin'));

-- Admin RLS policies
DROP POLICY IF EXISTS "Admin full access tickets" ON tickets;
CREATE POLICY "Admin full access tickets" ON tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin full access profiles" ON profiles;
CREATE POLICY "Admin full access profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Field force can see assigned tickets
DROP POLICY IF EXISTS "Field force sees assigned" ON tickets;
CREATE POLICY "Field force sees assigned" ON tickets
  FOR SELECT USING (auth.uid() = assigned_to);

DROP POLICY IF EXISTS "Field force updates assigned" ON tickets;
CREATE POLICY "Field force updates assigned" ON tickets
  FOR UPDATE USING (auth.uid() = assigned_to);
