/**
 * ============================================================
 * TRIKAL VAANI — Verify Voice Pack Payment API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/verify-voice-pack/route.ts
 * VERSION: 1.0 — Razorpay signature verification + activate pack
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

export const runtime = 'nodejs';
export const maxDuration = 15;

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sessionId,
    } = body;

    // ── Validate inputs ─────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment fields' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

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

    // ── Activate pack in Supabase ───────────────────────────
    const sb = supabaseAdmin();

    // Reset valid_until from now (pack starts on payment, not order)
    const { data: existingPack, error: fetchError } = await sb
      .from('voice_packs')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
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
        razorpay_payment_id,
        status      : 'active',
        valid_until : validUntil.toISOString(),
        updated_at  : new Date().toISOString(),
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
      success    : true,
      paymentId  : razorpay_payment_id,
      orderId    : razorpay_order_id,
      balance    : totalBalance,
      validUntil : validUntil.toISOString(),
    });

  } catch (err) {
    console.error('[VoicePack Verify] Error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status : 'Trikal Voice Pack Verify API is live',
    version: '1.0',
  });
}
