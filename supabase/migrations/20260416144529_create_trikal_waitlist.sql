/*
  # Create Trikal Waitlist Table

  ## Summary
  Adds a waitlist table for the "Inner Circle — 20 Page Deep Report" premium feature.

  ## New Tables
  - `trikal_waitlist`
    - `id` (uuid, primary key)
    - `email` (text, unique, not null) — subscriber email
    - `name` (text) — optional name provided at signup
    - `city` (text) — optional city
    - `source` (text) — landing page section that generated the signup
    - `created_at` (timestamptz) — auto-set

  ## Security
  - RLS enabled
  - INSERT policy: anyone can insert their own waitlist entry
  - SELECT policy: authenticated users can view their own entry by email match
*/

CREATE TABLE IF NOT EXISTS trikal_waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  name       text DEFAULT '',
  city       text DEFAULT '',
  source     text DEFAULT 'homepage',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trikal_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
  ON trikal_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own waitlist entry"
  ON trikal_waitlist
  FOR SELECT
  TO authenticated
  USING (email = current_user);
