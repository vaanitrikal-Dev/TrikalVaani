/**
 * ============================================================
 * TRIKAL VAANI — Yog Report Order (Razorpay, India)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/calc/yog/order/route.ts
 * VERSION: 1.1 (3 Sep 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * CHANGELOG v1.1 — SANTAN COULD NOT PAY. This file keeps its OWN whitelist,
 * separate from the one in app/api/calc/yog/route.ts, and adding santan as a
 * fourth type there did not touch it here. Result: the page rendered, the free
 * reading worked, the button was clickable — and every single tap returned
 * "Unknown calculator type." The other three were unaffected throughout.
 *
 * Verified live before the fix, all four types:
 *   santan             400  Unknown calculator type
 *   upsc               200  order_TXUG31q4KwKsEK
 *   foreign-settlement 200  order_TXUG3P5eHTvZrp
 *   foreign-spouse     200  order_TXUG3nNDruW4n1
 *
 * IF YOU ADD A FIFTH CALCULATOR, THIS FILE IS THE ONE THAT GETS FORGOTTEN.
 * Four places must learn the new type, and only the first three announce
 * themselves when they are wrong:
 *   1. app/api/calc/yog/route.ts        — YogType, VALID, the score dispatch
 *   2. components/calculators/YogCalculator.tsx — the config type union
 *   3. app/sitemap.ts                   — the CALCULATORS array
 *   4. THIS FILE                        — VALID_TYPES and LABEL
 * Miss 1 or 2 and the build fails. Miss this one and everything looks fine
 * until a customer tries to pay.
 *
 * Creates the ₹51 Razorpay order for the IAS / Videsh / Foreign Spouse /
 * Santan Yog report. International visitors do not come here — they go through
 * /api/paypal/create-order with productKey 'yog' and pay $7.
 *
 * SECURITY: the amount is read from lib/pricing-intl.ts on the SERVER. The
 * browser names a product, never a price — the same anti-tamper rule the
 * existing app/api/create-order/route.ts follows.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getProduct } from '@/lib/pricing-intl';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Every key in LABEL is a valid type. Deriving the list from the labels means
// a future calculator cannot be half-added — give it a label and it can be
// paid for; forget the label and it is rejected loudly rather than silently
// accepted at the wrong price.
const LABEL: Record<string, string> = {
  'upsc': 'Sarkari Naukri Yog Report',
  'foreign-settlement': 'Videsh Yog Report',
  'foreign-spouse': 'Foreign Spouse Yog Report',
  'santan': 'Santan Yog Report',
};

const VALID_TYPES = Object.keys(LABEL);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = String(body?.type ?? '');

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Unknown calculator type.' }, { status: 400 });
    }

    const product = getProduct('yog');
    if (!product) {
      return NextResponse.json({ error: 'Pricing not configured.' }, { status: 500 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error('[yog-order] Razorpay keys missing.');
      return NextResponse.json({ error: 'Payment not configured.' }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: product.inrPaise,
      currency: 'INR',
      receipt: `tv_yog_${type}_${Date.now()}`.slice(0, 40),
      notes: {
        platform: 'Trikaal Vaani',
        architect: 'Rohiit Gupta',
        product: 'yog',
        yog_type: type,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      description: LABEL[type] ?? 'Yog Report',
    });
  } catch (err: unknown) {
    console.error('[yog-order] Razorpay order error:', err);
    return NextResponse.json(
      { error: 'Could not start the payment. Please try again.' },
      { status: 500 },
    );
  }
}
