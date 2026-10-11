/**
 * ============================================================
 * TRIKAL VAANI — usePlayApp() hook
 * File: components/payment/usePlayApp.ts   (NEW FILE)
 * VERSION: 1.0 (11 Oct 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * true SIRF tab jab NEXT_PUBLIC_PLAY_BILLING=true ho AUR page Play Store app
 * (TWA) ke andar khula ho. Website par hamesha false — isliye jahan bhi ye
 * hook laga hai, website bilkul pehle jaisi chalti hai.
 * Pehle render par false (server HTML mein sab kuch rehta hai — SEO safe),
 * phir app ke andar ek pal mein true ho jaata hai.
 * ============================================================
 */
'use client';

import { useEffect, useState } from 'react';
import { isPlayBillingAvailable } from '@/lib/play-billing';

export function usePlayApp(): boolean {
  const [inPlayApp, setInPlayApp] = useState(false);
  useEffect(() => {
    let cancelled = false;
    isPlayBillingAvailable().then(ok => { if (!cancelled) setInPlayApp(ok); });
    return () => { cancelled = true; };
  }, []);
  return inPlayApp;
}
// END — components/payment/usePlayApp.ts v1.0
