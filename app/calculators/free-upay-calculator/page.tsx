'use client';

// ============================================================
// File: app/calculators/free-upay-calculator/page.tsx   (NEW FILE)
// Version: v1.0 — Upay Calculator — 10 Oct 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// API: /api/calc/upay · Engine: VM granth_api v4.2 upay_calculator()
// Data: Supabase upay_phala (910 granth upay, 10 Oct 2026)
//
// ROHIIT KE FAISLE (3 + 10 Oct 2026):
//   * Free: 3 BPHS upay + Shadbala ka kamzor grah. ₹51: 2 samasya → 10 upay
//   * Har upay alag kism (mantra, daan, seva…), alag granth; aasaan aur sasta
//   * Atharva upay sirf Kaushika Sutra se; maans / sura / bali kabhi nahi
//   * Heading (Sanskrit mantra + granth) GOLDEN BOLD
//   * Report: website + PDF download + WhatsApp share (Janam Kundali jaisa)
// Dhaancha free-life-span-calculator/page.tsx se. Har link ka folder repo mein maujood.
// ============================================================
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';
import UpayCalculator from '@/components/calculators/UpayCalculator';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function renderRich(text: string, keyBase: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link key={`${keyBase}-l-${i}`} href={link[2]} style={{ color: GOLD }}
          className="font-semibold underline underline-offset-2 hover:opacity-80 transition">{link[1]}</Link>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyBase}-b-${i}`} style={{ color: GOLD }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyBase}-t-${i}`}>{part}</span>;
  });
}

type Section = { id: string; h2: string; paras: string[] };

const SECTIONS: Section[] = [
  {
    id: 'upay-calculator-kaise-kaam-karta-hai',
    h2: 'Upay Calculator by Date of Birth — ye kaise kaam karta hai',
    paras: [
      'Aap **janm-tithi, samay aur sthan** dete hain. Swiss Ephemeris (Lahiri ayanamsha) par kundali banti hai aur **Shadbala (BPHS adhyay 27)** se dekha jaata hai ki kaunsa grah kamzor hai. Saath mein chalti **Vimshottari dasha** bhi nikalti hai.',
      'Phir upay chune jaate hain — apne mann se nahi, granth ki table se. Hamari library mein 910 upay hain: Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana aur Grihya Sutra), BPHS, Phaladeepika aur Jataka Parijata. Har upay ke saath uska shlok-hawala likha hai.',
      'Free mein 3 BPHS upay milte hain. ₹51 mein aap apni 2 samasya chunte hain aur 10 upay milte hain — har ek alag kism ka. Apni kundali ka kamzor grah alag se dekhna ho to [Weak Planet Finder](/calculators/free-weak-planet-finder) bhi muft hai.',
    ],
  },
  {
    id: 'kamzor-grah-shadbala',
    h2: 'Kamzor grah kaise pata chalta hai? — Shadbala, BPHS 27',
    paras: [
      'Parashar har grah ka bal chhah hisson mein ginte hain — **sthana, dig, kala, cheshta, naisargika aur drik bala**. Kul bal granth ki nyuntam seema se kam ho to grah kamzor hai (BPHS 27.32-33). Isi ka poora hisaab [Graha Bal Calculator](/calculators/free-graha-bal-calculator) mein hai.',
      '**Shadbala sirf batata hai ki kaunsa grah kamzor hai — upay hamesha granth se aata hai.** Rahu aur Ketu ka Shadbala granth mein hai hi nahi, isliye unke upay tab aate hain jab unki mahadasha ya antardasha chal rahi ho.',
    ],
  },
  {
    id: 'atharvaveda-kaushika-upay',
    h2: 'Atharvaveda ke upay — Kaushika Sutra kya kehta hai',
    paras: [
      'Atharvaveda ke mantra kis kaam mein kaise lagte hain, ye **Kaushika Sutra** batata hai — isse viniyoga kehte hain. Hamare Atharva upay sirf Kaushika se hain. Misaal: parivar ke kalesh ke liye AV 3.30 «सहृदयं सांमनस्यम्» — roz 11 baar, aur ek lote jal ko abhimantrit karke ghar ki chaaron dishaon mein (Kaushika 12.6, 12.9).',
      'Granth ki vidhi ka jo hissa aaj ke ghar mein mushkil hai (yajna, gaay, khet), uska saral roop diya gaya hai — jaise yajna ki jagah ghee ka diya. Har badlav report mein likha rehta hai. **Maans, sura, bali ya kisi ka nuksaan — kabhi kisi upay mein nahi.**',
    ],
  },
  {
    id: 'rigveda-rgvidhana-upay',
    h2: 'Rigveda ke upay — Rgvidhana aur Grihya Sutra',
    paras: [
      '**Rgvidhana** (Shaunaka) batata hai ki Rigveda ka kaunsa sukta kis ichchha ke liye japa jaaye. Misaal: dhan ke liye Rigveda ka pehla sukta «अग्निम् ईळे पुरोहितं» (Rgvidhana 1.13.66); padhai aur yaad-shakti ke liye «सदसस् पतिम् अद्भुतम्» (Rgvidhana 1.17.85).',
      'Grihya Sutra (Ashvalayana, Shankhayana, Manava aadi) ghar ke sanskar aur shanti-karm dete hain. Unme se sirf wo upay liye gaye jo kisi samasya ka seedha phal kehte hain — sanskar wale (upanayan, chudakarma) nahi.',
    ],
  },
  {
    id: 'bphs-graha-shanti-upay',
    h2: 'BPHS ke graha-shanti upay — jap, samidha aur daan',
    paras: [
      'BPHS ka graha-shanti adhyay har grah ka **jap, havan ki samidha aur daan** deta hai: Surya — aak, Chandra — palash, Mangal — khair, Budh — apamarg, Guru — peepal, Shukra — gular, Shani — shami, Rahu — doob, Ketu — kusha.',
      'Jahan granth bada daan kehta hai (gaay, bail, sona), wahan asli upay ke saath **sasta vikalp** bhi diya hai — jaise gaushala mein chaara. Dasha ke daur mein BPHS adhyay 52-60 alag shanti batate hain; aapki chalti dasha par wo shart lagti hai to wo upay bhi aata hai. Apni dasha [Dasha Calculator](/calculators/free-dasha-calculator) mein dekh sakte hain.',
    ],
  },
  {
    id: '27-samasya',
    h2: '27 samasya — naukri, karz, vivah, santan, court aur bahut kuch',
    paras: [
      'Naukri, office ka jhagda, dhan-vyapar, karz se mukti, vivah mein deri, rishta toota, santan, swasthya, lambi aayu, court-kacheri, ghar-zameen, yatra, padhai, bure sapne, nazar, pitra dosh, grah peeda, adhyatm, manokamna, prem, parivar klesh, talaq se bachav, tanav, pati/patni ka doosra sambandh, live-in, aatmavishwas aur prasiddhi.',
      'Pitra dosh ki jaanch ke liye [Pitra Dosh Calculator](/calculators/free-pitra-dosh-calculator) aur Shani ke daur ke liye [Sade Sati Calculator](/calculators/free-sade-sati-calculator) bhi muft hain.',
    ],
  },
  {
    id: 'ratna-ya-upay',
    h2: 'Ratna pehnein ya upay karein?',
    paras: [
      'Kamzor grah ka ratna har baar sahi nahi hota — agar wo grah aapke lagna ke liye **maarak ya paap** hai to ratna uski kathinai bhi badhata hai (BPHS 34). Aise mein jap, havan aur daan surakshit raasta hai.',
      'Kaunsa ratna aapki kundali ke liye theek hai, ye [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) Parashar ki lagna-dar-lagna soochi se batata hai.',
    ],
  },
  {
    id: 'upay-kaise-karein',
    h2: 'Upay kaise karein — 5 saral niyam',
    paras: [
      '**1.** Roz ek hi samay par karein — subah naha kar sabse achha. **2.** Mantra jaisa Sanskrit mein likha hai waisa padhein; ginti 11 se shuru karein. **3.** Ek saath sab nahi — sabse aasaan 2-3 se shuru karein. **4.** Daan apni shakti ke hisaab se; sasta vikalp bhi utna hi maanya hai. **5.** Rog ke upay doctor ke ilaaj ke saath, uski jagah nahi.',
      'Upay kis kram mein karein aur kab tak — iske liye [Rohiit Gupta](/founder) se ₹499 ki seedhi consultation bhi le sakte hain.',
    ],
  },
];

const FAQS = [
  { q: 'Upay calculator by date of birth kya hai?', a: 'Ye janm-tithi, samay aur sthan se kundali banakar Shadbala (BPHS 27) se kamzor grah nikalta hai aur granth se upay deta hai — free mein 3 BPHS upay, ₹51 mein 2 samasya ke 10 alag upay.' },
  { q: 'Kya ye upay AI likhta hai?', a: 'Nahi. Har upay Trikaal Vaani ki granth library se hai — Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana), BPHS, Phaladeepika aur Jataka Parijata — aur har upay ke saath uska shlok-hawala likha hai.' },
  { q: '₹51 mein kya milta hai?', a: 'Aapki chuni hui 2 samasya ke 10 upay — mantra, daan, seva, snaan, raksha-dhaaga jaise alag-alag kism ke. Report website par khulti hai, PDF download hoti hai aur WhatsApp par share ho sakti hai. Kisi bhi grah ke saare upay bhi report mein dekh sakte hain.' },
  { q: 'Kya upay mehenge hain?', a: 'Zyadatar upay mein kharcha nahi ya sirf diya, jal, ghee lagta hai. Jahan granth bada daan kehta hai, wahan ₹11-51 ka sasta vikalp bhi diya hai.' },
  { q: 'Janm samay nahi pata to?', a: '12:00 maana jaata hai aur report mein likha jaata hai. Lagna badal sakta hai, isliye kamzor grah ka nateeja badal sakta hai — samay pata ho to zaroor dein.' },
  { q: 'Rahu-Ketu ke upay kab aate hain?', a: 'Rahu aur Ketu ka Shadbala granth mein nahi hai. Isliye unke upay tab aate hain jab unki mahadasha ya antardasha chal rahi ho — ya aap khud "Kisi grah ke upay dekhein" mein unhe chunein.' },
  { q: 'Kya upay doctor ya vakeel ki jagah le sakte hain?', a: 'Nahi. Swasthya ke upay ilaaj ke saath, aur court ke upay vakeel ki salaah ke saath karein. Upay sahayak hain, vikalp nahi.' },
  { q: 'Upay kitne din karne chahiye?', a: 'Jahan granth ne ginti ya avadhi di hai (jaise BPHS mein Shani ke liye 23,000 jap), wo upay ke saath likhi hai. Baaki upay roz ek hi samay par niyam se karein; kram aur avadhi personal chahiye to ₹499 consultation le sakte hain.' },
];

const MORE_CALC = [
  { href: '/calculators/free-weak-planet-finder', t: 'Weak Planet Finder' },
  { href: '/calculators/free-graha-bal-calculator', t: 'Graha Bal Calculator' },
  { href: '/calculators/free-gemstone-suitability-calculator', t: 'Gemstone Suitability Calculator' },
  { href: '/calculators/free-janam-kundali-calculator', t: 'Janam Kundali Calculator' },
  { href: '/calculators/free-kaal-sarp-dosh-calculator', t: 'Kaal Sarp Dosh Calculator' },
];

export default function FreeUpayCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-upay-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Upay Calculator by Date of Birth — ग्रंथ के उपाय',
    description:
      'Free upay calculator by date of birth: weak planet from Shadbala (BPHS Ch.27) and 3 BPHS graha-shanti remedies free; for Rs 51, 10 different remedies for 2 chosen problems from Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana), BPHS and Phaladeepika. No AI.',
    breadcrumbName: 'Upay Calculator',
    aboutEntities: [
      'Shadbala', 'Atharvaveda', 'Kaushika Sutra', 'Rigveda', 'Rgvidhana', 'Brihat Parashara Hora Shastra',
      'Phaladeepika', 'Graha Shanti', 'Vimshottari Dasha', 'Saturn', 'Rahu', 'Ketu',
    ],
    knowsAbout: ['Vedic Astrology', 'Jyotish Remedies', 'Atharvaveda Viniyoga', 'BPHS Graha Shanti', 'Shadbala'],
    howToName: 'How to find astrological remedies by date of birth',
    howToSteps: [
      { name: 'Enter birth details', text: 'Date, time and place of birth; the chart is computed on Swiss Ephemeris with Lahiri ayanamsha.' },
      { name: 'See the weak planet and 3 free remedies', text: 'Shadbala (BPHS Ch.27) finds the weak planet; three BPHS graha-shanti remedies are shown with their verse reference.' },
      { name: 'Choose 2 problems for 10 remedies', text: 'For Rs 51, choose two problems; ten remedies of different kinds come from Atharvaveda, Rigveda, BPHS and Phaladeepika, with PDF download and WhatsApp share.' },
    ],
    faqs: FAQS,
    dateModified: '2026-10-10',
  });

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link><span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link><span className="mx-2">›</span>
            <span style={{ color: '#94a3b8' }}>Upay Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>
              Upay Calculator by Date of Birth — ग्रंथ के उपाय
            </h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>
              Shadbala se kamzor grah · BPHS ke 3 upay muft · ₹51 mein 2 samasya ke 10 alag upay — Atharvaveda, Rigveda, BPHS se। Koi AI nahi।
            </p>
          </header>

          {/* ── AEO / GEO direct answer ── */}
          <div className="rounded-xl p-5 mb-6" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed m-0">
              <strong style={{ color: GOLD }}>Upay by date of birth</strong> ke liye kundali se pehle{' '}
              <strong style={{ color: GOLD }}>kamzor grah (Shadbala, BPHS 27)</strong> nikalta hai, phir granth se upay.{' '}
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Upay Calculator</strong> free mein BPHS ke 3 graha-shanti upay deta hai, aur ₹51 mein
              aapki 2 samasya ke 10 alag upay — Atharvaveda (Kaushika Sutra), Rigveda (Rgvidhana) aur BPHS se, har ek shlok-hawale ke saath.
            </p>
          </div>

          {/* ── E-E-A-T ── */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Shadbala (BPHS 27) · Granth library — 910 upay</div>
            </div>
          </div>

          <UpayCalculator />

          <section className="mt-14">
            {SECTIONS.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">{renderRich(p, `s${si}-p${pi}`)}</p>
                ))}
              </div>
            ))}
          </section>

          <section className="mt-4 rounded-2xl p-5 md:p-6 mb-8"
            style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Aksar puche jaane wale sawaal — Upay Calculator</h2>
            {FAQS.map((f, i) => (
              <details key={i} className="mb-2 last:mb-0">
                <summary className="text-sm font-semibold cursor-pointer py-2" style={{ color: '#e2e8f0' }}>{f.q}</summary>
                <p className="text-xs leading-relaxed mt-1 mb-2" style={{ color: '#94a3b8' }}>{f.a}</p>
              </details>
            ))}
          </section>

          <section className="rounded-2xl p-5" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <ul className="text-sm space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
              {MORE_CALC.map((l) => (
                <li key={l.href}><Link href={l.href} style={{ color: '#94a3b8' }} className="hover:text-slate-200">{l.t}</Link></li>
              ))}
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
