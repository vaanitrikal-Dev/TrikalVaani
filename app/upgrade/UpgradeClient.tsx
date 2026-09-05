'use client'

/**
 * ============================================================
 * TRIKAL VAANI — Upgrade Client (Rs.51 Deep Reading unlock)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/upgrade/UpgradeClient.tsx
 * VERSION: 1.0 — NEW
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Runs the EXACT payment sequence already proven in
 * components/landing/BirthForm.tsx -> handleRazorpayPayment():
 *   loadRazorpayScript()
 *   POST /api/create-order   { tier: 'deep' }
 *   openRazorpayCheckout(...)
 *   POST /api/verify-payment { razorpay_order_id, _payment_id, _signature }
 *   POST /api/predict        { predictionTier:'paid', paymentVerification, ... }
 *   router.push('/report/<publicSlug>')
 *
 * The birthData / userContext posted to /api/predict are the ones already
 * stored on the original prediction row, so the paid reading is generated
 * for the same person and the same question — the visitor does not retype
 * anything.
 *
 * The Rs.51 (5100 paise) amount is NOT chosen here. /api/create-order sets
 * it from ALLOWED_AMOUNTS['deep'] server-side, and /api/predict re-checks it
 * against ALLOWED_PAID_AMOUNTS['paid'] plus an HMAC signature check before
 * spending a single Gemini call. This component only relays.
 * ============================================================
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay-helper'
import type { UpgradeSeed } from './page'

const GOLD = '#D4AF37'

/* Same cadence as PAYMENT_LOADING_STEPS in BirthForm — the paid Gemini Pro
   call genuinely runs 90-120s, so the user needs something to read. */
const STEPS = [
  'Payment verified — Trikaal aapki kundali khol rahe hain...',
  'Grah sthiti aur Shadbala calculate ho rahi hai...',
  'Bhrigu patterns aur dasha windows mila rahe hain...',
  'Aapka poora vishleshan likha ja raha hai...',
  'Remedy plan aur muhurta taiyaar ho raha hai...',
  'Bas thoda aur — report final ho rahi hai...',
]

function generateSessionId(): string {
  return `tv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

const BENEFITS = [
  'Complete planetary analysis',
  '3 action windows with dates',
  'Full remedy plan (dana + vrat)',
  'Panchang muhurta guidance',
  'Bhrigu pattern insights',
  '800-1200 word deep reading',
]

export default function UpgradeClient({ seed }: { seed: UpgradeSeed | null }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [working, setWorking] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)

  /* ── Recovery screen: bad or missing link ─────────────────── */
  if (!seed || !seed.birthData) {
    return (
      <Shell>
        <h1 style={h1Style}>Reading Not Found</h1>
        <p style={pStyle}>
          Is link se aapki kundali nahi mil paayi — ho sakta hai link purana ho.
          Naya reading shuru karein, ya WhatsApp par seedha baat karein.
        </p>
        <Link href="/#birth-form" style={btnStyle}>
          Nayi Kundali Banayein
        </Link>
        <WhatsAppLine />
      </Shell>
    )
  }

  /* ── Already paid: nothing to sell ────────────────────────── */
  if (seed.alreadyPaid && seed.publicSlug) {
    return (
      <Shell>
        <h1 style={h1Style}>Aapki Reading Already Unlocked Hai</h1>
        <p style={pStyle}>
          Is kundali ka poora vishleshan pehle se taiyaar hai. Dobara payment ki
          zaroorat nahi.
        </p>
        <Link href={`/report/${seed.publicSlug}`} style={btnStyle}>
          Poori Reading Kholein
        </Link>
      </Shell>
    )
  }

  /* ── Payment + paid generation ────────────────────────────── */
  const startUpgrade = async () => {
    setError(null)
    setBusy(true)

    try {
      const ok = await loadRazorpayScript()
      if (!ok) {
        setError(
          'Razorpay load nahi ho paya. Internet check karke dobara try karein.'
        )
        setBusy(false)
        return
      }

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 'deep' — the incoming ?tier=basic is deliberately ignored, it is not
        // a tier the order API accepts.
        body: JSON.stringify({ tier: 'deep' }),
      })
      if (!orderRes.ok) {
        const e = await orderRes.json().catch(() => ({}))
        setError(e.error || 'Payment order nahi ban paya. Dobara try karein.')
        setBusy(false)
        return
      }
      const { orderId, amount, currency, keyId } = await orderRes.json()

      const ctx = (seed.userContext ?? {}) as Record<string, unknown>

      openRazorpayCheckout({
        keyId,
        orderId,
        amount,
        currency,
        name: 'Trikaal Vaani',
        description: 'Deep Reading — Vedic Astrology',
        prefillName: seed.personName,
        prefillContact: String(ctx.mobile ?? ''),
        themeColor: GOLD,

        onDismiss: () => {
          setBusy(false)
          setError(null)
        },

        onSuccess: async (response) => {
          // 1) Independent verification endpoint (same as BirthForm).
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          if (!verifyRes.ok) {
            const e = await verifyRes.json().catch(() => ({}))
            setError(
              e.error ||
                'Payment verify nahi hua. Paisa kata hai to WhatsApp karein — turant solve karenge.'
            )
            setBusy(false)
            return
          }

          // 2) Paid generation. /api/predict re-verifies signature + amount.
          setWorking(true)
          const ticker = setInterval(
            () => setStepIdx((i) => (i + 1) % STEPS.length),
            15000
          )

          try {
            const res = await fetch('/api/predict', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: generateSessionId(),
                domainId: seed.domainId,
                domainLabel: seed.domainLabel,
                predictionTier: 'paid',
                paymentVerification: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount,
                },
                birthData: seed.birthData,
                userContext: seed.userContext,
                person2Data: null,
                numerologyCompatibility: null,
              }),
            })
            const data = await res.json()
            clearInterval(ticker)

            if (!res.ok) {
              setError(
                data.error ||
                  'Reading generate nahi ho payi. Paisa kata hai — WhatsApp karein, main khud dekhunga.'
              )
              setWorking(false)
              setBusy(false)
              return
            }

            const publicSlug = data?._meta?.publicSlug ?? null
            const predictionId = data?._meta?.predictionId ?? null

            if (publicSlug) router.push(`/report/${publicSlug}`)
            else if (predictionId) router.push(`/result/${predictionId}`)
            else {
              setError(
                'Reading ban gayi par save nahi hui. WhatsApp karein — turant bhej dunga.'
              )
              setWorking(false)
              setBusy(false)
            }
          } catch {
            clearInterval(ticker)
            setError(
              'Network error. Paisa kata hai to WhatsApp karein — reading turant milegi.'
            )
            setWorking(false)
            setBusy(false)
          }
        },
      })
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Payment flow me problem aa gayi.'
      )
      setBusy(false)
    }
  }

  /* ── Generating screen ────────────────────────────────────── */
  if (working) {
    return (
      <Shell>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔮</div>
        <h1 style={h1Style}>Trikaal Aapki Reading Likh Rahe Hain</h1>
        <p style={{ ...pStyle, minHeight: '48px' }}>{STEPS[stepIdx]}</p>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: '8px' }}>
          Isme 90-120 second lagte hain. Page band mat karein.
        </p>
        {error && <ErrorLine text={error} />}
      </Shell>
    )
  }

  /* ── Offer screen ─────────────────────────────────────────── */
  return (
    <Shell>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔓</div>
      <h1 style={h1Style}>
        {seed.personName
          ? `${seed.personName} ji — Poora Jawab Unlock Karein`
          : 'Poora Jawab Unlock Karein'}
      </h1>
      <p style={pStyle}>
        Aapki kundali mein aur bhi yogas hain jo seedha aapke sawal ka jawab
        dete hain. Premium engine poora vishleshan likhta hai — sirf aapke liye.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          margin: '20px auto',
          maxWidth: '380px',
          textAlign: 'left',
        }}
      >
        {BENEFITS.map((b) => (
          <div key={b} style={{ display: 'flex', gap: '6px' }}>
            <span style={{ color: '#22c55e', fontSize: '11px', flexShrink: 0 }}>
              ✓
            </span>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '11.5px' }}>
              {b}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={startUpgrade}
        disabled={busy}
        style={{ ...btnStyle, opacity: busy ? 0.6 : 1, border: 'none' }}
      >
        {busy ? 'Payment khul raha hai...' : '🔓 Unlock Karein — ₹51'}
      </button>

      <p style={{ margin: '10px 0 0', color: '#475569', fontSize: '11px' }}>
        One-time · Instant access · Razorpay secure
      </p>

      {error && <ErrorLine text={error} />}
      <WhatsAppLine />
    </Shell>
  )
}

/* ── Presentational bits ────────────────────────────────────── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#030712',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          background:
            'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(124,58,237,0.08) 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '20px',
          padding: '32px 24px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p
      style={{
        margin: '16px 0 0',
        color: '#f87171',
        fontSize: '12.5px',
        lineHeight: 1.6,
      }}
    >
      {text}
    </p>
  )
}

function WhatsAppLine() {
  return (
    <a
      href="https://wa.me/919211804111?text=Rohiit%20ji%2C%20upgrade%20me%20problem%20aa%20rahi%20hai"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        marginTop: '14px',
        color: '#25D366',
        fontSize: '12px',
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      📞 Rohiit ji se seedha baat karein
    </a>
  )
}

const h1Style: React.CSSProperties = {
  margin: '0 0 10px',
  color: '#fff',
  fontSize: '20px',
  fontFamily: 'Georgia, serif',
  fontWeight: 700,
  lineHeight: 1.4,
}

const pStyle: React.CSSProperties = {
  margin: 0,
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: 1.7,
}

const btnStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '8px',
  padding: '15px 38px',
  borderRadius: '14px',
  background: `linear-gradient(135deg, ${GOLD}, #F5D76E, ${GOLD})`,
  color: '#080B12',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  cursor: 'pointer',
  boxShadow: '0 0 30px rgba(212,175,55,0.35)',
}
