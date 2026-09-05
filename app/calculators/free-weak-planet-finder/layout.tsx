// ============================================================
// File: app/calculators/free-weak-planet-finder/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Changelog:
//   v2.0 (2026-09-05) — Title rewritten and switched to title.absolute.
//        The v1.1 title was 76 characters AND carried "| Trikaal Vaani"
//        manually, while app/layout.tsx already sets
//        title.template = "%s | Trikaal Vaani". The rendered title was
//        therefore 92 characters ending in the brand twice, and Google cut it
//        at roughly 58 — the searcher never saw the brand or the word "free".
//        Description also rewritten to the 140-155 standard.
//   v1.1 (2026-06-02) — brand spelling normalised.
//   v1.0 — metadata only.
//
// WHY `absolute`
//   The site standard requires 50-58 characters INCLUDING the brand, so the
//   brand has to sit inside the counted string. `absolute` bypasses the parent
//   template, making the field below exactly what Google renders.
//
// TITLE IN USE — Option 1, Frictionless/Speed
//   "Weak Planet Finder — Free Shadbala Check | Trikaal Vaani"  (56 chars)
//   The four alternates are in the chat handoff of 05 Sep 2026. Swapping means
//   replacing the two strings below and nothing else.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : weak planet in kundli calculator / shadbala calculator
// AUDIENCE CONCERN: something keeps going wrong in one area of life and they
//                   want to know which planet is behind it
// PAGE OFFER      : free, no signup; full Shadbala for all seven planets as a
//                   ratio against each planet's own classical minimum, with
//                   the six-fold breakdown and classical remedies
//
// WHY THIS PAGE IS WORTH THE FIX
//   GSC 3 months to 4 Sep 2026: 104 impressions, 12 clicks, CTR 11.54%,
//   average position 13.57. One of the best CTRs on the site, earned in spite
//   of a truncated title. Radar E3, 05 Sep 2026: on three of the five tracked
//   keywords in cluster calc-graha-bal, Google's AI Overview is already
//   recommending a tool rather than answering — and we rank on none of them.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Weak Planet Finder — Free Shadbala Check | Trikaal Vaani' },
  description:
    'Kaunsa graha aapki kundali mein kamzor hai — saaton grahon ki Shadbala, minimum ke saamne ratio aur classical upay. Free jaanch, bina signup.',
  keywords: [
    'weak planet in kundli calculator',
    'shadbala calculator',
    'shadbala calculator online free',
    'free shadbala calculator',
    'graha bal calculator',
    'planet strength calculator',
    'planet with highest shadbala calculator',
    'shadbala of planets calculator',
    'shadbala score calculator',
    'shadbala chart',
    'sthana bala of planets',
    'vimsopaka bala calculator',
    'bhava bala calculator',
    'kamzor grah kaise pata kare',
    'कुंडली में कौन सा ग्रह कमजोर है',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-weak-planet-finder' },
  openGraph: {
    title: 'Weak Planet Finder — Free Shadbala Check | Trikaal Vaani',
    description:
      'Saaton grahon ki Shadbala, har ek ka apne classical minimum ke saamne ratio, aur sabse kamzor graha ke liye upay. Bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-weak-planet-finder',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weak Planet Finder — Free Shadbala Check | Trikaal Vaani',
    description: 'Kaunsa graha kamzor hai — Shadbala ratio ke saath, free.',
  },
  robots: { index: true, follow: true },
};

export default function WeakPlanetFinderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
