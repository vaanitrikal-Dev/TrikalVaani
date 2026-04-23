/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * File: app/services/child-destiny/page.tsx
 * Version: 2.0 — EEAT + GEO + Schema Optimized
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import MaaDivineSeva from "@/components/shared/MaaDivineSeva";

export const metadata: Metadata = {
  title: "Child Destiny Reading — What Is My Child Born to Become? | Trikal Vaani",
  description: "Chief Vedic Architect Rohiit Gupta reads your child's 5th House, Moon sign & Mercury to reveal hidden talents, ideal education stream, and cosmic calling. ₹51 reading. Swiss Ephemeris precision.",
  keywords: ["child kundali reading astrology", "what will my child become astrology", "child destiny vedic astrology", "education stream astrology India", "5th house children astrology", "Rohiit Gupta child reading"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/about" }],
  openGraph: { title: "Child Destiny Reading | Trikal Vaani — Rohiit Gupta", description: "What is your child born to become? Jini AI reads their 5th house, Moon sign, and hidden talents.", url: "https://trikalvaani.com/services/child-destiny", siteName: "Trikal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/child-destiny" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", "@id": "https://trikalvaani.com/services/child-destiny", name: "Child Destiny — Talent & Education Reading", description: "Vedic astrology reading by Rohiit Gupta analyzing a child's 5th House, Moon nakshatra, Mercury/Jupiter placement, and Dasha timeline to reveal hidden talents, ideal education stream, and dharmic calling.", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/about", knowsAbout: ["Vedic Astrology", "Child Kundali", "5th House Talent", "Moon Nakshatra Learning"] }, offers: [{ "@type": "Offer", name: "AI Deep Reading", price: "51", priceCurrency: "INR" }, { "@type": "Offer", name: "Personal Call with Rohiit Gupta", price: "499", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Can Vedic astrology reveal my child's natural talents?", acceptedAnswer: { "@type": "Answer", text: "Yes. The 5th house in Vedic astrology governs intelligence, creativity, and natural genius. Its lord's strength, nakshatra, and planetary associations reveal what domain the child is cosmically gifted in — before any schooling shapes them. This is one of the most practical applications of Vedic astrology for modern parents." } },
      { "@type": "Question", name: "Which house in astrology shows a child's education?", acceptedAnswer: { "@type": "Answer", text: "The 4th house governs primary education and learning environment. The 5th house governs intelligence and creativity. The 9th house governs higher education and philosophical understanding. Mercury (intellect) and Jupiter (wisdom) placement determine the ideal academic stream — science, arts, commerce, or vocational." } },
      { "@type": "Question", name: "What is Moon nakshatra and why does it matter for children?", acceptedAnswer: { "@type": "Answer", text: "The Moon nakshatra is the lunar mansion the Moon occupied at birth. It determines the child's emotional nature, learning style, and core personality. A child with Moon in Rohini learns through beauty and consistency. A child in Ardra nakshatra learns through questioning and breaking things apart. Understanding this transforms how parents teach and support their child." } },
      { "@type": "Question", name: "At what age should I get my child's kundali read?", acceptedAnswer: { "@type": "Answer", text: "The earlier the better — ideally at birth or within the first few years. However, readings are most actionable around ages 5 to 12 when education stream decisions begin. A reading at 15 to 16 is highly valuable for stream selection. The birth chart does not change, so a reading is relevant at any age." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Child Destiny", item: "https://trikalvaani.com/services/child-destiny" }] },
  ],
};

const testimonials = [
  { name: "Anita Sharma", city: "Gurgaon", date: "November 2024", text: "My son was forced into science stream. Jini's reading showed his Mercury in 12th house with strong Venus — a creative communicator, not an engineer. He's now thriving in journalism.", stars: 5 },
  { name: "Prashant Nanda", city: "Bhubaneswar", date: "January 2025", text: "We were pushing our daughter toward medicine. Her chart showed Jupiter in 5th in Sagittarius — a natural teacher and philosopher. She's pursuing philosophy at DU and has never been happier.", stars: 5 },
  { name: "Kavya Reddy", city: "Hyderabad", date: "March 2025", text: "My 7-year-old son has anger issues. Rohiit ji read his chart and showed Mars conjunct the Ascendant — he's a natural leader, not a problem child. The framing changed everything for our family.", stars: 5 },
];

const reasons = [
  { icon: "👶", title: "The 5th House Is the House of Children & Talent", desc: "The 5th house governs intelligence, creativity, and the child's natural genius. Its lord's strength, nakshatra, and planetary associations reveal what domain the child is cosmically gifted in — before any schooling shapes them." },
  { icon: "🌙", title: "Moon Sign Reveals Emotional Intelligence & Learning Style", desc: "The Moon sign and nakshatra determine how a child processes information, relates to teachers, and handles pressure. A child with Moon in Gemini learns through conversation; in Taurus, through practice. Understanding this transforms parenting." },
  { icon: "☿", title: "Mercury & Jupiter Determine the Right Education Stream", desc: "Mercury (intellect) and Jupiter (wisdom) reveal the ideal education domain. Mercury strong in Virgo → analytics, science, writing. Jupiter in Sagittarius → law, teaching, philosophy. These are cosmic signatures, not guesses." },
];

const faqs = [
  { q: "Can Vedic astrology reveal my child's natural talents?", a: "Yes. The 5th house governs intelligence, creativity, and natural genius. Its lord's strength and planetary associations reveal what domain the child is cosmically gifted in — before any schooling shapes them." },
  { q: "Which house in astrology shows a child's education?", a: "The 4th house governs primary education. The 5th governs intelligence. The 9th governs higher education. Mercury and Jupiter placement determine the ideal academic stream — science, arts, commerce, or vocational." },
  { q: "What is Moon nakshatra and why does it matter for children?", a: "The Moon nakshatra determines the child's emotional nature and learning style. A child in Rohini learns through beauty and consistency. A child in Ardra learns through questioning. Understanding this transforms how parents teach and support their child." },
  { q: "At what age should I get my child's kundali read?", a: "The earlier the better. However, readings are most actionable around ages 5–12 when education decisions begin, and at 15–16 for stream selection. The birth chart does not change, so a reading is relevant at any age." },
];

export default function ChildDestinyPage() {
  return (
    <>
      <Script id="child-destiny-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-900/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Child Destiny Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">What Is Your Child <span className="text-[#D4AF37]">Born to Become?</span><br />Their Stars Know.</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">Jini AI reads your child's 5th House, Moon sign, Mercury & Lagna to reveal hidden talents, ideal education stream, and <span className="text-[#D4AF37] font-semibold">cosmic calling</span> — before society tells them who to be.</p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/about" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris + Prokerala API</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/?segment=child-destiny" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Get Child's Destiny Reading — ₹51</Link>
              <a href="https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20want%20a%20child%20destiny%20astrology%20reading" target="_blank" rel="noopener noreferrer" className="border border-[#25D366] text-[#25D366] font-semibold px-8 py-4 rounded-lg text-lg hover:bg-[#25D366]/10 transition-all duration-200 flex items-center justify-center gap-2"><WAIcon /> Talk to Rohiit Ji — ₹499</a>
            </div>
          </div>
        </section>
        <AuthorStrip />
        <ReasonsSection reasons={reasons} title="Why Vedic Astrology Reveals" highlight="Your Child's Gift" />
        <HowItWorksSection segment="child-destiny" items={[
          { step: "01", title: "Enter Child's Birth Details", desc: "Date, exact time, and place of birth. Even 10-minute precision is important for the Lagna and Moon sign." },
          { step: "02", title: "Jini Maps Their Cosmic Blueprint", desc: "5th house lord analysis, Moon nakshatra learning style, Mercury/Jupiter education domain, Dasha timeline for peak talent years." },
          { step: "03", title: "Get Their Talent & Career Map", desc: "₹51 reading: Top 3 talent domains, ideal education stream, which ages bring peak growth, which careers are cosmically supported." },
          { step: "04", title: "Book a Family Consultation", desc: "₹499 call with Rohiit ji for a comprehensive child development plan — including remedies for challenged placements." },
        ]} deliverables={["5th House hidden talent analysis", "Moon nakshatra learning style", "Mercury/Jupiter education domain", "Top 3 ideal career paths", "Ages of peak academic performance", "Challenging placements + remedies", "4-week child energy forecast"]} />
        <TestimonialsSection testimonials={testimonials} label="What Parents Are" />
        <MaaDivineSeva />
        <FaqSection faqs={faqs} />
        <CtaSection headline="Give Your Child the Gift of" highlight="Cosmic Clarity." body="Every child is born with a unique cosmic blueprint. ₹51 to read it — before the education system overwrites it." segment="child-destiny" />
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
function CtaSection({ headline, highlight, body, segment }: { headline: string; highlight: string; body: string; segment: string }) { return <section className="py-24 px-4 relative overflow-hidden"><div className="absolute inset-0 pointer-events-none"><div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 to-transparent" /></div><div className="relative max-w-2xl mx-auto text-center"><h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">{headline} <span className="text-[#D4AF37]">{highlight}</span></h2><p className="text-gray-400 mb-10 leading-relaxed">{body}</p><div className="flex flex-col sm:flex-row gap-4 justify-center"><Link href={`/?segment=${segment}`} className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]">Enter Birth Details → Get Reading</Link><a href={`https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20need%20a%20${segment}%20reading`} target="_blank" rel="noopener noreferrer" className="border border-white/20 text-white px-8 py-4 rounded-lg text-lg hover:bg-white/5 transition-all duration-200">WhatsApp ₹499 Call</a></div><p className="text-gray-600 text-xs mt-6">Powered by Swiss Ephemeris · Lahiri Ayanamsha · Prokerala API · Reading framework by Rohiit Gupta</p></div></section>; }
