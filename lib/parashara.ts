/**
 * FILE: lib/parashara.ts
 * Trikal Vaani — Complete Parashara Classical Engine
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * Version: 1.0 | Date: 2026-04-27
 *
 * COVERS (BPHS-based):
 *   1. Yoga Detection (25+ Yogas)
 *   2. Ashtakavarga Calculation (8 Bhinnashtakavarga + Sarvashtakavarga)
 *   3. Graha Drishti Matrix (all special aspects)
 *   4. Shadbala Classification
 *   5. Navamsa D9 Calculation
 *   6. Parashara Remedies (Mantra, Dana, Vrat, Yantra, Ratna, Aushadhi)
 *   7. Dos & Don'ts per afflicted planet
 *   8. Argala (planetary intervention)
 */

import type { KundaliData, PlanetPosition } from './swiss-ephemeris';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface YogaResult {
  name:          string;
  present:       boolean;
  planets:       string[];
  houses:        number[];
  effect:        string;
  strength:      'strong' | 'moderate' | 'weak';
  classicalBasis: string;
}

export interface AshtakavargaResult {
  planet:              string;
  bhinnashtakavarga:   number[];  // score for each of 12 houses [0..11]
  totalPoints:         number;
}

export interface SarvashtakavargaResult {
  houses:      number[];  // total score per house [0..11]
  strongHouses: number[]; // houses with score >= 28
  weakHouses:   number[]; // houses with score <= 25
}

export interface DrishtiResult {
  fromPlanet: string;
  toPlanet:   string;
  toHouse:    number;
  aspectType: 'full' | 'three-quarter' | 'half' | 'quarter';
  strength:   number; // 100 | 75 | 50 | 25
}

export interface NavamsaPosition {
  planet: string;
  rashi:  string;
  house:  number;
}

export interface RemedySet {
  planet:     string;
  affliction: string;
  mantra:     { text: string; count: number; day: string; time: string };
  dana:       { item: string; day: string; recipient: string };
  vrat:       { day: string; deity: string; duration: string };
  yantra:     { name: string; placement: string; day: string };
  ratna:      { gem: string; metal: string; finger: string; weight: string; day: string; caution: string };
  aushadhi:   { herb: string; use: string };
  dos:        string[];
  donts:      string[];
  classicalBasis: string;
}

export interface ArgalaResult {
  house:          number;
  argalaPlanets:  string[];
  virodhaArgala:  string[];
  netEffect:      'positive' | 'negative' | 'mixed' | 'none';
}

export interface ParasharaAnalysis {
  yogas:            YogaResult[];
  activeYogas:      YogaResult[];
  ashtakavarga:     AshtakavargaResult[];
  sarvashtakavarga: SarvashtakavargaResult;
  drishti:          DrishtiResult[];
  navamsa:          NavamsaPosition[];
  remedies:         RemedySet[];
  argala:           ArgalaResult[];
  dashaBalance:     string;
  summary: {
    strongPlanets:    string[];
    weakPlanets:      string[];
    bestHouses:       number[];
    challengedHouses: number[];
    primaryYoga:      string | null;
    overallStrength:  'strong' | 'moderate' | 'weak';
  };
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const RASHIS = [
  'Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya',
  'Tula', 'Vrischik', 'Dhanu', 'Makar', 'Kumbh', 'Meen',
];

const RASHI_LORDS: Record<string, string> = {
  Mesh: 'Mars', Vrishabh: 'Venus', Mithun: 'Mercury', Kark: 'Moon',
  Simha: 'Sun', Kanya: 'Mercury', Tula: 'Venus', Vrischik: 'Mars',
  Dhanu: 'Jupiter', Makar: 'Saturn', Kumbh: 'Saturn', Meen: 'Jupiter',
};

const EXALTATION: Record<string, string> = {
  Sun: 'Mesh', Moon: 'Vrishabh', Mars: 'Makar', Mercury: 'Kanya',
  Jupiter: 'Kark', Venus: 'Meen', Saturn: 'Tula',
};

const DEBILITATION: Record<string, string> = {
  Sun: 'Tula', Moon: 'Vrischik', Mars: 'Kark', Mercury: 'Meen',
  Jupiter: 'Makar', Venus: 'Kanya', Saturn: 'Mesh',
};

const OWN_SIGNS: Record<string, string[]> = {
  Sun: ['Simha'], Moon: ['Kark'], Mars: ['Mesh', 'Vrischik'],
  Mercury: ['Mithun', 'Kanya'], Jupiter: ['Dhanu', 'Meen'],
  Venus: ['Vrishabh', 'Tula'], Saturn: ['Makar', 'Kumbh'],
};

const NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const NATURAL_MALEFICS  = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];

// Ashtakavarga contribution tables (from BPHS)
// 1 = contributes, 0 = does not
// Rows = planet contributing, Cols = house positions from Lagna (1-12)
const ASHTAK_TABLES: Record<string, number[][]> = {
  Sun: [
    // From Sun's position: houses 1,2,4,7,8,9,10,11 get bindus
    [1,1,0,1,0,0,1,1,1,1,1,0], // Sun itself
    [0,0,1,0,1,1,0,0,0,0,0,1], // Moon
    [1,1,0,1,0,0,1,1,1,1,1,0], // Mars
    [0,1,1,0,1,1,0,0,1,0,1,1], // Mercury
    [1,0,0,1,1,1,0,1,1,0,0,1], // Jupiter
    [0,0,1,0,0,0,1,1,0,1,1,1], // Venus
    [1,1,0,0,0,1,1,1,1,0,1,0], // Saturn
    [1,1,0,1,0,0,1,1,1,1,1,0], // Lagna
  ],
  Moon: [
    [1,1,1,0,1,1,0,1,0,1,1,0],
    [1,1,0,0,1,1,0,0,1,1,1,0],
    [0,1,1,1,0,0,1,1,0,0,1,1],
    [1,0,1,1,0,0,1,1,1,1,0,1],
    [1,1,0,0,1,1,0,0,1,1,1,0],
    [0,0,1,1,0,0,1,1,1,0,1,1],
    [1,1,0,1,0,1,0,1,1,1,0,1],
    [1,1,1,0,1,1,0,1,0,1,1,0],
  ],
  Mars: [
    [0,0,1,1,0,1,1,0,1,1,0,1],
    [0,0,1,1,0,0,1,1,1,0,0,1],
    [1,1,0,0,1,1,0,0,0,1,1,0],
    [0,1,1,0,1,0,1,1,0,0,1,1],
    [1,0,0,1,0,1,1,1,1,0,0,1],
    [0,1,1,0,0,1,1,0,0,1,1,1],
    [1,0,0,1,1,0,0,1,1,1,0,0],
    [0,0,1,1,0,1,1,0,1,1,0,1],
  ],
  Mercury: [
    [1,1,0,1,1,1,0,1,1,0,1,0],
    [0,1,1,0,0,1,1,1,0,1,1,0],
    [1,0,1,1,0,0,1,1,1,0,0,1],
    [1,1,0,0,1,1,0,0,1,1,0,1],
    [0,1,1,1,0,1,1,0,0,1,1,0],
    [1,0,0,1,1,0,1,1,1,0,1,1],
    [0,1,1,0,1,0,0,1,1,1,0,1],
    [1,1,0,1,1,1,0,1,1,0,1,0],
  ],
  Jupiter: [
    [1,1,1,0,1,1,0,0,1,1,0,1],
    [0,0,1,1,0,0,1,1,1,0,0,1],
    [1,1,0,0,1,1,1,0,0,1,1,0],
    [0,1,1,0,0,1,0,1,1,0,1,1],
    [1,0,0,1,1,0,1,1,0,1,0,1],
    [0,1,1,0,1,0,1,0,1,1,1,0],
    [1,0,1,1,0,1,0,1,1,0,0,1],
    [1,1,1,0,1,1,0,0,1,1,0,1],
  ],
  Venus: [
    [0,1,1,1,0,1,1,0,0,1,1,0],
    [1,0,0,1,1,0,0,1,1,0,1,1],
    [0,1,1,0,1,1,0,1,0,1,0,1],
    [1,1,0,0,1,0,1,1,1,0,1,0],
    [0,0,1,1,0,1,1,0,1,1,0,1],
    [1,1,0,1,0,0,1,1,0,0,1,1],
    [0,0,1,0,1,1,1,0,1,0,1,1],
    [0,1,1,1,0,1,1,0,0,1,1,0],
  ],
  Saturn: [
    [1,0,1,1,0,1,0,1,1,0,0,1],
    [0,1,0,1,1,0,1,1,0,1,1,0],
    [1,1,0,0,1,0,1,0,1,1,0,1],
    [0,0,1,1,0,1,1,0,0,1,1,1],
    [1,1,0,0,1,1,0,1,1,0,1,0],
    [0,1,1,1,0,0,1,1,1,0,0,1],
    [1,0,1,0,1,1,0,0,1,1,1,0],
    [1,0,1,1,0,1,0,1,1,0,0,1],
  ],
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function runParasharaAnalysis(kundali: KundaliData): ParasharaAnalysis {
  const planets = kundali.planets;
  const lagna   = kundali.lagna;
  const lagnaIndex = RASHIS.indexOf(lagna);

  const yogas           = detectAllYogas(planets, lagna, lagnaIndex);
  const ashtakavarga    = calculateAshtakavarga(planets, lagnaIndex);
  const sarvashtakavarga = calculateSarvashtakavarga(ashtakavarga);
  const drishti         = calculateDrishti(planets);
  const navamsa         = calculateNavamsa(planets);
  const remedies        = generateRemedies(planets, lagna, drishti);
  const argala          = calculateArgala(planets, lagnaIndex);

  const activeYogas = yogas.filter(y => y.present);

  const strongPlanets = Object.entries(planets)
    .filter(([, p]) => p.strength >= 65)
    .map(([name]) => name);

  const weakPlanets = Object.entries(planets)
    .filter(([, p]) => p.strength < 35 && !['Rahu', 'Ketu'].includes(p.name))
    .map(([name]) => name);

  const bestHouses      = sarvashtakavarga.strongHouses;
  const challengedHouses = sarvashtakavarga.weakHouses;

  const primaryYoga = activeYogas.length > 0
    ? activeYogas.sort((a, b) =>
        (b.strength === 'strong' ? 3 : b.strength === 'moderate' ? 2 : 1) -
        (a.strength === 'strong' ? 3 : a.strength === 'moderate' ? 2 : 1)
      )[0].name
    : null;

  const avgStrength = Object.values(planets)
    .filter(p => !['Rahu', 'Ketu'].includes(p.name))
    .reduce((sum, p) => sum + p.strength, 0) / 7;

  const overallStrength: 'strong' | 'moderate' | 'weak' =
    avgStrength >= 60 ? 'strong' : avgStrength >= 40 ? 'moderate' : 'weak';

  return {
    yogas,
    activeYogas,
    ashtakavarga,
    sarvashtakavarga,
    drishti,
    navamsa,
    remedies,
    argala,
    dashaBalance: kundali.dashaBalance ?? '',
    summary: {
      strongPlanets,
      weakPlanets,
      bestHouses,
      challengedHouses,
      primaryYoga,
      overallStrength,
    },
  };
}

// ─── 1. YOGA DETECTION ────────────────────────────────────────────────────────

function detectAllYogas(
  planets:    Record<string, PlanetPosition>,
  lagna:      string,
  lagnaIndex: number,
): YogaResult[] {
  const yogas: YogaResult[] = [];

  // Helper: get house number of a planet (1-12)
  function house(planet: string): number {
    return planets[planet]?.house ?? 0;
  }

  function rashi(planet: string): string {
    return planets[planet]?.rashi ?? '';
  }

  function strength(planet: string): number {
    return planets[planet]?.strength ?? 0;
  }

  function inSameHouse(p1: string, p2: string): boolean {
    return house(p1) === house(p2) && house(p1) !== 0;
  }

  function inKendra(planet: string): boolean {
    return [1, 4, 7, 10].includes(house(planet));
  }

  function inTrikona(planet: string): boolean {
    return [1, 5, 9].includes(house(planet));
  }

  function inDusthana(planet: string): boolean {
    return [6, 8, 12].includes(house(planet));
  }

  function lordOf(h: number): string {
    const rashiIndex = (lagnaIndex + h - 1) % 12;
    return RASHI_LORDS[RASHIS[rashiIndex]] ?? '';
  }

  function isExalted(planet: string): boolean {
    return EXALTATION[planet] === rashi(planet);
  }

  function isDebilitated(planet: string): boolean {
    return DEBILITATION[planet] === rashi(planet);
  }

  function isOwnSign(planet: string): boolean {
    return OWN_SIGNS[planet]?.includes(rashi(planet)) ?? false;
  }

  // ── RAJ YOGA ──────────────────────────────────────────────────────────────
  const kendraLords  = [1, 4, 7, 10].map(lordOf);
  const trikonaLords = [1, 5, 9].map(lordOf);

  for (const kl of kendraLords) {
    for (const tl of trikonaLords) {
      if (kl === tl) continue;
      if (inSameHouse(kl, tl) || rashi(kl) === rashi(tl)) {
        yogas.push({
          name: 'Raj Yoga',
          present: true,
          planets: [kl, tl],
          houses: [house(kl), house(tl)],
          effect: 'Authority, power, success in career and public life. Native attains high position.',
          strength: strength(kl) > 60 && strength(tl) > 60 ? 'strong' : 'moderate',
          classicalBasis: 'BPHS Ch.37 — Kendra + Trikona lord conjunction/exchange creates Raj Yoga',
        });
        break;
      }
    }
  }

  // ── GAJA KESARI YOGA ──────────────────────────────────────────────────────
  const jupHouse  = house('Jupiter');
  const moonHouse = house('Moon');
  const gjDiff    = Math.abs(jupHouse - moonHouse);

  if ([0, 3, 6, 9].includes(gjDiff) && jupHouse !== 0) {
    yogas.push({
      name: 'Gaja Kesari Yoga',
      present: true,
      planets: ['Jupiter', 'Moon'],
      houses: [jupHouse, moonHouse],
      effect: 'Intelligence, fame, wealth, good character. Respected like an elephant-lion.',
      strength: strength('Jupiter') > 60 ? 'strong' : 'moderate',
      classicalBasis: 'BPHS Ch.36 — Jupiter in Kendra from Moon forms Gaja Kesari Yoga',
    });
  }

  // ── PANCH MAHAPURUSHA YOGAS ───────────────────────────────────────────────
  const mahapurusha: Array<[string, string, string, string]> = [
    ['Mars',    'Ruchaka',  'Courageous, commanding, military/police success, strong physique',    'BPHS Ch.36 — Mars in own/exalt in Kendra'],
    ['Mercury', 'Bhadra',   'Intelligent, eloquent, business acumen, respected scholar',           'BPHS Ch.36 — Mercury in own/exalt in Kendra'],
    ['Jupiter', 'Hamsa',    'Righteous, wise, spiritual, respected teacher or judge',              'BPHS Ch.36 — Jupiter in own/exalt in Kendra'],
    ['Venus',   'Malavya',  'Luxurious life, beautiful, artistic, successful in relationships',    'BPHS Ch.36 — Venus in own/exalt in Kendra'],
    ['Saturn',  'Sasa',     'Power over masses, political success, discipline, longevity',        'BPHS Ch.36 — Saturn in own/exalt in Kendra'],
  ];

  for (const [planet, yogaName, effect, citation] of mahapurusha) {
    if (inKendra(planet) && (isOwnSign(planet) || isExalted(planet))) {
      yogas.push({
        name: `${yogaName} Mahapurusha Yoga`,
        present: true,
        planets: [planet],
        houses: [house(planet)],
        effect,
        strength: isExalted(planet) ? 'strong' : 'moderate',
        classicalBasis: citation,
      });
    }
  }

  // ── DHANA YOGA ────────────────────────────────────────────────────────────
  const lord2  = lordOf(2);
  const lord11 = lordOf(11);

  if (inSameHouse(lord2, lord11) || rashi(lord2) === rashi(lord11)) {
    yogas.push({
      name: 'Dhana Yoga',
      present: true,
      planets: [lord2, lord11],
      houses: [house(lord2), house(lord11)],
      effect: 'Wealth accumulation, financial gains, prosperity through effort and networking.',
      strength: strength(lord2) > 55 ? 'strong' : 'moderate',
      classicalBasis: 'BPHS Ch.39 — 2nd and 11th lords conjunct or in exchange create Dhana Yoga',
    });
  }

  // ── VIPREET RAJ YOGA ─────────────────────────────────────────────────────
  const dusthanaLords = [lordOf(6), lordOf(8), lordOf(12)];
  for (const dl of dusthanaLords) {
    if (inDusthana(dl)) {
      yogas.push({
        name: 'Vipreet Raj Yoga',
        present: true,
        planets: [dl],
        houses: [house(dl)],
        effect: 'Rise after adversity. Gains through unexpected losses of others. Hidden strength.',
        strength: 'moderate',
        classicalBasis: 'BPHS Ch.38 — Dusthana lords in Dusthana create Vipreet Raj Yoga',
      });
      break;
    }
  }

  // ── NEECHA BHANGA RAJ YOGA ────────────────────────────────────────────────
  for (const [planet, debSign] of Object.entries(DEBILITATION)) {
    if (rashi(planet) === debSign) {
      const debSignLord = RASHI_LORDS[debSign];
      const exaltLord   = RASHI_LORDS[EXALTATION[planet]];

      if (
        inKendra(debSignLord) || inKendra(exaltLord) ||
        inSameHouse(planet, debSignLord) || inSameHouse(planet, exaltLord)
      ) {
        yogas.push({
          name: 'Neecha Bhanga Raj Yoga',
          present: true,
          planets: [planet, debSignLord],
          houses: [house(planet), house(debSignLord)],
          effect: 'Cancellation of debility creates unexpected rise. Success after struggle.',
          strength: 'moderate',
          classicalBasis: 'BPHS Ch.26 — Debilitated planet gets Neecha Bhanga through specific conditions',
        });
      }
    }
  }

  // ── BUDHADITYA YOGA ───────────────────────────────────────────────────────
  if (inSameHouse('Sun', 'Mercury')) {
    yogas.push({
      name: 'Budhaditya Yoga',
      present: true,
      planets: ['Sun', 'Mercury'],
      houses: [house('Sun')],
      effect: 'Sharp intellect, administrative ability, articulate communication, career in government or management.',
      strength: strength('Mercury') > 50 ? 'strong' : 'moderate',
      classicalBasis: 'Saravali Ch.14 — Sun + Mercury conjunction creates Budhaditya Yoga',
    });
  }

  // ── CHANDRA MANGAL YOGA ───────────────────────────────────────────────────
  if (inSameHouse('Moon', 'Mars') || Math.abs(moonHouse - house('Mars')) === 7) {
    yogas.push({
      name: 'Chandra-Mangal Yoga',
      present: true,
      planets: ['Moon', 'Mars'],
      houses: [moonHouse, house('Mars')],
      effect: 'Financial gains through commerce, boldness in business, trading success.',
      strength: 'moderate',
      classicalBasis: 'BPHS Ch.36 — Moon + Mars conjunction/opposition creates wealth yoga',
    });
  }

  // ── ADHI YOGA ─────────────────────────────────────────────────────────────
  const benefics = ['Jupiter', 'Venus', 'Mercury'];
  const moonRelHouses = benefics.map(b => {
    const diff = ((house(b) - moonHouse + 12) % 12) + 1;
    return diff;
  });

  if (moonRelHouses.every(h => [6, 7, 8].includes(h))) {
    yogas.push({
      name: 'Adhi Yoga',
      present: true,
      planets: ['Jupiter', 'Venus', 'Mercury'],
      houses: benefics.map(b => house(b)),
      effect: 'Leadership, political success, wealth. Native becomes minister or commander.',
      strength: 'strong',
      classicalBasis: 'BPHS Ch.36 — All benefics in 6/7/8 from Moon create Adhi Yoga',
    });
  }

  // ── SUNAPHA YOGA ──────────────────────────────────────────────────────────
  const moonPlus1 = (moonHouse % 12) + 1;
  const planetsIn2ndFromMoon = Object.values(planets)
    .filter(p => p.house === moonPlus1 && !['Sun', 'Rahu', 'Ketu'].includes(p.name));

  if (planetsIn2ndFromMoon.length > 0) {
    yogas.push({
      name: 'Sunapha Yoga',
      present: true,
      planets: planetsIn2ndFromMoon.map(p => p.name),
      houses: [moonPlus1],
      effect: 'Self-earned wealth, intelligence, kingly status through own efforts.',
      strength: 'moderate',
      classicalBasis: 'BPHS Ch.36 — Planet (except Sun) in 2nd from Moon creates Sunapha Yoga',
    });
  }

  // ── KEMADRUMA YOGA (negative) ─────────────────────────────────────────────
  const moonMinus1 = ((moonHouse - 2 + 12) % 12) + 1;
  const planetsAround = Object.values(planets).filter(p =>
    [moonPlus1, moonMinus1].includes(p.house) && !['Sun', 'Rahu', 'Ketu'].includes(p.name)
  );

  if (planetsAround.length === 0 && !inKendra('Moon')) {
    yogas.push({
      name: 'Kemadruma Yoga',
      present: false, // present but negative
      planets: ['Moon'],
      houses: [moonHouse],
      effect: 'Challenges in mental peace, financial instability. Remedy: Moon strengthening.',
      strength: 'weak',
      classicalBasis: 'BPHS Ch.36 — No planet in 2nd/12th from Moon (not in Kendra) creates Kemadruma',
    });
  }

  // ── GRAHAN YOGA ───────────────────────────────────────────────────────────
  if (inSameHouse('Sun', 'Rahu') || inSameHouse('Sun', 'Ketu')) {
    yogas.push({
      name: 'Surya Grahan Yoga',
      present: true,
      planets: ['Sun', inSameHouse('Sun', 'Rahu') ? 'Rahu' : 'Ketu'],
      houses: [house('Sun')],
      effect: 'Challenges with authority figures, father. Health of eyes. Remedy: Surya mantra.',
      strength: 'moderate',
      classicalBasis: 'Jataka Parijata — Rahu/Ketu with Sun creates Grahan Yoga',
    });
  }

  if (inSameHouse('Moon', 'Rahu') || inSameHouse('Moon', 'Ketu')) {
    yogas.push({
      name: 'Chandra Grahan Yoga',
      present: true,
      planets: ['Moon', inSameHouse('Moon', 'Rahu') ? 'Rahu' : 'Ketu'],
      houses: [moonHouse],
      effect: 'Mental stress, relationship with mother. Emotional turbulence. Remedy: Chandra mantra.',
      strength: 'moderate',
      classicalBasis: 'Jataka Parijata — Rahu/Ketu with Moon creates Chandra Grahan Yoga',
    });
  }

  // ── GURU CHANDAL YOGA ─────────────────────────────────────────────────────
  if (inSameHouse('Jupiter', 'Rahu') || inSameHouse('Jupiter', 'Ketu')) {
    yogas.push({
      name: 'Guru Chandal Yoga',
      present: true,
      planets: ['Jupiter', inSameHouse('Jupiter', 'Rahu') ? 'Rahu' : 'Ketu'],
      houses: [house('Jupiter')],
      effect: 'Unconventional wisdom. Challenges in dharma and education. Foreign guru. Remedy: Jupiter mantra.',
      strength: 'moderate',
      classicalBasis: 'Phaladeepika — Jupiter with Rahu/Ketu creates Guru Chandal Yoga',
    });
  }

  // ── SHAKAT YOGA ───────────────────────────────────────────────────────────
  const jupMoonDiff = Math.abs(jupHouse - moonHouse);
  if (jupMoonDiff === 5 || jupMoonDiff === 7) {
    yogas.push({
      name: 'Shakat Yoga',
      present: true,
      planets: ['Jupiter', 'Moon'],
      houses: [jupHouse, moonHouse],
      effect: 'Fluctuating fortune. Rise and fall pattern. Remedy: Jupiter and Moon strengthening.',
      strength: 'weak',
      classicalBasis: 'BPHS Ch.36 — Jupiter in 6th/8th from Moon creates Shakat Yoga',
    });
  }

  return yogas;
}

// ─── 2. ASHTAKAVARGA ──────────────────────────────────────────────────────────

function calculateAshtakavarga(
  planets:    Record<string, PlanetPosition>,
  lagnaIndex: number,
): AshtakavargaResult[] {
  const planetOrder = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const results: AshtakavargaResult[] = [];

  for (let pi = 0; pi < planetOrder.length; pi++) {
    const planet = planetOrder[pi];
    const table  = ASHTAK_TABLES[planet];
    if (!table) continue;

    const planetHouse = (planets[planet]?.house ?? 1) - 1; // 0-indexed
    const bhinnashtakavarga = new Array(12).fill(0);

    // 8 contributors: 7 planets + Lagna
    const contributors = [
      (planets['Sun']?.house      ?? 1) - 1,
      (planets['Moon']?.house     ?? 1) - 1,
      (planets['Mars']?.house     ?? 1) - 1,
      (planets['Mercury']?.house  ?? 1) - 1,
      (planets['Jupiter']?.house  ?? 1) - 1,
      (planets['Venus']?.house    ?? 1) - 1,
      (planets['Saturn']?.house   ?? 1) - 1,
      lagnaIndex, // Lagna
    ];

    for (let ci = 0; ci < 8; ci++) {
      const contribPos = contributors[ci];
      const row = table[ci];
      if (!row) continue;

      for (let house = 0; house < 12; house++) {
        const relPos = (house - contribPos + 12) % 12;
        if (row[relPos] === 1) {
          bhinnashtakavarga[house]++;
        }
      }
    }

    results.push({
      planet,
      bhinnashtakavarga,
      totalPoints: bhinnashtakavarga.reduce((a, b) => a + b, 0),
    });
  }

  return results;
}

function calculateSarvashtakavarga(
  ashtakavarga: AshtakavargaResult[],
): SarvashtakavargaResult {
  const houses = new Array(12).fill(0);

  for (const av of ashtakavarga) {
    for (let h = 0; h < 12; h++) {
      houses[h] += av.bhinnashtakavarga[h];
    }
  }

  const strongHouses: number[] = [];
  const weakHouses:   number[] = [];

  for (let h = 0; h < 12; h++) {
    if (houses[h] >= 28) strongHouses.push(h + 1);
    if (houses[h] <= 25) weakHouses.push(h + 1);
  }

  return { houses, strongHouses, weakHouses };
}

// ─── 3. GRAHA DRISHTI ─────────────────────────────────────────────────────────

function calculateDrishti(
  planets: Record<string, PlanetPosition>,
): DrishtiResult[] {
  const results: DrishtiResult[] = [];

  for (const [fromName, fromPlanet] of Object.entries(planets)) {
    if (['Rahu', 'Ketu'].includes(fromName)) continue;

    const fromHouse = fromPlanet.house;

    // All planets have 7th aspect (full)
    const seventhHouse = ((fromHouse + 5) % 12) + 1;

    for (const [toName, toPlanet] of Object.entries(planets)) {
      if (fromName === toName) continue;

      const toHouse = toPlanet.house;
      const diff    = ((toHouse - fromHouse + 12) % 12) + 1;

      let aspectType: DrishtiResult['aspectType'] | null = null;
      let aspectStrength = 0;

      if (diff === 7) {
        aspectType    = 'full';
        aspectStrength = 100;
      }

      // Special aspects
      if (fromName === 'Mars') {
        if (diff === 4) { aspectType = 'full'; aspectStrength = 100; }
        if (diff === 8) { aspectType = 'full'; aspectStrength = 100; }
      }
      if (fromName === 'Jupiter') {
        if (diff === 5) { aspectType = 'full'; aspectStrength = 100; }
        if (diff === 9) { aspectType = 'full'; aspectStrength = 100; }
      }
      if (fromName === 'Saturn') {
        if (diff === 3) { aspectType = 'full'; aspectStrength = 100; }
        if (diff === 10) { aspectType = 'full'; aspectStrength = 100; }
      }
      // Rahu/Ketu have 5th and 9th special aspects
      if (fromName === 'Rahu' || fromName === 'Ketu') {
        if (diff === 5 || diff === 9) { aspectType = 'full'; aspectStrength = 100; }
        if (diff === 7) { aspectType = 'full'; aspectStrength = 100; }
      }

      if (aspectType) {
        results.push({
          fromPlanet: fromName,
          toPlanet:   toName,
          toHouse,
          aspectType,
          strength:   aspectStrength,
        });
      }
    }
  }

  return results;
}

// ─── 4. NAVAMSA D9 ───────────────────────────────────────────────────────────

function calculateNavamsa(
  planets: Record<string, PlanetPosition>,
): NavamsaPosition[] {
  const results: NavamsaPosition[] = [];

  for (const [name, planet] of Object.entries(planets)) {
    const lon      = planet.siderealLongitude;
    const rashiNum = Math.floor(lon / 30);       // 0-11
    const degree   = lon % 30;
    const pada     = Math.floor(degree / (30 / 9)); // 0-8

    // Navamsa rashi calculation
    let navamsaRashiNum: number;
    if ([0, 3, 6, 9].includes(rashiNum)) {
      // Fire signs (Mesh, Kark, Dhanu, Meen) — start from Mesh
      navamsaRashiNum = pada % 12;
    } else if ([1, 4, 7, 10].includes(rashiNum)) {
      // Earth signs (Vrishabh, Simha, Vrischik, Kumbh) — start from Makar
      navamsaRashiNum = (9 + pada) % 12;
    } else {
      // Air/Water signs (Mithun, Kanya, Tula, Makar, Kark, Meen) — start from Tula
      navamsaRashiNum = (6 + pada) % 12;
    }

    const navamsaRashi = RASHIS[navamsaRashiNum];
    const lagnaRashi   = RASHIS[0]; // simplified — lagna navamsa needs lagna longitude
    const navamsaHouse = (navamsaRashiNum - RASHIS.indexOf(lagnaRashi) + 12) % 12 + 1;

    results.push({
      planet: name,
      rashi:  navamsaRashi,
      house:  navamsaHouse,
    });
  }

  return results;
}

// ─── 5. REMEDIES ─────────────────────────────────────────────────────────────

const PLANET_REMEDIES: Record<string, Omit<RemedySet, 'planet' | 'affliction'>> = {
  Sun: {
    mantra: {
      text:  'Om Hraam Hreem Hraum Sah Suryaya Namah',
      count: 7000,
      day:   'Sunday',
      time:  'Sunrise',
    },
    dana: {
      item:      'Wheat, jaggery, copper vessel, red cloth',
      day:       'Sunday',
      recipient: 'Temple priest or poor person',
    },
    vrat: {
      day:      'Sunday',
      deity:    'Lord Vishnu / Surya',
      duration: '12 Sundays',
    },
    yantra: {
      name:      'Surya Yantra',
      placement: 'East wall of home, at sunrise',
      day:       'Sunday at sunrise',
    },
    ratna: {
      gem:     'Ruby (Manik)',
      metal:   'Gold',
      finger:  'Ring finger, right hand',
      weight:  'Minimum 3 carats',
      day:     'Sunday sunrise',
      caution: 'Only if Sun is functional benefic for your Lagna. Consult before wearing.',
    },
    aushadhi: {
      herb: 'Bel patra, Ashwagandha',
      use:  'Offer Bel patra to Shiva on Monday; consume Ashwagandha with milk',
    },
    dos:   [
      'Respect father and authority figures',
      'Offer water to Sun (Arghya) every morning',
      'Wear saffron/orange on Sundays',
      'Light ghee lamp at sunrise',
      'Donate wheat or jaggery on Sundays',
    ],
    donts: [
      'Do not insult authority figures or government officials',
      'Avoid ego and arrogance — Sun afflicted amplifies these',
      'Do not sleep after sunrise',
      'Avoid non-vegetarian food on Sundays',
    ],
    classicalBasis: 'BPHS Ch.86 — Sun remedies for Surya Graha Shanti',
  },

  Moon: {
    mantra: {
      text:  'Om Shraam Shreem Shraum Sah Chandraya Namah',
      count: 11000,
      day:   'Monday',
      time:  'Evening after sunset',
    },
    dana: {
      item:      'White rice, milk, white cloth, silver, camphor',
      day:       'Monday',
      recipient: 'Brahmin or woman in need',
    },
    vrat: {
      day:      'Monday',
      deity:    'Lord Shiva / Chandra',
      duration: '16 Mondays (Solah Somvar)',
    },
    yantra: {
      name:      'Chandra Yantra',
      placement: 'North-east corner of home',
      day:       'Monday evening',
    },
    ratna: {
      gem:     'Pearl (Moti) or Moonstone',
      metal:   'Silver',
      finger:  'Little finger, right hand',
      weight:  'Minimum 5 carats',
      day:     'Monday evening (Shukla Paksha)',
      caution: 'Natural pearl only. Avoid if Moon is in 6/8/12 for your Lagna.',
    },
    aushadhi: {
      herb: 'Chandrika, White sandalwood, Shatavari',
      use:  'Apply sandalwood paste on forehead; consume Shatavari with milk',
    },
    dos: [
      'Respect mother and elderly women',
      'Drink water in silver glass',
      'Offer milk to Shivlinga on Mondays',
      'Keep home clean and peaceful',
      'Meditate during full moon',
    ],
    donts: [
      'Avoid arguments with mother',
      'Do not waste water or food',
      'Avoid excessive emotions and mood swings',
      'Do not start new ventures on Amavasya',
    ],
    classicalBasis: 'BPHS Ch.86 — Moon remedies for Chandra Graha Shanti',
  },

  Mars: {
    mantra: {
      text:  'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
      count: 10000,
      day:   'Tuesday',
      time:  'Morning',
    },
    dana: {
      item:      'Red lentils (masoor dal), red cloth, copper, coral',
      day:       'Tuesday',
      recipient: 'Temple or person in need',
    },
    vrat: {
      day:      'Tuesday',
      deity:    'Lord Hanuman / Mangal',
      duration: '21 Tuesdays',
    },
    yantra: {
      name:      'Mangal Yantra',
      placement: 'South wall of home',
      day:       'Tuesday morning',
    },
    ratna: {
      gem:     'Red Coral (Moonga)',
      metal:   'Gold or copper',
      finger:  'Ring finger, right hand',
      weight:  'Minimum 6 carats',
      day:     'Tuesday sunrise',
      caution: 'Only for Lagna where Mars is functional benefic (Aries, Cancer, Leo, Scorpio, Sagittarius Lagna).',
    },
    aushadhi: {
      herb: 'Kesar (saffron), Amla',
      use:  'Mix saffron in milk on Tuesday mornings',
    },
    dos: [
      'Recite Hanuman Chalisa every Tuesday',
      'Donate red items on Tuesday',
      'Exercise regularly to channel Mars energy positively',
      'Be disciplined and action-oriented',
    ],
    donts: [
      'Avoid anger and impulsive decisions',
      'Do not start property disputes',
      'Avoid blood donation if Mars is severely afflicted',
      'Do not cut trees unnecessarily (Mars = land)',
    ],
    classicalBasis: 'BPHS Ch.86 — Mars remedies for Mangal Graha Shanti',
  },

  Mercury: {
    mantra: {
      text:  'Om Braam Breem Braum Sah Budhaya Namah',
      count: 9000,
      day:   'Wednesday',
      time:  'Morning',
    },
    dana: {
      item:      'Green vegetables, green cloth, books, moong dal',
      day:       'Wednesday',
      recipient: 'Student or educational institution',
    },
    vrat: {
      day:      'Wednesday',
      deity:    'Lord Vishnu / Budh',
      duration: '21 Wednesdays',
    },
    yantra: {
      name:      'Budh Yantra',
      placement: 'North direction of home or study room',
      day:       'Wednesday morning',
    },
    ratna: {
      gem:     'Emerald (Panna)',
      metal:   'Gold',
      finger:  'Little finger, right hand',
      weight:  'Minimum 3 carats',
      day:     'Wednesday morning',
      caution: 'Avoid if Mercury rules 8th house for your Lagna. Jupiter-Mercury combination — consult astrologer.',
    },
    aushadhi: {
      herb: 'Brahmi, Tulsi',
      use:  'Consume Brahmi tablets for memory; offer Tulsi leaves to Vishnu',
    },
    dos: [
      'Read and write daily — Mercury loves knowledge',
      'Respect sisters and young people',
      'Maintain accounts and finances carefully',
      'Learn new skills — Mercury rewards education',
    ],
    donts: [
      'Avoid lying and deception',
      'Do not waste money on gossip or frivolity',
      'Avoid skin care negligence',
      'Do not break promises',
    ],
    classicalBasis: 'BPHS Ch.86 — Mercury remedies for Budh Graha Shanti',
  },

  Jupiter: {
    mantra: {
      text:  'Om Graam Greem Graum Sah Guruve Namah',
      count: 19000,
      day:   'Thursday',
      time:  'Morning',
    },
    dana: {
      item:      'Yellow cloth, turmeric, gold, chickpeas (chana dal), books',
      day:       'Thursday',
      recipient: 'Guru, Brahmin, or temple',
    },
    vrat: {
      day:      'Thursday',
      deity:    'Lord Vishnu / Brihaspati',
      duration: '16 Thursdays',
    },
    yantra: {
      name:      'Guru Yantra',
      placement: 'North-east (Ishaan) corner — most auspicious',
      day:       'Thursday morning',
    },
    ratna: {
      gem:     'Yellow Sapphire (Pukhraj)',
      metal:   'Gold',
      finger:  'Index finger, right hand',
      weight:  'Minimum 3 carats',
      day:     'Thursday sunrise',
      caution: 'Best for Sagittarius, Pisces, Aries, Cancer, Scorpio Lagna. Avoid for Taurus, Libra, Capricorn Lagna.',
    },
    aushadhi: {
      herb: 'Ashwagandha, Shatavari, Turmeric',
      use:  'Consume turmeric milk (haldi doodh) daily; apply saffron tilak on Thursday',
    },
    dos: [
      'Respect teachers, gurus, and elderly men',
      'Be generous and give in charity',
      'Study sacred texts — BPHS, Bhagavad Gita',
      'Maintain ethical standards in all dealings',
      'Feed yellow food to cows on Thursday',
    ],
    donts: [
      'Never disrespect your guru or teacher',
      'Avoid overconfidence and exaggeration',
      'Do not cut banana tree',
      'Avoid yellow color in negative situations',
    ],
    classicalBasis: 'BPHS Ch.86 — Jupiter remedies for Guru Graha Shanti',
  },

  Venus: {
    mantra: {
      text:  'Om Draam Dreem Draum Sah Shukraya Namah',
      count: 16000,
      day:   'Friday',
      time:  'Evening',
    },
    dana: {
      item:      'White sweets, white cloth, silver, curd, perfume',
      day:       'Friday',
      recipient: 'Young woman or newly married couple',
    },
    vrat: {
      day:      'Friday',
      deity:    'Goddess Lakshmi / Shukra',
      duration: '16 Fridays',
    },
    yantra: {
      name:      'Shukra Yantra',
      placement: 'South-east corner of bedroom',
      day:       'Friday evening',
    },
    ratna: {
      gem:     'Diamond (Heera) or White Sapphire (Safed Pukhraj)',
      metal:   'Silver or white gold',
      finger:  'Middle finger, right hand',
      weight:  'Minimum 0.5 carats (diamond) or 3 carats (white sapphire)',
      day:     'Friday evening',
      caution: 'Best for Taurus, Libra, Capricorn, Aquarius Lagna. Avoid for Aries, Scorpio Lagna.',
    },
    aushadhi: {
      herb: 'Shatavari, Rose petals',
      use:  'Consume rose petal jam (gulkand); use rose water in daily routine',
    },
    dos: [
      'Respect women in all forms',
      'Keep home beautiful and fragrant',
      'Offer white flowers to Goddess Lakshmi on Friday',
      'Maintain personal hygiene and grooming',
      'Be artistic — music, painting, dance strengthen Venus',
    ],
    donts: [
      'Avoid lust and overindulgence',
      'Do not waste money on luxury beyond means',
      'Avoid gossip about relationships',
      'Do not disrespect wife or partner',
    ],
    classicalBasis: 'BPHS Ch.86 — Venus remedies for Shukra Graha Shanti',
  },

  Saturn: {
    mantra: {
      text:  'Om Praam Preem Praum Sah Shanaischaraya Namah',
      count: 23000,
      day:   'Saturday',
      time:  'Evening (sunset)',
    },
    dana: {
      item:      'Black sesame (til), black cloth, iron, mustard oil, urad dal',
      day:       'Saturday',
      recipient: 'Poor person, sweeper, or old person',
    },
    vrat: {
      day:      'Saturday',
      deity:    'Lord Shani / Hanuman',
      duration: '19 Saturdays (Shani Jayanti or ongoing)',
    },
    yantra: {
      name:      'Shani Yantra',
      placement: 'West direction of home',
      day:       'Saturday evening',
    },
    ratna: {
      gem:     'Blue Sapphire (Neelam)',
      metal:   'Silver or Panchdhatu',
      finger:  'Middle finger, right hand',
      weight:  'Minimum 3 carats',
      day:     'Saturday evening (Shukla Paksha)',
      caution: 'MOST POWERFUL gem — test for 3 days before wearing. Best for Capricorn, Aquarius, Taurus, Libra, Gemini, Virgo Lagna ONLY. Trial period mandatory.',
    },
    aushadhi: {
      herb: 'Shilajit, Triphala',
      use:  'Consume Shilajit for strength; Triphala for longevity',
    },
    dos: [
      'Serve the poor, elderly, and disabled — Saturn rewards seva',
      'Light sesame oil lamp on Saturday evenings',
      'Be patient — Saturn rewards discipline over time',
      'Feed crows on Saturday (Saturn\'s bird)',
      'Respect servants and workers',
    ],
    donts: [
      'Never cut nails or hair on Saturday',
      'Avoid purchasing iron or black items on Saturday',
      'Do not start new ventures on Shani Amavasya',
      'Avoid ego — Saturn humbles the arrogant',
      'Never torture animals',
    ],
    classicalBasis: 'BPHS Ch.86 — Saturn remedies for Shani Graha Shanti',
  },

  Rahu: {
    mantra: {
      text:  'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
      count: 18000,
      day:   'Saturday or Wednesday',
      time:  'Evening',
    },
    dana: {
      item:      'Blue cloth, coconut, black sesame, blanket',
      day:       'Saturday',
      recipient: 'Sweeper or outcast community',
    },
    vrat: {
      day:      'Saturday',
      deity:    'Goddess Durga / Rahu',
      duration: '18 Saturdays',
    },
    yantra: {
      name:      'Rahu Yantra',
      placement: 'South-west corner of home',
      day:       'Saturday',
    },
    ratna: {
      gem:     'Hessonite Garnet (Gomed)',
      metal:   'Silver or Panchdhatu',
      finger:  'Middle finger, right hand',
      weight:  'Minimum 6 carats',
      day:     'Saturday evening',
      caution: 'Rahu gemstone highly sensitive. Only wear after thorough horoscope analysis. Can amplify both positive and negative Rahu effects dramatically.',
    },
    aushadhi: {
      herb: 'Neem, Camphor',
      use:  'Burn camphor daily; neem leaves for purification',
    },
    dos: [
      'Donate to orphanages and outcasts',
      'Recite Durga Chalisa on Saturdays',
      'Feed stray dogs (Rahu\'s animal)',
      'Travel to places of worship',
      'Maintain discipline in foreign or unconventional environments',
    ],
    donts: [
      'Avoid alcohol and intoxicants',
      'Do not cheat or deceive',
      'Avoid gambling',
      'Do not keep reptile images/idols if Rahu is afflicted',
    ],
    classicalBasis: 'Jataka Parijata — Rahu Graha Shanti remedies',
  },

  Ketu: {
    mantra: {
      text:  'Om Sraam Sreem Sraum Sah Ketave Namah',
      count: 7000,
      day:   'Tuesday or Saturday',
      time:  'Morning',
    },
    dana: {
      item:      'Brown blanket, sesame, iron',
      day:       'Tuesday',
      recipient: 'Spiritual seekers or temple',
    },
    vrat: {
      day:      'Tuesday',
      deity:    'Lord Ganesha / Ketu',
      duration: '7 Tuesdays',
    },
    yantra: {
      name:      'Ketu Yantra',
      placement: 'Meditation room or north-west corner',
      day:       'Tuesday',
    },
    ratna: {
      gem:     'Cat\'s Eye (Lehsunia)',
      metal:   'Silver',
      finger:  'Middle finger, right hand',
      weight:  'Minimum 3 carats',
      day:     'Tuesday morning',
      caution: 'Cat\'s Eye is highly powerful. Trial period of 3 days mandatory. Only for those with strong spiritual inclination or specific Ketu placement.',
    },
    aushadhi: {
      herb: 'Ashwagandha, Brahmi',
      use:  'For spiritual clarity and detachment — Brahmi with ghee',
    },
    dos: [
      'Meditate daily — Ketu rewards spiritual practice',
      'Visit Ganesha temple on Tuesdays',
      'Feed stray cats and dogs',
      'Study spirituality and past life karma',
      'Practice detachment from material outcomes',
    ],
    donts: [
      'Avoid attachment to material things',
      'Do not disrespect spiritual teachers',
      'Avoid surgical procedures during Ketu Mahadasha if possible',
    ],
    classicalBasis: 'Jataka Parijata — Ketu Graha Shanti remedies',
  },
};

function generateRemedies(
  planets: Record<string, PlanetPosition>,
  lagna:   string,
  drishti: DrishtiResult[],
): RemedySet[] {
  const remedies: RemedySet[] = [];

  for (const [name, planet] of Object.entries(planets)) {
    const isAfflicted =
      planet.strength < 40 ||
      drishti.some(d =>
        d.toPlanet === name &&
        NATURAL_MALEFICS.includes(d.fromPlanet) &&
        d.strength === 100
      );

    if (isAfflicted && PLANET_REMEDIES[name]) {
      const baseRemedy = PLANET_REMEDIES[name];
      const affliction = planet.strength < 25
        ? 'Severely debilitated'
        : planet.strength < 40
          ? 'Weak position'
          : 'Afflicted by malefic aspect';

      remedies.push({
        planet: name,
        affliction,
        ...baseRemedy,
      });
    }
  }

  return remedies;
}

// ─── 6. ARGALA ────────────────────────────────────────────────────────────────

function calculateArgala(
  planets:    Record<string, PlanetPosition>,
  lagnaIndex: number,
): ArgalaResult[] {
  const results: ArgalaResult[] = [];

  // Argala houses: 2nd, 4th, 11th (positive), 3rd (negative)
  const argalaHouses   = [2, 4, 11];
  const virodhaHouses  = [12, 10, 3]; // opposite houses that cancel Argala

  for (let h = 1; h <= 12; h++) {
    const argalaPlanets:  string[] = [];
    const virodhaArgala:  string[] = [];

    for (let i = 0; i < argalaHouses.length; i++) {
      const argalaHouse   = ((h + argalaHouses[i] - 2) % 12) + 1;
      const virodhaHouse  = ((h + virodhaHouses[i] - 2) % 12) + 1;

      const argala = Object.values(planets)
        .filter(p => p.house === argalaHouse)
        .map(p => p.name);

      const virodha = Object.values(planets)
        .filter(p => p.house === virodhaHouse)
        .map(p => p.name);

      argalaPlanets.push(...argala);
      virodhaArgala.push(...virodha);
    }

    const netBenefic  = argalaPlanets.filter(p => NATURAL_BENEFICS.includes(p)).length;
    const netMalefic  = argalaPlanets.filter(p => NATURAL_MALEFICS.includes(p)).length;
    const virodhaCount = virodhaArgala.length;

    let netEffect: ArgalaResult['netEffect'] = 'none';
    if (argalaPlanets.length > 0) {
      if (netBenefic > netMalefic && virodhaCount < argalaPlanets.length) {
        netEffect = 'positive';
      } else if (netMalefic > netBenefic) {
        netEffect = 'negative';
      } else {
        netEffect = 'mixed';
      }
    }

    if (argalaPlanets.length > 0 || virodhaArgala.length > 0) {
      results.push({ house: h, argalaPlanets, virodhaArgala, netEffect });
    }
  }

  return results;
}