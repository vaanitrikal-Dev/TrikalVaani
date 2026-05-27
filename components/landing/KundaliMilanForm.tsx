// TRIKAL VAANI - KundaliMilanForm Component
// CEO & Chief Vedic Architect: Rohiit Gupta
// File: components/landing/KundaliMilanForm.tsx
// VERSION: 1.2 - Brand flip + Delhi NCR removal + AI vendor names removed
// SIGNED: ROHIIT GUPTA, CEO
//
// v1.2 CHANGE (Brand-flip session - CEO approved, checklist-verified):
//   - Visible brand "Trikal Vaani" -> "Trikaal Vaani" (3 spots: schema service
//     name, schema provider name, Razorpay checkout name).
//   - Persona "Trikal" -> "Trikaal" (2 spots: payment loading message,
//     audience selector subtext).
//   - "Delhi NCR" location credential REMOVED (2 spots: hero subline, footer).
//   - AI vendor names "Gemini 2.5 Pro + Claude Sonnet polish" removed from
//     OfferCatalog schema description -> "Premium AI engine with expert polish".
//   PROTECTED (untouched): all trikalvaani.com URLs/@id, +919211804111,
//   every /api route path, and the v1.1 handlePaymentSubmit logic.
//
// v1.1 CHANGE (Day 7 - CEO approved surgical fix):
//   handlePaymentSubmit now sends FULL birth data (buildMilanBody) to
//   /api/create-milan-order so verify-payment can compute the chart.
//   Previously sent only { tier, amount, audience } -> paid flow broke.
//   NOTHING ELSE CHANGED. UI, wizard, validation, styling all identical.
//
// LOCKED PER IR-13 (Iron Rule v2.0)

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay-helper"

// -- Types -------------------------------------------------------------------

export type MilanTier = 'free' | 'basic' | 'deep_couple' | 'deep_parent' | 'deep_both'
export type AudienceVersion = 'couple' | 'parent' | 'both'
export type StepNumber = 1 | 2 | 3

export interface PersonData {
  name:           string
  dob:            string
  tob:            string
  unknownTime:    boolean
  placeQuery:     string
  city:           string
  latitude:       number | ""
  longitude:      number | ""
  timezoneOffset: number
}

export interface KundaliMilanFields {
  bride:    PersonData
  groom:    PersonData
  audience: AudienceVersion | ""
  contactName:        string
  contactMobile:      string
  contactCountryCode: string
  contactCountryDigits: number
  contactEmail:       string
  language:           "hindi" | "hinglish" | "english"
}

interface PlaceSuggestion {
  place_id:       string
  description:    string
  main_text:      string
  secondary_text: string
}

interface Country {
  name:   string
  code:   string
  dial:   string
  digits: number
  flag:   string
}

// -- Countries (reused from BirthForm v9.2) ----------------------------------

const COUNTRIES: Country[] = [
  { name: 'India',          code: 'IN', dial: '+91',  digits: 10, flag: '🇮🇳' },
  { name: 'USA',            code: 'US', dial: '+1',   digits: 10, flag: '🇺🇸' },
  { name: 'UK',             code: 'GB', dial: '+44',  digits: 10, flag: '🇬🇧' },
  { name: 'UAE / Dubai',    code: 'AE', dial: '+971', digits: 9,  flag: '🇦🇪' },
  { name: 'Canada',         code: 'CA', dial: '+1',   digits: 10, flag: '🇨🇦' },
  { name: 'Australia',      code: 'AU', dial: '+61',  digits: 9,  flag: '🇦🇺' },
  { name: 'Singapore',      code: 'SG', dial: '+65',  digits: 8,  flag: '🇸🇬' },
  { name: 'Nepal',          code: 'NP', dial: '+977', digits: 10, flag: '🇳🇵' },
  { name: 'Bangladesh',     code: 'BD', dial: '+880', digits: 10, flag: '🇧🇩' },
  { name: 'Pakistan',       code: 'PK', dial: '+92',  digits: 10, flag: '🇵🇰' },
  { name: 'Sri Lanka',      code: 'LK', dial: '+94',  digits: 9,  flag: '🇱🇰' },
  { name: 'Germany',        code: 'DE', dial: '+49',  digits: 10, flag: '🇩🇪' },
  { name: 'France',         code: 'FR', dial: '+33',  digits: 9,  flag: '🇫🇷' },
  { name: 'Netherlands',    code: 'NL', dial: '+31',  digits: 9,  flag: '🇳🇱' },
  { name: 'New Zealand',    code: 'NZ', dial: '+64',  digits: 9,  flag: '🇳🇿' },
  { name: 'South Africa',   code: 'ZA', dial: '+27',  digits: 9,  flag: '🇿🇦' },
  { name: 'Malaysia',       code: 'MY', dial: '+60',  digits: 9,  flag: '🇲🇾' },
  { name: 'Mauritius',      code: 'MU', dial: '+230', digits: 8,  flag: '🇲🇺' },
  { name: 'Bahrain',        code: 'BH', dial: '+973', digits: 8,  flag: '🇧🇭' },
  { name: 'Kuwait',         code: 'KW', dial: '+965', digits: 8,  flag: '🇰🇼' },
  { name: 'Qatar',          code: 'QA', dial: '+974', digits: 8,  flag: '🇶🇦' },
  { name: 'Oman',           code: 'OM', dial: '+968', digits: 8,  flag: '🇴🇲' },
  { name: 'Saudi Arabia',   code: 'SA', dial: '+966', digits: 9,  flag: '🇸🇦' },
  { name: 'Kenya',          code: 'KE', dial: '+254', digits: 9,  flag: '🇰🇪' },
  { name: 'Nigeria',        code: 'NG', dial: '+234', digits: 10, flag: '🇳🇬' },
  { name: 'Japan',          code: 'JP', dial: '+81',  digits: 10, flag: '🇯🇵' },
  { name: 'Hong Kong',      code: 'HK', dial: '+852', digits: 8,  flag: '🇭🇰' },
]

// -- Google Maps API Functions (inherited from BirthForm v9.2) ---------------

async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return []
  try {
    const res = await fetch(
      `/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input:                query,
          includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
          languageCode:         'en',
        }),
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.suggestions ?? [])
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        place_id:       s.placePrediction.placeId ?? '',
        description:    s.placePrediction.text?.text ?? '',
        main_text:      s.placePrediction.structuredFormat?.mainText?.text
                        ?? s.placePrediction.text?.text ?? '',
        secondary_text: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
      }))
  } catch { return [] }
}

async function fetchPlaceDetails(placeId: string): Promise<{ lat: number; lng: number; city: string } | null> {
  if (!placeId) return null
  try {
    const fields = 'location,displayName'
    const url    = `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}`
    const res    = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`)
    if (!res.ok) return null
    const data = await res.json()
    const lat  = data.location?.latitude  ?? null
    const lng  = data.location?.longitude ?? null
    const city = data.displayName?.text   ?? ''
    if (lat === null || lng === null) return null
    return { lat, lng, city }
  } catch { return null }
}

async function fetchTimezone(lat: number, lng: number): Promise<number> {
  try {
    const ts  = Math.floor(Date.now() / 1000)
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}`
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`)
    if (!res.ok) return 5.5
    const data = await res.json()
    if (data.status !== 'OK') return 5.5
    const totalOffset = (data.rawOffset + data.dstOffset) / 3600
    return Math.round(totalOffset * 4) / 4
  } catch { return 5.5 }
}

// -- Constants ---------------------------------------------------------------

const GOLD          = '#D4AF37'
const RAZORPAY_BLUE = '#3395FF'
const ROSE          = '#F472B6'
const BLUE          = '#60A5FA'
const GREEN         = '#22C55E'
const GOLD_RGBA     = (a: number) => `rgba(212,175,55,${a})`

const TRUST_BADGES = [
  { icon: '⚡', label: 'Swiss Ephemeris' },
  { icon: '📖', label: 'BPHS Classical'  },
  { icon: '🔮', label: '36 Guna Ashtakoot' },
  { icon: '⚖️', label: 'Mangal + Nadi Dosh' },
]

const LOADING_STEPS_PAYMENT = [
  'Razorpay payment verify ho raha hai...',
  'Bride + Groom kundali compute ho rahi hai...',
  '36 Guna Ashtakoot calculate ho raha hai...',
  'Mangal, Nadi, Bhakoot Dosh check ho raha hai...',
  'Trikaal aapka Milan report taiyaar kar raha hai...',
]

const LOADING_STEPS_FREE = [
  'Bride + Groom kundali compute ho rahi hai...',
  '36 Guna score calculate ho raha hai...',
  'Free preview taiyaar ho raha hai...',
]

const LANGUAGE_OPTIONS = [
  { value: 'hinglish', label: 'Hinglish', flag: '🇮🇳', desc: 'Hindi + English mix' },
  { value: 'hindi',    label: 'हिंदी',    flag: '🕉️',  desc: 'Pure Hindi' },
  { value: 'english',  label: 'English',  flag: '🌐',  desc: 'English' },
]

const INITIAL_PERSON: PersonData = {
  name: '', dob: '', tob: '12:00', unknownTime: false,
  placeQuery: '', city: '', latitude: '', longitude: '', timezoneOffset: 5.5,
}

const INITIAL: KundaliMilanFields = {
  bride: { ...INITIAL_PERSON },
  groom: { ...INITIAL_PERSON },
  audience: '',
  contactName: '', contactMobile: '', contactCountryCode: '+91', contactCountryDigits: 10,
  contactEmail: '', language: 'hinglish',
}

// -- Service + Offer JSON-LD (GEO for AI search engines) ---------------------

const MILAN_SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://trikalvaani.com/kundali-milan#service',
  name: 'Trikaal Vaani Kundali Milan - Vedic Compatibility Matching',
  serviceType: 'Vedic Kundali Matching',
  provider: {
    '@type': 'Organization',
    '@id': 'https://trikalvaani.com/#organization',
    name: 'Trikaal Vaani',
    url: 'https://trikalvaani.com',
  },
  areaServed: { '@type': 'Country', name: 'India' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Kundali Milan Tiers',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Free Preview',
        description: '36 Guna score and dosha flags free preview',
        price: '0', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Basic Milan',
        description: 'Full 36 Guna Ashtakoot breakdown with all 8 koots, Mangal Dosh, Nadi Dosh, Bhakoot Dosh analysis. PDF + WhatsApp share.',
        price: '51', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Deep Milan - Couple Version',
        description: 'Deep compatibility analysis for couples with Dos, Donts, and 6 personalized remedies. Premium AI engine with expert polish.',
        price: '101', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Deep Milan - Parent Version',
        description: 'Deep compatibility analysis for parents with Dos, Donts, and 6 ritual remedies. Shudh Hindi authoritative tone.',
        price: '101', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Deep Milan - Both Versions',
        description: 'Both Couple and Parent narratives in one combined PDF. Maximum coverage.',
        price: '151', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// COUNTRY SELECTOR (reused from BirthForm v9.2)
// ---------------------------------------------------------------------------

function CountrySelector({
  value, onChange, id,
}: { value: string; onChange: (dial: string, digits: number) => void; id: string }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const ref                 = useRef<HTMLDivElement>(null)
  const selected            = COUNTRIES.find(c => c.dial === value) ?? COUNTRIES[0]!

  const filtered = search.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search))
    : COUNTRIES

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" id={id} onClick={() => setOpen(o => !o)}
        className="px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 whitespace-nowrap"
        style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', minWidth: '80px' }}>
        <span style={{ fontSize: '1.1rem' }}>{selected.flag}</span>
        <span>{selected.dial}</span>
        <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '2px' }}>▾</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 rounded-lg overflow-hidden shadow-2xl"
          style={{ background: '#0d1120', border: '1px solid rgba(212,175,55,0.25)', width: '220px', maxHeight: '260px' }}>
          <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <input type="text" placeholder="Search country..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 rounded text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}
              autoFocus />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {filtered.map(c => (
              <button key={c.code} type="button"
                onClick={() => { onChange(c.dial, c.digits); setOpen(false); setSearch('') }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm"
                style={{ color: c.dial === value ? GOLD : '#cbd5e1', background: c.dial === value ? GOLD_RGBA(0.08) : 'transparent' }}>
                <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                <span className="flex-1">{c.name}</span>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CITY INPUT (reused from BirthForm v9.2)
// ---------------------------------------------------------------------------

function CityInput({
  id, label, required, value, onSelect, error, placeholder, accentColor,
}: {
  id: string; label?: string; required?: boolean; value: string
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void
  error?: string; placeholder?: string; accentColor?: string
}) {
  const [query,       setQuery]       = useState(value)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [loading,     setLoading]     = useState(false)
  const [selected,    setSelected]    = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setQuery(value); if (value) setSelected(true) }, [value])

  const handleChange = (val: string) => {
    setQuery(val)
    setSelected(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const results = await fetchPlaceSuggestions(val)
      setSuggestions(results)
      setLoading(false)
    }, 400)
  }

  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.main_text)
    setSuggestions([])
    setSelected(true)
    setLoading(true)
    const details = await fetchPlaceDetails(s.place_id)
    if (details) {
      const tz = await fetchTimezone(details.lat, details.lng)
      onSelect(details.city || s.main_text, details.lat, details.lng, tz)
    }
    setLoading(false)
  }

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
          {label} {required && <span style={{ color: accentColor || GOLD }}>*</span>}
        </label>
      )}
      <div className="relative">
        <input id={id} type="search" autoComplete="off"
          placeholder={placeholder ?? 'Type city name...'}
          value={query}
          onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
          style={{ background: '#0d1120', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          {loading ? <span style={{ color: GOLD }}>...</span> : selected ? <span style={{ color: GREEN }}>OK</span> : <span style={{ color: '#475569' }}>📍</span>}
        </span>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
          style={{ background: '#0d1120', border: '1px solid rgba(212,175,55,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => handleSelect(s)}
              className="px-4 py-3 text-sm cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = GOLD_RGBA(0.08))}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600 }}>{s.main_text}</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{s.secondary_text}</p>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PROGRESS BAR (Pattern 3: clickable navigation)
// ---------------------------------------------------------------------------

function ProgressBar({
  currentStep, completedSteps, onStepClick,
}: { currentStep: StepNumber; completedSteps: Set<StepNumber>; onStepClick: (step: StepNumber) => void }) {
  const steps: { num: StepNumber; label: string; icon: string }[] = [
    { num: 1, label: 'Bride',    icon: '🌸' },
    { num: 2, label: 'Groom',    icon: '🤵' },
    { num: 3, label: 'Report',   icon: '📜' },
  ]

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '20px', left: '20px', right: '20px',
          height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: '20px', left: '20px',
          width: completedSteps.size === 0 ? '0%' : completedSteps.size === 1 ? '50%' : '100%',
          height: '2px', background: `linear-gradient(to right, ${GOLD}, ${GREEN})`,
          zIndex: 1, transition: 'width 0.5s ease',
        }} />

        {steps.map(s => {
          const isCompleted = completedSteps.has(s.num)
          const isActive    = currentStep === s.num
          const isClickable = isCompleted || s.num < currentStep
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => isClickable && onStepClick(s.num)}
              disabled={!isClickable}
              style={{
                position: 'relative', zIndex: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                background: 'transparent', border: 'none',
                cursor: isClickable ? 'pointer' : 'default',
                padding: 0,
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: isCompleted ? GREEN : isActive ? GOLD : '#0d1120',
                border: `2px solid ${isCompleted ? GREEN : isActive ? GOLD : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px',
                boxShadow: isActive ? `0 0 16px ${GOLD_RGBA(0.4)}` : 'none',
                transition: 'all 0.3s ease',
              }}>
                {isCompleted ? 'OK' : s.icon}
              </div>
              <span style={{
                fontSize: '11px',
                color: isCompleted ? GREEN : isActive ? GOLD : '#64748b',
                fontWeight: isActive ? 700 : 500,
              }}>
                {s.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SUMMARY CARD (Pattern 1 + 2: visible summary with Edit button)
// ---------------------------------------------------------------------------

function SummaryCard({
  title, icon, person, onEdit, accentColor,
}: {
  title: string; icon: string; person: PersonData;
  onEdit: () => void; accentColor: string;
}) {
  const dobFormatted = person.dob
    ? new Date(person.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''
  const tobFormatted = person.unknownTime ? 'Time unknown' : person.tob

  return (
    <div style={{
      padding: '16px', borderRadius: '12px',
      background: `${accentColor}08`,
      border: `1px solid ${accentColor}30`,
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <span style={{ color: accentColor, fontWeight: 700, fontSize: '13px' }}>
            {icon} {title}
          </span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${accentColor}40`,
            color: accentColor, fontSize: '11px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Edit
        </button>
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5 }}>
        <strong style={{ color: '#e2e8f0' }}>{person.name}</strong>
        {' . '}{dobFormatted}
        {' . '}{tobFormatted}
        {' . '}{person.city}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PERSON FORM (used for both Bride and Groom)
// ---------------------------------------------------------------------------

function PersonForm({
  person, role, accentColor, onChange, errors, onContinue, continueLabel,
}: {
  person: PersonData;
  role: 'bride' | 'groom';
  accentColor: string;
  onChange: (updates: Partial<PersonData>) => void;
  errors: Partial<Record<keyof PersonData, string>>;
  onContinue: () => void;
  continueLabel: string;
}) {
  const isBride = role === 'bride'
  const idPrefix = role

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  })

  return (
    <div style={{
      padding: '20px', borderRadius: '16px',
      background: `${accentColor}06`,
      border: `1px solid ${accentColor}30`,
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: accentColor }} />
        <h3 style={{ color: accentColor, fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
          {isBride ? '🌸 Bride (Vadhu) Details' : '🤵 Groom (Var) Details'}
        </h3>
      </div>

      <div className="grid gap-4">
        {/* Name */}
        <div>
          <label htmlFor={`${idPrefix}-name`} className="block text-sm font-medium text-slate-300 mb-1.5">
            Full Name <span style={{ color: accentColor }}>*</span>
          </label>
          <input
            id={`${idPrefix}-name`} type="text"
            placeholder={isBride ? "Enter bride's full name" : "Enter groom's full name"}
            value={person.name}
            onChange={e => onChange({ name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle(!!errors.name)}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* DOB */}
        <div>
          <label htmlFor={`${idPrefix}-dob`} className="block text-sm font-medium text-slate-300 mb-1.5">
            Date of Birth <span style={{ color: accentColor }}>*</span>
          </label>
          <input
            id={`${idPrefix}-dob`} type="date"
            value={person.dob}
            onChange={e => onChange({ dob: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle(!!errors.dob)}
          />
          {errors.dob && <p className="text-red-400 text-xs mt-1">{errors.dob}</p>}
        </div>

        {/* TOB */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={`${idPrefix}-tob`} className="text-sm font-medium text-slate-300">
              Time of Birth {!person.unknownTime && <span style={{ color: accentColor }}>*</span>}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
              <input
                type="checkbox" checked={person.unknownTime}
                onChange={e => onChange({ unknownTime: e.target.checked })}
                className="rounded"
              />
              Unknown time
            </label>
          </div>
          <input
            id={`${idPrefix}-tob`} type="time"
            value={person.tob}
            onChange={e => onChange({ tob: e.target.value })}
            disabled={person.unknownTime}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={{ ...inputStyle(!!errors.tob), opacity: person.unknownTime ? 0.4 : 1 }}
          />
          {person.unknownTime && (
            <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon)</p>
          )}
        </div>

        {/* Place of Birth */}
        <div>
          <CityInput
            id={`${idPrefix}-place`}
            label="Place of Birth"
            required
            accentColor={accentColor}
            value={person.placeQuery}
            placeholder={isBride ? "Type bride's birth city..." : "Type groom's birth city..."}
            error={errors.latitude ? 'Please select a city from suggestions' : undefined}
            onSelect={(city, lat, lng, tz) => {
              onChange({
                placeQuery: city, city, latitude: lat, longitude: lng, timezoneOffset: tz,
              })
            }}
          />
        </div>

        {/* Lat/Lng display */}
        {person.latitude !== '' && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Latitude',  value: (person.latitude as number).toFixed(4) },
              { label: 'Longitude', value: (person.longitude as number).toFixed(4) },
              { label: 'Timezone',  value: `UTC ${person.timezoneOffset >= 0 ? '+' : ''}${person.timezoneOffset}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-xs text-slate-500 mb-1">{label}</label>
                <div className="px-3 py-2 rounded-lg text-xs font-mono text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: GREEN }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 mt-2"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}CC 100%)`,
            color: '#080B12',
            fontSize: '14px',
          }}
        >
          {continueLabel}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AUDIENCE SELECTOR (Step 3 - in-form selector)
// ---------------------------------------------------------------------------

function AudienceSelector({
  selected, onChange,
}: { selected: AudienceVersion | ''; onChange: (a: AudienceVersion) => void }) {
  const options: { value: AudienceVersion; icon: string; titleHindi: string; titleEnglish: string; price: string; desc: string; tone: string; color: string; highlight?: boolean }[] = [
    {
      value: 'couple',
      icon: '💕',
      titleHindi: 'Hum Dono Ke Liye',
      titleEnglish: 'For Us (Couple)',
      price: '₹101',
      desc: 'Hopeful . Romantic . Anti-fear',
      tone: 'Hinglish . Modern . For lovers',
      color: ROSE,
    },
    {
      value: 'parent',
      icon: '🙏',
      titleHindi: 'Pariwar Ke Liye',
      titleEnglish: 'For Family / Parents',
      price: '₹101',
      desc: 'Respectful . Traditional . Protective',
      tone: 'Shudh Hindi . Ritual-coded',
      color: BLUE,
    },
    {
      value: 'both',
      icon: '✨',
      titleHindi: 'Dono Ke Liye',
      titleEnglish: 'Both Versions',
      price: '₹151',
      desc: 'Maximum coverage . One PDF . Two narratives',
      tone: 'Couple section + Parent section',
      color: GOLD,
      highlight: true,
    },
  ]

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p style={{ color: GOLD, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>
          One Last Step
        </p>
        <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
          Yeh report kiske liye hai?
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
          Choose the narrative style - Trikaal will write specifically for that audience.
        </p>
      </div>

      <div className="grid gap-3">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: selected === opt.value
                ? `linear-gradient(135deg, ${opt.color}20, ${opt.color}10)`
                : 'rgba(255,255,255,0.03)',
              border: `2px solid ${selected === opt.value ? opt.color : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {opt.highlight && (
              <div style={{
                position: 'absolute', top: '-9px', left: '50%', transform: 'translateX(-50%)',
                background: GOLD, color: '#080B12',
                fontSize: '9px', fontWeight: 700,
                padding: '2px 10px', borderRadius: '10px', whiteSpace: 'nowrap',
              }}>
                MAXIMUM COVERAGE
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                <span style={{ color: selected === opt.value ? opt.color : '#e2e8f0', fontWeight: 700, fontSize: '14px' }}>
                  {opt.titleHindi}
                </span>
              </div>
              <span style={{ color: opt.color, fontWeight: 800, fontSize: '18px', fontFamily: 'Georgia, serif' }}>
                {opt.price}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 4px' }}>
              {opt.titleEnglish}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px' }}>
              {opt.desc}
            </p>
            <p style={{ color: '#475569', fontSize: '10px', margin: 0, fontStyle: 'italic' }}>
              {opt.tone}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export default function KundaliMilanForm() {
  const router = useRouter()

  const [fields, setFields] = useState<KundaliMilanFields>(INITIAL)

  const [currentStep,    setCurrentStep]    = useState<StepNumber>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<StepNumber>>(new Set())

  const [errors,         setErrors]         = useState<Record<string, string>>({})
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [apiError,       setApiError]       = useState<string | null>(null)
  const [loadingStep,    setLoadingStep]    = useState(0)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // v1.2: price tier picker. free / basic_51 / deep_101 / both_151
  // deep_101 needs an audience (couple|parent). free/basic_51/both_151 do not.
  type PriceTier = 'free' | 'basic_51' | 'deep_101' | 'both_151'
  const [priceTier, setPriceTier] = useState<PriceTier>('deep_101')

  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const formTopRef = useRef<HTMLDivElement>(null)

  // Pattern 5: beforeunload warning to prevent data loss
  useEffect(() => {
    const hasData = fields.bride.name || fields.groom.name || fields.bride.dob || fields.groom.dob
    if (!hasData) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'You have unsaved Kundali Milan data. Are you sure you want to leave?'
      return e.returnValue
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [fields])

  // Pre-load Razorpay script when reaching Step 3
  useEffect(() => {
    if (currentStep === 3) loadRazorpayScript()
  }, [currentStep])

  // Helpers
  const updateBride = useCallback((updates: Partial<PersonData>) => {
    setFields(prev => ({ ...prev, bride: { ...prev.bride, ...updates } }))
    setErrors(prev => {
      const next = { ...prev }
      Object.keys(updates).forEach(k => delete next[`bride_${k}`])
      return next
    })
  }, [])

  const updateGroom = useCallback((updates: Partial<PersonData>) => {
    setFields(prev => ({ ...prev, groom: { ...prev.groom, ...updates } }))
    setErrors(prev => {
      const next = { ...prev }
      Object.keys(updates).forEach(k => delete next[`groom_${k}`])
      return next
    })
  }, [])

  const setField = <K extends keyof KundaliMilanFields>(key: K, value: KundaliMilanFields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key as string]: '' }))
  }

  // Validation
  const validatePerson = (person: PersonData, role: 'bride' | 'groom'): boolean => {
    const errs: Record<string, string> = {}
    if (!person.name.trim()) errs[`${role}_name`] = `${role === 'bride' ? 'Bride' : 'Groom'} name is required`
    if (!person.dob)         errs[`${role}_dob`]  = 'Date of birth is required'
    if (!person.unknownTime && !person.tob) errs[`${role}_tob`] = 'Time of birth is required'
    if (person.latitude === '') errs[`${role}_latitude`] = 'Place of birth is required'
    setErrors(prev => ({ ...prev, ...errs }))
    return Object.keys(errs).length === 0
  }

  const validateStep3 = (): boolean => {
    const errs: Record<string, string> = {}
    if (needsAudience && !fields.audience) errs.audience = 'Please select audience'
    if (!fields.contactName.trim()) errs.contactName = 'Name required for delivery'
    if (!fields.contactMobile || fields.contactMobile.replace(/\D/g, '').length < fields.contactCountryDigits) {
      errs.contactMobile = `Valid ${fields.contactCountryDigits}-digit mobile required`
    }
    setErrors(prev => ({ ...prev, ...errs }))
    return Object.keys(errs).length === 0
  }

  // Step navigation
  const goToStep = (step: StepNumber) => {
    setCurrentStep(step)
    setTimeout(() => {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleBrideContinue = () => {
    if (!validatePerson(fields.bride, 'bride')) return
    setCompletedSteps(prev => new Set(prev).add(1))
    goToStep(2)
  }

  const handleGroomContinue = () => {
    if (!validatePerson(fields.groom, 'groom')) return
    setCompletedSteps(prev => new Set(prev).add(2))
    goToStep(3)
  }

  const handleEditBride = () => goToStep(1)
  const handleEditGroom = () => goToStep(2)

  // Loading messages
  const startLoadingMessages = (steps: string[] = LOADING_STEPS_PAYMENT) => {
    setLoadingStep(0)
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStep(prev => prev < steps.length - 1 ? prev + 1 : prev)
    }, 12000)
  }

  const stopLoadingMessages = () => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
  }

  // Tier resolution (priceTier + audience -> internal MilanTier)
  const resolveTier = (audience: AudienceVersion, isFreePreview: boolean): MilanTier => {
    if (isFreePreview || priceTier === 'free') return 'free'
    if (priceTier === 'basic_51') return 'basic'
    if (priceTier === 'both_151') return 'deep_both'
    // deep_101 -> couple or parent based on audience
    if (audience === 'parent') return 'deep_parent'
    return 'deep_couple'
  }

  const resolvePrice = (_audience: AudienceVersion | ''): number => {
    if (priceTier === 'basic_51') return 51
    if (priceTier === 'both_151') return 151
    return 101
  }

  // Does the chosen price tier need an audience (couple/parent) choice?
  const needsAudience = priceTier === 'deep_101'

  // Build request body for API
  const buildMilanBody = (paymentVerification: any = null, isFree = false) => {
    // For basic_51/free: audience is cosmetic (couple default).
    // For both_151: force 'both'. For deep_101: use selected audience.
    const effectiveAudience: AudienceVersion =
      priceTier === 'both_151' ? 'both' :
      (fields.audience || 'couple') as AudienceVersion
    return {
      sessionId: `milan_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      tier: resolveTier(effectiveAudience, isFree),
      audienceVersion: effectiveAudience,
      paymentVerification,
      language: fields.language,
      bride: {
        name:     fields.bride.name,
        dob:      fields.bride.dob,
        tob:      fields.bride.unknownTime ? '12:00' : fields.bride.tob,
        lat:      fields.bride.latitude as number,
        lng:      fields.bride.longitude as number,
        cityName: fields.bride.city,
        timezone: fields.bride.timezoneOffset,
        ayanamsa: 'lahiri',
      },
      groom: {
        name:     fields.groom.name,
        dob:      fields.groom.dob,
        tob:      fields.groom.unknownTime ? '12:00' : fields.groom.tob,
        lat:      fields.groom.latitude as number,
        lng:      fields.groom.longitude as number,
        cityName: fields.groom.city,
        timezone: fields.groom.timezoneOffset,
        ayanamsa: 'lahiri',
      },
      contact: {
        name:   fields.contactName,
        mobile: `${fields.contactCountryCode}${fields.contactMobile}`,
        email:  fields.contactEmail || null,
      },
    }
  }

  // Call /api/calc/kundali-milan
  const callMilanAPI = async (paymentVerification: any = null, isFree = false) => {
    try {
      const res = await fetch('/api/calc/kundali-milan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildMilanBody(paymentVerification, isFree)),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error || 'Something went wrong.')
        stopLoadingMessages()
        return
      }

      const milanId = data?.milanId ?? data?._meta?.milanId
      if (milanId) {
        router.push(`/milan/${milanId}`)
      } else {
        setApiError('Milan report ready hai par save nahi hua. Please retry karo.')
        stopLoadingMessages()
      }
    } catch {
      setApiError('Network error. Please check your connection.')
      stopLoadingMessages()
    }
  }

  // Free Preview Submit (no payment)
  const handleFreePreview = async () => {
    setApiError(null)
    setIsSubmitting(true)
    startLoadingMessages(LOADING_STEPS_FREE)
    await callMilanAPI(null, true)
    setIsSubmitting(false)
  }

  // Razorpay Payment Flow
  const handlePaymentSubmit = async () => {
    if (!validateStep3()) return
    setApiError(null)
    setPaymentLoading(true)

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setApiError('Razorpay payment SDK failed to load. Please check your internet connection.')
        setPaymentLoading(false)
        return
      }

      const amount = resolvePrice(fields.audience)
      const audience = fields.audience as AudienceVersion

      // Create order - send FULL birth data so verify-payment can compute (v1.1 fix)
      const orderRes = await fetch('/api/create-milan-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...buildMilanBody(null, false),
          tier:   resolveTier(audience, false),
          amount,
          audience,
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        setApiError(err.error || 'Could not create payment order. Please try again.')
        setPaymentLoading(false)
        return
      }
      const { orderId, currency, keyId } = await orderRes.json()

      // Open Razorpay
      openRazorpayCheckout({
        keyId,
        orderId,
        amount: amount * 100,
        currency,
        name: 'Trikaal Vaani',
        description: `Kundali Milan - ${audience === 'couple' ? 'Couple Version' : audience === 'parent' ? 'Parent Version' : 'Both Versions'}`,
        prefillName: fields.contactName,
        prefillContact: `${fields.contactCountryCode}${fields.contactMobile}`.replace(/\s/g, ''),
        themeColor: '#D4AF37',
        onSuccess: async (response) => {
          setIsSubmitting(true)
          startLoadingMessages(LOADING_STEPS_PAYMENT)

          const verifyRes = await fetch('/api/verify-milan-payment', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(response),
          })
          const verifyData = await verifyRes.json().catch(() => ({}))

          if (!verifyRes.ok) {
            setApiError(verifyData.error || 'Payment verification failed. Please contact support.')
            setIsSubmitting(false)
            setPaymentLoading(false)
            return
          }

          // Use the PAID slug from verify-payment - do NOT call the free route
          const paidSlug = verifyData.slug ?? verifyData.milanId
          if (paidSlug) {
            router.push(`/milan/${paidSlug}`)
          } else {
            setApiError('Payment done but report link missing. WhatsApp +919211804111 with your payment ID.')
            setIsSubmitting(false)
            setPaymentLoading(false)
          }
        },
        onDismiss: () => {
          setPaymentLoading(false)
          setApiError(null)
        },
      })
    } catch (err: any) {
      setApiError(err.message || 'Payment flow error.')
      setPaymentLoading(false)
    }
  }

  const isLoading = isSubmitting || paymentLoading

  const getSubmitLabel = () => {
    if (paymentLoading) return 'Razorpay popup khul raha hai...'
    if (isLoading) return LOADING_STEPS_PAYMENT[loadingStep] || 'Processing...'
    if (priceTier === 'free')     return 'Get Free Preview'
    if (priceTier === 'basic_51') return 'Pay Rs51 with Razorpay - Basic Milan'
    if (priceTier === 'both_151') return 'Pay Rs151 with Razorpay - Both Versions'
    // deep_101
    if (fields.audience === 'couple') return 'Pay Rs101 with Razorpay - Couple Version'
    if (fields.audience === 'parent') return 'Pay Rs101 with Razorpay - Parent Version'
    return 'Select Couple or Parent above'
  }

  // RENDER
  return (
    <section
      id="kundali-milan-form"
      ref={formTopRef}
      className="py-12 px-4"
      aria-label="Kundali Milan Vedic Compatibility Form by Rohiit Gupta"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(MILAN_SERVICE_SCHEMA) }}
      />

      <div className="max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(to right, transparent, ${GOLD_RGBA(0.3)})` }} />
            <span style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              🔱 Mahakaal Ka Ashirwad
            </span>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(to left, transparent, ${GOLD_RGBA(0.3)})` }} />
          </div>
          <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold mb-2">
            Kundali Milan - Vedic Compatibility
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            36 Guna Ashtakoot . Mangal, Nadi, Bhakoot Dosh . Personalized remedies by Rohiit Gupta, Chief Vedic Architect.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {TRUST_BADGES.map(b => (
              <span key={b.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '20px',
                fontSize: '10px', fontWeight: 600,
                background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}`, color: GOLD,
              }}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>

          <ProgressBar
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />

          {/* STEP 1 OR EDIT - BRIDE */}
          {completedSteps.has(1) && currentStep !== 1 && (
            <SummaryCard
              title="Bride Details"
              icon="🌸"
              person={fields.bride}
              onEdit={handleEditBride}
              accentColor={ROSE}
            />
          )}

          {currentStep === 1 && (
            <PersonForm
              person={fields.bride}
              role="bride"
              accentColor={ROSE}
              onChange={updateBride}
              errors={{
                name: errors.bride_name, dob: errors.bride_dob,
                tob: errors.bride_tob, latitude: errors.bride_latitude,
              } as any}
              onContinue={handleBrideContinue}
              continueLabel={completedSteps.has(1) ? 'Update Bride Details' : 'Continue to Groom'}
            />
          )}

          {/* STEP 2 OR EDIT - GROOM */}
          {completedSteps.has(2) && currentStep !== 2 && (
            <SummaryCard
              title="Groom Details"
              icon="🤵"
              person={fields.groom}
              onEdit={handleEditGroom}
              accentColor={BLUE}
            />
          )}

          {currentStep === 2 && (
            <PersonForm
              person={fields.groom}
              role="groom"
              accentColor={BLUE}
              onChange={updateGroom}
              errors={{
                name: errors.groom_name, dob: errors.groom_dob,
                tob: errors.groom_tob, latitude: errors.groom_latitude,
              } as any}
              onContinue={handleGroomContinue}
              continueLabel={completedSteps.has(2) ? 'Update Groom Details' : 'Continue to Report Style'}
            />
          )}

          {/* STEP 3 - TIER + AUDIENCE + CONTACT + PAYMENT */}
          {currentStep === 3 && (
            <div className="grid gap-5">

              {/* v1.2: PRICE TIER PICKER (Free / Rs51 / Rs101 / Rs151) */}
              <div>
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <p style={{ color: GOLD, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                    Choose Your Tier
                  </p>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif' }}>
                    Aapko kaunsa Milan chahiye?
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'free',     label: 'Free Preview', price: 'Rs0',   desc: 'Score + dosha flags' },
                    { key: 'basic_51', label: 'Basic Milan',  price: 'Rs51',  desc: 'Full 36 Guna + PDF' },
                    { key: 'deep_101', label: 'Deep Milan',   price: 'Rs101', desc: 'Couple / Parent + remedies' },
                    { key: 'both_151', label: 'Both Versions',price: 'Rs151', desc: 'Couple + Parent, one PDF' },
                  ] as { key: PriceTier; label: string; price: string; desc: string }[]).map(t => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => { setPriceTier(t.key); setApiError(null) }}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: priceTier === t.key ? GOLD_RGBA(0.15) : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${priceTier === t.key ? GOLD : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px' }}>
                        <span style={{ color: priceTier === t.key ? GOLD : '#e2e8f0', fontWeight: 700, fontSize: '13px' }}>
                          {t.label}
                        </span>
                        <span style={{ color: GOLD, fontWeight: 800, fontSize: '16px', fontFamily: 'Georgia, serif' }}>
                          {t.price}
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '11px', margin: '4px 0 0' }}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience selector ONLY for Deep Rs101 (couple vs parent) */}
              {needsAudience && (
                <>
                  <AudienceSelector
                    selected={fields.audience}
                    onChange={(a) => setField('audience', a)}
                  />
                  {errors.audience && (
                    <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', margin: 0 }}>
                      {errors.audience}
                    </p>
                  )}
                </>
              )}

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prediction Language / भाषा चुनें
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGE_OPTIONS.map(opt => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setField('language', opt.value as any)}
                      className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                      style={{
                        background: fields.language === opt.value ? GOLD_RGBA(0.2) : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${fields.language === opt.value ? GOLD_RGBA(0.6) : 'rgba(255,255,255,0.1)'}`,
                        color: fields.language === opt.value ? GOLD : '#94a3b8',
                      }}
                    >
                      <div className="text-lg mb-0.5">{opt.flag}</div>
                      <div>{opt.label}</div>
                      <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Your Name <span style={{ color: GOLD }}>*</span>
                  <span className="text-slate-500 text-xs ml-2">(for PDF delivery)</span>
                </label>
                <input
                  id="contact-name" type="text"
                  placeholder="Enter your name"
                  value={fields.contactName}
                  onChange={e => setField('contactName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: '#0d1120',
                    border: `1px solid ${errors.contactName ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                    color: '#e2e8f0',
                  }}
                />
                {errors.contactName && <p className="text-red-400 text-xs mt-1">{errors.contactName}</p>}
              </div>

              {/* Contact Mobile */}
              <div>
                <label htmlFor="contact-mobile" className="block text-sm font-medium text-slate-300 mb-1.5">
                  WhatsApp Mobile <span style={{ color: GOLD }}>*</span>
                  <span className="text-slate-500 text-xs ml-2">(PDF delivered here)</span>
                </label>
                <div className="flex gap-2">
                  <CountrySelector
                    id="contact-country"
                    value={fields.contactCountryCode}
                    onChange={(dial, digits) => setFields(prev => ({
                      ...prev, contactCountryCode: dial, contactCountryDigits: digits,
                    }))}
                  />
                  <input
                    id="contact-mobile" type="tel"
                    placeholder={`${fields.contactCountryDigits}-digit mobile`}
                    value={fields.contactMobile}
                    onChange={e => setField('contactMobile', e.target.value)}
                    maxLength={fields.contactCountryDigits + 2}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      background: '#0d1120',
                      border: `1px solid ${errors.contactMobile ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                      color: '#e2e8f0',
                    }}
                  />
                </div>
                {errors.contactMobile && <p className="text-red-400 text-xs mt-1">{errors.contactMobile}</p>}
              </div>

              {/* Contact Email (optional) */}
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email <span className="text-slate-500 text-xs ml-2">(optional - also gets PDF)</span>
                </label>
                <input
                  id="contact-email" type="email"
                  placeholder="your@email.com"
                  value={fields.contactEmail}
                  onChange={e => setField('contactEmail', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    background: '#0d1120',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                  }}
                />
              </div>

              {/* Razorpay Trust Strip - show for any PAID tier */}
              {priceTier !== 'free' && (
                <div
                  role="region"
                  aria-label="Razorpay payment security trust signals"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexWrap: 'wrap', gap: '10px',
                    padding: '10px 12px',
                    background: 'rgba(51,149,255,0.06)',
                    border: '1px solid rgba(51,149,255,0.18)',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🔒
                    <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: '10px' }}>Secured by</span>
                    <span style={{ color: RAZORPAY_BLUE, fontWeight: 700, fontSize: '11px', fontFamily: 'Georgia, serif' }}>Razorpay</span>
                  </span>
                  <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['UPI', 'Cards', 'NetBanking', 'Wallets'].map(m => (
                      <span key={m} style={{
                        fontSize: '9px', fontWeight: 600, color: '#64748B',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '3px', padding: '2px 6px', letterSpacing: '0.04em',
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 500 }}>
                    PCI-DSS . 256-bit SSL
                  </span>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="px-4 py-4 rounded-xl text-center"
                  style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="animate-spin text-base">🔱</span>
                    <span className="text-sm font-medium" style={{ color: GOLD }}>{getSubmitLabel()}</span>
                  </div>
                  <div className="flex justify-center gap-1.5">
                    {LOADING_STEPS_PAYMENT.map((_, i) => (
                      <div key={i} className="rounded-full transition-all duration-500"
                        style={{
                          width: i === loadingStep ? '20px' : '6px',
                          height: '6px',
                          background: i <= loadingStep ? GOLD : GOLD_RGBA(0.2),
                        }} />
                    ))}
                  </div>
                </div>
              )}

              {/* API Error */}
              {apiError && (
                <div className="px-4 py-3 rounded-lg text-sm text-red-300"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {apiError}
                </div>
              )}

              {/* Submit Button - routes by tier (free -> preview, paid -> Razorpay) */}
              <button
                type="button"
                disabled={isLoading || (needsAudience && !fields.audience)}
                onClick={priceTier === 'free' ? handleFreePreview : handlePaymentSubmit}
                aria-label={getSubmitLabel()}
                className="w-full py-4 rounded-xl text-sm font-bold transition-all duration-300"
                style={{
                  background: isLoading || (needsAudience && !fields.audience)
                    ? GOLD_RGBA(0.3)
                    : `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`,
                  color: isLoading || (needsAudience && !fields.audience) ? 'rgba(255,255,255,0.5)' : '#080B12',
                  cursor: isLoading || (needsAudience && !fields.audience) ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  boxShadow: isLoading || (needsAudience && !fields.audience) ? 'none' : `0 0 30px rgba(212,175,55,0.4)`,
                }}
              >
                {getSubmitLabel()}
              </button>

              {/* Contextual note under button */}
              <div style={{ textAlign: 'center' }}>
                {priceTier === 'free' ? (
                  <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>
                    Free Preview reveals 36 Guna score + dosha flags only. Upgrade anytime.
                  </p>
                ) : (
                  <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>
                    Want to try first? Pick Free Preview above - no payment needed.
                  </p>
                )}
              </div>

              {/* No Refund Disclosure - IR-18 */}
              <div style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                textAlign: 'center',
              }}>
                <p style={{ color: '#64748b', fontSize: '10px', margin: 0, lineHeight: 1.5 }}>
                  <strong style={{ color: '#94a3b8' }}>No Refund Policy</strong> - This is a final-sale digital product.
                  Once payment is confirmed, the report cannot be refunded.
                  PDF delivery within 60 seconds via WhatsApp + Email.
                </p>
              </div>

              <p className="text-center text-xs text-slate-600">
                Your data is private and secure. Never shared. PCI-DSS compliant payments.
              </p>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ color: '#334155', fontSize: '11px', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 12px' }}>
              Powered by <strong style={{ color: '#475569' }}>Swiss Ephemeris</strong>.
              Computed against <strong style={{ color: '#475569' }}>BPHS</strong> classical Ashtakoot rules and{' '}
              <strong style={{ color: '#475569' }}>Bhrigu Nandi Nadi</strong> patterns.
              Payments secured by <strong style={{ color: RAZORPAY_BLUE }}>Razorpay</strong>.
            </p>
            <p style={{ color: '#1e293b', fontSize: '10px', margin: 0 }}>
              By Rohiit Gupta, Chief Vedic Architect . trikalvaani.com . 🔱 Mahakaal Ka Ashirwad
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// END KundaliMilanForm v1.2 - LOCKED PER IR-13
