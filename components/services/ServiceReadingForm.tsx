'use client';

// ============================================================================
// File:    components/services/ServiceReadingForm.tsx
// Version: v1.0 (06 Sep 2026) — NEW FILE
// CEO:     Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================================
//
// WHY THIS FILE EXISTS
//   Until now every /services/* page sent the visitor to `/?segment=<slug>`
//   to actually get their reading. Two things were wrong with that.
//
//   (1) THE LINK WAS DEAD. Nothing in the repo reads the `segment` query
//       parameter — not app/page.tsx, not HomeClient.tsx, not BirthForm.tsx.
//       Category selection is React state set by CLICKING a card in
//       DardEngineShowcase. So a visitor arriving at `/?segment=toxic-boss`
//       landed on the plain homepage with nothing preselected and had to
//       scroll, pick the right age tab, find the card again and click it.
//       Three extra steps after they had already chosen. (The service pages
//       also linked to `?segment=toxic-boss` while the slug is
//       `toxic-boss-radar` — but both values were equally ignored.)
//
//   (2) THE OFFER WAS INVERTED. BirthForm has three tiers —
//       'free' | 'paid' | 'voice' — and the free one is "Free Trikaal Ka
//       Sandesh", a 150-200 word preview. The homepage cards say "Free chart
//       reading for this topic". Every /services/ page said "Get Reading —
//       ₹51". A cold visitor from Google was being asked for money before
//       being given anything, while the homepage gave the same thing free.
//
//   GSC, 3 months to 4 Sep 2026, all /services/ pages combined: 1,597
//   impressions, 49 clicks, CTR 3.07%, positions 6-10. The SEO and the click
//   were working. Everything after the click was broken. This component is
//   the fix for that, and it changes no content and no URL.
//
// WHAT IT DOES
//   Renders the real BirthForm — the same component the homepage uses, with
//   the same free-then-paid flow — with `selectedCategory` already set to this
//   page's domain. The visitor lands, sees the form, fills it, gets the free
//   preview. No hop, no second choice.
//
// THE IDs AND COLOURS BELOW ARE NOT INVENTED
//   Domain ids come from lib/domain-config.ts. Labels and colours come from
//   components/landing/DardEngineShowcase.tsx so that a service page and its
//   homepage card look and behave identically. Verified 06 Sep 2026.
//
// TWO SERVICES ARE DELIBERATELY ABSENT
//   /services/wealth-reading  — no clean domain match. The nearest are
//       mill_karz_mukti (debt relief, the opposite of wealth-building) and
//       genx_legacy_inheritance (Gen X, inheritance). Rohiit's call, 06 Sep
//       2026: leave it as a content page until a proper Dhana Yoga domain
//       exists.
//   /services/compatibility   — needs TWO charts. It is not in
//       DUAL_CHART_DOMAINS (which holds only genz_ex_back and
//       genz_toxic_boss) and has no domain id at all. Its flow is different
//       and must not be forced through this component.
// ============================================================================

import BirthForm from '@/components/landing/BirthForm';

export type ServiceDomainKey =
  | 'ex-back-reading'
  | 'toxic-boss-radar'
  | 'career-pivot'
  | 'property-yog'
  | 'child-destiny'
  | 'spiritual-purpose';

const DOMAIN_MAP: Record<ServiceDomainKey, { id: string; label: string; color: string }> = {
  'ex-back-reading':   { id: 'genz_ex_back',           label: 'Ex-Back & Closure',      color: '#F472B6' },
  'toxic-boss-radar':  { id: 'genz_toxic_boss',        label: 'Toxic Boss / Workplace', color: '#FB923C' },
  'career-pivot':      { id: 'genz_dream_career',      label: 'Dream Career Pivot',     color: '#60A5FA' },
  'property-yog':      { id: 'mill_property_yog',      label: 'Property & Home Yog',    color: '#34D399' },
  'child-destiny':     { id: 'mill_childs_destiny',    label: "Child's Destiny",        color: '#F472B6' },
  'spiritual-purpose': { id: 'genx_spiritual_innings', label: 'Spiritual 2nd Innings',  color: '#D4AF37' },
};

const GOLD = '#D4AF37';

export default function ServiceReadingForm({
  domain,
  heading,
  subheading,
}: {
  domain: ServiceDomainKey;
  heading: string;
  subheading: string;
}) {
  const cat = DOMAIN_MAP[domain];

  return (
    <section className="w-full max-w-3xl mx-auto">
      <div
        className="rounded-2xl p-5 md:p-6 mb-4"
        style={{ background: '#0B0F1A', border: `1px solid rgba(212,175,55,0.25)` }}
      >
        <h2 className="text-lg md:text-xl font-bold m-0 mb-1" style={{ color: GOLD }}>
          {heading}
        </h2>
        <p className="text-xs m-0" style={{ color: '#94a3b8' }}>
          {subheading}
        </p>

        {/* The free tier is named up front on purpose. The old page led with
            "Get Reading — ₹51" to a visitor who had never heard of us. */}
        <p className="text-xs leading-relaxed mt-3 mb-0 rounded-lg px-3 py-2.5"
          style={{ background: 'rgba(212,175,55,0.07)', color: '#cbd5e1' }}>
          <strong style={{ color: GOLD }}>Pehla reading free hai.</strong> Janm vivaran daaliye aur
          Trikaal Ka Sandesh turant milega — bina signup, bina payment. Poori vistrit reading
          chahiye to uske baad ₹51 ka vikalp aata hai. Pehle dekh lijiye, phir tay kijiye.
        </p>
      </div>

      <BirthForm selectedCategory={cat} />
    </section>
  );
}

// ============================================================================
// END — components/services/ServiceReadingForm.tsx v1.0
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
