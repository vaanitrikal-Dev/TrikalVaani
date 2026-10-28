// ============================================================
// File: lib/hastrekha/vivah-kundali.ts
// Version: 1.0 (28 Oct 2026) — NAYA
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Hast Rekha ₹51 report ka "शादी कब होगी" hissa (Rohiit faisla 28 Oct 2026, Option A:
// "Yes give vivah-samay at 51 no problem"). Hastasanjeevanam mein vivah ke samay ka
// shlok nahi hai — isliye customer janm samay + sthaan de to wahi Kundali vivah engine
// (lib/calc-core/yog.ts runYog type 'vivah', paid) chalta hai jo
// /calculators/free-shadi-kab-hogi-calculator chalata hai. Nateeja VM palmistry engine
// v2.3 ko 'vivah_kundali' field mein jaata hai aur report + PDF mein judta hai.
//
// Kabhi throw nahi. Janm vivaran adhoora / VM band / 25s se zyaada → null, aur report
// purana "calculator link" wala text dikhati hai. Palm report kabhi is par nahi rukti.
// ============================================================

import { callVM } from '@/lib/callVM';
import { runYog, yogBirthError, type VmCaller, type YogBirth } from '@/lib/calc-core/yog';
import { VIVAH_DISCLAIMER } from '@/lib/vivah-engine';

export interface PalmBirth {
  tob: string;          // 'HH:MM' (24 ghante)
  place: string;
  lat: number;
  lon: number;
  tz: number;           // ghante, jaise 5.5
}

export interface VivahKundali {
  verdict: { key: string; label: string; labelHi: string; line: string };
  umar: { from: number; to: number; basis: string } | null;
  windows: { label: string; from: string; to: string; age: number | null; why: string }[];
  disclaimer: string;
}

const vm: VmCaller = (path, body) => callVM(path, { method: 'POST', body: JSON.stringify(body), cache: 'no-store' });

/** Browser se aaye fields ki jaanch → PalmBirth ya null (adhoora = null, galti nahi). */
export function cleanBirth(raw: any): PalmBirth | null {
  if (!raw || typeof raw !== 'object') return null;
  const tob = typeof raw.tob === 'string' ? raw.tob.trim() : '';
  const lat = Number(raw.lat), lon = Number(raw.lon), tz = Number(raw.tz);
  const place = typeof raw.place === 'string' ? raw.place.trim().slice(0, 120) : '';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(tob)) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(tz)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180 || Math.abs(tz) > 14) return null;
  return { tob, place, lat, lon, tz };
}

/** dob 'YYYY-MM-DD' + PalmBirth → Kundali vivah nateeja (paid), ya null. */
export async function vivahForPalm(
  dob: string | null | undefined,
  birth: PalmBirth | null,
  name: string | null | undefined,
  gender: string | null | undefined,
): Promise<VivahKundali | null> {
  try {
    if (!birth || typeof dob !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
    const [year, month, day] = dob.split('-').map(Number);
    const [hour, minute] = birth.tob.split(':').map(Number);
    const b: YogBirth = {
      year, month, day, hour, minute,
      latitude: birth.lat, longitude: birth.lon, timezone: birth.tz,
      name: name || null,
      gender: String(gender || 'M').toUpperCase().startsWith('F') ? 'female' : 'male',
    };
    if (yogBirthError(b)) return null;

    const out = await Promise.race([
      runYog({ type: 'vivah', birth: b, paid: true, vm }),
      new Promise<null>((r) => setTimeout(() => r(null), 25000)),
    ]);
    if (!out || !out.ok) {
      console.error('[Trikal] Palm vivah-kundali nahi bana:', out && !out.ok ? out.error : 'timeout');
      return null;
    }
    const res: any = (out.body as any)?.result;
    if (!res?.verdict?.label || !res?.verdict?.line) return null;
    return {
      verdict: {
        key: String(res.verdict.key ?? ''), label: String(res.verdict.label),
        labelHi: String(res.verdict.labelHi ?? res.verdict.label), line: String(res.verdict.line),
      },
      umar: res.umar && typeof res.umar.from === 'number' && typeof res.umar.to === 'number'
        ? { from: res.umar.from, to: res.umar.to, basis: String(res.umar.basis ?? '') } : null,
      windows: Array.isArray(res.windows)
        ? res.windows.slice(0, 3).map((w: any) => ({
            label: String(w?.label ?? ''), from: String(w?.from ?? ''), to: String(w?.to ?? ''),
            age: typeof w?.age === 'number' ? w.age : null, why: String(w?.why ?? ''),
          }))
        : [],
      disclaimer: VIVAH_DISCLAIMER,
    };
  } catch (e) {
    console.error('[Trikal] Palm vivah-kundali error:', e);
    return null;
  }
}
