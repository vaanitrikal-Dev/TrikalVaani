/**
 * ============================================================
 * TRIKAL VAANI — Upgrade / Paid Unlock Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/upgrade/page.tsx
 * VERSION: 1.0 — NEW ROUTE
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * WHY THIS FILE EXISTS:
 *   Vercel runtime logs, 24h window ending 2026-09-05:
 *     /upgrade  ->  404  x222
 *   This route did not exist anywhere in the repo, and `git log --all`
 *   shows it was never created — it was not deleted, it was never built.
 *   Meanwhile SIX places link to it, all of them paid CTAs:
 *     components/result/ResultClient.tsx:899
 *       `/upgrade?from=${predictionId}&tier=basic`   "Poora Jawab Unlock — Rs.51"
 *     app/report/[slug]/ReportPublicClient.tsx:824, 837, 876, 1013, 1059
 *       `/upgrade?slug=${slug}&tier=basic`           "Get Full Reading — Rs.51"
 *   So every visitor who tried to BUY from a free report hit a 404.
 *
 * WHAT IT DOES:
 *   1. Reads ?from=<prediction uuid> OR ?slug=<public_slug>.
 *   2. Loads that prediction's stored birth_data + user_context from the
 *      `predictions` table (service-role, server-side only).
 *   3. Hands them to UpgradeClient, which runs the SAME payment path the
 *      home-page BirthForm already uses and which is already in production:
 *        POST /api/create-order   { tier: 'deep' }        -> Rs.51 order
 *        openRazorpayCheckout(...)                        -> Razorpay modal
 *        POST /api/verify-payment { razorpay_* }          -> HMAC check
 *        POST /api/predict        { predictionTier:'paid',
 *                                   paymentVerification } -> paid report
 *        router.push(`/report/${publicSlug}`)
 *      No new payment logic is invented. /api/predict re-verifies the
 *      Razorpay signature AND the amount server-side (route.ts:1171-1200),
 *      so a tampered client cannot mint a paid report.
 *
 * NOTE ON `tier=basic` IN THE EXISTING LINKS:
 *   'basic' is not a real tier. ALLOWED_AMOUNTS in app/api/create-order/
 *   route.ts only accepts 'deep' (5100 paise) and 'voice' (1100 paise).
 *   This page ignores the incoming ?tier value entirely and always buys
 *   'deep' at Rs.51, which is what all six CTAs advertise. The six link
 *   sites can be cleaned up later; leaving them as-is costs nothing now.
 *
 * NOTE ON maxDuration:
 *   Not set here. This page is a light DB read. The 300s budget lives on
 *   app/api/predict/route.ts (`export const maxDuration = 300`), which is
 *   the call that legitimately takes 90-120s, and is left untouched.
 *
 * IF THE PREDICTION CANNOT BE FOUND:
 *   The page still renders 200 with a friendly recovery screen and a link
 *   back to the birth form. It never calls notFound() — a 404 here is
 *   exactly the bug being fixed, and Google has already crawled /upgrade.
 * ============================================================
 */

import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import UpgradeClient from './UpgradeClient'

// This page depends on query params, so it must be dynamic. Declaring it
// explicitly prevents the "Page changed from static to dynamic at runtime"
// 500 that /learn/[slug] currently throws.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Unlock Your Full Reading — Rs.51 | Trikaal Vaani' },
  description:
    'Unlock the complete Vedic reading for your kundali — full planetary analysis, dated action windows, and a personalised remedy plan by Rohiit Gupta, Chief Vedic Architect.',
  alternates: { canonical: 'https://trikalvaani.com/upgrade' },
  // A checkout page has no business in the index.
  robots: { index: false, follow: true },
}

interface Props {
  searchParams: {
    from?: string
    slug?: string
    tier?: string
  }
}

export interface UpgradeSeed {
  personName: string
  domainId: string
  domainLabel: string
  birthData: Record<string, unknown> | null
  userContext: Record<string, unknown> | null
  alreadyPaid: boolean
  publicSlug: string | null
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function loadSeed(
  from?: string,
  slug?: string
): Promise<UpgradeSeed | null> {
  if (!from && !slug) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Narrow select on purpose. The prediction/prediction_json JSONB columns on
  // this table are large and are NOT needed to take a payment — pulling them
  // here would repeat the select('*') mistake that took Postgres down.
  const COLS =
    'person_name, domain_id, domain_label, birth_data, user_context, ' +
    'prediction_tier, payment_verified, public_slug'

  let query = supabase.from('predictions').select(COLS)

  if (from && UUID_RE.test(from)) {
    query = query.eq('id', from)
  } else if (slug) {
    query = query.eq('public_slug', slug)
  } else {
    // ?from= was present but is not a uuid — bad link, not a lookup.
    return null
  }

  const { data, error } = await query.limit(1).maybeSingle()

  if (error) {
    console.error('[TV-Upgrade] prediction lookup failed:', error.message)
    return null
  }
  if (!data) return null

  const row = data as unknown as Record<string, unknown>

  return {
    personName: (row.person_name as string) ?? '',
    domainId: (row.domain_id as string) ?? 'mill_karz_mukti',
    domainLabel: (row.domain_label as string) ?? 'General',
    birthData: (row.birth_data as Record<string, unknown>) ?? null,
    userContext: (row.user_context as Record<string, unknown>) ?? null,
    alreadyPaid:
      row.prediction_tier === 'paid' || row.payment_verified === true,
    publicSlug: (row.public_slug as string) ?? null,
  }
}

export default async function UpgradePage({ searchParams }: Props) {
  const seed = await loadSeed(searchParams?.from, searchParams?.slug)

  return <UpgradeClient seed={seed} />
}
