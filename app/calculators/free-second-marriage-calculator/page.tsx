'use client';

// ============================================================
// File: app/calculators/free-second-marriage-calculator/page.tsx
// Version: v1.0 — Second Marriage (Doosra Vivah) Calculator — 21 Sep 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// API: /api/calc/yog  (type: 'second-marriage') · Engine: lib/second-marriage-engine.ts
//
// ROHIIT KE FAISLE (21 Sep 2026):
//   * DIVORCE nahi, DOOSRA VIVAH — Bharat mein doosra vivah talaak ke baad hi.
//   * Sirf "doosra vivah" — BPHS 18.20-21 ka "3 / anek patni" NAHI.
//   * 100-ank table: BPHS 18.19 (24) · 7ve mein grah (18) · Rahu 7ve (12) ·
//     Shukra dvi-swabhav (12) · D-9 7va swami (14) · lagna-swami (10) · dasha (10).
//   * Band apni: 36+ prabal · 24+ madhyam · 12+ halka · kamzor.
//   * Page par "वैधव्य" kahin nahi — diplomatic. 8 chhupi lines sirf VM
//     /granth/product ('second-marriage') par, calculator ke result mein.
//
// CONTENT: 41 H2 · 54 inline internal link (sab ASLI — 33 /blog DB mein,
//   3 /learn, baaki calculator/service folder maujood) · ~4065 shabd · 8 FAQ.
// Dhaancha free-shadi-kab-hogi-calculator/page.tsx se — render code wahi,
// sirf content aur config badla.
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
    id: "second-marriage-calculator-by-date-of-birth",
    h2: "Second Marriage Calculator by Date of Birth — kaise kaam karta hai",
    paras: [
      "Ye calculator aapki **janm-tithi, samay aur sthan** se kundali banata hai aur doosre vivah ka yog **Brihat Parashara Hora Shastra (BPHS) 18.19-21**, Bhrigu Sutram aur Phaladipika ke niyamon par parakhta hai. Sirf janm-tithi kaafi nahi — lagna badalte hi 7va bhav badal jaata hai, isliye samay aur sthan zaroori hain. Apni poori kundali pehle [Free Janam Kundali](/calculators/free-janam-kundali-calculator) mein dekh sakte hain, aur lagna [Lagna Calculator](/calculators/free-lagna-calculator) se.",
      "Result mein do cheezein milti hain: **100 mein score** (saat niyam, har ek ka shlok ke saath) aur **granth ka faisla** — HAAN, HO SAKTA HAI ya NAHI. Score batata hai yog kitna prabal hai; faisla batata hai granth is baat ko sahara deta hai ya nahi.",
      "Har niyam alag se dikhta hai — kaunsa niyam laga, kitne ank mile aur kyun. Isliye aap khud dekh sakte hain ki score kahan se aaya. Koi chhupa hua formula nahi; har ank ke peechhe ek shlok hai jise aap granth mein milakar dekh sakte hain. Yahi is calculator ko doosron se alag banata hai.",
    ],
  },
  {
    id: "doosra-vivah-yog-kya-hai",
    h2: "Doosra vivah ka yog kya hota hai?",
    paras: [
      "Jyotish mein **doosra vivah yog** (dvi-kalatra yog) woh sanyog hai jo kundali mein ek se zyada vivah ki sambhavna dikhata hai. Ye 7ve bhav, uske swami, kalatra karak aur Navamsa ki haalat se banta hai. Pehle vivah ka yog kaise padha jaata hai, wo [kundali mein vivah yog](/blog/kundali-mein-vivah-yog) mein vistar se hai.",
      "Dhyan rahe — yog ka hona nishchit ghatna nahi hai. Granth sambhavna batata hai; upay, samay aur jeevan ke faisle us sambhavna ko badalte hain. Bharat mein doosra vivah kaanoon ke hisaab se pehle vivah ke samaapt hone ke baad hi hota hai.",
      "Shastra mein is vishay ko \"kalatra\" (jeevansaathi) ke bhav se padha jaata hai. Purane granthon mein \"do patni\" ya \"anek patni\" ki baat hai, jo us samay ki samajik vyavastha thi. Aaj ke sandarbh mein hum sirf doosre vivah ki sambhavna dekhte hain — \"teen ya anek\" wale niyam jaan-boojh kar chhode gaye hain, kyunki anuvadak Santhanam khud likhte hain ki ve aaj vyavaharik nahi.",
    ],
  },
  {
    id: "bphs-18-19-mool-niyam",
    h2: "BPHS 18.19 — Parashar ka do-vivah ka mool niyam",
    paras: [
      "Maharshi Parashar **BPHS adhyay 18, shlok 19** mein kehte hain: do vivah tab hote hain jab **7va swami neech ho**, ya **paap raashi mein paap grah ke saath** ho, aur saath hi **7va bhav ya 7va Navamsa napunsak grah ka** ho. Ye is calculator ka sabse bhaari niyam hai — 24 ank.",
      "Anuvadak R. Santhanam spasht karte hain ki napunsak ka arth hai Mithun, Kanya, Makar aur Kumbh raashi. Dono shartein ek saath poori hon to poora yog banta hai; ek hi poori ho to aadha. 7va bhav kamzor hone ke doosre kaaran [7ve ghar ki kamzori](/blog/7th-house-weak-marriage-delay-reasons) mein hain.",
      "Is niyam ki khaas baat ye hai ki ye do alag cheezein ek saath maangta hai — 7ve swami ki kamzori aur 7ve bhav ka napunsak swabhav. Sirf ek ho to sanket halka hai; dono hon to Parashar ise spasht do-vivah yog kehte hain. Isliye calculator dono ko alag se tolta hai aur poora yog hone par hi 24 ank deta hai.",
    ],
  },
  {
    id: "napunsak-grah-budh-shani",
    h2: "Napunsak grah — Budh aur Shani ki bhoomika",
    paras: [
      "Shastra mein **Budh aur Shani napunsak grah** maane gaye hain. Jab inki raashi (Mithun, Kanya, Makar, Kumbh) 7ve bhav par ho, ya D-9 mein 7va bhav inka ho, to vivah ke maamle mein sthirta kam maani jaati hai — BPHS 18.19 isi ko do-vivah ka ek aadhaar kehta hai.",
      "Iska arth ye nahi ki Budh ya Shani bure hain. Budh ki dasha ka asar [Budh mahadasha](/blog/budh-mahadasha-career-mercury) mein aur Shani ka [Shani mahadasha](/blog/shani-mahadasha-effects-guide) mein padh sakte hain — donon grah sahi sthiti mein bahut shubh phal dete hain.",
      "BPHS mein grahon ka ling bataya gaya hai — Surya, Mangal, Guru purush; Chandra, Shukra stree; aur Budh, Shani napunsak. Vivah jaise sambandh ke bhav mein napunsak grah ki raashi hona isiliye sthirta ki kami ka sanket maana gaya hai. Ye ek shastriya tark hai, koi andhvishwas nahi.",
    ],
  },
  {
    id: "saptamesh-neech",
    h2: "7va swami neech ho to kya hota hai?",
    paras: [
      "7va swami (saptamesh) vivah aur jeevansaathi ka pratinidhi hai. Jab wo apni **neech raashi** mein ho — jaise Shukra Kanya mein, Guru Makar mein, Shani Mesh mein — to BPHS 18.19 ke anusar ye do-vivah yog ki pehli shart poori karta hai.",
      "Neech grah ka bal Shadbala se naapa jaata hai. Aapke saptamesh ki asli taakat [Graha Bal Calculator](/calculators/free-graha-bal-calculator) mein dekh sakte hain. Neech-bhang ho jaaye to asar kaafi kam ho jaata hai — isliye akele neech hona antim faisla nahi.",
      "Neech-bhang ke kai niyam granth mein hain — jaise neech grah ki raashi ka swami kendra mein ho, ya neech grah uchch grah ke saath ho. Aise mein neech ka asar ulta shubh bhi ho sakta hai. Isliye calculator neech ko ek sanket maanta hai, antim faisla nahi.",
    ],
  },
  {
    id: "paap-raashi-paap-grah",
    h2: "Paap raashi mein paap grah ke saath 7va swami",
    paras: [
      "BPHS 18.19 ki doosri raah: 7va swami **paap raashi** (Mangal, Shani ya Surya ki raashi — Mesh, Vrishchik, Makar, Kumbh, Simha) mein ho aur wahan **paap grah ke saath** baitha ho. Paap grah hain Surya, Mangal, Shani, Rahu aur Ketu.",
      "Is sthiti mein saptamesh dabaav mein maana jaata hai. Poori kundali ka santulan [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) se dekhein — ek kamzor grah ko baaki mazboot grah sambhal lete hain.",
    ],
  },
  {
    id: "chandra-7ve-ghar",
    h2: "7ve ghar mein Chandra — Bhrigu Sutram 2.44",
    paras: [
      "**Bhrigu Sutram 2.44** ke anusar Chandra 7ve bhav mein ho to \"do vivah ka yog\" kaha gaya hai. Chandra mann ka karak hai — 7ve ghar mein wo rishton mein bhavnaatmak utaar-chadhaav la sakta hai.",
      "Is calculator mein 7ve ghar ke Chandra, Guru aur Shukra — teeno ke 6-6 ank hain. Chandra ki dasha ka mann par asar [Chandra mahadasha](/blog/chandra-mahadasha-mental-health) mein padh sakte hain.",
      "Chandra ki kala bhi dekhni chahiye — badhta Chandra (Shukla paksh) zyada shubh hai, ghat-ta Chandra (Krishna paksh) kam. Badhta hua mazboot Chandra 7ve ghar mein ho, to rishton mein bhavnaatmak gehraai deta hai, jo kathinai ko sambhaalne mein madad karti hai.",
    ],
  },
  {
    id: "guru-7ve-ghar",
    h2: "7ve ghar mein Guru — Bhrigu Sutram 5.36",
    paras: [
      "**Bhrigu Sutram 5.36** kehta hai ki Guru 7ve bhav mein ho to \"doosra vivah hota hai\". Guru shubh grah hai, par Bhrigu parampara mein 7ve ghar ka Guru is vishay mein alag sanket deta hai.",
      "Guru stree ki kundali mein pati-karak bhi hai. Guru ki dasha [Guru mahadasha](/blog/guru-mahadasha-wisdom-growth) mein, aur Pukhraj pehnne ki uchitata [Should I Wear Pukhraj](/calculators/free-should-i-wear-pukhraj) mein dekh sakte hain.",
      "Guru ki 7ve ghar se lagna par drishti padti hai, jo vyakti ko samajhdaar aur dharmik banati hai. Isliye 7ve ghar ka Guru doosre vivah ka sanket dene ke saath hi us vivah mein samajhdari aur sthirta bhi la sakta hai. Poori tasveer ke liye Guru ka bal zaroor dekhein.",
    ],
  },
  {
    id: "shukra-7ve-ghar",
    h2: "7ve ghar mein Shukra — Bhrigu Sutram 6.40",
    paras: [
      "**Bhrigu Sutram 6.40** ke anusar Shukra 7ve bhav mein ho to \"do vivah ka yog\" kaha gaya hai. Shukra swayam kalatra karak hai — 7ve ghar mein uska hona prem aur aakarshan ko badhata hai, jo kabhi ek se zyada sambandh ki ore bhi le jaata hai.",
      "7va swami aur Shukra ka aapas mein sambandh [7va swami aur Shukra](/blog/seventh-lord-venus-reunion-astrology) mein samjhaaya gaya hai.",
    ],
  },
  {
    id: "rahu-7ve-ghar",
    h2: "Rahu 7ve ghar mein — Bhrigu Sutram 8.20 \"niyam se\"",
    paras: [
      "**Bhrigu Sutram 8.20** sabse spasht shabdon mein kehta hai: Rahu 7ve bhav mein ho to \"**niyam se do vivah** hote hain\". Isliye is calculator mein Rahu 7ve ghar mein hone ke poore 12 ank hain.",
      "Rahu achaanak badlaav aur aparamparagat raah ka grah hai. Rahu ko samajhne ke liye [Rahu kya hai](/blog/what-is-rahu), aur uski dasha ke asar [Rahu mahadasha](/blog/rahu-mahadasha-effects-guide) mein padhein.",
      "Bhrigu Sutram ke adhyay grah-dar-grah hain — adhyay 8 Rahu aur Ketu ka hai. Wahan 7ve ghar ke Rahu ke liye \"niyam se\" shabd ka prayog ye dikhata hai ki Bhrigu parampara ise sabse nishchit sanketon mein ginti hai. Phir bhi, Guru ki shubh drishti 7ve ghar par ho to Rahu ka asar kaafi naram ho jaata hai.",
    ],
  },
  {
    id: "phaladipika-10-5",
    h2: "Phaladipika 10.5 — grahon ki sankhya se vivah ki sankhya",
    paras: [
      "Mantreshwar ki **Phaladipika 10.5** ek mahatvapurna baat kehti hai: do vivah ka yog ho to **7ve ghar mein saath baithe grahon se vivah ki sankhya** jaani jaati hai. Yani 7ve ghar mein jitne zyada grah, utna prabal sanket.",
      "Isliye is calculator mein 7ve ghar ke har shubh grah (Chandra, Guru, Shukra) ke alag ank judte hain — adhiktam 18. Pehle vivah ka samay [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) se dekh sakte hain.",
      "Phaladipika dakshin Bharat ka prasiddh granth hai jise Mantreshwar ne likha. Uska adhyay 10 kalatra (jeevansaathi) bhav par hai. Wahan diya gaya ye niyam ki grahon ki sankhya se vivah ki sankhya jaani jaati hai, isiliye is calculator mein har grah ke ank alag judte hain.",
    ],
  },
  {
    id: "shukra-dvi-swabhav",
    h2: "Shukra dvi-swabhav raashi mein — BPHS 18.21",
    paras: [
      "**BPHS 18.21** mein Shukra ki **dvi-swabhav raashi** (Mithun, Kanya, Dhanu, Meen) ka zikr hai. Dvi-swabhav raashi ka swabhav badalne wala hota hai — Shukra yahan ho to vivah ke maamle mein ek se zyada avsar ka sanket maana jaata hai. Is niyam ke 12 ank hain.",
      "Shukra ka ratna pehnna aapke lagna par nirbhar hai — [Should I Wear Heera](/calculators/free-should-i-wear-heera) Parashar ki lagna-soochi se batata hai.",
      "Dvi-swabhav raashiyan — Mithun, Kanya, Dhanu, Meen — dohri prakriti ki hoti hain. Inme baitha grah do tarah ke phal deta hai. Shukra jaise vivah-karak grah ka yahan hona isliye vivah ke maamle mein ek se zyada avsar ka sanket maana gaya hai, khaaskar jab uska swami bhi bali ho.",
    ],
  },
  {
    id: "navamsa-d9",
    h2: "Navamsa (D-9) aur doosra vivah",
    paras: [
      "BPHS ke anusar **Navamsa (D-9) vivah ka varga** hai — janm-kundali mein jo yog hai, uski asli taakat D-9 mein dikhti hai. BPHS 18.19 mein \"7va Navamsa napunsak grah ka ho\" wali shart isi varga ki hai.",
      "D-9 mein jeevansaathi ka karak Darakaraka bhi dekha jaata hai. Uski bhoomika [Darakaraka](/blog/darakaraka-planets-reunion-astrology) mein padh sakte hain.",
      "Navamsa ko \"vivah ki kundali\" kehte hain kyunki janm-kundali ka 7va bhav sirf ek jhalak deta hai, jabki D-9 us vivah ki gehraai dikhata hai. Janm-kundali mein mazboot 7va bhav par D-9 kamzor ho, to vivah mein bahar se sab theek dikhta hai par andar kathinai rehti hai. Isliye dono dekhna zaroori hai.",
    ],
  },
  {
    id: "d9-saptamesh-kamzor",
    h2: "D-9 ka 7va swami kamzor ho to",
    paras: [
      "Jab Navamsa mein 7va swami **neech** ho ya **6, 8, 12** (dusthana) mein ho, to vivah ka D-9 kamzor maana jaata hai — ye doosre vivah ka sahayak sanket hai. Neech ho to 14 ank, dusthana mein ho to 10.",
      "Samay ka asar dasha se aata hai. Apni poori dasha [Dasha Calculator](/calculators/free-dasha-calculator) mein dekhein.",
    ],
  },
  {
    id: "lagna-swami-bphs-24",
    h2: "Lagna-swami aur doosra vivah — BPHS 24",
    paras: [
      "**BPHS adhyay 24** har bhav-swami ke phal batata hai. Lagna-swami **1, 2, 3 ya 6** bhav mein ho to shlok 24.1-3 aur 24.6 mein \"do ya anek vivah\" ka zikr hai. Is niyam ke 10 ank hain.",
      "Santhanam tippani karte hain ki 6ve bhav ka lagna-swami ek se zyada vivah ya jeevansaathi se door rehne ka sanket de sakta hai. Lagna ka bal [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator) mein dekhein.",
      "Lagna-swami vyakti ka apna pratinidhi hai. Uska 1, 2, 3 ya 6 bhav mein hona uske swabhav aur jeevan ki disha batata hai. BPHS 24 ke shlok isi sthiti ke saath vivah ki sankhya ka zikr karte hain — isliye calculator ise ek sahayak sanket ki tarah ginta hai.",
    ],
  },
  {
    id: "dasha-aur-samay",
    h2: "Dasha aur doosre vivah ka samay",
    paras: [
      "Yog janm se hota hai, par wo **dasha mein khulta hai**. 7ve swami, Shukra ya Rahu ki mahadasha-antardasha mein vivah ke vishay sakriya hote hain. Ye niyam parampara se hai, granth se seedha nahi — isliye iske sirf 10 ank hain.",
      "Samay ka gyaan [dasha timing](/blog/dasha-timing-reconnection-astrology) mein, aur Shukra ki antardasha ka vivah par asar [Shukra antardasha vivah yog](/blog/shukra-antardasha-vivah-yog) mein.",
      "Vimshottari dasha 120 saal ka chakra hai jismein har grah apna samay chalata hai. Doosre vivah ka yog kundali mein ho, to wo tab sakriya hota hai jab 7ve swami, Shukra (purush) ya Guru (stree), ya Rahu ki dasha aaye. Gochar mein Guru ka 7ve bhav par aana bhi ek sahayak sanket maana jaata hai.",
    ],
  },
  {
    id: "stree-kundali",
    h2: "Stree ki kundali mein doosra vivah — Guru karak",
    paras: [
      "Stree ki kundali mein **pati ka karak Guru** maana jaata hai. Isliye is calculator mein ling ke hisaab se karak badalta hai — stree ke liye Guru ki sthiti dekhi jaati hai. BPHS adhyay 80 (Stri Jataka) stree ki kundali ke vishesh niyam deta hai.",
      "Prem aur vivah ke milaan ki baat [love marriage kundali matching](/blog/love-marriage-kundali-matching) mein hai.",
      "BPHS adhyay 80 mein stree ki kundali ke liye vishesh niyam hain — 7ve aur 8ve bhav ko saath dekha jaata hai. Guru mazboot aur shubh sthiti mein ho, to vivah mein sthirta ka sanket hota hai. Guru kamzor ya paap prabhav mein ho, to vivah ke maamle mein savdhaani ki salaah di jaati hai.",
    ],
  },
  {
    id: "purush-kundali",
    h2: "Purush ki kundali mein doosra vivah — Shukra karak",
    paras: [
      "Purush ki kundali mein **patni ka karak Shukra** hai. Isliye purush ke liye Shukra ki sthiti, raashi aur bal dekha jaata hai. Shukra dvi-swabhav raashi mein ho ya 7ve ghar mein ho, to doosre vivah ka sanket badhta hai.",
      "Shukra ka doshon se sambandh [Shukra aur Pitra Dosh](/blog/venus-and-pitra-dosh) mein padh sakte hain.",
      "Purush ki kundali mein Shukra ka bal, uski raashi aur uspar padne wali drishti — teeno dekhe jaate hain. Shukra uchch (Meen) ya swaraashi (Vrishabh, Tula) mein ho to sukh ka sanket hai; par Meen dvi-swabhav raashi bhi hai, isliye wahan doosre vivah ka sanket bhi judta hai. Is barikee ko calculator alag se tolta hai.",
    ],
  },
  {
    id: "kalatra-karak-ling",
    h2: "Kalatra karak — ling se kyun badalta hai",
    paras: [
      "**Kalatra karak** woh grah hai jo jeevansaathi ka pratinidhi karta hai. Shastra ke anusar purush ke liye Shukra aur stree ke liye Guru. Isliye form mein ling bharna zaroori hai — galat ling se galat grah padha jaayega.",
      "Isi tarah videshi jeevansaathi ka yog [Foreign Spouse Calculator](/calculators/free-foreign-spouse-calculator) ling ke hisaab se dekhta hai.",
      "Ye niyam isliye zaroori hai kyunki ek hi kundali mein Shukra aur Guru ki sthiti bahut alag ho sakti hai. Agar stree ki kundali mein galti se Shukra padha jaaye, to jawab poori tarah badal sakta hai. Isliye form mein ling ka khaana anivarya rakha gaya hai.",
    ],
  },
  {
    id: "score-kaise-padhein",
    h2: "Score kaise padhein — prabal, madhyam, halka, kamzor",
    paras: [
      "Doosre vivah ka yog **durlabh** hai, isliye zyadatar kundaliyon ka score 10-35 ke beech aata hai. Is calculator ki seema: **36+ prabal** (BPHS 18.19 ka poora yog + Rahu 7ve mein), **24+ madhyam**, **12+ halka**, aur usse kam **kamzor**.",
      "Kamzor grah kaunsa hai, wo [Weak Planet Finder](/calculators/free-weak-planet-finder) batata hai.",
      "Doosre calculators — jaise sarkari naukri ya videsh yog — ke ank zyada aate hain, isliye unki seema 60/48/36 hai. Doosre vivah ka yog kam logon mein hota hai, isliye uski seema neeche rakhi gayi hai. Warna har grahak ko ek hi jawab \"kamzor\" milta aur calculator ka koi arth nahi rehta. Ye seema granth ke ek poore yog (24 + 12 = 36) par tiki hai.",
    ],
  },
  {
    id: "granth-ka-faisla",
    h2: "Granth ka faisla — HAAN, HO SAKTA HAI, NAHI",
    paras: [
      "Score ke saath granth ka faisla bhi milta hai. Ye faisla aapki kundali par lagi granth ki lines se banta hai — kitni lines is yog ko sahara deti hain aur kitni virodh karti hain. **HAAN** matlab granth sahara deta hai, **HO SAKTA HAI** matlab mila-jula, **NAHI** matlab granth sahara nahi deta.",
      "Vivah se pehle do kundaliyon ka milaan [Kundali Milan](/kundali-milan) mein karein.",
      "Score aur faisla alag-alag cheezein naapte hain. Score saat niyamon ka jod hai; faisla aapki kundali par lagne wali saari granth lines ka nichod hai. Kabhi score madhyam aur faisla HAAN aa sakta hai — iska arth hai ki niyam kam lage par jo lage, unhe granth mazbooti se sahara deta hai.",
    ],
  },
  {
    id: "doosri-shadi-ka-yog-kab",
    h2: "Doosri shadi ka yog kab banta hai?",
    paras: [
      "Doosri shadi ka yog tab **sakriya** hota hai jab uske grahon ki dasha chale aur gochar sahara de. Yog ho par dasha na ho, to sambhavna dormant rehti hai. Isliye samay jaanna utna hi zaroori hai jitna yog.",
      "Umar aur samay ka shastriya hisaab [kis umar mein vivah hoga](/learn/what-age-will-i-get-married) mein hai.",
    ],
  },
  {
    id: "kya-doosra-vivah-safal-hoga",
    h2: "Kya doosra vivah safal hoga?",
    paras: [
      "Doosre vivah ki safalta 2ra bhav (kutumb), 7va bhav aur Guru-Shukra ke bal par nirbhar karti hai. Is calculator ka score yog ki prabalta batata hai, safalta nahi — safalta ke liye dono kundaliyon ka milaan zaroori hai.",
      "Gun milaan kaise hota hai, wo [36 gun milan](/blog/36-guna-milan-explained) mein samjhaaya gaya hai.",
      "Safalta ka ek bada sanket 2ra bhav hai, jo kutumb aur parivaarik sthirta dikhata hai. 2re bhav par shubh grah ya shubh drishti ho, to doosra vivah sthir hone ki sambhavna badhti hai. Guru aur Shukra dono mazboot hon to jeevansaathi se sukh ka sanket hota hai.",
    ],
  },
  {
    id: "pehle-vivah-kathinai",
    h2: "Pehle vivah mein kathinai ke sanket",
    paras: [
      "Granth kuch sthitiyon mein pehle vivah par **kathin yog** batata hai — jaise 7ve ghar par paap prabhav, saptamesh ka dusthana mein hona. Ye sanket hain, nishchit ghatna nahi; upay aur samajhdari se kaafi kuch badalta hai.",
      "Vivah mein deri ke kaaran [vivah mein deri kyun](/learn/why-is-my-marriage-delayed) mein vistar se hain.",
    ],
  },
  {
    id: "mangal-dosh-aur-doosra-vivah",
    h2: "Mangal dosh aur doosra vivah",
    paras: [
      "Mangal 1, 2, 4, 7, 8 ya 12 bhav mein ho to **Mangal dosh** banta hai, jo vivah mein kathinai ka sanket maana jaata hai. BPHS 80.49 ke anusar dono jeevansaathi manglik hon to dosh ka bhang ho jaata hai.",
      "Mangal dosh kya hai, wo [Mangal dosh kya hai](/blog/what-is-mangal-dosha) mein, aur apni jaanch [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) mein karein.",
      "Mangal dosh ke kai parihar granth mein hain — Mangal apni raashi mein ho, uchch ho, ya Guru ki drishti mein ho, to dosh naram hota hai. Isliye sirf \"manglik\" sunkar ghabraana theek nahi. Poori kundali dekhkar hi Mangal dosh ka asli bal tay hota hai.",
    ],
  },
  {
    id: "kaal-sarp-dosh",
    h2: "Kaal Sarp dosh ka vivah par asar",
    paras: [
      "Jab saare grah Rahu-Ketu ki dhuri ke ek taraf hon to **Kaal Sarp dosh** kaha jaata hai. Ye aadhunik parampara ka yog hai — BPHS mein iska naam nahi. Kai jyotishi ise vivah mein deri se jodte hain.",
      "Iska vivah par asar [Kaal Sarp dosh aur vivah](/blog/kaal-sarp-dosh-marriage) mein, aur jaanch [Kaal Sarp Dosh Calculator](/calculators/free-kaal-sarp-dosh-calculator) mein.",
    ],
  },
  {
    id: "pitra-dosh",
    h2: "Pitra dosh aur vivah mein deri",
    paras: [
      "**Pitra dosh** poorvajon se jude karmic rinn ka sanket hai. Parampara mein ise vivah mein deri aur rukawat se joda jaata hai. Iska nivaaran shraadh aur tarpan se bataya gaya hai.",
      "Vivah par iska asar [Pitra dosh aur vivah mein deri](/blog/pitra-dosh-marriage-delay) mein, aur jaanch [Pitra Dosh Calculator](/calculators/free-pitra-dosh-calculator) mein.",
    ],
  },
  {
    id: "sade-sati",
    h2: "Sade Sati aur vivah",
    paras: [
      "Shani ki **Sade Sati** saadhe saat saal ka samay hai jab Shani Chandra-raashi ke aas-paas gochar karta hai. Is dauran vivah ke faisle sochkar lene ki salaah di jaati hai — Shani dheere par pakka phal deta hai.",
      "Sade Sati ka vivah par asar [Sade Sati aur vivah](/blog/sade-sati-career-money-health-marriage) mein, aur apni jaanch [Sade Sati Calculator](/calculators/free-sade-sati-calculator) mein.",
    ],
  },
  {
    id: "upapada-lagna",
    h2: "Upapada lagna — jeevansaathi ka sanket",
    paras: [
      "Jaimini parampara mein **Upapada lagna (UL)** jeevansaathi ka sanket hai — BPHS adhyay 30 mein iska vistar hai. UL se 2ra bhav vivah ki sthirta dikhata hai. Ye is calculator ke score mein nahi hai, par gehri reading mein dekha jaata hai.",
      "Naam se kundali milaan ki saral vidhi [naam se kundali milan](/blog/naam-se-kundali-milan) mein hai.",
      "Upapada ki ganana thodi jatil hai — 12ve bhav ka \"pad\" nikaala jaata hai. Isliye ye saral calculator ke score mein nahi joda gaya. Gehri reading mein Upapada aur usse 2re bhav ka vishleshan doosre vivah ki sthirta ke baare mein zyada sateek jaankari deta hai.",
    ],
  },
  {
    id: "darakaraka",
    h2: "Darakaraka aur jeevansaathi",
    paras: [
      "Jaimini karakon mein **Darakaraka** sabse kam ansh wala grah hai, aur wo jeevansaathi ka karak maana jaata hai. Uski sthiti se jeevansaathi ka swabhav padha jaata hai.",
      "7ve ghar mein Mangal ka vivah par asar [Mangal dosh 7ve ghar mein](/blog/mangal-dosh-7th-house-effects) mein padhein.",
    ],
  },
  {
    id: "saptam-bhav-kamzor",
    h2: "7va bhav kamzor — vivah ki kathinai",
    paras: [
      "7va bhav kamzor ho — uska swami dusthana mein, paap drishti mein ya neech — to vivah mein kathinai ka sanket hota hai. Yahi kathinai kai baar doosre vivah ki bhoomika banti hai.",
      "Kundali mein Mangal dosh ke lakshan [Mangal dosh ke sanket](/blog/signs-of-mangal-dosh-in-kundli) mein hain.",
    ],
  },
  {
    id: "doosre-vivah-ke-upay",
    h2: "Doosre vivah ke liye upay — granth se",
    paras: [
      "Granth grah ki peeda ka upay **mantra-jaap, havan aur daan** batata hai (BPHS adhyay 84). Doosre vivah ki sthirta ke liye 7ve swami, Shukra aur Guru ki shanti ki salaah di jaati hai.",
      "Mangal ke upay [Mangal dosh ke upay](/blog/mangal-dosh-remedies) mein vistar se hain.",
      "Upay ka arth darna nahi, sudharna hai. Granth ka tareeka saaf hai — jis grah ki peeda ho, uska mantra, uski samidha se havan, aur uska daan. Ratna pehnna parampara hai, granth nahi; granth ka mool upay mantra aur havan hai. Result mein aapke apne grahon ke hisaab se granth ka upay diya jaata hai.",
    ],
  },
  {
    id: "shukra-ke-upay",
    h2: "Shukra ko mazboot karne ke upay",
    paras: [
      "Purush ki kundali mein Shukra kalatra karak hai. BPHS 84.17 ke anusar Shukra ki shanti \"**Annat Parisrutah**\" mantra ke solah hazaar jaap aur gular ki samidha se havan se hoti hai. Shukravar ko safed vastu ka daan bhi parampara mein bataya gaya hai.",
      "Mangal dosh se jude bhram [Mangal dosh ke myths](/blog/manglik-myths) mein door kiye gaye hain.",
    ],
  },
  {
    id: "guru-ke-upay",
    h2: "Guru ke upay — stree ke liye",
    paras: [
      "Stree ki kundali mein Guru pati-karak hai. BPHS 84.17 ke anusar Guru ki shanti \"**Brihaspate**\" mantra ke unnees hazaar jaap aur peepal ki samidha se havan se hoti hai. Guruvar ko peeli vastu ka daan parampara mein hai.",
      "Manglik hone par kya karein, wo [main manglik hoon — kya karoon](/blog/i-am-manglik-what-to-do) mein hai.",
    ],
  },
  {
    id: "kundali-milan-zaroori",
    h2: "Kundali milan — doosre vivah se pehle zaroori",
    paras: [
      "Doosre vivah se pehle **dono kundaliyon ka milaan** aur bhi zaroori hai. Ashtakoot ke 36 gun, Nadi, Bhakoot aur Mangal dosh — sab dekhne chahiye. Gehre milaan ke liye [Compatibility reading](/services/compatibility) upalabdh hai.",
      "Manglik aur non-manglik ke vivah ki baat [manglik aur non-manglik vivah](/blog/manglik-non-manglik-marriage) mein hai.",
      "Doosre vivah mein pichhle anubhav ki vajah se savdhaani aur zaroori ho jaati hai. Nadi dosh, Bhakoot dosh aur Mangal dosh ko khaas dhyan se dekhna chahiye. Muhurta Chintamani ke parihar niyam bhi kai doshon ko naram karte hain — isliye kewal gun-sankhya par faisla na karein.",
    ],
  },
  {
    id: "vivah-muhurat",
    h2: "Doosre vivah ka muhurat",
    paras: [
      "Vivah ka muhurat panchang se chuna jaata hai — tithi, nakshatra, yog aur lagna shuddh hone chahiye. Doosre vivah ke liye bhi wahi niyam lagte hain. Shubh tithi [Vivah Muhurat](/vivah-muhurat) mein dekh sakte hain.",
      "Manglik ke liye vishesh muhurat [manglik vivah muhurat 2026](/blog/manglik-vivah-muhurat-2026) mein hain.",
    ],
  },
  {
    id: "vivah-rekha",
    h2: "Vivah rekha — hast rekha kya kehti hai",
    paras: [
      "Hast rekha mein chhoti ungli ke neeche ki **vivah rekha** vivah ke sanket deti hai. Do ya adhik spasht rekhayein kabhi ek se zyada mahatvapurna sambandh ka sanket maani jaati hain. Ye kundali ka vikalp nahi, ek alag parampara hai.",
      "Vivah rekha ka arth [vivah rekha ka matlab](/blog/vivah-rekha-marriage-line-matlab) aur [marriage line meaning](/blog/marriage-line-vivah-rekha-meaning) mein hai.",
    ],
  },
  {
    id: "kanoon-aur-doosra-vivah",
    h2: "Doosra vivah aur kaanoon — Bharat mein",
    paras: [
      "Bharat mein Hindu Vivah Adhiniyam ke anusar ek samay mein ek hi vivah maanya hai. **Doosra vivah pehle vivah ke kaanooni roop se samaapt hone ke baad** hi ho sakta hai. Isliye ye calculator \"talaak\" nahi, doosre vivah ki sambhavna dekhta hai.",
      "Vyaktigat salaah ke liye [marriage astrologer](/blog/marriage-astrologer-near-me-online) se baat kar sakte hain.",
    ],
  },
  {
    id: "generic-se-alag",
    h2: "Hamara tareeka generic calculators se alag kyun",
    paras: [
      "Kai calculator \"9va ghar = doosra vivah\" jaise saamanya niyam lagate hain. Trikaal Vaani **seedhe Parashar ke BPHS 18.19** aur Bhrigu Sutram ke shlok se chalta hai — har ank ke saath uska shlok bhi dikhata hai. Jahan granth chup hai, wahan hum saaf likhte hain ki ye parampara hai.",
      "Teen bade doshon ka tulnatmak adhyayan [Mangal vs Kaal Sarp vs Pitra dosh](/blog/mangal-dosh-vs-kaal-sarp-vs-pitra-dosh) mein hai.",
      "Hum har niyam ke saath shlok ka hawala dete hain — BPHS 18.19, Bhrigu 8.20, Phaladipika 10.5. Aap kisi bhi jyotishi se pooch sakte hain ki ye niyam granth mein hai ya nahi. Jahan koi niyam parampara se aata hai (jaise dasha wala), wahan hum saaf \"parampara\" likhte hain — granth ka naam galat nahi lete.",
    ],
  },
  {
    id: "granth-ki-reedh",
    h2: "Granth hamari reedh — AI nahi, shlok",
    paras: [
      "Is calculator ka har vaakya granth se hai — koi AI apni taraf se bhavishyavani nahi likhta. Kundali Swiss Ephemeris (Lahiri Ayanamsha) se banti hai, aur phal BPHS, Bhrigu Sutram, Phaladipika aur Jataka Parijata ke shlokon se. Is paddhati ke nirmata **Rohiit Gupta** (Chief Vedic Architect) hain.",
      "Mangal dosh ke sach aur bhram [kya Mangal dosh asli hai](/blog/is-mangal-dosh-real-or-fake) mein hain.",
    ],
  },
  {
    id: "seemayein",
    h2: "Is calculator ki seemayein — kya nahi batata",
    paras: [
      "Ye calculator **yog ki prabalta** batata hai — ye nahi batata ki kis vyakti se vivah hoga, ya pehla vivah kab aur kaise samaapt hoga. Ye bhavishya ki nishchit tareekh bhi nahi deta. Granth sambhavna batata hai, antim faisla nahi.",
      "Prem vivah ka yog [prem vivah ka yog](/learn/will-i-have-love-marriage) mein, aur manglik vivah ke bhram [kya manglik vivah khatarnak hai](/blog/manglik-marriage-dangerous) mein.",
      "Jyotish sambhavna ka shastra hai. Ek hi yog do alag logon par alag asar karta hai, kyunki poori kundali, dasha aur jeevan ke faisle alag hote hain. Isliye is calculator ko ek disha-soochak ki tarah dekhein — antim faisla apni samajh aur zaroorat pade to kisi anubhavi jyotishi ki salaah se lein.",
    ],
  },
];

const PILLAR_2: PillarSection[] = [];

const FAQS = [
  {
    q: "Second marriage calculator by date of birth kitna sahi hai?",
    a: "Ye BPHS 18.19-21, Bhrigu Sutram aur Phaladipika ke niyamon par chalta hai aur har ank ke saath shlok dikhata hai. Ye yog ki sambhavna batata hai — nishchit ghatna nahi.",
  },
  {
    q: "Kya sirf janm-tithi se doosra vivah jaana ja sakta hai?",
    a: "Nahi. Janm ka samay aur sthan bhi chahiye, kyunki lagna badalne se 7va bhav badal jaata hai.",
  },
  {
    q: "Doosre vivah ka sabse bada yog kaunsa hai?",
    a: "BPHS 18.19 — 7va swami neech ya paap raashi mein paap grah ke saath ho, aur 7va bhav ya Navamsa napunsak grah (Budh/Shani) ka ho. Rahu 7ve ghar mein bhi Bhrigu 8.20 ke anusar prabal yog hai.",
  },
  {
    q: "Rahu 7ve ghar mein ho to kya do vivah pakke hain?",
    a: "Bhrigu Sutram 8.20 \"niyam se do vivah\" kehta hai, par poori kundali, Guru ki drishti aur dasha bhi dekhni chahiye. Akela ek yog antim faisla nahi.",
  },
  {
    q: "Stree aur purush ke liye alag kyun?",
    a: "Kalatra karak alag hai — purush ke liye Shukra, stree ke liye Guru. Isliye ling bharna zaroori hai.",
  },
  {
    q: "Score kam aaya to kya matlab?",
    a: "Doosre vivah ka yog durlabh hai, isliye zyadatar score kam aate hain. Kam score ka arth hai doosre vivah ka yog kamzor hai.",
  },
  {
    q: "Kya ye talaak batata hai?",
    a: "Nahi. Ye doosre vivah ki sambhavna dekhta hai. Bharat mein doosra vivah pehle vivah ke kaanooni roop se samaapt hone ke baad hi hota hai.",
  },
  {
    q: "Doosre vivah ke liye kaunse upay hain?",
    a: "BPHS adhyay 84 ke anusar 7ve swami, Shukra aur Guru ki shanti — mantra-jaap, havan aur daan. Result mein aapke grahon ke hisaab se granth ka upay milta hai.",
  },
];

const COMPARE = [
  { f: "BPHS 18.19 — Parashar ka asli niyam", tv: "Haan — 24 ank, shlok ke saath", as: "Aksar nahi", at: "Aksar nahi" },
  { f: "Bhrigu Sutram 8.20 (Rahu 7ve mein)", tv: "Haan — 12 ank", as: "Kabhi-kabhi", at: "Kabhi-kabhi" },
  { f: "Ling ke hisaab se karak (Shukra/Guru)", tv: "Haan — zaroori field", as: "Nahi", at: "Nahi" },
  { f: "Navamsa D-9 ka 7va swami", tv: "Haan — 14 ank", as: "Aksar nahi", at: "Aksar nahi" },
  { f: "Har ank ke saath shlok ka hawala", tv: "Haan", as: "Nahi", at: "Nahi" },
];

const READ_MORE = [
  { href: "/blog/kundali-mein-vivah-yog", t: "कुंडली में विवाह योग — पूरा गाइड" },
  { href: "/learn/why-is-my-marriage-delayed", t: "विवाह में देरी क्यों" },
  { href: "/blog/7th-house-weak-marriage-delay-reasons", t: "सातवाँ भाव कमज़ोर — कारण" },
  { href: "/blog/what-is-rahu", t: "राहु क्या है" },
];

const MORE_CALC = [
  { href: "/calculators/free-shadi-kab-hogi-calculator", t: "Shadi Kab Hogi Calculator" },
  { href: "/kundali-milan", t: "Kundali Milan — गुण मिलान" },
  { href: "/calculators/free-manglik-dosh-calculator", t: "Free Manglik Dosh Calculator" },
  { href: "/calculators/free-foreign-spouse-calculator", t: "Foreign Spouse Calculator" },
];

const ALL = [...PILLAR, ...PILLAR_2];

export default function FreeSecondMarriageCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-second-marriage-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Second Marriage Calculator by Date of Birth — दूसरा विवाह योग',
    description:
      'Free Second Marriage Calculator by date of birth. Parashar ke BPHS 18.19 niyam, Bhrigu Sutram aur Phaladipika se doosre vivah ka yog, samay aur classical upay — har ank ke saath shlok.',
    breadcrumbName: 'Second Marriage Calculator',
    aboutEntities: [
      'Second Marriage', 'Dvi Kalatra Yoga', 'Seventh House', 'Navamsa', 'Venus',
      'Jupiter', 'Rahu', 'Brihat Parashara Hora Shastra', 'Vimshottari Dasha',
    ],
    knowsAbout: [
      'Vedic Astrology', 'Jyotish Shastra', 'BPHS 18.19', 'Bhrigu Sutram',
      'Phaladipika', 'Navamsa D-9', 'Second Marriage Astrology',
    ],
    howToName: 'How to check second marriage yoga in your Kundali by date of birth',
    howToSteps: [
      { name: 'Enter birth details and gender', text: 'Date, exact time and place of birth, plus gender. Gender is required because the Kalatra Karaka is Venus for a man and Jupiter for a woman.' },
      { name: 'The chart is computed', text: 'Swiss Ephemeris with Lahiri Ayanamsha builds your Kundali and the Navamsa D-9, then seven classical rules score the second-marriage yoga out of 100.' },
      { name: 'Read the score and the granth verdict', text: 'Every rule shows its points and the sloka behind it (BPHS 18.19, Bhrigu 8.20, Phaladipika 10.5), and the granth verdict says HAAN, HO SAKTA HAI or NAHI.' },
    ],
    faqs: FAQS,
    dateModified: '2026-09-21',
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
            <span style={{ color: '#94a3b8' }}>Second Marriage Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>
              Second Marriage Calculator by Date of Birth — दूसरा विवाह योग
            </h1>
            <p className="text-sm m-0" style={{ color: '#94a3b8' }}>
              BPHS 18.19, Bhrigu Sutram aur Navamsa D-9 se — doosre vivah ka yog, har ank ke saath uska shlok।
            </p>
          </header>

          {/* ── AEO / GEO direct answer, 40-60 words ─────────────────── */}
          <div className="tv-aeo-answer rounded-xl p-5 mb-6"
            style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed m-0">
              <strong style={{ color: GOLD }}>Doosra vivah (second marriage)</strong> ka yog kundali ke{' '}
              <strong style={{ color: GOLD }}>7ve bhav, 7ve swami, Shukra aur Navamsa (D-9)</strong> se padha jaata hai. BPHS 18.19 mein Parashar kehte hain ki 7va swami neech ho aur 7va bhav napunsak grah ka ho, to do vivah ka yog banta hai.{' '}
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Second Marriage Calculator</strong> in niyamon par 100 mein score aur granth ka faisla deta hai.
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
              चार बातें पहले ही साफ़ कर देना ज़रूरी है। <strong style={{ color: GOLD }}>पहली</strong> — ये दूसरे विवाह की <em>सम्भावना</em> बताता है, निश्चित घटना नहीं; ग्रंथ सम्भावना बताता है, अंतिम फ़ैसला नहीं।{' '}
              <strong style={{ color: GOLD }}>दूसरी</strong> — ये तलाक की भविष्यवाणी नहीं करता। भारत में दूसरा विवाह पहले विवाह के क़ानूनी रूप से समाप्त होने के बाद ही होता है। ग्रंथ की कुछ कठिन पंक्तियाँ हम नरम शब्दों में देते हैं।{' '}
              <strong style={{ color: GOLD }}>तीसरी</strong> — जीवनसाथी की जाति, धर्म, समुदाय या देश नहीं बताया जाता।{' '}
              <strong style={{ color: GOLD }}>चौथी</strong> — ये नहीं बताता कि किस व्यक्ति से विवाह होगा, या पहला विवाह कब और कैसे समाप्त होगा।
            </p>
          </section>

          {/* ── The calculator ───────────────────────────────────────── */}
          <YogCalculator config={{
            type: 'second-marriage',
            genderRequired: true,
            scoreLabel: 'Second Marriage Yog Score',
            breakdownHeading: 'Har point ki wajah — shlok ke saath',
            hintsHeading: 'Granth ke upay',
            hintsTeaser: 'Aapke 7ve swami, Shukra aur Guru par aadharit',
            showNextStep: false,
            ctaHref: '/calculators',
            ctaLabel: 'Doosre vivah ka yog — dekho',
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
              Trikaal Vaani vs AstroSage vs AstroTalk — Doosre Vivah par
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak <strong style={{ color: GOLD }}>shlok</strong> ka hai. Zyadatar free tools &ldquo;9va ghar = doosra vivah&rdquo;
              jaisa saamanya niyam lagate hain. Hum seedhe Parashar ke <strong style={{ color: GOLD }}>BPHS 18.19</strong> se chalte
              hain — wahi is calculator ke 100 mein se 24 ank uthata hai. Doosra farak{' '}
              <strong style={{ color: GOLD }}>karak</strong> ka hai: purush ke liye Shukra, stri ke liye Guru.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <caption className="sr-only">Second marriage calculators ki tulna</caption>
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
              Aksar puche jaane wale sawaal — Second Marriage
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
