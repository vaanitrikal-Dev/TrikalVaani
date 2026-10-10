// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     app/api/calc/upay/callback/route.ts   (NEW FILE)
// Version:  v1.0 (10 Oct 2026)
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// app/api/razorpay-callback/route.ts (Deep Reading, 27 Sep) ka hi tareeka:
// Razorpay redirect mode mein payment ke baad customer ko YAHAN POST karta hai.
//   1. fail/cancel → "payment nahi hua" page
//   2. HMAC signature check — galat to kuch nahi banta
//   3. lib/upay-report generateUpayReport() — wahi function jo cron chalata hai
//   4. 303 → /upay/<slug>
//   Kuch fail → "report ban rahi hai" page, har 20s GET se check (GET kabhi
//   report NAHI banata). Cron (har 5 min) backup.
// ════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { generateUpayReport, upayAdmin, UPAY_SITE } from '@/lib/upay-report';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const SECRET   = process.env.RAZORPAY_KEY_SECRET ?? '';
const WHATSAPP = '919211804111';
const ID_RE    = /^[A-Za-z0-9_]{6,64}$/;

function esc(v: string): string {
  return v.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function toReport(slug: string) {
  return NextResponse.redirect(`${UPAY_SITE}/upay/${encodeURIComponent(slug)}`, 303);
}

function page(title: string, bodyHtml: string, opts: { refreshUrl?: string; status?: number } = {}) {
  const refresh = opts.refreshUrl ? `<meta http-equiv="refresh" content="20;url=${esc(opts.refreshUrl)}">` : '';
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
  const t = encodeURIComponent(`Namaste! Maine Upay Report ₹51 ka payment kiya hai, report nahi mili.\nPayment ID: ${paymentId}`);
  return `https://wa.me/${WHATSAPP}?text=${t}`;
}

function pendingPage(orderId: string, paymentId: string) {
  const check = `${UPAY_SITE}/api/calc/upay/callback?order_id=${encodeURIComponent(orderId)}&payment_id=${encodeURIComponent(paymentId)}`;
  return page('Report ban rahi hai', `<h1>🙏 Aapka payment mil gaya hai</h1>
<p>Aapki Upay Report taiyaar ho rahi hai. Yeh page har 20 second mein khud check karega — report bante hi aap seedha wahan pahunch jaayenge.</p>
<p>15 minute mein report na khule to WhatsApp par Payment ID bhejein.</p>
<p class="id">Payment ID: ${esc(paymentId)}</p>
<a class="b" href="${esc(check)}">Abhi check karein</a><br>
<a class="b w" href="${esc(waUrl(paymentId))}">WhatsApp par sampark</a>`, { refreshUrl: check });
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

export async function POST(req: NextRequest) {
  let f: Record<string, string>;
  try {
    f = await readForm(req);
  } catch (e) {
    console.error('[upay-callback] form read failed:', e);
    return page('Kuch galat hua', `<h1>Kuch galat hua</h1>
<p>Agar paisa kata hai to chinta na karein — report 15 minute mein ban jaati hai. Na mile to WhatsApp karein.</p>
<a class="b w" href="https://wa.me/${WHATSAPP}">WhatsApp</a>`, { status: 400 });
  }

  const paymentId = f['razorpay_payment_id'] ?? '';
  const orderId   = f['razorpay_order_id']   ?? '';
  const signature = f['razorpay_signature']  ?? '';

  if (!paymentId || !signature) {
    console.warn('[upay-callback] payment not completed:', f['error[code]'] ?? '', f['error[description]'] ?? '');
    return page('Payment poora nahi hua', `<h1>Payment poora nahi hua</h1>
<p>${esc(f['error[description]'] ?? 'Payment complete nahi ho paya.')}</p>
<p>Agar paisa kat gaya hai to 5-7 din mein bank wapas kar deta hai, ya WhatsApp par batayein.</p>
<a class="b" href="${UPAY_SITE}/calculators/free-upay-calculator">Dobara try karein</a><br>
<a class="b w" href="https://wa.me/${WHATSAPP}">WhatsApp</a>`);
  }

  if (!ID_RE.test(paymentId) || !ID_RE.test(orderId) || !SECRET) {
    console.error('[upay-callback] bad ids or secret missing', orderId, paymentId);
    return page('Verification fail', `<h1>Verification fail</h1>
<p>Payment ID WhatsApp par bhejein, hum turant madad karenge.</p>
<p class="id">${esc(paymentId)}</p><a class="b w" href="${esc(waUrl(paymentId))}">WhatsApp</a>`, { status: 400 });
  }

  const expected = crypto.createHmac('sha256', SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.error('[upay-callback] signature mismatch', orderId, paymentId);
    return page('Verification fail', `<h1>Verification fail</h1>
<p>Payment ID WhatsApp par bhejein, hum turant madad karenge.</p>
<p class="id">${esc(paymentId)}</p><a class="b w" href="${esc(waUrl(paymentId))}">WhatsApp</a>`, { status: 400 });
  }

  const r = await generateUpayReport(orderId, paymentId, 'callback');
  if (r.ok) return toReport(r.slug);
  return pendingPage(orderId, paymentId);
}

// GET — pending page yahan check karta hai. KABHI REPORT NAHI BANATA.
export async function GET(req: NextRequest) {
  const orderId   = req.nextUrl.searchParams.get('order_id')   ?? '';
  const paymentId = req.nextUrl.searchParams.get('payment_id') ?? '';
  if (!ID_RE.test(orderId) || !ID_RE.test(paymentId)) {
    return NextResponse.redirect(`${UPAY_SITE}/`, 303);
  }
  try {
    const { data } = await upayAdmin().from('upay_reports')
      .select('slug, status').eq('razorpay_order_id', orderId).maybeSingle();
    if (data?.status === 'ready' && data.slug) return toReport(data.slug);
  } catch (e) {
    console.error('[upay-callback] GET check failed:', e);
  }
  return pendingPage(orderId, paymentId);
}
// END — app/api/calc/upay/callback/route.ts v1.0
