/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * File: app/services/spiritual-purpose/page.tsx
 * Version: 2.0 — EEAT + GEO + Schema Optimized
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import MaaDivineSeva from "@/components/shared/MaaDivineSeva";

export const metadata: Metadata = {
  title: "What Is My Soul's Purpose? Vedic Spiritual Purpose Reading | Trikal Vaani",
  description: "Chief Vedic Architect Rohiit Gupta reads your Ketu, Atmakaraka & 12th House to reveal past-life karma, your dharmic mission, and the soul lesson you were born to complete. ₹51 reading.",
  keywords: ["soul purpose astrology vedic", "spiritual path astrology India", "Ketu astrology past life", "12th house spiritual astrology", "Atmakaraka soul purpose", "moksha astrology reading", "Rohiit Gupta spiritual astrology"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/about" }],
  openGraph: { title: "What Is My Soul's Purpose? | Trikal Vaani — Rohiit Gupta", description: "Your Ketu and Atmakaraka hold the secret. Jini AI decodes your past-life karma and soul's dharmic mission.", url: "https://trikalvaani.com/services/spiritual-purpose", siteName: "Trikal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/spiritual-purpose" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", "@id": "https://trikalvaani.com/services/spiritual-purpose", name: "Spiritual Purpose — Soul Mission Reading", description: "Vedic astrology reading by Rohiit Gupta analyzing Atmakaraka, Ketu placement, 12th house spiritual indicators, and Rahu growth direction to reveal the soul's past-life mastery and present dharmic mission.", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/about", knowsAbout: ["Vedic Astrology", "Atmakaraka", "Ketu Past Life", "12th House Spirituality", "Moksha Yoga"] }, offers: [{ "@type": "Offer", name: "AI Deep Reading", price: "51", priceCurrency: "INR" }, { "@type": "Offer", name: "Personal Call with Rohiit Gupta", price: "499", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "What is Atmakaraka in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "Atmakaraka is the planet with the highest degree in your birth chart. In the Jaimini system of Vedic astrology, it represents the soul's primary lesson and deepest longing in this lifetime. When you live in alignment with your Atmakaraka's energy — through its sign, house, and nakshatra — life feels purposeful. When misaligned, existential emptiness persists regardless of material success." } },
      { "@type": "Question", name: "What does Ketu represent in a birth chart?", acceptedAnswer: { "@type": "Answer", text: "Ketu represents where your soul has already mastered in past lifetimes — your accumulated karmic wisdom. Its house and sign show your natural gifts, but also your attachment to what is already complete. Ketu's placement often explains unexplained fears, instant mastery in certain areas, and the sense of already knowing things you have never been taught." } },
      { "@type": "Question", name: "What is the 12th house in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "The 12th house governs spiritual liberation (moksha), foreign connections, losses, retreat from the world, and the dissolution of ego. A strong 12th house often indicates a soul drawn to meditation, service, ashram life, or foreign spiritual practice. Jupiter in the 12th is considered highly auspicious for spiritual growth." } },
      { "@type": "Question", name: "What is Moksha Yoga in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "Moksha Yoga refers to specific planetary combinations that indicate a soul on a path toward liberation in this lifetime. These include Ketu in the 12th house, the 12th lord in the 9th house, Jupiter aspecting the 12th house, or the Moon-Ketu conjunction in spiritual houses. Identifying these in your chart explains why material pursuits feel ultimately unsatisfying." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Spiritual Purpose", item: "https://trikalvaani.com/services/spiritual-purpose" }] },
  ],
};

const testimonials = [
  { name: "Swati Bhardwaj", city: "Rishikesh", date: "December 2024", text: "I left a ₹40L corporate job to teach yoga. Everyone thought I was crazy. Jini showed my Ketu in the 10th house and Jupiter in the 12th. It all made sense.", stars: 5 },
  { name: "Arun Kumar", city: "Varanasi", date: "October 2024", text: "I've always felt I had a purpose beyond money. My reading showed Moon-Ketu conjunction in the 9th house — a soul that came to teach. I now run a free Vedic study group of 200 people.", stars: 5 },
  { name: "Lakshmi Prasad", city: "Mysore", date: "February 2025", text: "The Atmakaraka reading was the most profound thing anyone has ever told me about myself. Rohiit ji described my past life pattern so accurately my mother started crying.", stars: 5 },
];

const reasons = [
  { icon: "☊", title: "Ketu & the 12th House Reveal Past-Life Karma", desc: "Ketu represents where your soul has already mastered — your accumulated past-life wisdom. The 12th house governs spiritual liberation and the dissolution of ego. Together, they map the karmic curriculum your soul enrolled in before birth." },
  { icon: "🌟", title: "Atmakaraka Is Your Soul's Deepest Longing", desc: "The Atmakaraka (planet with the highest degree in your chart) is your soul's primary lesson in this lifetime. When you live in alignment with your Atmakaraka's energy, life feels meaningful. When you don't — no amount of achievement satisfies." },
  { icon: "🕉", title: "Rahu Shows Your Soul's Growth Direction", desc: "While Ketu shows where you've been, Rahu shows where your soul is reaching — its growth edge in this lifetime. The Rahu house and sign reveal the new territory your soul chose to explore, often feeling alien and compelling simultaneously." },
];

const faqs = [
  { q: "What is Atmakaraka in Vedic astrology?", a: "Atmakaraka is the planet with the highest degree in your birth chart. It represents the soul's primary lesson in this lifetime. When you live in alignment with your Atmakaraka's energy, life feels purposeful. When misaligned, existential emptiness persists regardless of material success." },
  { q: "What does Ketu represent in a birth chart?", a: "Ketu represents where your soul has already mastered in past lifetimes. Its house and sign show your natural gifts and your karmic completions. Ketu's placement explains unexplained fears, instant mastery in certain areas, and the sense of already knowing things you have never been taught." },
  { q: "What is the 12th house in Vedic astrology?", a: "The 12th house governs spiritual liberation (moksha), retreat from the world, and the dissolution of ego. A strong 12th house often indicates a soul drawn to meditation, service, or spiritual practice. Jupiter in the 12th is considered highly auspicious for spiritual growth." },
  { q: "What is Moksha Yoga in Vedic astrology?", a: "Moksha Yoga refers to planetary combinations indicating a soul on a path toward liberation. These include Ketu in the 12th house, Jupiter aspecting the 12th house, or the Moon-Ketu conjunction in spiritual houses. These explain why material pursuits feel ultimately unsatisfying for certain souls." },
];

export default function SpiritualPurposePage() {
  return (
    <>
      <Script id="spiritual-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[#D4AF37]/8 rounded-full blur-[120px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Soul Purpose Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">What Is Your <span className="text-[#D4AF37]">Soul's Purpose</span><br />in This Lifetime?</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">Jini AI reads your Ketu, Atmakaraka & 12th House to decode your past-life karma, present dharmic mission, and the <span className="text-[#D4AF37] font-semibold">soul lesson</span> you were born to complete.</p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/about" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris + Prokerala API</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/?segment=spiritual-purpose" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Get My Soul Purpose Reading — ₹51</Link>
              <a href="https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20want%20a%20spiritual%20purpose%20astrology%20reading" target="_blank" rel="noopener noreferrer" className="border border-[#25D366] text-[#25D366] font-semibold px-8 py-4 rounded-lg text-lg hover:bg-[#25D366]/10 transition-all duration-200 flex items-center justify-center gap-2"><WAIcon /> Talk to Rohiit Ji — ₹499</a>
            </div>
          </div>
        </section>
        <AuthorStrip />
        <ReasonsSection reasons={reasons} title="Why Vedic Astrology Reveals" highlight="Your Soul's Mission" />
        <HowItWorksSection segment="spiritual-purpose" items={[
          { step: "01", title: "Enter Your Birth Details", desc: "Date, exact time, and place. Your Atmakaraka degree is calculated to the arc-minute — precision is essential for soul-level readings." },
          { step: "02", title: "Jini Reads Your Soul Blueprint", desc: "Atmakaraka identification, Ketu house/sign past-life analysis, 12th house spiritual indicators, and Rahu growth direction mapping." },
          { step: "03", title: "Receive Your Soul's Curriculum", desc: "₹51 reading: Your soul's past-life mastery, present dharmic mission, spiritual path (Bhakti/Jnana/Karma/Raja), and moksha indicators." },
          { step: "04", title: "Deep Spiritual Consultation", desc: "₹499 call with Rohiit ji — for those at crossroads between worldly life and spiritual calling, or seeking Vedic remedies to align with dharma faster." },
        ]} deliverables={["Atmakaraka soul purpose decoding", "Ketu past-life mastery analysis", "Rahu soul growth direction", "12th house spiritual liberation map", "Your dharmic path (Bhakti/Jnana/etc.)", "Moksha yoga identification", "4-week spiritual energy forecast"]} />
        <TestimonialsSection testimonials={testimonials} label="What Seekers Are" />
        <MaaDivineSeva />
        <FaqSection faqs={faqs} />

        {/* Arzi to Maa special note for spiritual page */}
        <section className="py-8 px-4">
          <div className="max-w-2xl mx-auto text-center border border-[#D4AF37]/15 rounded-2xl p-6 bg-[#D4AF37]/3">
            <p className="text-gray-400 text-sm leading-relaxed">
              <span className="text-[#D4AF37] font-semibold">Spiritual seekers:</span> The Maa Ki Arzi and Maa Ka Dhanyewaad sections above are especially sacred for those on a spiritual path. Your prayer to Maa Shakti, combined with your soul-purpose reading, creates a powerful alignment between cosmic knowledge and divine grace.
            </p>
          </div>
        </section>

        <CtaSection headline="You Came Here for a" highlight="Reason." body="The fact that you're asking this question is itself a karmic signal. ₹51 to read your soul's blueprint and finally understand why you're here." segment="spiritual-purpose" />
        <SiteFooter />
      </main>
    </>
  );
}

function WAIcon() { return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>; }
function AuthorStrip() { return <section className="py-12 px-4 border-y border-white/5 bg-[#0A0D18]"><div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8"><div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-3xl font-serif text-[#D4AF37] font-bold">RG</div><div><p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium mb-1">About Your Vedic Architect</p><h2 className="font-serif text-xl font-bold text-white mb-2">Rohiit Gupta — Chief Vedic Architect, Trikal Vaani</h2><p className="text-gray-400 text-sm leading-relaxed">Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. As founder of Trikal Vaani, he built India's first AI-powered Vedic platform combining Swiss Ephemeris precision with Gemini AI reasoning. All readings are designed by Rohiit — Jini AI applies his framework to your unique birth chart.</p><div className="flex gap-3 mt-3 flex-wrap">{["15+ Years Vedic Study","Parashara BPHS Tradition","Swiss Ephemeris Precision","Delhi NCR Based"].map(t=><span key={t} className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded-full">{t}</span>)}</div></div></div></section>; }
function ReasonsSection({ reasons, title, highlight }: { reasons: { icon: string; title: string; desc: string }[]; title: string; highlight: string }) { return <section className="py-20 px-4 bg-[#0D1020]"><div className="max-w-5xl mx-auto"><div className="text-center mb-14"><p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p><h2 className="font-serif text-3xl md:text-4xl font-bold">{title} <span className="text-[#D4AF37]">{highlight}</span></h2></div><div className="grid md:grid-cols-3 gap-8">{reasons.map((r,i)=><div key={i} className="border border-white/10 rounded-2xl p-7 bg-white/[0.03] hover:border-[#D4AF37]/40 transition-all duration-300 group"><div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{r.icon}</div><h3 className="font-serif text-xl font-bold text-[#D4AF37] mb-3">{r.title}</h3><p className="text-gray-400 leading-relaxed text-sm">{r.desc}</p></div>)}</div></div></section>; }
function HowItWorksSection({ segment, items, deliverables }: { segment: string; items: { step: string; title: string; desc: string }[]; deliverables: string[] }) { return <section className="py-20 px-4"><div className="max-w-5xl mx-auto"><div className="grid md:grid-cols-2 gap-10 items-center"><div className="space-y-6">{items.map((s,i)=><div key={i} className="flex gap-5"><div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div><div><h4 className="font-semibold text-white mb-1">{s.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p></div></div>)}</div><div className="border border-[#D4AF37]/30 rounded-2xl p-8 bg-gradient-to-br from-[#D4AF37]/10 to-[#7C3AED]/10"><p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-6">What You Receive</p><ul className="space-y-4">{deliverables.map((item,i)=><li key={i} className="flex items-center gap-3 text-sm"><span className="text-[#D4AF37] text-lg">✦</span><span className="text-gray-300">{item}</span></li>)}</ul><div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between"><div><p className="text-gray-500 text-xs line-through">₹499</p><p className="text-[#D4AF37] text-2xl font-bold">₹51</p><p className="text-gray-500 text-xs">Introductory price</p></div><Link href={`/?segment=${segment}`} className="bg-[#D4AF37] text-[#080B12] font-bold px-6 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200">Unlock Now</Link></div></div></div></div></section>; }
function TestimonialsSection({ testimonials, label = "What People Are" }: { testimonials: { name: string; city: string; date: string; text: string; stars: number }[]; label?: string }) { return <section className="py-20 px-4 bg-[#0D1020]"><div className="max-w-5xl mx-auto"><div className="text-center mb-14"><p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Verified Experiences</p><h2 className="font-serif text-3xl font-bold">{label} <span className="text-[#D4AF37]">Saying</span></h2></div><div className="grid md:grid-cols-3 gap-6">{testimonials.map((t,i)=><div key={i} className="border border-white/10 rounded-2xl p-6 bg-white/[0.03]"><div className="flex gap-1 mb-1">{Array.from({length:t.stars}).map((_,j)=><span key={j} className="text-[#D4AF37]">★</span>)}</div><p className="text-gray-500 text-xs mb-4">{t.date} · {t.city}</p><p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{t.name[0]}</div><p className="font-semibold text-sm text-white">{t.name}</p></div></div>)}</div></div></section>; }
function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) { return <section className="py-20 px-4 bg-[#0D1020]"><div className="max-w-3xl mx-auto"><div className="text-center mb-14"><p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Common Questions</p><h2 className="font-serif text-3xl font-bold">Frequently Asked <span className="text-[#D4AF37]">Questions</span></h2></div><div className="space-y-4">{faqs.map((f,i)=><details key={i} className="border border-white/10 rounded-xl p-5 bg-white/[0.02] group cursor-pointer"><summary className="font-semibold text-white text-sm md:text-base list-none flex justify-between items-center gap-4">{f.q}<span className="text-[#D4AF37] text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span></summary><p className="text-gray-400 text-sm leading-relaxed mt-4">{f.a}</p></details>)}</div></div></section>; }
function CtaSection({ headline, highlight, body, segment }: { headline: string; highlight: string; body: string; segment: string }) { return <section className="py-24 px-4 relative overflow-hidden"><div className="absolute inset-0 pointer-events-none"><div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent" /></div><div className="relative max-w-2xl mx-auto text-center"><h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">{headline} <span className="text-[#D4AF37]">{highlight}</span></h2><p className="text-gray-400 mb-10 leading-relaxed">{body}</p><div className="flex flex-col sm:flex-row gap-4 justify-center"><Link href={`/?segment=${segment}`} className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]">Enter Birth Details → Get Reading</Link><a href={`https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20need%20a%20${segment}%20reading`} target="_blank" rel="noopener noreferrer" className="border border-white/20 text-white px-8 py-4 rounded-lg text-lg hover:bg-white/5 transition-all duration-200">WhatsApp ₹499 Call</a></div><p className="text-gray-600 text-xs mt-6">Powered by Swiss Ephemeris · Lahiri Ayanamsha · Prokerala API · Reading framework by Rohiit Gupta</p></div></section>; }
