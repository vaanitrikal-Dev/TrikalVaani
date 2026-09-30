// ============================================================
// File: app/api/calc/muhurat/route.ts
// Version: v1.4 — FREE/PAID SPLIT (30 Sep 2026)
// PICHHLA: v1.3 — storage AWAIT (21 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
// CHANGE v1.4 (Rohiit's ruling, 30 Sep 2026):
//   The lock is enforced HERE, on the server — the browser never receives
//   the paid data, so it cannot be read from DevTools.
//   * Doctor's window capped at 4 hours.
//   * Two VM scans in parallel: first 1 hour (free) and full window.
//   * Response carries ONLY the free best slot (no score), a quality label,
//     and a yes/no flag `better_in_window` for the "behtar slot mila" teaser.
//     top_slots and the full-window best slot are NOT sent any more.
//   Usage logging kept exactly as v1.3.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { logUsage, usageBirthFields, usageContextFromRequest } from '@/lib/usage-log';
import {
  FREE_WINDOW_MIN, normaliseWindow, scanWindow, publicSlot, qualityLabel,
} from '@/lib/muhurat-tiering';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ['year', 'month', 'day', 'latitude', 'longitude'];
    for (const f of required) {
      if (body[f] === undefined || body[f] === null) {
        return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 });
      }
    }
    const w = normaliseWindow(body);
    if (!w) {
      return NextResponse.json({ error: 'Invalid date, time window or location.' }, { status: 400 });
    }

    const freeEnd = Math.min(w.startMin + FREE_WINDOW_MIN, w.endMin);
    const hasMore = w.endMin > freeEnd;

    const [freeData, fullData] = await Promise.all([
      scanWindow(w, w.startMin, freeEnd),
      hasMore ? scanWindow(w, w.startMin, w.endMin) : Promise.resolve(null),
    ]);

    const freeBest = freeData?.best_slot ?? null;
    const fullBest = fullData?.best_slot ?? null;
    const betterInWindow = !!(
      freeBest && fullBest &&
      fullBest.time !== freeBest.time &&
      Number(fullBest.score) > Number(freeBest.score)
    );

    try {
      await logUsage({
        ...usageContextFromRequest(req),
        ...usageBirthFields(body as any),
        product_slug : 'calc-muhurat',
        product_name : 'Child Birth Muhurat Calculator',
        product_type : 'calculator',
        tier         : 'free',
      });
    } catch { /* logging must never break the calculator */ }

    return NextResponse.json({
      best_slot:        publicSlot(freeBest),
      quality:          freeBest ? qualityLabel(freeData?.best_band, freeBest.score) : null,
      better_in_window: betterInWindow,
      free_window:      { start_min: w.startMin, end_min: freeEnd },
      full_window:      { start_min: w.startMin, end_min: w.endMin },
      disclaimer:       freeData?.disclaimer ?? null,
    }, { status: 200 });
  } catch (e: any) {
    const isEngine = String(e?.message || '').startsWith('Muhurat engine error');
    const msg = e?.name === 'TimeoutError'
      ? 'Calculation timed out. Please try again.'
      : (isEngine ? 'Muhurat engine error' : (e?.message || 'Server error'));
    return NextResponse.json({ error: msg }, { status: isEngine ? 502 : 500 });
  }
}
