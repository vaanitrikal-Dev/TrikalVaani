/**
 * ============================================================
 * TRIKAL VAANI — Google Indexing API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/google-indexing.ts
 * VERSION: 1.0 — Auto-notify Google on every new report
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Every time a new prediction is saved, notify Google Indexing API
 *   so Google crawls the new /report/[slug] page within minutes.
 *   Without this, Google may take weeks to find new pages.
 *
 * SETUP REQUIRED (one-time):
 *   1. Google Search Console → Settings → Ownership verification
 *   2. Google Cloud Console → Create Service Account
 *   3. Enable "Web Search Indexing API"
 *   4. Download JSON key → add to Vercel env as GOOGLE_INDEXING_KEY
 * ============================================================
 */

const GOOGLE_INDEXING_KEY = process.env.GOOGLE_INDEXING_KEY ?? ''
const INDEXING_API_URL    = 'https://indexing.googleapis.com/v3/urlNotifications:publish'

// ── Get Google OAuth token ────────────────────────────────────────────────────

async function getGoogleToken(): Promise<string | null> {
  if (!GOOGLE_INDEXING_KEY) return null

  try {
    const key = JSON.parse(GOOGLE_INDEXING_KEY)

    // Build JWT for Google OAuth
    const now    = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const claim  = {
      iss:   key.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud:   'https://oauth2.googleapis.com/token',
      exp:   now + 3600,
      iat:   now,
    }

    const encode = (obj: object) =>
      Buffer.from(JSON.stringify(obj)).toString('base64url')

    const headerB64  = encode(header)
    const claimB64   = encode(claim)
    const sigInput   = `${headerB64}.${claimB64}`

    // Sign with private key (Node.js crypto)
    const { createSign } = await import('crypto')
    const sign = createSign('RSA-SHA256')
    sign.update(sigInput)
    const signature = sign.sign(key.private_key, 'base64url')

    const jwt = `${sigInput}.${signature}`

    // Exchange JWT for access token
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion:  jwt,
      }),
    })

    const data = await res.json()
    return data.access_token ?? null

  } catch (err) {
    console.warn('[TV-Indexing] Token error:', err)
    return null
  }
}

// ── Notify Google ─────────────────────────────────────────────────────────────

export async function notifyGoogleIndexing(slug: string): Promise<boolean> {
  if (!GOOGLE_INDEXING_KEY) {
    console.log('[TV-Indexing] GOOGLE_INDEXING_KEY not set — skipping')
    return false
  }

  const url = `https://trikalvaani.com/report/${slug}`

  try {
    const token = await getGoogleToken()
    if (!token) return false

    const res = await fetch(INDEXING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        type: 'URL_UPDATED',
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (res.ok) {
      console.log(`[TV-Indexing] ✅ Notified Google: ${url}`)
      return true
    } else {
      const err = await res.json().catch(() => ({}))
      console.warn(`[TV-Indexing] Google ${res.status}:`, JSON.stringify(err).slice(0, 200))
      return false
    }

  } catch (err) {
    console.warn('[TV-Indexing] Failed (non-fatal):', err)
    return false
  }
}
