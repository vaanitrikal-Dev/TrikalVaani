// TRIKAL VAANI - Karmic Background Reading - Payment Verification API
// CEO: Rohiit Gupta
// File: app/api/verify-karmic-payment/route.ts
// VERSION: 1.1
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }

    // HMAC signature verify
    const secret   = process.env.RAZORPAY_KEY_SECRET!;
    const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (expected !== razorpay_signature) {
      console.error('[Trikal] Karmic signature mismatch:', razorpay_order_id);
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    // Load the pending order
    const { data: order, error: orderErr } = await supabase
      .from('karmic_orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
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
          success: true, slug: existing.slug, paymentId: razorpay_payment_id,
          resultUrl: `${SITE}/karmic/${existing.slug}`, replay: true,
        });
      }
    }

    // Mark order paid
    await supabase.from('karmic_orders')
      .update({
        razorpay_payment_id, razorpay_signature,
        status: 'paid', payment_verified: true, paid_at: new Date().toISOString(),
      })
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
        success: true, paymentId: razorpay_payment_id,
        warning: 'Payment received. Reading is being prepared — contact us if the result page does not load.',
      }, { status: 200 });
    }

    // v1.1: Fire background generation IMMEDIATELY — before returning to user.
    // This gives Gemini a ~15-20s head start before user lands on result page.
    fireBackgroundGeneration(slug);

    const personName = (order.person_data?.name ?? '').toString();
    const waText = encodeURIComponent(
      `Jai Mahakaal! Trikal Vaani Karmic Background Reading confirm ho gaya.\n\n` +
      `Reading for: ${personName}\n` +
      `Payment ID: ${razorpay_payment_id}\n` +
      `Result: trikalvaani.com/karmic/${slug}\n\nJai Maa Shakti!`
    );

    return NextResponse.json({
      success: true, slug, language: order.language,
      paymentId: razorpay_payment_id, amount: order.amount_rupees,
      resultUrl:   `${SITE}/karmic/${slug}`,
      whatsappUrl: `https://wa.me/919211804111?text=${waText}`,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    console.error('[Trikal] Verify Karmic payment error:', msg);
    return NextResponse.json({ error: 'Server error during verification.' }, { status: 500 });
  }
}
