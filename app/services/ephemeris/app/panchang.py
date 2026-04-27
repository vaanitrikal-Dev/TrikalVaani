"""
================================================================
TRIKAL VAANI — Panchang Calculator (Python)
CEO: Rohiit Gupta | Chief Vedic Architect
File: app/panchang.py
Version: 1.0 | Date: 2026-04-28
JAI MAA SHAKTI

Python translation of lib/panchang.ts
Runs on Render alongside Swiss Ephemeris.

Calculates from Sun + Moon sidereal longitudes:
  Tithi, Vara, Nakshatra, Yoga (27 Nitya),
  Karana, Rahu Kaal, Abhijeet Muhurta,
  Choghadiya, Yamaghanta, Guli Kaal,
  Sunrise/Sunset, Moon Phase, Paksha
================================================================
"""

from dataclasses import dataclass
from datetime import datetime
import math


# ── CONSTANTS ─────────────────────────────────────────────────────────────────

TITHIS = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya',
]

NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
    'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
    'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
    'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati',
]

NAKSHATRA_LORDS = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter',
    'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
    'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun',
    'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury',
]

NITYA_YOGAS = [
    ('Vishkambha', 'Ashubh'),  ('Priti',     'Shubh'),
    ('Ayushman',   'Shubh'),   ('Saubhagya', 'Shubh'),
    ('Shobhana',   'Shubh'),   ('Atiganda',  'Ashubh'),
    ('Sukarma',    'Shubh'),   ('Dhriti',    'Shubh'),
    ('Shula',      'Ashubh'),  ('Ganda',     'Ashubh'),
    ('Vriddhi',    'Shubh'),   ('Dhruva',    'Shubh'),
    ('Vyaghata',   'Ashubh'),  ('Harshana',  'Shubh'),
    ('Vajra',      'Ashubh'),  ('Siddhi',    'Shubh'),
    ('Vyatipata',  'Ashubh'),  ('Variyana',  'Madhyam'),
    ('Parigha',    'Ashubh'),  ('Shiva',     'Shubh'),
    ('Siddha',     'Shubh'),   ('Sadhya',    'Shubh'),
    ('Shubha',     'Shubh'),   ('Shukla',    'Shubh'),
    ('Brahma',     'Shubh'),   ('Indra',     'Shubh'),
    ('Vaidhriti',  'Ashubh'),
]

KARANAS = [
    'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara',
    'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna',
]

VARA_NAMES  = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar']
VARA_LORDS  = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

# Rahu Kaal period by day (1-indexed, out of 8 day periods from sunrise)
RAHU_KAAL_PERIOD = [8, 2, 7, 5, 6, 4, 3]  # Sun=8, Mon=2, Tue=7...

# Choghadiya day sequence
CHOGHADIYA_DAY = [
    ('Udveg',  'Ashubh'),   ('Char',   'Madhyam'),
    ('Labh',   'Shubh'),    ('Amrit',  'Shubh'),
    ('Kaal',   'Ashubh'),   ('Shubh',  'Shubh'),
    ('Rog',    'Ashubh'),   ('Udveg',  'Ashubh'),
]

YAMAGHANTA_ORDER = [5, 4, 3, 2, 1, 0, 6]
GULI_ORDER       = [6, 5, 4, 3, 2, 1, 0]


# ── DATA CLASS ────────────────────────────────────────────────────────────────

@dataclass
class PanchangData:
    vara:             str
    vara_lord:        str
    tithi:            str
    tithi_number:     int
    tithi_paksha:     str   # 'Shukla' | 'Krishna'
    nakshatra:        str
    nakshatra_lord:   str
    yoga:             str
    yoga_type:        str   # 'Shubh' | 'Ashubh' | 'Madhyam'
    karana:           str
    rahu_kaal:        dict  # {start, end, avoid}
    abhijeet_muhurta: dict  # {start, end}
    choghadiya:       dict  # {name, type}
    yamaghanta:       dict  # {start, end}
    guli_kaal:        dict  # {start, end}
    sunrise:          str
    sunset:           str
    moon_phase:       str
    paksha:           str   # 'Shukla Paksha' | 'Krishna Paksha'
    is_amavasya:      bool
    is_purnima:       bool


# ── MAIN FUNCTION ─────────────────────────────────────────────────────────────

def calculate_panchang(
    sun_longitude:  float,
    moon_longitude: float,
    date:           datetime,
    lat:            float = 28.6139,
    lng:            float = 77.2090,
) -> PanchangData:
    """Calculate complete Panchang from Sun + Moon sidereal longitudes."""

    # ── Vara ──────────────────────────────────────────────────────────────────
    day_of_week = date.weekday()  # 0=Mon in Python, need 0=Sun
    # Convert: Python Mon=0 → Astro Sun=0
    day_of_week = (date.weekday() + 1) % 7  # 0=Sun, 1=Mon...
    vara      = VARA_NAMES[day_of_week]
    vara_lord = VARA_LORDS[day_of_week]

    # ── Tithi ─────────────────────────────────────────────────────────────────
    elongation = moon_longitude - sun_longitude
    if elongation < 0:
        elongation += 360

    tithi_num    = int(elongation / 12) + 1  # 1-30
    tithi_index  = (tithi_num - 1) % 15
    is_purnima   = tithi_num == 15
    is_amavasya  = tithi_num == 30
    paksha       = 'Shukla Paksha' if tithi_num <= 15 else 'Krishna Paksha'
    tithi_paksha = 'Shukla' if tithi_num <= 15 else 'Krishna'

    if tithi_num == 15:
        tithi_name = 'Purnima'
    elif tithi_num == 30:
        tithi_name = 'Amavasya'
    else:
        tithi_name = TITHIS[tithi_index]

    # ── Nakshatra ─────────────────────────────────────────────────────────────
    naks_index    = int(moon_longitude / (360 / 27)) % 27
    nakshatra     = NAKSHATRAS[naks_index]
    nakshatra_lord = NAKSHATRA_LORDS[naks_index]

    # ── Nitya Yoga ────────────────────────────────────────────────────────────
    yoga_value = ((sun_longitude + moon_longitude) % 360) / (360 / 27)
    yoga_index = int(yoga_value) % 27
    yoga_name, yoga_type = NITYA_YOGAS[yoga_index]

    # ── Karana ────────────────────────────────────────────────────────────────
    karana_num   = int(elongation / 6)
    karana_index = karana_num % 11
    karana       = KARANAS[karana_index]

    # ── Sunrise / Sunset ──────────────────────────────────────────────────────
    sunrise_min, sunset_min = _approximate_sunrise_sunset(date, lat, lng)

    # ── Day duration and period length ────────────────────────────────────────
    day_duration  = sunset_min - sunrise_min
    period_length = day_duration / 8

    # ── Rahu Kaal ─────────────────────────────────────────────────────────────
    rahu_period = RAHU_KAAL_PERIOD[day_of_week] - 1  # 0-indexed
    rahu_start  = sunrise_min + rahu_period * period_length
    rahu_end    = rahu_start + period_length

    rahu_kaal = {
        'start': _minutes_to_time(rahu_start),
        'end':   _minutes_to_time(rahu_end),
        'avoid': 'Avoid starting new work, travel, or investments during Rahu Kaal',
    }

    # ── Abhijeet Muhurta ──────────────────────────────────────────────────────
    noon          = (sunrise_min + sunset_min) / 2
    abhi_start    = noon - 24
    abhi_end      = noon + 24

    abhijeet_muhurta = {
        'start': _minutes_to_time(abhi_start),
        'end':   _minutes_to_time(abhi_end),
    }

    # ── Choghadiya ────────────────────────────────────────────────────────────
    now_minutes = date.hour * 60 + date.minute
    chog_index  = max(0, min(7, int((now_minutes - sunrise_min) / period_length)))
    chog_name, chog_type = CHOGHADIYA_DAY[chog_index]

    choghadiya = {'name': chog_name, 'type': chog_type}

    # ── Yamaghanta ────────────────────────────────────────────────────────────
    yama_period = YAMAGHANTA_ORDER[day_of_week]
    yama_start  = sunrise_min + yama_period * period_length
    yama_end    = yama_start + period_length

    yamaghanta = {
        'start': _minutes_to_time(yama_start),
        'end':   _minutes_to_time(yama_end),
    }

    # ── Guli Kaal ─────────────────────────────────────────────────────────────
    guli_period = GULI_ORDER[day_of_week]
    guli_start  = sunrise_min + guli_period * period_length
    guli_end    = guli_start + period_length

    guli_kaal = {
        'start': _minutes_to_time(guli_start),
        'end':   _minutes_to_time(guli_end),
    }

    # ── Moon Phase ────────────────────────────────────────────────────────────
    moon_phase = _get_moon_phase(elongation)

    return PanchangData(
        vara=vara,
        vara_lord=vara_lord,
        tithi=tithi_name,
        tithi_number=tithi_num,
        tithi_paksha=tithi_paksha,
        nakshatra=nakshatra,
        nakshatra_lord=nakshatra_lord,
        yoga=yoga_name,
        yoga_type=yoga_type,
        karana=karana,
        rahu_kaal=rahu_kaal,
        abhijeet_muhurta=abhijeet_muhurta,
        choghadiya=choghadiya,
        yamaghanta=yamaghanta,
        guli_kaal=guli_kaal,
        sunrise=_minutes_to_time(sunrise_min),
        sunset=_minutes_to_time(sunset_min),
        moon_phase=moon_phase,
        paksha=paksha,
        is_amavasya=is_amavasya,
        is_purnima=is_purnima,
    )


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _approximate_sunrise_sunset(
    date: datetime,
    lat:  float,
    lng:  float,
) -> tuple:
    """Approximate sunrise/sunset in minutes from midnight (IST)."""

    day_of_year  = date.timetuple().tm_yday
    declination  = 23.45 * math.sin(math.radians((360 / 365) * (day_of_year - 81)))
    lat_rad      = math.radians(lat)
    decl_rad     = math.radians(declination)
    cos_h        = -math.tan(lat_rad) * math.tan(decl_rad)
    cos_h        = max(-1, min(1, cos_h))
    hour_angle   = math.degrees(math.acos(cos_h))

    utc_offset   = lng / 15
    IST_OFFSET   = 5.5

    sunrise_utc  = 12 - hour_angle / 15
    sunset_utc   = 12 + hour_angle / 15

    sunrise_min  = round((sunrise_utc + IST_OFFSET - utc_offset) * 60)
    sunset_min   = round((sunset_utc  + IST_OFFSET - utc_offset) * 60)

    return sunrise_min, sunset_min


def _minutes_to_time(minutes: float) -> str:
    """Convert minutes from midnight to HH:MM AM/PM string."""
    total = int(minutes) % (24 * 60)
    h     = total // 60
    m     = total % 60
    ampm  = 'PM' if h >= 12 else 'AM'
    hour  = h - 12 if h > 12 else (12 if h == 0 else h)
    return f'{hour}:{m:02d} {ampm}'


def _get_moon_phase(elongation: float) -> str:
    """Get moon phase name from Sun-Moon elongation."""
    if elongation < 45:   return 'Waxing Crescent'
    if elongation < 90:   return 'First Quarter'
    if elongation < 135:  return 'Waxing Gibbous'
    if elongation < 180:  return 'Full Moon'
    if elongation < 225:  return 'Waning Gibbous'
    if elongation < 270:  return 'Last Quarter'
    if elongation < 315:  return 'Waning Crescent'
    return 'New Moon'


# ── SERIALIZER ────────────────────────────────────────────────────────────────

def panchang_to_dict(p: PanchangData) -> dict:
    """Convert PanchangData to JSON-serializable dict."""
    return {
        'vara':             p.vara,
        'varaLord':         p.vara_lord,
        'tithi':            p.tithi,
        'tithiNumber':      p.tithi_number,
        'tithiPaksha':      p.tithi_paksha,
        'nakshatra':        p.nakshatra,
        'nakshatraLord':    p.nakshatra_lord,
        'yoga':             p.yoga,
        'yogaType':         p.yoga_type,
        'karana':           p.karana,
        'rahuKaal':         p.rahu_kaal,
        'abhijeetMuhurta':  p.abhijeet_muhurta,
        'choghadiya':       p.choghadiya,
        'yamaghanta':       p.yamaghanta,
        'guliKaal':         p.guli_kaal,
        'sunrise':          p.sunrise,
        'sunset':           p.sunset,
        'moonPhase':        p.moon_phase,
        'paksha':           p.paksha,
        'isAmavasya':       p.is_amavasya,
        'isPurnima':        p.is_purnima,
    }
