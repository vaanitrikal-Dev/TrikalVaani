"""
=============================================================
  TRIKAL VAANI — Vedic Astrology Computation Engine
  File: app/astro.py
  Author: Rohiit Gupta, Chief Vedic Architect
  Engine: pyswisseph (Swiss Ephemeris)
  VERSION: 2.0 — Shadbala wired into compute_kundali
=============================================================
"""

import swisseph as swe
import math
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

import os

EPHE_PATH = os.getenv("EPHE_PATH", "/app/ephe_data")
swe.set_ephe_path(EPHE_PATH)

# ── Import Shadbala ───────────────────────────────────────────────────────────
try:
    from .shadbala import calculate_shadbala, shadbala_to_dict, ShadbalaResult
    SHADBALA_AVAILABLE = True
except Exception as e:
    print(f'[Astro] Shadbala import failed: {e}')
    SHADBALA_AVAILABLE = False

# ── Constants ─────────────────────────────────────────────────────────────────

PLANETS = {
    "Sun":     swe.SUN,
    "Moon":    swe.MOON,
    "Mars":    swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus":   swe.VENUS,
    "Saturn":  swe.SATURN,
    "Rahu":    swe.MEAN_NODE,
    "Ketu":    None,
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

# Shadbala uses slightly different Rashi names (Sanskrit short form)
# Map from astro.py RASHIS to shadbala.py RASHIS
RASHI_MAP_TO_SHADBALA = {
    "Mesha": "Mesh", "Vrishabha": "Vrishabh", "Mithuna": "Mithun",
    "Karka": "Kark", "Simha": "Simha", "Kanya": "Kanya",
    "Tula": "Tula", "Vrishchika": "Vrischik", "Dhanu": "Dhanu",
    "Makara": "Makar", "Kumbha": "Kumbh", "Meena": "Meen"
}

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

DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10,
    "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}
DASHA_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
TOTAL_DASHA_YEARS = 120

MANGLIK_HOUSES = {1, 2, 4, 7, 8, 12}

# ── Utility ───────────────────────────────────────────────────────────────────

def _julian_day(year, month, day, hour, minute, second, tz_offset):
    ut_hour = hour + minute / 60.0 + second / 3600.0 - tz_offset
    return swe.julday(year, month, day, ut_hour)

def _set_ayanamsa(ayanamsa):
    swe.set_sid_mode(AYANAMSA_MAP.get(ayanamsa, swe.SIDM_LAHIRI))

def _sidereal_lon(jd, planet_id):
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    result, _ = swe.calc_ut(jd, planet_id, flags)
    lon   = result[0] % 360
    speed = result[3]
    return lon, speed < 0

def _lon_to_rashi(lon):
    return int(lon / 30) % 12

def _lon_to_nakshatra(lon):
    nak_index = int(lon / (360 / 27)) % 27
    remainder = lon % (360 / 27)
    pada = int(remainder / (360 / 27 / 4)) + 1
    return nak_index, min(pada, 4)

def _graha_dict(name, lon, retro):
    rashi_idx   = _lon_to_rashi(lon)
    nak_idx, pada = _lon_to_nakshatra(lon)
    deg_in_sign = lon % 30
    return {
        "planet":           name,
        "longitude":        round(lon, 4),
        "sign_index":       rashi_idx,
        "sign":             RASHIS[rashi_idx],
        "sign_en":          RASHI_EN[rashi_idx],
        "degree_in_sign":   round(deg_in_sign, 4),
        "nakshatra":        NAKSHATRAS[nak_idx],
        "nakshatra_index":  nak_idx,
        "nakshatra_lord":   NAKSHATRA_LORDS[nak_idx],
        "pada":             pada,
        "retrograde":       retro,
        "sign_lord":        RASHI_LORDS[rashi_idx],
        "strength":         50,  # placeholder — replaced by Shadbala below
    }

def _compute_bhavas(jd, lat, lon):
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    try:
        cusps_p, ascmc = swe.houses_ex(jd, lat, lon, b'P', flags)
        lagna_lon = ascmc[0] % 360
    except Exception:
        cusps_p, ascmc = swe.houses_ex(jd, lat, lon, b'W', flags)
        lagna_lon = ascmc[0] % 360

    lagna_sign_idx = int(lagna_lon / 30)
    bhavas = []
    for i in range(12):
        sign_idx = (lagna_sign_idx + i) % 12
        cusp_lon = sign_idx * 30.0
        bhavas.append({
            "bhava":      i + 1,
            "cusp_longitude": round(cusp_lon, 4),
            "sign":       RASHIS[sign_idx],
            "sign_en":    RASHI_EN[sign_idx],
            "sign_lord":  RASHI_LORDS[sign_idx],
        })
    return bhavas, lagna_lon

def _assign_house(planet_lon, cusps):
    lagna_sign_idx  = int(cusps[0] / 30) % 12
    planet_sign_idx = int(planet_lon / 30) % 12
    return ((planet_sign_idx - lagna_sign_idx) % 12) + 1

def _all_planets(jd):
    grahas   = []
    rahu_lon = None
    for name, pid in PLANETS.items():
        if name == "Ketu":
            continue
        lon, retro = _sidereal_lon(jd, pid)
        if name == "Rahu":
            rahu_lon = lon
        grahas.append(_graha_dict(name, lon, retro))
    if rahu_lon is not None:
        ketu_lon = (rahu_lon + 180) % 360
        grahas.append(_graha_dict("Ketu", ketu_lon, False))
    return grahas

def _vimshottari(moon_lon, birth_jd):
    nak_idx, _       = _lon_to_nakshatra(moon_lon)
    ruling_planet    = NAKSHATRA_LORDS[nak_idx]
    nak_span         = 360 / 27
    lon_in_nak       = moon_lon % nak_span
    fraction_elapsed = lon_in_nak / nak_span
    start_idx        = DASHA_SEQUENCE.index(ruling_planet)
    years_elapsed    = DASHA_YEARS[ruling_planet] * fraction_elapsed
    years_remaining  = DASHA_YEARS[ruling_planet] * (1 - fraction_elapsed)

    birth_dt   = swe.jdut1_to_utc(birth_jd, swe.GREG_CAL)
    birth_date = datetime(birth_dt[0], birth_dt[1], birth_dt[2])
    maha_dashas = []
    current_date = birth_date - timedelta(days=years_elapsed * 365.25)
    today = datetime.utcnow()

    for i in range(9):
        idx    = (start_idx + i) % 9
        planet = DASHA_SEQUENCE[idx]
        years  = DASHA_YEARS[planet] if i > 0 else years_remaining
        if i == 0:
            end_date = birth_date + timedelta(days=years_remaining * 365.25)
        else:
            end_date = current_date + timedelta(days=DASHA_YEARS[planet] * 365.25)

        is_current  = (current_date <= today <= end_date)
        antar_dashas = []
        antar_start  = current_date

        for j in range(9):
            antar_idx    = (idx + j) % 9
            antar_planet = DASHA_SEQUENCE[antar_idx]
            antar_years  = (DASHA_YEARS[planet] * DASHA_YEARS[antar_planet]) / TOTAL_DASHA_YEARS
            antar_end    = antar_start + timedelta(days=antar_years * 365.25)
            antar_is_cur = is_current and (antar_start <= today <= antar_end)

            pratyantar_dashas = []
            prat_start = antar_start
            for k in range(9):
                prat_idx    = (antar_idx + k) % 9
                prat_planet = DASHA_SEQUENCE[prat_idx]
                prat_days   = (DASHA_YEARS[planet] * DASHA_YEARS[antar_planet] * DASHA_YEARS[prat_planet]) / (TOTAL_DASHA_YEARS ** 2) * 365.25
                prat_end    = prat_start + timedelta(days=prat_days)
                pratyantar_dashas.append({
                    "planet":     prat_planet,
                    "start":      prat_start.strftime("%Y-%m-%d"),
                    "end":        prat_end.strftime("%Y-%m-%d"),
                    "is_current": antar_is_cur and (prat_start <= today <= prat_end),
                })
                prat_start = prat_end

            antar_dashas.append({
                "planet":     antar_planet,
                "start":      antar_start.strftime("%Y-%m-%d"),
                "end":        antar_end.strftime("%Y-%m-%d"),
                "is_current": antar_is_cur,
                "pratyantar": pratyantar_dashas,
            })
            antar_start = antar_end

        maha_dashas.append({
            "planet":     planet,
            "start":      current_date.strftime("%Y-%m-%d"),
            "end":        end_date.strftime("%Y-%m-%d"),
            "years":      round(DASHA_YEARS[planet] if i > 0 else years_remaining, 2),
            "is_current": is_current,
            "antar":      antar_dashas,
        })
        current_date = end_date

    return {"maha_dasha": maha_dashas}

def _detect_yogas(grahas, bhavas):
    yogas      = []
    planet_map = {g["planet"]: g for g in grahas}
    moon    = planet_map.get("Moon")
    jupiter = planet_map.get("Jupiter")

    if moon and jupiter:
        moon_house = moon.get("house", 1)
        jup_house  = jupiter.get("house", 1)
        diff = abs(jup_house - moon_house)
        if diff in {0, 3, 6, 9}:
            yogas.append({"name": "Gajakesari Yoga", "present": True,
                          "description": "Jupiter in kendra from Moon"})

    if moon:
        mh         = moon.get("house", 1)
        surrounding = {((mh - 2) % 12) + 1, (mh % 12) + 1}
        planet_houses = {g["house"] for g in grahas if g["planet"] not in ("Rahu", "Ketu", "Moon")}
        if not surrounding & planet_houses:
            yogas.append({"name": "Kemadruma Yoga", "present": True,
                          "description": "No planets flanking Moon"})

    return yogas

def _compute_saturn_transits_for_rashi(moon_rashi):
    cycles   = []
    jd_start = swe.julday(1950, 1, 1, 0)
    jd_end   = swe.julday(2080, 1, 1, 0)
    step     = 30
    prev_in_sati = False
    cycle_start  = None
    phase_rashis = {(moon_rashi - 1) % 12, moon_rashi % 12, (moon_rashi + 1) % 12}

    jd = jd_start
    while jd < jd_end:
        sat_lon, _ = _sidereal_lon(jd, swe.SATURN)
        sat_rashi  = _lon_to_rashi(sat_lon)
        in_sati    = sat_rashi in phase_rashis

        if in_sati and not prev_in_sati:
            cycle_start = jd
        elif not in_sati and prev_in_sati and cycle_start:
            y1, m1, d1, _ = swe.revjul(cycle_start)
            y2, m2, d2, _ = swe.revjul(jd)
            cycles.append({
                "start": f"{int(y1)}-{int(m1):02d}-{int(d1):02d}",
                "end":   f"{int(y2)}-{int(m2):02d}-{int(d2):02d}",
                "type":  "Sade Sati",
            })
            cycle_start = None

        prev_in_sati = in_sati
        jd += step

    return cycles

# ── Paksha Bala helper ────────────────────────────────────────────────────────

def _get_paksha_bala(jd: float) -> tuple:
    """Returns (is_day_birth_approx, paksha_bala 0-30)."""
    # Get Sun and Moon longitudes for tithi
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    sun_result,  _ = swe.calc_ut(jd, swe.SUN,  flags)
    moon_result, _ = swe.calc_ut(jd, swe.MOON, flags)
    sun_lon  = sun_result[0]  % 360
    moon_lon = moon_result[0] % 360

    # Tithi = angular distance Moon-Sun / 12 (each tithi = 12 degrees)
    diff    = (moon_lon - sun_lon + 360) % 360
    tithi   = int(diff / 12) + 1  # 1-30

    # Shukla Paksha = tithi 1-15, Krishna = 16-30
    shukla = tithi <= 15
    if shukla:
        paksha_bala = (tithi / 15) * 30  # 0→30 during Shukla
    else:
        paksha_bala = ((30 - tithi) / 15) * 30  # 30→0 during Krishna

    # is_day_birth: sun above horizon = day
    # Simplified: 6am-6pm = day (true computation needs lat/lon/sunrise)
    hour_ut = (jd - int(jd)) * 24
    is_day  = 6 <= hour_ut <= 18

    return is_day, paksha_bala

# ── Main Public Functions ─────────────────────────────────────────────────────

def compute_kundali(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)

    grahas = _all_planets(jd)
    bhavas, lagna_lon = _compute_bhavas(jd, data.latitude, data.longitude)

    cusp_lons = [b["cusp_longitude"] for b in bhavas]
    for g in grahas:
        g["house"] = _assign_house(g["longitude"], cusp_lons)

    # ── SHADBALA INTEGRATION ──────────────────────────────────────────────────
    # Replace flat "50" strength with real Shadbala-based strength
    lagna_rashi_idx = int(lagna_lon / 30) % 12
    shadbala_data   = {}

    if SHADBALA_AVAILABLE:
        try:
            is_day, paksha_bala = _get_paksha_bala(jd)

            # Build graha list with Shadbala-compatible rashi names
            shadbala_grahas = []
            for g in grahas:
                sg = dict(g)
                # Map rashi name to Shadbala convention
                sg['sign']   = RASHI_MAP_TO_SHADBALA.get(g['sign'], g['sign'])
                sg['rashi']  = sg['sign']
                sg['siderealLongitude'] = g['longitude']
                sg['isRetrograde']      = g['retrograde']
                sg['degree']            = g['degree_in_sign']
                shadbala_grahas.append(sg)

            shadbala_results = calculate_shadbala(
                grahas=shadbala_grahas,
                lagna=RASHI_MAP_TO_SHADBALA.get(RASHIS[lagna_rashi_idx], RASHIS[lagna_rashi_idx]),
                lagna_index=lagna_rashi_idx,
                birth_jd=jd,
                is_day_birth=is_day,
                paksha_bala=paksha_bala,
            )

            # Update grahas with real strength
            for g in grahas:
                planet_name = g['planet']
                if planet_name in shadbala_results:
                    sb = shadbala_results[planet_name]
                    g['strength']        = sb.strength_percent
                    g['shadbala']        = {
                        'total':          sb.total_shadbala,
                        'minimum':        sb.minimum_required,
                        'ratio':          sb.strength_ratio,
                        'classification': sb.classification,
                        'isStrong':       sb.is_strong,
                        'breakdown': {
                            'sthana':     sb.sthana_bala,
                            'dig':        sb.dig_bala,
                            'kala':       sb.kala_bala,
                            'cheshta':    sb.cheshta_bala,
                            'naisargika': sb.naisargika_bala,
                            'drik':       sb.drik_bala,
                        }
                    }
                elif planet_name in ['Rahu', 'Ketu']:
                    # Rahu/Ketu — no Shadbala, use contextual strength
                    g['strength'] = 50

            shadbala_data = shadbala_to_dict(shadbala_results)
            print(f'[Astro] Shadbala OK — {len(shadbala_results)} planets calculated')

        except Exception as e:
            print(f'[Astro] Shadbala failed (non-fatal): {e}')
            # Keep default strength = 50

    # ── Continue with rest of kundali ─────────────────────────────────────────
    moon_data = next(g for g in grahas if g["planet"] == "Moon")
    dasha     = _vimshottari(moon_data["longitude"], jd)
    yogas     = _detect_yogas(grahas, bhavas)

    lagna_rashi = _lon_to_rashi(lagna_lon)
    nak_idx, pada = _lon_to_nakshatra(lagna_lon)

    return {
        "meta": {
            "ayanamsa":          data.ayanamsa,
            "birth_jd":          round(jd, 6),
            "shadbala_available": SHADBALA_AVAILABLE,
        },
        "lagna": {
            "longitude":      round(lagna_lon, 4),
            "sign":           RASHIS[lagna_rashi],
            "sign_en":        RASHI_EN[lagna_rashi],
            "sign_lord":      RASHI_LORDS[lagna_rashi],
            "degree_in_sign": round(lagna_lon % 30, 4),
            "nakshatra":      NAKSHATRAS[nak_idx],
            "pada":           pada,
        },
        "grahas":    grahas,       # now has real Shadbala strength
        "bhavas":    bhavas,
        "dasha":     dasha,
        "yogas":     yogas,
        "shadbala":  shadbala_data,  # full Shadbala breakdown
    }


# ── All other functions unchanged from original ───────────────────────────────

def compute_kundali_matching(p1, p2) -> Dict:
    _set_ayanamsa(p1.ayanamsa)
    jd1 = _julian_day(p1.year, p1.month, p1.day, p1.hour, p1.minute, p1.second, p1.timezone)
    jd2 = _julian_day(p2.year, p2.month, p2.day, p2.hour, p2.minute, p2.second, p2.timezone)
    moon1_lon, _ = _sidereal_lon(jd1, swe.MOON)
    moon2_lon, _ = _sidereal_lon(jd2, swe.MOON)
    nak1, _ = _lon_to_nakshatra(moon1_lon)
    nak2, _ = _lon_to_nakshatra(moon2_lon)
    rashi1  = _lon_to_rashi(moon1_lon)
    rashi2  = _lon_to_rashi(moon2_lon)
    nadi_dosham   = NAKSHATRA_GANA[nak1] == NAKSHATRA_GANA[nak2]
    bhakoot_dosham = RASHI_LORDS[rashi1] == RASHI_LORDS[rashi2]
    scores = {
        "Varna": 1 if (rashi1 % 4 <= rashi2 % 4) else 0,
        "Vashya": 1,
        "Tara": 3 if abs(nak1 - nak2) % 9 in {0, 2, 4, 6, 8} else 0,
        "Yoni": 2,
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
        "doshas": {"nadi_dosha": nadi_dosham, "bhakoot_dosha": bhakoot_dosham},
        "verdict": (
            "Excellent" if total >= 28 else
            "Good"      if total >= 21 else
            "Average"   if total >= 18 else
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
        "nakshatra": NAKSHATRAS[nak_idx], "nakshatra_index": nak_idx,
        "pada": pada, "lord": NAKSHATRA_LORDS[nak_idx],
        "gana": NAKSHATRA_GANA[nak_idx], "rashi": RASHIS[rashi_idx],
        "rashi_en": RASHI_EN[rashi_idx], "rashi_lord": RASHI_LORDS[rashi_idx],
        "moon_longitude": round(moon_lon, 4), "element": RASHI_ELEMENT[rashi_idx],
    }

def compute_sade_sati(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)
    moon_lon, _ = _sidereal_lon(jd, swe.MOON)
    moon_rashi  = _lon_to_rashi(moon_lon)
    cycles  = _compute_saturn_transits_for_rashi(moon_rashi)
    today   = datetime.utcnow().strftime("%Y-%m-%d")
    current = next((c for c in cycles if c["start"] <= today <= c["end"]), None)
    return {
        "moon_rashi": RASHIS[moon_rashi], "cycles": cycles,
        "currently_in_sade_sati": current is not None, "current_cycle": current,
    }

def compute_manglik(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)
    temp_bhavas, lagna_lon_m = _compute_bhavas(jd, data.latitude, data.longitude)
    cusp_lons  = [b["cusp_longitude"] for b in temp_bhavas]
    mars_lon, _ = _sidereal_lon(jd, swe.MARS)
    mars_house  = _assign_house(mars_lon, cusp_lons)
    is_manglik  = mars_house in MANGLIK_HOUSES
    mars_rashi  = _lon_to_rashi(mars_lon)
    cancellation = []
    if mars_rashi in {0, 3, 7}:
        cancellation.append("Mars in own/friendly sign — dosha reduced")
    lagna_rashi = _lon_to_rashi(lagna_lon_m)
    if lagna_rashi == 0:
        cancellation.append("Aries Lagna — Manglik dosha cancelled")
    severity = "None"
    if is_manglik:
        severity = "High" if not cancellation else "Partial"
    return {
        "mars_house": mars_house, "mars_sign": RASHIS[mars_rashi],
        "mars_longitude": round(mars_lon, 4), "is_manglik": is_manglik,
        "severity": severity, "cancellation_conditions": cancellation,
        "manglik_houses_affected": list(MANGLIK_HOUSES),
    }

def compute_lagna(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)
    flags = swe.FLG_SIDEREAL | swe.FLG_SWIEPH
    try:
        _, ascmc = swe.houses_ex(jd, data.latitude, data.longitude, b'P', flags)
        lagna_lon = ascmc[0] % 360
    except Exception:
        _, ascmc = swe.houses_ex(jd, data.latitude, data.longitude, b'W', flags)
        lagna_lon = ascmc[0] % 360
    lagna_rashi = _lon_to_rashi(lagna_lon)
    nak_idx, pada = _lon_to_nakshatra(lagna_lon)
    moon_lon, _ = _sidereal_lon(jd, swe.MOON)
    chandra_rashi = _lon_to_rashi(moon_lon)
    sun_lon, _ = _sidereal_lon(jd, swe.SUN)
    surya_rashi = _lon_to_rashi(sun_lon)
    return {
        "lagna": {
            "longitude": round(lagna_lon, 4), "degree_in_sign": round(lagna_lon % 30, 4),
            "sign": RASHIS[lagna_rashi], "sign_en": RASHI_EN[lagna_rashi],
            "sign_lord": RASHI_LORDS[lagna_rashi], "nakshatra": NAKSHATRAS[nak_idx],
            "pada": pada, "element": RASHI_ELEMENT[lagna_rashi],
            "quality": RASHI_QUALITY[lagna_rashi],
        },
        "chandra_lagna": {"sign": RASHIS[chandra_rashi], "sign_lord": RASHI_LORDS[chandra_rashi]},
        "surya_lagna":   {"sign": RASHIS[surya_rashi],   "sign_lord": RASHI_LORDS[surya_rashi]},
    }

def compute_rashi(data) -> Dict:
    _set_ayanamsa(data.ayanamsa)
    jd = _julian_day(data.year, data.month, data.day,
                     data.hour, data.minute, data.second, data.timezone)
    moon_lon, retro = _sidereal_lon(jd, swe.MOON)
    rashi_idx = _lon_to_rashi(moon_lon)
    nak_idx, pada = _lon_to_nakshatra(moon_lon)
    return {
        "rashi": RASHIS[rashi_idx], "rashi_en": RASHI_EN[rashi_idx],
        "rashi_index": rashi_idx, "lord": RASHI_LORDS[rashi_idx],
        "element": RASHI_ELEMENT[rashi_idx], "quality": RASHI_QUALITY[rashi_idx],
        "moon_longitude": round(moon_lon, 4), "moon_nakshatra": NAKSHATRAS[nak_idx],
        "moon_pada": pada,
        "compatible_rashis": [RASHIS[(rashi_idx + offset) % 12] for offset in [2, 4, 6, 10]],
    }
