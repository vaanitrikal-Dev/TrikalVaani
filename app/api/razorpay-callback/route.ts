// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     app/api/razorpay-callback/route.ts   (NEW FILE)
// Version:  v1.0 (27 Sep 2026)
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// ── KYUN BANA ──────────────────────────────────────────────────────────────
// Mobile par UPI app (Paytm/PhonePe) khulte hi Chrome hamara tab maar ya
// reload kar deta tha. Razorpay ka `handler` browser ke andar chalta hai —
// tab gaya to handler gaya → /api/verify-payment aur /api/predict kabhi call
// nahi hote. Proof (Vercel logs): 26-27 Sep ko verify-payment 2 din mein
// sirf 1 baar chala; Meghnath (pay_Th6lpYfjb8gYyD, 20:49) ka create-order
// aaya, payment captured hua, phir browser se ek bhi call nahi.
//
// ── KYA KARTA HAI ──────────────────────────────────────────────────────────
// BirthForm v10.6 Deep Reading (₹51) par Razorpay ko `callback_url` +
// `redirect: true` deta hai. Payment ke baad RAZORPAY KHUD customer ko yahan
// POST karta hai (form: razorpay_payment_id, razorpay_order_id,
// razorpay_signature). Yeh route:
//   1. Payment fail hua ho (error[...] fields) → "payment nahi hua" page.
//   2. HMAC signature check — galat to 400, kuch nahi banta.
//   3. predictions mein is payment ki report pehle se hai → seedha wahan.
//   4. paid_order_intents se birth data (create-order v1.1 ne save kiya).
//   5. recovery_attempts par ATOMIC claim (wahi tareeka jo cron ka hai) —
//      double POST / browser refresh / cron ek saath do report nahi banayenge.
//   6. predict route ka POST seedha import karke andar hi chalata hai
//      (cron v1.2 wala tareeka — 27 Sep 21:00 ko live kaam kar chuka hai).
//   7. 303 redirect → /report/<slug>.
//   Kuch bhi fail → "report ban rahi hai" page, jo har 20s GET se check karta
//   hai. GET kabhi report NAHI banata, sirf dekhta hai. Cron (har 5 min,
//   10 min grace) backup bana rehta hai.
//
// ── ATTEMPTS KA HISAAB ─────────────────────────────────────────────────────
// Yeh route ek attempt leta hai (recovery_attempts 0 → 1). Fail ho to cron ke
// paas MAX_ATTEMPTS=2 mein se ek aur bachta hai. Success par recovered_at +
// recovered_slug set → cron use skip karta hai aur koi alert nahi jaata.
//
// ── SECURITY ───────────────────────────────────────────────────────────────
// Report sirf valid Razorpay signature par banti hai (RAZORPAY_KEY_SECRET,
// server-only). Amount predict route khud 5100 paise se match karta hai.
// GET sirf order_id + payment_id dono milne par pehle se bani report ka link
// deta hai — report pages waise bhi public hain.
// ════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { POST as predictPOST } from '@/app/api/predict/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SITE            = 'https://trikalvaani.com';
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';
const DEEP_AMOUNT     = 5100; // paise — create-order ALLOWED_AMOUNTS.deep ke barabar
const WHATSAPP        = '919211804111';

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── Chhote helpers ──────────────────────────────────────────────────────────
const ID_RE = /^[A-Za-z0-9_]{6,64}$/;

function esc(v: string): string {
  return v.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function reportRedirect(slug: string) {
  return NextResponse.redirect(`${SITE}/report/${encodeURIComponent(slug)}`, 303);
}

function page(title: string, bodyHtml: string, opts: { refreshUrl?: string; status?: number } = {}) {
  const refresh = opts.refreshUrl
    ? `<meta http-equiv="refresh" content="20;url=${esc(opts.refreshUrl)}">` : '';
  const html = `<!doctype html><html lang="hi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">${refresh}
<title>${esc(title)} — Trikaal Vaani</title>
<style>
body{margin:0;background:#0b1020;color:#e2e8f0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}
.c{max-width:440px;width:100%;background:#111831;border:1px solid #D4AF37;border-radius:14px;padding:26px;text-align:center}
h1{color:#D4AF37;font-size:20px;margin:0 0 12px}p{font-size:15px;line-height:1.6;margin:0 0 12px;color:#cbd5e1}
.id{font-size:12px;color:#94a3b8;word-break:break-all}
a.b{display:inline-block;margin-top:8px;padding:11px 18px;border-radius:10px;background:#D4AF37;color:#0b1020;
font-weight:700;text-decoration:none}a.w{background:#25D366;color:#fff}
</style></head><body><div class="c">${bodyHtml}</div></body></html>`;
  return new NextResponse(html, {
    status: opts.status ?? 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function waUrl(paymentId: string) {
  const t = encodeURIComponent(
    `Namaste! Maine Deep Reading ₹51 ka payment kiya hai, report nahi mili.\nPayment ID: ${paymentId}`);
  return `https://wa.me/${WHATSAPP}?text=${t}`;
}

function pendingPage(orderId: string, paymentId: string) {
  const check = `${SITE}/api/razorpay-callback?order_id=${encodeURIComponent(orderId)}&payment_id=${encodeURIComponent(paymentId)}`;
  return page('Report ban rahi hai',
    `<h1>🙏 Aapka payment mil gaya hai</h1>
<p>Aapki Deep Reading report taiyaar ho rahi hai. Yeh page har 20 second mein khud check karega —
report bante hi aap seedha wahan pahunch jaayenge.</p>
<p>Page band na karein. 15 minute mein report na khule to WhatsApp par Payment ID bhejein.</p>
<p class="id">Payment ID: ${esc(paymentId)}</p>
<a class="b" href="${esc(check)}">Abhi check karein</a><br>
<a class="b w" href="${esc(waUrl(paymentId))}">WhatsApp par sampark</a>`,
    { refreshUrl: check });
}

// predictions mein is payment ki report pehle se hai?
async function existingSlug(supa: any, paymentId: string): Promise<string | null> {
  const { data } = await supa.from('predictions')
    .select('public_slug').eq('razorpay_payment_id', paymentId)
    .not('public_slug', 'is', null)
    .order('created_at', { ascending: false }).limit(1);
  return data?.[0]?.public_slug ?? null;
}

// Razorpay se asli amount (paise). Fail ho to DEEP_AMOUNT — signature valid
// hai aur create-order 'deep' order sirf 5100 ka hi banata hai.
async function paymentAmount(paymentId: string): Promise<number> {
  try {
    const rzp = new Razorpay({
      key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: RAZORPAY_SECRET,
    });
    const p: any = await rzp.payments.fetch(paymentId);
    const amt = Number(p?.amount);
    return Number.isFinite(amt) && amt > 0 ? amt : DEEP_AMOUNT;
  } catch (e) {
    console.error('[rzp-callback] payment fetch failed, using 5100:', e);
    return DEEP_AMOUNT;
  }
}

// Razorpay form POST padho (urlencoded; multipart bhi sambhala)
async function readForm(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get('content-type') ?? '';
  const out: Record<string, string> = {};
  if (ct.includes('multipart/form-data')) {
    const fd = await req.formData();
    fd.forEach((v, k) => { out[k] = String(v); });
  } else {
    const text = await req.text();
    new URLSearchParams(text).forEach((v, k) => { out[k] = v; });
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// POST — Razorpay yahan customer ko bhejta hai
// ════════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  let f: Record<string, string>;
  try {
    f = await readForm(req);
  } catch (e) {
    console.error('[rzp-callback] form read failed:', e);
    return page('Kuch galat hua', `<h1>Kuch galat hua</h1>
<p>Agar aapka paisa kata hai to chinta na karein — report 15 minute mein ban jaati hai.
Na mile to WhatsApp karein.</p><a class="b w" href="https://wa.me/${WHATSAPP}">WhatsApp</a>`, { status: 400 });
  }

  const paymentId = f['razorpay_payment_id'] ?? '';
  const orderId   = f['razorpay_order_id']   ?? '';
  const signature = f['razorpay_signature']  ?? '';

  // 1. Payment fail / cancel — Razorpay error[...] bhejta hai, signature nahi
  if (!paymentId || !signature) {
    console.warn('[rzp-callback] payment not completed:', f['error[code]'] ?? '', f['error[description]'] ?? '');
    return page('Payment poora nahi hua', `<h1>Payment poora nahi hua</h1>
<p>${esc(f['error[description]'] ?? 'Payment complete nahi ho paya.')}</p>
<p>Agar paisa kat gaya hai to 5-7 din mein bank wapas kar deta hai, ya WhatsApp par batayein.</p>
<a class="b" href="${SITE}/">Dobara try karein</a><br>
<a class="b w" href="https://wa.me/${WHATSAPP}">WhatsApp</a>`);
  }

  if (!ID_RE.test(paymentId) || !ID_RE.test(orderId) || !RAZORPAY_SECRET) {
    console.error('[rzp-callback] bad ids or secret missing', orderId, paymentId);
    return page('Verification fail', `<h1>Verification fail</h1>
<p>Payment ID WhatsApp par bhejein, hum turant madad karenge.</p>
<p class="id">${esc(paymentId)}</p><a class="b w" href="${esc(waUrl(paymentId))}">WhatsApp</a>`, { status: 400 });
  }

  // 2. Signature — wahi HMAC jo predict aur verify-payment karte hain
  const expected = crypto.createHmac('sha256', RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.error('[rzp-callback] signature mismatch', orderId, paymentId);
    return page('Verification fail', `<h1>Verification fail</h1>
<p>Payment ID WhatsApp par bhejein, hum turant madad karenge.</p>
<p class="id">${esc(paymentId)}</p><a class="b w" href="${esc(waUrl(paymentId))}">WhatsApp</a>`, { status: 400 });
  }
  console.log(`[rzp-callback] signature OK | ${orderId} | ${paymentId}`);

  const supa = admin();

  try {
    // 3. Report pehle se bani hai?
    const done = await existingSlug(supa, paymentId);
    if (done) return reportRedirect(done);

    // 4. Saved birth data
    const { data: intent, error: iErr } = await supa
      .from('paid_order_intents').select('*')
      .eq('razorpay_order_id', orderId).maybeSingle();
    if (iErr) throw new Error(`intent read: ${iErr.message}`);
    if (!intent) {
      console.error('[rzp-callback] no intent for', orderId);
      return pendingPage(orderId, paymentId); // cron CEO ko alert bhejega
    }
    if (intent.recovered_slug) return reportRedirect(intent.recovered_slug);

    // 5. Atomic claim — sirf ek process report banaye
    const { data: claimed } = await supa.from('paid_order_intents')
      .update({ recovery_attempts: (intent.recovery_attempts ?? 0) + 1, last_error: 'callback: generating' })
      .eq('razorpay_order_id', orderId)
      .eq('recovery_attempts', intent.recovery_attempts ?? 0)
      .is('recovered_at', null)
      .select('razorpay_order_id');
    if (!claimed || claimed.length === 0) {
      console.warn('[rzp-callback] already being generated elsewhere', orderId);
      return pendingPage(orderId, paymentId);
    }

    // 6. Report banao — predict route in-process (cron v1.2 jaisa)
    const amount = await paymentAmount(paymentId);
    const body = {
      ...intent.predict_body,
      predictionTier:     'paid',
      paypalVerification: null,
      paymentVerification: {
        razorpay_order_id:   orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature:  signature,
        amount,
      },
    };

    const res = await predictPOST(new NextRequest(`${SITE}/api/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }));
    const data: any = await res.json().catch(() => ({}));
    const slug: string | null = data?._meta?.publicSlug ?? null;
    if (!res.ok || !slug) {
      throw new Error(`predict HTTP ${res.status}: ${String(data?.error ?? 'no slug').slice(0, 200)}`);
    }

    await supa.from('paid_order_intents')
      .update({ recovered_at: new Date().toISOString(), recovered_slug: slug, last_error: 'delivered via callback' })
      .eq('razorpay_order_id', orderId);

    console.log(`[rzp-callback] DELIVERED | ${paymentId} | ${slug}`);
    return reportRedirect(slug);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[rzp-callback] FAILED:', msg, orderId, paymentId);
    await supa.from('paid_order_intents')
      .update({ last_error: `callback: ${msg}`.slice(0, 500) })
      .eq('razorpay_order_id', orderId);
    return pendingPage(orderId, paymentId); // cron agla attempt karega
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GET — "report ban rahi hai" page yahan check karta hai. KABHI REPORT NAHI
// BANATA — sirf pehle se bani report dhoondhta hai.
// ════════════════════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  const orderId   = req.nextUrl.searchParams.get('order_id')   ?? '';
  const paymentId = req.nextUrl.searchParams.get('payment_id') ?? '';
  if (!ID_RE.test(orderId) || !ID_RE.test(paymentId)) {
    return NextResponse.redirect(`${SITE}/`, 303);
  }
  try {
    const supa = admin();
    const done = await existingSlug(supa, paymentId);
    if (done) return reportRedirect(done);
    const { data: intent } = await supa.from('paid_order_intents')
      .select('recovered_slug').eq('razorpay_order_id', orderId).maybeSingle();
    if (intent?.recovered_slug) return reportRedirect(intent.recovered_slug);
  } catch (e) {
    console.error('[rzp-callback] GET check failed:', e);
  }
  return pendingPage(orderId, paymentId);
}
// END — app/api/razorpay-callback/route.ts v1.0
