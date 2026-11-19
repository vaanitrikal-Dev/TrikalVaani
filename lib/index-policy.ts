// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// File:    lib/index-policy.ts   (NEW FILE)
// Version: v1.1 (19 Nov 2026) — after Google rejected the 12 Nov reconsideration
//          (approved by Rohiit 19 Nov 2026: "I agree do"). Adds three families:
//          /compatibility + /hi/compatibility (288 rashi-pair pages), /learn (134 pages
//          + the /learn hub) and festival pages outside the next 92 days.
// Previous: v1.0 (11 Nov 2026) — approved by Rohiit 11 Nov 2026
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

// ── v1.1 (19 Nov 2026) ──────────────────────────────────────────────────────
//   /compatibility/<pair>, /hi/compatibility/<pair>  288 pages from ONE template
//   /learn/<slug> + /learn hub                       134 AI-drafted pages, none with
//                                                    a recorded review by Rohiit
//   /events/<f>, /hi/<f>                             only festivals dated today..+92 days
// Pages stay LIVE for visitors (noindex, follow). Nothing is deleted.

export const COMPATIBILITY_INDEXABLE = false;

/** /learn pages rewritten + approved by Rohiit — the only /learn/<slug> pages indexed. */
export const LEARN_INDEX_KEEP: ReadonlySet<string> = new Set<string>([]);
export const isLearnIndexable = (slug: string) => LEARN_INDEX_KEEP.has(slug);
/** The /learn hub lists every /learn page, so it is indexed only once a page is reopened. */
export const LEARN_HUB_INDEXABLE = LEARN_INDEX_KEEP.size > 0;

/** Festival pages are indexed only from today up to this many days ahead. */
export const FESTIVAL_INDEX_DAYS = 92;
export function isFestivalInIndexWindow(date: string | null | undefined): boolean {
  if (!date) return false;
  const d = String(date).slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.now() + FESTIVAL_INDEX_DAYS * 86400000).toISOString().slice(0, 10);
  return d >= today && d <= end;
}

// END — lib/index-policy.ts v1.1 | Trikaal Vaani | Rohiit Gupta
