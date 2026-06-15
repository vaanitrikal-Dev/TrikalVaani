'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-neelam/page.tsx
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
      Neelam (नीलम) Shani ka ratna hai aur sabse <strong style={{ color: GOLD }}>strong</strong> gemstone. Yeh tabhi shubh hai jab <strong style={{ color: GOLD }}>Shani aapke Lagna ke liye functional benefic ya yogakaraka</strong> ho (jaise Taurus, Libra, Capricorn, Aquarius), balheen ho aur achhe bhaav mein ho. Galat kundali mein Neelam turant haani kar sakta hai — isliye 3-din trial aur expert salaah zaroori. Apna free suitability score niche check karein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Neelam Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Neelam Shani (Saturn) ka ratna hai. Vedic niyam ke anusar yeh sirf un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Shani functional benefic</strong> hai —
        khaas taur par <strong>Taurus (Vrishabh)</strong> aur <strong>Libra (Tula)</strong> lagna, jahan Shani <strong>yogakaraka</strong> hai, aur <strong>Capricorn (Makar)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna, jahan Shani lagna swami / benefic hai. <strong>Gemini (Mithun)</strong> lagna mein bhi Shani mild shubh hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Kin lagna ko savdhaani:</strong> <strong>Cancer (Kark)</strong>, <strong>Leo (Singh)</strong> aur <strong>Pisces (Meen)</strong> lagna ke liye Shani functional malefic hai — in jaatkon ko Neelam aam taur par nahi pehnna chahiye. Aries, Virgo, Scorpio aur Sagittarius lagna ke liye yeh neutral hai — sirf trial ke baad.
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
    { q: 'Neelam kisko pehnna chahiye?', a: 'Neelam (Shani ratna) un jaatkon ke liye shubh hai jinke Lagna ke liye Shani functional benefic ya yogakaraka hai — Taurus aur Libra (yogakaraka), Capricorn aur Aquarius (benefic), aur Gemini (mild). Cancer, Leo aur Pisces lagna ke liye Shani malefic hai, in logon ko Neelam nahi pehnna chahiye. Baaki lagna ke liye trial ke baad.' },
    { q: 'Neelam pehnne se pehle trial kyun zaroori hai?', a: 'Neelam ka asar bahut tez hota hai — agar suit kare toh jaldi laabh, na kare toh jaldi nuksaan. Isliye classical niyam hai ki ise 3 din trial mein (takiye ke neeche ya baandh kar) rakhein. Neend, mann aur ghatnaon mein nakaratmak badlav dikhe toh na pehnein.' },
    { q: 'Kya exalted ya Mahadasha Shani ke liye Neelam pehn sakte hain?', a: 'Sirf tab jab Shani aapke Lagna ke liye functional benefic bhi ho. Agar Shani malefic hai (jaise Cancer/Leo/Pisces lagna), toh exalted ya Mahadasha hone par bhi Neelam suit nahi karta — yeh galat kshetra ko balshali kar sakta hai.' },
    { q: 'Neelam kaunsi ungli aur dhaatu mein pehnein?', a: 'Neelam aam taur par chandi (silver) ya panchdhatu mein, madhyama (middle) ungli mein, shanivar ki shaam, Shani mantra (ॐ शं शनैश्चराय नमः) ke saath pehna jaata hai. Original, certified, bina daag wala stone hi lein — par pehle suitability aur trial zaroori.' },
    { q: 'Yeh Neelam suitability check free hai?', a: 'Haan, 100% free. Aapka Saturn ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearNeelamPage() {
  return <FocusedStonePage config={config} />;
}
