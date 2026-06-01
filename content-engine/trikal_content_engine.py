#!/usr/bin/env python3
"""
TRIKAL VAANI - Content Engine v5.8
=====================================
FLOW 1: YouTube DIRECT upload from VM (no Vercel, no Supabase)
FLOW 2: Google Drive Caption Kit (video + captions txt → Drive folder)
Meta (FB/IG/Threads) = REMOVED (post manually via Instagram → auto-pushes to FB+Threads)
=====================================
NEW IN v5.8 (delivery parity with pro_engine — content unchanged):
  - UPGRADE 1 (YouTube description): publish_to_youtube_direct() now builds a
    rich description like pro_engine: site link on the first line, then the
    Gemini description, then a GEO direct-answer (first aeo_qa answer), an AEO
    FAQ block (aeo_qa Q&A), an EEAT authority line (Rohiit Gupta / 15+ yrs /
    BPHS), and a trailing SEO keyword line from keyword_cluster. Capped 4900.
  - UPGRADE 2 (YT tag sanitizer): tags were raw trending+niche[:30] which can
    trigger YouTube 'invalidTags' (HTTP 400). Now sanitized exactly like
    pro_engine: <=28 chars/tag, <=480 total, strip < > " and commas, collapse
    whitespace, dedupe case-insensitive, cap 25. Pulls from hashtags + keyword_cluster.
  - UPGRADE 3 (Drive resumable upload): upload_to_drive() VIDEO leg switched
    from single-POST multipart (loaded whole file in memory -> silently failed/
    timed out on larger videos) to resumable chunked MediaFileUpload (5MB chunks)
    via googleapiclient, same as pro_engine. Caption-kit TXT stays small multipart.
  - UPGRADE 4 (pinned comment FAQ): pinned comment now appends aeo_qa Q&A under
    a '—— Aksar Pooche Jaane Wale Sawaal ——' header so answer engines extract it.
  - Version bumped v5.7 → v5.8. Content/script pipeline UNCHANGED from v5.7.
NEW IN v5.7:
  - FIX A (null deity / "None" in image prompts): generate_script() used
        festival.get('deity', 'Devta')
    The default 'Devta' only applies when the KEY is MISSING. Postgres returns
    the key present with value None (JSON null), so .get() returned None, which
    leaked the literal "None" into the image prompts ("portrait of None") and
    let Gemini invent an arbitrary/wrong deity. 15 of 43 auto-publish 2026
    festivals have null deity AND null maa_form, so 15 future cron videos would
    have hit this. Now every DB field that feeds a prompt is coerced with `or`
    (None/empty -> safe value), and deity_specific resolves through a guaranteed
    non-empty fallback chain: maa_form -> deity -> cleaned festival_name ->
    generic. Prompts can never say "None" again. Filling the deity column per
    festival still gives the BEST image, but the engine now self-protects.
  - FIX B (hardcoded year -> DYNAMIC year, works 2026..2050+): the SEO/GEO/AEO
    prompt had "2026" hardcoded in meta_description, aeo_qa, voice_search_phrases,
    keyword_cluster, youtube_playlist and schema_event. Future-year festivals
    would have generated wrong-year content, and because festival_name already
    embeds the year it also produced "... 2026 2026" duplication. Now:
      fest_year       = derived from festival['date'][:4]  (fallback: current yr)
      fest_name_clean = festival_name with any 20xx stripped via regex
    All SEO fields use {{fest_name_clean}} {{fest_year}} -> correct year for any
    festival in any year, no duplication. No DB change required.
  - Version bumped v5.6 → v5.7. NOTHING ELSE CHANGED from v5.6.
NEW IN v5.6:
  - FIX 1 (publish scheduling sign bug): fetch_todays_festivals() now computes
        days_diff = (today - fest_date).days   [was (fest_date - today).days]
    The festivals_master.publish_days values are stored as NEGATIVE offsets
    meaning "days BEFORE festival" (e.g. [-7,-5,-2]). The old formula produced
    a POSITIVE number for upcoming festivals, so the match `days_diff in
    publish_days` only fired AFTER a festival had already passed — generating
    videos for past festivals (e.g. Jyeshtha Purnima, Vat Savitri on 01 Jun).
    Flipping the subtraction order makes "2 days before" evaluate to -2 and
    correctly match the existing DB values. NO Supabase data change needed.
    _publish_day_index still maps correctly (days_diff is now negative on match,
    same sign as the stored publish_days entries).
  - FIX 2 (top festival name = boxes): the festival_name overlay in
    render_video() was drawn with the Hindi (Devanagari) font {fh_opt}, but
    festival_name is stored in Latin/English text → Devanagari font rendered
    Latin letters as boxes. Switched that single drawtext to the English
    font {fe_opt}. Now renders cleanly e.g. "Jyeshtha Purnima 2026".
  - FIX 3 (broken Hindi subtitle): removed the per-line hindi_lines subtitle
    overlay block entirely (FFmpeg drawtext does not shape Devanagari conjuncts
    / matras correctly → spelling corruption). TTS narration is unaffected
    (it comes from tts_script, not the subtitle).
  - Version bumped v5.5 → v5.6. NOTHING ELSE CHANGED from v5.5.
NEW IN v5.5:
  - render_video() upgraded: replaced simple alternating zoom with
    MOOD-MATCHED 8-effect FFmpeg library keyed to STORY_ARC roles:
      DeityReveal   → punch_in      (fast zoom, attention grab, hook feel)
      DeityOffering → slow_zoom_in  (gentle center zoom, divine meditative)
      Dos           → top_to_bottom (y-pan downward, divine flow, blessings)
      Donts         → zoom_out      (pull back reveal, dramatic warning)
      Blessing      → slow_drift    (slow zoom + x drift, warmth, grace)
    Any additional images beyond 5 → diagonal pan (energy, forward motion)
NEW IN v5.4:
  - publish_to_youtube_direct() → uploads MP4 straight from VM via YouTube Data API
  - Supabase Storage REMOVED (was failing with new sb_secret key format)
  - Vercel dependency REMOVED for YouTube
  - Everything self-contained on VM
NEW IN v5.3:
  - upload_to_drive() → uploads MP4 + caption kit TXT to Google Drive
  - FB/IG/Threads auto-publish REMOVED (manual via Instagram native sharing)
CEO: Rohiit Gupta | Chief Vedic Architect | trikalvaani.com
=====================================
"""

import os
import json
import time
import requests
import subprocess
import base64
import re
import wave
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv
load_dotenv("/home/vaanitrikal/trikal-vaani/content-engine/.env")

# ENV
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
WHATSAPP_TOKEN = os.environ.get("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_PHONE_ID = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "")
CONTENT_ENGINE_SECRET = os.environ.get("CONTENT_ENGINE_SECRET", "trikal-content-engine-2026")
VERCEL_APP_URL = os.environ.get("VERCEL_APP_URL", "https://trikalvaani.com")
ALERT_NUMBER = "919211804111"
SITE_URL = "https://trikalvaani.com"

# YOUTUBE CONFIG (direct upload from VM)
YOUTUBE_CLIENT_ID = "166374809393-eo1hthqcbh5s0g504ra5ijap9gr930lr.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET = "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"
YOUTUBE_REFRESH_TOKEN = os.environ.get("YOUTUBE_REFRESH_TOKEN", "")

# GOOGLE DRIVE CONFIG
DRIVE_CLIENT_ID = "166374809393-eo1hthqcbh5s0g504ra5ijap9gr930lr.apps.googleusercontent.com"
DRIVE_CLIENT_SECRET = "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"
DRIVE_REFRESH_TOKEN = os.environ.get("GOOGLE_DRIVE_REFRESH_TOKEN", "")
DRIVE_FOLDER_ID = "1CyfhLGXcLs4JITGOPbVU-h6-56jvExYx"

# PATHS
BASE_DIR = Path("/home/vaanitrikal/trikal-vaani/content-engine")
TEMP_DIR = BASE_DIR / "temp"
OUTPUT_DIR = BASE_DIR / "output"
ASSETS_DIR = BASE_DIR / "assets"
LOGO_PATH = ASSETS_DIR / "logo.png"
FONT_HINDI = ASSETS_DIR / "NotoSansDevanagari-Bold.ttf"
FONT_ENG = ASSETS_DIR / "NotoSans-Bold.ttf"

for d in [TEMP_DIR, OUTPUT_DIR, ASSETS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

IST = timezone(timedelta(hours=5, minutes=30))


def today_ist():
    return datetime.now(IST).strftime("%Y-%m-%d")


def log(msg):
    print(f"[{datetime.now(IST).strftime('%H:%M:%S')}] {msg}")


# STYLES
STYLES = {
    "Traditional": "traditional devotional Indian art style, warm temple atmosphere, marigold flowers, brass diyas, red and gold color palette, intricate mandala patterns, authentic Hindu iconography",
    "Cosmic": "cosmic mystical style, deep space backdrop, glowing celestial energy, planetary alignment, deity silhouette in galaxy, purple and gold ethereal lighting, sacred geometry",
    "Cinematic": "cinematic photorealistic style, golden hour natural lighting, real Indian sacred location, documentary photography quality, shallow depth of field"
}

STORY_ARC = [
    {"role": "DeityReveal",   "style_key": "Cosmic",      "deity_pct": 100, "items_pct": 0,
     "scene": "Solo dramatic full-body portrait of {deity_specific}, complete divine iconography, traditional weapons/symbols, traditional vahana if any, glowing aura, mysterious cinematic reveal, viewer captivated"},
    {"role": "DeityOffering", "style_key": "Traditional", "deity_pct": 30,  "items_pct": 70,
     "scene": "Small {deity_specific} idol in background, foreground filled with traditional offerings: {primary_offerings}, beautiful arrangement, glowing diyas, temple altar setting"},
    {"role": "Dos",           "style_key": "Traditional", "deity_pct": 0,   "items_pct": 100,
     "scene": "Close-up arrangement of items to offer on {festival_name}: {primary_offerings}, beautifully composed, no people, sacred altar, golden warm lighting, focus on offerings only"},
    {"role": "Donts",         "style_key": "Cinematic",   "deity_pct": 20,  "items_pct": 80,
     "scene": "Symbolic visual of what to AVOID on {festival_name}: {donts_visual}, moody darker lighting, slight warning atmosphere, sacred contrast"},
    {"role": "Blessing",      "style_key": "Cosmic",      "deity_pct": 100, "items_pct": 0,
     "scene": "{deity_specific} in full divine glory, blessing posture, divine light radiating outward, ethereal celestial blessing aura, peace and grace, soft golden rays, devotee blessed"}
]


def safe_text(t):
    t = str(t)
    for ch in ["'", '"', ":", "{", "}", "[", "]", "\\", "%", "$", "!", "?"]:
        t = t.replace(ch, "")
    return t.replace(",", " ").strip()


def extract_json(text):
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


# ============================================================
# GOOGLE DRIVE: GET ACCESS TOKEN
# ============================================================
def get_drive_access_token():
    try:
        resp = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": DRIVE_CLIENT_ID,
                "client_secret": DRIVE_CLIENT_SECRET,
                "refresh_token": DRIVE_REFRESH_TOKEN,
                "grant_type": "refresh_token"
            },
            timeout=30
        )
        data = resp.json()
        token = data.get("access_token")
        if token:
            log("Drive access token obtained")
            return token
        log(f"Drive token error: {data}")
        return None
    except Exception as e:
        log(f"Drive token exception: {e}")
        return None


# ============================================================
# GOOGLE DRIVE: BUILD CAPTION KIT TXT
# ============================================================
def build_caption_kit(script, festival):
    fest_name = festival["festival_name"]
    fest_date = festival.get("date", "")
    hashtags_trending = " ".join(["#" + h for h in script.get("hashtags", {}).get("trending", [])[:15]])
    hashtags_niche = " ".join(["#" + h for h in script.get("hashtags", {}).get("niche", [])[:10]])
    all_hashtags = f"{hashtags_trending} {hashtags_niche}"

    ig_caption = script.get("caption_variants", {}).get("instagram", script.get("seo_caption", ""))
    fb_caption = script.get("caption_variants", {}).get("facebook", script.get("seo_caption", ""))
    threads_caption = script.get("caption_variants", {}).get("threads", script.get("seo_caption", ""))
    wa_caption = script.get("whatsapp_broadcast", "")

    kit = f"""
=====================================
TRIKAL VAANI — CAPTION KIT
Festival: {fest_name}
Date: {fest_date}
Video: {script.get('video_title', '')}
Generated: {today_ist()}
=====================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 INSTAGRAM CAPTION
(Post video → Instagram auto-pushes to Facebook + Threads)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{ig_caption}

.
.
.
{all_hashtags}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📘 FACEBOOK CAPTION (if posting separately)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{fb_caption}

{hashtags_trending}

Free Kundali: https://trikalvaani.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧵 THREADS CAPTION (if posting separately)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{threads_caption}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 WHATSAPP BROADCAST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{wa_caption}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 AEO Q&A (for blog/website use)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
    for qa in script.get("aeo_qa", []):
        kit += f"Q: {qa.get('q', '')}\nA: {qa.get('a', '')}\n\n"

    kit += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 YOUTUBE DESCRIPTION (already auto-published)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{script.get('youtube_description', '')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 PINNED COMMENT (copy to YouTube)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{script.get('pinned_comment', '')}

=====================================
Jai Trikal Vaani 🙏
trikalvaani.com
=====================================
"""
    return kit


# ============================================================
# GOOGLE DRIVE: UPLOAD VIDEO + CAPTION KIT
# ============================================================
def upload_to_drive(video_path, caption_kit_text, slug, festival_name):
    log("Uploading to Google Drive...")
    video_drive_url = None
    kit_drive_url = None

    # ── v5.8 UPGRADE 3: VIDEO via RESUMABLE chunked upload (ported from
    #    pro_engine). Old single-POST multipart loaded the whole file into
    #    memory and silently failed/timed out on larger videos. Resumable
    #    (5MB chunks) handles any size reliably. ──
    if DRIVE_REFRESH_TOKEN and video_path and Path(video_path).exists():
        try:
            from googleapiclient.discovery import build
            from googleapiclient.http import MediaFileUpload
            from google.oauth2.credentials import Credentials
            creds = Credentials(
                token=None, refresh_token=DRIVE_REFRESH_TOKEN,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=DRIVE_CLIENT_ID, client_secret=DRIVE_CLIENT_SECRET
            )
            drive = build("drive", "v3", credentials=creds)
            metadata = {
                "name": f"{slug}.mp4",
                "parents": [DRIVE_FOLDER_ID],
                "description": f"Trikal Vaani - {festival_name} - {today_ist()}"
            }
            media = MediaFileUpload(str(video_path), mimetype="video/mp4",
                                    resumable=True, chunksize=5 * 1024 * 1024)
            req = drive.files().create(body=metadata, media_body=media, fields="id")
            resp = None
            while resp is None:
                status, resp = req.next_chunk()
            file_id = resp.get("id")
            if file_id:
                video_drive_url = f"https://drive.google.com/file/d/{file_id}/view"
                log(f"Video on Drive: {video_drive_url}")
            else:
                log("Drive video upload: no file id returned")
        except Exception as e:
            log(f"Drive video exception ({type(e).__name__}): {e}")
    else:
        log("Drive video skipped - no refresh token or file missing")

    # ── Caption Kit TXT via small multipart (tiny text, reliable) ──
    access_token = get_drive_access_token()
    if not access_token:
        log("Drive caption-kit skipped - no access token")
        return video_drive_url, kit_drive_url
    headers = {"Authorization": f"Bearer {access_token}"}

    # Upload Caption Kit TXT
    try:
        kit_bytes = caption_kit_text.encode('utf-8')
        kit_metadata = {
            "name": f"{slug}_CAPTIONS.txt",
            "parents": [DRIVE_FOLDER_ID],
            "description": f"Caption kit - {festival_name}"
        }
        boundary2 = "trikal_boundary_txt_2026"
        body2 = (
            f"--{boundary2}\r\n"
            f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
            f"{json.dumps(kit_metadata)}\r\n"
            f"--{boundary2}\r\n"
            f"Content-Type: text/plain; charset=utf-8\r\n\r\n"
        ).encode() + kit_bytes + f"\r\n--{boundary2}--".encode()

        resp2 = requests.post(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
            headers={**headers, "Content-Type": f"multipart/related; boundary={boundary2}"},
            data=body2,
            timeout=60
        )
        if resp2.status_code in [200, 201]:
            kit_id = resp2.json().get("id")
            kit_drive_url = f"https://drive.google.com/file/d/{kit_id}/view"
            log(f"Caption kit on Drive: {kit_drive_url}")
        else:
            log(f"Drive kit upload failed: {resp2.status_code} {resp2.text[:200]}")
    except Exception as e:
        log(f"Drive kit exception: {e}")

    return video_drive_url, kit_drive_url


# ============================================================
# STEP 0: FETCH TODAY'S FESTIVAL FROM SUPABASE
# ============================================================
def fetch_todays_festivals():
    if not SUPABASE_URL:
        log("SUPABASE_URL not set")
        return []

    today = datetime.now(IST).date()
    log(f"Checking publish schedule for {today}...")

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    try:
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/festivals_master?year=eq.{today.year}&auto_publish=eq.true&select=*",
            headers=headers, timeout=30
        )
        festivals = resp.json()
        log(f"Found {len(festivals)} auto-publish festivals in {today.year}")
    except Exception as e:
        log(f"Supabase fetch failed: {e}")
        return []

    matching = []
    for fest in festivals:
        fest_date = datetime.strptime(fest['date'], '%Y-%m-%d').date()
        # v5.6 FIX 1: publish_days are NEGATIVE "days before" offsets ([-7,-5,-2]).
        # Compute (today - fest_date) so a day 2 days BEFORE the festival = -2,
        # which correctly matches the stored negative offsets. The old
        # (fest_date - today) produced positives and only matched AFTER the
        # festival had passed -> generated videos for past festivals.
        days_diff = (today - fest_date).days
        publish_days = fest.get('publish_days', [-2])
        if days_diff in publish_days:
            fest['_days_left'] = days_diff
            fest['_publish_day_index'] = publish_days.index(days_diff) + 1
            fest['_total_publish_days'] = len(publish_days)
            matching.append(fest)
            log(f"  MATCH: {fest['festival_name']} (offset {days_diff}, video {fest['_publish_day_index']}/{fest['_total_publish_days']})")

    return matching


# ============================================================
# STEP 1: SCRIPT + 22 SEO/GEO/AEO FIELDS
# ============================================================
def generate_script(festival):
    log(f"Generating SEO+GEO+AEO package for {festival['festival_name']}...")

    # v5.7 FIX (null-safe + dynamic year): Postgres returns JSON null as None,
    # and dict.get(key, default) does NOT use the default when the key exists
    # with value None -> null DB columns leaked the literal "None" into prompts.
    # Every field that feeds a prompt is now coerced with `or` to a safe value.
    fest_name_full = festival.get('festival_name') or ''
    # Year derived DYNAMICALLY from the festival date (works 2026..2050+), never
    # hardcoded. Festival names often already embed the year, so we strip any
    # 4-digit 20xx from the name and re-attach the dynamic year in SEO fields ->
    # no "... 2026 2026" duplication and no wrong-year content in future years.
    fest_year = (festival.get('date') or '')[:4] or str(datetime.now(IST).year)
    fest_name_clean = re.sub(r'\b20\d{2}\b', '', fest_name_full).strip()

    deity = festival.get('deity') or ''
    maa_form = festival.get('maa_form') or ''
    offerings = festival.get('offerings') or []
    dos = festival.get('dos') or []
    donts = festival.get('donts') or []
    planet = festival.get('planet_ruler') or 'Sun'
    color = festival.get('color') or 'Gold'
    mantra = festival.get('mantra') or ''

    primary_offerings = ", ".join(offerings[:4]) if offerings else "flowers, sweets, water, incense"
    donts_visual = ", ".join(donts[:2]) if donts else "negative thoughts, anger"
    fest_slug = festival.get('festival_slug') or fest_name_full.lower().replace(' ', '-')

    # Guaranteed non-empty deity: maa_form -> deity -> cleaned festival name ->
    # generic. Prompts can never render "None".
    deity_specific = (maa_form or deity or fest_name_clean or "the presiding Hindu deity").strip()

    arc_prompts = []
    for stage in STORY_ARC:
        scene = stage["scene"].format(
            deity_specific=deity_specific,
            primary_offerings=primary_offerings,
            festival_name=fest_name_clean,
            donts_visual=donts_visual
        )
        style_desc = STYLES[stage["style_key"]]
        arc_prompts.append({"role": stage["role"], "scene": scene, "style": style_desc})

    prompt = f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com) - India's premium AI Vedic Astrology platform.

Generate a RESEARCH-GROUNDED, SEO + GEO + AEO optimized complete content package for upcoming festival.
Use Google Search to verify accurate deity iconography, traditional offerings, dos and donts.

FESTIVAL: {fest_name_clean} {fest_year}
DATE: {festival['date']} ({festival['_days_left']} days from today)
DEITY: {deity_specific}
PLANET: {planet}
COLOR: {color}
KNOWN OFFERINGS: {primary_offerings}
KNOWN DOS: {", ".join(dos[:3])}
KNOWN DONTS: {", ".join(donts[:3])}
VIDEO IN SERIES: {festival['_publish_day_index']} of {festival['_total_publish_days']}

Output ONLY raw JSON (no markdown fences, no preamble):

{{
  "video_title": "Hindi title max 6 Devanagari words SEO-optimized",
  "slug": "{fest_slug}-video-{festival['_publish_day_index']}-{festival['date']}",
  "hindi_lines": ["Hook 6 words Devanagari", "Line 2", "Line 3", "Line 4 closing"],
  "english_lines": ["Hook 7 words", "Line 2", "Line 3", "Line 4"],
  "tts_script": "STRICT 120 WORDS MAX Hindi narration. Hook about {fest_name_clean} significance. Connection to {planet}. ONE specific ritual. ONE thing to avoid. Blessing promise. Last sentence MUST be: Trikal Vaani par apni kundali dekhein aur apna bhavishya jaanein.",
  "meta_description": "155 char SEO meta with '{fest_name_clean} {fest_year}' front-loaded",
  "seo_caption": "150 word Hinglish caption with keyword in first 8 words. CTA: Free Kundali on TrikalVaani.com",
  "caption_variants": {{
    "instagram": "120 word IG caption, emoji-rich, line breaks, hashtag-friendly",
    "facebook": "180 word FB caption, storytelling, community-focused",
    "threads": "80 word Threads caption, conversational, question at end"
  }},
  "aeo_qa": [
    {{"q": "What is the significance of {fest_name_clean} in {fest_year}?", "a": "40-60 word direct answer mentioning {deity_specific}, {planet}, date {festival['date']}"}},
    {{"q": "What rituals to perform on {fest_name_clean}?", "a": "40-60 word answer with 3 specific rituals"}},
    {{"q": "What to offer to {deity_specific} on {fest_name_clean}?", "a": "40-60 word answer listing offerings"}},
    {{"q": "How does {fest_name_clean} affect my kundali?", "a": "40-60 word answer connecting {planet} impact. End: Check free kundali on trikalvaani.com"}}
  ],
  "geo_entities": {{
    "primary_deity": "{deity_specific}",
    "primary_planet": "{planet}",
    "auspicious_color": "{color}",
    "primary_offerings": {json.dumps(offerings[:5] if offerings else [])},
    "primary_mantra": "{mantra}",
    "remedy_gemstone": "gemstone for {planet}",
    "auspicious_direction": "best direction for puja"
  }},
  "voice_search_phrases": [
    "When is {fest_name_clean} in {fest_year}",
    "How to celebrate {fest_name_clean}",
    "What to offer on {fest_name_clean}",
    "{fest_name_clean} significance",
    "{fest_name_clean} kundali effect"
  ],
  "keyword_cluster": {{
    "primary": "{fest_name_clean} {fest_year}",
    "lsi": ["5 latent semantic keywords"],
    "long_tail": ["5 long-tail keywords"]
  }},
  "hashtags": {{
    "trending": ["15 trending hashtags without # symbol"],
    "niche": ["10 niche Vedic astrology hashtags without # symbol"]
  }},
  "youtube_description": "300 word YouTube description. First 150 chars must have primary keyword + CTA URL https://trikalvaani.com. Timestamps: 0:00 Intro, 0:15 Significance, 0:30 Rituals, 0:45 CTA.",
  "youtube_chapters": [
    {{"time": "0:00", "title": "Intro"}},
    {{"time": "0:15", "title": "{planet} planet connection"}},
    {{"time": "0:30", "title": "Sacred ritual"}},
    {{"time": "0:45", "title": "Free Kundali on TrikalVaani.com"}}
  ],
  "thumbnail_text": "2-4 word emotionally strong Hindi/English thumbnail text",
  "youtube_playlist": "Best playlist from: Horoscope {fest_year}, Saturn Transit, Rahu Ketu Predictions, Vimshottari Dasha, Astrology Remedies, Festival Predictions, Zodiac Predictions",
  "pinned_comment": "80 word Hinglish pinned comment. Hook about festival. Ask about zodiac. CTA: Free kundali on TrikalVaani.com",
  "spoken_keywords_first_30s": ["8 keywords for YouTube AI indexing"],
  "whatsapp_broadcast": "60 word WhatsApp Hinglish. Festival date {festival['date']}. One ritual tip. CTA: trikalvaani.com. 2 emojis max.",
  "schema_event": {{
    "@type": "Event",
    "name": "{fest_name_clean} {fest_year}",
    "startDate": "{festival['date']}",
    "description": "60 word event schema description"
  }},
  "cta_variants": [
    "Free Kundali Banaye - TrikalVaani.com",
    "Apna Bhavishya Jaanein Abhi - TrikalVaani.com",
    "Astrology Help Click - TrikalVaani.com"
  ],
  "image_prompts": [
    "Image 1 DEITY REVEAL: {arc_prompts[0]['scene']}. Style: {arc_prompts[0]['style']}. 9:16 portrait, no text, no watermark",
    "Image 2 DEITY + OFFERINGS: {arc_prompts[1]['scene']}. Style: {arc_prompts[1]['style']}. 9:16 portrait, no text",
    "Image 3 OFFERINGS CLOSE-UP: {arc_prompts[2]['scene']}. Style: {arc_prompts[2]['style']}. 9:16 portrait, no people, no text",
    "Image 4 SYMBOLIC DONTS: {arc_prompts[3]['scene']}. Style: {arc_prompts[3]['style']}. 9:16 portrait, no text",
    "Image 5 BLESSING: {arc_prompts[4]['scene']}. Style: {arc_prompts[4]['style']}. 9:16 portrait, no text"
  ]
}}"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "tools": [{"google_search": {}}],
        "generationConfig": {
            "maxOutputTokens": 10000,
            "temperature": 0.8,
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }
    try:
        resp = requests.post(url, json=payload, timeout=90)
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        result = extract_json(text)
        log("Script + 22-field package generated")
        return result
    except Exception as e:
        log(f"Script failed: {e}")
        return None


# ============================================================
# STEP 2: TTS
# ============================================================
def generate_tts(tts_script):
    log("Generating Hindi TTS via Gemini Charon...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": tts_script}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Charon"}}}
        }
    }
    try:
        resp = requests.post(url, json=payload, timeout=120)
        audio_b64 = resp.json()["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
        raw_pcm = base64.b64decode(audio_b64)
        audio_path = TEMP_DIR / f"tts_{int(time.time())}.wav"
        with wave.open(str(audio_path), 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(24000)
            wf.writeframes(raw_pcm)
        log(f"TTS saved: {audio_path.name}")
        return audio_path
    except Exception as e:
        log(f"TTS failed: {e}")
        return None


# ============================================================
# STEP 3: IMAGES
# ============================================================
def generate_image(prompt, idx):
    log(f"Generating image {idx+1}/5...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }
    try:
        resp = requests.post(url, json=payload, timeout=180)
        data = resp.json()
        if 'candidates' not in data:
            log(f"Image {idx+1} error: {data.get('error', 'unknown')}")
            return None
        for p in data['candidates'][0]['content']['parts']:
            if 'inlineData' in p:
                img_bytes = base64.b64decode(p['inlineData']['data'])
                img_path = TEMP_DIR / f"img_{idx}_{int(time.time())}.png"
                img_path.write_bytes(img_bytes)
                log(f"Image {idx+1} saved ({len(img_bytes)/1024:.0f} KB)")
                return img_path
        return None
    except Exception as e:
        log(f"Image {idx+1} failed: {e}")
        return None


def generate_all_images(prompts):
    images = []
    for i, prompt in enumerate(prompts[:5]):
        img = generate_image(prompt, i)
        if img:
            images.append(img)
        time.sleep(3)
    log(f"Generated {len(images)}/5 images")
    return images


# ============================================================
# STEP 4: VIDEO RENDER — v5.5 MOOD-MATCHED EFFECT LIBRARY
# ============================================================

# ── Effect library ──────────────────────────────────────────
# Each function returns a zoompan/vf filter string for FFmpeg.
# d_frames = total frames for this clip (img_dur * 25)
# All output: 1080x1920 (9:16 portrait), 25fps
# ────────────────────────────────────────────────────────────

def effect_punch_in(d_frames):
    """
    DeityReveal — Fast zoom in from 1.0 to 1.4, centered.
    Creates attention-grabbing hook feel, like a cinematic push.
    """
    return (
        f"zoompan="
        f"z='min(1.0+({d_frames}-on)*0.016/{d_frames},1.4)':"
        f"x='iw/2-(iw/zoom/2)':"
        f"y='ih/2-(ih/zoom/2)':"
        f"d={d_frames}:s=1080x1920:fps=25"
    )


def effect_slow_zoom_in(d_frames):
    """
    DeityOffering — Very gentle zoom in 1.0 → 1.18, centered.
    Divine meditative feel, calm and reverent.
    """
    return (
        f"zoompan="
        f"z='min(1.0+on*0.18/{d_frames},1.18)':"
        f"x='iw/2-(iw/zoom/2)':"
        f"y='ih/2-(ih/zoom/2)':"
        f"d={d_frames}:s=1080x1920:fps=25"
    )


def effect_top_to_bottom(d_frames):
    """
    Dos — Fixed 1.1 zoom, camera pans slowly top to bottom.
    Represents divine blessings flowing downward, sacred flow.
    """
    return (
        f"zoompan="
        f"z='1.1':"
        f"x='iw/2-(iw/zoom/2)':"
        f"y='on*(ih-(ih/zoom))/{d_frames}':"
        f"d={d_frames}:s=1080x1920:fps=25"
    )


def effect_zoom_out(d_frames):
    """
    Donts — Starts zoomed in at 1.35, pulls back to 1.0.
    Dramatic reveal feel, warning/consequence atmosphere.
    """
    return (
        f"zoompan="
        f"z='max(1.35-on*0.35/{d_frames},1.0)':"
        f"x='iw/2-(iw/zoom/2)':"
        f"y='ih/2-(ih/zoom/2)':"
        f"d={d_frames}:s=1080x1920:fps=25"
    )


def effect_slow_drift(d_frames):
    """
    Blessing — Slow zoom 1.0 → 1.12 + gentle horizontal drift left to right.
    Warmth, grace, peaceful conclusion feel.
    """
    return (
        f"zoompan="
        f"z='min(1.0+on*0.12/{d_frames},1.12)':"
        f"x='on*(iw/8)/{d_frames}':"
        f"y='ih/2-(ih/zoom/2)':"
        f"d={d_frames}:s=1080x1920:fps=25"
    )


def effect_diagonal(d_frames):
    """
    Extra images — Zoom 1.0 → 1.2 + diagonal pan (x and y both move).
    Energy, momentum, cinematic forward motion.
    """
    return (
        f"zoompan="
        f"z='min(1.0+on*0.2/{d_frames},1.2)':"
        f"x='on*(iw/6)/{d_frames}':"
        f"y='on*(ih/8)/{d_frames}':"
        f"d={d_frames}:s=1080x1920:fps=25"
    )


# ── Role → Effect mapping ────────────────────────────────────
# Keyed to STORY_ARC roles. Any image beyond the 5-arc roles
# gets diagonal (energy/forward motion) as safe default.
# ────────────────────────────────────────────────────────────
ROLE_TO_EFFECT = {
    "DeityReveal":   effect_punch_in,       # fast zoom → hook, attention grab
    "DeityOffering": effect_slow_zoom_in,   # gentle zoom → divine, meditative
    "Dos":           effect_top_to_bottom,  # y-pan down → blessings flowing
    "Donts":         effect_zoom_out,       # pull back → dramatic, warning
    "Blessing":      effect_slow_drift,     # slow drift → warmth, grace
}


def get_effect_for_index(idx):
    """Return the effect function for image at position idx."""
    if idx < len(STORY_ARC):
        role = STORY_ARC[idx]["role"]
        fn = ROLE_TO_EFFECT.get(role, effect_diagonal)
        log(f"  Image {idx+1} role={role} → {fn.__name__}")
        return fn
    log(f"  Image {idx+1} (extra) → effect_diagonal")
    return effect_diagonal


def render_video(images, audio_path, script, festival):
    log("Rendering video — v5.6 mood-matched effects...")

    slug = script.get('slug', f"{festival['festival_slug']}-{festival['date']}")
    output_path = OUTPUT_DIR / f"{slug}.mp4"

    # ── Get audio duration ───────────────────────────────────
    audio_dur = 48.0
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_format", str(audio_path)],
            capture_output=True, text=True, timeout=30
        )
        parsed = json.loads(result.stdout)
        if "format" in parsed and "duration" in parsed["format"]:
            audio_dur = float(parsed["format"]["duration"])
    except Exception as e:
        log(f"ffprobe fallback: {e}")

    if audio_dur <= 0 or audio_dur > 120:
        audio_dur = 48.0

    img_dur = max(audio_dur / len(images), 5.0)
    d_frames = max(int(img_dur * 25), 125)

    # ── Render each clip with mood-matched effect ────────────
    processed = []
    for i, img in enumerate(images):
        out = TEMP_DIR / f"clip_{i}.mp4"

        effect_fn = get_effect_for_index(i)
        zoompan_filter = effect_fn(d_frames)

        vf_chain = (
            f"scale=1080:1920:force_original_aspect_ratio=increase,"
            f"crop=1080:1920,"
            f"{zoompan_filter}"
        )

        res = subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(img),
            "-vf", vf_chain,
            "-t", str(img_dur),
            "-c:v", "libx264", "-preset", "fast",
            "-crf", "20", "-pix_fmt", "yuv420p", "-r", "25",
            str(out)
        ], capture_output=True, timeout=180)

        if out.exists() and out.stat().st_size > 1000:
            processed.append(out)
            log(f"  Clip {i+1}/{len(images)} OK → {effect_fn.__name__}")
        else:
            log(f"  Clip {i+1} FAILED: {res.stderr[-200:]}")

    if not processed:
        log("No clips processed")
        return None

    # ── Concatenate clips ────────────────────────────────────
    concat_file = TEMP_DIR / "concat.txt"
    concat_file.write_text("\n".join([f"file '{p}'" for p in processed]))
    concat_out = TEMP_DIR / "concat.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(concat_out)
    ], capture_output=True, timeout=120)

    # ── Overlay text + logo ──────────────────────────────────
    # v5.6 FIX 3: Hindi per-line subtitle overlay REMOVED. FFmpeg drawtext does
    # not shape Devanagari conjuncts/matras correctly, producing broken/misspelt
    # text. TTS narration is unaffected (comes from tts_script). Only the
    # English-rendered brand line, festival name, and credit line remain.
    fest_name = safe_text(festival["festival_name"])
    fh = str(FONT_HINDI) if FONT_HINDI.exists() else ""
    fe = str(FONT_ENG) if FONT_ENG.exists() else ""
    fh_opt = f":fontfile='{fh}'" if fh else ""
    fe_opt = f":fontfile='{fe}'" if fe else ""

    filters = []
    filters.append(
        f"drawtext=text='TrikalVaani.com':fontsize=42:fontcolor=gold:box=0"
        f":x=(w-text_w)/2:y=80:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}"
    )
    # v5.6 FIX 2: festival_name is Latin/English text → render with the ENGLISH
    # font (fe_opt). Previously used the Devanagari font (fh_opt), which rendered
    # Latin letters as empty boxes.
    filters.append(
        f"drawtext=text='{fest_name}':fontsize=58:fontcolor=white:box=0"
        f":x=(w-text_w)/2:y=160:shadowcolor=black:shadowx=3:shadowy=3{fe_opt}"
    )

    filters.append(
        f"drawtext=text='Rohiit Gupta - Chief Vedic Architect':fontsize=28"
        f":fontcolor=gold:box=0:x=(w-text_w)/2:y=h-60"
        f":shadowcolor=black:shadowx=2:shadowy=2{fe_opt}"
    )
    vf = ",".join(filters)

    if LOGO_PATH.exists():
        fc = (
            f"[0:v]{vf}[txt];"
            f"[1:v]scale=140:140[logo_tr];"
            f"[1:v]scale=200:200,format=rgba,colorchannelmixer=aa=0.4[logo_wm];"
            f"[txt][logo_tr]overlay=W-w-30:30[v1];"
            f"[v1][logo_wm]overlay=(W-w)/2:(H-h)/2[out]"
        )
        cmd = [
            "ffmpeg", "-y",
            "-i", str(concat_out), "-i", str(LOGO_PATH), "-i", str(audio_path),
            "-filter_complex", fc,
            "-map", "[out]", "-map", "2:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-c:a", "aac", "-b:a", "128k",
            "-t", str(audio_dur),
            "-movflags", "+faststart", "-pix_fmt", "yuv420p",
            str(output_path)
        ]
    else:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(concat_out), "-i", str(audio_path),
            "-vf", vf,
            "-map", "0:v", "-map", "1:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-c:a", "aac", "-b:a", "128k",
            "-t", str(audio_dur),
            "-movflags", "+faststart", "-pix_fmt", "yuv420p",
            str(output_path)
        ]

    res = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if output_path.exists() and output_path.stat().st_size > 10000:
        log(f"Video ready: {output_path.name} ({output_path.stat().st_size/1024/1024:.1f} MB)")
        return output_path
    log(f"FFmpeg error: {res.stderr[-500:]}")
    return None


# ============================================================
# STEP 5: UPLOAD TO SUPABASE STORAGE
# ============================================================
def upload_to_supabase(video_path, json_path, slug):
    if not video_path or not SUPABASE_URL:
        return None, None

    log("Uploading to Supabase Storage...")
    video_url = None
    json_url = None

    try:
        with open(video_path, 'rb') as f:
            video_bytes = f.read()
        resp = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/trikal-videos/{slug}.mp4",
            headers={
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "video/mp4",
                "x-upsert": "true"
            },
            data=video_bytes,
            timeout=120
        )
        if resp.status_code in [200, 201]:
            video_url = f"{SUPABASE_URL}/storage/v1/object/public/trikal-videos/{slug}.mp4"
            log(f"Video uploaded to Supabase: {video_url}")
        else:
            log(f"Supabase upload failed: {resp.status_code}")
    except Exception as e:
        log(f"Supabase upload exception: {e}")

    if json_path and json_path.exists():
        try:
            with open(json_path, 'rb') as f:
                json_bytes = f.read()
            resp = requests.post(
                f"{SUPABASE_URL}/storage/v1/object/trikal-videos/{slug}.json",
                headers={
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "x-upsert": "true"
                },
                data=json_bytes,
                timeout=60
            )
            if resp.status_code in [200, 201]:
                json_url = f"{SUPABASE_URL}/storage/v1/object/public/trikal-videos/{slug}.json"
        except Exception as e:
            log(f"JSON upload exception: {e}")

    return video_url, json_url


# ============================================================
# STEP 6: PUBLISH TO YOUTUBE DIRECT FROM VM (v5.4)
# ============================================================
def publish_to_youtube_direct(script, video_path, festival):
    """Upload video DIRECTLY from VM to YouTube. No Vercel, no Supabase."""
    log("Publishing to YouTube DIRECT from VM (Flow 1)...")

    if not video_path or not Path(video_path).exists():
        log("No local video file - skipping YouTube")
        return None

    if not YOUTUBE_REFRESH_TOKEN:
        log("YOUTUBE_REFRESH_TOKEN not set - skipping YouTube")
        return None

    try:
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaFileUpload
        from google.oauth2.credentials import Credentials

        creds = Credentials(
            token=None,
            refresh_token=YOUTUBE_REFRESH_TOKEN,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=YOUTUBE_CLIENT_ID,
            client_secret=YOUTUBE_CLIENT_SECRET
        )

        youtube = build("youtube", "v3", credentials=creds)

        # ── v5.8 UPGRADE 2: YT TAG SANITIZER (ported from pro_engine) ──
        # YT rules: <=30 chars/tag (use 28), <=500 total (cap 480), no < > "
        # chars, dedupe case-insensitive, cap 25. Pull hashtags + keyword_cluster.
        kc = script.get("keyword_cluster", {}) or {}
        raw_tags = (script.get("hashtags", {}).get("trending", []) +
                    script.get("hashtags", {}).get("niche", []) +
                    (kc.get("lsi", []) or []) +
                    (kc.get("long_tail", []) or []))
        seen = set(); tags = []; total_len = 0
        for t in raw_tags:
            if not isinstance(t, str):
                continue
            cleaned = t.strip().replace("<", "").replace(">", "").replace('"', "").replace(",", " ")
            cleaned = " ".join(cleaned.split())
            if not cleaned:
                continue
            if len(cleaned) > 28:
                cleaned = cleaned[:28].rstrip()
            tl = cleaned.lower()
            if tl in seen:
                continue
            if total_len + len(cleaned) + 2 > 480:
                break
            seen.add(tl)
            tags.append(cleaned)
            total_len += len(cleaned) + 2
        tags = tags[:25]
        log(f"  YT tags: {len(tags)} clean tags ({total_len} chars)")

        title = script.get("video_title", festival["festival_name"])[:100]

        # ── v5.8 UPGRADE 1: RICH YT DESCRIPTION (ported from pro_engine) ──
        # link first line -> Gemini desc -> GEO answer -> FAQ -> EEAT -> keywords
        SITE = "https://www.trikalvaani.com"
        raw_desc = (script.get("youtube_description", "") or "").strip()
        aeo = script.get("aeo_qa", []) or []

        # GEO direct-answer = first aeo_qa answer (AI-search citation bait)
        geo = ""
        if aeo and isinstance(aeo[0], dict):
            geo = (aeo[0].get("a", "") or "").strip()
        geo_block = f"\n\n{geo}" if geo else ""

        # AEO FAQ block (answer-engine extractable Q&A)
        faq_block = ""
        if aeo:
            flines = ["", "", "FAQ:"]
            for item in aeo[:4]:
                if isinstance(item, dict):
                    q = (item.get("q", "") or "").strip()
                    a = (item.get("a", "") or "").strip()
                    if q and a:
                        flines.append(f"Q: {q}")
                        flines.append(f"A: {a}")
            faq_block = "\n".join(flines)

        # EEAT authority block
        eeat_block = (
            "\n\nAbout: Rohiit Gupta, Chief Vedic Architect | "
            "15+ years Vedic astrology & Jyotish Shastra | "
            "Source: Brihat Parashara Hora Shastra (BPHS)."
        )

        # SEO keyword tail line
        kw = []
        if kc.get("primary"):
            kw.append(kc["primary"])
        kw += (kc.get("lsi", []) or []) + (kc.get("long_tail", []) or [])
        kw_block = ("\n\n" + ", ".join([k for k in kw if isinstance(k, str)][:15])) if kw else ""

        description = (
            f"{SITE}\n\n"
            f"{raw_desc}"
            f"{geo_block}"
            f"{faq_block}"
            f"{eeat_block}\n\n"
            f"Apni FREE Kundli yahan dekhein:\n{SITE}"
            f"{kw_block}\n\n"
            f"#TrikaalVaani #VedicAstrology #FreeKundli"
        )[:4900]

        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags,
                "categoryId": "22"
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False
            }
        }

        media = MediaFileUpload(
            str(video_path), chunksize=-1, resumable=True, mimetype="video/mp4"
        )
        request = youtube.videos().insert(
            part="snippet,status", body=body, media_body=media
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                log(f"  YouTube upload {int(status.progress() * 100)}%")

        video_id = response["id"]
        youtube_url = f"https://www.youtube.com/shorts/{video_id}"
        log(f"YouTube LIVE: {youtube_url}")

        # ── v5.8 UPGRADE 4: PINNED COMMENT + FAQ (AEO — answer engines
        #    extract pinned-comment Q&A for featured answers) ──
        pinned = script.get("pinned_comment", "") or ""
        if aeo:
            pin_lines = ["", "—— Aksar Pooche Jaane Wale Sawaal ——"]
            for item in aeo[:4]:
                if isinstance(item, dict) and item.get("q") and item.get("a"):
                    pin_lines.append(f"Q: {item.get('q','')}")
                    pin_lines.append(f"A: {item.get('a','')}")
            pin_lines.append("")
            pin_lines.append("Apni kundali dekhein: trikalvaani.com")
            pinned = (pinned + "\n".join(pin_lines)).strip()
        if pinned:
            try:
                youtube.commentThreads().insert(
                    part="snippet",
                    body={
                        "snippet": {
                            "videoId": video_id,
                            "topLevelComment": {
                                "snippet": {"textOriginal": pinned[:9000]}
                            }
                        }
                    }
                ).execute()
                log("  Pinned comment posted (with FAQ)")
            except Exception as e:
                log(f"  Pinned comment skipped: {e}")

        return youtube_url

    except Exception as e:
        log(f"YouTube direct upload exception: {e}")
        return None


# ============================================================
# STEP 7: SAVE SIDECAR JSON
# ============================================================
def save_seo_package(script, video_path, festival):
    if not video_path:
        return None
    json_path = video_path.with_suffix('.json')
    package = {
        "festival": festival["festival_name"],
        "date": festival.get("date"),
        "publish_date": today_ist(),
        "video_in_series": f"{festival['_publish_day_index']}/{festival['_total_publish_days']}",
        "slug": script.get("slug", ""),
        "video_title": script.get("video_title", ""),
        "meta_description": script.get("meta_description", ""),
        "tts_script": script.get("tts_script", ""),
        "caption_variants": script.get("caption_variants", {}),
        "aeo_qa": script.get("aeo_qa", []),
        "geo_entities": script.get("geo_entities", {}),
        "keyword_cluster": script.get("keyword_cluster", {}),
        "hashtags": script.get("hashtags", {}),
        "youtube_description": script.get("youtube_description", ""),
        "youtube_chapters": script.get("youtube_chapters", []),
        "thumbnail_text": script.get("thumbnail_text", ""),
        "pinned_comment": script.get("pinned_comment", ""),
        "whatsapp_broadcast": script.get("whatsapp_broadcast", ""),
        "schema_event": script.get("schema_event", {}),
        "platforms_published": ["youtube"],
        "platforms_manual": ["instagram", "facebook", "threads", "whatsapp"]
    }
    json_path.write_text(
        json.dumps(package, ensure_ascii=False, indent=2), encoding='utf-8'
    )
    log(f"SEO sidecar saved: {json_path.name}")
    return json_path


# ============================================================
# SUPABASE LOG + WHATSAPP ALERT
# ============================================================
def log_supabase(script, video_path, video_url, festival, success, error=None):
    if not SUPABASE_URL:
        return
    try:
        requests.post(
            f"{SUPABASE_URL}/rest/v1/content_generation_log",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "date": today_ist(),
                "tithi": festival["festival_name"],
                "video_title": script.get("video_title", "") if script else "",
                "status": "success" if success else "failed"
            },
            timeout=10
        )
    except Exception as e:
        log(f"Supabase log skipped: {e}")


def send_whatsapp_alert(message):
    if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_ID:
        return
    try:
        resp = requests.post(
            f"https://graph.facebook.com/v20.0/{WHATSAPP_PHONE_ID}/messages",
            json={
                "messaging_product": "whatsapp",
                "to": ALERT_NUMBER,
                "type": "text",
                "text": {"body": message}
            },
            headers={
                "Authorization": f"Bearer {WHATSAPP_TOKEN}",
                "Content-Type": "application/json"
            },
            timeout=30
        )
        log(f"WhatsApp alert: {resp.status_code}")
    except Exception as e:
        log(f"WhatsApp alert exception: {e}")


def cleanup():
    patterns = ["clip_*.mp4", "concat*", "*.txt", "img_*.png", "tts_*.wav"]
    for pat in patterns:
        for f in TEMP_DIR.glob(pat):
            f.unlink(missing_ok=True)


# ============================================================
# PROCESS ONE FESTIVAL
# ============================================================
def process_festival(festival, max_retries=3):
    for attempt in range(1, max_retries + 1):
        log("=" * 55)
        log(f"ATTEMPT {attempt}/{max_retries} — {festival['festival_name']}")
        log("=" * 55)

        try:
            script = generate_script(festival)
            if not script:
                raise Exception("Script generation failed")

            audio = generate_tts(script.get("tts_script", ""))
            if not audio:
                raise Exception("TTS failed")

            images = generate_all_images(script.get("image_prompts", []))
            if len(images) < 3:
                raise Exception(f"Only {len(images)} images")

            video = render_video(images, audio, script, festival)
            if not video:
                raise Exception("Video render failed")

            json_path = save_seo_package(script, video, festival)
            log_supabase(script, video, None, festival, True)

            # FLOW 1: YouTube DIRECT upload from VM
            yt_url = publish_to_youtube_direct(script, video, festival)

            # FLOW 2: Google Drive Caption Kit
            caption_kit = build_caption_kit(script, festival)
            drive_video_url, drive_kit_url = upload_to_drive(
                video, caption_kit,
                script.get("slug", "video"),
                festival["festival_name"]
            )

            alert = (
                f"✅ TRIKAL VAANI VIDEO READY\n\n"
                f"Festival: {festival['festival_name']}\n"
                f"YouTube: {yt_url or 'FAILED'}\n\n"
                f"📁 Google Drive:\n"
                f"Video: {drive_video_url or 'FAILED'}\n"
                f"Captions: {drive_kit_url or 'FAILED'}\n\n"
                f"📸 Post to Instagram now → auto-pushes to FB + Threads\n"
                f"trikalvaani.com"
            )
            send_whatsapp_alert(alert)
            cleanup()

            log(f"SUCCESS: {festival['festival_name']}")
            log(f"YouTube: {yt_url}")
            log(f"Drive Video: {drive_video_url}")
            log(f"Drive Captions: {drive_kit_url}")
            return True

        except Exception as e:
            log(f"ATTEMPT {attempt} FAILED: {e}")
            cleanup()
            if attempt < max_retries:
                log("Retrying in 60 seconds...")
                time.sleep(60)
            else:
                send_whatsapp_alert(
                    f"❌ CONTENT ENGINE FAILED\n"
                    f"Festival: {festival['festival_name']}\n"
                    f"Error: {str(e)[:200]}"
                )
                log_supabase(None, None, None, festival, False, str(e))
                return False
    return False


# ============================================================
# MAIN
# ============================================================
def main():
    log("=" * 55)
    log("TRIKAL VAANI CONTENT ENGINE v5.8")
    log("Flow 1: YouTube DIRECT (VM) | Flow 2: Drive Caption Kit")
    log("Render: 5-effect mood-matched FFmpeg library")
    log("=" * 55)

    if len(sys.argv) > 1 and sys.argv[1] == "--festival":
        slug = sys.argv[2] if len(sys.argv) > 2 else None
        log(f"Manual mode: {slug}")
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
        resp = requests.get(
            f"{SUPABASE_URL}/rest/v1/festivals_master?festival_slug=eq.{slug}&select=*",
            headers=headers, timeout=30
        )
        fests = resp.json()
        if not fests:
            log(f"Festival not found: {slug}")
            return
        festival = fests[0]
        festival['_days_left'] = 0
        festival['_publish_day_index'] = 1
        festival['_total_publish_days'] = 1
        process_festival(festival)
        return

    festivals_today = fetch_todays_festivals()
    if not festivals_today:
        log("No festivals today. Exiting.")
        return

    for fest in festivals_today:
        process_festival(fest)


if __name__ == "__main__":
    main()
