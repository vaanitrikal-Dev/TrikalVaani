'use client';

// ============================================================
// File: app/calculators/free-foreign-spouse-calculator/page.tsx
// Version: v1.0 — Foreign Spouse Astrology Calculator
// API: /api/calc/yog  (type: 'foreign-spouse')
// Engine: lib/foreign-spouse-engine.ts
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
    "q": "Foreign spouse calculator kaam kaise karta hai?",
    "a": "Aapki janm-kundali se chhe blocks par score banta hai — 7th house aur uska swami, Navamsa D-9 ki pushti, Rahu ka 7th se sambandh, 12th house ka jud'av, Shukra aur Darakaraka, aur abhi chal rahi Dasha. Har block apni wajah aur asli number ke saath aata hai."
  },
  {
    "q": "Navamsa D-9 shaadi ke liye kyun zaroori hai?",
    "a": "Jaise career Dasamsa (D-10) mein padha jata hai, waise shaadi Navamsa (D-9) mein padhi jati hai. Rasi chart ka 7th house vaada dikhata hai; Navamsa batati hai ki wo vaada nibhega ya nahi. Jo tool sirf 7th house dekh kar jawab de de, wo aadha kaam kar raha hai."
  },
  {
    "q": "Kya calculator bata sakta hai ki jeevansaathi kis desh se hoga?",
    "a": "Nahi, aur ye jaan-boojhkar nahi bataya jata. Kundali se kisi ek desh ka naam nikalna imaandari se mumkin nahi hai. Jo tool aapko seedha desh bata de, wo anumaan bech raha hai. Result mein sirf disha (7th lord se) aur 'apne samaj se bahar' ka ishara diya jata hai — jo asli hai."
  },
  {
    "q": "Rahu ka 7th house mein hona kya batata hai?",
    "a": "Rahu bahar ka, anjaan ka aur alag sanskriti ka karak hai. Uska 7th house mein baithna ya use dekhna videshi — ya apni jaati, bhasha, dharm se bahar ke — jeevansaathi ka sabse zyada quote kiya jaane wala yog hai."
  },
  {
    "q": "Darakaraka kya hota hai?",
    "a": "Jaimini paddhati mein Darakaraka wo graha hai jiski degree saat grahon mein sabse kam ho. Wo jeevansaathi ka pratinidhi mana jata hai. Uska 9th ya 12th house mein hona seedha ishara hai ki jeevansaathi door se aayega."
  },
  {
    "q": "Score achha aa gaya — ab kya karun?",
    "a": "Ye calculator sirf itna batata hai ki yog kitna prabal hai. Ye nahi bata sakta ki jis vyakti ki baat chal rahi hai, unke saath nibhegi ya nahi — uske liye dono kundaliyan milani padti hain. Kundali Milan mein Ashtakoot ke 36 gun, Manglik dosh, aur dono ke 7th house aur Navamsa ka aapsi milaan dekha jata hai."
  },
  {
    "q": "Kya kam score ka matlab shaadi nahi hogi?",
    "a": "Bilkul nahi. Kam score ka matlab sirf itna hai ki VIDESHI jeevansaathi ke classical yog utne prabal nahi hain. Shaadi ka yog alag cheez hai aur wo poori tarah maujood ho sakta hai. Ye calculator sirf 'videshi' wale pehlu ko naapta hai."
  },
  {
    "q": "Kya ye calculator free hai?",
    "a": "Haan, poora free. Score, saare blocks ka breakdown reason ke saath, disha ka ishara aur Dasha timing — sab bina payment ke. Kundali Milan alag paid service hai."
  }
];

export default function FreeForeignSpouseCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-foreign-spouse-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: "Foreign Spouse Astrology Calculator — NRI Marriage Yog by Date of Birth",
    description: "Free foreign spouse calculator. Get your NRI marriage yog score from your Kundali with the reason behind every point — 7th house, Navamsa D-9, Rahu, Darakaraka and Dasha. By Trikaal Vaani.",
    breadcrumbName: "Foreign Spouse Calculator",
    aboutEntities: ["Foreign Spouse Astrology", "7th House", "Navamsa", "Darakaraka", "Rahu", "Venus", "Kundali Milan"],
    knowsAbout: ["Vedic Astrology", "Jyotish Shastra", "Navamsa", "Jaimini Karakas", "Marriage Astrology"],
    howToName: "How to check your foreign spouse yog from your Kundali",
    howToSteps: [{"name": "Enter birth details", "text": "Enter your date, exact time and place of birth."}, {"name": "The chart is computed", "text": "Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali and the Navamsa D-9, which is where marriage is actually judged."}, {"name": "Read the reasons", "text": "Every rule shows its points and the figure behind them — the 7th lord, whether the Navamsa confirms it, where Rahu sits, and who your Darakaraka is."}],
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
            <span style={{ color: '#94a3b8' }}>Foreign Spouse Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>Foreign Spouse Yog Calculator</h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>Videshi ya NRI jeevansaathi ka yog aapki Kundali se — 7th house, Navamsa D-9 aur Rahu, har point ki wajah ke saath.</p>
          </header>

          <section className="rounded-xl p-4 mb-6" style={{ background: 'rgba(212,175,55,0.06)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              Shaadi rasi chart se nahi, Navamsa (D-9) se padhi jaati hai — jaise career Dasamsa se. Zyadatar free tools D-9 chhod dete hain aur sirf 7th house dekh kar jawab de dete hain. Isme dono hain. Aur ek baat pehle hi saaf: kundali se kisi desh ka naam nikalna imaandari se mumkin nahi — disha aur sanskriti ka ishara asli hai, naam nahi.
            </p>
          </section>

          <YogCalculator config={{
            type: 'foreign-spouse',
            scoreLabel: "Foreign Spouse Yog Score",
            breakdownHeading: "Har point ki wajah",
            secondaryHeading: "Kaunsa sanket mila",
            ctaHref: '/kundali-milan',
            ctaLabel: "Mera Foreign Spouse Yog dekho",
            ctaPrice: '₹51',
            ctaBlurb: "Kundali Milan karwayein",
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
              <li><Link href="/kundali-milan" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Kundali Milan — 36 gun aur Manglik dosh</Link></li>
              <li><Link href="/learn/foreign-settlement-astrology" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Foreign Settlement Astrology</Link></li>
              <li><Link href="/calculators/free-foreign-settlement-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Videsh Settlement Calculator</Link></li>
              <li><Link href="/calculators/free-manglik-dosh-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Manglik Dosh Calculator</Link></li>
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
