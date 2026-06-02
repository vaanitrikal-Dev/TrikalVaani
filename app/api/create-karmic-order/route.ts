// TRIKAL VAANI - Karmic Background Reading - Order Creation API
// CEO: Rohiit Gupta
// File: app/api/create-karmic-order/route.ts
// VERSION: 1.0
// Per Strategic Plan v2.0 §4 — Initiative C. Flat Rs251, single person.
// Mirrors create-milan-order pattern (Razorpay + Supabase pending order).

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// CEO LOCKED price — flat Rs251, no tiers.
const KARMIC_RUPEES = 251;
const KARMIC_PAISE  = 25100;

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Normalise the analysed person from form fields (lat/lng/cityName)
// OR canonical (latitude/longitude/place). Returns null if invalid.
function normalisePerson(p: any) {
  if (!p || typeof p !== 'object') return null;
  const latitude  = typeof p.latitude  === 'number' ? p.latitude  : (typeof p.lat === 'number' ? p.lat : null);
  const longitude = typeof p.longitude === 'number' ? p.longitude : (typeof p.lng === 'number' ? p.lng : null);
  const place     = p.place ?? p.cityName ?? '';
  const dob       = p.dob ?? '';
  const tob       = p.tob ?? '12:00';
  const name      = (p.name ?? '').trim();

  if (!name) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  if (!/^\d{2}:\d{2}$/.test(tob)) return null;
  if (typeof latitude !== 'number' || Math.abs(latitude) > 90) return null;
  if (typeof longitude !== 'number' || Math.abs(longitude) > 180) return null;
  if (!place) return null;

  return {
    name,
    dob,
    tob,
    place,
    cityName: place,
    latitude,
    longitude,
    timezone: typeof p.timezone === 'number' ? p.timezone : 5.5,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();

    // Person being analysed — form may send body.person OR top-level fields
    const person = normalisePerson(body.person ?? body);
    if (!person) {
      return NextResponse.json({ error: 'Invalid birth data.' }, { status: 400 });
    }

    const lang = body.language ?? 'hinglish';
    const allowedLang = ['hinglish', 'hindi', 'english'];
    const language = allowedLang.includes(lang) ? lang : 'hinglish';

    // Optional link back to a Milan reading (upsell path); null = standalone
    const sourceMilanSlug = body.source_milan_slug ?? body.sourceMilanSlug ?? null;

    // Contact (form: contact.{name,mobile,email})
    const contact = body.contact ?? {};
    const userName   = contact.name   ?? body.userName   ?? null;
    const userMobile = contact.mobile ?? body.userMobile ?? null;
    const userEmail  = contact.email  ?? body.userEmail  ?? null;

    // Create Razorpay order — flat Rs251
    const order = await razorpay.orders.create({
      amount:   KARMIC_PAISE,
      currency: 'INR',
      receipt:  `tv_karmic_${Date.now()}`,
      notes: {
        platform:    'Trikaal Vaani',
        purpose:     'Karmic Background Reading',
        language,
        person_name: person.name,
        source:      sourceMilanSlug ? 'milan_upsell' : 'standalone',
        architect:   'Rohiit Gupta',
      },
    });

    // Save pending order (person_data stored here for verify-payment)
    const { error: dbErr } = await supabase
      .from('karmic_orders')
      .insert({
        razorpay_order_id: order.id,
        amount_rupees:     KARMIC_RUPEES,
        amount_paise:      KARMIC_PAISE,
        currency:          'INR',
        language,
        person_data:       person,
        source_milan_slug: sourceMilanSlug,
        user_name:         userName,
        user_mobile:       userMobile,
        user_email:        userEmail,
        status:            'created',
        payment_verified:  false,
      });

    if (dbErr) {
      console.error('[Trikal] Karmic order save error:', dbErr.message);
      // Order created on Razorpay; verify route can still proceed.
    }

    return NextResponse.json({
      orderId:      order.id,
      amount:       order.amount,
      amountRupees: KARMIC_RUPEES,
      currency:     order.currency,
      keyId:        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      language,
      label:        'Karmic Background Reading',
    });

  } catch (err: unknown) {
    console.error('[Trikal] Karmic order error:', err);
    return NextResponse.json(
      { error: 'Could not create Karmic order. Please try again.' },
      { status: 500 }
    );
  }
}
