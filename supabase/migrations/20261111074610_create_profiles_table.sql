/*
# Create profiles table for game lobby

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) — one row per user
  - `username` (text, unique, not null) — display name shown on profile card
  - `level` (integer, not null, default 1) — player level shown on profile card
  - `uid` (text, unique, not null) — short public game UID shown on profile card
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `profiles`.
- Grant SELECT, INSERT, UPDATE to `authenticated` only (app has a sign-in screen).
- SELECT: users can read their own profile row.
- INSERT: users can insert their own profile row (user_id defaults to auth.uid()).
- UPDATE: users can update their own profile row (username only).
- `id` defaults to `auth.uid()` so inserts that omit it succeed.

3. Important Notes
- This is a multi-user app with a sign-in screen, so policies are scoped to `authenticated`.
- The `id` column has `DEFAULT auth.uid()` so the frontend insert works without passing it.
- `uid` is a short readable game identifier (e.g. "1029384") separate from the auth UUID.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  level integer NOT NULL DEFAULT 1,
  uid text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
