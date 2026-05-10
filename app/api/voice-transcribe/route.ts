/**
 * ============================================================
 * TRIKAL VAANI — Voice Transcription API (Google STT)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-transcribe/route.ts
 * VERSION: 2.0 — Simple API Key auth (no JWT, no service account)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.0 CHANGES (May 10, 2026):
 *   - REMOVED: All JWT / service account / private key logic
 *   - REPLACED: Simple GOOGLE_API_KEY query param auth
 *   - SAME: Hindi/Hinglish detection, Vedic vocabulary boost
 *   - SAME: Auto-detect audio encoding (no hardcoded WEBM_OPUS)
 *   - SIMPLER: 60% less code, 100% more reliable
 *
 * ENV REQUIRED:
 *   GOOGLE_API_KEY (from GCP Console → Credentials → API Key)
 *   Restricted to: Cloud Speech-to-Text API
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('[Trikal STT v2.0] GOOGLE_API_KEY missing');
      return NextResponse.json(
        { error: 'Voice service not configured' },
        { status: 500 }
      );
    }

    // ── Parse form data ──────────────────────────────────────
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    const language  = (formData.get('language') as string) || 'hinglish';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }
    if (audioFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio too large (max 5MB)' }, { status: 413 });
    }
    if (audioFile.size < 500) {
      return NextResponse.json(
        { error: 'Recording too short — please speak for at least 2 seconds' },
        { status: 400 }
      );
    }

    console.log('[Trikal STT v2.0] Audio received:', {
      size: audioFile.size,
      type: audioFile.type,
    });

    // ── Convert audio to base64 ──────────────────────────────
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes  = Buffer.from(arrayBuffer).toString('base64');

    // ── Language config ──────────────────────────────────────
    let languageCode = 'hi-IN';
    let alternativeLanguageCodes: string[] = ['en-IN'];
    if (language === 'english') {
      languageCode = 'en-IN';
      alternativeLanguageCodes = ['hi-IN'];
    } else if (language === 'hindi') {
      languageCode = 'hi-IN';
      alternativeLanguageCodes = [];
    }

    // ── Call Google STT with API Key ─────────────────────────
    const sttRes = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          config: {
            // No encoding/sampleRate — Google auto-detects from audio
            languageCode,
            alternativeLanguageCodes,
            model                   : 'default',
            enableAutomaticPunctuation: true,
            speechContexts: [
              {
                phrases: [
                  'Mahadasha', 'Antardasha', 'Pratyantar', 'Vimshottari',
                  'kundali', 'rashi', 'nakshatra', 'graha', 'gochar',
                  'dosha', 'manglik', 'kaal sarp', 'sade sati',
                  'shani', 'rahu', 'ketu', 'guru', 'shukra', 'mangal',
                  'budh', 'surya', 'chandra', 'lagna', 'navamsa',
                  'BPHS', 'Trikal Vaani', 'Jini',
                ],
                boost: 15,
              },
            ],
          },
          audio: { content: audioBytes },
        }),
      }
    );

    // ── Handle Google API errors ─────────────────────────────
    if (!sttRes.ok) {
      const errText = await sttRes.text();
      console.error('[Trikal STT v2.0] Google error:', sttRes.status, errText.substring(0, 300));
      return NextResponse.json(
        { error: 'Voice recognition failed', detail: errText.substring(0, 300) },
        { status: 500 }
      );
    }

    const sttData = await sttRes.json();
    console.log('[Trikal STT v2.0] Response received');

    // ── Extract transcription ────────────────────────────────
    type AltResult = { transcript?: string; confidence?: number };
    type SttResult = { alternatives?: AltResult[] };

    const transcription =
      (sttData.results as SttResult[] | undefined)
        ?.map((r) => r.alternatives?.[0]?.transcript || '')
        .filter(Boolean)
        .join(' ')
        .trim() || '';

    if (!transcription) {
      console.warn('[Trikal STT v2.0] Empty result:', JSON.stringify(sttData).substring(0, 200));
      return NextResponse.json(
        { error: 'Could not understand audio. Please speak clearly and try again.', transcription: '' },
        { status: 422 }
      );
    }

    const confidence =
      (sttData.results as SttResult[] | undefined)?.[0]?.alternatives?.[0]?.confidence || 0;

    return NextResponse.json(
      {
        success     : true,
        transcription,
        confidence,
        language    : languageCode,
        wordCount   : transcription.split(/\s+/).length,
      },
      {
        headers: {
          'Cache-Control' : 'no-store',
          'X-Trikal-Voice': 'v2.0',
        },
      }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal STT v2.0] Fatal:', message);
    return NextResponse.json(
      { error: 'Voice transcription failed', detail: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status  : 'Trikal Voice STT API is live',
    version : '2.0',
    auth    : 'api-key',
    languages: ['hi-IN', 'en-IN'],
  });
}
