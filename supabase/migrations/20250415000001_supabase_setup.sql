-- ================================================
-- CASACARE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New query
-- Paste this, click RUN
-- ================================================

-- 1. PROFILES TABLE (stores user info + role)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'individual'
    check (role in ('individual', 'nri', 'corporate', 'field_force', 'admin')),
  created_at timestamptz default now()
);

-- 2. PROPERTIES TABLE (for NRI owners)
create table if not exists properties (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  address text,
  city text,
  society_name text,
  notes text,
  created_at timestamptz default now()
);

-- 3. TICKETS TABLE (core of the app)
create table if not exists tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  assigned_to uuid references profiles(id),
  property_id uuid references properties(id),
  title text not null,
  description text,
  category text not null,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open'
    check (status in ('open', 'scheduled', 'in_progress', 'closed', 'cancelled')),
  address text,
  scheduled_at timestamptz,
  closed_at timestamptz,
  has_photos boolean default false,
  sla_breached boolean default false,
  ticket_type text default 'rm' check (ticket_type in ('rm', 'amc')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. AMC CONTRACTS TABLE (for corporate clients)
create table if not exists amc_contracts (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  value_inr numeric,
  status text default 'active' check (status in ('active', 'expired', 'pending')),
  created_at timestamptz default now()
);

-- 5. TICKET PHOTOS TABLE (proof of service)
create table if not exists ticket_photos (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade,
  uploaded_by uuid references profiles(id),
  url text not null,
  caption text,
  photo_type text default 'work' check (photo_type in ('before', 'after', 'work', 'report')),
  created_at timestamptz default now()
);

-- ================================================
-- ROW LEVEL SECURITY (RLS) — Very Important!
-- This makes sure users only see their own data
-- ================================================

alter table profiles enable row level security;
alter table properties enable row level security;
alter table tickets enable row level security;
alter table amc_contracts enable row level security;
alter table ticket_photos enable row level security;

-- Profiles: users can read/update their own profile
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Admins can read every profile (for admin dashboard / assignments)
drop policy if exists "Admin read all profiles" on profiles;
create policy "Admin read all profiles" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Properties: NRI owners see only their properties
drop policy if exists "Owners see own properties" on properties;
create policy "Owners see own properties" on properties for select using (auth.uid() = owner_id);
drop policy if exists "Owners manage own properties" on properties;
create policy "Owners manage own properties" on properties for all using (auth.uid() = owner_id);

-- Tickets: users see their own; field force sees assigned; corporate sees all
drop policy if exists "Users see own tickets" on tickets;
create policy "Users see own tickets" on tickets for select using (
  auth.uid() = user_id OR 
  auth.uid() = assigned_to OR
  exists (select 1 from profiles where id = auth.uid() and role = 'corporate') OR
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
drop policy if exists "Users create own tickets" on tickets;
create policy "Users create own tickets" on tickets for insert with check (auth.uid() = user_id);
drop policy if exists "Users update own tickets" on tickets;
create policy "Users update own tickets" on tickets for update using (
  auth.uid() = user_id OR auth.uid() = assigned_to OR
  exists (select 1 from profiles where id = auth.uid() and role in ('corporate', 'admin'))
);

-- AMC: clients see own contracts
drop policy if exists "Clients see own contracts" on amc_contracts;
create policy "Clients see own contracts" on amc_contracts for select using (auth.uid() = client_id);
drop policy if exists "Admin manages contracts" on amc_contracts;
create policy "Admin manages contracts" on amc_contracts for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('corporate', 'admin'))
);

-- Photos: visible to ticket owner and assigned tech
drop policy if exists "See ticket photos" on ticket_photos;
create policy "See ticket photos" on ticket_photos for select using (
  exists (select 1 from tickets where id = ticket_id and (user_id = auth.uid() or assigned_to = auth.uid())) OR
  exists (select 1 from profiles where id = auth.uid() and role in ('corporate', 'admin', 'nri'))
);
drop policy if exists "Upload photos" on ticket_photos;
create policy "Upload photos" on ticket_photos for insert with check (auth.uid() = uploaded_by);

-- ================================================
-- STORAGE BUCKET (run this too)
-- Creates the bucket for photos
-- ================================================
insert into storage.buckets (id, name, public) values ('casacare-media', 'casacare-media', true)
on conflict do nothing;

create policy "Anyone can view media" on storage.objects for select using (bucket_id = 'casacare-media');
create policy "Auth users upload media" on storage.objects for insert with check (bucket_id = 'casacare-media' and auth.role() = 'authenticated');
