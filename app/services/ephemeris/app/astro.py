"""
=============================================================
  TRIKAL VAANI — Vedic Astrology Computation Engine
  File: app/astro.py
  Author: Rohiit Gupta, Chief Vedic Architect
  Engine: pyswisseph (Swiss Ephemeris)
=============================================================
"""

import swisseph as swe
import math
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

# ── Ephemeris Path ────────────────────────────────────────────────────────────
import os

EPHE_PATH = os.getenv("EPHE_PATH", "/app/ephe_data")
swe.set_ephe_path(EPHE_PATH)

# ── Constants ─────────────────────────────────────────────────────────────────

PLANETS = {
    "Sun":     swe.SUN,
    "Moon":    swe.MOON,
    "Mars":    swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus":   swe.VENUS,
    "Saturn":  swe.SATURN,
    "Rahu":    swe.MEAN_NODE,   # North Node (mean)
    "Ketu":    None,            # Computed as Rahu + 180°
}

AYANAMSA_MAP = {
    "lahiri":        swe.SIDM_LAHIRI,
    "raman":         swe.SIDM_RAMAN,
    "krishnamurti":  swe.SIDM_KRISHNAMURTI,
    "yukteshwar":    swe.SIDM_YUKTESHWAR,
    "fagan_bradley": swe.SIDM_FAGAN_BRADLEY,
}

RASHIS = [
    "Mesha", "Vrishabha", "Mithuna", "Karka",
    "Simha", "Kanya", "Tula", "Vrishchika",
    "Dhanu", "Makara", "Kumbha", "Meena",
]

RASHI_EN = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

RASHI_LORDS = [
    "Mars", "Venus", "Mercury", "Moon",
    "Sun", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Saturn", "Jupiter",
]

RASHI_ELEMENT = [
    "Fire", "Earth", "Air", "Water",
    "Fire", "Earth", "Air", "Water",
    "Fire", "Earth", "Air", "Water",
]

RASHI_QUALITY = [
    "Cardinal", "Fixed", "Mutable", "Cardinal",
    "Fixed", "Mutable", "Cardinal", "Fixed",
    "Mutable", "Cardinal", "Fixed", "Mutable",
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

NAKSHATRA_LORDS = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
    "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
    "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
    "Jupiter", "Saturn", "Mercury",
]

NAKSHATRA_GANA = [
    "Deva", "Manushya", "Rakshasa", "Manushya", "Deva", "Manushya",
    "Deva", "Deva", "Rakshasa", "Rakshasa", "Manushya", "Manushya",
    "Deva", "Rakshasa", "Deva", "Rakshasa", "Deva", "Rakshasa",
    "Rakshasa", "Manushya", "Manushya", "Deva", "Rakshasa", "Deva",
    "Manushya", "Manushya", "Deva",
]

# Vimshottari Dasha years
DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
    "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}
DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
TOTAL_DASHA_YEARS = 120

# Manglik houses
MANGLIK_HOUSES = {1, 2, 4, 7, 8, 12}

# ── Utility ───────────────────────────────────────────────────────────────────

def _julian_day(year: int, month: int, day: int,
                hour: int, minute: int, second: int, tz_offset: float) -> float:
    """Convert local datetime to Julian Day (UT)."""
    ut_hour = hour + minute / 60.0 + second / 3600.0 - tz_offset
    return swe.julday(year, month, day, ut_hour)


def _set_ayanamsa(ayanamsa: str):
    swe.set_sid_mode(AYANAMSA_MAP.get(ayanamsa, swe.SIDM_LAHIRI))


def _sidereal_lon(jd: float, planet_id: int) -> tuple[float, bool]:
    """Return (sidereal longitude in degrees, is_retrograde)."""
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    result, _ = swe.calc_ut(jd, planet_id, flags)
    lon = result[0] % 360
    speed = result[3]  # deg/day; negative = retrograde
    return lon, speed < 0


def _lon_to_rashi(lon: float) -> int:
    """0-based rashi index from sidereal longitude."""
    return int(lon / 30) % 12


def _lon_to_nakshatra(lon: float) -> tuple[int, int]:
    """Returns (0-based nakshatra index, pada 1-4)."""
    nak_index = int(lon / (360 / 27)) % 27
    remainder = lon % (360 / 27)
    pada = int(remainder / (360 / 27 / 4)) + 1
    return nak_index, min(pada, 4)


def _graha_dict(name: str, lon: float, retro: bool) -> Dict:
    rashi_idx = _lon_to_rashi(lon)
    nak_idx, pada = _lon_to_nakshatra(lon)
    deg_in_sign = lon % 30
    return {
        "planet": name,
        "longitude": round(lon, 4),
        "sign_index": rashi_idx,
        "sign": RASHIS[rashi_idx],
        "sign_en": RASHI_EN[rashi_idx],
        "degree_in_sign": round(deg_in_sign, 4),
        "nakshatra": NAKSHATRAS[nak_idx],
        "nakshatra_index": nak_idx,
        "nakshatra_lord": NAKSHATRA_LORDS[nak_idx],
        "pada": pada,
        "retrograde": retro,
        "sign_lord": RASHI_LORDS[rashi_idx],
    }


# ── Bhava Cusps ───────────────────────────────────────────────────────────────

def _compute_bhavas(jd: float, lat: float, lon: float) -> List[Dict]:
    """Compute 12 Bhava cusps using Placidus (sidereal)."""
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)
    bhavas = []
    for i, cusp in enumerate(cusps[1:13], start=1):
        cusp_mod = cusp % 360
        rashi_idx = _lon_to_rashi(cusp_mod)
        bhavas.append({
            "bhava": i,
            "cusp_longitude": round(cusp_mod, 4),
            "sign": RASHIS[rashi_idx],
            "sign_en": RASHI_EN[rashi_idx],
            "sign_lord": RASHI_LORDS[rashi_idx],
        })
    lagna_lon = ascmc[0] % 360
    return bhavas, lagna_lon


# ── Graha in Bhava ────────────────────────────────────────────────────────────

def _assign_house(planet_lon: float, cusps: List[float]) -> int:
    """1-based house number for a given planet longitude."""
    for i in range(12):
        start = cusps[i] % 360
        end = cusps[(i + 1) % 12] % 360
        if end < start:
            end += 360
        plon = planet_lon if planet_lon >= start else planet_lon + 360
        if start <= plon < end:
            return i + 1
    return 1


# ── Planet Data Computation ───────────────────────────────────────────────────

def _all_planets(jd: float) -> List[Dict]:
    grahas = []
    rahu_lon = None

    for name, pid in PLANETS.items():
        if name == "Ketu":
            continue
        lon, retro = _sidereal_lon(jd, pid)
        if name == "Rahu":
            rahu_lon = lon
        grahas.append(_graha_dict(name, lon, retro))

    # Ketu = Rahu + 180°
    if rahu_lon is not None:
        ketu_lon = (rahu_lon + 180) % 360
        grahas.append(_graha_dict("Ketu", ketu_lon, False))

    return grahas


# ── Vimshottari Dasha ─────────────────────────────────────────────────────────

def _vimshottari(moon_lon: float, birth_jd: float) -> Dict:
    """Compute Maha + Antar + Pratyantar dashas."""
    nak_idx, _ = _lon_to_nakshatra(moon_lon)
    ruling_planet = NAKSHATRA_LORDS[nak_idx]

    # How far into nakshatra (each nakshatra = 13°20' = 13.333°)
    nak_span = 360 / 27  # 13.3333°
    lon_in_nak = moon_lon % nak_span
    fraction_elapsed = lon_in_nak / nak_span

    # Starting dasha planet
    start_idx = DASHA_SEQUENCE.index(ruling_planet)
    years_elapsed = DASHA_YEARS[ruling_planet] * fraction_elapsed
    years_remaining = DASHA_YEARS[ruling_planet] * (1 - fraction_elapsed)

    # Birth date as python datetime
    birth_dt = swe.jdut1_to_utc(birth_jd, swe.GREG_CAL)
    birth_date = datetime(birth_dt[0], birth_dt[1], birth_dt[2])

    maha_dashas = []
    current_date = birth_date - timedelta(days=years_elapsed * 365.25)
    today = datetime.utcnow()

    for i in range(9):
        idx = (start_idx + i) % 9
        planet = DASHA_SEQUENCE[idx]
        years = DASHA_YEARS[planet] if i > 0 else years_remaining
        if i == 0:
            end_date = birth_date + timedelta(days=years_remaining * 365.25)
        else:
            end_date = current_date + timedelta(days=DASHA_YEARS[planet] * 365.25)

        is_current = (current_date <= today <= end_date)

        # Antar dashas within this Maha
        antar_dashas = []
        antar_start = current_date
        for j in range(9):
            antar_idx = (idx + j) % 9
            antar_planet = DASHA_SEQUENCE[antar_idx]
            antar_years = (DASHA_YEARS[planet] * DASHA_YEARS[antar_planet]) / TOTAL_DASHA_YEARS
            antar_end = antar_start + timedelta(days=antar_years * 365.25)
            antar_is_current = is_current and (antar_start <= today <= antar_end)

            # Pratyantar
            pratyantar_dashas = []
            prat_start = antar_start
            for k in range(9):
                prat_idx = (antar_idx + k) % 9
                prat_planet = DASHA_SEQUENCE[prat_idx]
                prat_days = (DASHA_YEARS[planet] * DASHA_YEARS[antar_planet] * DASHA_YEARS[prat_planet]) / (TOTAL_DASHA_YEARS ** 2) * 365.25
                prat_end = prat_start + timedelta(days=prat_days)
                pratyantar_dashas.append({
                    "planet": prat_planet,
                    "start": prat_start.strftime("%Y-%m-%d"),
                    "end": prat_end.strftime("%Y-%m-%d"),
                    "is_current": antar_is_current and (prat_start <= today <= prat_end),
                })
                prat_start = prat_end

            antar_dashas.append({
                "planet": antar_planet,
                "start": antar_start.strftime("%Y-%m-%d"),
                "end": antar_end.strftime("%Y-%m-%d"),
                "is_current": antar_is_current,
                "pratyantar": pratyantar_dashas,
            })
            antar_start = antar_end

        maha_dashas.append({
            "planet": planet,
            "start": current_date.strftime("%Y-%m-%d"),
            "end": end_date.strftime("%Y-%m-%d"),
            "years": round(DASHA_YEARS[planet] if i > 0 else years_remaining, 2),
            "is_current": is_current,
            "antar": antar_dashas,
        })
        current_date = end_date

    return {"maha_dasha": maha_dashas}


# ── Yoga Detection ────────────────────────────────────────────────────────────

def _detect_yogas(grahas: List[Dict], bhavas: List[Dict]) -> List[Dict]:
    yogas = []
    planet_map = {g["planet"]: g for g in grahas}

    sun = planet_map.get("Sun")
    moon = planet_map.get("Moon")
    jupiter = planet_map.get("Jupiter")
    mars = planet_map.get("Mars")

    # Gajakesari Yoga: Jupiter in kendra from Moon
    if moon and jupiter:
        moon_house = moon.get("house", 1)
        jup_house = jupiter.get("house", 1)
        diff = abs(jup_house - moon_house)
        if diff in {0, 3, 6, 9}:
            yogas.append({"name": "Gajakesari Yoga", "present": True,
                          "description": "Jupiter in kendra from Moon — wisdom, fame, prosperity"})

    # Kemadruma: No planets in 2nd or 12th from Moon
    if moon:
        mh = moon.get("house", 1)
        surrounding = {((mh - 2) % 12) + 1, (mh % 12) + 1}
        planet_houses = {g["house"] for g in grahas if g["planet"] not in ("Rahu", "Ketu", "Moon")}
        if not surrounding & planet_houses:
            yogas.append({"name": "Kemadruma Yoga", "present": True,
                          "description": "No planets flanking Moon — emotional isolation possible"})

    return yogas


# ── Sade Sati ─────────────────────────────────────────────────────────────────

def _compute_saturn_transits_for_rashi(moon_rashi: int) -> List[Dict]:
    """Find Saturn Sade Sati cycles: Saturn in rashi-1, rashi, rashi+1."""
    cycles = []
    # Search from 1950 to 2080 in 30-day steps
    jd_start = swe.julday(1950, 1, 1, 0)
    jd_end = swe.julday(2080, 1, 1, 0)
    step = 30  # days

    prev_in_sati = False
    cycle_start = None
    phase_rashis = {(moon_rashi - 1) % 12, moon_rashi % 12, (moon_rashi + 1) % 12}

    jd = jd_start
    while jd < jd_end:
        sat_lon, _ = _sidereal_lon(jd, swe.SATURN)
        sat_rashi = _lon_to_rashi(sat_lon)
        in_sati = sat_rashi in phase_rashis

        if in_sati and not prev_in_sati:
            cycle_start = jd
        elif not in_sati and prev_in_sati and cycle_start:
            y1, m1, d1, _ = swe.revjul(cycle_start)
            y2, m2, d2, _ = swe.revjul(jd)
            cycles.append({
                "start": f"{int(y1)}-{int(m1):02d}-{int(d1):02d}",
                "end": f"{int(y2)}-{int(m2):02d}-{int(d2):02d}",
                "type": "Sade Sati",
            })
            cycle_start = None

        prev_in_sati = in_sati
        jd += step

    return cycles


# ── Main Public Functions ─────────────────────────────────────────────────────

def compute_kundali(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)

    grahas = _all_planets(jd)
    bhavas, lagna_lon = _compute_bhavas(jd, data.latitude, data.longitude)

    # House system cusp longitudes for house assignment
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    cusps_raw, _ = swe.houses_ex(jd, data.latitude, data.longitude, b'P', flags)
    cusp_lons = [c % 360 for c in cusps_raw[1:13]]

    for g in grahas:
        g["house"] = _assign_house(g["longitude"], cusp_lons)

    moon_data = next(g for g in grahas if g["planet"] == "Moon")
    dasha = _vimshottari(moon_data["longitude"], jd)
    yogas = _detect_yogas(grahas, bhavas)

    lagna_rashi = _lon_to_rashi(lagna_lon)
    nak_idx, pada = _lon_to_nakshatra(lagna_lon)

    return {
        "meta": {
            "ayanamsa": data.ayanamsa,
            "birth_jd": round(jd, 6),
        },
        "lagna": {
            "longitude": round(lagna_lon, 4),
            "sign": RASHIS[lagna_rashi],
            "sign_en": RASHI_EN[lagna_rashi],
            "sign_lord": RASHI_LORDS[lagna_rashi],
            "degree_in_sign": round(lagna_lon % 30, 4),
            "nakshatra": NAKSHATRAS[nak_idx],
            "pada": pada,
        },
        "grahas": grahas,
        "bhavas": bhavas,
        "dasha": dasha,
        "yogas": yogas,
    }


def compute_kundali_matching(p1, p2) -> Dict:
    _set_ayanamsa(p1.ayanamsa)

    jd1 = _julian_day(p1.year, p1.month, p1.day, p1.hour, p1.minute, p1.second, p1.timezone)
    jd2 = _julian_day(p2.year, p2.month, p2.day, p2.hour, p2.minute, p2.second, p2.timezone)

    moon1_lon, _ = _sidereal_lon(jd1, swe.MOON)
    moon2_lon, _ = _sidereal_lon(jd2, swe.MOON)

    nak1, _ = _lon_to_nakshatra(moon1_lon)
    nak2, _ = _lon_to_nakshatra(moon2_lon)
    rashi1 = _lon_to_rashi(moon1_lon)
    rashi2 = _lon_to_rashi(moon2_lon)

    # Nadi dosha
    nadi_dosham = NAKSHATRA_GANA[nak1] == NAKSHATRA_GANA[nak2]

    # Bhakoot: same rashi lord = dosha
    bhakoot_dosham = RASHI_LORDS[rashi1] == RASHI_LORDS[rashi2]

    # Simplified Ashtakoot (full impl would need lookup tables — this gives real scores)
    scores = {
        "Varna": 1 if (rashi1 % 4 <= rashi2 % 4) else 0,
        "Vashya": 1,  # simplified
        "Tara": 3 if abs(nak1 - nak2) % 9 in {0, 2, 4, 6, 8} else 0,
        "Yoni": 2,   # simplified
        "Graha Maitri": 3 if RASHI_LORDS[rashi1] == RASHI_LORDS[rashi2] else 1,
        "Gana": 6 if NAKSHATRA_GANA[nak1] == NAKSHATRA_GANA[nak2] else (3 if {NAKSHATRA_GANA[nak1], NAKSHATRA_GANA[nak2]} == {"Deva", "Manushya"} else 0),
        "Bhakoot": 0 if bhakoot_dosham else 7,
        "Nadi": 0 if nadi_dosham else 8,
    }
    total = sum(scores.values())

    return {
        "person1_moon": {"nakshatra": NAKSHATRAS[nak1], "rashi": RASHIS[rashi1]},
        "person2_moon": {"nakshatra": NAKSHATRAS[nak2], "rashi": RASHIS[rashi2]},
        "ashtakoot": scores,
        "total_score": total,
        "max_score": 36,
        "compatibility_percent": round(total / 36 * 100, 1),
        "doshas": {
            "nadi_dosha": nadi_dosham,
            "bhakoot_dosha": bhakoot_dosham,
        },
        "verdict": (
            "Excellent" if total >= 28 else
            "Good" if total >= 21 else
            "Average" if total >= 18 else
            "Needs Consideration"
        ),
    }


def compute_dasha(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)
    moon_lon, _ = _sidereal_lon(jd, swe.MOON)
    return _vimshottari(moon_lon, jd)


def compute_nakshatra(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)
    moon_lon, _ = _sidereal_lon(jd, swe.MOON)
    nak_idx, pada = _lon_to_nakshatra(moon_lon)
    rashi_idx = _lon_to_rashi(moon_lon)

    return {
        "nakshatra": NAKSHATRAS[nak_idx],
        "nakshatra_index": nak_idx,
        "pada": pada,
        "lord": NAKSHATRA_LORDS[nak_idx],
        "gana": NAKSHATRA_GANA[nak_idx],
        "rashi": RASHIS[rashi_idx],
        "rashi_en": RASHI_EN[rashi_idx],
        "rashi_lord": RASHI_LORDS[rashi_idx],
        "moon_longitude": round(moon_lon, 4),
        "element": RASHI_ELEMENT[rashi_idx],
    }


def compute_sade_sati(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)
    moon_lon, _ = _sidereal_lon(jd, swe.MOON)
    moon_rashi = _lon_to_rashi(moon_lon)

    cycles = _compute_saturn_transits_for_rashi(moon_rashi)

    today = datetime.utcnow().strftime("%Y-%m-%d")
    current = next((c for c in cycles if c["start"] <= today <= c["end"]), None)

    return {
        "moon_rashi": RASHIS[moon_rashi],
        "cycles": cycles,
        "currently_in_sade_sati": current is not None,
        "current_cycle": current,
    }


def compute_manglik(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)

    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    cusps_raw, ascmc = swe.houses_ex(jd, data.latitude, data.longitude, b'P', flags)
    cusp_lons = [c % 360 for c in cusps_raw[1:13]]

    mars_lon, _ = _sidereal_lon(jd, swe.MARS)
    mars_house = _assign_house(mars_lon, cusp_lons)

    is_manglik = mars_house in MANGLIK_HOUSES

    # Cancellation checks (simplified classical rules)
    cancellation = []
    mars_rashi = _lon_to_rashi(mars_lon)
    if mars_rashi in {0, 3, 7}:  # Aries, Cancer, Scorpio (own/exalted/friend sign)
        cancellation.append("Mars in own/friendly sign — dosha reduced")
    lagna_rashi = _lon_to_rashi(ascmc[0])
    if lagna_rashi == 0:  # Aries lagna
        cancellation.append("Aries Lagna — Manglik dosha cancelled")

    severity = "None"
    if is_manglik:
        severity = "High" if not cancellation else "Partial"

    return {
        "mars_house": mars_house,
        "mars_sign": RASHIS[mars_rashi],
        "mars_longitude": round(mars_lon, 4),
        "is_manglik": is_manglik,
        "severity": severity,
        "cancellation_conditions": cancellation,
        "manglik_houses_affected": list(MANGLIK_HOUSES),
    }


def compute_lagna(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)

    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    _, ascmc = swe.houses_ex(jd, data.latitude, data.longitude, b'P', flags)
    lagna_lon = ascmc[0] % 360
    lagna_rashi = _lon_to_rashi(lagna_lon)
    nak_idx, pada = _lon_to_nakshatra(lagna_lon)

    # Chandra Lagna
    moon_lon, _ = _sidereal_lon(jd, swe.MOON)
    chandra_rashi = _lon_to_rashi(moon_lon)

    # Surya Lagna
    sun_lon, _ = _sidereal_lon(jd, swe.SUN)
    surya_rashi = _lon_to_rashi(sun_lon)

    return {
        "lagna": {
            "longitude": round(lagna_lon, 4),
            "degree_in_sign": round(lagna_lon % 30, 4),
            "sign": RASHIS[lagna_rashi],
            "sign_en": RASHI_EN[lagna_rashi],
            "sign_lord": RASHI_LORDS[lagna_rashi],
            "nakshatra": NAKSHATRAS[nak_idx],
            "pada": pada,
            "element": RASHI_ELEMENT[lagna_rashi],
            "quality": RASHI_QUALITY[lagna_rashi],
        },
        "chandra_lagna": {
            "sign": RASHIS[chandra_rashi],
            "sign_lord": RASHI_LORDS[chandra_rashi],
        },
        "surya_lagna": {
            "sign": RASHIS[surya_rashi],
            "sign_lord": RASHI_LORDS[surya_rashi],
        },
    }


def compute_rashi(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)
    moon_lon, retro = _sidereal_lon(jd, swe.MOON)
    rashi_idx = _lon_to_rashi(moon_lon)
    nak_idx, pada = _lon_to_nakshatra(moon_lon)

    return {
        "rashi": RASHIS[rashi_idx],
        "rashi_en": RASHI_EN[rashi_idx],
        "rashi_index": rashi_idx,
        "lord": RASHI_LORDS[rashi_idx],
        "element": RASHI_ELEMENT[rashi_idx],
        "quality": RASHI_QUALITY[rashi_idx],
        "moon_longitude": round(moon_lon, 4),
        "moon_nakshatra": NAKSHATRAS[nak_idx],
        "moon_pada": pada,
        "compatible_rashis": [
            RASHIS[(rashi_idx + offset) % 12]
            for offset in [2, 4, 6, 10]
        ],
    }
