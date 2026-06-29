'use client';
// ============================================================
// FILE: components/analytics/GoogleAdsTag.tsx
// VERSION: v1.0
// PURPOSE: Google Ads Remarketing Tag — builds audiences for Search Ads
// CEO: Rohiit Gupta | Trikaal Vaani
// DATE: 2026-06-29
// ============================================================
// SETUP (one-time):
//   1. Go to: Google Ads → Tools → Conversions → Install tag manually
//   2. Your Conversion ID looks like: AW-1234567890
//   3. Replace YOUR_GOOGLE_ADS_ID below (keep the AW- prefix)
//   4. Add <GoogleAdsTag /> to app/layout.tsx inside <body>
//
// AUDIENCES TO CREATE IN GOOGLE ADS:
//   Audience 1: All visitors → General remarketing
//   Audience 2: /calculators/* → Calculator interest
//   Audience 3: /hast-rekha-calculator → Palmistry interest (hottest)
//   Audience 4: /kundali-milan → Marriage/compatibility interest
//   Audience 5: People who spent 2+ min → High-intent
// ============================================================

import Script from 'next/script';

// ── Replace with your actual Google Ads Conversion ID ──────────────────────
const GOOGLE_ADS_ID = 'AW-YOUR_CONVERSION_ID';
// ────────────────────────────────────────────────────────────────────────────

// ── Conversion event tracker ───────────────────────────────────────────────
// Call from BirthForm on payment success:
// import { trackGoogleConversion } from '@/components/analytics/GoogleAdsTag';
// trackGoogleConversion('purchase', 51);
export function trackGoogleConversion(
  type: 'lead' | 'purchase',
  value?: number
) {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: `${GOOGLE_ADS_ID}/${type === 'purchase' ? 'purchase' : 'lead'}`,
        value: value ?? 0,
        currency: 'INR',
      });
    }
  } catch { /* safe no-op */ }
}

export default function GoogleAdsTag() {
  if (!GOOGLE_ADS_ID || GOOGLE_ADS_ID === 'AW-YOUR_CONVERSION_ID') return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
