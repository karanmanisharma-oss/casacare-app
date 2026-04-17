-- ================================================
-- CASACARE — Admin role + RLS (run once on existing DB)
-- Supabase Dashboard → SQL Editor → paste → Run
-- Safe: adds constraint + policies without dropping core ticket rules
-- ================================================

-- 1) Allow `admin` in profiles.role
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('individual', 'nri', 'corporate', 'field_force', 'admin'));

-- 2) Admin can read all profiles (field force list, customer names on tickets)
drop policy if exists "Admin read all profiles" on profiles;
create policy "Admin read all profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- 3) Admin full read/update on tickets (additive OR with existing policies)
drop policy if exists "Admin select all tickets" on tickets;
create policy "Admin select all tickets" on tickets for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admin update all tickets" on tickets;
create policy "Admin update all tickets" on tickets for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
