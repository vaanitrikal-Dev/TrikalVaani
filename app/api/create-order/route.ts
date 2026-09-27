/**
 * ============================================================
 * TRIKAL VAANI — Razorpay Order Creation API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/create-order/route.ts
 * VERSION: 1.1 (27 Sep 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * v1.1 (27 Sep 2026) — PAYMENT SE PEHLE BIRTH DATA SAVE.
 *   27 Sep 10:39am: customer 9250886991 ne ₹51 pay kiya (PhonePe), UPI app
 *   se wapas aane par browser tab reload ho gaya, /api/predict KABHI call
 *   nahi hua (Vercel logs se proof). Paisa captured, report zero, aur birth
 *   details kahin save nahi thi — server chahta bhi to report nahi bana sakta.
 *
 *   Ab BirthForm order banate waqt poora predict body bhejta hai
 *   (`predictBody`). Yeh route use `paid_order_intents` table mein Razorpay
 *   order id ke saath save karta hai. /api/cron/paid-recovery har 5 min
 *   dekhta hai: paisa aaya par report nahi bani → isi saved body se report
 *   khud banata hai aur CEO ko link bhejta hai.
 *
 *   SAFETY: save fail ho to bhi order banega — payment kabhi block nahi hoga.
 *   `predictBody` optional hai: Swapna aur Upgrade (jo abhi ise nahi bhejte)
 *   bilkul pehle jaise chalte hain. Price aaj bhi sirf server tay karta hai.
 * ============================================================
 * SECURITY: RAZORPAY_KEY_SECRET is server-only (no NEXT_PUBLIC_)
 * This route runs server-side — secret never exposed to browser.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// ── Allowed amounts (paise) — ANTI-TAMPER ────────────────────
// Server controls price, NOT client. Stops users from sending ₹1.
const ALLOWED_AMOUNTS: Record<string, number> = {
  deep: 5100,   // ₹51 Deep Reading (Gemini Pro + Claude polish)
  voice: 1100,  // ₹11 Voice Reading (Trikaal Voice)
};

// v1.1 — predict body 60 KB se bada nahi hona chahiye (asli body ~2 KB hai)
const MAX_INTENT_BYTES = 60_000;

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// v1.1 — service role, sirf server par
function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// v1.1 — sirf asli Deep Reading body hi save ho. Kabhi throw nahi karta.
async function saveIntent(orderId: string, predictBody: any): Promise<void> {
  try {
    if (!predictBody || typeof predictBody !== 'object') return;
    if (predictBody.predictionTier !== 'paid') return;
    if (!predictBody.birthData?.dob) return;
    const size = JSON.stringify(predictBody).length;
    if (size > MAX_INTENT_BYTES) {
      console.error(`[Trikal] intent too large (${size} bytes) — not saved | ${orderId}`);
      return;
    }
    // Payment proof kabhi save nahi hota — cron use khud banata hai
    const clean = { ...predictBody, paymentVerification: null, paypalVerification: null };
    const { error } = await admin().from('paid_order_intents').insert({
      razorpay_order_id: orderId,
      product:           'deep',
      predict_body:      clean,
      customer_mobile:   String(predictBody.userContext?.mobile ?? '').slice(0, 20) || null,
      customer_name:     String(predictBody.birthData?.name ?? '').slice(0, 100) || null,
    });
    if (error) console.error('[Trikal] intent save failed:', error.message, orderId);
    else console.log(`[Trikal] intent saved | ${orderId}`);
  } catch (e) {
    console.error('[Trikal] intent save threw:', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, predictBody } = body; // 'deep' | 'voice'

    if (!tier || !ALLOWED_AMOUNTS[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "deep" or "voice".' },
        { status: 400 }
      );
    }

    const amount = ALLOWED_AMOUNTS[tier];

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `tv_${tier}_${Date.now()}`,
      notes: {
        platform: 'Trikaal Vaani',
        tier,
        architect: 'Rohiit Gupta',
      },
    });

    // v1.1 — order ban gaya, ab birth data save (fail hua to bhi order jaata hai)
    if (tier === 'deep' && predictBody) {
      await saveIntent(order.id, predictBody);
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Razorpay order error:', err);
    return NextResponse.json(
      { error: 'Could not create payment order. Please try again.' },
      { status: 500 }
    );
  }
}
// END — app/api/create-order/route.ts v1.1
