/**
 * ============================================================
 * TRIKAL VAANI — Voice TTS API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-tts/route.ts
 * VERSION: 5.0 — ElevenLabs cloned voice (Rohiit) PRIMARY
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v5.0 CHANGES (Jun 14, 2026):
 *   - PRIMARY: ElevenLabs cloned voice (Rohiit's own voice)
 *     Model: eleven_multilingual_v2 (best for Hindi/Hinglish)
 *     Makes "असली आवाज़" tagline literally true.
 *   - FALLBACK 1: Gemini-TTS Charon (if 11Labs fails OR quota out)
 *   - FALLBACK 2: Neural2-D (if both above fail)
 *   - Product NEVER goes silent — triple safety chain.
 *   - Voice ID + API key read from Vercel env (already added Jun 7):
 *       ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
 *
 * QUOTA NOTE (CEO aware):
 *   ElevenLabs Creator quota is SHARED with content engine.
 *   If monthly credits run out → auto-falls back to Gemini Charon.
 *   No outage, just a voice change until quota resets.
 *
 * VOICE PERSONALITY (unchanged for fallbacks):
 *   "Ancient wisdom + modern AI" — calm, slow, authoritative guru.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60; // CACHE-BUST-v5.0

// ── ElevenLabs (primary) ──────────────────────────────────────
const ELEVEN_MODEL = 'eleven_multilingual_v2';

// ── Gemini-TTS (fallback 1) ───────────────────────────────────
const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const GEMINI_TTS_VOICE = 'Charon';

// ── Neural2-D (fallback 2) ────────────────────────────────────
const FALLBACK_VOICE   = 'hi-IN-Neural2-D';

// ── Style prompt for Gemini guru persona (fallback only) ──────
const GURU_STYLE_PROMPT = `Speak as a calm, deeply wise Vedic astrologer in his late 50s — composed, unhurried, authoritative. 
NOT a customer support bot. NOT a YouTube narrator. NOT energetic or upbeat.
Use slow, deliberate pacing with natural pauses between insights.
Slightly lower your pitch for gravitas and trust.
Pronounce Sanskrit and Hindi words (Shani, Rahu, Ketu, Mahadasha, Antardasha, Pancham bhav) with respectful clarity.
Sound like an ancient wisdom keeper who has spent decades studying the stars.
This is a spiritual consultation — treat it with reverence.

Now read this prediction:`;

// ─────────────────────────────────────────────────────────────
// ElevenLabs synthesis (PRIMARY — Rohiit's cloned voice)
// ─────────────────────────────────────────────────────────────
async function synthesizeElevenLabs(text: string): Promise<{ buffer: Buffer; mime: string } | null> {
  const apiKey  = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    console.error('[Trikal TTS v5.0] ElevenLabs key or voiceId missing — skipping to fallback');
    return null;
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method : 'POST',
        headers: {
          'xi-api-key'  : apiKey,
          'Content-Type': 'application/json',
          'Accept'      : 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: ELEVEN_MODEL,
          voice_settings: {
            stability        : 0.45,   // a touch of natural variation, still composed
            similarity_boost : 0.85,   // stay close to Rohiit's cloned timbre
            style            : 0.30,   // mild expressiveness for guru gravitas
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      // 401 = bad key, 429 = quota exhausted — both fall back gracefully
      console.error('[Trikal TTS v5.0] ElevenLabs error:', res.status, err.substring(0, 200));
      return null;
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer   = Buffer.from(arrayBuf);

    if (buffer.length === 0) {
      console.error('[Trikal TTS v5.0] ElevenLabs returned empty audio');
      return null;
    }

    console.log('[Trikal TTS v5.0] ElevenLabs success:', buffer.length, 'bytes');
    return { buffer, mime: 'audio/mpeg' };

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal TTS v5.0] ElevenLabs exception:', message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Gemini-TTS synthesis (Fallback 1)
// ─────────────────────────────────────────────────────────────
async function synthesizeGeminiTTS(text: string): Promise<{ buffer: Buffer; mime: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Trikal TTS v5.0] GEMINI_API_KEY missing');
    return null;
  }

  const fullPrompt = `${GURU_STYLE_PROMPT}\n\n${text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`,
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE },
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[Trikal TTS v5.0] Gemini-TTS error:', res.status, err.substring(0, 200));
    return null;
  }

  const data = await res.json();
  const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!audioBase64) {
    console.error('[Trikal TTS v5.0] No audio in Gemini response');
    return null;
  }

  const pcmBuffer = Buffer.from(audioBase64, 'base64');
  const wavBuffer = wrapPcmInWav(pcmBuffer, 24000);

  console.log('[Trikal TTS v5.0] Gemini-TTS fallback success:', wavBuffer.length, 'bytes');
  return { buffer: wavBuffer, mime: 'audio/wav' };
}

// ─────────────────────────────────────────────────────────────
// Neural2-D synthesis (Fallback 2)
// ─────────────────────────────────────────────────────────────
async function synthesizeNeural2(text: string): Promise<{ buffer: Buffer; mime: string } | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        input: { text },
        voice: { languageCode: 'hi-IN', name: FALLBACK_VOICE },
        audioConfig: {
          audioEncoding   : 'MP3',
          speakingRate    : 0.80,
          pitch           : -3.0,
          sampleRateHertz : 24000,
          effectsProfileId: ['headphone-class-device'],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[Trikal TTS v5.0] Neural2 fallback failed:', res.status, err.substring(0, 150));
    return null;
  }

  const data = await res.json();
  if (!data.audioContent) return null;

  const buffer = Buffer.from(data.audioContent, 'base64');
  console.log('[Trikal TTS v5.0] Neural2 fallback success:', buffer.length, 'bytes');
  return { buffer, mime: 'audio/mpeg' };
}

// ─────────────────────────────────────────────────────────────
// PCM → WAV wrapper (Gemini PCM only)
// ─────────────────────────────────────────────────────────────
function wrapPcmInWav(pcmData: Buffer, sampleRate: number): Buffer {
  const numChannels   = 1;
  const bitsPerSample = 16;
  const byteRate      = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign    = numChannels * (bitsPerSample / 8);
  const dataSize      = pcmData.length;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

// ─────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sessionId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    // ── Clean text for TTS ───────────────────────────────────
    const words = text.trim().split(/\s+/);
    const trimmedText = words
      .slice(0, 200)
      .join(' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*+([^*]+)\*+/g, '$1')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();

    console.log('[Trikal TTS v5.0] Synthesizing:', words.length, 'words for session:', sessionId);

    // ── 1) PRIMARY: ElevenLabs (Rohiit's cloned voice) ──────
    let result = await synthesizeElevenLabs(trimmedText);
    let engine = '11labs-rohiit';

    // ── 2) FALLBACK 1: Gemini-TTS Charon ────────────────────
    if (!result) {
      console.warn('[Trikal TTS v5.0] ElevenLabs unavailable → Gemini-TTS Charon');
      result = await synthesizeGeminiTTS(trimmedText);
      engine = `gemini-tts-${GEMINI_TTS_VOICE}`;
    }

    // ── 3) FALLBACK 2: Neural2-D ────────────────────────────
    if (!result) {
      console.warn('[Trikal TTS v5.0] Gemini-TTS failed → Neural2-D');
      result = await synthesizeNeural2(trimmedText);
      engine = FALLBACK_VOICE;
    }

    if (!result || result.buffer.length === 0) {
      return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 });
    }

    return new NextResponse(result.buffer, {
      status : 200,
      headers: {
        'Content-Type'         : result.mime,
        'Content-Length'       : result.buffer.length.toString(),
        'Cache-Control'        : 'no-store',
        'X-Trikal-Voice-Engine': engine,
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal TTS v5.0] Fatal:', message);
    return NextResponse.json({ error: 'Voice synthesis failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status         : 'Trikaal Voice TTS API is live',
    version        : '5.0',
    voice_primary  : `ElevenLabs ${ELEVEN_MODEL} (Rohiit cloned voice)`,
    voice_fallback1: `Gemini-TTS ${GEMINI_TTS_VOICE}`,
    voice_fallback2: FALLBACK_VOICE,
    quality        : 'Real Rohiit voice — असली आवाज़, triple-safety fallback',
    note           : 'Quota shared with content engine — auto-falls back if exhausted',
  });
}
