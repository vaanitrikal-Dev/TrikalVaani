// ============================================================
// File: app/api/palmistry/retry/route.ts
// Version: 1.1 (27 Oct 2026) — janm tithi | 1.0 (27 Oct 2026) — NAYA
// v1.1: row mein janm tithi khaali ho aur customer ne retry screen par bhari ho (YYYY-MM-DD)
//   → wahi VM ko jaati hai (engine 2.1.0 ke "शुभ वर्ष") aur row mein save hoti hai.
//   Pehle se bhari janm tithi KABHI nahi badalti.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// MUFT DOBARA-PHOTO (Rohiit faisla 27 Oct 2026: "our cost is nil, one free retry").
// Do haalaat:
//   A. tier 'needs_photo' — paise mile, par pehli photo mein hatheli padhi hi nahi gayi.
//      Nayi photo se PEHLI report banti hai. Muft retry abhi bhi bachi rehti hai.
//   B. tier 'paid' + free_retry_used=false — report bani thi, kuch rekha saaf nahi
//      thi. Nayi photo se poori report dobara (PDF wahi naam, upsert). Retry khatam.
// Pehchaan: slug + retry_token (sirf us customer ke browser ke paas). Payment dobara
// verify nahi hoti — row hi saboot hai. Nayi photo bhi na padhi jaaye → retry
// KHARCH NAHI hoti, customer phir koshish kar sakta hai.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { callVM } from '@/lib/callVM';
import { notifyReportReady } from '@/lib/report-notify';
import { saveConsentPhotos, tokenMatches } from '@/lib/palm-store';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const VM_ANALYZE_ENDPOINT =
  process.env.VM_PALM_ANALYZE_ENDPOINT ?? 'http://34.47.182.227:8001/palmistry/analyze';
const VM_PDF_ENDPOINT =
  process.env.VM_PALM_PDF_ENDPOINT ?? 'http://34.47.182.227:8001/palmistry/generate-pdf';
const PDF_BUCKET = 'palmistry-pdfs';
const MAX_B64 = 2_000_000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, retry_token, dominant_palm_b64, other_palm_b64, handedness, photo_consent, dob } = body ?? {};

    if (typeof slug !== 'string' || typeof retry_token !== 'string' || !slug || !retry_token) {
      return NextResponse.json({ error: 'Report ki pehchaan nahi mili.' }, { status: 400 });
    }
    if (typeof dominant_palm_b64 !== 'string' || !dominant_palm_b64 || dominant_palm_b64.length > MAX_B64 ||
        (other_palm_b64 && (typeof other_palm_b64 !== 'string' || other_palm_b64.length > MAX_B64))) {
      return NextResponse.json({ error: 'Photo nahi mili ya bahut badi hai.' }, { status: 400 });
    }

    const { data: row, error: rowErr } = await supabase.from('palmistry_reports')
      .select('slug, tier, retry_token, free_retry_used, user_name, user_mobile, gender, language, dob, photo_consent, consent_photo_paths, payment_id')
      .eq('slug', slug).maybeSingle();
    if (rowErr || !row || !tokenMatches(row.retry_token, retry_token)) {
      return NextResponse.json({ error: 'Yeh report nahi mili.' }, { status: 404 });
    }
    const firstReport = row.tier === 'needs_photo';
    // v1.1 — nayi janm tithi sirf tab jab row mein khaali ho
    const newDob = !row.dob && typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dob) && dob <= new Date().toISOString().slice(0, 10) ? dob : null;
    const useDob = row.dob || newDob || '';
    if (!firstReport && !(row.tier === 'paid' && !row.free_retry_used)) {
      return NextResponse.json({ error: 'Muft dobara-photo is report par pehle hi istemal ho chuki hai.', used: true }, { status: 409 });
    }

    // ── VM analyze (engine v2.0, ~2-5s) ──
    let data: any = null;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 60000);
    try {
      const res = await callVM(VM_ANALYZE_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          dominant_palm_b64, other_palm_b64: other_palm_b64 ?? null,
          handedness: handedness === 'left' ? 'left' : 'right',
          user_name: row.user_name ?? '', gender: row.gender ?? 'M',
          language: row.language ?? 'hi', dob: useDob,
        }),
        cache: 'no-store',
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (res.ok) data = await res.json();
      else console.error('[Trikal] Palm retry VM non-200:', res.status);
    } catch (e) {
      clearTimeout(t);
      console.error('[Trikal] Palm retry VM failed:', e);
    }
    if (!data?.success) {
      return NextResponse.json({ error: 'Server abhi jawab nahi de raha — 1 minute baad dobara try karein. Aapki muft koshish bachi hai.' }, { status: 502 });
    }
    if (data.pending_review || !data.report) {
      // Nayi photo bhi padhi nahi gayi — retry kharch nahi
      return NextResponse.json({
        success: false, photo_problem: true,
        photo_message: Array.isArray(data.photo_message) ? data.photo_message : [],
      });
    }

    // ── PDF (non-fatal) ──
    let pdf_b64: string | null = null;
    let pdf_url: string | null = null;
    try {
      const pc = new AbortController();
      const pt = setTimeout(() => pc.abort(), 45000);
      const pr = await callVM(VM_PDF_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          report: data.report, scores: data.scores ?? {}, mp_features: data.mp_features ?? {},
          observations: [], user_name: row.user_name ?? '', gender: row.gender ?? 'M',
          language: row.language ?? 'hi', order_id: row.payment_id ?? '',
        }),
        cache: 'no-store',
        signal: pc.signal,
      });
      clearTimeout(pt);
      if (pr.ok) pdf_b64 = (await pr.json()).pdf_b64 ?? null;
    } catch (e) {
      console.error('[Trikal] Palm retry PDF failed (non-fatal):', e);
    }
    if (pdf_b64) {
      const { error: upErr } = await supabase.storage.from(PDF_BUCKET)
        .upload(`${slug}.pdf`, Buffer.from(pdf_b64, 'base64'), { contentType: 'application/pdf', upsert: true });
      if (!upErr) pdf_url = supabase.storage.from(PDF_BUCKET).getPublicUrl(`${slug}.pdf`).data.publicUrl ?? null;
    }

    // ── Consent photos (sirf haan par) ──
    const consent = !!row.photo_consent || photo_consent === true;
    let consentPaths = Array.isArray(row.consent_photo_paths) ? row.consent_photo_paths : [];
    if (consent) {
      const right = handedness === 'left' ? (other_palm_b64 ?? null) : dominant_palm_b64;
      const left  = handedness === 'left' ? dominant_palm_b64 : (other_palm_b64 ?? null);
      consentPaths = consentPaths.concat(await saveConsentPhotos(supabase, slug, { right, left }));
    }

    const freeRetryUsed = firstReport ? !!row.free_retry_used : true;
    const { error: upd } = await supabase.from('palmistry_reports').update({
      mp_features: data.mp_features, gemini_data: data.gemini_data, scores: data.scores ?? {},
      observations: [], report: data.report, pdf_url: pdf_url ?? undefined,
      tier: 'paid', free_retry_used: freeRetryUsed, engine_version: data.engine_version ?? null,
      photo_consent: consent, consent_photo_paths: consentPaths.length ? consentPaths : null,
      ...(newDob ? { dob: newDob } : {}),
    }).eq('slug', slug);
    if (upd) console.error('[Trikal] Palm retry save error:', upd.message);

    if (firstReport && pdf_url) {
      await notifyReportReady({
        product: 'Hast Rekha', reportUrl: pdf_url, paymentId: row.payment_id ?? null,
        customerName: row.user_name ?? null, phone: row.user_mobile ?? null,
      });
    }

    return NextResponse.json({
      success: true, pending_review: false, slug,
      mp_features: data.mp_features, scores: data.scores ?? {}, observations: [],
      report: data.report, pdf_b64, pdf_url,
      quality_notes: data.quality_notes ?? [], low_clarity: !!data.low_clarity,
      retry_token, free_retry_available: !freeRetryUsed,
    });
  } catch (e) {
    console.error('[Trikal] Palm retry error:', e);
    return NextResponse.json({ error: 'Server error — aapki muft koshish bachi hai, dobara try karein.' }, { status: 500 });
  }
}
