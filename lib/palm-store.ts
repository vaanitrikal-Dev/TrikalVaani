// ============================================================
// File: lib/palm-store.ts
// Version: 1.0 (27 Oct 2026) — NAYA
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Hast Rekha v3 ke do saajhe kaam (paid-analyze aur retry dono yahi use karte hain):
//   1. saveConsentPhotos — SIRF tab jab customer ne consent checkbox chuna ho:
//      photo PRIVATE bucket 'palm-train' mein (naam/number ke bina, sirf slug
//      folder). Engine sudharne ke liye. Consent nahi = kuch save nahi.
//   2. newRetryToken — muft dobara-photo ka gupt token (sirf usi customer ke paas).
// ============================================================

import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export const TRAIN_BUCKET = 'palm-train';

export function newRetryToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function tokenMatches(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Consent wali photos 'palm-train' mein. Kabhi throw nahi — galti par [] lautata hai. */
export async function saveConsentPhotos(
  supabase: SupabaseClient,
  slug: string,
  photos: { right?: string | null; left?: string | null },
): Promise<string[]> {
  const saved: string[] = [];
  const stamp = Date.now();
  for (const side of ['right', 'left'] as const) {
    const b64 = photos[side];
    if (!b64) continue;
    try {
      const path = `${slug}/${stamp}-${side}.jpg`;
      const { error } = await supabase.storage.from(TRAIN_BUCKET)
        .upload(path, Buffer.from(b64, 'base64'), { contentType: 'image/jpeg', upsert: true });
      if (!error) saved.push(path);
      else console.error('[Trikal] Palm consent photo save failed:', error.message);
    } catch (e) {
      console.error('[Trikal] Palm consent photo exception:', e);
    }
  }
  return saved;
}

/** Website right/left photo → VM ke dominant/other fields (engine v2.0 right/left khud nikalta hai). */
export function toVmPhotos(right?: string | null, left?: string | null) {
  if (right) return { dominant_palm_b64: right, other_palm_b64: left ?? null, handedness: 'right' };
  return { dominant_palm_b64: left ?? null, other_palm_b64: null, handedness: 'left' };
}
