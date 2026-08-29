/**
 * ============================================================
 * TRIKAL VAANI — International Pricing (Option A)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/pricing-intl.ts
 * VERSION: 1.4 (30 Aug 2026)
 *   v1.4 — Voice packs repriced $1 / $5 / $12 -> $1 / $4 / $7.
 *   v1.3 — Kundali Milan parent + both tiers ($12 / $15).
 *   v1.2 — Trikaal Voice packs priced at a flat $1 per question ($1 / $5 / $12).
 *   v1.1 — `yog` product added for the three yog calculators (Rs 51 / $7).
 *   v1.0 — initial ladder.
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * OPTION A (decided 29 Aug 2026):
 *   Indian visitors  -> charged in INR via Razorpay (existing flow, unchanged)
 *   Everyone else    -> charged in USD via PayPal
 *                       + an APPROXIMATE local figure shown for comfort only
 *
 * The approximate local figure NEVER affects what is charged. The charge is
 * always the USD amount below. PayPal / the customer's bank does the real
 * conversion at their own rate.
 *
 * SECURITY: this file is the single source of truth for amounts. Server
 * routes read from PRODUCTS and ignore any amount sent by the browser.
 * ============================================================
 */

// ── Product catalogue ────────────────────────────────────────
// inrPaise  : what Razorpay charges Indian customers (paise)
// usdCents  : what PayPal charges international customers (cents)
// label     : shown on the checkout / PayPal statement

export interface ProductPrice {
  key: string;
  label: string;
  inrPaise: number;
  usdCents: number;
}

export const PRODUCTS: Record<string, ProductPrice> = {
  // ── Trikaal Voice packs ──────────────────────────────────────────────────
  // $1 / $4 / $7 — Rohiit's revision on 30 Aug 2026. The 29 Aug pricing was a
  // flat $1 per question ($1 / $5 / $12); these tiers now carry a volume
  // discount, down to about $0.58 per question on the largest pack.
  //
  // The percentage lost to PayPal's fixed $0.30 fee looks bad on the $1 pack
  // (~44%), but the unit economics are not percentage-driven: delivery costs
  // about Rs 4 per question, so every tier still nets many times its cost.
  // Keeping a $1 entry point matters more — a foreign buyer who has never
  // heard of the brand will risk a dollar to find out.
  //
  // NOTE: the 12-question pack is now the same $7 as the Deep Reading. If that
  // starts pulling buyers away from the written report, this is the line to
  // revisit.
  voice: {
    key: 'voice',
    label: 'Trikaal Voice — 1 question',
    inrPaise: 1100, // Rs 11
    usdCents: 100,  // $1
  },
  voice_5q: {
    key: 'voice_5q',
    label: 'Trikaal Voice — Sapt Darshan, 5 questions',
    inrPaise: 5100,  // Rs 51
    usdCents: 400,   // $4
  },
  voice_12q: {
    key: 'voice_12q',
    label: 'Trikaal Voice — Trikaal Bhakt, 12 questions',
    inrPaise: 10100, // Rs 101
    usdCents: 700,   // $7
  },
  deep: {
    key: 'deep',
    label: 'Deep Reading — Vedic Astrology',
    inrPaise: 5100, // Rs 51
    usdCents: 700, // $7
  },
  hast_rekha: {
    key: 'hast_rekha',
    label: 'AI Hast Rekha Report — Samudrika Shastra',
    inrPaise: 5100,
    usdCents: 700,
  },
  swapna: {
    key: 'swapna',
    label: 'Swapna Shastra — Personal Dream Reading',
    inrPaise: 5100,
    usdCents: 700,
  },
  milan_basic: {
    key: 'milan_basic',
    label: 'Kundali Milan — Basic',
    inrPaise: 5100,
    usdCents: 700,
  },
  milan_deep: {
    key: 'milan_deep',
    label: 'Kundali Milan — Deep (Couple)',
    inrPaise: 10100, // Rs 101
    usdCents: 1200, // $12
  },
  // The parent version is the same depth at the same rupee price, written for
  // the family rather than the couple. Same dollar price for the same reason.
  milan_deep_parent: {
    key: 'milan_deep_parent',
    label: 'Kundali Milan — Deep (Parent)',
    inrPaise: 10100, // Rs 101
    usdCents: 1200,  // $12
  },
  milan_both: {
    key: 'milan_both',
    label: 'Kundali Milan — Both Versions (Couple + Parent)',
    inrPaise: 15100, // Rs 151
    usdCents: 1500,  // $15
  },
  muhurat_report: {
    key: 'muhurat_report',
    label: 'Full Muhurat Report',
    inrPaise: 10100,
    usdCents: 1200,
  },
  muhurat_remedies: {
    key: 'muhurat_remedies',
    label: 'Full Report + 10 Remedies',
    inrPaise: 15100, // Rs 151
    usdCents: 1500, // $15
  },
  yog: {
    key: 'yog',
    label: 'Yog Report — Trikaal Vaani',
    inrPaise: 5100, // Rs 51
    usdCents: 700,  // $7
  },
  karmic: {
    key: 'karmic',
    label: 'Karmic Background Reading',
    inrPaise: 25100, // Rs 251
    usdCents: 1900, // $19
  },
  consultation: {
    key: 'consultation',
    label: 'Personal Consultation with Rohiit Gupta',
    inrPaise: 0, // not sold in INR through the site yet
    usdCents: 4900, // $49
  },
};

export type ProductKey = keyof typeof PRODUCTS;

/** Server-side guard: returns the product or null. Never trust client amounts. */
export function getProduct(key: string | undefined | null): ProductPrice | null {
  if (!key) return null;
  return PRODUCTS[key] ?? null;
}

// ── Country routing ──────────────────────────────────────────

/** Only India pays in INR. Everyone else pays USD via PayPal. */
export function isIndia(countryCode: string | null | undefined): boolean {
  return (countryCode ?? '').toUpperCase() === 'IN';
}

// ── Approximate local display only ───────────────────────────
// DISPLAY ONLY. Never used to charge. Refresh these roughly every quarter —
// they only need to be close enough that the figure does not look wrong.
// Last reviewed: 29 Aug 2026.

interface LocalDisplay {
  code: string; // ISO currency
  symbol: string;
  perUsd: number; // units of local currency per 1 USD
}

const LOCAL_DISPLAY: Record<string, LocalDisplay> = {
  GB: { code: 'GBP', symbol: '£', perUsd: 0.79 },
  IE: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  DE: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  FR: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  ES: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  IT: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  NL: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  PT: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  BE: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  AT: { code: 'EUR', symbol: '€', perUsd: 0.92 },
  AE: { code: 'AED', symbol: 'AED ', perUsd: 3.67 },
  SA: { code: 'SAR', symbol: 'SAR ', perUsd: 3.75 },
  QA: { code: 'QAR', symbol: 'QAR ', perUsd: 3.64 },
  KW: { code: 'KWD', symbol: 'KWD ', perUsd: 0.31 },
  OM: { code: 'OMR', symbol: 'OMR ', perUsd: 0.38 },
  BH: { code: 'BHD', symbol: 'BHD ', perUsd: 0.38 },
  US: { code: 'USD', symbol: '$', perUsd: 1 },
  CA: { code: 'CAD', symbol: 'C$', perUsd: 1.37 },
  AU: { code: 'AUD', symbol: 'A$', perUsd: 1.52 },
  NZ: { code: 'NZD', symbol: 'NZ$', perUsd: 1.66 },
  SG: { code: 'SGD', symbol: 'S$', perUsd: 1.34 },
  MY: { code: 'MYR', symbol: 'RM', perUsd: 4.4 },
  TH: { code: 'THB', symbol: '฿', perUsd: 34 },
  ID: { code: 'IDR', symbol: 'Rp', perUsd: 16000 },
  PH: { code: 'PHP', symbol: '₱', perUsd: 57 },
  VN: { code: 'VND', symbol: '₫', perUsd: 25000 },
  HK: { code: 'HKD', symbol: 'HK$', perUsd: 7.8 },
  JP: { code: 'JPY', symbol: '¥', perUsd: 150 },
  ZA: { code: 'ZAR', symbol: 'R', perUsd: 18 },
  MU: { code: 'MUR', symbol: 'Rs ', perUsd: 46 },
  NP: { code: 'NPR', symbol: 'NPR ', perUsd: 139 },
  LK: { code: 'LKR', symbol: 'LKR ', perUsd: 300 },
};

/**
 * Returns something like "≈ £5.50" for display next to the USD price,
 * or null when we have no rate for that country (then just show USD alone).
 */
export function approxLocal(
  usdCents: number,
  countryCode: string | null | undefined
): string | null {
  const cc = (countryCode ?? '').toUpperCase();
  const entry = LOCAL_DISPLAY[cc];
  if (!entry || entry.code === 'USD') return null;

  const value = (usdCents / 100) * entry.perUsd;
  // No decimals for currencies where fractions look odd at this price point.
  const noDecimals = ['JPY', 'IDR', 'VND', 'LKR', 'NPR', 'PHP', 'THB'];
  const rounded = noDecimals.includes(entry.code)
    ? Math.round(value).toLocaleString('en-US')
    : value.toFixed(2);

  return `≈ ${entry.symbol}${rounded}`;
}

/** "$7" from 700. */
export function formatUsd(usdCents: number): string {
  const v = usdCents / 100;
  return Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`;
}

/** "₹51" from 5100. */
export function formatInr(inrPaise: number): string {
  return `₹${Math.round(inrPaise / 100)}`;
}
