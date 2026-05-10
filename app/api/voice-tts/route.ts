/**
 * ============================================================
 * TRIKAL VAANI — Voice TTS API (Google Text-to-Speech)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-tts/route.ts
 * VERSION: 2.0 — Simple API Key auth (no JWT, no service account)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.0 CHANGES (May 10, 2026):
 *   - REMOVED: All JWT / service account / private key logic
 *   - REPLACED: Simple GOOGLE_API_KEY query param auth
 *   - SAME: Chirp3-HD primary, Wavenet-D fallback
 *   - SAME: speakingRate 0.85, pitch -1.5 (guru tone)
 *   - SIMPLER: 60% less code, 100% more reliable
 *
 * VOICE:
 *   Primary:  hi-IN-Chirp3-HD-Achernar (premium, authoritative)
 *   Fallback: hi-IN-Wavenet-D (slow, clear, guru tone)
 *
 * ENV REQUIRED:
 *   GOOGLE_API_KEY (from GCP Console → Credentials → API Key)
 *   Restricted to: Cloud Text-to-Speech API
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const VOICE_PRIMARY  = 'hi-IN-Chirp3-HD-Achernar';
const VOICE_FALLBACK = 'hi-IN-Wavenet-D';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('[Trikal TTS v2.0] GOOGLE_API_KEY missing');
      return NextResponse.json(
        { error: 'Voice service not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { text, sessionId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text required for voice synthesis' },
        { status: 400 }
      );
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    // ── Trim to 120 words max ────────────────────────────────
    const words       = text.trim().split(/\s+/);
    const trimmedText = words.slice(0, 120).join(' ');

    // ── Try Chirp 3 HD first ─────────────────────────────────
    // Note: Chirp 3 HD does NOT support speakingRate/pitch params
    let audioBuffer: Buffer | null = null;
    let voiceUsed   = VOICE_PRIMARY;

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
      }
    } else {
      const errText = await primaryRes.text();
      console.warn('[Trikal TTS v2.0] Chirp3-HD failed:', primaryRes.status, errText.substring(0, 200));
    }

    // ── Fallback to Wavenet-D (supports rate + pitch) ────────
    if (!audioBuffer) {
      console.log('[Trikal TTS v2.0] Falling back to Wavenet-D');
      voiceUsed = VOICE_FALLBACK;

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
              speakingRate    : 0.85,   // Slow = guru authority
              pitch           : -1.5,   // Lower = gravitas
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
        }
      } else {
        const errText = await fallbackRes.text();
        console.error('[Trikal TTS v2.0] Wavenet-D also failed:', fallbackRes.status, errText.substring(0, 200));
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Voice synthesis failed — both voices unavailable' },
        { status: 500 }
      );
    }

    console.log('[Trikal TTS v2.0] Audio generated:', voiceUsed, audioBuffer.length, 'bytes');

    // ── Return MP3 audio ─────────────────────────────────────
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
    console.error('[Trikal TTS v2.0] Fatal:', message);
    return NextResponse.json(
      { error: 'Voice synthesis failed', detail: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status        : 'Trikal Voice TTS API is live',
    version       : '2.0',
    auth          : 'api-key',
    voice_primary : 'hi-IN-Chirp3-HD-Achernar',
    voice_fallback: 'hi-IN-Wavenet-D',
    speaking_rate : 0.85,
    pitch         : -1.5,
  });
}
