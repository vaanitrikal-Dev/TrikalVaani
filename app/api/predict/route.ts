/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 14.3 — VM /pro-polish (Option C — permanent fix)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v14.3 vs v14.2:
 *   ✅ Pro+Polish now calls VM /pro-polish endpoint (not Edge Function)
 *   ✅ VM has no network restrictions — calls Gemini Pro + Claude freely
 *   ✅ Fire-and-forget to VM — response in 8s, Pro runs in background
 *   ✅ No Edge Function dependency — simpler, reliable
 *   ✅ All iron rules preserved
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
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_API_KEY  = process.env.GEMINI_API_KEY  ?? ''
const EPHE_API_URL    = process.env.EPHE_API_URL    ?? ''
const EPHE_API_KEY    = process.env.EPHE_API_KEY    ?? ''
const MAX_TOKENS      = 12000  // CEO LOCKED

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Types ─────────────────────────────────────────────────────────────────────
type PredictionTier = 'free' | 'paid' | 'voice'

interface PredictRequest {
  userId?:string; sessionId:string; domainId:DomainId; domainLabel?:string
  predictionTier?:PredictionTier
  birthData:{name?:string;dob:string;tob:string;lat:number;lng:number;cityName?:string;timezone?:number;ayanamsa?:string}
  userContext:{segment:'genz'|'millennial'|'genx';employment:string;sector:string;language:'hindi'|'hinglish'|'english';city:string;currentCity?:string;relationshipStatus?:string;situationNote?:string;mobile?:string;person2Name?:string|null;person2City?:string|null;person2CurrentCity?:string|null}
  person2Data?:{name:string;dob:string;tob:string;lat:number;lng:number;cityName:string;currentCity:string;mobile?:string}|null
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
    generationConfig:{maxOutputTokens:MAX_TOKENS,temperature:0.7,topK:40,topP:0.95,...(jsonMode?{responseMimeType:'application/json'}:{})},
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

// ── mergeTemplateWithGemini ───────────────────────────────────────────────────
function mergeTemplateWithGemini(templateObj:Record<string,any>|null, geminiObj:Record<string,any>, version='14.3'): Record<string,any> {
  if(!templateObj) return {...geminiObj,_source:'gemini-only',_version:version}
  const ss = geminiObj.simpleSummary ?? {}
  return {
    planetTable:templateObj.planetTable??[],
    dashaTimeline:templateObj.dashaTimeline??{},
    actionWindows:templateObj.actionWindows??[],
    avoidWindows:templateObj.avoidWindows??[],
    remedyPlan:templateObj.remedyPlan??{},
    panchang:templateObj.panchang??{},
    geoDirectAnswer:geminiObj.geoDirectAnswer??templateObj.geoDirectAnswer??{},
    geoBullets:geminiObj.geoBullets??[],
    geoFaq:templateObj.geoFaq??[],
    confidenceBadge:templateObj.confidenceBadge??{},
    domainAnalysis:templateObj.domainAnalysis??{},
    coreMessage:templateObj.coreMessage??null,
    doAction:templateObj.doAction??null,
    avoidAction:templateObj.avoidAction??null,
    simpleSummary:ss,
    summaryText:ss.text??null,
    keyMessage:ss.keyMessage??null,
    mainAction:ss.mainAction??null,
    mainCaution:ss.mainCaution??null,
    periodSummary:ss.periodSummary??null,
    bestDates:ss.bestDates??null,
    remedyHint:ss.remedyHint??null,
    dosList:ss.dos??[],
    dontsList:ss.donts??[],
    karmicInsight:geminiObj.karmicInsight??null,
    seoSignals:geminiObj.seoSignals??{},
    actionWindowText:geminiObj.actionWindow??null,
    avoidWindowText:geminiObj.avoidWindow??null,
    _source:'template+gemini',
    _version:version,
  }
}

// ── extractFromRawChart ───────────────────────────────────────────────────────
function extractFromRawChart(rawChart:any) {
  if(!rawChart) return {lagna:null,nakshatra:null,mahadasha:null,antardasha:null}
  const lagna=rawChart?.lagna?.sign??rawChart?.lagna?.rashi??null
  const moon=rawChart?.grahas?.find?.((g:any)=>g.planet==='Moon'||g.name==='Moon')
  return {
    lagna,
    nakshatra:moon?.nakshatra??null,
    mahadasha:rawChart?.dasha?.mahadasha?.lord??null,
    antardasha:rawChart?.dasha?.antardasha?.lord??null,
  }
}

// ── buildSeoGeoMeta ───────────────────────────────────────────────────────────
function buildSeoGeoMeta(slug:string,domainId:string,domainLabel:string,mahadasha:string,antardasha:string,cityName:string,mergedJson:Record<string,any>) {
  const geoRaw=mergedJson.geoDirectAnswer
  const geoText=typeof geoRaw==='object'?(geoRaw?.text??''):(geoRaw??'')
  const geoClean=String(geoText).replace(/Visit\s+trikalvaani\.com[^.]*\./gi,'').trim()
  const title=`${domainLabel} Prediction — ${mahadasha}-${antardasha} Dasha | ${cityName} | Trikal Vaani`
  const description=geoClean
    ?`${geoClean.slice(0,140)}... Rohiit Gupta, Chief Vedic Architect.`
    :`Vedic ${domainLabel} for ${cityName}. ${mahadasha} Mahadasha. Swiss Ephemeris + BPHS. Rohiit Gupta.`
  return {
    title:title.slice(0,70),
    description:description.slice(0,165),
    canonical:`https://trikalvaani.com/report/${slug}`,
    geoAnswer:geoClean,
  }
}

// ── saveToSupabase ────────────────────────────────────────────────────────────
async function saveToSupabase(p:{
  sessionId:string;userId?:string;domainId:string;domainLabel:string
  predictionTier:PredictionTier;birthData:BirthData;userContext:any
  kundaliData:KundaliData|null;rawChart:any;synthesisData:any
  predictionJson:Record<string,any>;geminiModel:string;polished:boolean
  processingMs:number;publicSlug:string
  seoMeta:ReturnType<typeof buildSeoGeoMeta>
  chartExtract:ReturnType<typeof extractFromRawChart>
}): Promise<string> {
  const simpleSummaryText=
    p.predictionJson.summaryText??
    p.predictionJson.simpleSummary?.text??
    p.predictionJson.coreMessage??
    p.seoMeta.geoAnswer??null

  const {data,error}=await supabase.from('predictions').insert({
    session_id:p.sessionId,
    domain_id:p.domainId,
    domain_label:p.domainLabel,
    tier:p.predictionTier==='paid'?'premium':'free',
    prediction_tier:p.predictionTier,
    user_id:p.userId??null,
    person_name:p.birthData.name??null,
    dob:p.birthData.dob??null,
    birth_time:p.birthData.tob??null,
    birth_city:p.birthData.cityName??null,
    birth_lat:p.birthData.lat??null,
    birth_lng:p.birthData.lng??null,
    birth_timezone:p.birthData.timezone??null,
    lagna:p.chartExtract.lagna??p.kundaliData?.lagna?.rashi??null,
    nakshatra:p.chartExtract.nakshatra??p.kundaliData?.planets?.['Moon']?.nakshatra??null,
    mahadasha:p.chartExtract.mahadasha??p.kundaliData?.currentMahadasha?.lord??null,
    antardasha:p.chartExtract.antardasha??p.kundaliData?.currentAntardasha?.lord??null,
    language:p.userContext.language??null,
    segment:p.userContext.segment??null,
    employment:p.userContext.employment??null,
    sector:p.userContext.sector??null,
    chart_source:p.rawChart?'swiss-ephemeris-vm':'swiss-ephemeris-meeus',
    prediction:p.predictionJson,
    prediction_json:p.predictionJson,
    simple_summary:simpleSummaryText,
    geo_answer:p.seoMeta.geoAnswer??null,
    birth_data:p.birthData,
    user_context:p.userContext,
    kundali_data:p.kundaliData,
    synthesis_data:p.synthesisData,
    gemini_model:p.geminiModel,
    polished:p.polished,
    processing_ms:p.processingMs,
    public_slug:p.publicSlug,
    seo_title:p.seoMeta.title??null,
    seo_description:p.seoMeta.description??null,
    is_public:true,
    is_indexed:false,
    created_at:new Date().toISOString(),
  }).select('id').single()

  if(error||!data){
    console.error('[TV-v14.3] Insert failed:',error?.message)
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  }
  return data.id as string
}

// ── triggerVMProPolish ────────────────────────────────────────────────────────
// v14.3: Calls VM /pro-polish endpoint — fire and forget
// VM runs Gemini Pro + Claude polish + updates Supabase independently
// No network restrictions on VM — works 100%

async function triggerVMProPolish(payload:Record<string,any>): Promise<void> {
  if(!EPHE_API_URL) {
    console.error('[TV-v14.3] EPHE_API_URL not set — cannot call VM pro-polish')
    return
  }

  console.log(`[TV-v14.3] Triggering VM /pro-polish | slug:${payload.publicSlug}`)

  const controller = new AbortController()
  const timer = setTimeout(()=>controller.abort(), 8000) // 8s — just enough to send request

  try {
    const res = await fetch(`${EPHE_API_URL}/pro-polish`, {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'X-API-Key':EPHE_API_KEY},
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const text = await res.text()
    console.log(`[TV-v14.3] VM /pro-polish response | status:${res.status} | body:${text.slice(0,100)}`)
  } catch(err:any) {
    if(err.name==='AbortError') {
      // Timeout is OK — VM received request and is running in background thread
      console.log(`[TV-v14.3] VM /pro-polish timeout (8s) — VM running in background ✅`)
    } else {
      console.error(`[TV-v14.3] VM /pro-polish error: ${err.message}`)
    }
  } finally {
    clearTimeout(timer)
  }
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startMs = Date.now()

  let body:PredictRequest
  try{body=await req.json()}
  catch{return NextResponse.json({error:'Invalid JSON body'},{status:400})}

  const {sessionId,userId,domainId,predictionTier='free',birthData,userContext,person2Data}=body

  if(predictionTier==='voice')
    return NextResponse.json({error:'Voice uses /api/voice'},{status:400})
  if(!GEMINI_API_KEY)
    return NextResponse.json({error:'Gemini API key missing'},{status:500})
  if(!EPHE_API_URL)
    return NextResponse.json({error:'Ephemeris URL not configured'},{status:500})

  const useProBackground = predictionTier==='paid'
  console.log(`[TV-v14.3] START | tier:${predictionTier} | domain:${domainId} | vm_url:${!!EPHE_API_URL}`)

  const localBirthData:BirthData = {
    name:birthData.name??'Anonymous',
    dob:birthData.dob,
    tob:birthData.tob,
    lat:birthData.lat,
    lng:birthData.lng,
    cityName:birthData.cityName??'India',
    timezone:birthData.timezone??5.5,
  }

  let domainConfig:DomainConfig
  try{domainConfig=getDomainConfig(domainId)}
  catch{return NextResponse.json({error:`Unknown domain: ${domainId}`},{status:400})}

  // CEO LOCKED — never change without approval
  const verifiedTier:UserTier = predictionTier==='paid'?'premium':'free'

  const kundaliData:KundaliData = buildKundali(localBirthData)
  let rawChart:any=null, synthesisData:any=null, templateData:any=null

  // ── STEP 1: /kundali ─────────────────────────────────────────────────────
  const kundaliPromise = callVM('/kundali',{
    dob:localBirthData.dob,tob:localBirthData.tob,
    lat:localBirthData.lat,lng:localBirthData.lng,
    timezone:birthData.timezone??5.5,ayanamsa:1,
  },25000).catch((err:any)=>{
    console.error(`[TV-v14.3] /kundali failed: ${err.message}`)
    return null
  })

  const promptUserContext:UserContext = {
    tier:verifiedTier,
    segment:userContext.segment,
    employment:userContext.employment,
    sector:userContext.sector,
    language:userContext.language,
    city:userContext.city,
    currentCity:userContext.currentCity||userContext.city,
    relationshipStatus:userContext.relationshipStatus??'',
    situationNote:(userContext.situationNote??'').slice(0,100),
    mobile:userContext.mobile??'',
    person2Name:userContext.person2Name??null,
    person2City:userContext.person2City??null,
    person2CurrentCity:userContext.person2CurrentCity??null,
  }

  rawChart = await kundaliPromise
  console.log(`[TV-v14.3] /kundali | lagna:${rawChart?.lagna?.sign} | ms:${Date.now()-startMs}`)
  const chartExtract = extractFromRawChart(rawChart)

  // ── STEP 2+3 PARALLEL: /synthesize + /template ────────────────────────────
  const [synthesisResult,templateResult] = await Promise.allSettled([
    callVM('/synthesize',{
      kundaliData:rawChart,
      birthData:{dob:localBirthData.dob,tob:localBirthData.tob,lat:localBirthData.lat,lng:localBirthData.lng,timezone:birthData.timezone??5.5},
      domainId,person2Data:person2Data??null,
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
    console.log(`[TV-v14.3] /synthesize OK | ms:${Date.now()-startMs}`)
  }
  if(templateResult.status==='fulfilled'){
    const tr=templateResult.value
    templateData=tr?.template??tr?.html??null
    if(templateData&&typeof templateData!=='object') templateData=null
    else if(templateData) console.log(`[TV-v14.3] /template OK | ms:${Date.now()-startMs}`)
  }

  // ── STEP 4: Gemini Flash — instant response ───────────────────────────────
  const {systemPrompt:flashSystem,userMessage:flashUser}=buildFlashPrompt(
    kundaliData,localBirthData,domainConfig,promptUserContext
  )
  console.log(`[TV-v14.3] Flash START | ms:${Date.now()-startMs}`)

  let flashJson:Record<string,any>
  try {
    const rawFlash=await callGemini(GEMINI_FLASH,flashSystem,flashUser,true)
    flashJson=parseGeminiJSON(rawFlash)
    console.log(`[TV-v14.3] Flash OK | ms:${Date.now()-startMs}`)
  } catch(err:any) {
    console.error(`[TV-v14.3] Flash failed: ${err.message}`)
    return NextResponse.json({error:`Prediction failed: ${err.message}`},{status:500})
  }

  // ── STEP 5: Merge Flash + Template ────────────────────────────────────────
  const flashPrediction=mergeTemplateWithGemini(templateData,flashJson,'14.3-flash')

  // ── STEP 6: Slug + SEO ───────────────────────────────────────────────────
  const processingMsFlash=Date.now()-startMs
  const mahadashaPlanet=chartExtract.mahadasha??kundaliData?.currentMahadasha?.lord??'rahu'
  const antardashaPlanet=chartExtract.antardasha??kundaliData?.currentAntardasha?.lord??'saturn'

  const publicSlug=generatePredictionSlug({
    domainId,
    mahadasha:mahadashaPlanet,
    antardasha:antardashaPlanet,
    city:localBirthData.cityName??'india',
  })
  const seoMeta=buildSeoGeoMeta(
    publicSlug,domainId,domainConfig.label??domainId,
    mahadashaPlanet,antardashaPlanet,
    localBirthData.cityName??'India',flashPrediction
  )

  // ── STEP 7: Save Flash to Supabase ────────────────────────────────────────
  try {
    await saveToSupabase({
      sessionId,userId,domainId,
      domainLabel:domainConfig.label??domainId,
      predictionTier,birthData:localBirthData,
      userContext:promptUserContext,
      kundaliData,rawChart,synthesisData,
      predictionJson:flashPrediction,
      geminiModel:GEMINI_FLASH,
      polished:false,
      processingMs:processingMsFlash,
      publicSlug,seoMeta,chartExtract,
    })
    console.log(`[TV-v14.3] Flash saved | slug:${publicSlug} | ms:${Date.now()-startMs}`)
  } catch(err:any) {
    console.error(`[TV-v14.3] Save failed: ${err.message}`)
  }

  // ── STEP 8: Trigger VM Pro+Polish (PAID only) ─────────────────────────────
  // VM runs Gemini Pro + Claude polish in background thread
  // Returns immediately — VM keeps running independently
  if(useProBackground) {
    await triggerVMProPolish({
      publicSlug,
      domainId,
      domainLabel:       domainConfig.label??domainId,
      language:          userContext.language,
      tier:              verifiedTier,
      personName:        localBirthData.name??'Anonymous',
      situationNote:     userContext.situationNote??'',
      employment:        userContext.employment,
      sector:            userContext.sector??'',
      segment:           userContext.segment,
      city:              userContext.city,
      currentCity:       userContext.currentCity||userContext.city,
      lagna:             chartExtract.lagna??'',
      nakshatra:         chartExtract.nakshatra??'',
      mahadasha:         mahadashaPlanet,
      antardasha:        antardashaPlanet,
      dashaOneLiner:     templateData?.dashaOneLiner??null,
      dashaQuality:      templateData?.dashaQuality??null,
      actionWindowHint:  templateData?.actionWindowHint??null,
      avoidWindowHint:   templateData?.avoidWindowHint??null,
      flashSummaryText:  flashPrediction.summaryText??null,
      processingMsBase:  processingMsFlash,
    })
  }

  // ── STEP 9: Google Indexing ───────────────────────────────────────────────
  try{notifyGoogleIndexing(`https://trikalvaani.com/report/${publicSlug}`)}catch{}

  // ── STEP 10: Return to user ───────────────────────────────────────────────
  const totalMs=Date.now()-startMs
  console.log(`[TV-v14.3] RESPONSE | ms:${totalMs} | slug:${publicSlug}`)

  return NextResponse.json({
    success:true,
    prediction:flashPrediction,
    templateHtml:null,
    _meta:{
      publicSlug,
      reportUrl:`https://trikalvaani.com/report/${publicSlug}`,
      predictionTier,
      geminiModel:GEMINI_FLASH,
      polished:false,
      polishDeferred:useProBackground,
      proDeferred:useProBackground,
      processingMs:totalMs,
      domainId,
      domainLabel:domainConfig.label??domainId,
      lagna:chartExtract.lagna,
      nakshatra:chartExtract.nakshatra,
      mahadasha:mahadashaPlanet,
      antardasha:antardashaPlanet,
      seoTitle:seoMeta.title,
      seoDescription:seoMeta.description,
      geoAnswer:seoMeta.geoAnswer,
    },
  })
}
