#!/usr/bin/env python3
"""
TRIKAL VAANI - Content Engine v3.0
=====================================
Pipeline:
  Festival data → Gemini Flash script → Gemini TTS audio
  → Nano Banana 2 (gemini-3.1-flash-image-preview) 5 images
  → FFmpeg Ken Burns effect → 60-sec MP4 Reel (1080x1920)
=====================================
"""

import os, json, time, random, requests, subprocess, base64, re
from datetime import datetime, timezone, timedelta
from pathlib import Path

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
SUPABASE_URL   = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY   = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SITE_URL       = "https://trikalvaani.com"

BASE_DIR   = Path("/home/vaanitrikal/trikal-vaani/content-engine")
TEMP_DIR   = BASE_DIR / "temp"
OUTPUT_DIR = BASE_DIR / "output"
ASSETS_DIR = BASE_DIR / "assets"
LOGO_PATH  = ASSETS_DIR / "logo.png"
FONT_HINDI = ASSETS_DIR / "NotoSansDevanagari-Bold.ttf"
FONT_ENG   = ASSETS_DIR / "NotoSans-Bold.ttf"

for d in [TEMP_DIR, OUTPUT_DIR, ASSETS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

IST = timezone(timedelta(hours=5, minutes=30))
def today_ist(): return datetime.now(IST).strftime("%Y-%m-%d")
def log(msg): print(f"[{datetime.now(IST).strftime('%H:%M:%S')}] {msg}")


# Festival database
FESTIVALS = [
    {"name": "Shani Jayanti", "date": "2026-05-16", "days_left": 1,
     "deity": "Shani Dev",
     "theme": "Saturn ringed planet glowing blue cosmic, ancient Shani temple at twilight, justice and karma symbolism, dramatic moody lighting"},
    {"name": "Vat Savitri Vrat", "date": "2026-05-27", "days_left": 12,
     "deity": "Maa Savitri",
     "theme": "Massive sacred banyan tree, married Hindu woman in traditional red saree praying, golden hour devotion, spiritual atmosphere"},
    {"name": "Ganga Dussehra", "date": "2026-06-01", "days_left": 17,
     "deity": "Maa Ganga",
     "theme": "Holy Ganga river at Haridwar, evening aarti with diyas floating, glowing sunset, sacred spiritual cinematic"},
]


def safe_text(t):
    t = str(t)
    for ch in ["'", '"', ":", "{", "}", "[", "]", "\\", "%", "$", "!", "?"]:
        t = t.replace(ch, "")
    t = t.replace(",", " ")
    return t.strip()


def extract_json(text):
    text = re.sub(r'```json', '', text)
    text = re.sub(r'```', '', text)
    last_start = text.rfind('{"')
    if last_start == -1:
        last_start = text.rfind('{')
    if last_start == -1:
        raise ValueError("No JSON object found")
    last_end = text.rfind('}')
    if last_end <= last_start:
        raise ValueError("Malformed JSON")
    return json.loads(text[last_start:last_end+1])


# ────────────────────────────────────────────────────
# STEP 1: Generate Script (Hindi + English + TTS + Image Prompts)
# ────────────────────────────────────────────────────
def generate_script(festival):
    log(f"Generating script for {festival['name']}...")
    prompt = f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com).
Create a viral Instagram Reel script about {festival['name']} ({festival['days_left']} days away).

Deity: {festival['deity']}
Visual theme: {festival['theme']}

Output ONLY raw JSON in this structure (no markdown, no explanation):
{{
  "hindi_lines": ["Hook hindi max 6 words", "Line 2 max 6 words", "Line 3 max 6 words", "Line 4 closing max 6 words"],
  "english_lines": ["Hook english max 7 words", "Line 2 max 7 words", "Line 3 max 7 words", "Line 4 closing max 7 words"],
  "tts_script": "45-50 second warm Hindi narration explaining {festival['name']} significance, what to do, what to avoid, blessings. End with: Trikal Vaani par apni kundali dekhein",
  "image_prompts": [
    "Cinematic photoreal image prompt 1 for hook scene - {festival['theme']}",
    "Image prompt 2 deity-focused {festival['deity']}",
    "Image prompt 3 ritual or puja scene",
    "Image prompt 4 devotee praying or offering",
    "Image prompt 5 blessings or aftermath glowing"
  ],
  "video_title": "Hindi title max 6 words"
}}

Rules:
- Hindi lines must be in pure Devanagari script
- All image_prompts must include: 9:16 portrait, photorealistic, cinematic, no text, no watermark, no people facing camera unless deity
- Make image prompts visually distinct from each other"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "maxOutputTokens": 4000,
            "temperature": 0.8,
            "responseMimeType": "application/json",
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }
    try:
        resp = requests.post(url, json=payload, timeout=30)
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        log(f"Raw preview: {repr(text[:150])}")
        result = extract_json(text)
        log("Script generated OK")
        return result
    except Exception as e:
        log(f"Script failed: {e}")
        return None


# ────────────────────────────────────────────────────
# STEP 2: Generate TTS Audio
# ────────────────────────────────────────────────────
def generate_tts(tts_script):
    log("Generating TTS via Gemini Charon...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": tts_script}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "Charon"}}}
        }
    }
    try:
        resp = requests.post(url, json=payload, timeout=60)
        audio_b64 = resp.json()["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
        audio_path = TEMP_DIR / f"tts_{int(time.time())}.mp3"
        audio_path.write_bytes(base64.b64decode(audio_b64))
        log(f"TTS saved: {audio_path.name}")
        return audio_path
    except Exception as e:
        log(f"TTS failed: {e}")
        return None


# ────────────────────────────────────────────────────
# STEP 3: Generate Images via Nano Banana 2
# ────────────────────────────────────────────────────
def generate_image(prompt, idx):
    log(f"Generating image {idx+1} via Nano Banana 2...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key={GEMINI_API_KEY}"
    full_prompt = f"{prompt}, 9:16 portrait aspect ratio, photorealistic, cinematic lighting, no text, no watermark, no logo, vertical composition"
    payload = {
        "contents": [{"parts": [{"text": full_prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]}
    }
    try:
        resp = requests.post(url, json=payload, timeout=90)
        data = resp.json()
        if 'candidates' not in data:
            log(f"Image {idx+1} error: {data.get('error', 'unknown')}")
            return None
        for p in data['candidates'][0]['content']['parts']:
            if 'inlineData' in p:
                img_bytes = base64.b64decode(p['inlineData']['data'])
                img_path = TEMP_DIR / f"img_{idx}_{int(time.time())}.png"
                img_path.write_bytes(img_bytes)
                log(f"Image {idx+1} saved: {img_path.name} ({len(img_bytes)/1024:.0f} KB)")
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
        time.sleep(2)  # rate limit safety
    log(f"Generated {len(images)} images total")
    return images


# ────────────────────────────────────────────────────
# STEP 4: Render Video with Ken Burns Effect
# ────────────────────────────────────────────────────
def render_video(images, audio_path, script, festival):
    log("Rendering video with FFmpeg Ken Burns...")
    output_path = OUTPUT_DIR / f"trikal_{festival['name'].replace(' ','_').lower()}_{today_ist()}.mp4"

    # Get audio duration
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(audio_path)],
            capture_output=True, text=True
        )
        audio_dur = float(json.loads(result.stdout)["format"]["duration"])
    except:
        audio_dur = 50.0

    log(f"Audio duration: {audio_dur:.1f}s, {len(images)} images")
    img_dur = audio_dur / len(images)

    # Process each image with Ken Burns (slow zoom)
    processed = []
    for i, img in enumerate(images):
        out = TEMP_DIR / f"kb_{i}.mp4"
        # Alternate zoom in / zoom out for variety
        if i % 2 == 0:
            zoom = "zoompan=z='min(zoom+0.0015,1.3)':d=125*{}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25".format(int(img_dur))
        else:
            zoom = "zoompan=z='if(lte(zoom,1.0),1.3,max(1.001,zoom-0.0015))':d=125*{}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25".format(int(img_dur))

        subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(img),
            "-vf", f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,{zoom}",
            "-t", str(img_dur), "-c:v", "libx264", "-preset", "fast",
            "-crf", "20", "-pix_fmt", "yuv420p", "-r", "25", str(out)
        ], capture_output=True)
        if out.exists() and out.stat().st_size > 1000:
            processed.append(out)
            log(f"Ken Burns clip {i+1}/{len(images)} ready")

    if not processed:
        log("No processed clips")
        return None

    # Concatenate
    concat_file = TEMP_DIR / "concat.txt"
    concat_file.write_text("\n".join([f"file '{p}'" for p in processed]))
    concat_out = TEMP_DIR / "concat.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(concat_out)
    ], capture_output=True)

    # Add text overlays + audio
    hindi = [safe_text(l) for l in script.get("hindi_lines", [])]
    english = [safe_text(l) for l in script.get("english_lines", [])]
    fest_name = safe_text(festival["name"])
    days_left = str(festival["days_left"])

    fh = str(FONT_HINDI) if FONT_HINDI.exists() else ""
    fe = str(FONT_ENG) if FONT_ENG.exists() else ""
    fh_opt = f":fontfile='{fh}'" if fh else ""
    fe_opt = f":fontfile='{fe}'" if fe else ""

    filters = []
    # Bottom gradient overlay for text readability
    filters.append("drawbox=x=0:y=h-500:w=iw:h=500:color=black@0.5:t=fill")

    # Top brand
    filters.append(f"drawtext=text='TrikalVaani.com':fontsize=36:fontcolor=gold:x=(w-text_w)/2:y=70:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}")

    # Festival name + countdown
    filters.append(f"drawtext=text='{fest_name}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=160:shadowcolor=black:shadowx=3:shadowy=3{fh_opt}")
    filters.append(f"drawtext=text='{days_left} Din Baad':fontsize=42:fontcolor=orange:x=(w-text_w)/2:y=240:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}")

    # Hindi lines staggered timing
    line_time = audio_dur / max(len(hindi)+1, 1)
    for i, line in enumerate(hindi):
        y_pos = 1500 + (i * 70)
        start_t = i * line_time
        filters.append(f"drawtext=text='{line}':fontsize=46:fontcolor=white:x=(w-text_w)/2:y={y_pos}:enable='gte(t,{start_t:.1f})':shadowcolor=black:shadowx=2:shadowy=2{fh_opt}")

    # Bottom credit
    filters.append(f"drawtext=text='Rohiit Gupta - Chief Vedic Architect':fontsize=26:fontcolor=gold:x=(w-text_w)/2:y=h-50:shadowcolor=black:shadowx=2:shadowy=2{fe_opt}")

    vf = ",".join(filters)

    if LOGO_PATH.exists():
        fc = f"[0:v]{vf}[txt];[txt][1:v]overlay=W-w-30:30:alpha=0.9[out]"
        cmd = ["ffmpeg", "-y", "-i", str(concat_out), "-i", str(LOGO_PATH), "-i", str(audio_path),
               "-filter_complex", fc, "-map", "[out]", "-map", "2:a",
               "-c:v", "libx264", "-preset", "fast", "-crf", "21",
               "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
               "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)]
    else:
        cmd = ["ffmpeg", "-y", "-i", str(concat_out), "-i", str(audio_path),
               "-vf", vf, "-map", "0:v", "-map", "1:a",
               "-c:v", "libx264", "-preset", "fast", "-crf", "21",
               "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
               "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(output_path)]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if output_path.exists() and output_path.stat().st_size > 10000:
        log(f"Video ready: {output_path.name} ({output_path.stat().st_size/1024/1024:.1f} MB)")
        return output_path
    log(f"FFmpeg error: {res.stderr[-500:]}")
    return None


# ────────────────────────────────────────────────────
# STEP 5: Log to Supabase
# ────────────────────────────────────────────────────
def log_supabase(script, video_path, festival, success):
    if not SUPABASE_URL: return
    try:
        requests.post(
            f"{SUPABASE_URL}/rest/v1/content_generation_log",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"},
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
    except: pass


def cleanup():
    for f in list(TEMP_DIR.glob("*.mp4")) + list(TEMP_DIR.glob("*.txt")) + list(TEMP_DIR.glob("img_*.png")) + list(TEMP_DIR.glob("tts_*.mp3")):
        f.unlink(missing_ok=True)


# ────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────
def main():
    log("=" * 50)
    log("TRIKAL VAANI CONTENT ENGINE v3.0 - NANO BANANA 2")
    log("=" * 50)

    # Pick nearest festival
    festival = FESTIVALS[0]
    log(f"Target festival: {festival['name']} in {festival['days_left']} days")

    # Generate script
    script = generate_script(festival)
    if not script:
        log("FAILED at script generation")
        return

    # Generate audio
    audio = generate_tts(script.get("tts_script", ""))
    if not audio:
        log("FAILED at TTS")
        return

    # Generate 5 images
    image_prompts = script.get("image_prompts", [])
    if len(image_prompts) < 3:
        log(f"Only {len(image_prompts)} prompts, need at least 3")
        return

    images = generate_all_images(image_prompts)
    if len(images) < 3:
        log(f"Only {len(images)} images generated, need at least 3")
        return

    # Render video
    video = render_video(images, audio, script, festival)
    log_supabase(script, video, festival, video is not None)
    cleanup()

    if video:
        log(f"✅ SUCCESS: {video}")
    else:
        log("❌ FAILED - check logs")


if __name__ == "__main__":
    main()
