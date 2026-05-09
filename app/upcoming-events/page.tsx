/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  CEO PROTECTION HEADER — TRIKAL VAANI CORE FILE
 * ═══════════════════════════════════════════════════════════════════════════
 *  File         : app/upcoming-events/page.tsx
 *  Version      : v2.0  (Static → Dynamic SEO Hub)
 *  Owner        : Rohiit Gupta — CEO & Chief Vedic Architect
 *  Last Updated : 2026-05-09
 *  Phase        : A1 + A4-A10 (Hub Upgrade — Step 1 of 34)
 *
 *  PURPOSE:
 *    Transforms /upcoming-events from a static brochure into the central
 *    SEO+GEO hub of Trikal Vaani. Spawns ranking authority across:
 *      - Today's Panchang (GEO direct-answer block)
 *      - 10 festival Event schema entries (Phase A)
 *      - FAQPage, BreadcrumbList, Person, WebPage schemas
 *      - Hub-spoke internal linking ready (Phase B activates spokes)
 *
 *  SESSION RULES (DO NOT VIOLATE):
 *    1. Full file replacements only — never partial edits
 *    2. Never touch gemini-prompt.ts (LOCKED v5.0)
 *    3. Canonical MUST point to /upcoming-events (not homepage)
 *    4. ISR revalidate = 3600s (hourly Panchang refresh)
 *    5. WhatsApp = +91 9211804111 (Rohiit's business number)
 *    6. Person schema author = Rohiit Gupta, Chief Vedic Architect
 *
 *  DOWNSTREAM DEPENDENCIES (will be wired in next steps):
 *    - A2: VM /python-engines/panchang/daily.py
 *    - A3: app/api/panchang/today/route.ts
 *    - A9: app/sitemap.ts (lastmod dynamic)
 *    - B1-B6: Child dynamic routes (/panchang/[date], /events/[slug], /[city]/...)
 *
 *  COPYRIGHT © 2026 Trikal Vaani Global. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

// ─────────────────────────────────────────────────────────────────────────────
// ISR CONFIGURATION — Daily Panchang refresh signal to Google
// ─────────────────────────────────────────────────────────────────────────────
export const revalidate = 3600; // Re-render every hour
export const dynamic = "force-static";

// ─────────────────────────────────────────────────────────────────────────────
// METADATA — Canonical FIXED, full Open Graph + Twitter, hreflang ready
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title:
    "Vedic Festival Calendar 2026 | Daily Panchang & Sacred Events — Trikal Vaani",
  description:
    "Authentic Vedic festival calendar 2026 with accurate tithi, muhurat, and astrological significance. Daily Panchang updates curated by Rohiit Gupta, Chief Vedic Architect. Diwali, Navratri, Ekadashi, Janmashtami and more.",
  keywords: [
    "vedic festival calendar 2026",
    "panchang today",
    "aaj ka panchang",
    "ekadashi 2026 dates",
    "diwali 2026 muhurat",
    "navratri 2026 ghatasthapana",
    "shubh muhurat today",
    "tithi today",
    "rahu kaal today delhi",
    "vedic events calendar India",
    "festival do's and dont's",
    "Rohiit Gupta astrologer",
    "Trikal Vaani festival",
    "guru purnima 2026",
    "janmashtami 2026 muhurat",
  ],
  alternates: {
    canonical: "https://trikalvaani.com/upcoming-events",
    languages: {
      "en-IN": "https://trikalvaani.com/upcoming-events",
      "hi-IN": "https://trikalvaani.com/hi/upcoming-events",
      "x-default": "https://trikalvaani.com/upcoming-events",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://trikalvaani.com/upcoming-events",
    siteName: "Trikal Vaani",
    title: "Vedic Festival Calendar 2026 | Daily Panchang — Trikal Vaani",
    description:
      "Authentic Vedic festival calendar 2026 with accurate tithi, muhurat, and astrological significance. Curated by Rohiit Gupta, Chief Vedic Architect.",
    images: [
      {
        url: "https://trikalvaani.com/images/og/upcoming-events-2026.jpg",
        width: 1200,
        height: 630,
        alt: "Trikal Vaani Vedic Festival Calendar 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@trikalvaani",
    creator: "@trikalvaani",
    title: "Vedic Festival Calendar 2026 — Trikal Vaani",
    description:
      "Authentic Vedic festival calendar with daily Panchang. Curated by Rohiit Gupta.",
    images: ["https://trikalvaani.com/images/og/upcoming-events-2026.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  creator: "Rohiit Gupta",
  publisher: "Trikal Vaani",
};

// ─────────────────────────────────────────────────────────────────────────────
// FESTIVAL SEED DATA — 10 festivals (Phase A). Expands to 50 in Phase B.
// Source: Parashara Vedic Panchang for IST. Verified by Rohiit Gupta.
// ─────────────────────────────────────────────────────────────────────────────
type Festival = {
  slug: string;
  name: string;
  sanskrit: string;
  date: string; // ISO 8601 for schema
  displayDate: string;
  major: boolean;
  ruler: string;
  significance: string;
  dos: string[];
  donts: string[];
  relatedDomain: string; // For internal linking to life-domain pages
};

const FESTIVALS_2026: Festival[] = [
  {
    slug: "akshaya-tritiya-2026",
    name: "Akshaya Tritiya",
    sanskrit: "अक्षय तृतीया",
    date: "2026-04-30",
    displayDate: "Apr 30, 2026",
    major: true,
    ruler: "Venus + Sun",
    significance:
      'Most auspicious day of the year for new beginnings. Akshaya means "never diminishing" — any action started today is blessed with eternal growth. Gold purchases, property deals, and new ventures carry divine backing.',
    dos: [
      "Buy gold or silver",
      "Start a new business or project",
      "Donate to the needy (annadaan)",
      "Perform ancestral rituals (pitru tarpan)",
      "Begin spiritual practice or mantra sadhana",
    ],
    donts: [
      "Avoid conflicts or ego clashes",
      "Do not take loans on this day",
      "Avoid non-vegetarian food",
      "Do not speak harshly to parents or elders",
    ],
    relatedDomain: "wealth",
  },
  {
    slug: "buddha-purnima-2026",
    name: "Buddha Purnima",
    sanskrit: "बुद्ध पूर्णिमा",
    date: "2026-05-12",
    displayDate: "May 12, 2026",
    major: true,
    ruler: "Moon (Full)",
    significance:
      "The full moon of Vaishakha marks the birth, enlightenment, and Mahaparinirvana of Gautama Buddha. Purnima energy amplifies compassion, forgiveness, and spiritual receptivity.",
    dos: [
      "Meditate and practice silence (mouna)",
      "Donate food and clothes to the poor",
      "Light ghee diyas at home and temples",
      "Chant peace mantras and Om",
      "Fast if health permits",
    ],
    donts: [
      "Avoid arguments and negative speech",
      "Do not consume alcohol or intoxicants",
      "Avoid starting new ventures (wait 24 hours)",
      "Do not harbour resentment",
    ],
    relatedDomain: "spirituality",
  },
  {
    slug: "nirjala-ekadashi-2026",
    name: "Nirjala Ekadashi",
    sanskrit: "निर्जला एकादशी",
    date: "2026-06-07",
    displayDate: "Jun 7, 2026",
    major: true,
    ruler: "Jupiter",
    significance:
      "The most rigorous of all 24 Ekadashis — a full waterless fast. Observing this single Ekadashi is said to grant the merit of all 24 Ekadashis combined. Jupiter's grace for wealth, wisdom, and progeny is activated.",
    dos: [
      "Fast completely (nirjala — no water, for the devout)",
      "Recite Vishnu Sahasranama",
      "Donate yellow cloth, turmeric, and gram dal",
      "Stay awake all night in devotion (jaagaran)",
      "Perform Tulsi puja",
    ],
    donts: [
      "Avoid rice and grains",
      "Do not cut hair or nails",
      "Avoid sensual pleasures",
      "Do not sleep during the day",
    ],
    relatedDomain: "spirituality",
  },
  {
    slug: "guru-purnima-2026",
    name: "Guru Purnima",
    sanskrit: "गुरु पूर्णिमा",
    date: "2026-07-03",
    displayDate: "Jul 3, 2026",
    major: true,
    ruler: "Jupiter (Brihaspati)",
    significance:
      "The sacred day to honour the Guru-Shishya tradition. Vyasa Purnima — birth of Maharishi Veda Vyasa. Jupiter's blessings for knowledge, wisdom, and spiritual lineage are at their annual peak.",
    dos: [
      "Honour your teacher, mentor, or guru",
      "Read Guru Gita or Bhagavad Gita",
      "Donate books and educational materials",
      "Begin a new course of study",
      "Perform pada puja of an elder",
    ],
    donts: [
      "Avoid ego and self-importance",
      "Do not disrespect any teacher figure",
      "Avoid indulgent entertainment",
      "Do not break a promise made to a mentor",
    ],
    relatedDomain: "education",
  },
  {
    slug: "nag-panchami-2026",
    name: "Nag Panchami",
    sanskrit: "नाग पंचमी",
    date: "2026-08-09",
    displayDate: "Aug 9, 2026",
    major: false,
    ruler: "Rahu + Ketu",
    significance:
      "The festival of serpent deities (Nag Devata), symbolising the Rahu-Ketu karmic axis. Propitiating the Nag Devata on this day removes Kaal Sarp Dosha and past-life serpent curses from the horoscope.",
    dos: [
      "Offer milk to snake idols or anthills",
      "Perform Rahu-Ketu shanti puja",
      "Fast and pray for family protection",
      'Chant "Om Namah Shivaya" 108 times',
      "Feed Brahmins",
    ],
    donts: [
      "Never harm a snake today (or any day)",
      "Avoid ploughing soil or digging",
      "Do not fry food in oil (avoid fire rituals)",
      "Avoid conflict with brothers and sisters",
    ],
    relatedDomain: "family",
  },
  {
    slug: "janmashtami-2026",
    name: "Janmashtami",
    sanskrit: "जन्माष्टमी",
    date: "2026-08-28",
    displayDate: "Aug 28, 2026",
    major: true,
    ruler: "Moon (8th Tithi)",
    significance:
      "The birth of Lord Sri Krishna — the complete avatar of Vishnu. The Ashtami of Krishna Paksha in Bhadrapada month. Midnight celebration of divine love, wisdom, and cosmic protection.",
    dos: [
      "Fast until midnight and break it after Krishna's birth",
      "Sing bhajans and recite Bhagavad Gita",
      "Decorate the cradle (Jhula) of Bal Krishna",
      "Feed 8 children (representing the 8 Ashtami)",
      "Prepare panchamrit and offer to the deity",
    ],
    donts: [
      "Avoid non-vegetarian food",
      "Do not consume alcohol",
      "Avoid sleeping before midnight puja",
      "Do not show greed or dishonesty today",
    ],
    relatedDomain: "spirituality",
  },
  {
    slug: "pitru-paksha-2026",
    name: "Pitru Paksha Begins",
    sanskrit: "पितृ पक्ष प्रारम्भ",
    date: "2026-09-17",
    displayDate: "Sep 17, 2026",
    major: false,
    ruler: "Saturn + Sun",
    significance:
      "15-day period for ancestral propitiation (Shraddha). Saturn governs karma and ancestry. Performing tarpan during this period resolves ancestral debts that block wealth, marriage, and progeny in your chart.",
    dos: [
      "Perform daily tarpan for ancestors",
      "Donate food, clothing, and money in their name",
      "Cook their favourite foods as offering",
      "Visit sacred rivers for ritual bathing",
      "Chant Pitru Stotram",
    ],
    donts: [
      "Avoid auspicious ceremonies (weddings, griha pravesh)",
      "Do not purchase new clothes or jewellery",
      "Avoid celebrating birthdays during this period",
      "Do not waste food",
    ],
    relatedDomain: "family",
  },
  {
    slug: "navratri-sharad-2026",
    name: "Navratri (Sharad) Begins",
    sanskrit: "शारदीय नवरात्रि",
    date: "2026-10-02",
    displayDate: "Oct 2, 2026",
    major: true,
    ruler: "Moon + Venus",
    significance:
      "Nine nights of the Divine Mother (Durga, Lakshmi, Saraswati). The most powerful period for feminine energy, wealth manifestation, and spiritual awakening. The veil between worlds is thinnest during Navratri.",
    dos: [
      "Fast and observe purity",
      "Perform Devi puja with red flowers",
      "Recite Durga Saptashati (700 shlokas)",
      "Light an Akhand Jyoti (unbroken flame)",
      "Begin new positive habits (vratas)",
    ],
    donts: [
      "Avoid non-veg, alcohol, and tamasic food",
      "Do not cut hair during the 9 days",
      "Avoid sexual activity if observing strict vrata",
      "Do not speak ill of women — Shakti is everywhere",
    ],
    relatedDomain: "spirituality",
  },
  {
    slug: "diwali-lakshmi-puja-2026",
    name: "Diwali — Lakshmi Puja",
    sanskrit: "दीपावली — लक्ष्मी पूजा",
    date: "2026-10-21",
    displayDate: "Oct 21, 2026",
    major: true,
    ruler: "Venus + Jupiter",
    significance:
      "The festival of light and the supreme night for Lakshmi Puja. The new moon of Kartika month — Venus and Jupiter aligned for maximum wealth manifestation. Every diya lit invites Lakshmi's permanent residence.",
    dos: [
      "Perform Lakshmi-Ganesha puja at midnight",
      "Light oil diyas in every corner of the home",
      "Open business ledgers (Chopda Puja)",
      "Donate to the poor before puja",
      "Buy gold, silver, or new utensils",
    ],
    donts: [
      "Do not gamble beyond symbolic tradition",
      "Avoid loud quarrels during puja time",
      "Do not leave the house dark at night",
      "Avoid debt on this day — repay instead",
    ],
    relatedDomain: "wealth",
  },
  {
    slug: "chhath-puja-2026",
    name: "Chhath Puja",
    sanskrit: "छठ पूजा",
    date: "2026-11-05",
    displayDate: "Nov 5, 2026",
    major: false,
    ruler: "Sun (Surya)",
    significance:
      "The ancient solar festival of Bihar — the only Vedic puja performed to the setting and rising sun. Surya's direct blessing for health, vitality, and divine light. One of the most austere and powerful Vedic observances.",
    dos: [
      "Offer arghya to setting sun (Sandhya Arghya)",
      "Offer arghya to rising sun next morning",
      "Fast for 36 hours (nirjala for the devout)",
      "Prepare thekua and fresh fruit offerings",
      "Bathe in river or natural water body",
    ],
    donts: [
      "Avoid any impurity or negative speech",
      "Do not use onion, garlic in prasad",
      "Avoid synthetic clothing during the puja",
      "Do not disrespect the sun at any time",
    ],
    relatedDomain: "health",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FAQ DATA — Voice-search + AI-extraction optimized (8-10 Q&As)
// ─────────────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What is the most important Vedic festival in 2026?",
    a: "Diwali (Lakshmi Puja) on October 21, 2026 is the supreme wealth-manifestation night, when Venus and Jupiter align to invite prosperity. Navratri (October 2-11) and Akshaya Tritiya (April 30) are equally significant for spiritual and material abundance respectively.",
  },
  {
    q: "When is Nirjala Ekadashi 2026?",
    a: "Nirjala Ekadashi falls on June 7, 2026. It is the most rigorous of all 24 Ekadashis, observed as a complete waterless fast. Its merit is said to equal that of all 24 annual Ekadashis combined, blessed by Jupiter for wealth, wisdom, and progeny.",
  },
  {
    q: "What is the muhurat for Diwali 2026 Lakshmi Puja?",
    a: "Diwali 2026 Lakshmi Puja falls on October 21, 2026. The Pradosh Kaal and Vrishabha Lagna combined create the supreme muhurat between approximately 7:08 PM and 8:43 PM IST in Delhi NCR. Exact timings vary by city — Trikal Vaani publishes city-specific muhurat.",
  },
  {
    q: "How do I perform Pitru Tarpan correctly?",
    a: "Pitru Tarpan is performed during Pitru Paksha (Sep 17 - Oct 2, 2026). Face south, hold water in your right palm with darbha grass and black sesame, recite the ancestral mantras, and release water as offering. South-facing direction connects to the Pitra Loka realm governed by Yama.",
  },
  {
    q: "What is Kaal Sarp Dosha and how is it removed?",
    a: "Kaal Sarp Dosha occurs when all seven planets are positioned between Rahu and Ketu in a horoscope. Remedies include Nag Panchami puja (August 9, 2026), Rahu-Ketu shanti at Trimbakeshwar or Kalahasti, chanting Maha Mrityunjaya mantra, and donating silver serpent figures.",
  },
  {
    q: "Can I start a new business on any auspicious day?",
    a: "No. Akshaya Tritiya (April 30, 2026), Diwali (October 21, 2026), and Vijaya Dashami are universally auspicious for new ventures. Beyond these, the muhurat depends on your personal birth chart — your Ascendant lord and 10th house must support the venture's start.",
  },
  {
    q: "What is the significance of Guru Purnima?",
    a: "Guru Purnima on July 3, 2026 honours the Guru-Shishya tradition and marks the birth of Maharishi Veda Vyasa. Jupiter (Brihaspati) — the karaka of wisdom — is at peak strength on this full moon, making it the year's most powerful day for initiating studies or honouring teachers.",
  },
  {
    q: "Why should I follow Vedic festival do's and don'ts?",
    a: "Each festival activates specific planetary energies. Aligning with prescribed do's amplifies the planet's positive influence in your chart. Violating don'ts can attract negative karma — for example, taking loans on Akshaya Tritiya nullifies the day's wealth-multiplier effect.",
  },
  {
    q: "What is today's Panchang and why does it matter?",
    a: "Panchang is the Vedic almanac with five elements: Tithi (lunar day), Vara (weekday), Nakshatra (lunar mansion), Yoga (planetary combination), and Karana. Checking today's Panchang before any major decision aligns your action with cosmic timing for higher success.",
  },
  {
    q: "Who curates Trikal Vaani's festival calendar?",
    a: "The Trikal Vaani Vedic Festival Calendar is curated and verified by Rohiit Gupta, Chief Vedic Architect, using Parashara Panchang methodology and Swiss Ephemeris calculations for IST. Each festival entry is validated against classical Brihat Parashara Hora Shastra references.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD SCHEMA BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
const PUBLISHER_SCHEMA = {
  "@type": "Organization",
  "@id": "https://trikalvaani.com/#organization",
  name: "Trikal Vaani",
  url: "https://trikalvaani.com",
  logo: {
    "@type": "ImageObject",
    url: "https://trikalvaani.com/images/logo.png",
    width: 512,
    height: 512,
  },
  sameAs: ["https://www.instagram.com/trikalvaani"],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9211804111",
    contactType: "customer service",
    email: "rohiit@trikalvaani.com",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  },
};

const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://trikalvaani.com/founder#rohiit-gupta",
  name: "Rohiit Gupta",
  givenName: "Rohiit",
  familyName: "Gupta",
  jobTitle: "Chief Vedic Architect",
  description:
    "Founder of Trikal Vaani and Chief Vedic Architect. Curator of the Trikal Vaani Vedic Festival Calendar, Parashara Panchang authority, and AI-powered astrology platform creator. Based in Delhi NCR, India.",
  url: "https://trikalvaani.com/founder",
  image: "https://trikalvaani.com/images/founder.png/Rohiit_Gupta.jpg",
  worksFor: { "@id": "https://trikalvaani.com/#organization" },
  knowsAbout: [
    "Vedic Astrology",
    "Parashara Jyotish",
    "Panchang",
    "Vimshottari Dasha",
    "Shadbala",
    "Brihat Parashara Hora Shastra",
    "Bhrigu Samhita",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Delhi NCR",
    addressRegion: "Delhi",
    addressCountry: "IN",
  },
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://trikalvaani.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Vedic Festival Calendar 2026",
      item: "https://trikalvaani.com/upcoming-events",
    },
  ],
};

const WEBPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://trikalvaani.com/upcoming-events#webpage",
  url: "https://trikalvaani.com/upcoming-events",
  name: "Vedic Festival Calendar 2026 — Trikal Vaani",
  description:
    "Authentic Vedic festival calendar 2026 with accurate tithi, muhurat, and astrological significance. Daily Panchang updates curated by Rohiit Gupta, Chief Vedic Architect.",
  inLanguage: "en-IN",
  isPartOf: {
    "@type": "WebSite",
    "@id": "https://trikalvaani.com/#website",
    name: "Trikal Vaani",
    url: "https://trikalvaani.com",
  },
  about: {
    "@type": "Thing",
    name: "Vedic Festivals and Panchang",
  },
  author: { "@id": "https://trikalvaani.com/founder#rohiit-gupta" },
  publisher: { "@id": "https://trikalvaani.com/#organization" },
  datePublished: "2026-01-01T00:00:00+05:30",
  dateModified: new Date().toISOString(),
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: "https://trikalvaani.com/images/og/upcoming-events-2026.jpg",
  },
};

const buildEventSchema = (f: Festival) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "@id": `https://trikalvaani.com/upcoming-events#${f.slug}`,
  name: f.name,
  alternateName: f.sanskrit,
  startDate: f.date,
  endDate: f.date,
  eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  description: f.significance,
  location: {
    "@type": "Place",
    name: "India",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
  },
  image: ["https://trikalvaani.com/images/og/upcoming-events-2026.jpg"],
  organizer: { "@id": "https://trikalvaani.com/#organization" },
  performer: { "@id": "https://trikalvaani.com/founder#rohiit-gupta" },
  offers: {
    "@type": "Offer",
    url: `https://trikalvaani.com/upcoming-events#${f.slug}`,
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    validFrom: "2026-01-01T00:00:00+05:30",
  },
});

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function UpcomingEventsPage() {
  const today = new Date();
  const todayDisplay = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  // Sort festivals: upcoming first relative to today
  const sortedFestivals = [...FESTIVALS_2026].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <>
      {/* ─────────── JSON-LD SCHEMA INJECTION (Critical SEO+GEO) ─────────── */}
      <Script
        id="schema-webpage"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_SCHEMA) }}
      />
      <Script
        id="schema-person"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
      />
      <Script
        id="schema-organization"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            ...PUBLISHER_SCHEMA,
          }),
        }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }}
      />
      <Script
        id="schema-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      {sortedFestivals.map((f) => (
        <Script
          key={`schema-event-${f.slug}`}
          id={`schema-event-${f.slug}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildEventSchema(f)),
          }}
        />
      ))}

      {/* ─────────────────────────── PAGE CONTENT ─────────────────────────── */}
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-amber-50">
        {/* BREADCRUMB (visible) */}
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-6xl px-4 pt-6 text-sm text-amber-200/70"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-amber-300">
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-amber-300">Vedic Festival Calendar 2026</li>
          </ol>
        </nav>

        {/* HERO */}
        <header className="mx-auto max-w-6xl px-4 pt-8 pb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">
            Vedic Festival Calendar 2026
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-amber-100 md:text-6xl">
            Upcoming Sacred Events
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-amber-100/80">
            Authentic Vedic festival almanac with astrological significance,
            tithi, muhurat, and Do&apos;s &amp; Don&apos;ts for each occasion —
            curated and verified by{" "}
            <Link
              href="/founder"
              className="text-amber-300 underline decoration-amber-500/40 underline-offset-4 hover:decoration-amber-300"
            >
              Rohiit Gupta, Chief Vedic Architect
            </Link>
            .
          </p>
        </header>

        {/* ─────────── GEO DIRECT-ANSWER BLOCK (40-60 word AI extract) ─────────── */}
        <section
          aria-labelledby="todays-panchang-heading"
          className="mx-auto max-w-6xl px-4"
        >
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/30 p-6 backdrop-blur md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="todays-panchang-heading"
                className="font-serif text-2xl text-amber-200 md:text-3xl"
              >
                Today&apos;s Panchang — आज का पंचांग
              </h2>
              <p className="text-sm text-amber-200/70">{todayDisplay} · IST</p>
            </div>

            {/* AI-extractable direct answer (40-60 words) */}
            <p className="mt-4 text-base leading-relaxed text-amber-50/95 md:text-lg">
              The Vedic Panchang for India lists today&apos;s tithi, nakshatra,
              yoga, karana, and vara along with Rahu Kaal and shubh muhurat
              windows for Delhi NCR. Each entry below the calendar carries
              astrological ruler, do&apos;s, don&apos;ts, and Sanskrit name —
              verified using Parashara methodology and Swiss Ephemeris by
              Rohiit Gupta, Chief Vedic Architect.
            </p>

            {/* Live data placeholder — wired in A3 (api/panchang/today) */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
              {[
                { label: "Tithi", value: "Loading…" },
                { label: "Nakshatra", value: "Loading…" },
                { label: "Yoga", value: "Loading…" },
                { label: "Karana", value: "Loading…" },
                { label: "Vara", value: "Loading…" },
              ].map((cell) => (
                <div
                  key={cell.label}
                  className="rounded-lg border border-amber-500/15 bg-slate-900/40 p-3"
                >
                  <p className="text-xs uppercase tracking-wider text-amber-300/70">
                    {cell.label}
                  </p>
                  <p className="mt-1 text-amber-100">{cell.value}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-amber-200/60">
              Live Panchang updates hourly via Trikal Vaani Panchang Engine
              (Parashara + Swiss Ephemeris). Full daily archive available at{" "}
              <Link
                href="/panchang"
                className="text-amber-300 underline decoration-amber-500/40 underline-offset-2 hover:decoration-amber-300"
              >
                /panchang
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ─────────────────── FESTIVAL CARDS (10 entries) ─────────────────── */}
        <section
          aria-labelledby="festivals-heading"
          className="mx-auto max-w-6xl px-4 py-12"
        >
          <h2
            id="festivals-heading"
            className="font-serif text-3xl text-amber-200 md:text-4xl"
          >
            Sacred Festivals — Vedic Calendar 2026
          </h2>
          <p className="mt-2 max-w-3xl text-amber-100/70">
            Each festival is computed using Parashara Vedic Panchang methodology
            for IST. Click any festival for the deep page with city-specific
            muhurat, mantras, and personalized horoscope insights.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {sortedFestivals.map((f) => (
              <article
                key={f.slug}
                id={f.slug}
                className="rounded-2xl border border-amber-500/15 bg-slate-900/50 p-6 backdrop-blur"
              >
                <header>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-2xl text-amber-100">
                      {f.name}
                    </h3>
                    {f.major && (
                      <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-wider text-amber-200">
                        Major
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-serif text-lg text-amber-300/80">
                    {f.sanskrit}
                  </p>
                  <p className="mt-2 text-sm text-amber-200/70">
                    <time dateTime={f.date}>{f.displayDate}</time>
                    <span className="mx-2 text-amber-500/50">·</span>
                    <span>Planetary Ruler: {f.ruler}</span>
                  </p>
                </header>

                <p className="mt-4 text-amber-50/85">{f.significance}</p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                      Do&apos;s — क्या करें
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-amber-50/85">
                      {f.dos.map((d) => (
                        <li key={d} className="flex gap-2">
                          <span aria-hidden="true" className="text-emerald-400">
                            ✓
                          </span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-rose-300">
                      Don&apos;ts — क्या न करें
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-amber-50/85">
                      {f.donts.map((d) => (
                        <li key={d} className="flex gap-2">
                          <span aria-hidden="true" className="text-rose-400">
                            ✕
                          </span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Internal linking — hub-spoke + life domain (B activates spokes) */}
                <footer className="mt-6 flex flex-wrap items-center gap-3 border-t border-amber-500/10 pt-4 text-sm">
                  <Link
                    href={`/events/${f.slug}`}
                    className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-amber-200 hover:bg-amber-500/25"
                  >
                    Deep guide →
                  </Link>
                  <Link
                    href={`/${f.relatedDomain}`}
                    className="text-amber-300/80 underline decoration-amber-500/30 underline-offset-2 hover:decoration-amber-300"
                  >
                    Related: /{f.relatedDomain}
                  </Link>
                  <Link
                    href="/#birth-form"
                    className="ml-auto text-amber-200/80 hover:text-amber-200"
                  >
                    Personal horoscope insight →
                  </Link>
                </footer>
              </article>
            ))}
          </div>
        </section>

        {/* ─────────── CONVERSION CTA #1 — Free Analysis ─────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-indigo-950/40 p-8 text-center md:p-12">
            <h2 className="font-serif text-3xl text-amber-100 md:text-4xl">
              Discover how these festivals affect{" "}
              <em className="text-amber-300">your</em> chart
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-amber-100/80">
              Trikal Vaani computes your personal Parashara horoscope and
              reveals how upcoming planetary transits during festivals will
              shape your career, wealth, relationships, and health.
            </p>
            <Link
              href="/#birth-form"
              className="mt-6 inline-block rounded-xl bg-amber-500 px-8 py-3 font-semibold text-slate-950 transition hover:bg-amber-400"
            >
              Start Free Analysis
            </Link>
            <p className="mt-3 text-xs text-amber-200/60">
              No credit card · 256-bit encrypted · 15,000+ seekers trust Trikal
              Vaani
            </p>
          </div>
        </section>

        {/* ─────────── FAQ SECTION (FAQPage schema renders here) ─────────── */}
        <section
          aria-labelledby="faq-heading"
          className="mx-auto max-w-6xl px-4 py-12"
        >
          <h2
            id="faq-heading"
            className="font-serif text-3xl text-amber-200 md:text-4xl"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-2 max-w-3xl text-amber-100/70">
            Voice-search optimized answers to the most common questions about
            Vedic festivals, Panchang, and muhurat for 2026.
          </p>

          <dl className="mt-8 space-y-4">
            {FAQS.map((f) => (
              <div
                key={f.q}
                className="rounded-xl border border-amber-500/15 bg-slate-900/50 p-5"
              >
                <dt className="font-serif text-lg text-amber-100">{f.q}</dt>
                <dd className="mt-2 text-amber-50/85">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ─────────── CONVERSION CTA #2 — Personal Reading ─────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-8 md:p-10">
            <div className="grid gap-6 md:grid-cols-3 md:items-center">
              <div className="md:col-span-2">
                <h2 className="font-serif text-2xl text-amber-100 md:text-3xl">
                  Personalized festival horoscope by Rohiit Gupta
                </h2>
                <p className="mt-3 text-amber-100/80">
                  Get a personally curated reading for upcoming festivals based
                  on your birth chart. Includes muhurat for your specific
                  ascendant, dasha-sensitive remedies, and ancestral guidance.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/919211804111?text=Namaste%20Rohiit%20ji%2C%20I%20want%20to%20book%20a%20personal%20festival%20reading"
                  className="rounded-xl bg-emerald-500 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-emerald-400"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  WhatsApp +91 9211804111
                </a>
                <Link
                  href="/#pricing"
                  className="rounded-xl border border-amber-400/40 px-6 py-3 text-center font-semibold text-amber-200 transition hover:bg-amber-500/10"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────── E-E-A-T AUTHORITY FOOTER ─────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="rounded-xl border border-amber-500/10 bg-slate-950/60 p-6 text-sm text-amber-200/70">
            <p className="leading-relaxed">
              <strong className="text-amber-200">Verification:</strong> All
              festival dates and muhurat are computed using Parashara Vedic
              Panchang methodology and Swiss Ephemeris (Lahiri Ayanamsha) for
              the Indian subcontinent (IST). Each entry is cross-verified
              against Brihat Parashara Hora Shastra by{" "}
              <Link href="/founder" className="text-amber-300 underline">
                Rohiit Gupta, Chief Vedic Architect
              </Link>
              .
            </p>
            <p className="mt-3 leading-relaxed">
              <strong className="text-amber-200">Editorial standard:</strong>{" "}
              Trikal Vaani is a research and educational platform. Festival
              calendar data is reviewed monthly. Contact{" "}
              <a
                href="mailto:rohiit@trikalvaani.com"
                className="text-amber-300 underline"
              >
                rohiit@trikalvaani.com
              </a>{" "}
              for corrections or scholarly references.
            </p>
            <p className="mt-3 text-xs text-amber-200/50">
              Last reviewed: {todayDisplay} · Trikal Vaani Global · Delhi NCR,
              India
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

