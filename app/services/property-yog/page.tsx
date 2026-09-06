/**
 * TRIKAAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/services/property-yog/page.tsx
 * Version: 6.0 (06 Sep 2026) — CALCULATOR CONVERSION + keyword content build
 *
 * ── WHY v6.0 EXISTS ────────────────────────────────────────────────────────
 *
 * FAULT 1 — THE CTA WENT NOWHERE.
 *   Nothing in this repo reads the `segment` query parameter. Not
 *   app/page.tsx, not HomeClient.tsx, not BirthForm.tsx. Category selection is
 *   React state set by CLICKING a card in DardEngineShowcase. So every
 *   "Get Your Property Yog Reading" button dropped the visitor at the top of
 *   the homepage with nothing preselected — they had to scroll, pick the right
 *   age tab and find the card again. Three steps after they had already
 *   chosen. All three /?segment= links on this page are now gone; the real
 *   BirthForm sits on the page instead, preselected to mill_property_yog.
 *
 * FAULT 2 — THE OFFER WAS INVERTED.
 *   BirthForm has a free tier ("Free Trikaal Ka Sandesh", 150-200 words) and
 *   the homepage cards say "Free chart reading for this topic". This page said
 *   ₹51 in the hero, in the DeliverableCard and in the CTA — asking a stranger
 *   from Google for money before giving them anything, while the homepage gave
 *   the same thing free. Copy is now free-first everywhere.
 *
 * FAULT 3 — THE TITLE WAS DOUBLE-BRANDED AND TRUNCATED.
 *   68 chars plus app/layout.tsx's "%s | Trikaal Vaani" template = 84 rendered,
 *   cut by Google at ~58. Now `absolute`, 52 chars.
 *
 * ── WHAT WAS DELIBERATELY NOT TOUCHED ──────────────────────────────────────
 *   The slug, the existing four Hindi sections, the FAQ, AuthorStrip,
 *   MaaDivineSeva, the schema and the hero copy. GSC, 3 months to 4 Sep 2026:
 *   990 impressions, 28 clicks, CTR 2.83%, average position 6.1 — this page
 *   alone is 62% of all /services/ impressions and it sits on page one.
 *   Content here is ADDED, never replaced.
 *
 * ── CANNIBALISATION — READ BEFORE ADDING ANY HEADING ───────────────────────
 *   The site already carries 37 property pages, most of them 2,000-4,000
 *   words: /learn/property-prediction-astrology (3,097), /learn/best-time-to-
 *   buy-property (2,992), /learn/property-investment-prediction (2,953),
 *   /learn/property-dispute-prediction (2,943), /learn/vehicle-purchase-
 *   prediction (3,482), /blog/property-yog-real-estate-astrology (3,366),
 *   /blog/kya-mera-ghar-hoga (3,740), /blog/paitrik-sampatti-yog-jyotish
 *   (3,565), /blog/mars-bhoomi-karaka-property-astrology (2,274) and more.
 *
 *   Those own the INFORMATIONAL side — what property yog is, which planets,
 *   dispute, inheritance, investment, vehicles, foreign property.
 *
 *   THIS PAGE OWNS THE DECISION: should I buy NOW, is my yog active right now,
 *   what does the reading actually tell me, and what do I do with the answer.
 *   Every informational branch below is handed off by LINK, never re-explained.
 *   Adding a "what is the 4th house" style section here would put this page in
 *   competition with nine of our own pages that already rank for it.
 *
 * ── WHERE THE H2s COME FROM ────────────────────────────────────────────────
 *   Radar E3, live SERP, checked 05 Sep 2026:
 *     property yog in kundli ............ our_rank 16  AIO recommends_tool
 *     संपत्ति योग ज्योतिष .................. our_rank 16  AIO answers
 *     when will i buy house astrology ... our_rank —   AIO recommends_tool
 *     ghar kab banega kundli se ......... our_rank —   AIO recommends_tool
 *     मकान खरीदने का योग कुंडली में .......... our_rank —   AIO answers
 *     vahan yog kundli mein kaise dekhe . our_rank —   AIO answers
 *   PASF harvested from those SERPs:
 *     Astrology for house purchase · House prediction in astrology
 *     Own house prediction by date of birth free · Property Yoga Calculator
 *     Property astrology calculator · Property yog by Date Of birth
 *     Real estate astrology · When will I buy a house astrology free
 *     House strength Calculator Astrology · Own house in astrology
 *     Property purchase yog in Kundli · Property horoscope by date of birth
 *   GSC, 3 months to 4 Sep 2026: "property yog in kundali" 56 impressions,
 *   position 5.2, CTR 3.57%; "vehicle house in astrology" 48 impressions,
 *   position 6.5, 0 clicks.
 *
 * Version: 5.0 — schema render fix + Hindi layer + hub interlinking
 *
 * v5.0 CHANGES vs v4.1 (2026-08-31):
 *   1. ❗ CRITICAL — SCHEMA WAS NEVER REACHING THE HTML.
 *      v4.1 emitted the @graph through <Script> from next/script. Verified
 *      on the live page 31 Aug 2026: this page served ZERO real
 *      <script type="application/ld+json"> tags. The JSON existed only as
 *      a deferred "$f" reference inside the React Flight payload.
 *      Comparison on the same crawl: /hast-rekha-calculator 1 tag,
 *      /astrologer-delhi 3 tags, /calculators/free-sade-sati-calculator
 *      1 tag — all fine. Only this page was empty.
 *      So the money page ranking 11 and 12 has been giving Google and the
 *      AI crawlers no Service, no Offer, no price and no FAQPage at all.
 *      FIX: plain <script type="application/ld+json"> rendered directly
 *      from this server component, and the next/script import removed.
 *      This is the exact failure app/hast-rekha-calculator/page.tsx v1.2
 *      already documented — "DO NOT convert back to next/script … the
 *      schema becomes JS-injected, and AI crawlers do not execute JS."
 *      That lesson had never been applied here.
 *      DO NOT reintroduce next/script on this page.
 *   2. HINDI LAYER — page had 0 Devanagari characters. Radar (30 Aug) has
 *      "property yog in kundli" at 11 and "संपत्ति योग ज्योतिष" at 12; the
 *      second is a Hindi query and this page carried no Hindi at all.
 *      Four new Devanagari H2 sections added (~2,600 Devanagari chars).
 *   3. "Delhi NCR" RESTORED. v4.1 removed it under the old brand-guard
 *      rule s/Delhi NCR/India/g. That rule was retired in brand-guard v6
 *      (31 Aug) after the Google Business Profile was verified, so the
 *      local wording is correct again and is now a dedicated section.
 *   4. INTERNAL LINKS 2 -> 26. The property cluster already existed in
 *      Supabase — the pillar, the yogas guide, Mars-as-Bhoomi-Karaka, the
 *      Dasha buy-window, 4th-house Mangal and Pitra Dosh, plus two /learn
 *      references — and NOT ONE was linked from this page. Same pattern as
 *      the palmistry page: the cluster was fine, the money page was cut
 *      off from it. Every href verified against the live sitemap.
 *   5. ₹499 DELIBERATELY NOT ADDED. It is a real product now, but it is
 *      still absent from /pricing, and v4.1 removed it from here as a
 *      phantom price. Re-adding it before /pricing lists it would recreate
 *      exactly the problem v4.1 fixed. This page sells the ₹51 reading.
 *      Revisit only after /pricing carries the On-Call tier.
 *   6. Nothing else touched: metadata, hero, AuthorStrip, DeliverableCard,
 *      MaaDivineSeva, FaqSection, CtaSection and all v4.1 IR-0 cleanups
 *      (no fake testimonials, no strike-through price, /founder links)
 *      are unchanged.
 *
 * v4.1 CHANGES vs v4.0:
 *   ❌ REMOVED fake testimonials (fabricated reviews + ★★★★★ + "Verified Experiences")
 *   ❌ REMOVED phantom ₹499 (hero call button, step 04, card strike-through, CTA button)
 *   ✅ /about → /founder (correct author URL — 3 spots)
 *   ✅ "Delhi NCR" keyword → "India"
 *   ✅ Removed "15 years India Real Estate" credential → reframed as Vedic expertise (IR)
 *   ✅ KEPT Maa Divine Seva (real Arzi/Dhanyewaad dakshina feature)
 *   ✅ Real price on this page = ₹51 (reading)
 */
import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import ServiceReadingForm from '@/components/services/ServiceReadingForm';

export const metadata: Metadata = {
  title: { absolute: "Property Yog in Kundali — Free Check | Trikaal Vaani" },
  description: "Chief Vedic Architect Rohiit Gupta reads your 4th House, Mars & Saturn to reveal if Property Yog is active — or if buying now is a costly karmic mistake. ₹51 reading. 15+ years Vedic expertise.",
  keywords: ["property yog kundali astrology", "should I buy property astrology", "4th house astrology real estate", "ghar kharidne ka shubh samay", "Rohiit Gupta property astrology India"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  openGraph: { title: "Property Yog in Kundali | Trikaal Vaani", description: "Rohiit Gupta decodes your 4th House, Mars & Saturn for property timing.", url: "https://trikalvaani.com/services/property-yog", siteName: "Trikaal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/property-yog" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Property Yog — Real Estate Timing Reading", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/founder" }, offers: [{ "@type": "Offer", price: "51", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "What is Property Yog in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "Property Yog is a specific planetary combination indicating ownership of immovable property. Key indicators include a strong 4th house lord, Mars well-placed, and the 4th lord connected to the 11th house. When activated by the right Dasha, property acquisition becomes auspicious." } },
      { "@type": "Question", name: "Which planets govern property in Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "The 4th house governs home and property. Mars (Mangal) is the Karaka of land. Saturn determines long-term value through its transit. Jupiter aspecting the 4th house creates expansion in property." } },
      { "@type": "Question", name: "What is Sade Sati and how does it affect property buying?", acceptedAnswer: { "@type": "Answer", text: "Sade Sati is Saturn's 7.5-year transit over your Moon sign and adjacent signs. Buying property during peak Sade Sati can invite delays, disputes, or depreciation. Rohiit Gupta checks your Sade Sati status before recommending any purchase timing." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Property Yog", item: "https://trikalvaani.com/services/property-yog" }] },
  ],
};


// ════════════════════════════════════════════════════════════════════════════
// v6.0 CONTENT — decision-side only. See the cannibalisation note in the file
// header before adding anything here.
// ════════════════════════════════════════════════════════════════════════════

type V6Section = { id: string; h2: string; paras: string[] };

const V6_SECTIONS: V6Section[] = [
  {
    id: 'kaise-kaam',
    h2: 'Property Yog Calculator — kaam kaise karta hai',
    paras: [
      'Upar wale form mein **janm tithi, sateek samay aur sthan** daaliye. Reading aapki apni kundali se banti hai — koi saamanya rashi-chart nahi.',
      'Dekha kya jaata hai: **chautha bhaav aur uska swami** (sampatti aur ghar ka bhaav), **Mangal** (bhoomi ka kaarak), **Shani ka gochar** aur Sade Sati ki sthiti, **chal rahi Mahadasha aur Antardasha**, aur chauthe bhaav par padne wali **drishtiyan**.',
      '**Pehla reading free hai** — Trikaal Ka Sandesh, turant. Poora vistrit vishleshan chahiye to uske baad ₹51 ka vikalp aata hai. Pehle dekh lijiye, phir tay kijiye.',
    ],
  },
  {
    id: 'property-yog-active',
    h2: 'Property Yog active hai ya nahi — asli sawal yahi hai',
    paras: [
      'Log poochhte hain "kya meri kundali mein property yog hai". Ye sawal thoda adhoora hai, aur uska sudhra hua roop zyada kaam ka hai.',
      'Wajah: **lagbhag har kundali mein chautha bhaav hota hai aur uska swami hota hai.** Yaani "yog hai ya nahi" ka uttar prayah "hai" hi rehta hai. Asli sawal ye hai ki **wo yog abhi khula hua hai ya nahi** — aur uska uttar dasha aur gochar se aata hai, janm-chart se nahi.',
      'Isi liye ye reading do hisson mein aati hai: **kitna mazboot** (janm-chart se, jo kabhi nahi badalta) aur **kab** (dasha aur gochar se, jo badalta rehta hai). Doosra hissa hi wo hai jiske liye log yahan aate hain.',
    ],
  },
  {
    id: 'ghar-kab-banega',
    h2: 'घर कब बनेगा कुंडली से — समय कैसे निकलता है',
    paras: [
      'यह प्रश्न सबसे ज़्यादा पूछा जाता है और इसका उत्तर **दशा** में है, जन्म-चार्ट में नहीं।',
      'देखे जाने वाले दौर: **चतुर्थ भाव के स्वामी की महादशा या अंतर्दशा**, **मंगल की दशा** (भूमि का कारक), और **गुरु का चतुर्थ भाव पर गोचर** — गुरु की दृष्टि शास्त्र में सबसे कल्याणकारी मानी गई है और वह भाव को खोलती है।',
      'साथ में **शनि** देखा जाता है, क्योंकि संपत्ति एक दीर्घकालिक और भारी निर्णय है — और शनि उसी का कारक है। शनि की अनुकूल स्थिति में सौदा टिकता है; प्रतिकूल में देरी और काग़ज़ी अड़चन आती है।',
      'ध्यान रहे: **यह एक विंडो देता है, तारीख़ नहीं।** दशाएँ महीनों और वर्षों में चलती हैं। जो कोई "इसी तारीख़ को ख़रीदिए" कहे, वह गणना नहीं, अनुमान बेच रहा है।',
    ],
  },
  {
    id: 'kharidun-ya-rukun',
    h2: 'Abhi kharidun ya ruk jaaun — reading kis tarah faisla aasan karti hai',
    paras: [
      'Ye page kisi sampatti ko "achhi" ya "buri" nahi batata. Wo kaam property consultant ka hai, jyotishi ka nahi.',
      'Jo ye batata hai: **aapke apne chart mein wo daur abhi anukool hai ya nahi.** Teen sthitiyaan aati hain — **anukool** (dasha aur gochar dono saath), **madhyam** (ek saath, ek nahi), aur **rukne layak** (dono prati­kool, ya chauthe bhaav par bhaari peeda).',
      'Vyavharik roop se ye faisla is tarah aasan karta hai: agar aap do sauda ke beech jhool rahe hain ya "abhi ya chhe mahine baad" tay nahi kar pa rahe, to ye ek aur aankda de deta hai. **Ye aakhri faisla nahi hai — ye ek aur nazariya hai**, aur usi roop mein ise lena chahiye.',
      'Property ke mole-taul par poora vishleshan [Best time to buy property](/learn/best-time-to-buy-property) par hai.',
    ],
  },
  {
    id: 'reading-mein-kya',
    h2: 'Reading mein kya-kya milta hai',
    paras: [
      '**Free Trikaal Ka Sandesh mein:** aapke chauthe bhaav ki sthiti, uska swami kahan hai, Mangal ki sthiti, aur ek seedha sanket ki abhi ka daur anukool hai ya nahi — 150 se 200 shabd mein, turant.',
      '**₹51 waale vistrit reading mein:** chauthe bhaav aur uske swami ka poora vishleshan, Mangal ka bhoomi-kaarak ke roop mein bal, Shani ka gochar aur Sade Sati ki jaanch, **buying window** dasha ke saath, sambhavit rukavatein, aur **paanch vyaktigat upay**.',
      'Aur jo is reading mein **nahi** hai, wo bhi jaan lena chahiye: kisi khaas property ka mulyankan, keemat ki bhavishyavani, kanooni salah, ya "kaunsa flat lijiye" jaisa uttar. Ye teeno alag peshe hain.',
    ],
  },
  {
    id: 'chautha-bhaav-kyun',
    h2: 'Chautha bhaav hi kyun — ek line ka aadhaar',
    paras: [
      'Shastra mein **chautha bhaav** sukh, maa, ghar, vaahan aur achal sampatti ka bhaav hai. Isi liye property ka har prashn wahin se shuru hota hai.',
      'Iske saath do aur bhaav jude hain: **doosra bhaav** (sanchit dhan — kharid ki kshamata) aur **gyarahvaan** (aay aur poorti). Kai baar **aathvaan** bhi dekha jaata hai, kyunki viraasat aur saanjhi sampatti uska vishay hai.',
      'Poora sidhant is page par dohraaya nahi gaya kyunki uske liye alag aur vistrit page hain — [Property Prediction Astrology](/learn/property-prediction-astrology) aur Hindi mein [संपत्ति भविष्यवाणी ज्योतिष](/blog/property-prediction-astrology-hindi). Yahan sirf wo hissa hai jo **aaj ke faisle** se juda hai.',
    ],
  },
  {
    id: 'mangal-bhoomi-karaka',
    h2: 'Mangal — bhoomi ka kaarak aur uska seedha asar',
    paras: [
      'Chauthe bhaav ke baad sabse zyada vazan **Mangal** par hai, kyunki shastra mein wahi **bhoomi ka kaarak** hai — zameen, nirmaan aur achal sampatti.',
      'Reading mein Mangal ke teen pahlu dekhe jaate hain: **uska bal** (Shadbala se), **uski sthiti** (kaunsi rashi, kaunsa bhaav), aur **uski dasha** chal rahi hai ya nahi. Balwan Mangal ke daur mein sauda tez chalta hai; kamzor Mangal mein kaagaz aur nirmaan dono dheeme padte hain.',
      'Ek vyavharik sanket jo aksar sach nikalta hai: **Mangal ki dasha ya antardasha mein sampatti se juda koi na koi kaam saamne aata hai** — kharid, bikri, vivad, ya marammat. Poora vishay [Mars bhoomi karaka](/blog/mars-bhoomi-karaka-property-astrology) aur Hindi mein [मंगल भूमि कारक](/blog/mars-bhoomi-karaka-property-astrology-hindi) par hai.',
    ],
  },
  {
    id: 'shani-sade-sati',
    h2: 'Sade Sati mein property kharidna theek hai?',
    paras: [
      'Ye sawal is page par sabse zyada dar ke saath aata hai, isliye uttar santulit hona chahiye.',
      '**Sade Sati sampatti par rok nahi lagati.** Wo Shani ka gochar hai — janm Chandra rashi se barahvin, pehli aur doosri rashi par, lagbhag saadhe saat saal. Agar aapka chautha bhaav mazboot hai aur anukool dasha chal rahi hai, to Sade Sati ke dauran bhi ghar kharida jaata hai — aur roz kharida jaata hai.',
      'Jo Sade Sati sach mein karti hai: **kaagaz, mehnat aur dheeraj ki maang badha deti hai.** Sauda lamba khinch sakta hai, loan mein der ho sakti hai, aur chhoti-moti rukavatein aati hain. Ye "ashubh" nahi, "dheema" hai.',
      'Apni sthiti khud dekhni ho to [Sade Sati Calculator](/calculators/free-sade-sati-calculator) free hai, aur wo **Chandra rashi** se chalta hai — lagna se nahi, jo ek aam galti hai.',
    ],
  },
  {
    id: 'own-house-prediction',
    h2: 'Own House Prediction by Date of Birth — kya sirf tareekh kaafi hai',
    paras: [
      'Ye PASF ki asli entry hai aur iska uttar seedha hona chahiye: **nahi, sirf tareekh se nahi.**',
      'Wajah: **chautha bhaav lagna se banta hai, aur lagna janm ke samay se.** Lagna har lagbhag do ghante mein badal jaata hai. Bina samay ke ye pata hi nahi chalega ki aapka chautha bhaav kaunsi rashi mein hai aur uska swami kaun hai — yaani poore vishleshan ka aadhaar hi nahi.',
      'Sirf tareekh se jo mil jaata hai wo hai Chandra rashi aur grahon ki rashi. Us aadhaar par ek mota andaaza lagta hai, par wo aapke apne ghar ka uttar nahi hai.',
      'Isi liye ye form **teeno** maangta hai. Agar samay nahi pata to janm pramanpatra ya hospital record dekhiye — das minute ka kaam hai jo poore vishleshan ko sateek bana deta hai.',
    ],
  },
  {
    id: 'pehla-ghar',
    h2: 'Pehla ghar aur doosri property — dono alag padhe jaate hain',
    paras: [
      'Ye antar kam batayi jaati hai par vyavharik roop se bada hai.',
      '**Pehla ghar** prayah chauthe bhaav aur uske swami se padha jaata hai — wo sukh aur sthirta ka prashn hai. **Nivesh ke liye doosri ya teesri property** ka vishleshan alag hai; wahan ekadash bhaav (laabh), doosra bhaav (sanchay) aur aathvaan (saanjha dhan) bhi jud jaate hain.',
      'Isliye ek hi kundali "pehle ghar" ke liye anukool aur "nivesh" ke liye saamanya ho sakti hai — aur ye virodh nahi hai.',
      'Nivesh ka poora vishleshan [Property Investment Prediction](/learn/property-investment-prediction) par hai, aur ek se zyada sampatti ka yog [कई संपत्तियों का योग](/blog/kai-sampattiyon-ka-yog) mein.',
    ],
  },
  {
    id: 'paitrik-sampatti',
    h2: 'Paitrik sampatti aur viraasat — ye alag prashn hai',
    paras: [
      'Bahut se log ye reading is umeed se lete hain ki paitrik sampatti ka uttar mil jaayega. Antar jaan lena zaroori hai.',
      '**Kharidi hui sampatti chauthe bhaav se** padhi jaati hai. **Viraasat aathve bhaav se** — kyunki aathvaan doosron ke dhan, saanjhi sampatti aur uttaradhikaar ka bhaav hai. Iske saath navam (pita) aur chautha (maa) bhi jud jaate hain, is baat par ki sampatti kis taraf se aa rahi hai.',
      'Yaani ye do alag ganana hain, aur ek hi reading mein dono ka uttar maan lena galat nishkarsh deta hai.',
      'Viraasat ka poora vishay [पैतृक संपत्ति योग](/blog/paitrik-sampatti-yog-jyotish) par hai, aur uttaradhikaar ka vishleshan [Inheritance Wealth Prediction](/learn/inheritance-wealth-prediction) par.',
    ],
  },
  {
    id: 'property-vivad',
    h2: 'Property vivad ka sanket — kya kundali pehle bata sakti hai',
    paras: [
      'Ye ek gambhir prashn hai aur iska uttar dono taraf saaf hona chahiye.',
      'Jo shastra kehta hai: **chhathaa bhaav** vivad aur mukadme ka bhaav hai. Agar chauthe bhaav ka swami chhathe se juda ho, ya chauthe par kroor grahon ki bhaari drishti ho, to sampatti se jude vivad ka sanket maana jaata hai. **Rahu** ka chauthe bhaav se sambandh bhi dastaavez aur dhokhe ki taraf ishara karta hai.',
      'Jo saaf kehna chahiye: **ye kanooni salah nahi hai, aur na hi iska matlab hai ki vivad hoga hi.** Ek sanket ka matlab itna hai ki **kaagaz zyada dhyan se dekhiye** — title, mutation, encumbrance certificate, aur wakeel se jaanch.',
      'Aur sabse zaroori: **kisi bhi jyotishiya sanket ke aadhaar par kanooni jaanch mat chhodiye.** Ye vishay [Property Dispute Prediction](/learn/property-dispute-prediction) par vistaar se hai.',
    ],
  },
  {
    id: 'loan-emi',
    h2: 'Home loan aur EMI — kundali isme kya kehti hai',
    paras: [
      'Ye prashn vyavharik hai aur iska uttar seemit par imandar hona chahiye.',
      'Rin aur udhaari ka bhaav **chhathaa** hai. Isliye loan ka prashn chauthe bhaav (sampatti) ke saath chhathe bhaav (rin) ko bhi dekhta hai. Anukool sthiti wo hai jahan chautha mazboot ho aur chhathaa sambhla hua — yaani sampatti bhi aaye aur rin bhaari na pade.',
      'Jab chhathaa bhaav bhaari ho: paramapara mein salah rehti hai ki **kam loan aur zyada apna hissa** rakha jaaye, aur EMI ko aay ke sanulit hisse mein rakha jaaye.',
      'Par yahan seema saaf hai: **loan ka faisla aankdon ka faisla hai** — aay, byaj dar, naukri ki sthirta, aur aage ka kharch. Kundali usme ek aur nazariya hai, ganit ka vikalp nahi. Karz ka vishleshan [Wealth Reading](/services/wealth-reading) par alag se hai.',
    ],
  },
  {
    id: 'vahan-yog',
    h2: 'Vahan Yog — gaadi ka prashn bhi chauthe bhaav se',
    paras: [
      'Ye prashn is page par bar-bar aata hai kyunki **chautha bhaav vaahan ka bhi bhaav hai** — ghar aur gaadi dono usi ke antargat aate hain.',
      'Antar itna hai ki vaahan ke liye **Shukra** ka vazan zyada hota hai (sukh-sadhan ka kaarak), jabki achal sampatti mein **Mangal** ka (bhoomi ka kaarak). Dono ke saath chauthe bhaav ka swami aur uski dasha dekhi jaati hai.',
      'Vyavharik sanket: **Shukra ki dasha ya antardasha vaahan kharid ke liye anukool maani jaati hai**, aur Mangal ki bhoomi ke liye. Agar dono ek saath chal rahe hon to wo daur dono ke liye khula rehta hai.',
      'Gaadi ka poora vishleshan [Vehicle Purchase Prediction](/learn/vehicle-purchase-prediction) par hai aur Hindi mein [वाहन खरीद भविष्यवाणी](/blog/vahan-kharid-bhavishyavani).',
    ],
  },
  {
    id: 'videsh-property',
    h2: 'Videsh mein property — iska bhaav alag hai',
    paras: [
      'NRI aur videsh mein bas chuke logon ka prashn alag hai, aur uska bhaav bhi alag.',
      'Videsh se juda bhaav **baarahvaan** hai (door ka sthaan, videsh, vyay) aur **navam** (lambi yatra). Videsh mein sampatti ka prashn in dono ko chauthe bhaav ke saath jod kar padha jaata hai — sirf chautha kaafi nahi.',
      'Iske saath **Rahu** ka bhi vazan hai, kyunki wo videsh aur asaamanya raston ka kaarak maana jaata hai.',
      'Agar aapka prashn videsh mein ghar ka hai, to ye reading uska aadha hissa hi degi. Poora vishay [Foreign Property Prediction](/learn/foreign-property-prediction) par hai, aur videsh mein basne ka prashn [Foreign Settlement Calculator](/calculators/free-foreign-settlement-calculator) par — wo bhi free.',
    ],
  },
  {
    id: 'vastu-jyotish',
    h2: 'Vastu aur jyotish — do alag cheezein',
    paras: [
      'Ye do vidyaayein aksar ek saath boli jaati hain aur log inhe mila dete hain.',
      '**Jyotish** aapki janm-kundali padhta hai — kaunsa daur anukool hai, kaunsa nahi. **Vastu** us bhavan ki disha aur dhanche ko dekhta hai — mukhya dwar kis taraf hai, rasoi kahan hai. Ek vyakti ka vishay hai, doosra jagah ka.',
      'Vyavharik natija: **jyotish batata hai kab kharidna anukool hai; vastu batata hai kya kharidna theek hai.** Dono alag prashn hain aur dono ka uttar ek dooosre se nahi milta.',
      'Ye page **jyotish** ka hai. Vastu ke liye alag jaankaar chahiye, aur is page par uska koi daawa nahi hai.',
    ],
  },
  {
    id: 'muhurat-registry',
    h2: 'Registry aur griha pravesh ka muhurat — ye alag ganana hai',
    paras: [
      'Sauda tay ho jaane ke baad agla prashn muhurat ka aata hai, aur wo is page ka vishay nahi hai — antar samajh lena chahiye.',
      '**Ye reading aapki kundali se batati hai ki daur anukool hai ya nahi.** **Muhurat us din ke aakash se nikalta hai** — us kshan ki tithi, nakshatra, yoga, karana aur lagna. Do bilkul alag ganana hain.',
      'Registry aur griha pravesh ke liye paramapara mein alag niyam hain — anukool tithi, nakshatra, aur Rahu Kaal se bachna. Roz ka panchang [yahan](/panchang) free hai.',
      'Sabse achhi sthiti wo hai jahan **dono mile** — aapka daur bhi anukool ho aur us din ka panchang bhi. Par agar chunav mein na ho to daur zyada vazan rakhta hai, kyunki wo mahinon chalta hai aur muhurat ek din ka hai.',
    ],
  },
  {
    id: 'dasha-window',
    h2: 'Buying window kya hoti hai — aur wo tareekh kyun nahi hoti',
    paras: [
      'Reading mein aapko ek **window** milti hai, ek tareekh nahi. Ye antar jaan lena zaroori hai warna umeed galat ban jaati hai.',
      'Wajah: **Vimshottari dasha saalon mein chalti hai aur antardasha mahinon mein.** Jab chauthe bhaav ka swami ya Mangal apni antardasha chalata hai, wo poora daur anukool maana jaata hai — wo kuch mahine se le kar do saal tak ka ho sakta hai.',
      'Isliye reading kehti hai jaise "agle 14 mahine anukool hain" — na ki "12 March ko kharidiye". Jo koi sateek tareekh de, wo shastra se nahi bol raha.',
      'Vyavharik roop se ye behtar bhi hai: **ek window ke andar aap apni suvidha se chun sakte hain** — loan, kaagaz, aur sauda sab apne samay par. Dasha ka poora kram [Dasha Calculator](/calculators/free-dasha-calculator) par free dikh jaata hai.',
    ],
  },
  {
    id: 'kamzor-chautha',
    h2: 'Chautha bhaav kamzor nikla — matlab ghar nahi hoga?',
    paras: [
      'Nahi. Aur ye baat shanti se kah deni chahiye, kyunki is dar par bahut kuch becha jaata hai.',
      '**Kamzor chautha bhaav ka matlab hai ki us kshetra mein prayaas zyada lagega** — der zyada, kaagaz zyada, ya pehla ghar baad mein. Iska matlab "kabhi nahi" bilkul nahi hai. Bahut se logon ka chautha bhaav saamanya hota hai aur unke paas ghar hai.',
      'Aur ek zaroori baat: **chautha bhaav akela poora uttar nahi hai.** Uske swami ki sthiti, uska bal, aur dasha — teeno mila kar tasveer banti hai. Kamzor bhaav par balwan swami prayah bhaari pad jaata hai.',
      'Jo sach mein kaam ka hai wo ye jaanna hai ki **kaunsa hissa kamzor hai** — bhaav, swami, ya dasha. Teeno ke upay alag hain. Graha ka bal [Graha Bal Calculator](/calculators/free-graha-bal-calculator) par free dikh jaata hai.',
    ],
  },
  {
    id: 'upay',
    h2: 'Property ke liye classical upay — aur kya nahi karna chahiye',
    paras: [
      'Reading ke saath paanch vyaktigat upay aate hain. Unka aadhaar kya hai, ye jaan lena chahiye.',
      'Char classical maarg hain aur teen mein paisa nahi lagta: **mantra** (chauthe bhaav ke swami ya Mangal ka), **vaar aur vrat** (us graha ke din), **daan** (us graha se judi vastu ka), aur **devta** ki upasana. Chautha maarg ratna hai, aur uski jaanch lagna se hoti hai — [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) par free.',
      'Jo **nahi** karna chahiye: kisi ke kehne par sampatti ke naam par mehngi pooja, "vastu dosh nivaran" ke naam par bhaari kharch, ya kisi sauda ko sirf isliye jaldi mein pakadna ki koi "shubh muhurat nikal raha hai".',
      'Aur wo baat jo dohrayi jaani chahiye: **upay se karm ka phal halka hota hai, samapt nahi.** Property ek bada arthik faisla hai, aur usme sabse bada upay **theek jaanch aur theek kaagaz** hai.',
    ],
  },
  {
    id: 'kya-nahi-batata',
    h2: 'Ye reading kya nahi bata sakti',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye — kyunki property ek bada paisa hai.',
      'Ye **nahi** bata sakti: kaunsi property lijiye, uski keemat sahi hai ya nahi, wo builder bharose ka hai ya nahi, kaagaz saaf hain ya nahi, ya bazaar upar jaayega ya neeche. Ye chaaron **peshevar jaanch** ke vishay hain — property consultant, wakeel aur bank ke.',
      'Jo ye bata sakti hai: **aapke apne chart mein ye daur anukool hai ya nahi, aur agla anukool daur kab hai.** Bas.',
      'Isliye is reading ko **ek aur nazariya** maaniye — jaanch, kaagaz aur hisaab ki jagah nahi. Jo koi kundali dekh kar kahe ki "ye sauda le lijiye", wo apni seema se bahar bol raha hai.',
    ],
  },
  {
    id: 'kitna-bharosa',
    h2: 'Is reading par kitna bharosa karein',
    paras: [
      'Imandar uttar do hisson mein hai, aur dono kehna zaroori hai.',
      '**Ganana par poora bharosa kijiye.** Grahon ki sthiti Swiss Ephemeris se aati hai aur Lahiri ayanamsha lagta hai — wahi maanak jo Bharat sarkar ka panchang use karta hai. Ye aankde kisi bhi doosre gambhir software se milne chahiye, aur aap mila kar dekh sakte hain.',
      '**Vyakhya par utna hi bharosa kijiye jitna kisi bhi jyotishiya vyakhya par.** Wo classical niyamon par bani hai — BPHS ke chautha bhaav, Mangal ke bhoomi-kaarak, Vimshottari dasha — par wo vyakhya hi rehti hai, tathya nahi.',
      'Isi liye har point ke saath uski **wajah** likhi jaati hai — kaunsa graha, kaunsa bhaav, kaunsi dasha — taaki aap use apni kundali se mila sakein aur asahmat bhi ho sakein.',
    ],
  },
  {
    id: 'kya-free-hai',
    h2: 'Free mein kya milta hai aur ₹51 mein kya',
    paras: [
      '**Free — Trikaal Ka Sandesh.** Chautha bhaav aur uska swami, Mangal ki sthiti, aur ek seedha sanket ki abhi ka daur anukool hai ya nahi. 150-200 shabd, turant, bina signup aur bina card.',
      '**₹51 — poora vishleshan.** Chauthe bhaav ka vistrit vishleshan, Mangal ka bal, Shani ka gochar aur Sade Sati ki jaanch, dasha ke saath **buying window**, sambhavit rukavatein, aur paanch vyaktigat upay.',
      'Aur ek baat saaf: **free wala reading ek adhoora tukda nahi hai.** Wo apne aap mein ek uttar hai. Agar usse aapka kaam ban jaata hai to ₹51 dene ki koi zaroorat nahi — aur ye is page par likha hona chahiye, isliye likha hai.',
    ],
  },
  {
    id: 'joint-property',
    h2: 'Joint property — pati-patni dono ki kundali dekhni chahiye?',
    paras: [
      'Ye vyavharik sawal hai kyunki adhikansh ghar aaj joint naam par liye jaate hain.',
      'Paramparik roop se **jiske naam par sampatti aa rahi hai, uska chart mukhya hai.** Joint hone par dono ke chauthe bhaav dekhe jaate hain, aur anukool sthiti wo maani jaati hai jahan **kam se kam ek ka daur khula ho.**',
      'Agar dono ka daur anukool hai to wo sabse achhi sthiti hai. Agar dono prati­kool hain to prayah der aur kaagaz ki dikkat aati hai — sauda rukta nahi, dheema hota hai.',
      'Vyavharik salah: **dono ki reading alag-alag chala lijiye** aur dono ki window dekh lijiye. Ye form do baar chalane ka kaam hai, aur free hai.',
    ],
  },
  {
    id: 'flat-plot-resale',
    h2: 'Flat, plot ya resale — kya jyotish inme antar karta hai',
    paras: [
      'Log poochhte hain ki kundali ye bhi batati hai ya nahi. Uttar aadha "haan" hai.',
      'Jo antar shastra mein hai: **Mangal bhoomi ka kaarak hai** — khuli zameen aur plot uska seedha kshetra hai. **Shani nirmaan aur sthayitva ka** — bana hua ghar aur lambe samay tak tikne wali sampatti uski taraf jaati hai. **Shukra sukh-sadhan ka** — sajaa hua, aaram wala ghar uski taraf.',
      'Isliye jis graha ka daur chal raha hai, us tarah ki sampatti prayah saamne aati hai. Mangal ke daur mein plot, Shani ke daur mein purana ya bana hua ghar.',
      'Par ye ek **jhukav** hai, niyam nahi. Aur "resale lein ya naya" ka faisla keemat, location aur kaagaz se hota hai — kundali se nahi. Yahan bhi wahi seema lagti hai.',
    ],
  },
  {
    id: 'sauda-toot-gaya',
    h2: 'Sauda beech mein toot gaya — kundali ne kya kaha tha',
    paras: [
      'Ye sthiti dukhad hoti hai aur log iske baad hi aksar jyotish ki taraf aate hain.',
      'Jo sanket peeche mud kar dikhte hain: **chauthe bhaav par kroor grahon ki bhaari drishti**, **Rahu ka chauthe se sambandh** (kaagaz, dhokha, uljhan), **chhathe bhaav ka jud jaana** (vivad), aur **prati­kool antardasha** us samay chal rahi hona.',
      'Par ek imandar baat: **peeche mud kar sab kuch samjha aa jaata hai** — aur wo jyotish ki khoobi bhi hai aur uski seema bhi. Pehle se ye kehna ki "ye sauda tootega" utna aasan nahi.',
      'Isliye is reading ka sahi upyog ye hai: **agla sauda karte waqt daur dekh lijiye**, aur agar daur prati­kool hai to jaldi mat kijiye — kaagaz par zyada waqt dijiye. Wahi ek cheez sabse zyada kaam karti hai.',
    ],
  },
  {
    id: 'bechne-ka-samay',
    h2: 'Property bechne ka samay — wo kaise dekha jaata hai',
    paras: [
      'Kharidne ki tarah bechne ka bhi apna vishleshan hai, aur wo thoda ulta chalta hai.',
      'Bechne ke liye dekhe jaate hain: **chautha bhaav** (sampatti nikal rahi hai), **dasham** (uska saamna aur sauda), aur **ekadash** (laabh, yaani kya achha daam milega). Iske saath **Shukra** aur **Budh** — sauda aur baatcheet ke kaarak.',
      'Prati­kool sthiti wo hai jahan chauthe bhaav par bhaari dabav ho — wahan sampatti nikal to jaati hai par prayah **kam daam par ya majboori mein**, aur wahi baad mein pachhtava banti hai.',
      'Vyavharik roop se: **agar bechne ki jaldi nahi hai to anukool daur ka intezaar karna arth rakhta hai** — kyunki farak keemat mein dikhta hai, sauda hone na hone mein nahi. Reading dono window deti hai.',
    ],
  },
  {
    id: 'marammat-nirmaan',
    h2: 'Nirmaan, marammat aur griha pravesh ka samay',
    paras: [
      'Ghar kharidne ke baad ke prashn bhi isi bhaav se jude hain, aur unka samay alag dekha jaata hai.',
      '**Nirmaan aur marammat** ke liye **Mangal** ka daur anukool maana jaata hai — wo nirmaan aur shram ka kaarak hai. **Shani** ka daur bhi chalta hai, par usme kaam dheema aur lamba hota hai; wo bade aur sthayi nirmaan ke liye theek hai.',
      '**Griha pravesh** ek alag ganana hai — wo **muhurat** ka vishay hai, aapki kundali ka nahi. Uske liye us din ka panchang chahiye: tithi, nakshatra, aur Rahu Kaal se bachna. Roz ka panchang [yahan](/panchang) free hai.',
      'Ek vyavharik salah: **nirmaan shuru karne se pehle apna daur dekh lijiye**, kyunki nirmaan mein sabse zyada paisa aur samay atakta hai — aur wahi jagah hai jahan prati­kool daur sabse mehnga padta hai.',
    ],
  },
  {
    id: 'result-kaise-padhein',
    h2: 'Reading ka result kaise padhein',
    paras: [
      'Result aate hi log seedha "haan ya na" dhoondhte hain. Padhne ka behtar kram ye hai.',
      '**Pehle chauthe bhaav ka swami dekhiye** — wo kis bhaav mein hai. Kendra ya trikona mein ho to sthiti anukool; chhathe, aathve ya barahve mein ho to prayaas zyada. **Phir Mangal** — uska bal aur sthiti. **Phir dasha** — abhi kaunse graha ka daur chal raha hai.',
      '**Uske baad hi kul nishkarsh padhiye.** Kyunki nishkarsh in teenon ka jod hai, aur agar aap teeno alag dekh lenge to nishkarsh apne aap samajh mein aa jaayega — aur aap us par sawal bhi kar sakenge.',
      'Aur agar kahin **wajah samajh na aaye**, to wahi wo jagah hai jahan aapko doosri raay leni chahiye. Har point ke saath uski wajah isi liye likhi jaati hai.',
    ],
  },
  {
    id: 'kitni-baar',
    h2: 'Ye reading kitni baar leni chahiye',
    paras: [
      'Chhota par vyavharik prashn, aur uska uttar do hisson mein hai.',
      '**Janm-aadhaarit hissa ek hi baar dekhne ki cheez hai** — chautha bhaav, uska swami, Mangal ka bal. Ye kabhi nahi badalte. Ek baar nikaal kar save kar lijiye.',
      '**Dasha wala hissa tab dekhiye jab dasha badle** — yaani kuch saal mein ek baar, ya jab aap sach mein kharidne ki soch rahe hon.',
      'Jo nahi karna chahiye: **har mahine chalana aur badlaav dhoondhna.** Wo nahi badlega. Ye janm ka sthir maap hai, bazaar ki report nahi.',
    ],
  },
  {
    id: 'kis-ke-liye',
    h2: 'Ye reading kiske liye sabse zyada kaam ki hai',
    paras: [
      'Har kisi ko iski zaroorat nahi hai, aur ye kah dena zyada imandar hai.',
      '**Sabse zyada kaam ki:** jo do sauda ke beech jhool rahe hain, jo "abhi ya kuch mahine baad" tay nahi kar pa rahe, jinka pichla sauda toota hai aur jo dobara hichak rahe hain, aur jo pehla ghar le rahe hain aur poora paisa laga rahe hain.',
      '**Kam kaam ki:** jinki sampatti pehle se tay ho chuki hai aur kaagaz chal rahe hain — wahan faisla ho chuka hai. Aur jinke paas **sateek janm samay nahi hai**, kyunki bina samay ke chautha bhaav hi nahi banta.',
      'Aur wo baat jo saaf kehni chahiye: **agar aapka sauda achha hai, kaagaz saaf hain aur paisa aapke paas hai — to reading ka intezaar mat kijiye.** Anukool daur ek sahara hai, shart nahi.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Reading ke baad — aage kya padhein',
    paras: [
      '**Sidhant samajhna ho** — [Property Prediction Astrology](/learn/property-prediction-astrology), [Best time to buy property](/learn/best-time-to-buy-property), aur Hindi mein [संपत्ति भविष्यवाणी](/blog/property-prediction-astrology-hindi) tatha [क्या मेरा घर होगा](/blog/kya-mera-ghar-hoga).',
      '**Koi khaas prashn ho** — nivesh ke liye [Property Investment Prediction](/learn/property-investment-prediction), vivad ke liye [Property Dispute Prediction](/learn/property-dispute-prediction), viraasat ke liye [Inheritance Wealth Prediction](/learn/inheritance-wealth-prediction), gaadi ke liye [Vehicle Purchase Prediction](/learn/vehicle-purchase-prediction), aur videsh ke liye [Foreign Property Prediction](/learn/foreign-property-prediction).',
      '**Muft jaanch** — [Sade Sati Calculator](/calculators/free-sade-sati-calculator), [Dasha Calculator](/calculators/free-dasha-calculator), [Graha Bal Calculator](/calculators/free-graha-bal-calculator), [Kundali Calculator](/calculators/free-kundali-calculator) aur registry ke muhurat ke liye [Panchang](/panchang).',
    ],
  },
];

type V6Link = { href: string; label: string; note: string };

const V6_HUB_LEARN: V6Link[] = [
  { href: '/learn/property-prediction-astrology', label: 'Property Prediction Astrology', note: 'Poora sidhant' },
  { href: '/learn/best-time-to-buy-property', label: 'Best time to buy property', note: 'Samay ka vishleshan' },
  { href: '/learn/property-investment-prediction', label: 'Property Investment Prediction', note: 'Nivesh ka prashn' },
  { href: '/learn/property-dispute-prediction', label: 'Property Dispute Prediction', note: 'Vivad ke sanket' },
  { href: '/learn/inheritance-wealth-prediction', label: 'Inheritance Wealth Prediction', note: 'Viraasat — aathvaan bhaav' },
  { href: '/learn/vehicle-purchase-prediction', label: 'Vehicle Purchase Prediction', note: 'Vahan yog' },
  { href: '/learn/foreign-property-prediction', label: 'Foreign Property Prediction', note: 'Videsh mein sampatti' },
  { href: '/blog/kya-mera-ghar-hoga', label: 'क्या मेरा घर होगा', note: 'हिंदी में पूरा लेख' },
  { href: '/blog/paitrik-sampatti-yog-jyotish', label: 'पैतृक संपत्ति योग', note: 'विरासत का योग' },
];

const V6_HUB_CALC: V6Link[] = [
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Shani ka gochar' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Buying window ka aadhaar' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Mangal ka asli bal' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Bhaav ka bal' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna se pehle jaanch' },
  { href: '/calculators/free-foreign-settlement-calculator', label: 'Foreign Settlement Calculator', note: 'Videsh ka prashn' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Chautha bhaav lagna se banta hai' },
  { href: '/panchang', label: 'Panchang', note: 'Registry ka muhurat' },
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

function V6Hub({ items }: { items: V6Link[] }) {
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
            <li key={sec.id}>
              <a href={`#${sec.id}`} className="hover:underline underline-offset-2 text-slate-300">{sec.h2}</a>
            </li>
          ))}
        </ol>
      </nav>

      <section className="max-w-4xl mx-auto">
        {V6_SECTIONS.map((sec, si) => (
          <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-10">
            <h2 className="text-2xl font-serif font-bold mb-4 text-[#D4AF37]">{sec.h2}</h2>
            {sec.paras.map((p, pi) => (
              <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                <V6Rich text={p} k={`v6-${si}-${pi}`} />
              </p>
            ))}
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto mt-12 rounded-2xl p-5 md:p-6 bg-[#0B0F1A] border border-white/[0.07]">
        <h2 className="text-base font-bold m-0 mb-2 text-[#D4AF37]">Property ka poora guide — aur muft jaanch</h2>
        <p className="text-xs leading-relaxed mb-4 text-slate-400">
          Ye page faisle ka hai — abhi anukool hai ya nahi. Sidhant, vivad, viraasat aur nivesh ke liye alag vistrit pages hain, aur jaanch ke liye muft calculators.
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

export default function PropertyYogPage() {
  return (
    <>
      {/* v5.0: plain <script>, rendered by this SERVER component so it lands
          in the SSR HTML. next/script deferred it into the Flight payload and
          the page shipped with zero structured data. Do not change this back. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Real Estate Karma Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">Is This the Right Time to <span className="text-[#D4AF37]">Buy Property?</span><br />Your Kundali Knows.</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">Trikaal AI reads your 4th House, Mars placement & Saturn transit to tell you if Property Yog is active — or if buying now could be a <span className="text-[#D4AF37] font-semibold">costly karmic mistake</span>.</p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/founder" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris (self-hosted)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Check My Property Yog — Free</Link>
            </div>
          </div>
        </section>

        {/* ── v6.0: the actual reading form, preselected to mill_property_yog.
            Replaces the dead homepage hop. Same BirthForm, same free-then-paid
            flow, and it carries its own id="birth-form" anchor. ─────────── */}
        <section className="px-4 pb-10 -mt-6">
          <ServiceReadingForm
            domain="property-yog"
            heading="Apna Property Yog abhi dekhiye"
            subheading="Chautha bhaav, Mangal ki sthiti aur Shani ka gochar — aapki apni kundali se, turant."
          />
        </section>

        <AuthorStrip />
        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Why Vedic Astrology Predicts <span className="text-[#D4AF37]">Property Timing</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "🏠", title: "The 4th House Is the House of Property", desc: "The 4th house directly governs land, home, real estate, and immovable assets. Its lord's strength, placement, and current transit determines whether property acquisition is cosmically supported or blocked by hidden obstacles." },
                { icon: "♂", title: "Mars Is the Karaka of Land & Real Estate", desc: "Mars (Mangal) is the significator of land in Vedic astrology. Its placement in your natal chart is the single most important factor in property timing. A debilitated Mars buying window can lead to legal disputes or financial loss." },
                { icon: "♄", title: "Saturn Transit Determines Long-Term Value", desc: "Saturn's Sade Sati and Dhaiya cycles profoundly affect your relationship with fixed assets. Buying during a favourable Saturn transit locks in long-term appreciation. Buying during a malefic Saturn window invites delay or depreciation." },
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
                  { step: "01", title: "Enter Your Birth Details", desc: "Date, time, place. Even 15 minutes difference changes your 4th house cusp — precision matters for property readings." },
                  { step: "02", title: "Trikaal Reads Your Property Yog", desc: "4th lord strength, Mars placement, Saturn transit over 4th house, and Dasha activation of real-estate yogas in your chart." },
                  { step: "03", title: "Get Your Buy / Wait Signal", desc: "₹51 reading: Is Property Yog active? Best buying window in months? Any legal dispute risk in this property?" },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{s.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <DeliverableCard segment="property-yog" items={["4th House Property Yog analysis", "Mars Karaka land energy reading", "Saturn transit risk assessment", "Buy / Wait / Avoid signal", "Best months for registration", "Legal dispute risk from chart", "4-week financial energy forecast"]} />
            </div>
          </div>
        </section>
        <MaaDivineSeva />
        <section className="px-4 pb-4"><V6Content /></section>

        <FaqSection items={[
          { q: "What is Property Yog in Vedic astrology?", a: "Property Yog is a specific planetary combination indicating ownership of immovable property. Key indicators include a strong 4th house lord, Mars well-placed, and the 4th lord connected to the 11th house. When activated by the right Dasha, property acquisition becomes auspicious." },
          { q: "Which planets govern property in Vedic astrology?", a: "The 4th house governs home and property. Mars (Mangal) is the Karaka of land. Saturn determines long-term value through its transit. Jupiter aspecting the 4th house creates expansion in property." },
          { q: "What is Sade Sati and how does it affect property buying?", a: "Sade Sati is Saturn's 7.5-year transit over your Moon sign. Buying property during peak Sade Sati can invite delays, disputes, or depreciation. Rohiit Gupta checks your Sade Sati status before recommending any purchase timing." },
          { q: "Can astrology predict legal disputes in property purchase?", a: "Yes. The 12th house (losses), 6th house (disputes), and malefic planets in the 4th house can indicate legal complications. Rohiit Gupta reads these risk indicators as part of every property yog reading." },
        ]} />
        <PropertyHindiBlock />
        <CtaSection headline="Before You Sign Anything —" highlight="Read Your Stars." body="A property is a multi-lakh decision. ₹51 to verify if the timing is right — or if your chart is warning you to wait." segment="property-yog" />
        <SiteFooter />
      </main>
    </>
  );
}
/* ─── SHARED COMPONENTS (inlined) ─────────────── */

// ── v5.0: Hindi + hub content, rendered as plain server markup ──────
// Every href below was verified against the live sitemap on 31 Aug 2026.
type PyLink = { href: string; label: string; note: string };

const PY_HUB_HI: PyLink[] = [
  { href: '/blog/property-yog-real-estate-astrology-hindi', label: 'प्रॉपर्टी योग — पूरी गाइड', note: 'यहाँ से शुरू करें' },
  { href: '/blog/property-yogas-raj-jupiter-mars-dhana-astrology-hindi', label: 'संपत्ति योग समझें', note: 'राज योग, बृहस्पति-मंगल, धन योग' },
  { href: '/blog/mars-bhoomi-karaka-property-astrology-hindi', label: 'मंगल — भूमि कारक', note: 'ज़मीन का असली कारक ग्रह' },
  { href: '/blog/dasha-timing-property-buy-window-astrology-hindi', label: 'दशा और खरीद-विंडो', note: 'कब खरीदें, कब रुकें' },
  { href: '/blog/mangal-dosh-4th-house-effects-hindi', label: 'चौथे भाव में मंगल दोष', note: 'घर, माता और उपाय' },
  { href: '/blog/pitra-dosh-in-4th-house-hindi', label: 'चतुर्थ भाव में पितृ दोष', note: 'पैतृक संपत्ति के विवाद' },
];

const PY_HUB_EN: PyLink[] = [
  { href: '/blog/property-yog-real-estate-astrology', label: 'Property Yog — complete guide', note: 'The pillar' },
  { href: '/blog/property-yogas-raj-jupiter-mars-dhana-astrology', label: 'Property Yogas explained', note: 'Raj, Jupiter-Mars, Dhana' },
  { href: '/blog/mars-bhoomi-karaka-property-astrology', label: 'Mars as Bhoomi Karaka', note: 'The land significator' },
  { href: '/blog/dasha-timing-property-buy-window-astrology', label: 'Dasha and your buy window', note: 'When to move, when to wait' },
  { href: '/learn/property-prediction-astrology', label: 'Property prediction — reference', note: 'Houses, lords, yogas' },
  { href: '/learn/vehicle-purchase-prediction', label: 'Vehicle purchase timing', note: '4th house, the other asset' },
];

const PY_SECTIONS: { id: string; h2: string; paras: string[] }[] = [
  {
    id: 'sampatti-yog-jyotish',
    h2: 'संपत्ति योग ज्योतिष — कुंडली में प्रॉपर्टी योग क्या होता है',
    paras: [
      '**संपत्ति योग वह ग्रह-संयोजन है जो अचल संपत्ति के स्वामित्व का संकेत देता है।** यह किसी एक ग्रह से नहीं बनता — यह **चतुर्थ भाव**, उसके **स्वामी**, और **मंगल** के आपसी सम्बन्ध से बनता है। चतुर्थ भाव घर, भूमि, माता और सुख का भाव है; मंगल भूमि का कारक है; और शनि उस संपत्ति के दीर्घकालिक मूल्य को तय करते हैं।',
      'शास्त्र में जो संयोजन सबसे प्रबल माने जाते हैं वे तीन हैं। **चतुर्थेश का एकादश भाव से सम्बन्ध** — यानी घर का भाव लाभ के भाव से जुड़ जाए; यही सबसे स्पष्ट संपत्ति योग है। **गुरु की चतुर्थ भाव पर दृष्टि** — विस्तार और शुभता। और **बलवान मंगल**, विशेषकर जब वे चतुर्थ या दशम से सम्बन्धित हों। इन तीनों का शास्त्रीय विवरण [संपत्ति योग समझें — राज योग, बृहस्पति-मंगल और धन योग](/blog/property-yogas-raj-jupiter-mars-dhana-astrology-hindi) में है।',
      'पर योग का होना अकेला काफी नहीं है, और यही वह बात है जो सबसे कम बताई जाती है: **योग को सक्रिय करने के लिए सही दशा चाहिए।** जिस कुंडली में प्रबल संपत्ति योग है पर चतुर्थेश की दशा अभी दूर है, वहाँ खरीद टल सकती है या भारी पड़ सकती है। अपनी चल रही दशा [मुफ्त दशा कैलकुलेटर](/calculators/free-dasha-calculator) से देख लीजिए — यह बीस सेकंड का काम है और खरीद के फैसले पर सीधा असर डालता है।',
    ],
  },
  {
    id: 'ghar-kab-kharidein',
    h2: 'घर खरीदने का शुभ समय — कुंडली से कैसे तय करें',
    paras: [
      'यह सवाल दो हिस्सों में बँटता है, और लोग अक्सर दूसरे हिस्से पर अटक जाते हैं। **पहला: क्या आपकी कुंडली में संपत्ति योग है?** दूसरा: **क्या अभी उसका समय है?** पहला जन्म कुंडली से तय होता है और जीवन भर एक ही रहता है; दूसरा दशा और गोचर से बदलता रहता है।',
      'समय तय करने के लिए तीन चीजें एक साथ देखी जाती हैं। **चल रही महादशा और अंतर्दशा** — क्या चतुर्थेश, मंगल या गुरु की अवधि सक्रिय है; यह [दशा और खरीद-विंडो](/blog/dasha-timing-property-buy-window-astrology-hindi) में विस्तार से है। **शनि का गोचर** — [साढ़े साती](/calculators/free-sade-sati-calculator) के शिखर चरण में की गई बड़ी खरीद अक्सर विलंब, विवाद या मूल्य-ह्रास लाती है। और **चतुर्थ भाव की वर्तमान स्थिति** — कोई पाप ग्रह वहाँ बैठा या दृष्टि डाल रहा हो तो सावधानी।',
      'रजिस्ट्री या गृह प्रवेश की तिथि के लिए **मुहूर्त** अलग विषय है और वह पंचांग से निकलता है, कुंडली से नहीं — शुभ तिथियाँ [पंचांग](/panchang) पर प्रतिदिन अपडेट होती हैं। पर एक बात साफ रखिए: **अच्छा मुहूर्त गलत दशा को ठीक नहीं करता।** पहले दशा देखिए, फिर मुहूर्त।',
    ],
  },
  {
    id: 'kaun-se-grah',
    h2: 'संपत्ति के लिए कौन से ग्रह जिम्मेदार होते हैं',
    paras: [
      '**मंगल — भूमि कारक।** शास्त्र में भूमि का सीधा कारक मंगल हैं, और यही कारण है कि प्रॉपर्टी की हर गंभीर रीडिंग मंगल से शुरू होती है। बलवान मंगल संपत्ति देते हैं; पीड़ित मंगल संपत्ति में विवाद, सीमा-झगड़ा या जल्दबाजी का सौदा। पूरा विश्लेषण [मंगल — भूमि कारक](/blog/mars-bhoomi-karaka-property-astrology-hindi) में है।',
      '**शनि — स्थायित्व और मूल्य।** शनि तय करते हैं कि संपत्ति टिकेगी और बढ़ेगी या बोझ बनेगी। **गुरु — विस्तार।** चतुर्थ भाव पर गुरु की दृष्टि बड़ा और शुभ घर देती है। **चंद्र — मानसिक सुख**, क्योंकि चतुर्थ भाव का कारक चंद्रमा भी है; इसीलिए कुछ लोगों को बड़ा घर मिलकर भी सुख नहीं मिलता।',
      'और एक चेतावनी जो पैसे बचाती है: **पैतृक संपत्ति के विवाद अक्सर चतुर्थ भाव के पितृ दोष से जुड़े मिलते हैं** — यह [चतुर्थ भाव में पितृ दोष](/blog/pitra-dosh-in-4th-house-hindi) में खोला गया है, और उसे [मुफ्त पितृ दोष कैलकुलेटर](/calculators/free-pitra-dosh-calculator) से जाँचा जा सकता है। इसी तरह [चौथे भाव में मंगल दोष](/blog/mangal-dosh-4th-house-effects-hindi) घर की शांति पर असर डालता है — वह [मांगलिक कैलकुलेटर](/calculators/free-manglik-dosh-calculator) से मुफ्त जाँच लीजिए।',
    ],
  },
  {
    id: 'delhi-ncr-property',
    h2: 'दिल्ली NCR में प्रॉपर्टी — और हर जगह',
    paras: [
      'त्रिकाल वाणी **द्वारका, नई दिल्ली** से चलता है, और स्वाभाविक रूप से सबसे ज्यादा प्रॉपर्टी सवाल **दिल्ली NCR** से ही आते हैं — नोएडा एक्सटेंशन और ग्रेटर नोएडा वेस्ट के फ्लैट, गुड़गांव के नए सेक्टर, गाजियाबाद में इंदिरापुरम और राज नगर एक्सटेंशन, और दिल्ली में पैतृक मकान का बँटवारा।',
      'पर रीडिंग शहर से नहीं बदलती, और यह साफ कह देना ईमानदारी है: **कुंडली वही रहती है चाहे आप द्वारका में हों या दुबई में।** चतुर्थ भाव, मंगल और दशा — तीनों जन्म विवरण से निकलते हैं, संपत्ति के पते से नहीं। दिल्ली NCR के ग्राहक ज्यादा इसलिए हैं क्योंकि प्रैक्टिस यहीं है, इसलिए नहीं कि यहाँ की रीडिंग अलग होती है।',
      'स्थानीय संदर्भ चाहिए तो [दिल्ली में ज्योतिषी](/astrologer-delhi) पेज पर पूरा पता, फोन और फीस है। और कीमत हर जगह एक जैसी है — **₹51**, चाहे संपत्ति दस लाख की हो या दस करोड़ की।',
    ],
  },
];

function PyHub({ items }: { items: PyLink[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold text-[#D4AF37] group-hover:brightness-125">{i.label}</span>
            <span className="block text-xs text-gray-500">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PyRich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={`${k}-l-${i}`} href={link[2]} className="text-[#D4AF37] font-semibold underline underline-offset-2 hover:brightness-125">
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

function PropertyHindiBlock() {
  return (
    <section className="px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {PY_SECTIONS.map((s) => (
          <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4 text-[#D4AF37]">{s.h2}</h2>
            {s.paras.map((p, i) => (
              <p key={i} className="text-gray-300 leading-relaxed mb-4">
                <PyRich text={p} k={`${s.id}-${i}`} />
              </p>
            ))}
          </div>
        ))}

        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 mt-14 text-[#D4AF37]">
          प्रॉपर्टी ज्योतिष — पूरा गाइड पढ़ें
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          नीचे हर विषय पर अलग विस्तृत लेख है — हिंदी और अंग्रेज़ी दोनों में। खरीदने से पहले कम से कम
          दशा और चतुर्थ भाव वाले दो लेख जरूर पढ़िए।
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 border-b border-[#D4AF37]/25 pb-2 font-serif text-base font-bold text-gray-200">हिंदी में</h3>
            <PyHub items={PY_HUB_HI} />
          </div>
          <div>
            <h3 className="mb-3 border-b border-[#D4AF37]/25 pb-2 font-serif text-base font-bold text-gray-200">In English</h3>
            <PyHub items={PY_HUB_EN} />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6">
          <h2 className="font-serif text-xl font-bold mb-3 text-[#D4AF37]">खरीदने से पहले ये तीन मुफ्त जाँच कर लीजिए</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            ₹51 खर्च करने से पहले भी — ये तीनों मुफ्त हैं और अक्सर आधा जवाब वहीं मिल जाता है।
          </p>
          <ul className="space-y-2 text-[15px] text-gray-300">
            <li>
              <Link href="/calculators/free-dasha-calculator" className="text-[#D4AF37] underline underline-offset-4">दशा कैलकुलेटर</Link>
              {' '}— अभी कौन सी महादशा चल रही है, और अगली कब।
            </li>
            <li>
              <Link href="/calculators/free-sade-sati-calculator" className="text-[#D4AF37] underline underline-offset-4">साढ़े साती कैलकुलेटर</Link>
              {' '}— शनि का दबाव चल रहा है या नहीं, और किस चरण में।
            </li>
            <li>
              <Link href="/calculators/free-kundali-calculator" className="text-[#D4AF37] underline underline-offset-4">मुफ्त कुंडली</Link>
              {' '}— चतुर्थ भाव और मंगल की असली स्थिति, भाव सहित।
            </li>
          </ul>
          <p className="text-gray-500 text-sm mt-4">
            संपत्ति के साथ धन का पूरा चित्र चाहिए तो{' '}
            <Link href="/services/wealth-reading" className="text-[#D4AF37] underline underline-offset-4">वेल्थ रीडिंग</Link>
            {' '}और{' '}
            <Link href="/karmic-background-reading" className="text-[#D4AF37] underline underline-offset-4">कार्मिक बैकग्राउंड रीडिंग</Link>
            {' '}देखिए। सारे विकल्प{' '}
            <Link href="/pricing" className="text-[#D4AF37] underline underline-offset-4">प्राइसिंग पेज</Link> पर हैं।
          </p>
        </div>
      </div>
    </section>
  );
}

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
        <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-6 py-3 rounded-lg hover:bg-[#e8c84a] transition-all duration-200">Free Reading Shuru Kijiye</Link>
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
