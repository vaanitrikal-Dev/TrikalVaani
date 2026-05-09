/**
 * TRIKAL VAANI — Google Maps API Proxy
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * File: app/api/maps-proxy/route.ts
 * VERSION: 1.2 — New Places API (POST) support added
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v1.2 CHANGES:
 *   ✅ POST method added — New Places API uses POST
 *   ✅ GET method kept — Geocoding, TimeZone, Reverse Geocode still use GET
 *   ✅ Key injected server-side for both methods
 *   ✅ Same security: only maps.googleapis.com allowed
 */

import { NextRequest, NextResponse } from 'next/server'

const MAPS_KEY = process.env.GOOGLE_MAPS_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''

const ALLOWED_HOSTS = ['maps.googleapis.com', 'places.googleapis.com']

// ── GET — Geocoding, TimeZone, Reverse Geocode ────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const encodedUrl = searchParams.get('url')

  if (!encodedUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  let targetUrl: string
  try {
    targetUrl = decodeURIComponent(encodedUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(targetUrl)
  } catch {
    return NextResponse.json({ error: 'Malformed URL' }, { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: 'Unauthorized host' }, { status: 403 })
  }

  // New Places API (places.googleapis.com) uses header-based key
  // Old Maps API (maps.googleapis.com) uses query param key
  const isNewPlacesApi = parsedUrl.hostname === 'places.googleapis.com'
  if (!isNewPlacesApi) {
    parsedUrl.searchParams.set('key', MAPS_KEY)
  }

  try {
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (isNewPlacesApi) {
      headers['X-Goog-Api-Key']   = MAPS_KEY
      headers['X-Goog-FieldMask'] = '*'
    }
    const res  = await fetch(parsedUrl.toString(), { headers })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[TV-MapsProxy] GET Error:', msg)
    return NextResponse.json({ error: 'Maps API call failed' }, { status: 500 })
  }
}

// ── POST — New Places API (Autocomplete, Place Details) ───────────────────────
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const encodedUrl = searchParams.get('url')

  if (!encodedUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  let targetUrl: string
  try {
    targetUrl = decodeURIComponent(encodedUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(targetUrl)
  } catch {
    return NextResponse.json({ error: 'Malformed URL' }, { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: 'Unauthorized host' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const res = await fetch(parsedUrl.toString(), {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'X-Goog-Api-Key': MAPS_KEY,
        // New Places API requires field mask
        'X-Goog-FieldMask': '*',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[TV-MapsProxy] POST Error:', msg)
    return NextResponse.json({ error: 'Maps API call failed' }, { status: 500 })
  }
}
