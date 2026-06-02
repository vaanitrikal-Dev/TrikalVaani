// TRIKAL VAANI - Kundali Milan Order Creation API - v1.1
// CEO: Rohiit Gupta
// v1.1: accepts form contract (tier deep_couple/parent/both, lat/lng/cityName,
//       full buildMilanBody structure). Maps form tiers -> internal pricing tiers.
//       Reads bride/groom from form body. Backward compatible with old names.

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// CEO LOCKED Pricing (IR-19) - internal tier keys
const TIER_PRICING: Record<string, { rupees: number; audience: 'couple' | 'parent' | 'both'; label: string }> = {
  basic_51:        { rupees: 51,  audience: 'couple', label: 'Basic Milan'                       },
  deep_101_couple: { rupees: 101, audience: 'couple', label: 'Deep Reading - Couple'             },
  deep_101_parent: { rupees: 101, audience: 'parent', label: 'Deep Reading - Parent'             },
  both_151:        { rupees: 151, audience: 'both',   label: 'Both Versions (Couple + Parent)'   },
};

// Map the FORM tier names -> internal tier keys
// Form sends: deep_couple / deep_parent / deep_both (and possibly basic)
function normaliseTier(raw: string | undefined, audience: string | undefined): string {
  if (!raw) {
    // derive from audience if tier missing
    if (audience === 'parent') return 'deep_101_parent';
    if (audience === 'both')   return 'both_151';
    return 'deep_101_couple';
  }
  const map: Record<string, string> = {
    // form names
    deep_couple:     'deep_101_couple',
    deep_parent:     'deep_101_parent',
    deep_both:       'both_151',
    basic:           'basic_51',
    // already-internal names (passthrough)
    basic_51:        'basic_51',
    deep_101_couple: 'deep_101_couple',
    deep_101_parent: 'deep_101_parent',
    both_151:        'both_151',
  };
  return map[raw] ?? 'deep_101_couple';
}

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Normalise a partner from form fields (lat/lng/cityName) OR canonical (latitude/longitude/place)
function normalisePartner(p: any, fallbackGender: 'male' | 'female') {
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
    gender:   p.gender ?? fallbackGender,
    dob,
    tob,
    place,
    latitude,
    longitude,
    timezone: typeof p.timezone === 'number' ? p.timezone : 5.5,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();

    // Form may send: tier, audience/audienceVersion, amount, language, bride, groom, contact
    const audience = body.audience ?? body.audienceVersion;
    const tier = normaliseTier(body.tier, audience);

    if (!TIER_PRICING[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier.' },
        { status: 400 }
      );
    }

    const bride = normalisePartner(body.bride, 'female');
    const groom = normalisePartner(body.groom, 'male');

    if (!bride) {
      return NextResponse.json({ error: 'Invalid bride birth data.' }, { status: 400 });
    }
    if (!groom) {
      return NextResponse.json({ error: 'Invalid groom birth data.' }, { status: 400 });
    }

    const { rupees, audience: tierAudience, label } = TIER_PRICING[tier];
    const amountPaise = rupees * 100;
    const lang = body.language ?? 'hinglish';

    // Contact (from form: contact.{name,mobile,email})
    const contact = body.contact ?? {};
    const userName   = contact.name   ?? body.userName   ?? null;
    const userMobile = contact.mobile ?? body.userMobile ?? null;
    const userEmail  = contact.email  ?? body.userEmail  ?? null;

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `tv_milan_${tier}_${Date.now()}`,
      notes: {
        platform:   'Trikaal Vaani',
        purpose:    'Kundali Milan',
        tier,
        audience:   tierAudience,
        language:   lang,
        bride_name: bride.name,
        groom_name: groom.name,
        architect:  'Rohiit Gupta',
      },
    });

    // Save pending order to Supabase (birth data stored here for verify-payment)
    const { error: dbErr } = await supabase
      .from('kundali_milan_orders')
      .insert({
        razorpay_order_id: order.id,
        amount_rupees:     rupees,
        amount_paise:      amountPaise,
        currency:          'INR',
        tier,
        audience:          tierAudience,
        language:          lang,
        bride_data:        bride,
        groom_data:        groom,
        user_name:         userName,
        user_mobile:       userMobile,
        user_email:        userEmail,
        status:            'created',
        payment_verified:  false,
      });

    if (dbErr) {
      console.error('[Trikal] Milan order save error:', dbErr.message);
      // Order created on Razorpay; verify route can still proceed.
    }

    return NextResponse.json({
      orderId:      order.id,
      amount:       order.amount,
      amountRupees: rupees,
      currency:     order.currency,
      keyId:        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      tier,
      audience:     tierAudience,
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
