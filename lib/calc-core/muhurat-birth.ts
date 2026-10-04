// ============================================================
// File: lib/calc-core/muhurat-birth.ts
// Version: v1.0 — 4 Oct 2026 — MCP programme
//
// KYA HAI: /api/calc/muhurat (Child Birth Muhurat, FREE tier) ka dimaag —
// window ki jaanch, pehla 1 ghanta free scan, poori window ka scan sirf
// "aur behtar hai" batane ke liye, aur jawab ka aakaar. Route v1.5 se
// akshar-se-akshar.
//   * Scan (VM call) CALLER deta hai: website lib/muhurat-tiering ka
//     scanWindow, MCP apna. Scan fail ho to woh THROW karta hai — route ka
//     catch use waise hi sambhalta hai jaise v1.5 mein.
// ============================================================

import { FREE_WINDOW_MIN, normaliseWindow, publicSlot, qualityLabel } from './muhurat-rules';
import type { WindowInput } from './muhurat-rules';

export type MuhuratScan = (w: WindowInput, startMin: number, endMin: number) => Promise<any>;

export type BirthMuhuratOutcome =
  | { ok: false; status: number; error: string }
  | { ok: true; body: Record<string, unknown> };

/** Free tier. Scan ki galti (throw) caller tak jaati hai. */
export async function runChildBirthMuhurat(body: any, scan: MuhuratScan): Promise<BirthMuhuratOutcome> {
  const required = ['year', 'month', 'day', 'latitude', 'longitude'];
  for (const f of required) {
    if (body[f] === undefined || body[f] === null) {
      return { ok: false, status: 400, error: `Missing field: ${f}` };
    }
  }

  const w = normaliseWindow(body);
  if (!w) {
    return { ok: false, status: 400, error: 'Invalid date, time window or location.' };
  }

  const freeEnd = Math.min(w.startMin + FREE_WINDOW_MIN, w.endMin);
  const hasMore = w.endMin > freeEnd;

  const [freeData, fullData] = await Promise.all([
    scan(w, w.startMin, freeEnd),
    hasMore ? scan(w, w.startMin, w.endMin) : Promise.resolve(null),
  ]);

  const freeBest = freeData?.best_slot ?? null;
  const fullBest = fullData?.best_slot ?? null;
  const betterInWindow = !!(
    freeBest && fullBest &&
    fullBest.time !== freeBest.time &&
    Number(fullBest.score) > Number(freeBest.score)
  );

  return {
    ok: true,
    body: {
      best_slot:        publicSlot(freeBest),
      quality:          freeBest ? qualityLabel(freeData?.best_band, freeBest.score) : null,
      better_in_window: betterInWindow,
      saar:             freeData?.saar ?? null,
      free_window:      { start_min: w.startMin, end_min: freeEnd },
      full_window:      { start_min: w.startMin, end_min: w.endMin },
      disclaimer:       freeData?.disclaimer ?? null,
    },
  };
}
