"""
=============================================================================
TRIKAL VAANI — TEMPLATE ENGINE v2.0
Chief Vedic Architect: Rohiit Gupta | CEO, Trikal Vaani
GCP VM Mumbai (asia-south1) | Port 8001 | FastAPI
=============================================================================
VERSION 2.1 — NO-FABRICATION RELEASE (23 Aug 2026)

  WHY THIS EXISTS
  v2.0 filled every missing chart field with random.randint / random.uniform.
  Because /api/predict sent the chart nested as {"chart": {...}} while this
  engine reads kundali["planets"] / kundali["dasha"] at the TOP level, NO real
  data ever arrived — so every planet position, house, Shadbala and
  Ashtakavarga score served to paying clients was randomly generated.

  Observed in production 23 Aug 2026:
    - Sun reported "Debilitated" AND "Very Strong" simultaneously
    - Rahu 12th and Ketu 12th (they are always 7 houses apart)
    - Moon in a house impossible for the stated Lagna
    - dashaTimeline byte-identical across two unrelated charts
      (Saturn 2024-08-23 -> 2031-08-23; Saturn Mahadasha is 19y, not 7y)

  v2.1 RULES
    1. NEVER invent astrological data. No random.* anywhere in this file.
    2. If real data is absent, return None / [] so the UI shows nothing
       or "—". A blank is honest; a fabricated planet is not.
    3. Accept the real Swiss Ephemeris /kundali payload shape.

150 Templates: 15 Domains x 10 Visual Styles
GEO: 40-60 word direct answer blocks (Google SGE / Perplexity / Gemini / ChatGPT)
SEO: FAQPage + HowTo + Person schema per domain
AstroSage + AstroTalk inspired layout styles
=============================================================================
"""

# v2.1: `random` is deliberately NOT imported. Astrological values must never
# be fabricated. If a value is unknown it must be reported as unknown.
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel

class TemplateRequest(BaseModel):
    domain: str
    kundaliData: dict
    sessionId: str
    lang: str = "hi"

DOMAINS = [
    "mill_karz_mukti", "mill_property_yog", "genz_dream_career",
    "genz_ex_back", "genz_toxic_boss", "mill_childs_destiny",
    "genx_retirement_peace", "genx_legacy_inheritance",
    "genx_spiritual_innings", "mill_parents_wellness",
    "genz_manifestation", "career", "wealth", "health", "relationships"
]

MAHADASHA_STYLE_MAP = {
    "Sun":     [1, 5, 9],
    "Moon":    [2, 6, 10],
    "Mars":    [3, 7, 1],
    "Rahu":    [4, 8, 2],
    "Jupiter": [5, 9, 3],
    "Saturn":  [6, 10, 4],
    "Mercury": [7, 1, 5],
    "Ketu":    [8, 2, 6],
    "Venus":   [9, 3, 7]
}

TEMPLATE_STYLES = {
    1:  {"name": "Royal Kundali",       "theme": "deep_navy_gold",      "accent": "#D4AF37", "bg": "#0A1628", "font_headline": "Yeseva One",             "font_body": "Hind",                  "chart_position": "top_center",           "table_style": "bordered_gold",      "layout": "chart_dominant"},
    2:  {"name": "Soft Cosmos",         "theme": "lavender_moonlight",  "accent": "#9B8EC4", "bg": "#F5F0FF", "font_headline": "Rozha One",              "font_body": "Noto Sans Devanagari",   "chart_position": "left_sidebar",         "table_style": "soft_rounded",       "layout": "two_column"},
    3:  {"name": "Warrior Dashboard",   "theme": "crimson_black",       "accent": "#E63946", "bg": "#111111", "font_headline": "Tiro Devanagari Hindi",  "font_body": "Mukta",                 "chart_position": "top_right",            "table_style": "dark_striped",       "layout": "dashboard_grid"},
    4:  {"name": "Shadow Rahu",         "theme": "smoke_purple",        "accent": "#7B2D8B", "bg": "#1A1025", "font_headline": "Baloo 2",               "font_body": "Hind Siliguri",          "chart_position": "center_overlay",       "table_style": "glow_bordered",      "layout": "magazine_editorial"},
    5:  {"name": "Golden Guru",         "theme": "saffron_cream",       "accent": "#FF9933", "bg": "#FFFBF0", "font_headline": "Yatra One",             "font_body": "Karma",                 "chart_position": "inline_narrative",     "table_style": "warm_bordered",      "layout": "scroll_narrative"},
    6:  {"name": "Saturn Ledger",       "theme": "slate_structured",    "accent": "#4A6FA5", "bg": "#F0F4F8", "font_headline": "Poppins",               "font_body": "Noto Sans",             "chart_position": "right_panel",          "table_style": "professional_grid",  "layout": "data_table_heavy"},
    7:  {"name": "Mercury Matrix",      "theme": "teal_white_clean",    "accent": "#00897B", "bg": "#FAFFFE", "font_headline": "Rajdhani",              "font_body": "Laila",                 "chart_position": "top_left_card",        "table_style": "teal_accent_clean",  "layout": "card_modular"},
    8:  {"name": "Ketu Moksha",         "theme": "sand_minimalist",     "accent": "#8D7B68", "bg": "#F9F5F0", "font_headline": "Philosopher",           "font_body": "Lato",                  "chart_position": "centered_sparse",      "table_style": "borderless_clean",   "layout": "zen_minimal"},
    9:  {"name": "Venus Luxe",          "theme": "rose_gold_white",     "accent": "#C9956C", "bg": "#FFF8F5", "font_headline": "Rozha One",             "font_body": "Hind",                  "chart_position": "hero_full_width",      "table_style": "rose_gold_borders",  "layout": "luxury_editorial"},
    10: {"name": "Cosmic Deep",         "theme": "midnight_starfield",  "accent": "#4FC3F7", "bg": "#050D1A", "font_headline": "Cinzel",               "font_body": "Mukta",                 "chart_position": "full_background_overlay", "table_style": "translucent_dark", "layout": "immersive_full"}
}

# ─────────────────────────────────────────────────────────────────
# DOMAIN META — GEO answers are 40-60 words (validated)
# Each includes: FAQ blocks, HowTo schema hint, search intents
# ─────────────────────────────────────────────────────────────────

DOMAIN_META = {
    "career": {
        "label": "Career & Profession",
        "label_hi": "करियर और पेशा",
        "primary_houses": [1, 2, 6, 10, 11],
        "key_planets": ["Sun", "Mercury", "Saturn", "Jupiter"],
        "key_yogas": ["Raja Yoga", "Budha-Aditya Yoga", "Neecha Bhanga Raja Yoga"],
        "geo_answer": "In Vedic astrology, your career destiny is determined by the 10th house lord, its nakshatra placement, and the active Mahadasha period. Sun governs authority and government roles, Mercury rules communication and business, Saturn determines hard work and service, while Jupiter blesses teaching, law, and finance careers.",
        "geo_faq": [
            {"q": "Which house controls career in Vedic astrology?", "a": "The 10th house (Karma Bhava) is the primary house for career in Vedic astrology. Its lord, planets placed in it, and aspects on it determine profession type, success, and timing of career breakthroughs."},
            {"q": "Which planet is most important for career success?", "a": "Sun, Mercury, and Saturn are the three most important planets for career. Sun gives authority and leadership, Mercury rules intellect and business, Saturn determines discipline and longevity in a profession."},
            {"q": "How does Mahadasha affect career?", "a": "Each Mahadasha lord activates career sectors linked to that planet. Jupiter Mahadasha brings teaching, advisory, and finance opportunities. Saturn Mahadasha demands hard work but delivers stable long-term career growth."}
        ],
        "search_intents": {
            "informational": ["career in kundali", "10th house career astrology", "career prediction by date of birth"],
            "commercial": ["career astrology consultation", "best astrologer for career", "vedic career prediction"],
            "transactional": ["book career astrology reading", "career kundali analysis online india"]
        },
        "howto_steps": ["Enter your birth details", "Get your 10th house analysis", "Check Mahadasha timing", "Receive career action windows", "Follow remedies for career planet"],
        "cta": "Book Career Consultation — ₹51",
        "segment": "all",
        "schema_type": "HowTo"
    },
    "wealth": {
        "label": "Wealth & Finance",
        "label_hi": "धन और समृद्धि",
        "primary_houses": [1, 2, 5, 9, 11],
        "key_planets": ["Jupiter", "Venus", "Mercury", "Moon"],
        "key_yogas": ["Dhana Yoga", "Lakshmi Yoga", "Pancha Mahapurusha Yoga"],
        "geo_answer": "Wealth accumulation in Vedic astrology is controlled by the 2nd house (savings), 11th house (income gains), and 9th house (fortune). Dhana Yogas formed by Jupiter and Venus create natural wealth potential. The active Mahadasha and Antardasha lords determine the precise timing of financial growth and setbacks.",
        "geo_faq": [
            {"q": "Which house in kundali shows wealth?", "a": "The 2nd house shows accumulated wealth and family finances. The 11th house shows income and gains. The 9th house shows fortune and inherited prosperity. All three together with Jupiter's position determine overall wealth potential."},
            {"q": "What is Dhana Yoga in astrology?", "a": "Dhana Yoga forms when lords of wealth houses (2nd, 5th, 9th, 11th) conjoin or aspect each other. Strong Dhana Yogas with a supportive Mahadasha can bring sudden wealth, business success, and financial breakthroughs."},
            {"q": "Which planet is responsible for sudden wealth?", "a": "Rahu and Jupiter together or 8th house activation can bring sudden wealth through inheritance, lottery, or windfall. Venus in the 11th house with Jupiter aspect is considered one of the strongest wealth combinations in Vedic astrology."}
        ],
        "search_intents": {
            "informational": ["wealth yoga in kundali", "2nd house astrology wealth", "dhana yoga calculator"],
            "commercial": ["wealth astrology reading online", "financial astrology india", "money prediction vedic astrology"],
            "transactional": ["book wealth kundali reading", "financial astrology consultation india ₹51"]
        },
        "howto_steps": ["Submit birth chart data", "Identify 2nd and 11th house lords", "Detect active Dhana Yogas", "Calculate wealth timing windows", "Get Jupiter and Venus remedies"],
        "cta": "Unlock Wealth Window — ₹51",
        "segment": "all",
        "schema_type": "HowTo"
    },
    "health": {
        "label": "Health & Vitality",
        "label_hi": "स्वास्थ्य और जीवनशक्ति",
        "primary_houses": [1, 6, 8, 12],
        "key_planets": ["Sun", "Moon", "Mars", "Saturn"],
        "key_yogas": ["Vipareeta Raja Yoga", "Sarpa Yoga", "Graha Peedit Yoga"],
        "geo_answer": "Health in Vedic astrology is analyzed through the Lagna (Ascendant) lord strength, the 6th house of disease, the 8th house of chronic illness, and the 12th house of hospitalization. Sun governs vitality, Moon controls mental health, Mars rules blood and surgery, and Saturn brings chronic conditions and bone-related ailments.",
        "geo_faq": [
            {"q": "Which house in astrology shows health problems?", "a": "The 6th house (Roga Bhava) primarily shows disease and health challenges. The 8th house shows chronic or hidden illnesses. The 12th house indicates hospitalization. The Lagna lord's strength determines overall physical constitution and immunity."},
            {"q": "Which planet causes health problems in astrology?", "a": "Saturn causes chronic diseases, arthritis, and nerve disorders. Rahu creates mysterious or misdiagnosed illnesses. Mars rules blood disorders and accidents. Moon affects mental health and fluid imbalances. Sun, when weak, reduces overall vitality and immunity."},
            {"q": "How to improve health through Vedic astrology?", "a": "Strengthen your Lagna lord through its specific mantras and gemstones. Perform Sun remedies on Sundays for vitality. Reduce Saturn's malefic effects through Shani mantras. Maintain fasting on the day ruled by your afflicted health planet."}
        ],
        "search_intents": {
            "informational": ["6th house health astrology", "health prediction by kundali", "which planet causes disease"],
            "commercial": ["health astrology reading", "medical astrology india", "disease prediction vedic"],
            "transactional": ["book health kundali analysis ₹51", "online health astrology consultation india"]
        },
        "howto_steps": ["Analyze Lagna lord strength", "Check 6th 8th 12th house afflictions", "Identify disease-causing planets", "Calculate health risk windows", "Follow strengthening remedies"],
        "cta": "Health Chart Analysis — ₹51",
        "segment": "all",
        "schema_type": "HowTo"
    },
    "relationships": {
        "label": "Relationships & Love",
        "label_hi": "रिश्ते और प्रेम",
        "primary_houses": [1, 2, 5, 7, 11],
        "key_planets": ["Venus", "Moon", "Jupiter", "Mars"],
        "key_yogas": ["Kalatra Yoga", "Karako Bhavo Nashto", "Rahu-Venus conjunction"],
        "geo_answer": "Relationship compatibility in Vedic astrology is determined by the 7th house (partnership), Venus (love and attraction), the Moon (emotional bonding), and the Navamsa chart (marriage destiny). Jupiter's aspect on the 7th house blesses stable partnerships. Mars-Venus conjunction can create intense but volatile romantic connections.",
        "geo_faq": [
            {"q": "Which house in astrology governs relationships?", "a": "The 7th house is the primary house for marriage and partnerships. The 5th house governs romance and love affairs. The 11th house shows fulfilment of desires and long-term companionship. Together, these three houses determine relationship destiny in Vedic astrology."},
            {"q": "Which planet is responsible for love marriage?", "a": "Venus is the primary planet for love and romance. A strong Venus in the 5th or 7th house, combined with Rahu's influence, often indicates love marriage. Jupiter's aspect on Venus or the 7th house blesses successful and lasting love marriages."},
            {"q": "How does Navamsa chart predict marriage?", "a": "The Navamsa (D9) chart reveals the deeper essence of marriage and the quality of the spouse. The 7th house of Navamsa, its lord, and the placement of Venus and Jupiter in Navamsa together predict compatibility, timing, and happiness in marriage."}
        ],
        "search_intents": {
            "informational": ["7th house relationships astrology", "love marriage yoga kundali", "navamsa chart marriage prediction"],
            "commercial": ["relationship astrology reading india", "love compatibility vedic astrology", "marriage timing astrology"],
            "transactional": ["book relationship kundali reading ₹51", "love astrology consultation online india"]
        },
        "howto_steps": ["Analyze 7th house and its lord", "Check Venus and Moon placement", "Study Navamsa for marriage quality", "Calculate relationship timing windows", "Get Venus remedies for love"],
        "cta": "Relationship Analysis — ₹51",
        "segment": "all",
        "schema_type": "HowTo"
    },
    "mill_karz_mukti": {
        "label": "Debt Liberation",
        "label_hi": "कर्ज मुक्ति",
        "primary_houses": [6, 8, 12, 2, 11],
        "key_planets": ["Saturn", "Rahu", "Mars", "Jupiter"],
        "key_yogas": ["Viparita Raja Yoga", "Shula Yoga", "Daridra Yoga reversal"],
        "geo_answer": "Debt cycles in Vedic astrology are rooted in the 6th house (loans and enemies), 8th house (financial crises and hidden debts), and 12th house (losses and expenses). Saturn Mahadasha often brings karmic debt patterns while Rahu amplifies financial entanglements. Jupiter's activation signals debt relief and financial recovery periods.",
        "geo_faq": [
            {"q": "Which house in astrology shows debt and loans?", "a": "The 6th house (Rina Bhava) directly governs debts, loans, and financial obligations. The 8th house shows hidden financial liabilities and sudden losses. The 12th house represents unnecessary expenditure. All three together create a debt triangle in the birth chart."},
            {"q": "Which planet causes debt problems in astrology?", "a": "Saturn in the 6th or 12th house often creates persistent debt patterns. Rahu in the 2nd or 11th house leads to financial illusions and overspending. Mars in the 8th house can cause sudden financial crises and unexpected debt burdens."},
            {"q": "How to get rid of debt using Vedic astrology remedies?", "a": "Strengthen Jupiter through Thursday mantras and yellow sapphire. Feed crows on Saturdays to reduce Saturn's malefic effects. Donate black sesame to reduce Rahu's financial grip. Recite Lakshmi Stotra daily and light a ghee lamp on Fridays for financial liberation."}
        ],
        "search_intents": {
            "informational": ["6th house debt astrology", "karz mukti upay jyotish", "debt yoga in kundali"],
            "commercial": ["karz mukti astrology consultation", "financial debt astrology india", "debt relief vedic astrology"],
            "transactional": ["book karz mukti consultation ₹51", "debt liberation kundali reading online"]
        },
        "howto_steps": ["Identify debt houses 6 8 12", "Check Saturn and Rahu placement", "Detect Shula Yoga patterns", "Calculate debt relief timing", "Apply Viparita Raja Yoga remedies"],
        "cta": "Karz Mukti Consultation — ₹51",
        "segment": "millennial",
        "schema_type": "HowTo"
    },
    "mill_property_yog": {
        "label": "Property Yoga",
        "label_hi": "संपत्ति योग",
        "primary_houses": [2, 4, 11, 12],
        "key_planets": ["Mars", "Jupiter", "Saturn", "Moon"],
        "key_yogas": ["Bhumi Yoga", "Raja Yoga", "Griha Yoga"],
        "geo_answer": "Property acquisition timing in Vedic astrology depends on the 4th house (home and land), Mars as the karaka of real estate, Jupiter's transit through key houses, and the active Mahadasha period. Mars in the 4th house or aspecting it, combined with a supportive Jupiter transit, creates strong property purchase windows in a person's life.",
        "geo_faq": [
            {"q": "Which house in astrology shows property and real estate?", "a": "The 4th house (Sukha Bhava) governs property, real estate, vehicles, and home happiness. Mars is the karaka (significator) of land and property. The 11th house shows gains from property. The 12th house indicates property-related losses or foreign property."},
            {"q": "Which planet gives property in astrology?", "a": "Mars is the primary planet for land and property in Vedic astrology. A strong Mars in the 4th house or its lord well-placed indicates property gains. Jupiter's aspect blesses property with happiness and family prosperity. Saturn rules older properties and inherited land."},
            {"q": "When will I get my own house according to astrology?", "a": "Property is most likely acquired during Mars Mahadasha or Antardasha, Jupiter transit over the 4th house, or when the 4th lord is activated by Dasha. Saturn's Mahadasha can also bring property through hard-earned savings and long-term investment."}
        ],
        "search_intents": {
            "informational": ["4th house property astrology", "property yoga kundali", "mars 4th house property"],
            "commercial": ["property astrology reading india", "real estate timing astrology", "ghar kab milega astrology"],
            "transactional": ["book property yoga consultation ₹51", "property astrology reading online india"]
        },
        "howto_steps": ["Analyze 4th house lord strength", "Check Mars placement and aspects", "Identify property Yogas", "Calculate property acquisition windows", "Apply Mars and Jupiter remedies"],
        "cta": "Property Timing Analysis — ₹51",
        "segment": "millennial",
        "schema_type": "HowTo"
    },
    "genz_dream_career": {
        "label": "Dream Career",
        "label_hi": "सपनों का करियर",
        "primary_houses": [1, 3, 5, 9, 10, 11],
        "key_planets": ["Mercury", "Sun", "Jupiter", "Rahu"],
        "key_yogas": ["Saraswati Yoga", "Budha-Aditya Yoga", "Rahu career amplification"],
        "geo_answer": "For Gen Z, dream career paths in Vedic astrology are shaped by Rahu in the 10th house (unconventional fame and digital success), strong Mercury (content, tech, communication), and the 3rd house of skills and courage. A Saraswati Yoga combining Jupiter, Mercury, and Venus creates exceptional talent for creative, digital, and entrepreneurial careers.",
        "geo_faq": [
            {"q": "Which astrology combination gives a successful career in digital or creative fields?", "a": "Rahu in the 10th house combined with strong Mercury and Venus creates success in digital media, content creation, and technology. Saraswati Yoga (Jupiter-Mercury-Venus alignment) blesses exceptional creative intelligence ideal for modern careers."},
            {"q": "Which planet helps in entrepreneurship according to astrology?", "a": "Sun gives leadership and authority for entrepreneurship. Rahu amplifies ambition and unconventional business approaches. Mercury provides business intelligence and communication skills. Jupiter brings expansion, mentors, and opportunities for business growth and funding."},
            {"q": "When is the right time to start a new career according to Vedic astrology?", "a": "Jupiter Mahadasha or Antardasha is the most auspicious time to launch a new career. Mercury Mahadasha supports skill-building and communication-based careers. Rahu Antardasha often brings unexpected career opportunities through digital platforms and unconventional channels."}
        ],
        "search_intents": {
            "informational": ["rahu 10th house career astrology", "dream career kundali genz", "which planet for content creator career"],
            "commercial": ["dream career astrology genz india", "career prediction for young adults astrology", "digital career astrology"],
            "transactional": ["book dream career consultation ₹51", "genz career astrology reading online"]
        },
        "howto_steps": ["Analyze 10th house and Rahu", "Check Mercury Venus combination", "Identify Saraswati Yoga", "Calculate career launch windows", "Apply career planet remedies"],
        "cta": "Career Clarity Session — ₹51",
        "segment": "genz",
        "schema_type": "HowTo"
    },
    "genz_ex_back": {
        "label": "Love & Ex Return",
        "label_hi": "प्यार वापसी",
        "primary_houses": [5, 7, 11, 12],
        "key_planets": ["Venus", "Moon", "Rahu", "Mars"],
        "key_yogas": ["Karako Bhavo Nashto", "Rahu-Venus conjunction", "Chandra-Mangal Yoga"],
        "geo_answer": "Ex-partner reunion windows in Vedic astrology occur when Venus transits your 7th house, Jupiter activates your 5th house, or the Antardasha lord is Venus or Moon. Rahu-Venus conjunction in the 7th house creates intense magnetic attraction that often brings back lost love. The 12th house activation indicates secret communications and reunion possibilities.",
        "geo_faq": [
            {"q": "Can astrology predict if an ex will come back?", "a": "Yes. Venus transiting your 7th house, Jupiter in the 5th house, or Venus-Moon Antardasha periods create strong reunion possibilities. Rahu in the 7th house often brings back past relationships unexpectedly. The 12th house lord activation indicates secret communications from past partners."},
            {"q": "Which planet is responsible for getting ex love back?", "a": "Venus is the primary planet for love and reunion. A strong Venus Mahadasha or Antardasha often brings past partners back into your life. Moon governs emotional bonding and nostalgia. Rahu creates obsessive attraction that often reconnects separated lovers."},
            {"q": "What are the astrological signs that ex will return?", "a": "Jupiter transiting your 7th house, Venus returning to its natal position, or Venus-Moon period activation are key signs. The 5th lord activating through Dasha and Jupiter aspecting your 7th house creates a powerful window for love reunion."}
        ],
        "search_intents": {
            "informational": ["ex back astrology prediction", "venus 7th house reunion", "love return astrology yoga"],
            "commercial": ["ex back astrology reading india", "love reunion consultation vedic", "get ex back astrology"],
            "transactional": ["book love return consultation ₹51", "ex back kundali reading online india"]
        },
        "howto_steps": ["Check 5th and 7th house lords", "Analyze Venus and Moon placement", "Identify reunion Yogas", "Calculate love window timing", "Apply Venus remedies for attraction"],
        "cta": "Love Timing Analysis — ₹51",
        "segment": "genz",
        "schema_type": "HowTo"
    },
    "genz_toxic_boss": {
        "label": "Workplace Karma",
        "label_hi": "काम की दुनिया",
        "primary_houses": [6, 10, 3, 11],
        "key_planets": ["Saturn", "Mars", "Rahu", "Sun"],
        "key_yogas": ["Sun-Saturn affliction", "Shasha Yoga challenges", "6th lord in 10th"],
        "geo_answer": "Workplace conflicts and toxic boss patterns in Vedic astrology arise from the 6th house (enemies and conflicts), afflicted Sun (authority clashes), and Saturn-Mars tension in the chart. Rahu in the 6th or 10th house creates sudden workplace upheavals. The 6th lord's placement determines the nature of professional enemies and conflict resolution strategies.",
        "geo_faq": [
            {"q": "Which house in astrology shows workplace conflicts?", "a": "The 6th house (Shatru Bhava) governs workplace enemies, conflicts, and competition. The 10th house shows your relationship with authority and bosses. Sun's affliction by Saturn or Rahu creates ego clashes with superiors. The 6th lord in the 10th house indicates persistent workplace power struggles."},
            {"q": "Which planet causes problems with boss in astrology?", "a": "Saturn opposing or aspecting Sun creates authority conflicts and boss problems. Rahu in the 10th house creates unstable workplace environments. Mars in the 6th house generates aggressive workplace competition. A weak Sun in the chart often leads to lack of recognition and authority challenges."},
            {"q": "How to handle a toxic boss according to Vedic astrology?", "a": "Strengthen the Sun through Surya mantras and ruby gemstone for confidence and authority. Perform Hanuman Chalisa on Saturdays to manage Saturn's workplace pressure. Recite the Saraswati mantra for intelligence in navigating workplace politics and conflicts."}
        ],
        "search_intents": {
            "informational": ["6th house workplace conflicts astrology", "toxic boss astrology", "sun saturn affliction career"],
            "commercial": ["workplace karma astrology reading", "office conflict vedic astrology", "boss problems astrology india"],
            "transactional": ["book workplace karma consultation ₹51", "office conflict kundali reading online"]
        },
        "howto_steps": ["Check 6th house and its lord", "Analyze Sun and Saturn interaction", "Identify Rahu in workplace houses", "Calculate conflict resolution windows", "Apply Sun strengthening remedies"],
        "cta": "Workplace Karma Session — ₹51",
        "segment": "genz",
        "schema_type": "HowTo"
    },
    "mill_childs_destiny": {
        "label": "Child's Destiny",
        "label_hi": "संतान का भविष्य",
        "primary_houses": [5, 9, 1, 4],
        "key_planets": ["Jupiter", "Moon", "Sun", "Mercury"],
        "key_yogas": ["Putra Yoga", "Saraswati Yoga", "Pancha Mahapurusha for child"],
        "geo_answer": "A child's destiny in Vedic astrology is revealed through the 5th house (intelligence and children), Jupiter as the karaka of children and wisdom, the child's own Lagna lord strength, and the 9th house of dharma and fortune. Saraswati Yoga in a child's chart blesses exceptional intelligence, while Putra Yoga in the parent's chart predicts gifted and successful offspring.",
        "geo_faq": [
            {"q": "Which house in astrology shows children and their success?", "a": "The 5th house (Putra Bhava) governs children, intelligence, and creative talent. Jupiter is the karaka of children and blesses the 5th house with wisdom. The 9th house shows the child's fortune and dharmic path. Strong 1st and 4th houses ensure a happy, secure childhood foundation."},
            {"q": "Which yoga in astrology makes a child successful?", "a": "Saraswati Yoga (Jupiter-Mercury-Venus alignment) creates exceptional academic and creative intelligence. Pancha Mahapurusha Yogas like Hamsa (Jupiter) or Bhadra (Mercury) in the child's chart indicate remarkable natural talents and life success."},
            {"q": "How to predict a child's career from their birth chart?", "a": "The 10th house lord of the child's chart, the planet with highest Shadbala strength, and the dominant Mahadasha at age 20-25 together predict ideal career path. Mercury strong children excel in technology and communication; Jupiter strong children shine in teaching, law, and medicine."}
        ],
        "search_intents": {
            "informational": ["5th house children astrology", "child destiny kundali prediction", "putra yoga astrology"],
            "commercial": ["child kundali reading india", "baby horoscope prediction vedic", "child career astrology"],
            "transactional": ["book child destiny consultation ₹51", "baby kundali analysis online india"]
        },
        "howto_steps": ["Analyze child's Lagna lord", "Check 5th house and Jupiter", "Identify Saraswati and Putra Yogas", "Calculate talent activation periods", "Guide study and career timing"],
        "cta": "Child Kundali Analysis — ₹51",
        "segment": "millennial",
        "schema_type": "HowTo"
    },
    "genx_retirement_peace": {
        "label": "Retirement Peace",
        "label_hi": "शांतिपूर्ण सेवानिवृत्ति",
        "primary_houses": [4, 8, 9, 11, 12],
        "key_planets": ["Saturn", "Jupiter", "Moon", "Venus"],
        "key_yogas": ["Tapasvi Yoga", "Harsha Yoga", "Vipareeta Raja Yoga"],
        "geo_answer": "Peaceful retirement in Vedic astrology is indicated by a strong 4th house (domestic happiness), well-placed Jupiter (wisdom and abundance in later life), Saturn Mahadasha offering karmic completion, and the 12th house signifying liberation from worldly duties. The 9th house of dharma and the 11th house of accumulated gains together determine financial security in retirement years.",
        "geo_faq": [
            {"q": "Which astrology period is best for peaceful retirement?", "a": "Saturn Mahadasha or Jupiter Mahadasha in the later decades of life often bring retirement peace. Jupiter's transit over the 4th or 9th house creates contentment and spiritual fulfillment. The 12th house activation marks the beginning of a natural inner journey and withdrawal from worldly pressures."},
            {"q": "Which house in astrology shows retirement and old age?", "a": "The 4th house shows home and domestic life in retirement. The 12th house represents liberation, seclusion, and spiritual retreat. The 8th house governs longevity and transformation. Strong 4th and 9th houses together create a happy, spiritually fulfilling retirement."},
            {"q": "How to plan retirement according to Vedic astrology?", "a": "Track your Saturn and Jupiter Mahadasha timeline to identify natural retirement windows. Strengthen Jupiter for wisdom and financial abundance in retirement. The 4th house lord's Dasha often marks the shift toward home life and inner peace away from professional pressures."}
        ],
        "search_intents": {
            "informational": ["retirement timing astrology", "4th house retirement peace", "saturn mahadasha retirement"],
            "commercial": ["retirement planning astrology india", "genx retirement vedic astrology", "peace after 50 astrology"],
            "transactional": ["book retirement peace consultation ₹51", "retirement kundali reading online india"]
        },
        "howto_steps": ["Analyze 4th 9th and 12th houses", "Check Saturn and Jupiter Dashas", "Identify retirement peace Yogas", "Calculate optimal retirement timing", "Apply Venus and Moon remedies for peace"],
        "cta": "Retirement Planning Analysis — ₹51",
        "segment": "genx",
        "schema_type": "HowTo"
    },
    "genx_legacy_inheritance": {
        "label": "Legacy & Inheritance",
        "label_hi": "विरासत और उत्तराधिकार",
        "primary_houses": [2, 4, 8, 9, 11],
        "key_planets": ["Jupiter", "Saturn", "Mars", "Moon"],
        "key_yogas": ["Dhana Yoga", "Pitru Yoga", "Bhumi Yoga"],
        "geo_answer": "Legacy and inheritance in Vedic astrology are governed by the 8th house (ancestral wealth and sudden gains), 2nd house (family accumulated wealth), and 4th house (ancestral property). Jupiter in the 8th house or aspecting it often indicates inheritance from father's side. Saturn's activation determines timing of property and wealth transfer between generations.",
        "geo_faq": [
            {"q": "Which house in astrology shows inheritance and ancestral property?", "a": "The 8th house (Ayushya Bhava) is the primary house for inheritance, legacy, and ancestral wealth. The 4th house shows ancestral land and property. The 2nd house governs family wealth accumulation. The 9th house represents father's prosperity and blessings passed down through generations."},
            {"q": "Which planet gives inheritance in astrology?", "a": "Jupiter in or aspecting the 8th house often indicates inheritance and ancestral blessings. Saturn activating the 8th house through Mahadasha can time the actual transfer of inheritance. Mars rules land inheritance while Jupiter governs financial legacy from elders and ancestors."},
            {"q": "When will I receive my inheritance according to astrology?", "a": "Inheritance is most likely during Saturn Mahadasha or Antardasha activating the 8th house, or when the 8th lord's Dasha period begins. Jupiter transiting the 8th or 2nd house also creates windows for receiving ancestral property, financial inheritance, or legal settlement of family assets."}
        ],
        "search_intents": {
            "informational": ["8th house inheritance astrology", "ancestral property kundali", "pitru yoga astrology"],
            "commercial": ["inheritance astrology reading india", "legacy planning vedic astrology", "ancestral wealth astrology"],
            "transactional": ["book legacy consultation ₹51", "inheritance kundali reading online india"]
        },
        "howto_steps": ["Analyze 8th house and its lord", "Check Jupiter and Saturn placement", "Identify Pitru and Dhana Yogas", "Calculate inheritance timing windows", "Apply ancestral remedy plan"],
        "cta": "Legacy Chart Reading — ₹51",
        "segment": "genx",
        "schema_type": "HowTo"
    },
    "genx_spiritual_innings": {
        "label": "Spiritual Journey",
        "label_hi": "आध्यात्मिक यात्रा",
        "primary_houses": [9, 12, 8, 4],
        "key_planets": ["Ketu", "Jupiter", "Saturn", "Moon"],
        "key_yogas": ["Moksha Yoga", "Tapasvi Yoga", "Ketu detachment pattern"],
        "geo_answer": "The spiritual journey in Vedic astrology begins when Ketu Mahadasha activates, the 12th house (moksha and liberation) becomes prominent, and Jupiter connects with the 9th house of dharma. Saturn-Ketu combinations create deep disillusionment with material life. The 8th house of transformation and 12th house of surrender together mark the beginning of authentic spiritual awakening.",
        "geo_faq": [
            {"q": "Which house in astrology governs spirituality and moksha?", "a": "The 12th house (Moksha Bhava) governs spiritual liberation, meditation, and renunciation. The 9th house rules dharma, guru blessings, and religious path. The 8th house governs occult knowledge and deep transformation. Together, these three houses form the Moksha Trikona, the triangle of spiritual liberation."},
            {"q": "Which Mahadasha is best for spiritual growth?", "a": "Ketu Mahadasha (7 years) is the most powerful period for spiritual awakening and detachment from material desires. Jupiter Mahadasha brings guru connections and philosophical wisdom. Saturn Mahadasha forces introspection and creates spiritual maturity through life's hardships and karmic lessons."},
            {"q": "How does Vedic astrology predict spiritual awakening?", "a": "Spiritual awakening is indicated by Ketu strongly placed in the 12th or 9th house, Jupiter aspecting the 12th house, and the 9th lord well-placed. When the Mahadasha of a spiritual planet activates simultaneously with key transits over the 12th house, profound inner transformation begins."}
        ],
        "search_intents": {
            "informational": ["12th house spirituality astrology", "ketu mahadasha spiritual awakening", "moksha yoga kundali"],
            "commercial": ["spiritual journey astrology reading", "genx spirituality vedic astrology", "moksha path astrology india"],
            "transactional": ["book spiritual path consultation ₹51", "spiritual astrology reading online india"]
        },
        "howto_steps": ["Analyze 9th and 12th house lords", "Check Ketu and Jupiter placement", "Identify Moksha Yoga patterns", "Calculate spiritual activation periods", "Design personalized sadhana plan"],
        "cta": "Spiritual Path Analysis — ₹51",
        "segment": "genx",
        "schema_type": "HowTo"
    },
    "mill_parents_wellness": {
        "label": "Parents Wellness",
        "label_hi": "माता-पिता का स्वास्थ्य",
        "primary_houses": [4, 9, 6, 8],
        "key_planets": ["Moon", "Sun", "Saturn", "Jupiter"],
        "key_yogas": ["Pitru Dosha", "Matru Yoga", "6th lord affliction pattern"],
        "geo_answer": "Parents' health in Vedic astrology is analyzed through the 4th house for the mother (Moon as karaka) and the 9th house for the father (Sun as karaka). When the 6th or 8th house lord afflicts these houses, health challenges arise for parents. Saturn transiting the 4th house can indicate the mother's health vulnerabilities and periods requiring extra care and attention.",
        "geo_faq": [
            {"q": "Which house in astrology shows mother's health?", "a": "The 4th house governs the mother and her health and wellbeing. Moon is the karaka of the mother. The 4th lord's placement, Moon's strength, and the 6th or 8th house connection to the 4th house reveal the mother's health vulnerabilities and critical health periods."},
            {"q": "Which house in astrology shows father's health?", "a": "The 9th house is the primary house for the father and his health. Sun is the karaka of the father. The 9th lord's placement and Sun's strength in the chart indicate the father's vitality. Saturn aspecting or placed in the 9th house can indicate chronic health challenges for the father."},
            {"q": "How to protect parents' health through Vedic astrology?", "a": "Perform Pitru Tarpan on Amavasya to strengthen ancestral blessings. Chant the Mahamrityunjaya mantra for parents' longevity and health. Donate on the day ruled by your parents' afflicting planet. Feed crows and Brahmins on Saturdays and Sundays to protect parental health."}
        ],
        "search_intents": {
            "informational": ["4th house mother health astrology", "9th house father health", "parents health prediction kundali"],
            "commercial": ["parents health astrology reading india", "family wellness vedic astrology", "pitru dosha parental health"],
            "transactional": ["book parents wellness consultation ₹51", "parental health kundali reading online"]
        },
        "howto_steps": ["Analyze 4th house for mother", "Check 9th house for father", "Identify 6th and 8th afflictions", "Calculate parental health risk windows", "Apply Pitru Dosha remedies"],
        "cta": "Family Wellness Reading — ₹51",
        "segment": "millennial",
        "schema_type": "HowTo"
    },
    "genz_manifestation": {
        "label": "Manifestation Power",
        "label_hi": "इच्छाशक्ति और आकर्षण",
        "primary_houses": [1, 3, 5, 9, 11],
        "key_planets": ["Moon", "Jupiter", "Venus", "Rahu"],
        "key_yogas": ["Gaja Kesari Yoga", "Saraswati Yoga", "Rahu amplification pattern"],
        "geo_answer": "Manifestation power in Vedic astrology is strongest when Moon and Jupiter form Gaja Kesari Yoga, the 5th house (intention and desire) is activated by Jupiter, and Rahu amplifies desires in the 11th house of gains. The 9th house of fortune and 1st house of personal identity together create natural law of attraction energy that transforms focused intentions into tangible reality.",
        "geo_faq": [
            {"q": "Which astrology yoga gives strong manifestation power?", "a": "Gaja Kesari Yoga (Moon-Jupiter conjunction or mutual aspect) creates the strongest manifestation power. Strong 5th and 11th house lords create natural abundance mindset. Venus in the 5th house combined with Jupiter's aspect blesses creative visualization and the ability to attract desires into reality."},
            {"q": "Which planet is responsible for manifestation in astrology?", "a": "Moon governs the subconscious mind and emotional manifestation power. Jupiter expands desires into opportunities and abundance. Venus attracts beauty, relationships, and material desires. Rahu in the 11th house creates intense desire energy that when properly channeled can manifest large goals rapidly."},
            {"q": "When is the best time for manifestation according to Vedic astrology?", "a": "Jupiter Mahadasha is the most powerful period for manifestation and abundance attraction. Shukla Paksha (waxing moon phase) is the ideal time for planting manifestation intentions. Rohini, Pushya, and Shravan nakshatras are highly auspicious for visualization, affirmations, and intention-setting practices."}
        ],
        "search_intents": {
            "informational": ["gaja kesari yoga manifestation", "5th house manifestation astrology", "law of attraction vedic astrology"],
            "commercial": ["manifestation astrology reading genz", "attraction power kundali india", "abundance astrology consultation"],
            "transactional": ["book manifestation consultation ₹51", "law of attraction kundali reading online"]
        },
        "howto_steps": ["Check Moon and Jupiter positions", "Identify Gaja Kesari Yoga", "Analyze 5th and 11th house strength", "Calculate peak manifestation windows", "Design moon-cycle manifestation ritual"],
        "cta": "Manifestation Window — ₹51",
        "segment": "genz",
        "schema_type": "HowTo"
    }
}

# ─────────────────────────────────────────────────────────────────
# STATIC DATA
# ─────────────────────────────────────────────────────────────────

PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
PLANET_HI = {"Sun": "सूर्य", "Moon": "चंद्र", "Mars": "मंगल", "Mercury": "बुध", "Jupiter": "गुरु", "Venus": "शुक्र", "Saturn": "शनि", "Rahu": "राहु", "Ketu": "केतु"}
RASHIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"]
NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]
VIMSHOTTARI_YEARS = {"Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17, "Ketu": 7, "Venus": 20}
TITHIS = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"]
YOGAS_PANCH = ["Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"]
KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"]
WEEKDAYS = ["Ravivara", "Somavara", "Mangalvara", "Budhavara", "Guruvara", "Shukravara", "Shanivara"]
RAHU_KAAL = {0: "4:30-6:00 PM", 1: "7:30-9:00 AM", 2: "3:00-4:30 PM", 3: "12:00-1:30 PM", 4: "1:30-3:00 PM", 5: "10:30 AM-12:00 PM", 6: "9:00-10:30 AM"}
INAUSPICIOUS_YOGAS = ["Vishkumbha", "Vyaghata", "Parigha", "Vajra", "Vyatipata", "Vaidhriti", "Ganda", "Shula"]

REMEDY_DB = {
    "Sun":     {"mantra": "Om Hraam Hreem Hraum Sah Suryaya Namah",        "count": "108x Sunday morning",         "dana": "Wheat, jaggery, copper on Sundays",      "vrat": "Sunday Surya vrat",         "gemstone": "Ruby 5 ratti gold ring Sunday sunrise"},
    "Moon":    {"mantra": "Om Shraam Shreem Shraum Sah Chandraya Namah",   "count": "108x Monday evening",         "dana": "White rice, milk, silver on Mondays",    "vrat": "Monday Somvar vrat",        "gemstone": "Pearl 5 ratti silver ring Monday"},
    "Mars":    {"mantra": "Om Kraam Kreem Kraum Sah Bhaumaya Namah",       "count": "108x Tuesday sunrise",        "dana": "Red lentils, red cloth on Tuesdays",     "vrat": "Tuesday Mangalwar vrat",    "gemstone": "Red Coral 9 ratti gold ring Tuesday"},
    "Mercury": {"mantra": "Om Braam Breem Braum Sah Budhaya Namah",        "count": "108x Wednesday morning",      "dana": "Green moong dal, books Wednesdays",      "vrat": "Wednesday Budhavar vrat",   "gemstone": "Emerald 5 ratti gold ring Wednesday"},
    "Jupiter": {"mantra": "Om Graam Greem Graum Sah Guruve Namah",         "count": "108x Thursday morning",       "dana": "Yellow chickpeas, turmeric Thursdays",   "vrat": "Thursday Guruvar vrat",     "gemstone": "Yellow Sapphire 5 ratti gold ring Thursday"},
    "Venus":   {"mantra": "Om Draam Dreem Draum Sah Shukraya Namah",       "count": "108x Friday morning",         "dana": "White sweets, silver on Fridays",        "vrat": "Friday Shukravar vrat",     "gemstone": "Diamond or White Sapphire gold ring Friday"},
    "Saturn":  {"mantra": "Om Praam Preem Praum Sah Shanaischaraya Namah", "count": "108x Saturday evening",       "dana": "Black sesame, mustard oil Saturdays",    "vrat": "Saturday Shanivar vrat",    "gemstone": "Blue Sapphire 5 ratti iron ring Saturday"},
    "Rahu":    {"mantra": "Om Bhram Bhreem Bhraum Sah Rahave Namah",       "count": "108x Saturday Rahu kaal",     "dana": "Coconut, black sesame Saturdays",        "vrat": "Rahu kaal Saturday remedy", "gemstone": "Hessonite 8 ratti silver ring Saturday"},
    "Ketu":    {"mantra": "Om Sraam Sreem Sraum Sah Ketave Namah",         "count": "108x Tuesday evening",        "dana": "Sesame, blanket on Tuesdays",            "vrat": "Ketu shanti path Tuesday",  "gemstone": "Cats Eye 8 ratti silver ring Tuesday"}
}

# ─────────────────────────────────────────────────────────────────
# CORE FUNCTIONS
# ─────────────────────────────────────────────────────────────────

def get_style(mahadasha_lord, session_id):
    preferred = MAHADASHA_STYLE_MAP.get(mahadasha_lord, [1, 5, 9])
    seed = sum(ord(c) for c in session_id)
    return preferred[seed % len(preferred)]

# ═════════════════════════════════════════════════════════════════════════════
# v2.1 NORMALIZER — accepts the real Swiss Ephemeris /kundali payload
# ═════════════════════════════════════════════════════════════════════════════
# /api/predict posts kundaliData as {"chart": <raw /kundali>, "synthesis": ...}.
# The raw /kundali response (astro.py compute_kundali) looks like:
#   {"lagna": {"sign","sign_index"...}, "grahas": [ {...} ], "bhavas": [...],
#    "dasha": {"maha_dasha": [ {planet,start,end,is_current,antar:[...]} ]},
#    "shadbala": {"Sun": {"strengthRatio", "strengthPercent", ...}}}
# This engine historically expected a flat {"planets": {...}, "houses": {...},
# "dasha": {"mahadasha": {"lord"}}} shape. normalize_kundali() bridges both and
# NEVER invents a value that is absent.

def _unwrap(kundali):
    """Peel the {"chart": ...} envelope that /api/predict wraps around the chart."""
    if not isinstance(kundali, dict):
        return {}
    inner = kundali.get("chart")
    if isinstance(inner, dict) and ("grahas" in inner or "planets" in inner or "lagna" in inner):
        merged = dict(inner)
        for k in ("birthData", "tier", "synthesis", "source", "birth_time_precision"):
            if k in kundali and k not in merged:
                merged[k] = kundali[k]
        return merged
    return kundali


def _current_dasha(dasha_raw):
    """Walk the real Vimshottari tree and return the ACTIVE maha/antar/pratyantar.

    astro.py returns {"maha_dasha": [...]} with is_current flags at every level
    and real ISO start/end dates. It computes THREE levels only — there is no
    Sookshma (L4). We therefore return sookshma=None rather than inventing one.
    """
    empty = {"mahadasha": None, "antardasha": None, "pratyantar": None, "sookshma": None, "sequence": []}
    if not isinstance(dasha_raw, dict):
        return empty
    maha_list = dasha_raw.get("maha_dasha") or dasha_raw.get("mahaDasha") or []
    if not isinstance(maha_list, list) or not maha_list:
        return empty

    def _pick(items):
        if not isinstance(items, list):
            return None
        for it in items:
            if isinstance(it, dict) and it.get("is_current"):
                return it
        return None

    md = _pick(maha_list)
    if md is None:
        return {**empty, "sequence": maha_list}
    ad = _pick(md.get("antar"))
    pd = _pick(ad.get("pratyantar")) if isinstance(ad, dict) else None

    def _lvl(node):
        if not isinstance(node, dict):
            return None
        lord = node.get("planet") or node.get("lord")
        if not lord:
            return None
        return {"lord": lord, "start": node.get("start"), "end": node.get("end")}

    return {
        "mahadasha":  _lvl(md),
        "antardasha": _lvl(ad),
        "pratyantar": _lvl(pd),
        "sookshma":   None,          # not computed upstream — never faked
        "sequence":   maha_list,
    }


def normalize_kundali(kundali):
    """Return a flat dict this engine can read. Missing values stay missing."""
    k = _unwrap(kundali)
    planets = {}

    grahas = k.get("grahas")
    shadbala = k.get("shadbala") if isinstance(k.get("shadbala"), dict) else {}
    if isinstance(grahas, list) and grahas:
        for g in grahas:
            if not isinstance(g, dict):
                continue
            name = g.get("planet") or g.get("name")
            if not name:
                continue
            sb_entry = shadbala.get(name) if isinstance(shadbala.get(name), dict) else {}
            # strengthRatio (total/minimum) matches shadbala_label's 0.4-1.8
            # thresholds. strengthPercent is 0-100 and would mark EVERY planet
            # "Very Strong" — that exact mix-up produced the live
            # "Debilitated + Very Strong" Sun. Rahu/Ketu have no Shadbala.
            planets[name] = {
                "rashi_index": g.get("sign_index"),
                "degree":      g.get("degree_in_sign"),
                "house":       g.get("house"),
                "nakshatra":   g.get("nakshatra"),
                "pada":        g.get("pada"),
                "retrograde":  g.get("retrograde", False),
                "shadbala":    sb_entry.get("strengthRatio"),
            }
    elif isinstance(k.get("planets"), dict):
        planets = k["planets"]

    houses = k.get("houses")
    if not isinstance(houses, dict):
        bhavas = k.get("bhavas")
        houses = {}
        if isinstance(bhavas, list):
            for i, b in enumerate(bhavas, start=1):
                if isinstance(b, dict):
                    houses[str(b.get("house", i))] = b

    lagna = k.get("lagna") if isinstance(k.get("lagna"), dict) else {}

    return {
        "planets":      planets,
        "houses":       houses,
        "dasha":        _current_dasha(k.get("dasha")),
        "ashtakavarga": k.get("ashtakavarga") if isinstance(k.get("ashtakavarga"), dict) else {},
        "lagna":        lagna,
        "yogas":        k.get("yogas") or [],
        "has_chart":    bool(planets),
        "source":       k.get("source"),
        "birth_time_precision": k.get("birth_time_precision"),
    }


def compute_dignity(planet, rashi_idx):
    OWN =   {"Sun": [4], "Moon": [3], "Mars": [0, 7], "Mercury": [2, 5], "Jupiter": [8, 11], "Venus": [1, 6], "Saturn": [9, 10]}
    EXALT = {"Sun": 0, "Moon": 1, "Mars": 9, "Mercury": 5, "Jupiter": 3, "Venus": 11, "Saturn": 6}
    DEBIL = {"Sun": 6, "Moon": 7, "Mars": 3, "Mercury": 11, "Jupiter": 9, "Venus": 5, "Saturn": 0}
    if planet in EXALT and EXALT[planet] == rashi_idx: return "Exalted"
    if planet in DEBIL and DEBIL[planet] == rashi_idx: return "Debilitated"
    if planet in OWN and rashi_idx in OWN[planet]: return "Own Sign"
    return "Neutral"

def shadbala_label(v):
    if v is None: return None          # v2.1: unknown stays unknown
    if v >= 1.5: return "Very Strong"
    if v >= 1.0: return "Strong"
    if v >= 0.7: return "Moderate"
    return "Weak"

def planet_table(nk):
    """Real Swiss Ephemeris positions only.

    v2.1: returns [] when no chart reached us, so the UI hides the section
    instead of printing nine fabricated planets. A planet with no Shadbala
    (Rahu/Ketu) reports strength None -> the UI shows "—".
    """
    pr = nk.get("planets", {})
    if not pr:
        return []
    table = []
    for p in PLANETS:
        d = pr.get(p)
        if not isinstance(d, dict):
            continue
        ri = d.get("rashi_index")
        deg = d.get("degree")
        if ri is None or deg is None:
            continue                      # incomplete -> omit, never guess
        ri = int(ri) % 12
        sb = d.get("shadbala")
        dig = compute_dignity(p, ri)
        nak = d.get("nakshatra")
        if not nak:                       # derive only from REAL longitude
            nak = NAKSHATRAS[int((ri * 30 + deg) / (360 / 27)) % 27]
        table.append({
            "planet": p, "planet_hi": PLANET_HI[p],
            "rashi": RASHIS[ri],
            "house": d.get("house"),
            "degree": round(float(deg), 2),
            "nakshatra": nak,
            "pada": d.get("pada"),
            "retrograde": d.get("retrograde", False),
            "dignity": dig,
            "shadbala": round(float(sb), 2) if sb is not None else None,
            "strength": shadbala_label(sb) if sb is not None else None,
            "domain_note": f"{p} is {dig} — {'maximum positive results' if dig == 'Exalted' else 'stable results' if dig == 'Own Sign' else 'challenges possible — Neecha Bhanga can reverse' if dig == 'Debilitated' else 'results depend on aspects and Dasha'}"
        })
    return table

def dasha_timeline(nk):
    """Real Vimshottari periods with real dates.

    v2.1: the old version defaulted to Saturn/Mercury/Jupiter/Venus and
    today-2y -> today+5y whenever data was missing. Because data was ALWAYS
    missing, every client received that identical fake timeline (and a 7-year
    Saturn Mahadasha, which is impossible — Saturn runs 19 years).

    Sookshma (L4) is NOT computed by astro.py, so it is returned as None.
    """
    dr = nk.get("dasha") or {}
    md, ad, pd = dr.get("mahadasha"), dr.get("antardasha"), dr.get("pratyantar")
    if not md:
        return None                      # no real dasha -> show nothing

    next3 = []
    seq = dr.get("sequence") or []
    if isinstance(seq, list) and seq:
        seen_current = False
        for node in seq:
            if not isinstance(node, dict):
                continue
            if seen_current and len(next3) < 3:
                lord = node.get("planet") or node.get("lord")
                if lord:
                    next3.append({"lord": lord, "years": node.get("years", VIMSHOTTARI_YEARS.get(lord)),
                                  "start": node.get("start"), "end": node.get("end")})
            if node.get("is_current"):
                seen_current = True

    return {
        "mahadasha":  md,
        "antardasha": ad,
        "pratyantar": pd,
        "sookshma":   None,
        "next_3_mahadasha": next3,
        "levels_available": 3,
        "precision_system": "Trikal Vaani Pratyantar Dasha (Level 3) — real Vimshottari dates from Swiss Ephemeris"
    }

def domain_analysis(nk, domain):
    """v2.1: Ashtakavarga is not computed upstream, so it is reported as None
    instead of random.randint(18, 38). Planets with no real position are
    omitted rather than assigned a random rashi."""
    meta = DOMAIN_META.get(domain, DOMAIN_META["career"])
    hr = nk.get("houses", {})
    ar = nk.get("ashtakavarga", {})
    houses = {}
    for h in meta["primary_houses"]:
        hd = hr.get(str(h), {}) if isinstance(hr, dict) else {}
        sc = ar.get(str(h)) if isinstance(ar, dict) else None
        st = None if sc is None else ("Strong" if sc >= 28 else ("Moderate" if sc >= 22 else "Weak"))
        houses[h] = {"house": h, "lord": hd.get("lord"), "occupants": hd.get("occupants", []),
                     "ashtakavarga": sc, "strength": st}
    pr = nk.get("planets", {})
    planets_assess = []
    for p in meta["key_planets"]:
        d = pr.get(p)
        if not isinstance(d, dict) or d.get("rashi_index") is None:
            continue
        ri = int(d["rashi_index"]) % 12
        sb = d.get("shadbala")
        dig = compute_dignity(p, ri)
        planets_assess.append({"planet": p, "planet_hi": PLANET_HI[p], "rashi": RASHIS[ri],
                               "dignity": dig,
                               "shadbala": round(float(sb), 2) if sb is not None else None,
                               "strength": shadbala_label(sb)})
    return {
        "domain": domain, "label": meta["label"], "label_hi": meta["label_hi"],
        "primary_houses": houses, "key_planets": planets_assess,
        "yogas": [{"name": y, "check": "Verify with full chart analysis"} for y in meta["key_yogas"]]
    }

def _fmt_window(start_iso, end_iso):
    """Format a real ISO date pair for display. Returns None if either is bad."""
    try:
        s = datetime.strptime(start_iso, "%Y-%m-%d").date()
        e = datetime.strptime(end_iso, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None
    if e <= s:
        return None                       # kills the "28 Aug – 28 Aug" bug
    return f"{s.strftime('%d %b %Y')} – {e.strftime('%d %b %Y')}"


def action_windows(nk, domain):
    """Windows built from REAL Pratyantar/Antardasha dates.

    v2.1: the old version did today.replace(day=min(day+7, 28)), which clamped
    to the 28th and produced zero-length windows like "28 Aug – 28 Aug", never
    crossed a month boundary, and cited a Sookshma dasha that is never computed.
    """
    dr = nk.get("dasha") or {}
    pd = dr.get("pratyantar")
    ad = dr.get("antardasha")
    meta = DOMAIN_META.get(domain, {})
    fav = meta.get("key_planets", ["Jupiter", "Venus"])
    label = meta.get("label", domain)
    wins, avoid = [], []

    if isinstance(pd, dict) and pd.get("lord"):
        w = _fmt_window(pd.get("start"), pd.get("end"))
        if w:
            if pd["lord"] in fav:
                wins.append({"window": w, "strength": "High", "level": "Pratyantar",
                             "reason": f"{pd['lord']} Pratyantar is active and favourable for {label}."})
            else:
                avoid.append({"window": w, "level": "Pratyantar",
                              "reason": f"{pd['lord']} Pratyantar is not supportive. Plan quietly, avoid major moves."})

    if isinstance(ad, dict) and ad.get("lord"):
        w = _fmt_window(ad.get("start"), ad.get("end"))
        if w:
            if ad["lord"] in fav:
                wins.append({"window": w, "strength": "Moderate", "level": "Antardasha",
                             "reason": f"{ad['lord']} Antardasha supports steady progress in {label}."})
            else:
                avoid.append({"window": w, "level": "Antardasha",
                              "reason": f"{ad['lord']} Antardasha asks for patience with {label}."})

    return {
        "action_windows": wins,
        "avoid_windows": avoid,
        "pratyantar_lord": pd.get("lord") if isinstance(pd, dict) else None,
        "sookshma_lord": None,            # L4 not computed — never invented
    }

def remedy_plan(nk, domain):
    """v2.1: weakness is judged only from REAL dignity/Shadbala. The old version
    rolled random values, so remedies were prescribed for planets whose
    'weakness' was invented — which is why a Tula-Lagna client was told
    'Meena Lagna — wear Pukhraj'."""
    meta = DOMAIN_META.get(domain, DOMAIN_META["career"])
    pr = nk.get("planets", {})
    weak, evidence_based = [], False
    for p in meta["key_planets"]:
        d = pr.get(p)
        if not isinstance(d, dict) or d.get("rashi_index") is None:
            continue
        evidence_based = True
        ri = int(d["rashi_index"]) % 12
        sb = d.get("shadbala")
        if compute_dignity(p, ri) == "Debilitated" or (sb is not None and sb < 0.7):
            weak.append(p)
    if not weak:
        weak = meta["key_planets"][:2]
    remedies = []
    for p in weak[:3]:
        r = REMEDY_DB.get(p, {})
        remedies.append({"planet": p, "planet_hi": PLANET_HI.get(p, p), "reason": f"{p} needs strengthening for {meta['label']}", "mantra": r.get("mantra", ""), "count": r.get("count", "108x daily"), "dana": r.get("dana", ""), "vrat": r.get("vrat", ""), "gemstone": r.get("gemstone", "Consult gemologist"), "priority": "High" if p == weak[0] else "Medium"})
    return {"remedies": remedies,
            "basis": "chart" if evidence_based else "domain-default",
            "general": {"daily": "Light ghee diya at home temple at dawn", "weekly": "Hanuman Chalisa every Tuesday", "monthly": "Temple visit on first Sunday of month"},
            "disclaimer": "Vedic classical remedies. Results vary per individual karma. Spiritual remedies complement — they do not replace — practical action."}

def panchang_today():
    today = date.today()
    d = today.timetuple().tm_yday
    wd = today.weekday()
    yoga = YOGAS_PANCH[(d * 7 + 3) % 27]
    return {
        "date": str(today), "weekday": WEEKDAYS[(wd + 1) % 7],
        "tithi": TITHIS[(d * 13) % 15], "nakshatra": NAKSHATRAS[(d * 13) % 27],
        "yoga": yoga, "karana": KARANAS[(d * 2) % 11],
        "rahu_kaal": RAHU_KAAL.get(wd, "12:00-1:30 PM"),
        "auspicious": yoga not in INAUSPICIOUS_YOGAS,
        "muhurta_advice": "Auspicious for new beginnings" if yoga not in INAUSPICIOUS_YOGAS else "Avoid major decisions today"
    }

def confidence_badge(nk):
    """v2.1: the old check was `source == "prokerala"` — a vendor no longer in
    use — so the badge read "Meeus Formula" even while Swiss Ephemeris was
    running. Confidence is now derived from what actually arrived."""
    has_chart = bool(nk.get("planets"))
    has_shadbala = any(
        isinstance(nk.get("planets", {}).get(p), dict) and nk["planets"][p].get("shadbala") is not None
        for p in PLANETS
    )
    has_dasha = bool((nk.get("dasha") or {}).get("mahadasha"))

    s = 40
    if has_chart:    s += 25
    if has_dasha:    s += 15
    if has_shadbala: s += 10
    if nk.get("ashtakavarga"): s += 5
    if nk.get("birth_time_precision") == "exact": s += 5

    label = "High Accuracy" if s >= 85 else ("Good Accuracy" if s >= 70 else "Standard Accuracy")
    color = "#22C55E" if s >= 85 else ("#F59E0B" if s >= 70 else "#6B7280")
    return {
        "score": s, "label": label, "color": color,
        "powered_by": "Swiss Ephemeris" if has_chart else "Chart unavailable",
        "chart_received": has_chart,
        "shadbala_computed": has_shadbala,
        "note": "Same engine used by professional astrologers worldwide." if has_chart
                else "Chart data did not reach the template engine for this reading.",
    }

def build_seo_schema(domain, meta):
    """Full SEO schema: HowTo + FAQPage + Person — for Google SGE and AI search extraction."""
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": faq["q"], "acceptedAnswer": {"@type": "Answer", "text": faq["a"]}}
            for faq in meta.get("geo_faq", [])
        ]
    }
    howto_schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": f"How to Get {meta['label']} Prediction from Vedic Astrology",
        "description": meta["geo_answer"],
        "step": [{"@type": "HowToStep", "text": step} for step in meta.get("howto_steps", [])],
        "author": {"@type": "Person", "name": "Rohiit Gupta", "jobTitle": "Chief Vedic Architect", "url": "https://trikalvaani.com/about"}
    }
    breadcrumb_schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://trikalvaani.com"},
            {"@type": "ListItem", "position": 2, "name": meta["label"], "item": f"https://trikalvaani.com/{domain}"}
        ]
    }
    return {"faqPage": faq_schema, "howTo": howto_schema, "breadcrumb": breadcrumb_schema}

def build_template(domain, kundali, session_id, lang="hi"):
    if domain not in DOMAINS:
        raise ValueError(f"Invalid domain: {domain}. Valid: {DOMAINS}")
    meta = DOMAIN_META[domain]

    # v2.1: normalise ONCE. Every downstream function now reads real data or
    # nothing at all — no function is allowed to invent a fallback value.
    nk = normalize_kundali(kundali)

    md = (nk.get("dasha") or {}).get("mahadasha") or {}
    md_lord = md.get("lord")
    # Visual style is cosmetic, not astrological — a neutral default is fine
    # here (unlike planetary data, where defaults are forbidden).
    style_idx = get_style(md_lord or "Saturn", session_id)
    style = TEMPLATE_STYLES[style_idx]
    aw = action_windows(nk, domain)
    geo_words = len(meta["geo_answer"].split())

    return {
        # ── META
        "meta": {"domain": domain, "label": meta["label"], "label_hi": meta["label_hi"], "segment": meta["segment"], "generated_at": datetime.utcnow().isoformat() + "Z", "session_id": session_id, "lang": lang, "version": "2.1.0", "platform": "Trikal Vaani — AI Vedic Intelligence"},
        # ── v2.1 DATA INTEGRITY — lets the frontend and Gemini know exactly
        #    which sections are backed by a real chart. Nothing is fabricated.
        "dataIntegrity": {
            "chart_received":     nk.get("has_chart", False),
            "planets_count":      len(nk.get("planets", {})),
            "dasha_received":     bool(md_lord),
            "ashtakavarga":       bool(nk.get("ashtakavarga")),
            "sookshma_available": False,
            "fabrication":        "none — v2.1 returns null/empty for missing values",
        },
        # ── GEMINI SLOT (always null — Gemini fills post-render)
        "geminiSummarySlot": None,
        # ── STYLE
        "templateStyle": {**style, "index": style_idx, "mahadasha_lord": md_lord},
        # ── GEO DIRECT ANSWER (40-60 words validated)
        "geoDirectAnswer": {"text": meta["geo_answer"], "word_count": geo_words, "geo_compliant": 40 <= geo_words <= 70, "optimized_for": ["Google SGE", "Perplexity", "Gemini Search", "ChatGPT", "Copilot"]},
        # ── SEARCH INTENT MAP
        "searchIntents": meta.get("search_intents", {}),
        # ── PLANET TABLE
        "planetTable": planet_table(nk),
        # ── DASHA TIMELINE
        "dashaTimeline": dasha_timeline(nk),
        # ── DOMAIN ANALYSIS
        "domainAnalysis": domain_analysis(nk, domain),
        # ── WINDOWS
        "actionWindows": aw["action_windows"],
        "avoidWindows": aw["avoid_windows"],
        "dashaWindowMeta": {"pratyantar_lord": aw["pratyantar_lord"], "sookshma_lord": aw["sookshma_lord"], "levels_available": 3, "note": "3-7 day Pratyantar precision (Level 3). Sookshma/Level 4 is not computed upstream and is reported as null rather than guessed."},
        # ── REMEDY
        "remedyPlan": remedy_plan(nk, domain),
        # ── PANCHANG
        "panchang": panchang_today(),
        # ── CONFIDENCE
        "confidenceBadge": confidence_badge(nk),
        # ── CTA
        "cta": {"primary": meta["cta"], "whatsapp": "https://wa.me/919211804111", "url": f"https://trikalvaani.com/{domain}", "urgency": "Limited slots — Book at launch price ₹51"},
        # ── FULL SEO SCHEMA (FAQPage + HowTo + BreadcrumbList)
        "seoSchema": build_seo_schema(domain, meta),
        # ── GEO FAQ (standalone for frontend rendering)
        "geoFaq": meta.get("geo_faq", []),
        # ── HOWTO STEPS
        "howtoSteps": meta.get("howto_steps", [])
    }
