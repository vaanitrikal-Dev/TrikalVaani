/**
 * ============================================================
 * TRIKAL VAANI — Razorpay Payment Verification API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/verify-payment/route.ts
 * VERSION: 1.1 — PayPal accepted alongside Razorpay
 *
 * v1.1 (2026-08-29): a PayPal branch that returns before the Razorpay code is
 * reached, so the rupee path is byte-identical to v1.0.
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * SECURITY: HMAC-SHA256 signature verification.
 * NEVER trust razorpay_payment_id alone — always verify signature.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getProduct } from '@/lib/pricing-intl';
import { getPayPalOrder, isCaptureValid } from '@/lib/paypal-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── v1.1: PayPal branch, checked FIRST and returned from immediately, so
    // the Razorpay code below is untouched and unreachable for these requests.
    // `productKey` says what was bought; the price is read on the server and
    // the order is confirmed with PayPal directly.
    if (body?.paypal_order_id) {
      const product = getProduct(body?.productKey || 'deep');
      if (!product) {
        return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
      }
      try {
        const order = await getPayPalOrder(String(body.paypal_order_id));
        if (!isCaptureValid(order, product.usdCents)) {
          console.error(
            `[Trikal] PayPal not valid — ${order.status} ${order.amountValue} ${order.currency}, ` +
            `expected ${(product.usdCents / 100).toFixed(2)} USD`
          );
          return NextResponse.json(
            { error: 'Payment verification failed.' },
            { status: 400 }
          );
        }
        return NextResponse.json({
          success: true,
          provider: 'paypal',
          paypalOrderId: body.paypal_order_id,
          paypalCaptureId: order.id,
          amountCents: product.usdCents,
          currency: 'USD',
          message: 'Payment verified. Trikaal Ka Sandesh unlocked.',
        });
      } catch (e) {
        console.error('[Trikal] PayPal verification threw:', e);
        return NextResponse.json(
          { error: 'Payment could not be verified. Please contact support.' },
          { status: 400 }
        );
      }
    }

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
      message: 'Payment verified. Trikaal Ka Sandesh unlocked.',
    });

  } catch (err: unknown) {
    console.error('[Trikal] Verify payment error:', err);
    return NextResponse.json(
      { error: 'Server error during verification.' },
      { status: 500 }
    );
  }
}
