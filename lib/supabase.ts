/**
 * FILE: lib/supabase.ts
 * Trikal Vaani — Supabase Client + Prediction Save/Fetch
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * Version: 3.2 | Date: 2026-04-27
 * FIX: supabaseAdmin now lazy — only created when called (server-side only)
 *      Prevents "supabaseKey is required" crash on client/browser
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Public client (browser safe) ───────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Admin client — LAZY, server-side only ───────────────────────────────────
// Never call this from a Client Component or browser context
let _adminClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (_adminClient) return _adminClient;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('[Supabase] SUPABASE_SERVICE_ROLE_KEY is not set');
  _adminClient = createClient(supabaseUrl, serviceKey);
  return _adminClient;
}

// ─── Session ID (browser only) ───────────────────────────────────────────────
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

// ─── Save Prediction (server-side only) ─────────────────────────────────────
export async function savePrediction(input: {
  sessionId:    string;
  domainId:     string;
  domainLabel:  string;
  personName:   string;
  dob:          string;
  birthCity:    string;
  birthTime?:   string;
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

  const admin = getAdminClient();

  const { data, error } = await admin
    .from('predictions')
    .insert([{
      session_id:      input.sessionId,
      domain_id:       input.domainId,
      domain_label:    input.domainLabel,
      person_name:     input.personName,
      dob:             input.dob,
      birth_city:      input.birthCity,
      birth_time:      input.birthTime      ?? null,
      birth_lat:       input.birth_lat      ?? null,
      birth_lng:       input.birth_lng      ?? null,
      birth_timezone:  input.birth_timezone ?? null,
      lagna:           input.lagna          ?? null,
      nakshatra:       input.nakshatra      ?? null,
      mahadasha:       input.mahadasha      ?? null,
      antardasha:      input.antardasha     ?? null,
      tier:            input.tier,
      language:        input.language       ?? 'hinglish',
      segment:         input.segment        ?? 'millennial',
      chart_source:    input.chartSource    ?? null,
      prediction_json: input.prediction,
      processing_ms:   input.processingMs   ?? null,
      gemini_model:    input.geminiModel    ?? null,
      search_used:     input.searchUsed     ?? false,
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
  const admin = getAdminClient();
  const { data, error } = await admin
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

// ─── Fetch by ID ─────────────────────────────────────────────────────────────
export async function getPredictionById(id: string) {
  const admin = getAdminClient();
  const { data, error } = await admin
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
  const admin = getAdminClient();
  const { error } = await admin
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
