/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 9.0 — Claude Haiku polish wired at Step 6.5 for ₹51+
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FULL FLOW v9.0:
 *   Step 1 → /kundali       (Render Swiss Ephemeris)
 *   Step 2 → adaptSwissToKundali()
 *   Step 3 → /synthesize    (Render — Bhrigu+Parashara+Panchang+Confidence)
 *   Step 4 → buildPredictionPrompt()
 *   Step 5 → Gemini 2.5 Flash
 *   Step 6 → Parse JSON
 *   Step 6.5 → Claude Haiku polish (₹51+ ONLY) ← NEW WIRED
 *   Step 7 → saveToSupabase()
 *   Step 8 → Return with predictionId
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDomainConfig } from '@/lib/domain-config';
import { buildPredictionPrompt } from '@/lib/gemini-prompt';
import { polishPrediction } from '@/lib/claude-polish';
import {
  calcDasha,
  NAKSHATRA_LORDS,
  RASHI_LORDS,
  NAKSHATRAS,
} from '@/lib/swiss-ephemeris';
import type { KundaliData, BirthData, PlanetPosition } from '@/lib/swiss-ephemeris';
import type { DomainId } from '@/lib/domain-config';
import type { UserTier, UserContext } from '@/lib/gemini-prompt';

export const maxDuration = 300;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_MODEL   = 'gemini-2.5-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const EPHE_API_URL   = process.env.EPHE_API_URL ?? '';
const EPHE_API_KEY   = process.env.EPHE_API_KEY ?? '';

const MAX_TOKENS: Record<UserTier, number> = {
  free: 4096, basic: 8192, pro: 8192, premium: 16384,
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PredictRequest {
  userId?:   string;
  sessionId: string;
  domainId:  DomainId;
  birthData: {
    name?:     string;
    dob:       string;
    tob:       string;
    lat:       number;
    lng:       number;
    cityName?: string;
  };
  userContext: {
    segment:       'genz' | 'millennial' | 'genx';
    employment:    string;
    sector:        string;
    language:      'hindi' | 'hinglish' | 'english';
    city?:         string;
    businessName?: string;
    person2Name?:  string;
    person2City?:  string;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getNakshatraLord(name: string): string {
  const idx = (NAKSHATRAS as readonly string[]).indexOf(name);
  return idx >= 0 ? (NAKSHATRA_LORDS[idx] ?? 'Ketu') : 'Ketu';
}

const EXALT_SIGN: Record<string, string> = {
  Sun:'Mesh', Moon:'Vrishabh', Mars:'Makar', Mercury:'Kanya',
  Jupiter:'Kark', Venus:'Meen', Saturn:'Tula',
};
const DEBIL_SIGN: Record<string, string> = {
  Sun:'Tula', Moon:'Vrischik', Mars:'Kark', Mercury:'Meen',
  Jupiter:'Makar', Venus:'Kanya', Saturn:'Mesh',
};
const OWN_SIGNS: Record<string, string[]> = {
  Sun:['Simha'], Moon:['Kark'], Mars:['Mesh','Vrischik'],
  Mercury:['Mithun','Kanya'], Jupiter:['Dhanu','Meen'],
  Venus:['Vrishabh','Tula'], Saturn:['Makar','Kumbh'],
};

function computeStrength(planet: string, sign: string, retro: boolean): number {
  let s = 50;
  if (EXALT_SIGN[planet] === sign)       s += 30;
  if (DEBIL_SIGN[planet]  === sign)       s -= 25;
  if (OWN_SIGNS[planet]?.includes(sign)) s += 20;
  if (retro && planet !== 'Rahu' && planet !== 'Ketu') s += 8;
  return Math.min(100, Math.max(5, s));
}

function buildPanchangStub() {
  return {
    vara: '', tithi: '', yoga: '', nakshatra: '',
    sunrise: '', sunset: '',
    rahuKaal:        { start: '', end: '' },
    abhijeetMuhurta: { start: '', end: '' },
    choghadiya:      { name: '', type: 'Neutral' as const },
  };
}

function adaptSwissToKundali(chart: any, birthData: BirthData): KundaliData {
  const grahas: any[] = Array.isArray(chart.grahas) ? chart.grahas : [];
  const planets: Record<string, PlanetPosition> = {};

  for (const g of grahas) {
    const name: string = g.planet;
    planets[name] = {
      name,
      siderealLongitude: g.longitude      ?? 0,
      rashi:             g.sign           ?? 'Mesh',
      degree:            g.degree_in_sign ?? 0,
      nakshatra:         g.nakshatra      ?? 'Ashwini',
      nakshatraPada:     g.pada           ?? 1,
      nakshatraLord:     g.nakshatra_lord ?? 'Ketu',
      isRetrograde:      g.retrograde     ?? (name === 'Rahu' || name === 'Ketu'),
      house:             g.house          ?? 1,
      strength:          computeStrength(name, g.sign ?? 'Mesh', g.retrograde ?? false),
    };
  }

  const lagnaSign     = chart.lagna?.sign      ?? 'Mesh';
  const lagnaLord     = chart.lagna?.sign_lord ?? RASHI_LORDS[lagnaSign] ?? 'Mars';
  const moonGraha     = grahas.find(g => g.planet === 'Moon') ?? {};
  const nakshatra     = moonGraha.nakshatra      ?? 'Ashwini';
  const nakshatraLord = moonGraha.nakshatra_lord ?? getNakshatraLord(nakshatra);
  const moonLongitude = moonGraha.longitude      ?? 0;
  const dob           = new Date(`${birthData.dob}T${birthData.tob}:00+05:30`);
  const dasha         = calcDasha(moonLongitude, dob);

  return {
    lagna: lagnaSign, lagnaLord, planets, nakshatra, nakshatraLord,
    currentMahadasha:  dasha.currentMahadasha,
    currentAntardasha: dasha.currentAntardasha,
    currentPratyantar: dasha.currentPratyantar,
    currentSookshma:   dasha.currentSookshma,
    antardashas:       dasha.antardashas,
    pratyantar:        dasha.pratyantar,
    dashaBalance:      dasha.dashaBalance,
    panchang:          buildPanchangStub(),
    birthData,
  };
}

// ── /synthesize ───────────────────────────────────────────────────────────────

async function callSynthesize(
  domainId:    string,
  chart:       any,
  kundali:     KundaliData,
  birthData:   BirthData,
  userContext: any,
): Promise<any> {
  try {
    const payload = {
      domainId,
      birthData: {
        lat: birthData.lat, lng: birthData.lng,
        dob: birthData.dob, tob: birthData.tob,
        name: birthData.name, cityName: birthData.cityName, timezone: 5.5,
      },
      kundaliData: {
        grahas: chart.grahas ?? [],
        lagna:  chart.lagna  ?? { sign: kundali.lagna },
        houses: chart.houses ?? [],
        dasha: {
          mahadasha:  { lord: kundali.currentMahadasha.lord },
          antardasha: { lord: kundali.currentAntardasha.lord },
          pratyantar: { lord: kundali.currentPratyantar?.lord ?? '', quality: kundali.currentPratyantar?.quality ?? 'Madhyam' },
          dashaBalance: kundali.dashaBalance,
        },
      },
      userContext: userContext ?? {},
    };

    const res = await fetch(`${EPHE_API_URL}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(EPHE_API_KEY ? { 'X-Api-Key': EPHE_API_KEY } : {}) },
      body:   JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.warn(`[TV-Predict] /synthesize ${res.status}`);
      return null;
    }

    const result   = await res.json();
    const enriched = result?.enriched ?? result;
    console.log('[TV-Predict] /synthesize OK | yogas:', enriched?.parashara?.totalActiveYogas ?? 0,
      '| confidence:', enriched?.confidence?.label ?? '—');
    return enriched;

  } catch (err) {
    console.warn('[TV-Predict] /synthesize failed (non-fatal):', err);
    return null;
  }
}

// ── Tier ──────────────────────────────────────────────────────────────────────

async function getVerifiedTier(userId: string): Promise<UserTier> {
  try {
    const { data, error } = await supabase
      .from('profiles').select('tier, tier_expires_at').eq('id', userId).single();
    if (error || !data) return 'free';
    if (data.tier_expires_at && new Date(data.tier_expires_at) < new Date()) return 'free';
    const valid: UserTier[] = ['free', 'basic', 'pro', 'premium'];
    return valid.includes(data.tier) ? data.tier : 'free';
  } catch { return 'free'; }
}

// ── Supabase Save ─────────────────────────────────────────────────────────────

async function saveToSupabase(p: {
  sessionId: string; userId?: string; domainId: string; domainLabel: string;
  birthData: BirthData; userContext: UserContext; kundali: KundaliData;
  synthesis: any; prediction: Record<string, unknown>;
  tier: UserTier; processingMs: number; useSearch: boolean; polished: boolean;
}): Promise<string | null> {
  try {
    const row = {
      session_id:     p.sessionId,
      user_id:        p.userId ?? null,
      domain_id:      p.domainId,
      domain_label:   p.domainLabel,
      person_name:    p.birthData.name     ?? 'User',
      dob:            p.birthData.dob,
      birth_time:     p.birthData.tob,
      birth_city:     p.birthData.cityName ?? p.userContext.city ?? 'India',
      birth_lat:      p.birthData.lat,
      birth_lng:      p.birthData.lng,
      birth_timezone: 5.5,
      lagna:          p.kundali.lagna,
      nakshatra:      p.kundali.nakshatra,
      mahadasha:      p.kundali.currentMahadasha.lord,
      antardasha:     p.kundali.currentAntardasha.lord,
      tier:           p.tier,
      language:       p.userContext.language   ?? 'hinglish',
      segment:        p.userContext.segment    ?? 'millennial',
      employment:     p.userContext.employment ?? '',
      sector:         p.userContext.sector     ?? '',
      prediction_json: {
        ...p.prediction,
        _meta: {
          domainId:    p.domainId,
          tier:        p.tier,
          chartSource: 'swiss_ephemeris_render',
          model:       GEMINI_MODEL,
          polished:    p.polished,
          searchUsed:  p.useSearch,
          processingMs: p.processingMs,
          kundali: {
            lagna:         p.kundali.lagna,
            lagnaLord:     p.kundali.lagnaLord,
            nakshatra:     p.kundali.nakshatra,
            nakshatraLord: p.kundali.nakshatraLord,
            mahadasha:     p.kundali.currentMahadasha.lord,
            antardasha:    p.kundali.currentAntardasha.lord,
          },
          planets:   Object.values(p.kundali.planets),
          synthesis: p.synthesis ?? null,
        },
      },
      simple_summary: (p.prediction?.simple_summary ?? p.prediction?.headline ?? null) as string | null,
      headline:       (p.prediction?.headline ?? null) as string | null,
      confidence:     (p.synthesis?.confidence?.score ?? p.prediction?.confidence ?? null) as number | null,
      chart_source:   'swiss_ephemeris_render',
      gemini_model:   GEMINI_MODEL,
      search_used:    p.useSearch,
      processing_ms:  p.processingMs,
    };

    const { data, error } = await supabase
      .from('predictions')
      .upsert(row, { onConflict: 'session_id,domain_id', ignoreDuplicates: false })
      .select('id').single();

    if (error) { console.error('[TV-Predict] Supabase error:', error.message); return null; }
    console.log(`[TV-Predict] Saved id:${data.id} | polished:${p.polished}`);
    return data.id as string;

  } catch (err) {
    console.error('[TV-Predict] Save exception:', err);
    return null;
  }
}

// ── Main Handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json() as PredictRequest;
    const { userId, sessionId, domainId, birthData, userContext } = body;

    if (!sessionId)      return NextResponse.json({ error: 'sessionId required' },              { status: 400 });
    if (!domainId)       return NextResponse.json({ error: 'domainId required' },               { status: 400 });
    if (!birthData?.dob) return NextResponse.json({ error: 'birthData.dob required' },          { status: 400 });
    if (!birthData?.tob) return NextResponse.json({ error: 'birthData.tob required' },          { status: 400 });
    if (!birthData?.lat) return NextResponse.json({ error: 'birthData.lat required' },          { status: 400 });
    if (!GEMINI_API_KEY) return NextResponse.json({ error: 'Prediction engine not configured' }, { status: 500 });
    if (!EPHE_API_URL)   return NextResponse.json({ error: 'Ephemeris API not configured' },     { status: 500 });

    const verifiedTier = userId ? await getVerifiedTier(userId) : 'free';
    let domain;
    try { domain = getDomainConfig(domainId); }
    catch { return NextResponse.json({ error: `Unknown domainId: ${domainId}` }, { status: 400 }); }

    // ── Step 1: /kundali ──────────────────────────────────────────────────────
    const [year, month, day] = birthData.dob.split('-').map(Number);
    const [hour, minute]     = birthData.tob.split(':').map(Number);
    let chart: any;
    try {
      const res = await fetch(`${EPHE_API_URL}/kundali`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(EPHE_API_KEY ? { 'X-Api-Key': EPHE_API_KEY } : {}) },
        body:   JSON.stringify({ year, month, day, hour, minute, second: 0, latitude: birthData.lat, longitude: birthData.lng, timezone: 5.5, ayanamsa: 'lahiri' }),
        signal: AbortSignal.timeout(240000),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(`${res.status}: ${e.detail}`); }
      chart = await res.json();
      console.log(`[TV-Predict] /kundali OK — lagna:${chart.lagna?.sign}`);
    } catch (err) {
      console.error('[TV-Predict] /kundali failed:', err);
      return NextResponse.json({ error: 'Chart calculation failed. Please retry.' }, { status: 502 });
    }

    // ── Step 2: Adapt ─────────────────────────────────────────────────────────
    const localBirthData: BirthData = {
      name: birthData.name || 'User', dob: birthData.dob, tob: birthData.tob,
      lat: birthData.lat, lng: birthData.lng,
      cityName: birthData.cityName || userContext.city || 'India',
    };
    let kundali: KundaliData;
    try {
      kundali = adaptSwissToKundali(chart, localBirthData);
    } catch (err) {
      return NextResponse.json({ error: 'Chart processing failed. Please retry.' }, { status: 500 });
    }

    // ── Step 3: /synthesize ───────────────────────────────────────────────────
    const synthesis = await callSynthesize(domainId, chart, kundali, localBirthData, userContext);

    if (synthesis?.panchang) {
      const p = synthesis.panchang;
      kundali.panchang = {
        vara: p.vara ?? '', tithi: p.tithi ?? '', yoga: p.yoga ?? '',
        nakshatra: p.nakshatra ?? '', sunrise: p.sunrise ?? '', sunset: p.sunset ?? '',
        rahuKaal:        p.rahuKaal        ?? { start: '', end: '' },
        abhijeetMuhurta: p.abhijeetMuhurta ?? { start: '', end: '' },
        choghadiya:      p.choghadiya      ?? { name: '', type: 'Neutral' },
      };
    }

    // ── Step 4: Build prompt ──────────────────────────────────────────────────
    const verifiedUserContext: UserContext = {
      tier:         verifiedTier,
      segment:      userContext.segment    || 'millennial',
      employment:   userContext.employment || '',
      sector:       userContext.sector     || '',
      language:     userContext.language   || 'hinglish',
      city:         userContext.city       || birthData.cityName || 'India',
      businessName: userContext.businessName,
      person2Name:  userContext.person2Name,
      person2City:  userContext.person2City,
    };

    const { systemPrompt, userMessage, useSearch } = buildPredictionPrompt(
      kundali, localBirthData, domain, verifiedUserContext,
    );

    // ── Step 5: Gemini ────────────────────────────────────────────────────────
    const geminiBody: Record<string, unknown> = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature: 0.4, maxOutputTokens: MAX_TOKENS[verifiedTier],
        topP: 0.85, responseMimeType: 'application/json',
      },
    };
    if (useSearch) geminiBody['tools'] = [{ googleSearch: {} }];

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });
    if (!geminiRes.ok) {
      console.error(`[TV-Predict] Gemini ${geminiRes.status}`);
      return NextResponse.json({ error: 'Prediction engine unavailable' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!rawText) return NextResponse.json({ error: 'Empty prediction response' }, { status: 502 });

    // ── Step 6: Parse ─────────────────────────────────────────────────────────
    let prediction: Record<string, unknown>;
    try {
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
      prediction = JSON.parse(cleaned);
    } catch {
      console.error('[TV-Predict] JSON parse failed:', rawText.slice(0, 300));
      return NextResponse.json({ error: 'Invalid prediction format. Please retry.' }, { status: 502 });
    }

    // ── Step 6.5: Claude Haiku Polish (₹51+) ─────────────────────────────────
    let polished = false;
    if (verifiedTier !== 'free') {
      const polishTier = verifiedTier === 'premium' ? 'premium' :
                         verifiedTier === 'standard' || verifiedTier === 'pro' ? 'standard' : 'basic';
      try {
        const polishResult = await polishPrediction(
          prediction,
          verifiedUserContext.language,
          localBirthData.name ?? 'Friend',
          domain.label ?? domainId,
          polishTier as 'basic' | 'standard' | 'premium',
        );
        if (polishResult.polished) {
          prediction = polishResult.prediction;
          polished   = true;
          console.log(`[TV-Predict] Claude polish OK — tier:${polishTier} ms:${polishResult.polishMs}`);
        }
      } catch (polishErr) {
        // Non-fatal — continue with Gemini output
        console.warn('[TV-Predict] Claude polish failed (non-fatal):', polishErr);
      }
    }

    // ── Step 7: Save ──────────────────────────────────────────────────────────
    const processingMs = Date.now() - startTime;
    const predictionId = await saveToSupabase({
      sessionId, userId, domainId,
      domainLabel:  domain.label ?? domainId,
      birthData:    localBirthData,
      userContext:  verifiedUserContext,
      kundali, synthesis, prediction,
      tier: verifiedTier, processingMs, useSearch, polished,
    });

    // ── Step 8: Return ────────────────────────────────────────────────────────
    return NextResponse.json({
      ...prediction,
      _meta: {
        domainId, tier: verifiedTier,
        chartSource: 'swiss_ephemeris_render',
        model:       GEMINI_MODEL,
        polished,    searchUsed: useSearch,
        processingMs, predictionId,
        kundali: {
          lagna:         kundali.lagna,
          lagnaLord:     kundali.lagnaLord,
          nakshatra:     kundali.nakshatra,
          nakshatraLord: kundali.nakshatraLord,
          mahadasha:     kundali.currentMahadasha.lord,
          antardasha:    kundali.currentAntardasha.lord,
        },
        synthesis: synthesis ? {
          yogas:      synthesis.parashara?.activeYogas ?? [],
          bhrigu:     synthesis.bhrigu?.domain_signals ?? [],
          panchang:   synthesis.panchang   ?? {},
          confidence: synthesis.confidence ?? {},
          summary:    synthesis.synthesis  ?? {},
        } : null,
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TV-Predict] Unhandled:', msg);
    return NextResponse.json({ error: 'Cosmic disturbance. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'operational', engine: 'Trikal Vaani Predict v9.0',
    synthesize: true, polish: true, domains: 11,
  });
}
