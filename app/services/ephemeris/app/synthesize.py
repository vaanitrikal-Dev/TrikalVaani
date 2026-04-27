"""
================================================================
TRIKAL VAANI — Main Synthesis Engine
CEO: Rohiit Gupta | Chief Vedic Architect
File: synthesize.py
Version: 1.0 | Date: 2026-04-28
JAI MAA SHAKTI

PURPOSE:
    Main /synthesize endpoint for Render.
    Orchestrates all engines:
    1. Swiss Ephemeris (already running)
    2. Parashari Engine (parashara.py)
    3. Bhrigu Engine (bhrigu.py)
    4. Panchang Calculator (panchang.py)
    5. Confidence Scoring (confidence.py)
    
    Returns enriched JSON → Vercel → Gemini prompt
    
    Flow:
    Vercel POST /synthesize
    → Render runs all engines
    → Returns enriched_data
    → Vercel injects into Gemini prompt
    → Gemini returns prediction
    → Vercel saves to Supabase
================================================================
"""

import json
import hashlib
import traceback
from datetime import datetime
from typing import Optional

from flask import request, jsonify

# Import our engines
try:
    from bhrigu     import run_bhrigu_analysis, bhrigu_to_dict
    from confidence import (
        calculate_confidence, confidence_to_dict,
        extract_parashari_signals, extract_bhrigu_signals,
        extract_dasha_signals,
    )
except ImportError:
    # Fallback for testing
    pass

# Import parashara engine (Python version)
# Note: parashara.py is the Python translation of lib/parashara.ts
try:
    from parashara import run_parashari_analysis, parashari_to_dict
except ImportError:
    pass

# Import panchang engine (Python version)
# Note: panchang.py is the Python translation of lib/panchang.ts
try:
    from panchang import calculate_panchang, panchang_to_dict
except ImportError:
    pass


# ── REGISTER WITH FLASK APP ───────────────────────────────────────────────────
# This file is imported by your main app.py on Render
# Add this to your app.py: from synthesize import register_synthesize
# Then call: register_synthesize(app)

def register_synthesize(app, supabase_client=None):
    """Register the /synthesize endpoint with the Flask app."""

    @app.route('/synthesize', methods=['POST'])
    def synthesize():
        """
        Main synthesis endpoint.
        
        Input (from Vercel):
        {
            "domainId": "mill_karz_mukti",
            "birthData": {
                "dob": "1990-05-15",
                "tob": "14:30",
                "lat": 28.6139,
                "lng": 77.2090,
                "cityName": "Delhi",
                "timezone": 5.5,
                "name": "Rahul"
            },
            "kundaliData": {
                ... (from Swiss Ephemeris /kundali call)
            },
            "userContext": {
                "tier": "standard",
                "segment": "millennial",
                "language": "hinglish",
                "employment": "professional",
                "sector": "it",
                "city": "Delhi"
            }
        }
        
        Output (to Vercel):
        {
            "status": "success",
            "enriched": {
                "parashara": {...},
                "bhrigu": {...},
                "panchang": {...},
                "confidence": {...},
                "synthesis": {...}
            },
            "cache_key": "...",
            "processing_ms": 1234
        }
        """
        start_ms = _now_ms()

        try:
            body = request.get_json()
            if not body:
                return jsonify({'error': 'No JSON body provided'}), 400

            domain_id    = body.get('domainId', '')
            birth_data   = body.get('birthData', {})
            kundali_data = body.get('kundaliData', {})
            user_context = body.get('userContext', {})

            # ── Validate required fields ──────────────────────────────────────
            if not domain_id:
                return jsonify({'error': 'domainId is required'}), 400
            if not birth_data.get('dob'):
                return jsonify({'error': 'birthData.dob is required'}), 400
            if not kundali_data:
                return jsonify({'error': 'kundaliData is required'}), 400

            # ── Cache check ───────────────────────────────────────────────────
            cache_key = _build_cache_key(birth_data, domain_id, user_context.get('tier', 'free'))

            if supabase_client:
                cached = _check_cache(supabase_client, cache_key)
                if cached:
                    cached['cache_hit']      = True
                    cached['processing_ms']  = _now_ms() - start_ms
                    return jsonify(cached)

            # ── Extract planets from kundali data ─────────────────────────────
            planets    = _extract_planets(kundali_data)
            lagna      = kundali_data.get('lagna', {}).get('sign', 'Mesh')
            lagna_index = _rashi_to_index(lagna)
            dasha_data = kundali_data.get('dasha', {})

            # ── Engine 1: Parashari Analysis ──────────────────────────────────
            parashari_result = {}
            try:
                parashari_raw    = run_parashari_analysis(planets, lagna, lagna_index)
                parashari_result = parashari_to_dict(parashari_raw)
            except Exception as e:
                print(f'[Synthesize] Parashari engine error: {e}')
                parashari_result = _empty_parashari()

            # ── Engine 2: Bhrigu Analysis ─────────────────────────────────────
            pratyantar_quality = dasha_data.get('pratyantar', {}).get('quality', 'Madhyam')

            bhrigu_result = {}
            try:
                bhrigu_raw    = run_bhrigu_analysis(
                    planets=planets,
                    lagna=lagna,
                    lagna_index=lagna_index,
                    domain_id=domain_id,
                    dasha_quality=pratyantar_quality,
                )
                bhrigu_result = bhrigu_to_dict(bhrigu_raw)
            except Exception as e:
                print(f'[Synthesize] Bhrigu engine error: {e}')
                bhrigu_result = _empty_bhrigu()

            # ── Engine 3: Panchang ────────────────────────────────────────────
            panchang_result = {}
            try:
                sun_longitude  = _get_planet_longitude(kundali_data, 'Sun')
                moon_longitude = _get_planet_longitude(kundali_data, 'Moon')
                lat            = float(birth_data.get('lat', 28.6139))
                lng            = float(birth_data.get('lng', 77.2090))

                panchang_raw    = calculate_panchang(
                    sun_longitude=sun_longitude,
                    moon_longitude=moon_longitude,
                    date=datetime.now(),
                    lat=lat,
                    lng=lng,
                )
                panchang_result = panchang_to_dict(panchang_raw)
            except Exception as e:
                print(f'[Synthesize] Panchang engine error: {e}')
                panchang_result = _empty_panchang()

            # ── Engine 4: Confidence Scoring (6-2-2 Model) ───────────────────
            confidence_result = {}
            try:
                para_signals  = extract_parashari_signals(parashari_result, domain_id)
                bhri_signals  = extract_bhrigu_signals(bhrigu_result)
                dasha_signals = extract_dasha_signals(dasha_data, domain_id)

                conf_raw        = calculate_confidence(
                    parashari=para_signals,
                    bhrigu=bhri_signals,
                    dasha=dasha_signals,
                    domain_id=domain_id,
                    karmic_description=bhrigu_result.get('karmic_description', ''),
                )
                confidence_result = confidence_to_dict(conf_raw)
            except Exception as e:
                print(f'[Synthesize] Confidence engine error: {e}')
                confidence_result = _empty_confidence()

            # ── Synthesis Summary ─────────────────────────────────────────────
            synthesis = _build_synthesis_summary(
                parashari_result,
                bhrigu_result,
                confidence_result,
                domain_id,
                pratyantar_quality,
            )

            # ── Build response ────────────────────────────────────────────────
            processing_ms = _now_ms() - start_ms

            response_data = {
                'status':        'success',
                'cache_hit':     False,
                'cache_key':     cache_key,
                'processing_ms': processing_ms,
                'enriched': {
                    'parashara':  parashari_result,
                    'bhrigu':     bhrigu_result,
                    'panchang':   panchang_result,
                    'confidence': confidence_result,
                    'synthesis':  synthesis,
                },
            }

            # ── Cache result ──────────────────────────────────────────────────
            if supabase_client:
                _save_cache(supabase_client, cache_key, response_data)

            print(
                f'[Synthesize] OK | domain={domain_id} | '
                f'confidence={confidence_result.get("label")} | '
                f'ms={processing_ms}'
            )

            return jsonify(response_data)

        except Exception as e:
            print(f'[Synthesize] UNHANDLED ERROR: {e}')
            print(traceback.format_exc())
            return jsonify({
                'error':   'Synthesis engine error',
                'detail':  str(e),
                'status':  'error',
            }), 500


# ── SYNTHESIS SUMMARY BUILDER ─────────────────────────────────────────────────

def _build_synthesis_summary(
    parashari:  dict,
    bhrigu:     dict,
    confidence: dict,
    domain_id:  str,
    dasha_quality: str,
) -> dict:
    """Build the final synthesis summary that goes into Gemini prompt."""

    # 6-2-2 breakdown
    parashari_strong = parashari.get('summary', {}).get('overallStrength') == 'strong'
    bhrigu_active    = bhrigu.get('bhrigu_points', 0) >= 1
    dasha_shubh      = dasha_quality == 'Shubh'

    # Agreement analysis
    agreement_points = 0
    agreement_items  = []

    if parashari_strong and bhrigu_active:
        agreement_points += 3
        agreement_items.append('Both Parashari and Bhrigu confirm domain activation')

    active_yogas = parashari.get('activeYogas', [])
    if active_yogas:
        agreement_points += min(len(active_yogas), 2) * 3
        yoga_names = [y.get('name', '') for y in active_yogas[:2]]
        agreement_items.append(f"Active Yogas: {', '.join(yoga_names)}")

    if bhrigu.get('event_signatures'):
        sig = bhrigu['event_signatures'][0]
        agreement_items.append(f"Bhrigu Event: {sig.get('event', '')}")

    # Conflict flags
    conflicts = []
    if confidence.get('conflict_detected'):
        conflicts.append(confidence.get('conflict_resolution', ''))

    return {
        # 6-2-2 model breakdown
        'model':                '6-2-2 Ensemble',
        'agreement_points':     agreement_points,
        'agreement_items':      agreement_items,
        'parashari_active':     parashari_strong,
        'bhrigu_active':        bhrigu_active,
        'dasha_favorable':      dasha_shubh,

        # Conflict resolution
        'conflicts':            conflicts,
        'tie_breaker':          confidence.get('tie_breaker', ''),

        # UI signals
        'confidence_label':     confidence.get('label', ''),
        'confidence_badge':     confidence.get('badge', ''),
        'karmic_marker':        confidence.get('karmic_marker', False),
        'karmic_text':          confidence.get('karmic_text', ''),

        # Strong signals for Gemini
        'strong_parashari_planets': parashari.get('summary', {}).get('strongPlanets', []),
        'weak_parashari_planets':   parashari.get('summary', {}).get('weakPlanets', []),
        'best_houses':              parashari.get('summary', {}).get('bestHouses', []),
        'challenged_houses':        parashari.get('summary', {}).get('challengedHouses', []),
        'primary_yoga':             parashari.get('summary', {}).get('primaryYoga', ''),
        'bhrigu_theme':             bhrigu.get('current_life_theme', ''),
        'bhrigu_domain_signals':    bhrigu.get('domain_signals', []),

        # Gemini instructions
        'gemini_note': _build_gemini_note(
            confidence.get('label', ''),
            confidence.get('karmic_marker', False),
            conflicts,
            dasha_quality,
        ),
    }


def _build_gemini_note(
    confidence_label: str,
    karmic_marker:    bool,
    conflicts:        list,
    dasha_quality:    str,
) -> str:
    """Build a specific instruction for Gemini based on synthesis."""

    parts = [f'Confidence level is {confidence_label}.']

    if karmic_marker:
        parts.append(
            'Add subtle 🔱 Karmic Indicator mention — '
            'Bhrigu pattern strongly confirms this prediction.'
        )

    if conflicts:
        parts.append(
            'Conflict detected between systems — '
            'use safe language: "favorable tendency" not "guaranteed outcome".'
        )

    if dasha_quality == 'Ashubh':
        parts.append(
            'Current Dasha is challenging — '
            'emphasize remedies and preparation over action windows.'
        )
    elif dasha_quality == 'Shubh':
        parts.append(
            'Dasha is highly favorable — '
            'emphasize action windows and concrete steps.'
        )

    return ' '.join(parts)


# ── CACHE HELPERS ─────────────────────────────────────────────────────────────

def _build_cache_key(birth_data: dict, domain_id: str, tier: str) -> str:
    """Build deterministic cache key from birth data."""
    key_str = f"{birth_data.get('dob','')}-{birth_data.get('tob','')}-{birth_data.get('lat','')}-{birth_data.get('lng','')}-{domain_id}-{tier}"
    return hashlib.md5(key_str.encode()).hexdigest()


def _check_cache(supabase_client, cache_key: str) -> Optional[dict]:
    """Check Supabase for cached synthesis result."""
    try:
        result = (
            supabase_client
            .table('synthesis_cache')
            .select('result_json')
            .eq('cache_key', cache_key)
            .limit(1)
            .execute()
        )
        if result.data:
            return json.loads(result.data[0]['result_json'])
    except Exception as e:
        print(f'[Cache] Check error: {e}')
    return None


def _save_cache(supabase_client, cache_key: str, data: dict) -> None:
    """Save synthesis result to Supabase cache."""
    try:
        supabase_client.table('synthesis_cache').upsert({
            'cache_key':   cache_key,
            'result_json': json.dumps(data),
            'created_at':  datetime.utcnow().isoformat(),
        }).execute()
    except Exception as e:
        print(f'[Cache] Save error: {e}')


# ── DATA HELPERS ──────────────────────────────────────────────────────────────

def _extract_planets(kundali_data: dict) -> dict:
    """Extract planets dict from kundali response."""
    planets = {}
    grahas  = kundali_data.get('grahas', [])

    for g in grahas:
        name = g.get('planet', '')
        if name:
            planets[name] = {
                'house':             g.get('house', 1),
                'rashi':             g.get('sign', 'Mesh'),
                'degree':            g.get('degree_in_sign', 0),
                'siderealLongitude': g.get('longitude', 0),
                'isRetrograde':      g.get('retrograde', False),
                'strength':          g.get('strength', 50),
                'nakshatra':         g.get('nakshatra', 'Ashwini'),
            }

    return planets


def _get_planet_longitude(kundali_data: dict, planet_name: str) -> float:
    """Get sidereal longitude for a specific planet."""
    grahas = kundali_data.get('grahas', [])
    for g in grahas:
        if g.get('planet') == planet_name:
            return float(g.get('longitude', 0))
    return 0.0


RASHIS = [
    'Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya',
    'Tula', 'Vrischik', 'Dhanu', 'Makar', 'Kumbh', 'Meen'
]

def _rashi_to_index(rashi: str) -> int:
    return RASHIS.index(rashi) if rashi in RASHIS else 0


def _now_ms() -> int:
    return int(datetime.utcnow().timestamp() * 1000)


# ── EMPTY FALLBACKS ───────────────────────────────────────────────────────────

def _empty_parashari() -> dict:
    return {
        'activeYogas': [], 'totalActiveYogas': 0,
        'ashtakavarga': [], 'sarvashtakavarga': {'houseScores': [0]*12},
        'summary': {'strongPlanets': [], 'weakPlanets': [], 'primaryYoga': None, 'overallStrength': 'moderate'},
    }

def _empty_bhrigu() -> dict:
    return {
        'jupiter_house': 0, 'bhrigu_points': 0,
        'karmic_indicator': False, 'karmic_description': '',
        'domain_signals': [], 'event_signatures': [],
        'summary': 'Bhrigu analysis unavailable',
    }

def _empty_panchang() -> dict:
    return {
        'vara': '', 'tithi': '', 'nakshatra': '',
        'yoga': '', 'yogaType': 'Madhyam',
        'rahuKaal': {'start': '', 'end': ''},
        'abhijeetMuhurta': {'start': '', 'end': ''},
    }

def _empty_confidence() -> dict:
    return {
        'label': 'Planetary Support Active',
        'badge': 'Moderate Confidence',
        'score': 60.0,
        'flag':  'partial',
        'karmic_marker': False,
        'karmic_text': '',
        'confidence_reason': 'Analysis in progress',
        'action_guidance': 'Proceed with measured action',
    }
