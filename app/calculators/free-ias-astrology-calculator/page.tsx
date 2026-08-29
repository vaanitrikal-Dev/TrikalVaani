'use client';

// ============================================================
// File: app/calculators/free-ias-astrology-calculator/page.tsx
// Version: v1.0 — IAS & UPSC Astrology Calculator
// API: /api/calc/yog  (type: 'upsc')
// Engine: lib/upsc-engine.ts
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
    "q": "IAS astrology calculator kaam kaise karta hai?",
    "a": "Aapki janm-kundali se saat blocks par score banta hai — 10th house aur uska swami, Dasamsa D-10 (BPHS ke anusaar career ka varga), 6th house yaani pratiyogita, Surya aur Shani ki Shadbala, Pancha Mahapurusha yogas, 10th house par drishti, aur abhi chal rahi Dasha. Har block apna reason aur asli number dikhata hai."
  },
  {
    "q": "Kya ye bata sakta hai ki main UPSC clear karunga?",
    "a": "Nahi, aur jo tool ye daawa kare usse door rahiye. Ye ek Yog Strength Score hai — yaani aapke chart mein sarkari sewa ke classical combinations kitne aur kitne mazboot hain. Pariksha mehnat, taiyari aur samay se nikalti hai. Kundali sirf ye batati hai ki hawa aapke saath hai ya khilaf."
  },
  {
    "q": "Dasamsa D-10 kya hai aur ye kyun zaroori hai?",
    "a": "Dasamsa dashvaan divisional chart hai. Brihat Parashara Hora Shastra ke Chapter 6 mein saaf likha hai ki career ka nirnay Dasamsa se hota hai. Rasi chart vaada dikhata hai, Dasamsa uski pushti karti hai. Zyadatar free calculators D-10 chhod dete hain — isme wo hai."
  },
  {
    "q": "Shadbala ka score mein kya role hai?",
    "a": "Shadbala har graha ki asli taakat naapti hai, chhe alag maapon se, aur use us graha ke apne classical minimum ke against tolti hai. Ratio 1.00 ka matlab hai graha apna poora phal dene mein saksham hai. Isliye calculator kehta hai 'Shani ki Shadbala 1.41' — na ki sirf 'Shani mazboot hai'."
  },
  {
    "q": "Amatyakaraka 6th house mein hone ka kya matlab hai?",
    "a": "Jaimini paddhati mein Amatyakaraka wo graha hai jiski degree sabse zyada wale ke baad doosre number par ho — ye career ka pratinidhi hota hai. Uska 6th house yaani pratiyogita ke ghar mein hona competitive exam ka sabse khaas classical sanket mana jata hai."
  },
  {
    "q": "Score kam aaye to kya matlab hai?",
    "a": "Kam score ka matlab ye nahi ki sarkari naukri nahi milegi. Iska matlab hai ki chart mein ye yog utne prabal nahi hain, aur mehnat zyada lagegi. Result mein 'Kya rok raha hai' section batata hai ki asal mein kaunsa graha ya ghar kamzor hai — wahi kaam ki jagah hai."
  },
  {
    "q": "Time of birth kitna zaroori hai?",
    "a": "Bahut. Lagna har do ghante mein badalta hai, aur uske saath saare bhaav badal jaate hain — 10th house, 6th house, sab. Galat samay se score bhi galat aayega. Samay pata na ho to 12:00 PM maan liya jata hai, par phir result approximate hi hai."
  },
  {
    "q": "Kya ye calculator free hai?",
    "a": "Haan, poora free. Score, saare blocks ka breakdown reason ke saath, blockers, kaunsi sarkari line khuli hai, aur Dasha timing — sab bina kisi payment ke."
  }
];

export default function FreeIasAstrologyCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-ias-astrology-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: "IAS & UPSC Astrology Calculator — Government Job Yog by Date of Birth",
    description: "Free IAS astrology calculator. Get your Sarkari Naukri Yog score from your Kundali with the reason behind every point — 10th house, Dasamsa D-10, Shadbala, drishti and Dasha. By Trikaal Vaani.",
    breadcrumbName: "IAS Astrology Calculator",
    aboutEntities: ["Government Job Astrology", "Dasamsa", "Shadbala", "Amatyakaraka", "Shasha Yoga", "Ruchaka Yoga", "Vimshottari Dasha"],
    knowsAbout: ["Vedic Astrology", "Jyotish Shastra", "Shadbala", "Dasamsa", "Jaimini Karakas", "Government Job Astrology"],
    howToName: "How to check your IAS and government job yog from your Kundali",
    howToSteps: [{"name": "Enter birth details", "text": "Enter your date, exact time and place of birth. Time matters most, because the lagna and all twelve houses depend on it."}, {"name": "The chart is computed", "text": "Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali, the Dasamsa D-10 career chart, full Shadbala for all seven planets and degree-precise drishti."}, {"name": "Read the reasons, not just the score", "text": "Every rule shows the points it awarded and the exact figure behind it — which planet, which house, what Shadbala ratio and how strong each aspect actually is."}],
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
            <span style={{ color: '#94a3b8' }}>IAS Astrology Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>IAS Astrology Calculator</h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>UPSC, SSC, Banking, Railway aur Police — Sarkari Naukri Yog aapki Kundali se, har point ki wajah ke saath.</p>
          </header>

          <section className="rounded-xl p-4 mb-6" style={{ background: 'rgba(212,175,55,0.06)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              Doosri sites aapko sirf ek number deti hain. Ye calculator har point ke saath batata hai ki wo kyun mila — kaunsa graha, kaunsa ghar, uski Shadbala kitni, aur drishti kitni taakat ki. Career ke liye BPHS Dasamsa (D-10) padhne ko kehta hai, rasi chart nahi — wo bhi isme hai.
            </p>
          </section>

          <YogCalculator config={{
            type: 'upsc',
            scoreLabel: "Sarkari Naukri Yog Score",
            breakdownHeading: "Har point ki wajah",
            secondaryHeading: "Kaunsi sarkari line khuli hai",
            ctaHref: '/#birth-form',
            ctaLabel: "Mera Sarkari Naukri Yog dekho",
            ctaPrice: '₹51',
            ctaBlurb: "Ye report sirf sarkari naukri ka yog dekhti hai. Trikaal Ka Sandesh aapki poori kundali padhta hai — career, paisa, shaadi, sehat — sabka samay aur upay ek saath.",
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
              <li><Link href="/learn/government-job-chances" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Government Job & UPSC Astrology — poora guide</Link></li>
              <li><Link href="/learn/upsc-success-prediction" style={{ color: '#94a3b8' }} className="hover:text-slate-200">UPSC Success Prediction — house by house</Link></li>
              <li><Link href="/learn/10th-house-government-job-astrology" style={{ color: '#94a3b8' }} className="hover:text-slate-200">10th House aur Sarkari Naukri</Link></li>
              <li><Link href="/learn/saturn-shani-government-job-astrology" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Shani aur Sarkari Naukri</Link></li>
              <li><Link href="/learn/government-job-dasha-timing" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Sarkari Naukri ki Dasha Timing</Link></li>
              <li><Link href="/calculators/free-foreign-settlement-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Videsh Settlement Calculator</Link></li>
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
