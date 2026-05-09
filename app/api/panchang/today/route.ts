/**
 * ============================================================
 * TRIKAL VAANI — Panchang Today API Route
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/panchang/today/route.ts
 * VERSION: v1.0
 * Calls GCP VM → /panchang/today → returns IST panchang
 * ============================================================
 */

import { NextResponse } from 'next/server'

const VM_BASE = process.env.EPHE_API_URL ?? process.env.NEXT_PUBLIC_EPHE_API_URL ?? ''

export const revalidate = 3600 // ISR: cache 1 hour

export async function GET() {
  try {
    if (!VM_BASE) {
      return NextResponse.json(
        { error: 'VM endpoint not configured' },
        { status: 500 }
      )
    }

    const res = await fetch(`${VM_BASE}/panchang/today`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      throw new Error(`VM responded with ${res.status}`)
    }

    const data = await res.json()

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })

  } catch (err) {
    console.error('[TV-Panchang] Error fetching from VM:', err)
    return NextResponse.json(
      { error: 'Panchang fetch failed', detail: String(err) },
      { status: 500 }
    )
  }
}
