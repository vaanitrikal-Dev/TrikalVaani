/**
 * ============================================================
 * TRIKAL VAANI — BirthForm Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/landing/BirthForm.tsx
 * VERSION: 5.0 — Clean merge: Language + Job + Mobile + Dual + Redirect fix
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FEATURES:
 *   - Language selector (Hindi / Hinglish / English)
 *   - Job category dropdown (LinkedIn-style)
 *   - Mobile number field (WhatsApp + Numerology)
 *   - Dual chart support (genz_ex_back, genz_toxic_boss)
 *   - Numerology compatibility (mobile numbers)
 *   - Redirects to /result/[predictionId] after success ← KEY FIX
 *   - Proper tv_ sessionId generation
 *   - Status messages during calculation
 * ============================================================
 */

"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BirthFormFields {
  name:           string
  dateOfBirth:    string
  timeOfBirth:    string
  unknownTime:    boolean
  gender:         "male" | "female" | "other" | ""
  placeQuery:     string
  city:           string
  latitude:       number | ""
  longitude:      number | ""
  timezoneOffset: number
  ayanamsa:       "lahiri"
  language:       "hindi" | "hinglish" | "english"
  jobCategory:    string
  mobile:         string
  // Person 2 (dual chart domains)
  person2Name:    string
  person2Mobile:  string
  person2Dob:     string
  person2Tob:     string
  person2Place:   string
  person2City:    string
  person2Lat:     number | ""
  person2Lng:     number | ""
}

interface SelectedCategory {
  id:      string
  label:   string
  color:   string
  isDual?: boolean
}

interface BirthFormProps {
  selectedCategory?: SelectedCategory | null
  onSubmit?:         (fields: BirthFormFields) => void | Promise<void>
  loading?:          boolean
  submitLabel?:      string
  className?:        string
}

interface GeoResult {
  display_name: string
  lat:          string
  lon:          string
  address?: {
    city?:    string
    town?:    string
    village?: string
    state?:   string
    country?: string
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DUAL_CHART_DOMAINS = ['genz_ex_back', 'genz_toxic_boss']

const JOB_CATEGORIES = [
  { value: '',                 label: 'Select your profession' },
  { value: 'student',          label: '🎓 Student' },
  { value: 'fresher',          label: '🌱 Fresher / Job Seeker' },
  { value: 'salaried_it',      label: '💻 Salaried — IT / Tech' },
  { value: 'salaried_finance', label: '🏦 Salaried — Finance / Banking' },
  { value: 'salaried_healthcare', label: '🏥 Salaried — Healthcare / Medical' },
  { value: 'salaried_govt',    label: '🏛️ Salaried — Government / PSU' },
  { value: 'salaried_education', label: '📚 Salaried — Education / Teaching' },
  { value: 'salaried_legal',   label: '⚖️ Salaried — Legal / Law' },
  { value: 'salaried_media',   label: '🎬 Salaried — Media / Creative' },
  { value: 'salaried_other',   label: '💼 Salaried — Other' },
  { value: 'self_employed',    label: '🚀 Self-Employed / Freelancer' },
  { value: 'business_owner',   label: '🏢 Business Owner' },
  { value: 'startup_founder',  label: '⚡ Startup Founder' },
  { value: 'real_estate',      label: '🏠 Real Estate Professional' },
  { value: 'trader_investor',  label: '📈 Trader / Investor' },
  { value: 'homemaker',        label: '🏡 Homemaker' },
  { value: 'retired',          label: '🌅 Retired' },
  { value: 'nri',              label: '✈️ NRI / Working Abroad' },
]

const LANGUAGE_OPTIONS = [
  { value: 'hinglish', label: 'Hinglish', flag: '🇮🇳', desc: 'Hindi + English mix' },
  { value: 'hindi',    label: 'हिंदी',    flag: '🕉️',  desc: 'Pure Hindi' },
  { value: 'english',  label: 'English',  flag: '🌐',  desc: 'English' },
]

const GOLD      = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

// ── Numerology Helpers ────────────────────────────────────────────────────────

function getMobileNumber(mobile: string): number {
  const digits = mobile.replace(/\D/g, '')
  let sum = 0
  for (const d of digits) sum += parseInt(d)
  while (sum > 9 && sum !== 11 && sum !== 22) {
    let s = 0
    for (const d of String(sum)) s += parseInt(d)
    sum = s
  }
  return sum
}

function getNumerologyCompatibility(n1: number, n2: number) {
  const COMPAT: Record<string, { score: number; label: string; description: string; color: string }> = {
    '1-1': { score: 75, label: 'Strong',      description: 'Both are leaders — power couple but watch ego clashes.', color: '#22c55e' },
    '1-2': { score: 85, label: 'Excellent',   description: 'Leader + Nurturer — perfect balance of strength and care.', color: '#22c55e' },
    '1-3': { score: 80, label: 'Strong',      description: 'Ambition + Creativity — dynamic and inspiring together.', color: '#22c55e' },
    '1-4': { score: 60, label: 'Moderate',    description: 'Leader + Builder — good foundation but different speeds.', color: '#f59e0b' },
    '1-5': { score: 70, label: 'Good',        description: 'Independence meets adventure — exciting but unstable.', color: '#f59e0b' },
    '1-6': { score: 75, label: 'Strong',      description: 'Leader + Caregiver — strong family bond.', color: '#22c55e' },
    '1-7': { score: 55, label: 'Moderate',    description: 'Action vs introspection — needs understanding.', color: '#f59e0b' },
    '1-8': { score: 80, label: 'Strong',      description: 'Two powerhouses — great for business and life.', color: '#22c55e' },
    '1-9': { score: 85, label: 'Excellent',   description: 'Leader + Humanitarian — visionary together.', color: '#22c55e' },
    '2-2': { score: 80, label: 'Strong',      description: 'Deep emotional bond — very sensitive to each other.', color: '#22c55e' },
    '2-3': { score: 85, label: 'Excellent',   description: 'Sensitivity + Joy — beautiful and harmonious.', color: '#22c55e' },
    '2-4': { score: 75, label: 'Strong',      description: 'Nurturing + Stability — solid long-term bond.', color: '#22c55e' },
    '2-5': { score: 50, label: 'Challenging', description: 'Sensitivity vs freedom — needs compromise.', color: '#ef4444' },
    '2-6': { score: 90, label: 'Excellent',   description: 'Two nurturers — deeply caring and compatible.', color: '#22c55e' },
    '2-7': { score: 70, label: 'Good',        description: 'Emotion + Wisdom — spiritually connected.', color: '#f59e0b' },
    '2-8': { score: 60, label: 'Moderate',    description: 'Heart vs ambition — balance needed.', color: '#f59e0b' },
    '2-9': { score: 80, label: 'Strong',      description: 'Sensitivity + Compassion — deeply empathetic pair.', color: '#22c55e' },
    '3-3': { score: 85, label: 'Excellent',   description: 'Double creativity — joyful and expressive together.', color: '#22c55e' },
    '3-4': { score: 60, label: 'Moderate',    description: 'Fun vs structure — different approaches to life.', color: '#f59e0b' },
    '3-5': { score: 80, label: 'Strong',      description: 'Creativity + Adventure — exciting and energetic.', color: '#22c55e' },
    '3-6': { score: 85, label: 'Excellent',   description: 'Joy + Nurturing — warm and loving family.', color: '#22c55e' },
    '3-7': { score: 65, label: 'Moderate',    description: 'Social vs philosophical — interesting but different.', color: '#f59e0b' },
    '3-8': { score: 65, label: 'Moderate',    description: 'Creativity vs materialism — needs alignment.', color: '#f59e0b' },
    '3-9': { score: 90, label: 'Excellent',   description: 'Creativity + Wisdom — exceptionally compatible.', color: '#22c55e' },
    '4-4': { score: 70, label: 'Good',        description: 'Two builders — stable but can be rigid.', color: '#f59e0b' },
    '4-5': { score: 50, label: 'Challenging', description: 'Structure vs freedom — significant differences.', color: '#ef4444' },
    '4-6': { score: 80, label: 'Strong',      description: 'Builder + Caregiver — strong and stable home.', color: '#22c55e' },
    '4-7': { score: 75, label: 'Strong',      description: 'Practical + Spiritual — grounded wisdom.', color: '#22c55e' },
    '4-8': { score: 85, label: 'Excellent',   description: 'Builder + Achiever — powerfully successful together.', color: '#22c55e' },
    '4-9': { score: 55, label: 'Moderate',    description: 'Practical vs idealistic — need common ground.', color: '#f59e0b' },
    '5-5': { score: 65, label: 'Moderate',    description: 'Double freedom — exciting but commitment issues.', color: '#f59e0b' },
    '5-6': { score: 60, label: 'Moderate',    description: 'Freedom vs responsibility — needs balance.', color: '#f59e0b' },
    '5-7': { score: 75, label: 'Strong',      description: 'Adventure + Wisdom — intellectually stimulating.', color: '#22c55e' },
    '5-8': { score: 70, label: 'Good',        description: 'Freedom + Ambition — dynamic but needs direction.', color: '#f59e0b' },
    '5-9': { score: 75, label: 'Strong',      description: 'Adventure + Compassion — humanitarian travelers.', color: '#22c55e' },
    '6-6': { score: 85, label: 'Excellent',   description: 'Double nurturing — beautiful family energy.', color: '#22c55e' },
    '6-7': { score: 70, label: 'Good',        description: 'Care + Introspection — spiritually rich bond.', color: '#f59e0b' },
    '6-8': { score: 75, label: 'Strong',      description: 'Care + Achievement — successful family builders.', color: '#22c55e' },
    '6-9': { score: 90, label: 'Excellent',   description: 'Nurturing + Wisdom — one of the best combinations.', color: '#22c55e' },
    '7-7': { score: 75, label: 'Strong',      description: 'Two seekers — deeply spiritual and intellectual.', color: '#22c55e' },
    '7-8': { score: 60, label: 'Moderate',    description: 'Spiritual vs material — different life goals.', color: '#f59e0b' },
    '7-9': { score: 80, label: 'Strong',      description: 'Wisdom + Compassion — philosophically aligned.', color: '#22c55e' },
    '8-8': { score: 70, label: 'Good',        description: 'Two achievers — powerful but competitive.', color: '#f59e0b' },
    '8-9': { score: 65, label: 'Moderate',    description: 'Ambition vs idealism — needs compromise.', color: '#f59e0b' },
    '9-9': { score: 85, label: 'Excellent',   description: 'Double compassion — deeply humanitarian bond.', color: '#22c55e' },
  }
  const key = `${Math.min(n1, n2)}-${Math.max(n1, n2)}`
  return COMPAT[key] ?? { score: 65, label: 'Moderate', description: 'Unique combination — balance and understanding is key.', color: '#f59e0b' }
}

// ── Geo Search ────────────────────────────────────────────────────────────────

async function searchPlace(query: string): Promise<GeoResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
  const res = await fetch(url, { headers: { "Accept-Language": "en" } })
  return res.ok ? res.json() : []
}

function offsetFromLon(lon: number): number {
  if (lon >= 68 && lon <= 97) return 5.5
  if (lon >= 80 && lon <= 88) return 5.75
  return Math.round((lon / 15) * 2) / 2
}

function generateSessionId(): string {
  return `tv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function detectSegment(dob: string): 'genz' | 'millennial' | 'genx' {
  if (!dob) return 'millennial'
  const age = new Date().getFullYear() - new Date(dob).getFullYear()
  if (age <= 31) return 'genz'
  if (age <= 46) return 'millennial'
  return 'genx'
}

function mapJobToSector(job: string): string {
  if (job.includes('it'))          return 'it'
  if (job.includes('finance'))     return 'finance'
  if (job.includes('healthcare'))  return 'healthcare'
  if (job.includes('govt'))        return 'govt'
  if (job.includes('trader'))      return 'trading'
  if (job.includes('real_estate')) return 'realestate'
  if (job.includes('media'))       return 'media'
  if (job.includes('education'))   return 'education'
  return 'general'
}

// ── Initial State ─────────────────────────────────────────────────────────────

const INITIAL: BirthFormFields = {
  name: '', dateOfBirth: '', timeOfBirth: '12:00',
  unknownTime: false, gender: '',
  placeQuery: '', city: '', latitude: '', longitude: '',
  timezoneOffset: 5.5, ayanamsa: 'lahiri',
  language: 'hinglish', jobCategory: '', mobile: '',
  person2Name: '', person2Mobile: '', person2Dob: '',
  person2Tob: '12:00', person2Place: '', person2City: '',
  person2Lat: '', person2Lng: '',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BirthForm({
  selectedCategory,
  onSubmit,
  loading = false,
  submitLabel = 'Get My Prediction',
  className = '',
}: BirthFormProps) {
  const router = useRouter()

  const [fields, setFields]           = useState<BirthFormFields>(INITIAL)
  const [geoResults, setGeoResults]   = useState<GeoResult[]>([])
  const [geo2Results, setGeo2Results] = useState<GeoResult[]>([])
  const [geoLoading, setGeoLoading]   = useState(false)
  const [geo2Loading, setGeo2Loading] = useState(false)
  const [errors, setErrors]           = useState<Partial<Record<keyof BirthFormFields, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError]       = useState<string | null>(null)
  const [statusMsg, setStatusMsg]     = useState<string>('')
  const [numerology, setNumerology]   = useState<ReturnType<typeof getNumerologyCompatibility> | null>(null)
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounce2Ref = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isDualDomain = DUAL_CHART_DOMAINS.includes(selectedCategory?.id ?? '')

  const set = useCallback(<K extends keyof BirthFormFields>(key: K, value: BirthFormFields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  // ── Mobile numerology ───────────────────────────────────────────────────────
  const handleMobileChange = (val: string, isP2 = false) => {
    const key = isP2 ? 'person2Mobile' : 'mobile'
    set(key as keyof BirthFormFields, val as any)
    const m1 = isP2 ? fields.mobile : val
    const m2 = isP2 ? val : fields.person2Mobile
    if (isDualDomain && m1.replace(/\D/g, '').length >= 10 && m2.replace(/\D/g, '').length >= 10) {
      setNumerology(getNumerologyCompatibility(getMobileNumber(m1), getMobileNumber(m2)))
    } else {
      setNumerology(null)
    }
  }

  // ── Geo search person 1 ─────────────────────────────────────────────────────
  const handlePlaceChange = (query: string) => {
    set('placeQuery', query)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 3) { setGeoResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setGeoLoading(true)
      setGeoResults(await searchPlace(query))
      setGeoLoading(false)
    }, 400)
  }

  const selectPlace = (r: GeoResult) => {
    const lat  = parseFloat(r.lat)
    const lon  = parseFloat(r.lon)
    const city = r.address?.city || r.address?.town || r.address?.village || r.display_name.split(',')[0]
    setFields(prev => ({ ...prev, placeQuery: r.display_name, city, latitude: lat, longitude: lon, timezoneOffset: offsetFromLon(lon) }))
    setGeoResults([])
    setErrors(prev => ({ ...prev, placeQuery: undefined, latitude: undefined }))
  }

  // ── Geo search person 2 ─────────────────────────────────────────────────────
  const handlePlace2Change = (query: string) => {
    set('person2Place', query)
    if (debounce2Ref.current) clearTimeout(debounce2Ref.current)
    if (query.length < 3) { setGeo2Results([]); return }
    debounce2Ref.current = setTimeout(async () => {
      setGeo2Loading(true)
      setGeo2Results(await searchPlace(query))
      setGeo2Loading(false)
    }, 400)
  }

  const selectPlace2 = (r: GeoResult) => {
    const lat  = parseFloat(r.lat)
    const lon  = parseFloat(r.lon)
    const city = r.address?.city || r.address?.town || r.address?.village || r.display_name.split(',')[0]
    setFields(prev => ({ ...prev, person2Place: r.display_name, person2City: city, person2Lat: lat, person2Lng: lon }))
    setGeo2Results([])
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!fields.name.trim())    errs.name        = 'Name is required'
    if (!fields.dateOfBirth)    errs.dateOfBirth  = 'Date of birth is required'
    if (!fields.unknownTime && !fields.timeOfBirth) errs.timeOfBirth = 'Time of birth is required'
    if (fields.latitude === '') errs.latitude     = 'Place of birth is required'
    if (!fields.mobile || fields.mobile.replace(/\D/g, '').length < 10) errs.mobile = 'Valid 10-digit mobile required'
    if (isDualDomain) {
      if (!fields.person2Name.trim()) errs.person2Name = 'Person 2 name required'
      if (!fields.person2Dob)         errs.person2Dob  = 'Person 2 DOB required'
      if (fields.person2Lat === '')   errs.person2Lat  = 'Person 2 place required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setApiError(null)
    setStatusMsg('Swiss Ephemeris se kundali bana rahe hain...')

    try {
      const sessionId = generateSessionId()

      const res = await fetch('/api/predict', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          domainId:    selectedCategory?.id    || 'mill_karz_mukti',
          domainLabel: selectedCategory?.label || 'General',
          birthData: {
            name:     fields.name,
            dob:      fields.dateOfBirth,
            tob:      fields.unknownTime ? '12:00' : fields.timeOfBirth,
            lat:      fields.latitude as number,
            lng:      fields.longitude as number,
            cityName: fields.city,
            timezone: fields.timezoneOffset,
            ayanamsa: 'lahiri',
          },
          userContext: {
            segment:     detectSegment(fields.dateOfBirth),
            employment:  fields.jobCategory,
            sector:      mapJobToSector(fields.jobCategory),
            language:    fields.language,
            city:        fields.city,
            mobile:      fields.mobile,
            person2Name: fields.person2Name || null,
            person2City: fields.person2City || null,
          },
          person2Data: isDualDomain && fields.person2Lat !== '' ? {
            name:     fields.person2Name,
            dob:      fields.person2Dob,
            tob:      fields.person2Tob || '12:00',
            lat:      fields.person2Lat as number,
            lng:      fields.person2Lng as number,
            cityName: fields.person2City,
            mobile:   fields.person2Mobile,
          } : null,
          numerologyCompatibility: numerology,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setApiError(data.error || 'Something went wrong. Please try again.')
        setStatusMsg('')
        return
      }

      if (onSubmit) await onSubmit(fields)

      // ── REDIRECT TO /result/[id] ── KEY FIX ────────────────────────────────
      const predictionId: string | null = data?._meta?.predictionId ?? null

      if (predictionId) {
        setStatusMsg('Jini taiyaar hai — result page par ja rahe hain...')
        router.push(`/result/${predictionId}`)
      } else {
        // Fallback: save failed but prediction exists — show error
        setApiError('Prediction ready hai par save nahi hua. Please retry karo.')
        setStatusMsg('')
        console.error('[BirthForm] predictionId missing:', data?._meta)
      }

    } catch (err) {
      setApiError('Network error. Please check your connection.')
      setStatusMsg('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = loading || isSubmitting

  const inputStyle = (hasError?: boolean) => ({
    background:  'rgba(255,255,255,0.05)',
    border:      `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    colorScheme: 'dark' as const,
  })

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section id="birth-form" className={`py-16 px-4 ${className}`}>
      <div className="max-w-2xl mx-auto">

        {selectedCategory && (
          <div className="mb-6 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-2"
              style={{ background: `${selectedCategory.color}20`, color: selectedCategory.color, border: `1px solid ${selectedCategory.color}40` }}>
              {selectedCategory.label}
            </span>
            <p className="text-slate-400 text-sm">Enter your birth details for a personalized reading</p>
          </div>
        )}

        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>

          <form onSubmit={handleSubmit} noValidate className="grid gap-5">

            {/* ── Language Selector ── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Prediction Language / भाषा चुनें
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => set('language', opt.value as any)}
                    className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                    style={{
                      background: fields.language === opt.value ? GOLD_RGBA(0.2) : 'rgba(255,255,255,0.04)',
                      border:     `1px solid ${fields.language === opt.value ? GOLD_RGBA(0.6) : 'rgba(255,255,255,0.1)'}`,
                      color:      fields.language === opt.value ? GOLD : '#94a3b8',
                    }}>
                    <div className="text-lg mb-0.5">{opt.flag}</div>
                    <div>{opt.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Name ── */}
            <div>
              <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-yellow-400">*</span>
              </label>
              <input id="tv-name" type="text" placeholder="Enter your full name"
                value={fields.name} onChange={e => set('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none transition-all"
                style={inputStyle(!!errors.name)} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* ── WhatsApp Mobile ── */}
            <div>
              <label htmlFor="tv-mobile" className="block text-sm font-medium text-slate-300 mb-1.5">
                WhatsApp Mobile <span className="text-yellow-400">*</span>
                <span className="text-slate-500 text-xs ml-2">(for follow-up & numerology)</span>
              </label>
              <div className="flex gap-2">
                <div className="px-3 py-2.5 rounded-lg text-slate-400 text-sm flex items-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  +91
                </div>
                <input id="tv-mobile" type="tel" placeholder="10-digit mobile number"
                  value={fields.mobile} onChange={e => handleMobileChange(e.target.value)}
                  maxLength={10}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                  style={inputStyle(!!errors.mobile)} />
              </div>
              {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* ── Job Category ── */}
            <div>
              <label htmlFor="tv-job" className="block text-sm font-medium text-slate-300 mb-1.5">
                Profession / Job Category
              </label>
              <select id="tv-job" value={fields.jobCategory}
                onChange={e => set('jobCategory', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ ...inputStyle(), colorScheme: 'dark' }}>
                {JOB_CATEGORIES.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>

            {/* ── Date of Birth ── */}
            <div>
              <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">
                Date of Birth <span className="text-yellow-400">*</span>
              </label>
              <input id="tv-dob" type="date" value={fields.dateOfBirth}
                onChange={e => set('dateOfBirth', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={inputStyle(!!errors.dateOfBirth)} />
              {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>

            {/* ── Time of Birth ── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="tv-tob" className="text-sm font-medium text-slate-300">
                  Time of Birth {!fields.unknownTime && <span className="text-yellow-400">*</span>}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                  <input type="checkbox" checked={fields.unknownTime}
                    onChange={e => set('unknownTime', e.target.checked)} className="rounded" />
                  Unknown time
                </label>
              </div>
              <input id="tv-tob" type="time" value={fields.timeOfBirth}
                onChange={e => set('timeOfBirth', e.target.value)}
                disabled={fields.unknownTime}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ ...inputStyle(!!errors.timeOfBirth), opacity: fields.unknownTime ? 0.4 : 1 }} />
              {fields.unknownTime && <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon)</p>}
            </div>

            {/* ── Gender ── */}
            <div>
              <label htmlFor="tv-gender" className="block text-sm font-medium text-slate-300 mb-1.5">Gender</label>
              <select id="tv-gender" value={fields.gender}
                onChange={e => set('gender', e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ ...inputStyle(), colorScheme: 'dark' }}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>

            {/* ── Place of Birth ── */}
            <div className="relative">
              <label htmlFor="tv-place" className="block text-sm font-medium text-slate-300 mb-1.5">
                Place of Birth <span className="text-yellow-400">*</span>
              </label>
              <div className="relative">
                <input id="tv-place" type="search" autoComplete="off" placeholder="Type city name…"
                  value={fields.placeQuery} onChange={e => handlePlaceChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none pr-8"
                  style={inputStyle(!!errors.latitude)} />
                {geoLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs animate-spin">⟳</span>}
              </div>
              {geoResults.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
                  style={{ background: '#1a1f2e', border: '1px solid rgba(212,175,55,0.2)' }}>
                  {geoResults.map((r, i) => (
                    <li key={i} onClick={() => selectPlace(r)}
                      className="px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-yellow-400/10 truncate">
                      {r.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {errors.latitude && <p className="text-red-400 text-xs mt-1">Please select a place from suggestions</p>}
            </div>

            {/* Lat/Lon */}
            {fields.latitude !== '' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Latitude</label>
                  <input type="text" value={fields.latitude} readOnly
                    className="w-full px-3 py-2 rounded-lg text-slate-400 text-xs font-mono"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Longitude</label>
                  <input type="text" value={fields.longitude} readOnly
                    className="w-full px-3 py-2 rounded-lg text-slate-400 text-xs font-mono"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }} />
                </div>
              </div>
            )}

            {/* ── Timezone ── */}
            <div>
              <label htmlFor="tv-timezone" className="block text-sm font-medium text-slate-300 mb-1.5">Time Zone</label>
              <select id="tv-timezone" value={fields.timezoneOffset}
                onChange={e => set('timezoneOffset', parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ ...inputStyle(), colorScheme: 'dark' }}>
                <option value={5.5}>IST +5:30 (India)</option>
                <option value={5.75}>NPT +5:45 (Nepal)</option>
                <option value={6}>BST +6:00 (Bangladesh)</option>
                <option value={4}>GST +4:00 (UAE/Dubai)</option>
                <option value={0}>UTC +0:00</option>
                <option value={1}>CET +1:00</option>
                <option value={2}>EET +2:00</option>
                <option value={3}>MSK +3:00</option>
                <option value={3.5}>IRST +3:30</option>
                <option value={4.5}>AFT +4:30</option>
                <option value={5}>PKT +5:00</option>
                <option value={6.5}>MMT +6:30</option>
                <option value={7}>ICT +7:00</option>
                <option value={8}>SGT +8:00</option>
                <option value={9}>JST +9:00</option>
                <option value={9.5}>ACST +9:30</option>
                <option value={10}>AEST +10:00</option>
                <option value={-5}>EST -5:00 (USA East)</option>
                <option value={-6}>CST -6:00 (USA Central)</option>
                <option value={-7}>MST -7:00 (USA Mountain)</option>
                <option value={-8}>PST -8:00 (USA West)</option>
              </select>
            </div>

            {/* ── PERSON 2 SECTION ── */}
            {isDualDomain && (
              <div className="mt-2 pt-5 border-t border-amber-400/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 rounded-full" style={{ background: GOLD }} />
                  <p className="font-semibold text-sm tracking-wider uppercase" style={{ color: GOLD }}>
                    Person 2 Details
                  </p>
                  <span className="text-xs text-slate-500">
                    ({selectedCategory?.id === 'genz_ex_back' ? 'Your Partner / Ex' : 'Your Boss / Colleague'})
                  </span>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Their Name <span className="text-yellow-400">*</span>
                    </label>
                    <input type="text" placeholder="Enter their full name"
                      value={fields.person2Name} onChange={e => set('person2Name', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                      style={inputStyle(!!errors.person2Name)} />
                    {errors.person2Name && <p className="text-red-400 text-xs mt-1">{errors.person2Name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Their Mobile
                      <span className="text-slate-500 text-xs ml-2">(for numerology compatibility)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="px-3 py-2.5 rounded-lg text-slate-400 text-sm flex items-center"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        +91
                      </div>
                      <input type="tel" placeholder="Their 10-digit mobile"
                        value={fields.person2Mobile} onChange={e => handleMobileChange(e.target.value, true)}
                        maxLength={10}
                        className="flex-1 px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                        style={inputStyle()} />
                    </div>
                  </div>

                  {/* Numerology result */}
                  {numerology && (
                    <div className="rounded-xl p-4"
                      style={{ background: `${numerology.color}15`, border: `1px solid ${numerology.color}40` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold" style={{ color: numerology.color }}>
                          📱 Mobile Number Compatibility
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-white">{numerology.score}%</div>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${numerology.color}25`, color: numerology.color }}>
                            {numerology.label}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                        <div className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${numerology.score}%`, background: numerology.color }} />
                      </div>
                      <p className="text-xs text-slate-400">{numerology.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Numbers: {getMobileNumber(fields.mobile)} + {getMobileNumber(fields.person2Mobile)}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Their Date of Birth <span className="text-yellow-400">*</span>
                      </label>
                      <input type="date" value={fields.person2Dob}
                        onChange={e => set('person2Dob', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                        style={inputStyle(!!errors.person2Dob)} />
                      {errors.person2Dob && <p className="text-red-400 text-xs mt-1">{errors.person2Dob}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Their Birth Time</label>
                      <input type="time" value={fields.person2Tob}
                        onChange={e => set('person2Tob', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                        style={inputStyle()} />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Their Place of Birth <span className="text-yellow-400">*</span>
                    </label>
                    <div className="relative">
                      <input type="search" autoComplete="off" placeholder="Type their city name…"
                        value={fields.person2Place} onChange={e => handlePlace2Change(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none pr-8"
                        style={inputStyle(!!errors.person2Lat)} />
                      {geo2Loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">⟳</span>}
                    </div>
                    {geo2Results.length > 0 && (
                      <ul className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
                        style={{ background: '#1a1f2e', border: '1px solid rgba(212,175,55,0.2)' }}>
                        {geo2Results.map((r, i) => (
                          <li key={i} onClick={() => selectPlace2(r)}
                            className="px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-yellow-400/10 truncate">
                            {r.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.person2Lat && <p className="text-red-400 text-xs mt-1">Please select their place</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── Status Message ── */}
            {statusMsg && (
              <div className="px-4 py-3 rounded-lg text-sm text-yellow-300 text-center"
                style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <span className="animate-pulse">✨</span> {statusMsg}
              </div>
            )}

            {/* ── API Error ── */}
            {apiError && (
              <div className="px-4 py-3 rounded-lg text-sm text-red-300"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {apiError}
              </div>
            )}

            {/* ── Submit ── */}
            <button type="submit" disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: isLoading ? GOLD_RGBA(0.3) : `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`,
                color:  isLoading ? 'rgba(255,255,255,0.5)' : '#080B12',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}>
              {isLoading ? (statusMsg || 'Jini pad rahi hai aapki kundali…') : submitLabel}
            </button>

            <p className="text-center text-xs text-slate-600">
              🔒 Your data is private and secure. Never shared.
            </p>

          </form>
        </div>
      </div>
    </section>
  )
}
