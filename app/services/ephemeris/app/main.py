"""
=============================================================
  TRIKAL VAANI — Swiss Ephemeris Vedic Astrology API
  File: app/main.py
  Author: Rohiit Gupta, Chief Vedic Architect
  Service: Render (Python FastAPI)
  Replaces: Prokerala API dependency
=============================================================
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, validator
from typing import Optional
import os

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

# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Trikal Vaani — Vedic Ephemeris API",
    description="Swiss Ephemeris-powered Vedic Astrology backend",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────

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

# ── API Key Guard ─────────────────────────────────────────────────────────────

API_KEY = os.getenv("TRIKAL_API_KEY", "")


def verify_api_key(x_api_key: str = None):
    """Optional key guard — set TRIKAL_API_KEY env var to enable."""
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")


# ── Shared Input Schema ───────────────────────────────────────────────────────

class BirthInput(BaseModel):
    """Standard birth data payload — matches BirthForm field names exactly."""
    # Core birth fields
    year: int
    month: int       # 1–12
    day: int         # 1–31
    hour: int        # 0–23
    minute: int      # 0–59
    second: int = 0

    # Location
    latitude: float
    longitude: float
    timezone: float  # UTC offset, e.g. 5.5 for IST

    # Optional
    ayanamsa: str = "lahiri"   # lahiri | raman | krishnamurti | yukteshwar
    house_system: str = "P"    # P=Placidus, W=Whole, E=Equal (for Western fallback)

    @validator("month")
    def valid_month(cls, v):
        assert 1 <= v <= 12, "month must be 1–12"
        return v

    @validator("day")
    def valid_day(cls, v):
        assert 1 <= v <= 31, "day must be 1–31"
        return v

    @validator("hour")
    def valid_hour(cls, v):
        assert 0 <= v <= 23, "hour must be 0–23"
        return v

    @validator("minute")
    def valid_minute(cls, v):
        assert 0 <= v <= 59, "minute must be 0–59"
        return v

    @validator("ayanamsa")
    def valid_ayanamsa(cls, v):
        allowed = {"lahiri", "raman", "krishnamurti", "yukteshwar", "fagan_bradley"}
        assert v.lower() in allowed, f"ayanamsa must be one of {allowed}"
        return v.lower()


class MatchingInput(BaseModel):
    person1: BirthInput
    person2: BirthInput


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "Trikal Vaani Ephemeris API v2.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}


# ── Kundali (Full Chart) ──────────────────────────────────────────────────────

@app.post("/kundali", tags=["Kundali"])
def get_kundali(data: BirthInput, _=Depends(verify_api_key)):
    """
    Returns full Vedic birth chart:
    - All 9 Graha positions (degrees, sign, nakshatra, pada, retrograde)
    - Lagna (Ascendant)
    - 12 Bhava cusps
    - Vimshottari Dasha sequence
    - Yoga detection (Raj, Dhana, Kemadruma, Gajakesari, etc.)
    """
    try:
        return compute_kundali(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Kundali Matching (Ashtakoot) ─────────────────────────────────────────────

@app.post("/kundali-matching", tags=["Matching"])
def get_matching(data: MatchingInput, _=Depends(verify_api_key)):
    """
    Ashtakoot Gun Milan:
    - Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi
    - Total score out of 36
    - Dosha flags: Manglik, Nadi Dosha
    """
    try:
        return compute_kundali_matching(data.person1, data.person2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Dasha ─────────────────────────────────────────────────────────────────────

@app.post("/dasha", tags=["Dasha"])
def get_dasha(data: BirthInput, _=Depends(verify_api_key)):
    """
    Vimshottari Dasha periods:
    - Maha Dasha, Antar Dasha, Pratyantar Dasha
    - Start/end dates for each period
    - Current running dasha highlighted
    """
    try:
        return compute_dasha(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Nakshatra ─────────────────────────────────────────────────────────────────

@app.post("/nakshatra", tags=["Nakshatra"])
def get_nakshatra(data: BirthInput, _=Depends(verify_api_key)):
    """
    Janma Nakshatra details:
    - Nakshatra name, pada, lord
    - Charan, Gana, Yoni, Guna
    - Rashi, Rashi lord
    """
    try:
        return compute_nakshatra(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Sade Sati ─────────────────────────────────────────────────────────────────

@app.post("/sade-sati", tags=["Sade Sati"])
def get_sade_sati(data: BirthInput, _=Depends(verify_api_key)):
    """
    Shani Sade Sati & Dhaiya:
    - Past, current, future Sade Sati cycles
    - Peak period identification
    - Dhaiya (2.5 year) periods
    - Remedies flag
    """
    try:
        return compute_sade_sati(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Manglik Dosh ──────────────────────────────────────────────────────────────

@app.post("/manglik-dosh", tags=["Dosha"])
def get_manglik(data: BirthInput, _=Depends(verify_api_key)):
    """
    Manglik Dosha analysis:
    - Is native Manglik? (full / partial / non-Manglik)
    - Mars house position (1, 2, 4, 7, 8, 12)
    - Cancellation conditions checked
    - Severity level
    """
    try:
        return compute_manglik(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Lagna ─────────────────────────────────────────────────────────────────────

@app.post("/lagna", tags=["Lagna"])
def get_lagna(data: BirthInput, _=Depends(verify_api_key)):
    """
    Ascendant (Lagna) calculation:
    - Lagna sign, degree, lord
    - Chandra Lagna, Surya Lagna
    - Navamsa Lagna
    """
    try:
        return compute_lagna(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Rashi ─────────────────────────────────────────────────────────────────────

@app.post("/rashi", tags=["Rashi"])
def get_rashi(data: BirthInput, _=Depends(verify_api_key)):
    """
    Moon sign (Janma Rashi) details:
    - Rashi name, element, quality, lord
    - Chandra position in degrees
    - Compatible rashis
    """
    try:
        return compute_rashi(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
