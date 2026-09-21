'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-moti/page.tsx
// Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
// "Should I Wear Moti?" — Moon (Pearl / मोती).
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Moon',
  slug: 'free-should-i-wear-moti',
  h1: 'Should I Wear Moti (Pearl)? — Free Vedic Check',
  schemaName: 'Should I Wear Moti (Pearl)?',
  description: 'Free Vedic check: should you wear Moti (Pearl)? Get a 0–100 suitability score for the Moon based on your Lagna, Shadbala, dignity, house and afflictions — with verdict.',
  directAnswer: (
    <>
      Moti (मोती) Chandra ka ratna hai — mann, maata aur maansik shaanti ka karak. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Chandra aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Libra, Scorpio, Cancer aur Pisces. Taurus, Virgo, Capricorn aur Aquarius lagna ke liye Chandra paap hai — wahan ye ratna nahi pehnna chahiye. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Moti Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Moti Chandra ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Chandra yogakaraka ya shubh</strong> hai — <strong>Libra (Tula)</strong> aur <strong>Scorpio (Vrischik)</strong> lagna, jahan Chandra <strong>yogakaraka</strong> hai, aur <strong>Cancer (Kark)</strong> aur <strong>Pisces (Meen)</strong> lagna, jahan Chandra <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Taurus (Vrishabh)</strong>, <strong>Virgo (Kanya)</strong>, <strong>Capricorn (Makar)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna ke liye Chandra <strong>paap</strong> hai — in jaatkon ko Moti nahi pehnna chahiye. <strong>Gemini (Mithun)</strong> ke liye Chandra <strong>maarak</strong> hai — sirf trial ke baad, sambhal kar. <strong>Leo (Simha)</strong> ke liye Chandra <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi. <strong>Aries (Mesh)</strong> aur <strong>Sagittarius (Dhanu)</strong> lagna par granth Chandra ke baare mein chup hai — wahan score aur expert salaah dekhein.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Chandra ka <strong>bal (Shadbala)</strong> bahut zaroori hai — kshneen (weak) Chandra ke liye Moti khaas laabhkari, par tabhi jab Chandra functional benefic ho. Upar ka score lagna, bal, dignity, bhaav aur afflictions sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Moti kisko pehnna chahiye?', a: 'Moti (Chandra ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Chandra aapke Lagna ke liye yogakaraka hai — Libra aur Scorpio, ya shubh hai — Cancer aur Pisces. Taurus, Virgo, Capricorn aur Aquarius lagna ke liye Chandra paap hai, in logon ko Moti nahi pehnna chahiye. Gemini aur Leo ke liye sirf trial ke baad. Aries aur Sagittarius par granth chup hai.' },
    { q: 'Mansik shanti ke liye Moti sahi hai?', a: 'Chandra mann ka karak hai, isliye Moti shanti aur emotional sthirta ke liye lokpriya hai — par yeh tabhi laabhkari jab Chandra aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Moti kaunsi ungli aur dhaatu mein pehnein?', a: 'Moti aam taur par chandi (silver) mein, kanishtha (little) ungli mein, somvar ki shaam, Chandra mantra (ॐ चंद्राय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Yeh Moti suitability check free hai?', a: 'Haan, 100% free. Aapka Moon ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearMotiPage() {
  return <FocusedStonePage config={config} />;
}
