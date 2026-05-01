/**
 * ============================================================
 * TRIKAL VAANI — SEO Slug Generator
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/slug.ts
 * VERSION: 1.0 — SEO-friendly prediction URL slugs
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FORMAT: [domain]-[mahadasha]-[antardasha]-[city]-[5char-uid]
 * EXAMPLE: career-rahu-saturn-delhi-x7k2m
 *
 * SEO STRATEGY:
 *   - Domain keyword first (career, wealth, health...)
 *   - Planetary lords (Rahu, Saturn...) = searchable Vedic terms
 *   - City = local SEO signal
 *   - 5-char uid = uniqueness guarantee
 * ============================================================
 */

// ── Domain → SEO label mapping ────────────────────────────────────────────────

const DOMAIN_SLUG_MAP: Record<string, string> = {
  mill_karz_mukti:        'wealth-debt',
  mill_property_yog:      'property',
  mill_childs_destiny:    'child-destiny',
  mill_parents_wellness:  'family-health',
  genz_dream_career:      'career',
  genz_ex_back:           'relationship',
  genz_toxic_boss:        'workplace',
  genz_manifestation:     'manifestation',
  genx_retirement_peace:  'retirement',
  genx_legacy_inheritance:'legacy',
  genx_spiritual_innings: 'spirituality',
}

// ── Planet name normalizer ────────────────────────────────────────────────────

const PLANET_SLUG: Record<string, string> = {
  Sun:     'sun',
  Moon:    'moon',
  Mars:    'mars',
  Mercury: 'mercury',
  Jupiter: 'jupiter',
  Venus:   'venus',
  Saturn:  'saturn',
  Rahu:    'rahu',
  Ketu:    'ketu',
}

// ── City normalizer ───────────────────────────────────────────────────────────

function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 1)          // take first word only (Delhi, Mumbai, Gurugram)
    .join('')
    .slice(0, 12)         // max 12 chars
    || 'india'
}

// ── 5-character unique suffix ─────────────────────────────────────────────────

function generateUid(length = 5): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789' // no confusing chars (0,o,1,l,i)
  let uid = ''
  for (let i = 0; i < length; i++) {
    uid += chars[Math.floor(Math.random() * chars.length)]
  }
  return uid
}

// ── Main slug generator ───────────────────────────────────────────────────────

export interface SlugInput {
  domainId:   string
  mahadasha:  string
  antardasha: string
  city:       string
  year?:      number
}

export function generatePredictionSlug(input: SlugInput): string {
  const domain     = DOMAIN_SLUG_MAP[input.domainId] ?? 'astrology'
  const mahadasha  = PLANET_SLUG[input.mahadasha]    ?? input.mahadasha.toLowerCase()
  const antardasha = PLANET_SLUG[input.antardasha]   ?? input.antardasha.toLowerCase()
  const city       = normalizeCity(input.city)
  const year       = input.year ?? new Date().getFullYear()
  const uid        = generateUid(5)

  // FORMAT: career-rahu-saturn-delhi-2026-x7k2m
  return `${domain}-${mahadasha}-${antardasha}-${city}-${year}-${uid}`
}

// ── SEO metadata generator ────────────────────────────────────────────────────

export interface SeoMeta {
  title:       string
  description: string
  canonical:   string
}

const DOMAIN_DISPLAY: Record<string, string> = {
  'career':       'Career & Profession',
  'wealth-debt':  'Wealth & Debt Relief',
  'property':     'Property & Real Estate',
  'relationship': 'Love & Relationships',
  'workplace':    'Workplace & Career',
  'child-destiny':'Child Destiny',
  'family-health':'Family Health',
  'manifestation':'Manifestation',
  'retirement':   'Retirement & Peace',
  'legacy':       'Legacy & Inheritance',
  'spirituality': 'Spiritual Path',
}

export function generateSeoMeta(
  slug:       string,
  domainId:   string,
  mahadasha:  string,
  antardasha: string,
  city:       string,
  geoAnswer?: string,
): SeoMeta {
  const domainSlug    = DOMAIN_SLUG_MAP[domainId] ?? 'astrology'
  const domainDisplay = DOMAIN_DISPLAY[domainSlug] ?? 'Vedic Astrology'
  const cityDisplay   = city.split(',')[0]?.trim() ?? 'India'

  const title = `${domainDisplay} Prediction — ${mahadasha}-${antardasha} Dasha | ${cityDisplay} | Trikal Vaani`

  const description = geoAnswer
    ? geoAnswer.slice(0, 155)
    : `Vedic astrology ${domainDisplay.toLowerCase()} prediction for ${cityDisplay}. ${mahadasha} Mahadasha, ${antardasha} Antardasha analysis by Rohiit Gupta, Chief Vedic Architect. Powered by Swiss Ephemeris.`

  const canonical = `https://trikalvaani.com/report/${slug}`

  return { title, description, canonical }
}

// ── Slug validator (for incoming requests) ────────────────────────────────────

export function isValidSlug(slug: string): boolean {
  // Allow only lowercase letters, numbers, hyphens
  // Min 10 chars, max 80 chars
  return /^[a-z0-9-]{10,80}$/.test(slug)
}

