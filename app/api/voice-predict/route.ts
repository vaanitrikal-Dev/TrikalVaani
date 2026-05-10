/**
 * ============================================================
 * TRIKAL VAANI — Voice Prediction API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-predict/route.ts
 * VERSION: 1.2 — Fixed token limit for Hindi/Hinglish
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v1.2 CHANGES (May 10, 2026):
 *   - FIXED: maxOutputTokens 250 → 800
 *   - REASON: Hindi script = 2-4 tokens/word, 250 only gave 40-60 words
 *   - RESULT: Full 90-120 word Hinglish prediction = ~45-60 sec audio
 *   - SAME: Flexible request format, no revenue guard, no markdown/emojis
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

type FlexibleBody = {
  transcription?: string;
  name?: string;
  dob?: string;
  tob?: string;
  pob?: string;
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

    console.log('[VoicePredict v1.2] Request:', {
      hasTranscription: !!transcription,
      transcriptionLength: transcription.length,
      hasName: !!name,
      hasDob : !!dob,
    });

    const birthInfo = [
      name && `Name: ${name}`,
      dob  && `Date of Birth: ${dob}`,
      tob  && `Time of Birth: ${tob}`,
      pob  && `Place of Birth: ${pob}`,
    ].filter(Boolean).join('\n');

    // ── Voice prediction system prompt ──────────────────────
    const systemPrompt = `You are Trikal — an authoritative Vedic astrologer speaking directly to a seeker.
The seeker has PAID for this voice prediction. Give them a REAL, COMPLETE, HELPFUL answer.

CRITICAL RULES:
1. Respond in Hinglish (natural mix of Hindi and English)
2. Write EXACTLY 100 to 120 words — count carefully. Not 40 words. Not 60 words. MINIMUM 100.
3. NO markdown — no bold, no links, no bullet points, no asterisks
4. NO emojis — they sound terrible when spoken aloud
5. NO sales pitch — no service links, no "gehri reading ke liye"
6. Speak warmly, like a wise compassionate guru to a worried parent
7. Reference their birth details if provided
8. Give ACTUAL specific Vedic guidance — mention relevant planet, dasha, or house
9. Give ONE clear actionable remedy at the end
10. This will be spoken as audio — write naturally for the ear

REMEMBER: 100-120 words is mandatory. Count every word.`;

    const userMessage = `Seeker's birth details:
${birthInfo || '(not provided)'}

Seeker's voice question:
"${transcription}"

Write a warm, specific 100-120 word Hinglish voice prediction. Count your words — minimum 100.`;

    // ── Call Gemini 2.5 Flash ────────────────────────────────
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature    : 0.85,
          maxOutputTokens: 800,   // FIX: 250 was too low for Hindi (2-4 tokens/word)
          topP           : 0.9,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[VoicePredict v1.2] Gemini error:', geminiRes.status, errText.substring(0, 200));
      return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    let prediction = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // ── Strip all markdown/links/emojis for clean TTS ────────
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

    const wordCount = prediction.split(/\s+/).length;
    console.log('[VoicePredict v1.2] Generated:', wordCount, 'words —', prediction.substring(0, 80));

    return NextResponse.json({
      success   : true,
      prediction,
      reply     : prediction,
      text      : prediction,
      wordCount,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[VoicePredict v1.2] Fatal:', message);
    return NextResponse.json({ error: 'Prediction failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status  : 'Trikal Voice Predict API is live',
    version : '1.2',
    fix     : 'maxOutputTokens 800 for full Hindi/Hinglish predictions',
  });
}
