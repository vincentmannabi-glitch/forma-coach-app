-- Run this in your Supabase SQL Editor to create the user_profiles table

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text,
  goal text,
  training_style text,
  experience_level text,
  days_per_week integer,
  has_injuries boolean,
  injuries_details text,
  parq_responses jsonb,
  parq_consent boolean,
  onboarding_completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Users can read/update their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);
