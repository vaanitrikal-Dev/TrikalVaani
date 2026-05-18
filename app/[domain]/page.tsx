/**
 * ============================================================
 * TRIKAL VAANI — SEO Domain Pages Generator
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/[domain]/page.tsx (template for all 15 domains)
 * VERSION: 2.3 — Full Session E (Pillar Authority Upgrade)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v2.2 → v2.3 CHANGES (2026-05-18):
 *   E1 (already in v2.1): Title.absolute fix for all 15 domains
 *   E2 (already in v2.2): HowTo schema added (5th schema per page)
 *   E3 (NEW v2.3): Calculator internal links per domain
 *           - CALCULATOR_LINKS map for all 15 domains
 *           - 3 most relevant calculators linked per domain
 *           - "Related Free Calculators" section above "Explore Domains"
 *           - Strengthens hub-spoke SEO architecture
 *   E4 PARTIAL (NEW v2.3): 5 domains expanded to 1000-1100 words
 *           - career (1042 words) — BPHS Ch 25, 35, 38 + Phaladeepika, Saravali
 *           - wealth (1034 words) — BPHS Ch 39, 32 Dhana Yogas, Lakshmi/Kubera
 *           - health (1089 words) — BPHS Ch 66, Tridosha analysis, Sade Sati
 *           - relationships (1098 words) — BPHS Ch 24, D9 Navamsa, Ashtakoot
 *           - family (1098 words) — BPHS Ch 19/22/26, Pitru Dosha, 4th/5th/9th
 *
 * PENDING FOR FUTURE SESSIONS:
 *   - Session 2: Expand domains 6-10 (education, home, legal, travel, spirituality)
 *   - Session 3: Expand domains 11-15 (wellbeing, marriage, business,
 *                foreign-settlement, digital-career)
 *
 * UNTOUCHED FROM v2.2:
 *   - 10 domains keep original ~250 word content (career-family expanded)
 *   - All FAQs (75 total) preserved
 *   - All 5 schema blocks (Breadcrumb, Article, FAQ, Service, HowTo)
 *   - RESERVED_SLUGS guard
 *   - UI/JSX structure
 *   - ISR (revalidate = 86400)
 *
 * DOMAINS COVERED (15):
 * Original 11: career, wealth, health, relationships, family, education,
 *              home, legal, travel, spirituality, wellbeing
 * Plus 4: marriage, business, foreign-settlement, digital-career
 * ============================================================
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 86400;

const RESERVED_SLUGS = [
  'upcoming-events', 'panchang', 'events', 'blog', 'services',
  'report', 'result', 'founder', 'pricing', 'privacy', 'refund',
  'terms', 'contact', 'about', 'my-cosmic-records', 'hi',
  'calculators', 'api',
];

// ⬇ SESSION E3: Domain-to-Calculator Mapping for Hub-Spoke Internal SEO
// Each domain links to its 3 most relevant free calculators
// Strengthens internal link equity flow + improves topical authority
const CALCULATOR_LINKS: Record<string, { slug: string; name: string; emoji: string }[]> = {
  career: [
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-lagna-calculator',     name: 'Lagna Calculator',     emoji: '🌅' },
  ],
  wealth: [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
    { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator', emoji: '🪐' },
  ],
  health: [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator', emoji: '🪐' },
    { slug: 'free-nakshatra-calculator', name: 'Nakshatra Calculator', emoji: '⭐' },
  ],
  relationships: [
    { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh',       emoji: '♂' },
    { slug: 'free-kundali-calculator',      name: 'Kundali Calculator', emoji: '🪔' },
    { slug: 'free-nakshatra-calculator',    name: 'Nakshatra Calculator', emoji: '⭐' },
  ],
  family: [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-rashi-calculator',     name: 'Rashi Calculator',     emoji: '♉' },
    { slug: 'free-nakshatra-calculator', name: 'Nakshatra Calculator', emoji: '⭐' },
  ],
  education: [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-nakshatra-calculator', name: 'Nakshatra Calculator', emoji: '⭐' },
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
  ],
  home: [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
    { slug: 'free-rashi-calculator',     name: 'Rashi Calculator',     emoji: '♉' },
  ],
  legal: [
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator', emoji: '🪐' },
  ],
  travel: [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-rashi-calculator',     name: 'Rashi Calculator',     emoji: '♉' },
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
  ],
  spirituality: [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-nakshatra-calculator', name: 'Nakshatra Calculator', emoji: '⭐' },
    { slug: 'free-lagna-calculator',     name: 'Lagna Calculator',     emoji: '🌅' },
  ],
  wellbeing: [
    { slug: 'free-nakshatra-calculator', name: 'Nakshatra Calculator', emoji: '⭐' },
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator', emoji: '🪐' },
  ],
  marriage: [
    { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh',       emoji: '♂' },
    { slug: 'free-kundali-calculator',      name: 'Kundali Calculator', emoji: '🪔' },
    { slug: 'free-nakshatra-calculator',    name: 'Nakshatra Calculator', emoji: '⭐' },
  ],
  business: [
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-rashi-calculator',     name: 'Rashi Calculator',     emoji: '♉' },
  ],
  'foreign-settlement': [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
    { slug: 'free-lagna-calculator',     name: 'Lagna Calculator',     emoji: '🌅' },
  ],
  'digital-career': [
    { slug: 'free-kundali-calculator',   name: 'Kundali Calculator',   emoji: '🪔' },
    { slug: 'free-dasha-calculator',     name: 'Dasha Calculator',     emoji: '⏳' },
    { slug: 'free-nakshatra-calculator', name: 'Nakshatra Calculator', emoji: '⭐' },
  ],
};

interface DomainPageConfig {
  slug:          string;
  title:         string;
  h1:            string;
  geoAnswer:     string;
  description:   string;
  planet:        string;
  house:         string;
  bphsRef:       string;
  content:       string;
  faqs:          { q: string; a: string }[];
  ctaText:       string;
  icon:          string;
  keywords:      string[];
}

const DOMAIN_PAGES: Record<string, DomainPageConfig> = {

  career: {
    slug:    'career',
    icon:    '📈',
    title:   'Career Astrology — Vedic Kundali Career Prediction | Trikal Vaani',
    h1:      'Career & Profession in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris-powered Vedic analysis by Rohiit Gupta, career destiny is revealed through the 10th house (Karma Bhava), its lord, and Saturn\'s position. BPHS states that 10th lord in Kendra or Trikona creates strong career yoga. Get your personalized career reading at trikalvaani.com.',
    description: 'Discover your career destiny through Vedic astrology. Swiss Ephemeris-powered 10th house analysis by Rohiit Gupta, Chief Vedic Architect. BPHS-based career predictions for Delhi NCR and India.',
    planet: 'Saturn & Sun',
    house:  '10th House (Karma Bhava)',
    bphsRef:'BPHS Chapter 25 — Karma Bhava Phala',
    content: `The 10th house in Vedic astrology, known as Karma Bhava (the house of action and worldly mission), stands as the supreme indicator of career destiny, public recognition, and professional dharma. According to Brihat Parashara Hora Shastra (BPHS) Chapter 25 — Karma Bhava Phala, Maharishi Parashar establishes that the 10th lord, planets occupying it, and planets aspecting it together determine the native's career path with remarkable precision.

Saturn (Shani) — Master of Career & Discipline

Saturn is the primary Karaka of the 10th house and the planet of structure, perseverance, and long-term effort. When Saturn occupies its own signs Makar (Capricorn) or Kumbh (Aquarius) in the 10th house, it creates Sasa Mahapurusha Yoga — one of the five Pancha Mahapurusha Yogas defined in BPHS Chapter 35. Natives with this yoga rise to positions of authority through sustained effort, becoming leaders in institutions, government, judiciary, or large enterprises. A weak or afflicted Saturn can create career delays, repeated obstacles, or stagnation — but Saturn always rewards consistent effort eventually. Saturn in the 6th house gives fighting spirit in workplace politics; Saturn in the 12th creates karmic service roles, foreign employment, or behind-the-scenes positions.

Sun (Surya) — Authority & Government

The Sun represents the soul's authority and the highest forms of professional recognition. According to Phaladeepika Chapter 14, a strong Sun in the 10th house — especially exalted in Mesha (Aries) or in its own sign Singh (Leo) — creates natural leaders, government officials, administrators, and self-made authority figures. Sun Mahadasha (6 years) often brings promotions, government recognitions, or major career shifts. When the Sun joins Mercury in the 10th, it creates Budha-Aditya Yoga — powerful for intellectual professions like writing, journalism, law, and academic leadership.

Rahu — Modern, Unconventional Career

Rahu in the 10th house creates a distinctly modern professional path. Saravali Chapter 33 describes Rahu in the 10th as giving unorthodox but powerful career success. This placement is highly favorable for technology entrepreneurs, foreign company employees, mass media professionals, and pioneers in disruptive industries. Rahu's Mahadasha (18 years) often coincides with sudden career rises, viral fame, or unconventional professional success — but requires ethical anchoring to prevent the dramatic falls Rahu can also bring.

Atmakaraka — Soul's Career Mission

In Jaimini Astrology, the Atmakaraka (planet with the highest degree in the chart) reveals the soul's true career mission. When the Atmakaraka occupies or aspects the 10th house from the Karakamsa Lagna, the native experiences deep alignment between work and soul purpose. The D10 Dasamsa divisional chart further refines career analysis — its Lagna, its 10th house, and the placement of the Atmakaraka in D10 together determine specific professional roles, leadership capacity, and recognition timing.

Vimshottari Dasha — The Career Timing Engine

The Vimshottari Dasha system provides the most precise timing for career events. Each planet rules a Mahadasha of fixed years (Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17 — total 120 years). When the 10th lord's Mahadasha or Antardasha is active, career events accelerate. Pratyantar Dasha (Level 3 sub-period) provides 3-7 day precision windows for specific events like job offers, promotions, interviews, or business launches — a precision level most modern astrology apps fail to deliver because they stop at Antardasha (month-level accuracy).

Career Yogas Worth Knowing

Several classical Yogas indicate exceptional career success:
Raj Yoga: Lords of Kendra (1, 4, 7, 10) and Trikona (1, 5, 9) houses conjoin, exchange, or aspect — creating elevated career destiny with authority and respect (BPHS Chapter 38).
Amala Yoga: A benefic planet (Jupiter, Venus, or unafflicted Mercury) in the 10th from Lagna or Moon creates spotless reputation and lasting fame (Phaladeepika Chapter 7).
Sasa Mahapurusha Yoga: Saturn in own/exalted sign in a Kendra.
10th Lord in 11th House: Career directly generates income — strongest indicator of profitable employment (Jataka Parijata).
Budha-Aditya Yoga: Sun-Mercury together in 10th creates intellectual leadership.

Modern Career Indicators

Adapting classical Vedic principles to contemporary careers:
IT and Software: Mercury + Rahu combination, especially in 3rd, 5th, or 10th house
Finance and Banking: Strong 2nd and 11th houses with Mercury and Jupiter
Medicine: Mars or Sun in 6th house, often with Jupiter aspect
Law and Legal Services: Jupiter strong in 9th or 10th, often with Mercury aspect
Government Service: Strong Sun, especially in 10th house or 6th house
Creative Arts and Media: Venus strong in 3rd, 5th, or 10th house with Mercury support
Foreign Career: Rahu, 12th house, or 9th house involvement with 10th house

When Career Stalls — Vedic Diagnosis

When a native experiences persistent career stagnation, the diagnostic hierarchy is:
First, check the current Dasha lord and whether it is favorable for career.
Second, examine Saturn's transit position — Ashtama Shani (Saturn transit over 8th house from natal Moon) creates 2.5 years of career restructuring.
Third, identify Sade Sati phase if applicable — the middle phase causes maximum career upheaval.
Fourth, review the D10 Dasamsa for divisional career insights.
Fifth, check Pratyantar Dasha for short-term blocked windows.

Classical Career Remedies

Trikal Vaani recommends BPHS-sanctioned remedies based on the afflicted planet:
Saturn: Donate black sesame and mustard oil on Saturdays; recite Shani Stotra; offer water to Peepal tree.
Sun: Surya Namaskar at sunrise; donate wheat on Sundays; recite Aditya Hridaya Stotra.
Mercury: Donate green moong dal on Wednesdays; recite Budh Beej Mantra; emerald with expert consultation.
Jupiter: Yellow cloth donation on Thursdays; recite Guru mantra; serve teachers and elders.
Rahu: Donate to disadvantaged; recite Rahu Beej Mantra; charity to charitable institutions.

Get Your Personalized Career Analysis

Trikal Vaani's Swiss Ephemeris-powered analysis applies all these classical principles — 10th lord strength, Saturn placement, Vimshottari Dasha periods, Pratyantar precision timing, classical Yoga detection, and Atmakaraka analysis — to deliver a complete career roadmap personalized to your exact birth time and place. Begin with our free Dasha Calculator to identify your current career period, or get the full reading by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.

Career Across Life Stages

Vedic astrology recognizes that career destiny unfolds in distinct phases. The first major career period typically activates between ages 22-30 during the Saturn return or Jupiter Mahadasha onset. Mid-career transformations (ages 30-45) often coincide with Mars-Saturn dynamics or the Mahadasha of the 10th lord. Late-career fulfillment and legacy building (45+) is shaped by Jupiter's wisdom phase and Saturn's deserved rewards. Each phase has its own karmic signature that the natal chart reveals with precision.`,
    faqs: [
      {
        q: 'Which planet is most important for career in Vedic astrology?',
        a: 'Saturn (Shani) is the primary career significator in Vedic astrology. As Ayushkaraka and karaka of discipline and masses, Saturn\'s placement in the 10th house or its Dasha period determines career milestones. Sun represents authority and leadership, while Rahu amplifies ambition in modern professions like technology and media.',
      },
      {
        q: 'What is the 10th house in Vedic astrology?',
        a: 'The 10th house, called Karma Bhava in Sanskrit, is the primary house of career, profession, public recognition, and authority. According to BPHS Chapter 25, planets placed in the 10th house or aspecting it directly influence one\'s professional life, success, and public standing.',
      },
      {
        q: 'How does Vimshottari Dasha predict career changes?',
        a: 'Vimshottari Dasha gives precise career timing. Jupiter Mahadasha (16 years) brings expansion and recognition. Saturn Dasha (19 years) tests then rewards with stability. Rahu Dasha (18 years) brings rapid unconventional rise. Pratyantar Dasha gives specific 3-7 day windows for job changes, promotions, and business decisions.',
      },
      {
        q: 'Which Yoga in Vedic astrology gives career success?',
        a: 'Several Yogas predict career success: Raj Yoga (Kendra and Trikona lord conjunction), Sasa Mahapurusha Yoga (Saturn in own/exalted sign in Kendra), Amala Yoga (benefic in 10th from Lagna or Moon), and 10th lord in 11th house (career directly generates income). These are analyzed from BPHS classical texts.',
      },
      {
        q: 'Can Vedic astrology predict the right profession?',
        a: 'Yes. The 10th house lord\'s sign, the strongest planet in the chart, and the Atmakaraka (soul significator) together reveal the native\'s natural professional direction. Mercury-dominant charts excel in communication and IT. Mars-dominant in engineering and military. Jupiter in education and law. Venus in arts, luxury, and hospitality.',
      },
    ],
    ctaText: 'Get Your Career Prediction',
    keywords: ['career astrology', 'vedic career prediction', 'kundali career reading', '10th house astrology', 'job prediction astrology india', 'career jyotish delhi'],
  },

  wealth: {
    slug:    'wealth',
    icon:    '💰',
    title:   'Wealth Astrology — Dhana Yoga & Financial Prediction | Trikal Vaani',
    h1:      'Wealth & Finance in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, wealth is determined by the 2nd house (Dhana Bhava), 11th house (Labha), and Jupiter\'s strength. BPHS Chapter 39 defines Dhana Yoga as 2nd and 11th lords combining. Get your wealth prediction at trikalvaani.com.',
    description: 'Discover wealth yogas and financial destiny in your Kundali. Swiss Ephemeris 2nd house and 11th house analysis. Dhana Yoga detection by Rohiit Gupta, Chief Vedic Architect.',
    planet: 'Jupiter & Venus',
    house:  '2nd House (Dhana Bhava) + 11th House (Labha)',
    bphsRef:'BPHS Chapter 39 — Dhana Yoga',
    content: `Wealth in Vedic astrology is governed primarily by three houses working in concert: the 2nd house (Dhana Bhava — accumulated wealth, savings, family assets), the 11th house (Labha Bhava — income, gains, fulfillment of desires), and Jupiter (Guru) as the natural Karaka of abundance and prosperity. According to Brihat Parashara Hora Shastra (BPHS) Chapter 39 — Dhana Yoga Adhyaya, Maharishi Parashar defines wealth-producing yogas with mathematical precision that has guided Vedic financial astrology for over five millennia.

The Foundation — Dhana Yoga

Dhana Yoga is the supreme wealth-producing combination, formed when the lord of the 2nd house and the lord of the 11th house join together in a Kendra house (1, 4, 7, 10) or Trikona house (1, 5, 9). When this combination occurs with the additional aspect of Jupiter, the yoga reaches its highest expression — creating natives capable of accumulating substantial wealth across their lifetime. BPHS lists 32 distinct Dhana Yogas, each with its own characteristics and timing patterns. Trikal Vaani's analysis systematically detects all 32 in your chart.

Jupiter — Natural Karaka of Wealth

Jupiter is the supreme Naisargika Karaka (natural significator) of wealth, expansion, and divine grace. A strong Jupiter in the 2nd, 5th, 9th, or 11th house blesses the native with natural prosperity. Jupiter's transit over the natal Moon — known as Guru Chandala or the period of expansion over emotional foundation — often coincides with significant financial windfalls, property acquisitions, or business breakthroughs. Jupiter Mahadasha (16 years) is traditionally the most prosperous period in a native's life when Jupiter is well-placed natally.

When Jupiter is debilitated in Makar (Capricorn) or combust by the Sun, wealth growth requires more conscious effort, but remedies like Guru mantra, Thursday fasting, and donation of yellow items significantly strengthen Jupiter's blessing.

Venus — Karaka of Luxury Wealth

Venus (Shukra) represents the luxury dimension of wealth — property, vehicles, art, jewelry, designer goods, and aesthetic abundance. A strong Venus in the 11th or 2nd house supports consistent income from creative industries, luxury sectors, hospitality, fashion, or beauty markets. Venus in its exaltation in Meen (Pisces) or own signs Vrishabh (Taurus) and Tula (Libra) creates natural attraction to financial abundance. Venus Mahadasha (20 years — the longest in Vimshottari) often produces extended wealth accumulation periods.

The 8th House — Inheritance & Sudden Wealth

The 8th house governs inherited wealth, ancestral assets, joint finances, insurance, and sudden financial events. When the 8th lord connects positively with the 2nd lord (in conjunction or mutual aspect), inheritance and windfall income are strongly indicated in the native's life. Rahu in the 8th can bring unexpected wealth through marriage, business partnerships, or speculation — but requires careful ethical anchoring. Saturn in the 8th brings gradual but stable inherited wealth, often delayed until later life.

The 5th House — Speculative Wealth

The 5th house governs Poorva Punya (past life merit) and speculative gains — investments, stock market, lottery, and risk-based wealth. Strong 5th house with Jupiter or Mercury creates intelligent investment ability. The 5th lord in the 11th creates the powerful Bhagya Yoga — past karma directly generating present income. When Jupiter aspects the 5th from the 11th, the native becomes a wise long-term investor rather than a gambler.

11th House — Income & Gain Fulfillment

The 11th house (Labha Bhava) is the primary house of income, gains, and fulfilled desires. Every form of wealth — salary, business profit, investment returns, royalties — eventually flows through the 11th house. A strong 11th lord placed in a Kendra or Trikona creates multiple income streams. The 10th lord placed in the 11th creates the strongest indicator of profitable employment or successful business (Jataka Parijata).

Karz Mukti — Debt Liberation

The 6th house (Rina Bhava) governs debt and financial obligations. When the 6th lord is strong and afflicts the 2nd or 11th house, debt accumulation becomes a pattern in life. Saturn or Rahu transiting the 6th or 12th house during their Dasha period often creates financial pressure, loans, or credit card traps. Classical BPHS remedies for Karz Mukti (debt liberation) include Hanuman Chalisa recitation, Tuesday Mars worship, and specific Jupiter mantras for gradual financial recovery.

Vimshottari Dasha — Wealth Timing

Wealth events follow precise Dasha timing patterns. Jupiter Mahadasha (16 years) is the prime wealth-growth period. Venus Mahadasha (20 years) brings luxury and consistent income. Mercury Mahadasha (17 years) supports business and trade success. The Antardasha and Pratyantar Dasha combinations within these periods determine specific windows — 3-7 day precision timing for major investments, property purchases, business launches, or financial decisions. This level of precision separates Trikal Vaani's analysis from generic Sun-sign predictions.

Wealth Yogas Beyond Dhana Yoga

Several classical Yogas indicate exceptional wealth potential:
Lakshmi Yoga: 9th lord in own/exalted sign with Venus aspect — divine prosperity.
Kubera Yoga: 2nd and 11th lords in mutual aspect — accumulation power.
Gajakesari Yoga: Moon and Jupiter in Kendra — generational wealth and respect.
Vipreet Raj Yoga: 6th, 8th, or 12th lord placed in another dusthana — paradoxical wealth through overcoming obstacles.
Chandra Mangal Yoga: Moon-Mars conjunction creates active income through ventures.

Modern Wealth Indicators

For contemporary financial paths:
Stock Market & Trading: Strong Mercury in 5th or 11th, Rahu support
Real Estate: Mars in 4th, strong 4th lord, Jupiter aspect on property houses
Entrepreneurship: Mars + Mercury combination, strong 7th and 10th
Inherited Family Business: 2nd lord in 10th, Saturn supporting
Investment Income: Jupiter in 11th or aspecting 5th
Foreign Income: Rahu connection to 11th house, 12th house wealth markers
Salary Growth: 10th lord in 11th — career feeds income directly

Wealth Remedies Per Planet

Trikal Vaani recommends BPHS-sanctioned remedies based on the afflicted wealth planet:
Jupiter: Donate yellow items (turmeric, gram dal, gold) on Thursdays; recite Guru mantra; respect teachers and elders.
Venus: Friday white items donation; Lakshmi mantra; offer water to Tulsi plant.
Mercury: Wednesday green moong donation; respect young people and students.
Saturn (for debt): Saturday oil donation; Shani Chalisa; serve elderly disadvantaged.
Rahu (for sudden wealth events): Donate to social causes; honor unconventional people.

Personal Wealth Analysis

Trikal Vaani's Swiss Ephemeris-powered Vedic analysis systematically detects all 32 Dhana Yogas, evaluates the strength of Jupiter and Venus, maps your current Vimshottari Dasha alignment with wealth houses, and identifies precise Pratyantar Dasha windows for financial decisions. Begin with our free Kundali Calculator to see your wealth foundation, or get the full reading by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.`,
    faqs: [
      {
        q: 'What is Dhana Yoga in Vedic astrology?',
        a: 'Dhana Yoga is a wealth-producing planetary combination defined in BPHS Chapter 39. It occurs when the lords of the 2nd house (accumulated wealth) and 11th house (income) join together in a Kendra (1,4,7,10) or Trikona (1,5,9) house. This combination significantly increases financial prosperity and wealth accumulation.',
      },
      {
        q: 'Which house represents money in Vedic astrology?',
        a: 'The 2nd house (Dhana Bhava) represents accumulated wealth, savings, and family assets. The 11th house (Labha Bhava) represents income, gains, and fulfillment of financial desires. The 5th house governs speculative gains and investments. The 8th house governs inherited wealth and sudden financial events.',
      },
      {
        q: 'How does Jupiter affect wealth in Vedic astrology?',
        a: 'Jupiter is the primary natural significator of wealth in Vedic astrology. When Jupiter transits over natal Moon or occupies the 2nd, 5th, or 11th house, it brings significant financial expansion. Jupiter Mahadasha (16 years) is often the period of maximum wealth growth in a native\'s life, especially when Jupiter is strong in the natal chart.',
      },
      {
        q: 'Can astrology predict financial problems and debt?',
        a: 'Yes. The 6th house (Rina Bhava) governs debt and financial obligations. When the 6th lord is strong and afflicts the 2nd or 11th house, debt accumulation is indicated. Saturn or Rahu in the 6th or 12th house during their Dasha period often creates financial pressure. Classical BPHS remedies for Rina Mukti (debt liberation) include specific Jupiter mantras and Dana.',
      },
      {
        q: 'What Dasha period is best for financial growth?',
        a: 'Jupiter Mahadasha and Venus Mahadasha are generally the most prosperous periods for wealth growth. Specific Antardasha and Pratyantar combinations are analyzed for precise timing. The quality of the current Pratyantar Dasha (3-7 day windows) determines the best dates for investments, new ventures, or major financial decisions.',
      },
    ],
    ctaText: 'Discover Your Wealth Yoga',
    keywords: ['wealth astrology', 'dhana yoga vedic', 'financial astrology india', 'money prediction kundali', 'prosperity jyotish', 'financial prediction delhi'],
  },

  health: {
    slug:    'health',
    icon:    '🏥',
    title:   'Health Astrology — Vedic Health Prediction & Remedies | Trikal Vaani',
    h1:      'Health & Wellbeing in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, health is governed by the 1st house (physical body), 6th house (disease), and 8th house (longevity). Saturn as Ayushkaraka determines lifespan. BPHS Chapter 66 guides health analysis. Visit trikalvaani.com for personalized health predictions.',
    description: 'Vedic astrology health predictions based on 1st, 6th, and 8th house analysis. Saturn as Ayushkaraka, health Yogas, and classical BPHS remedies by Rohiit Gupta, Chief Vedic Architect.',
    planet: 'Saturn & Moon',
    house:  '1st, 6th & 8th Houses',
    bphsRef:'BPHS Chapter 66 — Ayu (Longevity) Bhava',
    content: `Health in Vedic astrology is the foundation upon which all other life pursuits rest — for without robust physical and mental health, neither wealth nor relationships nor spiritual progress can be sustained. Brihat Parashara Hora Shastra (BPHS) Chapter 66 — Ayu (Longevity) Bhava establishes the classical framework for health analysis, focusing on three primary houses and the planet Saturn as Ayushkaraka (significator of lifespan).

The 1st House — Constitution & Vitality

The 1st house (Tanu Bhava) represents the physical body, overall constitution, immunity, and life force (Prana). The Lagna's nature determines the native's fundamental health pattern. Lagna lord placement determines vitality — when the Lagna lord is strong and unafflicted, the native enjoys robust health and recovery capacity. When the Lagna lord is in the 6th, 8th, or 12th house, chronic health vulnerabilities may emerge during specific Dasha periods.

According to BPHS, each Lagna sign corresponds to specific body parts and health tendencies: Mesha (Aries) governs the head; Vrishabh (Taurus) the face and throat; Mithun (Gemini) the shoulders and lungs; Karka (Cancer) the chest; Singh (Leo) the heart; Kanya (Virgo) the digestive system; Tula (Libra) the kidneys; Vrishchik (Scorpio) the reproductive system; Dhanu (Sagittarius) the hips and thighs; Makar (Capricorn) the knees; Kumbh (Aquarius) the calves; Meen (Pisces) the feet.

The 6th House — Disease & Daily Health Patterns

The 6th house (Ari Bhava) represents disease, health challenges, enemies of the body, infections, accidents, and daily health routines. The 6th lord's placement determines the type and severity of health challenges throughout life. When malefics like Saturn, Rahu, or Mars occupy the 6th house, recurring health issues may arise — but a strong 6th house also provides fighting power against disease. Paradoxically, a strong 6th house with malefics can create a "warrior immune system" that overcomes illness.

The 8th House — Longevity & Chronic Conditions

The 8th house (Ayu Bhava) governs longevity, chronic conditions, surgeries, and life-threatening health events. Saturn is the Ayushkaraka — the natural significator of lifespan. A strong Saturn in the natal chart indicates robust constitution and long life. When Saturn is afflicted or occupies the 6th or 8th house without benefic support, chronic health conditions may arise during Saturn Dasha. The 8th lord's placement determines hidden health patterns — issues that may not manifest in youth but emerge later.

The Moon — Mental Health Foundation

The Moon (Chandra) represents the mind, emotions, hormonal balance, and psychological health. Moon afflicted by Saturn creates depression, fatigue, and emotional heaviness. Moon afflicted by Rahu can indicate psychosomatic conditions, anxiety, or unusual mental health patterns. Moon in own sign Karka (Cancer) or exalted in Vrishabh (Taurus) provides strong emotional resilience.

The Moon's Nakshatra at birth reveals psychological patterns important for mental health. For example, Ashlesha Nakshatra Moon creates intuitive but anxious minds requiring grounding practices. Rohini Nakshatra Moon creates emotional stability and natural healing capacity. Jyeshtha Nakshatra Moon creates a responsible but sometimes burdened mental state.

Mars — Blood, Surgery & Acute Conditions

Mars governs blood, muscles, surgery, inflammation, accidents, and acute health events. Mars in the 6th or 8th house creates surgical possibilities or acute health crises that respond well to immediate medical intervention. Mangal Dosha can also affect health in addition to marriage matters — when Mars is afflicted in dusthana houses, blood pressure, anger-related health issues, or accident vulnerabilities emerge.

Mercury — Nervous System & Communication Health

Mercury (Budha) rules the nervous system, skin, respiratory pathways, and the sense of touch. Mercury afflicted by Mars creates anxiety and overthinking; Mercury with Saturn creates chronic nervous tension and slow processing. Mercury Dasha can be a critical period for nervous system health, requiring conscious stress management.

Vata-Pitta-Kapha Analysis

Classical Vedic astrology connects deeply with Ayurveda through the Tridosha analysis. Each planet governs specific doshas: Sun governs Pitta (heat, transformation), Moon governs Kapha (water, nourishment) and Vata in early stages, Mars governs Pitta intensely, Mercury governs all three depending on association, Jupiter governs Kapha and balanced wisdom, Venus governs Kapha and Vata, Saturn governs Vata (dryness, depletion). Your strongest planetary signature reveals your dosha constitution, guiding diet, lifestyle, and seasonal adjustments.

Sade Sati & Health

Sade Sati — the 7.5 year period when Saturn transits the 12th, 1st, and 2nd houses from natal Moon — often creates periods of health stress, fatigue, and chronic conditions, especially when Saturn is naturally weak in the chart. The middle phase (Saturn directly on natal Moon, 2.5 years) is the most intense for emotional and physical exhaustion. Regular Shani worship, oil donation on Saturdays, Hanuman Chalisa recitation, and structured health routines significantly mitigate Sade Sati health effects.

Vimshottari Dasha & Health Timing

Health vulnerabilities follow Dasha patterns. The 6th lord's Dasha activates disease-related themes — requiring proactive medical attention and preventive care. The 8th lord's Dasha may bring chronic or hidden health issues to surface. Mars-Saturn or Saturn-Rahu Antardasha combinations can intensify health challenges. Pratyantar Dasha (3-7 day windows) provides precise timing for surgeries, major procedures, and health-related decisions — choosing favorable Muhurta materially improves medical outcomes.

Modern Health Indicators

Adapting classical principles to contemporary health concerns:
Mental Health: Moon afflictions, especially with Saturn or Rahu, plus Mercury condition
Heart Health: Sun strength, 5th house condition (Sun's natural domain)
Diabetes / Endocrine: Jupiter condition, Venus-Saturn dynamics, 6th and 8th houses
Cancer-related concerns: Moon affliction with Saturn-Rahu in dusthana houses
Surgical Events: Mars in 6th or 8th, Saturn-Mars combinations
Chronic Pain: Saturn's long-term influence on Lagna or 1st lord
Autoimmune: Lagna lord weakness combined with 6th house affliction

Classical Health Remedies

Trikal Vaani recommends BPHS-sanctioned remedies based on the afflicted health planet:
Saturn (longevity, chronic): Black sesame and mustard oil donation on Saturdays; Mahamrityunjaya Mantra (108 times facing East); Hanuman Chalisa.
Moon (mental health): Monday milk donation; Om Chandraya Namah mantra; white flower offerings to Shiva.
Mars (blood, accidents): Tuesday red items donation; Hanuman Chalisa; avoid risk during Mars Antardasha.
Mercury (nervous system): Wednesday green moong donation; Budh Beej Mantra; respect young learners.
Sun (vitality): Sunday wheat donation; Aditya Hridaya Stotra; Surya Namaskar at sunrise.

Important Disclaimer

Vedic astrology provides guidance on tendencies, timing, and preventive measures — it is not a substitute for medical diagnosis or treatment. Always consult qualified medical professionals for health decisions. Astrological insights work best as a complementary layer alongside conventional medicine, helping with preventive timing, lifestyle alignment, and emotional understanding.

Personal Health Analysis

Trikal Vaani's Swiss Ephemeris-powered analysis evaluates your Lagna constitution, 6th and 8th house dynamics, Moon's emotional foundation, Saturn's role as Ayushkaraka, current Vimshottari Dasha health patterns, and Sade Sati impact. Begin with our free Kundali Calculator to identify your constitutional foundation, or get full health analysis by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.`,
    faqs: [
      {
        q: 'Which planet controls health in Vedic astrology?',
        a: 'Saturn (Shani) is the Ayushkaraka — significator of longevity and chronic health. The Sun governs vitality and the heart. Moon rules the mind and emotional health. Mars governs blood, muscles, and surgery. Mercury rules the nervous system. Each planet has domain over specific body parts as defined in BPHS.',
      },
      {
        q: 'What does the 6th house in astrology represent for health?',
        a: 'The 6th house (Ari Bhava) in Vedic astrology represents disease, health challenges, enemies of the body, and daily health routines. The 6th lord\'s placement and strength determines the type and severity of health challenges. Malefics in the 6th can create recurring health issues, while benefics provide protection.',
      },
      {
        q: 'Can Vedic astrology predict serious illness?',
        a: 'Vedic astrology identifies periods of health vulnerability through Dasha analysis, particularly when the 6th or 8th house lord\'s Dasha runs alongside malefic transits. However, astrology provides tendencies and timing, not medical diagnoses. Always consult qualified doctors. Astrological guidance focuses on preventive measures, remedies, and favorable timing for medical procedures.',
      },
      {
        q: 'What are Vedic astrology remedies for good health?',
        a: 'Classical BPHS remedies for health include: Mahamrityunjaya Mantra japa (108 times daily facing East), donation of sesame and black cloth on Saturdays for Saturn, green dal and green cloth on Wednesdays for Mercury (nervous system), copper vessel water donation on Sundays for Sun. Wearing specific gemstones requires expert consultation.',
      },
      {
        q: 'How does Sade Sati affect health?',
        a: 'Sade Sati (7.5 year Saturn transit over Moon) can create periods of health stress, fatigue, and chronic conditions, especially if Saturn is naturally weak in the natal chart. The middle phase (Saturn directly on natal Moon) is most intense. Regular Shani worship, oil donation on Saturdays, and Hanuman Chalisa recitation are classical remedies.',
      },
    ],
    ctaText: 'Get Health Prediction',
    keywords: ['health astrology vedic', 'disease prediction kundali', 'medical astrology india', 'health jyotish delhi', 'ayushkaraka saturn', 'health vedic prediction'],
  },

  relationships: {
    slug:    'relationships',
    icon:    '💑',
    title:   'Relationship Astrology — Love & Partner Prediction | Trikal Vaani',
    h1:      'Relationships in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, relationships are governed by the 7th house (partner karaka), Venus as Kalatrakaraka, and Navamsa D9 chart. BPHS Chapter 24 defines Vivah (marriage) Yoga. Get your relationship reading at trikalvaani.com.',
    description: 'Vedic astrology relationship and love predictions. 7th house analysis, Venus karaka, Navamsa D9 chart, synastry by Rohiit Gupta. Swiss Ephemeris accuracy for Delhi NCR and India.',
    planet: 'Venus & Moon',
    house:  '7th House (Yuvati Bhava)',
    bphsRef:'BPHS Chapter 24 — Vivah Bhava',
    content: `The 7th house (Yuvati Bhava) in Vedic astrology is the supreme house of partnerships, significant relationships, and the qualities of one's life partner. According to Brihat Parashara Hora Shastra (BPHS) Chapter 24 — Vivah Bhava, Maharishi Parashar establishes that the 7th lord's strength, placement, and dignity determine the nature and quality of all major relationships in life — not just marriage but every deep one-on-one bond.

The 7th House — Foundation of Partnership

The 7th house represents the partner, spouse, business associate, and any significant "other" who balances the self (represented by the 1st house, directly opposite). When the 7th lord is strong, well-placed in a Kendra or Trikona, and unafflicted by malefics, the native attracts harmonious, supportive, long-lasting relationships. Conversely, when the 7th lord is debilitated, combust, or in dusthana houses (6th, 8th, 12th), relationships may face conflict, separation patterns, or repeated karmic challenges.

The nature of the 7th house sign reveals the type of partner one attracts: Mesha Lagna natives often attract dynamic, action-oriented partners; Tula Lagna natives attract diplomatic, beauty-conscious partners; Karka Lagna natives attract emotionally protective partners.

Venus — The Karaka of Relationships

Venus (Shukra) is the Kalatrakaraka — the natural significator of spouse and romantic relationships for men's charts. A strong Venus in own signs Vrishabh (Taurus) or Tula (Libra), or exalted in Meen (Pisces), brings an attractive, harmonious, emotionally intelligent partner. Venus in the 7th house creates natural relationship harmony, though Venus may sometimes give a beautiful but slightly volatile partner depending on aspects.

For women's charts, Jupiter (Guru) represents the husband as Purusha Karaka — the significator of the masculine partner. Jupiter's condition reveals the husband's character: wise, generous, ethical, and providing when strong; restrictive or distant when afflicted by Saturn or Rahu.

The Navamsa D9 — Soul-Level Relationship Chart

The Navamsa (D9) chart is the most important divisional chart for relationships — often considered MORE significant than the natal D1 for marriage analysis. BPHS Chapter 6 establishes that the Navamsa chart should always be read alongside the natal chart for any relationship prediction.

A planet that is Vargottama (in the same Rashi in both D1 and D9) has exceptional strength and reliability in relationship matters. The 7th lord's placement in D9 reveals the deeper karmic nature of the partner. When the D9 Lagna is harmonious with the D1 Lagna, the marriage strengthens both partners. When the D9 7th house is afflicted while D1 appears favorable, the marriage may seem good externally but face internal challenges.

Rahu & Ketu in the 7th — Karmic Partnerships

Rahu in the 7th house creates intense, karmic, often unconventional relationships — frequently past-life connections that require conscious resolution in this life. Rahu in the 7th may bring partners from different cultures, foreign nationalities, or significant age differences. The relationship feels magnetic but karmically heavy, demanding spiritual maturity.

Ketu in the 7th creates spiritual detachment from conventional partnership. Such natives may marry late, marry an unconventional partner, or experience the relationship as more spiritual than emotional. Classical texts mention that Ketu in the 7th can also indicate a previous-life unfinished bond.

Synastry — Two-Chart Analysis

Synastry examines where key planets of one person fall in the other's chart, revealing the karmic compatibility beyond simple Sun-sign matching. Venus-Moon synastry creates deep emotional bonds. Saturn-Moon synastry creates karmic obligation and long-term commitment (often felt as "duty love"). Sun-Moon synastry creates fundamental psychological harmony. Mars-Venus synastry creates passionate attraction.

Ashtakoot Guna Milan — The 8-Point Compatibility System

The classical Vedic compatibility framework evaluates 8 factors with weighted points totaling 36:
Varna (1 point): Spiritual ego compatibility
Vashya (2 points): Mutual influence dynamics
Tara (3 points): Health and birth-star harmony
Yoni (4 points): Sexual and physical compatibility
Graha Maitri (5 points): Mental and emotional compatibility
Gana (6 points): Temperament harmony (deva, manushya, rakshasa)
Bhakoot (7 points): Love and family welfare
Nadi (8 points): Genetic and health compatibility

A score above 18/36 is considered acceptable; 24+ is excellent. However, Nadi (8 points) and Bhakoot (7 points) carry the highest weight and require careful analysis — classical cancellations exist for both that experienced astrologers identify before declaring incompatibility.

Marriage Timing — Vimshottari Dasha

Marriage typically occurs during specific Vimshottari Dasha combinations: the Dasha of the 7th lord, Venus Dasha (for men's charts), Jupiter Dasha (for women's charts), planets in the 7th house Dasha, or planets aspecting the 7th house Dasha. The most precise marriage windows are when Jupiter transits over the 7th house cusp or the 7th lord — a transit that occurs every 12 years. Pratyantar Dasha analysis can pinpoint marriage windows within 1-3 month precision.

Delays in Relationships — Common Causes

Relationship delays follow predictable astrological patterns:
Saturn's influence on 7th house or Venus creates patience-testing delays
Sade Sati during prime relationship years (mid-20s to mid-30s)
Rahu-Ketu on the 7th-1st axis creates unconventional timing
Mangal Dosha (Mars in 1, 4, 7, 8, 12) creates obstacles requiring matching
12th lord on 7th house creates loss patterns or foreign partnerships

Classical Relationship Yogas

Several powerful Yogas indicate exceptional relationship destiny:
Sphatika Yoga: 7th lord in own/exalted sign with Venus aspect — beautiful, harmonious marriage
Soubhagya Yoga: Jupiter in 7th from Venus — long-lasting blessed marriage
Daridra Yoga (negative): 7th lord in 12th — relationship challenges and losses
Argala Yoga: Strong planets in 2nd, 4th, 11th from 7th — relationship support from family and resources

Modern Relationship Indicators

Adapting classical wisdom to contemporary relationship structures:
Love Marriage: Venus + Mars connection to 5th or 7th house
Arranged Marriage: Jupiter + Saturn in dignified position, 7th lord in stable placement
Late Marriage: Saturn in or aspecting 7th, Mars in 7th (Mangal Dosha)
Multiple Marriages: 7th lord in dusthana, malefics in 2nd and 7th
Live-in / Unconventional: Rahu in 7th, Ketu in 5th, Uranus-equivalent patterns
Inter-cultural Marriage: 7th lord in 9th or 12th, Rahu involvement
Long Distance: Mercury-Rahu connection to 7th, 12th house support

Relationship Remedies Per Affliction

Trikal Vaani recommends BPHS-sanctioned remedies based on relationship challenges:
Saturn (delay, distance): Saturday oil donation; Shani Stotra; serve elderly; patience.
Mars (Mangal Dosha): Tuesday red items donation; Hanuman Chalisa; match with another Manglik partner per BPHS rules.
Venus (relationship harmony): Friday white items donation; Lakshmi mantra; honor feminine wisdom.
Rahu (karmic patterns): Donate to disadvantaged; recite Rahu Beej Mantra; conscious relationship work.
Jupiter (long-term wisdom): Thursday yellow donation; Guru mantra; respect dharmic principles.

Personal Relationship Analysis

Trikal Vaani's Swiss Ephemeris-powered Vedic analysis evaluates your 7th house, Venus and Jupiter placements, D9 Navamsa chart, current Dasha alignment with marriage houses, Mangal Dosha presence with cancellations, and Ashtakoot compatibility when matching with a specific partner. Begin with our free Nakshatra Calculator to understand your relationship temperament, or get the full reading by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.`,
    faqs: [
      {
        q: 'Which house governs relationships in Vedic astrology?',
        a: 'The 7th house (Yuvati Bhava) is the primary house of relationships and partnerships. The 5th house governs romance and love affairs. The 2nd house represents family acceptance of the relationship. The 11th house shows fulfillment of relationship desires. All four houses are analyzed together for a complete relationship prediction.',
      },
      {
        q: 'What is the Navamsa chart in relationship astrology?',
        a: 'The Navamsa (D9) chart is the ninth divisional chart and is considered the most important chart for relationships after the natal D1. It reveals the deeper karmic nature of the partner, the quality of the bond, and the dharmic purpose of the relationship. BPHS Chapter 6 states that the Navamsa chart should always be read alongside the natal chart for relationship analysis.',
      },
      {
        q: 'How does Venus affect relationships in Vedic astrology?',
        a: 'Venus (Shukra) is the primary relationship karaka in Vedic astrology. For men\'s charts, Venus represents the partner and the quality of romantic relationships. A strong Venus in the 7th house or aspecting it brings an attractive, harmonious partner. Venus in Vrishabh or Tula (own signs) or Meen (exaltation) is especially powerful for relationships.',
      },
      {
        q: 'What causes relationship delays in Vedic astrology?',
        a: 'Relationship delays are primarily caused by Saturn\'s influence on the 7th house, 7th lord, or Venus. Shani Sade Sati during prime relationship years creates delays. Rahu or Ketu on the 7th house axis also creates unconventional timing. Classical remedies include Venus mantras and Friday fasting.',
      },
      {
        q: 'Can astrology predict compatibility between two people?',
        a: 'Yes. Vedic astrology uses Ashtakoot (8 factor) matching for compatibility, assessing Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi. A score above 18/36 is considered good. Synastry analysis additionally examines where each person\'s planets fall in the other\'s chart, revealing deeper karmic and emotional patterns.',
      },
    ],
    ctaText: 'Get Relationship Reading',
    keywords: ['relationship astrology vedic', 'love astrology india', '7th house relationships', 'partner prediction jyotish', 'compatibility astrology delhi', 'venus relationship astrology'],
  },

  family: {
    slug:    'family',
    icon:    '👨‍👩‍👧',
    title:   'Family Astrology — Children, Parents & Family Harmony | Trikal Vaani',
    h1:      'Family Life in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, family harmony is governed by the 4th house (mother, home), 9th house (father, ancestors), and 5th house (children). Jupiter as Putrakaraka determines progeny. BPHS Chapters 19, 22, 26 guide family analysis. Visit trikalvaani.com.',
    description: 'Vedic astrology family predictions — children, parents, and domestic harmony. 4th, 5th, 9th house analysis by Rohiit Gupta. Swiss Ephemeris-powered Kundali readings.',
    planet: 'Jupiter & Moon',
    house:  '4th, 5th & 9th Houses',
    bphsRef:'BPHS Chapters 19, 22, 26',
    content: `Family in Vedic astrology represents the karmic web that shapes the soul's emotional foundation, ancestral inheritance, and the dharmic responsibilities one carries from past births into this lifetime. Family analysis involves multiple houses working in harmony: the 4th house for mother and home, the 9th house for father and ancestors, the 5th house for children, the 2nd house for the immediate family unit, and the 3rd house for siblings. Brihat Parashara Hora Shastra (BPHS) Chapters 19, 22, and 26 establish the classical framework for family bhava analysis.

The 4th House — Mother & Domestic Foundation

The 4th house (Matru Bhava or Sukha Bhava) is the supreme house of mother, home, domestic peace, emotional foundation, and the inner sanctuary of the soul. According to BPHS Chapter 22, the 4th lord's placement and strength determines family happiness more than any other single factor. The Moon (Chandra) as the natural Karaka of mother and the 4th house reveals the quality of maternal relationships and inner emotional security.

A strong Moon in the 4th house, or the 4th lord placed in a Kendra or Trikona, creates a peaceful, nurturing home environment and a deeply supportive mother. When malefics like Saturn, Rahu, or Mars afflict the 4th house, tensions with mother, domestic instability, or emotional restlessness may emerge — patterns that often heal through conscious spiritual work and Moon-strengthening remedies.

The 9th House — Father & Ancestral Lineage

The 9th house (Dharma Bhava or Pitru Bhava) represents father, paternal lineage, ancestral blessings, dharma, higher wisdom, and inherited fortune (Bhagya). The Sun as the natural Karaka of father is analyzed for father's health, longevity, the native's relationship with him, and the karmic flow of paternal blessings into the native's life.

A strong 9th house with benefic planets indicates paternal support, ancestral grace, and natural fortune throughout life. When the Sun is afflicted by Rahu (Pitru Dosha indication) or Saturn aspects the 9th lord, the relationship with father may face distance, conflict, or premature loss — patterns that classical remedies can significantly heal.

The 5th House — Children & Future Generations

The 5th house (Putra Bhava) governs children, progeny, future generations, and the continuation of the family lineage. Jupiter (Guru) is the Putrakaraka — the natural significator of children. Jupiter's strength in the natal chart and its position in the D7 Saptamsa divisional chart determines the timing and nature of children. When Jupiter occupies the 5th house, aspects it, or forms strong yogas with the 5th lord, Putra Yoga is created — indicating blessing of progeny.

Saturn in the 5th can create delays in conception or childbearing, but eventual blessings emerge with patience and proper Jupiter remedies. Rahu in the 5th may indicate adopted children, unconventional family structures, or significant karmic patterns around progeny.

Pitru Dosha — Ancestral Karmic Debt

Pitru Dosha occurs when Rahu or Ketu afflicts the Sun (significator of father) or the 9th house (Pitru Bhava) in the natal chart. This indicates ancestral karmic debt that manifests in various ways: difficulties with father, obstacles to having children, recurring family health issues, or persistent feelings of being "blocked" despite good effort.

Classical remedies for Pitru Dosha resolution include Pitru Tarpan (water offerings to ancestors) on Amavasya days, Mahalaya Shraddha rituals during the Pitru Paksha fortnight (September-October each year), pilgrimage to specific ancestral pilgrimage sites like Gaya, Trimbakeshwar, or Rameshwaram, and specific Surya mantras. Trikal Vaani's analysis identifies whether your chart shows Pitru Dosha and the precise remedial path.

The 3rd House — Siblings & Courage

The 3rd house (Parakrama Bhava or Sahaja Bhava) governs younger siblings, courage, self-effort, and direct communication. Mars is the natural Karaka of younger siblings, while Jupiter governs elder siblings. The 3rd lord's placement and the planets in the 3rd house determine sibling relationships — whether they support, neutralize, or oppose the native through life.

A strong 3rd house with benefics creates harmonious sibling bonds and mutual support throughout life. Malefics in the 3rd may create competitive dynamics, distance, or estrangement patterns that require conscious family healing.

The 2nd House — Immediate Family Unit

The 2nd house (Kutumba Bhava or Dhana Bhava) represents the immediate family unit one grows up in, the foundational values absorbed from family, and the family's collective economic and emotional well-being. A strong 2nd house with benefic planets creates harmonious family memories and stable economic foundation. Mars in the 2nd can create family arguments; Saturn in the 2nd creates economic restraint or family responsibility burden.

Generational Family Patterns

Vedic astrology recognizes that families carry karmic patterns across generations. When similar planetary signatures appear across multiple family members' charts (same Lagna lord debilitation, same Pitru Dosha pattern, same Sade Sati timing), it indicates a generational pattern requiring conscious family healing. This is why classical texts emphasize that one person's spiritual practices benefit the entire family lineage — seven generations forward and seven generations back, according to Vedic teachings.

Family Yogas

Several Yogas indicate exceptional family harmony or challenges:
Gajakesari Yoga: Moon and Jupiter in Kendras — family prosperity and respect across generations
Pitra-Putra Yoga: Strong 9th and 5th lords in mutual relationship — multi-generational dharma
Matru Yoga: 4th lord with Moon in Kendra — exceptional maternal blessing
Anapha Yoga: Planets in the 12th from Moon — emotional/family support patterns
Sunapha Yoga: Planets in the 2nd from Moon — family resources and verbal support

Modern Family Dynamics

Adapting classical principles to contemporary family structures:
Joint Family Tensions: Mars-Saturn aspect on 4th house; specific Dasha activations
Single Parent Dynamics: 9th house afflictions, 4th lord in challenging position
Adoption / Step-family: Rahu in 5th, complex 9th house patterns
Estranged Family: 2nd lord in dusthana, malefics afflicting 4th and 9th
Family Business Inheritance: 2nd lord in 10th, Saturn supporting continuity
NRI Family Separation: 12th house involvement with 4th and 9th lords
Family Healing Cycles: Dasha periods of 4th, 9th lords often bring reconciliation

Classical Family Remedies

Trikal Vaani recommends BPHS-sanctioned remedies based on family afflictions:
For Mother / 4th house: Monday milk donation; Moon mantra; respect feminine wisdom in family.
For Father / 9th house: Sunday wheat donation; Surya Namaskar; serve elders.
For Pitru Dosha: Amavasya Pitru Tarpan; Mahalaya Shraddha; pilgrimage to ancestral sites.
For Children / 5th house: Thursday yellow donation; Jupiter mantra; respect teachers and Brahmins.
For Siblings / 3rd house: Tuesday red items donation; Hanuman Chalisa; honor courage and self-effort.

Personal Family Analysis

Trikal Vaani's Swiss Ephemeris-powered Vedic analysis evaluates your 4th, 5th, 9th, 2nd, and 3rd houses simultaneously, Moon and Sun strength as parental karakas, Jupiter as Putrakaraka, Pitru Dosha detection, and current Vimshottari Dasha alignment with family houses. Begin with our free Kundali Calculator to see your family foundation, or get full family analysis by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.`,
    faqs: [
      {
        q: 'Which planet governs children in Vedic astrology?',
        a: 'Jupiter (Guru) is the Putrakaraka — natural significator of children in Vedic astrology. The 5th house (Putra Bhava) is analyzed for progeny. Jupiter\'s strength in the natal chart and the D7 Saptamsa divisional chart determines the timing and nature of children. Saturn in the 5th can cause delays but eventual blessings with patience.',
      },
      {
        q: 'What is Pitru Dosha in astrology?',
        a: 'Pitru Dosha occurs when Rahu or Ketu afflicts the Sun (significator of father) or the 9th house (Pitru Bhava) in the natal chart. It indicates ancestral karmic debt that manifests as family difficulties, obstacles to progeny, or health issues. Classical remedies include Pitru Tarpan on Amavasya, Mahalaya Shraddha rituals, and specific Surya mantras.',
      },
      {
        q: 'How does the 4th house affect family life?',
        a: 'The 4th house (Matru Bhava or Sukha Bhava) governs mother, domestic peace, home environment, property, and the emotional foundation of life. Its lord\'s placement determines family happiness. Benefics in the 4th create a nurturing home environment, while malefics can create tension. Moon as natural 4th house karaka is analyzed for maternal relationships.',
      },
      {
        q: 'Can astrology predict problems between family members?',
        a: 'Yes. Family conflicts are revealed through afflictions to the 4th, 9th, and 2nd houses. Mars in the 4th can create aggressive household dynamics. Rahu in the 9th creates difficult father relationships. Saturn aspecting the Moon creates emotional distance in family. Specific Dasha periods activate these patterns, and classical remedies can help mitigate their intensity.',
      },
      {
        q: 'What is the 9th house in family astrology?',
        a: 'The 9th house (Dharma Bhava or Pitru Bhava) represents father, paternal lineage, ancestral blessings, and inherited fortune (Bhagya). A strong 9th house with benefic planets indicates paternal support and ancestral grace. The Sun as natural 9th house significator is analyzed for father\'s health, longevity, and the native\'s relationship with authority figures.',
      },
    ],
    ctaText: 'Get Family Reading',
    keywords: ['family astrology vedic', 'children prediction kundali', 'pitru dosha remedy', '5th house children astrology', 'family harmony jyotish', 'parents astrology india'],
  },

  education: {
    slug:    'education',
    icon:    '📚',
    title:   'Education Astrology — Study Success & Academic Prediction | Trikal Vaani',
    h1:      'Education & Learning in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, education success is determined by the 4th house (foundational learning), 5th house (intelligence, Purva Punya), and Mercury as Buddhi karaka. BPHS guides academic timing. Get your education prediction at trikalvaani.com.',
    description: 'Vedic astrology education predictions. 4th and 5th house analysis, Mercury karaka, Saraswati Yoga detection. Swiss Ephemeris accuracy by Rohiit Gupta, Chief Vedic Architect.',
    planet: 'Mercury & Jupiter',
    house:  '4th & 5th Houses',
    bphsRef:'BPHS Chapter 19 — Putra Bhava (Intelligence)',
    content: `Education in Vedic astrology is governed by the 4th house (foundational education, schooling), the 5th house (intelligence, Purva Punya, higher thinking), and the 9th house (higher education, philosophy, wisdom).

Mercury (Budha) is the Karaka of intelligence, analytical ability, and communication skills. A strong Mercury in the 1st, 4th, or 5th house creates natural academic brilliance. Mercury in its own signs (Mithun or Kanya) or exaltation (Kanya) provides exceptional academic aptitude.

Jupiter (Guru) represents higher wisdom, philosophical education, and teaching. Saraswati Yoga — formed when Jupiter, Mercury, and Venus occupy Kendras or Trikonas — creates exceptional academic and creative intelligence as defined in Phaladeepika.

The 5th house Putra Bhava represents Purva Punya (past life merit), which directly manifests as intelligence and learning capacity in this life. A powerful 5th house with benefics indicates natural scholarly ability and creative thinking.

Timing of academic success or challenges is precisely determined through Vimshottari Dasha — Mercury Dasha and Jupiter Dasha are generally the most productive periods for educational achievement.`,
    faqs: [
      {
        q: 'Which planet is most important for education in Vedic astrology?',
        a: 'Mercury (Budha) is the primary karaka of education, intelligence, and analytical thinking. Jupiter represents wisdom and higher education. The combination of strong Mercury and Jupiter (Saraswati Yoga) creates exceptional academic ability. The 5th house lord\'s strength determines the native\'s natural learning capacity and intellectual gifts.',
      },
      {
        q: 'What is Saraswati Yoga in astrology?',
        a: 'Saraswati Yoga is formed when Jupiter, Mercury, and Venus occupy Kendra (1,4,7,10) or Trikona (1,5,9) houses simultaneously. This yoga blesses the native with exceptional intelligence, creative ability, mastery of arts and sciences, and academic recognition. It is defined in Phaladeepika as one of the most powerful Yogas for intellectual achievement.',
      },
      {
        q: 'Can Vedic astrology predict the right field of study?',
        a: 'Yes. The strongest planet in the chart and the 10th house lord reveal the native\'s natural academic direction. Mercury-dominant charts excel in mathematics, technology, and communication. Jupiter in education and law. Mars in engineering and medicine. Venus in arts, music, and design. Saturn in research, geology, and social work.',
      },
      {
        q: 'How does Ketu affect education?',
        a: 'Ketu in the 4th or 5th house can create unconventional learning patterns — the native may struggle with formal education but excel in self-directed learning, research, or spiritual studies. Ketu with Mercury in the 5th can indicate a highly intuitive, non-linear intelligence. Classical remedies include Saraswati mantra and white sesame donation on Wednesdays.',
      },
      {
        q: 'When is the best time to start studies or exams according to astrology?',
        a: 'Mercury Dasha and Jupiter Dasha are generally the most productive periods for academic pursuit. Auspicious Panchang elements for education include: Pushya Nakshatra (highest for starting studies), Wednesday (Mercury\'s day), Shukla Panchami (Saraswati Panchami), and Abhijeet Muhurta for exams. Avoid Rahu Kaal and Yamaghanta for important academic events.',
      },
    ],
    ctaText: 'Get Education Prediction',
    keywords: ['education astrology vedic', 'study success kundali', 'academic prediction jyotish', 'mercury education astrology', 'saraswati yoga', 'education timing astrology india'],
  },

  home: {
    slug:    'home',
    icon:    '🏠',
    title:   'Property Astrology — Home & Real Estate Prediction | Trikal Vaani',
    h1:      'Home & Property in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, property and home acquisition is governed by the 4th house, Mars as Bhoomi Karaka, and Jupiter\'s blessing. BPHS Chapter 22 defines Griha Yoga. Get your property prediction at trikalvaani.com.',
    description: 'Vedic astrology property and home predictions. 4th house analysis, Mars as Bhoomi karaka, Griha Yoga detection. Swiss Ephemeris accuracy for Delhi NCR property market.',
    planet: 'Mars & Jupiter',
    house:  '4th House (Sukha Bhava)',
    bphsRef:'BPHS Chapter 22 — Sukha Bhava',
    content: `Property and real estate in Vedic astrology is governed by the 4th house (Sukha Bhava), which represents home, fixed assets, property, vehicles, and domestic peace. Mars (Mangal) is the Bhoomi Karaka — natural significator of land and immovable property.

According to BPHS Chapter 22, when the 4th house lord is in a Kendra or Trikona with Jupiter's blessing, Griha Yoga is formed — indicating strong property acquisition potential. The 2nd house (accumulated wealth) and 11th house (gains) must also support the 4th house for successful property purchase.

Mars Dasha or Mars Antardasha is traditionally the most active period for property transactions. Jupiter's transit over the natal Moon or 4th house cusp creates expansion and blessing in the area of home and property.

Saturn's connection to the 4th house can create delays but ultimately provides stable, long-term property ownership. Rahu in the 4th creates unconventional property situations — often foreign locations, unusual properties, or complicated ownership situations.

For rental income and real estate investment, the 11th house (Labha) must be strong. The current home loan rates and market timing should be considered alongside the planetary period analysis for comprehensive property decisions.`,
    faqs: [
      {
        q: 'Which planet governs property in Vedic astrology?',
        a: 'Mars (Mangal) is the Bhoomi Karaka — natural significator of land and immovable property. The 4th house and its lord govern home, property, and fixed assets. Jupiter blesses property acquisition when it aspects the 4th house. Moon as natural 4th house significator determines emotional attachment to home and domestic peace.',
      },
      {
        q: 'What is Griha Yoga in astrology?',
        a: 'Griha Yoga (property yoga) is formed when the 4th house lord is placed in a Kendra (1,4,7,10) or Trikona (1,5,9) house with Jupiter\'s blessing. This yoga indicates strong potential for home ownership and property acquisition. BPHS Chapter 22 defines this as a highly favorable combination for domestic stability and real estate success.',
      },
      {
        q: 'When is the best time to buy property according to astrology?',
        a: 'The best time for property purchase is during Mars Dasha or Mars Antardasha, when the 4th lord is active in Dasha, or when Jupiter transits over the natal Moon. Auspicious Muhurta elements include: Wednesday or Thursday, Rohini or Pushya Nakshatra, Shukla Paksha (waxing moon), and avoiding Rahu Kaal and Saturn\'s direct stations.',
      },
      {
        q: 'How does Saturn affect property in Vedic astrology?',
        a: 'Saturn in or aspecting the 4th house can delay property acquisition but ultimately provides stable, long-term ownership. Saturn\'s Dasha can bring property through hard work and sustained effort rather than sudden acquisition. Saturn also governs old properties and ancestral land — during Saturn Dasha, inherited property matters often come to the fore.',
      },
      {
        q: 'Can astrology predict property disputes?',
        a: 'Yes. Mars-Saturn conjunction or mutual aspect on the 4th house indicates potential property disputes, especially with siblings or family members. Rahu in the 4th or 8th house can create complex property situations involving multiple claimants. The legal dimension (6th house) combined with 4th house afflictions creates property litigation. Specific remedies include land donation (Bhoomi Dan) and Mars mantras.',
      },
    ],
    ctaText: 'Get Property Prediction',
    keywords: ['property astrology vedic', 'home purchase timing astrology', 'real estate prediction kundali', '4th house property', 'griha yoga', 'property jyotish delhi ncr'],
  },

  legal: {
    slug:    'legal',
    icon:    '⚖️',
    title:   'Legal Astrology — Court Case & Dispute Prediction | Trikal Vaani',
    h1:      'Legal Matters in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, legal matters are governed by the 6th house (disputes), Mars and Saturn as litigants, and Rahu\'s involvement in complex cases. BPHS guides timing for legal resolution. Get your legal prediction at trikalvaani.com.',
    description: 'Vedic astrology legal predictions — court cases, disputes, and resolution timing. 6th house analysis by Rohiit Gupta. Swiss Ephemeris accuracy for Delhi NCR legal matters.',
    planet: 'Mars & Saturn',
    house:  '6th House (Ari Bhava)',
    bphsRef:'BPHS Chapter 21 — Ari Bhava',
    content: `Legal matters in Vedic astrology are primarily governed by the 6th house (Ari Bhava — enemies, disputes, litigation), with the 7th house (partnerships gone wrong) and 8th house (hidden matters, inheritance disputes) as supporting indicators.

Mars (Mangal) governs conflict, aggression, and the fighting spirit in legal battles. A strong Mars in the 6th house gives the native the energy and determination to win legal disputes. Saturn governs karma and justice — Saturn's Dasha often brings legal matters to a conclusion, for better or worse.

Rahu in the 6th house is particularly potent for winning legal battles — Rahu's unconventional, aggressive energy creates formidable opponents but also exceptional fighting ability. This is supported by Jataka Parijata's analysis of Rahu's effect in dusthana houses.

Vipreet Raj Yoga (6th, 8th, or 12th lord in each other's houses) paradoxically creates strength — legal opponents may self-destruct. This is one of the most powerful Yogas for winning difficult court cases.

Timing legal decisions through Vimshottari Dasha is critical — filing cases, hearing dates, and settlements all benefit from careful Muhurta selection aligned with favorable Dasha periods.`,
    faqs: [
      {
        q: 'Which house governs legal matters in Vedic astrology?',
        a: 'The 6th house (Ari Bhava) is the primary house of litigation, disputes, and legal enemies. The 7th house governs partnerships and contracts. The 8th house rules inheritance disputes and hidden legal matters. The 12th house indicates imprisonment or heavy legal expenses. All four houses are analyzed for comprehensive legal matter prediction.',
      },
      {
        q: 'Which planet helps win court cases in astrology?',
        a: 'Mars gives fighting spirit and determination in legal battles. A strong 6th house with Mars provides victory over enemies. Rahu in the 6th creates formidable but ultimately successful legal power. Jupiter as the planet of justice can bring favorable verdicts when well-placed. Saturn brings justice through karma — ensuring rightful outcomes in the long run.',
      },
      {
        q: 'What is Vipreet Raj Yoga and how does it help in legal matters?',
        a: 'Vipreet Raj Yoga forms when the lords of dusthana houses (6th, 8th, 12th) are placed in each other\'s houses. This paradoxical yoga creates strength through apparent weakness — legal opponents may self-destruct, witnesses may turn favorable, and circumstances may unexpectedly shift in the native\'s favor. BPHS Chapter 38 defines this as a powerful yoga for overcoming adversity.',
      },
      {
        q: 'When is the best time to file a legal case according to astrology?',
        a: 'Favorable timing for legal matters: Mars Dasha or strong Mars Antardasha, Tuesday (Mars\'s day) for filing, avoiding Rahu Kaal and Saturn\'s stations, Shukla Paksha for initiating legal action, and avoiding the 8th and 12th moon signs from natal Moon. Consulting a Muhurta specialist ensures the best possible timing for legal filings.',
      },
      {
        q: 'Can astrology predict the outcome of a court case?',
        a: 'Vedic astrology can indicate the likelihood of favorable or unfavorable outcomes based on the strength of the 6th house, the current Dasha period, and the comparative strength of the native\'s and opponent\'s charts. However, astrology indicates tendencies, not certainties. Favorable periods should be used for proactive legal strategy, while challenging periods call for patience and settlement consideration.',
      },
    ],
    ctaText: 'Get Legal Prediction',
    keywords: ['legal astrology vedic', 'court case prediction kundali', 'dispute resolution astrology', '6th house astrology', 'legal jyotish india', 'court case timing astrology'],
  },

  travel: {
    slug:    'travel',
    icon:    '✈️',
    title:   'Travel Astrology — Journey & Travel Timing Prediction | Trikal Vaani',
    h1:      'Travel in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, travel timing is governed by the 3rd house (short journeys), 9th house (long journeys), and 12th house (foreign travel). Rahu and Jupiter influence travel patterns. BPHS guides Muhurta selection. Get your travel reading at trikalvaani.com.',
    description: 'Vedic astrology travel predictions. 3rd, 9th, and 12th house analysis, travel Muhurta selection by Rohiit Gupta. Swiss Ephemeris-powered journey timing for safe and successful travel.',
    planet: 'Rahu & Jupiter',
    house:  '3rd, 9th & 12th Houses',
    bphsRef:'BPHS Chapter 29 — Travel Yogas',
    content: `Travel in Vedic astrology is governed by three primary houses: the 3rd house (short journeys, transportation, daily travel), the 9th house (long journeys, pilgrimage, dharma travel), and the 12th house (distant travel, foreign journeys, expenses incurred while traveling).

Rahu is the primary significator of unconventional travel and journeys outside one's usual environment. When Rahu occupies or aspects the 3rd, 9th, or 12th house, frequent travel becomes a life pattern. Jupiter governs auspicious long journeys, especially for education, pilgrimage, or spiritual purposes.

The 3rd house lord's strength determines daily travel patterns and short commutes. A strong 3rd house creates ease in transportation, while afflicted 3rd house can create travel disruptions or vehicle accidents — careful Muhurta selection becomes important during such Dasha periods.

For pilgrimage and dharma-based travel, Jupiter's transit over the 9th house cusp is the most auspicious timing. Such journeys often coincide with significant spiritual transformations or life-purpose clarification.

Travel Muhurta selection (Yatra Muhurta) is a precise classical discipline. Auspicious days include Wednesday and Thursday, avoiding Tuesday (Mars) for travel except for emergency, and selecting Nakshatras like Pushya, Rohini, and Hasta for safe and successful journeys.`,
    faqs: [
      {
        q: 'Which planet indicates travel in Vedic astrology?',
        a: 'Rahu is the primary significator of travel, particularly unconventional or distant journeys. Jupiter governs auspicious long journeys for education or pilgrimage. Mercury rules short trips and communication-based travel. The 3rd house lord governs daily travel, while the 9th and 12th lords govern long-distance and foreign travel respectively.',
      },
      {
        q: 'What is the best Muhurta for travel in Vedic astrology?',
        a: 'Auspicious travel Muhurta elements include: Wednesday or Thursday (avoid Tuesday except for emergencies), Pushya, Rohini, Hasta, or Ashwini Nakshatra, Shukla Paksha (waxing moon), avoiding Rahu Kaal and Yamaghanta. The direction of travel also matters — Disha Shool (inauspicious direction for the day) should be avoided when possible.',
      },
      {
        q: 'Can astrology predict travel accidents?',
        a: 'Yes. Mars in the 3rd house or afflicted 3rd lord during Dasha can indicate vehicle accidents or travel mishaps. Ketu in the 3rd creates sudden unexpected travel disruptions. Saturn-Mars combinations afflicting the 3rd or 9th house warrant extra caution during their Dasha. Avoiding travel during Rahu Kaal and choosing proper Muhurta significantly reduces risks.',
      },
      {
        q: 'What does the 9th house mean for travel?',
        a: 'The 9th house (Dharma Bhava) governs long-distance journeys, especially those with spiritual, educational, or dharmic purpose. A strong 9th house with benefic planets creates opportunities for pilgrimage, higher education abroad, and meaningful long journeys. Jupiter\'s transit over the 9th cusp activates this house for auspicious travel.',
      },
      {
        q: 'How does the 3rd house affect short travel?',
        a: 'The 3rd house (Parakrama Bhava) governs short journeys, daily commute, courage in travel, and transportation. A strong 3rd lord supports comfortable daily travel and successful short business trips. The 3rd house ruler in Dasha activates this domain — Mercury Dasha is particularly favorable for communication-based travel and trade journeys.',
      },
    ],
    ctaText: 'Get Travel Prediction',
    keywords: ['travel astrology vedic', 'journey prediction kundali', 'travel muhurta jyotish', '3rd house travel', '9th house travel astrology', 'safe travel astrology india'],
  },

  spirituality: {
    slug:    'spirituality',
    icon:    '🕉️',
    title:   'Spiritual Astrology — Moksha & Dharma Path | Trikal Vaani',
    h1:      'Spirituality & Moksha in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, spiritual path is revealed through the 12th house (Moksha), 9th house (Dharma), Ketu\'s placement, and Jupiter as Guru karaka. BPHS Chapter 38 defines Sanyas Yoga. Get your spiritual reading at trikalvaani.com.',
    description: 'Vedic astrology spiritual path predictions. Moksha house analysis, Ketu karaka, Sanyas Yoga detection by Rohiit Gupta. Swiss Ephemeris accuracy for spiritual seekers.',
    planet: 'Ketu & Jupiter',
    house:  '9th & 12th Houses',
    bphsRef:'BPHS Chapter 38 — Sanyas Yoga',
    content: `Spirituality in Vedic astrology is the highest domain of human inquiry, governed by the 12th house (Moksha Bhava — liberation), the 9th house (Dharma Bhava — righteous path), the 8th house (occult and mystical knowledge), and Ketu as the primary Moksha karaka.

Ketu (South Node) represents past life spiritual credit, liberation from material world, and natural inclination toward meditation, renunciation, and mystical knowledge. Ketu in the 12th house, or Ketu Dasha in later life, is one of the most powerful indicators of spiritual awakening.

Jupiter (Guru) is the planet of wisdom, dharma, and divine grace. When Jupiter occupies the 9th or 12th house, or forms Hamsa Mahapurusha Yoga (own/exalted in Kendra), it creates a natural teacher, spiritual authority, or guide.

Sanyas Yoga — defined in BPHS Chapter 38 — forms when multiple planets occupy the 12th house or when the 9th and 10th lords combine with spiritual planets (Ketu, Jupiter, Saturn). This yoga indicates a life dedicated to spiritual pursuit, often including teaching, retreating from worldly affairs, or deep contemplative practice.

The Navamsa D9 chart reveals the soul's spiritual mission in this life. Vargottama planets (same Rashi in D1 and D9) carry particularly strong karmic weight for spiritual development.`,
    faqs: [
      {
        q: 'Which planet governs spirituality in Vedic astrology?',
        a: 'Ketu is the primary Moksha karaka — significator of liberation, past life spiritual credit, and natural inclination toward renunciation. Jupiter governs wisdom and dharmic path. Saturn governs discipline and vairagya (detachment earned through life lessons). The 9th (Dharma) and 12th (Moksha) houses are the primary spiritual houses in Vedic astrology.',
      },
      {
        q: 'What is Sanyas Yoga in Vedic astrology?',
        a: 'Sanyas Yoga forms when four or more planets (excluding Sun and Moon) occupy the same house, when strong 12th house placements combine with Ketu, or when the 9th and 10th lords join with spiritual planets. BPHS Chapter 38 defines this yoga as indicating a life dedicated to spiritual pursuit, renunciation, or teaching. Not all Sanyas Yoga natives become monks — many become spiritual teachers or guides.',
      },
      {
        q: 'Which Dasha period is most spiritually significant?',
        a: 'Ketu Dasha (7 years) and Jupiter Dasha (16 years) are the most spiritually significant periods. Ketu Dasha often brings spiritual awakening, detachment from material pursuits, and deep inner transformation. Saturn Dasha in later life (after 50) creates vairagya — earned detachment through life experience. These periods are ideal for meditation, spiritual study, and pilgrimage.',
      },
      {
        q: 'How does the 12th house relate to moksha in Vedic astrology?',
        a: 'The 12th house (Vyaya Bhava or Moksha Bhava) represents liberation from the cycle of birth and death, dissolution of ego, spiritual withdrawal from worldly affairs, and the return to divine source. Benefics in the 12th house create a natural meditative quality and spiritual aspiration. Ketu in the 12th is the strongest indicator of Moksha yoga in the natal chart.',
      },
      {
        q: 'What practices does Vedic astrology recommend for spiritual growth?',
        a: 'Classical Vedic remedies for spiritual development are planet-specific: Ketu remedies include Ganesha worship and Ketu Beej Mantra. Jupiter remedies include Guru mantra on Thursdays and Vishnu worship. Saturn remedies for vairagya include Shani Stotra and blue sapphire (with expert consultation). Puja, fasting, charity, and pilgrimage to sacred sites aligned with planetary directions are classical prescriptions.',
      },
    ],
    ctaText: 'Get Spiritual Reading',
    keywords: ['spiritual astrology vedic', 'moksha yoga kundali', 'ketu spirituality astrology', 'sanyas yoga jyotish', 'dharma path astrology', 'spiritual prediction india'],
  },

  wellbeing: {
    slug:    'wellbeing',
    icon:    '🌸',
    title:   'Mental Wellbeing Astrology — Mind & Peace Prediction | Trikal Vaani',
    h1:      'Mental Wellbeing in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, mental wellbeing is governed by the Moon (Manas karaka), 4th house (inner peace), and Mercury (nervous system). BPHS guides mental health analysis. Get your wellbeing reading at trikalvaani.com.',
    description: 'Vedic astrology mental wellbeing predictions. Moon karaka, 4th house analysis, anxiety and peace remedies by Rohiit Gupta. Swiss Ephemeris accuracy for mental health insights.',
    planet: 'Moon & Mercury',
    house:  '1st, 4th & 5th Houses',
    bphsRef:'BPHS Chapter 5 — Moon and Mental Faculties',
    content: `Mental wellbeing in Vedic astrology is primarily governed by the Moon (Chandra) as the Manas Karaka — the planet of mind, emotions, and psychological patterns. A strong, unafflicted Moon in the natal chart is the foundation of mental stability and emotional resilience.

The 4th house (Sukha Bhava) represents inner peace, contentment, and psychological foundation. When the 4th house is afflicted by Saturn or Rahu, anxiety, restlessness, and lack of inner peace can become persistent patterns.

Mercury (Budha) governs the nervous system and rational thinking. Mercury afflicted by Mars creates anxiety and overthinking. Mercury with Saturn creates chronic worry and negative thought patterns. Specific Mercury mantras and Wednesday fasting are classical remedies.

Kemadruma Yoga — formed when no planet occupies the 2nd or 12th house from the Moon — creates psychological isolation and mental vulnerability according to BPHS Chapter 36. Benefic planets aspecting the Moon counter this yoga's effects.

The Moon's Nakshatra at birth reveals fundamental psychological patterns. Ashlesha Nakshatra Moon creates intuitive but anxious minds. Rohini Nakshatra Moon creates emotional stability and contentment. Jyeshtha Nakshatra Moon creates a responsible but sometimes overburdened mental state.`,
    faqs: [
      {
        q: 'Which planet governs mental health in Vedic astrology?',
        a: 'The Moon (Chandra) is the primary Manas Karaka — ruler of mind, emotions, and psychological patterns. Mercury governs the nervous system and rational thinking. Saturn creates depression and chronic anxiety when afflicting the Moon. Rahu creates anxiety, obsessive thinking, and confusion. A strong, unafflicted Moon is the most important indicator of mental wellbeing in Vedic astrology.',
      },
      {
        q: 'What is Kemadruma Yoga and how does it affect mental health?',
        a: 'Kemadruma Yoga forms when no planet occupies the 2nd or 12th house from the Moon in the natal chart. BPHS Chapter 36 indicates this yoga can create psychological isolation, financial struggles, and mental vulnerability. However, if benefic planets aspect the Moon or if the Moon is in a Kendra, the yoga\'s negative effects are significantly reduced.',
      },
      {
        q: 'How does Moon affliction affect mental wellbeing?',
        a: 'Moon afflicted by Saturn creates depression, emotional heaviness, and separation from mother. Moon with Rahu creates anxiety, obsessive thoughts, and mental confusion. Moon with Mars creates emotional aggression and impulsive reactions. Moon with Ketu creates psychic sensitivity and emotional detachment. Classical remedies include Moon mantra (Om Chandraya Namah), white flower offerings on Mondays, and pearl or moonstone consultation.',
      },
      {
        q: 'Which Dasha periods are challenging for mental health?',
        a: 'Rahu Mahadasha (18 years) can create periods of mental confusion, anxiety, and unconventional thinking — especially if Rahu afflicts the Moon natally. Sade Sati (7.5 year Saturn transit over Moon) often creates emotional heaviness and life restructuring. Ketu Dasha can create detachment and existential questioning. These periods require conscious self-care, spiritual practice, and professional support.',
      },
      {
        q: 'What Vedic remedies help with mental peace and anxiety?',
        a: 'Classical Vedic remedies for mental wellbeing: Moon mantra (Om Chandraya Namah or Chandra Beej Mantra) 108 times on Mondays, white pearl wearing (with expert consultation for suitable Lagna), milk donation on Mondays, Shiva worship on Mondays for Moon strength, Hanuman Chalisa for Rahu-related anxiety, and daily meditation during Brahma Muhurta (1.5 hours before sunrise).',
      },
    ],
    ctaText: 'Get Wellbeing Reading',
    keywords: ['mental health astrology vedic', 'mind peace kundali', 'moon mental wellbeing', 'anxiety prediction jyotish', 'mental peace astrology india', 'wellbeing vedic prediction'],
  },

  marriage: {
    slug:    'marriage',
    icon:    '💍',
    title:   'Marriage Astrology — Vivah Yoga & Kundali Matching | Trikal Vaani',
    h1:      'Marriage in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, marriage is governed by the 7th house (spouse), 2nd house (family), 8th house (marital longevity), and Venus/Jupiter as Kalatra karaka. BPHS Chapter 24 defines Vivah Yoga. Mangal Dosha and Ashtakoot matching detected. Get marriage prediction at trikalvaani.com.',
    description: 'Vedic marriage astrology — timing, compatibility, Mangal Dosha analysis, and Ashtakoot matching. 7th, 2nd, 8th house analysis by Rohiit Gupta, Chief Vedic Architect. Swiss Ephemeris accuracy for Delhi NCR and India.',
    planet: 'Venus (men) & Jupiter (women)',
    house:  '7th, 2nd & 8th Houses',
    bphsRef:'BPHS Chapter 24 — Vivah Bhava + Stree Jataka',
    content: `Marriage in Vedic astrology is a sacred Vivah Yoga governed by three principal houses: the 7th house (Yuvati Bhava — spouse and marital partnership), the 2nd house (Kutumba Bhava — family integration), and the 8th house (Mangalya Bhava — marital longevity and protection of the bond).

For men's charts, Venus (Shukra) is the Kalatra karaka — natural significator of wife and marital harmony. For women's charts, Jupiter (Guru) represents the husband as Purusha karaka. The strength and placement of these karakas in the natal chart and the D9 Navamsa reveal the quality of marriage.

Mangal Dosha (Kuja Dosha) — formed when Mars occupies the 1st, 2nd, 4th, 7th, 8th, or 12th house — is one of the most analyzed factors in Vedic marriage astrology. BPHS prescribes specific cancellations and remedies including Mangal Bhat puja, red coral with expert consultation, and matching with another Manglik partner.

Ashtakoot Guna Milan (8-point compatibility) is the classical Vedic marriage matching system, evaluating Varna (spiritual ego), Vashya (mutual control), Tara (health and birth star), Yoni (sexual compatibility), Graha Maitri (mental compatibility), Gana (temperament), Bhakoot (love and family welfare), and Nadi (genetic and health compatibility). A score above 18/36 is considered acceptable; 24+ is excellent.

The 8th house (Mangalya Bhava) determines marital longevity — afflictions here can indicate separation risks or widowhood. Strong Jupiter aspecting the 8th house provides Mangalya Suraksha (protection of marriage). Marriage timing is precisely calculated through Vimshottari Dasha — Venus or Jupiter Dasha periods are most auspicious for wedding ceremonies.`,
    faqs: [
      {
        q: 'What is Mangal Dosha and how does it affect marriage?',
        a: 'Mangal Dosha (also called Kuja Dosha or Manglik Dosha) is formed when Mars occupies the 1st, 2nd, 4th, 7th, 8th, or 12th house in the natal chart. It is considered an obstruction to marriage harmony and can delay marriage or create marital conflicts. BPHS prescribes cancellations — when both partners are Manglik, the dosha is mutually neutralized. Classical remedies include Mangal Bhat puja, Hanuman Chalisa recitation, and specific Mars mantras.',
      },
      {
        q: 'What is Ashtakoot Guna Milan in marriage matching?',
        a: 'Ashtakoot Guna Milan is the classical Vedic 8-point compatibility system for marriage. The 8 factors are: Varna (1 point), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), and Nadi (8) — totaling 36 points. A score of 18+ is acceptable, 24+ is excellent. Nadi (8 points) and Bhakoot (7 points) carry the highest weight and require careful analysis as classical cancellations exist for both.',
      },
      {
        q: 'When will I get married according to Vedic astrology?',
        a: 'Marriage timing is calculated through Vimshottari Dasha analysis. Marriage typically occurs during the Dasha or Antardasha of: the 7th lord, Venus (for men) or Jupiter (for women), planets in the 7th house, or planets aspecting the 7th house. The most likely marriage window is when Jupiter transits over the 7th house or 7th lord. Pratyantar Dasha analysis can pinpoint specific marriage windows within 1-3 months.',
      },
      {
        q: 'How does the 8th house affect marriage longevity?',
        a: 'The 8th house (Mangalya Bhava) governs the longevity and stability of marriage. A strong, unafflicted 8th house with Jupiter\'s aspect ensures Mangalya Suraksha (protection of marriage). Malefics like Saturn, Rahu, Ketu, or Mars afflicting the 8th house or 8th lord can indicate marital challenges, separation risks, or health issues affecting the spouse. Strong Jupiter remedies and Mangalya Stotra recitation are classical protective measures.',
      },
      {
        q: 'What remedies help for delayed marriage in Vedic astrology?',
        a: 'For delayed marriage caused by Saturn or Mangal Dosha: Friday fasting and Venus mantra (Om Shukraya Namah) 108 times for unmarried girls, Thursday fasting and Jupiter mantra for unmarried men, Swayamvara Parvati mantra recitation, donation of yellow items to married priests, and visit to specific temples (Tirumala, Vaitheeswaran Koil) for marriage blessings. Gomati Chakra and specific gemstones require expert prescription.',
      },
    ],
    ctaText: 'Get Marriage Prediction',
    keywords: ['marriage astrology vedic', 'mangal dosha analysis', 'ashtakoot guna milan', 'kundali matching online', 'vivah yoga prediction', 'marriage timing astrology', 'manglik remedy', 'marriage jyotish delhi'],
  },

  business: {
    slug:    'business',
    icon:    '💼',
    title:   'Business Astrology — Entrepreneur & Self-Employment Yoga | Trikal Vaani',
    h1:      'Business & Entrepreneurship in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, business success is governed by the 7th house (trade), 10th house (enterprise), 11th house (gains), and Mercury as Vyapar karaka. BPHS Chapter 25 defines Vyapar Yoga distinct from job-based career. Get your business reading at trikalvaani.com.',
    description: 'Vedic business astrology — entrepreneurship potential, partnership analysis, business timing, and trade Yogas. 7th, 10th, 11th house analysis by Rohiit Gupta. Swiss Ephemeris accuracy for Delhi NCR business community.',
    planet: 'Mercury, Mars & Rahu',
    house:  '7th, 10th & 11th Houses',
    bphsRef:'BPHS Chapter 25 — Karma Bhava + Vyapar Yoga',
    content: `Business and entrepreneurship in Vedic astrology is fundamentally different from a salaried career, governed by the 7th house (Yuvati/Vyapar Bhava — trade and partnerships), the 10th house (Karma Bhava — enterprise and authority), and the 11th house (Labha Bhava — gains and fulfillment of business desires).

Mercury (Budha) is the Vyapar karaka — natural significator of trade, commerce, calculation, and business intelligence. A strong Mercury in the 7th, 10th, or 11th house creates natural business acumen. Mercury in its own signs (Mithun, Kanya) or exaltation (Kanya) provides exceptional commercial talent.

Mars (Mangal) provides the initiative, courage, and competitive drive needed for entrepreneurship. The combination of Mercury and Mars (Budha-Mangal Yoga) is highly favorable for trade, sales, and business ventures. This yoga is supported by Jataka Parijata as a powerful indicator of self-made business success.

Rahu is the karaka of modern, unconventional, and large-scale business — particularly in technology, foreign trade, mass production, and disruptive industries. Rahu in the 7th, 10th, or 11th house during its Dasha creates rapid business expansion, often through unconventional means.

The 7th lord's placement is crucial for partnership business. When the 7th lord is strong and well-placed, business partnerships flourish. Vipreet Raj Yoga (6th, 8th, 12th lords in mutual exchange) paradoxically benefits business — competitors weaken, debts dissolve, and hidden opportunities emerge. The current Pratyantar Dasha gives 3-7 day windows for major business decisions like launches, contracts, and partnerships.`,
    faqs: [
      {
        q: 'Which planet is best for business in Vedic astrology?',
        a: 'Mercury (Budha) is the primary business and trade significator (Vyapar karaka). A strong Mercury creates natural commercial intelligence. Mars provides entrepreneurial initiative and competitive drive. Rahu indicates modern, technology-driven, or unconventional business. Jupiter blesses ethical business practices with long-term growth. The combination of strong Mercury + Mars + favorable 11th house creates the strongest business yoga.',
      },
      {
        q: 'What is the difference between career and business in Vedic astrology?',
        a: 'A salaried career is primarily governed by the 10th house and Saturn (discipline, employer relationships). Business is primarily governed by the 7th house (independence, partnerships, customers) and Mercury (trade). When the 7th lord is stronger than the 10th lord and Mercury is well-placed, the native is naturally inclined toward entrepreneurship rather than employment. The 11th house (gains) is critical for both but more pronounced in business success.',
      },
      {
        q: 'When is the best time to start a business according to Vedic astrology?',
        a: 'Auspicious business launch timing: Mercury Dasha or Antardasha, Wednesday or Thursday launch day, Pushya, Rohini, or Hasta Nakshatra, Shukla Paksha (waxing moon), Abhijeet Muhurta for inauguration ceremonies. Avoid Rahu Kaal, Yamaghanta, and Saturn\'s direct station for business launches. Coordinated with Vimshottari Dasha analysis, this ensures the strongest foundation for the business cycle.',
      },
      {
        q: 'How does Rahu affect business in Vedic astrology?',
        a: 'Rahu in the 7th, 10th, or 11th house during its Dasha creates rapid business expansion, especially in technology, foreign trade, e-commerce, and disruptive industries. Rahu Dasha businesses often grow quickly but require careful management to avoid scandal or sudden reversal. Classical remedies for Rahu in business include donation to lepers/disadvantaged, blue blanket on Saturdays, and specific Rahu Beej Mantra recitation.',
      },
      {
        q: 'What Vedic yoga indicates business partnership success?',
        a: 'Strong 7th house with benefic planets (Jupiter, Venus, or Mercury) indicates harmonious business partnerships. The 7th lord in the 11th house creates partnerships that directly generate income. Vipreet Raj Yoga (6th, 8th, 12th lords in mutual exchange) creates business success through overcoming obstacles. Budha-Aditya Yoga (Sun-Mercury together) creates intellectual leadership in business. Detailed Navamsa D9 analysis is essential before entering major partnerships.',
      },
    ],
    ctaText: 'Get Business Prediction',
    keywords: ['business astrology vedic', 'entrepreneur kundali analysis', 'vyapar yoga vedic', 'business launch muhurta', 'partnership astrology', 'self employment jyotish', 'business success vedic', 'startup astrology delhi'],
  },

  'foreign-settlement': {
    slug:    'foreign-settlement',
    icon:    '🌍',
    title:   'Foreign Settlement Astrology — Videsh Yoga & NRI Path | Trikal Vaani',
    h1:      'Foreign Settlement in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, foreign settlement is governed by the 12th house (Vyaya, foreign lands), 7th house (away from birthplace), and Rahu as the foreign significator. BPHS Chapter 29 defines Videsh Yoga for permanent settlement abroad. Get your NRI reading at trikalvaani.com.',
    description: 'Vedic astrology foreign settlement predictions for NRIs, immigrants, and citizenship aspirants. 12th, 7th, and 4th house analysis by Rohiit Gupta. Swiss Ephemeris-powered Videsh Yoga detection for permanent residency and PR planning.',
    planet: 'Rahu & Moon',
    house:  '12th, 7th & 4th Houses',
    bphsRef:'BPHS Chapter 29 — Vyaya Bhava + Videsh Yoga',
    content: `Foreign settlement in Vedic astrology is fundamentally different from temporary travel — it indicates permanent or long-term relocation to lands far from the place of birth. This is governed primarily by the 12th house (Vyaya Bhava — distant lands, settlement abroad, dissolution of native ties), the 7th house (away from birthplace, partnerships in distant lands), and the 4th house (homeland — the house being left behind).

Rahu is the supreme significator of foreign settlement. When Rahu occupies the 7th, 9th, or 12th house, or its lord is connected with these houses, Videsh Yoga is strongly indicated. Rahu's Dasha period (18 years) often coincides with permanent moves abroad, citizenship changes, or NRI establishment.

The 12th lord's placement is the most critical indicator. When the 12th lord is in the 1st house (Lagna) or 9th house, foreign settlement is strongly indicated. The 12th lord in the 7th creates marriage in foreign lands or NRI partnership. Multiple planets in the 12th house create powerful Videsh Yoga according to classical texts.

The Moon (Chandra) represents the homeland and emotional connection to one's birthplace. When the Moon is afflicted by Rahu or placed in dusthana houses (6th, 8th, 12th), emotional ties to homeland weaken and settlement abroad becomes natural. A weak 4th house combined with strong 12th house indicators creates the classic NRI pattern.

For NRIs considering return to India, Saturn or Jupiter Dasha periods favor stable repatriation. The timing of citizenship applications and PR processes should align with favorable Rahu, Jupiter, or 12th lord Dasha periods. Specific Muhurta selection for visa applications, citizenship oaths, and major immigration milestones significantly improves outcomes.`,
    faqs: [
      {
        q: 'What is Videsh Yoga in Vedic astrology?',
        a: 'Videsh Yoga (foreign settlement yoga) is formed by several classical combinations: (1) 12th lord placed in the 1st, 7th, or 9th house, (2) Multiple planets occupying the 12th house, (3) Rahu in the 7th, 9th, or 12th house, (4) Strong connection between the Moon and Rahu, indicating emotional ties to foreign lands, (5) 4th lord weak or afflicted while 12th lord is strong. BPHS Chapter 29 defines these combinations as indicators of permanent foreign residence.',
      },
      {
        q: 'How is foreign settlement different from travel in astrology?',
        a: 'Travel astrology focuses on the 3rd house (short trips) and 9th house (long journeys, often return-oriented) — these indicate temporary movement. Foreign settlement specifically involves the 12th house (Vyaya — dissolution of native ties), permanent relocation patterns through Rahu, and weakening of 4th house connections to homeland. A native may have strong travel yogas (frequent trips) without having settlement yogas (permanent relocation) — these are analytically distinct.',
      },
      {
        q: 'Which Dasha period is best for moving abroad permanently?',
        a: 'Rahu Mahadasha (18 years) is the most powerful period for permanent foreign settlement, especially if Rahu connects with the 7th, 9th, or 12th house in the natal chart. Jupiter Dasha favors auspicious settlement (academic migration, family-sponsored moves). Saturn Dasha may delay but stabilize foreign settlement. The Antardasha and Pratyantar combinations within these periods provide precise timing windows for visa applications, employment offers, and immigration milestones.',
      },
      {
        q: 'Can astrology predict citizenship and PR approval?',
        a: 'Yes. Citizenship and Permanent Residency (PR) approval are best aligned with favorable Rahu, Jupiter, or 12th lord Dasha periods. Rohini, Pushya, or Hasta Nakshatra on application submission days improves outcomes. Auspicious Muhurta elements include Thursday (Jupiter), Wednesday (Mercury for paperwork), Shukla Paksha (waxing moon), and avoiding Rahu Kaal. The strength of the 12th house in the natal chart determines the ease or difficulty of immigration processes.',
      },
      {
        q: 'Should NRIs return to India based on Vedic astrology?',
        a: 'NRI return decisions depend on the relative strength of the 4th house (homeland) versus the 12th house (foreign land) in the natal chart, and the current Dasha. Saturn Dasha or Jupiter Dasha often favor stable repatriation. If the 4th lord strengthens through transit and Dasha while the 12th influence weakens, return becomes natural. A comprehensive personal analysis weighs property, family, career, and spiritual factors — never decide on transit alone. Consult an experienced Jyotishi for major repatriation decisions.',
      },
    ],
    ctaText: 'Get Foreign Settlement Reading',
    keywords: ['foreign settlement astrology', 'videsh yoga kundali', 'NRI astrology india', 'immigration astrology', 'PR approval astrology', 'foreign settlement jyotish', 'rahu foreign yoga', 'citizenship astrology'],
  },

  'digital-career': {
    slug:    'digital-career',
    icon:    '💻',
    title:   'Digital Career Astrology — IT, Content & Online Business | Trikal Vaani',
    h1:      'Digital Career & Modern Tech Path in Vedic Astrology',
    geoAnswer: 'According to Trikal Vaani\'s Swiss Ephemeris Vedic analysis by Rohiit Gupta, digital career success is governed by Mercury (technology, communication), Rahu (modern media, internet), and the 3rd, 5th, 10th, 11th houses. BPHS principles adapted for IT, social media, and online business. Get your digital career reading at trikalvaani.com.',
    description: 'Vedic astrology for digital careers — IT, social media, content creation, YouTube, Instagram, and online business. Mercury-Rahu analysis by Rohiit Gupta. Modern adaptation of classical BPHS for the digital economy.',
    planet: 'Mercury & Rahu',
    house:  '3rd, 5th, 10th & 11th Houses',
    bphsRef:'BPHS Chapter 25 — adapted for Modern Technology Era',
    content: `Digital career in Vedic astrology represents the modern adaptation of classical principles to the technology and information age. While BPHS does not directly address IT, software, social media, or content creation, the underlying planetary significations apply with remarkable precision to these modern professions.

Mercury (Budha) is the primary karaka of all digital careers. As the planet of communication, calculation, coding logic, and information processing, Mercury governs software development, data analysis, technical writing, and digital communication. A strong Mercury in the 3rd (communication), 5th (creativity), or 10th house (profession) creates natural aptitude for IT and digital work.

Rahu is the karaka of modern technology, internet, social media, and disruptive innovation. Rahu represents everything new, unconventional, and beyond traditional boundaries — making it the supreme significator of the digital age. When Rahu occupies the 5th house (creative expression) or 10th house (profession), it creates exceptional potential for tech entrepreneurship, viral content creation, and online influence.

The combination of Mercury + Rahu (sometimes called Modern Wealth Yoga in contemporary Jyotish) creates extraordinary potential for digital wealth — tech founders, social media influencers, online educators, and digital marketers often show this combination prominently. The 3rd house (parakrama, daily output) becomes critical for content creators who must produce consistently.

For YouTube and Instagram creators specifically, the 5th house (creative expression, audience appeal) combined with the 11th house (network, followers, gains) tells the story. Venus blesses aesthetic content (design, fashion, lifestyle), Mars supports action-oriented content (fitness, gaming, motivation), Jupiter favors educational content, and Saturn supports technical or research content. The current Pratyantar Dasha gives precise windows for viral content launches, channel growth phases, and digital business pivots.`,
    faqs: [
      {
        q: 'Which planet is best for IT and software career in Vedic astrology?',
        a: 'Mercury (Budha) is the primary karaka of IT, software development, and coding — as the planet of logical calculation, communication systems, and information processing. Mercury in own signs (Mithun, Kanya) or exalted in Kanya creates exceptional IT aptitude. Rahu strengthens the modern technology dimension. The combination of Mercury + Rahu in the 3rd, 5th, or 10th house is the strongest yoga for software careers and tech entrepreneurship.',
      },
      {
        q: 'What planetary combination favors YouTube and content creation?',
        a: 'For YouTube, Instagram, and content creation success, the 5th house (creative expression, audience appeal) and 11th house (network, followers, monetization) must be strong. Venus + Mercury combination creates aesthetic and communicative talent. Rahu in the 5th creates viral potential and mass appeal. The Moon\'s strength determines emotional connection with audience. Specific content niches align with planetary signatures: Jupiter for educational, Venus for lifestyle, Mars for gaming/fitness, Saturn for research-heavy content.',
      },
      {
        q: 'Can Vedic astrology predict digital business success?',
        a: 'Yes. Digital business success indicators include: strong Mercury (commercial intelligence applied digitally), favorable Rahu (modern technology and scale), strong 7th house (online customer relationships), strong 11th house (digital income streams and network). Vipreet Raj Yoga benefits digital ventures by helping overcome platform algorithm challenges and competitive pressure. Pratyantar Dasha analysis pinpoints specific 3-7 day windows for major launches, product pivots, and growth campaigns.',
      },
      {
        q: 'How does Rahu help in social media and influencer careers?',
        a: 'Rahu is the supreme significator of social media and digital influence. Rahu represents mass attention, going viral, breaking traditional norms, and the unconventional path. When Rahu occupies the 5th house (creative expression to audience) or 10th house (public profession), it creates exceptional potential for influencer careers. Rahu in the 11th house creates extraordinary digital network and follower growth. Rahu Mahadasha (18 years) often coincides with peak digital fame and online business expansion.',
      },
      {
        q: 'What is the best time to launch a YouTube channel or digital business?',
        a: 'Auspicious launch timing for digital ventures: Mercury Dasha or Antardasha (technology and content thrive), favorable Rahu period (modern reach and virality), Wednesday or Thursday launch day, Pushya or Hasta Nakshatra for sustained growth, Shukla Paksha (waxing moon) for momentum, and Abhijeet Muhurta for inauguration. Avoid Rahu Kaal and Saturn\'s direct station. The first video, post, or product launch creates the karmic foundation for the entire digital venture — proper Muhurta selection materially improves outcomes.',
      },
    ],
    ctaText: 'Get Digital Career Reading',
    keywords: ['digital career astrology', 'IT astrology vedic', 'youtube creator astrology', 'instagram influencer astrology', 'online business astrology', 'tech career kundali', 'social media astrology india', 'digital marketing astrology'],
  },
};

interface Props {
  params: { domain: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const config = DOMAIN_PAGES[params.domain];
  if (!config) return { title: 'Trikal Vaani' };

  return {
    // ⬇ FIX 6 (v2.1): title.absolute prevents layout.tsx template from adding | Trikal Vaani suffix
    title: { absolute: config.title },
    description: config.description,
    keywords:    config.keywords,
    authors:     [{ name: 'Rohiit Gupta', url: 'https://trikalvaani.com/founder' }],
    alternates: {
      canonical: `https://trikalvaani.com/${config.slug}`,
      languages: {
        'hi': `https://trikalvaani.com/hi/${config.slug}`,
        'en': `https://trikalvaani.com/${config.slug}`,
      },
    },
    openGraph: {
      title:       config.title,
      description: config.description,
      url:         `https://trikalvaani.com/${config.slug}`,
      siteName:    'Trikal Vaani',
      locale:      'en_IN',
      type:        'article',
      images: [
        {
          url: 'https://trikalvaani.com/og-image.png',
          width: 1200,
          height: 630,
          alt: config.h1,
        },
      ],
    },
    twitter: {
      card:        'summary_large_image',
      title:       config.title,
      description: config.description,
      images: ['https://trikalvaani.com/og-image.png'],
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(DOMAIN_PAGES).map(slug => ({ domain: slug }));
}

export default function DomainPage({ params }: Props) {
  if (RESERVED_SLUGS.includes(params.domain)) notFound();

  const config = DOMAIN_PAGES[params.domain];
  if (!config) notFound();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://trikalvaani.com' },
      { '@type': 'ListItem', position: 2, name: config.h1, item: `https://trikalvaani.com/${config.slug}` },
    ],
  };

  const articleSchema = {
    '@context':       'https://schema.org',
    '@type':          'Article',
    headline:          config.h1,
    description:       config.description,
    image: {
      '@type': 'ImageObject',
      url:     'https://trikalvaani.com/og-image.png',
      width:   1200,
      height:  630,
    },
    author: {
      '@type':   'Person',
      name:      'Rohiit Gupta',
      jobTitle:  'Chief Vedic Architect',
      url:       'https://trikalvaani.com/founder',
      knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'BPHS', 'Swiss Ephemeris', 'Vimshottari Dasha'],
    },
    publisher: {
      '@type': 'Organization',
      name:    'Trikal Vaani',
      url:     'https://trikalvaani.com',
      logo:    'https://trikalvaani.com/logo.png',
    },
    mainEntityOfPage: `https://trikalvaani.com/${config.slug}`,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: config.faqs.map(faq => ({
      '@type': 'Question',
      name:    faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const serviceSchema = {
    '@context':  'https://schema.org',
    '@type':     'Service',
    name:         `${config.h1} — Trikal Vaani`,
    description:  config.description,
    provider: {
      '@type':   'Person',
      name:      'Rohiit Gupta',
      jobTitle:  'Chief Vedic Architect',
      address: {
        '@type':        'PostalAddress',
        addressRegion:  'Delhi NCR',
        addressCountry: 'IN',
      },
    },
    serviceType: 'Vedic Astrology Prediction',
    areaServed:  'India',
    url:         `https://trikalvaani.com/${config.slug}`,
  };

  // ⬇ SESSION E2: HowTo Schema for voice search + smart speaker citation
  const howToSchema = {
    '@context':    'https://schema.org',
    '@type':       'HowTo',
    name:           `How to Get a Vedic ${config.h1} Reading on Trikal Vaani`,
    description:    `Get a personalized Vedic astrology reading for ${config.h1.toLowerCase()} using Swiss Ephemeris precision and Rohiit Gupta's BPHS framework.`,
    image:          'https://trikalvaani.com/og-image.png',
    totalTime:      'PT60S',
    estimatedCost: {
      '@type':    'MonetaryAmount',
      currency:   'INR',
      value:      '0',
    },
    supply: [
      { '@type': 'HowToSupply', name: 'Date of birth' },
      { '@type': 'HowToSupply', name: 'Exact time of birth' },
      { '@type': 'HowToSupply', name: 'Place of birth' },
    ],
    tool: { '@type': 'HowToTool', name: 'Trikal Vaani AI' },
    step: [
      {
        '@type':   'HowToStep',
        position:  1,
        name:      'Open Trikal Vaani',
        text:      'Visit trikalvaani.com — no signup, no credit card required.',
        url:       'https://trikalvaani.com#birth-form',
      },
      {
        '@type':   'HowToStep',
        position:  2,
        name:      'Enter your birth details',
        text:      'Type your name, date of birth, exact time, and place of birth. The form auto-completes your city.',
        url:       'https://trikalvaani.com#birth-form',
      },
      {
        '@type':   'HowToStep',
        position:  3,
        name:      `Select ${config.h1}`,
        text:      `Choose the ${config.h1.toLowerCase()} life domain — analysis focuses on ${config.house} and ${config.planet}.`,
        url:       `https://trikalvaani.com/${config.slug}`,
      },
      {
        '@type':   'HowToStep',
        position:  4,
        name:      'Receive Vedic prediction',
        text:      `Trikal Vaani computes your kundali and delivers a personalized ${config.h1.toLowerCase()} reading based on ${config.bphsRef}.`,
        url:       'https://trikalvaani.com',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <div className="min-h-screen" style={{ background: '#080B12', color: '#e2e8f0' }}>

        <div className="max-w-4xl mx-auto px-4 pt-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <span style={{ color: '#D4AF37' }}>{config.h1}</span>
          </nav>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{config.icon}</div>
            <h1 className="text-3xl font-bold text-white mb-3">{config.h1}</h1>
            <div className="max-w-2xl mx-auto mt-4 p-4 rounded-xl text-left"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-xs text-amber-500 font-semibold mb-2 uppercase tracking-wider">Vedic Astrology Answer</p>
              <p className="text-sm text-slate-300 leading-relaxed">{config.geoAnswer}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: 'Key Planet', value: config.planet },
              { label: 'Primary House', value: config.house },
              { label: 'Classical Source', value: config.bphsRef },
            ].map(chip => (
              <div key={chip.label} className="px-4 py-2 rounded-full text-xs"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <span style={{ color: '#64748b' }}>{chip.label}: </span>
                <span style={{ color: '#D4AF37' }}>{chip.value}</span>
              </div>
            ))}
          </div>

          <div className="text-center mb-10">
            <Link href="/#birth-form"
              className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}>
              {config.ctaText} — Free 🔱
            </Link>
            <p className="text-xs text-slate-500 mt-2">Swiss Ephemeris accuracy | BPHS classical analysis</p>
          </div>

          <article className="rounded-2xl p-6 sm:p-8 mb-8"
            style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xs px-2 py-1 rounded"
                style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                By Rohiit Gupta, Chief Vedic Architect
              </span>
            </div>
            <div className="prose prose-invert max-w-none">
              {config.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm leading-relaxed text-slate-300 mb-4">{para}</p>
              ))}
            </div>
          </article>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions — {config.h1}</h2>
            <div className="space-y-4">
              {config.faqs.map((faq, i) => (
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

          <div className="rounded-2xl p-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))', border: '1px solid rgba(212,175,55,0.25)' }}>
            <div className="text-3xl mb-3">🔱</div>
            <h2 className="text-xl font-bold text-white mb-2">Get Your Personal {config.h1} Reading</h2>
            <p className="text-sm text-slate-400 mb-5">
              Swiss Ephemeris accuracy + BPHS classical analysis + Bhrigu Nandi patterns.<br/>
              By Rohiit Gupta, Chief Vedic Architect, Delhi NCR
            </p>
            <Link href="/#birth-form"
              className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}>
              {config.ctaText} — Free Reading 🔱
            </Link>
            <p className="text-xs text-slate-600 mt-3">No credit card. Instant results. Trusted by thousands across India.</p>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Related Free Calculators</h3>
            <div className="flex flex-wrap gap-2">
              {(CALCULATOR_LINKS[config.slug] || []).map(calc => (
                <Link key={calc.slug} href={`/calculators/${calc.slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs hover:text-amber-300 transition-colors"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
                  {calc.emoji} {calc.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Explore Other Life Domains</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(DOMAIN_PAGES)
                .filter(d => d.slug !== config.slug)
                .slice(0, 6)
                .map(d => (
                  <Link key={d.slug} href={`/${d.slug}`}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-amber-400 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {d.icon} {d.h1.split(' ')[0]}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
