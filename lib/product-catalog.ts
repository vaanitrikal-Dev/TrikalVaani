/**
 * ============================================================================
 * FILE   : lib/product-catalog.ts
 * VERSION: v2.0  (REPLACES v1.0 completely — v1.0 was a hardcoded list)
 * DATE   : 18 September 2026
 * ============================================================================
 *
 * WHY v2.0 EXISTS
 *   v1.0 held all 48 products as hand-typed lines. That meant every new
 *   calculator needed a manual edit here, or the picker would silently keep
 *   showing the old list. Rohiit is non-technical and ships calculators often,
 *   so that design was wrong.
 *
 * WHAT CHANGED
 *   The product LIST is gone from this file. It is now discovered at BUILD TIME
 *   by app/api/catalog/route.ts, which reads the actual folders in the repo.
 *   Create app/calculators/free-new-thing/ and it appears after the next
 *   deploy. Nothing in this file needs editing.
 *
 * WHAT THIS FILE STILL HOLDS — the three things a folder scan cannot guess:
 *   1. CATEGORIES      — the 9 buckets shown in the picker, and their order
 *   2. classifyBySlug  — rules that turn a slug into a category
 *   3. OVERRIDES       — a small escape hatch for the handful of products where
 *                        the rules guess wrong, or where a Hinglish search word
 *                        is needed ("bachcha" must find Santan Yog)
 *
 *   OVERRIDES is OPTIONAL. A product missing from it still works — it just uses
 *   its auto-derived category and keywords.
 *
 * NO PRICES anywhere in this system, on purpose (Rohiit, 18 Sep 2026). The
 *   picker sends the visitor to the page; the page owns the price. One source
 *   of truth, so a price here can never go stale.
 *
 * USED BY: app/api/catalog/route.ts (server) and components/TrikalPicker.tsx
 * ============================================================================
 */

export type ProductCategory =
  | 'career'
  | 'marriage'
  | 'children'
  | 'money'
  | 'dosha'
  | 'gemstone'
  | 'kundali'
  | 'muhurat'
  | 'other';

export interface CatalogProduct {
  href: string;
  name: string;
  category: ProductCategory;
  keywords: string;
}

export interface CategoryMeta {
  id: ProductCategory;
  label: string;
  emoji: string;
}

/** Order here is the order shown in the picker. */
export const CATEGORIES: CategoryMeta[] = [
  { id: 'career',   label: 'Career / Naukri',       emoji: '💼' },
  { id: 'marriage', label: 'Shaadi / Rishta',       emoji: '💍' },
  { id: 'children', label: 'Santan / Bachche',      emoji: '👶' },
  { id: 'money',    label: 'Paisa / Property',      emoji: '🏠' },
  { id: 'dosha',    label: 'Dosh / Shani',          emoji: '🪐' },
  { id: 'gemstone', label: 'Ratna / Gemstone',      emoji: '💎' },
  { id: 'kundali',  label: 'Kundali Basics',        emoji: '📜' },
  { id: 'muhurat',  label: 'Muhurat / Shubh Samay', emoji: '🕉️' },
  { id: 'other',    label: 'Aur Bhi',               emoji: '✨' },
];

/**
 * Slug → category. FIRST MATCHING RULE WINS, so the order matters:
 * gemstone is tested before kundali, otherwise "should-i-wear-neelam" would
 * never reach the gemstone rule.
 *
 * Anything matching no rule becomes 'other' and still shows in the picker under
 * "Aur Bhi". Nothing ever disappears just because a rule is missing.
 */
const CATEGORY_RULES: Array<[ProductCategory, RegExp]> = [
  ['gemstone', /should-i-wear|gemstone|ratna|neelam|pukhraj|manik|moti|moonga|panna|heera|gomed|lehsunia|cats-eye/],
  ['children', /santan|baby|child|progeny|aulad/],
  ['marriage', /shadi|vivah|milan|manglik|spouse|marriage|ex-back|compatibilit/],
  ['career',   /ias|upsc|career|job|naukri|toxic-boss|foreign-settlement|govt/],
  ['money',    /property|wealth|money|dhan|karz|lucky-day/],
  ['dosha',    /dosh|sade-sati|shani|weak-planet|kaal-sarp|pitra|pitru/],
  ['muhurat',  /muhurat|panchang|shubh/],
  ['kundali',  /kundali|kundli|rashi|lagna|nakshatra|dasha|graha|numerology|mulank|karmic/],
];

export function classifyBySlug(slug: string): ProductCategory {
  const s = slug.toLowerCase();
  for (const [cat, re] of CATEGORY_RULES) {
    if (re.test(s)) return cat;
  }
  return 'other';
}

/**
 * OPTIONAL per-product fixes, keyed by href.
 *
 * Add an entry ONLY when the automatic result is wrong, or when a Hinglish
 * search word is missing — a visitor typing "bachcha" should find Santan Yog,
 * but the slug contains no such word, so a folder scan can never learn it.
 *
 * `extraKeywords` is ADDED to the auto-derived words, it does not replace them.
 */
export const OVERRIDES: Record<
  string,
  { name?: string; category?: ProductCategory; extraKeywords?: string }
> = {
  '/calculators/free-santan-yog-calculator': {
    extraKeywords: 'bachcha aulad baccha pregnancy maa banna',
  },
  '/calculators/free-shadi-kab-hogi-calculator': {
    extraKeywords: 'rishta late marriage der se shadi vivah yog',
  },
  '/calculators/free-sade-sati-calculator': {
    extraKeywords: 'saturn dhaiya saade saati bura waqt pareshani',
  },
  '/calculators/free-ias-astrology-calculator': {
    extraKeywords: 'sarkari naukri government job exam civil services ips',
  },
  '/calculators/free-weak-planet-finder': {
    extraKeywords: 'kamzor grah nirbal planet shadbala',
  },
  '/calculators/free-foreign-settlement-calculator': {
    extraKeywords: 'videsh bahar jana abroad visa nri settle',
  },
  '/calculators/free-foreign-spouse-calculator': {
    extraKeywords: 'nri shadi videshi partner abroad marriage',
  },
  '/calculators/free-kundali-strength-calculator': {
    extraKeywords: 'majboot kitni strong kundli score',
  },
  '/hast-rekha-calculator': {
    name: 'Hast Rekha Reading',
    category: 'other',
    extraKeywords: 'palm haath hatheli line palmistry hast rekha',
  },
  '/swapna': {
    name: 'Swapna Shastra',
    category: 'other',
    extraKeywords: 'sapna sapne dream matlab meaning',
  },
  '/kundali-milan': {
    name: 'Kundali Milan',
    category: 'marriage',
    extraKeywords: 'guna milan 36 guna matching rishta jodi',
  },
  '/rashifal': {
    name: 'Rashifal',
    category: 'other',
    extraKeywords: 'horoscope daily aaj ka rashifal prediction',
  },
  '/services/toxic-boss-radar': {
    extraKeywords: 'boss office workplace manager pareshan',
  },
  '/services/ex-back-reading': {
    extraKeywords: 'breakup love wapas patch up reunion',
  },
  '/services/property-yog': {
    extraKeywords: 'ghar makan zameen flat home property',
  },
  '/services/wealth-reading': {
    extraKeywords: 'paisa dhan income loan karz finance',
  },
  '/services/child-destiny': {
    extraKeywords: 'bachche ka bhavishya padhai education talent',
  },
  '/services/spiritual-purpose': {
    extraKeywords: 'moksha dharma jeevan uddeshya spiritual',
  },
  '/services/career-pivot': {
    extraKeywords: 'job change switch promotion growth naukri badalna',
  },
};

/**
 * Turn a slug + title into searchable words.
 * Crude on purpose — OVERRIDES is where the good Hinglish words come from.
 */
export function deriveKeywords(slug: string, name: string): string {
  const fromSlug = slug.replace(/^free-/, '').replace(/-/g, ' ');
  const fromName = name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  return `${fromSlug} ${fromName}`.replace(/\s+/g, ' ').trim();
}

/** Products in one category, in the order the scan returned them. */
export function productsByCategory(
  products: CatalogProduct[],
  cat: ProductCategory,
): CatalogProduct[] {
  return products.filter((p) => p.category === cat);
}

/**
 * Keyword search. A hit in the product NAME scores above a hit in keywords, so
 * the obvious answer comes first.
 */
export function searchProducts(
  products: CatalogProduct[],
  query: string,
  limit = 8,
): CatalogProduct[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const words = q.split(/\s+/).filter(Boolean);

  return products
    .map((p) => {
      const name = p.name.toLowerCase();
      const keys = p.keywords.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (name.includes(w)) score += 3;
        else if (keys.includes(w)) score += 1;
      }
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}
