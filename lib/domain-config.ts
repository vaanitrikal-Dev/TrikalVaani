/**
 * ============================================================
 * TRIKAL VAANI — Dard-e-Dil Domain Configuration
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/domain-config.ts
 * VERSION: 1.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * PURPOSE:
 *   Complete intelligence configuration for all 11 Dard-e-Dil domains
 *   across 3 generational segments (Gen Z / Millennial / Gen X).
 *
 *   Every domain defines:
 *   - Which houses Gemini must analyze (primary + secondary)
 *   - Which planets are significators for that domain
 *   - Which Dasha lords are most relevant
 *   - Whether world context (market/geo) should be injected
 *   - Time window for predictions
 *   - Classical BPHS basis for analysis
 *   - Whether dual chart (synastry) is required
 *   - The locked Gemini output JSON schema for that domain
 *   - Anti-hallucination rules specific to domain
 *
 * SEGMENTS:
 *   Gen Z      → Age 11–31  → 4 domains
 *   Millennial → Age 32–46  → 4 domains
 *   Gen X      → Age 47–56  → 3 domains
 *
 * USAGE:
 *   import { getDomainConfig, detectSegmentFromAge } from '@/lib/domain-config'
 *   const config = getDomainConfig('mill_karz_mukti')
 * ============================================================
 */

// ─── DYNAMIC DATE HELPER ──────────────────────────────────────────────────────
// No hardcoded dates anywhere in this file
export function getCurrentPeriod(): {
  isoDate: string;
  monthYear: string;
  year: number;
  quarter: string;
  financialYear: string;
} {
  const now   = new Date();
  const y     = now.getFullYear();
  const m     = now.getMonth();
  const d     = now.getDate();
  const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const fyStart = m >= 3 ? y : y - 1;
  return {
    isoDate:       `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
    monthYear:     `${MONTHS[m]} ${y}`,
    year:          y,
    quarter:       `Q${Math.floor(m / 3) + 1} ${y}`,
    financialYear: `FY ${fyStart}-${String(fyStart + 1).slice(-2)}`,
  };
}

// ─── CORE TYPES ───────────────────────────────────────────────────────────────

export type Segment = 'genz' | 'millennial' | 'genx';

export type DomainId =
  // Gen Z
  | 'genz_ex_back'
  | 'genz_toxic_boss'
  | 'genz_manifestation'
  | 'genz_dream_career'
  // Millennial
  | 'mill_property_yog'
  | 'mill_karz_mukti'
  | 'mill_childs_destiny'
  | 'mill_parents_wellness'
  // Gen X
  | 'genx_retirement_peace'
  | 'genx_legacy_inheritance'
  | 'genx_spiritual_innings';

export type WorldContextType = 'none' | 'market' | 'realestate' | 'general';
export type TimeWindow = '30days' | '60days' | '90days' | '6months' | '12months' | '24months' | '36months';
export type AnalysisType = 'single' | 'dual'; // dual = synastry, needs 2 charts

export interface House {
  number: number;
  significance: string; // why this house matters for this domain
}

export interface PlanetSignificator {
  planet: string;
  role: string;         // what this planet represents in this domain
  checkFor: string[];   // what aspects/positions to look for
}

export interface ClassicalBasis {
  text: string;         // BPHS / Jataka Parijata / Saravali / Phaladeepika
  chapter?: string;     // chapter reference if available
  rule: string;         // the actual classical rule being applied
}

export interface DomainConfig {
  id: DomainId;
  segment: Segment;
  displayName: string;          // UI display name (from your screenshots)
  tagline: string;              // subtitle from UI
  analysisType: AnalysisType;
  timeWindow: TimeWindow;
  worldContext: WorldContextType;

  // Astrological focus
  primaryHouses: House[];
  secondaryHouses: House[];
  keyPlanets: PlanetSignificator[];
  dashaFocus: string[];         // which Dasha lords most relevant
  yogasToCheck: string[];       // specific yogas Gemini must check

  // Classical grounding
  classicalBasis: ClassicalBasis[];

  // Gemini behavior rules
  analysisDepthNote: string;    // what Gemini must focus on
  antiHallucinationRules: string[]; // explicit don'ts for this domain
  worldContextSearchTerms: string[]; // what to search if worldContext !== 'none'

  // Output schema additions (beyond base schema)
  extraOutputFields: Record<string, string>; // field → description

  // UI metadata
  icon: string;                 // emoji for UI
  accentColor: string;          // tailwind color class
  badgeLabel?: string;          // "Dual Chart" etc.
}

// ─── BASE OUTPUT SCHEMA ───────────────────────────────────────────────────────
// Every domain returns this base + its extraOutputFields
// Gemini is instructed to ALWAYS return valid JSON matching this schema
export const BASE_OUTPUT_SCHEMA = `
{
  "domain": "string — domain ID",
  "headline": "string — one powerful sentence naming a specific planet",
  "periodSummary": "string — what current Dasha period means for THIS domain specifically",
  "keyInfluences": [
    {
      "planet": "string",
      "position": "sign + house number",
      "effect": "string — specific effect on THIS domain only",
      "classicalBasis": "string — BPHS/Jataka Parijata chapter or rule"
    }
  ],
  "worldContext": {
    "used": "boolean",
    "summary": "string — how current world situation affects prediction, or null if not used",
    "dataDate": "string — date of world data used (dynamic, never hardcoded)"
  },
  "actionWindows": [
    {
      "dateRange": "string — DD MMM YYYY to DD MMM YYYY",
      "action": "string — what to do",
      "planetaryBasis": "string — why this window is favorable"
    }
  ],
  "avoidWindows": [
    {
      "dateRange": "string — DD MMM YYYY to DD MMM YYYY",
      "reason": "string — specific planetary reason to avoid"
    }
  ],
  "remedies": [
    {
      "remedy": "string — specific remedy",
      "classicalBasis": "string — classical source",
      "effort": "easy | moderate | intensive",
      "timing": "string — best time/day to perform"
    }
  ],
  "jinaGuidance": "string — which Trikal Vaani page/service to visit next with URL",
  "confidenceLevel": "high | medium | low",
  "confidenceReason": "string — why this confidence level (e.g. birth time unknown = low)",
  "dataUsed": {
    "chartComplete": "boolean",
    "worldContextFetched": "boolean",
    "dashaLevel": "string — e.g. Jupiter-Saturn-Mars (MD-AD-PD)"
  }
}`;

// ─── ANTI-HALLUCINATION BASE RULES ───────────────────────────────────────────
// Applied to every domain — domain-specific rules add on top
export const BASE_ANTI_HALLUCINATION_RULES = [
  'Never invent planet positions — use ONLY what is in the chart object provided',
  'Never predict specific events (job offer on X date) — predict windows and tendencies',
  'If birth time is unknown or approximate, set confidenceLevel to low and explain why',
  'Never mix Western astrology — use Vedic only with Lahiri Ayanamsha',
  'Every keyInfluence must cite a classical text — no uncited claims',
  'Never use market prices or policy rates from training data — always note dataDate as dynamic',
  'If a planet is not significantly placed for this domain, do not force-fit analysis',
  'actionWindows must use real calendar dates computed from Dasha periods — never generic',
];

// ─── 11 DOMAIN CONFIGURATIONS ────────────────────────────────────────────────

const DOMAINS: Record<DomainId, DomainConfig> = {

  // ════════════════════════════════════════════════════════════════
  // GEN Z — DOMAIN 1
  // ════════════════════════════════════════════════════════════════
  genz_ex_back: {
    id:           'genz_ex_back',
    segment:      'genz',
    displayName:  'Ex-Back & Closure',
    tagline:      'Venus & Moon karmic bond analysis',
    analysisType: 'dual',
    timeWindow:   '90days',
    worldContext: 'none',
    icon:         '💔',
    accentColor:  'rose',
    badgeLabel:   'Dual Chart',

    primaryHouses: [
      { number: 7,  significance: 'Primary partner house — conditions of relationship karma' },
      { number: 5,  significance: 'Purva Punya / love affairs / emotional connection' },
      { number: 12, significance: 'Karmic bonds, hidden ties, separation and reunion' },
    ],
    secondaryHouses: [
      { number: 2,  significance: 'Family acceptance, voice in the relationship' },
      { number: 11, significance: 'Fulfillment of desires — will reunion manifest?' },
      { number: 8,  significance: 'Transformation, depth of bond, karmic debt' },
    ],

    keyPlanets: [
      {
        planet:   'Venus',
        role:     'Primary significator of love and karmic bonds',
        checkFor: ['Venus condition in D1', 'Venus in D9 Navamsa', 'Venus-Rahu conjunction (obsession)', 'Venus in 12th (hidden love)'],
      },
      {
        planet:   'Moon',
        role:     'Emotional mind, attachment patterns',
        checkFor: ['Moon-Venus synastry between two charts', 'Moon in 7th', 'Moon afflicted by Saturn (emotional pain)'],
      },
      {
        planet:   'Rahu',
        role:     'Karmic obsession, past life connection indicator',
        checkFor: ['Rahu in 7th (intense karmic relationship)', 'Rahu conjunct Venus', 'Rahu-Ketu axis across 1st-7th'],
      },
      {
        planet:   'Ketu',
        role:     'Past life karmic completion — closure indicator',
        checkFor: ['Ketu in 7th (spiritual detachment from partner)', 'Ketu with Venus (karmic release)'],
      },
    ],

    dashaFocus: ['Venus', 'Moon', 'Rahu', '7th lord'],

    yogasToCheck: [
      'Karako Bhavo Nashaya — Venus in 7th can harm marriage',
      'Rahu-Venus conjunction — obsessive karmic love',
      'Moon-Saturn aspect — emotional separation pattern',
      'Darakaraka planet condition in D9',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 24 — Vivah Bhava',
        rule:    '7th house lord and Venus together determine karmic bond strength',
      },
      {
        text: 'Jataka Parijata',
        rule: 'Rahu in 7th creates intense but karmically bound relationships requiring resolution',
      },
      {
        text:    'BPHS',
        chapter: 'Chapter 76 — Nashtajataka',
        rule:    'Navamsa D9 chart is the soul map — check Venus and 7th lord in D9 for true relationship karma',
      },
    ],

    analysisDepthNote: `
For dual chart analysis:
1. Analyze Person 1 chart for relationship readiness
2. Analyze Person 2 chart for relationship openness
3. Find Venus-Moon synastry — does Person 1 Venus fall on Person 2 Moon or vice versa?
4. Check Rahu-Ketu overlap — shared karmic axis = strong past life bond
5. Check 7th lord of each person's chart — are they in favorable Dasha?
6. Determine: Is this relationship meant for reunion (11th house active) or closure (12th/Ketu active)?
7. Give clear, compassionate answer — never give false hope, never crush hope
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Never guarantee reunion — say "favorable window" or "closure energy"',
      'Never make judgments about the other person\'s character — only analyze their chart',
      'Dual chart requires BOTH birth details — if only one provided, say so clearly',
    ],

    worldContextSearchTerms: [], // Personal domain — no market data

    extraOutputFields: {
      bondType:      'karmic | soulmate | lesson | karmic-completion',
      reunionOdds:   'favorable | neutral | closure-indicated',
      synastrySummary: 'string — key synastry aspect between the two charts',
      closureMessage:  'string — compassionate closure/reunion guidance in plain language',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // GEN Z — DOMAIN 2
  // ════════════════════════════════════════════════════════════════
  genz_toxic_boss: {
    id:           'genz_toxic_boss',
    segment:      'genz',
    displayName:  'Toxic Boss Radar',
    tagline:      'Saturn & Mars clash in your karma bhava',
    analysisType: 'dual',
    timeWindow:   '60days',
    worldContext: 'none',
    icon:         '⚠️',
    accentColor:  'orange',
    badgeLabel:   'Dual Chart',

    primaryHouses: [
      { number: 10, significance: 'Karma Bhava — workplace, authority, career reputation' },
      { number: 6,  significance: 'Enemies, obstacles, service conditions, daily conflict' },
      { number: 8,  significance: 'Power dynamics, hidden agendas, sudden upheavals at work' },
    ],
    secondaryHouses: [
      { number: 1,  significance: 'Self — how you handle authority energy' },
      { number: 11, significance: 'Support network at work — allies vs enemies' },
      { number: 3,  significance: 'Courage to speak up or leave' },
    ],

    keyPlanets: [
      {
        planet:   'Saturn',
        role:     'Authority, discipline, karma — the boss planet',
        checkFor: ['Saturn in 10th (heavy authority)', 'Saturn-Mars mutual aspect (conflict with authority)', 'Saturn Dasha (testing period)'],
      },
      {
        planet:   'Mars',
        role:     'Aggression, conflict, action energy',
        checkFor: ['Mars in 6th (fighting enemies)', 'Mars-Saturn clash (toxic dynamic)', 'Mars in 10th (aggressive boss energy)'],
      },
      {
        planet:   'Sun',
        role:     'Ego, recognition, authority relationship with superiors',
        checkFor: ['Sun afflicted by Saturn (suppressed recognition)', 'Sun in 6th (authority vs you)'],
      },
      {
        planet:   'Rahu',
        role:     'Manipulation, unconventional authority, karmic workplace entanglement',
        checkFor: ['Rahu in 10th (unusual/manipulative work environment)', 'Rahu-Saturn conjunction'],
      },
    ],

    dashaFocus: ['Saturn', 'Mars', 'Rahu', '6th lord', '10th lord'],

    yogasToCheck: [
      'Shatrubhava activation — 6th lord in 10th or vice versa',
      'Saturn-Mars mutual aspect across 6th-10th axis',
      'Rahu in karma bhava — workplace deception',
      'Sun-Saturn conjunction or opposition — authority suppression',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 25 — Karma Bhava',
        rule:    'Malefics in 10th house create conflict with authority and workplace enemies',
      },
      {
        text: 'Saravali',
        rule: 'Saturn-Mars mutual aspect across the 6th-10th axis creates sustained workplace conflict requiring strategic withdrawal or direct confrontation',
      },
    ],

    analysisDepthNote: `
For dual chart (employee + boss):
1. Check employee chart: Is 6th house under siege? Is Saturn/Mars Dasha active?
2. Check boss chart: Are they in Mars/Rahu Dasha making them aggressive?
3. Find conflict trigger: Where does boss's Saturn/Mars fall in employee's chart?
4. Give tactical advice: Stay or leave? When is the escape window?
5. Never demonize the boss — analyze karma, not character
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Never say "your boss is bad person" — say "karmic dynamic is challenging"',
      'Give actionable timing for when the situation improves or escape window opens',
      'If both charts not available — analyze single chart for workplace karma only',
    ],

    worldContextSearchTerms: [],

    extraOutputFields: {
      conflictIntensity: 'high | medium | manageable',
      exitWindow:        'string — best Dasha window to leave if needed',
      survivalTactic:    'string — how to navigate this period astrologically',
      synastrySummary:   'string — key clash point between the two charts',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // GEN Z — DOMAIN 3
  // ════════════════════════════════════════════════════════════════
  genz_manifestation: {
    id:           'genz_manifestation',
    segment:      'genz',
    displayName:  'Manifestation & Luck',
    tagline:      'Your current Sankalpa activation window',
    analysisType: 'single',
    timeWindow:   '30days',
    worldContext: 'general',
    icon:         '✨',
    accentColor:  'yellow',

    primaryHouses: [
      { number: 5,  significance: 'Sankalpa — intention, creativity, Purva Punya, manifestation power' },
      { number: 9,  significance: 'Bhagya — fortune, divine grace, luck activation' },
      { number: 1,  significance: 'Self-energy, vitality, personal magnetism' },
    ],
    secondaryHouses: [
      { number: 11, significance: 'Labha — fulfillment of desires, gains' },
      { number: 3,  significance: 'Courage to act on desires' },
      { number: 7,  significance: 'Others as mirrors — manifestation through relationships' },
    ],

    keyPlanets: [
      {
        planet:   'Jupiter',
        role:     'Divine grace, expansion, the great benefic for manifestation',
        checkFor: ['Jupiter transit over natal Moon (peak luck)', 'Jupiter in 1/5/9 (trikona — manifestation triad)', 'Jupiter Dasha'],
      },
      {
        planet:   'Moon',
        role:     'Mind and intention — quality of Sankalpa depends on Moon',
        checkFor: ['Moon strength', 'Moon in Shukla Paksha (waxing = growing energy)', 'Moon nakshatra for timing'],
      },
      {
        planet:   'Sun',
        role:     'Personal power, identity aligned with desire',
        checkFor: ['Sun in Kendra or Trikona', 'Sun Dasha activating desire'],
      },
      {
        planet:   'Venus',
        role:     'Desires, beauty, abundance attraction',
        checkFor: ['Venus strong in D1', 'Venus in 11th (gains through desire)'],
      },
    ],

    dashaFocus: ['Jupiter', 'Moon', 'Venus', '5th lord', '9th lord'],

    yogasToCheck: [
      'Dharmakarmadhipati Yoga — 9th and 10th lord conjunction',
      'Lakshmi Yoga — 9th lord in Kendra',
      'Gaja Kesari Yoga — Jupiter-Moon combination',
      'Shukla Paksha transit — waxing moon manifestation windows',
      'Pushya Nakshatra days — highest manifestation power',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 23 — Bhagya Bhava',
        rule:    '9th house represents Dharma and Bhagya — its activation through favorable Dasha unlocks manifestation',
      },
      {
        text: 'Phaladeepika',
        rule: 'When 5th lord and 9th lord form a relationship, Sankalpa power is at its peak',
      },
    ],

    analysisDepthNote: `
Focus tightly on RIGHT NOW — this is a 30-day reading:
1. Is Moon in Shukla Paksha (waxing) or Krishna Paksha? This determines manifestation intensity
2. Current Pratyantar Dasha lord — is it a benefic? 
3. Jupiter's current transit house from natal Moon
4. Best 3 dates in next 30 days for setting intentions (Pushya, Rohini, Hasta nakshatras)
5. What specific area is most charged for manifestation right now (career/love/wealth)?
Be energizing and positive — this is a hopeful domain
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Action windows must be specific calendar dates computed from current transits',
      'Never give generic "think positive" advice — ground everything in planetary timing',
      'Moon phase must reflect actual current lunar phase, not a generic statement',
    ],

    worldContextSearchTerms: [
      'Jupiter transit current position',
      'Shukla Paksha dates current month',
      'Pushya nakshatra dates upcoming',
    ],

    extraOutputFields: {
      manifestationPower: 'peak | active | building | dormant',
      bestDates:          'array of 3 specific dates with nakshatra basis',
      sankalpaDomain:     'which life area is most charged right now',
      moonPhaseGuidance:  'string — current moon phase and its manifestation implication',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // GEN Z — DOMAIN 4
  // ════════════════════════════════════════════════════════════════
  genz_dream_career: {
    id:           'genz_dream_career',
    segment:      'genz',
    displayName:  'Dream Career Pivot',
    tagline:      '10th house + Rahu ambition transit',
    analysisType: 'single',
    timeWindow:   '6months',
    worldContext: 'market',
    icon:         '📈',
    accentColor:  'blue',

    primaryHouses: [
      { number: 10, significance: 'Karma Bhava — career destiny, public recognition, professional rise' },
      { number: 1,  significance: 'Self-identity alignment with career ambition' },
      { number: 6,  significance: 'Daily work, competition, service conditions' },
    ],
    secondaryHouses: [
      { number: 2,  significance: 'Wealth from career, speech (presentations, interviews)' },
      { number: 11, significance: 'Career gains, professional network, income growth' },
      { number: 9,  significance: 'Higher education, overseas career, mentor luck' },
    ],

    keyPlanets: [
      {
        planet:   'Rahu',
        role:     'Ambition amplifier — unconventional career breakthroughs',
        checkFor: ['Rahu in 10th or 6th (career disruption/elevation)', 'Rahu transit over 10th lord', 'Rahu Dasha for career leaps'],
      },
      {
        planet:   'Saturn',
        role:     'Career discipline and longevity — the karmic career planet',
        checkFor: ['Saturn in 10th (slow but sure rise)', 'Saturn transit (Sade Sati impact on career)', 'Saturn Dasha (testing then rewarding)'],
      },
      {
        planet:   'Sun',
        role:     'Authority, recognition, leadership potential',
        checkFor: ['Sun in 10th (natural authority)', 'Sun-Saturn relationship (boss karma)', 'Sun in kendra for career stability'],
      },
      {
        planet:   'Mercury',
        role:     'Skills, communication, analytical career paths',
        checkFor: ['Mercury in 10th (intellect-driven career)', 'Mercury-Rahu conjunction (tech/media ambition)'],
      },
    ],

    dashaFocus: ['Rahu', 'Saturn', 'Sun', '10th lord', '1st lord'],

    yogasToCheck: [
      'Raja Yoga — Kendra and Trikona lords joining',
      'Amala Yoga — benefic in 10th from Lagna or Moon',
      'Rahu in 10th — sudden career elevation (unconventional path)',
      'Saturn in Swakshetra in 10th — long-term career fortress',
      '10th lord in 11th — career directly generates gains',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 25 — Karma Bhava Phala',
        rule:    '10th house lord in Kendra or Trikona from Lagna creates powerful career yoga',
      },
      {
        text: 'Saravali',
        rule: 'Rahu in 10th house gives unorthodox but powerful career — success through non-traditional paths',
      },
    ],

    analysisDepthNote: `
World context is ACTIVE for this domain — inject current job market:
1. What is the current hiring environment in their sector (if provided)?
2. Is their 10th house lord in favorable Dasha for a career move?
3. When does Rahu's ambition energy peak in next 6 months?
4. Is this a "stay and grow" or "pivot and leap" period?
5. What specific role/direction is cosmically supported?
Give concrete, actionable career strategy tied to planetary timing
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Career advice must reference current job market dynamically — never use stale sector data',
      'Never promise a specific job/promotion — predict favorable windows',
      'If sector is unknown, give general career timing without sector-specific claims',
    ],

    worldContextSearchTerms: [
      'India job market hiring trend current month',
      'IT/finance/healthcare jobs India current quarter',
      'Rahu transit current position career impact',
    ],

    extraOutputFields: {
      careerPhase:     'breakthrough | building | consolidation | challenge',
      pivotTiming:     'string — best 3-month window for career move in next 6 months',
      careerDirection: 'string — cosmically supported career direction',
      competitionLevel:'low | moderate | high — based on 6th house analysis',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // MILLENNIAL — DOMAIN 5
  // ════════════════════════════════════════════════════════════════
  mill_property_yog: {
    id:           'mill_property_yog',
    segment:      'millennial',
    displayName:  'Property & Home Yog',
    tagline:      '4th house & Jupiter blessing analysis',
    analysisType: 'single',
    timeWindow:   '12months',
    worldContext: 'realestate',
    icon:         '🏠',
    accentColor:  'green',

    primaryHouses: [
      { number: 4,  significance: 'Sukha Bhava — property, home, mother, fixed assets' },
      { number: 2,  significance: 'Accumulated wealth, family assets, Kutumba' },
      { number: 11, significance: 'Labha — gains, fulfillment of property desire' },
    ],
    secondaryHouses: [
      { number: 12, significance: 'Property expenses, foreign property, loss of property' },
      { number: 8,  significance: 'Ancestral property, inherited assets, sudden property events' },
      { number: 9,  significance: 'Luck and fortune — bhagya for property' },
    ],

    keyPlanets: [
      {
        planet:   'Jupiter',
        role:     'Primary significator of wealth, expansion, blessings on property',
        checkFor: ['Jupiter in 4th or aspecting 4th', 'Jupiter transit over 4th house cusp', 'Jupiter Dasha activating property yoga'],
      },
      {
        planet:   'Moon',
        role:     '4th house natural significator — emotional home desire',
        checkFor: ['Moon in 4th (strong property desire)', 'Moon with Jupiter (property blessing)', 'Moon in own sign Cancer in 4th'],
      },
      {
        planet:   'Venus',
        role:     'Luxury properties, aesthetic homes, property through spouse',
        checkFor: ['Venus in 4th (beautiful home)', 'Venus-Jupiter combination for high-value property'],
      },
      {
        planet:   'Mars',
        role:     'Real estate (Bhoomi karaka — land significator)',
        checkFor: ['Mars in 4th or aspecting 4th', 'Mars Dasha for property purchase action', 'Mars-Jupiter for land + expansion'],
      },
    ],

    dashaFocus: ['Jupiter', 'Moon', 'Mars', '4th lord', '2nd lord', '11th lord'],

    yogasToCheck: [
      'Griha Yoga — 4th lord in Kendra with Jupiter',
      'Dhana Yoga — 2nd and 11th lords combining',
      'Jupiter transit over natal Moon (peak expansion window)',
      'Mars Dasha for property action (Bhoomi karaka activation)',
      '4th lord in exaltation or own sign',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 22 — Sukha Bhava',
        rule:    '4th house and its lord with Jupiter creates Griha (property) Yoga — favorable for real estate acquisition',
      },
      {
        text: 'Phaladeepika',
        rule: 'When Mars (Bhoomi karaka) is strong and 4th lord is in favorable Dasha, land and property acquisition is supported',
      },
    ],

    analysisDepthNote: `
World context is CRITICAL here — real estate market conditions must be injected:
1. Current home loan interest rates in India (fetch dynamically)
2. Property market trend in current quarter
3. Is their 4th lord in favorable Dasha for purchase in next 12 months?
4. Best 3-month window for property registration/purchase
5. Any property obstacles (Saturn/Rahu on 4th) and how to navigate
6. Vastu-adjacent guidance based on planetary direction strengths
Give realistic assessment — property is a major financial decision
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Never give specific property price predictions',
      'Home loan rates must be fetched dynamically — never hardcode percentages',
      'If chart shows obstacle (Saturn on 4th), say so clearly with remedy',
    ],

    worldContextSearchTerms: [
      'home loan interest rates India current',
      'property market India current quarter',
      'RBI monetary policy latest home loan impact',
      'Delhi NCR property prices current',
    ],

    extraOutputFields: {
      propertyYogStrength: 'strong | moderate | weak | absent',
      purchaseWindow:      'string — best 3-month window with planetary basis',
      financingTiming:     'string — when to apply for home loan',
      obstacleWarning:     'string | null — any planetary obstacle to watch',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // MILLENNIAL — DOMAIN 6
  // ════════════════════════════════════════════════════════════════
  mill_karz_mukti: {
    id:           'mill_karz_mukti',
    segment:      'millennial',
    displayName:  'Karz Mukti (Debt)',
    tagline:      '6th house & Saturn Karma clearing',
    analysisType: 'single',
    timeWindow:   '6months',
    worldContext: 'market',
    icon:         '💸',
    accentColor:  'amber',

    primaryHouses: [
      { number: 6,  significance: 'Rina Bhava — debts, loans, enemies, service, diseases' },
      { number: 2,  significance: 'Dhana Bhava — wealth accumulation, family finances' },
      { number: 12, significance: 'Vyaya Bhava — expenses, losses, outflow of money' },
    ],
    secondaryHouses: [
      { number: 8,  significance: 'Sudden financial upheaval, hidden debts, others money' },
      { number: 11, significance: 'Income gains — the antidote to 6th house debt' },
      { number: 5,  significance: 'Speculative losses/gains — investments gone wrong' },
    ],

    keyPlanets: [
      {
        planet:   'Saturn',
        role:     'Karma of debt — disciplined repayment, karmic financial lessons',
        checkFor: ['Saturn in 6th (debt karma)', 'Saturn in 2nd or 12th (financial squeeze)', 'Saturn Dasha (peak debt period or resolution)'],
      },
      {
        planet:   'Rahu',
        role:     'Debt trap — invisible financial entanglements',
        checkFor: ['Rahu in 6th (debt multiplier)', 'Rahu-Saturn combination (severe financial karma)', 'Rahu Dasha with weak Jupiter'],
      },
      {
        planet:   'Jupiter',
        role:     'Debt relief — the liberator from financial karma',
        checkFor: ['Jupiter aspecting 6th (debt reduction)', 'Jupiter Dasha (financial relief period)', 'Jupiter transit over 6th lord'],
      },
      {
        planet:   'Mars',
        role:     'Action to clear debt — energy and aggression in finances',
        checkFor: ['Mars in 6th (fighting debt)', 'Mars-Jupiter (aggressive wealth building)'],
      },
    ],

    dashaFocus: ['Saturn', 'Rahu', 'Jupiter', '6th lord', '2nd lord', '11th lord'],

    yogasToCheck: [
      'Rina Yoga — 6th lord in 2nd or 12th (debt creation)',
      'Daridra Yoga — lords of 6/8/12 combining (poverty/debt trap)',
      'Jupiter aspecting 6th (Rina Mukti — debt liberation)',
      'Saturn completing karma cycle — relief in specific Dasha',
      '11th lord strong — income overpowers debt',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 21 — Ari Bhava (6th house)',
        rule:    'Rina (debt) is governed by 6th house — its lord in dusthana creates debt accumulation; Jupiter\'s aspect on 6th lord enables Rina Mukti',
      },
      {
        text: 'Saravali',
        rule: 'When 11th lord is stronger than 6th lord in Dasha, income exceeds debt — natural path to financial liberation',
      },
    ],

    analysisDepthNote: `
This is a sensitive, high-stakes domain — be direct but compassionate:
1. Diagnose: What planetary combination CREATED this debt? (6th lord, Saturn, Rahu analysis)
2. Current Dasha: Is this the peak of debt karma or the beginning of relief?
3. World context: Current interest rates and debt restructuring options in India
4. Relief window: When does Jupiter or a benefic activate to provide debt relief?
5. Specific remedies: Classical BPHS remedies for Rina Mukti (debt liberation)
6. Income strategy: Which house/planet to activate to earn faster than debt grows
Be honest — if the period is difficult, say so with clear end date
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Never give specific loan/debt amount predictions',
      'Never recommend specific financial products — give astrological timing only',
      'Interest rates and financial schemes must be fetched dynamically',
      'If Saturn Dasha is long — give realistic timeline, not false hope',
    ],

    worldContextSearchTerms: [
      'RBI repo rate current',
      'loan restructuring schemes India current',
      'MSME debt relief India current',
      'personal loan interest rates India current',
    ],

    extraOutputFields: {
      debtKarmaOrigin:  'string — which planetary combination created debt',
      reliefWindow:     'string — when Jupiter/benefic activates for relief',
      rinaMuktiRemedy:  'string — primary BPHS-cited remedy for debt liberation',
      incomeBoostPlanet:'string — which planet/house to activate for faster income',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // MILLENNIAL — DOMAIN 7
  // ════════════════════════════════════════════════════════════════
  mill_childs_destiny: {
    id:           'mill_childs_destiny',
    segment:      'millennial',
    displayName:  "Child's Destiny",
    tagline:      '5th house Putra Bhava activation',
    analysisType: 'single',
    timeWindow:   '12months',
    worldContext: 'none',
    icon:         '👶',
    accentColor:  'pink',

    primaryHouses: [
      { number: 5,  significance: 'Putra Bhava — children, intellect, Purva Punya, creative progeny' },
      { number: 9,  significance: 'Bhagya of the child — fortune the child will carry' },
      { number: 1,  significance: 'Parent\'s own vitality and readiness' },
    ],
    secondaryHouses: [
      { number: 2,  significance: 'Kutumba — family environment the child grows in' },
      { number: 4,  significance: 'Educational environment, home learning foundation' },
      { number: 7,  significance: 'Partner\'s contribution to child\'s destiny (if dual chart)' },
    ],

    keyPlanets: [
      {
        planet:   'Jupiter',
        role:     'Primary significator of children (Putrakaraka)',
        checkFor: ['Jupiter in 5th or aspecting 5th', 'Jupiter Dasha for child birth/blessing', 'Jupiter in D7 Saptamsa chart'],
      },
      {
        planet:   'Moon',
        role:     'Nurturing, emotional bond with child',
        checkFor: ['Moon in 5th (strong maternal instinct)', 'Moon-Jupiter for child blessing', 'Moon in D7'],
      },
      {
        planet:   'Sun',
        role:     'Child\'s authority, future leadership potential',
        checkFor: ['Sun in 5th (strong-willed children)', 'Sun-Jupiter (noble progeny)'],
      },
      {
        planet:   'Saturn',
        role:     'Delay or discipline in matters of children',
        checkFor: ['Saturn in 5th (delayed children, disciplined nature)', 'Saturn aspecting Jupiter (Putrakaraka afflicted)'],
      },
    ],

    dashaFocus: ['Jupiter', 'Moon', '5th lord', '9th lord'],

    yogasToCheck: [
      'Santhana Yoga — 5th lord with Jupiter in Kendra',
      'Putra Yoga — Jupiter in 5th or aspecting 5th lord',
      'Saturn in 5th — delay but eventual blessing with patience',
      'D7 Saptamsa chart — primary chart for child destiny analysis',
      '5th lord in dusthana — challenges in child area requiring remedies',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 19 — Putra Bhava',
        rule:    'Jupiter is the Naisargika Putrakaraka — its strength in D1 and D7 determines quality and timing of progeny',
      },
      {
        text: 'Jataka Parijata',
        rule: 'When 5th lord is in Kendra or Trikona with Jupiter, the progeny carries strong Purva Punya and inherits parental virtues',
      },
    ],

    analysisDepthNote: `
This domain requires utmost sensitivity — parental hopes are involved:
1. Is 5th house activated in current Dasha? (Jupiter period = most favorable)
2. What destiny signature does the D7 Saptamsa show for children?
3. If child is already born — what Dasha period is the child in, and what does it mean?
4. Education timing: When is the best period for the child's studies?
5. Any challenges to address (Saturn in 5th = patience, not despair)
Be warm, hopeful, and never negative about children
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Never predict exact number of children — say "chart supports progeny" or "5th house has challenges"',
      'Never predict child health outcomes — stay at blessing/challenge level',
      'Always emphasize parental remedies — the parent can shift the karma',
      'If asking about child birth timing — be gentle, never say "no children"',
    ],

    worldContextSearchTerms: [],

    extraOutputFields: {
      putraBhavaStrength: 'strong | moderate | challenged',
      childBlessing:      'string — nature of the Putra Yoga present or absent',
      educationWindow:    'string — best Dasha period for child\'s education',
      parentalRemedy:     'string — what parent can do to strengthen child\'s destiny',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // MILLENNIAL — DOMAIN 8
  // ════════════════════════════════════════════════════════════════
  mill_parents_wellness: {
    id:           'mill_parents_wellness',
    segment:      'millennial',
    displayName:  "Parents' Wellness",
    tagline:      '4th & 9th house ancestral protection',
    analysisType: 'single',
    timeWindow:   '12months',
    worldContext: 'none',
    icon:         '👨‍👩‍👧',
    accentColor:  'teal',

    primaryHouses: [
      { number: 4,  significance: 'Matru Bhava — mother, maternal health, maternal karma' },
      { number: 9,  significance: 'Pitru Bhava — father, paternal health, ancestral blessings' },
      { number: 8,  significance: 'Longevity — Ayush Bhava for parents\' health duration' },
    ],
    secondaryHouses: [
      { number: 2,  significance: 'Family continuity, family financial security for parents' },
      { number: 6,  significance: 'Disease and health challenges for parents' },
      { number: 12, significance: 'Hospital stays, major health events for parents' },
    ],

    keyPlanets: [
      {
        planet:   'Moon',
        role:     'Significator of mother — her health and emotional state',
        checkFor: ['Moon\'s strength in D1', 'Moon affliction by Saturn/Rahu (maternal health concern)', 'Moon in 4th or 8th'],
      },
      {
        planet:   'Sun',
        role:     'Significator of father — his vitality and longevity',
        checkFor: ['Sun afflicted by Saturn (paternal health)', 'Sun in 6th/8th/12th (father health focus)', 'Sun Dasha'],
      },
      {
        planet:   'Saturn',
        role:     'Longevity karaka — determines health duration of parents',
        checkFor: ['Saturn aspecting 4th or 9th (parental health karma)', 'Saturn in 8th from 4th or 9th'],
      },
      {
        planet:   'Jupiter',
        role:     'Ancestral protection, blessings, healing grace',
        checkFor: ['Jupiter aspecting 4th or 9th (parental protection)', 'Jupiter Dasha for parental wellness'],
      },
    ],

    dashaFocus: ['Moon', 'Sun', 'Saturn', '4th lord', '9th lord'],

    yogasToCheck: [
      'Matru Yoga — Moon strong with 4th lord',
      'Pitru Yoga — Sun strong with 9th lord',
      'Saturn in 8th from 4th house (counted as 11th overall) — longevity assessment',
      'Pitru Dosha — Rahu/Ketu on Sun or 9th house (ancestral karma)',
      'Jupiter aspecting both 4th and 9th — double parental protection',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 22 — Matru Bhava & Chapter 26 — Pitru Bhava',
        rule:    'Moon signifies mother; Sun signifies father. Their strength in D1 and D12 (Dwadashamsa) determines parental vitality',
      },
      {
        text: 'Phaladeepika',
        rule: 'When the 4th and 9th lords are in dusthana or afflicted by malefics, parental health requires proactive attention and remedies',
      },
    ],

    analysisDepthNote: `
Handle with deep care — parental health is emotionally sensitive:
1. Analyze mother's chart indicators: Moon condition, 4th house
2. Analyze father's chart indicators: Sun condition, 9th house
3. Are there any Pitru Dosha patterns? (Rahu/Ketu on Sun or 9th)
4. Current Dasha — is it testing parental health or protective?
5. Specific remedies for Matru and Pitru protection
6. No dire predictions — give empowerment through remedies
Always recommend professional medical consultation alongside astrological guidance
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'NEVER predict death or serious disease outcomes',
      'Always recommend professional medical consultation',
      'Frame health concerns as "areas requiring attention" not diagnoses',
      'Remedies must be practical and classical — not invented',
    ],

    worldContextSearchTerms: [],

    extraOutputFields: {
      motherHealthIndicator: 'stable | needs attention | challenging period',
      fatherHealthIndicator: 'stable | needs attention | challenging period',
      pitruDoshaPresent:     'boolean',
      ancestralRemedy:       'string — BPHS remedy for Pitru/Matru protection',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // GEN X — DOMAIN 9
  // ════════════════════════════════════════════════════════════════
  genx_retirement_peace: {
    id:           'genx_retirement_peace',
    segment:      'genx',
    displayName:  'Retirement Peace',
    tagline:      '12th house & Jupiter final cycle',
    analysisType: 'single',
    timeWindow:   '24months',
    worldContext: 'market',
    icon:         '🌅',
    accentColor:  'orange',

    primaryHouses: [
      { number: 12, significance: 'Moksha / withdrawal / vairagya — the retirement house' },
      { number: 2,  significance: 'Accumulated savings, retirement corpus, family financial legacy' },
      { number: 8,  significance: 'Longevity, pension, long-term sustenance' },
    ],
    secondaryHouses: [
      { number: 4,  significance: 'Peace at home, domestic bliss in retirement' },
      { number: 9,  significance: 'Spiritual activity, pilgrimage, dharmic pursuits in retirement' },
      { number: 11, significance: 'Retirement income — dividends, pension, passive income' },
    ],

    keyPlanets: [
      {
        planet:   'Jupiter',
        role:     'Final grace cycle — wisdom, abundance, spiritual elevation in later life',
        checkFor: ['Jupiter in 12th (moksha blessings)', 'Jupiter\'s final return', 'Jupiter-Saturn relationship (balance of karma and grace)'],
      },
      {
        planet:   'Saturn',
        role:     'Karma completion — the fruits of life\'s work in retirement',
        checkFor: ['Saturn in 2nd (retirement savings discipline)', 'Saturn completing its cycle', 'Saturn-Jupiter relationship'],
      },
      {
        planet:   'Ketu',
        role:     'Spiritual detachment, letting go — natural retirement energy',
        checkFor: ['Ketu in 12th (natural moksha inclination)', 'Ketu Dasha in later life (spiritual turning point)'],
      },
      {
        planet:   'Moon',
        role:     'Emotional peace in retirement, domestic contentment',
        checkFor: ['Moon in 4th or 12th for peaceful retirement', 'Moon strength for mental peace'],
      },
    ],

    dashaFocus: ['Jupiter', 'Saturn', 'Ketu', '12th lord', '2nd lord'],

    yogasToCheck: [
      'Moksha Yoga — Ketu or 12th lord strong with Jupiter',
      'Dhana Yoga in 2nd/11th — retirement corpus security',
      'Viparita Raja Yoga — 6/8/12 lords in each other\'s houses (hidden strength)',
      'Jupiter final return (age ~60-61) — life wisdom peak',
      'Sanyas Yoga — spiritual retirement calling',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 29 — Vyaya Bhava (12th house)',
        rule:    '12th house represents Moksha and the final stage of life — Jupiter\'s blessing on 12th enables peaceful withdrawal from worldly affairs',
      },
      {
        text: 'Jataka Parijata',
        rule: 'In the final Jupiter cycle (after age 47), if Jupiter is strong in D1 and D9, the native experiences grace, wisdom, and freedom from earlier karmic burdens',
      },
    ],

    analysisDepthNote: `
World context for retirement is financial — inject dynamically:
1. Current senior citizen FD rates (fetch live)
2. Pension and NPS status in India currently
3. Is their 2nd house showing corpus security or risk?
4. Jupiter's current position — is the final grace cycle active?
5. Spiritual direction: What dharmic activity does their chart support in retirement?
6. Health longevity indicators from 8th house
Tone: Deeply respectful, wise, reassuring. This person has lived a full life.
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Never predict lifespan or death',
      'Senior citizen FD rates must be fetched dynamically — never hardcode',
      'Respect the dignity of this life stage — no fear-based predictions',
      'Health indicators: frame as "vitality" not "disease risk"',
    ],

    worldContextSearchTerms: [
      'senior citizen fixed deposit rates India current',
      'NPS pension scheme returns current',
      'retirement planning India current financial year',
      'Ayushman Bharat senior citizen coverage current',
    ],

    extraOutputFields: {
      retirementReadiness: 'financially secure | building | needs attention',
      spiritualPath:       'string — dharmic activity cosmically supported',
      corpusSecurity:      'string — 2nd house retirement corpus assessment',
      jupiterGraceWindow:  'string — when Jupiter final grace cycle peaks',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // GEN X — DOMAIN 10
  // ════════════════════════════════════════════════════════════════
  genx_legacy_inheritance: {
    id:           'genx_legacy_inheritance',
    segment:      'genx',
    displayName:  'Legacy & Inheritance',
    tagline:      '8th & 2nd house Dhan-Karma',
    analysisType: 'single',
    timeWindow:   '24months',
    worldContext: 'market',
    icon:         '👑',
    accentColor:  'yellow',

    primaryHouses: [
      { number: 8,  significance: 'Adi-Riktham — ancestral wealth, inheritance, hidden assets, windfall' },
      { number: 2,  significance: 'Dhana Bhava — personal accumulated wealth and family legacy' },
      { number: 4,  significance: 'Ancestral property, immovable assets to be passed on' },
    ],
    secondaryHouses: [
      { number: 11, significance: 'Gains from inheritance — what actually materializes' },
      { number: 12, significance: 'Losses in legacy — what gets spent or lost in transition' },
      { number: 9,  significance: 'Legal and dharmic basis of inheritance — father\'s legacy' },
    ],

    keyPlanets: [
      {
        planet:   'Saturn',
        role:     'Karma of ancestral wealth — what was earned rightfully, what was not',
        checkFor: ['Saturn in 2nd or 8th (wealth karma)', 'Saturn aspecting 8th lord', 'Saturn Dasha for inheritance events'],
      },
      {
        planet:   'Rahu',
        role:     'Unexpected windfalls, hidden assets, unconventional inheritance',
        checkFor: ['Rahu in 2nd or 8th (sudden wealth events)', 'Rahu-Jupiter (large unexpected gains)', 'Rahu Dasha for inheritance'],
      },
      {
        planet:   'Jupiter',
        role:     'Dharmic wealth, blessings on family legacy',
        checkFor: ['Jupiter in 2nd (inherited wisdom and wealth)', 'Jupiter aspecting 8th (inheritance blessing)', 'Jupiter Dasha'],
      },
      {
        planet:   'Mars',
        role:     'Ancestral property (Bhoomi karaka), fighting for inheritance',
        checkFor: ['Mars in 4th or 8th (ancestral property karma)', 'Mars-Saturn (legal disputes in property)'],
      },
    ],

    dashaFocus: ['Saturn', 'Rahu', 'Jupiter', '8th lord', '2nd lord', '4th lord'],

    yogasToCheck: [
      'Dhana Yoga — 2nd and 11th lords combining strongly',
      'Inheritance Yoga — 8th lord in 2nd or 11th',
      'Rahu in 2nd or 8th — sudden, unexpected wealth event',
      'Saturn completing karma — delayed but rightful inheritance',
      'Mars-Saturn in 4th/8th — property disputes requiring resolution',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 28 — Ayu Bhava (8th house)',
        rule:    '8th house governs Adi-Riktham (ancestral wealth). When 8th lord is in 2nd or 11th with benefics, inheritance is substantial and well-timed',
      },
      {
        text: 'Saravali',
        rule: 'When Rahu occupies the 2nd or 8th house in favorable Dasha, unexpected financial events — including inheritance — manifest rapidly',
      },
    ],

    analysisDepthNote: `
Legacy involves legal and financial complexity — be accurate:
1. Is 8th house activated in current Dasha for inheritance event?
2. Any disputes? (Mars-Saturn on 4th/8th = property conflict)
3. World context: Inheritance tax, succession planning in India currently
4. What is the dharmic legacy this person should leave?
5. Financial legacy: Are their assets protected for next generation?
6. Any karmic debts in ancestral wealth requiring resolution?
Tone: Dignified, strategic, wise
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Never predict specific inheritance amounts',
      'Legal aspects: say "chart shows potential dispute" — recommend actual lawyer',
      'Inheritance tax laws must be fetched dynamically — never hardcode',
      'If Mars-Saturn affliction shows dispute — give remedy, not dire outcome',
    ],

    worldContextSearchTerms: [
      'inheritance tax India current rules',
      'property succession law India latest',
      'ancestral property legal rights India',
      'will registration India process current',
    ],

    extraOutputFields: {
      inheritanceYog:    'strong | moderate | delayed | disputed',
      legacyWindow:      'string — when inheritance/legacy events activate',
      disputeRisk:       'low | moderate | high — based on Mars-Saturn analysis',
      legacyRemedy:      'string — how to clear ancestral karma for smooth inheritance',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // GEN X — DOMAIN 11
  // ════════════════════════════════════════════════════════════════
  genx_spiritual_innings: {
    id:           'genx_spiritual_innings',
    segment:      'genx',
    displayName:  'Spiritual 2nd Innings',
    tagline:      'Ketu & 12th house moksha activation',
    analysisType: 'single',
    timeWindow:   '36months',
    worldContext: 'none',
    icon:         '🌙',
    accentColor:  'purple',

    primaryHouses: [
      { number: 12, significance: 'Moksha Bhava — spiritual liberation, ashram, vairagya, meditation' },
      { number: 9,  significance: 'Dharma Bhava — highest purpose, teacher, pilgrimage, spiritual wisdom' },
      { number: 8,  significance: 'Occult, transformation, mystical knowledge, inner life' },
    ],
    secondaryHouses: [
      { number: 1,  significance: 'The self in its final spiritual form' },
      { number: 4,  significance: 'Inner peace, the heart as spiritual home' },
      { number: 5,  significance: 'Mantra, meditation practices, Purva Punya paying out' },
    ],

    keyPlanets: [
      {
        planet:   'Ketu',
        role:     'Primary moksha karaka — liberation, detachment, past life spiritual credit',
        checkFor: ['Ketu in 12th (natural moksha)', 'Ketu Dasha in later life (profound spiritual turning point)', 'Ketu-Jupiter (guru-moksha combination)'],
      },
      {
        planet:   'Jupiter',
        role:     'Guru, wisdom, dharma — the teacher planet for spiritual path',
        checkFor: ['Jupiter in 9th or 12th (dharma and moksha blessing)', 'Jupiter-Ketu combination (spiritual liberation through wisdom)', 'Jupiter in Sagittarius/Pisces (swakshetra spiritual depth)'],
      },
      {
        planet:   'Saturn',
        role:     'Vairagya through karma — detachment earned through life lessons',
        checkFor: ['Saturn in 12th (earned detachment)', 'Saturn-Ketu (deep karma completion)', 'Saturn completing final cycle'],
      },
      {
        planet:   'Moon',
        role:     'Bhakti — devotional spiritual path, inner emotional peace',
        checkFor: ['Moon in 12th (meditative nature)', 'Moon-Jupiter (Gaja Kesari — wisdom and devotion)', 'Moon-Ketu (psychic sensitivity)'],
      },
    ],

    dashaFocus: ['Ketu', 'Jupiter', 'Saturn', '12th lord', '9th lord'],

    yogasToCheck: [
      'Moksha Yoga — Ketu in 12th with Jupiter aspecting',
      'Sanyas Yoga — multiple planets in 12th or 9th + Ketu strong',
      'Dharmakarmadhipati Yoga — 9th and 10th lords combining (dharma as career)',
      'Hamsa Yoga — Jupiter in Kendra in own/exalted sign (wisdom teacher)',
      'Viveka Yoga — Saturn-Ketu combination (profound discrimination and detachment)',
    ],

    classicalBasis: [
      {
        text:    'BPHS',
        chapter: 'Chapter 29 — Moksha Bhava & Chapter 38 — Sanyas Yoga',
        rule:    'When Ketu occupies the 12th house or aspects it, and Jupiter provides dharmic support through 9th house, the native enters a profound spiritual second phase after middle age',
      },
      {
        text: 'Jataka Parijata',
        rule: 'In the later Dasha cycles (after Saturn or Rahu), when Ketu or Jupiter periods activate, the native turns naturally toward Moksha — spiritual practices become effortless',
      },
    ],

    analysisDepthNote: `
This is the highest and most sacred domain — handle with reverence:
1. What is this person's specific spiritual path? (Bhakti/Jnana/Karma/Raja Yoga)
2. Which Dasha period marks their spiritual turning point?
3. What Purva Punya (past life credit) is paying out now?
4. Specific practices recommended: mantra, pilgrimage, seva, meditation
5. Is there a Guru yoga in the chart? When does the Guru appear?
6. Timeline: Next 36 months — when are the peak spiritual activation windows?
Tone: Deeply reverent, wise, no commercialism — this is a sacred reading
No world context — spiritual domain is timeless, not market-driven
`,

    antiHallucinationRules: [
      ...BASE_ANTI_HALLUCINATION_RULES,
      'Never trivialize or commercialize spiritual guidance',
      'Specific mantras recommended must be classical — no invented practices',
      'Never predict enlightenment as a guaranteed outcome',
      'Pilgrimage recommendations must be based on planetary directions (East/West/North/South)',
      'No world context injection — spiritual analysis is not market-dependent',
    ],

    worldContextSearchTerms: [], // No world context for spiritual domain

    extraOutputFields: {
      spiritualPath:      'bhakti | jnana | karma | raja | combination',
      mokshaYogStrength:  'strong | moderate | emerging',
      guruWindow:         'string — when Guru/teacher appears in Dasha timing',
      practiceRecommended:'string — specific classical practice for this chart',
      pilgrimageDirection:'East | West | North | South — based on planetary strength',
    },
  },

}; // end DOMAINS

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/** Get complete domain configuration by domain ID */
export function getDomainConfig(domainId: DomainId): DomainConfig {
  const config = DOMAINS[domainId];
  if (!config) throw new Error(`Unknown domain: ${domainId}`);
  return config;
}

/** Get all domains for a specific segment */
export function getSegmentDomains(segment: Segment): DomainConfig[] {
  return Object.values(DOMAINS).filter(d => d.segment === segment);
}

/** Auto-detect segment from age — age computed dynamically from DOB */
export function detectSegmentFromAge(dob: string): Segment {
  const birthYear  = new Date(dob).getFullYear();
  const currentYear = new Date().getFullYear();
  const age        = currentYear - birthYear;
  if (age <= 31)  return 'genz';
  if (age <= 46)  return 'millennial';
  return 'genx';
}

/** Get all domain IDs for a segment */
export function getSegmentDomainIds(segment: Segment): DomainId[] {
  return getSegmentDomains(segment).map(d => d.id);
}

/** Check if a domain requires dual chart (synastry) */
export function isDualChartDomain(domainId: DomainId): boolean {
  return getDomainConfig(domainId).analysisType === 'dual';
}

/** Get the Gemini system prompt preamble for a specific domain */
export function buildDomainSystemPrompt(domainId: DomainId): string {
  const config  = getDomainConfig(domainId);
  const { isoDate, monthYear, quarter, financialYear } = getCurrentPeriod();

  const houseFocus = config.primaryHouses
    .map(h => `House ${h.number}: ${h.significance}`)
    .join('\n');

  const planetFocus = config.keyPlanets
    .map(p => `${p.planet} (${p.role}): Check for — ${p.checkFor.join(', ')}`)
    .join('\n');

  const classicalRules = config.classicalBasis
    .map(c => `${c.text}${c.chapter ? ' ' + c.chapter : ''}: ${c.rule}`)
    .join('\n');

  const antiRules = config.antiHallucinationRules
    .map((r, i) => `${i + 1}. ${r}`)
    .join('\n');

  return `
=== TRIKAL VAANI — DOMAIN ANALYSIS ENGINE ===
Domain: ${config.displayName} (${config.id})
Segment: ${config.segment.toUpperCase()}
Analysis Type: ${config.analysisType === 'dual' ? 'DUAL CHART (synastry required)' : 'SINGLE CHART'}
Time Window: ${config.timeWindow}
World Context: ${config.worldContext === 'none' ? 'DISABLED — personal domain' : 'ENABLED — inject current data'}

Current Date Context (DYNAMIC — computed at runtime):
Date: ${isoDate} | Period: ${monthYear} | ${quarter} | ${financialYear}

=== ASTROLOGICAL FOCUS ===
Primary Houses to Analyze:
${houseFocus}

Key Planet Significators:
${planetFocus}

Dasha Lords to Prioritize: ${config.dashaFocus.join(', ')}

Yogas to Check:
${config.yogasToCheck.map(y => `• ${y}`).join('\n')}

=== CLASSICAL BASIS ===
${classicalRules}

=== ANALYSIS DEPTH INSTRUCTION ===
${config.analysisDepthNote}

=== ANTI-HALLUCINATION RULES (NON-NEGOTIABLE) ===
${antiRules}

=== OUTPUT FORMAT ===
You MUST return ONLY valid JSON matching this exact schema.
No preamble. No explanation. No markdown. Pure JSON only.

BASE SCHEMA:
${BASE_OUTPUT_SCHEMA}

ADDITIONAL FIELDS FOR THIS DOMAIN:
${JSON.stringify(config.extraOutputFields, null, 2)}

If any required chart data is missing, return:
{ "error": "insufficient_data", "missingField": "field name", "reason": "explanation" }
=== END DOMAIN SYSTEM PROMPT ===
`;
}

/** Get world context search terms for a domain */
export function getDomainSearchTerms(domainId: DomainId): string[] {
  return getDomainConfig(domainId).worldContextSearchTerms;
}

/** Full domain list for UI rendering */
export const ALL_DOMAINS_META = Object.values(DOMAINS).map(d => ({
  id:          d.id,
  segment:     d.segment,
  displayName: d.displayName,
  tagline:     d.tagline,
  icon:        d.icon,
  accentColor: d.accentColor,
  badgeLabel:  d.badgeLabel,
  isDualChart: d.analysisType === 'dual',
}));