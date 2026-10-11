/**
 * ============================================================
 * TRIKAL VAANI — <HideInPlayApp>
 * File: components/payment/HideInPlayApp.tsx   (NEW FILE)
 * VERSION: 1.0 (11 Oct 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Rohiit ka faisla #4 (11 Oct 2026): Dakshina Play Store app mein NAHI dikhegi.
 * Google Play app ke andar bahar ke payment (WhatsApp par dakshina) ki taraf
 * bhejne wala koi bhi button/link mana karta hai — isliye wo section app mein
 * chhupaya jaata hai. Website par children HAMESHA dikhte hain.
 * Server component page ke andar bhi laga sakte hain (ye khud client hai).
 * ============================================================
 */
'use client';

import type { ReactNode } from 'react';
import { usePlayApp } from './usePlayApp';

export default function HideInPlayApp({ children }: { children: ReactNode }) {
  const inPlayApp = usePlayApp();
  if (inPlayApp) return null;
  return <>{children}</>;
}
// END — components/payment/HideInPlayApp.tsx v1.0
