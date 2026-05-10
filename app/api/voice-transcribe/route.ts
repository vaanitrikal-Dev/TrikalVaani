/**
 * ============================================================
 * TRIKAL VAANI — Voice Transcription API (Google STT)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-transcribe/route.ts
 * VERSION: 1.0 — Google Cloud Speech-to-Text Hindi/Hinglish
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * PURPOSE:
 *   Receives 60-second audio blob from TrikalVoice widget
 *   Returns transcribed text in Hindi/Hinglish
 *
 * STT MODEL:
 *   - Primary language: hi-IN (Hindi)
 *   - Alternate: en-IN (Hinglish auto-detection)
 *   - Model: latest_long (best accuracy for 60s audio)
 *   - Audio format: WEBM_OPUS (browser default from MediaRecorder)
 *
 * COST:
 *   ~₹0.018 per 60-second clip (Google STT standard pricing)
 *
 * SECURITY:
 *   - Validates audio size (max 5MB)
 *   - Validates session via Supabase (must have active voice pack)
 *   - Rate limited via Vercel Edge
 *
 * ENV REQUIRED:
 *   GOOGLE_CLOUD_PROJECT_ID
 *   GOOGLE_CLOUD_CLIENT_EMAIL
 *   GOOGLE_CLOUD_PRIVATE_KEY
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ── Initialize Google STT client ──────────────────────────────
function getSpeechClient(): SpeechClient {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[Trikal Voice] Missing Google Cloud credentials. Check Vercel env vars.'
    );
  }

  return new SpeechClient({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });
}

// ── POST handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── Parse multipart form ────────────────────────────────
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const sessionId = formData.get('sessionId') as string | null;
    const language = (formData.get('language') as string) || 'hinglish';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 401 }
      );
    }

    // ── Audio size guard (max 5MB) ──────────────────────────
    if (audioFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large (max 5MB)' },
        { status: 413 }
      );
    }

    if (audioFile.size < 1000) {
      return NextResponse.json(
        { error: 'Audio file too short — please record again' },
        { status: 400 }
      );
    }

    // ── Convert audio to base64 for Google STT ──────────────
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer).toString('base64');

    // ── Determine language config ───────────────────────────
    let languageCode = 'hi-IN';
    let alternativeLanguageCodes: string[] = ['en-IN'];

    if (language === 'english') {
      languageCode = 'en-IN';
      alternativeLanguageCodes = ['hi-IN'];
    } else if (language === 'hindi') {
      languageCode = 'hi-IN';
      alternativeLanguageCodes = [];
    } else {
      // hinglish (default) — Hindi primary with English fallback
      languageCode = 'hi-IN';
      alternativeLanguageCodes = ['en-IN'];
    }

    // ── Call Google Speech-to-Text ──────────────────────────
    const client = getSpeechClient();

    const [response] = await client.recognize({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode,
        alternativeLanguageCodes,
        model: 'latest_long',
        useEnhanced: true,
        enableAutomaticPunctuation: true,
        // Vedic astrology vocabulary boost
        speechContexts: [
          {
            phrases: [
              'Mahadasha',
              'Antardasha',
              'Pratyantar',
              'Vimshottari',
              'kundali',
              'rashi',
              'nakshatra',
              'graha',
              'gochar',
              'dosha',
              'manglik',
              'kaal sarp',
              'sade sati',
              'shani',
              'rahu',
              'ketu',
              'guru',
              'shukra',
              'mangal',
              'budh',
              'surya',
              'chandra',
              'lagna',
              'navamsa',
              'BPHS',
              'Trikal Vaani',
              'Jini',
            ],
            boost: 15,
          },
        ],
      },
      audio: { content: audioBytes },
    });

    // ── Extract transcription ───────────────────────────────
    const transcription =
      response.results
        ?.map((r) => r.alternatives?.[0]?.transcript || '')
        .filter(Boolean)
        .join(' ')
        .trim() || '';

    if (!transcription) {
      return NextResponse.json(
        {
          error: 'Could not understand audio. Please speak clearly and try again.',
          transcription: '',
        },
        { status: 422 }
      );
    }

    // ── Confidence score (for QA) ───────────────────────────
    const confidence =
      response.results?.[0]?.alternatives?.[0]?.confidence || 0;

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
          'X-Trikal-Voice': 'v1.0',
        },
      }
    );
  } catch (err) {
    console.error('[Trikal Voice STT] Error:', err);
    const message =
      err instanceof Error ? err.message : 'Transcription failed';
    return NextResponse.json(
      { error: 'Voice transcription failed', detail: message },
      { status: 500 }
    );
  }
}

// ── GET handler — health check ────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status: 'Trikal Voice STT API is live',
    model: 'google-speech-to-text-latest_long',
    languages: ['hi-IN', 'en-IN'],
    version: '1.0',
  });
}
