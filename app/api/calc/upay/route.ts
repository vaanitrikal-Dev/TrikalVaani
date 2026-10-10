/**
 * ============================================================
 * TRIKAL VAANI — Upay Calculator API (free + grah)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/calc/upay/route.ts   (NEW FILE)
 * VERSION: 1.0 (10 Oct 2026)
 * ============================================================
 * GET  → 27 samasya ki soochi (VM /granth/upay-samasya, 1 ghanta cache)
 * POST → { birth..., grah? }            FREE: 3 BPHS upay / grah ke 3 upay
 *        { slug, grah }                 PAID report ke andar: us grah ke SAARE upay
 *                                       (slug ki row 'ready' honi chahiye — paisa
 *                                        diya hua hai, isliye wahi kundali)
 * Saara ganit VM granth_api v4.2 upay_calculator() mein. Koi AI nahi.
 * ⚠️ PAID 10 upay yahan se KABHI nahi milte — wo sirf callback se (lib/upay-report).
 * ============================================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';
import { logUsage, usageBirthFields, usageContextFromRequest } from '@/lib/usage-log';
import { callUpayVM, cleanBirth, upayAdmin, vmBirth, type UpayBirth } from '@/lib/upay-report';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GRAH_RE = /^[A-Za-zऀ-ॿ ]{2,20}$/;
const SLUG_RE = /^upay-[a-z0-9-]{6,80}$/;

export async function GET() {
  try {
    const res = await callVM('/granth/upay-samasya', { signal: AbortSignal.timeout(20_000), cache: 'no-store' });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(data?.samasya)) throw new Error(`VM HTTP ${res.status}`);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (e) {
    console.error('[calc/upay] samasya list failed:', e);
    return NextResponse.json({ error: 'Samasya soochi abhi nahi mili — thodi der baad try karein.' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const grah = body?.grah ? String(body.grah).trim() : null;
  if (grah && !GRAH_RE.test(grah)) {
    return NextResponse.json({ error: 'Grah ka naam sahi nahi.' }, { status: 400 });
  }

  // ── PAID report ke andar grah ke saare upay ─────────────────────────────
  if (body?.slug) {
    const slug = String(body.slug);
    if (!SLUG_RE.test(slug) || !grah) {
      return NextResponse.json({ error: 'Galat request.' }, { status: 400 });
    }
    try {
      const { data: row } = await upayAdmin().from('upay_reports')
        .select('birth, status').eq('slug', slug).maybeSingle();
      if (!row || row.status !== 'ready') {
        return NextResponse.json({ error: 'Report nahi mili.' }, { status: 404 });
      }
      const data = await callUpayVM({ ...vmBirth(row.birth as UpayBirth), tier: 'paid', grah });
      return NextResponse.json({ ...data, paid: true });
    } catch (e) {
      console.error('[calc/upay] paid grah failed:', e);
      return NextResponse.json({ error: 'Abhi upay nahi mil paaye — thodi der baad try karein.' }, { status: 503 });
    }
  }

  // ── FREE ────────────────────────────────────────────────────────────────
  const b = cleanBirth(body);
  if (!b) {
    return NextResponse.json({ error: 'Janm ki tareekh, samay aur jagah poori bharein.' }, { status: 400 });
  }
  try {
    const data = await callUpayVM({ ...vmBirth(b), tier: 'free', ...(grah ? { grah } : {}) });
    await logUsage({
      ...usageContextFromRequest(req),
      ...usageBirthFields(b as any),
      product_slug: 'free-upay-calculator',
      product_name: 'Upay Calculator',
      product_type: 'calculator',
      tier: 'free',
      birth_city: b.city ?? undefined,
      result_meta: { mode: data?.mode, grah: grah ?? null, kamzor: data?.kamzor_grah ?? null },
    });
    return NextResponse.json({ ...data, paid: false });
  } catch (e) {
    console.error('[calc/upay] free failed:', e);
    return NextResponse.json({ error: 'Abhi upay nahi mil paaye — thodi der baad try karein.' }, { status: 503 });
  }
}
// END — app/api/calc/upay/route.ts v1.0
