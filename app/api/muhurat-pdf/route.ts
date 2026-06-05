/**
 * ============================================================
 * TRIKAL VAANI — Muhurat PDF Proxy API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/muhurat-pdf/route.ts
 * VERSION: 1.1
 * ============================================================
 * On-demand PDF generation for paid Child Birth Muhurat reports.
 *
 * CHANGE v1.1: VM call routes through lib/callVM.ts so X-Trikal-Key
 * is injected automatically. 60s timeout/abort preserved. Logic same.
 *
 * Flow:
 *   1. Receive { slug } from result page
 *   2. Verify muhurat_readings record exists (anti-tamper)
 *   3. Verify linked order is paid
 *   4. Verify narrative exists (PDF needs content)
 *   5. Call VM /muhurat-pdf with slug
 *   6. Return public Supabase Storage URL
 *
 * Mirrors app/api/milan-pdf/route.ts exactly.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { callVM } from '@/lib/callVM';

const VM_MUHURAT_PDF_ENDPOINT =
  process.env.VM_MUHURAT_PDF_ENDPOINT ?? 'http://34.47.182.227:8001/muhurat-pdf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PdfRequest {
  slug: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: PdfRequest = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }

    // ── Anti-tamper: verify the reading exists ──
    const { data: reading, error: loadErr } = await supabase
      .from('muhurat_readings')
      .select('slug, gemini_narrative, pdf_url, order_id')
      .eq('slug', slug)
      .single();

    if (loadErr || !reading) {
      console.error('[Trikal] PDF: Muhurat reading not found:', slug, loadErr?.message);
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    // ── Verify the linked order is paid ──
    if (reading.order_id) {
      const { data: order } = await supabase
        .from('muhurat_orders')
        .select('payment_verified, status')
        .eq('id', reading.order_id)
        .single();

      if (!order || !order.payment_verified || order.status !== 'paid') {
        return NextResponse.json(
          { error: 'PDF available only for paid reports.' },
          { status: 403 }
        );
      }
    }

    // ── Narrative must exist (PDF needs content) ──
    if (!reading.gemini_narrative || reading.gemini_narrative.length < 200) {
      return NextResponse.json(
        { error: 'Report still preparing. Please refresh in 30 seconds.' },
        { status: 425 } // Too Early
      );
    }

    // ── Idempotency: return cached pdf_url if present ──
    if (reading.pdf_url && reading.pdf_url.startsWith('https://')) {
      return NextResponse.json({
        success: true,
        slug,
        pdf_url: reading.pdf_url,
        cached:  true,
      });
    }

    // ── Call VM /muhurat-pdf ──
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s for PDF render

    let vmRes: Response;
    try {
      vmRes = await callVM(VM_MUHURAT_PDF_ENDPOINT, {
        method:  'POST',
        body:    JSON.stringify({ slug }),
        signal:  controller.signal,
      });
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] VM /muhurat-pdf fetch failed:', e);
      return NextResponse.json(
        { error: 'PDF engine unreachable. Please try again in a moment.' },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (!vmRes.ok) {
      const txt = await vmRes.text().catch(() => '');
      console.error('[Trikal] VM /muhurat-pdf error:', vmRes.status, txt);
      return NextResponse.json(
        { error: 'PDF generation failed. Please try again.' },
        { status: 502 }
      );
    }

    const vmData = await vmRes.json();

    return NextResponse.json({
      success:    true,
      slug,
      pdf_url:    vmData.pdf_url,
      size_bytes: vmData.size_bytes ?? 0,
      cached:     vmData.cached ?? false,
    });

  } catch (err: unknown) {
    console.error('[Trikal] /api/muhurat-pdf error:', err);
    return NextResponse.json(
      { error: 'Server error generating PDF.' },
      { status: 500 }
    );
  }
}
