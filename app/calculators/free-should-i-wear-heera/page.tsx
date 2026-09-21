'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-heera/page.tsx
// Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
// "Should I Wear Heera?" — Venus (Diamond / हीरा).
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Venus',
  slug: 'free-should-i-wear-heera',
  h1: 'Should I Wear Heera (Diamond)? — Free Vedic Check',
  schemaName: 'Should I Wear Heera (Diamond)?',
  description: 'Free Vedic check: should you wear Heera (Diamond)? Get a 0–100 suitability score for Venus based on your Lagna, Shadbala, dignity, house and afflictions — with verdict.',
  directAnswer: (
    <>
      Heera (हीरा) Shukra ka ratna hai — prem, vivah, sukh aur kala ka karak. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Shukra aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Virgo, Capricorn, Aquarius aur Gemini. Aries, Taurus, Cancer, Leo, Scorpio, Sagittarius aur Pisces lagna ke liye Shukra paap hai — wahan ye ratna nahi pehnna chahiye. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Heera Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Heera Shukra ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Shukra yogakaraka ya shubh</strong> hai — <strong>Virgo (Kanya)</strong>, <strong>Capricorn (Makar)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna, jahan Shukra <strong>yogakaraka</strong> hai, aur <strong>Gemini (Mithun)</strong> lagna, jahan Shukra <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Aries (Mesh)</strong>, <strong>Taurus (Vrishabh)</strong>, <strong>Cancer (Kark)</strong>, <strong>Leo (Simha)</strong>, <strong>Scorpio (Vrischik)</strong>, <strong>Sagittarius (Dhanu)</strong> aur <strong>Pisces (Meen)</strong> lagna ke liye Shukra <strong>paap</strong> hai — in jaatkon ko Heera nahi pehnna chahiye. <strong>Libra (Tula)</strong> ke liye Shukra <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Shukra ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain. Heera vivah, dampatya sukh aur kala-kshetra ke liye lokpriya hai — par tabhi jab Shukra functional benefic ho. (Asli Heera mehenga hota hai; bahut log Opal/White Sapphire substitute lete hain.) Upar ka score ye sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Heera kisko pehnna chahiye?', a: 'Heera (Shukra ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Shukra aapke Lagna ke liye yogakaraka hai — Virgo, Capricorn aur Aquarius, ya shubh hai — Gemini. Aries, Taurus, Cancer, Leo, Scorpio, Sagittarius aur Pisces lagna ke liye Shukra paap hai, in logon ko Heera nahi pehnna chahiye. Libra ke liye sirf trial ke baad.' },
    { q: 'Vivah aur prem ke liye Heera sahi hai?', a: 'Shukra prem, vivah aur dampatya sukh ka karak hai, isliye Heera in kshetron ke liye lokpriya hai — par tabhi laabhkari jab Shukra aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Heera kaunsi ungli aur dhaatu mein pehnein?', a: 'Heera aam taur par chandi/platinum mein, madhyama (middle) ungli mein, shukravar ki subah, Shukra mantra (ॐ शुं शुक्राय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Yeh Heera suitability check free hai?', a: 'Haan, 100% free. Aapka Venus ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearHeeraPage() {
  return <FocusedStonePage config={config} />;
}
