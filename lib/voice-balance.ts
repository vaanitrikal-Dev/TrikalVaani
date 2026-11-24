/**
 * ============================================================
 * TRIKAL VAANI — Voice pack balance check (server)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/voice-balance.ts
 * VERSION: 1.0 (24 Nov 2026) — NEW. Rohiit approved 24 Nov 2026 ("approve").
 *   /api/voice-predict aur /api/voice-tts pehle sirf sessionId dekhte the —
 *   koi bhi bina pack ke AI jawab + awaaz le sakta tha (Gemini kharcha
 *   Trikaal Vaani ka). Ab dono route pehle yahan poochte hain: is session ka
 *   koi ACTIVE pack hai jismein sawaal bache hain aur jo expire nahi hua?
 *   Wahi shart jo /api/voice-pack-order PATCH (consume) lagata hai.
 *   /api/voice-transcribe par NAHI lagaya — widget usse pack khareedne se
 *   pehle janm-details bolkar bharne ke liye bhi use karta hai.
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js';

export type VoiceBalance = { ok: true; questionsLeft: number } | { ok: false; reason: string };

/** Kabhi throw nahi karta. DB error par ok:false (paisa nahi to jawab nahi). */
export async function checkVoiceBalance(sessionId: string): Promise<VoiceBalance> {
  try {
    if (!sessionId || sessionId.length > 200) return { ok: false, reason: 'bad session' };
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );
    const { data, error } = await sb
      .from('voice_packs')
      .select('questions_left')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .gt('questions_left', 0)
      .gt('valid_until', new Date().toISOString())
      .limit(5);
    if (error) {
      console.error('[VoiceBalance] query error:', error.message);
      return { ok: false, reason: 'db error' };
    }
    const left = (data || []).reduce((s, r: any) => s + (Number(r.questions_left) || 0), 0);
    return left > 0 ? { ok: true, questionsLeft: left } : { ok: false, reason: 'no balance' };
  } catch (e: any) {
    console.error('[VoiceBalance] threw:', e?.message);
    return { ok: false, reason: 'error' };
  }
}
// END — lib/voice-balance.ts v1.0
