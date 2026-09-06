// ============================================================
// File: app/calculators/free-lagna-bal-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.0 title was 75 characters AND carried "| Trikaal Vaani"
//        manually, while app/layout.tsx already sets
//        title.template = "%s | Trikaal Vaani" — so the rendered title ran to
//        91 characters with the brand twice, and Google cut it at roughly 58.
//        Description rewritten to the 140-155 standard.
//   v1.0 — metadata only.
//
// WHY `absolute`
//   The site standard requires 50-58 characters INCLUDING the brand, so the
//   brand must sit inside the counted string. `absolute` bypasses the parent
//   template, making the field below exactly what Google renders.
//
// TITLE IN USE — Option 1, Frictionless/Speed
//   "Lagna Bal Calculator — Free Instant Check | Trikaal Vaani"  (57 chars)
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : lagna bal calculator / ascendant lord strength
// AUDIENCE CONCERN: they know their lagna but want to know whether it is
//                   strong enough — and what to do if it is not
// PAGE OFFER      : free, no signup; lagna lord, its house, its Shadbala as a
//                   ratio, first-house planets, and classical remedies
//
// WHY THIS PAGE IS WORTH THE FIX
//   GSC 3 months to 4 Sep 2026: 38 impressions, 7 clicks, CTR 18.42% — the
//   highest CTR of any calculator on the site — average position 19.11.
//   Radar E3, 05 Sep 2026: all six tracked keywords in cluster calc-lagna have
//   an AI Overview that recommends a tool, and we rank on exactly one of them
//   ("lagna bal calculator", position 5).
//
// KEYWORD SPLIT — deliberate, do not undo
//   The head "what is my lagna" terms belong to
//   /calculators/free-lagna-calculator (the finder). This page owns STRENGTH.
//   Keeping the two apart stops them competing for the same SERP.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Lagna Bal Calculator — Free Instant Check | Trikaal Vaani' },
  description:
    'Aapka lagna kitna mazboot hai — lagna swami kahan hai, uski Shadbala kya hai, pehle bhaav mein kaun hai. Free jaanch, bina signup, wajah ke saath.',
  keywords: [
    'lagna bal calculator',
    'ascendant lord calculator',
    'lagna lord strength',
    'ascendant strength calculator',
    'lagna chart calculator',
    'lagna rashi by date of birth',
    'how to calculate lagna manually',
    'lagna calculator without birth time',
    'indu lagna calculator',
    'tara lagna calculator',
    '12 ascendant in astrology',
    'लग्न कुंडली चार्ट',
    'लग्न देखने की विधि',
    'जन्म लग्न कैसे निकाले',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-lagna-bal-calculator' },
  openGraph: {
    title: 'Lagna Bal Calculator — Free Instant Check | Trikaal Vaani',
    description:
      'Lagna swami, uska bhaav, uski Shadbala aur pehle bhaav ke graha — lagna kitna mazboot hai, har point ki wajah ke saath. Bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-lagna-bal-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lagna Bal Calculator — Free Instant Check | Trikaal Vaani',
    description: 'Lagna swami ka bal Shadbala ratio ke saath — free.',
  },
  robots: { index: true, follow: true },
};

export default function LagnaBalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
