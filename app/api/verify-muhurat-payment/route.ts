// TRIKAL VAANI - Child Birth Muhurat Paid Report - Payment Verification API
// CEO: Rohiit Gupta
// File: app/api/calc/verify-muhurat-payment/route.ts
// VERSION: 1.1 (29 Aug 2026) — PayPal accepted alongside Razorpay.
//   The expected amount comes from the TIER ON THE PENDING ROW, never from the
//   request, so the browser cannot name its own price. The Razorpay block is
//   unchanged but guarded, since a PayPal request carries no signature and
//   would otherwise be rejected by the HMAC check.
// VERSION: 1.0
// Mirrors verify-karmic-payment. Does NOT generate the report here —
// creates the muhurat_readings row (status paid) and returns the slug.
// The VM call + Gemini + Sonnet prediction run in /api/calc/muhurat-paid
// (called by the result page). Keeps verification fast, AI work separate.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MuhuratVerifyRequest {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  paypal_order_id?:    string | null;   // v1.1 — international
  razorpay_signature:  string;
}

function makeSlug(): string {
  const ts  = Date.now().toString(36);
  const rnd = crypto.randomBytes(4).toString('hex');
  return `m-${ts}-${rnd}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: MuhuratVerifyRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paypal_order_id } = body;

    const isPaypal = Boolean(paypal_order_id);
    // The reference the customer sees. A PayPal buyer must never read
    // "Payment ID: undefined" on their receipt.
    let paypalCaptureId: string | null = null;
    let displayPaymentId: string = razorpay_payment_id;

    if (!isPaypal && (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }

    if (isPaypal) {
      const PAYPAL_KEY_FOR_TIER: Record<string, string> = {
        report_101:   'muhurat_report',
        remedies_151: 'muhurat_remedies',
      };
      // Read the tier off the pending row BEFORE deciding the correct amount —
      // the browser must not get to name the price.
      const { data: pending } = await supabase
        .from('muhurat_orders')
        .select('tier')
        .eq('paypal_order_id', String(paypal_order_id))
        .single();

      const productKey = PAYPAL_KEY_FOR_TIER[pending?.tier ?? ''];
      if (!productKey) {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
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
            `[Trikal] Muhurat PayPal invalid — ${ppOrder.status} ${ppOrder.amountValue} ${ppOrder.currency}, ` +
            `expected ${(product.usdCents / 100).toFixed(2)} USD`
          );
          return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
        }
        paypalCaptureId  = ppOrder.id;
        displayPaymentId = ppOrder.id;
      } catch (e) {
        console.error('[Trikal] Muhurat PayPal verification threw:', e);
        return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
      }
    } else {
      // Verify HMAC signature — unchanged, now guarded so a PayPal request
      // (which carries no signature) does not fall into it and get rejected.
      const secret   = process.env.RAZORPAY_KEY_SECRET!;
      const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      if (expected !== razorpay_signature) {
        console.error('[Trikal] Muhurat signature mismatch:', razorpay_order_id);
        return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
      }
    }

    // Load the pending order — by whichever id this payment used
    const { data: order, error: orderErr } = await supabase
      .from('muhurat_orders')
      .select('*')
      .eq(isPaypal ? 'paypal_order_id' : 'razorpay_order_id',
          isPaypal ? String(paypal_order_id) : razorpay_order_id)
      .single();

    if (orderErr || !order) {
      console.error('[Trikal] Muhurat order not found:', razorpay_order_id, orderErr?.message);
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Idempotency replay — if already verified, return existing reading slug
    if (order.payment_verified === true) {
      const { data: existing } = await supabase
        .from('muhurat_readings')
        .select('slug')
        .eq('order_id', order.id)
        .maybeSingle();
      if (existing?.slug) {
        return NextResponse.json({
          success: true, slug: existing.slug, paymentId: displayPaymentId,
          resultUrl: `https://trikalvaani.com/muhurat/${existing.slug}`, replay: true,
        });
      }
    }

    // Mark order paid
    await supabase
      .from('muhurat_orders')
      .update(
        isPaypal
          ? { paypal_capture_id: paypalCaptureId,
              status: 'paid', payment_verified: true, paid_at: new Date().toISOString() }
          : { razorpay_payment_id, razorpay_signature,
              status: 'paid', payment_verified: true, paid_at: new Date().toISOString() }
      )
      .eq('id', order.id);

    // Create the reading row (VM data + narrative generated later by /api/calc/muhurat-paid)
    const slug = makeSlug();

    const { error: saveErr } = await supabase
      .from('muhurat_readings')
      .insert({
        order_id:         order.id,
        slug,
        tier:             order.tier,
        language:         order.language,
        muhurat_data:     order.muhurat_data,
        vm_data:          null,
        doshas_data:      null,
        remedies_data:    null,
        gemini_narrative: null,
        geo_answer:       null,
        pdf_url:          null,
        is_public:        false,
      });

    if (saveErr) {
      console.error('[Trikal] Muhurat reading row save error:', saveErr.message);
      return NextResponse.json({
        success: true, paymentId: displayPaymentId,
        warning: 'Payment received. Report is being prepared — please contact us if the result page does not load.',
      }, { status: 200 });
    }

    const tierLabel = order.tier === 'remedies_151'
      ? 'Full Report + 10 Remedies'
      : 'Full Muhurat Report';

    const waText = encodeURIComponent(
      `Jai Mahakaal! Trikaal Vaani Child Birth Muhurat Report confirm ho gaya.\n\n` +
      `Tier: ${tierLabel}\n` +
      `Payment ID: ${displayPaymentId}\n` +
      `Result: trikalvaani.com/muhurat/${slug}\n\nJai Maa Shakti!`
    );

    return NextResponse.json({
      success:     true,
      slug,
      tier:        order.tier,
      language:    order.language,
      paymentId:   displayPaymentId,
      amount:      order.amount_rupees,
      resultUrl:   `https://trikalvaani.com/muhurat/${slug}`,
      whatsappUrl: `https://wa.me/919211804111?text=${waText}`,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Verify Muhurat payment error:', err);
    return NextResponse.json({ error: 'Server error during verification.' }, { status: 500 });
  }
}
