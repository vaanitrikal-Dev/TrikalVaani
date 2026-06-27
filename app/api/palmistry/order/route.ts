// TRIKAL VAANI - Palmistry (Hast Rekha) Order Creation API - v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect
// Pattern matched to Kundali Milan order route (CEO-approved env naming).
// ₹51 fixed — Hast Rekha Report (IR-19 pricing anchor).

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();

    const userName = (body.user_name ?? '').trim() || null;
    const gender   = body.gender ?? 'M';
    const language = body.language ?? 'hi';

    // Create Razorpay Order — ₹51 fixed
    const order = await razorpay.orders.create({
      amount:   5100,        // ₹51 in paise
      currency: 'INR',
      receipt:  `tv_palm_${Date.now()}`,
      notes: {
        platform:  'Trikaal Vaani',
        purpose:   'Hast Rekha Report',
        product:   'hast_rekha',
        gender,
        language,
        architect: 'Rohiit Gupta',
      },
    });

    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Palmistry order error:', err);
    return NextResponse.json(
      { error: 'Could not create order. Please try again.' },
      { status: 500 }
    );
  }
}
