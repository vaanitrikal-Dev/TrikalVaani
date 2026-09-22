/**
 * File:    lib/health-engine.ts
 * Version: v1.0 — 22 Sep 2026 — Health Prediction (Jeevan-shakti)
 *
 * ⭐ YE ADAPTER HAI — ISKI APNI KOI GINTI NAHI.
 * Jeevan-shakti VM par EK jagah ginti hoti hai: granth_api v3.3 jeevan_shakti()
 * (lagna 25 · lagna-swami 20 · Surya 15 · Chandra 15 · 6va swami 10 · 8va
 * swami 10 · lagna par shubh drishti 5). Agar yahan TypeScript mein alag se
 * ginte, to score-card aur granth ka faisla kabhi alag aa sakte the.
 *
 * Band (Rohiit, 22 Sep 2026): 0-40 DHYAN RAKHEIN · 41-69 MADHYAM · 70+ PRABAL.
 * `band` purane rang ke liye ('Strong' hara, 'Moderate' sunehra, 'Weak' halka
 * gulaabi) — par UI mein `bandLabel` dikhta hai: "Weak" shabd kabhi nahi.
 *
 * 📖 6va/8va swami 6/8/12 mein = Harsha/Sarala (Phaladipika 6, Santhanam BPHS
 * Ch.48 tika) — ACHHA. Areas to watch: BPHS 4.4 kalapurusha. Prakriti: BPHS 4.5.
 */
import { ScoreSheet, YogResult } from './yog-engine';

export interface JeevanRule {
  section: string; label: string; points: number; max: number; reason: string;
}
export interface Jeevan {
  score: number;
  band: 'PRABAL' | 'MADHYAM' | 'DHYAN RAKHEIN';
  rules: JeevanRule[];
  areas: number[];
  prakriti: string;
}
export type HealthResult = YogResult & { bandLabel: string };

const BANDS = {
  PRABAL:          { band: 'Strong',   hi: 'प्रबल',      label: 'Prabal' },
  MADHYAM:         { band: 'Moderate', hi: 'मध्यम',      label: 'Madhyam' },
  'DHYAN RAKHEIN': { band: 'Weak',     hi: 'ध्यान रखें', label: 'Dhyan Rakhein' },
} as const;

export function healthFromGranth(j: Jeevan): HealthResult {
  const s = new ScoreSheet();
  for (const r of j.rules ?? []) s.add(r.section, r.label, r.points, r.max, r.reason);
  const base = s.finish();
  const b = BANDS[j.band] ?? BANDS.MADHYAM;
  return {
    ...base,
    score: j.score,
    band: b.band,
    bandHi: b.hi,
    bandLabel: b.label,
    disclaimer:
      'Pehli prathmikta doctor ki jaanch — ye granth (BPHS, Phaladipika) ki baat hai, medical diagnosis nahi. ' +
      'Kisi bhi takleef mein doctor se milein.',
  };
}
