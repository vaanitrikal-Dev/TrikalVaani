"""
================================================================
TRIKAL VAANI — Confidence Scoring Engine (6-2-2 Model)
CEO: Rohiit Gupta | Chief Vedic Architect
File: confidence.py
Version: 1.0 | Date: 2026-04-28
JAI MAA SHAKTI

PURPOSE:
    Implements the 6-2-2 Ensemble Confidence Model:
    
    6 Common Points  = Both Parashari + Bhrigu agree (Anchor)
    2 Parashari Points = Rule-based logic signals (The Why)
    2 Bhrigu Points    = Pattern-based signals (The What)
    
    Total = 10 points → Confidence Score → Label
    
    Scoring:
    Parashari signal → +5 per strong signal (max 2 = 10 pts)
    Bhrigu match    → +3 per confirmation (max 2 = 6 pts)
    Dasha multiplier → ×1.5 (Shubh) | ×1.0 (Madhyam) | ×0.7 (Ashubh)
    
    Labels (never show numbers to users):
    80%+ → "Multi-Layer Verified ✓"
    60-79% → "Planetary Support Active"
    40-59% → "Timing-Dependent"
    <40%  → "Conditional — Act After [date]"
    
    Conflict Resolution Hierarchy:
    1. Dasha (NON-NEGOTIABLE)
    2. Gochar/Transit
    3. Parashari base logic
    4. Bhrigu (only if Dasha supports)
================================================================
"""

from dataclasses import dataclass, field
from typing import Optional


# ── DATA CLASSES ──────────────────────────────────────────────────────────────

@dataclass
class ParasharaSignals:
    """Signals extracted from Parashari analysis."""
    strong_planet_count:   int = 0      # planets with strength >= 65
    weak_planet_count:     int = 0      # planets with strength < 35
    active_yoga_count:     int = 0      # number of active Yogas
    primary_yoga:          str = ''     # strongest yoga name
    domain_house_score:    int = 0      # Ashtakavarga score for primary domain house
    lagna_lord_strong:     bool = False # Is Lagna lord strong (>= 65)?
    dasha_lord_benefic:    bool = False # Is current Dasha lord a benefic?
    domain_planet_strong:  bool = False # Is key domain planet strong?
    overall_strength:      str = 'moderate'  # 'strong' | 'moderate' | 'weak'


@dataclass
class BhriguSignals:
    """Signals extracted from Bhrigu analysis."""
    bhrigu_points:       int = 0       # 0-2 points
    karmic_indicator:    bool = False
    domain_signal_count: int = 0
    event_signature:     bool = False


@dataclass
class DashaSignals:
    """Current Dasha state."""
    mahadasha_lord:    str = ''
    antardasha_lord:   str = ''
    pratyantar_lord:   str = ''
    pratyantar_quality: str = 'Madhyam'  # 'Shubh' | 'Madhyam' | 'Ashubh'
    antardasha_quality: str = 'Madhyam'
    domain_relevant:   bool = False       # Is current Dasha lord relevant to domain?


@dataclass
class ConfidenceResult:
    """Final confidence output."""
    score:              float         # 0-100 internal score (never shown to user)
    label:              str           # user-facing label
    badge:              str           # UI badge text
    flag:               str           # 'agreement' | 'partial' | 'conflict'
    karmic_marker:      bool          # show 🔱 badge?
    karmic_text:        str           # karmic marker description

    # 6-2-2 breakdown (internal)
    parashari_points:   float = 0     # max 6 (common) + 2 (parashari-only)
    bhrigu_points:      float = 0     # max 2
    dasha_multiplier:   float = 1.0

    # Conflict resolution
    conflict_detected:  bool = False
    conflict_resolution: str = ''
    tie_breaker:        str = ''      # which system won

    # User-facing explanation (plain language)
    confidence_reason:  str = ''
    action_guidance:    str = ''


# ── CONSTANTS ─────────────────────────────────────────────────────────────────

NATURAL_BENEFICS = {'Jupiter', 'Venus', 'Mercury', 'Moon'}
NATURAL_MALEFICS = {'Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'}

# Label thresholds
LABEL_HIGH        = 80
LABEL_MODERATE    = 60
LABEL_CONDITIONAL = 40

# User-facing labels
LABELS = {
    'high':        'Multi-Layer Verified ✓',
    'moderate':    'Planetary Support Active',
    'conditional': 'Timing-Dependent',
    'low':         'Conditional — Check Timing',
}

BADGES = {
    'high':        'High Confidence',
    'moderate':    'Moderate Confidence',
    'conditional': 'Conditional',
    'low':         'Verify Timing',
}


# ── MAIN SCORING FUNCTION ─────────────────────────────────────────────────────

def calculate_confidence(
    parashari:  ParasharaSignals,
    bhrigu:     BhriguSignals,
    dasha:      DashaSignals,
    domain_id:  str,
    karmic_description: str = '',
) -> ConfidenceResult:
    """
    6-2-2 Ensemble Confidence Model.
    
    SCORING SYSTEM:
    ═══════════════
    Common ground (both systems agree):
      - Yoga present + domain relevant          → +3 per yoga (max 2 yogas = 6 pts)
      - Strong domain planet + Bhrigu confirms  → +3 per match
    
    Parashari-only (The Why):
      - Strong Lagna lord                       → +2
      - Domain house Ashtakavarga >= 5          → +3
      - Domain planet strength >= 65            → +2
    
    Bhrigu-only (The What):
      - Each Bhrigu domain signal               → +3 (max 2 = 6 pts)
      - Event signature detected                → +3 bonus
    
    Dasha multiplier (NON-NEGOTIABLE):
      - Shubh   → ×1.5
      - Madhyam → ×1.0
      - Ashubh  → ×0.7 (reduces ALL other signals)
    
    Maximum raw score before multiplier: ~30 pts
    Normalized to 0-100 scale.
    """

    raw_score       = 0.0
    parashari_pts   = 0.0
    bhrigu_pts_calc = 0.0
    common_pts      = 0.0
    conflict        = False
    conflict_res    = ''
    tie_breaker     = ''

    # ── STEP 1: CONFLICT DETECTION ────────────────────────────────────────────
    # Parashari says strong, Bhrigu says weak (or vice versa)
    parashari_strong = parashari.overall_strength == 'strong'
    bhrigu_strong    = bhrigu.bhrigu_points >= 1

    if parashari_strong and not bhrigu_strong:
        conflict        = True
        conflict_res    = 'Parashari strong but Bhrigu pattern absent'
        tie_breaker     = _resolve_conflict(dasha, 'parashari')
    elif bhrigu_strong and not parashari_strong:
        conflict        = True
        conflict_res    = 'Bhrigu pattern present but Parashari weak'
        tie_breaker     = _resolve_conflict(dasha, 'bhrigu')

    # ── STEP 2: COMMON GROUND SCORING (6 points max) ─────────────────────────
    # Both systems agree = highest confidence signals

    # Yoga + domain relevance (max 6 pts common)
    yoga_common = min(parashari.active_yoga_count, 2) * 3
    common_pts += yoga_common

    # Strong domain planet confirmed by Bhrigu
    if parashari.domain_planet_strong and bhrigu.bhrigu_points >= 1:
        common_pts += 3  # both systems agree on domain planet

    # Domain Ashtakavarga + Bhrigu domain signal
    if parashari.domain_house_score >= 5 and bhrigu.domain_signal_count >= 1:
        common_pts += 3

    common_pts = min(common_pts, 6)  # cap at 6 for model integrity

    # ── STEP 3: PARASHARI-ONLY SCORING (2 points max) ────────────────────────
    if parashari.lagna_lord_strong:
        parashari_pts += 2

    if parashari.domain_house_score >= 5:
        parashari_pts += 3
    elif parashari.domain_house_score >= 4:
        parashari_pts += 1

    if parashari.domain_planet_strong:
        parashari_pts += 2

    parashari_pts = min(parashari_pts, 10)  # raw max before multiplier

    # ── STEP 4: BHRIGU-ONLY SCORING (2 points max) ────────────────────────────
    bhrigu_pts_calc += bhrigu.bhrigu_points * 3   # 0, 3, or 6

    if bhrigu.event_signature:
        bhrigu_pts_calc += 3  # bonus for specific event signature

    if bhrigu.karmic_indicator:
        bhrigu_pts_calc += 2  # bonus for karmic marker

    bhrigu_pts_calc = min(bhrigu_pts_calc, 10)  # raw max

    # ── STEP 5: RAW TOTAL ─────────────────────────────────────────────────────
    raw_score = common_pts + parashari_pts + bhrigu_pts_calc

    # ── STEP 6: DASHA MULTIPLIER (NON-NEGOTIABLE) ─────────────────────────────
    dasha_mult = _get_dasha_multiplier(dasha)

    # If Dasha contradicts Parashari AND Bhrigu → Dasha always wins
    if dasha.pratyantar_quality == 'Ashubh' and parashari_strong:
        conflict        = True
        conflict_res    = 'Parashari shows strength but Dasha period is challenging'
        tie_breaker     = 'Dasha overrides — timing is not favorable'

    final_score = raw_score * dasha_mult

    # Normalize to 0-100 (max raw ≈ 26 × 1.5 = 39 → map to 100)
    normalized = min(100, (final_score / 39) * 100)

    # ── STEP 7: LABEL ASSIGNMENT ──────────────────────────────────────────────
    if normalized >= LABEL_HIGH:
        level = 'high'
    elif normalized >= LABEL_MODERATE:
        level = 'moderate'
    elif normalized >= LABEL_CONDITIONAL:
        level = 'conditional'
    else:
        level = 'low'

    # Override: If Dasha is Ashubh → never go above 'conditional'
    if dasha.pratyantar_quality == 'Ashubh' and level == 'high':
        level = 'moderate'
        conflict = True

    # ── STEP 8: KARMIC MARKER ─────────────────────────────────────────────────
    # Show 🔱 badge only when Bhrigu strongly confirms
    show_karmic = (
        bhrigu.karmic_indicator and
        bhrigu.bhrigu_points >= 1 and
        dasha.pratyantar_quality != 'Ashubh' and
        normalized >= 55
    )

    # ── STEP 9: USER-FACING EXPLANATIONS ─────────────────────────────────────
    confidence_reason = _build_confidence_reason(
        level, parashari, bhrigu, dasha, conflict, tie_breaker
    )
    action_guidance = _build_action_guidance(
        level, dasha, conflict
    )

    return ConfidenceResult(
        score=round(normalized, 1),
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
    """Resolve conflict using Dasha as tie-breaker."""

    if dasha.pratyantar_quality == 'Shubh':
        return (
            f'Dasha supports {winning_system} — '
            f'favorable timing confirms {winning_system} signals.'
        )
    elif dasha.pratyantar_quality == 'Ashubh':
        return (
            'Dasha overrides both systems — '
            'timing is not favorable regardless of chart strength. '
            'Wait for next Shubh Pratyantar period.'
        )
    else:
        return (
            f'Mixed Dasha — {winning_system} signals taken as moderate guidance. '
            'Proceed with caution.'
        )


def _get_dasha_multiplier(dasha: DashaSignals) -> float:
    """Get Dasha multiplier — NON-NEGOTIABLE in conflict resolution."""

    if dasha.pratyantar_quality == 'Shubh':
        return 1.5
    elif dasha.pratyantar_quality == 'Ashubh':
        return 0.7
    else:
        return 1.0


def _build_confidence_reason(
    level: str,
    parashari: ParasharaSignals,
    bhrigu: BhriguSignals,
    dasha: DashaSignals,
    conflict: bool,
    tie_breaker: str,
) -> str:
    """Build plain language confidence reason."""

    parts = []

    if level == 'high':
        parts.append('Both classical Parashari rules and Bhrigu pattern analysis strongly confirm this prediction.')
        if dasha.pratyantar_quality == 'Shubh':
            parts.append('Current Dasha period is highly favorable — timing aligns perfectly.')
    elif level == 'moderate':
        parts.append('Parashari classical analysis supports this prediction.')
        if bhrigu.bhrigu_points >= 1:
            parts.append('Bhrigu pattern provides additional confirmation.')
        if dasha.pratyantar_quality == 'Madhyam':
            parts.append('Dasha period is mixed — some effort required.')
    elif level == 'conditional':
        parts.append('Chart shows potential but current timing requires careful navigation.')
        if conflict:
            parts.append(f'Note: {tie_breaker}')
    else:
        parts.append('Current Dasha period is challenging.')
        parts.append('Planetary foundation exists but timing is not yet aligned.')
        if tie_breaker:
            parts.append(tie_breaker)

    return ' '.join(parts)


def _build_action_guidance(
    level: str,
    dasha: DashaSignals,
    conflict: bool,
) -> str:
    """Build plain language action guidance based on confidence."""

    if level == 'high':
        return (
            'This is a strong window — act decisively. '
            'Both systems confirm favorable conditions. '
            'Focus energy on this domain now.'
        )
    elif level == 'moderate':
        return (
            'Proceed with measured action — conditions are supportive '
            'but not at peak strength. '
            'Small consistent steps will yield results.'
        )
    elif level == 'conditional':
        return (
            'Wait for Dasha timing to align before major moves. '
            'Use this period for preparation and groundwork. '
            'The window will open — do not force outcomes.'
        )
    else:
        return (
            'This is a preparation period — not an action period. '
            'Focus on remedies and inner alignment. '
            'Significant action advised only after current Pratyantar passes.'
        )


# ── SERIALIZER ────────────────────────────────────────────────────────────────

def confidence_to_dict(result: ConfidenceResult) -> dict:
    """Convert ConfidenceResult to JSON-serializable dict."""
    return {
        # User-facing (show these)
        'label':             result.label,
        'badge':             result.badge,
        'karmic_marker':     result.karmic_marker,
        'karmic_text':       result.karmic_text,
        'confidence_reason': result.confidence_reason,
        'action_guidance':   result.action_guidance,
        'flag':              result.flag,

        # Internal (for Gemini prompt injection)
        'score':             result.score,
        'parashari_points':  result.parashari_points,
        'bhrigu_points':     result.bhrigu_points,
        'dasha_multiplier':  result.dasha_multiplier,
        'conflict_detected': result.conflict_detected,
        'conflict_resolution': result.conflict_resolution,
        'tie_breaker':       result.tie_breaker,
    }


# ── SIGNAL EXTRACTOR HELPERS ──────────────────────────────────────────────────
# Helper functions to extract signals from existing engine outputs

def extract_parashari_signals(
    parashari_analysis: dict,
    domain_id: str,
) -> ParasharaSignals:
    """Extract ParasharaSignals from parashara engine output dict."""

    domain_house_map = {
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

    domain_houses = domain_house_map.get(domain_id, [])
    summary       = parashari_analysis.get('summary', {})
    sarva         = parashari_analysis.get('sarvashtakavarga', {})
    house_scores  = sarva.get('houseScores', [0] * 12)

    # Domain house score (primary house)
    primary_house = domain_houses[0] if domain_houses else 1
    domain_score  = house_scores[primary_house - 1] if len(house_scores) >= primary_house else 0

    return ParasharaSignals(
        strong_planet_count=len(summary.get('strongPlanets', [])),
        weak_planet_count=len(summary.get('weakPlanets', [])),
        active_yoga_count=parashari_analysis.get('totalActiveYogas', 0),
        primary_yoga=summary.get('primaryYoga', ''),
        domain_house_score=domain_score,
        lagna_lord_strong=summary.get('overallStrength') == 'strong',
        dasha_lord_benefic=False,  # set from dasha data
        domain_planet_strong=summary.get('overallStrength') in ['strong', 'moderate'],
        overall_strength=summary.get('overallStrength', 'moderate'),
    )


def extract_bhrigu_signals(bhrigu_analysis: dict) -> BhriguSignals:
    """Extract BhriguSignals from bhrigu engine output dict."""
    return BhriguSignals(
        bhrigu_points=bhrigu_analysis.get('bhrigu_points', 0),
        karmic_indicator=bhrigu_analysis.get('karmic_indicator', False),
        domain_signal_count=len(bhrigu_analysis.get('domain_signals', [])),
        event_signature=len(bhrigu_analysis.get('event_signatures', [])) > 0,
    )


def extract_dasha_signals(dasha_data: dict, domain_id: str) -> DashaSignals:
    """Extract DashaSignals from dasha data."""

    NATURAL_BENEFICS_SET = {'Jupiter', 'Venus', 'Mercury', 'Moon'}

    domain_focus_map = {
        'genz_ex_back':          ['Venus', 'Moon', 'Rahu'],
        'genz_toxic_boss':       ['Saturn', 'Mars', 'Rahu'],
        'genz_manifestation':    ['Jupiter', 'Moon', 'Venus'],
        'genz_dream_career':     ['Rahu', 'Saturn', 'Sun'],
        'mill_property_yog':     ['Jupiter', 'Moon', 'Mars'],
        'mill_karz_mukti':       ['Saturn', 'Rahu', 'Jupiter'],
        'mill_childs_destiny':   ['Jupiter', 'Moon'],
        'mill_parents_wellness': ['Moon', 'Sun', 'Saturn'],
        'genx_retirement_peace': ['Jupiter', 'Saturn', 'Ketu'],
        'genx_legacy_inheritance':['Saturn', 'Rahu', 'Jupiter'],
        'genx_spiritual_innings': ['Ketu', 'Jupiter', 'Saturn'],
    }

    domain_focus = domain_focus_map.get(domain_id, [])
    md_lord      = dasha_data.get('mahadasha', {}).get('lord', '')
    ad_lord      = dasha_data.get('antardasha', {}).get('lord', '')
    pd_lord      = dasha_data.get('pratyantar', {}).get('lord', '')
    pd_quality   = dasha_data.get('pratyantar', {}).get('quality', 'Madhyam')
    ad_quality   = 'Shubh' if ad_lord in NATURAL_BENEFICS_SET else 'Madhyam'

    domain_relevant = any(lord in domain_focus for lord in [md_lord, ad_lord, pd_lord])

    return DashaSignals(
        mahadasha_lord=md_lord,
        antardasha_lord=ad_lord,
        pratyantar_lord=pd_lord,
        pratyantar_quality=pd_quality,
        antardasha_quality=ad_quality,
        domain_relevant=domain_relevant,
    )
