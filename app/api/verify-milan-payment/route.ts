// TRIKAL VAANI - Kundali Milan Payment Verification API
// CEO: Rohiit Gupta
// File: app/api/verify-milan-payment/route.ts
// VERSION: 1.6 (29 Aug 2026) - PayPal accepted alongside Razorpay
//
// CHANGE v1.6: accepts paypal_order_id for international buyers. The expected
//   amount is read from the TIER ON THE PENDING ROW, never from the request,
//   so the browser cannot name its own price. The Razorpay block is unchanged
//   but now guarded by `if (!isPaypal)` — without that guard the HMAC check
//   would run on a request that carries no signature and reject a genuine
//   PayPal payment. Receipts and the WhatsApp text follow the provider.
//
// VERSION: 1.5 - VM call routed through lib/callVM.ts (X-Trikal-Key auto)
//
// CHANGE LOG (v1.4 → v1.5):
//   The post-payment VM /milan-compute call now goes through lib/callVM.ts
//   so the X-Trikal-Key auth header is injected automatically. The 30s
//   timeout/abort, Razorpay HMAC signature verification, order lookup,
//   replay handling, manglik build, Supabase insert, and WhatsApp text
//   are all byte-for-byte identical to v1.4.
//
// CHANGE LOG (v1.3 → v1.4):
//   buildManglikData() was reading vmData?.bride_manglik (undefined).
//   VM actually nests manglik under vmData.bride.manglik / vmData.groom.manglik.
//   Fixed read path: vmData?.bride?.manglik + vmData?.groom?.manglik.
//   Now bride + groom per-person Manglik status saves correctly for all new rows.
//   All other logic identical to v1.3.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { callVM } from '@/lib/callVM';

const VM_MILAN_ENDPOINT =
  process.env.VM_MILAN_ENDPOINT ?? 'http://34.47.182.227:8001/milan-compute';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MilanVerifyRequest {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  paypal_order_id?:    string | null;   // v1.6 — international
  razorpay_signature:  string;
}

function makeSlug(): string {
  const ts  = Date.now().toString(36);
  const rnd = crypto.randomBytes(4).toString('hex');
  return `m-${ts}-${rnd}`;
}

// ── Build structured manglik_data from VM response ────────────
// VM returns:
//   vmData.bride.manglik             → compute_manglik_full result for person1
//   vmData.groom.manglik             → compute_manglik_full result for person2
//   vmData.manglik_evaluation        → combined verdict (CANCELLED/BRIDE_ONLY/GROOM_ONLY/NONE)
// Per-person manglik is NESTED under vmData.bride.manglik / vmData.groom.manglik
function buildManglikData(vmData: any): object | null {
  if (!vmData) return null;

  const combined = vmData?.manglik_evaluation   ?? null;
  const bride    = vmData?.bride?.manglik        ?? null;  // v1.4 FIX: nested path
  const groom    = vmData?.groom?.manglik        ?? null;  // v1.4 FIX: nested path

  if (!combined && !bride && !groom) return null;

  return {
    bride: bride ? {
      is_manglik: bride.is_manglik   ?? false,
      strength:   bride.strength     ?? 'Not Manglik',
    } : null,
    groom: groom ? {
      is_manglik: groom.is_manglik   ?? false,
      strength:   groom.strength     ?? 'Not Manglik',
    } : null,
    combined: combined ? {
      status:         combined.status         ?? 'NONE',
      verdict:        combined.verdict        ?? '',
      verdict_hi:     combined.verdict_hi     ?? '',
      recommendation: combined.recommendation ?? '',
    } : null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: MilanVerifyRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paypal_order_id } = body;

    const isPaypal = Boolean(paypal_order_id);
    // The reference the customer sees. A PayPal buyer must never read
    // "Payment ID: undefined" on their receipt or WhatsApp message.
    let paypalCaptureId: string | null = null;
    let displayPaymentId: string = razorpay_payment_id;

    if (!isPaypal && (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }

    // ── Verify payment (v1.6) ────────────────────────────────────────────────
    // Two independent branches. A PayPal request never touches the Razorpay
    // code, and a Razorpay request runs the identical block it always ran.
    if (isPaypal) {
      const PAYPAL_KEY_FOR_TIER: Record<string, string> = {
        basic_51:        'milan_basic',
        deep_101_couple: 'milan_deep',
        deep_101_parent: 'milan_deep_parent',
        both_151:        'milan_both',
      };
      // The tier lives on the pending row, so read that BEFORE deciding what
      // the correct amount is — the browser must not get to name the price.
      const { data: pending } = await supabase
        .from('kundali_milan_orders')
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
            `[Trikal] Milan PayPal invalid — ${ppOrder.status} ${ppOrder.amountValue} ${ppOrder.currency}, ` +
            `expected ${(product.usdCents / 100).toFixed(2)} USD`
          );
          return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
        }
        paypalCaptureId  = ppOrder.id;
        displayPaymentId = ppOrder.id;
      } catch (e) {
        console.error('[Trikal] Milan PayPal verification threw:', e);
        return NextResponse.json({ error: 'Payment could not be verified.' }, { status: 400 });
      }
    }

    // Razorpay branch — unchanged, and now guarded so a PayPal request does not
    // fall into it. Without the guard the HMAC check would run on a request
    // that has no signature at all and reject a genuine PayPal payment.
    if (!isPaypal) {
      const secret   = process.env.RAZORPAY_KEY_SECRET!;
      const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      if (expected !== razorpay_signature) {
        console.error('[Trikal] Milan signature mismatch:', razorpay_order_id);
        return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
      }
    }

    const { data: order, error: orderErr } = await supabase
      .from('kundali_milan_orders')
      .select('*')
      .eq(isPaypal ? 'paypal_order_id' : 'razorpay_order_id',
          isPaypal ? String(paypal_order_id) : razorpay_order_id)
      .single();

    if (orderErr || !order) {
      console.error('[Trikal] Milan order not found:', razorpay_order_id, orderErr?.message);
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.payment_verified === true) {
      const { data: existing } = await supabase
        .from('kundali_milan')
        .select('slug')
        .eq('order_id', order.id)
        .maybeSingle();
      if (existing?.slug) {
        return NextResponse.json({
          success: true, slug: existing.slug, tier: order.tier,
          audience: order.audience, paymentId: displayPaymentId,
          resultUrl: `https://trikalvaani.com/milan/${existing.slug}`, replay: true,
        });
      }
    }

    await supabase
      .from('kundali_milan_orders')
      .update(
        isPaypal
          ? { paypal_capture_id: paypalCaptureId,
              status: 'paid', payment_verified: true, paid_at: new Date().toISOString(),
                  }
          : { razorpay_payment_id, razorpay_signature,
              status: 'paid', payment_verified: true, paid_at: new Date().toISOString(),
                  }
      )
      .eq('id', order.id);

    const bride = order.bride_data;
    const groom = order.groom_data;

    const vmPayload = {
      person1: {
        name: bride.name, gender: bride.gender ?? 'female',
        year:   Number(bride.dob.slice(0, 4)), month:  Number(bride.dob.slice(5, 7)),
        day:    Number(bride.dob.slice(8, 10)), hour:   Number(bride.tob.slice(0, 2)),
        minute: Number(bride.tob.slice(3, 5)),
        latitude: bride.latitude, longitude: bride.longitude,
        timezone: bride.timezone, place: bride.place,
      },
      person2: {
        name: groom.name, gender: groom.gender ?? 'male',
        year:   Number(groom.dob.slice(0, 4)), month:  Number(groom.dob.slice(5, 7)),
        day:    Number(groom.dob.slice(8, 10)), hour:   Number(groom.tob.slice(0, 2)),
        minute: Number(groom.tob.slice(3, 5)),
        latitude: groom.latitude, longitude: groom.longitude,
        timezone: groom.timezone, place: groom.place,
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let vmData: any = null;
    try {
      const vmRes = await callVM(VM_MILAN_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(vmPayload), signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!vmRes.ok) {
        const txt = await vmRes.text().catch(() => '');
        console.error('[Trikal] VM error post-payment:', vmRes.status, txt);
      } else {
        vmData = await vmRes.json();
      }
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] VM fetch failed post-payment:', e);
    }

    const slug = makeSlug();

    const { error: saveErr } = await supabase
      .from('kundali_milan')
      .insert({
        order_id:         order.id,
        slug,
        tier:             order.tier,
        audience:         order.audience,
        language:         order.language,
        bride_data:       bride,
        groom_data:       groom,
        ashtakoot_score:  vmData?.ashtakoot?.total_score ?? null,
        ashtakoot_data:   vmData?.ashtakoot              ?? null,
        manglik_data:     buildManglikData(vmData),           // v1.3: structured per-person + combined
        remedies_data:    vmData?.remedies                ?? null,
        gemini_narrative: null,
        pdf_url:          null,
      });

    if (saveErr) {
      console.error('[Trikal] Milan record save error:', saveErr.message);
      return NextResponse.json({
        success: true, paymentId: displayPaymentId,
        warning: 'Payment received. Reading is being prepared — please contact us if result page does not load.',
      }, { status: 200 });
    }

    const tierLabel =
      order.tier === 'basic_51'        ? 'Basic Milan (Rs51)'            :
      order.tier === 'deep_101_couple' ? 'Deep Reading - Couple (Rs101)' :
      order.tier === 'deep_101_parent' ? 'Deep Reading - Parent (Rs101)' :
      order.tier === 'both_151'        ? 'Both Versions (Rs151)'         : order.tier;

    const waText = encodeURIComponent(
      `Jai Mahakaal! Trikaal Vaani Kundali Milan confirm ho gaya.\n\n` +
      `Tier: ${tierLabel}\nBride: ${bride.name}\nGroom: ${groom.name}\n` +
      `Payment ID: ${displayPaymentId}\n` +
      `Result: trikalvaani.com/milan/${slug}\n\nJai Maa Shakti!`
    );

    return NextResponse.json({
      success: true, slug, tier: order.tier, audience: order.audience,
      language: order.language, paymentId: displayPaymentId,
      amount: order.amount_rupees,
      resultUrl:   `https://trikalvaani.com/milan/${slug}`,
      whatsappUrl: `https://wa.me/919211804111?text=${waText}`,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Verify Milan payment error:', err);
    return NextResponse.json({ error: 'Server error during verification.' }, { status: 500 });
  }
}
