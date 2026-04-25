/**
 * ============================================================
 * TRIKAL VAANI — JINI CHAT API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/jini-chat/route.ts
 * VERSION: 20.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v20.0 CHANGES (over v19.0):
 *   - CRITICAL FIX: Switched from buildKundali() [Meeus ±2-3° approx]
 *     to buildKundaliFromProkerala() [real Swiss Ephemeris via API]
 *   - buildKundaliFromProkerala is async — properly awaited
 *   - buildPublicIntelligence() now 100% dynamic — NO hardcoded dates,
 *     months, years, or market data. All context is date-stamped
 *     and Gemini is instructed to use web search for live data.
 *   - Dynamic month/year injected into every Gemini prompt automatically
 *   - Sector intel prompts Gemini to fetch fresh data, not use stale training
 *   - All other v19.0 logic preserved: modes, revenue guard, Hindi/Hinglish,
 *     master mode, four_week, deep_prediction, service page links
 *
 * MODES:
 *   chat             → Jini chat, 280 tokens, revenue guard ON
 *   prediction       → instant hook deepener, 300 tokens
 *   deep_prediction  → full ₹51 reading, 4096 tokens
 *   four_week        → 4-week prediction, 4096 tokens
 *   master           → CEO private dashboard only, 8192 tokens
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildKundaliFromProkerala } from '../../../lib/prokerala';
import type { BirthData } from '../../../lib/swiss-ephemeris';
import { buildJiniSystemPrompt, detectLanguage, JINI_NAMASTE } from '../../../lib/jini-engine';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL     =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ─── DYNAMIC DATE CONTEXT ─────────────────────────────────────────────────────
// Never hardcode dates — always compute at runtime
function getDynamicDateContext(): {
  monthYear: string;       // e.g. "May 2026"
  month: string;           // e.g. "May"
  year: number;            // e.g. 2026
  quarter: string;         // e.g. "Q2 2026"
  isoDate: string;         // e.g. "2026-05-15"
  financialYear: string;   // e.g. "FY 2026-27"
  season: string;          // e.g. "Summer" (India context)
} {
  const now     = new Date();
  const year    = now.getFullYear();
  const month   = now.getMonth(); // 0-indexed
  const day     = now.getDate();

  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const monthName  = MONTH_NAMES[month]!;
  const quarter    = `Q${Math.floor(month / 3) + 1} ${year}`;

  // India financial year: Apr–Mar
  const fyStart    = month >= 3 ? year : year - 1;
  const financialYear = `FY ${fyStart}-${String(fyStart + 1).slice(-2)}`;

  // India seasons
  const INDIA_SEASONS: Record<number, string> = {
    0: 'Winter', 1: 'Winter', 2: 'Spring',
    3: 'Summer', 4: 'Summer', 5: 'Summer',
    6: 'Monsoon', 7: 'Monsoon', 8: 'Monsoon',
    9: 'Post-Monsoon', 10: 'Post-Monsoon', 11: 'Winter',
  };

  return {
    monthYear:     `${monthName} ${year}`,
    month:         monthName,
    year,
    quarter,
    isoDate:       `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
    financialYear,
    season:        INDIA_SEASONS[month] ?? 'Unknown',
  };
}

// ─── HINDI PLANET INSTRUCTION ─────────────────────────────────────────────────
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
This is non-negotiable.
`;

// ─── HINGLISH PLANET INSTRUCTION ─────────────────────────────────────────────
const HINGLISH_PLANET_INSTRUCTION = `
Use these planet names consistently in Hinglish:
Surya (Sun) · Chandra (Moon) · Mangal (Mars) · Budh (Mercury)
Guru/Brihaspati (Jupiter) · Shukra (Venus) · Shani (Saturn)
Rahu · Ketu

Rashi names: Mesh · Vrishabh · Mithun · Kark · Simha · Kanya
             Tula · Vrischik · Dhanu · Makar · Kumbh · Meen

Write in natural Hinglish — Hindi words with English mixed naturally.
`;

// ─── DYNAMIC PUBLIC INTELLIGENCE ─────────────────────────────────────────────
/**
 * NO HARDCODED DATES OR MARKET DATA.
 * This function builds a prompt that instructs Gemini to:
 * 1. Know the current date context (computed dynamically at runtime)
 * 2. Use its knowledge + web grounding for current sector data
 * 3. Connect planetary predictions with real present-day situations
 *
 * Gemini is explicitly told to NOT use stale training data for
 * market prices, policy rates, or employment trends.
 */
function buildPublicIntelligence(employment: string, sector: string): string {
  const { monthYear, quarter, financialYear, season, isoDate } = getDynamicDateContext();

  // Sector-specific search guidance — Gemini fetches fresh data
  const SECTOR_SEARCH_GUIDE: Record<string, string> = {
    it: `IT & Technology sector in India. Key areas to reference:
- Current hiring/layoff trends in Indian IT companies
- AI/ML job market demand right now
- Salary hike season status (usually Q1/Q4)
- Startup funding environment this quarter
- WFH/hybrid work policy trends`,

    finance: `Finance, Banking & Investment sector in India. Key areas:
- Current RBI repo rate and recent monetary policy decision
- Stock market (Nifty 50, Sensex) current trend and level
- Mutual fund SIP inflow trend
- Banking sector performance this quarter
- SEBI regulatory updates affecting retail investors`,

    realestate: `Real Estate sector in India. Key areas:
- Current home loan interest rates (SBI, HDFC, ICICI)
- Property price trend in major cities especially Delhi NCR
- RERA and regulatory environment
- Demand in affordable vs luxury segment right now
- Commercial real estate vacancy trends`,

    healthcare: `Healthcare sector in India. Key areas:
- Health insurance premium trends
- Government health scheme updates (Ayushman Bharat)
- Hospital and medical job market
- AYUSH and wellness sector growth
- Key healthcare policy changes this year`,

    govt: `Government & PSU sector in India. Key areas:
- Recent UPSC/SSC/state PSC notifications and vacancy count
- Pay commission or DA revision updates
- PSU disinvestment status
- Transfer/posting season activity
- Government recruitment calendar`,

    trading: `Stock Market & Trading in India. Key areas:
- Current Nifty 50 and Bank Nifty levels and trend
- FII/DII net buying or selling this week
- Options market IV and premium environment
- Commodity prices — Gold, Silver, Crude
- Any major market events expected this month`,

    education: `Education sector in India. Key areas:
- Placement season results at top colleges
- EdTech industry current state
- Key entrance exam results or upcoming exams
- Study abroad demand and costs
- NEP implementation updates`,

    media: `Media & Creative industry in India. Key areas:
- OTT platform landscape changes
- Creator economy and YouTube/Instagram trends
- AI tools impact on creative jobs
- Advertising spend trends
- Digital news and journalism landscape`,
  };

  const EMPLOYMENT_CONTEXT: Record<string, string> = {
    salaried:  'Working as a salaried professional',
    self:      'Self-employed / freelancer',
    business:  'Running own business',
    student:   'Currently a student',
    homemaker: 'Homemaker managing family',
    retired:   'Retired professional',
  };

  const sectorGuide  = SECTOR_SEARCH_GUIDE[sector]  ?? '';
  const empContext   = EMPLOYMENT_CONTEXT[employment] ?? '';

  if (!sectorGuide && !empContext) return '';

  return `
=== REAL WORLD CONTEXT INSTRUCTIONS ===
Today's Date: ${isoDate}
Current Period: ${monthYear} | ${quarter} | ${financialYear} | ${season} season in India

Person's employment status: ${empContext || 'Not specified'}

${sectorGuide ? `Their sector: ${sectorGuide}

IMPORTANT INSTRUCTION FOR AI:
Use your most current knowledge for the above sector as of ${monthYear}.
Where you have real-time search capability, fetch live data.
Do NOT use market prices, interest rates, or policy data from your training 
if it could be outdated — instead state the current trend directionally.
Connect the person's planetary period with their ACTUAL current life situation 
in ${monthYear}, not a generic prediction.` : ''}

For example:
- If Saturn aspects their career house AND hiring is slow in their sector RIGHT NOW in ${monthYear} — mention the specific challenge.
- If Jupiter activates their wealth house AND markets are in a particular phase RIGHT NOW — mention the opportunity with appropriate caution.
- Always ground predictions in the PRESENT MOMENT (${monthYear}), not abstract future.
=== END REAL WORLD CONTEXT ===
`;
}

// ─── SERVICE PAGE MAP ─────────────────────────────────────────────────────────
const SERVICE_PAGES: Record<string, { url: string; label: string }> = {
  ex_back:       { url: '/services/ex-back-reading',    label: 'Ex-Back & Karmic Closure Reading' },
  marriage:      { url: '/services/marriage-timing',    label: 'Marriage Timing Reading' },
  career:        { url: '/services/career-pivot',       label: 'Dream Career Pivot Reading' },
  job:           { url: '/services/career-pivot',       label: 'Career & Job Reading' },
  business:      { url: '/services/wealth-reading',     label: 'Business & Wealth Reading' },
  property:      { url: '/services/property-yog',       label: 'Property Purchase Timing' },
  child:         { url: '/services/child-destiny',      label: "Child's Destiny Reading" },
  health:        { url: '/services/health-reading',     label: 'Health & Vitality Reading' },
  boss:          { url: '/services/toxic-boss-radar',   label: 'Toxic Boss Radar Reading' },
  compatibility: { url: '/services/compatibility',      label: 'Compatibility Reading' },
  wealth:        { url: '/services/wealth-reading',     label: 'Wealth & Investment Reading' },
  foreign:       { url: '/services/foreign-settlement', label: 'Foreign Settlement Reading' },
  spiritual:     { url: '/services/spiritual-purpose',  label: 'Spiritual Purpose Reading' },
  retirement:    { url: '/services/retirement-peace',   label: 'Retirement Peace Reading' },
};

function detectServiceIntent(message: string): { url: string; label: string } | null {
  const lower = message.toLowerCase();
  if (lower.includes('ex') || lower.includes('वापस') || lower.includes('closure'))     return SERVICE_PAGES['ex_back']!;
  if (lower.includes('marr') || lower.includes('shaadi') || lower.includes('शादी'))    return SERVICE_PAGES['marriage']!;
  if (lower.includes('job') || lower.includes('career') || lower.includes('नौकरी'))    return SERVICE_PAGES['job']!;
  if (lower.includes('business') || lower.includes('व्यापार'))                          return SERVICE_PAGES['business']!;
  if (lower.includes('property') || lower.includes('house') || lower.includes('मकान')) return SERVICE_PAGES['property']!;
  if (lower.includes('child') || lower.includes('beta') || lower.includes('बच्चा'))    return SERVICE_PAGES['child']!;
  if (lower.includes('health') || lower.includes('bimari') || lower.includes('बीमारी'))return SERVICE_PAGES['health']!;
  if (lower.includes('boss') || lower.includes('office') || lower.includes('toxic'))   return SERVICE_PAGES['boss']!;
  if (lower.includes('compat') || lower.includes('match') || lower.includes('partner'))return SERVICE_PAGES['compatibility']!;
  if (lower.includes('wealth') || lower.includes('money') || lower.includes('पैसा'))   return SERVICE_PAGES['wealth']!;
  if (lower.includes('foreign') || lower.includes('abroad') || lower.includes('विदेश'))return SERVICE_PAGES['foreign']!;
  if (lower.includes('spiritual') || lower.includes('moksha') || lower.includes('मोक्ष'))return SERVICE_PAGES['spiritual']!;
  return null;
}

// ─── GEMINI CALL ──────────────────────────────────────────────────────────────
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
      employment?:     string;
      sector?:         string;
      segment?:        string;
      segmentLabel?:   string;
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
      employment     = '',
      sector         = '',
    } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'API Key missing.' });
    }

    // Language instruction
    const langInstruction =
      lang === 'hindi'   ? HINDI_PLANET_INSTRUCTION :
      lang === 'english' ? 'Respond in clear, warm English only.' :
                           HINGLISH_PLANET_INSTRUCTION;

    // Dynamic date context — computed once per request, never hardcoded
    const { monthYear, isoDate } = getDynamicDateContext();
    const dateStamp = `\n[Today: ${isoDate} | Period: ${monthYear}]\n`;

    // ── FIRST MESSAGE ─────────────────────────────────────────────────────────
    if (isFirstMessage) {
      return NextResponse.json({ reply: JINI_NAMASTE, kundaliSummary: null });
    }

    // ── DEEP PREDICTION MODE ──────────────────────────────────────────────────
    if (mode === 'deep_prediction') {
      const publicIntel = buildPublicIntelligence(employment, sector);
      const fullPrompt  = lang === 'hindi'
        ? `${langInstruction}${dateStamp}\n${publicIntel}\n\nAB NEECHE DIYE FORMAT MEIN SIRF SHUDDH HINDI MEIN LIKHO:\n\n${message}`
        : `${langInstruction}${dateStamp}\n${publicIntel}\n\n${message}`;
      try {
        const reply = await callGemini(fullPrompt, null, 4096, 0.80);
        if (reply.length > 50) return NextResponse.json({ reply });
        return NextResponse.json({ reply: '', error: 'Empty response' });
      } catch (e) {
        console.error('[TrikalVaani v20] deep_prediction error:', e);
        return NextResponse.json({ reply: '', error: String(e) });
      }
    }

    // ── FOUR WEEK MODE ────────────────────────────────────────────────────────
    if (mode === 'four_week') {
      const publicIntel4w = buildPublicIntelligence(employment, sector);
      const fullPrompt    = lang === 'hindi'
        ? `${langInstruction}${dateStamp}\n${publicIntel4w}\n\nSampurn jawab sirf Hindi mein do:\n\n${message}`
        : `${langInstruction}${dateStamp}\n${publicIntel4w}\n\n${message}`;
      try {
        const reply = await callGemini(fullPrompt, null, 4096, 0.82);
        return NextResponse.json({ reply });
      } catch (e) {
        console.error('[TrikalVaani v20] four_week error:', e);
        return NextResponse.json({ reply: '', error: String(e) });
      }
    }

    // ── MASTER MODE — CEO PRIVATE DASHBOARD ──────────────────────────────────
    if (mode === 'master') {
      const { monthYear: my, quarter, financialYear } = getDynamicDateContext();
      const masterSystem = `You are the Master Intelligence Engine of Trikal Vaani.
You are providing a PRIVATE briefing to Rohiit Gupta (CEO & Chief Vedic Architect)
before a ₹499 premium consultation call.

This is NOT shown to the client. This is Rohiit Gupta's private preparation tool.
Be extremely detailed, specific, and actionable. No word limits. Full analysis.
Cross-reference everything — natal chart, current transits, numerology, sector trends.

Current Date Context: ${isoDate} | ${my} | ${quarter} | ${financialYear}
Use the most current information available for this exact period.

${langInstruction}`;
      try {
        const reply = await callGemini(message, masterSystem, 8192, 0.75);
        return NextResponse.json({ reply });
      } catch (e) {
        console.error('[TrikalVaani v20] master error:', e);
        return NextResponse.json({ reply: '', error: String(e) });
      }
    }

    // ── PREDICTION MODE ───────────────────────────────────────────────────────
    if (mode === 'prediction') {
      const fullPrompt = `${langInstruction}${dateStamp}\n${message}`;
      try {
        const reply = await callGemini(fullPrompt, null, 300, 0.85);
        return NextResponse.json({ reply });
      } catch (e) {
        console.error('[TrikalVaani v20] prediction error:', e);
        return NextResponse.json({ reply: '' });
      }
    }

    // ── CHAT MODE — with Prokerala Kundali (v20 CRITICAL FIX) ────────────────
    let kundali        = null;
    let kundaliSummary = null;

    if (birthData?.dob && birthData?.tob && birthData?.lat) {
      try {
        // v20 FIX: Using real Swiss Ephemeris via Prokerala API
        // buildKundaliFromProkerala() is async — must be awaited
        // Previously was using buildKundali() (Meeus ±2-3° approximation) — NOW FIXED
        kundali = await buildKundaliFromProkerala(birthData);

        kundaliSummary = {
          lagna:            kundali.lagna,
          lagnaLord:        kundali.lagnaLord,
          nakshatra:        kundali.nakshatra,
          nakshatraLord:    kundali.nakshatraLord,
          mahadasha:        kundali.currentMahadasha.lord,
          antardasha:       kundali.currentAntardasha.lord,
          pratyantar:       kundali.currentPratyantar.lord,        // ✅ Level 3
          pratyantar_ends:  kundali.currentPratyantar.endDate,     // ✅ Exact end date
          pratyantar_days:  kundali.currentPratyantar.remainingDays, // ✅ Days left
          sookshma:         kundali.currentSookshma.lord,          // ✅ Level 4
          dashaQuality:     kundali.currentPratyantar.quality,     // ✅ Shubh/Ashubh
          dashaBalance:     kundali.dashaBalance,
          choghadiya:       kundali.panchang.choghadiya,
          rahuKaal:         kundali.panchang.rahuKaal,
          abhijeet:         kundali.panchang.abhijeetMuhurta,
          tithi:            kundali.panchang.tithi,
          vara:             kundali.panchang.vara,
          yoga:             kundali.panchang.yoga,
          calculatedOn:     isoDate,                               // ✅ Dynamic timestamp
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
        console.error('[TrikalVaani v20] Prokerala Kundali error:', calcErr);
        // Fallback to Meeus if Prokerala API fails (network issue, quota etc.)
        try {
          const { buildKundali } = await import('../../../lib/swiss-ephemeris');
          kundali = buildKundali(birthData);
          console.warn('[TrikalVaani v20] Fell back to Meeus — Prokerala unavailable');
          kundaliSummary = {
            lagna:         kundali.lagna,
            lagnaLord:     kundali.lagnaLord,
            nakshatra:     kundali.nakshatra,
            nakshatraLord: kundali.nakshatraLord,
            mahadasha:     kundali.currentMahadasha.lord,
            antardasha:    kundali.currentAntardasha.lord,
            dashaBalance:  kundali.dashaBalance,
            calculatedOn:  isoDate,
            fallback:      true, // ⚠️ Flag so you can monitor in logs
            planets: Object.values(kundali.planets).map(p => ({
              name: p.name, rashi: p.rashi, house: p.house,
              strength: p.strength, isRetrograde: p.isRetrograde,
              nakshatra: p.nakshatra, degree: p.degree,
            })),
          };
        } catch (fallbackErr) {
          console.error('[TrikalVaani v20] Fallback also failed:', fallbackErr);
        }
      }
    }

    // Revenue guard
    const serviceIntent = detectServiceIntent(message);
    const detectedLang  = detectLanguage(message);

    const revenueGuardInstruction = `
REVENUE GUARD — CRITICAL RULE:
When user asks a specific life question (career, marriage, ex-back, health, property, child, boss etc.):
1. Give ONE teaser sentence hinting at what their chart shows
2. Say "Is baare mein gehri jaankari ke liye, main aapko hamari specialized reading page par le jaati hoon"
3. End with: [SERVICE_LINK]
DO NOT give free full answers to specific life questions.
For general chart questions, greetings, panchang — answer freely.

Current date for your reference: ${isoDate} (${monthYear})
`;

    const systemPrompt =
      buildJiniSystemPrompt(kundali, category, detectedLang, birthData?.name)
      + '\n\n' + revenueGuardInstruction
      + '\n\n' + langInstruction;

    let reply = '';
    try {
      reply = await callGemini(message, systemPrompt, 280, 0.85);
    } catch (e) {
      console.error('[TrikalVaani v20] chat error:', e);
      return NextResponse.json({
        reply: 'Cosmic signals weak hain. Ek minute mein dobara try karein. 🙏',
        kundaliSummary,
      });
    }

    // Inject service link
    if (serviceIntent && reply.includes('[SERVICE_LINK]')) {
      reply = reply.replace(
        '[SERVICE_LINK]',
        `\n\n🔮 [${serviceIntent.label}](${serviceIntent.url}) — Abhi dekho`
      );
    } else if (serviceIntent && !reply.includes('http')) {
      reply += `\n\n🔮 Gehri reading ke liye: [${serviceIntent.label}](${serviceIntent.url})`;
    }

    return NextResponse.json({ reply, kundaliSummary });

  } catch (err: unknown) {
    console.error('[TrikalVaani v20] Unhandled error:', err);
    return NextResponse.json({ reply: 'Kuch cosmic disturbance aa gayi. 🙏' });
  }
}