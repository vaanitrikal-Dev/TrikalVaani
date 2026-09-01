/**
 * TRIKAAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/services/property-yog/page.tsx
 * Version: 5.0 — schema render fix + Hindi layer + hub interlinking
 *
 * v5.0 CHANGES vs v4.1 (2026-08-31):
 *   1. ❗ CRITICAL — SCHEMA WAS NEVER REACHING THE HTML.
 *      v4.1 emitted the @graph through <Script> from next/script. Verified
 *      on the live page 31 Aug 2026: this page served ZERO real
 *      <script type="application/ld+json"> tags. The JSON existed only as
 *      a deferred "$f" reference inside the React Flight payload.
 *      Comparison on the same crawl: /hast-rekha-calculator 1 tag,
 *      /astrologer-delhi 3 tags, /calculators/free-sade-sati-calculator
 *      1 tag — all fine. Only this page was empty.
 *      So the money page ranking 11 and 12 has been giving Google and the
 *      AI crawlers no Service, no Offer, no price and no FAQPage at all.
 *      FIX: plain <script type="application/ld+json"> rendered directly
 *      from this server component, and the next/script import removed.
 *      This is the exact failure app/hast-rekha-calculator/page.tsx v1.2
 *      already documented — "DO NOT convert back to next/script … the
 *      schema becomes JS-injected, and AI crawlers do not execute JS."
 *      That lesson had never been applied here.
 *      DO NOT reintroduce next/script on this page.
 *   2. HINDI LAYER — page had 0 Devanagari characters. Radar (30 Aug) has
 *      "property yog in kundli" at 11 and "संपत्ति योग ज्योतिष" at 12; the
 *      second is a Hindi query and this page carried no Hindi at all.
 *      Four new Devanagari H2 sections added (~2,600 Devanagari chars).
 *   3. "Delhi NCR" RESTORED. v4.1 removed it under the old brand-guard
 *      rule s/Delhi NCR/India/g. That rule was retired in brand-guard v6
 *      (31 Aug) after the Google Business Profile was verified, so the
 *      local wording is correct again and is now a dedicated section.
 *   4. INTERNAL LINKS 2 -> 26. The property cluster already existed in
 *      Supabase — the pillar, the yogas guide, Mars-as-Bhoomi-Karaka, the
 *      Dasha buy-window, 4th-house Mangal and Pitra Dosh, plus two /learn
 *      references — and NOT ONE was linked from this page. Same pattern as
 *      the palmistry page: the cluster was fine, the money page was cut
 *      off from it. Every href verified against the live sitemap.
 *   5. ₹499 DELIBERATELY NOT ADDED. It is a real product now, but it is
 *      still absent from /pricing, and v4.1 removed it from here as a
 *      phantom price. Re-adding it before /pricing lists it would recreate
 *      exactly the problem v4.1 fixed. This page sells the ₹51 reading.
 *      Revisit only after /pricing carries the On-Call tier.
 *   6. Nothing else touched: metadata, hero, AuthorStrip, DeliverableCard,
 *      MaaDivineSeva, FaqSection, CtaSection and all v4.1 IR-0 cleanups
 *      (no fake testimonials, no strike-through price, /founder links)
 *      are unchanged.
 *
 * v4.1 CHANGES vs v4.0:
 *   ❌ REMOVED fake testimonials (fabricated reviews + ★★★★★ + "Verified Experiences")
 *   ❌ REMOVED phantom ₹499 (hero call button, step 04, card strike-through, CTA button)
 *   ✅ /about → /founder (correct author URL — 3 spots)
 *   ✅ "Delhi NCR" keyword → "India"
 *   ✅ Removed "15 years India Real Estate" credential → reframed as Vedic expertise (IR)
 *   ✅ KEPT Maa Divine Seva (real Arzi/Dhanyewaad dakshina feature)
 *   ✅ Real price on this page = ₹51 (reading)
 */
import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Property Yog in Kundali — Right Time to Buy Property? | Trikaal Vaani",
  description: "Chief Vedic Architect Rohiit Gupta reads your 4th House, Mars & Saturn to reveal if Property Yog is active — or if buying now is a costly karmic mistake. ₹51 reading. 15+ years Vedic expertise.",
  keywords: ["property yog kundali astrology", "should I buy property astrology", "4th house astrology real estate", "ghar kharidne ka shubh samay", "Rohiit Gupta property astrology India"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  openGraph: { title: "Property Yog in Kundali | Trikaal Vaani", description: "Rohiit Gupta decodes your 4th House, Mars & Saturn for property timing.", url: "https://trikalvaani.com/services/property-yog", siteName: "Trikaal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/property-yog" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Property Yog — Real Estate Timing Reading", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/founder" }, offers: [{ "@type": "Offer", price: "51", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "What is Property Yog in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "Property Yog is a specific planetary combination indicating ownership of immovable property. Key indicators include a strong 4th house lord, Mars well-placed, and the 4th lord connected to the 11th house. When activated by the right Dasha, property acquisition becomes auspicious." } },
      { "@type": "Question", name: "Which planets govern property in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "The 4th house governs home and property. Mars (Mangal) is the Karaka of land. Saturn determines long-term value through its transit. Jupiter aspecting the 4th house creates expansion in property." } },
      { "@type": "Question", name: "What is Sade Sati and how does it affect property buying?", acceptedAnswer: { "@type": "Answer", text: "Sade Sati is Saturn's 7.5-year transit over your Moon sign and adjacent signs. Buying property during peak Sade Sati can invite delays, disputes, or depreciation. Rohiit Gupta checks your Sade Sati status before recommending any purchase timing." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Property Yog", item: "https://trikalvaani.com/services/property-yog" }] },
  ],
};

export default function PropertyYogPage() {
  return (
    <>
      {/* v5.0: plain <script>, rendered by this SERVER component so it lands
          in the SSR HTML. next/script deferred it into the Flight payload and
          the page shipped with zero structured data. Do not change this back. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Real Estate Karma Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">Is This the Right Time to <span className="text-[#D4AF37]">Buy Property?</span><br />Your Kundali Knows.</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">Trikaal AI reads your 4th House, Mars placement & Saturn transit to tell you if Property Yog is active — or if buying now could be a <span className="text-[#D4AF37] font-semibold">costly karmic mistake</span>.</p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/founder" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris (self-hosted)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/?segment=property-yog" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Check My Property Yog — ₹51</Link>
            </div>
          </div>
        </section>
        <AuthorStrip />
        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Why Vedic Astrology Predicts <span className="text-[#D4AF37]">Property Timing</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "🏠", title: "The 4th House Is the House of Property", desc: "The 4th house directly governs land, home, real estate, and immovable assets. Its lord's strength, placement, and current transit determines whether property acquisition is cosmically supported or blocked by hidden obstacles." },
                { icon: "♂", title: "Mars Is the Karaka of Land & Real Estate", desc: "Mars (Mangal) is the significator of land in Vedic astrology. Its placement in your natal chart is the single most important factor in property timing. A debilitated Mars buying window can lead to legal disputes or financial loss." },
                { icon: "♄", title: "Saturn Transit Determines Long-Term Value", desc: "Saturn's Sade Sati and Dhaiya cycles profoundly affect your relationship with fixed assets. Buying during a favourable Saturn transit locks in long-term appreciation. Buying during a malefic Saturn window invites delay or depreciation." },
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
                  { step: "01", title: "Enter Your Birth Details", desc: "Date, time, place. Even 15 minutes difference changes your 4th house cusp — precision matters for property readings." },
                  { step: "02", title: "Trikaal Reads Your Property Yog", desc: "4th lord strength, Mars placement, Saturn transit over 4th house, and Dasha activation of real-estate yogas in your chart." },
                  { step: "03", title: "Get Your Buy / Wait Signal", desc: "₹51 reading: Is Property Yog active? Best buying window in months? Any legal dispute risk in this property?" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{s.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <DeliverableCard segment="property-yog" items={["4th House Property Yog analysis", "Mars Karaka land energy reading", "Saturn transit risk assessment", "Buy / Wait / Avoid signal", "Best months for registration", "Legal dispute risk from chart", "4-week financial energy forecast"]} />
            </div>
          </div>
        </section>
        <MaaDivineSeva />
        <FaqSection items={[
          { q: "What is Property Yog in Vedic astrology?", a: "Property Yog is a specific planetary combination indicating ownership of immovable property. Key indicators include a strong 4th house lord, Mars well-placed, and the 4th lord connected to the 11th house. When activated by the right Dasha, property acquisition becomes auspicious." },
          { q: "Which planets govern property in Vedic astrology?", a: "The 4th house governs home and property. Mars (Mangal) is the Karaka of land. Saturn determines long-term value through its transit. Jupiter aspecting the 4th house creates expansion in property." },
          { q: "What is Sade Sati and how does it affect property buying?", a: "Sade Sati is Saturn's 7.5-year transit over your Moon sign. Buying property during peak Sade Sati can invite delays, disputes, or depreciation. Rohiit Gupta checks your Sade Sati status before recommending any purchase timing." },
          { q: "Can astrology predict legal disputes in property purchase?", a: "Yes. The 12th house (losses), 6th house (disputes), and malefic planets in the 4th house can indicate legal complications. Rohiit Gupta reads these risk indicators as part of every property yog reading." },
        ]} />
        <PropertyHindiBlock />
        <CtaSection headline="Before You Sign Anything —" highlight="Read Your Stars." body="A property is a multi-lakh decision. ₹51 to verify if the timing is right — or if your chart is warning you to wait." segment="property-yog" />
        <SiteFooter />
      </main>
    </>
  );
}
/* ─── SHARED COMPONENTS (inlined) ─────────────── */

// ── v5.0: Hindi + hub content, rendered as plain server markup ──────
// Every href below was verified against the live sitemap on 31 Aug 2026.
type PyLink = { href: string; label: string; note: string };

const PY_HUB_HI: PyLink[] = [
  { href: '/blog/property-yog-real-estate-astrology-hindi', label: 'प्रॉपर्टी योग — पूरी गाइड', note: 'यहाँ से शुरू करें' },
  { href: '/blog/property-yogas-raj-jupiter-mars-dhana-astrology-hindi', label: 'संपत्ति योग समझें', note: 'राज योग, बृहस्पति-मंगल, धन योग' },
  { href: '/blog/mars-bhoomi-karaka-property-astrology-hindi', label: 'मंगल — भूमि कारक', note: 'ज़मीन का असली कारक ग्रह' },
  { href: '/blog/dasha-timing-property-buy-window-astrology-hindi', label: 'दशा और खरीद-विंडो', note: 'कब खरीदें, कब रुकें' },
  { href: '/blog/mangal-dosh-4th-house-effects-hindi', label: 'चौथे भाव में मंगल दोष', note: 'घर, माता और उपाय' },
  { href: '/blog/pitra-dosh-in-4th-house-hindi', label: 'चतुर्थ भाव में पितृ दोष', note: 'पैतृक संपत्ति के विवाद' },
];

const PY_HUB_EN: PyLink[] = [
  { href: '/blog/property-yog-real-estate-astrology', label: 'Property Yog — complete guide', note: 'The pillar' },
  { href: '/blog/property-yogas-raj-jupiter-mars-dhana-astrology', label: 'Property Yogas explained', note: 'Raj, Jupiter-Mars, Dhana' },
  { href: '/blog/mars-bhoomi-karaka-property-astrology', label: 'Mars as Bhoomi Karaka', note: 'The land significator' },
  { href: '/blog/dasha-timing-property-buy-window-astrology', label: 'Dasha and your buy window', note: 'When to move, when to wait' },
  { href: '/learn/property-prediction-astrology', label: 'Property prediction — reference', note: 'Houses, lords, yogas' },
  { href: '/learn/vehicle-purchase-prediction', label: 'Vehicle purchase timing', note: '4th house, the other asset' },
];

const PY_SECTIONS: { id: string; h2: string; paras: string[] }[] = [
  {
    id: 'sampatti-yog-jyotish',
    h2: 'संपत्ति योग ज्योतिष — कुंडली में प्रॉपर्टी योग क्या होता है',
    paras: [
      '**संपत्ति योग वह ग्रह-संयोजन है जो अचल संपत्ति के स्वामित्व का संकेत देता है।** यह किसी एक ग्रह से नहीं बनता — यह **चतुर्थ भाव**, उसके **स्वामी**, और **मंगल** के आपसी सम्बन्ध से बनता है। चतुर्थ भाव घर, भूमि, माता और सुख का भाव है; मंगल भूमि का कारक है; और शनि उस संपत्ति के दीर्घकालिक मूल्य को तय करते हैं।',
      'शास्त्र में जो संयोजन सबसे प्रबल माने जाते हैं वे तीन हैं। **चतुर्थेश का एकादश भाव से सम्बन्ध** — यानी घर का भाव लाभ के भाव से जुड़ जाए; यही सबसे स्पष्ट संपत्ति योग है। **गुरु की चतुर्थ भाव पर दृष्टि** — विस्तार और शुभता। और **बलवान मंगल**, विशेषकर जब वे चतुर्थ या दशम से सम्बन्धित हों। इन तीनों का शास्त्रीय विवरण [संपत्ति योग समझें — राज योग, बृहस्पति-मंगल और धन योग](/blog/property-yogas-raj-jupiter-mars-dhana-astrology-hindi) में है।',
      'पर योग का होना अकेला काफी नहीं है, और यही वह बात है जो सबसे कम बताई जाती है: **योग को सक्रिय करने के लिए सही दशा चाहिए।** जिस कुंडली में प्रबल संपत्ति योग है पर चतुर्थेश की दशा अभी दूर है, वहाँ खरीद टल सकती है या भारी पड़ सकती है। अपनी चल रही दशा [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) से देख लीजिए — यह बीस सेकंड का काम है और खरीद के फैसले पर सीधा असर डालता है।',
    ],
  },
  {
    id: 'ghar-kab-kharidein',
    h2: 'घर खरीदने का शुभ समय — कुंडली से कैसे तय करें',
    paras: [
      'यह सवाल दो हिस्सों में बँटता है, और लोग अक्सर दूसरे हिस्से पर अटक जाते हैं। **पहला: क्या आपकी कुंडली में संपत्ति योग है?** दूसरा: **क्या अभी उसका समय है?** पहला जन्म कुंडली से तय होता है और जीवन भर एक ही रहता है; दूसरा दशा और गोचर से बदलता रहता है।',
      'समय तय करने के लिए तीन चीजें एक साथ देखी जाती हैं। **चल रही महादशा और अंतर्दशा** — क्या चतुर्थेश, मंगल या गुरु की अवधि सक्रिय है; यह [दशा और खरीद-विंडो](/blog/dasha-timing-property-buy-window-astrology-hindi) में विस्तार से है। **शनि का गोचर** — [साढ़े साती](/calculators/free-sade-sati-calculator) के शिखर चरण में की गई बड़ी खरीद अक्सर विलंब, विवाद या मूल्य-ह्रास लाती है। और **चतुर्थ भाव की वर्तमान स्थिति** — कोई पाप ग्रह वहाँ बैठा या दृष्टि डाल रहा हो तो सावधानी।',
      'रजिस्ट्री या गृह प्रवेश की तिथि के लिए **मुहूर्त** अलग विषय है और वह पंचांग से निकलता है, कुंडली से नहीं — शुभ तिथियाँ [पंचांग](/panchang) पर प्रतिदिन अपडेट होती हैं। पर एक बात साफ रखिए: **अच्छा मुहूर्त गलत दशा को ठीक नहीं करता।** पहले दशा देखिए, फिर मुहूर्त।',
    ],
  },
  {
    id: 'kaun-se-grah',
    h2: 'संपत्ति के लिए कौन से ग्रह जिम्मेदार होते हैं',
    paras: [
      '**मंगल — भूमि कारक।** शास्त्र में भूमि का सीधा कारक मंगल हैं, और यही कारण है कि प्रॉपर्टी की हर गंभीर रीडिंग मंगल से शुरू होती है। बलवान मंगल संपत्ति देते हैं; पीड़ित मंगल संपत्ति में विवाद, सीमा-झगड़ा या जल्दबाजी का सौदा। पूरा विश्लेषण [मंगल — भूमि कारक](/blog/mars-bhoomi-karaka-property-astrology-hindi) में है।',
      '**शनि — स्थायित्व और मूल्य।** शनि तय करते हैं कि संपत्ति टिकेगी और बढ़ेगी या बोझ बनेगी। **गुरु — विस्तार।** चतुर्थ भाव पर गुरु की दृष्टि बड़ा और शुभ घर देती है। **चंद्र — मानसिक सुख**, क्योंकि चतुर्थ भाव का कारक चंद्रमा भी है; इसीलिए कुछ लोगों को बड़ा घर मिलकर भी सुख नहीं मिलता।',
      'और एक चेतावनी जो पैसे बचाती है: **पैतृक संपत्ति के विवाद अक्सर चतुर्थ भाव के पितृ दोष से जुड़े मिलते हैं** — यह [चतुर्थ भाव में पितृ दोष](/blog/pitra-dosh-in-4th-house-hindi) में खोला गया है, और उसे [मुफ्त पितृ दोष कैलकुलेटर](/calculators/free-pitra-dosh-calculator) से जाँचा जा सकता है। इसी तरह [चौथे भाव में मंगल दोष](/blog/mangal-dosh-4th-house-effects-hindi) घर की शांति पर असर डालता है — वह [मांगलिक कैलकुलेटर](/calculators/free-manglik-dosh-calculator) से मुफ्त जाँच लीजिए।',
    ],
  },
  {
    id: 'delhi-ncr-property',
    h2: 'दिल्ली NCR में प्रॉपर्टी — और हर जगह',
    paras: [
      'त्रिकाल वाणी **द्वारका, नई दिल्ली** से चलता है, और स्वाभाविक रूप से सबसे ज्यादा प्रॉपर्टी सवाल **दिल्ली NCR** से ही आते हैं — नोएडा एक्सटेंशन और ग्रेटर नोएडा वेस्ट के फ्लैट, गुड़गांव के नए सेक्टर, गाजियाबाद में इंदिरापुरम और राज नगर एक्सटेंशन, और दिल्ली में पैतृक मकान का बँटवारा।',
      'पर रीडिंग शहर से नहीं बदलती, और यह साफ कह देना ईमानदारी है: **कुंडली वही रहती है चाहे आप द्वारका में हों या दुबई में।** चतुर्थ भाव, मंगल और दशा — तीनों जन्म विवरण से निकलते हैं, संपत्ति के पते से नहीं। दिल्ली NCR के ग्राहक ज्यादा इसलिए हैं क्योंकि प्रैक्टिस यहीं है, इसलिए नहीं कि यहाँ की रीडिंग अलग होती है।',
      'स्थानीय संदर्भ चाहिए तो [दिल्ली में ज्योतिषी](/astrologer-delhi) पेज पर पूरा पता, फोन और फीस है। और कीमत हर जगह एक जैसी है — **₹51**, चाहे संपत्ति दस लाख की हो या दस करोड़ की।',
    ],
  },
];

function PyHub({ items }: { items: PyLink[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold text-[#D4AF37] group-hover:brightness-125">{i.label}</span>
            <span className="block text-xs text-gray-500">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PyRich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={`${k}-l-${i}`} href={link[2]} className="text-[#D4AF37] font-semibold underline underline-offset-2 hover:brightness-125">
              {link[1]}
            </Link>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${k}-b-${i}`} className="text-[#D4AF37]">{part.slice(2, -2)}</strong>;
        }
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

function PropertyHindiBlock() {
  return (
    <section className="px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {PY_SECTIONS.map((s) => (
          <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4 text-[#D4AF37]">{s.h2}</h2>
            {s.paras.map((p, i) => (
              <p key={i} className="text-gray-300 leading-relaxed mb-4">
                <PyRich text={p} k={`${s.id}-${i}`} />
              </p>
            ))}
          </div>
        ))}

        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 mt-14 text-[#D4AF37]">
          प्रॉपर्टी ज्योतिष — पूरा गाइड पढ़ें
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          नीचे हर विषय पर अलग विस्तृत लेख है — हिंदी और अंग्रेज़ी दोनों में। खरीदने से पहले कम से कम
          दशा और चतुर्थ भाव वाले दो लेख जरूर पढ़िए।
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 border-b border-[#D4AF37]/25 pb-2 font-serif text-base font-bold text-gray-200">हिंदी में</h3>
            <PyHub items={PY_HUB_HI} />
          </div>
          <div>
            <h3 className="mb-3 border-b border-[#D4AF37]/25 pb-2 font-serif text-base font-bold text-gray-200">In English</h3>
            <PyHub items={PY_HUB_EN} />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6">
          <h2 className="font-serif text-xl font-bold mb-3 text-[#D4AF37]">खरीदने से पहले ये तीन मुफ्त जाँच कर लीजिए</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            ₹51 खर्च करने से पहले भी — ये तीनों मुफ्त हैं और अक्सर आधा जवाब वहीं मिल जाता है।
          </p>
          <ul className="space-y-2 text-[15px] text-gray-300">
            <li>
              <Link href="/calculators/free-dasha-calculator" className="text-[#D4AF37] underline underline-offset-4">दशा कैलकुलेटर</Link>
              {' '}— अभी कौन सी महादशा चल रही है, और अगली कब।
            </li>
            <li>
              <Link href="/calculators/free-sade-sati-calculator" className="text-[#D4AF37] underline underline-offset-4">साढ़े साती कैलकुलेटर</Link>
              {' '}— शनि का दबाव चल रहा है या नहीं, और किस चरण में।
            </li>
            <li>
              <Link href="/calculators/free-kundali-calculator" className="text-[#D4AF37] underline underline-offset-4">मुफ्त कुंडली</Link>
              {' '}— चतुर्थ भाव और मंगल की असली स्थिति, भाव सहित।
            </li>
          </ul>
          <p className="text-gray-500 text-sm mt-4">
            संपत्ति के साथ धन का पूरा चित्र चाहिए तो{' '}
            <Link href="/services/wealth-reading" className="text-[#D4AF37] underline underline-offset-4">वेल्थ रीडिंग</Link>
            {' '}और{' '}
            <Link href="/karmic-background-reading" className="text-[#D4AF37] underline underline-offset-4">कार्मिक बैकग्राउंड रीडिंग</Link>
            {' '}देखिए। सारे विकल्प{' '}
            <Link href="/pricing" className="text-[#D4AF37] underline underline-offset-4">प्राइसिंग पेज</Link> पर हैं।
          </p>
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
