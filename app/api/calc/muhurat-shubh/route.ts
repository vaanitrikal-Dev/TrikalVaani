// ============================================================
// File: app/api/calc/muhurat-shubh/route.ts
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
