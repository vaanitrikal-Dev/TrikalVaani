/**
 * ============================================================
 * TRIKAL VAANI — Verify Voice Pack Payment API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/verify-voice-pack/route.ts
 * VERSION: 1.1 (30 Aug 2026) — PayPal accepted alongside Razorpay
 *   The expected amount comes from the PACK ON THE PENDING ROW, never from the
 *   request, so the browser cannot name its own price. The Razorpay block is
 *   unchanged but guarded — a PayPal request carries no signature and would
 *   otherwise be rejected by the HMAC check.
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * SECURITY:
 *   Verifies HMAC SHA256 signature before activating pack.
 *   NEVER trust razorpay_payment_id alone — always verify signature.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 15;

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paypal_order_id,
      sessionId,
    } = body;

    const isPaypal = Boolean(paypal_order_id);

    // ── Validate inputs ─────────────────────────────────────
    if (!isPaypal && (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)) {
      return NextResponse.json(
        { error: 'Missing payment fields' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // ── Verify payment (v1.1) ───────────────────────────────
    // Two independent branches. A PayPal request never touches the Razorpay
    // code, and a Razorpay request runs the identical block it always ran.
    let paypalCaptureId: string | null = null;

    if (isPaypal) {
      const PAYPAL_KEY_FOR_PACK: Record<string, string> = {
        p11: 'voice', p51: 'voice_5q', p101: 'voice_12q',
      };
      // Read the pack off the pending row BEFORE deciding the correct amount —
      // the browser must not get to name the price.
      const { data: pending } = await sb
        .from('voice_packs')
        .select('pack_id')
        .eq('paypal_order_id', String(paypal_order_id))
        .eq('session_id', sessionId)
        .single();

      const productKey = PAYPAL_KEY_FOR_PACK[pending?.pack_id ?? ''];
      if (!productKey) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const { getProduct }                     = await import('@/lib/pricing-intl');
      const { getPayPalOrder, isCaptureValid } = await import('@/lib/paypal-server');
      const product = getProduct(productKey);
      if (!product) {
        return NextResponse.json({ error: 'Pricing not configured.' }, { status: 500 });
      }
      try {
        const ppOrder = await getPayPalOrder(String(paypal_order_id));
        if (!isCaptureValid(ppOrder, product.usdCents)) {
          console.error(
            `[VoicePack Verify] PayPal invalid — ${ppOrder.status} ${ppOrder.amountValue} ${ppOrder.currency}, ` +
            `expected ${(product.usdCents / 100).toFixed(2)} USD`
          );
          return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }
        paypalCaptureId = ppOrder.id;
      } catch (e) {
        console.error('[VoicePack Verify] PayPal verification threw:', e);
        return NextResponse.json({ error: 'Payment could not be verified' }, { status: 400 });
      }
    } else {
      // ── Verify HMAC signature ───────────────────────────────
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(payload)
        .digest('hex');

      if (expected !== razorpay_signature) {
        console.warn('[VoicePack Verify] Invalid signature for order:', razorpay_order_id);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // ── Activate pack in Supabase ───────────────────────────
    const { data: existingPack, error: fetchError } = await sb
      .from('voice_packs')
      .select('*')
      .eq(isPaypal ? 'paypal_order_id' : 'razorpay_order_id',
          isPaypal ? String(paypal_order_id) : razorpay_order_id)
      .eq('session_id', sessionId)
      .single();

    if (fetchError || !existingPack) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + existingPack.validity_days);

    const { error: updateError } = await sb
      .from('voice_packs')
      .update({
        ...(isPaypal
          ? { paypal_capture_id: paypalCaptureId }
          : { razorpay_payment_id }),
        status: 'active',
        valid_until: validUntil.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingPack.id);

    if (updateError) {
      console.error('[VoicePack Verify] Activate error:', updateError);
      return NextResponse.json({ error: 'Activation failed' }, { status: 500 });
    }

    // ── Calculate total balance across all active packs ─────
    const { data: allActive } = await sb
      .from('voice_packs')
      .select('questions_left, valid_until')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .gt('valid_until', new Date().toISOString());

    const totalBalance = (allActive || []).reduce(
      (sum, p) => sum + (p.questions_left || 0),
      0
    );

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      balance: totalBalance,
      validUntil: validUntil.toISOString(),
    });

  } catch (err) {
    console.error('[VoicePack Verify] Error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Trikaal Voice Pack Verify API is live',
    version: '1.0',
  });
}
