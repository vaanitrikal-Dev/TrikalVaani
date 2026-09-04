/**
 * ============================================================
 * TRIKAL VAANI — Voice TTS API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-tts/route.ts
 * VERSION: 5.1 — Gemini TTS fallback moved to the 3.x Interactions API
 *
 * v5.1 CHANGES (3 Sep 2026) — Gemini fallback only. ElevenLabs (primary) and
 * Neural2-D (fallback 2) are untouched.
 *
 *   THIS WAS NOT A MODEL-NAME SWAP. gemini-2.5-flash-preview-tts used
 *   /models/{model}:generateContent. Gemini 3.1 Flash TTS uses a DIFFERENT
 *   ENDPOINT with a different request and response shape:
 *     endpoint  /models/{m}:generateContent  ->  /v1beta/interactions
 *     auth      ?key=<KEY>                   ->  x-goog-api-key header
 *     body      contents + generationConfig  ->  input + response_format
 *     voice     speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName
 *                                            ->  generation_config.speech_config[].voice
 *     audio     candidates[0]...inlineData.data -> output_audio.data
 *   Changing only the model string would have returned 404 on every call.
 *   Charon still exists in the 3.1 voice list, and output is still 24kHz PCM,
 *   so wrapPcmInWav() is unchanged.
 *
 *   TWO FAILURE MODES GOOGLE DOCUMENTS FOR THIS MODEL, both handled below:
 *   1. "The model occasionally returns text tokens instead of audio tokens,
 *      causing the server to fail the request with a 500 error... implement
 *      automated retry logic." -> ONE retry on 5xx.
 *   2. "Vague prompts may... cause the model to read your style instructions
 *      and director's notes aloud." -> the guru style prompt is now wrapped in
 *      an explicit synthesis instruction with a labelled transcript boundary.
 *      Without that, a customer could hear the persona brief read out.
 *
 *   HONEST NOTE ON THE DEADLINE: gemini-2.5-flash and gemini-2.5-pro (text)
 *   shut down on 16 October 2026. gemini-2.5-flash-preview-tts is a SEPARATE
 *   preview model ID and Google has not published a shutdown date for it; the
 *   docs still list it as supported. It is being migrated anyway because
 *   preview models carry a short deprecation notice, not because a date is
 *   confirmed.
 *
 *   RISK IS CONTAINED: Gemini is FALLBACK 1. If this path fails the chain
 *   still drops to Neural2-D, so the product does not go silent either way.
 *
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
const GEMINI_TTS_MODEL = 'gemini-3.1-flash-tts-preview';
const GEMINI_TTS_VOICE = 'Charon';   // still in the 3.1 voice list — "Informative"
const GEMINI_TTS_URL   = 'https://generativelanguage.googleapis.com/v1beta/interactions';

// ── Neural2-D (fallback 2) ────────────────────────────────────
const FALLBACK_VOICE   = 'hi-IN-Neural2-D';

// ── Style prompt for Gemini guru persona (fallback only) ──────
// v5.1: opens with an explicit synthesis instruction and closes with a labelled
// TRANSCRIPT boundary. Google documents that without both, this model can read
// the director's notes aloud instead of performing them, or reject the request
// as PROHIBITED_CONTENT because the classifier never sees a clear speech task.
const GURU_STYLE_PROMPT = `Synthesize speech for the transcript that appears after the TRANSCRIPT label below. Read ONLY that transcript aloud. Do not read these instructions.

Speak as a calm, deeply wise Vedic astrologer in his late 50s — composed, unhurried, authoritative. 
NOT a customer support bot. NOT a YouTube narrator. NOT energetic or upbeat.
Use slow, deliberate pacing with natural pauses between insights.
Slightly lower your pitch for gravitas and trust.
Pronounce Sanskrit and Hindi words (Shani, Rahu, Ketu, Mahadasha, Antardasha, Pancham bhav) with respectful clarity.
Sound like an ancient wisdom keeper who has spent decades studying the stars.
This is a spiritual consultation — treat it with reverence.

TRANSCRIPT:`;

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
    console.error('[Trikal TTS v5.1] GEMINI_API_KEY missing');
    return null;
  }

  const fullPrompt = `${GURU_STYLE_PROMPT}\n\n${text}`;

  // Gemini 3.1 Flash TTS — Interactions API. See the v5.1 note in the header:
  // this is a different endpoint and payload from the 2.5 TTS call, not a
  // renamed model.
  const body = JSON.stringify({
    model: GEMINI_TTS_MODEL,
    input: fullPrompt,
    response_format: { type: 'audio' },
    generation_config: {
      speech_config: [{ voice: GEMINI_TTS_VOICE }],
    },
  });

  // Google documents that this model randomly returns text tokens instead of
  // audio and fails the request with a 500, and explicitly tells callers to
  // retry. Two attempts, then hand over to Neural2-D rather than stall the
  // request — the caller already has a working fallback below us.
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(GEMINI_TTS_URL, {
        method : 'POST',
        headers: {
          'Content-Type'  : 'application/json',
          'x-goog-api-key': apiKey,
        },
        body,
        signal: AbortSignal.timeout(30000),
      });
    } catch (e) {
      console.error(`[Trikal TTS v5.1] Gemini-TTS network error, attempt ${attempt}:`, e);
      continue;
    }

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      console.error(`[Trikal TTS v5.1] Gemini-TTS ${res.status}, attempt ${attempt}:`, err.substring(0, 200));
      // 5xx is the documented random failure and is worth one retry.
      // A 4xx is our own request being wrong and will fail identically again.
      if (res.status >= 500 && attempt === 1) continue;
      return null;
    }

    const data = await res.json();
    const audioBase64 = data?.output_audio?.data;

    if (!audioBase64) {
      // This is the "returned text instead of audio" case. Log what came back
      // so the cause is visible rather than guessed at.
      const asText = data?.output_text ?? '';
      console.error(
        `[Trikal TTS v5.1] No audio in Gemini response, attempt ${attempt}.`,
        asText ? `Model returned text instead: ${String(asText).substring(0, 120)}` : ''
      );
      if (attempt === 1) continue;
      return null;
    }

    const pcmBuffer = Buffer.from(audioBase64, 'base64');
    const wavBuffer = wrapPcmInWav(pcmBuffer, 24000);

    console.log('[Trikal TTS v5.1] Gemini-TTS fallback success:', wavBuffer.length, 'bytes');
    return { buffer: wavBuffer, mime: 'audio/wav' };
  }

  return null;
}

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
