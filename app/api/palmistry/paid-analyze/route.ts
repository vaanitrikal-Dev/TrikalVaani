// TRIKAL VAANI - Palmistry Paid Analyze + Verify API - v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect
// Pattern matched to verify-milan-payment route (HMAC verify, callVM, AbortController).
// Flow: verify signature -> VM analyze -> VM PDF -> Supabase save -> return report+PDF

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { callVM } from '@/lib/callVM';

const VM_ANALYZE_ENDPOINT =
  process.env.VM_PALM_ANALYZE_ENDPOINT ?? 'http://34.47.182.227:8001/palmistry/analyze';
const VM_PDF_ENDPOINT =
  process.env.VM_PALM_PDF_ENDPOINT ?? 'http://34.47.182.227:8001/palmistry/generate-pdf';

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

    // ── 2. VM: Full Palm Analysis (30s timeout) ──────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    let analysisData: any = null;
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

      if (!vmRes.ok) {
        const txt = await vmRes.text().catch(() => '');
        console.error('[Trikal] Palm VM analyze error:', vmRes.status, txt);
        return NextResponse.json(
          { error: 'Analysis failed. Aapka payment safe hai — humse contact karein.' },
          { status: 502 }
        );
      }
      analysisData = await vmRes.json();
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] Palm VM fetch failed:', e);
      return NextResponse.json(
        { error: 'Analysis timeout. Aapka payment safe hai — humse contact karein.' },
        { status: 504 }
      );
    }

    if (!analysisData?.success) {
      return NextResponse.json(
        { error: 'Analysis incomplete. Payment safe — contact us.' },
        { status: 502 }
      );
    }

    // ── 3. VM: Generate PDF (non-blocking — report shows even if PDF fails) ──
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

    // ── 4. Save to Supabase ──────────────────────────────────────────────────
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
      // Non-fatal — report still returned to user
    }

    // ── 5. Return report + PDF ───────────────────────────────────────────────
    return NextResponse.json({
      success:      true,
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
