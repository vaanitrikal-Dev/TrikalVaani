'use client';

/**
 * ============================================================
 * TRIKAL VAANI — Intl Price
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/payment/IntlPrice.tsx
 * VERSION: 1.0 (29 Aug 2026)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Shows a rupee price to Indian visitors and a dollar price to everyone else.
 *
 * WHY THIS EXISTS
 * ---------------
 * Several pricing pages are SERVER components, so they cannot run the geo
 * check themselves. Without this, a visitor abroad reads ₹101 on the pricing
 * card and then meets $12 at checkout — one product, two prices, and a lost
 * sale. This is the smallest thing that can sit inside a server-rendered page
 * and still know where the reader is.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 * --------------------------------
 * It does not blank out or shift while it waits. The rupee price is rendered
 * on the server and swapped once the country is known, because the majority
 * of readers are in India, and a flash of the correct price beats a flash of
 * empty space or a layout jump. Metadata, JSON-LD and FAQ text stay in rupees
 * on purpose — those are indexed for the primary Indian market.
 *
 * `?intl=1` forces the dollar view for testing from India. One-way only: it
 * can move a rupee reader to dollars, never the reverse.
 * ============================================================
 */

import { useState, useEffect } from 'react';

interface Props {
  /** What Indian visitors see, e.g. "₹101". Rendered on the server. */
  inr: string;
  /** What everyone else sees, e.g. "$12". */
  usd: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function IntlPrice({ inr, usd, className, style }: Props) {
  const [isIndia, setIsIndia] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const forced =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('intl') === '1';
    if (forced) { setIsIndia(false); return; }
    fetch('/api/geo')
      .then((r) => r.json())
      .then((g) => { if (!cancelled) setIsIndia(g?.isIndia !== false); })
      .catch(() => { if (!cancelled) setIsIndia(true); });
    return () => { cancelled = true; };
  }, []);

  // null (still checking) renders the rupee price, which is both the server
  // output and the right answer for most readers.
  return (
    <span className={className} style={style}>
      {isIndia === false ? usd : inr}
    </span>
  );
}
