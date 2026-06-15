'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-cats-eye/page.tsx
// "Should I Wear Cat's Eye?" — config over the shared FocusedStonePage.
// Target graha: Ketu (Cat's Eye / लहसुनिया). Node → very high risk.
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Ketu',
  slug: 'free-should-i-wear-cats-eye',
  h1: "Should I Wear Cat's Eye (Lehsunia)? — Free Vedic Check",
  schemaName: "Should I Wear Cat's Eye (Lehsunia)?",
  description: "Free Vedic check: should you wear Cat's Eye (Lehsunia)? Get a 0–100 suitability score for Ketu based on your chart, house, dasha and afflictions — with risk and verdict.",
  directAnswer: (
    <>
      Lehsunia (लहसुनिया) Ketu ka ratna hai aur ek <strong style={{ color: GOLD }}>very-high-risk</strong> stone. Ketu ek chhaya graha (node) hai — iska asar achanak aur tez hota hai. Lehsunia aam taur par tab vichaar mein aata hai jab <strong style={{ color: GOLD }}>Ketu ki Mahadasha/Antardasha</strong> chal rahi ho ya aध्yatmik uddeshya ho. Ise kabhi bina expert salaah aur trial ke NA pehnein. Apna free suitability score niche dekhein.
    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Lehsunia (Cat's Eye) Kab Pehnein?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Ketu ek <strong style={{ color: GOLD }}>chhaya graha</strong> hai — iska koi rashi-swamitva nahi, isliye iska functional swabhav doosre grahon jaisa seedha nahi hota. Iska asar uske <strong>bhaav</strong>, <strong>yuti (conjunction)</strong> aur <strong>disposit­or</strong> par nirbhar karta hai. Isiliye Lehsunia ko hamesha <strong>neutral</strong> maan kar, sirf trial aur expert salaah ke baad hi vichaara jaata hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lehsunia aam taur par tab sujhaya jaata hai jab <strong style={{ color: GOLD }}>Ketu ki Mahadasha ya Antardasha</strong> chal rahi ho aur Ketu kashtkari ho, ya jab aध्yatmik unnati, moksha-marg ya achanak aane wale vighnon se raksha ka uddeshya ho. Yeh "material gain" ke liye pehna jaane wala ratna nahi hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Khatra:</strong> Lehsunia ka asar sabse tez aur anpredictable mana jaata hai. Galat samay ya galat kundali mein yeh achanak ulat-pher la sakta hai. Isliye iska verdict hamesha <strong>"Expert Review Zaroori"</strong> tak seemit rakha gaya hai — score chahe jo bhi ho.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: GOLD }}>Iron rule:</strong> Lehsunia ko poori kundali (Ketu ka bhaav, dasha, yuti) jaankaar astrologer se confirm karke, 3-din trial ke saath hi dharan karein.
      </p>
    </>
  ),
  faqs: [
    { q: "Cat's Eye (Lehsunia) kisko pehnna chahiye?", a: "Lehsunia Ketu ka ratna hai. Yeh aam taur par tab vichaara jaata hai jab Ketu ki Mahadasha/Antardasha chal rahi ho, ya aध्yatmik uddeshya/raksha ke liye. Ketu ek node hai isliye iska faisla bhaav, yuti aur dasha par nirbhar karta hai — isliye hamesha expert salaah aur trial ke baad." },
    { q: "Lehsunia itna khatarnaak kyun mana jaata hai?", a: "Ketu ka asar achanak aur tez hota hai, aur Lehsunia ka prabhav anpredictable mana jaata hai. Galat samay ya kundali mein yeh achanak ulat-pher kar sakta hai. Isliye ise auto-recommend kabhi nahi kiya jaata — verdict hamesha Expert Review tak seemit rehta hai." },
    { q: "Lehsunia kaunsi ungli aur dhaatu mein pehnein?", a: "Lehsunia aam taur par chandi (silver) mein pehna jaata hai. Par dhaatu, ungli aur samay poori kundali aur uddeshya par nirbhar karte hain — isliye dharan se pehle expert salaah aur trial zaroori hai." },
    { q: "Kya yeh Lehsunia suitability check free hai?", a: "Haan, 100% free. Aapka Ketu ka 0–100 suitability score, risk aur verdict bilkul muft." },
  ],
};

export default function ShouldIWearCatsEyePage() {
  return <FocusedStonePage config={config} />;
}
