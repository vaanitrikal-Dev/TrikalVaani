// ============================================================
// File: app/calculators/free-lagna-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.1 title carried "| Trikaal Vaani" manually while
//        app/layout.tsx already sets title.template = "%s | Trikaal Vaani",
//        so the rendered title ended in the brand twice and ran past the ~58
//        characters Google shows. Description rewritten to the 140-155
//        standard.
//   v1.1 (2026-06-02) — brand spelling normalised.
//   v1.0 — metadata only.
//
// TITLE IN USE — Option 5, Bilingual/Hinglish
//   "Mera Lagna Kya Hai — Free Lagna Calculator | Trikaal Vaani"  (58 chars)
//
//   Why the Hinglish question: Radar E3 (05 Sep 2026) tracks six keywords in
//   cluster calc-lagna and ALL SIX have an AI Overview that recommends a tool,
//   while we rank on only one. Two of the six are "mera lagna kya hai" and
//   "लग्न कैसे पता करें" — the searcher is asking a question, not looking for a
//   product name. Leading with the question also keeps this title clearly
//   apart from the sibling page's ("Lagna Bal Calculator — Free Instant
//   Check"), which matters because both sit in the same cluster.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : mera lagna kya hai / lagna calculator by date of birth
// AUDIENCE CONCERN: they know their rashi but not their lagna, and most sites
//                   give the name and stop there
// PAGE OFFER      : free, no signup; the lagna plus its lord, element,
//                   modality, and — the part almost nobody gives — which
//                   planets are yogakaraka and which are marak or badhak FOR
//                   THAT LAGNA, with all twelve ascendants covered in depth
//
// A CORRECTION KEPT ON RECORD
//   The 05 Sep Radar report showed "lagna bal calculator" at rank 5 and the E5
//   brief attached it to THIS page. That was wrong — that keyword belongs to
//   free-lagna-bal-calculator. GSC shows this page at position 35.45 with 200
//   impressions and 1 click. Do not plan off that report line.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Mera Lagna Kya Hai — Free Lagna Calculator | Trikaal Vaani' },
  description:
    'Apna lagna janm tithi, samay aur sthan se — uske swami, tatva aur us lagna ke liye kaunse graha shubh hain, kaunse marak. Free, bina signup.',
  keywords: [
    'mera lagna kya hai',
    'lagna calculator',
    'lagna calculator by date of birth',
    'ascendant calculator vedic astrology free',
    'lagna rashi finder',
    'lagna rashi chart',
    '12 ascendant in astrology',
    'how to find ascendant sign in kundli',
    'ascendant meaning in astrology',
    'लग्न कैलकुलेटर',
    'लग्न कैसे पता करें',
    'लग्न का अर्थ',
    'लग्न देखने की विधि',
    'yogakaraka planet by lagna',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-lagna-calculator' },
  openGraph: {
    title: 'Mera Lagna Kya Hai — Free Lagna Calculator | Trikaal Vaani',
    description:
      'Lagna, uska swami, tatva aur prakriti — aur us lagna ke liye kaunse graha shubh hain, kaunse marak. Baarah lagna vistaar se, bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-lagna-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mera Lagna Kya Hai — Free Lagna Calculator | Trikaal Vaani',
    description: 'Apna lagna aur uske liye shubh graha — free, bina signup.',
  },
  robots: { index: true, follow: true },
};

export default function LagnaCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
