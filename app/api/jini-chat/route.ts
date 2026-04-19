/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 16.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: SINGLE UNIFIED JINI API — REAL SWISS EPHEMERIS + GEMINI
 * THIS REPLACES ALL PREVIOUS ROUTE FILES (14.x, 15.x)
 * JINI MESSAGE: SHORT, CRISP, SUSPENSEFUL — MAX 70 WORDS
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildKundali, type BirthData } from '../../../lib/swiss-ephemeris';
import { buildJiniSystemPrompt, detectLanguage, JINI_NAMASTE } from '../../../lib/jini-engine';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      message: string;
      birthData?: BirthData;
      category?: string;
      isFirstMessage?: boolean;
    };

    const {
      message,
      birthData,
      category = 'JOB',
      isFirstMessage = false,
    } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'API Key missing.' });
    }

    // ── FIRST MESSAGE: Return Jini signature opening ──────────────────────
    if (isFirstMessage) {
      return NextResponse.json({ reply: JINI_NAMASTE, kundaliSummary: null });
    }

    // ── BUILD REAL KUNDALI from Swiss Ephemeris ───────────────────────────
    let kundali = null;
    let kundaliSummary = null;

    if (birthData?.dob && birthData?.tob && birthData?.lat) {
      try {
        kundali = buildKundali(birthData);
        kundaliSummary = {
          lagna:         kundali.lagna,
          lagnaLord:     kundali.lagnaLord,
          nakshatra:     kundali.nakshatra,
          nakshatraLord: kundali.nakshatraLord,
          mahadasha:     kundali.currentMahadasha.lord,
          antardasha:    kundali.currentAntardasha.lord,
          dashaBalance:  kundali.dashaBalance,
          choghadiya:    kundali.panchang.choghadiya,
          rahuKaal:      kundali.panchang.rahuKaal,
          abhijeet:      kundali.panchang.abhijeetMuhurta,
          tithi:         kundali.panchang.tithi,
          vara:          kundali.panchang.vara,
          yoga:          kundali.panchang.yoga,
          planets: Object.values(kundali.planets).map(p => ({
            name:        p.name,
            rashi:       p.rashi,
            house:       p.house,
            strength:    p.strength,
            isRetrograde: p.isRetrograde,
            nakshatra:   p.nakshatra,
            degree:      p.degree,
          })),
        };
      } catch (calcErr) {
        console.error('[Trikal Engine] Kundali error:', calcErr);
      }
    }

    // ── DETECT LANGUAGE + BUILD SYSTEM PROMPT ────────────────────────────
    const lang         = detectLanguage(message);
    const systemPrompt = buildJiniSystemPrompt(kundali, category, lang, birthData?.name);

    // ── CALL GEMINI ───────────────────────────────────────────────────────
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          temperature:     0.85,
          maxOutputTokens: 300,   // SHORT responses — forces crisp answers
          topP:            0.9,
        },
      }),
    });

    if (!res.ok) {
      console.error(`[Trikal] Gemini HTTP ${res.status}`);
      return NextResponse.json({
        reply: 'Cosmic signals weak hain. Ek minute mein dobara try karein. 🙏',
        kundaliSummary,
      });
    }

    const data = await res.json();
    if (data.error) {
      console.error('[Trikal] Gemini error:', data.error);
      return NextResponse.json({
        reply: 'Jini abhi meditate kar rahi hai. 🙏',
        kundaliSummary,
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      ?? 'Dobara puchiye. 🙏';

    return NextResponse.json({ reply, kundaliSummary });

  } catch (err: unknown) {
    console.error('[Trikal] Error:', err);
    return NextResponse.json({
      reply: 'Kuch cosmic disturbance aa gayi. 🙏',
    });
  }
}