// ============================================================
// File: app/calculators/free-dasha-calculator/page.tsx
// Purpose: Free Dasha Calculator — SEO/GEO/AEO/E-E-A-T page
// Version: v1.0
// Engine: Swiss Ephemeris + Parashar BPHS + Shadbala + Bhrigu Nandi
// Slug: /calculators/free-dasha-calculator
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import SiteNav from '@/components/layout/SiteNav';
import DashaCalculatorClient from '@/components/calculators/DashaCalculatorClient';

const GOLD = '#D4AF37';

export const metadata: Metadata = {
  title: 'Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online | Trikal Vaani',
  description:
    'Free Dasha Calculator powered by Swiss Ephemeris. Get accurate Vimshottari Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts & 3 remedies instantly. By Rohiit Gupta, Chief Vedic Architect.',
  keywords: [
    'dasha calculator',
    'free dasha calculator',
    'vimshottari dasha calculator',
    'mahadasha calculator',
    'antardasha calculator',
    'current dasha calculator',
    'dasha periods online',
    'mahadasha by date of birth',
    'vedic dasha calculation',
    'planetary period calculator',
    'vimshottari mahadasha online',
    'dasha bhukti calculator',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/calculators/free-dasha-calculator',
  },
  openGraph: {
    title: 'Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online',
    description:
      'Accurate Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts & 3 free remedies. Swiss Ephemeris + BPHS.',
    url: 'https://trikalvaani.com/calculators/free-dasha-calculator',
    type: 'website',
    siteName: 'Trikal Vaani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Dasha Calculator — Vimshottari Online',
    description: 'Free Vimshottari Dasha calculator with Mahadasha, Antardasha & Parashar remedies.',
  },
  robots: { index: true, follow: true },
};

const FAQS = [
  {
    q: 'Dasha calculator kya hai aur kaise kaam karta hai?',
    a: 'Dasha calculator aapki janm kundali ke aadhar par Vimshottari Dasha system se aapke jeevan ke grah-periods calculate karta hai. Trikal Vaani ka calculator Swiss Ephemeris engine se aapke janm samay Chandra ki Nakshatra position dekh kar — aapki current Mahadasha, Antardasha, aur aane wale 120 saal ka dasha cycle exact dates ke saath nikalta hai.',
  },
  {
    q: 'Vimshottari Dasha kya hai?',
    a: 'Vimshottari Dasha Maharishi Parashar dwara BPHS (Brihat Parashara Hora Shastra) Chapter 46-49 mein varnit 120 saal ka grah-period cycle hai. Isme 9 grah baari-baari aapke jeevan par rule karte hain — Surya 6 saal, Chandra 10, Mangal 7, Rahu 18, Guru 16, Shani 19, Budh 17, Ketu 7, aur Shukra 20 saal. Yeh Vedic astrology ka sabse important predictive tool hai.',
  },
  {
    q: 'Mahadasha aur Antardasha mein kya antar hai?',
    a: 'Mahadasha ek bade grah-period ko kehte hain — jaise Shani Mahadasha 19 saal ki hoti hai. Antardasha (jise Bhukti bhi kehte hain) Mahadasha ke andar ka chhota sub-period hai. Har Mahadasha mein 9 Antardashas hoti hain. Jaise Shani Mahadasha mein pehli Shani-Shani Antardasha, phir Shani-Budh, Shani-Ketu — aur aise hi 9 sub-periods. Asli prediction Mahadasha + Antardasha dono ke combination se hoti hai.',
  },
  {
    q: 'Apni current Dasha kaise pata karein?',
    a: 'Apni current Dasha jaanne ke liye 3 cheezein chahiye — Date of Birth, exact Time of Birth, aur Place of Birth. Trikal Vaani calculator mein yeh 3 details daalo, aur 5 second mein aapko aapki current running Mahadasha, Antardasha, aur next 5 dasha periods milenge — saath mein Parashar Dos/Donts aur 3 free remedies.',
  },
  {
    q: 'Kya Dasha calculator bilkul free hai?',
    a: 'Haan. Trikal Vaani ka Dasha calculator 100% free hai. Aapko milta hai — current Mahadasha + Antardasha (with exact dates), next 5 Mahadasha timeline, 3 Parashar Dos, 3 Donts, aur 3 personalized remedies (Mantra, Ratna, Daan). Koi hidden charge nahi, koi signup nahi.',
  },
  {
    q: 'Dasha ke result kitne accurate hain?',
    a: 'Trikal Vaani Swiss Ephemeris use karta hai — wahi NASA-grade astronomical library jo world-class astrology software use karte hain. Calculations Lahiri Ayanamsha pe based hain (Government of India ka official standard). Dasha BPHS classical formulas ke according compute hoti hai — 99.9% astronomical accuracy.',
  },
  {
    q: 'Kya dasha change hone par jeevan badal jaata hai?',
    a: 'Haan. Maharishi Parashar ke according jab Mahadasha badalti hai — aapke jeevan ki disha hi badal jaati hai. Career boom ya struggle, marriage timing, financial peak, health issues — sab Mahadasha-Antardasha combinations se decide hote hain. Isliye Vedic Jyotish mein dasha sandhi (transition period) bahut important maani jaati hai.',
  },
  {
    q: 'Kya yeh calculator NRI aur foreign-born logon ke liye bhi kaam karta hai?',
    a: 'Haan. Trikal Vaani Google Places se duniya ke kisi bhi shahar ka data leta hai — automatic timezone aur coordinates ke saath. NRIs, foreign nationals, ya kisi bhi country mein paida hue log apni Dasha calculate kar sakte hain — same accuracy ke saath.',
  },
];

const HOWTO_STEPS = [
  { name: 'Apna naam daalo (optional)', text: 'Personalized greeting ke liye apna naam likho. Skip bhi kar sakte ho.' },
  { name: 'Date of Birth select karo', text: 'Apni janm tareeq — din, mahina, saal.' },
  { name: 'Exact Time of Birth daalo', text: 'Janm samay — ghante aur minute. Jitna exact, utni accurate Mahadasha.' },
  { name: 'Place of Birth type karo', text: 'Google auto-suggest se apna janm sthan select karo. Timezone automatic hoga.' },
  { name: 'Gender select karo (optional)', text: 'Male, Female ya Other — taaki remedies personalize ho.' },
  { name: 'Calculate button dabao', text: 'Aapki current Mahadasha, Antardasha, next 5 dasha + Parashar remedies 5 second mein.' },
];

export default function FreeDashaCalculatorPage() {
  return (
    <>
      <SiteNav />

      {/* ─── SoftwareApplication Schema ─── */}
      <Script
        id="dasha-calc-software-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Trikal Vaani Free Dasha Calculator',
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web',
            description: 'Free Vimshottari Dasha calculator with Mahadasha, Antardasha, next 5 dasha periods, Parashar Dos/Donts and 3 personalized remedies.',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
            aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', ratingCount: '189' },
            creator: {
              '@type': 'Person',
              name: 'Rohiit Gupta',
              jobTitle: 'Chief Vedic Architect',
              url: 'https://trikalvaani.com/founder',
            },
          }),
        }}
      />

      {/* ─── FAQPage Schema (AEO) ─── */}
      <Script
        id="dasha-calc-faq-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      {/* ─── HowTo Schema ─── */}
      <Script
        id="dasha-calc-howto-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'Free Dasha Kaise Calculate Karein',
            description: 'Trikal Vaani ke free Dasha Calculator se apni Vimshottari Mahadasha aur Antardasha kaise nikalein — step by step.',
            step: HOWTO_STEPS.map((s, i) => ({
              '@type': 'HowToStep',
              position: i + 1,
              name: s.name,
              text: s.text,
            })),
          }),
        }}
      />

      {/* ─── BreadcrumbList Schema ─── */}
      <Script
        id="dasha-calc-breadcrumb-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
              { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
              { '@type': 'ListItem', position: 3, name: 'Free Dasha Calculator', item: 'https://trikalvaani.com/calculators/free-dasha-calculator' },
            ],
          }),
        }}
      />

      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          {/* ─── Breadcrumb ─── */}
          <nav className="text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Free Dasha Calculator</span>
          </nav>

          {/* ─── H1 ─── */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online
          </h1>

          {/* ─── GEO Direct Answer Block (40-60 words for AI extraction) ─── */}
          <div className="rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikal Vaani ka Free Dasha Calculator</strong> aapki current Vimshottari Mahadasha aur Antardasha Swiss Ephemeris se calculate karta hai. Sirf date of birth, time, aur place daalo — current dasha lord, next 5 mahadasha periods exact dates ke saath, Parashar Dos/Donts, aur 3 free remedies (Mantra, Ratna, Daan) turant milte hain. 100% free, BPHS classical rules ke according.
            </p>
          </div>

          {/* ─── E-E-A-T Author Card ─── */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>
              RG
            </div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikal Vaani · Delhi NCR</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Parashar BPHS Ch.46-49 · Lahiri Ayanamsha · Shadbala · Bhrigu Nandi</div>
            </div>
          </div>

          {/* ─── THE WORKING CALCULATOR ─── */}
          <DashaCalculatorClient />

          {/* ─── PILLAR CONTENT (depth > AstroSage/AstroTalk) ─── */}
          <section className="mt-16 prose prose-invert max-w-none">

            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>
              Vimshottari Dasha Kya Hai? — Parashar Ka 120 Saal Ka Chakra
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vimshottari Dasha Vedic Jyotish ka sabse precise aur widely-used predictive system hai. Maharishi Parashar ne <em>Brihat Parashara Hora Shastra (BPHS) Chapter 46-49</em> mein iska poora vivran diya hai. "Vimshottari" ka literal arth hai "120" — kyunki yeh dasha cycle 120 saal ka hota hai, jismein 9 grah baari-baari aapke jeevan par rule karte hain.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Jab aapka janm hota hai, us samay Chandra (Moon) jis Nakshatra mein hota hai — uski lord planet aapki <strong style={{ color: GOLD }}>pehli Mahadasha</strong> banti hai. Phir Vimshottari sequence ke according agle grahon ki dashayein chalti hain. Yahi reason hai ki har vyakti ka dasha cycle alag hota hai — kyunki sab ka janm samay Chandra ki Nakshatra position alag hoti hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              9 Grahon Ki Mahadasha Period — Saal Ke Hisab Se
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vimshottari system mein har grah ki Mahadasha ki fixed duration hoti hai:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 not-prose">
              {[
                { p: 'Ketu', y: 7, desc: 'Spiritual, vairagya, sudden events' },
                { p: 'Shukra', y: 20, desc: 'Love, luxury, marriage, art' },
                { p: 'Surya', y: 6, desc: 'Authority, govt, leadership' },
                { p: 'Chandra', y: 10, desc: 'Mann, mother, emotions' },
                { p: 'Mangal', y: 7, desc: 'Energy, property, siblings' },
                { p: 'Rahu', y: 18, desc: 'Foreign, sudden rise, illusion' },
                { p: 'Guru', y: 16, desc: 'Wisdom, children, dharma' },
                { p: 'Shani', y: 19, desc: 'Karma, discipline, delay' },
                { p: 'Budh', y: 17, desc: 'Intellect, business, communication' },
              ].map((g) => (
                <div key={g.p} className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.5)', border: `1px solid ${GOLD}33` }}>
                  <div className="font-bold" style={{ color: GOLD }}>{g.p} <span className="text-slate-400 font-normal">— {g.y} saal</span></div>
                  <div className="text-xs text-slate-400 mt-1">{g.desc}</div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              Mahadasha vs Antardasha vs Pratyantar Dasha — 3 Levels
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Mahadasha (Level 1):</strong> Sabse bada grah-period. Jaise Shani Mahadasha 19 saal chalti hai. Yeh aapke jeevan ki overall disha decide karti hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Antardasha / Bhukti (Level 2):</strong> Mahadasha ke andar ka sub-period. Har Mahadasha mein 9 Antardashas hoti hain. Yeh year-by-year prediction deti hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Pratyantar Dasha (Level 3):</strong> Antardasha ke andar ka aur chhota sub-sub-period. Yeh month-level precision deti hai — kis mahine kya event hoga.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Trikal Vaani ka free calculator Mahadasha aur Antardasha dikhata hai. Pratyantar Dasha aur full life timeline (career peak, marriage window, health alerts) ₹51 ke detailed prediction mein milta hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              Dasha Sandhi — Jab Grah Badalta Hai
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <em>Dasha Sandhi</em> woh transition period hai jab ek Mahadasha khatm hokar doosri shuru hoti hai — typically last 1-3 mahine. Parashar ke according yeh sabse critical phase hai, jab purani grah ki energy weak ho rahi hoti hai aur nayi abhi puri taur par activate nahi hui. Iss samay log ko aksar confusion, career shifts, ya life-changing decisions ka samna hota hai.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Trikal Vaani ka calculator aapko aapki current Mahadasha ka exact end date dikhata hai — taaki aap dasha sandhi ke liye pehle se prepare ho saken.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              Trikal Vaani vs AstroSage vs AstroTalk Dasha Calculator
            </h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Trikal Vaani</th>
                    <th className="p-3 text-left text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <td className="p-3">Engine</td>
                    <td className="p-3">Swiss Ephemeris (NASA-grade)</td>
                    <td className="p-3 text-slate-500">Basic algorithm</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <td className="p-3">Parashar Dos/Donts</td>
                    <td className="p-3" style={{ color: GOLD }}>✓ Free</td>
                    <td className="p-3 text-slate-500">✗ Paid only</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <td className="p-3">3 Free Remedies</td>
                    <td className="p-3" style={{ color: GOLD }}>✓ Mantra + Ratna + Daan</td>
                    <td className="p-3 text-slate-500">✗ Generic</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <td className="p-3">Next 5 Dasha Timeline</td>
                    <td className="p-3" style={{ color: GOLD }}>✓ With dates</td>
                    <td className="p-3 text-slate-500">Partial</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <td className="p-3">Shadbala Strength</td>
                    <td className="p-3" style={{ color: GOLD }}>✓ Included</td>
                    <td className="p-3 text-slate-500">✗ Missing</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <td className="p-3">Bhrigu Nandi Layer</td>
                    <td className="p-3" style={{ color: GOLD }}>✓ Available</td>
                    <td className="p-3 text-slate-500">✗ Missing</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>
              Famous Cases — Dasha Ne Kaise Jeevan Badla
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic itihas mein kai mahapurushon ke jeevan mein Dasha ne dramatic role play kiya. Maharaja Vikramaditya ki Guru Mahadasha mein unhone Ujjain pe shasan kiya. Chhatrapati Shivaji ki Mangal Mahadasha mein unka samrajya bana. Modern era mein bhi — successful entrepreneurs, leaders, aur achievers ka peak unki favorable Mahadasha mein hi aaya. <em>Yeh hi reason hai ki Vedic Jyotish mein Dasha ko "Karma Ka Kalendar" kaha jaata hai.</em>
            </p>

          </section>

          {/* ─── HowTo Section ─── */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Free Dasha Calculator Kaise Use Karein</h2>
            <div className="space-y-3">
              {HOWTO_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: GOLD, color: '#080B12' }}>
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold mb-1" style={{ color: GOLD }}>{step.name}</div>
                    <div className="text-sm text-slate-400">{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── FAQ Section (AEO) ─── */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Dasha Calculator</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ─── Internal Links — Hub Spoke ─── */}
          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'nakshatra-calculator', name: 'Nakshatra Finder' },
                { slug: 'rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'sade-sati-calculator', name: 'Sade Sati Check' },
                { slug: 'manglik-dosh-calculator', name: 'Manglik Dosh' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`}
                  className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          {/* ─── Related Domain Links ─── */}
          <section className="mt-8">
            <h3 className="text-lg font-serif font-bold mb-4" style={{ color: GOLD }}>Dasha-Driven Life Predictions</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/career', label: 'Career Predictions' },
                { href: '/wealth', label: 'Wealth & Money' },
                { href: '/marriage', label: 'Marriage Timing' },
                { href: '/health', label: 'Health Analysis' },
                { href: '/business', label: 'Business Yog' },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#E5E7EB' }}>
                  {l.label} →
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
