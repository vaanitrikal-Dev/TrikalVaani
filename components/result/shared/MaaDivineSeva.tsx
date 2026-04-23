/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * File: components/shared/MaaDivineSeva.tsx
 * Version: 1.0
 * Purpose: Shared Maa Ki Arzi + Maa Ka Dhanyewaad section
 *          Starts ₹101 — absolutely NO upper limit
 *          Import this into every service page
 */

"use client";

/* ══════════════════════════════════════════════════════════════════
   USAGE: import MaaDivineSeva from "@/components/shared/MaaDivineSeva";
   Then drop <MaaDivineSeva /> anywhere in the page.
   ══════════════════════════════════════════════════════════════════ */

export default function MaaDivineSeva() {
  // Arzi — starting ₹101, no ceiling
  const arziAmounts = [101, 201, 501, 1001, 2101, 5001, 11000, 21000, 51000, 108000];

  // Dhanyewaad — starting ₹101, no ceiling
  const dhanyeAmounts = [101, 251, 501, 1008, 2501, 5001, 10001, 21000, 51000, 108000];

  function waArzi(amt?: number) {
    if (amt) {
      return `https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20Shakti%20with%20a%20dakshina%20of%20%E2%82%B9${amt}.%20Please%20guide%20me.%20Jai%20Maa%20Shakti!`;
    }
    return `https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20Shakti%20with%20my%20own%20special%20dakshina.%20Please%20guide%20me.%20Jai%20Maa%20Shakti!`;
  }

  function waDhanyewaad(amt?: number) {
    if (amt) {
      return `https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20I%20want%20to%20offer%20Maa%20ka%20Dhanyewaad%20with%20a%20dakshina%20of%20%E2%82%B9${amt}.%20Jai%20Maa!`;
    }
    return `https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20baat%20suni.%20I%20want%20to%20offer%20my%20own%20Dhanyewaad%20dakshina%20from%20my%20heart.%20Jai%20Maa!`;
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Devotional ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#D4AF37]/4 rounded-full blur-[160px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">

        {/* ── Section Header ── */}
        <div className="text-center mb-16">
          <div className="text-5xl mb-4">🙏</div>
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">
            Divya Seva · Divine Offering
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Maa Shakti Ki{" "}
            <span className="text-[#D4AF37]">Divya Seva</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            These are not fees. They are{" "}
            <span className="text-[#D4AF37] font-semibold">dakshina</span> — an offering
            from the heart, placed at Maa Shakti's feet through Trikal Vaani.{" "}
            <span className="text-white font-semibold">
              There is no ceiling on devotion.
            </span>{" "}
            Starting ₹101, with absolutely no upper limit — because love for Maa knows no bounds.
          </p>
        </div>

        {/* ── Two Cards ── */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* ════ ARZI TO MAA ════ */}
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#D4AF37]/8 to-transparent flex flex-col">
            {/* Card header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🪔</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">
                Arzi to Maa
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Place your deepest prayer, wish, or heartfelt plea at the feet of
                Maa Shakti. Rohiit Gupta personally transmits your Arzi during
                Vedic prayer.{" "}
                <span className="text-[#D4AF37] font-semibold">
                  Starting ₹101 — no upper limit.
                </span>
              </p>
            </div>

            {/* Amount pills */}
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">
                Suggested dakshina — or offer any amount from your heart
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {arziAmounts.map((amt) => (
                  <a
                    key={amt}
                    href={waArzi(amt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium"
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                {/* Open-ended pill */}
                <a
                  href={waArzi()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200"
                >
                  My own amount ✦
                </a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">
                No amount too large. Devotion has no ceiling.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-2 mb-8 flex-1">
              {[
                "Your prayer written & submitted to Maa Shakti",
                "Rohiit ji performs Vedic mantra recitation on your behalf",
                "WhatsApp confirmation of prayer transmission",
                "Suitable for love, health, protection, success, peace, family",
                "No prayer too big · No dakshina too large",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={waArzi()}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-[#D4AF37] text-[#080B12] font-bold px-6 py-4 rounded-xl hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_20px_rgba(212,175,55,0.2)] text-base"
            >
              🙏 Submit My Arzi to Maa
            </a>
            <p className="text-center text-gray-600 text-xs mt-3">
              Starts ₹101 · No upper limit · Pure devotion
            </p>
          </div>

          {/* ════ MAA KA DHANYEWAAD ════ */}
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#7C3AED]/10 to-transparent flex flex-col">
            {/* Card header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🌺</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">
                Maa Ka Dhanyewaad
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your prayer was answered. Your wish came true. Now return gratitude
                to Maa Shakti — because gratitude is the highest form of worship.{" "}
                <span className="text-[#D4AF37] font-semibold">
                  Starting ₹101 — no upper limit.
                </span>
              </p>
            </div>

            {/* Amount pills */}
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">
                Gratitude offering — give freely from the heart
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {dhanyeAmounts.map((amt) => (
                  <a
                    key={amt}
                    href={waDhanyewaad(amt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium"
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                {/* Open-ended pill */}
                <a
                  href={waDhanyewaad()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200"
                >
                  From my heart ✦
                </a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">
                The bigger the gratitude, the bigger the next blessing.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-2 mb-8 flex-1">
              {[
                "Your gratitude prayer delivered to Maa Shakti",
                "Rohiit ji performs Vedic thanksgiving puja on your behalf",
                "WhatsApp confirmation with blessings for your next chapter",
                "For answered prayers in love, health, career, family",
                "Gratitude to Maa multiplies blessings — no ceiling",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={waDhanyewaad()}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center border border-[#D4AF37] text-[#D4AF37] font-bold px-6 py-4 rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-200 text-base"
            >
              🌺 Offer My Dhanyewaad to Maa
            </a>
            <p className="text-center text-gray-600 text-xs mt-3">
              Starts ₹101 · No upper limit · Jai Maa Shakti
            </p>
          </div>
        </div>

        {/* Transparency footer */}
        <div className="text-center mt-10 border-t border-white/5 pt-8">
          <p className="text-gray-600 text-xs leading-relaxed max-w-lg mx-auto">
            Trikal Vaani does not profit from dakshina offerings. All Arzi and
            Dhanyewaad dakshinas are used for Vedic puja samagri, mantra recitation
            costs, and charitable givings in Maa Shakti's name. Rohiit Gupta is the
            intermediary — Maa is the recipient.
          </p>
        </div>
      </div>
    </section>
  );
}
