/**
 * ============================================================
 * TRIKAAL VAANI — SEO Slug Generator
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/slug.ts
 * VERSION: 1.1 — IR-0 cleanup (no local signal in title)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v1.0 -> v1.1 CHANGES (CEO approved):
 *   - SEO <title> no longer ends with "| {City} | Trikaal Vaani".
 *     City (local-SEO signal) REMOVED from the visible title;
 *     replaced with "India & Global". Brand -> "Trikaal Vaani".
 *   - The slug FORMAT still keeps city (it is a URL token, not a
 *     visible local-business signal) — URLs stay stable, unchanged.
 *   - description text + canonical + domain trikalvaani.com: UNTOUCHED.
 *
 * FORMAT: [domain]-[mahadasha]-[antardasha]-[city]-[year]-[5char-uid]
 * EXAMPLE: career-rahu-saturn-delhi-2026-x7k2m
 *
 * SEO STRATEGY:
 *   - Domain keyword first (career, wealth, health...)
 *   - Planetary lords (Rahu, Saturn...) = searchable Vedic terms
 *   - City retained in URL slug for uniqueness (not a local signal)
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

  // ── v1.2 (06 Sep 2026) TITLE LENGTH + DOUBLE-BRAND FIX ──────────────────
  //
  // WHAT WAS WRONG
  //   v1.1 built: "<Domain> Prediction — <Maha>-<Antar> Dasha | India & Global
  //   | Trikaal Vaani" — 84 chars at its longest. app/layout.tsx line 47 sets
  //   title.template = "%s | Trikaal Vaani", so Next.js appended the brand a
  //   SECOND time and the rendered title reached 102 characters ending in
  //   "| Trikaal Vaani | Trikaal Vaani". Confirmed live on
  //   /report/property-saturn-ketu-new-2026-7x3v6, 06 Sep 2026.
  //   Google shows roughly 58, so a searcher saw only
  //   "Property & Real Estate Prediction — Saturn-Ketu D…" — no brand, no
  //   scope, and the duplicate never visible but still diluting the tag.
  //
  // WHAT CHANGED
  //   Dropped the two filler segments — the word "Prediction" (the page IS a
  //   prediction; saying so buys nothing) and "| India & Global" (a scope
  //   claim no one searches for). What remains is the domain and the dasha
  //   pair, which is what makes each report page distinct from the others.
  //
  //   The brand is then added ONLY IF IT FITS inside 58 characters. Per the
  //   site standard: keyword + differentiator win the 58 chars over
  //   "| Trikaal Vaani" (16 chars) when both cannot fit. The worst case
  //   ("Property & Real Estate" + a 13-char dasha pair) is 60 with the brand,
  //   so on those few the brand is dropped rather than the dasha.
  //
  //   The consumer (app/report/[slug]/page.tsx) now passes this through
  //   `title: { absolute: ... }`, which bypasses the root template so the
  //   string below is exactly what renders. Both halves of the fix are
  //   required — either one alone leaves the tag wrong.
  const TITLE_MAX = 58
  const BRAND     = ' | Trikaal Vaani'
  const titleCore = `${domainDisplay} — ${mahadasha}-${antardasha} Dasha`
  const title     = (titleCore.length + BRAND.length) <= TITLE_MAX
    ? titleCore + BRAND
    : titleCore

  // Meta: the standard is 140-155 chars with a clear CTA. v1.1 did a raw
  // slice(0,155) on the GEO answer, which cut mid-word and carried no CTA.
  // Now the cut lands on a word boundary and a short CTA is appended when
  // there is room for it.
  const CTA = ' Poori reading — ₹51.'
  const rawDesc = geoAnswer
    ? geoAnswer.trim()
    : `Vedic ${domainDisplay.toLowerCase()} prediction from your own chart — ${mahadasha} Mahadasha, ${antardasha} Antardasha, by Rohiit Gupta.`
  const budget  = 155 - CTA.length
  const clipped = rawDesc.length <= budget
    ? rawDesc
    : rawDesc.slice(0, budget).replace(/\s+\S*$/, '') + '…'
  const description = (clipped + CTA).slice(0, 155)

  const canonical = `https://trikalvaani.com/report/${slug}`

  return { title, description, canonical }
}

// ── Slug validator (for incoming requests) ────────────────────────────────────

export function isValidSlug(slug: string): boolean {
  // Allow only lowercase letters, numbers, hyphens
  // Min 10 chars, max 80 chars
  return /^[a-z0-9-]{10,80}$/.test(slug)
}
