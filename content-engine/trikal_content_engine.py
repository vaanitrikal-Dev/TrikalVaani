#!/usr/bin/env python3
# ============================================================
# TRIKAL VAANI — Content Engine v1.0
# GCP VM: /home/vaanitrikal/trikal-vaani/content-engine/
# Run: python3 trikal_content_engine.py
# Cron: 0 5 * * * (5:00 AM IST daily)
# ============================================================
# Pipeline:
# Panchang API → Gemini Flash summary → Gemini TTS audio
# → Pexels stock clips → FFmpeg render → MP4 output
# ============================================================

import os
import json
import time
import random
import requests
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ── ENV CONFIG ───────────────────────────────────────────────
GEMINI_API_KEY    = os.environ.get("GEMINI_API_KEY", "")
PEXELS_API_KEY    = os.environ.get("PEXELS_API_KEY", "")
SUPABASE_URL      = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY      = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SITE_URL          = "https://trikalvaani.com"

# ── PATHS ────────────────────────────────────────────────────
BASE_DIR    = Path("/home/vaanitrikal/trikal-vaani/content-engine")
TEMP_DIR    = BASE_DIR / "temp"
OUTPUT_DIR  = BASE_DIR / "output"
ASSETS_DIR  = BASE_DIR / "assets"
LOGO_PATH   = ASSETS_DIR / "logo.png"          # Upload your logo here
MUSIC_PATH  = ASSETS_DIR / "bg_music.mp3"      # Soft Sanskrit bg music
FONT_HINDI  = ASSETS_DIR / "NotoSansDevanagari-Bold.ttf"
FONT_ENG    = ASSETS_DIR / "NotoSans-Bold.ttf"

for d in [TEMP_DIR, OUTPUT_DIR, ASSETS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── IST TIMEZONE ─────────────────────────────────────────────
IST = timezone(timedelta(hours=5, minutes=30))

def today_ist():
    return datetime.now(IST).strftime("%Y-%m-%d")

def log(msg):
    print(f"[{datetime.now(IST).strftime('%H:%M:%S')}] {msg}")

# ── STEP 1: FETCH PANCHANG FROM TRIKAL VAANI API ─────────────
def fetch_panchang():
    log("Fetching today's panchang...")
    date = today_ist()
    url  = f"{SITE_URL}/api/panchang/today"
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        log(f"Panchang fetched: {data.get('tithi', 'Unknown tithi')}")
        return data
    except Exception as e:
        log(f"Panchang fetch failed: {e}")
        return None

# ── STEP 2: GEMINI FLASH — GENERATE BILINGUAL SCRIPT ─────────
def generate_script(panchang: dict) -> dict:
    log("Generating bilingual script via Gemini Flash...")

    tithi     = panchang.get("tithi", "")
    nakshatra = panchang.get("nakshatra", "")
    yoga      = panchang.get("yoga", "")
    date_str  = panchang.get("date", today_ist())
    festival  = panchang.get("festival", "")
    rahu_kaal = panchang.get("rahu_kaal", "")

    prompt = f"""
You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani.
Create a SHORT bilingual video script for today's panchang.

Today's Panchang ({date_str}):
- Tithi: {tithi}
- Nakshatra: {nakshatra}
- Yoga: {yoga}
- Festival: {festival if festival else 'Regular day'}
- Rahu Kaal: {rahu_kaal}

Output ONLY valid JSON in this exact format:
{{
  "hindi_lines": [
    "Line 1 in Hindi (max 8 words)",
    "Line 2 in Hindi (max 8 words)",
    "Line 3 in Hindi (max 8 words)",
    "Line 4 in Hindi (max 8 words)"
  ],
  "english_lines": [
    "Line 1 in English (max 10 words)",
    "Line 2 in English (max 10 words)",
    "Line 3 in English (max 10 words)",
    "Line 4 in English (max 10 words)"
  ],
  "tts_script": "Full 45-60 second Hindi narration for voice over. Conversational tone. Mention key tithi, nakshatra, and one practical advice.",
  "pexels_query": "One English search term for Pexels stock video (e.g. 'temple sunrise meditation' or 'stars galaxy night sky')",
  "video_title": "Short Hindi title for the video (max 6 words)"
}}
Output ONLY the JSON. No markdown, no explanation.
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 1000, "temperature": 0.7}
    }

    try:
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        text = text.strip().replace("```json", "").replace("```", "").strip()
        script = json.loads(text)
        log(f"Script generated: {script.get('video_title', '')}")
        return script
    except Exception as e:
        log(f"Script generation failed: {e}")
        return None

# ── STEP 3: GEMINI TTS — GENERATE HINDI VOICE AUDIO ──────────
def generate_tts_audio(tts_script: str) -> Path:
    log("Generating TTS audio via Gemini Charon...")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": tts_script}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {"voiceName": "Charon"}
                }
            }
        }
    }

    try:
        resp = requests.post(url, json=payload, timeout=60)
        resp.raise_for_status()
        audio_b64 = resp.json()["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
        import base64
        audio_bytes = base64.b64decode(audio_b64)
        audio_path = TEMP_DIR / f"tts_{int(time.time())}.mp3"
        audio_path.write_bytes(audio_bytes)
        log(f"TTS audio saved: {audio_path.name}")
        return audio_path
    except Exception as e:
        log(f"TTS generation failed: {e}")
        return None

# ── STEP 4: PEXELS — FETCH & DOWNLOAD STOCK VIDEO CLIPS ──────
def fetch_pexels_clips(query: str, count: int = 3) -> list[Path]:
    log(f"Fetching Pexels clips for: '{query}'...")

    headers = {"Authorization": PEXELS_API_KEY}
    url = f"https://api.pexels.com/videos/search?query={query}&per_page=10&orientation=portrait"

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
        videos = resp.json().get("videos", [])

        if not videos:
            log("No Pexels results, trying fallback query...")
            url = "https://api.pexels.com/videos/search?query=temple+india+spiritual&per_page=10&orientation=portrait"
            resp = requests.get(url, headers=headers, timeout=15)
            videos = resp.json().get("videos", [])

        # Pick best quality portrait clips
        clip_paths = []
        random.shuffle(videos)

        for video in videos[:count * 2]:
            files = video.get("video_files", [])
            # Find HD portrait file
            portrait_files = [
                f for f in files
                if f.get("width", 0) < f.get("height", 1)
                and f.get("quality") in ["hd", "sd"]
            ]
            if not portrait_files:
                portrait_files = files

            best = portrait_files[0] if portrait_files else None
            if not best:
                continue

            clip_url  = best["link"]
            clip_path = TEMP_DIR / f"clip_{video['id']}.mp4"

            if not clip_path.exists():
                log(f"Downloading clip {video['id']}...")
                r = requests.get(clip_url, timeout=60, stream=True)
                with open(clip_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)

            clip_paths.append(clip_path)
            if len(clip_paths) >= count:
                break

        log(f"Downloaded {len(clip_paths)} clips")
        return clip_paths

    except Exception as e:
        log(f"Pexels fetch failed: {e}")
        return []

# ── STEP 5: FFMPEG — RENDER FINAL VIDEO ──────────────────────
def render_video(
    clips: list[Path],
    audio_path: Path,
    script: dict,
    panchang: dict
) -> Path:
    log("Rendering final video with FFmpeg...")

    date_str    = today_ist()
    output_path = OUTPUT_DIR / f"trikal_panchang_{date_str}.mp4"

    hindi_lines   = script.get("hindi_lines", [])
    english_lines = script.get("english_lines", [])
    video_title   = script.get("video_title", "Aaj Ka Panchang")

    # ── 5a: Get audio duration ────────────────────────────────
    duration_cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", str(audio_path)
    ]
    try:
        result = subprocess.run(duration_cmd, capture_output=True, text=True)
        audio_duration = float(json.loads(result.stdout)["format"]["duration"])
        log(f"Audio duration: {audio_duration:.1f}s")
    except:
        audio_duration = 60.0

    clip_duration = audio_duration / max(len(clips), 1)

    # ── 5b: Trim + scale each clip to 1080x1920 ──────────────
    processed_clips = []
    for i, clip in enumerate(clips):
        out = TEMP_DIR / f"processed_{i}.mp4"
        cmd = [
            "ffmpeg", "-y", "-i", str(clip),
            "-ss", "2",
            "-t", str(clip_duration),
            "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-an", str(out)
        ]
        subprocess.run(cmd, capture_output=True)
        if out.exists():
            processed_clips.append(out)

    if not processed_clips:
        log("No processed clips — aborting")
        return None

    # ── 5c: Concatenate clips ─────────────────────────────────
    concat_list = TEMP_DIR / "concat.txt"
    with open(concat_list, "w") as f:
        for clip in processed_clips:
            f.write(f"file '{clip}'\n")

    concat_path = TEMP_DIR / "concat.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy", str(concat_path)
    ], capture_output=True)

    # ── 5d: Build drawtext filters ────────────────────────────
    # Dark overlay + text lines + branding

    filters = []

    # Dark overlay for readability
    filters.append("colorchannelmixer=rr=0.5:gg=0.5:bb=0.5")

    # Top brand bar
    filters.append(
        f"drawtext=text='TrikalVaani.com':fontsize=32:fontcolor=gold:"
        f"x=(w-text_w)/2:y=60:alpha=0.9"
    )

    # Hindi lines (center, staggered timing)
    y_positions = [320, 420, 520, 620]
    for i, (line, y) in enumerate(zip(hindi_lines, y_positions)):
        safe_line = line.replace("'", "\\'").replace(":", "\\:")
        start_t   = i * (audio_duration / 5)
        filters.append(
            f"drawtext=text='{safe_line}':"
            f"fontsize=52:fontcolor=white:"
            f"x=(w-text_w)/2:y={y}:"
            f"enable='gte(t,{start_t:.1f})':"
            f"shadowcolor=black:shadowx=2:shadowy=2"
        )

    # English lines (below Hindi, smaller)
    y_eng = [740, 810, 880, 950]
    for i, (line, y) in enumerate(zip(english_lines, y_eng)):
        safe_line = line.replace("'", "\\'").replace(":", "\\:")
        start_t   = i * (audio_duration / 5)
        filters.append(
            f"drawtext=text='{safe_line}':"
            f"fontsize=36:fontcolor=lightyellow:"
            f"x=(w-text_w)/2:y={y}:"
            f"enable='gte(t,{start_t:.1f})':"
            f"shadowcolor=black:shadowx=1:shadowy=1"
        )

    # Bottom branding
    tithi = panchang.get("tithi", "")
    filters.append(
        f"drawtext=text='Rohiit Gupta | Chief Vedic Architect':"
        f"fontsize=28:fontcolor=gold:x=(w-text_w)/2:y=h-120:alpha=0.85"
    )
    filters.append(
        f"drawtext=text='{tithi}':"
        f"fontsize=30:fontcolor=white:x=(w-text_w)/2:y=h-80:alpha=0.8"
    )

    vf_string = ",".join(filters)

    # ── 5e: Add logo if exists ────────────────────────────────
    if LOGO_PATH.exists():
        logo_overlay = (
            f"[0:v]{vf_string}[txt];"
            f"[txt][1:v]overlay=W-w-30:30:alpha=0.9[out]"
        )
        cmd_final = [
            "ffmpeg", "-y",
            "-i", str(concat_path),
            "-i", str(LOGO_PATH),
            "-i", str(audio_path),
            "-filter_complex", logo_overlay,
            "-map", "[out]", "-map", "2:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "22",
            "-c:a", "aac", "-b:a", "128k",
            "-t", str(audio_duration),
            "-movflags", "+faststart",
            str(output_path)
        ]
    else:
        cmd_final = [
            "ffmpeg", "-y",
            "-i", str(concat_path),
            "-i", str(audio_path),
            "-vf", vf_string,
            "-map", "0:v", "-map", "1:a",
            "-c:v", "libx264", "-preset", "fast", "-crf", "22",
            "-c:a", "aac", "-b:a", "128k",
            "-t", str(audio_duration),
            "-movflags", "+faststart",
            str(output_path)
        ]

    result = subprocess.run(cmd_final, capture_output=True, text=True)

    if output_path.exists():
        size_mb = output_path.stat().st_size / (1024 * 1024)
        log(f"Video rendered: {output_path.name} ({size_mb:.1f} MB)")
        return output_path
    else:
        log(f"FFmpeg error: {result.stderr[-500:]}")
        return None

# ── STEP 6: LOG TO SUPABASE ───────────────────────────────────
def log_to_supabase(panchang: dict, script: dict, video_path: Path, success: bool):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "date": today_ist(),
        "tithi": panchang.get("tithi", ""),
        "video_title": script.get("video_title", "") if script else "",
        "video_path": str(video_path) if video_path else None,
        "status": "success" if success else "failed",
        "created_at": datetime.now(IST).isoformat()
    }

    try:
        requests.post(
            f"{SUPABASE_URL}/rest/v1/content_generation_log",
            headers=headers,
            json=payload,
            timeout=10
        )
        log("Logged to Supabase")
    except Exception as e:
        log(f"Supabase log failed: {e}")

# ── STEP 7: CLEANUP TEMP FILES ────────────────────────────────
def cleanup():
    log("Cleaning temp files...")
    for f in TEMP_DIR.glob("*.mp4"):
        f.unlink(missing_ok=True)
    for f in TEMP_DIR.glob("*.txt"):
        f.unlink(missing_ok=True)
    log("Cleanup done")

# ── MAIN PIPELINE ─────────────────────────────────────────────
def main():
    log("=" * 50)
    log("TRIKAL VAANI CONTENT ENGINE — STARTING")
    log("=" * 50)

    # Step 1: Fetch panchang
    panchang = fetch_panchang()
    if not panchang:
        log("FATAL: Could not fetch panchang. Exiting.")
        return

    # Step 2: Generate script
    script = generate_script(panchang)
    if not script:
        log("FATAL: Script generation failed. Exiting.")
        return

    # Step 3: Generate TTS audio
    tts_script = script.get("tts_script", "")
    audio_path = generate_tts_audio(tts_script)
    if not audio_path:
        log("FATAL: TTS failed. Exiting.")
        return

    # Step 4: Fetch Pexels clips
    pexels_query = script.get("pexels_query", "temple sunrise india spiritual")
    clips = fetch_pexels_clips(pexels_query, count=3)
    if not clips:
        log("FATAL: No video clips fetched. Exiting.")
        return

    # Step 5: Render video
    video_path = render_video(clips, audio_path, script, panchang)

    # Step 6: Log result
    success = video_path is not None and video_path.exists()
    log_to_supabase(panchang, script, video_path, success)

    # Step 7: Cleanup
    cleanup()

    if success:
        log("=" * 50)
        log(f"SUCCESS: {video_path}")
        log("Next step: Push to Instagram + Facebook + WhatsApp")
        log("=" * 50)
    else:
        log("PIPELINE FAILED — check logs above")

if __name__ == "__main__":
    main()
