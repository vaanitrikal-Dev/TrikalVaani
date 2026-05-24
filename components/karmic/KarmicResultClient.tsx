// TRIKAL VAANI — Karmic Result Client Component
// CEO & Chief Vedic Architect: Rohiit Gupta
// File: components/karmic/KarmicResultClient.tsx
// VERSION: 1.0
// Handles: animated waiting screen, auto-polling, 6-dim render, PDF, share.

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
interface KarmicRow {
  slug:             string
  language:         string
  person_data:      { name?: string; place?: string; cityName?: string }
  gemini_narrative: string | null
  pdf_url:          string | null
}

// ── Dimension markers ──────────────────────────────────────────────────────────
const DIMENSION_MARKERS = [
  { marker: '═══ 1. CORE PERSONALITY ═══',                   title: 'Core Personality',                icon: '🪔' },
  { marker: '═══ 2. FIDELITY & RELATIONSHIP CONDUCT ═══',     title: 'Fidelity & Relationship Conduct', icon: '💗' },
  { marker: '═══ 3. FINANCIAL BEHAVIOUR ═══',                 title: 'Financial Behaviour',             icon: '🪙' },
  { marker: '═══ 4. FAMILY & PARENTAL RESPECT ═══',           title: 'Family & Parental Respect',       icon: '🏠' },
  { marker: '═══ 5. HIDDEN TENDENCIES & KARMIC BAGGAGE ═══',  title: 'Hidden Tendencies & Karmic Baggage', icon: '🌑' },
  { marker: '═══ 6. MARRIAGE OUTLOOK & LONGEVITY ═══',        title: 'Marriage Outlook & Longevity',    icon: '🔱' },
]
const MAA_SHAKTI_MARKER = '═══ MAA SHAKTI ═══'

// ── Animated waiting lines ─────────────────────────────────────────────────────
const WAIT_LINES = [
  'Trikal aapki kundali ke 6 karmic aayam padh raha hai...',
  'Bhrigu Nandi Nadi ke sutra khul rahe hain...',
  'Shadbala aur Navamsa ka vishleshan ho raha hai...',
  'Lagna lord aur chandra ki gehrai mein utar rahe hain...',
  'Rahu-Ketu ke karmic baggage ko samjha ja raha hai...',
  'Aapke vivah bhavishya ke sutra decode ho rahe hain...',
  'Claude Sonnet reading ko polish kar raha hai...',
  'Bas thodi der aur — Trikal Maa ki kripa se...',
]

// ── Narrative parser ───────────────────────────────────────────────────────────
function parseReading(narrative: string) {
  let working = narrative
  let maaShakti = ''

  if (working.includes(MAA_SHAKTI_MARKER)) {
    const [before, after] = working.split(MAA_SHAKTI_MARKER)
    working   = before
    maaShakti = (after ?? '').trim()
  }

  let opening = ''
  const firstMarker = DIMENSION_MARKERS[0].marker
  if (working.includes(firstMarker)) {
    const [op, rest] = working.split(firstMarker)
    opening = op.trim()
    working = firstMarker + rest
  }

  const dimensions: { title: string; icon: string; body: string }[] = []
  for (let i = 0; i < DIMENSION_MARKERS.length; i++) {
    const cur  = DIMENSION_MARKERS[i].marker
    const next = DIMENSION_MARKERS[i + 1]?.marker
    if (!working.includes(cur)) continue
    const afterCur = working.split(cur)[1] ?? ''
    const body = next && afterCur.includes(next) ? afterCur.split(next)[0] : afterCur
    dimensions.push({ title: DIMENSION_MARKERS[i].title, icon: DIMENSION_MARKERS[i].icon, body: body.trim() })
  }

  return { opening, dimensions, maaShakti }
}

function paras(text: string) {
  return text.split('\n\n').map(p => p.trim()).filter(Boolean)
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function KarmicResultClient({ initialRow }: { initialRow: KarmicRow }) {
  const [narrative, setNarrative] = useState<string | null>(initialRow.gemini_narrative)
  const [pdfUrl, setPdfUrl]       = useState<string | null>(initialRow.pdf_url)
  const [waitIdx, setWaitIdx]     = useState(0)
  const [elapsed, setElapsed]     = useState(0)
  const [polling, setPolling]     = useState(!initialRow.gemini_narrative || initialRow.gemini_narrative.length < 200)
  const [error, setError]         = useState<string | null>(null)

  const slug        = initialRow.slug
  // Auto-trigger PDF if narrative ready but pdf_url missing (handles existing readings)
  const personName  = initialRow.person_data?.name ?? 'This Soul'
  const personPlace = initialRow.person_data?.place ?? initialRow.person_data?.cityName ?? ''

  // ── Auto-trigger PDF on load if narrative ready but no pdf_url ─────────────
  useEffect(() => {
    if (initialRow.gemini_narrative && initialRow.gemini_narrative.length > 200 && !initialRow.pdf_url) {
      // Small delay so page renders first
      const t = setTimeout(() => triggerPdfGeneration(), 2000)
      return () => clearTimeout(t)
    }
  }, []) // eslint-disable-line

  // ── Poll for narrative ───────────────────────────────────────────────────────
  const triggerPdfGeneration = useCallback(async () => {
    if (pdfUrl) return // already have PDF
    try {
      const res = await fetch('/api/karmic-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }), cache: 'no-store',
      })
      const data = await res.json()
      if (data.pdf_url) setPdfUrl(data.pdf_url)
    } catch { /* silent — PDF is optional */ }
  }, [slug, pdfUrl])

  const poll = useCallback(async () => {
    try {
      const res  = await fetch('/api/karmic-reading', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }), cache: 'no-store',
      })
      const data = await res.json()
      if (data.narrative && data.narrative.length > 200) {
        setNarrative(prev => prev && prev.length > 200 ? prev : data.narrative)
        setPolling(false)
        // Auto-trigger PDF generation once narrative is ready
        triggerPdfGeneration()
      }
    } catch {
      // silently retry
    }
  }, [slug])

  // ── Rotating wait lines ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!polling) return
    const lineTimer = setInterval(() => setWaitIdx(i => (i + 1) % WAIT_LINES.length), 3500)
    const elapsedTimer = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => { clearInterval(lineTimer); clearInterval(elapsedTimer) }
  }, [polling])

  // ── Poll every 12 seconds ────────────────────────────────────────────────────
  useEffect(() => {
    if (!polling) return
    poll() // immediate first check
    const timer = setInterval(poll, 12000)
    return () => clearInterval(timer)
  }, [polling, poll])

  // ── Abort after 3 minutes ────────────────────────────────────────────────────
  useEffect(() => {
    if (!polling) return
    if (elapsed >= 180) {
      setPolling(false)
      setError('Reading generation timed out. Please refresh the page — your payment is safe.')
    }
  }, [elapsed, polling])

  const resultUrl = `https://trikalvaani.com/karmic/${slug}`
  const waText    = encodeURIComponent(
    `Jai Mahakaal! Meri Karmic Background Reading dekho — Trikal Vaani.\n${resultUrl}\n\nJai Maa Shakti!`
  )

  // ── WAITING STATE ──────────────────────────────────────────────────────────────
  if (polling) {
    const progress = Math.min((elapsed / 90) * 100, 95) // 90s expected
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center px-5">
        <div className="max-w-lg w-full text-center">

          {/* Pulsing symbol */}
          <div className="text-6xl mb-6 animate-pulse">🔱</div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
            {personName} ki Karmic Reading
          </h2>
          <p className="text-[#D4AF37] text-sm mb-8 tracking-wide">
            Bhrigu Nandi Nadi · 6 Karmic Dimensions
          </p>

          {/* Progress bar */}
          <div className="w-full bg-[#1a1a2e] rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)',
              }}
            />
          </div>

          {/* Rotating mystical line */}
          <div className="min-h-[56px] flex items-center justify-center mb-6">
            <p
              key={waitIdx}
              className="text-gray-300 text-sm sm:text-base leading-relaxed animate-pulse"
              style={{ animation: 'fadeIn 0.8s ease-in' }}
            >
              {WAIT_LINES[waitIdx]}
            </p>
          </div>

          {/* Elapsed time */}
          <p className="text-gray-600 text-xs mb-8">
            {elapsed < 30
              ? 'Shuru ho gaya hai — bas 60-90 second...'
              : elapsed < 70
              ? 'Aadha ho gaya — thoda aur...'
              : 'Almost ready — final polish ho raha hai...'}
          </p>

          {/* What's being generated */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-8">
            {DIMENSION_MARKERS.map((d, i) => (
              <div key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left"
                style={{
                  background: elapsed > i * 12 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${elapsed > i * 12 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  color: elapsed > i * 12 ? '#D4AF37' : '#475569',
                  transition: 'all 0.5s',
                }}
              >
                <span>{d.icon}</span>
                <span>{d.title}</span>
                {elapsed > i * 12 && <span className="ml-auto">✓</span>}
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-[10px]">
            Aapka ₹251 secure hai. Reading taiyaar hone par automatic dikhega.
          </p>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    )
  }

  // ── ERROR STATE ────────────────────────────────────────────────────────────────
  if (error || !narrative) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔱</div>
          <h2 className="text-xl font-semibold text-white mb-3">Reading aa rahi hai...</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {error ?? 'Aapki reading generate ho rahi hai. Page refresh karein.'}
          </p>
          <button
            onClick={() => { setPolling(true); setElapsed(0); setError(null) }}
            className="px-6 py-3 rounded-lg font-semibold text-[#080B12] transition"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D76E 100%)' }}
          >
            Dobara Try Karein →
          </button>
          <p className="text-gray-600 text-xs mt-4">
            Madad chahiye? WhatsApp: +91 92118 04111
          </p>
        </div>
      </div>
    )
  }

  // ── READING READY ──────────────────────────────────────────────────────────────
  const parsed = parseReading(narrative)

  return (
    <div className="min-h-screen bg-[#080B12] text-[#f5f5f5]">

      {/* HERO */}
      <header className="relative overflow-hidden border-b border-[#D4AF37]/20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1120] via-[#080B12] to-[#080B12] opacity-90" />
        <div className="relative max-w-4xl mx-auto px-5 py-12 sm:py-16 text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-[0.25em] uppercase">
            Trikal Vaani · Karmic Background Reading
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold">{personName}</h1>
          {personPlace && <p className="mt-4 text-sm text-gray-400">{personPlace}</p>}
          <p className="mt-2 text-xs text-gray-500 tracking-widest uppercase">
            Bhrigu Nandi Nadi · 6 Karmic Dimensions · ₹251
          </p>
        </div>
      </header>

      {/* OPENING */}
      {parsed.opening && (
        <section className="max-w-3xl mx-auto px-5 pt-8">
          <div className="bg-[#0d1120]/60 border-l-4 border-[#D4AF37] rounded-r-xl p-5 sm:p-6">
            {paras(parsed.opening).map((p, i) => (
              <p key={i} className="text-base sm:text-lg leading-relaxed text-gray-100 mb-3 last:mb-0">{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* 6 DIMENSIONS */}
      {parsed.dimensions.length > 0 && (
        <section className="max-w-3xl mx-auto px-5 py-8 space-y-6">
          {parsed.dimensions.map((dim, i) => (
            <article key={i} className="bg-[#0d1120]/60 border border-[#D4AF37]/15 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{dim.icon}</span>
                <h2 className="text-lg sm:text-xl font-semibold text-[#D4AF37]">
                  <span className="text-gray-500 mr-2">{i + 1}.</span>{dim.title}
                </h2>
              </div>
              {paras(dim.body).map((p, j) => (
                <p key={j} className="text-base leading-[1.9] text-[#e8e8e8] mb-4 last:mb-0">{p}</p>
              ))}
            </article>
          ))}
        </section>
      )}

      {/* MAA SHAKTI */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0d1120] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-10 text-center">
          <div className="text-3xl sm:text-4xl mb-3">🔱</div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white">Maa Shakti Ki Kripa Banee Rahe</h3>
          <p className="text-[#D4AF37] mt-1 text-sm">माँ शक्ति की कृपा बनी रहे</p>
          {parsed.maaShakti ? (
            <div className="mt-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl mx-auto text-left sm:text-center">
              {paras(parsed.maaShakti).map((p, i) => <p key={i} className="mb-3 last:mb-0">{p}</p>)}
            </div>
          ) : (
            <p className="mt-5 text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Is reading ke baad Maa ki <strong className="text-white">Arzi</strong> karein.
              Aur jab samay sahi ho, wapas aaiye <strong className="text-white">Dhanyawad</strong> arpit karne.
            </p>
          )}
          <div className="mt-6">
            <Link href={`/maa-shakti?ref=karmic-${slug}`}
              className="inline-block px-7 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold tracking-wide transition shadow-lg">
              Maa ko Arzi karein →
            </Link>
          </div>
        </div>
      </section>

      {/* SHARE + PDF */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <div className="text-center mb-5">
          <h3 className="text-xs sm:text-sm text-[#D4AF37] tracking-[0.3em] uppercase">Share &amp; Download</h3>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg font-semibold tracking-wide transition hover:opacity-90"
            style={{ background: '#25D366', color: '#080B12' }}>
            WhatsApp par share karein
          </a>
          {pdfUrl ? (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg font-semibold tracking-wide transition hover:opacity-90"
              style={{ background: '#D4AF37', color: '#080B12' }}>
              Download PDF
            </a>
          ) : null}
          {!pdfUrl && (
            <p className="text-xs text-gray-500 mt-1 text-center w-full">
              📄 PDF taiyaar ho rahi hai — kuch der baad refresh karein.
            </p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#D4AF37]/10 mt-8">
        <div className="max-w-4xl mx-auto px-5 py-8 text-center text-xs text-gray-500">
          <p className="text-[#D4AF37] tracking-[0.3em] uppercase">Trikal Vaani</p>
          <p className="mt-2">AI-Powered Vedic Astrology · Rohiit Gupta, Chief Vedic Architect</p>
          <p className="mt-1">MSME · UDYAM-DL-10-0119070 · trikalvaani.com</p>
          <p className="mt-3 text-[10px] text-gray-600 max-w-lg mx-auto leading-relaxed">
            This reading reveals karmic patterns from the birth chart for self-understanding.
            Trikal reveals patterns — it does not pass judgement on any person.
          </p>
        </div>
      </footer>
    </div>
  )
}
