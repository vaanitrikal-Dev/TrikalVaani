/**
 * ============================================================
 * TRIKAAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 14.13 — VM-accurate chart in Pro prompt + anti-hallucination + health sensitivity + diagnostics
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v14.13 vs v14.12 (LIVE REPORT AUDIT FIXES):
 *   ✅ FIX-1 (ACCURACY): buildProPrompt now receives chartExtract (VM Swiss
 *      Ephemeris values) — Lagna/Nakshatra/Mahadasha/Antardasha in the prompt
 *      are now VM-accurate, with local kundaliData as fallback. Handles both
 *      string and object lagna shapes (was silently blank before).
 *   ✅ FIX-2 (ANTI-HALLUCINATION): DATA INTEGRITY rule — if Lagna/Nakshatra is
 *      not provided, Gemini must NEVER invent or state one. Live report showed
 *      "Meen Lagna" while DB lagna was null — that must never happen again.
 *   ✅ FIX-3 (HEALTH SENSITIVITY — dharma + legal): when situationNote involves
 *      mental or physical health (OCD, anxiety, depression, illness):
 *      - NEVER claim planets CAUSE the medical condition — only that this
 *        period can intensify such tendencies
 *      - MUST include one caring line advising a qualified doctor/counselor —
 *        upay SUPPORT healing, they do not replace treatment
 *      - If client appears to be a minor/student, encourage talking to parents
 *      Matches site disclaimer: "Not a substitute for professional advice."
 *   ✅ FIX-4 (DIAGNOSTICS): /template and /synthesize failures now logged WITH
 *      reason (were silent — live paid report lost planet table/chart/upay/
 *      panchang with no log trail). geoBullets count logged (live report
 *      returned ~5 instead of 10 under grounding).
 *   ✅ ALL v14.12 logic preserved 100%
 *
 * CHANGES v14.12 vs v14.11:
 *   ✅ 9 NAMED SECTIONS in paid summary (emoji headings, \n\n separated)
 *   ✅ Remedy 50w + Blessing 50w — word budget 720-780 (target 755)
 *
 * CHANGES v14.11 vs v14.10 (CONSOLIDATED):
 *   ✅ JOB_LABELS map — human-readable profession in prompt + grounding
 *   ✅ numerologyCompatibility read from body → Pro prompt (dual domains)
 *   ✅ Real-world grounding remains PAID-ONLY (FREE Flash untouched)
 *
 * CHANGES v14.10 vs v14.9:
 *   ✅ Age/Gender/Life Stage/Relationship in CLIENT DETAILS; age-aware grounding
 *   ✅ Anti-doom rule: preparation guidance, never deterministic doom
 *
 * CHANGES v14.9 → v14.6: see git history — grounding (Option C), kill-switch,
 *   json-mime handling, fallback, payment gate, HMAC verify, all preserved.
 *
 * IRON RULES — NEVER VIOLATE:
 *   🔒 NEVER touch gemini-prompt.ts
 *   🔒 NEVER use thinkingBudget:0
 *   🔒 MAX_TOKENS = 12000 — CEO approved
 *   🔒 verifiedTier — CEO approval required
 *   🔒 Complete files only
 * ============================================================
 */

import { NextRequest, NextResponse }   from 'next/server'
import { createClient }                from '@supabase/supabase-js'
import crypto                          from 'crypto'
import { getDomainConfig }             from '@/lib/domain-config'
import { buildPredictionPrompt }       from '@/lib/gemini-prompt'        // LOCKED
import { buildFlashPrompt }            from '@/lib/gemini-prompt-flash'   // v1.1
import { generatePredictionSlug }      from '@/lib/slug'
import { notifyGoogleIndexing }        from '@/lib/google-indexing'
import { buildKundali }                from '@/lib/swiss-ephemeris'
import type { KundaliData, BirthData } from '@/lib/swiss-ephemeris'
import type { DomainConfig, DomainId } from '@/lib/domain-config'
import type { UserTier, UserContext }   from '@/lib/gemini-prompt'

export const maxDuration = 300

// ── Config ────────────────────────────────────────────────────────────────────
const GEMINI_FLASH    = 'gemini-2.5-flash'
const GEMINI_PRO      = 'gemini-2.5-pro'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_API_KEY  = process.env.GEMINI_API_KEY  ?? ''
const EPHE_API_URL    = process.env.EPHE_API_URL    ?? ''
const EPHE_API_KEY    = process.env.EPHE_API_KEY    ?? ''
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? ''
const MAX_TOKENS      = 12000  // CEO LOCKED

// ── Option C (v14.8): Real-world sector/city grounding for PAID only ─────────
// true  = paid predictions use live Google Search grounding (sector + city trends)
// false = disable instantly (no grounding cost) — CEO kill-switch
const PRO_REALWORLD_SEARCH = true

// ── Allowed paid amounts (paise) — anti-tamper ───────────────────────────────
const ALLOWED_PAID_AMOUNTS: Record<string, number> = {
  paid:  5100,   // ₹51 Deep Reading
  voice: 1100,   // ₹11 Voice Reading
}

// ── v14.11: Human-readable job labels for Gemini prompt + grounding search ──
// MUST stay in sync with JOB_CATEGORIES in components/landing/BirthForm.tsx
const JOB_LABELS: Record<string, string> = {
  student:             'Student',
  fresher:             'Fresher / Job Seeker (entry-level)',
  salaried_it:         'Salaried IT / Tech professional',
  salaried_finance:    'Salaried Finance / Banking professional',
  salaried_healthcare: 'Salaried Healthcare / Medical professional',
  salaried_govt:       'Government / PSU employee',
  salaried_education:  'Education / Teaching professional',
  salaried_legal:      'Legal / Law professional',
  salaried_media:      'Media / Creative professional',
  salaried_other:      'Salaried professional',
  self_employed:       'Self-Employed / Freelancer',
  business_owner:      'Business Owner',
  startup_founder:     'Startup Founder',
  real_estate:         'Real Estate professional',
  trader_investor:     'Trader / Investor',
  homemaker:           'Homemaker',
  retired:             'Retired',
  nri:                 'NRI / Working Abroad',
}

function jobLabel(code: string): string {
  return JOB_LABELS[code] ?? code ?? 'Working professional'
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Types ─────────────────────────────────────────────────────────────────────
type PredictionTier = 'free' | 'paid' | 'voice'

interface PaymentVerification {
  razorpay_order_id:   string
  razorpay_payment_id: string
  razorpay_signature:  string
  amount:              number  // in paise
}

// ── v14.11: Numerology compatibility payload (sent by BirthForm dual domains) ─
interface NumerologyCompatibility {
  score:       number
  label:       string
  description: string
  color?:      string
}

// ── v14.13: VM chart extract shape (passed into Pro prompt) ──────────────────
interface ChartExtract {
  lagna:      string | null
  nakshatra:  string | null
  mahadasha:  string | null
  antardasha: string | null
}

interface PredictRequest {
  userId?:string; sessionId:string; domainId:DomainId; domainLabel?:string
  predictionTier?:PredictionTier
  paymentVerification?: PaymentVerification
  birthData:{name?:string;dob:string;tob:string;lat:number;lng:number;cityName?:string;timezone?:number;ayanamsa?:string}
  userContext:{segment:'genz'|'millennial'|'genx';dynamicSegment?:string;gender?:string;age?:number;employment:string;sector:string;language:'hindi'|'hinglish'|'english';city:string;currentCity?:string;relationshipStatus?:string;situationNote?:string;mobile?:string;person2Name?:string|null;person2City?:string|null;person2CurrentCity?:string|null}
  person2Data?:{name:string;dob:string;tob:string;lat:number;lng:number;cityName:string;currentCity:string;mobile?:string}|null
  numerologyCompatibility?: NumerologyCompatibility | null
}

// ── Razorpay signature verification (HMAC-SHA256) ────────────────────────────
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (!RAZORPAY_SECRET) {
    console.error('[TV-v14.6] RAZORPAY_KEY_SECRET missing in env')
    return false
  }
  const payload = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(payload)
    .digest('hex')
  return expected === signature
}

// ── callVM ────────────────────────────────────────────────────────────────────
async function callVM(endpoint:string, body:object, timeoutMs=25000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(()=>controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${EPHE_API_URL}${endpoint}`,{
      method:'POST',
      headers:{'Content-Type':'application/json','X-API-Key':EPHE_API_KEY},
      body:JSON.stringify(body),
      signal:controller.signal,
    })
    if(!res.ok){const t=await res.text().catch(()=>'');throw new Error(`VM ${endpoint} → ${res.status}: ${t.slice(0,300)}`)}
    return await res.json()
  } finally { clearTimeout(timer) }
}

// ── callGemini ────────────────────────────────────────────────────────────────
// useSearch=true → enable Google Search grounding (real-world context).
// NOTE: Gemini 2.5 cannot combine google_search with responseMimeType:'application/json',
// so when useSearch is on we DROP json mime and let parseGeminiJSON extract the JSON.
async function callGemini(model:string, systemPrompt:string, userMessage:string, jsonMode=true, useSearch=false): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`
  const wantJsonMime = jsonMode && !useSearch
  const body:any = {
    system_instruction:{parts:[{text:systemPrompt}]},
    contents:[{role:'user',parts:[{text:userMessage}]}],
    generationConfig:{
      maxOutputTokens:MAX_TOKENS,
      temperature:0.7,
      topK:40,
      topP:0.95,
      ...(wantJsonMime?{responseMimeType:'application/json'}:{}),
    },
    ...(useSearch?{tools:[{google_search:{}}]}:{}),
  }
  const res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  if(!res.ok){const err=await res.text().catch(()=>'');throw new Error(`Gemini ${model} → ${res.status}: ${err.slice(0,300)}`)}
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── parseGeminiJSON ───────────────────────────────────────────────────────────
function parseGeminiJSON(raw:string): any {
  if(!raw?.trim()) throw new Error('Empty Gemini response')
  let c = raw.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'')
  const s=c.indexOf('{'), e=c.lastIndexOf('}')
  if(s<0||e<0) throw new Error(`No JSON. Raw(${c.length}): ${c.slice(0,200)}`)
  c = c.slice(s,e+1)
  try{return JSON.parse(c)}catch{return JSON.parse(c.replace(/,\s*([}\]])/g,'$1'))}
}

// ── buildProPrompt ────────────────────────────────────────────────────────────
// Paid tier — 720-780 words, 9 named sections, deep analysis, full GEO signals
function buildProPrompt(
  kundali: KundaliData,
  birthData: BirthData,
  domain: DomainConfig,
  userContext: UserContext,
  templateData?: any,
  numerology?: NumerologyCompatibility | null,
  chartExtract?: ChartExtract | null,
): { systemPrompt: string; userMessage: string } {

  const lang = userContext.language
  const langRule = lang==='hindi'
    ? 'LANGUAGE: Pure Hindi Devanagari. ZERO English words.'
    : lang==='english'
    ? 'LANGUAGE: Pure English. Warm Vedic astrologer tone.'
    : 'LANGUAGE: Natural Hinglish — Hindi + English mixed naturally. Jigri dost + wise Guru tone.'

  // ── v14.13 FIX-1: VM-accurate chart values first, local kundaliData fallback.
  // Handles both string and object lagna/nakshatra shapes (was silently blank).
  const kAny = kundali as any
  const localLagna =
    typeof kAny.lagna === 'string' ? kAny.lagna
    : (kAny.lagna?.rashi ?? kAny.lagna?.sign ?? '')
  const localNakshatra =
    typeof kAny.nakshatra === 'string' ? kAny.nakshatra
    : (kAny.planets?.['Moon']?.nakshatra ?? '')

  const lagna      = chartExtract?.lagna      || localLagna      || ''
  const nakshatra  = chartExtract?.nakshatra  || localNakshatra  || ''
  const mahadasha  = chartExtract?.mahadasha  || kundali.currentMahadasha?.lord  || 'Rahu'
  const antardasha = chartExtract?.antardasha || kundali.currentAntardasha?.lord || 'Jupiter'

  // ── v14.10: Full human profile for Gemini (age-aware grounding + remedies) ──
  const clientAge    = (userContext as any).age ?? null
  const clientGender = (userContext as any).gender || 'not specified'
  const clientStage  = userContext.dynamicSegment ?? 'mid_general'
  const clientRel    = userContext.relationshipStatus || 'not specified'
  // ── v14.11: Human-readable profession for prompt + grounding search ────────
  const clientJob    = jobLabel(userContext.employment)

  // ── v14.11: Optional numerology block (dual-chart domains only) ────────────
  const numerologyBlock = numerology ? `

MOBILE NUMEROLOGY COMPATIBILITY (dual-chart reading — the client saw this score on the form):
- Score: ${numerology.score}% — ${numerology.label}
- Insight: ${numerology.description}
Weave this numerology insight naturally into the relationship/person-2 analysis paragraphs
of simpleSummary.text (1-2 sentences). Connect it to the planetary compatibility — do NOT
present it as a separate section, and do NOT add new JSON keys.` : ''

  const systemPrompt = `
════════════════════════════════════════════════════════
TRIKAAL VAANI — PRO DEEP ANALYSIS ENGINE v14.13
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════

WHO YOU ARE:
Trikaal — AI soul of Trikaal Vaani by Rohiit Gupta, Chief Vedic Architect, India.
PAID PREMIUM TIER — Full truth. No suspense hook. Complete analysis.
PAYMENT: Customer paid ₹51 via Razorpay (verified). Deliver maximum value.

${langRule}
DOMAIN: ${domain.displayName ?? domain.id}

ABSOLUTE RULES:
1. JSON ONLY — first char { last char }
2. situationNote = 60% weight — first 3 sentences address pain directly
3. geoBullets = EXACTLY 10 items — 25-40 words each — NO URLs
4. geoDirectAnswer = 4-5 sentences — NO URLs — NO "Visit trikalvaani"
5. simpleSummary.text = 720-780 WORDS body text (target 755) — count carefully.
   Section HEADING lines do NOT count toward the word budget.
6. NO suspense hook — paid user gets full truth immediately
7. Language = ${lang.toUpperCase()} every single word — headings too
8. All seoSignals fields populated
9. SECTION HEADINGS (v14.12): simpleSummary.text is organized into 9 NAMED SECTIONS.
   Each section starts with ONE short heading line — emoji + 2-5 words in the reading's
   language — then a newline, then the paragraph. Separate sections with a blank line
   (two newlines: \\n\\n). PLAIN TEXT ONLY — no markdown #, no **, no HTML tags.
   Escape newlines as \\n inside the JSON string.
10. DATA INTEGRITY (v14.13 — CRITICAL): Use ONLY the chart facts given in CLIENT
   DETAILS below. If Lagna, Nakshatra, or any chart value is marked NOT AVAILABLE,
   you must NEVER invent, guess, or state one — analyze using only the values you
   were given (e.g. Dasha + Nakshatra). Stating a wrong Lagna destroys trust forever.
11. HEALTH SENSITIVITY (v14.13 — CRITICAL): If the situation note involves MENTAL
   or PHYSICAL health (e.g. OCD, anxiety, depression, panic, illness, disease):
   a) NEVER state that planets/dasha CAUSE the medical condition. Say instead that
      this period can INTENSIFY such tendencies or make this phase feel heavier.
   b) You MUST include one caring, natural line (in Section 6 actions or Section 8
      remedy) advising them to also consult a qualified doctor/counselor — upay
      SUPPORT the healing journey, they do not replace medical treatment.
   c) If the client is a student/minor, also gently encourage sharing openly with
      parents. Extra-gentle, hopeful tone throughout. Never frighten.
12. REAL-WORLD CONTEXT: Where current information about the client's profession/sector
   and current city is available to you, write 1-2 concrete present-day facts
   (industry/job-market climate, hiring/demand trend, local economic factor) and connect
   them to the planetary timing. Keep it GENERAL and sector-level, but AGE-RELEVANT —
   what matters for the client's career stage (entry-level vs mid-career vs senior).
   STRICT PRIVACY: NEVER search for, name, or identify this individual person. NEVER use
   their name. Only general sector/city/market trends — no private-person lookup.
   TONE RULE: Real-world challenges are PREPARATION guidance, never deterministic doom.
   NEVER write "job jayegi" / "loss hoga" as certainty. Instead: "sector mein abhi X trend
   hai + aapki dasha Y kehti hai → ye 3 kaam abhi karo." Warn + prepare. Never frighten.
   This context is SECTION 2 of simpleSummary.text — DO NOT add new JSON keys.
13. OUTPUT = RAW JSON ONLY. No markdown fences, no preamble, no text after the final }.
    Escape every double-quote inside string values. First char { — last char }.
════════════════════════════════════════════════════════`.trim()

  const userMessage = `Generate PAID PREMIUM FULL ANALYSIS for: ${domain.displayName ?? domain.id}

CLIENT DETAILS:
- Name: ${birthData.name ?? 'Friend'}
- Age: ${clientAge ?? 'unknown'} | Gender: ${clientGender} | Life Stage: ${clientStage} | Relationship: ${clientRel}
- Lagna: ${lagna || 'NOT AVAILABLE — do NOT state or invent any Lagna'} | Nakshatra: ${nakshatra || 'NOT AVAILABLE — do NOT state or invent any Nakshatra'}
- Mahadasha: ${mahadasha} MD + ${antardasha} AD
- City: ${birthData.cityName ?? userContext.city} → Currently: ${userContext.currentCity ?? userContext.city}
- Segment: ${userContext.segment} | Profession: ${clientJob} | Sector: ${userContext.sector}
- Dasha: ${templateData?.dashaOneLiner ?? `${mahadasha} MD + ${antardasha} AD`}
- Dasha Quality: ${templateData?.dashaQuality ?? 'Madhyam'}
- Action Window: ${templateData?.actionWindowHint ?? 'from dasha calculations'}
- Avoid Window: ${templateData?.avoidWindowHint ?? 'from dasha calculations'}

SITUATION NOTE (60% FOCUS — MANDATORY):
"${userContext.situationNote ?? 'domain challenges and growth'}"
First 3 sentences MUST directly address this pain. Make them feel deeply understood.
If this note involves mental/physical health, follow ABSOLUTE RULE 11 strictly.
${numerologyBlock}

REAL-WORLD CONTEXT (use current web knowledge — sector + city only):
- Profile: ${clientAge ? `${clientAge} year old` : 'Adult'} ${clientGender !== 'not specified' ? clientGender : 'person'}, ${clientStage} life stage
- Profession: ${clientJob}${userContext.sector ? ` (${userContext.sector} sector)` : ''}
- Lives/works in: ${userContext.currentCity ?? userContext.city}
- Relationship status (for marriage/relationship domains): ${clientRel}
Find the CURRENT (today's) real-world climate for this profession/sector and this city —
e.g. hiring vs layoffs, demand, salary/growth trend, or local economic factor — RELEVANT
TO THIS AGE AND CAREER STAGE (e.g. entry-level IT hiring in Pune for a 27-year-old vs
senior-management churn for a 47-year-old are DIFFERENT trends). Place 1-2 concrete
present-day facts as SECTION 2 of simpleSummary.text and connect them to the
${mahadasha} Mahadasha period — so the guidance feels grounded in real life, not only planets.
Frame every challenge as preparation + timing guidance, NEVER as certain doom.
NEVER identify or name this person. Sector + city trends ONLY. No private-person search.

OUTPUT JSON:
{
  "geoDirectAnswer": "4-5 authoritative sentences about ${domain.displayName ?? domain.id} in Vedic astrology. Include Rohiit Gupta and Swiss Ephemeris. Include BPHS classical reference. NO URLs. NO Visit trikalvaani.",

  "geoBullets": [
    "Vedic Foundation: Classical BPHS principle for ${domain.displayName ?? domain.id} — 25-40 words",
    "Dasha Impact: How ${mahadasha} MD + ${antardasha} AD specifically affects ${domain.displayName ?? domain.id} now — 25-40 words",
    "Key Planet: Primary planet controlling ${domain.displayName ?? domain.id} and current strength in chart — 25-40 words",
    "Best Timing: Most favorable period from dasha calculations with approximate dates — 25-40 words",
    "Caution Period: Time requiring extra care with classical Vedic reason — 25-40 words",
    "Classical Remedy: Specific BPHS mantra or dana with exact day and time — 25-40 words",
    "FAQ Answer 1: Most searched question about ${domain.displayName ?? domain.id} astrology answered — 25-40 words",
    "FAQ Answer 2: Second most important insight about this domain — 25-40 words",
    "Bhrigu Pattern: What Bhrigu Nandi Nadi reveals about this persons ${domain.displayName ?? domain.id} karma — 25-40 words",
    "Expert Insight: Rohiit Gupta Chief Vedic Architect key 15-year observation about ${domain.displayName ?? domain.id} — 25-40 words"
  ],

  "simpleSummary": {
    "text": "WRITE 720-780 WORDS of body text (target 755) in ${lang.toUpperCase()}, organized as 9 NAMED SECTIONS. Each section = ONE short heading line (emoji + 2-5 words in ${lang.toUpperCase()}) + \\n + paragraph. Separate sections with \\n\\n. Headings do NOT count in word budget. Heading style examples for Hinglish (translate appropriately for Hindi/English): [SECTION 1 — heading like '🪔 Aapki Baat, Seedhe Dil Se': address their situation/pain directly — make them feel deeply understood — 100 words] [SECTION 2 — heading like '🌍 Aaj Ki Zameeni Haqeeqat': REAL-WORLD GROUND REALITY — today's actual climate for their profession (${clientJob}) and current city (hiring/demand/salary/market trend), age-relevant for a ${clientAge ?? ''} year old at ${clientStage} stage, connected to their situation; sector + city level only, NEVER name the person, frame as preparation not doom — 100 words] [SECTION 3 — heading like '🪐 Aisa Kyun Ho Raha Hai': why this is happening — explain key planets in simple language using ONLY the chart facts provided${numerology ? '; weave the numerology compatibility insight here if relationship-relevant' : ''} — 115 words] [SECTION 4 — heading like '⏳ Aapki Current Dasha': what current ${mahadasha} Mahadasha + ${antardasha} Antardasha means for their life right now — 115 words] [SECTION 5 — heading like '🌅 Aage Kya Aane Wala Hai': what is coming — specific timeframe, what to expect, hope — 105 words] [SECTION 6 — heading like '✅ Abhi Ye 3 Kaam Karo': three priority actions they must take now in order of importance (include doctor/counselor advice here if health-related per RULE 11) — 70 words] [SECTION 7 — heading like '⚠️ In Cheezon Se Bacho': two critical things to avoid with brief classical reason — 50 words] [SECTION 8 — heading like '🙏 Aapka Personal Upay': specific remedy — exact mantra with Sanskrit + count + day + time OR exact dana with recipient, day and time, appropriate for ${clientGender}, plus one line on HOW to do it correctly — 50 words] [SECTION 9 — heading like '🔱 Maa Shakti Ka Ashirwad': closing blessing — hope, protection, one line reminding them their karma + these remedies together change the timeline — 50 words]. Spiritual Guru voice. Short sentences. Reader must finish till the end. NO suspense hook. FULL complete answer. PLAIN TEXT headings only — no markdown, no HTML.",
    "keyMessage": "ONE powerful Guru sentence that captures their life truth. Max 25 words.",
    "periodSummary": "3-4 sentences explaining what current Dasha combination means for their daily life in plain simple language.",
    "bestDates": "3-4 specific favorable date ranges or windows from dasha calculations.",
    "mainAction": "Single most important concrete action to take this week. Very specific.",
    "mainCaution": "Single most critical thing to avoid right now with one line classical reason.",
    "dos": ["specific do 1 with brief reason", "specific do 2", "specific do 3 spiritual", "specific do 4 practical", "specific do 5 timing-based"],
    "donts": ["specific dont 1 with classical reason", "specific dont 2", "specific dont 3", "specific dont 4", "specific dont 5"],
    "remedyHint": "Specific mantra with Sanskrit + transliteration + count + day + time. OR specific dana item with recipient and day."
  },

  "karmicInsight": null,

  "seoSignals": {
    "geoQuestion": "What does Vedic astrology reveal about ${domain.displayName ?? domain.id} and how to improve it using Swiss Ephemeris kundali analysis?",
    "authorityStatement": "Powered by Trikaal Vaani Swiss Ephemeris + BPHS + Bhrigu Nandi analysis by Rohiit Gupta, Chief Vedic Architect, India — India first AI-powered Vedic platform. Payments secured by Razorpay.",
    "differentiator": "Trikaal Vaani provides Swiss Ephemeris precision with Bhrigu Nandi patterns and BPHS classical rules for deeply personalized, human-led analysis — not generic automated reports. Razorpay-secured, affordable pricing at ₹51.",
    "e_e_a_t": {
      "experience": "Rohiit Gupta 15+ years Vedic astrology Parashara BPHS tradition India India",
      "expertise": "Swiss Ephemeris BPHS Brihat Parashara Hora Shastra Bhrigu Nandi Vimshottari Dasha Shadbala",
      "authority": "Chief Vedic Architect Trikaal Vaani India first AI-powered Vedic astrology platform",
      "trust": "Swiss Ephemeris same precision engine used by professional astrologers worldwide. Razorpay-secured payments PCI-DSS compliant."
    }
  },

  "_promptVersion": "pro-v14.13",
  "_tier": "premium"
}

CRITICAL FINAL CHECKLIST:
- simpleSummary.text MUST be 720-780 WORDS of body text — 9 sections, each with an emoji heading line
- Sections separated by \\n\\n — headings in ${lang.toUpperCase()} — NO markdown/HTML
- geoBullets MUST have exactly 10 items — 25-40 words each — COUNT THEM: 10
- NO URLs anywhere in geoBullets or geoDirectAnswer
- NEVER state a Lagna/Nakshatra that was marked NOT AVAILABLE
- Health-related situation → doctor/counselor line included (RULE 11)
- Language = ${lang.toUpperCase()} every single word throughout
- Return ONLY valid JSON — first char { last char }
- JAI MAA SHAKTI 🔱`

  return { systemPrompt, userMessage }
}

// ── mergeTemplateWithGemini ───────────────────────────────────────────────────
function mergeTemplateWithGemini(
  templateObj: Record<string,any>|null,
  geminiObj: Record<string,any>,
  version = '14.6',
): Record<string,any> {
  if(!templateObj) return {...geminiObj, _source:'gemini-only', _version:version}
  const ss = geminiObj.simpleSummary ?? {}
  return {
    planetTable:      templateObj.planetTable      ?? [],
    dashaTimeline:    templateObj.dashaTimeline     ?? {},
    actionWindows:    templateObj.actionWindows     ?? [],
    avoidWindows:     templateObj.avoidWindows      ?? [],
    remedyPlan:       templateObj.remedyPlan        ?? {},
    panchang:         templateObj.panchang          ?? {},
    geoDirectAnswer:  geminiObj.geoDirectAnswer     ?? templateObj.geoDirectAnswer ?? {},
    geoBullets:       geminiObj.geoBullets          ?? [],
    geoFaq:           templateObj.geoFaq            ?? [],
    confidenceBadge:  templateObj.confidenceBadge   ?? {},
    domainAnalysis:   templateObj.domainAnalysis    ?? {},
    coreMessage:      templateObj.coreMessage       ?? null,
    doAction:         templateObj.doAction          ?? null,
    avoidAction:      templateObj.avoidAction       ?? null,
    simpleSummary:    ss,
    summaryText:      ss.text                       ?? null,
    keyMessage:       ss.keyMessage                 ?? null,
    mainAction:       ss.mainAction                 ?? null,
    mainCaution:      ss.mainCaution                ?? null,
    periodSummary:    ss.periodSummary              ?? null,
    bestDates:        ss.bestDates                  ?? null,
    remedyHint:       ss.remedyHint                 ?? null,
    dosList:          ss.dos                        ?? [],
    dontsList:        ss.donts                      ?? [],
    karmicInsight:    geminiObj.karmicInsight        ?? null,
    seoSignals:       geminiObj.seoSignals           ?? {},
    actionWindowText: geminiObj.actionWindow         ?? null,
    avoidWindowText:  geminiObj.avoidWindow          ?? null,
    _source: 'template+gemini',
    _version: version,
  }
}

// ── extractFromRawChart ───────────────────────────────────────────────────────
function extractFromRawChart(rawChart:any): ChartExtract {
  if(!rawChart) return {lagna:null,nakshatra:null,mahadasha:null,antardasha:null}
  const lagna = rawChart?.lagna?.sign ?? rawChart?.lagna?.rashi ?? null
  const moon  = rawChart?.grahas?.find?.((g:any)=>g.planet==='Moon'||g.name==='Moon')
  return {
    lagna,
    nakshatra:   moon?.nakshatra ?? null,
    mahadasha:   rawChart?.dasha?.mahadasha?.lord  ?? null,
    antardasha:  rawChart?.dasha?.antardasha?.lord ?? null,
  }
}

// ── buildSeoGeoMeta ───────────────────────────────────────────────────────────
function buildSeoGeoMeta(
  slug:string, domainId:string, domainLabel:string,
  mahadasha:string, antardasha:string, cityName:string,
  mergedJson:Record<string,any>,
) {
  const geoRaw  = mergedJson.geoDirectAnswer
  const geoText = typeof geoRaw==='object' ? (geoRaw?.text??'') : (geoRaw??'')
  const geoClean = String(geoText)
    .replace(/Visit\s+trikalvaani\.com[^.]*\./gi,'')
    .trim()
  const title = `${domainLabel} Prediction — ${mahadasha}-${antardasha} Dasha | ${cityName} | Trikaal Vaani`
  const description = geoClean
    ? `${geoClean.slice(0,140)}... Rohiit Gupta, Chief Vedic Architect.`
    : `Vedic ${domainLabel} for ${cityName}. ${mahadasha} Mahadasha. Swiss Ephemeris + BPHS. Rohiit Gupta.`
  return {
    title:       title.slice(0,70),
    description: description.slice(0,165),
    canonical:   `https://trikalvaani.com/report/${slug}`,
    geoAnswer:   geoClean,
  }
}

// ── saveToSupabase ────────────────────────────────────────────────────────────
async function saveToSupabase(p:{
  sessionId:string; userId?:string; domainId:string; domainLabel:string
  predictionTier:PredictionTier; birthData:BirthData; userContext:any
  kundaliData:KundaliData|null; rawChart:any; synthesisData:any
  predictionJson:Record<string,any>; geminiModel:string; polished:boolean
  processingMs:number; publicSlug:string
  seoMeta:ReturnType<typeof buildSeoGeoMeta>
  chartExtract:ChartExtract
  paymentVerification?: PaymentVerification | null
}): Promise<string> {
  const simpleSummaryText =
    p.predictionJson.summaryText ??
    p.predictionJson.simpleSummary?.text ??
    p.predictionJson.coreMessage ??
    p.seoMeta.geoAnswer ?? null

  const {data,error} = await supabase.from('predictions').insert({
    session_id:      p.sessionId,
    domain_id:       p.domainId,
    domain_label:    p.domainLabel,
    tier:            p.predictionTier==='paid'?'premium':'free',
    prediction_tier: p.predictionTier,
    user_id:         p.userId??null,
    person_name:     p.birthData.name??null,
    dob:             p.birthData.dob??null,
    birth_time:      p.birthData.tob??null,
    birth_city:      p.birthData.cityName??null,
    birth_lat:       p.birthData.lat??null,
    birth_lng:       p.birthData.lng??null,
    birth_timezone:  p.birthData.timezone??null,
    lagna:           p.chartExtract.lagna??p.kundaliData?.lagna?.rashi??null,
    nakshatra:       p.chartExtract.nakshatra??p.kundaliData?.planets?.['Moon']?.nakshatra??null,
    mahadasha:       p.chartExtract.mahadasha??p.kundaliData?.currentMahadasha?.lord??null,
    antardasha:      p.chartExtract.antardasha??p.kundaliData?.currentAntardasha?.lord??null,
    language:        p.userContext.language??null,
    segment:          p.userContext.segment??null,
    gender:           (p.userContext as any).gender??null,
    age:              (p.userContext as any).age??null,
    dynamic_segment:  (p.userContext as any).dynamicSegment??null,
    employment:      p.userContext.employment??null,
    sector:          p.userContext.sector??null,
    chart_source:    p.rawChart?'swiss-ephemeris-vm':'swiss-ephemeris-meeus',
    prediction:      p.predictionJson,
    prediction_json: p.predictionJson,
    simple_summary:  simpleSummaryText,
    geo_answer:      p.seoMeta.geoAnswer??null,
    birth_data:      p.birthData,
    user_context:    p.userContext,
    kundali_data:    p.kundaliData,
    synthesis_data:  p.synthesisData,
    gemini_model:    p.geminiModel,
    polished:        p.polished,
    processing_ms:   p.processingMs,
    public_slug:     p.publicSlug,
    seo_title:       p.seoMeta.title??null,
    seo_description: p.seoMeta.description??null,
    is_public:       true,
    is_indexed:      false,
    // ── Razorpay payment columns (v14.6) ─────────────────────────
    razorpay_order_id:   p.paymentVerification?.razorpay_order_id   ?? null,
    razorpay_payment_id: p.paymentVerification?.razorpay_payment_id ?? null,
    payment_amount:      p.paymentVerification?.amount              ?? null,
    payment_verified:    p.paymentVerification ? true : false,
    created_at:          new Date().toISOString(),
  }).select('id').single()

  if(error||!data){
    console.error('[TV-v14.6] Insert failed:',error?.message)
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  }
  return data.id as string
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startMs = Date.now()

  let body:PredictRequest
  try{body=await req.json()}
  catch{return NextResponse.json({error:'Invalid JSON body'},{status:400})}

  const {sessionId,userId,domainId,predictionTier='free',birthData,userContext,person2Data,paymentVerification,numerologyCompatibility}=body

  if(predictionTier==='voice')
    return NextResponse.json({error:'Voice uses /api/voice'},{status:400})
  if(!GEMINI_API_KEY)
    return NextResponse.json({error:'Gemini API key missing'},{status:500})
  if(!EPHE_API_URL)
    return NextResponse.json({error:'Ephemeris URL not configured'},{status:500})

  const isPaid = predictionTier==='paid'

  // ── PAYMENT GATE — v14.6 NEW ───────────────────────────────────────────────
  if(isPaid){
    if(!paymentVerification){
      console.error('[TV-v14.6] Paid request without payment verification')
      return NextResponse.json(
        {error:'Payment verification required for paid tier.'},
        {status:402}
      )
    }
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature, amount} = paymentVerification

    // Verify amount matches expected paid tier amount
    const expectedAmount = ALLOWED_PAID_AMOUNTS['paid']
    if(amount !== expectedAmount){
      console.error(`[TV-v14.6] Amount mismatch: got ${amount}, expected ${expectedAmount}`)
      return NextResponse.json(
        {error:'Payment amount mismatch.'},
        {status:400}
      )
    }

    // Verify Razorpay HMAC signature server-side
    const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if(!valid){
      console.error('[TV-v14.6] Razorpay signature verification failed')
      return NextResponse.json(
        {error:'Payment signature invalid. Please retry.'},
        {status:400}
      )
    }
    console.log(`[TV-v14.6] ✅ Payment verified | payment_id:${razorpay_payment_id}`)
  }

  const geminiModel = isPaid ? GEMINI_PRO : GEMINI_FLASH

  console.log(`[TV-v14.6] START | tier:${predictionTier} | model:${geminiModel} | domain:${domainId} | paid:${isPaid}`)

  const localBirthData:BirthData = {
    name:     birthData.name??'Anonymous',
    dob:      birthData.dob,
    tob:      birthData.tob,
    lat:      birthData.lat,
    lng:      birthData.lng,
    cityName: birthData.cityName??'India',
    timezone: birthData.timezone??5.5,
  }

  let domainConfig:DomainConfig
  try{domainConfig=getDomainConfig(domainId)}
  catch{return NextResponse.json({error:`Unknown domain: ${domainId}`},{status:400})}

  // CEO LOCKED — never change
  const verifiedTier:UserTier = isPaid ? 'premium' : 'free'

  const kundaliData:KundaliData = buildKundali(localBirthData)
  let rawChart:any=null, synthesisData:any=null, templateData:any=null

  // ── STEP 1: /kundali ─────────────────────────────────────────────────────
  const kundaliPromise = callVM('/kundali',{
    dob:localBirthData.dob, tob:localBirthData.tob,
    lat:localBirthData.lat, lng:localBirthData.lng,
    timezone:birthData.timezone??5.5, ayanamsa:1,
  },25000).catch((err:any)=>{
    console.error(`[TV-v14.6] /kundali failed: ${err.message}`)
    return null
  })

  const promptUserContext:UserContext = {
    tier:               verifiedTier,
    dynamicSegment:     userContext.dynamicSegment??'mid_general',
    gender:             userContext.gender??'',
    age:                userContext.age??30,
    segment:            userContext.segment,
    employment:         userContext.employment,
    sector:             userContext.sector,
    language:           userContext.language,
    city:               userContext.city,
    currentCity:        userContext.currentCity||userContext.city,
    relationshipStatus: userContext.relationshipStatus??'',
    situationNote:      (userContext.situationNote??'').slice(0,200),
    mobile:             userContext.mobile??'',
    person2Name:        userContext.person2Name??null,
    person2City:        userContext.person2City??null,
    person2CurrentCity: userContext.person2CurrentCity??null,
  }

  rawChart = await kundaliPromise
  console.log(`[TV-v14.6] /kundali | lagna:${rawChart?.lagna?.sign} | ms:${Date.now()-startMs}`)
  const chartExtract = extractFromRawChart(rawChart)

  // ── STEP 2+3 PARALLEL: /synthesize + /template ────────────────────────────
  const [synthesisResult,templateResult] = await Promise.allSettled([
    callVM('/synthesize',{
      kundaliData:rawChart,
      birthData:{dob:localBirthData.dob,tob:localBirthData.tob,lat:localBirthData.lat,lng:localBirthData.lng,timezone:birthData.timezone??5.5},
      domainId, person2Data:person2Data??null,
    },20000),
    callVM('/template',{
      domain:domainId,
      kundaliData:{chart:rawChart,synthesis:null,birthData:localBirthData,tier:predictionTier},
      sessionId,
      lang:userContext.language==='english'?'en':'hi',
    },15000),
  ])

  if(synthesisResult.status==='fulfilled'){
    synthesisData=synthesisResult.value
    console.log(`[TV-v14.6] /synthesize OK | ms:${Date.now()-startMs}`)
  } else {
    // v14.13 FIX-4: failure was silent — now logged with reason
    console.error(`[TV-v14.13] /synthesize FAILED: ${synthesisResult.reason?.message ?? synthesisResult.reason} | ms:${Date.now()-startMs}`)
  }
  if(templateResult.status==='fulfilled'){
    const tr=templateResult.value
    templateData=tr?.template??tr?.html??null
    if(templateData&&typeof templateData!=='object') {
      console.error(`[TV-v14.13] /template returned non-object (type:${typeof templateData}) — planet table/upay/panchang will be MISSING | ms:${Date.now()-startMs}`)
      templateData=null
    }
    else if(templateData) console.log(`[TV-v14.6] /template OK | ms:${Date.now()-startMs}`)
    else console.error(`[TV-v14.13] /template returned empty — planet table/upay/panchang will be MISSING | ms:${Date.now()-startMs}`)
  } else {
    // v14.13 FIX-4: failure was silent — now logged with reason.
    // When this fires on a PAID request, the customer loses planet table,
    // kundali chart, 5 upay, action windows and panchang — investigate VM.
    console.error(`[TV-v14.13] /template FAILED: ${templateResult.reason?.message ?? templateResult.reason} | paid:${isPaid} | ms:${Date.now()-startMs}`)
  }

  // ── STEP 4: Gemini Call ───────────────────────────────────────────────────
  // FREE = Flash (150w, fast) | PAID = Pro (720-780w, 9 named sections + grounding)
  let predictionJson: Record<string,any>

  if(isPaid) {
    // ── PAID: Gemini Pro — 720-780 words + real-world grounding (Option C) ───
    console.log(`[TV-v14.13] PRO START | grounding:${PRO_REALWORLD_SEARCH} | numerology:${numerologyCompatibility?'yes':'no'} | vm_lagna:${chartExtract.lagna??'null'} | ms:${Date.now()-startMs}`)
    const {systemPrompt:proSystem, userMessage:proUser} = buildProPrompt(
      kundaliData, localBirthData, domainConfig, promptUserContext, templateData,
      numerologyCompatibility ?? null,
      chartExtract
    )
    try {
      let proJson:any
      if(PRO_REALWORLD_SEARCH){
        try {
          // Attempt 1: WITH Google Search grounding (sector + city real-world context)
          const rawPro = await callGemini(GEMINI_PRO, proSystem, proUser, true, true)
          proJson = parseGeminiJSON(rawPro)
          console.log(`[TV-v14.13] PRO grounded OK | summary_len:${proJson.simpleSummary?.text?.length??0} | geoBullets:${proJson.geoBullets?.length??0} | ms:${Date.now()-startMs}`)
        } catch(searchErr:any) {
          // Fallback: WITHOUT grounding (reliable JSON mode) — customer always gets a prediction
          console.error(`[TV-v14.13] PRO grounded attempt failed (${searchErr.message}) — falling back to no-search`)
          const rawPro2 = await callGemini(GEMINI_PRO, proSystem, proUser, true, false)
          proJson = parseGeminiJSON(rawPro2)
          console.log(`[TV-v14.13] PRO fallback OK | summary_len:${proJson.simpleSummary?.text?.length??0} | geoBullets:${proJson.geoBullets?.length??0} | ms:${Date.now()-startMs}`)
        }
      } else {
        const rawPro = await callGemini(GEMINI_PRO, proSystem, proUser, true, false)
        proJson = parseGeminiJSON(rawPro)
        console.log(`[TV-v14.13] PRO OK (search off) | summary_len:${proJson.simpleSummary?.text?.length??0} | geoBullets:${proJson.geoBullets?.length??0} | ms:${Date.now()-startMs}`)
      }
      predictionJson = mergeTemplateWithGemini(templateData, proJson, '14.13-pro')
    } catch(err:any) {
      console.error(`[TV-v14.13] PRO failed: ${err.message}`)
      return NextResponse.json({error:`Pro prediction failed: ${err.message}`},{status:500})
    }
  } else {
    // ── FREE: Gemini Flash — 150 words ──────────────────────────────────────
    console.log(`[TV-v14.6] FLASH START | ms:${Date.now()-startMs}`)
    const {systemPrompt:flashSystem, userMessage:flashUser} = buildFlashPrompt(
      kundaliData, localBirthData, domainConfig, promptUserContext
    )
    try {
      const rawFlash = await callGemini(GEMINI_FLASH, flashSystem, flashUser, true)
      const flashJson = parseGeminiJSON(rawFlash)
      predictionJson = mergeTemplateWithGemini(templateData, flashJson, '14.6-flash')
      console.log(`[TV-v14.6] FLASH OK | ms:${Date.now()-startMs}`)
    } catch(err:any) {
      console.error(`[TV-v14.6] FLASH failed: ${err.message}`)
      return NextResponse.json({error:`Prediction failed: ${err.message}`},{status:500})
    }
  }

  // ── STEP 5: Slug + SEO ───────────────────────────────────────────────────
  const processingMs     = Date.now()-startMs
  const mahadashaPlanet  = chartExtract.mahadasha??kundaliData?.currentMahadasha?.lord??'rahu'
  const antardashaPlanet = chartExtract.antardasha??kundaliData?.currentAntardasha?.lord??'saturn'

  const publicSlug = generatePredictionSlug({
    domainId,
    mahadasha:  mahadashaPlanet,
    antardasha: antardashaPlanet,
    city:       localBirthData.cityName??'india',
  })
  const seoMeta = buildSeoGeoMeta(
    publicSlug, domainId, domainConfig.label??domainId,
    mahadashaPlanet, antardashaPlanet,
    localBirthData.cityName??'India', predictionJson
  )

  // ── STEP 6: Save to Supabase ─────────────────────────────────────────────
  try {
    await saveToSupabase({
      sessionId, userId, domainId,
      domainLabel:    domainConfig.label??domainId,
      predictionTier, birthData:localBirthData,
      userContext:    promptUserContext,
      kundaliData, rawChart, synthesisData,
      predictionJson,
      geminiModel,
      polished:       isPaid,
      processingMs,
      publicSlug, seoMeta, chartExtract,
      paymentVerification: paymentVerification ?? null,
    })
    console.log(`[TV-v14.6] Saved | slug:${publicSlug} | polished:${isPaid} | ms:${Date.now()-startMs}`)
  } catch(err:any) {
    console.error(`[TV-v14.6] Save failed: ${err.message}`)
  }

  // ── STEP 7: Google Indexing ───────────────────────────────────────────────
  try{notifyGoogleIndexing(`https://trikalvaani.com/report/${publicSlug}`)}catch{}

  // ── STEP 8: Return ───────────────────────────────────────────────────────
  const totalMs = Date.now()-startMs
  console.log(`[TV-v14.6] RESPONSE | ms:${totalMs} | model:${geminiModel} | slug:${publicSlug}`)

  return NextResponse.json({
    success:      true,
    prediction:   predictionJson,
    templateHtml: null,
    _meta: {
      publicSlug,
      reportUrl:      `https://trikalvaani.com/report/${publicSlug}`,
      predictionTier,
      geminiModel,
      polished:       isPaid,
      processingMs:   totalMs,
      domainId,
      domainLabel:    domainConfig.label??domainId,
      lagna:          chartExtract.lagna,
      nakshatra:      chartExtract.nakshatra,
      mahadasha:      mahadashaPlanet,
      antardasha:     antardashaPlanet,
      seoTitle:       seoMeta.title,
      seoDescription: seoMeta.description,
      geoAnswer:      seoMeta.geoAnswer,
      paymentVerified: paymentVerification ? true : false,
    },
  })
}
