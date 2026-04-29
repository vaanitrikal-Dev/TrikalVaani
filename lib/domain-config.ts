/**
 * ============================================================
 * TRIKAL VAANI — Domain Configuration
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/domain-config.ts
 * VERSION: 1.0 — All 11 domains defined
 * SIGNED: ROHIIT GUPTA, CEO
 * 🔒 LOCKED — DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * 11 DOMAIN IDs:
 *   genz_ex_back          | genz_toxic_boss      | genz_manifestation
 *   genz_dream_career     | mill_property_yog    | mill_karz_mukti
 *   mill_childs_destiny   | mill_parents_wellness
 *   genx_retirement_peace | genx_legacy_inheritance | genx_spiritual_innings
 * ============================================================
 */

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type DomainId =
  | 'genz_ex_back'
  | 'genz_toxic_boss'
  | 'genz_manifestation'
  | 'genz_dream_career'
  | 'mill_property_yog'
  | 'mill_karz_mukti'
  | 'mill_childs_destiny'
  | 'mill_parents_wellness'
  | 'genx_retirement_peace'
  | 'genx_legacy_inheritance'
  | 'genx_spiritual_innings';

export interface HouseConfig {
  number:       number;
  significance: string;
}

export interface PlanetConfig {
  planet:   string;
  role:     string;
  checkFor: string[];
}

export interface ClassicalBasis {
  text:     string;
  chapter?: string;
  rule:     string;
}

export interface DomainConfig {
  id:                     DomainId;
  displayName:            string;
  label:                  string;
  segment:                'genz' | 'millennial' | 'genx';
  analysisType:           'single' | 'dual';
  timeWindow:             string;
  primaryHouses:          HouseConfig[];
  secondaryHouses:        HouseConfig[];
  keyPlanets:             PlanetConfig[];
  dashaFocus:             string[];
  yogasToCheck:           string[];
  classicalBasis:         ClassicalBasis[];
  analysisDepthNote:      string;
  antiHallucinationRules: string[];
  worldContext:           'none' | 'sector' | 'general';
  worldContextSearchTerms: string[];
  extraOutputFields:      Record<string, string>;
}

// ─── DOMAIN DEFINITIONS ───────────────────────────────────────────────────────

const DOMAINS: Record<DomainId, DomainConfig> = {

  // ── GenZ Domains ────────────────────────────────────────────────────────────

  genz_ex_back: {
    id: 'genz_ex_back',
    displayName: 'Ex Back & Relationship Revival',
    label: 'Ex Back (Relationship)',
    segment: 'genz',
    analysisType: 'dual',
    timeWindow: '3-6 months',
    primaryHouses: [
      { number: 7, significance: 'Partner, marriage, relationships' },
      { number: 5, significance: 'Love, romance, attraction' },
    ],
    secondaryHouses: [
      { number: 12, significance: 'Hidden matters, past karma, bed pleasures' },
      { number: 2,  significance: 'Family, speech, emotional security' },
      { number: 8,  significance: 'Transformation, deep bonds, secrets' },
    ],
    keyPlanets: [
      { planet: 'Venus',   role: 'Primary karaka for love and relationships', checkFor: ['house', 'strength', 'aspects', 'dasha'] },
      { planet: 'Moon',    role: 'Emotional state, feelings, receptivity',    checkFor: ['house', 'nakshatra', 'strength'] },
      { planet: 'Rahu',    role: 'Obsession, unconventional attraction',       checkFor: ['house', 'aspects to Venus'] },
      { planet: 'Mars',    role: 'Passion, desire, aggression in love',        checkFor: ['house 7', 'strength'] },
      { planet: 'Jupiter', role: 'Dharmic relationships, commitment',          checkFor: ['aspect on 7th house'] },
    ],
    dashaFocus: ['Venus', 'Moon', 'Rahu', 'Jupiter'],
    yogasToCheck: ['Raj Yoga in 7th', 'Venus-Moon conjunction', 'Rahu in 7th', 'Venus-Rahu conjunction', 'Darakaraka strength'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.80', rule: '7th house for spouse and partnerships — strength of 7th lord indicates relationship outcomes' },
      { text: 'Jataka Parijata', rule: 'Venus as Kalatra karaka — its condition determines relationship revival possibility' },
      { text: 'BPHS', chapter: 'Ch.19', rule: '5th house for romance and past-life connections (Purva Punya)' },
    ],
    analysisDepthNote: 'For dual charts: analyze P1 7th house + Venus. Then analyze P2 chart. Find synastry — where P1 planets fall in P2 houses.',
    antiHallucinationRules: [
      'Never promise reconciliation — say "favorable energy for reconnection"',
      'Never invent specific dates for "ex will return"',
      'Only use Dasha dates for timing windows',
      'If Venus is debilitated, acknowledge challenge — do not ignore',
    ],
    worldContext: 'none',
    worldContextSearchTerms: [],
    extraOutputFields: {
      synastryScore:    'compatibility score 1-10 from dual chart analysis',
      reconnectWindow:  'most favorable Pratyantar period for reaching out',
      karmicBond:       'boolean — strong past-life connection indicator',
    },
  },

  genz_toxic_boss: {
    id: 'genz_toxic_boss',
    displayName: 'Workplace Conflict & Boss Problem',
    label: 'Toxic Boss (Workplace)',
    segment: 'genz',
    analysisType: 'single',
    timeWindow: '3-6 months',
    primaryHouses: [
      { number: 10, significance: 'Career, authority, boss, superiors' },
      { number: 6,  significance: 'Enemies, conflicts, service, daily work' },
    ],
    secondaryHouses: [
      { number: 8,  significance: 'Hidden enemies, sudden changes, transformation' },
      { number: 3,  significance: 'Courage, initiative, effort, communication' },
      { number: 11, significance: 'Gains, network, allies at work' },
    ],
    keyPlanets: [
      { planet: 'Saturn', role: 'Authority, discipline, karma at workplace',     checkFor: ['house', 'strength', '10th lord'] },
      { planet: 'Sun',    role: 'Ego, authority, relationship with superiors',   checkFor: ['10th house', 'strength', 'dasha'] },
      { planet: 'Mars',   role: 'Conflict, aggression, courage to confront',     checkFor: ['6th house', 'strength'] },
      { planet: 'Rahu',   role: 'Unconventional situations, foreign bosses',     checkFor: ['10th house', '6th house'] },
    ],
    dashaFocus: ['Saturn', 'Mars', 'Rahu', 'Sun'],
    yogasToCheck: ['Sasa Yoga (Saturn in kendra)', 'Mars in 10th', 'Vipreet Raj Yoga in 6th/8th', 'Sun-Saturn opposition'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.11', rule: '10th house for career and authority figures — boss relationship' },
      { text: 'BPHS', chapter: 'Ch.11', rule: '6th house for enemies, litigation, and workplace conflicts' },
      { text: 'Saravali', rule: 'Saturn in 10th — delays but eventual authority; Saturn afflicted — conflict with superiors' },
    ],
    analysisDepthNote: 'Focus on 10th lord condition, Saturn-Sun relationship, and 6th house planets. Check for transfer/change indicators in 3rd house.',
    antiHallucinationRules: [
      'Never say "boss will be fired" — say "authority dynamics may shift"',
      'Never predict job loss without multiple indicators',
      'Transfer windows must come from Dasha data only',
    ],
    worldContext: 'sector',
    worldContextSearchTerms: ['India workplace trends', 'job market India current'],
    extraOutputFields: {
      transferWindow:  'best Pratyantar period for job transfer or promotion',
      conflictPeak:    'period when conflict may intensify — avoid confrontation',
      allyPlanets:     'planets supporting you in this conflict',
    },
  },

  genz_manifestation: {
    id: 'genz_manifestation',
    displayName: 'Manifestation & Desire Fulfillment',
    label: 'Manifestation',
    segment: 'genz',
    analysisType: 'single',
    timeWindow: '6-12 months',
    primaryHouses: [
      { number: 5,  significance: 'Desires, creativity, Purva Punya, wishes' },
      { number: 9,  significance: 'Fortune, blessings, dharma, luck' },
    ],
    secondaryHouses: [
      { number: 1,  significance: 'Self, identity, personal power' },
      { number: 11, significance: 'Gains, fulfillment of desires, network' },
      { number: 12, significance: 'Spirituality, subconscious, hidden blessings' },
    ],
    keyPlanets: [
      { planet: 'Jupiter', role: 'Expansion, blessings, divine grace',      checkFor: ['house', 'strength', '5th aspect'] },
      { planet: 'Moon',    role: 'Mind, intention, emotional alignment',     checkFor: ['house', 'nakshatra', 'strength'] },
      { planet: 'Venus',   role: 'Desires, attractions, material fulfillment', checkFor: ['house', 'strength'] },
      { planet: 'Sun',     role: 'Soul purpose, divine connection',          checkFor: ['9th house', 'strength'] },
    ],
    dashaFocus: ['Jupiter', 'Moon', 'Venus', 'Sun'],
    yogasToCheck: ['Gaja Kesari Yoga', 'Raj Yoga in 5th/9th', 'Jupiter in Kendra', 'Dhana Yoga', '5th lord strength'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.11', rule: '5th house for Purva Punya — desires earned from past-life merit' },
      { text: 'BPHS', chapter: 'Ch.36', rule: 'Gaja Kesari Yoga — Jupiter in kendra from Moon — fulfillment of desires' },
      { text: 'Uttara Kalamrita', rule: '9th house fortune and divine grace — key for manifestation timing' },
    ],
    analysisDepthNote: 'Focus on Jupiter-Moon relationship, 5th lord strength, and 11th house for gains. Check Pratyantar for peak manifestation windows.',
    antiHallucinationRules: [
      'Never guarantee specific outcomes — use "favorable tendency"',
      'Manifestation windows from Dasha dates only',
      'Never invent Yogas not in the chart',
    ],
    worldContext: 'none',
    worldContextSearchTerms: [],
    extraOutputFields: {
      manifestationScore: 'chart support for desire fulfillment 1-10',
      peakWindow:         'strongest Pratyantar for focused intention',
      blockingPlanets:    'planets creating resistance — with remedies',
    },
  },

  genz_dream_career: {
    id: 'genz_dream_career',
    displayName: 'Dream Career & Profession',
    label: 'Dream Career',
    segment: 'genz',
    analysisType: 'single',
    timeWindow: '6-18 months',
    primaryHouses: [
      { number: 10, significance: 'Career, profession, public life, authority' },
      { number: 1,  significance: 'Self, identity, personal brand' },
    ],
    secondaryHouses: [
      { number: 2,  significance: 'Income, wealth, financial growth' },
      { number: 6,  significance: 'Service, daily work, effort' },
      { number: 9,  significance: 'Fortune, higher education, dharmic career' },
      { number: 11, significance: 'Gains, career network, long-term goals' },
    ],
    keyPlanets: [
      { planet: 'Saturn',  role: 'Discipline, career karma, long-term success',    checkFor: ['10th house', 'strength', 'dasha'] },
      { planet: 'Sun',     role: 'Authority, leadership, career identity',          checkFor: ['10th house', 'strength'] },
      { planet: 'Mercury', role: 'Communication skills, business, tech career',     checkFor: ['house', 'strength'] },
      { planet: 'Jupiter', role: 'Career expansion, growth, wisdom-based professions', checkFor: ['10th aspect', 'strength'] },
      { planet: 'Rahu',    role: 'Unconventional career, foreign opportunities',    checkFor: ['10th house', 'dasha'] },
    ],
    dashaFocus: ['Saturn', 'Sun', 'Rahu', 'Jupiter', 'Mercury'],
    yogasToCheck: ['Raj Yoga in 10th', 'Sasa Yoga', 'Ruchaka Yoga', 'Budhaditya Yoga', '10th lord in Kendra'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.11', rule: '10th house for career, profession, and public reputation' },
      { text: 'BPHS', chapter: 'Ch.36', rule: 'Panch Mahapurusha Yogas — Ruchaka/Sasa/Bhadra for career excellence' },
      { text: 'Saravali', rule: 'Saturn in 10th — slow but definite career rise with persistence' },
    ],
    analysisDepthNote: 'Identify best profession from 10th lord sign and planets in 10th. Saturn Dasha = discipline-based rise. Rahu Dasha = unconventional jump.',
    antiHallucinationRules: [
      'Never name specific companies or job titles',
      'Career windows from Dasha data only',
      'Never guarantee promotion — use "favorable period for career advancement"',
    ],
    worldContext: 'sector',
    worldContextSearchTerms: ['India job market current', 'hiring trends India 2026'],
    extraOutputFields: {
      bestProfession:  'top 2-3 professions indicated by 10th house analysis',
      careerWindow:    'strongest Pratyantar for career move or promotion',
      skillPlanets:    'planets indicating natural talents and strengths',
    },
  },

  // ── Millennial Domains ──────────────────────────────────────────────────────

  mill_property_yog: {
    id: 'mill_property_yog',
    displayName: 'Property & Real Estate',
    label: 'Property Yog',
    segment: 'millennial',
    analysisType: 'single',
    timeWindow: '12-24 months',
    primaryHouses: [
      { number: 4,  significance: 'Home, property, land, mother, domestic peace' },
      { number: 2,  significance: 'Accumulated wealth, family assets' },
    ],
    secondaryHouses: [
      { number: 11, significance: 'Gains, financial goals, long-term accumulation' },
      { number: 12, significance: 'Foreign property, expenses on property' },
      { number: 8,  significance: 'Inheritance, ancestral property, loans' },
    ],
    keyPlanets: [
      { planet: 'Mars',    role: 'Bhoomi karaka — primary indicator of land/property', checkFor: ['house', 'strength', 'dasha', '4th aspect'] },
      { planet: 'Moon',    role: 'Domestic peace, comfort, settling down',             checkFor: ['4th house', 'strength'] },
      { planet: 'Saturn',  role: 'Delays in property, karma around assets',            checkFor: ['4th house', 'strength'] },
      { planet: 'Jupiter', role: 'Expansion, multiple properties, wisdom in purchase', checkFor: ['strength', 'dasha', '4th aspect'] },
      { planet: 'Venus',   role: 'Luxurious property, aesthetics, comfort',            checkFor: ['4th house', 'strength'] },
    ],
    dashaFocus: ['Mars', 'Jupiter', 'Venus', 'Moon', 'Saturn'],
    yogasToCheck: ['Mars in 4th or aspecting 4th', 'Raj Yoga involving 4th lord', 'Jupiter-Mars combination', 'Dhana Yoga', '4th lord strength'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.11', rule: '4th house for property, home, and land — Mars as Bhoomi karaka' },
      { text: 'BPHS', chapter: 'Ch.32', rule: 'Mars as Bhoomi karaka — its strength determines property acquisition' },
      { text: 'Phaladeepika', rule: 'Jupiter aspecting 4th house — auspicious for property purchase' },
    ],
    analysisDepthNote: 'Check Mars strength and dasha. 4th lord condition. Ashtakavarga score of 4th house. Check 11th for gains and 12th for expenses related to property.',
    antiHallucinationRules: [
      'Never give specific property price predictions',
      'Never name specific locations as "best"',
      'Property timing from Dasha data only — never invented dates',
      'If Mars is debilitated, clearly mention delays',
    ],
    worldContext: 'general',
    worldContextSearchTerms: ['real estate India current prices', 'home loan rates India 2026', 'property market Delhi NCR'],
    extraOutputFields: {
      propertyYogScore:  'strength of property yoga in chart 1-10',
      bestBuyWindow:     'most favorable Pratyantar for property purchase',
      loanIndicator:     'chart support for home loan approval',
    },
  },

  mill_karz_mukti: {
    id: 'mill_karz_mukti',
    displayName: 'Karz Mukti (Debt Liberation)',
    label: 'Karz Mukti (Debt)',
    segment: 'millennial',
    analysisType: 'single',
    timeWindow: '6-18 months',
    primaryHouses: [
      { number: 6,  significance: 'Debts, enemies, service, financial challenges' },
      { number: 2,  significance: 'Wealth, savings, financial accumulation' },
    ],
    secondaryHouses: [
      { number: 12, significance: 'Expenses, losses, hidden costs' },
      { number: 8,  significance: 'Loans, borrowed money, transformation' },
      { number: 11, significance: 'Gains, income sources, debt repayment capacity' },
    ],
    keyPlanets: [
      { planet: 'Saturn',  role: 'Karma of debt, discipline for repayment', checkFor: ['6th house', 'strength', 'dasha'] },
      { planet: 'Jupiter', role: 'Relief from debt, divine grace, expansion', checkFor: ['6th aspect', 'strength', 'dasha'] },
      { planet: 'Rahu',    role: 'Obsessive debt cycle, foreign loans',      checkFor: ['6th house', '8th house'] },
      { planet: 'Mercury', role: 'Financial planning, negotiations, loans',  checkFor: ['house', 'strength'] },
      { planet: 'Moon',    role: 'Emotional stress from debt, mental peace', checkFor: ['6th house', 'strength'] },
    ],
    dashaFocus: ['Saturn', 'Rahu', 'Jupiter', 'Mercury'],
    yogasToCheck: ['Vipreet Raj Yoga in 6th', 'Jupiter aspecting 6th', 'Rina Mukti Yoga', '6th lord in 12th', 'Saturn-Jupiter relationship'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.11', rule: '6th house for debts and financial obligations — 6th lord strength' },
      { text: 'BPHS', chapter: 'Ch.38', rule: 'Vipreet Raj Yoga — 6th lord in 12th — debt liberation through unexpected means' },
      { text: 'Saravali', rule: 'Jupiter aspecting 6th house — Rina Mukti Yoga — liberation from debt' },
    ],
    analysisDepthNote: 'Analyze 6th-12th axis. Jupiter\'s aspect on 6th is key Rina Mukti indicator. Saturn Dasha = slow but steady repayment. Check 11th for income capacity.',
    antiHallucinationRules: [
      'Never give specific amount predictions for debt',
      'Never guarantee debt-free dates — use "favorable windows for repayment"',
      'Timing from Dasha data only',
      'If 6th lord is strong, debts may persist — acknowledge honestly',
    ],
    worldContext: 'none',
    worldContextSearchTerms: [],
    extraOutputFields: {
      debtFreeWindow:    'strongest Pratyantar for debt reduction breakthrough',
      incomeBoostPeriod: 'period for increased income flow',
      rinaMuktiYoga:     'boolean — classical debt liberation yoga present',
    },
  },

  mill_childs_destiny: {
    id: 'mill_childs_destiny',
    displayName: "Child's Destiny & Future",
    label: "Child's Destiny",
    segment: 'millennial',
    analysisType: 'single',
    timeWindow: '1-5 years',
    primaryHouses: [
      { number: 5,  significance: 'Children, Purva Punya, intelligence, creativity' },
      { number: 9,  significance: 'Fortune, higher education, dharma, destiny' },
    ],
    secondaryHouses: [
      { number: 1,  significance: 'Child\'s overall personality and health' },
      { number: 4,  significance: 'Education foundation, home environment' },
      { number: 10, significance: 'Career potential, public achievement' },
      { number: 11, significance: 'Long-term success, achievement' },
    ],
    keyPlanets: [
      { planet: 'Jupiter', role: 'Putrakaraka — primary indicator of children\'s wellbeing', checkFor: ['5th house', 'strength', 'dasha'] },
      { planet: 'Moon',    role: 'Child\'s mind, emotions, nurturing',                       checkFor: ['house', 'strength', 'nakshatra'] },
      { planet: 'Mercury', role: 'Intelligence, communication, academic aptitude',            checkFor: ['5th house', 'strength'] },
      { planet: 'Sun',     role: 'Child\'s soul purpose, leadership potential',               checkFor: ['strength', 'house'] },
      { planet: 'Mars',    role: 'Energy, sports, courage, competitive ability',              checkFor: ['strength', 'house'] },
    ],
    dashaFocus: ['Jupiter', 'Moon', 'Mercury', 'Sun'],
    yogasToCheck: ['Gaja Kesari Yoga', 'Saraswati Yoga', 'Budhaditya Yoga', 'Jupiter in 5th', 'Dhana Yoga in 5th'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.32', rule: 'Jupiter as Putrakaraka — strength indicates children\'s fortune and destiny' },
      { text: 'BPHS', chapter: 'Ch.11', rule: '5th house for children, intelligence, and Purva Punya blessings' },
      { text: 'BPHS', chapter: 'Ch.36', rule: 'Saraswati Yoga — Jupiter-Mercury-Venus — exceptional academic ability' },
    ],
    analysisDepthNote: 'Analyze both as parent\'s chart (5th house) AND child\'s chart if birth details provided. Jupiter\'s condition is paramount for child\'s future.',
    antiHallucinationRules: [
      'Never predict specific career for child — use "inclination toward"',
      'Never predict specific exam results',
      'Never diagnose learning difficulties from chart alone',
      'Use compassionate language — parents are emotionally invested',
    ],
    worldContext: 'none',
    worldContextSearchTerms: [],
    extraOutputFields: {
      aptitude:         'top 2-3 natural aptitudes from 5th house analysis',
      educationPeak:    'strongest Pratyantar for academic excellence',
      specialGifts:     'unique talents indicated by planetary combinations',
    },
  },

  mill_parents_wellness: {
    id: 'mill_parents_wellness',
    displayName: 'Parents Health & Wellness',
    label: 'Parents Wellness',
    segment: 'millennial',
    analysisType: 'single',
    timeWindow: '6-12 months',
    primaryHouses: [
      { number: 4,  significance: 'Mother\'s health, domestic peace, emotional foundation' },
      { number: 9,  significance: 'Father\'s health, fortune, paternal blessings' },
    ],
    secondaryHouses: [
      { number: 6,  significance: 'Health challenges, medical issues, recovery' },
      { number: 8,  significance: 'Longevity, chronic conditions, transformation' },
      { number: 12, significance: 'Hospitalization, recovery, bed rest' },
    ],
    keyPlanets: [
      { planet: 'Moon',    role: 'Mother\'s health, emotional wellbeing',        checkFor: ['4th house', 'strength'] },
      { planet: 'Sun',     role: 'Father\'s vitality, paternal health',          checkFor: ['9th house', 'strength', 'dasha'] },
      { planet: 'Saturn',  role: 'Ayushkaraka — longevity indicator',            checkFor: ['strength', 'dasha', '8th house'] },
      { planet: 'Jupiter', role: 'Healing grace, recovery, general wellbeing',   checkFor: ['strength', 'aspect on 6th/8th'] },
      { planet: 'Mars',    role: 'Surgery, accidents, energy levels',            checkFor: ['6th house', '8th house'] },
    ],
    dashaFocus: ['Moon', 'Sun', 'Saturn', 'Jupiter'],
    yogasToCheck: ['Saturn strength (Ayushkaraka)', 'Jupiter aspecting 6th/8th', 'Moon in 4th strength', 'Sun in 9th strength'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.32', rule: 'Saturn as Ayushkaraka — longevity indicator for family members' },
      { text: 'BPHS', chapter: 'Ch.11', rule: '4th house for mother, 9th house for father — their health from native\'s chart' },
      { text: 'Uttara Kalamrita', rule: 'Jupiter\'s aspect on 6th or 8th — healing and recovery protection' },
    ],
    analysisDepthNote: 'Read 4th house for mother\'s health, 9th for father\'s. Check their dasha lords. Saturn strength is critical for longevity. Focus on healing windows.',
    antiHallucinationRules: [
      'NEVER predict death or serious illness with certainty',
      'Always use "health challenge" not "critical illness"',
      'Medical decisions must be made by doctors — astrology shows tendencies only',
      'Use compassionate language — this is emotionally sensitive domain',
    ],
    worldContext: 'none',
    worldContextSearchTerms: [],
    extraOutputFields: {
      motherHealthWindow:  'favorable Pratyantar for mother\'s health improvement',
      fatherHealthWindow:  'favorable Pratyantar for father\'s health improvement',
      protectiveRemedies:  'key remedies for parents\' protection and longevity',
    },
  },

  // ── GenX Domains ────────────────────────────────────────────────────────────

  genx_retirement_peace: {
    id: 'genx_retirement_peace',
    displayName: 'Retirement Peace & Second Innings',
    label: 'Retirement Peace',
    segment: 'genx',
    analysisType: 'single',
    timeWindow: '1-3 years',
    primaryHouses: [
      { number: 12, significance: 'Spiritual liberation, rest, foreign settlement, expenses' },
      { number: 2,  significance: 'Accumulated wealth, savings, family support' },
    ],
    secondaryHouses: [
      { number: 4,  significance: 'Home, comfort, peace of mind, settled life' },
      { number: 9,  significance: 'Dharma, wisdom, pilgrimage, spiritual seeking' },
      { number: 8,  significance: 'Pension, retirement funds, inheritance' },
      { number: 11, significance: 'Passive income, social network, fulfillment' },
    ],
    keyPlanets: [
      { planet: 'Saturn',  role: 'Karma completion, retirement timing, discipline', checkFor: ['strength', 'dasha', 'house'] },
      { planet: 'Jupiter', role: 'Wisdom, expansion, spiritual grace in later life', checkFor: ['strength', 'dasha'] },
      { planet: 'Ketu',    role: 'Detachment, spiritual seeking, liberation',        checkFor: ['12th house', 'house'] },
      { planet: 'Moon',    role: 'Peace of mind, emotional contentment',             checkFor: ['4th house', 'strength'] },
      { planet: 'Venus',   role: 'Comfort, pleasures, artistic pursuits in retirement', checkFor: ['strength', 'house'] },
    ],
    dashaFocus: ['Saturn', 'Jupiter', 'Ketu', 'Moon'],
    yogasToCheck: ['Ketu in 12th', 'Sasa Yoga (Saturn strong)', 'Jupiter in 9th', 'Vaanaprastha indicators', 'Moon in 4th or 12th'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.11', rule: '12th house for liberation, rest, and spiritual seeking — Vaanaprastha ashrama' },
      { text: 'Uttara Kalamrita', rule: 'Saturn Mahadasha in later life — karma completion, retirement, righteous rest' },
      { text: 'BPHS', chapter: 'Ch.32', rule: 'Ketu for moksha and detachment — strength indicates peaceful withdrawal from worldly life' },
    ],
    analysisDepthNote: 'Focus on 12th house condition, Ketu placement, Saturn Dasha timing. Check 2nd house for financial security in retirement. 9th for spiritual fulfillment.',
    antiHallucinationRules: [
      'Never predict exact retirement date — use "favorable window"',
      'Never guarantee financial security — use "indicators suggest"',
      'Spiritual guidance must be general — never prescribe specific paths',
    ],
    worldContext: 'none',
    worldContextSearchTerms: [],
    extraOutputFields: {
      retirementWindow:  'most favorable Pratyantar for retirement transition',
      passiveIncomeYog:  'chart indicators for passive income in retirement',
      spiritualPath:     'indicated spiritual inclination from 9th/12th house',
    },
  },

  genx_legacy_inheritance: {
    id: 'genx_legacy_inheritance',
    displayName: 'Legacy, Inheritance & Ancestral Wealth',
    label: 'Legacy & Inheritance',
    segment: 'genx',
    analysisType: 'single',
    timeWindow: '1-3 years',
    primaryHouses: [
      { number: 8,  significance: 'Inheritance, ancestral wealth, sudden gains, legacy' },
      { number: 2,  significance: 'Family wealth, accumulated assets, speech' },
    ],
    secondaryHouses: [
      { number: 4,  significance: 'Ancestral property, maternal inheritance' },
      { number: 9,  significance: 'Father\'s wealth, paternal legacy, fortune' },
      { number: 12, significance: 'Hidden assets, foreign wealth, dissolution' },
      { number: 11, significance: 'Long-term gains, fulfillment of financial goals' },
    ],
    keyPlanets: [
      { planet: 'Saturn',  role: 'Karma of inheritance, ancestral patterns',      checkFor: ['8th house', 'strength', 'dasha'] },
      { planet: 'Rahu',    role: 'Unexpected inheritance, foreign assets',         checkFor: ['8th house', '2nd house'] },
      { planet: 'Jupiter', role: 'Dharmic wealth, legal inheritance, expansion',   checkFor: ['strength', 'dasha', '8th aspect'] },
      { planet: 'Mars',    role: 'Property disputes, courage in claiming legacy',  checkFor: ['8th house', 'strength'] },
      { planet: 'Moon',    role: 'Maternal inheritance, emotional legacy',         checkFor: ['4th house', 'strength'] },
    ],
    dashaFocus: ['Saturn', 'Rahu', 'Jupiter', 'Mars'],
    yogasToCheck: ['Rahu in 8th (sudden gains)', 'Jupiter aspecting 8th', 'Dhana Yoga in 8th', '8th lord in 2nd or 11th'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.11', rule: '8th house for inheritance, legacy, and unearned wealth from family' },
      { text: 'Jataka Parijata', rule: 'Rahu in 8th — unexpected inheritance, often from outside family' },
      { text: 'BPHS', chapter: 'Ch.39', rule: 'Dhana Yogas — combinations for inherited and accumulated wealth' },
    ],
    analysisDepthNote: 'Analyze 8th-2nd axis. Rahu in 8th = unexpected windfall. Jupiter aspecting 8th = legal, righteous inheritance. Check for property dispute indicators (Mars in 8th).',
    antiHallucinationRules: [
      'Never predict specific inheritance amounts',
      'Never predict death of family members for inheritance',
      'Legal matters — always advise consulting a lawyer',
      'Inheritance timing from Dasha data only',
    ],
    worldContext: 'none',
    worldContextSearchTerms: [],
    extraOutputFields: {
      inheritanceYog:   'strength of inheritance indicators 1-10',
      legalClarity:     'period when inheritance matters may resolve',
      ancestralKarma:   'patterns from ancestral karma affecting current wealth',
    },
  },

  genx_spiritual_innings: {
    id: 'genx_spiritual_innings',
    displayName: 'Spiritual Path & Inner Journey',
    label: 'Spiritual Innings',
    segment: 'genx',
    analysisType: 'single',
    timeWindow: '1-5 years',
    primaryHouses: [
      { number: 12, significance: 'Moksha, liberation, spiritual seeking, isolation' },
      { number: 9,  significance: 'Dharma, higher wisdom, pilgrimage, Guru' },
    ],
    secondaryHouses: [
      { number: 8,  significance: 'Occult, mysticism, transformation, hidden knowledge' },
      { number: 1,  significance: 'Self, identity, spiritual awakening' },
      { number: 5,  significance: 'Mantra, spiritual practices, Purva Punya' },
    ],
    keyPlanets: [
      { planet: 'Ketu',    role: 'Liberation, detachment, past-life spirituality',   checkFor: ['12th house', 'house', 'dasha'] },
      { planet: 'Jupiter', role: 'Guru, wisdom, dharmic path, spiritual expansion',  checkFor: ['9th house', 'strength', 'dasha'] },
      { planet: 'Saturn',  role: 'Spiritual discipline, karma completion, tapasya',  checkFor: ['strength', 'dasha', 'house'] },
      { planet: 'Moon',    role: 'Spiritual sensitivity, devotion, inner peace',     checkFor: ['12th house', 'strength'] },
      { planet: 'Sun',     role: 'Soul purpose, spiritual identity, divine light',   checkFor: ['9th house', 'strength'] },
    ],
    dashaFocus: ['Ketu', 'Jupiter', 'Saturn', 'Moon'],
    yogasToCheck: ['Ketu in 12th (Moksha indicator)', 'Jupiter in 9th (Dharma Yoga)', 'Saturn-Ketu conjunction', 'Pravrajya Yoga', 'Moon in 12th'],
    classicalBasis: [
      { text: 'BPHS', chapter: 'Ch.32', rule: 'Ketu as Moksha karaka — its strength and placement indicate spiritual path' },
      { text: 'BPHS', chapter: 'Ch.11', rule: '9th house for Guru, dharma, and higher spiritual wisdom' },
      { text: 'Phaladeepika', rule: 'Pravrajya Yoga — multiple planets in 12th/9th — renunciation and spiritual calling' },
    ],
    analysisDepthNote: 'Focus on Ketu\'s condition and house. Jupiter-Ketu relationship. 9th lord strength. Check for Pravrajya Yoga. Saturn Dasha = deep spiritual discipline period.',
    antiHallucinationRules: [
      'Never prescribe specific spiritual traditions or Gurus',
      'Never predict enlightenment or moksha dates',
      'Spiritual tendencies only — personal path is individual choice',
      'Use respectful, non-dogmatic language',
    ],
    worldContext: 'none',
    worldContextSearchTerms: [],
    extraOutputFields: {
      spiritualStrength:  'strength of spiritual indicators in chart 1-10',
      sadhanaWindow:      'most powerful Pratyantar for spiritual practice',
      karmicRelease:      'areas of karmic clearing indicated in current period',
    },
  },

};

// ─── EXPORTS ──────────────────────────────────────────────────────────────────

export function getDomainConfig(domainId: string): DomainConfig {
  const config = DOMAINS[domainId as DomainId];
  if (!config) {
    throw new Error(`Unknown domainId: ${domainId}`);
  }
  return config;
}

export function getAllDomains(): DomainConfig[] {
  return Object.values(DOMAINS);
}

export function getDomainsBySegment(segment: 'genz' | 'millennial' | 'genx'): DomainConfig[] {
  return Object.values(DOMAINS).filter(d => d.segment === segment);
}

// ─── PERIOD HELPER ────────────────────────────────────────────────────────────

export function getCurrentPeriod(): {
  isoDate:       string;
  monthYear:     string;
  quarter:       string;
  financialYear: string;
} {
  const now = new Date();
  const isoDate = now.toISOString().split('T')[0];

  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const monthYear = `${months[now.getMonth()]} ${now.getFullYear()}`;

  const q = Math.floor(now.getMonth() / 3) + 1;
  const quarter = `Q${q} ${now.getFullYear()}`;

  const fy = now.getMonth() >= 3
    ? `FY${now.getFullYear()}-${(now.getFullYear() + 1).toString().slice(2)}`
    : `FY${now.getFullYear() - 1}-${now.getFullYear().toString().slice(2)}`;

  return { isoDate, monthYear, quarter, financialYear: fy };
}
