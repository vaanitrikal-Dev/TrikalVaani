'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-neelam/page.tsx
// Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
// "Should I Wear Neelam?" — config over the shared FocusedStonePage.
// Target graha: Saturn (Blue Sapphire / नीलम).
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Saturn',
  slug: 'free-should-i-wear-neelam',
  h1: 'Should I Wear Neelam (Blue Sapphire)? — Free Vedic Check',
  schemaName: 'Should I Wear Neelam (Blue Sapphire)?',
  description: 'Free Vedic check: should you wear Neelam (Blue Sapphire)? Get a 0–100 suitability score for Saturn based on your Lagna, Shadbala, dignity, house and afflictions — with risk and verdict.',
  directAnswer: (
    <>
      Neelam (नीलम) Shani ka ratna hai — karm, anushasan aur nyaay ka karak — aur sabse tez asar wala ratna. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Shani aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Taurus, Libra aur Aquarius. Aries, Leo, Scorpio aur Pisces lagna ke liye Shani paap hai — wahan ye ratna nahi pehnna chahiye. Neelam ka asar sabse tez hai — isliye 3-din trial aur expert salaah zaroori. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Neelam Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Neelam Shani ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Shani yogakaraka ya shubh</strong> hai — <strong>Taurus (Vrishabh)</strong> lagna, jahan Shani <strong>yogakaraka</strong> hai, aur <strong>Libra (Tula)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna, jahan Shani <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Aries (Mesh)</strong>, <strong>Leo (Simha)</strong>, <strong>Scorpio (Vrischik)</strong> aur <strong>Pisces (Meen)</strong> lagna ke liye Shani <strong>paap</strong> hai — in jaatkon ko Neelam nahi pehnna chahiye. <strong>Cancer (Kark)</strong> aur <strong>Sagittarius (Dhanu)</strong> ke liye Shani <strong>maarak</strong> hai — sirf trial ke baad, sambhal kar. <strong>Gemini (Mithun)</strong> aur <strong>Capricorn (Makar)</strong> ke liye Shani <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi. <strong>Virgo (Kanya)</strong> lagna par granth Shani ke baare mein chup hai — wahan score aur expert salaah dekhein.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lekin sirf lagna kaafi nahi. Shani ka <strong>bal (Shadbala)</strong>, <strong>dignity</strong> (uccha/neecha/shatru), <strong>bhaav</strong> aur <strong>afflictions</strong> bhi dekhe jaate hain. Ek balheen-par-shubh Shani ko Neelam mazboot karta hai; ek neecha ya buri tarah afflicted Shani ka Neelam ulta nuksaan kar sakta hai. Isliye upar diya gaya suitability score in sabhi factors ko jodता hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: GOLD }}>Iron rule:</strong> Neelam chahe kitna hi suitable lage, ise hamesha <strong>3 din ke trial</strong> ke saath, jaankaar astrologer ki salaah lekar hi dharan karein.
      </p>
    </>
  ),
  faqs: [
    { q: 'Neelam kisko pehnna chahiye?', a: 'Neelam (Shani ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Shani aapke Lagna ke liye yogakaraka hai — Taurus, ya shubh hai — Libra aur Aquarius. Aries, Leo, Scorpio aur Pisces lagna ke liye Shani paap hai, in logon ko Neelam nahi pehnna chahiye. Cancer, Sagittarius, Gemini aur Capricorn ke liye sirf trial ke baad. Virgo par granth chup hai.' },
    { q: 'Neelam pehnne se pehle trial kyun zaroori hai?', a: 'Neelam ka asar bahut tez hota hai — agar suit kare toh jaldi laabh, na kare toh jaldi nuksaan. Isliye classical niyam hai ki ise 3 din trial mein (takiye ke neeche ya baandh kar) rakhein. Neend, mann aur ghatnaon mein nakaratmak badlav dikhe toh na pehnein.' },
    { q: 'Kya exalted ya Mahadasha Shani ke liye Neelam pehn sakte hain?', a: 'Sirf tab jab Shani aapke Lagna ke liye functional benefic bhi ho. Agar Parashar (BPHS Ch.34) aapke lagna ke liye Shani ko paap kehte hain (Aries, Leo, Scorpio, Pisces), toh exalted ya Mahadasha hone par bhi Neelam suit nahi karta — yeh galat kshetra ko balshali kar sakta hai.' },
    { q: 'Neelam kaunsi ungli aur dhaatu mein pehnein?', a: 'Neelam aam taur par chandi (silver) ya panchdhatu mein, madhyama (middle) ungli mein, shanivar ki shaam, Shani mantra (ॐ शं शनैश्चराय नमः) ke saath pehna jaata hai. Original, certified, bina daag wala stone hi lein — par pehle suitability aur trial zaroori.' },
    { q: 'Yeh Neelam suitability check free hai?', a: 'Haan, 100% free. Aapka Saturn ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearNeelamPage() {
  return <FocusedStonePage config={config} />;
}
