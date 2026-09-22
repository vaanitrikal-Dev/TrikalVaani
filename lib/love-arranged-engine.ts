/**
 * File:    lib/love-arranged-engine.ts
 * Version: v1.1 — 22 Sep 2026 — Love or Arranged Marriage Prediction
 *
 * ⭐ ADAPTER — APNI KOI GINTI NAHI. Score VM ke granth_api v3.8
 * love_jhukaav() se aata hai (EK jagah), taaki score-card aur saar kabhi
 * alag na aayein.
 *
 * ⚖️ GRANTH MEIN LOVE/ARRANGED KA NIYAM NAHI. 10 sanket JYOTISH PARAMPARA ke
 * hain — shuruaati ank. Asli shaadiyon par jaanch (work_log 70/71) ne purane
 * sanket sanyog jitne dikhaye, isliye nateeja "jhukaav" hai, daava nahi.
 * Shaadi-shuda log apna asli jawab dete hain (vivah_feedback) — ank asli data
 * se badlenge. POORA MUFT (Rohiit, 22 Sep 2026).
 * Seema (Rohiit, 22 Sep): <20 ARRANGED · 20-34 DONO KA MEL · 35+ LOVE (band VM se aata hai).
 * v1.1 — seema badli; UI meter love% = score (5-95).
 */
import { ScoreSheet, YogResult } from './yog-engine';

export interface LoveRule { section: string; label: string; points: number; max: number; reason: string; }
export interface Love {
  score: number;
  band: 'LOVE KI OR JHUKAAV' | 'DONO KA MEL' | 'ARRANGED KI OR JHUKAAV';
  rules: LoveRule[];
  sanket: string[];
}
export type LoveResult = YogResult & { bandLabel: string };

// Rang: love hara, mel/arranged sunehra — arranged "kamzor" nahi hai, isliye gulaabi nahi.
const BANDS = {
  'LOVE KI OR JHUKAAV':     { band: 'Strong',   hi: 'लव की ओर झुकाव',     label: 'Love ki or jhukaav' },
  'DONO KA MEL':            { band: 'Moderate', hi: 'दोनों का मेल',        label: 'Dono ka mel' },
  'ARRANGED KI OR JHUKAAV': { band: 'Moderate', hi: 'अरेंज्ड की ओर झुकाव', label: 'Arranged ki or jhukaav' },
} as const;

export function loveFromGranth(j: Love): LoveResult {
  const s = new ScoreSheet();
  for (const r of j.rules ?? []) s.add(r.section, r.label, r.points, r.max, r.reason);
  const base = s.finish();
  const b = BANDS[j.band] ?? BANDS['DONO KA MEL'];
  return {
    ...base,
    score: j.score,
    band: b.band,
    bandHi: b.hi,
    bandLabel: b.label,
    disclaimer:
      '⚖️ Ye sanket jyotish parampara ke hain, granth ke nahi — ise jhukaav samjhein, pakka bhavishya nahi. ' +
      'Vivah ka samay BPHS ki dasha se hai.',
  };
}
