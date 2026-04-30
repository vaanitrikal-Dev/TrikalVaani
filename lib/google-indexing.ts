/**
 * ============================================================
 * TRIKAL VAANI — Google Indexing API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/google-indexing.ts
 * VERSION: 2.0 — Fixed TypeScript/Next.js compatibility
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

const GOOGLE_INDEXING_KEY = process.env.GOOGLE_INDEXING_KEY ?? ''
const INDEXING_API_URL    = 'https://indexing.googleapis.com/v3/urlNotifications:publish'

function base64url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function getGoogleToken(): Promise<string | null> {
  if (!GOOGLE_INDEXING_KEY) return null

  try {
    const key = JSON.parse(GOOGLE_INDEXING_KEY) as {
      client_email: string
      private_key:  string
    }

    const now   = Math.floor(Date.now() / 1000)
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const claim  = base64url(JSON.stringify({
      iss:   key.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud:   'https://oauth2.googleapis.com/token',
      exp:   now + 3600,
      iat:   now,
    }))

    const sigInput = `${header}.${claim}`

    // Dynamic import — server only
    const crypto   = await import('node:crypto')
    const sign     = crypto.createSign('RSA-SHA256')
    sign.update(sigInput)
    const signature = sign
      .sign(key.private_key)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    const jwt = `${sigInput}.${signature}`

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion:  jwt,
      }),
    })

    const data = await res.json() as { access_token?: string }
    return data.access_token ?? null

  } catch (err) {
    console.warn('[TV-Indexing] Token error:', err)
    return null
  }
}

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
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body:   JSON.stringify({ url, type: 'URL_UPDATED' }),
      signal: AbortSignal.timeout(10000),
    })

    if (res.ok) {
      console.log(`[TV-Indexing] ✅ Notified Google: ${url}`)
      return true
    }

    const errBody = await res.json().catch(() => ({})) as Record<string, unknown>
    console.warn(`[TV-Indexing] Google ${res.status}:`, JSON.stringify(errBody).slice(0, 200))
    return false

  } catch (err) {
    console.warn('[TV-Indexing] Failed (non-fatal):', err)
    return false
  }
}
