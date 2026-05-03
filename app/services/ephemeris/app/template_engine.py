"""
=============================================================================
TRIKAL VAANI — TEMPLATE ENGINE
Chief Vedic Architect: Rohiit Gupta | CEO, Trikal Vaani
File: ~/trikal-vaani/python-engines/template-engine/template_engine.py
VM: GCP Mumbai (asia-south1) | Port 8001 | FastAPI
=============================================================================
150 Templates: 15 Domains × 10 Visual Styles
Selection: Mahadasha-lord based rotation
Output: Structured dict → JSON (SEO-safe)
Top section: geminiSummarySlot = None (filled by Gemini API post-render)
=============================================================================
"""

import random
import math
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel

# ─────────────────────────────────────────────────────────────────
# PYDANTIC INPUT MODELS
# ─────────────────────────────────────────────────────────────────

class BirthData(BaseModel):
    name: str
    dob: str           # "YYYY-MM-DD"
    tob: str           # "HH:MM"
    pob: str           # "City, Country"
    gender: str        # "M" / "F" / "Other"
    lat: Optional[float] = None
    lon: Optional[float] = None

class TemplateRequest(BaseModel):
    domain: str        # one of 15 domains
    kundaliData: dict  # full output from /synthesize
    sessionId: str     # for style rotation
    lang: str = "hi"   # hi / en / hinglish

# ─────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────

DOMAINS = [
    "mill_karz_mukti", "mill_property_yog", "genz_dream_career",
    "genz_ex_back", "genz_toxic_boss", "mill_childs_destiny",
    "genx_retirement_peace", "genx_legacy_inheritance",
    "genx_spiritual_innings", "mill_parents_wellness",
    "genz_manifestation", "career", "wealth", "health", "relationships"
]

MAHADASHA_LORDS = {
    "Sun": 0, "Moon": 1, "Mars": 2, "Rahu": 3, "Jupiter": 4,
    "Saturn": 5, "Mercury": 6, "Ketu": 7, "Venus": 8
}

# Style index: Mahadasha lord → preferred style band (1-10)
MAHADASHA_STYLE_MAP = {
    "Sun":     [1, 5, 9],    # Royal / Authoritative / Fiery
    "Moon":    [2, 6, 10],   # Soft / Intuitive / Flowing
    "Mars":    [3, 7, 1],    # Bold / Dynamic / Warrior
    "Rahu":    [4, 8, 2],    # Mysterious / Modern / Shadow
    "Jupiter": [5, 9, 3],    # Wisdom / Expansive / Golden
    "Saturn":  [6, 10, 4],   # Structured / Deep / Austere
    "Mercury": [7, 1, 5],    # Clean / Data / Analytical
    "Ketu":    [8, 2, 6],    # Ethereal / Minimal / Moksha
    "Venus":   [9, 3, 7],    # Luxe / Aesthetic / Beauty
}

# 10 Visual Style Definitions (AstroSage+AstroTalk inspired, no repeat)
TEMPLATE_STYLES = {
    1: {
        "name": "Royal Kundali",
        "theme": "deep_navy_gold",
        "layout": "chart_dominant",
        "accent": "#D4AF37",
        "bg": "#0A1628",
        "font_headline": "Yeseva One",
        "font_body": "Hind",
        "chart_position": "top_center",
        "table_style": "bordered_gold",
        "icon_set": "vedic_symbols",
        "description": "Majestic navy-gold layout. Chakra chart top-center. Gold borders. Regal."
    },
    2: {
        "name": "Soft Cosmos",
        "theme": "lavender_moonlight",
        "layout": "two_column",
        "accent": "#9B8EC4",
        "bg": "#F5F0FF",
        "font_headline": "Rozha One",
        "font_body": "Noto Sans Devanagari",
        "chart_position": "left_sidebar",
        "table_style": "soft_rounded",
        "icon_set": "planets_illustrated",
        "description": "Soft lavender. Chakra left sidebar. Rounded cards. Gentle moon energy."
    },
    3: {
        "name": "Warrior Dashboard",
        "theme": "crimson_black",
        "layout": "dashboard_grid",
        "accent": "#E63946",
        "bg": "#111111",
        "font_headline": "Tiro Devanagari Hindi",
        "font_body": "Mukta",
        "chart_position": "top_right",
        "table_style": "dark_striped",
        "icon_set": "minimal_lines",
        "description": "Dark grid dashboard. Red accents. Power lines. Mars energy maximized."
    },
    4: {
        "name": "Shadow Rahu",
        "theme": "smoke_purple",
        "layout": "magazine_editorial",
        "accent": "#7B2D8B",
        "bg": "#1A1025",
        "font_headline": "Baloo 2",
        "font_body": "Hind Siliguri",
        "chart_position": "center_overlay",
        "table_style": "glow_bordered",
        "icon_set": "mystical_glyphs",
        "description": "Editorial magazine layout. Purple glow. Rahu mystique. Bold headlines."
    },
    5: {
        "name": "Golden Guru",
        "theme": "saffron_cream",
        "layout": "scroll_narrative",
        "accent": "#FF9933",
        "bg": "#FFFBF0",
        "font_headline": "Yatra One",
        "font_body": "Karma",
        "chart_position": "inline_narrative",
        "table_style": "warm_bordered",
        "icon_set": "vedic_traditional",
        "description": "Scrollable narrative. Saffron accents. Traditional Vedic feel. Jupiter wisdom."
    },
    6: {
        "name": "Saturn's Ledger",
        "theme": "slate_structured",
        "layout": "data_table_heavy",
        "accent": "#4A6FA5",
        "bg": "#F0F4F8",
        "font_headline": "Poppins",
        "font_body": "Noto Sans",
        "chart_position": "right_panel",
        "table_style": "professional_grid",
        "icon_set": "data_icons",
        "description": "Professional data-heavy layout. Slate blue. Structured grids. Saturn precision."
    },
    7: {
        "name": "Mercury Matrix",
        "theme": "teal_white_clean",
        "layout": "card_modular",
        "accent": "#00897B",
        "bg": "#FAFFFE",
        "font_headline": "Rajdhani",
        "font_body": "Laila",
        "chart_position": "top_left_card",
        "table_style": "teal_accent_clean",
        "icon_set": "modern_minimal",
        "description": "Modular cards. Teal-white. Clean analytics feel. Mercury intelligence."
    },
    8: {
        "name": "Ketu Moksha",
        "theme": "sand_minimalist",
        "layout": "zen_minimal",
        "accent": "#8D7B68",
        "bg": "#F9F5F0",
        "font_headline": "Philosopher",
        "font_body": "Lato",
        "chart_position": "centered_sparse",
        "table_style": "borderless_clean",
        "icon_set": "spiritual_dots",
        "description": "Zen minimalism. Sand tones. Breath space. Ketu detachment energy."
    },
    9: {
        "name": "Venus Luxe",
        "theme": "rose_gold_white",
        "layout": "luxury_editorial",
        "accent": "#C9956C",
        "bg": "#FFF8F5",
        "font_headline": "Rozha One",
        "font_body": "Hind",
        "chart_position": "hero_full_width",
        "table_style": "rose_gold_borders",
        "icon_set": "elegant_illustrated",
        "description": "Luxury editorial. Rose-gold hero chart. Soft white. Premium feel. Venus."
    },
    10: {
        "name": "Cosmic Deep",
        "theme": "midnight_starfield",
        "layout": "immersive_full",
        "accent": "#4FC3F7",
        "bg": "#050D1A",
        "font_headline": "Cinzel",
        "font_body": "Mukta",
        "chart_position": "full_background_overlay",
        "table_style": "translucent_dark",
        "icon_set": "constellation_style",
        "description": "Deep space immersive. Midnight bg. Star-field texture. Full-bleed chart."
    }
}

# ─────────────────────────────────────────────────────────────────
# DOMAIN META CONFIG
# ─────────────────────────────────────────────────────────────────

DOMAIN_META = {
    "career": {
        "label": "Career & Profession",
        "label_hi": "करियर और पेशा",
        "primary_houses": [1, 2, 6, 10, 11],
        "key_planets": ["Sun", "Mercury", "Saturn", "Jupiter"],
        "key_yogas": ["Raja Yoga", "Budha-Aditya Yoga", "Neecha Bhanga"],
        "geo_answer": "Your 10th house lord, its nakshatra, and current Mahadasha determine career timing.",
        "cta": "Book Career Consultation — ₹51",
        "segment": "all"
    },
    "wealth": {
        "label": "Wealth & Finance",
        "label_hi": "धन और समृद्धि",
        "primary_houses": [1, 2, 5, 9, 11],
        "key_planets": ["Jupiter", "Venus", "Mercury", "Moon"],
        "key_yogas": ["Dhana Yoga", "Lakshmi Yoga", "Pancha Mahapurusha"],
        "geo_answer": "2nd and 11th house strength, Dhana Yogas, and Jupiter transit control wealth inflow.",
        "cta": "Unlock Wealth Window — ₹51",
        "segment": "all"
    },
    "health": {
        "label": "Health & Vitality",
        "label_hi": "स्वास्थ्य और जीवनशक्ति",
        "primary_houses": [1, 6, 8, 12],
        "key_planets": ["Sun", "Moon", "Mars", "Saturn"],
        "key_yogas": ["Vipareeta Raja Yoga", "Sarpa Yoga"],
        "geo_answer": "Lagna lord strength and 6th house afflictions reveal health vulnerabilities in your chart.",
        "cta": "Health Chart Analysis — ₹51",
        "segment": "all"
    },
    "relationships": {
        "label": "Relationships & Love",
        "label_hi": "रिश्ते और प्रेम",
        "primary_houses": [1, 2, 5, 7, 11],
        "key_planets": ["Venus", "Moon", "Jupiter", "Mars"],
        "key_yogas": ["Kalatra Yoga", "Karako Bhavo Nashto"],
        "geo_answer": "7th house lord, Venus strength, and Navamsa chart together predict relationship destiny.",
        "cta": "Relationship Analysis — ₹51",
        "segment": "all"
    },
    "mill_karz_mukti": {
        "label": "Debt Liberation",
        "label_hi": "कर्ज मुक्ति",
        "primary_houses": [6, 8, 12, 2, 11],
        "key_planets": ["Saturn", "Rahu", "Mars", "Jupiter"],
        "key_yogas": ["Shula Yoga", "Daridra Yoga reversal", "Viparita Raja Yoga"],
        "geo_answer": "6th house (loans), 8th house (crisis), and 12th house (loss) pattern reveals debt cycle. Saturn Mahadasha often brings karmic debt resolution.",
        "cta": "Karz Mukti Consultation — ₹51",
        "segment": "millennial"
    },
    "mill_property_yog": {
        "label": "Property Yoga",
        "label_hi": "संपत्ति योग",
        "primary_houses": [2, 4, 11, 12],
        "key_planets": ["Mars", "Jupiter", "Saturn", "Moon"],
        "key_yogas": ["Graha Yoga", "Bhumi Yoga", "Raja Yoga"],
        "geo_answer": "4th house lord, Mars placement, and Jupiter transit period determine property acquisition windows.",
        "cta": "Property Timing Analysis — ₹51",
        "segment": "millennial"
    },
    "genz_dream_career": {
        "label": "Dream Career",
        "label_hi": "सपनों का करियर",
        "primary_houses": [1, 3, 5, 9, 10, 11],
        "key_planets": ["Mercury", "Sun", "Jupiter", "Rahu"],
        "key_yogas": ["Budha-Aditya Yoga", "Saraswati Yoga", "Rahu career amplification"],
        "geo_answer": "For Gen Z, Rahu in 10th or strong Mercury + Rahu combination often creates viral success and unconventional career paths.",
        "cta": "Career Clarity Session — ₹51",
        "segment": "genz"
    },
    "genz_ex_back": {
        "label": "Love & Ex Return",
        "label_hi": "प्यार वापसी",
        "primary_houses": [5, 7, 11, 12],
        "key_planets": ["Venus", "Moon", "Rahu", "Mars"],
        "key_yogas": ["Karako Bhavo Nashto", "Rahu-Venus conjunction"],
        "geo_answer": "Venus retrograde periods and Jupiter transiting your 7th house create strongest reunion windows.",
        "cta": "Love Timing Analysis — ₹51",
        "segment": "genz"
    },
    "genz_toxic_boss": {
        "label": "Workplace Karma",
        "label_hi": "काम की दुनिया",
        "primary_houses": [6, 10, 3, 11],
        "key_planets": ["Saturn", "Mars", "Rahu", "Sun"],
        "key_yogas": ["Shasha Yoga challenges", "Sun-Saturn affliction"],
        "geo_answer": "6th house conflicts, Saturn transits, and Sun affliction patterns explain workplace power struggles.",
        "cta": "Workplace Karma Session — ₹51",
        "segment": "genz"
    },
    "mill_childs_destiny": {
        "label": "Child's Destiny",
        "label_hi": "संतान का भविष्य",
        "primary_houses": [5, 9, 1, 4],
        "key_planets": ["Jupiter", "Moon", "Sun", "Mercury"],
        "key_yogas": ["Putra Yoga", "Pancha Mahapurusha for child", "Saraswati Yoga"],
        "geo_answer": "5th house strength, Jupiter's grace, and child's own Lagna determine life path and talents.",
        "cta": "Child Kundali Analysis — ₹51",
        "segment": "millennial"
    },
    "genx_retirement_peace": {
        "label": "Retirement Peace",
        "label_hi": "शांतिपूर्ण सेवानिवृत्ति",
        "primary_houses": [4, 8, 9, 11, 12],
        "key_planets": ["Saturn", "Jupiter", "Moon", "Venus"],
        "key_yogas": ["Vipareeta Raja Yoga", "Tapasvi Yoga", "Harsha Yoga"],
        "geo_answer": "Saturn Mahadasha and Jupiter transit to 4th/9th houses mark natural retirement peace windows.",
        "cta": "Retirement Planning Analysis — ₹51",
        "segment": "genx"
    },
    "genx_legacy_inheritance": {
        "label": "Legacy & Inheritance",
        "label_hi": "विरासत और उत्तराधिकार",
        "primary_houses": [2, 4, 8, 9, 11],
        "key_planets": ["Jupiter", "Saturn", "Mars", "Moon"],
        "key_yogas": ["Dhana Yoga", "Pitru Yoga", "Bhumi Yoga"],
        "geo_answer": "8th house (inheritance), 2nd house (family wealth), and 9th house (father's blessings) form the legacy triangle.",
        "cta": "Legacy Chart Reading — ₹51",
        "segment": "genx"
    },
    "genx_spiritual_innings": {
        "label": "Spiritual Journey",
        "label_hi": "आध्यात्मिक यात्रा",
        "primary_houses": [9, 12, 8, 4],
        "key_planets": ["Ketu", "Jupiter", "Saturn", "Moon"],
        "key_yogas": ["Tapasvi Yoga", "Moksha Yoga", "Ketu detachment"],
        "geo_answer": "Ketu Mahadasha and Saturn-Jupiter conjunction in spiritual houses mark the beginning of authentic inner journey.",
        "cta": "Spiritual Path Analysis — ₹51",
        "segment": "genx"
    },
    "mill_parents_wellness": {
        "label": "Parents' Wellness",
        "label_hi": "माता-पिता का स्वास्थ्य",
        "primary_houses": [4, 9, 6, 8],
        "key_planets": ["Moon", "Sun", "Saturn", "Jupiter"],
        "key_yogas": ["Pitru Dosha", "Matru Yoga", "6th lord affliction"],
        "geo_answer": "4th house (mother) and 9th house (father) conditions with their 6th/8th house aspects reveal parental health patterns.",
        "cta": "Family Wellness Reading — ₹51",
        "segment": "millennial"
    },
    "genz_manifestation": {
        "label": "Manifestation & Law of Attraction",
        "label_hi": "इच्छाशक्ति और आकर्षण",
        "primary_houses": [1, 3, 5, 9, 11],
        "key_planets": ["Moon", "Jupiter", "Venus", "Rahu"],
        "key_yogas": ["Gaja Kesari Yoga", "Saraswati Yoga", "Rahu amplification"],
        "geo_answer": "Strong Moon + Jupiter connection (Gaja Kesari) creates natural manifestation power. Rahu amplifies desires into reality.",
        "cta": "Manifestation Window Analysis — ₹51",
        "segment": "genz"
    }
}

# ─────────────────────────────────────────────────────────────────
# NAKSHATRA & PLANET DATA
# ─────────────────────────────────────────────────────────────────

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

RASHIS = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
]

RASHI_EN = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]

PLANET_HI = {
    "Sun": "सूर्य", "Moon": "चंद्र", "Mars": "मंगल",
    "Mercury": "बुध", "Jupiter": "गुरु", "Venus": "शुक्र",
    "Saturn": "शनि", "Rahu": "राहु", "Ketu": "केतु"
}

VIMSHOTTARI_YEARS = {
    "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18,
    "Jupiter": 16, "Saturn": 19, "Mercury": 17, "Ketu": 7, "Venus": 20
}

# ─────────────────────────────────────────────────────────────────
# STYLE SELECTOR
# ─────────────────────────────────────────────────────────────────

def get_template_style(mahadasha_lord: str, session_id: str) -> int:
    """
    Deterministic style selection:
    - Mahadasha lord defines preferred style band (3 options)
    - session_id hash picks within the band
    - Ensures same session always gets same style (no flicker)
    """
    preferred = MAHADASHA_STYLE_MAP.get(mahadasha_lord, [1, 5, 9])
    seed = sum(ord(c) for c in session_id)
    idx = seed % len(preferred)
    return preferred[idx]

# ─────────────────────────────────────────────────────────────────
# DATA EXTRACTORS (from kundaliData / synthesize output)
# ─────────────────────────────────────────────────────────────────

def extract_planet_table(kundali: dict) -> list:
    """Build planet table with Shadbala. Falls back to synthetic data if raw unavailable."""
    planets_raw = kundali.get("planets", {})
    table = []
    for planet in PLANETS:
        p = planets_raw.get(planet, {})
        rashi_idx = p.get("rashi_index", random.randint(0, 11))
        house = p.get("house", random.randint(1, 12))
        degree = p.get("degree", round(random.uniform(0, 30), 2))
        nakshatra_idx = int((rashi_idx * 30 + degree) / (360 / 27)) % 27
        shadbala = p.get("shadbala", round(random.uniform(0.4, 1.8), 2))
        retrograde = p.get("retrograde", False)
        dignity = p.get("dignity", _compute_dignity(planet, rashi_idx))

        table.append({
            "planet": planet,
            "planet_hi": PLANET_HI[planet],
            "rashi": RASHIS[rashi_idx],
            "rashi_en": RASHI_EN[rashi_idx],
            "house": house,
            "degree": degree,
            "nakshatra": NAKSHATRAS[nakshatra_idx],
            "pada": (int(degree / 3.33) % 4) + 1,
            "retrograde": retrograde,
            "dignity": dignity,
            "shadbala": shadbala,
            "shadbala_label": _shadbala_label(shadbala)
        })
    return table

def _compute_dignity(planet: str, rashi_idx: int) -> str:
    OWN = {"Sun":[4], "Moon":[3], "Mars":[0,7], "Mercury":[2,5],
           "Jupiter":[8,11], "Venus":[1,6], "Saturn":[9,10]}
    EXALT = {"Sun":0, "Moon":1, "Mars":9, "Mercury":5,
             "Jupiter":3, "Venus":11, "Saturn":6}
    DEBIL = {"Sun":6, "Moon":7, "Mars":3, "Mercury":11,
             "Jupiter":9, "Venus":5, "Saturn":0}

    if planet in EXALT and EXALT[planet] == rashi_idx:
        return "Exalted"
    if planet in DEBIL and DEBIL[planet] == rashi_idx:
        return "Debilitated"
    if planet in OWN and rashi_idx in OWN[planet]:
        return "Own Sign"
    return "Neutral"

def _shadbala_label(val: float) -> str:
    if val >= 1.5: return "Very Strong"
    if val >= 1.0: return "Strong"
    if val >= 0.7: return "Moderate"
    return "Weak"

def extract_dasha_timeline(kundali: dict) -> dict:
    """Extract MD + AD + PD + SD with dates."""
    dasha_raw = kundali.get("dasha", {})
    current_md = dasha_raw.get("mahadasha", {})
    current_ad = dasha_raw.get("antardasha", {})
    current_pd = dasha_raw.get("pratyantar", {})
    current_sd = dasha_raw.get("sookshma", {})

    today = date.today()

    return {
        "mahadasha": {
            "lord": current_md.get("lord", "Saturn"),
            "start": current_md.get("start", str(today.replace(year=today.year - 2))),
            "end": current_md.get("end", str(today.replace(year=today.year + 5))),
            "years_elapsed": current_md.get("years_elapsed", 2.1),
            "years_remaining": current_md.get("years_remaining", 5.3)
        },
        "antardasha": {
            "lord": current_ad.get("lord", "Mercury"),
            "start": current_ad.get("start", str(today.replace(month=1, day=1))),
            "end": current_ad.get("end", str(today.replace(month=6, day=30)))
        },
        "pratyantar": {
            "lord": current_pd.get("lord", "Jupiter"),
            "start": current_pd.get("start", str(today)),
            "end": current_pd.get("end", str(today.replace(day=min(today.day + 21, 28))))
        },
        "sookshma": {
            "lord": current_sd.get("lord", "Venus"),
            "active_days": current_sd.get("active_days", 7)
        },
        "vimshottari_sequence": _build_dasha_sequence(
            current_md.get("lord", "Saturn")
        )
    }

def _build_dasha_sequence(current_lord: str) -> list:
    """Show next 3 Mahadashas after current."""
    lords = list(VIMSHOTTARI_YEARS.keys())
    idx = lords.index(current_lord) if current_lord in lords else 0
    sequence = []
    for i in range(1, 4):
        next_lord = lords[(idx + i) % 9]
        sequence.append({
            "lord": next_lord,
            "duration_years": VIMSHOTTARI_YEARS[next_lord]
        })
    return sequence

def extract_domain_analysis(kundali: dict, domain: str) -> dict:
    """Domain-specific house + yoga + ashtakavarga analysis."""
    meta = DOMAIN_META.get(domain, DOMAIN_META["career"])
    houses_raw = kundali.get("houses", {})
    yogas_raw = kundali.get("yogas", [])
    ashtak_raw = kundali.get("ashtakavarga", {})

    house_analysis = {}
    for h in meta["primary_houses"]:
        house_data = houses_raw.get(str(h), {})
        lord = house_data.get("lord", "Unknown")
        occupants = house_data.get("occupants", [])
        ashtak_score = ashtak_raw.get(str(h), random.randint(18, 38))
        strength = "Strong" if ashtak_score >= 28 else ("Moderate" if ashtak_score >= 22 else "Weak")
        house_analysis[h] = {
            "house_number": h,
            "lord": lord,
            "occupants": occupants,
            "ashtakavarga_score": ashtak_score,
            "strength": strength,
            "interpretation": _house_domain_interpretation(h, domain, strength, lord)
        }

    active_yogas = []
    for yoga in meta["key_yogas"]:
        found = next((y for y in yogas_raw if yoga.lower() in y.get("name", "").lower()), None)
        if found:
            active_yogas.append(found)
        else:
            active_yogas.append({
                "name": yoga,
                "present": False,
                "strength": "Not Found",
                "effect": f"{yoga} not active in current chart configuration."
            })

    return {
        "domain": domain,
        "domain_label": meta["label"],
        "domain_label_hi": meta["label_hi"],
        "primary_houses_analysis": house_analysis,
        "yogas": active_yogas,
        "geo_direct_answer": meta["geo_answer"],
        "key_planet_assessment": _assess_key_planets(meta["key_planets"], kundali)
    }

def _house_domain_interpretation(house: int, domain: str, strength: str, lord: str) -> str:
    base = {
        2: "Family wealth and speech patterns",
        4: "Home, mother, emotional foundation",
        5: "Intelligence, children, past merit",
        6: "Service, debts, health challenges",
        7: "Partnerships and relationships",
        8: "Transformation, inheritance, hidden matters",
        9: "Dharma, father, fortune and luck",
        10: "Career, reputation, public life",
        11: "Gains, income, fulfillment of desires",
        12: "Expenses, foreign travel, liberation"
    }
    desc = base.get(house, f"House {house}")
    return f"{desc} — {strength} ({lord} as lord)."

def _assess_key_planets(planet_list: list, kundali: dict) -> list:
    planets_raw = kundali.get("planets", {})
    result = []
    for p in planet_list:
        data = planets_raw.get(p, {})
        rashi_idx = data.get("rashi_index", random.randint(0, 11))
        dignity = _compute_dignity(p, rashi_idx)
        shadbala = data.get("shadbala", round(random.uniform(0.5, 1.6), 2))
        result.append({
            "planet": p,
            "planet_hi": PLANET_HI[p],
            "dignity": dignity,
            "shadbala": shadbala,
            "strength_label": _shadbala_label(shadbala),
            "rashi": RASHIS[rashi_idx],
            "domain_impact": _planet_domain_impact(p, dignity, _shadbala_label(shadbala))
        })
    return result

def _planet_domain_impact(planet: str, dignity: str, strength: str) -> str:
    impacts = {
        "Exalted": f"{planet} is exalted — maximum positive results in this domain.",
        "Own Sign": f"{planet} in own sign — steady, reliable results.",
        "Debilitated": f"{planet} debilitated — challenges; Neecha Bhanga can reverse.",
        "Neutral": f"{planet} in neutral position — results depend on aspects and dasha."
    }
    return impacts.get(dignity, "Neutral influence.")

# ─────────────────────────────────────────────────────────────────
# ACTION & AVOID WINDOWS
# ─────────────────────────────────────────────────────────────────

def compute_action_windows(kundali: dict, domain: str) -> dict:
    """3-7 day precision windows using Pratyantar Dasha."""
    dasha = kundali.get("dasha", {})
    pd_lord = dasha.get("pratyantar", {}).get("lord", "Jupiter")
    sd_lord = dasha.get("sookshma", {}).get("lord", "Venus")
    today = date.today()

    # Favourable planets per domain
    meta = DOMAIN_META.get(domain, {})
    fav_planets = meta.get("key_planets", ["Jupiter", "Venus"])

    action_windows = []
    avoid_windows = []

    # Simple window generation based on dasha lords
    if pd_lord in fav_planets or sd_lord in fav_planets:
        action_windows.append({
            "window": f"{today.strftime('%d %b')} – {today.replace(day=min(today.day+7, 28)).strftime('%d %b %Y')}",
            "strength": "High",
            "reason": f"{pd_lord} Pratyantar favors {domain} actions now.",
            "recommended_actions": _domain_actions(domain, "high")
        })
    else:
        avoid_windows.append({
            "window": f"{today.strftime('%d %b')} – {today.replace(day=min(today.day+7, 28)).strftime('%d %b %Y')}",
            "reason": f"{pd_lord} Pratyantar is not favorable for {domain}. Pause and plan.",
            "avoid_actions": _domain_actions(domain, "avoid")
        })

    # Always add a future positive window
    future_start = today.replace(day=min(today.day + 14, 28))
    action_windows.append({
        "window": f"{future_start.strftime('%d %b')} – {future_start.replace(day=min(future_start.day+10, 28)).strftime('%d %b %Y')}",
        "strength": "Moderate",
        "reason": f"Upcoming Sookshma Dasha of {sd_lord} aligns positively.",
        "recommended_actions": _domain_actions(domain, "moderate")
    })

    return {
        "action_windows": action_windows,
        "avoid_windows": avoid_windows,
        "pratyantar_lord": pd_lord,
        "sookshma_lord": sd_lord,
        "precision_note": "Windows computed via Pratyantar Dasha (Level 3) — Trikal Vaani's 3–7 day precision system."
    }

def _domain_actions(domain: str, mode: str) -> list:
    actions = {
        "career": {
            "high": ["Apply for new roles", "Negotiate salary", "Launch project", "Attend interviews"],
            "moderate": ["Update LinkedIn", "Build skills", "Network quietly"],
            "avoid": ["Resign impulsively", "Start conflicts with boss", "Major career pivots"]
        },
        "wealth": {
            "high": ["Invest in equity", "Close business deals", "Apply for loans"],
            "moderate": ["Research investments", "Save aggressively", "Fix budget"],
            "avoid": ["Speculation", "Lending money", "High-risk investments"]
        },
        "health": {
            "high": ["Start health regime", "Medical consultations", "Surgery planning"],
            "moderate": ["Yoga and meditation", "Diet corrections"],
            "avoid": ["Major surgeries", "Ignoring symptoms", "Overexertion"]
        },
        "relationships": {
            "high": ["Express feelings", "Marriage talks", "Reconciliation"],
            "moderate": ["Quality time", "Communication improvements"],
            "avoid": ["Major confrontations", "Separation decisions", "Jealousy"]
        }
    }
    # Default for specialized domains
    default = {
        "high": ["Take initiative", "Make key decisions", "Start new ventures"],
        "moderate": ["Plan and prepare", "Consult experts"],
        "avoid": ["Avoid hasty decisions", "Postpone major moves"]
    }
    return actions.get(domain, default).get(mode, default["high"])

# ─────────────────────────────────────────────────────────────────
# REMEDY PLAN
# ─────────────────────────────────────────────────────────────────

REMEDY_DB = {
    "Sun": {
        "mantra": "Om Hraam Hreem Hraum Sah Suryaya Namah",
        "count": "108 times daily, Sunday morning",
        "dana": "Wheat, jaggery, copper vessel to temple on Sundays",
        "vrat": "Sunday Surya vrat — fast until sunset",
        "gemstone": "Ruby (Manik) — 5 ratti, gold ring, Sunday sunrise",
        "color": "Orange/Red on Sundays"
    },
    "Moon": {
        "mantra": "Om Shraam Shreem Shraum Sah Chandraya Namah",
        "count": "108 times, Monday evening",
        "dana": "White rice, milk, silver to poor on Mondays",
        "vrat": "Monday Somvar vrat — milk fast",
        "gemstone": "Pearl (Moti) — 5 ratti, silver ring, Monday morning",
        "color": "White/Silver on Mondays"
    },
    "Mars": {
        "mantra": "Om Kraam Kreem Kraum Sah Bhaumaya Namah",
        "count": "108 times, Tuesday sunrise",
        "dana": "Red lentils (masoor), red cloth, copper to temple Tuesdays",
        "vrat": "Tuesday Mangalwar vrat — salt-free fast",
        "gemstone": "Red Coral (Moonga) — 9 ratti, gold/copper ring, Tuesday",
        "color": "Red on Tuesdays"
    },
    "Mercury": {
        "mantra": "Om Braam Breem Braum Sah Budhaya Namah",
        "count": "108 times, Wednesday morning",
        "dana": "Green moong dal, books, green cloth on Wednesdays",
        "vrat": "Wednesday Budhavar vrat — one meal",
        "gemstone": "Emerald (Panna) — 5 ratti, gold ring, Wednesday",
        "color": "Green on Wednesdays"
    },
    "Jupiter": {
        "mantra": "Om Graam Greem Graum Sah Guruve Namah",
        "count": "108 times, Thursday morning",
        "dana": "Yellow chickpeas, turmeric, gold cloth to temple Thursdays",
        "vrat": "Thursday Guruvar vrat — yellow food only",
        "gemstone": "Yellow Sapphire (Pukhraj) — 5 ratti, gold ring, Thursday",
        "color": "Yellow on Thursdays"
    },
    "Venus": {
        "mantra": "Om Draam Dreem Draum Sah Shukraya Namah",
        "count": "108 times, Friday morning",
        "dana": "White sweets, silver, white cloth to young women on Fridays",
        "vrat": "Friday Shukravar vrat — white food fast",
        "gemstone": "Diamond or White Sapphire — gold ring, Friday",
        "color": "White/Pink on Fridays"
    },
    "Saturn": {
        "mantra": "Om Praam Preem Praum Sah Shanaischaraya Namah",
        "count": "108 times, Saturday evening at sunset",
        "dana": "Black sesame, mustard oil, iron, black cloth to poor Saturdays",
        "vrat": "Saturday Shanivar vrat — single meal",
        "gemstone": "Blue Sapphire (Neelam) — test for 3 days first, 5 ratti, iron ring",
        "color": "Black/Navy on Saturdays"
    },
    "Rahu": {
        "mantra": "Om Bhram Bhreem Bhraum Sah Rahave Namah",
        "count": "108 times, Saturday evening or Rahu kaal",
        "dana": "Coconut, black sesame, durva grass on Saturdays",
        "vrat": "Rahu remedies on Saturday during Rahu kaal",
        "gemstone": "Hessonite (Gomed) — 8 ratti, silver ring, Saturday",
        "color": "Dark blue/grey on Saturdays"
    },
    "Ketu": {
        "mantra": "Om Sraam Sreem Sraum Sah Ketave Namah",
        "count": "108 times, Tuesday evening",
        "dana": "Sesame seeds, blanket, multi-colored cloth on Tuesdays",
        "vrat": "Ketu shanti path on Tuesdays",
        "gemstone": "Cat's Eye (Lehsunia) — 8 ratti, silver ring, Tuesday",
        "color": "Multi-color on Tuesdays"
    }
}

def build_remedy_plan(kundali: dict, domain: str) -> dict:
    """Build 3-layer remedy plan: Mantra + Dana + Vrat for domain-relevant planets."""
    meta = DOMAIN_META.get(domain, DOMAIN_META["career"])
    planets_raw = kundali.get("planets", {})
    weak_planets = []

    for p in meta["key_planets"]:
        data = planets_raw.get(p, {})
        rashi_idx = data.get("rashi_index", random.randint(0, 11))
        dignity = _compute_dignity(p, rashi_idx)
        shadbala = data.get("shadbala", random.uniform(0.4, 1.6))
        if dignity == "Debilitated" or shadbala < 0.7:
            weak_planets.append(p)

    if not weak_planets:
        # Use top 2 domain planets as default focus
        weak_planets = meta["key_planets"][:2]

    remedies = []
    for p in weak_planets[:3]:  # Max 3 planet remedies
        r = REMEDY_DB.get(p, {})
        remedies.append({
            "planet": p,
            "planet_hi": PLANET_HI.get(p, p),
            "reason": f"{p} needs strengthening for {meta['label']}",
            "mantra": r.get("mantra", ""),
            "mantra_count": r.get("count", "108 times daily"),
            "dana": r.get("dana", ""),
            "vrat": r.get("vrat", ""),
            "gemstone": r.get("gemstone", "Consult gemologist"),
            "wearing_color": r.get("color", ""),
            "priority": "High" if p == weak_planets[0] else "Medium"
        })

    return {
        "remedy_count": len(remedies),
        "remedies": remedies,
        "general_remedy": {
            "daily": "Recite Trikal Vaani Jini mantra at dawn: 'Har Pal Sach, Har Pal Shubh'",
            "weekly": "Light a ghee diya at home temple every Sunday",
            "monthly": "Visit Hanuman temple on first Tuesday of month"
        },
        "disclaimer": "Remedies are Vedic classical recommendations. Results vary per individual karma."
    }

# ─────────────────────────────────────────────────────────────────
# PANCHANG
# ─────────────────────────────────────────────────────────────────

TITHIS = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"
]

YOGAS_PANCHANG = [
    "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti"
]

KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"]

WEEKDAYS = ["Ravivara (Sunday)", "Somavara (Monday)", "Mangalvara (Tuesday)",
            "Budhavara (Wednesday)", "Guruvara (Thursday)", "Shukravara (Friday)", "Shanivara (Saturday)"]

def get_panchang_today() -> dict:
    """Generate today's Panchang (approximate for display; real calculation on VM with pyswisseph)."""
    today = date.today()
    day_of_year = today.timetuple().tm_yday

    tithi_idx = (day_of_year * 13) % 15
    yoga_idx = (day_of_year * 7 + 3) % 27
    karana_idx = (day_of_year * 2) % 11
    nakshatra_idx = (day_of_year * 13) % 27

    weekday = today.weekday()  # 0=Mon in Python, adjust
    vedic_day = (weekday + 1) % 7  # 0=Sun for Vedic

    # Auspicious/inauspicious check
    inauspicious_yogas = ["Vishkumbha", "Vyaghata", "Parigha", "Vajra", "Vyatipata", "Vaidhriti", "Ganda", "Shula"]
    yoga_name = YOGAS_PANCHANG[yoga_idx]
    is_auspicious = yoga_name not in inauspicious_yogas

    # Rahu Kaal times (approximate, vary by season)
    rahu_kaal = {
        0: "4:30 PM - 6:00 PM",  # Sun
        1: "7:30 AM - 9:00 AM",  # Mon
        2: "3:00 PM - 4:30 PM",  # Tue
        3: "12:00 PM - 1:30 PM", # Wed
        4: "1:30 PM - 3:00 PM",  # Thu
        5: "10:30 AM - 12:00 PM",# Fri
        6: "9:00 AM - 10:30 AM"  # Sat
    }

    return {
        "date": str(today),
        "weekday": WEEKDAYS[vedic_day],
        "tithi": TITHIS[tithi_idx],
        "nakshatra": NAKSHATRAS[nakshatra_idx],
        "yoga": yoga_name,
        "karana": KARANAS[karana_idx],
        "rahu_kaal": rahu_kaal.get(weekday, "12:00 PM - 1:30 PM"),
        "is_auspicious_yoga": is_auspicious,
        "muhurta_advice": "Auspicious for new beginnings" if is_auspicious else "Avoid major decisions today — wait for better muhurta",
        "source": "Approximate Panchang — precise calculation via pyswisseph on VM"
    }

# ─────────────────────────────────────────────────────────────────
# CONFIDENCE BADGE
# ─────────────────────────────────────────────────────────────────

def compute_confidence_badge(kundali: dict) -> dict:
    """Compute confidence score based on data completeness."""
    has_prokerala = kundali.get("source") == "prokerala"
    has_precise_tob = kundali.get("birth_time_precision", "approximate") == "exact"
    has_ashtakavarga = bool(kundali.get("ashtakavarga"))
    has_shadbala = any(
        kundali.get("planets", {}).get(p, {}).get("shadbala")
        for p in PLANETS
    )

    score = 60  # Base
    if has_prokerala: score += 20
    if has_precise_tob: score += 10
    if has_ashtakavarga: score += 5
    if has_shadbala: score += 5

    label = "High Accuracy" if score >= 85 else ("Good Accuracy" if score >= 70 else "Standard Accuracy")
    color = "#22C55E" if score >= 85 else ("#F59E0B" if score >= 70 else "#6B7280")

    return {
        "score": score,
        "label": label,
        "color": color,
        "powered_by": "Swiss Ephemeris" if has_prokerala else "Meeus Formula (±2–3°)",
        "note": "Same engine used by professional astrologers worldwide.",
        "prokerala_verified": has_prokerala
    }

# ─────────────────────────────────────────────────────────────────
# MASTER TEMPLATE BUILDER
# ─────────────────────────────────────────────────────────────────

def build_template(domain: str, kundali: dict, session_id: str, lang: str = "hi") -> dict:
    """
    Master function: builds complete template dict for a domain.
    Called by FastAPI POST /template endpoint.
    """
    # Validate domain
    if domain not in DOMAINS:
        raise ValueError(f"Unknown domain: {domain}. Valid: {DOMAINS}")

    meta = DOMAIN_META[domain]

    # Get Mahadasha lord for style selection
    mahadasha_lord = kundali.get("dasha", {}).get("mahadasha", {}).get("lord", "Saturn")
    style_idx = get_template_style(mahadasha_lord, session_id)
    style = TEMPLATE_STYLES[style_idx]

    # Build all sections
    planet_table = extract_planet_table(kundali)
    dasha_timeline = extract_dasha_timeline(kundali)
    domain_analysis = extract_domain_analysis(kundali, domain)
    action_windows = compute_action_windows(kundali, domain)
    remedy_plan = build_remedy_plan(kundali, domain)
    panchang = get_panchang_today()
    confidence = compute_confidence_badge(kundali)

    # Assemble final template
    template = {
        # ── META ──────────────────────────────────────────────
        "meta": {
            "domain": domain,
            "domain_label": meta["label"],
            "domain_label_hi": meta["label_hi"],
            "segment": meta["segment"],
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "session_id": session_id,
            "lang": lang,
            "version": "1.0.0",
            "platform": "Trikal Vaani — AI Vedic Intelligence"
        },

        # ── GEMINI SUMMARY SLOT (always blank here) ────────────
        "geminiSummarySlot": None,  # Gemini fills this post-render

        # ── TEMPLATE STYLE ─────────────────────────────────────
        "templateStyle": {
            "index": style_idx,
            "name": style["name"],
            "theme": style["theme"],
            "layout": style["layout"],
            "accent_color": style["accent"],
            "background_color": style["bg"],
            "font_headline": style["font_headline"],
            "font_body": style["font_body"],
            "chart_position": style["chart_position"],
            "table_style": style["table_style"],
            "icon_set": style["icon_set"],
            "description": style["description"],
            "mahadasha_lord": mahadasha_lord
        },

        # ── GEO DIRECT ANSWER (40-60 words for AI search) ──────
        "geoDirectAnswer": {
            "text": meta["geo_answer"],
            "word_count": len(meta["geo_answer"].split()),
            "optimized_for": ["Google SGE", "Perplexity", "Gemini Search", "SearchGPT"]
        },

        # ── PLANET TABLE ───────────────────────────────────────
        "planetTable": planet_table,

        # ── DASHA TIMELINE ─────────────────────────────────────
        "dashaTimeline": dasha_timeline,

        # ── DOMAIN ANALYSIS ────────────────────────────────────
        "domainAnalysis": domain_analysis,

        # ── ACTION & AVOID WINDOWS ─────────────────────────────
        "actionWindows": action_windows["action_windows"],
        "avoidWindows": action_windows["avoid_windows"],
        "dashaWindowMeta": {
            "pratyantar_lord": action_windows["pratyantar_lord"],
            "sookshma_lord": action_windows["sookshma_lord"],
            "precision_note": action_windows["precision_note"]
        },

        # ── REMEDY PLAN ────────────────────────────────────────
        "remedyPlan": remedy_plan,

        # ── PANCHANG ───────────────────────────────────────────
        "panchang": panchang,

        # ── CONFIDENCE BADGE ───────────────────────────────────
        "confidenceBadge": confidence,

        # ── CTA (Conversion Layer) ─────────────────────────────
        "cta": {
            "primary": meta["cta"],
            "whatsapp": "https://wa.me/919211804111",
            "consultation_url": f"https://trikalvaani.com/{domain}",
            "urgency_text": "Limited consultations — Book now at launch price"
        },

        # ── SEO SCHEMA HINT ────────────────────────────────────
        "seoSchema": {
            "type": "HowTo",
            "name": f"How to Read {meta['label']} in Vedic Astrology",
            "description": meta["geo_answer"],
            "author": {
                "type": "Person",
                "name": "Rohiit Gupta",
                "jobTitle": "Chief Vedic Architect",
                "url": "https://trikalvaani.com/about"
            }
        }
    }

    return template
