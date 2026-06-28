// TRIKAL VAANI - Palmistry Paid Analyze + Verify API - v3.0 FINAL
// CEO: Rohiit Gupta | Chief Vedic Architect
//
// v3.0 — ROOT-CAUSE FIX (proven by 4 live VM tests: analyze takes 85-94s):
//   • REMOVED the 3x retry loop. The VM engine is reliable (4/4 success in
//     testing), so retries only multiplied the timeout risk (3×90s) and
//     directly caused the false "pending_review" — the VM returned 200 at
//     ~94s but the old 90s AbortController had already aborted the fetch.
//   • SINGLE attempt with a 150s timeout (observed max 94s + safe buffer).
//   • maxDuration=300 (Vercel Pro) comfortably covers a 150s call + PDF.
//   • PDF stays non-fatal with its own 60s timeout.
//   • Graceful "personal review" fallback kept ONLY for a genuine error
//     (real 500 from VM, or true network failure) — not for slowness.
//
// Flow: verify HMAC → VM analyze (single, 150s) → VM PDF (60s, non-fatal)
//       → Supabase save → return report+PDF.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { callVM } from '@/lib/callVM';

// ── CRITICAL: function must outlive a ~90s VM analyze (Vercel Pro allows 300) ──
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

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

    // ── 2. VM Analysis — SINGLE attempt, 150s timeout (analyze ~85-94s) ──────
    let analysisData: any = null;
    let vmErrored = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 150000); // 150s
    try {
      const vmRes = await callVM(VM_ANALYZE_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          right_palm_b64,
          left_palm_b64: left_palm_b64 ?? null,
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
        if (data?.success) {
          analysisData = data;
          console.log('[Trikal] Palm analysis OK');
        } else {
          vmErrored = true;
          console.error('[Trikal] Palm analyze returned success=false:', JSON.stringify(data).slice(0, 200));
        }
      } else {
        vmErrored = true;
        const txt = await vmRes.text().catch(() => '');
        console.error('[Trikal] Palm VM analyze non-200:', vmRes.status, txt.slice(0, 200));
      }
    } catch (e: unknown) {
      clearTimeout(timeout);
      vmErrored = true;
      console.error('[Trikal] Palm VM fetch failed/aborted:', e);
    }

    // ── 3. GENUINE FAILURE → graceful "personal review" handoff ─────────────
    if (!analysisData) {
      console.error('[Trikal] Palm analysis unavailable:', razorpay_order_id, 'vmErrored=', vmErrored);

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
        tier:        'pending_review',
        payment_id:  razorpay_payment_id,
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
      // Non-fatal — user still gets the report below.
    }

    // ── 6. Return report + PDF ───────────────────────────────────────────────
    return NextResponse.json({
      success:        true,
      pending_review: false,
      session_id,
      mp_features:    analysisData.mp_features,
      scores:         analysisData.scores,
      observations:   analysisData.observations,
      report:         analysisData.report,
      pdf_b64,
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
