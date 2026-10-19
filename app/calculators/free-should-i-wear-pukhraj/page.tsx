'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-pukhraj/page.tsx
// Version: v2.1 (19 Oct 2026) — Radar 17 Oct (keywords misrouted to the Neelam page): +3 H2 (Pukhraj ke fayde /
//   health benefits of yellow sapphire, 7 ratti pukhraj, pehnne se pehle kundli check) + 2 FAQ. Lagna rules unchanged.
// (previous) Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
// "Should I Wear Pukhraj?" — Jupiter (Yellow Sapphire / पुखराज).
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Jupiter',
  slug: 'free-should-i-wear-pukhraj',
  h1: 'Should I Wear Pukhraj (Yellow Sapphire)? — Free Vedic Check',
  schemaName: 'Should I Wear Pukhraj (Yellow Sapphire)?',
  description: 'Free Vedic check: should you wear Pukhraj (Yellow Sapphire)? Get a 0–100 suitability score for Jupiter based on your Lagna, Shadbala, dignity, house and afflictions — with verdict.',
  directAnswer: (
    <>
      Pukhraj (पुखराज) Guru ka ratna hai — gyaan, santan, dhan aur dharm ka karak. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Guru aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Pisces, Aries, Cancer, Leo aur Scorpio. Taurus, Gemini, Virgo, Libra, Capricorn aur Aquarius lagna ke liye Guru paap hai — wahan ye ratna nahi pehnna chahiye. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Pukhraj Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Pukhraj Guru ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Guru yogakaraka ya shubh</strong> hai — <strong>Pisces (Meen)</strong> lagna, jahan Guru <strong>yogakaraka</strong> hai, aur <strong>Aries (Mesh)</strong>, <strong>Cancer (Kark)</strong>, <strong>Leo (Simha)</strong> aur <strong>Scorpio (Vrischik)</strong> lagna, jahan Guru <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Taurus (Vrishabh)</strong>, <strong>Gemini (Mithun)</strong>, <strong>Virgo (Kanya)</strong>, <strong>Libra (Tula)</strong>, <strong>Capricorn (Makar)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna ke liye Guru <strong>paap</strong> hai — in jaatkon ko Pukhraj nahi pehnna chahiye. <strong>Sagittarius (Dhanu)</strong> ke liye Guru <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Guru ka <strong>bal, dignity, bhaav aur afflictions</strong> bhi dekhe jaate hain. Ek balheen-par-shubh Guru ko Pukhraj mazboot karta hai. Upar ka score ye sab jodta hai.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Pukhraj Ke Fayde — Health Benefits of Yellow Sapphire</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Jyotish mein Guru <strong>gyaan, santan, dhan, vivah (stri ki kundali mein pati) aur dharm</strong> ka karak hai, aur shareer mein <strong>liver, charbi (fat), pachan aur kaan</strong> se joda jaata hai. Isliye parampara mein shubh Guru wale jaatak ke liye Pukhraj ko in kshetron mein sahayak maana jaata hai — padhai, salah dene wale kaam, sammaan, santan aur vivah ke vishay mein.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Ek seedhi baat: <strong>koi ratna ilaaj nahi hai.</strong> Liver, sugar ya kisi bhi bimari mein doctor ki dawa aur salah pehle hai; ratna sirf jyotishiya sahara hai, aur wo bhi tabhi jab Guru aapke lagna ke liye shubh ho. Paap Guru ke liye Pukhraj usi kshetra ko bigaad sakta hai.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>7 Ratti Pukhraj Pehnne Ke Kya Fayde Hain?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Ratti se fayda nahi badhta — <strong>suitability</strong> se badhta hai. Bazaar mein 1 ratti ko lagbhag 0.91 carat maana jaata hai, aur paramparik niyam hai ki ratna kam se kam 3 se 5 ratti ka ho; 7 ratti tak ka Pukhraj aam taur par vayask ke liye kaafi maana jaata hai. Badi ratti tabhi samajh mein aati hai jab Guru shubh ho par kamzor (kam Shadbala) ho.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Jo zyada zaroori hai: stone <strong>prakritik, bina heat-treatment aur bina daraar</strong> ka ho, sone mein ho, aur tarjani mein guruvar ki subah dharan ho. Agar Guru aapke lagna ke liye paap hai, to 7 ratti ka Pukhraj 3 ratti se zyada nuksan karega, kam nahi.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Pukhraj Pehnne Se Pehle Kundli Check — Teen Baatein</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong>Ek</strong> — Guru aapke lagna ke liye shubh ya yogakaraka hai (upar ki soochi). <strong>Do</strong> — Guru 6th, 8th ya 12th bhaav ka swami hokar wahan peedit to nahi. <strong>Teen</strong> — abhi Guru ya uske mitra graha ki dasha chal rahi hai ya nahi, kyunki ratna ka asar dasha ke saath sabse zyada dikhta hai. Ye teeno upar ka free calculator ek saath jaanchta hai, aur sabhi nau ratnon ki tulna <a href="/calculators/free-gemstone-calculator" style={{ color: GOLD }} className="underline underline-offset-2">Gemstone Calculator</a> par hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Pukhraj kisko pehnna chahiye?', a: 'Pukhraj (Guru ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Guru aapke Lagna ke liye yogakaraka hai — Pisces, ya shubh hai — Aries, Cancer, Leo aur Scorpio. Taurus, Gemini, Virgo, Libra, Capricorn aur Aquarius lagna ke liye Guru paap hai, in logon ko Pukhraj nahi pehnna chahiye. Sagittarius ke liye sirf trial ke baad.' },
    { q: 'Kya exalted Guru ke liye Pukhraj hamesha sahi hai?', a: 'Nahi. Agar Parashar (BPHS Ch.34) aapke lagna ke liye Guru ko paap kehte hain (Taurus, Gemini, Virgo, Libra, Capricorn, Aquarius), toh exalted ya Mahadasha hone par bhi Pukhraj suit nahi karta — yeh galat kshetra ko balshali kar sakta hai. Pehle functional swabhav, phir dignity.' },
    { q: 'Pukhraj kaunsi ungli aur dhaatu mein pehnein?', a: 'Pukhraj aam taur par sone (gold) mein, tarjani (index) ungli mein, guruvar ki subah, Guru mantra (ॐ गुं गुरवे नमः) ke saath pehna jaata hai. Original, certified stone hi lein — par pehle suitability confirm karein.' },
    { q: 'Pukhraj ke fayde kya hain?', a: 'Shubh Guru wale jaatak ke liye Pukhraj gyaan, sammaan, santan, vivah aur dhan ke kshetra mein sahayak maana jaata hai, aur shareer mein liver aur pachan se joda jaata hai. Par ye ilaaj nahi hai — bimari mein doctor pehle. Paap Guru ke liye ye nuksan kar sakta hai.' },
    { q: '7 ratti Pukhraj pehnne ke kya fayde hain?', a: 'Fayda ratti se nahi, suitability se aata hai. 1 ratti lagbhag 0.91 carat maani jaati hai aur 3 se 7 ratti aam taur par kaafi hai. Badi ratti tabhi jab Guru shubh ho par kamzor ho. Paap Guru ke liye badi ratti zyada nuksan karegi.' },
    { q: 'Yeh Pukhraj suitability check free hai?', a: 'Haan, 100% free. Aapka Jupiter ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearPukhrajPage() {
  return <FocusedStonePage config={config} />;
}
