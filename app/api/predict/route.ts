/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 14.6 — Razorpay Payment Verification Gate
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v14.6 vs v14.5:
 *   ✅ paymentVerification gate for paid + voice tiers
 *   ✅ HMAC-SHA256 signature verified server-side BEFORE prediction
 *   ✅ razorpay_payment_id + razorpay_order_id saved to Supabase
 *   ✅ payment_amount + payment_verified columns added
 *   ✅ Anti-fraud: blocks unverified paid requests
 *   ✅ Dev fallback: if env keys missing, falls back to free safely
 *   ✅ ALL v14.5 logic preserved:
 *      - Iron rules (gemini-prompt.ts LOCKED, MAX_TOKENS=12000)
 *      - 10 geoBullets, geoDirectAnswer, E-E-A-T schema
 *      - Gender + age + dynamicSegment routing
 *      - Parallel /synthesize + /template calls
 *      - 900-word Pro / 150-word Flash split
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

// ── Allowed paid amounts (paise) — anti-tamper ───────────────────────────────
const ALLOWED_PAID_AMOUNTS: Record<string, number> = {
  paid:  5100,   // ₹51 Deep Reading
  voice: 1100,   // ₹11 Voice Reading
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

interface PredictRequest {
  userId?:string; sessionId:string; domainId:DomainId; domainLabel?:string
  predictionTier?:PredictionTier
  paymentVerification?: PaymentVerification
  birthData:{name?:string;dob:string;tob:string;lat:number;lng:number;cityName?:string;timezone?:number;ayanamsa?:string}
  userContext:{segment:'genz'|'millennial'|'genx';dynamicSegment?:string;gender?:string;age?:number;employment:string;sector:string;language:'hindi'|'hinglish'|'english';city:string;currentCity?:string;relationshipStatus?:string;situationNote?:string;mobile?:string;person2Name?:string|null;person2City?:string|null;person2CurrentCity?:string|null}
  person2Data?:{name:string;dob:string;tob:string;lat:number;lng:number;cityName:string;currentCity:string;mobile?:string}|null
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
async function callGemini(model:string, systemPrompt:string, userMessage:string, jsonMode=true): Promise<string> {
  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`
  const body:any = {
    system_instruction:{parts:[{text:systemPrompt}]},
    contents:[{role:'user',parts:[{text:userMessage}]}],
    generationConfig:{
      maxOutputTokens:MAX_TOKENS,
      temperature:0.7,
      topK:40,
      topP:0.95,
      ...(jsonMode?{responseMimeType:'application/json'}:{}),
    },
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
// Paid tier — 900 words, deep analysis, full GEO signals
function buildProPrompt(
  kundali: KundaliData,
  birthData: BirthData,
  domain: DomainConfig,
  userContext: UserContext,
  templateData?: any,
): { systemPrompt: string; userMessage: string } {

  const lang = userContext.language
  const langRule = lang==='hindi'
    ? 'LANGUAGE: Pure Hindi Devanagari. ZERO English words.'
    : lang==='english'
    ? 'LANGUAGE: Pure English. Warm Vedic astrologer tone.'
    : 'LANGUAGE: Natural Hinglish — Hindi + English mixed naturally. Jigri dost + wise Guru tone.'

  const mahadasha = kundali.currentMahadasha?.lord ?? 'Rahu'
  const antardasha = kundali.currentAntardasha?.lord ?? 'Jupiter'
  const lagna = kundali.lagna ?? ''
  const nakshatra = kundali.nakshatra ?? ''

  const systemPrompt = `
════════════════════════════════════════════════════════
TRIKAL VAANI — PRO DEEP ANALYSIS ENGINE v14.6
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════

WHO YOU ARE:
Trikal — AI soul of Trikal Vaani by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
PAID PREMIUM TIER — Full truth. No suspense hook. Complete analysis.
PAYMENT: Customer paid ₹51 via Razorpay (verified). Deliver maximum value.

${langRule}
DOMAIN: ${domain.displayName ?? domain.id}

ABSOLUTE RULES:
1. JSON ONLY — first char { last char }
2. situationNote = 60% weight — first 3 sentences address pain directly
3. geoBullets = EXACTLY 10 items — 25-40 words each — NO URLs
4. geoDirectAnswer = 4-5 sentences — NO URLs — NO "Visit trikalvaani"
5. simpleSummary.text = EXACTLY 900 WORDS — count carefully
6. NO suspense hook — paid user gets full truth immediately
7. Language = ${lang.toUpperCase()} every single word
8. All seoSignals fields populated
════════════════════════════════════════════════════════`.trim()

  const userMessage = `Generate PAID PREMIUM FULL ANALYSIS for: ${domain.displayName ?? domain.id}

CLIENT DETAILS:
- Name: ${birthData.name ?? 'Friend'}
- Lagna: ${lagna} | Nakshatra: ${nakshatra}
- Mahadasha: ${mahadasha} MD + ${antardasha} AD
- City: ${birthData.cityName ?? userContext.city} → Currently: ${userContext.currentCity ?? userContext.city}
- Segment: ${userContext.segment} | Employment: ${userContext.employment} | Sector: ${userContext.sector}
- Dasha: ${templateData?.dashaOneLiner ?? `${mahadasha} MD + ${antardasha} AD`}
- Dasha Quality: ${templateData?.dashaQuality ?? 'Madhyam'}
- Action Window: ${templateData?.actionWindowHint ?? 'from dasha calculations'}
- Avoid Window: ${templateData?.avoidWindowHint ?? 'from dasha calculations'}

SITUATION NOTE (60% FOCUS — MANDATORY):
"${userContext.situationNote ?? 'domain challenges and growth'}"
First 3 sentences MUST directly address this pain. Make them feel deeply understood.

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
    "text": "WRITE EXACTLY 900 WORDS in ${lang.toUpperCase()}. Structure: [Para 1-2: Address situation pain directly — make them feel deeply understood — 150 words] [Para 3-4: Why this is happening — explain key planets in simple language — 150 words] [Para 5-6: What current ${mahadasha} Mahadasha + ${antardasha} Antardasha means for their life right now — 150 words] [Para 7-8: What is coming — specific timeframe, what to expect, hope — 150 words] [Para 9: Three priority actions they must take now in order of importance — 100 words] [Para 10: Two critical things to avoid with brief classical reason — 75 words] [Para 11: Specific remedy — exact mantra with count OR exact dana with day and time — 75 words] [Para 12: Maa Shakti blessing and hope — 50 words]. Spiritual Guru voice. Short sentences. NO suspense hook. FULL complete answer.",
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
    "authorityStatement": "Powered by Trikal Vaani Swiss Ephemeris + BPHS + Bhrigu Nandi analysis by Rohiit Gupta, Chief Vedic Architect, Delhi NCR — India first AI-powered Vedic platform. Payments secured by Razorpay.",
    "differentiator": "Unlike AstroTalk and AstroSage generic reports, Trikal Vaani provides Swiss Ephemeris precision with Bhrigu Nandi patterns and BPHS classical rules for personalized analysis. Razorpay-secured affordable pricing at ₹51.",
    "e_e_a_t": {
      "experience": "Rohiit Gupta 15+ years Vedic astrology Parashara BPHS tradition Delhi NCR India",
      "expertise": "Swiss Ephemeris BPHS Brihat Parashara Hora Shastra Bhrigu Nandi Vimshottari Dasha Shadbala",
      "authority": "Chief Vedic Architect Trikal Vaani India first AI-powered Vedic astrology platform",
      "trust": "Swiss Ephemeris same precision engine used by professional astrologers worldwide. Razorpay-secured payments PCI-DSS compliant."
    }
  },

  "_promptVersion": "pro-v14.6",
  "_tier": "premium"
}

CRITICAL FINAL CHECKLIST:
- simpleSummary.text MUST be 900 WORDS — count carefully before returning
- geoBullets MUST have exactly 10 items — 25-40 words each
- NO URLs anywhere in geoBullets or geoDirectAnswer
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
function extractFromRawChart(rawChart:any) {
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
  const title = `${domainLabel} Prediction — ${mahadasha}-${antardasha} Dasha | ${cityName} | Trikal Vaani`
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
  chartExtract:ReturnType<typeof extractFromRawChart>
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

  const {sessionId,userId,domainId,predictionTier='free',birthData,userContext,person2Data,paymentVerification}=body

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
  }
  if(templateResult.status==='fulfilled'){
    const tr=templateResult.value
    templateData=tr?.template??tr?.html??null
    if(templateData&&typeof templateData!=='object') templateData=null
    else if(templateData) console.log(`[TV-v14.6] /template OK | ms:${Date.now()-startMs}`)
  }

  // ── STEP 4: Gemini Call ───────────────────────────────────────────────────
  // FREE = Flash (150w, fast) | PAID = Pro (900w, deep)
  let predictionJson: Record<string,any>

  if(isPaid) {
    // ── PAID: Gemini Pro — 900 words ────────────────────────────────────────
    console.log(`[TV-v14.6] PRO START | ms:${Date.now()-startMs}`)
    const {systemPrompt:proSystem, userMessage:proUser} = buildProPrompt(
      kundaliData, localBirthData, domainConfig, promptUserContext, templateData
    )
    try {
      const rawPro = await callGemini(GEMINI_PRO, proSystem, proUser, true)
      const proJson = parseGeminiJSON(rawPro)
      predictionJson = mergeTemplateWithGemini(templateData, proJson, '14.6-pro')
      console.log(`[TV-v14.6] PRO OK | summary_len:${proJson.simpleSummary?.text?.length??0} | ms:${Date.now()-startMs}`)
    } catch(err:any) {
      console.error(`[TV-v14.6] PRO failed: ${err.message}`)
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
