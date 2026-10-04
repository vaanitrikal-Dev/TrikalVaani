// ============================================================
// File: lib/calc-core/kundali.ts
// Version: v1.0 — 4 Oct 2026 — MCP programme, Batch B1 (pehla hissa)
//
// KYA HAI: /api/calc/kundali ka poora dimaag — VM se kundali, aaj ki dasha,
// sabse balwan/kamzor graha, target graha, upay template aur BPHS 84 granth
// upay — EK jagah, bina Next.js ke. Isi ek jawab par 12 calculator chalte
// hain (dasha, graha-bal, lagna, lagna-bal, rashi, nakshatra, weak-planet,
// kundali-strength, lucky-day, gemstone, gemstone-suitability, baby-name).
//   * Website: app/api/calc/kundali/route.ts (v2.6) isi ko bulata hai.
//   * MCP:     VM par mcp-server/ isi ko bulata hai.
//
// NIYAM: koi next/*, @/ alias, process.env, Supabase nahi. VM tak pahunchna
// caller ka kaam (VmCaller). Behaviour route v2.5 se akshar-se-akshar same —
// Rohiit ke chart (23-09-1975 16:55 Delhi) ke asli VM jawab par jaancha.
// ============================================================

import { buildGranthUpay } from '../bphs84-upay';   // v2.5 — BPHS 84 granth-upay
import type { VmCaller } from './yog';

export type { VmCaller };

export const NEW_CALC_TYPES = [
  'graha-bal',
  'lucky-day',
  'weak-planet',
  'kundali-strength',
  'lagna-bal',
  'shadbala',
  'gemstone',
];

export interface CalcInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone: number;
  name?: string;
  gender?: 'male' | 'female' | 'other';
  calcType?:
    | 'kundali'
    | 'nakshatra'
    | 'rashi'
    | 'lagna'
    | 'dasha'
    | 'graha-bal'
    | 'lucky-day'
    | 'weak-planet'
    | 'kundali-strength'
    | 'lagna-bal'
    | 'shadbala'
    | 'gemstone';
}

// ─── Find current Mahadasha by date comparison ───────────────────────────────

function getCurrentDasha(mahaList: any[]): { mahadasha: string | null; antardasha: string | null } {
  if (!Array.isArray(mahaList) || mahaList.length === 0) {
    return { mahadasha: null, antardasha: null };
  }
  const today = new Date();
  let currentMaha: any = null;
  for (const m of mahaList) {
    const start = new Date(m.start);
    const end = new Date(m.end);
    if (today >= start && today <= end) { currentMaha = m; break; }
  }
  if (!currentMaha) currentMaha = mahaList[mahaList.length - 1];
  const antarList = currentMaha?.antar ?? [];
  let currentAntar: any = null;
  for (const a of antarList) {
    const aStart = new Date(a.start);
    const aEnd = new Date(a.end);
    if (today >= aStart && today <= aEnd) { currentAntar = a; break; }
  }
  if (!currentAntar && antarList.length > 0) currentAntar = antarList[0];
  return {
    mahadasha: currentMaha?.planet || null,
    antardasha: currentAntar?.planet || null,
  };
}

// ─── Resolve correct target planet per calcType ──────────────────────────────
function resolveTargetPlanet(
  calcType: string,
  lagnaLord: string | null,
  mahadasha: string | null,
  strongestPlanet: string | null,
  weakestPlanet: string | null
): string | null {
  switch (calcType) {
    case 'nakshatra':        return 'Moon';
    case 'rashi':            return 'Moon';
    case 'lagna':            return lagnaLord || null;
    case 'kundali':          return mahadasha || null;
    case 'dasha':            return mahadasha || null;
    // ── New calcTypes (v1.6) ──
    case 'graha-bal':        return weakestPlanet || strongestPlanet || mahadasha || null;
    case 'lucky-day':        return strongestPlanet || mahadasha || null;
    case 'weak-planet':      return weakestPlanet || null;
    case 'kundali-strength': return mahadasha || null;
    case 'lagna-bal':        return lagnaLord || null;
    case 'shadbala':         return weakestPlanet || null;
    case 'gemstone':         return lagnaLord || mahadasha || null;
    default:                 return mahadasha || null;
  }
}

// ─── Planet remedy details lookup ────────────────────────────────────────────
const PLANET_REMEDY: Record<string, { mantra_hi: string; daan_hi: string; day_hi: string; day: string; stone: string; metal: string; finger: string; deity: string; vrat: string }> = {
  Moon:    { mantra_hi: 'ॐ चंद्राय नमः',       daan_hi: 'चावल, दूध, चांदी, सफेद वस्त्र',        day_hi: 'सोमवार',   day: 'Monday',    stone: 'Pearl (Moti)',              metal: 'Silver', finger: 'Little finger', deity: 'Lord Shiva',  vrat: 'Somvar Vrat'    },
  Mars:    { mantra_hi: 'ॐ अंगारकाय नमः',      daan_hi: 'मसूर दाल, गुड़, तांबा, लाल वस्त्र',    day_hi: 'मंगलवार',  day: 'Tuesday',   stone: 'Red Coral (Moonga)',        metal: 'Gold',   finger: 'Ring finger',   deity: 'Hanuman ji',  vrat: 'Mangalvar Vrat' },
  Mercury: { mantra_hi: 'ॐ बुधाय नमः',         daan_hi: 'हरी मूंग, हरा वस्त्र, पुस्तकें',        day_hi: 'बुधवार',   day: 'Wednesday', stone: 'Emerald (Panna)',           metal: 'Gold',   finger: 'Little finger', deity: 'Ganesh ji',   vrat: 'Budhvar Vrat'   },
  Jupiter: { mantra_hi: 'ॐ गुरवे नमः',         daan_hi: 'पीला चना, हल्दी, पुस्तकें',             day_hi: 'गुरुवार',  day: 'Thursday',  stone: 'Yellow Sapphire (Pukhraj)', metal: 'Gold',   finger: 'Index finger',  deity: 'Lord Vishnu', vrat: 'Guruvar Vrat'   },
  Venus:   { mantra_hi: 'ॐ शुक्राय नमः',       daan_hi: 'सफेद मिठाई, घी, चांदी',                 day_hi: 'शुक्रवार', day: 'Friday',    stone: 'Diamond (Heera)',           metal: 'Gold',   finger: 'Middle finger', deity: 'Maa Lakshmi', vrat: 'Shukravar Vrat' },
  Saturn:  { mantra_hi: 'ॐ शनैश्चराय नमः',     daan_hi: 'काला तिल, उड़द दाल, लोहा, सरसों तेल',  day_hi: 'शनिवार',   day: 'Saturday',  stone: 'Blue Sapphire (Neelam)',    metal: 'Silver', finger: 'Middle finger', deity: 'Shani Dev',   vrat: 'Shanivar Vrat'  },
  Sun:     { mantra_hi: 'ॐ सूर्याय नमः',       daan_hi: 'गेहूं, गुड़, लाल वस्त्र',               day_hi: 'रविवार',   day: 'Sunday',    stone: 'Ruby (Manik)',              metal: 'Gold',   finger: 'Ring finger',   deity: 'Surya Dev',   vrat: 'Ravivar Vrat'   },
  Rahu:    { mantra_hi: 'ॐ राहवे नमः',         daan_hi: 'नारियल, नीला वस्त्र, उड़द दाल',         day_hi: 'शनिवार',   day: 'Saturday',  stone: 'Hessonite (Gomed)',         metal: 'Silver', finger: 'Middle finger', deity: 'Maa Durga',   vrat: 'Rahu Shanti'    },
  Ketu:    { mantra_hi: 'ॐ केतवे नमः',         daan_hi: 'बहुरंगी वस्त्र, तिल, कंबल',             day_hi: 'मंगलवार',  day: 'Tuesday',   stone: "Cat's Eye (Lehsunia)",      metal: 'Silver', finger: 'Little finger', deity: 'Ganesh ji',   vrat: 'Ketu Shanti'    },
};

// ─── Map VM remedy object to frontend template format ────────────────────────
function buildTemplateFromVMRemedies(vmRemediesObj: any, planet: string | null): any {
  const vmRemedies: any[] = vmRemediesObj?.remedies ?? [];
  if (!vmRemedies.length) return null;
  const pd = PLANET_REMEDY[planet ?? ''] ?? PLANET_REMEDY['Jupiter'];
  return {
    remedyPlan: {
      remedies: vmRemedies.map((r: any) => {
        const base = { type: r.type, planet: r.planet ?? planet };
        // v1.7 (1 Oct 2026) — BPHS 84 ke granth-upay (VM remedy_master v2.0, system "Granth"):
        // koi pakka mantra/daan NAHI chipkaana — seedha granth ka text, hawale ke saath.
        if (r.system === 'Granth') return { ...base, granth: true, srot: r.srot, text: r.detail };
        if (r.type === 'mantra') {
          return { ...base, mantra: pd.mantra_hi, count: '108', time: `${pd.day_hi} सुबह`, special: r.detail };
        }
        if (r.type === 'daan') {
          return { ...base, items: pd.daan_hi, day: pd.day_hi, recipient: 'गरीब या जरूरतमंद', note: r.detail };
        }
        if (r.type === 'vrat') {
          return { ...base, name: pd.vrat, day: pd.day, deity: pd.deity, prasad: pd.daan_hi };
        }
        if (r.type === 'gemstone') {
          // v2.5 — ratna upay ke apne grah (lagnesh) ka; pehle route ke grah ka aata tha
          const gp = PLANET_REMEDY[r.planet ?? ''] ?? pd;
          return { ...base, lagna_stone: { stone: gp.stone, metal: gp.metal, finger: gp.finger, for: r.detail } };
        }
        return { ...base, text: r.detail };
      }),
    },
    actionWindows: vmRemediesObj?.actionWindows ?? [],
    avoidWindows: vmRemediesObj?.avoidWindows ?? [],
  };
}

// ─── Synthesize a template from PLANET_REMEDY when VM sends none ──────────────
function synthesizeTemplate(planet: string | null): any {
  const pd = PLANET_REMEDY[planet ?? ''] ?? PLANET_REMEDY['Jupiter'];
  const p = planet || 'Graha';
  return {
    remedyPlan: {
      remedies: [
        {
          type: 'mantra', planet: p,
          mantra: pd.mantra_hi, count: '108', time: `${pd.day_hi} सुबह`,
          special: `${p} ko strong karne ke liye ${pd.day_hi} ko jaap karein`,
        },
        {
          type: 'gemstone', planet: p,
          lagna_stone: { stone: pd.stone, metal: pd.metal, finger: pd.finger, for: `${p} strengthening` },
        },
        {
          type: 'daan', planet: p,
          items: pd.daan_hi, day: pd.day_hi, recipient: 'गरीब या जरूरतमंद',
          note: `${pd.day_hi} ko shraddha se daan karein`,
        },
      ],
    },
    actionWindows: [
      { window: pd.day_hi,        reason: `${p} ka vaar — is din puja, daan aur mantra se graha balwan hota hai` },
      { window: 'सूर्योदय (सुबह)', reason: `${pd.deity} ki upasana ke liye sabse shubh samay` },
      { window: pd.vrat,          reason: `${p} ke liye ${pd.vrat} rakhne se shubh phal milta hai` },
    ],
    avoidWindows: [],
  };
}

// ─── Effective strength for ranking (prefers VM strength) ─────────────────────
function planetStrength(g: any): number | null {
  if (typeof g?.strength === 'number') return g.strength;
  const ratio = g?.shadbala?.ratio;
  if (typeof ratio === 'number') return ratio;
  return null;
}


export type KundaliOutcome =
  | { ok: false; status: number; error: string; detail?: string }
  | { ok: true; body: Record<string, unknown> };

/** Zaroori field ki jaanch (route v2.5 jaisi: undefined/null hi galti). */
export function kundaliBirthError(body: Partial<CalcInput>): string | null {
  const required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
  for (const f of required) {
    if (body[f as keyof CalcInput] === undefined || body[f as keyof CalcInput] === null) {
      return `Missing field: ${f}`;
    }
  }
  return null;
}

/**
 * Poora calculator jawab — sessionId CHHOD KAR (woh caller jodta hai).
 * Body ki keys route v2.5 ke kram mein hain; route sessionId ko doosri
 * jagah daalta hai.
 */
export async function runKundali(body: CalcInput, vm: VmCaller): Promise<KundaliOutcome> {
  const calcType = body.calcType ?? 'kundali';
  const isNewCalc = NEW_CALC_TYPES.includes(calcType);

  const vmPayload = {
    year: body.year,
    month: body.month,
    day: body.day,
    hour: body.hour,
    minute: body.minute,
    second: 0,
    latitude: body.latitude,
    longitude: body.longitude,
    timezone: body.timezone,
    ayanamsa: 'lahiri',
    house_system: 'P',
  };

  const kRes = await vm('/kundali', vmPayload);
  if (!kRes.ok) {
    const errText = await kRes.text();
    console.error('[kundali] VM /kundali failed:', errText);
    return { ok: false, status: 502, error: 'Kundali engine error', detail: errText };
  }

  const kundaliData = await kRes.json();
  const mahaList = kundaliData?.dasha?.maha_dasha ?? [];
  const { mahadasha: currentMahadasha, antardasha: currentAntardasha } = getCurrentDasha(mahaList);
  const moonGraha = kundaliData?.grahas?.find((g: any) => g.planet === 'Moon');
  const lagnaLord = kundaliData?.lagna?.sign_lord ?? null;
  const grahas = kundaliData?.grahas ?? [];
  const realPlanets = grahas.filter((g: any) => !['Rahu', 'Ketu'].includes(g.planet));
  const sorted = [...realPlanets].sort((a, b) => (planetStrength(b) ?? 0) - (planetStrength(a) ?? 0));
  const strongestPlanet: string | null = sorted[0]?.planet ?? null;
  const weakestPlanet: string | null = sorted.length ? sorted[sorted.length - 1]?.planet ?? null : null;
  const strengthAvailable: boolean = realPlanets.some((g: any) => typeof g?.strength === 'number');
  const targetPlanet = resolveTargetPlanet(
    calcType, lagnaLord, currentMahadasha, strongestPlanet, weakestPlanet
  );

  let templateData = buildTemplateFromVMRemedies(kundaliData?.remedies ?? {}, targetPlanet);
  let remediesSource: 'vm' | 'synthesized' | 'none' = templateData ? 'vm' : 'none';
  if (!templateData) {
    templateData = synthesizeTemplate(targetPlanet);
    remediesSource = 'synthesized';
    if (!isNewCalc) {
      console.warn(`[kundali] VM sent no remedies for calcType="${calcType}" — using synthesized fallback.`);
    }
  }

  return {
    ok: true,
    body: {
      success: true,
      input: { name: body.name || null, gender: body.gender || null },
      instant: {
        lagna: kundaliData.lagna?.sign || null,
        lagna_en: kundaliData.lagna?.sign_en || null,
        lagna_lord: lagnaLord,
        nakshatra: moonGraha?.nakshatra || null,
        nakshatra_lord: moonGraha?.nakshatra_lord || null,
        pada: moonGraha?.pada || null,
        chandra_rashi: moonGraha?.sign || null,
        surya_rashi: kundaliData.grahas?.find((g: any) => g.planet === 'Sun')?.sign || null,
        current_dasha: currentMahadasha,
        current_antardasha: currentAntardasha,
      },
      planets: (kundaliData.grahas || []).map((g: any) => ({
        planet: g.planet,
        sign: g.sign,
        sign_en: g.sign_en ?? null,
        house: g.house,
        nakshatra: g.nakshatra,
        is_retrograde: g.retrograde ?? g.is_retrograde ?? false,
        dignity: g.dignity || null,
        strength: typeof g.strength === 'number' ? g.strength : null,
        shadbala: g.shadbala ?? null,
        longitude: typeof g.longitude === 'number' ? g.longitude : null,
        degree_in_sign: typeof g.degree_in_sign === 'number' ? g.degree_in_sign : null,
      })),
      houses: (kundaliData.houses || []).map((h: any) => ({
        house: h.house,
        sign: h.sign,
      })),
      dasha: {
        mahadasha: currentMahadasha,
        antardasha: currentAntardasha,
        maha_dasha: mahaList,
      },
      shadbala: kundaliData?.shadbala ?? {},
      drishti: kundaliData?.drishti ?? null,
      dasamsa: kundaliData?.dasamsa ?? null,
      navamsa: kundaliData?.navamsa ?? null,
      saptamsa: kundaliData?.saptamsa ?? null,
      strongestPlanet,
      weakestPlanet,
      strengthAvailable,
      template: templateData,
      remediesSource,
      granthUpay: buildGranthUpay(kundaliData?.grahas, targetPlanet),
      kundali: {
        grahas: kundaliData?.grahas ?? [],
        lagna: kundaliData?.lagna ?? null,
        houses: kundaliData?.houses ?? [],
        dasha: kundaliData?.dasha ?? null,
      },
    },
  };
}
