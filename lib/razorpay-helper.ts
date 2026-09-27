/**
 * ============================================================
 * TRIKAL VAANI — Razorpay Helper
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/razorpay-helper.ts
 * VERSION: 1.1 (27 Sep 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * v1.1 (27 Sep 2026) — OPTIONAL callbackUrl (REDIRECT MODE)
 *   Problem: mobile par UPI app khulte hi Chrome hamara tab maar/reload kar
 *   deta hai → `handler` kabhi nahi chalta → /api/verify-payment aur
 *   /api/predict kabhi call nahi hote. Proof: 26-27 Sep ko 2 din mein
 *   verify-payment sirf 1 baar chala, jabki Deep ke 3 payment captured the.
 *   Fix: callbackUrl diya jaaye to Razorpay `redirect: true` mode mein
 *   chalta hai — payment ke baad Razorpay KHUD customer ko callbackUrl par
 *   POST karta hai (payment_id, order_id, signature). Hamare tab ka zinda
 *   rehna zaroori nahi.
 *   callbackUrl NA diya jaaye to sab kuch v1.0 jaisa (Milan, Karmic, Swapna,
 *   Muhurat, Yog, Upgrade — kisi par asar nahi).
 * ============================================================
 * Loads Razorpay checkout.js dynamically (only when user clicks pay)
 * and opens the Razorpay payment popup.
 * ============================================================
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptLoadingPromise: Promise<boolean> | null = null;

// ── Load Razorpay JS once and reuse ──────────────────────────
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      scriptLoadingPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

// ── Razorpay checkout options type ───────────────────────────
export interface RazorpayCheckoutOptions {
  keyId: string;
  orderId: string;
  amount: number;          // in paise
  currency: string;        // 'INR'
  name: string;            // 'Trikaal Vaani'
  description: string;     // 'Deep Reading' | 'Voice Reading'
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
  themeColor?: string;
  // v1.1 — diya ho to redirect mode (handler nahi chalta, Razorpay POST karta hai)
  callbackUrl?: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
}

// ── Open Razorpay checkout popup ─────────────────────────────
export function openRazorpayCheckout(opts: RazorpayCheckoutOptions): void {
  if (typeof window === 'undefined' || !window.Razorpay) {
    console.error('[Trikal] Razorpay not loaded.');
    return;
  }

  const rzp = new window.Razorpay({
    key:         opts.keyId,
    amount:      opts.amount,
    currency:    opts.currency,
    name:        opts.name,
    description: opts.description,
    order_id:    opts.orderId,
    image:       'https://trikalvaani.com/logo.png',
    prefill: {
      name:    opts.prefillName  ?? '',
      email:   opts.prefillEmail ?? '',
      contact: opts.prefillContact ?? '',
    },
    notes: {
      platform: 'Trikaal Vaani',
      architect: 'Rohiit Gupta',
    },
    theme: {
      color: opts.themeColor ?? '#D4AF37',
    },
    // v1.1 — sirf tab jab caller callbackUrl de
    ...(opts.callbackUrl ? { callback_url: opts.callbackUrl, redirect: true } : {}),
    modal: {
      ondismiss: () => {
        if (opts.onDismiss) opts.onDismiss();
      },
    },
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      opts.onSuccess(response);
    },
  });

  rzp.on('payment.failed', (response: any) => {
    console.error('[Trikal] Razorpay payment failed:', response.error);
  });

  rzp.open();
}
// END — lib/razorpay-helper.ts v1.1
