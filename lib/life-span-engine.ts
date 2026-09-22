/**
 * File:    lib/life-span-engine.ts
 * Version: v1.0 — 22 Sep 2026 — Life Span (Ayushya) Calculator
 *
 * ⭐ YE ADAPTER HAI — ISKI APNI KOI GINTI NAHI.
 * Band VM par EK jagah banta hai: granth_api v4.1 aayushya() —
 *   BPHS 43.33-40 teen jode (lagnesh+8vesh, Shani+Chandra, lagna+hora lagna),
 *   kakshya 43.47-50, yog 43.60-78, maraka Ch.44 (44.8 paap antardasha).
 * Rohiit ke niyam (work_log 75-82):
 *   * KOI SCORE / NUMBER NAHI — sirf band ka naam + saral bracket
 *   * saal / mrityu ki tareekh KABHI NAHI
 *   * 20 se kam = BAAL AVASTHA (BPHS 44.12-13) — band nahi
 *   * POORA MUFT
 * `score` sirf usage-log ke liye 0 rehta hai — UI mein kabhi nahi dikhta.
 */
import { ScoreSheet, YogResult } from './yog-engine';

export interface AayuJodi {
  naam: string; a: string; b: string;
  rashi_a?: string; rashi_b?: string; kism?: string; band: string | null;
}
export interface AayuDaur { md: string; ad: string; se: string; tak: string }
export interface Aayu {
  umar: number | null;
  bal: boolean;
  band: 'DEERGHAYU' | 'MADHYAYU' | 'ALPAYU' | 'BAAL AVASTHA';
  mool_band?: string;
  kaise?: string;
  nirnayak?: number[];
  jode: AayuJodi[];
  kakshya?: number;
  kakshya_wajah?: string[];
  adhik?: boolean;
  hora_lagna?: string | null;
  yog: { kism: string; srot: string }[];
  maraka: null | {
    grah: { grah: string; kyun: string[] }[];
    mukhya: string; mukhya_kyun: string;
    beeta: AayuDaur[]; abhi: AayuDaur[]; aage: AayuDaur[];
  };
  upay?: { grah: string; jaap: number; samidha: string; daan: string }[];
}
export type LifeSpanResult = YogResult & { bandLabel: string; bracket: string; aayu: Aayu };

// band purane rang ke liye (bandColor): Strong hara, Moderate sunehra, Weak halka
const BANDS = {
  DEERGHAYU:      { band: 'Strong',   hi: 'दीर्घायु', label: 'Deerghayu', bracket: 'lambi umar' },
  MADHYAYU:       { band: 'Moderate', hi: 'मध्यायु', label: 'Madhyayu',  bracket: 'ausat umar' },
  ALPAYU:         { band: 'Weak',     hi: 'अल्पायु', label: 'Alpayu',    bracket: 'sehat aur upay par zyada dhyan chahiye' },
  'BAAL AVASTHA': { band: 'Moderate', hi: 'बाल अवस्था', label: '20 se kam umar', bracket: 'granth 20 varsh se pehle aayu nahi batata' },
} as const;

export function lifeSpanFromGranth(a: Aayu): LifeSpanResult {
  const base = new ScoreSheet().finish();
  const b = BANDS[a.band] ?? BANDS.MADHYAYU;
  return {
    ...base,
    score: 0,
    band: b.band as YogResult['band'],
    bandHi: b.hi,
    bandLabel: b.label,
    bracket: b.bracket,
    aayu: a,
    rules: [], highlights: [], blockers: [],
    disclaimer:
      'Ye granth ka classical anumaan hai, nishchit bhavishya nahi — upay aur samay se badalta hai. ' +
      'Hum aayu ka saal ya mrityu ka samay kabhi nahi batate. Sehat ke liye doctor pehle.',
  };
}
