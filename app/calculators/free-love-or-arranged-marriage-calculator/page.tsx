'use client';

// ============================================================
// File: app/calculators/free-love-or-arranged-marriage-calculator/page.tsx
// Version: v1.1 — seema 20/35 (Rohiit), button "Love ya Arranged", meter — 22 Sep 2026
// Version: v1.0 — Love or Arranged Marriage Prediction — 22 Sep 2026
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// API: /api/calc/yog (type: 'love-arranged') · Engine: lib/love-arranged-engine.ts
//      (ADAPTER — score VM ke granth_api v3.8 love_jhukaav() se) · Feedback: /api/calc/vivah-feedback
//
// ROHIIT KE FAISLE (22 Sep 2026):
//   * ⚖️ Granth mein love/arranged ka niyam NAHI — 10 sanket JYOTISH PARAMPARA ke,
//     har jagah label. Nateeja "jhukaav", daava nahi. Page par sach BINA KISI GINTI.
//   * "Sach Seekhne Wala": shaadi-shuda log apna asli jawab dete hain (vivah_feedback),
//     ank har mahine asli data se badlenge. POORA MUFT.
//   * Seema (Rohiit): <20 ARRANGED · 20-34 DONO KA MEL · 35+ LOVE — "love ki taraf 35% bhi ho to
//     love marriage; aaj live-in, bhaag kar shaadi bahut aam"
//   * Title Rohiit ka: Radar ka hubahu phrase "love or arranged marriage prediction by date of birth"
//
// CONTENT: 44 H2 · 46 inline link (sab ASLI — 26 /blog + 3 /learn DB mein jaanche,
//   16 folder maujood) · ~4000 shabd · 10 FAQ.
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

// Har heading Radar ke asli Google sawaalon par (love or arranged marriage prediction
// by date of birth, love marriage yog in kundli, which planet gives love marriage...).
const PILLAR: PillarSection[] = [
  {
    id: "love-or-arranged-marriage-prediction-by-date-of-birth",
    h2: "Love or Arranged Marriage Prediction by Date of Birth — ye calculator kaise kaam karta hai",
    paras: [
      "Ye calculator aapki **janm-tithi, samay, sthan aur ling** se Swiss Ephemeris par kundali banata hai aur **10 parampara-sanket** dekhta hai — 5ve-7ve swami ka sambandh, Shukra, Mangal, Rahu, Chandra, 11va ghar aur Navamsa (D-9). Nateeja teen shabdon mein aata hai: **Love ki or jhukaav, Dono ka mel ya Arranged ki or jhukaav**.",
      "Saath mein aapke vivah ka samay bhi milta hai — ye hissa asli granth se hai, BPHS ki dasha-paddhati se. Vivah ka poora granth-aadhaar hamare [Shadi Kab Hogi calculator](/calculators/free-shadi-kab-hogi-calculator) mein hai.",
      "Ye poora calculator **muft** hai — koi taala nahi, koi ₹51 nahi, koi login nahi.",
    ],
  },
  {
    id: "pehle-sach",
    h2: "Pehle sach — granth mein love/arranged ka niyam nahi",
    paras: [
      "Hamne BPHS, Jataka Parijata, Phaladipika, Bhrigu Sutram, Brihat Jataka aur Chamatkar Chintamani — chhahon granth khol kar dekhe. **Love ya arranged vivah ka seedha niyam kisi mein nahi hai.** BPHS vivah ke samay, jeevansaathi ke swabhav aur ek se adhik vivah par bolta hai — par 'apni pasand ka vivah' par nahi.",
      "Jo niyam internet par 'love marriage yog' ke naam se milte hain, wo **jyotish parampara** ke hain. Hamne unhe asli, jaani-maani shaadiyon par jaancha — aur love marriage wale logon mein ye sanket aam logon jitne hi mile. Isliye hum 'jhukaav' kehte hain, daava nahi.",
      "Doosre tools inhi niyamon ko 'shastra' bata kar dete hain. Hum wo nahi karenge — hamara niyam hai: jahan granth chup hai, wahan hum bhi saaf batayenge.",
      "Ye imaandari hamari kamzori nahi, taakat hai. Jab koi calculator 'aapki love marriage pakki hai' kehta hai, to wo aapki zindagi ke sabse bade faisle par ek andaaza thop raha hota hai. Hum aapko sanket dikhate hain, unka srot batate hain, aur saaf kehte hain ki ye parampara hai — faisla aapka.",
    ],
  },
  {
    id: "sach-seekhne-wala-calculator",
    h2: "Ye calculator 'sach seekhne wala' kyun hai?",
    paras: [
      "Nateeje ke neeche ek sawaal aata hai: **'Kya aapki shaadi ho chuki hai? Love, arranged ya love-cum-arranged?'** Shaadi-shuda log ek click se apna asli jawab dete hain — naam kabhi nahi liya jaata, sirf kundali ke saath jawab judta hai.",
      "Har mahine hum dekhte hain ki kaunsa sanket asli love marriages mein sach mein zyada milta hai. Jo kaam karta hai wo rehta hai, jo nahi karta wo hatta hai. Yani ye calculator har mahine thoda aur sahi hota jaata hai — aapke jawab se.",
      "Isse ek aur fayda hai: jo sanket aaj kamzor lag rahe hain, ho sakta hai Bharatiya shaadiyon mein unka asar alag ho. Pashchim mein har vivah apni pasand ka hota hai, Bharat mein nahi — isliye asli Bharatiya jawab hi asli sach batayenge. Aap jitna jawab denge, utna sahi hoga.",
    ],
  },
  {
    id: "teen-nateeje-kaise-padhein",
    h2: "Love ki or jhukaav, Dono ka mel, Arranged ki or jhukaav — kaise padhein",
    paras: [
      "**Love ki or jhukaav** — aapki kundali mein apni pasand ke vivah ke kai parampara-sanket ek saath hain. **Dono ka mel** — kuch sanket hain; aksar pasand aapki hoti hai aur parivaar ki raazi-khushi bhi. **Arranged ki or jhukaav** — love ke sanket kam hain; parampara ise parivaar ki pasand ke vivah ki or maanti hai.",
      "Teeno mein se koi bhi 'achha' ya 'bura' nahi. Arranged vivah kamzor nahi, aur love vivah zyada safal nahi — ye sirf raasta batata hai, manzil nahi.",
      "Score ki seema ek asli kundali se tay hui: jis vyakti ka vivah arranged tha, uska score seema ke andar arranged ki or aaya. Aaj ke daur mein apni pasand ke vivah — live-in se lekar parivaar ki raay ke bina vivah tak — tezi se badh rahe hain, isliye love ka jhukaav 35% sanket par hi maana jaata hai. Aam taur par lagbhag aadhe log arranged ki or, ek-tihaai 'dono ka mel' mein aur har paanch mein ek love ki or aata hai. Har nateeje ke saath sanket aur unki wajah likhi hoti hai.",
    ],
  },
  {
    id: "date-of-birth-se-kaise-jane",
    h2: "Date of birth se kaise jane love marriage hogi ya arrange",
    paras: [
      "Sirf janm-tithi kaafi nahi — **samay aur sthan** bhi chahiye, kyunki 5va aur 7va ghar lagna se tay hote hain, aur lagna har do ghante mein badalta hai. Isliye form mein teeno maange jaate hain.",
      "Samay pata na ho to calculator 12 baje maan leta hai — tab nateeje ko saavdhaani se padhein. Apna lagna jaanne ke liye [Lagna Calculator](/calculators/free-lagna-calculator) aur poori kundali ke liye [Janam Kundali Calculator](/calculators/free-janam-kundali-calculator) muft hai.",
    ],
  },
  {
    id: "love-marriage-yog-in-kundli",
    h2: "Love marriage yog in kundli — 10 parampara sanket",
    paras: [
      "Calculator ye 10 sanket dekhta hai: **5ve-7ve swami ka sambandh (25), Rahu ka 5/7 se judna (15), Shukra-Mangal (10), 11ve mein 5L/7L (10), Navamsa mein 5-7 (10), 5ve swami lagna mein (10)**, aur 5-5 ank ke — Chandra-Shukra, Shukra 5/7 mein, 7ve swami 3re mein, Shukra lagna mein.",
      "Ye ank shuruaati hain. Jaise-jaise shaadi-shuda log apna jawab dete hain, hum dekhte hain kaunsa sanket sach mein farak karta hai, aur ank usi hisaab se badalte hain. Is vishay ki poori jaankari [Love Marriage vs Arranged Marriage](/learn/love-marriage-vs-arranged-marriage) mein hai.",
      "Har sanket ke aage '(parampara)' likha aata hai taaki aap jaanein ki ye granth ka niyam nahi. Result mein dikhta hai ki kaunse sanket aapki kundali mein mile aur kaunse nahi — aur har ek ka asli kaaran, jaise '5ve swami Budh 9ve ghar mein, 7ve swami Surya 8ve ghar mein — sambandh nahi'.",
    ],
  },
  {
    id: "5th-aur-7th-lord-ka-sambandh",
    h2: "5th aur 7th lord ka sambandh — sabse bada sanket",
    paras: [
      "5va ghar prem aur manchaahi cheezon ka hai, 7va vivah ka. Parampara kehti hai ki jab in dono ke swami **saath baithein, ghar badlein (parivartan), ek-doosre ke ghar mein hon ya ek-doosre ko dekhein**, to prem aur vivah jud jaate hain.",
      "Calculator ise sabse zyada — 25 ank — deta hai: saath ya parivartan par poore 25, ek-doosre ke ghar mein 20, aapsi drishti 15, ek taraf ki drishti 10. Vivah ke yog ki granth wali tasveer ke liye [Kundali mein vivah yog](/blog/kundali-mein-vivah-yog) padhiye.",
      "Drishti ke liye saamanya niyam liya gaya hai: har grah saatvi drishti se dekhta hai, Mangal chauthi aur aathvi, Guru paanchvi aur naumi, Shani teesri aur dasvi bhi. Parivartan ka matlab hai 5va swami 7ve ghar mein aur 7va swami 5ve ghar mein — ek-doosre ke ghar ki adla-badli.",
    ],
  },
  {
    id: "which-planet-gives-love-marriage",
    h2: "Which planet gives love marriage? — prem vivah kaun sa grah deta hai",
    paras: [
      "Parampara mein teen grah sabse zyada liye jaate hain: **Shukra** (prem aur aakarshan), **Rahu** (parampara se hatkar chunav) aur **Mangal** (josh aur saahas). Chandra bhavna ka karak hai, isliye Chandra-Shukra ka jod bhi dekha jaata hai.",
      "Par koi ek grah akela love marriage nahi deta — ye sab milkar 'jhukaav' banate hain. Grahon ka bal alag se dekhna ho to [Graha Bal Calculator](/calculators/free-graha-bal-calculator) chalaiye.",
      "Shukra ka bal jaanna ho to [Weak Planet Finder](/calculators/free-weak-planet-finder) se dekhiye ki wo kamzor to nahi. Kamzor Shukra ka arth pyaar ki kami nahi — bas us grah ko sahara chahiye. Rahu ke baare mein [Rahu ki mahadasha](/blog/rahu-mahadasha-effects-guide) mein vistaar hai.",
    ],
  },
  {
    id: "shukra-mangal",
    h2: "Shukra–Mangal — aakarshan ka jod",
    paras: [
      "Shukra prem hai aur Mangal josh. Dono saath hon to parampara ise tez aakarshan maanti hai — calculator 10 ank deta hai; ek-doosre ko dekhein to 7.",
      "Mangal 7ve ghar se juda ho to manglik ka sawaal bhi uthta hai — uski jaanch [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) se kijiye aur [Mangal 7ve ghar mein](/blog/mangal-dosh-7th-house-effects) padhiye.",
    ],
  },
  {
    id: "rahu-aur-prem-vivah",
    h2: "Rahu aur prem vivah — parampara kya kehti hai",
    paras: [
      "Rahu parampara todne wala grah maana jaata hai. Wo 5ve ya 7ve ghar mein ho to 15 ank, 5ve ya 7ve swami ke saath ho to 12 — parampara ise apni pasand ya alag tarah ke vivah ki or maanti hai.",
      "Rahu ka aakarshan kabhi-kabhi jaldbaazi bhi hota hai — pyaar aur aakarshan ka farak [Rahu–Guru: obsession ya asli pyaar](/blog/rahu-jupiter-obsession-or-real-love-astrology) mein samjhaya gaya hai.",
      "2026 ke Rahu-Ketu gochar ka rishton par asar [Rahu-Ketu transit 2026 aur love relationships](/blog/rahu-ketu-transit-2026-effect-on-love-relationships) mein padhiye — par yaad rahe, gochar akela ghatna nahi deta; dasha ke saath hi asar dikhata hai.",
    ],
  },
  {
    id: "chandra-shukra",
    h2: "Chandra–Shukra — bhavna aur prem",
    paras: [
      "Chandra mann hai, Shukra prem. Dono saath hon to bhavnaon se bhara, romantic swabhav maana jaata hai — calculator 5 ank deta hai.",
      "Mann ki sehat par Chandra ka asar alag vishay hai; yahan sirf prem ki pravritti dekhi jaati hai.",
    ],
  },
  {
    id: "11va-ghar-ichchha-poorti",
    h2: "11va ghar — ichchha-poorti ka ghar",
    paras: [
      "11va ghar manokamna poori hone ka hai. 5ve ya 7ve ghar ka swami yahan ho to parampara kehti hai ki mann ki baat — prem ya vivah — poori hoti hai. Calculator 10 ank deta hai.",
      "Ye sanket akela kaafi nahi, par doosre sanketon ke saath mazboot hota hai.",
    ],
  },
  {
    id: "navamsa-se-prem-vivah",
    h2: "Navamsa kundali se prem vivah (D-9)",
    paras: [
      "Navamsa vivah ki kundali maani jaati hai. Agar D-9 mein bhi 5ve aur 7ve swami jude hon — saath, ya ek-doosre ke ghar mein — to parampara use sanket ki pushti maanti hai. Calculator 10 ank deta hai.",
      "Navamsa aur 7ve ghar ki granth wali baatein [Vivah yog in kundli](/blog/vivah-yog-in-kundli-marriage-combinations) mein hain.",
      "Navamsa lagna janm-lagna ke ansh se nikalta hai, isliye ismein janm-samay aur bhi zyada maayne rakhta hai — 13-14 minute ka farak bhi Navamsa badal sakta hai. Samay pakka na ho to is sanket ko kam bharose se lijiye.",
    ],
  },
  {
    id: "shukra-5ve-7ve-mein",
    h2: "Shukra 5ve ya 7ve ghar mein",
    paras: [
      "Prem ka karak khud prem (5) ya vivah (7) ke ghar mein ho to parampara ise romantic jhukaav maanti hai — 5 ank.",
      "7ve ghar mein Shukra jeevansaathi ke liye bhi shubh maana jaata hai — [7ve swami aur Shukra](/blog/seventh-lord-venus-reunion-astrology) padhiye.",
    ],
  },
  {
    id: "5ve-swami-lagna-mein",
    h2: "5ve swami lagna mein — prem ka swami khud aap mein",
    paras: [
      "5ve ghar ka swami lagna (aap khud) mein ho to parampara kehti hai ki vyakti apne mann ki sunta hai — prem ke maamle mein bhi. Calculator 10 ank deta hai.",
      "Ye naya sanket hai — isko hum khaas taur par feedback-data se jaanch rahe hain.",
    ],
  },
  {
    id: "7ve-swami-3re-ghar-mein",
    h2: "7ve swami 3re ghar mein — vivah apni koshish se",
    paras: [
      "3ra ghar parakram aur apni koshish ka hai. Vivah ka swami yahan ho to parampara ise 'vivah apni pehel se' maanti hai — 5 ank.",
      "Ye bhi naya sanket hai aur asli jawabon se parkha ja raha hai.",
    ],
  },
  {
    id: "shukra-lagna-mein",
    h2: "Shukra lagna mein",
    paras: [
      "Shukra lagna mein ho to vyaktitva mein aakarshan aur prem ki pravritti maani jaati hai — 5 ank.",
      "Shukra ka ratna Heera hai, par pehle jaanch zaroori — [Should I Wear Heera](/calculators/free-should-i-wear-heera).",
    ],
  },
  {
    id: "love-marriage-hone-ke-sanket",
    h2: "Love marriage hone ke sanket kya hain?",
    paras: [
      "Upar ke 10 sanketon mein se jitne zyada ek saath milein, jhukaav utna love ki or. Kisi ek sanket se kuch tay nahi hota — parampara bhi kai sanketon ka mel dekhti hai.",
      "Is sawaal ka jaankari-roop jawab [Will I have love marriage?](/learn/will-i-have-love-marriage) mein hai.",
    ],
  },
  {
    id: "arranged-marriage-ke-sanket",
    h2: "Arranged marriage ke sanket — jab love-sanket kam hon",
    paras: [
      "Parampara mein arranged ke alag sanket kam hain; aksar love-sanketon ki kami ko hi arranged ki or jhukaav maana jaata hai. Isliye calculator ka score kam ho to nateeja 'Arranged ki or jhukaav' aata hai.",
      "Bharat mein aaj bhi zyadatar vivah parivaar ki pasand se hote hain — isliye ye nateeja sabse aam hai, aur isme koi kami nahi.",
    ],
  },
  {
    id: "love-cum-arranged",
    h2: "Love-cum-arranged — Bharat ka sabse badhta roop",
    paras: [
      "Pasand ladke-ladki ki, aur raazi-khushi parivaar ki — ye aaj ke Bharat ka sabse badhta roop hai. Kuch sanket hon par bahut nahi, to calculator 'Dono ka mel' kehta hai.",
      "Is roop mein kundali milan bhi aksar hota hai — [Love marriage mein kundali milan](/blog/love-marriage-kundali-matching) padhiye.",
      "Aksar aisa hota hai ki do log ek-doosre ko pasand karte hain, phir parivaar milte hain, kundali milti hai aur shaadi 'arranged' tareeke se hoti hai. Shaadi-shuda log feedback mein ise 'Love-cum-arranged' chun sakte hain — ye alag jawab isliye rakha gaya hai kyunki Bharat mein ye bahut aam hai.",
    ],
  },
  {
    id: "shaadi-kab-hogi",
    h2: "Shaadi kab hogi — vivah ka samay (BPHS dasha)",
    paras: [
      "Love ho ya arranged, samay granth se dekha jaata hai: BPHS ke anusar jis mahadasha-antardasha mein 7va ghar khule, wahi vivah ka samay. Calculator ye tareekhon ke saath batata hai.",
      "Poori vivah-yog report ke liye [Shadi Kab Hogi calculator](/calculators/free-shadi-kab-hogi-calculator) aur dasha ke liye [Dasha Calculator](/calculators/free-dasha-calculator).",
      "Samay ka ye hissa sirf dasha par nahi rukta — dasha ke andar Guru aur Shani ka gochar bhi dekha jaata hai, par gochar kabhi akela nahi. Hamara engine gochar sirf usi daur mein dikhata hai jab dasha 7va ghar khol rahi ho.",
    ],
  },
  {
    id: "shukra-antardasha-vivah",
    h2: "Shukra ki antardasha aur vivah",
    paras: [
      "Shukra vivah ka naisargik karak hai, isliye uski antardasha mein vivah ki baat aksar uthti hai — [Shukra antardasha aur vivah yog](/blog/shukra-antardasha-vivah-yog) mein vistaar hai.",
      "Stree ki kundali mein Guru bhi pati ka karak hai — isliye calculator ling ke hisaab se karak badalta hai.",
    ],
  },
  {
    id: "7va-ghar-kamzor",
    h2: "7va ghar kamzor ho to",
    paras: [
      "7va ghar kamzor ho to vivah mein der ya adchan ka sanket maana jaata hai — ye love ya arranged se alag sawaal hai. Kaaran [7va ghar kamzor — shaadi mein der](/blog/7th-house-weak-marriage-delay-reasons) mein hain.",
      "Der ka poora vishleshan [Why is my marriage delayed?](/learn/why-is-my-marriage-delayed) mein padhiye.",
    ],
  },
  {
    id: "love-marriage-mein-kundali-milan",
    h2: "Love marriage mein kundali milan zaroori hai?",
    paras: [
      "Pyaar ho to bhi kai parivaar milan dekhte hain. 36 guna ka milan Muhurta Chintamani ki paddhati hai — [36 guna milan kya hai](/blog/36-guna-milan-explained). Milan karne ke liye [Kundali Milan](/kundali-milan) muft hai.",
      "Sirf naam se milan ki seema [Naam se kundali milan](/blog/naam-se-kundali-milan) mein samjhayi gayi hai.",
      "Milan se pehle dono ki kundali mein manglik dosh ki jaanch bhi zaroori maani jaati hai. Aur agar milan mein guna kam aayein, to iska arth rishta tootna nahi — [Manglik aur vivah ke myths](/blog/manglik-myths) bhi padhiye.",
    ],
  },
  {
    id: "manglik-aur-love-marriage",
    h2: "Manglik aur love marriage",
    paras: [
      "Love marriage mein manglik ka dar sabse aam hai. [Manglik aur non-manglik vivah](/blog/manglik-non-manglik-marriage) aur [Mangal dosh aur milan](/blog/mangal-dosh-marriage-compatibility) padhiye.",
      "Manglik hain to ghabraiye nahi — [Main manglik hoon, kya karoon?](/blog/i-am-manglik-what-to-do).",
    ],
  },
  {
    id: "intercaste-love-marriage-yog",
    h2: "Intercaste love marriage yog — hum jaati kyon nahi batate",
    paras: [
      "Internet par 'antarjaatiya prem vivah yog' ke niyam milte hain. Granth mein aisa koi niyam nahi, aur jaati batana samaj mein bhed badhata hai — isliye hum jaati, dharm ya samuday ki bhavishyavani nahi karte.",
      "Hum sirf itna batate hain jitna parampara ke sanket aur granth ki dasha keh sakti hai.",
      "Hamari report jeevansaathi ki jaati, dharm, rang ya desh nahi batati. Jahan tak granth jaata hai — samay, ghar ki haalat, karak ka bal — wahi batate hain; baaki par imaandari se chup rehte hain.",
    ],
  },
  {
    id: "parivaar-ki-sahmati",
    h2: "Parivaar ki sahmati — kundali kya keh sakti hai, kya nahi",
    paras: [
      "Kundali se parivaar ki 'haan' ya 'na' ka pakka niyam granth mein nahi. Hum ise kundali par nahi chhodte — ye aapsi baatcheet aur samajh ka vishay hai.",
      "Rishton par grahon ke saamanya asar ke liye [Rahu-Ketu gochar 2026 aur pyaar](/blog/rahu-ketu-gochar-2026-pyar-rishtey-par-asar) padh sakte hain.",
    ],
  },
  {
    id: "love-marriage-ke-upay",
    h2: "Love marriage ke upay — granth ke anusar",
    paras: [
      "Granth love marriage ka upay nahi batata, par vivah-sukh ke liye 7ve swami, Shukra aur (stree ke liye) Guru ki shanti ke upay BPHS ke upay-adhyayon mein hain — mantra-jaap, havan aur daan.",
      "Upay shraddha se karein; kisi ki ichchha ke khilaf kuch karane ka koi upay nahi hota, aur hum aisa kabhi nahi batate.",
      "Parampara mein Shukra ke liye shukravaar ka vrat, safed vastu ka daan aur Shukra-mantra ka jaap bataya jaata hai; Guru ke liye guruvaar aur peeli vastu. Kaunsa grah aapke liye kamzor hai, wo pehle jaanchiye — sabke liye ek hi upay sahi nahi hota.",
    ],
  },
  {
    id: "prem-aur-vivah-ke-liye-ratna",
    h2: "Prem aur vivah ke liye ratna — pehle jaanch",
    paras: [
      "Shukra ke liye Heera, Guru ke liye Pukhraj — par galat grah ka ratna nuksaan bhi kar sakta hai. Pehle jaanchiye: [Should I Wear Pukhraj](/calculators/free-should-i-wear-pukhraj) aur [Gemstone Calculator](/calculators/free-gemstone-calculator).",
      "Ratna vivah 'nahi dilata' — ye sirf kamzor grah ko sahara deta hai.",
    ],
  },
  {
    id: "love-marriage-yog-in-palmistry",
    h2: "Love marriage yog in palmistry — vivah rekha",
    paras: [
      "Haath ki vivah rekha par bhi log love marriage dhoondhte hain — [Vivah rekha ka arth](/blog/marriage-line-vivah-rekha-meaning) aur [Vivah rekha matlab](/blog/vivah-rekha-marriage-line-matlab) padhiye.",
      "Hast rekha aur kundali alag vidya hain; yahan hum sirf kundali dekhte hain.",
    ],
  },
  {
    id: "gen-z-aur-rishte",
    h2: "Gen Z aur rishte",
    paras: [
      "Aaj ki peedhi ke rishton ke sawaal alag hain — [Gen Z love aur commitment](/blog/gen-z-love-commitment-relationship-issues-astrology) mein vistaar se.",
      "Rishta toot gaya ho aur wapas chahiye, to wo alag vishay hai — [Ex back aur jyotish](/blog/ex-back-reunion-astrology).",
    ],
  },
  {
    id: "doosri-shaadi-love-ya-arranged",
    h2: "Doosri shaadi love hogi ya arranged?",
    paras: [
      "Pehli shaadi ke baad doosre vivah ka yog alag niyamon se dekha jaata hai — BPHS 18.19 se. Iske liye [Second Marriage Calculator](/calculators/free-second-marriage-calculator) hai.",
      "Yahan ke sanket pehle vivah ke liye hain.",
    ],
  },
  {
    id: "videshi-jeevansaathi",
    h2: "Videshi jeevansaathi",
    paras: [
      "Jeevansaathi videsh se ya videsh mein basne ka yog alag sawaal hai — [Foreign Spouse Calculator](/calculators/free-foreign-spouse-calculator) aur [Videshi jeevansaathi aur basna](/blog/foreign-spouse-marriage-settlement-astrology).",
      "Love marriage aur videsh ka koi seedha granth-niyam nahi.",
    ],
  },
  {
    id: "purush-aur-stree-ke-liye-alag",
    h2: "Purush aur stree ke liye alag kyun? (Shukra / Guru)",
    paras: [
      "Kalatra karak purush ke liye Shukra aur stree ke liye Guru hai — isliye ling bharna zaroori hai. [Venus aur Jupiter — ling ka farak](/blog/gender-differences-reunion-astrology-venus-jupiter) padhiye.",
      "10 parampara-sanket dono ke liye ek hain; karak aur vivah ka samay ling ke hisaab se dekhe jaate hain.",
    ],
  },
  {
    id: "prediction-kitna-sahi",
    h2: "Love or arranged prediction kitna sahi hai?",
    paras: [
      "Seedha jawab: ye **parampara ka jhukaav** hai, granth ka niyam nahi. Hamari jaanch mein purane sanket kamzor nikle, isliye hum aapke jawabon se ise lagataar behtar kar rahe hain.",
      "Vivah ka samay (dasha) granth se hai aur us par zyada bharosa kiya ja sakta hai.",
      "Ganana Swiss Ephemeris aur Lahiri ayanamsha par hai. Sanket aur unke ank har mahine asli jawabon se jaanche jaate hain. Jo sanket asli love marriages ko alag nahi kar paata, use hum hata denge — chahe wo kitna bhi prasiddh kyun na ho.",
    ],
  },
  {
    id: "janm-samay-kyun-zaroori",
    h2: "Janm-samay kyun zaroori hai",
    paras: [
      "5va aur 7va ghar lagna se banta hai. Samay galat ho to sanket badal sakte hain — isliye sahi samay bharein.",
      "Samay pakka na ho to [Nakshatra Calculator](/calculators/free-nakshatra-calculator) jaisi cheezein Chandra se kaam karti hain, par ye calculator lagna par tika hai.",
    ],
  },
  {
    id: "poora-muft",
    h2: "Poora muft — koi taala nahi",
    paras: [
      "Is calculator mein koi paid hissa nahi — saare 10 sanket unki wajah ke saath, nateeja aur vivah ka samay, sab muft.",
      "Badle mein bas ek chhota sa sahyog — agar shaadi ho chuki hai, to ek click mein apna asli jawab dijiye.",
      "Muft hone ka arth kam gunvatta nahi — engine wahi hai jo hamare paid calculators mein hai. Is calculator ka asli mool aapka jawab hai, isliye hum ise kisi paywall ke peeche nahi rakhte.",
    ],
  },
  {
    id: "kab-jyotishi-se-baat-karein",
    h2: "Kab jyotishi se baat karein",
    paras: [
      "Vivah mein lambi der, rishte mein uljhan ya parivaar se takraav ho, to kundali ko vistaar se dikhana upyogi hai. [Marriage astrologer online](/blog/marriage-astrologer-near-me-online) aur Rohiit Gupta ke baare mein [yahan](/founder).",
      "Aur yaad rahe — kundali raasta dikhati hai, faisle aap lete hain.",
      "Pitra dosh ko vivah mein der se joda jaata hai — [Pitra dosh aur vivah mein der](/blog/pitra-dosh-marriage-delay) padhiye; aur Kaal Sarp ka vivah par asar [yahan](/blog/kaal-sarp-dosh-marriage). Jaanch ke liye [Pitra Dosh Calculator](/calculators/free-pitra-dosh-calculator) muft hai.",
    ],
  },
  {
    id: "love-marriage-ya-arranged-hindi",
    h2: "लव मैरिज या अरेंज्ड — हिंदी में",
    paras: [
      "यह कैलकुलेटर आपकी कुण्डली में ज्योतिष परम्परा के 10 संकेत देखता है — 5वें-7वें स्वामी का सम्बन्ध, शुक्र, मंगल, राहु, चन्द्र, 11वाँ भाव और नवांश — और बताता है कि झुकाव लव की ओर है, दोनों का मेल है, या अरेंज्ड की ओर।",
      "ग्रंथ में लव या अरेंज्ड का सीधा नियम नहीं है — इसलिए हम इसे झुकाव कहते हैं, दावा नहीं। विवाह का समय BPHS की दशा से बताया जाता है। पूरी तरह मुफ़्त।",
    ],
  },
  {
    id: "ek-udaharan",
    h2: "Ek udaharan — score kaise banta hai",
    paras: [
      "Ek Kumbh lagna ki kundali: 5ve swami Budh 9ve mein aur 7ve swami Surya 8ve mein — koi sambandh nahi (0). Shukra-Mangal mein drishti (7), Shukra 7ve ghar mein (5). Kul **12 — Arranged ki or jhukaav**. Is vyakti ka vivah sach mein arranged tha.",
      "Har sanket ki wajah nateeje mein saaf likhi aati hai — koi chhupa formula nahi.",
    ],
  },
  {
    id: "feedback-kaise-madad-karta-hai",
    h2: "Aapka jawab kaise madad karta hai",
    paras: [
      "Aap 'Love', 'Arranged', 'Love-cum-arranged' ya 'Abhi shaadi nahi hui' chunte hain. Jawab sirf kundali ke saath judta hai — naam, phone ya email nahi.",
      "Jab kaafi jawab jud jaate hain, hum har sanket ko dekhte hain: love walon mein zyada mila to rakha, barabar mila to hataya. Is tarah ye calculator sach ki or badhta hai.",
      "'Abhi shaadi nahi hui' bhi keemti jawab hai — isse hamein pata chalta hai kitne log bhavishya jaanne aaye. Kisi bhi jawab ke liye koi login ya jaankari nahi maangi jaati.",
    ],
  },
];

const PILLAR_2: PillarSection[] = [];

const FAQS = [
  {
    q: "Love or arranged marriage prediction by date of birth kitna sahi hai?",
    a: "Ye jyotish parampara ke 10 sanketon ka jhukaav hai, granth ka niyam nahi. Hamari jaanch mein purane sanket kamzor nikle, isliye hum shaadi-shuda logon ke asli jawabon se ise har mahine behtar karte hain. Vivah ka samay BPHS ki dasha se hai.",
  },
  {
    q: "Kya granth mein love marriage ka niyam hai?",
    a: "Nahi. BPHS, Jataka Parijata, Phaladipika, Bhrigu Sutram, Brihat Jataka aur Chamatkar Chintamani — kisi mein love ya arranged ka seedha niyam nahi. Isliye har sanket par '(parampara)' likha aata hai.",
  },
  {
    q: "Kaun sa grah love marriage deta hai?",
    a: "Parampara mein Shukra, Rahu aur Mangal sabse zyada liye jaate hain, aur sabse bada sanket 5ve-7ve swami ka sambandh maana jaata hai. Koi ek grah akela kuch tay nahi karta.",
  },
  {
    q: "Kya ye calculator poora muft hai?",
    a: "Haan — saare sanket unki wajah ke saath, nateeja aur vivah ka samay, sab muft. Koi login ya payment nahi.",
  },
  {
    q: "Shaadi-shuda log apna jawab kyun dein?",
    a: "Aapka asli jawab calculator ko sikhata hai ki kaunsa sanket sach mein kaam karta hai. Sirf kundali ke saath judta hai — naam, phone ya email kabhi nahi.",
  },
  {
    q: "Kya ye intercaste marriage ya jeevansaathi ki jaati batata hai?",
    a: "Nahi. Granth mein aisa niyam nahi, aur hum jaati, dharm ya samuday ki bhavishyavani nahi karte.",
  },
  {
    q: "Love-cum-arranged ka kya matlab hai?",
    a: "Pasand aapki aur raazi-khushi parivaar ki — Bharat mein ye sabse badhta roop hai. Kuch sanket hon par bahut nahi, to nateeja 'Dono ka mel' aata hai.",
  },
  {
    q: "Arranged ki or jhukaav aaya to kya love marriage nahi hogi?",
    a: "Aisa nahi. Ye sirf parampara ka jhukaav hai, pakka bhavishya nahi. Faisle aapke hain.",
  },
  {
    q: "Kya ye shaadi ka samay bhi batata hai?",
    a: "Haan. BPHS ke anusar jis mahadasha-antardasha mein 7va ghar khule, wahi vivah ka samay — tareekhon ke saath.",
  },
  {
    q: "Ling bharna kyun zaroori hai?",
    a: "Kalatra karak purush ke liye Shukra aur stree ke liye Guru hai. Karak aur vivah ka samay ling ke hisaab se dekhe jaate hain.",
  },
];

const COMPARE = [
  { f: "Granth mein niyam hai ya nahi — saaf batana", tv: "Haan", as: "Aksar nahi", at: "Aksar nahi" },
  { f: "Har sanket par '(parampara)' label", tv: "Haan", as: "Nahi", at: "Nahi" },
  { f: "Asli shaadiyon se seekhna (feedback)", tv: "Haan", as: "Nahi", at: "Nahi" },
  { f: "Vivah ka samay (BPHS dasha)", tv: "Haan", as: "Kabhi-kabhi", at: "Kabhi-kabhi" },
  { f: "Poora muft", tv: "Haan", as: "Kabhi-kabhi", at: "Aksar nahi" },
];

const READ_MORE = [
  { href: "/learn/love-marriage-vs-arranged-marriage", t: "Love vs Arranged — poori jaankari" },
  { href: "/learn/will-i-have-love-marriage", t: "Kya meri love marriage hogi?" },
  { href: "/blog/kundali-mein-vivah-yog", t: "कुंडली में विवाह योग" },
  { href: "/blog/love-marriage-kundali-matching", t: "Love marriage mein kundali milan" },
];

const MORE_CALC = [
  { href: "/calculators/free-shadi-kab-hogi-calculator", t: "Shadi Kab Hogi Calculator" },
  { href: "/kundali-milan", t: "Kundali Milan — गुण मिलान" },
  { href: "/calculators/free-second-marriage-calculator", t: "Second Marriage Calculator" },
  { href: "/calculators/free-manglik-dosh-calculator", t: "Manglik Dosh Calculator" },
];

const ALL = [...PILLAR, ...PILLAR_2];

export default function FreeLoveOrArrangedMarriageCalculatorPage() {
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-love-or-arranged-marriage-calculator';

  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Love or Arranged Marriage Prediction by Date of Birth — लव या अरेंज्ड मैरिज',
    description:
      'Free love or arranged marriage prediction by date of birth: 10 traditional (parampara) signs — 5th-7th lord link, Venus, Mars, Rahu, Moon, 11th house and Navamsa — read as a lean, not a certainty, plus marriage timing from BPHS dasha. The granth has no direct love/arranged rule, and we say so. Completely free; married users can share their real answer so the signs improve monthly.',
    breadcrumbName: 'Love or Arranged Marriage Calculator',
    aboutEntities: [
      'Love Marriage', 'Arranged Marriage', 'Seventh House', 'Fifth House', 'Venus', 'Rahu',
      'Mars', 'Navamsa', 'Vimshottari Dasha', 'Brihat Parashara Hora Shastra',
    ],
    knowsAbout: [
      'Vedic Astrology', 'Jyotish Shastra', 'Love Marriage Yoga', 'Marriage Timing',
      'Navamsa D-9', 'Kalatra Karaka', 'Love or Arranged Marriage Prediction',
    ],
    howToName: 'How to check love or arranged marriage signs in your Kundali by date of birth',
    howToSteps: [
      { name: 'Enter birth details and gender', text: 'Date, exact time and place of birth, plus gender — the Kalatra Karaka is Venus for a man and Jupiter for a woman.' },
      { name: 'The chart is read', text: 'Swiss Ephemeris with Lahiri Ayanamsha builds the chart and the Navamsa; ten traditional signs are scored on the server and marriage timing is taken from the BPHS dasha.' },
      { name: 'Read the lean and share your truth', text: 'The result reads Love ki or jhukaav, Dono ka mel or Arranged ki or jhukaav, labelled as tradition. Married users can tap their real answer so the signs are tested on real marriages.' },
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
            <span style={{ color: '#94a3b8' }}>Love or Arranged Marriage Calculator</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold m-0 mb-2" style={{ color: GOLD }}>
              Love or Arranged Marriage Prediction by Date of Birth — लव या अरेंज्ड मैरिज
            </h1>
            <p className="text-sm m-0 font-semibold" style={{ color: '#FCD34D' }}>
              ⚖️ Ye sanket granth ke nahi, jyotish parampara ke hain — hum inhe asli shaadiyon par lagataar jaanch rahe hain।
            </p>
            <p className="text-sm m-0 mt-1" style={{ color: '#94a3b8' }}>
              10 parampara-sanket, har ek ki wajah ke saath — aur vivah ka samay BPHS ki dasha se। Poora muft।
            </p>
          </header>

          {/* ── AEO / GEO direct answer, 40-60 words ─────────────────── */}
          <div className="tv-aeo-answer rounded-xl p-5 mb-6"
            style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-base md:text-lg leading-relaxed m-0">
              <strong style={{ color: GOLD }}>Love ya arranged marriage</strong> ka seedha niyam granth mein nahi hai; jyotish parampara{' '}
              <strong style={{ color: GOLD }}>5ve-7ve swami, Shukra, Rahu, Mangal aur Navamsa</strong> ke sanket dekhti hai.{' '}
              <strong style={{ color: GOLD }}>Trikaal Vaani ka muft calculator</strong> ye 10 sanket jaanch kar jhukaav batata hai, BPHS dasha se vivah ka samay deta hai, aur asli shaadiyon ke jawab se har mahine behtar hota hai.
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
                Engine: Swiss Ephemeris · Navamsa D-9 · Lahiri Ayanamsha · Granth engine
              </div>
            </div>
          </div>

          {/* ── Boundary, stated before the tool ─────────────────────── */}
          <section className="rounded-xl p-4 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
              चार बातें पहले ही साफ़ कर देना ज़रूरी है। <strong style={{ color: GOLD }}>पहली</strong> — ये संकेत ज्योतिष परम्परा के हैं, ग्रंथ के नहीं; नतीजा झुकाव है, पक्का भविष्य नहीं।{' '}
              <strong style={{ color: GOLD }}>दूसरी</strong> — जीवनसाथी की जाति, धर्म, समुदाय या देश नहीं बताया जाता।{' '}
              <strong style={{ color: GOLD }}>तीसरी</strong> — किसी की इच्छा के विरुद्ध कुछ कराने का कोई उपाय नहीं बताया जाता।{' '}
              <strong style={{ color: GOLD }}>चौथी</strong> — आपका जवाब केवल कुण्डली के साथ जुड़ता है; नाम कभी नहीं।
            </p>
          </section>

          {/* ── The calculator ───────────────────────────────────────── */}
          <YogCalculator config={{
            type: 'love-arranged',
            genderRequired: true,
            scoreLabel: 'Love-yog Sanket Score',
            breakdownHeading: 'Har sanket ki wajah — parampara',
            hintsHeading: 'Granth ke upay',
            hintsTeaser: 'Aapke 7ve swami aur Shukra/Guru par aadharit',
            showNextStep: false,
            ctaHref: '/calculators/free-shadi-kab-hogi-calculator',
            ctaLabel: 'Love ya Arranged — dekho',
            ctaPrice: 'Muft',
            ctaBlurb: 'Poora nateeja upar khula hai — muft.',
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
              Trikaal Vaani vs AstroSage vs AstroTalk — Love or Arranged par
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sabse bada farak <strong style={{ color: GOLD }}>sach</strong> ka hai. Doosre tools parampara ke love-niyamon ko
              &ldquo;shastra&rdquo; bata kar dete hain. Hum saaf kehte hain ki granth mein ye niyam nahi, har sanket par{' '}
              <strong style={{ color: GOLD }}>(parampara)</strong> likhte hain, aur asli shaadiyon ke jawab se inhe har mahine jaanchte hain — poora muft.
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <caption className="sr-only">Love or arranged calculators ki tulna</caption>
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
              Aksar puche jaane wale sawaal — Love or Arranged
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
