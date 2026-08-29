/**
 * ============================================================
 * TRIKAL VAANI — PayPal Order Creation
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/paypal/create-order/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Mirrors the anti-tamper rule already used by
 * app/api/create-order/route.ts: the SERVER decides the price.
 * The browser only names a product key. Any amount it sends is ignored.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/pricing-intl';
import { createPayPalOrder } from '@/lib/paypal-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { productKey } = body as { productKey?: string };

    const product = getProduct(productKey);
    if (!product) {
      return NextResponse.json(
        { error: 'Unknown product.' },
        { status: 400 }
      );
    }

    if (product.usdCents <= 0) {
      return NextResponse.json(
        { error: 'This product is not available for international purchase.' },
        { status: 400 }
      );
    }

    const referenceId = `tv_${product.key}_${Date.now()}`;

    const order = await createPayPalOrder({
      usdCents: product.usdCents,
      description: product.label,
      referenceId,
    });

    return NextResponse.json({
      orderId: order.id,
      productKey: product.key,
      usdCents: product.usdCents,
      referenceId,
    });
  } catch (err: unknown) {
    console.error('[Trikal] PayPal create-order error:', err);
    return NextResponse.json(
      { error: 'Could not start the PayPal payment. Please try again.' },
      { status: 500 }
    );
  }
}
