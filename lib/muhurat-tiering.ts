// ============================================================
// File: lib/muhurat-tiering.ts
// Version: v1.0 (30 Sep 2026) — NEW
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

const VM_URL = process.env.VM_ENGINE_URL || 'http://34.47.182.227:8001';

export const MAX_WINDOW_MIN  = 240; // paid: up to 4 hours
export const FREE_WINDOW_MIN = 60;  // free: first 1 hour

export type QualityLabel = 'Anukool' | 'Madhyam' | 'Saadharan';

export interface WindowInput {
  year: number; month: number; day: number;
  startMin: number; // minutes from local midnight
  endMin: number;
  latitude: number; longitude: number; timezone: number;
}

/** "9:30 AM" / "2:35 PM" / "14:35" -> { hour, minute } in 24h. */
export function parseTimeTo24h(t: string): { hour: number; minute: number } {
  const s = String(t ?? '').trim();
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return { hour: NaN, minute: NaN };
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && hour < 12) hour += 12;
  if (ap === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

/**
 * VM band text -> customer label. The VM's own cut-offs decide the band
 * ("Less Favourable", "Moderate", ...). Score is only a fallback when the
 * band text is missing. ASSUMPTION: VM band words — verify on first test.
 */
export function qualityLabel(band?: string, score?: number): QualityLabel {
  const b = String(band ?? '').toLowerCase();
  if (b) {
    if (/less|avoid|poor|inauspicious|weak|bad|unfavourable|unfavorable/.test(b)) return 'Saadharan';
    if (/moderate|average|mixed|medium/.test(b)) return 'Madhyam';
    return 'Anukool';
  }
  const s = Number(score);
  if (!Number.isFinite(s)) return 'Madhyam';
  if (s >= 60) return 'Anukool';
  if (s >= 45) return 'Madhyam';
  return 'Saadharan';
}

/** Validate + clamp the doctor's window. Returns null if unusable. */
export function normaliseWindow(b: any): WindowInput | null {
  const year = Number(b?.year), month = Number(b?.month), day = Number(b?.day);
  const sh = Number(b?.window_start_hour), sm = Number(b?.window_start_minute ?? 0);
  const eh = Number(b?.window_end_hour),   em = Number(b?.window_end_minute ?? 0);
  const latitude  = Number(b?.latitude  ?? b?.lat);
  const longitude = Number(b?.longitude ?? b?.lng);
  const timezone  = Number(b?.timezone ?? 5.5);
  if (![year, month, day, sh, sm, eh, em, latitude, longitude, timezone].every(Number.isFinite)) return null;
  if (year < 2024 || year > 2030 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const startMin = sh * 60 + sm;
  let endMin = eh * 60 + em;
  if (startMin < 0 || endMin > 23 * 60 + 59 || endMin <= startMin) return null;
  if (endMin - startMin > MAX_WINDOW_MIN) endMin = startMin + MAX_WINDOW_MIN;
  return { year, month, day, startMin, endMin, latitude, longitude, timezone };
}

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

/** Strip anything the customer should not see (score numbers). */
export function publicSlot(s: any) {
  if (!s) return null;
  const { score, ...rest } = s;
  return rest;
}

/**
 * Up to 3 real backups: not the best slot, and not a repeat of the same
 * Lagna + Nakshatra (the old list showed 9:30/9:40/9:50 of one slot).
 */
export function pickBackups(best: any, topSlots: any[], max = 3): any[] {
  const seen = new Set<string>([`${best?.lagna_sign}|${best?.lagna_nakshatra}`]);
  const out: any[] = [];
  for (const s of topSlots ?? []) {
    if (!s || s.time === best?.time) continue;
    const key = `${s.lagna_sign}|${s.lagna_nakshatra}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      time: s.time, lagna_sign: s.lagna_sign, lagna_nakshatra: s.lagna_nakshatra,
      tithi: s.tithi, naamakshar: s.naamakshar, label: qualityLabel(undefined, s.score),
    });
    if (out.length >= max) break;
  }
  return out;
}
