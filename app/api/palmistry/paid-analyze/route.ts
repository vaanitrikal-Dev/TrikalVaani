// TRIKAL VAANI - Palmistry Paid Analyze + Verify API - v4.1
// CEO: Rohiit Gupta | Chief Vedic Architect
//
// v4.1 — ENGINE v1.1.0 COMPATIBILITY (2026-07-19):
//   • CRITICAL FIX: engine v1.1.0's confidence gate returns
//     {success:true, pending_review:true} WITHOUT report/scores. v4.0
//     only checked data.success, treated the gate as a full success,
//     called PDF with an undefined report, inserted a hollow row, and
//     returned pending_review:false → the user saw a BLANK result
//     screen. v4.1 detects pending_review and routes it to the same
//     graceful "personal review" handoff as a VM failure.
//   • Forwards handedness + dominant_palm_b64/other_palm_b64 to the VM
//     (engine v1.1.0 dual-palm + left-handed support). Backward
//     compatible: right/left fields still sent as fallback.
//   • Gate rows now save mp_features + gemini_data when the engine
//     provides them — the review team sees WHY it was gated instead
//     of a row full of nulls. reason column value: 'low_confidence'
//     vs 'vm_error' recorded in session_id prefix.
//
// v3.0 — ROOT-CAUSE FIX (proven by 4 live VM tests: analyze takes 85-94s):
//   • REMOVED the 3x retry loop (was causing false pending_review).
//   • SINGLE attempt with a 150s timeout (observed max 94s + safe buffer).
//     NOTE v4.1: engine v1.1.0 dual-palm adds a 2nd Gemini call
//     (~15-25s). Timeout raised 150s → 180s. maxDuration=300 still
//     covers 180s + 60s PDF.
//   • PDF stays non-fatal with its own 60s timeout.
//
// v4.0 — CLIENT DATA CAPTURE + PDF STORAGE (proven: PDF endpoint returns
//   valid %PDF in 3s; palmistry-pdfs bucket + columns live in Supabase):
//   • Captures user_mobile (for follow-up) + razorpay_order_id (audit).
//   • Generates a permanent slug per report.
//   • Uploads the generated PDF to the palmistry-pdfs Storage bucket and
//     saves its public pdf_url. NON-FATAL — if upload fails, the report
//     + tier='paid' still save and return.
//
// Flow: verify HMAC → slug → VM analyze (180s) → [pending_review gate?]
//       → VM PDF (60s) → upload PDF to Storage (non-fatal) → Supabase
//       save → return report + PDF + url.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { callVM } from '@/lib/callVM';

// ── CRITICAL: function must outlive a ~90-120s VM analyze (Vercel Pro allows 300) ──
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const VM_ANALYZE_ENDPOINT =
  process.env.VM_PALM_ANALYZE_ENDPOINT ?? 'http://34.47.182.227:8001/palmistry/analyze';
const VM_PDF_ENDPOINT =
  process.env.VM_PALM_PDF_ENDPOINT ?? 'http://34.47.182.227:8001/palmistry/generate-pdf';

const WHATSAPP_NUMBER = '919211804111';
const PDF_BUCKET = 'palmistry-pdfs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Permanent, unique, readable slug for each report (e.g. "rohiit-a3f9c2").
function makeSlug(name?: string): string {
  const base =
    (name || 'hast-rekha')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'hast-rekha';
  const rand = crypto.randomBytes(3).toString('hex');
  return `${base}-${rand}`;
}

interface PalmVerifyRequest {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
  // Legacy fields (still sent by frontend for backward compat):
  right_palm_b64:      string;
  left_palm_b64?:      string | null;
  // v4.1 — engine v1.1.0 fields (frontend v2.1 sends these):
  dominant_palm_b64?:  string | null;
  other_palm_b64?:     string | null;
  handedness?:         string;          // 'right' | 'left'
  user_name?:          string;
  user_mobile?:        string;
  gender?:             string;
  language?:           string;
  dob?:                string;
}

export async function POST(req: NextRequest) {
  try {
    const body: PalmVerifyRequest = await req.json();
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      right_palm_b64, left_palm_b64,
      dominant_palm_b64, other_palm_b64, handedness,
      user_name, user_mobile, gender, language, dob,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }
    if (!right_palm_b64 && !dominant_palm_b64) {
      return NextResponse.json({ error: 'Palm image missing.' }, { status: 400 });
    }

    // ── 1. Verify Razorpay Signature (HMAC) ──────────────────────────────────
    const secret   = process.env.RAZORPAY_KEY_SECRET!;
    const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (expected !== razorpay_signature) {
      console.error('[Trikal] Palm signature mismatch:', razorpay_order_id);
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    // Permanent slug for this report (used for PDF filename + report link).
    const slug = makeSlug(user_name);

    // ── Shared: graceful "personal review" handoff (VM failure OR gate) ─────
    const pendingReviewResponse = async (
      reason: 'vm_error' | 'low_confidence',
      diagnostics?: { mp_features?: any; gemini_data?: any }
    ) => {
      console.error('[Trikal] Palm → pending_review:', reason, razorpay_order_id);

      await supabase.from('palmistry_reports').insert({
        session_id:        `palm_review_${reason}_${Date.now()}`,
        slug,
        user_name:         user_name   ?? null,
        user_mobile:       user_mobile ?? null,
        gender:            gender      ?? 'M',
        language:          language    ?? 'hi',
        // v4.1: save gate diagnostics so the review team sees WHY —
        // not a row full of nulls.
        mp_features:  diagnostics?.mp_features ?? null,
        gemini_data:  diagnostics?.gemini_data ?? null,
        scores:       null,
        observations: null,
        report:       null,
        tier:         'pending_review',
        payment_id:        razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
      });

      const waText = encodeURIComponent(
        `Namaste! Meri Hast Rekha report personal review mein hai.\n` +
        `Payment ID: ${razorpay_payment_id}\n` +
        `Naam: ${user_name || 'N/A'}`
      );

      return NextResponse.json({
        success:        true,
        pending_review: true,
        paymentId:      razorpay_payment_id,
        whatsappUrl:    `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`,
        message:        'Aapki detailed Hast Rekha reading personally review ki ja rahi hai.',
      });
    };

    // ── 2. VM Analysis — SINGLE attempt, 180s timeout ────────────────────────
    // (v1.1.0 dual-palm = 2nd Gemini call, ~+15-25s over the observed 85-94s)
    let analysisData: any = null;
    let gateData: any = null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000); // 180s
    try {
      const vmRes = await callVM(VM_ANALYZE_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          // v4.1: engine v1.1.0 fields — dominant is the primary read.
          dominant_palm_b64: dominant_palm_b64 ?? right_palm_b64 ?? null,
          other_palm_b64:    other_palm_b64    ?? left_palm_b64  ?? null,
          handedness:        handedness        ?? 'right',
          // Legacy fields kept for engine backward compat:
          right_palm_b64:    right_palm_b64    ?? dominant_palm_b64 ?? null,
          left_palm_b64:     left_palm_b64     ?? other_palm_b64    ?? null,
          user_name: user_name ?? '',
          gender:    gender    ?? 'M',
          language:  language  ?? 'hi',
          dob:       dob       ?? '',
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (vmRes.ok) {
        const data = await vmRes.json();
        if (data?.success && data?.pending_review) {
          // v4.1 CRITICAL: engine confidence gate — NOT a full success.
          // No report/scores exist. Route to review handoff.
          gateData = data;
          console.warn('[Trikal] Palm engine gated (low confidence):', data?.reason);
        } else if (data?.success && data?.report) {
          analysisData = data;
          console.log('[Trikal] Palm analysis OK | dual_palm=', data?.dual_palm ?? false);
        } else {
          console.error('[Trikal] Palm analyze unusable response:', JSON.stringify(data).slice(0, 200));
        }
      } else {
        const txt = await vmRes.text().catch(() => '');
        console.error('[Trikal] Palm VM analyze non-200:', vmRes.status, txt.slice(0, 200));
      }
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] Palm VM fetch failed/aborted:', e);
    }

    // ── 3. Gate or genuine failure → graceful "personal review" handoff ─────
    if (gateData) {
      return pendingReviewResponse('low_confidence', {
        mp_features: gateData.mp_features,
        gemini_data: gateData.gemini_data,
      });
    }
    if (!analysisData) {
      return pendingReviewResponse('vm_error');
    }

    // ── 4. SUCCESS → Generate PDF (non-blocking, 60s) ────────────────────────
    let pdf_b64: string | null = null;
    try {
      const pdfController = new AbortController();
      const pdfTimeout = setTimeout(() => pdfController.abort(), 60000);
      const pdfRes = await callVM(VM_PDF_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          report:       analysisData.report,
          scores:       analysisData.scores,
          mp_features:  analysisData.mp_features,
          observations: analysisData.observations,
          user_name:    user_name ?? '',
          gender:       gender    ?? 'M',
          language:     language  ?? 'hi',
          order_id:     razorpay_order_id,
        }),
        signal: pdfController.signal,
      });
      clearTimeout(pdfTimeout);
      if (pdfRes.ok) {
        const pdfData = await pdfRes.json();
        pdf_b64 = pdfData.pdf_b64 ?? null;
      } else {
        console.error('[Trikal] Palm PDF non-200:', pdfRes.status);
      }
    } catch (e) {
      console.error('[Trikal] Palm PDF generation failed (non-fatal):', e);
    }

    // ── 4b. Upload PDF to Supabase Storage (non-fatal) → pdf_url ─────────────
    let pdf_url: string | null = null;
    if (pdf_b64) {
      try {
        const pdfBuffer = Buffer.from(pdf_b64, 'base64');
        const pdfPath   = `${slug}.pdf`;
        const { error: upErr } = await supabase.storage
          .from(PDF_BUCKET)
          .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from(PDF_BUCKET).getPublicUrl(pdfPath);
          pdf_url = urlData.publicUrl ?? null;
          console.log('[Trikal] Palm PDF uploaded:', pdfPath);
        } else {
          console.error('[Trikal] Palm PDF upload error:', upErr.message);
        }
      } catch (e) {
        console.error('[Trikal] Palm PDF upload exception (non-fatal):', e);
      }
    }

    // ── 5. Save successful report to Supabase ────────────────────────────────
    const session_id = `palm_${Date.now()}`;
    const { error: saveErr } = await supabase
      .from('palmistry_reports')
      .insert({
        session_id,
        slug,
        user_name:         user_name   ?? null,
        user_mobile:       user_mobile ?? null,
        gender:            gender      ?? 'M',
        language:          language    ?? 'hi',
        mp_features:  analysisData.mp_features,
        gemini_data:  analysisData.gemini_data,
        scores:       analysisData.scores,
        observations: analysisData.observations,
        report:       analysisData.report,
        pdf_url,
        tier:         'paid',
        payment_id:        razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
      });

    if (saveErr) {
      console.error('[Trikal] Palm record save error:', saveErr.message);
      // Non-fatal — user still gets the report below.
    }

    // ── 6. Return report + PDF ───────────────────────────────────────────────
    return NextResponse.json({
      success:        true,
      pending_review: false,
      session_id,
      slug,
      mp_features:    analysisData.mp_features,
      scores:         analysisData.scores,
      observations:   analysisData.observations,
      report:         analysisData.report,
      pdf_b64,
      pdf_url,
      paymentId:      razorpay_payment_id,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Palm verify+analyze error:', err);
    return NextResponse.json(
      { error: 'Server error. Payment safe — contact us if report does not load.' },
      { status: 500 }
    );
  }
}
