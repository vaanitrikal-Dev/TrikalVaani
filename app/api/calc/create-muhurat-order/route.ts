// TRIKAL VAANI - Child Birth Muhurat Paid Report - Order Creation API
// CEO: Rohiit Gupta
// File: app/api/calc/create-muhurat-order/route.ts
// VERSION: 1.0
// Tiers: report_101 (Rs101) / remedies_151 (Rs151). Mirrors create-karmic-order.
// Pay-first flow: creates Razorpay order + saves pending muhurat_orders row.

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// CEO LOCKED pricing
const TIERS: Record<string, { rupees: number; paise: number; label: string }> = {
  report_101:   { rupees: 101, paise: 10100, label: 'Full Muhurat Report' },
  remedies_151: { rupees: 151, paise: 15100, label: 'Full Report + 10 Remedies' },
};

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate the parent's CHOSEN delivery moment + location.
// Form may send lat/lng or latitude/longitude. Returns null if invalid.
function normaliseMuhurat(m: any) {
  if (!m || typeof m !== 'object') return null;

  const year   = Number(m.year);
  const month  = Number(m.month);
  const day    = Number(m.day);
  const hour   = Number(m.hour);
  const minute = Number(m.minute);

  const latitude  = typeof m.latitude  === 'number' ? m.latitude  : (typeof m.lat === 'number' ? m.lat : null);
  const longitude = typeof m.longitude === 'number' ? m.longitude : (typeof m.lng === 'number' ? m.lng : null);

  if (!Number.isInteger(year) || year < 2024 || year > 2030) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(day) || day < 1 || day > 31) return null;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  if (typeof latitude !== 'number' || Math.abs(latitude) > 90) return null;
  if (typeof longitude !== 'number' || Math.abs(longitude) > 180) return null;

  return {
    year, month, day, hour, minute,
    latitude, longitude,
    timezone: typeof m.timezone === 'number' ? m.timezone : 5.5,
    city:     m.city     ?? m.cityName ?? '',
    hospital: m.hospital ?? '',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();

    // Tier
    const tierKey = body.tier ?? 'report_101';
    const tier = TIERS[tierKey];
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier.' }, { status: 400 });
    }

    // The parent's chosen delivery moment (form may send body.muhurat OR top-level)
    const muhurat = normaliseMuhurat(body.muhurat ?? body);
    if (!muhurat) {
      return NextResponse.json({ error: 'Invalid muhurat data.' }, { status: 400 });
    }

    // Language: muhurat uses hi/en (matching VM)
    const lang = body.language ?? 'hi';
    const language = ['hi', 'en'].includes(lang) ? lang : 'hi';

    // Contact (form: contact.{name,mobile,email})
    const contact = body.contact ?? {};
    const userName   = contact.name   ?? body.userName   ?? null;
    const userMobile = contact.mobile ?? body.userMobile ?? null;
    const userEmail  = contact.email  ?? body.userEmail  ?? null;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount:   tier.paise,
      currency: 'INR',
      receipt:  `tv_muhurat_${Date.now()}`,
      notes: {
        platform:  'Trikal Vaani',
        purpose:   'Child Birth Muhurat Report',
        tier:      tierKey,
        language,
        architect: 'Rohiit Gupta',
      },
    });

    // Save pending order (muhurat_data stored here for verify-payment)
    const { error: dbErr } = await supabase
      .from('muhurat_orders')
      .insert({
        razorpay_order_id: order.id,
        amount_rupees:     tier.rupees,
        amount_paise:      tier.paise,
        currency:          'INR',
        tier:              tierKey,
        language,
        muhurat_data:      muhurat,
        user_name:         userName,
        user_mobile:       userMobile,
        user_email:        userEmail,
        status:            'created',
        payment_verified:  false,
      });

    if (dbErr) {
      console.error('[Trikal] Muhurat order save error:', dbErr.message);
      // Order created on Razorpay; verify route can still proceed.
    }

    return NextResponse.json({
      orderId:      order.id,
      amount:       order.amount,
      amountRupees: tier.rupees,
      currency:     order.currency,
      keyId:        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      tier:         tierKey,
      language,
      label:        tier.label,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Muhurat order error:', err);
    return NextResponse.json(
      { error: 'Could not create Muhurat order. Please try again.' },
      { status: 500 }
    );
  }
}
