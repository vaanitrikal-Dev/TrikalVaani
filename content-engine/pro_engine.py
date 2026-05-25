#!/usr/bin/env python3
"""
TRIKAL VAANI — Content Engine PRO
=============================================================
File:    content-engine/pro_engine.py
Version: v1.2 — pinned comment after YT upload, caption kit wired
Owner:   Rohiit Gupta, Chief Vedic Architect
Date:    2026-05-25
=============================================================
PURPOSE:
  Separate Pro Engine triggered manually from the dashboard.
  The daily cron (trikal_content_engine.py v5.5) is NEVER touched.

3 PIPELINES:
  Pipeline 1 — Natural Flow  (POST /pro/natural)
    Text + images → Gemini Flash → TTS → Nano Banana → FFmpeg
    8-effect mood-matched rendering. Cost ~₹15.

  Pipeline 2 — AI Video      (POST /pro/ai-video)
    Text + images → Gemini Flash generates hook prompt →
    Seedance/Wan API generates hook clip → Gemini Flash
    generates matched script + scenes → TTS → Nano Banana →
    FFmpeg stitch. Cost ~₹45-70.

  Pipeline 3a — Flow Prompt  (POST /pro/flow-prompt)
    Text → Gemini Flash generates 20-30 word cinematic prompt
    optimised for Google Flow (720p). Returns prompt only.
    Cost ~₹0.50.

  Pipeline 3b — Flow Stitch  (POST /pro/flow-stitch)
    Uploaded Flow video (720p MP4) → Gemini Flash watches it
    → generates matched TTS script + Nano Banana scenes →
    TTS → images → FFmpeg stitch (hook + slides) → YT + Drive.
    Cost ~₹25-37.

3 SEPARATE PROMPTS (edit one without touching the others):
  prompt_natural()    ← Pipeline 1
  prompt_ai_video()   ← Pipeline 2
  prompt_flow_step1() ← Pipeline 3a (Flow prompt generation)
  prompt_flow_step2() ← Pipeline 3b (video analysis + script)

8-EFFECT FFMPEG LIBRARY (mood-matched per image slot):
  Slot 0 → punch_in      (fast zoom, hook feel)
  Slot 1 → slow_zoom_in  (divine, meditative)
  Slot 2 → top_to_bottom (blessings flowing down)
  Slot 3 → zoom_out      (dramatic, warning)
  Slot 4 → slow_drift    (warmth, grace)
  Slot 5+ → diagonal     (energy, forward motion)

PATHS: reuses same content-engine/temp, output, assets as v5.5
ENV:   same GEMINI_API_KEY, YOUTUBE_*, DRIVE_* as v5.5
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

# ── Paths (same as v5.5) ─────────────────────────────────────
BASE_DIR  = Path("/home/vaanitrikal/trikal-vaani/content-engine")
TEMP_DIR  = BASE_DIR / "temp"
OUTPUT_DIR = BASE_DIR / "output"
ASSETS_DIR = BASE_DIR / "assets"
LOGO_PATH  = ASSETS_DIR / "logo.png"
FONT_HINDI = ASSETS_DIR / "NotoSansDevanagari-Bold.ttf"
FONT_ENG   = ASSETS_DIR / "NotoSans-Bold.ttf"

for d in [TEMP_DIR, OUTPUT_DIR, ASSETS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── Env ──────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

YOUTUBE_CLIENT_ID     = "166374809393-eo1hthqcbh5s0g504ra5ijap9gr930lr.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET = "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"
YOUTUBE_REFRESH_TOKEN = os.environ.get("YOUTUBE_REFRESH_TOKEN", "")

DRIVE_CLIENT_ID     = "166374809393-eo1hthqcbh5s0g504ra5ijap9gr930lr.apps.googleusercontent.com"
DRIVE_CLIENT_SECRET = "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"
DRIVE_REFRESH_TOKEN = "1//043A--ejqbUGbCgYIARAAGAQSNwF-L9IrW3QqsoW5y_pWrmSt3hhs8ic4iJWGP4jS4_bV2fiD6MFTeBiW4yUt5G27Gzb7iN5VcCY"
DRIVE_FOLDER_ID     = "1CyfhLGXcLs4JITGOPbVU-h6-56jvExYx"

IST = timezone(timedelta(hours=5, minutes=30))


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
# PROMPT 1 — NATURAL FLOW
# Edit this prompt without touching Prompt 2 or 3.
# Returns: {voiceover, scenes[], title, yt_description,
#           hashtags[], caption}
# =============================================================
def prompt_natural(text: str, image_count: int) -> str:
    return f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com).

Create a complete video content package from the brief below.
Respond ONLY with raw JSON — no markdown fences, no preamble.

BRIEF:
{text}

IMAGES AVAILABLE: {image_count} (you must describe exactly {image_count} scenes)

Output JSON:
{{
  "title": "Compelling Hindi/Hinglish video title max 8 words",
  "voiceover": "Hinglish TTS script STRICT 100-120 words. Hook in first 8 words. Vedic authority tone. Last sentence: Trikal Vaani par apni kundali dekhein aur apna bhavishya jaanein.",
  "scenes": [
    "Scene 1: vivid visual description for Nano Banana image generation, 9:16 portrait, no text, no watermark, specific mood and style",
    "Scene 2: ...",
    "Scene 3: ...",
    "Scene 4: ...",
    "Scene 5: ..."
  ],
  "caption": "120 word Hinglish Instagram caption. Emoji-rich. CTA: Link in bio. trikalvaani.com",
  "hashtags": ["15 relevant hashtags without # symbol"],
  "yt_title": "YouTube title max 100 chars, keyword-first",
  "yt_description": "200 word YouTube description. First line: keyword + trikalvaani.com. Timestamps 0:00 Intro 0:10 Main 0:40 CTA."
}}

RULES:
- scenes array must have exactly {image_count} items
- voiceover must be Hinglish (Hindi + English mix), warm and authoritative
- Do NOT mention any competitor
- Every scene: 9:16 portrait orientation, no text overlay"""


# =============================================================
# PROMPT 2 — AI VIDEO (Seedance / Wan)
# Edit this prompt without touching Prompt 1 or 3.
# Returns: {hook_prompt, voiceover, scenes[], title,
#           yt_description, hashtags[], caption}
# hook_prompt → goes to Seedance/Wan API
# scenes      → goes to Nano Banana
# =============================================================
def prompt_ai_video(text: str, image_count: int) -> str:
    return f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com).

Create a POWER REEL content package. This video will carry a direct link to Trikal Vaani.
The hook clip will be AI-generated (Seedance/Wan). Make it sharp and emotionally compelling.
Respond ONLY with raw JSON — no markdown fences, no preamble.

BRIEF:
{text}

IMAGES AVAILABLE: {image_count} (describe exactly {image_count} scenes for the slides after the hook)

Output JSON:
{{
  "title": "Compelling Hindi/Hinglish video title max 8 words",
  "hook_prompt": "Cinematic AI video prompt for Seedance/Wan. EXACTLY 20-25 words. Specify: subject, action, camera angle, lighting mood, visual style. Example: 'Mystical Indian astrologer gazes at glowing Saturn, slow push-in, golden temple light, cinematic, 4K'. No text. No watermarks. Vertical 9:16.",
  "voiceover": "Hinglish TTS script STRICT 80-100 words (shorter because hook takes first 10 sec). Hook pain point in first 6 words. Trikal authority. Last sentence: Trikal Vaani par apni kundali dekhein aur apna bhavishya jaanein.",
  "scenes": [
    "Slide 1 visual description for Nano Banana, 9:16, no text",
    "Slide 2 ...",
    "Slide 3 ..."
  ],
  "caption": "Power reel caption 100 words. Sharp pain-point hook. Direct CTA. trikalvaani.com",
  "hashtags": ["20 highly relevant hashtags without # symbol"],
  "yt_title": "YouTube Shorts title max 100 chars, keyword-first",
  "yt_description": "150 word YouTube description. First line: keyword + trikalvaani.com."
}}

RULES:
- hook_prompt must be visceral and cinematic — this is the scroll-stopper
- scenes array must have exactly {image_count} items
- voiceover shorter than Pipeline 1 (AI hook already fills first 10 sec)
- No competitor mentions
- All scenes 9:16 portrait, no text"""


# =============================================================
# PROMPT 3a — FLOW MODE STEP 1 (generate Flow prompt)
# Edit this prompt without touching Prompt 1 or 2.
# Returns: {flow_prompt, topic_summary}
# flow_prompt → user pastes into Google Flow at 720p
# =============================================================
def prompt_flow_step1(text: str) -> str:
    return f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com).

Read the brief below and generate a precise cinematic prompt for Google Flow AI video generation.
The video will be 720p, 10 seconds, used as the opening hook of an Instagram Reel.
Respond ONLY with raw JSON — no markdown fences, no preamble.

BRIEF:
{text}

Output JSON:
{{
  "flow_prompt": "Google Flow video prompt. EXACTLY 20-30 words. Must specify: (1) main subject clearly, (2) camera movement e.g. slow push-in / pull-back / pan left / orbital, (3) lighting mood e.g. golden hour / mystical blue / warm temple glow, (4) visual style e.g. cinematic 4K / documentary / ethereal. No text. No watermarks. Vertical 9:16. 720p.",
  "topic_summary": "3-5 word summary of the core topic for reference when you return with the video"
}}

RULES:
- flow_prompt must be actionable — someone must be able to paste it directly into Google Flow
- Include at least one specific camera angle/movement
- Include specific lighting description
- No more than 30 words in flow_prompt
- Vertical orientation (9:16) must be implied or stated"""


# =============================================================
# PROMPT 3b — FLOW MODE STEP 2 (analyse video + generate content)
# Edit this prompt without touching Prompt 1, 2, or 3a.
# Input: video file bytes sent to Gemini Files API
# Returns: {voiceover, scenes[], title, caption, hashtags,
#           yt_title, yt_description}
# =============================================================
def prompt_flow_step2(text: str, image_count: int, video_description: str) -> str:
    return f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com).

I have already generated a 10-second cinematic hook video using Google Flow.
The video has been analysed and here is what it contains:

VIDEO ANALYSIS:
{video_description}

ORIGINAL BRIEF:
{text}

IMAGES FOR SLIDES: {image_count}

Your job: create a voiceover script and image scenes that VISUALLY MATCH the hook video above.
The slides that follow must feel like a natural continuation of the hook.
Respond ONLY with raw JSON — no markdown fences, no preamble.

Output JSON:
{{
  "title": "Compelling Hindi/Hinglish title max 8 words",
  "voiceover": "Hinglish TTS script STRICT 80-100 words. Must match the mood/visual of the hook video. Hook in first 6 words that references what viewer just saw. Trikal authority tone. Last sentence: Trikal Vaani par apni kundali dekhein aur apna bhavishya jaanein.",
  "scenes": [
    "Scene 1: visual description that CONTINUES from the hook video visually. Same color palette, same mood. 9:16 portrait, no text.",
    "Scene 2: ...",
    "Scene 3: ..."
  ],
  "caption": "100 word Hinglish caption. Opens with hook that matches the video mood. CTA: Link in bio. trikalvaani.com",
  "hashtags": ["20 relevant hashtags without # symbol"],
  "yt_title": "YouTube Shorts title max 100 chars",
  "yt_description": "150 word YouTube description. First line: keyword + trikalvaani.com."
}}

RULES:
- scenes must visually continue from the hook video — same palette, same energy
- scenes array must have exactly {image_count} items
- voiceover mood must match the visual tone of the hook
- No competitor mentions
- All scenes 9:16 portrait, no text"""


# =============================================================
# FFMPEG EFFECT LIBRARY (8 effects, mood-matched)
# Same as v5.5 — reused here for Pro Engine consistency
# =============================================================

def effect_punch_in(d_frames):
    """Slot 0 — fast zoom 1.0→1.4, hook/attention grab."""
    return (f"zoompan=z='min(1.0+({d_frames}-on)*0.016/{d_frames},1.4)':"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")

def effect_slow_zoom_in(d_frames):
    """Slot 1 — gentle zoom 1.0→1.18, divine meditative."""
    return (f"zoompan=z='min(1.0+on*0.18/{d_frames},1.18)':"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")

def effect_top_to_bottom(d_frames):
    """Slot 2 — y-pan downward, blessings flowing."""
    return (f"zoompan=z='1.1':x='iw/2-(iw/zoom/2)':"
            f"y='on*(ih-(ih/zoom))/{d_frames}':"
            f"d={d_frames}:s=1080x1920:fps=25")

def effect_zoom_out(d_frames):
    """Slot 3 — pull back 1.35→1.0, dramatic warning."""
    return (f"zoompan=z='max(1.35-on*0.35/{d_frames},1.0)':"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")

def effect_slow_drift(d_frames):
    """Slot 4 — slow zoom + x drift, warmth grace."""
    return (f"zoompan=z='min(1.0+on*0.12/{d_frames},1.12)':"
            f"x='on*(iw/8)/{d_frames}':y='ih/2-(ih/zoom/2)':"
            f"d={d_frames}:s=1080x1920:fps=25")

def effect_diagonal(d_frames):
    """Slot 5+ — diagonal pan + zoom, energy forward motion."""
    return (f"zoompan=z='min(1.0+on*0.2/{d_frames},1.2)':"
            f"x='on*(iw/6)/{d_frames}':y='on*(ih/8)/{d_frames}':"
            f"d={d_frames}:s=1080x1920:fps=25")

SLOT_EFFECTS = [
    effect_punch_in,
    effect_slow_zoom_in,
    effect_top_to_bottom,
    effect_zoom_out,
    effect_slow_drift,
]

def get_effect(idx: int):
    if idx < len(SLOT_EFFECTS):
        return SLOT_EFFECTS[idx]
    return effect_diagonal


# =============================================================
# GEMINI HELPERS
# =============================================================

def gemini_text(prompt: str, temperature: float = 0.8) -> str:
    """Call Gemini Flash for text generation."""
    url = (f"https://generativelanguage.googleapis.com/v1beta/"
           f"models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}")
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 8000,
            "temperature": temperature,
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }
    resp = requests.post(url, json=payload, timeout=90)
    resp.raise_for_status()
    return resp.json()["candidates"][0]["content"]["parts"][0]["text"]


def gemini_analyse_video(video_bytes: bytes, mime: str = "video/mp4") -> str:
    """
    Upload video to Gemini Files API then ask Flash to describe it.
    Returns a plain-text description of the video content.
    Used in Flow Mode Step 2.
    """
    log("Uploading Flow video to Gemini Files API...")

    # Step 1: Upload file
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
    file_uri = up_resp.json()["file"]["uri"]
    log(f"Video uploaded to Gemini Files: {file_uri}")

    # Step 2: Analyse
    url = (f"https://generativelanguage.googleapis.com/v1beta/"
           f"models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}")
    payload = {
        "contents": [{
            "parts": [
                {"fileData": {"mimeType": mime, "fileUri": file_uri}},
                {"text": (
                    "Analyse this video clip carefully. Describe in 80-120 words: "
                    "1) Main subject and what is happening, "
                    "2) Dominant color palette (be specific — e.g. deep blue, warm gold, purple haze), "
                    "3) Camera movement (push-in, pull-back, pan, static), "
                    "4) Lighting mood (mystical, golden, dark, ethereal), "
                    "5) Overall emotional tone. "
                    "Be specific and visual. This description will be used to create "
                    "matching image slides and a voiceover."
                )}
            ]
        }],
        "generationConfig": {
            "maxOutputTokens": 500,
            "temperature": 0.3,
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }
    resp = requests.post(url, json=payload, timeout=90)
    resp.raise_for_status()
    description = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    log(f"Video analysed: {description[:100]}...")
    return description


def generate_tts(script: str) -> Optional[Path]:
    """Generate Hinglish TTS via Gemini Charon. Returns WAV path."""
    log("Generating TTS via Gemini Charon...")
    url = (f"https://generativelanguage.googleapis.com/v1beta/"
           f"models/gemini-2.5-flash-preview-tts:generateContent?key={GEMINI_API_KEY}")
    payload = {
        "contents": [{"parts": [{"text": script}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {"voiceName": "Charon"}
                }
            }
        }
    }
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


def generate_images(scenes: list) -> list:
    """Generate images via Gemini Flash Image. Returns list of Paths."""
    images = []
    url = (f"https://generativelanguage.googleapis.com/v1beta/"
           f"models/gemini-3.1-flash-image-preview:generateContent?key={GEMINI_API_KEY}")
    for i, scene in enumerate(scenes):
        log(f"Generating image {i+1}/{len(scenes)}...")
        payload = {
            "contents": [{"parts": [{"text": scene}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]}
        }
        try:
            resp = requests.post(url, json=payload, timeout=180)
            data = resp.json()
            if 'candidates' not in data:
                log(f"Image {i+1} skipped: {data.get('error', 'unknown')}")
                continue
            for p in data['candidates'][0]['content']['parts']:
                if 'inlineData' in p:
                    img_bytes = base64.b64decode(p['inlineData']['data'])
                    img_path = TEMP_DIR / f"pro_img_{i}_{ts()}.png"
                    img_path.write_bytes(img_bytes)
                    images.append(img_path)
                    log(f"Image {i+1} OK ({len(img_bytes)//1024} KB)")
                    break
        except Exception as e:
            log(f"Image {i+1} failed: {e}")
        time.sleep(3)
    log(f"Images: {len(images)}/{len(scenes)} generated")
    return images


def get_audio_duration(audio_path: Path) -> float:
    """Get audio duration via ffprobe. Fallback 48s."""
    try:
        res = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_format", str(audio_path)],
            capture_output=True, text=True, timeout=30
        )
        parsed = json.loads(res.stdout)
        dur = float(parsed["format"]["duration"])
        return dur if 0 < dur < 120 else 48.0
    except Exception:
        return 48.0


def render_slides(images: list, audio_path: Path,
                  script_data: dict, slug: str) -> Optional[Path]:
    """
    Render image slides with mood-matched FFmpeg effects + TTS audio.
    Returns path to rendered MP4.
    """
    log(f"Rendering {len(images)} slides with mood-matched effects...")
    output_path = OUTPUT_DIR / f"{slug}_slides.mp4"
    audio_dur = get_audio_duration(audio_path)
    img_dur = max(audio_dur / len(images), 5.0)
    d_frames = max(int(img_dur * 25), 125)

    processed = []
    for i, img in enumerate(images):
        out = TEMP_DIR / f"pro_clip_{i}_{ts()}.mp4"
        effect_fn = get_effect(i)
        zoompan = effect_fn(d_frames)
        vf = (f"scale=1080:1920:force_original_aspect_ratio=increase,"
              f"crop=1080:1920,{zoompan}")
        res = subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(img),
            "-vf", vf, "-t", str(img_dur),
            "-c:v", "libx264", "-preset", "fast",
            "-crf", "20", "-pix_fmt", "yuv420p", "-r", "25", str(out)
        ], capture_output=True, timeout=180)
        if out.exists() and out.stat().st_size > 1000:
            processed.append(out)
            log(f"  Clip {i+1} OK → {effect_fn.__name__}")
        else:
            log(f"  Clip {i+1} FAILED: {res.stderr[-100:]}")

    if not processed:
        return None

    concat_file = TEMP_DIR / f"pro_concat_{ts()}.txt"
    concat_file.write_text("\n".join([f"file '{p}'" for p in processed]))
    concat_out = TEMP_DIR / f"pro_concat_{ts()}.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(concat_out)
    ], capture_output=True, timeout=120)

    # Text overlays
    title = safe_text(script_data.get("title", "Trikal Vaani"))
    fh_opt = f":fontfile='{FONT_HINDI}'" if FONT_HINDI.exists() else ""
    fe_opt = f":fontfile='{FONT_ENG}'" if FONT_ENG.exists() else ""

    filters = [
        f"drawtext=text='TrikalVaani.com':fontsize=40:fontcolor=gold"
        f":x=(w-text_w)/2:y=80:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}",
        f"drawtext=text='{title}':fontsize=52:fontcolor=white"
        f":x=(w-text_w)/2:y=155:shadowcolor=black:shadowx=3:shadowy=3{fh_opt}",
        f"drawtext=text='Rohiit Gupta - Chief Vedic Architect':fontsize=26"
        f":fontcolor=gold:x=(w-text_w)/2:y=h-55"
        f":shadowcolor=black:shadowx=2:shadowy=2{fe_opt}",
    ]
    vf_final = ",".join(filters)

    if LOGO_PATH.exists():
        fc = (f"[0:v]{vf_final}[txt];"
              f"[1:v]scale=130:130[logo];"
              f"[txt][logo]overlay=W-w-25:25[out]")
        cmd = [
            "ffmpeg", "-y",
            "-i", str(concat_out), "-i", str(LOGO_PATH), "-i", str(audio_path),
            "-filter_complex", fc, "-map", "[out]", "-map", "2:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
            "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)
        ]
    else:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(concat_out), "-i", str(audio_path),
            "-vf", vf_final, "-map", "0:v", "-map", "1:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "21",
            "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
            "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)
        ]

    res = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if output_path.exists() and output_path.stat().st_size > 10000:
        log(f"Slides rendered: {output_path.name} "
            f"({output_path.stat().st_size//1024//1024} MB)")
        return output_path
    log(f"Slides render failed: {res.stderr[-300:]}")
    return None


def stitch_hook_and_slides(hook_path: Path, slides_path: Path,
                            slug: str) -> Optional[Path]:
    """
    FFmpeg concat: hook clip (no audio) + slides (with TTS audio).
    The slides audio carries through the full video.
    """
    log("Stitching hook + slides...")
    output_path = OUTPUT_DIR / f"{slug}.mp4"
    concat_file = TEMP_DIR / f"pro_stitch_{ts()}.txt"
    concat_file.write_text(
        f"file '{hook_path}'\nfile '{slides_path}'"
    )
    res = subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264", "-preset", "fast", "-crf", "21",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart", "-pix_fmt", "yuv420p",
        str(output_path)
    ], capture_output=True, text=True, timeout=300)

    if output_path.exists() and output_path.stat().st_size > 10000:
        log(f"Final video: {output_path.name}")
        return output_path
    log(f"Stitch failed: {res.stderr[-300:]}")
    return None


# =============================================================
# YOUTUBE + DRIVE UPLOAD (same as v5.5)
# =============================================================

def get_drive_token() -> Optional[str]:
    try:
        resp = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": DRIVE_CLIENT_ID,
                "client_secret": DRIVE_CLIENT_SECRET,
                "refresh_token": DRIVE_REFRESH_TOKEN,
                "grant_type": "refresh_token"
            }, timeout=30
        )
        return resp.json().get("access_token")
    except Exception as e:
        log(f"Drive token error: {e}")
        return None


def upload_to_drive(video_path: Path, slug: str,
                    title: str) -> Optional[str]:
    log("Uploading to Google Drive...")
    token = get_drive_token()
    if not token:
        return None
    try:
        metadata = {
            "name": f"{slug}.mp4",
            "parents": [DRIVE_FOLDER_ID],
            "description": f"Trikal Vaani PRO — {title} — {today_ist()}"
        }
        with open(video_path, 'rb') as f:
            video_bytes = f.read()
        boundary = "trikal_pro_boundary"
        body = (
            f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
            f"{json.dumps(metadata)}\r\n"
            f"--{boundary}\r\nContent-Type: video/mp4\r\n\r\n"
        ).encode() + video_bytes + f"\r\n--{boundary}--".encode()

        resp = requests.post(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": f"multipart/related; boundary={boundary}"
            },
            data=body, timeout=300
        )
        if resp.status_code in [200, 201]:
            file_id = resp.json().get("id")
            url = f"https://drive.google.com/file/d/{file_id}/view"
            log(f"Drive: {url}")
            return url
        log(f"Drive upload failed: {resp.status_code}")
        return None
    except Exception as e:
        log(f"Drive exception: {e}")
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

        creds = Credentials(
            token=None,
            refresh_token=YOUTUBE_REFRESH_TOKEN,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=YOUTUBE_CLIENT_ID,
            client_secret=YOUTUBE_CLIENT_SECRET
        )
        youtube = build("youtube", "v3", credentials=creds)
        tags = script_data.get("hashtags", [])[:30]
        body = {
            "snippet": {
                "title": script_data.get("yt_title",
                         script_data.get("title", "Trikal Vaani"))[:100],
                "description": script_data.get("yt_description", "")[:4900],
                "tags": tags,
                "categoryId": "22"
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False
            }
        }
        media = MediaFileUpload(
            str(video_path), chunksize=-1,
            resumable=True, mimetype="video/mp4"
        )
        request = youtube.videos().insert(
            part="snippet,status", body=body, media_body=media
        )
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                log(f"  YouTube {int(status.progress()*100)}%")
        video_id = response["id"]
        url = f"https://www.youtube.com/shorts/{video_id}"
        log(f"YouTube live: {url}")

        # ── Pinned comment ────────────────────────────────────
        pinned = script_data.get("caption", "")
        if not pinned:
            pinned = (
                "🔮 Trikal Vaani — AI-powered Vedic Astrology\n"
                "Free Kundali, Kundali Milan & Life Predictions\n"
                "👉 trikalvaani.com\n"
                "#VedicAstrology #FreeKundali #TrikalVaani"
            )
        try:
            youtube.commentThreads().insert(
                part="snippet",
                body={
                    "snippet": {
                        "videoId": video_id,
                        "topLevelComment": {
                            "snippet": {
                                "textOriginal": pinned[:9000]
                            }
                        }
                    }
                }
            ).execute()
            log("  Pinned comment posted")
        except Exception as ce:
            log(f"  Pinned comment skipped: {ce}")
        # ─────────────────────────────────────────────────────

        return url
    except Exception as e:
        log(f"YouTube exception: {e}")
        return None


def cleanup_pro(slug: str):
    """Remove temp files for this slug."""
    patterns = [
        f"pro_tts_*.wav", f"pro_img_*.png",
        f"pro_clip_*.mp4", f"pro_concat_*.mp4",
        f"pro_concat_*.txt", f"pro_stitch_*.txt",
        f"{slug}_slides.mp4"
    ]
    for pat in patterns:
        for f in TEMP_DIR.glob(pat):
            f.unlink(missing_ok=True)


# =============================================================
# PIPELINE 1 — NATURAL FLOW
# Called by POST /pro/natural
# =============================================================
def run_natural(text: str, image_bytes_list: list,
                slug: str) -> dict:
    log(f"=== Pipeline 1: Natural Flow | slug={slug} ===")
    try:
        # Script
        raw = gemini_text(prompt_natural(text, len(image_bytes_list) or 5))
        script_data = extract_json(raw)
        log("Script generated")

        # Save uploaded images
        images = []
        for i, img_bytes in enumerate(image_bytes_list):
            p = TEMP_DIR / f"pro_img_{i}_{ts()}.png"
            p.write_bytes(img_bytes)
            images.append(p)

        # If no images uploaded, generate from scenes
        if not images:
            scenes = script_data.get("scenes", [])
            images = generate_images(scenes[:5])

        if not images:
            return {"success": False, "error": "No images available"}

        # TTS
        audio = generate_tts(script_data.get("voiceover", text[:200]))
        if not audio:
            return {"success": False, "error": "TTS failed"}

        # Render
        video = render_slides(images, audio, script_data, slug)
        if not video:
            return {"success": False, "error": "Video render failed"}

        # Upload
        yt_url = upload_to_youtube(video, script_data)
        drive_url = upload_to_drive(video, slug, script_data.get("title", ""))

        cleanup_pro(slug)
        return {
            "success": True,
            "pipeline": "natural",
            "slug": slug,
            "title": script_data.get("title", ""),
            "youtube_url": yt_url,
            "drive_url": drive_url,
            "caption": script_data.get("caption", ""),
            "hashtags": script_data.get("hashtags", []),
        }
    except Exception as e:
        log(f"Pipeline 1 error: {e}\n{traceback.format_exc()}")
        cleanup_pro(slug)
        return {"success": False, "error": str(e)[:300]}


# =============================================================
# PIPELINE 2 — AI VIDEO (Seedance / Wan)
# Called by POST /pro/ai-video
# NOTE: Seedance/Wan hook clip is generated CLIENT-SIDE via
# their API and uploaded to this endpoint as bytes.
# =============================================================
def run_ai_video(text: str, hook_bytes: bytes,
                 image_bytes_list: list, slug: str) -> dict:
    log(f"=== Pipeline 2: AI Video | slug={slug} ===")
    try:
        # Script
        raw = gemini_text(prompt_ai_video(text, len(image_bytes_list) or 3))
        script_data = extract_json(raw)
        log("Script generated")

        # Save hook clip
        hook_path = TEMP_DIR / f"pro_hook_{slug}.mp4"
        hook_path.write_bytes(hook_bytes)
        log(f"Hook clip saved: {hook_path.name} ({len(hook_bytes)//1024} KB)")

        # Save/generate images
        images = []
        for i, img_bytes in enumerate(image_bytes_list):
            p = TEMP_DIR / f"pro_img_{i}_{ts()}.png"
            p.write_bytes(img_bytes)
            images.append(p)

        if not images:
            scenes = script_data.get("scenes", [])
            images = generate_images(scenes[:5])

        if not images:
            return {"success": False, "error": "No slide images"}

        # TTS
        audio = generate_tts(script_data.get("voiceover", ""))
        if not audio:
            return {"success": False, "error": "TTS failed"}

        # Render slides (shorter — hook takes first 10s)
        slides = render_slides(images, audio, script_data, slug)
        if not slides:
            return {"success": False, "error": "Slides render failed"}

        # Stitch hook + slides
        video = stitch_hook_and_slides(hook_path, slides, slug)
        if not video:
            return {"success": False, "error": "Stitch failed"}

        # Upload
        yt_url = upload_to_youtube(video, script_data)
        drive_url = upload_to_drive(video, slug, script_data.get("title", ""))

        cleanup_pro(slug)
        return {
            "success": True,
            "pipeline": "ai_video",
            "slug": slug,
            "title": script_data.get("title", ""),
            "youtube_url": yt_url,
            "drive_url": drive_url,
            "caption": script_data.get("caption", ""),
            "hashtags": script_data.get("hashtags", []),
        }
    except Exception as e:
        log(f"Pipeline 2 error: {e}\n{traceback.format_exc()}")
        cleanup_pro(slug)
        return {"success": False, "error": str(e)[:300]}


# =============================================================
# PIPELINE 3a — FLOW PROMPT GENERATION
# Called by POST /pro/flow-prompt
# Returns the Flow prompt only — no video generation yet.
# =============================================================
def run_flow_prompt(text: str) -> dict:
    log("=== Pipeline 3a: Flow Prompt Generation ===")
    try:
        raw = gemini_text(prompt_flow_step1(text), temperature=0.7)
        data = extract_json(raw)
        flow_prompt = data.get("flow_prompt", "")
        topic = data.get("topic_summary", "")
        log(f"Flow prompt: {flow_prompt}")
        return {
            "success": True,
            "flow_prompt": flow_prompt,
            "topic_summary": topic,
            "instructions": (
                "1. Open Google Flow (flow.google.com)\n"
                "2. Set resolution to 720p, duration 10 seconds\n"
                "3. Paste the flow_prompt above\n"
                "4. Generate and download the MP4\n"
                "5. Come back and use /pro/flow-stitch with your video"
            )
        }
    except Exception as e:
        log(f"Pipeline 3a error: {e}")
        return {"success": False, "error": str(e)[:300]}


# =============================================================
# PIPELINE 3b — FLOW STITCH
# Called by POST /pro/flow-stitch
# Receives the Flow video, analyses it, generates matched
# content, stitches, uploads.
# =============================================================
def run_flow_stitch(text: str, flow_video_bytes: bytes,
                    image_bytes_list: list, slug: str) -> dict:
    log(f"=== Pipeline 3b: Flow Stitch | slug={slug} ===")
    try:
        # Step 1: Analyse the Flow video
        video_description = gemini_analyse_video(flow_video_bytes)

        # Step 2: Generate matched content
        raw = gemini_text(
            prompt_flow_step2(text, len(image_bytes_list) or 3, video_description)
        )
        script_data = extract_json(raw)
        log("Matched script generated")

        # Save hook video
        hook_path = TEMP_DIR / f"pro_flow_{slug}.mp4"
        hook_path.write_bytes(flow_video_bytes)
        log(f"Flow hook saved: {hook_path.name} ({len(flow_video_bytes)//1024} KB)")

        # Save/generate images
        images = []
        for i, img_bytes in enumerate(image_bytes_list):
            p = TEMP_DIR / f"pro_img_{i}_{ts()}.png"
            p.write_bytes(img_bytes)
            images.append(p)

        if not images:
            scenes = script_data.get("scenes", [])
            images = generate_images(scenes[:5])

        if not images:
            return {"success": False, "error": "No slide images"}

        # TTS
        audio = generate_tts(script_data.get("voiceover", ""))
        if not audio:
            return {"success": False, "error": "TTS failed"}

        # Render slides
        slides = render_slides(images, audio, script_data, slug)
        if not slides:
            return {"success": False, "error": "Slides render failed"}

        # Stitch Flow hook + slides
        video = stitch_hook_and_slides(hook_path, slides, slug)
        if not video:
            return {"success": False, "error": "Stitch failed"}

        # Upload
        yt_url = upload_to_youtube(video, script_data)
        drive_url = upload_to_drive(video, slug, script_data.get("title", ""))

        cleanup_pro(slug)
        return {
            "success": True,
            "pipeline": "flow_stitch",
            "slug": slug,
            "title": script_data.get("title", ""),
            "youtube_url": yt_url,
            "drive_url": drive_url,
            "video_description": video_description,
            "caption": script_data.get("caption", ""),
            "hashtags": script_data.get("hashtags", []),
        }
    except Exception as e:
        log(f"Pipeline 3b error: {e}\n{traceback.format_exc()}")
        cleanup_pro(slug)
        return {"success": False, "error": str(e)[:300]}

# =============================================================
# CAPTION KIT — for manual Instagram/Facebook/WhatsApp posting
# Added post v1.0 to support manual social posting workflow
# =============================================================
def build_pro_caption_kit(script_data: dict, slug: str, pipeline: str) -> str:
    title = script_data.get("title", "")
    caption = script_data.get("caption", "")
    hashtags = " ".join(["#" + h for h in script_data.get("hashtags", [])[:25]])
    yt_desc = script_data.get("yt_description", "")

    kit = f"""
=====================================
TRIKAL VAANI — PRO CAPTION KIT
Pipeline: {pipeline.upper()}
Slug: {slug}
Generated: {today_ist()}
=====================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 INSTAGRAM CAPTION
(Post → auto-pushes to Facebook + Threads)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{caption}

.
.
.
{hashtags}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📘 FACEBOOK CAPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{caption}

{hashtags[:200]}

Free Kundali: https://trikalvaani.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 WHATSAPP BROADCAST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{caption[:200]}

trikalvaani.com 🙏

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 YOUTUBE DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{yt_desc}

=====================================
Jai Trikal Vaani 🙏
trikalvaani.com
=====================================
"""
    return kit

def upload_caption_to_drive(caption_text: str, slug: str, title: str) -> Optional[str]:
    """Upload caption kit TXT to Drive."""
    log("Uploading caption kit to Drive...")
    token = get_drive_token()
    if not token:
        return None
    try:
        kit_bytes = caption_text.encode('utf-8')
        metadata = {
            "name": f"{slug}_CAPTIONS.txt",
            "parents": [DRIVE_FOLDER_ID],
            "description": f"Caption kit — {title}"
        }
        boundary = "trikal_caption_boundary"
        body = (
            f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"
            f"{json.dumps(metadata)}\r\n"
            f"--{boundary}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n"
        ).encode() + kit_bytes + f"\r\n--{boundary}--".encode()

        resp = requests.post(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": f"multipart/related; boundary={boundary}"
            },
            data=body, timeout=60
        )
        if resp.status_code in [200, 201]:
            file_id = resp.json().get("id")
            url = f"https://drive.google.com/file/d/{file_id}/view"
            log(f"Caption kit on Drive: {url}")
            return url
        log(f"Caption upload failed: {resp.status_code}")
        return None
    except Exception as e:
        log(f"Caption upload exception: {e}")
        return None
