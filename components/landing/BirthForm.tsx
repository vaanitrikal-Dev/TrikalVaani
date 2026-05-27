/**
 * ============================================================
 * TRIKAL VAANI — BirthForm Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/landing/BirthForm.tsx
 * VERSION: 9.2 — Razorpay Payment Flow + Full SEO/GEO
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v9.2 CHANGES vs v9.1:
 *   ✅ Razorpay payment flow for ₹51 (paid) and ₹11 (voice) tiers
 *   ✅ Loads checkout.razorpay.com/v1/checkout.js dynamically
 *   ✅ Calls /api/create-order → opens popup → /api/verify-payment → /api/predict
 *   ✅ Razorpay trust strip below tier selector
 *   ✅ Service + Offer JSON-LD with priceSpecification (₹51, ₹11) for AI search
 *   ✅ PaymentMethod schema injection
 *   ✅ Hidden SEO content expanded with Razorpay + PCI-DSS + WhatsApp
 *   ✅ aria-labels on payment buttons (accessibility + SEO)
 *   ✅ ALL v9.1 logic preserved 100%:
 *      - New Places API (POST), reverseGeocode, fetchTimezone
 *      - Numerology compatibility for dual-chart domains
 *      - 27 country selector, dynamic segment routing
 *      - All field validations, dual chart Person 2 section
 * ============================================================
 */

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay-helper"

// ── Types ─────────────────────────────────────────────────────────────────────

export type PredictionTier = 'free' | 'paid' | 'voice'

export interface BirthFormFields {
  name:                string
  dateOfBirth:         string
  timeOfBirth:         string
  unknownTime:         boolean
  gender:              "male" | "female" | "other" | ""
  placeQuery:          string
  city:                string
  latitude:            number | ""
  longitude:           number | ""
  timezoneOffset:      number
  ayanamsa:            "lahiri"
  language:            "hindi" | "hinglish" | "english"
  jobCategory:         string
  mobile:              string
  countryCode:         string
  countryDigits:       number
  currentCity:         string
  relationshipStatus:  string
  situationNote:       string
  person2Name:         string
  person2Mobile:       string
  person2CountryCode:  string
  person2Dob:          string
  person2Tob:          string
  person2Place:        string
  person2City:         string
  person2Lat:          number | ""
  person2Lng:          number | ""
  person2CurrentCity:  string
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

// ── Dynamic Segment Calculator ────────────────────────────────────────────────

export function calculateDynamicSegment(dob: string, gender: string): string {
  if (!dob) return 'millennial_general'
  const age = new Date().getFullYear() - new Date(dob).getFullYear()
  const g = gender || 'other'
  if (age >= 16 && age <= 29) {
    if (g === 'male')   return 'young_male'
    if (g === 'female') return 'young_female'
    return 'young_general'
  }
  if (age >= 30 && age <= 45) {
    if (g === 'male')   return 'mid_male'
    if (g === 'female') return 'mid_female'
    return 'mid_general'
  }
  if (age >= 46 && age <= 55) {
    if (g === 'male')   return 'senior_male'
    if (g === 'female') return 'senior_female'
    return 'senior_general'
  }
  if (age >= 56 && age <= 65) {
    if (g === 'male')   return 'elder_male'
    if (g === 'female') return 'elder_female'
    return 'elder_general'
  }
  if (age > 65) return 'elder_general'
  if (age < 16) return 'young_general'
  return 'millennial_general'
}

function detectLegacySegment(dob: string): 'genz' | 'millennial' | 'genx' {
  if (!dob) return 'millennial'
  const age = new Date().getFullYear() - new Date(dob).getFullYear()
  if (age <= 31) return 'genz'
  if (age <= 46) return 'millennial'
  return 'genx'
}

// ── Google Maps API Functions — v9.1 NEW PLACES API (UNCHANGED) ──────────────

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

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality`
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`)
    if (!res.ok) return ''
    const data = await res.json()
    return data.results?.[0]?.address_components?.[0]?.long_name ?? ''
  } catch { return '' }
}

// ── Numerology (UNCHANGED v9.1) ──────────────────────────────────────────────

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

// ── Constants ─────────────────────────────────────────────────────────────────

const SEO_TRUST_BADGES = [
  { icon: '⚡', label: 'Swiss Ephemeris' },
  { icon: '📖', label: 'BPHS Classical'  },
  { icon: '🔮', label: 'Bhrigu Nandi'   },
  { icon: '⚖️', label: 'Shadbala'       },
]

const VOICE_TAGLINES = [
  { text: 'Kuch dil ki baatein type nahi ki jaati', icon: '🎙️' },
  { text: 'Bol do Trikal ko — woh sun raha hai',    icon: '🔮' },
  { text: 'Dil ki baat — sirf ek minute mein',      icon: '✨' },
  { text: 'Trikal sun raha hai — bas shuru karo',   icon: '🎙️' },
  { text: 'Jo dil mein hai — woh bol do',            icon: '💫' },
  { text: 'Type mat karo — feel karo',               icon: '🎙️' },
]

const LOADING_STEPS = [
  'Mahakaal se connection ho raha hai...',
  'Kundali calculate ho rahi hai — Swiss Ephemeris...',
  'Trikal aapka sandesh taiyaar kar raha hai...',
]

const PAYMENT_LOADING_STEPS = [
  'Razorpay payment verify ho raha hai...',
  'Mahakaal se connection ho raha hai...',
  'Trikal aapka deep reading taiyaar kar raha hai...',
]

const DUAL_CHART_DOMAINS = ['genz_ex_back', 'genz_toxic_boss']

const RELATIONSHIP_STATUS_OPTIONS = [
  { value: '',               label: 'Select status (optional)' },
  { value: 'single',         label: '💫 Single' },
  { value: 'in_relationship',label: '💑 In a Relationship' },
  { value: 'married',        label: '💍 Married' },
  { value: 'separated',      label: '🔄 Separated' },
  { value: 'divorced',       label: '📄 Divorced' },
  { value: 'widowed',        label: '🕊️ Widowed' },
  { value: 'complicated',    label: '🌀 It\'s Complicated' },
]

const JOB_CATEGORIES = [
  { value: '',                    label: 'Select your profession' },
  { value: 'student',             label: '🎓 Student' },
  { value: 'fresher',             label: '🌱 Fresher / Job Seeker' },
  { value: 'salaried_it',         label: '💻 Salaried — IT / Tech' },
  { value: 'salaried_finance',    label: '🏦 Salaried — Finance / Banking' },
  { value: 'salaried_healthcare', label: '🏥 Salaried — Healthcare / Medical' },
  { value: 'salaried_govt',       label: '🏛️ Salaried — Government / PSU' },
  { value: 'salaried_education',  label: '📚 Salaried — Education / Teaching' },
  { value: 'salaried_legal',      label: '⚖️ Salaried — Legal / Law' },
  { value: 'salaried_media',      label: '🎬 Salaried — Media / Creative' },
  { value: 'salaried_other',      label: '💼 Salaried — Other' },
  { value: 'self_employed',       label: '🚀 Self-Employed / Freelancer' },
  { value: 'business_owner',      label: '🏢 Business Owner' },
  { value: 'startup_founder',     label: '⚡ Startup Founder' },
  { value: 'real_estate',         label: '🏠 Real Estate Professional' },
  { value: 'trader_investor',     label: '📈 Trader / Investor' },
  { value: 'homemaker',           label: '🏡 Homemaker' },
  { value: 'retired',             label: '🌅 Retired' },
  { value: 'nri',                 label: '✈️ NRI / Working Abroad' },
]

const LANGUAGE_OPTIONS = [
  { value: 'hinglish', label: 'Hinglish', flag: '🇮🇳', desc: 'Hindi + English mix' },
  { value: 'hindi',    label: 'हिंदी',    flag: '🕉️',  desc: 'Pure Hindi' },
  { value: 'english',  label: 'English',  flag: '🌐',  desc: 'English' },
]

const GOLD      = '#D4AF37'
const RAZORPAY_BLUE = '#3395FF'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

const SELECT_STYLE: React.CSSProperties = {
  background:       '#0d1120',
  border:           '1px solid rgba(255,255,255,0.1)',
  color:            '#e2e8f0',
  colorScheme:      'dark',
  WebkitAppearance: 'none' as any,
  appearance:       'none',
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

function generateSessionId(): string {
  return `tv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function calculateAge(dob: string): number {
  if (!dob) return 30
  return new Date().getFullYear() - new Date(dob).getFullYear()
}

const INITIAL: BirthFormFields = {
  name: '', dateOfBirth: '', timeOfBirth: '12:00',
  unknownTime: false, gender: '',
  placeQuery: '', city: '', latitude: '', longitude: '',
  timezoneOffset: 5.5, ayanamsa: 'lahiri',
  language: 'hinglish', jobCategory: '', mobile: '',
  countryCode: '+91', countryDigits: 10,
  currentCity: '', relationshipStatus: '', situationNote: '',
  person2Name: '', person2Mobile: '', person2CountryCode: '+91',
  person2Dob: '', person2Tob: '12:00', person2Place: '',
  person2City: '', person2Lat: '', person2Lng: '',
  person2CurrentCity: '',
}

// ── Service + Offer JSON-LD for AI Search (GEO) ──────────────────────────────
const SERVICE_OFFER_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://trikalvaani.com/#service',
  name: 'Trikal Vaani Vedic Astrology Prediction',
  serviceType: 'AI Vedic Astrology Reading',
  provider: {
    '@type': 'Organization',
    '@id': 'https://trikalvaani.com/#organization',
    name: 'Trikal Vaani',
    url: 'https://trikalvaani.com',
  },
  areaServed: { '@type': 'Country', name: 'India' },
  audience: { '@type': 'Audience', audienceType: 'Indian seekers, NRIs, HNIs' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Trikal Vaani Reading Plans',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Free Trikal Ka Sandesh',
        description: '150-200 word free Vedic preview with Swiss Ephemeris kundali',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '0',
          priceCurrency: 'INR',
          valueAddedTaxIncluded: true,
        },
      },
      {
        '@type': 'Offer',
        name: 'Deep Reading',
        description: '900-word Vedic analysis with 5 personalized upay, action and avoid windows. Gemini Pro 2.5 + Claude Sonnet polish.',
        price: '51',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        acceptedPaymentMethod: [
          { '@type': 'PaymentMethod', name: 'UPI' },
          { '@type': 'PaymentMethod', name: 'CreditCard' },
          { '@type': 'PaymentMethod', name: 'DebitCard' },
          { '@type': 'PaymentMethod', name: 'NetBanking' },
          { '@type': 'PaymentMethod', name: 'Wallet' },
        ],
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '51',
          priceCurrency: 'INR',
          valueAddedTaxIncluded: true,
        },
      },
      {
        '@type': 'Offer',
        name: 'Voice Reading',
        description: '60-second personalized voice prediction in Hindi or Hinglish',
        price: '11',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        acceptedPaymentMethod: [
          { '@type': 'PaymentMethod', name: 'UPI' },
          { '@type': 'PaymentMethod', name: 'CreditCard' },
          { '@type': 'PaymentMethod', name: 'Wallet' },
        ],
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '11',
          priceCurrency: 'INR',
          valueAddedTaxIncluded: true,
        },
      },
    ],
  },
  termsOfService: 'https://trikalvaani.com/terms',
  // ── Razorpay payment processor declared (AI search picks this up) ──
  brand: {
    '@type': 'Brand',
    name: 'Trikal Vaani',
    slogan: 'India\'s Most Accurate AI Vedic Astrology — Razorpay-Secured Payments',
  },
}

// ── Country Selector (UNCHANGED v9.1) ────────────────────────────────────────

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
      <button type="button" id={id}
        onClick={() => setOpen(o => !o)}
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

// ── Rotating Tagline (UNCHANGED v9.1) ────────────────────────────────────────

function RotatingTagline() {
  const [current, setCurrent] = useState(0)
  const [fading,  setFading]  = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => { setCurrent(prev => (prev + 1) % VOICE_TAGLINES.length); setFading(false) }, 500)
    }, 3500)
    return () => clearInterval(interval)
  }, [])
  const tagline = VOICE_TAGLINES[current]!
  return (
    <div style={{ textAlign: 'center', padding: '12px 16px', background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}`, borderRadius: '12px', marginBottom: '16px', transition: 'opacity 0.5s ease', opacity: fading ? 0 : 1 }}>
      <p style={{ color: GOLD, fontSize: '13px', fontWeight: 600, fontStyle: 'italic', margin: 0 }}>
        {tagline.icon} "{tagline.text}"
      </p>
      <p style={{ color: '#475569', fontSize: '10px', margin: '4px 0 0' }}>
        — Trikal Voice Reading · ₹11 only · Razorpay Secured
      </p>
    </div>
  )
}

// ── Razorpay Trust Strip (NEW v9.2) ──────────────────────────────────────────

function RazorpayInlineTrustStrip({ tier }: { tier: PredictionTier }) {
  if (tier === 'free') return null
  return (
    <div
      role="region"
      aria-label="Razorpay payment security trust signals"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '10px 12px',
        background: 'rgba(51,149,255,0.06)',
        border: '1px solid rgba(51,149,255,0.18)',
        borderRadius: '10px',
        marginTop: '4px',
      }}
    >
      <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
        🔒
        <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: '10px' }}>Secured by</span>
        <span style={{ color: RAZORPAY_BLUE, fontWeight: 700, fontSize: '11px', fontFamily: 'Georgia, serif' }}>Razorpay</span>
      </span>
      <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['UPI', 'Cards', 'NetBanking', 'Wallets', 'RuPay'].map(m => (
          <span
            key={m}
            style={{
              fontSize: '9px',
              fontWeight: 600,
              color: '#64748B',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '3px',
              padding: '2px 6px',
              letterSpacing: '0.04em',
            }}
          >
            {m}
          </span>
        ))}
      </div>
      <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
      <span style={{ fontSize: '9px', color: '#64748B', fontWeight: 500 }}>
        🛡️ PCI-DSS · 256-bit SSL
      </span>
    </div>
  )
}

// ── Tier Selector (UNCHANGED structure, copy refined v9.2) ───────────────────

function TierSelector({ selected, onChange }: { selected: PredictionTier; onChange: (t: PredictionTier) => void }) {
  const tiers = [
    { id: 'free'  as PredictionTier, icon: '🔮', label: 'Free Preview', price: 'Free', desc: 'Trikal Ka Sandesh', color: '#94a3b8', features: ['150-200 word summary', 'Key message + action', 'Instant results'] },
    { id: 'paid'  as PredictionTier, icon: '⚡', label: 'Deep Reading',  price: '₹51',  desc: 'Gemini Pro 2.5',   color: GOLD,      features: ['900 word full analysis', 'Personalized 5 upay', 'Action windows + dates'], highlight: true },
    { id: 'voice' as PredictionTier, icon: '🎙️', label: 'Voice',        price: '₹11',  desc: 'Trikal ki awaaz', color: '#a78bfa', features: ['60-sec voice', 'Hindi / Hinglish', 'Trikal AI'] },
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-3">Reading Type <span className="text-yellow-400">*</span></label>
      <div className="grid grid-cols-3 gap-3">
        {tiers.map(tier => (
          <button key={tier.id} type="button" onClick={() => onChange(tier.id)}
            aria-label={`Select ${tier.label} for ${tier.price}`}
            style={{ background: selected === tier.id ? (tier as any).highlight ? `linear-gradient(135deg,${GOLD_RGBA(0.2)},${GOLD_RGBA(0.1)})` : `${tier.color}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${selected === tier.id ? tier.color : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '14px 10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', position: 'relative' }}>
            {(tier as any).highlight && (
              <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: GOLD, color: '#080B12', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
            )}
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{tier.icon}</div>
            <p style={{ margin: '0 0 2px', color: selected === tier.id ? tier.color : '#94a3b8', fontSize: '12px', fontWeight: 700 }}>{tier.label}</p>
            <p style={{ margin: '0 0 6px', color: selected === tier.id ? '#fff' : '#64748b', fontSize: '16px', fontWeight: 800, fontFamily: 'Georgia,serif' }}>{tier.price}</p>
            <p style={{ margin: '0 0 8px', color: '#475569', fontSize: '10px', lineHeight: 1.4 }}>{tier.desc}</p>
            {tier.features.map((f, i) => (
              <p key={i} style={{ margin: 0, color: selected === tier.id ? '#94a3b8' : '#334155', fontSize: '10px', display: 'flex', gap: '4px' }}>
                <span style={{ color: tier.color, flexShrink: 0 }}>✓</span>{f}
              </p>
            ))}
          </button>
        ))}
      </div>
      {selected === 'paid' && (
        <div style={{ marginTop: '12px', padding: '12px', background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}`, borderRadius: '10px' }}>
          <p style={{ margin: '0 0 4px', color: GOLD, fontSize: '11px', fontWeight: 700 }}>⚡ Gemini 2.5 Pro — 900 words deep analysis</p>
          <p style={{ margin: 0, color: '#64748b', fontSize: '10px', lineHeight: 1.5 }}>AstroTalk charges ₹500+ for this level. Trikal Vaani delivers for ₹51 — Swiss Ephemeris + BPHS + personalized 5 upay by segment. Razorpay-secured one-time payment.</p>
        </div>
      )}
    </div>
  )
}

// ── City Input Component (UNCHANGED v9.1) ────────────────────────────────────

function CityInput({
  id, label, required, value, onSelect, error, placeholder,
}: {
  id: string; label: string; required?: boolean; value: string
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void
  error?: string; placeholder?: string; person2?: boolean
}) {
  const [query,       setQuery]       = useState(value)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [loading,     setLoading]     = useState(false)
  const [selected,    setSelected]    = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setQuery(value) }, [value])

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
          {label} {required && <span className="text-yellow-400">*</span>}
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
          {loading ? <span style={{ color: GOLD }}>⟳</span> : selected ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#475569' }}>📍</span>}
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

// ── Main Component ────────────────────────────────────────────────────────────

export default function BirthForm({ selectedCategory, onSubmit, loading = false, submitLabel, className = '' }: BirthFormProps) {
  const router = useRouter()

  const [fields,         setFields]         = useState<BirthFormFields>(INITIAL)
  const [predictionTier, setPredictionTier] = useState<PredictionTier>('free')
  const [errors,         setErrors]         = useState<Partial<Record<keyof BirthFormFields, string>>>({})
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [apiError,       setApiError]       = useState<string | null>(null)
  const [loadingStep,    setLoadingStep]    = useState(0)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [numerology,     setNumerology]     = useState<ReturnType<typeof getNumerologyCompatibility> | null>(null)
  const [locating,       setLocating]       = useState(false)

  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isDualDomain = DUAL_CHART_DOMAINS.includes(selectedCategory?.id ?? '')

  const set = useCallback(<K extends keyof BirthFormFields>(key: K, value: BirthFormFields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  // ── Pre-load Razorpay script when paid/voice selected ───────────────────────
  useEffect(() => {
    if (predictionTier === 'paid' || predictionTier === 'voice') {
      loadRazorpayScript()
    }
  }, [predictionTier])

  const startLoadingMessages = (steps: string[] = LOADING_STEPS) => {
    setLoadingStep(0)
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
    loadingIntervalRef.current = setInterval(() => {
      setLoadingStep(prev => prev < steps.length - 1 ? prev + 1 : prev)
    }, 18000)
  }

  const stopLoadingMessages = () => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
  }

  const handleMobileChange = (val: string, isP2 = false) => {
    const key = isP2 ? 'person2Mobile' : 'mobile'
    set(key as keyof BirthFormFields, val as any)
    const m1 = isP2 ? fields.mobile : val
    const m2 = isP2 ? val : fields.person2Mobile
    if (isDualDomain && m1.replace(/\D/g, '').length >= 10 && m2.replace(/\D/g, '').length >= 10) {
      setNumerology(getNumerologyCompatibility(getMobileNumber(m1), getMobileNumber(m2)))
    } else { setNumerology(null) }
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported by your browser.'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const [city, tz] = await Promise.all([reverseGeocode(lat, lng), fetchTimezone(lat, lng)])
        setFields(prev => ({
          ...prev,
          placeQuery: city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          city: city || '',
          latitude: lat,
          longitude: lng,
          timezoneOffset: tz,
        }))
        setLocating(false)
      },
      () => { alert('Could not get your location. Please type your city manually.'); setLocating(false) }
    )
  }

  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!fields.name.trim())    errs.name       = 'Name is required'
    if (!fields.dateOfBirth)    errs.dateOfBirth = 'Date of birth is required'
    if (!fields.unknownTime && !fields.timeOfBirth) errs.timeOfBirth = 'Time of birth is required'
    if (fields.latitude === '') errs.latitude    = 'Place of birth is required'
    const mobileDigits = fields.mobile.replace(/\D/g, '').length
    if (!fields.mobile || mobileDigits < fields.countryDigits) errs.mobile = `Valid ${fields.countryDigits}-digit mobile required`
    if (isDualDomain) {
      if (!fields.person2Name.trim()) errs.person2Name = 'Person 2 name required'
      if (!fields.person2Dob)         errs.person2Dob  = 'Person 2 DOB required'
      if (fields.person2Lat === '')   errs.person2Lat  = 'Person 2 place required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Build prediction request body ────────────────────────────────────────────
  const buildPredictionBody = (paymentVerification: any = null) => {
    const sessionId      = generateSessionId()
    const age            = calculateAge(fields.dateOfBirth)
    const dynamicSegment = calculateDynamicSegment(fields.dateOfBirth, fields.gender)
    const legacySegment  = detectLegacySegment(fields.dateOfBirth)

    return {
      sessionId,
      domainId:    selectedCategory?.id    || 'mill_karz_mukti',
      domainLabel: selectedCategory?.label || 'General',
      predictionTier,
      paymentVerification,
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
        segment:            legacySegment,
        dynamicSegment,
        gender:             fields.gender,
        age,
        employment:         fields.jobCategory,
        sector:             mapJobToSector(fields.jobCategory),
        language:           fields.language,
        city:               fields.city,
        currentCity:        fields.currentCity || fields.city,
        relationshipStatus: fields.relationshipStatus,
        situationNote:      fields.situationNote.slice(0, 200),
        mobile:             `${fields.countryCode}${fields.mobile}`,
        person2Name:        fields.person2Name        || null,
        person2City:        fields.person2City        || null,
        person2CurrentCity: fields.person2CurrentCity || null,
      },
      person2Data: isDualDomain && fields.person2Lat !== '' ? {
        name:        fields.person2Name,
        dob:         fields.person2Dob,
        tob:         fields.person2Tob || '12:00',
        lat:         fields.person2Lat as number,
        lng:         fields.person2Lng as number,
        cityName:    fields.person2City,
        currentCity: fields.person2CurrentCity || fields.person2City,
        mobile:      `${fields.person2CountryCode}${fields.person2Mobile}`,
      } : null,
      numerologyCompatibility: numerology,
    }
  }

  // ── Call /api/predict and handle navigation ─────────────────────────────────
  const callPredictAPI = async (paymentVerification: any = null) => {
    try {
      const res = await fetch('/api/predict', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildPredictionBody(paymentVerification)),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error || 'Something went wrong.')
        stopLoadingMessages()
        return
      }
      if (onSubmit) await onSubmit(fields)

      const publicSlug   = data?._meta?.publicSlug   ?? null
      const predictionId = data?._meta?.predictionId ?? null

      if (publicSlug)        router.push(`/report/${publicSlug}`)
      else if (predictionId) router.push(`/result/${predictionId}`)
      else { setApiError('Prediction ready hai par save nahi hua. Please retry karo.'); stopLoadingMessages() }
    } catch {
      setApiError('Network error. Please check your connection.')
      stopLoadingMessages()
    }
  }

  // ── RAZORPAY PAYMENT FLOW (NEW v9.2) ────────────────────────────────────────
  const handleRazorpayPayment = async (tier: 'paid' | 'voice') => {
    setApiError(null)
    setPaymentLoading(true)

    try {
      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setApiError('Razorpay payment SDK failed to load. Please check your internet connection.')
        setPaymentLoading(false)
        return
      }

      // Step 2: Create Razorpay order on server
      const orderRes = await fetch('/api/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tier: tier === 'paid' ? 'deep' : 'voice' }),
      })
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        setApiError(err.error || 'Could not create payment order. Please try again.')
        setPaymentLoading(false)
        return
      }
      const { orderId, amount, currency, keyId } = await orderRes.json()

      // Step 3: Open Razorpay checkout popup
      openRazorpayCheckout({
        keyId,
        orderId,
        amount,
        currency,
        name:        'Trikal Vaani',
        description: tier === 'paid' ? 'Deep Reading — Vedic Astrology' : 'Voice Reading — Trikal Voice',
        prefillName:    fields.name,
        prefillContact: `${fields.countryCode}${fields.mobile}`.replace(/\s/g, ''),
        themeColor:     '#D4AF37',
        onSuccess: async (response) => {
          // Step 4: Verify payment server-side
          const verifyRes = await fetch('/api/verify-payment', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(response),
          })
          if (!verifyRes.ok) {
            const err = await verifyRes.json().catch(() => ({}))
            setApiError(err.error || 'Payment verification failed. Please contact support.')
            setPaymentLoading(false)
            return
          }

          // Step 5: For voice tier, redirect to /voice with payment proof
          if (tier === 'voice') {
            const voiceUrl = `/voice?name=${encodeURIComponent(fields.name)}&lang=${fields.language}&pid=${response.razorpay_payment_id}`
            router.push(voiceUrl)
            return
          }

          // Step 6: For paid tier, call /api/predict with payment verification
          setIsSubmitting(true)
          startLoadingMessages(PAYMENT_LOADING_STEPS)

          await callPredictAPI({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            amount,
          })
          setIsSubmitting(false)
          setPaymentLoading(false)
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

  // ── MAIN SUBMIT HANDLER ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // ── PAID or VOICE → trigger Razorpay flow ──
    if (predictionTier === 'paid' || predictionTier === 'voice') {
      await handleRazorpayPayment(predictionTier)
      return
    }

    // ── FREE → direct prediction ──
    setIsSubmitting(true)
    setApiError(null)
    startLoadingMessages()
    await callPredictAPI(null)
    setIsSubmitting(false)
  }

  const isLoading = loading || isSubmitting || paymentLoading

  const getSubmitLabel = () => {
    if (paymentLoading)             return '⟳ Razorpay popup khul raha hai...'
    if (isLoading)                  return LOADING_STEPS[loadingStep] || 'Processing...'
    if (submitLabel)                return submitLabel
    if (predictionTier === 'free')  return '🔮 Get Free Prediction — Trikal Ka Sandesh'
    if (predictionTier === 'paid')  return '⚡ Pay ₹51 with Razorpay — Deep Reading'
    if (predictionTier === 'voice') return '🎙️ Pay ₹11 with Razorpay — Voice Reading'
    return '🔮 Get My Prediction'
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  })

  return (
    <section id="birth-form" className={`py-16 px-4 ${className}`}
      aria-label="Vedic Astrology Birth Chart Form — Trikal Vaani by Rohiit Gupta">

      {/* JSON-LD: Service + Offer + PaymentMethod for AI Search (GEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_OFFER_SCHEMA) }}
      />

      {/* Hidden SEO content (expanded v9.2) */}
      <div style={{ display: 'none' }} aria-hidden="false">
        <h2>Free AI Vedic Astrology Prediction — Swiss Ephemeris Powered by Rohiit Gupta</h2>
        <p>Get your personalized Vedic astrology reading at Trikal Vaani. Powered by Swiss Ephemeris, BPHS, Bhrigu Nandi Nadi, Shadbala. By Rohiit Gupta, Chief Vedic Architect, Delhi NCR. Free Trikal Ka Sandesh preview, ₹51 Deep Reading with 900-word analysis and 5 personalized upay, ₹11 Voice Reading. All paid plans secured by Razorpay — India's most trusted payment gateway. PCI-DSS compliant, 256-bit SSL encrypted. Accepts UPI, Cards, NetBanking, Wallets, RuPay. Customer support via WhatsApp at +91 92118 04111. Refund policy at trikalvaani.com/refund. Terms at trikalvaani.com/terms.</p>
        <p>Trikal Vaani is India's most accurate AI Vedic astrology platform, competing with AstroTalk and AstroSage at affordable mass-market pricing. Each prediction uses real Swiss Ephemeris planetary calculations validated against BPHS classical sutras, Bhrigu Nandi Nadi pattern matching, and Shadbala planetary strength scoring. Vimshottari Dasha primary, Pratyantar Dasha for 3-7 day precision, Sookshma Dasha hourly. Lahiri Ayanamsha sidereal system. 11 life domains: Career, Wealth, Health, Relationships, Family, Education, Home, Legal, Travel, Spirituality, Well-being.</p>
      </div>

      <div className="max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-8">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(to right, transparent, ${GOLD_RGBA(0.3)})` }} />
            <span style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>🔱 Mahakaal Ka Ashirwad</span>
            <div style={{ height: '1px', flex: 1, background: `linear-gradient(to left, transparent, ${GOLD_RGBA(0.3)})` }} />
          </div>
          {selectedCategory ? (
            <>
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-3"
                style={{ background: `${selectedCategory.color}20`, color: selectedCategory.color, border: `1px solid ${selectedCategory.color}40` }}>
                {selectedCategory.label}
              </span>
              <h2 className="text-white text-xl font-serif font-bold mb-2">Apni Kundali Ka Sach Janein</h2>
              <p className="text-slate-400 text-sm">Swiss Ephemeris precision · BPHS Classical · Bhrigu Nandi patterns</p>
            </>
          ) : (
            <>
              <h2 className="text-white text-2xl font-serif font-bold mb-2">Trikal Ka Sandesh — Sirf Aapke Liye</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">India's most accurate AI Vedic astrology — by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.</p>
            </>
          )}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {SEO_TRUST_BADGES.map(b => (
              <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}`, color: GOLD }}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>

        <RotatingTagline />

        {/* Form */}
        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
          <form onSubmit={handleSubmit} noValidate className="grid gap-5">

            <TierSelector selected={predictionTier} onChange={setPredictionTier} />

            {/* Razorpay inline trust strip — paid/voice only */}
            <RazorpayInlineTrustStrip tier={predictionTier} />

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Prediction Language / भाषा चुनें</label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('language', opt.value as any)}
                    className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                    style={{ background: fields.language === opt.value ? GOLD_RGBA(0.2) : 'rgba(255,255,255,0.04)', border: `1px solid ${fields.language === opt.value ? GOLD_RGBA(0.6) : 'rgba(255,255,255,0.1)'}`, color: fields.language === opt.value ? GOLD : '#94a3b8' }}>
                    <div className="text-lg mb-0.5">{opt.flag}</div>
                    <div>{opt.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-yellow-400">*</span></label>
              <input id="tv-name" type="text" placeholder="Enter your full name"
                value={fields.name} onChange={e => set('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle(!!errors.name)} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="tv-mobile" className="block text-sm font-medium text-slate-300 mb-1.5">
                WhatsApp Mobile <span className="text-yellow-400">*</span>
                <span className="text-slate-500 text-xs ml-2">(for follow-up + numerology)</span>
              </label>
              <div className="flex gap-2">
                <CountrySelector id="tv-country" value={fields.countryCode}
                  onChange={(dial, digits) => setFields(prev => ({ ...prev, countryCode: dial, countryDigits: digits }))} />
                <input id="tv-mobile" type="tel" placeholder={`${fields.countryDigits}-digit mobile`}
                  value={fields.mobile} onChange={e => handleMobileChange(e.target.value)}
                  maxLength={fields.countryDigits + 2}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={inputStyle(!!errors.mobile)} />
              </div>
              {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* Job */}
            <div className="relative">
              <label htmlFor="tv-job" className="block text-sm font-medium text-slate-300 mb-1.5">Profession / Job Category</label>
              <div className="relative">
                <select id="tv-job" value={fields.jobCategory} onChange={e => set('jobCategory', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none pr-8" style={SELECT_STYLE}>
                  {JOB_CATEGORIES.map(j => <option key={j.value} value={j.value} style={{ background: '#0d1120', color: '#e2e8f0' }}>{j.label}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▾</span>
              </div>
            </div>

            {/* DOB */}
            <div>
              <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span className="text-yellow-400">*</span></label>
              <input id="tv-dob" type="date" value={fields.dateOfBirth}
                onChange={e => set('dateOfBirth', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle(!!errors.dateOfBirth)} />
              {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>

            {/* TOB */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="tv-tob" className="text-sm font-medium text-slate-300">
                  Time of Birth {!fields.unknownTime && <span className="text-yellow-400">*</span>}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                  <input type="checkbox" checked={fields.unknownTime} onChange={e => set('unknownTime', e.target.checked)} className="rounded" />
                  Unknown time
                </label>
              </div>
              <input id="tv-tob" type="time" value={fields.timeOfBirth}
                onChange={e => set('timeOfBirth', e.target.value)}
                disabled={fields.unknownTime}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ ...inputStyle(!!errors.timeOfBirth), opacity: fields.unknownTime ? 0.4 : 1 }} />
              {fields.unknownTime && <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon)</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Gender <span className="text-slate-500 text-xs ml-1">(for personalized remedies)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'male',   label: '♂ Male',   color: '#60a5fa' },
                  { value: 'female', label: '♀ Female', color: '#f472b6' },
                  { value: 'other',  label: '⊕ Other',  color: '#94a3b8' },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('gender', opt.value as any)}
                    className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                    style={{ background: fields.gender === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${fields.gender === opt.value ? `${opt.color}60` : 'rgba(255,255,255,0.1)'}`, color: fields.gender === opt.value ? opt.color : '#64748b' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {fields.gender && fields.dateOfBirth && (
                <p style={{ margin: '6px 0 0', color: GOLD, fontSize: '11px' }}>
                  ✦ Segment: {calculateDynamicSegment(fields.dateOfBirth, fields.gender).replace('_', ' ')} — personalized remedy routing active
                </p>
              )}
            </div>

            {/* Place of Birth */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Place of Birth <span className="text-yellow-400">*</span>
                </label>
                <button type="button" onClick={handleCurrentLocation} disabled={locating}
                  style={{ color: locating ? '#475569' : GOLD, fontSize: '11px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {locating ? '⟳ Locating...' : '📍 Use Current Location'}
                </button>
              </div>
              <CityInput
                id="tv-place"
                label=""
                value={fields.placeQuery}
                placeholder="Type city of birth..."
                error={errors.latitude ? 'Please select a city from suggestions' : undefined}
                onSelect={(city, lat, lng, tz) => {
                  setFields(prev => ({ ...prev, placeQuery: city, city, latitude: lat, longitude: lng, timezoneOffset: tz }))
                  setErrors(prev => ({ ...prev, latitude: undefined }))
                }}
              />
            </div>

            {/* Lat/Lng display */}
            {fields.latitude !== '' && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Latitude',  value: (fields.latitude as number).toFixed(4) },
                  { label: 'Longitude', value: (fields.longitude as number).toFixed(4) },
                  { label: 'Timezone',  value: `UTC ${fields.timezoneOffset >= 0 ? '+' : ''}${fields.timezoneOffset}` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                    <div className="px-3 py-2 rounded-lg text-xs font-mono text-center"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#22c55e' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current City */}
            <div>
              <label htmlFor="tv-current-city" className="block text-sm font-medium text-slate-300 mb-1.5">
                Current City <span className="text-slate-500 text-xs ml-2">(where you live/work now)</span>
              </label>
              <input id="tv-current-city" type="text"
                placeholder="e.g. Gurugram, Mumbai, Dubai, London..."
                value={fields.currentCity} onChange={e => set('currentCity', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle()} />
            </div>

            {/* Relationship Status */}
            <div className="relative">
              <label htmlFor="tv-rel-status" className="block text-sm font-medium text-slate-300 mb-1.5">Relationship Status</label>
              <div className="relative">
                <select id="tv-rel-status" value={fields.relationshipStatus}
                  onChange={e => set('relationshipStatus', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none appearance-none pr-8" style={SELECT_STYLE}>
                  {RELATIONSHIP_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: '#0d1120', color: '#e2e8f0' }}>{o.label}</option>)}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▾</span>
              </div>
            </div>

            {/* Situation Note */}
            <div>
              <label htmlFor="tv-situation" className="block text-sm font-medium text-slate-300 mb-1.5">Tell Trikal what's on your mind</label>
              <div className="relative">
                <textarea id="tv-situation"
                  placeholder="e.g. Job switch kar raha hoon, property khareedna hai, relationship mein problem hai, karz se pareshan hoon..."
                  value={fields.situationNote}
                  onChange={e => set('situationNote', e.target.value.slice(0, 200))}
                  maxLength={200} rows={2}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle()} />
                <span className="absolute bottom-2 right-3 text-xs"
                  style={{ color: fields.situationNote.length >= 180 ? '#f59e0b' : '#475569' }}>
                  {fields.situationNote.length}/200
                </span>
              </div>
            </div>

            {/* Person 2 Section */}
            {isDualDomain && (
              <div className="mt-2 pt-5 border-t border-amber-400/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 rounded-full" style={{ background: GOLD }} />
                  <p className="font-semibold text-sm tracking-wider uppercase" style={{ color: GOLD }}>Person 2 Details</p>
                  <span className="text-xs text-slate-500">({selectedCategory?.id === 'genz_ex_back' ? 'Your Partner / Ex' : 'Your Boss / Colleague'})</span>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Their Name <span className="text-yellow-400">*</span></label>
                    <input type="text" placeholder="Enter their full name"
                      value={fields.person2Name} onChange={e => set('person2Name', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.person2Name)} />
                    {errors.person2Name && <p className="text-red-400 text-xs mt-1">{errors.person2Name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Their Mobile <span className="text-slate-500 text-xs ml-2">(for numerology)</span></label>
                    <div className="flex gap-2">
                      <CountrySelector id="tv-country2" value={fields.person2CountryCode}
                        onChange={(dial) => setFields(prev => ({ ...prev, person2CountryCode: dial }))} />
                      <input type="tel" placeholder="Their mobile number"
                        value={fields.person2Mobile} onChange={e => handleMobileChange(e.target.value, true)}
                        maxLength={12} className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle()} />
                    </div>
                  </div>
                  {numerology && (
                    <div className="rounded-xl p-4" style={{ background: `${numerology.color}15`, border: `1px solid ${numerology.color}40` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold" style={{ color: numerology.color }}>📱 Mobile Numerology Compatibility</p>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-white">{numerology.score}%</div>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${numerology.color}25`, color: numerology.color }}>{numerology.label}</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${numerology.score}%`, background: numerology.color }} />
                      </div>
                      <p className="text-xs text-slate-400">{numerology.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Their DOB <span className="text-yellow-400">*</span></label>
                      <input type="date" value={fields.person2Dob} onChange={e => set('person2Dob', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.person2Dob)} />
                      {errors.person2Dob && <p className="text-red-400 text-xs mt-1">{errors.person2Dob}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Their Birth Time</label>
                      <input type="time" value={fields.person2Tob} onChange={e => set('person2Tob', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle()} />
                    </div>
                  </div>
                  <CityInput
                    id="tv-place2"
                    label="Their Place of Birth"
                    required
                    value={fields.person2Place}
                    placeholder="Type their city..."
                    error={errors.person2Lat ? 'Please select their place' : undefined}
                    onSelect={(city, lat, lng) => {
                      setFields(prev => ({ ...prev, person2Place: city, person2City: city, person2Lat: lat, person2Lng: lng }))
                      setErrors(prev => ({ ...prev, person2Lat: undefined }))
                    }}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Their Current City</label>
                    <input type="text" placeholder="e.g. Bengaluru, Singapore..."
                      value={fields.person2CurrentCity} onChange={e => set('person2CurrentCity', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle()} />
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="px-4 py-4 rounded-xl text-center" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="animate-spin text-base">🔱</span>
                  <span className="text-sm font-medium" style={{ color: GOLD }}>{getSubmitLabel()}</span>
                </div>
                <div className="flex justify-center gap-1.5">
                  {LOADING_STEPS.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-500"
                      style={{ width: i === loadingStep ? '20px' : '6px', height: '6px', background: i <= loadingStep ? GOLD : GOLD_RGBA(0.2) }} />
                  ))}
                </div>
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              aria-label={predictionTier === 'paid' ? 'Pay 51 rupees with Razorpay for Deep Reading' : predictionTier === 'voice' ? 'Pay 11 rupees with Razorpay for Voice Reading' : 'Get free Vedic prediction'}
              className="w-full py-4 rounded-xl text-sm font-bold transition-all duration-300"
              style={{
                background: isLoading ? GOLD_RGBA(0.3) : predictionTier === 'voice' ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : predictionTier === 'paid' ? `linear-gradient(135deg,${GOLD} 0%,#F5D76E 50%,${GOLD} 100%)` : `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`,
                color: isLoading ? 'rgba(255,255,255,0.5)' : predictionTier === 'voice' ? '#fff' : '#080B12',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                boxShadow: isLoading ? 'none' : predictionTier === 'paid' ? `0 0 30px rgba(212,175,55,0.4)` : 'none',
              }}>
              {getSubmitLabel()}
            </button>

            {!isLoading && (
              <div style={{ textAlign: 'center' }}>
                {predictionTier === 'free'  && <p className="text-xs text-slate-600">🔒 Free forever · No card required · Instant results</p>}
                {predictionTier === 'paid'  && <p className="text-xs text-slate-600">🔒 ₹51 one-time · Secured by <span style={{color: RAZORPAY_BLUE, fontWeight: 700}}>Razorpay</span> · UPI / Cards / Wallets · Instant access</p>}
                {predictionTier === 'voice' && <p className="text-xs text-slate-600">🎙️ ₹11 one-time · Secured by <span style={{color: RAZORPAY_BLUE, fontWeight: 700}}>Razorpay</span> · 60-sec voice response</p>}
              </div>
            )}

            <p className="text-center text-xs text-slate-600">🔒 Your data is private and secure. Never shared. PCI-DSS compliant payments.</p>
          </form>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#334155', fontSize: '11px', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 12px' }}>
            Powered by <strong style={{ color: '#475569' }}>Swiss Ephemeris</strong> — the same engine used by professional astrologers worldwide.
            Validated against <strong style={{ color: '#475569' }}>BPHS</strong>, <strong style={{ color: '#475569' }}>Bhrigu Nandi Nadi</strong> and <strong style={{ color: '#475569' }}>Shadbala</strong>.
            Payments secured by <strong style={{ color: RAZORPAY_BLUE }}>Razorpay</strong>.
          </p>
          <div style={{ padding: '14px 20px', background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.15)}`, borderRadius: '12px', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 8px', color: GOLD, fontSize: '13px', fontWeight: 600 }}>🙏 Prediction ke baad — Maa Shakti ko Arzi karein</p>
            <p style={{ margin: '0 0 8px', color: '#475569', fontSize: '11px', lineHeight: 1.5 }}>Prediction milne ke baad aap Maa ko apni dil ki baat rakh sakte hain. Rohiit ji personally transmit karenge.</p>
            <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Maa%20ko%20Arzi%20karna%20chahta%20hoon.%20Jai%20Maa%20Shakti!"
              target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
              📱 WhatsApp karo Rohiit ji ko →
            </a>
          </div>
          <p style={{ color: '#1e293b', fontSize: '10px', margin: 0 }}>By Rohiit Gupta, Chief Vedic Architect · trikalvaani.com · Delhi NCR · 🔱 Mahakaal Ka Ashirwad</p>
        </div>
      </div>
    </section>
  )
}
