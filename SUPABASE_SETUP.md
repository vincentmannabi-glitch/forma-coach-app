# Supabase Setup for FORMA Coach

## 1. Run the migration

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project
2. Go to **SQL Editor**
3. Create a new query and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query

## 2. Enable Email/Password auth

Supabase Auth is enabled by default. Ensure **Email** is enabled under:
- Project → Authentication → Providers → Email

## 3. Configure Auth (optional)

- **Email confirmations**: If you want users to verify email, enable "Confirm email" in Auth settings
- **Site URL**: Set your app URL in Authentication → URL Configuration for redirects

## 4. Test cross-device sync

1. Sign up or log in on one device
2. Complete onboarding and add some data (workout, food log, etc.)
3. Log out
4. Log in on another device (or incognito) with the same email
5. Verify all data appears

## Tables created

- **profiles** – User profiles (extends `auth.users`), onboarding data
- **sessions** – Workout sessions
- **sets** – Exercise sets per session
- **checkins** – Morning check-ins
- **measurements** – Body measurements
- **progress_photos** – Progress photos (stores photo URL)
- **recipes** – Cookbook recipes (shared, read-only for users)
- **chat_messages** – Chat history
- **food_entries** – Food log
- **user_preferences** – Key-value user preferences

All tables have Row Level Security (RLS) so users can only access their own data.
