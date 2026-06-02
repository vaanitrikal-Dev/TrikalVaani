// ============================================================
// File: app/calculators/free-weak-planet-finder/layout.tsx
// Version: v1.0 — metadata only
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Weak Planet Finder — Find & Fix Weak Planets in Kundali | Trikaal Vaani',
  description:
    'Free Weak Planet Finder powered by Swiss Ephemeris + Shadbala. Find your weakest planet, its strength vs minimum required, the life areas it affects & 3 free Parashar remedies to strengthen it. By Rohiit Gupta.',
  keywords: [
    'weak planet in kundali',
    'weak planet calculator',
    'weak planet finder',
    'debilitated planet calculator',
    'graha dosha',
    'planet affliction calculator',
    'nirbal graha',
    'kamzor graha',
    'shadbala calculator',
    'which planet is weak in my horoscope',
    'weak planet remedies',
    'planet strength calculator',
  ],
  alternates: { canonical: 'https://trikalvaani.com/calculators/free-weak-planet-finder' },
  openGraph: {
    title: 'Free Weak Planet Finder — Find & Fix Weak Planets in Kundali',
    description: 'Find your weakest planet, affected life areas & 3 free remedies to strengthen it — free, instant.',
    url: 'https://trikalvaani.com/calculators/free-weak-planet-finder',
    type: 'website',
    siteName: 'Trikaal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Weak Planet Finder | Trikaal Vaani',
    description: 'Find & fix your weakest planet using Shadbala — free Vedic calculator.',
  },
  robots: { index: true, follow: true },
};

export default function WeakPlanetFinderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
