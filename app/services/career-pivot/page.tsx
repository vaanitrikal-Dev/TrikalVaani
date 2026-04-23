/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE: app/services/career-pivot/page.tsx
 * Version: 3.0 — Fully self-contained, no external shared imports
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Should I Change My Career? Vedic Astrology Career Pivot Reading | Trikal Vaani",
  description: "Chief Vedic Architect Rohiit Gupta reads your 10th House, Jupiter & Atmakaraka to reveal your dharmic profession, ideal pivot window, and industries your chart favors. ₹51 deep reading.",
  keywords: ["career change astrology vedic", "should I change job astrology", "dharmic career astrology", "10th house career vedic astrology", "Atmakaraka career reading", "Rohiit Gupta vedic astrologer Delhi"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/about" }],
  openGraph: { title: "Should I Change My Career? | Trikal Vaani — Rohiit Gupta", description: "Your 10th House and Jupiter reveal your dharmic profession. Jini AI decodes the right pivot window.", url: "https://trikalvaani.com/services/career-pivot", siteName: "Trikal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/career-pivot" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", "@id": "https://trikalvaani.com/services/career-pivot", name: "Career Pivot — Dharmic Career Reading", description: "Vedic astrology reading by Rohiit Gupta analyzing 10th House, Jupiter, Atmakaraka, and D10 Dasamsa chart to reveal dharmic profession and best career pivot timing.", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/about", knowsAbout: ["Vedic Astrology", "Atmakaraka", "Dasamsa D10", "Career Timing"] }, offers: [{ "@type": "Offer", name: "AI Deep Reading", price: "51", priceCurrency: "INR" }, { "@type": "Offer", name: "Personal Call with Rohiit Gupta", price: "499", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Career Pivot — Dharmic Career Reading", item: "https://trikalvaani.com/services/career-pivot" }] },
  ],
};

const reasons = [
  { icon: "♃", title: "Jupiter & the 10th House Reveal Your Dharmic Profession", desc: "The 10th house (Karma Bhava) shows your highest calling. Jupiter's sign, nakshatra, and aspect determine what work feels divinely aligned. Many people spend decades in the wrong career because they never read this placement." },
  { icon: "☀", title: "Atmakaraka Shows Your Soul's True Work", desc: "The Atmakaraka (planet with highest degree) is your soul's purpose indicator. When you're in a career misaligned with your Atmakaraka, you feel empty no matter how much you earn. Vedic astrology identifies this mismatch immediately." },
  { icon: "⏱", title: "Dasha Timing Prevents Costly Mistakes", desc: "Changing careers at the wrong Dasha — say, during Ketu Mahadasha — can destroy momentum. But changing during Jupiter or Venus Dasha with 10th house activation? History shows these are the windows when careers transform permanently." },
];
const testimonials = [
  { name: "Neha Agarwal", city: "Pune", date: "January 2025", text: "I was an engineer for 8 years and always felt wrong. Jini told me my Jupiter Mahadasha was the pivot window. I started my design studio. Best decision of my life.", stars: 5 },
  { name: "Vikram Bhatia", city: "Gurgaon", date: "November 2024", text: "The reading revealed I had a Hamsa Yoga wasting in a sales job. Rohiit ji advised me to move toward finance. I'm now a financial trainer — income tripled.", stars: 5 },
  { name: "Meera Krishnan", city: "Kochi", date: "March 2025", text: "I was terrified to leave my government job. My chart showed a Rahu period ending and a Sun-Jupiter period beginning. Rohiit ji said the fear was the old Dasha talking. He was right.", stars: 5 },
];
const faqs = [
  { q: "Can Vedic astrology tell me the right career for my soul?", a: "Yes. The 10th house reveals your highest calling. The Atmakaraka shows your soul's primary purpose. Jupiter's sign and nakshatra determine what domain feels divinely aligned. Together these reveal your dharmic profession." },
  { q: "What is the best time to change careers according to Vedic astrology?", a: "The best career change windows occur during Jupiter or Venus Mahadasha with 10th house activation. Changing during Ketu Mahadasha creates confusion. Rohiit Gupta reads your exact Dasha to give you a specific month window." },
  { q: "What is the Dasamsa D10 chart?", a: "The Dasamsa (D10) is the 10th divisional chart used exclusively for career analysis. It shows your capacity for authority, the right professional domain, and whether self-employment or service suits you." },
  { q: "What is Atmakaraka and how does it relate to career?", a: "The Atmakaraka is the planet with the highest degree in your birth chart. It represents your soul's deepest longing. When your career aligns with your Atmakaraka's energy, work feels meaningful." },
];

export default function Page() {
  return (
    <>
      <Script id="career-pivot-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <HeroSection
          badge="Dharmic Career Intelligence · by Rohiit Gupta"
          h1a="Are You in the" h1gold="Wrong Career?" h1b="Your Stars Know Your Dharma."
          sub="Jini AI reads your 10th House, Jupiter, Atmakaraka & Dasha timing to reveal your dharmic profession — and the exact window to pivot without financial risk."
          segment="career-pivot"
          waText="I%20want%20a%20career%20pivot%20astrology%20reading"
          cta="Get My Career Reading — ₹51"
          glow="bg-[#7C3AED]/20"
        />
        <AuthorStrip />
        <ReasonsSection reasons={reasons} title="Why Vedic Astrology Can Find" highlight="Your True Career" />
        <HowItWorksSection segment="career-pivot" steps=[
          { step: "01", title: "Enter Your Birth Details", desc: "Date, time, place. We use Prokerala API with Lahiri Ayanamsha for maximum accuracy." },
          { step: "02", title: "Jini Maps Your Career Karma", desc: "10th lord placement, Jupiter sign, Atmakaraka, D10 Dasamsa career chart — all analyzed for dharmic alignment." },
          { step: "03", title: "Get Industries & Pivot Window", desc: "₹51 deep reading: Which industries your chart favors, which to avoid, and the astrologically supported months to pivot." },
          { step: "04", title: "Book a Strategy Session", desc: "₹499 personal call with Rohiit ji for a comprehensive career roadmap — which city, which domain, which role." },
        ] deliverables=["Your dharmic profession (10th house)", "Atmakaraka soul-purpose decoding", "D10 Dasamsa career chart reading", "Industries your chart supports", "Pivot window — exact months", "Financial risk period to avoid", "4-week career momentum forecast"] />
        <TestimonialsSection testimonials={testimonials} label="What People Are" />
        <MaaDivineSeva />
        <FaqSection faqs={faqs} />
        <CtaSection headline="Stop Guessing. Start Living" highlight="Your Dharma." body="Your birth chart already knows your highest calling. ₹51 to find out what it is — and when to make the move." segment="career-pivot" waText="I%20want%20a%20career%20pivot%20astrology%20reading" />
        <SiteFooter />
      </main>
    </>
  );
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS — inlined, no external deps
// ─────────────────────────────────────────────

function WAIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function HeroSection({ badge, h1a, h1gold, h1b, sub, segment, waText, cta, glow }: { badge: string; h1a: string; h1gold: string; h1b: string; sub: string; segment: string; waText: string; cta: string; glow: string }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] ${glow} rounded-full blur-[120px]`} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
      </div>
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
          <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">{badge}</span>
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
          {h1a} <span className="text-[#D4AF37]">{h1gold}</span><br />{h1b}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">{sub}</p>
        <p className="text-sm text-gray-500 mb-10">
          Reading designed by <Link href="/about" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris + Prokerala API
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/?segment=${segment}`} className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">{cta}</Link>
          <a href={`https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20${waText}`} target="_blank" rel="noopener noreferrer" className="border border-[#25D366] text-[#25D366] font-semibold px-8 py-4 rounded-lg text-lg hover:bg-[#25D366]/10 transition-all duration-200 flex items-center justify-center gap-2">
            <WAIcon /> Talk to Rohiit Ji — ₹499
          </a>
        </div>
      </div>
    </section>
  );
}

function AuthorStrip() {
  return (
    <section className="py-12 px-4 border-y border-white/5 bg-[#0A0D18]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-3xl font-serif text-[#D4AF37] font-bold">RG</div>
        <div>
          <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium mb-1">About Your Vedic Architect</p>
          <h2 className="font-serif text-xl font-bold text-white mb-2">Rohiit Gupta — Chief Vedic Architect, Trikal Vaani</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. As founder of Trikal Vaani, he built India's first AI-powered Vedic platform combining Swiss Ephemeris precision with Gemini AI reasoning. All readings are designed by Rohiit — Jini AI applies his framework to your unique birth chart.</p>
          <div className="flex gap-3 mt-3 flex-wrap">
            {["15+ Years Vedic Study", "Parashara BPHS Tradition", "Swiss Ephemeris Precision", "Delhi NCR Based"].map(t => (
              <span key={t} className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReasonsSection({ reasons, title, highlight }: { reasons: { icon: string; title: string; desc: string }[]; title: string; highlight: string }) {
  return (
    <section className="py-20 px-4 bg-[#0D1020]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">{title} <span className="text-[#D4AF37]">{highlight}</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((r, i) => (
            <div key={i} className="border border-white/10 rounded-2xl p-7 bg-white/[0.03] hover:border-[#D4AF37]/40 transition-all duration-300 group">
              <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{r.icon}</div>
              <h3 className="font-serif text-xl font-bold text-[#D4AF37] mb-3">{r.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({ segment, steps, deliverables }: { segment: string; steps: { step: string; title: string; desc: string }[]; deliverables: string[] }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{s.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border border-[#D4AF37]/30 rounded-2xl p-8 bg-gradient-to-br from-[#D4AF37]/10 to-[#7C3AED]/10">
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-6">What You Receive</p>
            <ul className="space-y-4">
              {deliverables.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-[#D4AF37] text-lg">✦</span>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs line-through">₹499</p>
                <p className="text-[#D4AF37] text-2xl font-bold">₹51</p>
                <p className="text-gray-500 text-xs">Introductory price</p>
              </div>
              <Link href={`/?segment=${segment}`} className="bg-[#D4AF37] text-[#080B12] font-bold px-6 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200">Unlock Now</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ testimonials, label = "What People Are" }: { testimonials: { name: string; city: string; date: string; text: string; stars: number }[]; label?: string }) {
  return (
    <section className="py-20 px-4 bg-[#0D1020]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Verified Experiences</p>
          <h2 className="font-serif text-3xl font-bold">{label} <span className="text-[#D4AF37]">Saying</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="border border-white/10 rounded-2xl p-6 bg-white/[0.03]">
              <div className="flex gap-1 mb-1">{Array.from({ length: t.stars }).map((_, j) => <span key={j} className="text-[#D4AF37]">★</span>)}</div>
              <p className="text-gray-500 text-xs mb-4">{t.date} · {t.city}</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{t.name[0]}</div>
                <p className="font-semibold text-sm text-white">{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MaaDivineSeva() {
  const arziAmounts   = [101, 201, 501, 1001, 2101, 5001, 11000, 21000, 51000, 108000];
  const dhanyeAmounts = [101, 251, 501, 1008, 2501, 5001, 10001, 21000, 51000, 108000];
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#D4AF37]/4 rounded-full blur-[160px]" />
      </div>
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-5xl mb-4">🙏</div>
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Divya Seva · Divine Offering</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Maa Shakti Ki <span className="text-[#D4AF37]">Divya Seva</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">These are not fees. They are <span className="text-[#D4AF37] font-semibold">dakshina</span> — an offering from the heart, placed at Maa Shakti&apos;s feet through Trikal Vaani. <span className="text-white font-semibold">There is no ceiling on devotion.</span> Starting ₹101, with absolutely no upper limit.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#D4AF37]/8 to-transparent flex flex-col">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🪔</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Arzi to Maa</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Place your deepest prayer at Maa Shakti&apos;s feet. Rohiit ji personally transmits your Arzi during Vedic prayer. <span className="text-[#D4AF37] font-semibold">Starting ₹101 — no upper limit.</span></p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Suggested dakshina — or offer any amount from your heart</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {arziAmounts.map(amt => (
                  <a key={amt} href={`https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20Shakti%20with%20a%20dakshina%20of%20%E2%82%B9${amt}.%20Please%20guide%20me.%20Jai%20Maa%20Shakti!`} target="_blank" rel="noopener noreferrer" className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium">
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20with%20my%20own%20special%20dakshina.%20Jai%20Maa%20Shakti!" target="_blank" rel="noopener noreferrer" className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200">My own amount ✦</a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">No amount too large. Devotion has no ceiling.</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {["Your prayer written & submitted to Maa Shakti", "Rohiit ji performs Vedic mantra recitation on your behalf", "WhatsApp confirmation of prayer transmission", "For love, health, protection, success, peace, family", "No prayer too big · No dakshina too large"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400"><span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>{item}</li>
              ))}
            </ul>
            <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20Shakti.%20Please%20guide%20me.%20Jai%20Maa%20Shakti!" target="_blank" rel="noopener noreferrer" className="block text-center bg-[#D4AF37] text-[#080B12] font-bold px-6 py-4 rounded-xl hover:bg-[#e8c84a] transition-all duration-200 text-base">🙏 Submit My Arzi to Maa</a>
            <p className="text-center text-gray-600 text-xs mt-3">Starts ₹101 · No upper limit · Pure devotion</p>
          </div>
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#7C3AED]/10 to-transparent flex flex-col">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🌺</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Maa Ka Dhanyewaad</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Your prayer was answered. Return gratitude to Maa Shakti — gratitude is the highest form of worship. <span className="text-[#D4AF37] font-semibold">Starting ₹101 — no upper limit.</span></p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Gratitude offering — give freely from the heart</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {dhanyeAmounts.map(amt => (
                  <a key={amt} href={`https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20I%20want%20to%20offer%20Maa%20ka%20Dhanyewaad%20with%20a%20dakshina%20of%20%E2%82%B9${amt}.%20Jai%20Maa!`} target="_blank" rel="noopener noreferrer" className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium">
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Jai%20Maa%20Shakti!%20I%20want%20to%20offer%20my%20Dhanyewaad%20to%20Maa%20with%20my%20own%20dakshina%20amount.%20Jai%20Maa!" target="_blank" rel="noopener noreferrer" className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200">From my heart ✦</a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">The bigger the gratitude, the bigger the next blessing.</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {["Your gratitude prayer delivered to Maa Shakti", "Rohiit ji performs Vedic thanksgiving puja on your behalf", "WhatsApp confirmation with blessings for your next chapter", "For answered prayers in love, health, career, family", "Gratitude to Maa multiplies blessings — no ceiling"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400"><span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>{item}</li>
              ))}
            </ul>
            <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20baat%20suni.%20Main%20Maa%20ka%20Dhanyewaad%20dena%20chahta%20hoon.%20Jai%20Maa!" target="_blank" rel="noopener noreferrer" className="block text-center border border-[#D4AF37] text-[#D4AF37] font-bold px-6 py-4 rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-200 text-base">🌺 Offer My Dhanyewaad to Maa</a>
            <p className="text-center text-gray-600 text-xs mt-3">Starts ₹101 · No upper limit · Jai Maa Shakti</p>
          </div>
        </div>
        <div className="text-center mt-10 border-t border-white/5 pt-8">
          <p className="text-gray-600 text-xs leading-relaxed max-w-lg mx-auto">Trikal Vaani does not profit from dakshina offerings. All Arzi and Dhanyewaad dakshinas are used for Vedic puja samagri, mantra recitation costs, and charitable givings in Maa Shakti&apos;s name. Rohiit Gupta is the intermediary — Maa is the recipient.</p>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <section className="py-20 px-4 bg-[#0D1020]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Common Questions</p>
          <h2 className="font-serif text-3xl font-bold">Frequently Asked <span className="text-[#D4AF37]">Questions</span></h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="border border-white/10 rounded-xl p-5 bg-white/[0.02] group cursor-pointer">
              <summary className="font-semibold text-white text-sm md:text-base list-none flex justify-between items-center gap-4">
                {f.q}
                <span className="text-[#D4AF37] text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <p className="text-gray-400 text-sm leading-relaxed mt-4">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ headline, highlight, body, segment, waText }: { headline: string; highlight: string; body: string; segment: string; waText: string }) {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 to-transparent" /></div>
      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">{headline} <span className="text-[#D4AF37]">{highlight}</span></h2>
        <p className="text-gray-400 mb-10 leading-relaxed">{body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/?segment=${segment}`} className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]">Enter Birth Details → Get Reading</Link>
          <a href={`https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20${waText}`} target="_blank" rel="noopener noreferrer" className="border border-white/20 text-white px-8 py-4 rounded-lg text-lg hover:bg-white/5 transition-all duration-200">WhatsApp ₹499 Call</a>
        </div>
        <p className="text-gray-600 text-xs mt-6">Powered by Swiss Ephemeris · Lahiri Ayanamsha · Prokerala API · Reading framework by Rohiit Gupta</p>
      </div>
    </section>
  );
}

