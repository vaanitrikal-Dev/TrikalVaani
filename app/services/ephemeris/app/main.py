"""
=============================================================
  TRIKAL VAANI — Swiss Ephemeris Vedic Astrology API
  File: app/main.py
  Author: Rohiit Gupta, Chief Vedic Architect
  Version: 2.2 — Final Fix
=============================================================
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field
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

app = FastAPI(title="Trikal Vaani Ephemeris API", version="2.2.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://trikalvaani.com,https://www.trikalvaani.com,http://localhost:3000",
).split(",")

app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS,
                   allow_credentials=True, allow_methods=["GET", "POST"], allow_headers=["*"])
app.add_middleware(GZipMiddleware, minimum_size=500)


class BirthInput(BaseModel):
    year: int = Field(default=2000)
    month: int = Field(default=1)
    day: int = Field(default=1)
    hour: int = Field(default=12)
    minute: int = Field(default=0)
    second: int = Field(default=0)
    latitude: float = Field(default=28.6)
    longitude: float = Field(default=77.2)
    timezone: float = Field(default=5.5)
    ayanamsa: str = Field(default="lahiri")
    house_system: str = Field(default="P")

    class Config:
        extra = "allow"


class MatchingInput(BaseModel):
    person1: BirthInput = Field(default=...)
    person2: BirthInput = Field(default=...)


@app.get("/")
def root():
    return {"status": "ok", "service": "Trikal Vaani Ephemeris API v2.2"}


@app.get("/health")
def health():
    return {"status": "healthy"}


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
