// ============================================================
// File: lib/calc-core/yog.ts
// Version: v1.0 — 4 Oct 2026 — PEHLA CORE (MCP programme, Batch B0)
//
// KYA HAI: /api/calc/yog ka poora "dimaag" — VM se kundali, granth saar,
// engine ka score, aur free/paid ka aakaar — EK jagah, bina Next.js ke.
//   * Website:  app/api/calc/yog/route.ts (v4.6) isi ko bulata hai.
//   * MCP:      VM par mcp-server/ isi file ko bulata hai.
// Do jagah ek hi formula = kabhi alag jawab nahi.
//
// NIYAM (is file ke liye):
//   1. Koi `next/*`, `@/` alias, `process.env`, crypto, Supabase NAHI.
//      Sirf relative import — taaki VM par bina Next.js ke chale.
//   2. VM tak pahunchna CALLER ka kaam hai (VmCaller inject hota hai).
//   3. Payment ki jaanch CALLER karta hai; core ko sirf `paid` milta hai.
//   4. Behaviour route v4.5 se BYTE-SE-BYTE same — 4 Oct 2026 ko Rohiit ke
//      apne chart (23-09-1975 16:55 New Delhi) ke asli VM jawab par purane
//      aur naye route ka output mila kar jaancha gaya.
// ============================================================

import type { CalcData, ScoredRule } from '../yog-engine';
import { scoreUpsc } from '../upsc-engine';
import { scoreForeignSettlement } from '../foreign-settlement-engine';
import { scoreForeignSpouse } from '../foreign-spouse-engine';
import { scoreSecondMarriage } from '../second-marriage-engine';
import { healthFromGranth } from '../health-engine';
import { loveFromGranth } from '../love-arranged-engine';
import { lifeSpanFromGranth } from '../life-span-engine';
import { scoreSantan } from '../santan-engine';
import type { DashaPeriod, SantanResult } from '../santan-engine';
import { scoreVivah } from '../vivah-engine';
import type { VivahResult } from '../vivah-engine';

// ── Types ────────────────────────────────────────────────────────────────────

export const YOG_TYPES = [
  'upsc', 'foreign-settlement', 'foreign-spouse', 'santan', 'vivah',
  'second-marriage', 'health-insight', 'love-arranged', 'life-span',
] as const;

export type YogType = typeof YOG_TYPES[number];

/** Poora muft (Rohiit, 22 Sep 2026) — paid ho ya na ho, sab khula. */
export const YOG_ALWAYS_OPEN: YogType[] = ['love-arranged', 'life-span'];

export interface YogBirth {
  year: number; month: number; day: number;
  hour: number; minute: number;
  latitude: number; longitude: number;
  timezone: number;
  name?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
}

/** Minimal Response jaisa — website mein fetch Response, VM par bhi fetch. */
export interface VmResponse {
  ok: boolean;
  status: number;
  json(): Promise<any>;
  text(): Promise<string>;
}

/** Caller deta hai: path ('/kundali') + body → VM ka jawab. */
export type VmCaller = (path: string, body: Record<string, unknown>) => Promise<VmResponse>;

export type YogOutcome =
  | { ok: false; status: number; error: string }
  | {
      ok: true;
      /** Route isme sessionId jod kar seedha lautata hai. */
      body: Record<string, unknown>;
      /** Logging / MCP ke liye. */
      meta: { khula: boolean; full: any; granth: any };
    };

// ── Granth product map ───────────────────────────────────────────────────────

// ⭐ 21 September 2026 — CALCULATOR GRANTH PAR.
// Har calculator ka apna product calc_varga_map mein hai — VM wahi padh kar
// bhav ki TEEN PARAT, karak, KAB, FAISLA aur SAAR deta hai.
export const YOG_TO_PRODUCT: Record<YogType, string> = {
  upsc:                 'ias-govt-job',
  'foreign-settlement': 'foreign-settlement',
  'foreign-spouse':     'foreign-spouse',
  'second-marriage':    'second-marriage',
  'health-insight':     'health-insight',
  'love-arranged':      'love-arranged',
  'life-span':          'ayushya',
  santan:               'santan-yog',
  vivah:                'shadi-kab-hogi',
};

export function isYogType(t: unknown): t is YogType {
  return typeof t === 'string' && (YOG_TYPES as readonly string[]).includes(t);
}

/** Birth fields ki jaanch. Galti ho to sandesh, warna null. */
export function yogBirthError(b: Partial<YogBirth>): string | null {
  const nums: (keyof YogBirth)[] = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
  for (const k of nums) {
    if (typeof b[k] !== 'number' || Number.isNaN(b[k] as number)) {
      return `Missing or invalid birth detail: ${k}.`;
    }
  }
  return null;
}

async function fetchGranthYog(vm: VmCaller, product: string, b: YogBirth, paid: boolean) {
  try {
    const r = await vm('/granth/product', {
      product,
      year: b.year, month: b.month, day: b.day,
      hour: b.hour, minute: b.minute,
      latitude: b.latitude, longitude: b.longitude,
      timezone: b.timezone ?? 5.5,
      tier: paid ? 'paid' : 'free',
      // VIVAH/FOREIGN-SPOUSE: granth_api v2.8 ling dekh kar karak chunta
      // hai — stree par GURU, purush par Shukra (Rohiit, 3 Sep).
      ling: b.gender ?? null,
      bhasha: 'hinglish',
    });
    if (!r.ok) {
      console.error(`[yog] granth ${product}: ${r.status}`);
      return null;
    }
    const j = await r.json();
    // ⚠️ VM 200 ke saath bhi "galti" laut sakta hai — chup-chaap mat nigalo
    if (j?.galti) {
      console.error(`[yog] granth ${product}: ${j.galti}`);
      return null;
    }
    return j;
  } catch (e: any) {
    console.error(`[yog] granth fetch failed: ${e?.message}`);
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

export async function runYog(args: {
  type: YogType;
  birth: YogBirth;
  paid: boolean;
  vm: VmCaller;
}): Promise<YogOutcome> {
  const { type, birth: b, paid, vm } = args;
  const khula = paid || YOG_ALWAYS_OPEN.includes(type);

  // ── 1) Chart from the VM ───────────────────────────────────────────────────
  const vmRes = await vm('/kundali', {
    year: b.year, month: b.month, day: b.day,
    hour: b.hour, minute: b.minute, second: 0,
    latitude: b.latitude, longitude: b.longitude,
    timezone: b.timezone, ayanamsa: 'lahiri',
  });

  if (!vmRes.ok) {
    const detail = await vmRes.text().catch(() => '');
    console.error('[yog] VM /kundali failed:', detail);
    return { ok: false, status: 502, error: 'Kundali engine error' };
  }

  const k = await vmRes.json();

  // ── 2) Reshape into what the engines expect ────────────────────────────────
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
    // D-7 Saptamsa — the progeny varga (BPHS Ch.6 s.11). Null until
    // astro.py patcher #4 has run, so an engine must guard rather than assume.
    saptamsa: k?.saptamsa && Object.keys(k.saptamsa).length ? k.saptamsa : null,
  };
  data.instant.current_dasha = data.dasha.mahadasha;
  data.instant.current_antardasha = data.dasha.antardasha;

  if (!data.planets.length || !data.houses.length) {
    return { ok: false, status: 502, error: 'Chart could not be built from the birth details.' };
  }

  // ── 3) Granth (VM) — score se PEHLE. Health ka score yahi se aata hai.
  const granth = await fetchGranthYog(vm, YOG_TO_PRODUCT[type] ?? type, b, khula);
  console.log(`[yog] granth ${type} | ${granth ? 'mila' : 'NAHI mila'} | saar ${granth?.saar?.shabd ?? 0} shabd | faisla ${granth?.faisla?.faisla ?? '—'}`);
  // 🔴 SURAKSHA: VM na mile to KHAALI data se jhootha nateeja kabhi nahi.
  if (type === 'love-arranged' && !granth?.love) {
    return { ok: false, status: 503, error: 'Engine abhi uplabdh nahi — kripya thodi der mein dobara koshish karein.' };
  }
  if (type === 'life-span' && !granth?.faisla?.aayu) {
    return { ok: false, status: 503, error: 'Ayushya engine abhi uplabdh nahi — kripya thodi der mein dobara koshish karein.' };
  }
  if (type === 'health-insight' && !granth?.jeevan) {
    return { ok: false, status: 503, error: 'Health engine abhi uplabdh nahi — kripya thodi der mein dobara koshish karein.' };
  }

  // ── 3b) Score ──────────────────────────────────────────────────────────────
  const timeline = dashaTimeline(k?.dasha?.maha_dasha ?? []);

  const full =
    type === 'upsc' ? scoreUpsc(data)
    : type === 'foreign-settlement' ? scoreForeignSettlement(data)
    : type === 'santan' ? scoreSantan(data, timeline, b.name ?? null, b.year)
    : type === 'vivah' ? scoreVivah(data, timeline, b.name ?? null, b.year, b.gender ?? null)
    : type === 'second-marriage' ? scoreSecondMarriage(data)
    : type === 'health-insight' ? healthFromGranth(granth.jeevan)
    : type === 'love-arranged' ? loveFromGranth(granth.love)
    : type === 'life-span' ? lifeSpanFromGranth(granth.faisla.aayu)
    : scoreForeignSpouse(data);

  // 🔴 21 Sep — GEMINI BILKUL BAND. Saar ab granth se aata hai (VM saar.py).
  const verdictSummary = '';

  const body: Record<string, unknown> = {
    success: true,
    type,
    paid: khula,
    input: { name: b.name || null, gender: b.gender || null },
    granth: granth ? {
      saar:   granth.saar ?? null,
      faisla: granth.faisla ?? null,
      bhav:   granth.bhav ?? [],
      karak:  granth.karak ?? [],
      kab:    granth.kab ?? null,
      varga:  granth.varga ?? null,
    } : null,
    chart: {
      lagna: data.instant.lagna,
      lagna_en: data.instant.lagna_en,
      lagna_lord: data.instant.lagna_lord,
      mahadasha: data.dasha.mahadasha,
      antardasha: data.dasha.antardasha,
      dasamsaLagna: data.dasamsa?.lagna?.sign ?? null,
      navamsaLagna: data.navamsa?.lagna?.sign ?? null,
      saptamsaLagna: data.saptamsa?.lagna?.sign ?? null,
    },
    result:
      type === 'santan'
        ? paid
          ? { ...(full as SantanResult), summary: verdictSummary }
          : santanFreeShape(full as SantanResult, verdictSummary)
      : type === 'vivah'
        ? paid
          ? { ...(full as VivahResult), summary: verdictSummary }
          : vivahFreeShape(full as VivahResult, verdictSummary)
      : khula
        ? full
        : freeShape(full),
  };

  return { ok: true, body, meta: { khula, full, granth } };
}

// ── Free-tier shaping ────────────────────────────────────────────────────────

/** Strip a rule to its label and marks. The reasoning IS the product. */
function lockRule(r: ScoredRule) {
  return { block: r.block, label: r.label, points: r.points, max: r.max, absent: r.absent };
}

/** Teaser: chart ki ek SACH baat, parinaam se pehle ruk jaata hai. */
function teaser(r: ScoredRule): string {
  const first = r.reason.split('. ')[0] ?? '';
  // ⭐ 22 Sep — vaakya pehle se '.' par khatam ho to dobara '.' nahi
  const saaf = first.replace(/[.\u0964]+$/, '');
  return saaf.length > 130 ? saaf.slice(0, 127).trimEnd() + '\u2026' : saaf + '.';
}

function freeShape(full: any) {
  const rules: ScoredRule[] = full.rules ?? [];
  const shown: ScoredRule[] = full.highlights ?? [];
  const shownLabels = new Set(shown.map((r) => r.label));
  const rest = rules.filter((r) => !shownLabels.has(r.label));

  return {
    score: full.score,
    band: full.band,
    bandHi: full.bandHi,
    bandLabel: full.bandLabel,      // ⭐ 22 Sep — health: "Dhyan Rakhein" ("Weak" nahi)
    disclaimer: full.disclaimer,
    highlights: shown,
    rules: rest.map(lockRule),
    lockedCount: rest.length,
    blockers: (full.blockers ?? []).map((b: ScoredRule) => ({ label: b.label, teaser: teaser(b) })),
    directionNames: (full.direction ?? full.routes ?? []).map((d: any) => d.track ?? d.route),
    directionHintCount: (full.directionHints ?? []).length,
    timingCount: (full.timing ?? []).length,
    nextStep: full.nextStep ?? null,
  };
}

/** Santan + Vivah ka ek hi free aakaar — teen taale, beech wala product se. */
function verdictFreeShape(
  full: { verdict: unknown; score: number; band: string; bandHi: string; disclaimer: string;
          windows: unknown[]; upay: unknown[] },
  summary: string,
  middle: { key: string; title: string; teaser: string; count: number },
) {
  return {
    verdict: full.verdict,
    summary,
    score: full.score,
    band: full.band,
    bandHi: full.bandHi,
    disclaimer: full.disclaimer,
    locks: [
      {
        key: 'kab',
        title: 'Kab — anukool samay',
        teaser: full.windows.length
          ? 'Aapke chart mein anukool dasha ki khidkiyan mil gayi hain, tareekhon ke saath.'
          : 'Aapki dasha ka poora hisaab taiyar hai.',
        count: full.windows.length,
      },
      middle,
      {
        key: 'upay',
        title: 'Trikaal Upay — 5 upay, aapke apne chart ke',
        teaser: 'Do BPHS se, do Bhrigu paddhati se, aur ek seedha aapke chart ki ganit se.',
        count: full.upay.length,
      },
    ],
  };
}

function santanFreeShape(full: SantanResult, summary: string) {
  return verdictFreeShape(full, summary, {
    key: 'kitne',
    title: 'Kitne — santan sankhya ka range',
    teaser: full.sankhya
      ? 'Aapke panchma bhava ki rashi aur uske swami ke bal se shastriya sanket nikal aaya hai.'
      : 'Shastriya sanket taiyar hai.',
    count: full.sankhya ? 1 : 0,
  });
}

function vivahFreeShape(full: VivahResult, summary: string) {
  return verdictFreeShape(full, summary, {
    key: 'umar',
    title: 'Kis umar mein — anukool umar ka range',
    teaser: full.umar
      ? 'Aapki pehli anukool dasha khidki ko aapki umar mein badal kar range nikal aayi hai.'
      : 'Umar ka hisaab taiyar hai.',
    count: full.umar ? 1 : 0,
  });
}

// ── Dasha helpers ────────────────────────────────────────────────────────────

/** Poori timeline, tareekhon ke saath (santan/vivah "kab" ke liye). */
function dashaTimeline(mahaList: any[]): DashaPeriod[] {
  if (!Array.isArray(mahaList)) return [];
  return mahaList
    .filter((m) => m?.planet && m?.start && m?.end)
    .map((m) => ({
      planet: String(m.planet),
      start: String(m.start),
      end: String(m.end),
      antar: (m.antar ?? [])
        .filter((a: any) => a?.planet && a?.start && a?.end)
        .map((a: any) => ({ planet: String(a.planet), start: String(a.start), end: String(a.end) })),
    }));
}

/** Aaj ki mahadasha / antardasha. */
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
