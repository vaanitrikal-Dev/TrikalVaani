"""
================================================================
TRIKAL VAANI — Confidence Scoring Engine (6-2-2 Model)
CEO: Rohiit Gupta | Chief Vedic Architect
File: confidence.py
Version: 2.0 | RECALIBRATED — Base 50, Range 40-100
JAI MAA SHAKTI

KEY CHANGE IN v2.0:
    Score range is now 40-100 (never below 40).
    
    WHY: A chart is always assessable. The question is timing,
    not whether the chart is valid. Even a challenging Dasha
    means the chart foundation is strong — just wait for better
    timing. Clients should never see a score below 40.
    
    NEW LABELS:
    85-100 → "Strong Alignment ✓"       (both systems + good dasha)
    70-84  → "Planetary Support Active"  (one system strong + ok dasha)
    55-69  → "Preparation Phase"         (foundation present, timing mixed)
    40-54  → "Patience Required"         (timing challenging, remedies focus)

    The 6-2-2 Model remains unchanged — only normalization adjusted.
================================================================
"""

from dataclasses import dataclass, field
from typing import Optional


# ── DATA CLASSES ──────────────────────────────────────────────────────────────

@dataclass
class ParasharaSignals:
    strong_planet_count:   int  = 0
    weak_planet_count:     int  = 0
    active_yoga_count:     int  = 0
    primary_yoga:          str  = ''
    domain_house_score:    int  = 0
    lagna_lord_strong:     bool = False
    dasha_lord_benefic:    bool = False
    domain_planet_strong:  bool = False
    overall_strength:      str  = 'moderate'


@dataclass
class BhriguSignals:
    bhrigu_points:       int  = 0
    karmic_indicator:    bool = False
    domain_signal_count: int  = 0
    event_signature:     bool = False


@dataclass
class DashaSignals:
    mahadasha_lord:     str  = ''
    antardasha_lord:    str  = ''
    pratyantar_lord:    str  = ''
    pratyantar_quality: str  = 'Madhyam'
    antardasha_quality: str  = 'Madhyam'
    domain_relevant:    bool = False


@dataclass
class ConfidenceResult:
    score:              float
    label:              str
    badge:              str
    flag:               str
    karmic_marker:      bool
    karmic_text:        str
    parashari_points:   float = 0
    bhrigu_points:      float = 0
    dasha_multiplier:   float = 1.0
    conflict_detected:  bool  = False
    conflict_resolution: str  = ''
    tie_breaker:        str   = ''
    confidence_reason:  str   = ''
    action_guidance:    str   = ''


# ── CONSTANTS ─────────────────────────────────────────────────────────────────

NATURAL_BENEFICS = {'Jupiter', 'Venus', 'Mercury', 'Moon'}
NATURAL_MALEFICS = {'Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'}

# v2.0 calibrated thresholds
LABEL_STRONG      = 85
LABEL_MODERATE    = 70
LABEL_PREPARATION = 55
# Below 55 = Patience Required (minimum 40)

LABELS = {
    'strong':      'Strong Alignment ✓',
    'moderate':    'Planetary Support Active',
    'preparation': 'Preparation Phase',
    'patience':    'Patience Required',
}

BADGES = {
    'strong':      'High Confidence',
    'moderate':    'Moderate Confidence',
    'preparation': 'Timing Sensitive',
    'patience':    'Remedies Advised',
}

# Minimum score — chart is ALWAYS assessable
MINIMUM_SCORE = 40


# ── MAIN SCORING ──────────────────────────────────────────────────────────────

def calculate_confidence(
    parashari:  ParasharaSignals,
    bhrigu:     BhriguSignals,
    dasha:      DashaSignals,
    domain_id:  str,
    karmic_description: str = '',
) -> ConfidenceResult:
    """
    6-2-2 Ensemble — v2.0 calibrated.
    Score always between 40-100.
    Base score = 50 (chart is always valid and assessable).
    """

    raw_score       = 0.0
    parashari_pts   = 0.0
    bhrigu_pts_calc = 0.0
    common_pts      = 0.0
    conflict        = False
    conflict_res    = ''
    tie_breaker     = ''

    # ── Conflict detection ────────────────────────────────────────────────────
    parashari_strong = parashari.overall_strength == 'strong'
    bhrigu_strong    = bhrigu.bhrigu_points >= 1

    if parashari_strong and not bhrigu_strong:
        conflict     = True
        conflict_res = 'Parashari strong but Bhrigu pattern absent'
        tie_breaker  = _resolve_conflict(dasha, 'parashari')
    elif bhrigu_strong and not parashari_strong:
        conflict     = True
        conflict_res = 'Bhrigu pattern present but Parashari weak'
        tie_breaker  = _resolve_conflict(dasha, 'bhrigu')

    # ── Common ground (max 6 pts) ─────────────────────────────────────────────
    yoga_common = min(parashari.active_yoga_count, 2) * 3
    common_pts += yoga_common

    if parashari.domain_planet_strong and bhrigu.bhrigu_points >= 1:
        common_pts += 3

    if parashari.domain_house_score >= 5 and bhrigu.domain_signal_count >= 1:
        common_pts += 3

    common_pts = min(common_pts, 6)

    # ── Parashari only (max 7 pts) ────────────────────────────────────────────
    if parashari.lagna_lord_strong:
        parashari_pts += 2
    if parashari.domain_house_score >= 5:
        parashari_pts += 3
    elif parashari.domain_house_score >= 4:
        parashari_pts += 1
    if parashari.domain_planet_strong:
        parashari_pts += 2
    parashari_pts = min(parashari_pts, 10)

    # ── Bhrigu only (max 8 pts) ───────────────────────────────────────────────
    bhrigu_pts_calc += bhrigu.bhrigu_points * 3
    if bhrigu.event_signature:
        bhrigu_pts_calc += 3
    if bhrigu.karmic_indicator:
        bhrigu_pts_calc += 2
    bhrigu_pts_calc = min(bhrigu_pts_calc, 10)

    # ── Raw total ─────────────────────────────────────────────────────────────
    raw_score = common_pts + parashari_pts + bhrigu_pts_calc

    # ── Dasha multiplier (NON-NEGOTIABLE) ─────────────────────────────────────
    dasha_mult = _get_dasha_multiplier(dasha)

    if dasha.pratyantar_quality == 'Ashubh' and parashari_strong:
        conflict     = True
        conflict_res = 'Parashari shows strength but Dasha timing is challenging'
        tie_breaker  = 'Dasha advises patience — prepare now, act after Pratyantar changes'

    final_score = raw_score * dasha_mult

    # ── Normalize to 40-100 ───────────────────────────────────────────────────
    # Max raw ≈ 26, max with 1.5 multiplier ≈ 39
    # Map: 0 → 40, 39 → 100
    # Formula: 40 + (final_score / 39) * 60
    normalized = 40 + (final_score / 39) * 60
    normalized = min(100, max(MINIMUM_SCORE, normalized))

    # Override: Ashubh Dasha → cap at 68 (never "Strong" during bad timing)
    if dasha.pratyantar_quality == 'Ashubh':
        normalized = min(normalized, 68)

    normalized = round(normalized, 1)

    # ── Label assignment ──────────────────────────────────────────────────────
    if normalized >= LABEL_STRONG:
        level = 'strong'
    elif normalized >= LABEL_MODERATE:
        level = 'moderate'
    elif normalized >= LABEL_PREPARATION:
        level = 'preparation'
    else:
        level = 'patience'

    # ── Karmic marker ─────────────────────────────────────────────────────────
    show_karmic = (
        bhrigu.karmic_indicator and
        bhrigu.bhrigu_points >= 1 and
        dasha.pratyantar_quality != 'Ashubh' and
        normalized >= 60
    )

    confidence_reason = _build_confidence_reason(level, parashari, bhrigu, dasha, conflict, tie_breaker)
    action_guidance   = _build_action_guidance(level, dasha, conflict)

    return ConfidenceResult(
        score=normalized,
        label=LABELS[level],
        badge=BADGES[level],
        flag='agreement' if not conflict else 'partial' if normalized >= 60 else 'conflict',
        karmic_marker=show_karmic,
        karmic_text=karmic_description if show_karmic else '',
        parashari_points=round(parashari_pts, 1),
        bhrigu_points=round(bhrigu_pts_calc, 1),
        dasha_multiplier=dasha_mult,
        conflict_detected=conflict,
        conflict_resolution=conflict_res,
        tie_breaker=tie_breaker,
        confidence_reason=confidence_reason,
        action_guidance=action_guidance,
    )


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _resolve_conflict(dasha: DashaSignals, winning_system: str) -> str:
    if dasha.pratyantar_quality == 'Shubh':
        return f'Dasha supports {winning_system} — favorable timing confirms signals.'
    elif dasha.pratyantar_quality == 'Ashubh':
        return 'Current Dasha advises patience. Foundation is strong — timing will align. Wait for next Shubh Pratyantar.'
    else:
        return f'Mixed Dasha — {winning_system} signals provide moderate guidance. Proceed carefully.'


def _get_dasha_multiplier(dasha: DashaSignals) -> float:
    if dasha.pratyantar_quality == 'Shubh':
        return 1.5
    elif dasha.pratyantar_quality == 'Ashubh':
        return 0.7
    else:
        return 1.0


def _build_confidence_reason(level, parashari, bhrigu, dasha, conflict, tie_breaker) -> str:
    parts = []
    if level == 'strong':
        parts.append('Both classical Parashari rules and Bhrigu pattern analysis confirm this reading.')
        if dasha.pratyantar_quality == 'Shubh':
            parts.append('Current Dasha period is favorable — timing is well aligned.')
    elif level == 'moderate':
        parts.append('Parashari classical analysis supports this reading.')
        if bhrigu.bhrigu_points >= 1:
            parts.append('Bhrigu pattern provides additional confirmation.')
        parts.append('Some effort and patience will yield results.')
    elif level == 'preparation':
        parts.append('Your chart foundation is solid. Current timing requires navigation.')
        if conflict and tie_breaker:
            parts.append(tie_breaker)
    else:
        parts.append('Current Dasha period advises patience and preparation.')
        parts.append('Your chart foundation is being assessed accurately — timing is the variable, not accuracy.')
        if tie_breaker:
            parts.append(tie_breaker)
    return ' '.join(parts)


def _build_action_guidance(level, dasha, conflict) -> str:
    if level == 'strong':
        return 'Strong window — act with confidence. Both systems confirm favorable conditions. Focus energy on this domain now.'
    elif level == 'moderate':
        return 'Proceed with measured action. Conditions are supportive. Small consistent steps will yield results.'
    elif level == 'preparation':
        return 'Use this period for preparation and groundwork. The timing window will improve — do not force outcomes. Focus on remedies.'
    else:
        return 'This is a preparation period. Focus on remedies and inner alignment. Significant action will be more effective after current Pratyantar passes.'


# ── SERIALIZER ────────────────────────────────────────────────────────────────

def confidence_to_dict(result: ConfidenceResult) -> dict:
    return {
        'label':             result.label,
        'badge':             result.badge,
        'karmic_marker':     result.karmic_marker,
        'karmic_text':       result.karmic_text,
        'confidence_reason': result.confidence_reason,
        'action_guidance':   result.action_guidance,
        'flag':              result.flag,
        'score':             result.score,
        'parashari_points':  result.parashari_points,
        'bhrigu_points':     result.bhrigu_points,
        'dasha_multiplier':  result.dasha_multiplier,
        'conflict_detected': result.conflict_detected,
        'conflict_resolution': result.conflict_resolution,
        'tie_breaker':       result.tie_breaker,
    }


# ── SIGNAL EXTRACTORS ─────────────────────────────────────────────────────────

def extract_parashari_signals(parashari_analysis: dict, domain_id: str) -> ParasharaSignals:
    domain_house_map = {
        'genz_ex_back':           [7, 5, 12],
        'genz_toxic_boss':        [10, 6, 8],
        'genz_manifestation':     [5, 9, 1],
        'genz_dream_career':      [10, 1, 6],
        'mill_property_yog':      [4, 2, 11],
        'mill_karz_mukti':        [6, 2, 12],
        'mill_childs_destiny':    [5, 9, 1],
        'mill_parents_wellness':  [4, 9, 8],
        'genx_retirement_peace':  [12, 2, 8],
        'genx_legacy_inheritance':[8, 2, 4],
        'genx_spiritual_innings': [12, 9, 8],
    }
    domain_houses = domain_house_map.get(domain_id, [])
    summary       = parashari_analysis.get('summary', {})
    sarva         = parashari_analysis.get('sarvashtakavarga', {})
    house_scores  = sarva.get('houseScores', [0] * 12)
    primary_house = domain_houses[0] if domain_houses else 1
    domain_score  = house_scores[primary_house - 1] if len(house_scores) >= primary_house else 0

    return ParasharaSignals(
        strong_planet_count=len(summary.get('strongPlanets', [])),
        weak_planet_count=len(summary.get('weakPlanets', [])),
        active_yoga_count=parashari_analysis.get('totalActiveYogas', 0),
        primary_yoga=summary.get('primaryYoga', ''),
        domain_house_score=domain_score,
        lagna_lord_strong=summary.get('overallStrength') == 'strong',
        dasha_lord_benefic=False,
        domain_planet_strong=summary.get('overallStrength') in ['strong', 'moderate'],
        overall_strength=summary.get('overallStrength', 'moderate'),
    )


def extract_bhrigu_signals(bhrigu_analysis: dict) -> BhriguSignals:
    return BhriguSignals(
        bhrigu_points=bhrigu_analysis.get('bhrigu_points', 0),
        karmic_indicator=bhrigu_analysis.get('karmic_indicator', False),
        domain_signal_count=len(bhrigu_analysis.get('domain_signals', [])),
        event_signature=len(bhrigu_analysis.get('event_signatures', [])) > 0,
    )


def extract_dasha_signals(dasha_data: dict, domain_id: str) -> DashaSignals:
    NATURAL_BENEFICS_SET = {'Jupiter', 'Venus', 'Mercury', 'Moon'}
    domain_focus_map = {
        'genz_ex_back':           ['Venus', 'Moon', 'Rahu'],
        'genz_toxic_boss':        ['Saturn', 'Mars', 'Rahu'],
        'genz_manifestation':     ['Jupiter', 'Moon', 'Venus'],
        'genz_dream_career':      ['Rahu', 'Saturn', 'Sun'],
        'mill_property_yog':      ['Jupiter', 'Moon', 'Mars'],
        'mill_karz_mukti':        ['Saturn', 'Rahu', 'Jupiter'],
        'mill_childs_destiny':    ['Jupiter', 'Moon'],
        'mill_parents_wellness':  ['Moon', 'Sun', 'Saturn'],
        'genx_retirement_peace':  ['Jupiter', 'Saturn', 'Ketu'],
        'genx_legacy_inheritance':['Saturn', 'Rahu', 'Jupiter'],
        'genx_spiritual_innings': ['Ketu', 'Jupiter', 'Saturn'],
    }
    domain_focus = domain_focus_map.get(domain_id, [])
    md_lord  = dasha_data.get('mahadasha', {}).get('lord', '')
    ad_lord  = dasha_data.get('antardasha', {}).get('lord', '')
    pd_lord  = dasha_data.get('pratyantar', {}).get('lord', '')
    pd_quality = dasha_data.get('pratyantar', {}).get('quality', 'Madhyam')
    ad_quality = 'Shubh' if ad_lord in NATURAL_BENEFICS_SET else 'Madhyam'
    domain_relevant = any(lord in domain_focus for lord in [md_lord, ad_lord, pd_lord])

    return DashaSignals(
        mahadasha_lord=md_lord, antardasha_lord=ad_lord, pratyantar_lord=pd_lord,
        pratyantar_quality=pd_quality, antardasha_quality=ad_quality,
        domain_relevant=domain_relevant,
    )
