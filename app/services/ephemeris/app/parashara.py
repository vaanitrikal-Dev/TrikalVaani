"""
================================================================
TRIKAL VAANI — Parashari Classical Engine (Python)
CEO: Rohiit Gupta | Chief Vedic Architect
File: app/parashara.py
Version: 1.0 | Date: 2026-04-28
JAI MAA SHAKTI

Python translation of lib/parashara.ts
Runs on Render alongside Swiss Ephemeris.

COVERS:
  1. Yoga Detection (15+ Yogas)
  2. Ashtakavarga Calculation
  3. Graha Drishti Matrix
  4. Navamsa D9 Calculation
  5. Argala Calculation
  6. Summary (strong/weak planets, best/challenged houses)
================================================================
"""

from dataclasses import dataclass, field
from typing import Optional
import math


# ── CONSTANTS ─────────────────────────────────────────────────────────────────

RASHIS = [
    'Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya',
    'Tula', 'Vrischik', 'Dhanu', 'Makar', 'Kumbh', 'Meen'
]

RASHI_LORDS = {
    'Mesh': 'Mars',    'Vrishabh': 'Venus',   'Mithun': 'Mercury',
    'Kark': 'Moon',    'Simha': 'Sun',         'Kanya': 'Mercury',
    'Tula': 'Venus',   'Vrischik': 'Mars',     'Dhanu': 'Jupiter',
    'Makar': 'Saturn', 'Kumbh': 'Saturn',      'Meen': 'Jupiter'
}

EXALTATION = {
    'Sun': 'Mesh',    'Moon': 'Vrishabh', 'Mars': 'Makar',
    'Mercury': 'Kanya', 'Jupiter': 'Kark', 'Venus': 'Meen',
    'Saturn': 'Tula'
}

DEBILITATION = {
    'Sun': 'Tula',    'Moon': 'Vrischik', 'Mars': 'Kark',
    'Mercury': 'Meen', 'Jupiter': 'Makar', 'Venus': 'Kanya',
    'Saturn': 'Mesh'
}

OWN_SIGNS = {
    'Sun':     ['Simha'],
    'Moon':    ['Kark'],
    'Mars':    ['Mesh', 'Vrischik'],
    'Mercury': ['Mithun', 'Kanya'],
    'Jupiter': ['Dhanu', 'Meen'],
    'Venus':   ['Vrishabh', 'Tula'],
    'Saturn':  ['Makar', 'Kumbh'],
}

NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon']
NATURAL_MALEFICS  = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']

# Ashtakavarga tables (BPHS)
# 8 rows = 8 contributors (7 planets + Lagna)
# 12 cols = contribution at each relative house position
ASHTAK_TABLES = {
    'Sun': [
        [1,1,0,1,0,0,1,1,1,1,1,0],
        [0,0,1,0,1,1,0,0,0,0,0,1],
        [1,1,0,1,0,0,1,1,1,1,1,0],
        [0,1,1,0,1,1,0,0,1,0,1,1],
        [1,0,0,1,1,1,0,1,1,0,0,1],
        [0,0,1,0,0,0,1,1,0,1,1,1],
        [1,1,0,0,0,1,1,1,1,0,1,0],
        [1,1,0,1,0,0,1,1,1,1,1,0],
    ],
    'Moon': [
        [1,1,1,0,1,1,0,1,0,1,1,0],
        [1,1,0,0,1,1,0,0,1,1,1,0],
        [0,1,1,1,0,0,1,1,0,0,1,1],
        [1,0,1,1,0,0,1,1,1,1,0,1],
        [1,1,0,0,1,1,0,0,1,1,1,0],
        [0,0,1,1,0,0,1,1,1,0,1,1],
        [1,1,0,1,0,1,0,1,1,1,0,1],
        [1,1,1,0,1,1,0,1,0,1,1,0],
    ],
    'Mars': [
        [0,0,1,1,0,1,1,0,1,1,0,1],
        [0,0,1,1,0,0,1,1,1,0,0,1],
        [1,1,0,0,1,1,0,0,0,1,1,0],
        [0,1,1,0,1,0,1,1,0,0,1,1],
        [1,0,0,1,0,1,1,1,1,0,0,1],
        [0,1,1,0,0,1,1,0,0,1,1,1],
        [1,0,0,1,1,0,0,1,1,1,0,0],
        [0,0,1,1,0,1,1,0,1,1,0,1],
    ],
    'Mercury': [
        [1,1,0,1,1,1,0,1,1,0,1,0],
        [0,1,1,0,0,1,1,1,0,1,1,0],
        [1,0,1,1,0,0,1,1,1,0,0,1],
        [1,1,0,0,1,1,0,0,1,1,0,1],
        [0,1,1,1,0,1,1,0,0,1,1,0],
        [1,0,0,1,1,0,1,1,1,0,1,1],
        [0,1,1,0,1,0,0,1,1,1,0,1],
        [1,1,0,1,1,1,0,1,1,0,1,0],
    ],
    'Jupiter': [
        [1,1,1,0,1,1,0,0,1,1,0,1],
        [0,0,1,1,0,0,1,1,1,0,0,1],
        [1,1,0,0,1,1,1,0,0,1,1,0],
        [0,1,1,0,0,1,0,1,1,0,1,1],
        [1,0,0,1,1,0,1,1,0,1,0,1],
        [0,1,1,0,1,0,1,0,1,1,1,0],
        [1,0,1,1,0,1,0,1,1,0,0,1],
        [1,1,1,0,1,1,0,0,1,1,0,1],
    ],
    'Venus': [
        [0,1,1,1,0,1,1,0,0,1,1,0],
        [1,0,0,1,1,0,0,1,1,0,1,1],
        [0,1,1,0,1,1,0,1,0,1,0,1],
        [1,1,0,0,1,0,1,1,1,0,1,0],
        [0,0,1,1,0,1,1,0,1,1,0,1],
        [1,1,0,1,0,0,1,1,0,0,1,1],
        [0,0,1,0,1,1,1,0,1,0,1,1],
        [0,1,1,1,0,1,1,0,0,1,1,0],
    ],
    'Saturn': [
        [1,0,1,1,0,1,0,1,1,0,0,1],
        [0,1,0,1,1,0,1,1,0,1,1,0],
        [1,1,0,0,1,0,1,0,1,1,0,1],
        [0,0,1,1,0,1,1,0,0,1,1,1],
        [1,1,0,0,1,1,0,1,1,0,1,0],
        [0,1,1,1,0,0,1,1,1,0,0,1],
        [1,0,1,0,1,1,0,0,1,1,1,0],
        [1,0,1,1,0,1,0,1,1,0,0,1],
    ],
}


# ── DATA CLASSES ──────────────────────────────────────────────────────────────

@dataclass
class YogaResult:
    name:            str
    present:         bool
    planets:         list
    houses:          list
    effect:          str
    strength:        str  # 'strong' | 'moderate' | 'weak'
    classical_basis: str


@dataclass
class AshtakavargaResult:
    planet:               str
    bhinnashtakavarga:    list   # 12 scores
    total_points:         int


@dataclass
class SarvashtakavargaResult:
    houses:       list   # total score per house
    strong_houses: list  # score >= 28
    weak_houses:  list   # score <= 25


@dataclass
class DrishtiResult:
    from_planet: str
    to_planet:   str
    to_house:    int
    strength:    int  # 100


@dataclass
class NavamsaPosition:
    planet:  str
    rashi:   str
    house:   int


@dataclass
class ArgalaResult:
    house:          int
    argala_planets: list
    virodha_argala: list
    net_effect:     str  # 'positive' | 'negative' | 'mixed' | 'none'


@dataclass
class ParasharaResult:
    yogas:             list = field(default_factory=list)
    active_yogas:      list = field(default_factory=list)
    ashtakavarga:      list = field(default_factory=list)
    sarvashtakavarga:  object = None
    drishti:           list = field(default_factory=list)
    navamsa:           list = field(default_factory=list)
    argala:            list = field(default_factory=list)
    summary:           dict = field(default_factory=dict)


# ── MAIN FUNCTION ─────────────────────────────────────────────────────────────

def run_parashari_analysis(
    planets:     dict,
    lagna:       str,
    lagna_index: int,
) -> ParasharaResult:
    """Main Parashari analysis engine."""

    yogas          = _detect_yogas(planets, lagna, lagna_index)
    active_yogas   = [y for y in yogas if y.present]
    ashtakavarga   = _calculate_ashtakavarga(planets, lagna_index)
    sarva          = _calculate_sarvashtakavarga(ashtakavarga)
    drishti        = _calculate_drishti(planets)
    navamsa        = _calculate_navamsa(planets)
    argala         = _calculate_argala(planets, lagna_index)

    strong_planets = [
        name for name, p in planets.items()
        if p.get('strength', 0) >= 65
    ]
    weak_planets = [
        name for name, p in planets.items()
        if p.get('strength', 0) < 35 and name not in ['Rahu', 'Ketu']
    ]

    primary_yoga = None
    if active_yogas:
        def yoga_rank(y):
            return 3 if y.strength == 'strong' else 2 if y.strength == 'moderate' else 1
        primary_yoga = sorted(active_yogas, key=yoga_rank, reverse=True)[0].name

    strengths = [
        p.get('strength', 50) for name, p in planets.items()
        if name not in ['Rahu', 'Ketu']
    ]
    avg_strength = sum(strengths) / len(strengths) if strengths else 50
    overall = 'strong' if avg_strength >= 60 else 'moderate' if avg_strength >= 40 else 'weak'

    return ParasharaResult(
        yogas=yogas,
        active_yogas=active_yogas,
        ashtakavarga=ashtakavarga,
        sarvashtakavarga=sarva,
        drishti=drishti,
        navamsa=navamsa,
        argala=argala,
        summary={
            'strongPlanets':    strong_planets,
            'weakPlanets':      weak_planets,
            'bestHouses':       sarva.strong_houses,
            'challengedHouses': sarva.weak_houses,
            'primaryYoga':      primary_yoga,
            'overallStrength':  overall,
        },
    )


# ── YOGA DETECTION ────────────────────────────────────────────────────────────

def _detect_yogas(planets: dict, lagna: str, lagna_index: int) -> list:
    yogas = []

    def house(p):
        return planets.get(p, {}).get('house', 0)

    def rashi(p):
        return planets.get(p, {}).get('rashi', '')

    def strength(p):
        return planets.get(p, {}).get('strength', 50)

    def same_house(p1, p2):
        return house(p1) == house(p2) and house(p1) != 0

    def in_kendra(p):
        return house(p) in [1, 4, 7, 10]

    def in_dusthana(p):
        return house(p) in [6, 8, 12]

    def is_exalted(p):
        return EXALTATION.get(p) == rashi(p)

    def is_debilitated(p):
        return DEBILITATION.get(p) == rashi(p)

    def is_own_sign(p):
        return rashi(p) in OWN_SIGNS.get(p, [])

    def lord_of(h):
        idx = (lagna_index + h - 1) % 12
        return RASHI_LORDS.get(RASHIS[idx], '')

    # ── Raj Yoga ──────────────────────────────────────────────────────────────
    kendra_lords  = [lord_of(h) for h in [1, 4, 7, 10]]
    trikona_lords = [lord_of(h) for h in [1, 5, 9]]

    for kl in kendra_lords:
        for tl in trikona_lords:
            if kl == tl:
                continue
            if same_house(kl, tl) or (rashi(kl) == rashi(tl) and rashi(kl)):
                yogas.append(YogaResult(
                    name='Raj Yoga',
                    present=True,
                    planets=[kl, tl],
                    houses=[house(kl), house(tl)],
                    effect='Authority, power, success in career and public life.',
                    strength='strong' if strength(kl) > 60 and strength(tl) > 60 else 'moderate',
                    classical_basis='BPHS Ch.37 — Kendra + Trikona lord conjunction',
                ))
                break

    # ── Gaja Kesari ───────────────────────────────────────────────────────────
    jup_h  = house('Jupiter')
    moon_h = house('Moon')
    if jup_h and moon_h:
        diff = abs(jup_h - moon_h)
        if diff in [0, 3, 6, 9]:
            yogas.append(YogaResult(
                name='Gaja Kesari Yoga',
                present=True,
                planets=['Jupiter', 'Moon'],
                houses=[jup_h, moon_h],
                effect='Intelligence, fame, wealth, good character.',
                strength='strong' if strength('Jupiter') > 60 else 'moderate',
                classical_basis='BPHS Ch.36 — Jupiter in Kendra from Moon',
            ))

    # ── Panch Mahapurusha ─────────────────────────────────────────────────────
    for planet, yoga_name, effect, citation in [
        ('Mars',    'Ruchaka',  'Courageous, commanding, military success.',      'BPHS Ch.36 — Mars in own/exalt in Kendra'),
        ('Mercury', 'Bhadra',   'Intelligent, eloquent, business acumen.',        'BPHS Ch.36 — Mercury in own/exalt in Kendra'),
        ('Jupiter', 'Hamsa',    'Righteous, wise, spiritual, respected teacher.', 'BPHS Ch.36 — Jupiter in own/exalt in Kendra'),
        ('Venus',   'Malavya',  'Luxurious life, artistic, relationship success.','BPHS Ch.36 — Venus in own/exalt in Kendra'),
        ('Saturn',  'Sasa',     'Power over masses, political success.',          'BPHS Ch.36 — Saturn in own/exalt in Kendra'),
    ]:
        if in_kendra(planet) and (is_own_sign(planet) or is_exalted(planet)):
            yogas.append(YogaResult(
                name=f'{yoga_name} Mahapurusha Yoga',
                present=True,
                planets=[planet],
                houses=[house(planet)],
                effect=effect,
                strength='strong' if is_exalted(planet) else 'moderate',
                classical_basis=citation,
            ))

    # ── Dhana Yoga ────────────────────────────────────────────────────────────
    l2  = lord_of(2)
    l11 = lord_of(11)
    if l2 and l11 and l2 != l11:
        if same_house(l2, l11) or (rashi(l2) == rashi(l11) and rashi(l2)):
            yogas.append(YogaResult(
                name='Dhana Yoga',
                present=True,
                planets=[l2, l11],
                houses=[house(l2), house(l11)],
                effect='Wealth accumulation, financial gains, prosperity.',
                strength='strong' if strength(l2) > 55 else 'moderate',
                classical_basis='BPHS Ch.39 — 2nd and 11th lords combined',
            ))

    # ── Vipreet Raj Yoga ──────────────────────────────────────────────────────
    for h in [6, 8, 12]:
        dl = lord_of(h)
        if dl and in_dusthana(dl):
            yogas.append(YogaResult(
                name='Vipreet Raj Yoga',
                present=True,
                planets=[dl],
                houses=[house(dl)],
                effect='Rise after adversity. Gains through unexpected situations.',
                strength='moderate',
                classical_basis='BPHS Ch.38 — Dusthana lords in Dusthana',
            ))
            break

    # ── Neecha Bhanga Raj Yoga ────────────────────────────────────────────────
    for planet, deb_sign in DEBILITATION.items():
        if rashi(planet) == deb_sign:
            deb_lord   = RASHI_LORDS.get(deb_sign, '')
            exalt_lord = RASHI_LORDS.get(EXALTATION.get(planet, ''), '')
            if in_kendra(deb_lord) or in_kendra(exalt_lord):
                yogas.append(YogaResult(
                    name='Neecha Bhanga Raj Yoga',
                    present=True,
                    planets=[planet, deb_lord],
                    houses=[house(planet), house(deb_lord)],
                    effect='Cancellation of debility — unexpected rise after struggle.',
                    strength='moderate',
                    classical_basis='BPHS Ch.26 — Debilitated planet gets Neecha Bhanga',
                ))

    # ── Budhaditya Yoga ───────────────────────────────────────────────────────
    if same_house('Sun', 'Mercury'):
        yogas.append(YogaResult(
            name='Budhaditya Yoga',
            present=True,
            planets=['Sun', 'Mercury'],
            houses=[house('Sun')],
            effect='Sharp intellect, administrative ability, career in govt or management.',
            strength='strong' if strength('Mercury') > 50 else 'moderate',
            classical_basis='Saravali Ch.14 — Sun + Mercury conjunction',
        ))

    # ── Chandra Mangal Yoga ───────────────────────────────────────────────────
    if moon_h and house('Mars'):
        diff = abs(moon_h - house('Mars'))
        if diff == 0 or diff == 6:
            yogas.append(YogaResult(
                name='Chandra-Mangal Yoga',
                present=True,
                planets=['Moon', 'Mars'],
                houses=[moon_h, house('Mars')],
                effect='Financial gains through commerce, boldness in business.',
                strength='moderate',
                classical_basis='BPHS Ch.36 — Moon + Mars conjunction/opposition',
            ))

    # ── Guru Chandal Yoga ─────────────────────────────────────────────────────
    for node in ['Rahu', 'Ketu']:
        if same_house('Jupiter', node):
            yogas.append(YogaResult(
                name='Guru Chandal Yoga',
                present=True,
                planets=['Jupiter', node],
                houses=[jup_h],
                effect='Unconventional wisdom. Challenges in dharma. Foreign guru.',
                strength='moderate',
                classical_basis='Phaladeepika — Jupiter with Rahu/Ketu',
            ))

    # ── Grahan Yoga ───────────────────────────────────────────────────────────
    for luminary in ['Sun', 'Moon']:
        for node in ['Rahu', 'Ketu']:
            if same_house(luminary, node):
                yogas.append(YogaResult(
                    name=f'{"Surya" if luminary == "Sun" else "Chandra"} Grahan Yoga',
                    present=True,
                    planets=[luminary, node],
                    houses=[house(luminary)],
                    effect=f'Challenges with {"authority/father" if luminary == "Sun" else "mother/mind"}. Remedy needed.',
                    strength='moderate',
                    classical_basis='Jataka Parijata — Rahu/Ketu with Sun/Moon',
                ))

    return yogas


# ── ASHTAKAVARGA ──────────────────────────────────────────────────────────────

def _calculate_ashtakavarga(planets: dict, lagna_index: int) -> list:
    planet_order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
    results      = []

    for planet in planet_order:
        table = ASHTAK_TABLES.get(planet)
        if not table:
            continue

        planet_house = (planets.get(planet, {}).get('house', 1)) - 1
        scores       = [0] * 12

        contributors = [
            (planets.get('Sun',     {}).get('house', 1)) - 1,
            (planets.get('Moon',    {}).get('house', 1)) - 1,
            (planets.get('Mars',    {}).get('house', 1)) - 1,
            (planets.get('Mercury', {}).get('house', 1)) - 1,
            (planets.get('Jupiter', {}).get('house', 1)) - 1,
            (planets.get('Venus',   {}).get('house', 1)) - 1,
            (planets.get('Saturn',  {}).get('house', 1)) - 1,
            lagna_index,
        ]

        for ci, contrib_pos in enumerate(contributors):
            row = table[ci] if ci < len(table) else []
            for h in range(12):
                rel_pos = (h - contrib_pos + 12) % 12
                if rel_pos < len(row) and row[rel_pos] == 1:
                    scores[h] += 1

        results.append(AshtakavargaResult(
            planet=planet,
            bhinnashtakavarga=scores,
            total_points=sum(scores),
        ))

    return results


def _calculate_sarvashtakavarga(ashtakavarga: list) -> SarvashtakavargaResult:
    houses = [0] * 12
    for av in ashtakavarga:
        for h in range(12):
            houses[h] += av.bhinnashtakavarga[h]

    strong = [h + 1 for h in range(12) if houses[h] >= 28]
    weak   = [h + 1 for h in range(12) if houses[h] <= 25]

    return SarvashtakavargaResult(
        houses=houses,
        strong_houses=strong,
        weak_houses=weak,
    )


# ── GRAHA DRISHTI ─────────────────────────────────────────────────────────────

def _calculate_drishti(planets: dict) -> list:
    results = []

    for from_name, from_planet in planets.items():
        if from_name in ['Rahu', 'Ketu']:
            continue

        from_house = from_planet.get('house', 0)
        if not from_house:
            continue

        for to_name, to_planet in planets.items():
            if from_name == to_name:
                continue

            to_house = to_planet.get('house', 0)
            if not to_house:
                continue

            diff = ((to_house - from_house + 12) % 12) + 1

            is_aspect = False

            # 7th aspect — all planets
            if diff == 7:
                is_aspect = True

            # Special aspects
            if from_name == 'Mars'    and diff in [4, 8]:
                is_aspect = True
            if from_name == 'Jupiter' and diff in [5, 9]:
                is_aspect = True
            if from_name == 'Saturn'  and diff in [3, 10]:
                is_aspect = True
            if from_name in ['Rahu', 'Ketu'] and diff in [5, 9]:
                is_aspect = True

            if is_aspect:
                results.append(DrishtiResult(
                    from_planet=from_name,
                    to_planet=to_name,
                    to_house=to_house,
                    strength=100,
                ))

    return results


# ── NAVAMSA D9 ────────────────────────────────────────────────────────────────

def _calculate_navamsa(planets: dict) -> list:
    results = []

    for name, planet in planets.items():
        lon        = planet.get('siderealLongitude', 0)
        rashi_num  = int(lon / 30) % 12
        degree     = lon % 30
        pada       = int(degree / (30 / 9))

        # Navamsa rashi
        if rashi_num in [0, 3, 6, 9]:    # Fire — start from Mesh
            nav_index = pada % 12
        elif rashi_num in [1, 4, 7, 10]: # Earth — start from Makar
            nav_index = (9 + pada) % 12
        else:                             # Air/Water — start from Tula
            nav_index = (6 + pada) % 12

        nav_rashi = RASHIS[nav_index]

        results.append(NavamsaPosition(
            planet=name,
            rashi=nav_rashi,
            house=nav_index + 1,
        ))

    return results


# ── ARGALA ────────────────────────────────────────────────────────────────────

def _calculate_argala(planets: dict, lagna_index: int) -> list:
    results        = []
    argala_offsets = [2, 4, 11]
    virodha_offsets = [12, 10, 3]

    for h in range(1, 13):
        argala_planets  = []
        virodha_planets = []

        for i in range(len(argala_offsets)):
            a_house = ((h + argala_offsets[i] - 2) % 12) + 1
            v_house = ((h + virodha_offsets[i] - 2) % 12) + 1

            for pname, pdata in planets.items():
                if pdata.get('house') == a_house:
                    argala_planets.append(pname)
                if pdata.get('house') == v_house:
                    virodha_planets.append(pname)

        if argala_planets or virodha_planets:
            benefic_count  = sum(1 for p in argala_planets if p in NATURAL_BENEFICS)
            malefic_count  = sum(1 for p in argala_planets if p in NATURAL_MALEFICS)
            virodha_count  = len(virodha_planets)

            if not argala_planets:
                net = 'none'
            elif benefic_count > malefic_count and virodha_count < len(argala_planets):
                net = 'positive'
            elif malefic_count > benefic_count:
                net = 'negative'
            else:
                net = 'mixed'

            if net != 'none':
                results.append(ArgalaResult(
                    house=h,
                    argala_planets=argala_planets,
                    virodha_argala=virodha_planets,
                    net_effect=net,
                ))

    return results


# ── SERIALIZER ────────────────────────────────────────────────────────────────

def parashari_to_dict(result: ParasharaResult) -> dict:
    """Convert ParasharaResult to JSON-serializable dict."""
    sarva = result.sarvashtakavarga

    return {
        'activeYogas': [
            {
                'name':           y.name,
                'present':        y.present,
                'planets':        y.planets,
                'houses':         y.houses,
                'effect':         y.effect,
                'strength':       y.strength,
                'classicalBasis': y.classical_basis,
            }
            for y in result.active_yogas
        ],
        'totalActiveYogas': len(result.active_yogas),
        'ashtakavarga': [
            {
                'planet':      av.planet,
                'houseScores': av.bhinnashtakavarga,
                'totalPoints': av.total_points,
            }
            for av in result.ashtakavarga
        ],
        'sarvashtakavarga': {
            'houseScores':  sarva.houses        if sarva else [0]*12,
            'strongHouses': sarva.strong_houses if sarva else [],
            'weakHouses':   sarva.weak_houses   if sarva else [],
        },
        'drishti': [
            {
                'from':     d.from_planet,
                'to':       d.to_planet,
                'toHouse':  d.to_house,
                'strength': d.strength,
            }
            for d in result.drishti
        ],
        'navamsa': [
            {
                'planet':  n.planet,
                'd9Rashi': n.rashi,
                'd9House': n.house,
            }
            for n in result.navamsa
        ],
        'argala': [
            {
                'house':         a.house,
                'argalaPlanets': a.argala_planets,
                'netEffect':     a.net_effect,
            }
            for a in result.argala
            if a.net_effect != 'none'
        ],
        'summary': result.summary,
    }
