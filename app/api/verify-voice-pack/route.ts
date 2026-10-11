/**
 * ============================================================
 * TRIKAL VAANI — Verify Voice Pack Payment API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/verify-voice-pack/route.ts
 * VERSION: 1.2 (11 Oct 2026) — GOOGLE PLAY (Play Store app) voice packs
 *   CEO APPROVAL: Rohiit Gupta ne 11 Oct 2026 ko is locked file ko edit karne
 *   ki manzoori di ("STRICT CEO ORDER" ke baavajood — approval GRANTED).
 *   Body mein `play_purchase_token` ho tabhi naya Play branch chalta hai —
 *   SABSE PEHLE, aur wahin return karta hai. Razorpay aur PayPal ka code
 *   neeche EK BYTE NAHI badla; bina Play token ki request pehle jaisi.
 *   Play branch:
 *     1. packId (p11/p51/p101) -> productKey voice_1q / voice_5q / voice_12q.
 *        Pack ka daam/sawaal/validity server ki apni table se — browser se
 *        kuch nahi. Token kis product ka hai, Google khud batata hai
 *        (galat pack ka token = Google 4xx = mana).
 *     2. verifyAndClaimPlay(productKey, token, 'voice_packs') — Google se
 *        verify + ek Play order = ek pack.
 *     3. Agar is Play order ka pack pehle ban chuka (jawab raaste mein kho
 *        gaya tha) — naya pack NAHI, wahi balance lautao.
 *     4. Warna voice_packs mein seedha 'active' row (wahi row jo Razorpay
 *        verify ke baad active hoti hai) — play_order_id ke saath.
 *     5. Safal: finishPlay (fulfilled + token consume). Fail: releasePlay.
 *   ⚠️ SQL chahiye (Play rows ke liye): voice_packs.play_order_id column.
 *   Gemini: is file mein koi Gemini model nahi.
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
import { verifyAndClaimPlay, finishPlay, releasePlay } from '@/lib/play-billing-server'; // v1.2

export const runtime = 'nodejs';
export const maxDuration = 15;

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── v1.2: Google Play voice packs (server-side authoritative) ─────────────
// MUST mirror PACKS in app/api/voice-pack-order/route.ts (questions, validity,
// rupee price). A Next.js route file may not export extra values, so the
// table is repeated here rather than imported.
const PLAY_PACKS: Record<string, {
  productKey: 'voice_1q' | 'voice_5q' | 'voice_12q';
  price: number; questions: number; validityDays: number;
}> = {
  p11:  { productKey: 'voice_1q',  price: 11,  questions: 1,  validityDays: 1  },
  p51:  { productKey: 'voice_5q',  price: 51,  questions: 5,  validityDays: 7  },
  p101: { productKey: 'voice_12q', price: 101, questions: 12, validityDays: 30 },
};

async function activeBalance(sb: ReturnType<typeof supabaseAdmin>, sessionId: string) {
  const { data: allActive } = await sb
    .from('voice_packs')
    .select('questions_left, valid_until')
    .eq('session_id', sessionId)
    .eq('status', 'active')
    .gt('valid_until', new Date().toISOString());
  return (allActive || []).reduce((sum, p) => sum + (p.questions_left || 0), 0);
}

/** v1.2 — Play Store app only. Reached only when the body carries play_purchase_token. */
async function handlePlay(body: any): Promise<NextResponse> {
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
  if (!sessionId) {
    return NextResponse.json({ error: 'Session required' }, { status: 401 });
  }
  const pack = PLAY_PACKS[String(body?.packId ?? '')];
  if (!pack) {
    return NextResponse.json({ error: 'Invalid pack' }, { status: 400 });
  }

  const gate = await verifyAndClaimPlay(pack.productKey, body.play_purchase_token, 'voice_packs');
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.error, code: gate.code, existingRef: gate.existingRef ?? null },
      { status: gate.status }
    );
  }

  const sb = supabaseAdmin();
  try {
    // Idempotency: this Play order already produced a pack (a previous call
    // inserted it but the answer or the 'fulfilled' mark was lost).
    const { data: already, error: dupErr } = await sb
      .from('voice_packs')
      .select('id, session_id, valid_until')
      .eq('play_order_id', gate.orderId)
      .limit(1);
    if (dupErr) throw new Error(`dup check: ${dupErr.message}`);
    if (already && already.length > 0) {
      await finishPlay(gate, String(already[0].id));
      const sid = already[0].session_id as string;
      return NextResponse.json({
        success   : true,
        provider  : 'play',
        orderId   : gate.orderId,
        balance   : await activeBalance(sb, sid),
        validUntil: already[0].valid_until,
      });
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + pack.validityDays);

    const { data: row, error: insErr } = await sb
      .from('voice_packs')
      .insert({
        session_id     : sessionId,
        pack_id        : String(body.packId),
        // amount_paid is NOT NULL and is the rupee column (same as PayPal rows).
        // Outside India Google charges a local price we do not know here, so
        // currency says 'PLAY' and play_purchases holds the details.
        amount_paid    : pack.price,
        currency       : gate.currency,
        questions_total: pack.questions,
        questions_used : 0,
        validity_days  : pack.validityDays,
        valid_until    : validUntil.toISOString(),
        status         : 'active',
        play_order_id  : gate.orderId,
      })
      .select('id')
      .single();
    if (insErr || !row) throw new Error(`insert: ${insErr?.message ?? 'no row'}`);

    await finishPlay(gate, String(row.id));
    console.log(`[VoicePack Verify v1.2] Play pack active | ${body.packId} | order:${gate.orderId} | region:${gate.regionCode ?? '?'}`);

    return NextResponse.json({
      success   : true,
      provider  : 'play',
      orderId   : gate.orderId,
      balance   : await activeBalance(sb, sessionId),
      validUntil: validUntil.toISOString(),
    });
  } catch (e: any) {
    console.error(`[VoicePack Verify v1.2] Play activation failed | order:${gate.orderId}: ${e?.message}`);
    await releasePlay(gate);   // same payment can be retried; token NOT consumed
    return NextResponse.json(
      { error: 'Payment is verified but the pack could not be activated right now. Please retry in a minute — you will not be charged again.', code: 'PLAY_ACTIVATION_FAILED' },
      { status: 503 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── v1.2: Google Play branch — checked FIRST, returns. Requests without
    // play_purchase_token never enter it and run the code below unchanged.
    if (body?.play_purchase_token) {
      return await handlePlay(body);
    }
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
// END — app/api/verify-voice-pack/route.ts v1.2
