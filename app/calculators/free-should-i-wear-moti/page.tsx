'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-moti/page.tsx
// Version: v2.2 (08 Nov 2026) — Radar weekly job cycle 2026-11-07 (reports #13/#14 PUSH + BRIEF):
//   +3 Hindi H2 inside `guidance` (kaun si rashi pehan sakte hain / ungli + shubh samay vidhi /
//   price kaise tay hota hai) +3 FAQ. Sources read in library: Phaladipika 2.29, 2.2;
//   Brihat Samhita 80.1, 80.13. Panna/emerald keywords left for the Panna page.
// (previous) Version: v2.1 (19 Oct 2026) — Radar weekly report 17 Oct 2026 PUSH (13 empty SERPs)
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
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>मोती कौन सी राशि वाले पहन सकते हैं? — सफेद मोती किस लग्न के लिए शुभ है</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        सफेद मोती चंद्रमा का रत्न है — फलदीपिका (अध्याय 2, श्लोक 29) साफ़ कहती है &ldquo;मुक्ताफलं शीतगोः&rdquo;, यानी मोती शीतल चंद्रमा का रत्न है; यही श्लोक रत्नों के <strong>अमल और निर्मल (बिना दाग)</strong> होने की बात भी करता है। कौन पहन सकता है, यह चंद्र राशि से नहीं, <strong style={{ color: GOLD }}>लग्न</strong> से तय होता है: <strong>तुला और वृश्चिक लग्न</strong> के लिए चंद्रमा योगकारक हैं, <strong>कर्क और मीन लग्न</strong> के लिए शुभ। इन चार लग्नों के जातक मोती पहन सकते हैं — शर्त यह कि चंद्रमा बलहीन हों और ऊपर का score अनुकूल आए।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        अपना लग्न पता नहीं है तो पहले <a href="/calculators/free-lagna-calculator" style={{ color: GOLD }} className="underline">लग्न कैलकुलेटर</a> से जानिए। योगकारक ग्रह का रत्न क्यों सबसे सुरक्षित माना जाता है, यह <a href="/learn/yogakaraka-planet-gemstone" style={{ color: GOLD }} className="underline">योगकारक ग्रह और रत्न</a> वाले लेख में विस्तार से है।
      </p>
      <p className="text-sm text-slate-400 leading-relaxed mb-4 border-l-2 pl-3" style={{ borderColor: GOLD }}>
        फलदीपिका, अध्याय 2, श्लोक 29: &ldquo;माणिक्यं तरणेः सुधार्यममलं मुक्ताफलं शीतगो-र्माहेयस्य च विद्रुमं मरकतं सौम्यस्य गारुत्मतम् । देवेज्यस्य च पुष्परागमसुरामात्यस्य वज्रं शने-र्नीलं निर्मलमन्ययोश्च गदिते गोमेधवैडूर्यके ॥२९॥&rdquo;
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>सफेद मोती की अंगूठी किस उंगली में पहनें? — धारण का शुभ समय और विधि</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        परंपरा में सफेद मोती की अंगूठी <strong style={{ color: GOLD }}>कनिष्ठा (सबसे छोटी) उंगली</strong> में, <strong>चाँदी</strong> में जड़वाकर पहनी जाती है। फलदीपिका (अध्याय 2, श्लोक 2) चंद्रमा से जिन चीज़ों का विचार करती है, उनमें माता, मन की प्रसन्नता, मौक्तिक (मोती) और रौप्य (चाँदी) साथ-साथ गिने गए हैं — मोती और चाँदी का मेल इसी परंपरा पर चलता है। धारण के लिए सोमवार की शाम, शुक्ल पक्ष, और रोहिणी, हस्त या श्रवण नक्षत्र अच्छे माने जाते हैं। &ldquo;आज शुभ समय है या नहीं&rdquo; — यह आज की तिथि, नक्षत्र और राहुकाल पर निर्भर है, इसलिए <a href="/panchang" style={{ color: GOLD }} className="underline">आज का पंचांग</a> देखकर ही तय करें।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong>1. क्या करें:</strong> अंगूठी को कच्चे दूध और गंगाजल से धोकर, &ldquo;ॐ चंद्राय नमः&rdquo; 108 बार जपकर कनिष्ठा उंगली में पहनें।<br />
        <strong>2. कब:</strong> सोमवार शाम, शुक्ल पक्ष में, राहुकाल छोड़कर।<br />
        <strong>3. कितने का:</strong> विधि का खर्च 10-20 रुपये (कच्चा दूध); रत्न का दाम अलग है।<br />
        <strong>4. कितने दिन:</strong> विधि एक दिन की; उसके बाद 3 दिन मन और नींद पर ध्यान दें।<br />
        <strong>5. आपके लिए क्यों:</strong> तभी, जब ऊपर का score बताए कि चंद्रमा आपके लग्न के लिए शुभ हैं। पूरी धारण-विधि <a href="/learn/how-to-wear-gemstone-vedic" style={{ color: GOLD }} className="underline">रत्न कैसे पहनें</a> में है।
      </p>
      <p className="text-sm text-slate-400 leading-relaxed mb-4 border-l-2 pl-3" style={{ borderColor: GOLD }}>
        फलदीपिका, अध्याय 2, श्लोक 2: &ldquo;मातुः स्वस्ति मनःप्रसादमुदधिस्नानं सितं चामरं छत्रं सुव्यजनं फलानि मृदुलं पुष्पाणि सस्यं कृषिम् । कीर्तिं मौक्तिककांस्यरौप्यमधुरक्षीरादिवस्त्राम्बुगो-योषाप्तिं सुखभोजनं तनुसुखं रूपं वदेच्चन्द्रतः ॥२॥&rdquo;
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>मोती रत्न Price — दाम किन बातों से तय होता है?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        मोती का कोई एक तय दाम नहीं होता — और यह बात नई नहीं है। बृहत्संहिता (अध्याय 80) ने भी मोती का मूल्य <strong style={{ color: GOLD }}>वज़न और सुडौलपन</strong> से तय किया था: श्लोक 13 के अनुसार अगर 13 सुरूप (सुडौल) मोती मिलकर एक धरण (एक पल का दसवाँ भाग) तौलें, तो उनका मूल्य 325 रूपक माना गया। उसी अध्याय का पहला श्लोक बताता है कि सीप (शुक्ति) से निकले मोती सबसे अधिक और अच्छे होते हैं। आज भी दाम इन्हीं बातों से बनता है — प्राकृतिक या कल्चर्ड, आकार, गोलाई, चमक और दाग।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        बाज़ार भाव रोज़ बदलते हैं, इसलिए इस पेज पर कोई rate नहीं लिखा गया। एक बात पक्की है: गलत लग्न के लिए सबसे महँगा मोती भी सही नहीं होता, इसलिए खरीदने से पहले ऊपर का मुफ़्त score देखिए। कल्चर्ड या लैब में बने रत्नों पर शास्त्र की राय <a href="/learn/lab-grown-synthetic-gemstone-vedic-astrology" style={{ color: GOLD }} className="underline">लैब-ग्रोन और सिंथेटिक रत्न</a> वाले लेख में है।
      </p>
      <p className="text-sm text-slate-400 leading-relaxed mb-4 border-l-2 pl-3" style={{ borderColor: GOLD }}>
        बृहत्संहिता, अध्याय 80, श्लोक 1: &ldquo;द्विपभुजगशुक्तिशङ्खअभ्रवेणुतिमिसूकरप्रसूतानि। मुक्ताफलानि तेषां बहुसाधु च शुक्तिजं भवति॥&rdquo; · श्लोक 13: &ldquo;पलदशभागो धरणं तद् यदि मुक्तास् त्रयोदश सुरूपाः। त्रिशती सपञ्चविंशा रूपकसङ्ख्या कृतं मूल्यम्॥&rdquo;
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
    { q: 'मोती कौन सी राशि वाले पहन सकते हैं?', a: 'मोती लग्न से तय होता है, चंद्र राशि से नहीं। तुला और वृश्चिक लग्न के लिए चंद्रमा योगकारक हैं, कर्क और मीन लग्न के लिए शुभ — ये जातक मोती पहन सकते हैं, अगर चंद्रमा बलहीन हों और suitability score अनुकूल आए। फलदीपिका (2.29) मोती को चंद्रमा का रत्न बताती है।' },
    { q: 'सफेद मोती की अंगूठी किस उंगली में पहननी चाहिए?', a: 'परंपरा में कनिष्ठा (सबसे छोटी) उंगली में, चाँदी में, सोमवार शाम शुक्ल पक्ष में। पहले अंगूठी को कच्चे दूध और गंगाजल से धोकर ॐ चंद्राय नमः 108 बार जपें। आज का शुभ समय पंचांग में तिथि, नक्षत्र और राहुकाल देखकर तय करें।' },
    { q: 'मोती रत्न का price कितना होता है?', a: 'कोई एक तय दाम नहीं है। दाम प्राकृतिक या कल्चर्ड, आकार, गोलाई, चमक और दाग से तय होता है — बृहत्संहिता (अध्याय 80, श्लोक 13) ने भी मोती का मूल्य वज़न और सुडौलपन से ही तय किया था। खरीदने से पहले मुफ़्त suitability score देख लें।' },
    { q: 'Yeh Moti suitability check free hai?', a: 'Haan, 100% free. Aapka Moon ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearMotiPage() {
  return <FocusedStonePage config={config} />;
}
