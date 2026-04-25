Trikal Vaani — Swiss Ephemeris API: Deployment Guide
Stack: Python 3.11 · FastAPI · pyswisseph · Render  
Author: Rohiit Gupta, Chief Vedic Architect
---
Architecture
```
trikalvaani.com (Vercel / Next.js)
        │
        │  POST /api/kundali  (server-side proxy)
        ▼
trikal-vaani-ephemeris.onrender.com  (FastAPI / pyswisseph)
        │
        │  Swiss Ephemeris files (.se1)
        ▼
/app/ephe_data/*.se1  (downloaded at build time)
```
---
Step 1 — Push to GitHub
```bash
# In your TrikalVaani repo root:
mkdir -p services/ephemeris
cp -r /path/to/trikal-ephemeris/* services/ephemeris/

git add services/ephemeris/
git commit -m "feat: Swiss Ephemeris FastAPI service — replaces Prokerala"
git push origin main
```
---
Step 2 — Deploy on Render
Go to render.com → New Web Service
Connect repo: `vaanitrikal-Dev/TrikalVaani`
Root Directory: `services/ephemeris`
Runtime: Python 3
Build Command:
```
   pip install -r requirements.txt && python download_ephe.py
   ```
Start Command:
```
   gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
   ```
Environment Variables (set in Render Dashboard):
```
   TRIKAL_API_KEY   = <generate a strong secret>
   EPHE_PATH        = /app/ephe_data
   ALLOWED_ORIGINS  = https://trikalvaani.com,https://www.trikalvaani.com
   ```
Plan: Starter ($7/mo) — upgrade to Standard if 2 workers aren't enough
Health Check Path: `/health`
> ⚠️ Render free tier sleeps after 15 min inactivity — use Starter plan for production.
---
Step 3 — Configure Vercel
In Vercel Dashboard → Project Settings → Environment Variables:
```
EPHE_API_URL    = https://trikal-vaani-ephemeris.onrender.com
EPHE_API_KEY    = <same key as TRIKAL_API_KEY above>
```
---
Step 4 — Remove Prokerala
Search your Next.js codebase for Prokerala references:
```bash
grep -r "prokerala" . --include="*.ts" --include="*.tsx" -l
```
Replace all API calls using the new `lib/ephemeris.ts` functions:
Old Prokerala Endpoint	New Function
`/astrology/kundali`	`getKundali()`
`/astrology/kundali-matching`	`getKundaliMatching()`
`/astrology/dasha`	`getDasha()`
`/astrology/nakshatra`	`getNakshatra()`
`/astrology/sade-sati`	`getSadeSati()`
`/astrology/manglik-dosh`	`getManglikDosh()`
`/astrology/lagna`	`getLagna()`
`/astrology/rashi`	`getRashi()`
---
Step 5 — Verify
```bash
# Health check
curl https://trikal-vaani-ephemeris.onrender.com/health

# Test kundali (IST example)
curl -X POST https://trikal-vaani-ephemeris.onrender.com/kundali \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_KEY" \
  -d '{
    "year": 1985, "month": 6, "day": 15,
    "hour": 8, "minute": 30, "second": 0,
    "latitude": 28.6139, "longitude": 77.2090,
    "timezone": 5.5, "ayanamsa": "lahiri"
  }'
```
---
Ephemeris Files
Downloaded automatically at build time from `astro.com/ftp/swisseph/ephe/`.  
Files cover 1800–2400 CE — sufficient for all charts.
If Render build fails to download (network policy), pre-download and commit to repo:
```bash
python download_ephe.py
git add ephe_data/
git commit -m "chore: add Swiss Ephemeris data files"
```
---
BirthForm — 11 Domain IDs
All `htmlFor` ↔ `id` pairs are corrected in `components/BirthForm.tsx`:
#	ID	Field
01	`tv-name`	Full Name
02	`tv-dob`	Date of Birth
03	`tv-tob`	Time of Birth
04	`tv-gender`	Gender
05	`tv-place`	Place of Birth
06	`tv-city`	City (hidden)
07	`tv-latitude`	Latitude
08	`tv-longitude`	Longitude
09	`tv-timezone`	Timezone
10	`tv-ayanamsa`	Ayanamsa
11	`tv-unknown-time`	Unknown Time
