// TRIKAL VAANI - Child Birth Muhurat Paid Report - Order Creation API
// CEO: Rohiit Gupta
// File: app/api/create-muhurat-order/route.ts
// VERSION: 1.3 (30 Sep 2026) — SINGLE ₹51 / $5 TIER + SERVER-PICKED SLOT
//   * One tier only: muhurat_51 (₹51 India / $5 PayPal). report_101 and
//     remedies_151 are no longer sold (old rows still readable elsewhere).
//     Supabase muhurat_orders_tier_check was widened to allow muhurat_51
//     on 30 Sep 2026 BEFORE this deploy.
//   * The browser now sends the doctor's WINDOW, not a chosen time. This
//     route scans the full window (max 4h) on the VM and picks the best slot
//     + up to 3 backups itself, so the paid time can't be tampered with and
//     never falls outside the doctor's window.
//   * FIX: a failed Supabase save on the Razorpay path now stops BEFORE the
//     customer pays (previously it was only logged, so a paying customer
//     could get no report).
// VERSION: 1.2 (29 Aug 2026) — PAYPAL for international buyers.
// VERSION: 1.1 — FIX: preserve all 3 languages (hinglish/hindi/english).
// Pay-first flow: creates Razorpay/PayPal order + saves pending muhurat_orders row.

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import {
  normaliseWindow, scanWindow, parseTimeTo24h, qualityLabel, pickBackups,
} from '@/lib/muhurat-tiering';

// CEO LOCKED pricing (30 Sep 2026): one tier, report + 10 remedies.
const TIERS: Record<string, { rupees: number; paise: number; label: string }> = {
  muhurat_51: { rupees: 51, paise: 5100, label: 'Full Muhurat Report + 10 Remedies' },
};

const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// v1.3 — the server picks the paid slot from the doctor's window.
// Returns the muhurat_data row payload, or null if the window is invalid.
// Throws if the VM engine fails (caller stops before any payment).
async function buildMuhuratData(m: any) {
  if (!m || typeof m !== 'object') return null;
  const w = normaliseWindow(m);
  if (!w) return null;
  const data = await scanWindow(w, w.startMin, w.endMin);
  const best = data?.best_slot;
  if (!best?.time) return null;
  const { hour, minute } = parseTimeTo24h(best.time);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return {
    year: w.year, month: w.month, day: w.day, hour, minute,
    latitude: w.latitude, longitude: w.longitude, timezone: w.timezone,
    city:     m.city     ?? m.cityName ?? '',
    hospital: m.hospital ?? '',
    // v1.3 fields — read by /api/muhurat-paid and /muhurat/[slug]
    window:       { start_min: w.startMin, end_min: w.endMin },
    quality:      qualityLabel(data?.best_band, best.score),
    backup_slots: pickBackups(best, data?.top_slots ?? []),
  };
}

// Language: keep the user's full choice (hinglish | hindi | english).
// The report engine + Sonnet polish need the exact 3-way value.
// We also accept the legacy 2-letter codes (hi/en) and old field names.
function normaliseLanguage(raw: unknown): 'hinglish' | 'hindi' | 'english' {
  const v = String(raw ?? '').toLowerCase().trim();
  if (v === 'english' || v === 'en') return 'english';
  if (v === 'hindi') return 'hindi';
  if (v === 'hinglish') return 'hinglish';
  if (v === 'hi') return 'hinglish'; // legacy: hi historically meant Hinglish default
  return 'hinglish';
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();

    // Tier — only muhurat_51 is sold now
    const tierKey = body.tier ?? 'muhurat_51';
    const tier = TIERS[tierKey];
    if (!tier) {
      return NextResponse.json({ error: 'This offer has changed. Please refresh the page and try again.' }, { status: 400 });
    }

    // The doctor's window (form sends body.muhurat). Server picks the slot.
    let muhurat: Awaited<ReturnType<typeof buildMuhuratData>> = null;
    try {
      muhurat = await buildMuhuratData(body.muhurat ?? body);
    } catch (e) {
      console.error('[Trikal] Muhurat order VM scan failed:', e);
      return NextResponse.json({ error: 'Could not calculate the muhurat right now. Please try again.' }, { status: 502 });
    }
    if (!muhurat) {
      return NextResponse.json({ error: 'Invalid muhurat data.' }, { status: 400 });
    }

    // Language: preserve full 3-way choice (FIX v1.1)
    const language = normaliseLanguage(body.language);

    // Contact (form: contact.{name,mobile,email})
    const contact = body.contact ?? {};
    const userName   = contact.name   ?? body.userName   ?? null;
    const userMobile = contact.mobile ?? body.userMobile ?? null;
    const userEmail  = contact.email  ?? body.userEmail  ?? null;

    // ── PayPal branch (v1.2) — international ─────────────────────────────────
    // Returns before the Razorpay code, which is unreachable for these.
    if (body.provider === 'paypal') {
      // Explicit map so an unknown tier fails loudly rather than silently
      // charging the wrong amount.
      const PAYPAL_KEY_FOR_TIER: Record<string, string> = {
        muhurat_51: 'muhurat_51',
      };
      const productKey = PAYPAL_KEY_FOR_TIER[tierKey];
      if (!productKey) {
        return NextResponse.json({ error: 'Invalid tier.' }, { status: 400 });
      }

      const { getProduct }        = await import('@/lib/pricing-intl');
      const { createPayPalOrder } = await import('@/lib/paypal-server');
      const product = getProduct(productKey);
      if (!product) {
        return NextResponse.json({ error: 'Pricing not configured.' }, { status: 500 });
      }

      const ppOrder = await createPayPalOrder({
        usdCents:    product.usdCents,
        description: `Child Birth Muhurat — ${tier.label}`,
        referenceId: `tv_muhurat_${Date.now()}`,
      });

      const { error: ppDbErr } = await supabase
        .from('muhurat_orders')
        .insert({
          paypal_order_id:  ppOrder.id,
          amount_cents:     product.usdCents,
          // amount_rupees / amount_paise are NOT NULL, so the rupee equivalent
          // is recorded; currency says which one was actually charged.
          amount_rupees:    tier.rupees,
          amount_paise:     tier.paise,
          currency:         'USD',
          tier:             tierKey,
          language,
          muhurat_data:     muhurat,
          user_name:        userName,
          user_mobile:      userMobile,
          user_email:       userEmail,
          status:           'created',
          payment_verified: false,
        });

      if (ppDbErr) {
        // verify reads muhurat_data back out of this row. Without it a paying
        // customer would get nothing, so fail BEFORE taking the money.
        console.error('[Trikal] Muhurat PayPal order save error:', ppDbErr.message);
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
        tier:     tierKey,
        language,
        label:    tier.label,
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount:   tier.paise,
      currency: 'INR',
      receipt:  `tv_muhurat_${Date.now()}`,
      notes: {
        platform:  'Trikaal Vaani',
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
      // v1.3 FIX — verify reads muhurat_data from this row. Without it a
      // paying customer gets nothing, so stop BEFORE the checkout opens.
      console.error('[Trikal] Muhurat order save error:', dbErr.message);
      return NextResponse.json(
        { error: 'Could not start the payment. Please try again.' },
        { status: 500 }
      );
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
