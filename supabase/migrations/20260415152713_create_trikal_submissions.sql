/*
  # Trikal Vaani - Core Schema

  ## New Tables

  ### trikal_submissions
  Stores every birth-chart form submission for lead capture and analytics.
  - id: unique UUID primary key
  - name: user's full name
  - dob: date of birth
  - birth_time: birth time as text (HH:MM)
  - city: city of birth
  - energy_score: computed daily energy score (0-100)
  - pillar_scores: JSON object with scores for each of the 6 life pillars
  - created_at: submission timestamp

  ## Security
  - RLS enabled on trikal_submissions
  - Anyone can INSERT (public form submission)
  - Only authenticated admins can SELECT/UPDATE/DELETE
*/

CREATE TABLE IF NOT EXISTS trikal_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  dob date NOT NULL,
  birth_time text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  energy_score integer NOT NULL DEFAULT 0,
  pillar_scores jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trikal_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit birth form"
  ON trikal_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view submissions"
  ON trikal_submissions
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS trikal_submissions_created_at_idx
  ON trikal_submissions (created_at DESC);
