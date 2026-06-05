/**
 * ============================================================
 * TRIKAL VAANI — Milan PDF Proxy API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/milan-pdf/route.ts
 * VERSION: 1.1
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * On-demand PDF generation for Kundali Milan readings.
 *
 * CHANGE v1.1: VM call routes through lib/callVM.ts so X-Trikal-Key
 * is injected automatically. 60s timeout/abort preserved. Logic same.
 *
 * Flow:
 *   1. Receive { slug } from result page
 *   2. Verify Milan record exists in Supabase (anti-tamper)
 *   3. Verify payment was completed
 *   4. Verify narrative exists (PDF needs content)
 *   5. Call VM /milan-pdf with slug
 *   6. Return public Supabase Storage URL
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { callVM } from '@/lib/callVM';

const VM_MILAN_PDF_ENDPOINT =
  process.env.VM_MILAN_PDF_ENDPOINT ?? 'http://34.47.182.227:8001/milan-pdf';

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

    // ── Anti-tamper: verify the Milan record exists + is paid ──
    const { data: milan, error: loadErr } = await supabase
      .from('kundali_milan')
      .select('slug, gemini_narrative, pdf_url, order_id')
      .eq('slug', slug)
      .single();

    if (loadErr || !milan) {
      console.error('[Trikal] PDF: Milan not found:', slug, loadErr?.message);
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }

    // ── Verify the linked order is paid ────────────────────
    if (milan.order_id) {
      const { data: order } = await supabase
        .from('kundali_milan_orders')
        .select('payment_verified, status')
        .eq('id', milan.order_id)
        .single();

      if (!order || !order.payment_verified || order.status !== 'paid') {
        return NextResponse.json(
          { error: 'PDF available only for paid readings.' },
          { status: 403 }
        );
      }
    }

    // ── Narrative must exist (PDF needs content) ───────────
    if (!milan.gemini_narrative || milan.gemini_narrative.length < 200) {
      return NextResponse.json(
        { error: 'Reading still preparing. Please refresh in 30 seconds.' },
        { status: 425 }   // Too Early
      );
    }

    // ── Idempotency: return cached pdf_url if present ──────
    if (milan.pdf_url && milan.pdf_url.startsWith('https://')) {
      return NextResponse.json({
        success:  true,
        slug,
        pdf_url:  milan.pdf_url,
        cached:   true,
      });
    }

    // ── Call VM /milan-pdf ─────────────────────────────────
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s for PDF render

    let vmRes: Response;
    try {
      vmRes = await callVM(VM_MILAN_PDF_ENDPOINT, {
        method:  'POST',
        body:    JSON.stringify({ slug }),
        signal:  controller.signal,
      });
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] VM /milan-pdf fetch failed:', e);
      return NextResponse.json(
        { error: 'PDF engine unreachable. Please try again in a moment.' },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (!vmRes.ok) {
      const txt = await vmRes.text().catch(() => '');
      console.error('[Trikal] VM /milan-pdf error:', vmRes.status, txt);
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
    console.error('[Trikal] /api/milan-pdf error:', err);
    return NextResponse.json(
      { error: 'Server error generating PDF.' },
      { status: 500 }
    );
  }
}
