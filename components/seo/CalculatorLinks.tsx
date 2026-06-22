// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:    components/seo/CalculatorLinks.tsx
// Version: v1.0 — Reusable "Free Vedic Calculators" internal-link block
// Owner:   Rohiit Gupta, Chief Vedic Architect | trikalvaani.com
//
// Purpose: ONE place to manage the calculator links shown on festival /
//          event pages. Flows internal authority from high-traffic festival
//          pages → the priority calculators (Kundli, Manglik, Dasha, Sade
//          Sati, Gemstone). Add/remove a calculator here once — every page
//          using <CalculatorLinks /> updates automatically. No scattered
//          hardcoded link lists.
// ════════════════════════════════════════════════════════════════════

import Link from "next/link";

const CALCULATORS: { slug: string; label: string }[] = [
  { slug: "free-kundali-calculator",               label: "Free Kundli Calculator" },
  { slug: "free-manglik-dosh-calculator",          label: "Free Manglik Dosh Calculator" },
  { slug: "free-dasha-calculator",                 label: "Free Dasha Calculator" },
  { slug: "free-sade-sati-calculator",             label: "Free Sade Sati Calculator" },
  { slug: "free-rashi-calculator",                 label: "Free Rashi Calculator" },
  { slug: "free-nakshatra-calculator",             label: "Free Nakshatra Calculator" },
  { slug: "free-lucky-day-calculator",             label: "Free Lucky Day Calculator" },
  { slug: "free-gemstone-suitability-calculator",  label: "Free Gemstone Suitability Calculator" },
];

export default function CalculatorLinks() {
  return (
    <section className="mt-6 border-t border-gray-200 pt-6" aria-label="Free Vedic calculators">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Free Vedic Calculators</h2>
      <p className="mb-3 text-sm text-gray-600">
        Curious what this means for YOUR chart? Try these free tools — no signup:
      </p>
      <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
        {CALCULATORS.map((c) => (
          <li key={c.slug}>
            <Link href={`/calculators/${c.slug}`} className="text-amber-700 hover:underline">
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
