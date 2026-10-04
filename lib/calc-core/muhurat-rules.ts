// ============================================================
// File: lib/calc-core/muhurat-rules.ts
// Version: v1.0 — 4 Oct 2026 — MCP programme
//
// KYA HAI: Child Birth Muhurat ke PURE niyam (Rohiit ka 30 Sep 2026 ka
// free/paid ruling) — window ki jaanch, quality label, public slot, backup
// slot. lib/muhurat-tiering.ts v1.0 se akshar-se-akshar uthaye gaye.
//   * lib/muhurat-tiering.ts inhe `export *` se wapas deta hai, isliye
//     paid routes (muhurat-paid, create-muhurat-order) ka koi import nahi badla.
//   * VM par MCP inhe seedha use karta hai (yahan callVM nahi hai).
// ============================================================

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
