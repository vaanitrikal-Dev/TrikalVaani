/**
 * ============================================================
 * TRIKAL VAANI — Dakshina Verification API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/verify-dakshina/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Verifies HMAC-SHA256 signature server-side and saves
 * dakshina record to Supabase `dakshina` table.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DakshinaVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  type: 'arzi' | 'dhanyawad';
  amount: number;             // rupees
  reportSlug?: string;
  devoteeName?: string;
  devoteeMobile?: string;
  message?: string;           // optional dil ki baat
}

export async function POST(req: NextRequest) {
  try {
    const body: DakshinaVerifyRequest = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type,
      amount,
      reportSlug,
      devoteeName,
      devoteeMobile,
      message,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment fields.' },
        { status: 400 }
      );
    }

    // ── HMAC-SHA256 signature verification ────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expected !== razorpay_signature) {
      console.error('[Trikal] Dakshina signature mismatch');
      return NextResponse.json(
        { error: 'Payment verification failed.' },
        { status: 400 }
      );
    }

    // ── Save to Supabase dakshina table ───────────────────
    const { error } = await supabase.from('dakshina').insert({
      type,
      amount_rupees:       amount,
      amount_paise:        Math.round(amount * 100),
      razorpay_order_id,
      razorpay_payment_id,
      report_slug:         reportSlug ?? null,
      devotee_name:        devoteeName ?? null,
      devotee_mobile:      devoteeMobile ?? null,
      message:             message ? message.slice(0, 500) : null,
      payment_verified:    true,
      created_at:          new Date().toISOString(),
    });

    if (error) {
      console.error('[Trikal] Dakshina save error:', error.message);
      // Even if save fails, payment IS done — don't fail the user response
    }

    // ── Build WhatsApp confirmation link to Rohiit ────────
    const blessing = type === 'arzi'
      ? '🙏 Maa ne aapki Arzi sweekar kar li hai. Rohiit ji aapko personally connect karenge.'
      : '🌺 Maa ka Dhanyawad pahunch gaya. Aapki bhakti par Maa ki kripa banaye rakhe.';

    const waMessage = encodeURIComponent(
      `${type === 'arzi' ? 'Pranam Rohiit ji, Maa ko Arzi karna chahta hoon.' : 'Jai Maa Shakti! Maa ne meri sun li.'}\n\nDakshina: ₹${amount.toLocaleString('en-IN')}\nPayment ID: ${razorpay_payment_id}\n${reportSlug ? `Report: trikalvaani.com/report/${reportSlug}\n` : ''}${message ? `\nDil ki baat: ${message}` : ''}\n\nJai Maa Shakti! 🔱`
    );

    return NextResponse.json({
      success: true,
      type,
      paymentId: razorpay_payment_id,
      amount,
      blessing,
      whatsappUrl: `https://wa.me/919211804111?text=${waMessage}`,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Verify dakshina error:', err);
    return NextResponse.json(
      { error: 'Server error during verification.' },
      { status: 500 }
    );
  }
}
