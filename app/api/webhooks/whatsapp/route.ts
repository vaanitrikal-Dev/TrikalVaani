/**
 * ============================================================
 * TRIKAL VAANI — WhatsApp Cloud API Webhook
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/webhooks/whatsapp/route.ts
 * VERSION: 2.0 — Phase 1 Meta Engine upgrade
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v2.0 vs v1.0:
 *   ✅ delivery_status now synced to wa_otp_sessions table
 *   ✅ 'delivered' status triggers wa_otp_sessions.delivery_status update
 *   ✅ Meta webhook signature verification (X-Hub-Signature-256)
 *   ✅ Structured logging with [WA-v2.0] prefix
 *   ✅ All v1.0 logic preserved:
 *      - GET verification handshake
 *      - Inbound message logging to wa_messages
 *      - OTP reply detection (6-digit code)
 *      - Delivery status logging to wa_delivery_logs
 *
 * IRON RULES:
 *   🔒 Never touch gemini-prompt.ts
 *   🔒 Full file replacements only
 *   🔒 Always return 200 to Meta — prevents aggressive retries
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import crypto                        from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERIFY_TOKEN  = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? process.env.NEXT_PUBLIC_WHATSAPP_VERIFY ?? ''
const APP_SECRET    = process.env.META_APP_SECRET ?? ''

// ── Webhook signature verification ───────────────────────────────────────────
function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!APP_SECRET || !signature) {
    // If no secret configured, skip (dev mode)
    console.warn('[WA-v2.0] META_APP_SECRET not set — skipping signature check')
    return true
  }
  const expected = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}

// ─── GET: Meta verification handshake ────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WA-v2.0] Meta verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  console.error('[WA-v2.0] Verification failed — token mismatch')
  return new NextResponse('Forbidden', { status: 403 })
}

// ─── POST: Incoming messages + delivery status ────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const rawBody  = await req.text()
    const signature = req.headers.get('x-hub-signature-256')

    // Signature verification
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('[WA-v2.0] Invalid webhook signature — rejecting')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = JSON.parse(rawBody)

    if (body.object !== 'whatsapp_business_account') {
      return new NextResponse('Not a WhatsApp event', { status: 400 })
    }

    const entry   = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value   = changes?.value

    if (!value) {
      return new NextResponse('OK', { status: 200 })
    }

    // ── 1. Incoming message from user ─────────────────────────────────────────
    if (value.messages?.length > 0) {
      const msg     = value.messages[0]
      const from    = msg.from
      const msgType = msg.type
      const msgId   = msg.id
      const ts      = msg.timestamp

      let msgText = ''
      if (msgType === 'text')   msgText = msg.text?.body   || ''
      if (msgType === 'button') msgText = msg.button?.text || ''

      console.log(`[WA-v2.0] Message from ${from}: "${msgText.slice(0, 50)}"`)

      // Log to wa_messages
      await supabase.from('wa_messages').insert({
        from_number:  from,
        message_id:   msgId,
        message_type: msgType,
        message_text: msgText,
        timestamp:    new Date(parseInt(ts) * 1000).toISOString(),
        raw_payload:  msg,
      })

      // ── OTP reply detection (user sends 6-digit code back) ──────────────────
      if (msgType === 'text' && /^\d{6}$/.test(msgText.trim())) {
        console.log(`[WA-v2.0] OTP reply received from ${from}`)
        await supabase
          .from('wa_otp_sessions')
          .update({
            status:          'received',
            received_at:     new Date().toISOString(),
            delivery_status: 'delivered', // If user replied, it was definitely delivered
          })
          .eq('phone', from)
          .eq('otp', msgText.trim())
          .eq('status', 'sent')
      }
    }

    // ── 2. Delivery + read status updates ─────────────────────────────────────
    if (value.statuses?.length > 0) {
      const status    = value.statuses[0]
      const msgId     = status.id
      const state     = status.status   // sent | delivered | read | failed
      const recipient = status.recipient_id
      const ts        = status.timestamp

      console.log(`[WA-v2.0] Status | ${msgId}: ${state} → ${recipient}`)

      // Log to wa_delivery_logs (unchanged from v1.0)
      await supabase.from('wa_delivery_logs').insert({
        message_id:    msgId,
        recipient:     recipient,
        status:        state,
        timestamp:     new Date(parseInt(ts) * 1000).toISOString(),
        error_code:    status.errors?.[0]?.code    || null,
        error_message: status.errors?.[0]?.message || null,
      })

      // ── NEW v2.0: Sync delivery_status to wa_otp_sessions ──────────────────
      // When Meta confirms 'delivered' or 'read', update the OTP session.
      // This is what the 15-second fallback check reads.
      if (state === 'delivered' || state === 'read') {
        const { error: updateErr } = await supabase
          .from('wa_otp_sessions')
          .update({ delivery_status: 'delivered' })
          .eq('phone', recipient)
          .eq('delivery_status', 'sent')  // Only update if still showing 'sent'
          .eq('status', 'sent')           // Only active sessions

        if (!updateErr) {
          console.log(`[WA-v2.0] ✅ delivery_status → delivered for ${recipient}`)
        }
      }

      // If failed, mark the session so fallback can trigger
      if (state === 'failed') {
        await supabase
          .from('wa_otp_sessions')
          .update({ delivery_status: 'failed' })
          .eq('phone', recipient)
          .eq('delivery_status', 'sent')
          .eq('status', 'sent')

        console.warn(`[WA-v2.0] ⚠️ Delivery failed for ${recipient} — fallback should trigger`)
      }
    }

    // Always return 200 to Meta — prevents aggressive retries
    return new NextResponse('OK', { status: 200 })

  } catch (err: any) {
    console.error('[WA-v2.0] Error:', err.message)
    // Still return 200 — never let Meta retry aggressively
    return new NextResponse('OK', { status: 200 })
  }
}
