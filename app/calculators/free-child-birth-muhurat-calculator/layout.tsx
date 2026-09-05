// ============================================================
// File: app/calculators/free-child-birth-muhurat-calculator/layout.tsx
// Version: v2.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY v2.0 REPLACES v1.1
//   The v1.1 title was 99 characters:
//     "Free Child Birth Muhurat Calculator — Auspicious C-Section & Delivery
//      Time by Date | Trikaal Vaani"
//   Two faults in one line. (1) It carried the brand manually while
//   app/layout.tsx already sets title.template = "%s | Trikaal Vaani", so the
//   rendered title was "... | Trikaal Vaani | Trikaal Vaani" — 115 characters.
//   (2) Google shows roughly 58, so everything after "Auspicious C-Sec" was
//   cut. The searcher never saw the brand, the keyword, or the offer.
//
//   GSC, 3 months to 4 Sep 2026: 632 impressions, 52 clicks, CTR 8.23%,
//   average position 6.76. That CTR was earned in spite of the title, not
//   because of it — which is why this is the highest-value fix in the batch.
//
// HOW v2.0 FIXES IT
//   `title: { absolute: ... }` bypasses the parent template, so the string
//   below is exactly what Google renders. 56 characters including the brand.
//
// TITLE IN USE — Option 1, Frictionless/Speed
//   "Child Birth Muhurat Calculator — Free | Trikaal Vaani"  (53 chars)
//   Four alternates sit in the chat handoff of 05 Sep 2026. Swapping means
//   replacing the two strings below and nothing else.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : child birth muhurat calculator
// AUDIENCE CONCERN: a planned C-section or induction is coming and the family
//                   wants the most auspicious time inside the doctor's window
// PAGE OFFER      : free, no signup; nine factors scored per slot with the
//                   reason printed, plus the baby's naamakshar
//
// SAFETY NOTE — keep this in any rewrite
//   No title or description here may imply that a delivery should be moved,
//   delayed or scheduled for astrological reasons. Every string says the
//   muhurat is chosen INSIDE the doctor's window. This is a medical subject
//   and the copy must never compete with medical advice.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Child Birth Muhurat Calculator — Free | Trikaal Vaani' },
  description:
    'Doctor ki di hui window ke andar sabse shubh delivery time — Lagna, nakshatra, tithi aur 8th house, har point ki wajah ke saath. Free, bina signup.',
  keywords: [
    'child birth muhurat calculator',
    'shubh muhurat for child birth',
    'c section delivery shubh muhurat',
    'best tithi for child birth',
    'shubh nakshatra for baby birth',
    'best date for baby birth',
    'most auspicious time today for baby birth',
    'good time for baby delivery tomorrow',
    'is rohini nakshatra good for birth',
    'is anuradha nakshatra good for child birth',
    'child birth prediction calculator astrology',
    'abhijit muhurat',
    'naamakshar by nakshatra',
    'ivf delivery muhurat',
    'santan janam muhurat',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-child-birth-muhurat-calculator' },
  openGraph: {
    title: 'Child Birth Muhurat Calculator — Free | Trikaal Vaani',
    description:
      'Doctor ki window ke andar sabse shubh delivery time. Nau kaarak — Lagna, nakshatra, tithi, 8th house — har point ki wajah ke saath. Free.',
    url: 'https://trikalvaani.com/calculators/free-child-birth-muhurat-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Child Birth Muhurat Calculator — Free | Trikaal Vaani',
    description: 'Doctor ki window ke andar sabse shubh delivery time, har point ki wajah ke saath.',
  },
  robots: { index: true, follow: true },
};

export default function ChildBirthMuhuratLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
