#!/usr/bin/env python3
import os, json, time, random, requests, subprocess, base64, re
from datetime import datetime, timezone, timedelta
from pathlib import Path

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY", "")
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


def safe_text(t):
    """Remove all FFmpeg-breaking characters from text."""
    t = str(t)
    for ch in ["'", '"', ":", "{", "}", "[", "]", "\\", "%", "$", "!", "?"]:
        t = t.replace(ch, "")
    t = t.replace(",", " ")
    return t.strip()


def extract_json(text):
    """Robustly extract JSON from Gemini response."""
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


def fetch_upcoming_festivals():
    """Get upcoming festivals from panchang API or use hardcoded list."""
    log("Fetching upcoming festivals...")
    # Hardcoded upcoming festivals as fallback (always fresh)
    festivals = [
        {"name": "Shani Jayanti", "date": "2026-05-16", "days_left": 1},
        {"name": "Vat Savitri Vrat", "date": "2026-05-27", "days_left": 12},
        {"name": "Ganga Dussehra", "date": "2026-06-01", "days_left": 17},
    ]
    try:
        resp = requests.get(f"{SITE_URL}/api/panchang/today", timeout=15)
        data = resp.json()
        # Extract clean panchang fields
        tithi = data.get("tithi", {})
        if isinstance(tithi, dict):
            tithi_name = f"{tithi.get('name','')} {tithi.get('paksha','')}"
        else:
            tithi_name = str(tithi)
        nakshatra = data.get("nakshatra", {})
        if isinstance(nakshatra, dict):
            nakshatra_name = nakshatra.get("name", "")
        else:
            nakshatra_name = str(nakshatra)
        yoga = data.get("yoga", {})
        if isinstance(yoga, dict):
            yoga_name = yoga.get("name", "")
        else:
            yoga_name = str(yoga)
        panchang_clean = {
            "tithi": tithi_name,
            "nakshatra": nakshatra_name,
            "yoga": yoga_name,
            "rahu_kaal": data.get("rahu_kaal", ""),
            "sunrise": data.get("sunrise", ""),
        }
        return festivals, panchang_clean
    except Exception as e:
        log(f"Panchang fetch failed: {e}")
        return festivals, {"tithi": "Chaturdashi Krishna Paksha", "nakshatra": "Ashwini", "yoga": "Ayushman", "rahu_kaal": "10:34-12:14", "sunrise": "05:34"}


def generate_script(festivals, panchang):
    log("Generating festival script via Gemini Flash...")
    fest_list = "\n".join([f"- {f['name']} ({f['date']}, {f['days_left']} din baad)" for f in festivals])
    prompt = f"""You are Rohiit Gupta, Chief Vedic Architect at Trikal Vaani (trikalvaani.com).
Create a SHORT engaging Hindi-English video script about upcoming festivals.

Today Panchang:
- Tithi: {panchang['tithi']}
- Nakshatra: {panchang['nakshatra']}
- Yoga: {panchang['yoga']}
- Rahu Kaal: {panchang['rahu_kaal']}

Upcoming Festivals:
{fest_list}

Rules:
- Focus on the nearest festival: {festivals[0]['name']} in {festivals[0]['days_left']} day
- Hindi lines: simple, spiritual, max 7 words each
- English lines: conversational, max 8 words each
- TTS script: 40-50 second warm Hindi narration about this festival and its Vedic significance
- End with: Trikal Vaani par apni kundali dekhein
- pexels_query: 3-4 english words for relevant stock video

IMPORTANT: Output ONLY raw JSON, no markdown, no explanation.
{{"hindi_lines":["line1","line2","line3","line4"],"english_lines":["line1","line2","line3","line4"],"tts_script":"full hindi narration here","pexels_query":"festival celebration india spiritual","video_title":"festival name hindi short"}}"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 1500, "temperature": 0.7}
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


def fetch_pexels(query, count=3):
    log(f"Fetching Pexels: {query}")
    headers = {"Authorization": PEXELS_API_KEY.strip()}
    try:
        resp = requests.get(
            f"https://api.pexels.com/videos/search?query={query}&per_page=10&orientation=portrait",
            headers=headers, timeout=15
        )
        videos = resp.json().get("videos", [])
        if not videos:
            resp = requests.get(
                "https://api.pexels.com/videos/search?query=temple+india+spiritual&per_page=10&orientation=portrait",
                headers=headers, timeout=15
            )
            videos = resp.json().get("videos", [])
        random.shuffle(videos)
        clips = []
        for video in videos[:count*2]:
            files = video.get("video_files", [])
            portrait = [f for f in files if f.get("width", 0) < f.get("height", 1)]
            best = portrait or files
            if not best: continue
            clip_path = TEMP_DIR / f"clip_{video['id']}.mp4"
            if not clip_path.exists():
                r = requests.get(best[0]["link"], timeout=60, stream=True)
                with open(clip_path, "wb") as f:
                    for chunk in r.iter_content(8192): f.write(chunk)
            clips.append(clip_path)
            if len(clips) >= count: break
        log(f"Got {len(clips)} clips")
        return clips
    except Exception as e:
        log(f"Pexels failed: {e}")
        return []


def render_video(clips, audio_path, script, festivals):
    log("Rendering with FFmpeg...")
    output_path = OUTPUT_DIR / f"trikal_festival_{today_ist()}.mp4"
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(audio_path)],
            capture_output=True, text=True
        )
        audio_dur = float(json.loads(result.stdout)["format"]["duration"])
    except:
        audio_dur = 50.0

    clip_dur = audio_dur / max(len(clips), 1)
    processed = []
    for i, clip in enumerate(clips):
        out = TEMP_DIR / f"proc_{i}.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-i", str(clip), "-ss", "2", "-t", str(clip_dur),
            "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-an", str(out)
        ], capture_output=True)
        if out.exists(): processed.append(out)

    if not processed: return None

    concat_file = TEMP_DIR / "concat.txt"
    concat_file.write_text("\n".join([f"file '{p}'" for p in processed]))
    concat_out = TEMP_DIR / "concat.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_file), "-c", "copy", str(concat_out)
    ], capture_output=True)

    hindi = [safe_text(l) for l in script.get("hindi_lines", [])]
    english = [safe_text(l) for l in script.get("english_lines", [])]
    fest_name = safe_text(festivals[0]["name"])
    days_left = str(festivals[0]["days_left"])

    fh = str(FONT_HINDI) if FONT_HINDI.exists() else ""
    fe = str(FONT_ENG) if FONT_ENG.exists() else ""
    fh_opt = f":fontfile='{fh}'" if fh else ""
    fe_opt = f":fontfile='{fe}'" if fe else ""

    filters = ["colorchannelmixer=rr=0.4:gg=0.4:bb=0.4"]

    # Top branding
    filters.append(f"drawtext=text='TrikalVaani.com':fontsize=30:fontcolor=gold:x=(w-text_w)/2:y=50{fe_opt}")

    # Festival countdown box
    filters.append(f"drawtext=text='{fest_name}':fontsize=56:fontcolor=white:x=(w-text_w)/2:y=200:shadowcolor=black:shadowx=3:shadowy=3{fh_opt}")
    filters.append(f"drawtext=text='{days_left} Din Baad':fontsize=40:fontcolor=orange:x=(w-text_w)/2:y=280{fe_opt}")

    # Hindi lines
    for i, (line, y) in enumerate(zip(hindi, [400, 490, 580, 670])):
        filters.append(f"drawtext=text='{line}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y={y}:enable='gte(t,{i*8})':shadowcolor=black:shadowx=2:shadowy=2{fh_opt}")

    # English lines
    for i, (line, y) in enumerate(zip(english, [750, 820, 890, 960])):
        filters.append(f"drawtext=text='{line}':fontsize=32:fontcolor=lightyellow:x=(w-text_w)/2:y={y}:enable='gte(t,{i*8})':shadowcolor=black:shadowx=1:shadowy=1{fe_opt}")

    # Bottom credit
    filters.append(f"drawtext=text='Rohiit Gupta - Chief Vedic Architect':fontsize=24:fontcolor=gold:x=(w-text_w)/2:y=h-80{fe_opt}")

    vf = ",".join(filters)

    if LOGO_PATH.exists():
        fc = f"[0:v]{vf}[txt];[txt][1:v]overlay=W-w-20:20:alpha=0.85[out]"
        cmd = ["ffmpeg", "-y", "-i", str(concat_out), "-i", str(LOGO_PATH), "-i", str(audio_path),
               "-filter_complex", fc, "-map", "[out]", "-map", "2:a",
               "-c:v", "libx264", "-preset", "fast", "-crf", "22",
               "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
               "-movflags", "+faststart", str(output_path)]
    else:
        cmd = ["ffmpeg", "-y", "-i", str(concat_out), "-i", str(audio_path),
               "-vf", vf, "-map", "0:v", "-map", "1:a",
               "-c:v", "libx264", "-preset", "fast", "-crf", "22",
               "-c:a", "aac", "-b:a", "128k", "-t", str(audio_dur),
               "-movflags", "+faststart", str(output_path)]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if output_path.exists():
        log(f"Video ready: {output_path} ({output_path.stat().st_size/1024/1024:.1f} MB)")
        return output_path
    log(f"FFmpeg error: {res.stderr[-500:]}")
    return None


def log_supabase(script, video_path, success):
    if not SUPABASE_URL: return
    try:
        requests.post(
            f"{SUPABASE_URL}/rest/v1/content_generation_log",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"},
            json={"date": today_ist(), "tithi": "festival_video", "video_title": script.get("video_title", "") if script else "", "video_path": str(video_path) if video_path else None, "status": "success" if success else "failed"},
            timeout=10
        )
        log("Logged to Supabase")
    except: pass


def cleanup():
    for f in list(TEMP_DIR.glob("proc_*.mp4")) + list(TEMP_DIR.glob("concat*")) + list(TEMP_DIR.glob("tts_*.mp3")):
        f.unlink(missing_ok=True)


def main():
    log("=" * 50)
    log("TRIKAL VAANI CONTENT ENGINE v2.0")
    log("=" * 50)

    festivals, panchang = fetch_upcoming_festivals()
    log(f"Next festival: {festivals[0]['name']} in {festivals[0]['days_left']} days")

    script = generate_script(festivals, panchang)
    if not script: return

    audio = generate_tts(script.get("tts_script", ""))
    if not audio: return

    clips = fetch_pexels(script.get("pexels_query", "indian festival celebration temple"), count=3)
    if not clips: return

    video = render_video(clips, audio, script, festivals)
    log_supabase(script, video, video is not None)
    cleanup()

    if video: log(f"SUCCESS: {video}")
    else: log("FAILED - check logs")


if __name__ == "__main__":
    main()
