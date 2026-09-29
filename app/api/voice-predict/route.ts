/**
 * ============================================================
 * TRIKAL VAANI — Voice Prediction API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-predict/route.ts
 * VERSION: 1.5.1 (29 Sep 2026) — AI fallback (ai-fallback v1.1: Claude 10s reserve) (CEO approved: "pehle sab pe laga do")
 *   v1.5: Pehle EK Gemini call — 503 par "Prediction failed". Ab
 *   lib/ai-fallback.ts: gemini-3.7-flash → gemini-3.8-flash (bheed par ek
 *   retry) → Claude Sonnet 5, sab 30s limit ke andar. Prompt, 6000 tokens,
 *   TTS cleanup — sab v1.4 jaisa.
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v1.2 CHANGES (May 10, 2026):
 *   - MIGRATED 3 Sep 2026: gemini-2.5-flash -> gemini-3.7-flash.
 *     2.5-flash and 2.5-pro SHUT DOWN ON 16 OCTOBER 2026.
 *     maxOutputTokens stays 6000: already generous, and 3.x needs the room
 *     because its reasoning is charged to the same budget as the text.
 *   - FIXED: maxOutputTokens 250 → 800
 *   - REASON: Hindi script = 2-4 tokens/word, 250 only gave 40-60 words
 *   - RESULT: Full 90-120 word Hinglish prediction = ~45-60 sec audio
 *   - SAME: Flexible request format, no revenue guard, no markdown/emojis
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai-fallback';

export const runtime = 'nodejs';
export const maxDuration = 30;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent';

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
    const systemPrompt = `You are Trikaal — an authoritative Vedic astrologer speaking directly to a seeker.
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
    // v1.5: 3.7 → 3.8 → Claude Sonnet 5, 30s maxDuration ke andar
    let prediction = '';
    try {
      const ai = await generateWithFallback({
        tag: 'voice-predict',
        prompt: userMessage,
        systemInstruction: systemPrompt,
        models: ['gemini-3.7-flash', 'gemini-3.8-flash'],
        maxOutputTokens: 6000,  // CEO ORDER: 6000 tokens for rich complete Devanagari predictions
        temperature: 0.85,
        topP: 0.9,
        perCallTimeoutMs: 10_000,
        deadlineMs: Date.now() + 27_000,
        claudeMaxTokens: 1500,
        claudeMinMs: 8_000,
        claudeReserveMs: 10_000,
        minChars: 40,
      });
      prediction = ai.text;
    } catch (e) {
      console.error('[VoicePredict v1.5] All AI failed:', e instanceof Error ? e.message.slice(0, 300) : e);
      return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
    }

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
    status  : 'Trikaal Voice Predict API is live',
    version : '1.2',
    fix     : 'maxOutputTokens 6000 — CEO approved for maximum quality',
  });
}
