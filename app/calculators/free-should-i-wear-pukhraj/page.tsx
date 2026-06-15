'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-pukhraj/page.tsx
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
      Pukhraj (पुखराज) Guru ka ratna hai aur aam taur par <strong style={{ color: GOLD }}>surakshit, shubh</strong> mana jaata hai. Yeh tab uttam hai jab <strong style={{ color: GOLD }}>Guru aapke Lagna ke liye functional benefic</strong> ho (jaise Aries, Sagittarius, Pisces, Cancer, Leo, Scorpio). <strong style={{ color: '#FCA5A5' }}>Lekin Gemini aur Virgo lagna ke liye Guru functional malefic hai</strong> — exalted ya Mahadasha hone par bhi Pukhraj nuksaan kar sakta hai. Apna free score niche dekhein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Pukhraj Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Pukhraj Guru (Jupiter) ka ratna hai — gyaan, dhan, vivah aur bhagya ka karak. Yeh un jaatkon ke liye uttam hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Guru functional benefic</strong> hai: <strong>Aries (Mesh)</strong>, <strong>Sagittarius (Dhanu)</strong> aur <strong>Pisces (Meen)</strong> (mukhya benefic), aur <strong>Cancer (Kark)</strong>, <strong>Leo (Singh)</strong>, <strong>Scorpio (Vrishchik)</strong> (mild benefic).
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Bahut zaroori savdhaani:</strong> <strong>Gemini (Mithun)</strong> aur <strong>Virgo (Kanya)</strong> lagna ke liye Guru <strong>functional malefic</strong> hai (kendradhipati dosha). In jaatkon ko Pukhraj nahi pehnna chahiye — chahe Guru exalted ho ya Mahadasha mein. Taurus, Libra aur Capricorn lagna ke liye bhi Guru shubh nahi. Aquarius ke liye neutral.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Guru ka <strong>bal, dignity, bhaav aur afflictions</strong> bhi dekhe jaate hain. Ek balheen-par-shubh Guru ko Pukhraj mazboot karta hai. Upar ka score ye sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Pukhraj kisko pehnna chahiye?', a: 'Pukhraj (Guru ratna) un jaatkon ke liye shubh hai jinke Lagna ke liye Guru functional benefic hai — Aries, Sagittarius, Pisces (mukhya) aur Cancer, Leo, Scorpio (mild). Gemini aur Virgo lagna ke liye Guru malefic hai, in logon ko Pukhraj nahi pehnna chahiye.' },
    { q: 'Kya exalted Guru ke liye Pukhraj hamesha sahi hai?', a: 'Nahi. Agar Guru aapke Lagna ke liye functional malefic hai (Gemini/Virgo), toh exalted ya Mahadasha hone par bhi Pukhraj suit nahi karta — yeh galat kshetra ko balshali kar sakta hai. Pehle functional swabhav, phir dignity.' },
    { q: 'Pukhraj kaunsi ungli aur dhaatu mein pehnein?', a: 'Pukhraj aam taur par sone (gold) mein, tarjani (index) ungli mein, guruvar ki subah, Guru mantra (ॐ गुं गुरवे नमः) ke saath pehna jaata hai. Original, certified stone hi lein — par pehle suitability confirm karein.' },
    { q: 'Yeh Pukhraj suitability check free hai?', a: 'Haan, 100% free. Aapka Jupiter ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearPukhrajPage() {
  return <FocusedStonePage config={config} />;
}
