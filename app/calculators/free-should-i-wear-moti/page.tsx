'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-moti/page.tsx
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
      Moti (मोती) Chandra ka ratna hai — mann, shanti aur bhavnaon ka karak, aur aam taur par <strong style={{ color: GOLD }}>surakshit, thanda</strong> ratna. Yeh tab uttam hai jab <strong style={{ color: GOLD }}>Chandra aapke Lagna ke liye functional benefic</strong> ho — khaas taur par <strong style={{ color: GOLD }}>Cancer, Scorpio aur Pisces lagna</strong>, aur Aries, Libra. Free score niche dekhein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Moti Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Moti Chandra (Moon) ka ratna hai — mansik shanti aur sthirta ke liye. Yeh sabse shubh hai <strong style={{ color: GOLD }}>Cancer (Kark)</strong>, <strong>Scorpio (Vrishchik)</strong> aur <strong>Pisces (Meen)</strong> lagna ke liye (mukhya benefic), aur <strong>Aries</strong>, <strong>Libra</strong> ke liye mild benefic. Mann ki bechaini, neend aur emotional sthirta ke liye yeh lokpriya hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Taurus, Virgo, Sagittarius aur Aquarius</strong> lagna ke liye Chandra functional malefic hai — in jaatkon ko Moti nahi pehnna chahiye. Gemini, Leo aur Capricorn ke liye neutral (trial ke baad).
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Chandra ka <strong>bal (Shadbala)</strong> bahut zaroori hai — kshneen (weak) Chandra ke liye Moti khaas laabhkari, par tabhi jab Chandra functional benefic ho. Upar ka score lagna, bal, dignity, bhaav aur afflictions sab jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Moti kisko pehnna chahiye?', a: 'Moti (Chandra ratna) un jaatkon ke liye shubh hai jinke Lagna ke liye Chandra functional benefic hai — Cancer, Scorpio, Pisces (mukhya) aur Aries, Libra (mild). Taurus, Virgo, Sagittarius aur Aquarius lagna ke liye Chandra malefic hai.' },
    { q: 'Mansik shanti ke liye Moti sahi hai?', a: 'Chandra mann ka karak hai, isliye Moti shanti aur emotional sthirta ke liye lokpriya hai — par yeh tabhi laabhkari jab Chandra aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Moti kaunsi ungli aur dhaatu mein pehnein?', a: 'Moti aam taur par chandi (silver) mein, kanishtha (little) ungli mein, somvar ki shaam, Chandra mantra (ॐ चंद्राय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Yeh Moti suitability check free hai?', a: 'Haan, 100% free. Aapka Moon ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearMotiPage() {
  return <FocusedStonePage config={config} />;
}
