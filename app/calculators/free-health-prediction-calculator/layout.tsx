// ============================================================
// File: app/calculators/free-health-prediction-calculator/layout.tsx
// Version: v1.0 (22 Sep 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// WHY THIS FILE EXISTS
//   page.tsx is a client component ('use client') and cannot export
//   `metadata`. This layout carries the title and meta for the route.
//   `absolute` bypasses app/layout.tsx's "%s | Trikaal Vaani" template.
//
// TITLE — Rohiit ka chunav (22 Sep 2026), 55 akshar:
//   "Free Health Prediction by Date of Birth | Trikaal Vaani"
//   "health prediction by date of birth" = jo log hubahu likhte hain (7
//   competitor isi par). "health astrology" hamare pillar
//   (/blog/vedic-health-astrology-kundli-guide) ka keyword hai — takraav nahi.
// META — Rohiit ka chunav (M2), 152 akshar.
//
// TARGET KEYWORD  : health prediction by date of birth
// AUDIENCE CONCERN: Meri kundali mein sehat kaisi hai, kin baaton ka dhyan rakhun?
// PAGE OFFER      : Jeevan-shakti score + areas to watch + prakriti, shlok ke saath
// ============================================================

import type { Metadata } from 'next';

const TITLE = 'Free Health Prediction by Date of Birth | Trikaal Vaani';
const DESC =
  'Check your health by date of birth free — vitality score, body areas to watch (Kalapurusha) and Vaat-Pitta-Kaph prakriti. Classical BPHS, 60-sec result.';
const URL = 'https://trikalvaani.com/calculators/free-health-prediction-calculator';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: [
    'health prediction by date of birth',
    'free health prediction by date of birth',
    'health astrology by date of birth',
    'medical astrology by date of birth',
    'health horoscope by date of birth',
    'vata pitta kapha by birth chart',
    'kundli se swasthya',
    'स्वास्थ्य भविष्य जन्म तिथि से',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: URL,
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
  },
  robots: { index: true, follow: true },
};

export default function HealthPredictionCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
