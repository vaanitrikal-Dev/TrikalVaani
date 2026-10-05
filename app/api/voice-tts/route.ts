/**
 * ============================================================
 * TRIKAL VAANI — Voice TTS API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-tts/route.ts
 * VERSION: 6.0 — ElevenLabs REMOVED. Gemini 3.8 Flash TTS is now primary.
 * DATE: 5 Oct 2026   ·   Approved by CEO in chat (ElevenLabs subscription ending)
 *
 * CHAIN (product never goes silent):
 *   1) PRIMARY    gemini-3.8-flash-tts + Rohiit's REPLICATED voice
 *                 (env GEMINI_TTS_VOICE_ID, default voice_gjiq25svsaeo — created 3 Oct 2026)
 *   2) FALLBACK 1 gemini-3.8-flash-tts + prebuilt "Charon" (same API, no clone)
 *   3) FALLBACK 2 Google Cloud TTS hi-IN-Neural2-D
 *
 * v6.0 CHANGES vs v5.1:
 *   - ElevenLabs call deleted (subscription cancelled; a dead key would add ~1s latency to every reply).
 *   - Model 3.1-flash-tts-preview -> 3.8-flash-tts (GA; 3.1 preview is being replaced).
 *   - Style prompt moved OUT of the spoken text into an `annotations: speech_metadata.style`
 *     block, exactly as the 3.8 docs show — the model can no longer read the director's notes aloud.
 *   - Response parsed from `steps[].content[].data` (what 3.8 actually returns; verified on the VM
 *     3 Oct 2026) with `output_audio.data` kept as a fallback for older shapes.
 *   - Audio comes back as WAV; raw PCM is still wrapped if a RIFF header is missing.
 *   - BUG FIX: v5.x called synthesizeNeural2() but the function was never defined (build hid it via
 *     typescript.ignoreBuildErrors). Fallback 2 threw a ReferenceError -> 500. It now exists.
 *
 * ENV (Vercel): GEMINI_API_KEY (already set)
 *               GEMINI_TTS_VOICE_ID = voice_gjiq25svsaeo   (optional; default below)
 *               GOOGLE_TTS_API_KEY   (optional; Neural2 uses GEMINI_API_KEY if absent)
 *   NOTE: a replicated voice belongs to the Google project that created it. The Vercel GEMINI_API_KEY
 *   must be from the SAME project as the VM key, or step 1 returns 404 and the chain drops to Charon.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60; // CACHE-BUST-v6.0

const GEMINI_TTS_MODEL   = 'gemini-3.8-flash-tts';
const GEMINI_TTS_URL     = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const ROHIIT_VOICE_ID    = process.env.GEMINI_TTS_VOICE_ID || 'voice_gjiq25svsaeo';
const PREBUILT_VOICE     = 'Charon';
const FALLBACK_VOICE     = 'hi-IN-Neural2-D';

// Delivery notes travel in annotations (NOT inside the transcript) so they are never spoken.
const GURU_STYLE =
  'Calm, deeply wise Vedic astrologer in his late 50s; composed, unhurried, authoritative. ' +
  'Not a support bot, not an energetic YouTube narrator. Slow deliberate pacing with natural pauses, ' +
  'slightly lower pitch for gravitas. Pronounce Sanskrit and Hindi terms (शनि, राहु, केतु, महादशा, अंतर्दशा) ' +
  'with respectful clarity. A reverent spiritual consultation.';

type Audio = { buffer: Buffer; mime: string };

// ─────────────────────────────────────────────────────────────
// Gemini 3.8 Flash TTS (primary = replicated voice, fallback 1 = prebuilt)
// ─────────────────────────────────────────────────────────────
async function synthesizeGemini(text: string, voice: string, tag: string): Promise<Audio | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.error(`[Trikal TTS v6.0] GEMINI_API_KEY missing (${tag})`); return null; }

  const body = JSON.stringify({
    model: GEMINI_TTS_MODEL,
    input: [{
      type: 'user_input',
      content: [{ type: 'text', text, annotations: [{ type: 'speech_metadata', style: GURU_STYLE }] }],
    }],
    response_format: { type: 'audio' },
    generation_config: { speech_config: [{ voice }] },
  });

  // Google documents occasional 500s where the model emits text instead of audio — one retry on 5xx.
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(GEMINI_TTS_URL, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body,
        signal : AbortSignal.timeout(30000),
      });
    } catch (e) {
      console.error(`[Trikal TTS v6.0] ${tag} network error, attempt ${attempt}:`, e);
      continue;
    }
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      console.error(`[Trikal TTS v6.0] ${tag} HTTP ${res.status}, attempt ${attempt}:`, err.substring(0, 200));
      if (res.status >= 500 && attempt === 1) continue;
      return null;
    }
    const data: any = await res.json();
    let b64 = '';
    for (const step of data?.steps ?? []) {
      for (const c of step?.content ?? []) {
        if (c?.type === 'audio' && c?.data) b64 = c.data;
      }
    }
    if (!b64 && data?.output_audio?.data) b64 = data.output_audio.data;
    if (!b64) {
      console.error(`[Trikal TTS v6.0] ${tag} returned no audio, attempt ${attempt}`);
      if (attempt === 1) continue;
      return null;
    }
    let buf: Buffer = Buffer.from(b64, "base64");
    if (buf.subarray(0, 4).toString('ascii') !== 'RIFF') buf = wrapPcmInWav(buf, 24000);
    console.log(`[Trikal TTS v6.0] ${tag} success:`, buf.length, 'bytes');
    return { buffer: buf, mime: 'audio/wav' };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Google Cloud TTS Neural2-D (fallback 2) — was referenced in v5.x but never defined
// ─────────────────────────────────────────────────────────────
async function synthesizeNeural2(text: string): Promise<Audio | null> {
  const key = process.env.GOOGLE_TTS_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        input      : { text },
        voice      : { languageCode: 'hi-IN', name: FALLBACK_VOICE },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.92, pitch: -2.0 },
      }),
      signal : AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error('[Trikal TTS v6.0] Neural2 HTTP', res.status, (await res.text().catch(() => '')).substring(0, 200));
      return null;
    }
    const data: any = await res.json();
    if (!data?.audioContent) return null;
    const buf = Buffer.from(data.audioContent, 'base64');
    console.log('[Trikal TTS v6.0] Neural2 success:', buf.length, 'bytes');
    return { buffer: buf, mime: 'audio/mpeg' };
  } catch (e) {
    console.error('[Trikal TTS v6.0] Neural2 exception:', e);
    return null;
  }
}

function wrapPcmInWav(pcmData: Buffer, sampleRate: number): Buffer {
  const numChannels = 1, bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmData.length, 4);
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
  header.writeUInt32LE(pcmData.length, 40);
  return Buffer.concat([header, pcmData]);
}

// ─────────────────────────────────────────────────────────────
// POST handler (request/response contract unchanged — TrikalVoice.tsx needs no edit)
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { text, sessionId } = await req.json();
    if (!text || typeof text !== 'string') return NextResponse.json({ error: 'Text required' }, { status: 400 });
    if (!sessionId) return NextResponse.json({ error: 'Session required' }, { status: 401 });

    const words = text.trim().split(/\s+/);
    const clean = words.slice(0, 200).join(' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*+([^*]+)\*+/g, '$1')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();
    console.log('[Trikal TTS v6.0] Synthesizing:', words.length, 'words for session:', sessionId);

    let result = await synthesizeGemini(clean, ROHIIT_VOICE_ID, 'gemini-rohiit');
    let engine = 'gemini-3.8-rohiit';
    if (!result) {
      console.warn('[Trikal TTS v6.0] Rohiit voice unavailable -> Charon');
      result = await synthesizeGemini(clean, PREBUILT_VOICE, 'gemini-charon');
      engine = `gemini-3.8-${PREBUILT_VOICE}`;
    }
    if (!result) {
      console.warn('[Trikal TTS v6.0] Gemini failed -> Neural2-D');
      result = await synthesizeNeural2(clean);
      engine = FALLBACK_VOICE;
    }
    if (!result || result.buffer.length === 0) {
      return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 });
    }
    return new NextResponse(new Uint8Array(result.buffer), {
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
    console.error('[Trikal TTS v6.0] Fatal:', message);
    return NextResponse.json({ error: 'Voice synthesis failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status         : 'Trikaal Voice TTS API is live',
    version        : '6.0',
    voice_primary  : `${GEMINI_TTS_MODEL} replicated voice (${ROHIIT_VOICE_ID})`,
    voice_fallback1: `${GEMINI_TTS_MODEL} ${PREBUILT_VOICE}`,
    voice_fallback2: FALLBACK_VOICE,
  });
}
