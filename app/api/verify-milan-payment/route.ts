/**
 * ============================================================
 * TRIKAL VAANI — Kundali Milan Payment Verification API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/verify-milan-payment/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * 1. Verifies Razorpay HMAC-SHA256 signature
 * 2. Loads order from Supabase (server-trusted tier + birth data)
 * 3. Calls VM /milan-compute with bride + groom data
 * 4. Saves full Milan record to `kundali_milan` table
 * 5. Returns slug for /milan/[slug] result page
 * 6. Builds WhatsApp confirmation link
 *
 * NOTE: Gemini narrative generation (Day 5) is intentionally
 * NOT triggered here. This route only persists the engine output
 * and creates the record. A separate /api/milan-narrative route
 * (Day 5) will populate `gemini_narrative` on the result page.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const VM_MILAN_ENDPOINT =
  process.env.VM_MILAN_ENDPOINT ?? 'http://34.14.164.105:8001/milan-compute';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MilanVerifyRequest {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
}

// ── Slug generator: stable, URL-safe ─────────────────────────
function makeSlug(): string {
  const ts  = Date.now().toString(36);
  const rnd = crypto.randomBytes(4).toString('hex');
  return `m-${ts}-${rnd}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: MilanVerifyRequest = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment fields.' },
        { status: 400 }
      );
    }

    // ── HMAC-SHA256 signature verification ────────────────
    const secret  = process.env.RAZORPAY_KEY_SECRET!;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expected !== razorpay_signature) {
      console.error('[Trikal] Milan signature mismatch:', razorpay_order_id);
      return NextResponse.json(
        { error: 'Payment verification failed.' },
        { status: 400 }
      );
    }

    // ── Load order (server-trusted source of truth) ────────
    const { data: order, error: orderErr } = await supabase
      .from('kundali_milan_orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (orderErr || !order) {
      console.error('[Trikal] Milan order not found:', razorpay_order_id, orderErr?.message);
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    // Idempotency: if already verified + saved, return existing slug
    if (order.payment_verified === true) {
      const { data: existing } = await supabase
        .from('kundali_milan')
        .select('slug')
        .eq('order_id', order.id)
        .maybeSingle();

      if (existing?.slug) {
        return NextResponse.json({
          success:   true,
          slug:      existing.slug,
          tier:      order.tier,
          audience:  order.audience,
          paymentId: razorpay_payment_id,
          resultUrl: `https://trikalvaani.com/milan/${existing.slug}`,
          replay:    true,
        });
      }
    }

    // ── Mark order paid ────────────────────────────────────
    await supabase
      .from('kundali_milan_orders')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status:           'paid',
        payment_verified: true,
        paid_at:          new Date().toISOString(),
      })
      .eq('id', order.id);

    // ── Build VM payload from server-trusted birth data ────
    const bride = order.bride_data;
    const groom = order.groom_data;

    const vmPayload = {
      bride: {
        name:      bride.name,
        gender:    bride.gender ?? 'female',
        year:      Number(bride.dob.slice(0, 4)),
        month:     Number(bride.dob.slice(5, 7)),
        day:       Number(bride.dob.slice(8, 10)),
        hour:      Number(bride.tob.slice(0, 2)),
        minute:    Number(bride.tob.slice(3, 5)),
        latitude:  bride.latitude,
        longitude: bride.longitude,
        timezone:  bride.timezone,
        place:     bride.place,
      },
      groom: {
        name:      groom.name,
        gender:    groom.gender ?? 'male',
        year:      Number(groom.dob.slice(0, 4)),
        month:     Number(groom.dob.slice(5, 7)),
        day:       Number(groom.dob.slice(8, 10)),
        hour:      Number(groom.tob.slice(0, 2)),
        minute:    Number(groom.tob.slice(3, 5)),
        latitude:  groom.latitude,
        longitude: groom.longitude,
        timezone:  groom.timezone,
        place:     groom.place,
      },
    };

    // ── Call VM /milan-compute ─────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let vmData: any = null;
    try {
      const vmRes = await fetch(VM_MILAN_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(vmPayload),
        signal:  controller.signal,
        cache:   'no-store',
      });
      clearTimeout(timeout);

      if (!vmRes.ok) {
        const txt = await vmRes.text().catch(() => '');
        console.error('[Trikal] VM /milan-compute error post-payment:', vmRes.status, txt);
        // Don't fail the user — we still create the record and let Day 5
        // narrative route retry. Payment is locked in.
      } else {
        vmData = await vmRes.json();
      }
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] VM /milan-compute fetch failed post-payment:', e);
      // Same as above — proceed with record creation.
    }

    // ── Save final Milan record ────────────────────────────
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
        ashtakoot_data:   vmData?.ashtakoot      ?? null,
        manglik_data:     vmData?.manglik        ?? null,
        remedies_data:    vmData?.remedies       ?? null,
        gemini_narrative: null,  // Day 5 fills this
        pdf_url:          null,  // Day 6 fills this
      });

    if (saveErr) {
      console.error('[Trikal] Milan record save error:', saveErr.message);
      // Critical: payment is verified but record failed.
      // Return slug-less response so client can show support contact.
      return NextResponse.json(
        {
          success:   true,
          paymentId: razorpay_payment_id,
          warning:   'Payment received. Reading is being prepared — please contact us if the result page does not load.',
        },
        { status: 200 }
      );
    }

    // ── Build WhatsApp confirmation link ───────────────────
    const tierLabel =
      order.tier === 'basic_51'        ? 'Basic Milan (₹51)' :
      order.tier === 'deep_101_couple' ? 'Deep Reading — Couple (₹101)' :
      order.tier === 'deep_101_parent' ? 'Deep Reading — Parent (₹101)' :
      order.tier === 'both_151'        ? 'Both Versions (₹151)' :
                                         order.tier;

    const waText = encodeURIComponent(
      `🙏 Jai Mahakaal! Trikal Vaani Kundali Milan confirm ho gaya.\n\n` +
      `Tier: ${tierLabel}\n` +
      `Bride: ${bride.name}\n` +
      `Groom: ${groom.name}\n` +
      `Payment ID: ${razorpay_payment_id}\n` +
      `Result: trikalvaani.com/milan/${slug}\n\n` +
      `Jai Maa Shakti! 🔱`
    );

    return NextResponse.json({
      success:     true,
      slug,
      tier:        order.tier,
      audience:    order.audience,
      language:    order.language,
      paymentId:   razorpay_payment_id,
      amount:      order.amount_rupees,
      resultUrl:   `https://trikalvaani.com/milan/${slug}`,
      whatsappUrl: `https://wa.me/919211804111?text=${waText}`,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Verify Milan payment error:', err);
    return NextResponse.json(
      { error: 'Server error during verification.' },
      { status: 500 }
    );
  }
}
