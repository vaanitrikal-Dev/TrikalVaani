// ============================================================
// File: lib/muhurat-tiering.ts
// Version: v1.1 (4 Oct 2026) — pure niyam lib/calc-core/muhurat-rules.ts mein gaye (MCP programme);
//   yahan `export *` se wapas milte hain — kisi caller ka import nahi badla.
//   Sirf scanWindow (VM call) yahan bacha.
// PICHHLA: v1.0 (30 Sep 2026) — NEW
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
// Child Birth Muhurat — free vs paid window rules (Rohiit's ruling, 30 Sep 2026):
//   * Doctor's window is at most 4 hours (form + server both enforce).
//   * FREE  = best slot inside the FIRST 1 hour of that window, one slot only.
//   * PAID  = best slot across the full window (up to 4 hours) + up to 3
//             backup slots, all INSIDE the doctor's window. Never outside it.
//   * No score numbers shown to the customer — only a quality label.
//   * If the paid best slot is weak, the report says so honestly and asks the
//     parents to check with the doctor for another safe time/date.
// Used by: app/api/calc/muhurat/route.ts, app/api/create-muhurat-order/route.ts
// ============================================================
import { callVM } from '@/lib/callVM';
import type { WindowInput } from './calc-core/muhurat-rules';

export * from './calc-core/muhurat-rules';

const VM_URL = process.env.VM_ENGINE_URL || 'http://34.47.182.227:8001';

/** One VM /muhurat-finder scan of [startMin, endMin]. Throws on engine failure. */
export async function scanWindow(w: WindowInput, startMin: number, endMin: number): Promise<any> {
  const res = await callVM(`${VM_URL}/muhurat-finder`, {
    method: 'POST',
    body: JSON.stringify({
      year: w.year, month: w.month, day: w.day,
      window_start_hour: Math.floor(startMin / 60), window_start_minute: startMin % 60,
      window_end_hour:   Math.floor(endMin / 60),   window_end_minute:   endMin % 60,
      latitude: w.latitude, longitude: w.longitude, timezone: w.timezone,
      step_minutes: 10,
      full_day: false,
    }),
    signal: AbortSignal.timeout(45000),
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Muhurat engine error ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}
