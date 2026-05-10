/**
 * ============================================================
 * TRIKAL VAANI — Razorpay Order Creation API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/create-order/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * SECURITY: RAZORPAY_KEY_SECRET is server-only (no NEXT_PUBLIC_)
 * This route runs server-side — secret never exposed to browser.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// ── Allowed amounts (paise) — ANTI-TAMPER ────────────────────
// Server controls price, NOT client. Stops users from sending ₹1.
const ALLOWED_AMOUNTS: Record<string, number> = {
  deep: 5100,   // ₹51 Deep Reading (Gemini Pro + Claude polish)
  voice: 1100,  // ₹11 Voice Reading (Trikal Voice)
};

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier } = body; // 'deep' | 'voice'

    if (!tier || !ALLOWED_AMOUNTS[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "deep" or "voice".' },
        { status: 400 }
      );
    }

    const amount = ALLOWED_AMOUNTS[tier];

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `tv_${tier}_${Date.now()}`,
      notes: {
        platform: 'Trikal Vaani',
        tier,
        architect: 'Rohiit Gupta',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Razorpay order error:', err);
    return NextResponse.json(
      { error: 'Could not create payment order. Please try again.' },
      { status: 500 }
    );
  }
}
