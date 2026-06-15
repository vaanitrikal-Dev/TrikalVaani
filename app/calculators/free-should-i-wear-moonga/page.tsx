'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-moonga/page.tsx
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
      Moonga (मूंगा) Mangal ka ratna hai — saahas, oorja aur swasthya ka karak. Yeh tab uttam hai jab <strong style={{ color: GOLD }}>Mangal aapke Lagna ke liye functional benefic ya yogakaraka</strong> ho — khaas taur par <strong style={{ color: GOLD }}>Cancer aur Leo lagna</strong> (yogakaraka), aur Aries, Scorpio, Sagittarius, Pisces. Taurus, Gemini, Virgo, Libra lagna ke liye Mangal malefic hai. Free score niche dekhein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Moonga Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Moonga Mangal (Mars) ka ratna hai. Yeh sabse shubh hai <strong style={{ color: GOLD }}>Cancer (Kark)</strong> aur <strong>Leo (Singh)</strong> lagna ke liye, jahan Mangal <strong>yogakaraka</strong> hai. <strong>Aries (Mesh)</strong> ke liye bhi mukhya benefic, aur <strong>Scorpio</strong>, <strong>Sagittarius</strong>, <strong>Pisces</strong> ke liye mild benefic.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Taurus, Gemini, Virgo aur Libra</strong> lagna ke liye Mangal functional malefic hai — in jaatkon ko Moonga nahi pehnna chahiye. Capricorn aur Aquarius ke liye neutral (trial ke baad).
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Mangal ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain. Mangal Dosha wale jaatkon ke liye Moonga ek aam upaay hai — par yeh tabhi sahi jab Mangal functional benefic ho. Upar ka score ye sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Moonga kisko pehnna chahiye?', a: 'Moonga (Mangal ratna) un jaatkon ke liye shubh hai jinke Lagna ke liye Mangal functional benefic hai — Cancer aur Leo (yogakaraka), Aries (mukhya), aur Scorpio, Sagittarius, Pisces (mild). Taurus, Gemini, Virgo aur Libra lagna ke liye Mangal malefic hai, in logon ko Moonga nahi pehnna chahiye.' },
    { q: 'Mangal Dosha ke liye Moonga sahi hai?', a: 'Moonga Mangal ko balshali karta hai, par yeh tabhi shubh hai jab Mangal aapke Lagna ke liye functional benefic ho. Mangal malefic wale lagna mein Moonga dosha ke bawजूd nuksaan kar sakta hai — isliye pehle suitability check zaroori.' },
    { q: 'Moonga kaunsi ungli aur dhaatu mein pehnein?', a: 'Moonga aam taur par sone/tambe (gold/copper) mein, anamika (ring) ungli mein, mangalvar ki subah, Mangal mantra ke saath pehna jaata hai. Original, certified stone hi lein — par pehle suitability confirm karein.' },
    { q: 'Yeh Moonga suitability check free hai?', a: 'Haan, 100% free. Aapka Mars ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearMoongaPage() {
  return <FocusedStonePage config={config} />;
}
