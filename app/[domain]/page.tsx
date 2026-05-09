/**
 * ============================================================
 * TRIKAL VAANI — Upcoming Sacred Events & Festival Calendar
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/upcoming-events/page.tsx
 * VERSION: v2.1 — Canonical Fix
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import type { Metadata } from 'next';
import Link from 'next/link';

// ── Metadata with CORRECT canonical ──────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Upcoming Vedic Festivals 2026 — Sacred Event Calendar | Trikal Vaani',
  description:
    "Complete Vedic festival calendar 2026 with astrological significance, planetary rulers, and Do's & Don'ts for each sacred occasion. Curated by Rohiit Gupta, Chief Vedic Architect.",
  keywords: [
    'vedic festival calendar 2026',
    'hindu festival astrology',
    'upcoming auspicious dates india',
    'panchang 2026',
    'festival muhurta',
    'navratri diwali chhath puja astrology',
    'vedic calendar delhi',
    'rohiit gupta astrology festivals',
  ],
  authors: [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com/founder' }],
  alternates: {
    canonical: 'https://trikalvaani.com/upcoming-events',
    languages: {
      en: 'https://trikalvaani.com/upcoming-events',
      hi: 'https://trikalvaani.com/hi/upcoming-events',
    },
  },
  openGraph: {
    title: 'Upcoming Vedic Festivals 2026 | Trikal Vaani',
    description:
      'Complete Vedic festival calendar with astrological significance, planetary rulers, and Do\'s & Don\'ts. By Rohiit Gupta, Chief Vedic Architect.',
    url: 'https://trikalvaani.com/upcoming-events',
    siteName: 'Trikal Vaani',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upcoming Vedic Festivals 2026 | Trikal Vaani',
    description: 'Complete Vedic festival calendar with astrological significance.',
    site: '@trikalvaani',
    creator: '@trikalvaani',
  },
};

// ── Festival Data ─────────────────────────────────────────────────────────────
const festivals = [
  {
    name: 'Akshaya Tritiya',
    hindi: 'अक्षय तृतीया',
    date: 'Apr 30, 2026',
    planet: 'Venus + Sun',
    type: 'Major',
    description:
      'Most auspicious day of the year for new beginnings. Akshaya means "never diminishing" — any action started today is blessed with eternal growth. Gold purchases, property deals, and new ventures carry divine backing.',
    dos: [
      'Buy gold or silver',
      'Start a new business or project',
      'Donate to the needy (annadaan)',
      'Perform ancestral rituals (pitru tarpan)',
      'Begin spiritual practice or mantra sadhana',
    ],
    donts: [
      'Avoid conflicts or ego clashes',
      'Do not take loans on this day',
      'Avoid non-vegetarian food',
      'Do not speak harshly to parents or elders',
    ],
  },
  {
    name: 'Buddha Purnima',
    hindi: 'बुद्ध पूर्णिमा',
    date: 'May 12, 2026',
    planet: 'Moon (Full)',
    type: 'Major',
    description:
      'The full moon of Vaishakha marks the birth, enlightenment, and Mahaparinirvana of Gautama Buddha. Purnima energy amplifies compassion, forgiveness, and spiritual receptivity.',
    dos: [
      'Meditate and practice silence (mouna)',
      'Donate food and clothes to the poor',
      'Light ghee diyas at home and temples',
      'Chant peace mantras and Om',
      'Fast if health permits',
    ],
    donts: [
      'Avoid arguments and negative speech',
      'Do not consume alcohol or intoxicants',
      'Avoid starting new ventures (wait 24 hours)',
      'Do not harbour resentment',
    ],
  },
  {
    name: 'Nirjala Ekadashi',
    hindi: 'निर्जला एकादशी',
    date: 'Jun 7, 2026',
    planet: 'Jupiter',
    type: 'Major',
    description:
      'The most rigorous of all 24 Ekadashis — a full waterless fast. Observing this single Ekadashi is said to grant the merit of all 24 Ekadashis combined. Jupiter\'s grace for wealth, wisdom, and progeny is activated.',
    dos: [
      'Fast completely (nirjala — no water, for the devout)',
      'Recite Vishnu Sahasranama',
      'Donate yellow cloth, turmeric, and gram dal',
      'Stay awake all night in devotion (jaagaran)',
      'Perform Tulsi puja',
    ],
    donts: [
      'Avoid rice and grains',
      'Do not cut hair or nails',
      'Avoid sensual pleasures',
      'Do not sleep during the day',
    ],
  },
  {
    name: 'Guru Purnima',
    hindi: 'गुरु पूर्णिमा',
    date: 'Jul 3, 2026',
    planet: 'Jupiter (Brihaspati)',
    type: 'Major',
    description:
      'The sacred day to honour the Guru-Shishya tradition. Vyasa Purnima — birth of Maharishi Veda Vyasa. Jupiter\'s blessings for knowledge, wisdom, and spiritual lineage are at their annual peak.',
    dos: [
      'Honour your teacher, mentor, or guru',
      'Read Guru Gita or Bhagavad Gita',
      'Donate books and educational materials',
      'Begin a new course of study',
      'Perform pada puja of an elder',
    ],
    donts: [
      'Avoid ego and self-importance',
      'Do not disrespect any teacher figure',
      'Avoid indulgent entertainment',
      'Do not break a promise made to a mentor',
    ],
  },
  {
    name: 'Nag Panchami',
    hindi: 'नाग पंचमी',
    date: 'Aug 9, 2026',
    planet: 'Rahu + Ketu',
    type: '',
    description:
      'The festival of serpent deities (Nag Devata), symbolising the Rahu-Ketu karmic axis. Propitiating the Nag Devata on this day removes Kaal Sarp Dosha and past-life serpent curses from the horoscope.',
    dos: [
      'Offer milk to snake idols or anthills',
      'Perform Rahu-Ketu shanti puja',
      'Fast and pray for family protection',
      'Chant "Om Namah Shivaya" 108 times',
      'Feed Brahmins',
    ],
    donts: [
      'Never harm a snake today (or any day)',
      'Avoid ploughing soil or digging',
      'Do not fry food in oil (avoid fire rituals)',
      'Avoid conflict with brothers and sisters',
    ],
  },
  {
    name: 'Janmashtami',
    hindi: 'जन्माष्टमी',
    date: 'Aug 28, 2026',
    planet: 'Moon (8th Tithi)',
    type: 'Major',
    description:
      'The birth of Lord Sri Krishna — the complete avatar of Vishnu. The Ashtami of Krishna Paksha in Bhadrapada month. Midnight celebration of divine love, wisdom, and cosmic protection.',
    dos: [
      'Fast until midnight and break it after Krishna\'s birth',
      'Sing bhajans and recite Bhagavad Gita',
      'Decorate the cradle (Jhula) of Bal Krishna',
      'Feed 8 children (representing the 8 Ashtami)',
      'Prepare panchamrit and offer to the deity',
    ],
    donts: [
      'Avoid non-vegetarian food',
      'Do not consume alcohol',
      'Avoid sleeping before midnight puja',
      'Do not show greed or dishonesty today',
    ],
  },
  {
    name: 'Pitru Paksha Begins',
    hindi: 'पितृ पक्ष प्रारम्भ',
    date: 'Sep 17, 2026',
    planet: 'Saturn + Sun',
    type: '',
    description:
      '15-day period for ancestral propitiation (Shraddha). Saturn governs karma and ancestry. Performing tarpan during this period resolves ancestral debts that block wealth, marriage, and progeny in your chart.',
    dos: [
      'Perform daily tarpan for ancestors',
      'Donate food, clothing, and money in their name',
      'Cook their favourite foods as offering',
      'Visit sacred rivers for ritual bathing',
      'Chant Pitru Stotram',
    ],
    donts: [
      'Avoid auspicious ceremonies (weddings, griha pravesh)',
      'Do not purchase new clothes or jewellery',
      'Avoid celebrating birthdays during this period',
      'Do not waste food',
    ],
  },
  {
    name: 'Navratri (Sharad) Begins',
    hindi: 'शारदीय नवरात्रि',
    date: 'Oct 2, 2026',
    planet: 'Moon + Venus',
    type: 'Major',
    description:
      'Nine nights of the Divine Mother (Durga, Lakshmi, Saraswati). The most powerful period for feminine energy, wealth manifestation, and spiritual awakening. The veil between worlds is thinnest during Navratri.',
    dos: [
      'Fast and observe purity',
      'Perform Devi puja with red flowers',
      'Recite Durga Saptashati (700 shlokas)',
      'Light an Akhand Jyoti (unbroken flame)',
      'Begin new positive habits (vratas)',
    ],
    donts: [
      'Avoid non-veg, alcohol, and tamasic food',
      'Do not cut hair during the 9 days',
      'Avoid sexual activity if observing strict vrata',
      "Do not speak ill of women — Shakti is everywhere",
    ],
  },
  {
    name: 'Diwali — Lakshmi Puja',
    hindi: 'दीपावली — लक्ष्मी पूजा',
    date: 'Oct 21, 2026',
    planet: 'Venus + Jupiter',
    type: 'Major',
    description:
      'The festival of light and the supreme night for Lakshmi Puja. The new moon of Kartika month — Venus and Jupiter aligned for maximum wealth manifestation. Every diya lit invites Lakshmi\'s permanent residence.',
    dos: [
      'Perform Lakshmi-Ganesha puja at midnight',
      'Light oil diyas in every corner of the home',
      'Open business ledgers (Chopda Puja)',
      'Donate to the poor before puja',
      'Buy gold, silver, or new utensils',
    ],
    donts: [
      'Do not gamble beyond symbolic tradition',
      'Avoid loud quarrels during puja time',
      'Do not leave the house dark at night',
      'Avoid debt on this day — repay instead',
    ],
  },
  {
    name: 'Chhath Puja',
    hindi: 'छठ पूजा',
    date: 'Nov 5, 2026',
    planet: 'Sun (Surya)',
    type: '',
    description:
      'The ancient solar festival of Bihar — the only Vedic puja performed to the setting and rising sun. Surya\'s direct blessing for health, vitality, and divine light. One of the most austere and powerful Vedic observances.',
    dos: [
      'Offer arghya to setting sun (Sandhya Arghya)',
      'Offer arghya to rising sun next morning',
      'Fast for 36 hours (nirjala for the devout)',
      'Prepare thekua and fresh fruit offerings',
      'Bathe in river or natural water body',
    ],
    donts: [
      'Avoid any impurity or negative speech',
      'Do not use onion, garlic in prasad',
      'Avoid synthetic clothing during the puja',
      'Do not disrespect the sun at any time',
    ],
  },
];

// ── JSON-LD Schemas ────────────────────────────────────────────────────────────
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Upcoming Vedic Events',
      item: 'https://trikalvaani.com/upcoming-events',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are the most important Vedic festivals in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most important Vedic festivals in 2026 include Akshaya Tritiya (Apr 30), Guru Purnima (Jul 3), Navratri Sharad (Oct 2), Diwali Lakshmi Puja (Oct 21), and Chhath Puja (Nov 5). Each carries specific astrological significance based on planetary positions and Panchang methodology.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Vedic astrology determine auspicious festival dates?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vedic festival dates are determined through Panchang — the five elements of Vedic timekeeping: Tithi (lunar day), Vara (weekday), Nakshatra (lunar mansion), Yoga (planetary combination), and Karana (half-day). Rohiit Gupta uses Swiss Ephemeris and Parashara Vedic Panchang methodology for all festival date calculations at Trikal Vaani.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the significance of Akshaya Tritiya in Vedic astrology?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Akshaya Tritiya (the third lunar day of Vaishakha Shukla Paksha) is considered one of the three self-illuminated auspicious days in Vedic astrology that require no Muhurta calculation. Venus and Sun conjunction on this day creates maximum abundance energy. Any purchase, investment, or new beginning on this day is blessed with eternal (akshaya — never diminishing) results.',
      },
    },
    {
      '@type': 'Question',
      name: 'How should one perform Pitru Paksha rituals according to Vedic tradition?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pitru Paksha rituals (Shraddha) should be performed during the 15-day Krishna Paksha period in Bhadrapada month. Daily Tarpan (offering water mixed with sesame and kusha grass) should be offered to ancestors facing south. Brahmin feeding and donation of food, clothes, and money in ancestors\' names fulfills the Pitru Rina (ancestral debt). Mahalaya Amavasya (last day) is the most important date for those who do not know their ancestors\' death dates.',
      },
    },
  ],
};

const eventSchemas = festivals.map((f) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `${f.name} (${f.hindi}) — Vedic Festival 2026`,
  startDate: f.date,
  description: f.description,
  organizer: {
    '@type': 'Person',
    name: 'Rohiit Gupta',
    jobTitle: 'Chief Vedic Architect',
    url: 'https://trikalvaani.com/founder',
  },
  location: {
    '@type': 'VirtualLocation',
    url: 'https://trikalvaani.com/upcoming-events',
  },
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
}));

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Rohiit Gupta',
  jobTitle: 'Chief Vedic Architect',
  url: 'https://trikalvaani.com/founder',
  worksFor: { '@type': 'Organization', name: 'Trikal Vaani', url: 'https://trikalvaani.com' },
  knowsAbout: ['Vedic Astrology', 'Panchang', 'Jyotish Shastra', 'BPHS', 'Swiss Ephemeris'],
  address: { '@type': 'PostalAddress', addressRegion: 'Delhi NCR', addressCountry: 'IN' },
};

// ── Page Component ────────────────────────────────────────────────────────────
export default function UpcomingEventsPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      {eventSchemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="min-h-screen" style={{ background: '#080B12', color: '#e2e8f0' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: '#D4AF37' }}>Upcoming Events</span>
          </nav>

          {/* GEO Direct Answer Block (40-60 words) */}
          <div className="rounded-xl p-4 mb-8"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-xs text-amber-500 font-semibold mb-2 uppercase tracking-wider">Vedic Astrology Answer</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              In 2026, the most auspicious Vedic festivals include Akshaya Tritiya (Apr 30, Venus+Sun), Guru Purnima (Jul 3, Jupiter), Navratri (Oct 2, Moon+Venus), and Diwali Lakshmi Puja (Oct 21, Venus+Jupiter). Each date is computed using Parashara Vedic Panchang methodology and Swiss Ephemeris by Rohiit Gupta, Chief Vedic Architect, Trikal Vaani.
            </p>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs text-amber-500 font-semibold uppercase tracking-widest mb-2">Vedic Festival Almanac</p>
            <h1 className="text-3xl font-bold text-white mb-3">Upcoming Sacred Events</h1>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Vedic festival almanac with astrological significance, Do&apos;s &amp; Don&apos;ts for each occasion — curated by Rohiit Gupta, Chief Vedic Architect.
            </p>
          </div>

          {/* Festival Cards */}
          <div className="space-y-6 mb-12">
            {festivals.map((festival, index) => (
              <article key={index} className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>

                {/* Card Header */}
                <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h2 className="text-lg font-bold text-white">{festival.name}</h2>
                        <span className="text-slate-400 text-sm">({festival.hindi})</span>
                        {festival.type === 'Major' && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                            Major
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{festival.date}</span>
                        <span>·</span>
                        <span>Planetary Ruler: {festival.planet}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mt-3">{festival.description}</p>
                </div>

                {/* Do's and Don'ts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                  <div className="p-4" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs font-semibold text-green-400 mb-2">Do&apos;s — क्या करें</p>
                    <ul className="space-y-1">
                      {festival.dos.map((item, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-red-400 mb-2">Don&apos;ts — क्या न करें</p>
                    <ul className="space-y-1">
                      {festival.donts.map((item, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* FAQ Section */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions — Vedic Festival Calendar</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'What are the most important Vedic festivals in 2026?',
                  a: 'The most important Vedic festivals in 2026 include Akshaya Tritiya (Apr 30), Guru Purnima (Jul 3), Navratri Sharad (Oct 2), Diwali Lakshmi Puja (Oct 21), and Chhath Puja (Nov 5). Each carries specific astrological significance based on planetary positions and Panchang methodology.',
                },
                {
                  q: 'How does Vedic astrology determine auspicious festival dates?',
                  a: 'Vedic festival dates are determined through Panchang — the five elements of Vedic timekeeping: Tithi (lunar day), Vara (weekday), Nakshatra (lunar mansion), Yoga (planetary combination), and Karana (half-day). Rohiit Gupta uses Swiss Ephemeris and Parashara Vedic Panchang methodology for all festival date calculations.',
                },
                {
                  q: 'What is the significance of Akshaya Tritiya in Vedic astrology?',
                  a: 'Akshaya Tritiya is one of three self-illuminated auspicious days in Vedic astrology requiring no Muhurta calculation. Venus and Sun conjunction creates maximum abundance energy. Any purchase, investment, or new beginning on this day is blessed with eternal (akshaya — never diminishing) results.',
                },
                {
                  q: 'How should one perform Pitru Paksha rituals?',
                  a: 'Pitru Paksha rituals (Shraddha) should be performed during the 15-day Krishna Paksha period in Bhadrapada. Daily Tarpan (water with sesame and kusha grass) facing south, Brahmin feeding, and donation in ancestors\' names fulfills Pitru Rina. Mahalaya Amavasya is most important for those uncertain of ancestors\' death dates.',
                },
              ].map((faq, i) => (
                <div key={i} className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 className="text-sm font-semibold text-white flex items-start gap-2">
                      <span style={{ color: '#D4AF37', flexShrink: 0 }}>Q.</span>
                      {faq.q}
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>A.</span>
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Note */}
          <p className="text-xs text-slate-600 text-center mb-8">
            Festival dates computed using Parashara Vedic Panchang methodology for the Indian subcontinent (IST). Verified and curated by Rohiit Gupta, Chief Vedic Architect.
          </p>

          {/* CTA */}
          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))', border: '1px solid rgba(212,175,55,0.25)' }}>
            <div className="text-3xl mb-3">🔱</div>
            <h2 className="text-xl font-bold text-white mb-2">Get Your Personal Festival Timing Reading</h2>
            <p className="text-sm text-slate-400 mb-5">
              Know which festival is most powerful for YOUR chart.<br />
              Swiss Ephemeris + BPHS analysis by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
            </p>
            <Link href="/#birth-form"
              className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}>
              Start Free Analysis 🔱
            </Link>
            <p className="text-xs text-slate-600 mt-3">No credit card. Instant results. Trusted by thousands across India.</p>
          </div>

        </div>
      </div>
    </>
  );
}
