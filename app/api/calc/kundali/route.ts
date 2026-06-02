// ============================================================
// File: app/api/calc/kundali/route.ts
// Purpose: VM bridge for Kundali/Nakshatra/Rashi/Lagna Calculators
// Version: v1.4
// Changelog v1.4: Removed /template call (wrong Dasha-lord remedies).
//   Added calcType param — nakshatra/rashi → Moon, lagna → lagna lord,
//   kundali/dasha → Mahadasha lord. VM remedies used directly.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  calcType?: 'kundali' | 'nakshatra' | 'rashi' | 'lagna' | 'dasha';
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

// ─── Resolve target planet based on calcType ────────────────────────────────
function resolveTargetPlanet(
  calcType: string,
  lagnaLord: string | null,
  mahadasha: string | null
): string | null {
  switch (calcType) {
    case 'nakshatra': return 'Moon';
    case 'rashi':     return 'Moon';
    case 'lagna':     return lagnaLord || null;
    case 'kundali':   return mahadasha || null;
    case 'dasha':     return mahadasha || null;
    default:          return mahadasha || null;
  }
}

// ─── Map VM remedy list to frontend remedyPlan format ───────────────────────
function buildTemplateFromVMRemedies(vmRemedies: any[], planet: string | null): any {
  if (!vmRemedies?.length) return null;

  // Planet-specific remedy details
  const PLANET_REMEDY_DETAILS: Record<string, { mantra: string; mantra_hi: string; daan: string; daan_hi: string; day: string; day_hi: string; stone: string; metal: string; finger: string; deity: string; vrat: string }> = {
    Moon:    { mantra: 'Om Chandraya Namah',    mantra_hi: 'ॐ चंद्राय नमः',       daan: 'rice, milk, silver, white cloth', daan_hi: 'चावल, दूध, चांदी, सफेद वस्त्र', day: 'Monday',    day_hi: 'सोमवार',   stone: 'Pearl (Moti)',              metal: 'Silver', finger: 'Little finger', deity: 'Lord Shiva',   vrat: 'Somvar Vrat'    },
    Mars:    { mantra: 'Om Angarakaya Namah',   mantra_hi: 'ॐ अंगारकाय नमः',      daan: 'red lentils, jaggery, copper',   daan_hi: 'मसूर दाल, गुड़, तांबा, लाल वस्त्र', day: 'Tuesday',   day_hi: 'मंगलवार',  stone: 'Red Coral (Moonga)',        metal: 'Gold',   finger: 'Ring finger',   deity: 'Hanuman ji',   vrat: 'Mangalvar Vrat' },
    Mercury: { mantra: 'Om Budhaya Namah',      mantra_hi: 'ॐ बुधाय नमः',         daan: 'green moong, green cloth, books',daan_hi: 'हरी मूंग, हरा वस्त्र, पुस्तकें',  day: 'Wednesday', day_hi: 'बुधवार',   stone: 'Emerald (Panna)',           metal: 'Gold',   finger: 'Little finger', deity: 'Ganesh ji',    vrat: 'Budhvar Vrat'   },
    Jupiter: { mantra: 'Om Gurave Namah',       mantra_hi: 'ॐ गुरवे नमः',         daan: 'yellow chana, turmeric, books',  daan_hi: 'पीला चना, हल्दी, पुस्तकें',       day: 'Thursday',  day_hi: 'गुरुवार',  stone: 'Yellow Sapphire (Pukhraj)', metal: 'Gold',   finger: 'Index finger',  deity: 'Lord Vishnu',  vrat: 'Guruvar Vrat'   },
    Venus:   { mantra: 'Om Shukraya Namah',     mantra_hi: 'ॐ शुक्राय नमः',       daan: 'white sweets, ghee, silver',     daan_hi: 'सफेद मिठाई, घी, चांदी',           day: 'Friday',    day_hi: 'शुक्रवार', stone: 'Diamond (Heera)',           metal: 'Gold',   finger: 'Middle finger', deity: 'Maa Lakshmi',  vrat: 'Shukravar Vrat' },
    Saturn:  { mantra: 'Om Shanaye Namah',      mantra_hi: 'ॐ शनैश्चराय नमः',     daan: 'black sesame, urad dal, iron',   daan_hi: 'काला तिल, उड़द दाल, लोहा',         day: 'Saturday',  day_hi: 'शनिवार',   stone: 'Blue Sapphire (Neelam)',    metal: 'Silver', finger: 'Middle finger', deity: 'Shani Dev',    vrat: 'Shanivar Vrat'  },
    Sun:     { mantra: 'Om Suryaya Namah',      mantra_hi: 'ॐ सूर्याय नमः',       daan: 'wheat, jaggery, red cloth',      daan_hi: 'गेहूं, गुड़, लाल वस्त्र',          day: 'Sunday',    day_hi: 'रविवार',   stone: 'Ruby (Manik)',              metal: 'Gold',   finger: 'Ring finger',   deity: 'Surya Dev',    vrat: 'Ravivar Vrat'   },
    Rahu:    { mantra: 'Om Rahave Namah',       mantra_hi: 'ॐ राहवे नमः',         daan: 'coconut, blue cloth, urad dal',  daan_hi: 'नारियल, नीला वस्त्र, उड़द दाल',   day: 'Saturday',  day_hi: 'शनिवार',   stone: 'Hessonite (Gomed)',         metal: 'Silver', finger: 'Middle finger', deity: 'Maa Durga',    vrat: 'Rahu Shanti'    },
    Ketu:    { mantra: 'Om Ketave Namah',       mantra_hi: 'ॐ केतवे नमः',         daan: 'multi-colour cloth, sesame',     daan_hi: 'बहुरंगी वस्त्र, तिल, कंबल',       day: 'Tuesday',   day_hi: 'मंगलवार',  stone: "Cat's Eye (Lehsunia)",      metal: 'Silver', finger: 'Little finger', deity: 'Ganesh ji',    vrat: 'Ketu Shanti'    },
  };

  const pd = PLANET_REMEDY_DETAILS[planet ?? ''] ?? PLANET_REMEDY_DETAILS['Jupiter'];

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
          return { ...base, name: pd.vrat, day: pd.day, deity: pd.deity, prasad: pd.daan };
        }
        if (r.type === 'gemstone') {
          return { ...base, lagna_stone: { stone: pd.stone, metal: pd.metal, finger: pd.finger, for: r.detail } };
        }
        return { ...base, text: r.detail };
      }),
    },
    actionWindows: [],
    avoidWindows: [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: CalcInput = await req.json();
    const calcType = body.calcType ?? 'kundali';

    // Validate
    const required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
    for (const f of required) {
      if (body[f as keyof CalcInput] === undefined || body[f as keyof CalcInput] === null) {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
      }
    }

    // Build VM payload
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

    // 1) Call VM /kundali — returns chart + remedies via remedy_master v1.1
    const kRes = await callVM('/kundali', vmPayload);
    if (!kRes.ok) {
      const errText = await kRes.text();
      console.error('[kundali] VM /kundali failed:', errText);
      return NextResponse.json({ error: 'Kundali engine error', detail: errText }, { status: 502 });
    }
    const kundaliData = await kRes.json();

    // ─── Dasha detection ────────────────────────────────────────────────────
    const mahaList = kundaliData?.dasha?.maha_dasha ?? [];
    const { mahadasha: currentMahadasha, antardasha: currentAntardasha } = getCurrentDasha(mahaList);

    // ─── Moon + Lagna ────────────────────────────────────────────────────────
    const moonGraha = kundaliData?.grahas?.find((g: any) => g.planet === 'Moon');
    const lagnaLord = kundaliData?.lagna?.sign_lord ?? null;

    // ─── Resolve correct target planet for this calcType ────────────────────
    const targetPlanet = resolveTargetPlanet(calcType, lagnaLord, currentMahadasha);

    // ─── Build templateData from VM remedies ─────────────────────────────────
    const vmRemedies: any[] = kundaliData?.remedies?.remedies ?? [];
    const templateData = buildTemplateFromVMRemedies(vmRemedies, targetPlanet);

    const sessionId = `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      sessionId,
      input: {
        name: body.name || null,
        gender: body.gender || null,
      },
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
        house: g.house,
        nakshatra: g.nakshatra,
        is_retrograde: g.is_retrograde || false,
        dignity: g.dignity || null,
      })),
      houses: (kundaliData.houses || []).map((h: any) => ({
        house: h.house,
        sign: h.sign,
      })),
      dasha: {
        mahadasha: currentMahadasha,
        antardasha: currentAntardasha,
      },
      template: templateData,
    }, { status: 200 });

  } catch (err: any) {
    console.error('[kundali] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
