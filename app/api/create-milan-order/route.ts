// TRIKAL VAANI - Kundali Milan Order Creation API - v1.3 (1 Oct 2026)
// CEO: Rohiit Gupta
// v1.3: EK HI TIER — milan_51 (₹51 / $5), couple + parent dono, granth saar +
//       10 upay. Rohiit, 1 Oct 2026: "sirf one paid Tier ka banado 51 only ...
//       101 and 151 hata do". Browser kuch bhi tier bheje (purana page cache
//       mein ho to deep_couple/both bhi aa sakta hai) — sab milan_51 banta hai,
//       ₹51. Daam sirf server tay karta hai. Purane chaar tier DB constraint
//       mein purane orders ke liye bache hain, yahan se nahi bante.
// v1.2: PAYPAL for international buyers. `provider: 'paypal'` creates the order
//       with PayPal instead of Razorpay and stores it under paypal_order_id.
//       All four tiers are priced in USD: basic $7, deep couple/parent $12,
//       both $15. The Razorpay branch below is untouched and a request that
//       does not ask for PayPal never enters the new code.
// v1.1: accepts form contract (tier deep_couple/parent/both, lat/lng/cityName,
//       full buildMilanBody structure). Maps form tiers -> internal pricing tiers.
//       Reads bride/groom from form body. Backward compatible with old names.

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// CEO LOCKED Pricing (IR-19) - internal tier keys
const TIER_PRICING: Record<string, { rupees: number; audience: 'couple' | 'parent' | 'both'; label: string }> = {
  milan_51: { rupees: 51, audience: 'both', label: 'Kundali Milan — Couple + Parent' },
};

// v1.3 — har tier naam milan_51 banta hai (purane form/cache ke naam bhi).
function normaliseTier(_raw: string | undefined, _audience: string | undefined): string {
  return 'milan_51';
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

    // ── PayPal branch (v1.2) — international ─────────────────────────────────
    // Returns before the Razorpay code, which is therefore unreachable here.
    if (body.provider === 'paypal') {
      // Internal tier key -> price-table key. Kept as an explicit map rather
      // than string-munging, so an unknown tier fails loudly instead of
      // silently charging the wrong amount.
      const PAYPAL_KEY_FOR_TIER: Record<string, string> = {
        milan_51: 'milan_51',   // v1.3 — $5
      };
      const productKey = PAYPAL_KEY_FOR_TIER[tier];
      if (!productKey) {
        return NextResponse.json({ error: 'Unknown tier.' }, { status: 400 });
      }

      const { getProduct }        = await import('@/lib/pricing-intl');
      const { createPayPalOrder } = await import('@/lib/paypal-server');
      const product = getProduct(productKey);
      if (!product) {
        return NextResponse.json({ error: 'Pricing not configured.' }, { status: 500 });
      }

      const ppOrder = await createPayPalOrder({
        usdCents:    product.usdCents,
        description: `Kundali Milan — ${label}`,
        referenceId: `tv_milan_${tier}_${Date.now()}`,
      });

      const { error: ppDbErr } = await supabase
        .from('kundali_milan_orders')
        .insert({
          paypal_order_id:  ppOrder.id,
          amount_cents:     product.usdCents,
          // amount_rupees / amount_paise are NOT NULL, so the rupee equivalent
          // is recorded. currency says which one was actually charged.
          amount_rupees:    rupees,
          amount_paise:     amountPaise,
          currency:         'USD',
          tier,
          audience:         tierAudience,
          language:         lang,
          bride_data:       bride,
          groom_data:       groom,
          user_name:        userName,
          user_mobile:      userMobile,
          user_email:       userEmail,
          status:           'created',
          payment_verified: false,
        });

      if (ppDbErr) {
        // The verify step reads bride_data/groom_data back out of this row.
        // Without it a paying customer would receive nothing, so fail BEFORE
        // the money is taken rather than after.
        console.error('[Trikal] Milan PayPal order save error:', ppDbErr.message);
        return NextResponse.json(
          { error: 'Could not start the payment. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        provider: 'paypal',
        orderId:  ppOrder.id,
        usdCents: product.usdCents,
        currency: 'USD',
        tier,
        audience: tierAudience,
        label,
        language: lang,
      });
    }

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
