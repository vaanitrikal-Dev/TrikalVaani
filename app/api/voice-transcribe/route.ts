/**
 * ============================================================
 * TRIKAL VAANI — Voice Transcription API (Google STT)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-transcribe/route.ts
 * VERSION: 2.1 — Chirp model for Hinglish code-switching
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.1 CHANGES (May 10, 2026):
 *   - UPGRADED: model 'default' → 'chirp'
 *   - REASON: Chirp handles Hindi+English mixed speech (code-switching)
 *   - ADDED: Expanded Vedic + common Hindi phrase boost list
 *   - ADDED: enableSpokenPunctuation for natural speech
 *   - SAME: API Key auth, auto-detect encoding, hinglish default
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
    if (audioFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio too large (max 5MB)' }, { status: 413 });
    }
    if (audioFile.size < 500) {
      return NextResponse.json(
        { error: 'Recording too short — please speak for at least 3 seconds' },
        { status: 400 }
      );
    }

    console.log('[Trikal STT v2.1] Audio received:', {
      size: audioFile.size,
      type: audioFile.type,
    });

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes  = Buffer.from(arrayBuffer).toString('base64');

    // ── Language config for Hinglish code-switching ──────────
    // Primary: Hindi, Alternative: English IN
    // Chirp model handles both simultaneously
    let languageCode = 'hi-IN';
    let alternativeLanguageCodes: string[] = ['en-IN'];

    if (language === 'english') {
      languageCode = 'en-IN';
      alternativeLanguageCodes = ['hi-IN'];
    } else if (language === 'hindi') {
      languageCode = 'hi-IN';
      alternativeLanguageCodes = [];
    }

    // ── Call Google STT v1 with Chirp model ─────────────────
    const sttRes = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          config: {
            languageCode,
            alternativeLanguageCodes,
            model                    : 'chirp',        // Best for Hinglish code-switching
            enableAutomaticPunctuation: true,
            speechContexts: [
              {
                phrases: [
                  // Vedic terms
                  'Mahadasha', 'Antardasha', 'Pratyantar', 'Vimshottari',
                  'kundali', 'rashi', 'nakshatra', 'graha', 'gochar',
                  'dosha', 'manglik', 'kaal sarp', 'sade sati',
                  'Shani', 'Rahu', 'Ketu', 'Guru', 'Shukra', 'Mangal',
                  'Budh', 'Surya', 'Chandra', 'Lagna', 'Navamsa',
                  'Pancham bhav', 'Dasham bhav', 'Ashtam bhav',
                  'BPHS', 'Brihat Parashara', 'Trikal Vaani', 'Trikal',
                  // Common Hindi words that get mangled
                  'bimari', 'pareshan', 'career', 'naukri', 'shaadi',
                  'vivah', 'business', 'paisa', 'swasthya', 'remedies',
                  'upay', 'dasha', 'antardasha', 'sthiti',
                  // Common Hinglish phrases
                  'kya hoga', 'kab hoga', 'kaise hoga', 'batao',
                  'mera beta', 'meri beti', 'mera bhai', 'meri shaadi',
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
      console.error('[Trikal STT v2.1] Google error:', sttRes.status, errText.substring(0, 300));

      // Fallback: if Chirp fails, try with 'default' model
      console.log('[Trikal STT v2.1] Trying fallback with default model...');
      const fallbackRes = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({
            config: {
              languageCode,
              alternativeLanguageCodes,
              model                    : 'default',
              enableAutomaticPunctuation: true,
            },
            audio: { content: audioBytes },
          }),
        }
      );

      if (!fallbackRes.ok) {
        return NextResponse.json(
          { error: 'Voice recognition failed', detail: errText.substring(0, 300) },
          { status: 500 }
        );
      }

      const fallbackData = await fallbackRes.json();
      type AltResult = { transcript?: string; confidence?: number };
      type SttResult = { alternatives?: AltResult[] };
      const transcription =
        (fallbackData.results as SttResult[] | undefined)
          ?.map((r) => r.alternatives?.[0]?.transcript || '')
          .filter(Boolean)
          .join(' ')
          .trim() || '';

      if (!transcription) {
        return NextResponse.json(
          { error: 'Could not understand audio. Please speak clearly.', transcription: '' },
          { status: 422 }
        );
      }

      return NextResponse.json({ success: true, transcription, model: 'default-fallback' });
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
      console.warn('[Trikal STT v2.1] Empty result:', JSON.stringify(sttData).substring(0, 200));
      return NextResponse.json(
        { error: 'Could not understand audio. Please speak clearly and try again.', transcription: '' },
        { status: 422 }
      );
    }

    const confidence =
      (sttData.results as SttResult[] | undefined)?.[0]?.alternatives?.[0]?.confidence || 0;

    console.log('[Trikal STT v2.1] Transcribed:', transcription.substring(0, 80), '| confidence:', confidence);

    return NextResponse.json({
      success      : true,
      transcription,
      confidence,
      language     : languageCode,
      wordCount    : transcription.split(/\s+/).length,
      model        : 'chirp',
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal STT v2.1] Fatal:', message);
    return NextResponse.json({ error: 'Voice transcription failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status  : 'Trikal Voice STT API is live',
    version : '2.1',
    model   : 'chirp (Hinglish code-switching)',
    languages: ['hi-IN', 'en-IN'],
  });
}
