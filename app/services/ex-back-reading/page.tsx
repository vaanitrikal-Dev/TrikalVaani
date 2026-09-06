/**
 * TRIKAAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE: app/services/ex-back-reading/page.tsx
 * Version: 5.0 (06 Sep 2026) — CALCULATOR CONVERSION + keyword content
 *
 * WHAT CHANGED
 *   1. All three CTAs pointed at /?segment=ex-back. Nothing in this repo reads
 *      the `segment` query parameter — category selection is React state set by
 *      CLICKING a homepage card. The visitor landed on the plain homepage and
 *      had to scroll, pick an age tab and find the card again.
 *   2. The page led with ₹51 while BirthForm has a free tier and the homepage
 *      cards say "Free chart reading for this topic".
 *   3. Title 69 chars + app/layout.tsx's "%s | Trikaal Vaani" template = 85
 *      rendered, cut by Google at ~58.
 *   The real BirthForm now sits on the page, preselected to genz_ex_back.
 *
 * DUAL-CHART — DO NOT CHANGE THE DOMAIN ID
 *   BirthForm's DUAL_CHART_DOMAINS = ['genz_ex_back','genz_toxic_boss']. With
 *   that id a SECOND birth block appears for the other person and person2Data
 *   is sent to /api/predict. Change the id and the second chart vanishes while
 *   the page still promises a two-chart reading.
 *
 * WHY THIS PAGE MATTERS MORE THAN ITS SIZE SUGGESTS
 *   GSC, 3 months to 4 Sep 2026: 120 impressions, 10 clicks, CTR 8.33% —
 *   the HIGHEST CTR of any /services/ page — average position 6.86.
 *   Meanwhile the sixteen ex-back blog pages (~40,000 words, including
 *   /blog/ex-back-reunion-astrology at 3,650 and its Hindi twin at 3,801)
 *   earn almost nothing: none of them appear in the GSC top-1000 export at
 *   all. Google has already chosen THIS page for this intent. The blogs are
 *   linked from here so the internal equity flows to the page that ranks.
 *
 * THE GF / BF SPLIT IS CLASSICAL, NOT A GIMMICK
 *   BPHS assigns different karakas by gender: for a man, VENUS is the karaka
 *   of the beloved; for a woman, JUPITER is the karaka of the husband. So a
 *   man's reunion question is read through his Venus + 7th house, and a
 *   woman's through her Jupiter + 7th. Most tools read one identical chart for
 *   everyone. Sections 'ladke-ka-chart' and 'ladki-ka-chart' below carry this,
 *   and it is the single strongest differentiator this page has.
 *
 * ⛔ WHAT THIS PAGE WILL NOT SELL
 *   This niche's search demand includes vashikaran and "usko wapas laane ka
 *   totka" — rituals aimed at overriding another person's will. Classical
 *   Shukra, Guru and saptam-bhaav remedies ARE covered, in depth, because they
 *   are real and they work on the READER's own chart. Nothing here is aimed at
 *   controlling the other person.
 *   The second refusal matters more: this page never promises a reunion. The
 *   reader arrives hoping, and false hope is the most expensive thing you can
 *   sell someone in that state. What is promised instead — and what actually
 *   converts — is an END TO THE GUESSING. See 'kya-milega' and 'jhoothi-umeed'.
 *
 * v4.2 CHANGES vs v4.1 (CEO-approved):
 *   ✅ FIX-1: "same engine as AstroSage" removed from Step 01 visible text
 *      IR rule: no competitor names in user-visible content
 *   ✅ FIX-2: "same engine used by AstroSage" removed from FAQ Q4 answer
 *      Same IR rule — competitor comparison in FAQ = trust risk
 *   ✅ FIX-3: AuthorStrip 'RG' text → real Rohiit Gupta photo
 *      Matches HomepageGEO v2.3 EEAT upgrade — real photo stronger signal
 *   PROTECTED (untouched): all schema, FAQ questions, pricing, MaaDivineSeva,
 *      Maa Shakti content, CTA, metadata, hero, deliverables.
 *
 * v4.1 CHANGES:
 *   ✅ Fake testimonials removed, phantom ₹499 removed
 *   ✅ /about → /founder, vendor name hidden, Delhi NCR → India
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import ServiceReadingForm from '@/components/services/ServiceReadingForm';

export const metadata: Metadata = {
  title: { absolute: "Ex Wapas Aayega Ya Nahi — Free Jaanch | Trikaal Vaani" },
  description: "Chief Vedic Architect Rohiit Gupta reads your Venus, 7th House & Vimshottari Dasha to reveal if reunion energy is active — and exactly when the window opens. ₹51 deep reading.",
  keywords: ["will my ex come back astrology", "ex back vedic astrology", "reunion prediction astrology", "7th house ex partner astrology", "Rohiit Gupta vedic astrologer India"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  openGraph: { title: "Will My Ex Come Back? | Trikaal Vaani", description: "Rohiit Gupta decodes your Venus, Dasha & 7th House for a reunion prediction.", url: "https://trikalvaani.com/services/ex-back-reading", siteName: "Trikaal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/ex-back-reading" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Ex-Back Vedic Astrology Reading", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/founder" }, offers: [{ "@type": "Offer", price: "51", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Can Vedic astrology predict if my ex will come back?", acceptedAnswer: { "@type": "Answer", text: "Yes. The 7th house governs reconciliation. Venus rules reunion energy. Vimshottari Dasha pinpoints the timing. Rohiit Gupta analyzes all three together." } },
      { "@type": "Question", name: "What birth details do I need?", acceptedAnswer: { "@type": "Answer", text: "Date of birth, exact time of birth, and place of birth. The more precise the birth time, the more accurate the reading." } },
      { "@type": "Question", name: "What is Navamsa D9 and why does it matter?", acceptedAnswer: { "@type": "Answer", text: "The Navamsa (D9) is the soul chart. It reveals whether a connection carries past-life karma and whether reconciliation is supported at the soul level." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Ex-Back Reading", item: "https://trikalvaani.com/services/ex-back-reading" }] },
  ],
};


// ════════════════════════════════════════════════════════════════════════════
// v5.0 CONTENT — read the header note before adding any heading here.
// The copy is deliberately warmer and more direct than the other service
// pages: the visitor arrives in pain, not in research mode. What it never
// does is promise a reunion.
// ════════════════════════════════════════════════════════════════════════════

type EbSection = { id: string; h2: string; paras: string[] };

const V6_SECTIONS: EbSection[] = [
  {
    id: 'kya-milega',
    h2: 'Ye reading aapko kya degi — seedha jawab',
    paras: [
      'Aap roz phone dekhte hain. Har notification par dil ek baar rukta hai. Kabhi lagta hai wo aayenge, kabhi lagta hai sab khatm. **Ye na-jaanna hi sabse zyada thakata hai** — breakup se bhi zyada.',
      'Ye reading ek hi cheez ka vaada karti hai: **aapko jawab milega.** Do mein se ek — ya to chart mein wapasi ki urja abhi sakriy hai aur uska samay kya hai, ya wo urja khatm ho chuki hai aur aage ka rasta alag hai.',
      '**Dono jawab kaam ke hain.** Pehla aapko dhairya deta hai, doosra aapko aazadi. Jo cheez kisi kaam ki nahi wo hai — mahinon tak beech mein latakna.',
      '**Pehla reading bilkul free hai.** Janm vivaran daaliye, Trikaal Ka Sandesh turant milega. Poora vishleshan chahiye to uske baad ₹51.',
    ],
  },
  {
    id: 'jhoothi-umeed',
    h2: 'Ek baat pehle — hum jhoothi umeed nahi bechte',
    paras: [
      'Is kshetra mein sabse aasan cheez hai aapse ye keh dena ki **"haan, wo zaroor wapas aayenge"**. Aap khush ho jaayenge, ₹51 de denge, aur do mahine baad wahi jagah par khade honge — bas do mahine aur gawa kar.',
      'Ye page wo nahi karta. **Agar aapke chart mein wapasi ki urja nahi hai, to reading wahi likhegi** — narmi se, par saaf.',
      'Aur ye aapke haq mein hai. Jhoothi umeed sabse mehngi cheez hai: wo aapka samay leti hai, aapki neend leti hai, aur aapko aage badhne se rokti hai. **Sach kadwa hota hai par usse aazadi milti hai.**',
      'Isi liye ye page kabhi tareekh nahi deta — "15 tareekh ko phone aayega" jaisi baat koi shastra nahi kehta. Jo milta hai wo **daur** hai, aur wo sach hota hai.',
    ],
  },
  {
    id: 'kaise-kaam',
    h2: 'Reading kaam kaise karti hai',
    paras: [
      'Upar wale form mein **apna janm vivaran** daaliye, aur uske neeche **unka**. Reading dono chart padhti hai.',
      'Dekha kya jaata hai: **saptam bhaav aur uska swami** (sambandh ka bhaav), **Shukra ya Guru** — aapke ling ke hisaab se (agle do section mein khola gaya hai), **panchma bhaav** (prem aur aakarshan), **chal rahi dasha**, aur **dono chart ka aapsi mel**.',
      'Ganana Swiss Ephemeris aur Lahiri Ayanamsha par hoti hai — wahi maanak jo peshevar software use karte hain. Har point ke saath uski **wajah** likhi hoti hai, taaki aap use apni kundali se mila sakein.',
    ],
  },
  {
    id: 'ladke-ka-chart',
    h2: 'Agar aap ladke hain — aapka Shukra kya kehta hai',
    paras: [
      'Shastra mein purush ke liye **Shukra hi priya ka kaarak** hai. Aapki premika, aapka aakarshan, aur aapke rishton ka poora swaroop Shukra se padha jaata hai. Isi liye aapki reading **Shukra se shuru hoti hai**, Guru se nahi.',
      'Kya dekha jaata hai: **Shukra kis bhaav mein hai** (saptam, panchma ya ekadash mein ho to wapasi ki sambhavna prabal), **uska bal** (Shadbala se), aur **kya wo ast ya neech hai** — Shukra Kanya rashi mein neech hota hai, aur us sthiti mein prem ke maamle mein sanshay aur der aam hai.',
      'Ek sthiti jo bahut dikhti hai: **Shukra ke saath Shani ya Ketu** — wahan vyakti apni bhavna kah nahi paata. Bahar se lagta hai use farak nahi padta; andar se wo sabse zyada toota hota hai. Agar aapke saath yahi hua hai, to reading isi ko naam dega.',
      'Aur **Mangal** bhi dekha jaata hai — kyunki purush ke chart mein Mangal ahankaar aur takrav ka kaarak hai. Bahut se breakup Shukra ki kami se nahi, **Mangal ki ugrata** se hote hain. Poora vishay [Mars ego clash aur breakup](/blog/mars-ego-clash-breakup-astrology) mein hai.',
    ],
  },
  {
    id: 'ladki-ka-chart',
    h2: 'Agar aap ladki hain — aapka Guru kya kehta hai',
    paras: [
      'Yahan classical niyam badal jaata hai, aur yahi wo cheez hai jo adhikansh tool nahi karte. **Stri ke chart mein Guru pati aur jeevansaathi ka kaarak hai** — Shukra nahi. Isliye aapki reading **Guru se shuru hoti hai.**',
      'Kya dekha jaata hai: **Guru kis bhaav mein hai aur kis dignity mein** (Guru Makar mein neech hota hai, aur wahan rishton mein sammaan ka prashn uthta hai), **saptam bhaav par uski drishti** — Guru ki drishti shastra mein sabse kalyankari hai aur wo tootte rishton ko sambhal leti hai.',
      'Iske saath **Chandra** — kyunki stri ke chart mein mann aur bhavnaon ka path Chandra se hota hai. Peedit Chandra ke saath wahi breakup kai guna bhaari mehsoos hota hai. **Ye kamzori nahi hai, prakriti hai** — aur ye jaan lena hi aadha bojh utar deta hai.',
      'Aur agar aap **doosri taraf** ka Shukra bhi dekhna chahti hain — yaani unka — to wo dual chart mein aa jaata hai. Dono taraf ka poora antar [Gender differences in reunion astrology](/blog/gender-differences-reunion-astrology-venus-jupiter) mein khola gaya hai.',
    ],
  },
  {
    id: 'saptam-bhaav',
    h2: 'Saptam bhaav — rishte ka ghar',
    paras: [
      'Har sambandh ka prashn **saptam bhaav** se guzarta hai. Shastra mein wo jeevansaathi, saajhedaari aur "doosra vyakti" ka bhaav hai.',
      'Teen cheezein dekhi jaati hain. **Saptam mein kaun baitha hai** — Shani ho to der aur dooriyan, Rahu ho to uljhan aur bhram, Guru ho to raksha. **Uska swami kahan hai** — kendra ya trikona mein ho to rishta tikta hai; chhathe, aathve ya barahve mein ho to sangharsh. **Uska bal** — kamzor saptamesh ke saath rishte mein prayaas hamesha ek taraf se zyada lagta hai.',
      'Ek baat jo raahat deti hai: **saptam bhaav mein Shani hona rishta khatm hone ka sanket nahi hai.** Shani der karta hai, mana nahi karta. Bahut se lambe aur mazboot rishte Shani ke saath hi bante hain — bas unme samay lagta hai.',
      'Saptamesh aur Shukra ka poora vishleshan [Seventh lord aur Venus reunion](/blog/seventh-lord-venus-reunion-astrology) mein hai.',
    ],
  },
  {
    id: 'wapas-aayega-ya-nahi',
    h2: 'Ex wapas aayega ya nahi — chart mein kya dikhta hai',
    paras: [
      'Ye wo sawaal hai jiske liye aap yahan aaye hain, isliye seedha uttar.',
      '**Wapasi ke prabal sanket:** saptamesh aur aapka lagnesh aapas mein sambandh mein hon; **Shukra ya Guru ka gochar saptam bhaav par**; **Ketu ka saptam se sambandh** — Ketu purane rishton ko wapas laata hai, kyunki wo adhoore karm ka kaarak hai; aur **wahi dasha dobara chalna** jisme rishta bana tha.',
      '**Wapasi na hone ke sanket:** saptamesh barahve bhaav mein (vichhed ka bhaav), **Rahu-Ketu ka axis saptam par bhaari**, aur wo dasha khatm ho jaana jisne rishta joda tha. Aise mein chart bar-bar ek hi baat kehta hai — **jo tha wo poora ho chuka.**',
      'Aur wo sthiti jo sabse zyada aam hai: **dono taraf ke sanket aadhe-aadhe.** Tab reading kehti hai ki sambhavna hai par shart ke saath — aur wo shart kya hai, wahi asli jawab hota hai. Vistaar se [Ex wapas aayega ya nahi](/blog/ex-wapas-aayega-ya-nahi-astrology) mein.',
    ],
  },
  {
    id: 'ketu-purana-rishta',
    h2: 'Ketu — jo purane rishte wapas laata hai',
    paras: [
      'Ye wo graha hai jiska naam is prashn mein sabse kam liya jaata hai aur jo sabse zyada mayne rakhta hai.',
      '**Ketu adhoore karm ka kaarak hai.** Jo rishta poora nahi hua, jo baat kahi nahi gayi, jo hisaab baaki reh gaya — Ketu use wapas saamne le aata hai. Isi liye purani premika ya purana premi prayah **Ketu ki dasha ya gochar** mein lautta hai.',
      'Par Ketu ke saath ek sharti baat hai jo saaf kehni chahiye: **Ketu wapas laata hai poora karne ke liye, hamesha rehne ke liye nahi.** Kai baar wo mulakat hoti hai, baat hoti hai, aur phir dono aage badh jaate hain — aur wahi uska maqsad tha.',
      'Isliye jab reading kehti hai ki "Ketu sakriy hai", uska matlab **sampark lautega** hai — sambandh lautega, ye alag jaanch hai. Dono ka antar reading mein alag likha jaata hai.',
    ],
  },
  {
    id: 'rahu-obsession',
    h2: 'Rahu — kya ye prem hai ya aadat',
    paras: [
      'Ye section shayad is page ka sabse kadwa hissa hai, aur sabse zaroori bhi.',
      '**Rahu bhram aur jununn ka kaarak hai.** Jab Rahu saptam bhaav, Shukra ya Chandra se juda hota hai, to jo mehsoos hota hai wo prem jaisa lagta hai par asal mein **na-mil-pane ki khinchav** hoti hai. Uska pehchan chinh saaf hai: jab wo door hote hain tab sabse zyada yaad aate hain, aur jab paas hote hain to wahi baat phir kharab ho jaati hai.',
      'Ye kehna aapko achha nahi lagega, par ek baar poochh kar dekhiye: **aap unhe miss kar rahe hain, ya un dinon ko jab sab theek tha?** Rahu wale chart mein prayah doosra sach hota hai.',
      'Aur ye kamzori nahi hai — **Rahu ki dasha mein har koi yahi mehsoos karta hai**, aur wo dasha khatm hoti hai. Poora antar [Rahu-Jupiter — obsession ya asli prem](/blog/rahu-jupiter-obsession-or-real-love-astrology) mein khola gaya hai.',
    ],
  },
  {
    id: 'dono-chart',
    h2: 'Dono ki kundali — asli jawab yahin milta hai',
    paras: [
      'Ek chart batata hai ki **aap** kya mehsoos kar rahe hain. Par aapka sawaal wo nahi hai. Aapka sawaal hai **"wo kya soch rahe hain"** — aur uska uttar sirf unke chart se aata hai.',
      'Dekha jaata hai: **unka Shukra ya Guru kahan hai**, **unka saptamesh kis haal mein hai**, aur sabse zaroori — **unke graha aapke kis bhaav par pad rahe hain.** Agar unka Chandra aapke saptam par hai, to aap unke mann mein hain, chahe wo kuch kahein na. Agar unka Shani aapke saptam par hai, to unki taraf se doori jaanbujh kar hai.',
      'Yahi wo jaankari hai jo aapko **guessing se bahar** nikaalti hai. Aap unse poochh nahi sakte. Chart poochh sakta hai.',
      'Poora tarika [Dual chart synastry — ex back](/blog/dual-chart-synastry-ex-back-astrology) mein hai, aur Hindi mein [दोनों की कुंडली मिलान](/blog/dual-chart-synastry-ex-back-astrology-hindi).',
    ],
  },
  {
    id: 'unka-vivaran-nahi',
    h2: 'Unka janm vivaran nahi hai — tab kya',
    paras: [
      'Ye sabse aam dikkat hai aur uska imandar uttar zaroori hai.',
      '**Sirf janm tithi se bhi kaafi mil jaata hai** — unka Shukra, Guru, Mangal aur Chandra ki rashi, aur unka mota swabhav. **Samay ke bina unka lagna aur bhaav nahi banenge**, isliye vishleshan aadha rahega — par aadha bhi khaali se bahut behtar hai.',
      'Kahan se mile: unka Instagram ya Facebook birthday, purani baatein, unke dost, ya wo screenshot jo shayad aapke paas abhi bhi hai. Adhikansh log ye jaante hain, bas dhyan nahi aata.',
      'Aur agar bilkul na ho: **sirf apna chart daal kar bhi reading li ja sakti hai.** Wo batayegi ki **aapke** chart mein ye daur kya keh raha hai, sampark ki sambhavna kab hai, aur aapke liye aage kya hai. Ye asli sawaal ka aadha uttar hai — aur wo aadha aapke apne haath mein hai.',
    ],
  },
  {
    id: 'kab-tak',
    h2: 'Kab tak intezaar karna chahiye — samay kaise nikalta hai',
    paras: [
      'Ye reading ka sabse kaam ka hissa hai, aur asli wajah jiske liye log ise lete hain.',
      'Samay **dasha** se aata hai. Dekha jaata hai: **Shukra ya Guru ki antardasha** kab aa rahi hai, **Ketu ka daur** kab hai, aur **saptamesh ki dasha** kab chalegi. Iske saath gochar — Guru ka saptam par aana prayah rishton mein narmi laata hai.',
      'Uttar kis roop mein milta hai: **"agle 5 mahine sampark ki sambhavna sabse zyada hai"** — ek tareekh ke roop mein nahi. Kyunki dasha mahinon mein chalti hai, dinon mein nahi. Jo koi tareekh de, wo shastra se nahi bol raha.',
      'Aur agar chart kehta hai ki **agla anukool daur do saal door hai** — to wo bhi ek jawab hai, aur shayad sabse zaroori. Us jaankari par aap apni zindagi ka faisla le sakte hain. Apni dasha [Dasha Calculator](/calculators/free-dasha-calculator) par free dikh jaati hai.',
    ],
  },
  {
    id: 'sampark-karun',
    h2: 'Main pehle message karun ya intezaar karun',
    paras: [
      'Ye sabse vyavharik sawaal hai aur reading isme seedha kaam aati hai.',
      '**Anukool daur ke sanket:** Guru ka aapke ya unke saptam par gochar, Shukra ki antardasha, ya Chandra ka aapke panchma se guzarna — in dauron mein baat sunn-ne ki gunjaish zyada hoti hai.',
      '**Rukne ke sanket:** Mangal ka aapke ya unke saptam par bhaari gochar (us waqt har baat takrav ban jaati hai), Shani ka daur, ya Rahu ki antardasha — jisme kahi hui baat ka arth ulta nikal jaata hai.',
      'Aur wo salah jo har jaankaar deta hai aur jo shastra ke bhi khilaf nahi: **jab mann sabse zyada bechain ho, tab message mat kijiye.** Wahi ek niyam sabse zyada rishte bachaata hai. Reading batati hai ki wo bechaini ka daur kab hai.',
    ],
  },
  {
    id: 'shukra-upay',
    h2: 'शुक्र के शास्त्रीय उपाय — प्रेम और सामंजस्य के लिए',
    paras: [
      'शुक्र प्रेम, आकर्षण और सामंजस्य का कारक है। जब वह कमज़ोर, अस्त या नीच हो, तो रिश्तों में दूरी और ग़लतफ़हमी आम हो जाती है। ये उपाय **आपके अपने शुक्र को बल देते हैं।**',
      '**मंत्र** — "ॐ शुं शुक्राय नमः", शुक्रवार को प्रातःकाल 108 बार। बड़े प्रभाव के लिए **श्री सूक्त** का पाठ भी कहा गया है।',
      '**व्रत और दान** — शुक्रवार का व्रत; सफ़ेद वस्त्र, चावल, मिश्री, दही या इत्र का दान। शुक्रवार को **लक्ष्मी जी की उपासना** भी इसी श्रेणी में आती है।',
      '**दैनिक** — सफ़ेद या हल्के रंग पहनना, स्वच्छता और सौंदर्य का ध्यान, और मीठा दान। शुक्र सौंदर्य का कारक है और यही उसकी सबसे सरल पूजा है। रत्न का निर्णय लग्न से होता है, इसलिए पहले [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) पर जाँच कर लीजिए।',
    ],
  },
  {
    id: 'guru-upay',
    h2: 'गुरु के उपाय — विशेषकर स्त्रियों के लिए',
    paras: [
      'क्योंकि स्त्री की कुंडली में गुरु ही जीवनसाथी का कारक है, इसलिए उनके लिए उपाय गुरु से शुरू होते हैं — शुक्र से नहीं। यह अंतर अधिकांश जगह नहीं बताया जाता।',
      '**मंत्र** — "ॐ बृं बृहस्पतये नमः", गुरुवार को 108 बार। **विष्णु सहस्रनाम** या **गुरु स्तोत्र** का पाठ भी शास्त्र में कहा गया है।',
      '**व्रत और दान** — गुरुवार का व्रत, पीले वस्त्र, चने की दाल, हल्दी, केला या गुड़ का दान। **केले के पेड़ की पूजा** गुरुवार को इसी श्रेणी में आती है।',
      '**पुरुषों के लिए भी** गुरु के उपाय काम आते हैं — पर वहाँ वे धैर्य और सही निर्णय के लिए हैं, जीवनसाथी के कारक के रूप में नहीं। यही शास्त्रीय अंतर इस पेज का आधार है।',
    ],
  },
  {
    id: 'upay-ki-seema',
    h2: 'उपायों की सीमा — जो साफ़ कह देनी चाहिए',
    paras: [
      'यह इस पेज के अपने व्यापार के ख़िलाफ़ जाता है, पर लिखना ज़रूरी है।',
      '**उपाय किसी दूसरे व्यक्ति की मर्ज़ी नहीं बदलते।** शास्त्रीय उपाय आपके अपने ग्रह को बल देते हैं — आपकी स्पष्टता, आपका धैर्य, आपका आकर्षण। वे सामने वाले पर नहीं चलते, और जो कोई ऐसा दावा करे, वह आपकी बेबसी बेच रहा है।',
      'इसी कारण यह पेज **वशीकरण या "उसे वापस लाने का टोटका"** नहीं देता। वह अलग चीज़ है, और उसका अंत प्रायः पैसे के नुक़सान और और अधिक निराशा में होता है।',
      'जो उपाय सच में काम करते हैं वे यही करते हैं: **मन शांत करते हैं, ताकि आप वह न करें जो बाद में भारी पड़े** — रात दो बजे का मैसेज, बार-बार का कॉल, या वह बात जो वापस नहीं ली जा सकती। यही सबसे बड़ा उपाय है।',
    ],
  },
  {
    id: 'breakup-kyun-hua',
    h2: 'Breakup hua hi kyun — chart mein wajah dikhti hai',
    paras: [
      'Bahut se log ye jaanne aate hain, aur ye jaanna aage badhne ke liye zaroori bhi hai.',
      '**Mangal ki ugrata** — ahankaar ka takrav, wo baat jo gusse mein kahi gayi. **Shani ki doori** — thandapan, waqt na dena, zimmedari ka bojh. **Rahu ka bhram** — shak, galat-fehmi, teesra vyakti. **Ketu ka vairagya** — achanak mann ka hat jaana bina kisi wajah ke.',
      'Aur ek jo sabse kam samjha jaata hai: **saptamesh ka barahve bhaav mein hona** — jahan rishta apne aap dooriyon ki taraf jaata hai, bina kisi ki galti ke.',
      'Ye jaan lena kyun zaroori hai: **agar wajah pata ho to wahi galti dobara nahi hoti** — us rishte mein ya agle mein. Aur agar wajah aapke apne graha mein hai, to uska upay hai. Vistaar se [Mars ego clash](/blog/mars-ego-clash-breakup-astrology) aur [Saturn-Jupiter relationship debt](/blog/saturn-jupiter-relationship-debt-astrology) mein.',
    ],
  },
  {
    id: 'agar-nahi-aayega',
    h2: 'Agar chart kehta hai ki wo wapas nahi aayenge',
    paras: [
      'Ye section is page par sabse zaroori hai, kyunki kai logon ko yahi jawab milega — aur unhe akela nahi chhodna chahiye.',
      'Pehli baat: **iska matlab ye nahi ki aapke saath kuch galat hai.** Chart batata hai ki **wo** rishta poora ho chuka — aapka jeevan nahi. Ye do bilkul alag baatein hain.',
      'Doosri baat, aur ye shastra kehta hai: **saptam bhaav ek rishta nahi, sambandh ki kshamata dikhata hai.** Jiska saptam mazboot hai uske jeevan mein sambandh aate hain — is wale ke baad bhi. Reading ye bhi batati hai ki **agla anukool daur kab hai**, aur wo jaankari us waqt sabse zyada raahat deti hai.',
      'Teesri, aur sabse vyavharik: **jab jawab mil jaata hai to intezaar khatm ho jaata hai** — aur wahi wo cheez hai jo aapko thaka rahi thi. Bahut se log kehte hain ki "nahi" waala jawab sunne ke baad pehli baar unhe theek se neend aayi.',
    ],
  },
  {
    id: 'reading-vs-blog',
    h2: 'Aapne blog padh liya — phir reading kyun',
    paras: [
      'Vajib sawaal hai, aur uska uttar seedha hai.',
      '**Blog aam niyam batata hai** — Ketu purane rishte laata hai, Rahu bhram deta hai, Shani der karta hai. Wo sach hai aur padhne layak hai. Par wo har uss vyakti ke liye ek hi hai jo use padhta hai.',
      '**Reading aapka chart padhti hai** — aapka Ketu kis bhaav mein hai, aapki kaunsi dasha chal rahi hai, aur unke graha aapke kis bhaav par pad rahe hain. Ye teen cheezein har vyakti ki alag hain, aur inhi se jawab banta hai.',
      'Aur pehla reading free hai — to blog padhne ke baad, ek baar apna chart bhi dekh lijiye. Do minute lagenge.',
    ],
  },
  {
    id: 'kya-milega-report-mein',
    h2: 'Report mein kya-kya milega',
    paras: [
      '**Free — Trikaal Ka Sandesh.** Aapka saptam bhaav, aapka Shukra ya Guru (ling ke hisaab se), chal rahi dasha, aur ek seedha sanket ki wapasi ki urja abhi sakriy hai ya nahi. 150-200 shabd, turant, bina signup aur bina card.',
      '**₹51 — poora vishleshan.** Saptam bhaav aur uske swami ka vistrit vishleshan, Shukra/Guru ka bal, Ketu aur Rahu ki bhoomika, **dono chart ka mel** (agar unka vivaran diya ho), **sampark window** dasha ke saath, breakup ki jyotishiya wajah, aur **paanch vyaktigat upay**.',
      'Iske saath 900 shabd ka gehra vishleshan, Navamsa (D9) — jo rishton ka asli chart hai — aur agle chhe mahine ka gochar, mahine-dar-mahine.',
      'Jo yahan nahi hai: koi dar, koi "kisi ne kuch karwa rakha hai", koi mehnga nivaran, aur koi wada ki wo lautenge.',
    ],
  },
  {
    id: 'navamsa',
    h2: 'Navamsa (D9) — rishton ka asli chart',
    paras: [
      'Ye wo hissa hai jo adhikansh muft tool nahi dete, aur rishton ke prashn mein iske bina vishleshan adhoora hai.',
      'BPHS saaf kehta hai: **vivah aur sambandh Navamsa se dekhe jaate hain.** Janm chart **vaada** dikhata hai; Navamsa dikhata hai ki wo vaada **poora hoga ya nahi.** Isi liye ek hi janm chart wale do log alag anubhav karte hain.',
      'Dekha jaata hai: **Navamsa mein aapka saptamesh kahan hai**, **Shukra ya Guru ki D9 sthiti**, aur **vargottama** — yaani koi graha janm chart aur D9 dono mein ek hi rashi mein ho. Vargottama Shukra rishton mein bahut anukool maana jaata hai.',
      'Ye hissa poore reading mein aata hai, aur yahi wo jagah hai jahan "lagta to sab theek tha par chala nahi" jaise sawaal ka uttar milta hai.',
    ],
  },
  {
    id: 'darakaraka',
    h2: 'Darakaraka — wo graha jo aapke saathi ko darshata hai',
    paras: [
      'Jaimini paddhati ka ye hissa rishton ke prashn mein bahut kaam ka hai aur kam bataya jaata hai.',
      '**Darakaraka wo graha hai jiski degree aapke chart mein sabse kam ho.** Shastra kehta hai wahi graha aapke jeevansaathi ka swaroop dikhata hai — unka swabhav, unka pesha, aur kabhi-kabhi unse milne ka tarika.',
      'Udaharan: Darakaraka Shani ho to saathi gambhir, bade ya zimmedari wale; Rahu ho to alag pariveshbhoomi ya videshi; Budh ho to buddhi aur baatcheet pradhan. Ye sanket aksar chaunkane wale hote hain kyunki log unhe pehchaan lete hain.',
      'Reading mein ye alag se aata hai. Poora vishay [Darakaraka aur reunion](/blog/darakaraka-planets-reunion-astrology) mein khola gaya hai.',
    ],
  },
  {
    id: 'shaadi-tak',
    h2: 'Kya ye rishta shaadi tak jaayega',
    paras: [
      'Kai log wapas aane ke saath ye bhi jaanna chahte hain, aur ye alag jaanch hai.',
      'Sampark lautna aur **rishta shaadi tak jaana** do alag prashn hain. Doosre ke liye dekhe jaate hain: **Navamsa (D9)**, **saptamesh ki dasha kab aayegi**, aur **dono charton ka Ashtakoot milan** — 36 gun wala, jo nakshatra par tikta hai.',
      'Aur ek baat jo saaf kehni chahiye: **36 gun mil jaana ya na milna vivah ka faisla nahi hai.** Bahut se 30+ gun wale rishte nahi chalte aur 18 gun wale achhe chalte hain.',
      'Agar aapka asli sawaal shaadi ka hai to uske liye alag tools hain aur wo bhi free — [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) aur [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator).',
    ],
  },
  {
    id: 'mangal-dosh',
    h2: 'Kisi ne Mangal dosh bata diya hai — pehle ye padhiye',
    paras: [
      'Bahut se log is page par isi dar ke saath aate hain ki "aapki kundali mein Mangal dosh hai, isi liye rishta toota".',
      'Shastriya sthiti: **Mangal dosh tab maana jaata hai jab Mangal 1, 4, 7, 8 ya 12ve bhaav mein ho.** Aur ye **lagbhag har chauthe-paanchve chart mein milta hai** — yaani aam hai, asaamanya nahi.',
      'Aur jo aksar nahi bataya jaata: **shastra mein Mangal dosh ke bhang (radd hone) ke bhi niyam hain**, aur wo prayah lag jaate hain — dono taraf dosh ho, Mangal apni ya mitra rashi mein ho, ya Guru ki drishti ho.',
      'Apni sthiti khud jaanchni ho to [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) free hai. Jo koi dosh ka naam le kar hazaron ki pooja maange, wo dar bech raha hai.',
    ],
  },
  {
    id: 'kya-nahi-bata-sakti',
    h2: 'Ye reading kya nahi bata sakti',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye — kyunki aap is waqt sabse aasaani se yakeen kar lenge.',
      'Ye **nahi** bata sakti: wo kis din message karenge, wo abhi kisi aur ke saath hain ya nahi, wo aapke baare mein abhi kya soch rahe hain, ya koi nishchit ghatna. Koi chart kisi doosre vyakti ke aaj ke vichaar nahi padhta.',
      'Aur ye **nahi hai**: manochikitsa ka vikalp. Agar breakup ke baad neend, khaana ya rozmarra ka kaam lagatar toot raha hai, to pehla kadam reading nahi hai — pehla kadam kisi apne se baat karna hai.',
      'Jo ye deti hai: **aapke chart mein us rishte ki urja abhi kya keh rahi hai, uska sambhavit samay, aur aage ka rasta.** Isi roop mein ise lijiye — aur itna hi kaafi hota hai.',
    ],
  },
  {
    id: 'kis-ke-liye',
    h2: 'Ye reading kiske liye hai — aur kiske liye nahi',
    paras: [
      '**Sabse zyada kaam ki:** jo mahinon se soch rahe hain aur tay nahi kar pa rahe ki intezaar karein ya aage badhein; jo message karna chahte hain par darr rahe hain; aur jinhe lagta hai ki sab khatm ho gaya par mann maanta nahi.',
      '**Kam kaam ki:** jinka faisla ho chuka hai aur wo aage badh chuke hain — unhe iski zaroorat nahi. Aur jinke paas apna sateek janm samay nahi hai, kyunki bina samay ke saptam bhaav hi nahi banta.',
      '**Aur ek jagah jahan ye page sahi jagah nahi hai:** agar rishta hinsa, dhamki ya utpeedan wala tha. Wahan sawaal "wo wapas aayenge" nahi hona chahiye, aur uska uttar kundali mein nahi hai. Aisi sthiti mein kisi bharose ke vyakti se baat kijiye.',
    ],
  },
  {
    id: 'result-kaise-padhein',
    h2: 'Report padhne ka sahi kram',
    paras: [
      'Result aate hi log seedha "haan ya na" dhoondhte hain. Behtar kram ye hai.',
      '**Pehle saptamesh dekhiye** — wo kis bhaav mein hai. **Phir apna kaarak** — ladke hain to Shukra, ladki hain to Guru. **Phir Ketu aur Rahu** — kya wo saptam se jude hain.',
      '**Uske baad dasha** — kyunki wahi batati hai ki upar wali baatein **abhi** sakriy hain ya nahi. Ek anukool saptam jiska daur abhi nahi chal raha, aaj kuch nahi de raha hoga — aur wahi wajah hoti hai ki "sab theek hai phir bhi kuch nahi ho raha".',
      'Aur agar kahin **wajah samajh na aaye** — wahi jagah hai jahan doosri raay leni chahiye. Har point ke saath uski wajah isi liye likhi jaati hai.',
    ],
  },
  {
    id: 'kitni-baar',
    h2: 'Ye reading kitni baar leni chahiye',
    paras: [
      'Is prashn ka uttar is page par vishesh roop se zaroori hai.',
      '**Janm-aadhaarit hissa ek baar ka hai** — saptam bhaav, Shukra ya Guru, Navamsa. Ye kabhi nahi badalte. Chahe aap dus baar chalayein, wahi aayega.',
      '**Dasha wala hissa** tab dekhiye jab dasha badle — yaani kuch mahine ya saal mein ek baar.',
      'Aur wo baat jo narmi se kehni chahiye: **agar aap har hafte dobara chala rahe hain, to jawab badalne ka intezaar kar rahe hain — aur wo nahi badlega.** Us waqt zaroorat ek aur reading ki nahi, kisi se baat karne ki hai. Ye kehna hamare paise ke khilaf hai, par sach hai.',
    ],
  },
  {
    id: 'verify',
    h2: 'Reading ki buniyad khud parakhiye',
    paras: [
      'Kisi bhi reading par bharosa karne se pehle uski ganana parakhni chahiye — aur yahan sab kuch parakhne layak hai.',
      'Wahi janm vivaran kisi doosre bharose-mand software mein daaliye. **Lagna, saptam bhaav ki rashi, aur Shukra tatha Guru ki sthiti** bilkul milni chahiye — dono taraf Lahiri ayanamsha ho to antar nahi aayega.',
      'Aur **dasha** milaiye — kaunsi Mahadasha aur Antardasha chal rahi hai. Wo bhi bilkul milni chahiye, kyunki wo janm nakshatra se nikalti hai aur usme koi vyakhya nahi hai.',
      'Agar **lagna hi alag** aaye to samay ya shahar mein galti hai — wahi pehle jaanchiye. Apna lagna [Lagna Calculator](/calculators/free-lagna-calculator) se dekh sakte hain, aur poori kundali [Kundali Calculator](/calculators/free-kundali-calculator) se.',
    ],
  },
  {
    id: 'wo-kisi-aur-ke-saath',
    h2: 'Wo kisi aur ke saath hain — ab kya matlab hai',
    paras: [
      'Ye sawaal sabse zyada dard ke saath aata hai, isliye uttar bhi seedha hona chahiye.',
      'Pehli baat: **chart ye nahi bata sakta ki wo abhi kisi ke saath hain ya nahi.** Koi bhi kundali kisi doosre vyakti ke aaj ke rishte nahi padhti. Jo koi ye daawa kare, wo andaaza bech raha hai.',
      'Jo chart bata sakta hai: **unke chart mein sthirta ka yog hai ya nahi.** Agar unka saptamesh chal ya dvisvabhav rashi mein hai, aur Rahu us par asar daal raha hai, to unke rishte prayah jaldi badalte hain — ye unka pattern hai, aapse jude hone se pehle bhi tha.',
      'Aur wo baat jo shanti se kehni chahiye: **kisi naye rishte ka hona aapke sawaal ka jawab nahi hai.** Ketu ke daur mein purane rishte lautte hain, chahe beech mein kuch bhi hua ho. Isliye is ek jaankari par apna faisla mat rokiye.',
    ],
  },
  {
    id: 'dost-bane-rahen',
    h2: 'Dost bane rahna ya poora door hona — chart kya kehta hai',
    paras: [
      'Ye vyavharik sawaal hai aur uska jyotishiya uttar sach mein hai.',
      '**Ekadash bhaav** mitrata ka bhaav hai. Agar dono charton mein ekadash ka sambandh mazboot hai, to rishta prem se mitrata mein badal sakta hai aur wo tikta hai. Bahut se log yahi chunte hain aur khush rehte hain.',
      'Par agar **saptam par Rahu ya Mangal bhaari hai**, to "dost bane rahna" prayah kaam nahi karta — wahan har baat phir wahi mod le leti hai. Aise chart mein **poori doori** hi asli raahat deti hai, chahe wo shuru mein zyada mushkil lage.',
      'Reading dono sthiti alag batati hai — kyunki galat wala chunav mahinon tak takleef khinch deta hai.',
    ],
  },
  {
    id: 'kitni-baar-tuta',
    h2: 'Ye rishta pehle bhi toota aur juda hai — iska matlab',
    paras: [
      'Ye pattern bahut aam hai aur chart mein saaf dikhta hai.',
      'Bar-bar tootne aur judne ke sanket: **Rahu-Ketu ka axis saptam ya panchma par**, **Budh ya Chandra jaise chal grahon ka saptam se sambandh**, aur **dvisvabhav rashi** (Mithun, Kanya, Dhanu, Meen) saptam bhaav mein — jo apne swabhav se hi badalti rehti hai.',
      'Iska matlab kya hai: **rishta bura nahi hai, par usme sthirta ka yog kam hai.** Aur ye jaan lena zaroori hai, kyunki har baar wapas aane par lagta hai "ab pakka hai" — aur phir wahi hota hai.',
      'Reading yahan seedha kehti hai: **agar pattern chart mein hai to wo dobara chalega**, jab tak koi ek vyakti kuch alag na kare. Ye sunna kadwa hai par ye wahi jaankari hai jo teesri baar bachaa sakti hai.',
    ],
  },
  {
    id: 'shaanti-ke-liye',
    h2: 'Mann shaant karne ke liye — jo aaj se kar sakte hain',
    paras: [
      'Chahe jawab kuch bhi ho, ek cheez sabke liye kaam ki hai — kyunki sabse zyada takleef **intezaar** deta hai, jawab nahi.',
      '**Chandra ke upay** — kyunki Chandra mann ka kaarak hai aur breakup mein sabse zyada wahi hilta hai. Somwar ko "ॐ सों सोमाय नमः", safed cheez ka daan, aur Shiv upasana. Ye teeno saral hain aur inme paisa nahi lagta.',
      '**Ek vyavharik niyam jo har jaankaar deta hai:** raat 11 baje ke baad koi message nahi. Us waqt Chandra sabse kamzor hota hai aur wahi message subah pachhtava banta hai.',
      'Aur wo baat jo saaf kehni chahiye: **agar neend, khaana ya rozmarra ka kaam lagatar toot raha hai, to pehla kadam koi upay nahi hai.** Kisi apne se baat kijiye. Upay uske saath chalte hain, uski jagah nahi.',
    ],
  },
  {
    id: 'do-minute',
    h2: 'Do minute — aur intezaar khatm',
    paras: [
      'Aap yahan tak padh aaye hain, iska matlab sawaal abhi bhi mann mein hai.',
      '**Upar form mein apna janm vivaran daaliye.** Unka ho to bhi daal dijiye — na ho to bhi reading ban jaayegi. Do minute lagenge, aur Trikaal Ka Sandesh turant saamne aa jaayega.',
      'Koi signup nahi, koi card nahi, koi email nahi. **Pehla reading bilkul free hai** — kyunki jawab jaan-ne ke liye paisa dena nahi padna chahiye.',
      'Aur jo jawab aayega, wo sach hoga — chahe wo "haan" ho ya "nahi". Dono par aap aage badh sakte hain. **Jispar nahi badh sakte, wo hai na-jaanna** — aur wahi aaj khatm ho sakta hai.',
    ],
  },
  {
    id: 'kyun-trikaal',
    h2: 'Yahi page kyun — aur kya farak hai',
    paras: [
      '**Ganana** — Swiss Ephemeris aur Lahiri Ayanamsha, wahi jo peshevar software chalate hain. Har graha ki degree, Shadbala, Navamsa — sab dikhta hai, chhupaya nahi jaata. Aap kisi bhi doosre tool se mila kar dekh sakte hain.',
      '**Ling ke hisaab se kaarak** — ladke ke liye Shukra, ladki ke liye Guru. Ye classical niyam hai aur adhikansh tool ise nahi karte; wo sabke liye ek hi chart padh lete hain.',
      '**Do chart** — aapka aur unka. Kyunki asli sawaal "main kya mehsoos kar raha hoon" nahi, "hum dono ke beech kya hai" hai.',
      'Aur **jo yahan nahi hai** — koi vashikaran, koi "kisi ne kuch karwa rakha hai", koi mehnga nivaran, aur koi wada ki wo lautenge. Agar chart "nahi" kehta hai, to reading "nahi" hi likhegi. Yahi ek daawa hai, aur usi par aap bharosa kar sakte hain.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Aage kya padhein',
    paras: [
      '**Poora vishay** — [Ex back reunion astrology](/blog/ex-back-reunion-astrology) (3,650 shabd), Hindi mein [एक्स वापस आएगा या नहीं](/blog/ex-wapas-aayega-ya-nahi-astrology), aur [Ex back remedies — reunion ya healing](/blog/ex-back-remedies-reunion-or-healing-astrology).',
      '**Gehri baatein** — [Dual chart synastry](/blog/dual-chart-synastry-ex-back-astrology), [Darakaraka aur reunion](/blog/darakaraka-planets-reunion-astrology), [Seventh lord aur Venus](/blog/seventh-lord-venus-reunion-astrology), [Rahu-Jupiter — obsession ya prem](/blog/rahu-jupiter-obsession-or-real-love-astrology), aur [Gender differences in reunion](/blog/gender-differences-reunion-astrology-venus-jupiter).',
      '**Muft jaanch** — [Shadi Kab Hogi](/calculators/free-shadi-kab-hogi-calculator), [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator), [Dasha Calculator](/calculators/free-dasha-calculator), [Kundali Calculator](/calculators/free-kundali-calculator), aur [Gemstone Suitability](/calculators/free-gemstone-suitability-calculator).',
    ],
  },
];

type EbLink = { href: string; label: string; note: string };

const V6_HUB_READ: EbLink[] = [
  { href: '/blog/ex-back-reunion-astrology', label: 'Ex back reunion astrology', note: 'Poora vishay, 3,650 shabd' },
  { href: '/blog/ex-wapas-aayega-ya-nahi-astrology', label: 'एक्स वापस आएगा या नहीं', note: 'हिंदी में पूरा' },
  { href: '/blog/dual-chart-synastry-ex-back-astrology', label: 'Dual chart synastry', note: 'Dono chart ka mel' },
  { href: '/blog/gender-differences-reunion-astrology-venus-jupiter', label: 'Ladka vs ladki — Shukra vs Guru', note: 'Kaarak ka antar' },
  { href: '/blog/seventh-lord-venus-reunion-astrology', label: 'Saptamesh aur Shukra', note: 'Rishte ka ghar' },
  { href: '/blog/darakaraka-planets-reunion-astrology', label: 'Darakaraka', note: 'Saathi ka swaroop' },
  { href: '/blog/rahu-jupiter-obsession-or-real-love-astrology', label: 'Obsession ya asli prem', note: 'Rahu ka hissa' },
  { href: '/blog/mars-ego-clash-breakup-astrology', label: 'Mangal aur ego clash', note: 'Breakup ki wajah' },
  { href: '/blog/ex-back-remedies-reunion-or-healing-astrology', label: 'Reunion ya healing — upay', note: 'Dono raste' },
];

const V6_HUB_CALC: EbLink[] = [
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Samay ka aadhaar' },
  { href: '/calculators/free-shadi-kab-hogi-calculator', label: 'Shadi Kab Hogi', note: 'Vivah ka alag prashn' },
  { href: '/calculators/free-manglik-dosh-calculator', label: 'Manglik Dosh Calculator', note: 'Dosh khud jaanchiye' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Saptam lagna se banta hai' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Shukra aur Guru ka bal' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna se pehle jaanch' },
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Milan ka aadhaar' },
  { href: '/learn/will-i-have-love-marriage', label: 'Love marriage ka yog', note: 'Aage ka prashn' },
];

function V6Rich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={`${k}-l-${i}`} href={link[2]} className="font-semibold underline underline-offset-2 hover:opacity-80 text-[#D4AF37]">
              {link[1]}
            </Link>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${k}-b-${i}`} className="text-[#D4AF37]">{part.slice(2, -2)}</strong>;
        }
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

function V6Hub({ items }: { items: EbLink[] }) {
  return (
    <ul className="space-y-2 m-0 p-0 list-none">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold text-[#D4AF37]">{i.label}</span>
            <span className="block text-xs text-slate-500">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function V6Content() {
  return (
    <>
      <nav aria-label="Is page par kya hai" className="mt-16 mb-12 max-w-4xl mx-auto rounded-2xl p-5 md:p-6 bg-white/[0.03] border border-[#D4AF37]/20">
        <h2 className="text-lg font-serif font-bold mb-3 text-[#D4AF37]">Is Page Par Kya Hai</h2>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
          {V6_SECTIONS.map((sec) => (
            <li key={sec.id}><a href={`#${sec.id}`} className="hover:underline underline-offset-2 text-slate-300">{sec.h2}</a></li>
          ))}
        </ol>
      </nav>

      <section className="max-w-4xl mx-auto">
        {V6_SECTIONS.map((sec, si) => (
          <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-10">
            <h2 className="text-2xl font-serif font-bold mb-4 text-[#D4AF37]">{sec.h2}</h2>
            {sec.paras.map((p, pi) => (
              <p key={pi} className="text-slate-300 leading-relaxed mb-4"><V6Rich text={p} k={`v6-${si}-${pi}`} /></p>
            ))}
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto mt-12 rounded-2xl p-5 md:p-6 bg-[#0B0F1A] border border-white/[0.07]">
        <h2 className="text-base font-bold m-0 mb-2 text-[#D4AF37]">Aur padhne ke liye — sab free</h2>
        <p className="text-xs leading-relaxed mb-4 text-slate-400">
          Har vishay par alag vistrit lekh. Par yaad rahiye — blog aam niyam batata hai, reading aapka apna chart padhti hai.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 pb-1.5 text-sm font-bold border-b border-[#D4AF37]/25 text-slate-200">Padhne ke liye</h3>
            <V6Hub items={V6_HUB_READ} />
          </div>
          <div>
            <h3 className="mb-2 pb-1.5 text-sm font-bold border-b border-[#D4AF37]/25 text-slate-200">Muft calculators</h3>
            <V6Hub items={V6_HUB_CALC} />
          </div>
        </div>
      </section>
    </>
  );
}

export default function ExBackReadingPage() {
  return (
    <>
      <Script id="schema-ex-back" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />

        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#7C3AED]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Vedic Love Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Will Your Ex <span className="text-[#D4AF37]">Come Back?</span><br />Your Stars Know the Answer.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">
              Trikaal AI reads your Venus, 7th House & Vimshottari Dasha to reveal if reunion energy is active — and <span className="text-[#D4AF37] font-semibold">exactly when</span> the window opens.
            </p>
            <p className="text-sm text-gray-500 mb-10">
              Reading designed by <Link href="/founder" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris (self-hosted)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                Get My Ex-Back Reading — ₹51
              </Link>
            </div>
          </div>
        </section>

        {/* ── v5.0: the real reading form, preselected to genz_ex_back.
            That id puts BirthForm into DUAL-CHART mode, so a second block for
            the other person appears below the visitor's own. ───────────── */}
        <section className="px-4 pb-10 -mt-6">
          <ServiceReadingForm
            domain="ex-back-reading"
            heading="Dono ki kundali — aur seedha jawab"
            subheading="Saptam bhaav, Shukra ya Guru, aur chal rahi dasha. Aaj hi pata chal jaayega ki aage kya hai."
          />
        </section>

        <AuthorStrip />

        {/* WHY VEDIC */}
        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Why Vedic Astrology Can Answer <span className="text-[#D4AF37]">This Question</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "♀", title: "Venus & Your 7th House Tell the Truth", desc: "Venus (Shukra) governs love and reunion. The 7th house is the house of partnership. Their position at your birth — and their current transits — reveal whether reconciliation energy is active in your chart right now." },
                { icon: "⏳", title: "Dasha Timing Is Frighteningly Accurate", desc: "Vimshottari Dasha is a 120-year planetary timeline unique to your birth. It predicts not just IF reunion is possible — but WHEN. Most people are shocked by how precisely it pinpoints emotional turning points." },
                { icon: "🔮", title: "Navamsa Chart Shows True Soul Compatibility", desc: "The D9 (Navamsa) chart is the chart of your soul's relationships. It reveals whether this person is karmically linked to you — or whether the universe is redirecting you toward someone better." },
              ].map((r, i) => (
                <div key={i} className="border border-white/10 rounded-2xl p-7 bg-white/[0.03] hover:border-[#D4AF37]/40 transition-all duration-300 group">
                  <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{r.icon}</div>
                  <h3 className="font-serif text-xl font-bold text-[#D4AF37] mb-3">{r.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Enter Your Birth Details",
                    // v4.2 FIX-1: "same engine as AstroSage" removed — IR competitor claim
                    desc: "Date, time, and place. We use self-hosted Swiss Ephemeris (Lahiri Ayanamsha) — the astronomical standard for sidereal Vedic calculation.",
                  },
                  { step: "02", title: "Trikaal AI Reads Your Chart", desc: "Deep analysis of Venus, 7th house lord, Navamsa D9, and current Mahadasha for love timing." },
                  { step: "03", title: "Get Your Reunion Window", desc: "₹51 deep reading: Is reunion possible? When is the window? What karmic lesson is at play?" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{s.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <DeliverableCard segment="ex-back" items={["Venus & 7th House analysis", "Navamsa D9 compatibility check", "Current Mahadasha love forecast", "Reunion window — exact months", "Karma lesson behind the separation", "What to do vs. what NOT to do", "4-week emotional energy forecast"]} />
            </div>
          </div>
        </section>

        <MaaDivineSeva />

        {/* FAQ */}
        <section className="px-4 pb-4"><V6Content /></section>

        <FaqSection items={[
          { q: "Can Vedic astrology predict if my ex will come back?", a: "Yes. The 7th house governs partnerships and reconciliation. Venus rules love and reunion energy. Vimshottari Dasha pinpoints when reconciliation windows open or close. Rohiit Gupta analyzes all three together." },
          { q: "What birth details do I need for this reading?", a: "Date of birth, exact time of birth (ideally within 30 minutes), and place of birth. The more precise the birth time, the more accurate the house placements and Dasha timing." },
          { q: "What is Navamsa D9 and why does it matter?", a: "The Navamsa (D9) chart is the soul chart in Vedic astrology. It reveals whether a connection carries past-life karma and whether reconciliation is truly supported at the soul level." },
          {
            q: "How accurate is Trikaal Vaani's reading?",
            // v4.2 FIX-2: "the same engine used by AstroSage" removed — IR competitor claim
            a: "Trikaal Vaani uses self-hosted Swiss Ephemeris with Lahiri Ayanamsha — the astronomical standard for sidereal Vedic calculation. Readings with birth times accurate to within 15 minutes are most reliable.",
          },
        ]} />

        {/* CTA */}
        <CtaSection
          headline="The Answer Is Already"
          highlight="Written in Your Stars"
          body="Stop wondering. Stop checking their Instagram. Your birth chart has the truth. Get your ex-back reading for just ₹51 — less than a coffee."
          segment="ex-back"
        />

        <SiteFooter />
      </main>
    </>
  );
}

/* ─── SHARED COMPONENTS ─────────────── */

function AuthorStrip() {
  return (
    <section className="py-12 px-4 border-y border-white/5 bg-[#0A0D18]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        {/* v4.2 FIX-3: 'RG' text → real photo for stronger EEAT signal */}
        <div
          className="flex-shrink-0 relative w-20 h-20 rounded-full overflow-hidden"
          style={{
            border: '2px solid rgba(212,175,55,0.4)',
            boxShadow: '0 0 20px rgba(212,175,55,0.2)',
          }}
        >
          <Image
            src="/Rohiit-Gupta.jpg"
            alt="Rohiit Gupta, Chief Vedic Architect, Trikaal Vaani"
            fill
            className="object-cover object-top"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium mb-1">About Your Vedic Architect</p>
          <h2 className="font-serif text-xl font-bold text-white mb-2">Rohiit Gupta — Chief Vedic Architect, Trikaal Vaani</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. As founder of Trikaal Vaani, he built India&apos;s first AI-powered Vedic platform combining Swiss Ephemeris precision with premium AI reasoning. All readings are designed by Rohiit — Trikaal AI applies his framework to your unique birth chart.</p>
          <div className="flex gap-3 mt-3 flex-wrap">
            {["15+ Years Vedic Study", "Parashara BPHS Tradition", "Swiss Ephemeris Precision", "India Based"].map((t) => (
              <span key={t} className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DeliverableCard({ segment, items }: { segment: string; items: string[] }) {
  return (
    <div className="border border-[#D4AF37]/30 rounded-2xl p-8 bg-gradient-to-br from-[#D4AF37]/10 to-[#7C3AED]/10">
      <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-medium mb-6">What You Receive</p>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="text-[#D4AF37] text-lg">✦</span>
            <span className="text-gray-300">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[#D4AF37] text-2xl font-bold">₹51</p>
          <p className="text-gray-500 text-xs">Introductory price</p>
        </div>
        <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-6 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200">Unlock Now</Link>
      </div>
    </div>
  );
}

function MaaDivineSeva() {
  const arziAmounts = [101, 201, 501, 1001, 2101, 5001, 11000, 21000, 51000, 108000];
  const dhanyeAmounts = [101, 251, 501, 1008, 2501, 5001, 10001, 21000, 51000, 108000];
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#D4AF37]/4 rounded-full blur-[160px]" />
      </div>
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-5xl mb-4">🙏</div>
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Divya Seva · Divine Offering</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Maa Shakti Ki <span className="text-[#D4AF37]">Divya Seva</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            These are not fees. They are <span className="text-[#D4AF37] font-semibold">dakshina</span> — an offering from the heart, placed at Maa Shakti&apos;s feet through Trikaal Vaani. <span className="text-white font-semibold">There is no ceiling on devotion.</span> Starting ₹101, with absolutely no upper limit.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* ARZI */}
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#D4AF37]/8 to-transparent flex flex-col">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🪔</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Arzi to Maa</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Place your deepest prayer at Maa Shakti&apos;s feet. Rohiit ji personally transmits your Arzi during Vedic prayer. <span className="text-[#D4AF37] font-semibold">Starting ₹101 — no upper limit.</span></p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Suggested dakshina — or offer any amount from your heart</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {arziAmounts.map((amt) => (
                  <a key={amt} href={`https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20Arzi%20to%20Maa%20dakshina%20%E2%82%B9${amt}.%20Jai%20Maa%20Shakti!`} target="_blank" rel="noopener noreferrer" className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium">
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20Arzi%20to%20Maa%20with%20my%20own%20dakshina.%20Jai%20Maa%20Shakti!" target="_blank" rel="noopener noreferrer" className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200">My own amount ✦</a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">No amount too large. Devotion has no ceiling.</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {["Your prayer submitted to Maa Shakti", "Rohiit ji performs Vedic mantra recitation on your behalf", "WhatsApp confirmation of prayer transmission", "For love, health, protection, success, peace, family", "No prayer too big · No dakshina too large"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400"><span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>{item}</li>
              ))}
            </ul>
            <a href="https://wa.me/919211804111?text=Pranam%20Rohiit%20ji%2C%20I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20Shakti.%20Please%20guide%20me.%20Jai%20Maa%20Shakti!" target="_blank" rel="noopener noreferrer" className="block text-center bg-[#D4AF37] text-[#080B12] font-bold px-6 py-4 rounded-xl hover:bg-[#e8c84a] transition-all duration-200 text-base">🙏 Submit My Arzi to Maa</a>
            <p className="text-center text-gray-600 text-xs mt-3">Starts ₹101 · No upper limit · Pure devotion</p>
          </div>
          {/* DHANYEWAAD */}
          <div className="border border-[#D4AF37]/25 rounded-3xl p-8 bg-gradient-to-b from-[#7C3AED]/10 to-transparent flex flex-col">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🌺</div>
              <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Maa Ka Dhanyewaad</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Your prayer was answered. Return gratitude to Maa Shakti — gratitude is the highest form of worship. <span className="text-[#D4AF37] font-semibold">Starting ₹101 — no upper limit.</span></p>
            </div>
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Gratitude offering — give freely from the heart</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {dhanyeAmounts.map((amt) => (
                  <a key={amt} href={`https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20sun%20li.%20Dhanyewaad%20dakshina%20%E2%82%B9${amt}.%20Jai%20Maa!`} target="_blank" rel="noopener noreferrer" className="border border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200 font-medium">
                    ₹{amt.toLocaleString("en-IN")}
                  </a>
                ))}
                <a href="https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20I%20want%20to%20offer%20Dhanyewaad%20to%20Maa%20with%20my%20own%20dakshina%20amount.%20Jai%20Maa!" target="_blank" rel="noopener noreferrer" className="border border-dashed border-[#D4AF37]/40 text-[#D4AF37] text-sm px-3 py-1.5 rounded-full hover:bg-[#D4AF37]/15 transition-all duration-200">From my heart ✦</a>
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">The bigger the gratitude, the bigger the next blessing.</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {["Your gratitude prayer delivered to Maa Shakti", "Rohiit ji performs Vedic thanksgiving puja on your behalf", "WhatsApp confirmation with blessings for your next chapter", "For answered prayers in love, health, career, family", "Gratitude to Maa multiplies blessings — no ceiling"].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400"><span className="text-[#D4AF37] mt-0.5 flex-shrink-0">✦</span>{item}</li>
              ))}
            </ul>
            <a href="https://wa.me/919211804111?text=Jai%20Maa%20Shakti!%20Maa%20ne%20meri%20baat%20suni.%20Main%20Maa%20ka%20Dhanyewaad%20dena%20chahta%20hoon.%20Jai%20Maa!" target="_blank" rel="noopener noreferrer" className="block text-center border border-[#D4AF37] text-[#D4AF37] font-bold px-6 py-4 rounded-xl hover:bg-[#D4AF37]/10 transition-all duration-200 text-base">🌺 Offer My Dhanyewaad to Maa</a>
            <p className="text-center text-gray-600 text-xs mt-3">Starts ₹101 · No upper limit · Jai Maa Shakti</p>
          </div>
        </div>
        <div className="text-center mt-10 border-t border-white/5 pt-8">
          <p className="text-gray-600 text-xs leading-relaxed max-w-lg mx-auto">Trikaal Vaani does not profit from dakshina offerings. All Arzi and Dhanyewaad dakshinas are used for Vedic puja samagri, mantra recitation costs, and charitable givings in Maa Shakti&apos;s name. Rohiit Gupta is the intermediary — Maa is the recipient.</p>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="py-20 px-4 bg-[#0D1020]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Common Questions</p>
          <h2 className="font-serif text-3xl font-bold">Frequently Asked <span className="text-[#D4AF37]">Questions</span></h2>
        </div>
        <div className="space-y-4">
          {items.map((f, i) => (
            <details key={i} className="border border-white/10 rounded-xl p-5 bg-white/[0.02] group cursor-pointer">
              <summary className="font-semibold text-white text-sm md:text-base list-none flex justify-between items-center gap-4">
                {f.q}
                <span className="text-[#D4AF37] text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <p className="text-gray-400 text-sm leading-relaxed mt-4">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ headline, highlight, body, segment }: { headline: string; highlight: string; body: string; segment: string }) {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 to-transparent" />
      </div>
      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">{headline} <span className="text-[#D4AF37]">{highlight}</span></h2>
        <p className="text-gray-400 mb-10 leading-relaxed">{body}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]">Enter Birth Details → Get Reading</Link>
        </div>
        <p className="text-gray-600 text-xs mt-6">Powered by Swiss Ephemeris · Lahiri Ayanamsha · Reading framework by Rohiit Gupta</p>
      </div>
    </section>
  );
}

// ============================================================
// END — app/services/ex-back-reading/page.tsx v4.2
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================
