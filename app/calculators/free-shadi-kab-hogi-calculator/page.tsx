'use client';

// ============================================================
// File: app/calculators/free-shadi-kab-hogi-calculator/page.tsx
// Version: v1.0 — Vivah Yog Calculator (3 Sep 2026)
// API: /api/calc/yog  (type: 'vivah')  · Engine: lib/vivah-engine.ts
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ------------------------------------------------------------
// SLUG vs TITLE — these deliberately say different things.
//   Rohiit chose the slug free-shadi-kab-hogi-calculator on 3 Sep 2026.
//   Radar backs it: "Date of birth se kaise jane shadi kab hogi" is the most
//   frequent question in the whole marriage set (5 sightings), plus
//   "Shadi kab hogi Kundali Free", "Meri shadi kab hogi by date of birth",
//   "Shadi kab hogi kaise pata kare Online".
//   But the TITLE and H1 keep "Vivah Yog", because GSC shows this site
//   ALREADY ranking without a tool: marriage yoga in kundali 14 impressions
//   at 9.93, marriage yoga in astrology 12, marriage yog in astrology 11,
//   vivah yog 6, vivaha yoga 4. Throwing that away to chase the slug phrase
//   would be trading a real position for a hoped-for one. One page earns both.
//
// CANNIBALISATION GUARD — DO NOT BREAK
//   /learn/why-is-my-marriage-delayed earns 173 impressions at position 6.75.
//   This page must NOT chase "why is my marriage delayed" in its title, H1 or
//   metadata. Delay is covered here as one section among many and the phrase
//   belongs to that page; it is linked, not competed with.
//   /vivah-muhurat is a different product entirely — muhurat is the auspicious
//   DATE TO HOLD a wedding, this is WHEN the yog activates. Cross-linked.
//
// FOUR LINES THAT ARE NOT NEGOTIABLE, enforced in lib/vivah-engine.ts and
// again in lib/vivah-summary.ts:
//   1. Never "shadi nahi hogi". This measures delay, and delay is not refusal.
//   2. No divorce, separation or widowhood. The texts carry rules; we do not
//      publish them. They sell through fear to frightened people.
//   3. No caste, community, religion or country of the spouse.
//   4. No sex of the spouse.
// ============================================================

import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';
import YogCalculator from '@/components/calculators/YogCalculator';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Inline markdown: **bold** and [text](/href) ──────────────────────────────
function renderRich(text: string, keyBase: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link
          key={`${keyBase}-l-${i}`}
          href={link[2]}
          style={{ color: GOLD }}
          className="font-semibold underline underline-offset-2 hover:opacity-80 transition"
        >
          {link[1]}
        </Link>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyBase}-b-${i}`} style={{ color: GOLD }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyBase}-t-${i}`}>{part}</span>;
  });
}

type PillarSection = { id: string; h2: string; paras: string[] };

// ============================================================
// Every heading below is a keyword Google itself suggested — Radar PAA/PASF
// (clusters compat-marriage-timing and calc-foreign, 30 Aug 2026) or the GSC
// export of 3 Sep 2026. None were invented.
// ============================================================
const PILLAR: PillarSection[] = [
  {
    id: 'shadi-kab-hogi',
    h2: 'Date of birth से कैसे जाने शादी कब होगी?',
    paras: [
      'शादी का समय कुंडली के **सप्तम भाव, सप्तमेश, कलत्र कारक और नवमांश (D-9)** से पढ़ा जाता है — और उसका *समय* विंशोत्तरी दशा से निकलता है। सिर्फ़ जन्मतिथि काफ़ी नहीं है; जन्म का समय और स्थान भी चाहिए, क्योंकि लग्न बदलते ही सप्तम भाव बदल जाता है।',
      'शास्त्र इसे दो हिस्सों में देखता है, और यही फ़र्क़ ज़्यादातर जगह छूट जाता है। पहला — **योग है या नहीं**, यानी कुंडली में विवाह के शास्त्रीय संयोग कितने और कितने मज़बूत हैं। दूसरा — **वह कब सक्रिय होगा**, यानी कौन सी महादशा-अंतर्दशा उसे चलाएगी। योग जन्म से मौजूद रहता है; दशा उसे खोलती है।',
      'ऊपर वाला कैलकुलेटर दोनों करता है — 100 में बल का स्कोर, और उसके साथ **असली तारीख़ों की खिड़कियाँ** आपकी अपनी दशा से। हर अंक के साथ उसकी वजह भी दी जाती है, असली आँकड़े के साथ।',
    ],
  },
  {
    id: 'calculator-kaise-kaam-karta-hai',
    h2: 'Vivah Yog Calculator kaam kaise karta hai — saat blocks',
    paras: [
      'Aapki janm-kundali Swiss Ephemeris se banti hai (Lahiri Ayanamsha), phir saat blocks par 100 mein score banta hai: **saptam bhava 22, Navamsa D-9 24, kalatra karak 18, Darakaraka 8, drishti 12, baadhaayein 10, dasha 6.**',
      'Har block apne andar 2-3 niyam chalata hai, aur har niyam apna ank dene ke saath uski wajah bhi likhta hai — asli number ke saath. Isliye result mein "Shukra mazboot hai" nahi milta; milta hai "Shukra ki Shadbala 1.29, aur uski drishti aapke 7th house par 37.46 virupas ki hai".',
      'Score alag se likha hi nahi jaata — wo niyamon ke ankon ka jod hota hai. Iska matlab ye hai ki score aur uski wajah kabhi ek doosre se alag nahi ho sakte.',
    ],
  },
  {
    id: 'saptam-bhava',
    h2: 'सप्तम भाव — विवाह का घर और उसका स्वामी',
    paras: [
      'सप्तम भाव को शास्त्र में **कलत्र भाव** कहा गया है। जीवनसाथी, साझेदारी और दांपत्य — तीनों इसी भाव से देखे जाते हैं। विवाह योग की पहली परत यही है।',
      'यहाँ तीन बातें अलग-अलग मायने रखती हैं। **सप्तम भाव में कौन बैठा है** — गुरु, शुक्र, बुध या चंद्र भाव को बल देते हैं; शनि, राहु, केतु या मंगल दबाव बनाते हैं। **सप्तमेश किस भाव में है** — केंद्र या त्रिकोण में हो तो फल देता है, षष्ठ-अष्टम-द्वादश में हो तो देर से। और **सप्तमेश कितना बलवान है**, जो षड्बल से नापा जाता है।',
      'खाली सप्तम भाव बुरा नहीं होता। खाली भाव का मतलब है कि अब पूरा फल सप्तमेश और कलत्र कारक पर आ गया — और वे दोनों नीचे अलग से गिने जाते हैं।',
    ],
  },
  {
    id: 'vivah-yog-in-kundli',
    h2: 'Vivah yog in kundli — कुंडली में विवाह योग कैसे बनता है',
    paras: [
      'विवाह योग तब प्रबल कहा जाता है जब **सप्तम भाव, सप्तमेश और कलत्र कारक — तीनों शुभ प्रभाव में हों और पाप ग्रहों की दृष्टि से मुक्त हों**, और नवमांश भी इसकी पुष्टि करे।',
      'व्यवहार में शुद्ध योग दुर्लभ है। ज़्यादातर कुंडलियाँ मिश्रित होती हैं — कहीं शुक्र बलवान है पर सप्तम पर शनि की दृष्टि है, कहीं सप्तमेश अच्छा है पर नवमांश साथ नहीं दे रही। इसीलिए यह कैलकुलेटर हाँ/ना नहीं देता, **बल का स्कोर** देता है।',
      'यह अंतर मायने रखता है। हाँ/ना देने वाला टूल या तो झूठी तसल्ली देगा या बेवजह डरा देगा। बल का स्कोर बताता है कि योग है, कितना है, कब खुलेगा और रास्ते में क्या है।',
    ],
  },
  {
    id: 'navamsa-d9',
    h2: 'नवमांश (D-9) कुंडली — विवाह की अपनी कुंडली',
    paras: [
      '**बृहत् पाराशर होरा शास्त्र विवाह का निर्णय नवमांश से करता है।** राशि चक्र वादा दिखाता है; नवमांश उस वादे की पुष्टि करता है। यही इस कैलकुलेटर का सबसे भारी हिस्सा है — 100 में से 24 अंक।',
      'इसमें तीन चीज़ें देखी जाती हैं — **नवमांश लग्न और उसका स्वामी**, **नवमांश का सप्तम भाव** (यानी विवाह के भीतर का विवाह, जो दांपत्य सुख दिखाता है), और **राशि का सप्तमेश नवमांश में कहाँ गया**।',
      'जब राशि चक्र और नवमांश दोनों एक ही जवाब दें, तब संकेत सबसे भरोसेमंद होता है। और जब दोनों अलग-अलग कहें, तब भी वह जानकारी है — इसका मतलब है कि वादा है पर उसे सहारा कम मिल रहा है।',
    ],
  },
  {
    id: 'kalatra-karak',
    h2: 'विवाह का कारक ग्रह कौन सा है — शुक्र या गुरु?',
    paras: [
      'दोनों — पर **अलग-अलग लोगों के लिए**। शास्त्र में **शुक्र पत्नी का कारक** है और **गुरु पति का**। इसलिए पुरुष की कुंडली में विवाह शुक्र से पढ़ा जाता है और स्त्री की कुंडली में गुरु से।',
      'यही वजह है कि इस कैलकुलेटर में **gender ज़रूरी** रखा गया है, जबकि बाकी कैलकुलेटरों में वह वैकल्पिक है। यहाँ gender सजावट नहीं है — वह बदल देता है कि कौन सा ग्रह पढ़ा जाएगा, और इसलिए पूरा नतीजा बदल जाता है।',
      'यह बारीकी लगभग हर मुफ़्त टूल छोड़ देता है। वे सबके लिए शुक्र पढ़ते हैं, जो आधी आबादी के लिए ग़लत कारक है।',
    ],
  },
  {
    id: 'darakaraka',
    h2: 'Darakaraka — जैमिनी का जीवनसाथी कारक क्या होता है',
    paras: [
      '**दाराकारक वह ग्रह है जिसके अंश सात ग्रहों में सबसे कम हों।** जैमिनी पद्धति में यह चर कारक है — यानी हर कुंडली में बदलता है, जबकि शुक्र और गुरु स्थिर कारक हैं।',
      'सप्त-कारक क्रम है: आत्मकारक, अमात्यकारक, भ्रातृकारक, मातृकारक, पुत्रकारक, ज्ञातिकारक, **दाराकारक**। सबसे कम अंश वाला ग्रह जीवनसाथी का कारक बनता है — यह उल्टा लगता है, पर जैमिनी की पूरी पद्धति इसी क्रम पर खड़ी है।',
      'कैलकुलेटर दाराकारक की दो चीज़ें देखता है: उसका अपना बल और स्थिति, और **दाराकारक से सप्तम भाव** — क्योंकि जैमिनी में कारक से सप्तम वही काम करता है जो लग्न से सप्तम।',
    ],
  },
  {
    id: 'meri-shadi-kab-hogi',
    h2: 'मेरी शादी कब होगी — दशा की खिड़की कैसे निकलती है',
    paras: [
      'योग कुंडली में जन्म से मौजूद रहता है — वह बनता नहीं, **सक्रिय होता है**। सक्रिय करने का काम दशा और गोचर करते हैं, और यही "कब" का असली जवाब है।',
      'तीन चीज़ें मिलकर सबसे मज़बूत खिड़की बनाती हैं: **सप्तमेश, कलत्र कारक या दाराकारक की महादशा-अंतर्दशा**; **कारक ग्रह का सप्तम भाव से गोचर या उस पर दृष्टि**; और उस समय सप्तम भाव पर पाप दबाव का कम होना।',
      'पेड रिपोर्ट में यह तारीख़ों की टेबल के रूप में आता है, आपकी अपनी विंशोत्तरी दशा से — अंदाज़े से नहीं। अपनी दशा अलग से देखनी हो तो [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) है।',
    ],
  },
  {
    id: 'marriage-age',
    h2: 'Marriage age prediction by date of birth — किस उम्र में?',
    paras: [
      'उम्र का जवाब जादू से नहीं आता — वह **गणित से** आता है। कैलकुलेटर आपकी पहली अनुकूल दशा खिड़की लेता है और उसे आपकी उम्र में बदल देता है। यानी "26–29 की उम्र के बीच" जैसा range, तारीख़ नहीं।',
      'एक ज़रूरी बात: अगर वह खिड़की निकल जाए तो योग **ख़त्म नहीं होता**। वह अगली खिड़की का इंतज़ार करता है। शास्त्र में विलंब है, समाप्ति नहीं — और यह फ़र्क़ इस विषय पर सबसे ज़्यादा मायने रखता है।',
      'अगर आपकी अनुकूल दशा अभी चल रही है, तो टेबल में तारीख़ **आज से** शुरू दिखेगी, उस दशा के पुराने आरंभ से नहीं। बीता हुआ हिस्सा आपके किसी काम का नहीं है।',
    ],
  },
  {
    id: 'late-marriage',
    h2: 'Late marriage age in astrology — देर के शास्त्रीय कारण',
    paras: [
      'ज्योतिष में देरी के **चार सबसे आम कारण** हैं: सप्तम भाव या सप्तमेश पर शनि का प्रभाव; मंगल दोष; सप्तमेश का अस्त (सूर्य के बहुत पास) होना; और कारक ग्रह का षष्ठ, अष्टम या द्वादश भाव में जाना।',
      'चारों में एक बात साझा है — **इनमें से कोई भी इनकार नहीं है**। शनि मना नहीं करता, समय लंबा कर देता है। अस्त ग्रह का योग मौजूद रहता है पर दबा रहता है, जब तक उसकी दशा न आए।',
      'देरी की वजह अपनी कुंडली में विस्तार से पढ़नी हो तो [विवाह में देरी क्यों](/learn/why-is-my-marriage-delayed) वाला गाइड घर-दर-घर यही खोलता है।',
    ],
  },
  {
    id: 'shani-saptam',
    h2: 'शनि सप्तम भाव में — देरी का सबसे बड़ा अकेला कारण',
    paras: [
      'शनि सप्तम भाव में हो तो शास्त्र उसे **विलंब** का सीधा संकेत मानता है, अस्वीकार का नहीं। शनि का स्वभाव ही यही है — वह मना नहीं करता, परिपक्वता माँगता है।',
      'व्यवहार में इसका सबसे आम रूप यह होता है कि विवाह अपेक्षा से देर से होता है, अक्सर तब जब जीवन के बाकी हिस्से स्थिर हो चुके हों। कई मामलों में यह देरी बाद में लाभ जैसी लगती है, हालाँकि उस समय भारी लगती है।',
      'शनि की दृष्टि भी उतनी ही मायने रखती है जितनी स्थिति। कैलकुलेटर दृष्टि को डिग्री-सटीक विरुपा में नापता है — इसलिए आपको "शनि की दृष्टि है" नहीं, "शनि की दृष्टि 38.4 विरुपा की है" मिलता है।',
    ],
  },
  {
    id: 'mangal-dosh',
    h2: 'मंगल दोष और विवाह — कितना बड़ा रोड़ा है?',
    paras: [
      'मंगल दोष तब बनता है जब **मंगल लग्न से 1, 4, 7, 8 या 12वें भाव में हो**। कैलकुलेटर इसे एक अलग नियम की तरह गिनता है, और मिलने पर उसका उपाय भी अलग श्रेणी का बताता है।',
      'पर एक बात साफ़ रहे: मंगल दोष **रुकावट है, अशुभ फल की घोषणा नहीं**। शास्त्र ख़ुद इसके निवारण के नियम देता है, और कई स्थितियों में यह अपने आप भंग हो जाता है।',
      'पूरा हिसाब [मांगलिक दोष कैलकुलेटर](/calculators/free-manglik-dosh-calculator) अलग से करता है, और यह क्यों उतना डरावना नहीं जितना बताया जाता है, वह [मांगलिक और गैर-मांगलिक विवाह](/blog/manglik-non-manglik-marriage) में है।',
    ],
  },
  {
    id: 'love-ya-arranged',
    h2: 'Love marriage yog in kundli — प्रेम विवाह या अरेंज?',
    paras: [
      'शास्त्र में यह **पंचम और सप्तम भाव के रिश्ते** से देखा जाता है। पंचम प्रेम का भाव है, सप्तम विवाह का। जब दोनों के स्वामी आपस में जुड़ें — युति, दृष्टि या परिवर्तन से — तब प्रेम विवाह का योग कहा जाता है।',
      'इसमें शुक्र, राहु और पंचमेश की भूमिका सबसे बड़ी होती है। राहु का जुड़ाव अक्सर परंपरा से हट कर हुए विवाह में देखा गया है, हालाँकि यह अकेला पर्याप्त संकेत नहीं है।',
      'यह कैलकुलेटर विवाह के **समय** पर केंद्रित है, प्रेम बनाम अरेंज पर नहीं। वह अलग सवाल है और [प्रेम विवाह का योग](/learn/will-i-have-love-marriage) उसे अलग से खोलता है।',
    ],
  },
  {
    id: 'naam-se',
    h2: 'नाम से जाने शादी कब होगी — क्या यह संभव है?',
    paras: [
      'नहीं। **नाम से विवाह का समय निकालने की कोई शास्त्रीय पद्धति नहीं है।** नामाक्षर का उपयोग नक्षत्र-आधारित नामकरण में होता है — यानी उल्टी दिशा में, जन्म से नाम की ओर, नाम से भविष्य की ओर नहीं।',
      'जो साइटें नाम से भविष्यवाणी देती हैं वे अंकशास्त्र का सरलीकृत रूप इस्तेमाल करती हैं, जो एक अलग विषय है और जिसका पाराशरी ज्योतिष से कोई संबंध नहीं।',
      'विवाह का समय दशा से निकलता है, और दशा जन्म के नक्षत्र से — यानी जन्म की तारीख़, समय और स्थान से। नाम उसमें कहीं आता ही नहीं।',
    ],
  },
  {
    id: 'sirf-dob',
    h2: 'क्या सिर्फ़ जन्मतिथि से शादी का समय पता चल सकता है?',
    paras: [
      'नहीं, और यह इस पूरे पेज की सबसे व्यावहारिक बात है। **जन्म का समय लग्न तय करता है, और लग्न बदलते ही सप्तम भाव बदल जाता है।** सप्तम भाव बदला तो सप्तमेश बदल गया, और पूरा विश्लेषण बदल गया।',
      'लग्न लगभग हर दो घंटे में बदलता है। इसलिए सिर्फ़ तारीख़ से किया गया विश्लेषण दिन में बारह अलग-अलग जवाब दे सकता है — और उनमें से ग्यारह ग़लत होंगे।',
      'समय ठीक-ठीक याद न हो तो 12:00 दोपहर मान लिया जाता है, पर तब परिणाम को अनुमान की तरह पढ़िए। जन्म स्थान भी ज़रूरी है, क्योंकि लग्न अक्षांश-देशांतर से निकलता है।',
    ],
  },
  {
    id: 'shadbala',
    h2: 'षड्बल क्या है और विवाह योग में इसका क्या काम है',
    paras: [
      '**षड्बल किसी ग्रह की असली ताक़त छह अलग मापों से नापता है** — स्थान बल, दिग् बल, काल बल, चेष्टा बल, नैसर्गिक बल और दृक् बल — और उसे उस ग्रह के अपने शास्त्रीय न्यूनतम के सामने तोलता है।',
      'अनुपात 1.00 का मतलब है ग्रह अपना पूरा फल देने की स्थिति में है। इसलिए कैलकुलेटर "शुक्र मज़बूत है" नहीं कहता; वह कहता है "शुक्र की षड्बल 1.29"। यही फ़र्क़ है अंदाज़े और गणना में।',
      'विवाह योग में षड्बल तीन जगह लगता है: सप्तमेश पर, कलत्र कारक पर, और नवमांश लग्नेश पर। अपने सभी ग्रहों का बल देखना हो तो [ग्रह बल कैलकुलेटर](/calculators/free-graha-bal-calculator) है।',
    ],
  },
  {
    id: 'drishti-virupa',
    h2: 'दृष्टि विरुपा में क्यों — "शनि की दृष्टि है" काफ़ी क्यों नहीं',
    paras: [
      'पारंपरिक तरीक़े में दृष्टि को हाँ/ना में देखा जाता है। शास्त्र इससे ज़्यादा बारीक है: **दृष्टि की ताक़त डिग्री के हिसाब से बदलती है, और उसे विरुपा में नापा जाता है, जहाँ 60 पूर्ण दृष्टि है।**',
      'व्यवहार में इसका मतलब यह है कि दो कुंडलियों में "शनि की सप्तम पर दृष्टि" हो सकती है, पर एक में वह 58 विरुपा की हो और दूसरी में 12 की। पहली में यह असली रुकावट है; दूसरी में नाम भर की।',
      'इसीलिए इस कैलकुलेटर में दृष्टि का ब्लॉक अंक भी विरुपा से देता है और वाक्य भी।',
    ],
  },
  {
    id: 'vivah-muhurat-farak',
    h2: 'विवाह योग और विवाह मुहूर्त में क्या फ़र्क़ है?',
    paras: [
      'यह दो अलग सवाल हैं और अक्सर आपस में मिला दिए जाते हैं। **विवाह योग** पूछता है — मेरी कुंडली में विवाह का संयोग कितना बलवान है और कब खुलेगा। **विवाह मुहूर्त** पूछता है — जो विवाह तय हो चुका है, उसे किस दिन और किस घड़ी करें।',
      'पहला आपकी अपनी कुंडली से आता है। दूसरा पंचांग से आता है और सबके लिए एक जैसा होता है — तिथि, नक्षत्र, योग, करण और लग्न के हिसाब से।',
      'यह पेज पहला सवाल हल करता है। दूसरे के लिए [मुफ्त विवाह मुहूर्त](/vivah-muhurat) अलग से है, जो खरमास, अधिक मास और चातुर्मास को सख़्ती से हटाता है।',
    ],
  },
  {
    id: 'kundali-milan-farak',
    h2: 'Kundali Milan और Vivah Yog — दोनों में क्या अंतर है?',
    paras: [
      'फिर से, दो अलग सवाल। **विवाह योग एक कुंडली का सवाल है** — आपकी। **कुंडली मिलान दो कुंडलियों का सवाल है** — आपकी और उनकी।',
      'योग बताता है कि विवाह का संयोग कब खुलेगा। मिलान बताता है कि जो रिश्ता सामने है वह कितना मेल खाता है — अष्टकूट गुण मिलान, मंगल दोष और नाड़ी के हिसाब से।',
      'क्रम आमतौर पर यही रहता है: पहले योग और समय, फिर जब रिश्ता आए तब मिलान। [कुंडली मिलान](/kundali-milan) उसी के लिए है, और उसकी पूरी विधि [कुंडली मिलान गाइड](/blog/kundli-matching-guide) में है।',
    ],
  },
  {
    id: 'shubh-sanket',
    h2: 'जल्दी शादी होने के लक्षण — कुंडली में क्या दिखता है',
    paras: [
      'कुंडली में जो दिखता है वह **संकेत** है, शगुन नहीं। सबसे स्पष्ट पाँच: सप्तम भाव में शुभ ग्रह; बलवान सप्तमेश केंद्र या त्रिकोण में; कारक ग्रह की सप्तम पर प्रबल दृष्टि; नवमांश का राशि चक्र से सहमत होना; और सप्तमेश या कारक की दशा का चलना।',
      'जब इनमें से तीन या अधिक एक साथ हों, स्कोर स्वाभाविक रूप से ऊपर आता है और खिड़की भी पास होती है।',
      'पर असली काम की बात यह नहीं है कि कितने मिले — असली बात यह है कि जो नहीं मिले, वे क्यों नहीं मिले। इसीलिए परिणाम में **क्या रोक रहा है** वाला हिस्सा अलग से आता है।',
    ],
  },
  {
    id: 'vivah-me-deri-ke-upay',
    h2: 'विवाह में देरी के उपाय — जो शास्त्र में सचमुच हैं',
    paras: [
      'शास्त्रीय उपाय **तीन श्रेणियों** में आते हैं, और तीनों का आधार अलग है: कलत्र कारक को बल देना; अपनी कुंडली के सप्तमेश को बल देना; और अगर मंगल दोष या शनि का दबाव हो तो उसकी अलग शांति।',
      'यही वजह है कि इंटरनेट पर मिलने वाला एक ही सामान्य उपाय सब पर काम नहीं करता। आपका सप्तमेश शनि हो सकता है और किसी और का बुध — दोनों के उपाय एक जैसे कैसे होंगे?',
      'पेड रिपोर्ट में **पाँच Trikaal Upay** आते हैं, आपकी अपनी कुंडली से चुने हुए — दो बृहत् पाराशर होरा शास्त्र से, दो कारक-पद्धति से, और एक सीधा आपके चार्ट की गणना से।',
    ],
  },
  {
    id: 'turant-shadi-ke-upay',
    h2: 'तुरंत शादी के उपाय — और इस शब्द की सच्चाई',
    paras: [
      'ईमानदार जवाब: **शास्त्र में "तुरंत" जैसी कोई श्रेणी नहीं है।** उपाय ग्रह को बल देते हैं; ग्रह अपनी गति से फल देते हैं। जो कोई तुरंत का वादा करे, वह शास्त्र नहीं बेच रहा।',
      'जो उपाय असल में हैं वे चार तरह के हैं — मंत्र, दान, व्रत और सेवा। इनका आधार ग्रह की स्थिति है, और इसीलिए वे हर कुंडली के लिए अलग होते हैं।',
      'और अगर कोई उपाय आपसे बड़ी रक़म, गोपनीयता या जल्दबाज़ी माँगे — तीनों में से कोई एक भी — तो वह उपाय नहीं है।',
    ],
  },
  {
    id: 'guru-gochar-vivah',
    h2: 'गुरु का गोचर और विवाह — साल भर की खिड़की',
    paras: [
      'गुरु हर बारह साल में एक बार आपके सप्तम भाव से गुज़रता है, और लगभग हर साल उस पर दृष्टि डाल सकता है। परंपरा में गुरु के इस गोचर को विवाह के लिए सबसे शुभ माना गया है।',
      'पर अकेला गोचर काफ़ी नहीं है। **गोचर सबके लिए एक जैसा होता है; दशा हर व्यक्ति की अपनी होती है।** जब दोनों मिलते हैं, तभी असली खिड़की बनती है — और यही कैलकुलेटर की टेबल दिखाती है।',
      'इसीलिए "इस साल इन राशियों की शादी होगी" जैसी सूचियाँ भ्रामक होती हैं। वे सिर्फ़ गोचर देखती हैं और आपकी दशा को छोड़ देती हैं।',
    ],
  },
  {
    id: 'rashi-se-vivah',
    h2: '2026 में किन राशियों की शादी होगी?',
    paras: [
      'यह सवाल बहुत खोजा जाता है, इसलिए सीधा जवाब: **सिर्फ़ राशि से विवाह का समय नहीं बताया जा सकता।** राशि का मतलब है दुनिया की बारह में से एक आबादी — उतने बड़े समूह के लिए एक जैसी भविष्यवाणी बेमानी है।',
      'राशिफल वाली सूचियाँ चंद्र राशि पर बनती हैं और गुरु के गोचर से निकाली जाती हैं। मनोरंजन के लिए ठीक हैं, निर्णय के लिए नहीं।',
      'विवाह योग के लिए कम से कम चार चीज़ें चाहिए — लग्न, सप्तम भाव, सप्तमेश और नवमांश। इनमें से एक भी राशि से नहीं मिलती। इसीलिए यह कैलकुलेटर जन्म समय और स्थान माँगता है।',
    ],
  },
  {
    id: 'kya-nahi-batate',
    h2: 'यह कैलकुलेटर क्या नहीं बताता — और क्यों नहीं',
    paras: [
      'चार चीज़ें यहाँ कभी नहीं मिलेंगी, और यह जान-बूझकर है। **पहली — "शादी नहीं होगी।"** पाराशर ऐसा दावा करते ही नहीं; वे विलंब बताते हैं। किसी चिंतित व्यक्ति से यह कहना बेबुनियाद भी है और क्रूर भी।',
      '**दूसरी — तलाक, अलगाव या वैधव्य।** ग्रंथों में इनके नियम हैं। हम उन्हें प्रकाशित नहीं करते। वे डर से बिकते हैं और उन्हें पढ़ने वाला पहले से डरा हुआ होता है।',
      '**तीसरी — जीवनसाथी की जाति, धर्म, समुदाय या देश।** कुंडली ईमानदारी से यह बता ही नहीं सकती, और कोशिश करना अपने आप में भेदभाव है। **चौथी — जीवनसाथी का लिंग**, और उसके बारे में कोई पूर्वधारणा भी नहीं।',
    ],
  },
  {
    id: 'free-me-kya',
    h2: 'Free mein kya milta hai aur ₹51 mein kya khulta hai',
    paras: [
      '**Free:** aapka seedha jawab (haan / sambhavna / abhi deri hai), aur ek 75-shabd ka summary aam bol-chaal ki bhasha mein — jisme ek sabse bada sahara aur ek sabse badi rukavat batayi jaati hai.',
      '**₹51 (India) / $7 (international):** anukool dasha khidkiyon ki **tareekhon wali table**, **umar ka range**, **paanch Trikaal Upay** poori vidhi ke saath, aur har niyam ka poora vishleshan asli number ke saath.',
      'Free tier mein paid content hota hi nahi — wo chhupaya nahi jaata, bheja hi nahi jaata. Ye jaan-boojh kar aisa banaya gaya hai.',
    ],
  },
];

// ── Sections 27-38 ───────────────────────────────────────────────────────────
const PILLAR_2: PillarSection[] = [
  {
    id: 'astrosage-tulna',
    h2: 'AstroSage shadi kab hogi vs Trikaal Vaani — farak kya hai',
    paras: [
      'Sabse bada farak **varga** ka hai. Zyadatar free tools sirf rasi chart dekh kar jawab de dete hain. BPHS vivah ka nirnay **Navamsa (D-9)** se karta hai — aur wahi is calculator ke 100 mein se 24 ank uthata hai.',
      'Doosra farak **karak** ka hai. Wo sabke liye Shukra padhte hain; shastra kehta hai purush ke liye Shukra aur stri ke liye Guru. Isiliye yahan gender zaroori hai — aadhi aabadi ke liye galat karak padhna aadha jawab dena hai.',
      'Teesra farak **wajah** ka hai. Score ke saath asli aankda milta hai — Shadbala ka anupat, drishti ke virupas, dasha ki asli tareekhein. Number ke bina "mazboot" ya "kamzor" sirf ek raay hai.',
    ],
  },
  {
    id: 'ai-marriage-prediction',
    h2: 'AI marriage prediction by date of birth — AI yahan kya karta hai',
    paras: [
      'Saaf kar dena zaroori hai: **AI yahan koi jyotish nahi karta.** Poori ganit — grah, bhava, Navamsa, Shadbala, drishti, dasha — Swiss Ephemeris aur shastriya niyamon se hoti hai, ek deterministic engine mein.',
      'AI ka kaam sirf **likhna** hai. Use engine ke nikale hue tathya diye jaate hain aur usse kaha jaata hai ki unhe aam bhasha mein likh do. Wo koi naya graha, koi nayi tareekh, koi naya number nahi jod sakta.',
      'Aur uska likha hua **customer tak pahunchne se pehle jaancha** jaata hai — agar usme koi aisa number ho jo humne diya hi nahi, ya koi aisi baat ho jo hum nahi kehte, to wo raddi kar diya jaata hai.',
    ],
  },
  {
    id: 'hast-rekha-vivah',
    h2: 'विवाह रेखा हाथ में कहाँ होती है — और वह कुंडली से कैसे अलग है',
    paras: [
      'हस्तरेखा में विवाह रेखा **कनिष्ठा उँगली के नीचे, हृदय रेखा से ऊपर की छोटी आड़ी रेखाएँ** मानी जाती हैं। यह ज्योतिष से अलग एक शास्त्र है, और दोनों को मिलाना नहीं चाहिए।',
      'सच यह है कि इन रेखाओं से विवाह का **समय** निकालना अत्यधिक अविश्वसनीय है। रेखाएँ प्रवृत्ति दिखाती हैं, कैलेंडर नहीं। समय दशा से आता है।',
      'रेखाओं का पूरा अर्थ [विवाह रेखा का मतलब](/blog/vivah-rekha-marriage-line-matlab) में है, और अपनी हथेली पढ़वानी हो तो [हस्तरेखा कैलकुलेटर](/hast-rekha-calculator) अलग से है। पर अगर दोनों अलग कहें, तो कुंडली को वरीयता दीजिए।',
    ],
  },
  {
    id: 'kaal-sarp-vivah',
    h2: 'Kaal Sarp Dosh और विवाह में देरी — क्या संबंध है?',
    paras: [
      'काल सर्प दोष तब बनता है जब सभी सात ग्रह राहु और केतु के बीच आ जाएँ। इसका विवाह से सीधा संबंध तभी होता है जब **राहु-केतु का अक्ष सप्तम भाव को छूता हो**।',
      'अगर अक्ष सप्तम से दूर है, तो काल सर्प का असर जीवन के दूसरे क्षेत्रों पर पड़ेगा, विवाह पर ज़रूरी नहीं। यह बारीकी अक्सर छोड़ दी जाती है, और उसी से बेवजह का डर फैलता है।',
      'अपनी कुंडली में जाँचना हो तो [मुफ्त काल सर्प दोष कैलकुलेटर](/calculators/free-kaal-sarp-dosh-calculator) बताता है कि दोष है या नहीं, और किस प्रकार का।',
    ],
  },
  {
    id: 'videshi-jeevansaathi',
    h2: 'क्या जीवनसाथी विदेश से होगा — यह अलग सवाल क्यों है',
    paras: [
      'यह विवाह के **समय** का सवाल नहीं, उसकी **दिशा** का सवाल है। शास्त्र में इसके लिए द्वादश भाव, सप्तमेश की स्थिति और राहु की भूमिका देखी जाती है — अलग नियम, अलग गणना।',
      'इसीलिए वह एक अलग कैलकुलेटर है, इसी में जोड़ा नहीं गया। दो अलग सवालों का एक ही स्कोर देना दोनों जवाबों को कमज़ोर कर देता।',
      'वह सवाल आपका हो तो [विदेशी जीवनसाथी कैलकुलेटर](/calculators/free-foreign-spouse-calculator) उसी के लिए बना है, और उसका शास्त्रीय आधार [विदेशी जीवनसाथी की भविष्यवाणी](/learn/foreign-spouse-prediction) में खुला है।',
    ],
  },
  {
    id: 'santan-ke-baad',
    h2: 'विवाह के बाद संतान का योग — अगला पड़ाव',
    paras: [
      'विवाह और संतान दो अलग भाव, अलग कारक और अलग वर्ग कुंडलियों से देखे जाते हैं। **विवाह — सप्तम भाव, शुक्र या गुरु, नवमांश D-9। संतान — पंचम भाव, गुरु, सप्तांश D-7।**',
      'जो टूल एक ही गणना से दोनों बता दे, वह किसी एक को सही और दूसरे को अंदाज़े से दे रहा है। यही वजह है कि हमने इन्हें अलग रखा है।',
      'संबंध यह है कि विवाह में देरी संतान की खिड़की को आगे खिसका देती है — पर वह समय का प्रश्न है, योग का नहीं। संतान का हिसाब [संतान योग कैलकुलेटर](/calculators/free-santan-yog-calculator) करता है।',
    ],
  },
  {
    id: 'shiv-puran-upay',
    h2: 'शिव पुराण में शादी के उपाय — परंपरा क्या कहती है',
    paras: [
      'परंपरा में विवाह की कामना से सबसे प्रचलित उपाय **सोमवार व्रत** और **शिव-पार्वती की उपासना** हैं। स्त्रियों के लिए मंगला गौरी व्रत और पुरुषों के लिए गुरुवार का नियम भी उसी श्रेणी में आते हैं।',
      'इनका शास्त्रीय स्थान **सहायक** का है, गारंटी का नहीं। और इनका असर उस ग्रह से जुड़ा होता है जो आपकी कुंडली में विवाह सँभालता है — इसीलिए एक ही व्रत सबके लिए एक जैसा फल नहीं देता।',
      'हम यहाँ कोई निश्चित संख्या या शुल्क वाली पूजा नहीं बता रहे, और जान-बूझकर नहीं बता रहे। जो साइट पहले डराए और फिर लाख रुपये की पूजा सुझाए, वह शास्त्र नहीं, पटकथा पढ़ रही है।',
    ],
  },
  {
    id: 'kaunsa-graha-achanak',
    h2: 'कौन सा ग्रह अचानक शादी करवाता है?',
    paras: [
      'परंपरा में **राहु** को अचानक और अप्रत्याशित घटनाओं का कारक माना गया है। जब राहु की दशा या गोचर सप्तम भाव से जुड़ता है, तो विवाह अक्सर तेज़ी से और अपेक्षा से हट कर होता है।',
      '**शुक्र और चंद्र** की युति भी जल्दी बात बनने से जोड़ी जाती है, क्योंकि दोनों संबंध और भावना के कारक हैं।',
      'पर "अचानक" का मतलब "बिना योग के" नहीं होता। योग पहले से मौजूद रहता है; राहु सिर्फ़ उसकी गति बढ़ा देता है। इसीलिए स्कोर और खिड़की — दोनों साथ पढ़ने चाहिए।',
    ],
  },
  {
    id: 'panchang-vivah',
    h2: 'खरमास और अधिक मास में शादी क्यों नहीं होती?',
    paras: [
      'यह मुहूर्त का नियम है, योग का नहीं। **खरमास** में सूर्य धनु या मीन राशि में होता है, और परंपरा में उस अवधि में मांगलिक कार्य टाले जाते हैं। **अधिक मास** अतिरिक्त चंद्र मास होता है, जिसे भी वर्जित माना गया है।',
      'इसका आपके विवाह योग से कोई लेना-देना नहीं है। योग वैसा ही रहता है; बस उस अवधि में विवाह संपन्न नहीं कराया जाता।',
      'ये दोनों अवधियाँ हर साल बदलती हैं, इसलिए तारीख़ याद रखने के बजाय [विवाह मुहूर्त](/vivah-muhurat) से देख लेना बेहतर है, जो इन्हें अपने आप हटा देता है।',
    ],
  },
  {
    id: 'ghar-walon-ka-dabav',
    h2: 'घर वाले बार-बार पूछते हैं — इस रिपोर्ट को कैसे पढ़ें',
    paras: [
      'यह सवाल तकनीकी नहीं है, पर सबसे असली है। इस पेज पर आने वाले ज़्यादातर लोग किसी और के सवाल का जवाब ढूँढ़ रहे होते हैं, अपने नहीं।',
      'अगर स्कोर कम आए तो उसका मतलब यह **नहीं** है कि कुछ ख़त्म हो गया। इस पैमाने पर कम स्कोर का एक ही अर्थ है — **इस समय दबाव है, और खिड़की आगे है।** यही बात रिपोर्ट में साफ़ लिखी रहती है।',
      'और अगर स्कोर अच्छा आए, तो वह भी तारीख़ नहीं है। वह एक अवधि है जिसमें प्रयास का फल मिलने की संभावना ज़्यादा है। ज्योतिष प्रयास की जगह नहीं लेता।',
    ],
  },
  {
    id: 'kitni-baar',
    h2: 'क्या यह कैलकुलेटर बार-बार चलाया जा सकता है?',
    paras: [
      'हाँ, और मुफ़्त वाला हिस्सा हमेशा मुफ़्त रहेगा। पर एक बात समझ लीजिए — **वही जन्म विवरण हमेशा वही जवाब देगा।** कुंडली बदलती नहीं है।',
      'जो बदलता है वह **दशा** है, और वह महीनों-सालों में आगे बढ़ती है, घंटों में नहीं। इसलिए हर हफ़्ते चलाने से कुछ नया नहीं मिलेगा।',
      'बदल कर देखने लायक एक ही चीज़ है — अगर आपको जन्म समय ठीक-ठीक याद नहीं और आपने अनुमान डाला था। ऐसे में सही समय मिलने पर दोबारा चलाइए, क्योंकि लग्न बदलने से पूरा विश्लेषण बदल सकता है।',
    ],
  },
  {
    id: 'kitna-bharosa',
    h2: 'इस स्कोर पर कितना भरोसा करें — ईमानदार जवाब',
    paras: [
      'यह स्कोर **शास्त्रीय नियमों का हिसाब** है, भविष्य की गारंटी नहीं। जो गणना होती है वह सटीक है — Swiss Ephemeris, लाहिरी अयनांश, षड्बल, डिग्री-सटीक दृष्टि। जो व्याख्या होती है वह परंपरा से आती है, और परंपरा में मतभेद हैं।',
      'हम वही नियम इस्तेमाल करते हैं जिन पर पाराशरी परंपरा में व्यापक सहमति है, और जहाँ हमने कोई चुनाव किया है — जैसे स्त्री के लिए गुरु को कारक लेना — वह पेज पर लिखा है, छिपाया नहीं गया।',
      'सबसे उपयोगी हिस्सा स्कोर नहीं है। सबसे उपयोगी हिस्सा है **क्या रोक रहा है** और **कब खुलेगा** — क्योंकि उन दोनों पर कुछ किया जा सकता है।',
    ],
  },
];

const FAQS = [
  {
    q: 'Shadi kab hogi — ye calculator kaise batata hai?',
    a: 'Aapki janm-kundali Swiss Ephemeris se banti hai, phir saat blocks par 100 mein score banta hai — saptam bhava aur uska swami (22), Navamsa D-9 (24), kalatra karak yaani Shukra ya Guru (18), Jaimini Darakaraka (8), saptam par drishti (12), Shani aur Mangal Dosh jaisi baadhaayein (10), aur abhi chal rahi dasha (6). Samay ki khidkiyan aapki apni Vimshottari dasha se nikalti hain, tareekhon ke saath.',
  },
  {
    q: 'Kya ye bata sakta hai ki meri shadi hogi ya nahi?',
    a: 'Nahi, aur jo tool ye daawa kare usse door rahiye. Ye ek Yog Strength Score hai — aapke chart mein vivah ke classical yog kitne mazboot hain, unke raaste mein kya hai, aur wo kab sakriya honge. Kam score ka matlab "shadi nahi hogi" kabhi nahi hota; shastra is sthiti ko vilamba yaani deri kehta hai, inkaar nahi.',
  },
  {
    q: 'Gender kyun zaroori hai, jabki baaki calculators mein optional hai?',
    a: 'Kyunki wo jawab badal deta hai. Shastra mein Shukra patni ka karak hai aur Guru pati ka — isliye purush ki kundali Shukra se padhi jaati hai aur stri ki Guru se. Gender ke bina calculator aadhi aabadi ke liye galat karak graha padhega. Yahi wajah hai ki sirf is calculator mein ye field zaroori hai.',
  },
  {
    q: 'Navamsa D-9 kya hai aur ye kyun zaroori hai?',
    a: 'Navamsa nauwan divisional chart hai. Brihat Parashara Hora Shastra vivah ka nirnay Navamsa se karta hai. Rasi chart vaada dikhata hai, Navamsa uski pushti karti hai. Zyadatar free tools sirf rasi chart dekh kar jawab de dete hain, jo aadha kaam hai.',
  },
  {
    q: 'Kya sirf date of birth se shadi ka samay pata chal sakta hai?',
    a: 'Nahi. Janm ka samay lagna tay karta hai, aur lagna badalte hi saptam bhava badal jata hai — yaani saptamesh badal jata hai aur poora vishleshan badal jata hai. Lagna lagbhag har do ghante mein badalta hai, isliye sirf tareekh se kiya gaya vishleshan din mein baarah alag jawab de sakta hai. Samay pata na ho to 12:00 PM maan liya jata hai, par phir result approximate hi hai.',
  },
  {
    q: 'Umar ka range kaise nikalta hai?',
    a: 'Wo ganit se nikalta hai, andaze se nahi. Calculator aapki pehli anukool dasha khidki leta hai aur uske shuru aur ant ko aapki umar mein badal deta hai. Agar wo khidki abhi chal rahi hai to tareekh aaj se shuru dikhayi jaati hai, us dasha ke purane aarambh se nahi — beeta hua hissa aapke kisi kaam ka nahi.',
  },
  {
    q: 'Agar wo umar nikal jaye to kya yog khatam ho jata hai?',
    a: 'Nahi. Yog kundali mein janm se maujood rehta hai; dasha use kholti hai. Ek khidki nikal jaye to agli aati hai. Shastra mein vilamba hai, samapti nahi — aur is vishay par yahi farak sabse zyada mayne rakhta hai.',
  },
  {
    q: 'Kya ye talaak, doosri shadi ya jeevansaathi ki umar batata hai?',
    a: 'Nahi, aur ye jaan-boojh kar hai. Granthon mein in sab ke niyam hain. Hum unhe prakashit nahi karte — wo darr se bikte hain aur unhe padhne wala pehle se dara hua hota hai. Isi tarah hum jeevansaathi ki jaati, dharm, desh ya ling ke baare mein bhi kuch nahi batate.',
  },
  {
    q: 'Vivah Yog aur Vivah Muhurat mein kya farak hai?',
    a: 'Vivah Yog aapki kundali ka sawaal hai — sanyog kitna balwan hai aur kab khulega. Vivah Muhurat panchang ka sawaal hai — jo vivah tay ho chuka hai use kis din aur kis ghadi karein. Pehla sirf aapka hai; doosra sabke liye ek jaisa hota hai.',
  },
  {
    q: 'Kya ye calculator sach mein free hai?',
    a: 'Haan. Seedha jawab, 75-shabd ka summary, ek sabse bada sahara aur ek sabse badi rukavat — sab free. ₹51 mein tareekhon wali table, umar ka range, paanch Trikaal Upay poori vidhi ke saath, aur har niyam ka poora vishleshan khulta hai.',
  },
];

const COMPARE = [
  { f: 'Navamsa D-9 (BPHS ki vivah varga)', tv: 'Haan — 24 ank, poora breakdown', as: 'Aksar nahi', at: 'Aksar nahi' },
  { f: 'Gender ke hisaab se karak (Shukra/Guru)', tv: 'Haan — zaroori field', as: 'Nahi', at: 'Nahi' },
  { f: 'Asli dasha tareekhein', tv: 'Haan — table mein', as: 'Kabhi-kabhi', at: 'Kabhi-kabhi' },
  { f: 'Umar ka range, ganit se', tv: 'Haan', as: 'Kabhi-kabhi', at: 'Kabhi-kabhi' },
  { f: 'Har ank ke saath asli number', tv: 'Haan — Shadbala aur virupas', as: 'Nahi', at: 'Nahi' },
  { f: 'Jaimini Darakaraka', tv: 'Haan', as: 'Nahi', at: 'Nahi' },
  { f: 'Talaak/vaidhavya batata hai', tv: 'Nahi — jaan-boojh kar', as: 'Kabhi-kabhi', at: 'Kabhi-kabhi' },
  { f: 'Jeevansaathi ki jaati/desh', tv: 'Nahi', as: 'Kabhi-kabhi', at: 'Kabhi-kabhi' },
];

const READ_MORE = [
  { href: '/learn/why-is-my-marriage-delayed', t: 'विवाह में देरी क्यों — पूरा शास्त्रीय गाइड' },
  { href: '/learn/what-age-will-i-get-married', t: 'किस उम्र में विवाह होगा' },
  { href: '/learn/will-i-have-love-marriage', t: 'प्रेम विवाह का योग' },
  { href: '/learn/marriage-compatibility-analysis', t: 'Marriage Compatibility Analysis' },
  { href: '/learn/foreign-spouse-prediction', t: 'विदेशी जीवनसाथी की भविष्यवाणी' },
  { href: '/blog/vivah-rekha-marriage-line-matlab', t: 'विवाह रेखा का मतलब — हस्तरेखा' },
  { href: '/blog/manglik-non-manglik-marriage', t: 'मांगलिक और गैर-मांगलिक विवाह' },
  { href: '/blog/kundli-matching-guide', t: 'कुंडली मिलान की पूरी विधि' },
  { href: '/marriage', t: 'विवाह — पूरा जीवन-क्षेत्र' },
  { href: '/relationships', t: 'रिश्ते और दांपत्य' },
];

const MORE_CALC = [
  { href: '/kundali-milan', t: 'Kundali Milan — गुण मिलान' },
  { href: '/vivah-muhurat', t: 'Vivah Muhurat — शुभ तिथि' },
  { href: '/calculators/free-manglik-dosh-calculator', t: 'Free Manglik Dosh Calculator' },
  { href: '/calculators/free-kaal-sarp-dosh-calculator', t: 'Free Kaal Sarp Dosh Calculator' },
  { href: '/calculators/free-foreign-spouse-calculator', t: 'Foreign Spouse Yog Calculator' },
  { href: '/calculators/free-santan-yog-calculator', t: 'Santan Yog Calculator' },
  { href: '/calculators/free-dasha-calculator', t: 'Free Dasha Calculator' },
  { href: '/calculators/free-graha-bal-calculator', t: 'Graha Bal (Shadbala) Calculator' },
  { href: '/calculators/free-kundali-calculator', t: 'Free Kundali Calculator' },
  { href: '/hast-rekha-calculator', t: 'हस्तरेखा कैलकुलेटर' },
];

const ALL = [...PILLAR, ...PILLAR_2];

export default function FreeShadiKabHogiCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-shadi-kab-hogi-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Vivah Yog Calculator — शादी कब होगी, कुंडली से Free',
    description:
      'Free Vivah Yog Calculator. Apni kundali se shadi ka samay jaaniye — saptam bhava, Navamsa D-9, kalatra karak, Darakaraka, drishti aur dasha, har ank ki wajah asli number ke saath. Trikaal Vaani.',
    breadcrumbName: 'Vivah Yog Calculator',
    aboutEntities: [
      'Vivah Yog', 'Seventh House', 'Navamsa', 'Venus', 'Jupiter',
      'Darakaraka', 'Mangal Dosha', 'Shadbala', 'Vimshottari Dasha',
    ],
    knowsAbout: [
      'Vedic Astrology', 'Jyotish Shastra', 'Navamsa D-9', 'Shadbala',
      'Jaimini Karakas', 'Vivah Yog', 'Marriage Timing Astrology',
    ],
    howToName: 'How to check when you will get married from your Kundali',
    howToSteps: [
      { name: 'Enter birth details and gender', text: 'Date, exact time and place of birth, plus gender. Gender is required here because the Kalatra Karaka is Venus for a man and Jupiter for a woman, so it changes which planet is read.' },
      { name: 'The chart is computed', text: 'Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali, the Navamsa D-9 marriage chart, full Shadbala for all seven planets and degree-precise drishti in virupas.' },
      { name: 'Read the timing, not just the score', text: 'Every rule shows the points it awarded and the figure behind it, and the paid reading gives dated Vimshottari windows plus the age band those windows fall in.' },
    ],
    faqs: FAQS,
    dateModified: '2026-09-03',
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
            <span style={{ color: '#94a3b8' }}>Vivah Yog Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>
              Vivah Yog Calculator — शादी कब होगी, कुंडली से
            </h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>
              सप्तम भाव, नवमांश D-9, कलत्र कारक और दाराकारक — विवाह योग का बल और उसका समय, हर अंक की वजह के साथ।
            </p>
          </header>

          {/* ── AEO / GEO direct answer, 40-60 words ─────────────────── */}
          <div className="tv-aeo-answer rounded-xl p-5 mb-6"
            style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed m-0">
              <strong style={{ color: GOLD }}>विवाह योग</strong> कुंडली के{' '}
              <strong style={{ color: GOLD }}>सप्तम भाव, सप्तमेश, कलत्र कारक और नवमांश (D-9)</strong> से पढ़ा जाता है, और उसका समय विंशोत्तरी दशा से निकलता है — बृहत् पाराशर होरा शास्त्र विवाह का निर्णय नवमांश से करने को कहता है।{' '}
              <strong style={{ color: GOLD }}>Trikaal Vaani का Free Vivah Yog Calculator</strong> इन चारों परतों पर 100 में स्कोर देता है, साथ में असली तारीख़ों की खिड़कियाँ भी।
            </p>
          </div>

          {/* ── E-E-A-T author block ─────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>
                <Link href="/founder" className="hover:underline">Rohiit Gupta</Link>
              </div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Engine: Swiss Ephemeris · Navamsa D-9 · Shadbala · Lahiri Ayanamsha
              </div>
            </div>
          </div>

          {/* ── Boundary, stated before the tool ─────────────────────── */}
          <section className="rounded-xl p-4 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              चार बातें पहले ही साफ़ कर देना ज़रूरी है। <strong style={{ color: GOLD }}>पहली</strong> — यहाँ &ldquo;शादी नहीं होगी&rdquo; कभी नहीं मिलेगा। यह कैलकुलेटर योग का बल और उसका समय बताता है; कम स्कोर का अर्थ विलंब है, इनकार नहीं।{' '}
              <strong style={{ color: GOLD }}>दूसरी</strong> — तलाक, अलगाव या वैधव्य की कोई भविष्यवाणी नहीं। ग्रंथों में इनके नियम हैं; हम उन्हें प्रकाशित नहीं करते।{' '}
              <strong style={{ color: GOLD }}>तीसरी</strong> — जीवनसाथी की जाति, धर्म, समुदाय या देश नहीं बताया जाता।{' '}
              <strong style={{ color: GOLD }}>चौथी</strong> — जीवनसाथी का लिंग भी नहीं, और उसके बारे में कोई पूर्वधारणा भी नहीं।
            </p>
          </section>

          {/* ── The calculator ───────────────────────────────────────── */}
          <YogCalculator config={{
            type: 'vivah',
            genderRequired: true,
            scoreLabel: 'Vivah Yog Strength Score',
            breakdownHeading: 'Har point ki wajah',
            hintsHeading: 'Upay kis disha mein',
            hintsTeaser: 'Aapke apne saptamesh par aadharit upay ki disha',
            showNextStep: false,
            ctaHref: '/calculators',
            ctaLabel: 'Meri shadi kab hogi — dekho',
            ctaPrice: '₹51',
            ctaBlurb: 'Poori reading upar khul chuki hai.',
          }} />

          {/* ── Table of contents ────────────────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-16 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {ALL.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>
                    {s.h2}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── 38 keyword-driven H2 sections ────────────────────────── */}
          <section className="mt-12">
            {ALL.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                    {renderRich(p, `s${si}-p${pi}`)}
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* ── Comparison ───────────────────────────────────────────── */}
          <section className="mt-4">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>
              Trikaal Vaani vs AstroSage vs AstroTalk — Vivah Yog par
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak <strong style={{ color: GOLD }}>varga</strong> ka hai. Zyadatar free tools sirf rasi chart
              dekh kar jawab de dete hain. BPHS vivah ka nirnay <strong style={{ color: GOLD }}>Navamsa D-9</strong> se
              karta hai — aur wahi is calculator ke 100 mein se 24 ank uthata hai. Doosra farak{' '}
              <strong style={{ color: GOLD }}>karak</strong> ka hai: purush ke liye Shukra, stri ke liye Guru.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <caption className="sr-only">Vivah yog calculators ki tulna</caption>
                <thead>
                  <tr style={{ background: GOLD_RGBA(0.1) }}>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Kya</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>AstroSage</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>AstroTalk</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {COMPARE.map((c) => (
                    <tr key={c.f} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3 font-semibold">{c.f}</td>
                      <td className="p-3">{c.tv}</td>
                      <td className="p-3">{c.as}</td>
                      <td className="p-3">{c.at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────────── */}
          <section className="mt-4 rounded-2xl p-5 md:p-6 mb-8"
            style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>
              Aksar puche jaane wale sawaal — Vivah Yog
            </h2>
            {FAQS.map((f, i) => (
              <details key={i} className="mb-2 last:mb-0">
                <summary className="text-sm font-semibold cursor-pointer py-2" style={{ color: '#e2e8f0' }}>{f.q}</summary>
                <p className="text-xs leading-relaxed mt-1 mb-2" style={{ color: '#94a3b8' }}>{f.a}</p>
              </details>
            ))}
          </section>

          {/* ── Related reading ──────────────────────────────────────── */}
          <section className="rounded-2xl p-5 mb-6"
            style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>
              विवाह ज्योतिष पर पूरा गाइड पढ़ें
            </h2>
            <ul className="text-sm space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
              {READ_MORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ color: '#94a3b8' }} className="hover:text-slate-200">{l.t}</Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Other calculators ────────────────────────────────────── */}
          <section className="rounded-2xl p-5"
            style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <ul className="text-sm space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
              {MORE_CALC.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} style={{ color: '#94a3b8' }} className="hover:text-slate-200">{l.t}</Link>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </main>
    </>
  );
}
