'use client';

// ============================================================
// File: components/calculators/KundaliCalculatorClient.tsx
// Version: v2.0 — CTA ONLY (no form)
// Strategy: SEO/GEO/AEO page + emotional CTA → homepage #birth-form
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function KundaliCalculatorClient() {
  return (
    <div className="w-full space-y-6">

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MAIN CTA BLOCK — Emotional Hook + Curiosity + Promise    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl p-6 md:p-10 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(76,29,149,0.15) 50%, rgba(2,8,23,0.8) 100%)`,
          border: `1px solid ${GOLD_RGBA(0.4)}`,
          boxShadow: `0 0 60px ${GOLD_RGBA(0.15)}, inset 0 1px 0 ${GOLD_RGBA(0.2)}`,
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: GOLD }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: '#7C3AED' }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          {/* ── HOOK ── */}
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-6 leading-tight"
            style={{ color: GOLD }}
          >
            🌙 Aapki Kundali Bani — Lekin Asli Kahani Abhi Baki Hai
          </h2>

          {/* ── CURIOSITY GAP ── */}
          <div className="mb-6">
            <p className="text-base md:text-lg text-slate-200 mb-4 leading-relaxed">
              <em>"Lagna Simha hai"</em> — yeh toh aap dekh sakte ho.<br />
              Lekin kya aap jaante hain ki:
            </p>

            <ul className="space-y-3 text-sm md:text-base text-slate-300">
              <li className="flex gap-3 items-start">
                <span style={{ color: GOLD }}>✦</span>
                <span>Saturn aapke Lagna ko <strong>kab cross karega?</strong></span>
              </li>
              <li className="flex gap-3 items-start">
                <span style={{ color: GOLD }}>✦</span>
                <span>Aapki Mahadasha <strong>4 saal mein badalti hai</strong></span>
              </li>
              <li className="flex gap-3 items-start">
                <span style={{ color: GOLD }}>✦</span>
                <span><strong>7th house mein chhupe yog</strong> kya hain?</span>
              </li>
              <li className="flex gap-3 items-start">
                <span style={{ color: GOLD }}>✦</span>
                <span>Aane wale <strong>90 dinon mein kya badlega?</strong></span>
              </li>
            </ul>
          </div>

          {/* ── DIVIDER ── */}
          <div
            className="my-6 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${GOLD_RGBA(0.4)} 50%, transparent 100%)`,
            }}
          />

          {/* ── SACRED PROMISE ── */}
          <div className="mb-6">
            <p className="text-base md:text-lg text-slate-200 mb-4 leading-relaxed">
              Trikal Vaani ki AI ne aapke <strong style={{ color: GOLD }}>9 grahon ko padh liya hai</strong>.<br />
              Ab woh bolna chahti hai — <em>sirf aapse.</em>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <PromiseRow icon="🎯" text="Career ka next milestone" />
              <PromiseRow icon="💍" text="Marriage ka shubh kaal" />
              <PromiseRow icon="🩺" text="Health ka warning zone" />
              <PromiseRow icon="🪔" text="5 personalized upay — Mantra, Ratna, Daan" />
            </div>

            <p className="text-sm md:text-base text-slate-400 mt-5 italic text-center">
              Sab ek 30-second voice prediction mein.
            </p>
          </div>

          {/* ── BIG CTA BUTTON ── */}
          <div className="text-center mt-8">
            <Link
              href="/#birth-form"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base md:text-lg transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
                boxShadow: `0 0 30px ${GOLD_RGBA(0.5)}, 0 0 60px ${GOLD_RGBA(0.2)}`,
              }}
            >
              <span>🔮 Trikal Ka Sandesh — Sirf Aapke Liye — ₹51 →</span>
            </Link>

            <p
              className="text-xs md:text-sm mt-5 flex items-center justify-center gap-2 flex-wrap"
              style={{ color: GOLD_RGBA(0.7) }}
            >
              <span>🔱</span>
              <span>Swiss Ephemeris</span>
              <span className="text-slate-600">·</span>
              <span>BPHS Classical</span>
              <span className="text-slate-600">·</span>
              <span>Bhrigu Nandi Nadi</span>
              <span className="text-slate-600">·</span>
              <span>Shadbala</span>
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TRUST STRIP — Below main CTA                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div
        className="rounded-xl p-4 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <TrustItem number="2,400+" label="Predictions Delivered" />
        <TrustItem number="4.9/5" label="Client Rating" />
        <TrustItem number="93%" label="Accuracy Rate" />
        <TrustItem number="₹51" label="Starting Price" />
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function PromiseRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{
        background: 'rgba(2,8,23,0.4)',
        border: `1px solid ${GOLD_RGBA(0.15)}`,
      }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-slate-200">{text}</span>
    </div>
  );
}

function TrustItem({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-lg md:text-xl font-bold" style={{ color: GOLD }}>
        {number}
      </div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}
