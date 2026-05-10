'use client'

/**
 * ============================================================
 * TRIKAL VAANI — Public SEO Report Client
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/report/[slug]/ReportPublicClient.tsx
 * VERSION: 8.1 — Maa Shakti Dakshina via Razorpay
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v8.1 vs v8.0:
 *   ✅ MaaShakti component now uses Razorpay (not WhatsApp links)
 *   ✅ Server-validated dakshina amounts (anti-tamper)
 *   ✅ "Apni dakshina" custom amount input (₹51 to ₹5,00,000)
 *   ✅ Optional dil ki baat message (500 char)
 *   ✅ Saves to Supabase `dakshina` table
 *   ✅ Post-payment WhatsApp confirmation flow
 *   ✅ Beautiful success modal after Maa accepts
 *   ✅ ALL v8.0 logic preserved 100%:
 *      - 5 Upay cards, kundali chart, planet table, dasha,
 *        action windows, panchang, locked section, PDF
 * ============================================================
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SiteNav    from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowLeft, Lock, Download, Sparkles, X, Check } from 'lucide-react'
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay-helper'

const GOLD    = '#D4AF37'
const RAZORPAY_BLUE = '#3395FF'
const G       = (a: number) => `rgba(212,175,55,${a})`
const BG_DARK = '#080B12'
const BG_CARD = 'rgba(6,10,22,0.95)'

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

interface UpayItem {
  upay_number: number
  type: 'mantra'|'gemstone'|'vrat'|'dana'|'special'
  planet?: string; mantra?: string; count?: string; time?: string; day?: string
  focus?: string; special?: string
  lagna_stone?: { stone:string; metal:string; finger:string; day:string; for:string; note:string }
  dasha_stone?: { stone:string; substitute:string; metal:string; finger:string; day:string; for:string; note:string }
  name?: string; deity?: string; prasad?: string; yantra?: string; yantra_placement?: string
  items?: string; recipient?: string; note?: string
  text?: string; domain?: string; timing?: string; blessing?: string
}

interface RemedyItem {
  planet:string; mantra:string; count:string
  dana:string; vrat:string; priority?:string
}

function s(v:unknown, fb='—'):string {
  return typeof v==='string' && v.trim() ? v.trim() : fb
}
function safeArr<T>(v:unknown):T[] { return Array.isArray(v) ? v as T[] : [] }
function safeObj(v:unknown):Record<string,unknown> {
  return v&&typeof v==='object'&&!Array.isArray(v) ? v as Record<string,unknown> : {}
}
function ordinal(n:number):string {
  if(n===1) return '1st'; if(n===2) return '2nd'; if(n===3) return '3rd'
  return `${n}th`
}

function splitGeoToBullets(text:string, isPaid:boolean, pj?:Record<string,unknown>): string[] {
  const bullets: string[] = []
  const maxBullets = isPaid ? 10 : 5
  if (pj) {
    const geoBullets = safeArr<string>(pj.geoBullets)
    if (geoBullets.length > 0) {
      geoBullets.filter(b=>typeof b==='string'&&b.length>15).slice(0,maxBullets).forEach(b=>bullets.push(b))
    }
  }
  if (bullets.length < maxBullets && text && text !== '—') {
    const cleaned = text.replace(/trikalvaani\.\s*\n?\s*com/gi,'trikalvaani.com').replace(/Visit\s+trikalvaani\.com[^.]*\./gi,'').trim()
    const sentences = cleaned.match(/[^.!?]+(?:[.!?](?!\s*com|\s*in|\s*org))+/g) ?? []
    sentences.map(s=>s.replace(/^[.!?,;\s]+/,'').trim()).filter(s=>s.length>20&&!s.toLowerCase().includes('trikalvaani.com')).slice(0,maxBullets-bullets.length).forEach(s=>{if(bullets.length<maxBullets)bullets.push(s)})
  }
  if (isPaid && pj && bullets.length < maxBullets) {
    const seo = safeObj(pj.seoSignals)
    const authority = seo.authorityStatement as string
    if (authority && authority!=='—' && bullets.length<maxBullets) bullets.push(authority)
    const diff = seo.differentiator as string
    if (diff && diff!=='—' && bullets.length<maxBullets) bullets.push(diff)
  }
  if (bullets.length === 0) return ['Trikal Vaani — Rohiit Gupta ji ki Swiss Ephemeris powered Vedic analysis aapke liye taiyaar hai.']
  return bullets.slice(0,maxBullets)
}

function KundaliChart({lagna,planets}:{lagna:string;planets:PlanetRow[]}) {
  const lagnaIdx = RASHI_LIST.findIndex(r=>r.toLowerCase()===lagna.toLowerCase()||lagna.toLowerCase().startsWith(r.toLowerCase().slice(0,4)))
  if(lagnaIdx<0) return null
  const houseMap:Record<number,string[]> = {}
  planets.forEach(p=>{if(!houseMap[p.house])houseMap[p.house]=[];houseMap[p.house].push(PLANET_HI[p.planet]?.slice(0,3)||p.planet.slice(0,3))})
  const cells:[number,number,number,number,number][] = [[12,0,0,100,100],[1,100,0,200,100],[2,300,0,100,100],[11,0,100,100,200],[3,300,100,100,200],[10,0,300,100,100],[9,100,300,200,100],[8,300,300,100,100],[4,100,100,100,100],[5,200,100,100,100],[6,100,200,100,100],[7,200,200,100,100]]
  const houseToRashi = (h:number) => RASHI_LIST[(lagnaIdx+h-1)%12]
  return (
    <div style={{display:'flex',justifyContent:'center'}}>
      <svg width="360" height="360" viewBox="0 0 400 400" style={{maxWidth:'100%',background:'#0A0F1E',borderRadius:'10px',border:`1px solid ${G(0.35)}`}}>
        <line x1="100" y1="100" x2="200" y2="200" stroke={G(0.3)} strokeWidth="1.5"/>
        <line x1="300" y1="100" x2="200" y2="200" stroke={G(0.3)} strokeWidth="1.5"/>
        <line x1="100" y1="300" x2="200" y2="200" stroke={G(0.3)} strokeWidth="1.5"/>
        <line x1="300" y1="300" x2="200" y2="200" stroke={G(0.3)} strokeWidth="1.5"/>
        {cells.map(([h,x,y,w,ht])=>{
          const isLagna=h===1; const planetsHere=houseMap[h]??[]; const rashi=houseToRashi(h)
          return (<g key={h}><rect x={x} y={y} width={w} height={ht} fill={isLagna?G(0.15):'rgba(10,15,30,0.6)'} stroke={G(isLagna?0.6:0.25)} strokeWidth={isLagna?2:1}/><text x={x+7} y={y+15} fill={G(0.55)} fontSize="11" fontFamily="Georgia,serif" fontWeight={isLagna?'700':'400'}>{h}</text><text x={x+w-6} y={y+15} fill={G(0.35)} fontSize="9" textAnchor="end" fontFamily="Georgia,serif">{rashi.slice(0,3)}</text>{isLagna&&<text x={x+w/2} y={y+ht-10} fill={GOLD} fontSize="12" textAnchor="middle" fontWeight="700" fontFamily="Georgia,serif">L</text>}{planetsHere.map((pl,i)=>(<text key={`${h}-${pl}-${i}`} x={x+w/2} y={y+ht/2+(i-(planetsHere.length-1)/2)*15} fill={isLagna?GOLD:'#e2e8f0'} fontSize="11" textAnchor="middle" fontWeight={isLagna?'700':'500'} fontFamily="Georgia,serif">{pl}</text>))}</g>)
        })}
        <text x="200" y="396" fill={G(0.4)} fontSize="10" textAnchor="middle" fontFamily="Georgia,serif">{lagna} Lagna</text>
      </svg>
    </div>
  )
}

function PDFBtn() {
  const handle = () => {
    const st = document.createElement('style'); st.id='tv-print'
    st.textContent=`@media print {nav,footer,.site-nav,.site-footer,.no-print{display:none!important}body{background:#fff!important}*{color:#000!important;border-color:#ccc!important;background:transparent!important}}`
    document.head.appendChild(st); window.print()
    setTimeout(()=>{const e=document.getElementById('tv-print');if(e)e.remove()},1500)
  }
  return (<button onClick={handle} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'10px',background:G(0.08),border:`1px solid ${G(0.25)}`,color:GOLD,fontSize:'13px',fontWeight:600,cursor:'pointer'}}><Download size={14}/>PDF Download</button>)
}

// ─── MAA SHAKTI DAKSHINA — v8.1 RAZORPAY ─────────────────────────────────────

interface DakshinaSuccess {
  type: 'arzi' | 'dhanyawad'
  amount: number
  paymentId: string
  whatsappUrl: string
  blessing: string
}

function MaaShakti({slug}:{slug:string}) {
  const [tab, setTab] = useState<'arzi'|'dhanyawad'>('arzi')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [showCustom, setShowCustom] = useState(false)
  const [devoteeName, setDevoteeName] = useState('')
  const [devoteeMobile, setDevoteeMobile] = useState('')
  const [message, setMessage] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<DakshinaSuccess | null>(null)

  const amts = tab === 'arzi' ? ARZI_AMT : DHANYAWAD_AMT

  // Pre-load Razorpay script when component mounts
  useEffect(() => {
    loadRazorpayScript()
  }, [])

  const handleDakshinaClick = async (amount: number, isCustom = false) => {
    setError(null)
    setPaying(true)

    try {
      // Step 1: Ensure script loaded
      const ok = await loadRazorpayScript()
      if (!ok) {
        setError('Razorpay SDK load nahi ho saka. Internet check karein.')
        setPaying(false)
        return
      }

      // Step 2: Create order on server
      const orderRes = await fetch('/api/create-dakshina-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: tab,
          amount,
          reportSlug: slug,
          isCustom,
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        setError(err.error || 'Order create nahi ho saka.')
        setPaying(false)
        return
      }

      const { orderId, amount: amountPaise, currency, keyId } = await orderRes.json()

      // Step 3: Open Razorpay popup
      openRazorpayCheckout({
        keyId,
        orderId,
        amount: amountPaise,
        currency,
        name: 'Trikal Vaani',
        description: tab === 'arzi'
          ? `Maa Ko Arzi — ₹${amount.toLocaleString('en-IN')}`
          : `Maa Ka Dhanyawad — ₹${amount.toLocaleString('en-IN')}`,
        prefillName: devoteeName,
        prefillContact: devoteeMobile,
        themeColor: '#D4AF37',
        onSuccess: async (response) => {
          // Step 4: Verify and save
          const verifyRes = await fetch('/api/verify-dakshina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              type: tab,
              amount,
              reportSlug: slug,
              devoteeName: devoteeName || undefined,
              devoteeMobile: devoteeMobile || undefined,
              message: message || undefined,
            }),
          })

          if (!verifyRes.ok) {
            const err = await verifyRes.json().catch(() => ({}))
            setError(err.error || 'Payment verification fail. Support se contact karein.')
            setPaying(false)
            return
          }

          const data = await verifyRes.json()
          setSuccess({
            type: tab,
            amount,
            paymentId: data.paymentId,
            whatsappUrl: data.whatsappUrl,
            blessing: data.blessing,
          })
          setPaying(false)
        },
        onDismiss: () => {
          setPaying(false)
        },
      })
    } catch (err: any) {
      setError(err.message || 'Kuch problem hui. Phir try karein.')
      setPaying(false)
    }
  }

  const handleCustomSubmit = () => {
    const amt = parseInt(customAmount.replace(/[^\d]/g, ''), 10)
    if (!amt || amt < 51) {
      setError('Minimum dakshina ₹51 hai.')
      return
    }
    if (amt > 500000) {
      setError('Maximum dakshina ₹5,00,000 hai.')
      return
    }
    handleDakshinaClick(amt, true)
  }

  const waBase = tab === 'arzi'
    ? `Pranam%20Rohiit%20ji%2C%20Maa%20ko%20Arzi%20karna%20chahta%20hoon.%20Report:%20${slug}.%20Jai%20Maa%20Shakti!`
    : `Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20Report:%20${slug}.`

  // ── Success Modal ────────────────────────────────────────
  if (success) {
    return (
      <div style={{
        background: `linear-gradient(135deg,${G(0.12)},rgba(34,197,94,0.08))`,
        border: `1px solid ${G(0.4)}`,
        borderRadius: '20px',
        padding: '32px 24px',
        marginBottom: '16px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          margin: '0 auto 18px',
          borderRadius: '50%',
          background: `linear-gradient(135deg,${GOLD},#F5D76E)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 40px ${G(0.5)}`,
        }}>
          <Check size={36} color="#080B12" strokeWidth={3}/>
        </div>

        <h2 style={{
          margin: '0 0 8px',
          color: GOLD,
          fontSize: '22px',
          fontFamily: 'Georgia,serif',
          fontWeight: 700,
        }}>
          🔱 Jai Maa Shakti
        </h2>

        <p style={{
          margin: '0 0 12px',
          color: '#fff',
          fontSize: '15px',
          fontWeight: 600,
          lineHeight: 1.6,
        }}>
          {success.type === 'arzi'
            ? `Aapki Arzi Maa ke charnon mein pahunch gayi`
            : `Aapka Dhanyawad Maa ne sweekar kar liya`}
        </p>

        <p style={{
          margin: '0 0 18px',
          color: '#94a3b8',
          fontSize: '13px',
          lineHeight: 1.6,
        }}>
          Dakshina: <strong style={{color: GOLD}}>₹{success.amount.toLocaleString('en-IN')}</strong>
          <br/>
          Payment ID: <code style={{color: '#64748b', fontSize: '11px'}}>{success.paymentId}</code>
        </p>

        <p style={{
          margin: '0 0 20px',
          color: '#cbd5e1',
          fontSize: '13px',
          fontStyle: 'italic',
          lineHeight: 1.7,
          maxWidth: '340px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {success.blessing}
        </p>

        <a
          href={success.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 26px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg,#25D366,#1da851)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 0 25px rgba(37,211,102,0.3)',
          }}
        >
          📱 Rohiit ji ko inform karein
        </a>

        <p style={{
          margin: '14px 0 0',
          color: '#475569',
          fontSize: '11px',
        }}>
          🔒 Secured by <span style={{color: RAZORPAY_BLUE, fontWeight: 600}}>Razorpay</span>
        </p>
      </div>
    )
  }

  // ── Main Dakshina UI ─────────────────────────────────────
  return (
    <div style={{
      background: `linear-gradient(135deg,${G(0.07)},rgba(124,58,237,0.07))`,
      border: `1px solid ${G(0.25)}`,
      borderRadius: '20px',
      padding: '28px 20px',
      marginBottom: '16px',
    }}>
      <div style={{textAlign: 'center', marginBottom: '20px'}}>
        <div style={{fontSize: '38px', marginBottom: '8px'}}>🙏</div>
        <h2 style={{
          margin: '0 0 6px',
          color: GOLD,
          fontSize: '20px',
          fontFamily: 'Georgia,serif',
          fontWeight: 700,
        }}>
          Maa Shakti Ki Divya Seva
        </h2>
        <p style={{
          margin: '0 auto',
          color: G(0.65),
          fontSize: '13px',
          lineHeight: 1.6,
          maxWidth: '320px',
        }}>
          Yeh fees nahi — yeh dil ki dakshina hai. Koi seema nahi devotion ki.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        background: 'rgba(0,0,0,0.3)',
        padding: '4px',
        borderRadius: '12px',
      }}>
        {(['arzi','dhanyawad'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowCustom(false); setError(null) }}
            disabled={paying}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              cursor: paying ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '13px',
              transition: 'all 0.3s',
              background: tab === t
                ? `linear-gradient(135deg,${GOLD},#A8820A)`
                : 'transparent',
              color: tab === t ? '#080B12' : G(0.55),
              opacity: paying ? 0.6 : 1,
            }}
          >
            {t === 'arzi' ? '🪔 Arzi to Maa' : '🌺 Dhanyawad to Maa'}
          </button>
        ))}
      </div>

      <p style={{
        color: '#94a3b8',
        fontSize: '13px',
        margin: '0 0 14px',
        lineHeight: 1.6,
        textAlign: 'center',
      }}>
        {tab === 'arzi'
          ? 'Apni deepest prayer Maa ke charnon mein rakhein. Razorpay ke through secure dakshina.'
          : 'Maa ka Dhanyawad karein — gratitude hi sabse badi puja hai.'}
      </p>

      {/* Razorpay trust strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: 'rgba(51,149,255,0.06)',
        border: '1px solid rgba(51,149,255,0.18)',
        borderRadius: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <span style={{fontSize: '10px', color: '#94a3b8', fontWeight: 600}}>🔒 Secured by</span>
        <span style={{color: RAZORPAY_BLUE, fontWeight: 700, fontSize: '11px', fontFamily: 'Georgia,serif'}}>Razorpay</span>
        <span style={{color: '#475569', fontSize: '10px'}}>·</span>
        <span style={{fontSize: '9px', color: '#64748b'}}>UPI · Cards · Wallets</span>
      </div>

      {/* Optional devotee details */}
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '14px',
      }}>
        <p style={{margin: '0 0 8px', color: '#94a3b8', fontSize: '11px', fontWeight: 600}}>
          Optional — Maa tak aapka naam pahunche
        </p>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px'}}>
          <input
            type="text"
            placeholder="Aapka naam"
            value={devoteeName}
            onChange={e => setDevoteeName(e.target.value)}
            disabled={paying}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: '#0d1120',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '12px',
              outline: 'none',
            }}
          />
          <input
            type="tel"
            placeholder="WhatsApp number"
            value={devoteeMobile}
            onChange={e => setDevoteeMobile(e.target.value)}
            disabled={paying}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: '#0d1120',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '12px',
              outline: 'none',
            }}
          />
        </div>
        <textarea
          placeholder="Dil ki baat (optional, max 500 chars)"
          value={message}
          onChange={e => setMessage(e.target.value.slice(0, 500))}
          disabled={paying}
          rows={2}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '6px',
            background: '#0d1120',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e2e8f0',
            fontSize: '12px',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
          }}
        />
        {message && (
          <p style={{margin: '4px 0 0', color: '#475569', fontSize: '10px', textAlign: 'right'}}>
            {message.length}/500
          </p>
        )}
      </div>

      {/* Preset amount buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        marginBottom: '14px',
      }}>
        {amts.map(a => (
          <button
            key={a}
            onClick={() => handleDakshinaClick(a)}
            disabled={paying}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: `1px solid ${G(0.3)}`,
              color: GOLD,
              fontSize: '13px',
              fontWeight: 600,
              background: G(0.08),
              cursor: paying ? 'not-allowed' : 'pointer',
              opacity: paying ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            ₹{a.toLocaleString('en-IN')}
          </button>
        ))}
        <button
          onClick={() => { setShowCustom(!showCustom); setError(null) }}
          disabled={paying}
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: `1px dashed ${G(0.3)}`,
            color: GOLD,
            fontSize: '13px',
            fontWeight: 600,
            background: showCustom ? G(0.1) : 'transparent',
            cursor: paying ? 'not-allowed' : 'pointer',
            opacity: paying ? 0.5 : 1,
          }}
        >
          ✦ Apni dakshina
        </button>
      </div>

      {/* Custom amount input */}
      {showCustom && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '14px',
          padding: '12px',
          background: G(0.04),
          border: `1px solid ${G(0.2)}`,
          borderRadius: '10px',
        }}>
          <input
            type="number"
            placeholder="Apni dakshina (₹51 to ₹5,00,000)"
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            disabled={paying}
            min={51}
            max={500000}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '8px',
              background: '#0d1120',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
            }}
          />
          <button
            onClick={handleCustomSubmit}
            disabled={paying || !customAmount}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: paying || !customAmount
                ? G(0.15)
                : `linear-gradient(135deg,${GOLD},#F5D76E)`,
              color: paying || !customAmount ? G(0.5) : '#080B12',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: paying || !customAmount ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {paying ? '⟳' : 'Submit'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '8px',
          marginBottom: '14px',
          textAlign: 'center',
        }}>
          <p style={{margin: 0, color: '#fca5a5', fontSize: '12px'}}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {paying && (
        <div style={{
          padding: '12px',
          background: G(0.08),
          border: `1px solid ${G(0.25)}`,
          borderRadius: '10px',
          marginBottom: '14px',
          textAlign: 'center',
        }}>
          <p style={{margin: 0, color: GOLD, fontSize: '12px', fontWeight: 600}}>
            ⟳ Razorpay popup open ho raha hai... Maa ki kripa aapke saath hai.
          </p>
        </div>
      )}

      {/* Fallback WhatsApp link (if Razorpay fails) */}
      <div style={{
        marginTop: '8px',
        paddingTop: '12px',
        borderTop: `1px solid ${G(0.1)}`,
        textAlign: 'center',
      }}>
        <a
          href={`https://wa.me/919211804111?text=${waBase}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#64748b',
            fontSize: '11px',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Razorpay use nahi karna? → WhatsApp pe Rohiit ji se baat karein
        </a>
      </div>
    </div>
  )
}

// ─── 5 UPAY CARDS — v8.0 (UNCHANGED) ─────────────────────────────────────────

function UpayCards({ remedies, isPaid }: { remedies: UpayItem[]; isPaid: boolean }) {
  const visibleCount = isPaid ? 5 : 3
  const visible = remedies.slice(0, visibleCount)

  const UPAY_CONFIG = [
    { type: 'mantra',   icon: '🕉️', label: 'Mantra Sadhana',    color: '#60a5fa' },
    { type: 'gemstone', icon: '💎', label: 'Ratna Therapy',      color: '#f472b6' },
    { type: 'vrat',     icon: '🪔', label: 'Vrat aur Upasana',   color: GOLD      },
    { type: 'dana',     icon: '🌾', label: 'Dana aur Seva',       color: '#34d399' },
    { type: 'special',  icon: '🔱', label: 'Vishesh Upay',       color: '#a78bfa' },
  ]

  return (
    <div style={{ background: BG_CARD, border: `1px solid ${G(0.12)}`, borderRadius: '16px', padding: '22px', marginBottom: '14px' }}>
      <p style={{ margin: '0 0 16px', color: GOLD, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        🙏 Upay — 5 Classical Remedies (BPHS)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {visible.map((upay, i) => {
          const cfg = UPAY_CONFIG.find(c => c.type === upay.type) ?? UPAY_CONFIG[0]!
          return (
            <div key={i} style={{ padding: '14px', background: `${cfg.color}08`, border: `1px solid ${cfg.color}25`, borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>{cfg.icon}</span>
                <div>
                  <p style={{ margin: 0, color: cfg.color, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Upay {upay.upay_number} — {cfg.label}
                  </p>
                  {upay.planet && <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '11px' }}>Planet: {upay.planet}</p>}
                </div>
              </div>

              {upay.type === 'mantra' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', fontWeight: 600, fontFamily: 'Georgia,serif' }}>{upay.mantra}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {upay.count && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>🔢 {upay.count}</span>}
                    {upay.time  && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>⏰ {upay.time}</span>}
                    {upay.day   && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>📅 {upay.day}</span>}
                  </div>
                  {upay.focus   && <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>🎯 Focus: {upay.focus}</p>}
                  {upay.special && <p style={{ margin: '2px 0 0', color: GOLD, fontSize: '12px', fontStyle: 'italic' }}>✨ {upay.special}</p>}
                </div>
              )}

              {upay.type === 'gemstone' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upay.lagna_stone && (
                    <div style={{ padding: '10px 12px', background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 4px', color: '#f472b6', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>💍 {upay.lagna_stone.for}</p>
                      <p style={{ margin: '0 0 4px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>{upay.lagna_stone.stone}</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>
                        {upay.lagna_stone.metal} · {upay.lagna_stone.finger} · {upay.lagna_stone.day}
                      </p>
                      {upay.lagna_stone.note && <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>{upay.lagna_stone.note}</p>}
                    </div>
                  )}
                  {upay.dasha_stone && (
                    <div style={{ padding: '10px 12px', background: 'rgba(212,175,55,0.06)', border: `1px solid ${G(0.2)}`, borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 4px', color: GOLD, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>⚡ {upay.dasha_stone.for}</p>
                      <p style={{ margin: '0 0 2px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>{upay.dasha_stone.stone}</p>
                      <p style={{ margin: '0 0 2px', color: '#94a3b8', fontSize: '11px' }}>
                        {upay.dasha_stone.metal} · {upay.dasha_stone.finger} · {upay.dasha_stone.day}
                      </p>
                      {upay.dasha_stone.substitute && <p style={{ margin: '2px 0', color: '#64748b', fontSize: '11px' }}>Substitute: {upay.dasha_stone.substitute}</p>}
                      {upay.dasha_stone.note && <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>{upay.dasha_stone.note}</p>}
                    </div>
                  )}
                </div>
              )}

              {upay.type === 'vrat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {upay.name   && <span style={{ padding: '4px 10px', borderRadius: '6px', background: `${GOLD}15`, color: GOLD, fontSize: '12px', fontWeight: 600 }}>{upay.name}</span>}
                    {upay.day    && <span style={{ padding: '4px 10px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '12px' }}>📅 {upay.day}</span>}
                    {upay.deity  && <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontSize: '12px' }}>🙏 {upay.deity}</span>}
                  </div>
                  {upay.prasad  && <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>🌸 Prasad: {upay.prasad}</p>}
                  {upay.yantra  && <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '12px' }}>🔯 Yantra: {upay.yantra} — {upay.yantra_placement}</p>}
                  {upay.special && <p style={{ margin: '4px 0 0', color: GOLD, fontSize: '12px', fontStyle: 'italic' }}>✨ {upay.special}</p>}
                </div>
              )}

              {upay.type === 'dana' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {upay.items    && <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px' }}>🌾 {upay.items}</p>}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {upay.day       && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>📅 {upay.day}</span>}
                    {upay.recipient && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>👤 {upay.recipient}</span>}
                  </div>
                  {upay.note && <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>{upay.note}</p>}
                </div>
              )}

              {upay.type === 'special' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {upay.text    && <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: 1.6 }}>{upay.text}</p>}
                  {upay.focus   && <p style={{ margin: '4px 0 0', color: '#a78bfa', fontSize: '12px' }}>🎯 Focus: {upay.focus}</p>}
                  {upay.timing  && <p style={{ margin: '2px 0 0', color: GOLD, fontSize: '11px' }}>⏰ {upay.timing}</p>}
                  {upay.blessing && <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>{upay.blessing}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!isPaid && remedies.length > 3 && (
        <div style={{ marginTop: '12px', padding: '12px', background: G(0.06), border: `1px solid ${G(0.2)}`, borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', color: GOLD, fontSize: '12px', fontWeight: 600 }}>🔒 2 more upay (Gemstone + Special) unlocked in Deep Reading</p>
          <Link href="/" style={{ color: GOLD, fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>⚡ Get Full Reading — ₹51</Link>
        </div>
      )}

      <p style={{ margin: '12px 0 0', color: '#475569', fontSize: '11px' }}>
        All remedies from Brihat Parashara Hora Shastra · Swiss Ephemeris precision · Rohiit Gupta, Chief Vedic Architect
      </p>
    </div>
  )
}

function LockedSection({slug}:{slug:string}) {
  const features = ['✓ Complete planetary analysis (all 9 grahas)','✓ Bhrigu Nandi pattern insights','✓ 4 action windows with exact dates','✓ Full 5 upay plan (mantra+gemstone+vrat+dana+special)','✓ 900 word deep analysis','✓ Panchang muhurta guidance','✓ Lagna + Dasha gemstone recommendation','✓ Karmic insight (Bhrigu)']
  return (
    <div style={{position:'relative',borderRadius:'16px',overflow:'hidden',marginBottom:'16px',border:`1px solid ${G(0.15)}`}}>
      <div style={{padding:'20px',filter:'blur(5px)',pointerEvents:'none',userSelect:'none',background:BG_CARD}}>
        <p style={{color:GOLD,fontSize:'12px',fontWeight:700,marginBottom:'8px',textTransform:'uppercase'}}>📊 Complete Analysis</p>
        <p style={{color:'#e2e8f0',fontSize:'14px',margin:'0 0 8px'}}>Graha yogas aur dasha periods ka poora vishleshan...</p>
        <p style={{color:'#22c55e',fontSize:'12px',fontWeight:600}}>💎 Gemstone + 4 Action Windows...</p>
      </div>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',background:'linear-gradient(to bottom,rgba(8,11,18,0.1) 0%,rgba(8,11,18,0.98) 28%)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'50%',background:G(0.1),border:`1px solid ${G(0.35)}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <Lock size={22} style={{color:GOLD}}/>
          </div>
          <p style={{margin:'0 0 4px',color:'#fff',fontSize:'18px',fontWeight:700,fontFamily:'Georgia,serif'}}>Trikal Ne Aur Bhi Dekha Hai</p>
          <p style={{margin:'0 0 14px',color:'#94a3b8',fontSize:'13px',lineHeight:1.6,maxWidth:'280px'}}>Complete analysis, yogas, 5 upay remedies aur 900-word deep reading taiyaar hai</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'18px',maxWidth:'340px',margin:'0 auto 18px',textAlign:'left'}}>
            {features.map((f,i)=>(<p key={i} style={{margin:0,color:'#94a3b8',fontSize:'12px',lineHeight:1.5}}>{f}</p>))}
          </div>
          <Link href={`/upgrade?slug=${slug}&tier=basic`} style={{display:'block',padding:'15px 36px',borderRadius:'12px',background:`linear-gradient(135deg,${GOLD},#F5D76E,${GOLD})`,color:'#080B12',fontSize:'15px',fontWeight:700,textDecoration:'none',boxShadow:`0 0 30px ${G(0.4)}`,marginBottom:'10px'}}>
            🔓 Unlock Full Report — ₹51 Only
          </Link>
          <p style={{margin:'6px 0 0',color:'#475569',fontSize:'11px'}}>One-time · Instant access · <span style={{color: RAZORPAY_BLUE, fontWeight: 600}}>Razorpay</span> secure</p>
        </div>
      </div>
    </div>
  )
}

function PaidFullSummary({ summaryText, periodSummary, bestDates, dosList, dontsList, remedyHint, karmicInsight }: {
  summaryText:string; periodSummary:string; bestDates:string;
  dosList:string[]; dontsList:string[]; remedyHint:string; karmicInsight:string;
}) {
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.2)}`,borderRadius:'16px',padding:'24px',marginBottom:'14px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
        <Sparkles size={16} style={{color:GOLD}}/>
        <p style={{margin:0,color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>Trikal Ka Poora Sandesh — Premium Analysis</p>
      </div>
      {summaryText && summaryText!=='—' && (
        <div style={{background:G(0.05),border:`1px solid ${G(0.15)}`,borderRadius:'12px',padding:'18px',marginBottom:'16px'}}>
          <p style={{margin:0,color:'#e2e8f0',fontSize:'14px',lineHeight:1.9,whiteSpace:'pre-line'}}>{summaryText}</p>
        </div>
      )}
      {periodSummary && periodSummary!=='—' && (
        <div style={{padding:'14px',background:'rgba(96,165,250,0.06)',border:'1px solid rgba(96,165,250,0.2)',borderRadius:'10px',marginBottom:'12px'}}>
          <p style={{margin:'0 0 4px',color:'#60a5fa',fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>⏰ Dasha Ka Arth</p>
          <p style={{margin:0,color:'#bfdbfe',fontSize:'13px',lineHeight:1.6}}>{periodSummary}</p>
        </div>
      )}
      {bestDates && bestDates!=='—' && (
        <div style={{padding:'14px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'10px',marginBottom:'12px'}}>
          <p style={{margin:'0 0 4px',color:'#22c55e',fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>🗓 Sabse Shubh Dates</p>
          <p style={{margin:0,color:'#86efac',fontSize:'13px',lineHeight:1.6}}>{bestDates}</p>
        </div>
      )}
      {(dosList.length>0||dontsList.length>0) && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          {dosList.length>0 && (
            <div>
              <p style={{margin:'0 0 10px',color:'#22c55e',fontSize:'11px',fontWeight:700,textTransform:'uppercase'}}>✓ KYA KAREIN</p>
              {dosList.map((d,i)=>(<div key={i} style={{display:'flex',gap:'8px',marginBottom:'8px'}}><span style={{color:'#22c55e',fontSize:'12px',flexShrink:0}}>✓</span><p style={{margin:0,color:'#e2e8f0',fontSize:'13px',lineHeight:1.5}}>{d}</p></div>))}
            </div>
          )}
          {dontsList.length>0 && (
            <div>
              <p style={{margin:'0 0 10px',color:'#ef4444',fontSize:'11px',fontWeight:700,textTransform:'uppercase'}}>✗ KYA NA KAREIN</p>
              {dontsList.map((d,i)=>(<div key={i} style={{display:'flex',gap:'8px',marginBottom:'8px'}}><span style={{color:'#ef4444',fontSize:'12px',flexShrink:0}}>✗</span><p style={{margin:0,color:'#e2e8f0',fontSize:'13px',lineHeight:1.5}}>{d}</p></div>))}
            </div>
          )}
        </div>
      )}
      {remedyHint && remedyHint!=='—' && (
        <div style={{padding:'14px',background:G(0.06),border:`1px solid ${G(0.2)}`,borderRadius:'10px',marginBottom:'12px'}}>
          <p style={{margin:'0 0 4px',color:GOLD,fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>🕉️ Upay Hint</p>
          <p style={{margin:0,color:'#fde68a',fontSize:'13px',lineHeight:1.6}}>{remedyHint}</p>
        </div>
      )}
      {karmicInsight && karmicInsight!=='—' && (
        <div style={{padding:'14px',background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'10px'}}>
          <p style={{margin:'0 0 4px',color:'#a78bfa',fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>🔱 Karmic Insight — Bhrigu Pattern</p>
          <p style={{margin:0,color:'#c4b5fd',fontSize:'13px',lineHeight:1.6}}>{karmicInsight}</p>
        </div>
      )}
    </div>
  )
}

export default function ReportPublicClient({report,slug,meta}:ReportPublicClientProps) {
  const domainLabel = s(report.domain_label,'Vedic Reading')
  const birthCity   = s(report.birth_city,'India')
  const nakshatra   = s(report.nakshatra)
  const tier        = s(report.tier,'free')
  const isPaid      = tier==='premium'||tier==='paid'||tier==='basic'||tier==='standard'
  const pj          = safeObj(report.prediction_json)
  const lagna       = s(report.lagna)!=='—' ? s(report.lagna) : s((pj as any)?.lagnaRashi ?? (pj as any)?.lagna?.sign)
  const dashaTL     = safeObj(pj.dashaTimeline)
  const mdObj       = safeObj(dashaTL.mahadasha)
  const adObj       = safeObj(dashaTL.antardasha)
  const ptObj       = safeObj(dashaTL.pratyantar)
  const skObj       = safeObj(dashaTL.sookshma)
  const mahadasha   = s(mdObj.lord)!=='—'?s(mdObj.lord):s(report.mahadasha)
  const antardasha  = s(adObj.lord)!=='—'?s(adObj.lord):s(report.antardasha)
  const pratyantar  = s(ptObj.lord)
  const sookshma    = s(skObj.lord)
  const geoObj      = safeObj(pj.geoDirectAnswer)
  const geoText     = s(geoObj.text as string)!=='—' ? s(geoObj.text as string) : typeof pj.geoDirectAnswer==='string' ? s(pj.geoDirectAnswer as string) : s(report.geo_answer as string)
  const geoBullets  = splitGeoToBullets(geoText, isPaid, pj)
  const summaryText = s(pj.summaryText as string)!=='—' ? s(pj.summaryText as string) : s(safeObj(pj.simpleSummary).text as string)
  const keyMessage  = s(pj.keyMessage as string)!=='—' ? s(pj.keyMessage as string) : s(safeObj(pj.simpleSummary).keyMessage as string)
  const mainAction  = s(pj.mainAction as string)!=='—' ? s(pj.mainAction as string) : s(safeObj(pj.simpleSummary).mainAction as string)
  const mainCaution = s(pj.mainCaution as string)!=='—' ? s(pj.mainCaution as string) : s(safeObj(pj.simpleSummary).mainCaution as string)
  const coreMessage = s(pj.coreMessage as string)
  const doAction    = s(pj.doAction as string)
  const avoidAction = s(pj.avoidAction as string)
  const periodSummary = s(pj.periodSummary as string)!=='—' ? s(pj.periodSummary as string) : s(safeObj(pj.simpleSummary).periodSummary as string)
  const bestDates   = s(pj.bestDates as string)!=='—' ? s(pj.bestDates as string) : s(safeObj(pj.simpleSummary).bestDates as string)
  const remedyHint  = s(pj.remedyHint as string)!=='—' ? s(pj.remedyHint as string) : s(safeObj(pj.simpleSummary).remedyHint as string)
  const karmicInsight = s(pj.karmicInsight as string)
  const dosList     = safeArr<string>(pj.dosList).length>0 ? safeArr<string>(pj.dosList) : safeArr<string>(safeObj(pj.simpleSummary).dos)
  const dontsList   = safeArr<string>(pj.dontsList).length>0 ? safeArr<string>(pj.dontsList) : safeArr<string>(safeObj(pj.simpleSummary).donts)
  const planetTable = safeArr<PlanetRow>(pj.planetTable)
  const actionWindows = safeArr<ActionWindow>(pj.actionWindows)

  const remedyPlan  = safeObj(pj.remedyPlan)
  const upayItems   = safeArr<UpayItem>(remedyPlan.remedies)
  const genRem      = safeObj(remedyPlan.general)

  const oldRemedies = safeArr<RemedyItem>(remedyPlan.remedies as any)
  const hasNewUpay  = upayItems.length > 0 && upayItems[0]?.upay_number !== undefined

  const panchang    = safeObj(pj.panchang)
  const hasSummaryText = summaryText!=='—'
  const hasCoreMessage = coreMessage!=='—'
  const hasDoAvoid     = doAction!=='—'||avoidAction!=='—'
  const hasKeyMessage  = keyMessage!=='—'

  return (
    <div style={{minHeight:'100vh',background:BG_DARK}}>
      <SiteNav/>
      <main style={{paddingTop:'96px',paddingBottom:'80px',padding:'96px 16px 80px'}}>
        <div style={{maxWidth:'700px',margin:'0 auto'}}>

          <nav aria-label="breadcrumb" style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px'}}>
            <Link href="/" style={{color:'#64748b',fontSize:'13px',textDecoration:'none'}}>Home</Link>
            <span style={{color:'#334155'}}>›</span>
            <Link href="/services" style={{color:'#64748b',fontSize:'13px',textDecoration:'none'}}>Readings</Link>
            <span style={{color:'#334155'}}>›</span>
            <span style={{color:'#94a3b8',fontSize:'13px'}}>{domainLabel}</span>
          </nav>

          <div style={{background:`linear-gradient(135deg,${G(0.1)},rgba(8,11,18,0.95))`,border:`1px solid ${G(0.2)}`,borderRadius:'20px',padding:'26px 22px',marginBottom:'14px',textAlign:'center'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'14px'}}>
              <div style={{height:'1px',flex:1,background:`linear-gradient(to right,transparent,${G(0.3)})`}}/>
              <span style={{color:GOLD,fontSize:'12px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',whiteSpace:'nowrap'}}>🔱 Mahakaal Ka Ashirwad</span>
              <div style={{height:'1px',flex:1,background:`linear-gradient(to left,transparent,${G(0.3)})`}}/>
            </div>
            <p style={{margin:'0 0 6px',color:G(0.6),fontSize:'12px',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>Vedic Astrology Analysis · {domainLabel}</p>
            <h1 style={{margin:'0 0 6px',color:'#fff',fontSize:'22px',fontFamily:'Georgia,serif',fontWeight:700}}>{mahadasha} Mahadasha · {antardasha} Antardasha</h1>
            <p style={{margin:'0 0 16px',color:'#94a3b8',fontSize:'14px'}}>{birthCity} · {lagna} Lagna · {nakshatra} Nakshatra</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',justifyContent:'center',marginBottom:'12px'}}>
              {[{icon:'⚡',label:'Swiss Ephemeris',color:'#60a5fa'},{icon:'📖',label:'BPHS Classical',color:'#a78bfa'},{icon:'🔮',label:'Bhrigu Nandi',color:'#f472b6'},{icon:'⚖️',label:'Shadbala',color:'#34d399'}].map(b=>(<span key={b.label} style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'5px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:600,background:`${b.color}15`,border:`1px solid ${b.color}30`,color:b.color}}>{b.icon} {b.label}</span>))}
            </div>
            {geoBullets.length>0 && (
              <div style={{background:G(0.06),border:`1px solid ${G(0.15)}`,borderRadius:'14px',padding:'16px',marginTop:'14px',textAlign:'left'}}>
                <p style={{margin:'0 0 12px',color:G(0.65),fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>🔮 Vedic Analysis — Trikal Ka Sandesh {isPaid && <span style={{color:G(0.4),marginLeft:'8px',fontSize:'10px'}}>({geoBullets.length} insights)</span>}</p>
                <ul style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:'10px'}}>
                  {geoBullets.map((pt,i)=>(<li key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}><span style={{color:GOLD,fontSize:'14px',flexShrink:0,marginTop:'2px'}}>{['🔱','✦','◆','▸','🪐','✧','🔮','⚡','🌟','🕉️'][i%10]}</span><p style={{margin:0,color:'#e2e8f0',fontSize:'14px',lineHeight:1.8}}>{pt.replace(/^[.!?,;\s]+/,'').trim()}</p></li>))}
                </ul>
                <p style={{margin:'12px 0 0',color:'#475569',fontSize:'11px'}}>By Rohiit Gupta, Chief Vedic Architect · trikalvaani.com</p>
              </div>
            )}
          </div>

          {!isPaid && (hasCoreMessage||hasKeyMessage||hasDoAvoid) && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>✨ Trikal Ka Sandesh</p>
              {(hasCoreMessage||hasKeyMessage) && (
                <div style={{background:`linear-gradient(135deg,${G(0.12)},${G(0.04)})`,border:`1px solid ${G(0.3)}`,borderRadius:'10px',padding:'14px 16px',marginBottom:'12px'}}>
                  <p style={{margin:'0 0 4px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase'}}>🔑 Core Message</p>
                  <p style={{margin:0,color:'#fff',fontSize:'15px',fontWeight:600,fontFamily:'Georgia,serif',lineHeight:1.6}}>{hasCoreMessage?coreMessage:keyMessage}</p>
                </div>
              )}
              {hasDoAvoid && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  {(doAction!=='—'||mainAction!=='—') && (<div style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'10px',padding:'13px'}}><p style={{margin:'0 0 5px',color:'#22c55e',fontSize:'10px',fontWeight:700}}>✓ ABHI KAREIN</p><p style={{margin:0,color:'#86efac',fontSize:'13px',lineHeight:1.5}}>{doAction!=='—'?doAction:mainAction}</p></div>)}
                  {(avoidAction!=='—'||mainCaution!=='—') && (<div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'13px'}}><p style={{margin:'0 0 5px',color:'#ef4444',fontSize:'10px',fontWeight:700}}>✗ BACHEIN</p><p style={{margin:0,color:'#fca5a5',fontSize:'13px',lineHeight:1.5}}>{avoidAction!=='—'?avoidAction:mainCaution}</p></div>)}
                </div>
              )}
              {hasSummaryText && (<div style={{marginTop:'14px',paddingTop:'14px',borderTop:`1px solid rgba(255,255,255,0.06)`}}><p style={{margin:0,color:'#94a3b8',fontSize:'13px',lineHeight:1.8,whiteSpace:'pre-line'}}>{summaryText}</p></div>)}
            </div>
          )}

          {isPaid && <PaidFullSummary summaryText={summaryText} periodSummary={periodSummary} bestDates={bestDates} dosList={dosList} dontsList={dontsList} remedyHint={remedyHint} karmicInsight={karmicInsight}/>}

          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px',marginBottom:'14px'}}>
            {[{label:'Lagna',value:lagna},{label:'Nakshatra',value:nakshatra},{label:'Mahadasha',value:mahadasha},{label:'Antardasha',value:antardasha}].map(({label,value})=>(<div key={label} style={{padding:'11px 14px',borderRadius:'10px',background:G(0.08),border:`1px solid ${G(0.2)}`,textAlign:'center'}}><p style={{margin:'0 0 3px',color:G(0.6),fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>{label}</p><p style={{margin:0,color:'#fff',fontSize:'14px',fontWeight:700}}>{value}</p></div>))}
          </div>

          {planetTable.length>0&&lagna!=='—'&&(
            <div style={{background:BG_CARD,border:`1px solid ${G(0.15)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>🪐 Janma Kundali — North Indian Chart</p>
              <KundaliChart lagna={lagna} planets={planetTable}/>
              <p style={{textAlign:'center',color:'#64748b',fontSize:'11px',margin:'10px 0 0'}}>Lahiri Ayanamsha · Swiss Ephemeris · BPHS classical</p>
            </div>
          )}

          {planetTable.length>0&&(
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>⚡ Graha Vishleshan — All 9 Planets</p>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                  <thead><tr style={{borderBottom:`1px solid ${G(0.15)}`}}>{['Graha','Rashi','House','Nakshatra','Dignity','Strength'].map(h=>(<th key={h} style={{padding:'9px 6px',color:GOLD,fontWeight:600,textAlign:'left',fontSize:'11px',letterSpacing:'0.06em',textTransform:'uppercase'}}>{h}</th>))}</tr></thead>
                  <tbody>
                    {planetTable.map((p,i)=>{
                      const sc=p.strength==='Very Strong'?'#22c55e':p.strength==='Strong'?'#86efac':p.strength==='Moderate'?GOLD:'#ef4444'
                      const sd=p.strength==='Very Strong'?'●●':p.strength==='Strong'?'●':p.strength==='Moderate'?'◐':'○'
                      return (<tr key={p.planet} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:i%2===0?G(0.02):'transparent'}}><td style={{padding:'11px 6px',color:'#fff',fontWeight:600}}><span style={{color:GOLD,marginRight:'5px'}}>{PLANET_GLYPH[p.planet]??'✦'}</span>{p.planet_hi||PLANET_HI[p.planet]||p.planet}{p.retrograde&&<span style={{color:'#f59e0b',fontSize:'10px',marginLeft:'4px'}}>® Vakri</span>}</td><td style={{padding:'11px 6px',color:'#e2e8f0'}}>{p.rashi}</td><td style={{padding:'11px 6px',color:'#e2e8f0'}}>{ordinal(p.house)}</td><td style={{padding:'11px 6px',color:'#94a3b8',fontSize:'12px'}}>{p.nakshatra}</td><td style={{padding:'11px 6px',color:'#94a3b8',fontSize:'12px'}}>{p.dignity}</td><td style={{padding:'11px 6px'}}><span style={{color:sc,fontSize:'12px',fontWeight:700}}>{sd} {p.strength}</span></td></tr>)
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{margin:'10px 0 0',color:'#475569',fontSize:'11px'}}>⚖️ Shadbala classical 6-component system (BPHS Ch.27) · Swiss Ephemeris</p>
            </div>
          )}

          <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
            <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>⏰ Dasha Kaal — Vimshottari System</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[{label:'Mahadasha',lord:mahadasha,color:'#60a5fa',lv:'L1'},{label:'Antardasha',lord:antardasha,color:'#a78bfa',lv:'L2'},{label:'Pratyantar',lord:pratyantar,color:GOLD,lv:'L3'},{label:'Sookshma',lord:sookshma,color:'#34d399',lv:'L4'}].map(({label,lord,color,lv})=>(<div key={label} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.06)'}}><div style={{width:'30px',height:'30px',borderRadius:'50%',background:`${color}20`,border:`1px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color,fontSize:'11px',fontWeight:700}}>{lv}</div><div style={{flex:1}}><p style={{margin:0,color:'#64748b',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p><p style={{margin:'2px 0 0',color:'#fff',fontSize:'15px',fontWeight:700}}>{lord}</p></div></div>))}
            </div>
          </div>

          {actionWindows.length>0&&(
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>🗓 Action Windows — Trikal Precision</p>
              {actionWindows.map((w,i)=>{const hi=w.strength==='High';return(<div key={i} style={{padding:'13px',background:hi?'rgba(34,197,94,0.06)':G(0.04),border:`1px solid ${hi?'rgba(34,197,94,0.2)':G(0.15)}`,borderRadius:'10px',marginBottom:'8px'}}><div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px'}}><span style={{color:hi?'#22c55e':GOLD,fontSize:'13px',fontWeight:700}}>{hi?'🟢':'🟡'} {w.window}</span><span style={{padding:'2px 8px',borderRadius:'10px',background:hi?'rgba(34,197,94,0.15)':G(0.1),color:hi?'#22c55e':GOLD,fontSize:'11px',fontWeight:600}}>{w.strength}</span></div><p style={{margin:0,color:'#e2e8f0',fontSize:'13px',lineHeight:1.5}}>{w.reason}</p></div>)})}
            </div>
          )}

          {hasNewUpay ? (
            <UpayCards remedies={upayItems} isPaid={isPaid}/>
          ) : oldRemedies.length > 0 && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>🙏 Upay — Remedy Plan (BPHS Classical)</p>
              {oldRemedies.slice(0,1).map((r:any,i:number)=>(
                <div key={i} style={{display:'grid',gap:'10px'}}>
                  {[{icon:'🕉️',label:'Mantra',value:r.mantra,sub:r.count,color:'#60a5fa'},{icon:'🌾',label:'Dana',value:r.dana,sub:'As prescribed',color:'#34d399'},{icon:'🪔',label:'Vrat',value:r.vrat,sub:'Classical',color:GOLD}].map(({icon,label,value,sub,color})=>(<div key={label} style={{display:'flex',gap:'12px',padding:'13px',background:G(0.04),border:`1px solid ${G(0.12)}`,borderRadius:'10px'}}><span style={{fontSize:'24px',flexShrink:0}}>{icon}</span><div><p style={{margin:'0 0 2px',color,fontSize:'11px',fontWeight:700,textTransform:'uppercase'}}>{label}</p><p style={{margin:'0 0 2px',color:'#e2e8f0',fontSize:'13px'}}>{value}</p><p style={{margin:0,color:'#64748b',fontSize:'11px'}}>{sub}</p></div></div>))}
                </div>
              ))}
              {s(genRem.daily as string)!=='—'&&<p style={{margin:'12px 0 0',color:'#64748b',fontSize:'12px'}}>🕯️ Daily: {s(genRem.daily as string)}</p>}
            </div>
          )}

          {panchang.tithi&&(
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>📅 Aaj Ka Panchang</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'10px'}}>
                {[{label:'Tithi',value:s(panchang.tithi as string)},{label:'Vara',value:s(panchang.weekday as string)},{label:'Nakshatra',value:s(panchang.nakshatra as string)},{label:'Yoga',value:s(panchang.yoga as string)}].map(({label,value})=>(<div key={label} style={{padding:'10px',background:'rgba(255,255,255,0.03)',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.06)'}}><p style={{margin:'0 0 2px',color:'#64748b',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p><p style={{margin:0,color:'#e2e8f0',fontSize:'14px',fontWeight:600}}>{value}</p></div>))}
              </div>
              {s(panchang.rahu_kaal as string)!=='—'&&(<div style={{padding:'10px 13px',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'8px'}}><span style={{color:'#ef4444',fontSize:'13px',fontWeight:600}}>🕐 Rahu Kaal: </span><span style={{color:'#fca5a5',fontSize:'13px'}}>{s(panchang.rahu_kaal as string)}</span></div>)}
            </div>
          )}

          {!isPaid&&<LockedSection slug={slug}/>}

          <MaaShakti slug={slug}/>

          <div style={{background:'rgba(8,14,28,0.95)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'18px',marginBottom:'14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
              <div style={{width:'46px',height:'46px',borderRadius:'50%',overflow:'hidden',flexShrink:0,border:`1px solid ${G(0.35)}`,background:G(0.1)}}>
                <img src="/images/founder.png" alt="Rohiit Gupta — Chief Vedic Architect" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
              </div>
              <div>
                <p style={{margin:0,color:'#fff',fontSize:'14px',fontWeight:700}}>Rohiit Gupta</p>
                <p style={{margin:0,color:'#64748b',fontSize:'12px'}}>Chief Vedic Architect · Trikal Vaani · Delhi NCR</p>
              </div>
            </div>
            <p style={{margin:'0 0 12px',color:'#94a3b8',fontSize:'13px',lineHeight:1.6}}>This analysis is powered by Swiss Ephemeris — the same engine used by professional astrologers worldwide — combined with Brihat Parashara Hora Shastra, Bhrigu Nandi Nadi patterns, and Shadbala calculations. Payments secured by <strong style={{color: RAZORPAY_BLUE}}>Razorpay</strong>.</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {['15+ Years Vedic Study','Parashara BPHS','Swiss Ephemeris','Delhi NCR','Razorpay Secured'].map(t=>(<span key={t} style={{padding:'4px 9px',borderRadius:'6px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color: t==='Razorpay Secured' ? RAZORPAY_BLUE : '#64748b',fontSize:'11px', fontWeight: t==='Razorpay Secured' ? 600 : 400}}>{t}</span>))}
            </div>
          </div>

          <div style={{textAlign:'center',marginBottom:'24px'}}>
            <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginBottom:'16px'}}>
              <a href={`https://wa.me/?text=Maine%20Trikal%20Vaani%20pe%20kundali%20padhi%20—%20bahut%20accurate!%20${encodeURIComponent('https://trikalvaani.com/report/'+slug)}`} target="_blank" rel="noopener noreferrer" style={{padding:'11px 20px',borderRadius:'10px',background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.25)',color:'#25D366',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>📱 WhatsApp Share</a>
              <PDFBtn/>
              <Link href="/" style={{padding:'11px 20px',borderRadius:'10px',background:G(0.08),border:`1px solid ${G(0.25)}`,color:GOLD,fontSize:'13px',fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:'6px'}}><ArrowLeft size={14}/>Apni Reading Karein</Link>
            </div>
            <p style={{margin:0,color:'#1e293b',fontSize:'11px',lineHeight:1.5}}>🔱 Trikal Vaani — Kaal bada balwan hai, sabko nach nachaye<br/>trikalvaani.com · Rohiit Gupta, Chief Vedic Architect, Delhi NCR</p>
          </div>

        </div>
      </main>
      <SiteFooter/>
    </div>
  )
}
