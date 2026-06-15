'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-manik/page.tsx
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
      Manik (माणिक) Surya ka ratna hai — aatm-vishwas, naam, pita aur sarkari kaaryon ka karak. Yeh tab uttam hai jab <strong style={{ color: GOLD }}>Surya aapke Lagna ke liye functional benefic</strong> ho — khaas taur par <strong style={{ color: GOLD }}>Leo, Aries, Scorpio aur Sagittarius lagna</strong>. Gemini, Virgo, Libra, Capricorn, Aquarius, Pisces lagna ke liye Surya malefic hai. Free score niche dekhein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Manik Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Manik Surya (Sun) ka ratna hai — aatm-vishwas, netritva, naam aur sarkari safalta ke liye. Yeh sabse shubh hai <strong style={{ color: GOLD }}>Leo (Singh)</strong>, <strong>Aries (Mesh)</strong>, <strong>Scorpio (Vrishchik)</strong> aur <strong>Sagittarius (Dhanu)</strong> lagna ke liye, jahan Surya functional benefic hai. Taurus ke liye mild.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Gemini, Virgo, Libra, Capricorn, Aquarius aur Pisces</strong> lagna ke liye Surya functional malefic hai — in jaatkon ko Manik nahi pehnna chahiye. Cancer ke liye neutral (trial ke baad).
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Surya ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain. Manik aksar kamzor aatm-vishwas ya career mein rukawat ke liye sujhaya jaata hai — par tabhi jab Surya functional benefic ho. Upar ka score ye sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Manik kisko pehnna chahiye?', a: 'Manik (Surya ratna) un jaatkon ke liye shubh hai jinke Lagna ke liye Surya functional benefic hai — Leo, Aries, Scorpio, Sagittarius (mukhya) aur Taurus (mild). Gemini, Virgo, Libra, Capricorn, Aquarius aur Pisces lagna ke liye Surya malefic hai.' },
    { q: 'Career aur naam ke liye Manik sahi hai?', a: 'Surya aatm-vishwas, netritva aur sarkari safalta ka karak hai, isliye Manik career aur pratishtha ke liye lokpriya hai — par tabhi laabhkari jab Surya aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Manik kaunsi ungli aur dhaatu mein pehnein?', a: 'Manik aam taur par sone/tambe (gold/copper) mein, anamika (ring) ungli mein, ravivar ki subah suryoday ke samay, Surya mantra (ॐ सूर्याय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Yeh Manik suitability check free hai?', a: 'Haan, 100% free. Aapka Sun ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearManikPage() {
  return <FocusedStonePage config={config} />;
}
