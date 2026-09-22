'use client';

// ============================================================
// File: app/calculators/free-health-prediction-calculator/page.tsx
// Version: v1.2 — "kin angon ka dhyan aur kab" (ang + samay, muft) ka zikr — 22 Sep 2026
// Version: v1.1 — 'Related reading' heading: vivah → swasthya (template ka bacha text) — 22 Sep 2026
// Version: v1.0 — Health Prediction (Jeevan-shakti) Calculator — 22 Sep 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// API: /api/calc/yog (type: 'health-insight') · Engine: lib/health-engine.ts
//      (ADAPTER — score VM ke granth_api v3.3 jeevan_shakti() se, EK jagah)
//
// ROHIIT KE FAISLE (22 Sep 2026):
//   * SABSE UPAR: "Pehli prathmikta doctor ki jaanch — hum sirf granth ki baat batate hain"
//   * Kabhi "diagnosis" nahi — "areas to watch". Rog ka NAAM kabhi nahi, sirf ang.
//   * Jeevan-shakti (sidha): lagna 25 · lagna-swami 20 · Surya 15 · Chandra 15 ·
//     6va swami 10 (Harsha) · 8va swami 10 (Sarala) · shubh drishti 5
//   * Band: 0-40 DHYAN RAKHEIN · 41-69 MADHYAM · 70+ PRABAL (bold)
//   * Slug/title/meta Rohiit ka chunav: "health prediction by date of birth" —
//     jo log likhte hain; "health astrology" hamare pillar ka keyword hai.
//
// CONTENT: 46 H2 · 62 inline internal link (sab ASLI — /blog DB mein jaanchi,
//   calculator folder maujood) · ~4100 shabd · 8 FAQ.
// Dhaancha free-second-marriage-calculator/page.tsx se — render code wahi.
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

// Har heading asli search phrase par — Google (health prediction by date of
// birth, medical astrology, vata pitta kapha) aur Radar (kaun se grah se kaun
// sa rog). Har link jaancha hua.
const PILLAR: PillarSection[] = [
  {
    id: "health-prediction-by-date-of-birth",
    h2: "Health Prediction by Date of Birth — ye calculator kaise kaam karta hai",
    paras: [
      "Ye calculator aapki **janm-tithi, samay aur sthan** se Swiss Ephemeris par kundali banata hai aur sehat ko saat classical niyamon par tolta hai — **lagna, lagna-swami, Surya, Chandra, 6va swami, 8va swami aur lagna par shubh drishti**. Har niyam ka shlok saath mein dikhta hai, koi chhupa formula nahi.",
      "Nateeje mein teen cheezein milti hain: 100 mein **Jeevan-shakti score**, **areas to watch** (BPHS 4.4 kalapurusha) aur aapki **prakriti** (BPHS 4.5). Sehat ki poori jaankari ke liye hamara [Health Astrology guide](/blog/vedic-health-astrology-kundli-guide) bhi padhein — calculator usi ka vyavaharik roop hai.",
      "Sabse zaroori baat pehle: **pehli prathmikta doctor ki jaanch**. Ye tool granth ki baat batata hai, bimari ka nidaan (diagnosis) nahi karta.",
    ],
  },
  {
    id: "jeevan-shakti-score-kya-hai",
    h2: "Jeevan-shakti score kya hai?",
    paras: [
      "Jeevan-shakti score batata hai ki aapki kundali mein **sharir ko sambhalne wale grah aur bhav kitne mazboot hain**. Ye seedha score hai — zyada ank matlab zyada jeevan-shakti. 400 asli kundaliyon par ye 24 se 90 ke beech aaya, beech ka ank 55.",
      "Ank saat hisson se aate hain: lagna 25, lagna-swami 20, Surya 15, Chandra 15, 6va swami 10, 8va swami 10 aur shubh drishti 5. Har hissa result mein alag dikhta hai, taaki aap dekh saken ki kaunsa grah sahara de raha hai aur kaunsa nahi. Grahon ka bal alag se dekhna ho to [Graha Bal Calculator](/calculators/free-graha-bal-calculator) chalaiye.",
      "Ye score kisi ek grah ko 'achha' ya 'bura' nahi kehta. Ek kundali mein lagna kamzor ho par Harsha yoga ho, to dono ka asar saath dikhta hai. Isi santulan se asli tasveer banti hai — ek line ki bhavishyavani se nahi. Score ko doosri kundali se takraane ke bajaye apne hi niyamon ko dekhiye: kaunsa hissa kam hai, wahi aapka upay ka kendra hai.",
    ],
  },
  {
    id: "prabal-madhyam-dhyan-rakhein",
    h2: "Prabal, Madhyam aur Dhyan Rakhein — nateeja kaise padhein",
    paras: [
      "Score teen hisson mein baanta gaya hai. **70 ya zyada = Prabal** (aap swasth rahenge — jeevan-shakti achhi hai). **41 se 69 = Madhyam** (sehat theek rahegi — kuch baaton par dhyan rakhein). **40 ya kam = Dhyan Rakhein** (sehat par niyamit dhyan aur doctor se jaanch zaroori).",
      "Zyadatar log Madhyam mein aate hain — ye swabhavik hai, kyunki poori tarah mazboot ya poori tarah kamzor kundali kam hoti hai. **Dhyan Rakhein ka arth bimari nahi**; iska arth hai ki sehat ko halke mein na lein, niyamit jaanch karayein aur granth ke upay karein.",
      "Band sirf ek sanket hai. Do log jinka score 60 hai, unki kundali alag ho sakti hai — ek ka lagna mazboot ho aur Surya kamzor, doosre ka ulta. Isliye band ke saath har niyam ka ank padhna zaroori hai. Prabal band wale bhi jaanch na chhodein; jeevan-shakti achhi hone ka arth ye nahi ki sharir ko dhyan nahi chahiye.",
    ],
  },
  {
    id: "free-health-astrology-by-date-of-birth",
    h2: "Free health astrology by date of birth — kya milta hai",
    paras: [
      "Muft mein aapko poora Jeevan-shakti score, band, teen sabse mazboot niyam unki wajah ke saath, **kin angon ka dhyan aur kab** (har ang ke liye beeta, abhi chal raha aur aane wala dasha-samay), prakriti aur granth ka saar milta hai. Baaki niyamon ke ank dikhte hain par unki wajah ₹51 ki poori reading mein khulti hai.",
      "Poori reading mein har niyam ki wajah, dasha ke hisaab se samay aur aapke grahon ke liye granth ke upay milte hain. Poori kundali ek saath dekhni ho to [Janam Kundali Calculator](/calculators/free-janam-kundali-calculator) bhi muft hai.",
    ],
  },
  {
    id: "lagna-aur-sehat",
    h2: "Lagna aur sehat — pehla bhav sharir kyun hai",
    paras: [
      "Parashar pehle bhav ko **tanu bhav** kehte hain — tanu yani sharir. Isliye sehat ki har baat lagna se shuru hoti hai. Lagna mazboot ho to sharir ki rog se ladne ki shakti achhi maani jaati hai; lagna par paap grah ya kam bindu hon to dhyan chahiye.",
      "Calculator lagna ko 25 ank deta hai — sabse bada hissa. Isme **Ashtakavarga ke bindu** aur lagna ki kul haalat dono dekhe jaate hain. Apna lagna nahi pata? [Lagna Calculator](/calculators/free-lagna-calculator) se ek minute mein jaaniye, aur lagna ka bal [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) se.",
      "Lagna mein shubh grah — Guru, Shukra, Budh ya poorn Chandra — ho to parampara mein ise sharir ki raksha maana jaata hai. Lagna mein Shani, Rahu ya Mangal ho to sharir ko adhik parishram aur dhyan ki zaroorat hoti hai. Calculator in dono ko seedhe ank nahi deta; wo Ashtakavarga ke bindu aur lagna ki kul haalat se ye asar pakadta hai, jo zyada santulit tareeka hai.",
    ],
  },
  {
    id: "lagna-swami-kamzor-sehat",
    h2: "Lagna-swami kamzor ho to sehat par kya asar?",
    paras: [
      "Lagna-swami (lagnesh) sharir ka maalik hai. Wo **kendra (1, 4, 7, 10) ya trikon (5, 9)** mein ho to mazboot, aur **6, 8, 12 (dusthana)** mein ho to kamzor maana jaata hai (BPHS adhyay 24). Uski raashi bhi maayne rakhti hai — uchcha, swa-raashi ya mitra raashi mein achha, neech ya shatru raashi mein kamzor.",
      "Calculator lagna-swami ko 20 ank deta hai: 10 ghar ke liye, 10 raashi ke darje ke liye. Kaunsa grah kamzor hai, ye [Weak Planet Finder](/calculators/free-weak-planet-finder) se alag se bhi dekh sakte hain.",
      "Lagna-swami agar asta (Surya ke bahut paas) ho, to bhi uska bal ghat jaata hai. Aise mein lagna-swami ki shanti ke upay granth mein bataye gaye hain. Lagna-swami kendra mein uchcha ho to ye sehat ke liye sabse achhi sthiti maani jaati hai — calculator use poore 20 ank deta hai.",
    ],
  },
  {
    id: "surya-kamzor-ho-to",
    h2: "Surya kamzor ho to kya hota hai? — jeevan-shakti ka karak",
    paras: [
      "BPHS adhyay 3 mein Surya ko **aatma** kaha gaya hai — sharir ki jeevan-shakti aur haddiyon ka karak. Surya achhi raashi mein aur dusthana se bahar ho to shakti achhi maani jaati hai.",
      "Calculator Surya ko 15 ank deta hai: raashi ke darje ke 10 aur ghar ke 5 (6, 8, 12 mein na ho to). Surya ka ratna Manik hai, par pehna jaaye ya nahi ye kundali par nirbhar hai — [Should I Wear Manik](/calculators/free-should-i-wear-manik) jaanch aur [Manik ke fayde-nuksaan](/blog/manik-ruby-benefits-side-effects-hindi) padh lijiye.",
      "Surya kundali mein 6, 8 ya 12 mein ho to use 'dusthana ka Surya' kaha jaata hai — jeevan-shakti mein utaar-chadhaav ka sanket. Surya neech (Tula) mein ho to raashi ka bal bhi kam. Par Surya uchcha (Mesh) ya swa-raashi (Simha) mein ho to ye sharir ki taakat ka bada sahara hai.",
    ],
  },
  {
    id: "chandra-aur-mann-ki-sehat",
    h2: "Chandra aur mann ki sehat — mental health astrology",
    paras: [
      "Chandra **mann** ka karak hai (BPHS 3) aur sharir ke taral tatva ka bhi. Badhta hua (poorn) Chandra achha maana jaata hai, ghatta hua (ksheen) kamzor. Isliye calculator Chandra ki raashi ke 10 aur paksha ke 5 ank deta hai.",
      "Mann ki sehat par vistaar se [Kundli aur Mansik Swasthya](/blog/manasik-swasthya-kundli-se) aur [Chandra Mahadasha aur Mental Health](/blog/chandra-mahadasha-mental-health) padhiye. Chandra ka ratna Moti hai — pehle [Should I Wear Moti](/calculators/free-should-i-wear-moti) se jaanchiye, aur [Moti ke fayde-nuksaan](/blog/moti-pearl-benefits-side-effects-hindi) padhiye.",
      "Chandra ka bal paksha se bhi badalta hai. Shukla paksha ki ashtami ke baad Chandra poorn maana jaata hai aur Krishna paksha ki ashtami ke baad ksheen. Isliye ek hi raashi mein Chandra hone par bhi do logon ke ank alag aa sakte hain — janm ka din maayne rakhta hai.",
    ],
  },
  {
    id: "6th-house-in-astrology-health",
    h2: "6th house in astrology — rog bhav kya batata hai",
    paras: [
      "Chhatha bhav **rog, ripu aur rin** — teenon ka bhav hai. BPHS adhyay 17 poora isi bhav par hai. Yahan grah aur 6va swami batate hain ki kin cheezon par dhyan rakhna hai.",
      "Par dhyan dijiye — **6ve bhav ka mazboot hona sehat ke liye seedha achha nahi**. Yahi sabse badi galti hai jo saamanya tools karte hain. Asli niyam agle section mein hai. 6ve swami ka doosra roop — karz aur virodh — [6th lord aur karz](/blog/sixth-lord-debt-pattern-astrology) mein samjhaya gaya hai.",
      "6ve bhav mein Mangal ya Shani jaise paap grah parampara mein 'shatru-nashak' maane jaate hain — ye rog se ladne ki shakti bhi dete hain. Isliye akela 6va bhav dekh kar nishkarsh nikaalna galat hai; 6va swami kahan hai, ye dekhna zaroori hai. Calculator yahi karta hai.",
    ],
  },
  {
    id: "harsha-yoga-6th-lord",
    h2: "Harsha yoga — 6va swami dusthana mein kyun achha hai",
    paras: [
      "Phaladipika adhyay 6 (Santhanam ne BPHS ki tika mein ise uddhrit kiya hai) kehta hai: **6va swami 6, 8 ya 12 mein ho aur 6ve bhav par paap grah ho, to Harsha yoga** banta hai — jatak ka sharir mazboot hota hai aur wo shatruon par jeet paata hai.",
      "Isliye calculator 6ve swami ko dusthana mein hone par **poore 10 ank** deta hai (paap grah ke bina 7), aur 6ve swami ke lagna mein aane par 0 — kyunki tab rog ka maalik sharir ke ghar mein baith jaata hai. Ye ulta lagta hai, par granth yahi kehta hai. Naukri mein 6-10 ka takraav [yahan](/blog/tenth-sixth-lord-boss-conflict-astrology) padhiye.",
    ],
  },
  {
    id: "8th-house-aayu-sarala-yoga",
    h2: "8th house aur aayu — Sarala yoga",
    paras: [
      "Aathva bhav **aayu** ka bhav hai. Phaladipika 6 ke anusar **8va swami 6, 8 ya 12 mein ho to Sarala yoga** banta hai — jatak deerghayu, nidar aur samriddh hota hai. Calculator yahan poore 10 ank deta hai.",
      "8va swami lagna mein ho to sehat par dhyan ka sanket maana gaya hai — 0 ank. Hum aayu ka saal kabhi nahi batate; ye sirf bal ka anumaan hai. 8ve aur 12ve bhav ke karmic arth ke liye [8th-12th house karmic bond](/blog/past-life-karmic-bond-8th-12th-house-astrology) padhiye.",
    ],
  },
  {
    id: "12th-house-aur-health",
    h2: "12th house aur health — score mein kyun nahi",
    paras: [
      "Barahva bhav vyaya (kharch) ka hai. Kai log ise aspatal se jodte hain, par ye **aadhunik vyakhya** hai, Parashar ka seedha niyam nahi. Isliye Jeevan-shakti score mein 12va bhav nahi liya gaya.",
      "Kalapurusha mein 12va bhav **pair** ka hai — to agar yahan paap grah hai, to areas to watch mein 'pair' dikhega. 12ve bhav ka videsh wala roop alag vishay hai.",
    ],
  },
  {
    id: "kaun-sa-grah-kis-ang-par",
    h2: "Kaun sa grah kis ang par asar karta hai? — JP 13.78",
    paras: [
      "Jataka Parijata 13.78 kehta hai ki **6va swami jis grah ke saath ho, us grah se chot ya vran ka sthan dekha jaata hai** — Surya se sir, Chandra se mukh, Mangal se kanth, Shukra se netra aur Shani se vaat. Ye line hamari report mein asli roop mein dikhti hai kyunki ye shiksha hai, bhavishyavani nahi.",
      "Grahon ki kamzori ka poora hisaab [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) mein milta hai.",
    ],
  },
  {
    id: "12-bhav-aur-sharir-ke-ang",
    h2: "12 bhav aur sharir ke ang — Kalapurusha (BPHS 4.4)",
    paras: [
      "BPHS 4.4 mein kaal-purush ke ang 12 bhavon par baante gaye hain: **1 sir, 2 chehra, 3 bhujayen, 4 hriday, 5 pet, 6 kamar, 7 naabhi ke neeche, 8 gupt ang, 9 jaanghen, 10 ghutne, 11 takhne, 12 pair**.",
      "Santhanam ki tika ke anusar jis bhav mein paap grah ho, us ang ko dhyan chahiye, aur shubh grah wala ang mazboot rehta hai. Calculator yahi dekh kar aapke areas to watch banata hai.",
      "Ye mapping Mesh se Meen tak ki kaal-purush kundali par bhi lagti hai — Mesh sir, Vrishabh chehra, aur isi kram mein Meen pair. Jab aapke lagna se ginti hoti hai, to aapke 1st bhav ka ang sir, 2nd ka chehra, aur aage. Is tarah har vyakti ke liye areas to watch alag bante hain.",
    ],
  },
  {
    id: "areas-to-watch-kaise-bante-hain",
    h2: "Areas to watch — paap grah wale ghar ka ang",
    paras: [
      "Surya, Mangal, Shani, Rahu aur Ketu — paanch paap grah jin ghar mein hain, unke ang areas to watch mein aate hain. Rahu-Ketu hamesha aamne-saamne hote hain, isliye har kundali mein kam se kam do ang aate hi hain — **ye darne ki baat nahi**.",
      "Ye soochi batati hai ki kis ang ka dhyan rakhein, jaanch mein kise na bhoolein. Rahu aur Ketu ko samajhne ke liye [Rahu kya hai](/blog/what-is-rahu) aur [Ketu kya hai](/blog/what-is-ketu) padhiye.",
    ],
  },
  {
    id: "vaat-pitta-kaph-kundali-se",
    h2: "Vaat, pitta, kaph — kundali se prakriti (BPHS 4.5)",
    paras: [
      "BPHS 4.5 raashiyon ki prakriti batata hai, aur lagna ki raashi se aapki prakriti nikalti hai. **Pitta:** [Mesh](/blog/best-gemstones-for-aries-lagna), [Simha](/blog/best-gemstones-for-leo-lagna), [Dhanu](/blog/best-gemstones-for-sagittarius-lagna). **Vaat:** [Vrishabh](/blog/best-gemstones-for-taurus-lagna), [Kanya](/blog/best-gemstones-for-virgo-lagna), [Makar](/blog/best-gemstones-for-capricorn-lagna).",
      "**Mishra:** [Mithun](/blog/best-gemstones-for-gemini-lagna), [Tula](/blog/best-gemstones-for-libra-lagna), [Kumbh](/blog/best-gemstones-for-aquarius-lagna). **Kaph:** [Kark](/blog/best-gemstones-for-cancer-lagna), [Vrischik](/blog/best-gemstones-for-scorpio-lagna), [Meen](/blog/best-gemstones-for-pisces-lagna). Har link us lagna ke ratna guide par jaata hai.",
      "Prakriti jaankar khaan-paan aur dincharya samajhne mein madad milti hai — par ilaaj hamesha vaidya ya doctor ki salaah se.",
      "Pitta prakriti mein garmi, tez paachan aur jaldi gussa aam lakshan maane jaate hain; vaat mein rookhapan, bechaini aur jodon ki takleef; kaph mein bhaaripan, sardi-zukaam aur dheema paachan; mishra mein in sab ka mel. Ye sirf pravritti hai — asli sharir ki prakriti vaidya nadi dekh kar batata hai.",
    ],
  },
  {
    id: "medical-astrology-aur-doctor",
    h2: "Medical astrology aur doctor — pehli prathmikta kise?",
    paras: [
      "Hamesha **doctor ko**. Jyotish batata hai ki kundali mein kin baaton par dhyan dena hai; doctor batata hai ki sharir mein asal mein kya ho raha hai. Dono ka kaam alag hai.",
      "Isliye hamari report sabse upar yahi likhti hai: *pehli prathmikta doctor ki jaanch — hum sirf granth ki baat batate hain.* Hum kabhi dawa band karne ya badalne ki salaah nahi dete.",
      "Jyotish ka sabse achha upyog hai **saavdhaani** — jin areas ki kundali dhyan dilati hai, unki jaanch ko niyamit rakhna. Jaise kisi ki kundali mein pet ka ghar paap grah se bhara ho, to wo pet ki takleef ko halke mein na le aur samay par doctor ko dikhaye. Yahi is calculator ka uddeshya hai.",
    ],
  },
  {
    id: "kundli-mein-bimari-kaise-dekhein",
    h2: "Kundli mein bimari kaise dekhein — poora guide",
    paras: [
      "Kundali mein sehat dekhne ka kram hai: lagna aur lagna-swami, phir Surya-Chandra, phir 6-8 bhav aur unke swami, phir dasha. Ye poora tareeka hamare Hindi guide [कुंडली में बीमारी कैसे देखें](/blog/kundli-mein-bimari-kaise-dekhein) mein vistaar se hai.",
      "Calculator ye kram apne aap chalata hai aur har kadam ka nateeja dikhata hai, taaki aapko khud ganana na karni pade.",
    ],
  },
  {
    id: "disease-prediction-by-date-of-birth",
    h2: "Disease prediction by date of birth — hum rog ka naam kyun nahi likhte",
    paras: [
      "Granth kuch jagah rog ke naam likhte hain. Par ek line ka arth tabhi banta hai jab poori kundali, dasha aur jeevan dekha jaaye. Kisi ko sirf ek niyam par rog ka naam bata dena dar paida karta hai aur galat bhi ho sakta hai.",
      "Isliye hum **rog ka naam kabhi nahi likhte — sirf sharir ka ang aur 'dhyan'**. Jaise granth 'netra-rog' kahe to report 'aankhon par dhyan rakhein' likhti hai. Arth wahi, dar nahi.",
    ],
  },
  {
    id: "granth-ki-swasthya-lines",
    h2: "Granth ki 33 swasthya lines — diplomatic roop mein",
    paras: [
      "BPHS 17, Bhrigu Sutram, Jataka Parijata 13 aur Phaladipika 14 se 33 swasthya lines hamari report mein aati hain — jab unki shart aapki kundali par lagti hai. Ye lines ab **har Trikaal Vaani reading** mein dikhti hain, sirf is calculator par nahi.",
      "Chaar lines samjhaane wali hain aur asli roop mein hain. Baaki mein rog ke naam ki jagah ang ka naam hai, aur gambhir lines ke saath 'jaanch karate rahein' juda hai. Database mein granth ki asli line surakshit hai.",
      "Ye lines tabhi dikhti hain jab unki shart — jaise 'Chandra 6ve bhav mein' ya '6va swami 8ve mein' — aapki kundali par sach mein lagti hai. Isliye har vyakti ki report mein alag lines aati hain. Koi line sabko ek jaisi nahi dikhai jaati.",
    ],
  },
  {
    id: "umar-wale-yog",
    h2: "Umar ke saath yog — 29-30 ya 55 varsh ki lines ka arth",
    paras: [
      "BPHS 17 ki kuch lines umar ke saath aati hain — jaise '29-30 varsh ke aas-paas pet par kasht ka yog'. Ye beeti umar ki bhi dikhti hain. Agar beeta hua sahi nikla, to aap khud parakh sakte hain ki granth aapki kundali par kitna baitha.",
      "Aane wali umar ki line ka arth dar nahi, **jaanch ka samay** hai — us umar ke aas-paas niyamit check-up karaiye.",
    ],
  },
  {
    id: "sehat-ka-samay-dasha",
    h2: "Sehat ka samay — dasha aur antardasha (BPHS 46)",
    paras: [
      "BPHS 46 ke anusar ghatna ka samay **dasha** se tay hota hai. Report batati hai ki kaunsi mahadasha-antardasha lagna, 6ve ya 8ve bhav ko kholti hai — wahi samay dhyan ka hai.",
      "Apni chal rahi dasha jaanne ke liye [Dasha Calculator](/calculators/free-dasha-calculator) chalaiye. Gochar (transit) hum sirf dasha ke andar dikhate hain — akela gochar ghatna nahi deta.",
      "Mahadasha ek bada daur hai — kai saal. Antardasha usme chhota hissa hai, aur ghatna aksar antardasha mein hoti hai (BPHS 52). Isliye report mein mahadasha aur antardasha dono ki tareekhein aati hain, taaki aap jaan saken ki dhyan ka samay kab se kab tak hai.",
    ],
  },
  {
    id: "kaun-si-mahadasha-sehat",
    h2: "Kaun si mahadasha sehat par asar daalti hai?",
    paras: [
      "Jis grah ki dasha chal rahi hai wo agar 6ve ya 8ve bhav ka swami hai ya wahan baitha hai, to us samay sehat par dhyan zaroori maana jaata hai. Ye grah par nirbhar hai, 'bura grah' par nahi.",
      "Vistaar se padhiye: [Shani Mahadasha](/blog/shani-mahadasha-effects-guide), [Rahu Mahadasha](/blog/rahu-mahadasha-effects-guide), [Ketu Mahadasha](/blog/ketu-mahadasha-vairagya-symptoms), [Mangal Mahadasha](/blog/mangal-mahadasha-energy-anger), [Surya Mahadasha](/blog/surya-mahadasha-government-job), [Guru Mahadasha](/blog/guru-mahadasha-wisdom-growth) aur [Budh Mahadasha](/blog/budh-mahadasha-career-mercury). Rahu ki antardasha ka asar [yahan](/blog/rahu-antardasha-confusion-symptoms) hai.",
    ],
  },
  {
    id: "sade-sati-aur-sehat",
    h2: "Sade sati aur sehat — kya Shani hamesha bura?",
    paras: [
      "Sade sati mein thakaan aur chinta ki baat aam hai, par [kya Sade Sati hamesha buri hai](/blog/is-sade-sati-always-bad)? Nahi — asar dasha aur kundali par nirbhar hai. Sehat, career aur paise par asar [yahan](/blog/sade-sati-career-money-health-marriage) samjhaya gaya hai.",
      "Aapki sade sati chal rahi hai ya nahi, [Sade Sati Calculator](/calculators/free-sade-sati-calculator) se jaaniye, aur [Sade Sati ke upay](/blog/sade-sati-remedies) padhiye.",
    ],
  },
  {
    id: "rahu-ketu-aur-sehat",
    h2: "Rahu-Ketu aur sehat",
    paras: [
      "Rahu-Ketu kisi raashi ke swami nahi, par jis ghar mein baithte hain wahan asar dete hain. Isliye areas to watch mein unke ghar ke ang aate hain.",
      "Kaal Sarp yog ke sanket [yahan](/blog/kaal-sarp-dosh-signs-symptoms) aur jaanch [Kaal Sarp Dosh Calculator](/calculators/free-kaal-sarp-dosh-calculator) se. 2026 ke Rahu-Ketu gochar par [ye lekh](/blog/is-rahu-ketu-transit-2026-dangerous) padhiye.",
    ],
  },
  {
    id: "mangal-aur-chot",
    h2: "Mangal aur chot — 1st aur 8th ghar",
    paras: [
      "Mangal ko chot, khoon aur sujan se joda jaata hai. Lagna ya 8ve ghar ka Mangal parampara mein dhyan ka sanket hai — isliye [1st house Mangal](/blog/mangal-dosh-1st-house-effects) aur [8th house Mangal](/blog/mangal-dosh-8th-house-effects) ke lekh padhne layak hain.",
      "Mangal dosh ki poori jaanch [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) se, aur ye asal mein hai kya — [yahan](/blog/what-is-mangal-dosha).",
    ],
  },
  {
    id: "immunity-astrology",
    h2: "Immunity astrology — rog-pratirodhak shakti kundali mein",
    paras: [
      "Kuch tools immunity ka pratishat batate hain. Granth mein aisa koi pratishat niyam nahi hai, isliye hum pratishat nahi, **Jeevan-shakti** dete hain — lagna, lagnesh, Surya, Chandra aur Harsha-Sarala yog ka jod.",
      "Har ank ke saath uska niyam dikhta hai, taaki aap samajh saken ki shakti kahan se aa rahi hai.",
    ],
  },
  {
    id: "lagna-ashtakavarga-bindu",
    h2: "Lagna ke Ashtakavarga bindu — 28 se upar kyun achha",
    paras: [
      "Sarvashtakavarga mein kul 337 bindu hote hain — har bhav ka ausat lagbhag 28. Isliye lagna par **28 se zyada bindu** achhe maane jaate hain aur 34 se zyada bahut achhe.",
      "Calculator 34+ par 15, 28+ par 10 aur 22+ par 5 ank deta hai, aur lagna ki kul haalat (mazboot / mila-jula / kamzor) ke 10 ank alag se.",
    ],
  },
  {
    id: "lagna-par-guru-ki-drishti",
    h2: "Lagna par Guru ki drishti — suraksha kavach",
    paras: [
      "Guru lagna mein ho ya use 5vi, 7vi ya 9vi drishti se dekhe, to parampara mein ise sharir ka suraksha kavach maana jaata hai — calculator 5 ank deta hai. Shukra ya Budh ki drishti par 3 ank.",
      "Guru ki poori bhoomika [Guru Mahadasha](/blog/guru-mahadasha-wisdom-growth) mein samjhayi gayi hai.",
    ],
  },
  {
    id: "achhi-sehat-ke-upay",
    h2: "Achhi sehat ke upay — granth ke anusar",
    paras: [
      "BPHS ke upay adhyay kamzor grah ki shanti ke liye mantra-jaap, havan aur daan batate hain. Report aapke lagna-swami, Surya aur Chandra ke hisaab se granth ka upay dikhati hai — saamanya upay nahi.",
      "Upay dawa ki jagah nahi, dawa ke saath hai. Ratna pehnne se pehle [Gemstone Calculator](/calculators/free-gemstone-calculator) se jaanch zaroori hai.",
      "Upay chunne ka kram: pehle lagna-swami, phir jo grah score mein sabse kam laya, phir chal rahi dasha ka grah. Ek saath bahut saare upay karne se achha hai ek-do upay niyam se karna.",
    ],
  },
  {
    id: "mahamrityunjaya-mantra",
    h2: "Mahamrityunjaya mantra — sehat ke liye",
    paras: [
      "Mahamrityunjaya mantra sehat ke liye **parampara** mein sabse prasiddh hai. Ye BPHS ka niyam nahi, lok-parampara hai — hum ise isi label ke saath batate hain.",
      "Jaap shraddha se karein, par ilaaj kabhi na rokein.",
    ],
  },
  {
    id: "sehat-ke-liye-ratna",
    h2: "Sehat ke liye ratna — pehle kundali jaanchiye",
    paras: [
      "Surya ke liye Manik, Chandra ke liye Moti, Mangal ke liye Moonga — par galat grah ka ratna nuksaan bhi kar sakta hai. Isliye pehle jaanch: [Moonga pehnein ya nahi](/calculators/free-should-i-wear-moonga) aur [Moonga ke fayde-nuksaan](/blog/moonga-red-coral-benefits-side-effects-hindi).",
      "Lagna ke hisaab se sahi ratna upar prakriti wale section ke links mein hai.",
    ],
  },
  {
    id: "pitra-dosh-aur-sehat",
    h2: "Pitra dosh aur sehat",
    paras: [
      "Parampara mein pitra dosh ko parivaar mein baar-baar ki takleef se joda jaata hai. [Pitra dosh ke sanket](/blog/signs-of-pitra-dosh), [8th house pitra dosh](/blog/pitra-dosh-in-8th-house) aur [1st house pitra dosh](/blog/pitra-dosh-in-1st-house) padhiye.",
      "Jaanch [Pitra Dosh Calculator](/calculators/free-pitra-dosh-calculator) se muft hai.",
    ],
  },
  {
    id: "health-horoscope-2026",
    h2: "Health horoscope 2026 — gochar kab maayne rakhta hai",
    paras: [
      "Saal bhar ka rashifal sabke liye ek jaisa hota hai. Asal asar tab aata hai jab gochar aapki chal rahi dasha ke saath mel khaye. [Shani gochar 2026](/blog/saturn-transit-2026) isi nazar se padhiye.",
      "Apni raashi [Rashi Calculator](/calculators/free-rashi-calculator) se jaaniye.",
    ],
  },
  {
    id: "free-aur-51-report",
    h2: "Free aur ₹51 report mein kya farak",
    paras: [
      "Free mein score, band, teen mukhya niyam, har ang ka dasha-samay (beeta, abhi, aage), prakriti aur saar. ₹51 mein saaton niyam ki poori wajah, dasha ka samay aur granth ke upay.",
      "Dono mein ek hi ganana hai — paid mein sirf zyada vistaar khulta hai.",
    ],
  },
  {
    id: "health-prediction-kitna-sahi",
    h2: "Health prediction kitna sahi hai?",
    paras: [
      "Ganana Swiss Ephemeris aur Lahiri ayanamsha par hai, aur niyam BPHS, Phaladipika, Jataka Parijata aur Bhrigu Sutram se. Score VM par ek hi jagah ginta hai, isliye score aur granth ka faisla kabhi alag nahi aate.",
      "Par jyotish sambhavna batata hai, nishchit ghatna nahi. Sehat ke liye antim shabd doctor ka hai.",
      "Accuracy ka sabse bada aadhaar sahi janm-samay hai. Doosra aadhaar niyamon ki imaandari — hum har ank ke saath uska shlok dikhate hain, taaki koi bhi jyotishi use jaanch sake. Jo niyam granth ka nahi, parampara ka hai, use hum 'parampara' likhte hain.",
    ],
  },
  {
    id: "janm-samay-kyun-zaroori",
    h2: "Janm-samay kyun zaroori hai",
    paras: [
      "Lagna har do ghante mein badal jaata hai. Samay galat ho to lagna, lagna-swami aur areas to watch — sab badal sakte hain. Isliye sahi samay bharein.",
      "Samay pakka na ho to report ko saavdhaani se padhein.",
    ],
  },
  {
    id: "ek-udaharan",
    h2: "Ek udaharan — score kaise banta hai",
    paras: [
      "Ek Kumbh lagna ki kundali: lagna par 36 bindu par haalat kamzor (15/25), lagna-swami Shani 6ve ghar mein shatru raashi mein (2/20), Surya 8ve ghar mein (5/15), Chandra (10/15), 6va aur 8va swami saamanya (5+5), lagna par Shukra-Budh ki drishti (3/5). Kul **45 — Madhyam**.",
      "Areas to watch: hriday, kamar, gupt ang, ghutne. Prakriti: mishra (Kumbh). Har ank ki wajah report mein saaf likhi hoti hai.",
    ],
  },
  {
    id: "kab-jyotishi-se-baat",
    h2: "Kab jyotishi se baat karein",
    paras: [
      "Jab score Dhyan Rakhein mein ho, ya koi dasha 6-8 bhav khol rahi ho, tab vistaar se kundali dikhana upyogi hai. Rohiit Gupta ke baare mein [yahan](/founder) padhiye.",
      "Aur kisi bhi takleef mein — sabse pehle doctor.",
    ],
  },
  {
    id: "health-astrology-in-hindi",
    h2: "Health astrology in Hindi — स्वास्थ्य ज्योतिष",
    paras: [
      "स्वास्थ्य ज्योतिष में लग्न शरीर है, लग्नेश शरीर का स्वामी, सूर्य आत्मा और जीवन-शक्ति, चन्द्र मन, छठा भाव रोग और आठवाँ आयु। यह कैलकुलेटर इन सातों को 100 अंकों में तौलता है और हर अंक के साथ ग्रंथ का श्लोक दिखाता है।",
      "परिणाम तीन शब्दों में आता है — **प्रबल** (आप स्वस्थ रहेंगे), **मध्यम** (सेहत ठीक रहेगी, कुछ बातों पर ध्यान) और **ध्यान रखें** (नियमित ध्यान और डॉक्टर से जाँच)। रोग का नाम कभी नहीं — केवल अंग का नाम, BPHS 4.4 के कालपुरुष से।",
      "पहली प्राथमिकता हमेशा डॉक्टर की जाँच है। ग्रंथ सावधानी बताता है, इलाज डॉक्टर करते हैं।",
    ],
  },
  {
    id: "bachchon-aur-buzurgon-ki-sehat",
    h2: "Bachchon aur buzurgon ki kundali mein sehat",
    paras: [
      "Calculator har umar ke liye ek hi niyam lagata hai, par padhne ka tareeka badalta hai. Bachchon ki kundali mein lagna aur Chandra par zyada dhyan diya jaata hai, kyunki shuruaati varshon mein Chandra ka bal mahatvapurn maana gaya hai. Buzurgon ki kundali mein 8ve bhav aur chal rahi dasha zyada maayne rakhti hai.",
      "Parivaar ke kisi sadasya ki kundali dekh rahe hain to unka sahi janm-samay pata karke hi bharein, aur nateeje ko unke doctor ki salaah ke saath hi padhein.",
    ],
  },
];

const PILLAR_2: PillarSection[] = [];

const FAQS = [
  {
    q: "Health prediction by date of birth kitna sahi hai?",
    a: "Ganana Swiss Ephemeris par hai aur niyam BPHS, Phaladipika aur Jataka Parijata se — har ank ke saath shlok. Ye sambhavna aur dhyan ke areas batata hai, nidaan nahi. Antim shabd doctor ka.",
  },
  {
    q: "Kya sirf janm-tithi se sehat jaani ja sakti hai?",
    a: "Nahi. Janm ka samay aur sthan bhi chahiye, kyunki lagna badalne se lagna-swami aur areas to watch badal jaate hain.",
  },
  {
    q: "Jeevan-shakti score kam aaya to kya karein?",
    a: "Ghabraiye nahi. Dhyan Rakhein ka arth bimari nahi — niyamit jaanch aur granth ke upay. Jo niyam sabse kam ank laya, uske grah ka upay pehle.",
  },
  {
    q: "6va swami 8ve ghar mein ho to kya bura hai?",
    a: "Nahi. Phaladipika 6 ke anusar 6va swami 6, 8 ya 12 mein ho aur 6ve par paap grah ho to Harsha yoga banta hai — mazboot sharir. 8va swami dusthana mein ho to Sarala yoga — deerghayu.",
  },
  {
    q: "Kya ye calculator bimari batata hai?",
    a: "Nahi. Ye rog ka naam kabhi nahi likhta — sirf wo ang jin par dhyan rakhna hai (BPHS 4.4 kalapurusha). Pehli prathmikta doctor ki jaanch.",
  },
  {
    q: "Vaat, pitta, kaph kundali se kaise pata chalta hai?",
    a: "BPHS 4.5 raashiyon ki prakriti batata hai. Lagna Mesh, Simha, Dhanu = pitta; Vrishabh, Kanya, Makar = vaat; Mithun, Tula, Kumbh = mishra; Kark, Vrischik, Meen = kaph.",
  },
  {
    q: "Kya ratna pehnne se sehat theek hogi?",
    a: "Ratna ilaaj nahi. Sahi grah ka ratna sahara de sakta hai, galat grah ka nuksaan. Pehle kundali se jaanch karein aur ilaaj kabhi na rokein.",
  },
  {
    q: "Kya ye aayu ya mrityu ka samay batata hai?",
    a: "Nahi. Ye sirf jeevan-shakti ka anumaan aur dhyan ke areas batata hai. Aayu ka saal hum kabhi nahi batate.",
  },
];

const COMPARE = [
  { f: "Harsha/Sarala yoga (Phaladipika 6)", tv: "Haan — 20 ank", as: "Aksar nahi", at: "Aksar nahi" },
  { f: "Kalapurusha se areas to watch (BPHS 4.4)", tv: "Haan", as: "Kabhi-kabhi", at: "Aksar nahi" },
  { f: "Prakriti — vaat/pitta/kaph (BPHS 4.5)", tv: "Haan", as: "Kabhi-kabhi", at: "Kabhi-kabhi" },
  { f: "Rog ke naam ki jagah ang ka naam", tv: "Haan — dar nahi", as: "Aksar nahi", at: "Aksar nahi" },
  { f: "Har ank ke saath shlok ka hawala", tv: "Haan", as: "Nahi", at: "Nahi" },
];

const READ_MORE = [
  { href: "/blog/vedic-health-astrology-kundli-guide", t: "Health Astrology — Complete Guide" },
  { href: "/blog/kundli-mein-bimari-kaise-dekhein", t: "कुंडली में बीमारी कैसे देखें" },
  { href: "/blog/manasik-swasthya-kundli-se", t: "कुंडली और मानसिक स्वास्थ्य" },
  { href: "/blog/sade-sati-career-money-health-marriage", t: "Sade Sati — Health par asar" },
];

const MORE_CALC = [
  { href: "/calculators/free-graha-bal-calculator", t: "Graha Bal Calculator" },
  { href: "/calculators/free-lagna-bal-calculator", t: "Lagna Bal Calculator" },
  { href: "/calculators/free-weak-planet-finder", t: "Weak Planet Finder" },
  { href: "/calculators/free-dasha-calculator", t: "Dasha Calculator" },
];

const ALL = [...PILLAR, ...PILLAR_2];

export default function FreeHealthPredictionCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-health-prediction-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Health Prediction by Date of Birth — स्वास्थ्य भविष्य',
    description:
      'Free health prediction by date of birth: Jeevan-shakti score out of 100 from the lagna, lagna lord, Sun, Moon and the 6th/8th lords (Harsha and Sarala yoga, Phaladipika 6), body areas to watch (BPHS 4.4 Kalapurusha) and Vata-Pitta-Kapha prakriti (BPHS 4.5). A doctor comes first — no diagnosis.',
    breadcrumbName: 'Health Prediction Calculator',
    aboutEntities: [
      'Health Astrology', 'Medical Astrology', 'Ascendant', 'Sixth House', 'Eighth House',
      'Sun', 'Moon', 'Harsha Yoga', 'Sarala Yoga', 'Kalapurusha', 'Ashtakavarga',
      'Brihat Parashara Hora Shastra', 'Phaladipika',
    ],
    knowsAbout: [
      'Vedic Astrology', 'Jyotish Shastra', 'BPHS 4.4', 'BPHS 4.5', 'Phaladipika 6',
      'Jataka Parijata', 'Vata Pitta Kapha', 'Health Prediction by Date of Birth',
    ],
    howToName: 'How to check health in your Kundali by date of birth',
    howToSteps: [
      { name: 'Enter birth details', text: 'Date, exact time and place of birth. The time matters because the ascendant changes every two hours.' },
      { name: 'The chart is computed', text: 'Swiss Ephemeris with Lahiri Ayanamsha builds the chart; seven classical rules score Jeevan-shakti out of 100 on the server.' },
      { name: 'Read the score, areas and prakriti', text: 'The band reads Prabal, Madhyam or Dhyan Rakhein; body areas to watch come from BPHS 4.4 and the constitution from BPHS 4.5. A doctor always comes first.' },
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
            <span style={{ color: '#94a3b8' }}>Health Prediction Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>
              Free Health Prediction by Date of Birth — स्वास्थ्य भविष्य
            </h1>
            <p className="text-sm m-0 font-semibold" style={{ color: '#FCD34D' }}>
              ⚕️ Pehli prathmikta doctor ki jaanch — hum sirf granth ki baat batate hain।
            </p>
            <p className="text-sm m-0 mt-1" style={{ color: '#94a3b8' }}>
              Jeevan-shakti score, areas to watch aur prakriti — BPHS, Phaladipika aur Jataka Parijata se, har ank ke saath uska shlok।
            </p>
          </header>

          {/* ── AEO / GEO direct answer, 40-60 words ─────────────────── */}
          <div className="tv-aeo-answer rounded-xl p-5 mb-6"
            style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed m-0">
              <strong style={{ color: GOLD }}>Health prediction by date of birth</strong> kundali ke{' '}
              <strong style={{ color: GOLD }}>lagna (sharir), lagna-swami, Surya, Chandra aur 6ve-8ve bhav</strong> se kiya jaata hai.{' '}
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Health Prediction Calculator</strong> in niyamon par 100 mein Jeevan-shakti score,
              BPHS 4.4 se areas to watch aur BPHS 4.5 se prakriti deta hai — doctor ki jaanch hamesha pehle.
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
                Engine: Swiss Ephemeris · Ashtakavarga · Lahiri Ayanamsha · Granth engine
              </div>
            </div>
          </div>

          {/* ── Boundary, stated before the tool ─────────────────────── */}
          <section className="rounded-xl p-4 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              चार बातें पहले ही साफ़ कर देना ज़रूरी है। <strong style={{ color: GOLD }}>पहली</strong> — ये चिकित्सा निदान (diagnosis) नहीं है; कोई भी तकलीफ़ हो तो डॉक्टर से मिलें।{' '}
              <strong style={{ color: GOLD }}>दूसरी</strong> — हम रोग का नाम नहीं लिखते, केवल शरीर का वह अंग जिस पर ध्यान रखना है (BPHS 4.4)।{' '}
              <strong style={{ color: GOLD }}>तीसरी</strong> — आयु या मृत्यु का समय नहीं बताया जाता।{' '}
              <strong style={{ color: GOLD }}>चौथी</strong> — दवा बंद करने या बदलने की सलाह हम कभी नहीं देते।
            </p>
          </section>

          {/* ── The calculator ───────────────────────────────────────── */}
          <YogCalculator config={{
            type: 'health-insight',
            genderRequired: false,
            scoreLabel: 'Jeevan-shakti Score',
            breakdownHeading: 'Har ank ki wajah — granth ke saath',
            hintsHeading: 'Granth ke upay',
            hintsTeaser: 'Aapke lagna-swami, Surya aur Chandra par aadharit',
            showNextStep: false,
            ctaHref: '/calculators',
            ctaLabel: 'Poori health reading — dekho',
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

          {/* ── 41 keyword-driven H2 sections ────────────────────────── */}
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
              Trikaal Vaani vs AstroSage vs AstroTalk — Health Prediction par
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak <strong style={{ color: GOLD }}>disha</strong> ka hai. Saamanya tools &ldquo;mazboot 6va bhav = achhi sehat&rdquo;
              maan lete hain. Phaladipika 6 ulta kehta hai — 6va aur 8va swami <strong style={{ color: GOLD }}>dusthana</strong> mein hon to Harsha
              aur Sarala yoga banta hai, jo sharir ko mazboot karta hai. Doosra farak <strong style={{ color: GOLD }}>bhasha</strong> ka hai: hum rog ka
              naam nahi, sirf ang ka naam likhte hain — aur sabse upar doctor ki jaanch.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <caption className="sr-only">Health prediction calculators ki tulna</caption>
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
              Aksar puche jaane wale sawaal — Health Prediction
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
              स्वास्थ्य ज्योतिष पर पूरा गाइड पढ़ें
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
