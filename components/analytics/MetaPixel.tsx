'use client';
// ============================================================
// FILE: components/analytics/MetaPixel.tsx
// VERSION: v1.0
// PURPOSE: Meta Pixel base code + custom event helpers
// CEO: Rohiit Gupta | Trikaal Vaani
// DATE: 2026-06-29
// ============================================================
// SETUP (one-time):
//   1. Go to: Meta Business Suite → Events Manager → Your Pixel
//   2. Copy your Pixel ID (a number like 1234567890123456)
//   3. Replace YOUR_META_PIXEL_ID below with that number
//   4. Add <MetaPixel /> to app/layout.tsx inside <body>
//
// CUSTOM AUDIENCES TO CREATE IN META ADS MANAGER:
//   Audience 1: All site visitors (last 60 days) → General awareness
//   Audience 2: ViewContent fired → Calculator users → warm
//   Audience 3: InitiateCheckout fired → Upgrade-intent users → hot
//   Audience 4: Lead fired → Free reading completed → nurture
//   Audience 5: Purchase fired → Paid clients → lookalike
// ============================================================

import Script from 'next/script';

// ── Replace with your actual Pixel ID ──────────────────────────────────────
const PIXEL_ID = '2111897212873248';
// ────────────────────────────────────────────────────────────────────────────

// ── Standard event tracker ─────────────────────────────────────────────────
// Import and call this from other components:
// import { trackMetaEvent } from '@/components/analytics/MetaPixel';
// trackMetaEvent('Lead');
// trackMetaEvent('Purchase', { value: 51, currency: 'INR' });
export function trackMetaEvent(
  event: 'PageView' | 'ViewContent' | 'Lead' | 'Purchase' | 'InitiateCheckout' | 'CompleteRegistration',
  params?: Record<string, string | number>
) {
  try {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', event, params);
    }
  } catch { /* safe no-op — pixel not loaded yet */ }
}

// ── Custom event tracker (non-standard events) ─────────────────────────────
// trackMetaCustom('CalculatorUsed', { calculator: 'Palmistry' });
// trackMetaCustom('DardEngineClick', { category: 'Ex-Back' });
export function trackMetaCustom(
  event: string,
  params?: Record<string, string | number>
) {
  try {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', event, params);
    }
  } catch { /* safe no-op */ }
}

// ── Base Pixel component — add to layout.tsx ───────────────────────────────
export default function MetaPixel() {
  // Safety: don't render if ID not configured
  if (!PIXEL_ID || PIXEL_ID === 'YOUR_META_PIXEL_ID') return null;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      {/* Noscript fallback — required by Meta */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
