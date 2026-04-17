import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trikalvaani.com'),
  title: "Trikal Vaani | World's Most Accurate AI Vedic Astrology",
  description:
    'Decode your Past, Present, and Future with Trikal Vaani - The independent AI Guru for all life aspects. Powered by Parashara Vedic logic and advanced Neural Networks.',
  keywords: [
    'Accurate AI Astrology',
    'Vedic Shastra AI',
    'Global Destiny Predictions',
    'AI Vedic astrology',
    'Jyotish AI',
    'Vedic life analysis',
    'kundali AI',
    'birth chart analysis',
    'Gochar transit predictions',
    'Trikal Vaani',
    'Rohiit Gupta astrology',
    'free Vedic horoscope',
    'Parashara astrology AI',
    'daily energy score',
    'nakshatra analysis',
  ],
  authors: [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com' }],
  creator: 'Rohiit Gupta',
  publisher: 'Trikal Vaani',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },
  openGraph: {
    title: "Trikal Vaani | World's Most Accurate AI Vedic Astrology",
    description:
      'Decode your Past, Present, and Future with Trikal Vaani - The independent AI Guru for all life aspects.',
    url: 'https://trikalvaani.com',
    siteName: 'Trikal Vaani',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trikalvaani',
    creator: '@trikalvaani',
    title: "Trikal Vaani | World's Most Accurate AI Vedic Astrology",
    description:
      'Decode your Past, Present, and Future with Trikal Vaani - The independent AI Guru for all life aspects.',
  },
  alternates: {
    canonical: 'https://trikalvaani.com',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Trikal Vaani',
  alternateName: 'Trikal Vaani Global',
  description:
    'Trikal Vaani is the world\'s leading Vedic AI Astrology Research Platform, founded by Rohiit Gupta. We merge 5,000-year-old Parashara Vedic logic with advanced Neural Networks to deliver high-probability life path predictions across Wealth, Career, Love, Health, and Peace.',
  url: 'https://trikalvaani.com',
  logo: 'https://trikalvaani.com/logo.png',
  founder: {
    '@type': 'Person',
    name: 'Rohiit Gupta',
    jobTitle: 'Founder & Chief Vedic Architect',
    sameAs: ['https://www.instagram.com/trikalvaani'],
  },
  foundingLocation: {
    '@type': 'Place',
    name: 'Delhi NCR, India',
    addressCountry: 'IN',
  },
  keywords:
    'Accurate AI Astrology, Vedic Shastra AI, Global Destiny Predictions, Jyotish Neural Network, Nakshatra AI Analysis, Parashara Vedic Logic',
  sameAs: [
    'https://www.instagram.com/trikalvaani',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    availableLanguage: ['English', 'Hindi'],
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Trikal Vaani AI Vedic Life Analysis',
  description:
    'A proprietary Hybrid-AI service that merges 5,000-year-old Parashara Vedic logic with advanced Neural Networks to provide high-probability life path predictions. Analyzes 27 Nakshatras, Vimshottari Dasha cycles, and real-time Gochar transits to produce personalized Daily Energy Scores and six Life Pillar assessments covering Wealth, Career, Love, Health, Student performance, and inner Peace.',
  provider: {
    '@type': 'Organization',
    name: 'Trikal Vaani',
    url: 'https://trikalvaani.com',
  },
  serviceType: 'Vedic AI Astrology Research Platform',
  category: 'Spiritual & Wellness Technology',
  areaServed: {
    '@type': 'Place',
    name: 'Worldwide',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free AI-powered Vedic life analysis — no sign-up required.',
  },
  keywords:
    'Accurate AI Astrology, Vedic Shastra AI, Global Destiny Predictions, Nakshatra Analysis, Rahu Ketu Transit, Vimshottari Dasha',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Trikal Vaani',
  url: 'https://trikalvaani.com',
  description:
    "World's Most Accurate AI Vedic Astrology platform. Decode your Past, Present, and Future.",
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://trikalvaani.com/blog?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Trikal Vaani — AI Vedic Life Analysis',
  description:
    'Trikal Vaani delivers institutional-grade AI Vedic Astrology. Our proprietary Parashara-Neural hybrid engine analyzes 27 Nakshatras, Vimshottari Dasha cycles, Ashtakavarga, and live Gochar transits to generate personalized Daily Energy Scores, Six Life Pillar assessments, and generation-specific Dard Engine readings. Founded and verified by Rohiit Gupta, Chief Vedic Architect.',
  url: 'https://trikalvaani.com',
  logo: 'https://trikalvaani.com/logo.png',
  image: 'https://trikalvaani.com/og-image.jpg',
  priceRange: 'Free – ₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, UPI',
  telephone: '',
  email: 'vaanitrikal@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Delhi NCR',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '28.6139',
    longitude: '77.2090',
  },
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Vedic AI Analysis Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Free Daily Vedic Energy Score & Life Pillar Analysis' },
        price: '0',
        priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Deep Dive Premium Report (Deepak Level)' },
        price: '99',
        priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Full Kundali + Dasha Analysis (Akash Level)' },
        price: '299',
        priceCurrency: 'INR',
      },
    ],
  },
  knowsAbout: [
    'Vedic Astrology', 'Jyotish Shastra', 'Parashara Methodology', 'Nakshatra Analysis',
    'Vimshottari Dasha', 'Ashtakavarga', 'Gochar Transits', 'Kundali Reading',
    'Compatibility Analysis', 'AI-powered Astrology', 'Ex-Back Karmic Analysis',
  ],
  founder: {
    '@type': 'Person',
    name: 'Rohiit Gupta',
    jobTitle: 'Chief Vedic Architect',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '10247',
    bestRating: '5',
    worstRating: '1',
  },
};

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Trikal Vaani User Reviews',
  description: 'Verified seeker reviews of Trikal Vaani AI Vedic Astrology platform.',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Priya S.' },
        reviewBody:
          'The Ex-Back karmic closure score was eerily accurate. I had goosebumps reading the Venus-Moon analysis. Trikal Vaani is unlike any astrology platform I have tried.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        itemReviewed: { '@type': 'ProfessionalService', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
        datePublished: '2025-03-15',
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Arjun M.' },
        reviewBody:
          'The Toxic Boss Radar dual chart feature is brilliant. Saturn-Sun analysis flagged my manager before I even knew why I felt oppressed. Deeply insightful.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        itemReviewed: { '@type': 'ProfessionalService', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
        datePublished: '2025-02-20',
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Ananya R.' },
        reviewBody:
          'I use the Life Pillar scores every morning like a dashboard. The Nakshatra insight is accurate and the Dasha timeline predictions feel genuinely predictive.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        itemReviewed: { '@type': 'ProfessionalService', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
        datePublished: '2025-01-08',
      },
    },
  ],
};

const expertSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Rohiit Gupta',
  url: 'https://trikalvaani.com',
  image: 'https://trikalvaani.com/rohiit-gupta.jpg',
  jobTitle: 'Founder & Chief Vedic Architect',
  description:
    'Rohiit Gupta is the founder of Trikal Vaani and a leading authority in AI-powered Vedic Astrology. He has spent over a decade mapping classical Parashara Jyotish shastra to computational models, making 5,000-year-old Vedic wisdom accessible and actionable for modern seekers worldwide.',
  knowsAbout: [
    'Vedic Astrology',
    'Jyotish Shastra',
    'Parashara Astrology',
    'Nakshatra Analysis',
    'Vimshottari Dasha System',
    'Gochar Transits',
    'Ashtakavarga',
    'AI-powered Astrology',
    'Neural Networks',
    'Life Path Predictions',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Vedic Astrologer & AI Researcher',
    occupationLocation: {
      '@type': 'City',
      name: 'Delhi NCR',
      addressCountry: 'IN',
    },
    skills: 'Vedic Astrology, Jyotish, AI Research, Nakshatra Analysis, Dasha Predictions',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Trikal Vaani',
    url: 'https://trikalvaani.com',
  },
  sameAs: [
    'https://www.instagram.com/trikalvaani',
  ],
  alumniOf: {
    '@type': 'Organization',
    name: 'Vedic Astrology Research Institute',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(expertSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      </head>
      <body>
        <div className="starry-night" aria-hidden="true">
          <div className="star-layer star-layer-1" />
          <div className="star-layer star-layer-2" />
          <div className="star-layer star-layer-3" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
