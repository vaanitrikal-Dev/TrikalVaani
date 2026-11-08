// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     app/api/dakshina-callback/route.ts   (NEW FILE)
// Version:  v1.1 (8 Nov 2026)
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// v1.1 (8 Nov 2026) — Razorpay email na milne par nakli "void@razorpay.com"
//   bharta hai; ₹101 test mein wahi message column mein save hua. Ab woh
//   email SAVE NAHI hota. Baaki sab v1.0 jaisa.
//
// ── KYUN BANA ──────────────────────────────────────────────────────────────
// Homepage ka "Maa Shakti ko Arzi" (components/landing/MaaArziPay.tsx) Razorpay
// ko `callback_url` + `redirect: true` deta hai (Rohiit ka option B, 8 Nov
// 2026). Payment ke baad RAZORPAY KHUD customer ko yahan POST karta hai — tab
// band ya reload ho jaye tab bhi record nahi chhootta (wahi seekh jo
// app/api/razorpay-callback v1.0 se mili thi).
//
// ── KYA KARTA HAI ──────────────────────────────────────────────────────────
//   1. Payment fail/cancel (signature nahi) → "payment poora nahi hua" page.
//   2. HMAC signature check — galat to 400, kuch save nahi.
//   3. Amount, contact, email RAZORPAY SE fetch (browser ki baat par bharosa
//      nahi). Type (arzi/dhanyawad) order ke notes se.
//   4. `dakshina` table mein ek hi baar insert (payment_id pehle se ho to skip
//      — refresh/double POST se duplicate nahi).
//   5. Dhanyawad page + WhatsApp button (9211804111) — amount aur Payment ID
//      pehle se bhare hue.
//   Save fail ho to bhi customer ko dhanyawad page — paisa Razorpay mein
//   surakshit hai, daily reconciliation use pakad legi.
// ════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const SITE            = 'https://trikalvaani.com';
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';
const WHATSAPP        = '919211804111';
const ID_RE           = /^[A-Za-z0-9_]{6,64}$/;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function esc(v: string): string {
  return v.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function page(title: string, bodyHtml: string, status = 200) {
  const html = `<!doctype html><html lang="hi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
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
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function waLink(text: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

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
    console.error('[dakshina-callback] form read failed:', e);
    return page('Kuch galat hua', `<h1>Kuch galat hua</h1>
<p>Agar aapka paisa kata hai to chinta na karein — WhatsApp par batayein.</p>
<a class="b w" href="https://wa.me/${WHATSAPP}">WhatsApp</a>`, 400);
  }

  const paymentId = f['razorpay_payment_id'] ?? '';
  const orderId   = f['razorpay_order_id']   ?? '';
  const signature = f['razorpay_signature']  ?? '';

  // 1. Payment fail / cancel
  if (!paymentId || !signature) {
    console.warn('[dakshina-callback] not completed:', f['error[code]'] ?? '', f['error[description]'] ?? '');
    return page('Payment poora nahi hua', `<h1>Payment poora nahi hua</h1>
<p>${esc(f['error[description]'] ?? 'Payment complete nahi ho paya.')}</p>
<p>Agar paisa kat gaya hai to 5-7 din mein bank wapas kar deta hai, ya WhatsApp par batayein.</p>
<a class="b" href="${SITE}/">Dobara try karein</a><br>
<a class="b w" href="https://wa.me/${WHATSAPP}">WhatsApp</a>`);
  }

  if (!ID_RE.test(paymentId) || !ID_RE.test(orderId) || !RAZORPAY_SECRET) {
    console.error('[dakshina-callback] bad ids or secret missing', orderId, paymentId);
    return page('Verification fail', `<h1>Verification fail</h1>
<p>Payment ID WhatsApp par bhejein, hum turant madad karenge.</p>
<p class="id">${esc(paymentId)}</p>
<a class="b w" href="${esc(waLink(`Maa ko Arzi — Payment ID: ${paymentId}`))}">WhatsApp</a>`, 400);
  }

  // 2. Signature
  const expected = crypto.createHmac('sha256', RAZORPAY_SECRET)
    .update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.error('[dakshina-callback] signature mismatch', orderId, paymentId);
    return page('Verification fail', `<h1>Verification fail</h1>
<p>Payment ID WhatsApp par bhejein, hum turant madad karenge.</p>
<p class="id">${esc(paymentId)}</p>
<a class="b w" href="${esc(waLink(`Maa ko Arzi — Payment ID: ${paymentId}`))}">WhatsApp</a>`, 400);
  }

  // 3. Asli amount + contact Razorpay se; type order ke notes se
  let amountPaise = 0;
  let contact: string | null = null;
  let email: string | null = null;
  let type: 'arzi' | 'dhanyawad' = 'arzi';
  let reportSlug: string | null = null;
  try {
    const rzp = new Razorpay({
      key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: RAZORPAY_SECRET,
    });
    const [p, o]: any[] = await Promise.all([
      rzp.payments.fetch(paymentId),
      rzp.orders.fetch(orderId),
    ]);
    amountPaise = Number(p?.amount) || Number(o?.amount) || 0;
    contact = p?.contact ? String(p.contact) : null;
    email   = p?.email && String(p.email).toLowerCase() !== 'void@razorpay.com' ? String(p.email) : null;
    if (o?.notes?.type === 'dhanyawad') type = 'dhanyawad';
    reportSlug = o?.notes?.report_slug ? String(o.notes.report_slug) : null;
  } catch (e) {
    console.error('[dakshina-callback] razorpay fetch failed:', e);
  }
  const amountRupees = Math.round(amountPaise / 100);
  const amountText   = amountRupees > 0 ? `₹${amountRupees.toLocaleString('en-IN')}` : '';

  // 4. Save — ek payment ek hi baar
  try {
    const supa = admin();
    const { data: existing } = await supa.from('dakshina')
      .select('id').eq('razorpay_payment_id', paymentId).limit(1);
    if (!existing || existing.length === 0) {
      const { error } = await supa.from('dakshina').insert({
        type,
        amount_rupees:       amountRupees,
        amount_paise:        amountPaise,
        razorpay_order_id:   orderId,
        razorpay_payment_id: paymentId,
        report_slug:         reportSlug || null,
        devotee_mobile:      contact,
        message:             email ? `email: ${email}`.slice(0, 500) : null,
        payment_verified:    true,
      });
      if (error) console.error('[dakshina-callback] save error:', error.message, paymentId);
      else console.log(`[dakshina-callback] SAVED | ${paymentId} | ${amountText}`);
    }
  } catch (e) {
    console.error('[dakshina-callback] save failed:', e, paymentId);
  }

  // 5. Dhanyawad page
  const wa = waLink(
    `Pranam Rohiit ji, Maa ko Arzi karna chahta hoon.\n\n` +
    (amountText ? `Dakshina: ${amountText}\n` : '') +
    `Payment ID: ${paymentId}\n\nJai Maa Shakti! 🔱`
  );
  return page('Arzi sweekar', `<h1>🙏 Maa ne aapki Arzi sweekar kar li hai</h1>
${amountText ? `<p>Aapki dakshina <b>${esc(amountText)}</b> mil gayi hai.</p>` : '<p>Aapki dakshina mil gayi hai.</p>'}
<p>Ab WhatsApp par apni dil ki baat bhejein — Rohiit ji aapko personally connect karenge.</p>
<p class="id">Payment ID: ${esc(paymentId)}</p>
<a class="b w" href="${esc(wa)}">📱 WhatsApp par Arzi bhejein</a><br>
<a class="b" href="${SITE}/">Homepage</a>`);
}

// GET — koi seedha khole to homepage
export async function GET() {
  return NextResponse.redirect(`${SITE}/`, 303);
}
// END — app/api/dakshina-callback/route.ts v1.1
