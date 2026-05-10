/**
 * ============================================================
 * TRIKAL VAANI — Voice Prediction API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-predict/route.ts
 * VERSION: 1.1 — Flexible request format
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v1.1 CHANGES (May 10, 2026):
 *   - FIXED: Accepts BOTH old format (message/birthData) AND new format
 *   - FIXED: 400 errors when client sends legacy field names
 *   - SAME: 90-120 word output, no markdown, no emojis, no revenue guard
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

type FlexibleBody = {
  // New format
  transcription?: string;
  name?: string;
  dob?: string;
  tob?: string;
  pob?: string;
  // Old format (TrikalVoice.tsx legacy)
  message?: string;
  userName?: string;
  birthData?: {
    name?: string;
    dob?: string;
    tob?: string;
    pob?: string;
  };
  sessionId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: FlexibleBody = await req.json();

    // ── Accept BOTH formats ──────────────────────────────────
    const transcription = body.transcription || body.message || '';
    const name = body.name || body.userName || body.birthData?.name || '';
    const dob  = body.dob  || body.birthData?.dob  || '';
    const tob  = body.tob  || body.birthData?.tob  || '';
    const pob  = body.pob  || body.birthData?.pob  || '';
    const sessionId = body.sessionId;

    if (!transcription) {
      return NextResponse.json(
        { error: 'Question/transcription required', received: Object.keys(body) },
        { status: 400 }
      );
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    console.log('[VoicePredict v1.1] Request received:', {
      hasTranscription: !!transcription,
      hasName: !!name,
      hasDob : !!dob,
      hasTob : !!tob,
      hasPob : !!pob,
    });

    const birthInfo = [
      name && `Name: ${name}`,
      dob  && `Date of Birth: ${dob}`,
      tob  && `Time of Birth: ${tob}`,
      pob  && `Place of Birth: ${pob}`,
    ].filter(Boolean).join('\n');

    // ── Voice prediction prompt ──────────────────────────────
    const systemPrompt = `You are Trikal — an authoritative Vedic astrologer speaking directly to a seeker.
The seeker has PAID for this prediction. Give them a REAL, SPECIFIC, HELPFUL answer.

RULES (non-negotiable):
1. Respond in Hinglish (mix of Hindi and English naturally)
2. Exactly 90 to 120 words — not more, not less
3. NO markdown — no bold, no links, no bullet points
4. NO emojis — they sound terrible when spoken aloud
5. NO sales pitch — no "gehri reading ke liye" or service links
6. NO filler like "Pranaam" opening more than once
7. Speak directly, warmly, like a wise guru talking to a worried person
8. Reference their birth details if provided
9. Give ACTUAL guidance — mention a planet, dasha, or remedy if relevant
10. End with one specific actionable remedy or insight

This answer will be converted to SPEECH — write for the ear, not the eye.`;

    const userMessage = `Seeker's birth details:
${birthInfo || '(not provided)'}

Seeker's question (spoken by voice):
"${transcription}"

Give a warm, specific, 90-120 word Hinglish voice prediction. Real answer only.`;

    // ── Call Gemini ──────────────────────────────────────────
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 250,
          topP: 0.9,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[VoicePredict v1.1] Gemini error:', geminiRes.status, errText.substring(0, 200));
      return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    let prediction =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // ── Clean for TTS ────────────────────────────────────────
    prediction = prediction
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/\n{2,}/g, ' ')
      .replace(/\n/g, ' ')
      .trim();

    if (!prediction) {
      return NextResponse.json({ error: 'Empty prediction' }, { status: 500 });
    }

    console.log('[VoicePredict v1.1] Generated:', prediction.substring(0, 100));

    // ── Return BOTH field names for client compatibility ─────
    return NextResponse.json({
      success    : true,
      prediction,
      reply      : prediction,  // Legacy field name
      text       : prediction,  // Legacy field name
      wordCount  : prediction.split(/\s+/).length,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[VoicePredict v1.1] Fatal:', message);
    return NextResponse.json({ error: 'Prediction failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status : 'Trikal Voice Predict API is live',
    version: '1.1',
    accepts: ['transcription | message', 'name | userName | birthData.name', 'dob/tob/pob (flat or nested)'],
  });
}
