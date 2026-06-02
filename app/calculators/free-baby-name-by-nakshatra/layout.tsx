// ============================================================
// File: app/calculators/free-baby-name-by-nakshatra/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Baby Name by Nakshatra — Lucky Starting Letter & Names | Trikaal Vaani',
  description:
    "Free Baby Name by Nakshatra calculator powered by Swiss Ephemeris. Find your baby's birth nakshatra, pada and auspicious starting syllable (Naamakshar), with suggested names and meanings for boys & girls. By Rohiit Gupta.",
  keywords: [
    'baby name by nakshatra',
    'name by nakshatra and pada',
    'naamakshar calculator',
    'baby name calculator',
    'rashi nakshatra name',
    'baby name as per birth star',
    'lucky letter for baby name',
    'nakshatra name letter',
    'hindu baby names by nakshatra',
    'janma nakshatra name',
    'baby naming astrology',
    'starting letter by nakshatra',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-baby-name-by-nakshatra' },
  openGraph: {
    title: 'Free Baby Name by Nakshatra — Lucky Starting Letter & Names',
    description: "Find baby's nakshatra, pada & auspicious starting syllable with name suggestions and meanings.",
    url: 'https://trikalvaani.com/calculators/free-baby-name-by-nakshatra',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Baby Name by Nakshatra | Trikaal Vaani',
    description: "Find baby's lucky starting letter by nakshatra & pada — free, with names.",
  },
  robots: { index: true, follow: true },
};

export default function BabyNameByNakshatraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
