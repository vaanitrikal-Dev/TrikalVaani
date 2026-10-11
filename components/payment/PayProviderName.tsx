/**
 * ============================================================
 * TRIKAL VAANI — <PayProviderName>
 * File: components/payment/PayProviderName.tsx   (NEW FILE)
 * VERSION: 1.0 (11 Oct 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Rohiit ka faisla #1 (11 Oct 2026): Play Store app ke andar payment provider
 * ka naam sirf "Google Play" dikhega — "Razorpay"/"PayPal" wahan likhna galat
 * (asatya) hoga, kyunki app mein payment Google Play se hota hai.
 * Website par `web` prop wala naam HAMESHA pehle jaisa dikhta hai.
 * Use: <PayProviderName web="Razorpay" />
 * Server component page ke andar bhi laga sakte hain (ye khud client hai).
 * Pehle render par website wala naam (server HTML / SEO same), app mein ek pal
 * baad "Google Play" ho jaata hai.
 * ============================================================
 */
'use client';

import { usePlayApp } from './usePlayApp';

export default function PayProviderName({ web }: { web: string }) {
  const inPlayApp = usePlayApp();
  return <>{inPlayApp ? 'Google Play' : web}</>;
}
// END — components/payment/PayProviderName.tsx v1.0
