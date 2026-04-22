/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 18.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: MAIN JINI API — ALL MODES
 *
 * v18.0 CHANGES:
 *   - deep_prediction: 4096 tokens — full structured reading never cuts off
 *   - master_prediction: 8192 tokens — CEO private dashboard, no limit
 *   - Hindi planet names: explicit Devanagari mapping injected into every prompt
 *   - Jini revenue guard: chat mode now returns service page links instead of free answers
 *   - four_week: new mode — generates 4-week prediction + upay + date alerts
 *
 * MODES:
 *   chat             → Jini chat, 280 tokens, revenue guard ON
 *   prediction       → instant hook deepener, 300 tokens
 *   deep_prediction  → full ₹51 reading, 4096 tokens
 *   four_week        → 4-week prediction, 4096 tokens
 *   master           → CEO private dashboard only, 8192 tokens, no limit
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildKundali, type BirthData } from '../../../lib/swiss-ephemeris';
import { buildJiniSystemPrompt, detectLanguage, JINI_NAMASTE } from '../../../lib/jini-engine';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL     =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

// ─── HINDI PLANET NAME MAP ────────────────────────────────────────────────────
// STRONG version — placed at TOP of every Hindi prompt
// Gemini 3 Flash follows instructions better when they are first and explicit
const HINDI_PLANET_INSTRUCTION = `
⚠️ MOST IMPORTANT RULE — READ THIS FIRST:
You MUST write this entire response in pure Hindi (देवनागरी लिपि).

MANDATORY planet name replacements — use ONLY these, NEVER English:
Sun = सूर्य | Moon = चंद्र | Mars = मंगल | Mercury = बुध
Jupiter = गुरु | Venus = शुक्र | Saturn = शनि | Rahu = राहु | Ketu = केतु

MANDATORY rashi name replacements:
Aries/Mesh = मेष | Taurus/Vrishabh = वृषभ | Gemini/Mithun = मिथुन
Cancer/Kark = कर्क | Leo/Simha = सिंह | Virgo/Kanya = कन्या
Libra/Tula = तुला | Scorpio/Vrischik = वृश्चिक | Sagittarius/Dhanu = धनु
Capricorn/Makar = मकर | Aquarius/Kumbh = कुंभ | Pisces/Meen = मीन

MANDATORY term replacements:
Mahadasha = महादशा | Antardasha = अंतर्दशा | Lagna = लग्न
Nakshatra = नक्षत्र | Gochar = गोचर | Dasha = दशा
house = भाव | transit = गोचर | exalted = उच्च | retrograde = वक्री

Write ALL words in Hindi. No English planet names. No English astrology terms.
This is non-negotiable — failure to use Hindi names makes the response invalid.
`;

// Hinglish planet names — for hinglish mode
const HINGLISH_PLANET_INSTRUCTION = `
Use these planet names consistently in Hinglish:
Surya (Sun) · Chandra (Moon) · Mangal (Mars) · Budh (Mercury)
Guru/Brihaspati (Jupiter) · Shukra (Venus) · Shani (Saturn)
Rahu · Ketu

Rashi names: Mesh · Vrishabh · Mithun · Kark · Simha · Kanya
             Tula · Vrischik · Dhanu · Makar · Kumbh · Meen

Write in natural Hinglish — Hindi words with English mixed naturally.
`;

// ─── SERVICE PAGE MAP — Jini revenue guard ────────────────────────────────────
// When user asks these topics, Jini links to service page instead of free answer
const SERVICE_PAGES: Record<string, { url: string; label: string }> = {
  ex_back:            { url: '/services/ex-back-reading',        label: 'Ex-Back & Karmic Closure Reading' },
  marriage:           { url: '/services/marriage-timing',        label: 'Marriage Timing Reading' },
  career:             { url: '/services/career-pivot',           label: 'Dream Career Pivot Reading' },
  job:                { url: '/services/career-pivot',           label: 'Career & Job Reading' },
  business:           { url: '/services/wealth-reading',         label: 'Business & Wealth Reading' },
  property:           { url: '/services/property-yog',           label: 'Property Purchase Timing' },
  child:              { url: '/services/child-destiny',          label: "Child's Destiny Reading" },
  health:             { url: '/services/health-reading',         label: 'Health & Vitality Reading' },
  boss:               { url: '/services/toxic-boss-radar',       label: 'Toxic Boss Radar Reading' },
  compatibility:      { url: '/services/compatibility',          label: 'Compatibility Reading' },
  wealth:             { url: '/services/wealth-reading',         label: 'Wealth & Investment Reading' },
  foreign:            { url: '/services/foreign-settlement',     label: 'Foreign Settlement Reading' },
  spiritual:          { url: '/services/spiritual-purpose',      label: 'Spiritual Purpose Reading' },
  retirement:         { url: '/services/retirement-peace',       label: 'Retirement Peace Reading' },
};

function detectServiceIntent(message: string): { url: string; label: string } | null {
  const lower = message.toLowerCase();
  if (lower.includes('ex') || lower.includes('वापस') || lower.includes('closure')) return SERVICE_PAGES['ex_back']!;
  if (lower.includes('marr') || lower.includes('shaadi') || lower.includes('शादी')) return SERVICE_PAGES['marriage']!;
  if (lower.includes('job') || lower.includes('career') || lower.includes('नौकरी')) return SERVICE_PAGES['job']!;
  if (lower.includes('business') || lower.includes('व्यापार')) return SERVICE_PAGES['business']!;
  if (lower.includes('property') || lower.includes('house') || lower.includes('मकान')) return SERVICE_PAGES['property']!;
  if (lower.includes('child') || lower.includes('beta') || lower.includes('बेटा') || lower.includes('बच्चा')) return SERVICE_PAGES['child']!;
  if (lower.includes('health') || lower.includes('bimari') || lower.includes('बीमारी')) return SERVICE_PAGES['health']!;
  if (lower.includes('boss') || lower.includes('office') || lower.includes('toxic')) return SERVICE_PAGES['boss']!;
  if (lower.includes('compat') || lower.includes('match') || lower.includes('partner')) return SERVICE_PAGES['compatibility']!;
  if (lower.includes('wealth') || lower.includes('money') || lower.includes('पैसा')) return SERVICE_PAGES['wealth']!;
  if (lower.includes('foreign') || lower.includes('abroad') || lower.includes('विदेश')) return SERVICE_PAGES['foreign']!;
  if (lower.includes('spiritual') || lower.includes('moksha') || lower.includes('मोक्ष')) return SERVICE_PAGES['spiritual']!;
  return null;
}

// ─── GEMINI CALL HELPER ───────────────────────────────────────────────────────
async function callGemini(
  prompt: string,
  systemPrompt: string | null,
  maxTokens: number,
  temperature = 0.82
): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature, maxOutputTokens: maxTokens, topP: 0.92 },
  };
  if (systemPrompt) {
    body.system_instruction = { parts: [{ text: systemPrompt }] };
  }
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`Gemini error: ${JSON.stringify(data.error)}`);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      message:         string;
      mode?:           'chat' | 'prediction' | 'deep_prediction' | 'four_week' | 'master';
      lang?:           'hindi' | 'hinglish' | 'english';
      birthData?:      BirthData;
      chartData?:      Record<string, unknown>;
      category?:       string;
      isFirstMessage?: boolean;
      // Four week specific
      segment?:        string;
      segmentLabel?:   string;
      // Master mode specific (CEO only)
      clientPhone?:    string;
      clientName?:     string;
    };

    const {
      message,
      mode           = 'chat',
      lang           = 'hinglish',
      birthData,
      category       = 'JOB',
      isFirstMessage = false,
      segment        = 'default',
      segmentLabel   = '',
      clientPhone    = '',
      clientName     = '',
    } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'API Key missing.' });
    }

    // Language instruction injection
    const langInstruction =
      lang === 'hindi'   ? HINDI_PLANET_INSTRUCTION :
      lang === 'english' ? 'Respond in clear, warm English only.' :
                           HINGLISH_PLANET_INSTRUCTION;

    // ── FIRST MESSAGE ──────────────────────────────────────────────────────
    if (isFirstMessage) {
      return NextResponse.json({ reply: JINI_NAMASTE, kundaliSummary: null });
    }

    // ── DEEP PREDICTION MODE — ₹51 reading ────────────────────────────────
    // ✅ Hindi instruction FIRST — Gemini follows first instructions most reliably
    if (mode === 'deep_prediction') {
      const fullPrompt = lang === 'hindi'
        ? `${langInstruction}\n\nAB NEECHE DIYE FORMAT MEIN SIRF SHUDDH HINDI MEIN LIKHO. KOI BHI ANGREZI SHABD MAT LIKHO:\n\n${message}`
        : `${langInstruction}\n\n${message}`;
      try {
        const reply = await callGemini(fullPrompt, null, 4096, 0.80);
        if (reply.length > 50) return NextResponse.json({ reply });
        return NextResponse.json({ reply: '', error: 'Empty response' });
      } catch (e) {
        console.error('[Trikal] deep_prediction error:', e);
        return NextResponse.json({ reply: '', error: String(e) });
      }
    }

    // ── FOUR WEEK MODE — 4-week prediction ────────────────────────────────
    if (mode === 'four_week') {
      const fullPrompt = lang === 'hindi'
        ? `${langInstruction}\n\nSampurn jawab sirf Hindi mein do — koi bhi planet ka naam Angrezi mein mat likho:\n\n${message}`
        : `${langInstruction}\n\n${message}`;
      try {
        const reply = await callGemini(fullPrompt, null, 4096, 0.82);
        return NextResponse.json({ reply });
      } catch (e) {
        console.error('[Trikal] four_week error:', e);
        return NextResponse.json({ reply: '', error: String(e) });
      }
    }

    // ── MASTER MODE — CEO private dashboard — NO TOKEN LIMIT ──────────────
    if (mode === 'master') {
      const masterSystem = `You are the Master Intelligence Engine of Trikal Vaani.
You are providing a PRIVATE briefing to Rohiit Gupta (CEO & Chief Vedic Architect) 
before a ₹499 premium consultation call.

This is NOT shown to the client. This is Rohiit Gupta's private preparation tool.
Be extremely detailed, specific, and actionable. No word limits. Full analysis.
Cross-reference everything — natal chart, current transits, numerology, sector trends.

${langInstruction}`;

      try {
        const reply = await callGemini(message, masterSystem, 8192, 0.75);
        return NextResponse.json({ reply });
      } catch (e) {
        console.error('[Trikal] master error:', e);
        return NextResponse.json({ reply: '', error: String(e) });
      }
    }

    // ── PREDICTION MODE — instant deepener ────────────────────────────────
    if (mode === 'prediction') {
      const fullPrompt = `${langInstruction}\n\n${message}`;
      try {
        const reply = await callGemini(fullPrompt, null, 300, 0.85);
        return NextResponse.json({ reply });
      } catch (e) {
        console.error('[Trikal] prediction error:', e);
        return NextResponse.json({ reply: '' });
      }
    }

    // ── CHAT MODE — Jini with revenue guard ───────────────────────────────
    let kundali       = null;
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
            name: p.name, rashi: p.rashi, house: p.house,
            strength: p.strength, isRetrograde: p.isRetrograde,
            nakshatra: p.nakshatra, degree: p.degree,
          })),
        };
      } catch (calcErr) {
        console.error('[Trikal] Kundali error:', calcErr);
      }
    }

    // Revenue guard — detect if user is asking a specific life question
    const serviceIntent = detectServiceIntent(message);

    const detectedLang = detectLanguage(message);

    // Build Jini system prompt with revenue guard instruction
    const revenueGuardInstruction = `
REVENUE GUARD — CRITICAL RULE:
When the user asks a specific life question (career, marriage, ex-back, health, property, child, boss etc.):
1. Give ONE teaser sentence that hints at what their chart shows
2. Then say "Is baare mein gehri jaankari ke liye, main aapko hamari specialized reading page par le jaati hoon"
3. End with: [SERVICE_LINK]
DO NOT give free full answers to specific life questions.
For general chart questions, greetings, or panchang questions — answer freely.
`;

    const systemPrompt = buildJiniSystemPrompt(kundali, category, detectedLang, birthData?.name)
      + '\n\n' + revenueGuardInstruction
      + '\n\n' + langInstruction;

    let reply = '';
    try {
      reply = await callGemini(message, systemPrompt, 280, 0.85);
    } catch (e) {
      console.error('[Trikal] chat error:', e);
      return NextResponse.json({
        reply: 'Cosmic signals weak hain. Ek minute mein dobara try karein. 🙏',
        kundaliSummary,
      });
    }

    // Inject actual service page link if Jini used [SERVICE_LINK] placeholder
    if (serviceIntent && reply.includes('[SERVICE_LINK]')) {
      reply = reply.replace(
        '[SERVICE_LINK]',
        `\n\n🔮 [${serviceIntent.label}](${serviceIntent.url}) — Abhi dekho`
      );
    } else if (serviceIntent && !reply.includes('http')) {
      // Jini answered freely — append service link softly
      reply += `\n\n🔮 Gehri reading ke liye: [${serviceIntent.label}](${serviceIntent.url})`;
    }

    return NextResponse.json({ reply, kundaliSummary });

  } catch (err: unknown) {
    console.error('[Trikal] Error:', err);
    return NextResponse.json({ reply: 'Kuch cosmic disturbance aa gayi. 🙏' });
  }
}