#!/usr/bin/env python3
"""
TRIKAL VAANI - Content Engine v4.1
=====================================
SEO + GEO + AEO Optimized Festival Video Engine
=====================================
FIXES IN v4.1:
- Proper WAV file creation (wraps Gemini PCM in valid header)
- import wave at module top (no inline import)
- Correct indentation throughout
- ffprobe safety with frame-count math (no zero/inf time_base)
- Cleanup includes both .mp3 and .wav legacy files
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
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ENV
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
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


# FESTIVAL DATABASE
FESTIVALS = [
    {
        "name": "Shani Jayanti", "date": "2026-05-16", "days_left": 1,
        "deity": "Shani Dev", "planet": "Saturn", "house": "10th House",
        "dosha": "Sade Sati, Shani Dosha",
        "theme": "Saturn ringed planet glowing blue cosmic, ancient Shani temple at twilight"
    },
    {
        "name": "Vat Savitri Vrat", "date": "2026-05-27", "days_left": 12,
        "deity": "Maa Savitri", "planet": "Venus", "house": "7th House",
        "dosha": "Mangal Dosha relief",
        "theme": "Massive sacred banyan tree, married woman in red saree praying, golden hour"
    },
    {
        "name": "Ganga Dussehra", "date": "2026-06-01", "days_left": 17,
        "deity": "Maa Ganga", "planet": "Moon", "house": "4th House",
        "dosha": "Pitra Dosha",
        "theme": "Holy Ganga at Haridwar, evening aarti diyas floating, glowing sunset"
    },
]

# STYLE ROTATION
STYLES = {
    "Traditional": "traditional devotional Indian art style, warm temple atmosphere, marigold flowers, brass diyas, red and gold color palette, intricate mandala patterns, authentic Hindu iconography",
    "Cosmic": "cosmic mystical style, deep space backdrop, glowing celestial energy, planetary alignment, deity silhouette in galaxy, purple and gold ethereal lighting, sacred geometry",
    "Cinematic": "cinematic photorealistic style, golden hour natural lighting, real Indian sacred location (Varanasi ghat, Haridwar, Himalayan temple), documentary photography quality, shallow depth of field"
}

# 5-IMAGE STORY ARC
STORY_ARC = [
    {"role": "Hook", "style_key": "Cosmic", "scene": "Dramatic reveal of {deity} or {planet}, eye-catching opening shot, mysterious atmosphere, viewer's attention grabbed in first second"},
    {"role": "Context", "style_key": "Cinematic", "scene": "Sacred location, holy site or symbolic landscape connected to {deity}, establishing the spiritual setting, wide cinematic frame"},
    {"role": "Ritual", "style_key": "Traditional", "scene": "Close-up of ritual offering, puja items, sacred fire, flowers, lamps being offered for {festival}, hands performing the ritual, no face visible"},
    {"role": "Devotee", "style_key": "Cinematic", "scene": "Devotee from behind (back to camera) praying with folded hands before sacred space, atmospheric depth, golden light streaming"},
    {"role": "Blessing", "style_key": "Cosmic", "scene": "Divine light glowing radiating, blessing aftermath, peace and grace visualized, ethereal aura, soft celestial rays"}
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
    # Try direct parse first
    try:
        return json.loads(text)
    except Exception:
        pass
    # Find outermost { } pair
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


# STEP 1: SCRIPT + SEO/GEO/AEO PACKAGE
def generate_script(festival):
    log(f"Generating SEO+GEO+AEO script for {festival['name']}...")

    arc_prompts = []
    for stage in STORY_ARC:
        scene = stage["scene"].format(
            deity=festival["deity"],
            planet=festival["planet"],
            festival=festival["name"]
        )
        style_desc = STYLES[stage["style_key"]]
        arc_prompts.append({"role": stage["role"], "scene": scene, "style": style_desc})

    prompt = f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com) - India's premium AI Vedic Astrology platform.

Generate a complete SEO + GEO + AEO optimized Instagram Reel content package for upcoming festival.

FESTIVAL: {festival['name']}
DATE: {festival['date']} ({festival['days_left']} days from today)
DEITY: {festival['deity']}
PLANET: {festival['planet']}
HOUSE: {festival['house']}
DOSHA RELIEF: {festival['dosha']}

Output ONLY raw JSON (no markdown fences, no preamble):

{{
  "video_title": "Hindi title max 6 Devanagari words SEO-optimized",
  "hindi_lines": ["Hook 6 words Devanagari", "Line 2 max 6 words", "Line 3 max 6 words", "Line 4 closing max 6 words"],
  "english_lines": ["Hook 7 words English", "Line 2 max 7 words", "Line 3 max 7 words", "Line 4 max 7 words"],
  "tts_script": "STRICT 120 WORDS MAX Hindi narration (will be spoken in 45-50 seconds). Warm authoritative voice. Structure: 1) Hook about {festival['name']} significance 2) Connection to {festival['planet']} and {festival['house']} 3) One specific ritual to do 4) One thing to avoid 5) Blessing promise. Last sentence MUST be exactly: Trikal Vaani par apni kundali dekhein aur apna bhavishya jaanein. COUNT WORDS BEFORE OUTPUT - must be under 120 words.",
  "seo_caption": "150 word Instagram/Facebook caption in Hinglish. Front-load primary keyword '{festival['name']} 2026' in first 8 words. Include semantic keywords: {festival['planet']}, {festival['deity']}, kundali, Vedic astrology, remedies. Strong hook line, value-packed middle, CTA: 'Free Kundali on TrikalVaani.com'. Include 5 line breaks for readability. End with 5 emoji line.",
  "aeo_qa": [
    {{"q": "What is the significance of {festival['name']}?", "a": "40-60 word direct answer optimized for Google SGE, Perplexity, SearchGPT featured snippet. Mention {festival['deity']}, {festival['planet']}, and specific date 2026."}},
    {{"q": "What rituals to perform on {festival['name']}?", "a": "40-60 word answer listing 3 specific rituals with timing and offerings"}},
    {{"q": "How does {festival['name']} affect my kundali?", "a": "40-60 word answer connecting {festival['planet']}, {festival['house']}, and {festival['dosha']}. End with CTA to trikalvaani.com"}}
  ],
  "geo_entities": {{
    "primary_deity": "{festival['deity']}",
    "primary_planet": "{festival['planet']}",
    "primary_house": "{festival['house']}",
    "dosha_addressed": "{festival['dosha']}",
    "related_planets": ["list 2 connected planets"],
    "related_yogas": ["list 2 Vedic yogas relevant to this festival"],
    "remedy_gemstone": "one gemstone name",
    "remedy_mantra": "one Sanskrit mantra in Devanagari",
    "auspicious_color": "color name",
    "auspicious_direction": "direction name"
  }},
  "hashtags": {{
    "trending": ["15 trending Hindi+English hashtags WITHOUT # symbol"],
    "niche": ["10 niche Vedic astrology hashtags WITHOUT # symbol"]
  }},
  "youtube_description": "300 word YouTube Shorts description. Opening 150 chars MUST contain primary keyword and CTA URL https://trikalvaani.com. Include: festival significance, planet connection, 3 rituals, 1 remedy, kundali CTA. Add timestamps 0:00 Intro, 0:15 Significance, 0:30 Rituals, 0:45 CTA. End with 5 hashtags on new lines.",
  "whatsapp_broadcast": "60 word punchy WhatsApp broadcast in Hinglish. Hook in first line. Mention {festival['name']} date. One ritual tip. CTA: 'Free kundali check karein - trikalvaani.com'. Use 2 emojis max.",
  "image_prompts": [
    "Image 1 HOOK: {arc_prompts[0]['scene']}. Style: {arc_prompts[0]['style']}. 9:16 portrait photorealistic no text no watermark cinematic",
    "Image 2 CONTEXT: {arc_prompts[1]['scene']}. Style: {arc_prompts[1]['style']}. 9:16 portrait photorealistic no text no watermark cinematic",
    "Image 3 RITUAL: {arc_prompts[2]['scene']}. Style: {arc_prompts[2]['style']}. 9:16 portrait photorealistic no text no watermark cinematic",
    "Image 4 DEVOTEE: {arc_prompts[3]['scene']}. Style: {arc_prompts[3]['style']}. 9:16 portrait photorealistic no text no watermark cinematic",
    "Image 5 BLESSING: {arc_prompts[4]['scene']}. Style: {arc_prompts[4]['style']}. 9:16 portrait photorealistic no text no watermark cinematic"
  ]
}}

CRITICAL RULES:
- Hindi text in pure Devanagari script only
- TTS script MUST be under 120 words (count carefully)
- All AEO answers 40-60 words exactly
- SEO caption keyword-rich for Google + Instagram SEO
- No filler, no fluff, every word must drive engagement or rankings"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 8000,
            "temperature": 0.8,
            "responseMimeType": "application/json",
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }
    try:
        resp = requests.post(url, json=payload, timeout=60)
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        log(f"Script raw preview: {repr(text[:200])}")
        result = extract_json(text)
        log("Script + SEO/GEO/AEO package generated")
        return result
    except Exception as e:
        log(f"Script failed: {e}")
        return None


# STEP 2: TTS AUDIO (SAVED AS PROPER WAV)
def generate_tts(tts_script):
    log("Generating Hindi TTS via Gemini Charon...")
    word_count = len(tts_script.split())
    log(f"TTS script word count: {word_count}")
    if word_count > 130:
        log(f"WARNING: Script has {word_count} words (target <120). Audio may exceed 50sec.")

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


# STEP 3: IMAGES via NANO BANANA 2
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


# STEP 4: VIDEO RENDER
def render_video(images, audio_path, script, festival):
    log("Rendering video with Ken Burns + dual logo...")
    output_path = OUTPUT_DIR / f"trikal_{festival['name'].replace(' ','_').lower()}_{today_ist()}.mp4"

    # Audio duration with safety fallback
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
        log(f"ffprobe fallback to 48s: {e}")

    if audio_dur <= 0 or audio_dur > 120:
        log(f"Invalid duration {audio_dur}, forcing 48s fallback")
        audio_dur = 48.0

    log(f"Audio: {audio_dur:.1f}s | Images: {len(images)} | Per image: {audio_dur/len(images):.1f}s")
    img_dur = max(audio_dur / len(images), 5.0)

    # Ken Burns per image
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

    # Concat clips
    concat_file = TEMP_DIR / "concat.txt"
    concat_file.write_text("\n".join([f"file '{p}'" for p in processed]))
    concat_out = TEMP_DIR / "concat.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(concat_out)
    ], capture_output=True, timeout=120)

    # Text overlays
    hindi = [safe_text(l) for l in script.get("hindi_lines", [])]
    fest_name = safe_text(festival["name"])
    days_left = str(festival["days_left"])

    fh = str(FONT_HINDI) if FONT_HINDI.exists() else ""
    fe = str(FONT_ENG) if FONT_ENG.exists() else ""
    fh_opt = f":fontfile='{fh}'" if fh else ""
    fe_opt = f":fontfile='{fe}'" if fe else ""

    filters = []
    filters.append("drawbox=x=0:y=h-500:w=iw:h=500:color=black@0.5:t=fill")
    filters.append(f"drawtext=text='TrikalVaani.com':fontsize=36:fontcolor=gold:x=(w-text_w)/2:y=70:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}")
    filters.append(f"drawtext=text='{fest_name}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=160:shadowcolor=black:shadowx=3:shadowy=3{fh_opt}")
    filters.append(f"drawtext=text='{days_left} Din Baad':fontsize=42:fontcolor=orange:x=(w-text_w)/2:y=240:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}")

    line_time = audio_dur / max(len(hindi) + 1, 1)
    for i, line in enumerate(hindi):
        y_pos = 1500 + (i * 70)
        start_t = i * line_time
        filters.append(f"drawtext=text='{line}':fontsize=46:fontcolor=white:x=(w-text_w)/2:y={y_pos}:enable='gte(t,{start_t:.1f})':shadowcolor=black:shadowx=2:shadowy=2{fh_opt}")

    filters.append(f"drawtext=text='Rohiit Gupta - Chief Vedic Architect':fontsize=26:fontcolor=gold:x=(w-text_w)/2:y=h-50:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}")

    vf = ",".join(filters)

    # DUAL LOGO
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


# STEP 5: SEO/GEO/AEO SIDECAR
def save_seo_package(script, video_path, festival):
    if not video_path:
        return None
    json_path = video_path.with_suffix('.json')
    package = {
        "festival": festival["name"],
        "date": today_ist(),
        "video_file": video_path.name,
        "video_title": script.get("video_title", ""),
        "tts_script": script.get("tts_script", ""),
        "seo_caption": script.get("seo_caption", ""),
        "aeo_qa": script.get("aeo_qa", []),
        "geo_entities": script.get("geo_entities", {}),
        "hashtags": script.get("hashtags", {}),
        "youtube_description": script.get("youtube_description", ""),
        "whatsapp_broadcast": script.get("whatsapp_broadcast", ""),
        "hindi_lines": script.get("hindi_lines", []),
        "english_lines": script.get("english_lines", []),
        "image_prompts_used": script.get("image_prompts", []),
        "platforms_to_publish": ["instagram", "facebook", "threads", "youtube_shorts", "whatsapp"]
    }
    json_path.write_text(json.dumps(package, ensure_ascii=False, indent=2), encoding='utf-8')
    log(f"SEO sidecar saved: {json_path.name}")
    return json_path


# STEP 6: SUPABASE LOG
def log_supabase(script, video_path, festival, success):
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
                "tithi": festival["name"],
                "video_title": script.get("video_title", "") if script else "",
                "video_path": str(video_path) if video_path else None,
                "status": "success" if success else "failed"
            },
            timeout=10
        )
        log("Logged to Supabase")
    except Exception as e:
        log(f"Supabase log skipped: {e}")


# CLEANUP
def cleanup():
    patterns = ["*.mp4", "*.txt", "img_*.png", "tts_*.wav", "tts_*.mp3"]
    for pat in patterns:
        for f in TEMP_DIR.glob(pat):
            f.unlink(missing_ok=True)


# MAIN
def main():
    log("=" * 55)
    log("TRIKAL VAANI CONTENT ENGINE v4.1 - SEO+GEO+AEO")
    log("=" * 55)

    festival = FESTIVALS[0]
    log(f"Target: {festival['name']} in {festival['days_left']} days")

    script = generate_script(festival)
    if not script:
        log("FAILED at script generation")
        return

    audio = generate_tts(script.get("tts_script", ""))
    if not audio:
        log("FAILED at TTS")
        return

    image_prompts = script.get("image_prompts", [])
    if len(image_prompts) < 3:
        log(f"Only {len(image_prompts)} prompts")
        return

    images = generate_all_images(image_prompts)
    if len(images) < 3:
        log(f"Only {len(images)} images generated")
        return

    video = render_video(images, audio, script, festival)
    save_seo_package(script, video, festival)
    log_supabase(script, video, festival, video is not None)
    cleanup()

    if video:
        log(f"SUCCESS: {video}")
        log(f"JSON package: {video.with_suffix('.json').name}")
    else:
        log("FAILED - check logs")


if __name__ == "__main__":
    main()
