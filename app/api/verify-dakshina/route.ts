/**
 * ============================================================
 * TRIKAL VAANI — Dakshina Order Creation API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/create-dakshina-order/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Maa Shakti Dakshina — variable amount Razorpay flow
 * Validates amount is in allowed Arzi or Dhanyawad list
 * (anti-tamper: user can NOT send arbitrary amounts)
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// ── Allowed amounts (rupees, NOT paise) ──────────────────────
const ARZI_ALLOWED = [101, 201, 501, 1001, 2101, 5001, 11000, 21000, 51000, 108000];
const DHANYAWAD_ALLOWED = [101, 251, 501, 1008, 2501, 5001, 10001, 21000, 51000, 108000];

// "Apni dakshina" — custom amount within sane limits (₹51 to ₹5,00,000)
const CUSTOM_MIN = 51;
const CUSTOM_MAX = 500000;

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface DakshinaRequest {
  type: 'arzi' | 'dhanyawad';
  amount: number;        // in rupees
  reportSlug?: string;   // optional — links dakshina to a report
  isCustom?: boolean;    // true if user picked "Apni dakshina"
}

export async function POST(req: NextRequest) {
  try {
    const body: DakshinaRequest = await req.json();
    const { type, amount, reportSlug, isCustom } = body;

    // ── Validate type ──────────────────────────────────────
    if (type !== 'arzi' && type !== 'dhanyawad') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "arzi" or "dhanyawad".' },
        { status: 400 }
      );
    }

    // ── Validate amount ────────────────────────────────────
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount.' },
        { status: 400 }
      );
    }

    // For "Apni dakshina" — validate within range only
    if (isCustom) {
      if (amount < CUSTOM_MIN || amount > CUSTOM_MAX) {
        return NextResponse.json(
          { error: `Custom dakshina must be between ₹${CUSTOM_MIN} and ₹${CUSTOM_MAX.toLocaleString('en-IN')}.` },
          { status: 400 }
        );
      }
    } else {
      // For preset buttons — must match exact allowed list (anti-tamper)
      const allowedList = type === 'arzi' ? ARZI_ALLOWED : DHANYAWAD_ALLOWED;
      if (!allowedList.includes(amount)) {
        return NextResponse.json(
          { error: 'Amount not in allowed list. Please choose from preset options or use "Apni dakshina".' },
          { status: 400 }
        );
      }
    }

    // ── Convert rupees → paise for Razorpay ────────────────
    const amountPaise = Math.round(amount * 100);

    // ── Create Razorpay Order ──────────────────────────────
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `tv_dak_${type}_${Date.now()}`,
      notes: {
        platform: 'Trikal Vaani',
        purpose: 'Maa Shakti Dakshina',
        type,
        is_custom: isCustom ? 'true' : 'false',
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
    return NextResponse.json(
      { error: 'Could not create dakshina order. Please try again.' },
      { status: 500 }
    );
  }
}
