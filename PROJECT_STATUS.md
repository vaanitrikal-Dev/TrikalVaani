# Trikal Vaani — Project Status & Architecture
**CEO & Chief Vedic Architect:** Rohiit Gupta  
**File:** PROJECT_STATUS.md  
**Last Updated:** 26 April 2026  
**Site:** https://trikalvaani.com  
**GitHub:** vaanitrikal-Dev/TrikalVaani

---

## 🏗️ Tech Stack

| Layer | Tool | Version | Cost | Status |
|---|---|---|---|---|
| Frontend | Next.js | 13.5 | — | ✅ Live |
| Language | TypeScript | Latest | — | ✅ |
| Styling | Tailwind CSS | Latest | — | ✅ |
| Hosting | Vercel Pro | — | $20/mo | ✅ Live |
| Database | Supabase | Free tier | $0/mo | ✅ Live |
| AI Engine | Gemini 2.5 Flash | Latest | ~$6/mo | ✅ Live |
| Ephemeris | Swiss Ephemeris (Render) | v2.2 | $7/mo | ✅ Live |
| Dev Tool | Bolt | — | $50/mo | ✅ Active |
| Geocoding | OpenStreetMap Nominatim | — | Free | ✅ Live |
| Payment | Razorpay + Cashfree | — | % per txn | 🔜 Pending |

**Total Monthly Cost:** ~$83/month  
**Break Even:** 82 users at ₹51 OR 42 users at ₹99

---

## ✅ Completed Features (26 April 2026)

### Core Prediction Engine
- **Swiss Ephemeris API** on Render — real pyswisseph, Lahiri Ayanamsha
- **predict/route.ts v5.0** — Swiss API + calcDasha() + Gemini 2.5 Flash
- **11 Domain IDs** — all correct with segment prefix (genz/mill/genx)
- **Gemini search enabled** — live India news context in predictions
- **maxDuration = 300** — Vercel Pro full timeout
- **Keep-alive cron** — pings Render every 10 min, zero cold starts

### Frontend
- **BirthForm v5.0** — name field, Ayanamsa hidden, saves to Supabase, sessionStorage redirect
- **DardEngineShowcase** — all 11 domains with correct IDs
- **PredictionDisplay v1.0** — full beautiful result UI:
  - KundaliDisplay (lagna, nakshatra, mahadasha, panchang)
  - Jini plain language prediction (Hinglish/Hindi/English)
  - Key Planetary Influences with BPHS citations
  - Vimshottari Dasha Table
  - Locked sections for free tier (Action Windows, Avoid Windows, Remedies)
  - Upgrade CTA
- **ResultClient v1.0** — reads sessionStorage + Supabase by predictionId
- **result/page.tsx v6.0** — SEO schemas, BreadcrumbList, FAQPage, Person schema
- **pricing/page.tsx** — 4 tier pricing (Free/₹51/₹99/₹499)

### Database
- **predictions table** — created in Supabase with all columns
- **RLS disabled** — unrestricted for launch phase
- **Extra columns** — birth_lat, birth_lng, birth_timezone (for re-prediction after upgrade)
- **Tables existing:** bookings, payments, predictions, profiles, readings, refunds, webhook_logs, whitelist

### SEO & Infrastructure
- **vercel.json** — cron job keep-alive
- **sitemap.xml** — live
- **robots.txt** — live
- **Full JSON-LD schemas** on result page

---

## 🔴 Pending — Do In Order

### URGENT (fix first in next session)

**1. End-to-End Test**
- Submit form → should redirect to `/result?inline=1`
- Result page reads from sessionStorage → shows prediction
- If spinner forever → check F12 console for errors

**2. Supabase Save Fix**
- `lib/supabase.ts` — add `birth_lat`, `birth_lng`, `birth_timezone` to `SavePredictionInput` interface
- After fix: predictions table should fill after each form submit

**3. Payment Upgrade Flow**
- User clicks "Upgrade ₹51" → payment page (NOT homepage)
- After payment → re-call `/api/predict` with `tier:'basic'`
- Use stored `birth_lat/lng` from Supabase → no form re-fill
- Build: `app/api/upgrade/route.ts`
- Build: `app/payment/page.tsx`
- Gateway: Cashfree Phase 1 (approved), Razorpay Phase 2 (pending approval)

### IMPORTANT (this week)

**4. Trust Pages (mandatory for payments)**
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service  
- `/refund` — Refund Policy
- `/contact` — Delhi NCR + WhatsApp 919211804111
- `/about` — Rohiit Gupta credentials + Person schema

**5. SEO Pages — 11 Domains**
- One pillar page per domain (e.g., `/karz-mukti`, `/property-yog`)
- 40-60 word direct answer (GEO optimized for AI search)
- FAQPage schema, HowTo schema
- 10-15 supporting articles per domain

**6. Calculator Pages (P4 SEO priority)**
- `/kundali-calculator`
- `/dasha-calculator`
- `/nakshatra-calculator`
- `/rashi-calculator`
- `/lagna-calculator`
- `/sade-sati-calculator`
- `/manglik-dosh-calculator`
- `/kundali-matching`
- `/glossary/[term]` — 50+ Vedic terms

**7. Hindi Routes**
- `/hi/` prefix for all major pages
- hreflang hi+en on every page

### LATER (post 15 May launch)

**8. User Login System**
- Supabase Auth — email/phone OTP
- Profile page — saved birth details, prediction history
- Backfill user_id on predictions after login

**9. Admin CRM Dashboard**
- All users + tiers
- Manual tier upgrade
- WhatsApp contact list export

**10. Supabase Pro ($25/mo)**
- Upgrade when 100+ active users
- Daily backups mandatory before payment goes live

---

## 📁 Key File Versions

| File | Version | Status |
|---|---|---|
| `app/api/predict/route.ts` | v5.0 | ✅ |
| `app/result/page.tsx` | v6.0 | ✅ |
| `components/result/ResultClient.tsx` | v1.0 | ✅ |
| `components/result/PredictionDisplay.tsx` | v1.0 | ✅ |
| `components/result/KundaliDisplay.tsx` | v2.0 | ✅ |
| `components/result/VimshottariDashaTable.tsx` | v1.0 | ✅ |
| `components/landing/BirthForm.tsx` | v5.0 | ✅ |
| `components/landing/DardEngineShowcase.tsx` | v1.1 | ✅ |
| `lib/swiss-ephemeris.ts` | v2.0 | ✅ |
| `lib/gemini-prompt.ts` | v3.0 | ✅ |
| `lib/supabase.ts` | v2.0 | ⚠️ needs birth_lat fix |
| `lib/domain-config.ts` | v1.0 | ✅ |
| `app/pricing/page.tsx` | v1.0 | ✅ |
| `app/api/keep-alive/route.ts` | v1.0 | ✅ |
| `vercel.json` | cron | ✅ |

---

## 🌐 Environment Variables (Vercel)

```
EPHE_API_URL = https://trikal-ephemeris.onrender.com
EPHE_API_KEY = trikal2025secret
GEMINI_API_KEY ✅
SUPABASE_SERVICE_ROLE_KEY ✅
NEXT_PUBLIC_SUPABASE_URL ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
NEXT_PUBLIC_RAZORPAY_KEY_ID ✅
MSG91_AUTH_KEY ✅
```

---

## 🎯 11 Domain IDs (Correct — Do Not Change)

| Generation | Domain IDs |
|---|---|
| Gen Z (11-31) | `genz_ex_back` · `genz_toxic_boss` · `genz_manifestation` · `genz_dream_career` |
| Millennial (32-46) | `mill_property_yog` · `mill_karz_mukti` · `mill_childs_destiny` · `mill_parents_wellness` |
| Gen X (47-56) | `genx_retirement_peace` · `genx_legacy_inheritance` · `genx_spiritual_innings` |

---

## 💰 Revenue Model

| Tier | Price | What They Get |
|---|---|---|
| Free | ₹0 | 150-200 word summary, 2 key influences, upgrade prompt |
| Basic | ₹51/mo | 500-800 word summary, full analysis, action/avoid windows, remedies |
| Pro | ₹99/mo | Basic + domain extras, reasoning, WhatsApp forecast, Jini unlimited |
| Premium | ₹499/mo | Pro + 1hr consultation, custom muhurta, business reports, API access |

**Payment Gateway Priority:** Cashfree → Razorpay → Stripe → PayPal

---

## 🏆 Competitive Position

**vs AstroTalk:** Human astrologers, ₹10-50/min calls. We have AI + Swiss Ephemeris + Parashara BPHS at ₹51/month flat.

**vs AstroSage:** Generic reports, no domain-specific intelligence. We have 11 life-specific domains with Gemini search grounding.

**Our USP:** Swiss Ephemeris accuracy + Gemini live India news context + Plain Hinglish output + ₹51 flat pricing

---

*Tagline: "Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye."*  
*Jini is the AI soul of Trikal Vaani.*
