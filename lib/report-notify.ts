// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     lib/report-notify.ts   (NEW FILE)
// Version:  v1.0 (29 Sep 2026)
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// ── KYUN ───────────────────────────────────────────────────────────────────
// CEO faisla (29 Sep 2026): har paid customer ko report WhatsApp par milni
// chahiye — fallout ho ya na ho. Official WhatsApp API abhi nahi; isliye
// "Surakshit 1-tap": report bante hi CEO ke Gmail par ek email jaata hai jisme
// hara button hai → WhatsApp khulta hai, customer ka number + message pehle se
// bhara → CEO Send dabata hai. WhatsApp ka Send hamesha insaan dabata hai.
//
// ── KYA KARTA HAI (notifyReportReady) ──────────────────────────────────────
//   1. Payment ID / naam / mobile jutata hai — caller se, ya order table se,
//      ya aakhir mein Razorpay payment ke "contact" se.
//   2. report_notifications mein row daalta hai (payment_id PRIMARY KEY) —
//      row pehle se hai to KUCH NAHI (ek payment = ek hi email; browser,
//      callback aur cron teeno call karein tab bhi).
//   3. ALERT_WEBHOOK_URL (Google Apps Script) ko {key, subject, body, html}
//      bhejta hai → CEO ke Gmail mein email.
//   KABHI THROW NAHI KARTA — notification fail ho to bhi report customer ko
//   milni chahiye. Har step console mein "[notify]" ke saath.
//
// Customer message (CEO approved 29 Sep): sawal wali line JAAN-BOOJH KAR NAHI.
// ════════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

export interface NotifyInput {
  product: string;            // "Hast Rekha", "Deep Reading", "Kundali Milan", ...
  reportUrl: string;          // customer ko jaane wala link
  paymentId?: string | null;  // razorpay_payment_id (ya PayPal id)
  customerName?: string | null;
  phone?: string | null;
  amountRupees?: number | null;
  orderTable?: 'karmic_orders' | 'kundali_milan_orders' | 'muhurat_orders';
  orderId?: string | null;    // readings.order_id → orders.id
}

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/** "+91 95409 72925" / "09540972925" / "9540972925" → "919540972925" (India default). */
export function normalizeIndianPhone(raw?: string | null): string | null {
  const d = String(raw ?? '').replace(/\D/g, '');
  if (d.length === 10) return `91${d}`;
  if (d.length === 11 && d.startsWith('0')) return `91${d.slice(1)}`;
  if (d.length >= 11 && d.length <= 15) return d;   // already has country code
  return null;
}

function esc(v: string): string {
  return v.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export function customerMessage(name: string, product: string, url: string): string {
  const who = name?.trim() ? `${name.trim()} ji` : 'ji';
  return `Namaste ${who} 🙏 Aapki ${product} report taiyaar hai: ${url} — Trikaal Vaani`;
}

async function fromRazorpay(paymentId: string): Promise<{ phone?: string; amount?: number }> {
  if (!paymentId.startsWith('pay_')) return {};
  try {
    const rzp = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    const p: any = await rzp.payments.fetch(paymentId);
    return { phone: p?.contact ?? undefined, amount: p?.amount ? Number(p.amount) / 100 : undefined };
  } catch (e) {
    console.warn('[notify] razorpay fetch failed:', e instanceof Error ? e.message : e);
    return {};
  }
}

/** Report ready → one 1-tap email to the CEO. Never throws. */
export async function notifyReportReady(input: NotifyInput): Promise<void> {
  try {
    const supa = admin();
    let { paymentId, customerName, phone, amountRupees } = input;

    // 1a. Order table se (Karmic / Milan / Muhurat)
    if (input.orderTable && input.orderId) {
      const { data: o } = await supa.from(input.orderTable)
        .select('razorpay_payment_id, paypal_capture_id, user_name, user_mobile, amount_rupees')
        .eq('id', input.orderId).maybeSingle();
      if (o) {
        paymentId = paymentId || o.razorpay_payment_id || o.paypal_capture_id || null;
        customerName = customerName || o.user_name || null;
        phone = phone || o.user_mobile || null;
        amountRupees = amountRupees ?? (o.amount_rupees != null ? Number(o.amount_rupees) : null);
      }
    }
    const key = paymentId || (input.orderId ? `order:${input.orderId}` : null);
    if (!key) { console.warn(`[notify] ${input.product}: no payment/order id — skipped`); return; }

    // 1b. Razorpay se mobile/amount (agar abhi bhi nahi mila)
    if ((!phone || amountRupees == null) && paymentId) {
      const r = await fromRazorpay(paymentId);
      phone = phone || r.phone || null;
      amountRupees = amountRupees ?? r.amount ?? null;
    }
    const waNumber = normalizeIndianPhone(phone);
    const name = (customerName ?? '').trim();

    // 2. Ek payment = ek email (PRIMARY KEY). Duplicate = chup-chaap bahar.
    const { data: inserted, error: insErr } = await supa.from('report_notifications')
      .upsert({
        payment_id: key, product: input.product, customer_name: name || null,
        phone: waNumber, report_url: input.reportUrl,
      }, { onConflict: 'payment_id', ignoreDuplicates: true })
      .select('payment_id');
    if (insErr) { console.error('[notify] table insert failed:', insErr.message); return; }
    if (!inserted || inserted.length === 0) {
      console.log(`[notify] ${input.product} ${key}: already notified — skip`);
      return;
    }

    // 3. Email (Apps Script webhook)
    const url = process.env.ALERT_WEBHOOK_URL;
    const secret = process.env.ALERT_WEBHOOK_KEY;
    if (!url || !secret) {
      console.warn('[notify] ALERT_WEBHOOK_URL/KEY not set — email NOT sent', key);
      await supa.from('report_notifications').update({ emailed_at: null }).eq('payment_id', key);
      return;
    }
    const msg = customerMessage(name, input.product, input.reportUrl);
    const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}` : null;
    const amt = amountRupees != null ? ` ₹${amountRupees}` : '';
    const subject = `📿 Report bhejein — ${name || 'Customer'}, ${input.product}${amt}`;
    const body =
      `${input.product}${amt} — ${name || 'Customer'}\n` +
      `Mobile: ${waNumber ? '+' + waNumber : 'NAHI MILA'}\n\n` +
      (waLink ? `WhatsApp par bhejo (tap karein):\n${waLink}\n\n` : `Mobile nahi mila — report link khud bhejein.\n\n`) +
      `Message:\n${msg}\n\nPayment: ${key}`;
    const html =
      `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">` +
      `<p><b>${esc(input.product)}${esc(amt)}</b> — ${esc(name || 'Customer')}<br>` +
      `Mobile: ${waNumber ? '+' + esc(waNumber) : '<b style="color:#c00">NAHI MILA</b>'}</p>` +
      (waLink
        ? `<p><a href="${esc(waLink)}" style="display:inline-block;background:#25D366;color:#fff;` +
          `padding:14px 22px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:17px">` +
          `WhatsApp par bhejo</a></p>`
        : `<p style="color:#c00">Mobile nahi mila — report link khud bhejein.</p>`) +
      `<p style="color:#555">Message:<br>${esc(msg)}</p>` +
      `<p style="color:#999;font-size:12px">Payment: ${esc(key)}</p></div>`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: secret, subject, body, html }),
      signal: AbortSignal.timeout(10_000),
      redirect: 'follow',
    });
    if (!res.ok) {
      console.error(`[notify] email webhook HTTP ${res.status}`, key);
      await supa.from('report_notifications').update({ emailed_at: null }).eq('payment_id', key);
      return;
    }
    console.log(`[notify] EMAILED | ${input.product} | ${key} | ${waNumber ?? 'no-phone'}`);
  } catch (e) {
    console.error('[notify] failed (report unaffected):', e instanceof Error ? e.message : e);
  }
}
// END — lib/report-notify.ts v1.0
