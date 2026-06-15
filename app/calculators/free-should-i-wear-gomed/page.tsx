'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-gomed/page.tsx
// "Should I Wear Gomed?" — Rahu (Hessonite / गोमेद). Node → very high risk.
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Rahu',
  slug: 'free-should-i-wear-gomed',
  h1: 'Should I Wear Gomed (Hessonite)? — Free Vedic Check',
  schemaName: 'Should I Wear Gomed (Hessonite)?',
  description: 'Free Vedic check: should you wear Gomed (Hessonite)? Get a 0–100 suitability score for Rahu based on your chart, house, dasha and afflictions — with risk and verdict.',
  directAnswer: (
    <>
      Gomed (गोमेद) Rahu ka ratna hai aur ek <strong style={{ color: GOLD }}>very-high-risk</strong> stone. Rahu ek chhaya graha (node) hai — iska asar achanak aur tez hota hai. Gomed aam taur par tab vichaara jaata hai jab <strong style={{ color: GOLD }}>Rahu ki Mahadasha/Antardasha</strong> chal rahi ho ya Rahu se judi badha ho. Ise kabhi bina expert salaah aur 3-din trial ke NA pehnein. Free score niche dekhein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Gomed Kab Pehnein?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Rahu ek <strong style={{ color: GOLD }}>chhaya graha</strong> hai — iska koi rashi-swamitva nahi, isliye iska faisla doosre grahon jaisa seedha functional swabhav se nahi, balki uske <strong>bhaav</strong>, <strong>yuti</strong> aur <strong>dispositor</strong> se hota hai. Isiliye Gomed ko hamesha neutral maan kar, sirf trial aur expert salaah ke baad vichaara jaata hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Gomed aam taur par tab sujhaya jaata hai jab <strong style={{ color: GOLD }}>Rahu ki Mahadasha ya Antardasha</strong> chal rahi ho, ya Rahu se judi confusion, achanak ghatnaayein, court/legal matters jaisi badhaayein door karni ho. Yeh "general luck" ke liye pehna jaane wala ratna nahi.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Khatra:</strong> Gomed ka asar tez aur anpredictable mana jaata hai. Galat samay ya kundali mein achanak ulat-pher kar sakta hai. Isliye verdict hamesha <strong>"Expert Review Zaroori"</strong> tak seemit hai — score chahe jo ho. Poori kundali jaankaar se confirm karke, 3-din trial ke saath hi dharan karein.
      </p>
    </>
  ),
  faqs: [
    { q: 'Gomed kisko pehnna chahiye?', a: 'Gomed Rahu ka ratna hai. Yeh aam taur par tab vichaara jaata hai jab Rahu ki Mahadasha/Antardasha chal rahi ho, ya Rahu se judi badhaayein (confusion, legal matters) door karni ho. Rahu ek node hai isliye faisla bhaav, yuti aur dasha par nirbhar — hamesha expert salaah aur trial ke baad.' },
    { q: 'Gomed itna risky kyun hai?', a: 'Rahu ka asar achanak aur tez hota hai aur Gomed ka prabhav anpredictable mana jaata hai. Galat samay ya kundali mein yeh ulat-pher kar sakta hai. Isliye ise auto-recommend nahi kiya jaata — verdict hamesha Expert Review tak seemit rehta hai.' },
    { q: 'Gomed kaunsi ungli aur dhaatu mein pehnein?', a: 'Gomed aam taur par chandi (silver) mein, madhyama (middle) ungli mein pehna jaata hai. Par samay aur tareeka poori kundali aur uddeshya par nirbhar karte hain — isliye dharan se pehle expert salaah aur trial zaroori hai.' },
    { q: 'Yeh Gomed suitability check free hai?', a: 'Haan, 100% free. Aapka Rahu ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearGomedPage() {
  return <FocusedStonePage config={config} />;
}
