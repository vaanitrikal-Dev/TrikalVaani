'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-manik/page.tsx
// Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
// "Should I Wear Manik?" — Sun (Ruby / माणिक).
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Sun',
  slug: 'free-should-i-wear-manik',
  h1: 'Should I Wear Manik (Ruby)? — Free Vedic Check',
  schemaName: 'Should I Wear Manik (Ruby)?',
  description: 'Free Vedic check: should you wear Manik (Ruby)? Get a 0–100 suitability score for the Sun based on your Lagna, Shadbala, dignity, house and afflictions — with verdict.',
  directAnswer: (
    <>
      Manik (माणिक) Surya ka ratna hai — aatm-vishwas, naam, pita aur sarkari kaaryon ka karak. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Surya aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Scorpio, Sagittarius, Aries, Taurus aur Leo. Gemini, Libra aur Pisces lagna ke liye Surya paap hai — wahan ye ratna nahi pehnna chahiye. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Manik Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Manik Surya ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Surya yogakaraka ya shubh</strong> hai — <strong>Scorpio (Vrischik)</strong> aur <strong>Sagittarius (Dhanu)</strong> lagna, jahan Surya <strong>yogakaraka</strong> hai, aur <strong>Aries (Mesh)</strong>, <strong>Taurus (Vrishabh)</strong> aur <strong>Leo (Simha)</strong> lagna, jahan Surya <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Gemini (Mithun)</strong>, <strong>Libra (Tula)</strong> aur <strong>Pisces (Meen)</strong> lagna ke liye Surya <strong>paap</strong> hai — in jaatkon ko Manik nahi pehnna chahiye. <strong>Aquarius (Kumbh)</strong> ke liye Surya <strong>maarak</strong> hai — sirf trial ke baad, sambhal kar. <strong>Cancer (Kark)</strong>, <strong>Virgo (Kanya)</strong> aur <strong>Capricorn (Makar)</strong> ke liye Surya <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Surya ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain. Manik aksar kamzor aatm-vishwas ya career mein rukawat ke liye sujhaya jaata hai — par tabhi jab Surya functional benefic ho. Upar ka score ye sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Manik kisko pehnna chahiye?', a: 'Manik (Surya ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Surya aapke Lagna ke liye yogakaraka hai — Scorpio aur Sagittarius, ya shubh hai — Aries, Taurus aur Leo. Gemini, Libra aur Pisces lagna ke liye Surya paap hai, in logon ko Manik nahi pehnna chahiye. Aquarius, Cancer, Virgo aur Capricorn ke liye sirf trial ke baad.' },
    { q: 'Career aur naam ke liye Manik sahi hai?', a: 'Surya aatm-vishwas, netritva aur sarkari safalta ka karak hai, isliye Manik career aur pratishtha ke liye lokpriya hai — par tabhi laabhkari jab Surya aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Manik kaunsi ungli aur dhaatu mein pehnein?', a: 'Manik aam taur par sone/tambe (gold/copper) mein, anamika (ring) ungli mein, ravivar ki subah suryoday ke samay, Surya mantra (ॐ सूर्याय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Yeh Manik suitability check free hai?', a: 'Haan, 100% free. Aapka Sun ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearManikPage() {
  return <FocusedStonePage config={config} />;
}
