/**
 * ============================================================
 * TRIKAL VAANI — Voice Pack Order API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-pack-order/route.ts
 * VERSION: 1.0 — Razorpay order creation + balance management
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * PURPOSE:
 *   POST   → Create Razorpay order for ₹11 / ₹51 / ₹101 voice pack
 *   PATCH  → Decrement question balance after each voice reply
 *   GET    → Fetch current balance for session
 *
 * PACKS:
 *   p11  → ₹11   • 1 question  • 1-day validity
 *   p51  → ₹51   • 5 questions • 7-day validity
 *   p101 → ₹101  • 12 questions • 30-day validity
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 15;

// ── Pack definitions (server-side authoritative) ──────────────
const PACKS: Record
  string,
  { price: number; questions: number; validityDays: number; label: string }
> = {
  p11 : { price: 11,  questions: 1,  validityDays: 1,  label: 'Trikal Voice — Try'        },
  p51 : { price: 51,  questions: 5,  validityDays: 7,  label: 'Trikal Voice — Sapt Darshan'},
  p101: { price: 101, questions: 12, validityDays: 30, label: 'Trikal Voice — Bhakt'      },
};

// ── Supabase admin client ─────────────────────────────────────
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── Razorpay client ───────────────────────────────────────────
function razorpayClient() {
  return new Razorpay({
    key_id    : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// ── POST — Create order ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { packId, sessionId } = await req.json();

    if (!packId || !PACKS[packId]) {
      return NextResponse.json({ error: 'Invalid pack' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    const pack = PACKS[packId];

    // Create Razorpay order
    const rzp = razorpayClient();
    const order = await rzp.orders.create({
      amount  : pack.price * 100, // paise
      currency: 'INR',
      receipt : `tv_${packId}_${Date.now()}`,
      notes   : {
        sessionId,
        packId,
        product: 'trikal_voice_pack',
      },
    });

    // Insert pending pack in Supabase
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + pack.validityDays);

    const sb = supabaseAdmin();
    const { error: insertError } = await sb.from('voice_packs').insert({
      session_id        : sessionId,
      pack_id           : packId,
      amount_paid       : pack.price,
      questions_total   : pack.questions,
      questions_used    : 0,
      validity_days     : pack.validityDays,
      valid_until       : validUntil.toISOString(),
      razorpay_order_id : order.id,
      status            : 'pending',
    });

    if (insertError) {
      console.error('[VoicePack] Insert error:', insertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success : true,
      orderId : order.id,
      amount  : pack.price,
      pack    : pack.label,
    });

  } catch (err) {
    console.error('[VoicePack POST] Error:', err);
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
  }
}

// ── PATCH — Consume one question ──────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, action } = await req.json();

    if (!sessionId || action !== 'consume') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // Find active pack with questions remaining
    const { data: packs, error: fetchError } = await sb
      .from('voice_packs')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .gt('questions_left', 0)
      .gt('valid_until', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError || !packs || packs.length === 0) {
      return NextResponse.json(
        { error: 'No active pack with balance' },
        { status: 402 }
      );
    }

    const pack = packs[0];
    const newUsed = pack.questions_used + 1;
    const exhausted = newUsed >= pack.questions_total;

    const { error: updateError } = await sb
      .from('voice_packs')
      .update({
        questions_used: newUsed,
        status        : exhausted ? 'exhausted' : 'active',
        updated_at    : new Date().toISOString(),
      })
      .eq('id', pack.id);

    if (updateError) {
      console.error('[VoicePack PATCH] Update error:', updateError);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success      : true,
      questionsLeft: pack.questions_total - newUsed,
      exhausted,
    });

  } catch (err) {
    console.error('[VoicePack PATCH] Error:', err);
    return NextResponse.json({ error: 'Consume failed' }, { status: 500 });
  }
}

// ── GET — Current balance ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { data: packs } = await sb
      .from('voice_packs')
      .select('questions_left, valid_until, pack_id')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .gt('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    const totalLeft = (packs || []).reduce(
      (sum, p) => sum + (p.questions_left || 0),
      0
    );

    return NextResponse.json({
      balance   : totalLeft,
      validUntil: packs?.[0]?.valid_until || null,
      packs     : packs || [],
    });

  } catch (err) {
    console.error('[VoicePack GET] Error:', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
