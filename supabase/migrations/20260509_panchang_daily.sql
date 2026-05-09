-- ============================================================================
-- 🔱 TRIKAL VAANI — CEO PROTECTION HEADER 🔱
-- ============================================================================
-- File:        supabase/migrations/20260509_panchang_daily.sql
-- Version:     v1.0
-- Phase:       C2 — AI Content Engine (Cache & Audit)
-- Owner:       Rohiit Gupta, Chief Vedic Architect
-- Domain:      trikalvaani.com
-- GitHub:      vaanitrikal-Dev/TrikalVaani
-- Created:     May 09, 2026
--
-- PURPOSE:
--   Stores AI-generated panchang content for ISR-cached pages.
--   Powers /panchang/[date], /[city]/panchang, /events/[slug] routes.
--   Audit log tracks every Gemini generation run for cost/error monitoring.
--
-- IRON RULES:
--   1. RLS enforced. Public = SELECT only. Writes via service_role only.
--   2. Unique constraint on (date, city_slug, lang) prevents duplicate spend.
--   3. Idempotent — cron can re-run without inserting dupes (UPSERT pattern).
--   4. Indexes optimized for ISR lookup (date + city + lang).
--
-- DEPLOY:
--   npx supabase db push
--   OR: paste into Supabase SQL Editor → Run
-- ============================================================================

-- ============================================================================
-- TABLE 1: panchang_daily — primary content cache
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.panchang_daily (
  id              BIGSERIAL PRIMARY KEY,

  -- Identity (UNIQUE composite key)
  date            DATE          NOT NULL,
  city_slug       TEXT          NOT NULL DEFAULT 'national',  -- 'national' for hub
  lang            TEXT          NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'hi')),

  -- Raw panchang data (from VM Swiss Ephemeris)
  tithi           TEXT          NOT NULL,
  nakshatra       TEXT          NOT NULL,
  yoga            TEXT          NOT NULL,
  karana          TEXT          NOT NULL,
  vara            TEXT          NOT NULL,
  sunrise         TEXT          NOT NULL,
  sunset          TEXT          NOT NULL,
  rahu_kaal       TEXT          NOT NULL,
  abhijit_muhurat TEXT,
  yamaganda       TEXT,
  gulika          TEXT,
  moon_sign       TEXT,
  sun_sign        TEXT,

  -- AI-generated SEO/GEO content
  geo_answer              TEXT          NOT NULL,  -- 40-60 word direct answer
  intro_paragraph         TEXT          NOT NULL,
  spiritual_significance  TEXT          NOT NULL,
  dos_and_donts           JSONB         NOT NULL,  -- { dos: [], donts: [] }
  remedies                JSONB         NOT NULL,  -- string[]
  faq_json                JSONB         NOT NULL,  -- [{question, answer}, ...]
  meta_title              TEXT          NOT NULL,
  meta_description        TEXT          NOT NULL,
  schema_keywords         JSONB         NOT NULL DEFAULT '[]'::jsonb,

  -- Provenance
  generated_by    TEXT          NOT NULL,  -- 'gemini-2.5-pro' or 'gemini-2.5-flash'
  prompt_version  TEXT          NOT NULL DEFAULT 'panchang-v1.0',
  cost_inr_paise  INTEGER,                 -- cost in paise for tracking

  -- Timestamps
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Uniqueness — one row per (date + city + language)
  CONSTRAINT panchang_daily_unique UNIQUE (date, city_slug, lang)
);

-- ----------------------------------------------------------------------------
-- INDEXES — optimized for ISR / Next.js fetches
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_panchang_daily_date
  ON public.panchang_daily (date DESC);

CREATE INDEX IF NOT EXISTS idx_panchang_daily_city_date
  ON public.panchang_daily (city_slug, date DESC);

CREATE INDEX IF NOT EXISTS idx_panchang_daily_lookup
  ON public.panchang_daily (date, city_slug, lang);

CREATE INDEX IF NOT EXISTS idx_panchang_daily_created
  ON public.panchang_daily (created_at DESC);

-- ----------------------------------------------------------------------------
-- TRIGGER — auto-update updated_at
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.tg_panchang_daily_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS panchang_daily_updated_at ON public.panchang_daily;
CREATE TRIGGER panchang_daily_updated_at
  BEFORE UPDATE ON public.panchang_daily
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_panchang_daily_set_updated_at();

-- ============================================================================
-- TABLE 2: panchang_generation_log — audit + cost tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.panchang_generation_log (
  id              BIGSERIAL PRIMARY KEY,
  run_id          UUID          NOT NULL DEFAULT gen_random_uuid(),
  run_started_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  run_finished_at TIMESTAMPTZ,

  date            DATE          NOT NULL,
  city_slug       TEXT          NOT NULL,
  lang            TEXT          NOT NULL,

  status          TEXT          NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'skipped')),
  model_used      TEXT,
  tokens_in       INTEGER,
  tokens_out      INTEGER,
  cost_inr_paise  INTEGER,
  error_message   TEXT,

  indexnow_pushed BOOLEAN       NOT NULL DEFAULT FALSE,
  indexnow_url    TEXT,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_panchang_log_run_id
  ON public.panchang_generation_log (run_id);

CREATE INDEX IF NOT EXISTS idx_panchang_log_status_date
  ON public.panchang_generation_log (status, date DESC);

CREATE INDEX IF NOT EXISTS idx_panchang_log_created
  ON public.panchang_generation_log (created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.panchang_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panchang_generation_log ENABLE ROW LEVEL SECURITY;

-- panchang_daily: public READ, service_role WRITE
DROP POLICY IF EXISTS "panchang_daily_public_read" ON public.panchang_daily;
CREATE POLICY "panchang_daily_public_read"
  ON public.panchang_daily
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "panchang_daily_service_write" ON public.panchang_daily;
CREATE POLICY "panchang_daily_service_write"
  ON public.panchang_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- panchang_generation_log: service_role ONLY (no public access — internal audit)
DROP POLICY IF EXISTS "panchang_log_service_only" ON public.panchang_generation_log;
CREATE POLICY "panchang_log_service_only"
  ON public.panchang_generation_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- HELPER VIEW — latest panchang per city (for fast homepage widget)
-- ============================================================================

CREATE OR REPLACE VIEW public.panchang_latest AS
SELECT DISTINCT ON (city_slug, lang)
  id,
  date,
  city_slug,
  lang,
  tithi,
  nakshatra,
  yoga,
  sunrise,
  sunset,
  rahu_kaal,
  geo_answer,
  meta_title,
  created_at
FROM public.panchang_daily
ORDER BY city_slug, lang, date DESC;

-- ============================================================================
-- COST TRACKING — monthly Gemini spend summary
-- ============================================================================

CREATE OR REPLACE VIEW public.panchang_monthly_cost AS
SELECT
  DATE_TRUNC('month', created_at)::DATE AS month,
  model_used,
  COUNT(*)                       AS row_count,
  SUM(cost_inr_paise) / 100.0    AS total_cost_inr,
  SUM(tokens_in)                 AS total_tokens_in,
  SUM(tokens_out)                AS total_tokens_out
FROM public.panchang_generation_log
WHERE status = 'success'
GROUP BY 1, 2
ORDER BY 1 DESC, 2;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON public.panchang_daily            TO anon, authenticated;
GRANT SELECT ON public.panchang_latest           TO anon, authenticated;
GRANT ALL    ON public.panchang_daily            TO service_role;
GRANT ALL    ON public.panchang_generation_log   TO service_role;
GRANT SELECT ON public.panchang_monthly_cost     TO service_role;

-- ============================================================================
-- COMMENT METADATA
-- ============================================================================

COMMENT ON TABLE  public.panchang_daily IS
  'Trikal Vaani | AI-generated panchang content cache. Read-public, write-service-role.';
COMMENT ON TABLE  public.panchang_generation_log IS
  'Trikal Vaani | Cron audit + Gemini cost tracking. Service-role only.';
COMMENT ON COLUMN public.panchang_daily.geo_answer IS
  '40-60 word direct answer for Generative Engine Optimization. MUST start every public page.';

-- ============================================================================
-- END — 20260509_panchang_daily.sql v1.0
-- 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
-- ============================================================================
