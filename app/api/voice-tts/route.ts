/**
 * ============================================================
 * TRIKAL VAANI — Voice TTS API (Dual Tier Router)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-tts/route.ts
 * VERSION: 3.0 — Tier 1 (Wavenet-D) + Tier 2 (Gemini-TTS) routing
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v3.0 ARCHITECTURE (May 10, 2026):
 *   Pack tier-based voice routing:
 *     p11  (₹11)  → Wavenet-D       (cost ₹0.04, slow guru tone)
 *     p51  (₹51)  → Wavenet-D       (cost ₹0.04, slow guru tone)
 *     p101 (₹101) → Gemini-TTS      (cost ₹0.50, premium spiritual consultant)
 *
 *   Voice personality (BOTH tiers):
 *     - Calm astrologer (NOT customer support bot)
 *     - Slow + lower pitch (authority + trust)
 *     - Premium spiritual consultant tone
 *     - "Ancient wisdom + modern AI"
 *
 * ENV REQUIRED:
 *   GOOGLE_API_KEY  → Cloud TTS (Wavenet-D)
 *   GEMINI_API_KEY  → Gemini-TTS Premium (Charon voice)
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ── TIER 1: Wavenet-D (Cloud TTS) ─────────────────────────────
const TIER1_VOICE = 'hi-IN-Wavenet-D';
const TIER1_RATE = 0.82;
const TIER1_PITCH = -2.0;

// ── TIER 2: Gemini-TTS Premium ────────────────────────────────
// Charon = deep authoritative male, ideal for guru tone
const TIER2_MODEL = 'gemini-2.5-flash-preview-tts';
const TIER2_VOICE = 'Charon';

// ── Pack → Tier mapping ───────────────────────────────────────
const PACK_TO_TIER: { [key: string]: 1 | 2 } = {
  p11 : 1,
  p51 : 1,
  p101: 2,  // Premium tier gets Gemini-TTS
};

// ── Supabase ──────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ═══════════════════════════════════════════════════════════════
// TIER 1: Cloud TTS Wavenet-D
// ═══════════════════════════════════════════════════════════════
async function synthesizeTier1(text: string): Promise<Buffer | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('[Trikal TTS Tier1] GOOGLE_API_KEY missing');
    return null;
  }

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'hi-IN', name: TIER1_VOICE },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: TIER1_RATE,
          pitch: TIER1_PITCH,
          sampleRateHertz: 24000,
          effectsProfileId: ['headphone-class-device'],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[Trikal TTS Tier1] Wavenet-D failed:', res.status, err.substring(0, 200));
    return null;
  }

  const data = await res.json();
  if (!data.audioContent) return null;
  return Buffer.from(data.audioContent, 'base64');
}

// ═══════════════════════════════════════════════════════════════
// TIER 2: Gemini-TTS Premium (with style prompt)
// ═══════════════════════════════════════════════════════════════
async function synthesizeTier2(text: string): Promise<Buffer | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Trikal TTS Tier2] GEMINI_API_KEY missing');
    return null;
  }

  // Style prompt — natural language control of delivery
  const stylePrompt = `Speak the following Vedic astrology prediction as a calm, composed spiritual guide in his late 50s — NOT a customer support agent, NOT a YouTube narrator, NOT an energetic assistant. Use slow, deliberate pacing. Lower your pitch slightly to convey authority. Pause briefly between key insights. Pronounce Sanskrit words (Mahadasha, Antardasha, planets like Shani, Guru, Shukra) with respectful clarity. Sound like an ancient wisdom keeper who has seen many lives.

Read this exactly:

${text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${TIER2_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: stylePrompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: TIER2_VOICE },
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[Trikal TTS Tier2] Gemini-TTS failed:', res.status, err.substring(0, 300));
    return null;
  }

  const data = await res.json();
  const audioBase64 =
    data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!audioBase64) {
    console.error('[Trikal TTS Tier2] No audio in Gemini response');
    return null;
  }

  // Gemini returns PCM 16-bit 24kHz raw audio — wrap in WAV header
  const pcmBuffer = Buffer.from(audioBase64, 'base64');
  return wrapPcmInWav(pcmBuffer, 24000);
}

// ── PCM → WAV wrapper for browser playback ───────────────────
function wrapPcmInWav(pcmData: Buffer, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);                    // fmt chunk size
  header.writeUInt16LE(1, 20);                      // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

// ═══════════════════════════════════════════════════════════════
// Detect tier from session's active pack
// ═══════════════════════════════════════════════════════════════
async function getTierForSession(sessionId: string): Promise<1 | 2> {
  try {
    const { data, error } = await supabase
      .from('voice_packs')
      .select('pack_id')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .gt('valid_until', new Date().toISOString())
      .order('amount_paid', { ascending: false }) // highest pack wins
      .limit(1)
      .single();

    if (error || !data) {
      console.log('[Trikal TTS] No active pack found, defaulting to Tier 1');
      return 1;
    }

    const tier = PACK_TO_TIER[data.pack_id] || 1;
    console.log('[Trikal TTS] Pack:', data.pack_id, '→ Tier', tier);
    return tier;
  } catch (e) {
    console.error('[Trikal TTS] Tier detection error:', e);
    return 1;
  }
}

// ═══════════════════════════════════════════════════════════════
// POST handler
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sessionId, forceTier } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    // ── Clean text for TTS ───────────────────────────────────
    const words = text.trim().split(/\s+/);
    const trimmedText = words
      .slice(0, 120)
      .join(' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*+([^*]+)\*+/g, '$1')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();

    // ── Determine tier ──────────────────────────────────────
    let tier: 1 | 2;
    if (forceTier === 1 || forceTier === 2) {
      tier = forceTier;
      console.log('[Trikal TTS] Forced tier:', tier);
    } else {
      tier = await getTierForSession(sessionId);
    }

    let audioBuffer: Buffer | null = null;
    let voiceUsed = '';
    let mimeType = 'audio/mpeg';

    // ── TIER 2: Try Gemini-TTS first if premium ─────────────
    if (tier === 2) {
      audioBuffer = await synthesizeTier2(trimmedText);
      if (audioBuffer) {
        voiceUsed = `gemini-tts-${TIER2_VOICE}`;
        mimeType = 'audio/wav';
        console.log('[Trikal TTS v3.0] Gemini-TTS success:', audioBuffer.length, 'bytes');
      } else {
        console.warn('[Trikal TTS v3.0] Gemini-TTS failed, falling back to Tier 1');
      }
    }

    // ── TIER 1: Default OR Gemini-TTS fallback ──────────────
    if (!audioBuffer) {
      audioBuffer = await synthesizeTier1(trimmedText);
      if (audioBuffer) {
        voiceUsed = TIER1_VOICE;
        mimeType = 'audio/mpeg';
        console.log('[Trikal TTS v3.0] Wavenet-D success:', audioBuffer.length, 'bytes');
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 });
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type'         : mimeType,
        'Content-Length'       : audioBuffer.length.toString(),
        'Cache-Control'        : 'no-store',
        'X-Trikal-Voice-Engine': voiceUsed,
        'X-Trikal-Tier'        : String(tier),
        'X-Trikal-Word-Count'  : words.length.toString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal TTS v3.0] Fatal:', message);
    return NextResponse.json({ error: 'Voice synthesis failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status         : 'Trikal Voice TTS API is live',
    version        : '3.0',
    architecture   : 'Dual-tier voice routing',
    tier1          : { voice: TIER1_VOICE, rate: TIER1_RATE, pitch: TIER1_PITCH, packs: ['p11', 'p51'] },
    tier2          : { model: TIER2_MODEL, voice: TIER2_VOICE, packs: ['p101'] },
    tier1_cost_inr : 0.04,
    tier2_cost_inr : 0.50,
  });
}
