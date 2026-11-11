/**
 * ============================================================
 * TRIKAAL VAANI — Auth + Vault helpers
 * File:    lib/auth.ts
 * VERSION: v2.0 (11 Nov 2026)
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 *
 * v2.0 (11 Nov 2026) — VAULT FIX (Rohiit approved, 11 Nov 2026).
 *   Customer Vishal Malhotra ne ₹51 diye, report bani, par "My Vault" khaali
 *   tha. Jaanch mein mila ki vault KABHI kaam hi nahi kiya:
 *     - getSavedCharts() `saved_charts` table padhta tha, aur
 *       getUserProfile()/signUp `user_profiles` — dono tables Supabase mein
 *       HAIN HI NAHI. Har call chup-chaap khaali/fail.
 *     - saveChart() poore code mein kahin call nahi hota tha.
 *   Ab:
 *     - getVaultReadings(): seedha `predictions` se, user_id = login user.
 *       RLS policy "Users can view own predictions" (auth.uid() = user_id)
 *       pehle se hai — user sirf apni readings dekh sakta hai.
 *     - getUserProfile(): asli `profiles` table (name, email).
 *     - signUpWithEmail(): naam `profiles.name` mein (pehle galat table mein
 *       jaata tha, isliye sabka naam trigger wala default "Friend" reh jaata).
 *   HATAYE (koi import nahi karta tha — grep se check kiya):
 *     saveChart, deleteChart, getSavedCharts, updateLastSessionContext.
 *     Delete jaan-boojh kar nahi rakha: users ke liye predictions par DELETE
 *     policy nahi hai, aur CEO ka NO-DELETE niyam hai.
 * ============================================================
 */
import { supabase } from './supabase';

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) return { error };

  // profiles row signup trigger banata hai (default naam "Friend").
  // Asli naam yahan likho. Session na ho (email confirm on) to RLS rok degi —
  // tab bhi signup safal hai, sirf naam default rahega. Kabhi throw nahi.
  try {
    const clean = name.trim().slice(0, 100);
    if (clean) {
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ name: clean, updated_at: new Date().toISOString() })
        .eq('id', data.user.id);
      if (pErr) console.warn('[TV-auth] profile name not saved:', pErr.message);
    }
  } catch (e) {
    console.warn('[TV-auth] profile name update threw:', e);
  }

  return { data };
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export type VaultProfile = {
  name: string | null;
  email: string | null;
};

export async function getUserProfile(userId: string): Promise<VaultProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[TV-auth] getUserProfile:', error.message);
    return null;
  }
  return (data as VaultProfile) ?? null;
}

export type VaultReading = {
  id: string;
  person_name: string | null;
  domain_label: string | null;
  dob: string | null;
  birth_time: string | null;
  birth_city: string | null;
  mahadasha: string | null;
  antardasha: string | null;
  prediction_tier: string | null;
  payment_verified: boolean | null;
  public_slug: string | null;
  created_at: string;
};

// Sirf halke columns — prediction_json / kundali_data (bade JSON) nahi mangte.
export async function getVaultReadings(userId: string): Promise<VaultReading[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('id, person_name, domain_label, dob, birth_time, birth_city, mahadasha, antardasha, prediction_tier, payment_verified, public_slug, created_at')
    .eq('user_id', userId)
    .not('public_slug', 'is', null)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    console.error('[TV-auth] getVaultReadings:', error.message);
    return [];
  }
  return (data ?? []) as VaultReading[];
}
// END — lib/auth.ts v2.0
