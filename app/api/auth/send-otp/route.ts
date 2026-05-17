/**
 * ============================================================
 * TRIKAL VAANI — Send WhatsApp OTP Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/auth/send-otp/route.ts
 * VERSION: 1.0 — Phase 1 Meta Engine
 *
 * FLOW:
 *   BirthForm mobile field → POST here → sendWhatsAppOTP()
 *   → Meta Cloud API v21.0 → trikal_login_otp template (₹0.11)
 *   → wa_otp_sessions saved → webhook updates delivery_status
 *   → 15-sec check → voice fallback if not delivered
 *
 * IRON RULES:
 *   🔒 Never touch gemini-prompt.ts
 *   🔒 Full file replacements only
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppOTP, checkOTPDelivery } from '@/lib/whatsapp'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone, sessionId, action } = body

    // ── INPUT VALIDATION ──────────────────────────────────────────────────────
    if (!phone || !sessionId) {
      return NextResponse.json(
        { error: 'phone and sessionId are required' },
        { status: 400 }
      )
    }

    // ── ACTION: check_delivery — called 15 seconds after send ─────────────────
    // BirthForm polls this to decide if voice fallback is needed
    if (action === 'check_delivery') {
      const status = await checkOTPDelivery(phone)
      return NextResponse.json({ delivered: status === 'delivered', status })
    }

    // ── ACTION: send (default) ────────────────────────────────────────────────
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      undefined

    const result = await sendWhatsAppOTP(phone, sessionId, clientIp)

    if (!result.success) {
      // Rate limited — specific response so BirthForm shows correct message
      if (result.rateLimited) {
        return NextResponse.json(
          { error: result.error, rateLimited: true },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: result.error ?? 'Failed to send OTP' },
        { status: 500 }
      )
    }

    console.log(`[send-otp] ✅ OTP sent | phone:${phone} | session:${sessionId}`)

    return NextResponse.json({
      success:   true,
      requestId: result.requestId,
      message:   'OTP sent to your WhatsApp number',
      expiresIn: 300, // 5 minutes in seconds
    })

  } catch (err: any) {
    console.error('[send-otp] Unexpected error:', err.message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
