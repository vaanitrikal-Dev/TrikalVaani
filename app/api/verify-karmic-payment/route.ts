// TRIKAL VAANI - Karmic Background Reading - Payment Verification API
// CEO: Rohiit Gupta
// File: app/api/verify-karmic-payment/route.ts
// VERSION: 1.2 (29 Aug 2026)
// CHANGE v1.2: PAYPAL. Accepts paypal_order_id ($19) as an alternative to the
//   Razorpay trio (Rs 251), verifies it by fetching the order FROM PayPal, and
//   looks the pending row up by whichever id was used. The Razorpay branch is
//   byte-identical to v1.1. The receipt, the WhatsApp text and the returned
//   amount all follow the provider, so a dollar buyer never sees
//   "Payment ID: undefined" or a rupee figure for a dollar payment.
// CHANGE v1.1: After saving the reading row, immediately fire a background
//   generation call (fire-and-forget) so Gemini starts DURING the payment
//   redirect — not after the user opens the result page. By the time the
//   user arrives, generation is 15-20s ahead. Combined with word_target=1000,
//   total wait drops from ~3.5min to ~60-80s.
//   All other logic identical to v1.0.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trikalvaani.com';

interface KarmicVerifyRequest {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
  paypal_order_id?:    string | null;   // v1.1 — international, $19
}

function makeSlug(): string {
  const ts  = Date.now().toString(36);
  const rnd = crypto.randomBytes(4).toString('hex');
  return `k-${ts}-${rnd}`;
}

// Fire-and-forget: start Gemini generation immediately after payment.
// Does NOT await — payment response returns instantly to the user.
function fireBackgroundGeneration(slug: string): void {
  fetch(`${SITE}/api/karmic-reading`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug }),
    cache: 'no-store',
  }).catch(err => {
    console.warn('[Trikal] Background Karmic generation fire failed:', err);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: KarmicVerifyRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paypal_order_id } = body;

    const isPaypal = Boolean(paypal_order_id);
    // The reference shown to the customer. A PayPal buyer must never see
    // "Payment ID: undefined" on their receipt or WhatsApp confirmation.

    if (!isPaypal && (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }

    // ── Verify payment ───────────────────────────────────────────────────────
    // v1.1: two independent branches. A PayPal request never touches the
    // Razorpay code, and a Razorpay request runs the identical block it always
    // ran. PayPal is confirmed by asking PayPal — an id from the browser is
    // not proof of anything.
    let paypalCaptureId: string | null = null;
    let displayPaymentId: string = razorpay_payment_id;

    if (isPaypal) {
      const { getProduct }                     = await import('@/lib/pricing-intl');
      const { getPayPalOrder, isCaptureValid } = await import('@/lib/paypal-server');
      const product = getProduct('karmic');
      if (!product) {
        return NextResponse.json({ error: 'Pricing not configured.' }, { status: 500 });
      }
      try {
        const ppOrder = await getPayPalOrder(String(paypal_order_id));
        if (!isCaptureValid(ppOrder, product.usdCents)) {
          console.error(
            `[Trikal] Karmic PayPal invalid — ${ppOrder.status} ${ppOrder.amountValue} ${ppOrder.currency}, ` +
            `expected ${(product.usdCents / 100).toFixed(2)} USD`
          );
          return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
        }
        paypalCaptureId = ppOrder.id;
        displayPaymentId = ppOrder.id;
      } catch (e) {
        console.error('[Trikal] Karmic PayPal verification threw:', e);
        return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
      }
    } else {
      // HMAC signature verify
      const secret   = process.env.RAZORPAY_KEY_SECRET!;
      const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      if (expected !== razorpay_signature) {
        console.error('[Trikal] Karmic signature mismatch:', razorpay_order_id);
        return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
      }
    }

    // Load the pending order — by whichever id this payment used
    const { data: order, error: orderErr } = await supabase
      .from('karmic_orders')
      .select('*')
      .eq(isPaypal ? 'paypal_order_id' : 'razorpay_order_id',
          isPaypal ? String(paypal_order_id) : razorpay_order_id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Idempotency replay
    if (order.payment_verified === true) {
      const { data: existing } = await supabase
        .from('karmic_readings')
        .select('slug')
        .eq('order_id', order.id)
        .maybeSingle();
      if (existing?.slug) {
        return NextResponse.json({
          success: true, slug: existing.slug, paymentId: displayPaymentId,
          resultUrl: `${SITE}/karmic/${existing.slug}`, replay: true,
        });
      }
    }

    // Mark order paid
    await supabase.from('karmic_orders')
      .update(
        isPaypal
          ? { paypal_capture_id: paypalCaptureId,
              status: 'paid', payment_verified: true, paid_at: new Date().toISOString() }
          : { razorpay_payment_id, razorpay_signature,
              status: 'paid', payment_verified: true, paid_at: new Date().toISOString() }
      )
      .eq('id', order.id);

    // Create reading row
    const slug = makeSlug();

    const { error: saveErr } = await supabase.from('karmic_readings').insert({
      order_id:          order.id,
      slug,
      language:          order.language,
      person_data:       order.person_data,
      kundali_data:      null,
      dimensions_data:   null,
      gemini_narrative:  null,
      geo_answer:        null,
      source_milan_slug: order.source_milan_slug ?? null,
      pdf_url:           null,
      is_public:         false,
    });

    if (saveErr) {
      console.error('[Trikal] Karmic reading row save error:', saveErr.message);
      return NextResponse.json({
        success: true, paymentId: displayPaymentId,
        warning: 'Payment received. Reading is being prepared — contact us if the result page does not load.',
      }, { status: 200 });
    }

    // v1.1: Fire background generation IMMEDIATELY — before returning to user.
    // This gives Gemini a ~15-20s head start before user lands on result page.
    fireBackgroundGeneration(slug);

    const personName = (order.person_data?.name ?? '').toString();
    const waText = encodeURIComponent(
      `Jai Mahakaal! Trikaal Vaani Karmic Background Reading confirm ho gaya.\n\n` +
      `Reading for: ${personName}\n` +
      `Payment ID: ${displayPaymentId}\n` +
      `Result: trikalvaani.com/karmic/${slug}\n\nJai Maa Shakti!`
    );

    return NextResponse.json({
      success: true, slug, language: order.language,
      paymentId: displayPaymentId,
      amount:    isPaypal ? (order.amount_cents ?? 0) / 100 : order.amount_rupees,
      currency:  isPaypal ? 'USD' : 'INR',
      resultUrl:   `${SITE}/karmic/${slug}`,
      whatsappUrl: `https://wa.me/919211804111?text=${waText}`,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    console.error('[Trikal] Verify Karmic payment error:', msg);
    return NextResponse.json({ error: 'Server error during verification.' }, { status: 500 });
  }
}
