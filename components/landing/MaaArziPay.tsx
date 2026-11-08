/**
 * ============================================================
 * TRIKAAL VAANI — MaaArziPay (Maa Shakti ko Arzi — dakshina)
 * File: components/landing/MaaArziPay.tsx   (NEW FILE)
 * VERSION: 1.0 (8 Nov 2026)
 * Owner: Rohiit Gupta, Chief Vedic Architect
 * ============================================================
 * Rohiit ke faisle (8 Nov 2026):
 *   1. SIRF HOMEPAGE par — BirthForm services aur /upgrade par bhi chalta
 *      hai, isliye yeh component khud pathname === '/' check karta hai.
 *   2. Heading: "🙏 Maa Shakti ko Arzi — apni shraddha anusaar dakshina".
 *   3. Koi amount screen par NAHI, koi limit NAHI — customer khud likhe
 *      (₹1 se upar koi bhi poora rupaya).
 *   4. Razorpay checkout mein UPI NAHI dikhega (config.display.hide) —
 *      UPI ke liye Rohiit customer ko QR khud bhejte hain. Card,
 *      NetBanking, Wallet chalenge.
 *   5. Option B — REDIRECT MODE: payment ke baad Razorpay customer ko
 *      /api/dakshina-callback par bhejta hai; wahi verify + save +
 *      WhatsApp dhanyawad page dikhata hai.
 *   Play Store app mein BirthForm ise render hi nahi karta ({!inPlayApp}).
 * Backend: app/api/create-dakshina-order/route.ts v1.1
 * ============================================================
 */
"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { loadRazorpayScript } from "@/lib/razorpay-helper"

const GOLD = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`
const WA_UPI = "https://wa.me/919211804111?text=" +
  encodeURIComponent("Pranam Rohiit ji, Maa ko Arzi karna chahta hoon. UPI QR bhej dijiye. Jai Maa Shakti!")

export default function MaaArziPay() {
  const pathname = usePathname()
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (pathname !== '/') return null

  const pay = async () => {
    setError(null)
    const rupees = Number(amount)
    if (!amount || !Number.isSafeInteger(rupees) || rupees < 1) {
      setError('Kripya apni dakshina poore rupaye mein likhein.')
      return
    }
    setBusy(true)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded || !(window as any).Razorpay) {
        setError('Payment khul nahi paya. Internet check karke dobara try karein.')
        setBusy(false)
        return
      }
      const res = await fetch('/api/create-dakshina-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'arzi', amount: rupees, isCustom: true, source: 'home' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.orderId) {
        setError(data?.error || 'Payment order nahi bana. Dobara try karein.')
        setBusy(false)
        return
      }
      const rzp = new (window as any).Razorpay({
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'Trikaal Vaani',
        description: 'Maa Shakti ko Arzi — Dakshina',
        order_id:    data.orderId,
        image:       'https://trikalvaani.com/logo.png',
        theme:       { color: GOLD },
        // Option B — redirect mode, server par verify + save
        callback_url: `${window.location.origin}/api/dakshina-callback`,
        redirect:     true,
        // UPI checkout mein nahi (Rohiit QR manually bhejte hain)
        config: {
          display: {
            hide: [{ method: 'upi' }],
            preferences: { show_default_blocks: true },
          },
        },
        modal: { ondismiss: () => setBusy(false) },
      })
      rzp.on('payment.failed', () => setBusy(false))
      rzp.open()
    } catch (e: any) {
      setError(e?.message || 'Payment mein dikkat aayi. Dobara try karein.')
      setBusy(false)
    }
  }

  return (
    <div style={{ padding: '14px 20px', background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.15)}`, borderRadius: '12px', marginBottom: '12px' }}>
      <p style={{ margin: '0 0 8px', color: GOLD, fontSize: '13px', fontWeight: 600 }}>🙏 Maa Shakti ko Arzi — apni shraddha anusaar dakshina</p>
      <p style={{ margin: '0 0 10px', color: '#475569', fontSize: '11px', lineHeight: 1.5 }}>Maa ke charnon mein apni dil ki baat rakhein. Rohiit ji personally transmit karenge.</p>
      <div style={{ display: 'flex', gap: '8px', maxWidth: '340px', margin: '0 auto' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>₹</span>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Apni dakshina rupaye mein"
            placeholder="Apni dakshina"
            value={amount}
            onChange={e => { setAmount(e.target.value.replace(/\D/g, '').slice(0, 12)); setError(null) }}
            style={{ width: '100%', padding: '10px 10px 10px 24px', borderRadius: '8px', background: '#0d1120', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button
          type="button"
          onClick={pay}
          disabled={busy}
          style={{ padding: '10px 14px', borderRadius: '8px', border: 'none', background: busy ? GOLD_RGBA(0.4) : GOLD, color: '#080B12', fontWeight: 700, fontSize: '13px', cursor: busy ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
        >
          {busy ? 'Khul raha hai...' : 'Arzi bhejein'}
        </button>
      </div>
      {error && <p style={{ margin: '8px 0 0', color: '#f87171', fontSize: '11px' }}>{error}</p>}
      <p style={{ margin: '10px 0 0', color: '#475569', fontSize: '10px' }}>
        Card · NetBanking · Wallet — secured by Razorpay. UPI se dena ho to{' '}
        <a href={WA_UPI} target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontWeight: 700, textDecoration: 'none' }}>WhatsApp karein →</a>
      </p>
    </div>
  )
}
// END — components/landing/MaaArziPay.tsx v1.0
