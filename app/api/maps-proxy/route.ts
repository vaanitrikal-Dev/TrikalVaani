/**
 * TRIKAL VAANI — Google Maps API Proxy
 * CEO: Rohiit Gupta
 * File: app/api/maps-proxy/route.ts
 * VERSION: 1.0
 *
 * Proxies Google Maps API calls server-side to:
 * 1. Keep API key secure (server-side only)
 * 2. Avoid CORS issues with direct browser calls
 * 3. Add rate limiting in future if needed
 */

import { NextRequest, NextResponse } from 'next/server'

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''

const ALLOWED_HOSTS = [
  'maps.googleapis.com',
]

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

  // Security: only allow Google Maps API calls
  let parsedUrl: URL
  try {
    parsedUrl = new URL(targetUrl)
  } catch {
    return NextResponse.json({ error: 'Malformed URL' }, { status: 400 })
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: 'Unauthorized host' }, { status: 403 })
  }

  // Replace key with server-side key if missing
  if (!parsedUrl.searchParams.has('key') || parsedUrl.searchParams.get('key') === '') {
    parsedUrl.searchParams.set('key', MAPS_KEY)
  }

  try {
    const res  = await fetch(parsedUrl.toString(), { headers: { 'Accept': 'application/json' } })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('[TV-MapsProxy] Error:', err.message)
    return NextResponse.json({ error: 'Maps API call failed' }, { status: 500 })
  }
}
