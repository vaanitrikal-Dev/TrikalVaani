/**
 * ============================================================
 * TRIKAL VAANI — Voice TTS API (Google Cloud Text-to-Speech)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-tts/route.ts
 * VERSION: 1.0 — Chirp 3 HD Hindi Female (Guru/Authoritative)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * VOICE: hi-IN-Chirp3-HD-Achernar (primary)
 *        hi-IN-Wavenet-D (fallback)
 * SPEED: 0.85 — slow, authoritative, guru tone
 * PITCH: -1.5 — gravitas, not robotic
 * OUTPUT: MP3, 90–120 words max
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ── Voice config ──────────────────────────────────────────────
const VOICE_PRIMARY  = 'hi-IN-Chirp3-HD-Achernar';
const VOICE_FALLBACK = 'hi-IN-Wavenet-D';
const SPEAKING_RATE  = 0.85;
const PITCH          = -1.5;

// ── Build Google TTS auth token ───────────────────────────────
async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
  const privateKey  = process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('[Trikal TTS] Missing Google Cloud credentials');
  }

  const now    = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim  = {
    iss  : clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud  : 'https://oauth2.googleapis.com/token',
    exp  : now + 3600,
    iat  : now,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsigned = `${encode(header)}.${encode(claim)}`;

  // Sign with private key using Web Crypto API
  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const binaryKey = Buffer.from(keyData, 'base64');

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
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

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method : 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body   : new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion : jwt,
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new Error('[Trikal TTS] Failed to get access token');
  }

  return tokenData.access_token;
}

// ── Call Google TTS REST API ──────────────────────────────────
async function synthesize(
  text    : string,
  voice   : string,
  useRate : boolean,
  token   : string
): Promise<Buffer | null> {
  const body: Record<string, unknown> = {
    input      : { text },
    voice      : { languageCode: 'hi-IN', name: voice },
    audioConfig: {
      audioEncoding    : 'MP3',
      sampleRateHertz  : 24000,
      effectsProfileId : ['headphone-class-device'],
      ...(useRate && {
        speakingRate: SPEAKING_RATE,
        pitch       : PITCH,
      }),
    },
  };

  const res = await fetch(
    'https://texttospeech.googleapis.com/v1/text:synthesize',
    {
      method : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.audioContent) return null;

  return Buffer.from(data.audioContent, 'base64');
}

// ── POST handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body      = await req.json();
    const { text, sessionId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text required for voice synthesis' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 401 }
      );
    }

    // ── Trim to 120 words max ───────────────────────────────
    const words       = text.trim().split(/\s+/);
    const trimmedText = words.slice(0, 120).join(' ');

    const token = await getAccessToken();

    // ── Try Chirp 3 HD first (no rate/pitch support) ────────
    let audioBuffer = await synthesize(trimmedText, VOICE_PRIMARY, false, token);
    let voiceUsed   = VOICE_PRIMARY;

    // ── Fallback to Wavenet-D (supports rate + pitch) ───────
    if (!audioBuffer) {
      console.warn('[Trikal TTS] Chirp3-HD unavailable — using Wavenet-D');
      audioBuffer = await synthesize(trimmedText, VOICE_FALLBACK, true, token);
      voiceUsed   = VOICE_FALLBACK;
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Voice synthesis failed' },
        { status: 500 }
      );
    }

    // ── Return MP3 ──────────────────────────────────────────
    return new NextResponse(audioBuffer, {
      status : 200,
      headers: {
        'Content-Type'            : 'audio/mpeg',
        'Content-Length'          : audioBuffer.length.toString(),
        'Cache-Control'           : 'no-store',
        'X-Trikal-Voice-Engine'   : voiceUsed,
        'X-Trikal-Word-Count'     : words.length.toString(),
      },
    });

  } catch (err) {
    console.error('[Trikal TTS] Error:', err);
    return NextResponse.json(
      { error: 'Voice synthesis failed', detail: String(err) },
      { status: 500 }
    );
  }
}

// ── GET — health check ────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status         : 'Trikal Voice TTS API is live',
    voice_primary  : VOICE_PRIMARY,
    voice_fallback : VOICE_FALLBACK,
    speaking_rate  : SPEAKING_RATE,
    pitch          : PITCH,
    version        : '1.0',
  });
}
