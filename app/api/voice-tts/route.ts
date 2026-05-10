/**
 * ============================================================
 * TRIKAL VAANI — Voice TTS API (Google Text-to-Speech)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-tts/route.ts
 * VERSION: 2.1 — Wavenet-D primary (slow guru tone)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.1 CHANGES (May 10, 2026):
 *   - SWAPPED: Wavenet-D is now PRIMARY (Chirp3-HD was too fast)
 *   - REASON: Chirp3-HD ignores speakingRate — always sounds rushed
 *   - Wavenet-D at 0.82 speed = slow, authoritative, guru tone
 *   - Chirp3-HD kept as FALLBACK if Wavenet-D fails
 *   - SAME: API Key auth, same response format
 *
 * VOICE SETTINGS:
 *   Primary:      hi-IN-Wavenet-D
 *   speakingRate: 0.82 (slow = guru authority)
 *   pitch:        -2.0 (lower = gravitas, not robotic)
 *   Fallback:     hi-IN-Chirp3-HD-Achernar
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Wavenet-D PRIMARY — supports rate + pitch for slow guru tone
const VOICE_PRIMARY  = 'hi-IN-Wavenet-D';
// Chirp3-HD FALLBACK — premium but no rate/pitch control
const VOICE_FALLBACK = 'hi-IN-Chirp3-HD-Achernar';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Voice service not configured' }, { status: 500 });
    }

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
      .slice(0, 120)
      .join(' ')
      // Final safety clean — strip any remaining markdown/links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*+([^*]+)\*+/g, '$1')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();

    let audioBuffer: Buffer | null = null;
    let voiceUsed = VOICE_PRIMARY;

    // ── PRIMARY: Wavenet-D (slow, authoritative) ─────────────
    const primaryRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          input      : { text: trimmedText },
          voice      : { languageCode: 'hi-IN', name: VOICE_PRIMARY },
          audioConfig: {
            audioEncoding   : 'MP3',
            speakingRate    : 0.82,   // Slow = guru authority
            pitch           : -2.0,   // Lower = gravitas
            sampleRateHertz : 24000,
            effectsProfileId: ['headphone-class-device'],
          },
        }),
      }
    );

    if (primaryRes.ok) {
      const data = await primaryRes.json();
      if (data.audioContent) {
        audioBuffer = Buffer.from(data.audioContent, 'base64');
        console.log('[Trikal TTS v2.1] Wavenet-D success:', audioBuffer.length, 'bytes');
      }
    } else {
      const err = await primaryRes.text();
      console.warn('[Trikal TTS v2.1] Wavenet-D failed:', primaryRes.status, err.substring(0, 200));
    }

    // ── FALLBACK: Chirp3-HD ───────────────────────────────────
    if (!audioBuffer) {
      voiceUsed = VOICE_FALLBACK;
      console.log('[Trikal TTS v2.1] Trying Chirp3-HD fallback');

      const fallbackRes = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({
            input      : { text: trimmedText },
            voice      : { languageCode: 'hi-IN', name: VOICE_FALLBACK },
            audioConfig: {
              audioEncoding   : 'MP3',
              sampleRateHertz : 24000,
              effectsProfileId: ['headphone-class-device'],
            },
          }),
        }
      );

      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        if (data.audioContent) {
          audioBuffer = Buffer.from(data.audioContent, 'base64');
          console.log('[Trikal TTS v2.1] Chirp3-HD fallback success:', audioBuffer.length, 'bytes');
        }
      } else {
        const err = await fallbackRes.text();
        console.error('[Trikal TTS v2.1] Both voices failed:', err.substring(0, 200));
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 });
    }

    return new NextResponse(audioBuffer, {
      status : 200,
      headers: {
        'Content-Type'          : 'audio/mpeg',
        'Content-Length'        : audioBuffer.length.toString(),
        'Cache-Control'         : 'no-store',
        'X-Trikal-Voice-Engine' : voiceUsed,
        'X-Trikal-Word-Count'   : words.length.toString(),
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal TTS v2.1] Fatal:', message);
    return NextResponse.json({ error: 'Voice synthesis failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status        : 'Trikal Voice TTS API is live',
    version       : '2.1',
    voice_primary : 'hi-IN-Wavenet-D (slow guru tone)',
    voice_fallback: 'hi-IN-Chirp3-HD-Achernar',
    speaking_rate : 0.82,
    pitch         : -2.0,
  });
}
