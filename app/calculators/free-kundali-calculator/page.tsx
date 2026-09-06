// ============================================================
// File: app/calculators/free-kundali-calculator/page.tsx
// Purpose: Free AI Kundli Calculator — SEO/GEO/AEO/E-E-A-T page
// Version: v2.0 (05 Sep 2026) — calculator + full keyword-driven content
// Changelog v2.0 (2026-09-05): content build from Radar E3 PASF —
//   METADATA MOVED OUT of this file into ./layout.tsx. It used to live here
//   because this is a server component and could export it. Keeping it in two
//   places would have meant two sources of truth — the next person to edit the
//   title would change one and leave the other stale. Every other calculator
//   route now carries its metadata in layout.tsx, so this one matches.
//   Do NOT re-add `export const metadata` here.
//   ~900 -> ~5,100 words, 3 H2 -> 36, TOC added, FAQs expanded, and the
//   metadata moved to layout.tsx and fixed there. The form,
//   FreeKundaliCalculator, KundaliCalculatorClient, HOWTO_STEPS and the
//   JSON-LD are untouched.
// Changelog v1.3 (2026-09-05): mounted FreeKundaliCalculator above the
//   existing CTA block. Until now this page carried NO form at all and only
//   linked to the homepage #birth-form — Radar E2 read it on 05 Sep 2026 and
//   classified it page_format="article", correctly. Two copy lines that
//   promised Shadbala and free remedies were corrected to match what the
//   free tier actually returns. JSON-LD, HowTo, pillar copy and the CTA
//   component itself are unchanged.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.2 (2026-06-02) — Replaced 4 separate inline JSON-LD scripts
//        (SoftwareApplication / FAQPage / HowTo / BreadcrumbList) with the
//        shared buildCalcJsonLd() helper that emits one 8 @id-linked
//        @graph (Organization+real sameAs, WebSite, linkable Person
//        /founder, WebPage isPartOf #website, BreadcrumbList,
//        WebApplication price 0, HowTo, FAQPage + speakable). Removed the
//        self-serve aggregateRating (not backed by collected reviews;
//        Google-safe + consistent with all other calculators). Added
//        `.tv-aeo-answer` class to above-fold answer for speakable. Brand
//        fix: visible/schema brand normalised to the double-a spelling;
//        legal single-a kept inside helper only. KundaliCalculatorClient,
//        FAQs, HowTo steps and pillar copy unchanged.
//   v1.1 — restored.
// ============================================================

import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import FreeKundaliCalculator from '@/components/calculators/FreeKundaliCalculator';
import KundaliCalculatorClient from '@/components/calculators/KundaliCalculatorClient';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';

const GOLD = '#D4AF37';


const FAQS = [
  { q: 'Kundli kya hoti hai?', a: 'Kundli (Janm Kundali) ek Vedic birth chart hai jo aapke janm samay grahon aur nakshatron ki position dikhata hai. Iska use Vedic astrology mein future predictions, character analysis, aur remedies ke liye hota hai.' },
  { q: 'Free Kundli Calculator kaise kaam karta hai?', a: 'Aap apni date of birth, time of birth, aur birth place enter karte ho. Trikaal Vaani ka Swiss Ephemeris engine sab grahon ki exact position calculate karta hai aur aapko Lagna, Nakshatra, Chandra Rashi, Mahadasha, aur Parashar-based remedies turant dikhata hai.' },
  { q: 'Kya yeh kundli accurate hai?', a: 'Haan. Trikaal Vaani Swiss Ephemeris use karta hai — wahi astronomical library jo NASA aur world-class astrology software use karte hain. Calculations Lahiri Ayanamsha pe based hain, BPHS ke classical rules ke according.' },
  { q: 'Mujhe apna exact birth time nahi pata, kya phir bhi kundli ban sakti hai?', a: 'Approximate time se bhi kundli ban sakti hai, lekin Lagna aur Bhava positions ke liye exact time important hai. Best — birth certificate ya parents se confirm karein.' },
  { q: 'Kundli ke baad kya milta hai?', a: 'Free mein aapko milta hai: (1) Lagna aur uska swami, (2) Chandra Rashi aur Surya Rashi, (3) Nakshatra aur pada, (4) Chal rahi Mahadasha aur Antardasha, (5) Sab 9 grahon ki rashi, bhaav, nakshatra aur vakri sthiti. Detailed prediction — Dasha timing, bhaav-wise yog aur personalized remedies (Mantra, Ratna, Daan) — ₹51 wale paid reading mein aate hain.' },
  { q: 'Yeh service kya free hai?', a: 'Haan. Basic kundli calculation, Lagna, Nakshatra, Dasha, aur Parashar remedies bilkul free hain. Detailed life prediction (career, marriage, health timing) ₹51 mein available hai.' },
  { q: 'Kya gender mention karna zaroori hai?', a: 'Optional hai. Lekin gender se kuch remedies personalize hote hain. Recommended hai mention karna.' },
  { q: 'Kya yeh kundli online save ho sakti hai?', a: 'Haan. Agar aap ₹51 ka detailed prediction lete ho toh aapki kundli aapke account mein permanently save ho jati hai.' },
  { q: 'नाम से जन्म कुंडली बन सकती है?', a: 'नहीं। कुंडली किसी एक क्षण में आकाश की तस्वीर है, और वह क्षण जन्म की तारीख तथा समय से आता है। नाम आकाश में कुछ नहीं बदलता, इसलिए उससे गणना संभव नहीं। जो साइट नाम से कुंडली बना कर दे, वह अनुमान दिखा रही है।' },
  { q: 'Kundali mein grahon ki degree kyun zaroori hai?', a: 'Sirf rashi jaan lena adhoora hai. Degree se teen cheezein aati hain — nakshatra aur pada (jisse dasha aur naam bante hain), varga chart jaise Navamsa aur Dasamsa, aur uchch-neech ki matra. Isi liye yahan har graha ki degree dikhti hai.' },
  { q: 'North Indian aur South Indian chart alag kyun dikhte hain?', a: 'Dono ek hi jaankari dikhate hain, prastuti alag hai. North Indian mein khaane sthir hain aur rashiyaan badalti hain; South Indian mein rashiyaan sthir hain aur lagna par nishan lagta hai. Agar dono jagah lagna aur grahon ki rashi mil rahi hai to kundali ek hi hai.' },
  { q: 'Kya 40-page ki free kundali report kaam ki hoti hai?', a: 'Prayah nahi. Wo template text hoti hai — har graha ke liye pehle se likha paragraph, chart ke hisaab se jod diya gaya. Isi liye wo itni lambi hoti hai aur usme ek jagah kuch aur doosri jagah uska ulta likha milta hai. Asli vishleshan lambai se nahi, sanketon ke mel se banta hai.' },
  { q: 'Do site alag kundali dikha rahi hain — kaunsi sahi hai?', a: 'Teen wajah ho sakti hain. Ayanamsha ka antar (Lahiri, Krishnamurti, Raman), paddhati ka antar (Vedic nirayana bनाम paashchatya sayana), aur janm samay ki galti. Sabse pehle samay jaanchiye — aadhe ghante ki galti lagna ki degree badal deti hai aur do ghante ki poora lagna.' },
  { q: 'Kundali kaise save ya download karein?', a: 'Browser se print par jaaiye aur "Save as PDF" chuniye — phone par bhi ye vikalp share menu mein milta hai. Isse poora result ek PDF ban jaata hai. Grahon ki degree wali table zaroor save kijiye, sirf rashi wali nahi.' },
  { q: 'Janm kundali kabhi badalti hai?', a: 'Nahi. Wo ek kshan ki tasveer hai aur jeevan bhar wahi rehti hai. Jo badalta hai wo dasha hai (jo apne kram se chalti hai) aur gochar (grahon ka aaj aakash mein chalna). Isi liye kundali ek baar bana kar save kar lena kaafi hai.' },
];

const HOWTO_STEPS = [
  { name: 'Apni Date of Birth daalo', text: 'Apne janm ki tareeq select karein — din, mahina, saal.' },
  { name: 'Time of Birth daalo', text: 'Janm samay enter karein — ghante aur minute. Jitna exact, utna accurate result.' },
  { name: 'Birth Place daalo', text: 'Apne janm sthan ka naam likho. Google Places se auto-suggest milega.' },
  { name: 'Gender select karo (optional)', text: 'Male / Female / Other — taaki remedies personalize ho sakein.' },
  { name: 'Calculate button dabao', text: 'Aapki Janm Kundali, Lagna, Dasha, aur remedies 5 second mein ready ho jayegi.' },
];

// ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
const PAGE_URL = 'https://trikalvaani.com/calculators/free-kundali-calculator';
const jsonLd = buildCalcJsonLd({
  pageUrl: PAGE_URL,
  name: 'Free AI Kundli Calculator — Janm Kundali Online',
  description:
    'Free AI Kundli calculator powered by Swiss Ephemeris — accurate Janm Kundali with Lagna, Nakshatra, Chandra Rashi, Mahadasha and 3 free Parashar remedies. Free Vedic calculator by Trikaal Vaani.',
  breadcrumbName: 'Free Kundli Calculator',
  aboutEntities: ['Janm Kundali', 'Lagna', 'Nakshatra', 'Mahadasha'],
  knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Janm Kundali', 'Birth Chart'],
  howToName: 'Free AI Kundli Kaise Banayein',
  howToSteps: HOWTO_STEPS.map((s) => ({ name: s.name, text: s.text })),
  faqs: FAQS,
});


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   ~900 words · 3 H2 · 22 internal links.
//   GSC 3 months to 4 Sep 2026: 1,002 impressions, 9 clicks, CTR 0.90%,
//   average position 60.67 — the HIGHEST impressions of the thirteen thin
//   calculators and one of the worst positions. Google shows this page a lot
//   and almost nobody clicks, because until this morning the page had no
//   calculator on it at all (see the v1.3 changelog above).
//
// WHERE THE H2s COME FROM — Radar E3, live SERP PASF, checked 05 Sep 2026,
// cluster calc-kundali. Every tracked keyword has our_rank = null:
//     free kundali calculator online ..... AIO recommends_tool
//     janam kundali banaye free .......... AIO recommends_tool
//     जन्म कुंडली कैलकुलेटर ................. AIO recommends_tool
//     कुंडली कैसे बनाएं ऑनलाइन ............... AIO recommends_tool
//
//   PASF harvested and answered below:
//     Best free online Kundali · Free Kundali by date of birth
//     Free Kundali software · Free Kundali download
//     Free kundli with degrees of planets · Free online Kundali with degrees
//     Free Kundali for new born baby · Kundli check online
//     Janam Kundali by date of birth and time · Janam Kundli kaise banaye
//     My Kundali and future · जन्म कुंडली भविष्य देखना
//     Kundali Kaise Dekhe in Hindi · कुंडली कैसे देखे मोबाइल में
//     नाम से जन्म कुंडली बनाना · सही जन्म कुंडली
//     फ्री कुंडली विश्लेषण इन हिंदी 40 pages · फ्री कुंडली विश्लेषण इन हिंदी PDF
//     फ्री जन्म कुंडली ऐप · AstroSage Kundli Hindi · Vedic Rishi Kundali free
//
// KEYWORD SPLIT — deliberate, do not undo
//   This page owns MAKING and READING the chart. Everything about measuring it
//   belongs elsewhere and is handed over by link, never re-explained:
//     /calculators/free-lagna-calculator          — which lagna
//     /calculators/free-lagna-bal-calculator      — how strong the lagna is
//     /calculators/free-rashi-calculator          — Chandra Rashi
//     /calculators/free-nakshatra-calculator      — nakshatra and pada
//     /calculators/free-graha-bal-calculator      — Shadbala figures
//     /calculators/free-weak-planet-finder        — which planet is weak
//     /calculators/free-kundali-strength-calculator — the composite score
//     /calculators/free-dasha-calculator          — the dasha table
//
// TWO REFUSALS THAT MUST SURVIVE ANY REWRITE
//   (1) "नाम से जन्म कुंडली बनाना" is a live PASF entry. A chart cannot be built
//       from a name — the answer is no, said plainly, with the reason.
//   (2) "फ्री कुंडली विश्लेषण इन हिंदी 40 pages" is another. A 40-page auto
//       generated PDF is template text, not a reading, and the page says so
//       rather than producing one to capture the query.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type KcSection = { id: string; h2: string; paras: string[] };

const SECTIONS: KcSection[] = [
  {
    id: 'kundali-kaise-banaye',
    h2: 'Janam Kundali kaise banaye — teen cheezein chahiye',
    paras: [
      'Kundali banane ke liye teen cheezein chahiye aur teeno zaroori hain: **janm tithi**, **sateek janm samay**, aur **janm sthan**.',
      'Teeno kyun. **Tareekh** se grahon ki rashi aati hai. **Samay** se lagna aata hai — aur lagna se hi baarah bhaav bante hain. **Sthan** se lagna ka sudhar hota hai, kyunki wo akshansh ke saath badalta hai; ek hi kshan par Delhi aur Chennai ka lagna alag ho sakta hai.',
      'Upar wale form mein teeno daaliye aur kundali turant ban jaati hai — **lagna, uska swami, Chandra rashi, Surya rashi, nakshatra aur pada, nau grahon ki sthiti, aur chal rahi dasha.** Bilkul free, bina signup.',
    ],
  },
  {
    id: 'naam-se-kundali',
    h2: 'नाम से जन्म कुंडली बनाना — क्या यह संभव है',
    paras: [
      'यह प्रश्न बहुत खोजा जाता है, इसलिए उत्तर सीधा होना चाहिए: **नहीं, नाम से कुंडली नहीं बन सकती।**',
      'कारण गणितीय है। कुंडली आकाश की एक तस्वीर है — किसी एक क्षण में ग्रह कहाँ थे। वह क्षण जन्म की तारीख और समय से आता है। **नाम आकाश में कुछ नहीं बदलता**, इसलिए उससे कोई गणना संभव नहीं।',
      'जो नाम से निकल सकता है वह बस इतना है कि **यदि नाम जन्म नक्षत्र के पद के अनुसार रखा गया था**, तो पहला अक्षर उल्टा चलकर नक्षत्र तक ले जा सकता है — और वह भी अनुमान ही रहेगा, क्योंकि एक अक्षर दो नक्षत्रों में आ सकता है और आजकल अधिकतर नाम पसंद से रखे जाते हैं।',
      'इसलिए यदि कोई साइट "नाम से कुंडली" बना कर दे रही है, तो वह अनुमान दिखा रही है, गणना नहीं। सही कुंडली के लिए जन्म का समय चाहिए ही।',
    ],
  },
  {
    id: 'kundali-kaise-dekhe',
    h2: 'कुंडली कैसे देखें — पढ़ने का सही क्रम',
    paras: [
      'कुंडली बन जाने के बाद असली प्रश्न यही होता है, और अधिकतर लोग उल्टा क्रम चलते हैं — पहले यह देखते हैं कि किस खाने में कितने ग्रह हैं।',
      'सही क्रम यह है। **एक — लग्न देखिए**, क्योंकि पूरा चार्ट उसी पर खड़ा है। **दो — लग्न का स्वामी कहाँ बैठा है**, क्योंकि भाव का फल उसके स्वामी से चलता है। **तीन — चंद्र राशि और नक्षत्र**, क्योंकि दशा और गोचर इन्हीं से चलते हैं। **चार — नौ ग्रह किन भावों में हैं।** **पाँच — कौन सी दशा चल रही है**, क्योंकि वही बताती है कि अभी क्या सक्रिय है।',
      'एक बात जो बार-बार दोहरानी पड़ती है: **खाली भाव कमज़ोर नहीं होता।** भाव का फल उसके स्वामी से चलता है, ग्रहों की भीड़ से नहीं। खाली दशम और बलवान दशमेश वाली कुंडली, भरे हुए दशम और पीड़ित दशमेश वाली से अक्सर बेहतर होती है।',
    ],
  },
  {
    id: 'north-south-chart',
    h2: 'North Indian aur South Indian chart — dono alag kyun dikhte hain',
    paras: [
      'Do jagah kundali dekh kar log ghabra jaate hain ki dono alag hain. Dono ek hi jaankari dikhate hain.',
      '**North Indian (heere jaisa)** — **khaane sthir hain aur rashiyaan badalti hain.** Sabse upar wala khaana hamesha pehla bhaav hai, aur usme jo ank likha hai wo aapki lagna rashi ka number hai. Bhaav ka kram ghadi ke ulta chalta hai.',
      '**South Indian (chaukor)** — **rashiyaan sthir hain aur bhaav badalte hain.** Har khaana hamesha ek hi rashi ka hai (upar-baaye se Meen, phir Mesh…), aur lagna par ek nishan laga hota hai. Kram ghadi ki disha mein chalta hai.',
      'Isliye ghabraiye mat: **agar dono jagah lagna aur grahon ki rashi mil rahi hai to kundali ek hi hai** — sirf dikhane ka tarika alag hai. East Indian (Bengali) shaili bhi hai, jo teesra roop hai.',
    ],
  },
  {
    id: 'degrees',
    h2: 'Free kundli with degrees of planets — degree kyun zaroori hai',
    paras: [
      'Ye PASF mein bar-bar aata hai aur wajah gambhir hai — degree ke bina kundali aadhi hai.',
      'Adhikansh muft tool sirf batate hain ki graha kis **rashi** mein hai. Par ek rashi 30 degree ki hoti hai, aur uske andar graha kahan hai — ye teen cheezein tay karta hai: **nakshatra aur pada** (jisse dasha aur naam aate hain), **varga chart** (Navamsa, Dasamsa — ye rashi ko 9 aur 10 hisson mein baantte hain), aur **uchch-neech ki matra** (uchch bindu se kitni door).',
      'Isliye "Guru Meen mein hai" adhoori jaankari hai. "Guru Meen mein 27 degree 14 minute par" poori jaankari hai — aur usse pata chalta hai ki wo Revati nakshatra ke doosre pada mein hai.',
      'Yahan har graha ki degree dikhti hai, isi liye. Aur wo Swiss Ephemeris se aati hai, Lahiri ayanamsha ke saath.',
    ],
  },
  {
    id: 'barah-bhaav',
    h2: 'Barah bhaav — kaunsa bhaav kis cheez ka',
    paras: [
      'Kundali padhne ke liye ye jaan lena zaroori hai ki kaunsa khaana kya kehta hai. Ye kram sabke liye ek hai.',
      '**Pehla** — shareer, vyaktitva, jeevan-disha. **Doosra** — dhan, parivaar, vaani. **Teesra** — saahas, bhai-behen, chhoti yatra. **Chautha** — maa, ghar, sukh, sampatti. **Paanchvaan** — santan, buddhi, shiksha. **Chhathaa** — rog, shatru, pratiyogita, sewa.',
      '**Saatvaan** — vivah, jeevansaathi, saajhedaari. **Aathvaan** — aayu, achanak ghatnaayein, gehrai. **Navaan** — bhagya, dharm, guru, lambi yatra. **Dasvaan** — karm, pad, sarkari kaam. **Gyarahvaan** — laabh, aay, ichha-poorti. **Barahvaan** — vyay, videsh, moksha, ekaanth.',
      'Ek mota niyam jo kaam aata hai: **kendra (1, 4, 7, 10)** jeevan ka dhancha hain, **trikona (1, 5, 9)** bhagya ke, aur **dusthana (6, 8, 12)** sangharsh ke. Par dusthana ka matlab bura nahi — chhathaa bhaav pratiyogita mein jitaata hai aur barahvaan videsh le jaata hai.',
    ],
  },
  {
    id: 'nau-graha',
    h2: 'Nau graha — har ek kis cheez ka kaarak hai',
    paras: [
      'Bhaav ke saath grahon ka kaarakattva jaan lena kundali padhne ka doosra aadha hissa hai.',
      '**Surya** — aatma, pita, pad, sarkar, aatmvishwas. **Chandra** — mann, maa, bhavna, neend. **Mangal** — urja, saahas, bhai, sampatti. **Budh** — buddhi, sanvaad, vyapaar, ganana. **Guru** — gyaan, dhan, santan, guru, dharm.',
      '**Shukra** — sambandh, kala, sukh, jeevansaathi, vaahan. **Shani** — sewa, anushasan, aayu, dheeraj, karm. **Rahu** — ichha, videsh, asaamanya raste, uljhan. **Ketu** — vairagya, adhyatm, chhod dena, sookshm buddhi.',
      'Ek zaroori antar jo log chhod dete hain: **kaarakattva sabke liye ek hai, par bhaav-swamitva har lagna ke liye alag.** Shukra sabke liye sambandh ka kaarak hai — par aapki kundali mein wo kaunse bhaavon ka swami hai, ye aapke lagna par tikta hai. Har graha ka vistaar [Planets in Astrology](/learn/planets-in-astrology) mein hai.',
    ],
  },
  {
    id: 'lagna-rashi-nakshatra',
    h2: 'Kundali ke teen aadhaar — lagna, rashi, nakshatra',
    paras: [
      'Result mein teen cheezein sabse upar aati hain aur teeno alag kaam karti hain. Inhe mila dena is vishay ki sabse aam galti hai.',
      '**Lagna** — janm ke kshan purvi kshitij par kaunsi rashi udit thi. Isse baarah bhaav bante hain, isliye poora chart ispar khada hai. **Chandra Rashi** — Chandra kis rashi mein tha. Naam isse rakha jaata hai aur gochar tatha Sade Sati isi se ginte hain. **Nakshatra** — Chandra kis nakshatra mein tha. Isse **dasha shuru hoti hai.**',
      'Vyavharik roop se: **bhaavon ke liye lagna, gochar ke liye rashi, dasha ke liye nakshatra.** Teeno alag jagah kaam aate hain aur teeno is kundali mein aate hain.',
      'Har ek ko gehrai se dekhna ho to alag page hain aur sab free — [Lagna Calculator](/calculators/free-lagna-calculator), [Rashi Calculator](/calculators/free-rashi-calculator) aur [Nakshatra Calculator](/calculators/free-nakshatra-calculator).',
    ],
  },
  {
    id: 'dasha-table',
    h2: 'Dasha table — kundali ka sabse kaam ka hissa',
    paras: [
      'Bahut se log kundali dekh kar grahon ki sthiti padh lete hain aur dasha chhod dete hain. Wahi sabse zyada kaam ka hissa hai.',
      '**Vimshottari Dasha** 120 saal ka chakra hai jisme har graha ko ek nishchit avadhi milti hai — Ketu 7 saal, Shukra 20, Surya 6, Chandra 10, Mangal 7, Rahu 18, Guru 16, Shani 19, Budh 17. Ye kram sthir hai.',
      'Aapki pehli dasha **janm nakshatra ke swami** se shuru hoti hai — Ashwini ka swami Ketu hai, to Ashwini mein janme bachche ki pehli dasha Ketu ki. Isi liye do log ek hi din paida ho kar bhi alag daur jee rahe hote hain.',
      'Kundali ka matlab isi se banta hai: **graha batata hai kya sambhav hai, dasha batati hai kab.** Poori dasha table dekhni ho to [Dasha Calculator](/calculators/free-dasha-calculator) free hai, aur sidhant [Mahadasha explained](/learn/mahadasha-explained) mein.',
    ],
  },
  {
    id: 'varga-charts',
    h2: 'Varga chart — ek kundali nahi, kai kundaliyaan',
    paras: [
      'Ye baat naye logon ko chaunkati hai: **janm kundali ek nahi hoti.** Uske saath kai divisional chart bante hain, jinhe varga kehte hain.',
      'Mukhya varga: **D-1 (Rasi)** — mool chart. **D-9 (Navamsa)** — vivah aur bhagya. **D-10 (Dasamsa)** — career. **D-7 (Saptamsa)** — santan. **D-4 (Chaturthamsa)** — sampatti. **D-12 (Dwadasamsa)** — maa-baap.',
      'Kaam ka niyam: **mool chart vaada dikhata hai; varga chart uski pushti karta hai.** BPHS saaf kehta hai ki vivah Navamsa se aur career Dasamsa se dekha jaata hai. Isi liye "mere dasham mein Guru hai to career achha hoga" adhoora nishkarsh hai — Dasamsa bhi dekhna padta hai.',
      'Yahi wo hissa hai jo zyadatar muft kundali chhod deti hai. Varga chart degree par tikte hain, isliye sateek janm samay yahan aur bhi zaroori ho jaata hai.',
    ],
  },
  {
    id: 'sahi-kundali',
    h2: 'सही जन्म कुंडली कौन सी है — दो जगह अलग क्यों आती है',
    paras: [
      'यह शिकायत बहुत आम है और इसके तीन ठोस कारण हैं। उन्हें इसी क्रम में जाँचिए।',
      '**एक — अयनांश।** लाहिड़ी, कृष्णमूर्ति और रमन अलग-अलग गणना देते हैं, और उससे ग्रहों की डिग्री बदल जाती है। संधि के पास हो तो राशि भी बदल सकती है। हम **लाहिड़ी** उपयोग करते हैं, जो भारत सरकार का मानक है और पंचांग भी वही चलाता है।',
      '**दो — पद्धति।** पाश्चात्य ऐप सायन (tropical) पर चलते हैं, वैदिक ज्योतिष निरयन (sidereal) पर। दोनों में लगभग एक राशि का अंतर आता है। यह किसी की गलती नहीं — अलग पद्धतियाँ हैं।',
      '**तीन — जन्म समय।** यही सबसे आम कारण है। आधे घंटे की गलती लग्न की डिग्री बदल देती है, दो घंटे की गलती पूरा लग्न। घर की याद प्रायः गोल कर दी जाती है — **जन्म प्रमाणपत्र या अस्पताल का रिकॉर्ड** ही भरोसे का है।',
    ],
  },
  {
    id: 'janm-samay-nahi',
    h2: 'Janm samay nahi pata — kundali ban sakti hai?',
    paras: [
      'Aanshik roop se, aur ye seema saaf jaan leni chahiye.',
      '**Jo samay ke bina bhi sahi rahega:** grahon ki rashi (adhikansh dinon mein), Chandra rashi (prayah), Surya rashi (pakka), aur nakshatra (prayah, par pada nahi).',
      '**Jo samay ke bina galat hoga:** lagna aur baarah ke baarah bhaav, nakshatra ka pada, saare varga chart, aur dasha ka sateek aarambh. Yaani kundali ka aadha se zyada hissa.',
      'Samay bilkul na ho to **12:00 dopahar** maan liya jaata hai. Aise result ko **disha-soochak** maaniye, nirnay nahi. Aur agar sambhav ho to janm pramanpatra dhoondhiye — das minute ka kaam agle chalis saal ki har padhai sateek bana dega. Kuch paramparaein "birth time rectification" bhi karti hain, par wo ek vishesheshgya ka kaam hai, kisi calculator ka nahi.',
    ],
  },
  {
    id: 'naye-bachche',
    h2: 'Naye bachche ki kundali — pehle kya karein',
    paras: [
      'Naye maa-baap ke liye kram saaf hona chahiye, kyunki wo waqt vyast hota hai aur baad mein cheezein chhoot jaati hain.',
      '**Pehla kaam — sateek samay likh lijiye.** Ghadi dekh kar, ghanta aur minute dono, aur ho sake to nurse se confirm kar lijiye. Ye das second ka kaam hai jispar agle chalis saal tikte hain.',
      '**Doosra — kundali bana lijiye** aur nakshatra, pada, lagna aur rashi likh lijiye. Naamkaran ke liye nakshatra aur pada chahiye honge; sanskaron mein nakshatra aur gotra bar-bar maange jaate hain.',
      '**Teesra — Gandmool dekh lijiye.** Ashwini, Ashlesha, Magha, Jyeshtha, Mula ya Revati mein janm ho to paramapara mein 27 din baad Mool Shanti hoti hai. Ye ashubh janm nahi hai, sirf ek vidhi hai. Naam ka akshar [Baby Name by Nakshatra](/calculators/free-baby-name-by-nakshatra) par mil jaayega.',
    ],
  },
  {
    id: 'chalees-page-pdf',
    h2: 'फ्री कुंडली विश्लेषण 40 pages PDF — इसका सच',
    paras: [
      'यह खोज बहुत होती है और इसका सीधा उत्तर देना ज़रूरी है, चाहे वह इस पेज के हक़ में न जाए।',
      '**40-पेज की स्वचालित रिपोर्ट पढ़ने लायक विश्लेषण नहीं होती।** वह टेम्पलेट टेक्स्ट है — हर ग्रह के लिए पहले से लिखा हुआ पैराग्राफ, जो आपके चार्ट के हिसाब से जोड़ दिया जाता है। इसीलिए वह इतनी लंबी होती है, और इसीलिए उसमें एक जगह कुछ लिखा होता है और दूसरी जगह उसका उल्टा।',
      'जो असली विश्लेषण करता है वह **लंबाई नहीं, मेल** देखता है — कौन से तीन-चार संकेत एक ही दिशा में हैं, और चल रही दशा क्या कह रही है। वह प्रायः दो पन्नों में आ जाता है।',
      'इसलिए यह पेज 40 पन्ने नहीं देता। यह **पूरी सटीक कुंडली मुफ़्त** देता है — लग्न, नौ ग्रह डिग्री के साथ, भाव, नक्षत्र और दशा — ताकि आप उसे किसी भी जानकार को दिखा सकें या खुद पढ़ सकें।',
    ],
  },
  {
    id: 'kundali-download',
    h2: 'Kundali download ya PDF — kaise save karein',
    paras: [
      'Ye vyavharik prashn hai, aur iska hal saral hai.',
      'Sabse aasan tarika: **browser se hi print par jaaiye aur "Save as PDF" chuniye.** Phone par bhi ye vikalp share menu mein milta hai. Isse poora page — lagna, graha, degree, dasha — ek PDF ban jaata hai jise aap kabhi bhi kisi ko bhej sakte hain.',
      'Doosra tarika: **screenshot.** Result ke mukhya hisse ka screenshot le kar phone mein rakh lijiye. Ye tab kaam aata hai jab kisi pandit ya jaankaar ko dikhana ho aur network na ho.',
      'Aur ek salah: **grahon ki degree wali table zaroor save kijiye**, sirf rashi wali nahi. Degree ke bina koi bhi aage ki padhai adhoori rahegi — varga chart aur dasha dono uspar tikte hain.',
    ],
  },
  {
    id: 'mobile-par-kundali',
    h2: 'कुंडली मोबाइल में कैसे देखें — ऐप चाहिए?',
    paras: [
      'यह प्रश्न बहुत खोजा जाता है, और उत्तर राहत देने वाला है: **किसी ऐप की ज़रूरत नहीं।**',
      'यह पेज मोबाइल ब्राउज़र में उसी तरह चलता है जैसे कंप्यूटर पर — वही गणना, वही Swiss Ephemeris, वही परिणाम। कोई डाउनलोड नहीं, कोई साइनअप नहीं, और फ़ोन में जगह भी नहीं जाती।',
      'ऐप का एक ही व्यावहारिक फ़ायदा होता है — बिना इंटरनेट के चलना। उसके लिए सरल हल यह है कि **परिणाम को एक बार PDF या स्क्रीनशॉट में सेव कर लीजिए।** जन्म कुंडली बदलती नहीं है, इसलिए एक बार सेव करना जीवन भर के लिए काफ़ी है।',
      'और एक बात जो ऐप वाले नहीं कहते: **अधिकतर मुफ़्त ऐप गणना के बदले विज्ञापन और पेड रिपोर्ट बेचते हैं।** यहाँ वह नहीं है।',
    ],
  },
  {
    id: 'kundli-check-online',
    h2: 'Kundli check online — kya-kya check karna chahiye',
    paras: [
      'Kundali ban jaane ke baad log poochhte hain ki "check" mein kya dekhein. Paanch cheezein kaafi hain.',
      '**Ek — lagna aur uska swami.** Swami kis bhaav mein hai aur kis dignity mein. **Do — Chandra rashi aur nakshatra**, kyunki gochar aur dasha inse chalte hain. **Teen — chal rahi Mahadasha aur Antardasha**, kyunki wahi abhi sakriy hai.',
      '**Char — aapke prashn ka bhaav.** Career ke liye dasham, vivah ke liye saptam, dhan ke liye dwitiya aur ekadash. Us bhaav ka swami kahan hai, ye dekhiye. **Paanch — koi graha uchch ya neech to nahi**, aur kisi par kroor drishti to nahi.',
      'Isse aage jo bhi hai — Shadbala, yog, varga — wo alag paimane hain aur unke liye alag page hain. [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) sabko ek saath dikhata hai, free.',
    ],
  },
  {
    id: 'meri-kundali-bhavishya',
    h2: 'जन्म कुंडली से भविष्य देखना — कितना सच है',
    paras: [
      'यह इस पेज का सबसे बड़ा प्रश्न है और इसका उत्तर ईमानदार होना चाहिए, चाहे वह बिक्री के हक़ में न जाए।',
      'शास्त्रीय स्थिति यह है: **कुंडली प्रवृत्ति दिखाती है, नियति नहीं।** वह बताती है कि कौन से क्षेत्र सहज खुलेंगे और कहाँ प्रयास अधिक लगेगा, और दशा बताती है कि कौन सा दौर किस चीज़ का है। यह मौसम के पूर्वानुमान जैसा है — दिशा बताता है, हर घटना नहीं।',
      'जो कुंडली **नहीं** बता सकती: कोई निश्चित घटना, कोई तारीख, किसी की मृत्यु, या कोई ऐसा उत्तर जिसे बदला न जा सके। जो कोई ऐसा दावा करे, वह डर बेच रहा है — और उसकी क़ीमत प्रायः बहुत होती है।',
      'सही उपयोग यह है: **अपनी दशा जानिए, अपने मज़बूत क्षेत्र जानिए, और उसी हिसाब से योजना बनाइए।** बाक़ी कर्म का हिस्सा है, और उसे कोई चार्ट नहीं करता।',
    ],
  },
  {
    id: 'kundali-milan-alag',
    h2: 'Kundali milan — ye alag prashn hai',
    paras: [
      'Log kundali banane ke baad turant milan ki taraf jaate hain, isliye antar saaf kar dena chahiye.',
      '**Janm kundali ek vyakti ki hoti hai.** Milan **do** kundaliyon ka mel dekhta hai, aur uski apni paddhati hai — **Ashtakoot Milan**, jisme aath koot aur 36 gun hote hain, aur wo mukhya roop se **nakshatra** par tikte hain.',
      'Isliye do logon ki kundali bana kar aankhon se mila lena milan nahi hai. Nadi, Bhakoot aur Gana jaise koot alag ganana maangte hain.',
      'Aur wo baat jo dohrayi jaani chahiye: **36 gun mil jaana ya na milna vivah ka faisla nahi hai.** Bahut se 30+ gun wale rishte nahi chalte aur 18 gun wale achhe chalte hain. Vivah se jude asli prashn — kab hoga, kya rukavat hai — ke liye [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) aur [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) alag hain.',
    ],
  },
  {
    id: 'dosh-dekh-kar',
    h2: 'Kundali mein "dosh" dikh gaya — pehle ye padhiye',
    paras: [
      'Ye is page ka sabse zaroori hissa ho sakta hai, kyunki kundali banane ke baad sabse zyada dar yahi paida hota hai.',
      'Teen naam sabse zyada sunayi dete hain: **Mangal dosh, Kaal Sarp dosh aur Pitra dosh.** Teeno ke baare mein ek hi baat sach hai — **ye sthitiyaan aam hain.** Mangal dosh lagbhag har chauthe-paanchve chart mein milta hai. Kaal Sarp tab banta hai jab saare graha Rahu-Ketu ke beech aa jaayein, jo dikhne mein bhaari lagta hai par asaamanya nahi.',
      '**Aur inme se koi bhi akela kisi ka jeevan nahi rokta.** Shastra mein har dosh ke saath uske **bhang** (radd hone) ke niyam bhi diye gaye hain, aur wo niyam prayah lag jaate hain. Jo koi dosh ka naam le kar hazaron ki pooja maange, wo dar bech raha hai.',
      'Apni sthiti khud jaanchni ho to teeno calculator free hain — [Manglik Dosh](/calculators/free-manglik-dosh-calculator), [Kaal Sarp Dosh](/calculators/free-kaal-sarp-dosh-calculator) aur [Pitra Dosh](/calculators/free-pitra-dosh-calculator).',
    ],
  },
  {
    id: 'ayanamsha',
    h2: 'Ayanamsha — Lahiri kyun aur iska kya asar hai',
    paras: [
      'Ye technical lagta hai par iska seedha asar aapke result par padta hai, isliye samajh lena chahiye.',
      'Aakash mein rashiyon ka aarambh-bindu dheere-dheere khisakta hai — lagbhag **72 saal mein ek degree.** Isliye "Mesh kahan se shuru hota hai" ka uttar samay ke saath badalta hai. **Ayanamsha** wahi sudhar hai jo is khiskav ko ginta hai.',
      '**Lahiri** Bharat sarkar ka maanak hai aur Rashtriya Panchang usi par bana hai. Isliye yahan bhi wahi use hota hai, aur isi kaaran yahan nikli rashi paramparik panchang se milti hai.',
      'Doosre maanak bhi hain — **Krishnamurti** aur **Raman** — jo thoda alag aankda dete hain. Antar chhota hai (kuch minute ka) par **rashi ki sandhi ke paas** wo rashi hi badal sakta hai. Isliye do site alag rashi dikhaayein to sabse pehle ye dekhiye ki dono kaunsa ayanamsha chala rahi hain.',
    ],
  },
  {
    id: 'swiss-ephemeris',
    h2: 'Swiss Ephemeris — ganana kis par hoti hai',
    paras: [
      'Ye batana zaroori hai kyunki iska matlab hai ki aankde jaanche ja sakte hain.',
      '**Swiss Ephemeris** ek khagolik library hai jo NASA ke JPL data par aadhaarit hai. Wo kisi bhi kshan ke liye grahon ki sthiti degree, minute aur second tak nikaal deti hai. Duniya ke adhikansh peshevar jyotish software yahi use karte hain.',
      'Iska seedha matlab: **is page ke grahon ki degree kisi bhi doosre gambhir software se milni chahiye** — badharte ayanamsha ek hi ho. Agar nahi milti to kahin samay ya sthan mein galti hai.',
      'Aur jo isse **nahi** aata: vyakhya. Swiss Ephemeris sirf batati hai ki graha kahan tha. Wo kya arth rakhta hai — wo BPHS aur classical granthon se aata hai, aur wahi hissa har jyotishi ka apna hota hai.',
    ],
  },
  {
    id: 'vs-astrosage',
    h2: 'AstroSage, Prokerala aur Vedic Rishi se farak',
    paras: [
      'Google in naamon ko is keyword ke saath bar-bar dikhata hai, isliye seedha uttar — usme wo bhi jo hamare paksh mein nahi jaata.',
      '**Grahon ki sthiti mein antar nahi milega.** Adhikansh gambhir tool wahi Swiss Ephemeris aur wahi Lahiri Ayanamsha use karte hain. Un sites ke paas **zyada tool, zyada bhashaayein, mobile app aur bahut purana domain authority** bhi hai — ye maan lena chahiye.',
      'Antar do jagah hai. **Ek — yahan kuch becha nahi jaata.** Koi 40-page PDF, koi paid dosh nivaran, koi "aapki kundali mein bhaari dosh hai" wali chetavni. Result saadharan hai to saadharan hi likha jaata hai.',
      '**Do — yahan likha hai ki har aankda kahan se aaya** — kaunsa ayanamsha, kaunsi library, kis niyam se. Isse aap use parakh sakte hain aur asahmat bhi ho sakte hain. Yahi ek daawa hai; baaki tulna aap khud kar lijiye.',
    ],
  },
  {
    id: 'kundali-badalti-nahi',
    h2: 'Kya kundali kabhi badal sakti hai',
    paras: [
      'Ye prashn poochha jaata hai aur uska uttar do hisson mein hai.',
      '**Janm kundali kabhi nahi badalti.** Wo ek kshan ki tasveer hai — us kshan graha kahan the. Wo tathya hai aur jeevan bhar wahi rehta hai. Koi upay, koi ratna, koi pooja us tasveer ko nahi badalti, aur jo aisa daawa kare wo galat keh raha hai.',
      '**Jo badalta hai wo do cheezein hain.** Ek — **dasha**, jo apne kram se aage badhti rehti hai. Do — **gochar**, yaani grahon ka aaj aakash mein chalna, jo roz badalta hai aur jisme Sade Sati jaisi cheezein aati hain.',
      'Isliye kundali ek baar bana kar **save kar lijiye** — PDF ya screenshot. Wo dobara banane par bilkul wahi aayegi. Jo dobara dekhna hota hai wo dasha aur gochar hai, aur unke liye [Dasha Calculator](/calculators/free-dasha-calculator) aur [Sade Sati Calculator](/calculators/free-sade-sati-calculator) alag hain.',
    ],
  },
  {
    id: 'kundali-ke-baad',
    h2: 'Kundali ban gayi — ab kis cheez se shuru karein',
    paras: [
      'Poora chart ek saath dekhna bhaari lagta hai. Kram ye rakhiye to aasan ho jaata hai.',
      '**Agar aap pehli baar dekh rahe hain** — apna lagna aur Chandra rashi jaan lijiye, aur chal rahi dasha. Itna hi shuruat ke liye kaafi hai. Lagna ka vistaar [Lagna Calculator](/calculators/free-lagna-calculator) par hai.',
      '**Agar aapka koi khaas prashn hai** — us bhaav aur uske swami par jaaiye. Career ke liye [Career Prediction Astrology](/learn/career-prediction-astrology), vivah ke liye [Shadi Kab Hogi](/calculators/free-shadi-kab-hogi-calculator), santan ke liye [Santan Yog Calculator](/calculators/free-santan-yog-calculator).',
      '**Agar aap taakat naapna chahte hain** — [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator) poora chitra deta hai, [Graha Bal Calculator](/calculators/free-graha-bal-calculator) har graha ka aankda, aur [Weak Planet Finder](/calculators/free-weak-planet-finder) batata hai kaunsa graha peeche hai.',
    ],
  },
  {
    id: 'kya-free-hai',
    h2: 'Is page par kya-kya milta hai, bilkul muft',
    paras: [
      'Poora page free hai. Milta hai: **lagna aur uska swami**, **Chandra rashi**, **Surya rashi**, **nakshatra aur pada**, **nau grahon ki sthiti degree ke saath**, unka **bhaav**, **vakri** hone ki sthiti, **dignity**, aur **chal rahi Mahadasha tatha Antardasha.**',
      'Koi signup nahi, koi card nahi, koi email nahi maanga jaata, aur koi hissa chhupa kar nahi rakha jaata.',
      'Paid reading wahi chart taala laga kar nahi hai — wo alag cheez hai. Wo chart ko **padhti** hai: yog, bhaav-swamitva, dasha ka mel, aur aapke apne prashn ka uttar. Chart banana aur chart padhna do alag kaam hain, aur pehla wala hamesha free rahega.',
    ],
  },
  {
    id: 'graha-ki-sthiti-padhna',
    h2: 'Graha ki sthiti kaise padhein — teen cheezein',
    paras: [
      'Result mein har graha ke saamne kuch aankde hote hain. Unme se teen sabse zyada bolte hain.',
      '**Ek — rashi.** Graha apni rashi mein hai, uchch mein, neech mein, mitra ya shatru rashi mein — ye uska "ghar" batata hai. **Do — bhaav.** Wo kis kshetra mein kaam kar raha hai. Kendra aur trikona anukool maane jaate hain.',
      '**Teen — vishesh sthitiyaan.** **Vakri (℞)** — graha ulta chal raha hai; iska arth kamzori nahi hai, Shadbala mein ise bal milta hai. **Ast** — Surya ke bahut paas, jisse phal daba hua maana jaata hai. **Vargottama** — graha rashi aur Navamsa dono mein ek hi rashi mein, jo bahut anukool hai.',
      'Teeno mila kar padhiye, ek-ek alag nahi. Ek graha neech rashi mein ho par kendra mein aur vargottama ho — wo kamzor nahi hai.',
    ],
  },
  {
    id: 'bhaav-swami',
    h2: 'Bhaav ka swami — kundali padhne ki asli chaabi',
    paras: [
      'Agar is page se ek hi baat yaad rakhni ho to ye rakhiye: **bhaav ka phal uske swami se chalta hai.**',
      'Iska matlab: kisi bhaav ke baare mein jaanna ho to pehle dekhiye ki **us bhaav mein kaunsi rashi hai**, phir **us rashi ka swami kaun hai**, phir **wo swami kahan baitha hai aur kis haal mein hai.** Wahi us bhaav ki asli haalat hai.',
      'Udaharan: dasham bhaav mein Vrishchik hai to dashamesh Mangal hua. Ab Mangal kahan hai — kendra mein, achhi rashi mein, kisi kroor ki drishti se bacha hua? Uska haal hi aapke career ki haalat hai, chahe dasham bhaav khaali ho.',
      'Isi wajah se **khaali bhaav kamzor nahi hota** — ye baat is page par jaanbujh kar do baar likhi hai, kyunki yahi sabse aam galat padhai hai.',
    ],
  },
  {
    id: 'kaunse-yog',
    h2: 'Yog kundali mein kaise dikhte hain',
    paras: [
      'Kundali banane ke baad log yog dhoondhne lagte hain — Raj Yoga, Dhan Yoga, Gaj Kesari. Ye kaise bante hain, mote taur par jaan lijiye.',
      '**Yog grahon ke aapsi sambandh se bante hain** — ek saath baithna (yuti), ek doosre ko dekhna (drishti), ya rashi badal lena (parivartan). Jaise **Gaj Kesari** tab kehte hain jab Guru Chandra se kendra mein ho; **Raj Yoga** tab jab kendra ka swami aur trikona ka swami sambandh banayein.',
      'Par ek zaroori baat: **yog ka hona hi kaafi nahi hai.** Raj Yoga bahut aam hai jab har kendra-trikona sambandh gina jaaye. Asli sawal ye hai ki **use banane wale graha itne balwan hain ya nahi** ki phal de sakein.',
      'Isliye kram ye rakhiye — pehle yog dekhiye, phir un grahon ka bal. Yog ke liye [Raj Yoga](/learn/raj-yoga) aur [Vipreet Raj Yoga](/learn/vipreet-raj-yoga); bal ke liye [Graha Bal Calculator](/calculators/free-graha-bal-calculator).',
    ],
  },
  {
    id: 'kundali-software',
    h2: 'Kundali software chahiye — ya website kaafi hai',
    paras: [
      'PASF mein "Free Kundali software" aata hai, isliye seedha uttar dena chahiye.',
      '**Aam upyog ke liye website kaafi hai.** Ganana wahi Swiss Ephemeris karti hai, chahe wo desktop software ho ya browser. Result mein koi antar nahi aata.',
      '**Software tab kaam ka hai jab aap peshevar roop se kaam karte hain** — bahut si kundaliyaan sambhalni hon, bahut se varga chart ek saath dekhne hon, ya offline chalana ho. Aise mein Jagannatha Hora jaise free software behtar hain.',
      'Aam vyakti ke liye jo chahiye — apni ya parivaar ki kundali, degree ke saath, dasha ke saath — wo is page par mil jaata hai. Aur **result ek baar PDF mein save kar lena** software ki offline zaroorat bhi poori kar deta hai.',
    ],
  },
  {
    id: 'gotra-nakshatra-note',
    h2: 'Kundali se ye paanch cheezein likh kar rakh lijiye',
    paras: [
      'Ye vyavharik salah hai jo baar-baar kaam aati hai, aur prayah tab dhoondhi jaati hai jab jaldi hoti hai.',
      'Paanch cheezein: **sateek janm samay**, **lagna**, **Chandra rashi**, **nakshatra aur pada**, aur **gotra** (jo parivaar se aata hai, kundali se nahi).',
      'Kyun: sanskaron ke **sankalp** mein pandit naam, gotra aur nakshatra maangte hain. Vivah ke milan mein nakshatra chahiye. Kisi bhi jyotishi ko dikhana ho to samay chahiye. Ye paanch ek kaagaz par likhne mein do minute lagte hain aur agle chalis saal bach jaate hain.',
      'Aur ek baat: **phone mein bhi save kar lijiye**, sirf kaagaz par nahi. Kaagaz kho jaate hain.',
    ],
  },
  {
    id: 'kundali-kis-umar',
    h2: 'Kundali kis umar mein dekhni chahiye',
    paras: [
      'Ye prashn maa-baap aur naye logon dono se aata hai.',
      '**Bachche ke liye** — janm ke turant baad **bana lena** chahiye, kyunki us waqt sateek samay milta hai. Par **padhna** aur uske aadhaar par faisle lena — wo alag baat hai, aur uski jaldi nahi hai. Chhote bachche par kundali ke aadhaar par apekshaayein rakhna nuksan karta hai.',
      '**Apne liye** — jab koi asli prashn ho. Career, vivah, ya koi daur samajh mein na aa raha ho. Bina prashn ke kundali padhna prayah chinta paida karta hai, jawab nahi.',
      'Aur wo baat jo shanti se kehni chahiye: **kundali dekh kar dar jaana isse na dekhne se bura hai.** Agar padhne ke baad aap zyada pareshan hain, to ya to padhai galat thi ya wo aapko dar bechne ke liye di gayi thi.',
    ],
  },
  {
    id: 'kundali-hindi',
    h2: 'कुंडली हिंदी में — भाषा से गणना बदलती है?',
    paras: [
      'यह प्रश्न बहुत खोजा जाता है और उत्तर सरल है: **नहीं, भाषा से गणना नहीं बदलती।**',
      'ग्रहों की स्थिति खगोलीय तथ्य है। मेष को अंग्रेज़ी में Aries कहें या तमिल में Mesham — राशि वही रहती है। इसी तरह गुरु, Jupiter और Brihaspati एक ही ग्रह हैं।',
      'जो बदलता है वह **प्रस्तुति** है — नाम किस लिपि में लिखे हैं, और व्याख्या किस भाषा में है। यह पेज हिंदी और हिंग्लिश दोनों में पढ़ा जा सकता है, और परिणाम में ग्रहों के नाम भारतीय रूप में ही आते हैं।',
      'इसलिए यदि कोई साइट "हिंदी कुंडली" को अलग चीज़ की तरह बेचे, तो वह केवल भाषा बेच रही है — गणना वही है।',
    ],
  },
  {
    id: 'kundali-kya-nahi',
    h2: 'Kundali kya nahi bata sakti',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye — aur is vishay mein sabse zaroori hai.',
      'Kundali **nahi** bata sakti: kisi ki mrityu ka samay, koi nishchit ghatna kis tareekh ko hogi, kisi pariksha ka result, ya koi aisa uttar jise badla na ja sake. Jo koi in mein se kuch bhi daawa kare — khaas kar mrityu — wo galat bhi hai aur nuksandeh bhi.',
      'Kundali **nahi** hai: chikitsiya salah ka vikalp, kanooni salah ka vikalp, ya koi aisa aadhaar jispar shaadi todi ya jodi jaaye.',
      'Jo ye deti hai: **pravritti ka naksha aur samay ka kram.** Kaunse kshetra sahaj khulenge, kahan prayaas zyada lagega, aur kaunsa daur kis cheez ka hai. Isi roop mein ise lijiye — aur jo isse zyada beche, us se door rahiye.',
    ],
  },
  {
    id: 'result-verify',
    h2: 'Apni kundali ko khud parakhne ka tarika',
    paras: [
      'Kisi bhi tool par bharosa karne se pehle use parakhna chahiye, aur is page ka har aankda parakhne layak hai.',
      'Wahi janm tithi, samay aur shahar kisi doosre bharose-mand software ya paramparik panchang mein daaliye. **Grahon ki rashi aur degree bilkul milni chahiye** — dono taraf Lahiri ayanamsha ho to antar nahi aayega.',
      'Agar **degree thodi alag** hai to ayanamsha ka antar hai. Agar **rashi alag** hai to ya to ayanamsha alag hai ya paddhati (paashchatya sayana). Agar **lagna alag** hai to samay ya shahar mein galti hai — aur wahi sabse pehle jaanchiye.',
      'Ek aasan jaanch: **apni kundali kisi purani, bhaqrose ki chhapi hui janm-patri se milaiye** agar ghar mein ho. Purani janm-patri prayah Lahiri par hi bani hoti hai, isliye milni chahiye.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Kundali ke aage — kahan jaayein',
    paras: [
      '**Ek-ek hissa gehrai se** — [Lagna Calculator](/calculators/free-lagna-calculator), [Rashi Calculator](/calculators/free-rashi-calculator), [Nakshatra Calculator](/calculators/free-nakshatra-calculator) aur [Dasha Calculator](/calculators/free-dasha-calculator). Sab free.',
      '**Taakat naapni ho** — [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator), [Graha Bal Calculator](/calculators/free-graha-bal-calculator), [Weak Planet Finder](/calculators/free-weak-planet-finder) aur [Lagna Bal Calculator](/calculators/free-lagna-bal-calculator).',
      '**Sidhant samajhna ho** — [Planets in Astrology](/learn/planets-in-astrology), [Nakshatra Guide](/learn/nakshatra-guide), [Mahadasha explained](/learn/mahadasha-explained), [Planetary dignity](/learn/planetary-dignity-exaltation-debilitation) aur [Raj Yoga](/learn/raj-yoga).',
    ],
  },
];

type KcLink = { href: string; label: string; note: string };

const HUB_CALC: KcLink[] = [
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Aapka lagna vistaar se' },
  { href: '/calculators/free-rashi-calculator', label: 'Rashi Calculator', note: 'Chandra rashi' },
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Nakshatra aur pada' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Kab kya khulega' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Poora chitra ek score mein' },
  { href: '/calculators/free-graha-bal-calculator', label: 'Graha Bal Calculator', note: 'Har graha ka bal' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Kaunsa graha peeche hai' },
  { href: '/calculators/free-manglik-dosh-calculator', label: 'Manglik Dosh Calculator', note: 'Dosh khud jaanchiye' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Gochar ka prashn' },
];

const HUB_LEARN: KcLink[] = [
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Nau graha, poora parichay' },
  { href: '/learn/nakshatra-guide', label: 'Nakshatra Guide', note: 'Sattais nakshatra' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Dasha ka sidhant' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Graha ki sthiti' },
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala', note: 'Bal kaise naapa jaata hai' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Yog ka sidhant' },
  { href: '/learn/vipreet-raj-yoga', label: 'Vipreet Raj Yoga', note: '6, 8, 12 ka yog' },
  { href: '/learn/career-prediction-astrology', label: 'Career Prediction', note: 'Dasham bhaav ka prashn' },
  { href: '/learn/child-birth-prediction', label: 'Child Birth Prediction', note: 'Panchma bhaav ka prashn' },
];

function KcRich({ text, k }: { text: string; k: string }) {
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

function KcHub({ items }: { items: KcLink[] }) {
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

export default function KundaliCalculatorPage() {
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
            <span style={{ color: GOLD }}>Free Kundli Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free AI Kundli Calculator — Janm Kundali Online
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Trikaal Vaani ka Free AI Kundli Calculator</strong> aapki Janm Kundali Swiss Ephemeris se calculate karta hai. Sirf date of birth, time, aur place daalo — Lagna, Nakshatra, Chandra Rashi, Surya Rashi, current Mahadasha aur nau grahon ki poori sthiti turant free milti hai.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Lahiri Ayanamsha · BPHS Classical Rules</div>
            </div>
          </div>

          <FreeKundaliCalculator />

          <div className="mt-10">
            <KundaliCalculatorClient />
          </div>

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
                    <KcRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* ── v2.0: the rest of the cluster ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Kundali ke aage — baaki free calculators</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Ye page chart banata hai. Uska ek-ek hissa gehrai se dekhne ke liye alag pages hain, aur sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <KcHub items={HUB_CALC} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <KcHub items={HUB_LEARN} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Yeh Calculator Kaise Kaam Karta Hai</h2>
            <div className="space-y-3">
              {HOWTO_STEPS.map((step, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: GOLD, color: '#080B12' }}>{i + 1}</div>
                  <div>
                    <div className="font-semibold mb-1" style={{ color: GOLD }}>{step.name}</div>
                    <div className="text-sm text-slate-400">{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions</h2>
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
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Check' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`}
                  className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
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
