'use client'

/**
 * ============================================================
 * TRIKAL VAANI — Public SEO Report Client
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/report/[slug]/ReportPublicClient.tsx
 * VERSION: 6.0 — COMPLETE REBUILD
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FIXES v6.0:
 *   ✅ GEO answer as 5-6 bullet points (high SEO + GEO impact)
 *   ✅ Trikal Ka Sandesh — NO duplicate (GEO in S1, Gemini in S2)
 *   ✅ North Indian Kundali Chart (SVG from planetTable)
 *   ✅ Ordinal suffix fix (1st 2nd 3rd 4th...)
 *   ✅ PDF download (browser print)
 *   ✅ Author image path fixed → /images/founder.png
 *   ✅ All 9 planets table preserved
 *   ✅ Dasha 4 levels
 *   ✅ Action Windows + Remedy + Panchang
 *   ✅ Maa Shakti permanent
 *   ✅ ₹51 locked CTA
 *   ✅ SEO/GEO/E-E-A-T fully preserved
 * ============================================================
 */

import { useState } from 'react'
import Link from 'next/link'
import SiteNav    from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowLeft, Lock, Download } from 'lucide-react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GOLD    = '#D4AF37'
const G       = (a: number) => `rgba(212,175,55,${a})`
const BG_DARK = '#080B12'
const BG_CARD = 'rgba(4,8,20,0.92)'

const ARZI_AMT      = [101,201,501,1001,2101,5001,11000,21000,51000,108000]
const DHANYAWAD_AMT = [101,251,501,1008,2501,5001,10001,21000,51000,108000]

const PLANET_GLYPH: Record<string,string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿',
  Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
}
const PLANET_HI: Record<string,string> = {
  Sun:'सूर्य', Moon:'चंद्र', Mars:'मंगल', Mercury:'बुध',
  Jupiter:'गुरु', Venus:'शुक्र', Saturn:'शनि', Rahu:'राहु', Ketu:'केतु',
}

const RASHI_LIST = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena',
]

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface SeoMeta { title:string; description:string; canonical:string }
interface ReportPublicClientProps {
  report: Record<string,unknown>
  slug:   string
  meta:   SeoMeta
}
interface PlanetRow {
  planet:string; planet_hi:string; rashi:string; house:number
  degree:number; nakshatra:string; retrograde:boolean
  dignity:string; shadbala:number; strength:string; domain_note:string
}
interface ActionWindow { window:string; strength:string; reason:string }
interface RemedyItem   { planet:string; mantra:string; count:string; dana:string; vrat:string }

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function s(v:unknown, fb='—'):string {
  return typeof v==='string' && v.trim() ? v.trim() : fb
}
function safeArr<T>(v:unknown):T[] { return Array.isArray(v) ? v as T[] : [] }
function safeObj(v:unknown):Record<string,unknown> {
  return v && typeof v==='object' && !Array.isArray(v)
    ? v as Record<string,unknown> : {}
}
function ordinal(n:number):string {
  if(n===1) return '1st'
  if(n===2) return '2nd'
  if(n===3) return '3rd'
  return `${n}th`
}

// Split GEO text into 5-6 punchy bullet points
function splitGeoToBullets(text:string):string[] {
  if(!text || text==='—') return []
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? []
  if(sentences.length >= 3) {
    return sentences.map(s=>s.trim()).filter(s=>s.length>10).slice(0,6)
  }
  // Fallback: split on comma/semicolon
  const parts = text.split(/[,;]/).map(p=>p.trim()).filter(p=>p.length>20)
  if(parts.length >= 3) return parts.slice(0,6)
  // Last resort: return as single item
  return [text]
}

// ─── NORTH INDIAN KUNDALI CHART ───────────────────────────────────────────────

function KundaliChart({ lagna, planets }: { lagna:string; planets:PlanetRow[] }) {
  const lagnaIdx = RASHI_LIST.findIndex(r =>
    r.toLowerCase() === lagna.toLowerCase() ||
    lagna.toLowerCase().startsWith(r.toLowerCase().slice(0,4))
  )
  if(lagnaIdx < 0) return null

  // Map house number → planets in that house
  const houseMap: Record<number,string[]> = {}
  planets.forEach(p => {
    if(!houseMap[p.house]) houseMap[p.house] = []
    houseMap[p.house].push(PLANET_HI[p.planet]?.slice(0,3) || p.planet.slice(0,3))
  })

  // North Indian fixed cells: [house, x, y, width, height]
  const cells: [number,number,number,number,number][] = [
    [12,  0,  0, 100, 100],
    [ 1,100,  0, 200, 100],
    [ 2,300,  0, 100, 100],
    [11,  0,100, 100, 200],
    [ 3,300,100, 100, 200],
    [10,  0,300, 100, 100],
    [ 9,100,300, 200, 100],
    [ 8,300,300, 100, 100],
    [ 4,100,100, 100, 100],
    [ 5,200,100, 100, 100],
    [ 6,100,200, 100, 100],
    [ 7,200,200, 100, 100],
  ]

  const houseToRashi = (h:number) => RASHI_LIST[(lagnaIdx + h - 1) % 12]

  return (
    <div style={{display:'flex',justifyContent:'center'}}>
    <svg width="360" height="360" viewBox="0 0 400 400"
  style={{maxWidth:'100%', background:'#060A14', borderRadius:'8px',
  border:'1px solid rgba(212,175,55,0.2)'}}>
  <rect width="400" height="400" fill="#060A14" rx="8"/>
        {/* North Indian diagonal lines */}
        <line x1="100" y1="100" x2="200" y2="200" stroke={G(0.25)} strokeWidth="1"/>
        <line x1="300" y1="100" x2="200" y2="200" stroke={G(0.25)} strokeWidth="1"/>
        <line x1="100" y1="300" x2="200" y2="200" stroke={G(0.25)} strokeWidth="1"/>
        <line x1="300" y1="300" x2="200" y2="200" stroke={G(0.25)} strokeWidth="1"/>

        {cells.map(([h,x,y,w,ht])=>{
          const isLagna   = h === 1
          const planetsHere = houseMap[h] ?? []
          const rashi     = houseToRashi(h)
          return (
            <g key={h}>
              <rect x={x} y={y} width={w} height={ht}
                fill={isLagna ? G(0.12) : 'transparent'}
                stroke={G(isLagna ? 0.55 : 0.2)}
                strokeWidth={isLagna ? 1.5 : 1}/>
              {/* House number top-left */}
              <text x={x+6} y={y+14} fill={G(0.4)} fontSize="10"
                fontFamily="Georgia,serif">{h}</text>
              {/* Rashi abbrev top-right */}
              <text x={x+w-5} y={y+14} fill={G(0.3)} fontSize="8"
                textAnchor="end" fontFamily="Georgia,serif">
                {rashi.slice(0,3)}
              </text>
              {/* Lagna L marker */}
              {isLagna && (
                <text x={x+w/2} y={y+ht-8} fill={GOLD} fontSize="11"
                  textAnchor="middle" fontWeight="700" fontFamily="Georgia,serif">L</text>
              )}
              {/* Planets */}
              {planetsHere.map((pl,i)=>(
                <text key={`${h}-${pl}-${i}`}
                  x={x+w/2}
                  y={y + ht/2 + (i - (planetsHere.length-1)/2) * 14}
                  fill={isLagna ? GOLD : '#94a3b8'}
                  fontSize="10" textAnchor="middle"
                  fontWeight={isLagna?'700':'400'}
                  fontFamily="Georgia,serif">{pl}</text>
              ))}
            </g>
          )
        })}
     <text x="200" y="395" fill={G(0.3)} fontSize="9"
  textAnchor="middle" fontFamily="Georgia,serif">{lagna} Lagna</text>
      </svg>
    </div>
  )
}

// ─── PDF DOWNLOAD ─────────────────────────────────────────────────────────────

function PDFBtn({domainLabel}:{domainLabel:string}) {
  const handle = () => {
    const st = document.createElement('style')
    st.id = 'tv-print'
    st.textContent = `
      @media print {
        nav,footer,.site-nav,.site-footer,.no-print{display:none!important}
        body{background:#fff!important;color:#000!important}
        *{color:#000!important;border-color:#ccc!important;background:transparent!important}
        h1,h2{color:#333!important}
      }`
    document.head.appendChild(st)
    window.print()
    setTimeout(()=>{ const e=document.getElementById('tv-print'); if(e)e.remove() },1500)
  }
  return (
    <button onClick={handle} style={{display:'inline-flex',alignItems:'center',gap:'6px',
      padding:'10px 18px',borderRadius:'10px',background:G(0.08),
      border:`1px solid ${G(0.25)}`,color:GOLD,fontSize:'12px',
      fontWeight:600,cursor:'pointer'}}>
      <Download size={14}/>
      PDF Download
    </button>
  )
}

// ─── MAA SHAKTI ───────────────────────────────────────────────────────────────

function MaaShakti({slug}:{slug:string}) {
  const [tab,setTab] = useState<'arzi'|'dhanyawad'>('arzi')
  const amts  = tab==='arzi' ? ARZI_AMT : DHANYAWAD_AMT
  const waBase= tab==='arzi'
    ? `Pranam%20Rohiit%20ji%2C%20Maa%20ko%20Arzi%20karna%20chahta%20hoon.%20Report:%20${slug}.%20Jai%20Maa%20Shakti!`
    : `Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20Report:%20${slug}.`
  return (
    <div style={{background:`linear-gradient(135deg,${G(0.07)} 0%,rgba(124,58,237,0.07) 100%)`,
      border:`1px solid ${G(0.25)}`,borderRadius:'20px',padding:'28px 20px',marginBottom:'16px'}}>
      <div style={{textAlign:'center',marginBottom:'20px'}}>
        <div style={{fontSize:'38px',marginBottom:'8px'}}>🙏</div>
        <h2 style={{margin:'0 0 6px',color:GOLD,fontSize:'19px',
          fontFamily:'Georgia,serif',fontWeight:700}}>Maa Shakti Ki Divya Seva</h2>
        <p style={{margin:'0 auto',color:G(0.65),fontSize:'12px',
          lineHeight:1.6,maxWidth:'300px'}}>
          Yeh fees nahi — yeh dil ki dakshina hai. Koi seema nahi devotion ki.</p>
      </div>
      <div style={{display:'flex',gap:'8px',marginBottom:'16px',
        background:'rgba(0,0,0,0.3)',padding:'4px',borderRadius:'12px'}}>
        {(['arzi','dhanyawad'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'9px',
            borderRadius:'10px',border:'none',cursor:'pointer',fontWeight:700,
            fontSize:'12px',transition:'all 0.3s',
            background:tab===t?`linear-gradient(135deg,${GOLD},#A8820A)`:'transparent',
            color:tab===t?'#080B12':G(0.55)}}>
            {t==='arzi'?'🪔 Arzi to Maa':'🌺 Dhanyawad to Maa'}
          </button>
        ))}
      </div>
      <p style={{color:'#94a3b8',fontSize:'12px',margin:'0 0 14px',
        lineHeight:1.6,textAlign:'center'}}>
        {tab==='arzi'
          ?'Apni deepest prayer Maa ke charnon mein rakhein. Rohiit ji personally transmit karenge.'
          :'Maa ka Dhanyawad karein — gratitude hi sabse badi puja hai.'}
      </p>
      <div style={{display:'flex',flexWrap:'wrap',gap:'8px',
        justifyContent:'center',marginBottom:'14px'}}>
        {amts.map(a=>(
          <a key={a}
            href={`https://wa.me/919211804111?text=${waBase}%20Dakshina%20Rs.${a}`}
            target="_blank" rel="noopener noreferrer"
            style={{padding:'5px 12px',borderRadius:'20px',
              border:`1px solid ${G(0.3)}`,color:GOLD,fontSize:'12px',
              fontWeight:600,textDecoration:'none',background:G(0.08)}}>
            ₹{a.toLocaleString('en-IN')}
          </a>
        ))}
        <a href={`https://wa.me/919211804111?text=${waBase}%20(apni%20dakshina%20bataunga)`}
          target="_blank" rel="noopener noreferrer"
          style={{padding:'5px 12px',borderRadius:'20px',
            border:`1px dashed ${G(0.3)}`,color:GOLD,fontSize:'12px',
            fontWeight:600,textDecoration:'none'}}>
          Apni dakshina ✦
        </a>
      </div>
      <div style={{display:'flex',justifyContent:'center'}}>
        <a href={`https://wa.me/919211804111?text=${waBase}`}
          target="_blank" rel="noopener noreferrer"
          style={{padding:'13px 30px',borderRadius:'12px',
            background:`linear-gradient(135deg,${GOLD},#F5D76E,${GOLD})`,
            color:'#080B12',fontSize:'14px',fontWeight:700,textDecoration:'none',
            boxShadow:`0 0 25px ${G(0.3)}`}}>
          {tab==='arzi'?'🙏 Arzi Submit Karein':'🌺 Dhanyawad Dein'}
        </a>
      </div>
      <p style={{color:'#1e293b',fontSize:'10px',margin:'12px 0 0',
        textAlign:'center',lineHeight:1.5}}>
        Trikal Vaani dakshina se profit nahi karta. Sab Vedic puja samagri +
        charitable giving mein jaata hai. Rohiit Gupta intermediary hain.
      </p>
    </div>
  )
}

// ─── LOCKED SECTION ───────────────────────────────────────────────────────────

function LockedSection({slug}:{slug:string}) {
  const features = [
    '✓ Complete planetary analysis (all 9 grahas)',
    '✓ Bhrigu Nandi pattern insights',
    '✓ Shadbala strength breakdown',
    '✓ 3 action windows with exact dates',
    '✓ Full remedy plan (mantra+dana+vrat)',
    '✓ 30-day roadmap',
    '✓ Panchang muhurta guidance',
    '✓ 800-1200 word deep analysis',
  ]
  return (
    <div style={{position:'relative',borderRadius:'16px',overflow:'hidden',
      marginBottom:'16px',border:`1px solid ${G(0.15)}`}}>
      <div style={{padding:'20px',filter:'blur(5px)',pointerEvents:'none',
        userSelect:'none',background:BG_CARD}}>
        <p style={{color:GOLD,fontSize:'11px',fontWeight:700,marginBottom:'8px',
          textTransform:'uppercase'}}>📊 Complete Analysis</p>
        <p style={{color:'#94a3b8',fontSize:'13px',margin:'0 0 8px'}}>
          Graha yogas aur dasha periods ka poora vishleshan...</p>
        <p style={{color:'#22c55e',fontSize:'11px',fontWeight:600}}>
          🗓 3 Action Windows with exact dates...</p>
      </div>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',
        alignItems:'center',justifyContent:'center',padding:'24px',
        background:'linear-gradient(to bottom,rgba(8,11,18,0.1) 0%,rgba(8,11,18,0.98) 28%)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'50px',height:'50px',borderRadius:'50%',
            background:G(0.1),border:`1px solid ${G(0.35)}`,
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 14px'}}>
            <Lock size={20} style={{color:GOLD}}/>
          </div>
          <p style={{margin:'0 0 4px',color:'#fff',fontSize:'17px',
            fontWeight:700,fontFamily:'Georgia,serif'}}>
            Trikal Ne Aur Bhi Dekha Hai</p>
          <p style={{margin:'0 0 14px',color:'#94a3b8',fontSize:'12px',
            lineHeight:1.6,maxWidth:'280px'}}>
            Complete analysis, yogas, remedies aur 30-day roadmap taiyaar hai</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',
            marginBottom:'18px',maxWidth:'320px',margin:'0 auto 18px',textAlign:'left'}}>
            {features.map((f,i)=>(
              <p key={i} style={{margin:0,color:'#94a3b8',fontSize:'11px',lineHeight:1.5}}>{f}</p>
            ))}
          </div>
          <Link href={`/upgrade?slug=${slug}&tier=basic`}
            style={{display:'block',padding:'14px 32px',borderRadius:'12px',
              background:`linear-gradient(135deg,${GOLD},#F5D76E,${GOLD})`,
              color:'#080B12',fontSize:'14px',fontWeight:700,textDecoration:'none',
              boxShadow:`0 0 30px ${G(0.35)}`,marginBottom:'8px'}}>
            🔓 Unlock Full Report — ₹51 Only
          </Link>
          <p style={{margin:'6px 0 0',color:'#475569',fontSize:'10px'}}>
            One-time · Instant access · Razorpay secure</p>
          <a href="https://wa.me/919211804111?text=Rohiit%20ji%2C%20personal%20consultation%20chahiye"
            target="_blank" rel="noopener noreferrer"
            style={{display:'block',marginTop:'10px',color:'#25D366',
              fontSize:'12px',textDecoration:'none',fontWeight:600}}>
            📞 Ya Rohiit ji se seedha baat karein — ₹499
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ReportPublicClient({report,slug,meta}:ReportPublicClientProps) {

  // ── Core fields from Supabase row ────────────────────────────────────────
  const domainLabel = s(report.domain_label, 'Vedic Reading')
  const birthCity   = s(report.birth_city,   'India')
  const nakshatra   = s(report.nakshatra)

  // ── prediction_json — merged template+gemini (route_v11) ─────────────────
  const pj = safeObj(report.prediction_json)

  // ── Lagna ─────────────────────────────────────────────────────────────────
  const lagna = s(report.lagna) !== '—'
    ? s(report.lagna)
    : s((pj as any)?.lagnaRashi ?? (pj as any)?.lagna?.sign)

  // ── Dasha timeline ────────────────────────────────────────────────────────
  const dashaTL    = safeObj(pj.dashaTimeline)
  const mdObj      = safeObj(dashaTL.mahadasha)
  const adObj      = safeObj(dashaTL.antardasha)
  const ptObj      = safeObj(dashaTL.pratyantar)
  const skObj      = safeObj(dashaTL.sookshma)
  const mahadasha  = s(mdObj.lord) !== '—' ? s(mdObj.lord)  : s(report.mahadasha)
  const antardasha = s(adObj.lord) !== '—' ? s(adObj.lord)  : s(report.antardasha)
  const pratyantar = s(ptObj.lord)
  const sookshma   = s(skObj.lord)

  // ── GEO Direct Answer — S1 bullets (SEO/AI search) ───────────────────────
  const geoObj     = safeObj(pj.geoDirectAnswer)
  const geoText    = s(geoObj.text as string) !== '—'
    ? s(geoObj.text as string)
    : s(report.geo_answer as string)
  const geoBullets = splitGeoToBullets(geoText)

  // ── Trikal Ka Sandesh — S2 Gemini personalized (NOT same as GEO) ─────────
  const coreMessage = s(pj.coreMessage as string)
  const doAction    = s(pj.doAction    as string)
  const avoidAction = s(pj.avoidAction as string)

  // ── Planet table ──────────────────────────────────────────────────────────
  const planetTable   = safeArr<PlanetRow>(pj.planetTable)

  // ── Action windows ────────────────────────────────────────────────────────
  const actionWindows = safeArr<ActionWindow>(pj.actionWindows)

  // ── Remedy plan ───────────────────────────────────────────────────────────
  const remedyPlan = safeObj(pj.remedyPlan)
  const remedies   = safeArr<RemedyItem>(remedyPlan.remedies)
  const genRem     = safeObj(remedyPlan.general)

  // ── Panchang ──────────────────────────────────────────────────────────────
  const panchang = safeObj(pj.panchang)

  // ── Confidence badge ──────────────────────────────────────────────────────
  const confBadge = safeObj(pj.confidenceBadge)
  const confLabel = s(confBadge.label as string)

  // ── Template HTML legacy (should be null in v11) ──────────────────────────
  const templateHtml = typeof report.template_html === 'string'
    ? report.template_html : null

  const hasS2 = coreMessage !== '—' || doAction !== '—' || avoidAction !== '—'

  return (
    <div style={{minHeight:'100vh',background:BG_DARK}}>
      <SiteNav/>
      <main style={{paddingTop:'96px',paddingBottom:'80px',padding:'96px 16px 80px'}}>
        <div style={{maxWidth:'680px',margin:'0 auto'}}>

          {/* Breadcrumb — SEO BreadcrumbList */}
          <nav aria-label="breadcrumb" style={{display:'flex',alignItems:'center',
            gap:'8px',marginBottom:'20px'}}>
            <Link href="/" style={{color:'#64748b',fontSize:'12px',textDecoration:'none'}}>Home</Link>
            <span style={{color:'#334155'}}>›</span>
            <Link href="/services" style={{color:'#64748b',fontSize:'12px',textDecoration:'none'}}>Readings</Link>
            <span style={{color:'#334155'}}>›</span>
            <span style={{color:'#94a3b8',fontSize:'12px'}}>{domainLabel}</span>
          </nav>

          {/* ── S1: MAHAKAAL KA ASHIRWAD + GEO BULLETS ───────────────── */}
          <div style={{background:`linear-gradient(135deg,${G(0.1)} 0%,rgba(8,11,18,0.95) 70%)`,
            border:`1px solid ${G(0.2)}`,borderRadius:'20px',
            padding:'24px 20px',marginBottom:'14px',textAlign:'center'}}>

            <div style={{display:'flex',alignItems:'center',justifyContent:'center',
              gap:'10px',marginBottom:'14px'}}>
              <div style={{height:'1px',flex:1,
                background:`linear-gradient(to right,transparent,${G(0.3)})`}}/>
              <span style={{color:GOLD,fontSize:'11px',fontWeight:700,
                letterSpacing:'0.1em',textTransform:'uppercase',whiteSpace:'nowrap'}}>
                🔱 Mahakaal Ka Ashirwad
              </span>
              <div style={{height:'1px',flex:1,
                background:`linear-gradient(to left,transparent,${G(0.3)})`}}/>
            </div>

            <p style={{margin:'0 0 6px',color:G(0.6),fontSize:'11px',fontWeight:600,
              letterSpacing:'0.08em',textTransform:'uppercase'}}>
              Vedic Astrology Analysis · {domainLabel}
            </p>
            <h1 style={{margin:'0 0 6px',color:'#fff',fontSize:'20px',
              fontFamily:'Georgia,serif',fontWeight:700}}>
              {mahadasha} Mahadasha · {antardasha} Antardasha
            </h1>
            <p style={{margin:'0 0 16px',color:'#94a3b8',fontSize:'13px'}}>
              {birthCity} · {lagna} Lagna · {nakshatra} Nakshatra
            </p>

            {/* Authority badges */}
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',
              justifyContent:'center',marginBottom:'12px'}}>
              {[
                {icon:'⚡',label:'Swiss Ephemeris',color:'#60a5fa'},
                {icon:'📖',label:'BPHS Classical', color:'#a78bfa'},
                {icon:'🔮',label:'Bhrigu Nandi',   color:'#f472b6'},
                {icon:'⚖️',label:'Shadbala',        color:'#34d399'},
              ].map(b=>(
                <span key={b.label} style={{display:'inline-flex',alignItems:'center',
                  gap:'4px',padding:'4px 10px',borderRadius:'20px',fontSize:'10px',
                  fontWeight:600,background:`${b.color}15`,
                  border:`1px solid ${b.color}30`,color:b.color}}>
                  {b.icon} {b.label}
                </span>
              ))}
            </div>

            {confLabel !== '—' && (
              <span style={{display:'inline-block',padding:'3px 10px',
                borderRadius:'20px',background:G(0.1),border:`1px solid ${G(0.3)}`,
                color:GOLD,fontSize:'10px',fontWeight:600,marginBottom:'14px'}}>
                ✓ {confLabel}
              </span>
            )}

            {/* GEO Direct Answer — bullet points (AI search featured snippet) */}
            {geoBullets.length > 0 && (
              <div style={{background:G(0.06),border:`1px solid ${G(0.15)}`,
                borderRadius:'14px',padding:'16px',marginTop:'14px',textAlign:'left'}}>
                <p style={{margin:'0 0 12px',color:G(0.65),fontSize:'10px',fontWeight:700,
                  textTransform:'uppercase',letterSpacing:'0.08em'}}>
                  🔮 Vedic Analysis — Trikal Ka Sandesh
                </p>
                <ul style={{margin:0,padding:0,listStyle:'none',
                  display:'flex',flexDirection:'column',gap:'10px'}}>
                  {geoBullets.map((pt,i)=>(
                    <li key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
                      <span style={{color:GOLD,fontSize:'13px',flexShrink:0,marginTop:'2px'}}>
                        {['🔱','✦','◆','▸','🪐','✧'][i%6]}
                      </span>
                      <p style={{margin:0,color:'#cbd5e1',fontSize:'13px',lineHeight:1.75}}>
                        {pt.replace(/^[.!?,;\s]+/,'').trim()}
                      </p>
                    </li>
                  ))}
                </ul>
                <p style={{margin:'12px 0 0',color:'#334155',fontSize:'10px'}}>
                  By Rohiit Gupta, Chief Vedic Architect · trikalvaani.com
                </p>
              </div>
            )}
          </div>

          {/* ── S2: TRIKAL KA SANDESH — Gemini personalized (no duplicate) ── */}
          {hasS2 && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,
              borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,
                textTransform:'uppercase',letterSpacing:'0.08em'}}>
                ✨ Trikal Ka Sandesh
              </p>

              {coreMessage !== '—' && (
                <div style={{background:`linear-gradient(135deg,${G(0.12)},${G(0.04)})`,
                  border:`1px solid ${G(0.3)}`,borderRadius:'10px',
                  padding:'12px 14px',marginBottom:'12px'}}>
                  <p style={{margin:'0 0 4px',color:GOLD,fontSize:'10px',fontWeight:700,
                    textTransform:'uppercase',letterSpacing:'0.08em'}}>🔑 Core Message</p>
                  <p style={{margin:0,color:'#fff',fontSize:'14px',fontWeight:600,
                    fontFamily:'Georgia,serif',lineHeight:1.6}}>{coreMessage}</p>
                </div>
              )}

              {(doAction !== '—' || avoidAction !== '—') && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  {doAction !== '—' && (
                    <div style={{background:'rgba(34,197,94,0.06)',
                      border:'1px solid rgba(34,197,94,0.2)',
                      borderRadius:'10px',padding:'12px'}}>
                      <p style={{margin:'0 0 4px',color:'#22c55e',fontSize:'10px',
                        fontWeight:700,letterSpacing:'0.06em'}}>✓ ABHI KAREIN</p>
                      <p style={{margin:0,color:'#86efac',fontSize:'12px',
                        lineHeight:1.5}}>{doAction}</p>
                    </div>
                  )}
                  {avoidAction !== '—' && (
                    <div style={{background:'rgba(239,68,68,0.06)',
                      border:'1px solid rgba(239,68,68,0.2)',
                      borderRadius:'10px',padding:'12px'}}>
                      <p style={{margin:'0 0 4px',color:'#ef4444',fontSize:'10px',
                        fontWeight:700,letterSpacing:'0.06em'}}>✗ BACHEIN</p>
                      <p style={{margin:0,color:'#fca5a5',fontSize:'12px',
                        lineHeight:1.5}}>{avoidAction}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── S3: KUNDALI STATS ─────────────────────────────────────── */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',
            gap:'10px',marginBottom:'14px'}}>
            {[
              {label:'Lagna',     value:lagna},
              {label:'Nakshatra', value:nakshatra},
              {label:'Mahadasha', value:mahadasha},
              {label:'Antardasha',value:antardasha},
            ].map(({label,value})=>(
              <div key={label} style={{padding:'10px 14px',borderRadius:'10px',
                background:G(0.08),border:`1px solid ${G(0.2)}`,textAlign:'center'}}>
                <p style={{margin:'0 0 2px',color:G(0.6),fontSize:'9px',
                  textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>
                  {label}
                </p>
                <p style={{margin:0,color:'#fff',fontSize:'13px',fontWeight:700}}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── S4: NORTH INDIAN KUNDALI CHART ───────────────────────── */}
          {planetTable.length > 0 && lagna !== '—' && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,
              borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,
                textTransform:'uppercase',letterSpacing:'0.08em'}}>
                🪐 Janma Kundali — North Indian Chart
              </p>
              <KundaliChart lagna={lagna} planets={planetTable}/>
              <p style={{textAlign:'center',color:'#334155',fontSize:'10px',margin:'10px 0 0'}}>
                Lahiri Ayanamsha · Swiss Ephemeris · BPHS classical
              </p>
            </div>
          )}

          {/* Template HTML legacy fallback */}
          {templateHtml && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,
              borderRadius:'16px',padding:'20px',marginBottom:'14px'}}
              dangerouslySetInnerHTML={{__html:templateHtml}}/>
          )}

          {/* ── S5: PLANET TABLE — All 9 Grahas ──────────────────────── */}
          {planetTable.length > 0 && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,
              borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,
                textTransform:'uppercase',letterSpacing:'0.08em'}}>
                ⚡ Graha Vishleshan — All 9 Planets
              </p>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${G(0.15)}`}}>
                      {['Graha','Rashi','House','Nakshatra','Dignity','Strength'].map(h=>(
                        <th key={h} style={{padding:'8px 6px',color:GOLD,fontWeight:600,
                          textAlign:'left',fontSize:'10px',letterSpacing:'0.06em',
                          textTransform:'uppercase'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {planetTable.map((p,i)=>{
                      const sc = p.strength==='Very Strong'?'#22c55e'
                        :p.strength==='Strong'?'#86efac'
                        :p.strength==='Moderate'?GOLD:'#ef4444'
                      const sd = p.strength==='Very Strong'?'●●'
                        :p.strength==='Strong'?'●'
                        :p.strength==='Moderate'?'◐':'○'
                      return (
                        <tr key={p.planet} style={{
                          borderBottom:'1px solid rgba(255,255,255,0.04)',
                          background:i%2===0?G(0.02):'transparent'}}>
                          <td style={{padding:'10px 6px',color:'#fff',fontWeight:600}}>
                            <span style={{color:GOLD,marginRight:'5px'}}>
                              {PLANET_GLYPH[p.planet]??'✦'}
                            </span>
                            {p.planet_hi || PLANET_HI[p.planet] || p.planet}
                            {p.retrograde && (
                              <span style={{color:'#f59e0b',fontSize:'9px',marginLeft:'4px'}}>
                                ® Vakri
                              </span>
                            )}
                          </td>
                          <td style={{padding:'10px 6px',color:'#94a3b8'}}>{p.rashi}</td>
                          <td style={{padding:'10px 6px',color:'#94a3b8'}}>
                            {ordinal(p.house)}
                          </td>
                          <td style={{padding:'10px 6px',color:'#64748b',fontSize:'11px'}}>
                            {p.nakshatra}
                          </td>
                          <td style={{padding:'10px 6px',color:'#64748b',fontSize:'11px'}}>
                            {p.dignity}
                          </td>
                          <td style={{padding:'10px 6px'}}>
                            <span style={{color:sc,fontSize:'11px',fontWeight:700}}>
                              {sd} {p.strength}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{margin:'10px 0 0',color:'#334155',fontSize:'10px'}}>
                ⚖️ Shadbala classical 6-component system (BPHS Ch.27) · Swiss Ephemeris precision
              </p>
            </div>
          )}

          {/* ── S6: DASHA KAAL ────────────────────────────────────────── */}
          <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,
            borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
            <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,
              textTransform:'uppercase',letterSpacing:'0.08em'}}>
              ⏰ Dasha Kaal — Vimshottari System
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[
                {label:'Mahadasha', lord:mahadasha,  color:'#60a5fa', lv:'L1'},
                {label:'Antardasha',lord:antardasha, color:'#a78bfa', lv:'L2'},
                {label:'Pratyantar',lord:pratyantar, color:GOLD,      lv:'L3'},
                {label:'Sookshma',  lord:sookshma,   color:'#34d399', lv:'L4'},
              ].map(({label,lord,color,lv})=>(
                <div key={label} style={{display:'flex',alignItems:'center',
                  gap:'12px',padding:'10px 12px',
                  background:'rgba(255,255,255,0.03)',borderRadius:'10px',
                  border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{width:'28px',height:'28px',borderRadius:'50%',
                    background:`${color}20`,border:`1px solid ${color}40`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    flexShrink:0,color,fontSize:'10px',fontWeight:700}}>
                    {lv}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{margin:0,color:'#64748b',fontSize:'10px',
                      textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p>
                    <p style={{margin:'2px 0 0',color:'#fff',fontSize:'14px',
                      fontWeight:700}}>{lord}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── S7: ACTION WINDOWS ────────────────────────────────────── */}
          {actionWindows.length > 0 && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,
              borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,
                textTransform:'uppercase',letterSpacing:'0.08em'}}>
                🗓 Action Windows — Trikal Precision
              </p>
              {actionWindows.map((w,i)=>{
                const hi = w.strength==='High'
                return (
                  <div key={i} style={{padding:'12px',
                    background:hi?'rgba(34,197,94,0.06)':G(0.04),
                    border:`1px solid ${hi?'rgba(34,197,94,0.2)':G(0.15)}`,
                    borderRadius:'10px',marginBottom:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',
                      gap:'8px',marginBottom:'4px'}}>
                      <span style={{color:hi?'#22c55e':GOLD,fontSize:'12px',fontWeight:700}}>
                        {hi?'🟢':'🟡'} {w.window}
                      </span>
                      <span style={{padding:'2px 8px',borderRadius:'10px',
                        background:hi?'rgba(34,197,94,0.15)':G(0.1),
                        color:hi?'#22c55e':GOLD,fontSize:'10px',fontWeight:600}}>
                        {w.strength}
                      </span>
                    </div>
                    <p style={{margin:0,color:'#94a3b8',fontSize:'12px',lineHeight:1.5}}>
                      {w.reason}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── S8: REMEDY PLAN ───────────────────────────────────────── */}
          {remedies.length > 0 && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,
              borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,
                textTransform:'uppercase',letterSpacing:'0.08em'}}>
                🙏 Upay — Remedy Plan (BPHS Classical)
              </p>
              {remedies.slice(0,1).map((r,i)=>(
                <div key={i} style={{display:'grid',gap:'10px'}}>
                  {[
                    {icon:'🕉️',label:'Mantra',       value:r.mantra, sub:r.count,    color:'#60a5fa'},
                    {icon:'🌾',label:'Dana (Charity)',value:r.dana,   sub:'As prescribed',color:'#34d399'},
                    {icon:'🪔',label:'Vrat (Fast)',   value:r.vrat,   sub:'Classical', color:GOLD},
                  ].map(({icon,label,value,sub,color})=>(
                    <div key={label} style={{display:'flex',gap:'12px',padding:'12px',
                      background:G(0.04),border:`1px solid ${G(0.12)}`,borderRadius:'10px'}}>
                      <span style={{fontSize:'22px',flexShrink:0}}>{icon}</span>
                      <div>
                        <p style={{margin:'0 0 2px',color,fontSize:'10px',
                          fontWeight:700,textTransform:'uppercase'}}>{label}</p>
                        <p style={{margin:'0 0 2px',color:'#e2e8f0',fontSize:'12px'}}>{value}</p>
                        <p style={{margin:0,color:'#64748b',fontSize:'10px'}}>{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {s(genRem.daily as string) !== '—' && (
                <p style={{margin:'12px 0 0',color:'#475569',fontSize:'11px'}}>
                  🕯️ Daily: {s(genRem.daily as string)}
                </p>
              )}
            </div>
          )}

          {/* ── S9: PANCHANG ──────────────────────────────────────────── */}
          {panchang.tithi && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,
              borderRadius:'16px',padding:'20px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,
                textTransform:'uppercase',letterSpacing:'0.08em'}}>
                📅 Aaj Ka Panchang
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',
                gap:'8px',marginBottom:'10px'}}>
                {[
                  {label:'Tithi',    value:s(panchang.tithi    as string)},
                  {label:'Vara',     value:s(panchang.weekday  as string)},
                  {label:'Nakshatra',value:s(panchang.nakshatra as string)},
                  {label:'Yoga',     value:s(panchang.yoga     as string)},
                ].map(({label,value})=>(
                  <div key={label} style={{padding:'10px',
                    background:'rgba(255,255,255,0.03)',borderRadius:'8px',
                    border:'1px solid rgba(255,255,255,0.06)'}}>
                    <p style={{margin:'0 0 2px',color:'#64748b',fontSize:'10px',
                      textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p>
                    <p style={{margin:0,color:'#fff',fontSize:'13px',fontWeight:600}}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              {s(panchang.rahu_kaal as string) !== '—' && (
                <div style={{padding:'10px 12px',
                  background:'rgba(239,68,68,0.06)',
                  border:'1px solid rgba(239,68,68,0.15)',borderRadius:'8px'}}>
                  <span style={{color:'#ef4444',fontSize:'12px',fontWeight:600}}>
                    🕐 Rahu Kaal: </span>
                  <span style={{color:'#fca5a5',fontSize:'12px'}}>
                    {s(panchang.rahu_kaal as string)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── S10: LOCKED FULL ANALYSIS ─────────────────────────────── */}
          <LockedSection slug={slug}/>

          {/* ── S11: MAA SHAKTI — PERMANENT BOTH TIERS ───────────────── */}
          <MaaShakti slug={slug}/>

          {/* ── S12: AUTHOR E-E-A-T ───────────────────────────────────── */}
          <div style={{background:'rgba(8,14,28,0.95)',
            border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:'14px',padding:'16px',marginBottom:'14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
              <div style={{width:'44px',height:'44px',borderRadius:'50%',overflow:'hidden',
                flexShrink:0,border:`1px solid ${G(0.35)}`,background:G(0.1)}}>
                <img src="/images/founder.png"
                  alt="Rohiit Gupta — Chief Vedic Architect"
                  style={{width:'100%',height:'100%',objectFit:'cover'}}
                  onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
              </div>
              <div>
                <p style={{margin:0,color:'#fff',fontSize:'13px',fontWeight:700}}>
                  Rohiit Gupta</p>
                <p style={{margin:0,color:'#64748b',fontSize:'11px'}}>
                  Chief Vedic Architect · Trikal Vaani · Delhi NCR</p>
              </div>
            </div>
            <p style={{margin:'0 0 10px',color:'#64748b',fontSize:'12px',lineHeight:1.6}}>
              This analysis is powered by Swiss Ephemeris — the same engine used by
              professional astrologers worldwide — combined with Brihat Parashara Hora
              Shastra classical rules, Bhrigu Nandi Nadi patterns, and Shadbala calculations.
            </p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {['15+ Years Vedic Study','Parashara BPHS','Swiss Ephemeris','Delhi NCR']
                .map(t=>(
                  <span key={t} style={{padding:'3px 8px',borderRadius:'6px',
                    background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.08)',
                    color:'#64748b',fontSize:'10px'}}>{t}</span>
              ))}
            </div>
          </div>

          {/* ── S13: SHARE + PDF + RETURN ─────────────────────────────── */}
          <div style={{textAlign:'center',marginBottom:'24px'}}>
            <div style={{display:'flex',gap:'10px',justifyContent:'center',
              flexWrap:'wrap',marginBottom:'16px'}}>
              <a href={`https://wa.me/?text=Maine%20Trikal%20Vaani%20pe%20kundali%20padhi%20—%20bahut%20accurate!%20${encodeURIComponent('https://trikalvaani.com/report/'+slug)}`}
                target="_blank" rel="noopener noreferrer"
                style={{padding:'10px 18px',borderRadius:'10px',
                  background:'rgba(37,211,102,0.08)',
                  border:'1px solid rgba(37,211,102,0.25)',
                  color:'#25D366',fontSize:'12px',fontWeight:600,textDecoration:'none'}}>
                📱 WhatsApp Share
              </a>
              <PDFBtn domainLabel={domainLabel}/>
              <Link href="/"
                style={{padding:'10px 18px',borderRadius:'10px',
                  background:G(0.08),border:`1px solid ${G(0.25)}`,
                  color:GOLD,fontSize:'12px',fontWeight:600,textDecoration:'none',
                  display:'flex',alignItems:'center',gap:'6px'}}>
                <ArrowLeft size={14}/>
                Apni Reading Karein
              </Link>
            </div>
            <p style={{margin:0,color:'#1e293b',fontSize:'10px',lineHeight:1.5}}>
              🔱 Trikal Vaani — Kaal bada balwan hai, sabko nach nachaye<br/>
              trikalvaani.com · Rohiit Gupta, Chief Vedic Architect, Delhi NCR
            </p>
          </div>

        </div>
      </main>
      <SiteFooter/>
    </div>
  )
}
