/**
 * ============================================================
 * TRIKAL VAANI — PayPal Order Capture + Verification
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/paypal/capture-order/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * This is the PayPal twin of app/api/verify-payment/route.ts.
 *
 * SECURITY: we do not trust the browser's word that payment succeeded.
 * We call PayPal ourselves, confirm status is COMPLETED, and confirm the
 * captured amount matches the catalogue price to the cent. Anything else
 * is rejected.
 *
 * RETURN SHAPE is deliberately close to verify-payment's, so downstream
 * code can branch with minimal change:
 *   { success, paypal_order_id, paypal_capture_id, productKey, usdCents }
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/pricing-intl';
import { capturePayPalOrder, isCaptureValid } from '@/lib/paypal-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId, productKey } = body as {
      orderId?: string;
      productKey?: string;
    };

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing PayPal order id.' },
        { status: 400 }
      );
    }

    const product = getProduct(productKey);
    if (!product) {
      return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
    }

    const capture = await capturePayPalOrder(orderId);

    if (!isCaptureValid(capture, product.usdCents)) {
      console.error(
        `[Trikal] PayPal capture rejected | order:${orderId} | status:${capture.status} | ` +
          `paid:${capture.amountValue} ${capture.currency} | expected:${(
            product.usdCents / 100
          ).toFixed(2)} USD`
      );
      return NextResponse.json(
        { error: 'Payment verification failed. Please contact support.' },
        { status: 400 }
      );
    }

    console.log(
      `[Trikal] PayPal payment verified | capture:${capture.id} | product:${product.key}`
    );

    return NextResponse.json({
      success: true,
      paypal_order_id: orderId,
      paypal_capture_id: capture.id,
      productKey: product.key,
      usdCents: product.usdCents,
      payerEmail: capture.payerEmail,
      payerName: capture.payerName,
      message: 'Payment verified. Trikaal Ka Sandesh unlocked.',
    });
  } catch (err: unknown) {
    console.error('[Trikal] PayPal capture-order error:', err);
    return NextResponse.json(
      { error: 'Server error while confirming your payment.' },
      { status: 500 }
    );
  }
}
