// ============================================================
// File: app/calculators/free-gemstone-suitability-calculator/layout.tsx
// Version: v1.0 (05 Sep 2026) — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY THIS FILE EXISTS
//   page.tsx is a client component ('use client') and cannot export
//   `metadata`, and this route had no layout.tsx — so it had NO title tag and
//   NO description at all. Google fell back to the root default
//   ("Trikaal Vaani | Free Kundli & Accurate AI Vedic Astrology"), shared with
//   every other title-less page on the site. That is a large part of why this
//   page sits at average position 78.75.
//
// WHY `absolute`
//   app/layout.tsx sets title.template = "%s | Trikaal Vaani". The site
//   standard requires 50-58 characters INCLUDING the brand, so the brand has
//   to be inside the counted string; `absolute` bypasses the parent template
//   and makes the field below exactly what Google renders.
//
// TITLE IN USE — Option 5, Bilingual/Hinglish
//   "Kaun Sa Ratna Pehnein — Free Kundli Jaanch | Trikaal Vaani"  (58 chars)
//
//   Why the Hinglish question rather than the usual Frictionless angle: Radar
//   E3 (05 Sep 2026) tracks EIGHTEEN keywords across calc-gemstone,
//   calc-should-i-wear and gem-general, and we rank on NONE of them. The
//   highest-intent ones are phrased as the question a person actually asks —
//   "मुझे कौन सा रत्न पहनना चाहिए", "kaun sa ratna pehne kundli ke hisab se",
//   "रत्न कैसे चुनें कुंडली से". Matching that phrasing is worth more here than
//   leading with "Free". "Jaanch" is also deliberate — this page checks, it
//   does not recommend a purchase.
//
// PAGE TYPE       : Calculator
// TARGET KEYWORD  : kaun sa ratna pehne / gemstone calculator by date of birth
// AUDIENCE CONCERN: someone has told them to wear a stone and they are not
//                   sure it is safe — or they have already worn one and it
//                   went badly
// PAGE OFFER      : free, no signup; all nine stones scored 0-100 with the
//                   reason behind each — house lordship, marak/badhak,
//                   combustion, strength and dasha
//
// THE LINE THIS METADATA MUST NEVER CROSS
//   We do not sell gemstones, take commission, or run a paid recommendation,
//   and the page says so in its own section. Nothing in the title or
//   description may imply that a stone is needed, promised or being offered.
//   This is the most heavily monetised corner of Indian astrology and the only
//   thing that makes a free recommendation trustworthy is having nothing to
//   sell — so the copy leads with "jaanch", not with a stone.
//
// GSC 3 months to 4 Sep 2026: 89 impressions, 0 clicks, position 78.75 —
// the lowest-placed page in the thin-calculator batch.
// ============================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Kaun Sa Ratna Pehnein — Free Kundli Jaanch | Trikaal Vaani' },
  description:
    'Nau ke nau ratna ka score aapki kundali se — lagna, bhaav-swamitva, ast sthiti aur bal dekhkar. Hum ratna bechte nahi, sirf jaanchte hain. Free.',
  keywords: [
    'kaun sa ratna pehne kundli ke hisab se',
    'मुझे कौन सा रत्न पहनना चाहिए',
    'रत्न कैसे चुनें कुंडली से',
    'रत्न कैलकुलेटर',
    'ratna calculator kundli',
    'gemstone calculator by date of birth',
    'which gemstone suits me astrology free',
    'gemstone suitability calculator',
    'lucky stone calculator by date of birth',
    'मेरा भाग्य रत्न कौन सा है',
    'gemstone according to rashi',
    'gemstone wrong effects astrology',
    'jeevan ratna bhagya ratna punya ratna',
    'upratna substitute gemstone',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-gemstone-suitability-calculator' },
  openGraph: {
    title: 'Kaun Sa Ratna Pehnein — Free Kundli Jaanch | Trikaal Vaani',
    description:
      'Nau ratna, nau score, aur har score ke saath uski wajah — lagna se, rashi se nahi. Hum ratna nahi bechte, isliye salah seedhi hai. Bilkul free.',
    url: 'https://trikalvaani.com/calculators/free-gemstone-suitability-calculator',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaun Sa Ratna Pehnein — Free Kundli Jaanch | Trikaal Vaani',
    description: 'Nau ratna ka score lagna se — aur hum ratna bechte nahi. Free.',
  },
  robots: { index: true, follow: true },
};

export default function GemstoneSuitabilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
