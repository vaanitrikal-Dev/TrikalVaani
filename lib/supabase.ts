/**
 * FILE: lib/supabase.ts
 * Trikal Vaani — Supabase Client + Prediction Save/Fetch
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * Version: 3.0 | Date: 2026-04-27
 * CHANGE: Added birth_lat, birth_lng, birth_timezone to SavePredictionInput interface
 */

import { createClient } from '@supabase/supabase-js';

// ─── Client ────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Public client — for frontend reads (RLS applies) */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Service client — for server-side writes (bypasses RLS) */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface SavePredictionInput {
  // Birth details
  name: string;
  birth_date: string;           // 'YYYY-MM-DD'
  birth_time: string;           // 'HH:MM'
  birth_city: string;

  // ✅ FIX v3.0: Added missing coordinate + timezone fields
  birth_lat: number;            // Latitude from geocoder / Swiss Ephemeris
  birth_lng: number;            // Longitude from geocoder / Swiss Ephemeris
  birth_timezone: string;       // IANA timezone string e.g. 'Asia/Kolkata'

  // Domain & tier
  domain_id: string;            // e.g. 'genz_dream_career'
  tier: 'free' | 'basic' | 'standard' | 'premium';

  // Prediction output
  prediction_json: Record<string, unknown>;

  // Optional auth
  user_id?: string;             // Filled after login; null for anonymous
  session_id?: string;          // sessionStorage ID for anonymous tracking
}

export interface PredictionRow extends SavePredictionInput {
  id: string;
  created_at: string;
  updated_at: string;
}

// ─── Save Prediction ────────────────────────────────────────────────────────────

/**
 * Saves a new prediction to Supabase.
 * Uses service role client to bypass RLS.
 * Returns the inserted row or throws on error.
 */
export async function savePrediction(input: SavePredictionInput): Promise<PredictionRow> {
  const { data, error } = await supabaseAdmin
    .from('predictions')
    .insert([
      {
        name:             input.name,
        birth_date:       input.birth_date,
        birth_time:       input.birth_time,
        birth_city:       input.birth_city,
        birth_lat:        input.birth_lat,
        birth_lng:        input.birth_lng,
        birth_timezone:   input.birth_timezone,
        domain_id:        input.domain_id,
        tier:             input.tier,
        prediction_json:  input.prediction_json,
        user_id:          input.user_id ?? null,
        session_id:       input.session_id ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('[Supabase] savePrediction error:', error.message);
    throw new Error(`Failed to save prediction: ${error.message}`);
  }

  return data as PredictionRow;
}

// ─── Fetch by Session ───────────────────────────────────────────────────────────

/**
 * Fetches a prediction row by session_id (anonymous user flow).
 * Returns null if not found.
 */
export async function getPredictionBySession(sessionId: string): Promise<PredictionRow | null> {
  const { data, error } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no rows
    console.error('[Supabase] getPredictionBySession error:', error.message);
    return null;
  }

  return data as PredictionRow;
}

// ─── Fetch by User ──────────────────────────────────────────────────────────────

/**
 * Fetches all predictions for a logged-in user, newest first.
 */
export async function getPredictionsByUser(userId: string): Promise<PredictionRow[]> {
  const { data, error } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getPredictionsByUser error:', error.message);
    return [];
  }

  return (data ?? []) as PredictionRow[];
}

// ─── Upgrade Tier ───────────────────────────────────────────────────────────────

/**
 * Upgrades an existing prediction's tier and overwrites prediction_json.
 * Used after successful payment to re-fetch richer prediction.
 */
export async function upgradePredictionTier(
  predictionId: string,
  newTier: 'basic' | 'standard' | 'premium',
  newPredictionJson: Record<string, unknown>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('predictions')
    .update({
      tier: newTier,
      prediction_json: newPredictionJson,
      updated_at: new Date().toISOString(),
    })
    .eq('id', predictionId);

  if (error) {
    console.error('[Supabase] upgradePredictionTier error:', error.message);
    throw new Error(`Failed to upgrade tier: ${error.message}`);
  }
}

// ─── Backfill User ID ───────────────────────────────────────────────────────────

/**
 * After login, backfill user_id on anonymous predictions matched by session_id.
 */
export async function backfillUserId(sessionId: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('predictions')
    .update({ user_id: userId })
    .eq('session_id', sessionId)
    .is('user_id', null);

  if (error) {
    console.error('[Supabase] backfillUserId error:', error.message);
  }
}
