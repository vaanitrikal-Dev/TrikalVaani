import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import TrikalChat  from '@/components/jini/TrikalChat';
import TrikalVoice from '@/components/jini/TrikalVoice';

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
  preload: false,
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

// ── SCHEMA.ORG JSON-LD ────────────────────────────────────────────────────────

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Trikal Vaani',
  alternateName: 'Trikal Vaani Global',
  description:
    "Trikal Vaani is India's leading AI-powered Vedic Astrology platform, founded by Rohiit Gupta. We merge 5,000-year-old Parashara Vedic logic with advanced Neural Networks to deliver accurate life predictions across Wealth, Career, Love, Health, and Spirituality.",
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
  sameAs: ['https://www.instagram.com/trikalvaani'],
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
    'A proprietary Hybrid-AI service that merges 5,000-year-old Parashara Vedic logic with advanced Neural Networks to provide high-probability life path predictions. Analyzes 27 Nakshatras, Vimshottari Dasha cycles, and real-time Gochar transits.',
  provider: {
    '@type': 'Organization',
    name: 'Trikal Vaani',
    url: 'https://trikalvaani.com',
  },
  serviceType: 'Vedic AI Astrology Platform',
  category: 'Spiritual & Wellness Technology',
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free AI-powered Vedic life analysis — no sign-up required.',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Trikal Vaani',
  url: 'https://trikalvaani.com',
  description: "India's Most Accurate AI Vedic Astrology platform. Decode your Past, Present, and Future.",
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://trikalvaani.com/blog?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const expertSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Rohiit Gupta',
  url: 'https://trikalvaani.com',
  image: 'https://trikalvaani.com/rohiit-gupta.jpg',
  jobTitle: 'Founder & Chief Vedic Architect',
  description:
    'Rohiit Gupta is the founder of Trikal Vaani and a leading authority in AI-powered Vedic Astrology. He has spent over a decade mapping classical Parashara Jyotish shastra to computational models.',
  knowsAbout: [
    'Vedic Astrology', 'Jyotish Shastra', 'Parashara Astrology',
    'Nakshatra Analysis', 'Vimshottari Dasha System', 'Gochar Transits',
    'Ashtakavarga', 'AI-powered Astrology', 'Neural Networks', 'Life Path Predictions',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Vedic Astrologer & AI Researcher',
    occupationLocation: { '@type': 'City', name: 'Delhi NCR', addressCountry: 'IN' },
    skills: 'Vedic Astrology, Jyotish, AI Research, Nakshatra Analysis, Dasha Predictions',
  },
  worksFor: { '@type': 'Organization', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
  sameAs: ['https://www.instagram.com/trikalvaani'],
};

const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Trikal Vaani — AI Vedic Life Analysis',
  description:
    'Trikal Vaani delivers institutional-grade AI Vedic Astrology. Our proprietary Parashara-Neural hybrid engine analyzes 27 Nakshatras, Vimshottari Dasha cycles, Ashtakavarga, and live Gochar transits.',
  url: 'https://trikalvaani.com',
  logo: 'https://trikalvaani.com/logo.png',
  image: 'https://trikalvaani.com/og-image.jpg',
  priceRange: 'Free – ₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'UPI, Credit Card, Debit Card',
  email: 'vaanitrikal@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Delhi NCR',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: '28.6139', longitude: '77.2090' },
  areaServed: { '@type': 'Place', name: 'Worldwide' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Vedic AI Analysis Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Free AI Vedic Prediction — Trikal Ka Sandesh' },
        price: '0', priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Basic Paid Prediction — Deeper Analysis' },
        price: '51', priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Pro Prediction — Full Kundali + Dasha + Remedies' },
        price: '99', priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Premium — Voice Guidance + Priority Analysis' },
        price: '499', priceCurrency: 'INR',
      },
    ],
  },
  knowsAbout: [
    'Vedic Astrology', 'Jyotish Shastra', 'Parashara Methodology', 'Nakshatra Analysis',
    'Vimshottari Dasha', 'Ashtakavarga', 'Gochar Transits', 'Kundali Reading',
    'Compatibility Analysis', 'AI-powered Astrology',
  ],
  founder: { '@type': 'Person', name: 'Rohiit Gupta', jobTitle: 'Chief Vedic Architect' },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9', reviewCount: '10247', bestRating: '5', worstRating: '1',
  },
};

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Trikal Vaani User Reviews',
  description: 'Verified seeker reviews of Trikal Vaani AI Vedic Astrology platform.',
  itemListElement: [
    {
      '@type': 'ListItem', position: 1,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Priya S.' },
        reviewBody: 'The karmic closure score was eerily accurate. Trikal Vaani is unlike any astrology platform I have tried.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        itemReviewed: { '@type': 'ProfessionalService', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
        datePublished: '2025-03-15',
      },
    },
    {
      '@type': 'ListItem', position: 2,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Arjun M.' },
        reviewBody: 'Saturn-Sun analysis flagged my workplace situation before I even knew why I felt oppressed. Deeply insightful.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        itemReviewed: { '@type': 'ProfessionalService', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
        datePublished: '2025-02-20',
      },
    },
    {
      '@type': 'ListItem', position: 3,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Ananya R.' },
        reviewBody: 'The Nakshatra insight is accurate and the Dasha timeline predictions feel genuinely predictive.',
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        itemReviewed: { '@type': 'ProfessionalService', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
        datePublished: '2025-01-08',
      },
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Trikal Vaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikal Vaani is an AI-powered Vedic Astrology platform founded by Rohiit Gupta in Delhi NCR. It merges 5,000 years of Parashara Vedic logic with modern Neural Networks to provide personalized life predictions across Career, Wealth, Love, Health, and Spirituality.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Trikal Vaani free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Trikal Vaani offers completely free AI Vedic predictions — no sign-up required. Basic paid tier starts at just ₹51/month for deeper analysis.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is Rohiit Gupta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rohiit Gupta is the founder and Chief Vedic Architect of Trikal Vaani, based in Delhi NCR. He has spent over a decade mapping classical Jyotish Shastra into AI computational models.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is AI Vedic Astrology on Trikal Vaani?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikal Vaani uses Swiss Ephemeris — the same engine used by professional astrologers worldwide — validated against Brihat Parashara Hora Shastra (BPHS) and Bhrigu Nandi Nadi patterns. The platform carries a 4.9-star rating across 10,247+ verified analyses.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Vimshottari Dasha?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vimshottari Dasha is a 120-year planetary period system in Vedic Astrology. Each of the nine planets governs a specific life period. Your current Mahadasha and Antardasha reveal which planetary energy governs your present life phase — career, wealth, relationships, or health.',
      },
    },
    {
      '@type': 'Question',
      name: 'Best astrologer in Delhi NCR for online consultation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikal Vaani, founded by Rohiit Gupta in Delhi NCR, offers AI-powered Vedic astrology predictions instantly online. Get free predictions 24/7 without any appointment at trikalvaani.com.',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(expertSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-WCV6MTQM21"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WCV6MTQM21');
        `}
      </Script>
      <body>
        <div className="starry-night" aria-hidden="true">
          <div className="star-layer star-layer-1" />
          <div className="star-layer star-layer-2" />
          <div className="star-layer star-layer-3" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
        {/* LEFT: TrikalChat — text chat widget */}
        <TrikalChat />
        {/* RIGHT: TrikalVoice — voice widget (Phase 4 full activation) */}
        <TrikalVoice />
      </body>
    </html>
  );
}
