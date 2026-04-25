/**
 * =============================================================
 *   TRIKAL VAANI — BirthForm Component
 *   File: components/BirthForm.tsx
 *   Author: Rohiit Gupta, Chief Vedic Architect
 *   Fix: All 11 htmlFor/id domain pairs corrected & aligned
 * =============================================================
 *
 *  FIELD ID REGISTRY (11 domains — all htmlFor ↔ id matched):
 *  ┌────┬──────────────────────────┬──────────────────────────┐
 *  │ #  │ htmlFor / id             │ Field                    │
 *  ├────┼──────────────────────────┼──────────────────────────┤
 *  │ 01 │ tv-name                  │ Full Name                │
 *  │ 02 │ tv-dob                   │ Date of Birth            │
 *  │ 03 │ tv-tob                   │ Time of Birth            │
 *  │ 04 │ tv-gender                │ Gender                   │
 *  │ 05 │ tv-place                 │ Place of Birth (search)  │
 *  │ 06 │ tv-city                  │ City (hidden resolved)   │
 *  │ 07 │ tv-latitude              │ Latitude                 │
 *  │ 08 │ tv-longitude             │ Longitude                │
 *  │ 09 │ tv-timezone              │ Timezone offset (UTC)    │
 *  │ 10 │ tv-ayanamsa              │ Ayanamsa                 │
 *  │ 11 │ tv-unknown-time          │ Unknown Time checkbox    │
 *  └────┴──────────────────────────┴──────────────────────────┘
 */

"use client"

import { useState, useCallback, useRef } from "react"
import { formToBirthInput, type BirthInput } from "@/lib/ephemeris"

// ── Types ──────────────────────────────────────────────────────────────────

export interface BirthFormFields {
  name: string
  dateOfBirth: string      // "YYYY-MM-DD"
  timeOfBirth: string      // "HH:MM"
  unknownTime: boolean
  gender: "male" | "female" | "other" | ""
  placeQuery: string       // user-facing search string
  city: string             // resolved city name
  latitude: number | ""
  longitude: number | ""
  timezoneOffset: number   // UTC offset, default 5.5 (IST)
  ayanamsa: BirthInput["ayanamsa"]
}

interface BirthFormProps {
  onSubmit: (input: BirthInput, meta: BirthFormFields) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
  className?: string
}

// ── Geo Search Helpers ─────────────────────────────────────────────────────

interface GeoResult {
  display_name: string
  lat: string
  lon: string
  address?: { city?: string; town?: string; village?: string; state?: string; country?: string }
}

async function searchPlace(query: string): Promise<GeoResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
  const res = await fetch(url, { headers: { "Accept-Language": "en" } })
  return res.ok ? res.json() : []
}

function offsetFromLon(lon: number): number {
  // Approximate UTC offset from longitude (±15° = 1 hour)
  return Math.round((lon / 15) * 2) / 2  // round to nearest 0.5
}

// ── Component ──────────────────────────────────────────────────────────────

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
  onSubmit,
  loading = false,
  submitLabel = "Calculate Chart",
  className = "",
}: BirthFormProps) {
  const [fields, setFields] = useState<BirthFormFields>(INITIAL_STATE)
  const [geoResults, setGeoResults] = useState<GeoResult[]>([])
  const [geoLoading, setGeoLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof BirthFormFields, string>>>({})
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Field Update ─────────────────────────────────────────────────────────

  const set = useCallback(<K extends keyof BirthFormFields>(key: K, value: BirthFormFields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  // ── Place Search ─────────────────────────────────────────────────────────

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
    setErrors(prev => ({ ...prev, placeQuery: undefined, latitude: undefined, longitude: undefined }))
  }

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: typeof errors = {}
    if (!fields.name.trim()) errs.name = "Name is required"
    if (!fields.dateOfBirth) errs.dateOfBirth = "Date of birth is required"
    if (!fields.unknownTime && !fields.timeOfBirth) errs.timeOfBirth = "Time of birth is required"
    if (fields.latitude === "" || fields.latitude === undefined) errs.latitude = "Place of birth is required"
    if (fields.longitude === "" || fields.longitude === undefined) errs.longitude = "Place of birth is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const input = formToBirthInput({
      dateOfBirth: fields.dateOfBirth,
      timeOfBirth: fields.unknownTime ? "12:00" : fields.timeOfBirth,
      latitude: fields.latitude as number,
      longitude: fields.longitude as number,
      timezoneOffset: fields.timezoneOffset,
      ayanamsa: fields.ayanamsa,
    })

    await onSubmit(input, fields)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`birth-form grid gap-5 ${className}`}
      aria-label="Birth details form"
    >
      {/* ── 01. Full Name ────────────────────────────────────────────── */}
      <div className="field-group">
        <label htmlFor="tv-name" className="field-label">
          Full Name <span aria-hidden>*</span>
        </label>
        <input
          id="tv-name"
          name="tv-name"
          type="text"
          autoComplete="name"
          placeholder="Enter your full name"
          value={fields.name}
          onChange={e => set("name", e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "tv-name-error" : undefined}
          className={`field-input ${errors.name ? "field-input--error" : ""}`}
        />
        {errors.name && (
          <span id="tv-name-error" role="alert" className="field-error">
            {errors.name}
          </span>
        )}
      </div>

      {/* ── 02. Date of Birth ────────────────────────────────────────── */}
      <div className="field-group">
        <label htmlFor="tv-dob" className="field-label">
          Date of Birth <span aria-hidden>*</span>
        </label>
        <input
          id="tv-dob"
          name="tv-dob"
          type="date"
          value={fields.dateOfBirth}
          onChange={e => set("dateOfBirth", e.target.value)}
          aria-required="true"
          aria-invalid={!!errors.dateOfBirth}
          aria-describedby={errors.dateOfBirth ? "tv-dob-error" : undefined}
          className={`field-input ${errors.dateOfBirth ? "field-input--error" : ""}`}
        />
        {errors.dateOfBirth && (
          <span id="tv-dob-error" role="alert" className="field-error">
            {errors.dateOfBirth}
          </span>
        )}
      </div>

      {/* ── 03. Time of Birth + 11. Unknown Time ─────────────────────── */}
      <div className="field-group">
        <div className="flex items-center justify-between">
          <label htmlFor="tv-tob" className="field-label">
            Time of Birth {!fields.unknownTime && <span aria-hidden>*</span>}
          </label>
          {/* ── 11. Unknown Time checkbox ─────────────────────────── */}
          <span className="flex items-center gap-1.5 text-sm">
            <input
              id="tv-unknown-time"
              name="tv-unknown-time"
              type="checkbox"
              checked={fields.unknownTime}
              onChange={e => set("unknownTime", e.target.checked)}
              className="checkbox"
              aria-describedby="tv-unknown-time-hint"
            />
            <label htmlFor="tv-unknown-time" className="cursor-pointer text-muted-foreground">
              Unknown
            </label>
          </span>
        </div>
        <span id="tv-unknown-time-hint" className="sr-only">
          Check if birth time is unknown — solar chart (12:00) will be used
        </span>
        <input
          id="tv-tob"
          name="tv-tob"
          type="time"
          value={fields.timeOfBirth}
          onChange={e => set("timeOfBirth", e.target.value)}
          disabled={fields.unknownTime}
          aria-required={!fields.unknownTime}
          aria-invalid={!!errors.timeOfBirth}
          aria-describedby={
            [errors.timeOfBirth ? "tv-tob-error" : "", fields.unknownTime ? "tv-unknown-time-hint" : ""]
              .filter(Boolean).join(" ") || undefined
          }
          className={`field-input ${errors.timeOfBirth ? "field-input--error" : ""} ${fields.unknownTime ? "opacity-40 cursor-not-allowed" : ""}`}
        />
        {fields.unknownTime && (
          <p className="text-xs text-muted-foreground mt-1">
            Solar chart will be cast (birth time set to 12:00)
          </p>
        )}
        {errors.timeOfBirth && (
          <span id="tv-tob-error" role="alert" className="field-error">
            {errors.timeOfBirth}
          </span>
        )}
      </div>

      {/* ── 04. Gender ───────────────────────────────────────────────── */}
      <div className="field-group">
        <label htmlFor="tv-gender" className="field-label">
          Gender
        </label>
        <select
          id="tv-gender"
          name="tv-gender"
          value={fields.gender}
          onChange={e => set("gender", e.target.value as BirthFormFields["gender"])}
          className="field-input"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other / Prefer not to say</option>
        </select>
      </div>

      {/* ── 05. Place of Birth ───────────────────────────────────────── */}
      <div className="field-group relative">
        <label htmlFor="tv-place" className="field-label">
          Place of Birth <span aria-hidden>*</span>
        </label>
        <div className="relative">
          <input
            id="tv-place"
            name="tv-place"
            type="search"
            autoComplete="off"
            placeholder="Type city name…"
            value={fields.placeQuery}
            onChange={e => handlePlaceChange(e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.placeQuery || !!errors.latitude}
            aria-describedby={errors.placeQuery ? "tv-place-error" : undefined}
            aria-autocomplete="list"
            aria-controls="tv-place-listbox"
            aria-expanded={geoResults.length > 0}
            role="combobox"
            className={`field-input pr-8 ${(errors.placeQuery || errors.latitude) ? "field-input--error" : ""}`}
          />
          {geoLoading && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" aria-live="polite">
              ⟳
            </span>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {geoResults.length > 0 && (
          <ul
            id="tv-place-listbox"
            role="listbox"
            className="absolute z-50 w-full bg-popover border border-border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto"
          >
            {geoResults.map((r, i) => (
              <li
                key={i}
                role="option"
                aria-selected={false}
                onClick={() => selectPlace(r)}
                onKeyDown={e => e.key === "Enter" && selectPlace(r)}
                tabIndex={0}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent truncate"
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}

        {(errors.placeQuery || errors.latitude) && (
          <span id="tv-place-error" role="alert" className="field-error">
            {errors.placeQuery || "Please select a place from suggestions"}
          </span>
        )}
      </div>

      {/* ── 06. City (resolved, read-only display) ───────────────────── */}
      {fields.city && (
        <input
          id="tv-city"
          name="tv-city"
          type="hidden"
          value={fields.city}
          aria-hidden="true"
          readOnly
        />
      )}

      {/* ── 07 & 08. Lat/Lon (resolved, read-only display) ───────────── */}
      {(fields.latitude !== "" || fields.longitude !== "") && (
        <div className="grid grid-cols-2 gap-3">
          <div className="field-group">
            <label htmlFor="tv-latitude" className="field-label text-xs text-muted-foreground">
              Latitude
            </label>
            <input
              id="tv-latitude"
              name="tv-latitude"
              type="number"
              step="0.0001"
              value={fields.latitude}
              onChange={e => set("latitude", parseFloat(e.target.value))}
              aria-label="Latitude coordinate"
              className="field-input text-sm font-mono"
              readOnly
            />
          </div>
          <div className="field-group">
            <label htmlFor="tv-longitude" className="field-label text-xs text-muted-foreground">
              Longitude
            </label>
            <input
              id="tv-longitude"
              name="tv-longitude"
              type="number"
              step="0.0001"
              value={fields.longitude}
              onChange={e => set("longitude", parseFloat(e.target.value))}
              aria-label="Longitude coordinate"
              className="field-input text-sm font-mono"
              readOnly
            />
          </div>
        </div>
      )}

      {/* ── 09. Timezone Offset ──────────────────────────────────────── */}
      <div className="field-group">
        <label htmlFor="tv-timezone" className="field-label">
          Time Zone (UTC offset)
        </label>
        <select
          id="tv-timezone"
          name="tv-timezone"
          value={fields.timezoneOffset}
          onChange={e => set("timezoneOffset", parseFloat(e.target.value))}
          className="field-input"
          aria-describedby="tv-timezone-hint"
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
          <option value={5.5}>IST +5:30</option>
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
        <span id="tv-timezone-hint" className="sr-only">
          Auto-filled from place selection. Adjust if needed.
        </span>
      </div>

      {/* ── 10. Ayanamsa ─────────────────────────────────────────────── */}
      <div className="field-group">
        <label htmlFor="tv-ayanamsa" className="field-label">
          Ayanamsa
        </label>
        <select
          id="tv-ayanamsa"
          name="tv-ayanamsa"
          value={fields.ayanamsa}
          onChange={e => set("ayanamsa", e.target.value as BirthInput["ayanamsa"])}
          className="field-input"
        >
          <option value="lahiri">Lahiri (Chitrapaksha) — Default</option>
          <option value="raman">B.V. Raman</option>
          <option value="krishnamurti">Krishnamurti (KP)</option>
          <option value="yukteshwar">Sri Yukteshwar</option>
        </select>
      </div>

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-base font-semibold"
        aria-busy={loading}
      >
        {loading ? "Calculating…" : submitLabel}
      </button>
    </form>
  )
}
