// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// File:    lib/index-policy.ts   (NEW FILE)
// Version: v1.0 (11 Nov 2026) — approved by Rohiit 11 Nov 2026
// Owner:   Rohiit Gupta, Chief Vedic Architect
//
// WHY: Google "thin content" manual action (6 Nov 2026, affects all pages).
// An audit of the live sitemap on 11 Nov 2026 found these page families to be
// short, template-built pages (the "cookie-cutter" pattern). They stay LIVE for
// visitors, but carry robots "noindex, follow" and are left out of the sitemap
// until each one is rewritten and reviewed by Rohiit.
//
//   /swapna/<symbol>            ~430 words, 40–56% shared template text
//   /swapna/category/<c>        ~275 words
//   /panchang/<date>(/<slug>)   ~225 words, data only
//   /<city> and /<city>/panchang  200–750 words, 40–57% shared text
//   /vivah-muhurat/<year>       only this year and next year stay indexable
//   /events/<festival-year>     no published English content row → not indexable
//
// ONE PLACE TO REOPEN: flip a flag to true (or add a symbol to
// SWAPNA_INDEX_KEEP) and the page pages + app/sitemap.ts follow.
// USED BY: app/sitemap.ts v10.2 and the page files of the families above.
// ════════════════════════════════════════════════════════════════════════════

export const NOINDEX_FOLLOW = {
  index: false, follow: true,
  googleBot: { index: false, follow: true },
} as const;

/** Dream symbols rewritten + approved by Rohiit — the only /swapna/<symbol> pages indexed. */
export const SWAPNA_INDEX_KEEP: ReadonlySet<string> = new Set<string>([]);
export const isSwapnaSymbolIndexable = (symbolKey: string) => SWAPNA_INDEX_KEEP.has(symbolKey);

export const SWAPNA_CATEGORIES_INDEXABLE = false;
export const PANCHANG_DATES_INDEXABLE = false;
export const CITY_HUBS_INDEXABLE = false;

/** /vivah-muhurat/<year>: the current year and the next one. */
export function isVivahYearIndexable(year: number | string): boolean {
  const y = Number(year);
  const now = new Date().getFullYear();
  return Number.isFinite(y) && y >= now && y <= now + 1;
}

// END — lib/index-policy.ts v1.0 | Trikaal Vaani | Rohiit Gupta
