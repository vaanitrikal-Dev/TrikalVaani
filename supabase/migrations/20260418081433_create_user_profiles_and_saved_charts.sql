/*
  # Create User Profiles and Saved Charts Tables

  ## Summary
  This migration creates the data model for authenticated users on Trikal Vaani.

  ## New Tables

  ### `user_profiles`
  - `id` (uuid, PK) — links to auth.users
  - `display_name` (text) — user's display name
  - `email` (text) — user email
  - `last_session_context` (jsonb) — stores last Jini Bot session context for personalised greetings
  - `created_at`, `updated_at` (timestamptz)

  ### `saved_charts`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → auth.users)
  - `name` (text) — person's name for the chart
  - `dob` (text)
  - `birth_time` (text)
  - `city` (text)
  - `energy_score` (int)
  - `pillar_scores` (jsonb)
  - `selected_question` (text) — which Dard Engine question was asked
  - `analysis_summary` (text) — short summary of the reading
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Users can only read/write their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT '',
  email text DEFAULT '',
  last_session_context jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS saved_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT '',
  dob text DEFAULT '',
  birth_time text DEFAULT '',
  city text DEFAULT '',
  energy_score integer DEFAULT 0,
  pillar_scores jsonb DEFAULT '{}',
  selected_question text DEFAULT '',
  analysis_summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own charts"
  ON saved_charts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charts"
  ON saved_charts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own charts"
  ON saved_charts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_charts_user_id ON saved_charts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_charts_created_at ON saved_charts(created_at DESC);
