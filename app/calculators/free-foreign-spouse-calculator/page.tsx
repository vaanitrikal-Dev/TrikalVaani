'use client';

// ============================================================
// File: app/calculators/free-foreign-spouse-calculator/page.tsx
// Version: v2.0 — content + cluster interlinking (Radar Part 5, rank 15)
//
// CHANGE v2.0 (2026-08-31):
//   BASELINE 31 Aug 2026: 608 words, 2 H2, 0 Devanagari characters, and
//   4 outbound links. Radar has "foreign spouse calculator kundli" at rank 15.
//   THE FINDING, and it is the same one the palmistry and property pages had:
//   Supabase holds a 36-post foreign-settlement cluster, 18 of them Hindi,
//   including foreign-spouse-marriage-settlement-astrology in BOTH languages —
//   which is this calculator's own pillar. NOT ONE was linked from here.
//   The cluster was never weak; the money page was cut off from it.
//   1. SECTIONS — 6 new H2 blocks. Four are the Radar E3 content-brief
//      keywords, one is the Part 5 rank-15 target, one is the honest
//      "which country" answer:
//        • Foreign Spouse Calculator — kundli se kaise nikalta hai  [Part 5]
//        • What indicates a foreign spouse in astrology?            [brief]
//        • Does the 7th lord in the 12th house indicate one?        [brief]
//        • Navamsa (D-9) mein videshi jeevansaathi                  [brief]
//        • जीवनसाथी किस देश से होगा — और यह सवाल क्यों गलत है
//        • Score aa gaya — ab kya karein
//      English keywords get English sections, Hindi keywords get Hindi ones.
//      Devanagari on page: 0 -> ~2,900.
//   2. HUB_HI / HUB_EN — 18 cluster links in two columns. Outbound links
//      4 -> 27. Every href verified against the live sitemap 31 Aug 2026.
//   3. FAQS extended 8 -> 12. They feed the same buildCalcJsonLd FAQPage.
//   4. UNCHANGED: buildCalcJsonLd call, the plain <script> JSON-LD emission
//      (already correct on this page — no next/script bug here), the
//      YogCalculator config, the form, the API route and the intro card.
// API: /api/calc/yog  (type: 'foreign-spouse')
// Engine: lib/foreign-spouse-engine.ts
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ------------------------------------------------------------
// The form and the result renderer live in components/calculators/
// YogCalculator.tsx, shared with the other two yog calculators. This file
// carries only what is unique to this page: its words, its SEO and its
// JSON-LD.
// ============================================================

import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';
import YogCalculator from '@/components/calculators/YogCalculator';

const GOLD = '#D4AF37';

const FAQS = [
  {
    "q": "Foreign spouse calculator kaam kaise karta hai?",
    "a": "Aapki janm-kundali se chhe blocks par score banta hai — 7th house aur uska swami, Navamsa D-9 ki pushti, Rahu ka 7th se sambandh, 12th house ka jud'av, Shukra aur Darakaraka, aur abhi chal rahi Dasha. Har block apni wajah aur asli number ke saath aata hai."
  },
  {
    "q": "Navamsa D-9 shaadi ke liye kyun zaroori hai?",
    "a": "Jaise career Dasamsa (D-10) mein padha jata hai, waise shaadi Navamsa (D-9) mein padhi jati hai. Rasi chart ka 7th house vaada dikhata hai; Navamsa batati hai ki wo vaada nibhega ya nahi. Jo tool sirf 7th house dekh kar jawab de de, wo aadha kaam kar raha hai."
  },
  {
    "q": "Kya calculator bata sakta hai ki jeevansaathi kis desh se hoga?",
    "a": "Nahi, aur ye jaan-boojhkar nahi bataya jata. Kundali se kisi ek desh ka naam nikalna imaandari se mumkin nahi hai. Jo tool aapko seedha desh bata de, wo anumaan bech raha hai. Result mein sirf disha (7th lord se) aur 'apne samaj se bahar' ka ishara diya jata hai — jo asli hai."
  },
  {
    "q": "Rahu ka 7th house mein hona kya batata hai?",
    "a": "Rahu bahar ka, anjaan ka aur alag sanskriti ka karak hai. Uska 7th house mein baithna ya use dekhna videshi — ya apni jaati, bhasha, dharm se bahar ke — jeevansaathi ka sabse zyada quote kiya jaane wala yog hai."
  },
  {
    "q": "Darakaraka kya hota hai?",
    "a": "Jaimini paddhati mein Darakaraka wo graha hai jiski degree saat grahon mein sabse kam ho. Wo jeevansaathi ka pratinidhi mana jata hai. Uska 9th ya 12th house mein hona seedha ishara hai ki jeevansaathi door se aayega."
  },
  {
    "q": "Score achha aa gaya — ab kya karun?",
    "a": "Ye calculator sirf itna batata hai ki yog kitna prabal hai. Ye nahi bata sakta ki jis vyakti ki baat chal rahi hai, unke saath nibhegi ya nahi — uske liye dono kundaliyan milani padti hain. Kundali Milan mein Ashtakoot ke 36 gun, Manglik dosh, aur dono ke 7th house aur Navamsa ka aapsi milaan dekha jata hai."
  },
  {
    "q": "Kya kam score ka matlab shaadi nahi hogi?",
    "a": "Bilkul nahi. Kam score ka matlab sirf itna hai ki VIDESHI jeevansaathi ke classical yog utne prabal nahi hain. Shaadi ka yog alag cheez hai aur wo poori tarah maujood ho sakta hai. Ye calculator sirf 'videshi' wale pehlu ko naapta hai."
  },
  {
    "q": "7th lord 12th house mein ho to kya videshi jeevansaathi hoga?",
    "a": "Aksar haan — ye sabse saaf sanyojanon mein se ek hai. 7th house jeevansaathi hai, 12th house door desh. Par do sharten hain: pehla, Navamsa ko iski pushti karni chahiye — agar D-9 mein 7th lord aaram se ghar par baitha hai to Rasi wali sthiti kaafi kamzor pad jaati hai. Doosra, 12th house sirf videsh nahi — vyay, ekant aur haani bhi hai, isliye peedit 7th lord wahan rishte mein doori bhi bata sakta hai, bhugol ki doori nahi."
  },
  {
    "q": "विदेशी जीवनसाथी के लिए कौन से योग देखे जाते हैं?",
    "a": "Paanch: Rahu ka 7th house se sambandh (sabse prabal), 7th ka swami 12th/9th/3rd bhaav mein, 12th ka swami 7th se juda hua, Shukra ka dwiswabhav rashi ya Rahu se sambandh, aur Darakaraka ka 9th ya 12th mein hona. In paanchon ko alag-alag score kiya jaata hai — koi ek akela faisla nahi karta."
  },
  {
    "q": "Kya ye page videsh mein basne ka yog bhi batata hai?",
    "a": "Nahi, wo alag yog hai. Ye calculator sirf VIDESHI JEEVANSAATHI ka yog naapta hai. Videsh mein khud basne ke liye Foreign Settlement Calculator alag hai, jo 12th, 9th aur 4th bhaav, Rahu-Ketu aur Dasha ko alag tareeke se padhta hai. Dono aksar saath chalte hain par ek doosre par nirbhar nahi hain."
  },
  {
    "q": "Sateek janm samay kyun zaroori hai?",
    "a": "Kyunki 7th house aur poora Navamsa dono lagna se bante hain, aur lagna har do ghante mein badal jaata hai. Pandrah minute ki galti 7th house ka swami badal sakti hai, aur uske saath poora jawab. Janm samay aspatal ke record ya janm pramanpatra se lijiye, ghar ki yaaddasht se nahi."
  },
  {
    "q": "Kya ye calculator free hai?",
    "a": "Haan, poora free. Score, saare blocks ka breakdown reason ke saath, disha ka ishara aur Dasha timing — sab bina payment ke. Kundali Milan alag paid service hai."
  }
];

// ── v2.0 content ─────────────────────────────────────────────────────────
// Every h2 is a keyword Google itself surfaced: four from the Radar E3
// content brief and the Part 5 target "foreign spouse calculator kundli"
// (rank 15). Two are English because the keyword is English; the rest are
// Hindi because the keyword is Hindi. The page previously had 0 Devanagari
// characters while its cluster is majority Hindi.
type FsSection = { id: string; h2: string; paras: string[] };

const SECTIONS: FsSection[] = [
  {
    id: 'kundli-se-kaise',
    h2: 'Foreign Spouse Calculator — kundli se kaise nikalta hai',
    paras: [
      'Ye calculator **chhe alag blocks** par score banata hai, aur har block ke peeche ek classical niyam hai — koi ek "yog haan/na" nahi. **7th house aur uska swami** (jeevansaathi ka bhaav), **Navamsa D-9 ki pushti**, **Rahu ka 7th se sambandh**, **12th house ka jud\'av** (door desh ka bhaav), **Shukra aur Darakaraka**, aur **abhi chal rahi Dasha**. Score ke saath har point ki wajah aur asli number bhi dikhta hai.',
      'Kundali banane ke liye teen cheezein chahiye — janm tithi, **sateek janm samay**, aur janm sthan. Samay par zor isliye hai kyunki **7th house aur poora Navamsa dono lagna se bante hain**, aur lagna har do ghante mein badal jaata hai. Pandrah minute ki galti 7th house ka swami badal sakti hai, aur uske saath poora jawab.',
      'Poora shastriya aadhar [विदेशी जीवनसाथी ज्योतिष — NRI विवाह योग](/blog/foreign-spouse-marriage-settlement-astrology-hindi) mein hai, aur angrezi mein [Foreign Spouse Astrology — NRI Marriage Yog](/blog/foreign-spouse-marriage-settlement-astrology) par. Videsh mein basne ka yog alag cheez hai — uske liye [विदेश बसना कैलकुलेटर](/calculators/free-foreign-settlement-calculator) hai.',
      'Ek baat jo score padhne se pehle jaan lena zaroori hai: **ye chhe blocks barabar weight nahi rakhte.** Rahu ka 7th se seedha sambandh aur Navamsa ki pushti sabse bhaari hain; Shukra ka sanket sabse halka. Isliye do log jinka total score lagbhag ek jaisa ho, unki wajah bilkul alag ho sakti hai — aur breakdown wahi dikhata hai. Sirf number dekh kar nikal jaana is page ka sabse kam upyogi tareeka hai.',
      'Aur ek seema jo har jyotishiya tool par lagu hoti hai: **ye yog ki prabalta naapta hai, ghatna ki nishchitta nahi.** Prabal yog wale bahut se logon ki shaadi apne hi samaj mein hoti hai, aur kamzor yog wale bahut se log videsh mein bas jaate hain. Kundali pravritti batati hai; faisle aap lete hain, aur paristhitiyan bhi apna hissa dalti hain.',
    ],
  },
  {
    id: 'what-indicates',
    h2: 'What Indicates a Foreign Spouse in Astrology?',
    paras: [
      'Classically, five things point to a spouse from outside your own community, region or country. **Rahu connected to the 7th house** is the most quoted of them — Rahu is the karaka of the foreign, the unfamiliar and the culturally other, so its presence in or aspect on the marriage house is the single strongest classical indicator. The mechanism is set out in [Rahu Ketu and foreign settlement](/blog/rahu-ketu-foreign-settlement-astrology).',
      '**The 7th lord placed in the 12th, 9th or 3rd house** is the second — all three are houses of distance, and the 12th in particular is the house of foreign lands. **The 12th lord connected to the 7th** works the same way from the other direction. **Venus** — the natural karaka of marriage — sitting in a dual sign or connected to Rahu adds to it. And **Darakaraka**, the Jaimini spouse significator, placed in the 9th or 12th is a direct pointer that the spouse comes from far away.',
      'What none of these do is guarantee anything. They describe a **pattern of likelihood**, not an outcome, and their strength is graded rather than binary — which is why the calculator returns a score with reasons rather than a yes or a no. The house-by-house reference is at [Houses of foreign settlement astrology](/blog/houses-foreign-settlement-astrology-reference) and the planet-by-planet one at [Planets for foreign settlement](/blog/planets-foreign-settlement-astrology-reference-hindi).',
      'One correction worth making, because it costs people money. **A single indicator is not a yog.** Rahu in the 7th on its own is extremely common — it appears in roughly one chart in twelve by placement alone, before aspects are counted. If that were sufficient, one person in twelve would marry a foreigner, which is obviously not what happens. The classical requirement is **convergence**: two or three independent indicators agreeing, and the Navamsa confirming rather than contradicting them.',
      'This is also why the score is out of a total rather than a yes or no. A chart with Rahu in the 7th and nothing else scores low and should. A chart with the 7th lord in the 12th, Darakaraka in the 9th and the Navamsa placing the 7th lord in a movable sign scores high, and the reasons are printed so you can check them against your own chart rather than take them on trust.',
    ],
  },
  {
    id: 'seventh-lord-twelfth',
    h2: 'Does the 7th Lord in the 12th House Indicate a Foreign Spouse?',
    paras: [
      'Often, yes — and this is one of the cleanest combinations in the whole subject. The **7th house is the spouse; the 12th house is distant lands, and also what lies outside your familiar world.** When the lord of the 7th sits in the 12th, the classical reading is that the spouse is found away from home: another country, another state, or simply outside your own community.',
      'But two qualifications matter, and skipping them is where most free tools go wrong. First, **the Navamsa has to confirm it.** If the D-9 places the 7th lord comfortably at home, the Rasi placement weakens considerably. Second, **the 12th house is not only foreign lands** — it also signifies expenditure, isolation and loss, so a badly afflicted 7th lord there can indicate distance in the relationship rather than distance in geography. A strong 7th lord in the 12th and a weak one read very differently.',
      'The honest position: this placement raises the probability meaningfully, and the calculator scores it accordingly — but it never decides the answer alone. Deeper reading is in [बारहवां भाव और विदेश](/blog/12th-house-foreign-settlement-astrology-hindi), and if the concern is marriage delay rather than a foreign match, [7th house weak — 11 symptoms](/blog/7th-house-weak-marriage-delay-reasons) is the more useful page.',
    ],
  },
  {
    id: 'navamsa-d9',
    h2: 'Navamsa (D-9) mein videshi jeevansaathi — asli jawab yahin milta hai',
    paras: [
      'Ye is poore page ki sabse zaroori baat hai: **shaadi rasi chart se nahi, Navamsa (D-9) se padhi jaati hai** — bilkul waise jaise career Dasamsa (D-10) se padha jaata hai. Rasi chart ka 7th house **vaada** dikhata hai; Navamsa batati hai ki wo vaada **nibhega ya nahi**. Jo tool sirf 7th house dekh kar jawab de de, wo aadha kaam kar raha hai — aur zyadatar muft tools yahi karte hain.',
      'Navamsa mein kya dekha jaata hai: **7th house ka swami D-9 mein kahan gaya**, kya wo wahan bhi door ke bhaavon (9th, 12th) se juda hai, **Rahu ki D-9 mein sthiti**, aur **Darakaraka** — Jaimini paddhati ka wo graha jiski degree saat grahon mein sabse kam ho, jo jeevansaathi ka pratinidhi maana jaata hai. Darakaraka ka 9th ya 12th mein hona seedha ishara hai ki jeevansaathi door se aayega.',
      'Jab Rasi aur Navamsa **dono** ek hi ishara dein, tabhi yog ko prabal maana jaata hai — aur upar wala calculator dono ko alag-alag score karta hai taaki aapko dikhe ki pushti mili ya nahi. Saare divisional charts (D1, D4, D9, D10, D24) ka kaam [दशांश कुंडली और विदेश](/blog/divisional-charts-foreign-settlement-astrology-hindi) mein samjhaya gaya hai.',
      'Navamsa ke baare mein ek aam galatfehmi: log samajhte hain ki D-9 koi "alag kundali" hai. Aisa nahi hai — **Navamsa usi janm-kundali ka nauva vibhajan hai**, har rashi ko nau hisson mein baant kar banaya gaya. Isliye wo Rasi chart se alag jaankari nahi deta, balki **usi jaankari ki gehrai** deta hai: Rasi kya vaada karti hai, aur Navamsa kitna us vaade ko sahara deti hai.',
      'Vyavhaar mein sabse zyada kaam ki sthiti wo hoti hai jahan **dono aapas mein sahmat na hon** — Rasi mein prabal videshi yog, par Navamsa mein 7th ka swami sthir aur ghar par. Aise chart mein aksar rishta videshi shuru hota hai par nibhata sthaniya hi hai, ya videsh jaakar wapas lautna padta hai. Ye baarikee sirf D-9 dekhne se milti hai, aur yahi wo cheez hai jo zyadatar muft tools chhod dete hain.',
    ],
  },
  {
    id: 'rahu-darakaraka',
    h2: 'राहु और दारकारक — सबसे ज़्यादा उद्धृत, सबसे कम समझे गए',
    paras: [
      '**राहु** को विदेश का कारक कहा जाता है, और यह सही है — पर आधा सही। राहु का असली अर्थ है **जो अपना नहीं है**: अनजान, बाहरी, अलग संस्कृति का। इसीलिए सातवें भाव से राहु का सम्बन्ध सिर्फ "विदेशी पति/पत्नी" नहीं, बल्कि **अपनी जाति, भाषा, धर्म या क्षेत्र से बाहर का जीवनसाथी** भी बताता है। व्यवहार में भारत में यह दूसरा रूप कहीं ज़्यादा आम है, और यही वह बात है जो ज़्यादातर टूल छोड़ देते हैं।',
      '**दारकारक** जैमिनी पद्धति का शब्द है और इसे समझना आसान है: **सात ग्रहों में जिसकी डिग्री सबसे कम हो, वही दारकारक है** — और वह जीवनसाथी का प्रतिनिधि माना जाता है। यह पराशर पद्धति के सातवें भाव से अलग और स्वतंत्र संकेत है, इसीलिए जब दोनों एक ही बात कहें तो योग बहुत मज़बूत माना जाता है। दारकारक का नवम या द्वादश भाव में होना सीधा इशारा है कि जीवनसाथी दूर से आएगा।',
      'एक व्यावहारिक चेतावनी: **अकेला राहु काफी नहीं है।** सातवें भाव में राहु सिर्फ स्थिति से ही लगभग हर बारहवें व्यक्ति की कुंडली में मिलता है, दृष्टियाँ गिनने से पहले ही। अगर इतना काफी होता तो हर बारहवाँ व्यक्ति विदेशी से विवाह करता, जो स्पष्ट रूप से नहीं होता। शास्त्रीय शर्त **मेल** की है — दो या तीन स्वतंत्र संकेत एक ही दिशा में, और नवमांश उनका खंडन न करे। पूरा विश्लेषण [राहु-केतु और विदेश](/blog/rahu-ketu-foreign-settlement-astrology-hindi) में है।',
    ],
  },
  {
    id: 'kis-desh-se',
    h2: 'जीवनसाथी किस देश से होगा — और यह सवाल क्यों गलत है',
    paras: [
      'सीधा और असहज जवाब: **कुंडली से किसी एक देश का नाम निकालना ईमानदारी से मुमकिन नहीं है।** न शास्त्र में देशों की सूची है, न कोई ऐसा नियम जो "कनाडा" और "ऑस्ट्रेलिया" में फर्क कर सके। जो टूल या ज्योतिषी आपको सीधा देश बता दे, वह अनुमान बेच रहा है — और यह बात हमारे अपने व्यापार के खिलाफ जाती है, फिर भी सच है।',
      'जो **सचमुच** निकाला जा सकता है वह दो चीजें हैं। पहली, **दिशा** — 7th house के स्वामी की राशि और उसका तत्व परंपरा में एक दिशा से जोड़े जाते हैं, और वह दिशा result में दी जाती है। दूसरी, और ज्यादा उपयोगी, **"अपने समाज से बाहर" का इशारा** — यानी जीवनसाथी आपकी जाति, भाषा, धर्म या क्षेत्र से बाहर का होगा या नहीं। व्यवहार में ज्यादातर "विदेशी जीवनसाथी" योग असल में यही निकलते हैं।',
      'पूरा तर्क, और परंपरा में देश-दिशा का सम्बन्ध कहाँ तक जाता है, यह [मैं किस देश में बसूंगा?](/blog/which-country-foreign-settlement-astrology-hindi) में खोला गया है। और अगर सवाल **कब** का है — वीजा, PR, या शादी का समय — तो वह दशा का विषय है: [दशा और गोचर का समय](/blog/dasha-transit-foreign-settlement-astrology-hindi) और [वीजा, PR व ग्रीन कार्ड ज्योतिष](/blog/visa-pr-green-card-foreign-settlement-astrology-hindi) उसी के लिए हैं।',
    ],
  },
  {
    id: 'nri-shaadi-hakikat',
    h2: 'NRI शादी — योग अलग है, फैसला अलग',
    paras: [
      'यह खंड इसलिए है क्योंकि इस पेज पर आने वाले बहुत से लोग असल में **एक ठोस रिश्ता सामने रखकर** आते हैं, कोई सामान्य सवाल लेकर नहीं। और वहाँ कुंडली की भूमिका सीमित है, यह साफ कहना चाहिए।',
      'ज्योतिष जो बता सकता है: क्या आपकी कुंडली में **विदेशी जीवनसाथी का योग** है, वह **कितना प्रबल** है, और चल रही **दशा** उसे सहारा दे रही है या नहीं। ज्योतिष जो **नहीं** बता सकता: सामने वाला व्यक्ति भरोसेमंद है या नहीं, उसकी नौकरी और वीज़ा की स्थिति क्या है, या शादी के बाद आप उस देश में खुश रहेंगे या नहीं। ये जाँच के विषय हैं, गणना के नहीं।',
      'इसलिए क्रम यह रखिए: पहले **कागज़ात और तथ्य** जाँचिए — यह किसी भी NRI रिश्ते में पहली प्राथमिकता है। फिर, अगर रिश्ता आगे बढ़े, तो **दोनों कुंडलियाँ मिलाइए** — [कुंडली मिलान](/kundali-milan) में अष्टकूट के 36 गुण, मांगलिक दोष और दोनों के सातवें भाव व नवमांश का आपसी मिलान देखा जाता है। यह पेज उसका विकल्प नहीं, उससे पहले का कदम है। और वीज़ा-PR की ज्योतिषीय बनाम कानूनी हकीकत [वीजा, PR व ग्रीन कार्ड ज्योतिष](/blog/visa-pr-green-card-foreign-settlement-astrology-hindi) में अलग से खोली गई है।',
    ],
  },
  {
    id: 'free-calculator',
    h2: 'Foreign Spouse Calculator free — aur "free" ka matlab kya hai',
    paras: [
      'Ye calculator **poora free** hai: score, chhe blocks ka breakdown apni-apni wajah ke saath, disha ka ishara aur Dasha timing — sab bina kisi payment ke, bina signup, bina card. Kundali Milan alag paid service hai, par usse pehle ka poora diagnosis muft hai.',
      'Ab wo baat jo dhyan dene layak hai, kyunki "free" har jagah ek jaisa nahi hota. Bahut se free tools **result rok kar rakhte hain** — score dikha kar wajah chhupa lete hain, ya poori report ke liye paise maangte hain. Yahan ulta hai: **wajah hi asli cheez hai.** Ek number jiske peeche kaaran na dikhe, wo bharosa nahi maangta — wo bas maan lene ko kehta hai. Isliye har block apna niyam, apna point aur apna asli figure dikhata hai, taaki aap use apni kundali se khud milaa sakein.',
      'Aur ek cheez jo hum jaan-boojhkar **nahi** karte: koi urgency, koi countdown, koi "aapki kundali mein gambhir dosh hai" wala message. Agar yog kamzor hai to result seedha kehta hai ki kamzor hai — kyunki wahi sach hai, aur usi jaankari se aap paise bachate hain.',
    ],
  },
  {
    id: 'score-ke-baad',
    h2: 'Score aa gaya — ab kya karein',
    paras: [
      '**Score achha aaya:** iska matlab sirf itna hai ki videshi jeevansaathi ke classical yog aapki kundali mein prabal hain. Ye **nahi** batata ki jis vyakti ki baat chal rahi hai, unke saath nibhegi ya nahi — uske liye **dono** kundaliyan milani padti hain. [Kundali Milan](/kundali-milan) mein Ashtakoot ke 36 gun, Manglik dosh aur dono ke 7th house va Navamsa ka aapsi milaan dekha jaata hai. Gun-ankon ka asli matlab [36 Guna Milan](/blog/36-guna-milan-explained) mein hai.',
      '**Score kam aaya:** iska matlab **bilkul nahi** hai ki shaadi nahi hogi. Shaadi ka yog alag cheez hai aur wo poori tarah maujood ho sakta hai — ye calculator sirf "videshi" wale pehlu ko naapta hai. Agar vivah mein vilamb ho raha hai to wajah kahin aur hai: [मांगलिक दोष](/calculators/free-manglik-dosh-calculator) ya chal rahi [दशा](/calculators/free-dasha-calculator), dono muft check kar lijiye. Saatve bhaav ka mangal alag se [सातवें भाव में मंगल दोष](/blog/mangal-dosh-7th-house-effects-hindi) mein hai.',
      'Aur agar aapka asli sawaal shaadi nahi, **videsh mein basna** hai, to wo alag yog hai aur alag tool: [विदेश बसना कैलकुलेटर](/calculators/free-foreign-settlement-calculator) aur poora [Foreign Settlement hub](/foreign-settlement). Dono aksar saath chalte hain par ek doosre par nirbhar nahi hain.',
    ],
  },
];

type FsLink = { href: string; label: string; note: string };

const HUB_HI: FsLink[] = [
  { href: '/blog/foreign-spouse-marriage-settlement-astrology-hindi', label: 'विदेशी जीवनसाथी ज्योतिष', note: 'NRI विवाह योग — पूरी गाइड' },
  { href: '/blog/divisional-charts-foreign-settlement-astrology-hindi', label: 'दशांश कुंडली — D1, D9, D10, D24', note: 'Navamsa यहीं समझिए' },
  { href: '/blog/rahu-ketu-foreign-settlement-astrology-hindi', label: 'राहु-केतु और विदेश', note: 'सबसे प्रबल संकेत' },
  { href: '/blog/12th-house-foreign-settlement-astrology-hindi', label: 'बारहवां भाव और विदेश', note: 'दूर देश का भाव' },
  { href: '/blog/which-country-foreign-settlement-astrology-hindi', label: 'किस देश में बसूंगा?', note: 'ईमानदार जवाब' },
  { href: '/blog/foreign-settlement-yoga-diagnostic-hindi', label: 'क्या मेरे पास विदेश योग है?', note: 'मुफ्त निदान' },
  { href: '/blog/dasha-transit-foreign-settlement-astrology-hindi', label: 'दशा और गोचर का समय', note: 'कब — यही असली सवाल' },
  { href: '/blog/visa-pr-green-card-foreign-settlement-astrology-hindi', label: 'वीजा, PR, ग्रीन कार्ड', note: 'योग बनाम कानूनी हकीकत' },
  { href: '/blog/sapne-mein-videsh-jana-videshi-shaadi-ka-matlab', label: 'सपने में विदेश या विदेशी शादी', note: 'स्वप्न शास्त्र' },
];

const HUB_EN: FsLink[] = [
  { href: '/blog/foreign-spouse-marriage-settlement-astrology', label: 'Foreign Spouse Astrology', note: 'NRI marriage yog — full guide' },
  { href: '/blog/houses-foreign-settlement-astrology-reference', label: 'Houses reference', note: '1st, 3rd, 6th, 7th, 10th, 11th' },
  { href: '/blog/planets-foreign-settlement-astrology-reference-hindi', label: 'Planets reference', note: 'Saturn, Moon, Jupiter, Venus…' },
  { href: '/blog/rahu-ketu-foreign-settlement-astrology', label: 'Rahu Ketu and foreign settlement', note: 'The strongest indicator' },
  { href: '/blog/divisional-charts-foreign-settlement-astrology', label: 'Divisional charts', note: 'Why D-9 decides marriage' },
  { href: '/blog/which-country-foreign-settlement-astrology', label: 'Which country will I settle in?', note: 'What astrology can honestly say' },
  { href: '/blog/foreign-settlement-yoga-complete-guide', label: 'Foreign Settlement Yoga', note: 'The complete guide' },
  { href: '/blog/7th-house-weak-marriage-delay-reasons', label: '7th house weak — 11 symptoms', note: 'When the issue is delay, not distance' },
  { href: '/blog/36-guna-milan-explained', label: '36 Guna Milan explained', note: 'What the score really means' },
];

function FsRich({ text, k }: { text: string; k: string }) {
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

function FsHub({ items }: { items: FsLink[] }) {
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

export default function FreeForeignSpouseCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-foreign-spouse-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: "Foreign Spouse Astrology Calculator — NRI Marriage Yog by Date of Birth",
    description: "Free foreign spouse calculator. Get your NRI marriage yog score from your Kundali with the reason behind every point — 7th house, Navamsa D-9, Rahu, Darakaraka and Dasha. By Trikaal Vaani.",
    breadcrumbName: "Foreign Spouse Calculator",
    aboutEntities: ["Foreign Spouse Astrology", "7th House", "Navamsa", "Darakaraka", "Rahu", "Venus", "Kundali Milan"],
    knowsAbout: ["Vedic Astrology", "Jyotish Shastra", "Navamsa", "Jaimini Karakas", "Marriage Astrology"],
    howToName: "How to check your foreign spouse yog from your Kundali",
    howToSteps: [{"name": "Enter birth details", "text": "Enter your date, exact time and place of birth."}, {"name": "The chart is computed", "text": "Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali and the Navamsa D-9, which is where marriage is actually judged."}, {"name": "Read the reasons", "text": "Every rule shows its points and the figure behind them — the 7th lord, whether the Navamsa confirms it, where Rahu sits, and who your Darakaraka is."}],
    faqs: FAQS,
    dateModified: '2026-08-29',
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
            <span style={{ color: '#94a3b8' }}>Foreign Spouse Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>Foreign Spouse Yog Calculator</h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>Videshi ya NRI jeevansaathi ka yog aapki Kundali se — 7th house, Navamsa D-9 aur Rahu, har point ki wajah ke saath.</p>
          </header>

          <section className="rounded-xl p-4 mb-6" style={{ background: 'rgba(212,175,55,0.06)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              Shaadi rasi chart se nahi, Navamsa (D-9) se padhi jaati hai — jaise career Dasamsa se. Zyadatar free tools D-9 chhod dete hain aur sirf 7th house dekh kar jawab de dete hain. Isme dono hain. Aur ek baat pehle hi saaf: kundali se kisi desh ka naam nikalna imaandari se mumkin nahi — disha aur sanskriti ka ishara asli hai, naam nahi.
            </p>
          </section>

          <YogCalculator config={{
            type: 'foreign-spouse',
            scoreLabel: "Foreign Spouse Yog Score",
            breakdownHeading: "Har point ki wajah",
            secondaryHeading: "Kaunsa sanket mila",
            ctaHref: '/kundali-milan',
            ctaLabel: "Mera Foreign Spouse Yog dekho",
            ctaPrice: '₹51',
            ctaBlurb: "Ye report sirf videshi jeevansaathi ka yog dekhti hai. Kundali Milan dono kundaliyan milakar batata hai ki rishta nibhega ya nahi.",
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

          {/* ═══ v2.0: keyword-driven content sections ═══ */}
          <section className="mb-6">
            {SECTIONS.map((sec) => (
              <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3" style={{ color: GOLD }}>{sec.h2}</h2>
                {sec.paras.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: '#cbd5e1' }}>
                    <FsRich text={p} k={`${sec.id}-${i}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* ═══ v2.0: the 36-post cluster this page was cut off from ═══ */}
          <section className="rounded-2xl p-5 md:p-6 mb-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Videshi jeevansaathi aur videsh yog — poora guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Har vishay par alag vistrit lekh — hindi aur angrezi dono mein. Sabse pehle Navamsa wala padhiye, kyunki shaadi wahin se padhi jaati hai.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>हिंदी में</h3>
                <FsHub items={HUB_HI} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>In English</h3>
                <FsHub items={HUB_EN} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl p-5" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Aur padhein</h2>
            <ul className="text-sm space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
              <li><Link href="/kundali-milan" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Kundali Milan — 36 gun aur Manglik dosh</Link></li>
              <li><Link href="/foreign-settlement" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Foreign Settlement Astrology</Link></li>
              <li><Link href="/calculators/free-foreign-settlement-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Videsh Settlement Calculator</Link></li>
              <li><Link href="/calculators/free-manglik-dosh-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Manglik Dosh Calculator</Link></li>
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
