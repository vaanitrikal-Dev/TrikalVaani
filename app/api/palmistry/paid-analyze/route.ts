// app/api/palmistry/paid-analyze/route.ts
// Verifies payment → VM analyze → VM PDF → Supabase save → return report+PDF
import { NextRequest, NextResponse } from 'next/server';
import { createHmac }    from 'crypto';
import { callVM }        from '@/lib/callVM';
import { createClient }  from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      right_palm_b64,
      left_palm_b64,
      user_name,
      gender,
      language,
      dob,
    } = await req.json();

    // ── 1. Verify Razorpay Signature ────────────────────────────────────────
    const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // ── 2. VM: Full Palm Analysis ────────────────────────────────────────────
    const analyzeRes = await callVM('/palmistry/analyze', {
      method: 'POST',
      body: JSON.stringify({
        right_palm_b64,
        left_palm_b64: left_palm_b64 || null,
        user_name,
        gender,
        language,
        dob: dob || '',
      }),
      cache: 'no-store',
    });

    if (!analyzeRes.ok) {
      const err = await analyzeRes.text();
      return NextResponse.json({ error: `Analysis failed: ${err}` }, { status: 500 });
    }

    const analysisData = await analyzeRes.json();

    // ── 3. VM: Generate PDF ──────────────────────────────────────────────────
    const pdfRes = await callVM('/palmistry/generate-pdf', {
      method: 'POST',
      body: JSON.stringify({
        report:      analysisData.report,
        scores:      analysisData.scores,
        mp_features: analysisData.mp_features,
        observations: analysisData.observations,
        user_name,
        gender,
        language,
        order_id: razorpay_order_id,
      }),
      cache: 'no-store',
    });

    let pdf_b64 = null;
    if (pdfRes.ok) {
      const pdfData = await pdfRes.json();
      pdf_b64 = pdfData.pdf_b64;
    }

    // ── 4. Save to Supabase ──────────────────────────────────────────────────
    const session_id = `palm_${Date.now()}`;
    await supabase.from('palmistry_reports').insert({
      session_id,
      user_name:    user_name || null,
      gender,
      language,
      mp_features:  analysisData.mp_features,
      gemini_data:  analysisData.gemini_data,
      scores:       analysisData.scores,
      observations: analysisData.observations,
      report:       analysisData.report,
      tier:         'paid',
      payment_id:   razorpay_payment_id,
    });

    // ── 5. Return ────────────────────────────────────────────────────────────
    return NextResponse.json({
      success:      true,
      session_id,
      mp_features:  analysisData.mp_features,
      gemini_data:  analysisData.gemini_data,
      scores:       analysisData.scores,
      observations: analysisData.observations,
      report:       analysisData.report,
      pdf_b64,
    });

  } catch (err: any) {
    console.error('[Palmistry PaidAnalyze]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
