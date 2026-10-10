/**
 * ============================================================
 * TRIKAL VAANI — Upay Report Order (₹51, Razorpay)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/calc/upay/order/route.ts
 * VERSION: 1.1 (10 Oct 2026)
 *   v1.1: chunav mein 'grah-shani' jaise grah aur 'kaal-sarp' jaise dosh bhi
 *         (SAMASYA_RE mein pehle se fit — VM granth_api v4.3 samajhta hai).
 *         'vishesh' (grahak ki apni baat, max 300) → upay_reports.vishesh.
 *   v1.0: pehla version.
 * ============================================================
 * 1. Janm-vivran + 1-2 samasya jaancho
 * 2. Razorpay order ₹51 (amount SERVER par tay — browser sirf product bolta hai)
 *    notes.product = 'upay' → paid-recovery cron isi se pehchanta hai
 * 3. upay_reports mein row (status 'created') — PAYMENT SE PEHLE, taaki tab
 *    band ho jaaye tab bhi callback/cron ke paas poora data ho
 * Browser phir Razorpay ko callbackUrl (/api/calc/upay/callback) ke saath kholta
 * hai — mobile UPI par tab maar diya jaaye tab bhi report banti hai.
 * ============================================================
 */
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { cleanBirth, SAMASYA_RE, UPAY_AMOUNT_PAISE, upayAdmin } from '@/lib/upay-report';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const birth = cleanBirth(body?.birth ?? {});
    if (!birth) {
      return NextResponse.json({ error: 'Janm ki tareekh, samay aur jagah poori bharein.' }, { status: 400 });
    }
    const samasya: string[] = Array.isArray(body?.samasya)
      ? Array.from(new Set(body.samasya.map((s: any) => String(s)).filter((s: string) => SAMASYA_RE.test(s)))).slice(0, 2) as string[]
      : [];
    if (samasya.length === 0) {
      return NextResponse.json({ error: 'Kam se kam ek samasya chuniye.' }, { status: 400 });
    }
    const mobileDigits = String(body?.mobile ?? '').replace(/\D/g, '');
    const mobile = mobileDigits.length >= 10 ? mobileDigits.slice(-10) : null;
    const language = ['hinglish', 'hindi', 'english'].includes(body?.language) ? body.language : 'hinglish';
    // grahak ki apni baat — control characters hatao, 300 akshar tak
    const visheshRaw = String(body?.vishesh ?? '').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim();
    const vishesh = visheshRaw ? Array.from(visheshRaw).slice(0, 300).join('') : null;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error('[upay-order] Razorpay keys missing.');
      return NextResponse.json({ error: 'Payment abhi uplabdh nahi.' }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: UPAY_AMOUNT_PAISE,
      currency: 'INR',
      receipt: `tv_upay_${Date.now()}`.slice(0, 40),
      notes: {
        platform: 'Trikaal Vaani',
        architect: 'Rohiit Gupta',
        product: 'upay',
        samasya: samasya.join(','),
      },
    });

    const { error } = await upayAdmin().from('upay_reports').insert({
      razorpay_order_id: order.id,
      amount_paise: UPAY_AMOUNT_PAISE,
      person_name: birth.name ?? null,
      mobile,
      language,
      birth,
      samasya,
      vishesh,
      status: 'created',
    });
    if (error) {
      // Row nahi bani to checkout KHOLNA hi nahi — warna paisa jaata, data nahi
      console.error('[upay-order] insert failed:', error.message);
      return NextResponse.json({ error: 'Abhi order nahi ban paya — dobara try karein.' }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      description: 'Upay Report — 10 granth upay',
    });
  } catch (err) {
    console.error('[upay-order] error:', err);
    return NextResponse.json({ error: 'Payment shuru nahi ho paya — dobara try karein.' }, { status: 500 });
  }
}
// END — app/api/calc/upay/order/route.ts v1.1
