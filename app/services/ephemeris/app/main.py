"""
=============================================================
  TRIKAL VAANI — Swiss Ephemeris Vedic Astrology API
  File: app/main.py
  Author: Rohiit Gupta, Chief Vedic Architect
  Version: 3.0 — Added /synthesize endpoint (Parashari + Bhrigu + Panchang + Confidence)
  JAI MAA SHAKTI
=============================================================
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field
import os
import json
import hashlib
import traceback
from datetime import datetime
from typing import Optional, Dict, Any

from .astro import (
    compute_kundali,
    compute_kundali_matching,
    compute_dasha,
    compute_nakshatra,
    compute_sade_sati,
    compute_manglik,
    compute_lagna,
    compute_rashi,
)

# ── Import Synthesis Engines ──────────────────────────────────────────────────
try:
    from .bhrigu import run_bhrigu_analysis, bhrigu_to_dict
    BHRIGU_AVAILABLE = True
except Exception as e:
    print(f'[Synthesize] Bhrigu import failed: {e}')
    BHRIGU_AVAILABLE = False

try:
    from .confidence import (
        calculate_confidence, confidence_to_dict,
        extract_parashari_signals, extract_bhrigu_signals,
        extract_dasha_signals,
    )
    CONFIDENCE_AVAILABLE = True
except Exception as e:
    print(f'[Synthesize] Confidence import failed: {e}')
    CONFIDENCE_AVAILABLE = False

try:
    from .parashara import run_parashari_analysis, parashari_to_dict
    PARASHARA_AVAILABLE = True
except Exception as e:
    print(f'[Synthesize] Parashara import failed: {e}')
    PARASHARA_AVAILABLE = False

try:
    from .panchang import calculate_panchang, panchang_to_dict
    PANCHANG_AVAILABLE = True
except Exception as e:
    print(f'[Synthesize] Panchang import failed: {e}')
    PANCHANG_AVAILABLE = False

# ── App Setup ─────────────────────────────────────────────────────────────────

app = FastAPI(title="Trikal Vaani Ephemeris API", version="3.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://trikalvaani.com,https://www.trikalvaani.com,http://localhost:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=500)

# ── Input Models ──────────────────────────────────────────────────────────────

class BirthInput(BaseModel):
    year:         int   = Field(default=2000)
    month:        int   = Field(default=1)
    day:          int   = Field(default=1)
    hour:         int   = Field(default=12)
    minute:       int   = Field(default=0)
    second:       int   = Field(default=0)
    latitude:     float = Field(default=28.6)
    longitude:    float = Field(default=77.2)
    timezone:     float = Field(default=5.5)
    ayanamsa:     str   = Field(default="lahiri")
    house_system: str   = Field(default="P")

    class Config:
        extra = "allow"


class MatchingInput(BaseModel):
    person1: BirthInput = Field(default=...)
    person2: BirthInput = Field(default=...)


class SynthesizeInput(BaseModel):
    """Input for the full synthesis engine."""
    domainId:    str            = Field(...)
    birthData:   Dict[str, Any] = Field(...)
    kundaliData: Dict[str, Any] = Field(...)
    userContext: Dict[str, Any] = Field(default={})

    class Config:
        extra = "allow"


# ── Existing Endpoints (unchanged) ───────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "Trikal Vaani Ephemeris API v3.0"}


@app.get("/health")
def health():
    return {
        "status":               "healthy",
        "bhrigu_available":     BHRIGU_AVAILABLE,
        "parashara_available":  PARASHARA_AVAILABLE,
        "panchang_available":   PANCHANG_AVAILABLE,
        "confidence_available": CONFIDENCE_AVAILABLE,
    }


@app.post("/kundali")
def get_kundali(data: BirthInput):
    try:
        return compute_kundali(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/kundali-matching")
def get_matching(data: MatchingInput):
    try:
        return compute_kundali_matching(data.person1, data.person2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/dasha")
def get_dasha(data: BirthInput):
    try:
        return compute_dasha(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/nakshatra")
def get_nakshatra(data: BirthInput):
    try:
        return compute_nakshatra(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sade-sati")
def get_sade_sati(data: BirthInput):
    try:
        return compute_sade_sati(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/manglik-dosh")
def get_manglik(data: BirthInput):
    try:
        return compute_manglik(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/lagna")
def get_lagna(data: BirthInput):
    try:
        return compute_lagna(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rashi")
def get_rashi(data: BirthInput):
    try:
        return compute_rashi(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── NEW: /synthesize Endpoint ─────────────────────────────────────────────────

@app.post("/synthesize")
def synthesize(data: SynthesizeInput):
    """
    Main synthesis endpoint — runs all engines:
    1. Parashari Engine
    2. Bhrigu Engine
    3. Panchang Calculator
    4. Confidence Scoring (6-2-2 Model)

    Called by Vercel after /kundali returns planet data.
    Returns enriched JSON for Gemini prompt injection.
    """
    start_ms = _now_ms()

    try:
        domain_id    = data.domainId
        birth_data   = data.birthData
        kundali_data = data.kundaliData
        user_context = data.userContext

        # ── Extract planets ───────────────────────────────────────────────────
        planets     = _extract_planets(kundali_data)
        lagna       = kundali_data.get('lagna', {}).get('sign', 'Mesh')
        lagna_index = _rashi_to_index(lagna)
        dasha_data  = kundali_data.get('dasha', {})
        pratyantar_quality = dasha_data.get('pratyantar', {}).get('quality', 'Madhyam')

        # ── Engine 1: Parashari ───────────────────────────────────────────────
        parashari_result = _empty_parashari()
        if PARASHARA_AVAILABLE:
            try:
                raw              = run_parashari_analysis(planets, lagna, lagna_index)
                parashari_result = parashari_to_dict(raw)
                print(f'[Synthesize] Parashari OK — yogas: {parashari_result.get("totalActiveYogas", 0)}')
            except Exception as e:
                print(f'[Synthesize] Parashari error: {e}')

        # ── Engine 2: Bhrigu ──────────────────────────────────────────────────
        bhrigu_result = _empty_bhrigu()
        if BHRIGU_AVAILABLE:
            try:
                raw           = run_bhrigu_analysis(
                    planets=planets,
                    lagna=lagna,
                    lagna_index=lagna_index,
                    domain_id=domain_id,
                    dasha_quality=pratyantar_quality,
                )
                bhrigu_result = bhrigu_to_dict(raw)
                print(f'[Synthesize] Bhrigu OK — points: {bhrigu_result.get("bhrigu_points", 0)}')
            except Exception as e:
                print(f'[Synthesize] Bhrigu error: {e}')

        # ── Engine 3: Panchang ────────────────────────────────────────────────
        panchang_result = _empty_panchang()
        if PANCHANG_AVAILABLE:
            try:
                sun_lon  = _get_planet_longitude(kundali_data, 'Sun')
                moon_lon = _get_planet_longitude(kundali_data, 'Moon')
                lat      = float(birth_data.get('lat', 28.6139))
                lng      = float(birth_data.get('lng', 77.2090))

                raw             = calculate_panchang(
                    sun_longitude=sun_lon,
                    moon_longitude=moon_lon,
                    date=datetime.now(),
                    lat=lat,
                    lng=lng,
                )
                panchang_result = panchang_to_dict(raw)
                print(f'[Synthesize] Panchang OK — tithi: {panchang_result.get("tithi")}')
            except Exception as e:
                print(f'[Synthesize] Panchang error: {e}')

        # ── Engine 4: Confidence Scoring ──────────────────────────────────────
        confidence_result = _empty_confidence()
        if CONFIDENCE_AVAILABLE:
            try:
                para_signals  = extract_parashari_signals(parashari_result, domain_id)
                bhri_signals  = extract_bhrigu_signals(bhrigu_result)
                dasha_signals = extract_dasha_signals(dasha_data, domain_id)

                raw               = calculate_confidence(
                    parashari=para_signals,
                    bhrigu=bhri_signals,
                    dasha=dasha_signals,
                    domain_id=domain_id,
                    karmic_description=bhrigu_result.get('karmic_description', ''),
                )
                confidence_result = confidence_to_dict(raw)
                print(f'[Synthesize] Confidence OK — label: {confidence_result.get("label")}')
            except Exception as e:
                print(f'[Synthesize] Confidence error: {e}')

        # ── Build synthesis summary ───────────────────────────────────────────
        synthesis = _build_synthesis_summary(
            parashari_result,
            bhrigu_result,
            confidence_result,
            domain_id,
            pratyantar_quality,
        )

        processing_ms = _now_ms() - start_ms

        print(
            f'[Synthesize] COMPLETE | domain={domain_id} | '
            f'confidence={confidence_result.get("label")} | '
            f'ms={processing_ms}'
        )

        return {
            'status':        'success',
            'processing_ms': processing_ms,
            'enriched': {
                'parashara':  parashari_result,
                'bhrigu':     bhrigu_result,
                'panchang':   panchang_result,
                'confidence': confidence_result,
                'synthesis':  synthesis,
            },
        }

    except Exception as e:
        print(f'[Synthesize] UNHANDLED ERROR: {e}')
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ── SYNTHESIS HELPERS ─────────────────────────────────────────────────────────

def _build_synthesis_summary(
    parashari:     dict,
    bhrigu:        dict,
    confidence:    dict,
    domain_id:     str,
    dasha_quality: str,
) -> dict:

    parashari_strong = parashari.get('summary', {}).get('overallStrength') == 'strong'
    bhrigu_active    = bhrigu.get('bhrigu_points', 0) >= 1
    dasha_shubh      = dasha_quality == 'Shubh'

    agreement_items = []
    agreement_points = 0

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

    conflicts = []
    if confidence.get('conflict_detected'):
        conflicts.append(confidence.get('conflict_resolution', ''))

    gemini_note = _build_gemini_note(
        confidence.get('label', ''),
        confidence.get('karmic_marker', False),
        conflicts,
        dasha_quality,
    )

    return {
        'model':                '6-2-2 Ensemble',
        'agreement_points':     agreement_points,
        'agreement_items':      agreement_items,
        'parashari_active':     parashari_strong,
        'bhrigu_active':        bhrigu_active,
        'dasha_favorable':      dasha_shubh,
        'conflicts':            conflicts,
        'tie_breaker':          confidence.get('tie_breaker', ''),
        'confidence_label':     confidence.get('label', ''),
        'confidence_badge':     confidence.get('badge', ''),
        'karmic_marker':        confidence.get('karmic_marker', False),
        'karmic_text':          confidence.get('karmic_text', ''),
        'strong_planets':       parashari.get('summary', {}).get('strongPlanets', []),
        'weak_planets':         parashari.get('summary', {}).get('weakPlanets', []),
        'best_houses':          parashari.get('summary', {}).get('bestHouses', []),
        'challenged_houses':    parashari.get('summary', {}).get('challengedHouses', []),
        'primary_yoga':         parashari.get('summary', {}).get('primaryYoga', ''),
        'bhrigu_theme':         bhrigu.get('current_life_theme', ''),
        'bhrigu_domain_signals': bhrigu.get('domain_signals', []),
        'gemini_note':          gemini_note,
    }


def _build_gemini_note(
    confidence_label: str,
    karmic_marker:    bool,
    conflicts:        list,
    dasha_quality:    str,
) -> str:
    parts = [f'Confidence level is {confidence_label}.']

    if karmic_marker:
        parts.append(
            'Add subtle 🔱 Karmic Indicator — '
            'Bhrigu pattern strongly confirms this prediction.'
        )
    if conflicts:
        parts.append(
            'Conflict detected — use safe language: '
            '"favorable tendency" not "guaranteed outcome".'
        )
    if dasha_quality == 'Ashubh':
        parts.append(
            'Dasha is challenging — emphasize remedies over action windows.'
        )
    elif dasha_quality == 'Shubh':
        parts.append(
            'Dasha is favorable — emphasize action windows and concrete steps.'
        )

    return ' '.join(parts)


# ── DATA HELPERS ──────────────────────────────────────────────────────────────

RASHIS = [
    'Mesh', 'Vrishabh', 'Mithun', 'Kark', 'Simha', 'Kanya',
    'Tula', 'Vrischik', 'Dhanu', 'Makar', 'Kumbh', 'Meen'
]

def _rashi_to_index(rashi: str) -> int:
    return RASHIS.index(rashi) if rashi in RASHIS else 0

def _now_ms() -> int:
    return int(datetime.utcnow().timestamp() * 1000)

def _extract_planets(kundali_data: dict) -> dict:
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
    for g in kundali_data.get('grahas', []):
        if g.get('planet') == planet_name:
            return float(g.get('longitude', 0))
    return 0.0


# ── EMPTY FALLBACKS ───────────────────────────────────────────────────────────

def _empty_parashari() -> dict:
    return {
        'activeYogas': [], 'totalActiveYogas': 0,
        'ashtakavarga': [],
        'sarvashtakavarga': {'houseScores': [0]*12, 'strongHouses': [], 'weakHouses': []},
        'summary': {
            'strongPlanets': [], 'weakPlanets': [],
            'primaryYoga': None, 'overallStrength': 'moderate',
            'bestHouses': [], 'challengedHouses': [],
        },
    }

def _empty_bhrigu() -> dict:
    return {
        'jupiter_house': 0, 'bhrigu_points': 0,
        'karmic_indicator': False, 'karmic_description': '',
        'domain_signals': [], 'event_signatures': [],
        'current_life_theme': '', 'summary': 'Bhrigu unavailable',
    }

def _empty_panchang() -> dict:
    return {
        'vara': '', 'varaLord': '', 'tithi': '', 'tithiNumber': 0,
        'nakshatra': '', 'yoga': '', 'yogaType': 'Madhyam',
        'karana': '', 'rahuKaal': {'start': '', 'end': ''},
        'abhijeetMuhurta': {'start': '', 'end': ''},
        'choghadiya': {'name': '', 'type': 'Madhyam'},
        'sunrise': '', 'sunset': '', 'moonPhase': '',
    }

def _empty_confidence() -> dict:
    return {
        'label': 'Planetary Support Active',
        'badge': 'Moderate Confidence',
        'score': 60.0, 'flag': 'partial',
        'karmic_marker': False, 'karmic_text': '',
        'confidence_reason': 'Analysis in progress',
        'action_guidance': 'Proceed with measured action',
        'conflict_detected': False,
    }
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from template_engine import build_template, TemplateRequest, DOMAINS

@app.post("/template")
async def generate_template(req: TemplateRequest):
    try:
        result = build_template(domain=req.domain, kundali=req.kundaliData, session_id=req.sessionId, lang=req.lang)
        return {"success": True, "template": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/template/domains")
async def list_domains():
    from template_engine import DOMAIN_META
    return {"total": len(DOMAINS), "domains": [{"key": d, "label": DOMAIN_META[d]["label"]} for d in DOMAINS]}
