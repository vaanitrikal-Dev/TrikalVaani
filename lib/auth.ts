import { supabase } from './supabase';

// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: lib/auth.ts
// VERSION: v3.0
// DATE: 2026-05-24
// CHANGES:
//   v3.0: - Gmail (Google OAuth) login added via signInWithGoogle().
//           After login, user returns to the SAME page they were on.
//         - Pointed everything at the REAL `profiles` table
//           (was wrongly using non-existent `user_profiles`).
//         - Removed broken signUp insert (DB trigger handle_new_user
//           already creates the profiles row automatically).
//         - Removed saved_charts functions (table never existed).
//           Vault now reads paid reports from `predictions` (Path 1).
// ============================================================

// ---------- EMAIL / PASSWORD ----------

export async function signUpWithEmail(email: string, password: string, name: string) {
  // The DB trigger `handle_new_user` auto-creates the profiles row
  // (id, name, email, tier='free') using the metadata we pass below.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });
  if (error || !data.user) return { error };
  return { data };
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// ---------- GMAIL (GOOGLE OAUTH) ----------

export async function signInWithGoogle() {
  // After Google verifies the user, Supabase sends them to /auth/callback,
  // which then returns them to the exact page they started from.
  const returnTo =
    typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '/';

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
    },
  });
}

// ---------- SESSION ----------

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ---------- PROFILE (real `profiles` table) ----------

export async function getUserProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

// ---------- VAULT (Path 1: the user's own saved reports) ----------

export async function getMyReports(userId: string) {
  const { data } = await supabase
    .from('predictions')
    .select('id, person_name, domain_label, dob, tier, headline, simple_summary, public_slug, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
