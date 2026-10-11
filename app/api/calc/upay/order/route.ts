/**
 * ============================================================
 * TRIKAL VAANI — Upay Report Order (₹51, Razorpay)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/calc/upay/order/route.ts
 * VERSION: 1.4 (11 Oct 2026)
 *   v1.4: GOOGLE PLAY (sirf Play Store app) — body mein `play_purchase_token`
 *         aaye to ALAG raasta: janm-vivran/samasya wahi jaanch → Google se
 *         verify + claim (lib/play-billing-server verifyAndClaimPlay 'upay')
 *         → upay_reports row (razorpay_order_id = Play order "GPA.…", kyunki
 *         column NOT NULL + unique hai; play_order_id sirf Play rows par)
 *         → wahi generateUpayReport() jo Razorpay callback/cron chalate hain
 *         → safal: finishPlay (consume) + JSON { slug }; fail: releasePlay.
 *         UPAY_PAID_ON=false ho to Play bhi 503 (sabse upar wahi check).
 *         Razorpay raasta: EK LINE NAHI BADLI. maxDuration 120 joda (Play mein
 *         report isi request mein banti hai — VM 90s tak). Gemini: is file mein nahi.
 *   v1.3: description '7-12 granth upay' (10 ki fixed ginti hati — VM v5.1).
 *   v1.2: UPAY_PAID_ON=false (lib/upay-flags) par order BANTA HI NAHI (503) —
 *         Rohiit, 11 Oct: report theek hone tak ₹51 bikri band.
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
import { UPAY_PAID_ON } from '@/lib/upay-flags';
import { generateUpayReport, UPAY_SITE, type UpayBirth } from '@/lib/upay-report';       // v1.4
import { verifyAndClaimPlay, finishPlay, releasePlay } from '@/lib/play-billing-server'; // v1.4

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // v1.4 — Play raasta report isi request mein banata hai

// ── v1.4: GOOGLE PLAY raasta (sirf jab body mein play_purchase_token ho) ────
// Janm-vivran/samasya pehle hi jaanch chuke (POST mein), isliye galat data par
// token kabhi claim nahi hota — customer usi payment se dobara bhej sakta hai.
async function playOrder(
  token: unknown,
  d: { birth: UpayBirth; samasya: string[]; mobile: string | null; language: string; vishesh: string | null },
) {
  const gate = await verifyAndClaimPlay('upay', token, 'upay_reports');
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error, code: gate.code, existingRef: gate.existingRef ?? null }, { status: gate.status });
  }
  try {
    // Row: Razorpay jaisi hi, bas order id Play ka. Retry par row pehle se ho
    // (23505) to wahi row chalegi — generateUpayReport usi ko padhta hai.
    const { error: insErr } = await upayAdmin().from('upay_reports').insert({
      razorpay_order_id: gate.orderId,
      amount_paise: gate.amountPaise ?? UPAY_AMOUNT_PAISE,
      person_name: d.birth.name ?? null,
      mobile: d.mobile,
      language: d.language,
      birth: d.birth,
      samasya: d.samasya,
      vishesh: d.vishesh,
      status: 'created',
      ...(gate ? { play_order_id: gate.orderId } : {}),
    });
    if (insErr && (insErr as any).code !== '23505') {
      console.error('[upay-order] PLAY insert failed:', gate.orderId, insErr.message);
      await releasePlay(gate);
      return NextResponse.json({ error: 'Payment mil gaya, par report abhi shuru nahi ho payi — 1 minute baad dobara try karein. Dobara paisa nahi katega.' }, { status: 503 });
    }

    const r = await generateUpayReport(gate.orderId, gate.orderId, 'play');
    if (!r.ok) {
      console.error('[upay-order] PLAY generate failed:', gate.orderId, r.reason, r.error ?? '');
      await releasePlay(gate);
      return NextResponse.json({ error: 'Payment mil gaya, par report abhi nahi ban payi — 1 minute baad dobara try karein. Dobara paisa nahi katega.' }, { status: 503 });
    }

    await finishPlay(gate, r.slug);
    return NextResponse.json({ ok: true, slug: r.slug, reportUrl: `${UPAY_SITE}/upay/${r.slug}` });
  } catch (e) {
    console.error('[upay-order] PLAY error:', gate.orderId, e);
    await releasePlay(gate);
    return NextResponse.json({ error: 'Payment mil gaya, par report abhi nahi ban payi — 1 minute baad dobara try karein. Dobara paisa nahi katega.' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  if (!UPAY_PAID_ON) {
    return NextResponse.json({ error: '₹51 Upay Report abhi naye roop mein ban rahi hai — jald wapas aayegi.' }, { status: 503 });
  }
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

    // v1.4 — Play Store app: alag raasta, yahin se lautta hai. Razorpay neeche wahi.
    if (body?.play_purchase_token) {
      return await playOrder(body.play_purchase_token, { birth, samasya, mobile, language, vishesh });
    }

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
      description: 'Upay Report — 7-12 granth upay',
    });
  } catch (err) {
    console.error('[upay-order] error:', err);
    return NextResponse.json({ error: 'Payment shuru nahi ho paya — dobara try karein.' }, { status: 500 });
  }
}
// END — app/api/calc/upay/order/route.ts v1.4
