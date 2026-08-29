'use client';

// ============================================================
// File: app/calculators/free-foreign-settlement-calculator/page.tsx
// Version: v1.0 — Foreign Settlement Astrology Calculator
// API: /api/calc/yog  (type: 'foreign-settlement')
// Engine: lib/foreign-settlement-engine.ts
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ------------------------------------------------------------
// The form and the result renderer live in components/calculators/
// YogCalculator.tsx, shared with the other two yog calculators. This file
// carries only what is unique to this page: its words, its SEO and its
// JSON-LD.
// ============================================================

import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';
import YogCalculator from '@/components/calculators/YogCalculator';

const GOLD = '#D4AF37';

const FAQS = [
  {
    "q": "Foreign settlement calculator kaam kaise karta hai?",
    "a": "Aapki janm-kundali se saat blocks par score banta hai — 12th house aur uska swami, Rahu ki sthiti, 9th house, 4th house ki pakad, Chandra aur 3rd house, Dasamsa aur drishti se pushti, aur abhi chal rahi Dasha. Har block apni wajah aur asli number ke saath aata hai."
  },
  {
    "q": "Videsh yog mein 12th house itna zaroori kyun hai?",
    "a": "12th house vyaya, door desh aur janmbhoomi se door jeevan ka ghar hai. Videsh mein basne ke yog mein iska haath sabse bada hota hai. Uska swami kahan baitha hai aur uski Shadbala kitni hai — score ka sabse bada hissa yahi tay karta hai."
  },
  {
    "q": "Kamzor 4th house achha kyun mana jata hai?",
    "a": "4th house ghar aur matribhoomi ka hai. Mazboot 4th insaan ko apni jagah se baandh deta hai — wo jaana hi nahi chahta. Videsh ke liye dheeli pakad behtar hoti hai. Isliye is ek block mein kam taakat par zyada ank milte hain, aur calculator ye baat khud likh kar batata hai."
  },
  {
    "q": "Rahu ka videsh se kya sambandh hai?",
    "a": "Rahu bahar ka, anjaan ka aur seemaayein paar karne ka karak hai. Videsh yog mein isse bada koi graha nahi. Rahu ka 1, 3, 7, 9, 10 ya 12 house mein hona anukool mana jata hai, aur Chandra ke saath uska sambandh man ka jhukav door desh ki taraf mod deta hai."
  },
  {
    "q": "Kya ye bata sakta hai ki mera visa lagega?",
    "a": "Bilkul nahi. Ye ek Yog Strength Score hai, visa prediction nahi. Visa qanoon, kagzaat aur us desh ki neeti se milta hai — kundali se nahi. Ye calculator sirf itna batata hai ki aapke chart mein videsh ke classical yog kitne prabal hain. Ise koi kanooni ya immigration salah na samjhein."
  },
  {
    "q": "Kaunsa raasta khula hai — ye kaise pata chalta hai?",
    "a": "Result mein chaar raste dikhaye jaate hain — naukri, padhai, shaadi aur vyapar — aur har ek ka apna score aur wajah hoti hai. Ye grahon ke karakatva se nikalta hai: Guru aur Budh padhai ke, Shani aur karma naukri ke, Shukra aur Rahu rishte ke."
  },
  {
    "q": "Dasha ka score mein kya role hai?",
    "a": "Yog chart mein hona alag baat hai, aur uska samay aana alag. Agar abhi 12th lord, 9th lord ya Rahu ki mahadasha ya antardasha chal rahi hai, to window khuli hai. Nahi chal rahi to yog phir bhi hai, bas samay abhi nahi aaya — ye result mein saaf likha jata hai."
  },
  {
    "q": "Kya ye calculator free hai?",
    "a": "Haan, poora free. Score, saare blocks ka breakdown, blockers, chaar raston ka vishleshan aur Dasha timing — sab bina payment ke."
  }
];

export default function FreeForeignSettlementCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-foreign-settlement-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: "Foreign Settlement Astrology Calculator — Videsh Yog by Date of Birth",
    description: "Free foreign settlement astrology calculator. Get your Videsh Yog score from your Kundali with the reason behind every point — 12th house, Rahu, 9th house, Shadbala and Dasha. By Trikaal Vaani.",
    breadcrumbName: "Foreign Settlement Calculator",
    aboutEntities: ["Foreign Settlement Astrology", "12th House", "Rahu", "Videsh Yog", "Shadbala", "Vimshottari Dasha"],
    knowsAbout: ["Vedic Astrology", "Jyotish Shastra", "Shadbala", "Foreign Settlement Astrology", "Rahu"],
    howToName: "How to check your foreign settlement yog from your Kundali",
    howToSteps: [{"name": "Enter birth details", "text": "Enter your date, exact time and place of birth."}, {"name": "The chart is computed", "text": "Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali with full Shadbala, the Dasamsa D-10 and degree-precise drishti."}, {"name": "Read the reasons", "text": "Every rule shows its points and the figure behind them — the 12th lord and its Shadbala, where Rahu sits, and how tightly the 4th house holds you home."}],
    faqs: FAQS,
    dateModified: '2026-08-29',
  });

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: '#94a3b8' }}>Foreign Settlement Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>Videsh Settlement Yog Calculator</h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>Videsh mein basne ka yog aapki Kundali se — 12th house, Rahu aur Dasha, har point ki wajah ke saath.</p>
          </header>

          <section className="rounded-xl p-4 mb-6" style={{ background: 'rgba(212,175,55,0.06)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              Videsh yog sirf Rahu se nahi banta. 12th house door desh ka ghar hai, 9th lambi yatra ka, aur 4th house wo hai jo aapko apni mitti se baandhta hai. Is calculator mein ek niyam ulta chalta hai — kamzor 4th house videsh ke liye behtar hai — aur wo aapko saaf bataya jayega, chhupaya nahi.
            </p>
          </section>

          <YogCalculator config={{
            type: 'foreign-settlement',
            scoreLabel: "Videsh Yog Score",
            breakdownHeading: "Har point ki wajah",
            secondaryHeading: "Kaunsa raasta khula hai",
            ctaHref: '/#birth-form',
            ctaLabel: "Mera Videsh Yog dekho",
            ctaPrice: '₹51',
            ctaBlurb: "Poori kundali padhwayein — videsh ka samay aur upay",
          }} />

          <section className="rounded-2xl p-5 md:p-6 mb-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-4" style={{ color: GOLD }}>Aksar puche jaane wale sawaal</h2>
            {FAQS.map((f, i) => (
              <details key={i} className="mb-2 last:mb-0">
                <summary className="text-sm font-semibold cursor-pointer py-2" style={{ color: '#e2e8f0' }}>{f.q}</summary>
                <p className="text-xs leading-relaxed mt-1 mb-2" style={{ color: '#94a3b8' }}>{f.a}</p>
              </details>
            ))}
          </section>

          <section className="rounded-2xl p-5" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Aur padhein</h2>
            <ul className="text-sm space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
              <li><Link href="/foreign-settlement" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Foreign Settlement Astrology — poora guide</Link></li>
              <li><Link href="/calculators/free-foreign-spouse-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Foreign Spouse Yog Calculator</Link></li>
              <li><Link href="/calculators/free-ias-astrology-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">IAS Astrology Calculator</Link></li>
              <li><Link href="/calculators/free-kundali-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Free Kundali Calculator</Link></li>
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
