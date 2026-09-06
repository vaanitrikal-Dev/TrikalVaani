/**
 * TRIKAAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/services/child-destiny/page.tsx
 * Version: 5.0 (06 Sep 2026) — CALCULATOR CONVERSION + keyword content
 *
 * WHAT CHANGED
 *   1. All three CTAs pointed at /?segment=child-destiny. Nothing in this repo
 *      reads the `segment` query parameter — category selection is React state
 *      set by CLICKING a homepage card, so the visitor landed on the plain
 *      homepage and had to scroll, pick an age tab and find the card again.
 *   2. The page led with the price while BirthForm has a free tier and the
 *      homepage cards say "Free chart reading for this topic".
 *   3. Title 72 chars + app/layout.tsx's "%s | Trikaal Vaani" template = 88
 *      rendered, cut by Google at ~58.
 *   The real BirthForm now sits on the page, preselected to mill_childs_destiny.
 *
 * DOMAIN: mill_childs_destiny — SINGLE chart, not in DUAL_CHART_DOMAINS.
 *   The CHILD's birth details go in the form, not the parent's. If this id is
 *   ever changed, /api/predict falls back to 'mill_karz_mukti' (BirthForm
 *   L998) and the parent silently receives a DEBT reading about their child.
 *
 * GSC, 3 months to 4 Sep 2026: 77 impressions, ZERO clicks, average position
 *   7.1. Page one of Google and not one click — so the ranking was never the
 *   problem. The title promised a "Child Destiny Reading", which reads like a
 *   product name rather than the question a parent actually types.
 *
 * CANNIBALISATION — the site already covers the informational side:
 *   /blog/childs-destiny-future-astrology (+hindi),
 *   /blog/fifth-lord-child-aptitude-astrology (+hindi),
 *   /blog/jupiter-putrakaraka-child-destiny-astrology (+hindi),
 *   /blog/dasha-timing-child-development-astrology (+hindi),
 *   /blog/saraswati-yoga-child-education-astrology (+hindi),
 *   /learn/child-birth-prediction, /learn/education-prediction-astrology.
 *   THIS PAGE OWNS what a parent does with the answer. Every theory branch is
 *   handed off by link, never re-explained.
 *
 * NOT THE SAME AS SANTAN YOG — keep these apart
 *   /calculators/free-santan-yog-calculator answers "will I have children",
 *   read from the PARENT's fifth house. This page answers "my child is here,
 *   what is their path", read from the CHILD's own chart. Two different
 *   questions, two different charts. Do not let content drift between them.
 *
 * THE LINE THIS PAGE MUST NOT CROSS
 *   A parent reading their child's chart can quietly turn it into a cage —
 *   deciding at age six what the child may become, or repeating a weakness to
 *   them until they believe it. Sections 'seema-nahi', 'bachche-ko-batayein'
 *   and 'sehat' exist for that, and they are not decoration. The chart shows a
 *   leaning, never a limit, and this page says so more than once on purpose.
 *
 * Version: 4.1 — IR-0 cleanup
 *
 * v4.1 CHANGES vs v4.0:
 *   ❌ REMOVED fake testimonials (fabricated reviews + ★★★★★ + "Verified Experiences")
 *   ❌ REMOVED phantom ₹499 / Rs 499 (hero call button, step 04, card strike-through, CTA button)
 *   ✅ /about → /founder (correct author URL — 3 spots)
 *   ✅ KEPT Maa Divine Seva (real Arzi/Dhanyewaad dakshina feature)
 *   ✅ Brand/Jini/Prokerala/vendor already clean — left intact
 */
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";
import ServiceReadingForm from '@/components/services/ServiceReadingForm';

export const metadata: Metadata = {
  title: { absolute: "Bachche Ki Kundali — Free Vishleshan | Trikaal Vaani" },
  description: "Chief Vedic Architect Rohiit Gupta reads your child's 5th House, Moon sign and Mercury to reveal hidden talents, ideal education stream, and cosmic calling. ₹51 reading.",
  keywords: ["child kundali reading astrology", "what will my child become astrology", "child destiny vedic astrology", "education stream astrology India", "5th house children astrology"],
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  openGraph: { title: "Child Destiny Reading | Trikaal Vaani", description: "Rohiit Gupta reads your child's 5th house, Moon sign, and hidden talents.", url: "https://trikalvaani.com/services/child-destiny", siteName: "Trikaal Vaani", type: "website", locale: "en_IN" },
  alternates: { canonical: "https://trikalvaani.com/services/child-destiny" },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Service", name: "Child Destiny — Talent and Education Reading", provider: { "@type": "Person", name: "Rohiit Gupta", jobTitle: "Chief Vedic Architect", url: "https://trikalvaani.com/founder" }, offers: [{ "@type": "Offer", price: "51", priceCurrency: "INR" }], areaServed: "IN" },
    { "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Can Vedic astrology reveal my child's natural talents?", acceptedAnswer: { "@type": "Answer", text: "Yes. The 5th house governs intelligence, creativity, and natural genius. Its lord's strength and planetary associations reveal what domain the child is cosmically gifted in — before any schooling shapes them." } },
      { "@type": "Question", name: "Which house in astrology shows a child's education?", acceptedAnswer: { "@type": "Answer", text: "The 4th house governs primary education. The 5th governs intelligence. The 9th governs higher education. Mercury and Jupiter placement determine the ideal academic stream — science, arts, commerce, or vocational." } },
      { "@type": "Question", name: "At what age should I get my child's kundali read?", acceptedAnswer: { "@type": "Answer", text: "The earlier the better. Readings are most actionable around ages 5 to 12 when education decisions begin, and at 15 to 16 for stream selection. The birth chart does not change, so a reading is relevant at any age." } },
    ]},
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://trikalvaani.com" }, { "@type": "ListItem", position: 2, name: "Services", item: "https://trikalvaani.com/services" }, { "@type": "ListItem", position: 3, name: "Child Destiny", item: "https://trikalvaani.com/services/child-destiny" }] },
  ],
};


// ════════════════════════════════════════════════════════════════════════════
// v5.0 CONTENT — what a PARENT does with the answer. Theory lives in the blog
// pages listed in the file header; do not re-explain it here.
// ════════════════════════════════════════════════════════════════════════════

type V6Section = { id: string; h2: string; paras: string[] };
type V6Link    = { href: string; label: string; note: string };

const V6_SECTIONS: V6Section[] = [
  {
    id: 'kaise-kaam',
    h2: 'Bachche Ki Kundali — kaam kaise karta hai',
    paras: [
      'Upar wale form mein **bachche ka** janm vivaran daaliye — aapka nahi. Tareekh, sateek samay aur sthan. Reading unke apne chart se banti hai.',
      'Dekha kya jaata hai: **panchma bhaav aur uska swami** (buddhi, shiksha, poorv-punya), **Guru** — jo shastra mein santan ka kaarak hai, **Budh** (seekhne aur samajhne ka kaarak), **chandra** (mann aur swabhav), aur **bachche ki chal rahi dasha** — jo batati hai ki abhi kaunsa daur chal raha hai.',
      '**Pehla reading free hai.** Poora vishleshan chahiye to uske baad ₹51 ka vikalp aata hai.',
    ],
  },
  {
    id: 'seema-nahi',
    h2: 'Pehle ek baat — kundali bachche ki seema nahi hai',
    paras: [
      'Ye is page ka sabse zaroori section hai, aur ise sabse pehle rakha gaya hai jaan-boojh kar.',
      '**Chart jhukav dikhata hai, seema nahi.** Wo batata hai ki kaunsi cheez bachche ko sahaj aayegi aur kahan mehnat zyada lagegi. Wo ye **nahi** batata ki wo kya nahi kar sakta.',
      'Ye antar kyun mayne rakhta hai: bachcha jo bar-bar sunta hai, wahi maan leta hai. Agar ghar mein ye keh diya jaaye ki "iski kundali mein padhai nahi hai", to wo baat bachche ke andar ek deewar ban jaati hai — aur phir chart nahi, **wo deewar** uska bhavishya tay karti hai.',
      'Isliye ye reading maa-baap ke liye hai, bachche par lagane ke liye nahi. **Iska sahi upyog ek hi hai — samajhna, faisla thopna nahi.**',
    ],
  },
  {
    id: 'kis-umar-mein',
    h2: 'Kis umar mein kundali dekhni chahiye',
    paras: [
      'Do alag cheezein hain aur unhe mila dena aam galti hai.',
      '**Banana** — janm ke turant baad. Us waqt sateek samay milta hai, aur wahi poore jeevan ka aadhaar hai. Das minute ka kaam hai jo agle chalis saal sateek bana deta hai.',
      '**Padhna aur uspar faisla lena** — uski koi jaldi nahi hai. Chhote bachche par kundali ke aadhaar par apekshaayein rakhna nuksan karta hai, kyunki us umar mein mahaul aur khel se zyada kuch tay nahi hota.',
      'Vyavharik roop se: **shiksha ke prashn 10-12 saal ke baad kaam ke lagte hain**, aur **kshetra ka prashn 15-16 ke baad.** Usse pehle chart sirf swabhav samajhne ke liye kaam ka hai — aur wo bhi is niyam ke saath ki wo aapko samajh de, bachche ko label nahi.',
    ],
  },
  {
    id: 'panchma-bhaav',
    h2: 'Panchma bhaav — buddhi, shiksha aur poorv-punya',
    paras: [
      'Bachche ka har prashn **panchma bhaav** se guzarta hai. Shastra mein wo santan, buddhi, vidya aur poorv janm ke punya ka bhaav hai.',
      'Teen cheezein dekhi jaati hain: **panchma mein kaun baitha hai**, **uska swami kahan hai** (kendra ya trikona mein ho to sthiti anukool; chhathe, aathve ya barahve mein ho to prayaas zyada), aur **uska bal** Shadbala se.',
      'Ek sudhar jo zaroori hai: **khaali panchma bhaav kamzor nahi hota.** Bhaav ka phal uske **swami** se chalta hai. Bahut se tez bachchon ka panchma khaali hota hai par uska swami bahut mazboot.',
      'Poora sidhant [Fifth lord aur bachche ki aptitude](/blog/fifth-lord-child-aptitude-astrology) mein hai — yahan dobara nahi likha.',
    ],
  },
  {
    id: 'guru-putrakaraka',
    h2: 'Guru — santan ka kaarak',
    paras: [
      'Panchma bhaav ke baad sabse zyada vazan **Guru** ka hai, kyunki shastra mein wahi **Putrakaraka** hai — santan ka kaarak.',
      'Bachche ke chart mein Guru teen cheezein dikhata hai: **gyaan aur seekhne ki gehrai**, **naitikta aur samajh**, aur **bade logon se milne wala sahara** — guru, shikshak, ya koi bada jo raah dikhaye.',
      'Balwan Guru wale bachche prayah sawal poochhte hain, "kyun" jaanna chahte hain, aur unhe achhe shikshak apne aap mil jaate hain. Kamzor ya peedit Guru ke saath wahi bachcha tez ho sakta hai par uski disha der se banti hai.',
      'Guru ka poora vishay [Jupiter Putrakaraka aur child destiny](/blog/jupiter-putrakaraka-child-destiny-astrology) mein khola gaya hai.',
    ],
  },
  {
    id: 'budh-seekhna',
    h2: 'Budh — bachcha seekhta kaise hai',
    paras: [
      'Ye wo hissa hai jo maa-baap ke liye rozmarra mein sabse zyada kaam ka hai.',
      '**Budh grahan-shakti aur sanvaad ka kaarak hai** — yaani bachche ke seekhne ka tarika. Balwan Budh wale bachche jaldi pakadte hain, baat karke seekhte hain, aur unhe sawal poochhna pasand hota hai. Kamzor ya ast Budh ke saath seekhna dheema hota hai par prayah gehra.',
      'Kya dekha jaata hai: **Budh kis bhaav mein hai**, uski **dignity**, aur kya wo Guru ya Chandra se juda hai. **Budh-Guru ka sambandh** vidya ke liye bahut anukool maana jaata hai; **Budh-Chandra** ka sambandh kalpana aur bhasha ki taraf jhukav deta hai.',
      'Vyavharik matlab: agar bachche ka Budh dheema hai to **padhne ka tarika badalna** chahiye, dabav badhana nahi. Wahi ek jaankari kai gharon mein tanav kam kar deti hai.',
    ],
  },
  {
    id: 'chandra-swabhav',
    h2: 'Chandra — bachche ka mann aur swabhav',
    paras: [
      'Chhote bachche mein **Chandra sabse zyada dikhta hai** — kyunki us umar mein buddhi se zyada mann chalta hai.',
      'Chandra ki rashi aur nakshatra se pata chalta hai: bachcha **sanvedansheel** hai ya **sakht**, akele khush rehta hai ya bheed mein, badlaav se ghabraata hai ya usme khil jaata hai.',
      'Ek sthiti jo bahut dikhti hai: **peedit ya kshin Chandra** — aisa bachcha bahar se theek dikhta hai par chhoti baaton par bahut andar tak asar leta hai. Maa-baap ise "zid" ya "nakhra" samajh lete hain. **Wo nakhra nahi, prakriti hai** — aur ye jaan lena hi aadha samadhan hai.',
      'Chandra ka bal janm ke paksh par bhi tikta hai — purnima ke aas-paas janme bachchon ka Chandra swabhavik roop se balwan hota hai.',
    ],
  },
  {
    id: 'saraswati-yoga',
    h2: 'Saraswati Yoga — vidya ka sabse shubh yog',
    paras: [
      'Maa-baap jo yog sabse zyada dhoondhte hain, wo yahi hai — aur wo asli hai.',
      '**Saraswati Yoga** tab banta hai jab **Budh, Guru aur Shukra** teeno kendra, trikona ya dwitiya bhaav mein achhi sthiti mein hon. Shastra kehta hai aisa vyakti vidya, kala aur vaani mein nipun hota hai.',
      'Iske saath kuch aur vidya-yog bhi dekhe jaate hain: **Budhaditya** (Surya aur Budh ka sath — tez buddhi), aur **Gaj Kesari** (Guru Chandra se kendra mein — samajh aur sammaan).',
      'Par ek zaroori chetavni: **yog ka hona hi kaafi nahi hai.** Ye yog aam hain, aur asli sawaal ye hai ki unhe banane wale graha kitne balwan hain. Poora vishay [Saraswati Yoga](/blog/saraswati-yoga-child-education-astrology) mein hai.',
    ],
  },
  {
    id: 'bachche-ki-dasha',
    h2: 'Bachche ki dasha — abhi kaunsa daur chal raha hai',
    paras: [
      'Ye reading ka sabse vyavharik hissa hai aur maa-baap ke liye turant kaam ka.',
      'Har bachcha kisi na kisi graha ke daur mein hota hai, aur wo daur uske vyavhaar par seedha asar daalta hai. **Ketu ki dasha** mein bachcha andar ki taraf mud jaata hai aur akela rehna pasand karta hai. **Rahu ki dasha** mein bechaini aur nayi cheezon ki taraf khinchav badhta hai. **Shani ki dasha** mein sab kuch dheema aur bhaari lagta hai. **Guru ki dasha** mein padhai aur samajh dono khulti hai.',
      'Ye jaan lena kyun badalta hai sab kuch: **jo maa-baap ko "achanak badal gaya" lagta hai, wo prayah dasha ka badalna hota hai** — aur wo apne samay par khatm hota hai.',
      'Bachche ki dasha [Dasha Calculator](/calculators/free-dasha-calculator) par free dikh jaati hai, aur uska vistaar [Dasha timing aur child development](/blog/dasha-timing-child-development-astrology) mein.',
    ],
  },
  {
    id: 'padhai-ka-kshetra',
    h2: 'Kaunsa vishay bachche ke liye theek hai',
    paras: [
      'Ye sabse zyada poochha jaane wala sawaal hai, aur uska uttar aadha mil sakta hai — poora nahi. Ye saaf kah dena imandari hai.',
      'Jo milta hai: **panchma bhaav ke swami se jhukav.** Budh ho to ganit, vishleshan, bhasha, vyapaar; Guru ho to shiksha, kanoon, darshan; Shukra ho to kala, sangeet, design; Mangal ho to takniki, khel, rakshaa; Shani ho to anushasit aur lambe kaam; Chandra ho to kalpana aur sewa.',
      'Iske saath **Budh ki sthiti** (kaise seekhta hai) aur **Amatyakaraka** (Jaimini paddhati mein pesha darshane wala graha) bhi dekhe jaate hain.',
      'Jo **nahi** milta: kaunsa stream lena chahiye, kaunsa college, ya kaunsi naukri. **Ye faisle bachche ki apni ruchi, uske number aur uske mahaul se bante hain** — teeno chart mein nahi hain. Chart rang batata hai, naam nahi.',
    ],
  },
  {
    id: 'padhai-mein-mann',
    h2: 'Padhai mein mann nahi lagta — chart kya kehta hai',
    paras: [
      'Ye sabse aam shikayat hai aur uska jyotishiya sanket asli hai — par uske saath ek sach bhi hai jo saath mein kehna zaroori hai.',
      'Chart mein dekhe jaate hain: **panchma bhaav par kroor grahon ki drishti**, **Budh ka ast ya peedit hona**, **Rahu ka panchma se sambandh** (dhyan bhatakna), aur **chal rahi dasha** — kai baar bachcha bilkul theek hai, bas Rahu ya Shani ka daur chal raha hota hai jo apne samay par nikal jaayega.',
      'Aur wo sach jo saath mein kehna zaroori hai: **kai baar ye jyotish ka mamla hai hi nahi.** Neend poori na hona, phone ka zyada samay, ghar ka mahaul, ya padhne ka tarika bachche se mel na khaana — ye char wajah kisi bhi graha se zyada aam hain.',
      'Isliye sahi kram ye hai: **pehle ye char dekhiye, phir chart.** Aur agar chart mein bhi sanket hai, to upay mantra aur niyam ka hai — dabav ka nahi.',
    ],
  },
  {
    id: 'pratiyogi-pariksha',
    h2: 'Pratiyogi pariksha ka yog hai ya nahi',
    paras: [
      'Bade bachchon ke liye ye asli sawaal ban jaata hai, aur uske apne bhaav hain.',
      'Dekhe jaate hain: **panchma** (buddhi aur abhyaas), **navam** (bhagya aur uchch shiksha), **dasham** (pad), aur **chhathaa bhaav** — kyunki pratiyogita chhathe bhaav ka vishay hai aur balwan chhathaa bhaav pariksha mein jitaata hai.',
      'Iske saath **Surya** (sarkari sewa aur adhikaar ka kaarak) aur **chal rahi dasha** — kyunki pariksha ek nishchit samay ka kaam hai aur wahi sabse zyada mayne rakhta hai.',
      'Sarkari sewa ka poora aur behtar vishleshan alag pages par hai — [Government Job & UPSC](/learn/government-job-chances) aur [IAS Astrology Calculator](/calculators/free-ias-astrology-calculator), jo free hai.',
    ],
  },
  {
    id: 'videsh-padhai',
    h2: 'Videsh mein padhai ka yog',
    paras: [
      'Ye prashn aajkal bahut aata hai aur uske bhaav alag hain.',
      'Videsh ka sambandh **baarahve bhaav** (door ka sthaan) aur **navam** (lambi yatra aur uchch shiksha) se hai. Iske saath **Rahu** — jo videsh aur asaamanya raston ka kaarak maana jaata hai.',
      'Anukool yog: **panchma ya navam ka swami barahve se juda ho**, ya Rahu ka navam se sambandh ho. Aisa chart prayah desh ke bahar padhai ya kaam ki taraf le jaata hai.',
      'Aur samay dasha se aata hai — prayah **Rahu ya navam ke swami ki dasha** mein wo raasta khulta hai. Vistaar se [Foreign career aur education](/blog/foreign-career-education-astrology) mein, aur jaanch [Foreign Settlement Calculator](/calculators/free-foreign-settlement-calculator) par, free.',
    ],
  },
  {
    id: 'khel-kala',
    h2: 'Khel, sangeet ya kala — chart mein dikhta hai?',
    paras: [
      'Haan, aur ye wo hissa hai jise maa-baap prayah der se dekhte hain.',
      '**Khel** — balwan **Mangal** (urja, saahas, pratispardha) aur **Surya**, aur chhathaa bhaav ka bal. Aise bachche baith kar padhne se zyada karke seekhte hain, aur unhe rokna ulta padta hai.',
      '**Sangeet aur kala** — balwan **Shukra**, aur uska panchma ya dwitiya bhaav se sambandh. **Chandra** ka Shukra se sath kalpana aur bhaav ki gehrai deta hai.',
      'Aur wo baat jo is page par kehna zaroori hai: **agar chart khel ya kala ki taraf saaf ishara kar raha hai, to use "distraction" maan lena bachche ke saath anyay hai.** Bahut se ghar mein ye galti hoti hai, aur chart yahan maa-baap ki aankh khol sakta hai.',
    ],
  },
  {
    id: 'gandmool',
    h2: 'Gandmool nakshatra — dar ki zaroorat nahi',
    paras: [
      'Bahut se maa-baap is page par isi dar ke saath aate hain, isliye is par shanti se baat honi chahiye.',
      '**Gandmool** wo janm hai jo Ashwini, Ashlesha, Magha, Jyeshtha, Mula ya Revati nakshatra mein hua ho. Paramapara mein 27 din baad **Mool Shanti** ki vidhi kahi gayi hai.',
      'Jo saaf kehna chahiye: **ye ashubh janm nahi hai.** Ye chhe nakshatra sattais mein se hain — yaani lagbhag **har chautha-paanchvaan bachcha** Gandmool mein paida hota hai. Aur inme se kai nakshatra bahut shubh maane jaate hain — Revati aur Pushya to sabse anukool nakshatron mein ginte hain.',
      'Mool Shanti ek paramparik vidhi hai, koi zaroori ilaaj nahi. Jo koi Gandmool ka naam le kar hazaron ki pooja maange, wo dar bech raha hai. Apne bachche ka nakshatra [Nakshatra Calculator](/calculators/free-nakshatra-calculator) par free dekh sakte hain.',
    ],
  },
  {
    id: 'sehat',
    h2: 'Bachche ki sehat — yahan seema sabse sakht hai',
    paras: [
      'Ye section chhota hai par is poore page ka sabse zaroori niyam yahin hai.',
      'Paramapara mein har graha ko shareer ke kisi ang se joda gaya hai, aur chhathaa bhaav rog ka bhaav hai. Ye jaankari classical hai.',
      '**Par ise kabhi nidaan ki tarah nahi lena chahiye.** Kisi lakshan ko "graha ka phal" maan kar doctor ke paas jaane mein der karna — ye is kshetra ki sabse khatarnak galti hai, aur bachchon ke maamle mein sabse mehngi.',
      'Seedhi baat: **sehat ka pehla aur aakhri rasta doctor hai.** Ye reading kisi rog ka naam nahi leti aur na hi leni chahiye. Jo koi bachche ki bimari ka ilaaj upay se batae, us se turant door hona chahiye.',
    ],
  },
  {
    id: 'bachche-ko-batayein',
    h2: 'Kya bachche ko uski kundali batani chahiye',
    paras: [
      'Ye sawaal kam poochha jaata hai aur sabse zyada mayne rakhta hai.',
      '**Chhote bachche ko nahi.** Us umar mein wo apne baare mein jo sunta hai wahi ban jaata hai. "Tumhari kundali mein padhai nahi hai" jaisi ek line saalon tak asar karti hai — aur wo asar chart se zyada bada hota hai.',
      '**Bade bachche ko, wo bhi chun kar.** 16-17 ke baad, aur sirf **anukool hisse** — uska jhukav, uski taakat, aur wo daur jo aage anukool hai. Kamzoriyon ki soochi dena kisi kaam ka nahi.',
      'Aur ek niyam jo har jaankaar dega: **kabhi bhi bachche ke saamne uski kundali par chinta mat jataiye.** Aapki chinta wo apni kami samajh leta hai. Reading aapke liye hai — usse aap behtar faisle lein, bachcha uska bojh na uthaye.',
    ],
  },
  {
    id: 'do-bachche',
    h2: 'Do bachche — dono ki tulna mat kijiye',
    paras: [
      'Ek hi ghar ke do bachche bilkul alag hote hain, aur chart isi ko sabse saaf dikhata hai.',
      'Wajah ganitiya hai: **dono ka lagna alag, Chandra rashi alag, aur dasha bilkul alag chal rahi hoti hai.** Ek bhai Guru ke daur mein ho sakta hai aur doosra Shani ke — us waqt dono ka vyavhaar alag hona swabhavik hai, koi kami nahi.',
      'Isliye "bade wale jaisa kyun nahi hai" wala sawaal chart ki nazar mein arthheen hai. Dono ke liye alag tarika chahiye, aur reading yahi batati hai ki kis bachche ko kya chahiye.',
      'Vyavharik salah: **dono ki reading alag-alag nikaal lijiye** aur dono ki dasha dekh lijiye. Form do baar chalane ka kaam hai, aur free hai.',
    ],
  },
  {
    id: 'janm-samay-nahi',
    h2: 'Bachche ka sateek samay nahi pata — tab kya',
    paras: [
      'Naye bachchon mein ye kam hota hai par bade bachchon mein aam hai.',
      '**Samay ke bina jo milega:** Chandra rashi (prayah), Surya rashi (pakka), nakshatra (prayah, par pada nahi), aur grahon ki rashi. Yaani swabhav aur mota jhukav mil jaayega.',
      '**Jo nahi milega:** lagna aur baarah ke baarah bhaav, panchma bhaav, aur dasha ka sateek aarambh. Yaani shiksha aur kshetra ke prashn adhoore rahenge.',
      'Kahan se mile: **janm pramanpatra, hospital ka discharge card, ya nagar nigam ka record.** Adhikansh gharon mein ye kagaz hota hai, bas dhyan nahi aata. Das minute ka kaam hai jo bachche ke poore jeevan ke har vishleshan ko sateek bana dega.',
    ],
  },
  {
    id: 'upay',
    h2: 'Bachchon ke liye upay — kya theek hai aur kya nahi',
    paras: [
      'Ye section is page par zaroori hai kyunki bachchon ke naam par sabse zyada mehnga saaman becha jaata hai.',
      '**Jo theek hai:** us graha ka **mantra** ghar mein, us graha ke **din ka daan**, aur bachche ke saath ki gayi saral pooja. Vidya ke liye **Saraswati Vandana** aur **Guru ke upay** — Guruwar ko peela daan, chane ki daal, kela. Teeno mein paisa nahi lagta aur teeno surakshit hain.',
      '**Jo nahi karna chahiye:** chhote bachchon ko **ratna** pehnana. Paramapara mein iski koi vidhi nahi hai, aur ratna ka asar tez hota hai — bachcha bata bhi nahi paata ki use kaisa lag raha hai. Aur koi bhi bhaari, mehnga ya darr par bikne wala anushthan.',
      'Aur wo baat jo shanti se kehni chahiye: **bachche par upay ka bojh daalna sabse bada nuksan hai.** Agar ghar mein roz ye yaad dilaya jaaye ki "tumhare graha kharab hain", to wo baat kisi bhi graha se zyada asar karti hai.',
    ],
  },
  {
    id: 'kya-nahi-batata',
    h2: 'Ye reading kya nahi bata sakti',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par yahan sabse zyada zaroori hai — kyunki maamla bachche ka hai.',
      'Ye **nahi** bata sakti: bachche ka IQ, wo kaunsa exam pass karega, kaunse college mein jaayega, kitna kamayega, ya uski aayu. Koi bhi chart in mein se kuch nahi batata, aur jo koi batae wo galat bhi hai aur nuksandeh bhi.',
      'Aur ye **nahi hai:** kisi seekhne ki dikkat ka nidaan, kisi bimari ka nidaan, ya kisi vishesheshgya ki salah ka vikalp. Agar bachche ko padhne, bolne ya dhyan lagane mein lagatar dikkat hai, to wahan pehla kadam jaanch hai — reading nahi.',
      'Jo ye deti hai: **bachche ka swabhavik jhukav, uska seekhne ka tarika, aur abhi kaunsa daur chal raha hai.** Teen jaankariyaan — aur teeno maa-baap ka rukh narm kar deti hain, jo aksar sabse bada faayda hota hai.',
    ],
  },
  {
    id: 'sabse-bada-faayda',
    h2: 'Is reading ka sabse bada faayda kya hai',
    paras: [
      'Ye batana zaroori hai kyunki jo faayda log soch kar aate hain, wo aksar asli faayda nahi hota.',
      'Log aate hain ye jaanne ki **"mera bachcha kya banega".** Uska uttar chart mein poora nahi hai, aur wo upar likha bhi hai.',
      'Jo sach mein milta hai: **"mera bachcha aisa kyun hai".** Kyun wo dheere seekhta hai, kyun wo akela rehna chahta hai, kyun wo achanak badal gaya, kyun wo doosre bachche jaisa nahi hai.',
      'Aur wahi jaankari ghar badal deti hai — kyunki **jab wajah samajh aati hai, to gussa apne aap kam ho jaata hai.** Bahut se maa-baap kehte hain ki sabse bada faayda ye hua ki unhone bachche par chillana band kar diya. Chart ne bachche ko nahi badla — usne unhe badla.',
    ],
  },
  {
    id: 'free-vs-paid',
    h2: 'Free mein kya milta hai aur ₹51 mein kya',
    paras: [
      '**Free — Trikaal Ka Sandesh.** Bachche ka lagna, Chandra rashi aur nakshatra, panchma bhaav ki sthiti, aur chal rahi dasha ka seedha sanket. 150-200 shabd, turant, bina signup aur bina card.',
      '**₹51 — poora vishleshan.** Panchma bhaav aur uske swami ka vistrit vishleshan, Guru aur Budh ka bal, vidya-yog (Saraswati, Budhaditya, Gaj Kesari), swabhav ka poora chitra, **bachche ki dasha ka kram aur aane wale daur**, aur paanch saral upay — jinme paisa nahi lagta.',
      'Jo yahan nahi hai: koi dar, koi "aapke bachche ki kundali mein bhaari dosh hai", koi mehnga anushthan, aur koi bhavishyavani ki wo kya banega.',
    ],
  },
  {
    id: 'result-kaise-padhein',
    h2: 'Report padhne ka sahi kram',
    paras: [
      'Result aate hi maa-baap seedha "kya banega" dhoondhte hain. Behtar kram ye hai.',
      '**Pehle Chandra dekhiye** — bachche ka mann aur swabhav. Ye rozmarra mein sabse zyada kaam aata hai. **Phir Budh** — wo seekhta kaise hai. **Phir panchma bhaav aur uska swami** — jhukav kis taraf hai.',
      '**Uske baad dasha** — kyunki wahi batati hai ki abhi kya chal raha hai. Bahut baar "achanak badal gaya" ka poora uttar yahin milta hai.',
      'Aur **sabse aakhir mein** wo hissa padhiye jo kshetra ya bhavishya se juda hai — kyunki wo sabse kam nishchit hai aur uspar sabse kam faisla lena chahiye.',
    ],
  },
  {
    id: 'kitni-baar',
    h2: 'Ye reading kitni baar leni chahiye',
    paras: [
      '**Janm-aadhaarit hissa ek baar ka hai** — lagna, panchma bhaav, Guru, Budh, Chandra. Ye kabhi nahi badalte. Ek baar nikaal kar save kar lijiye.',
      '**Dasha wala hissa** tab dekhiye jab dasha badle. Bachchon mein antardasha kuch mahinon mein badalti hai, isliye **saal mein ek baar** kaafi hai.',
      'Jo nahi karna chahiye: **har khraab report card ke baad dobara chalana.** Aankda wahi rahega, aur baar-baar dekhna sirf chinta badhata hai — aur wo chinta bachche tak pahunchti hai.',
    ],
  },
  {
    id: 'verify',
    h2: 'Reading ki buniyad khud parakhiye',
    paras: [
      'Kisi bhi reading par bharosa karne se pehle uski ganana parakhni chahiye.',
      'Bachche ka wahi janm vivaran kisi doosre bharose-mand software mein daaliye. **Lagna, Chandra rashi, nakshatra aur panchma bhaav ki rashi** bilkul milni chahiye — dono taraf Lahiri ayanamsha ho to antar nahi aayega.',
      'Aur **dasha** milaiye — kaunsi Mahadasha chal rahi hai. Wo bilkul milni chahiye, kyunki wo janm nakshatra se nikalti hai aur usme koi vyakhya nahi hai.',
      'Agar **lagna hi alag** aaye to samay ya shahar mein galti hai — wahi pehle jaanchiye. Poori kundali [Kundali Calculator](/calculators/free-kundali-calculator) par free ban jaati hai.',
    ],
  },
  {
    id: 'santan-yog-alag',
    h2: 'Santan Yog aur ye reading — do alag cheezein',
    paras: [
      'Ye antar saaf kar dena chahiye kyunki log dono ko mila dete hain.',
      '**Santan Yog** ka sawaal hai "kya mujhe santan hogi" — aur wo **maa-baap ke panchma bhaav** se padha jaata hai. Wo ek alag prashn hai aur uske liye alag tool hai.',
      '**Ye reading** us bachche ke liye hai jo aa chuka hai — aur wo **bachche ke apne chart** se padhi jaati hai. Do alag chart, do alag sawaal.',
      'Agar aapka sawaal pehla wala hai to [Santan Yog Calculator](/calculators/free-santan-yog-calculator) free hai, aur uska poora vishay [Child Birth Prediction](/learn/child-birth-prediction) par.',
    ],
  },
  {
    id: 'kis-ke-liye',
    h2: 'Ye reading kin maa-baap ke liye hai',
    paras: [
      '**Sabse zyada kaam ki:** jinhe lagta hai ki bachche ko samajh nahi paa rahe; jinke ghar mein padhai ko lekar roz tanav hai; aur jo stream ya kshetra ka faisla lene wale hain aur andar se sure nahi hain.',
      '**Kam kaam ki:** jo bachche ke bhavishya ki nishchit bhavishyavani chahte hain — wo yahan nahi milegi, aur milni bhi nahi chahiye.',
      'Aur **ek jagah jahan ye page sahi jagah nahi hai:** agar bachche ko seekhne, bolne, dhyan lagane ya vyavhaar mein lagatar dikkat hai. Wahan pehla kadam kisi vishesheshgya ki jaanch hai. Reading uske baad kaam aa sakti hai, uski jagah nahi.',
    ],
  },
  {
    id: 'kyun-yahi',
    h2: 'Yahi page kyun — aur kya farak hai',
    paras: [
      '**Ganana** — Swiss Ephemeris aur Lahiri Ayanamsha, wahi jo peshevar software chalate hain. Har graha ki degree aur Shadbala dikhti hai, chhupayi nahi jaati. Aap kisi bhi doosre tool se mila kar dekh sakte hain.',
      '**Bachche ka apna chart** — maa-baap ka nahi. Bahut se tool "bachche ke baare mein" maa-baap ke chart se batate hain, jo alag prashn ka uttar hai.',
      '**Har point ke saath wajah** — kaunsa graha, kaunsa bhaav, kaunsi dasha. Taaki aap use parakh sakein aur asahmat bhi ho sakein.',
      'Aur **jo yahan nahi hai** — koi dar, koi dosh ki chetavni, koi mehnga anushthan, aur koi daawa ki aapka bachcha kya banega. Ek chetavni jo yahan zaroor hai: **chart bachche ki seema nahi hai** — aur wo baat is page par ek se zyada baar likhi hai, jaanbujh kar.',
    ],
  },
  {
    id: 'do-minute',
    h2: 'Do minute — aur bachche ko behtar samajhna shuru',
    paras: [
      'Aap yahan tak padh aaye hain, to sawaal mann mein hai hi.',
      '**Upar form mein bachche ka janm vivaran daaliye** — aapka nahi. Do minute lagenge, aur Trikaal Ka Sandesh turant saamne aa jaayega: uska lagna, Chandra rashi, panchma bhaav aur chal rahi dasha.',
      'Koi signup nahi, koi card nahi. **Pehla reading bilkul free hai.**',
      'Aur jo mile, use ek hi tarah se istemaal kijiye — **bachche ko samajhne ke liye, uspar faisla thopne ke liye nahi.** Yahi is reading ka poora maqsad hai.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Aage kya padhein',
    paras: [
      '**Poora vishay** — [Child destiny aur future astrology](/blog/childs-destiny-future-astrology), Hindi mein [बच्चे का भविष्य](/blog/childs-destiny-future-astrology-hindi), aur [Fifth lord aur aptitude](/blog/fifth-lord-child-aptitude-astrology).',
      '**Gehri baatein** — [Jupiter Putrakaraka](/blog/jupiter-putrakaraka-child-destiny-astrology), [Saraswati Yoga](/blog/saraswati-yoga-child-education-astrology), [Dasha timing aur child development](/blog/dasha-timing-child-development-astrology), aur [Education Prediction](/learn/education-prediction-astrology).',
      '**Muft jaanch** — [Kundali Calculator](/calculators/free-kundali-calculator), [Nakshatra Calculator](/calculators/free-nakshatra-calculator), [Dasha Calculator](/calculators/free-dasha-calculator), [Baby Name by Nakshatra](/calculators/free-baby-name-by-nakshatra), aur [Santan Yog Calculator](/calculators/free-santan-yog-calculator).',
    ],
  },
  {
    id: 'lagna-bachche-ka',
    h2: 'Bachche ka lagna — sab kuch usi par khada hai',
    paras: [
      'Ye buniyadi baat hai aur uske bina baaki sab andaaza ban jaata hai.',
      '**Lagna wo rashi hai jo bachche ke janm ke kshan purvi kshitij par udit thi**, aur usi se baarah bhaav bante hain — panchma bhaav bhi. Lagna badla to panchma badla, aur uske saath poora vishleshan.',
      'Lagna har lagbhag **do ghante** mein badal jaata hai. Isliye "subah ke aas-paas" jaisa samay kaam nahi karta — ghanta aur minute dono chahiye.',
      'Aur lagna sirf bhaav nahi banata; wo bachche ki **shareerik prakriti aur pehla swabhav** bhi dikhata hai. Har lagna ka vistaar [Lagna Calculator](/calculators/free-lagna-calculator) par free hai.',
    ],
  },
  {
    id: 'nakshatra-swabhav',
    h2: 'Nakshatra — swabhav ka sabse sookshm sanket',
    paras: [
      'Rashi barah hain, nakshatra sattais — isliye nakshatra swabhav ka kahin zyada baareek chitra deta hai.',
      'Bachche ka **janm nakshatra** teen cheezein deta hai: uska **swabhav** (har nakshatra ka apna gan, swami aur devta hai), uske **naam ka akshar** (pada ke hisaab se), aur sabse zaroori — **uski pehli dasha**, kyunki Vimshottari janm nakshatra ke swami se hi shuru hoti hai.',
      'Yahi wajah hai ki ek hi din paida hue do bachche alag daur jee rahe hote hain — unke nakshatra alag hain, isliye unki dasha alag chal rahi hai.',
      'Bachche ka nakshatra aur pada [Nakshatra Calculator](/calculators/free-nakshatra-calculator) par free dikh jaata hai.',
    ],
  },
  {
    id: 'shiksha-ka-samay',
    h2: 'Shiksha ke anukool daur kab aayenge',
    paras: [
      'Ye maa-baap ke liye sabse vyavharik jaankari hai, kyunki uspar planning ho sakti hai.',
      'Shiksha ke liye anukool maane jaate hain: **Guru ki Mahadasha ya Antardasha** (samajh aur vistaar), **Budh ka daur** (abhyaas aur pakadd), aur **panchma bhaav ke swami ka daur**.',
      'Kathin maane jaate hain: **Rahu ka daur** (dhyan bhatakna, bechaini) aur **Shani ka** (sab dheema aur bhaari lagna). Par yahan ek sudhar zaroori hai — **Shani ka daur padhai ke liye bura nahi hai.** Wo dheema hai, par usme kiya gaya kaam sabse zyada tikta hai. Bahut se anushasit vidyarthi Shani ke daur se hi bante hain.',
      'Vyavharik matlab: **bade faisle — stream, coaching, badi pariksha — anukool daur mein rakhna behtar hai.** Bachche ka poora dasha kram [Dasha Calculator](/calculators/free-dasha-calculator) par free hai.',
    ],
  },
  {
    id: 'maa-baap-ka-chart',
    h2: 'Kya maa-baap ka chart bhi dekha jaata hai',
    paras: [
      'Ye sawaal aata hai aur iska uttar dono taraf saaf hona chahiye.',
      '**Bachche ke apne jeevan ke liye — nahi.** Uska lagna, uska panchma bhaav, uski dasha — sab uske apne chart se aate hain. Maa-baap ka chart usme kuch nahi jodta.',
      '**Kis cheez ke liye haan:** maa-baap ke chart se santan se juda **unka apna** anubhav dikhta hai — unka panchma bhaav, unka Guru. Wo batata hai ki unke liye santan ka vishay kaisa rahega, bachche ka bhavishya nahi.',
      'Isliye is form mein **bachche ka vivaran** daaliye. Agar aapka apna prashn hai — santan ka yog, ya bachche se juda apna daur — to wo [Santan Yog Calculator](/calculators/free-santan-yog-calculator) par alag se hai.',
    ],
  },
  {
    id: 'chart-badalta-nahi',
    h2: 'Kya bachche ki kundali badal sakti hai',
    paras: [
      'Chhota par zaroori section, kyunki iske naam par bhi kuch becha jaata hai.',
      '**Janm kundali kabhi nahi badalti.** Wo us ek kshan ki tasveer hai jab bachcha paida hua. Koi upay, koi pooja, koi ratna use nahi badalta — aur jo koi "kundali sudhaar" ki sewa beche, wo galat bech raha hai.',
      '**Jo badalta hai wo dasha hai** — jo apne kram se aage badhti rehti hai — aur **gochar**, yaani grahon ka aaj aakash mein chalna.',
      'Isliye bachche ki kundali ek baar bana kar **save kar lijiye** — PDF ya screenshot. Uske saath janm samay, lagna, Chandra rashi aur nakshatra likh lijiye. Ye char cheezein sanskaron mein aur aage har jagah kaam aayengi.',
    ],
  },
];

const V6_HUB_READ: V6Link[] = [
  { href: '/blog/childs-destiny-future-astrology', label: 'Child destiny aur future', note: 'Poora vishay' },
  { href: '/blog/childs-destiny-future-astrology-hindi', label: 'बच्चे का भविष्य', note: 'हिंदी में पूरा' },
  { href: '/blog/fifth-lord-child-aptitude-astrology', label: 'Fifth lord aur aptitude', note: 'Jhukav ka aadhaar' },
  { href: '/blog/jupiter-putrakaraka-child-destiny-astrology', label: 'Jupiter Putrakaraka', note: 'Santan ka kaarak' },
  { href: '/blog/saraswati-yoga-child-education-astrology', label: 'Saraswati Yoga', note: 'Vidya ka yog' },
  { href: '/blog/dasha-timing-child-development-astrology', label: 'Dasha aur child development', note: 'Daur ka asar' },
  { href: '/learn/education-prediction-astrology', label: 'Education Prediction', note: 'Shiksha ka vishleshan' },
  { href: '/learn/child-birth-prediction', label: 'Child Birth Prediction', note: 'Maa-baap ka prashn' },
  { href: '/blog/foreign-career-education-astrology', label: 'Videsh mein padhai', note: 'Barahvaan aur navam' },
];

const V6_HUB_CALC: V6Link[] = [
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Nakshatra aur pada' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Abhi kaunsa daur' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Sab isi par khada hai' },
  { href: '/calculators/free-baby-name-by-nakshatra', label: 'Baby Name by Nakshatra', note: 'Naam ka akshar' },
  { href: '/calculators/free-santan-yog-calculator', label: 'Santan Yog Calculator', note: 'Alag prashn' },
  { href: '/calculators/free-ias-astrology-calculator', label: 'IAS Astrology Calculator', note: 'Pratiyogi pariksha' },
  { href: '/learn/government-job-chances', label: 'Government Job & UPSC', note: 'Bade bachchon ke liye' },
  { href: '/calculators/free-foreign-settlement-calculator', label: 'Foreign Settlement', note: 'Videsh ka yog' },
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
        <h2 className="text-base font-bold m-0 mb-2 text-[#D4AF37]">Bachche se jude aur vishay — sab free</h2>
        <p className="text-xs leading-relaxed mb-4 text-slate-400">
          Ye page bachche ke apne chart ka hai. Sidhant, shiksha aur santan-yog ke poore vishay alag pages par hain.
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

export default function ChildDestinyPage() {
  return (
    <>
      <Script id="schema-child-destiny" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-[#080B12] text-white">
        <SiteNav />
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-900/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">Child Destiny Intelligence · by Rohiit Gupta</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">What Is Your Child <span className="text-[#D4AF37]">Born to Become?</span><br />Their Stars Know.</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-3 leading-relaxed">Trikaal AI reads your child's 5th House, Moon sign, Mercury and Lagna to reveal hidden talents, ideal education stream, and <span className="text-[#D4AF37] font-semibold">cosmic calling</span> — before society tells them who to be.</p>
            <p className="text-sm text-gray-500 mb-10">Reading designed by <Link href="/founder" className="text-[#D4AF37] hover:underline">Rohiit Gupta</Link> — Chief Vedic Architect · Swiss Ephemeris (self-hosted)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#birth-form" className="bg-[#D4AF37] text-[#080B12] font-bold px-8 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_30px_rgba(212,175,55,0.3)]">Get Child Destiny Reading — ₹51</Link>
            </div>
          </div>
        </section>
        {/* ── v5.0: the real reading form, preselected to mill_childs_destiny.
            The CHILD's birth details go here, not the parent's. */}
        <section className="px-4 pb-10 -mt-2">
          <ServiceReadingForm
            domain="child-destiny"
            heading="Apne bachche ki kundali dekhiye"
            subheading="Panchma bhaav, Guru, Budh aur bachche ki chal rahi dasha — bachche ke apne chart se."
          />
        </section>

        <AuthorStrip />
        <section className="py-20 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Ancient Wisdom. Modern Precision.</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Why Vedic Astrology Reveals <span className="text-[#D4AF37]">Your Child&apos;s Gift</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "👶", title: "The 5th House Is the House of Children and Talent", desc: "The 5th house governs intelligence, creativity, and the child's natural genius. Its lord's strength, nakshatra, and planetary associations reveal what domain the child is cosmically gifted in — before any schooling shapes them." },
                { icon: "🌙", title: "Moon Sign Reveals Emotional Intelligence and Learning Style", desc: "The Moon sign and nakshatra determine how a child processes information, relates to teachers, and handles pressure. Understanding this transforms parenting and education choices." },
                { icon: "☿", title: "Mercury and Jupiter Determine the Right Education Stream", desc: "Mercury (intellect) and Jupiter (wisdom) reveal the ideal education domain. Mercury strong in Virgo favors analytics, science, writing. Jupiter in Sagittarius favors law, teaching, philosophy." },
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
                  { step: "01", title: "Enter Child's Birth Details", desc: "Date, exact time, and place of birth. Even 10-minute precision is important for the Lagna and Moon sign." },
                  { step: "02", title: "Trikaal Maps Their Cosmic Blueprint", desc: "5th house lord analysis, Moon nakshatra learning style, Mercury and Jupiter education domain, Dasha timeline for peak talent years." },
                  { step: "03", title: "Get Their Talent and Career Map", desc: "₹51 reading: Top 3 talent domains, ideal education stream, which ages bring peak growth, which careers are cosmically supported." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-bold text-sm">{s.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{s.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p></div>
                  </div>
                ))}
              </div>
              <DeliverableCard segment="child-destiny" items={["5th House hidden talent analysis", "Moon nakshatra learning style", "Mercury and Jupiter education domain", "Top 3 ideal career paths", "Ages of peak academic performance", "Challenging placements and remedies", "4-week child energy forecast"]} />
            </div>
          </div>
        </section>
        <MaaDivineSeva />
        <section className="px-4 pb-4"><V6Content /></section>

        <FaqSection items={[
          { q: "Can Vedic astrology reveal my child's natural talents?", a: "Yes. The 5th house governs intelligence, creativity, and natural genius. Its lord's strength and planetary associations reveal what domain the child is cosmically gifted in — before any schooling shapes them." },
          { q: "Which house in astrology shows a child's education?", a: "The 4th house governs primary education. The 5th governs intelligence. The 9th governs higher education. Mercury and Jupiter placement determine the ideal academic stream." },
          { q: "What is Moon nakshatra and why does it matter for children?", a: "The Moon nakshatra determines the child's emotional nature and learning style. A child in Rohini learns through beauty and consistency. A child in Ardra learns through questioning. Understanding this transforms how parents teach." },
          { q: "At what age should I get my child's kundali read?", a: "The earlier the better. Readings are most actionable around ages 5 to 12 when education decisions begin, and at 15 to 16 for stream selection. The birth chart does not change, so a reading is relevant at any age." },
        ]} />
        <CtaSection headline="Give Your Child the Gift of" highlight="Cosmic Clarity." body="Every child is born with a unique cosmic blueprint. ₹51 to read it — before the education system overwrites it." segment="child-destiny" />
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
