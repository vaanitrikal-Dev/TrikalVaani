"""
================================================================
TRIKAL VAANI — Bhrigu Nandi Nadi Pattern Engine
CEO: Rohiit Gupta | Chief Vedic Architect
File: bhrigu.py
Version: 1.0 | Date: 2026-04-28
JAI MAA SHAKTI

PURPOSE:
    Bhrigu Nandi Nadi pattern-based prediction engine.
    Runs on Render alongside Swiss Ephemeris.
    
    Bhrigu System = Pattern Logic (The Micro - specific events)
    Parashari System = Rule Logic (The Macro - seasonal trends)
    
    6 Core Bhrigu Principles:
    1. Jupiter's house = current life theme
    2. Jupiter's sign lord = agent of current events  
    3. Planets in 2nd from Jupiter = what's coming next
    4. Planets aspecting Jupiter = forces shaping destiny
    5. Jupiter's Navamsa position = hidden karmic outcome
    6. Rahu-Jupiter axis = obsession + destiny intersection
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
    'Mesh': 'Mars', 'Vrishabh': 'Venus', 'Mithun': 'Mercury',
    'Kark': 'Moon', 'Simha': 'Sun', 'Kanya': 'Mercury',
    'Tula': 'Venus', 'Vrischik': 'Mars', 'Dhanu': 'Jupiter',
    'Makar': 'Saturn', 'Kumbh': 'Saturn', 'Meen': 'Jupiter'
}

NATURAL_BENEFICS = ['Jupiter', 'Venus', 'Mercury', 'Moon']
NATURAL_MALEFICS = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu']

# Bhrigu house themes (what Jupiter's position reveals)
JUPITER_HOUSE_THEMES = {
    1:  {'theme': 'Self-reinvention',     'life_area': 'Identity and personality shift',           'timing': 'immediate'},
    2:  {'theme': 'Wealth activation',    'life_area': 'Family finances and speech',               'timing': 'near-term'},
    3:  {'theme': 'Courage and action',   'life_area': 'Sibling matters and communication',        'timing': 'near-term'},
    4:  {'theme': 'Home and roots',       'life_area': 'Property, mother, peace of mind',          'timing': 'medium-term'},
    5:  {'theme': 'Creative destiny',     'life_area': 'Children, intelligence, Purva Punya',      'timing': 'medium-term'},
    6:  {'theme': 'Karma clearing',       'life_area': 'Debts, enemies, health challenges',        'timing': 'active-now'},
    7:  {'theme': 'Partnership karma',    'life_area': 'Marriage, business, karmic bonds',         'timing': 'active-now'},
    8:  {'theme': 'Transformation',       'life_area': 'Hidden assets, inheritance, sudden change','timing': 'immediate'},
    9:  {'theme': 'Divine grace',         'life_area': 'Father, fortune, guru, long travel',       'timing': 'peak-grace'},
    10: {'theme': 'Career peak',          'life_area': 'Authority, recognition, professional rise','timing': 'active-now'},
    11: {'theme': 'Desire fulfillment',   'life_area': 'Gains, network, elder sibling',            'timing': 'peak-gains'},
    12: {'theme': 'Liberation calling',   'life_area': 'Moksha, foreign, spiritual withdrawal',    'timing': 'long-term'},
}

# Bhrigu domain mapping — which houses matter for each domain
DOMAIN_HOUSE_MAP = {
    'genz_ex_back':          [7, 5, 12],
    'genz_toxic_boss':       [10, 6, 8],
    'genz_manifestation':    [5, 9, 1],
    'genz_dream_career':     [10, 1, 6],
    'mill_property_yog':     [4, 2, 11],
    'mill_karz_mukti':       [6, 2, 12],
    'mill_childs_destiny':   [5, 9, 1],
    'mill_parents_wellness': [4, 9, 8],
    'genx_retirement_peace': [12, 2, 8],
    'genx_legacy_inheritance':[8, 2, 4],
    'genx_spiritual_innings':[12, 9, 8],
}

# Bhrigu specific event signatures
# When Jupiter + specific planet combination → specific life event
BHRIGU_EVENT_SIGNATURES = {
    ('Jupiter', 'Saturn', 'aspect'): {
        'event': 'Major karmic restructuring — slow but permanent change',
        'domains': ['mill_karz_mukti', 'genx_retirement_peace', 'genx_legacy_inheritance'],
        'confidence_boost': 2,
    },
    ('Jupiter', 'Rahu', 'conjunct'): {
        'event': 'Sudden unexpected opportunity — unconventional path opens',
        'domains': ['genz_dream_career', 'mill_property_yog', 'genx_legacy_inheritance'],
        'confidence_boost': 3,
    },
    ('Jupiter', 'Venus', 'conjunct'): {
        'event': 'Relationship blessing — marriage or partnership karma resolves',
        'domains': ['genz_ex_back', 'mill_childs_destiny'],
        'confidence_boost': 3,
    },
    ('Jupiter', 'Mars', 'aspect'): {
        'event': 'Property or land acquisition — Bhoomi karaka activated',
        'domains': ['mill_property_yog', 'genx_legacy_inheritance'],
        'confidence_boost': 2,
    },
    ('Jupiter', 'Moon', 'conjunct'): {
        'event': 'Gaja Kesari activation — peak intelligence and fame window',
        'domains': ['genz_manifestation', 'genz_dream_career', 'mill_childs_destiny'],
        'confidence_boost': 3,
    },
    ('Jupiter', 'Mercury', 'conjunct'): {
        'event': 'Intellectual and business peak — communication-driven success',
        'domains': ['genz_dream_career', 'genz_toxic_boss'],
        'confidence_boost': 2,
    },
    ('Jupiter', 'Ketu', 'conjunct'): {
        'event': 'Spiritual turning point — detachment from material, moksha pull',
        'domains': ['genx_spiritual_innings', 'genx_retirement_peace'],
        'confidence_boost': 3,
    },
    ('Jupiter', 'Sun', 'conjunct'): {
        'event': 'Authority and recognition peak — govt or father-figure support',
        'domains': ['genz_dream_career', 'genz_toxic_boss', 'mill_parents_wellness'],
        'confidence_boost': 2,
    },
}


# ── DATA CLASSES ──────────────────────────────────────────────────────────────

@dataclass
class BhriguSignal:
    principle:        int           # 1-6 which Bhrigu principle triggered
    signal_type:      str           # 'current_theme' | 'future_event' | 'karmic_pattern'
    planet:           str
    house:            int
    description:      str           # plain language description
    domain_relevant:  bool          # is this relevant to the requested domain?
    confidence_points: int          # 1-3 points for confidence scoring
    timing:           str           # 'immediate' | 'near-term' | 'medium-term' | 'long-term'
    classical_basis:  str


@dataclass
class BhriguAnalysis:
    jupiter_house:        int
    jupiter_rashi:        str
    jupiter_lord:         str        # lord of Jupiter's sign
    current_life_theme:   str        # Jupiter's house theme
    signals:              list[BhriguSignal] = field(default_factory=list)
    domain_signals:       list[BhriguSignal] = field(default_factory=list)  # domain-specific only
    event_signatures:     list[dict] = field(default_factory=list)
    karmic_indicator:     bool = False      # True = show 🔱 badge
    karmic_description:   str = ''
    bhrigu_points:        int = 0           # for 6-2-2 scoring (max 2)
    summary:              str = ''


# ── MAIN FUNCTION ─────────────────────────────────────────────────────────────

def run_bhrigu_analysis(
    planets: dict,          # planet_name -> {house, rashi, degree, strength, retrograde}
    lagna: str,
    lagna_index: int,
    domain_id: str,
    dasha_quality: str,     # 'Shubh' | 'Madhyam' | 'Ashubh'
) -> BhriguAnalysis:
    """
    Main Bhrigu Nandi Nadi analysis engine.
    Jupiter is the PRIMARY trigger planet in Bhrigu system.
    """

    jupiter = planets.get('Jupiter', {})
    if not jupiter:
        return _empty_analysis()

    jup_house  = jupiter.get('house', 1)
    jup_rashi  = jupiter.get('rashi', 'Mesh')
    jup_degree = jupiter.get('degree', 0)
    jup_lord   = RASHI_LORDS.get(jup_rashi, 'Mars')

    analysis = BhriguAnalysis(
        jupiter_house=jup_house,
        jupiter_rashi=jup_rashi,
        jupiter_lord=jup_lord,
        current_life_theme=JUPITER_HOUSE_THEMES.get(jup_house, {}).get('theme', 'Unknown'),
    )

    domain_houses = DOMAIN_HOUSE_MAP.get(domain_id, [])

    # ── Principle 1: Jupiter's house = current life theme ────────────────────
    p1 = _principle_1_jupiter_house(jup_house, jup_rashi, domain_houses)
    if p1:
        analysis.signals.append(p1)

    # ── Principle 2: Jupiter's sign lord = agent of events ───────────────────
    p2 = _principle_2_jupiter_lord(jup_lord, planets, jup_house, domain_houses)
    if p2:
        analysis.signals.append(p2)

    # ── Principle 3: Planets in 2nd from Jupiter = what's coming ─────────────
    p3_signals = _principle_3_second_from_jupiter(jup_house, planets, domain_houses)
    analysis.signals.extend(p3_signals)

    # ── Principle 4: Planets aspecting Jupiter = destiny forces ──────────────
    p4_signals = _principle_4_jupiter_aspects(jup_house, planets, domain_houses)
    analysis.signals.extend(p4_signals)

    # ── Principle 5: Jupiter's Navamsa = hidden karmic outcome ───────────────
    p5 = _principle_5_navamsa(jup_degree, jup_rashi, domain_houses, jup_house)
    if p5:
        analysis.signals.append(p5)

    # ── Principle 6: Rahu-Jupiter axis = obsession + destiny ─────────────────
    p6 = _principle_6_rahu_jupiter(planets, jup_house, domain_houses, domain_id)
    if p6:
        analysis.signals.append(p6)
        analysis.karmic_indicator = True
        analysis.karmic_description = p6.description

    # ── Event signatures ─────────────────────────────────────────────────────
    analysis.event_signatures = _detect_event_signatures(
        planets, jup_house, domain_id
    )

    # ── Domain-specific signals ───────────────────────────────────────────────
    analysis.domain_signals = [s for s in analysis.signals if s.domain_relevant]

    # ── Bhrigu points for 6-2-2 scoring (max 2) ─────────────────────────────
    domain_points = sum(s.confidence_points for s in analysis.domain_signals)
    sig_points    = sum(s.get('confidence_boost', 0) for s in analysis.event_signatures)
    raw_points    = domain_points + sig_points

    # Dasha filter — if Ashubh dasha, reduce Bhrigu points
    if dasha_quality == 'Ashubh':
        raw_points = max(0, raw_points - 2)
    elif dasha_quality == 'Shubh':
        raw_points = raw_points + 1

    analysis.bhrigu_points = min(2, raw_points)  # cap at 2 for 6-2-2 model

    # ── Karmic indicator threshold ────────────────────────────────────────────
    if not analysis.karmic_indicator and raw_points >= 4:
        analysis.karmic_indicator = True
        if analysis.domain_signals:
            analysis.karmic_description = analysis.domain_signals[0].description

    # ── Summary ───────────────────────────────────────────────────────────────
    analysis.summary = _build_summary(analysis, domain_id, dasha_quality)

    return analysis


# ── PRINCIPLE IMPLEMENTATIONS ─────────────────────────────────────────────────

def _principle_1_jupiter_house(
    jup_house: int,
    jup_rashi: str,
    domain_houses: list[int],
) -> Optional[BhriguSignal]:
    """Principle 1: Jupiter's house = current life theme."""

    theme_data = JUPITER_HOUSE_THEMES.get(jup_house, {})
    if not theme_data:
        return None

    domain_relevant = jup_house in domain_houses

    return BhriguSignal(
        principle=1,
        signal_type='current_theme',
        planet='Jupiter',
        house=jup_house,
        description=(
            f"Jupiter in {jup_house}th house activates '{theme_data['theme']}' — "
            f"{theme_data['life_area']}. Timing: {theme_data['timing']}."
        ),
        domain_relevant=domain_relevant,
        confidence_points=2 if domain_relevant else 0,
        timing=theme_data.get('timing', 'medium-term'),
        classical_basis='Bhrigu Nandi Nadi — Jupiter house position reveals current life chapter',
    )


def _principle_2_jupiter_lord(
    jup_lord: str,
    planets: dict,
    jup_house: int,
    domain_houses: list[int],
) -> Optional[BhriguSignal]:
    """Principle 2: Lord of Jupiter's sign = agent driving current events."""

    lord_data = planets.get(jup_lord, {})
    if not lord_data:
        return None

    lord_house     = lord_data.get('house', 1)
    lord_strength  = lord_data.get('strength', 50)
    domain_relevant = lord_house in domain_houses

    strength_desc = (
        'strongly placed' if lord_strength >= 65 else
        'moderately placed' if lord_strength >= 45 else
        'weakly placed'
    )

    return BhriguSignal(
        principle=2,
        signal_type='current_theme',
        planet=jup_lord,
        house=lord_house,
        description=(
            f"{jup_lord} (agent of Jupiter's current chapter) is {strength_desc} "
            f"in house {lord_house} — this planet is the primary driver of "
            f"current life events."
        ),
        domain_relevant=domain_relevant,
        confidence_points=1 if domain_relevant else 0,
        timing='active-now',
        classical_basis='Bhrigu Nandi Nadi — Jupiter sign lord is the event agent',
    )


def _principle_3_second_from_jupiter(
    jup_house: int,
    planets: dict,
    domain_houses: list[int],
) -> list[BhriguSignal]:
    """Principle 3: Planets in 2nd house from Jupiter = future activators."""

    second_house = (jup_house % 12) + 1
    signals      = []

    for planet_name, planet_data in planets.items():
        if planet_name in ['Rahu', 'Ketu']:
            continue
        if planet_data.get('house') == second_house:
            domain_relevant = second_house in domain_houses
            is_benefic      = planet_name in NATURAL_BENEFICS

            signals.append(BhriguSignal(
                principle=3,
                signal_type='future_event',
                planet=planet_name,
                house=second_house,
                description=(
                    f"{planet_name} in 2nd from Jupiter (house {second_house}) — "
                    f"{'positive future activation: ' if is_benefic else 'challenging next chapter: '}"
                    f"this planet represents what's coming next in the native's journey."
                ),
                domain_relevant=domain_relevant,
                confidence_points=2 if (domain_relevant and is_benefic) else 1 if domain_relevant else 0,
                timing='near-term',
                classical_basis='Bhrigu Nandi Nadi — 2nd from Jupiter shows next life event',
            ))

    return signals


def _principle_4_jupiter_aspects(
    jup_house: int,
    planets: dict,
    domain_houses: list[int],
) -> list[BhriguSignal]:
    """Principle 4: Planets aspecting Jupiter = forces shaping destiny."""

    signals = []

    for planet_name, planet_data in planets.items():
        if planet_name == 'Jupiter':
            continue

        p_house = planet_data.get('house', 0)
        if not p_house:
            continue

        # Check if planet aspects Jupiter (7th aspect = all planets)
        aspects_jupiter = False
        diff = abs(p_house - jup_house)

        # 7th aspect
        if diff == 6 or diff == 6:
            aspects_jupiter = True

        # Special aspects
        if planet_name == 'Mars' and diff in [3, 7]:
            aspects_jupiter = True
        if planet_name == 'Saturn' and diff in [2, 9]:
            aspects_jupiter = True
        if planet_name in ['Rahu', 'Ketu'] and diff in [4, 8]:
            aspects_jupiter = True

        if aspects_jupiter:
            is_malefic      = planet_name in NATURAL_MALEFICS
            domain_relevant = p_house in domain_houses

            signals.append(BhriguSignal(
                principle=4,
                signal_type='karmic_pattern',
                planet=planet_name,
                house=p_house,
                description=(
                    f"{planet_name} aspects Jupiter from house {p_house} — "
                    f"{'creating challenge and karmic pressure on ' if is_malefic else 'blessing and supporting '}"
                    f"Jupiter's current life theme."
                ),
                domain_relevant=domain_relevant,
                confidence_points=1 if domain_relevant else 0,
                timing='active-now',
                classical_basis='Bhrigu Nandi Nadi — Planets aspecting Jupiter shape destiny course',
            ))

    return signals


def _principle_5_navamsa(
    jup_degree: float,
    jup_rashi: str,
    domain_houses: list[int],
    jup_house: int,
) -> Optional[BhriguSignal]:
    """Principle 5: Jupiter's Navamsa position = hidden karmic outcome."""

    rashi_index   = RASHIS.index(jup_rashi) if jup_rashi in RASHIS else 0
    degree_in_sign = jup_degree % 30
    pada          = int(degree_in_sign / (30 / 9))  # 0-8

    # Navamsa rashi calculation
    if rashi_index in [0, 3, 6, 9]:    # Fire signs — start from Mesh
        navamsa_rashi_index = pada % 12
    elif rashi_index in [1, 4, 7, 10]: # Earth signs — start from Makar
        navamsa_rashi_index = (9 + pada) % 12
    else:                               # Air/Water — start from Tula
        navamsa_rashi_index = (6 + pada) % 12

    navamsa_rashi = RASHIS[navamsa_rashi_index]
    is_vargottama = navamsa_rashi == jup_rashi

    domain_relevant = jup_house in domain_houses

    if is_vargottama:
        desc = (
            f"Jupiter is Vargottama (same Rashi {jup_rashi} in D1 and D9) — "
            f"EXTREMELY powerful karmic activation. "
            f"Results of Jupiter's current house theme are strongly guaranteed."
        )
        points = 3
    else:
        navamsa_lord = RASHI_LORDS.get(navamsa_rashi, 'Mars')
        desc = (
            f"Jupiter's Navamsa is in {navamsa_rashi} (lord: {navamsa_lord}) — "
            f"hidden karmic outcome is shaped by {navamsa_lord}'s significations."
        )
        points = 1

    return BhriguSignal(
        principle=5,
        signal_type='karmic_pattern',
        planet='Jupiter',
        house=jup_house,
        description=desc,
        domain_relevant=domain_relevant,
        confidence_points=points if domain_relevant else 0,
        timing='medium-term',
        classical_basis='Bhrigu Nandi Nadi — Jupiter Navamsa reveals hidden karmic destiny',
    )


def _principle_6_rahu_jupiter(
    planets: dict,
    jup_house: int,
    domain_houses: list[int],
    domain_id: str,
) -> Optional[BhriguSignal]:
    """Principle 6: Rahu-Jupiter axis = obsession + destiny intersection."""

    rahu = planets.get('Rahu', {})
    if not rahu:
        return None

    rahu_house = rahu.get('house', 0)
    if not rahu_house:
        return None

    # Check if Rahu-Jupiter are in same house or opposite houses
    same_house = rahu_house == jup_house
    opposite   = abs(rahu_house - jup_house) == 6

    if not (same_house or opposite):
        return None

    domain_relevant = (rahu_house in domain_houses or jup_house in domain_houses)

    if same_house:
        desc = (
            f"Rahu conjunct Jupiter in house {jup_house} — "
            f"KARMIC DESTINY MARKER: obsessive desire meets divine grace. "
            f"Sudden, unexpected, life-changing events in {JUPITER_HOUSE_THEMES.get(jup_house, {}).get('life_area', 'this area')}. "
            f"This is a past-life pattern completing itself."
        )
    else:
        ketu_house = rahu_house
        desc = (
            f"Rahu (house {rahu_house}) — Jupiter (house {jup_house}) axis active — "
            f"Karmic tension between material obsession and spiritual wisdom. "
            f"Resolution window opens when Dasha supports Jupiter's house."
        )

    return BhriguSignal(
        principle=6,
        signal_type='karmic_pattern',
        planet='Rahu',
        house=rahu_house,
        description=desc,
        domain_relevant=domain_relevant,
        confidence_points=3 if domain_relevant else 1,
        timing='immediate',
        classical_basis='Bhrigu Nandi Nadi — Rahu-Jupiter axis is the primary karmic destiny marker',
    )


def _detect_event_signatures(
    planets: dict,
    jup_house: int,
    domain_id: str,
) -> list[dict]:
    """Detect specific Bhrigu event signatures from planet combinations."""

    detected = []

    for (p1_name, p2_name, rel_type), signature in BHRIGU_EVENT_SIGNATURES.items():
        if p1_name != 'Jupiter':
            continue

        p2_data = planets.get(p2_name, {})
        if not p2_data:
            continue

        p2_house = p2_data.get('house', 0)

        # Check conjunction (same house)
        if rel_type == 'conjunct' and p2_house == jup_house:
            if domain_id in signature['domains']:
                detected.append({
                    'event':            signature['event'],
                    'planets':          [p1_name, p2_name],
                    'relation':         'conjunct',
                    'confidence_boost': signature['confidence_boost'],
                    'domain_match':     True,
                })

        # Check aspect (7th from each other primarily)
        elif rel_type == 'aspect':
            diff = abs(p2_house - jup_house)
            if diff == 6:  # 7th aspect
                if domain_id in signature['domains']:
                    detected.append({
                        'event':            signature['event'],
                        'planets':          [p1_name, p2_name],
                        'relation':         'aspect',
                        'confidence_boost': signature['confidence_boost'],
                        'domain_match':     True,
                    })

    return detected


def _build_summary(
    analysis: BhriguAnalysis,
    domain_id: str,
    dasha_quality: str,
) -> str:
    """Build a plain language Bhrigu summary."""

    parts = []

    theme_data = JUPITER_HOUSE_THEMES.get(analysis.jupiter_house, {})
    parts.append(
        f"Jupiter in house {analysis.jupiter_house} indicates "
        f"'{analysis.current_life_theme}' as the current life theme."
    )

    if analysis.domain_signals:
        parts.append(
            f"{len(analysis.domain_signals)} Bhrigu signal(s) directly relevant "
            f"to {domain_id} domain detected."
        )

    if analysis.karmic_indicator:
        parts.append(
            f"Karmic Indicator active — {analysis.karmic_description}"
        )

    if analysis.event_signatures:
        parts.append(
            f"Event signature detected: {analysis.event_signatures[0]['event']}"
        )

    dasha_note = (
        'Dasha supports Bhrigu signals — high confidence.' if dasha_quality == 'Shubh' else
        'Dasha is mixed — moderate confidence.' if dasha_quality == 'Madhyam' else
        'Dasha is challenging — Bhrigu signals delayed but not cancelled.'
    )
    parts.append(dasha_note)

    return ' '.join(parts)


def _empty_analysis() -> BhriguAnalysis:
    """Return empty analysis when Jupiter data unavailable."""
    return BhriguAnalysis(
        jupiter_house=0,
        jupiter_rashi='',
        jupiter_lord='',
        current_life_theme='Unavailable — Jupiter data missing',
        bhrigu_points=0,
        summary='Bhrigu analysis unavailable — Jupiter position not provided.',
    )


# ── SERIALIZER ────────────────────────────────────────────────────────────────

def bhrigu_to_dict(analysis: BhriguAnalysis) -> dict:
    """Convert BhriguAnalysis to JSON-serializable dict."""
    return {
        'jupiter_house':      analysis.jupiter_house,
        'jupiter_rashi':      analysis.jupiter_rashi,
        'jupiter_lord':       analysis.jupiter_lord,
        'current_life_theme': analysis.current_life_theme,
        'signals': [
            {
                'principle':         s.principle,
                'signal_type':       s.signal_type,
                'planet':            s.planet,
                'house':             s.house,
                'description':       s.description,
                'domain_relevant':   s.domain_relevant,
                'confidence_points': s.confidence_points,
                'timing':            s.timing,
                'classical_basis':   s.classical_basis,
            }
            for s in analysis.signals
        ],
        'domain_signals': [
            {
                'principle':         s.principle,
                'signal_type':       s.signal_type,
                'planet':            s.planet,
                'house':             s.house,
                'description':       s.description,
                'timing':            s.timing,
                'confidence_points': s.confidence_points,
                'classical_basis':   s.classical_basis,
            }
            for s in analysis.domain_signals
        ],
        'event_signatures':   analysis.event_signatures,
        'karmic_indicator':   analysis.karmic_indicator,
        'karmic_description': analysis.karmic_description,
        'bhrigu_points':      analysis.bhrigu_points,
        'summary':            analysis.summary,
    }