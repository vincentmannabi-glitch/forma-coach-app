-- FORMA Coach - Initial schema with RLS
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================================================
-- USERS (profiles) - extends auth.users
-- =============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  onboarding_complete boolean default false,
  trial_start_date date,
  trial_end_date date,
  subscription_tier text default 'free',
  goal text,
  training_style text,
  experience_level text,
  days_per_week int,
  equipment text[],
  injuries boolean,
  injuries_details text,
  food_preferences jsonb default '[]',
  foods_to_avoid jsonb default '[]',
  dietary_approach jsonb default '[]',
  bodyweight numeric,
  body_weight_unit text default 'lb',
  mom_status text default 'standard',
  pregnancy_weeks int,
  postnatal_weeks int,
  breastfeeding boolean,
  doctor_cleared boolean,
  -- Extended profile flags (from check-ins, chat, etc.)
  knee_rehab_program boolean,
  coach_rehab_only boolean,
  coach_rehab_since text,
  coach_recommended_light_training boolean,
  coach_injury_note text,
  sore_rehab_auto boolean,
  sore_rehab_region text,
  parent_snacking boolean,
  nutrition_tracker_enabled boolean,
  eating_window jsonb,
  food_exclusions jsonb default '[]',
  food_exclusions_other text,
  foods_you_love jsonb default '[]',
  favourite_snack_ids jsonb default '[]',
  habits_to_move_away text,
  parq_responses jsonb,
  parq_consent boolean,
  pregnancy_trimester int,
  postnatal_band text,
  birth_type text,
  mom_session_minutes int,
  cooking_for_family text,
  household_size int,
  session_minutes int,
  dietary_approaches jsonb default '[]',
  onboarding_profile jsonb default '{}'
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- =============================================================================
-- SESSIONS
-- =============================================================================
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  program_week int,
  session_type text,
  session_name text,
  workout_type text,
  exercises_completed jsonb default '[]',
  total_volume numeric,
  duration int,
  check_in_sleep text,
  check_in_feeling text,
  check_in_soreness_location text,
  adjustments_made jsonb default '[]',
  completed_at timestamptz default now(),
  created_at timestamptz default now()
);

create index sessions_user_date_idx on public.sessions(user_id, date desc);

alter table public.sessions enable row level security;

create policy "Users can manage own sessions"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- SETS
-- =============================================================================
create table public.sets (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  exercise_name text not null,
  set_number int not null,
  weight numeric,
  reps int,
  completed boolean default false,
  personal_record boolean default false,
  created_at timestamptz default now()
);

create index sets_session_idx on public.sets(session_id);

alter table public.sets enable row level security;

create policy "Users can manage sets via session"
  on public.sets for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- =============================================================================
-- CHECKINS
-- =============================================================================
create table public.checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  sleep_quality text,
  body_feeling text,
  soreness_location text,
  soreness_side text,
  soreness_level int,
  injury_reported boolean,
  injury_duration text,
  session_adjusted jsonb default '{}',
  home_harmony text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create index checkins_user_date_idx on public.checkins(user_id, date desc);

alter table public.checkins enable row level security;

create policy "Users can manage own checkins"
  on public.checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- MEASUREMENTS
-- =============================================================================
create table public.measurements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  bodyweight numeric,
  body_fat numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  arms numeric,
  legs numeric,
  notes text,
  created_at timestamptz default now()
);

create index measurements_user_date_idx on public.measurements(user_id, date desc);

alter table public.measurements enable row level security;

create policy "Users can manage own measurements"
  on public.measurements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- PROGRESS_PHOTOS
-- =============================================================================
create table public.progress_photos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  photo_url text not null,
  notes text,
  created_at timestamptz default now()
);

create index progress_photos_user_date_idx on public.progress_photos(user_id, date desc);

alter table public.progress_photos enable row level security;

create policy "Users can manage own progress photos"
  on public.progress_photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- RECIPES (app-managed, read-only for users - or we can add user recipes later)
-- =============================================================================
create table public.recipes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  calories int,
  protein text,
  carbs text,
  fat text,
  prep_time text,
  ingredients jsonb default '[]',
  steps jsonb default '[]',
  photo_url text,
  dietary_tags text[] default '{}',
  allergen_tags text[] default '{}',
  created_at timestamptz default now()
);

-- Recipes can be public/read-only for all authenticated users
alter table public.recipes enable row level security;

create policy "Authenticated users can read recipes"
  on public.recipes for select
  using (auth.role() = 'authenticated');

-- =============================================================================
-- CHAT_MESSAGES
-- =============================================================================
create table public.chat_messages (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  role text not null check (role in ('user', 'coach')),
  message_type text default 'chat',
  variant text,
  created_at timestamptz default now()
);

create index chat_messages_user_date_idx on public.chat_messages(user_id, created_at desc);

alter table public.chat_messages enable row level security;

create policy "Users can manage own chat messages"
  on public.chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- FOOD_ENTRIES (food log)
-- =============================================================================
create table public.food_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  calories numeric default 0,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  date_key text not null,
  logged_at timestamptz default now(),
  source text,
  barcode text
);

create index food_entries_user_date_idx on public.food_entries(user_id, date_key);

alter table public.food_entries enable row level security;

create policy "Users can manage own food entries"
  on public.food_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- USER_PREFERENCES (grocery, servings, etc. - key-value style)
-- =============================================================================
create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now(),
  unique(user_id, key)
);

alter table public.user_preferences enable row level security;

create policy "Users can manage own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket for progress photos (optional - if using Supabase Storage)
-- insert into storage.buckets (id, name, public) values ('progress-photos', 'progress-photos', false);
-- create policy "Users can upload own progress photos" on storage.objects for insert with check (bucket_id = 'progress-photos' and auth.uid()::text = (storage.foldername(name))[1]);
