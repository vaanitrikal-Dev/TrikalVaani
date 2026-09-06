// ============================================================
// File: app/calculators/free-rashi-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.1 title was 83 characters AND carried "| Trikaal Vaani"
//        manually, while app/layout.tsx already sets
//        title.template = "%s | Trikaal Vaani" — so the rendered title ran to
//        99 characters with the brand twice, and Google cut it at roughly 58.
//        Description rewritten to the 140-155 standard.
//   v1.1 (2026-06-02) — brand spelling normalised.
//   v1.0 — metadata only.
//
// WHY THIS PAGE MATTERS
//   GSC 3 months to 4 Sep 2026: 783 impressions, 7 clicks, CTR 0.89%,
//   average position 20.89 — the second-highest impressions of the thirteen
//   thin calculators and one of the worst CTRs on the site. The head query
//   "rashi calculator" sat at position 62.4 for 89 impressions with ZERO
//   clicks. Impressions already exist; the title is what was failing.
//
// WHY `absolute`
//   The site standard requires 50-58 characters INCLUDING the brand, so the
//   brand must sit inside the counted string. `absolute` bypasses the parent
//   template, making the field below exactly what Google renders.
//
// TITLE IN USE — Option 1, Frictionless/Speed
//   "Rashi Calculator — Free Chandra Rashi | Trikaal Vaani"  (53 chars)
//   The first draft ran to 59 and was cut back — the 58 ceiling is hard.
//   Four alternates are in the chat handoff of 05 Sep 2026.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : rashi calculator by date of birth / राशि कैलकुलेटर
// AUDIENCE CONCERN: they want their real Moon sign and are getting different
//                   answers from different apps, or only know the name-letter
// PAGE OFFER      : free, no signup; Chandra Rashi from the actual Moon
//                   position with Swiss Ephemeris and Lahiri Ayanamsha, plus
//                   an honest account of why name-based rashi often misses
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Rashi Calculator — Free Chandra Rashi | Trikaal Vaani' },
  description:
    'Apni asli Chandra Rashi janm tithi aur samay se — Swiss Ephemeris aur Lahiri Ayanamsha par. Naam se nikli rashi kyun galat hoti hai, wo bhi saaf.',
  keywords: [
    'rashi calculator',
    'rashi calculator by date of birth',
    'chandra rashi calculator',
    'moon rashi by date of birth',
    'vedic rashi calculator',
    'meri rashi kya hai naam se',
    'naam se rashi kaise jane',
    'name rashi calculator',
    'find my rashi by date of birth free',
    'janam rashi by date of birth and time',
    'राशि कैलकुलेटर',
    'जन्म राशि कैलकुलेटर',
    'चंद्र राशि कैलकुलेटर',
    'जन्म राशि नाम अक्षर',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-rashi-calculator' },
  openGraph: {
    title: 'Rashi Calculator — Free Chandra Rashi | Trikaal Vaani',
    description:
      'Chandra Rashi janm tithi aur samay se, Swiss Ephemeris par. Rashi swami, tatva, nakshatra aur upay — sab free, bina signup.',
    url: 'https://trikalvaani.com/calculators/free-rashi-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rashi Calculator — Free Chandra Rashi | Trikaal Vaani',
    description: 'Apni asli Chandra Rashi janm tithi aur samay se — free.',
  },
  robots: { index: true, follow: true },
};

export default function RashiCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
