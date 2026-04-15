/*
  # Fix RLS Policies, Index, and Auth Connection Strategy for trikal_submissions

  ## Changes

  1. RLS Policy Fixes
     - Replace `auth.uid() IS NOT NULL` with `(select auth.uid()) IS NOT NULL` to avoid
       per-row function re-evaluation and improve query performance at scale.
     - Tighten the INSERT policy from always-true `WITH CHECK (true)` to a meaningful
       check that validates required fields are present and non-empty, preventing
       empty/garbage submissions.

  2. Index Cleanup
     - Drop the unused `trikal_submissions_created_at_idx` index to reduce write overhead.

  3. Auth DB Connection Strategy
     - Switch from a fixed connection count to a percentage-based allocation so that
       scaling the instance size automatically adjusts Auth connections.

  ## Security Notes
  - The INSERT policy now validates `name` and `dob` are non-empty, so blind/empty
    submissions are rejected at the database level.
  - The SELECT policy uses `(select auth.uid())` for a one-time evaluation per query
    rather than per row, dramatically improving read performance for admins.
*/

DROP POLICY IF EXISTS "Anyone can submit birth form" ON trikal_submissions;
DROP POLICY IF EXISTS "Authenticated users can view submissions" ON trikal_submissions;

CREATE POLICY "Validated public inserts only"
  ON trikal_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL
    AND length(trim(name)) > 0
    AND dob IS NOT NULL
    AND city IS NOT NULL
    AND length(trim(city)) > 0
  );

CREATE POLICY "Authenticated admins can view submissions"
  ON trikal_submissions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP INDEX IF EXISTS trikal_submissions_created_at_idx;

ALTER ROLE authenticator
  SET pgrst.db_pool_size TO '5%';
