// TRIKAL VAANI - Kundali Milan Payment Verification API
// CEO: Rohiit Gupta
// File: app/api/verify-milan-payment/route.ts
// VERSION: 1.2 - manglik_data fix
// v1.2 ONLY CHANGE: vmData?.manglik -> vmData?.manglik_evaluation
//   VM milan_engine.py returns key "manglik_evaluation" (Section 6 of engine).
//   v1.1 read vmData?.manglik which was always undefined -> saved NULL.
//   Now manglik_data saves correctly -> narrative route 500 fixed.
//   Mangal Dosh shows in every tier result. All other logic identical to v1.1.

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
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }

    const secret   = process.env.RAZORPAY_KEY_SECRET!;
    const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (expected !== razorpay_signature) {
      console.error('[Trikal] Milan signature mismatch:', razorpay_order_id);
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    const { data: order, error: orderErr } = await supabase
      .from('kundali_milan_orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
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
          audience: order.audience, paymentId: razorpay_payment_id,
          resultUrl: `https://trikalvaani.com/milan/${existing.slug}`, replay: true,
        });
      }
    }

    await supabase
      .from('kundali_milan_orders')
      .update({
        razorpay_payment_id, razorpay_signature,
        status: 'paid', payment_verified: true, paid_at: new Date().toISOString(),
      })
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
      const vmRes = await fetch(VM_MILAN_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vmPayload), signal: controller.signal, cache: 'no-store',
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
        ashtakoot_score:  vmData?.ashtakoot?.total_score    ?? null,
        ashtakoot_data:   vmData?.ashtakoot                 ?? null,
        manglik_data:     vmData?.manglik_evaluation        ?? null,  // v1.2 FIX
        remedies_data:    vmData?.remedies                  ?? null,
        gemini_narrative: null,
        pdf_url:          null,
      });

    if (saveErr) {
      console.error('[Trikal] Milan record save error:', saveErr.message);
      return NextResponse.json({
        success: true, paymentId: razorpay_payment_id,
        warning: 'Payment received. Reading is being prepared  please contact us if result page does not load.',
      }, { status: 200 });
    }

    const tierLabel =
      order.tier === 'basic_51'        ? 'Basic Milan (Rs51)'            :
      order.tier === 'deep_101_couple' ? 'Deep Reading - Couple (Rs101)' :
      order.tier === 'deep_101_parent' ? 'Deep Reading - Parent (Rs101)' :
      order.tier === 'both_151'        ? 'Both Versions (Rs151)'         : order.tier;

    const waText = encodeURIComponent(
      `Jai Mahakaal! Trikal Vaani Kundali Milan confirm ho gaya.\n\n` +
      `Tier: ${tierLabel}\nBride: ${bride.name}\nGroom: ${groom.name}\n` +
      `Payment ID: ${razorpay_payment_id}\n` +
      `Result: trikalvaani.com/milan/${slug}\n\nJai Maa Shakti!`
    );

    return NextResponse.json({
      success: true, slug, tier: order.tier, audience: order.audience,
      language: order.language, paymentId: razorpay_payment_id,
      amount: order.amount_rupees,
      resultUrl:   `https://trikalvaani.com/milan/${slug}`,
      whatsappUrl: `https://wa.me/919211804111?text=${waText}`,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Verify Milan payment error:', err);
    return NextResponse.json({ error: 'Server error during verification.' }, { status: 500 });
  }
}
