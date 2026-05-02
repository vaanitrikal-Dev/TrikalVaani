# TRIKAL VAANI — MASTER STATUS PROMPT
## New Chat Session Briefing | May 2, 2026
### CEO: Rohiit Gupta | Chief Vedic Architect | Delhi NCR

---

## PLATFORM IDENTITY
- **Platform:** Trikal Vaani (trikalvaani.com) — AI-powered Vedic Astrology Life Intelligence
- **Tagline:** "Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye."
- **AI Soul:** Jini
- **Competitors:** AstroTalk, AstroSage
- **Target:** Bharat mass market, affordable pricing
- **Launch Target:** 15 May 2026

---

## TECH STACK
- **Frontend:** Next.js 13.5, TypeScript, Tailwind, Vercel PRO ($20/mo)
- **Database:** Supabase Free
- **AI:** Gemini 2.5 Flash (primary) + Claude Haiku (polish)
- **Ephemeris:** Swiss Ephemeris on Render Hobby ($7/mo)
- **GitHub:** vaanitrikal-Dev/TrikalVaani
- **Pricing Tiers:** Free / ₹51 / ₹99 / ₹499

---

## CURRENT BUILD STATUS

### ✅ COMPLETED & WORKING
1. **Core prediction flow** — `/api/predict/route.ts v9.5`
   - Step 1: `/kundali` (Render Swiss Ephemeris)
   - Step 2: `adaptSwissToKundali()` with Shadbala preserved
   - Step 3: `/synthesize` (Bhrigu+Parashara+Panchang+Confidence)
   - Step 4: `buildPredictionPrompt()` — LOCKED, never touch
   - Step 5: Gemini 2.5 Flash with `responseMimeType: 'application/json'`
   - Step 6: JSON parse
   - Step 6.5: Claude Haiku polish (skipping — ANTHROPIC_API_KEY missing)
   - Step 7: Save to Supabase
   - Step 8: Return with predictionId + publicSlug + reportUrl

2. **SEO Slug System** — working yesterday
   - Format: `career-rahu-saturn-delhi-2026-x7k2m`
   - File: `lib/slug.ts` ✅
   - Redirect: `/report/[slug]` ✅

3. **Public SEO Report Pages**
   - `app/report/[slug]/page.tsx` ✅
   - `app/report/[slug]/ReportPublicClient.tsx` ✅
   - JSON-LD Schema (Article + FAQ + Person + Breadcrumb) ✅
   - Gated content with ₹51 unlock CTA ✅

4. **Supabase Migration** ✅
   - `public_slug`, `is_public`, `is_indexed`, `seo_title`, `seo_description`, `geo_answer`
   - `public_report_view` created ✅

5. **Google Indexing API** — wired, GOOGLE_INDEXING_KEY set in Vercel ✅
   - `lib/google-indexing.ts` ✅
   - Search Console owner permission pending (email not found error)

6. **Dynamic Sitemap** — `app/sitemap.ts` v2.0 includes report URLs ✅

7. **BirthForm v6.0** ✅
   - Dynamic country code selector (29 countries, flag + dial)
   - Dark dropdown fix
   - Loading messages: "Connecting with your energy..." → "Analyzing planetary positions..." → "Generating your personalized prediction..."
   - Redirects to `/report/[slug]` (new) with fallback to `/result/[uuid]`

8. **Keep-Alive Cron** ✅
   - `vercel.json` with `*/10 * * * *` schedule
   - `keep-alive/route.ts v2.0` pings both Render services + `/kundali` warm-up
   - Reduces cold start from 25s to 2-3s

9. **Shadbala** — real values showing (not all 50) ✅
10. **Parashara Yogas** with BPHS citations ✅
11. **Remedies** (Mantra/Dana/Vrat/Rudraksha/Ratna) ✅
12. **Dasha tab** with Combined Reading ✅
13. **Bhrigu Nandi Analysis** section ✅
14. **Panchang display** ✅
15. **ResultClient v4.0** — `isFree = false` (all tiers see full) ✅

---

## ❌ KNOWN ISSUES

### CRITICAL — Prediction failing today
**Error:** `JSON parse failed. Raw (300): { "geoDirectAnswer": ...`
**Root cause:** Gemini 2.5 Flash truncates response mid-JSON
**History:**
- Was working with `verifiedTier = 'premium'`, `MAX_TOKENS = 8192` — then broke
- Was working yesterday as `free` tier
- `MAX_TOKENS` changed to `12000` — still failing
- `verifiedTier` currently = `'premium'` in live code
- **Approved fix (not yet applied):** Pass `{ ...verifiedUserContext, tier: 'basic' as UserTier }` to `buildPredictionPrompt()` — reduces schema size without affecting UI or Hindi (not used in testing)

### LOCKED FILES — NEVER TOUCH
- `lib/gemini-prompt.ts` v4.3 — CEO LOCKED
- `lib/swiss-ephemeris.ts` v2.0 — CEO LOCKED
- `verifiedTier` logic — CEO approval required

### ANTI-HALLUCINATION RULES (MANDATORY)
- Never touch `gemini-prompt.ts`
- Never change `verifiedTier` logic without CEO approval  
- Never add `thinkingBudget: 0`
- `MAX_TOKENS` approved = 12000 across all tiers
- Always deliver complete files, never partial edits
- CEO protection header on every file
- One fix at a time, confirm before next

---

## ❌ PENDING (Priority Order)

1. **Fix prediction truncation** — apply `tier: 'basic'` to `buildPredictionPrompt()` call only
2. **Pratyantar + Sookshma full display** — `extractPratyantar()` path wrong
3. **Kundali Chakra chart** — not built (like AstroSage)
4. **Bhrigu insights in Hindi** — need translation in ResultClient
5. **BirthForm +91** — now dynamic ✅ done
6. **Payment/Upgrade page** — `/upgrade` 404
7. **Login system** — OTP on mobile
8. **PDF download**
9. **30-day daily prediction** (₹499 premium feature)
10. **Claude polish** — ANTHROPIC_API_KEY missing in Vercel
11. **Maa ko Arzi page** — ₹101 dakshina, petition to Maa Shakti
12. **Maa ko Thanks page** — gratitude offering after wish fulfilled
13. **₹51 paywall** — Free = 35% visible, ₹51 = 100% unlock
14. **rohiit-gupta.jpg 404** — image at `public/images/founder.png` but referenced as `/rohiit-gupta.jpg`
15. **Jini Chat Gemini 404** — fixed (`:generateContent` added) but verify
16. **Google Search Console** — service account owner permission failing

---

## SEO/GEO ARCHITECTURE (COMPLETED)

### Public Report Pages Strategy
- Every prediction → permanent SEO URL: `trikalvaani.com/report/[slug]`
- Google sees: `geoDirectAnswer` + `simpleSummary` + `seoSignals`
- Gated: `professionalEnglish` + `remedyPlan` behind ₹51 unlock
- Auto-notified to Google via Indexing API on creation
- Dynamic sitemap includes latest 1000 report URLs
- JSON-LD: Article + FAQ + BreadcrumbList + Person (Rohiit Gupta)

### Domain Pages (11 total)
`/career` `/wealth` `/health` `/relationships` `/family` `/education` `/home` `/legal` `/travel` `/spirituality` `/wellbeing`

### Calculator Pages
`/kundali-calculator` `/dasha-calculator` `/nakshatra-calculator` `/rashi-calculator` `/lagna-calculator` `/sade-sati-calculator` `/manglik-dosh-calculator` `/kundali-matching`

### E-E-A-T Trust
- Author: Rohiit Gupta, Chief Vedic Architect, Delhi NCR
- WhatsApp: 919211804111
- LocalBusiness schema with Delhi NCR address

---

## RENDER SERVICES
- `trikal-ephemeris` — Python Swiss Ephemeris (Hobby $7/mo)
- `trikal-vaani-backend` — Node.js backend (Hobby $7/mo)
- `EPHE_API_URL` = https://trikal-ephemeris.onrender.com

---

## BUSINESS DECISIONS (CEO APPROVED)
- Pricing: ₹51 only for launch (mass market first)
- Free = 35% visible, ₹51 = 100% unlock
- ₹99 and ₹499 hidden for future
- No thinkingBudget:0 — quality non-negotiable
- Cloud Run Mumbai — only at 100+ daily users, stay on Render now

---

## WHAT ROHIIT WANTS TO DISCUSS IN NEW CHAT
[Add your Gemini/GPT brainstorming notes here before sharing this prompt]
