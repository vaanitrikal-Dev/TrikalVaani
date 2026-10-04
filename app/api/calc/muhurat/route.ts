// ============================================================
// File: app/api/calc/muhurat/route.ts
// Version: v1.6 — DIMAAG lib/calc-core/muhurat-birth.ts mein gaya (MCP programme) — 4 Oct 2026
//   * Is file mein sirf: usage log, jawab, galti sambhalna. Output v1.5 se same.
// PICHHLA: v1.5 — GRANTH SAAR (1 Oct 2026)
// PICHHLA: v1.4 — FREE/PAID SPLIT (30 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
// CHANGE v1.5 (Rohiit, 1 Oct 2026 — "Add Granth and Summary (Saar) for same
//   way like we did to another calculators"):
//   * VM /muhurat-finder ab har scan ke best slot ka GRANTH SAAR deta hai
//     (Brihat Samhita / Muhurta Chintamani / BPHS, shlok ke saath). Yahan
//     sirf FREE scan ka saar aage jaata hai — wahi slot jo grahak dekhta hai.
//     Poore window wale scan ka saar kabhi nahi bheja jaata (leak nahi).
//   * Free saar mein bachche ka bhavishya NAHI aur "poora window doshit"
//     wali line NAHI — dono sirf paid mein (VM hi ye tay karta hai).
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
import { scanWindow } from '@/lib/muhurat-tiering';
import { runChildBirthMuhurat } from '@/lib/calc-core/muhurat-birth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const out = await runChildBirthMuhurat(body, scanWindow);
    if (!out.ok) {
      return NextResponse.json({ error: out.error }, { status: out.status });
    }

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

    return NextResponse.json(out.body, { status: 200 });
  } catch (e: any) {
    const isEngine = String(e?.message || '').startsWith('Muhurat engine error');
    const msg = e?.name === 'TimeoutError'
      ? 'Calculation timed out. Please try again.'
      : (isEngine ? 'Muhurat engine error' : (e?.message || 'Server error'));
    return NextResponse.json({ error: msg }, { status: isEngine ? 502 : 500 });
  }
}
