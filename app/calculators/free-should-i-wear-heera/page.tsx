'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-heera/page.tsx
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
      Heera (हीरा) Shukra ka ratna hai — prem, vivah, sukh, kala aur luxury ka karak. Yeh tab uttam hai jab <strong style={{ color: GOLD }}>Shukra aapke Lagna ke liye functional benefic ya yogakaraka</strong> ho — khaas taur par <strong style={{ color: GOLD }}>Capricorn aur Aquarius lagna</strong> (yogakaraka), aur Taurus, Libra, Gemini, Virgo. Free score niche dekhein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Heera Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Heera Shukra (Venus) ka ratna hai — prem, vivah, sukh-saadhan aur kala ke liye. Yeh sabse shubh hai <strong style={{ color: GOLD }}>Capricorn (Makar)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna ke liye, jahan Shukra <strong>yogakaraka</strong> hai. <strong>Taurus (Vrishabh)</strong> aur <strong>Libra (Tula)</strong> ke liye mukhya benefic (Shukra lagna swami), aur <strong>Gemini</strong>, <strong>Virgo</strong> ke liye mild.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Cancer, Leo, Scorpio, Sagittarius aur Pisces</strong> lagna ke liye Shukra functional malefic hai — in jaatkon ko Heera nahi pehnna chahiye. Aries ke liye neutral (trial ke baad).
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Shukra ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain. Heera vivah, dampatya sukh aur kala-kshetra ke liye lokpriya hai — par tabhi jab Shukra functional benefic ho. (Asli Heera mehenga hota hai; bahut log Opal/White Sapphire substitute lete hain.) Upar ka score ye sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Heera kisko pehnna chahiye?', a: 'Heera (Shukra ratna) un jaatkon ke liye shubh hai jinke Lagna ke liye Shukra functional benefic hai — Capricorn aur Aquarius (yogakaraka), Taurus aur Libra (mukhya), aur Gemini, Virgo (mild). Cancer, Leo, Scorpio, Sagittarius aur Pisces lagna ke liye Shukra malefic hai.' },
    { q: 'Vivah aur prem ke liye Heera sahi hai?', a: 'Shukra prem, vivah aur dampatya sukh ka karak hai, isliye Heera in kshetron ke liye lokpriya hai — par tabhi laabhkari jab Shukra aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Heera kaunsi ungli aur dhaatu mein pehnein?', a: 'Heera aam taur par chandi/platinum mein, madhyama (middle) ungli mein, shukravar ki subah, Shukra mantra (ॐ शुं शुक्राय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Yeh Heera suitability check free hai?', a: 'Haan, 100% free. Aapka Venus ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearHeeraPage() {
  return <FocusedStonePage config={config} />;
}
