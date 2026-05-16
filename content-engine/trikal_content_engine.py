#!/usr/bin/env python3
"""
TRIKAL VAANI - Content Engine v5.0
=====================================
RESEARCH-GROUNDED + SEO + GEO + AEO + SMART CRON
=====================================
KEY CHANGES FROM v4.1:
  1. Reads festival from Supabase festivals_master (not hardcoded)
  2. Gemini Flash + Google Search grounding for accurate deity/offerings research
  3. New 5-image flow: Deity 100% / Deity+Offerings 30-70 / Items 100% / Symbolic / Blessing 100%
  4. NO rectangle box, NO "X Din Baad" countdown
  5. Specific iconography prompts (e.g. "Shani Dev: dark blue-black skin, holding trident")
  6. 17-field SEO/GEO/AEO package (added 7 new fields)
  7. Auto-upload to Supabase Storage (trikal-videos bucket)
  8. 3-retry logic with WhatsApp alert on final failure
  9. SEO-optimized filename slug
=====================================
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

# ENV
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
WHATSAPP_TOKEN = os.environ.get("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_PHONE_ID = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "")
ALERT_NUMBER = "919211804111"
SITE_URL = "https://trikalvaani.com"

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

# NEW 5-IMAGE FLOW
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


# HELPERS
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
        days_diff = (fest_date - today).days
        publish_days = fest.get('publish_days', [-2])
        if days_diff in publish_days:
            fest['_days_left'] = days_diff
            fest['_publish_day_index'] = publish_days.index(days_diff) + 1
            fest['_total_publish_days'] = len(publish_days)
            matching.append(fest)
            log(f"  MATCH: {fest['festival_name']} (in {days_diff} days, video {fest['_publish_day_index']}/{fest['_total_publish_days']})")

    return matching


# ============================================================
# STEP 1: RESEARCH-GROUNDED SCRIPT + 17-FIELD SEO PACKAGE
# ============================================================
def generate_script(festival):
    log(f"Generating research-grounded SEO+GEO+AEO package for {festival['festival_name']}...")

    deity = festival.get('deity', 'Devta')
    offerings = festival.get('offerings', []) or []
    dos = festival.get('dos', []) or []
    donts = festival.get('donts', []) or []
    primary_offerings = ", ".join(offerings[:4]) if offerings else "flowers, sweets, water"
    donts_visual = ", ".join(donts[:2]) if donts else "negative thoughts, anger"
    fest_slug = festival.get('festival_slug', festival['festival_name'].lower().replace(' ', '-'))
    planet = festival.get('planet_ruler', 'Sun')
    maa_form = festival.get('maa_form', '')
    color = festival.get('color', 'Gold')
    deity_specific = maa_form if maa_form else deity

    arc_prompts = []
    for stage in STORY_ARC:
        scene = stage["scene"].format(
            deity_specific=deity_specific,
            primary_offerings=primary_offerings,
            festival_name=festival['festival_name'],
            donts_visual=donts_visual
        )
        style_desc = STYLES[stage["style_key"]]
        arc_prompts.append({"role": stage["role"], "scene": scene, "style": style_desc})

    prompt = f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com) - India's premium AI Vedic Astrology platform.

Generate a RESEARCH-GROUNDED, SEO + GEO + AEO optimized complete content package for upcoming festival.
You have access to Google Search - USE IT to verify accurate deity iconography, traditional offerings, dos and donts.

FESTIVAL: {festival['festival_name']}
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
  "video_title": "Hindi title max 6 Devanagari words SEO-optimized for {festival['festival_name']}",
  "slug": "{fest_slug}-video-{festival['_publish_day_index']}-{festival['date']}",
  "hindi_lines": ["Hook 6 words Devanagari", "Line 2 max 6 words", "Line 3 max 6 words", "Line 4 closing max 6 words"],
  "english_lines": ["Hook 7 words English", "Line 2 max 7 words", "Line 3 max 7 words", "Line 4 max 7 words"],
  "tts_script": "STRICT 120 WORDS MAX Hindi narration (spoken in 45-50 seconds). Warm authoritative voice. Structure: 1) Hook about {festival['festival_name']} significance 2) Connection to {planet} planet 3) ONE specific ritual from offerings list 4) ONE thing to avoid 5) Blessing promise. Last sentence MUST be exactly: Trikal Vaani par apni kundali dekhein aur apna bhavishya jaanein. COUNT WORDS - must be under 120.",
  "meta_description": "155 character SEO meta description with primary keyword '{festival['festival_name']} 2026' front-loaded. Include date, key benefit, CTA.",
  "seo_caption": "150 word Instagram/Facebook caption in Hinglish. Primary keyword '{festival['festival_name']} 2026' in first 8 words. Include semantic keywords: {planet}, {deity_specific}, kundali, Vedic astrology, remedies. Strong hook, value-packed middle, CTA: 'Free Kundali on TrikalVaani.com'. 5 line breaks. End with 5 emojis.",
  "caption_variants": {{
    "instagram": "120 word IG-optimized caption, emoji-rich, line breaks for readability, hashtag-friendly",
    "facebook": "180 word FB-optimized caption, longer storytelling, less emojis, community-focused",
    "threads": "80 word Threads-optimized punchy caption, conversational tone, question at end for engagement"
  }},
  "aeo_qa": [
    {{"q": "What is the significance of {festival['festival_name']} in 2026?", "a": "40-60 word direct answer optimized for Google SGE, Perplexity, SearchGPT. Mention {deity_specific}, {planet}, date {festival['date']}, primary benefit."}},
    {{"q": "What rituals to perform on {festival['festival_name']}?", "a": "40-60 word answer listing 3 specific rituals from: {", ".join(dos[:3])}"}},
    {{"q": "What to offer to {deity_specific} on {festival['festival_name']}?", "a": "40-60 word answer listing offerings: {primary_offerings}"}},
    {{"q": "How does {festival['festival_name']} affect my kundali?", "a": "40-60 word answer connecting {planet} planet impact. End with CTA: Check your free kundali on trikalvaani.com"}}
  ],
  "geo_entities": {{
    "primary_deity": "{deity_specific}",
    "primary_planet": "{planet}",
    "auspicious_color": "{color}",
    "primary_offerings": {json.dumps(offerings[:5] if offerings else [])},
    "primary_mantra": "{festival.get('mantra', '')}",
    "dosha_relief": "{festival.get('dosha_relief', '')}",
    "related_planets": ["list 2 connected planets to {planet}"],
    "related_yogas": ["list 2 Vedic yogas relevant"],
    "remedy_gemstone": "one gemstone for {planet}",
    "auspicious_direction": "best direction for puja"
  }},
  "voice_search_phrases": [
    "When is {festival['festival_name']} in 2026",
    "How to celebrate {festival['festival_name']}",
    "What to offer on {festival['festival_name']}",
    "{festival['festival_name']} significance",
    "{festival['festival_name']} kundali effect"
  ],
  "keyword_cluster": {{
    "primary": "{festival['festival_name']} 2026",
    "lsi": ["list 5 latent semantic indexing keywords"],
    "long_tail": ["list 5 long-tail SEO keywords starting with how/what/why/when"]
  }},
  "hashtags": {{
    "trending": ["15 trending Hindi+English hashtags without # symbol"],
    "niche": ["10 niche Vedic astrology hashtags without # symbol"]
  }},
  "youtube_description": "300 word YouTube Shorts description. First 150 chars MUST contain primary keyword and CTA URL https://trikalvaani.com. Include: festival significance, {planet} connection, 3 rituals, 1 remedy, kundali CTA. Timestamps 0:00 Intro, 0:15 Significance, 0:30 Rituals, 0:45 CTA. End with 5 hashtags new lines.",
  "whatsapp_broadcast": "60 word punchy WhatsApp Hinglish. Hook line 1. Mention {festival['festival_name']} date {festival['date']}. One ritual tip from offerings. CTA: 'Free kundali check - trikalvaani.com'. 2 emojis max.",
  "schema_event": {{
    "@type": "Event",
    "name": "{festival['festival_name']} 2026",
    "startDate": "{festival['date']}",
    "description": "60 word event schema description with deity and planet"
  }},
  "cta_variants": [
    "Free Kundali Banaye - TrikalVaani.com",
    "Apna Bhavishya Jaanein Abhi - TrikalVaani.com",
    "Astrology Help Click - TrikalVaani.com"
  ],
  "image_prompts": [
    "Image 1 DEITY REVEAL (100% deity focus): {arc_prompts[0]['scene']}. Style: {arc_prompts[0]['style']}. CRITICAL: Use authentic Hindu iconography for {deity_specific} - correct skin color, weapons, vahana, clothing. 9:16 portrait, photorealistic, cinematic, no text, no watermark, no captions",
    "Image 2 DEITY + OFFERINGS (30% deity, 70% items): {arc_prompts[1]['scene']}. Style: {arc_prompts[1]['style']}. 9:16 portrait, photorealistic, no text, no watermark",
    "Image 3 OFFERINGS CLOSE-UP (100% items): {arc_prompts[2]['scene']}. Style: {arc_prompts[2]['style']}. 9:16 portrait, macro photography style, no people, no text, no watermark",
    "Image 4 SYMBOLIC DONTS (80% symbolic): {arc_prompts[3]['scene']}. Style: {arc_prompts[3]['style']}. 9:16 portrait, atmospheric, no text, no watermark",
    "Image 5 BLESSING (100% deity blessing): {arc_prompts[4]['scene']}. Style: {arc_prompts[4]['style']}. 9:16 portrait, divine glow, photorealistic, no text, no watermark"
  ]
}}

CRITICAL RULES:
- Use Google Search to verify {deity_specific} iconography is ACCURATE (skin color, weapons, vahana, clothing)
- Image prompts must be HIGHLY SPECIFIC - not generic temple statues
- Hindi text in pure Devanagari script only
- TTS script MUST be under 120 words
- All AEO answers 40-60 words exactly
- No filler - every word drives engagement or rankings"""

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
        log(f"Script raw preview: {repr(text[:200])}")
        result = extract_json(text)
        log("Script + 17-field SEO/GEO/AEO package generated (Google grounded)")
        return result
    except Exception as e:
        log(f"Script failed: {e}")
        return None


# ============================================================
# STEP 2: TTS AUDIO (WAV)
# ============================================================
def generate_tts(tts_script):
    log("Generating Hindi TTS via Gemini Charon...")
    word_count = len(tts_script.split())
    log(f"TTS script word count: {word_count}")
    if word_count > 130:
        log(f"WARNING: Script has {word_count} words (target <120).")

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
        log(f"TTS saved: {audio_path.name} ({audio_path.stat().st_size/1024:.0f} KB)")
        return audio_path
    except Exception as e:
        log(f"TTS failed: {e}")
        return None


# ============================================================
# STEP 3: IMAGES via NANO BANANA 2
# ============================================================
def generate_image(prompt, idx):
    log(f"Generating image {idx+1}/5 via Nano Banana 2...")
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
# STEP 4: VIDEO RENDER (clean — no box, no countdown)
# ============================================================
def render_video(images, audio_path, script, festival):
    log("Rendering video with Ken Burns + dual logo...")

    slug = script.get('slug', f"{festival['festival_slug']}-{festival['date']}")
    output_path = OUTPUT_DIR / f"{slug}.mp4"

    audio_dur = 48.0
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(audio_path)],
            capture_output=True, text=True, timeout=30
        )
        parsed = json.loads(result.stdout)
        if "format" in parsed and "duration" in parsed["format"]:
            audio_dur = float(parsed["format"]["duration"])
    except Exception as e:
        log(f"ffprobe fallback: {e}")

    if audio_dur <= 0 or audio_dur > 120:
        audio_dur = 48.0

    log(f"Audio: {audio_dur:.1f}s | Images: {len(images)} | Per image: {audio_dur/len(images):.1f}s")
    img_dur = max(audio_dur / len(images), 5.0)

    processed = []
    for i, img in enumerate(images):
        out = TEMP_DIR / f"kb_{i}.mp4"
        d_frames = max(int(img_dur * 25), 125)
        if i % 2 == 0:
            zoom = f"zoompan=z='min(zoom+0.0012,1.25)':d={d_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25"
        else:
            zoom = f"zoompan=z='if(lte(zoom,1.0),1.25,max(1.001,zoom-0.0012))':d={d_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25"

        subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(img),
            "-vf", f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,{zoom}",
            "-t", str(img_dur), "-c:v", "libx264", "-preset", "fast",
            "-crf", "20", "-pix_fmt", "yuv420p", "-r", "25", str(out)
        ], capture_output=True, timeout=180)
        if out.exists() and out.stat().st_size > 1000:
            processed.append(out)
            log(f"  Ken Burns clip {i+1}/{len(images)} OK")

    if not processed:
        log("No clips processed")
        return None

    concat_file = TEMP_DIR / "concat.txt"
    concat_file.write_text("\n".join([f"file '{p}'" for p in processed]))
    concat_out = TEMP_DIR / "concat.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(concat_out)
    ], capture_output=True, timeout=120)

    hindi = [safe_text(l) for l in script.get("hindi_lines", [])]
    fest_name = safe_text(festival["festival_name"])

    fh = str(FONT_HINDI) if FONT_HINDI.exists() else ""
    fe = str(FONT_ENG) if FONT_ENG.exists() else ""
    fh_opt = f":fontfile='{fh}'" if fh else ""
    fe_opt = f":fontfile='{fe}'" if fe else ""

    filters = []
    filters.append(f"drawtext=text='TrikalVaani.com':fontsize=42:fontcolor=gold:box=0:x=(w-text_w)/2:y=80:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}")
    filters.append(f"drawtext=text='{fest_name}':fontsize=58:fontcolor=white:box=0:x=(w-text_w)/2:y=160:shadowcolor=black:shadowx=3:shadowy=3{fh_opt}")

    line_time = audio_dur / max(len(hindi) + 1, 1)
    for i, line in enumerate(hindi):
        y_pos = 1550 + (i * 75)
        start_t = i * line_time
        filters.append(f"drawtext=text='{line}':fontsize=48:fontcolor=white:box=0:x=(w-text_w)/2:y={y_pos}:enable='gte(t,{start_t:.1f})':shadowcolor=black:shadowx=2:shadowy=2{fh_opt}")

    filters.append(f"drawtext=text='Rohiit Gupta - Chief Vedic Architect':fontsize=28:fontcolor=gold:box=0:x=(w-text_w)/2:y=h-60:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}")

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
            "ffmpeg", "-y", "-i", str(concat_out), "-i", str(LOGO_PATH), "-i", str(audio_path),
            "-filter_complex", fc, "-map", "[out]", "-map", "2:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
            "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)
        ]
    else:
        cmd = [
            "ffmpeg", "-y", "-i", str(concat_out), "-i", str(audio_path),
            "-vf", vf, "-map", "0:v", "-map", "1:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
            "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)
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

    log("Uploading to Supabase Storage (trikal-videos bucket)...")
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
            log(f"Video uploaded: {video_url}")
        else:
            log(f"Video upload failed: {resp.status_code} {resp.text[:200]}")
    except Exception as e:
        log(f"Video upload exception: {e}")

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
                log(f"JSON uploaded: {json_url}")
        except Exception as e:
            log(f"JSON upload exception: {e}")

    return video_url, json_url


# ============================================================
# STEP 6: SAVE SIDECAR JSON
# ============================================================
def save_seo_package(script, video_path, festival):
    if not video_path:
        return None
    json_path = video_path.with_suffix('.json')
    package = {
        "festival": festival["festival_name"],
        "festival_slug": festival.get("festival_slug"),
        "tier": festival.get("tier"),
        "date": festival.get("date"),
        "publish_date": today_ist(),
        "video_in_series": f"{festival['_publish_day_index']}/{festival['_total_publish_days']}",
        "video_file": video_path.name,
        "slug": script.get("slug", ""),
        "video_title": script.get("video_title", ""),
        "meta_description": script.get("meta_description", ""),
        "tts_script": script.get("tts_script", ""),
        "seo_caption": script.get("seo_caption", ""),
        "caption_variants": script.get("caption_variants", {}),
        "aeo_qa": script.get("aeo_qa", []),
        "geo_entities": script.get("geo_entities", {}),
        "voice_search_phrases": script.get("voice_search_phrases", []),
        "keyword_cluster": script.get("keyword_cluster", {}),
        "hashtags": script.get("hashtags", {}),
        "youtube_description": script.get("youtube_description", ""),
        "whatsapp_broadcast": script.get("whatsapp_broadcast", ""),
        "schema_event": script.get("schema_event", {}),
        "cta_variants": script.get("cta_variants", []),
        "hindi_lines": script.get("hindi_lines", []),
        "english_lines": script.get("english_lines", []),
        "image_prompts_used": script.get("image_prompts", []),
        "platforms_to_publish": ["instagram", "facebook", "threads", "youtube_shorts", "whatsapp"]
    }
    json_path.write_text(json.dumps(package, ensure_ascii=False, indent=2), encoding='utf-8')
    log(f"SEO sidecar saved: {json_path.name}")
    return json_path


# ============================================================
# STEP 7: SUPABASE LOGS + ALERTS
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
                "video_path": str(video_path) if video_path else None,
                "status": "success" if success else "failed"
            },
            timeout=10
        )
        log("Logged to content_generation_log")
    except Exception as e:
        log(f"Supabase log skipped: {e}")

    if success and video_url:
        for platform in ["instagram", "facebook", "threads", "whatsapp", "youtube"]:
            try:
                requests.post(
                    f"{SUPABASE_URL}/rest/v1/social_publish_log",
                    headers={
                        "apikey": SUPABASE_KEY,
                        "Authorization": f"Bearer {SUPABASE_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "festival": festival["festival_name"],
                        "video_date": today_ist(),
                        "video_path": str(video_path),
                        "video_public_url": video_url,
                        "platform": platform,
                        "status": "pending",
                        "caption": script.get("caption_variants", {}).get(platform, script.get("seo_caption", "")),
                        "hashtags": " ".join(["#" + h for h in script.get("hashtags", {}).get("trending", [])[:15]])
                    },
                    timeout=10
                )
            except Exception as e:
                log(f"social_publish_log insert failed for {platform}: {e}")


def send_whatsapp_alert(message):
    if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_ID:
        log("WhatsApp alert skipped - tokens missing")
        return
    try:
        url = f"https://graph.facebook.com/v20.0/{WHATSAPP_PHONE_ID}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "to": ALERT_NUMBER,
            "type": "text",
            "text": {"body": message}
        }
        headers = {
            "Authorization": f"Bearer {WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        log(f"WhatsApp alert sent: {resp.status_code}")
    except Exception as e:
        log(f"WhatsApp alert exception: {e}")


# ============================================================
# CLEANUP
# ============================================================
def cleanup():
    patterns = ["*.mp4", "*.txt", "img_*.png", "tts_*.wav", "tts_*.mp3"]
    for pat in patterns:
        for f in TEMP_DIR.glob(pat):
            f.unlink(missing_ok=True)


# ============================================================
# PROCESS ONE FESTIVAL (with 3 retries)
# ============================================================
def process_festival(festival, max_retries=3):
    for attempt in range(1, max_retries + 1):
        log("=" * 55)
        log(f"ATTEMPT {attempt}/{max_retries} for {festival['festival_name']}")
        log("=" * 55)

        try:
            script = generate_script(festival)
            if not script:
                raise Exception("Script generation failed")

            audio = generate_tts(script.get("tts_script", ""))
            if not audio:
                raise Exception("TTS failed")

            image_prompts = script.get("image_prompts", [])
            if len(image_prompts) < 3:
                raise Exception(f"Only {len(image_prompts)} prompts")

            images = generate_all_images(image_prompts)
            if len(images) < 3:
                raise Exception(f"Only {len(images)} images")

            video = render_video(images, audio, script, festival)
            if not video:
                raise Exception("Video render failed")

            json_path = save_seo_package(script, video, festival)
            video_url, json_url = upload_to_supabase(video, json_path, script.get("slug", "video"))
            log_supabase(script, video, video_url, festival, True)
            cleanup()

            log(f"SUCCESS: {video}")
            return True

        except Exception as e:
            log(f"ATTEMPT {attempt} FAILED: {e}")
            cleanup()
            if attempt < max_retries:
                log(f"Retrying in 60 seconds...")
                time.sleep(60)
            else:
                alert_msg = (
                    f"TRIKAL VAANI CONTENT ENGINE FAILED\n\n"
                    f"Festival: {festival['festival_name']}\n"
                    f"Date: {today_ist()}\n"
                    f"Tier: {festival.get('tier')}\n"
                    f"All 3 retries exhausted.\n"
                    f"Last error: {str(e)[:200]}\n"
                    f"Check /tmp/trikal_cron.log on VM"
                )
                send_whatsapp_alert(alert_msg)
                log_supabase(None, None, None, festival, False, str(e))
                return False
    return False


# ============================================================
# MAIN
# ============================================================
def main():
    log("=" * 55)
    log("TRIKAL VAANI CONTENT ENGINE v5.0 - SMART CRON MODE")
    log("=" * 55)

    # Manual mode: --festival <slug>
    if len(sys.argv) > 1 and sys.argv[1] == "--festival":
        slug = sys.argv[2] if len(sys.argv) > 2 else None
        log(f"Manual mode: forcing festival {slug}")
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
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

    # Cron mode: check today's schedule
    festivals_today = fetch_todays_festivals()
    if not festivals_today:
        log("No festivals scheduled for today. Exiting cleanly.")
        return

    log(f"Will process {len(festivals_today)} festival(s) today")
    results = []
    for fest in festivals_today:
        success = process_festival(fest)
        results.append((fest['festival_name'], success))

    log("=" * 55)
    log("FINAL SUMMARY:")
    for name, ok in results:
        log(f"  {'OK' if ok else 'FAIL'} {name}")
    log("=" * 55)


if __name__ == "__main__":
    main()
