'use client';

// ============================================================
// File: app/calculators/free-should-i-wear-neelam/page.tsx
// Version: v2.2 (19 Oct 2026) — Radar weekly report 17 Oct 2026 PUSH (18 empty SERPs):
//   +5 H2 inside `guidance` — kaun si rashi (lagna, not rashi), positive effects,
//   kab nahi pehnna, kis din/kab pehnna, nuksan + kya karein, side effects for
//   females; 'Rules After Wearing' H2 made bilingual; +3 FAQ.
//   Yellow-sapphire (Pukhraj) keywords Radar routed here were deliberately NOT
//   added — they belong to free-should-i-wear-pukhraj (one page per keyword).
//   Lagna table, FocusedStonePage, form and API untouched.
// (previous) Version: v2.1 (03 Oct 2026) — +4 H2 inside `guidance` from the Radar weekly report 03 Oct 2026 — content-edit brief / PUSH list.
//   asar kitne din mein, side effects / sleepy, kitne ratti + asli pehchaan, rules after wearing.
//   Lagna table, FAQs and FocusedStonePage untouched.
// (previous) Version: v2.0 — lagna ke daave PARASHAR se (BPHS Ch.34) — 21 Sep 2026
//   Pehle ye text SAAMANYA lordship niyam se likha tha. Parashar ki
//   lagna-dar-lagna soochi (34.19-44) se milane par farq nikle — kuch ULTE
//   (Panna-Dhanu: page "malefic", shlok "YOGAKARAKA"; Heera-Vrishabh: page
//   "mukhya benefic", shlok "PAAP"). Ab intro, shubh-para, savdhaani aur FAQ
//   — chaaron ch34_lagna.py se SEEDHE bane hain. Tula-Shani par Rohiit ne
//   SHLOK chuna (shubh), TIKA nahi (yogakaraka).
// "Should I Wear Neelam?" — config over the shared FocusedStonePage.
// Target graha: Saturn (Blue Sapphire / नीलम).
// ============================================================

import FocusedStonePage, { type FocusedStoneConfig } from '@/components/calculators/FocusedStonePage';

const GOLD = '#D4AF37';

const config: FocusedStoneConfig = {
  graha: 'Saturn',
  slug: 'free-should-i-wear-neelam',
  h1: 'Should I Wear Neelam (Blue Sapphire)? — Free Vedic Check',
  schemaName: 'Should I Wear Neelam (Blue Sapphire)?',
  description: 'Free Vedic check: should you wear Neelam (Blue Sapphire)? Get a 0–100 suitability score for Saturn based on your Lagna, Shadbala, dignity, house and afflictions — with risk and verdict.',
  directAnswer: (
    <>
      Neelam (नीलम) Shani ka ratna hai — karm, anushasan aur nyaay ka karak — aur sabse tez asar wala ratna. Parashar (BPHS Ch.34) ke anusar ye shubh hai jahan <strong style={{ color: GOLD }}>Shani aapke Lagna ke liye yogakaraka ya shubh</strong> ho — jaise Taurus, Libra aur Aquarius. Aries, Leo, Scorpio aur Pisces lagna ke liye Shani paap hai — wahan ye ratna nahi pehnna chahiye. Neelam ka asar sabse tez hai — isliye 3-din trial aur expert salaah zaroori. Apna free suitability score niche check karein.

    </>
  ),
  guidance: (
    <>
      <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Neelam Kisko Pehnna Chahiye?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Neelam Shani ka ratna hai. Parashar ke anusar (BPHS Ch.34 — har lagna ki apni soochi) ye un jaatkon ke liye shubh hai jinke <strong style={{ color: GOLD }}>Lagna ke liye Shani yogakaraka ya shubh</strong> hai — <strong>Taurus (Vrishabh)</strong> lagna, jahan Shani <strong>yogakaraka</strong> hai, aur <strong>Libra (Tula)</strong> aur <strong>Aquarius (Kumbh)</strong> lagna, jahan Shani <strong>shubh</strong> hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: '#FCA5A5' }}>Savdhaani:</strong> <strong>Aries (Mesh)</strong>, <strong>Leo (Simha)</strong>, <strong>Scorpio (Vrischik)</strong> aur <strong>Pisces (Meen)</strong> lagna ke liye Shani <strong>paap</strong> hai — in jaatkon ko Neelam nahi pehnna chahiye. <strong>Cancer (Kark)</strong> aur <strong>Sagittarius (Dhanu)</strong> ke liye Shani <strong>maarak</strong> hai — sirf trial ke baad, sambhal kar. <strong>Gemini (Mithun)</strong> aur <strong>Capricorn (Makar)</strong> ke liye Shani <strong>sama</strong> (na shubh, na paap) hai — trial ke baad hi. <strong>Virgo (Kanya)</strong> lagna par granth Shani ke baare mein chup hai — wahan score aur expert salaah dekhein.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Lekin sirf lagna kaafi nahi. Shani ka <strong>bal (Shadbala)</strong>, <strong>dignity</strong> (uccha/neecha/shatru), <strong>bhaav</strong> aur <strong>afflictions</strong> bhi dekhe jaate hain. Ek balheen-par-shubh Shani ko Neelam mazboot karta hai; ek neecha ya buri tarah afflicted Shani ka Neelam ulta nuksaan kar sakta hai. Isliye upar diya gaya suitability score in sabhi factors ko jodता hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        <strong style={{ color: GOLD }}>Iron rule:</strong> Neelam chahe kitna hi suitable lage, ise hamesha <strong>3 din ke trial</strong> ke saath, jaankaar astrologer ki salaah lekar hi dharan karein.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>कौन सी राशि वालों को नीलम पहनना चाहिए? — राशि नहीं, लग्न देखिए</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        सबसे आम गलती यहीं होती है: नीलम का फ़ैसला <strong style={{ color: GOLD }}>चंद्र राशि या नाम राशि से नहीं, लग्न से</strong> होता है, क्योंकि शनि किन भावों का स्वामी है यह लग्न तय करता है। पाराशर (BPHS अध्याय 34) के अनुसार <strong>वृषभ लग्न</strong> के लिए शनि योगकारक हैं, और <strong>तुला</strong> व <strong>कुंभ लग्न</strong> के लिए शुभ — इन्हें नीलम सबसे ज़्यादा फलता है। <strong>मेष, सिंह, वृश्चिक और मीन लग्न</strong> के लिए शनि पाप हैं — इन्हें नीलम नहीं पहनना चाहिए, चाहे राशि कुछ भी हो।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        इसलिए &ldquo;मेरी राशि मकर है तो नीलम पहन लूँ&rdquo; वाला तर्क अधूरा है। अपना लग्न <a href="/calculators/free-lagna-calculator" style={{ color: GOLD }} className="underline">लग्न कैलकुलेटर</a> से निकालिए, फिर ऊपर का suitability score देखिए — वह लग्न के साथ शनि का बल, भाव और पीड़ा भी जोड़ता है। विस्तार <a href="/blog/neelam-blue-sapphire-benefits-side-effects-hindi" style={{ color: GOLD }} className="underline">नीलम किसे पहनना चाहिए</a> में है।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Positive Effects of Blue Sapphire — What Changes When It Suits You</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        When Saturn is a benefic for your Lagna and Neelam suits you, the change people describe is mostly about <strong style={{ color: GOLD }}>steadiness, not luck</strong>: work that had stalled starts moving, discipline comes more easily, decisions feel clearer, and long-pending matters — a job, a property file, a dispute — begin to close. Saturn rules patience and sustained effort, so the benefit builds over weeks and months rather than arriving overnight.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Two honest limits. A gemstone strengthens the planet; it does not replace effort, and it cannot fix a Saturn that is weak for reasons a stone does not touch. And the positive effects only apply when the suitability check and 3-day trial are clean — the same stone that steadies one chart can unsettle another. Check how strong your Saturn already is with the <a href="/calculators/free-graha-bal-calculator" style={{ color: GOLD }} className="underline">Graha Bal Calculator</a>.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>नीलम कब नहीं पहनना चाहिए? — 5 स्थितियाँ</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        पाँच स्थितियों में नीलम न पहनें। <strong>(1)</strong> जब आपके लग्न के लिए शनि पाप हों — मेष, सिंह, वृश्चिक, मीन लग्न। <strong>(2)</strong> जब कुंडली में शनि नीच या बुरी तरह पीड़ित हों और score कम आए — ऐसे शनि को बल देना उल्टा पड़ सकता है। <strong>(3)</strong> जब 3 दिन के trial में नींद, मन या घटनाओं पर बुरा असर दिखे। <strong>(4)</strong> जब रत्न में दरार, धब्बा हो या लैब सर्टिफ़िकेट न हो। <strong>(5)</strong> जब साथ में माणिक, मोती या मूंगा पहना हो — परंपरा इन्हें शनि के विरोधी ग्रहों का मानती है।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        एक भ्रम भी दूर कर दें: <strong style={{ color: GOLD }}>साढ़ेसाती चल रही है, सिर्फ़ इस वजह से नीलम पहनना नियम नहीं है।</strong> साढ़ेसाती शनि का गोचर है, जबकि नीलम जन्म कुंडली के शनि को बल देता है — दोनों अलग बातें हैं। साढ़ेसाती के सुरक्षित उपाय <a href="/calculators/free-sade-sati-calculator" style={{ color: GOLD }} className="underline">साढ़ेसाती कैलकुलेटर</a> पर हैं।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>नीलम किस दिन और कब पहनना चाहिए?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        परंपरा में नीलम <strong style={{ color: GOLD }}>शनिवार</strong> को पहना जाता है — आमतौर पर शाम को, या शनिवार सुबह की <strong>शनि होरा</strong> में (सूर्योदय के बाद का पहला घंटा)। शुक्ल पक्ष का शनिवार अधिक शुभ माना जाता है, और शनि के अपने नक्षत्र — <strong>पुष्य, अनुराधा, उत्तराभाद्रपद</strong> — हों तो और अच्छा। पहनने से पहले अंगूठी को गंगाजल या कच्चे दूध से शुद्ध करें और <strong>&ldquo;ॐ शं शनैश्चराय नमः&rdquo; 108 बार</strong> जपें।
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        पर क्रम याद रखें: पहले suitability और 3 दिन का trial, फिर मुहूर्त। गलत रत्न सही मुहूर्त में पहनने से सही नहीं हो जाता। अपने शहर का शनिवार का शुभ समय और होरा <a href="/panchang" style={{ color: GOLD }} className="underline">पंचांग</a> पर देख सकते हैं।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Neelam Pehnne Ke Nuksan — Aur Agar Ho Jaye To Kya Karein</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Galat Neelam ka nuksan aksar teen jagah dikhta hai: <strong>sharir</strong> (chhoti chot, girna, neend ka bigadna), <strong>paisa</strong> (achanak kharch ya nuksan) aur <strong>mann</strong> (bhaaripan, dar, chidchidapan). Yeh is liye kyunki Neelam Shani ki urja ko tez karta hai — jahan Shani aapke lagna ke liye paap hain, wahan wahi tez urja galat bhaavon ko jagati hai.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        Agar aisa lag raha hai to <strong style={{ color: GOLD }}>teen kadam</strong>: (1) ratna turant utaar dijiye — ise &ldquo;thoda aur dekh lete hain&rdquo; ke liye mat pehne rahiye. (2) 11 Shanivar &ldquo;ॐ शं शनैश्चराय नमः&rdquo; 108 baar aur kisi mazdoor ya buzurg ko bhojan — yeh Shani ko shaant karta hai, urja nahi badhata. (3) Agar sehat ki samasya bani rahe to doctor ko dikhaiye — ratna ko kaaran maan kar ilaaj mat taaliye. Poori jaankari <a href="/blog/blue-sapphire-neelam-side-effects" style={{ color: GOLD }} className="underline">Blue Sapphire side effects</a> mein hai.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>नीलम कितने दिन में असर दिखाता है?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        परंपरा में नीलम को <strong style={{ color: GOLD }}>सबसे जल्दी असर दिखाने वाला रत्न</strong> माना गया है — अच्छा या बुरा, संकेत प्रायः 24 से 72 घंटे में दिखने लगते हैं। इसी कारण नियम है कि पहले <strong>3 दिन का trial</strong> हो: रत्न को कपड़े में बाँधकर या तकिये के नीचे रखें, और नींद, मन और घटनाओं पर ध्यान दें। स्थायी लाभ धीरे-धीरे, Shani की प्रकृति के अनुसार, हफ़्तों-महीनों में बनता है।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Neelam Side Effects — Feeling Sleepy, Restless or Bad Dreams?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Tradition names clear warning signs during or after the trial: <strong>disturbed sleep or heavy drowsiness, frightening dreams, small accidents or injuries, sudden losses, or a heavy, low mood</strong>. Any of these is read as Neelam not suiting you — take it off and do not continue. Persistent sleep or health problems should be seen by a doctor; a gemstone is never the explanation to rely on. More on this in <a href="/blog/blue-sapphire-neelam-side-effects" style={{ color: GOLD }} className="underline">Blue Sapphire side effects</a>.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Blue Sapphire Side Effects for Females — Is Anything Different?</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Short answer: <strong style={{ color: GOLD }}>the classical rules do not change by gender.</strong> BPHS decides Neelam by Lagna and Saturn&apos;s strength for every chart, so the suitability check, the 3-day trial and the warning signs are exactly the same for women and men. Any claim that Neelam is &ldquo;more dangerous for women&rdquo; has no basis in the texts.
      </p>
      <p className="text-slate-300 leading-relaxed mb-4">
        What tradition does advise is extra caution during pregnancy and in illness — avoid starting any new strong gemstone then, and treat health concerns medically first. If you are trying to understand a marriage or family question through Saturn, the stone is rarely the first step; a full chart reading is. You can compare Saturn&apos;s role in your chart with the free <a href="/calculators/free-weak-planet-finder" style={{ color: GOLD }} className="underline">Weak Planet Finder</a>.
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>नीलम कितने रत्ती का पहनें — और असली नीलम की पहचान</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        वज़न का कोई एक शास्त्रीय नियम नहीं है; प्रचलन में <strong>3 से 7 रत्ती</strong> के बीच पहना जाता है। उससे ज़्यादा ज़रूरी है कि रत्न असली और बिना दरार हो। घर पर पानी या दूध वाले &ldquo;टेस्ट&rdquo; भरोसेमंद नहीं होते — <strong style={{ color: GOLD }}>प्रमाणित लैब सर्टिफ़िकेट</strong> लीजिए, जो यह भी बताए कि रत्न heated है या unheated। कीमत वज़न, मूल स्थान, रंग और उपचार से तय होती है, इसलिए कोई एक भाव सही नहीं होता।
      </p>
      <h2 className="text-2xl font-serif font-bold mb-4 mt-10" style={{ color: GOLD }}>Rules After Wearing Blue Sapphire — नीलम पहनने के बाद क्या नहीं करना चाहिए</h2>
      <p className="text-slate-300 leading-relaxed mb-4">
        Wear it on the middle finger in silver or panchdhatu, first put on on a Saturday evening with the Shani mantra (ॐ शं शनैश्चराय नमः). Keep wearing it rather than taking it on and off. Traditional practice avoids pairing Neelam with Manik (ruby), Moti (pearl) or Moonga (red coral), as their planets are treated as Shani&apos;s opposites. And keep watching for the warning signs above — if they appear even after weeks, remove it.
      </p>
    </>
  ),
  faqs: [
    { q: 'Neelam kisko pehnna chahiye?', a: 'Neelam (Shani ratna) Parashar (BPHS Ch.34) ke anusar shubh hai jahan Shani aapke Lagna ke liye yogakaraka hai — Taurus, ya shubh hai — Libra aur Aquarius. Aries, Leo, Scorpio aur Pisces lagna ke liye Shani paap hai, in logon ko Neelam nahi pehnna chahiye. Cancer, Sagittarius, Gemini aur Capricorn ke liye sirf trial ke baad. Virgo par granth chup hai.' },
    { q: 'Neelam pehnne se pehle trial kyun zaroori hai?', a: 'Neelam ka asar bahut tez hota hai — agar suit kare toh jaldi laabh, na kare toh jaldi nuksaan. Isliye classical niyam hai ki ise 3 din trial mein (takiye ke neeche ya baandh kar) rakhein. Neend, mann aur ghatnaon mein nakaratmak badlav dikhe toh na pehnein.' },
    { q: 'Kya exalted ya Mahadasha Shani ke liye Neelam pehn sakte hain?', a: 'Sirf tab jab Shani aapke Lagna ke liye functional benefic bhi ho. Agar Parashar (BPHS Ch.34) aapke lagna ke liye Shani ko paap kehte hain (Aries, Leo, Scorpio, Pisces), toh exalted ya Mahadasha hone par bhi Neelam suit nahi karta — yeh galat kshetra ko balshali kar sakta hai.' },
    { q: 'Neelam kaunsi ungli aur dhaatu mein pehnein?', a: 'Neelam aam taur par chandi (silver) ya panchdhatu mein, madhyama (middle) ungli mein, shanivar ki shaam, Shani mantra (ॐ शं शनैश्चराय नमः) ke saath pehna jaata hai. Original, certified, bina daag wala stone hi lein — par pehle suitability aur trial zaroori.' },
    { q: 'Which rashi should not wear blue sapphire?', a: 'Neelam is decided by Lagna (ascendant), not by Moon sign or name rashi. Per BPHS Chapter 34, Saturn is a malefic for Aries, Leo, Scorpio and Pisces Lagna — they should not wear Blue Sapphire. It suits Taurus Lagna best (Saturn is yogakaraka), and Libra and Aquarius Lagna (Saturn is benefic). Others only after a check and a 3-day trial.' },
    { q: 'Neelam kis din aur kab pehnna chahiye?', a: 'Parampara mein Shanivar ko — shaam ko, ya Shanivar subah ki Shani hora mein. Shukla paksha aur Pushya, Anuradha ya Uttarabhadrapada nakshatra ho to aur achha. Pehle ganga jal ya kachche doodh se shuddhi aur "ॐ शं शनैश्चराय नमः" 108 baar. Par pehle suitability aur 3 din ka trial — muhurat baad mein.' },
    { q: 'Are blue sapphire side effects different for females?', a: 'No. The classical rules are the same for every chart — Lagna, Saturn strength, suitability check and a 3-day trial. Tradition only advises not starting any new strong gemstone during pregnancy or illness, and treating health concerns medically first.' },
    { q: 'Yeh Neelam suitability check free hai?', a: 'Haan, 100% free. Aapka Saturn ka 0–100 suitability score, risk aur verdict bilkul muft.' },
  ],
};

export default function ShouldIWearNeelamPage() {
  return <FocusedStonePage config={config} />;
}
