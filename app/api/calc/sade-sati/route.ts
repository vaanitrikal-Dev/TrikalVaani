// ============================================================
// File: app/api/calc/sade-sati/route.ts
// Purpose: VM bridge for Sade Sati Calculator (FREE forever)
// Version: v1.8 — DIMAAG lib/calc-core/sade-sati.ts mein gaya (MCP programme) — 4 Oct 2026
//   * Is file mein sirf: field jaanch, usage log, sessionId, jawab. Output v1.7 se same.
// PICHHLA: v1.7 — granth-upay (BPHS 84) bina chhede aage; ratna lagnesh ka (1 Oct 2026)
// PICHHLA: v1.6 — storage AWAIT (21 Sep 2026)
// Changelog v1.4: Pass full VM remedies object to buildTemplateFromVMRemedies
//   so actionWindows (Dos) from remedy_master are included in response.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';
import { runSadeSati, sadesatiBirthError } from '@/lib/calc-core/sade-sati';
import type { CalcInput, VmCaller } from '@/lib/calc-core/sade-sati';
import { logUsage, usageBirthFields, usageContextFromRequest } from '@/lib/usage-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Website ka VM raasta — callVM (key apne aap judti hai). */
const vmViaCallVM: VmCaller = (path, body) =>
  callVM(path, { method: 'POST', body: JSON.stringify(body) });

export async function POST(req: NextRequest) {
  try {
    const body: CalcInput = await req.json();

    const missing = sadesatiBirthError(body);
    if (missing) {
      return NextResponse.json({ error: missing }, { status: 400 });
    }

    const out = await runSadeSati(body, vmViaCallVM);
    if (!out.ok) {
      return NextResponse.json({ error: out.error, detail: out.detail }, { status: out.status });
    }

    const sessionId = `calc_ss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      await logUsage({
        ...usageContextFromRequest(req),
        ...usageBirthFields(body as any),
        product_slug : 'calc-sade-sati',
        product_name : 'Sade Sati Calculator',
        product_type : 'calculator',
        tier         : 'free',
      });
    } catch { /* logging must never break the calculator */ }

    const { success, ...rest } = out.body;
    return NextResponse.json({ success, sessionId, ...rest }, { status: 200 });
  } catch (err: any) {
    console.error('[sade-sati] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
