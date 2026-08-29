// ============================================================
// File: app/api/calc/kundali/route.ts
// Purpose: VM bridge for Kundali / Nakshatra / Rashi / Lagna /
//          Dasha + Shadbala-based Calculators
// Version: v1.9
// Changelog v1.9 (2026-08-29):
//   - Passthrough drishti + dasamsa from the VM (astro.py patcher #2).
//     Needed by the IAS / Foreign Settlement / Foreign Spouse calculators.
//   - ADDITIVE ONLY. No existing field renamed, reshaped or removed, so
//     every current calculator keeps the exact response it has today.
// Changelog v1.8 (2026-06-17):
//   - Pass through planetary DEGREES for the Gemstone Engine v2.1
//     (combustion / astangata): planets[].longitude + degree_in_sign.
//     VM already returns these (confirmed) — pure passthrough.
//   - FIX: VM returns `retrograde` (not `is_retrograde`). The old
//     mapping read g.is_retrograde → always false. Now reads
//     g.retrograde with fallback. Needed for retro combustion limits.
//   - Also passes planets[].sign_en (English sign) for robustness.
//   - Zero change to any other logic / calcType.
// Changelog v1.7:
//   - graha-bal now targets the WEAKEST planet for its remedy/Dos
//     template. Strongest planet still surfaced via `strongestPlanet`.
// Changelog v1.6:
//   - Added calcTypes: graha-bal, lucky-day, weak-planet,
//     kundali-strength, lagna-bal, shadbala, gemstone.
//   - resolveTargetPlanet() resolves strongest/weakest planet.
//   - Passthrough: planets[].strength, planets[].shadbala,
//     top-level shadbala, strongestPlanet, weakestPlanet, strengthAvailable.
//   - SYNTHESIZED REMEDY FALLBACK for new calcTypes only (zero regression).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// New calc types that may rely on synthesized remedies + strength data
const NEW_CALC_TYPES = [
  'graha-bal',
  'lucky-day',
  'weak-planet',
  'kundali-strength',
  'lagna-bal',
  'shadbala',
  'gemstone',
];

interface CalcInput {
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
          return { ...base, lagna_stone: { stone: pd.stone, metal: pd.metal, finger: pd.finger, for: r.detail } };
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

export async function POST(req: NextRequest) {
  try {
    const body: CalcInput = await req.json();
    const calcType = body.calcType ?? 'kundali';
    const isNewCalc = NEW_CALC_TYPES.includes(calcType);

    const required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
    for (const f of required) {
      if (body[f as keyof CalcInput] === undefined || body[f as keyof CalcInput] === null) {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
      }
    }

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

    // 1) Call VM /kundali — remedies + actionWindows via remedy_master v1.1
    const kRes = await callVM('/kundali', {
      method: 'POST',
      body: JSON.stringify(vmPayload),
    });
    if (!kRes.ok) {
      const errText = await kRes.text();
      console.error('[kundali] VM /kundali failed:', errText);
      return NextResponse.json({ error: 'Kundali engine error', detail: errText }, { status: 502 });
    }
    const kundaliData = await kRes.json();

    const mahaList = kundaliData?.dasha?.maha_dasha ?? [];
    const { mahadasha: currentMahadasha, antardasha: currentAntardasha } = getCurrentDasha(mahaList);
    const moonGraha = kundaliData?.grahas?.find((g: any) => g.planet === 'Moon');
    const lagnaLord = kundaliData?.lagna?.sign_lord ?? null;

    // ── Strongest / weakest planet (excludes Rahu/Ketu) ──
    const grahas = kundaliData?.grahas ?? [];
    const realPlanets = grahas.filter((g: any) => !['Rahu', 'Ketu'].includes(g.planet));
    const sorted = [...realPlanets].sort((a, b) => (planetStrength(b) ?? 0) - (planetStrength(a) ?? 0));
    const strongestPlanet: string | null = sorted[0]?.planet ?? null;
    const weakestPlanet: string | null = sorted.length ? sorted[sorted.length - 1]?.planet ?? null : null;
    const strengthAvailable: boolean = realPlanets.some((g: any) => typeof g?.strength === 'number');

    const targetPlanet = resolveTargetPlanet(
      calcType, lagnaLord, currentMahadasha, strongestPlanet, weakestPlanet
    );

    // Pass full remedies object — includes remedies array + actionWindows
    let templateData = buildTemplateFromVMRemedies(kundaliData?.remedies ?? {}, targetPlanet);

    // synthesize remedies for NEW calc types if VM returned none
    if (!templateData && isNewCalc) {
      templateData = synthesizeTemplate(targetPlanet);
    }

    const sessionId = `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      sessionId,
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
        // v1.8 FIX: VM field is `retrograde` (was reading is_retrograde → always false)
        is_retrograde: g.retrograde ?? g.is_retrograde ?? false,
        dignity: g.dignity || null,
        strength: typeof g.strength === 'number' ? g.strength : null,
        shadbala: g.shadbala ?? null,
        // ── v1.8: degrees for combustion (Gemstone Engine v2.1) ──
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
      },
      shadbala: kundaliData?.shadbala ?? {},
      // v1.9: passthrough of the two fields added to the VM engine on
      // 29 Aug 2026. Both are plain passthrough — nothing is reshaped here.
      //   drishti : BPHS Ch.26 sputa drishti, planet->planet and planet->house,
      //             each row carrying virupas (60 = full aspect) and is_node.
      //   dasamsa : the D-10 chart. BPHS Ch.6 names Dasamsa as the varga to
      //             read for career, which is what the IAS calculator needs.
      // Null when the VM has not been patched yet, so callers must guard.
      drishti: kundaliData?.drishti ?? null,
      dasamsa: kundaliData?.dasamsa ?? null,
      strongestPlanet,
      weakestPlanet,
      strengthAvailable,
      template: templateData,
    }, { status: 200 });

  } catch (err: any) {
    console.error('[kundali] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
