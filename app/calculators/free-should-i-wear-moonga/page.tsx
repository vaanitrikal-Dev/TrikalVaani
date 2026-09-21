'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-moonga/page.tsx
// Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
// "Should I Wear Moonga?" — Mars (Red Coral / मूंगा).
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Mars',
  slug: 'free-should-i-wear-moonga',
  h1: 'Should I Wear Moonga (Red Coral)? — Free Vedic Check',
  schemaName: 'Should I Wear Moonga (Red Coral)?',
  description: 'Free Vedic check: should you wear Moonga (Red Coral)? Get a 0–100 suitability score for Mars based on your Lagna, Shadbala, dignity, house and afflictions — with verdict.',
  directAnswer: (
    <>
      Moonga (मूँगा) Mangal ka ratna hai — saahas, bhoomi, bhai aur urja ka karak. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Mangal aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Cancer, Pisces, Aries, Leo aur Sagittarius. Gemini, Virgo, Libra, Capricorn aur Aquarius lagna ke liye Mangal paap hai — wahan ye ratna nahi pehnna chahiye. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Moonga Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Moonga Mangal ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Mangal yogakaraka ya shubh</strong> hai — <strong>Cancer (Kark)</strong> aur <strong>Pisces (Meen)</strong> lagna, jahan Mangal <strong>yogakaraka</strong> hai, aur <strong>Aries (Mesh)</strong>, <strong>Leo (Simha)</strong> aur <strong>Sagittarius (Dhanu)</strong> lagna, jahan Mangal <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Gemini (Mithun)</strong>, <strong>Virgo (Kanya)</strong>, <strong>Libra (Tula)</strong>, <strong>Capricorn (Makar)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna ke liye Mangal <strong>paap</strong> hai — in jaatkon ko Moonga nahi pehnna chahiye. <strong>Taurus (Vrishabh)</strong> ke liye Mangal <strong>maarak</strong> hai — sirf trial ke baad, sambhal kar. <strong>Scorpio (Vrischik)</strong> ke liye Mangal <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Mangal ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain. Mangal Dosha wale jaatkon ke liye Moonga ek aam upaay hai — par yeh tabhi sahi jab Mangal functional benefic ho. Upar ka score ye sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Moonga kisko pehnna chahiye?', a: 'Moonga (Mangal ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Mangal aapke Lagna ke liye yogakaraka hai — Cancer aur Pisces, ya shubh hai — Aries, Leo aur Sagittarius. Gemini, Virgo, Libra, Capricorn aur Aquarius lagna ke liye Mangal paap hai, in logon ko Moonga nahi pehnna chahiye. Taurus aur Scorpio ke liye sirf trial ke baad.' },
    { q: 'Mangal Dosha ke liye Moonga sahi hai?', a: 'Moonga Mangal ko balshali karta hai, par yeh tabhi shubh hai jab Mangal aapke Lagna ke liye functional benefic ho. Mangal malefic wale lagna mein Moonga dosha ke bawजूd nuksaan kar sakta hai — isliye pehle suitability check zaroori.' },
    { q: 'Moonga kaunsi ungli aur dhaatu mein pehnein?', a: 'Moonga aam taur par sone/tambe (gold/copper) mein, anamika (ring) ungli mein, mangalvar ki subah, Mangal mantra ke saath pehna jaata hai. Original, certified stone hi lein — par pehle suitability confirm karein.' },
    { q: 'Yeh Moonga suitability check free hai?', a: 'Haan, 100% free. Aapka Mars ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearMoongaPage() {
  return <FocusedStonePage config={config} />;
}
