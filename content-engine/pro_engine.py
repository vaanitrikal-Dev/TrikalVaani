#!/usr/bin/env python3
"""
TRIKAAL VAANI - Content Engine PRO
=============================================================
File:    content-engine/pro_engine.py
Version: v3.2.0 - MOOD ROUTER + SHOT-VARIETY GRID + FAQ PINNED COMMENT
Owner:   Rohiit Gupta, Chief Vedic Architect
Date:    2026-05-30

WHAT CHANGED IN v3.2.0 (visual variety + SEO):
  - MOOD ROUTER: BRAND_SPINE (constant) + MOOD_LIBRARY (6 moods) +
    mood_block(). Director now picks a mood_key per topic (mystery / hope /
    celebration / power / wisdom / love). Palette + energy rotate by topic
    so the channel is no longer one endless dark trailer.
  - CINEMATIC_LAWS softened: warmth/brightness now ALLOWED; only cheapness
    (calendar-art, HDR halos, stock-photo, AI sheen) is forbidden.
  - SHOT-VARIETY GRID injected into creative pass: each of 5 scenes forced
    onto a distinct shot distance + subject + location + time-of-day, plus
    a re-run diversity rule so repeat topics never look the same.
  - FAQ now appended to the YouTube PINNED COMMENT (AEO/GEO — answer engines
    extract pinned-comment Q&A). FAQ was already in description + caption kit.
  - (Pending, intentionally deferred: thumbnail-as-1s-intro-frame for IG
    cover — touches render timing, doing it as an isolated next step.)
=============================================================

WHAT CHANGED FROM v2.8 (5 upgrades):
  D1. VEO REMOVED. Black-bar (16:9 inherited) + subtle motion + cost.
      Hero (slot 0) now uses FFmpeg BOLD punch_in (full screen, 9:16,
      zero cost). veo_motion() function kept but no longer called —
      restore-ready if aspect bug solved later.
  D2. BOLD MOTION (GPT B+ "Netflix mythology, not TikTok chaos").
      All 18 effects magnitude 2-3x: zoom ranges now 1.0->1.45-1.70
      (were 1.10-1.35). Motion VISIBLE in real-time, not "wallpaper".
  D3. SYNTHETIC AMBIENT AUDIO ENGINE. FFmpeg-generated temple drone +
      sub bass + soft bell, mood-matched to Director's emotional_arc,
      mixed UNDER voiceover (voice 100%, ambient ~18-22%). 6 moods:
      dark/mystery/cosmic/hopeful/meditative/sacred. Zero cost, owned.
      Fail-safe: ambient fail -> voiceover only.
  D4. DRIVE UPLOAD FIX. Old multipart single-POST silently failed on
      larger videos (full memory load + timeout). Now resumable chunked
      upload via googleapiclient MediaFileUpload (same as YouTube path).
  D5. FASTER CROSS-FADE 0.2s (was 0.3) — tighter reel rhythm.

ALL v2.8 + EARLIER PRESERVED:
  - 18 Ken Burns motions (now BOLD) + ease curves
  - Cinema chain (vignette + grain + color grade)
  - Camera shake + speed ramp (hero)
  - Cross-fade stitching
  - Center CTA removed (top URL + bottom author only)
  - 9:16 enforcement
  - Director-respecting deity gate
  - Supabase metadata save
  - Honey Trap 4-Act + Type-3 + 9 psychology
  - Split Sonnet creative+metadata
  - YT tag sanitizer + thumbnail attach
  - SEO/GEO/AEO/EEAT pipeline
  - End card, Gemini research, brand spelling

ROADMAP (GPT-aligned, deferred):
  v3.1 visual payoff system (flares/pulses/reveals)
  v3.2 emotion-aware motion (deeper arc->motion mapping)
  v3.3 human emotional inserts
  Lyria audio (Vertex AI) — if quality justifies vs synthetic

POST-DEPLOY: no .env changes. Upload + restart.
=============================================================
WHAT CHANGED FROM v2.7.1 (single major upgrade: VISUAL QUALITY):

  C1. TRUE KEN BURNS — every motion now uses BOTH pan AND zoom.
      v2.7.1 had 10 effects but 7 were half-baked (zoom OR pan).
      v2.8: ALL 10 rewritten with pan+zoom+ease-in-out cosine curves.
      Linear interpolation REPLACED — cinema feel guaranteed.

  C2. 8 NEW KEN BURNS VARIATIONS (storytelling camera moves):
        - ken_burns_eye_to_wide  (intimate detail -> revealed context)
        - ken_burns_corner_dive  (wide -> diagonal zoom to detail)
        - ken_burns_horizontal_reveal (tight left -> pan right)
        - ken_burns_breathe      (hypnotic in/out + sway)
        - ken_burns_rise         (bottom -> sky reveal, cosmic energy)
        - ken_burns_fall         (top -> earth descent, dread)
        - ken_burns_pendulum     (side-to-side meditative pulse)
        - ken_burns_chase        (urgent horizontal drive)
      Total motions: 18 (was 10).

  C3. CINEMA POST-PROCESS CHAIN — bake premium look on EVERY clip:
        - FILTER_VIGNETTE        (darkens corners, subject focus)
        - FILTER_FILM_GRAIN      (mild Kodak Vision3 grain)
        - FILTER_COLOR_GRADE     (blue+orange teal/orange cinema)
        - FILTER_CAMERA_SHAKE    (subtle handheld, hero only)
        - FILTER_MOTION_BLUR     (temporal blend, optional)
      apply_cinema_post() function bakes 3-filter chain in one pass.
      apply_camera_shake() applies handheld jitter (hero only).
      apply_speed_ramp_climax() slows last 0.5s to 0.7x (hero only).

  C4. CROSS-FADE STITCHING — replaces hard concat cuts.
      crossfade_concat() uses FFmpeg xfade filter with 0.3s fade.
      Falls back to hard concat if xfade fails (defensive).

  C5. CENTER CTA PILL REMOVED — was killing cinema feel.
      Pillow overlay now ONLY: top www.trikalvaani.com + bottom author.
      No more "Find Your X at trikalvaani.com" pill at y=880.
      Brand presence preserved, cinematic visual restored.

  C6. 9:16 ENFORCEMENT — multiple defensive layers:
        - FFmpeg slide scale: force_original_aspect_ratio=increase + crop
        - Veo normalize: same scale+crop on Veo output
        - All effects have s=1080x1920 baked in
      Letterbox impossible regardless of source aspect.

HONEST COST/QUALITY MATH:
  - Cost per video: SAME (~Rs 44, Veo hero only)
  - Render time: +60-90 sec (cinema post on every clip + xfade)
  - Quality jump: significant (true Ken Burns + cinema grade +
    no center CTA + smooth transitions)
  - File size: ~3000 lines (was 2604)

ALL v2.7.1 FEATURES PRESERVED:
  - Veo 3.1 hero (4 sec, audio stripped)
  - Director-respecting deity gate
  - Supabase metadata save
  - DEITY_VISUAL_LIBRARY (9 grahas)
  - Honey Trap 4-Act + Type-3 headline + 9 psychology layers
  - Director 3 topic types
  - Split Sonnet creative+metadata passes
  - YT tag sanitizer + thumbnail attach
  - Atmospheric overlay scaffold
  - End card
  - Gemini Google Search research
  - Brand spelling iron rule

POST-DEPLOY (run once):
  No .env changes needed for v2.8. Just upload + restart.
=============================================================
WHAT CHANGED FROM v2.7 (2 surgical fixes, NO new features):
  X1. DIRECTOR-RESPECTING DEITY GATE (topic drift bug fix).
      v2.7 BUG: helper deity_signature() scanned topic TEXT for graha
      keywords and injected deity visual even when Director classified
      topic as 'concept'. Real example: Kundali Milan topic mentioned
      "Mangal Dosh" in body text -> helper injected Mangal Dev visual
      -> Veo 3.1 generated woman+manuscript (image gen) confused by
      Mangal Dev text prompt -> hero shot off-topic.
      ARCHITECTURAL SIN: helper overrode Director's authority.
      v2.7.1 FIX: deity_signature(topic, topic_type) requires
      topic_type == "planet_deity" as Gate 1. Director is single
      source of truth. Topic NEVER drifts. Helper stays pure.
      Affected call chain (topic_type now threaded through):
        _finish_and_upload(treatment) extracts topic_type
          -> render_slides(topic_type=...)
            -> veo_motion(topic_type=...)
              -> deity_signature(topic, topic_type)
  X2. KLING + FAL FULL REMOVAL (dead code cleanup).
      v2.7 left kling_motion() as stub returning None + FAL_KEY still
      loaded + 'fal_key_loaded' / 'kling_removed_rbi' misleading
      status flags. v2.7.1 removes ALL traces:
        - kling_motion() function: DELETED
        - FAL_KEY constant: DELETED
        - .env FAL_KEY line: removed via post-deploy sed command
        - status 'fal_key_loaded' and 'kling_removed_rbi': DELETED
      Veo 3.1 is now the SOLE motion engine. Restore path:
      git history if RBI policy ever changes.

ALL v2.7 FEATURES PRESERVED (untouched, working):
  - Veo 3.1 hero motion (4-sec, audio stripped, 1080p normalized)
  - Supabase metadata save (full SEO/GEO/AEO/EEAT to pro_content_metadata)
  - DEITY_VISUAL_LIBRARY (9 grahas with classical iconography)
  - Domain category inference (11 Trikaal Vaani life domains)
  - Topic slug auto-generation
  - Thumbnail JPEG <2MB + YT custom thumbnail attach (verified working)
  - All v2.6.1 doctrine: Honey Trap 4-Act, Type-3 headline,
    9 psychology layers, 3 topic types, 10 FFmpeg effects,
    TRIKAAL_LOOK, split Sonnet creative+metadata passes,
    YT tag sanitizer, atmospheric overlay scaffold, end card,
    Gemini Google Search research, brand spelling iron rule

CONTENT FIDELITY (Issue C — addressed by Director-respecting gate):
  Topic NEVER drifts. If user asks for Kundali Milan, video is about
  Kundali Milan. If user asks for Manglik Dosh, video features Mangal
  Dev. Director's classification is authoritative. Gemini research
  and Sonnet creative work WITHIN the topic Director identified.

POST-DEPLOY .ENV CLEANUP (run once after pm2 restart):
  sed -i '/^FAL_KEY=/d' /home/vaanitrikal/trikal-vaani/content-engine/.env
=============================================================
WHAT CHANGED FROM v2.6.1 (4 surgical upgrades, ALL doctrine intact):
  V1. KLING REMOVED (RBI standing instruction blocked fal.ai card payment).
      kling_motion() function still exists but RETURNS None immediately
      (commented body, restore-ready if RBI rule changes).
      FAL_KEY removed from .env requirement (warning silenced).
  V2. VEO 3.1 INTEGRATION (Google's premium image-to-video, GCP billing).
      New veo_motion() function uses Gemini API + veo-3.1-generate-preview.
      - 4 second cinematic hero shot (vs Kling 5 sec)
      - 720p native, ~₹34/clip (75% cheaper than Veo 2)
      - Same GEMINI_API_KEY auth, no service account complexity
      - ZERO RBI payment risk (GCP billing)
      - Audio auto-stripped (FFmpeg -an) since Veo 3.1 bundles AI ambient
        audio that would collide with Gemini Charon TTS voiceover
      - Same fail-safe pattern: any error -> FFmpeg punch_in fallback
  V3. SUPABASE METADATA SAVE (full SEO/GEO/AEO/EEAT payload persisted).
      New save_to_supabase() function writes every video's metadata to
      public.pro_content_metadata table:
        - identity (slug, topic_slug, pipeline, domain_category)
        - asset URLs (yt_url, drive_url, thumb_drive_url, caption_drive_url)
        - creative (title, yt_title, thumb_headline, topic_type, arc)
        - SEO (seo_description, yt_description, keywords)
        - GEO/AEO (geo_answer, faq)
        - EEAT (author, expertise, source, experience_signal)
        - treatment snapshot for future re-renders
      Powers /manglik-dosh, /sade-sati etc. blog pages with FAQPage schema,
      above-fold geo_answer, and author EEAT signals.
      FAIL-SAFE: Supabase down -> video upload still succeeds.
  V4. DEITY VISUAL LIBRARY (forces correct deity rendering in hero shots).
      New DEITY_VISUAL_LIBRARY constant maps each graha to its classical
      visual signature (Mangal = red warrior + ram + trishul; Shani = dark
      stern + iron danda + crow; Rahu = shadowed serpentine; etc.).
      When Director classifies topic as planet_deity, creative_pass() and
      veo_motion() inject this library into prompts so Veo 3.1 renders
      the RIGHT deity (fixes v2.6.1's "Manglik -> sadhu" failure).

ALL v2.6.1 DOCTRINE PRESERVED (untouched, working):
  - Honey Trap 4-Act (LURE -> PULL -> WITHHOLD -> ASK)
  - Type-3 headline formula (SPECIFIC + AUTHORITY + OPEN LOOP)
  - 9 psychology layers (Sonnet picks 2-3 per video)
  - Director's 3 topic types (concept / planet_deity / festival_deity)
  - 10 FFmpeg effects with meditative pacing
  - TRIKAAL_LOOK visual identity (deep blue-black + warm copper-red)
  - Full SEO/GEO/AEO/EEAT metadata pipeline (split Sonnet calls)
  - Thumbnail JPEG <2MB auto-compression
  - YT tag sanitizer (28 char/tag, 480 total, dedupe)
  - Visual variety + deity recognition rule
  - Failure isolation (every stage fail-safe)
  - Atmospheric overlay scaffold (particles/lightleaks asset-driven)
  - End card with Trikaal Vaani branding
  - Gemini research with Google Search grounding
  - Split Sonnet creative + metadata passes (5000 tokens each)
  - JSON retry on parse failure
  - Brand spelling iron rule (Trikaal Vaani name / trikalvaani.com domain)

WHAT CHANGED FROM v2.6 (3 surgical fixes, no architecture change):
  Y. FIX 1 - YT TAGS SANITIZER:
     v2.6 failed YouTube upload with 'invalidTags' (HTTP 400). Tags
     merged from keywords+hashtags exceeded YT rules. Now sanitized:
       * each tag <=28 chars (safe under YT's 30 cap)
       * strip < > " characters; collapse whitespace
       * total joined string <=480 chars (safe under YT's 500 cap)
       * dedupe case-insensitive
       * cap at 25 tags
     Result: YouTube upload now succeeds -> thumbnail attaches.
  Z. FIX 2 - DIRECTOR PLANET_DEITY TYPE:
     v2.6 Director classified Manglik Dosh as 'concept' -> no Mangal
     Dev in any frame. Director now has THREE topic types:
       'concept'         - abstract concepts NOT named after a deity
       'planet_deity'    - NEW. Anything named after a graha:
                           Shani / Sade Sati / Manglik / Kuja /
                           Mangal / Rahu / Ketu / Surya / Chandra /
                           Guru / Shukra / Budh.
                           Forces deity 'inspired by' figure in
                           HERO frame and at least one more scene.
       'festival_deity'  - festivals + god-days as before.
  AA. FIX 3 - VENV PIP DOCUMENTED:
     v2.6 logs showed 'fal_client not installed' -> Kling fell back
     to FFmpeg silently. The `pip install fal_client` you ran was
     for system Python, not the uvicorn venv. CORRECT command:
       /home/vaanitrikal/trikal-env/bin/pip install fal_client
     Then `pm2 restart trikal-engines`.
     Verify with:
       /home/vaanitrikal/trikal-env/bin/python -c "import fal_client; print('OK')"
     If that prints OK, Kling will fire on next run.

WHAT CHANGED FROM v2.1 (all surgical, fail-safe preserved):
  A. THUMBNAIL ATTACH FIX: thumbnail now saved as compressed JPEG and
     auto-stepped under YouTube's 2 MB limit (was a 3-4 MB PNG -> rejected
     with "Media larger than 2097152"). Now attaches correctly.
  B. THUMBNAIL HEADLINE FIX: short punchy <=4-word headline (from Sonnet's
     new thumb_headline field), proper wrap, placed BELOW the logo so no
     more cut-off / collision.
  C. DEITY PRESENCE: deity-centred topics (Shani, Mangal, Hanuman...) now
     force >=1 hero frame 'inspired by [deity]' with classical attributes.
  D. DOS & DONTS: voiceover now includes a quick practical do/don't value
     beat before the withhold (builds trust; personal specifics still held).
  E. NETFLIX EMOTIONAL ARC: scenes + voiceover move DREAD -> STRUGGLE ->
     TURN -> ASK, with pace contrast instead of one flat somber mood.
  F. Shorts word target widened (110-135) to fit the dos-and-donts beat.

WHAT CHANGED FROM v2.0 (all fail-safe — one failure can't crash a video):
  1. gemini_research()  - Gemini Flash + Google Search grounding researches
     EVERY topic (not just festivals). Returns verified factual context.
     FAILS SAFE: if search fails, falls back to the raw user text.
  2. director_pass()     - now topic-aware:
       * CONCEPT topic  -> vary subjects (human, horizon, chart, celestial)
       * FESTIVAL/DEITY -> deity is the main character, varied COMPOSITIONS
  3. honeytrap_pass()    - hard VISUAL VARIETY rule (no same-subject re-angles)
                           + brand spelling fixed Trikal -> TRIKAAL in overlays
  4. build_thumbnail()   - NEW. Hero image + clean topic text + Trikaal Vaani
     branding + logo + "Rohiit Gupta - Chief Vedic Architect". Set on YouTube
     + saved to Drive. FAILS SAFE: video still uploads if thumbnail fails.
  5. BRAND: brand NAME in prose/voiceover = 'Trikaal Vaani' (double-a).
     DOMAIN shown everywhere = www.trikalvaani.com (single-a, the real site).
     Never display a double-a domain — it does not exist.
=============================================================
WHAT v2.0 IS:
  A premium, ad-hoc Pro Engine for SPECIAL / HERO videos.
  The daily cron (trikal_content_engine.py) is NEVER touched.

WHAT CHANGED FROM v1.2 / v1.3:
  - BRAIN UPGRADE: Claude Sonnet 4.6 now writes ALL creative text.
    Two-stage pipeline:
      STAGE 1  director_pass()      -> cinematic visual treatment
      STAGE 2  honeytrap_pass()     -> 4-act video package + CTA
  - HONEY TRAP DOCTRINE baked into the Stage-2 prompt (Lure ->
    Pull -> Withhold -> Ask). Every video drives ONE action:
    click -> trikalvaani.com.
  - GPT CINEMATIC STRATEGY baked into Stage-1 (inspired-by rule,
    ARRI/anamorphic, Kodak Vision3, anti-poster blacklist,
    HUMAN_REALISM_BLOCK + AI_ARTIFACT_REDUCTION_BLOCK).
  - FIXES FOLDED IN FROM v1.3:
      * Pillow English overlay (no Devanagari boxes)
      * gemini_analyse_video() waits for ACTIVE state
      * stitch re-encodes hook before concat
      * caption kit -> Drive in all pipelines
  - CRASH-PROOFING (new):
      * key read from .env via python-dotenv (never hardcoded)
      * retry wrapper on every AI call (3 tries)
      * thinkingBudget:0 REMOVED (iron rule honored)
  - TTS stays Gemini Charon. Image generation stays Gemini image.
    Video analysis (Flow stitch) stays Gemini. Sonnet writes the
    WORDS + PROMPTS; Gemini renders pixels/voice.

3 PIPELINES (unchanged surface, upgraded brain):
  Pipeline 1  - Natural Flow  (POST /pro/natural)
  Pipeline 2  - AI Video      (POST /pro/ai-video)
  Pipeline 3a - Flow Prompt   (POST /pro/flow-prompt)
  Pipeline 3b - Flow Stitch   (POST /pro/flow-stitch)

ENV (.env in content-engine/, loaded via python-dotenv):
  ANTHROPIC_API_KEY, GEMINI_API_KEY,
  YOUTUBE_REFRESH_TOKEN, GOOGLE_DRIVE_REFRESH_TOKEN
=============================================================
"""

import os
import json
import time
import base64
import wave
import subprocess
import requests
import traceback
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional

# ── Load .env (works regardless of how uvicorn is launched) ──
try:
    from dotenv import load_dotenv
    # .env lives in content-engine/ ; engine module lives in python-engines/
    # load both locations so the key is found no matter the CWD
    load_dotenv(Path("/home/vaanitrikal/trikal-vaani/content-engine/.env"))
    load_dotenv()  # also picks up any local .env / process env
except Exception as _e:
    print(f"[PRO] dotenv load note: {_e}")

# ── Paths (same as v1.x) ─────────────────────────────────────
BASE_DIR   = Path("/home/vaanitrikal/trikal-vaani/content-engine")
TEMP_DIR   = BASE_DIR / "temp"
OUTPUT_DIR = BASE_DIR / "output"
ASSETS_DIR = BASE_DIR / "assets"
PARTICLES_DIR = ASSETS_DIR / "particles"   # v2.5: drop ash/smoke/embers MP4 loops here
LIGHTLEAK_DIR = ASSETS_DIR / "lightleaks"  # v2.5: drop god-ray / haze MP4 loops here
LOGO_PATH  = ASSETS_DIR / "logo.png"
FONT_HINDI = ASSETS_DIR / "NotoSansDevanagari-Bold.ttf"
FONT_ENG   = ASSETS_DIR / "NotoSans-Bold.ttf"

for d in [TEMP_DIR, OUTPUT_DIR, ASSETS_DIR, PARTICLES_DIR, LIGHTLEAK_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── Env / Keys (read from .env — NEVER hardcoded) ────────────
GEMINI_API_KEY     = os.environ.get("GEMINI_API_KEY", "")
ANTHROPIC_API_KEY  = os.environ.get("ANTHROPIC_API_KEY", "")
# FAL_KEY removed in v2.7.1 (Kling fully deleted — Veo 3.1 sole motion engine).

# Supabase (v2.7 NEW) — for pro_content_metadata table writes
SUPABASE_URL                = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY   = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

YOUTUBE_CLIENT_ID     = "166374809393-eo1hthqcbh5s0g504ra5ijap9gr930lr.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET = "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"
YOUTUBE_REFRESH_TOKEN = os.environ.get("YOUTUBE_REFRESH_TOKEN", "")

DRIVE_CLIENT_ID     = "166374809393-eo1hthqcbh5s0g504ra5ijap9gr930lr.apps.googleusercontent.com"
DRIVE_CLIENT_SECRET = "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"
DRIVE_REFRESH_TOKEN = os.environ.get("GOOGLE_DRIVE_REFRESH_TOKEN", "")
DRIVE_FOLDER_ID     = "1CyfhLGXcLs4JITGOPbVU-h6-56jvExYx"

# ── Model strings ────────────────────────────────────────────
SONNET_MODEL       = "claude-sonnet-4-6"   # verified current Sonnet
GEMINI_TEXT_MODEL  = "gemini-2.5-flash"    # TTS + video-analysis only now
GEMINI_TTS_MODEL   = "gemini-2.5-flash-preview-tts"
GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image-preview"  # matches live daily cron (verified)

# v3.1.0: VEO + KLING FULLY REMOVED. There is NO AI-video motion
# engine anymore. ALL motion comes from FFmpeg Ken Burns (zoompan)
# on still images — zero cost, zero external video API, reliable.
# Hero (slot 0) = effect_punch_in (bold full-screen zoom). If you
# ever want AI video again, restore veo_motion() from git history.

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

IST = timezone(timedelta(hours=5, minutes=30))


# =============================================================
# DEITY VISUAL LIBRARY
# Correct classical Vedic visual signature for each graha
# (planet-deity), available for image/scene prompts and the status
# endpoint. (No longer used for AI video — Veo removed in v3.1.0.)
# Each entry: classical iconography + vahana + color + attributes.
# =============================================================
DEITY_VISUAL_LIBRARY = {
    "mangal": (
        "Mangal Dev (Mars), fierce red-skinned warrior deity, four arms, "
        "holding trishul (trident) and gada (mace), seated/standing on a "
        "white ram (mesha vahana), copper-red molten aura, golden warrior "
        "armor, fiery tilaka on forehead, martial expression, ancient stone "
        "temple background with practical fire torches"
    ),
    "shani": (
        "Shani Dev (Saturn), dark blue-black skinned stern deity, holding "
        "iron danda (rod), seated on a black crow or buffalo (vahana), "
        "deep indigo aura, ascetic robes, calm but unforgiving gaze, "
        "shadow-heavy lighting, ancient temple pillars in deep blue tones"
    ),
    "rahu": (
        "Rahu, shadowy serpent-bodied graha, only torso and serpent tail "
        "visible, dark smoky aura, holding crescent and trishul, deep "
        "violet-indigo shadows, eclipse-like backdrop, ancient stone shrine"
    ),
    "ketu": (
        "Ketu, headless serpent-tailed graha, body trailing into smoke, "
        "earthy brown-grey aura, holding gada, mystical fog atmosphere, "
        "ancient cave temple background, low-key dramatic lighting"
    ),
    "surya": (
        "Surya Dev (Sun), radiant golden-skinned deity, seven horses "
        "chariot (saptashva), holding lotus, golden crown and aura, "
        "blinding solar light, sunrise sky, ancient gold-tinted temple"
    ),
    "chandra": (
        "Chandra Dev (Moon), pale silver-white skinned deity, holding "
        "lotus and kamandalu, deer (mriga vahana), silvery cool aura, "
        "crescent moon crown, calm meditative expression, moonlit night "
        "ancient temple"
    ),
    "guru": (
        "Brihaspati / Guru Dev (Jupiter), golden-yellow skinned sage "
        "deity, white beard, holding kamandalu and book of shastras, "
        "lotus throne, warm golden aura, peaceful authoritative gaze, "
        "ancient gurukul/temple background"
    ),
    "shukra": (
        "Shukra Dev (Venus), fair-skinned wise deity, holding kamandalu "
        "and book, white horse vahana, soft white-gold aura, scholarly "
        "robes, gentle expression, ancient celestial library background"
    ),
    "budh": (
        "Budh Dev (Mercury), green-tinged youthful deity, holding sword "
        "and shield, lion vahana, emerald aura, intelligent sharp gaze, "
        "ancient scholar temple background"
    ),
}


def deity_signature(topic: str, topic_type: str = "") -> str:
    """Return the classical visual signature if topic names a graha
    AND Director classified the topic as planet_deity.

    v2.7.1 FIX: Gate 1 = topic_type check. Director is single source
    of truth. If Director said 'concept' or 'festival_deity', this
    function returns "" even if the topic text mentions a graha.
    Example: Kundali Milan topic mentions "Mangal Dosh" in body text
    but Director correctly classifies it as 'concept' -> NO deity
    injection -> hero shot stays on-topic (Kundali Milan visuals,
    not Mangal Dev).
    """
    # Gate 1 (v2.7.1): Director MUST authorize deity injection
    if (topic_type or "").lower() != "planet_deity":
        return ""

    # Gate 2: NOW match graha keyword in topic
    t = (topic or "").lower()
    # Mangal family (covers Manglik, Kuja, Bhauma, Mars-anything)
    if any(k in t for k in ["mangal", "manglik", "kuja", "bhauma", "mars"]):
        return DEITY_VISUAL_LIBRARY["mangal"]
    # Shani family (covers Sade Sati, Shani Mahadasha)
    if any(k in t for k in ["shani", "sade sati", "saade saati", "saturn"]):
        return DEITY_VISUAL_LIBRARY["shani"]
    if "rahu" in t:
        return DEITY_VISUAL_LIBRARY["rahu"]
    if "ketu" in t:
        return DEITY_VISUAL_LIBRARY["ketu"]
    if any(k in t for k in ["surya", "sun"]):
        return DEITY_VISUAL_LIBRARY["surya"]
    if any(k in t for k in ["chandra", "moon"]):
        return DEITY_VISUAL_LIBRARY["chandra"]
    if any(k in t for k in ["guru", "brihaspati", "jupiter"]):
        return DEITY_VISUAL_LIBRARY["guru"]
    if any(k in t for k in ["shukra", "venus"]):
        return DEITY_VISUAL_LIBRARY["shukra"]
    if any(k in t for k in ["budh", "budha", "mercury"]):
        return DEITY_VISUAL_LIBRARY["budh"]
    return ""


# =============================================================
# v2.7 NEW — DOMAIN CATEGORY MAPPING (for Supabase blog clustering)
# Maps topic keywords to the 11 Trikaal Vaani life domains.
# Used by save_to_supabase() to auto-tag every video for
# /career, /wealth, /relationships etc. cluster pages.
# =============================================================
DOMAIN_KEYWORDS = {
    "career": ["career", "job", "naukri", "profession", "promotion",
               "business growth", "office"],
    "wealth": ["wealth", "money", "dhan", "finance", "paisa",
               "richness", "lakshmi"],
    "health": ["health", "swasthya", "illness", "disease", "rog",
               "wellness"],
    "relationships": ["marriage", "vivah", "shaadi", "love", "premi",
                      "spouse", "manglik", "kundali milan", "compatibility",
                      "relationship", "gun milan"],
    "family": ["family", "parivaar", "children", "santaan", "parents",
               "putra", "putri"],
    "education": ["education", "shiksha", "study", "vidya", "exam",
                  "saraswati", "knowledge"],
    "home": ["home", "ghar", "vastu", "property", "house", "real estate"],
    "legal": ["legal", "court", "case", "mukadma", "litigation", "kanoon"],
    "travel": ["travel", "yatra", "foreign", "videsh", "journey",
               "settlement", "migration"],
    "spirituality": ["spirituality", "moksha", "guru", "sadhana",
                     "meditation", "puja", "dharma", "spiritual"],
    "wellbeing": ["wellbeing", "peace", "shanti", "anxiety", "stress",
                  "mental", "depression"],
}


def infer_domain_category(topic: str, keywords: list = None) -> str:
    """Infer which of the 11 Trikaal Vaani life domains this topic fits.
    Returns first match or 'spirituality' as catch-all."""
    text = (topic or "").lower()
    if keywords:
        text += " " + " ".join(str(k).lower() for k in keywords)
    for domain, words in DOMAIN_KEYWORDS.items():
        if any(w in text for w in words):
            return domain
    return "spirituality"  # catch-all default


def slugify_topic(title: str) -> str:
    """Convert a title to URL-friendly slug.
    'Manglik Dosh Kya Hota Hai' -> 'manglik-dosh-kya-hota-hai'
    Capped at 60 chars for sane URLs."""
    import re
    s = (title or "").lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)   # drop punctuation
    s = re.sub(r'\s+', '-', s)            # spaces -> hyphens
    s = re.sub(r'-+', '-', s)             # collapse multiple hyphens
    s = s.strip('-')
    return s[:60] or "untitled"


def log(msg):
    print(f"[PRO {datetime.now(IST).strftime('%H:%M:%S')}] {msg}")


def today_ist():
    return datetime.now(IST).strftime("%Y-%m-%d")


def ts():
    return str(int(time.time()))


def safe_text(t):
    t = str(t)
    for ch in ["'", '"', ":", "{", "}", "[", "]", "\\", "%", "$", "!", "?"]:
        t = t.replace(ch, "")
    return t.replace(",", " ").strip()


def extract_json(text):
    import re
    text = re.sub(r'```json', '', text)
    text = re.sub(r'```', '', text)
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    depth = 0
    start = None
    for i, ch in enumerate(text):
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start is not None:
                try:
                    return json.loads(text[start:i+1])
                except Exception:
                    continue
    raise ValueError("No valid JSON found")


# =============================================================
# CINEMATIC STRATEGY CONSTANTS (from GPT doc — brand spine)
# Edit these once; every video inherits the change.
# =============================================================
HUMAN_REALISM_BLOCK = (
    "imperfect skin texture, realistic pores, cinematic shadows, "
    "analog film grain, practical lighting, subdued cinematic grading, "
    "asymmetrical framing, shallow depth of field, natural contrast, "
    "atmospheric depth"
)

AI_ARTIFACT_REDUCTION_BLOCK = (
    "reduce AI smoothness, realistic imperfections, cinematic shadow depth, "
    "practical lighting realism, analog texture realism, natural asymmetry, "
    "subtle grain, muted highlights"
)

# v2.4 — Locked visual identity. Every thumbnail/hero frame inherits this.
# Compounding brand recognition: after 20 videos viewers spot Trikaal in <0.3s.
TRIKAAL_LOOK = (
    "Trikaal Vaani visual signature: deep blue-black cosmic palette with "
    "warm orange/amber practical-fire accents, Kodak Vision3 complementary "
    "grade, low-key cinematic shadows, atmospheric haze, analog film grain, "
    "documentary realism — NOT poster art. Sacred-thriller mood."
)

CINEMATIC_LAWS = """NON-NEGOTIABLE CINEMATIC LAWS (obey every one):
- NEVER depict deities directly. Always frame as "a Himalayan ascetic
  inspired by Shiva", "a sage inspired by ...". Never "God Shiva",
  "Divine Vishnu", "Celestial Krishna". The phrase "inspired by"
  bypasses devotional-poster bias.
- MANDATORY film language: shot on ARRI Alexa Mini, anamorphic lens,
  shallow depth of field, practical lighting, handheld realism,
  Kodak Vision3 color grade, analog film grain, realistic skin/fabric
  texture, atmospheric fog/haze. Documentary realism, NOT poster art.
- The PALETTE and ENERGY are set by the MOOD block for this video — obey it.
  A 'celebration' or 'hope' or 'love' video SHOULD be warm and bright; a
  'mystery' video SHOULD be dark. Do NOT force every video dark. Variety of
  mood across the channel is required.
- FORBIDDEN (these cheapen the frame in ANY mood): glossy plastic skin,
  fantasy HDR halos, oversaturated calendar-art, stock-photo lighting, flat
  devotional-poster look, AI sheen. Brightness and warmth are ALLOWED;
  cheapness is not.
- Target feel: a frame from a high-budget spiritual documentary film.
- Every scene is 9:16 vertical portrait, NO text overlay, NO watermark."""


# =============================================================
# v3.2 — BRAND SPINE (constant) + MOOD ROUTER (varies by topic)
# Brand recognition now comes from GRAIN + FRAMING + REALISM,
# not from a single dark palette. Palette/energy rotate by mood
# so the channel stops feeling like one long horror trailer.
# Director picks mood_key; mood_block() injects the palette.
# =============================================================
BRAND_SPINE = (
    "Trikaal Vaani brand spine (CONSTANT across all videos): shot on ARRI "
    "Alexa, anamorphic lens character, shallow depth of field, real analog "
    "film grain, atmospheric haze, documentary realism — NOT poster art, "
    "NOT calendar-art. Authentic skin and fabric texture. 9:16 vertical."
)

MOOD_LIBRARY = {
    "mystery": (  # doshas, Sade Sati, Rahu/Ketu, karmic — the classic dark look
        "PALETTE: deep indigo and blue-black with a single warm amber "
        "practical light. LIGHTING: low-key, long shadows, one source. "
        "ENERGY: still, heavy, suspenseful. Sacred-thriller mood."
    ),
    "hope": (  # remedies, upay, solutions, 'how to fix' topics
        "PALETTE: pre-dawn blue lifting into warm gold, soft teal shadows. "
        "LIGHTING: soft directional sunrise, gentle rim light, hopeful glow "
        "WITHOUT fantasy HDR. ENERGY: rising, calm, reassuring, a turn toward "
        "light. The feeling of a burden lifting."
    ),
    "celebration": (  # festivals, Navratri, Diwali, auspicious muhurat
        "PALETTE: warm marigold orange, temple gold, festive crimson, candle "
        "and diya warmth. LIGHTING: layered practical flames, glowing but "
        "still cinematic and real (not oversaturated poster art). ENERGY: "
        "alive, abundant, joyful, communal warmth."
    ),
    "power": (  # Mangal, Surya, success, career, wealth, strength
        "PALETTE: bronze, copper, deep red and gold, controlled firelight. "
        "LIGHTING: strong dramatic key light, bold contrast, heroic. ENERGY: "
        "confident, rising, commanding, victorious."
    ),
    "wisdom": (  # Guru, education, spirituality, knowledge, peace
        "PALETTE: warm sandstone, saffron, soft daylight, parchment tones. "
        "LIGHTING: natural window light, serene, clear. ENERGY: calm, "
        "grounded, scholarly, peaceful clarity."
    ),
    "love": (  # marriage, relationships, Shukra, family, Venus topics
        "PALETTE: rose, soft rust, warm dusk pink and gold. LIGHTING: golden "
        "hour, soft and intimate, gentle glow. ENERGY: tender, warm, "
        "emotionally open, longing-to-fulfilment."
    ),
}


def mood_block(mood_key: str) -> str:
    """Return the palette/lighting/energy block for a mood. Safe default."""
    return MOOD_LIBRARY.get((mood_key or "mystery").lower(),
                            MOOD_LIBRARY["mystery"])


# =============================================================
# CLAUDE SONNET 4.6 HELPER (the new brain)
# =============================================================
def claude_text(system: str, user: str, max_tokens: int = 4000,
                temperature: float = 0.9, retries: int = 3) -> str:
    """Call Claude Sonnet 4.6. Returns raw text. Retries on failure."""
    if not ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY missing in .env — Sonnet cannot run")
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": SONNET_MODEL,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "system": system,
        "messages": [{"role": "user", "content": user}],
    }
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(ANTHROPIC_URL, headers=headers,
                                 json=payload, timeout=120)
            if resp.status_code == 200:
                data = resp.json()
                # content is a list of blocks; collect text blocks
                parts = [b.get("text", "") for b in data.get("content", [])
                         if b.get("type") == "text"]
                out = "".join(parts).strip()
                if out:
                    return out
                last_err = "empty content"
            else:
                last_err = f"HTTP {resp.status_code}: {resp.text[:200]}"
                log(f"  Sonnet attempt {attempt} failed: {last_err}")
        except Exception as e:
            last_err = str(e)
            log(f"  Sonnet attempt {attempt} exception: {last_err}")
        time.sleep(3 * attempt)
    raise RuntimeError(f"Sonnet failed after {retries} tries: {last_err}")


# =============================================================
# STAGE 0 — GEMINI RESEARCH (Google Search grounding)
# Researches EVERY topic. Returns verified factual context that
# Sonnet then verifies + directs from. FAILS SAFE: on any error
# it returns the raw topic so the pipeline never breaks.
# =============================================================
def gemini_research(topic: str) -> str:
    """Gemini Flash + Google Search. Returns ~150-250w factual brief.
    Fail-safe: returns raw topic on any failure."""
    log("Researching topic via Gemini + Google Search...")
    url = (f"https://generativelanguage.googleapis.com/v1beta/"
           f"models/{GEMINI_TEXT_MODEL}:generateContent?key={GEMINI_API_KEY}")
    instruction = (
        "You are a Vedic astrology research assistant. Using Google Search, "
        "research the topic below and return a FACTUAL brief of 150-250 words. "
        "Include: the correct definition/significance, any classical Jyotish "
        "basis (BPHS / Parashara where relevant), and — if it is a festival or "
        "deity — the real date this year, the associated deity, the rituals, "
        "and the spiritual meaning. Be accurate and specific. Plain prose, no "
        "markdown. This brief will be used to script a cinematic video, so "
        "make it rich and correct.\n\nTOPIC:\n" + topic
    )
    payload = {
        "contents": [{"parts": [{"text": instruction}]}],
        "tools": [{"google_search": {}}],
        "generationConfig": {"temperature": 0.4, "maxOutputTokens": 700},
    }
    try:
        resp = requests.post(url, json=payload, timeout=90)
        if resp.status_code != 200:
            log(f"  Research HTTP {resp.status_code}: {resp.text[:150]} "
                f"— falling back to raw topic")
            return topic
        data = resp.json()
        cand = data.get("candidates", [{}])[0]
        parts = cand.get("content", {}).get("parts", [])
        brief = "".join(p.get("text", "") for p in parts).strip()
        if brief and len(brief) > 40:
            log(f"  Research OK ({len(brief)} chars)")
            return f"RESEARCHED CONTEXT:\n{brief}\n\nORIGINAL BRIEF:\n{topic}"
        log("  Research returned empty — falling back to raw topic")
        return topic
    except Exception as e:
        log(f"  Research failed ({e}) — falling back to raw topic")
        return topic


# =============================================================
# STAGE 1 — THE CINEMATIC DIRECTOR (Sonnet)
# Fully auto creative treatment, caged by CINEMATIC_LAWS.
# Topic-aware variety: concept -> vary subjects;
# festival/deity -> deity is main character, varied compositions.
# Returns dict: topic_type, emotional_arc, hero_shot_concept,
#               palette, lighting_mood, camera_language, drama_beats[]
# =============================================================
def director_pass(topic: str) -> dict:
    system = (
        "You are an award-winning cinematographer and creative director "
        "for Trikaal Vaani, a premium Vedic astrology brand. You design the "
        "complete visual treatment for short cinematic films. You have full "
        "creative freedom over camera, lighting, drama and mood, but you "
        "obey the cinematic laws absolutely.\n\n" + CINEMATIC_LAWS +
        "\n\nFIRST decide the TOPIC TYPE, because it changes the visual "
        "variety strategy. Choose ONE of THREE types:\n"
        "- 'concept' — abstract Jyotish concepts that are NOT centred on a "
        "named deity or planet-deity (e.g. Lagna, a house, Dasha system, "
        "Yoga, generic kundali matching). Vary subjects across the film — "
        "a human figure, the natural sky/horizon, a symbolic Vedic object "
        "(zodiac wheel, kundali chart, lamp, ancient manuscript), a "
        "celestial wide shot. NEVER the same person from five angles.\n"
        "- 'planet_deity' — topics centred on a graha/planet-deity OR a "
        "dosha named after one. This INCLUDES: Shani / Sade Sati / Shani "
        "Mahadasha; Mangal / Manglik Dosh / Kuja Dosha / Bhauma Dosha / "
        "Mars-anything; Rahu / Rahu Mahadasha / Rahu Dosha; Ketu / Ketu "
        "Mahadasha; Surya (Sun) topics; Chandra (Moon) topics; Guru "
        "(Jupiter) topics; Shukra (Venus) topics; Budh (Mercury) topics. "
        "Anything named after a graha is planet_deity, even if it's "
        "technically a 'dosha'. Treatment: the planet-deity itself MUST "
        "appear as a striking figure 'inspired by' that deity (with its "
        "classical attributes — Shani: dark stern figure with iron danda, "
        "crow nearby, deep blue-black tones; Mangal: martial figure with "
        "weapon and red/copper aura; Rahu: shadowed serpentine presence; "
        "etc.) in AT LEAST ONE scene including the HERO frame. Other "
        "scenes vary between this deity, human suffering/devotion, and "
        "symbolic objects. The deity is the recognition anchor.\n"
        "- 'festival_deity' — a named festival or god-day (Ganga Dussehra, "
        "Hanuman Jayanti, Krishna Janmashtami, a vrat). The festival "
        "deity is the MAIN CHARACTER and SHOULD recur across scenes in "
        "VARIED COMPOSITIONS (intimate close-up, full divine form, "
        "within the ritual/temple, amid devotees, a symbolic attribute). "
        "Same character, genuinely different shots and scale.\n\n"
        "In ALL three cases, unify the film through palette, lighting mood "
        "and film grain — NOT through repeating an identical frame.\n\n"
        "Match the emotional arc to the topic: fear topics get low-key "
        "shadow and slow push-in; hope/blessing topics get warm rim-light "
        "and a rising tilt; warning topics get hard contrast and zoom-out. "
        "\n\nMOOD SELECTION (this drives the whole palette — choose deliberately, "
        "do NOT default everything to dark): pick ONE mood_key that fits the "
        "topic's emotional truth:\n"
        "- 'mystery' = doshas, Sade Sati, Rahu/Ketu, karmic warnings (dark, suspense)\n"
        "- 'hope' = remedies, upay, solutions, 'how to fix / kaise bachein' (dawn, rising)\n"
        "- 'celebration' = festivals, auspicious days, muhurat, good news (warm, festive)\n"
        "- 'power' = Mangal, Surya, success, career, wealth, strength (bronze, heroic)\n"
        "- 'wisdom' = Guru, education, spirituality, peace, knowledge (serene daylight)\n"
        "- 'love' = marriage, relationships, Shukra, family (golden-hour warmth)\n"
        "A remedy or solution video must NOT be pure dread — it should TURN "
        "toward 'hope'. Reserve 'mystery' for genuine warning topics. "
        "Respond ONLY with raw JSON, no markdown fences, no preamble."
    )
    user = (
        f"TOPIC (may include researched context — use it):\n{topic}\n\n"
        "Design the cinematic treatment. Return JSON:\n"
        "{\n"
        '  "topic_type": "concept OR planet_deity OR festival_deity",\n'
        '  "mood_key": "ONE of: mystery, hope, celebration, power, wisdom, love — chosen per the mood selection guidance",\n'
        '  "emotional_arc": "one sentence describing the feeling journey",\n'
        '  "hero_shot_concept": "the single most striking frame — the scroll-stopper. If topic_type is planet_deity or festival_deity, the hero frame MUST feature the deity inspired by the topic. Full cinematic description following the laws.",\n'
        '  "variety_plan": "one line stating how each slide differs (which distinct subject/composition per beat), per the topic-type rule",\n'
        '  "palette": "specific muted cinematic colors, Kodak Vision3 feel",\n'
        '  "lighting_mood": "specific practical lighting description",\n'
        '  "camera_language": "camera movement + lens behaviour for this topic",\n'
        '  "drama_beats": ["3-5 short beats — each beat names a DISTINCT subject/composition to film"]\n'
        "}"
    )
    raw = claude_text(system, user, max_tokens=1700, temperature=0.95)
    treatment = extract_json(raw)
    # v3.2: ensure a mood_key always exists (safe default = mystery)
    if not treatment.get("mood_key"):
        treatment["mood_key"] = "mystery"
    log(f"Director: type={treatment.get('topic_type','?')} | "
        f"mood={treatment.get('mood_key','mystery')} | "
        f"arc={treatment.get('emotional_arc','')[:50]}...")
    return treatment


# =============================================================
# STAGE 2A — CREATIVE PASS (Sonnet, focused on the video itself)
# Returns ONLY the creative fields: title, thumb_headline, motion_prompt,
# overlay_cta, voiceover, scenes[], caption, hashtags.
# All 9 psychology layers + 4-act Honey Trap doctrine live here.
# 5000 tokens of room (was 4000 cramming 15 fields -> truncation).
# =============================================================
def creative_pass(topic: str, treatment: dict, image_count: int,
                  fmt: str = "shorts", hook_video: bool = False,
                  video_description: str = "") -> dict:
    # word count by format
    if fmt == "video":
        word_target = "280-350 words"
    else:
        word_target = "150-180 words" if not hook_video else "130-160 words"

    hook_note = ""
    if hook_video and video_description:
        hook_note = (
            f"\nA cinematic HOOK VIDEO already plays first. It contains:\n"
            f"{video_description}\n"
            "Your scenes and voiceover MUST visually and emotionally continue "
            "from this hook — same palette, same energy.\n"
        )
    elif hook_video:
        hook_note = (
            "\nA cinematic AI HOOK CLIP plays in the first ~3 seconds. "
            "Your voiceover opens referencing what the viewer just saw.\n"
        )

    system = (
        "You are Rohiit Gupta, Chief Vedic Architect at Trikaal Vaani "
        "(trikalvaani.com). You write premium short-film content that turns "
        "viewers into website visitors. You follow the HONEY TRAP DOCTRINE "
        "without exception.\n\n"
        "THE HONEY TRAP DOCTRINE — a Netflix trailer never says 'watch this "
        "show'; it makes you NEED to see what happens, then cuts to a date. "
        "Your video makes the viewer NEED to know what is in THEIR chart, "
        "then cuts to the link. Beauty is the bait, curiosity is the hook, "
        "the link is the only place the line ends.\n\n"
        "THE 4 ACTS (structure is LAW):\n"
        "ACT 1 LURE (first 6 words of voiceover): name a personal FEAR or "
        "deep desire. Must be a question or an UNFINISHED statement — NEVER "
        "a complete fact.\n"
        "ACT 2 PULL: speak to THEIR planets, THEIR timing, THEIR life. Build "
        "the itch. Make it feel personal.\n"
        "ACT 3 WITHHOLD: deliberately refuse the personal answer. Say in "
        "natural Hinglish that only their own kundali can reveal the 'when' "
        "and the 'what'.\n"
        "ACT 4 ASK: drive to the site. The full answer lives ONLY at "
        "trikalvaani.com. End the voiceover on the call to action.\n\n"
        "HARD RULES:\n"
        "- Never give the complete answer inside the video. The video is the "
        "trailer; the site is the film.\n"
        "- Voiceover language: natural, warm, authoritative Hinglish "
        "(Hindi+English mix), readable by a TTS voice. NO emojis in the "
        "voiceover.\n"
        f"- Voiceover length STRICT: {word_target}.\n"
        "- The on-screen overlay CTA must be ENGLISH ONLY (Devanagari breaks "
        "on the video frame).\n"
        "- The title must be an OPEN LOOP — a question or unfinished line, "
        "never a complete fact.\n"
        "- Caption FIRST LINE must push to the link in bio. Do NOT paste a "
        "raw https:// link in the Instagram caption (Instagram throttles "
        "outbound links) — say 'Link in bio' and 'trikalvaani.com'.\n"
        "- Never mention any competitor.\n"
        "- VISUAL VARIETY IS LAW: each scene MUST depict a DISTINCT subject "
        "or composition — honor the director's variety_plan. For a CONCEPT "
        "topic, never show the same person re-angled; rotate between human, "
        "sky/horizon, a Vedic symbolic object, and a celestial wide shot. "
        "For a FESTIVAL/DEITY topic, the deity recurs as the main character "
        "but in genuinely different compositions and scale each scene. Unify "
        "only via palette, lighting and grain.\n"
        "- DEITY PRESENCE: if the director's topic_type is 'planet_deity' "
        "or 'festival_deity' — OR the topic is named after a deity / planet-"
        "deity (Shani, Mangal, Rahu, Ketu, Surya, Chandra, Guru, Shukra, "
        "Hanuman, Shiva, Krishna, etc.) — AT LEAST ONE scene (INCLUDING the "
        "HERO scene at slot 0) MUST depict 'a powerful figure inspired by "
        "[that deity]' with its classical attributes (e.g. Shani: dark stern "
        "figure with iron danda, crow nearby, deep blue-black tones; Mangal: "
        "martial figure with red/copper tones, weapon, fire aura; Rahu: "
        "shadowed serpentine presence; honor the 'inspired by' rule — never "
        "a glossy poster god). The audience must SEE the deity the topic "
        "is about WITHIN THE FIRST 3 SECONDS.\n"
        "- EMOTIONAL ARC (Netflix pace, not one flat mood): the scenes and "
        "voiceover must MOVE through contrast — open in DREAD/tension, move "
        "through STRUGGLE, then TURN toward hope/solution, then the ASK. "
        "Vary the energy beat to beat; do not stay in one somber tone the "
        "whole film.\n"
        "- DOS & DON'TS: include a short, punchy 'kya karein aur kya na "
        "karein' value beat in the voiceover (2-3 quick practical do/don't "
        "lines) BEFORE the withhold. This builds trust — but keep the "
        "PERSONAL specifics withheld for the site.\n"
        "- BRAND RULE: the brand NAME in prose/voiceover is 'Trikaal Vaani' "
        "(double-a). But the DOMAIN shown anywhere is ALWAYS "
        "'www.trikalvaani.com' (single-a) — this is the real website. NEVER "
        "write 'TrikaalVaani.com' or any double-a domain; it does not exist.\n"
        "\n"
        "TYPE-3 THUMBNAIL HEADLINE FORMULA (clicks -> CASH, not clicks -> noise):\n"
        "The thumb_headline MUST follow [SPECIFIC] + [AUTHORITY] + [OPEN LOOP].\n"
        "  - SPECIFIC: a number (prefer 3 / 5 / 7), a rashi name, a house, "
        "or a planet — something concrete that makes the viewer ask 'am I "
        "one of them?'.\n"
        "  - AUTHORITY: a real classical Jyotish term (Sade Sati, Mahadasha, "
        "Antardasha, Yoga, Dosha, Lagna, etc.) — shows you are not a "
        "generic shock-channel.\n"
        "  - OPEN LOOP: a question or unfinished line — 'SHURU?', 'BARBAAD?', "
        "'KYA HOGA?'. Never a complete fact.\n"
        "Good examples: '3 RASHI: SADE SATI SHURU?', 'LAGNA KE 5 RAAZ', "
        "'SHANI MAHADASHA: 4 SANKET', 'MANGLIK 6 GHAR: SHADI?'.\n"
        "BANNED — these kill pay-conversion (AstroSage trap):\n"
        "  - Pure dread without specificity: 'SHANI SAB LE LEGA', "
        "'BARBAAD KAR DEGI', 'MAR JAAOGE', 'KISMET KHATAM'.\n"
        "  - Generic terms with no number/rashi/house: 'SADE SATI KAISI HOTI HAI'.\n"
        "\n"
        "PRIMARY DEITY IN THUMBNAIL: every hero shot scene description must "
        "include the topic's primary deity faintly looming in the cosmic "
        "background (Shani for Sade Sati, Saturn-presence; Mangal for Mangal "
        "Dosha; Rahu's shadow for Rahu topics; etc.) so viewers recognize "
        "the topic in <0.3 seconds. Foreground stays human/symbolic emotion; "
        "background carries the deity recognition anchor. Honor the "
        "'inspired by' rule even here.\n"
        "\n"
        "NINE PSYCHOLOGY LAYERS (use 2-3 per video, NOT all — keep it natural):\n"
        "  1) SPECIFICITY-OF-NUMBERS — odd numbers (3,5,7) feel more truthful "
        "than vague terms.\n"
        "  2) LOSS FRAMING in Act 1 — humans click 2x harder to AVOID loss "
        "than to gain. Use PROTECT/PRESERVE language ('apni shanti bachayein') "
        "NOT DESTROY language ('barbaad ho jaayega').\n"
        "  3) SOCIAL PROOF NUMBERS — embed credibility invisibly: '5000 saal "
        "se', 'lakhon log', 'Bharatvarsha mein paramparagat'.\n"
        "  4) RECIPROCITY TRIGGER in Act 2 — give ONE real surprising piece "
        "of value before any ask. Viewer feels gifted, clicks to repay.\n"
        "  5) COGNITIVE CLOSURE — structure as numbered list where the LAST "
        "item is withheld: 'teen sanket hain — pehla yeh, doosra yeh, "
        "teesra sirf aapki kundali bata sakti hai'.\n"
        "  6) SPECIFIC BPHS CITATION — when applicable, cite a real classical "
        "source with specificity. Only cite what the research supports.\n"
        "  7) PREMIUM VOCABULARY — sprinkle (not flood) vishesh, guhya, "
        "shastra-sammat, rahasya, sanket, divya, paramparagat.\n"
        "  8) AUTHORITY PAIRING — combine classical source + specific number "
        "in one breath.\n"
        "  9) OPEN-LOOP STRUCTURE — opens with a question, body builds the "
        "itch, end ALWAYS withholds the personal answer for the site.\n"
        "\n"
        "Each scene description you write MUST follow these cinematic laws:\n"
        + CINEMATIC_LAWS +
        "\n\nMOOD FOR THIS VIDEO (obey this palette/energy in EVERY scene — "
        "this is what makes the channel feel varied, not one endless dark "
        "trailer):\n" + mood_block(treatment.get("mood_key", "mystery")) +
        "\n\nSHOT-VARIETY GRID (MANDATORY — no two scenes may feel alike; "
        "each scene differs on shot distance, subject AND location):\n"
        "  Scene 1 (HERO): extreme/medium close-up of the main figure's "
        "face or eyes — the tightest, most arresting shot of the set.\n"
        "  Scene 2: WIDE environmental — figure small in a vast landscape "
        "(mountains / river ghat / night field / temple courtyard).\n"
        "  Scene 3: SYMBOLIC OBJECT macro — NO full human; a Vedic object "
        "tied to the topic (iron danda, rudraksha, copper vessel, lamp, "
        "manuscript, planetary symbol) in extreme detail.\n"
        "  Scene 4: HANDS or OVER-THE-SHOULDER — human action not face "
        "(hands offering, walking away, lighting a diya, holding a thread).\n"
        "  Scene 5: CELESTIAL / SKY wide — planet, cosmos, horizon, dawn or "
        "night sky; the figure a silhouette or absent.\n"
        "RULES: never repeat a camera distance; never the same person at the "
        "same angle twice; vary TIME OF DAY and LOCATION across scenes within "
        "the mood; the MOOD palette unifies, the COMPOSITION must differ.\n"
        "RE-RUN DIVERSITY: assume the viewer saw your last video on this exact "
        "topic — deliberately choose a different setting, figure age, and "
        "time-of-day from the obvious choice, keeping the mood palette.\n"
        f"\nAppend this realism block to every scene: {HUMAN_REALISM_BLOCK}.\n"
        "Respond ONLY with raw JSON. No markdown fences. No preamble. "
        "No commentary after the closing brace. JUST the JSON object."
    )

    user = (
        f"TOPIC:\n{topic}\n\n"
        f"CINEMATIC TREATMENT (from the director — honor it):\n"
        f"{json.dumps(treatment, ensure_ascii=False)}\n"
        f"{hook_note}\n"
        f"NUMBER OF IMAGE SLIDES TO DESCRIBE: exactly {image_count}\n\n"
        "Return JSON with ONLY these creative fields:\n"
        "{\n"
        '  "title": "OPEN-LOOP Hindi/Hinglish title, max 9 words, never a complete fact",\n'
        '  "thumb_headline": "TYPE-3 thumbnail headline. MAX 5 WORDS. [SPECIFIC] + [AUTHORITY] + [OPEN LOOP]. ENGLISH or Hinglish CAPS.",\n'
        '  "motion_prompt": "20-30 word camera direction for the HERO SHOT: slow cinematic dolly push / slow circular orbit / dramatic pullback revealing cosmic scale / slow aerial top-down / layered parallax. Atmospheric drift, practical lighting, 9:16 vertical, slow divine pacing only.",\n'
        '  "overlay_cta": "ENGLISH ONLY on-screen CTA, max 6 words, e.g. Free Kundli on www.trikalvaani.com",\n'
        '  "voiceover": "the Honey Trap Hinglish script, ' + word_target + ', hook in first 6 words, moves DREAD->STRUGGLE->TURN->ASK, includes a quick dos-and-donts beat, ends on the link CTA",\n'
        '  "scenes": ["exactly ' + str(image_count) + ' cinematic scene descriptions, DISTINCT subjects per the variety_plan, at least one deity frame if topic is deity-centred, following the dread->struggle->turn arc"],\n'
        '  "caption": "Instagram caption ~110 words. First line = curiosity hook + Link in bio. Emoji-rich body. Ends trikalvaani.com",\n'
        '  "hashtags": ["18-22 relevant hashtags without # symbol"]\n'
        "}"
    )

    raw = claude_text(system, user, max_tokens=5000, temperature=0.9)
    try:
        pkg = extract_json(raw)
    except Exception as e:
        log(f"  Creative pass JSON parse failed ({e}) — retrying with strict prompt")
        strict_user = user + ("\n\nIMPORTANT: your previous response was not valid JSON. "
                              "Return ONLY raw JSON. No markdown fences. No commentary. "
                              "Start with {{ and end with }}. Nothing else.")
        raw = claude_text(system, strict_user, max_tokens=5000, temperature=0.7)
        pkg = extract_json(raw)

    # enforce scene count
    scenes = pkg.get("scenes", [])
    if len(scenes) > image_count:
        pkg["scenes"] = scenes[:image_count]
    log(f"Creative pass: title={pkg.get('title','')[:50]}...")
    return pkg


# =============================================================
# STAGE 2B — METADATA PASS (Sonnet, focused on discovery)
# Takes Call-1's creative output as CONTEXT and writes SEO/GEO/
# AEO/EEAT metadata that MATCHES the video. 5000 tokens room.
# Fail-safe: if Sonnet errors, returns sensible defaults so the
# video still ships with basic metadata.
# =============================================================
def metadata_pass(topic: str, creative: dict, fmt: str = "shorts") -> dict:
    system = (
        "You are an SEO + AI-search strategist for Trikaal Vaani "
        "(trikalvaani.com), India's premium Vedic astrology brand. You "
        "optimize for: Google search, Google SGE, Perplexity, Gemini, and "
        "YouTube search. Your job is to give a video the strongest possible "
        "discovery signals across SEO + GEO (Generative Engine Optimization) "
        "+ AEO (Answer Engine Optimization) + EEAT.\n\n"
        "Authority signals are ALWAYS:\n"
        "  Author: Rohiit Gupta, Chief Vedic Architect\n"
        "  Expertise: 15+ years Vedic astrology / Jyotish Shastra\n"
        "  Source: Brihat Parashara Hora Shastra (BPHS) classical scripture\n\n"
        "Brand spelling: 'Trikaal Vaani' (double-a) in prose, "
        "'www.trikalvaani.com' (single-a) for the URL. NEVER 'TrikaalVaani.com'.\n\n"
        "Respond ONLY with raw JSON. No markdown fences. No preamble. "
        "No commentary after the closing brace. JUST the JSON object."
    )

    user = (
        f"TOPIC:\n{topic}\n\n"
        f"THE VIDEO ALREADY WRITTEN (use this so your metadata MATCHES it):\n"
        f"Title: {creative.get('title','')}\n"
        f"Thumbnail headline: {creative.get('thumb_headline','')}\n"
        f"Voiceover summary (first 200 chars): {creative.get('voiceover','')[:200]}\n"
        f"Caption: {creative.get('caption','')[:300]}\n\n"
        "Return JSON with ONLY these discovery fields:\n"
        "{\n"
        '  "yt_title": "YouTube title, max 100 chars, keyword-first, still an open loop matching the video",\n'
        '  "yt_description": "180-220 word YouTube description. The VERY FIRST LINE must be the full clickable link on its own line: https://www.trikalvaani.com . Then a blank line, then a 1-line hook, then the body. Repeat the link once more near the end.",\n'
        '  "seo_description": "Keyword-rich 150-160 char meta description for search engines, includes the main keyword + Trikaal Vaani.",\n'
        '  "keywords": ["10-15 SEO search keywords/phrases (with spaces, not hashtags) people would actually type"],\n'
        '  "geo_answer": "GEO: a 40-60 word DIRECT factual answer to the core question of this topic, written so Perplexity / Google SGE / Gemini can lift it as a citation. Authoritative, classical-Jyotish-grounded, self-contained.",\n'
        '  "faq": [{"q": "a real question users ask about this topic", "a": "a clean 30-50 word extractable answer"}],\n'
        '  "eeat": {"author": "Rohiit Gupta, Chief Vedic Architect", "expertise": "15+ years Vedic astrology and Jyotish Shastra", "source": "Brihat Parashara Hora Shastra (BPHS) classical scripture", "experience_signal": "one credibility line grounding this topic in classical Vedic authority"}\n'
        "}\n"
        "For the faq array, give 3-4 question-answer pairs. Keep every "
        "answer factual and classical-source grounded (do NOT give the "
        "viewer's PERSONAL chart answer — that stays on the site)."
    )

    # default fallback metadata if Sonnet errors entirely
    fallback = {
        "yt_title": (creative.get("title") or "Trikaal Vaani")[:100],
        "yt_description": (
            "https://www.trikalvaani.com\n\n"
            f"{creative.get('caption', '')[:600]}\n\n"
            "Apni FREE Kundli aur poori life prediction yahan dekhein:\n"
            "https://www.trikalvaani.com"
        ),
        "seo_description": (creative.get("title", "") + " — Trikaal Vaani")[:160],
        "keywords": ["Vedic Astrology", "Trikaal Vaani", "Free Kundli",
                     "Jyotish", "Kundali Reading"],
        "geo_answer": "",
        "faq": [],
        "eeat": {
            "author": "Rohiit Gupta, Chief Vedic Architect",
            "expertise": "15+ years Vedic astrology and Jyotish Shastra",
            "source": "Brihat Parashara Hora Shastra (BPHS)",
            "experience_signal": ""
        },
    }

    try:
        raw = claude_text(system, user, max_tokens=5000, temperature=0.7)
        try:
            meta = extract_json(raw)
        except Exception:
            log("  Metadata pass JSON parse failed — retrying strict")
            strict_user = user + ("\n\nIMPORTANT: your previous response was not valid JSON. "
                                  "Return ONLY raw JSON. Start with {{ end with }}. Nothing else.")
            raw = claude_text(system, strict_user, max_tokens=5000, temperature=0.5)
            meta = extract_json(raw)
        log(f"Metadata pass: yt_title={meta.get('yt_title','')[:50]}...")
        # merge over fallback so any missing field gets a default
        for k, v in fallback.items():
            if k not in meta or not meta[k]:
                meta[k] = v
        return meta
    except Exception as e:
        log(f"  Metadata pass FAILED ({e}) — using fallback metadata, video still ships")
        return fallback


# =============================================================
# STAGE 2 COMPAT WRAPPER — keeps the old honeytrap_pass()
# signature/return shape intact so the rest of the pipeline
# doesn't need to change. Internally now does Call 1 + Call 2.
# =============================================================
def honeytrap_pass(topic: str, treatment: dict, image_count: int,
                   fmt: str = "shorts", hook_video: bool = False,
                   video_description: str = "") -> dict:
    """Backward-compatible wrapper: creative_pass + metadata_pass merged."""
    creative = creative_pass(topic, treatment, image_count, fmt=fmt,
                             hook_video=hook_video,
                             video_description=video_description)
    meta = metadata_pass(topic, creative, fmt=fmt)
    # merge — creative fields stay primary; metadata fields layer on
    merged = dict(creative)
    merged.update(meta)
    log(f"Honey Trap split-pass: title={merged.get('title','')[:40]}... "
        f"yt_title={merged.get('yt_title','')[:40]}...")
    return merged


# =============================================================
# FFMPEG EFFECT LIBRARY — v2.8 FULL CINEMA UPGRADE
# 18 TRUE Ken Burns motions (10 rewritten + 8 new) + ease curves
# + cinema post-process chain (vignette, grain, color grade,
# camera shake, motion blur, cross-fade, hold frame, speed ramp).
#
# ARCHITECTURE:
#   Every motion now uses BOTH pan AND zoom (true Ken Burns).
#   Linear interpolation REPLACED with ease-in-out cosine curves
#   (smooth start, accelerated middle, smooth end — cinema feel).
#   Each effect has fps=25 + s=1080x1920 (9:16 portrait FORCED).
# =============================================================

# ── Ease curve helper (cosine ease-in-out) ──────────────────
# Standard linear:   v = start + (end-start) * (on/N)
# Cosine ease-out:   v = start + (end-start) * (1 - cos(PI * on/(2*N)))
# Cosine ease-in:    v = start + (end-start) * sin(PI * on/(2*N))
# Cosine ease-both:  v = start + (end-start) * (0.5 - 0.5*cos(PI*on/N))
#
# We use ease-both for most cinematic motions (smooth start AND end).
# We use ease-out for HOOK shots (instant start, smooth end).


# =============================================================
# TIER 1 — REWRITTEN EXISTING EFFECTS (now TRUE Ken Burns)
# All add pan + zoom + ease curve.
# =============================================================

def effect_punch_in(d_frames):
    """HOOK: BOLD punch zoom 1.0->1.55 + pan + ease-out.
    v3.0: magnitude tripled. Instant visible attack."""
    return (f"zoompan="
            f"z='1.0+0.55*sin(PI*on/(2*{d_frames}))':"
            f"x='iw/2-(iw/zoom/2)+iw*0.04*sin(PI*on/(2*{d_frames}))':"
            f"y='ih/2-(ih/zoom/2)-ih*0.03*sin(PI*on/(2*{d_frames}))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_slow_zoom_in(d_frames):
    """TRUE KB: BOLD zoom 1.0->1.45 + drift + ease.
    v3.0: visible cinematic push (was 1.18)."""
    return (f"zoompan="
            f"z='1.0+0.45*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw/2-(iw/zoom/2)+iw*0.06*sin(PI*on/{d_frames})':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_slow_dolly_push(d_frames):
    """TRUE KB DOLLY: BOLD zoom 1.0->1.50 + tilt-up + ease.
    v3.0: camera physically walking in, dramatic (was 1.25)."""
    return (f"zoompan="
            f"z='1.0+0.50*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='ih/2-(ih/zoom/2)-ih*0.08*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_top_to_bottom(d_frames):
    """TRUE KB DESCENT: BOLD y-pan down + zoom 1.30 + ease.
    v3.0: dramatic descent (was 1.10)."""
    return (f"zoompan="
            f"z='1.30+0.10*sin(PI*on/{d_frames})':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='(ih-(ih/zoom))*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_aerial_top_down(d_frames):
    """TRUE KB DRONE: BOLD zoom 1.0->1.35 + downward pan + drift.
    v3.0: drone diving closer (was 1.12)."""
    return (f"zoompan="
            f"z='1.0+0.35*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw/2-(iw/zoom/2)+iw*0.03*sin(2*PI*on/{d_frames})':"
            f"y='ih*0.30*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_zoom_out(d_frames):
    """TRUE KB PULLBACK: BOLD zoom 1.60->1.0 + upward reveal + ease.
    v3.0: dramatic destiny-scale reveal (was 1.35)."""
    return (f"zoompan="
            f"z='1.60-0.60*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='ih/2-(ih/zoom/2)+ih*0.06*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_slow_drift(d_frames):
    """TRUE KB DRIFT: BOLD zoom 1.0->1.35 + horizontal drift + ease.
    v3.0: visible horizontal storytelling (was 1.12)."""
    return (f"zoompan="
            f"z='1.0+0.35*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw*0.15*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_orbit_arc(d_frames):
    """TRUE KB ORBIT: BOLD sweep 20%->80% + zoom 1.35 + ease.
    v3.0: wider arc, camera circling (was 30-70% / 1.10)."""
    return (f"zoompan="
            f"z='1.35+0.08*sin(PI*on/{d_frames})':"
            f"x='(iw-(iw/zoom))*(0.20+0.60*(0.5-0.5*cos(PI*on/{d_frames})))':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_parallax_drift(d_frames):
    """TRUE KB PARALLAX: BOLD diagonal drift + zoom 1.40 + ease.
    v3.0: deep documentary parallax (was 1.08)."""
    return (f"zoompan="
            f"z='1.40+0.10*sin(PI*on/{d_frames})':"
            f"x='(iw-(iw/zoom))*(0.25+0.50*(0.5-0.5*cos(PI*on/{d_frames})))':"
            f"y='(ih-(ih/zoom))*(0.30+0.40*(0.5-0.5*cos(PI*on/{d_frames})))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_diagonal(d_frames):
    """TRUE KB DIAGONAL: BOLD zoom 1.0->1.50 + diagonal pan + ease.
    v3.0: strong forward energy (was 1.22)."""
    return (f"zoompan="
            f"z='1.0+0.50*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw*0.18*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"y='ih*0.12*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"d={d_frames}:s=1080x1920:fps=25")


# =============================================================
# TIER 2 — 8 KEN BURNS VARIATIONS (v3.0 BOLD magnitudes)
# =============================================================

def effect_ken_burns_eye_to_wide(d_frames):
    """KB STORY: tight (1.7x) -> zoom out + pan down (1.0x).
    v3.0: bolder reveal (was 1.5)."""
    return (f"zoompan="
            f"z='1.70-0.70*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='ih*0.22+(ih/2-(ih/zoom/2)-ih*0.22)*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_ken_burns_corner_dive(d_frames):
    """KB DIVE: wide (1.0x) -> diagonal zoom into corner (1.6x).
    v3.0: bolder dive (was 1.4)."""
    return (f"zoompan="
            f"z='1.0+0.60*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='(iw-(iw/zoom))*(0.10+0.80*(0.5-0.5*cos(PI*on/{d_frames})))':"
            f"y='(ih-(ih/zoom))*(0.10+0.80*(0.5-0.5*cos(PI*on/{d_frames})))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_ken_burns_horizontal_reveal(d_frames):
    """KB REVEAL: tight left (1.55x) -> pan right + zoom out (1.15x).
    v3.0: bolder (was 1.4->1.1)."""
    return (f"zoompan="
            f"z='1.55-0.40*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='(iw-(iw/zoom))*(0.05+0.90*(0.5-0.5*cos(PI*on/{d_frames})))':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_ken_burns_breathe(d_frames):
    """KB BREATHE: in/out zoom 1.25±0.15 + sway — hypnotic.
    v3.0: deeper breath (was 1.10±0.08)."""
    return (f"zoompan="
            f"z='1.25+0.15*sin(2*PI*on/{d_frames})':"
            f"x='iw/2-(iw/zoom/2)+iw*0.05*sin(2*PI*on/{d_frames})':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_ken_burns_rise(d_frames):
    """KB RISE: bottom (1.55x) -> pan up + zoom out (1.0x).
    v3.0: bolder cosmic rise (was 1.30)."""
    return (f"zoompan="
            f"z='1.55-0.55*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='(ih-(ih/zoom))*(0.85-0.85*(0.5-0.5*cos(PI*on/{d_frames})))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_ken_burns_fall(d_frames):
    """KB FALL: top (1.0x) -> pan down + zoom into detail (1.55x).
    v3.0: bolder descent (was 1.30)."""
    return (f"zoompan="
            f"z='1.0+0.55*(0.5-0.5*cos(PI*on/{d_frames}))':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='(ih-(ih/zoom))*(0.05+0.80*(0.5-0.5*cos(PI*on/{d_frames})))':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_ken_burns_pendulum(d_frames):
    """KB PENDULUM: side-to-side sweep + zoom 1.30 — meditative pulse.
    v3.0: wider sweep, deeper zoom (was 1.12)."""
    return (f"zoompan="
            f"z='1.30+0.08*sin(PI*on/{d_frames})':"
            f"x='(iw-(iw/zoom))*(0.5+0.40*sin(2*PI*on/{d_frames}))':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")


def effect_ken_burns_chase(d_frames):
    """KB CHASE: rapid full-width pan + zoom 1.40 — urgency/dread.
    v3.0: stronger zoom + full sweep (was 1.20)."""
    return (f"zoompan="
            f"z='1.40':"
            f"x='(iw-(iw/zoom))*(0.02+0.96*on/{d_frames})':"
            f"y='ih/2-(ih/zoom/2)+ih*0.03*sin(4*PI*on/{d_frames})':"
            f"d={d_frames}:s=1080x1920:fps=25")


# =============================================================
# CINEMA POST-PROCESS FILTERS (v2.8 NEW — Tier 1 cinema upgrades)
# =============================================================
# Each filter is a self-contained FFmpeg filtergraph string.
# Combined into chains via apply_cinema_post().

# Vignette: darkens corners, focuses subject (PI/4 = 45deg angle, init = computed once)
FILTER_VIGNETTE = "vignette=PI/4:eval=init"

# Film grain: mild analog grain (Kodak Vision3 doctrine)
# alls=strength, allf=t+u = both temporal+uniform (random per-frame, even distribution)
FILTER_FILM_GRAIN = "noise=alls=6:allf=t+u"

# Color grade: dark blue + warm orange cinematic teal/orange grade
# colorbalance shifts: shadows blue, midtones neutral, highlights orange
# eq adjusts saturation + contrast for emotional punch
FILTER_COLOR_GRADE = (
    "colorbalance=rs=-0.05:gs=-0.03:bs=0.10"
    ":rm=0.03:gm=-0.02:bm=0.02"
    ":rh=0.08:gh=-0.02:bh=-0.05,"
    "eq=saturation=1.08:contrast=1.10:brightness=-0.02"
)

# Subtle camera shake: micro-rotation simulating handheld
# 0.0025 rad ≈ 0.14 degrees — barely visible but adds life
FILTER_CAMERA_SHAKE = (
    "rotate='0.0025*sin(2*PI*t)+0.0015*sin(5*PI*t)':"
    "ow=iw:oh=ih:c=black@0"
)

# Motion blur edges: subtle temporal blend (only on slides — not on Veo clip)
FILTER_MOTION_BLUR = "tblend=all_mode=average,framerate=fps=25"


def apply_cinema_post(clip_path: Path, slug: str, slot_idx: int,
                      skip_color_grade: bool = False) -> Path:
    """Apply cinema look chain on a clip: color_grade + grain + vignette.
    Optionally skip color grade if a clip is already graded.
    Returns NEW path; original kept intact for safety."""
    filters = []
    if not skip_color_grade:
        filters.append(FILTER_COLOR_GRADE)
    filters.append(FILTER_FILM_GRAIN)
    filters.append(FILTER_VIGNETTE)
    chain = ",".join(filters)

    out = TEMP_DIR / f"pro_cinema_{slug}_s{slot_idx}_{ts()}.mp4"
    try:
        res = subprocess.run([
            "ffmpeg", "-y", "-i", str(clip_path),
            "-vf", chain,
            "-c:v", "libx264", "-preset", "fast", "-crf", "20",
            "-an", "-pix_fmt", "yuv420p", str(out)
        ], capture_output=True, timeout=180)
        if out.exists() and out.stat().st_size > 1000:
            return out
        log(f"  Cinema post failed slot {slot_idx}: {res.stderr[-150:]}")
        return clip_path
    except Exception as e:
        log(f"  Cinema post exception slot {slot_idx}: {e}")
        return clip_path


def apply_camera_shake(clip_path: Path, slug: str, slot_idx: int) -> Path:
    """Apply subtle handheld camera shake. ONLY use on hero slot 0.
    Returns NEW path; falls back to input on failure."""
    out = TEMP_DIR / f"pro_shake_{slug}_s{slot_idx}_{ts()}.mp4"
    try:
        res = subprocess.run([
            "ffmpeg", "-y", "-i", str(clip_path),
            "-vf", FILTER_CAMERA_SHAKE,
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-an", "-pix_fmt", "yuv420p", str(out)
        ], capture_output=True, timeout=180)
        if out.exists() and out.stat().st_size > 1000:
            return out
        return clip_path
    except Exception:
        return clip_path


def apply_speed_ramp_climax(clip_path: Path, slug: str) -> Path:
    """Slow down the LAST 0.5 sec to 0.7x speed — cinematic emphasis.
    Use on hero shot for impact. Returns NEW path."""
    out = TEMP_DIR / f"pro_speedramp_{slug}_{ts()}.mp4"
    try:
        # Get clip duration first
        dur = get_audio_duration(clip_path) or 4.0
        if dur < 1.5:
            return clip_path  # too short to ramp
        normal_end = max(dur - 0.5, 0.5)
        # Two segments: normal speed + slow last 0.5s
        normal = TEMP_DIR / f"pro_speedramp_a_{slug}.mp4"
        slow = TEMP_DIR / f"pro_speedramp_b_{slug}.mp4"
        # Segment A: 0 -> normal_end at 1x
        subprocess.run([
            "ffmpeg", "-y", "-i", str(clip_path),
            "-t", str(normal_end),
            "-c:v", "libx264", "-preset", "fast", "-crf", "20",
            "-an", "-pix_fmt", "yuv420p", "-r", "25", str(normal)
        ], capture_output=True, timeout=60)
        # Segment B: normal_end -> end, slowed via setpts
        subprocess.run([
            "ffmpeg", "-y", "-i", str(clip_path),
            "-ss", str(normal_end),
            "-filter:v", "setpts=1.43*PTS",  # ~0.7x speed (1/0.7 ≈ 1.43)
            "-c:v", "libx264", "-preset", "fast", "-crf", "20",
            "-an", "-pix_fmt", "yuv420p", "-r", "25", str(slow)
        ], capture_output=True, timeout=60)
        # Concat segments
        concat_file = TEMP_DIR / f"pro_speedramp_list_{slug}.txt"
        concat_file.write_text(f"file '{normal}'\nfile '{slow}'\n")
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", str(concat_file), "-c", "copy", str(out)
        ], capture_output=True, timeout=60)
        # Cleanup intermediates
        for p in [normal, slow, concat_file]:
            p.unlink(missing_ok=True)
        if out.exists() and out.stat().st_size > 1000:
            return out
        return clip_path
    except Exception as e:
        log(f"  Speed ramp exception: {e}")
        return clip_path


def crossfade_concat(clip_paths: list, slug: str,
                     fade_dur: float = 0.3) -> Optional[Path]:
    """Concat clips with xfade transitions instead of hard cuts.
    Returns single MP4 path. fade_dur = transition duration in seconds."""
    if len(clip_paths) < 2:
        # single clip — just copy
        if not clip_paths:
            return None
        out = TEMP_DIR / f"pro_xfade_{slug}_{ts()}.mp4"
        subprocess.run(["cp", str(clip_paths[0]), str(out)],
                       capture_output=True, timeout=30)
        return out

    out = TEMP_DIR / f"pro_xfade_{slug}_{ts()}.mp4"
    try:
        # Build xfade chain. For N clips we need N-1 xfades cascaded.
        # Each xfade needs an offset = cumulative duration so far minus fade_dur
        # We compute durations from clip files.
        durs = [get_audio_duration(p) or 4.0 for p in clip_paths]

        # Build the filter_complex string
        inputs = []
        for i, p in enumerate(clip_paths):
            inputs.extend(["-i", str(p)])

        # First two clips
        offset = max(durs[0] - fade_dur, 0.1)
        filter_parts = [
            f"[0:v][1:v]xfade=transition=fade:duration={fade_dur}:offset={offset}[v01]"
        ]
        cumulative = durs[0] + durs[1] - fade_dur
        last_label = "[v01]"

        # Subsequent clips
        for i in range(2, len(clip_paths)):
            new_label = f"[v0{i}]"
            offset = max(cumulative - fade_dur, 0.1)
            filter_parts.append(
                f"{last_label}[{i}:v]xfade=transition=fade:"
                f"duration={fade_dur}:offset={offset}{new_label}"
            )
            cumulative += durs[i] - fade_dur
            last_label = new_label

        filter_complex = ";".join(filter_parts)

        cmd = ["ffmpeg", "-y"]
        cmd.extend(inputs)
        cmd.extend([
            "-filter_complex", filter_complex,
            "-map", last_label,
            "-c:v", "libx264", "-preset", "fast", "-crf", "20",
            "-pix_fmt", "yuv420p", "-r", "25", str(out)
        ])
        res = subprocess.run(cmd, capture_output=True, timeout=300)
        if out.exists() and out.stat().st_size > 10000:
            log(f"  Cross-fade stitch OK ({len(clip_paths)} clips, "
                f"{fade_dur}s transitions)")
            return out
        log(f"  Cross-fade failed, falling back to hard concat: "
            f"{res.stderr[-200:]}")
        return None
    except Exception as e:
        log(f"  Cross-fade exception ({e}) — hard concat fallback")
        return None


# =============================================================
# SLOT ASSIGNMENT — v2.8 Honey Trap-aware mapping
# 18 effects available, mapped to story beats:
#   slot 0 (HOOK)        -> punch_in (bold full-screen zoom, snap attention)
#   slot 1 (LURE)        -> ken_burns_eye_to_wide (intimate -> reveal)
#   slot 2 (PULL)        -> top_to_bottom (descent of truth)
#   slot 3 (WITHHOLD)    -> zoom_out (pullback to BPHS context)
#   slot 4 (PROOF)       -> orbit_arc (mythic authority)
#   slot 5 (FEAR)        -> ken_burns_fall (descending dread)
#   slot 6 (HOPE)        -> ken_burns_rise (ascending light)
#   slot 7 (ASK)         -> parallax_drift (depth = trust)
#   slot 8+ (extra)      -> ken_burns_breathe (meditative)
# =============================================================
SLOT_EFFECTS = [
    effect_punch_in,                # 0 HOOK - bold full-screen punch zoom
    effect_ken_burns_eye_to_wide,   # 1 LURE - intimate to reveal
    effect_top_to_bottom,           # 2 PULL - descent of truth
    effect_zoom_out,                # 3 WITHHOLD - pullback context
    effect_orbit_arc,               # 4 PROOF - mythic authority
    effect_ken_burns_fall,          # 5 FEAR - descending dread
    effect_ken_burns_rise,          # 6 HOPE - ascending light
    effect_parallax_drift,          # 7 ASK - depth = trust
    effect_ken_burns_breathe,       # 8+ extra - meditative
]

# Full library accessible by name (for debugging / future router work)
EFFECT_LIBRARY = {
    "punch_in":                effect_punch_in,
    "slow_zoom_in":            effect_slow_zoom_in,
    "slow_dolly_push":         effect_slow_dolly_push,
    "top_to_bottom":           effect_top_to_bottom,
    "aerial_top_down":         effect_aerial_top_down,
    "zoom_out":                effect_zoom_out,
    "slow_drift":              effect_slow_drift,
    "orbit_arc":               effect_orbit_arc,
    "parallax_drift":          effect_parallax_drift,
    "diagonal":                effect_diagonal,
    "ken_burns_eye_to_wide":   effect_ken_burns_eye_to_wide,
    "ken_burns_corner_dive":   effect_ken_burns_corner_dive,
    "ken_burns_horizontal_reveal": effect_ken_burns_horizontal_reveal,
    "ken_burns_breathe":       effect_ken_burns_breathe,
    "ken_burns_rise":          effect_ken_burns_rise,
    "ken_burns_fall":          effect_ken_burns_fall,
    "ken_burns_pendulum":      effect_ken_burns_pendulum,
    "ken_burns_chase":         effect_ken_burns_chase,
}


def _pick_overlay_asset(folder: Path) -> Optional[Path]:
    """Return a random MP4 overlay from folder if any exist, else None."""
    if not folder.exists():
        return None
    candidates = list(folder.glob("*.mp4")) + list(folder.glob("*.mov"))
    if not candidates:
        return None
    import random
    return random.choice(candidates)


def apply_atmospheric_overlay(clip: Path, slug: str, idx: int) -> Path:
    """OPTIONAL particle / light-leak overlay on a slide clip.
    Activates ONLY if MP4 loops exist in assets/particles/ or assets/lightleaks/.
    If neither exists -> returns the clip unchanged. Fail-safe.

    To enable: drop short transparent particle MP4 loops (ash, smoke, embers,
    god rays, haze) into:
        content-engine/assets/particles/
        content-engine/assets/lightleaks/
    """
    # alternate which type of overlay per slide for variety
    folder = PARTICLES_DIR if idx % 2 == 0 else LIGHTLEAK_DIR
    overlay = _pick_overlay_asset(folder)
    if not overlay:
        # try the other folder
        overlay = _pick_overlay_asset(
            LIGHTLEAK_DIR if folder is PARTICLES_DIR else PARTICLES_DIR)
    if not overlay:
        return clip  # no assets, nothing to do — clean fallback

    out = TEMP_DIR / f"pro_atmo_{idx}_{ts()}.mp4"
    try:
        # screen-blend the overlay; loop it; cap duration to clip duration
        # blend mode 'screen' = additive light (good for particles / leaks)
        fc = (
            "[1:v]scale=1080:1920,setsar=1,loop=loop=-1:size=1:start=0[ov];"
            "[0:v][ov]blend=all_mode=screen:all_opacity=0.35:shortest=1[out]"
        )
        res = subprocess.run([
            "ffmpeg", "-y",
            "-i", str(clip),
            "-stream_loop", "-1", "-i", str(overlay),
            "-filter_complex", fc, "-map", "[out]",
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-an", "-pix_fmt", "yuv420p", "-shortest", str(out)
        ], capture_output=True, timeout=180)
        if out.exists() and out.stat().st_size > 1000:
            log(f"  Atmospheric overlay applied: {overlay.name}")
            return out
        log(f"  Atmo overlay failed: {res.stderr[-120:]} — using base clip")
    except Exception as e:
        log(f"  Atmo overlay exception: {e} — using base clip")
    return clip

def get_effect(idx: int):
    if idx < len(SLOT_EFFECTS):
        return SLOT_EFFECTS[idx]
    return effect_diagonal


# =============================================================
# GEMINI HELPERS (TTS + video analysis + image gen only)
# Sonnet does the words; Gemini does pixels & voice.
# =============================================================
def gemini_analyse_video(video_bytes: bytes, mime: str = "video/mp4") -> str:
    """Upload to Gemini Files API, WAIT for ACTIVE, then analyse. (v1.3 fix)"""
    log("Uploading Flow video to Gemini Files API...")
    upload_url = (f"https://generativelanguage.googleapis.com/upload/v1beta/"
                  f"files?key={GEMINI_API_KEY}")
    headers = {
        "X-Goog-Upload-Command": "upload, finalize",
        "X-Goog-Upload-Header-Content-Type": mime,
        "Content-Type": mime,
    }
    up_resp = requests.post(upload_url, headers=headers,
                             data=video_bytes, timeout=120)
    up_resp.raise_for_status()
    file_info = up_resp.json()["file"]
    file_uri = file_info["uri"]
    file_name = file_info["name"]
    log(f"Video uploaded: {file_uri}")

    # WAIT for ACTIVE (v1.3 fix)
    log("Waiting for Gemini ACTIVE state...")
    state_url = (f"https://generativelanguage.googleapis.com/v1beta/"
                 f"{file_name}?key={GEMINI_API_KEY}")
    waited = 0
    while waited < 60:
        try:
            st = requests.get(state_url, timeout=30).json().get("state", "")
            log(f"  File state: {st} ({waited}s)")
            if st == "ACTIVE":
                break
            if st == "FAILED":
                raise Exception("Gemini file processing FAILED")
        except Exception as e:
            log(f"  State check: {e}")
        time.sleep(5)
        waited += 5

    url = (f"https://generativelanguage.googleapis.com/v1beta/"
           f"models/{GEMINI_TEXT_MODEL}:generateContent?key={GEMINI_API_KEY}")
    payload = {
        "contents": [{"parts": [
            {"fileData": {"mimeType": mime, "fileUri": file_uri}},
            {"text": (
                "Analyse this video in 80-120 words: 1) main subject and action, "
                "2) dominant color palette (specific), 3) camera movement, "
                "4) lighting mood, 5) emotional tone. Be visual and specific."
            )}
        ]}],
        "generationConfig": {"maxOutputTokens": 500, "temperature": 0.3}
    }
    resp = requests.post(url, json=payload, timeout=90)
    resp.raise_for_status()
    desc = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    log(f"Video analysed: {desc[:80]}...")
    return desc


def generate_tts(script: str, retries: int = 3) -> Optional[Path]:
    """Gemini Charon TTS. Returns WAV path. Retries on failure."""
    log("Generating TTS via Gemini Charon...")
    url = (f"https://generativelanguage.googleapis.com/v1beta/"
           f"models/{GEMINI_TTS_MODEL}:generateContent?key={GEMINI_API_KEY}")
    payload = {
        "contents": [{"parts": [{"text": script}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {
                "prebuiltVoiceConfig": {"voiceName": "Charon"}}}
        }
    }
    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(url, json=payload, timeout=120)
            resp.raise_for_status()
            audio_b64 = resp.json()["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
            raw_pcm = base64.b64decode(audio_b64)
            audio_path = TEMP_DIR / f"pro_tts_{ts()}.wav"
            with wave.open(str(audio_path), 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(24000)
                wf.writeframes(raw_pcm)
            log(f"TTS saved: {audio_path.name}")
            return audio_path
        except Exception as e:
            log(f"  TTS attempt {attempt} failed: {e}")
            time.sleep(3 * attempt)
    return None


def generate_images(scenes: list, retries: int = 2) -> list:
    """Gemini image generation. Returns list of Paths. Retries per scene."""
    images = []
    url = (f"https://generativelanguage.googleapis.com/v1beta/"
           f"models/{GEMINI_IMAGE_MODEL}:generateContent?key={GEMINI_API_KEY}")
    for i, scene in enumerate(scenes):
        log(f"Generating image {i+1}/{len(scenes)}...")
        payload = {
            "contents": [{"parts": [{"text": scene}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]}
        }
        got = False
        for attempt in range(1, retries + 1):
            try:
                resp = requests.post(url, json=payload, timeout=180)
                data = resp.json()
                if 'candidates' not in data:
                    log(f"  Image {i+1} attempt {attempt}: {data.get('error','no candidates')}")
                    time.sleep(3)
                    continue
                for p in data['candidates'][0]['content']['parts']:
                    if 'inlineData' in p:
                        img_bytes = base64.b64decode(p['inlineData']['data'])
                        img_path = TEMP_DIR / f"pro_img_{i}_{ts()}.png"
                        img_path.write_bytes(img_bytes)
                        images.append(img_path)
                        log(f"  Image {i+1} OK ({len(img_bytes)//1024} KB)")
                        got = True
                        break
                if got:
                    break
            except Exception as e:
                log(f"  Image {i+1} attempt {attempt} failed: {e}")
                time.sleep(3)
        time.sleep(2)
    log(f"Images: {len(images)}/{len(scenes)} generated")
    return images


# =============================================================
# v3.1.0 — AI VIDEO MOTION ENGINE REMOVED (Kling + Veo deleted).
# Motion is now 100% FFmpeg Ken Burns (zoompan) on still images.
# No Gemini/Veo video calls, no fal.ai, no external video API,
# no per-clip video cost. veo_motion() deleted; restore from git
# history if AI video is ever wanted again.
# =============================================================


def get_audio_duration(audio_path: Path) -> float:
    try:
        res = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_format", str(audio_path)],
            capture_output=True, text=True, timeout=30
        )
        dur = float(json.loads(res.stdout)["format"]["duration"])
        return dur if 0 < dur < 180 else 48.0
    except Exception:
        return 48.0


# =============================================================
# PILLOW BRANDING OVERLAY — v2.8 CLEAN VISUAL
# v2.7.1 BUG: drew CENTER CTA pill at y=880 over every clip,
# killing cinema feel. v2.8 removes center pill entirely.
# Now only: (1) top www.trikalvaani.com (small, top-center)
#           (2) bottom Rohiit Gupta - Chief Vedic Architect
# This restores cinematic visual + still maintains brand presence.
# =============================================================
def apply_pillow_overlay(clips: list, overlay_cta: str = "") -> list:
    from PIL import Image, ImageDraw, ImageFont
    try:
        font_url = ImageFont.truetype(str(FONT_ENG), 38)
        font_brand = ImageFont.truetype(str(FONT_ENG), 28)
    except Exception as e:
        log(f"Pillow font error: {e}")
        return clips

    # v3.0.1 MOTION FIX: probe clip dimensions ONCE, build a SINGLE
    # TRANSPARENT text PNG (text only, fully transparent elsewhere), and
    # overlay it on the moving video. The old code extracted frame 0,
    # composited text onto that FULL OPAQUE frame, then overlaid the whole
    # still on the video — which buried every moving frame under a frozen
    # copy of frame 0. THAT was the static-video bug (5-day blocker).
    # Now only the text pixels are opaque; the motion shows through.
    W, H = 1080, 1920
    try:
        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=width,height",
             "-of", "csv=p=0", str(clips[0])],
            capture_output=True, text=True, timeout=30)
        wh = probe.stdout.strip().split(",")
        if len(wh) == 2:
            W, H = int(wh[0]), int(wh[1])
    except Exception:
        pass

    # Build the transparent text overlay PNG ONCE (same for every clip).
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    def draw_centered(text, font, y, color, shadow=True):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        if shadow:
            for dx, dy in [(2, 2), (-2, 2), (2, -2), (-2, -2)]:
                draw.text((x+dx, y+dy), text, font=font, fill=(0, 0, 0, 220))
        draw.text((x, y), text, font=font, fill=color)

    # v2.8 branding: ONLY top URL + bottom author. NO CENTER CTA PILL.
    draw_centered("www.trikalvaani.com", font_url, 60, (212, 175, 55, 255))
    draw_centered("Rohiit Gupta - Chief Vedic Architect",
                  font_brand, H-60, (212, 175, 55, 255))

    overlay_png = TEMP_DIR / f"pro_textoverlay_{ts()}.png"
    overlay.save(str(overlay_png))  # RGBA, transparent except text

    processed = []
    for clip in clips:
        try:
            out_clip = Path(str(clip).replace('.mp4', '_txt.mp4'))
            res = subprocess.run([
                "ffmpeg", "-y", "-i", str(clip), "-i", str(overlay_png),
                "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto",
                "-c:v", "libx264", "-preset", "fast", "-crf", "21",
                "-pix_fmt", "yuv420p", str(out_clip)
            ], capture_output=True, timeout=180)
            processed.append(out_clip if (out_clip.exists() and
                              out_clip.stat().st_size > 1000) else clip)
        except Exception as e:
            log(f"  Pillow overlay failed: {e}")
            processed.append(clip)
    overlay_png.unlink(missing_ok=True)
    return processed


# =============================================================
# END CARD (Claude's extra flavour — Act 4 conversion frame)
# A final ~2s slide: dark, logo, CTA, link. Pure Pillow.
# =============================================================
def build_end_card(slug: str) -> Optional[Path]:
    from PIL import Image, ImageDraw, ImageFont
    try:
        f_big = ImageFont.truetype(str(FONT_ENG), 64)
        f_mid = ImageFont.truetype(str(FONT_ENG), 52)
        f_small = ImageFont.truetype(str(FONT_ENG), 34)
    except Exception as e:
        log(f"End-card font error: {e}")
        return None
    try:
        W, H = 1080, 1920
        img = Image.new("RGB", (W, H), (8, 11, 18))  # brand bg #080B12
        draw = ImageDraw.Draw(img)

        def ctr(text, font, y, color):
            bbox = draw.textbbox((0, 0), text, font=font)
            x = (W - (bbox[2]-bbox[0])) // 2
            draw.text((x, y), text, font=font, fill=color)

        if LOGO_PATH.exists():
            logo = Image.open(LOGO_PATH).convert("RGBA").resize((220, 220))
            img.paste(logo, ((W-220)//2, 560), logo)

        ctr("Apni Free Kundli Dekhein", f_mid, 860, (212, 175, 55))
        ctr("www.trikalvaani.com", f_big, 960, (255, 255, 255))
        ctr("Link in bio", f_small, 1060, (212, 175, 55))
        # arrow down
        ctr("v", f_big, 1140, (212, 175, 55))

        path = TEMP_DIR / f"pro_endcard_{slug}.png"
        img.save(str(path))
        # 2 second clip
        clip = TEMP_DIR / f"pro_endcard_{slug}.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(path),
            "-t", "2.2", "-c:v", "libx264", "-preset", "fast",
            "-crf", "20", "-pix_fmt", "yuv420p", "-r", "25",
            "-vf", "scale=1080:1920", str(clip)
        ], capture_output=True, timeout=60)
        path.unlink(missing_ok=True)
        if clip.exists() and clip.stat().st_size > 1000:
            log("End card built")
            return clip
        return None
    except Exception as e:
        log(f"End card failed: {e}")
        return None


# =============================================================
# THUMBNAIL ENGINE (NEW v2.1)
# Fresh dedicated image (hero_shot_concept) + Pillow overlay:
#   - BIG topic text at top
#   - www.trikalvaani.com brand + logo corner
#   - "Rohiit Gupta - Chief Vedic Architect" strip
# Returns PNG path (1080x1920). FAILS SAFE -> returns None.
# =============================================================
def build_thumbnail(treatment: dict, topic_text: str, slug: str,
                    script_thumb_headline: str = "") -> Optional[Path]:
    from PIL import Image, ImageDraw, ImageFont
    try:
        # 1) fresh dedicated image from the hero concept
        hero_prompt = treatment.get("hero_shot_concept", "") or topic_text
        hero_prompt = (
            hero_prompt + ". " + HUMAN_REALISM_BLOCK +
            ". 9:16 vertical, cinematic, no text, no watermark."
        )
        imgs = generate_images([hero_prompt], retries=2)
        if not imgs:
            log("Thumbnail: hero image gen failed — skipping thumbnail")
            return None
        base = Image.open(imgs[0]).convert("RGBA")
        # cover-fit to 1080x1920
        base = base.resize((1080, 1920))
        W, H = base.size

        draw = ImageDraw.Draw(base)
        try:
            f_topic = ImageFont.truetype(str(FONT_ENG), 78)
            f_topic_sm = ImageFont.truetype(str(FONT_ENG), 58)
            f_brand = ImageFont.truetype(str(FONT_ENG), 40)
            f_name = ImageFont.truetype(str(FONT_ENG), 34)
        except Exception as e:
            log(f"Thumbnail font error: {e}")
            return None

        # short punchy headline (prefer Sonnet's thumb_headline, else derive)
        raw_head = (script_thumb_headline or topic_text or "").strip()
        topic_line = "".join(c for c in raw_head if ord(c) < 128)
        topic_line = topic_line.replace("\n", " ").strip()
        words = topic_line.split()
        # keep it punchy: max 4 words for a clean thumbnail headline
        headline = " ".join(words[:4]).upper() if words else "VEDIC ASTROLOGY"

        def wrap(text, font, max_w):
            out, line = [], ""
            for w in text.split():
                test = (line + " " + w).strip()
                if draw.textlength(test, font=font) <= max_w:
                    line = test
                else:
                    if line:
                        out.append(line)
                    line = w
            if line:
                out.append(line)
            return out

        # logo occupies top-right ~150px; keep headline clear of it
        text_max_w = W - 120
        font_use = f_topic if draw.textlength(headline, font=f_topic) < text_max_w else f_topic_sm
        lines = wrap(headline, font_use, text_max_w)

        # dark gradient band at top for legibility
        band = Image.new("RGBA", (W, 470), (0, 0, 0, 0))
        bd = ImageDraw.Draw(band)
        for yy in range(470):
            a = int(190 * (1 - yy/470))
            bd.line([(0, yy), (W, yy)], fill=(8, 11, 18, a))
        base.alpha_composite(band, (0, 0))

        # logo top-right FIRST (so we can place text below it)
        if LOGO_PATH.exists():
            try:
                logo = Image.open(LOGO_PATH).convert("RGBA").resize((140, 140))
                base.alpha_composite(logo, (W-160, 28))
            except Exception:
                pass

        # BIG topic text — start BELOW the logo band so no collision
        y = 200
        for ln in lines[:3]:
            tw = draw.textlength(ln, font=font_use)
            x = (W - tw) // 2
            for dx, dy in [(3,3),(-3,3),(3,-3),(-3,-3)]:
                draw.text((x+dx, y+dy), ln, font=font_use, fill=(0,0,0,235))
            draw.text((x, y), ln, font=font_use, fill=(212, 175, 55, 255))
            y += int(font_use.size * 1.15)

        # bottom brand + name strip
        def ctr_b(text, font, yb, color):
            tw = draw.textlength(text, font=font)
            x = (W - tw) // 2
            for dx, dy in [(2,2),(-2,2),(2,-2),(-2,-2)]:
                draw.text((x+dx, yb+dy), text, font=font, fill=(0,0,0,220))
            draw.text((x, yb), text, font=font, fill=color)

        ctr_b("www.trikalvaani.com", f_brand, H-150, (212, 175, 55, 255))
        ctr_b("Rohiit Gupta - Chief Vedic Architect", f_name, H-95, (255, 255, 255, 255))

        # Save as JPEG, compressed under YouTube's 2 MB thumbnail limit
        out_path = TEMP_DIR / f"pro_thumb_{slug}.jpg"
        q = 88
        base.convert("RGB").save(str(out_path), "JPEG", quality=q, optimize=True)
        # step quality down until under 2 MB (2097152 bytes)
        while out_path.exists() and out_path.stat().st_size > 2000000 and q > 50:
            q -= 8
            base.convert("RGB").save(str(out_path), "JPEG", quality=q, optimize=True)
            log(f"  Thumbnail recompressed q={q} "
                f"({out_path.stat().st_size//1024} KB)")
        if out_path.exists() and out_path.stat().st_size > 1000:
            log(f"Thumbnail built: {out_path.name} "
                f"({out_path.stat().st_size//1024} KB)")
            return out_path
        return None
    except Exception as e:
        log(f"Thumbnail failed (non-fatal): {e}")
        return None


def set_youtube_thumbnail(video_id: str, thumb_path: Path) -> bool:
    """Set custom thumbnail on an uploaded YouTube video. Fail-safe."""
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        from google.oauth2.credentials import Credentials
        creds = Credentials(token=None, refresh_token=YOUTUBE_REFRESH_TOKEN,
                            token_uri="https://oauth2.googleapis.com/token",
                            client_id=YOUTUBE_CLIENT_ID,
                            client_secret=YOUTUBE_CLIENT_SECRET)
        youtube = build("youtube", "v3", credentials=creds)
        youtube.thumbnails().set(
            videoId=video_id,
            media_body=MediaFileUpload(str(thumb_path), mimetype="image/jpeg")
        ).execute()
        log("  YouTube thumbnail set")
        return True
    except Exception as e:
        log(f"  Thumbnail set skipped (non-fatal): {e}")
        return False


def upload_thumb_to_drive(thumb_path: Path, slug: str) -> Optional[str]:
    """Save thumbnail PNG to Drive. Fail-safe."""
    token = get_drive_token()
    if not token:
        return None
    try:
        with open(thumb_path, 'rb') as f:
            img_bytes = f.read()
        metadata = {"name": f"{slug}_THUMBNAIL.jpg", "parents": [DRIVE_FOLDER_ID],
                    "description": f"Thumbnail - {slug}"}
        boundary = "trikal_thumb_boundary"
        body = (f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
                f"{json.dumps(metadata)}\r\n"
                f"--{boundary}\r\nContent-Type: image/jpeg\r\n\r\n").encode() + \
               img_bytes + f"\r\n--{boundary}--".encode()
        resp = requests.post(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
            headers={"Authorization": f"Bearer {token}",
                     "Content-Type": f"multipart/related; boundary={boundary}"},
            data=body, timeout=120)
        if resp.status_code in [200, 201]:
            return f"https://drive.google.com/file/d/{resp.json().get('id')}/view"
        return None
    except Exception as e:
        log(f"Thumb Drive upload skipped: {e}")
        return None


def render_slides(images: list, audio_path: Path,
                  script_data: dict, slug: str,
                  topic_text: str = "",
                  topic_type: str = "",
                  emotional_arc: str = "") -> Optional[Path]:
    """Slides + bold Ken Burns + cinema grade + cross-fade + ambient audio.
    v3.0: Veo removed (FFmpeg hero), bold motion, synthetic ambient bed."""
    log(f"Rendering {len(images)} slides...")
    output_path = OUTPUT_DIR / f"{slug}_slides.mp4"
    audio_dur = get_audio_duration(audio_path)
    img_dur = max(audio_dur / max(len(images), 1), 4.0)
    d_frames = max(int(img_dur * 25), 100)

    # v3.0: build synthetic ambient bed matched to emotional arc, then
    # mix UNDER the voiceover. Fail-safe — falls back to voiceover only.
    mood = _arc_to_mood(emotional_arc)
    ambient = build_ambient_bed(audio_dur, mood, slug)
    audio_path = mix_voiceover_ambient(audio_path, ambient, slug)

    processed = []
    for i, img in enumerate(images):
        out = TEMP_DIR / f"pro_clip_{i}_{ts()}.mp4"

        # v3.0: VEO REMOVED. Hero (slot 0) now uses FFmpeg BOLD punch_in
        # (full screen, no black bars, zero cost). All slots FFmpeg Ken Burns.
        zoompan = get_effect(i)(d_frames)
        # 9:16 enforcement — force_original_aspect_ratio=increase fills
        # 1080x1920 even if source is 16:9 or square; crop centers it.
        vf = (f"scale=1080:1920:force_original_aspect_ratio=increase,"
              f"crop=1080:1920,{zoompan}")
        res = subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(img),
            "-vf", vf, "-t", str(img_dur),
            "-c:v", "libx264", "-preset", "fast",
            "-crf", "20", "-pix_fmt", "yuv420p", "-r", "25", str(out)
        ], capture_output=True, timeout=180)
        if not (out.exists() and out.stat().st_size > 1000):
            log(f"  Clip {i+1} FAILED: {res.stderr[-100:]}")
            continue

        # OPTIONAL atmospheric overlay (particles / light leaks)
        out = apply_atmospheric_overlay(out, slug, i)

        if i == 0:
            # HERO: camera shake + speed ramp + full cinema grade
            shaken = apply_camera_shake(out, slug, i)
            ramped = apply_speed_ramp_climax(shaken, slug)
            finished = apply_cinema_post(ramped, slug, i, skip_color_grade=False)
            processed.append(finished)
            log(f"  Clip {i+1} OK -> {get_effect(i).__name__} + shake + ramp + cinema (HERO)")
        else:
            # SLIDES: full cinema grade
            finished = apply_cinema_post(out, slug, i, skip_color_grade=False)
            processed.append(finished)
            log(f"  Clip {i+1} OK -> {get_effect(i).__name__} + cinema (slide)")

    if not processed:
        return None

    # v2.8: Pillow branding overlay — top URL + bottom author ONLY.
    # Center CTA pill REMOVED (was killing cinema feel).
    processed = apply_pillow_overlay(processed)

    # v2.8: CROSS-FADE stitching (replaces hard concat). Fallback if it fails.
    concat_out = crossfade_concat(processed, slug, fade_dur=0.2)
    if not concat_out or not concat_out.exists():
        log("  Cross-fade returned None — falling back to hard concat")
        concat_file = TEMP_DIR / f"pro_concat_{ts()}.txt"
        concat_file.write_text("\n".join([f"file '{p}'" for p in processed]))
        concat_out = TEMP_DIR / f"pro_concat_{ts()}.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", str(concat_file), "-c", "copy", str(concat_out)
        ], capture_output=True, timeout=120)

    # logo + audio (logo top-right 130px, doesn't conflict with top URL)
    if LOGO_PATH.exists():
        fc = "[1:v]scale=130:130[logo];[0:v][logo]overlay=W-w-25:25[out]"
        cmd = ["ffmpeg", "-y", "-i", str(concat_out), "-i", str(LOGO_PATH),
               "-i", str(audio_path), "-filter_complex", fc,
               "-map", "[out]", "-map", "2:a",
               "-c:v", "libx264", "-preset", "fast", "-crf", "21",
               "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
               "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)]
    else:
        cmd = ["ffmpeg", "-y", "-i", str(concat_out), "-i", str(audio_path),
               "-c:v", "copy", "-map", "0:v", "-map", "1:a",
               "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
               "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)]

    res = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if output_path.exists() and output_path.stat().st_size > 10000:
        log(f"Slides rendered: {output_path.name} "
            f"({output_path.stat().st_size//1024//1024} MB)")
        return output_path
    log(f"Slides render failed: {res.stderr[-300:]}")
    return None


# =============================================================
# v3.0 NEW — SYNTHETIC AMBIENT AUDIO ENGINE
# FFmpeg-generated temple drone + bass + bell, mixed UNDER the
# Gemini Charon voiceover. Zero cost, zero dependency, owned.
# Mood-matched to Director's emotional_arc.
# =============================================================

# Each mood = (drone_freq, bass_freq, bell_freq, drone_vol)
# Frequencies chosen for spiritual/meditative resonance.
AMBIENT_MOODS = {
    "dark":       (110.0, 55.0, 220.0, 0.22),   # dread/serious — low ominous
    "mystery":    (146.83, 73.42, 293.66, 0.18), # D note — hypnotic
    "cosmic":     (98.0, 49.0, 196.0, 0.20),     # G — epic vast
    "hopeful":    (174.61, 87.31, 349.23, 0.16), # F — warm uplifting
    "meditative": (136.10, 68.05, 272.20, 0.18), # OM (C#) — sacred calm
    "sacred":     (130.81, 65.41, 261.63, 0.20), # C — devotional
}


def _arc_to_mood(emotional_arc: str) -> str:
    """Map Director's emotional_arc text to an ambient mood key."""
    a = (emotional_arc or "").lower()
    if any(k in a for k in ["dread", "fear", "warning", "dark", "danger",
                            "barbaad", "loss", "kasht"]):
        return "dark"
    if any(k in a for k in ["mystery", "uncertain", "confusion", "unseen",
                            "rahasya", "hidden", "secret"]):
        return "mystery"
    if any(k in a for k in ["cosmic", "destiny", "vast", "universe", "graha",
                            "epic", "scale", "karmic"]):
        return "cosmic"
    if any(k in a for k in ["hope", "relief", "solution", "remedy", "warmth",
                            "grace", "blessing", "shanti", "light"]):
        return "hopeful"
    if any(k in a for k in ["peace", "calm", "meditat", "dhyan", "spiritual",
                            "moksha", "serene"]):
        return "meditative"
    return "sacred"  # default — devotional


def build_ambient_bed(duration: float, mood: str, slug: str) -> Optional[Path]:
    """Generate a synthetic temple ambient bed via FFmpeg aevalsrc.
    Layers: deep drone + sub bass + soft bell harmonics + slow tremolo.
    Returns WAV path, or None on failure (caller skips ambient)."""
    drone_f, bass_f, bell_f, drone_vol = AMBIENT_MOODS.get(
        mood, AMBIENT_MOODS["sacred"])
    out = TEMP_DIR / f"pro_ambient_{slug}.wav"
    dur = max(duration, 4.0)
    try:
        # Build layered drone via aevalsrc. Multiple sine harmonics +
        # slow amplitude tremolo (breathing) for organic feel.
        # Drone: fundamental + fifth (1.5x) for richness.
        # Bass: sub-octave hum.
        # Bell: high harmonic, very soft, slow tremolo.
        drone = (f"aevalsrc='"
                 f"{drone_vol}*sin(2*PI*{drone_f}*t)*"
                 f"(0.7+0.3*sin(2*PI*0.1*t))"          # slow breathing
                 f"+{drone_vol*0.5}*sin(2*PI*{drone_f*1.5}*t)"  # fifth harmonic
                 f"':s=44100:d={dur}[drone]")
        bass = (f"aevalsrc='"
                f"0.30*sin(2*PI*{bass_f}*t)*(0.8+0.2*sin(2*PI*0.07*t))"
                f"':s=44100:d={dur}[bass]")
        bell = (f"aevalsrc='"
                f"0.08*sin(2*PI*{bell_f}*t)*"
                f"(0.5+0.5*sin(2*PI*0.05*t))"           # very slow shimmer
                f"':s=44100:d={dur}[bell]")
        # mix all three + fade in/out
        fc = (f"{drone};{bass};{bell};"
              f"[drone][bass][bell]amix=inputs=3:duration=longest[mixed];"
              f"[mixed]afade=t=in:st=0:d=2,"
              f"afade=t=out:st={dur-2}:d=2,"
              f"lowpass=f=2000[out]")  # soften highs for warmth
        r = subprocess.run([
            "ffmpeg", "-y",
            "-filter_complex", fc, "-map", "[out]",
            "-ar", "44100", "-ac", "2", str(out)
        ], capture_output=True, timeout=120)
        if out.exists() and out.stat().st_size > 1000:
            log(f"  Ambient bed built: {mood} mood ({dur:.0f}s)")
            return out
        log(f"  Ambient bed failed: {r.stderr.decode()[-150:]}")
        return None
    except Exception as e:
        log(f"  Ambient bed exception: {e}")
        return None


def mix_voiceover_ambient(voiceover: Path, ambient: Optional[Path],
                          slug: str) -> Path:
    """Mix voiceover (100%) over ambient bed (already low vol).
    If ambient is None, returns voiceover unchanged."""
    if not ambient or not ambient.exists():
        return voiceover
    out = TEMP_DIR / f"pro_mixed_audio_{slug}.wav"
    try:
        # Voiceover full volume, ambient already attenuated in build.
        # amix with duration=first so it matches voiceover length.
        r = subprocess.run([
            "ffmpeg", "-y",
            "-i", str(voiceover), "-i", str(ambient),
            "-filter_complex",
            "[0:a]volume=1.0[vo];[1:a]volume=1.0[amb];"
            "[vo][amb]amix=inputs=2:duration=first:dropout_transition=0[out]",
            "-map", "[out]", "-ar", "44100", str(out)
        ], capture_output=True, timeout=120)
        if out.exists() and out.stat().st_size > 1000:
            log(f"  Voiceover + ambient mixed")
            return out
        log(f"  Audio mix failed — using voiceover only")
        return voiceover
    except Exception as e:
        log(f"  Audio mix exception: {e} — voiceover only")
        return voiceover


def stitch_clips(clip_paths: list, slug: str) -> Optional[Path]:
    """Generic re-encode + concat of a list of mp4 clips (v1.3 fix)."""
    log(f"Stitching {len(clip_paths)} clips...")
    output_path = OUTPUT_DIR / f"{slug}.mp4"
    normed = []
    for idx, cp in enumerate(clip_paths):
        n = TEMP_DIR / f"pro_norm_{idx}_{ts()}.mp4"
        # keep audio if present, normalise video params
        subprocess.run([
            "ffmpeg", "-y", "-i", str(cp),
            "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=25",
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-c:a", "aac", "-b:a", "128k", "-pix_fmt", "yuv420p", str(n)
        ], capture_output=True, timeout=180)
        normed.append(n if (n.exists() and n.stat().st_size > 1000) else cp)

    concat_file = TEMP_DIR / f"pro_stitch_{ts()}.txt"
    concat_file.write_text("\n".join([f"file '{p}'" for p in normed]))
    res = subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264", "-preset", "fast", "-crf", "21",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)
    ], capture_output=True, text=True, timeout=300)

    if output_path.exists() and output_path.stat().st_size > 10000:
        log(f"Final video: {output_path.name}")
        return output_path
    log(f"Stitch failed: {res.stderr[-300:]}")
    return None


# =============================================================
# YOUTUBE + DRIVE UPLOAD (reused from v1.x)
# =============================================================
def get_drive_token() -> Optional[str]:
    try:
        resp = requests.post("https://oauth2.googleapis.com/token", data={
            "client_id": DRIVE_CLIENT_ID, "client_secret": DRIVE_CLIENT_SECRET,
            "refresh_token": DRIVE_REFRESH_TOKEN, "grant_type": "refresh_token"
        }, timeout=30)
        return resp.json().get("access_token")
    except Exception as e:
        log(f"Drive token error: {e}")
        return None


def upload_to_drive(video_path: Path, slug: str, title: str) -> Optional[str]:
    """v3.0 FIX: resumable chunked upload via googleapiclient (like YouTube).
    Old multipart single-POST silently failed on larger videos (memory load
    + timeout). Resumable upload handles any size reliably."""
    log("Uploading video to Google Drive...")
    if not DRIVE_REFRESH_TOKEN:
        log("Drive: DRIVE_REFRESH_TOKEN not set")
        return None
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        from google.oauth2.credentials import Credentials
        creds = Credentials(token=None, refresh_token=DRIVE_REFRESH_TOKEN,
                            token_uri="https://oauth2.googleapis.com/token",
                            client_id=DRIVE_CLIENT_ID,
                            client_secret=DRIVE_CLIENT_SECRET)
        drive = build("drive", "v3", credentials=creds)
        metadata = {"name": f"{slug}.mp4", "parents": [DRIVE_FOLDER_ID],
                    "description": f"Trikaal Vaani PRO - {title} - {today_ist()}"}
        media = MediaFileUpload(str(video_path), mimetype="video/mp4",
                                resumable=True, chunksize=5*1024*1024)
        req = drive.files().create(body=metadata, media_body=media,
                                   fields="id")
        resp = None
        while resp is None:
            status, resp = req.next_chunk()
        file_id = resp.get("id")
        if file_id:
            url = f"https://drive.google.com/file/d/{file_id}/view"
            log(f"Drive video: {url}")
            return url
        log("Drive upload: no file id returned")
        return None
    except Exception as e:
        log(f"Drive exception ({type(e).__name__}): {e}")
        return None


def upload_to_youtube(video_path: Path, script_data: dict) -> Optional[str]:
    log("Uploading to YouTube...")
    if not YOUTUBE_REFRESH_TOKEN:
        log("YOUTUBE_REFRESH_TOKEN not set")
        return None
    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        from google.oauth2.credentials import Credentials
        creds = Credentials(token=None, refresh_token=YOUTUBE_REFRESH_TOKEN,
                            token_uri="https://oauth2.googleapis.com/token",
                            client_id=YOUTUBE_CLIENT_ID,
                            client_secret=YOUTUBE_CLIENT_SECRET)
        youtube = build("youtube", "v3", credentials=creds)

        # --- GUARANTEE the clickable link + weave SEO/GEO/AEO/EEAT ---
        # (Link becomes clickable once Advanced features approve; plain text
        #  until then. SEO/GEO/AEO/EEAT signals live in the description where
        #  search + AI engines read them.)
        SITE = "https://www.trikalvaani.com"
        raw_desc = (script_data.get("yt_description", "") or "").strip()

        # GEO direct-answer block (AI-search citation bait)
        geo = (script_data.get("geo_answer", "") or "").strip()
        geo_block = f"\n\n{geo}" if geo else ""

        # AEO FAQ block (answer-engine extractable Q&A)
        faq_block = ""
        faqs = script_data.get("faq", []) or []
        if isinstance(faqs, list) and faqs:
            lines = ["", "", "FAQ:"]
            for item in faqs[:4]:
                q = (item.get("q", "") or "").strip()
                a = (item.get("a", "") or "").strip()
                if q and a:
                    lines.append(f"Q: {q}")
                    lines.append(f"A: {a}")
            faq_block = "\n".join(lines)

        # EEAT authority block
        eeat = script_data.get("eeat", {}) or {}
        eeat_block = (
            f"\n\nAbout: {eeat.get('author', 'Rohiit Gupta, Chief Vedic Architect')} "
            f"| {eeat.get('expertise', '15+ years Vedic astrology & Jyotish')} "
            f"| Source: {eeat.get('source', 'Brihat Parashara Hora Shastra (BPHS)')}."
        )

        # SEO keywords as a trailing tag line
        kw = script_data.get("keywords", []) or []
        kw_block = ("\n\n" + ", ".join(kw[:15])) if kw else ""

        final_desc = (
            f"{SITE}\n\n"
            f"{raw_desc}"
            f"{geo_block}"
            f"{faq_block}"
            f"{eeat_block}\n\n"
            f"Apni FREE Kundli aur poori life prediction yahan dekhein:\n"
            f"{SITE}"
            f"{kw_block}\n\n"
            f"#TrikaalVaani #VedicAstrology #FreeKundli"
        )[:4900]

        # tags: merge keywords + hashtags + sanitize for YouTube's rules
        # YT rules: <=30 chars per tag, <=500 chars TOTAL (joined w commas+spaces),
        # no < or > characters, no leading/trailing whitespace, no empty.
        # Pre v2.6.1 this failed: 'The request metadata specifies invalid video keywords.'
        raw_tags = (script_data.get("keywords", []) or []) + \
                   (script_data.get("hashtags", []) or [])
        seen = set(); merged_tags = []; total_len = 0
        for t in raw_tags:
            if not isinstance(t, str):
                continue
            # strip illegal chars, collapse internal whitespace
            cleaned = t.strip().replace("<", "").replace(">", "").replace('"', "").replace(",", " ")
            # collapse multi-spaces -> single
            cleaned = " ".join(cleaned.split())
            if not cleaned:
                continue
            # YT per-tag cap 30 chars (we go 28 for safety margin)
            if len(cleaned) > 28:
                cleaned = cleaned[:28].rstrip()
            tl = cleaned.lower()
            if tl in seen:
                continue
            # YT total-string cap 500 (comma+space ≈ 2 per tag)
            if total_len + len(cleaned) + 2 > 480:
                break
            seen.add(tl)
            merged_tags.append(cleaned)
            total_len += len(cleaned) + 2
        # cap count at 25 (well under YT's 30-tag practical limit)
        merged_tags = merged_tags[:25]
        log(f"  YT tags: {len(merged_tags)} clean tags ({total_len} chars total)")

        body = {
            "snippet": {
                "title": script_data.get("yt_title",
                         script_data.get("title", "Trikaal Vaani"))[:100],
                "description": final_desc,
                "tags": merged_tags,
                "categoryId": "22"
            },
            "status": {"privacyStatus": "public", "selfDeclaredMadeForKids": False}
        }
        media = MediaFileUpload(str(video_path), chunksize=-1,
                                resumable=True, mimetype="video/mp4")
        request = youtube.videos().insert(part="snippet,status",
                                          body=body, media_body=media)
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                log(f"  YouTube {int(status.progress()*100)}%")
        video_id = response["id"]
        url = f"https://www.youtube.com/shorts/{video_id}"
        log(f"YouTube live: {url}")

        pinned = script_data.get("caption", "") or (
            "Trikaal Vaani - AI-powered Vedic Astrology\n"
            "Free Kundali, Kundali Milan & Life Predictions\n"
            "trikalvaani.com\n#VedicAstrology #FreeKundali #TrikaalVaani")
        # v3.2: append FAQ Q&A to pinned comment (AEO — Google/AI engines
        # extract pinned-comment Q&A for featured answers).
        pin_faqs = script_data.get("faq", []) or []
        if isinstance(pin_faqs, list) and pin_faqs:
            pin_lines = ["", "—— Aksar Pooche Jaane Wale Sawaal ——"]
            for item in pin_faqs[:4]:
                if isinstance(item, dict) and item.get("q"):
                    pin_lines.append(f"Q: {item.get('q','')}")
                    pin_lines.append(f"A: {item.get('a','')}")
            pin_lines.append("")
            pin_lines.append("Apni kundali dekhein: trikalvaani.com")
            pinned = pinned + "\n".join(pin_lines)
        try:
            youtube.commentThreads().insert(part="snippet", body={"snippet": {
                "videoId": video_id, "topLevelComment": {"snippet": {
                    "textOriginal": pinned[:9000]}}}}).execute()
            log("  Pinned comment posted (with FAQ)")
        except Exception as ce:
            log(f"  Pinned comment skipped: {ce}")
        return {"url": url, "video_id": video_id}
    except Exception as e:
        log(f"YouTube exception: {e}")
        return None


# =============================================================
# CAPTION KIT (v1.3 fix — uploaded to Drive in all pipelines)
# =============================================================
def build_pro_caption_kit(script_data: dict, slug: str, pipeline: str) -> str:
    title = script_data.get("title", "")
    caption = script_data.get("caption", "")
    hashtags = " ".join(["#" + h for h in script_data.get("hashtags", [])[:25]])
    yt_desc = script_data.get("yt_description", "")

    # SEO / GEO / AEO / EEAT extras
    seo_desc = script_data.get("seo_description", "")
    keywords = ", ".join(script_data.get("keywords", [])[:15])
    geo = script_data.get("geo_answer", "")
    faqs = script_data.get("faq", []) or []
    faq_txt = "\n".join(
        [f"Q: {f.get('q','')}\nA: {f.get('a','')}" for f in faqs[:4]
         if f.get('q') and f.get('a')]
    )
    eeat = script_data.get("eeat", {}) or {}
    eeat_txt = (f"Author: {eeat.get('author','Rohiit Gupta, Chief Vedic Architect')}\n"
                f"Expertise: {eeat.get('expertise','15+ years Vedic astrology / Jyotish')}\n"
                f"Source: {eeat.get('source','Brihat Parashara Hora Shastra (BPHS)')}")

    return f"""=====================================
TRIKAAL VAANI - PRO CAPTION KIT
Pipeline: {pipeline.upper()}
Title: {title}
Slug: {slug}
Generated: {today_ist()}
=====================================

INSTAGRAM CAPTION (Post -> auto-pushes to FB + Threads)
{caption}

.
.
.
{hashtags}

FACEBOOK CAPTION
{caption}

{hashtags[:200]}

Free Kundali: Link in bio | trikalvaani.com

WHATSAPP BROADCAST
{caption[:200]}

trikalvaani.com

YOUTUBE DESCRIPTION
{yt_desc}

=====================================
SEO / GEO / AEO / EEAT METADATA
=====================================

SEO META DESCRIPTION:
{seo_desc}

SEO KEYWORDS:
{keywords}

GEO DIRECT ANSWER (for AI search citation):
{geo}

AEO FAQ (answer-engine extractable):
{faq_txt}

EEAT AUTHORITY SIGNALS:
{eeat_txt}

=====================================
Jai Trikaal Vaani
trikalvaani.com
====================================="""


def upload_caption_to_drive(caption_text: str, slug: str, title: str) -> Optional[str]:
    log("Uploading caption kit to Drive...")
    token = get_drive_token()
    if not token:
        return None
    try:
        metadata = {"name": f"{slug}_CAPTIONS.txt", "parents": [DRIVE_FOLDER_ID],
                    "description": f"Caption kit - {title}"}
        boundary = "trikal_caption_boundary"
        body = (f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
                f"{json.dumps(metadata)}\r\n"
                f"--{boundary}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n").encode() + \
               caption_text.encode('utf-8') + f"\r\n--{boundary}--".encode()
        resp = requests.post(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
            headers={"Authorization": f"Bearer {token}",
                     "Content-Type": f"multipart/related; boundary={boundary}"},
            data=body, timeout=60)
        if resp.status_code in [200, 201]:
            url = f"https://drive.google.com/file/d/{resp.json().get('id')}/view"
            log(f"Caption kit on Drive: {url}")
            return url
        return None
    except Exception as e:
        log(f"Caption upload exception: {e}")
        return None


def cleanup_pro(slug: str):
    patterns = ["pro_tts_*.wav", "pro_img_*.png", "pro_clip_*.mp4",
                "pro_concat_*.mp4", "pro_concat_*.txt", "pro_stitch_*.txt",
                "pro_norm_*.mp4", "pro_normhook_*.mp4", "pro_endcard_*.mp4",
                "pro_endcard_*.png", "pro_thumb_*.png", "pro_thumb_*.jpg",
                "pro_kling_*.mp4", "pro_klingnorm_*.mp4", "pro_atmo_*.mp4",
                "*_frame.png", "*_overlay.png", "*_txt.mp4", f"{slug}_slides.mp4"]
    for pat in patterns:
        for f in TEMP_DIR.glob(pat):
            f.unlink(missing_ok=True)


# =============================================================
# v2.7 NEW — SUPABASE METADATA SAVE
# Persists every video's full SEO/GEO/AEO/EEAT payload to
# public.pro_content_metadata. Powers /manglik-dosh, /sade-sati
# etc. blog pages with FAQPage schema, above-fold geo_answer,
# and author EEAT signals for AI search citations.
#
# IRON RULE compliance: writes are best-effort. If Supabase is
# down or env keys missing, video upload still succeeds — this
# function never raises, never blocks the pipeline.
# =============================================================
def save_to_supabase(slug: str, pipeline: str,
                     script_data: dict, treatment: dict,
                     topic: str,
                     yt_url: Optional[str],
                     drive_url: Optional[str],
                     thumb_drive_url: Optional[str],
                     caption_drive_url: Optional[str]) -> bool:
    """Upsert one row into public.pro_content_metadata.
    Returns True on success, False on any failure (logged, never raised)."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        log("Supabase save: SUPABASE_URL / KEY missing — skipped")
        return False

    try:
        # ─── derive identity + classification ───
        title = (script_data.get("title", "") or topic).strip()
        topic_slug = slugify_topic(title)
        domain_category = infer_domain_category(
            topic, keywords=script_data.get("keywords", []))

        # ─── build row payload ───
        # All JSONB fields go in as dict/list directly — requests handles
        # serialization via json= parameter below.
        row = {
            # identity
            "slug": slug,
            "topic_slug": topic_slug,
            "pipeline": pipeline,
            "domain_category": domain_category,
            # asset urls
            "yt_url": yt_url or None,
            "drive_url": drive_url or None,
            "thumbnail_drive_url": thumb_drive_url or None,
            "caption_drive_url": caption_drive_url or None,
            # creative
            "title": title,
            "yt_title": script_data.get("yt_title", "")[:500] or None,
            "thumb_headline": script_data.get("thumb_headline", "")[:200] or None,
            "topic_type": (treatment or {}).get("topic_type", "")[:50] or None,
            "emotional_arc": (treatment or {}).get("emotional_arc", "")[:500] or None,
            # caption + tags
            "caption": script_data.get("caption", "") or None,
            "hashtags": script_data.get("hashtags", []) or [],
            # SEO core
            "seo_description": script_data.get("seo_description", "") or None,
            "yt_description": script_data.get("yt_description", "") or None,
            "keywords": script_data.get("keywords", []) or [],
            # GEO / AEO gold
            "geo_answer": script_data.get("geo_answer", "") or None,
            "faq": script_data.get("faq", []) or [],
            # EEAT
            "eeat": script_data.get("eeat", {}) or {},
            # treatment snapshot (for future re-renders, audit, debugging)
            "treatment": treatment or {},
            # status
            "is_published": True,
        }

        # ─── upsert via PostgREST (slug is PK, on_conflict resolves) ───
        url = f"{SUPABASE_URL}/rest/v1/pro_content_metadata"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        }
        params = {"on_conflict": "slug"}

        r = requests.post(url, headers=headers, params=params,
                          json=row, timeout=20)
        if r.status_code in (200, 201, 204):
            log(f"Supabase save: row upserted "
                f"(slug={slug}, domain={domain_category}, "
                f"topic_slug={topic_slug})")
            return True
        log(f"Supabase save FAILED ({r.status_code}): {r.text[:200]}")
        return False
    except Exception as e:
        log(f"Supabase save exception ({type(e).__name__}: {e})")
        return False


# =============================================================
# SHARED FINISH: render -> (stitch) -> end card -> upload
# =============================================================
def _finish_and_upload(script_data, images, audio, slug, pipeline,
                       hook_path: Optional[Path] = None,
                       treatment: Optional[dict] = None,
                       topic: str = "") -> dict:
    # topic_type / emotional_arc are read from the Director's treatment.
    # emotional_arc drives the synthetic ambient bed mood. topic_text /
    # topic_type are still threaded into render_slides for forward-compat
    # (image/scene context); no AI-video motion call uses them anymore.
    topic_type = (treatment or {}).get("topic_type", "")
    emotional_arc = (treatment or {}).get("emotional_arc", "")
    slides = render_slides(images, audio, script_data, slug,
                           topic_text=topic,
                           topic_type=topic_type,
                           emotional_arc=emotional_arc)
    if not slides:
        return {"success": False, "error": "Slides render failed"}

    end_card = build_end_card(slug)

    # assemble: [hook?] + slides + [end card]
    parts = []
    if hook_path and hook_path.exists():
        parts.append(hook_path)
    parts.append(slides)
    if end_card:
        parts.append(end_card)

    if len(parts) == 1:
        video = slides
        final = OUTPUT_DIR / f"{slug}.mp4"
        try:
            subprocess.run(["cp", str(slides), str(final)],
                           capture_output=True, timeout=30)
            video = final
        except Exception:
            video = slides
    else:
        video = stitch_clips(parts, slug)
        if not video:
            return {"success": False, "error": "Stitch failed"}

    # --- THUMBNAIL (fail-safe, never blocks the video) ---
    thumb_path = None
    thumb_drive_url = None
    try:
        thumb_topic = script_data.get("title", "") or topic
        thumb_head = script_data.get("thumb_headline", "")
        thumb_path = build_thumbnail(treatment or {}, thumb_topic, slug,
                                     script_thumb_headline=thumb_head)
        if thumb_path:
            thumb_drive_url = upload_thumb_to_drive(thumb_path, slug)
    except Exception as e:
        log(f"Thumbnail stage skipped (non-fatal): {e}")

    yt = upload_to_youtube(video, script_data)
    yt_url = None
    if isinstance(yt, dict):
        yt_url = yt.get("url")
        # set custom thumbnail on the uploaded video
        if thumb_path and yt.get("video_id"):
            set_youtube_thumbnail(yt["video_id"], thumb_path)
    elif isinstance(yt, str):
        yt_url = yt

    drive_url = upload_to_drive(video, slug, script_data.get("title", ""))
    caption_kit = build_pro_caption_kit(script_data, slug, pipeline)
    caption_url = upload_caption_to_drive(caption_kit, slug,
                                          script_data.get("title", ""))

    # v2.7 NEW — SUPABASE METADATA SAVE (fail-safe, never blocks return)
    supabase_saved = False
    try:
        supabase_saved = save_to_supabase(
            slug=slug,
            pipeline=pipeline,
            script_data=script_data,
            treatment=treatment or {},
            topic=topic,
            yt_url=yt_url,
            drive_url=drive_url,
            thumb_drive_url=thumb_drive_url,
            caption_drive_url=caption_url,
        )
    except Exception as e:
        log(f"Supabase save skipped (non-fatal): {e}")

    cleanup_pro(slug)
    return {
        "success": True, "pipeline": pipeline, "slug": slug,
        "title": script_data.get("title", ""),
        "youtube_url": yt_url, "drive_url": drive_url,
        "caption_drive_url": caption_url,
        "thumbnail_drive_url": thumb_drive_url,
        "caption": script_data.get("caption", ""),
        "hashtags": script_data.get("hashtags", []),
        "geo_answer": script_data.get("geo_answer", ""),
        "seo_description": script_data.get("seo_description", ""),
        "faq": script_data.get("faq", []),
        "eeat": script_data.get("eeat", {}),
        "supabase_saved": supabase_saved,
    }


# =============================================================
# PIPELINE 1 — NATURAL FLOW
# =============================================================
def run_natural(text: str, image_bytes_list: list, slug: str,
                fmt: str = "shorts") -> dict:
    log(f"=== Pipeline 1: Natural | slug={slug} | fmt={fmt} ===")
    try:
        n_img = len(image_bytes_list) or (7 if fmt == "video" else 5)
        researched = gemini_research(text)                    # STAGE 0
        treatment = director_pass(researched)                 # STAGE 1
        script_data = honeytrap_pass(researched, treatment, n_img, fmt=fmt)  # STAGE 2

        images = []
        for i, b in enumerate(image_bytes_list):
            p = TEMP_DIR / f"pro_img_{i}_{ts()}.png"; p.write_bytes(b)
            images.append(p)
        if not images:
            images = generate_images(script_data.get("scenes", [])[:n_img])
        if not images:
            return {"success": False, "error": "No images available"}

        audio = generate_tts(script_data.get("voiceover", text[:200]))
        if not audio:
            return {"success": False, "error": "TTS failed"}

        return _finish_and_upload(script_data, images, audio, slug, "natural",
                                  treatment=treatment, topic=text)
    except Exception as e:
        log(f"Pipeline 1 error: {e}\n{traceback.format_exc()}")
        cleanup_pro(slug)
        return {"success": False, "error": str(e)[:300]}


# =============================================================
# PIPELINE 2 — AI VIDEO (Seedance/Wan/Kling hook clip)
# =============================================================
def run_ai_video(text: str, hook_bytes: bytes,
                 image_bytes_list: list, slug: str,
                 fmt: str = "shorts") -> dict:
    log(f"=== Pipeline 2: AI Video | slug={slug} | fmt={fmt} ===")
    try:
        n_img = len(image_bytes_list) or (5 if fmt == "video" else 3)
        researched = gemini_research(text)
        treatment = director_pass(researched)
        script_data = honeytrap_pass(researched, treatment, n_img,
                                     fmt=fmt, hook_video=True)

        hook_path = TEMP_DIR / f"pro_hook_{slug}.mp4"
        hook_path.write_bytes(hook_bytes)
        log(f"Hook saved: {hook_path.name} ({len(hook_bytes)//1024} KB)")

        images = []
        for i, b in enumerate(image_bytes_list):
            p = TEMP_DIR / f"pro_img_{i}_{ts()}.png"; p.write_bytes(b)
            images.append(p)
        if not images:
            images = generate_images(script_data.get("scenes", [])[:n_img])
        if not images:
            return {"success": False, "error": "No slide images"}

        audio = generate_tts(script_data.get("voiceover", ""))
        if not audio:
            return {"success": False, "error": "TTS failed"}

        return _finish_and_upload(script_data, images, audio, slug,
                                  "ai_video", hook_path=hook_path,
                                  treatment=treatment, topic=text)
    except Exception as e:
        log(f"Pipeline 2 error: {e}\n{traceback.format_exc()}")
        cleanup_pro(slug)
        return {"success": False, "error": str(e)[:300]}


# =============================================================
# PIPELINE 3a — FLOW PROMPT (Sonnet writes the Flow prompt)
# =============================================================
def run_flow_prompt(text: str) -> dict:
    log("=== Pipeline 3a: Flow Prompt ===")
    try:
        researched = gemini_research(text)
        treatment = director_pass(researched)
        system = (
            "You are a cinematographer for Trikaal Vaani. Convert the hero "
            "shot concept into a single Google Flow video prompt.\n" +
            CINEMATIC_LAWS +
            "\nRespond ONLY with raw JSON, no fences."
        )
        user = (
            f"TOPIC:\n{text}\n\nHERO SHOT CONCEPT:\n"
            f"{treatment.get('hero_shot_concept','')}\n\n"
            "Return JSON:\n{\n"
            '  "flow_prompt": "Google Flow video prompt, EXACTLY 20-30 words. '
            'Subject + camera movement + lighting mood + visual style. '
            'No text, no watermark. Vertical 9:16, 720p.",\n'
            '  "topic_summary": "3-5 word topic summary"\n}'
        )
        data = extract_json(claude_text(system, user, max_tokens=600,
                                        temperature=0.85))
        return {
            "success": True,
            "flow_prompt": data.get("flow_prompt", ""),
            "topic_summary": data.get("topic_summary", ""),
            "instructions": (
                "1. Open Google Flow (flow.google.com)\n"
                "2. Resolution 720p, duration 10s\n"
                "3. Paste the flow_prompt\n"
                "4. Generate + download the MP4\n"
                "5. Use /pro/flow-stitch with your video"
            )
        }
    except Exception as e:
        log(f"Pipeline 3a error: {e}")
        return {"success": False, "error": str(e)[:300]}


# =============================================================
# PIPELINE 3b — FLOW STITCH (analyse Flow video -> match -> stitch)
# =============================================================
def run_flow_stitch(text: str, flow_video_bytes: bytes,
                    image_bytes_list: list, slug: str,
                    fmt: str = "shorts") -> dict:
    log(f"=== Pipeline 3b: Flow Stitch | slug={slug} | fmt={fmt} ===")
    try:
        video_description = gemini_analyse_video(flow_video_bytes)
        n_img = len(image_bytes_list) or (5 if fmt == "video" else 3)
        researched = gemini_research(text)
        treatment = director_pass(researched)
        script_data = honeytrap_pass(researched, treatment, n_img, fmt=fmt,
                                     hook_video=True,
                                     video_description=video_description)

        hook_path = TEMP_DIR / f"pro_flow_{slug}.mp4"
        hook_path.write_bytes(flow_video_bytes)
        log(f"Flow hook saved: {hook_path.name} ({len(flow_video_bytes)//1024} KB)")

        images = []
        for i, b in enumerate(image_bytes_list):
            p = TEMP_DIR / f"pro_img_{i}_{ts()}.png"; p.write_bytes(b)
            images.append(p)
        if not images:
            images = generate_images(script_data.get("scenes", [])[:n_img])
        if not images:
            return {"success": False, "error": "No slide images"}

        audio = generate_tts(script_data.get("voiceover", ""))
        if not audio:
            return {"success": False, "error": "TTS failed"}

        result = _finish_and_upload(script_data, images, audio, slug,
                                    "flow_stitch", hook_path=hook_path,
                                    treatment=treatment, topic=text)
        if result.get("success"):
            result["video_description"] = video_description
        return result
    except Exception as e:
        log(f"Pipeline 3b error: {e}\n{traceback.format_exc()}")
        cleanup_pro(slug)
        return {"success": False, "error": str(e)[:300]}


# =============================================================
# HEALTH
# =============================================================
def pro_engine_status() -> dict:
    return {
        "version": "3.0",
        "brain": SONNET_MODEL,
        "research": "gemini_google_search",
        "motion_model": "ffmpeg_bold_ken_burns",
        "veo_status": "removed_restore_ready",
        "anthropic_key_loaded": bool(ANTHROPIC_API_KEY),
        "gemini_key_loaded": bool(GEMINI_API_KEY),
        "supabase_url_loaded": bool(SUPABASE_URL),
        "supabase_key_loaded": bool(SUPABASE_SERVICE_ROLE_KEY),
        "youtube_token_loaded": bool(YOUTUBE_REFRESH_TOKEN),
        "drive_token_loaded": bool(DRIVE_REFRESH_TOKEN),
        "pipelines": ["natural", "ai_video", "flow_prompt", "flow_stitch"],
        "features": [
            # v3.0 NEW
            "veo_removed",
            "bold_motion_b_plus",
            "synthetic_ambient_audio",
            "ambient_6_moods",
            "drive_resumable_upload",
            "crossfade_0_2s",
            # v2.8 preserved
            "true_ken_burns_18_motions",
            "ease_in_out_cosine_curves",
            "cinema_post_chain",
            "filter_vignette", "filter_film_grain",
            "filter_color_grade_blue_orange",
            "filter_camera_shake_hero",
            "speed_ramp_climax_hero",
            "crossfade_stitching",
            "center_cta_removed",
            "9_16_enforcement",
            # v2.7.1 preserved
            "director_respecting_deity_gate",
            # v2.7 preserved
            "supabase_metadata_save",
            "deity_visual_library",
            "domain_category_inference",
            "topic_slug_auto",
            # doctrine preserved
            "honey_trap_4act", "type3_headline", "nine_psychology",
            "planet_deity_topic_type",
            "thumbnail_jpeg", "yt_tag_sanitizer",
            "seo", "geo", "aeo", "eeat",
            "trikaal_look", "split_sonnet_calls", "json_retry",
            "gemini_research", "end_card",
            "atmospheric_overlay_scaffold",
        ],
        "doctrine": "honey_trap_4act",
        "deity_library_size": len(DEITY_VISUAL_LIBRARY),
        "domains_mapped": list(DOMAIN_KEYWORDS.keys()),
        "motion_library_size": len(EFFECT_LIBRARY),
        "cinema_filters": ["vignette", "film_grain", "color_grade",
                           "camera_shake", "motion_blur"],
        "ambient_moods": list(AMBIENT_MOODS.keys()),
    }
