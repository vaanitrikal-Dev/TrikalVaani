'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-moonga/page.tsx
// Version: v2.1 (19 Oct 2026) — Radar weekly report 17 Oct 2026: 10 empty SERPs in the
//   gem-moti-moonga cluster that belong to this page (mostly 'tool' SERPs) + मूंगा रत्न
//   किसे नहीं पहनना चाहिए (rank 17). +7 H2 inside `guidance`, +4 FAQ.
//   Lagna text, FocusedStonePage, form and API untouched.
// (previous) Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
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
      Moonga (मूँगा) Mangal ka ratna hai — saahas, bhoomi, bhai aur urja ka karak. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Mangal aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Cancer, Pisces, Aries, Leo aur Sagittarius. Gemini, Virgo, Libra, Capricorn aur Aquarius lagna ke liye Mangal paap hai — wahan ye ratna nahi pehnna chahiye. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Moonga Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Moonga Mangal ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Mangal yogakaraka ya shubh</strong> hai — <strong>Cancer (Kark)</strong> aur <strong>Pisces (Meen)</strong> lagna, jahan Mangal <strong>yogakaraka</strong> hai, aur <strong>Aries (Mesh)</strong>, <strong>Leo (Simha)</strong> aur <strong>Sagittarius (Dhanu)</strong> lagna, jahan Mangal <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Gemini (Mithun)</strong>, <strong>Virgo (Kanya)</strong>, <strong>Libra (Tula)</strong>, <strong>Capricorn (Makar)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna ke liye Mangal <strong>paap</strong> hai — in jaatkon ko Moonga nahi pehnna chahiye. <strong>Taurus (Vrishabh)</strong> ke liye Mangal <strong>maarak</strong> hai — sirf trial ke baad, sambhal kar. <strong>Scorpio (Vrischik)</strong> ke liye Mangal <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lagna ke baad Mangal ka <strong>bal, dignity, bhaav aur afflictions</strong> dekhe jaate hain. Mangal Dosha wale jaatkon ke liye Moonga ek aam upaay hai — par yeh tabhi sahi jab Mangal functional benefic ho. Upar ka score ye sab jodता hai.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>मूंगा किस राशि के लिए है — और किसे नहीं पहनना चाहिए?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        शास्त्र में मूंगा <strong style={{ color: GOLD }}>राशि से नहीं, लग्न से</strong> तय होता है। पाराशर (BPHS अध्याय 34) के अनुसार <strong>कर्क और मीन लग्न</strong> के लिए मंगल योगकारक हैं, और <strong>मेष, सिंह, धनु लग्न</strong> के लिए शुभ — इन्हें मूंगा सबसे ज़्यादा फलता है। <strong>मिथुन, कन्या, तुला, मकर और कुंभ लग्न</strong> के लिए मंगल पाप हैं — इन्हें मूंगा नहीं पहनना चाहिए। वृषभ लग्न के लिए मंगल मारक हैं और वृश्चिक के लिए सम — इन दोनों में बिना trial के नहीं।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        इसके अलावा, जिनका स्वभाव पहले से बहुत गुस्सैल है, जिनके घर में झगड़े चल रहे हैं, या जिनकी कुंडली में मंगल बुरी तरह पीड़ित है, उन्हें बिना जाँच मूंगा नहीं पहनना चाहिए — यह मंगल की आग को और बढ़ा सकता है। अपना लग्न <a href="/calculators/free-lagna-calculator" style={{ color: GOLD }} className="underline">लग्न कैलकुलेटर</a> से निकालिए; विस्तार <a href="/blog/moonga-red-coral-benefits-side-effects-hindi" style={{ color: GOLD }} className="underline">मूंगा किसे पहनना चाहिए</a> में है।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>मूंगा पहनने के फायदे — Moonga Stone Benefits in Hindi</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        मंगल <strong style={{ color: GOLD }}>साहस, ऊर्जा, भूमि, भाई और निर्णय-शक्ति</strong> के कारक हैं, इसलिए जब मंगल आपके लग्न के लिए शुभ हों पर कमज़ोर हों, तब मूंगा इन्हीं क्षेत्रों में दिखता है: हिचक कम होना, काम शुरू करने की हिम्मत, आलस्य में कमी, और ज़मीन-मकान या भाई-बहन से जुड़े मामलों में गति। पुलिस, सेना, खेल, इंजीनियरिंग या ज़मीन के काम से जुड़े लोगों में यह पारंपरिक रूप से लोकप्रिय है।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        पर शर्त वही है — मंगल शुभ हों। पाप मंगल वाले लग्न में वही ऊर्जा गुस्से, जल्दबाज़ी और चोट के रूप में निकल सकती है। मंगल का बल <a href="/calculators/free-graha-bal-calculator" style={{ color: GOLD }} className="underline">ग्रह बल कैलकुलेटर</a> से देखिए।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Red Coral Astrology and Health Benefits — What Tradition Says</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        In Jyotish, Mars is the karaka of <strong style={{ color: GOLD }}>blood, muscle, stamina and drive</strong>, so tradition links Red Coral to energy, courage and recovery of vitality — when Mars is a benefic for your Lagna and weak in the chart. People commonly describe more initiative, less fatigue-driven procrastination and firmer decisions.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Be clear about what that means: these are classical associations, <strong>not medical effects</strong>. Red Coral does not treat anaemia, blood pressure or any illness, and no gemstone should delay a doctor&apos;s visit. Treat health first; use the stone only as the astrological support it is meant to be.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Red Coral Stone Benefits for Female and Male</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: GOLD }}>The rules are identical for women and men</strong> — Lagna, Mars strength, the suitability score and a short trial. The difference is only in why people wear it. Women often choose it for confidence, standing firm in decisions and energy through demanding phases; men often for career push, property matters or competitive work.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        In both cases, if Mars is a malefic for your Lagna (Gemini, Virgo, Libra, Capricorn, Aquarius), the stone is avoided regardless of gender. Claims that coral is &ldquo;especially good for women&rdquo; or &ldquo;only for men&rdquo; are not found in the classical texts.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Red Coral Stone Benefits for Marriage — and Mangal Dosh</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Red Coral is widely sold as a marriage remedy, and the honest picture is narrower. <strong style={{ color: GOLD }}>Coral strengthens Mars; it does not cancel Mangal Dosh.</strong> If Mars is a benefic for your Lagna and weak, a stronger Mars can steady the 7th-house themes it touches. But if Mars is a malefic for your Lagna, strengthening it can make marital friction worse — the opposite of what was wanted.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        So check whether you are actually Manglik first with the <a href="/calculators/free-manglik-dosh-calculator" style={{ color: GOLD }} className="underline">Manglik Dosh Calculator</a> — many people who are told they are Manglik have the dosh cancelled by classical rules. For matching, the <a href="/kundali-milan" style={{ color: GOLD }} className="underline">Kundali Milan</a> tool shows whether Mangal Dosh is present on both sides.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Red Coral for Scorpio — Is It Good?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        It surprises most people: although Mars rules Scorpio, <strong style={{ color: GOLD }}>BPHS Chapter 34 treats Mars as neutral (sama) for Scorpio Lagna</strong>, because the same planet also owns the 6th house of disputes and illness. So Red Coral is not automatically good for Scorpio Lagna — it can help, but only after the suitability score and a trial.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        And if Scorpio is your Moon sign rather than your Lagna, the Moon sign does not decide gemstones at all. Find your Lagna with the <a href="/calculators/free-lagna-calculator" style={{ color: GOLD }} className="underline">Lagna Calculator</a>, then read the score above.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>मूंगा किस उंगली में पहनें — दिन, धातु और विधि</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        परंपरा के अनुसार मूंगा <strong style={{ color: GOLD }}>अनामिका (रिंग फ़िंगर)</strong> में, <strong>सोने या तांबे</strong> में, <strong>मंगलवार की सुबह</strong> पहना जाता है — शुक्ल पक्ष हो और मंगल के नक्षत्र <strong>मृगशिरा, चित्रा या धनिष्ठा</strong> हों तो और अच्छा। पहनने से पहले अंगूठी को गंगाजल से शुद्ध करें और &ldquo;ॐ अं अंगारकाय नमः&rdquo; 108 बार जपें।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        परंपरा मूंगे को हीरा, नीलम, गोमेद और लहसुनिया के साथ नहीं पहनती। पहनने के बाद पहले कुछ दिन गुस्से, चोट और जल्दबाज़ी पर ध्यान रखें — ये बढ़ें तो उतार दें। मंगलवार का शुभ समय <a href="/panchang" style={{ color: GOLD }} className="underline">पंचांग</a> पर देखें।
      </p>
    </>
  ),
  faqs: [
    { q: 'Moonga kisko pehnna chahiye?', a: 'Moonga (Mangal ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Mangal aapke Lagna ke liye yogakaraka hai — Cancer aur Pisces, ya shubh hai — Aries, Leo aur Sagittarius. Gemini, Virgo, Libra, Capricorn aur Aquarius lagna ke liye Mangal paap hai, in logon ko Moonga nahi pehnna chahiye. Taurus aur Scorpio ke liye sirf trial ke baad.' },
    { q: 'Mangal Dosha ke liye Moonga sahi hai?', a: 'Moonga Mangal ko balshali karta hai, par yeh tabhi shubh hai jab Mangal aapke Lagna ke liye functional benefic ho. Mangal malefic wale lagna mein Moonga dosha ke bawजूd nuksaan kar sakta hai — isliye pehle suitability check zaroori.' },
    { q: 'Moonga kaunsi ungli aur dhaatu mein pehnein?', a: 'Moonga aam taur par sone/tambe (gold/copper) mein, anamika (ring) ungli mein, mangalvar ki subah, Mangal mantra ke saath pehna jaata hai. Original, certified stone hi lein — par pehle suitability confirm karein.' },
    { q: 'Moonga kise nahi pehnna chahiye?', a: 'BPHS Adhyay 34 ke anusar Mithun, Kanya, Tula, Makar aur Kumbh lagna ke liye Mangal paap hain — in jaatkon ko Moonga nahi pehnna chahiye. Vrishabh (maarak) aur Vrishchik (sama) lagna mein sirf trial ke baad. Bahut gussail swabhav ya buri tarah peedit Mangal mein bhi bina jaanch nahi.' },
    { q: 'Is red coral good for marriage?', a: 'Red Coral strengthens Mars; it does not cancel Mangal Dosh. It can help only when Mars is a benefic for your Lagna and weak. If Mars is a malefic for your Lagna, strengthening it can increase marital friction. Check your Manglik status first.' },
    { q: 'Is red coral good for Scorpio?', a: 'Not automatically. BPHS Chapter 34 treats Mars as neutral (sama) for Scorpio Lagna because it also rules the 6th house. Wear it only after the suitability score and a trial. If Scorpio is your Moon sign, not your Lagna, it does not decide the gemstone.' },
    { q: 'Moonga kis ungli mein pehnein?', a: 'Anamika (ring finger) mein, sone ya taambe mein, Mangalvar subah. Mrigashira, Chitra ya Dhanishta nakshatra ho to aur achha. Pehle ganga jal se shuddhi aur "ॐ अं अंगारकाय नमः" 108 baar.' },
    { q: 'Yeh Moonga suitability check free hai?', a: 'Haan, 100% free. Aapka Mars ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearMoongaPage() {
  return <FocusedStonePage config={config} />;
}
