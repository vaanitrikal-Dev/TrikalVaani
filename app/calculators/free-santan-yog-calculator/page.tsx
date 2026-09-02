'use client';

// ============================================================
// File: app/calculators/free-santan-yog-calculator/page.tsx
// Version: v1.0 — Santan Yog Calculator (2 Sep 2026)
// API: /api/calc/yog  (type: 'santan')  · Engine: lib/santan-engine.ts
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ------------------------------------------------------------
// The form and result renderer live in components/calculators/
// YogCalculator.tsx. This file carries only this page's words, SEO,
// JSON-LD and internal linking.
//
// SLUG EVIDENCE (Radar `svc-child-destiny`, 30 Aug 2026 run):
//   Google's own PASF suggests "संतान योग कैलकुलेटर" (seen x2),
//   "santan yog calculator by date of birth", "Santan yog in kundali
//   online", "Child yog calculator", "पुत्र योग कैलकुलेटर".
//   GSC shows zero santan queries only because no santan page existed.
//
// CANNIBALISATION GUARD — DO NOT BREAK
//   /learn/number-of-children-prediction earns 3,815 impressions and 155
//   clicks at position 5.23 on the ENGLISH "how many children will I have"
//   cluster. This page must NOT chase that phrase in its title, H1 or
//   metadata. It targets the TOOL intent (santan yog calculator) and links
//   TO the learn page. Two pages, two intents, no fight.
//
// TWO LINES THAT ARE NOT NEGOTIABLE
//   1. MEDICAL. Progeny is a medical subject first. Nothing here may say or
//      imply that a person cannot have children, and no medical cause is
//      ever named. The engine's SANTAN_DISCLAIMER carries the doctor line
//      and is rendered on every result, free and paid.
//   2. LEGAL. Sex determination of an unborn child is a criminal offence in
//      India under the PCPNDT Act, 1994. The "putra hoga ya putri" keyword
//      has real search demand and IS answered on this page — by refusing,
//      and by saying why. See the section id 'putra-ya-putri'. Never soften
//      that section into a prediction.
//
// NO CTA — by Rohiit's instruction, 2 Sep 2026. This is a new product; it
//   does not cross-sell another. showNextStep is false, and no /services
//   link appears anywhere on the page.
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
// 35 H2 sections. Every heading below is a keyword Google itself
// suggested — Radar PAA/PASF (cluster svc-child-destiny, 30 Aug 2026)
// or the GSC export of 1 Sep 2026. None were invented.
// ============================================================
const PILLAR: PillarSection[] = [
  {
    id: 'santan-yog-kya-hai',
    h2: 'कुंडली से संतान योग कैसे पता करें?',
    paras: [
      'संतान योग कुंडली के **पंचम भाव, उसके स्वामी, गुरु ग्रह और सप्तांश (D-7) कुंडली** के मेल से पढ़ा जाता है। जब ये चारों एक ही दिशा में इशारा करें, तब योग प्रबल माना जाता है। किसी एक ग्रह से संतान योग तय नहीं होता।',
      'शास्त्र इसे एक क्रम में देखता है, टुकड़ों में नहीं। पहले पंचम भाव — वहाँ कौन बैठा है और उस पर किसकी दृष्टि है। फिर पंचमेश — वह किस भाव में है, किस अवस्था में है, और उसका षड्बल कितना है। फिर **गुरु**, जो संतान का प्राकृतिक कारक है। और अंत में सप्तांश, जो संतान की अपनी कुंडली है।',
      'ऊपर वाला कैलकुलेटर यही चारों परतें एक साथ पढ़ता है और हर अंक के साथ उसका कारण भी दिखाता है — कौन सा ग्रह, कौन सा भाव, षड्बल कितना, दृष्टि कितने विरुपा की। पूरा शास्त्रीय आधार [संतान संख्या की भविष्यवाणी](/learn/number-of-children-prediction) वाले गाइड में विस्तार से लिखा है।',
    ],
  },
  {
    id: 'calculator-kaise-kaam-karta-hai',
    h2: 'Santan Yog Calculator kaam kaise karta hai — saat blocks',
    paras: [
      'Aapki janm-kundali Swiss Ephemeris se banti hai (Lahiri Ayanamsha), aur phir saat blocks par 100 mein score banta hai: **पंचम भाव 22, सप्तांश D-7 24, गुरु 18, पुत्रकारक 8, दृष्टि 12, बाधाएँ 10, दशा 6.**',
      'Har block apne andar 2-3 niyam chalata hai, aur har niyam apna ank dene ke saath uska kaaran bhi likhta hai — asli number ke saath. Isliye result mein aapko "Guru mazboot hai" nahi milta; aapko milta hai "Guru ki Shadbala 1.24, aur uski drishti aapke 5th house par 43.2 virupas ki hai".',
      'Ye jaan-boojh kar banaya gaya design hai. Score alag se likha hi nahi jaata — wo niyamon ke ankon ka jod hota hai. Iska seedha matlab ye hai ki score aur uski wajah kabhi ek doosre se alag nahi ho sakte.',
    ],
  },
  {
    id: 'panchma-bhava',
    h2: 'पंचम भाव — संतान का घर और उसका स्वामी',
    paras: [
      'पंचम भाव को शास्त्र में **पुत्र भाव** कहा गया है। संतान, बुद्धि, पूर्व जन्म का पुण्य और सृजन — चारों इसी भाव से देखे जाते हैं। संतान योग की पहली परत यही है।',
      'यहाँ तीन बातें अलग-अलग मायने रखती हैं। **पंचम भाव में कौन बैठा है** — गुरु, शुक्र, बुध या चंद्र जैसे शुभ ग्रह भाव को बल देते हैं; शनि, राहु, केतु या मंगल दबाव बनाते हैं। **पंचमेश किस भाव में है** — केंद्र या त्रिकोण में हो तो फल देता है, षष्ठ-अष्टम-द्वादश में हो तो देर से देता है। और **पंचमेश कितना बलवान है** — यही षड्बल से नापा जाता है।',
      'एक बात जो अक्सर छूट जाती है: खाली पंचम भाव बुरा नहीं होता। खाली भाव का मतलब है कि अब पूरा फल पंचमेश और गुरु पर आ गया — और वे दोनों अलग से गिने जाते हैं। पंचमेश की भूमिका पर विस्तार [पंचमेश और संतान की प्रवृत्ति](/blog/fifth-lord-child-aptitude-astrology-hindi) में है।',
    ],
  },
  {
    id: 'santan-dene-wala-graha',
    h2: 'संतान देने वाला ग्रह कौन सा है?',
    paras: [
      '**गुरु (बृहस्पति) संतान का कारक ग्रह है।** शास्त्र में उसे ही संतान कारक कहा गया है, और यही कारण है कि पंचम भाव चाहे कितना भी अच्छा हो, कमजोर गुरु उसका फल देर से देता है।',
      'लेकिन गुरु अकेला नहीं है। **पंचमेश** आपकी अपनी कुंडली का संतान स्वामी है और हर लग्न के लिए अलग होता है — मेष लग्न में सूर्य, वृषभ में बुध, मिथुन में शुक्र, और इसी तरह आगे। जैमिनी पद्धति में **पुत्रकारक** एक तीसरा ग्रह होता है, जो अंशों से तय होता है।',
      'इसलिए "संतान का उपाय" जैसी कोई एक चीज़ नहीं होती। उपाय उस ग्रह का होता है जो आपकी कुंडली में संतान का स्वामी है — यही वजह है कि इंटरनेट पर मिलने वाला एक ही सामान्य उपाय सब पर काम नहीं करता। गुरु की भूमिका पर पूरा लेख [गुरु, पुत्रकारक और संतान भाग्य](/blog/jupiter-putrakaraka-child-destiny-astrology) में है।',
    ],
  },
  {
    id: 'saptamsa-d7',
    h2: 'सप्तांश (D-7) कुंडली — संतान की अपनी कुंडली',
    paras: [
      '**बृहत् पाराशर होरा शास्त्र के छठे अध्याय में साफ लिखा है कि संतान का निर्णय सप्तांश से होता है।** राशि चक्र वादा दिखाता है; सप्तांश उस वादे की पुष्टि करता है। यही इस कैलकुलेटर का सबसे भारी हिस्सा है — 100 में से 24 अंक।',
      'सप्तांश बनती कैसे है: विषम राशि अपने से गिनी जाती है और सम राशि सातवीं से, हर राशि के सात हिस्से 4 अंश 17 कला 8.57 विकला के। इसमें तीन चीज़ें देखी जाती हैं — **सप्तांश लग्न और उसका स्वामी**, **सप्तांश का पंचम भाव** (यानी संतान के भीतर की संतान), और **राशि का पंचमेश सप्तांश में कहाँ गया**।',
      'यह वह परत है जो लगभग हर मुफ्त टूल छोड़ देता है। जब राशि चक्र और सप्तांश दोनों एक ही जवाब दें, तब संकेत सबसे भरोसेमंद होता है — और जब दोनों अलग-अलग कहें, तब भी वह जानकारी है, भ्रम नहीं।',
    ],
  },
  {
    id: 'navamsa-santan-yog',
    h2: 'नवमांश कुंडली में संतान योग — और यह गलत परत क्यों है',
    paras: [
      'यह सवाल Google खुद सुझाता है, इसलिए इसका सीधा जवाब ज़रूरी है: **नवमांश (D-9) विवाह का वर्ग है, संतान का नहीं।** संतान के लिए शास्त्र सप्तांश (D-7) कहता है।',
      'भ्रम की वजह समझ आती है। नवमांश हर कुंडली सॉफ़्टवेयर में मिलती है, सप्तांश ज़्यादातर में नहीं। इसलिए कई साइटें नवमांश से ही संतान पढ़ने लगती हैं। नतीजा यह होता है कि वे विवाह की कुंडली में संतान ढूँढ़ रही होती हैं।',
      'नवमांश का संतान से एक अप्रत्यक्ष संबंध ज़रूर है — दांपत्य जीवन की स्थिति संतान के प्रसंग को छूती है। पर सीधा निर्णय D-7 से ही होता है। इस कैलकुलेटर में D-7 असल में पढ़ी जाती है, और result में आपका सप्तांश लग्न दिखता है ताकि आप खुद देख सकें कि वह वाकई पढ़ी गई।',
    ],
  },
  {
    id: 'putrakaraka',
    h2: 'Putrakaraka — जैमिनी का संतान कारक क्या होता है',
    paras: [
      '**पुत्रकारक वह ग्रह है जिसके अंश सात ग्रहों में पाँचवें सबसे अधिक हों।** जैमिनी पद्धति में यह चर कारक है — यानी हर कुंडली में बदलता है, जबकि गुरु सबके लिए स्थिर कारक है।',
      'सप्त-कारक क्रम इस प्रकार है: आत्मकारक, अमात्यकारक, भ्रातृकारक, मातृकारक, **पुत्रकारक**, ज्ञातिकारक, दाराकारक। इसलिए पुत्रकारक पाँचवें स्थान पर आता है। कुछ परंपराएँ राहु जोड़कर आठ कारक लेती हैं, जिसमें क्रम बदल जाता है — हमने सप्त-कारक पद्धति चुनी है और यह कोड में लिखकर रखा है, छिपाया नहीं।',
      'कैलकुलेटर पुत्रकारक की दो चीज़ें देखता है: उसका अपना बल और स्थिति, और **पुत्रकारक से पंचम भाव** — क्योंकि जैमिनी में कारक से पंचम वही काम करता है जो लग्न से पंचम करता है।',
    ],
  },
  {
    id: 'putra-yog-kaise-dekhe',
    h2: 'कुंडली में पुत्र योग कैसे देखें — और वह कब बनता है',
    paras: [
      'पुत्र योग तब बनता कहा जाता है जब **पंचम भाव, पंचमेश और गुरु — तीनों शुभ प्रभाव में हों और पापी ग्रहों की दृष्टि से मुक्त हों**, और सप्तांश भी इसकी पुष्टि करे।',
      'व्यवहार में शुद्ध योग दुर्लभ है। ज़्यादातर कुंडलियाँ मिश्रित होती हैं — कहीं गुरु बलवान है पर पंचम भाव पर शनि की दृष्टि है, कहीं पंचमेश अच्छा है पर सप्तांश साथ नहीं दे रही। इसीलिए यह कैलकुलेटर हाँ/ना नहीं देता, **बल का स्कोर** देता है।',
      'यह अंतर मायने रखता है। हाँ/ना देने वाला टूल आपको या तो झूठी तसल्ली देगा या बेवजह डरा देगा। बल का स्कोर आपको बताता है कि योग है, कितना है, और उसके रास्ते में क्या खड़ा है।',
    ],
  },
  {
    id: 'putra-ya-putri',
    h2: 'पुत्र होगा या पुत्री — यह कैलकुलेटर यह क्यों नहीं बताता',
    paras: [
      '**यह जानकारी यहाँ नहीं मिलेगी, और किसी भी भारतीय वेबसाइट पर नहीं मिलनी चाहिए।** गर्भस्थ शिशु का लिंग बताना या बताने का प्रयास करना भारत में **PCPNDT अधिनियम, 1994** के अंतर्गत दंडनीय अपराध है।',
      'यह कानूनी मजबूरी भर नहीं है। हमारा रुख़ भी यही है। लिंग-भविष्यवाणी का इतिहास इस देश में जो रहा है, उसे देखते हुए यह सेवा देना ग़लत होगा — चाहे शास्त्र में कुछ भी लिखा हो।',
      'जो टूल या ज्योतिषी यह बताने का दावा करे, उससे दूरी बनाइए। जो वह बेच रहा है वह भविष्यवाणी नहीं, जोखिम है — आपके लिए भी और उसके लिए भी। हम संतान योग का बल बताते हैं, समय बताते हैं और उपाय बताते हैं। लिंग नहीं।',
    ],
  },
  {
    id: 'kitne-bacche',
    h2: 'कुंडली से कैसे पता करें कि कितने बच्चे होंगे?',
    paras: [
      'शास्त्रीय पद्धति में संतान संख्या **पंचम भाव की राशि, पंचमेश की स्थिति और सप्तांश के पंचम भाव** से अनुमानित की जाती है। पर यहाँ ईमानदारी ज़रूरी है: यह अनुमान है, गिनती नहीं।',
      'पुराने ग्रंथ जिस समाज के लिए लिखे गए थे, वहाँ संतान संख्या लगभग पूरी तरह प्रकृति तय करती थी। आज उसमें चिकित्सा, आर्थिक निर्णय और व्यक्तिगत चुनाव जुड़ चुके हैं। इसलिए कोई भी टूल जो पक्का नंबर बता दे, वह उस बदलाव को नज़रअंदाज़ कर रहा है।',
      'हम इसलिए संख्या नहीं, **बल और समय** बताते हैं। संख्या की शास्त्रीय पद्धति खुद पढ़नी हो तो [संतान संख्या की भविष्यवाणी](/learn/number-of-children-prediction) वाला गाइड पूरी विधि खोलकर रखता है।',
    ],
  },
  {
    id: 'how-many-children-english',
    h2: 'How many children will I have — what a Kundali can and cannot say',
    paras: [
      'A Kundali can tell you **how strong the progeny yog is, when it is most likely to activate, and what is standing in its way.** It cannot hand you a number and it cannot replace a medical opinion. Any tool that gives you a confident count is selling certainty it does not have.',
      'What this calculator returns is a 100-point Yog Strength Score built from your 5th house, your 5th lord, Jupiter as the natural significator, the Saptamsa D-7 chart, the Jaimini Putrakaraka, aspect strength in virupas, classical obstructions, and the Vimshottari dasha currently running.',
      'Every one of those seven blocks shows its working. If a block scores low, the result names the planet, the house and the figure — so you know exactly what the chart is objecting to rather than being told a vague "your yog is weak".',
    ],
  },
  {
    id: 'yog-kab-bante-hain',
    h2: 'संतान प्राप्ति के योग कब बनते हैं?',
    paras: [
      'योग कुंडली में जन्म से मौजूद रहता है — वह बनता नहीं, **सक्रिय होता है**। सक्रिय करने का काम दशा और गोचर करते हैं।',
      'तीन चीज़ें मिलकर सबसे मज़बूत खिड़की बनाती हैं: **पंचमेश, गुरु या पुत्रकारक की महादशा-अंतर्दशा**; **गुरु का पंचम भाव से गोचर या उस पर दृष्टि**; और पंचम भाव पर उस समय पापी दबाव का कम होना।',
      'यही कारण है कि दो लोगों की कुंडली में एक जैसा योग हो सकता है पर फल अलग-अलग समय पर आता है। दशा की गणना अलग से [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) से देखी जा सकती है।',
    ],
  },
  {
    id: 'kab-hogi',
    h2: 'मुझे संतान प्राप्ति कब होगी — दशा और गोचर की खिड़की',
    paras: [
      'समय का सवाल स्कोर से ज़्यादा काम का है, और अक्सर इसी पर लोग अटकते हैं। कैलकुलेटर का **समय** वाला हिस्सा आपकी अभी चल रही महादशा और अंतर्दशा लेकर बताता है कि वे आपके संतान ग्रहों में से हैं या नहीं।',
      'गुरु हर बारह साल में एक बार आपके पंचम भाव से गुज़रता है और लगभग हर साल उस पर दृष्टि डाल सकता है। जब यह गोचर आपकी अनुकूल दशा से मिलता है, वही सबसे प्रबल खिड़की बनती है।',
      'ध्यान रखने वाली बात: दशा का अनुकूल न होना योग का कमज़ोर होना नहीं है। इसका मतलब सिर्फ़ इतना है कि समय अभी नहीं आया। दशा और बाल-विकास के संबंध पर विस्तार [दशा समय और संतान विकास](/blog/dasha-timing-child-development-astrology) में है।',
    ],
  },
  {
    id: 'doosri-santan',
    h2: 'दूसरी संतान का योग — Second child prediction',
    paras: [
      'दूसरी संतान के लिए शास्त्र **पंचम से पंचम, यानी नवम भाव** देखता है। तीसरी के लिए नवम से पंचम — यानी लग्न से एकादश। यह गिनती की सीधी शृंखला है, कोई अलग नियम नहीं।',
      'यही वजह है कि कुछ कुंडलियों में पहली संतान का योग प्रबल होता है और दूसरी का कमज़ोर, या उल्टा। भाव बदल गया, इसलिए स्वामी बदल गया, और उसके साथ बल भी।',
      'यह कैलकुलेटर पहली संतान की परत पर केंद्रित है, क्योंकि वही अधिकांश लोगों का सवाल है। नवम और एकादश की परतें पढ़नी हों तो [संतान की भविष्यवाणी](/learn/child-birth-prediction) वाला पेज उन्हें अलग से खोलता है।',
    ],
  },
  {
    id: 'teesri-santan',
    h2: '3rd child in astrology — तीसरी संतान की परत',
    paras: [
      'तीसरी संतान **एकादश भाव** से देखी जाती है (नवम से पंचम)। दिलचस्प बात यह है कि एकादश भाव लाभ का भी भाव है, इसलिए यहाँ शुभ ग्रह की उपस्थिति दोहरा अर्थ रखती है।',
      'व्यवहार में इस परत तक पहुँचने वाले सवाल कम आते हैं, पर जब आते हैं तो अक्सर एक ही पैटर्न में — पहली दो संतान के बाद देर या रुकावट। ऐसे में देखने लायक बात एकादशेश का बल और उस पर राहु-केतु का प्रभाव होता है।',
    ],
  },
  {
    id: 'deri-ke-karan',
    h2: 'संतान प्राप्ति में देरी के कारण — शास्त्रीय दृष्टि से',
    paras: [
      'ज्योतिष में देरी के **चार सबसे आम कारण** हैं: पंचम भाव या पंचमेश पर शनि का प्रभाव; पंचम अक्ष पर राहु-केतु; पंचमेश का अस्त (सूर्य के बहुत पास) होना; और गुरु का षष्ठ, अष्टम या द्वादश भाव में जाना।',
      'चारों में एक बात साझा है — **इनमें से कोई भी इनकार नहीं है**। शनि मना नहीं करता, समय लंबा कर देता है। राहु-केतु उलझन देते हैं, अंत नहीं। अस्त ग्रह का योग मौजूद रहता है पर दबा रहता है, जब तक उसकी दशा न आए।',
      'और सबसे ज़रूरी बात, जो हर बार दोहराने लायक है: देरी का एक बड़ा हिस्सा चिकित्सकीय होता है, ज्योतिषीय नहीं। कोई भी उपाय डॉक्टर की जगह नहीं ले सकता। उपायों का शास्त्रीय पक्ष [संतान प्राप्ति में देरी और उपाय](/blog/santan-prapti-mein-deri-astrology-upay) में है।',
    ],
  },
  {
    id: 'putra-dosh',
    h2: 'Putra Dosh — राहु-केतु का पंचम अक्ष',
    paras: [
      '**पंचम भाव में राहु या केतु की स्थिति को पुत्र दोष कहा जाता है।** चूँकि ये दोनों हमेशा आमने-सामने रहते हैं, एक के पंचम में होने पर दूसरा एकादश में होता है — इसलिए इसे पंचम-एकादश अक्ष कहा जाता है।',
      'इसका असर आमतौर पर अवरोध जैसा नहीं, उलझन जैसा होता है — बात बनते-बनते रुक जाना, कारण साफ़ न होना। राहु का पंचम में होना अक्सर देर से संतान के रूप में देखा गया है; केतु का होना संतान से मानसिक दूरी के रूप में।',
      'कैलकुलेटर इस दोष को अलग नियम की तरह गिनता है, और अगर यह मौजूद है तो उपाय भी अलग श्रेणी का बताता है — छाया ग्रहों का, पंचमेश का नहीं। यह अंतर लगभग हर जगह छूट जाता है।',
    ],
  },
  {
    id: 'pitra-dosh-santan',
    h2: 'पितृ दोष और संतान बाधा — दोनों का संबंध',
    paras: [
      'शास्त्र संतान बाधा को बार-बार **पूर्वजों से** जोड़ता है। तर्क सीधा है: पंचम भाव पूर्व जन्म के पुण्य का भाव है और नवम भाव पितृ स्थान है — दोनों त्रिकोण हैं और एक ही धारा के दो सिरे।',
      'कैलकुलेटर पितृ दोष के तीन शास्त्रीय संकेत जाँचता है: **सूर्य-राहु की युति**, **नवम भाव में पापी ग्रह**, और **नवमेश का षष्ठ-अष्टम-द्वादश में जाना**। इनमें से कोई मिले तो वह अलग से बताया जाता है।',
      'यह अंतर व्यवहार में बहुत मायने रखता है, क्योंकि पितृ दोष का उपाय पंचम भाव के उपाय से ठीक नहीं होता — वहाँ श्राद्ध और तर्पण वाली श्रेणी पहले आती है। पूरा विषय [पितृ दोष और संतान](/blog/pitra-dosh-childbirth) में खुला है, और अपनी कुंडली में जाँचने के लिए [मुफ्त पितृ दोष कैलकुलेटर](/calculators/free-pitra-dosh-calculator) है।',
    ],
  },
  {
    id: 'shani-panchma',
    h2: 'शनि पंचम भाव में — देरी का सबसे बड़ा अकेला कारण',
    paras: [
      'शनि पंचम भाव में हो तो शास्त्र उसे **विलंब** का सीधा संकेत मानता है, अस्वीकार का नहीं। शनि का स्वभाव ही यही है — वह मना नहीं करता, परिपक्वता माँगता है।',
      'व्यवहार में इसका सबसे आम रूप यह होता है कि संतान अपेक्षा से देर से आती है, अक्सर तब जब जीवन के बाकी हिस्से स्थिर हो चुके हों। कई मामलों में यह देरी बाद में लाभ जैसी लगती है, हालाँकि उस समय भारी लगती है।',
      'शनि की दृष्टि भी उतनी ही मायने रखती है जितनी स्थिति। कैलकुलेटर दृष्टि को डिग्री-सटीक विरुपा में नापता है — इसलिए आपको "शनि की दृष्टि है" नहीं, "शनि की दृष्टि 38.4 विरुपा की है, यानी तीन-चौथाई" मिलता है।',
    ],
  },
  {
    id: 'guru-dasha',
    h2: 'गुरु की दशा और संतान — कारक की अपनी खिड़की',
    paras: [
      'गुरु की महादशा सोलह साल की होती है, और संतान कारक होने के कारण उसे संतान के लिए सबसे अनुकूल महादशाओं में गिना जाता है — बशर्ते गुरु स्वयं कुंडली में बलवान हो।',
      'यहाँ एक बारीकी है जो अक्सर छूटती है: **कमज़ोर गुरु की दशा भी चलती है, पर वह अपना पूरा फल नहीं दे पाती।** इसीलिए कैलकुलेटर गुरु की दशा को अलग से नहीं गिनता — वह गुरु के बल और उसकी दशा, दोनों को मिलाकर देखता है।',
      'गुरु का षड्बल अलग से देखना हो तो [ग्रह बल कैलकुलेटर](/calculators/free-graha-bal-calculator) हर ग्रह का असली अनुपात दिखा देता है।',
    ],
  },
  {
    id: 'shadbala',
    h2: 'षड्बल क्या है और संतान योग में इसका क्या काम है',
    paras: [
      '**षड्बल किसी ग्रह की असली ताक़त छह अलग मापों से नापता है** — स्थान बल, दिग् बल, काल बल, चेष्टा बल, नैसर्गिक बल और दृक् बल — और उसे उस ग्रह के अपने शास्त्रीय न्यूनतम के सामने तोलता है।',
      'अनुपात 1.00 का मतलब है ग्रह अपना पूरा फल देने की स्थिति में है। इसलिए कैलकुलेटर "गुरु मज़बूत है" नहीं कहता; वह कहता है "गुरु की षड्बल 1.24"। यही फ़र्क़ है अंदाज़े और गणना में।',
      'संतान योग में षड्बल तीन जगह लगता है: पंचमेश पर, गुरु पर, और सप्तांश लग्नेश पर। तीनों जगह अनुपात असली संख्या के साथ दिखता है।',
    ],
  },
  {
    id: 'drishti-virupa',
    h2: 'दृष्टि विरुपा में क्यों — "गुरु की दृष्टि है" काफ़ी क्यों नहीं',
    paras: [
      'पारंपरिक तरीक़े में दृष्टि को हाँ/ना में देखा जाता है — गुरु की पंचम पर दृष्टि है या नहीं। शास्त्र इससे ज़्यादा बारीक है: **दृष्टि की ताक़त डिग्री के हिसाब से बदलती है, और उसे विरुपा में नापा जाता है, जहाँ 60 पूर्ण दृष्टि है।**',
      'व्यवहार में इसका मतलब यह है कि दो कुंडलियों में "गुरु की पंचम पर दृष्टि" हो सकती है, पर एक में वह 58 विरुपा की हो और दूसरी में 12 की। पहली में यह असली सहारा है; दूसरी में नाम भर का।',
      'इसीलिए इस कैलकुलेटर में दृष्टि का ब्लॉक अंक भी विरुपा से देता है और वाक्य भी — "आपके पंचम भाव पर गुरु की दृष्टि 43.20 विरुपा की है, यानी तीन-चौथाई, 72% ताक़त"।',
    ],
  },
  {
    id: 'santan-rekha',
    h2: 'संतान रेखा कहाँ होती है — हस्तरेखा में संतान',
    paras: [
      'हस्तरेखा में संतान रेखाएँ **कनिष्ठा उँगली के नीचे, विवाह रेखा से ऊपर उठती छोटी खड़ी रेखाएँ** मानी जाती हैं। यह ज्योतिष से अलग एक शास्त्र है, और दोनों को मिलाना नहीं चाहिए।',
      'सच यह है कि इन रेखाओं से संख्या गिनना अत्यधिक अविश्वसनीय है, और अनुभवी हस्तरेखा-विद इसे स्वीकार करते हैं। रेखाएँ प्रवृत्ति दिखाती हैं, गिनती नहीं।',
      'अपनी हथेली पढ़वानी हो तो [हस्तरेखा कैलकुलेटर](/hast-rekha-calculator) अलग से है। पर संतान योग का असली आधार कुंडली है, हथेली नहीं — और अगर दोनों अलग कहें तो कुंडली को वरीयता दीजिए।',
    ],
  },
  {
    id: 'kaal-sarp-pregnancy',
    h2: 'Kaal Sarp Dosh और गर्भधारण — क्या संबंध है',
    paras: [
      'काल सर्प दोष तब बनता है जब सभी सात ग्रह राहु और केतु के बीच आ जाएँ। इसका संतान से संबंध सीधा तभी होता है जब **राहु-केतु का अक्ष पंचम भाव को छूता हो** — यानी वही पुत्र दोष वाली स्थिति।',
      'अगर अक्ष पंचम से दूर है, तो काल सर्प का असर जीवन के दूसरे क्षेत्रों पर पड़ेगा, संतान पर ज़रूरी नहीं। यह बारीकी अक्सर छोड़ दी जाती है, और उसी से बेवजह का डर फैलता है।',
      'अपनी कुंडली में जाँचना हो तो [मुफ्त काल सर्प दोष कैलकुलेटर](/calculators/free-kaal-sarp-dosh-calculator) अलग से बताता है कि दोष है या नहीं, और किस प्रकार का है।',
    ],
  },
  {
    id: 'manglik-santan',
    h2: 'मांगलिक दोष का संतान से क्या लेना-देना है',
    paras: [
      'सीधा जवाब: **मांगलिक दोष का संबंध विवाह से है, संतान से नहीं।** मंगल की स्थिति 1, 4, 7, 8 या 12 भाव में देखी जाती है — पंचम भाव इस सूची में है ही नहीं।',
      'अप्रत्यक्ष संबंध ज़रूर है। मंगल अगर पंचम भाव पर दृष्टि डाल रहा हो तो वह संतान भाव पर दबाव है — पर वह मांगलिक दोष नहीं, अलग बात है, और कैलकुलेटर उसे दृष्टि वाले ब्लॉक में गिनता है।',
      'विवाह वाला पक्ष देखना हो तो [मांगलिक दोष कैलकुलेटर](/calculators/free-manglik-dosh-calculator) उसके लिए है।',
    ],
  },
  {
    id: 'santan-upay',
    h2: 'जल्दी संतान प्राप्ति के उपाय — जो शास्त्र में सचमुच हैं',
    paras: [
      'शास्त्रीय उपाय **तीन श्रेणियों** में आते हैं, और तीनों का आधार अलग है: कारक गुरु को बल देना; अपनी कुंडली के पंचमेश को बल देना; और अगर पुत्र दोष या पितृ दोष हो तो उसकी अलग शांति।',
      'गुरु के लिए बृहस्पतिवार का नियम, गुरु मंत्र और पीले पदार्थों का दान परंपरा में हैं। पंचमेश के लिए उपाय उस ग्रह का होगा जो आपकी कुंडली में पंचमेश है — इसीलिए एक सामान्य उपाय सब पर काम नहीं करता।',
      'और एक बात साफ़ कह देना ज़रूरी है: **उपाय चिकित्सा का विकल्प नहीं है।** शास्त्र भी उसे सहायक कहता है, प्रतिस्थापन नहीं। जो कोई कहे कि उसके उपाय से इलाज की ज़रूरत नहीं रहेगी, वह शास्त्र नहीं बेच रहा।',
    ],
  },
  {
    id: 'santan-gopal-mantra',
    h2: 'संतान प्राप्ति के लिए मंत्र — संतान गोपाल',
    paras: [
      'संतान के लिए परंपरा में सबसे प्रचलित **संतान गोपाल मंत्र** है, जो बाल कृष्ण को समर्पित है। इसके साथ गुरु का बीज मंत्र भी लिया जाता है, क्योंकि गुरु संतान का कारक है।',
      'परंपरा में विधि सरल रखी गई है — नियमितता को संख्या से ज़्यादा महत्व दिया गया है। बृहस्पतिवार, स्नान के बाद, स्थिर आसन, और एक ही समय।',
      'हम यहाँ कोई निश्चित संख्या या शुल्क वाली पूजा नहीं बता रहे, और जान-बूझकर नहीं बता रहे। जो साइट पहले डराए और फिर लाख रुपये की पूजा सुझाए, वह शास्त्र नहीं, पटकथा पढ़ रही है।',
    ],
  },
  {
    id: 'totka',
    h2: 'संतान प्राप्ति के लिए कौन सा टोटका करें?',
    paras: [
      'ईमानदार जवाब: **शास्त्र में "टोटका" नाम की कोई श्रेणी नहीं है।** यह शब्द लोकभाषा का है, और अक्सर वहीं इस्तेमाल होता है जहाँ शास्त्रीय आधार नहीं होता।',
      'शास्त्रीय उपाय चार तरह के हैं — मंत्र, दान, व्रत और सेवा। इनका आधार ग्रह की स्थिति है, और इसीलिए वे हर कुंडली के लिए अलग होते हैं। जो चीज़ सबके लिए एक जैसी बताई जाए, उसका ग्रहों से कोई संबंध नहीं हो सकता।',
      'अगर कोई उपाय आपसे बड़ी रक़म, गोपनीयता या जल्दबाज़ी माँगे — तीनों में से कोई एक भी — तो वह उपाय नहीं है।',
    ],
  },
  {
    id: 'putrada-ekadashi',
    h2: 'पुत्रदा एकादशी और संतान — व्रत का शास्त्रीय स्थान',
    paras: [
      'पुत्रदा एकादशी साल में दो बार आती है — पौष शुक्ल और श्रावण शुक्ल पक्ष में। नाम ही इसका उद्देश्य बताता है, और परंपरा में यह संतान की कामना से रखे जाने वाले व्रतों में सबसे प्रमुख है।',
      'व्रत की तिथि हर साल बदलती है क्योंकि वह तिथि से तय होती है, तारीख़ से नहीं। और एकादशी के मामले में स्मार्त और वैष्णव परंपराएँ कभी-कभी अलग दिन देती हैं — ऐसे में दोनों दिन जानना बेहतर है, ताकि कोई संदेह न रहे।',
      'व्रत को उपाय की एक श्रेणी की तरह देखिए, गारंटी की तरह नहीं। उसका शास्त्रीय स्थान सहायक का है।',
    ],
  },
  {
    id: 'putra-prapti-yog-2026',
    h2: 'पुत्र प्राप्ति के योग 2026 — गोचर की भूमिका',
    paras: [
      '2026 में संतान योग की बात करते समय सबसे ज़्यादा मायने रखने वाली चीज़ **गुरु का गोचर** है, क्योंकि वही संतान का कारक है। गुरु किस राशि में है, यह हर व्यक्ति के लिए अलग भाव बनाता है।',
      'यही कारण है कि "इस साल इन राशियों को संतान सुख" जैसी सूचियाँ भ्रामक होती हैं। गोचर सबके लिए एक है, पर वह किस भाव में पड़ेगा यह आपके लग्न पर निर्भर करता है — और लग्न हर दो घंटे में बदलता है।',
      'सही तरीक़ा यह है कि पहले अपनी कुंडली में योग का बल देखिए, फिर देखिए कि गोचर उस पर कब पड़ रहा है। पहला कदम ऊपर वाला कैलकुलेटर है।',
    ],
  },
  {
    id: 'rashi-se-santan',
    h2: '2026 में किन राशियों को पुत्र प्राप्ति होगी?',
    paras: [
      'यह सवाल बहुत खोजा जाता है, इसलिए सीधा जवाब: **सिर्फ़ राशि से संतान योग नहीं बताया जा सकता।** राशि का मतलब है दुनिया की बारह में से एक आबादी — उतने बड़े समूह के लिए एक जैसी भविष्यवाणी बेमानी है।',
      'राशिफल वाली सूचियाँ चंद्र राशि पर बनती हैं और गुरु के गोचर से निकाली जाती हैं। वे मनोरंजन के तौर पर ठीक हैं, निर्णय के लिए नहीं।',
      'संतान योग के लिए कम से कम चार चीज़ें चाहिए — लग्न, पंचम भाव, पंचमेश और सप्तांश। इनमें से एक भी राशि से नहीं मिलती। इसीलिए यह कैलकुलेटर जन्म समय और स्थान माँगता है।',
    ],
  },
  {
    id: 'naam-se',
    h2: 'नाम से जाने कितने बच्चे होंगे — क्या यह संभव है?',
    paras: [
      'नहीं। **नाम से संतान योग निकालने की कोई शास्त्रीय पद्धति नहीं है।** नामाक्षर का उपयोग नक्षत्र-आधारित नामकरण में होता है — यानी उल्टी दिशा में, जन्म से नाम की ओर, नाम से भविष्य की ओर नहीं।',
      'जो साइटें नाम से भविष्यवाणी देती हैं वे अंकशास्त्र का सरलीकृत रूप इस्तेमाल करती हैं, जो एक अलग विषय है और जिसका पाराशरी ज्योतिष से कोई संबंध नहीं।',
      'नक्षत्र से नामकरण वाली असली पद्धति देखनी हो तो [नक्षत्र से बच्चे का नाम](/calculators/free-baby-name-by-nakshatra) उसके लिए बना है।',
    ],
  },
  {
    id: 'sirf-janmtithi',
    h2: 'Free child prediction by date of birth — क्या सिर्फ़ जन्मतिथि काफ़ी है?',
    paras: [
      'नहीं, और यह इस पूरे पेज की सबसे व्यावहारिक बात है। **जन्म का समय लग्न तय करता है, और लग्न बदलते ही पंचम भाव बदल जाता है।** पंचम भाव बदला तो पंचमेश बदल गया, और पूरा संतान विश्लेषण बदल गया।',
      'लग्न लगभग हर दो घंटे में बदलता है। इसलिए सिर्फ़ तारीख़ से किया गया विश्लेषण दिन में बारह अलग-अलग जवाब दे सकता है — और उनमें से ग्यारह ग़लत होंगे।',
      'समय ठीक-ठीक याद न हो तो 12:00 दोपहर मान लिया जाता है, पर तब परिणाम को अनुमान की तरह पढ़िए। जन्म स्थान भी ज़रूरी है, क्योंकि लग्न अक्षांश-देशांतर से निकलता है।',
    ],
  },
  {
    id: 'pregnancy-medical',
    h2: 'When will I get pregnant — जहाँ ज्योतिष रुक जाता है',
    paras: [
      'यह वह जगह है जहाँ ईमानदार होना ज़रूरी है। **गर्भधारण एक चिकित्सकीय घटना है।** ज्योतिष उसका समय नहीं बता सकता, और जो टूल बताने का दावा करे वह आपसे झूठ बोल रहा है।',
      'ज्योतिष जो कर सकता है वह यह है: संतान योग का बल बताना, अनुकूल दशा-गोचर की खिड़की बताना, और शास्त्रीय उपाय सुझाना। इसे सहायक जानकारी की तरह लीजिए, निदान की तरह नहीं।',
      'अगर गर्भधारण में देरी हो रही है तो पहला कदम डॉक्टर है, ज्योतिषी नहीं। हम यह बात हर परिणाम के नीचे लिखते हैं, और आगे भी लिखते रहेंगे — चाहे उससे कुछ लोग नाराज़ हों।',
    ],
  },
  {
    id: 'ivf-jyotish',
    h2: 'IVF और ज्योतिष — दोनों साथ चल सकते हैं?',
    paras: [
      'हाँ, और इसमें कोई विरोधाभास नहीं है। शास्त्र कहीं भी चिकित्सा को मना नहीं करता। संतान योग का मतलब है संतान की संभावना — वह किस मार्ग से पूरी होती है, इस पर ग्रंथ चुप हैं।',
      'व्यवहार में हमारे पास आने वाले कई लोग पहले से चिकित्सा उपचार पर होते हैं। उनके लिए कुंडली का काम इलाज बदलना नहीं होता — वह समय, धैर्य और मानसिक सहारे का सवाल होता है।',
      'इसलिए इस पेज पर आपको कहीं यह नहीं मिलेगा कि उपाय करने से इलाज की ज़रूरत नहीं रहेगी। ऐसा कहना ग़लत भी है और नुक़सानदेह भी।',
    ],
  },
  {
    id: 'sanket-chinh',
    h2: 'संतान प्राप्ति के संकेत — कुंडली में क्या दिखता है',
    paras: [
      'कुंडली में जो दिखता है वह **संकेत** है, शगुन नहीं। सबसे स्पष्ट पाँच: पंचम भाव में शुभ ग्रह; बलवान पंचमेश केंद्र या त्रिकोण में; गुरु की पंचम पर प्रबल दृष्टि; सप्तांश का राशि चक्र से सहमत होना; और पंचमेश या गुरु की दशा का चलना।',
      'जब इनमें से तीन या अधिक एक साथ हों, स्कोर स्वाभाविक रूप से ऊपर आता है। पर असली काम की बात यह नहीं है कि कितने मिले — असली बात यह है कि जो नहीं मिले, वे क्यों नहीं मिले।',
      'इसीलिए परिणाम में **क्या रोक रहा है** वाला हिस्सा अलग से आता है। वही वह जगह है जहाँ उपाय लगता है।',
    ],
  },
  {
    id: 'marriage-child',
    h2: 'Marriage and child prediction by date of birth — दोनों एक साथ क्यों नहीं',
    paras: [
      'विवाह और संतान दो अलग भाव, दो अलग कारक और दो अलग वर्ग कुंडलियों से देखे जाते हैं। **विवाह — सप्तम भाव, शुक्र, नवमांश D-9। संतान — पंचम भाव, गुरु, सप्तांश D-7।**',
      'जो टूल एक ही गणना से दोनों बता दे, वह किसी एक को सही और दूसरे को अंदाज़े से दे रहा है। यही वजह है कि हमने इन्हें अलग रखा है।',
      'संतान का हिसाब यह पेज करता है। संबंध यह है कि विवाह में देरी संतान की खिड़की को आगे खिसका देती है — पर वह समय का प्रश्न है, योग का नहीं।',
    ],
  },
  {
    id: 'free-me-kya',
    h2: 'Free mein kya milta hai aur Rs 51 mein kya khulta hai',
    paras: [
      '**Free:** aapka poora score, band, saat blocks ke saare ank, teen sabse mazboot findings ki **poori wajah** asli number ke saath, aur jo cheezein rok rahi hain unke naam ek-ek line ke saath.',
      '**Rs 51 (India) / $7 (international):** baaki har niyam ka poora kaaran, saptamsa D-7 ka poora breakdown, dasha aur gochar ki khidki, aur aapke apne panchmesh par aadharit upay ki disha.',
      'Free tier jaan-boojh kar itna rakha gaya hai ki aapko yaqeen ho jaaye ki chart sach mein padha gaya hai — teen findings poore kaaran ke saath. Jo bacha hai wo chhupaya nahi gaya, wo bas abhi bheja nahi gaya: free response mein paid text hota hi nahi hai.',
    ],
  },
];

const FAQS = [
  {
    q: 'Santan Yog Calculator kaam kaise karta hai?',
    a: 'Aapki janm-kundali Swiss Ephemeris se banti hai, phir saat blocks par 100 mein score banta hai — panchma bhava aur uska swami (22), Saptamsa D-7 (24), Guru yaani santan karak (18), Jaimini Putrakaraka (8), panchma bhava par drishti (12), Putra Dosh/Pitra Dosh jaisi baadhaayein (10), aur abhi chal rahi dasha (6). Har block apna ank aur uska asli number dono dikhata hai.',
  },
  {
    q: 'Kya ye bata sakta hai ki mujhe santan hogi ya nahi?',
    a: 'Nahi, aur jo tool ye daawa kare usse door rahiye. Ye ek Yog Strength Score hai — aapke chart mein santan ke classical yog kitne aur kitne mazboot hain, aur unke raaste mein kya hai. Santan ka prashna sabse pehle medical hai. Kam score ka matlab "santan nahi hogi" kabhi nahi hota.',
  },
  {
    q: 'Saptamsa D-7 kya hai aur ye kyun zaroori hai?',
    a: 'Saptamsa saatvaan divisional chart hai. Brihat Parashara Hora Shastra ke Chapter 6 mein saaf likha hai ki santan ka nirnay Saptamsa se hota hai. Rasi chart vaada dikhata hai, Saptamsa uski pushti karti hai. Zyadatar free tools D-7 chhod dete hain aur Navamsa D-9 se santan padhne lagte hain — wo vivah ka varga hai, santan ka nahi.',
  },
  {
    q: 'Putra hoga ya putri — ye calculator bata sakta hai?',
    a: 'Nahi. Bharat mein garbhasth shishu ka ling batana PCPNDT Act, 1994 ke antargat dandaniya apradh hai. Hum ye jaankari na dete hain, na dene ka prayas karte hain. Jo bhi tool ya jyotishi ye daawa kare, usse doori banaiye.',
  },
  {
    q: 'Kitne bacche honge — kya iska pakka number milta hai?',
    a: 'Nahi, aur jaan-boojh kar nahi. Shastra mein sankhya ka anuman panchma bhava, panchmesh aur Saptamsa ke panchma se lagaya jata hai, par wo anuman hai — ginti nahi. Aaj sankhya mein chikitsa, aarthik nirnay aur vyaktigat chunav bhi shamil hain. Isliye hum sankhya ke bajaye bal aur samay batate hain.',
  },
  {
    q: 'Putrakaraka kya hota hai?',
    a: 'Jaimini paddhati mein Putrakaraka wo graha hai jiske ansh saat grahon mein paanchve sabse adhik hon. Ye chara karak hai — har kundali mein badalta hai, jabki Guru sabke liye sthir karak hai. Calculator uska bal, uski sthiti aur us se panchma bhava — teenon dekhta hai.',
  },
  {
    q: 'Time of birth kitna zaroori hai?',
    a: 'Bahut. Lagna har do ghante mein badalta hai, aur lagna badalte hi 5th house badal jata hai — aur uske saath panchmesh bhi. Sirf date se kiya gaya vishleshan din mein baarah alag jawab de sakta hai. Samay pata na ho to 12:00 PM maan liya jata hai, par phir result approximate hi hai.',
  },
  {
    q: 'Score kam aaye to kya karein?',
    a: 'Sabse pehle "kya rok raha hai" wala hissa padhiye — wo naam leta hai ki kaunsa graha, kaunsa bhava aur kitna. Uske baad upay ki disha usi graha ki hoti hai, aam santan upay ki nahi. Aur agar santan mein vaastavik deri ho rahi hai to pehla kadam doctor hai, jyotishi nahi.',
  },
  {
    q: 'Kya Pitra Dosh se santan mein baadha aati hai?',
    a: 'Shastra dono ko jodta hai — panchma bhava purva janma ke punya ka bhava hai aur navam bhava pitru sthan hai, dono trikona hain. Calculator Pitra Dosh ke teen classical sanket jaanchta hai: Surya-Rahu yuti, navam bhava mein paap graha, aur navamesh ka dusthana mein jana. Agar ye milte hain to upay alag shreni ka hota hai.',
  },
  {
    q: 'Kya ye calculator sach mein free hai?',
    a: 'Haan. Score, saare saat blocks ke ank, teen sabse mazboot findings ki poori wajah, aur blockers ke naam — sab free. Rs 51 mein baaki niyamon ki poori wajah, Saptamsa ka poora breakdown, timing window aur upay ki disha khulti hai.',
  },
];

const COMPARE = [
  { f: 'Saptamsa D-7 (BPHS ki santan varga)', tv: 'Haan — 24 ank, poora breakdown', as: 'Nahi', at: 'Nahi' },
  { f: 'Har ank ke saath asli number', tv: 'Haan — Shadbala ratio aur virupas', as: 'Nahi', at: 'Nahi' },
  { f: 'Jaimini Putrakaraka', tv: 'Haan — bal aur us se panchma', as: 'Nahi', at: 'Nahi' },
  { f: 'Degree-precise drishti (virupa)', tv: 'Haan', as: 'House-count', at: 'House-count' },
  { f: 'Ling batata hai (PCPNDT)', tv: 'Nahi — kanoonan mana hai', as: 'Nahi', at: 'Nahi' },
  { f: 'Pakka bachchon ka number', tv: 'Nahi — jaan-boojh kar', as: 'Kabhi-kabhi', at: 'Kabhi-kabhi' },
  { f: 'Medical seema saaf likhi', tv: 'Haan — har result par', as: 'Nahi', at: 'Nahi' },
];

const READ_MORE = [
  { href: '/learn/number-of-children-prediction', t: 'संतान संख्या की भविष्यवाणी — पूरा शास्त्रीय गाइड' },
  { href: '/learn/child-birth-prediction', t: 'Child Birth Prediction — house by house' },
  { href: '/blog/jupiter-putrakaraka-child-destiny-astrology', t: 'गुरु, पुत्रकारक और संतान भाग्य' },
  { href: '/blog/fifth-lord-child-aptitude-astrology-hindi', t: 'पंचमेश और संतान की प्रवृत्ति' },
  { href: '/blog/santan-prapti-mein-deri-astrology-upay', t: 'संतान प्राप्ति में देरी और शास्त्रीय उपाय' },
  { href: '/blog/dasha-timing-child-development-astrology', t: 'दशा समय और संतान विकास' },
  { href: '/blog/pitra-dosh-childbirth', t: 'पितृ दोष और संतान बाधा' },
  { href: '/blog/childs-destiny-future-astrology', t: 'बच्चे का भविष्य कुंडली से' },
  { href: '/blog/saraswati-yoga-child-education-astrology', t: 'सरस्वती योग और संतान की शिक्षा' },
  { href: '/blog/child-birth-muhurat', t: 'संतान जन्म मुहूर्त' },
];

const MORE_CALC = [
  { href: '/calculators/free-kundali-calculator', t: 'Free Kundali Calculator' },
  { href: '/calculators/free-dasha-calculator', t: 'Free Dasha Calculator' },
  { href: '/calculators/free-graha-bal-calculator', t: 'Graha Bal (Shadbala) Calculator' },
  { href: '/calculators/free-pitra-dosh-calculator', t: 'Free Pitra Dosh Calculator' },
  { href: '/calculators/free-kaal-sarp-dosh-calculator', t: 'Free Kaal Sarp Dosh Calculator' },
  { href: '/calculators/free-manglik-dosh-calculator', t: 'Free Manglik Dosh Calculator' },
  { href: '/calculators/free-child-birth-muhurat-calculator', t: 'Child Birth Muhurat Calculator' },
  { href: '/calculators/free-baby-name-by-nakshatra', t: 'नक्षत्र से बच्चे का नाम' },
  { href: '/hast-rekha-calculator', t: 'हस्तरेखा कैलकुलेटर' },
  { href: '/calculators/free-ias-astrology-calculator', t: 'IAS / Sarkari Naukri Yog Calculator' },
];

export default function FreeSantanYogCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-santan-yog-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Santan Yog Calculator — संतान योग कुंडली से, Free',
    description:
      'Free Santan Yog Calculator. Apni kundali se santan yog ka bal jaaniye — panchma bhava, Saptamsa D-7, Guru, Putrakaraka, drishti aur dasha, har ank ki wajah asli number ke saath. Trikaal Vaani.',
    breadcrumbName: 'Santan Yog Calculator',
    aboutEntities: [
      'Santan Yog', 'Fifth House', 'Saptamsa', 'Jupiter', 'Putrakaraka',
      'Putra Dosh', 'Pitra Dosh', 'Shadbala', 'Vimshottari Dasha',
    ],
    knowsAbout: [
      'Vedic Astrology', 'Jyotish Shastra', 'Saptamsa D-7', 'Shadbala',
      'Jaimini Karakas', 'Santan Yog', 'Progeny Astrology',
    ],
    howToName: 'How to check your Santan Yog from your Kundali',
    howToSteps: [
      { name: 'Enter birth details', text: 'Enter your date, exact time and place of birth. Time matters most, because the lagna and with it the 5th house depend on it.' },
      { name: 'The chart is computed', text: 'Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali, the Saptamsa D-7 progeny chart, full Shadbala for all seven planets and degree-precise drishti in virupas.' },
      { name: 'Read the reasons, not just the score', text: 'Every rule shows the points it awarded and the figure behind it — which planet, which house, what Shadbala ratio, and how strong each aspect actually is.' },
    ],
    faqs: FAQS,
    dateModified: '2026-09-02',
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
            <span style={{ color: '#94a3b8' }}>Santan Yog Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>
              Santan Yog Calculator — संतान योग कैलकुलेटर
            </h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>
              पंचम भाव, सप्तांश D-7, गुरु और पुत्रकारक — संतान योग का बल आपकी कुंडली से, हर अंक की वजह के साथ।
            </p>
          </header>

          {/* ── AEO / GEO direct answer, 40-60 words ─────────────────── */}
          <div className="tv-aeo-answer rounded-xl p-5 mb-6"
            style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed m-0">
              <strong style={{ color: GOLD }}>संतान योग</strong> कुंडली के{' '}
              <strong style={{ color: GOLD }}>पंचम भाव, पंचमेश, गुरु और सप्तांश (D-7)</strong> से पढ़ा जाता है — बृहत् पाराशर होरा शास्त्र संतान का निर्णय सप्तांश से करने को कहता है।{' '}
              <strong style={{ color: GOLD }}>Trikaal Vaani का Free Santan Yog Calculator</strong> इन चारों परतों पर 100 में स्कोर देता है, और हर अंक के साथ उसका असली आँकड़ा भी — षड्बल और विरुपा सहित।
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
                Engine: Swiss Ephemeris · Saptamsa D-7 · Shadbala · Lahiri Ayanamsha
              </div>
            </div>
          </div>

          {/* ── Medical + legal boundary, stated before the tool ─────── */}
          <section className="rounded-xl p-4 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              दो बातें पहले ही साफ़ कर देना ज़रूरी है। <strong style={{ color: GOLD }}>पहली</strong> — संतान का प्रश्न सबसे पहले चिकित्सकीय है। यह कैलकुलेटर योग का बल और समय बताता है, निदान नहीं; किसी भी शारीरिक चिंता के लिए योग्य डॉक्टर से ही परामर्श लीजिए, और कम स्कोर का अर्थ कभी भी &ldquo;संतान नहीं होगी&rdquo; नहीं होता।{' '}
              <strong style={{ color: GOLD }}>दूसरी</strong> — गर्भस्थ शिशु का लिंग बताना भारत में PCPNDT अधिनियम, 1994 के अंतर्गत अपराध है। हम यह जानकारी न देते हैं, न देने का प्रयास करते हैं।
            </p>
          </section>

          {/* ── The calculator ───────────────────────────────────────── */}
          <YogCalculator config={{
            type: 'santan',
            scoreLabel: 'Santan Yog Strength Score',
            breakdownHeading: 'Har point ki wajah',
            hintsHeading: 'Upay kis disha mein',
            hintsTeaser: 'Aapke apne panchmesh par aadharit upay ki disha',
            showNextStep: false,
            ctaHref: '/calculators',
            ctaLabel: 'Mera Santan Yog dekho',
            ctaPrice: '₹51',
            ctaBlurb: 'Poori reading upar khul chuki hai.',
          }} />

          {/* ── Table of contents ────────────────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-16 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {PILLAR.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>
                    {s.h2}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── 35 keyword-driven H2 sections ────────────────────────── */}
          <section className="mt-12">
            {PILLAR.map((s, si) => (
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
              Trikaal Vaani vs AstroSage vs AstroTalk — Santan Yog par
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak varga ka hai. Zyadatar free tools santan ko{' '}
              <strong style={{ color: GOLD }}>rasi chart ya Navamsa D-9</strong> se padhte hain. D-9 vivah ka varga hai.
              BPHS Ch.6 santan ke liye <strong style={{ color: GOLD }}>Saptamsa D-7</strong> kehta hai — aur wahi is
              calculator ke 100 mein se 24 ank uthata hai.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <caption className="sr-only">Santan yog calculators ki tulna</caption>
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
              Aksar puche jaane wale sawaal — Santan Yog
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
              संतान ज्योतिष पर पूरा गाइड पढ़ें
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
