'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-panna/page.tsx
// Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
// "Should I Wear Panna?" — Mercury (Emerald / पन्ना).
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Mercury',
  slug: 'free-should-i-wear-panna',
  h1: 'Should I Wear Panna (Emerald)? — Free Vedic Check',
  schemaName: 'Should I Wear Panna (Emerald)?',
  description: 'Free Vedic check: should you wear Panna (Emerald)? Get a 0–100 suitability score for Mercury based on your Lagna, Shadbala, dignity, house and afflictions — with verdict.',
  directAnswer: (
    <>
      Panna (पन्ना) Budh ka ratna hai — buddhi, vyaapaar, vaani aur shiksha ka karak. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Budh aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Virgo, Libra, Sagittarius aur Capricorn. Aries, Cancer, Leo, Scorpio aur Pisces lagna ke liye Budh paap hai — wahan ye ratna nahi pehnna chahiye. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Panna Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Panna Budh ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Budh yogakaraka ya shubh</strong> hai — <strong>Virgo (Kanya)</strong>, <strong>Libra (Tula)</strong> aur <strong>Sagittarius (Dhanu)</strong> lagna, jahan Budh <strong>yogakaraka</strong> hai, aur <strong>Capricorn (Makar)</strong> lagna, jahan Budh <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Aries (Mesh)</strong>, <strong>Cancer (Kark)</strong>, <strong>Leo (Simha)</strong>, <strong>Scorpio (Vrischik)</strong> aur <strong>Pisces (Meen)</strong> lagna ke liye Budh <strong>paap</strong> hai — in jaatkon ko Panna nahi pehnna chahiye. <strong>Taurus (Vrishabh)</strong> aur <strong>Aquarius (Kumbh)</strong> ke liye Budh <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi. <strong>Gemini (Mithun)</strong> lagna par granth Budh ke baare mein chup hai — wahan score aur expert salaah dekhein.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Budh ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain — Budh aksar Sun ke paas hone se combust ho jaata hai (yeh v2 check), isliye poori kundali zaroori. Upar ka score baaki sab factors jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Panna kisko pehnna chahiye?', a: 'Panna (Budh ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Budh aapke Lagna ke liye yogakaraka hai — Virgo, Libra aur Sagittarius, ya shubh hai — Capricorn. Aries, Cancer, Leo, Scorpio aur Pisces lagna ke liye Budh paap hai, in logon ko Panna nahi pehnna chahiye. Taurus aur Aquarius ke liye sirf trial ke baad. Gemini par granth chup hai.' },
    { q: 'Vyaapaar aur padhai ke liye Panna sahi hai?', a: 'Budh buddhi, vaani aur vyaapaar ka karak hai, isliye Panna communication aur business ke liye lokpriya hai — par yeh tabhi laabhkari jab Budh aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Panna kaunsi ungli aur dhaatu mein pehnein?', a: 'Panna aam taur par sone (gold) mein, kanishtha (little) ungli mein, budhvar ki subah, Budh mantra (ॐ बुं बुधाय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Yeh Panna suitability check free hai?', a: 'Haan, 100% free. Aapka Mercury ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearPannaPage() {
  return <FocusedStonePage config={config} />;
}
