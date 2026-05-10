/**
 * ============================================================
 * TRIKAL VAANI — Voice Transcription API (Google STT)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-transcribe/route.ts
 * VERSION: 2.3 — latest_long ONLY (no Chirp, no fallback delay)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.3 CHANGES (May 11, 2026):
 *   - REMOVED: Chirp model (requires OAuth, not API key — was causing 42s delay)
 *   - REMOVED: Fallback logic (was doubling response time on every request)
 *   - USING: latest_long model — best available with API key, handles Hinglish well
 *   - RESULT: STT now completes in 2-4 seconds consistently
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Voice service not configured' }, { status: 500 });
    }

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
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio too large (max 10MB)' }, { status: 413 });
    }
    if (audioFile.size < 500) {
      return NextResponse.json(
        { error: 'Recording too short — please speak for at least 3 seconds' },
        { status: 400 }
      );
    }

    console.log('[Trikal STT v2.3] Audio received:', {
      size: audioFile.size,
      type: audioFile.type,
    });

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

    // ── Google STT with latest_long model ────────────────────
    const sttRes = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          config: {
            languageCode,
            alternativeLanguageCodes,
            model                    : 'latest_long',
            enableAutomaticPunctuation: true,
            speechContexts: [
              {
                phrases: [
                  'Mahadasha', 'Antardasha', 'Pratyantar', 'Vimshottari',
                  'kundali', 'rashi', 'nakshatra', 'graha', 'gochar',
                  'dosha', 'manglik', 'kaal sarp', 'sade sati',
                  'Shani', 'Rahu', 'Ketu', 'Guru', 'Shukra', 'Mangal',
                  'Budh', 'Surya', 'Chandra', 'Lagna', 'Navamsa',
                  'Pancham bhav', 'Dasham bhav', 'Ashtam bhav',
                  'BPHS', 'Trikal Vaani', 'Trikal',
                  'bimari', 'pareshan', 'career', 'naukri', 'shaadi',
                  'vivah', 'business', 'paisa', 'swasthya',
                  'upay', 'dasha', 'sthiti',
                  'kya hoga', 'kab hoga', 'batao',
                  'mera beta', 'meri beti', 'meri shaadi',
                ],
                boost: 20,
              },
            ],
          },
          audio: { content: audioBytes },
        }),
      }
    );

    if (!sttRes.ok) {
      const errText = await sttRes.text();
      console.error('[Trikal STT v2.3] Google error:', sttRes.status, errText.substring(0, 200));
      return NextResponse.json(
        { error: 'Voice recognition failed', detail: errText.substring(0, 200) },
        { status: 500 }
      );
    }

    const sttData = await sttRes.json();

    type AltResult = { transcript?: string; confidence?: number };
    type SttResult = { alternatives?: AltResult[] };

    const transcription =
      (sttData.results as SttResult[] | undefined)
        ?.map((r) => r.alternatives?.[0]?.transcript || '')
        .filter(Boolean)
        .join(' ')
        .trim() || '';

    if (!transcription) {
      console.warn('[Trikal STT v2.3] Empty result:', JSON.stringify(sttData).substring(0, 150));
      return NextResponse.json(
        { error: 'Could not understand audio. Please speak clearly and try again.', transcription: '' },
        { status: 422 }
      );
    }

    const confidence =
      (sttData.results as SttResult[] | undefined)?.[0]?.alternatives?.[0]?.confidence || 0;

    console.log('[Trikal STT v2.3] Transcribed:', transcription.substring(0, 100), '| confidence:', confidence.toFixed(2));

    return NextResponse.json({
      success      : true,
      transcription,
      confidence,
      language     : languageCode,
      wordCount    : transcription.split(/\s+/).length,
      model        : 'latest_long',
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal STT v2.3] Fatal:', message);
    return NextResponse.json({ error: 'Voice transcription failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status   : 'Trikal Voice STT API is live',
    version  : '2.3',
    model    : 'latest_long',
    languages: ['hi-IN', 'en-IN'],
  });
}
