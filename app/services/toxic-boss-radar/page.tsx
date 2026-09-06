/**
 * TRIKAAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/services/toxic-boss-radar/page.tsx
 * Version: 5.0 (06 Sep 2026) — CALCULATOR CONVERSION + keyword content
 *
 * WHAT CHANGED AND WHY
 *   1. THE CTA WENT NOWHERE. All three buttons pointed at /?segment=toxic-boss.
 *      Nothing in the repo reads that query parameter — category selection is
 *      React state set by CLICKING a homepage card. The visitor landed on the
 *      plain homepage and had to scroll, pick the right age tab and find the
 *      card again. The slug is also toxic-boss-RADAR, so even the value was
 *      wrong; both were equally ignored.
 *   2. THE OFFER WAS INVERTED. BirthForm has a free tier and the homepage says
 *      "Free chart reading for this topic". This page said ₹51 everywhere.
 *   3. DOUBLE-BRANDED TITLE. 67 chars plus app/layout.tsx's "%s | Trikaal
 *      Vaani" template = 83 rendered, cut by Google at ~58.
 *
 *   The real BirthForm now sits on the page, preselected to genz_toxic_boss.
 *
 * THIS DOMAIN IS DUAL-CHART — DO NOT CHANGE THE DOMAIN ID
 *   BirthForm's DUAL_CHART_DOMAINS = ['genz_ex_back','genz_toxic_boss'].
 *   With that id the form renders a SECOND birth-details block for the boss
 *   and requires their name, DOB and place (BirthForm L981), then sends
 *   person2Data to /api/predict (L1030). Change the id and the second chart
 *   silently disappears — the reading becomes a single-chart career reading
 *   while the page still promises a comparison.
 *
 * GSC, 3 months to 4 Sep 2026: 170 impressions, 5 clicks, CTR 2.94%,
 * average position 8.1 — page one already. The ranking was never the problem.
 *
 * CANNIBALISATION — the site already carries ~26 career pages, most 2,200-3,900
 *   words: /blog/career-prediction-kundli-complete-guide (3,447) and its Hindi
 *   twin (3,784), /blog/dasha-timing-transfer-conflict-peak-astrology (2,262)
 *   +hindi, /blog/dream-career-profession-astrology (3,472) +hindi,
 *   /blog/budh-mahadasha-career-mercury (3,086), /learn/career-prediction-
 *   astrology and more. Those own CAREER GENERALLY.
 *   THIS PAGE OWNS ONE QUESTION: is this workplace situation karmic and
 *   time-bound, or is it a signal to leave — and when. Every general career
 *   branch is handed off by link, never re-explained here.
 *
 * KEYWORDS — Radar E3, live SERP, checked 05 Sep 2026
 *   boss se pareshan jyotish upay .......... our_rank 17  AIO partial
 *   workplace problem astrology solution ... our_rank —   AIO recommends_tool
 *   office politics astrology remedy ....... our_rank —   AIO recommends_tool
 *   naukri me tension ka jyotish upay ...... our_rank —   AIO partial
 *   job change kab hoga kundli se .......... our_rank —   AIO recommends_tool
 *   कार्यक्षेत्र में शत्रु बाधा उपाय ............. our_rank —   AIO recommends_tool
 *
 * SHATRU BAADHA — COVERED, AND COVERED PROPERLY
 *   The Hindi PASF here is dominated by shatru-naash searches:
 *   "शत्रु नाश उपाय", "कार्यक्षेत्र में शत्रु बाधा उपाय", "गुप्त शत्रु को कैसे पहचाने",
 *   "शत्रु नाशक टोटके लाल किताब". This is a genuine classical category —
 *   the sixth house IS the house of enemies, Hanuman is the deity of
 *   protection from adversaries, and Bajrang Baan, Sundarkand, Durga
 *   Saptashati and Mangal mantras are standard, mainstream practice. Sections
 *   'shatru-baadha', 'shatru-upay' and 'lal-kitab-upay' below cover it at
 *   depth, because it is what the reader actually came to ask.
 *
 *   The one thing written nowhere on this page is a ritual aimed AT a named
 *   individual — the "badla lene ka totka" subset. Everything here strengthens
 *   the READER's own sixth house, Saturn and Mangal. That is also how the
 *   classical texts frame it: vijay over adversity, not injury to a person.
 
 *
 * v4.1 CHANGES vs v4.0:
 *   ❌ REMOVED fake testimonials (fabricated reviews + ★★★★★ + "Verified Experiences")
 *   ❌ REMOVED phantom ₹499 (hero call button, step 04, card strike-through, CTA button)
 *   ✅ /about → /founder (correct author URL — 3 spots)
 *   ✅ keyword "vedic astrologer Delhi" → "India"
 *   ✅ KEPT Maa Divine Seva (real Arzi/Dhanyewaad dakshina feature)
 *   ✅ Brand/Jini/Prokerala/vendor already clean — left intact
 *   ✅ Real price on this page = ₹51 (reading)
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import ServiceReadingForm from '@/components/services/ServiceReadingForm';

export const metadata: Metadata = {
  title: { absolute: "Boss Se Pareshan? Free Kundli Jaanch | Trikaal Vaani" },
  description: "Chief Vedic Architect Rohiit Gupta reads your 10th House, Saturn & Rahu to reveal if your toxic boss is a karmic lesson with an end date — or a sign to leave now. ₹51 deep reading.",
  keywords: ["toxic boss astrology", "workplace astrology vedic", "10th house boss karma", "Saturn career astrology India", "Rohiit Gupta vedic astrologer India"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  openGraph: { title: "Is My Boss Toxic? | Trikaal Vaani", description: "Rohiit Gupta decodes your 10th House, Saturn & authority karma.", url: "https://trikalvaani.com/services/toxic-boss-radar", siteName: "Trikaal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/toxic-boss-radar" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Toxic Boss Radar — Workplace Karma Reading", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/founder" }, offers: [{ "@type": "Offer", price: "51", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Can astrology tell if my boss is truly toxic or if I should leave?", acceptedAnswer: { "@type": "Answer", text: "Yes. The 10th house governs career and authority figures. Saturn's transit determines whether the friction is temporary karma or a karmic exit signal. Rohiit Gupta reads both to give you a clear answer with timing." } },
      { "@type": "Question", name: "What is the 6th house in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "The 6th house governs enemies, obstacles, disputes, and workplace conflict. When your 10th lord sits in the 6th house, workplace adversity intensifies. This pattern is karmic, not personal — and it has an end date." } },
      { "@type": "Question", name: "How does Dasha timing help with job change decisions?", acceptedAnswer: { "@type": "Answer", text: "Vimshottari Dasha gives a 120-year planetary timeline. Changing jobs during Jupiter or Sun Dasha with positive 10th house activation creates career breakthroughs. Rohiit Gupta reads your exact Dasha to give you the right timing." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Toxic Boss Radar", item: "https://trikalvaani.com/services/toxic-boss-radar" }] },
  ],
};


// ════════════════════════════════════════════════════════════════════════════
// v5.0 CONTENT — decision side only. Read the cannibalisation note in the file
// header before adding any heading here.
// ════════════════════════════════════════════════════════════════════════════

type TbSection = { id: string; h2: string; paras: string[] };

const V6_SECTIONS: TbSection[] = [
  {
    id: 'kaise-kaam',
    h2: 'Toxic Boss Radar — kaam kaise karta hai',
    paras: [
      'Upar wale form mein **aapka janm vivaran** daaliye, aur uske neeche **apne boss ka**. Reading dono chart padhti hai — isi liye ise dual chart kehte hain.',
      'Dekha kya jaata hai: aapka **dasham bhaav aur uska swami** (karm aur adhikari), **Shani** ki sthiti aur gochar, **chhathaa bhaav** (shatru, pratiyogita, seva), **Rahu** ka hissa, aur **chal rahi dasha** — jo batati hai ye daur kab tak hai.',
      '**Pehla reading free hai.** Poora vistrit vishleshan chahiye to uske baad ₹51 ka vikalp aata hai.',
    ],
  },
  {
    id: 'do-chart-kyun',
    h2: 'Do kundali kyun chahiye — ek se kaam kyun nahi chalta',
    paras: [
      'Ye page un chunidha readings mein hai jo **do chart** maangti hai, aur uski wajah saaf hai.',
      'Ek chart batata hai ki **aap** kaise hain — aapka dasham, aapka Shani, aapka chhathaa bhaav. Par sawaal "mera boss kaisa hai" nahi hai, sawaal **"mera aur unka mel kaisa hai"** hai. Wo sirf do chart se nikalta hai.',
      'Dekha jaata hai: unka graha aapke kis bhaav par pad raha hai, aapka Shani unke kis bhaav ko chhoo raha hai, aur kya unka Mangal ya Shani aapke dasham par bhaari hai. Yahi wo sthiti hai jahan do log alag-alag theek hote hain par saath mein nahi chalte.',
      'Aur isi liye ye reading kabhi ye nahi kehti ki **boss bura insaan hai** — wo kehti hai ki **ye jodi bhaari hai**, jo alag baat hai aur zyada kaam ki hai.',
    ],
  },
  {
    id: 'boss-ka-vivaran-nahi',
    h2: 'Boss ka janm vivaran nahi pata — tab kya karein',
    paras: [
      'Ye sabse vyavharik dikkat hai, aur imandari se kehna zaroori hai: **zyadatar log apne boss ka janm samay nahi jaante.**',
      'Kya kaam chal jaata hai: **sirf janm tithi** se bhi kaafi kuch nikal aata hai — unka Surya, Mangal aur Guru ki rashi, aur mote taur par unka swabhav. **Samay ke bina unka lagna aur bhaav nahi banenge**, isliye vishleshan aadha rahega.',
      'Kaise pata karein — LinkedIn ya office ka birthday calendar, HR ka record, ya bas poochh lena. Janm tithi maangna asaamanya nahi hai; samay maangna hai.',
      'Aur agar bilkul na mile: **sirf apna chart daal kar bhi reading li ja sakti hai.** Tab wo batayegi ki **aapke** chart mein ye daur kyun aa raha hai aur kab tak hai — jo waise bhi asli sawaal hai. Boss ka chart usme gehrai jodta hai, uski jagah nahi leta.',
    ],
  },
  {
    id: 'dasham-bhaav',
    h2: 'Dasham bhaav — karm, pad aur adhikari ka bhaav',
    paras: [
      'Kaam se juda har prashn **dasham bhaav** se shuru hota hai. Shastra mein ise **karm bhaav** kaha gaya hai — pesha, pad, samaj mein sthaan, aur **adhikari** bhi.',
      'Dekha kya jaata hai: **dasham ka swami kahan baitha hai** (kendra ya trikona mein ho to sthiti mazboot; chhathe, aathve ya barahve mein ho to sangharsh), **uska bal**, aur **dasham par kiski drishti hai** — Guru ki drishti raksha deti hai, Shani aur Mangal ki dabav.',
      'Ek zaroori antar: **dasham "naukri milegi ya nahi" nahi batata** — wo batata hai ki kaam ke kshetra mein aapki sthiti kaisi rahegi. Naukri milne ka prashn chhathe bhaav (sewa) aur dasha se juda hai. Career ka poora vishleshan [Career Prediction Astrology](/learn/career-prediction-astrology) par hai.',
    ],
  },
  {
    id: 'shani-boss',
    h2: 'Shani — karm ka kaarak, aur boss ka bhi',
    paras: [
      'Shastra mein **Shani karm ka kaarak** hai, aur isi kaaran wo **adhikari, malik aur boss** ka bhi kaarak maana jaata hai. Isi liye har workplace prashn Shani se guzarta hai.',
      'Do cheezein dekhi jaati hain. **Janm ka Shani** — wo kis bhaav mein hai, kis rashi mein, aur kitna balwan. Balwan Shani ke saath adhikariyon ke saath sambandh sahaj rehta hai; peedit Shani ke saath wahi rishte bhaari padte hain.',
      '**Chalta hua Shani** — yaani gochar. Jab Shani aapke dasham, lagna ya chhathe bhaav se guzarta hai, tab kaam ka dabav badhta hai. Ye daur saalon ka hota hai, aur uska ant nishchit hota hai — yahi sabse raahat wali baat hai.',
      'Shani ka poora swabhav [Shani Mahadasha](/blog/shani-mahadasha-effects-guide) mein khola gaya hai.',
    ],
  },
  {
    id: 'chhathaa-bhaav',
    h2: 'Chhathaa bhaav — shatru, pratiyogita aur sewa',
    paras: [
      'Ye bhaav is poore vishay ka dil hai, aur uska arth aksar galat samjha jaata hai.',
      '**Chhathaa bhaav teen cheezon ka hai: rog, rin aur shatru.** Iske saath **sewa** (naukri, job) bhi isi bhaav se dekhi jaati hai — jo ek gehri baat hai: shastra naukri ko sewa aur pratiyogita ke bhaav mein rakhta hai, sukh ke bhaav mein nahi.',
      'Isi liye workplace ka takrav yahin dikhta hai. Chhathe bhaav mein baithe graha, uska swami kahan hai, aur us par kiski drishti hai — teeno se pata chalta hai ki kaam ki jagah par virodh kis roop mein aayega.',
      'Aur ek baat jo raahat deti hai: **balwan chhathaa bhaav ashubh nahi hai** — wo pratiyogita mein jitaata hai. Agle section mein wahi khola gaya hai.',
    ],
  },
  {
    id: 'shatru-baadha',
    h2: 'कार्यक्षेत्र में शत्रु बाधा — कुंडली में कैसे दिखती है',
    paras: [
      'यह प्रश्न सबसे अधिक खोजा जाता है, और शास्त्र में इसका स्पष्ट उत्तर है — छठा भाव **रिपु स्थान** कहलाता है, यानी शत्रु का घर।',
      'देखे जाने वाले संकेत: **छठे भाव में बैठे ग्रह** और उनका स्वभाव, **छठे भाव के स्वामी की स्थिति**, दशम भाव पर **मंगल या शनि की दृष्टि**, और **राहु** का दशम या छठे से संबंध — राहु छिपे विरोध, अफ़वाह और राजनीति का कारक है।',
      '**गुप्त शत्रु** कैसे पहचानें — शास्त्र में बारहवाँ भाव गुप्त शत्रु और पीठ पीछे की हानि का माना गया है। यदि छठे भाव का स्वामी बारहवें में हो, या राहु बारहवें में हो, तो विरोध सामने नहीं, पीछे से आता है। यह वही स्थिति है जिसमें व्यक्ति कहता है कि "कुछ हो रहा है पर पता नहीं क्या"।',
      'और वह बात जो संतुलन के लिए ज़रूरी है: **छठा भाव मज़बूत होना अच्छा है।** बलवान छठा भाव प्रतियोगिता जिताता है, मुक़दमे में जीत देता है और विरोध सहने की क्षमता देता है।',
    ],
  },
  {
    id: 'shatru-upay',
    h2: 'शत्रु बाधा के शास्त्रीय उपाय — जो वास्तव में किए जाते हैं',
    paras: [
      'यह वह श्रेणी है जो हर परंपरा में है और सबसे अधिक की जाती है। यहाँ वही दिया गया है जो शास्त्रीय है।',
      '**हनुमान उपासना** — शत्रु बाधा का सबसे प्रचलित और सबसे सरल उपाय। **हनुमान चालीसा** का नियमित पाठ, मंगलवार और शनिवार को; कठिन दौर में **बजरंग बाण**; और बड़े संकट में **सुंदरकांड** का पाठ। हनुमान जी संकटमोचन हैं और शास्त्र में उन्हें ही विरोध से रक्षा का देवता कहा गया है।',
      '**मंगल के उपाय** — मंगल छठे भाव और विजय का कारक है। "ॐ अं अंगारकाय नमः" का जाप, मंगलवार को व्रत, और मसूर दाल या गुड़ का दान। बलवान मंगल विरोध के सामने टिकने की शक्ति देता है।',
      '**शनि के उपाय** — क्योंकि अधिकारी शनि के अधीन हैं। शनिवार को "ॐ शं शनैश्चराय नमः", सरसों के तेल का दीपक, और काले तिल या लोहे का दान। **दुर्गा सप्तशती** का पाठ भी बाधा निवारण के लिए कहा गया है।',
      'ध्यान देने की बात: ये सभी उपाय **आपके अपने छठे भाव, मंगल और शनि को बल देते हैं** — किसी व्यक्ति पर नहीं किए जाते। शास्त्र में विजय का अर्थ बाधा पार करना है, किसी का नाश नहीं।',
    ],
  },
  {
    id: 'lal-kitab-upay',
    h2: 'लाल किताब के कार्यक्षेत्र उपाय',
    paras: [
      'लाल किताब की अपनी अलग पद्धति है और उसके उपाय सस्ते, सरल और घरेलू होते हैं — यही उनकी लोकप्रियता का कारण है।',
      'कार्यक्षेत्र और अधिकारी से जुड़े प्रचलित उपाय: **शनिवार को पीपल के पेड़ पर जल** चढ़ाना और दीपक जलाना; **कार्यस्थल पर काले या नीले रंग से बचना** यदि शनि पीड़ित हो; **मंगलवार को हनुमान मंदिर में सिंदूर** चढ़ाना; और **तांबे के सिक्के** या साबुत मसूर पास रखना।',
      'नौकरी में स्थिरता के लिए लाल किताब **मीठी रोटी कुत्ते को खिलाने** और **बहते जल में नारियल प्रवाहित करने** की बात करती है — दोनों में कोई ख़र्च नहीं है।',
      'एक ज़रूरी बात: **लाल किताब और पराशरी अलग पद्धतियाँ हैं** और इन्हें मिलाकर नहीं पढ़ना चाहिए। यह पेज पराशरी आधार पर चलता है; लाल किताब के उपाय यहाँ इसलिए दिए हैं क्योंकि लोग उन्हें ढूँढ़ते हैं और वे स्वयं में हानिरहित हैं।',
    ],
  },
  {
    id: 'karmic-hai-kya',
    h2: 'Boss se pareshan — kya ye karmic hai ya sirf bura sanyog',
    paras: [
      'Ye sawal is page ka mool hai, aur uska uttar dono taraf imandar hona chahiye.',
      'Jab jyotish ise **karmic** kehta hai, uska matlab itna hai ki **chart mein us kshetra mein dabav ka sanket pehle se maujood tha** — Shani ka dasham par gochar, chhathe bhaav ka sakriy hona, ya kisi khaas dasha ka chalna. Yaani ye achanak nahi aaya.',
      'Par iska matlab **ye bilkul nahi** ki aap use jhelte rahiye. "Karmic hai" ko log kabhi-kabhi "sehna hi padega" samajh lete hain — wo galat padhai hai. Shastra kahin nahi kehta ki dabav ke aage jhukna dharm hai.',
      'Sahi arth ye hai: **daur ka ek aarambh hai aur ek ant.** Reading uska ant kab hai, wo batati hai — aur usi jaankari se faisla aasan ho jaata hai.',
    ],
  },
  {
    id: 'kab-tak-chalega',
    h2: 'Ye daur kab tak chalega — samay kaise nikalta hai',
    paras: [
      'Ye sabse kaam ka hissa hai, kyunki adhikansh log yahi jaanne aate hain.',
      'Samay **dasha** se aata hai, janm-chart se nahi. Dekha jaata hai: kya abhi **Shani ki Mahadasha ya Antardasha** chal rahi hai, kya **chhathe bhaav ke swami** ka daur hai, aur **gochar** mein Shani kis bhaav se guzar raha hai.',
      'Mote sanket: Shani ka kisi bhaav par gochar lagbhag **dhai saal** ka hota hai. Antardasha mahinon se le kar do-teen saal tak. Isliye uttar prayah "agle itne mahine" ke roop mein aata hai, ek tareekh ke roop mein nahi — aur jo koi sateek tareekh de, wo shastra se nahi bol raha.',
      'Apni chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) par free dikh jaati hai, aur transfer tatha takrav ke samay ka vistaar [Dasha timing — transfer aur conflict](/blog/dasha-timing-transfer-conflict-peak-astrology) mein hai.',
    ],
  },
  {
    id: 'job-change-kab',
    h2: 'Job change kab hoga kundli se — kaunse sanket dekhein',
    paras: [
      'Naukri badalne ka prashn dasham bhaav ka nahi, **dasham aur chhathe dono** ka hai — aur uska samay dasha se.',
      'Anukool sanket: **dasham ke swami ki dasha** ya antardasha shuru hona, **Guru ka dasham ya ekadash par gochar** (Guru ki drishti nayi raah kholti hai), aur **chhathe bhaav ke swami** ka daur — kyunki naukri chhathe bhaav ka vishay hai.',
      'Rukavat ke sanket: **Shani ka dasham par bhaari gochar** prayah badlaav ko dheema karta hai — sauda hota hai par der se. Aur **Rahu** ka daur badlaav to laata hai par uljhan ke saath, isliye us daur mein offer letter aane tak purani naukri chhodni nahi chahiye.',
      'Ek vyavharik salah jo har jyotishi deta hai: **naya haath mein aane se pehle purana mat chhodiye** — chahe chart kitna bhi anukool ho.',
    ],
  },
  {
    id: 'naukri-tension-upay',
    h2: 'Naukri mein tension ke upay — kaam ke aur muft',
    paras: [
      'Ye khoj bahut hoti hai aur iska uttar do hisson mein hona chahiye — kyunki ek hissa jyotish ka hai aur doosra nahi.',
      '**Jyotish waala hissa:** us graha ka upay jo aapke chart mein dabav de raha hai. Shani ho to Shanivar ka mantra aur sarson ke tel ka deepak; Mangal ho to Mangalwar ka jaap aur Hanuman upasana; Rahu ho to Shanivar ko nariyal aur Rahu ke mantra. Teeno mein paisa nahi lagta.',
      '**Jo jyotish ka hissa nahi hai:** neend, kaam ke ghante, ghar par baat karna, aur zaroorat ho to kisi se madad lena. Lagatar kaam ka dabav sehat par asar daalta hai, aur wo koi mantra theek nahi karta.',
      'Ye kehna is page ke vyapaar ke khilaf jaata hai par kehna zaroori hai: **agar sthiti aapki sehat ya neend par asar daal rahi hai, to pehla kadam upay nahi hai** — pehla kadam wo hai jo aapke haath mein hai.',
    ],
  },
  {
    id: 'office-politics',
    h2: 'Office politics aur Rahu — chhupa hua virodh',
    paras: [
      '"Office politics" ka jyotishiya naam **Rahu** hai. Wo maya, chhupav, afwah aur peeche se chalne wali chaal ka kaarak hai.',
      'Dekhne layak sthitiyaan: **Rahu dasham bhaav mein** — pad milta hai par vivad ke saath, aur pehchaan par sawal uthte hain. **Rahu chhathe mein** — ye asal mein anukool maana jaata hai, kyunki chhathe mein Rahu shatru ko harata hai. **Rahu barahve mein** — chhupa hua virodh aur peeche se hone wali hani.',
      'Aur ek sthiti jo aksar dikhti hai: **Rahu ki Mahadasha ya Antardasha mein office ka mahaul achanak badal jaata hai** — naye log, nayi rajneeti, purane sambandh badalte hue. Ye 18 saal ka daur hai aur uske andar antardasha badalti rehti hai.',
      'Rahu 18 saal ka daur deta hai aur usme office ka mahaul kai baar badalta hai — uska poora chakra [Rahu Mahadasha](/blog/rahu-mahadasha-effects-guide) mein khola gaya hai.',
    ],
  },
  {
    id: 'promotion-ruk-raha',
    h2: 'Promotion ruk raha hai — kundali kya kehti hai',
    paras: [
      'Ye alag prashn hai aur alag bhaav se dekha jaata hai, isliye ise takrav wale prashn se mila dena galat nishkarsh deta hai.',
      'Promotion ka prashn **dasham (pad)** aur **ekadash (laabh, poorti)** dono se juda hai. Anukool sthiti wo hai jahan dono bhaav mazboot hon aur unke swami achhi jagah baithe hon.',
      'Rukavat ke aam sanket: **dasham ka swami chhathe, aathve ya barahve mein**, dasham par **Shani ki bhaari drishti**, ya **ekadash ka swami peedit**. Iske saath dasha bhi dekhi jaati hai — kabhi bhaav mazboot hota hai par uska daur abhi aaya hi nahi hota.',
      'Aur ek imandar baat: **promotion ka bada hissa kundali mein hai hi nahi** — kaam, samay, aur sanstha ki sthiti uska bada hissa hain. Kundali batati hai ki hawa saath hai ya nahi, kishti aapko chalani hai.',
    ],
  },
  {
    id: 'boss-ka-chart',
    h2: 'Boss ke chart mein kya dekha jaata hai',
    paras: [
      'Jab dono chart maujood hon, tab unke chart se teen cheezein dekhi jaati hain — aur teeno **aapke** sandarbh mein.',
      '**Unka Shani aur Mangal** — ye do graha vyavhaar mein sakhti aur ugrata laate hain. Agar unka Shani aapke lagna ya dasham par pad raha hai, to unka anushasan aap par bhaari mehsoos hoga.',
      '**Unka Surya** — pad, adhikaar aur aatm-sammaan ka kaarak. Balwan Surya wale adhikari saaf aur seedhe hote hain par sammaan maangte hain; peedit Surya wale prayah asuraksha se chalte hain, aur wahi tanav ka roop leti hai.',
      '**Unka Rahu** — agar unka Rahu aapke dasham ya chhathe se juda hai, to sthiti mein chhupav aur rajneeti ka hissa zyada hoga. Ye jaan lena vyavharik hai: aise mein baat likhit rakhna hi sabse achha upay hai.',
    ],
  },
  {
    id: 'dono-chart-mel',
    h2: 'Dono chart ka mel — jodi bhaari kyun padti hai',
    paras: [
      'Yahi wo hissa hai jo ek chart se kabhi nahi milta, aur isi ke liye ye reading do chart maangti hai.',
      'Dekha jaata hai ki **unke graha aapke kis bhaav par gir rahe hain.** Agar unka Shani aapke chhathe bhaav par pade to takrav khula hoga; barahve par pade to chhupa hua; dasham par pade to seedha kaam par asar.',
      'Aur ulta bhi — **aapke graha unke kis bhaav par pad rahe hain.** Kabhi sthiti ye hoti hai ki aapka Mangal unke dasham par bhaari hai, yaani unhe aap se apni sthiti par khatra mehsoos hota hai. Ye sunne mein ajeeb lagta hai par bahut aam hai.',
      'Isi liye reading kabhi ye nahi kehti ki **kaun sahi hai aur kaun galat.** Wo batati hai ki **ye do chart ek saath kaise chalte hain** — aur us jaankari se aap apna vyavhaar badal sakte hain, chahe saamne wala na badle.',
    ],
  },
  {
    id: 'sade-sati-naukri',
    h2: 'Sade Sati aur naukri — kitna sach hai',
    paras: [
      'Sade Sati ka naam sunte hi log naukri ki chinta karte hain, isliye ise saaf karna zaroori hai.',
      '**Sade Sati Shani ka gochar hai** — janm Chandra rashi se barahvin, pehli aur doosri rashi par, lagbhag saadhe saat saal. Uska kaam kaam ke kshetra mein prayah **zimmedari badhana, dheerapan maangna aur shortcut band karna** hota hai.',
      'Jo saaf kehna chahiye: **Sade Sati naukri nahi chheenti.** Bahut se log usi daur mein promotion paate hain — kyunki Shani mehnat ka phal deta hai, roku nahi hai. Jo wo karta hai wo ye ki **aasan raste band ho jaate hain**, aur jo tik kar kaam karta hai wo aage badhta hai.',
      'Apni sthiti khud dekhni ho to [Sade Sati Calculator](/calculators/free-sade-sati-calculator) free hai — aur wo **Chandra rashi** se chalta hai, lagna se nahi, jo ek aam galti hai.',
    ],
  },
  {
    id: 'vipreet-raj-yoga',
    h2: 'Vipreet Raj Yoga — jab virodh hi unnati ka rasta ban jaaye',
    paras: [
      'Ye shastra ka wo hissa hai jo is page ke reader ke liye sabse zyada raahat dene wala hai, aur sabse kam bataya jaata hai.',
      '**Vipreet Raj Yoga** tab banta hai jab chhathe, aathve ya barahve bhaav ke swami aapas mein sambandh banayein — yaani teen "kathin" bhaav mil kar ek shubh yog bana dete hain. Shastra kehta hai aisa vyakti **kathinai ke raste se hi ooncha uthta hai.**',
      'Kaam ke sandarbh mein iska arth seedha hai: **jo takrav aaj bhaari lag raha hai, wahi aage chal kar aapki sabse badi taakat ban sakta hai.** Bahut se log jinhone mushkil boss ke saath kaam kiya, wahi baad mein khud achhe netritva dene wale nikle.',
      'Ye yog aam hai aur reading mein alag se dikhta hai. Poora vishay [Vipreet Raj Yoga](/learn/vipreet-raj-yoga) mein hai.',
    ],
  },
  {
    id: 'chhodun-ya-rukun',
    h2: 'Naukri chhodun ya rukun — reading kaise madad karti hai',
    paras: [
      'Ye page ye faisla **nahi** leta. Ye us faisle mein ek aur aankda deta hai — aur wo antar samajh lena zaroori hai.',
      'Jo ye batata hai: **abhi ka daur badlaav ke liye anukool hai ya nahi**, ye dabav ka daur kab tak dikh raha hai, aur agla anukool window kab hai. Teen jaankariyaan, bas.',
      'Jo ye **nahi** batata: aapki naukri surakshit hai ya nahi, naya offer achha hai ya nahi, aapki industry ka haal, ya aapke gharelu kharch. Ye chaaron uss faisle mein kundali se zyada bhaari hain.',
      'Sahi upyog: **agar aap pehle se soch rahe hain ki chhodna hai, to samay chun lijiye. Agar aap tay nahi kar paa rahe, to ye ek aur nazariya de dega.** Aur agar sthiti sehat par asar daal rahi hai — to samay ka intezaar mat kijiye.',
    ],
  },
  {
    id: 'naye-job-ka-samay',
    h2: 'Nayi naukri ke liye anukool samay',
    paras: [
      'Agar faisla ho chuka hai, to agla sawaal samay ka hai — aur wo dasha aur gochar dono se aata hai.',
      'Anukool maana jaata hai: **Guru ka dasham ya ekadash par gochar**, **dasham ke swami ka daur**, aur **Budh ki antardasha** — kyunki Budh sanvaad aur baatcheet ka kaarak hai, aur interview usi ka kshetra hai.',
      'Vyavharik salah: **interview aur baatcheet ke liye Budhwar ya Guruwar** anukool maane jaate hain, aur us din Rahu Kaal se bachna. Ye chhoti baatein hain par unka koi nuksan nahi.',
      'Aur wo baat jo dohrani chahiye: **taiyari pehle, din baad mein.** Anukool din par bina taiyari ke jaana kisi kaam ka nahi. Roz ka Rahu Kaal [Panchang](/panchang) par free hai.',
    ],
  },
  {
    id: 'dasham-kamzor',
    h2: 'Dasham bhaav kamzor nikla — matlab kya',
    paras: [
      'Ye result aata hai aur log ghabra jaate hain, isliye shanti se samajhna chahiye.',
      '**Kamzor dasham ka matlab "career nahi banega" nahi hai.** Iska matlab hai ki us kshetra mein **prayaas zyada lagega** — pehchaan der se milegi, shrey dene mein log kanjoosi karenge, aur pad ke liye mehnat zyada karni padegi.',
      'Aur ek zaroori baat: **dasham bhaav akela poora uttar nahi hai.** Uska swami kahan hai, uska bal kya hai, aur dasha kaunsi chal rahi hai — teeno mila kar tasveer banti hai. Kamzor bhaav par balwan swami prayah bhaari pad jaata hai.',
      'Bhaav aur graha ka bal alag se dekhna ho to [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) aur [Graha Bal Calculator](/calculators/free-graha-bal-calculator) free hain.',
    ],
  },
  {
    id: 'gupt-shatru',
    h2: 'गुप्त शत्रु को कैसे पहचानें — बारहवाँ भाव',
    paras: [
      'यह खोज बहुत होती है और इसका शास्त्रीय आधार असली है।',
      '**छठा भाव खुला विरोध है; बारहवाँ भाव गुप्त शत्रु और पीठ पीछे की हानि।** इसलिए जब कोई कहता है कि "कुछ चल रहा है पर सामने कुछ नहीं दिखता", तो देखने की जगह बारहवाँ भाव है।',
      'संकेत: **छठे भाव का स्वामी बारहवें में**, **राहु बारहवें में**, या बारहवें भाव पर क्रूर ग्रहों की दृष्टि। इन स्थितियों को गुप्त विरोध, अफ़वाह और छिपे नुक़सान से जोड़ा जाता है।',
      'व्यावहारिक बात, और यही सबसे काम की है: **ऐसी स्थिति में सबसे अच्छा उपाय लिखित रिकॉर्ड है।** ईमेल पर पुष्टि, काम का लेखा-जोखा, और मौखिक आश्वासन पर भरोसा न करना। शास्त्रीय उपाय उसके साथ चलते हैं, उसकी जगह नहीं।',
    ],
  },
  {
    id: 'shatru-vs-asli',
    h2: 'Kaam ka virodhi aur asli shatru — ek nahi hain',
    paras: [
      'Ye antar is page par zaroori hai, kyunki gusse mein dono ek lagne lagte hain.',
      'Shastra mein **chhathaa bhaav pratiyogita ka bhi bhaav hai.** Yaani wo vyakti jo aapse aage nikalna chahta hai, wo "shatru" ki shreni mein aata hai — par wo dushman nahi hai, pratiyogi hai. Dono ke liye upay bhi alag hai.',
      '**Pratiyogita ke liye** apna chhathaa bhaav aur Mangal mazboot karna kaafi hai — aap jitenge, wo haarega, aur usme kisi ka nuksan nahi hai.',
      'Aur wo baat jo shastra khud kehta hai: **balwan chhathaa bhaav wale vyakti ke shatru apne aap peeche reh jaate hain** — unhe kuch karna nahi padta. Isi liye classical upay hamesha apne bal par kaam karte hain, saamne wale par nahi.',
    ],
  },
  {
    id: 'guru-ka-daur',
    h2: 'Guru ka daur — jab raahat aati hai',
    paras: [
      'Har bhaari daur ke saath ek raahat ka daur bhi hota hai, aur usme sabse bada haath **Guru** ka hota hai.',
      'Guru ki drishti shastra mein **sabse kalyankari** maani gayi hai. Jab Guru aapke **dasham, lagna ya ekadash** par gochar karta hai, ya us par drishti daalta hai, to us daur mein prayah naye avsar, sahi salah aur bade logon ka sath milta hai.',
      'Ek vyavharik sanket: **Guru ek rashi mein lagbhag ek saal rehta hai.** Iska matlab uska anukool daur pehle se pata kiya ja sakta hai — aur usi daur mein badlaav ki koshish karna zyada samajhdari hai.',
      'Guru ki dasha ka vistaar [Guru Mahadasha](/blog/guru-mahadasha-wisdom-growth) mein hai, aur chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) par.',
    ],
  },
  {
    id: 'kya-nahi-batata',
    h2: 'Ye reading kya nahi bata sakti',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye.',
      'Ye **nahi** bata sakti: aapki naukri jaayegi ya nahi, aapke boss ka tabaadla kab hoga, kaunsa naya offer lena chahiye, ya kis din resign karna chahiye. Ye chaaron nishchit ghatnaayein hain, aur koi chart nishchit ghatna nahi batata.',
      'Aur ye bhi **nahi** hai: kanooni salah (agar sthiti utpeedan ya HR ke maamle tak pahunch gayi hai to wo alag rasta hai), na hi manochikitsa ka vikalp.',
      'Jo ye deti hai: **is daur ka swaroop, uska sambhavit ant, aur aapke apne chart mein wo kshetra kitna mazboot hai.** Isi roop mein ise lijiye.',
    ],
  },
  {
    id: 'kis-ke-liye',
    h2: 'Ye reading kiske liye sabse kaam ki hai',
    paras: [
      'Har kisi ko iski zaroorat nahi hai, aur ye kah dena zyada imandar hai.',
      '**Sabse kaam ki:** jo mahinon se ek hi sthiti mein atke hain aur samajh nahi pa rahe ki rukna hai ya jaana; jinhe lagta hai ki mehnat ke bawajood shrey nahi mil raha; aur jo naukri badalne ki soch rahe hain par samay tay nahi kar pa rahe.',
      '**Kam kaam ki:** jinka faisla ho chuka hai aur offer haath mein hai; aur jinke paas apna sateek janm samay nahi hai, kyunki bina samay ke dasham bhaav hi nahi banta.',
      'Aur ek sthiti jahan **ye page sahi jagah nahi hai:** agar maamla utpeedan, bhedbhav ya suraksha ka hai. Wo HR aur kanoon ka vishay hai, aur wahan pehla kadam reading nahi hona chahiye.',
    ],
  },
  {
    id: 'free-vs-paid',
    h2: 'Free mein kya milta hai aur ₹51 mein kya',
    paras: [
      '**Free — Trikaal Ka Sandesh.** Aapke dasham bhaav ki sthiti, Shani ka haal, chhathe bhaav ka sanket, aur ek seedha uttar ki ye daur karmic hai ya nahi. 150-200 shabd, turant, bina signup aur bina card.',
      '**₹51 — poora vishleshan.** Dasham aur uske swami ka vistrit vishleshan, Shani ka gochar aur uski avadhi, chhathaa bhaav aur shatru-yog, dono chart ka mel (agar boss ka vivaran diya ho), **exit ya stay window** dasha ke saath, aur paanch vyaktigat upay.',
      'Jo yahan jaanbujh kar nahi hai: koi dar, koi "aapke boss ne kuch karwa rakha hai" jaisi baat, aur koi mehnga nivaran. Agar sthiti saadharan hai to reading saadharan hi likhegi.',
    ],
  },
  {
    id: 'result-kaise-padhein',
    h2: 'Result padhne ka sahi kram',
    paras: [
      'Result aate hi log seedha "kab jaunga" dhoondhte hain. Behtar kram ye hai.',
      '**Pehle dasham ka swami dekhiye** — wo kis bhaav mein hai. **Phir Shani** — janm ka aur chalta hua dono. **Phir chhathaa bhaav** — usme kaun hai aur uska swami kahan.',
      '**Uske baad dasha dekhiye** — kyunki wahi batati hai ki upar wali teeno baatein **abhi** sakriy hain ya nahi. Ek kamzor dasham jiska daur abhi nahi chal raha, aaj koi dikkat nahi de raha hoga.',
      'Aur agar kahin **wajah samajh na aaye** — wahi jagah hai jahan doosri raay leni chahiye. Har point ke saath uski wajah isi liye likhi jaati hai.',
    ],
  },
  {
    id: 'kitni-baar',
    h2: 'Ye reading kitni baar leni chahiye',
    paras: [
      'Chhota par vyavharik prashn.',
      '**Janm-aadhaarit hissa ek baar dekhne ki cheez hai** — dasham, uska swami, chhathaa bhaav, janm ka Shani. Ye kabhi nahi badalte.',
      '**Dasha aur gochar wala hissa** tab dekhiye jab kuch badle — dasha badalne par, ya jab aap sach mein faisla lene ki sthiti mein hon. Saal mein ek baar kaafi hai.',
      'Jo nahi karna chahiye: **har bure din ke baad dobara chalana.** Aankda wahi rahega, aur baar-baar dekhna sthiti sudharta nahi — sirf chinta badhata hai.',
    ],
  },
  {
    id: 'verify',
    h2: 'Result ko khud parakhne ka tarika',
    paras: [
      'Kisi bhi reading par bharosa karne se pehle uski buniyad parakhni chahiye.',
      'Wahi janm vivaran kisi doosre bharose-mand software mein daaliye. **Lagna, dasham bhaav ki rashi, aur Shani ki sthiti** bilkul milni chahiye — dono taraf Lahiri ayanamsha ho to antar nahi aayega.',
      'Aur **dasha** milaiye — kaunsi Mahadasha aur Antardasha chal rahi hai. Wo bhi bilkul milni chahiye, kyunki wo janm nakshatra se nikalti hai aur usme koi vyakhya nahi hai.',
      'Agar **lagna hi alag** aaye to samay ya shahar mein galti hai — wahi pehle jaanchiye, kyunki dasham bhaav usi par tikta hai. Apna lagna [Lagna Calculator](/calculators/free-lagna-calculator) se dekh sakte hain.',
    ],
  },
  {
    id: 'boss-badal-gaya',
    h2: 'Boss badal gaya par dikkat wahi rahi — aisa kyun',
    paras: [
      'Ye shikayat aam hai aur uska uttar shastra mein saaf hai, chahe wo sunne mein sakht lage.',
      'Agar aapka **chhathaa bhaav ya dasham lagatar dabav mein hai**, to wo sthiti vyakti ke saath nahi, **daur ke saath** judi hoti hai. Boss badalne se chart nahi badalta — aur isi liye naya vyakti aakar wahi paristhiti dohra deta hai.',
      'Iska ulta bhi sach hai, aur wahi raahat ki baat hai: **jab daur badalta hai to wahi purana boss bhi alag lagne lagta hai.** Bahut se log batate hain ki Shani ka gochar hatte hi wahi rishta sambhal gaya, bina kisi ke badle.',
      'Isliye ye reading vyakti par nahi, **daur par** dhyan deti hai — kyunki wahi wo cheez hai jo sach mein badalti hai.',
    ],
  },
  {
    id: 'apna-hissa',
    h2: 'Apna hissa kitna hai — chart kya nahi kehta',
    paras: [
      'Ye section is page par sabse kam sukhad hai aur shayad sabse zyada kaam ka.',
      'Kundali **dabav ka sanket** deti hai. Wo ye nahi batati ki us dabav mein aapka apna hissa kitna hai — kaam ka star, samay ka paalan, sanvaad ka tarika. Ye cheezein chart mein hai hi nahi.',
      'Aur ek baat jo imandari se kehni chahiye: **chhathaa bhaav sakriy hone ka matlab hamesha "doosre galat hain" nahi hota.** Kabhi wo apni hi jaldbaazi ya tikaav ki kami ko bhi dikhata hai — khaas kar jab Mangal ya Rahu us bhaav se jude hon.',
      'Sahi upyog ye hai: **chart se daur samajhiye, aur apna hissa khud dekhiye.** Jo reading sirf ye kahe ki saamne wala bura hai, wo aapko achha mehsoos karwaayegi par aage nahi le jaayegi.',
    ],
  },
  {
    id: 'shanivar-ka-upay',
    h2: 'हर शनिवार का सरल उपाय — जो रोज़ किया जा सकता है',
    paras: [
      'बड़े अनुष्ठान की ज़रूरत नहीं है। जो नियमित हो सके, वही चलता है — शास्त्र भी यही कहता है।',
      '**शनिवार को:** सूर्यास्त के बाद सरसों के तेल का दीपक, "ॐ शं शनैश्चराय नमः" का 108 बार जाप, और काले तिल या लोहे का दान। पीपल के पेड़ पर जल चढ़ाना भी इसी दिन कहा गया है।',
      '**मंगलवार को:** हनुमान चालीसा का पाठ, और यदि विरोध तीव्र हो तो बजरंग बाण। सिंदूर और चमेली का तेल हनुमान जी को अर्पित करना प्रचलित है।',
      'व्यावहारिक बात: **एक उपाय, तीन से छह महीने।** एक साथ पाँच उपाय शुरू करके दो हफ़्ते में छोड़ देना किसी काम का नहीं — और शास्त्र में भी नियमितता को ही बल कहा गया है।',
    ],
  },
  {
    id: 'kaam-ke-alawa',
    h2: 'Kaam ke alawa bhi asar dikhe to — ye alag sanket hai',
    paras: [
      'Kabhi sthiti sirf office tak nahi rehti — neend, sehat, ghar ka mahaul sab uske andar aa jaate hain. Us waqt do cheezein alag rakhni chahiye.',
      'Jyotish ki taraf se: agar **Chandra peedit** hai ya **lagna par kroor drishti** hai, to dabav ka asar mann par zyada padta hai. Aise chart mein wahi sthiti doosre se zyada bhaari mehsoos hoti hai — aur ye jaan lena hi raahat deta hai, kyunki wo kamzori nahi, prakriti hai.',
      'Aur jo jyotish ki taraf se **nahi** hai: neend ka lagatar toot-na, khaane ka badalna, ya har waqt bhaari mann. Ye sharir aur mann ke sanket hain, aur inka pehla rasta koi upay nahi hai.',
      'Ye kehna is page ke vyapaar ke khilaf jaata hai par kehna zaroori hai: **agar asar sehat tak pahunch raha hai, to kisi jaankaar se baat kijiye** — doctor, ya jispar aap bharosa karte hain. Upay uske saath chalte hain, uski jagah nahi.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Reading ke baad — aage kya padhein',
    paras: [
      '**Career ka poora sidhant** — [Career Prediction Astrology](/learn/career-prediction-astrology), [Best career from your birth chart](/learn/best-career-birth-chart), aur Hindi mein [करियर भविष्यवाणी — पूरी गाइड](/blog/career-prediction-kundli-complete-guide-hindi).',
      '**Samay aur badlaav** — [Dasha timing: transfer aur conflict](/blog/dasha-timing-transfer-conflict-peak-astrology), Hindi mein [दशा और तबादला](/blog/dasha-timing-transfer-conflict-peak-astrology-hindi), aur [Dasha Calculator](/calculators/free-dasha-calculator).',
      '**Muft jaanch** — [Sade Sati Calculator](/calculators/free-sade-sati-calculator), [Graha Bal Calculator](/calculators/free-graha-bal-calculator), [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator), [Kundali Calculator](/calculators/free-kundali-calculator). Sarkari naukri ka alag prashn ho to [Government Job & UPSC](/learn/government-job-chances).',
    ],
  },
];

type TbLink = { href: string; label: string; note: string };

const V6_HUB_LEARN: TbLink[] = [
  { href: '/learn/career-prediction-astrology', label: 'Career Prediction Astrology', note: 'Poora sidhant' },
  { href: '/learn/best-career-birth-chart', label: 'Best career from your chart', note: 'Kaunsa kshetra' },
  { href: '/blog/career-prediction-kundli-complete-guide', label: 'Career prediction — full guide', note: '3,400 shabd' },
  { href: '/blog/career-prediction-kundli-complete-guide-hindi', label: 'करियर भविष्यवाणी — हिंदी', note: 'हिंदी में पूरा' },
  { href: '/blog/dasha-timing-transfer-conflict-peak-astrology', label: 'Dasha: transfer aur conflict', note: 'Samay ka vishleshan' },
  { href: '/blog/shani-mahadasha-effects-guide', label: 'Shani Mahadasha', note: 'Karm ka kaarak' },
  { href: '/blog/rahu-mahadasha-effects-guide', label: 'Rahu Mahadasha', note: 'Office politics' },
  { href: '/blog/guru-mahadasha-wisdom-growth', label: 'Guru Mahadasha', note: 'Raahat ka daur' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: 'Kathinai se unnati' },
];

const V6_HUB_CALC: TbLink[] = [
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Daur kab tak' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Shani ka gochar' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Shani aur Mangal ka bal' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Dasham bhaav ka bal' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Dasham lagna se banta hai' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Kaunsa graha peeche' },
  { href: '/learn/government-job-chances', label: 'Government Job & UPSC', note: 'Sarkari naukri ka prashn' },
  { href: '/panchang', label: 'Panchang', note: 'Interview ka din' },
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

function V6Hub({ items }: { items: TbLink[] }) {
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
        <h2 className="text-base font-bold m-0 mb-2 text-[#D4AF37]">Career ka poora guide — aur muft jaanch</h2>
        <p className="text-xs leading-relaxed mb-4 text-slate-400">
          Ye page ek hi sawaal ka hai — ye daur karmic hai ya nikalne ka waqt. Career ka poora vishay aur samay ki jaanch alag pages par hai, sab free.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 pb-1.5 text-sm font-bold border-b border-[#D4AF37]/25 text-slate-200">Padhne ke liye</h3>
            <V6Hub items={V6_HUB_LEARN} />
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

export default function ToxicBossRadarPage() {
  return (
    <>
      <Script id="schema-toxic-boss" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />

        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-900/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Workplace Karma Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Is Your Boss <span className="text-[#D4AF37]">Karmically Toxic</span><br />— or Just Temporarily Difficult?
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">
              Trikaal AI reads your 10th House, Saturn placement & current Dasha to tell you if this work situation is a karmic lesson with an end date — or a sign to <span className="text-[#D4AF37] font-semibold">leave now</span>.
            </p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/founder" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris (self-hosted)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Get My Workplace Reading — ₹51</Link>
            </div>
          </div>
        </section>

        {/* ── v5.0: the real reading form, preselected to genz_toxic_boss.
            That id puts BirthForm into DUAL-CHART mode, so a second block for
            the boss's details appears below the visitor's own. ─────────── */}
        <section className="px-4 pb-10 -mt-6">
          <ServiceReadingForm
            domain="toxic-boss-radar"
            heading="Apna aur apne boss ka chart — dono ek saath"
            subheading="Dasham bhaav, Shani ka gochar aur chhathe bhaav ke shatru-yog. Dono kundali se, turant."
          />
        </section>

        <AuthorStrip />

        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Why Vedic Astrology Can Decode <span className="text-[#D4AF37]">Work Toxicity</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "♄", title: "Saturn & Your 10th House Govern Work Karma", desc: "The 10th house rules career and authority figures. Saturn's placement determines whether authority energy flows smoothly or creates friction. Toxic dynamics are not random — they are karmic, and they have an end date." },
                { icon: "⚔️", title: "The 6th House Reveals Hidden Workplace Enemies", desc: "The 6th house governs enemies, obstacles, and workplace conflict. When your 10th lord sits in the 6th — or malefics transit there — toxic dynamics intensify. Knowing the transit window tells you exactly when it ends." },
                { icon: "🌙", title: "Rahu & Ketu Show Karmic Power Struggles", desc: "Rahu creates ambition, obsession, and manipulation in those around you. When Rahu transits your 10th house, you attract exactly these kinds of authority figures. The transit window tells you when this karmic chapter closes." },
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

        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                {[
                  { step: "01", title: "Enter Your Birth Details", desc: "Date, time, and place. Even a 10-minute difference shifts house cusps and changes your workplace karma reading." },
                  { step: "02", title: "Trikaal Scans Your Work Karma", desc: "10th lord placement, Saturn transit, 6th house enemies, and Rahu/Ketu impact on career authority dynamics." },
                  { step: "03", title: "Get Your Exit Window or Stay Signal", desc: "Pehla reading free. Is this situation karmic and temporary? Or is your chart screaming to leave? Exact months revealed." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{s.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <DeliverableCard segment="toxic-boss" items={["10th House & Saturn work karma analysis", "6th house enemy/rival pattern reading", "Rahu/Ketu authority conflict timeline", "Is leaving now astrologically supported?", "Best months to job-hunt or negotiate", "Your natural power position at work", "4-week career energy forecast"]} />
            </div>
          </div>
        </section>

        <MaaDivineSeva />

        <section className="px-4 pb-4"><V6Content /></section>

        <FaqSection items={[
          { q: "Can astrology tell if my boss is truly toxic or if I should leave?", a: "Yes. The 10th house governs your career and authority figures. Saturn's transit determines whether the friction is temporary karma or a karmic exit signal. Rohiit Gupta reads both to give you a clear answer with timing." },
          { q: "What is the 6th house in Vedic astrology?", a: "The 6th house governs enemies, obstacles, disputes, and workplace conflict. When your 10th lord sits in the 6th house, workplace adversity intensifies. Knowing this pattern helps you understand it is karmic, not personal." },
          { q: "How does Dasha timing help with job change decisions?", a: "Vimshottari Dasha gives a 120-year planetary timeline. Changing jobs during Jupiter or Sun Dasha with positive 10th house activation creates career breakthroughs. Rohiit Gupta reads your exact Dasha to give you the right timing." },
          { q: "What birth details do I need?", a: "Date of birth, exact time of birth, and place of birth. Even a 10-minute shift changes your 10th house cusp — precision matters for workplace karma readings." },
        ]} />

        <CtaSection headline="Stay and Fight — or Leave with" highlight="Cosmic Timing?" body="Stop suffering in silence. Your chart knows whether this boss is a temporary Saturn lesson or a karmic exit signal. ₹51 gives you the answer." segment="toxic-boss" />

        <SiteFooter />
      </main>
    </>
  );
}

/* ─── SHARED COMPONENTS (inlined) ─────────────── */

function AuthorStrip() {
  return (
    <section className="py-12 px-4 border-y border-white/5 bg-[#0A0D18]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0 w-20 h-20 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-3xl font-serif text-[#D4AF37] font-bold">RG</div>
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
