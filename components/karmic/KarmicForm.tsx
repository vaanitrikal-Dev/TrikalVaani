// TRIKAL VAANI - KarmicForm Component
// CEO & Chief Vedic Architect: Rohiit Gupta
// File: components/karmic/KarmicForm.tsx
// VERSION: 1.1 — Brand/persona display flip (Trikaal). Logic unchanged.
// Single-person form for Karmic Background Reading (Rs251).
// Flow: birth details -> FREE teaser (Lagna/Moon + hook) -> Rs251 Razorpay -> /karmic/[slug]
// Reuses BirthForm/KundaliMilanForm patterns: CountrySelector, CityInput (maps-proxy), Razorpay.

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay-helper"

// -- Types -------------------------------------------------------------------

type Language = "hinglish" | "hindi" | "english"
type Phase = "form" | "preview" | "paying"

interface PersonData {
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

interface KarmicFields {
  person:               PersonData
  contactName:          string
  contactMobile:        string
  contactCountryCode:   string
  contactCountryDigits: number
  contactEmail:         string
  language:             Language
}

interface PlaceSuggestion {
  place_id:       string
  description:    string
  main_text:      string
  secondary_text: string
}

interface Country { name: string; code: string; dial: string; digits: number; flag: string }

interface PreviewData {
  name:           string | null
  lagna_sign:     string | null
  lagna_sign_en:  string | null
  moon_sign:      string | null
  moon_nakshatra: string | null
}

// -- Countries (subset reused from BirthForm v9.2) ---------------------------

const COUNTRIES: Country[] = [
  { name: 'India',          code: 'IN', dial: '+91',  digits: 10, flag: '🇮🇳' },
  { name: 'USA',            code: 'US', dial: '+1',   digits: 10, flag: '🇺🇸' },
  { name: 'UK',             code: 'GB', dial: '+44',  digits: 10, flag: '🇬🇧' },
  { name: 'UAE / Dubai',    code: 'AE', dial: '+971', digits: 9,  flag: '🇦🇪' },
  { name: 'Canada',         code: 'CA', dial: '+1',   digits: 10, flag: '🇨🇦' },
  { name: 'Australia',      code: 'AU', dial: '+61',  digits: 9,  flag: '🇦🇺' },
  { name: 'Singapore',      code: 'SG', dial: '+65',  digits: 8,  flag: '🇸🇬' },
  { name: 'Nepal',          code: 'NP', dial: '+977', digits: 10, flag: '🇳🇵' },
  { name: 'Saudi Arabia',   code: 'SA', dial: '+966', digits: 9,  flag: '🇸🇦' },
  { name: 'Germany',        code: 'DE', dial: '+49',  digits: 10, flag: '🇩🇪' },
  { name: 'Australia2',     code: 'NZ', dial: '+64',  digits: 9,  flag: '🇳🇿' },
]

// -- Maps proxy helpers (identical pattern to BirthForm v9.2) ----------------

async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return []
  try {
    const res = await fetch(
      `/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: query,
          includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
          languageCode: 'en',
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
        main_text:      s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text ?? '',
        secondary_text: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
      }))
  } catch { return [] }
}

async function fetchPlaceDetails(placeId: string): Promise<{ lat: number; lng: number; city: string } | null> {
  if (!placeId) return null
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=location,displayName`
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`)
    if (!res.ok) return null
    const data = await res.json()
    const lat = data.location?.latitude ?? null
    const lng = data.location?.longitude ?? null
    const city = data.displayName?.text ?? ''
    if (lat === null || lng === null) return null
    return { lat, lng, city }
  } catch { return null }
}

async function fetchTimezone(lat: number, lng: number): Promise<number> {
  try {
    const ts = Math.floor(Date.now() / 1000)
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}`
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`)
    if (!res.ok) return 5.5
    const data = await res.json()
    if (data.status !== 'OK') return 5.5
    return Math.round(((data.rawOffset + data.dstOffset) / 3600) * 4) / 4
  } catch { return 5.5 }
}

// -- Constants ---------------------------------------------------------------

const GOLD = '#D4AF37'
const GREEN = '#22C55E'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

const LANGUAGE_OPTIONS = [
  { value: 'hinglish', label: 'Hinglish', flag: '🇮🇳', desc: 'Hindi + English' },
  { value: 'hindi',    label: 'हिंदी',    flag: '🕉️',  desc: 'Pure Hindi' },
  { value: 'english',  label: 'English',  flag: '🌐',  desc: 'English' },
]

const INITIAL_PERSON: PersonData = {
  name: '', dob: '', tob: '12:00', unknownTime: false,
  placeQuery: '', city: '', latitude: '', longitude: '', timezoneOffset: 5.5,
}

const INITIAL: KarmicFields = {
  person: { ...INITIAL_PERSON },
  contactName: '', contactMobile: '', contactCountryCode: '+91', contactCountryDigits: 10,
  contactEmail: '', language: 'hinglish',
}

// -- Country selector --------------------------------------------------------

function CountrySelector({ value, onChange }: { value: string; onChange: (dial: string, digits: number) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = COUNTRIES.find(c => c.dial === value) ?? COUNTRIES[0]!

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="px-3 py-2.5 rounded-lg text-sm flex items-center gap-1.5 whitespace-nowrap"
        style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', minWidth: '80px' }}>
        <span style={{ fontSize: '1.1rem' }}>{selected.flag}</span>
        <span>{selected.dial}</span>
        <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '2px' }}>▾</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 rounded-lg overflow-hidden shadow-2xl"
          style={{ background: '#0d1120', border: '1px solid rgba(212,175,55,0.25)', width: '220px', maxHeight: '260px', overflowY: 'auto' }}>
          {COUNTRIES.map(c => (
            <button key={c.code} type="button"
              onClick={() => { onChange(c.dial, c.digits); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm"
              style={{ color: c.dial === value ? GOLD : '#cbd5e1', background: c.dial === value ? GOLD_RGBA(0.08) : 'transparent' }}>
              <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
              <span className="flex-1">{c.name}</span>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{c.dial}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// -- City input --------------------------------------------------------------

function CityInput({
  value, onSelect, error,
}: { value: string; onSelect: (city: string, lat: number, lng: number, tz: number) => void; error?: string }) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setQuery(value); if (value) setSelected(true) }, [value])

  const handleChange = (val: string) => {
    setQuery(val); setSelected(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 3) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setSuggestions(await fetchPlaceSuggestions(val))
      setLoading(false)
    }, 400)
  }

  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.main_text); setSuggestions([]); setSelected(true); setLoading(true)
    const details = await fetchPlaceDetails(s.place_id)
    if (details) {
      const tz = await fetchTimezone(details.lat, details.lng)
      onSelect(details.city || s.main_text, details.lat, details.lng, tz)
    }
    setLoading(false)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        Place of Birth <span style={{ color: GOLD }}>*</span>
      </label>
      <div className="relative">
        <input type="search" autoComplete="off" placeholder="Type birth city..."
          value={query} onChange={e => handleChange(e.target.value)}
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
            <li key={i} onClick={() => handleSelect(s)} className="px-4 py-3 text-sm cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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

// -- Main component ----------------------------------------------------------

export default function KarmicForm() {
  const router = useRouter()
  const [fields, setFields] = useState<KarmicFields>(INITIAL)
  const [phase, setPhase] = useState<Phase>("form")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [previewHook, setPreviewHook] = useState<string>("")

  useEffect(() => { loadRazorpayScript() }, [])

  const updatePerson = useCallback((updates: Partial<PersonData>) => {
    setFields(prev => ({ ...prev, person: { ...prev.person, ...updates } }))
    setErrors(prev => { const n = { ...prev }; Object.keys(updates).forEach(k => delete n[k]); return n })
  }, [])

  const setField = <K extends keyof KarmicFields>(key: K, value: KarmicFields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key as string]: '' }))
  }

  const validatePerson = (): boolean => {
    const p = fields.person
    const errs: Record<string, string> = {}
    if (!p.name.trim()) errs.name = 'Name required'
    if (!p.dob) errs.dob = 'Date of birth required'
    if (!p.unknownTime && !p.tob) errs.tob = 'Time of birth required'
    if (p.latitude === '') errs.latitude = 'Place of birth required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateContact = (): boolean => {
    const errs: Record<string, string> = {}
    if (!fields.contactName.trim()) errs.contactName = 'Name required for delivery'
    if (!fields.contactMobile || fields.contactMobile.replace(/\D/g, '').length < fields.contactCountryDigits) {
      errs.contactMobile = `Valid ${fields.contactCountryDigits}-digit mobile required`
    }
    setErrors(prev => ({ ...prev, ...errs }))
    return Object.keys(errs).length === 0
  }

  const buildPersonBody = () => {
    const p = fields.person
    return {
      name:     p.name,
      dob:      p.dob,
      tob:      p.unknownTime ? '12:00' : p.tob,
      lat:      p.latitude as number,
      lng:      p.longitude as number,
      cityName: p.city,
      timezone: p.timezoneOffset,
    }
  }

  // STEP 1: free teaser
  const handlePreview = async () => {
    setApiError(null)
    if (!validatePerson()) return
    setPreviewLoading(true)
    try {
      const res = await fetch('/api/karmic-preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPersonBody()),
      })
      const data = await res.json()
      if (!res.ok) { setApiError(data.error || 'Could not generate preview.'); setPreviewLoading(false); return }
      setPreview(data.preview ?? null)
      setPreviewHook(data.hook ?? '')
      setPhase("preview")
    } catch {
      setApiError('Network error. Please try again.')
    }
    setPreviewLoading(false)
  }

  // STEP 2: Rs251 payment
  const handlePayment = async () => {
    setApiError(null)
    if (!validateContact()) return
    setPhase("paying")
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) { setApiError('Razorpay SDK failed to load. Check your connection.'); setPhase("preview"); return }

      const orderRes = await fetch('/api/create-karmic-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person:   buildPersonBody(),
          language: fields.language,
          contact:  {
            name:   fields.contactName,
            mobile: `${fields.contactCountryCode}${fields.contactMobile}`,
            email:  fields.contactEmail || null,
          },
        }),
      })
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        setApiError(err.error || 'Could not create payment order.'); setPhase("preview"); return
      }
      const { orderId, currency, keyId, amount } = await orderRes.json()

      openRazorpayCheckout({
        keyId, orderId,
        amount: (amount ?? 25100),
        currency: currency ?? 'INR',
        name: 'Trikaal Vaani',
        description: 'Karmic Background Reading',
        prefillName: fields.contactName,
        prefillContact: `${fields.contactCountryCode}${fields.contactMobile}`.replace(/\s/g, ''),
        themeColor: '#D4AF37',
        onSuccess: async (response) => {
          const verifyRes = await fetch('/api/verify-karmic-payment', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          const verifyData = await verifyRes.json().catch(() => ({}))
          if (!verifyRes.ok) {
            setApiError(verifyData.error || 'Payment verification failed. Contact support.'); setPhase("preview"); return
          }
          const slug = verifyData.slug
          if (slug) { router.push(`/karmic/${slug}`) }
          else { setApiError('Payment done but link missing. WhatsApp +919211804111 with your payment ID.'); setPhase("preview") }
        },
        onDismiss: () => { setPhase("preview"); setApiError(null) },
      })
    } catch (err: any) {
      setApiError(err.message || 'Payment flow error.'); setPhase("preview")
    }
  }

  const p = fields.person

  return (
    <section id="karmic-form" className="py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>

          {/* STEP 1 — birth details */}
          {phase === "form" && (
            <div className="grid gap-4">
              <div className="text-center mb-2">
                <h3 className="text-white text-xl font-serif font-bold">Karmic Background Reading</h3>
                <p className="text-slate-400 text-sm mt-1">Bhrigu Nandi Nadi · 6 Karmic Dimensions · ₹251</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span style={{ color: GOLD }}>*</span></label>
                <input type="text" placeholder="Person's full name" value={p.name}
                  onChange={e => updatePerson({ name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: '#0d1120', border: `1px solid ${errors.name ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0' }} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span style={{ color: GOLD }}>*</span></label>
                <input type="date" value={p.dob} onChange={e => updatePerson({ dob: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: '#0d1120', border: `1px solid ${errors.dob ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
                {errors.dob && <p className="text-red-400 text-xs mt-1">{errors.dob}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-300">Time of Birth {!p.unknownTime && <span style={{ color: GOLD }}>*</span>}</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                    <input type="checkbox" checked={p.unknownTime} onChange={e => updatePerson({ unknownTime: e.target.checked })} />
                    Unknown time
                  </label>
                </div>
                <input type="time" value={p.tob} onChange={e => updatePerson({ tob: e.target.value })} disabled={p.unknownTime}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: '#0d1120', border: `1px solid ${errors.tob ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark', opacity: p.unknownTime ? 0.4 : 1 }} />
                {p.unknownTime && <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon)</p>}
              </div>

              <CityInput value={p.placeQuery}
                error={errors.latitude ? 'Please select a city from suggestions' : undefined}
                onSelect={(city, lat, lng, tz) => updatePerson({ placeQuery: city, city, latitude: lat, longitude: lng, timezoneOffset: tz })} />

              {apiError && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{apiError}</div>}

              <button type="button" onClick={handlePreview} disabled={previewLoading}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: previewLoading ? GOLD_RGBA(0.3) : `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                {previewLoading ? 'Trikaal aapki kundali padh raha hai...' : 'Free Jhalak Dekhein →'}
              </button>
              <p className="text-center text-[10px] text-slate-500">Free glimpse — no payment needed to see your Lagna &amp; Moon sign.</p>
            </div>
          )}

          {/* STEP 2 — preview teaser + payment */}
          {(phase === "preview" || phase === "paying") && (
            <div className="grid gap-5">
              <div className="text-center">
                <div className="text-3xl mb-2">🔱</div>
                <h3 className="text-white text-xl font-serif font-bold">
                  {preview?.name ? `${preview.name} ki ` : ''}Karmic Jhalak
                </h3>
              </div>

              {/* Free signs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-4 text-center" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Lagna (Ascendant)</div>
                  <div className="text-lg font-bold" style={{ color: GOLD }}>{preview?.lagna_sign ?? '—'}</div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Moon (Chandra)</div>
                  <div className="text-lg font-bold" style={{ color: GOLD }}>{preview?.moon_sign ?? '—'}</div>
                  {preview?.moon_nakshatra && <div className="text-[10px] text-slate-500 mt-1">{preview.moon_nakshatra}</div>}
                </div>
              </div>

              {/* Suspense hook */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <p className="text-sm text-gray-300 leading-relaxed text-center">{previewHook}</p>
              </div>

              {/* What unlocks */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['🪔 Core Personality','💗 Fidelity & Conduct','🪙 Financial Behaviour','🏠 Family & Respect','🌑 Hidden Tendencies','🔱 Marriage Outlook'].map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', color: '#cbd5e1' }}>
                    <span>🔒</span>{d}
                  </div>
                ))}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Reading Language / भाषा</label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGE_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setField('language', opt.value as Language)}
                      className="py-2.5 px-3 rounded-lg text-sm font-medium text-center"
                      style={{ background: fields.language === opt.value ? GOLD_RGBA(0.2) : 'rgba(255,255,255,0.04)', border: `1px solid ${fields.language === opt.value ? GOLD_RGBA(0.6) : 'rgba(255,255,255,0.1)'}`, color: fields.language === opt.value ? GOLD : '#94a3b8' }}>
                      <div className="text-lg mb-0.5">{opt.flag}</div>
                      <div>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name <span style={{ color: GOLD }}>*</span> <span className="text-slate-500 text-xs ml-1">(for PDF delivery)</span></label>
                <input type="text" placeholder="Your name" value={fields.contactName}
                  onChange={e => setField('contactName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: '#0d1120', border: `1px solid ${errors.contactName ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0' }} />
                {errors.contactName && <p className="text-red-400 text-xs mt-1">{errors.contactName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">WhatsApp Mobile <span style={{ color: GOLD }}>*</span></label>
                <div className="flex gap-2">
                  <CountrySelector value={fields.contactCountryCode}
                    onChange={(dial, digits) => setFields(prev => ({ ...prev, contactCountryCode: dial, contactCountryDigits: digits }))} />
                  <input type="tel" placeholder={`${fields.contactCountryDigits}-digit mobile`} value={fields.contactMobile}
                    onChange={e => setField('contactMobile', e.target.value)} maxLength={fields.contactCountryDigits + 2}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: '#0d1120', border: `1px solid ${errors.contactMobile ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0' }} />
                </div>
                {errors.contactMobile && <p className="text-red-400 text-xs mt-1">{errors.contactMobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email <span className="text-slate-500 text-xs ml-1">(optional)</span></label>
                <input type="email" placeholder="your@email.com" value={fields.contactEmail}
                  onChange={e => setField('contactEmail', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
              </div>

              {apiError && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{apiError}</div>}

              <button type="button" onClick={handlePayment} disabled={phase === "paying"}
                className="w-full py-4 rounded-xl text-sm font-bold transition-all"
                style={{ background: phase === "paying" ? GOLD_RGBA(0.3) : `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`, color: '#080B12', fontSize: '15px', boxShadow: phase === "paying" ? 'none' : '0 0 30px rgba(212,175,55,0.4)' }}>
                {phase === "paying" ? 'Razorpay khul raha hai...' : 'Poori Reading Kholiye — ₹251 →'}
              </button>

              <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', fontSize: '10px', margin: 0, lineHeight: 1.5 }}>
                  <strong style={{ color: '#94a3b8' }}>No Refund Policy</strong> — final-sale digital product.
                  PDF delivered within 60 seconds via WhatsApp + Email.
                </p>
              </div>

              <p className="text-center text-[10px] text-slate-600 leading-relaxed">
                Trikaal reveals karmic patterns from the birth chart for self-understanding — never a judgement on any person.
              </p>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
