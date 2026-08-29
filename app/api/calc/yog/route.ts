// ============================================================
// File: app/api/calc/yog/route.ts
// Version: v1.0
// Purpose: Server-side scoring for the three yog calculators —
//          IAS/UPSC, Videsh Settlement, and Foreign Spouse.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ------------------------------------------------------------
// WHY ONE ROUTE AND NOT THREE
//   The three engines take the same chart and differ only in which rules
//   they run. One route with a `type` means one file to deploy and one
//   place to fix if the VM contract ever changes.
//
// WHY SERVER-SIDE AT ALL
//   The other calculators score in the browser, and for them that is right.
//   These three are different on two counts. Each engine is ~300 lines, so
//   shipping three of them to the client would weigh the pages down against
//   the sub-500ms target. And the reason lines ARE the product here — the
//   classical rules are public in BPHS, but this scoring and this wording
//   are not, and a client bundle hands both to anyone who opens devtools.
//
// WHAT IT DOES NOT DO
//   No prediction. Every response is a yog STRENGTH score with its reasoning,
//   and `disclaimer` is returned on every single call so the page cannot
//   render a result without it.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';
import type { CalcData } from '@/lib/yog-engine';
import { scoreUpsc } from '@/lib/upsc-engine';
import { scoreForeignSettlement } from '@/lib/foreign-settlement-engine';
import { scoreForeignSpouse } from '@/lib/foreign-spouse-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type YogType = 'upsc' | 'foreign-settlement' | 'foreign-spouse';

const VALID: YogType[] = ['upsc', 'foreign-settlement', 'foreign-spouse'];

interface Body {
  type?: YogType;
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  latitude?: number;
  longitude?: number;
  timezone?: number;
  name?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json().catch(() => ({}))) as Body;

    const type = b.type;
    if (!type || !VALID.includes(type)) {
      return bad(`Unknown calculator type. Expected one of: ${VALID.join(', ')}.`);
    }

    const nums: (keyof Body)[] = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
    for (const k of nums) {
      if (typeof b[k] !== 'number' || Number.isNaN(b[k] as number)) {
        return bad(`Missing or invalid birth detail: ${k}.`);
      }
    }

    // ── 1) Chart from the VM ─────────────────────────────────────────────────
    const vmRes = await callVM('/kundali', {
      method: 'POST',
      body: JSON.stringify({
        year: b.year, month: b.month, day: b.day,
        hour: b.hour, minute: b.minute, second: 0,
        latitude: b.latitude, longitude: b.longitude,
        timezone: b.timezone, ayanamsa: 'lahiri',
      }),
    });

    if (!vmRes.ok) {
      const detail = await vmRes.text().catch(() => '');
      console.error('[yog] VM /kundali failed:', detail);
      return NextResponse.json({ error: 'Kundali engine error' }, { status: 502 });
    }

    const k = await vmRes.json();

    // ── 2) Reshape into what the engines expect ──────────────────────────────
    const data: CalcData = {
      instant: {
        lagna: k?.lagna?.sign ?? null,
        lagna_en: k?.lagna?.sign_en ?? null,
        lagna_lord: k?.lagna?.sign_lord ?? null,
        current_dasha: null,
        current_antardasha: null,
      },
      planets: (k?.grahas ?? []).map((g: any) => ({
        planet: g.planet,
        sign: g.sign ?? null,
        sign_en: g.sign_en ?? null,
        house: g.house ?? 1,
        nakshatra: g.nakshatra ?? null,
        is_retrograde: g.retrograde ?? false,
        dignity: g.shadbala?.classification ?? g.dignity ?? null,
        strength: typeof g.strength === 'number' ? g.strength : null,
        shadbala: g.shadbala ?? null,
        longitude: typeof g.longitude === 'number' ? g.longitude : null,
        degree_in_sign: typeof g.degree_in_sign === 'number' ? g.degree_in_sign : null,
      })),
      // The VM calls them bhavas; the engines read houses.
      houses: (k?.bhavas ?? []).map((h: any) => ({ house: h.bhava, sign: h.sign ?? null })),
      dasha: currentDasha(k?.dasha?.maha_dasha ?? []),
      drishti: k?.drishti && Object.keys(k.drishti).length ? k.drishti : null,
      dasamsa: k?.dasamsa && Object.keys(k.dasamsa).length ? k.dasamsa : null,
      navamsa: k?.navamsa && Object.keys(k.navamsa).length ? k.navamsa : null,
    };
    data.instant.current_dasha = data.dasha.mahadasha;
    data.instant.current_antardasha = data.dasha.antardasha;

    if (!data.planets.length || !data.houses.length) {
      return NextResponse.json({ error: 'Chart could not be built from the birth details.' }, { status: 502 });
    }

    // ── 3) Score ─────────────────────────────────────────────────────────────
    const result =
      type === 'upsc' ? scoreUpsc(data)
      : type === 'foreign-settlement' ? scoreForeignSettlement(data)
      : scoreForeignSpouse(data);

    return NextResponse.json({
      success: true,
      type,
      sessionId: `yog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      input: { name: b.name || null, gender: b.gender || null },
      chart: {
        lagna: data.instant.lagna,
        lagna_en: data.instant.lagna_en,
        lagna_lord: data.instant.lagna_lord,
        mahadasha: data.dasha.mahadasha,
        antardasha: data.dasha.antardasha,
        dasamsaLagna: data.dasamsa?.lagna?.sign ?? null,
        navamsaLagna: data.navamsa?.lagna?.sign ?? null,
      },
      result,
    });
  } catch (err: any) {
    console.error('[yog] Fatal:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── Current mahadasha / antardasha by date ───────────────────────────────────

function currentDasha(mahaList: any[]): { mahadasha: string | null; antardasha: string | null } {
  if (!Array.isArray(mahaList) || !mahaList.length) return { mahadasha: null, antardasha: null };
  const today = new Date();

  let maha = mahaList.find((m) => new Date(m.start) <= today && today <= new Date(m.end));
  if (!maha) maha = mahaList[mahaList.length - 1];

  const antarList = maha?.antar ?? [];
  let antar = antarList.find((a: any) => new Date(a.start) <= today && today <= new Date(a.end));
  if (!antar && antarList.length) antar = antarList[0];

  return { mahadasha: maha?.planet ?? null, antardasha: antar?.planet ?? null };
}
