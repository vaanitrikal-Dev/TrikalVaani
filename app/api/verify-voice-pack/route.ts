/**
 * ============================================================
 * TRIKAL VAANI — Voice Transcription API (Google STT REST)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-transcribe/route.ts
 * VERSION: 1.1 — Pure REST API, zero npm packages
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v1.1 CHANGES (May 10, 2026):
 *   - REMOVED: @google-cloud/speech npm package dependency
 *   - REPLACED: with direct Google STT REST API + JWT auth
 *   - SAME: Hindi/Hinglish detection, Vedic vocabulary boost
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ── Google JWT auth ───────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('[Trikal STT] Missing Google credentials');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsigned = `${encode(header)}.${encode(claim)}`;

  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    Buffer.from(keyData, 'base64'),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    Buffer.from(unsigned)
  );

  const jwt = `${unsigned}.${Buffer.from(signature).toString('base64url')}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('[Trikal STT] Token exchange failed');
  return data.access_token;
}

// ── POST handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    const language = (formData.get('language') as string) || 'hinglish';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }
    if (audioFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio too large (max 5MB)' }, { status: 413 });
    }
    if (audioFile.size < 1000) {
      return NextResponse.json({ error: 'Audio too short' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer).toString('base64');

    let languageCode = 'hi-IN';
    let alternativeLanguageCodes: string[] = ['en-IN'];
    if (language === 'english') {
      languageCode = 'en-IN';
      alternativeLanguageCodes = ['hi-IN'];
    } else if (language === 'hindi') {
      languageCode = 'hi-IN';
      alternativeLanguageCodes = [];
    }

    const token = await getAccessToken();

    const sttRes = await fetch(
      'https://speech.googleapis.com/v1/speech:recognize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode,
            alternativeLanguageCodes,
            model: 'latest_long',
            useEnhanced: true,
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

    if (!sttRes.ok) {
      const errText = await sttRes.text();
      console.error('[Trikal STT] Google API error:', errText);
      return NextResponse.json({ error: 'STT API call failed' }, { status: 500 });
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
      return NextResponse.json(
        { error: 'Could not understand audio. Please speak clearly.', transcription: '' },
        { status: 422 }
      );
    }

    const confidence =
      (sttData.results as SttResult[] | undefined)?.[0]?.alternatives?.[0]?.confidence || 0;

    return NextResponse.json(
      {
        success: true,
        transcription,
        confidence,
        language: languageCode,
        wordCount: transcription.split(/\s+/).length,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Trikal-Voice': 'v1.1',
        },
      }
    );
  } catch (err) {
    console.error('[Trikal STT] Error:', err);
    const message = err instanceof Error ? err.message : 'Transcription failed';
    return NextResponse.json(
      { error: 'Voice transcription failed', detail: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Trikal Voice STT API is live',
    model: 'google-speech-rest-latest_long',
    languages: ['hi-IN', 'en-IN'],
    version: '1.1',
  });
}
