/**
 * ============================================================
 * TRIKAL VAANI — Google Indexing API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/google-indexing.ts
 * VERSION: 3.0 — Simplified, build-safe
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

export async function notifyGoogleIndexing(slug: string): Promise<boolean> {
  try {
    const key = process.env.GOOGLE_INDEXING_KEY
    if (!key) {
      console.log('[TV-Indexing] GOOGLE_INDEXING_KEY not set — skipping')
      return false
    }

    const url = `https://trikalvaani.com/report/${slug}`

    // Call our own API endpoint which handles the JWT signing server-side
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://trikalvaani.com'}/api/index-url`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url, slug }),
      signal:  AbortSignal.timeout(8000),
    })

    if (res.ok) {
      console.log(`[TV-Indexing] ✅ Queued for indexing: ${url}`)
      return true
    }

    console.warn(`[TV-Indexing] Queue failed: ${res.status}`)
    return false

  } catch (err) {
    console.warn('[TV-Indexing] Failed (non-fatal):', err)
    return false
  }
}
