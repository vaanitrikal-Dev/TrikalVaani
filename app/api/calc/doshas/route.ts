// ============================================================
// File: app/api/calc/doshas/route.ts
// Purpose: VM bridge for Dosha Calculators (Kaal Sarp, Pitra, etc.)
// Version: v1.4 — DIMAAG lib/calc-core/doshas.ts mein gaya (MCP programme) — 4 Oct 2026
//   * Is file mein sirf: field jaanch, usage log, sessionId, jawab. Output v1.3 se same.
// PICHHLA: v1.3 — storage AWAIT (21 Sep 2026)
// PICHHLA: v1.2 — usage logging added (18 Sep 2026)
// Changelog v1.1: check_all_doshas returns a DICT
//   { doshas:[...], present_count, summary, lang } — not a bare list.
//   Unwrap the inner `doshas` array robustly (handles list OR dict)
//   and also surface summary + present_count.
// Calls VM POST /doshas (additive endpoint) → returns doshas list
//   + rahu/ketu houses + lagna for the dosha pages.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';
import { runDoshas, doshasBirthError } from '@/lib/calc-core/doshas';
import type { CalcInput, VmCaller } from '@/lib/calc-core/doshas';
import { logUsage, usageBirthFields, usageContextFromRequest } from '@/lib/usage-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Website ka VM raasta — callVM (key apne aap judti hai). */
const vmViaCallVM: VmCaller = (path, body) =>
  callVM(path, { method: 'POST', body: JSON.stringify(body) });

export async function POST(req: NextRequest) {
  try {
    const body: CalcInput = await req.json();

    const missing = doshasBirthError(body);
    if (missing) {
      return NextResponse.json({ error: missing }, { status: 400 });
    }

    const out = await runDoshas(body, vmViaCallVM);
    if (!out.ok) {
      return NextResponse.json({ error: out.error, detail: out.detail }, { status: out.status });
    }

    const sessionId = `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      await logUsage({
        ...usageContextFromRequest(req),
        ...usageBirthFields(body as any),
        product_slug : 'calc-doshas',
        product_name : 'Dosha Calculator',
        product_type : 'calculator',
        tier         : 'free',
      });
    } catch { /* logging must never break the calculator */ }

    const { success, ...rest } = out.body;
    return NextResponse.json({ success, sessionId, ...rest }, { status: 200 });
  } catch (err: any) {
    console.error('[doshas] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
