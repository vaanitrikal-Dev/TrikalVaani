/**
 * ============================================================
 * TRIKAL VAANI — Yog Report Order (Razorpay, India)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/calc/yog/order/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Creates the ₹51 Razorpay order for the IAS / Videsh / Foreign Spouse
 * report. International visitors do not come here — they go through
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

const VALID_TYPES = ['upsc', 'foreign-settlement', 'foreign-spouse'];

const LABEL: Record<string, string> = {
  'upsc': 'Sarkari Naukri Yog Report',
  'foreign-settlement': 'Videsh Yog Report',
  'foreign-spouse': 'Foreign Spouse Yog Report',
};

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
