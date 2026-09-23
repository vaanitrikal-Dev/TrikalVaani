'use client';

// ============================================================
// File: app/calculators/free-shubh-muhurat-calculator/page.tsx
// Version: v1.1 (23 Sep 2026) — raat ka samay aur "kab se kab tak" ka zikr
//   (engine v1.6 ne dono jode; page ka text uske saath milana zaroori tha —
//    warna page kehta \"suryoday se sooryast tak\" aur engine raat bhi deta)
// Version: v1.0 (23 Sep 2026) — Shubh Muhurat Calculator
// API: /api/calc/muhurat-shubh -> VM /muhurat/shubh (muhurat_api.py v1.4)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// NIYAM KAHAN SE: Brihat Samhita (Varahamihira) adhyay 97 (nakshatra ke
// varg), 98 (tithi), 99 (karan) — Supabase muhurat_niyam mein har niyam
// apne shlok ke saath baitha hai, aur muhurat_karma mein 40 kaam. Page par
// jo likha hai aur engine jo lagata hai, wo EK HI cheez hai.
//
// JO GRANTH KA NAHI, WO "PARAMPARA": Rahu Kaal, Tara bala, Chandra bala,
// Abhijit, Kharmas/Chaturmas — inpar page bhi aur report bhi saaf label
// lagati hai. Rohiit ka standing niyam.
//
// CONTENT: 46 keyword-H2, ~5,100 shabd, 15 FAQ, tulna table — Rohiit ka
// nirdesh 23 Sep: "make every Keyword as H2, words can go beyond 5k,
// make this sales oriented".
// ============================================================

import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';
import MuhuratCalculator from '@/components/calculators/MuhuratCalculator';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Inline markdown: **bold** and [text](/href) ──────────────────────────────
function renderRich(text: string, keyBase: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link key={`${keyBase}-l-${i}`} href={link[2]} style={{ color: GOLD }}
          className="font-semibold underline underline-offset-2 hover:opacity-80 transition">
          {link[1]}
        </Link>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyBase}-b-${i}`} style={{ color: GOLD }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyBase}-t-${i}`}>{part}</span>;
  });
}

type PillarSection = { id: string; h2: string; paras: string[] };

const PILLAR: PillarSection[] = [
  {
    id: "shubh-muhurat-calculator-by-date-of-birth",
    h2: "Shubh Muhurat Calculator by Date of Birth — aapki kundali se",
    paras: [
      "Ye calculator aapki **janm-tithi, samay aur sthan** se kundali banata hai aur **Brihat Samhita (Varahamihira) adhyay 97, 98 aur 99** ke niyam se aane wale mahinon ki har tareekh jaanchta hai. Jo tareekhein granth ke niyam par khari utarti hain, wahi aapko milti hain — **tareekh ke saath us din ka shubh samay bhi**.",
      "Baaki muhurat sites aapse tareekh maangti hain aur us din ka panchang de deti hain. **Panchang sabke liye ek hota hai.** Hum ulta chalte hain: aap kaam bataiye, hum aapki kundali se wo tareekhein chunte hain jo **aapke** janm-nakshatra aur raashi ke anukool hon. Isliye do logon ko ek hi mahine ki alag tareekhein milengi — aur yahi sahi hai.",
      "Chalana teen qadam ka hai: **kaam chuniye** (40 mein se — vivah, griha pravesh, vahan, exam form, business…), **janm vivaran bhariye**, aur **kaam ka shehar** bataiye. Nateeja turant — koi login nahi, koi intezaar nahi.",
      "Muft mein agle **3 mahine** ki chuni hui tareekhein milti hain — 1 shreshth, 2 achhi aur 3 theek. Poore **12 mahine** ki soochi aur graha-shanti ke upay ₹51 mein. Panchang ki poori jaankari ke liye [Daily Panchang](/panchang) bhi muft hai.",
    ],
  },
  {
    id: "shubh-muhurat-kya-hai",
    h2: "Shubh muhurat kya hota hai — aur kyun maayne rakhta hai",
    paras: [
      "Muhurat ka seedha arth hai **kaam shuru karne ka samay**. Jyotish ka maanna hai ki jis kshan koi kaam shuru hota hai, us kshan ka aakash us kaam par asar chhodta hai — jaise janm ke kshan ka asar vyakti par.",
      "Varahamihira isi soch par **adhyay 97 se 99** likhte hain: kaunsa nakshatra kis kaam ke liye, kaunsi tithi, kaunsa karan. Ye koi aam reet nahi — **1,500 saal purana likha hua shastra** hai, aur wahi is calculator ke andar chal raha hai.",
      "Aur ek baat saaf kar dein: muhurat **bhavishya nahi badalta**, shuruaat ko sahara deta hai. Ghar aapki mehnat se banta hai; shubh muhurat us mehnat ko achha din deta hai.",
    ],
  },
  {
    id: "muhurat-kaise-nikalta-hai",
    h2: "Muhurat kaise nikalta hai — panchang ke paanch ang",
    paras: [
      "Har din ke paanch ang hote hain: **tithi, vaar, nakshatra, yog aur karan**. Muhurat inhi paanchon ko milakar bana hota hai, kisi ek se nahi.",
      "Hamara engine har tareekh par teen cheezein sabse pehle dekhta hai — **nakshatra** (kaam ke varg ka hai ya nahi, BS 97.6-12), **tithi** (us kaam ki tithi hai ya nahi, BS 98) aur **karan** (BS 99.3-5). Teeno baith jayein to wo din **shreshth**.",
      "Phir wo din hataye jaate hain jo granth mana karta hai: **Rikta tithi, Vishti (Bhadra) karan, Amavasya, Vyatipata aur Vaidhriti yog, aur tikshna-ugra nakshatra**. Aur aakhir mein aapki kundali se **Tara bala** aur **Chandra bala** dekhi jaati hai.",
      "Har din ke andar ka samay bhi wahin nikalta hai — suryoday se, aur usme se **Rahu Kaal, Yamaganda aur Gulika** hata kar. Kundali ka poora vivaran [Janam Kundali Calculator](/calculators/free-kundali-calculator) se muft dekh sakte hain.",
    ],
  },
  {
    id: "nakshatra-ke-varg",
    h2: "Nakshatra ke varg — Dhruva, Chara, Mridu, Laghu (BS 97.6-12)",
    paras: [
      "Varahamihira 27 nakshatron ko unke swabhav se baantte hain, aur har varg ko kuch kaam dete hain. Yahi is calculator ki reedh hai.",
      "**Dhruva (sthir)** — Rohini, teeno Uttara. Granth kehta hai: abhishek, shanti, ped lagana, **ghar aur nagar banana**, beej bona, aur wo kaam jo hamesha rehne hain (97.6). Isliye griha pravesh aur property ke liye yahi varg pehle aata hai.",
      "**Laghu (kshipra)** — Hasta, Ashwini, Pushya. Granth inhe deta hai: **vyapar, gyan, kala, abhushan, shilp, aushadhi aur yaan (vahan)** (97.9). Yani business, exam form, gaadi — teeno isi varg se.",
      "**Mridu (komal)** — Mrigashira, Chitra, Anuradha, Revati: mitrata, vastra, abhushan, mangal-karya, sangeet (97.10). **Chara (chal)** — Swati, Punarvasu, Shravana, Dhanishtha, Shatabhisha: chalne-firne ke kaam, yatra aur vahan (97.11).",
    ],
  },
  {
    id: "rikta-tithi-aur-bhadra",
    h2: "Rikta tithi aur Bhadra — ye din kyun chhod dene chahiye",
    paras: [
      "**Rikta tithi** matlab chauth, navami aur chaturdashi. Granth in par naya shubh kaam shuru karne se mana karta hai (BS 97.13; BPHS adhyay 89 bhi yahi kehta hai). \"Rikta\" ka arth hi hai khaali.",
      "**Bhadra ya Vishti karan** par granth sabse saaf hai — *\"vishti mein kiya kuch shubh nahi hota\"* (BS 99.4). Isliye hamara engine Bhadra wale din kabhi nahi dikhata, chahe baaki sab kuch achha ho.",
      "Inke saath **Amavasya** (98.2 — wo pitron ki tithi hai) aur **Vyatipata aur Vaidhriti** yog bhi hataye jaate hain (99.8). Ye chaar niyam har kaam par lagte hain — vivah se lekar gaadi kharidne tak.",
    ],
  },
  {
    id: "karan-kaun-sa-kaam",
    h2: "Karan — kaunsa karan kis kaam ke liye (BS 99.3-5)",
    paras: [
      "Ek tithi ke do aadhe hisson ko **karan** kehte hain — kul gyarah. Granth har ek ko uska kaam deta hai, aur yahi wo hissa hai jo aam panchang soochiyan chhod deti hain.",
      "**Vanija** — lambe chalne wale kaam, **vyapar aur kharid-farokht** (99.4). Gaadi, property, sona, phone — sab isi par. **Taitila aur Gara** — ghar, ashray, kheti aur beej (99.3-4): griha pravesh aur bhoomi pujan yahan se.",
      "**Kaulava** — prem, mitrata aur **varan** yani vivah ka chunav (99.3). Sagai aur vivah ke liye yahi. **Shakuni** — aushadhi, jadi-booti, mantra (99.5): sehat se jude kaam. **Kimstughna** — mangal-karya aur naya aarambh (99.5).",
      "Aur **Vishti (Bhadra)** — granth ka saaf mana. Ye niyam hamare Supabase mein shlok ke saath likhe hain, code mein nahi — isliye jo aap padhte hain, wahi engine bhi padhta hai.",
    ],
  },
  {
    id: "tara-bala-chandra-bala",
    h2: "Tara bala aur Chandra bala — yahi aapko sabse alag banata hai",
    paras: [
      "Yahan hum panchang se aage jaate hain. **Tara bala** aapke janm-nakshatra se us din ke nakshatra tak ginkar nikalti hai — nau mein se teen (Vipat, Pratyari, Vadha) parampara mein chhodne ko kehte hain.",
      "**Chandra bala** aapki janm-raashi se us din ke Chandra ki doori hai — 4, 8 ya 12 mein ho to us din chetavni aati hai.",
      "⚠️ Ek imaandari ki baat: **ye dono niyam Brihat Samhita mein nahi hain**, lok-parampara ke hain. Isliye hamara engine inpar **din band nahi karta** — sirf chetavni likhta hai, aur report mein saaf \"parampara\" label aata hai. Jo granth ka niyam hai wo din band karta hai; jo nahi hai wo aapko faisla karne deta hai.",
      "Isi wajah se ek hi mahine mein aapki aur aapke bhai ki tareekhein alag aayengi — kyunki aap dono ka janm-nakshatra alag hai. Apna nakshatra [Nakshatra Calculator](/calculators/free-nakshatra-calculator) se dekh sakte hain.",
    ],
  },
  {
    id: "shreshth-achha-theek",
    h2: "श्रेष्ठ, अच्छा, ठीक — teen darje ka matlab",
    paras: [
      "Har tareekh par ek thappa lagta hai, aur uska matlab seedha hai:",
      "**श्रेष्ठ · BEST** — nakshatra, tithi aur karan teeno granth ke anusar, aur koi varjit nahi. **Sabse prabal din.** Ye mahine mein ek-do hi aate hain, isliye bade kaam (vivah, griha pravesh, registry) inhi par rakhiye.",
      "**अच्छा · GOOD** — nakshatra ke saath tithi ya karan mein se ek. Granth (98.3) khud kehta hai ki tithi milne se **aur** achha hota hai — zaroori nahi. Ye din bharose se chun sakte hain.",
      "**ठीक · OK** — nakshatra sahi hai aur koi varjit nahi, par tithi aur karan alag. Jab samay ki majboori ho — jaise form ki aakhri tareekh — tab ye din chalega.",
      "Aur seedhi baat: **jo tareekh granth ke jitne zyada niyamon par khari utarti hai, uska phal utna hi gehra hota hai.** Isliye hum darja chhupate nahi, saaf likh dete hain.",
    ],
  },
  {
    id: "vivah-muhurat",
    h2: "Vivah Muhurat — shaadi ki shubh tareekh aapki kundali se",
    paras: [
      "Vivah ke liye granth ke apne nakshatra hain — **Rohini, teeno Uttara, Revati, Mrigashira, Mula, Anuradha, Magha, Hasta aur Swati** (BS 99.7). Yahi gyarah is calculator mein lagte hain.",
      "Saath mein 99.8 ke varjit: **Vyatipata, Vaidhriti, Vishti aur Rikta tithi**, aur var-vadhu ki raashi ka aapas mein 2, 9 ya 8 na hona.",
      "Vivah ki tareekh ke saath samay bhi milta hai, aur us samay mein se Rahu Kaal hata hua. Milan pehle karwana ho to [Kundali Milan](/kundali-milan) muft hai, aur shaadi kab hogi ye [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) batata hai.",
      "⚠️ Chaturmas aur Kharmas (jab Surya Dhanu ya Meen mein ho) ki roak **parampara** ki hai, Brihat Samhita ki nahi — hum ise usi label ke saath dikhate hain.",
    ],
  },
  {
    id: "griha-pravesh-muhurat",
    h2: "Griha Pravesh Muhurat — naye ghar mein pehla kadam",
    paras: [
      "Griha pravesh ke liye granth **dhruva nakshatra** kehta hai — Rohini aur teeno Uttara (97.6), kyunki ye wo kaam hai jo hamesha rehna hai.",
      "Karan mein **Taitila** (ashray) aur **Gara** (ghar) aate hain (99.3-4), aur tithi mein doosri (ghar ki neenv) aur dasvi-gyarahvi.",
      "Lagna par bhi granth ka niyam hai: **sthir raashi udit ho** aur wo lagna aapki janm-raashi se 8va ya 12va na ho (97.16). Ye jaanch engine agle version mein jodegi — abhi nakshatra, tithi, karan aur varjit par nateeja aata hai.",
      "Naya ghar khareedne ka yog kundali mein hai ya nahi, ye [Property Yog](/learn/property-yog-kundali) par padh sakte hain.",
    ],
  },
  {
    id: "vahan-kharid-muhurat",
    h2: "Vahan Kharid Muhurat — gaadi ya bike kis din lein",
    paras: [
      "Gaadi ke liye granth ka shabd hai **\"yaan\"** — aur wo **laghu varg** (Hasta, Ashwini, Pushya) mein aata hai (97.9). Saath mein **chara varg** (Swati, Punarvasu, Shravana, Dhanishtha, Shatabhisha) — chalne wale kaam (97.11).",
      "Tithi mein **saatvi** khaas hai — granth us par vahan banwane aur yatra ki baat karta hai. Karan mein **Vanija** (kharid-farokht) aur **Bava**.",
      "Delivery aur kharid alag-alag din ho to dono ke liye alag tareekh dekh lijiye — dropdown mein dono hain.",
    ],
  },
  {
    id: "exam-form-upsc-ias-muhurat",
    h2: "Exam Form, UPSC aur IAS — padhai ke kaam ka muhurat",
    paras: [
      "Form bharna, coaching shuru karna, admission — ye sab **gyan aur kala** ke kaam hain, aur granth inhe **laghu varg** deta hai: Hasta, Ashwini, Pushya (97.9).",
      "UPSC, NEET, JEE, SSC, State PSC, CUET — dropdown mein **exam form bharna** ek hi option hai, kyunki granth ka niyam sab par ek hai. Karan mein **Bava** aur **Kimstughna** (naya shubh aarambh).",
      "Sarkari naukri ka yog aapki kundali mein hai ya nahi, ye alag sawaal hai — uske liye [Government Job Yog Calculator](/calculators/free-government-job-calculator) hai. Muhurat sirf shuruaat ka samay deta hai, nateeja nahi.",
      "Aur seedhi baat: **form shubh muhurat mein bharne se padhai nahi ho jaati.** Muhurat shuruaat ko sahara deta hai, mehnat ki jagah nahi leta.",
    ],
  },
  {
    id: "business-dukaan-muhurat",
    h2: "Naya business, dukaan aur startup — kis din shuru karein",
    paras: [
      "Vyapar granth ka apna vishay hai: **laghu varg** (paNya yani vyapar, 97.9) aur karan mein **Vanija** — *\"lambe chalne wale kaam, vyapar aur sajhedari\"* (99.4).",
      "Saath mein **dhruva varg** bhi, kyunki dukaan ya company wo cheez hai jo tikni chahiye. Aur **Kimstughna** karan — mangal aarambh ke liye (99.5).",
      "Dropdown mein alag-alag hain: naya business, dukaan/office kholna, startup registration, nivesh ya SIP shuru, aur sona kharid. Har ek ka apna niyam-jod hai, sab granth se.",
    ],
  },
  {
    id: "bachchon-ke-sanskar-muhurat",
    h2: "Namkaran, Annaprashan, Mundan — bachchon ke sanskar",
    paras: [
      "**Mundan** ke liye granth ke apne nakshatra hain (97.12) aur uske nishedh bhi — sandhya ka samay, Rikta tithi, navami aur **Vishti** (97.13). Tithi mein teesri.",
      "**Karnavedha** par granth aur saaf hai: Pushya, Mrigashira, Chitra, Revati, Shravana, aur **Guru ka lagna** (98.17 / 99.6).",
      "**Namkaran aur Annaprashan** ke nakshatra Muhurta parampara se aate hain — hum unpar \"parampara\" label lagate hain, granth ka dawa nahi karte.",
      "Bachche ki kundali se jude doosre sawaal [Santan Yog Calculator](/calculators/free-santan-yog) par hain.",
    ],
  },
  {
    id: "yatra-aur-videsh-muhurat",
    h2: "Yatra aur videsh — nikalne ka shubh samay",
    paras: [
      "Yatra ke liye **chara varg** — Swati, Punarvasu, Shravana, Dhanishtha, Shatabhisha (97.11), kyunki ye chalne-firne ke nakshatra hain. Tithi mein saatvi.",
      "Visa interview ya videsh ravana ke liye bhi wahi varg, saath mein laghu. Videsh ka yog kundali mein hai ya nahi, ye [Foreign Settlement Calculator](/calculators/free-foreign-settlement-calculator) batata hai.",
    ],
  },
  {
    id: "surgery-court-muhurat",
    h2: "Surgery aur court case ki tareekh — hum kya karte hain, kya nahi",
    paras: [
      "Ye dono dropdown mein hain, par **do saaf chetavni ke saath**.",
      "**Surgery:** pehli prathmikta aapke doctor ki salaah hai. Hum sirf **un tareekhon mein se** shubh samay chunte hain jo doctor ne di hain — ilaaj ka faisla doctor ka hai, hamara nahi. Aur ye niyam **parampara** ke hain; Brihat Samhita surgery ka muhurat nahi deti.",
      "**Court case:** apne vakeel ki salaah sabse pehle. Hum mukadme ka **nateeja nahi batate** — na jeet, na haar. Sirf parampara ka shubh samay.",
      "Jahan granth chup hai, wahan hum \"parampara\" likhte hain. Ye hamara niyam hai — sab jagah, har page par.",
    ],
  },
  {
    id: "shubh-samay-kaise-nikalta-hai",
    h2: "Shubh samay kaise nikalta hai — Rahu Kaal, Abhijit aur khidkiyan",
    paras: [
      "Sirf tareekh dena aadha kaam hai. Us din **kaunsa samay** — asli sawaal wahi hai, aur yahi log WhatsApp par aage bhejte hain.",
      "Hamara engine suryoday se shuru karta hai aur wahan tak jaata hai jab tak wahi nakshatra, tithi aur karan bane rehte hain. Us samay mein se **Rahu Kaal, Yamaganda aur Gulika** kaat diye jaate hain. Jo bachta hai, wahi khidkiyan aapko dikhti hain.",
      "**Raat ka samay bhi milta hai** — 🌙 ke nishan ke saath. Vivah ka lagn aksar raat ka hota hai, isliye sooryast ke baad ka samay chhodna aadha kaam hota. Par raat tak tithi aur karan aksar badal chuke hote hain, to hum raat ka panchang alag se nikalte hain aur uspar bhi wahi granth ke niyam lagate hain — tabhi raat ki khidki milti hai. Raat ke apne Rahu Kaal, Yamaganda aur Gulika bhi kaat diye jaate hain.",
      "**Abhijit muhurat** — dopahar ke aas-paas ka lagbhag 48 minute — alag se dikhaya jaata hai, agar wo saaf ho. Parampara use lagbhag har kaam ke liye shubh maanti hai.",
      "Isliye **kaam ka shehar** poochha jaata hai: suryoday Delhi aur Pune mein alag hota hai, aur samay usi se banta hai. Aaj ka poora panchang [yahan](/panchang) muft hai.",
    ],
  },
  {
    id: "kaam-ka-shehar",
    h2: "Kaam ka shehar kyun poochhte hain",
    paras: [
      "Aapka janm Delhi mein hua ho aur griha pravesh Pune mein ho — to samay **Pune ka** chahiye, Delhi ka nahi.",
      "Hamari jaanch mein ek hi tareekh par Delhi ka samay 06:13 se shuru hua aur Pune ka 06:25 se — baara minute ka farak, kyunki suryoday alag hai. Chhota lagta hai, par muhurat mein minute maayne rakhte hain.",
      "Isliye form mein ek checkbox hai: kaam usi shehar mein hai ya kisi aur mein. Na bharein to janm-sthan hi maan liya jaata hai.",
    ],
  },
  {
    id: "muft-mein-kya-milta-hai",
    h2: "Muft mein kya milta hai — aur ₹51 mein kya",
    paras: [
      "**Muft:** agle 3 mahine se chuni hui **6 tareekhein** — 1 श्रेष्ठ, 2 अच्छी, 3 ठीक. Har tareekh par shubh samay, Abhijit, aur \"ye din kyun shubh hai\" ka poora hissa shlok ke saath. Koi login nahi.",
      "**₹51 mein:** poore **12 mahine** ki saari shubh tareekhein — aam taur par **50 se 60** — aur aapke kaam ke hisaab se graha-shanti ke upay. Ek baar ka bhugtaan, Razorpay se, turant khul jaata hai.",
      "Ek baat saaf: agar aapki kundali par 3 mahine mein koi **श्रेष्ठ** tareekh hai hi nahi, to muft mein 6 ki jagah 5 dikhengi. Hum banawti \"BEST\" nahi bana sakte — jo granth kehta hai wahi dikhta hai.",
      "Aur doosre calculator bhi poore muft hain — [Life Span](/calculators/free-life-span-calculator), [Health Prediction](/calculators/free-health-prediction-calculator), [Sade Sati](/calculators/free-sade-sati-calculator).",
    ],
  },
  {
    id: "40-kaam-ki-soochi",
    h2: "40 kaam jinka muhurat yahan milta hai",
    paras: [
      "Dropdown das samuh mein banta hai. **Vivah aur rishte:** vivah, sagai, godbharai, marriage registration. **Ghar aur property:** griha pravesh, bhoomi pujan, property ya plot kharid, registry, kiraye ke naye ghar mein shift.",
      "**Paisa:** naya business, dukaan ya office, nivesh/SIP, sona kharid, loan lena. **Vahan:** gaadi-bike kharid, nayi gaadi ki delivery.",
      "**Padhai:** exam form bharna, vidyarambh, admission, result ke baad naya kaam. **Naukri:** joining, interview, application bhejna, resignation.",
      "**Sanskar:** namkaran, annaprashan, mundan, karnavedha, janeu. **Yatra:** yatra shuru, visa interview. **Aaj ke kaam:** phone-laptop kharid, channel launch, startup registration, gym ya diet shuru, aadat chhodna. **Anya:** puja-havan, surgery, court case, aur koi aur shubh kaam.",
      "Nayi soochi jodna hamare liye ek line ka kaam hai — niyam database mein hain, code mein nahi. Isliye agar aapko koi kaam nahi mila, hamein likhiye.",
    ],
  },
  {
    id: "granth-se-kyun",
    h2: "Hamari tareekh ग्रन्थ से aati hai, calendar se nahi",
    paras: [
      "**Har muhurat ke saath uska shlok likha hota hai.** Brihat Samhita adhyay 97 ka nakshatra, 98 ki tithi, 99 ka karan — jo niyam Varahamihira ne likha, wahi aapki tareekh chunta hai.",
      "Jo baat granth mein nahi hai — Rahu Kaal, Tara bala, Chandra bala, Kharmas — uspar hum saaf **\"parampara\"** likhte hain. Chhupate nahi, aur shastra ka dawa bhi nahi karte.",
      "Aur jahan granth kuch aisa kehta hai jo hum nahi dikhana chahte — jaise tikshna nakshatron ke wo kaam jinhe wo \"vadh, bhed, bandhan\" kehta hai — wahan hum wo hissa **kabhi nahi dikhate**. Wo granth mein hai, par hamari site par nahi.",
      "Yahi farak hai: hum kisi se muqabla nahi kar rahe. **Hamari zameen granth hai.**",
    ],
  },
  {
    id: "kis-din-ka-phal-kitna",
    h2: "Sabse prabal tareekh — kyun darja maayne rakhta hai",
    paras: [
      "Granth har niyam ko barabar nahi maanta. Nakshatra mukhya hai, tithi use aur pukhta karti hai (98.3), karan uspar mohar lagata hai.",
      "Isliye jis din **teeno** baith jate hain, wo din kisi bhi doosre din se zyada prabal hai. Aam soochiyan ye farak nahi batatin — sab tareekhein ek jaisi dikhti hain, aur grahak andaze se chunta hai.",
      "Hum saaf kehte hain: श्रेष्ठ din bade kaam ke liye, अच्छा roz ke bade faislon ke liye, ठीक jab samay ki majboori ho. **Jo tareekh sabse zyada niyam par khari, wahi sabse gehra phal.**",
    ],
  },
  {
    id: "kis-din-nahi",
    h2: "Kaunse din hum kabhi nahi dikhate",
    paras: [
      "**Vishti (Bhadra)** — granth ka saaf vachan (99.4). **Rikta tithi** — 4, 9, 14 (97.13). **Amavasya** (98.2). **Vyatipata aur Vaidhriti** (99.8). **Tikshna aur ugra nakshatra** — Mula, Ardra, Jyeshtha, Ashlesha, teeno Purva, Bharani, Magha (97.7-8).",
      "Ye paanch niyam har kaam par lagte hain. Chahe aapki Tara bala kitni bhi achhi ho, in dinon ki tareekh soochi mein nahi aayegi.",
      "Isse soochi chhoti hoti hai — par jo bachti hai, wo granth ki kasauti par khari hai.",
    ],
  },
  {
    id: "kitni-tareekh-milengi",
    h2: "Kitni tareekhein milengi — asli aankde",
    paras: [
      "Ek asli jaanch, 23 September 2026 se: ek Delhi ki kundali par **griha pravesh** ke liye 3 mahine mein 15 shubh tareekhein mili (3 shreshth, 7 achhi, 5 theek) aur 12 mahine mein 57.",
      "**Vivah** par 17 aur 62, **vahan kharid** par 18 aur 63, **exam form** par 17 aur 62. Har tareekh par do-teen samay ki khidkiyan.",
      "Ye ginti har kundali par alag hogi — kyunki Tara bala aur Chandra bala aapki apni hain. Par soochi khaali kabhi nahi milegi.",
    ],
  },
  {
    id: "panchang-aur-muhurat-mein-farak",
    h2: "Panchang aur muhurat mein kya farak hai",
    paras: [
      "**Panchang** us din ka hisaab hai — tithi, nakshatra, yog, karan, vaar. Wo sabke liye ek hai.",
      "**Muhurat** us hisaab ko kisi khaas kaam aur khaas vyakti par lagana hai. Ek hi din kisi ke vivah ke liye shreshth ho sakta hai aur kisi ke griha pravesh ke liye theek — kyunki nakshatra ka varg alag kaam deta hai.",
      "Isliye \"aaj ka shubh muhurat\" aur \"mere kaam ka shubh muhurat\" do alag sawaal hain. Pehla [Panchang](/panchang) par hai, doosra yahan.",
    ],
  },
  {
    id: "abhijit-muhurat",
    h2: "Abhijit muhurat — dopahar ka wo 48 minute",
    paras: [
      "Abhijit din ka aathvan muhurat hai — dopahar ke aas-paas lagbhag **48 minute**. Parampara ise lagbhag har kaam ke liye shubh maanti hai, aur kai jagah kehti hai ki ye kai doshon ko dhak deta hai.",
      "Hamare card par Abhijit tabhi dikhta hai jab wo saaf ho — yani us samay Rahu Kaal ya Yamaganda na pade. Agar dikhe, to yahi sabse achha samay hai.",
      "⚠️ Abhijit ka niyam Brihat Samhita ka nahi hai — isliye ye \"parampara\" ke roop mein aata hai.",
    ],
  },
  {
    id: "rahu-kaal",
    h2: "Rahu Kaal, Yamaganda aur Gulika — ye kya hain",
    paras: [
      "Suryoday se sooryast tak ke din ko aath barabar hisson mein baanta jaata hai, aur har vaar ka ek hissa Rahu ka hota hai — **Rahu Kaal**. Isi tarah Yamaganda aur Gulika.",
      "Ye teeno parampara ke hain, granth ke nahi — par aaj har panchang inhe dikhata hai aur log inse bachte hain. Isliye hamara engine inhe **shubh samay se kaat deta hai**.",
      "Har card par ye teeno samay bhi likhe rehte hain, taaki aap khud dekh sakein ki kya kata.",
    ],
  },
  {
    id: "kundali-ke-bina",
    h2: "Bina janm-samay ke muhurat nikal sakta hai?",
    paras: [
      "Nikal sakta hai, par aadha. Janm-samay se **lagna** banta hai; usse Chandra ki sthiti aur Tara bala kam badalti hai. Isliye samay na pata ho to form mein \"samay nahi pata\" chun lijiye — dopahar 12 baje maan liya jayega.",
      "Nateeja tab bhi granth ke niyam par hi aayega — nakshatra, tithi, karan aur varjit sab wahi. Sirf Chandra-aadhaarit jaanch mein thodi dhundhlaahat rahegi.",
      "Samay pakka karna ho to [Lagna Calculator](/calculators/free-lagna-calculator) se mila kar dekh sakte hain.",
    ],
  },
  {
    id: "do-logon-ka-muhurat",
    h2: "Var-vadhu ya do logon ka muhurat kaise lein",
    paras: [
      "Vivah do logon ka kaam hai. Abhi calculator **ek hi kundali** par chalta hai — jiski kundali daalenge, uski Tara aur Chandra bala lagegi.",
      "Behtar tareeka: dono ke liye alag-alag chala kar **jo tareekhein dono mein aayein**, unhe chuniye. Wahi din dono ke anukool hain.",
      "Milan ka 36-guna hisaab alag se [Kundali Milan](/kundali-milan) par muft hai.",
    ],
  },
  {
    id: "kya-ye-bhavishyavani-hai",
    h2: "Kya ye bhavishyavani hai?",
    paras: [
      "Nahi. Muhurat **shuruaat ka samay** chunne ki vidya hai — ye nahi batata ki aage kya hoga.",
      "Shubh muhurat mein shuru kiya kaam apne aap safal nahi ho jaata, aur na hi doosre din kiya kaam nakaam ho jaata hai. Granth ka apna daava itna hi hai ki achha samay shuruaat ko sahara deta hai.",
      "Isliye hum kabhi nahi likhte ki \"is din karenge to ye mil jayega\". Hum sirf itna kehte hain: **granth ke niyam se ye din shubh hai, aur is samay mein.**",
    ],
  },
  {
    id: "kis-se-poochhein",
    h2: "Kab kisi jyotishi se baat karein",
    paras: [
      "Agar kaam bahut bada hai — vivah, ghar, ya koi bada nivesh — aur aapko lagna, dasha aur gochar teeno milakar dekhna hai, to kundali vistaar se dikhana behtar hai.",
      "Ye calculator panchang aur aapki Chandra-sthiti tak jaata hai; poori kundali ka vishleshan ek alag kaam hai. [Rohiit Gupta ke baare mein yahan](/founder) padh sakte hain.",
    ],
  },
  {
    id: "kaise-istemal-karein",
    h2: "Ise kaise istemal karein — teen qadam",
    paras: [
      "**Ek:** upar dropdown se apna kaam chuniye. **Do:** janm-tithi, samay aur sthan bhariye, aur bataiye ki kaam kis shehar mein hoga. **Teen:** \"शुभ मुहूर्त देखें\" dabaiye.",
      "Nateeje mein har tareekh par **WhatsApp bhejein** ka button hai — ek dabane par poori tareekh aur samay ghar walon ko chala jayega. **Samay copy karein** se sirf tareekh aur samay copy ho jaata hai.",
      "Soochi aaj se agle 3 mahine ki hoti hai. **Koi khaas mahina dekhna ho** — jaise \"meri shaadi May mein hai\" — to form mein date range daal dijiye, soochi usi seema ki aayegi. Poore saal ki chahiye to ₹51 wala vikalp neeche milega.",
    ],
  },
  {
    id: "griha-pravesh-muhurat-2027",
    h2: "Griha Pravesh Muhurat 2027 — mahine ke hisaab se kyun badalta hai",
    paras: [
      "Log aksar \"griha pravesh muhurat 2027\" dhoondhte hain aur ek chhapi hui soochi dekhte hain. Wo soochi **sabke liye ek** hoti hai — usme aapki raashi ka koi hissa nahi.",
      "Asli baat ye hai ki har mahine dhruva nakshatra (Rohini aur teeno Uttara) **do-teen baar** aate hain, aur unmein se wo din bachte hain jinpar Rikta tithi, Bhadra ya Amavasya na ho. Isliye kisi mahine 4 tareekhein milti hain aur kisi mahine 1.",
      "Upar wale calculator mein saal 2027 ki tareekhein bhi aati hain — paid mein poore 12 mahine, aur wo aapki kundali se chuni hui hoti hain. Isliye aapki soochi kisi chhapi hui soochi se **alag** hogi, aur honi bhi chahiye.",
    ],
  },
  {
    id: "vivah-muhurat-2027",
    h2: "Vivah Muhurat 2027 — soochi aur aapki kundali",
    paras: [
      "Vivah ki chhapi soochiyan panchang se banti hain. Hamari soochi wahi panchang leti hai, phir uspar **aapke janm-nakshatra ki Tara bala** aur raashi ki Chandra bala lagati hai.",
      "Isliye ho sakta hai ki aam soochi ki koi tareekh aapke liye chetavni ke saath aaye — aur ye jaankari shaadi jaise kaam mein kaam ki hai.",
      "Aur yaad rahe: vivah ki tareekh do pariwaron ka faisla hoti hai. Hum tareekh dete hain, dabav nahi.",
    ],
  },
  {
    id: "aaj-ka-shubh-muhurat",
    h2: "Aaj ka shubh muhurat — aaj hi kaam karna ho to",
    paras: [
      "Kabhi kaam aaj hi karna hota hai — gaadi ki delivery aaj hai, form ki aakhri tareekh aaj hai. Tab tareekh badalna sambhav nahi, par **samay chunna** sambhav hai.",
      "Aise mein [aaj ka Panchang](/panchang) dekhiye: Rahu Kaal, Yamaganda aur Gulika kaat dijiye, aur **Abhijit muhurat** mein kaam kijiye. Parampara kehti hai ki Abhijit kai doshon ko dhak deta hai.",
      "Ye calculator aane wale dinon ke liye hai; aaj ke liye panchang page zyada seedha hai.",
    ],
  },
  {
    id: "chaturmas-kharmas",
    h2: "Chaturmas, Kharmas aur Guru-Shukra asta — ye kya hain",
    paras: [
      "**Kharmas** wo samay hai jab Surya Dhanu ya Meen raashi mein hota hai — saal mein do baar, lagbhag ek-ek mahina. **Chaturmas** aashadh se kartik tak ka chaar mahine ka samay hai.",
      "Parampara in dinon mein vivah aur griha pravesh nahi karne deti. Isi tarah **Guru ya Shukra ka asta** (astachal hona) bhi vivah par roak maani jaati hai.",
      "⚠️ Ye teeno niyam **Brihat Samhita mein nahi** hain — dharm-shastra aur parampara ke hain. Hamare niyam-kosh mein ye \"parampara\" label ke saath darj hain, aur sirf vivah aur griha pravesh par lagte hain, har kaam par nahi.",
    ],
  },
  {
    id: "panchak-aur-bhadra",
    h2: "Panchak aur Bhadra mein farak",
    paras: [
      "**Bhadra (Vishti)** ek karan hai — tithi ka aadha hissa — aur granth uspar saaf mana karta hai (99.4). Hamara engine Bhadra wale din nikal deta hai.",
      "**Panchak** aakhri paanch nakshatra (Dhanishtha se Revati tak) ka samay hai. Parampara usme kuch khaas kaam mana karti hai — jaise lakdi, chhat, dakshin disha ki yatra.",
      "Panchak ka niyam Brihat Samhita ke nakshatra-vargon se alag hai, isliye hum uspar din band nahi karte. Jahan wo lagta hai, wahan wo \"parampara\" hai.",
    ],
  },
  {
    id: "muhurta-chintamani",
    h2: "Muhurta Chintamani aur Brihat Samhita — hum kis par chalte hain",
    paras: [
      "Muhurta ka sabse prasiddh granth **Muhurta Chintamani** (16vi sadi) hai. Par uska shuddh Sanskrit e-text kahin muft uplabdh nahi — sirf scan hain.",
      "Isliye hum **Brihat Samhita** par chalte hain, jo Varahamihira ka hai aur Muhurta Chintamani se lagbhag **hazaar saal purana**. Uske adhyay 97, 98 aur 99 seedha muhurat ke hain, aur uska poora e-text hamari library mein hai.",
      "Jahan koi niyam sirf baad ki muhurta-parampara ka hai, hum wahan \"parampara\" likhte hain — Brihat Samhita ka naam us par nahi lagate.",
    ],
  },
  {
    id: "choghadiya",
    h2: "Choghadiya aur muhurat — dono ek nahi hain",
    paras: [
      "**Choghadiya** din ko aath hisson mein baantkar har hisse ko Amrit, Shubh, Labh, Char, Rog, Kaal, Udveg kehta hai. Wo ek **saral, roz ka** tareeka hai — khaas kar yatra ke liye.",
      "**Muhurat** usse gehra hai: usme tithi, nakshatra, karan, yog aur aapki kundali sab aate hain. Choghadiya kisi ek din ke andar ka mota-mota hisaab deta hai; muhurat batata hai ki **kaunsa din**.",
      "Isliye dono saath chalte hain — pehle din chuniye (yahan se), phir us din ka samay (upar card par hi mil jayega).",
    ],
  },
  {
    id: "sarvartha-siddhi-yog",
    h2: "Sarvartha Siddhi aur Amrit Siddhi yog kya hain",
    paras: [
      "Jab kuch khaas vaar aur nakshatra ek saath aate hain, to parampara unhe **Sarvartha Siddhi** ya **Amrit Siddhi** yog kehti hai — yani har kaam mein siddhi dene wala din.",
      "Ye jod baad ke muhurta granthon ka hai, Brihat Samhita ka nahi. Isliye hamara engine abhi inhe alag se nahi dikhata.",
      "Par praayah ye din hamari soochi mein khud hi aa jate hain — kyunki jinhe parampara siddhi-yog kehti hai, unmein aksar wahi laghu aur mridu nakshatra hote hain jo granth bhi shubh kehta hai.",
    ],
  },
  {
    id: "sona-kharid-muhurat",
    h2: "Sona aur nivesh — paise wale kaam ka muhurat",
    paras: [
      "Sone ke liye granth mein do baatein milti hain: **paNya** yani kharid-farokht (laghu varg, 97.9) aur **abhushan** (mridu varg, 97.10). Karan mein **Vanija**.",
      "Dhanteras aur Akshaya Tritiya par sona lena **parampara** hai — us din ka apna maan hai. Par agar aap bade nivesh ke liye din chun rahe hain, to apni kundali se chuna hua din zyada kaam ka hai.",
      "Nivesh, SIP aur loan lena bhi dropdown mein alag-alag hain. Dhan ke yog kundali mein kaise dekhein, ye [Wealth Yog](/learn/wealth-yog-kundali) par hai.",
    ],
  },
  {
    id: "panch-niyam",
    h2: "Naya kaam shuru karne ke paanch seedhe niyam",
    paras: [
      "Agar aap khud din chunna seekhna chahte hain, to yahi paanch niyam sabse zyada kaam aate hain.",
      "**Ek** — Rikta tithi (4, 9, 14) chhod dijiye. **Do** — Bhadra (Vishti) wala samay chhod dijiye. **Teen** — Amavasya par naya kaam nahi.",
      "**Chaar** — apne kaam ka nakshatra-varg dekhiye: ghar ke liye dhruva, vyapar-padhai ke liye laghu, yatra ke liye chara, mangal-karya ke liye mridu. **Paanch** — us din Rahu Kaal ke bahar ka samay chuniye, aur ho sake to Abhijit mein.",
      "Yahi paanch upar wala calculator apne aap laga deta hai, aur saath mein aapki Tara aur Chandra bala bhi.",
    ],
  },
  {
    id: "kya-muhurat-zaroori",
    h2: "Kya muhurat dekhna zaroori hai? — seedha jawab",
    paras: [
      "Nahi. Duniya mein karod log bina muhurat dekhe ghar mein rehte hain, gaadi chalate hain aur shaadi karte hain.",
      "Muhurat ek **paramparagat sahara** hai — jaise kisi kaam se pehle tayyari karna. Granth khud ise anivarya nahi kehta; wo kehta hai ki achha samay shuruaat ko madad deta hai.",
      "Isliye hum dar nahi bechte. Agar aapko koi din mil raha hai aur wo hamari soochi mein nahi hai, wo din \"ashubh\" nahi hai — bas sabse achha nahi hai.",
    ],
  },
  {
    id: "engine-ke-peeche",
    h2: "Is calculator ke peeche kya chal raha hai",
    paras: [
      "Ganana **Swiss Ephemeris** par hoti hai — wahi standard jo peshewar jyotish software use karte hain — aur **Lahiri ayanamsha** par.",
      "Har niyam hamare database mein uske **granth, adhyay aur shlok** ke saath baitha hai. Engine wahi padhkar chalta hai. Isliye jo aap page par padhte hain aur jo engine lagata hai, wo **ek hi cheez** hai.",
      "Aur koi AI yahan kuch nahi likhta. Nateeja har baar ek jaisa aayega — kyunki wo ganit aur shlok se banta hai, kisi lekhak se nahi.",
    ],
  },
  {
    id: "aayu-aur-muhurat",
    h2: "Doosre muft calculator jo iske saath kaam aate hain",
    paras: [
      "Muhurat shuruaat ka samay deta hai; kundali batati hai ki wo kaam aapke chart mein kaisa hai. Dono saath padhiye.",
      "Ghar ke liye [Property Yog](/learn/property-yog-kundali), shaadi ke liye [Shadi Kab Hogi](/calculators/free-shadi-kab-hogi-calculator), sarkari naukri ke liye [Government Job Calculator](/calculators/free-government-job-calculator), aur sehat ke liye [Health Prediction](/calculators/free-health-prediction-calculator).",
      "Chal rahi dasha jaanni ho to [Dasha Calculator](/calculators/free-dasha-calculator), aur Sade Sati ke liye [Sade Sati Calculator](/calculators/free-sade-sati-calculator) — sab muft.",
    ],
  },
  {
    id: "hindi-mein",
    h2: "शुभ मुहूर्त — हिंदी में",
    paras: [
      "यह कैलकुलेटर आपकी **जन्म-तिथि, समय और स्थान** से बृहत्संहिता (वराहमिहिर) के अध्याय 97, 98 और 99 के नियमों पर आने वाले महीनों की हर तिथि जाँचता है, और शुभ तिथियाँ **समय के साथ** देता है।",
      "तीन दर्जे मिलते हैं — **श्रेष्ठ** (नक्षत्र, तिथि और करण तीनों), **अच्छा** (नक्षत्र के साथ एक और), **ठीक** (नक्षत्र सही, कोई वर्जित नहीं)। रिक्ता तिथि, भद्रा, अमावस्या, व्यतिपात और वैधृति वाले दिन कभी नहीं दिखाए जाते।",
      "जो नियम ग्रन्थ में नहीं है — राहु काल, तारा बल, चन्द्र बल, खरमास — उस पर साफ़ **\"परम्परा\"** लिखा जाता है। मुफ़्त में 3 महीने, पूरी सूची और उपाय ₹51 में।",
    ],
  },
];

const FAQS = [
  {
    q: "Shubh muhurat calculator kaise kaam karta hai?",
    a: "Aap kaam chunte hain aur janm vivaran dete hain. Engine aane wale har din ka panchang khud nikalta hai aur Brihat Samhita adhyay 97 (nakshatra), 98 (tithi) aur 99 (karan) ke niyam lagata hai, varjit din hata deta hai, aur aapki Tara bala aur Chandra bala jodta hai. Nateeje mein tareekh ke saath us din ka shubh samay bhi milta hai.",
  },
  {
    q: "Kya ye muhurat mere liye alag hoga?",
    a: "Haan. Panchang sabke liye ek hota hai, par Tara bala aapke janm-nakshatra se aur Chandra bala aapki raashi se banti hai. Isliye do logon ko ek hi mahine ki alag tareekhein milti hain.",
  },
  {
    q: "Shreshth, achha aur theek mein kya farak hai?",
    a: "Shreshth mein nakshatra, tithi aur karan teeno granth ke anusar hain — sabse prabal din. Achha mein nakshatra ke saath tithi ya karan. Theek mein nakshatra sahi hai aur koi varjit nahi, par tithi-karan alag. Jitne zyada niyam baithe, phal utna gehra.",
  },
  {
    q: "Muft mein kitni tareekhein milti hain?",
    a: "Agle 3 mahine se chuni hui 6 tareekhein — 1 shreshth, 2 achhi aur 3 theek — har ek par shubh samay ke saath. Agar aapki kundali par 3 mahine mein koi shreshth din nahi hai to 5 dikhengi; hum banawti BEST nahi banate.",
  },
  {
    q: "Rs 51 mein kya milta hai?",
    a: "Poore 12 mahine ki saari shubh tareekhein — aam taur par 50 se 60 — har tareekh par samay, aur aapke kaam ke hisaab se graha-shanti ke upay. Ek baar ka bhugtaan, Razorpay se, turant khul jaata hai.",
  },
  {
    q: "Kaam ka shehar kyun poochha jaata hai?",
    a: "Kyunki shubh samay suryoday se banta hai aur suryoday har shehar mein alag hota hai. Delhi aur Pune ke samay mein aksar 10-15 minute ka farak aata hai. Na bharein to janm-sthan hi maan liya jaata hai.",
  },
  {
    q: "Bhadra ya Rikta tithi wale din kyun nahi dikhte?",
    a: "Kyunki granth mana karta hai. Brihat Samhita 99.4 saaf kehta hai ki Vishti (Bhadra) mein kiya kuch shubh nahi hota, aur 97.13 Rikta tithi par naya kaam nahi karne deta. Ye niyam har kaam par lagte hain.",
  },
  {
    q: "Janm samay nahi pata to?",
    a: "Form mein 'samay nahi pata' chun lijiye — dopahar 12 baje maan liya jayega. Nateeja tab bhi granth ke niyam par aayega; sirf Chandra-aadhaarit jaanch mein thodi dhundhlaahat rahegi.",
  },
  {
    q: "Kya ye griha pravesh aur vivah dono ke liye chalta hai?",
    a: "Haan, aur 38 doosre kaam ke liye bhi — sagai, property registry, vahan kharid, business, exam form, mundan, namkaran, yatra, puja aur zyada. Har kaam ka apna nakshatra-varg, tithi aur karan granth se aata hai.",
  },
  {
    q: "Surgery ya court case ki tareekh bhi milti hai?",
    a: "Milti hai, par do saaf chetavni ke saath. Surgery mein doctor ki salaah sabse pehle aur hum sirf unhin tareekhon mein se chunte hain jo doctor ne di hain. Court case par hum nateeja nahi batate. Dono niyam parampara ke hain, Brihat Samhita ke nahi.",
  },
  {
    q: "Chaturmas aur Kharmas ka dhyan rakha jaata hai?",
    a: "Ye dono parampara ke niyam hain, granth ke nahi. Hamare niyam-kosh mein wo 'parampara' label ke saath darj hain aur sirf vivah tatha griha pravesh par lagte hain. Jahan lagte hain, report mein wahi label dikhta hai.",
  },
  {
    q: "Kya muhurat dekhna zaroori hai?",
    a: "Nahi. Muhurat ek paramparagat sahara hai, anivarya niyam nahi. Jo din hamari soochi mein nahi hai wo 'ashubh' nahi hai — bas sabse achha nahi hai. Hum dar nahi bechte.",
  },
  {
    q: "Ye tareekhein kis granth se aati hain?",
    a: "Brihat Samhita se — Varahamihira ka granth, lagbhag 1,500 saal purana. Adhyay 97 nakshatron ke varg deta hai, 98 tithi ke, 99 karan ke. Har wajah ke saath uska shlok report mein likha aata hai.",
  },
  {
    q: "Abhijit muhurat kya hai aur wo kyun dikhta hai?",
    a: "Abhijit dopahar ke aas-paas ka lagbhag 48 minute hai, jise parampara lagbhag har kaam ke liye shubh maanti hai. Hum use tabhi dikhate hain jab us samay Rahu Kaal ya Yamaganda na pade.",
  },
  {
    q: "Raat ka muhurat bhi milta hai? Vivah to raat ko hota hai.",
    a: "Haan. Raat ki khidkiyan 🌙 ke nishan ke saath aati hain. Raat tak tithi aur karan aksar badal jaate hain, isliye hum raat ka panchang alag se nikalte hain aur uspar bhi wahi granth ke niyam lagate hain — tabhi raat ka samay dikhta hai. Raat ke Rahu Kaal, Yamaganda aur Gulika bhi kaate jaate hain.",
  },
  {
    q: "Kisi khaas mahine ki tareekhein chahiye to?",
    a: "Form mein date range daal dijiye — soochi usi seema ki aayegi. Khaali chhodenge to aaj se agle 3 mahine (paid mein 12) ki tareekhein aayengi.",
  },
  {
    q: "Kya ye bhavishyavani hai?",
    a: "Nahi. Muhurat shuruaat ka samay chunne ki vidya hai, aage kya hoga ye batane ki nahi. Hum sirf itna kehte hain ki granth ke niyam se ye din aur ye samay shubh hai.",
  },
];

const COMPARE: { f: string; tv: string; as: string }[] = [
  { f: "Tareekh kahan se", tv: "Brihat Samhita 97-99, har niyam par shlok", as: "panchang se; niyam ka hawala nahi" },
  { f: "Aapki kundali", tv: "Tara bala + Chandra bala lagti hai", as: "sabke liye ek hi soochi" },
  { f: "Darja", tv: "Shreshth / Achha / Theek — kitna prabal, saaf", as: "sab tareekhein barabar dikhti hain" },
  { f: "Samay", tv: "Har tareekh par khidkiyan, Rahu-Yamaganda-Gulika hata kar", as: "aksar sirf tareekh" },
  { f: "Jo granth mein nahi", tv: "\"parampara\" likha aata hai", as: "sab ek jaisa dikhaya jaata hai" },
  { f: "Kaam", tv: "40 kaam, dropdown se", as: "aksar 5-8 kaam" },
  { f: "Kaam ka shehar", tv: "Alag shehar ka samay", as: "ek hi shehar ka" },
  { f: "Keemat", tv: "3 mahine muft, 12 mahine Rs 51", as: "muft ya mehnga dono" },
];

export default function FreeShubhMuhuratCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-shubh-muhurat-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Shubh Muhurat Calculator by Date of Birth — शुभ मुहूर्त',
    description:
      'Shubh muhurat calculator by date of birth. Auspicious dates AND times for 40 kinds of work — marriage, griha pravesh, vehicle purchase, business, exam forms, child samskaras — from the rules of Varahamihira\'s Brihat Samhita ch.97 (nakshatra classes), ch.98 (tithi) and ch.99 (karana), with Tara bala and Chandra bala from the person\'s own chart. Rikta tithi, Vishti (Bhadra), Amavasya, Vyatipata and Vaidhriti are always excluded. Free for three months.',
    breadcrumbName: 'Shubh Muhurat Calculator',
    aboutEntities: [
      'Muhurta', 'Nakshatra', 'Tithi', 'Karana', 'Panchang', 'Abhijit Muhurta',
      'Rahu Kaal', 'Tara Bala', 'Chandra Bala', 'Brihat Samhita', 'Varahamihira',
    ],
    knowsAbout: [
      'Vedic Astrology', 'Jyotish Shastra', 'Muhurta Shastra', 'Brihat Samhita 97',
      'Brihat Samhita 98', 'Brihat Samhita 99', 'Shubh Muhurat by Date of Birth',
      'Griha Pravesh Muhurat', 'Vivah Muhurat', 'Vehicle Purchase Muhurat',
    ],
    howToName: 'How to find a shubh muhurat from your date of birth',
    howToSteps: [
      { name: 'Choose the work', text: 'Pick from 40 kinds of work — marriage, griha pravesh, vehicle purchase, business, exam form, mundan and more. Each carries its own rule set from Brihat Samhita.' },
      { name: 'Enter birth details and the place of the event', text: 'Date, time and place of birth, plus the city where the work will happen — the auspicious time is built from sunrise, which changes with the city.' },
      { name: 'Read the dates with their windows', text: 'Each date carries a grade (Shreshth, Achha, Theek), the time windows with Rahu Kaal removed, and the verse behind every reason. Rules not found in the grantha are labelled parampara.' },
    ],
    faqs: FAQS,
    dateModified: '2026-09-23',
  });

  const ALL = PILLAR;

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
            <span style={{ color: '#94a3b8' }}>Shubh Muhurat Calculator</span>
          </nav>

          {/* ── HERO ─────────────────────────────────────────────────── */}
          <header className="rounded-2xl p-5 md:p-7 mb-8"
            style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-3" style={{ color: GOLD }}>
              Shubh Muhurat Calculator — शुभ मुहूर्त अपनी कुंडली से
            </h1>

            {/* 40-60 shabd ka seedha jawab — GEO ke liye */}
            <p className="text-slate-300 leading-relaxed mb-4">
              Shubh muhurat aapki janm-tithi se nikalta hai, kisi aam soochi se nahi. Ye calculator
              Brihat Samhita adhyay 97-99 ke niyam har aane wale din par lagata hai aur wo tareekhein
              deta hai jo aapke janm-nakshatra ke anukool hon — <strong style={{ color: GOLD }}>tareekh ke
              saath us din ka shubh samay bhi</strong>. 40 kaam, 3 mahine muft.
            </p>

            <div className="flex flex-wrap gap-2 text-xs mb-4">
              {['40 kaam ka muhurat', 'Tareekh + samay dono', 'Har niyam par shlok',
                'Aapki kundali se', '3 mahine muft'].map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full"
                  style={{ background: GOLD_RGBA(0.1), border: `1px solid ${GOLD_RGBA(0.3)}`, color: '#E9C862' }}>
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: GOLD_RGBA(0.15), color: GOLD, border: `1px solid ${GOLD_RGBA(0.4)}` }}>RG</div>
              <div className="text-xs text-slate-400">
                <Link href="/founder" className="font-semibold hover:underline" style={{ color: '#cbd5e1' }}>Rohiit Gupta</Link>
                <div>Chief Vedic Architect · Trikaal Vaani</div>
                <div className="mt-0.5">Engine: Swiss Ephemeris · Lahiri Ayanamsha · Brihat Samhita 97-99</div>
              </div>
            </div>
          </header>

          {/* ── CALCULATOR ───────────────────────────────────────────── */}
          <MuhuratCalculator />

          {/* ── TOC ──────────────────────────────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-16 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {ALL.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>{s.h2}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── 46 keyword-H2 sections ───────────────────────────────── */}
          <section className="mt-12">
            {ALL.map((s, si) => (
              <div key={s.id} id={s.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{s.h2}</h2>
                {s.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">{renderRich(p, `s${si}-p${pi}`)}</p>
                ))}
              </div>
            ))}
          </section>

          {/* ── TULNA ────────────────────────────────────────────────── */}
          <section className="mt-4">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>
              Trikaal Vaani vs aam muhurat soochiyan
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Hum kisi se muqabla nahi kar rahe — <strong style={{ color: GOLD }}>hamari zameen granth hai</strong>.
              Har muhurat ke saath uska shlok likha hota hai, aur jo baat granth mein nahi hai uspar saaf
              &ldquo;parampara&rdquo; likhte hain. Aur jo tareekh granth ke jitne zyada niyamon par khari utarti hai,
              uska phal utna hi gehra hota hai — isliye hum darja chhupate nahi.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <caption className="sr-only">Muhurat soochiyon ki tulna</caption>
                <thead>
                  <tr style={{ background: GOLD_RGBA(0.1) }}>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Kya</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Aam muhurat soochi</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {COMPARE.map((c) => (
                    <tr key={c.f} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3 font-semibold">{c.f}</td>
                      <td className="p-3">{c.tv}</td>
                      <td className="p-3">{c.as}</td>
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
              Aksar puche jaane wale sawaal — Shubh Muhurat
            </h2>
            {FAQS.map((f, i) => (
              <details key={i} className="mb-3 rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <summary className="cursor-pointer font-semibold text-slate-200">{f.q}</summary>
                <p className="mt-3 text-slate-300 leading-relaxed text-sm">{f.a}</p>
              </details>
            ))}
          </section>

          {/* ── ANT KA CTA ───────────────────────────────────────────── */}
          <section className="rounded-2xl p-6 mb-8 text-center"
            style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.3)}` }}>
            <h2 className="text-2xl font-serif font-bold mb-3" style={{ color: GOLD }}>
              Apne kaam ka shubh muhurat abhi dekhiye
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              40 kaam, aapki kundali se chuni hui tareekhein, har tareekh par shubh samay aur
              har niyam ke saath uska shlok. Agle 3 mahine ki soochi muft — koi login nahi.
            </p>
            <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-block px-6 py-3 rounded-xl font-bold"
              style={{ background: GOLD, color: '#2a2118' }}>
              ऊपर जाकर मुहूर्त देखें
            </a>
          </section>

          {/* ── ANDAR KE LINK ────────────────────────────────────────── */}
          <section className="mb-4">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: '/calculators/free-shadi-kab-hogi-calculator', t: 'Shadi Kab Hogi Calculator' },
                { href: '/calculators/free-life-span-calculator', t: 'Life Span Calculator' },
                { href: '/calculators/free-health-prediction-calculator', t: 'Health Prediction Calculator' },
                { href: '/calculators/free-sade-sati-calculator', t: 'Sade Sati Calculator' },
                { href: '/panchang', t: 'Aaj ka Panchang' },
                { href: '/kundali-milan', t: 'Kundali Milan — 36 Guna' },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-xl p-4 hover:opacity-90 transition"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#cbd5e1' }}>
                  {l.t}
                </Link>
              ))}
            </div>
          </section>

          <p className="text-xs text-slate-500 leading-relaxed mt-8">
            Niyam Brihat Samhita (Varahamihira) adhyay 97, 98 aur 99 se; ganana Swiss Ephemeris aur
            Lahiri ayanamsha par. Jo niyam granth mein nahi hai — Rahu Kaal, Tara bala, Chandra bala,
            Abhijit, Kharmas aur Chaturmas — uspar &ldquo;parampara&rdquo; likha jaata hai. Ye shubh samay ka
            chunav hai, bhavishyavani nahi. Sehat se jude kisi bhi faisle mein doctor ki salaah,
            aur kanooni maamle mein vakeel ki salaah sabse pehle.
          </p>

        </div>
      </main>
    </>
  );
}
