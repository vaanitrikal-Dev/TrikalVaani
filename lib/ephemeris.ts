/**
 * =============================================================
 *   TRIKAL VAANI — Ephemeris API Client
 *   File: lib/ephemeris.ts
 *   Author: Rohiit Gupta, Chief Vedic Architect
 *   Replaces: All Prokerala API usage
 *   Points to: Render FastAPI service
 * =============================================================
 */

const EPHE_BASE = process.env.NEXT_PUBLIC_EPHE_API_URL ?? process.env.EPHE_API_URL ?? ""
const EPHE_KEY  = process.env.EPHE_API_KEY ?? ""

// ── Types ──────────────────────────────────────────────────────────────────

export interface BirthInput {
  year: number
  month: number        // 1–12
  day: number          // 1–31
  hour: number         // 0–23
  minute: number       // 0–59
  second?: number
  latitude: number
  longitude: number
  timezone: number     // UTC offset, e.g. 5.5 for IST
  ayanamsa?: "lahiri" | "raman" | "krishnamurti" | "yukteshwar"
  house_system?: string
}

export interface GrahaData {
  planet: string
  longitude: number
  sign_index: number
  sign: string          // Hindi Rashi name
  sign_en: string       // English
  degree_in_sign: number
  nakshatra: string
  nakshatra_index: number
  nakshatra_lord: string
  pada: number
  retrograde: boolean
  sign_lord: string
  house: number
}

export interface BhavaData {
  bhava: number
  cusp_longitude: number
  sign: string
  sign_en: string
  sign_lord: string
}

export interface DashaEntry {
  planet: string
  start: string
  end: string
  years?: number
  is_current: boolean
  antar?: AntarEntry[]
}

export interface AntarEntry {
  planet: string
  start: string
  end: string
  is_current: boolean
  pratyantar?: PratyantarEntry[]
}

export interface PratyantarEntry {
  planet: string
  start: string
  end: string
  is_current: boolean
}

export interface KundaliResponse {
  meta: { ayanamsa: string; birth_jd: number }
  lagna: {
    longitude: number
    sign: string
    sign_en: string
    sign_lord: string
    degree_in_sign: number
    nakshatra: string
    pada: number
  }
  grahas: GrahaData[]
  bhavas: BhavaData[]
  dasha: { maha_dasha: DashaEntry[] }
  yogas: Array<{ name: string; present: boolean; description: string }>
}

export interface NakshatraResponse {
  nakshatra: string
  nakshatra_index: number
  pada: number
  lord: string
  gana: string
  rashi: string
  rashi_en: string
  rashi_lord: string
  moon_longitude: number
  element: string
}

export interface SadeSatiResponse {
  moon_rashi: string
  cycles: Array<{ start: string; end: string; type: string }>
  currently_in_sade_sati: boolean
  current_cycle: { start: string; end: string; type: string } | null
}

export interface ManglikResponse {
  mars_house: number
  mars_sign: string
  mars_longitude: number
  is_manglik: boolean
  severity: "None" | "Partial" | "High"
  cancellation_conditions: string[]
  manglik_houses_affected: number[]
}

export interface KundaliMatchingResponse {
  person1_moon: { nakshatra: string; rashi: string }
  person2_moon: { nakshatra: string; rashi: string }
  ashtakoot: Record<string, number>
  total_score: number
  max_score: 36
  compatibility_percent: number
  doshas: { nadi_dosha: boolean; bhakoot_dosha: boolean }
  verdict: string
}

export interface LagnaResponse {
  lagna: {
    longitude: number
    degree_in_sign: number
    sign: string
    sign_en: string
    sign_lord: string
    nakshatra: string
    pada: number
    element: string
    quality: string
  }
  chandra_lagna: { sign: string; sign_lord: string }
  surya_lagna: { sign: string; sign_lord: string }
}

export interface RashiResponse {
  rashi: string
  rashi_en: string
  rashi_index: number
  lord: string
  element: string
  quality: string
  moon_longitude: number
  moon_nakshatra: string
  moon_pada: number
  compatible_rashis: string[]
}

// ── Core Fetch ─────────────────────────────────────────────────────────────

async function ephePost<T>(endpoint: string, body: unknown): Promise<T> {
  if (!EPHE_BASE) {
    throw new Error("EPHE_API_URL environment variable not set")
  }

  const res = await fetch(`${EPHE_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(EPHE_KEY ? { "X-Api-Key": EPHE_KEY } : {}),
    },
    body: JSON.stringify(body),
    // Vercel edge: cache results for 1 hour (chart data is deterministic)
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(`Ephemeris API error [${res.status}]: ${err.detail ?? "Unknown error"}`)
  }

  return res.json() as Promise<T>
}

// ── Public API Functions ────────────────────────────────────────────────────

/** Full Vedic birth chart */
export const getKundali = (data: BirthInput) =>
  ephePost<KundaliResponse>("/kundali", data)

/** Kundali Gun Milan / Ashtakoot matching */
export const getKundaliMatching = (person1: BirthInput, person2: BirthInput) =>
  ephePost<KundaliMatchingResponse>("/kundali-matching", { person1, person2 })

/** Vimshottari Dasha sequence */
export const getDasha = (data: BirthInput) =>
  ephePost<{ maha_dasha: DashaEntry[] }>("/dasha", data)

/** Janma Nakshatra */
export const getNakshatra = (data: BirthInput) =>
  ephePost<NakshatraResponse>("/nakshatra", data)

/** Shani Sade Sati */
export const getSadeSati = (data: BirthInput) =>
  ephePost<SadeSatiResponse>("/sade-sati", data)

/** Manglik Dosha */
export const getManglikDosh = (data: BirthInput) =>
  ephePost<ManglikResponse>("/manglik-dosh", data)

/** Lagna (Ascendant) */
export const getLagna = (data: BirthInput) =>
  ephePost<LagnaResponse>("/lagna", data)

/** Janma Rashi (Moon sign) */
export const getRashi = (data: BirthInput) =>
  ephePost<RashiResponse>("/rashi", data)

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convert BirthForm field values to BirthInput.
 * Handles the timezone offset from IANA zone name if needed.
 */
export function formToBirthInput(fields: {
  dateOfBirth: string   // "YYYY-MM-DD"
  timeOfBirth: string   // "HH:MM" or "HH:MM:SS"
  latitude: number | string
  longitude: number | string
  timezoneOffset?: number   // UTC offset in hours — 5.5 for IST
  ayanamsa?: BirthInput["ayanamsa"]
}): BirthInput {
  const [year, month, day] = fields.dateOfBirth.split("-").map(Number)
  const timeParts = fields.timeOfBirth.split(":").map(Number)
  const [hour, minute, second = 0] = timeParts

  return {
    year, month, day,
    hour, minute, second,
    latitude: Number(fields.latitude),
    longitude: Number(fields.longitude),
    timezone: fields.timezoneOffset ?? 5.5,
    ayanamsa: fields.ayanamsa ?? "lahiri",
  }
}
