/**
 * FILE: lib/supabase.ts
 * Trikal Vaani — Supabase Client + Prediction Save/Fetch
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * Version: 3.1 | Date: 2026-04-27
 * CHANGE: Added birth_lat, birth_lng, birth_timezone — all other fields UNCHANGED
 */

import { createClient } from '@supabase/supabase-js';

// ─── Clients ────────────────────────────────────────────────────────────────

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase      = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ─── Session ID ─────────────────────────────────────────────────────────────

export function getOrCreateSessionId(): string {
  try {
    const key = 'tv_session_id';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `tv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `tv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

// ─── Save Prediction ─────────────────────────────────────────────────────────
// Field names match BirthForm.tsx exactly — DO NOT RENAME

export async function savePrediction(input: {
  sessionId:    string;
  domainId:     string;
  domainLabel:  string;
  personName:   string;
  dob:          string;
  birthCity:    string;
  birthTime?:   string;

  // ✅ v3.1 — 3 new fields for upgrade re-prediction
  birth_lat?:      number;
  birth_lng?:      number;
  birth_timezone?: number | string;

  lagna?:       string;
  nakshatra?:   string;
  mahadasha?:   string;
  antardasha?:  string;
  tier:         'free' | 'basic' | 'standard' | 'premium';
  language?:    string;
  segment?:     string;
  chartSource?: string;
  prediction:   Record<string, unknown>;
  processingMs?: number;
  geminiModel?:  string;
  searchUsed?:   boolean;
}): Promise<string> {

  const { data, error } = await supabaseAdmin
    .from('predictions')
    .insert([{
      session_id:     input.sessionId,
      domain_id:      input.domainId,
      domain_label:   input.domainLabel,
      person_name:    input.personName,
      dob:            input.dob,
      birth_city:     input.birthCity,
      birth_time:     input.birthTime    ?? null,

      // ✅ 3 new columns
      birth_lat:      input.birth_lat      ?? null,
      birth_lng:      input.birth_lng      ?? null,
      birth_timezone: input.birth_timezone ?? null,

      lagna:          input.lagna       ?? null,
      nakshatra:      input.nakshatra   ?? null,
      mahadasha:      input.mahadasha   ?? null,
      antardasha:     input.antardasha  ?? null,
      tier:           input.tier,
      language:       input.language    ?? 'hinglish',
      segment:        input.segment     ?? 'millennial',
      chart_source:   input.chartSource ?? null,
      prediction_json: input.prediction,
      processing_ms:  input.processingMs ?? null,
      gemini_model:   input.geminiModel  ?? null,
      search_used:    input.searchUsed   ?? false,
    }])
    .select('id')
    .single();

  if (error) {
    console.error('[Supabase] savePrediction error:', error.message);
    throw new Error(error.message);
  }

  return data.id as string;
}

// ─── Fetch by Session ────────────────────────────────────────────────────────

export async function getPredictionBySession(sessionId: string) {
  const { data, error } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[Supabase] getPredictionBySession error:', error.message);
    return null;
  }
  return data;
}

// ─── Fetch by Prediction ID ──────────────────────────────────────────────────

export async function getPredictionById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('predictions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[Supabase] getPredictionById error:', error.message);
    return null;
  }
  return data;
}

// ─── Upgrade Tier ────────────────────────────────────────────────────────────

export async function upgradePredictionTier(
  predictionId: string,
  newTier: 'basic' | 'standard' | 'premium',
  newPredictionJson: Record<string, unknown>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('predictions')
    .update({
      tier:            newTier,
      prediction_json: newPredictionJson,
      updated_at:      new Date().toISOString(),
    })
    .eq('id', predictionId);

  if (error) {
    console.error('[Supabase] upgradePredictionTier error:', error.message);
    throw new Error(error.message);
  }
}
