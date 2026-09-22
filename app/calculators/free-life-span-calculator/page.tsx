'use client';

// ============================================================
// File: app/calculators/free-life-span-calculator/page.tsx
// Version: v1.0 — Life Span (Ayushya) Calculator — 22 Sep 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// API: /api/calc/yog (type: 'life-span') · Engine: lib/life-span-engine.ts
//      (ADAPTER — band VM ke granth_api v4.1 aayushya() se, EK jagah)
//
// ROHIIT KE FAISLE (22 Sep 2026, work_log 75-82):
//   * SABSE UPAR: "Ye granth ka classical anumaan hai, nishchit bhavishya nahi —
//     upay aur samay se badalta hai"
//   * Band BPHS 43.33-40 teen jode + kakshya 43.47-50 ("do as per granth")
//   * KOI SCORE / NUMBER NAHI · saal / death date KABHI NAHI
//   * Bracket saral: Deerghayu (lambi umar) · Madhyayu (ausat umar) · Alpayu
//     (sehat aur upay par zyada dhyan chahiye)
//   * 20 se kam = band nahi (BPHS 44.12-13) · beete maraka daur bhi · POORA MUFT
//   * Slug/title/meta Rohiit ka chunav (Google: "life span calculator by date of birth")
//
// CONTENT: 42 H2 · 45 inline link (42 alag, sab ASLI — blog_posts/seo_pillar_pages
//   DB mein jaanche, calculator folder maujood, live 200) · ~4300 shabd · 8 FAQ.
// Dhaancha free-health-prediction-calculator/page.tsx se — render code wahi.
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

// Har heading asli search phrase par — Google (life span calculator by date of
// birth, longevity, which dasha gives death) aur BPHS 43-44. Har link jaancha hua.
const PILLAR: PillarSection[] = [
  {
    id: "life-span-calculator-by-date-of-birth",
    h2: "Life Span Calculator by Date of Birth — ye kaise kaam karta hai",
    paras: [
      "Ye calculator aapki **janm-tithi, samay aur sthan** se Swiss Ephemeris par kundali banata hai aur Parashar ke **Brihat Parashara Hora Shastra, adhyay 43 (aayurdaya)** ke niyam se aapki aayu ki shreni nikalta hai — **Alpayu, Madhyayu ya Deerghayu**. Koi saal, koi umar ka number aur koi tareekh nahi.",
      "Nateeje mein chaar cheezein milti hain: band aur uska saral arth, teen jodon ki table jisse band bana, **maraka — saavdhaani ke daur** (BPHS adhyay 44) aur graha-shanti ke upay. Sab kuch muft. Vishay ki poori jaankari hamare [Longevity aur Vitality guide](/learn/longevity-life-span-prediction) mein bhi hai.",
      "Sabse zaroori baat pehle: **ye granth ka classical anumaan hai, nishchit bhavishya nahi — upay aur samay se badalta hai.** Parashar khud BPHS 43.2 mein kehte hain ki aayu ka gyaan devtaon ke liye bhi kathin hai.",
      "Calculator teen sawaalon ka jawab deta hai: granth ke hisaab se aayu kis shreni mein hai, kaunse daur mein sehat par vishesh dhyan chahiye, aur kaunse grah ki shanti karni hai. Teeno jawab ek hi kundali se, ek hi engine par, har baar ek jaise — kyunki koi AI yahan kuch nahi likhta.",
    ],
  },
  {
    id: "bphs-ayurdaya-kya-hai",
    h2: "Ayurdaya kya hai? — BPHS adhyay 43 ka aayu-adhyay",
    paras: [
      "**Ayurdaya** yani aayu ka hisaab. BPHS ka 43va adhyay (sanskritdocuments e-text ki ginti) poora isi par hai — 78 shlok. Isme Parashar aayu jaanne ke kai tareeke dete hain aur saaf kehte hain ki ye vishay kathin hai (43.2-3).",
      "Hamara calculator in mein se wo tareeka leta hai jo **bina kisi apne ank ke** chalta hai — teen jodon ka niyam (43.33-40). Isme ganit hamari pasand ka nahi, seedha shlok ka hai. Dasha ki paddhati samajhni ho to [Mahadasha Explained](/learn/mahadasha-explained) padhiye.",
      "Adhyay 43 ka aakhri hissa (43.59-78) yogon ki soochi hai — kaunsi graha-sthiti poorna aayu deti hai aur kaunsi dhyan dilati hai. Adhyay 44 maraka ka hai — kaunsa grah kab kasht de sakta hai. Calculator in teeno hisson ko ek saath jodta hai, aur har hisse ke saath uska shlok likhta hai.",
    ],
  },
  {
    id: "alpayu-madhyayu-deerghayu",
    h2: "Alpayu, Madhyayu, Deerghayu — nateeja kaise padhein",
    paras: [
      "Teen shreniyan hain aur har ek ke saath saral shabd: **Deerghayu (lambi umar)**, **Madhyayu (ausat umar)** aur **Alpayu (sehat aur upay par zyada dhyan chahiye)**. Alpayu ke saath hum jaan-boojh kar \"kam umar\" nahi likhte — granth khud kehta hai ki achhe yog aur upay aayu badhate hain (43.59).",
      "400 kundaliyon par naap mein lagbhag 27% Deerghayu, 35% Madhyayu aur 38% Alpayu aaye. Yani Alpayu aana asaadharan nahi — ye bas batata hai ki sehat ko halke mein na lein. Sehat ka alag hisaab [Health Prediction Calculator](/calculators/free-health-prediction-calculator) deta hai.",
      "Band ko ek line ki bhavishyavani na samjhein. Iske saath sahara dene wale yog aur maraka ke daur bhi dikhte hain — poori tasveer inhe milakar banti hai.",
    ],
  },
  {
    id: "teen-jode-ka-niyam",
    h2: "Teen jode ka niyam — BPHS 43.33-40",
    paras: [
      "Parashar teen jode dekhne ko kehte hain: **(1) lagnesh aur 8vesh**, **(2) Shani aur Chandra**, **(3) lagna aur hora lagna**. Har jode ki dono raashiyon ka prakar dekha jaata hai.",
      "Niyam (43.36-38): dono **char** raashi mein, ya ek **sthir** aur ek **dvisvabhav** — Deergha. Ek char aur ek sthir, ya dono dvisvabhav — Madhya. Ek char aur ek dvisvabhav, ya dono sthir — Alpa. Teen mein se jo do ya teen jode kahen, wahi faisla (43.39).",
      "Calculator har jode ki raashi aur uska prakar table mein dikhata hai, aur ✓ laga deta hai ki kaunse jode faisle mein gine gaye. Koi chhupa formula nahi.",
      "Ye tareeka isliye bhi achha hai ki isme grah ki degree ya bal ke chhote-chhote farak nahi aate — sirf raashi ka prakar. Yani ek hi janm-samay par do alag software lagbhag hamesha ek hi jawab denge, jab tak lagna aur hora lagna na badlein.",
    ],
  },
  {
    id: "char-sthir-dvisvabhav",
    h2: "Char, sthir aur dvisvabhav raashi — aayu mein kyun zaroori",
    paras: [
      "Barah raashiyan teen prakar ki hain. **Char:** Mesh, Kark, Tula, Makar. **Sthir:** Vrishabh, Simha, Vrischik, Kumbh. **Dvisvabhav:** Mithun, Kanya, Dhanu, Meen. Apni raashi jaanne ke liye [Rashi Calculator](/calculators/free-rashi-calculator) aur lagna ke liye [Lagna Calculator](/calculators/free-lagna-calculator) muft hain.",
      "Aayu ke niyam mein raashi ka ye prakar hi sab kuch tay karta hai — grah ka bal ya ank nahi. Isliye ye tareeka seedha aur jaancha ja sakne wala hai.",
    ],
  },
  {
    id: "lagnesh-ashtamesh",
    h2: "Lagnesh aur 8vesh — pehla jodi",
    paras: [
      "Lagnesh sharir ka swami hai aur 8vesh aayu-bhav ka. Dono kis prakar ki raashi mein baithe hain, ye pehla jodi batata hai. Lagnesh ki sthiti ka bal [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) se alag se bhi dekh sakte hain.",
      "Mesh aur Tula lagna par ek khaas baat hai: yahan lagnesh aur 8vesh **ek hi grah** hote hain (Mangal aur Shukra). Tab pehla jodi us ek grah ki raashi par tika rehta hai. Granth is par alag se kuch nahi kehta, isliye niyam jaisa hai waisa rakha gaya hai.",
    ],
  },
  {
    id: "shani-chandra-jodi",
    h2: "Shani aur Chandra — doosra jodi",
    paras: [
      "Doosre jode mein Shani aur Chandra ki raashiyan dekhi jaati hain. Shani ko parampara mein aayushkaraka maana jaata hai, aur Chandra mann aur deh ka.",
      "Jab teeno jode alag-alag jawab dein aur Chandra lagna ya 7ve ghar mein ho, to granth (43.40) isi Shani-Chandra jode ka jawab maanta hai. Shani ki apni kundali mein haalat samajhni ho to [Shani Mahadasha](/blog/shani-mahadasha-effects-guide) padhiye.",
    ],
  },
  {
    id: "hora-lagna-kya-hai",
    h2: "Hora lagna kya hai? — BPHS 5.4-5",
    paras: [
      "**Hora lagna** ek vishesh lagna hai jo suryoday se har **2.5 ghati (lagbhag ek ghanta)** mein ek raashi aage badhta hai. BPHS 5.5 ka niyam: janm tak ke ghati ko do se guna karke paanch se bhaag do, aur utni raashi suryoday ke Surya mein jodo.",
      "Isliye calculator pehle aapke janm-sthan ka suryoday nikalta hai. Suryoday se pehle ka janm Vedic din ke hisaab se pichhle din ka maana jaata hai. Teesra jodi aapke janm-lagna aur isi hora lagna se banta hai — isliye janm-samay sahi hona bahut zaroori hai.",
      "Ek udaharan se samjhein: suryoday ke waqt Surya Kanya mein tha aur janm suryoday ke 10 ghante baad hua. Har ghante ek raashi — to hora lagna Kanya se das raashi aage, yani Kark. Calculator ye ganit minute tak karta hai, aur hora lagna ki raashi result card mein bhi dikhata hai.",
    ],
  },
  {
    id: "teeno-jode-alag",
    h2: "Jab teeno jode alag jawab dein — granth ka faisla",
    paras: [
      "Kabhi teeno jode Alpa, Madhya aur Deergha — teen alag baatein kehte hain. Tab BPHS 43.39 lagna aur hora lagna wale jode ko pramukh maanta hai, aur 43.40 kehta hai ki Chandra lagna ya 7ve mein ho to Shani-Chandra jodi.",
      "400 kundaliyon mein lagbhag 79% mein do ya teen jode khud ek jawab dete hain. Baaki mein yahi 43.39-40 ka niyam lagta hai, aur report mein saaf likha aata hai ki kaunsa niyam laga.",
    ],
  },
  {
    id: "kakshya-vriddhi-hrasa",
    h2: "Kakshya vriddhi aur hrasa — band ek upar ya neeche",
    paras: [
      "BPHS 43.47-50 ek aur niyam deta hai: agar faisla dene wale jode mein **Shani** ho, to band **ek shreni neeche** — par Shani apni ya uchcha raashi mein ho, ya us par sirf paap grahon ka sambandh ho, to nahi. Aur **Guru** lagna ya 7ve mein sirf shubh grahon ke saath ho, ya khud faisla dene wale jode mein ho, to band **ek shreni upar**.",
      "Calculator ye niyam granth jaisa lagata hai aur saaf batata hai: \"Deerghayu → Madhyayu, kyunki...\". Alpayu se neeche ki koi shreni hum nahi dikhate, aur Deerghayu se upar hone par granth ka vachan (43.49) likha aata hai.",
      "400 kundaliyon mein ye niyam lagbhag teen mein se ek kundali par lagta hai — zyadatar band ko ek neeche karta hai, kuch par upar. Isi wajah se kakshya ke baad Alpayu ka hissa badhta hai. Hum ise chhupate nahi — report mein \"pehle kya tha, ab kya hai, aur kyun\" teeno likha aata hai.",
    ],
  },
  {
    id: "shani-aur-aayu",
    h2: "Shani aur aayu — kya Shani hamesha umar ghatata hai?",
    paras: [
      "Nahi. Shani ka band neeche karna sirf ek khaas sthiti mein hai — jab wo faisla dene wale jode mein ho aur apni ya uchcha raashi mein na ho. Apni raashi (Makar, Kumbh) ya uchcha (Tula) mein Shani band nahi ghatata.",
      "Shani ko har baat par dosh dena galat hai. Sade Sati ke dar par [Kya Sade Sati hamesha buri hai](/blog/is-sade-sati-always-bad) padhiye, aur apni chal rahi sade sati [Sade Sati Calculator](/calculators/free-sade-sati-calculator) se jaaniye.",
    ],
  },
  {
    id: "guru-aur-aayu",
    h2: "Guru lagna ya 7ve mein — aayu ka sahara",
    paras: [
      "Guru shubh grah hai. Lagna ya 7ve ghar mein, sirf shubh grahon ke saath ho to granth band ek shreni upar karta hai (43.48). Ye sahi mayne mein aayu ka sahara hai.",
      "Guru ki bhoomika vistaar se [Guru Mahadasha](/blog/guru-mahadasha-wisdom-growth) mein hai. Guru ka ratna Pukhraj pehnna ho to pehle [Should I Wear Pukhraj](/calculators/free-should-i-wear-pukhraj) se jaanchiye.",
    ],
  },
  {
    id: "8th-house-aayu-bhav",
    h2: "8th house aur aayu — aathva bhav kya batata hai",
    paras: [
      "Aathva bhav **aayu-bhav** hai. 8vesh ki raashi pehle jode mein aati hai, aur 8ve ghar ki haalat maraka ke niyamon mein bhi dekhi jaati hai.",
      "8ve ghar se jude doosre vishay — jaise pitra dosh — [8th house pitra dosh](/blog/pitra-dosh-in-8th-house) aur [Mangal 8ve ghar mein](/blog/mangal-dosh-8th-house-effects) mein samjhaye gaye hain. 8ve aur 12ve ghar ka karmic arth [yahan](/blog/past-life-karmic-bond-8th-12th-house-astrology) hai.",
    ],
  },
  {
    id: "3rd-house-aayu-sthan",
    h2: "3ra bhav bhi aayu-sthan kyun? — BPHS 44.2",
    paras: [
      "BPHS 44.2 kehta hai: **3ra aur 8va — dono aayu ke sthan** hain. In dono se 12ve ghar, yani 2ra aur 7va, **maraka sthan** kehlaate hain. Isliye calculator 8ve ke saath 3re ghar ko bhi aayu ka ghar maanta hai.",
      "Yahi wajah hai ki maraka ke niyam 2re aur 7ve ghar se shuru hote hain — ye aayu-sthanon ka vyaya (kharch) hain.",
    ],
  },
  {
    id: "sarala-yoga-aur-health",
    h2: "Sarala yoga aur Health calculator — dono ka mel",
    paras: [
      "Phaladipika adhyay 6 ke anusar 8vesh 6, 8 ya 12 mein ho to **Sarala yoga** banta hai — deerghayu aur nidarta ka yog. Hamare [Health Prediction Calculator](/calculators/free-health-prediction-calculator) mein ye 10 ank deta hai.",
      "Is calculator mein Sarala yoga band nahi badalta — ye \"sahara dene wale yog\" mein dikhta hai. Kyunki band teen jodon se banta hai aur Sarala ek alag yog hai. Dono ko saath padhein, takraav na samjhein — BPHS 43.59 bhi kehta hai ki achhe yog aayu badhate hain.",
    ],
  },
  {
    id: "poorna-aayu-ke-yog",
    h2: "Poorna aayu ke yog — BPHS 43.60-65",
    paras: [
      "Granth kuch yog ginata hai jo poorna ya deergha aayu dete hain. Jaise **43.60**: kendra mein shubh grah hon aur lagnesh shubh ke saath ya Guru ki drishti mein ho. **43.61**: lagnesh kendra mein Guru ya Shukra ke saath. **43.65**: paap grah 3, 6, 11 mein aur shubh kendra-trikon mein, lagnesh balwaan.",
      "Aapki kundali par jo yog sach mein lagte hain, sirf wahi report mein aate hain, shlok ke hawale ke saath. Granth ke yog-niyamon ka aam roop [Raj Yoga](/learn/raj-yoga) jaise pannon par bhi dekh sakte hain.",
    ],
  },
  {
    id: "aayu-par-dhyan-ke-yog",
    h2: "Aayu par dhyan ke yog — BPHS 43.75-78",
    paras: [
      "Kuch yog aayu par dhyan dilate hain. **43.75**: lagnesh 6, 8 ya 12 mein paap grah ke saath aur shubh drishti ke bina. **43.78**: lagnesh aur 8vesh dono dusthana mein aur kamzor.",
      "Ye yog dikhein to ghabraiye nahi — inka arth hai sehat par niyamit dhyan aur upay. Kamzor grah kaunsa hai, ye [Weak Planet Finder](/calculators/free-weak-planet-finder) se dekhiye.",
    ],
  },
  {
    id: "maraka-kya-hai",
    h2: "Maraka kya hai? — BPHS adhyay 44",
    paras: [
      "**Maraka** wo grah hain jinki dasha mein granth kasht ki sambhavna batata hai. BPHS 44.3-4: 2re aur 7ve ke swami, in gharon mein baithe paap grah, aur inke swami ke saath baithe paap grah — sab maraka hain. 2ra ghar 7ve se zyada balwaan hai (44.3).",
      "Hamari report maraka grah ka naam, mukhya maraka aur unke daur ki tareekhein deti hai — shabd **\"saavdhaani ka samay\"** ke saath, dar wale shabdon ke bina.",
      "Ek baat saaf karein: maraka grah hona \"bura grah\" hona nahi hai. Wahi grah kundali mein dhan, vivah ya career ka sahara bhi ho sakta hai. Maraka ka arth sirf itna hai ki uske kuch khaas daur mein sehat ka dhyan rakhna hai.",
    ],
  },
  {
    id: "which-dasha-gives-death",
    h2: "Which dasha gives death? — granth ka seedha jawab",
    paras: [
      "Log poochhte hain ki kaun si dasha mrityu deti hai. Granth maraka grahon ki dasha ki baat karta hai, par saath hi kehta hai (44.20-21) ki kai balwaan maraka hon to un daur mein **rog-kasht** hota hai, aur mukhya maraka apni haalat ke hisaab se **kasht ya mrityu** deta hai — yani har maraka daur mrityu nahi.",
      "Isliye hum ise mrityu ka samay nahi, **sehat par dhyan ka samay** kehte hain. Apni chal rahi dasha jaanne ke liye [Dasha Calculator](/calculators/free-dasha-calculator) chalaiye.",
      "Granth ke is niyam ko samajhne ka sahi tareeka hai — maraka daur mein dincharya theek rakhein, niyamit jaanch karayein, aur us grah ki shanti karein. Yahi granth ka apna sujhav hai: adhyay 44 kasht ki baat karta hai, aur graha-shanti adhyay usi kasht ka upay.",
    ],
  },
  {
    id: "2nd-7th-maraka",
    h2: "2nd aur 7th house maraka kyun?",
    paras: [
      "Kyunki ye aayu-sthan (3 aur 8) ke 12ve ghar hain — BPHS 44.2. Jyotish mein kisi ghar se 12va ghar uska vyaya maana jaata hai.",
      "7va ghar vivah ka bhi hai, isliye log ghabra jaate hain. Par maraka ka arth vivah se nahi judta. 7ve ghar ke doosre arth [7va ghar kamzor](/blog/7th-house-weak-marriage-delay-reasons) aur [Mangal 7ve ghar mein](/blog/mangal-dosh-7th-house-effects) mein hain.",
    ],
  },
  {
    id: "shubh-antardasha-niyam",
    h2: "Maraka shubh antardasha mein asar nahi karta — BPHS 44.8",
    paras: [
      "Ye granth ka sabse raahat wala niyam hai: **maraka grah shubh grah ki antardasha mein maarta nahi; paap grah ki antardasha mein bina sambandh bhi asar karta hai** (44.8).",
      "Isliye calculator har maraka mahadasha nahi dikhata — sirf wo daur jinmein antardasha paap grah (Surya, Mangal, Shani, Rahu, Ketu) ki ho aur mahadasha ya antardasha maraka ho. Isse soochi chhoti aur arthpoorn rehti hai.",
      "Udaharan: Guru maraka ho aur Guru ki mahadasha chal rahi ho, par andar Shukra ki antardasha ho — to 44.8 ke hisaab se wo samay maraka ka nahi. Wahi Guru mahadasha mein Shani ki antardasha aaye, to wo saavdhaani ka daur hai. Isliye tareekhein antardasha tak di jaati hain.",
    ],
  },
  {
    id: "shani-maraka",
    h2: "Shani maraka ke saath — BPHS 44.9",
    paras: [
      "BPHS 44.9: agar Shani maraka grahon se juda ho, to wo baaki sab ko peechhe chhod kar pramukh ban jaata hai. Isliye aisi kundali mein calculator Shani ko mukhya maraka dikhata hai; warna 2re ghar ka swami (44.3).",
      "Shani ki dasha ke saamanya asar [Shani Mahadasha](/blog/shani-mahadasha-effects-guide) mein samjhaye gaye hain.",
    ],
  },
  {
    id: "rahu-ketu-maraka",
    h2: "Rahu-Ketu kab maraka bante hain — BPHS 44.22",
    paras: [
      "44.22 ke anusar Rahu ya Ketu lagna, 7ve, 8ve ya 12ve ghar mein hon, ya maraka-swami ke saath hon, to wo bhi maraka hain aur apni dasha-antardasha mein asar dete hain.",
      "Rahu 6, 8, 12 mein ho to uski dasha kasht deti hai — par shubh grah ka saath ya drishti ho to nahi (44.24). Rahu-Ketu ko samajhne ke liye [Rahu kya hai](/blog/what-is-rahu), [Ketu kya hai](/blog/what-is-ketu) aur [Rahu Mahadasha](/blog/rahu-mahadasha-effects-guide) padhiye.",
    ],
  },
  {
    id: "beete-maraka-daur",
    h2: "Beete maraka daur kyun dikhate hain",
    paras: [
      "Report mein beete hue do maraka daur bhi dikhte hain. Agar un samay sehat par sach mein dabaav raha tha, to aap khud parakh sakte hain ki granth aapki kundali par kitna baitha — bharosa andhvishwas se nahi, jaanch se banta hai.",
      "Aane wale daur ka arth **jaanch ka samay** hai — us samay niyamit check-up aur upay. Rahu ki antardasha ke saamanya lakshan [yahan](/blog/rahu-antardasha-confusion-symptoms) hain.",
    ],
  },
  {
    id: "20-saal-se-kam",
    h2: "20 saal se kam umar — BPHS 44.12",
    paras: [
      "Granth saaf kehta hai: **20 varsh tak aayu jaani nahi ja sakti** (44.12). Is umar tak bachche ki raksha jaap, hom aur **chikitsa** se karni chahiye (44.13).",
      "Isliye 20 se kam umar par calculator koi band ya maraka nahi dikhata — sirf ye granth-vachan aur bal-raksha ki baat. Bachche ki sehat mein doctor sabse pehle. Bachchon ki kundali ke doosre sawaal [Santan Yog Calculator](/calculators/free-santan-yog-calculator) jaise pannon par milte hain.",
      "Granth yahan kaaran bhi deta hai: bachpan mein kasht pita ke dosh, mata ke grah ya bachche ke apne arisht yog se ho sakta hai (44.13-14). Is umar mein kundali se zyada bachche ki dekhbhaal aur doctor ki salaah maayne rakhti hai — granth khud \"chikitsa\" shabd likhta hai.",
    ],
  },
  {
    id: "death-date-nahi",
    h2: "Kya ye death date batata hai? — Nahi, aur kyun",
    paras: [
      "Internet par \"death calculator\" aur \"death date by date of birth\" bahut dhoondhe jaate hain. Ye calculator **death date kabhi nahi batata** — na saal, na umar ka number, na tareekh.",
      "Wajah seedhi hai: granth khud aayu ko kathin vishay kehta hai (43.2), aur ek number kisi ke mann mein dar baitha sakta hai jo sach bhi nahi. Granth mein mrityu ke nakshatra, kaaran aur sthan ke niyam bhi hain (44.15-45) — hum unhe jaan-boojh kar nahi dikhate.",
      "Doosre tools \"aap itne saal jiyenge\" likh dete hain. Hamari nazar mein ye na granth ke saath imaandari hai, na grahak ke saath. Hum wahi batate hain jo granth pakke taur par kehta hai — shreni, daur aur upay.",
    ],
  },
  {
    id: "life-expectancy-vs-ayushya",
    h2: "Life expectancy aur Ayushya mein farak",
    paras: [
      "Life expectancy calculator aapki umar, vazan aur aadaton se ausat umar ka andaaza lagate hain — ye aabadi ke aankdon par tike hain. Ayushya kundali ka granth-aadhaarit anumaan hai.",
      "Dono alag sawaalon ke jawab hain. Achhi aadatein aur doctor ki salaah dono mein sabse zaroori baat hai — granth bhi upay aur chikitsa ki baat karta hai.",
    ],
  },
  {
    id: "pindayu-nisargayu-amsayu",
    h2: "Pindayu, Nisargayu, Amsayu — granth ke doosre tareeke",
    paras: [
      "BPHS 43 mein saal nikalne ke teen aur tareeke hain — **pindayu** (grahon ki uchcha-neech sthiti se), **nisargayu** (grahon ke naisargik saal) aur **amsayu** (navamsa se). Ye saal ka number dete hain.",
      "Hum inhe nahi chalate, kyunki hamara niyam hai: saal kabhi nahi. Isliye hum wo tareeka lete hain jo sirf shreni batata hai.",
    ],
  },
  {
    id: "alag-jawab-kyun",
    h2: "Alag websites alag umar kyun batati hain?",
    paras: [
      "Kyunki granth mein aayu ke kai tareeke hain aur har tool apna chunta hai — koi pindayu, koi amsayu, koi teen jode. Ek hi kundali par do tareeke alag shreni de sakte hain.",
      "Isliye hum har jode ki raashi aur shlok dikhate hain — taaki koi bhi jyotishi hamara hisaab jaanch sake. Kundali ka poora vivaran [Janam Kundali Calculator](/calculators/free-janam-kundali-calculator) mein muft hai.",
    ],
  },
  {
    id: "aayu-ke-upay",
    h2: "Aayu ke liye upay — BPHS graha-shanti",
    paras: [
      "BPHS ke graha-shanti adhyay har grah ke liye jaap ki sankhya, havan ki samidha aur daan batate hain — jaise Surya 7,000 jaap, Chandra 11,000, Mangal 10,000, Budh 9,000, Guru 19,000, Shukra 16,000, Shani 23,000, Rahu 18,000, Ketu 17,000. Mantra vaidik ya pauranik, maun rehkar.",
      "Report aapke **mukhya maraka** grah ka upay deti hai. Upay dawa ki jagah nahi, dawa ke saath hai. Graha-shanti ke saath sade sati ke upay [yahan](/blog/sade-sati-remedies) hain.",
      "Upay ka kram: pehle mukhya maraka ki shanti, phir jo daur chal raha ho uske grah ki. Graha-shanti adhyay (BPHS) kehta hai ki shanti ka samay bhi dekha jaaye — tithi aur din achhe hon. Ek saath bahut saare upay karne se achha hai ek upay niyam aur shraddha se karna.",
    ],
  },
  {
    id: "mahamrityunjaya-mantra",
    h2: "Mahamrityunjaya mantra — parampara",
    paras: [
      "Aayu aur sehat ke liye Mahamrityunjaya mantra **parampara** mein sabse prasiddh hai. Ye BPHS ka niyam nahi, lok-parampara hai — hum ise isi label ke saath batate hain.",
      "Jaap shraddha se karein, par ilaaj kabhi na rokein. Mann ki shanti aur sehat ke rishte par [Kundli aur Mansik Swasthya](/blog/manasik-swasthya-kundli-se) padhiye.",
    ],
  },
  {
    id: "ratna-aur-aayu",
    h2: "Ratna aur aayu — pehle jaanch",
    paras: [
      "Ratna aayu nahi badhate; wo kamzor grah ko sahara dete hain. Galat grah ka ratna nuksaan bhi kar sakta hai.",
      "Pehle jaanchiye: [Gemstone Calculator](/calculators/free-gemstone-calculator), [Should I Wear Neelam](/calculators/free-should-i-wear-neelam) aur [Neelam ke fayde-nuksaan](/blog/neelam-blue-sapphire-benefits-side-effects-hindi).",
    ],
  },
  {
    id: "sade-sati-aur-aayu",
    h2: "Sade Sati aur aayu — dar ki zaroorat nahi",
    paras: [
      "Sade Sati ko log aayu se jod dete hain. Granth ka aayu ka niyam sade sati par nahi, teen jodon aur maraka dasha par hai.",
      "Sade Sati ke asar aur charan [Sade Sati ke charan](/blog/sade-sati-phases-which-is-worst) aur [Sade Sati — sehat, career, paisa](/blog/sade-sati-career-money-health-marriage) mein samjhaye gaye hain.",
    ],
  },
  {
    id: "kaun-si-mahadasha",
    h2: "Kaun si mahadasha sehat par asar daalti hai",
    paras: [
      "Jo grah maraka ho aur uski dasha mein paap grah ki antardasha chale — wahi saavdhaani ka samay. Ye grah par nirbhar hai, \"bure grah\" par nahi.",
      "Grahon ki mahadasha ke saamanya asar: [Mangal Mahadasha](/blog/mangal-mahadasha-energy-anger), [Ketu Mahadasha](/blog/ketu-mahadasha-vairagya-symptoms), [Surya Mahadasha](/blog/surya-mahadasha-government-job), [Budh Mahadasha](/blog/budh-mahadasha-career-mercury) aur [Chandra Mahadasha](/blog/chandra-mahadasha-mental-health).",
    ],
  },
  {
    id: "health-aur-ayushya",
    h2: "Health aur Ayushya — do alag calculator kyun",
    paras: [
      "Health calculator batata hai ki sharir kitna mazboot hai aur kin angon ka dhyan rakhein. Ayushya batata hai ki granth ke hisaab se aayu kis shreni mein hai aur kaunsa samay kathin hai. Sawaal alag, granth ka tareeka alag.",
      "Dono saath chalaiye: [Health Prediction](/calculators/free-health-prediction-calculator) aur ye Life Span Calculator. Sehat ki poori jaankari [Health Astrology guide](/blog/vedic-health-astrology-kundli-guide) aur [Health Prediction Astrology](/learn/health-prediction-astrology) mein hai.",
    ],
  },
  {
    id: "janm-samay-zaroori",
    h2: "Janm-samay kyun zaroori hai",
    paras: [
      "Hora lagna har ghante ek raashi badalta hai aur janm-lagna har do ghante. Samay galat ho to teesra jodi — aur kabhi band — badal sakta hai.",
      "Samay pakka na ho to report ko saavdhaani se padhein. Nakshatra jaanna ho to [Nakshatra Calculator](/calculators/free-nakshatra-calculator) Chandra se kaam karta hai.",
    ],
  },
  {
    id: "life-span-prediction-kitna-sahi",
    h2: "Life span prediction kitna sahi hai?",
    paras: [
      "Seedha jawab: ye granth ka **classical anumaan** hai. Ganana Swiss Ephemeris aur Lahiri ayanamsha par hai, niyam BPHS 43-44 ke hain, aur har jode ka shlok saath mein dikhta hai.",
      "Par jyotish sambhavna batata hai, nishchit ghatna nahi. Aayu ke maamle mein to granth khud vinamra hai. Isliye antim shabd doctor aur aapki dincharya ka.",
      "Hamari apni jaanch mein bhi hum saavdhaan hain: ek udaharan kundali par beeta maraka daur sabse kathin samay ke theek baad aaya, andar nahi. Isliye hum har daur ko \"dhyan ka samay\" kehte hain, pakki ghatna nahi. Jo niyam granth ka nahi, use hum \"parampara\" likhte hain.",
    ],
  },
  {
    id: "poora-muft",
    h2: "Poora muft — koi taala nahi",
    paras: [
      "Is calculator mein koi paid hissa nahi — band, teen jode, sahara dene wale yog, maraka ke daur aur upay, sab muft. Koi login nahi.",
      "Muft ka arth kam gunvatta nahi — engine wahi hai jo hamare doosre calculators mein. Doosre muft calculator [Calculators](/calculators) panne par hain.",
    ],
  },
  {
    id: "ek-udaharan",
    h2: "Ek udaharan — Kumbh lagna ki kundali",
    paras: [
      "Ek Kumbh lagna ki kundali: lagnesh Shani Kark mein aur 8vesh Budh Tula mein — dono char, **Deergha**. Shani Kark aur Chandra Mesh — dono char, **Deergha**. Lagna Kumbh (sthir) aur hora lagna Kark (char) — **Madhya**. Do jode Deergha, to bahumat Deergha.",
      "Par faisla dene wale dono jodon mein Shani hai aur wo Kark mein na apni na uchcha raashi mein — BPHS 43.47 se band ek neeche: **Madhyayu (ausat umar)**. Maraka: Guru (2re ka swami, mukhya) aur Surya (7ve ka swami).",
      "Is vyakti ke beete maraka daur Chandra/Surya (2013-14) aur Mangal/Surya (2020) aaye, aur aage Rahu/Surya (2035-36). Har daur ki antardasha paap grah Surya ki hai — yahi 44.8 ka niyam. Upay: Guru ke liye 19,000 jaap, peepal ki samidha aur vastra ka daan.",
    ],
  },
  {
    id: "buzurg-mata-pita",
    h2: "Buzurg mata-pita ki kundali dekh rahe hain to",
    paras: [
      "Parivaar ke buzurg ki kundali dekh rahe hain to nateeje ko dar ke saath nahi, dekhbhaal ki yojana ke saath padhein. Maraka ka daur ho to niyamit jaanch aur saath.",
      "Unka sahi janm-samay pata karke hi bharein. Aur yaad rahe — ye granth ka anumaan hai, unke doctor ki salaah sabse upar.",
    ],
  },
  {
    id: "kab-jyotishi-se-baat",
    h2: "Kab jyotishi se baat karein",
    paras: [
      "Agar band Alpayu aaye aur saath mein maraka ka daur chal raha ho, ya kundali ke niyam samajh na aayein, to kundali vistaar se dikhana upyogi hai. [Rohiit Gupta](/founder) ke baare mein yahan padhiye.",
      "Aur kisi bhi takleef mein — sabse pehle doctor.",
    ],
  },
  {
    id: "aayu-ganana-hindi",
    h2: "आयु गणना — हिंदी में",
    paras: [
      "यह कैलकुलेटर BPHS अध्याय 43 के तीन जोड़ों — लग्नेश-अष्टमेश, शनि-चन्द्र और लग्न-होरा लग्न — से आयु की श्रेणी बताता है: **दीर्घायु (लम्बी उम्र)**, **मध्यायु (औसत उम्र)** या **अल्पायु (सेहत और उपाय पर ज़्यादा ध्यान)**।",
      "साथ में अध्याय 44 से मारक के सावधानी-काल और ग्रह-शान्ति के उपाय मिलते हैं। आयु का वर्ष या मृत्यु का समय हम कभी नहीं बताते। पूरी तरह मुफ़्त।",
    ],
  },
];

const PILLAR_2: PillarSection[] = [];

const FAQS = [
  {
    q: "Life span prediction by date of birth kitna sahi hai?",
    a: "Ye BPHS adhyay 43-44 ka classical anumaan hai — Swiss Ephemeris par ganana aur har jode ka shlok saath. Nishchit bhavishya nahi; upay aur samay se badalta hai. Sehat ke liye antim shabd doctor ka.",
  },
  {
    q: "Kya ye calculator death date ya umar ka saal batata hai?",
    a: "Nahi. Hum saal, umar ka number ya mrityu ki tareekh kabhi nahi batate — sirf granth ki shreni (Alpayu, Madhyayu, Deerghayu), saavdhaani ke daur aur upay.",
  },
  {
    q: "Alpayu aaya to kya karein?",
    a: "Ghabraiye nahi. Iska arth hai sehat aur upay par zyada dhyan — niyamit jaanch aur mukhya maraka grah ki shanti. Granth khud kehta hai ki achhe yog aur upay aayu badhate hain (BPHS 43.59).",
  },
  {
    q: "Teen jode kaun se hain?",
    a: "Lagnesh + 8vesh, Shani + Chandra, aur lagna + hora lagna (BPHS 43.33-40). Har jode ki raashi char, sthir ya dvisvabhav dekh kar band tay hota hai.",
  },
  {
    q: "Maraka kya hai aur kya ye mrityu ka samay hai?",
    a: "Maraka 2re aur 7ve ghar se jude grah hain (BPHS 44). Granth unke daur mein rog-kasht ki baat karta hai; har maraka daur mrityu nahi. Hum ise sehat par dhyan ka samay kehte hain.",
  },
  {
    q: "20 saal se kam umar par nateeja kyun nahi aata?",
    a: "BPHS 44.12 kehta hai ki 20 varsh tak aayu jaani nahi ja sakti, aur 44.13 bachche ki raksha jaap, hom aur chikitsa se karne ko kehta hai. Isliye hum band nahi dikhate.",
  },
  {
    q: "Doosri website par alag umar kyun aayi?",
    a: "Granth mein aayu ke kai tareeke hain — pindayu, nisargayu, amsayu aur teen jode. Har tool alag chunta hai. Hum teen jode lete hain aur har jode ka shlok dikhate hain.",
  },
  {
    q: "Kya ye calculator poora muft hai?",
    a: "Haan. Band, teen jode, yog, maraka ke daur aur upay — sab muft, koi login nahi.",
  },
];

const COMPARE = [
  { f: "Umar ka saal / death date", tv: "Kabhi nahi — sirf shreni", as: "Aksar saal ya tareekh deti hain" },
  { f: "Band ka niyam", tv: "BPHS 43.33-40 teen jode, shlok ke saath", as: "Aksar niyam nahi batate" },
  { f: "Maraka ke daur (BPHS 44)", tv: "Haan — 44.8 ka shubh-antardasha niyam samet", as: "Kabhi-kabhi" },
  { f: "20 saal se kam par", tv: "Band nahi — BPHS 44.12", as: "Aksar umar de deti hain" },
  { f: "Upay", tv: "BPHS graha-shanti: jaap, samidha, daan", as: "Aksar saamanya upay" },
  { f: "Keemat", tv: "Poora muft", as: "Kabhi muft, kabhi paid" },
];

const READ_MORE = [
  { href: "/learn/longevity-life-span-prediction", t: "Longevity & Vitality in Astrology" },
  { href: "/blog/vedic-health-astrology-kundli-guide", t: "Health Astrology — Complete Guide" },
  { href: "/blog/shani-mahadasha-effects-guide", t: "Shani Mahadasha — asar aur upay" },
  { href: "/learn/mahadasha-explained", t: "Mahadasha Explained" },
];

const MORE_CALC = [
  { href: "/calculators/free-health-prediction-calculator", t: "Health Prediction Calculator" },
  { href: "/calculators/free-dasha-calculator", t: "Dasha Calculator" },
  { href: "/calculators/free-sade-sati-calculator", t: "Sade Sati Calculator" },
  { href: "/calculators/free-janam-kundali-calculator", t: "Janam Kundali Calculator" },
];

const ALL = [...PILLAR, ...PILLAR_2];

export default function FreeLifeSpanCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-life-span-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Life Span Calculator by Date of Birth — आयु गणना (Ayushya)',
    description:
      'Free life span calculator by date of birth: longevity band (Alpayu, Madhyayu, Deerghayu) from the three pairs of BPHS Ch.43 (lagna lord + 8th lord, Saturn + Moon, lagna + hora lagna), kakshya rule 43.47-50, maraka periods from BPHS Ch.44 and graha-shanti remedies. No year of death is ever given.',
    breadcrumbName: 'Life Span Calculator',
    aboutEntities: [
      'Longevity', 'Ayurdaya', 'Eighth House', 'Third House', 'Maraka', 'Saturn', 'Moon',
      'Hora Lagna', 'Vimshottari Dasha', 'Brihat Parashara Hora Shastra', 'Sarala Yoga',
    ],
    knowsAbout: [
      'Vedic Astrology', 'Jyotish Shastra', 'BPHS 43.33-40', 'BPHS 44', 'BPHS 5.4-5',
      'Alpayu Madhyayu Deerghayu', 'Maraka Dasha', 'Life Span Prediction by Date of Birth',
    ],
    howToName: 'How to check longevity in your Kundali by date of birth',
    howToSteps: [
      { name: 'Enter birth details', text: 'Date, exact time and place of birth. The time matters because the hora lagna moves one sign every hour.' },
      { name: 'The chart is computed', text: 'Swiss Ephemeris with Lahiri Ayanamsha; the three pairs of BPHS 43.33-40 give the band, with the kakshya rule of 43.47-50.' },
      { name: 'Read the band, maraka periods and remedy', text: 'Deerghayu, Madhyayu or Alpayu with a plain meaning, maraka periods from BPHS 44 and the graha-shanti remedy. No year of death, ever.' },
    ],
    faqs: FAQS,
    dateModified: '2026-09-22',
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
            <span style={{ color: '#94a3b8' }}>Life Span Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>
              Life Span Calculator by Date of Birth — आयु गणना (Ayushya)
            </h1>
            <p className="text-sm m-0 font-semibold" style={{ color: '#FCD34D' }}>
              🕉️ Ye granth ka classical anumaan hai, nishchit bhavishya nahi — upay aur samay se badalta hai।
            </p>
            <p className="text-sm m-0 mt-1" style={{ color: '#94a3b8' }}>
              BPHS 43 ke teen jode se Alpayu, Madhyayu ya Deerghayu, BPHS 44 se maraka ke saavdhaani daur, aur upay। Poora muft। Koi death date nahi।
            </p>
          </header>

          {/* ── AEO / GEO direct answer, 40-60 words ─────────────────── */}
          <div className="tv-aeo-answer rounded-xl p-5 mb-6"
            style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed m-0">
              <strong style={{ color: GOLD }}>Life span by date of birth</strong> BPHS adhyay 43 ke{' '}
              <strong style={{ color: GOLD }}>teen jodon — lagnesh-8vesh, Shani-Chandra aur lagna-hora lagna</strong> — se dekha jaata hai.{' '}
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Life Span Calculator</strong> granth ke niyam se Alpayu, Madhyayu ya Deerghayu,
              BPHS 44 se maraka ke saavdhaani daur aur graha-shanti upay deta hai — koi saal ya death date nahi, poora muft.
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
                Engine: Swiss Ephemeris · Hora lagna (BPHS 5.5) · Lahiri Ayanamsha · Granth engine
              </div>
            </div>
          </div>

          {/* ── Boundary, stated before the tool ─────────────────────── */}
          <section className="rounded-xl p-4 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              चार बातें पहले ही साफ़ कर देना ज़रूरी है। <strong style={{ color: GOLD }}>पहली</strong> — यह ग्रन्थ का शास्त्रीय अनुमान है, निश्चित भविष्य नहीं।{' '}
              <strong style={{ color: GOLD }}>दूसरी</strong> — आयु का वर्ष या मृत्यु की तिथि हम कभी नहीं बताते।{' '}
              <strong style={{ color: GOLD }}>तीसरी</strong> — 20 वर्ष से कम आयु पर कोई श्रेणी नहीं (BPHS 44.12)।{' '}
              <strong style={{ color: GOLD }}>चौथी</strong> — सेहत की हर बात में डॉक्टर की सलाह सबसे पहले।
            </p>
          </section>

          {/* ── The calculator ───────────────────────────────────────── */}
          <YogCalculator config={{
            type: 'life-span',
            genderRequired: false,
            scoreLabel: 'Ayushya',
            breakdownHeading: 'Teen jode — granth ka niyam',
            hintsHeading: 'Granth ke upay',
            hintsTeaser: 'Mukhya maraka grah par aadharit',
            showNextStep: false,
            ctaHref: '/calculators',
            ctaLabel: 'Meri aayu shreni dekho',
            ctaPrice: 'Muft',
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

          {/* ── 42 keyword-driven H2 sections ─────────────────────── */}
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
              Trikaal Vaani vs aam life span / death calculators
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak <strong style={{ color: GOLD }}>imaandari</strong> ka hai. Kai tools &ldquo;aap itne saal jiyenge&rdquo; ya death date
              de dete hain. BPHS khud kehta hai ki aayu jaanna devtaon ke liye bhi kathin hai (43.2) — isliye hum sirf granth ki{' '}
              <strong style={{ color: GOLD }}>shreni</strong>, maraka ke daur aur upay dete hain, har niyam ke shlok ke saath.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <caption className="sr-only">Life span calculators ki tulna</caption>
                <thead>
                  <tr style={{ background: GOLD_RGBA(0.1) }}>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Kya</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                    <th scope="col" className="p-3 text-left" style={{ color: GOLD }}>Aam life span / death calculators</th>
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
              Aksar puche jaane wale sawaal — Life Span Calculator
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
              आयु और स्वास्थ्य ज्योतिष पर पढ़ें
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
