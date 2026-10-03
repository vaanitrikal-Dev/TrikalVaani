// ============================================================
// File: app/calculators/free-nakshatra-calculator/layout.tsx
// Version: v2.3 (03 Oct 2026) — metadata only. Previous: v2.2 — metadata only, clean passthrough
//   v2.3 (2026-10-03) — title + description rewritten for CTR (keyword first, 50-58 / 140-155).
//        Old title: "Free Nakshatra Calculator — Janma Nakshatra".
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.2 (2026-06-02) — Brand fix: visible brand normalised to the
//        double-a spelling in page <title> and openGraph siteName.
//        No other change.
//   v2.1 — metadata only, clean passthrough.
// ============================================================
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: { absolute: 'Nakshatra Calculator by Date of Birth — Rasi & Pada' },
  description:
    "Find your nakshatra by date of birth: rasi, pada, naming syllable, ruling planet, gana and nadi \u2014 free, with Tamil and Malayalam names. Check now.",
  keywords: [
    'nakshatra calculator', 'free nakshatra calculator', 'janma nakshatra calculator',
    'birth star calculator', 'nakshatra finder', 'nakshatra by date of birth',
    'my nakshatra', '27 nakshatras', 'nakshatra pada calculator',
    'nakshatra lord calculator', 'vedic nakshatra online', 'janam nakshatra free',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-nakshatra-calculator' },
  openGraph: {
    title: 'Free Nakshatra Calculator — Find Your Janma Nakshatra Online',
    description: 'Find your Janma Nakshatra, Pada, lord, deity, gana, yoni, nadi & 3 Parashar remedies — free.',
    url: 'https://trikalvaani.com/calculators/free-nakshatra-calculator',
    type: 'website', siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Nakshatra Calculator — Janma Nakshatra Online',
    description: 'Free Nakshatra finder with Pada, lord, deity & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};
export default function NakshatraCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
