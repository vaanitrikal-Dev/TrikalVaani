// ============================================================
// File: app/api/calc/muhurat-shubh/route.ts
// Version: v1.2 — 11 October 2026 — GOOGLE PLAY BILLING (Play Store app)
//   * Naya field `play_purchase_token`. Aaye to ALAG Play branch (handlePlay)
//     chalta hai aur wahin lautta hai. Razorpay / PayPal / muft ka raasta EK
//     LINE NAHI BADLA.
//   * Play product: yog_51 (productKey 'yog') — website par bhi ye calculator
//     'yog' product (Rs 51) se bikta hai: /api/calc/yog/order type 'muhurat'.
//   * verifyAndClaimPlay → VM paid soochi → safal par finishPlay (consume),
//     fail par releasePlay (wahi payment se dobara koshish).
// Version: v1.1 — 23 September 2026 — "kab se kab tak" (ant) aage bheja
// Version: v1.0 — 23 September 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
//
// SHUBH MUHURAT CALCULATOR ka route. VM ke do endpoint se baat karta hai:
//   GET  /muhurat/karma   — dropdown ke 40 kaam (Supabase muhurat_karma se)
//   POST /muhurat/shubh   — kundali se shubh tareekh + samay
//
// YE ROUTE KHUD KOI JYOTISH NAHI KARTA. Na koi niyam, na koi ank. Saara
// ganit VM ke muhurat_api.py mein hai aur saare niyam Supabase ki do table
// mein (muhurat_karma, muhurat_niyam). Naya kaam jodna = ek DB row; ye file
// aur component chhute bhi nahi.
//
// ⚠️ MUFT/PAID KI DEEWAR BHI YAHAN NAHI HAI — wo VM ke engine mein hai
// (MUFT_HADD: 1 shreshth + 2 achha + 3 theek, 3 mahine). Wajah: agar hadd
// yahan hoti to koi bhi seedha VM par call karke poori soochi le leta.
// Yahan se sirf tier bheja jaata hai, aur bina verify kiye paid kabhi nahi.
//
// PAYMENT: bilkul wahi rasta jo /api/calc/yog par hai — Razorpay ka
// signature HMAC se jaancha jaata hai (server par, RAZORPAY_KEY_SECRET se),
// PayPal ka order dobara PayPal se jaancha jaata hai. Proof bheja gaya ho
// par verify na ho to 402 lautata hai — chupchaap muft nahi deta.
//
// CHAAR JAGAH NAYA KAAM SEEKHNI HAI (agar kabhi naya PRODUCT bane):
//   1. ye file                                   — kuch nahi, karma DB se aata hai
//   2. components/calculators/MuhuratCalculator.tsx — kuch nahi
//   3. Supabase muhurat_karma                    — EK ROW. Bas.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { callVM } from '@/lib/callVM';
import { getProduct } from '@/lib/pricing-intl';
import { getPayPalOrder, isCaptureValid } from '@/lib/paypal-server';
import { logUsage, usageBirthFields, usageContextFromRequest } from '@/lib/usage-log';
import { verifyAndClaimPlay, finishPlay, releasePlay } from '@/lib/play-billing-server'; // v1.2

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  karma?: string;
  year?: number; month?: number; day?: number;
  hour?: number; minute?: number;
  latitude?: number; longitude?: number; timezone?: number;
  // kaam kahan hoga — shubh SAMAY suryoday se banta hai aur suryoday shehar
  // se badalta hai. Na bheje to janm-sthan maan liya jaata hai (VM par).
  kaam_lat?: number | null; kaam_lon?: number | null; kaam_tz?: number | null;
  kaam_sthan?: string | null;
  name?: string | null;
  shuru?: string | null;
  ant?: string | null;          // "kab tak" — grahak ki apni seema (v1.1)
  // Payment proof — dono mein se ek, ya koi nahi (muft).
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  paypal_order_id?: string;
  // v1.2 — Google Play (Play Store app). Server Google se khud jaanchta hai.
  play_purchase_token?: string;
}

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

// ── Payment — /api/calc/yog ka hubahu tareeka ────────────────────────────────
function razorpayValid(b: Body): boolean {
  const { razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: sig } = b;
  if (!o || !p || !sig) return false;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('[muhurat] RAZORPAY_KEY_SECRET missing — refusing to unlock.');
    return false;
  }
  const expected = crypto.createHmac('sha256', secret).update(`${o}|${p}`).digest('hex');
  const a = Buffer.from(expected);
  const c = Buffer.from(sig);
  return a.length === c.length && crypto.timingSafeEqual(a, c);
}

async function paypalValid(b: Body): Promise<boolean> {
  if (!b.paypal_order_id) return false;
  const product = getProduct('yog');          // Rs 51 / $7 — wahi product
  if (!product) return false;
  try {
    const order = await getPayPalOrder(b.paypal_order_id);
    return isCaptureValid(order, product.usdCents);
  } catch (e) {
    console.error('[muhurat] PayPal re-verification failed:', e);
    return false;
  }
}

async function isPaid(b: Body): Promise<boolean> {
  if (b.razorpay_signature) return razorpayValid(b);
  if (b.paypal_order_id) return await paypalValid(b);
  return false;
}

// ── GET — dropdown ke kaam ───────────────────────────────────────────────────
export async function GET() {
  try {
    const res = await callVM('/muhurat/karma', {
      method: 'GET',
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Kaam ki soochi abhi nahi aa paa rahi. Thodi der mein dobara.' },
        { status: 503 });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      // soochi din mein mushkil se badalti hai — edge par ek ghanta cache
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (e) {
    console.error('[muhurat] karma list failed:', e);
    return NextResponse.json(
      { error: 'Kaam ki soochi abhi nahi aa paa rahi. Thodi der mein dobara.' },
      { status: 503 });
  }
}

// ── v1.2: GOOGLE PLAY branch (Play Store app only) ──────────────────────────
// Sirf tab jab request mein play_purchase_token ho. Paid VM call wahi hai jo
// neeche Razorpay ke liye hota hai (tier 'paid', 12 mahine) — bas Play ka
// claim/finish/release saath mein.
async function handlePlay(req: NextRequest, b: Body): Promise<NextResponse> {
  const gate = await verifyAndClaimPlay('yog', b.play_purchase_token, 'calc_muhurat_shubh');
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, code: gate.code, existingRef: gate.existingRef ?? null },
      { status: gate.status },
    );
  }

  let data: any;
  try {
    const res = await callVM('/muhurat/shubh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        karma: b.karma,
        year: b.year, month: b.month, day: b.day,
        hour: b.hour ?? 12, minute: b.minute ?? 0,
        latitude: b.latitude, longitude: b.longitude,
        timezone: b.timezone ?? 5.5,
        kaam_lat: b.kaam_lat ?? null,
        kaam_lon: b.kaam_lon ?? null,
        kaam_tz: b.kaam_tz ?? null,
        tier: 'paid',
        mahine: 12,
        shuru: b.shuru ?? null,
        ant: b.ant ?? null,
        prati_mahina: 5,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('[muhurat] Play VM error', res.status, t.slice(0, 300));
      await releasePlay(gate);
      return NextResponse.json(
        { error: 'Muhurat engine abhi jawab nahi de raha. Thodi der mein dobara koshish kijiye.' },
        { status: 503 });
    }
    data = await res.json();
  } catch (e) {
    console.error('[muhurat] Play failed:', e);
    await releasePlay(gate);
    return NextResponse.json(
      { error: 'Muhurat nikaalte waqt dikkat aayi. Thodi der mein dobara koshish kijiye.' },
      { status: 503 });
  }
  if (data?.error) {
    await releasePlay(gate);
    return bad(data.error, 400);
  }

  await finishPlay(gate, `muhurat-${b.karma}`);
  console.log(`[muhurat] PAID unlock | karma:${b.karma} | via:play | order:${gate.orderId}`);

  try {
    await logUsage({
      ...usageContextFromRequest(req),
      ...usageBirthFields(b as any),
      product_type: 'muhurat',
      product_slug: `muhurat-${b.karma}`,
      tier: 'paid',
      birth_city: b.kaam_sthan ?? null,
      result_meta: {
        karma: b.karma,
        dikhi: Array.isArray(data?.tareekhein) ? data.tareekhein.length : 0,
        chhupi: data?.chhupi_kul ?? 0,
        darje: data?.darje ?? null,
        play_order_id: gate.orderId,
      },
    } as any);
  } catch { /* logging kabhi grahak ka jawab na roke */ }

  return NextResponse.json({ ...data, paid: true });
}

// ── POST — shubh tareekhein ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let b: Body;
  try {
    b = await req.json();
  } catch {
    return bad('Request theek se nahi aayi.');
  }

  if (!b.karma) return bad('Kaam chunna zaroori hai.');
  for (const f of ['year', 'month', 'day', 'latitude', 'longitude'] as const) {
    if (typeof b[f] !== 'number') return bad(`Janm ka vivaran adhoora hai: ${f}`);
  }

  // v1.2 — Google Play: ALAG branch, pehle jaancha jaata hai aur wahin lautta hai.
  if (b.play_purchase_token) return await handlePlay(req, b);

  const paid = await isPaid(b);
  // Proof bheja par verify na hua — ye GALTI hai, chupchaap muft dena nahi.
  if (!paid && (b.razorpay_signature || b.paypal_order_id)) {
    return bad('Payment verify nahi ho paayi. Paisa kata ho to hamein likhiye — '
             + 'rohiit@trikalvaani.com', 402);
  }

  try {
    const res = await callVM('/muhurat/shubh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        karma: b.karma,
        year: b.year, month: b.month, day: b.day,
        hour: b.hour ?? 12, minute: b.minute ?? 0,
        latitude: b.latitude, longitude: b.longitude,
        timezone: b.timezone ?? 5.5,
        kaam_lat: b.kaam_lat ?? null,
        kaam_lon: b.kaam_lon ?? null,
        kaam_tz: b.kaam_tz ?? null,
        tier: paid ? 'paid' : 'free',
        mahine: paid ? 12 : 3,
        shuru: b.shuru ?? null,
        ant: b.ant ?? null,
        prati_mahina: 5,
      }),
      // 12 mahine = 365 din ka scan. VM par ~2 second lagta hai, par edge
      // par kabhi lamba ho sakta hai — 60s rakha hai, Vercel ki hadd ke andar.
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('[muhurat] VM error', res.status, t.slice(0, 300));
      return NextResponse.json(
        { error: 'Muhurat engine abhi jawab nahi de raha. Thodi der mein dobara koshish kijiye.' },
        { status: 503 });
    }

    const data = await res.json();
    if (data?.error) return bad(data.error, 400);

    if (paid) {
      console.log(`[muhurat] PAID unlock | karma:${b.karma} | `
                + `via:${b.razorpay_signature ? 'razorpay' : 'paypal'}`);
    }

    // logUsage apne andar kabhi throw nahi karta; await isliye ki Vercel
    // function khatam hone par fire-and-forget adha mar jaata tha (yog v4.0).
    try {
      await logUsage({
        ...usageContextFromRequest(req),
        ...usageBirthFields(b as any),
        product_type: 'muhurat',
        product_slug: `muhurat-${b.karma}`,
        tier: paid ? 'paid' : 'free',
        birth_city: b.kaam_sthan ?? null,
        result_meta: {
          karma: b.karma,
          dikhi: Array.isArray(data?.tareekhein) ? data.tareekhein.length : 0,
          chhupi: data?.chhupi_kul ?? 0,
          darje: data?.darje ?? null,
        },
      } as any);
    } catch { /* logging kabhi grahak ka jawab na roke */ }

    return NextResponse.json({ ...data, paid });
  } catch (e) {
    console.error('[muhurat] failed:', e);
    return NextResponse.json(
      { error: 'Muhurat nikaalte waqt dikkat aayi. Thodi der mein dobara koshish kijiye.' },
      { status: 503 });
  }
}
