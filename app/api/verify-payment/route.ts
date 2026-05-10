/**
 * ============================================================
 * TRIKAL VAANI — Razorpay Payment Verification API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/verify-payment/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * SECURITY: HMAC-SHA256 signature verification.
 * NEVER trust razorpay_payment_id alone — always verify signature.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification fields.' },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Trikal] Signature mismatch — possible tampering.');
      return NextResponse.json(
        { error: 'Payment verification failed. Signature mismatch.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      message: 'Payment verified. Trikal Ka Sandesh unlocked.',
    });

  } catch (err: unknown) {
    console.error('[Trikal] Verify payment error:', err);
    return NextResponse.json(
      { error: 'Server error during verification.' },
      { status: 500 }
    );
  }
}
