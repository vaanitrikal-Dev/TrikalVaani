'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-moti/page.tsx
// Version: v2.1 (19 Oct 2026) — Radar weekly report 17 Oct 2026 PUSH (13 empty SERPs)
//   + FIX (मोती किस राशि वालों को नहीं पहनना चाहिए, rank 14): +5 H2 inside `guidance`
//   (kis rashi ko nahi, fayde/pearl benefits, female-male, fayde aur nuksan, niyam) +3 FAQ.
//   Gomed/Moonga keywords Radar routed here belong to their own pages — not added here.
//   Lagna text, FocusedStonePage, form and API untouched.
// (previous) Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
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
      Moti (मोती) Chandra ka ratna hai — mann, maata aur maansik shaanti ka karak. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Chandra aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Libra, Scorpio, Cancer aur Pisces. Taurus, Virgo, Capricorn aur Aquarius lagna ke liye Chandra paap hai — wahan ye ratna nahi pehnna chahiye. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Moti Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Moti Chandra ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Chandra yogakaraka ya shubh</strong> hai — <strong>Libra (Tula)</strong> aur <strong>Scorpio (Vrischik)</strong> lagna, jahan Chandra <strong>yogakaraka</strong> hai, aur <strong>Cancer (Kark)</strong> aur <strong>Pisces (Meen)</strong> lagna, jahan Chandra <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Taurus (Vrishabh)</strong>, <strong>Virgo (Kanya)</strong>, <strong>Capricorn (Makar)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna ke liye Chandra <strong>paap</strong> hai — in jaatkon ko Moti nahi pehnna chahiye. <strong>Gemini (Mithun)</strong> ke liye Chandra <strong>maarak</strong> hai — sirf trial ke baad, sambhal kar. <strong>Leo (Simha)</strong> ke liye Chandra <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi. <strong>Aries (Mesh)</strong> aur <strong>Sagittarius (Dhanu)</strong> lagna par granth Chandra ke baare mein chup hai — wahan score aur expert salaah dekhein.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Chandra ka <strong>bal (Shadbala)</strong> bahut zaroori hai — kshneen (weak) Chandra ke liye Moti khaas laabhkari, par tabhi jab Chandra functional benefic ho. Upar ka score lagna, bal, dignity, bhaav aur afflictions sab jodता hai.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>मोती किस राशि वालों को नहीं पहनना चाहिए? — लग्न से तय होता है</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        सीधा जवाब: मोती का निषेध <strong style={{ color: GOLD }}>राशि से नहीं, लग्न से</strong> तय होता है। पाराशर (BPHS अध्याय 34) के अनुसार <strong>वृषभ, कन्या, मकर और कुंभ लग्न</strong> के लिए चंद्रमा पाप ग्रह हैं — इन जातकों को मोती नहीं पहनना चाहिए। <strong>मिथुन लग्न</strong> के लिए चंद्रमा मारक हैं, इसलिए वहाँ भी बिना trial के नहीं। इंटरनेट पर &ldquo;इन राशियों को मोती नहीं&rdquo; वाली सूचियाँ ज़्यादातर चंद्र राशि पर बनी होती हैं, जो शास्त्र का तरीका नहीं है।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        एक और स्थिति जिसमें सावधानी चाहिए: जिनका मन पहले से बहुत भावुक या बेचैन रहता है और कुंडली में चंद्रमा पीड़ित है, उनके लिए बिना जाँच का मोती भावनाओं को और तेज़ कर सकता है। अपना लग्न <a href="/calculators/free-lagna-calculator" style={{ color: GOLD }} className="underline">लग्न कैलकुलेटर</a> से जानिए और ऊपर का score देखिए। पूरा विवरण <a href="/blog/moti-pearl-benefits-side-effects-hindi" style={{ color: GOLD }} className="underline">मोती किसे पहनना चाहिए</a> में है।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>मोती पहनने के फायदे — Pearl Stone Benefits in Hindi</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        जब चंद्रमा आपके लग्न के लिए शुभ हों और बलहीन हों, तब मोती के फायदे सबसे साफ़ दिखते हैं — क्योंकि चंद्रमा <strong style={{ color: GOLD }}>मन, नींद, माता और भावनात्मक संतुलन</strong> के कारक हैं। लोग जो बदलाव बताते हैं: बेचैनी और चिड़चिड़ापन कम होना, नींद बेहतर होना, बात-बात पर घबराहट में कमी, और रिश्तों में नरमी। सफ़ेद, गोल, चमकदार प्राकृतिक मोती ही पारंपरिक रूप से चंद्रमा का रत्न माना गया है।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        एक ईमानदार सीमा: मोती मन को सहारा देता है, इलाज नहीं है। लंबी चिंता, नींद या मानसिक स्वास्थ्य की परेशानी में डॉक्टर या काउंसलर से बात करना पहला कदम है — रत्न उसके साथ चल सकता है, उसकी जगह नहीं। अपने चंद्रमा का बल <a href="/calculators/free-graha-bal-calculator" style={{ color: GOLD }} className="underline">ग्रह बल कैलकुलेटर</a> से देखिए।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Moti Stone Benefits for Female aur Male — Kya Farak Hai?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Shastra ke niyam <strong style={{ color: GOLD }}>dono ke liye ek hi hain</strong> — lagna, Chandra ka bal, suitability score aur trial. Farak sirf is mein hai ki log Moti kis wajah se pehnte hain. Mahilaon mein yeh aksar mann ki shaanti, neend aur parivarik santulan ke liye pehna jaata hai, kyunki Chandra maata aur ghar ke bhaav se bhi jude hain.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Purushon mein aksar gussa kam karne, jaldi pareshan hone ki aadat aur public-facing kaam (jahan logon se judna zaroori ho) mein sahaj rehne ke liye. Dono sthitiyon mein shart wahi hai — Chandra aapke lagna ke liye shubh ho. Kisi ke liye &ldquo;sirf mahilaon ka ratna&rdquo; jaisa koi shastriya niyam nahi hai.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>मोती रत्न के फायदे और नुकसान — नुकसान कब होता है</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        फायदे ऊपर बताए गए हैं। नुकसान आमतौर पर तीन स्थितियों में होता है: <strong>(1)</strong> जब चंद्रमा आपके लग्न के लिए पाप हों — तब मोती गलत भावों को बल देता है; <strong>(2)</strong> जब मोती नकली, कल्चर्ड-रंगा हुआ या दरार वाला हो; <strong>(3)</strong> जब परंपरा के विरुद्ध हीरा, नीलम, गोमेद या लहसुनिया के साथ पहना जाए। गलत मोती के संकेत अक्सर मन पर दिखते हैं — अकारण उदासी, ज़्यादा भावुकता, या निर्णय में डगमगाहट।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        ऐसे संकेत दिखें तो मोती उतार दीजिए और 11 सोमवार &ldquo;ॐ चंद्राय नमः&rdquo; 108 बार जपिए — मंत्र चंद्रमा को शांत करता है, ऊर्जा नहीं बढ़ाता, इसलिए किसी भी कुंडली में सुरक्षित है।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Moti Pehnne Ke Niyam — Din, Ungli, Dhaatu aur Vidhi</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Parampara ke niyam: <strong style={{ color: GOLD }}>Somvar</strong> ko, behtar ho to shukla paksha mein, shaam ke samay pehnein; Chandra ke nakshatra — <strong>Rohini, Hasta, Shravan</strong> — ho to aur achha. Dhaatu <strong>chaandi</strong>, ungli <strong>kanishtha (sabse chhoti)</strong>. Pehnne se pehle angoothi ko kachche doodh ya ganga jal se shuddh karein aur &ldquo;ॐ चंद्राय नमः&rdquo; 108 baar japen.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Pehnne ke baad: ise baar-baar utaarein nahi, prakritik moti ko perfume aur kemikal se door rakhein, aur pehle 3 din mann aur neend par dhyaan dein. Kram hamesha yahi — pehle suitability, phir trial, phir muhurat. Somvar ka shubh samay <a href="/panchang" style={{ color: GOLD }} className="underline">panchang</a> par dekhein.
      </p>
    </>
  ),
  faqs: [
    { q: 'Moti kisko pehnna chahiye?', a: 'Moti (Chandra ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Chandra aapke Lagna ke liye yogakaraka hai — Libra aur Scorpio, ya shubh hai — Cancer aur Pisces. Taurus, Virgo, Capricorn aur Aquarius lagna ke liye Chandra paap hai, in logon ko Moti nahi pehnna chahiye. Gemini aur Leo ke liye sirf trial ke baad. Aries aur Sagittarius par granth chup hai.' },
    { q: 'Mansik shanti ke liye Moti sahi hai?', a: 'Chandra mann ka karak hai, isliye Moti shanti aur emotional sthirta ke liye lokpriya hai — par yeh tabhi laabhkari jab Chandra aapke Lagna ke liye functional benefic aur balheen ho. Pehle suitability check karein.' },
    { q: 'Moti kaunsi ungli aur dhaatu mein pehnein?', a: 'Moti aam taur par chandi (silver) mein, kanishtha (little) ungli mein, somvar ki shaam, Chandra mantra (ॐ चंद्राय नमः) ke saath pehna jaata hai. Original, certified stone hi lein.' },
    { q: 'Moti kis rashi walon ko nahi pehnna chahiye?', a: 'Moti ka nishedh rashi se nahi, lagna se tay hota hai. BPHS Adhyay 34 ke anusar Vrishabh, Kanya, Makar aur Kumbh lagna ke liye Chandra paap hain — in jaatkon ko Moti nahi pehnna chahiye. Mithun lagna ke liye Chandra maarak hain, wahan bhi bina trial ke nahi.' },
    { q: 'Moti pehnne ke niyam kya hain?', a: 'Somvar shaam (shukla paksha behtar), chaandi mein, kanishtha ungli mein. Rohini, Hasta ya Shravan nakshatra ho to aur achha. Pehle kachche doodh ya ganga jal se shuddhi aur "ॐ चंद्राय नमः" 108 baar. Heera, Neelam, Gomed ya Lehsunia ke saath na pehnein.' },
    { q: 'Kya Moti female aur male ke liye alag kaam karta hai?', a: 'Nahi. Shastriya niyam dono ke liye ek hi hain — lagna, Chandra ka bal aur suitability. Farak sirf pehnne ki wajah mein hota hai, ratna ke asar ke niyam mein nahi.' },
    { q: 'Yeh Moti suitability check free hai?', a: 'Haan, 100% free. Aapka Moon ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearMotiPage() {
  return <FocusedStonePage config={config} />;
}
