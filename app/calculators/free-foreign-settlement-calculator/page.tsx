'use client';

// ============================================================
// File: app/calculators/free-foreign-settlement-calculator/page.tsx
// Version: v2.0 — content + cluster interlinking
//
// CHANGE v2.0 (2026-09-01):
//   BASELINE measured live 31 Aug 2026: 613 words, 2 H2, 27 Devanagari
//   characters and 4 outbound content links. Second-thinnest calculator
//   on the site.
//   THE FINDING, same as on the palmistry, property, foreign-spouse,
//   swapna and kundali-milan pages: the 36-post foreign-settlement cluster
//   (18 of them Hindi) already existed in Supabase and ranked on its own,
//   and this page linked to four items. The cluster was never weak; the
//   money page was cut off from it.
//   1. SECTIONS — 16 new H2 blocks. Six are the Radar E3 content-brief
//      keywords for this page, and because FOUR of those six are English
//      those four sections are written in English while the rest are in
//      Hindi. Devanagari on page: 27 -> ~9,600.
//   2. HUB_HI / HUB_EN — 18 cluster links in two columns.
//      Outbound links 4 -> 28. Every href verified against the live sitemap.
//   3. UNCHANGED: buildCalcJsonLd and its plain <script> emission (already
//      correct here — no next/script bug on this page), the YogCalculator
//      config, the /api/calc/yog contract, FAQS and the intro card.
//
// v1.0 — Foreign Settlement Astrology Calculator
// API: /api/calc/yog  (type: 'foreign-settlement')
// Engine: lib/foreign-settlement-engine.ts
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
    "q": "Foreign settlement calculator kaam kaise karta hai?",
    "a": "Aapki janm-kundali se saat blocks par score banta hai — 12th house aur uska swami, Rahu ki sthiti, 9th house, 4th house ki pakad, Chandra aur 3rd house, Dasamsa aur drishti se pushti, aur abhi chal rahi Dasha. Har block apni wajah aur asli number ke saath aata hai."
  },
  {
    "q": "Videsh yog mein 12th house itna zaroori kyun hai?",
    "a": "12th house vyaya, door desh aur janmbhoomi se door jeevan ka ghar hai. Videsh mein basne ke yog mein iska haath sabse bada hota hai. Uska swami kahan baitha hai aur uski Shadbala kitni hai — score ka sabse bada hissa yahi tay karta hai."
  },
  {
    "q": "Kamzor 4th house achha kyun mana jata hai?",
    "a": "4th house ghar aur matribhoomi ka hai. Mazboot 4th insaan ko apni jagah se baandh deta hai — wo jaana hi nahi chahta. Videsh ke liye dheeli pakad behtar hoti hai. Isliye is ek block mein kam taakat par zyada ank milte hain, aur calculator ye baat khud likh kar batata hai."
  },
  {
    "q": "Rahu ka videsh se kya sambandh hai?",
    "a": "Rahu bahar ka, anjaan ka aur seemaayein paar karne ka karak hai. Videsh yog mein isse bada koi graha nahi. Rahu ka 1, 3, 7, 9, 10 ya 12 house mein hona anukool mana jata hai, aur Chandra ke saath uska sambandh man ka jhukav door desh ki taraf mod deta hai."
  },
  {
    "q": "Kya ye bata sakta hai ki mera visa lagega?",
    "a": "Bilkul nahi. Ye ek Yog Strength Score hai, visa prediction nahi. Visa qanoon, kagzaat aur us desh ki neeti se milta hai — kundali se nahi. Ye calculator sirf itna batata hai ki aapke chart mein videsh ke classical yog kitne prabal hain. Ise koi kanooni ya immigration salah na samjhein."
  },
  {
    "q": "Kaunsa raasta khula hai — ye kaise pata chalta hai?",
    "a": "Result mein chaar raste dikhaye jaate hain — naukri, padhai, shaadi aur vyapar — aur har ek ka apna score aur wajah hoti hai. Ye grahon ke karakatva se nikalta hai: Guru aur Budh padhai ke, Shani aur karma naukri ke, Shukra aur Rahu rishte ke."
  },
  {
    "q": "Dasha ka score mein kya role hai?",
    "a": "Yog chart mein hona alag baat hai, aur uska samay aana alag. Agar abhi 12th lord, 9th lord ya Rahu ki mahadasha ya antardasha chal rahi hai, to window khuli hai. Nahi chal rahi to yog phir bhi hai, bas samay abhi nahi aaya — ye result mein saaf likha jata hai."
  },
  {
    "q": "Kya ye calculator free hai?",
    "a": "Haan, poora free. Score, saare blocks ka breakdown, blockers, chaar raston ka vishleshan aur Dasha timing — sab bina payment ke."
  }
];

// ── v2.0 content ─────────────────────────────────────────────────────────
// Sixteen H2 sections. Six are the Radar E3 content-brief keywords for this
// page — and four of those six are English, so those sections are written in
// English and the rest in Hindi/Hinglish. The page previously carried 27
// Devanagari characters, i.e. none, while half its cluster is Hindi.
//   Foreign settlement calculator — kaise kaam karta hai   (seen 4x)
//   Foreign travel astrology by date of birth              (seen 4x)
//   Abroad settlement in astrology                         (seen 3x)
//   Which planet is responsible for foreign settlement?    (seen 3x)
//   How do I know if I will settle abroad?                 (seen 3x)
//   Foreign settlement after marriage                      (seen 3x)
// The 36-post foreign-settlement cluster (18 Hindi) already existed in
// Supabase and this page linked to four items. Same orphaned-cluster
// pattern as the palmistry, property, foreign-spouse, swapna and
// kundali-milan pages. Every href verified against the live sitemap.
type FstSection = { id: string; h2: string; paras: string[] };

const SECTIONS: FstSection[] = [
  {
    id: 'kaise-kaam-karta-hai',
    h2: 'Foreign Settlement Calculator — kaise kaam karta hai',
    paras: [
      'Ye calculator **saat alag blocks** par score banata hai, aur har block ke peeche ek classical niyam hai — koi ek "yog haan ya na" nahi. **12th house aur uska swami** (door desh ka ghar), **Rahu ki sthiti**, **9th house** (lambi yatra aur bhagya), **4th house ki pakad**, **Chandra aur 3rd house**, **Dasamsa D-10 va drishti se pushti**, aur **abhi chal rahi Dasha**.',
      'Har block apna niyam, apne point aur **asli number** dikhata hai — jaise 12th lord ki Shadbala kitni hai, Rahu kis bhaav mein baitha hai. Ye isliye zaroori hai kyunki ek akela score bharosa maangta hai; wajah dikhne par aap use apni kundali se **khud milaa** sakte hain.',
      'Ganana ke liye teen cheezein chahiye — janm tithi, **sateek janm samay**, aur janm sthan. Samay par zor isliye hai kyunki saare bhaav lagna se bante hain, aur **lagna har do ghante mein badal jaata hai**. Pandrah minute ki galti 12th house ka swami badal sakti hai, aur uske saath poora jawab. Poora shastriya aadhar [विदेश योग — पूरी गाइड](/blog/foreign-settlement-yoga-complete-guide-hindi) mein hai.',
    ],
  },
  {
    id: 'which-planet',
    h2: 'Which Planet Is Responsible for Foreign Settlement?',
    paras: [
      'There is no single answer, and any page that gives you one has simplified the tradition past the point of usefulness. **Four planets carry most of the weight, and they do different jobs.**',
      '**Rahu is the strongest single indicator.** Rahu is the karaka of the foreign, the unfamiliar and the culturally other — of crossing a boundary you were not born inside. Rahu in the 1st, 3rd, 7th, 9th, 10th or 12th house is read as favourable for settlement abroad, and a Rahu-Moon connection turns the mind itself towards distance. **Saturn** governs the endurance a move actually demands: the paperwork, the years of grinding, the loneliness. **Jupiter** brings the opportunity — the scholarship, the sponsorship, the person who opens the door. **The Moon** decides whether you can bear it emotionally, which is the part almost nobody checks and the part that sends people home.',
      'The planet-by-planet reference is at [Planets for foreign settlement](/blog/planets-foreign-settlement-astrology-reference-hindi), and Rahu and Ketu specifically at [Rahu Ketu and foreign settlement](/blog/rahu-ketu-foreign-settlement-astrology). One correction worth making: **Rahu alone is not a yog.** Rahu sits in one of those six houses in roughly half of all charts. If that were sufficient, half the country would emigrate. What the classical texts require is **convergence** — three or four independent indicators agreeing.',
    ],
  },
  {
    id: 'how-do-i-know',
    h2: 'How Do I Know If I Will Settle Abroad?',
    paras: [
      'Run the calculator above and read the seven blocks rather than the total. That is the short answer, and the reason is worth stating: **two people with almost the same score can have completely different charts underneath.** One may score on Rahu and the 12th lord — a genuine settlement pattern. Another may score on the 3rd house and Moon — restlessness and travel, which is not the same thing at all.',
      'What a strong result actually means is that the **classical indicators for living outside your birth land are present and mutually reinforcing** in your chart. It does not mean it will happen, and no honest reading claims otherwise. Charts describe tendency; outcomes involve your decisions, your circumstances and a good deal that has nothing to do with astrology.',
      'What a weak result means is narrower than people fear. It does **not** mean you cannot go abroad. It means the classical settlement combinations are not prominent — many people with modest scores work abroad for years and return, which is itself a recognisable pattern. If you want a quick self-check before running anything, [Do I have foreign settlement yoga?](/blog/foreign-settlement-yoga-diagnostic-hindi) walks through the indicators one at a time.',
    ],
  },
  {
    id: 'foreign-travel-dob',
    h2: 'Foreign Travel Astrology by Date of Birth',
    paras: [
      'A distinction that saves a lot of confusion: **travel and settlement are different yogas, read from different houses.** People search for one and mean the other.',
      '**Travel** is largely the 3rd house (short journeys), the 9th house (long journeys, pilgrimage, higher study) and the 12th (distant lands). **Settlement** — actually living there — leans much more heavily on the **12th house and its lord**, on **Rahu**, and critically on a **loose 4th house**. Someone can have strong travel yogas and no settlement yoga at all: they will fly constantly and always come home. The reverse also happens.',
      'On date of birth alone: **you can get part of the picture, but not the important part.** Without a birth time the Lagna is unknown, and without the Lagna the house positions — which is to say the entire 12th-house analysis — cannot be fixed. What date alone will give you is the Moon sign and usually the Nakshatra, which is enough for a rough read and not enough for a decision. The house-by-house reference is at [Houses of foreign settlement astrology](/blog/houses-foreign-settlement-astrology-reference).',
    ],
  },
  {
    id: 'abroad-settlement-astrology',
    h2: 'Abroad Settlement in Astrology — the classical basis',
    paras: [
      'The tradition is older than modern migration, and it did not need the concept of a visa to describe the pattern. Classical texts speak of **videsh gaman** and of living away from one\'s **janmabhoomi** — the land of birth — and the houses they assign to it are the same ones used today.',
      'The core reading is a relationship between three things. **The 12th house** — vyaya, expenditure, loss, and life beyond the familiar. In classical terms it is not a bad house; it is the house of what lies outside your known world, which is exactly what emigration is. **The 9th house** — long journeys, fortune, and the higher learning that historically took people far from home. **The 4th house** — home, mother, roots and the soil itself, which is the anchor that has to loosen before anyone leaves.',
      'This is why the modern reading maps so cleanly onto the old one, and also why the tradition never promised a country or a date. It described a **direction of life**, not an itinerary. Full detail is in [Foreign Settlement Yoga — the complete guide](/blog/foreign-settlement-yoga-complete-guide).',
    ],
  },
  {
    id: 'foreign-settlement-after-marriage',
    h2: 'Foreign Settlement After Marriage',
    paras: [
      'This is a distinct yoga and it is read differently, which is why it has its own calculator. Settlement **through** marriage runs through the **7th house** — the spouse — connecting to the **12th** or the **9th**. The classic signature is the **7th lord placed in the 12th house**: the partner is found away from home, and life follows the partner.',
      'The other common route is **Rahu connected to the 7th**, which points to a spouse from outside your own community, language, religion or country. And **Darakaraka** — the Jaimini spouse significator, the planet at the lowest degree — sitting in the 9th or 12th is a direct pointer that the spouse comes from far away.',
      'If that is your actual question, the [Foreign Spouse Yog Calculator](/calculators/free-foreign-spouse-calculator) scores those specific combinations and confirms them in the Navamsa, which this page does not do. The written analysis is at [विदेशी जीवनसाथी ज्योतिष](/blog/foreign-spouse-marriage-settlement-astrology-hindi). **The two yogas often appear together but neither depends on the other** — plenty of people settle abroad alone, and plenty marry abroad without settling there.',
    ],
  },
  {
    id: 'barahvan-bhaav',
    h2: '12वां भाव — विदेश का असली घर',
    paras: [
      '**बारहवां भाव विदेश योग का सबसे भारी हिस्सा है**, और अकेला यही सबसे बड़ा अंश तय करता है। परंपरा में इसे व्यय, हानि और एकांत का भाव कहा गया है — पर उसके साथ ही यह **दूर देश और जन्मभूमि से बाहर के जीवन** का भाव भी है।',
      'दो चीजें देखी जाती हैं। **पहली — बारहवें का स्वामी कहाँ बैठा है।** अगर वह लग्न, नवम, दशम या स्वयं बारहवें से जुड़ा है, तो योग प्रबल माना जाता है। **दूसरी — उसकी शडबल कितनी है।** कमज़ोर बारहवाँ स्वामी योग तो बनाता है पर उसे निभाने की ताकत नहीं देता — और यही वह बारीकी है जो सिर्फ हाँ/ना बताने वाले टूल छोड़ देते हैं।',
      'एक जरूरी सुधार: **बारहवाँ भाव "बुरा भाव" नहीं है।** यह वह भाव है जो परिचित दुनिया के बाहर की हर चीज़ को दर्शाता है — विदेश, एकांत, अध्यात्म, मोक्ष। प्रवास स्वभाव से ही बारहवें भाव का विषय है, और इसीलिए यहाँ मजबूती शुभ मानी जाती है, अशुभ नहीं। विस्तार [बारहवां भाव और विदेश](/blog/12th-house-foreign-settlement-astrology-hindi) में है।',
    ],
  },
  {
    id: 'kamzor-chautha-bhaav',
    h2: 'कमज़ोर चौथा भाव अच्छा क्यों माना जाता है',
    paras: [
      'यह इस कैलकुलेटर का सबसे उल्टा दिखने वाला नियम है, और इसे छुपाया नहीं जाता — परिणाम में साफ लिखा आता है। **इस एक ब्लॉक में कम ताकत पर ज़्यादा अंक मिलते हैं।**',
      'तर्क सीधा है। **चौथा भाव घर, माता, जड़ें और मातृभूमि है।** बहुत मजबूत चौथा भाव व्यक्ति को अपनी जगह से **बाँध देता है** — वह जाना ही नहीं चाहता, और अगर चला भी जाए तो लौट आता है। विदेश में बसने के लिए उस पकड़ का **ढीला** होना चाहिए। यह कमी नहीं, एक स्थिति है।',
      'और यहीं वह बात है जो सबसे कम कही जाती है: **मजबूत चौथा भाव होना बुरी खबर नहीं है।** इसका अर्थ अक्सर यह होता है कि व्यक्ति अपने देश में ही जड़ें जमाकर सुखी रहेगा — जो अपने आप में एक अच्छा जीवन है। विदेश योग कम आना असफलता नहीं, एक अलग रास्ता है। भाव-दर-भाव विवरण [विदेश के भाव](/blog/houses-foreign-settlement-astrology-reference-hindi) में है।',
    ],
  },
  {
    id: 'rahu-ketu',
    h2: 'राहु और केतु — सीमा पार करने के कारक',
    paras: [
      '**राहु विदेश योग का सबसे प्रबल एकल संकेत है।** राहु का अर्थ है वह जो अपना नहीं — अनजान, बाहरी, परंपरा से परे। इसीलिए सीमा पार करने का कारक राहु को ही माना जाता है, किसी और ग्रह को नहीं।',
      'शुभ मानी जाने वाली स्थितियाँ: **राहु का पहले, तीसरे, सातवें, नवम, दशम या बारहवें भाव में होना।** और **राहु-चंद्र का सम्बन्ध** विशेष रूप से देखा जाता है, क्योंकि वह मन का झुकाव ही दूर देश की ओर मोड़ देता है — व्यक्ति को अपनी जगह में बेचैनी महसूस होती है, और वही बेचैनी अक्सर पहला कदम बनती है।',
      '**केतु उल्टी दिशा में काम करता है**, और यह जानना उपयोगी है। केतु वैराग्य और अलगाव का कारक है — वह जोड़ता नहीं, काटता है। चौथे भाव पर केतु का प्रभाव जड़ों से लगाव कम करता है, जो विदेश के लिए सहायक माना जाता है; पर बारहवें पर केतु अक्सर भौतिक प्रवास के बजाय आध्यात्मिक दिशा देता है। पूरा विश्लेषण [राहु-केतु और विदेश](/blog/rahu-ketu-foreign-settlement-astrology-hindi) में है।',
    ],
  },
  {
    id: 'navam-bhaav',
    h2: 'नवम भाव — लंबी यात्रा, भाग्य और उच्च शिक्षा',
    paras: [
      '**नवम भाव लंबी यात्रा, भाग्य, उच्च शिक्षा और गुरु का भाव है** — और विदेश योग में यह बारहवें के बाद दूसरा सबसे महत्वपूर्ण है।',
      'शास्त्र में नवम भाव को उन यात्राओं से जोड़ा गया है जो व्यक्ति को अपने क्षेत्र से **दूर** ले जाती हैं, और ऐतिहासिक रूप से वे यात्राएँ ज्ञान की खोज में होती थीं। आज का सबसे आम विदेश-मार्ग — **पढ़ाई के लिए जाना** — ठीक उसी वर्णन पर बैठता है। इसीलिए प्रबल नवम भाव वाले चार्ट में विदेश अक्सर शिक्षा के रास्ते खुलता है।',
      'नवम और बारहवें का **आपसी सम्बन्ध** सबसे प्रबल संयोजनों में से है — नवमेश बारहवें में, या बारहवेश नवम में। ऐसे चार्ट में विदेश केवल जाना नहीं, **भाग्य का हिस्सा** माना जाता है। विस्तार [नवम भाव और विदेश](/blog/9th-house-foreign-settlement-astrology-hindi) में।',
    ],
  },
  {
    id: 'dasamsa-drishti',
    h2: 'दशांश (D-10) और दृष्टि से पुष्टि',
    paras: [
      'राशि चार्ट अकेला अधूरा है, और यह वह हिस्सा है जो ज़्यादातर मुफ्त टूल छोड़ देते हैं। यह कैलकुलेटर **दशांश (D-10)** और **डिग्री-आधारित दृष्टि** से भी पुष्टि लेता है।',
      '**दशांश कर्म और आजीविका का वर्ग है** — शास्त्र में करियर वहीं से पढ़ा जाता है, जैसे विवाह नवमांश से। इसलिए अगर विदेश का रास्ता नौकरी या व्यवसाय से खुलना है, तो उसकी पुष्टि D-10 में मिलनी चाहिए। राशि चार्ट में योग दिखे पर दशांश उसका समर्थन न करे — तो योग कमज़ोर माना जाता है।',
      '**दृष्टि** को डिग्री के हिसाब से गिना जाता है, पूरे भाव के मोटे हिसाब से नहीं। BPHS की स्फुट दृष्टि में हर दृष्टि की **तीव्रता** होती है (60 विरूप = पूर्ण दृष्टि), इसलिए "शनि की दृष्टि है" कहना अधूरा है — कितनी है, यह मायने रखता है। सारे वर्ग चार्ट [दशांश और वर्ग कुंडली](/blog/divisional-charts-foreign-settlement-astrology-hindi) में समझाए गए हैं।',
    ],
  },
  {
    id: 'dasha-samay',
    h2: 'योग है, पर समय कब आएगा — दशा का हिस्सा',
    paras: [
      'यह वह अंतर है जो सबसे ज़्यादा उलझन मिटाता है: **योग का कुंडली में होना अलग बात है, और उसका समय आना अलग।**',
      'योग जीवन भर एक जैसा रहता है — वह जन्म कुंडली में है। पर वह **सक्रिय** तभी होता है जब सम्बन्धित ग्रह की दशा चले। अगर अभी **बारहवें के स्वामी, नवम के स्वामी या राहु** की महादशा या अंतर्दशा चल रही है, तो खिड़की खुली है। नहीं चल रही, तो योग फिर भी है — बस समय अभी नहीं आया, और यह परिणाम में साफ लिखा जाता है।',
      'इसीलिए बहुत से लोग जिनका योग प्रबल है, वे तीस-पैंतीस की उम्र तक कहीं नहीं जाते — और फिर अचानक सब कुछ एक साल में हो जाता है। वह अचानक नहीं था; वह दशा का बदलना था। अपनी चल रही दशा [दशा कैलकुलेटर](/calculators/free-dasha-calculator) से मुफ्त देखिए, और समय का पूरा विश्लेषण [दशा और गोचर का समय](/blog/dasha-transit-foreign-settlement-astrology-hindi) में है।',
    ],
  },
  {
    id: 'kis-desh',
    h2: 'किस देश में बसूंगा — और यह सवाल क्यों गलत है',
    paras: [
      'सीधा और असहज जवाब: **कुंडली से किसी एक देश का नाम निकालना ईमानदारी से मुमकिन नहीं है।** न शास्त्र में देशों की सूची है, न कोई ऐसा नियम जो "कनाडा" और "ऑस्ट्रेलिया" में फर्क कर सके। जो टूल या ज्योतिषी सीधा देश बता दे, वह अनुमान बेच रहा है — और यह बात हमारे अपने व्यापार के खिलाफ जाती है, फिर भी सच है।',
      'जो **सचमुच** निकाला जा सकता है वह **दिशा** है। परंपरा में हर राशि और तत्व को एक दिशा से जोड़ा गया है, और बारहवें भाव व उसके स्वामी की राशि से एक मोटा संकेत मिलता है — पूर्व, पश्चिम, उत्तर या दक्षिण। यह देश नहीं बताता, पर दिशा बताता है, और वह ईमानदार सीमा है।',
      'ज़्यादा उपयोगी वह है जो यह कैलकुलेटर देता है: **कौन सा रास्ता खुला है** — नौकरी, पढ़ाई, शादी या व्यापार। यह देश से कहीं ज़्यादा काम की जानकारी है, क्योंकि इसी पर आप योजना बना सकते हैं। पूरा तर्क [मैं किस देश में बसूंगा?](/blog/which-country-foreign-settlement-astrology-hindi) में है।',
    ],
  },
  {
    id: 'chaar-raste',
    h2: 'चार रास्ते — नौकरी, पढ़ाई, शादी और व्यापार',
    paras: [
      'परिणाम में **चार रास्ते अलग-अलग स्कोर** के साथ आते हैं, और हर एक की अपनी वजह होती है। ये ग्रहों के कारकत्व से निकलते हैं, किसी सामान्य सूची से नहीं।',
      '**पढ़ाई** — गुरु और बुध, नवम भाव के साथ; यह सबसे आम आधुनिक रास्ता है। **नौकरी** — शनि, दशम भाव और दशांश; धीमा पर स्थिर। **शादी** — शुक्र, सप्तम भाव और राहु का उससे सम्बन्ध; इसका अलग विश्लेषण [Foreign Spouse Calculator](/calculators/free-foreign-spouse-calculator) में है। **व्यापार** — बुध, तृतीय और एकादश भाव।',
      'यह जानकारी इसलिए काम की है क्योंकि **लोग अक्सर गलत दरवाज़े पर ज़ोर लगाते हैं।** जिस चार्ट में पढ़ाई का रास्ता प्रबल है और नौकरी का कमज़ोर, वहाँ सीधे जॉब वीज़ा के पीछे वर्षों लगाना महंगा पड़ता है — जबकि पढ़ाई का रास्ता खुला पड़ा है। स्कोर यही बताता है: **किस दरवाज़े पर धक्का देना है।**',
    ],
  },
  {
    id: 'visa-pr',
    h2: 'वीज़ा और PR — ज्योतिष क्या नहीं बता सकता',
    paras: [
      'यह साफ कहना ज़रूरी है, और यह परिणाम में भी लिखा है: **यह Yog Strength Score है, वीज़ा भविष्यवाणी नहीं।**',
      'कुंडली से **नहीं** निकाला जा सकता: वीज़ा लगेगा या नहीं, PR कब मिलेगा, कौन सी एजेंसी सही है, या किस तारीख को आवेदन करना चाहिए। **वीज़ा कानून, कागज़ात और उस देश की नीति से मिलता है** — और वह नीति हर साल बदलती है, कुंडली से स्वतंत्र रूप से। इसे किसी कानूनी या इमिग्रेशन सलाह का विकल्प न समझें।',
      'ज्योतिष जो कर सकता है वह दो चीजें हैं, और दोनों वास्तविक हैं: **कौन सा रास्ता आपके चार्ट में सहारा पाता है**, और **कौन सी अवधि अपेक्षाकृत अनुकूल है**। बाकी मेहनत, कागज़ात और परिस्थिति है। वीज़ा-PR पर ज्योतिषीय बनाम कानूनी हकीकत [वीज़ा, PR और ग्रीन कार्ड ज्योतिष](/blog/visa-pr-green-card-foreign-settlement-astrology-hindi) में अलग से खोली गई है।',
    ],
  },
  {
    id: 'score-kam-aaya',
    h2: 'योग कमज़ोर आया — अब क्या करें',
    paras: [
      'पहले वह बात जो सबसे ज़्यादा राहत देती है: **कम स्कोर का मतलब "आप विदेश नहीं जा सकते" नहीं है।** इसका मतलब इतना है कि शास्त्रीय विदेश-संयोजन आपके चार्ट में प्रमुख नहीं हैं। बहुत से लोग सामान्य योग के साथ वर्षों विदेश में काम करके लौट आते हैं — और वह भी एक पहचानी हुई स्थिति है।',
      'दूसरा — **ब्लॉक देखिए, कुल नहीं।** अगर बारहवां और राहु मजबूत हैं पर दशा अभी अनुकूल नहीं, तो योग है और समय नहीं आया; यह बिल्कुल अलग स्थिति है उससे जहाँ बारहवां ही कमज़ोर हो। परिणाम में यह अंतर साफ लिखा आता है।',
      'और तीसरा — **कोई उपाय आपका चार्ट नहीं बदलता।** जो कोई कहे "यह पूजा करवा लीजिए, विदेश का रास्ता खुल जाएगा" और सामने बड़ी राशि रख दे, वह आपकी उम्मीद बेच रहा है। जो सचमुच काम आता है वह है सही दरवाज़े का चुनाव और सही समय — और वह दोनों ऊपर के परिणाम में मुफ्त हैं। पूरी कुंडली का विश्लेषण चाहिए तो [कार्मिक बैकग्राउंड रीडिंग](/karmic-background-reading) देखिए, या सारे विकल्प [प्राइसिंग](/pricing) पर हैं।',
    ],
  },
];

type FstLink = { href: string; label: string; note: string };

const HUB_HI: FstLink[] = [
  { href: '/blog/foreign-settlement-yoga-complete-guide-hindi', label: 'विदेश योग — पूरी गाइड', note: 'यहाँ से शुरू करें' },
  { href: '/blog/12th-house-foreign-settlement-astrology-hindi', label: 'बारहवां भाव और विदेश', note: 'सबसे भारी हिस्सा' },
  { href: '/blog/9th-house-foreign-settlement-astrology-hindi', label: 'नवम भाव और विदेश', note: 'लंबी यात्रा और भाग्य' },
  { href: '/blog/rahu-ketu-foreign-settlement-astrology-hindi', label: 'राहु-केतु और विदेश', note: 'सबसे प्रबल संकेत' },
  { href: '/blog/houses-foreign-settlement-astrology-reference-hindi', label: 'विदेश के भाव — संदर्भ', note: 'भाव-दर-भाव' },
  { href: '/blog/planets-foreign-settlement-astrology-reference-hindi', label: 'विदेश के ग्रह — संदर्भ', note: 'शनि, चंद्र, गुरु, शुक्र' },
  { href: '/blog/divisional-charts-foreign-settlement-astrology-hindi', label: 'दशांश और वर्ग कुंडली', note: 'D-10 से पुष्टि' },
  { href: '/blog/dasha-transit-foreign-settlement-astrology-hindi', label: 'दशा और गोचर का समय', note: 'कब — असली सवाल' },
  { href: '/blog/visa-pr-green-card-foreign-settlement-astrology-hindi', label: 'वीज़ा, PR, ग्रीन कार्ड', note: 'योग बनाम कानून' },
  { href: '/blog/which-country-foreign-settlement-astrology-hindi', label: 'किस देश में बसूंगा?', note: 'ईमानदार जवाब' },
  { href: '/blog/foreign-settlement-yoga-diagnostic-hindi', label: 'क्या मेरे पास विदेश योग है?', note: 'मुफ्त निदान' },
  { href: '/blog/sapne-mein-videsh-jana-videshi-shaadi-ka-matlab', label: 'सपने में विदेश जाना', note: 'स्वप्न शास्त्र' },
];

const HUB_EN: FstLink[] = [
  { href: '/blog/foreign-settlement-yoga-complete-guide', label: 'Foreign Settlement Yoga', note: 'The complete guide' },
  { href: '/blog/houses-foreign-settlement-astrology-reference', label: 'Houses reference', note: '1st, 3rd, 4th, 9th, 10th, 12th' },
  { href: '/blog/rahu-ketu-foreign-settlement-astrology', label: 'Rahu Ketu and foreign settlement', note: 'The strongest indicator' },
  { href: '/blog/divisional-charts-foreign-settlement-astrology', label: 'Divisional charts', note: 'Why D-10 confirms career routes' },
  { href: '/blog/which-country-foreign-settlement-astrology', label: 'Which country will I settle in?', note: 'What astrology can honestly say' },
  { href: '/blog/foreign-spouse-marriage-settlement-astrology', label: 'Foreign Spouse Astrology', note: 'Settlement through marriage' },
];

function FstRich({ text, k }: { text: string; k: string }) {
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

function FstHub({ items }: { items: FstLink[] }) {
  return (
    <ul className="space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold" style={{ color: GOLD }}>{i.label}</span>
            <span className="block text-xs" style={{ color: '#64748b' }}>{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function FreeForeignSettlementCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-foreign-settlement-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: "Foreign Settlement Astrology Calculator — Videsh Yog by Date of Birth",
    description: "Free foreign settlement astrology calculator. Get your Videsh Yog score from your Kundali with the reason behind every point — 12th house, Rahu, 9th house, Shadbala and Dasha. By Trikaal Vaani.",
    breadcrumbName: "Foreign Settlement Calculator",
    aboutEntities: ["Foreign Settlement Astrology", "12th House", "Rahu", "Videsh Yog", "Shadbala", "Vimshottari Dasha"],
    knowsAbout: ["Vedic Astrology", "Jyotish Shastra", "Shadbala", "Foreign Settlement Astrology", "Rahu"],
    howToName: "How to check your foreign settlement yog from your Kundali",
    howToSteps: [{"name": "Enter birth details", "text": "Enter your date, exact time and place of birth."}, {"name": "The chart is computed", "text": "Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali with full Shadbala, the Dasamsa D-10 and degree-precise drishti."}, {"name": "Read the reasons", "text": "Every rule shows its points and the figure behind them — the 12th lord and its Shadbala, where Rahu sits, and how tightly the 4th house holds you home."}],
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
            <span style={{ color: '#94a3b8' }}>Foreign Settlement Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>Videsh Settlement Yog Calculator</h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>Videsh mein basne ka yog aapki Kundali se — 12th house, Rahu aur Dasha, har point ki wajah ke saath.</p>
          </header>

          <section className="rounded-xl p-4 mb-6" style={{ background: 'rgba(212,175,55,0.06)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              Videsh yog sirf Rahu se nahi banta. 12th house door desh ka ghar hai, 9th lambi yatra ka, aur 4th house wo hai jo aapko apni mitti se baandhta hai. Is calculator mein ek niyam ulta chalta hai — kamzor 4th house videsh ke liye behtar hai — aur wo aapko saaf bataya jayega, chhupaya nahi.
            </p>
          </section>

          <YogCalculator config={{
            type: 'foreign-settlement',
            scoreLabel: "Videsh Yog Score",
            breakdownHeading: "Har point ki wajah",
            secondaryHeading: "Kaunsa raasta khula hai",
            ctaHref: '/#birth-form',
            ctaLabel: "Mera Videsh Yog dekho",
            ctaPrice: '₹51',
            ctaBlurb: "Ye report sirf videsh ka yog dekhti hai. Trikaal Ka Sandesh aapki poori kundali padhta hai — career, paisa, shaadi, sehat — sabka samay aur upay ek saath.",
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
                    <FstRich text={p} k={`${sec.id}-${i}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* ═══ v2.0: the 36-post cluster this page was cut off from ═══ */}
          <section className="rounded-2xl p-5 md:p-6 mb-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>विदेश योग — पूरा गाइड</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Har vishay par alag vistrit lekh — hindi aur angrezi dono mein. Sabse pehle 12th house aur Dasha wale padhiye.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>हिंदी में</h3>
                <FstHub items={HUB_HI} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>In English</h3>
                <FstHub items={HUB_EN} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl p-5" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Aur padhein</h2>
            <ul className="text-sm space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
              <li><Link href="/foreign-settlement" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Foreign Settlement Astrology — poora guide</Link></li>
              <li><Link href="/calculators/free-foreign-spouse-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Foreign Spouse Yog Calculator</Link></li>
              <li><Link href="/calculators/free-ias-astrology-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">IAS Astrology Calculator</Link></li>
              <li><Link href="/calculators/free-kundali-calculator" style={{ color: '#94a3b8' }} className="hover:text-slate-200">Free Kundali Calculator</Link></li>
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
