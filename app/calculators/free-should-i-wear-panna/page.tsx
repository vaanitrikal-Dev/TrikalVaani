'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-panna/page.tsx
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
      Panna (पन्ना) Budh ka ratna hai — buddhi, vyaapaar, vaani aur shiksha ka karak, aur aam taur par <strong style={{ color: GOLD }}>surakshit</strong>. Yeh tab uttam hai jab <strong style={{ color: GOLD }}>Budh aapke Lagna ke liye functional benefic</strong> ho — khaas taur par <strong style={{ color: GOLD }}>Gemini aur Virgo lagna</strong>, aur Taurus, Libra, Capricorn, Aquarius. Free score niche dekhein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Panna Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Panna Budh (Mercury) ka ratna hai. Yeh sabse uttam hai <strong style={{ color: GOLD }}>Gemini (Mithun)</strong> aur <strong>Virgo (Kanya)</strong> lagna ke liye (Budh lagna swami / mukhya benefic), aur <strong>Taurus</strong>, <strong>Libra</strong>, <strong>Capricorn</strong>, <strong>Aquarius</strong> ke liye mild benefic. Vyaapaar, padhai aur communication ke liye yeh lokpriya ratna hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Aries, Cancer, Scorpio, Sagittarius aur Pisces</strong> lagna ke liye Budh functional malefic hai — in jaatkon ko Panna nahi pehnna chahiye. Leo ke liye neutral (trial ke baad).
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Budh ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain — Budh aksar Sun ke paas hone se combust ho jaata hai (yeh v2 check), isliye poori kundali zaroori. Upar ka score baaki sab factors jodता hai.
      </p>
    </>
  ),
  faqs: [
    { q: 'Panna kisko pehnna chahiye?', a: 'Panna (Budh ratna) un jaatkon ke liye shubh hai jinke Lagna ke liye Budh functional benefic hai — Gemini aur Virgo (mukhya), aur Taurus, Libra, Capricorn, Aquarius (mild). Aries, Cancer, Scorpio, Sagittarius aur Pisces lagna ke liye Budh malefic hai.' },
    { q: 'Vyaapaar aur padhai ke liye Panna sahi hai?', a: 'Budh buddhi, vaani aur vyaapaar ka karak hai, isliye Panna communication aur business ke liye lokpriya hai — par yeh tabhi laabhkari jab Budh aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Panna kaunsi ungli aur dhaatu mein pehnein?', a: 'Panna aam taur par sone (gold) mein, kanishtha (little) ungli mein, budhvar ki subah, Budh mantra (ॐ बुं बुधाय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Yeh Panna suitability check free hai?', a: 'Haan, 100% free. Aapka Mercury ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearPannaPage() {
  return <FocusedStonePage config={config} />;
}
