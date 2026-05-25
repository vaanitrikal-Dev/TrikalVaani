// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: lib/firebase-auth.ts
// VERSION: v1.0
// DATE: 2026-05-24
// PURPOSE:
//   Firebase Phone OTP — two steps:
//   1. sendOtp(phone)     → sends SMS, returns confirmationResult
//   2. verifyOtp(result, code) → verifies code, returns Firebase user
//   After verification, we create/link a Supabase profile so the
//   mobile user lands in the same profiles table as Gmail users.
// ============================================================

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { firebaseAuth } from './firebase';
import { supabase } from './supabase';

// ── Setup invisible reCAPTCHA (required by Firebase Phone Auth) ──
// Call once before sending OTP. Attaches to a dummy div.
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  // Clean up any previous instance
  if ((window as any)._tvRecaptcha) {
    try { (window as any)._tvRecaptcha.clear(); } catch {}
  }
  const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
  (window as any)._tvRecaptcha = verifier;
  return verifier;
}

// ── Step 1: Send OTP to phone number ────────────────────────
// phone must include country code e.g. "+919211804111"
export async function sendOtp(
  phone: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier);
}

// ── Step 2: Verify OTP + bridge to Supabase ─────────────────
// Returns { success, mobile, error }
export async function verifyOtpAndSync(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<{ success: boolean; mobile?: string; error?: string }> {
  try {
    // Verify the OTP with Firebase
    const result = await confirmationResult.confirm(code);
    const firebaseUser = result.user;
    const mobile = firebaseUser.phoneNumber ?? '';

    // Bridge: upsert a profiles row in Supabase for this mobile user.
    // We use the service-side API route to do this securely.
    const res = await fetch('/api/auth/mobile-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, uid: firebaseUser.uid }),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.error ?? 'Sync failed' };
    }

    // Store mobile in localStorage so the app knows the user is logged in
    // via phone (since Firebase session is separate from Supabase session).
    localStorage.setItem('tv_mobile_user', JSON.stringify({
      mobile,
      uid: firebaseUser.uid,
      name: data.name ?? 'Seeker',
      tier: data.tier ?? 'free',
      profileId: data.profileId,
    }));

    return { success: true, mobile };
  } catch (err: any) {
    const msg = err?.message ?? 'OTP verification failed';
    return { success: false, error: msg };
  }
}

// ── Sign out mobile user ─────────────────────────────────────
export async function signOutMobile(): Promise<void> {
  localStorage.removeItem('tv_mobile_user');
  await firebaseAuth.signOut();
}

// ── Get current mobile user from localStorage ────────────────
export function getMobileUser(): {
  mobile: string;
  uid: string;
  name: string;
  tier: string;
  profileId: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('tv_mobile_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
