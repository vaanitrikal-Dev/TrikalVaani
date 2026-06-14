/**
 * ============================================================
 * TRIKAL VAANI — Voice → Birth Details Parser API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-parse-details/route.ts
 * VERSION: 1.0 — Extract {name, dob, tob, pob} from spoken transcript
 * DATE: 2026-06-14
 *
 * PURPOSE:
 *   User speaks their birth details in Hindi/Hinglish/English.
 *   This route takes the STT transcript and returns clean
 *   structured fields to AUTO-FILL the form. User then verifies.
 *
 *   ⚠️ This does NOT replace the form. It pre-fills it.
 *   Accuracy stays intact because user confirms before submit.
 *
 * ENV REQUIRED: GEMINI_API_KEY
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 20;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

type ParseBody = {
  transcript?: string;
  sessionId?: string;
};

const SYSTEM_PROMPT = `You are a precise data extraction engine for a Vedic astrology service.
A user has SPOKEN their birth details in Hindi, Hinglish, or English.
Your ONLY job is to extract four fields from their speech and return STRICT JSON.

Return EXACTLY this JSON shape, nothing else (no markdown, no backticks, no commentary):
{"name": "", "dob": "", "tob": "", "pob": ""}

RULES:
1. name → the person's name as spoken. Keep natural capitalization. If a name is not clearly stated, leave "".
2. dob → Date of Birth in strict YYYY-MM-DD format (HTML date input format).
   - Convert ANY spoken format: "15 August 1990", "pandrah agast unnees sau nabbe", "15/8/90", "August 15 1990".
   - If year is 2-digit and ambiguous, assume 19xx for years that would make the person an adult; otherwise leave "".
   - If the date is incomplete or unclear, leave "".
3. tob → Time of Birth in strict 24-hour HH:MM format (HTML time input format).
   - Convert: "subah 5 baje" → "05:00", "saade paanch baje shaam" → "17:30", "raat ke 11 baje" → "23:00", "5:30 AM" → "05:30".
   - "saade" = :30, "sava" = :15, "paune" = :(-15 from next hour, e.g. paune 6 = 05:45).
   - Hindi day parts: subah/savere = AM, dopahar = afternoon, shaam = evening PM, raat = night PM.
   - If time is not clearly stated, leave "".
4. pob → Place of Birth. City and/or state/country as spoken. Title Case. e.g. "Delhi, India", "Lucknow, Uttar Pradesh". If unclear, leave "".

CRITICAL: If you are NOT confident about a field, leave it as "" rather than guessing.
A wrong time or date ruins the entire astrology reading. Empty is safer than wrong.
Return ONLY the JSON object.`;

export async function POST(req: NextRequest) {
  try {
    const body: ParseBody = await req.json();
    const transcript = (body.transcript || '').trim();
    const sessionId  = body.sessionId;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript required' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const userMessage = `User spoke their birth details. Extract the four fields as strict JSON.

Spoken transcript:
"${transcript}"

Return ONLY the JSON object: {"name": "", "dob": "", "tob": "", "pob": ""}`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature    : 0.1,          // low — deterministic extraction
          maxOutputTokens: 2000,
          topP           : 0.8,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[VoiceParse v1.0] Gemini error:', geminiRes.status, errText.substring(0, 200));
      return NextResponse.json({ error: 'Could not parse details' }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    let raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip any accidental markdown fences just in case
    raw = raw.replace(/```json|```/g, '').trim();

    let parsed: { name: string; dob: string; tob: string; pob: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error('[VoiceParse v1.0] JSON parse failed:', raw.substring(0, 150));
      return NextResponse.json({ error: 'Could not understand details. Please try speaking again or type manually.' }, { status: 422 });
    }

    // Sanitize / guard each field
    const clean = {
      name: typeof parsed.name === 'string' ? parsed.name.trim().slice(0, 60) : '',
      dob : /^\d{4}-\d{2}-\d{2}$/.test(parsed.dob || '') ? parsed.dob : '',
      tob : /^\d{2}:\d{2}$/.test(parsed.tob || '')        ? parsed.tob : '',
      pob : typeof parsed.pob === 'string' ? parsed.pob.trim().slice(0, 80) : '',
    };

    // Count how many fields we got — helps frontend decide messaging
    const filledCount = Object.values(clean).filter(v => v).length;

    console.log('[VoiceParse v1.0] Parsed', filledCount, '/4 fields from:', transcript.substring(0, 60));

    return NextResponse.json({
      success: true,
      fields : clean,
      filledCount,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[VoiceParse v1.0] Fatal:', message);
    return NextResponse.json({ error: 'Parsing failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status : 'Trikaal Voice Parse Details API is live',
    version: '1.0',
    purpose: 'Extract structured birth details from spoken transcript for form auto-fill',
  });
}
