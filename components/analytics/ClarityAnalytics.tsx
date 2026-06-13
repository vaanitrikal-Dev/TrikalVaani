/**
 * ============================================================
 * TRIKAAL VAANI — Microsoft Clarity Analytics
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/analytics/ClarityAnalytics.tsx
 * VERSION: 1.0 — June 2026
 * ============================================================
 * Free heatmaps, scroll-depth, rage-click detection, and session
 * recordings via Microsoft Clarity (project: Trikaal Vaani).
 *
 * - Loads via next/script strategy="afterInteractive" — does NOT
 *   block first paint / LCP (page speed unaffected).
 * - Renders ONLY in production (NODE_ENV check) — localhost and
 *   Vercel preview deploys stay clean, no junk data.
 * - Zero dependencies, zero config. Dashboard:
 *   https://clarity.microsoft.com/projects/view/x5li8xd59b
 *
 * USAGE (app/layout.tsx):
 *   import ClarityAnalytics from '@/components/analytics/ClarityAnalytics'
 *   ...inside <body>: <ClarityAnalytics />
 * ============================================================
 */

import Script from 'next/script'

const CLARITY_PROJECT_ID = 'x5li8xd59b'

export default function ClarityAnalytics() {
  if (process.env.NODE_ENV !== 'production') return null

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  )
}
