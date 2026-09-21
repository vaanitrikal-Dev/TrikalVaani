'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-pukhraj/page.tsx
// Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
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
        Lagna ke baad Guru ka <strong>bal, dignity, bhaav aur afflictions</strong> bhi dekhe jaate hain. Ek balheen-par-shubh Guru ko Pukhraj mazboot karta hai. Upar ka score ye sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Pukhraj kisko pehnna chahiye?', a: 'Pukhraj (Guru ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Guru aapke Lagna ke liye yogakaraka hai — Pisces, ya shubh hai — Aries, Cancer, Leo aur Scorpio. Taurus, Gemini, Virgo, Libra, Capricorn aur Aquarius lagna ke liye Guru paap hai, in logon ko Pukhraj nahi pehnna chahiye. Sagittarius ke liye sirf trial ke baad.' },
    { q: 'Kya exalted Guru ke liye Pukhraj hamesha sahi hai?', a: 'Nahi. Agar Parashar (BPHS Ch.34) aapke lagna ke liye Guru ko paap kehte hain (Taurus, Gemini, Virgo, Libra, Capricorn, Aquarius), toh exalted ya Mahadasha hone par bhi Pukhraj suit nahi karta — yeh galat kshetra ko balshali kar sakta hai. Pehle functional swabhav, phir dignity.' },
    { q: 'Pukhraj kaunsi ungli aur dhaatu mein pehnein?', a: 'Pukhraj aam taur par sone (gold) mein, tarjani (index) ungli mein, guruvar ki subah, Guru mantra (ॐ गुं गुरवे नमः) ke saath pehna jaata hai. Original, certified stone hi lein — par pehle suitability confirm karein.' },
    { q: 'Yeh Pukhraj suitability check free hai?', a: 'Haan, 100% free. Aapka Jupiter ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearPukhrajPage() {
  return <FocusedStonePage config={config} />;
}
