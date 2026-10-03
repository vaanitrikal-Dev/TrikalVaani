/**
 * TRIKAAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/services/wealth-reading/page.tsx
 * Version: 4.2 (03 Oct 2026) — +5 H2 content sections from the Radar weekly report 03 Oct 2026 — content-edit brief / PUSH list.
 *   which planet for money, paisa kyun nahi rukta, कर्ज़ में डूबा इंसान क्या करे, अचानक धन के संकेत,
 *   wealth prediction by DOB + time. Rendered as a new WEALTH_SECTIONS block before Maa Divine Seva.
 *   Prices, schema, FAQs and CTA links unchanged. Remedies in editorial ruling #4 format.
 * (previous) Version: 4.1 — IR-0 cleanup
 *
 * v4.1 CHANGES vs v4.0:
 *   ❌ REMOVED fake testimonials (fabricated reviews + ★★★★★ + "Verified Experiences")
 *   ❌ REMOVED phantom ₹499 (hero call button, step 04, card strike-through, CTA button)
 *   ✅ /about → /founder (correct author URL — 3 spots)
 *   ✅ Removed "real estate and investment expertise" credential (with step 04) — IR
 *   ✅ KEPT Maa Divine Seva (real Arzi/Dhanyewaad dakshina feature)
 *   ✅ Brand/Jini/Prokerala/vendor already clean — left intact
 *   ✅ Real price on this page = ₹51 (reading)
 */
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: { absolute: "Dhana Yoga in Kundali — When Will I Get Rich?" },
  description: "Chief Vedic Architect Rohiit Gupta reads your 2nd House, Jupiter and Dhana Yoga to reveal your wealth timeline, peak earning years, and investment sectors your chart favors. ₹51 deep reading.",
  keywords: ["dhana yoga kundali astrology", "when will I get rich astrology", "wealth astrology vedic India", "2nd house money astrology", "Lakshmi yoga astrology"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  openGraph: { title: "Dhana Yoga — When Will I Get Rich? | Trikaal Vaani", description: "Rohiit Gupta decodes your 2nd House, Jupiter and Dhana Yoga for your wealth timeline.", url: "https://trikalvaani.com/services/wealth-reading", siteName: "Trikaal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/wealth-reading" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Dhana Yoga — Wealth and Prosperity Reading", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/founder" }, offers: [{ "@type": "Offer", price: "51", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "What is Dhana Yoga in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "Dhana Yoga is a specific planetary combination indicating significant wealth accumulation. The most powerful include the 2nd and 11th lord exchanging signs, Jupiter aspecting the 2nd house, and the presence of Lakshmi Yoga or Gaja Kesari Yoga." } },
      { "@type": "Question", name: "Which planets indicate wealth in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "Jupiter is the primary significator of wealth. The 2nd house lord governs earned wealth. The 11th lord governs gains. Venus rules luxury. When these align in a positive Dasha, significant wealth accumulation occurs." } },
      { "@type": "Question", name: "What is Lakshmi Yoga in astrology?", acceptedAnswer: { "@type": "Answer", text: "Lakshmi Yoga is formed when the 9th lord is in its own sign or exaltation and conjuncts or aspects the Lagna lord. It is associated with prosperity and material abundance — but must be activated by the right Mahadasha to manifest." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Wealth Reading", item: "https://trikalvaani.com/services/wealth-reading" }] },
  ],
};


type WlSection = { id: string; h2: string; paras: string[] };

const WEALTH_SECTIONS: WlSection[] = [
  {
    id: "dhan-kis-grah",
    h2: "Which Planet Is Responsible for Money in Astrology?",
    paras: [
      "**Jupiter (Guru)** is the main karaka of wealth, **Venus (Shukra)** of comfort and luxury, and **Mercury (Budh)** of trade and income from intelligence. But in your own chart the deciding factors are the **2nd house lord** (savings and family wealth), the **11th house lord** (income and gains), and whether a **Dhana Yoga** links them with the 1st, 5th or 9th lords.",
      "A strong karaka in a weak house still struggles to hold money, and a modest karaka in a well-connected house can do very well — which is why wealth is read from combinations, not one planet. How to check your own chart step by step: [Dhan Yog Kaise Jaanchein](/blog/dhan-yog-kaise-jaanchein).",
    ],
  },
  {
    id: "paisa-nahi-rukta",
    h2: "Paisa Kyun Nahi Rukta? — Kundali Ke Teen Sanket",
    paras: [
      "Kamaai hone ke baad bhi paisa na rukne ke teen classical sanket dekhe jaate hain: **dwitiya (2nd) bhaav ya uske swami par Rahu/Shani ka prabhav**, **12th bhaav (kharch) ka mazboot hona** jabki 11th kamzor ho, aur **chal rahi dasha** ka 12th ya 6th bhaav se juda hona.",
      "Isme \"dosh\" se zyada samay ka hissa hota hai — kharch ka daur aksar ek dasha ke saath aata aur jaata hai. Upay: **Kya:** Guruvar ko peeli daal ya kele ka daan. **Kab:** har Guruvar subah. **Kharch:** ₹20–50. **Kitne din:** 16 Guruvar. **Aapke liye kyun:** Guru dhan ka kaarak hai, aur daan uska sabse saral shastriya upay hai.",
    ],
  },
  {
    id: "karz-kya-kare",
    h2: "कर्ज़ में डूबा इंसान क्या करे — कुंडली और व्यवहार दोनों",
    paras: [
      "पहले व्यवहार: कर्ज़ों की पूरी सूची बनाइए, सबसे ऊँचे ब्याज वाला पहले चुकाइए, और नया कर्ज़ लेना बंद कीजिए — कोई उपाय इसकी जगह नहीं लेता। कुंडली में कर्ज़ **छठे भाव और उसके स्वामी** से देखा जाता है, और उससे मुक्ति का समय अक्सर उस दशा के बदलने से जुड़ा होता है।",
      "परंपरा का उपाय, पाँच हिस्सों में: **क्या:** मंगलवार को हनुमान चालीसा और ऋणमोचक मंगल स्तोत्र का पाठ। **कब:** मंगलवार सुबह। **कितने का:** मुफ़्त। **कितने दिन:** 21 मंगलवार। **आपके लिए क्यों:** मंगल को ऋण-मोचन का कारक माना गया है। कर्ज़ मुक्ति का समय कब खुलता है, यह [Debt-Free Window](/blog/dasha-timing-debt-free-window-astrology-hindi) में है, और पूरे उपाय [कर्ज़ मुक्ति उपाय](/blog/karz-mukti-remedies-astrology-hindi) में।",
    ],
  },
  {
    id: "achanak-dhan",
    h2: "अचानक धन प्राप्ति के संकेत — कुंडली में कहाँ दिखते हैं",
    paras: [
      "अचानक या अप्रत्याशित धन — विरासत, बीमा, लॉटरी, अचानक बड़ा सौदा — का संबंध **अष्टम भाव** और **राहु** से जोड़ा जाता है, क्योंकि अष्टम छिपे और अचानक आने वाले धन का भाव है। अष्टमेश का एकादश (लाभ) से संबंध, या एकादश में राहु, परंपरा में इसके संकेत माने गए हैं।",
      "पर यही भाव अचानक नुकसान का भी है, इसलिए ऐसा योग जोखिम लेने की अनुमति नहीं देता — सट्टा या लॉटरी पर भरोसा करना इसका अर्थ नहीं। जो धन टिकता है वह द्वितीय और एकादश भाव से आता है। अपनी कुंडली के धन योग [कुंडली में धन योग](/blog/kundali-mein-dhan-yog) में देखिए।",
    ],
  },
  {
    id: "wealth-by-dob",
    h2: "Wealth Prediction by Date of Birth and Time — What You Need",
    paras: [
      "Wealth prediction needs the **date, exact time and place** of birth. The date fixes the planets; the time fixes the **2nd and 11th house cusps**, which move every two hours or so — and those houses are the core of any money reading. Date alone gives a Moon-sign level overview, not a wealth timeline.",
      "With full details, the reading identifies your Dhana Yogas, the strength of the 2nd and 11th lords, and the **dasha periods** most likely to bring gains — the \"peak earning years\" question. The wider classical combinations are explained in [Dhan Yog in Kundli](/blog/dhan-yog-in-kundli-wealth-combinations).",
    ],
  },
];

function WlRich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) return <Link key={`${k}-l-${i}`} href={link[2]} className="text-[#D4AF37] underline underline-offset-2 hover:opacity-80">{link[1]}</Link>;
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={`${k}-b-${i}`} className="text-[#D4AF37]">{part.slice(2, -2)}</strong>;
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

export default function WealthReadingPage() {
  return (
    <>
      <Script id="schema-wealth" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#D4AF37]/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#7C3AED]/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Wealth Karma Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">When Will You <span className="text-[#D4AF37]">Get Rich?</span><br />Your Dhana Yoga Knows.</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">Trikaal AI reads your 2nd House, Jupiter and Dhana Yoga combinations to reveal your wealth timeline, peak earning years, and which sectors your chart <span className="text-[#D4AF37] font-semibold">cosmically favors</span>.</p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/founder" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris (self-hosted)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/?segment=wealth" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Check My Dhana Yoga — ₹51</Link>
            </div>
          </div>
        </section>
        <AuthorStrip />
        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Why Vedic Astrology Predicts <span className="text-[#D4AF37]">Your Wealth Timeline</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "💰", title: "The 2nd and 11th Houses Govern Wealth Accumulation", desc: "The 2nd house rules earned wealth and family assets. The 11th house governs gains, profits, and income streams. When these houses and their lords are strong and activated by the right Dasha — wealth flows." },
                { icon: "♃", title: "Jupiter Is the Planet of Abundance", desc: "Jupiter (Guru) is the significator of wealth, expansion, and fortune in Vedic astrology. Its placement and transit through your 2nd and 11th houses creates the wealth windows that define financial breakthroughs." },
                { icon: "✨", title: "Dhana Yoga Combinations Predict Financial Destiny", desc: "Classical Vedic texts describe over 32 Dhana Yogas. Lakshmi Yoga, Chandra-Mangala Yoga, and Gaja Kesari Yoga each carry different wealth signatures. Identifying yours reveals the source and timing of your fortune." },
              ].map((r, i) => (
                <div key={i} className="border border-white/10 rounded-2xl p-7 bg-white/[0.03] hover:border-[#D4AF37]/40 transition-all duration-300 group">
                  <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{r.icon}</div>
                  <h3 className="font-serif text-xl font-bold text-[#D4AF37] mb-3">{r.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                {[
                  { step: "01", title: "Enter Your Birth Details", desc: "Date, time, place. The 2nd house cusp degree changes every 2 hours — precision is critical for wealth analysis." },
                  { step: "02", title: "Trikaal Scans Your Dhana Yogas", desc: "2nd and 11th house lords, Jupiter placement, Lakshmi Yoga check, Chandra-Mangala Yoga, and Dasha activation analysis." },
                  { step: "03", title: "Get Your Wealth Timeline", desc: "₹51 deep reading: Do you have Dhana Yoga? When are your peak earning years? Which sectors does your chart favor?" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{s.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <DeliverableCard segment="wealth" items={["Dhana Yoga identification and strength", "2nd and 11th house wealth analysis", "Peak earning years (Dasha-based)", "Investment sectors your chart favors", "Wealth blocks and remedies", "Lakshmi and Gaja Kesari Yoga check", "4-week financial energy forecast"]} />
            </div>
          </div>
        </section>
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            {WEALTH_SECTIONS.map((sec) => (
              <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-10">
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4 text-[#D4AF37]">{sec.h2}</h2>
                {sec.paras.map((p, i) => (
                  <p key={i} className="text-gray-300 leading-relaxed mb-4"><WlRich text={p} k={`${sec.id}-${i}`} /></p>
                ))}
              </div>
            ))}
          </div>
        </section>
        <MaaDivineSeva />
        <FaqSection items={[
          { q: "What is Dhana Yoga in Vedic astrology?", a: "Dhana Yoga is a specific planetary combination indicating significant wealth accumulation. The most powerful include the 2nd and 11th lord exchanging signs, Jupiter aspecting the 2nd house, and the presence of Lakshmi Yoga or Gaja Kesari Yoga." },
          { q: "Which planets indicate wealth in Vedic astrology?", a: "Jupiter is the primary significator of wealth. The 2nd house lord governs earned wealth. The 11th lord governs gains. Venus rules luxury. When these align in a positive Dasha, significant wealth accumulation occurs." },
          { q: "What is Lakshmi Yoga in astrology?", a: "Lakshmi Yoga is formed when the 9th lord is in its own sign or exaltation and conjuncts or aspects the Lagna lord. It is associated with prosperity and material abundance — but must be activated by the right Mahadasha to manifest." },
          { q: "Can astrology predict the best sectors for investment?", a: "Yes. The 2nd house sign and planets aspecting it reveal which domains generate wealth for you. Mars-ruled charts do well in real estate. Jupiter-ruled charts excel in finance and consulting. Venus-ruled charts profit from luxury industries." },
        ]} />
        <CtaSection headline="Your Wealth Timeline Is Already" highlight="Written." body="Stop working harder. Start working in alignment. ₹51 to know your Dhana Yoga and peak earning window." segment="wealth" />
        <SiteFooter />
      </main>
    </>
  );
}
/* ─── SHARED COMPONENTS (inlined) ─────────────── */

function AuthorStrip() {
  return (
    <section className="py-12 px-4 border-y border-white/5 bg-[#0A0D18]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-3xl font-serif text-[#D4AF37] font-bold">RG</div>
        <div>
          <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium mb-1">About Your Vedic Architect</p>
          <h2 className="font-serif text-xl font-bold text-white mb-2">Rohiit Gupta — Chief Vedic Architect, Trikaal Vaani</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. As founder of Trikaal Vaani, he built India&apos;s first AI-powered Vedic platform combining Swiss Ephemeris precision with premium AI reasoning. All readings are designed by Rohiit — Trikaal AI applies his framework to your unique birth chart.</p>
          <div className="flex gap-3 mt-3 flex-wrap">
            {["15+ Years Vedic Study", "Parashara BPHS Tradition", "Swiss Ephemeris Precision", "India Based"].map((t) => (
              <span key={t} className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DeliverableCard({ segment, items }: { segment: string; items: string[] }) {
  return (
    <div className="border border-[#D4AF37]/30 rounded-2xl p-8 bg-gradient-to-br from-[#D4AF37]/10 to-[#7C3AED]/10">
      <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-6">What You Receive</p>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="text-[#D4AF37] text-lg">✦</span>
            <span className="text-gray-300">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[#D4AF37] text-2xl font-bold">₹51</p>
          <p className="text-gray-500 text-xs">Introductory price</p>
        </div>
        <Link href={`/?segment=${segment}`} className="bg-[#D4AF37] text-[#080B12] font-bold px-6 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200">Unlock Now</Link>
      </div>
    </div>
  );
}

function MaaDivineSeva() {
  const arziAmounts = [101, 201, 501, 1001, 2101, 5001, 11000, 21000, 51000, 108000];
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
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            These are not fees. They are <span className="text-[#D4AF37] font-semibold">dakshina</span> — an offering from the heart, placed at Maa Shakti&apos;s feet through Trikaal Vaani. <span className="text-white font-semibold">There is no ceiling on devotion.</span> Starting ₹101, with absolutely no upper limit.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* ARZI */}
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#D4AF37]/8 to-transparent flex flex-col">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🪔</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Arzi to Maa</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Place your deepest prayer at Maa Shakti&apos;s feet. Rohiit ji personally transmits your Arzi during Vedic prayer. <span className="text-[#D4AF37] font-semibold">Starting ₹101 — no upper limit.</span></p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Suggested dakshina — or offer any amount from your heart</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {arziAmounts.map((amt) => (
                  <a key={amt} href={`https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Arzi%20to%20Maa%20dakshina%20%E2%82%B9${amt}.%20Jai%20Maa%20Shakti!`} target="_blank" rel="noopener noreferrer" className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium">
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20Arzi%20to%20Maa%20with%20my%20own%20dakshina.%20Jai%20Maa%20Shakti!" target="_blank" rel="noopener noreferrer" className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200">My own amount ✦</a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">No amount too large. Devotion has no ceiling.</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {["Your prayer submitted to Maa Shakti", "Rohiit ji performs Vedic mantra recitation on your behalf", "WhatsApp confirmation of prayer transmission", "For love, health, protection, success, peace, family", "No prayer too big · No dakshina too large"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400"><span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>{item}</li>
              ))}
            </ul>
            <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20Shakti.%20Please%20guide%20me.%20Jai%20Maa%20Shakti!" target="_blank" rel="noopener noreferrer" className="block text-center bg-[#D4AF37] text-[#080B12] font-bold px-6 py-4 rounded-xl hover:bg-[#e8c84a] transition-all duration-200 text-base">🙏 Submit My Arzi to Maa</a>
            <p className="text-center text-gray-600 text-xs mt-3">Starts ₹101 · No upper limit · Pure devotion</p>
          </div>
          {/* DHANYEWAAD */}
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#7C3AED]/10 to-transparent flex flex-col">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🌺</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Maa Ka Dhanyewaad</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Your prayer was answered. Return gratitude to Maa Shakti — gratitude is the highest form of worship. <span className="text-[#D4AF37] font-semibold">Starting ₹101 — no upper limit.</span></p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Gratitude offering — give freely from the heart</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {dhanyeAmounts.map((amt) => (
                  <a key={amt} href={`https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20Dhanyewaad%20dakshina%20%E2%82%B9${amt}.%20Jai%20Maa!`} target="_blank" rel="noopener noreferrer" className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium">
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                <a href="https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20I%20want%20to%20offer%20Dhanyewaad%20to%20Maa%20with%20my%20own%20dakshina%20amount.%20Jai%20Maa!" target="_blank" rel="noopener noreferrer" className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200">From my heart ✦</a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">The bigger the gratitude, the bigger the next blessing.</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {["Your gratitude prayer delivered to Maa Shakti", "Rohiit ji performs Vedic thanksgiving puja on your behalf", "WhatsApp confirmation with blessings for your next chapter", "For answered prayers in love, health, career, family", "Gratitude to Maa multiplies blessings — no ceiling"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400"><span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>{item}</li>
              ))}
            </ul>
            <a href="https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20baat%20suni.%20Main%20Maa%20ka%20Dhanyewaad%20dena%20chahta%20hoon.%20Jai%20Maa!" target="_blank" rel="noopener noreferrer" className="block text-center border border-[#D4AF37] text-[#D4AF37] font-bold px-6 py-4 rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-200 text-base">🌺 Offer My Dhanyewaad to Maa</a>
            <p className="text-center text-gray-600 text-xs mt-3">Starts ₹101 · No upper limit · Jai Maa Shakti</p>
          </div>
        </div>
        <div className="text-center mt-10 border-t border-white/5 pt-8">
          <p className="text-gray-600 text-xs leading-relaxed max-w-lg mx-auto">Trikaal Vaani does not profit from dakshina offerings. All Arzi and Dhanyewaad dakshinas are used for Vedic puja samagri, mantra recitation costs, and charitable givings in Maa Shakti&apos;s name. Rohiit Gupta is the intermediary — Maa is the recipient.</p>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="py-20 px-4 bg-[#0D1020]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Common Questions</p>
          <h2 className="font-serif text-3xl font-bold">Frequently Asked <span className="text-[#D4AF37]">Questions</span></h2>
        </div>
        <div className="space-y-4">
          {items.map((f, i) => (
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

function CtaSection({ headline, highlight, body, segment }: { headline: string; highlight: string; body: string; segment: string }) {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 to-transparent" />
      </div>
      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">{headline} <span className="text-[#D4AF37]">{highlight}</span></h2>
        <p className="text-gray-400 mb-10 leading-relaxed">{body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/?segment=${segment}`} className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]">Enter Birth Details → Get Reading</Link>
        </div>
        <p className="text-gray-600 text-xs mt-6">Powered by Swiss Ephemeris · Lahiri Ayanamsha · Reading framework by Rohiit Gupta</p>
      </div>
    </section>
  );
}
