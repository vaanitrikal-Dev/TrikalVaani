/**
 * ============================================================
 * TRIKAL VAANI — BirthForm Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/landing/BirthForm.tsx
 * VERSION: 5.2 — Fixed timezone auto-detection for India (IST +5:30)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

"use client"

import { useState, useCallback, useRef } from "react"
import { getOrCreateSessionId } from "@/lib/supabase"

export interface BirthFormFields {
  name: string
  dateOfBirth: string
  timeOfBirth: string
  unknownTime: boolean
  gender: "male" | "female" | "other" | ""
  placeQuery: string
  city: string
  latitude: number | ""
  longitude: number | ""
  timezoneOffset: number
  ayanamsa: "lahiri" | "raman" | "krishnamurti" | "yukteshwar"
}

interface SelectedCategory {
  id: string
  label: string
  color: string
}

interface BirthFormProps {
  selectedCategory?: SelectedCategory | null
  onSubmit?: (fields: BirthFormFields) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
  className?: string
}

interface GeoResult {
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
}

async function searchPlace(query: string): Promise<GeoResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
  const res = await fetch(url, { headers: { "Accept-Language": "en" } })
  return res.ok ? res.json() : []
}

function offsetFromLon(lon: number): number {
  // India longitude range 68–97 → always IST +5:30
  if (lon >= 68 && lon <= 97) return 5.5;
  // Nepal
  if (lon >= 80 && lon <= 88) return 5.75;
  return Math.round((lon / 15) * 2) / 2;
}

const INITIAL_STATE: BirthFormFields = {
  name: "",
  dateOfBirth: "",
  timeOfBirth: "12:00",
  unknownTime: false,
  gender: "",
  placeQuery: "",
  city: "",
  latitude: "",
  longitude: "",
  timezoneOffset: 5.5,
  ayanamsa: "lahiri",
}

export default function BirthForm({
  selectedCategory,
  onSubmit,
  loading = false,
  submitLabel = "Calculate My Chart",
  className = "",
}: BirthFormProps) {
  const [fields, setFields] = useState<BirthFormFields>(INITIAL_STATE)
  const [geoResults, setGeoResults] = useState<GeoResult[]>([])
  const [geoLoading, setGeoLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof BirthFormFields, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = useCallback(<K extends keyof BirthFormFields>(
    key: K,
    value: BirthFormFields[K]
  ) => {
    setFields(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  const handlePlaceChange = (query: string) => {
    set("placeQuery", query)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 3) { setGeoResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setGeoLoading(true)
      const results = await searchPlace(query)
      setGeoResults(results)
      setGeoLoading(false)
    }, 400)
  }

  const selectPlace = (result: GeoResult) => {
    const lat = parseFloat(result.lat)
    const lon = parseFloat(result.lon)
    const cityName =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.display_name.split(",")[0]
    setFields(prev => ({
      ...prev,
      placeQuery: result.display_name,
      city: cityName,
      latitude: lat,
      longitude: lon,
      timezoneOffset: offsetFromLon(lon),
    }))
    setGeoResults([])
    setErrors(prev => ({ ...prev, placeQuery: undefined, latitude: undefined }))
  }

  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!fields.name.trim()) errs.name = "Name is required"
    if (!fields.dateOfBirth) errs.dateOfBirth = "Date of birth is required"
    if (!fields.unknownTime && !fields.timeOfBirth) errs.timeOfBirth = "Time of birth is required"
    if (fields.latitude === "") errs.latitude = "Place of birth is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      const sessionId = getOrCreateSessionId()

      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          domainId:    selectedCategory?.id || "mill_karz_mukti",
          domainLabel: selectedCategory?.label || "General",
          birthData: {
            name:     fields.name,
            dob:      fields.dateOfBirth,
            tob:      fields.unknownTime ? "12:00" : fields.timeOfBirth,
            lat:      fields.latitude as number,
            lng:      fields.longitude as number,
            cityName: fields.city,
            timezone: fields.timezoneOffset,
          },
          userContext: {
            segment:    "millennial",
            employment: "professional",
            sector:     "general",
            language:   "hinglish",
            city:       fields.city,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setApiError(data.error || "Something went wrong. Please try again.")
        return
      }

      if (onSubmit) await onSubmit(fields)

      // ── predictionId now comes from server (Supabase saved server-side) ──
      const predictionId: string | null = data._meta?.predictionId ?? null

      // ── Store in sessionStorage as fallback ──────────────────────────────
      const payload = {
        id:           predictionId ?? "inline",
        person_name:  fields.name,
        dob:          fields.dateOfBirth,
        birth_city:   fields.city,
        birth_time:   fields.timeOfBirth,
        domain_id:    data._meta?.domainId ?? selectedCategory?.id ?? "general",
        domain_label: selectedCategory?.label ?? "",
        tier:         data._meta?.tier ?? "free",
        prediction:   data,
      }
      try {
        sessionStorage.setItem('tv_last_prediction', JSON.stringify(payload))
      } catch { /* storage full */ }

      // ── Redirect ──────────────────────────────────────────────────────────
      if (predictionId) {
        window.location.href = `/result?predictionId=${predictionId}&sessionId=${sessionId}`
      } else {
        window.location.href = `/result?inline=1&sessionId=${sessionId}`
      }

    } catch {
      setApiError("Network error. Please check your connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = loading || isSubmitting

  return (
    <section id="birth-form" className={`py-16 px-4 ${className}`}>
      <div className="max-w-2xl mx-auto">

        {selectedCategory && (
          <div className="mb-6 text-center">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-2"
              style={{
                background: `${selectedCategory.color}20`,
                color: selectedCategory.color,
                border: `1px solid ${selectedCategory.color}40`,
              }}
            >
              {selectedCategory.label}
            </span>
            <p className="text-slate-400 text-sm">Enter your birth details for a personalized reading</p>
          </div>
        )}

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "rgba(13,17,30,0.8)",
            border: "1px solid rgba(212,175,55,0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate className="grid gap-5">

            {/* Name */}
            <div>
              <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-yellow-400">*</span>
              </label>
              <input
                id="tv-name"
                type="text"
                placeholder="Enter your full name"
                value={fields.name}
                onChange={e => set("name", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: errors.name ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                }}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">
                Date of Birth <span className="text-yellow-400">*</span>
              </label>
              <input
                id="tv-dob"
                type="date"
                value={fields.dateOfBirth}
                onChange={e => set("dateOfBirth", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: errors.dateOfBirth ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  colorScheme: "dark",
                }}
              />
              {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>

            {/* Time of Birth */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="tv-tob" className="text-sm font-medium text-slate-300">
                  Time of Birth {!fields.unknownTime && <span className="text-yellow-400">*</span>}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                  <input
                    id="tv-unknown-time"
                    type="checkbox"
                    checked={fields.unknownTime}
                    onChange={e => set("unknownTime", e.target.checked)}
                    className="rounded"
                  />
                  Unknown time
                </label>
              </div>
              <input
                id="tv-tob"
                type="time"
                value={fields.timeOfBirth}
                onChange={e => set("timeOfBirth", e.target.value)}
                disabled={fields.unknownTime}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: errors.timeOfBirth ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  opacity: fields.unknownTime ? 0.4 : 1,
                  colorScheme: "dark",
                }}
              />
              {fields.unknownTime && (
                <p className="text-slate-500 text-xs mt-1">Solar chart will be used (12:00 noon)</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="tv-gender" className="block text-sm font-medium text-slate-300 mb-1.5">
                Gender
              </label>
              <select
                id="tv-gender"
                value={fields.gender}
                onChange={e => set("gender", e.target.value as BirthFormFields["gender"])}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  colorScheme: "dark",
                }}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>

            {/* Place of Birth */}
            <div className="relative">
              <label htmlFor="tv-place" className="block text-sm font-medium text-slate-300 mb-1.5">
                Place of Birth <span className="text-yellow-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="tv-place"
                  type="search"
                  autoComplete="off"
                  placeholder="Type city name…"
                  value={fields.placeQuery}
                  onChange={e => handlePlaceChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none pr-8"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: errors.latitude ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                {geoLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">⟳</span>
                )}
              </div>
              {geoResults.length > 0 && (
                <ul
                  className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
                  style={{ background: "#1a1f2e", border: "1px solid rgba(212,175,55,0.2)" }}
                >
                  {geoResults.map((r, i) => (
                    <li
                      key={i}
                      onClick={() => selectPlace(r)}
                      className="px-4 py-2.5 text-sm text-slate-300 cursor-pointer hover:bg-yellow-400/10 truncate"
                    >
                      {r.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {errors.latitude && <p className="text-red-400 text-xs mt-1">Please select a place from suggestions</p>}
            </div>

            {/* Lat/Lon */}
            {fields.latitude !== "" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Latitude</label>
                  <input
                    id="tv-latitude" type="text" value={fields.latitude} readOnly
                    className="w-full px-3 py-2 rounded-lg text-slate-400 text-xs font-mono"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Longitude</label>
                  <input
                    id="tv-longitude" type="text" value={fields.longitude} readOnly
                    className="w-full px-3 py-2 rounded-lg text-slate-400 text-xs font-mono"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  />
                </div>
              </div>
            )}

            {/* Timezone */}
            <div>
              <label htmlFor="tv-timezone" className="block text-sm font-medium text-slate-300 mb-1.5">
                Time Zone
              </label>
              <select
                id="tv-timezone"
                value={fields.timezoneOffset}
                onChange={e => set("timezoneOffset", parseFloat(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", colorScheme: "dark" }}
              >
                <option value={5.5}>IST +5:30 (India)</option>
                <option value={0}>UTC +0:00</option>
                <option value={1}>CET +1:00</option>
                <option value={2}>EET +2:00</option>
                <option value={3}>MSK +3:00</option>
                <option value={3.5}>IRST +3:30</option>
                <option value={4}>GST +4:00</option>
                <option value={4.5}>AFT +4:30</option>
                <option value={5}>PKT +5:00</option>
                <option value={5.75}>NPT +5:45</option>
                <option value={6}>BST +6:00</option>
                <option value={6.5}>MMT +6:30</option>
                <option value={7}>ICT +7:00</option>
                <option value={8}>SGT +8:00</option>
                <option value={9}>JST +9:00</option>
                <option value={9.5}>ACST +9:30</option>
                <option value={10}>AEST +10:00</option>
                <option value={-5}>EST -5:00</option>
                <option value={-6}>CST -6:00</option>
                <option value={-7}>MST -7:00</option>
                <option value={-8}>PST -8:00</option>
              </select>
            </div>

            <input type="hidden" id="tv-ayanamsa" value="lahiri" />

            {apiError && (
              <div className="px-4 py-3 rounded-lg text-sm text-red-300"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: isLoading
                  ? "rgba(212,175,55,0.3)"
                  : "linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)",
                color: isLoading ? "rgba(255,255,255,0.5)" : "#080B12",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Calculating your chart…" : submitLabel}
            </button>

          </form>
        </div>
      </div>
    </section>
  )
}
