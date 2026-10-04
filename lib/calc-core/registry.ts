// ============================================================
// File: lib/calc-core/registry.ts
// Version: v1.0 — 4 Oct 2026 — CALCULATOR REGISTRY (MCP programme, Batch B0)
//
// KYA HAI: Trikaal Vaani ke har calculator ki EK entry. VM par chalne wala
// MCP server (mcp-server/) roz raat isi file ko padh kar AI ke liye tools
// apne aap banata hai. Naya calculator = yahan ek entry = MCP mein apne aap.
//
// ROHIIT KE NIYAM (4 Oct 2026):
//   * Har calculator apne aap MCP mein jaata hai — SIRF do bahar:
//     life-span aur health (mcp: false). Yeh do kabhi AI ko nahi jaate.
//   * MCP sirf MUFT nateeja deta hai; paid report site / payment link se.
//
// BATCH STATUS: B0 = 9 yog calculators (core: lib/calc-core/yog.ts).
// Baaki 28 calculator B1-B3 mein apne core ke saath yahan judenge.
// Jis calculator ka core abhi nahi bana, uski entry yahan NAHI hai —
// taaki MCP kabhi aisa tool na dikhaye jo chal hi na sake.
// ============================================================

import type { YogType } from './yog';

/** MCP mein kaun sa tool (10 groups, 4 Oct 2026 ka design). */
export type ToolGroup =
  | 'janam_kundali' | 'dosha_check' | 'planet_strength' | 'dasha_timeline'
  | 'yog_check' | 'gemstone_check' | 'kundali_milan' | 'muhurat_finder'
  | 'daily_panchang' | 'numerology_lucky';

export interface CalcEntry {
  /** Page slug — /calculators/<slug> */
  slug: string;
  /** Kaun se MCP tool ke andar */
  tool: ToolGroup;
  /** Core ke andar ka type (yog ke liye YogType) */
  coreType: YogType;
  /** Core file ka naam (lib/calc-core/<core>.ts) */
  core: 'yog';
  titleEn: string;
  titleHi: string;
  /** AI ko ek line — kab is calculator ko chunna hai */
  whenToUse: string;
  /** Birth details ke alawa kya chahiye */
  needsGender: boolean;
  /** false = kabhi MCP mein nahi (Rohiit: life-span, health) */
  mcp: boolean;
}

const SITE = 'https://trikalvaani.com/calculators/';

export const CALCULATORS: CalcEntry[] = [
  {
    slug: 'free-ias-astrology-calculator', tool: 'yog_check', core: 'yog', coreType: 'upsc',
    titleEn: 'IAS / UPSC / Government Job Yog', titleHi: 'Sarkari Naukri / IAS Yog',
    whenToUse: 'Government job, UPSC, IAS, IPS, civil services or competitive exam chances from the birth chart (10th house, Dasamsa D-10, Sun-Saturn strength).',
    needsGender: false, mcp: true,
  },
  {
    slug: 'free-foreign-settlement-calculator', tool: 'yog_check', core: 'yog', coreType: 'foreign-settlement',
    titleEn: 'Foreign Settlement (Videsh Yog)', titleHi: 'Videsh Yog',
    whenToUse: 'Going abroad, settling in a foreign country, NRI life, visa / PR chances (12th, 9th, 7th houses, Rahu).',
    needsGender: false, mcp: true,
  },
  {
    slug: 'free-foreign-spouse-calculator', tool: 'yog_check', core: 'yog', coreType: 'foreign-spouse',
    titleEn: 'Foreign Spouse / NRI Marriage Yog', titleHi: 'Videshi Jeevansathi Yog',
    whenToUse: 'Marrying a foreigner or NRI, spouse from another country or culture.',
    needsGender: true, mcp: true,
  },
  {
    slug: 'free-santan-yog-calculator', tool: 'yog_check', core: 'yog', coreType: 'santan',
    titleEn: 'Santan Yog (Children / Progeny)', titleHi: 'Santan Yog',
    whenToUse: 'Children, progeny, childbirth timing, 5th house and Saptamsa D-7 reading.',
    needsGender: false, mcp: true,
  },
  {
    slug: 'free-shadi-kab-hogi-calculator', tool: 'yog_check', core: 'yog', coreType: 'vivah',
    titleEn: 'Marriage Timing (Shadi Kab Hogi)', titleHi: 'Shadi Kab Hogi',
    whenToUse: 'When will I get married, marriage timing, delay in marriage (7th house, Venus/Jupiter, dasha windows).',
    needsGender: true, mcp: true,
  },
  {
    slug: 'free-second-marriage-calculator', tool: 'yog_check', core: 'yog', coreType: 'second-marriage',
    titleEn: 'Second Marriage Yog', titleHi: 'Doosra Vivah Yog',
    whenToUse: 'Second marriage, remarriage after divorce or loss (BPHS 18.19-21).',
    needsGender: false, mcp: true,
  },
  {
    slug: 'free-love-or-arranged-marriage-calculator', tool: 'yog_check', core: 'yog', coreType: 'love-arranged',
    titleEn: 'Love or Arranged Marriage', titleHi: 'Love ya Arranged Marriage',
    whenToUse: 'Whether the chart shows love marriage or arranged marriage (5th-7th house links).',
    needsGender: false, mcp: true,
  },
  // ── Rohiit ka niyam: yeh do KABHI MCP mein nahi ──────────────────────────
  {
    slug: 'free-health-prediction-calculator', tool: 'yog_check', core: 'yog', coreType: 'health-insight',
    titleEn: 'Health Insight', titleHi: 'Swasthya Sanket',
    whenToUse: 'Website only.', needsGender: false, mcp: false,
  },
  {
    slug: 'free-life-span-calculator', tool: 'yog_check', core: 'yog', coreType: 'life-span',
    titleEn: 'Life Span (Ayushya)', titleHi: 'Ayushya',
    whenToUse: 'Website only.', needsGender: false, mcp: false,
  },
];

/** MCP ke liye — sirf jo AI ko dikhne chahiye. */
export function mcpCalculators(): CalcEntry[] {
  return CALCULATORS.filter((c) => c.mcp);
}

export function pageUrl(c: CalcEntry): string {
  return SITE + c.slug;
}
