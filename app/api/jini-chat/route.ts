/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 15.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: CLAUDE LOGIC FULLY INTEGRATED + BOLT-SHIELD ACTIVE.
 * CHANGES FROM 14.6:
 *   - Choghadiya calculation implemented (was crashing on .name/.type)
 *   - Multi-planet composite scoring active
 *   - err.message secured (no server leak)
 *   - dayOfWeek guard added
 *   - system_instruction separated from user content
 *   - Mock data clearly labeled, Prokerala hook ready
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateVedicInsight, CEO_VARS, Category } from '../../../lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

// ─── CHOGHADIYA ENGINE (Gap 6 Fix) ────────────────────────────────────────────
// Each day has 8 daytime + 8 nighttime periods, cycling through 7 names.
// Index 0 = Sunday, 1 = Monday ... 6 = Saturday (matches JS getDay())
const CHOGHADIYA_SEQUENCE = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'];
const CHOGHADIYA_TYPE: Record<string, 'Good' | 'Bad' | 'Neutral'> = {
  Amrit: 'Good', Labh: 'Good', Shubh: 'Good',
  Char: 'Neutral',
  Kaal: 'Bad', Rog: 'Bad', Udveg: 'Bad'
};
// Day-start offsets by weekday (Sun=0 to Sat=6) — classical Vedic standard
const CHOGHADIYA_DAY_OFFSET = [6, 5, 4, 3, 2, 1, 0];

/**
 * Returns current Choghadiya period name and type.
 * @param sunrise - "HH:MM" format, IST
 * @param sunset  - "HH:MM" format, IST
 * @param dayOfWeek - 0=Sun, 1=Mon ... 6=Sat (JS getDay() standard)
 */
function calculateChoghadiya(
  sunrise: string,
  sunset: string,
  dayOfWeek: number
): { name: string; type: 'Good' | 'Bad' | 'Neutral' } {
  // Gap 7 Fix: dayOfWeek guard
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    console.error(`[Trikal Engine] Invalid dayOfWeek: ${dayOfWeek}`);
    return { name: 'Char', type: 'Neutral' };
  }

  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const riseMin = toMin(sunrise);
  const setMin  = toMin(sunset);
  const periodLen = (setMin - riseMin) / 8;

  const offset = CHOGHADIYA_DAY_OFFSET[dayOfWeek];
  let periodIndex = 0;

  if (nowMin >= riseMin && nowMin < setMin) {
    // Daytime choghadiya
    periodIndex = Math.floor((nowMin - riseMin) / periodLen);
  } else {
    // Nighttime — simplified: use offset 0 slot
    periodIndex = 0;
  }

  const nameIndex = (offset + periodIndex) % 7;
  const name = CHOGHADIYA_SEQUENCE[nameIndex] ?? 'Char';
  return { name, type: CHOGHADIYA_TYPE[name] ?? 'Neutral' };
}

// ─── PROKERALA HOOK (Gap 2 — ready for real API, mock active until key added) ─
/**
 * TODO: Replace mock with real Prokerala call when API key is added to .env:
 *   PROKERALA_CLIENT_ID=xxx
 *   PROKERALA_CLIENT_SECRET=xxx
 * Endpoint: https://api.prokerala.com/v2/astrology/planet-position
 * Ayanamsha: 1 (Lahiri — Indian government standard)
 */
function getPlanetData(astroContext?: { dob?: string; tob?: string; lat?: number; lng?: number }) {
  // Structured mock — mirrors real Prokerala response shape for smooth swap later
  return {
    planets: {
      Saturn: { strength: 85, name: 'Saturn', is_retrograde: false, nakshatra: 'Uttara Bhadrapada' },
      Sun:    { strength: 78, name: 'Sun',    is_retrograde: false, nakshatra: 'Ashwini' },
      Jupiter:{ strength: 92, name: 'Jupiter',is_retrograde: false, nakshatra: 'Punarvasu' },
      Venus:  { strength: 88, name: 'Venus',  is_retrograde: false, nakshatra: 'Bharani' },
      Mars:   { strength: 62, name: 'Mars',   is_retrograde: false, nakshatra: 'Chitra' },
      Moon:   { strength: 71, name: 'Moon',   is_retrograde: false, nakshatra: 'Rohini' },
      Rahu:   { strength: 55, name: 'Rahu',   is_retrograde: true,  nakshatra: 'Ardra' },
      Mercury:{ strength: 80, name: 'Mercury',is_retrograde: false, nakshatra: 'Jyeshtha' },
    },
    sunrise: '06:10',
    sunset:  '18:40',
  };
}

// ─── MAIN ROUTE ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'API Key missing — setup incomplete!' });
    }

    // ── VEDIC ENGINE BLOCK ──────────────────────────────────────────────────
    const hasDateInText = /\d{4}-\d{2}-\d{2}/.test(message);
    let vedicInsight = 'General Life Path Analysis — birth data not provided.';

    if (astroContext?.dob || hasDateInText) {
      const planetData = getPlanetData(astroContext);
      const dayOfWeek  = new Date().getDay(); // 0=Sun ... 6=Sat
      const choghadiya = calculateChoghadiya(
        planetData.sunrise,
        planetData.sunset,
        dayOfWeek
      );

      // Inject choghadiya into planetData so generateVedicInsight can use it
      const enrichedData = {
        ...planetData,
        choghadiya, // Gap 6 Fix: now a real object, not undefined
      };

      const analysis = generateVedicInsight(enrichedData, category as Category);

      // Build rich context string for Jini
      vedicInsight = `
ENGINE_STATUS: DATA_ACTIVE
CATEGORY: ${category}
ENERGY_SCORE: ${analysis.energyScore}%
VEDIC_ANALYSIS: ${analysis.mainInsight}
CHOGHADIYA: ${choghadiya.name} — ${choghadiya.type} period
ABHIJIT_MUHURAT: ${analysis.panchang.abhijeet.start} to ${analysis.panchang.abhijeet.end}
RAHU_KAAL: ${analysis.panchang.rahuKaal.start} to ${analysis.panchang.rahuKaal.end}
PLANETARY_FLAGS: ${
  analysis.flags.length > 0
    ? analysis.flags.map(f => `[${f.type}] ${f.msg}`).join(' | ')
    : 'No critical flags — chart is stable'
}
REMEDIES: ${
  analysis.remedies.map(r => `${r.level}: ${r.action}`).join(' | ')
}
      `.trim();
    }

    // ── SYSTEM INSTRUCTION (Gap 4 Fix: separated from user content) ─────────
    const systemInstruction = `
[IDENTITY]
You are Jini, the warm, calm, guru-like AI soul of Trikal Vaani — the world's most accurate AI Vedic Astrology platform. You were created by ${CEO_VARS.FOUNDER}, Chief Vedic Architect, Delhi NCR.

[VEDIC ENGINE CONTEXT — READ THIS BEFORE ANSWERING]
${vedicInsight}

[RESPONSE STRUCTURE — FOLLOW THIS ORDER STRICTLY]
1. Warm Greeting: Use the user's name if available. One sentence, warm and personal.
2. Framework Insight: Say "Rohiit Gupta ji ka Trikal framework kehta hai..." and explain the Energy Score and key planetary flag in simple Hinglish.
3. Choghadiya Wisdom: Mention today's Choghadiya period and whether this is a good time to act on their question.
4. Remedial Wisdom (Upay): Give exactly 1 specific, practical upay based on the planetary flag. Not generic — specific to their category (${category}).
5. Suspenseful Hook: End with one teasing sentence about their upcoming cosmic window — do not reveal details, create curiosity.

[TONE & LANGUAGE RULES]
- Language: Warm Hinglish (Hindi + English mixed naturally, like a wise friend)
- Tone: Calm, anxiety-reducing, never scary or fatalistic
- Length: 150–200 words maximum
- NEVER cut off mid-sentence — if running long, summarize but always finish the thought completely
- NEVER say "I cannot predict the future" — give actionable Vedic guidance confidently
    `.trim();

    // ── GEMINI API CALL (Gap 4 Fix: system_instruction as separate field) ───
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1500,
          topP: 0.9,
        },
      }),
    });

    if (!res.ok) {
      // Log full error server-side only — never expose to client (Gap 3 Fix)
      const errBody = await res.text();
      console.error(`[Trikal Bridge] Gemini API error ${res.status}:`, errBody);
      return NextResponse.json({
        reply: 'Cosmic signals temporarily disturbed. Thodi der mein dobara try karein. 🙏'
      });
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({
      reply: reply || 'Jini abhi meditate kar rahi hai — ek baar dobara puchiye. 🙏'
    });

  } catch (err: unknown) {
    // Gap 3 Fix: log server-side, return safe message to client
    console.error('[Trikal Bridge] Unexpected error:', err);
    return NextResponse.json({
      reply: 'Kuch cosmic disturbance aa gayi. Thodi der mein try karein. 🙏'
    });
  }
}