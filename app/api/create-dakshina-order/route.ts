/**
 * ============================================================
 * TRIKAL VAANI — Dakshina Order Creation API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/create-dakshina-order/route.ts
 * VERSION: 1.1 (8 Nov 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * v1.1 (8 Nov 2026) — Rohiit ka faisla: "do not mention any amount ...
 *   do not put any limit on it .. client can pay any amount 1 or 1 million".
 *   - Fixed amount list (ARZI_ALLOWED / DHANYAWAD_ALLOWED) HATAYI.
 *   - ₹51 minimum aur ₹5,00,000 maximum HATAYA.
 *   - Ab koi bhi poora rupaya (integer) ₹1 ya usse upar chalega. Upar ki
 *     asli seema sirf Razorpay account ki per-transaction limit hai.
 *   - Paise (decimal) nahi — dakshina table mein amount_rupees integer hai.
 *   - `source` note joda (e.g. 'home') — reconciliation mein pehchaan ke liye.
 *   Homepage ka MaaArziPay (components/landing/MaaArziPay.tsx) isse call
 *   karta hai; payment ke baad Razorpay customer ko
 *   /api/dakshina-callback par bhejta hai (redirect mode).
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface DakshinaRequest {
  type: 'arzi' | 'dhanyawad';
  amount: number;        // in rupees (whole rupees)
  reportSlug?: string;   // optional — links dakshina to a report
  isCustom?: boolean;    // purane callers ke liye — ab koi farak nahi
  source?: string;       // v1.1 — kahan se aaya (e.g. 'home')
}

export async function POST(req: NextRequest) {
  try {
    const body: DakshinaRequest = await req.json();
    const { type, amount, reportSlug, source } = body;

    // ── Validate type ──────────────────────────────────────
    if (type !== 'arzi' && type !== 'dhanyawad') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "arzi" or "dhanyawad".' },
        { status: 400 }
      );
    }

    // ── Validate amount — v1.1: koi bhi poora rupaya, ₹1 se upar ──
    if (!Number.isSafeInteger(amount) || amount < 1) {
      return NextResponse.json(
        { error: 'Kripya dakshina poore rupaye mein likhein (₹1 ya usse zyada).' },
        { status: 400 }
      );
    }

    // ── Convert rupees → paise for Razorpay ────────────────
    const amountPaise = amount * 100;

    // ── Create Razorpay Order ──────────────────────────────
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `tv_dak_${type}_${Date.now()}`,
      notes: {
        platform: 'Trikaal Vaani',
        purpose: 'Maa Shakti Dakshina',
        type,
        is_custom: 'true',
        source: (source ?? '').slice(0, 30),
        report_slug: reportSlug ?? '',
        architect: 'Rohiit Gupta',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,        // paise
      amountRupees: amount,        // rupees (for display)
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      type,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Dakshina order error:', err);
    // Razorpay khud amount mana kare (account limit) to wahi sandesh dikhao
    const desc = (err as any)?.error?.description;
    return NextResponse.json(
      { error: desc ? `Payment order nahi bana: ${desc}` : 'Could not create dakshina order. Please try again.' },
      { status: 500 }
    );
  }
}
// END — app/api/create-dakshina-order/route.ts v1.1
