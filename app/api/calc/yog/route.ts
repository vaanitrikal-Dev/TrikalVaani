// ============================================================
// File: app/api/calc/yog/route.ts
// Version: v2.3 — Santan v2.0: dasha DATES + Gemini summary (2 Sep 2026)
//
// CHANGELOG v2.3 (2026-09-02):
//   1. THE DATES WERE ALWAYS HERE AND WE THREW THEM AWAY. currentDasha() read
//      maha.start and maha.end purely to decide which period is running now,
//      then passed the planet NAMES on and dropped the dates. "Kab hogi" is
//      the single most searched santan question — ~18 of the Radar keywords in
//      that cluster — and the answer was sitting in the VM response the whole
//      time. dashaTimeline() now hands the whole timeline to the santan engine
//      as a second argument.
//      WHY A SECOND ARGUMENT AND NOT A FIELD ON CalcData: CalcData lives in
//      lib/yog-engine.ts, which the other three live calculators share. Adding
//      to it would put them all in the blast radius of a santan-only change.
//      scoreSantan(data, timeline) touches nothing they use.
//   2. GEMINI WRITES THE SUMMARY — lib/santan-summary.ts. Free 75 words on
//      gemini-3.7-flash, paid 500 on gemini-3.8-flash. Gemini receives ONLY
//      the engine's `facts` object, never the chart, and its draft is validated
//      before it is returned. Santan only; the other three types never call it.
//   3. FREE SHAPE for santan is its own function. The generic freeShape() sells
//      locked RULES, which is right for an exam calculator and wrong here — a
//      person asking about children needs the answer first and the arithmetic
//      never. Free now returns verdict + summary + three named locks (dates,
//      count, upay) and no reasoning at all. The other three types keep
//      freeShape() byte for byte.
//   4. `directionHints` is gone from the santan path, replaced by `upay`.
// Purpose: Server-side scoring for the four yog calculators —
//          IAS/UPSC, Videsh Settlement, Foreign Spouse and Santan Yog.
//
// CHANGELOG v2.2 (2026-09-02):
//   - `santan` added to YogType, VALID and the scoring dispatch, wired to
//     lib/santan-engine.ts. Three lines of behaviour; everything else in this
//     file is untouched, so the three live calculators keep the exact
//     response they have today.
//   - `saptamsaLagna` added to the `chart` summary, alongside the D-10 and
//     D-9 lagnas that were already there. The Santan page shows it as proof
//     the progeny varga was actually read.
//   - NOTE ON THE PAID GATE: santan uses the SAME `yog` product key, so it is
//     Rs 51 / $7 like the other three and lib/pricing-intl.ts needs no change.
//   - NOTE ON THE MEDICAL LINE: the santan engine returns its own disclaimer
//     (SANTAN_DISCLAIMER) which names a doctor. `freeShape` already passes
//     `full.disclaimer` straight through, so the medical sentence reaches the
//     FREE tier too. Do not "simplify" that to the shared DISCLAIMER.
//
// CHANGELOG v2.0 (2026-08-29):
//   - Free / paid split. The FREE response no longer CONTAINS the paid
//     content. That is the whole point: hiding paid text behind CSS while
//     still shipping it in the JSON is not a paywall, it is a suggestion.
//   - Two payment paths, and BOTH re-verified here rather than trusted from
//     the browser:
//       Razorpay : HMAC-SHA256 over `order_id|payment_id`, the same check
//                  app/api/verify-payment/route.ts already performs.
//       PayPal   : the order is fetched back FROM PayPal and must return
//                  COMPLETED, in USD, for exactly the catalogue amount.
//     A forged id fails both.
//   - A proof that was SENT but did not verify returns 402, never a silent
//     downgrade — a real payer must never quietly get the free view.
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
import crypto from 'crypto';
import { callVM } from '@/lib/callVM';
import type { CalcData, ScoredRule } from '@/lib/yog-engine';
import { scoreUpsc } from '@/lib/upsc-engine';
import { scoreForeignSettlement } from '@/lib/foreign-settlement-engine';
import { scoreForeignSpouse } from '@/lib/foreign-spouse-engine';
import { scoreSantan } from '@/lib/santan-engine';
import type { DashaPeriod, SantanResult } from '@/lib/santan-engine';
import { buildSantanSummary } from '@/lib/santan-summary';
import { getProduct } from '@/lib/pricing-intl';
import { getPayPalOrder, isCaptureValid } from '@/lib/paypal-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type YogType = 'upsc' | 'foreign-settlement' | 'foreign-spouse' | 'santan';

const VALID: YogType[] = ['upsc', 'foreign-settlement', 'foreign-spouse', 'santan'];

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
  // Payment proof. Either set, or neither for the free tier.
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  paypal_order_id?: string;
}

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

// ── Payment verification ─────────────────────────────────────────────────────

function razorpayValid(b: Body): boolean {
  const { razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: sig } = b;
  if (!o || !p || !sig) return false;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('[yog] RAZORPAY_KEY_SECRET missing — refusing to unlock.');
    return false;
  }
  const expected = crypto.createHmac('sha256', secret).update(`${o}|${p}`).digest('hex');
  const a = Buffer.from(expected);
  const c = Buffer.from(sig);
  // Lengths must match before timingSafeEqual, which throws otherwise.
  return a.length === c.length && crypto.timingSafeEqual(a, c);
}

async function paypalValid(b: Body): Promise<boolean> {
  if (!b.paypal_order_id) return false;
  const product = getProduct('yog');
  if (!product) return false;
  try {
    const order = await getPayPalOrder(b.paypal_order_id);
    return isCaptureValid(order, product.usdCents);
  } catch (e) {
    console.error('[yog] PayPal re-verification failed:', e);
    return false;
  }
}

async function isPaid(b: Body): Promise<boolean> {
  if (b.razorpay_signature) return razorpayValid(b);
  if (b.paypal_order_id) return await paypalValid(b);
  return false;
}

// ── Free-tier shaping ────────────────────────────────────────────────────────

/** Strip a rule to its label and marks. The reasoning IS the product. */
function lockRule(r: ScoredRule) {
  return { block: r.block, label: r.label, points: r.points, max: r.max, absent: r.absent };
}

/**
 * A teaser states something TRUE and specific about this chart and stops
 * before the consequence. "Aapka Amatyakaraka Guru hai" is a real finding;
 * what its placement means for an exam route is the paid half.
 */
function teaser(r: ScoredRule): string {
  const first = r.reason.split('. ')[0] ?? '';
  return first.length > 130 ? first.slice(0, 127).trimEnd() + '\u2026' : first + '.';
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
    disclaimer: full.disclaimer,
    // Full reasoning for the three strongest findings — the proof of work.
    highlights: shown,
    // Everything else: marks visible, reasoning withheld.
    rules: rest.map(lockRule),
    lockedCount: rest.length,
    // Blockers are why people pay. Name them, tease them, stop.
    blockers: (full.blockers ?? []).map((b: ScoredRule) => ({ label: b.label, teaser: teaser(b) })),
    // Names only. The ranking and the reasoning are paid.
    directionNames: (full.direction ?? full.routes ?? []).map((d: any) => d.track ?? d.route),
    directionHintCount: (full.directionHints ?? []).length,
    timingCount: (full.timing ?? []).length,
    nextStep: full.nextStep ?? null,
  };
}

// ── Route ────────────────────────────────────────────────────────────────────

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

    const paid = await isPaid(b);

    // A proof that was sent but did not verify is an ERROR, not a silent
    // downgrade — a real payer must never quietly receive the free view.
    if (!paid && (b.razorpay_signature || b.paypal_order_id)) {
      return bad('Payment could not be verified. Please contact support before paying again.', 402);
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
      // D-7 Saptamsa — the progeny varga (BPHS Ch.6 s.11). Null until
      // astro.py patcher #4 has run, so an engine must guard rather than
      // assume it is there.
      saptamsa: k?.saptamsa && Object.keys(k.saptamsa).length ? k.saptamsa : null,
    };
    data.instant.current_dasha = data.dasha.mahadasha;
    data.instant.current_antardasha = data.dasha.antardasha;

    if (!data.planets.length || !data.houses.length) {
      return NextResponse.json({ error: 'Chart could not be built from the birth details.' }, { status: 502 });
    }

    // ── 3) Score ─────────────────────────────────────────────────────────────
    const timeline = dashaTimeline(k?.dasha?.maha_dasha ?? []);

    const full =
      type === 'upsc' ? scoreUpsc(data)
      : type === 'foreign-settlement' ? scoreForeignSettlement(data)
      : type === 'santan' ? scoreSantan(data, timeline)
      : scoreForeignSpouse(data);

    if (paid) {
      console.log(`[yog] PAID unlock | type:${type} | via:${b.razorpay_signature ? 'razorpay' : 'paypal'}`);
    }

    // ── 4) Summary — santan only ─────────────────────────────────────────────
    // Never fatal: buildSantanSummary falls back to a deterministic template on
    // a missing key, a timeout, or a draft that fails validation. The
    // calculator must always answer.
    let santanSummary = '';
    if (type === 'santan') {
      const s = await buildSantanSummary((full as SantanResult).facts, paid);
      santanSummary = s.text;
      console.log(`[yog] santan summary | ${s.source} | ${s.words} words | paid:${paid}`);
    }

    return NextResponse.json({
      success: true,
      type,
      paid,
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
        // D-7. Null when the VM has not been patched — the page must say
        // "not available" rather than imply the progeny varga was read.
        saptamsaLagna: data.saptamsa?.lagna?.sign ?? null,
      },
      result:
        type === 'santan'
          ? paid
            ? { ...(full as SantanResult), summary: santanSummary }
            : santanFreeShape(full as SantanResult, santanSummary)
          : paid
            ? full
            : freeShape(full),
    });
  } catch (err: any) {
    console.error('[yog] Fatal:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── v2.3: the whole timeline, dates intact ───────────────────────────────────
//
// currentDasha() below answers "which period is running". This answers "when",
// which is a different question and the one santan customers actually ask.
// Shape is passed through as the VM gives it; the engine does the filtering.
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

// ── v2.3: santan's own free shape ────────────────────────────────────────────
//
// Deliberately NOT freeShape(). That one shows locked rule rows with their
// marks, which suits a competitive-exam score. Here the marks mean nothing to
// the reader and the answer means everything, so the free tier is: the verdict,
// the 75-word summary, and three honest locks naming what is behind them.
function santanFreeShape(full: SantanResult, summary: string) {
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
      {
        key: 'kitne',
        title: 'Kitne — santan sankhya ka range',
        teaser: full.sankhya
          ? 'Aapke panchma bhava ki rashi aur uske swami ke bal se shastriya sanket nikal aaya hai.'
          : 'Shastriya sanket taiyar hai.',
        count: full.sankhya ? 1 : 0,
      },
      {
        key: 'upay',
        title: 'Trikaal Upay — 5 upay, aapke apne chart ke',
        teaser: 'Do BPHS se, do Bhrigu paddhati se, aur ek aapke sabse kamzor santan graha ki ganit se.',
        count: full.upay.length,
      },
    ],
    // No rules, no reasoning, no dates, no upay text. Nothing to unhide.
  };
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
