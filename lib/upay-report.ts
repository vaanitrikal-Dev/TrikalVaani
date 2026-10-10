// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     lib/upay-report.ts
// Version:  v1.1 (10 Oct 2026)
//   v1.1: grahak ki apni baat (upay_reports.vishesh) CEO email mein (note).
//         Chunav mein grah/dosh slug bhi — VM granth_api v4.3.
//   v1.0: pehla version.
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// ── KYA HAI ────────────────────────────────────────────────────────────────
// Upay Calculator (₹51) ki report banane ka EK hi raasta — Razorpay callback
// bhi isi ko bulata hai aur paid-recovery cron bhi. Isliye do report kabhi
// nahi bantin, aur browser band ho jaaye tab bhi report ban jaati hai.
//
//   1. upay_reports ki row (order route ne banayi thi) padho
//   2. pehle se 'ready' → wahi slug lautao
//   3. attempts par ATOMIC claim (razorpay-callback jaisa tareeka)
//   4. VM /granth/upay-calculator (tier paid, 2 samasya) — granth_api v4.2
//   5. result + slug + status 'ready' save
//   6. lib/report-notify se CEO ko 1-tap WhatsApp email
//
// Koi AI nahi. Har upay Supabase `upay_phala` (granth) se, VM par chuna jaata hai.
// ════════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';
import { callVM } from '@/lib/callVM';
import { notifyReportReady } from '@/lib/report-notify';

export const UPAY_AMOUNT_PAISE = 5100;
export const UPAY_SITE = 'https://trikalvaani.com';

export function upayAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export interface UpayBirth {
  name?: string | null;
  year: number; month: number; day: number;
  hour: number; minute: number;
  latitude: number; longitude: number; timezone: number;
  city?: string | null;
  time_assumed?: boolean;
}

/** Browser se aaya janm-vivran — har number jaancha jaata hai, kuch maana nahi jaata. */
export function cleanBirth(b: any): UpayBirth | null {
  const n = (v: any) => (v === '' || v == null ? NaN : Number(v));
  const out: UpayBirth = {
    name: b?.name ? String(b.name).slice(0, 80) : null,
    year: n(b?.year), month: n(b?.month), day: n(b?.day),
    hour: n(b?.hour), minute: n(b?.minute),
    latitude: n(b?.latitude), longitude: n(b?.longitude),
    timezone: Number.isFinite(n(b?.timezone)) ? n(b?.timezone) : 5.5,
    city: b?.city ? String(b.city).slice(0, 120) : null,
    time_assumed: !!b?.time_assumed,
  };
  const ok =
    out.year >= 1900 && out.year <= 2100 && out.month >= 1 && out.month <= 12 &&
    out.day >= 1 && out.day <= 31 && out.hour >= 0 && out.hour <= 23 &&
    out.minute >= 0 && out.minute <= 59 &&
    Math.abs(out.latitude) <= 90 && Math.abs(out.longitude) <= 180 &&
    Number.isFinite(out.latitude) && Number.isFinite(out.longitude);
  return ok ? out : null;
}

export const SAMASYA_RE = /^[a-z0-9-]{2,40}$/;

/** VM ko jaane wala body (BirthInput ke naam). */
export function vmBirth(b: UpayBirth) {
  return {
    year: b.year, month: b.month, day: b.day, hour: b.hour, minute: b.minute,
    latitude: b.latitude, longitude: b.longitude, timezone: b.timezone,
    name: b.name ?? undefined,
  };
}

/** VM /granth/upay-calculator — free / paid / grah. Galti par throw. */
export async function callUpayVM(body: Record<string, unknown>, timeoutMs = 60_000) {
  const res = await callVM('/granth/upay-calculator', {
    method: 'POST',
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`VM HTTP ${res.status}: ${String(data?.detail ?? data?.error ?? '').slice(0, 200)}`);
  if (data?.galti) throw new Error(`VM: ${String(data.galti).slice(0, 200)}`);
  return data;
}

function makeSlug(name?: string | null): string {
  const base = String(name ?? '')
    .toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 24);
  return `upay-${base ? base + '-' : ''}${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
}

export type GenerateResult =
  | { ok: true; slug: string; already?: boolean }
  | { ok: false; reason: 'no_row' | 'claimed' | 'failed'; error?: string };

/**
 * Paid upay report banao. callback aur cron dono yahi bulate hain.
 * paymentId ka signature CALLER pehle hi jaanch chuka hota hai.
 */
export async function generateUpayReport(orderId: string, paymentId: string, via: string): Promise<GenerateResult> {
  const supa = upayAdmin();
  const { data: row, error } = await supa.from('upay_reports').select('*')
    .eq('razorpay_order_id', orderId).maybeSingle();
  if (error) return { ok: false, reason: 'failed', error: `read: ${error.message}` };
  if (!row) return { ok: false, reason: 'no_row' };
  if (row.status === 'ready' && row.slug) return { ok: true, slug: row.slug, already: true };

  // ATOMIC claim — sirf ek process banaye
  const { data: claimed } = await supa.from('upay_reports')
    .update({
      attempts: (row.attempts ?? 0) + 1, last_error: `${via}: generating`,
      razorpay_payment_id: paymentId, payment_verified: true, status: 'paid',
    })
    .eq('razorpay_order_id', orderId)
    .eq('attempts', row.attempts ?? 0)
    .neq('status', 'ready')
    .select('id');
  if (!claimed || claimed.length === 0) return { ok: false, reason: 'claimed' };

  try {
    const birth = row.birth as UpayBirth;
    const result = await callUpayVM({
      ...vmBirth(birth), tier: 'paid', samasya: row.samasya ?? [],
    }, 90_000);
    if (!Array.isArray(result?.upay) || result.upay.length === 0) {
      throw new Error('VM ne upay khaali lautaye');
    }
    const slug = row.slug || makeSlug(row.person_name);
    const { error: upErr } = await supa.from('upay_reports').update({
      slug, result, status: 'ready', ready_at: new Date().toISOString(),
      last_error: `delivered via ${via}`,
    }).eq('razorpay_order_id', orderId);
    if (upErr) throw new Error(`save: ${upErr.message}`);

    await notifyReportReady({
      product: 'Upay Report',
      reportUrl: `${UPAY_SITE}/upay/${slug}`,
      paymentId,
      customerName: row.person_name ?? null,
      phone: row.mobile ?? null,
      amountRupees: (row.amount_paise ?? UPAY_AMOUNT_PAISE) / 100,
      note: row.vishesh ? `Grahak ki baat: ${String(row.vishesh).slice(0, 300)}` : null,
    });
    console.log(`[upay] DELIVERED via ${via} | ${paymentId} | ${slug}`);
    return { ok: true, slug };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[upay] FAILED via ${via}:`, msg, orderId, paymentId);
    await supa.from('upay_reports').update({ last_error: `${via}: ${msg}`.slice(0, 500) })
      .eq('razorpay_order_id', orderId);
    return { ok: false, reason: 'failed', error: msg };
  }
}
// END — lib/upay-report.ts v1.1
