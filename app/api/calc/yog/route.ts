// ============================================================
// File: app/api/calc/yog/route.ts
// Version: v4.6 — DIMAAG lib/calc-core/yog.ts mein gaya (MCP programme B0) — 4 Oct 2026
//   * VM kundali, granth, score aur free/paid aakaar ab runYog() mein —
//     website aur VM ka MCP dono EK hi file chalate hain.
//   * Is file mein sirf: payment ki jaanch, usage log, sessionId, jawab.
//   * Output v4.5 se same — Rohiit ke chart (23-09-1975 16:55 Delhi) ke asli
//     VM jawab par 9 type x free/paid = 18 case mila kar jaancha.
// Version: v4.5 — NAUVA TYPE: life-span (Ayushya, BPHS 43-44, VM granth_api v4.1 aayushya(), POORA MUFT, koi score nahi) — 22 Sep 2026
// Version: v4.4 — ATHVA TYPE: love-arranged (parampara ke sanket, POORA MUFT) — 22 Sep 2026
// Version: v4.3 — teaser ka ".." double period theek (sab yog calculator) — 22 Sep 2026
// Version: v4.2 — SATVA TYPE: health-insight (Jeevan-shakti, VM se) — 22 Sep 2026
// Version: v4.1 — CHHATHA TYPE: second-marriage (Doosra Vivah, BPHS 18.19-21) — 21 Sep 2026
// PICHHLA: v4.0 — GRANTH PAR, GEMINI BAND, storage AWAIT (21 Sep 2026)
//   * Paancho calculator /granth/product se — saar + faisla + teen parat
//   * Gemini (santan-summary, vivah-summary) BILKUL BAND — Rohiit ka nirdesh
//   * logUsage ab AWAIT — pehle fire-and-forget se aadhe request marte the
//   * score/100 WAISA HI — Rohiit: "score RAKHO + faisla"
// PICHHLA: v3.1 — usage logging added (18 Sep 2026); Vivah Yog is the fifth type
//
// CHANGELOG v3.0 — "Shadi kab hogi", slug free-shadi-kab-hogi-calculator,
// type `vivah`. It follows Santan's rails exactly: the Vimshottari timeline
// with dates, the birth year for the age band, the reader's name, and now the
// GENDER, which this calculator alone requires — the Kalatra Karaka is Venus
// for a man and Jupiter for a woman, so the reading is a different reading.
//
// THE FREE SHAPE IS NOW SHARED. santanFreeShape became verdictFreeShape: the
// same three-lock structure with the lock titles supplied per product. Santan
// and Vivah had identical shapes and different words, and on 3 Sep the lock
// teaser in this file and the heading in YogCalculator drifted apart because
// they were maintained separately. One function, one place to change.
//
// FIVE PLACES MUST LEARN A NEW TYPE. Only the first three fail loudly:
//   1. this file — YogType, VALID, the score dispatch, the summary dispatch
//   2. components/calculators/YogCalculator.tsx — the config type union
//   3. app/sitemap.ts — the CALCULATORS array
//   4. app/api/calc/yog/order/route.ts — the LABEL map (silent; Santan could
//      not take payment for a day because this one was missed)
//   5. public/llms.txt — discovery only, harmless if late
// Version: v2.9 — free lock teaser matched to the engine (3 Sep 2026)
//
// CHANGELOG v2.9 — the third lock still promised "ek aapke sabse kamzor santan
// graha ki ganit se". Since engine v2.2 the fifth upay can be a SUBSTITUTE
// when all three santan grahas turn out to be the same planet, so "sabse
// kamzor" is not always true. The paid heading in YogCalculator v2.7 was
// corrected and this twin was missed — the same one-of-a-pair miss that left
// santan unable to take payment for a day.
// Version: v2.8 — maxDuration 50 -> 60 (3 Sep 2026)
//
// CHANGELOG v2.8 — the paid summary runs on gemini-3.8-flash and writes 500
// words with reasoning; the Vercel logs showed its first attempt timing out.
// lib/santan-summary.ts v1.6 raises the paid per-call ceiling to 32s, so this
// file has to leave room for it. Typical santan responses are 0.4s cached and
// 6-9s fresh; 60s is the outer bound, not the expectation.
// Version: v2.7 — birth year reaches the santan engine (3 Sep 2026)
//
// CHANGELOG v2.7 — a paid report showed a reader born in 2004 dasha windows
// starting in 2080 and 2094, ages 76 and 90. The engine had no upper bound
// because it had no idea how old anyone was. b.year now goes through as a
// fourth argument; lib/santan-engine.ts v2.2 caps windows at birth + 45 years.
// Version: v2.6 — maxDuration 30 -> 50 (3 Sep 2026)
//
// CHANGELOG v2.6 — 30s was set to stop a nine-minute hang, and it did, but it
// forced lib/santan-summary.ts to squeeze its per-call timeout down to 10s
// against Gemini calls that measure 6-9s. One live run in three then fell back
// to the flat template. 50s gives the writer real headroom while still being a
// hard ceiling; typical santan responses measure 0.4s cached and 6-9s fresh.
// Version: v2.5 — reader's name reaches the summary (3 Sep 2026)
//
// CHANGELOG v2.5 — `name` was already collected by the form and already echoed
// back in `input`, but it never reached the engine, so a personal reading never
// used it. scoreSantan now takes it as a third argument and puts the first name
// into `facts`; lib/santan-summary.ts v1.3 lets Gemini use it once.
// Version: v2.4 — maxDuration (3 Sep 2026)
//
// CHANGELOG v2.4 — a customer waited NINE MINUTES on the live santan page and
// then saw "Network error". This file had no maxDuration, so it inherited
// Vercel's default, which on Pro can be 300 seconds. A slow Gemini call on a
// cold function therefore had licence to hang for minutes instead of failing.
// 30 seconds is a hard ceiling and is generous: warm, the whole santan path
// measures 0.4s cached and 7-9s on a fresh Gemini call.
// The browser side is fixed separately in YogCalculator v2.4 — an un-aborted
// fetch is what turned a slow server into a nine-minute blank screen.
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
import { runYog, isYogType, yogBirthError, YOG_TYPES } from '@/lib/calc-core/yog';
import type { YogType, YogBirth, VmCaller } from '@/lib/calc-core/yog';
import { getProduct } from '@/lib/pricing-intl';
import { getPayPalOrder, isCaptureValid } from '@/lib/paypal-server';
import { logUsage, usageBirthFields, usageContextFromRequest } from '@/lib/usage-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Hard ceiling. See the v2.4 note above — without this it was Vercel's default. */
export const maxDuration = 60;

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

/** Website ka VM raasta — callVM (key apne aap judti hai). */
const vmViaCallVM: VmCaller = (path, body) =>
  callVM(path, { method: 'POST', body: JSON.stringify(body) });

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

// ── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const b = (await req.json().catch(() => ({}))) as Body;

    const type = b.type;
    if (!isYogType(type)) {
      return bad(`Unknown calculator type. Expected one of: ${YOG_TYPES.join(', ')}.`);
    }

    const birthErr = yogBirthError(b as Partial<YogBirth>);
    if (birthErr) return bad(birthErr);

    const paid = await isPaid(b);

    // A proof that was sent but did not verify is an ERROR, not a silent
    // downgrade — a real payer must never quietly receive the free view.
    if (!paid && (b.razorpay_signature || b.paypal_order_id)) {
      return bad('Payment could not be verified. Please contact support before paying again.', 402);
    }

    const out = await runYog({ type, birth: b as YogBirth, paid, vm: vmViaCallVM });
    if (!out.ok) {
      return NextResponse.json({ error: out.error }, { status: out.status });
    }

    if (paid) {
      console.log(`[yog] PAID unlock | type:${type} | via:${b.razorpay_signature ? 'razorpay' : 'paypal'}`);
    }

    // ── usage log — AWAIT (Vercel jawab ke baad function jam kar deta hai).
    //    logUsage apne andar kabhi throw nahi karta.
    const { full, granth } = out.meta;
    try {
      await logUsage({
        ...usageContextFromRequest(req),
        ...usageBirthFields(b as any),
        product_slug : `calc-yog-${type}`,
        product_name : `Yog Calculator (${type})`,
        product_type : 'calculator',
        tier         : paid ? 'paid' : 'free',
        result_meta  : {
          score  : (full as any)?.score ?? null,
          band   : (full as any)?.band ?? null,
          faisla : granth?.faisla?.faisla ?? null,
        },
      });
    } catch { /* logging must never break the calculator */ }

    const { success, type: t, paid: p, ...rest } = out.body;
    return NextResponse.json({
      success,
      type: t,
      paid: p,
      sessionId: `yog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...rest,
    });
  } catch (err: any) {
    console.error('[yog] Fatal:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
