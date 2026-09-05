'use client';

// ============================================================
// File: app/calculators/free-ias-astrology-calculator/page.tsx
// Version: v2.0 — GSC-driven content build (05 Sep 2026)
// API: /api/calc/yog  (type: 'upsc')
// Engine: lib/upsc-engine.ts
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// BASELINE BEFORE THIS BUILD (Radar E2, 05 Sep 2026)
//   558 words · 2 H2 · 21 internal links · 137 lines.
//   GSC, 3 months to 4 Sep 2026: 11 impressions, 2 clicks, position 4.2.
//   Position was never the problem. The page had no title tag (fixed in the
//   new layout.tsx) and almost no body, so Google had nothing to rank it on.
//
// WHERE THE H2s COME FROM — every one is a real query, not invented
//   A) Google Search Console, 3 months to 4 Sep 2026, this cluster's queries:
//        ias astrology calculator ................ 109 impressions
//        government job yog in kundali ........... 107
//        ias astrology calculator free ............ 42  (CTR 23.8%)
//        sarkari naukri ........................... 42
//        govt job prediction by kundali ........... 39
//        ias kundli ............................... 39
//        ias yog in kundli calculator ............. 38  (CTR 21.1%)
//        when will my career improve … dasha ...... 38
//        government job astrology ................. 37
//        govt job yoga in kundali ................. 34
//        ias kundali .............................. 28
//        timing of government job in astrology .... 27
//        upsc astrology ........................... 26
//        yoga for government job in astrology ..... 25
//        govt job in kundali / government job
//          prediction / government job kundali .... 22 each
//        will i clear upsc astrology .............. 21
//        vedic career ............................. 17
//        ias kundli example charts ................ 14
//        check government job in my kundali free ... 8
//        government job kundli calculator .......... 4
//        kundli of ias officers .................... 4
//        kundali me sarkari naukri ke yog kaise dekhe  1
//   B) Radar E3 PASF/PAA for cluster calc-ias, harvested from live SERPs:
//        Who is Mukesh Ambani's astrologer? ....... surfaced 26x
//        Govt job prediction by date of birth
//          free online ............................ 12x
//        Career prediction by date of birth
//          Indian astrology free .................. 12x
//        Career prediction by date of birth
//          prokerala .............................. 11x
//
//   The two competitor-shaped queries (Mukesh Ambani, prokerala) are answered
//   honestly rather than dodged. Google surfaces them, so people ask them; a
//   straight answer is worth more here than a sales line, and both sections
//   say plainly what this page cannot do.
//
// LANGUAGE RULE
//   English keyword -> English section. Hindi keyword -> Hindi section. The
//   cluster's GSC queries are majority English-script but the intent is Indian,
//   so roughly half the sections are Devanagari. The baseline page had zero.
//
// UNCHANGED — do not "tidy" these
//   YogCalculator config (type 'upsc'), buildCalcJsonLd call, the plain
//   <script> JSON-LD emission, the breadcrumb, the header and the intro card.
//   The form, the result renderer, /api/calc/yog and lib/upsc-engine.ts are
//   not touched by this file at all. Only words, links and FAQs changed.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ============================================================

import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';
import YogCalculator from '@/components/calculators/YogCalculator';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const FAQS = [
  {
    "q": "IAS astrology calculator kaam kaise karta hai?",
    "a": "Aapki janm-kundali se saat blocks par score banta hai — 10th house aur uska swami, Dasamsa D-10 (BPHS ke anusaar career ka varga), 6th house yaani pratiyogita, Surya aur Shani ki Shadbala, Pancha Mahapurusha yogas, 10th house par drishti, aur abhi chal rahi Dasha. Har block apna reason aur asli number dikhata hai."
  },
  {
    "q": "Kya ye bata sakta hai ki main UPSC clear karunga?",
    "a": "Nahi, aur jo tool ye daawa kare usse door rahiye. Ye ek Yog Strength Score hai — yaani aapke chart mein sarkari sewa ke classical combinations kitne aur kitne mazboot hain. Pariksha mehnat, taiyari aur samay se nikalti hai. Kundali sirf ye batati hai ki hawa aapke saath hai ya khilaf."
  },
  {
    "q": "Dasamsa D-10 kya hai aur ye kyun zaroori hai?",
    "a": "Dasamsa dashvaan divisional chart hai. Brihat Parashara Hora Shastra ke Chapter 6 mein saaf likha hai ki career ka nirnay Dasamsa se hota hai. Rasi chart vaada dikhata hai, Dasamsa uski pushti karti hai. Zyadatar free calculators D-10 chhod dete hain — isme wo hai."
  },
  {
    "q": "Shadbala ka score mein kya role hai?",
    "a": "Shadbala har graha ki asli taakat naapti hai, chhe alag maapon se, aur use us graha ke apne classical minimum ke against tolti hai. Ratio 1.00 ka matlab hai graha apna poora phal dene mein saksham hai. Isliye calculator kehta hai 'Shani ki Shadbala 1.41' — na ki sirf 'Shani mazboot hai'."
  },
  {
    "q": "Amatyakaraka 6th house mein hone ka kya matlab hai?",
    "a": "Jaimini paddhati mein Amatyakaraka wo graha hai jiski degree sabse zyada wale ke baad doosre number par ho — ye career ka pratinidhi hota hai. Uska 6th house yaani pratiyogita ke ghar mein hona competitive exam ka sabse khaas classical sanket mana jata hai."
  },
  {
    "q": "Score kam aaye to kya matlab hai?",
    "a": "Kam score ka matlab ye nahi ki sarkari naukri nahi milegi. Iska matlab hai ki chart mein ye yog utne prabal nahi hain, aur mehnat zyada lagegi. Result mein 'Kya rok raha hai' section batata hai ki asal mein kaunsa graha ya ghar kamzor hai — wahi kaam ki jagah hai."
  },
  {
    "q": "Time of birth kitna zaroori hai?",
    "a": "Bahut. Lagna har do ghante mein badalta hai, aur uske saath saare bhaav badal jaate hain — 10th house, 6th house, sab. Galat samay se score bhi galat aayega. Samay pata na ho to 12:00 PM maan liya jata hai, par phir result approximate hi hai."
  },
  {
    "q": "Kya ye calculator free hai?",
    "a": "Haan, poora free. Score, saare blocks ka breakdown reason ke saath, blockers, kaunsi sarkari line khuli hai, aur Dasha timing — sab bina kisi payment ke."
  },
  {
    "q": "कुंडली में सरकारी नौकरी के योग कैसे देखें?",
    "a": "क्रम यह है: पहले दशम भाव और उसका स्वामी, फिर दशमांश (D-10) में उसी स्वामी की स्थिति, फिर छठा भाव जो प्रतियोगिता का घर है, फिर सूर्य और शनि की षड्बल, और अंत में चल रही दशा। एक भी संकेत अकेले योग नहीं बनाता — शास्त्रीय शर्त यह है कि तीन या चार स्वतंत्र संकेत एक ही दिशा में हों।"
  },
  {
    "q": "Govt job prediction by date of birth — sirf date se ho sakta hai?",
    "a": "Adhoora hoga. Sirf tareekh se Chandra rashi aur nakshatra nikal aate hain, par 10th house, 6th house aur poora Dasamsa lagna se bante hain — aur lagna janm samay se. Isliye ye calculator teeno maangta hai: tareekh, sateek samay aur sthan. Jo tool sirf date maang kar sarkari naukri ka jawab de de, wo bhavan ke bina naksha bana raha hai."
  },
  {
    "q": "IAS, IPS aur IFS — kya kundali seva bata sakti hai?",
    "a": "Imaandari se: nahi, sewa ka naam nahi. Jo nikal sakta hai wo pravritti hai — Mangal aur Shani ka zor vardi wali seva ki taraf jhukta hai, Guru aur Budh ka zor prashasnik aur neeti wali taraf, Shukra aur Budh ka videsh sewa ki taraf. Par rank aur seva allocation pariksha ke marks se tay hote hain, kundali se nahi."
  },
  {
    "q": "Sarkari naukri ka samay kaise pata chalta hai?",
    "a": "Dasha se. Yog batata hai ki sambhavna hai; Mahadasha aur Antardasha batati hai ki wo kab khulegi. Jab 10th house ka swami, 6th ka swami ya Shani-Surya mein se koi Dasha chalata hai, wo window maani jaati hai. Result mein ye timing alag se aati hai."
  },
  {
    "q": "Kya kam score wale IAS nahi ban sakte?",
    "a": "Ban sakte hain, aur bante hain. Ye score yog ki prabalta naapta hai, ghatna ki nishchitta nahi. Prabal yog wale bahut se log pariksha nahi de paate, aur samanya yog wale bahut se log mehnat se nikal jaate hain. Kundali hawa batati hai, kishti aapko chalani hai."
  },
  {
    "q": "Ye calculator doosre free tools se alag kaise hai?",
    "a": "Teen cheezon mein. Ek, ye Dasamsa D-10 padhta hai — zyadatar free tools sirf rasi chart dekhte hain. Do, ye Shadbala ka asli number dikhata hai, sirf 'mazboot/kamzor' nahi. Teen, har point ke saath uski wajah likhi hoti hai, taaki aap use apni kundali se khud mila sakein."
  }
];

// ── v2.0 content ─────────────────────────────────────────────────────────
type IasSection = { id: string; h2: string; paras: string[] };

const SECTIONS: IasSection[] = [
  {
    id: 'kaise-nikalta-hai',
    h2: 'IAS Astrology Calculator — kundli se kaise nikalta hai',
    paras: [
      'Ye calculator **saat alag blocks** par score banata hai, aur har block ke peeche ek classical niyam hai — koi ek "yog haan/na" nahi. **10th house aur uska swami** (karma bhaav), **Dasamsa D-10 ki pushti**, **6th house** yaani pratiyogita ka ghar, **Surya aur Shani ki Shadbala**, **Pancha Mahapurusha yogas**, **10th house par drishti**, aur **abhi chal rahi Dasha**. Score ke saath har point ki wajah aur asli number bhi dikhta hai.',
      'Kundali banane ke liye teen cheezein chahiye — janm tithi, **sateek janm samay**, aur janm sthan. Samay par zor isliye hai kyunki 10th house, 6th house aur poora Dasamsa **lagna se** bante hain, aur lagna har do ghante mein badal jaata hai. Pandrah minute ki galti 10th house ka swami badal sakti hai, aur uske saath poora jawab.',
      'Ye saat blocks barabar weight nahi rakhte. Dasamsa ki pushti aur 10th ke swami ki Shadbala sabse bhaari hain; Mahapurusha yog sabse halka, kyunki wo aam bhi hai aur har baar sarkari sewa ki taraf ishara nahi karta. Isliye do log jinka total lagbhag ek jaisa ho, unki wajah bilkul alag ho sakti hai — aur breakdown wahi dikhata hai.',
    ],
  },
  {
    id: 'govt-job-yog-kundali',
    h2: 'Government Job Yog in Kundali — the seven blocks this page scores',
    paras: [
      'The classical picture of a government career is not one combination. It is a **convergence of independent signals**, and the seven this calculator scores are the ones the texts keep returning to. The **10th house and its lord** carry karma and public standing. The **Dasamsa (D-10)** either confirms the Rasi chart or contradicts it. The **6th house** governs competition, service and the defeat of rivals — which is why it matters more for an exam than the 10th does.',
      '**Sun** is the karaka of authority, government and the state itself; **Saturn** is the karaka of service, discipline and the long grind that a government career actually is. Their **Shadbala** — measured strength against each planet\'s own classical minimum — decides whether they can deliver what their placement promises. Then the **Pancha Mahapurusha yogas**, and finally **drishti** on the 10th, measured in virupas rather than counted as present or absent.',
      'What none of these do individually is decide anything. A single indicator is extremely common — Saturn aspects the 10th house from three different positions, so a large share of charts have that aspect by geometry alone. If it were sufficient, government jobs would not be competitive. The classical requirement is **three or four independent signals agreeing**, with the Dasamsa confirming rather than contradicting them. Deeper reading sits in [Government Job & UPSC Astrology](/learn/government-job-chances).',
    ],
  },
  {
    id: 'date-of-birth-free-online',
    h2: 'Govt Job Prediction by Date of Birth — Free Online',
    paras: [
      'This is the most-asked shape of the question, and it deserves a straight answer rather than a form. **Date of birth alone is not enough**, and any tool that says otherwise is selling confidence rather than calculation. From the date you can derive the Moon\'s sign and nakshatra, and a rough Vimshottari balance. You cannot derive the ascendant — and without the ascendant there is no 10th house, no 6th house and no Dasamsa.',
      'Since every one of the seven blocks above depends on house positions, a date-only reading answers a different question from the one being asked. This calculator therefore asks for **date, exact time and place**, and it is free with all three — no signup, no card, no held-back result.',
      'If the birth time genuinely is not known, the honest position is that the Moon-based half of the reading still holds and the house-based half does not. Run it with an approximate time by all means, but read the planetary strengths rather than the house placements, and treat the score as indicative. A birth certificate or hospital record is worth the ten minutes it takes to find.',
    ],
  },
  {
    id: 'sarkari-naukri-ke-yog',
    h2: 'कुंडली में सरकारी नौकरी के योग कैसे देखें',
    paras: [
      'क्रम मायने रखता है, और अधिकतर लोग इसे उल्टा पढ़ते हैं। **पहले दशम भाव और उसका स्वामी** — वह कहाँ बैठा है, किस भाव में, और उसकी षड्बल क्या है। **फिर दशमांश (D-10)** — वही स्वामी वहाँ कहाँ गया, क्योंकि करियर का निर्णय शास्त्र दशमांश से करने को कहता है, राशि चार्ट से नहीं।',
      '**तीसरा, छठा भाव** — यह प्रतियोगिता, सेवा और शत्रु-नाश का घर है। प्रतियोगी परीक्षा के लिए यह दशम से भी अधिक महत्वपूर्ण है, और यही वह बात है जो सामान्य करियर विश्लेषण छोड़ देते हैं। **चौथा, सूर्य और शनि** — सत्ता का कारक और सेवा का कारक, दोनों की षड्बल के साथ। **पाँचवाँ, दशा** — योग कब खुलेगा।',
      'एक चेतावनी जो पैसा बचाती है: **अकेला संकेत योग नहीं होता।** दशम में शनि, या छठे में मंगल, या सूर्य का दशम भाव — इनमें से कोई एक अकेले लगभग हर बारहवीं कुंडली में मिल जाता है। शास्त्रीय शर्त **मेल** की है। पूरा क्रम [दशम भाव और सरकारी नौकरी](/learn/10th-house-government-job-astrology) में खोला गया है।',
    ],
  },
  {
    id: 'dasham-bhav',
    h2: 'दशम भाव — कर्म का घर, और सरकारी सेवा की पहली शर्त',
    paras: [
      'दशम भाव को कर्म भाव कहा जाता है — पर इसका अर्थ केवल "नौकरी" नहीं है। यह **सार्वजनिक पहचान** का भाव है: समाज आपको किस रूप में जानता है, आपका पद क्या है, और आपके काम का सार्वजनिक चेहरा क्या है। सरकारी सेवा में यही पहलू सबसे प्रमुख होता है, इसीलिए दशम भाव यहाँ पहला पड़ाव है।',
      'देखने योग्य तीन बातें: **दशम का स्वामी कहाँ बैठा है** — केंद्र या त्रिकोण में हो तो बल मिलता है, छठे-आठवें-बारहवें में हो तो अर्थ बदल जाता है (हालाँकि छठा यहाँ अपवाद है, नीचे देखिए)। **दशम भाव में कौन से ग्रह हैं** — सूर्य, शनि, मंगल और गुरु की उपस्थिति के अलग-अलग शास्त्रीय अर्थ हैं। और **दशम पर किसकी दृष्टि है**, विरुपा में नापी हुई, केवल "है या नहीं" नहीं।',
      'एक आम भ्रम: खाली दशम भाव कमज़ोर नहीं होता। भाव का फल उसके **स्वामी** से चलता है, ग्रहों की भीड़ से नहीं। खाली दशम और बलवान दशमेश वाली कुंडली, भरे हुए दशम और पीड़ित दशमेश वाली कुंडली से अक्सर बेहतर होती है। ग्रह-वार विवरण [दशमेश और करियर की दिशा](/blog/tenth-lord-career-path-astrology-hindi) में है।',
    ],
  },
  {
    id: 'dasamsa-d10',
    h2: 'दशमांश (D-10) — करियर का असली चार्ट, और यही असली जवाब देता है',
    paras: [
      'यह इस पूरे पेज की सबसे ज़रूरी बात है: **करियर राशि चार्ट से नहीं, दशमांश (D-10) से पढ़ा जाता है** — ठीक वैसे जैसे विवाह नवमांश से पढ़ा जाता है। बृहत् पाराशर होरा शास्त्र के छठे अध्याय में यह स्पष्ट लिखा है। राशि चार्ट का दशम भाव **वादा** दिखाता है; दशमांश बताता है कि वह वादा **निभेगा या नहीं**।',
      'दशमांश में क्या देखा जाता है: **दशम का स्वामी D-10 में कहाँ गया**, वहाँ का **दशम भाव किसका है**, **सूर्य और शनि D-10 में कहाँ हैं**, और कोई ग्रह **वर्गोत्तम** है या नहीं — यानी राशि और दशमांश दोनों में एक ही राशि में। वर्गोत्तम ग्रह अपना फल कहीं अधिक निश्चित रूप से देता है।',
      'व्यवहार में सबसे काम की स्थिति वह होती है जहाँ **दोनों आपस में सहमत न हों** — राशि में प्रबल सरकारी योग, पर दशमांश में दशमेश पीड़ित। ऐसे चार्ट में अक्सर परीक्षा पास होती है पर नियुक्ति में बाधा आती है, या नौकरी मिलती है पर टिकती नहीं। यह बारीकी केवल D-10 देखने से मिलती है, और यही वह चीज़ है जो अधिकतर मुफ्त टूल छोड़ देते हैं।',
    ],
  },
  {
    id: 'chhata-bhav',
    h2: 'छठा भाव — प्रतियोगिता का घर, और UPSC का असली भाव',
    paras: [
      'यह वह हिस्सा है जो सामान्य करियर विश्लेषण में लगभग कभी नहीं आता। छठा भाव **प्रतियोगिता, सेवा, शत्रु और संघर्ष** का भाव है। प्रतियोगी परीक्षा अपने स्वरूप में यही है — लाखों के विरुद्ध एक सीमित संख्या के लिए संघर्ष। इसीलिए UPSC, SSC, बैंकिंग या रेलवे जैसी परीक्षाओं में छठा भाव दशम से भी अधिक निर्णायक हो सकता है।',
      'प्रबल छठा भाव सामान्यतः अशुभ माना जाता है — पर प्रतियोगिता के संदर्भ में यह उल्टा काम करता है। **छठे का बलवान स्वामी** का अर्थ है कि व्यक्ति संघर्ष में टिकता है, प्रतिद्वंद्वियों से आगे निकलता है, और लंबी तैयारी की थकान झेल लेता है। यही कारण है कि कई सफल अभ्यर्थियों की कुंडली में छठा भाव सक्रिय मिलता है।',
      'साथ में देखने की बात: **छठा और दशम दोनों सक्रिय** हों तो प्रतियोगिता के रास्ते से पद मिलने का शास्त्रीय संकेत माना जाता है। केवल दशम सक्रिय हो तो पद मिलता है पर प्रायः नियुक्ति या पदोन्नति से, परीक्षा से नहीं। पूरा विश्लेषण [परीक्षा और सरकारी नौकरी के योग](/blog/exam-government-job-yogas-astrology-hindi) में है।',
    ],
  },
  {
    id: 'surya-karaka',
    h2: 'सूर्य — सत्ता, पद और सरकारी पहचान का कारक',
    paras: [
      'सूर्य राज्य का कारक है — शासन, अधिकार, पद और सार्वजनिक सम्मान। सरकारी सेवा के प्रश्न में सूर्य की भूमिका सीधी है: **सरकार स्वयं सूर्य है।** इसलिए सूर्य का बल, उसकी स्थिति और उसकी दशा तीनों इस गणना में भारी वज़न रखते हैं।',
      'क्या देखा जाता है: **सूर्य की षड्बल** — उसका अपना शास्त्रीय न्यूनतम पार हुआ या नहीं; **सूर्य किस भाव में है** — दशम में हो तो दिग्बल मिलता है, जो सबसे अनुकूल स्थितियों में गिना जाता है; और **सूर्य किन ग्रहों के साथ है** — शनि के साथ हो तो अर्थ जटिल हो जाता है, क्योंकि दोनों शास्त्रीय शत्रु हैं और यह संयोग अधिकारियों के साथ टकराव का संकेत भी देता है।',
      'एक व्यावहारिक बात: **अस्त सूर्य नहीं होता** — सूर्य स्वयं अस्त नहीं होता, वह दूसरों को अस्त करता है। पर सूर्य **नीच** (तुला राशि में) हो सकता है, और वहाँ पद तो मिलता है पर पहचान देर से आती है। सूर्य से बनने वाले राजयोग [सूर्य राजयोग और सरकारी नौकरी](/learn/sun-surya-raj-yoga-government-job) में अलग से खोले गए हैं।',
    ],
  },
  {
    id: 'shani-karaka',
    h2: 'शनि — सेवा, अनुशासन और नौकरी देने वाला ग्रह',
    paras: [
      'शनि **सेवा** का कारक है — और "नौकरी" शब्द का शास्त्रीय अर्थ यही है: किसी के अधीन रहकर किया गया कार्य। इसीलिए व्यापार गुरु और बुध का विषय है, और नौकरी शनि का। सरकारी नौकरी में शनि की भूमिका दोहरी हो जाती है, क्योंकि वह सेवा भी है और दीर्घकालिक अनुशासन भी — दोनों शनि के अपने क्षेत्र हैं।',
      'शनि की सबसे उपयोगी विशेषता उसकी **दृष्टि** है। शनि तीसरे, सातवें और दसवें भाव पर पूर्ण दृष्टि डालता है, इसलिए वह तीन अलग स्थितियों से दशम भाव को देख सकता है — चतुर्थ, अष्टम और लग्न से। यही कारण है कि दशम पर शनि की दृष्टि अकेले कोई दुर्लभ बात नहीं, और इसीलिए यह कैलकुलेटर दृष्टि को **विरुपा में** नापता है, केवल गिनता नहीं।',
      'और वह बात जो लोग सुनना नहीं चाहते: **शनि देर करता है, मना नहीं करता।** प्रबल शनि वाली कुंडली में सरकारी नौकरी अक्सर आती है, पर अपेक्षा से बाद में — और यह देरी स्वयं शनि का फल है, असफलता नहीं। [शनि और सरकारी नौकरी](/learn/saturn-shani-government-job-astrology) में यह विस्तार से है, और यदि इस समय दशा चल रही हो तो [शनि महादशा में नौकरी क्यों नहीं मिलती](/blog/shani-mahadasha-mein-job-kyon-nahi-milti) अधिक काम का पेज है।',
    ],
  },
  {
    id: 'amatyakaraka',
    h2: 'अमात्यकारक — जैमिनी पद्धति का करियर कारक',
    paras: [
      'यह पराशर पद्धति से **स्वतंत्र** संकेत है, और इसीलिए मूल्यवान है। जैमिनी पद्धति में सात ग्रहों को उनकी डिग्री के क्रम में रखा जाता है; सबसे अधिक डिग्री वाला **आत्मकारक** होता है और दूसरे स्थान वाला **अमात्यकारक** — जो करियर और आजीविका का प्रतिनिधि माना जाता है।',
      'अमात्यकारक की स्थिति सीधा संकेत देती है। **छठे भाव में** हो तो यह प्रतियोगी परीक्षा का सबसे विशिष्ट शास्त्रीय संकेत माना जाता है। **दशम में** हो तो पद और सार्वजनिक कार्य। **नवम में** हो तो शिक्षा, न्याय या नीति से जुड़ा कार्य। और कौन सा ग्रह अमात्यकारक बना है, यह भी अर्थ बदलता है — शनि हो तो सेवा, सूर्य हो तो प्रशासन, मंगल हो तो वर्दी और अनुशासन वाला क्षेत्र।',
      'जब **पराशर और जैमिनी दोनों एक ही बात कहें** — यानी दशम भाव भी सरकारी सेवा की ओर इशारा करे और अमात्यकारक भी — तब योग को प्रबल माना जाता है। यह कैलकुलेटर दोनों को अलग-अलग अंक देता है, ठीक इसीलिए कि आपको दिखे कि पुष्टि मिली या नहीं।',
    ],
  },
  {
    id: 'yoga-for-government-job',
    h2: 'Yoga for Government Job in Astrology — the named combinations',
    paras: [
      'Several classical yogas are quoted for government service, and it is worth knowing which are genuinely specific and which are general prosperity yogas being applied loosely. The genuinely relevant ones fall into three families.',
      '**Raja yogas** proper — formed when a lord of a kendra (1, 4, 7, 10) and a lord of a trikona (1, 5, 9) associate. These indicate rise in status rather than government service specifically, and are widely present in charts that never see a government job. **Sun-Saturn based combinations** — the state karaka with the service karaka, in mutual aspect, exchange or conjunction. These are the closer fit, because both significators point the same way. **Pancha Mahapurusha yogas**, particularly Shasha (Saturn) and Ruchaka (Mars), which are associated with authority and command.',
      'The trap is treating a yoga as a verdict. Raja yoga appears in a very large share of charts once you count every kendra-trikona relationship, and its presence alone predicts nothing about a competitive exam. What matters is whether the planets forming it are strong enough to deliver — which is what Shadbala measures, and why this calculator prints the ratio instead of the label. Full treatment at [कुंडली में राजयोग कैसे देखें](/blog/kundali-mein-rajyog-kaise-dekhen) and [Raj Yoga](/learn/raj-yoga).',
    ],
  },
  {
    id: 'mahapurusha',
    h2: 'पंच महापुरुष योग — रुचक, भद्र, हंस, मालव्य और शश',
    paras: [
      'ये पाँच योग तब बनते हैं जब मंगल, बुध, गुरु, शुक्र या शनि अपनी **स्वराशि या उच्च राशि** में हों **और साथ ही केंद्र भाव** (1, 4, 7, 10) में हों। दोनों शर्तें एक साथ पूरी होनी चाहिए — केवल उच्च का ग्रह पर्याप्त नहीं।',
      'सरकारी सेवा के संदर्भ में दो सबसे प्रासंगिक हैं। **शश योग** (शनि) — सेवा, अनुशासन, दीर्घ पद और प्रशासनिक क्षमता से जोड़ा जाता है। **रुचक योग** (मंगल) — आदेश, वर्दी, साहस और सुरक्षा सेवाओं से। **भद्र योग** (बुध) लेखन, विश्लेषण और नीति की ओर झुकता है, जो लिखित परीक्षा में सहायक माना जाता है। **हंस** (गुरु) शिक्षा और न्याय की ओर, **मालव्य** (शुक्र) कला, राजनयिक और सुख-सुविधा वाले क्षेत्रों की ओर।',
      'ईमानदार सीमा: महापुरुष योग दुर्लभ नहीं है। पाँच ग्रह, प्रत्येक के लिए दो-तीन अनुकूल राशियाँ और चार केंद्र — गणित से ही यह एक बड़े हिस्से की कुंडलियों में मिल जाता है। इसीलिए इस कैलकुलेटर में इसका भार सबसे कम रखा गया है। विस्तार से [रुचक और भद्रादित्य योग](/blog/ruchaka-budhaditya-yoga-career-astrology-hindi) में।',
    ],
  },
  {
    id: 'neech-bhang-vipreet',
    h2: 'नीच भंग और विपरीत राजयोग — कमज़ोर स्थिति से बड़ा पद',
    paras: [
      'ये दोनों योग इसलिए महत्वपूर्ण हैं कि ये उन कुंडलियों में पद देते हैं जो पहली नज़र में कमज़ोर दिखती हैं — और प्रतियोगी परीक्षा के अभ्यर्थियों में यह स्थिति असामान्य नहीं है।',
      '**नीच भंग राजयोग** तब बनता है जब कोई ग्रह नीच राशि में हो पर उसका नीच-भंग हो जाए — जैसे उस राशि का स्वामी केंद्र में हो, या नीच ग्रह स्वयं केंद्र में हो। शास्त्र कहता है कि ऐसा व्यक्ति नीचे से उठकर ऊँचा पद पाता है, और यह चढ़ाई स्वयं उसकी पहचान बन जाती है। विवरण [नीच भंग राजयोग](/learn/neech-bhang-raj-yoga) में।',
      '**विपरीत राजयोग** छठे, आठवें और बारहवें — दुःस्थान कहे जाने वाले भावों — के स्वामियों के आपसी संबंध से बनता है। इसका शास्त्रीय अर्थ है कि कठिनाई ही उन्नति का माध्यम बनती है। प्रतियोगी परीक्षा के संदर्भ में यह विशेष रूप से प्रासंगिक है, क्योंकि छठा भाव स्वयं प्रतियोगिता का घर है। पूरा विश्लेषण [विपरीत राजयोग](/learn/vipreet-raj-yoga) में है।',
    ],
  },
  {
    id: 'will-i-clear-upsc',
    h2: 'Will I Clear UPSC? — what astrology can and cannot answer',
    paras: [
      'The honest answer, and it goes against this page\'s commercial interest: **no chart can tell you whether you will clear an examination.** UPSC outcomes are decided by syllabus coverage, answer-writing practice, optional subject choice, current-affairs discipline and the number of attempts left. None of those are astrological variables.',
      'What a chart can legitimately say is narrower and still useful. It can indicate whether the classical **combinations for government service are present and strong**. It can indicate whether the **running Dasha supports** effort in this direction now or in a later window. And it can indicate **where the resistance sits** — an afflicted 6th lord reads differently from a weak Dasamsa, and the remedy and the study strategy differ accordingly.',
      'The correct use of this score is therefore as a **planning input, not a verdict**. A strong score is a reason to commit fully to the attempt in the current window. A weak score is a reason to look harder at what the blockers section names, not a reason to stop preparing. Anyone who tells you the chart guarantees selection is selling you something. Longer discussion at [Will I clear UPSC — astrology](/blog/will-i-clear-upsc-astrology).',
    ],
  },
  {
    id: 'timing-of-government-job',
    h2: 'Timing of Government Job in Astrology — the Dasha half',
    paras: [
      'Yog and timing are two separate questions, and confusing them is the single most common error people make with this subject. **Yog asks whether**; **Dasha asks when.** A chart can carry very strong government-service combinations and still see nothing happen for a decade, simply because no relevant period is running.',
      'The periods that count are the Mahadasha and Antardasha of: the **10th lord**, the **6th lord**, **Saturn**, **Sun**, and any planet placed in or aspecting the 10th house with real strength. When two of these overlap — say a Saturn Mahadasha running a 10th-lord Antardasha — that is the classical window, and it is the one worth planning attempts around.',
      'A practical note on reading the result: the timing block gives windows, not dates. Vimshottari periods run for years, and an Antardasha for months. What the chart marks is a season of favourable conditions, not an appointment letter with a date on it. The mechanics are set out at [Government Job Dasha Timing](/learn/government-job-dasha-timing) and, for the exam-year question specifically, [Best year and Dasha for exam success](/blog/best-year-dasha-exam-success-astrology).',
    ],
  },
  {
    id: 'career-improve-dasha',
    h2: 'When Will My Career Improve — reading the Dasha honestly',
    paras: [
      'This question usually arrives from a stuck place, so it deserves a careful answer rather than an encouraging one. Career movement in Vedic astrology is read from the **Mahadasha and Antardasha combination**, checked against the Dasamsa, and cross-read with the current transits of Saturn and Jupiter over the 10th house and the Moon sign.',
      'Three patterns show up repeatedly. A **10th-lord period** tends to bring visible change — role, employer or public standing. A **6th-lord period** tends to bring competition and workload, which reads as pressure while it runs and often as advancement afterwards. A **12th-lord or 8th-lord period** tends to bring transition, relocation or a break in continuity — uncomfortable, though not necessarily negative, and often the period in which people change track entirely.',
      'The useful move is to know which of these you are in before you make a decision, because the same action produces different results in different periods. Detailed treatment at [Dasha timing and the career window](/blog/dasha-timing-career-window-skills-astrology) and, if the question is about moving jobs rather than entering service, [Job Change Prediction](/learn/job-change-prediction).',
    ],
  },
  {
    id: 'ias-kundli',
    h2: 'IAS Kundli — किन चार्ट्स में यह योग सबसे साफ़ दिखता है',
    paras: [
      '"IAS कुंडली" कोई एक निश्चित रचना नहीं है, और जो इसे एक साँचे की तरह बेचे वह गलत बेच रहा है। फिर भी शास्त्रीय दृष्टि से कुछ संयोजन बार-बार लौटते हैं, और उन्हें जानना उपयोगी है।',
      'सबसे साफ़ चित्र वहाँ बनता है जहाँ **दशम, छठा और नवम** — तीनों सक्रिय हों: दशम पद देता है, छठा प्रतियोगिता में टिकाता है, और नवम उच्च शिक्षा तथा नीति-समझ देता है। इसके साथ **सूर्य और शनि दोनों बलवान** हों, और **दशमांश में दशमेश पीड़ित न हो**। जहाँ ये चारों बातें एक साथ मिलती हैं, वहाँ योग को प्रबल माना जाता है।',
      'जो नहीं मिलता वह भी बताने योग्य है: कोई एक "IAS ग्रह" नहीं है, कोई एक लग्न नहीं है जो प्रशासनिक सेवा देता हो, और कोई ऐसी डिग्री-संख्या नहीं है जिससे रैंक निकाली जा सके। यदि किसी वेबसाइट पर ऐसा दावा दिखे तो वह अनुमान है, गणना नहीं। [IAS भविष्यवाणी ज्योतिष](/blog/ias-prediction-astrology-hindi) में यह विषय पूरा खोला गया है।',
    ],
  },
  {
    id: 'kundli-of-ias-officers',
    h2: 'Kundli of IAS Officers — is there a shared pattern?',
    paras: [
      'People search for this expecting a template, and the honest answer has two halves. **There is no single shared chart.** Officers selected in the same year, to the same service, have charts with different ascendants, different 10th lords and different running periods. Anyone presenting one layout as "the IAS chart" is generalising from a handful of examples.',
      'What does recur, at the level of tendency rather than rule, is **convergence across independent methods** — the Parashari 10th house and the Jaimini Amatyakaraka pointing the same way, with the Dasamsa agreeing. That is a structural observation about how strong yogas work, not a template you can match your chart against.',
      'There is also a selection problem worth naming. Charts of successful officers are the ones that get published and analysed; charts of equally qualified candidates who did not clear are not. Any pattern derived only from the first group will look far more predictive than it is. This is why this calculator scores independent classical rules rather than pattern-matching against famous charts.',
    ],
  },
  {
    id: 'ias-ips-ifs',
    h2: 'IAS, IPS या IFS — क्या कुंडली सेवा बता सकती है?',
    paras: [
      'सीधा उत्तर: **सेवा का नाम नहीं।** भारत में सेवा-आवंटन परीक्षा की रैंक और अभ्यर्थी की वरीयता से तय होता है — यह प्रशासनिक प्रक्रिया है, ज्योतिषीय नहीं। जो कुंडली से "आपको IPS मिलेगा" बता दे, वह अनुमान बेच रहा है।',
      'जो वास्तव में निकल सकता है वह **प्रवृत्ति** है, और वह भी सामान्य स्तर पर। **मंगल और शनि का प्रभुत्व** वर्दी, अनुशासन और क्षेत्र-कार्य वाली सेवाओं की ओर झुकता है। **गुरु और बुध का प्रभुत्व** नीति, प्रशासन, लेखन और विश्लेषण की ओर। **शुक्र और बुध** के साथ नवम-बारहवें की सक्रियता विदेश सेवा की ओर संकेत करती है। **गुरु और न्याय भाव** की प्रबलता न्यायिक सेवा की ओर।',
      'इस अंतर को समझना व्यावहारिक रूप से उपयोगी है — वैकल्पिक विषय चुनते समय, या यह तय करते समय कि किस परीक्षा पर ऊर्जा लगाई जाए। पर यह वरीयता-सूची भरने का आधार नहीं है। अलग-अलग सेवाओं का विश्लेषण [IPS भविष्यवाणी](/blog/ips-prediction-astrology-hindi), [न्यायिक सेवा और करियर](/blog/judiciary-career-astrology-hindi) और [रक्षा सेवा ज्योतिष](/blog/defence-career-astrology-hindi) में है।',
    ],
  },
  {
    id: 'ssc-railway-banking',
    h2: 'SSC, Railway, Police और Banking — अलग परीक्षा, अलग ग्रह',
    paras: [
      'सभी सरकारी परीक्षाएँ एक जैसी नहीं पढ़ी जातीं, और यही वह जगह है जहाँ सामान्य "सरकारी नौकरी" विश्लेषण कम पड़ जाता है। मूल ढाँचा — दशम, छठा, सूर्य, शनि — सबके लिए एक ही है, पर ज़ोर अलग-अलग जगह पड़ता है।',
      '**SSC और लिपिकीय सेवाएँ** — बुध की भूमिका बढ़ जाती है, क्योंकि गति, गणना और लिखित सटीकता बुध का क्षेत्र है। **रेलवे** — शनि और मंगल, क्योंकि यह तकनीकी, क्षेत्रीय और अनुशासित सेवा है। **पुलिस और अर्धसैनिक** — मंगल प्रमुख, शनि सहायक। **बैंकिंग और PSU** — बुध और शुक्र, क्योंकि यह वित्त, लेन-देन और सेवा-क्षेत्र है; यहाँ द्वितीय और एकादश भाव भी देखे जाते हैं। **शिक्षण और प्राध्यापन** — गुरु, पंचम भाव के साथ।',
      'व्यावहारिक उपयोग: यदि स्कोर मध्यम आया है पर किसी एक ग्रह का बल स्पष्ट रूप से अधिक है, तो उसी दिशा की परीक्षा में प्रयास अधिक अनुकूल माना जाता है। विस्तार से [SSC, रेलवे और पुलिस नौकरी ज्योतिष](/learn/ssc-railway-police-job-astrology), [बैंकिंग और PSU](/learn/banking-psu-job-astrology) तथा [चिकित्सा क्षेत्र की सरकारी नौकरियाँ](/blog/medical-government-jobs-astrology-hindi) में।',
    ],
  },
  {
    id: 'engineering-teaching',
    h2: 'इंजीनियरिंग, चिकित्सा और शिक्षण — तकनीकी सरकारी पद',
    paras: [
      'सरकारी नौकरी केवल प्रशासनिक सेवा नहीं है, और खोज के आँकड़े बताते हैं कि बहुत से लोग तकनीकी पदों के लिए ही यह प्रश्न पूछते हैं। यहाँ दशम भाव के साथ **विषय-कारक ग्रह** देखा जाता है।',
      '**इंजीनियरिंग सेवाएँ** — मंगल तकनीक और निर्माण का कारक है, शनि संरचना और स्थायित्व का; दोनों का दशम या दशमांश से संबंध तकनीकी सरकारी पद की ओर संकेत देता है। **चिकित्सा सेवाएँ** — सूर्य जीवन-शक्ति का, मंगल शल्य का, और छठा भाव रोग तथा उपचार का; इनका मेल सरकारी चिकित्सा सेवा में देखा जाता है। **शिक्षण** — गुरु प्रमुख कारक, पंचम भाव के साथ, और दशम से संबंध।',
      'ध्यान देने की बात: तकनीकी योग्यता और **सरकारी** पद दो अलग संकेत हैं। किसी की कुंडली में प्रबल तकनीकी योग हो सकता है पर सरकारी सेवा का नहीं — ऐसे में निजी क्षेत्र अधिक अनुकूल बैठता है, और यह असफलता नहीं, दिशा का अंतर है। यह तुलना [निजी नौकरी बनाम व्यापार](/learn/private-job-vs-business-prediction) में की गई है।',
    ],
  },
  {
    id: 'check-free',
    h2: 'Check Government Job in My Kundali Free — what is free here',
    paras: [
      'Everything on this page is free, and it is worth being specific about what that includes, because "free" means different things on different sites. You get the **score**, the **breakdown of all seven blocks with the reason for every point**, the **blockers section** naming what is actually weak, the **line of service** the chart leans toward, and the **Dasha timing** windows. No signup, no card, no email gate, no partial result held back behind a payment.',
      'What is deliberately not done here matters too. There is no countdown, no "your chart has a serious dosha" alarm, and no urgency device of any kind. If the yog is weak the result says it is weak, because that is the truth and because that information is what saves you money.',
      'The paid reading is a genuinely different product rather than the same output unlocked. It reads the whole chart across career, money, marriage and health together, with timing and remedies — the questions a single-yog calculator cannot answer no matter how detailed it gets.',
    ],
  },
  {
    id: 'kundli-calculator-difference',
    h2: 'Government Job Kundli Calculator — इसमें अलग क्या है',
    paras: [
      'तीन बातें, और तीनों जाँची जा सकती हैं। **पहली — दशमांश (D-10)।** करियर का निर्णय शास्त्र दशमांश से करने को कहता है। अधिकतर मुफ्त टूल केवल राशि चार्ट पढ़ते हैं और दशमांश छोड़ देते हैं, जिससे आधा उत्तर ही बनता है। यहाँ D-10 अलग से अंक पाता है।',
      '**दूसरी — षड्बल का असली अंक।** "शनि मज़बूत है" एक राय है; "शनि की षड्बल 1.41" एक माप है। षड्बल छह अलग मानकों से ग्रह का बल नापती है और उसे उस ग्रह के अपने शास्त्रीय न्यूनतम के विरुद्ध तोलती है। यह कैलकुलेटर वह संख्या दिखाता है, ताकि आप उस पर भरोसा करने से पहले उसे परख सकें।',
      '**तीसरी — दृष्टि विरुपा में।** शास्त्रीय दृष्टि "है या नहीं" नहीं होती; उसकी मात्रा होती है, जो 60 विरुपा पर पूर्ण मानी जाती है। दशम भाव पर शनि की 48 विरुपा दृष्टि और 12 विरुपा दृष्टि का अर्थ एक नहीं है। गणना Swiss Ephemeris और लाहिड़ी अयनांश पर होती है — वही पुस्तकालय जिसे पेशेवर सॉफ़्टवेयर उपयोग करते हैं।',
    ],
  },
  {
    id: 'career-prediction-dob',
    h2: 'Career Prediction by Date of Birth — Indian Astrology, Free',
    paras: [
      'This phrasing covers a broader question than government service, and the method differs in one important way. For a **general career direction** reading, the sequence is the 10th house and its lord, the Dasamsa, the strongest planet in the chart by Shadbala, and the Amatyakaraka — because direction follows the chart\'s own dominant significator.',
      'For a **government service** reading, the 6th house enters and carries real weight, and the Sun-Saturn pair is read as a unit rather than as two separate planets. That is the difference between this page and a general career report, and it is why the two give different answers from the same chart.',
      'If your question is really "what work suits me" rather than "will I get a government job", the better starting points are [Best career from your birth chart](/learn/best-career-birth-chart) and [Career Prediction Astrology](/learn/career-prediction-astrology). If it is about growth in a job you already have, [Promotion Prediction](/learn/promotion-prediction-astrology) and [Career Growth Prediction](/learn/career-growth-prediction) are closer to the mark.',
    ],
  },
  {
    id: 'vs-other-tools',
    h2: 'Prokerala, AstroSage और दूसरे टूल से फर्क — ईमानदार तुलना',
    paras: [
      'यह प्रश्न खोज में लगातार आता है, इसलिए सीधा उत्तर देना उचित है — और उसमें वह भी शामिल है जो हमारे पक्ष में नहीं जाता।',
      'बड़ी साइटों के पास **अधिक टूल, अधिक भाषाएँ और अधिक वर्षों का डोमेन अधिकार** है। उनकी गणना का आधार भी प्रायः वही स्विस एफेमेरिस है, इसलिए ग्रहों की स्थिति में अंतर नहीं मिलेगा — और यदि किसी टूल में ग्रह की राशि अलग आ रही हो तो वह अयनांश का अंतर है, किसी की गलती नहीं।',
      'अंतर **व्याख्या और पारदर्शिता** में है। अधिकतर मुफ्त टूल एक अंक या एक वाक्य देते हैं। यह पेज हर अंक के साथ उसका नियम, उसका ग्रह और उसकी वास्तविक संख्या दिखाता है, ताकि आप उसे अपनी कुंडली से मिला सकें — और असहमत भी हो सकें। यही एकमात्र दावा है जो हम करते हैं; बाकी तुलना आप स्वयं कर लीजिए।',
    ],
  },
  {
    id: 'celebrity-astrologer',
    h2: 'Who Is Mukesh Ambani\'s Astrologer — and why people search this',
    paras: [
      'Google surfaces this question inside this cluster, which tells you something real: people looking for a government-job reading are also asking who advises the powerful. The assumption underneath is that there exists a superior astrologer whose access produces superior outcomes.',
      'The factual position is short. **The private advisers of business families are not publicly documented**, claims made about them are generally unverified, and this page is not going to repeat gossip as fact. More usefully: the classical method is not secret. Brihat Parashara Hora Shastra, Jaimini Sutras and Phaladeepika are published texts. There is no hidden calculation available only to the wealthy — Shadbala is arithmetic, and the Dasamsa is a division of the chart anyone can compute.',
      'What money does buy is **attention** — hours spent on one chart instead of minutes, and follow-up over years. That is a real difference and worth being honest about. It is not a different astrology. If what you actually want is a chart read carefully by a person rather than scored by a page, that is what the paid reading is, and it is priced so it is not reserved for people like the person in the question.',
    ],
  },
  {
    id: 'score-kam-aaya',
    h2: 'स्कोर कम आया — अब क्या करें',
    paras: [
      'पहली बात, जो शांति से कह देनी चाहिए: **कम स्कोर का अर्थ "सरकारी नौकरी नहीं मिलेगी" नहीं है।** इसका अर्थ इतना है कि इस विशेष दिशा के शास्त्रीय योग आपकी कुंडली में उतने प्रबल नहीं हैं, और इसीलिए परिश्रम का अनुपात अधिक रहेगा।',
      'दूसरी बात, जो व्यावहारिक है: परिणाम में **"क्या रोक रहा है"** खंड पढ़िए। वह नाम लेकर बताता है कि बाधा कहाँ है — दशमेश कमज़ोर है, या छठा भाव निष्क्रिय, या दशमांश में पुष्टि नहीं मिल रही, या दशा अभी अनुकूल नहीं। ये चार बिल्कुल अलग स्थितियाँ हैं और इनके उपाय भी अलग हैं। सामान्य सलाह यहाँ बेकार है।',
      'तीसरी बात: यदि बाधा **दशा** है, तो यह सबसे अच्छी खबर है जो इस पेज पर मिल सकती है — क्योंकि दशा बदलती है। ऐसे में प्रश्न "मिलेगी या नहीं" से बदलकर "कब" हो जाता है, और वह [सरकारी नौकरी की दशा टाइमिंग](/learn/government-job-dasha-timing) का विषय है। और यदि आप पहले प्रयास में असफल हुए हैं, तो [परीक्षा में असफलता और दोबारा प्रयास का समय](/blog/exam-failure-retry-timing-astrology-hindi) अधिक काम का पेज है।',
    ],
  },
  {
    id: 'score-achha-aaya',
    h2: 'स्कोर अच्छा आया — पर परीक्षा फिर भी परिश्रम माँगती है',
    paras: [
      'प्रबल योग का अर्थ है कि परिस्थितियाँ अनुकूल हैं — पाठ्यक्रम अपने आप पूरा नहीं होगा। यह वाक्य विज्ञापन के लिए ठीक नहीं है, पर सच है, और इस पेज पर सच पहले आता है।',
      'प्रबल योग व्यवहार में क्या करता है: वह **अवसर बनाता है** — सही समय पर अधिसूचना दिखना, तैयारी के लिए परिस्थितियाँ बनना, साक्षात्कार में अनुकूलता। वह जो नहीं करता वह है उत्तर लिखना। शास्त्रीय दृष्टि भी यही कहती है — योग फल की **सम्भावना** देता है, फल स्वयं कर्म से आता है।',
      'इस स्थिति में सबसे उपयोगी काम है **दशा विंडो देखना** और प्रयास उसी के आसपास केंद्रित करना — विशेषकर तब जब प्रयास सीमित बचे हों। परिणाम में वह विंडो दी गई है। साथ में [लिखित बनाम साक्षात्कार](/blog/interview-vs-written-exam-success-astrology-hindi) देखिए, क्योंकि दोनों चरणों के ग्रह अलग हैं।',
    ],
  },
  {
    id: 'exam-failure',
    h2: 'परीक्षा में असफलता — और दोबारा प्रयास का सही समय',
    paras: [
      'यह खंड इसलिए है क्योंकि इस पेज पर आने वाले बहुत से लोग पहला या दूसरा प्रयास दे चुके होते हैं, और प्रश्न "योग है क्या" नहीं बल्कि "फिर से करूँ या छोड़ दूँ" होता है।',
      'ज्योतिषीय दृष्टि से देखने की तीन बातें हैं। **चल रही दशा** — यदि पिछला प्रयास प्रतिकूल दशा में हुआ था तो परिणाम को क्षमता का माप मानना गलत होगा। **शनि और गुरु का गोचर** — दशम भाव और चंद्र राशि पर इनकी स्थिति प्रयास-वर्ष की अनुकूलता बताती है। **छठे भाव की सक्रियता** — प्रतियोगिता में टिकने की क्षमता यहीं से पढ़ी जाती है।',
      'और वह बात जो ज्योतिष के दायरे से बाहर है पर कही जानी चाहिए: प्रयासों की संख्या, आयु सीमा और आर्थिक स्थिति वास्तविक बाधाएँ हैं, और इनका उत्तर कुंडली में नहीं है। कुंडली यह बता सकती है कि आने वाला वर्ष अनुकूल है या नहीं; यह तय करना कि उस वर्ष को दिया जाए या नहीं, आपका निर्णय है। विस्तार से [परीक्षा असफलता और दोबारा प्रयास](/blog/exam-failure-retry-timing-astrology-hindi) में।',
    ],
  },
  {
    id: 'interview-vs-written',
    h2: 'साक्षात्कार बनाम लिखित परीक्षा — दोनों के ग्रह अलग हैं',
    paras: [
      'यह भेद व्यावहारिक रूप से बहुत उपयोगी है और लगभग कहीं नहीं मिलता। लिखित परीक्षा और साक्षात्कार दो अलग योग्यताएँ माँगते हैं, और शास्त्र में इनके कारक भी अलग हैं।',
      '**लिखित परीक्षा** — बुध प्रमुख है: गति, स्मृति, गणना और लिखित अभिव्यक्ति। पंचम भाव बुद्धि और परीक्षा-क्षमता का, और गुरु गहराई तथा विषय-समझ का। जिन कुंडलियों में बुध और पंचम बलवान हों पर सूर्य-शुक्र कमज़ोर हों, वहाँ प्रायः लिखित अच्छा जाता है और साक्षात्कार कमज़ोर रह जाता है।',
      '**साक्षात्कार** — सूर्य प्रमुख है, क्योंकि यह उपस्थिति, आत्मविश्वास और अधिकार-सम्मुख व्यवहार का कारक है; शुक्र संवाद-शैली और प्रभाव का; और लग्न तथा उसका स्वामी समग्र व्यक्तित्व का। यदि यह भेद पहले पता हो तो तैयारी का संतुलन बदला जा सकता है — और यही इस विश्लेषण का असली उपयोग है। पूरा विवरण [साक्षात्कार बनाम लिखित परीक्षा](/blog/interview-vs-written-exam-success-astrology-hindi) में।',
    ],
  },
  {
    id: 'rank-prediction',
    h2: 'रैंक की भविष्यवाणी — यह क्यों नहीं की जा सकती',
    paras: [
      'यह प्रश्न भी पूछा जाता है, और उत्तर स्पष्ट होना चाहिए: **कुंडली से परीक्षा की रैंक नहीं निकाली जा सकती।** रैंक एक सापेक्ष संख्या है — वह इस बात पर निर्भर करती है कि उस वर्ष कितने लोग बैठे, पेपर कितना कठिन था, और सामान्यीकरण कैसे हुआ। इनमें से कोई भी ज्योतिषीय चर नहीं है।',
      'जो निकाला जा सकता है वह **योग की प्रबलता और दशा की अनुकूलता** है, और ये दोनों श्रेणी में बताए जाते हैं — प्रबल, मध्यम, कमज़ोर — संख्या में नहीं। यदि कोई साइट "आपकी रैंक 340 के आसपास रहेगी" जैसा कुछ कहे, तो वह गणना नहीं, अनुमान है, और उसका कोई शास्त्रीय आधार नहीं।',
      'इस सीमा को स्वीकार कर लेने से विश्लेषण अधिक उपयोगी हो जाता है, कम नहीं — क्योंकि तब ध्यान उस पर जाता है जो वास्तव में बदला जा सकता है: प्रयास का वर्ष, परीक्षा का चुनाव, और तैयारी का संतुलन। इस विषय पर [प्रतियोगी परीक्षा में रैंक की भविष्यवाणी](/blog/rank-prediction-competitive-exam-astrology-hindi) अलग से लिखा गया है।',
    ],
  },
  {
    id: 'shani-mahadasha-job',
    h2: 'शनि महादशा में नौकरी क्यों नहीं मिलती',
    paras: [
      'यह शिकायत इतनी सामान्य है कि इसका अलग उत्तर बनता है। शनि महादशा उन्नीस वर्ष चलती है — किसी के जीवन का बड़ा हिस्सा — और उसमें नौकरी का प्रश्न बार-बार उठता है।',
      'शास्त्रीय स्थिति दो-तरफ़ा है। शनि **सेवा और नौकरी का कारक** है, इसलिए उसकी दशा में नौकरी मिलना स्वाभाविक भी है — विशेषकर सरकारी। पर शनि **विलंब का कारक** भी है, इसलिए वही दशा प्रतीक्षा लंबी कर देती है। कौन सा पक्ष सामने आएगा, यह शनि की अपनी षड्बल, उसकी भाव-स्थिति और चल रही अंतर्दशा से तय होता है — यही वजह है कि यह कैलकुलेटर शनि का बल संख्या में दिखाता है।',
      'व्यावहारिक बात: शनि महादशा में **धीरे और स्थायी** काम करने वाला रास्ता अनुकूल माना जाता है, तेज़ और अनिश्चित रास्ता नहीं। यह वही तर्क है जिससे शनि की दशा सरकारी सेवा के लिए अक्सर अनुकूल मानी जाती है, भले ही निजी क्षेत्र में उसी अवधि में ठहराव दिखे। विस्तार से [शनि महादशा में नौकरी क्यों नहीं मिलती](/blog/shani-mahadasha-mein-job-kyon-nahi-milti) और [शनि महादशा गाइड](/blog/shani-mahadasha-effects-guide) में।',
    ],
  },
  {
    id: 'sade-sati-career',
    h2: 'साढ़े साती के दौरान सरकारी नौकरी — क्या यह बाधा है',
    paras: [
      'साढ़े साती इस विषय में सबसे अधिक डर पैदा करने वाला शब्द है, और उसी अनुपात में सबसे अधिक गलत समझा गया।',
      'तथ्य यह है कि साढ़े साती **शनि का गोचर** है — जन्म चंद्र राशि से बारहवीं, प्रथम और द्वितीय राशि पर, कुल लगभग साढ़े सात वर्ष। यह जन्म-कुंडली के योग को नष्ट नहीं करती। यदि दशम भाव प्रबल है और अनुकूल दशा चल रही है, तो साढ़े साती के दौरान भी नियुक्ति होती है — और होती रही है।',
      'जो साढ़े साती वास्तव में करती है वह है **श्रम और धैर्य की माँग बढ़ाना**। परिश्रम अधिक लगता है, परिणाम देर से आता है, और मानसिक थकान अधिक होती है — जो लंबी परीक्षा तैयारी में सबसे कठिन हिस्सा है। यह असफलता का संकेत नहीं, कठिनाई का संकेत है। अपनी स्थिति देखनी हो तो [साढ़े साती कैलकुलेटर](/calculators/free-sade-sati-calculator) मुफ़्त है, और करियर पर इसका प्रभाव [साढ़े साती — करियर, पैसा, स्वास्थ्य](/blog/sade-sati-career-money-health-marriage-hindi) में खोला गया है। ढैया से अंतर [साढ़े साती बनाम ढैया](/blog/sade-sati-vs-dhaiyya-shani-hindi) में है।',
    ],
  },
  {
    id: 'dosh-aur-career',
    h2: 'पितृ दोष और काल सर्प — क्या ये सरकारी नौकरी रोकते हैं',
    paras: [
      'यह प्रश्न प्रायः तब आता है जब कोई बताता है कि "आपकी कुंडली में दोष है, इसीलिए नौकरी नहीं लग रही"। इसका उत्तर संतुलित होना चाहिए, क्योंकि यहाँ डर बेचा भी जाता है और सच्ची बात भी है।',
      '**पितृ दोष** पूर्वजों से जुड़े ऋण का संकेत माना जाता है और सूर्य से इसका सीधा संबंध होने के कारण करियर तथा पिता-पक्ष से जुड़े प्रश्नों में इसकी चर्चा होती है। **काल सर्प** राहु-केतु के बीच सभी ग्रहों के आ जाने से बनता है और इसका असर प्रयास में रुकावट के रूप में बताया जाता है।',
      'संतुलित स्थिति यह है: ये संकेत बाधा की **मात्रा** बढ़ा सकते हैं, पर ये किसी योग को रद्द नहीं करते, और अकेले किसी की नौकरी नहीं रोकते। जो व्यक्ति दोष के नाम पर हज़ारों रुपये की पूजा माँगे, वह डर बेच रहा है। अपनी स्थिति स्वयं जाँचनी हो तो [पितृ दोष कैलकुलेटर](/calculators/free-pitra-dosh-calculator) और [काल सर्प दोष कैलकुलेटर](/calculators/free-kaal-sarp-dosh-calculator) दोनों मुफ़्त हैं, और करियर-विशेष प्रभाव [पितृ दोष, करियर और पैसा](/blog/pitra-dosh-career-money-hindi) तथा [काल सर्प दोष और करियर](/blog/kaal-sarp-dosh-career-business-hindi) में है।',
    ],
  },
  {
    id: 'boss-conflict',
    h2: 'सूर्य-शनि की युति — अधिकारियों से टकराव का योग',
    paras: [
      'यह खंड सरकारी सेवा में **प्रवेश के बाद** के प्रश्न के लिए है, और यह प्रश्न इस पेज पर आने वालों के लिए जल्दी ही प्रासंगिक हो जाता है।',
      'सूर्य और शनि शास्त्रीय शत्रु हैं — सूर्य अधिकार है, शनि अधीनता। जब दोनों एक भाव में हों, एक-दूसरे को देखें, या राशि परिवर्तन करें, तो शास्त्र इसे **वरिष्ठों के साथ तनाव** का संकेत मानता है। सरकारी सेवा में, जहाँ पदानुक्रम ही व्यवस्था है, यह योग विशेष रूप से महसूस होता है।',
      'इसका अर्थ यह नहीं कि नौकरी नहीं मिलेगी — प्रायः मिल जाती है, और यह योग स्वतंत्र निर्णय-क्षमता भी देता है। अर्थ यह है कि **स्थानांतरण, पदोन्नति में देरी और वरिष्ठों से मतभेद** इस व्यक्ति के करियर में बार-बार लौट सकते हैं। पहले से जान लेना उपयोगी है। विस्तार से [सूर्य-शनि विरोध और बॉस से टकराव](/blog/sun-saturn-opposition-boss-conflict-astrology-hindi) में।',
    ],
  },
  {
    id: 'vedic-career-order',
    h2: 'Vedic Career Astrology — the order in which a chart is actually read',
    paras: [
      'For anyone who wants to follow the method rather than just take the score, this is the sequence a careful reading uses, and the order is not arbitrary — each step constrains the next.',
      '**One:** the Rasi chart — the 10th house, its lord, the planets in it and the aspects on it. **Two:** the Dasamsa (D-10) — does it confirm the Rasi or contradict it. **Three:** Shadbala for all seven planets — can the significators actually deliver. **Four:** the Jaimini layer — Atmakaraka and Amatyakaraka, as an independent check. **Five:** Vimshottari Dasha — when. **Six:** current transits of Saturn and Jupiter over the 10th and the Moon sign — the near-term weather.',
      'Most free tools stop at step one, and a few reach step five. The value of steps two, three and four is that they catch the charts where step one looks strong and is not — which is exactly the case that costs people years. The full walkthrough is at [Career prediction from your Kundli — complete guide](/blog/career-prediction-kundli-complete-guide) and, in Hindi, [करियर भविष्यवाणी — पूरी गाइड](/blog/career-prediction-kundli-complete-guide-hindi).',
    ],
  },
  {
    id: 'janm-samay',
    h2: 'जन्म समय क्यों सबसे ज़रूरी है — और न पता हो तो क्या करें',
    paras: [
      'इस पूरे विश्लेषण में सबसे कमज़ोर कड़ी प्रायः जन्म समय होती है, इसलिए यह बात अलग से कही जानी चाहिए।',
      '**लग्न लगभग हर दो घंटे में बदलता है**, और लग्न बदलते ही सभी बारह भाव घूम जाते हैं — दशम भी, छठा भी। पंद्रह मिनट की गलती दशम भाव का स्वामी बदल सकती है, और उसके साथ पूरा उत्तर। दशमांश और भी संवेदनशील है, क्योंकि वह राशि को दस भागों में बाँटता है — वहाँ कुछ मिनटों का अंतर भी स्थिति बदल देता है।',
      'यदि समय ज्ञात न हो: **जन्म प्रमाणपत्र या अस्पताल का रिकॉर्ड** सबसे विश्वसनीय है, घर की स्मृति नहीं — क्योंकि याद रखा गया समय प्रायः निकटतम आधे घंटे पर गोल कर दिया जाता है। समय बिल्कुल न मिले तो 12:00 माना जाता है; ऐसी स्थिति में **चंद्र राशि, नक्षत्र और ग्रहों की राशियाँ फिर भी सही रहती हैं**, पर भाव-आधारित आधा विश्लेषण अनुमान बन जाता है। ऐसे परिणाम को दिशा-सूचक मानिए, निर्णय नहीं।',
    ],
  },
  {
    id: 'ab-kya-karein',
    h2: 'अगला कदम — इस स्कोर के बाद क्या पढ़ें',
    paras: [
      'यदि स्कोर **प्रबल** आया है और दशा भी अनुकूल है, तो अगला उपयोगी पेज [सरकारी नौकरी की दशा टाइमिंग](/learn/government-job-dasha-timing) है — क्योंकि अब प्रश्न "कब" है।',
      'यदि स्कोर **कमज़ोर** आया है, तो पहले "क्या रोक रहा है" पढ़िए, फिर उसी बाधा वाला पेज: दशमेश के लिए [दशम भाव और सरकारी नौकरी](/learn/10th-house-government-job-astrology), शनि के लिए [शनि और सरकारी नौकरी](/learn/saturn-shani-government-job-astrology), और सामान्य दिशा के लिए [Government Job & UPSC Astrology](/learn/government-job-chances)।',
      'और यदि प्रश्न सरकारी सेवा से हटकर **समग्र करियर** का है — कौन सा काम अनुकूल है, नौकरी बदलनी चाहिए या नहीं, विदेश में अवसर है या नहीं — तो [UPSC Success Prediction](/learn/upsc-success-prediction), [Job Change Prediction](/learn/job-change-prediction) और [Foreign Job Prediction](/learn/foreign-job-prediction) अधिक काम के हैं। विदेश में बसने का प्रश्न अलग है और उसके लिए [विदेश बसना कैलकुलेटर](/calculators/free-foreign-settlement-calculator) मुफ़्त है।',
    ],
  },
];

type IasLink = { href: string; label: string; note: string };

const HUB_HI: IasLink[] = [
  { href: '/blog/ias-prediction-astrology-hindi', label: 'IAS भविष्यवाणी ज्योतिष', note: 'प्रशासनिक सेवा के योग' },
  { href: '/blog/ips-prediction-astrology-hindi', label: 'IPS भविष्यवाणी ज्योतिष', note: 'मंगल और वर्दी वाली सेवा' },
  { href: '/blog/exam-government-job-yogas-astrology-hindi', label: 'परीक्षा और सरकारी नौकरी के योग', note: 'छठा भाव यहीं समझिए' },
  { href: '/blog/kundali-mein-rajyog-kaise-dekhen', label: 'कुंडली में राजयोग कैसे देखें', note: 'राजयोग का असली अर्थ' },
  { href: '/blog/shani-mahadasha-mein-job-kyon-nahi-milti', label: 'शनि महादशा में नौकरी क्यों नहीं', note: 'सबसे आम शिकायत' },
  { href: '/blog/exam-failure-retry-timing-astrology-hindi', label: 'असफलता और दोबारा प्रयास का समय', note: 'अगला प्रयास कब' },
  { href: '/blog/interview-vs-written-exam-success-astrology-hindi', label: 'साक्षात्कार बनाम लिखित', note: 'दोनों के ग्रह अलग' },
  { href: '/blog/rank-prediction-competitive-exam-astrology-hindi', label: 'रैंक की भविष्यवाणी', note: 'क्यों नहीं हो सकती' },
  { href: '/blog/tenth-lord-career-path-astrology-hindi', label: 'दशमेश और करियर की दिशा', note: 'ग्रह-वार विवरण' },
];

const HUB_EN: IasLink[] = [
  { href: '/learn/government-job-chances', label: 'Government Job & UPSC Astrology', note: 'The pillar guide' },
  { href: '/learn/upsc-success-prediction', label: 'UPSC Success Prediction', note: 'House by house' },
  { href: '/learn/10th-house-government-job-astrology', label: '10th House and government service', note: 'Where to start reading' },
  { href: '/learn/saturn-shani-government-job-astrology', label: 'Saturn and government jobs', note: 'Delay is not denial' },
  { href: '/learn/sun-surya-raj-yoga-government-job', label: 'Sun, Raj Yoga and the state', note: 'The authority karaka' },
  { href: '/learn/government-job-dasha-timing', label: 'Government Job Dasha Timing', note: 'The "when" question' },
  { href: '/learn/ssc-railway-police-job-astrology', label: 'SSC, Railway and Police', note: 'Different exam, different planets' },
  { href: '/learn/banking-psu-job-astrology', label: 'Banking and PSU jobs', note: 'Mercury and Venus' },
  { href: '/blog/will-i-clear-upsc-astrology', label: 'Will I clear UPSC?', note: 'What a chart cannot say' },
];

function IasRich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={`${k}-l-${i}`} href={link[2]} className="font-semibold underline underline-offset-2 hover:opacity-80" style={{ color: GOLD }}>
              {link[1]}
            </Link>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${k}-b-${i}`} style={{ color: GOLD }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

function IasHub({ items }: { items: IasLink[] }) {
  return (
    <ul className="space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold" style={{ color: GOLD }}>{i.label}</span>
            <span className="block text-xs text-slate-500">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function FreeIasAstrologyCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-ias-astrology-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: "IAS & UPSC Astrology Calculator — Government Job Yog by Date of Birth",
    description: "Free IAS astrology calculator. Get your Sarkari Naukri Yog score from your Kundali with the reason behind every point — 10th house, Dasamsa D-10, Shadbala, drishti and Dasha. By Trikaal Vaani.",
    breadcrumbName: "IAS Astrology Calculator",
    aboutEntities: ["Government Job Astrology", "Dasamsa", "Shadbala", "Amatyakaraka", "Shasha Yoga", "Ruchaka Yoga", "Vimshottari Dasha"],
    knowsAbout: ["Vedic Astrology", "Jyotish Shastra", "Shadbala", "Dasamsa", "Jaimini Karakas", "Government Job Astrology"],
    howToName: "How to check your IAS and government job yog from your Kundali",
    howToSteps: [{"name": "Enter birth details", "text": "Enter your date, exact time and place of birth. Time matters most, because the lagna and all twelve houses depend on it."}, {"name": "The chart is computed", "text": "Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali, the Dasamsa D-10 career chart, full Shadbala for all seven planets and degree-precise drishti."}, {"name": "Read the reasons, not just the score", "text": "Every rule shows the points it awarded and the exact figure behind it — which planet, which house, what Shadbala ratio and how strong each aspect actually is."}],
    faqs: FAQS,
    dateModified: '2026-09-05',
  });

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: '#94a3b8' }}>IAS Astrology Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>IAS Astrology Calculator</h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>UPSC, SSC, Banking, Railway aur Police — Sarkari Naukri Yog aapki Kundali se, har point ki wajah ke saath.</p>
          </header>

          <section className="rounded-xl p-4 mb-6" style={{ background: 'rgba(212,175,55,0.06)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              Doosri sites aapko sirf ek number deti hain. Ye calculator har point ke saath batata hai ki wo kyun mila — kaunsa graha, kaunsa ghar, uski Shadbala kitni, aur drishti kitni taakat ki. Career ke liye BPHS Dasamsa (D-10) padhne ko kehta hai, rasi chart nahi — wo bhi isme hai.
            </p>
          </section>

          <YogCalculator config={{
            type: 'upsc',
            scoreLabel: "Sarkari Naukri Yog Score",
            breakdownHeading: "Har point ki wajah",
            secondaryHeading: "Kaunsi sarkari line khuli hai",
            ctaHref: '/#birth-form',
            ctaLabel: "Mera Sarkari Naukri Yog dekho",
            ctaPrice: '₹51',
            ctaBlurb: "Ye report sirf sarkari naukri ka yog dekhti hai. Trikaal Ka Sandesh aapki poori kundali padhta hai — career, paisa, shaadi, sehat — sabka samay aur upay ek saath.",
          }} />

          <section className="rounded-2xl p-5 md:p-6 mb-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-4" style={{ color: GOLD }}>Aksar puche jaane wale sawaal</h2>
            {FAQS.map((f, i) => (
              <details key={i} className="mb-2 last:mb-0">
                <summary className="text-sm font-semibold cursor-pointer py-2" style={{ color: '#e2e8f0' }}>{f.q}</summary>
                <p className="text-xs leading-relaxed mt-1 mb-2" style={{ color: '#94a3b8' }}>{f.a}</p>
              </details>
            ))}
          </section>

          {/* ── v2.0: TABLE OF CONTENTS ─────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-12 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>{s.h2}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── v2.0: PILLAR CONTENT — 36 keyword-driven H2 sections ── */}
          <section className="mt-12">
            {SECTIONS.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                    <IasRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* ── v2.0: the career cluster this page was barely linked to ── */}
          <section className="rounded-2xl p-5 md:p-6 mb-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Sarkari naukri aur UPSC — poora guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Har vishay par alag vistrit lekh — hindi aur angrezi dono mein. Sabse pehle Dasamsa wala padhiye, kyunki career wahin se padha jaata hai.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>हिंदी में</h3>
                <IasHub items={HUB_HI} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>In English</h3>
                <IasHub items={HUB_EN} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl p-5" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Aur padhein</h2>
            <ul className="text-sm space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
              <li><Link href="/career" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Career Astrology — poora hub</Link></li>
              <li><Link href="/learn/best-career-birth-chart" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Kaunsa career aapke chart ke anukool hai</Link></li>
              <li><Link href="/learn/promotion-prediction-astrology" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Promotion Prediction</Link></li>
              <li><Link href="/learn/job-change-prediction" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Job Change Prediction</Link></li>
              <li><Link href="/calculators/free-sade-sati-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Sade Sati Calculator</Link></li>
              <li><Link href="/calculators/free-dasha-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Dasha Calculator</Link></li>
              <li><Link href="/calculators/free-foreign-settlement-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Videsh Settlement Calculator</Link></li>
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
