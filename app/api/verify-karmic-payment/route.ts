// TRIKAL VAANI - Karmic Background Reading - Payment Verification API
// CEO: Rohiit Gupta
// File: app/api/verify-karmic-payment/route.ts
// VERSION: 1.3 (11 Oct 2026)
// CHANGE v1.3 (11 Oct 2026): GOOGLE PLAY BILLING — sirf Play Store app ke liye.
//   Body mein `play_purchase_token` ho tabhi naya Play branch chalta hai, wo
//   SABSE PEHLE check hota hai aur wahin se return karta hai. Razorpay aur
//   PayPal ka code EK LINE NAHI BADLA (sirf ek `if` upar joda).
//   Play mein pehle se koi pending order nahi hota, isliye birth data +
//   contact isi request mein aata hai: verifyAndClaimPlay('karmic') Google se
//   token verify karta hai → karmic_orders mein PAID row (play_order_id ke
//   saath) → karmic_readings row + wahi background generation jo Razorpay par
//   chalti hai → finishPlay(gate, slug). Kahin bhi fail → releasePlay(gate),
//   taaki customer wahi payment dobara chala sake. Daam browser se kabhi nahi
//   liya jaata — product 'karmic' server par fixed hai.
//   Gemini: is file mein koi Gemini model naam nahi (3.7 → 3.8 ki zaroorat nahi).
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
import { verifyAndClaimPlay, finishPlay, releasePlay } from '@/lib/play-billing-server'; // v1.3

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

// ── v1.3: GOOGLE PLAY (Play Store app only) ─────────────────────────────────
// Same checks as create-karmic-order's normalisePerson (route files cannot
// export helpers to each other in the App Router, so it is mirrored here).
const PLAY_KARMIC_RUPEES = 101;
const PLAY_KARMIC_PAISE  = 10100;

function normalisePlayPerson(p: any) {
  if (!p || typeof p !== 'object') return null;
  const latitude  = typeof p.latitude  === 'number' ? p.latitude  : (typeof p.lat === 'number' ? p.lat : null);
  const longitude = typeof p.longitude === 'number' ? p.longitude : (typeof p.lng === 'number' ? p.lng : null);
  const place     = p.place ?? p.cityName ?? '';
  const dob       = p.dob ?? '';
  const tob       = p.tob ?? '12:00';
  const name      = (p.name ?? '').trim();

  if (!name) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  if (!/^\d{2}:\d{2}$/.test(tob)) return null;
  if (typeof latitude !== 'number' || Math.abs(latitude) > 90) return null;
  if (typeof longitude !== 'number' || Math.abs(longitude) > 180) return null;
  if (!place) return null;

  return {
    name, dob, tob, place, cityName: place, latitude, longitude,
    timezone: typeof p.timezone === 'number' ? p.timezone : 5.5,
  };
}

/**
 * Play Store app: Google has taken the money. Verify the token WITH GOOGLE,
 * claim it once, then do exactly what the Razorpay path does after payment:
 * a paid karmic_orders row, a karmic_readings row, background generation.
 */
async function handlePlayKarmic(body: any): Promise<NextResponse> {
  // Validate BEFORE claiming, so bad input never locks the payment.
  const person = normalisePlayPerson(body.person ?? body);
  if (!person) {
    return NextResponse.json({ error: 'Invalid birth data.' }, { status: 400 });
  }
  const lang = body.language ?? 'hinglish';
  const language = ['hinglish', 'hindi', 'english'].includes(lang) ? lang : 'hinglish';
  const sourceMilanSlug = body.source_milan_slug ?? body.sourceMilanSlug ?? null;
  const contact    = body.contact ?? {};
  const userName   = contact.name   ?? body.userName   ?? null;
  const userMobile = contact.mobile ?? body.userMobile ?? null;
  const userEmail  = contact.email  ?? body.userEmail  ?? null;

  const gate = await verifyAndClaimPlay('karmic', body.play_purchase_token, 'karmic_orders');
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, code: gate.code, existingRef: gate.existingRef ?? null },
      { status: gate.status }
    );
  }

  let orderRowId: string | null = null;
  try {
    // 1. Paid order row. razorpay_order_id stays NULL (column is nullable).
    //    amount_rupees / amount_paise are NOT NULL: outside India Google
    //    charges a local price we do not know, so the rupee equivalent is
    //    recorded and `currency` says 'PLAY' (same idea as the PayPal rows).
    const { data: orderRow, error: orderErr } = await supabase
      .from('karmic_orders')
      .insert({
        amount_rupees:     PLAY_KARMIC_RUPEES,
        amount_paise:      gate.amountPaise ?? PLAY_KARMIC_PAISE,
        currency:          gate.currency,
        language,
        person_data:       person,
        source_milan_slug: sourceMilanSlug,
        user_name:         userName,
        user_mobile:       userMobile,
        user_email:        userEmail,
        status:            'paid',
        payment_verified:  true,
        paid_at:           new Date().toISOString(),
        ...(gate ? { play_order_id: gate.orderId } : {}),
      })
      .select('id')
      .single();

    if (orderErr || !orderRow) {
      console.error(`[Trikal] Karmic PLAY order save error | ${gate.orderId}: ${orderErr?.message}`);
      await releasePlay(gate);
      return NextResponse.json(
        { error: 'Payment is verified but your order could not be saved. Please tap the button again — you will not be charged again.' },
        { status: 500 }
      );
    }
    orderRowId = orderRow.id;

    // 2. Reading row — identical to the Razorpay path.
    const slug = makeSlug();
    const { error: saveErr } = await supabase.from('karmic_readings').insert({
      order_id:          orderRow.id,
      slug,
      language,
      person_data:       person,
      kundali_data:      null,
      dimensions_data:   null,
      gemini_narrative:  null,
      geo_answer:        null,
      source_milan_slug: sourceMilanSlug,
      pdf_url:           null,
      is_public:         false,
    });

    if (saveErr) {
      console.error(`[Trikal] Karmic PLAY reading row save error | ${gate.orderId}: ${saveErr.message}`);
      // Order row is orphaned — mark it failed so it is not counted as a sale twice on retry.
      await supabase.from('karmic_orders').update({ status: 'failed' }).eq('id', orderRow.id);
      await releasePlay(gate);
      return NextResponse.json(
        { error: 'Payment is verified but your reading could not be started. Please tap the button again — you will not be charged again.' },
        { status: 500 }
      );
    }

    // 3. Same background generation as Razorpay / PayPal.
    fireBackgroundGeneration(slug);

    // 4. Mark fulfilled + consume the Play token.
    await finishPlay(gate, slug);
    console.log(`[Trikal] Karmic PLAY ok | order:${gate.orderId} | region:${gate.regionCode ?? 'unknown'} | slug:${slug}`);

    return NextResponse.json({
      success: true, slug, language,
      paymentId: gate.orderId,
      amount:    gate.amountPaise != null ? gate.amountPaise / 100 : null,
      currency:  gate.currency,
      resultUrl: `${SITE}/karmic/${slug}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    console.error(`[Trikal] Karmic PLAY error | ${gate.orderId}: ${msg}`);
    if (orderRowId) {
      try { await supabase.from('karmic_orders').update({ status: 'failed' }).eq('id', orderRowId); } catch { /* best effort */ }
    }
    await releasePlay(gate);
    return NextResponse.json({ error: 'Server error during verification. Please tap the button again.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: KarmicVerifyRequest = await req.json();

    // v1.3 — Google Play (Play Store app). Checked FIRST and returned from;
    // a request without a Play token never enters it.
    if ((body as any)?.play_purchase_token) {
      return await handlePlayKarmic(body as any);
    }
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
