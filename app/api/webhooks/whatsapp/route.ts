// app/api/webhooks/whatsapp/route.ts
// Trikal Vaani — WhatsApp Cloud API Webhook v1.0
// Place at: app/api/webhooks/whatsapp/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!

// ─── GET: Meta verification handshake ───────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WA Webhook] Meta verification successful')
    return new NextResponse(challenge, { status: 200 })
  }

  console.error('[WA Webhook] Verification failed — token mismatch')
  return new NextResponse('Forbidden', { status: 403 })
}

// ─── POST: Incoming messages + delivery status ───────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Safety check
    if (body.object !== 'whatsapp_business_account') {
      return new NextResponse('Not a WhatsApp event', { status: 400 })
    }

    const entry   = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value   = changes?.value

    if (!value) {
      return new NextResponse('OK', { status: 200 })
    }

    // ── 1. Incoming message from user ────────────────────────────────────────
    if (value.messages?.length > 0) {
      const msg     = value.messages[0]
      const from    = msg.from         // user WhatsApp number e.g. 919XXXXXXXXX
      const msgType = msg.type         // text | button | interactive
      const msgId   = msg.id
      const ts      = msg.timestamp

      let msgText = ''
      if (msgType === 'text')   msgText = msg.text?.body   || ''
      if (msgType === 'button') msgText = msg.button?.text || ''

      console.log(`[WA Webhook] Message from ${from}: ${msgText}`)

      // Log to Supabase wa_messages table
      await supabase.from('wa_messages').insert({
        from_number : from,
        message_id  : msgId,
        message_type: msgType,
        message_text: msgText,
        timestamp   : new Date(parseInt(ts) * 1000).toISOString(),
        raw_payload : msg,
      })

      // ── OTP reply detection (user sends 6-digit code back) ─────────────────
      if (msgType === 'text' && /^\d{6}$/.test(msgText.trim())) {
        console.log(`[WA Webhook] OTP received from ${from}: ${msgText}`)
        await supabase
          .from('wa_otp_sessions')
          .update({
            status     : 'received',
            received_at: new Date().toISOString(),
          })
          .eq('phone', from)
          .eq('otp', msgText.trim())
          .eq('status', 'sent')
      }
    }

    // ── 2. Delivery + read status updates ────────────────────────────────────
    if (value.statuses?.length > 0) {
      const status    = value.statuses[0]
      const msgId     = status.id
      const state     = status.status   // sent | delivered | read | failed
      const recipient = status.recipient_id

      console.log(`[WA Webhook] ${msgId}: ${state} → ${recipient}`)

      await supabase.from('wa_delivery_logs').insert({
        message_id   : msgId,
        recipient    : recipient,
        status       : state,
        timestamp    : new Date(parseInt(status.timestamp) * 1000).toISOString(),
        error_code   : status.errors?.[0]?.code    || null,
        error_message: status.errors?.[0]?.message || null,
      })
    }

    // Always return 200 to Meta — prevents aggressive retries
    return new NextResponse('OK', { status: 200 })

  } catch (err) {
    console.error('[WA Webhook] Error:', err)
    return new NextResponse('OK', { status: 200 })
  }
}
