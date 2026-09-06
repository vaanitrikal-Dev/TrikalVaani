// ============================================================
// File: app/calculators/free-kundali-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY THIS FILE EXISTS
//   Unlike the other twelve calculator routes, this page.tsx is a SERVER
//   component, so it could and did export `metadata` itself. That worked, but
//   it left this one route different from every other one — and if the
//   metadata sat in both places, the next person to change the title would
//   update one and leave the other stale. The metadata was therefore moved out
//   of page.tsx into here on 05 Sep 2026, and page.tsx now carries a comment
//   telling future editors not to re-add it.
//
// Changelog:
//   v2.0 (2026-09-05) — Created. Title rewritten and switched to
//        title.absolute. The old title (in page.tsx) was 63 characters AND
//        carried "| Trikaal Vaani" manually, while app/layout.tsx sets
//        title.template = "%s | Trikaal Vaani" — so the rendered title was 79
//        characters ending in the brand twice, and Google cut it at roughly
//        58. The old description was 209 characters against a 140-155
//        standard. Both fixed here.
//
// WHY `absolute`
//   The site standard requires 50-58 characters INCLUDING the brand, so the
//   brand must sit inside the counted string. `absolute` bypasses the parent
//   template, making the field below exactly what Google renders.
//
// TITLE IN USE — Option 5, Bilingual/Hinglish
//   "Janm Kundali Online — Free Kundli Banaye | Trikaal Vaani"  (56 chars)
//
//   Radar E3 (05 Sep 2026) tracks four keywords in cluster calc-kundali —
//   "free kundali calculator online", "janam kundali banaye free",
//   "जन्म कुंडली कैलकुलेटर" and "कुंडली कैसे बनाएं ऑनलाइन". All four show an AI
//   Overview that recommends a tool, and we rank on none of them. The searcher
//   types "banaye", not "calculator", so the title leads with that word.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : janam kundali banaye free / free kundali calculator online
// AUDIENCE CONCERN: they want their actual birth chart, free, without an app
//                   or a signup — and most free charts omit the degrees
// PAGE OFFER      : lagna and its lord, Chandra and Surya rashi, nakshatra and
//                   pada, all nine planets WITH degrees, houses, and the
//                   running Mahadasha and Antardasha
//
// WHY THIS PAGE MATTERS MOST IN THE BATCH
//   GSC 3 months to 4 Sep 2026: 1,002 impressions, 9 clicks, CTR 0.90%,
//   average position 60.67 — the highest impressions of the thirteen thin
//   calculators. Google was already showing it; until 05 Sep 2026 the page had
//   no calculator on it at all, only a link to the homepage form.
//
// TWO THINGS THIS METADATA MUST NEVER DO
//   (1) Imply a chart can be built from a name. It cannot, and the page says
//       so — "नाम से जन्म कुंडली बनाना" is a live PASF entry that is answered
//       honestly rather than courted.
//   (2) Promise a long auto-generated report. The 40-page PDF that this niche
//       sells is template text, and the page explains why instead of making
//       one.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Janm Kundali Online — Free Kundli Banaye | Trikaal Vaani' },
  description:
    'Janm tithi, samay aur sthan se poori kundali — lagna, nau graha degree ke saath, baarah bhaav, nakshatra aur chal rahi dasha. Free, bina signup.',
  keywords: [
    'free kundali calculator online',
    'janam kundali banaye free',
    'janam kundali by date of birth and time',
    'free kundali by date of birth',
    'best free online kundali',
    'free kundli with degrees of planets',
    'kundli check online',
    'janam kundli kaise banaye',
    'जन्म कुंडली कैलकुलेटर',
    'कुंडली कैसे बनाएं ऑनलाइन',
    'फ्री जन्म कुंडली',
    'कुंडली कैसे देखे',
    'सही जन्म कुंडली',
    'free kundali for new born baby',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-kundali-calculator' },
  openGraph: {
    title: 'Janm Kundali Online — Free Kundli Banaye | Trikaal Vaani',
    description:
      'Poori janm kundali free — lagna, Chandra aur Surya rashi, nakshatra aur pada, nau graha degree ke saath, aur chal rahi dasha. Bina signup.',
    url: 'https://trikalvaani.com/calculators/free-kundali-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Janm Kundali Online — Free Kundli Banaye | Trikaal Vaani',
    description: 'Poori kundali degree ke saath — lagna, graha, bhaav aur dasha, free.',
  },
  robots: { index: true, follow: true },
};

export default function KundaliCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
