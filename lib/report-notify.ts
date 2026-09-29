// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     lib/report-notify.ts   (NEW FILE)
// Version:  v1.2 (29 Sep 2026)
// v1.2: email bhejna alag function (sendNotifyEmail) + retryPendingEmails() —
//   paid-recovery cron har 5 min un rows ko dobara bhejta hai jinka email
//   fail hua tha (emailed_at khaali). Customer message/format wahi.
// v1.1: Apps Script galat key par bhi HTTP 200 deta hai (body mein ok:false).
//   v1.0 sirf HTTP status dekhta tha → CEO ke pehle test mein log ne
//   "EMAILED" likha par email aaya hi nahi. Ab JSON ka ok:true zaroori; warna
//   asli error (jaise "bad key") log + emailed_at khaali (Phase 2 dobara bhejega).
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

interface EmailRow {
  key: string; product: string; name: string; waNumber: string | null;
  reportUrl: string; amountRupees?: number | null;
}

/** v1.2: ek 1-tap email bhejo. true = Apps Script ne ok:true kaha. Never throws. */
async function sendNotifyEmail(r: EmailRow): Promise<boolean> {
  try {
    const url = process.env.ALERT_WEBHOOK_URL;
    const secret = process.env.ALERT_WEBHOOK_KEY;
    if (!url || !secret) { console.warn('[notify] ALERT_WEBHOOK_URL/KEY not set — email NOT sent', r.key); return false; }
    const msg = customerMessage(r.name, r.product, r.reportUrl);
    const waLink = r.waNumber ? `https://wa.me/${r.waNumber}?text=${encodeURIComponent(msg)}` : null;
    const amt = r.amountRupees != null ? ` ₹${r.amountRupees}` : '';
    const subject = `📿 Report bhejein — ${r.name || 'Customer'}, ${r.product}${amt}`;
    const body =
      `${r.product}${amt} — ${r.name || 'Customer'}\n` +
      `Mobile: ${r.waNumber ? '+' + r.waNumber : 'NAHI MILA'}\n\n` +
      (waLink ? `WhatsApp par bhejo (tap karein):\n${waLink}\n\n` : `Mobile nahi mila — report link khud bhejein.\n\n`) +
      `Message:\n${msg}\n\nPayment: ${r.key}`;
    const html =
      `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5">` +
      `<p><b>${esc(r.product)}${esc(amt)}</b> — ${esc(r.name || 'Customer')}<br>` +
      `Mobile: ${r.waNumber ? '+' + esc(r.waNumber) : '<b style="color:#c00">NAHI MILA</b>'}</p>` +
      (waLink
        ? `<p><a href="${esc(waLink)}" style="display:inline-block;background:#25D366;color:#fff;` +
          `padding:14px 22px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:17px">` +
          `WhatsApp par bhejo</a></p>`
        : `<p style="color:#c00">Mobile nahi mila — report link khud bhejein.</p>`) +
      `<p style="color:#555">Message:<br>${esc(msg)}</p>` +
      `<p style="color:#999;font-size:12px">Payment: ${esc(r.key)}</p></div>`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: secret, subject, body, html }),
      signal: AbortSignal.timeout(10_000),
      redirect: 'follow',
    });
    // v1.1: Apps Script har haal mein 200 deta hai — asli jawab JSON ke andar
    const reply: any = await res.json().catch(() => null);
    if (!res.ok || !reply || reply.ok !== true) {
      console.error(`[notify] email NOT sent | HTTP ${res.status} | ${JSON.stringify(reply).slice(0, 200)}`, r.key);
      return false;
    }
    console.log(`[notify] EMAILED | ${r.product} | ${r.key} | ${r.waNumber ?? 'no-phone'}`);
    return true;
  } catch (e) {
    console.error('[notify] send failed:', e instanceof Error ? e.message : e);
    return false;
  }
}

/** v1.2: cron ke liye — jin rows ka email fail hua (emailed_at khaali) unhe dobara bhejo. */
export async function retryPendingEmails(limit = 5): Promise<{ tried: number; sent: number }> {
  const out = { tried: 0, sent: 0 };
  try {
    const supa = admin();
    const { data: rows } = await supa.from('report_notifications')
      .select('payment_id, product, customer_name, phone, report_url')
      .is('emailed_at', null).limit(limit);
    for (const row of rows ?? []) {
      out.tried++;
      const ok = await sendNotifyEmail({
        key: row.payment_id, product: row.product ?? 'Report', name: row.customer_name ?? '',
        waNumber: row.phone ?? null, reportUrl: row.report_url ?? 'https://trikalvaani.com',
      });
      if (ok) {
        out.sent++;
        await supa.from('report_notifications').update({ emailed_at: new Date().toISOString() })
          .eq('payment_id', row.payment_id);
      }
    }
  } catch (e) {
    console.error('[notify] retryPendingEmails failed:', e instanceof Error ? e.message : e);
  }
  return out;
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
    const ok = await sendNotifyEmail({
      key, product: input.product, name, waNumber, reportUrl: input.reportUrl, amountRupees,
    });
    if (!ok) await supa.from('report_notifications').update({ emailed_at: null }).eq('payment_id', key);
  } catch (e) {
    console.error('[notify] failed (report unaffected):', e instanceof Error ? e.message : e);
  }
}
// END — lib/report-notify.ts v1.2
