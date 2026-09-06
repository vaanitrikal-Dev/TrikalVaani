/**
 * TRIKAAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/services/career-pivot/page.tsx
 * Version: 5.0 (06 Sep 2026) — CALCULATOR CONVERSION + keyword content
 *
 * WHAT CHANGED
 *   1. All three CTAs pointed at /?segment=... Nothing in this repo reads the
 *      `segment` query parameter — category selection is React state set by
 *      CLICKING a homepage card, so the visitor landed on the plain homepage
 *      and had to scroll, pick an age tab and find the card again.
 *   2. The page led with the price while BirthForm has a free tier and the
 *      homepage cards say "Free chart reading for this topic".
 *   3. The title carried the brand manually on top of app/layout.tsx's
 *      "%s | Trikaal Vaani" template, so it rendered double-branded and was
 *      cut by Google at ~58 characters.
 *   The real BirthForm now sits on the page, preselected to genz_dream_career.
 *
 * DOMAIN: genz_dream_career
 *   Single chart — this domain is NOT in DUAL_CHART_DOMAINS.
 *   If this id is ever changed, /api/predict falls back to 'mill_karz_mukti'
 *   (BirthForm L998) and the reader silently receives a DEBT reading.
 *
 * GSC, 3 months to 4 Sep 2026: 62 impressions, 1 click, CTR 1.61%, average position 17.5.
 *
 * CANNIBALISATION — content here stays on the DECISION this page serves.
 *   Every general/informational branch is handed off by LINK to the existing
 *   /learn/ and /blog/ pages rather than re-explained, so this page does not
 *   compete with our own library.
 *
 * Version: 4.1 — IR-0 cleanup
 *
 * v4.1 CHANGES vs v4.0:
 *   ❌ REMOVED fake testimonials (fabricated reviews + ★★★★★ + "Verified Experiences")
 *   ❌ REMOVED phantom ₹499 (hero call button, step 04, card strike-through, CTA button)
 *   ✅ "Prokerala API" → "self-hosted Swiss Ephemeris" (true tech — 3 spots)
 *   ✅ "Jini" / "Jini AI" → "Trikaal" (persona retired)
 *   ✅ "Gemini AI reasoning" → "premium AI reasoning" (vendor name hidden)
 *   ✅ /about → /founder (correct author URL — 3 spots)
 *   ✅ keyword "vedic astrologer Delhi" → "India"
 *   ✅ KEPT Maa Divine Seva (real Arzi/Dhanyewaad dakshina feature)
 */
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import ServiceReadingForm from '@/components/services/ServiceReadingForm';

export const metadata: Metadata = {
  title: { absolute: "Career Change Ka Sahi Samay — Free Jaanch | Trikaal Vaani" },
  description: "Chief Vedic Architect Rohiit Gupta reads your 10th House, Jupiter & Atmakaraka to reveal your dharmic profession and exact pivot window. ₹51 deep reading.",
  keywords: ["career change astrology vedic", "dharmic career astrology", "10th house career vedic astrology", "Atmakaraka career reading", "Rohiit Gupta vedic astrologer India"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  openGraph: { title: "Should I Change My Career? | Trikaal Vaani", description: "Rohiit Gupta decodes your 10th House, Jupiter & dharmic profession.", url: "https://trikalvaani.com/services/career-pivot", siteName: "Trikaal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/career-pivot" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Career Pivot — Dharmic Career Reading", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/founder" }, offers: [{ "@type": "Offer", price: "51", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Can Vedic astrology tell me the right career for my soul?", acceptedAnswer: { "@type": "Answer", text: "Yes. The 10th house reveals your highest calling. The Atmakaraka shows your soul's primary purpose. Jupiter's sign and nakshatra determine what domain feels divinely aligned. Together these reveal your dharmic profession." } },
      { "@type": "Question", name: "What is the best time to change careers according to Vedic astrology?", acceptedAnswer: { "@type": "Answer", text: "The best career change windows occur during Jupiter or Venus Mahadasha with 10th house activation. Changing during Ketu Mahadasha creates confusion. Rohiit Gupta reads your exact Dasha to give you a specific month window." } },
      { "@type": "Question", name: "What is Atmakaraka and how does it relate to career?", acceptedAnswer: { "@type": "Answer", text: "The Atmakaraka is the planet with the highest degree in your birth chart. It represents your soul's deepest longing. When your career aligns with your Atmakaraka's energy, work feels meaningful." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Career Pivot", item: "https://trikalvaani.com/services/career-pivot" }] },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// v5.0 CONTENT — decision side only. See the cannibalisation note in the file
// header before adding any heading here.
// ════════════════════════════════════════════════════════════════════════════

type V6Section = { id: string; h2: string; paras: string[] };
type V6Link    = { href: string; label: string; note: string };

const V6_SECTIONS: V6Section[] = [
  {
    id: 'kaise-kaam',
    h2: 'Career Pivot Reading — kaam kaise karta hai',
    paras: [
      'Upar wale form mein **janm tithi, sateek samay aur sthan** daaliye. Reading aapki apni kundali padhti hai — koi saamanya rashi-chart nahi.',
      'Dekha kya jaata hai: **dasham bhaav aur uska swami** (karm aur pad), **Dasamsa (D-10)** — career ka apna varga chart, **chhathaa bhaav** (naukri aur sewa), **ekadash** (laabh), aur **chal rahi dasha** jo batati hai ki badlaav ka daur abhi hai ya nahi.',
      '**Pehla reading free hai.** Poora vishleshan chahiye to uske baad ₹51 ka vikalp aata hai.',
    ],
  },
  {
    id: 'asli-sawaal',
    h2: 'Aapka asli sawaal shayad ye nahi hai jo aap poochh rahe hain',
    paras: [
      'Log yahan "career badlun ya nahi" le kar aate hain. Par prayah sawaal uske neeche kuch aur hota hai — **"kya main galat jagah hoon, ya bas thak gaya hoon?"**',
      'Ye do bilkul alag cheezein hain, aur chart mein dono alag dikhti hain. **Galat kshetra** ka sanket Dasamsa mein hota hai — wahan aapka kaam aur aapka swabhav mel nahi khaate. **Thakan** ka sanket dasha mein hota hai — ek bhaari daur chal raha hota hai jo apne samay par khatm ho jaata hai.',
      'Antar kyun mayne rakhta hai: **thakan mein naukri badalne se kuch nahi badalta** — nayi jagah bhi wahi mehsoos hota hai. Aur galat kshetra mein rukne se saal nikal jaate hain.',
      'Reading pehle yahi alag karti hai. Baaki sab uske baad aata hai.',
    ],
  },
  {
    id: 'dasham-bhaav',
    h2: 'Dasham bhaav — karm ka ghar',
    paras: [
      'Career ka har prashn **dasham bhaav** se shuru hota hai. Shastra mein ise **karm bhaav** kaha gaya hai — pesha, pad, samaj mein sthaan.',
      'Teen cheezein dekhi jaati hain: **dasham mein kaun baitha hai**, **uska swami kahan hai** (kendra ya trikona mein ho to sthiti mazboot; chhathe, aathve ya barahve mein ho to sangharsh), aur **uska bal** Shadbala se.',
      'Ek zaroori sudhar: **khaali dasham bhaav kamzor nahi hota.** Bhaav ka phal uske **swami** se chalta hai, grahon ki bheed se nahi. Khaali dasham aur balwan dashamesh wali kundali prayah bhare dasham aur peedit swami wali se behtar hoti hai.',
      'Poora sidhant [Career Prediction Astrology](/learn/career-prediction-astrology) par hai — yahan dobara nahi likha, kyunki wo page usi ke liye bana hai.',
    ],
  },
  {
    id: 'dasamsa',
    h2: 'Dasamsa (D-10) — career ka asli chart',
    paras: [
      'Ye wo hissa hai jo adhikansh muft tool nahi dete, aur career ke prashn mein iske bina vishleshan adhoora hai.',
      'BPHS saaf kehta hai: **janm chart vaada dikhata hai, Dasamsa uski pushti karta hai.** Ek graha jo dasham bhaav mein achha baitha ho par D-10 mein kamzor pade, uska phal vaade se kam nikalta hai. Yahi wajah hai ki "sab theek dikhta hai par kuch ho nahi raha".',
      'Dekha jaata hai: **D-10 ka lagna**, us chart mein **dashamesh kahan hai**, aur **vargottama** — koi graha janm chart aur D-10 dono mein ek hi rashi mein ho, jo bahut anukool hai.',
      'Ye poore reading mein aata hai, aur yahi wo jagah hai jahan "kaunsa kshetra sach mein mera hai" ka uttar milta hai.',
    ],
  },
  {
    id: 'kaunsa-kshetra',
    h2: 'Kaunsa kshetra mera hai — chart kya ishara karta hai',
    paras: [
      'Ye sawaal poora uttar nahi paa sakta, aur ye kah dena imandari hai. Par **disha** zaroor milti hai.',
      'Dekha jaata hai: **dashamesh kaunsa graha hai** — Budh ho to sanvaad, vyapaar, likhat; Mangal ho to takniki, rakshaa, shalya; Guru ho to shiksha, salah, kanoon; Shukra ho to kala, saundarya, sambandh; Shani ho to sewa, nirmaan, lambe anushasit kaam.',
      'Iske saath **Atmakaraka** (sabse ooncha degree wala graha) aur **Amatyakaraka** (doosra sabse ooncha) — Jaimini paddhati mein Amatyakaraka hi pesha darshata hai.',
      'Par seema saaf: **chart kshetra ka rang batata hai, uska naam nahi.** "Aap engineer banenge" jaisa uttar koi shastra nahi deta. Poora vishleshan [Best career from your birth chart](/learn/best-career-birth-chart) par hai.',
    ],
  },
  {
    id: 'badlaav-ka-samay',
    h2: 'Badlaav ka sahi samay — dasha se kaise nikalta hai',
    paras: [
      'Ye reading ka sabse kaam ka hissa hai, kyunki adhikansh log yahi jaanne aate hain.',
      '**Anukool sanket:** dashamesh ki Mahadasha ya Antardasha shuru hona, **Guru ka dasham ya ekadash par gochar** (Guru nayi raah kholta hai), aur **chhathe bhaav ke swami ka daur** — kyunki naukri chhathe bhaav ka vishay hai.',
      '**Rukne ke sanket:** Shani ka dasham par bhaari gochar — badlaav hota hai par dheere; aur **Rahu ka daur**, jisme badlaav to aata hai par uljhan ke saath. Us daur mein offer letter aane se pehle purani naukri nahi chhodni chahiye.',
      'Uttar ek **window** ke roop mein milta hai, tareekh ke roop mein nahi — kyunki dasha mahinon mein chalti hai. Apni dasha [Dasha Calculator](/calculators/free-dasha-calculator) par free dikh jaati hai.',
    ],
  },
  {
    id: 'naukri-ya-vyapaar',
    h2: 'Naukri karun ya apna kaam shuru karun',
    paras: [
      'Ye alag prashn hai aur alag bhaavon se dekha jaata hai — isliye ise "career badlun" wale sawaal se mila dena galat nishkarsh deta hai.',
      '**Naukri** chhathe bhaav ka vishay hai — sewa aur pratiyogita. **Apna kaam** saatve aur dasham ka — saajhedaari aur swatantra karm. Balwan saptam aur ekadash ke saath vyapaar ka yog prabal maana jaata hai.',
      'Sanket: **Budh aur Shukra** balwan hon to vyapaar sahaj; **Shani** pradhan ho to naukri aur sansthagat kaam zyada anukool, kyunki Shani dhaanche mein kaam karta hai.',
      'Aur ek imandar baat: **ye faisla poonji, parivaar ki sthiti aur jokhim uthane ki kshamata se zyada juda hai** — aur wo teeno chart mein nahi hain. Startup ka vishay [Career astrology for startup founders](/learn/career-astrology-for-startup-founders) par hai.',
    ],
  },
  {
    id: 'sarkari-ya-private',
    h2: 'Sarkari naukri ya private — alag jaanch hai',
    paras: [
      'Ye prashn is page par aata hai par uska uttar alag jagah hai, aur ye saaf kar dena chahiye.',
      'Sarkari sewa ke liye dekhe jaate hain **Surya** (adhikaar aur sarkar ka kaarak), **dasham bhaav ka Surya se sambandh**, aur **Raj Yoga** ke sanyog. Private kshetra ke liye **Budh, Shukra aur ekadash** ka vazan zyada hai.',
      'Aur pratiyogi pariksha ka apna alag vishleshan hai — panchma bhaav (buddhi), navam (bhagya) aur dasha ka mel.',
      'Agar aapka asli sawaal sarkari naukri ka hai to uske liye alag pages hain aur wo behtar uttar denge — [Government Job & UPSC](/learn/government-job-chances) aur [IAS Astrology Calculator](/calculators/free-ias-astrology-calculator), jo free hai.',
    ],
  },
  {
    id: 'umar-ke-hisaab',
    h2: 'Kis umar mein badlaav theek hai — chart kya kehta hai',
    paras: [
      'Log poochhte hain ki "ab bahut der ho gayi kya". Chart ka uttar shayad chaunkane wala hai.',
      '**Jyotish mein career ke liye koi umar-seema nahi hai.** Jo mayne rakhta hai wo dasha hai. Bahut se logon ka dashamesh ka daur 40 ke baad aata hai, aur unka asli kaam wahin se shuru hota hai.',
      '**Shani ka Return** — lagbhag 29-30 saal aur phir 58-59 par — prayah career ki disha badalta hai. Ye classical hai aur bahut logon ke saath dikhta hai. Us daur mein kiya gaya badlaav prayah tikta hai.',
      'Aur ek baat jo raahat deti hai: **Guru ki dasha 16 saal ki hoti hai, Shani ki 19.** Yaani anukool daur chhota nahi hota. Agar wo abhi shuru ho raha hai to jaldi karne ki zaroorat nahi.',
    ],
  },
  {
    id: 'padhai-badalna',
    h2: 'Padhai ya skill badalni chahiye — kya dekhein',
    paras: [
      'Career pivot ka bada hissa nayi padhai ya skill hota hai, aur uske apne sanket hain.',
      'Dekhe jaate hain **panchma bhaav** (buddhi aur seekhne ki kshamata), **Budh** (vishleshan aur abhyaas), aur **Guru** (uchch shiksha aur gyaan). Balwan Budh-Guru ke saath nayi skill jaldi baithti hai.',
      '**Saraswati Yoga** — jab Budh, Guru aur Shukra kendra ya trikona mein achhi sthiti mein hon — vidya aur kala ke liye bahut anukool maana jaata hai. Uska vistaar [Saraswati Yoga](/blog/saraswati-yoga-child-education-astrology) mein hai.',
      'Vyavharik salah: **Guru ki dasha ya antardasha padhai ke liye sabse anukool** maani jaati hai. Agar wo abhi chal rahi hai to nayi degree ya certification ka samay theek hai.',
    ],
  },
  {
    id: 'paisa-kam-ho-jayega',
    h2: 'Badlaav mein paisa kam ho jaayega — kya chart bata sakta hai',
    paras: [
      'Ye asli chinta hai aur uska imandar uttar zaroori hai.',
      'Chart mein dhan ke bhaav **dwitiya** (sanchit) aur **ekadash** (aay) hain. Agar dono mazboot hain aur unke swami achhi jagah baithe hain, to arthik sthiti badlaav ke jhatke ko jhel leti hai — aur reading yahi batati hai.',
      'Agar **ekadash kamzor** hai ya **barahvaan bhaav bhaari** hai (vyay ka bhaav), to badlaav ke daur mein arthik dabav badhne ka sanket maana jaata hai. Aise mein salah wahi hoti hai jo koi bhi samajhdar dega — **nayi jagah pakki hone tak purani mat chhodiye.**',
      'Par seema saaf: **chart aapki salary ka aankda nahi bata sakta.** Wo aapke kshetra, anubhav aur baatcheet par tikta hai — teeno chart mein nahi hain.',
    ],
  },
  {
    id: 'sade-sati-career',
    h2: 'Sade Sati mein career badalna theek hai',
    paras: [
      'Ye dar bahut aam hai, isliye seedha uttar.',
      '**Sade Sati Shani ka gochar hai** — janm Chandra rashi se barahvin, pehli aur doosri rashi par, lagbhag saadhe saat saal. Uska kaam career mein prayah **zimmedari badhana aur shortcut band karna** hota hai.',
      'Jo saaf kehna chahiye: **Sade Sati career badalne se nahi rokti.** Bahut se log usi daur mein sabse bada kadam uthate hain — kyunki Shani mehnat ka phal deta hai. Jo wo karta hai wo ye ki **aasan raste band ho jaate hain**, aur jo tik kar kaam karta hai wahi aage nikalta hai.',
      'Apni sthiti [Sade Sati Calculator](/calculators/free-sade-sati-calculator) se dekhiye — wo **Chandra rashi** se chalta hai, lagna se nahi, jo ek aam galti hai.',
    ],
  },
  {
    id: 'vipreet-raj-yoga',
    h2: 'Vipreet Raj Yoga — jab rukavat hi rasta ban jaaye',
    paras: [
      'Ye shastra ka wo hissa hai jo career ke prashn mein sabse zyada raahat deta hai aur sabse kam bataya jaata hai.',
      '**Vipreet Raj Yoga** tab banta hai jab chhathe, aathve ya barahve bhaav ke swami aapas mein sambandh banayein. Teen "kathin" bhaav mil kar ek shubh yog bana dete hain, aur shastra kehta hai aisa vyakti **kathinai ke raste se hi ooncha uthta hai.**',
      'Career mein iska seedha arth hai: **jo naukri chhootna aaj sabse bada jhatka lag raha hai, wahi aage chal kar sabse bada mod ban sakta hai.**',
      'Ye yog aam hai aur reading mein alag se dikhta hai. Poora vishay [Vipreet Raj Yoga](/learn/vipreet-raj-yoga) par hai.',
    ],
  },
  {
    id: 'graha-ka-upay',
    h2: 'Career ke liye classical upay',
    paras: [
      'Upay dasham bhaav ke liye nahi, **uske swami** ke liye hote hain — kyunki bhaav ka phal swami se chalta hai. Ye antar zaroori hai warna upay galat graha par lag jaata hai.',
      'Char maarg hain aur teen mein paisa nahi lagta: **mantra** (dashamesh ka beej ya vedic mantra), **vaar aur vrat** (us graha ke din sanyam), **daan** (us graha se judi vastu, usi din), aur **devta** ki upasana.',
      'Career ke liye sabse zyada kahe jaane wale: **Surya** ke liye Ravivar aur Aditya Hridaya Stotra; **Shani** ke liye Shanivar, sarson ka tel aur kaale til; **Guru** ke liye Guruwar, peela daan aur chane ki daal.',
      'Chautha maarg ratna hai, aur uska faisla **bal se nahi, bhaav-swamitva se** hota hai — [Gemstone Suitability Calculator](/calculators/free-gemstone-suitability-calculator) par free jaanch hai.',
    ],
  },
  {
    id: 'kya-nahi-batata',
    h2: 'Ye reading kya nahi bata sakti',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye.',
      'Ye **nahi** bata sakti: kaunsi company join kijiye, salary kitni milegi, interview mein selection hoga ya nahi, ya kis tareekh ko resign kijiye. Ye chaaron nishchit ghatnaayein hain aur koi chart nishchit ghatna nahi batata.',
      'Aur ye **nahi hai**: career counselling ka vikalp. Aapke kshetra ka bazaar, aapki skill ka star, aur aage ki maang — teeno peshevar salah ke vishay hain.',
      'Jo ye deti hai: **abhi ka daur badlaav ke liye anukool hai ya nahi, aapka swabhavik jhukav kis taraf hai, aur agla anukool window kab hai.** Itna hi — par ye teeno faisle ko aasan kar dete hain.',
    ],
  },
  {
    id: 'free-vs-paid',
    h2: 'Free mein kya milta hai aur ₹51 mein kya',
    paras: [
      '**Free — Trikaal Ka Sandesh.** Aapka dasham bhaav, uska swami, chal rahi dasha, aur ek seedha sanket ki badlaav ka daur abhi hai ya nahi. 150-200 shabd, turant, bina signup aur bina card.',
      '**₹51 — poora vishleshan.** Dasham aur uske swami ka vistrit vishleshan, **Dasamsa (D-10)**, chhathaa aur ekadash bhaav, Atmakaraka aur Amatyakaraka, **badlaav ka window** dasha ke saath, aur paanch vyaktigat upay. Saath mein agle chhe mahine ka gochar.',
      'Jo yahan nahi hai: koi dar, koi "aapki kundali mein bhaari dosh hai", aur koi mehnga nivaran. Agar daur saadharan hai to reading saadharan hi likhegi.',
    ],
  },
  {
    id: 'kitni-baar',
    h2: 'Ye reading kitni baar leni chahiye',
    paras: [
      '**Janm-aadhaarit hissa ek baar ka hai** — dasham, uska swami, Dasamsa. Ye kabhi nahi badalte. Ek baar nikaal kar save kar lijiye.',
      '**Dasha wala hissa** tab dekhiye jab dasha badle, ya jab aap sach mein faisla lene ki sthiti mein hon. Saal mein ek baar kaafi hai.',
      'Jo nahi karna chahiye: **har bure din ke baad dobara chalana.** Aankda wahi rahega. Baar-baar dekhna sthiti nahi sudharta, sirf chinta badhata hai.',
    ],
  },
  {
    id: 'verify',
    h2: 'Reading ki buniyad khud parakhiye',
    paras: [
      'Kisi bhi reading par bharosa karne se pehle uski ganana parakhni chahiye.',
      'Wahi janm vivaran kisi doosre bharose-mand software mein daaliye. **Lagna, dasham bhaav ki rashi, aur dashamesh ki sthiti** bilkul milni chahiye — dono taraf Lahiri ayanamsha ho to antar nahi aayega.',
      'Aur **dasha** milaiye — kaunsi Mahadasha aur Antardasha chal rahi hai. Wo bilkul milni chahiye, kyunki wo janm nakshatra se nikalti hai aur usme koi vyakhya nahi hai.',
      'Agar **lagna hi alag** aaye to samay ya shahar mein galti hai — wahi pehle jaanchiye. Apna lagna [Lagna Calculator](/calculators/free-lagna-calculator) se dekh sakte hain.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Aage kya padhein',
    paras: [
      '**Career ka poora sidhant** — [Career Prediction Astrology](/learn/career-prediction-astrology), [Best career from your birth chart](/learn/best-career-birth-chart), [Career growth prediction](/learn/career-growth-prediction), aur Hindi mein [करियर भविष्यवाणी — पूरी गाइड](/blog/career-prediction-kundli-complete-guide-hindi).',
      '**Khaas prashn** — sarkari naukri ke liye [Government Job & UPSC](/learn/government-job-chances), apna kaam shuru karne ke liye [Startup founders](/learn/career-astrology-for-startup-founders), aur [Dream career aur profession](/blog/dream-career-profession-astrology).',
      '**Muft jaanch** — [Dasha Calculator](/calculators/free-dasha-calculator), [Sade Sati Calculator](/calculators/free-sade-sati-calculator), [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator), [IAS Astrology Calculator](/calculators/free-ias-astrology-calculator), [Kundali Calculator](/calculators/free-kundali-calculator).',
    ],
  },
  {
    id: 'atmakaraka',
    h2: 'Atmakaraka aur Amatyakaraka — Jaimini ka career sanket',
    paras: [
      'Ye Jaimini paddhati ka hissa hai aur career ke prashn mein bahut kaam ka, par kam bataya jaata hai.',
      '**Atmakaraka** wo graha hai jiski degree aapke chart mein sabse zyada ho — wo aatma ki ichha aur jeevan ka mool vishay darshata hai. **Amatyakaraka** doosre number ka graha hai, aur Jaimini mein **wahi pesha darshata hai**.',
      'Udaharan: Amatyakaraka Budh ho to sanvaad, likhat, vishleshan aur vyapaar; Shani ho to sewa, nirmaan, kanoon aur lambe anushasit kaam; Shukra ho to kala, saundarya, sambandh aur luxury; Mangal ho to takniki, rakshaa aur shalya.',
      'Ye sanket aksar chaunkate hain kyunki log unhe pehchaan lete hain — khaas kar tab jab unka aaj ka kaam usse mel nahi khaata. Reading mein ye alag se dikhta hai.',
    ],
  },
  {
    id: 'lagna-aur-career',
    h2: 'Lagna ka bal — kyunki dasham lagna se hi banta hai',
    paras: [
      'Ye baat aksar chhod di jaati hai aur uska asar seedha career par padta hai.',
      '**Dasham bhaav lagna se ginte hain.** Isliye lagna badla to dasham badla. Aur lagna ka swami kitna balwan hai, ye tay karta hai ki aap apne kaam mein kitni urja laga paate hain.',
      'Vyavharik roop se: **balwan lagnesh ke saath saamanya dasham bhi chal jaata hai**, kyunki vyakti mein tikne aur dobara khade hone ki kshamata hoti hai. Kamzor lagnesh ke saath achha dasham bhi poora phal nahi de paata — avsar aane par urja saath nahi deti.',
      'Isi liye ye reading dasham ke saath lagna bhi dekhti hai. Sirf lagna ka bal alag se [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) par milta hai, free.',
    ],
  },
  {
    id: 'rukavat-kahan',
    h2: 'Rukavat kahan hai — bhaav, swami ya dasha',
    paras: [
      'Jab career atka hua lage, to teen mein se ek jagah dikkat hoti hai — aur teeno ka upay alag hai. Ye pehchan hi aadha kaam hai.',
      '**Bhaav mein** — dasham par kroor grahon ki bhaari drishti, ya usme peedit graha. Yahan sthiti kaam ke mahaul se judi hoti hai.',
      '**Swami mein** — dashamesh kamzor, ast, neech ya dusthana mein. Yahan dikkat aapki apni urja aur disha se judi hoti hai, jagah se nahi — isi liye naukri badalne par bhi wahi mehsoos hota hai.',
      '**Dasha mein** — bhaav aur swami dono theek hain par unka daur abhi nahi chal raha. Ye sabse achhi sthiti hai, kyunki isme kuch "theek" karne ki zaroorat hi nahi — sirf samay ka intezaar hai, aur reading batati hai kitna.',
    ],
  },
  {
    id: 'ekadash-bhaav',
    h2: 'Ekadash bhaav — laabh aur ichha-poorti',
    paras: [
      'Career ke prashn mein dasham ke baad sabse zyada vazan **ekadash bhaav** ka hai, aur uski wajah vyavharik hai.',
      'Dasham **kaam** dikhata hai; ekadash **usse kya milta hai** — aay, laabh, aur ichha ka poora hona. Isi liye kai baar dasham mazboot hota hai (kaam achha chal raha hai) par ekadash kamzor (uska phal nahi mil raha) — aur wahi sabse zyada nirasha deta hai.',
      'Dekha jaata hai: **ekadash ka swami kahan hai**, uska bal, aur kya wo dasham ke swami se juda hai. **Dashamesh aur ekadashesh ka sambandh** career mein laabh ka prabal yog maana jaata hai.',
      'Agar aapka asli sawaal "kaam theek hai par paisa nahi" hai, to reading isi jodi par rukti hai.',
    ],
  },
  {
    id: 'kab-nahi-badalna',
    h2: 'Kab badalna nahi chahiye — chart ke rukne wale sanket',
    paras: [
      'Ye section is page ke apne vyapaar ke khilaf jaata hai par sabse zyada bharosa banata hai.',
      'Teen sthitiyaan jahan rukna behtar hai. **Ek — dashamesh ki dasha abhi shuru hui ho.** Us daur mein maujooda kaam se phal milna shuru hota hai, aur us waqt badalna bane bane kaam ko chhodna hai.',
      '**Do — Rahu ki antardasha chal rahi ho.** Us daur mein badlaav aakarshak lagta hai par uljhan lekar aata hai. Bahut se log Rahu ke daur mein naukri badal kar chhe mahine baad pachhtate hain.',
      '**Teen — Guru ka anukool gochar chalne wala ho lekin abhi shuru na hua ho.** Kuch mahine ka intezaar prayah kahin behtar avsar deta hai. Reading ye teeno alag se batati hai.',
    ],
  },
  {
    id: 'interview-ka-din',
    h2: 'Interview aur baatcheet ke liye anukool samay',
    paras: [
      'Faisla ho jaane ke baad ye chhota par kaam ka hissa hai.',
      '**Budh** sanvaad aur baatcheet ka kaarak hai, aur interview usi ka kshetra hai. Budhwar, aur us din Budh ki hora, anukool maane jaate hain. **Guruwar** bhi shubh aarambh ke liye kaha gaya hai.',
      '**Bachne ke liye:** us din ka Rahu Kaal, aur agar sambhav ho to Mangalwar ki dopahar — jahan takrav ki sambhavna zyada maani jaati hai.',
      'Aur wo baat jo dohrani chahiye: **taiyari pehle, din baad mein.** Anukool din par bina taiyari ke jaana kisi kaam ka nahi. Roz ka Rahu Kaal aur hora [Panchang](/panchang) par free hai.',
    ],
  },
  {
    id: 'parivaar-ka-dabav',
    h2: 'Parivaar chahta hai main na badlun — kya karun',
    paras: [
      'Ye asli sthiti hai aur bahut logon ke saath hoti hai, isliye is par saaf baat honi chahiye.',
      'Chart mein **chaturth bhaav** maa aur ghar ka hai, **navam** pita aur bade logon ka. Agar in bhaavon ka aapke dasham se takrav hai, to career ke faislon mein parivaar ka virodh ek dohraya jaane wala pattern banta hai — ye aapke saath pehle bhi hua hoga.',
      'Ye jaan lena kyun kaam ka hai: **isse pata chalta hai ki virodh aapke faisle par nahi, pattern par hai** — yaani wo har baar aayega, chahe faisla kuch bhi ho. Us jaankari se baat karna aasan ho jaata hai.',
      'Par seema saaf: **ye faisla chart nahi le sakta.** Parivaar, arthik zimmedari aur aapki apni ichha — teeno ka vazan kundali se zyada hai.',
    ],
  },
  {
    id: 'videsh-career',
    h2: 'Videsh mein career — alag bhaav, alag jaanch',
    paras: [
      'Ye prashn is page par aata hai par uske bhaav alag hain.',
      'Videsh ka sambandh **baarahve bhaav** (door ka sthaan, videsh) aur **navam** (lambi yatra) se hai. Iske saath **Rahu** — jo videsh aur asaamanya raston ka kaarak maana jaata hai.',
      'Anukool yog: dasham ya ekadash ka swami barahve se juda ho, ya Rahu ka dasham se sambandh ho. Aisa chart prayah desh ke bahar ya videshi sanstha mein kaam ki taraf le jaata hai.',
      'Agar aapka asli sawaal videsh ka hai to uske liye alag aur behtar tool hai — [Foreign Settlement Calculator](/calculators/free-foreign-settlement-calculator), jo free hai.',
    ],
  },
  {
    id: 'result-kaise-padhein',
    h2: 'Report padhne ka sahi kram',
    paras: [
      'Result aate hi log seedha "badlun ya nahi" dhoondhte hain. Behtar kram ye hai.',
      '**Pehle dashamesh dekhiye** — wo kis bhaav mein hai aur kis dignity mein. **Phir Dasamsa** — us chart mein sthiti kya hai. **Phir ekadash** — laabh ka bhaav.',
      '**Uske baad dasha** — kyunki wahi batati hai ki upar wali teeno baatein **abhi** sakriy hain ya nahi. Ek kamzor dasham jiska daur abhi nahi chal raha, aaj koi bada asar nahi de raha hoga.',
      'Aur agar kahin **wajah samajh na aaye** — wahi jagah hai jahan doosri raay leni chahiye. Har point ke saath uski wajah isi liye likhi jaati hai.',
    ],
  },
  {
    id: 'kis-ke-liye',
    h2: 'Ye reading kiske liye kaam ki hai',
    paras: [
      '**Sabse zyada kaam ki:** jo mahinon se ek hi sawaal mein atke hain; jinke paas do vikalp hain aur tay nahi kar pa rahe; aur jo naya kshetra sochte hain par darr rahe hain ki der to nahi ho gayi.',
      '**Kam kaam ki:** jinka faisla ho chuka hai aur offer haath mein hai. Aur jinke paas apna sateek janm samay nahi hai, kyunki bina samay ke dasham bhaav hi nahi banta.',
      'Aur ek sthiti jahan **ye page sahi jagah nahi hai:** agar maamla utpeedan, bhedbhav ya vetan na milne ka hai. Wo HR aur kanoon ka vishay hai, aur wahan pehla kadam reading nahi hona chahiye.',
    ],
  },
  {
    id: 'kyun-yahi',
    h2: 'Yahi page kyun — aur kya farak hai',
    paras: [
      '**Ganana** — Swiss Ephemeris aur Lahiri Ayanamsha, wahi jo peshevar software chalate hain. Har graha ki degree, Shadbala aur Dasamsa dikhte hain, chhupaye nahi jaate. Aap kisi bhi doosre tool se mila kar dekh sakte hain.',
      '**Dasamsa (D-10)** — career ka apna varga chart. Adhikansh muft tool ise dete hi nahi, aur uske bina career ka vishleshan adhoora hai.',
      '**Har point ke saath wajah** — kaunsa graha, kaunsa bhaav, kaunsi dasha. Taaki aap use apni kundali se mila sakein aur asahmat bhi ho sakein.',
      'Aur **jo yahan nahi hai** — koi dar, koi "aapki kundali mein bhaari dosh hai", koi mehnga nivaran, aur koi wada ki naya kaam zaroor safal hoga. Agar daur anukool nahi hai to reading wahi likhegi.',
    ],
  },
  {
    id: 'do-minute',
    h2: 'Do minute — aur disha saaf',
    paras: [
      'Aap yahan tak padh aaye hain, iska matlab sawaal abhi bhi mann mein hai.',
      '**Upar form mein apna janm vivaran daaliye.** Do minute lagenge, aur Trikaal Ka Sandesh turant saamne aa jaayega — aapka dasham bhaav, uska swami, aur ye ki badlaav ka daur abhi hai ya nahi.',
      'Koi signup nahi, koi card nahi. **Pehla reading bilkul free hai.**',
      'Aur jo jawab aayega wo sach hoga — chahe wo "abhi sahi samay hai" ho ya "kuch mahine rukiye". **Dono par aap kaam kar sakte hain.** Jispar nahi kar sakte, wo hai mahinon tak yahi sochte rehna.',
    ],
  },
  {
    id: 'promotion-vs-pivot',
    h2: 'Promotion ka intezaar karun ya kshetra hi badal doon',
    paras: [
      'Ye do alag raste hain aur chart mein alag dikhte hain — inhe mila dena sabse aam galti hai.',
      '**Promotion ka rasta** tab anukool hai jab dasham bhaav aur ekadash dono theek hon aur unke swami achhi sthiti mein. Wahan sthiti ruki hui lagti hai par buniyad mazboot hai — sirf dasha ka intezaar hai.',
      '**Kshetra badalne ka rasta** tab dikhta hai jab **Dasamsa (D-10)** aapke maujooda kaam se mel nahi khaata, ya Amatyakaraka kisi bilkul alag kshetra ki taraf ishara karta hai. Wahan rukna saal gawana hai.',
      'Reading dono alag batati hai, aur yahi wo antar hai jispar log sabse zyada waqt gawa dete hain.',
    ],
  },
  {
    id: 'naukri-chhoot-gayi',
    h2: 'Naukri chhoot gayi — chart mein aage kya hai',
    paras: [
      'Agar aap yahan is haal mein aaye hain, to pehle ek baat.',
      'Chart mein naukri chhootna prayah **Shani ya Ketu ke daur** mein dikhta hai, ya jab dashamesh ki dasha khatm ho rahi ho. **Iska matlab aapki galti nahi hai** — daur badla, aur uske saath sthiti.',
      'Jo dekhna hai wo aage ka hai: **agla anukool daur kab shuru ho raha hai.** Prayah wo utna door nahi hota jitna us waqt lagta hai — antardasha mahinon mein badalti hai.',
      'Aur ek baat jo shastra bhi kehta hai aur anubhav bhi: **Ketu ke daur ke baad prayah bilkul nayi disha khulti hai** — wo daur purana chhudata hai taaki naya aa sake. Apna kram [Dasha Calculator](/calculators/free-dasha-calculator) par dekh lijiye.',
    ],
  },
  {
    id: 'mann-nahi-lagta',
    h2: 'Kaam mein mann nahi lagta — ye chart mein dikhta hai',
    paras: [
      'Ye shikayat sabse aam hai aur uska jyotishiya sanket asli hai.',
      'Dekhe jaate hain: **Chandra** (mann ka kaarak) ka dasham se sambandh, **Ketu** ka dasham ya dasham ke swami se sambandh — Ketu vairagya deta hai, aur jahan wo lagta hai wahan mann hatta hai; aur **Atmakaraka** ka aapke kaam se mel.',
      'Ek sthiti jo bahut dikhti hai: **Ketu dasham bhaav mein** — vyakti kaam achha karta hai, log tareef bhi karte hain, par usse koi santushti nahi milti. Ye kamzori nahi, ek sanket hai.',
      'Aur wo baat jo saaf kehni chahiye: **kabhi ye jyotish ka nahi, thakan ka mamla hota hai.** Lagatar kaam ka dabav wahi mehsoos karwaata hai. Agar neend aur sehat bhi asar mein hain, to pehla kadam koi upay nahi — aaram hai.',
    ],
  },
  {
    id: 'kitne-saal',
    h2: 'Anukool daur kitna lamba hoga',
    paras: [
      'Ye sawal faisla lene mein seedha kaam aata hai, isliye aankde jaan lijiye.',
      'Mahadasha ki avadhi tay hai: **Ketu 7 saal, Shukra 20, Surya 6, Chandra 10, Mangal 7, Rahu 18, Guru 16, Shani 19, Budh 17.** Antardasha uske andar chalti hai aur mahinon se do-teen saal tak hoti hai.',
      'Iska vyavharik matlab: **agar aapke dashamesh ki Mahadasha shuru ho rahi hai, to wo daur saalon ka hai** — jaldi karne ki zaroorat nahi, aur us poore samay mein kiya gaya kaam tikta hai.',
      'Aur uske ulta: **agar wo dasha khatm ho rahi hai, to us kshetra mein naya bada nivesh sochna chahiye** — kyunki phal dene wala daur peeche ja raha hai. Reading dono batati hai.',
    ],
  },
  {
    id: 'shani-return',
    h2: 'Shani Return — career ka sabse bada mod',
    paras: [
      'Ye ek nishchit khagolik ghatna hai aur career ke prashn mein sabse bada sanket deti hai.',
      '**Shani lagbhag 29-30 saal mein poora chakkar lagata hai** aur wahin lautta hai jahan janm ke waqt tha. Wo daur — pehla lagbhag 29 par, doosra lagbhag 58 par — career ki disha prayah badal deta hai.',
      'Us daur mein kya hota hai: jo kaam sirf paise ya doosron ke kehne se chal raha tha wo bhaari padne lagta hai, aur jo asli hai wo saamne aata hai. Bahut log kehte hain ki unka "asli career" wahin se shuru hua.',
      'Isliye agar aap 28-31 ya 57-60 ke beech hain aur badlaav soch rahe hain — **wo sanjog nahi hai**, aur us daur mein liya gaya faisla prayah tikta hai. Reading batati hai ki aap us daur mein hain ya nahi.',
    ],
  },
];

const V6_HUB_READ: V6Link[] = [
  { href: '/learn/career-prediction-astrology', label: 'Career Prediction Astrology', note: 'Poora sidhant' },
  { href: '/learn/best-career-birth-chart', label: 'Best career from your chart', note: 'Kaunsa kshetra' },
  { href: '/learn/career-growth-prediction', label: 'Career growth prediction', note: 'Unnati ka vishleshan' },
  { href: '/learn/career-astrology-for-startup-founders', label: 'Startup founders', note: 'Apna kaam shuru karna' },
  { href: '/learn/government-job-chances', label: 'Government Job & UPSC', note: 'Sarkari naukri' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: 'Rukavat se unnati' },
  { href: '/blog/career-prediction-kundli-complete-guide', label: 'Career prediction — full guide', note: '3,400 shabd' },
  { href: '/blog/career-prediction-kundli-complete-guide-hindi', label: 'करियर भविष्यवाणी — हिंदी', note: 'हिंदी में पूरा' },
  { href: '/blog/dream-career-profession-astrology', label: 'Dream career aur profession', note: 'Jhukav ka vishleshan' },
];

const V6_HUB_CALC: V6Link[] = [
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Badlaav ka window' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Shani ka gochar' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Dasham bhaav ka bal' },
  { href: '/calculators/free-ias-astrology-calculator', label: 'IAS Astrology Calculator', note: 'Sarkari sewa ka yog' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Dasham lagna se banta hai' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Dashamesh ka bal' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Ratna se pehle jaanch' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Kaunsa graha peeche' },
];

function V6Rich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\\[[^\\]]+\\]\\([^)]+\\)|\\*\\*[^*]+\\*\\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\\[([^\\]]+)\\]\\(([^)]+)\\)$/);
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
        <p className="text-xs leading-relaxed mb-4 text-slate-400">Ye page ek hi sawaal ka hai — badlaav ka daur abhi hai ya nahi. Kshetra, unnati aur sarkari naukri ke poore vishay alag pages par hain, sab free.</p>
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

export default function CareerPivotPage() {
  return (
    <>
      <Script id="schema-career-pivot" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#7C3AED]/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-amber-900/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Dharmic Career Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">Are You in the <span className="text-[#D4AF37]">Wrong Career?</span><br />Your Stars Know Your Dharma.</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">Trikaal reads your 10th House, Jupiter, Atmakaraka & Dasha timing to reveal your dharmic profession — and the <span className="text-[#D4AF37] font-semibold">exact window</span> to pivot without financial risk.</p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/founder" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris (self-hosted)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Get My Career Reading — ₹51</Link>
            </div>
          </div>
        </section>
        {/* ── v5.0: the real reading form, preselected to genz_dream_career.
            Replaces the dead /?segment= hop. Same BirthForm the homepage
            uses, same free-then-paid flow, own id="birth-form" anchor. */}
        <section className="px-4 pb-10 -mt-2">
          <ServiceReadingForm
            domain="career-pivot"
            heading="Apna career ka daur abhi dekhiye"
            subheading="Dasham bhaav, uska swami, Dasamsa (D-10) aur chal rahi dasha — aapki apni kundali se."
          />
        </section>

        <AuthorStrip />
        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Why Vedic Astrology Can Find <span className="text-[#D4AF37]">Your True Career</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "♃", title: "Jupiter & the 10th House Reveal Your Dharmic Profession", desc: "The 10th house (Karma Bhava) shows your highest calling. Jupiter's sign, nakshatra, and aspect determine what work feels divinely aligned. Many people spend decades in the wrong career because they never read this placement." },
                { icon: "☀", title: "Atmakaraka Shows Your Soul's True Work", desc: "The Atmakaraka (planet with highest degree) is your soul's purpose indicator. When you're in a career misaligned with your Atmakaraka, you feel empty no matter how much you earn." },
                { icon: "⏱", title: "Dasha Timing Prevents Costly Mistakes", desc: "Changing careers at the wrong Dasha can destroy momentum. But changing during Jupiter or Venus Dasha with 10th house activation? History shows these are the windows when careers transform permanently." },
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
                  { step: "01", title: "Enter Your Birth Details", desc: "Date, time, place. We use self-hosted Swiss Ephemeris with Lahiri Ayanamsha for maximum accuracy." },
                  { step: "02", title: "Trikaal Maps Your Career Karma", desc: "10th lord placement, Jupiter sign, Atmakaraka, D10 Dasamsa career chart — all analyzed for dharmic alignment." },
                  { step: "03", title: "Get Industries & Pivot Window", desc: "₹51 deep reading: Which industries your chart favors, which to avoid, and the astrologically supported months to pivot." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{s.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <DeliverableCard segment="career-pivot" items={["Your dharmic profession (10th house)", "Atmakaraka soul-purpose decoding", "D10 Dasamsa career chart reading", "Industries your chart supports", "Pivot window — exact months", "Financial risk period to avoid", "4-week career momentum forecast"]} />
            </div>
          </div>
        </section>
        <MaaDivineSeva />
        <section className="px-4 pb-4"><V6Content /></section>

        <FaqSection items={[
          { q: "Can Vedic astrology tell me the right career for my soul?", a: "Yes. The 10th house reveals your highest calling. The Atmakaraka shows your soul's primary purpose. Jupiter's sign and nakshatra determine what domain feels divinely aligned. Together these reveal your dharmic profession." },
          { q: "What is the best time to change careers?", a: "The best career change windows occur during Jupiter or Venus Mahadasha with 10th house activation. Changing during Ketu Mahadasha creates confusion. Rohiit Gupta reads your exact Dasha to give you a specific month window." },
          { q: "What is the Dasamsa D10 chart?", a: "The Dasamsa (D10) is the 10th divisional chart used exclusively for career analysis. It shows your capacity for authority, the right professional domain, and whether self-employment or service suits you." },
          { q: "What is Atmakaraka and how does it relate to career?", a: "The Atmakaraka is the planet with the highest degree in your birth chart. It represents your soul's deepest longing. When your career aligns with your Atmakaraka's energy, work feels meaningful." },
        ]} />
        <CtaSection headline="Stop Guessing. Start Living" highlight="Your Dharma." body="Your birth chart already knows your highest calling. ₹51 to find out what it is — and when to make the move." segment="career-pivot" />
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
          <p className="text-gray-400 text-sm leading-relaxed">Rohiit Gupta has studied Vedic astrology for over 15 years under the Parashara BPHS tradition. As founder of Trikaal Vaani, he built India&apos;s first AI-powered Vedic platform combining Swiss Ephemeris precision with premium AI reasoning. All readings are designed by Rohiit — Trikaal applies his framework to your unique birth chart.</p>
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
