'use client';

// ============================================================
// File: app/calculators/free-gemstone-suitability-calculator/page.tsx
// Version: v2.0 (05 Sep 2026) — Gemstone Suitability (0–100, all 9 ratna)
// Now uses shared brain: lib/jyotish/gemstone.ts + GemstoneForm + StoneScoreboard.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================

import { useState, useRef } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import GemstoneForm from '@/components/calculators/GemstoneForm';
import { StoneScoreboard, DetailCell } from '@/components/calculators/StoneScoreboard';
import { runEngine, VERDICT_COLOR, type EngineResult } from '@/lib/jyotish/gemstone';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const ORG_ID = 'https://trikalvaani.com/#organization';
const WEBSITE_ID = 'https://trikalvaani.com/#website';
const AUTHOR_ID = 'https://trikalvaani.com/#rohiit-gupta';
const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.youtube.com/@TheTrikalVaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice',
];
const PAGE_URL = 'https://trikalvaani.com/calculators/free-gemstone-suitability-calculator';

const FAQS = [
  { q: 'Gemstone suitability score kaise nikalta hai?', a: 'Trikaal Vaani har ratna ko 0–100 score deta hai. Sabse pehle dekha jaata hai ki uss graha ka aapke Lagna ke liye functional swabhav (benefic/malefic) kya hai — malefic graha ka ratna reject. Phir uski Shadbala strength, sign dignity, bhaav (house), dasha aur afflictions (Rahu/Ketu yuti, papi drishti) jod-ghata kar final score banta hai, saath mein risk aur verdict.' },
  { q: 'Mera Mahadasha planet ka ratna pehnna sahi hai?', a: 'Zaroori nahi. Aam dharna hai ki current Mahadasha ke graha ka ratna pehno — par yeh tabhi sahi hai jab wo graha aapke Lagna ke liye functional benefic ho. Agar wo functional malefic hai (jaise Virgo lagna ke liye Guru), toh Mahadasha hone par bhi uska ratna (Pukhraj) nuksaandeh ho sakta hai. Isiliye yeh calculator pehle gate check karta hai.' },
  { q: 'Exalted (uccha) planet ka ratna hamesha shubh hota hai?', a: 'Nahi. Exalted hona astronomical dignity hai, par ratna ke liye sabse pehle functional swabhav dekha jaata hai. Ek functional malefic agar exalted bhi ho, toh uska ratna phir bhi suit nahi karta — uska bal aapke jeevan ke galat kshetra ko mazboot kar sakta hai.' },
  { q: 'Kya mujhe Neelam (Blue Sapphire) pehnna chahiye?', a: 'Neelam (Shani) sabse strong ratna hai — yeh tabhi pehna jaata hai jab Shani aapke Lagna ke liye functional benefic ya yogakaraka ho (jaise Taurus, Libra, Capricorn, Aquarius lagna), wo balheen ho aur achhe bhaav mein ho. Galat kundali mein Neelam turant haani kar sakta hai. Isiliye iska verdict hamesha "Expert Review" tak hi seemit rakha gaya hai — 3 din trial zaroori.' },
  { q: 'Strong ratna (Neelam, Gomed, Lehsunia) kab pehnein?', a: 'Yeh teeno bahut shaktishaali hain aur inka asar tez. Inhe kabhi bhi sirf score dekh kar auto-approve nahi kiya jaata — chahe score ucha ho, verdict "Expert Review Zaroori" rehta hai. Poori kundali jaankaar astrologer se confirm karke, 3 din ka trial le kar hi dharan karein.' },
  { q: 'Pehle koi ratna pehna tha jisse nuksaan hua — ab kya?', a: 'Agar kisi ratna se nuksaan hua, toh aam taur par uska graha aapke Lagna ke liye functional malefic tha, ya kisi dushthana (6/8/12) ka swami, ya combust (Surya ke paas "jala hua"). Yeh calculator har graha ki lordship, bhaav aur combustion check karke aise ratna ko khud "Avoid" mark karta hai — taaki galti dobara na ho.' },
  { q: 'Randhresh (8th lord) ka ratna kyun Avoid hota hai?', a: 'Ratna graha ke poore prabhav ko jagaता hai — uski achhi bhi, buri bhi. Jo graha 8ve ghar (randhra — aayu, achaanak sankat, chronic rog) ka swami hai, uska ratna us sanvedansheel ghar ko sakriya kar sakta hai. Isliye 8th-lord ka ratna, chahe wo graha kisi trikona ka bhi swami ho ya friendly sign mein ho, suit nahi karta — engine ise "Avoid" karta hai.' },
  { q: 'Combust (astangata) graha ka ratna pehnna chahiye?', a: 'Nahi. Jab koi graha Surya ke bahut paas ho (Budh ~14°, Shukra ~10°, Guru ~11° ke andar) toh wo "jal" jaata hai — uska bal kshin ho jaata hai. Aise combust graha ka ratna kamzor asar deta hai ya ulta pad sakta hai. Engine degrees se combustion check karke verdict "Trial" tak seemit kar deta hai.' },
  { q: 'Upratna (substitute stone) kya hota hai?', a: 'Har mukhya ratna ka ek sasta aur halka vikalp hota hai — jaise Heera ki jagah White Sapphire/Opal, Neelam ki jagah Amethyst (Jamunia), Pukhraj ki jagah Citrine. Upratna ka asar milder hota hai, isliye yeh budget aur trial dono ke liye behtar hai. Har suitable ratna ke saath uska upratna bhi dikhaya jaata hai.' },
  { q: 'Kya yeh Gemstone Suitability Calculator free hai?', a: 'Haan, 100% free. Saare 9 ratna ka suitability score, risk aur verdict bilkul muft — koi upsell nahi.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) se Lahiri Ayanamsha ke saath aapka lagna, graha positions aur Shadbala exact nikaalta hai. Suitability logic classical Jyotish niyamon (functional benefic, Shadbala, dignity, bhaav, dasha) par aadharit hai — sirf sun-sign ya Mahadasha guesswork nahi.' },
  { q: 'Rashi ke hisaab se ratna pehnna sahi hai?', a: 'Adhoora hai, aur yahi is kshetra ki sabse aam galti hai. Rashi barah mein se ek hai — usse chalne ka matlab hai karodon logon ko ek hi ratna dena. Ratna ka faisla lagna se hota hai, kyunki lagna tay karta hai ki wo graha aapke liye shubh hai ya marak. Do log ek hi rashi ke ho kar bhi alag ratna maang sakte hain.' },
  { q: 'Naam ya umar ke hisaab se ratna chunna chahiye?', a: 'Nahi. Naam se ratna ank-shastra ka tarika hai aur uska koi khagolik aadhaar nahi. Umar ke hisaab se ratna badalne ki koi shastriya vidhi nahi hai — jo badalta hai wo dasha hai, umar nahi. Dono tarike bazaar mein chalte hain kyunki wo aasan hain, sahi hone ki wajah se nahi.' },
  { q: 'Bhagya ratna, jeevan ratna aur punya ratna mein kya antar hai?', a: 'Ye teen paramparik shreniyan hain. Jeevan ratna lagnesh ka ratna hai — sabse surakshit maana jaata hai. Bhagya ratna navmesh ka — bhagya aur uchch shiksha ke liye. Punya ratna panchmesh ka — buddhi, santan aur poorv-punya ke liye. Teeno trikona ke swami hain, isi liye shubh maane jaate hain.' },
  { q: 'Galat ratna se kya nuksaan hota hai?', a: 'Ratna graha ki urja badhata hai. Agar wo graha aapke lagna ke liye marak ya badhak hai to uski urja badhana samasya badhata hai — prayah us bhaav ke kshetra mein jiska wo swami hai. Isi liye faisla bal se nahi, bhaav-swamitva se hota hai, aur isi liye ye page pehle wahi jaanchta hai.' },
  { q: 'Upratna kya hota hai aur kya wo kaam karta hai?', a: 'Har mukhya ratna ka ek sasta vikalp hota hai — Pukhraj ka Sunehla, Neelam ka Jamunia ya Neeli, Panna ka Onyx ya Peridot, Moti ka Moonstone. Paramapara mein inhe halka prabhav dene wala maana jaata hai, isliye jab aap sure na hon to upratna se shuru karna zyada surakshit hai. Vazan bhi zyada lagta hai.' },
  { q: 'Ratna dharan ka muhurat zaroori hai?', a: 'Paramapara mein us graha ka vaar, shukla paksh aur uska hora dekha jaata hai — jaise Pukhraj Guruwar ko, Neelam Shanivar ko. Ye ek shubh reet hai, koi sakht shart nahi. Iska vazan is se bahut kam hai ki ratna sahi hai ya nahi — galat ratna sahi muhurat mein pehnne se sahi nahi ho jaata.' },
  { q: 'Kya aap ratna bechte hain?', a: 'Nahi. Ye page sirf jaanch karta hai — kaunsa ratna aapke lagna ke anukool hai aur kaunsa nahi. Hum na ratna bechte hain, na kisi dukaan se jude hain, aur na koi paid recommendation report. Isi liye is page par kisi ratna ko zaroori batane ka koi kaaran hi nahi hai.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   1,083 words · 4 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: 89 impressions, 0 clicks, CTR 0%,
//   average position 78.75 — the lowest-placed page in the thin batch.
//
// WHY THIS PAGE IS THE BIGGEST OPENING IN THE WHOLE BATCH
//   Radar E3, 05 Sep 2026, clusters calc-gemstone / calc-should-i-wear /
//   gem-general: EIGHTEEN tracked keywords, our_rank = null on every single
//   one, and an AI Overview recommending a tool on most of them:
//     gemstone calculator by date of birth ...... recommends_tool
//     ratna calculator kundli ................... recommends_tool
//     रत्न कैलकुलेटर .............................. recommends_tool
//     which gemstone suits me astrology free .... recommends_tool
//     gemstone according to rashi ............... recommends_tool
//     रत्न कैसे चुनें कुंडली से ...................... recommends_tool
//     kaun sa ratna pehne kundli ke hisab se .... recommends_tool
//     should i wear neelam calculator ........... recommends_tool
//     lucky stone calculator by date of birth ... partial
//     मेरा भाग्य रत्न कौन सा है ..................... partial
//     + moonga / panna / gomed / moti / pukhraj question forms
//
// KEYWORD SPLIT — deliberate, do not undo
//   The site already has NINE per-stone pages, /calculators/free-should-i-wear-
//   {pukhraj, neelam, panna, manik, moonga, moti, heera, gomed, cats-eye}.
//   Those own the single-stone question. THIS page owns the METHOD: how a
//   suitability score is built, why lagna beats rashi, marak and badhak,
//   combustion, the 8th lord rule, the three classical categories
//   (jeevan/bhagya/punya ratna), upratna, and what to do when the answer is
//   "no stone". Every per-stone question is handed over by link.
//   /learn/gemstone-astrology-vedic and /learn/how-to-wear-gemstone-vedic hold
//   the theory and the wearing method respectively.
//
// FOUR REFUSALS THAT MUST SURVIVE ANY REWRITE
//   This is the single most heavily monetised corner of Indian astrology, and
//   the PASF is full of the exact hooks used to sell stones. The page declines
//   all four in plain language rather than courting the traffic:
//     (1) "gemstone according to rashi" / "राशि रत्न चार्ट" — rashi is one of
//         twelve; recommending a stone from it means giving crores of people
//         the same stone. Answered, then corrected.
//     (2) "नाम के अनुसार रत्न" and "उम्र के हिसाब से रत्न धारण करना" — neither has
//         any classical basis. Said plainly.
//     (3) "100 accurate gemstone recommendation report" — no reading is 100%
//         accurate and no honest astrologer claims it.
//     (4) Selling. We do not sell stones, take commission, or run a paid
//         recommendation. The page says so, because that is the only thing
//         that makes a free recommendation trustworthy.
//   "Islamic gemstone calculator" also appears in PASF. It is a different
//   tradition with its own scholars; the page says that instead of pretending
//   to cover it.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type GsSection = { id: string; h2: string; paras: string[] };

const SECTIONS: GsSection[] = [
  {
    id: 'kaise-kaam',
    h2: 'Gemstone Suitability Calculator — kaam kaise karta hai',
    paras: [
      'Aap **janm tithi, sateek samay aur sthan** dete hain. Calculator aapki kundali banata hai aur **nau ke nau ratna** ko 0 se 100 ka score deta hai — sirf ek ratna nahi batata.',
      'Har ratna ke saath uska **verdict** aata hai: pehen sakte hain, savdhaani se, ya bilkul nahi — aur uske saath **wajah**: kaunsa graha, wo aapke lagna ke liye kaunse bhaav chalata hai, uska bal kya hai, aur wo ast ya vakri to nahi.',
      'Ye page **jaanch** ka page hai. Kisi ek ratna ka vistrit sawal ho — jaise "kya mujhe Neelam pehnna chahiye" — to us ratna ka apna alag page hai, aur wo bhi free hai.',
    ],
  },
  {
    id: 'hum-ratna-nahi-bechte',
    h2: 'Pehle ek baat — hum ratna nahi bechte',
    paras: [
      'Ye sabse pehle kah dena zaroori hai, kyunki iske bina koi bhi ratna-salah par bharosa nahi karna chahiye.',
      '**Hum ratna nahi bechte, kisi dukaan se jude nahi hain, aur koi paid recommendation report nahi bechte.** Iska seedha matlab ye hai ki is page ke paas aapko koi ratna pehnne ki salah dene ka **koi kaaran hi nahi** hai. Agar aapke chart mein koi ratna anukool nahi hai, to result yahi likhega.',
      'Ye baat is liye mayne rakhti hai ki adhikansh "free gemstone recommendation" ka ant ek dukaan par hota hai — kabhi usi site ki, kabhi kisi partner ki. Wahan **salah aur bikri ek hi jagah** se aati hai, aur us sthiti mein "aapko ye ratna chahiye" kehna hamesha faayde ka hota hai.',
      'Isliye jo bhi aapko ratna bataye, ek sawal zaroor poochhiye: **kya aap wo ratna bechte bhi hain?**',
    ],
  },
  {
    id: 'lagna-se-hota-hai',
    h2: 'Ratna ka faisla lagna se hota hai — rashi se nahi',
    paras: [
      'Ye is poore page ki sabse zaroori baat hai, aur wahi cheez hai jo galat ratna se bachaati hai.',
      'Aam tarika ye hai: aapki **rashi** poochhi jaati hai aur us rashi ka ratna bata diya jaata hai. Par rashi **barah mein se ek** hai — iska matlab hai duniya ke har barahve vyakti ko ek hi ratna dena. Ye salah nahi, ek chart hai.',
      'Shastriya tarika **lagna** se chalta hai. Kyunki lagna tay karta hai ki **kaunsa graha kaunse bhaav ka swami hai** — aur wahi tay karta hai ki wo graha aapke liye shubh hai, tatasth hai, ya marak. Vrishabh lagna ke liye Shani **yogakaraka** hai; Mesh lagna ke liye wahi Shani alag bhoomika mein hai.',
      'Isi liye do log ek hi rashi ke ho kar bhi alag ratna maang sakte hain — aur maangte hain. Apna lagna nahi pata to [Lagna Calculator](/calculators/free-lagna-calculator) free hai.',
    ],
  },
  {
    id: 'score-kaise-banta',
    h2: 'Suitability score kaise banta hai — jaanch ka kram',
    paras: [
      'Score ek raay nahi hai; wo ek kram se banta hai, aur har kadam par graha ko pass ya fail hona padta hai.',
      '**Pehla — bhaav-swamitva.** Graha aapke lagna ke liye kaunse bhaavon ka swami hai. Trikona (1, 5, 9) ka swami shubh; chhathe, aathve ya barahve ka swami savdhaani maangta hai. **Doosra — marak aur badhak.** Doosre aur saatve ka swami marak; badhak lagna ki prakriti se tay hota hai.',
      '**Teesra — graha ki sthiti.** Uchch, neech, mitra ya shatru rashi. **Chautha — ast (combustion).** Surya ke bahut paas graha ka phal daba hua maana jaata hai. **Paanchvaan — bal**, yaani Shadbala.',
      '**Chhathaa — dasha.** Us graha ki dasha ab chal rahi hai ya door hai. Ye chhe milkar score banate hain — aur isi liye ek hi graha do logon ke liye 82 aur 24 ho sakta hai.',
    ],
  },
  {
    id: 'jeevan-bhagya-punya',
    h2: 'Jeevan ratna, Bhagya ratna aur Punya ratna — teen shreniyan',
    paras: [
      'Ye teen naam PASF mein bar-bar aate hain aur inhe alag-alag samajh lena chahiye. Teeno **trikona** ke swamiyon se aate hain, isi liye teeno shubh maane jaate hain.',
      '**Jeevan ratna — lagnesh ka ratna.** Lagna ka swami kabhi marak nahi hota, isliye ye sabse **surakshit** shreni maani jaati hai. Shareer, urja aur samagra jeevan-shakti se juda.',
      '**Bhagya ratna — navmesh ka ratna.** Navam bhagya, dharm aur uchch shiksha ka bhaav hai, isliye is ratna ko bhagya kholne wala kaha jaata hai. **Punya ratna — panchmesh ka ratna.** Panchma buddhi, santan aur poorv-punya ka bhaav hai.',
      'Ek zaroori chetavni: **teen shubh shreni hone ka matlab teeno pehen lena nahi hai.** Ek samay par ek ya do se zyada ratna pehnna shastra mein kahin nahi kaha gaya, aur do balwan ratna aapas mein takra bhi sakte hain.',
    ],
  },
  {
    id: 'marak-badhak-ratna',
    h2: 'Marak aur badhak graha ka ratna — yahan sabse zyada nuksan hota hai',
    paras: [
      'Ye wo jagah hai jahan "kamzor graha ka ratna pehan lo" wali salah ulta padti hai.',
      '**Ratna graha ki urja badhata hai** — ye uska poora kaam hai. Ab agar wo graha aapke lagna ke liye **marak** (doosre ya saatve ka swami) ya **badhak** hai, to uski urja badhana samasya ko bal dena hai, ghatana nahi.',
      'Badhak ka niyam lagna ki prakriti se aata hai: **char lagno** (Mesh, Karka, Tula, Makar) ke liye gyarahve ka swami, **sthir lagno** (Vrishabh, Simha, Vrishchik, Kumbh) ke liye navam ka, **dvisvabhav** (Mithun, Kanya, Dhanu, Meen) ke liye saatve ka.',
      'Isme ek chaunkane wali baat hai: **sthir lagno ke liye navmesh badhak hota hai** — jabki navmesh ka ratna aam taur par "bhagya ratna" kaha jaata hai. Yahi wo sthiti hai jahan aam salah aur shastra aamne-saamne aa jaate hain, aur isi liye ye calculator lagna dekh kar chalta hai.',
    ],
  },
  {
    id: 'aathvan-swami',
    h2: 'Aathve bhaav ke swami ka ratna kyun taala jaata hai',
    paras: [
      'Ye ek alag niyam hai jo bhaav-swamitva ke andar aata hai par khaas dhyan maangta hai.',
      'Aathvaan bhaav aayu, achanak ghatnaon aur gehri uthal-puthal ka bhaav hai. **Randhresh** yaani uska swami — uski urja badhana shastra mein taala jaata hai, kyunki wo un hi kshetron ko sakriy karta hai.',
      'Yahan ek jatilta hai jo jaan leni chahiye: **kuch lagno ke liye lagnesh hi aathve ka bhi swami hai.** Mesh lagna mein Mangal dono chalata hai, Tula lagna mein Shukra. Aise mein "lagnesh ka ratna surakshit hai" wali baat apne aap lagu nahi hoti — dono bhoomikaon ko tolna padta hai.',
      'Isi liye ye page **swamitva alag se dikhata hai**, sirf "pehen sakte hain / nahi" nahi. Aap khud dekh sakein ki graha kya-kya chala raha hai.',
    ],
  },
  {
    id: 'ast-graha-ratna',
    h2: 'Ast (combust) graha ka ratna — pehnna chahiye ya nahi',
    paras: [
      'Ye jaanch adhikansh muft tools mein hoti hi nahi, aur iska asar seedha hota hai.',
      '**Ast** ka arth hai graha Surya ke itne paas aa gaya ki uski chamak dab gayi. Har graha ki apni seema hai — Chandra 12 degree, Mangal 17, Budh 14, Guru 11, Shukra 10, Shani 15. **Surya swayam kabhi ast nahi hota.**',
      'Paramparik sthiti ye hai ki **ast graha ka ratna prayah nahi diya jaata**, kyunki graha apna phal poora de hi nahi pa raha. Kuch paramparaein kehti hain ki aise mein ratna madad kar sakta hai; adhikansh savdhaani ki salah deti hain.',
      'Is page ka rukh savdhaani ka hai — ast graha ka score girta hai aur wajah likhi jaati hai. Aap chaahen to bhi kam se kam ye **jaan kar** faisla lenge, andaaze se nahi.',
    ],
  },
  {
    id: 'uchch-graha-ratna',
    h2: 'Uchch graha ka ratna hamesha shubh hota hai?',
    paras: [
      'Nahi, aur ye galatfehmi bahut mehngi padti hai.',
      '**Uchch (exaltation) ek khagolik sthiti hai** — graha apni sabse anukool rashi mein hai. Par uska ye matlab nahi ki wo graha **aapke liye** shubh hai. Wo abhi bhi kisi bhaav ka swami hai, aur agar wo bhaav marak ya badhak hai to uchch hona sirf ye batata hai ki wo apna kaam **aur mazbooti se** karega.',
      'Udaharan: agar aapke lagna ke liye koi graha marak hai aur wo uchch bhi hai, to uska ratna pehnna us marak paksh ko aur bal de dega.',
      'Isi liye kram ye hai: **pehle bhaav-swamitva, phir sthiti, phir bal.** Uchch hona teesre khaane mein aata hai, pehle mein nahi. Ye antar [Planetary dignity](/learn/planetary-dignity-exaltation-debilitation) mein aur khola gaya hai.',
    ],
  },
  {
    id: 'mahadasha-ratna',
    h2: 'Chal rahi Mahadasha ka ratna pehnna chahiye?',
    paras: [
      'Ye salah bahut di jaati hai aur wo **apne aap mein adhoori** hai.',
      'Tark ye diya jaata hai ki abhi jis graha ki dasha chal rahi hai, uska ratna phal jaldi dega. Isme sachai hai — **dasha ka graha sabse sakriy hota hai**, isliye uska ratna jaldi asar dikhata hai.',
      'Par yahi uska khatra bhi hai. **Agar wo graha aapke lagna ke liye marak hai, to uski dasha mein uska ratna pehnna sabse bura samay hai** — kyunki wo pehle se sakriy hai aur aap use aur bal de rahe hain.',
      'Sahi kram: **pehle dekhiye graha shubh hai ya nahi, phir dekhiye dasha chal rahi hai ya nahi.** Dono anukool hon to wo sabse achha sanyog hai. Apni dasha [Dasha Calculator](/calculators/free-dasha-calculator) se dekhiye.',
    ],
  },
  {
    id: 'naam-umar-se-ratna',
    h2: 'नाम या उम्र के अनुसार रत्न — इसका कोई आधार नहीं है',
    paras: [
      'ये दोनों तरीके बाज़ार में ख़ूब चलते हैं, इसलिए इन पर सीधा उत्तर देना ज़रूरी है।',
      '**नाम के अनुसार रत्न** — यह अंक-शास्त्र का तरीक़ा है, ज्योतिष का नहीं। नाम के अक्षरों का जोड़ निकाल कर रत्न बता दिया जाता है। इसका कोई खगोलीय आधार नहीं है, और नाम बदलने से आपकी कुंडली नहीं बदलती।',
      '**उम्र के अनुसार रत्न** — यह और भी कमज़ोर है। शास्त्र में उम्र के हिसाब से रत्न बदलने की कोई विधि नहीं है। जो बदलता है वह **दशा** है, उम्र नहीं — और दशा हर व्यक्ति की अलग चलती है, इसलिए दो हमउम्र लोगों की स्थिति बिलकुल अलग हो सकती है।',
      'दोनों तरीक़े इसलिए चलते हैं कि वे आसान हैं — जन्म समय नहीं माँगते। पर आसान होना सही होना नहीं है।',
    ],
  },
  {
    id: 'rashi-ratna-chart',
    h2: 'राशि रत्न चार्ट — यह क्यों अधूरा है',
    paras: [
      'यह चार्ट हर जगह मिलता है — मेष को मूँगा, वृषभ को हीरा, मिथुन को पन्ना — और यह बहुत उपयोगी लगता है। इसकी सीमा समझ लेनी चाहिए।',
      'यह चार्ट **राशि के स्वामी ग्रह** का रत्न बताता है। यह ग़लत नहीं है — पर यह **एक ही जानकारी** पर टिका है, और वह भी बारह में से एक। इसका मतलब है कि पूरे भारत के लगभग हर बारहवें व्यक्ति को एक ही रत्न दिया जा रहा है।',
      'क्या छूट जाता है: लग्न, भाव-स्वामित्व, मारक और बाधक, अस्त होना, बल, और दशा — यानी वह सब जिससे यह तय होता है कि वह ग्रह **आपके लिए** शुभ है या नहीं।',
      'इसलिए राशि चार्ट को **शुरुआती जानकारी** मानिए, फ़ैसला नहीं। फ़ैसला कुंडली से होता है, और वही यह पेज मुफ़्त में करता है।',
    ],
  },
  {
    id: 'nau-ratna',
    h2: 'Nau ratna aur unke graha — poora naksha',
    paras: [
      'Har graha ka ek mukhya ratna hai aur ye jodi sthir hai. Isse aage ki poori jaanch isi par khadi hoti hai.',
      '**Surya — Manik (Ruby). Chandra — Moti (Pearl). Mangal — Moonga (Red Coral). Budh — Panna (Emerald). Guru — Pukhraj (Yellow Sapphire).**',
      '**Shukra — Heera (Diamond). Shani — Neelam (Blue Sapphire). Rahu — Gomed (Hessonite). Ketu — Lehsunia (Cat\'s Eye).**',
      'Har ratna ka apna page bhi hai jahan us ek patthar ka poora vishay khola gaya hai — [Pukhraj](/calculators/free-should-i-wear-pukhraj), [Neelam](/calculators/free-should-i-wear-neelam), [Panna](/calculators/free-should-i-wear-panna), [Manik](/calculators/free-should-i-wear-manik), [Moonga](/calculators/free-should-i-wear-moonga), [Moti](/calculators/free-should-i-wear-moti), [Heera](/calculators/free-should-i-wear-heera), [Gomed](/calculators/free-should-i-wear-gomed) aur [Lehsunia](/calculators/free-should-i-wear-cats-eye) — sab free.',
    ],
  },
  {
    id: 'teen-khatarnaak',
    h2: 'Neelam, Gomed aur Lehsunia — teen sabse tez ratna',
    paras: [
      'In teenon ko paramapara mein alag shreni mein rakha jaata hai, aur uski wajah samajh leni chahiye.',
      'Teeno **Shani, Rahu aur Ketu** ke ratna hain — teen graha jinhe shastra mein sabse gehra aur sabse tez asar dene wala maana gaya hai. Inka phal prayah **jaldi** dikhta hai, chahe wo anukool ho ya nahi. Isi liye inhe "test kar ke dekh lete hain" wali soch ke saath nahi pehnna chahiye.',
      'Paramparik salah: **pehle teen din ke liye pehen kar dekhiye**, aur agar neend, mann ya sehat mein spashta gadbad lage to utaar dijiye. Ye reet in teenon ke liye khaas kah kar batayi jaati hai.',
      'Aur ek baat jo saaf kehni chahiye: **Neelam sabse zyada becha jaane wala ratna hai** — kyunki wo mehnga hai aur uske "chamatkar" ki kahaniyaan sabse zyada chalti hain. Uska poora vishay [Should I Wear Neelam](/calculators/free-should-i-wear-neelam) par hai.',
    ],
  },
  {
    id: 'upratna',
    h2: 'Upratna — sasta vikalp aur wo kab theek hai',
    paras: [
      'Har mukhya ratna ka ek halka aur sasta vikalp hota hai, jise **upratna** kehte hain.',
      'Mukhya jodiyaan: **Pukhraj ka Sunehla** (yellow topaz ya citrine), **Neelam ka Jamunia ya Neeli** (amethyst / lapis), **Panna ka Onyx ya Peridot**, **Manik ka Garnet ya Red Spinel**, **Moti ka Moonstone**, **Moonga ka Red Jasper**, **Heera ka Zircon ya Opal**, **Gomed ka Golden Topaz**, **Lehsunia ka Quartz Cat\'s Eye**.',
      'Do baatein jaan lena zaroori hai. **Ek — upratna ka asar halka maana jaata hai**, isliye uska vazan zyada rakha jaata hai. **Do — isi wajah se wo zyada surakshit bhi hai**, aur jab aap sure na hon to shuruat wahi se karna samajhdari hai.',
      'Ek vyavharik salah: **agar koi kah raha hai ki sirf mukhya ratna hi kaam karega aur wo bhi bade vazan mein, to wo prayah bikri ki baat hai.** Paramapara upratna ko poori tarah maanya maanti hai.',
    ],
  },
  {
    id: 'kitne-ratna',
    h2: 'Ek saath kitne ratna pehen sakte hain',
    paras: [
      'Ye vyavharik sawal hai aur iska uttar prayah nahi diya jaata, kyunki kam ratna bechne ki salah kisi ko suit nahi karti.',
      'Paramparik sthiti: **ek ya do se zyada nahi.** Har ratna ek graha ki urja badhata hai; do vipreet swabhav wale graha ek saath badhaana takrav paida karta hai. Shastra mein "navratna" ki angoothi ka zikr zaroor hai, par wo ek vishesh prayog hai — rozmarra ki salah nahi.',
      'Jo jodiyaan tali jaati hain: **Neelam ke saath Manik ya Moti** (Shani-Surya aur Shani-Chandra shastriya shatru hain), **Heera ke saath Manik** (Shukra-Surya), aur **Moonga ke saath Panna** (Mangal-Budh).',
      'Vyavharik salah: **ek ratna se shuru kijiye, teen se chhe maheene dekhiye, phir sochiye.** Ek saath teen-char ratna pehen kar ye pata hi nahi chalega ki kya kaam kar raha hai.',
    ],
  },
  {
    id: 'muhurat-vidhi',
    h2: 'रत्न धारण मुहूर्त और विधि — कितना ज़रूरी है',
    paras: [
      'यह PASF में बार-बार आता है, इसलिए संतुलित उत्तर देना चाहिए।',
      'परंपरा में विधि यह है: उस ग्रह का **वार**, **शुक्ल पक्ष**, और हो सके तो उसी ग्रह की **होरा**। पुखराज गुरुवार, नीलम शनिवार, मोती सोमवार, पन्ना बुधवार, मूँगा मंगलवार, माणिक रविवार, हीरा शुक्रवार। पहनने से पहले दूध या गंगाजल में रखना और उस ग्रह का मंत्र जपना भी कहा जाता है।',
      'इसका वज़न कितना है — ईमानदारी से, **इससे बहुत कम कि रत्न सही है या नहीं।** ग़लत रत्न सही मुहूर्त में पहनने से सही नहीं हो जाता, और सही रत्न किसी भी दिन पहनने से बेकार नहीं होता।',
      'इसलिए क्रम यह रखिए: **पहले जाँच, फिर मुहूर्त।** पूरी विधि [रत्न पहनने की विधि](/learn/how-to-wear-gemstone-vedic) में है और उस दिन का पंचांग [यहाँ](/panchang) मुफ़्त है।',
    ],
  },
  {
    id: 'ungli-dhatu',
    h2: 'Kaunsi ungli, kaunsi dhatu, kitna vazan',
    paras: [
      'Ratna tay ho jaane ke baad ye teen sawal aate hain, aur teeno ka paramparik uttar saaf hai.',
      '**Ungli** — Pukhraj tarjani (index), Manik anamika (ring), Moti kanishtha (little) ya anamika, Panna kanishtha, Heera anamika, Neelam madhyama (middle), Moonga anamika ya tarjani, Gomed madhyama, Lehsunia madhyama.',
      '**Dhatu** — Pukhraj aur Manik sone mein, Moti aur Heera chandi mein, Panna sone ya chandi mein, Neelam aur Gomed panchdhatu ya loha mein, Moonga taambe ya sone mein.',
      '**Vazan** — paramapara mein shareer ke vazan se joda jaata hai; mota niyam ye chalta hai ki har 10 kilo par lagbhag ek ratti. Par yahan ek chetavni: **vazan badhane ki salah prayah bikri ka hissa hoti hai**, kyunki keemat vazan se badhti hai. Kam vazan se shuru karna hamesha surakshit hai.',
    ],
  },
  {
    id: 'galat-ratna-nuksan',
    h2: 'Galat ratna se kya hota hai — aur pata kaise chalega',
    paras: [
      'Ye sawal dabi zubaan mein poochha jaata hai aur uska uttar seedha hona chahiye — bina daraye.',
      'Kya hota hai: ratna us graha ki urja badhata hai. Agar wo graha aapke liye marak ya badhak hai, to asar prayah **us bhaav ke kshetra mein** dikhta hai jiska wo swami hai — aur wo asar dabav ya rukavat ke roop mein aata hai, kisi aapda ke roop mein nahi.',
      'Pata kaise chalega: paramapara kehti hai ki **pehle teen din** dhyan dijiye — neend, mann ki sthiti, chhoti-moti ghatnaayein. Agar spashta gadbad lage to utaar dijiye. Ye sabse saral aur sabse imandar test hai.',
      'Aur wo baat jo santulan ke liye zaroori hai: **galat ratna se koi aapda nahi aati.** Jo koi ye kahe ki galat ratna se jeevan barbaad ho jaayega — aur phir uska "nivaran" beche — wo dar bech raha hai.',
    ],
  },
  {
    id: 'ratna-utar-diya',
    h2: 'Pehle koi ratna pehna tha jisse dikkat hui — ab kya',
    paras: [
      'Ye sthiti aam hai aur uska hal saral hai, par uske naam par bhi bahut kuch becha jaata hai.',
      '**Pehla kadam — utaar dijiye.** Bas. Koi vidhi, koi pooja, koi "nivaran" zaroori nahi hai. Ratna ki urja pehnne se aati hai; utaarne se rukti hai.',
      '**Doosra kadam — kuch hafte kuch bhi mat pehniye.** Ek ratna utaar kar turant doosra pehen lena galti hai, kyunki phir pata hi nahi chalega ki kya kaam kar raha tha aur kya nahi.',
      '**Teesra — dobara jaanch kar ke hi aage badhiye**, aur is baar upratna se shuru kijiye. Utaare hue ratna ka kya karein — wo aapka hai, bech dijiye ya rakh lijiye; usme kuch "lag" nahi jaata. Jo koi utaare hue ratna ke liye vishesh vidhi bataye aur uske paise le, wo galat le raha hai.',
    ],
  },
  {
    id: 'koi-ratna-nahi',
    h2: 'Result kehta hai koi ratna anukool nahi — kya karein',
    paras: [
      'Ye result bhi aata hai, aur wo **koi kami nahi** hai — balki ek imandar uttar hai jo bahut kam jagah milta hai.',
      'Aisa tab hota hai jab aapke trikona ke swami ast, neech ya kamzor hon, aur baaki graha marak ya badhak bhoomika mein. Aise chart aam hain.',
      'Aise mein karne layak kya hai: **classical upay jinme paisa nahi lagta** — us graha ka mantra, uske vaar ka vrat, aur us graha se judi vastu ka daan. Shastra in teenon ko ratna se kam nahi maanta; ratna to sirf chautha maarg hai.',
      'Aur wo baat jo saaf kehni chahiye: **koi ratna anukool na hona ek achhi jaankari hai.** Uska matlab hai ki aapne ek mehnga aur ulta padne wala kharch bacha liya. Kaunsa graha kamzor hai, ye [Weak Planet Finder](/calculators/free-weak-planet-finder) bata deta hai — aur uske muft upay bhi wahin hain.',
    ],
  },
  {
    id: 'kitna-accurate',
    h2: '"100% accurate gemstone report" — aisa kuch hota nahi',
    paras: [
      'Ye PASF mein asli entry hai, isliye is par seedha bolna zaroori hai.',
      '**Koi bhi jyotishiya padhai 100% sateek nahi hoti**, aur koi imandar jyotishi aisa daawa nahi karta. Jo cheez sateek ho sakti hai wo **ganana** hai — grahon ki sthiti, degree, bal. Uski **vyakhya** hamesha vyakhya rehti hai.',
      'Isliye jab koi "100% accurate report" beche, to wahan do mein se ek baat hai: ya to wo ganana ko vyakhya bata raha hai, ya wo bharosa bech raha hai.',
      'Is page ka daawa isse chhota aur jaanchne layak hai: **ganana Swiss Ephemeris aur Lahiri ayanamsha par hai, niyam classical hain, aur har point ke saath uski wajah likhi hai** — taaki aap use apni kundali se mila sakein aur asahmat bhi ho sakein.',
    ],
  },
  {
    id: 'lal-kitab-kp',
    h2: 'Lal Kitab aur KP paddhati ke ratna — ye alag kyun aate hain',
    paras: [
      'PASF mein "लाल किताब के अनुसार रत्न" aur "gemstone recommendation as per KP astrology" dono aate hain. Antar jaan lena chahiye.',
      '**Lal Kitab** ki apni alag paddhati hai. Wo ratna ko bahut kam vazan deti hai aur uski jagah **saral upay** deti hai — kisi vastu ka daan, bahte paani mein kuch pravahit karna, ya ghar mein kuch rakhna. Lal Kitab prayah ratna se **manaa** karti hai, khaas kar jab graha kamzor ho.',
      '**KP (Krishnamurti Paddhati)** nakshatra ke swami aur sub-lord par chalti hai, aur uska ayanamsha bhi alag hai. Isi liye KP se nikla ratna paramparik Parashari salah se alag ho sakta hai.',
      'Is page ka aadhaar **Parashari** hai — BPHS ke niyam, Lahiri ayanamsha. Ye teeno paddhatiyaan alag hain aur unhe **mila kar nahi padhna chahiye.** Ek chuniye aur usi par rahiye.',
    ],
  },
  {
    id: 'islamic-ratna',
    h2: 'Islamic ya doosri paramparaon ke ratna',
    paras: [
      '"Islamic gemstone calculator" is SERP par asli PASF entry hai, isliye is par saaf hona chahiye.',
      '**Ye page us paramapara ko cover nahi karta.** Islamic paramapara mein ratna ka apna alag aadhaar hai — Aqeeq, Firoza, Yaqoot aur unse judi apni riwayatein aur apne aalim. Uska Vedic Jyotish se koi sambandh nahi hai.',
      'Isi tarah paashchatya "birthstone" chart bhi alag cheez hai — wo mahine ke hisaab se patthar deta hai aur uska aadhaar aadhunik hai, koi khagolik ganana nahi.',
      'Hum wo nahi dikhate jo humein nahi aata. Ye page **Parashari Vedic paddhati** par hai aur usi tak seemit hai — aur ye seema bata dena zyada imandar hai bajaye ek aur paramapara ka naam le kar traffic lene ke.',
    ],
  },
  {
    id: 'kahan-se-kharide',
    h2: 'रत्न कहाँ से ख़रीदें — और किन बातों से बचें',
    paras: [
      'यह प्रश्न बहुत खोजा जाता है और हम कोई दुकान नहीं बताएँगे — पर बचने की बातें बता देना उपयोगी है।',
      '**प्रमाणपत्र माँगिए।** किसी मान्यता प्राप्त प्रयोगशाला का — जो पत्थर की पहचान, वज़न और उपचार (treatment) बताता हो। बिना प्रमाणपत्र का महँगा रत्न न लीजिए।',
      '**बचने की बातें:** वही व्यक्ति जो सलाह भी दे और पत्थर भी बेचे; "आज ही लेना पड़ेगा" जैसी जल्दबाज़ी; बहुत बड़ा वज़न बताना; और "यह रत्न आपकी सारी समस्या ख़त्म कर देगा" जैसा दावा। चारों बिक्री की तकनीकें हैं, शास्त्र नहीं।',
      '**और एक व्यावहारिक बात:** शुरुआत उपरत्न या कम वज़न से कीजिए। अगर असर दिखे तभी आगे बढ़िए। यह सलाह किसी दुकान को पसंद नहीं आएगी, और इसीलिए यह ईमानदार है।',
    ],
  },
  {
    id: 'ratna-vs-mantra',
    h2: 'Ratna, mantra, daan aur vrat — chaar upay, ek hi kaam',
    paras: [
      'Shastra mein graha ko sahara dene ke char maarg batae gaye hain, aur ratna unme se **ek** hai — pehla nahi.',
      '**Mantra** — us graha ka beej ya vedic mantra, niyamit jaap. **Vaar aur vrat** — us graha ke din sanyam. **Daan** — us graha se judi vastu ka daan, usi din. **Ratna** — chautha maarg.',
      'Teen mein paisa nahi lagta aur unme se kisi ka koi **ulta asar** bhi nahi hai — mantra galat graha ka bhi ho to nuksan nahi hota. Ratna akela aisa hai jo galat hone par **ulta pad sakta hai**, aur sabse mehnga bhi wahi hai.',
      'Isi liye vyavharik kram ye hona chahiye: **pehle mantra, vrat aur daan teen se chhe maheene. Ratna tabhi, jab jaanch saaf ho aur zaroorat lage.** Ye salah bikri ke khilaf jaati hai, aur isi liye kam sunne ko milti hai.',
    ],
  },
  {
    id: 'kitne-din-mein-asar',
    h2: 'Ratna ka asar kitne din mein dikhta hai',
    paras: [
      'Ye sawal har koi poochta hai aur uska imandar uttar "pata nahi" ke kareeb hai — par kuch cheezein kahi ja sakti hain.',
      'Paramapara mein har ratna ka ek **jagran kaal** bataya jaata hai — Moti aur Moonga jaldi (kuch din), Pukhraj aur Panna madhyam (kuch hafte), Neelam bahut jaldi (teen din tak), aur Heera dheema (kuch maheene).',
      'Par yahan do imandar baatein zaroori hain. **Ek — "asar" ka koi objective maap nahi hai.** Jo mehsoos hota hai wo dhyan aur umeed se bhi aata hai, aur ye insaani baat hai, koi kami nahi. **Do — teen se chhe maheene se pehle koi nishkarsh nikalna theek nahi.**',
      'Jo saaf galat hai: **"ek hafte mein natija na mile to aur bada ratna lijiye"** — ye salah seedhi bikri hai, shastra nahi.',
    ],
  },
  {
    id: 'kise-nahi-pehnna',
    h2: 'Kin logon ko ratna se door rehna chahiye',
    paras: [
      'Ye section kisi bikri wale page par nahi milega, isi liye yahan hona chahiye.',
      '**Jinke paas sateek janm samay nahi hai.** Bina samay ke lagna nahi milta, aur bina lagna ke bhaav-swamitva nahi — yaani poori jaanch ka aadhaar hi nahi. Aise mein ratna pehnna andaaza hai.',
      '**Jo kisi bhaari daur se guzar rahe hain** aur jaldi hal dhoondh rahe hain. Ye wahi sthiti hai jisme sabse zyada galat ratna beche jaate hain, aur jaldi mein liya faisla prayah mehnga padta hai.',
      '**Jinhe kisi ne dara kar bheja hai.** Agar aap yahan isliye aaye hain ki kisi ne "aapki kundali mein bhaari dosh hai" kaha, to pehle wo dosh khud jaanchiye — [Manglik](/calculators/free-manglik-dosh-calculator), [Kaal Sarp](/calculators/free-kaal-sarp-dosh-calculator), [Pitra Dosh](/calculators/free-pitra-dosh-calculator) — teeno free hain. Adhikansh baar wo baat badha-chadha kar batayi gayi hoti hai.',
    ],
  },
  {
    id: 'vs-others',
    h2: 'Doosre gemstone calculators se farak',
    paras: [
      'Google is keyword ke saath kai naam dikhata hai — AstroSage, Prokerala, Drik Panchang, GemsMantra. Seedha uttar, usme wo bhi jo hamare paksh mein nahi jaata.',
      '**Grahon ki sthiti mein antar nahi milega.** Adhikansh gambhir tool wahi Swiss Ephemeris aur wahi Lahiri Ayanamsha use karte hain. Un sites ke paas **zyada tool, zyada bhashaayein aur bahut purana domain authority** bhi hai.',
      'Antar do jagah hai, aur dono jaanchne layak hain. **Ek — yahan nau ke nau ratna ka score aata hai, ek "recommendation" nahi**, aur har score ke saath uski wajah — bhaav-swamitva, ast sthiti, bal, dasha.',
      '**Do — hum ratna nahi bechte.** Kai gemstone calculators ka ant ek dukaan ya partner link par hota hai. Us sthiti mein "aapko ye ratna chahiye" kehna hamesha faayde ka hota hai. Yahan wo prerna hai hi nahi — aur yahi is page ka poora daawa hai.',
    ],
  },
  {
    id: 'verify',
    h2: 'Is result ko khud parakhne ka tarika',
    paras: [
      'Ratna par paisa lagane se pehle jaanch lena chahiye, aur is page ka har aankda jaanchne layak hai.',
      '**Pehle grahon ki sthiti milaiye.** Wahi janm vivaran kisi doosre bharose-mand software mein daaliye — rashi aur degree bilkul milni chahiye. Agar nahi milti to samay, shahar ya ayanamsha mein antar hai.',
      '**Phir bhaav-swamitva khud gin lijiye.** Apna lagna lijiye, us se baarah bhaav ginye, aur dekhiye ki jis graha ka ratna bataya ja raha hai wo kaunse bhaavon ka swami hai. Ye ganit hai, raay nahi — aap khud kar sakte hain.',
      '**Aur teesra — kisi doosre jaankaar se poochhiye, par usse jo ratna na bechta ho.** Ye ek hi shart poori salah ki gunvatta badal deti hai.',
    ],
  },
  {
    id: 'free-kya',
    h2: 'Is page par kya-kya milta hai, bilkul muft',
    paras: [
      'Poora page free hai. Milta hai: **nau ke nau ratna ka 0-100 score**, har ek ka **verdict**, aur har verdict ke saath uski **wajah** — kaunsa graha, kaunse bhaav ka swami, ast hai ya nahi, bal kitna, aur dasha kab.',
      'Koi signup nahi, koi card nahi, koi email nahi maanga jaata.',
      'Aur jo yahan jaanbujh kar **nahi** hai: koi ratna ki bikri, koi dukaan ka link, koi commission, aur koi paid "gemstone recommendation report". Ye ek jaanch hai, ek prastav nahi.',
    ],
  },
  {
    id: 'nakshatra-ratna',
    h2: 'Nakshatra ke hisaab se ratna — ye alag paddhati hai',
    paras: [
      'PASF mein "Gemstones according to Rashi and Nakshatra" aata hai, isliye ye antar bhi saaf kar dena chahiye.',
      'Kuch paramparaein — khaas kar dakshin Bharat mein — **janm nakshatra ke swami graha** ka ratna dene ki baat karti hain. Ashwini ka swami Ketu, Bharani ka Shukra, Krittika ka Surya, aur isi kram mein.',
      'Ye rashi wale tarike se **thoda behtar** hai, kyunki nakshatra sattais hain aur rashi barah — yaani wo zyada sookshm hai. Par uski seema wahi hai: **wo bhi ek hi jaankari par tikta hai** aur bhaav-swamitva nahi dekhta.',
      'Aur ek vyavharik baat: **nakshatra ka swami prayah lagnesh se alag hota hai**, isliye do tarike do alag ratna de dete hain — jo uljhan paida karta hai. Apna nakshatra dekhna ho to [Nakshatra Calculator](/calculators/free-nakshatra-calculator) free hai.',
    ],
  },
  {
    id: 'sabse-surakshit',
    h2: 'Sabse surakshit ratna kaunsa hai — ek aam sawal',
    paras: [
      'Log poochhte hain ki agar kuch pehnna hi hai to sabse kam jokhim wala kya hai. Uttar teen hisson mein hai.',
      '**Sabse surakshit shreni jeevan ratna hai** — yaani lagnesh ka ratna. Wajah shastriya hai: **lagnesh kabhi marak nahi hota.** Wo shareer aur samagra jeevan-shakti ka swami hai, aur uski urja badhana prayah anukool maana jaata hai.',
      'Par ek shart hai jo upar bhi likhi gayi: **kuch lagno mein lagnesh aathve bhaav ka bhi swami hai** — Mesh mein Mangal, Tula mein Shukra. Aise mein "surakshit" waali baat apne aap lagu nahi hoti.',
      'Aur teesra hissa: **upratna sabse surakshit shuruat hai**, chahe koi bhi ratna ho. Halka asar, kam keemat, aur galat nikle to nuksan bhi kam. Jab tak aap sure na hon, wahi sahi rasta hai.',
    ],
  },
  {
    id: 'sehat-ratna',
    h2: 'Sehat ke liye ratna — yahan seema sabse sakht',
    paras: [
      'Ye section is liye zaroori hai ki bahut se log yahan koi sharirik samasya le kar aate hain.',
      'Paramapara mein har graha ko shareer ke kuch angon se joda gaya hai, aur us aadhaar par ratna ki salah bhi di jaati hai. Ye jaankari classical hai aur is page par bhi hai.',
      '**Par ise ilaaj ki tarah bilkul nahi lena chahiye.** Kisi lakshan ko "graha ka phal" maan kar jaanch taalna, dawa band karna, ya doctor ke paas jaane mein der karna — ye nuksan ka rasta hai, aur is kshetra mein ye hota hai.',
      'Seedhi baat: **sehat ke prashn doctor ke paas jaate hain.** Ratna, mantra ya koi bhi jyotishiya upay chikitsiya salah ka vikalp nahi hai — aur jo koi kisi rog ka ilaaj ratna se batae, us se turant door hona chahiye.',
    ],
  },
  {
    id: 'bachche-ratna',
    h2: 'Bachchon ko ratna pehnana chahiye?',
    paras: [
      'Maa-baap ye poochhte hain aur uttar saaf hona chahiye.',
      '**Paramapara mein chhote bachchon ke liye ratna nahi kaha gaya.** Shastra mein ratna dharan ki koi nyoontam aayu likhi hui nahi hai, par vyavharik reet ye rahi hai ki ratna badon ke liye hai — kyunki uska asar tez hota hai aur bachcha bata bhi nahi sakta ki use kaisa lag raha hai.',
      'Bachchon ke liye jo kaha gaya hai wo **saral upay** hain — us graha ke din daan, ghar mein mantra, aur bas. Ye teeno surakshit hain aur inme paisa bhi nahi lagta.',
      'Aur ek baat jo shanti se kehni chahiye: **bachche ki kundali dekh kar ghabrana aur uspar bhaari upay lagana** us bachche ke liye kisi bhi graha se zyada nuksandeh hai. Bachchon se jude prashn [Child Birth Prediction](/learn/child-birth-prediction) par hain.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Jaanch ke baad — aage kya',
    paras: [
      '**Kisi ek ratna ka poora vishay** — [Pukhraj](/calculators/free-should-i-wear-pukhraj), [Neelam](/calculators/free-should-i-wear-neelam), [Panna](/calculators/free-should-i-wear-panna), [Manik](/calculators/free-should-i-wear-manik), [Moonga](/calculators/free-should-i-wear-moonga), [Moti](/calculators/free-should-i-wear-moti), [Heera](/calculators/free-should-i-wear-heera), [Gomed](/calculators/free-should-i-wear-gomed), [Lehsunia](/calculators/free-should-i-wear-cats-eye).',
      '**Sidhant aur vidhi** — [Gemstone Astrology](/learn/gemstone-astrology-vedic) mein poora aadhaar, aur [Ratna pehanne ki vidhi](/learn/how-to-wear-gemstone-vedic) mein ungli, dhatu, vazan aur muhurat.',
      '**Aur agar ratna se pehle buniyad dekhni ho** — apna lagna [Lagna Calculator](/calculators/free-lagna-calculator) se, graha ka bal [Graha Bal Calculator](/calculators/free-graha-bal-calculator) se, kamzor graha aur uske **muft upay** [Weak Planet Finder](/calculators/free-weak-planet-finder) se, aur chal rahi dasha [Dasha Calculator](/calculators/free-dasha-calculator) se.',
    ],
  },
];

type GsLink = { href: string; label: string; note: string };

const HUB_STONE: GsLink[] = [
  { href: '/calculators/free-should-i-wear-pukhraj', label: 'Pukhraj (Yellow Sapphire)', note: 'Guru ka ratna' },
  { href: '/calculators/free-should-i-wear-neelam', label: 'Neelam (Blue Sapphire)', note: 'Shani — sabse tez' },
  { href: '/calculators/free-should-i-wear-panna', label: 'Panna (Emerald)', note: 'Budh ka ratna' },
  { href: '/calculators/free-should-i-wear-manik', label: 'Manik (Ruby)', note: 'Surya ka ratna' },
  { href: '/calculators/free-should-i-wear-moonga', label: 'Moonga (Red Coral)', note: 'Mangal ka ratna' },
  { href: '/calculators/free-should-i-wear-moti', label: 'Moti (Pearl)', note: 'Chandra ka ratna' },
  { href: '/calculators/free-should-i-wear-heera', label: 'Heera (Diamond)', note: 'Shukra ka ratna' },
  { href: '/calculators/free-should-i-wear-gomed', label: 'Gomed (Hessonite)', note: 'Rahu — savdhaani se' },
  { href: '/calculators/free-should-i-wear-cats-eye', label: "Lehsunia (Cat's Eye)", note: 'Ketu — savdhaani se' },
];

const HUB_MORE: GsLink[] = [
  { href: '/learn/gemstone-astrology-vedic', label: 'Gemstone Astrology', note: 'Poora sidhant' },
  { href: '/learn/how-to-wear-gemstone-vedic', label: 'Ratna pehanne ki vidhi', note: 'Ungli, dhatu, muhurat' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Faisle ki buniyad' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Graha ka asli bal' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Muft upay bhi wahin' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Kaunsi dasha chal rahi hai' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Uchch matlab shubh nahi' },
  { href: '/panchang', label: 'Panchang', note: 'Dharan ka muhurat' },
];

function GsRich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={`${k}-l-${i}`} href={link[2]} className="font-semibold underline underline-offset-2 hover:opacity-80" style={{ color: GOLD }}>
              {link[1]}
            </Link>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${k}-b-${i}`} style={{ color: GOLD }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

function GsHub({ items }: { items: GsLink[] }) {
  return (
    <ul className="space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold" style={{ color: GOLD }}>{i.label}</span>
            <span className="block text-xs text-slate-500">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function GemstoneSuitabilityPage() {
  const [result, setResult] = useState<EngineResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleData = (data: any) => {
    const engine = runEngine(data);
    setResult(engine);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const eligible = result?.stones.filter((s) => ['YK', 'B', 'b'].includes(s.gate) && (s.verdictKey === 'recommended' || s.verdictKey === 'trial')) ?? [];
  const primary = eligible[0] ?? null;
  const lifeStone = result ? result.stones.find((s) => s.graha === result.lagnaLord) ?? null : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': ORG_ID, name: 'Trikaal Vaani', legalName: 'Trikal Vaani', url: 'https://trikalvaani.com', sameAs: REAL_SAMEAS },
      { '@type': 'WebSite', '@id': WEBSITE_ID, name: 'Trikaal Vaani', url: 'https://trikalvaani.com', publisher: { '@id': ORG_ID }, inLanguage: 'en-IN' },
      { '@type': 'Person', '@id': AUTHOR_ID, name: 'Rohiit Gupta', url: 'https://trikalvaani.com', jobTitle: 'Chief Vedic Architect', worksFor: { '@id': ORG_ID },
        knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Gemstone Astrology (Ratna Vigyan)', 'Functional Benefic Analysis', 'Shadbala', 'Kundali Analysis'] },
      { '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL,
        name: 'Free Gemstone Suitability Calculator — Should You Wear It? (0–100 Score)',
        description: 'Free Vedic gemstone suitability calculator. Scores all 9 ratna 0–100 using your Lagna functional benefics, Shadbala strength, dignity, house, dasha and afflictions — with risk and verdict.',
        inLanguage: 'en-IN', dateModified: '2026-06-15', isPartOf: { '@id': WEBSITE_ID }, author: { '@id': AUTHOR_ID }, publisher: { '@id': ORG_ID },
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
        about: [{ '@type': 'Thing', name: 'Gemstone Astrology' }, { '@type': 'Thing', name: 'Functional Benefic' }, { '@type': 'Thing', name: 'Shadbala' }],
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.tv-aeo-answer'] } },
      { '@type': 'BreadcrumbList', '@id': `${PAGE_URL}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
        { '@type': 'ListItem', position: 3, name: 'Free Gemstone Suitability Calculator', item: PAGE_URL },
      ] },
      { '@type': 'WebApplication', '@id': `${PAGE_URL}#app`, name: 'Free Gemstone Suitability Calculator', url: PAGE_URL,
        applicationCategory: 'LifestyleApplication', operatingSystem: 'All', browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' }, provider: { '@id': ORG_ID },
        featureList: 'Functional benefic gate, Shadbala strength, dignity, house, dasha, affliction & risk scoring for all 9 gemstones' },
      { '@type': 'HowTo', '@id': `${PAGE_URL}#howto`, name: 'How to check if a gemstone suits you',
        description: 'Check the Vedic suitability of all 9 gemstones from your birth details.', totalTime: 'PT1M',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Enter birth details', text: 'Enter your name, date, exact time and place of birth.' },
          { '@type': 'HowToStep', position: 2, name: 'Compute chart', text: 'The engine computes your ascendant, planetary Shadbala and dignities using Swiss Ephemeris with Lahiri Ayanamsha.' },
          { '@type': 'HowToStep', position: 3, name: 'Read suitability scores', text: 'Each gemstone gets a 0–100 suitability score with a risk level and a clear verdict.' },
        ] },
      { '@type': 'FAQPage', '@id': `${PAGE_URL}#faq`, mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link><span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link><span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Free Gemstone Suitability Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Gemstone Suitability Calculator — Should You Wear It?
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              Har ratna har kisi ke liye shubh nahi hota. <strong style={{ color: GOLD }}>Trikaal Vaani ka Gemstone Suitability Calculator</strong> aapke <strong style={{ color: GOLD }}>Lagna ke functional benefic/malefic</strong>, graha ki <strong>Shadbala strength</strong>, dignity, bhaav, dasha aur afflictions check karke har ratna ko <strong style={{ color: GOLD }}>0–100 suitability score</strong> deta hai — saath mein risk aur saaf verdict. Bilkul free, Swiss Ephemeris based.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Functional Benefic + Shadbala + Dignity + Dasha · Lahiri Ayanamsha</div>
            </div>
          </div>

          <GemstoneForm onData={handleData} />

          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">
              <div className="rounded-xl p-4 text-center text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <span className="text-slate-400">Lagna: </span><span style={{ color: GOLD }} className="font-semibold">{result.lagna}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Lagna Swami: </span><span style={{ color: GOLD }} className="font-semibold">{result.lagnaLord}</span>
                <span className="text-slate-600 mx-2">·</span>
                <span className="text-slate-400">Mahadasha: </span><span style={{ color: GOLD }} className="font-semibold">{result.MD || '—'}</span>
              </div>

              {primary ? (
                <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.4)}` }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Sabse Suitable Ratna</div>
                  <div className="text-5xl mb-2">💎</div>
                  <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: GOLD }}>{primary.stone_en} <span className="text-2xl text-slate-300">({primary.stone_hi})</span></div>
                  <div className="text-sm text-slate-300 mb-3">{primary.graha} ({primary.planet_hi}) ka ratna · Suitability <strong style={{ color: GOLD }}>{primary.score}/100</strong> · Verdict: <strong style={{ color: VERDICT_COLOR[primary.verdictKey].c }}>{primary.verdictLabel}</strong></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-left">
                    <DetailCell icon="🔗" label="Metal" value={primary.info.metal} />
                    <DetailCell icon="✋" label="Finger" value={primary.info.finger} />
                    <DetailCell icon="📅" label="Day" value={primary.info.day} />
                    <DetailCell icon="🕉️" label="Mantra" value={primary.info.mantra} />
                  </div>
                  {primary.info.upratna && (
                    <p className="mt-3 text-xs text-slate-400 text-left">
                      💠 <strong style={{ color: GOLD }}>Upratna (sasta / milder vikalp):</strong> {primary.info.upratna}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <div className="text-3xl mb-2">🛡️</div>
                  <p className="text-slate-200 font-semibold mb-1">Abhi koi ratna strongly suitable nahi.</p>
                  <p className="text-sm text-slate-400">Yeh achhi baat hai — hum aapko galat ratna nahi bechte. Aapke functional benefics is samay balheen ya afflicted hain. Niche poori ranking dekhein, aur poori kundali ke aadhar par expert salaah lein.</p>
                </div>
              )}

              <StoneScoreboard stones={result.stones} />

              {lifeStone && (
                <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, color: '#cbd5e1' }}>
                  ℹ️ <strong style={{ color: GOLD }}>Life Stone (Lagna Ratna):</strong> Aapke Lagna swami {result.lagnaLord} ka ratna <strong style={{ color: GOLD }}>{lifeStone.stone_en} ({lifeStone.stone_hi})</strong> — score {lifeStone.score}/100, verdict <strong style={{ color: VERDICT_COLOR[lifeStone.verdictKey].c }}>{lifeStone.verdictLabel}</strong>. Lagna ratna aam taur par sabse surakshit jeevan-bhar ka ratna mana jaata hai.
                </div>
              )}

              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-1 font-semibold">Sahi ratna ka faisla poori kundali maangta hai.</p>
                <p className="text-sm text-slate-400 mb-3">Combust, yoga aur poore bhaav-vishleshan ke saath apni complete kundali banayein — phir hi koi strong ratna dharan karein.</p>
                <Link href="/calculators/free-kundali-calculator" className="inline-block px-6 py-3 rounded-xl font-bold text-sm" style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  Free Poori Kundali Banayein →
                </Link>
              </div>
            </div>
          )}

          {/* ── v2.0: TABLE OF CONTENTS ─────────────────────────── */}
          <nav aria-label="Is page par kya hai" className="mt-16 rounded-2xl p-5 md:p-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <h2 className="text-lg font-serif font-bold mb-3" style={{ color: GOLD }}>Is Page Par Kya Hai</h2>
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`} className="hover:underline underline-offset-2" style={{ color: '#cbd5e1' }}>{sec.h2}</a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── v2.0: PILLAR CONTENT — keyword-driven H2 sections ── */}
          <section className="mt-12">
            {SECTIONS.map((sec, si) => (
              <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-10">
                <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>{sec.h2}</h2>
                {sec.paras.map((p, pi) => (
                  <p key={pi} className="text-slate-300 leading-relaxed mb-4">
                    <GsRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* ── v2.0: the nine per-stone pages and the theory ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Kisi ek ratna ka poora vishay</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Ye page nau ratna ki jaanch karta hai. Kisi ek patthar ka vistrit sawal ho to uska apna page hai — sab free, aur kahin kuch bikta nahi.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Nau ratna, alag-alag</h3>
                <GsHub items={HUB_STONE} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant aur buniyad</h3>
                <GsHub items={HUB_MORE} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Gemstone Suitability</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-gemstone-calculator', name: 'Lucky Gemstone' },
                { slug: 'free-should-i-wear-neelam', name: 'Should I Wear Neelam?' },
                { slug: 'free-should-i-wear-cats-eye', name: "Should I Wear Cat's Eye?" },
                { slug: 'free-weak-planet-finder', name: 'Weak Planet Finder' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`} className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
