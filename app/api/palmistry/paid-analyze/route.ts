// TRIKAL VAANI - Palmistry Paid Analyze + Verify API - v2.0
// CEO: Rohiit Gupta | Chief Vedic Architect
// v2.0: SILENT AUTO-RETRY (3x) + classy "personal review" fallback.
//   If VM analysis fails, retry up to 3 times silently. If all fail,
//   payment is logged to Supabase as "pending_review" and a graceful
//   WhatsApp-handoff response is returned (NO "failed" language).
// Pattern matched to verify-milan-payment (HMAC verify, callVM, AbortController).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { callVM } from '@/lib/callVM';

const VM_ANALYZE_ENDPOINT =
  process.env.VM_PALM_ANALYZE_ENDPOINT ?? 'http://34.47.182.227:8001/palmistry/analyze';
const VM_PDF_ENDPOINT =
  process.env.VM_PALM_PDF_ENDPOINT ?? 'http://34.47.182.227:8001/palmistry/generate-pdf';

const WHATSAPP_NUMBER = '919211804111';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PalmVerifyRequest {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
  right_palm_b64:      string;
  left_palm_b64?:      string | null;
  user_name?:          string;
  gender?:             string;
  language?:           string;
  dob?:                string;
}

// Sleep helper for retry backoff
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// One VM analyze attempt with timeout. Returns parsed data or null.
async function tryAnalyze(payload: object): Promise<any | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const vmRes = await callVM(VM_ANALYZE_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!vmRes.ok) {
      const txt = await vmRes.text().catch(() => '');
      console.error('[Trikal] Palm VM analyze non-200:', vmRes.status, txt.slice(0, 200));
      return null;
    }
    const data = await vmRes.json();
    return data?.success ? data : null;
  } catch (e: unknown) {
    clearTimeout(timeout);
    console.error('[Trikal] Palm VM attempt failed:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: PalmVerifyRequest = await req.json();
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      right_palm_b64, left_palm_b64,
      user_name, gender, language, dob,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields.' }, { status: 400 });
    }
    if (!right_palm_b64) {
      return NextResponse.json({ error: 'Right palm image missing.' }, { status: 400 });
    }

    // ── 1. Verify Razorpay Signature (HMAC) ──────────────────────────────────
    const secret   = process.env.RAZORPAY_KEY_SECRET!;
    const payload  = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (expected !== razorpay_signature) {
      console.error('[Trikal] Palm signature mismatch:', razorpay_order_id);
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
    }

    // ── 2. VM Analysis — SILENT AUTO-RETRY (up to 3 attempts) ────────────────
    const vmPayload = {
      right_palm_b64,
      left_palm_b64: left_palm_b64 ?? null,
      user_name: user_name ?? '',
      gender:    gender    ?? 'M',
      language:  language  ?? 'hi',
      dob:       dob       ?? '',
    };

    let analysisData: any = null;
    const MAX_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      analysisData = await tryAnalyze(vmPayload);
      if (analysisData) {
        console.log(`[Trikal] Palm analysis OK on attempt ${attempt}`);
        break;
      }
      if (attempt < MAX_ATTEMPTS) {
        await sleep(2000 * attempt); // 2s, 4s backoff
      }
    }

    // ── 3. ALL ATTEMPTS FAILED → graceful "personal review" handoff ─────────
    if (!analysisData) {
      console.error('[Trikal] Palm analysis failed after 3 attempts:', razorpay_order_id);

      // Log to Supabase for manual review / refund
      await supabase.from('palmistry_reports').insert({
        session_id:  `palm_review_${Date.now()}`,
        user_name:   user_name ?? null,
        gender:      gender    ?? 'M',
        language:    language  ?? 'hi',
        mp_features: null,
        gemini_data: null,
        scores:      null,
        observations: null,
        report:      null,
        tier:        'pending_review',   // ← flag for manual handling
        payment_id:  razorpay_payment_id,
      });

      const waText = encodeURIComponent(
        `Namaste! Meri Hast Rekha report personal review mein hai.\n` +
        `Payment ID: ${razorpay_payment_id}\n` +
        `Naam: ${user_name || 'N/A'}`
      );

      // NOTE: deliberately NO "failed" language — premium personal-review framing
      return NextResponse.json({
        success:        true,
        pending_review: true,
        paymentId:      razorpay_payment_id,
        whatsappUrl:    `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`,
        message:        'Aapki detailed Hast Rekha reading personally review ki ja rahi hai.',
      });
    }

    // ── 4. SUCCESS → Generate PDF (non-blocking) ─────────────────────────────
    let pdf_b64: string | null = null;
    try {
      const pdfController = new AbortController();
      const pdfTimeout = setTimeout(() => pdfController.abort(), 30000);
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
      }
    } catch (e) {
      console.error('[Trikal] Palm PDF generation failed (non-fatal):', e);
    }

    // ── 5. Save successful report to Supabase ────────────────────────────────
    const session_id = `palm_${Date.now()}`;
    const { error: saveErr } = await supabase
      .from('palmistry_reports')
      .insert({
        session_id,
        user_name:    user_name ?? null,
        gender:       gender    ?? 'M',
        language:     language  ?? 'hi',
        mp_features:  analysisData.mp_features,
        gemini_data:  analysisData.gemini_data,
        scores:       analysisData.scores,
        observations: analysisData.observations,
        report:       analysisData.report,
        tier:         'paid',
        payment_id:   razorpay_payment_id,
      });

    if (saveErr) {
      console.error('[Trikal] Palm record save error:', saveErr.message);
    }

    // ── 6. Return report + PDF ───────────────────────────────────────────────
    return NextResponse.json({
      success:      true,
      pending_review: false,
      session_id,
      mp_features:  analysisData.mp_features,
      scores:       analysisData.scores,
      observations: analysisData.observations,
      report:       analysisData.report,
      pdf_b64,
      paymentId:    razorpay_payment_id,
    });

  } catch (err: unknown) {
    console.error('[Trikal] Palm verify+analyze error:', err);
    return NextResponse.json(
      { error: 'Server error. Payment safe — contact us if report does not load.' },
      { status: 500 }
    );
  }
}
