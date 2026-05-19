/**
 * ============================================================
 * TRIKAL VAANI — Kundali Milan Order Creation API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/create-milan-order/route.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Creates Razorpay order for Kundali Milan paid tiers.
 *
 * Pricing (IR-19, CEO LOCKED — anti-tamper, server-validated):
 *   basic_51         = ₹51   (Basic Ashtakoot + Manglik snapshot)
 *   deep_101_couple  = ₹101  (Deep Reading — Couple tone, Hinglish)
 *   deep_101_parent  = ₹101  (Deep Reading — Parent tone, Hindi)
 *   both_151         = ₹151  (Both Couple + Parent versions)
 *
 * Pattern mirrors /api/create-dakshina-order.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// ── CEO LOCKED Pricing (IR-19) ───────────────────────────────
const TIER_PRICING: Record<string, { rupees: number; audience: 'couple' | 'parent' | 'both'; label: string }> = {
  basic_51:        { rupees: 51,  audience: 'couple', label: 'Basic Milan'              },
  deep_101_couple: { rupees: 101, audience: 'couple', label: 'Deep Reading — Couple'    },
  deep_101_parent: { rupees: 101, audience: 'parent', label: 'Deep Reading — Parent'    },
  both_151:        { rupees: 151, audience: 'both',   label: 'Both Versions (Couple + Parent)' },
};

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Partner birth data shape (matches form) ──────────────────
interface PartnerData {
  name:      string;
  gender?:   'male' | 'female';
  dob:       string;   // YYYY-MM-DD
  tob:       string;   // HH:MM
  place:     string;
  latitude:  number;
  longitude: number;
  timezone:  number;   // hours offset
}

interface MilanOrderRequest {
  tier:      'basic_51' | 'deep_101_couple' | 'deep_101_parent' | 'both_151';
  language?: 'hinglish' | 'hindi' | 'english';
  bride:     PartnerData;
  groom:     PartnerData;
  userName?:   string;
  userMobile?: string;
  userEmail?:  string;
}

// ── Minimal partner validator ────────────────────────────────
function validPartner(p: unknown): p is PartnerData {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.name      === 'string' && o.name.trim().length > 0 &&
    typeof o.dob       === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.dob) &&
    typeof o.tob       === 'string' && /^\d{2}:\d{2}$/.test(o.tob) &&
    typeof o.place     === 'string' && o.place.trim().length > 0 &&
    typeof o.latitude  === 'number' && Math.abs(o.latitude)  <= 90 &&
    typeof o.longitude === 'number' && Math.abs(o.longitude) <= 180 &&
    typeof o.timezone  === 'number'
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: MilanOrderRequest = await req.json();
    const { tier, language, bride, groom, userName, userMobile, userEmail } = body;

    // ── Validate tier (anti-tamper) ────────────────────────
    if (!tier || !TIER_PRICING[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be basic_51, deep_101_couple, deep_101_parent, or both_151.' },
        { status: 400 }
      );
    }

    // ── Validate partners ──────────────────────────────────
    if (!validPartner(bride)) {
      return NextResponse.json({ error: 'Invalid bride birth data.' }, { status: 400 });
    }
    if (!validPartner(groom)) {
      return NextResponse.json({ error: 'Invalid groom birth data.' }, { status: 400 });
    }

    const { rupees, audience, label } = TIER_PRICING[tier];
    const amountPaise = rupees * 100;
    const lang = language ?? 'hinglish';

    // ── Create Razorpay Order ──────────────────────────────
    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `tv_milan_${tier}_${Date.now()}`,
      notes: {
        platform:  'Trikal Vaani',
        purpose:   'Kundali Milan',
        tier,
        audience,
        language:  lang,
        bride_name: bride.name,
        groom_name: groom.name,
        architect: 'Rohiit Gupta',
      },
    });

    // ── Save pending order to Supabase ─────────────────────
    const { error: dbErr } = await supabase
      .from('kundali_milan_orders')
      .insert({
        razorpay_order_id: order.id,
        amount_rupees:     rupees,
        amount_paise:      amountPaise,
        currency:          'INR',
        tier,
        audience,
        language:          lang,
        bride_data:        bride,
        groom_data:        groom,
        user_name:         userName ?? null,
        user_mobile:       userMobile ?? null,
        user_email:        userEmail ?? null,
        status:            'created',
        payment_verified:  false,
      });

    if (dbErr) {
      console.error('[Trikal] Milan order save error:', dbErr.message);
      // Order is created on Razorpay; we still return it so user can pay.
      // The verify route will UPSERT on success.
    }

    return NextResponse.json({
      orderId:      order.id,
      amount:       order.amount,        // paise
      amountRupees: rupees,              // for display
      currency:     order.currency,
      keyId:        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      tier,
      audience,
      label,
      language:     lang,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Milan order error:', err);
    return NextResponse.json(
      { error: 'Could not create Milan order. Please try again.' },
      { status: 500 }
    );
  }
}
