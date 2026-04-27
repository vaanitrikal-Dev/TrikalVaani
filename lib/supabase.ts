/**
 * ============================================================
 * TRIKAL VAANI — Supabase Client + Data Functions
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/supabase.ts
 * VERSION: 2.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.0 CHANGES:
 *   - Added savePrediction() — saves full Gemini prediction to Supabase
 *   - Added getPrediction() — fetches prediction by sessionId + domainId
 *   - Added getLatestPrediction() — fetches most recent prediction for session
 *   - Fixed corrupted process.env references from v1.0
 *   - Kept saveSubmission() intact — no breaking changes
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(
  supabaseUrl     || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// ─── EXISTING TYPE — kept intact ──────────────────────────────────────────────
export type TrikalSubmission = {
  id?:           string;
  name:          string;
  dob:           string;
  birth_time:    string;
  city:          string;
  energy_score:  number;
  pillar_scores: Record<string, number>;
  created_at?:   string;
};

// ─── EXISTING FUNCTION — kept intact ─────────────────────────────────────────
export async function saveSubmission(
  data: TrikalSubmission
): Promise<string | null> {
  const { data: result, error } = await supabase
    .from('trikal_submissions')
    .insert([data])
    .select('id')
    .single();

  if (error) {
    console.error('[TV-Supabase] saveSubmission error:', error);
    return null;
  }
  return result?.id ?? null;
}

// ─── NEW: PREDICTION TYPES ────────────────────────────────────────────────────

export interface SavePredictionInput {
  sessionId:     string;        // client-generated session ID
  userId?:       string;        // Supabase Auth user ID — optional for anonymous
  domainId:      string;
  domainLabel:   string;
  personName:    string;
  dob:           string;        // YYYY-MM-DD
  birthCity:     string;
  birthTime?:    string;
  lagna?:        string;
  nakshatra?:    string;
  mahadasha?:    string;
  antardasha?:   string;
  tier:          'free' | 'basic' | 'pro' | 'premium';
  language:      'hindi' | 'hinglish' | 'english';
  segment:       'genz' | 'millennial' | 'genx';
  employment?:   string;
  sector?:       string;
  chartSource?:  string;
  prediction:    Record<string, unknown>;  // full Gemini JSON output
  processingMs?: number;
  geminiModel?:  string;
  searchUsed?:   boolean;
}

export interface PredictionRecord {
  id:             string;
  user_id:        string | null;
  session_id:     string;
  domain_id:      string;
  domain_label:   string;
  person_name:    string;
  dob:            string;
  birth_city:     string;
  tier:           string;
  language:       string;
  segment:        string;
  prediction:     Record<string, unknown>;
  simple_summary: string | null;
  headline:       string | null;
  confidence:     string | null;
  best_dates:     string | null;
  processing_ms:  number | null;
  created_at:     string;
}

// ─── NEW: SAVE PREDICTION ─────────────────────────────────────────────────────
// Called from BirthForm after /api/predict returns successfully
// Stores full prediction JSON in Supabase predictions table

export async function savePrediction(
  input: SavePredictionInput
): Promise<string | null> {
  try {
    // Extract quick-access fields from prediction JSON
    // These allow dashboard queries without parsing full JSONB
    const simpleSummaryText =
      (input.prediction?.simpleSummary as Record<string, unknown>)?.text as string ?? null;
    const headline =
      (input.prediction?.professional as Record<string, unknown>)?.headline as string ?? null;
    const confidence =
      (input.prediction?.professional as Record<string, unknown>)?.confidenceLevel as string ?? null;
    const bestDates =
      (input.prediction?.simpleSummary as Record<string, unknown>)?.bestDates as string ?? null;

    const { data: result, error } = await supabase
      .from('predictions')
      .insert([{
        session_id:     input.sessionId,
        user_id:        input.userId        ?? null,
        domain_id:      input.domainId,
        domain_label:   input.domainLabel,
        person_name:    input.personName,
        dob:            input.dob,
        birth_city:     input.birthCity,
        birth_time:     input.birthTime     ?? null,
        lagna:          input.lagna         ?? null,
        nakshatra:      input.nakshatra     ?? null,
        mahadasha:      input.mahadasha     ?? null,
        antardasha:     input.antardasha    ?? null,
        tier:           input.tier,
        language:       input.language,
        segment:        input.segment,
        employment:     input.employment    ?? null,
        sector:         input.sector        ?? null,
        chart_source:   input.chartSource   ?? 'prokerala_swiss_ephemeris',
        prediction:     input.prediction,
        simple_summary: simpleSummaryText,
        headline,
        confidence,
        best_dates:     bestDates,
        processing_ms:  input.processingMs  ?? null,
        gemini_model:   input.geminiModel   ?? null,
        search_used:    input.searchUsed    ?? false,
      }])
      .select('id')
      .single();

    if (error) {
      console.error('[TV-Supabase] savePrediction error:', error);
      return null;
    }

    console.log('[TV-Supabase] Prediction saved:', result?.id);
    return result?.id ?? null;

  } catch (err) {
    console.error('[TV-Supabase] savePrediction exception:', err);
    return null;
  }
}

// ─── NEW: GET PREDICTION BY ID ────────────────────────────────────────────────
// Called from result page to fetch prediction by predictionId from URL

export async function getPredictionById(
  predictionId: string
): Promise<PredictionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('id', predictionId)
      .single();

    if (error) {
      console.error('[TV-Supabase] getPredictionById error:', error);
      return null;
    }
    return data as PredictionRecord;

  } catch (err) {
    console.error('[TV-Supabase] getPredictionById exception:', err);
    return null;
  }
}

// ─── NEW: GET LATEST PREDICTION BY SESSION + DOMAIN ──────────────────────────
// Fallback — if predictionId not in URL, fetch by session + domain

export async function getPredictionBySession(
  sessionId: string,
  domainId:  string
): Promise<PredictionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('domain_id', domainId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('[TV-Supabase] getPredictionBySession error:', error);
      return null;
    }
    return data as PredictionRecord;

  } catch (err) {
    console.error('[TV-Supabase] getPredictionBySession exception:', err);
    return null;
  }
}

// ─── NEW: GET ALL PREDICTIONS FOR SESSION ────────────────────────────────────
// For result page history — show all domains user has analyzed

export async function getAllPredictionsForSession(
  sessionId: string
): Promise<PredictionRecord[]> {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('id, domain_id, domain_label, person_name, tier, headline, simple_summary, confidence, best_dates, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TV-Supabase] getAllPredictionsForSession error:', error);
      return [];
    }
    return (data ?? []) as PredictionRecord[];

  } catch (err) {
    console.error('[TV-Supabase] getAllPredictionsForSession exception:', err);
    return [];
  }
}

// ─── NEW: SESSION ID GENERATOR ────────────────────────────────────────────────
// Creates a persistent session ID for anonymous users
// Stored in localStorage — survives page refreshes
// When user logs in, server backfills user_id on their predictions

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-side';

  const KEY = 'tv_session_id';
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;

  // Generate a new session ID
  const newId = `tv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(KEY, newId);
  return newId;
}
