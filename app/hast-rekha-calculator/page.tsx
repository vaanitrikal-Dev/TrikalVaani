// ═══════════════════════════════════════════════════════════════
// app/hast-rekha-calculator/page.tsx
// AI HAST REKHA CALCULATOR — money page (server component)
// Version: v3.5 (28 Oct 2026) — SALES COPY (Rohiit: "Focus on sales, marketing aur perseverance; bahana
//   nahi; client se count mat karwao"). "Khud giniye" ke saare vaade → granth ka vivah-yog / santaan-yog.
//   Apne hi khilaaf wale paragraph (AI kahan kamzor, palmist ka vikalp nahi, dhundhli photo se kamzor
//   reading) sales-copy mein badle — H2 sab rakhe (ek ka text badla). 2 naye CTA. Daave sach rakhe:
//   koi accuracy %, nakli review ya ulti-ginti nahi.
//   + SEO/GEO/AEO (Rohiit: "persuasion, marketing, sales pitch, saare naye feature, H2 add karo"):
//   6 naye Hindi H2 (shaadi kab, apna ghar, naukri ya business, vidya-yog, santaan-yog, shubh varsh),
//   EN H2 "Why ₹51 is the easiest yes" + "How the reading works — 8 steps", 5 naye FAQ, HowTo JSON-LD,
//   40-60 shabd direct answer mein naye sawaal. Koi H2 hataya nahi; title/URL/H1/canonical wahi.
// (previous) Version: v3.4 (28 Oct 2026) — JEEVAN KE SAWAAL (VM engine 2.3, granth 1.3.0). Rohiit: "Sab add karo",
//   "existing content aur H2 mat hatao", "Meghavijay ka naam har jagah se hatao". Koi H2 / section HATAYA
//   NAHI. Naye: English H2 "Your life questions — answered from the shloka" + Hindi H2 "जीवन के सवाल —
//   शादी, घर, संतान, नौकरी, पढ़ाई" (+3 FAQ, featureList, Offer). Purane daave jo ab sach nahi the
//   SUDHAARE (hataaye nahi): "shaadi kab nahi batate" → hatheli se nahi; janm samay dein to Kundali se
//   (lib/hastrekha/vivah-kundali.ts). Santaan: granth 3.6.4 + PC-PNDT line. Acharya ka naam hataya.
//   Title, URL, H1, canonical, hub links — badle nahi.
// (previous) Version: v3.3 (27 Oct 2026) — HAST REKHA v3 SACH: engine ab granth Hastasanjeevanam par (VM v2.0.0,
//   bina Gemini/Claude). Page ke daave report se milaaye: "8 scores / 6 rekha / 7 parvat / 5 upay /
//   dominant haath / photo kabhi save nahi" → 4 mukhya rekha (pitr, matr/dhan, urdhva, aayu) +
//   7 graha-sthaan (1.5.9-10) + 3 BPHS upay + shlok; mukhya haath granth 3.1.6 (purush right, stri
//   left); photo sirf consent par save. Title, URL, H1, keywords, hub links — badle nahi.
// (previous) Version: v3.2 (19 Oct 2026) — Radar weekly report 17 Oct 2026 (page at rank 1, PUSH 7 SERPs).
//   The brief's Hindi/AI/ChatGPT/scanner/male-female keywords already had their own H2 here, so
//   only three genuine gaps were added: 'Indian palm reading free' (16+12), 'Free palm reading
//   scanner online — male/female/India' (19+18+15+12) in English, and 'Hath ki rekha online check —
//   photo/scanner se' (17+12+12) in Hinglish. Meaning-questions still handed off to the blog hub.
// (previous) Version: v3.1 (03 Oct 2026) — +2 English H2 from the Radar weekly report 03 Oct 2026 — content-edit brief / PUSH list.
//   "AI palm reading online / scanner free no sign up" and "palm reading for male / female".
//   Price stated as on page (report ₹51). Form, upload flow, JSON-LD unchanged.
// (previous header line) Version: v2.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// CHANGE v2.0 (2026-08-31) — HINDI LAYER + PDF LEAD MAGNET
//   THE FINDING: this page had 2,975 words, 11 H2 and 38 links — and
//   exactly 32 Devanagari characters. Radar (30 Aug) shows three Hindi
//   palmistry keywords stuck at ranks 17, 18 and 19 while the English
//   side of the same hub performs. The diagnosis in the Radar report was
//   "Hindi content kamzor hai". That was wrong. Supabase holds EIGHTEEN
//   Hindi palmistry articles, all live and all indexed — and NOT ONE of
//   them was linked from this page. The Hindi content was never weak; it
//   was orphaned from the money page that should have been feeding it.
//   1. HUB_HINDI_LINES / _SIGNS / _STRUCTURE — the 18 Hindi articles,
//      rendered in a mirror of the existing English hub. Hub links
//      17 -> 35. Every href verified against the live sitemap 31 Aug 2026.
// ─────────────────────────────────────────────────────────────────────────────
// v3.0 (07 Sep 2026) — CONTENT BUILD. 42 sections appended to HINDI_SECTIONS,
// taking the page from 8 keyword sections to 50 and adding ~4,400 words.
//
// WHY THIS PAGE AND NOT A NEW ONE
//   GSC, 3 months to 4 Sep 2026: 1,308 impressions, 59 clicks, CTR 4.51%,
//   average position 7.41. It already ranks. "hast rekha shastra" sits at
//   position 2.6. The gap is the queries with impressions and ZERO clicks:
//     hasta rekha ......... 65 impressions, 0 clicks, position 6.9
//     ai hast rekha ....... 61 impressions, 0 clicks, position 7.5
//   Those are people who saw us on page one and did not click.
//
// WHERE THE NEW H2s COME FROM — Radar E3, checked 05 Sep 2026, cluster palm-ai
//   ai se hath ki rekha kaise dekhe ..... our_rank 10   AIO answers
//   ai palm reading online free ......... our_rank —    AIO recommends_tool
//   Foreign settlement palmistry ........ our_rank —    AIO answers
//   PASF harvested from those SERPs and answered below:
//     Palm reading scanner online free · Hath ki rekha scan karne wala app
//     Hath ki rekha dekhne wala app free · Hath ki rekha online check free
//     Ai palm reading online free female / male / in hindi
//     ChatGPT palm reading free · Can ChatGPT read my palm? · Gemini AI palm reading
//     Free online palm reading for marriage · Love marriage yog in palmistry
//     Indian palm reading free · Palm reading hindi
//     धन की हस्तरेखा · भाग्यशाली हस्त रेखा · हस्त रेखा ज्ञान
//     Foreign line in Female hand · Right hand foreign travel line in Female hand
//     Best palmist in Noida · Videsh yatra yog hast rekha
//
// CANNIBALISATION — the site already carries 41 palmistry blog posts, most
//   2,200-4,500 words, and they own the MEANINGS: every line (life, head,
//   heart, fate, sun, marriage) in both languages, every sign (fish, M,
//   trishul, star/triangle/square, island/cross/grille), the mounts, which
//   hand to read, and whether palmistry is accurate.
//   THIS PAGE OWNS THE TOOL: how to photograph a palm, what the machine can
//   and cannot see, how it differs from ChatGPT or a scanner app, what the
//   report contains, and what happens to the photo. Every meaning question is
//   handed off by link and never re-explained here.
//
// TWO THINGS THIS PAGE WILL NOT DO — they are load-bearing, not decoration
//   1. It will not read age or a date from a line. "Aapki shaadi 2027 mein
//      hogi" is not something a palm gives, and the section says so.
//   2. It will not name an illness. A line is not a diagnosis, and a page that
//      hints at one can keep somebody from a doctor.
//
//   2. HINDI_SECTIONS — 8 new Devanagari H2 sections. Six come from the
//      Radar E3 content brief, three from Radar Part 5 (ranks 17/18/19):
//        • हाथ की रेखा कैसे देखें — चरण दर चरण
//        • हाथ की रेखा ऑनलाइन चेक करने का तरीका
//        • एआई हस्तरेखा — मशीन असल में क्या देखती है      [Part 5, rank 17]
//        • AI से हाथ की रेखा कैसे देखें — तीन कदम          [Part 5, rank 18]
//        • हस्तरेखा ऑनलाइन देखें — बिना जन्म कुंडली के     [Part 5, rank 19]
//        • हाथ की रेखा देखने का तरीका PDF (both PDF keywords in one H2)
//        • भाग्यशाली हस्त रेखा
//        • गरीबी हस्त रेखा
//      Devanagari on page: 32 chars -> ~9,000.
//   3. PDF LEAD MAGNET — /hast-rekha-gyan-guide.pdf, a real 5-page A4
//      Hindi guide with two original palm diagrams. "PDF" appeared twice
//      in the brief's keyword list, so a section about a PDF that did not
//      exist would have been a lie. The file ships with this change and
//      must be placed at public/hast-rekha-gyan-guide.pdf.
//      Deliberately NOT gated behind email: the keyword intent is "give me
//      the PDF", and an email wall on a free guide is the exact friction
//      this brand exists to avoid. It still works as a lead magnet through
//      the CTA inside the PDF itself.
//   4. FAQS extended 8 -> 13; the five new ones are Hindi-first and feed
//      the same JSON-LD FAQPage as before. No schema restructuring.
//   5. Nothing removed. Metadata, JSON-LD, the English content block, the
//      client tool import and the privacy language from v1.4 are all
//      untouched.
//
// CHANGE v1.4 (2026-07-19) — PRIVACY TRUTH + HANDEDNESS SYNC
//   The v1.3 privacy claim ("image stays in your browser session")
//   was FALSE: the image is POSTed to our server and passed to the
//   vision engine for analysis. Verified in Supabase before this fix:
//   palmistry_reports has NO image column and storage holds only PDFs
//   — so the image is NOT saved by us, but it does leave the browser.
//   A privacy claim that our own architecture contradicts is a legal
//   and trust liability on a paid page. Every instance corrected to
//   the verified truth: "processed for analysis, never saved to our
//   database or storage; only your report is saved."
//   Locations fixed: FAQ answer, how-it-works step 3, JSON-LD
//   featureList, Offer description, bottom CTA microcopy.
//   Also: FAQ hand answer now mentions the new handedness selector
//   shipped in HastRekhaClient v2.1 (dominant hand required; labels
//   flip for left-handed users).
//
// CHANGE v1.3 (2026-07-14) — SEO / GEO / AEO / E-E-A-T REBUILD
//   1. 2,000+ word SSR content block below the tool — 27 keyword
//      types + Local (Delhi NCR / Noida / Gurgaon / Ghaziabad).
//   2. 40–60 word direct answer for AEO/GEO at the top of the block.
//   3. Links out to ALL 17 hub pages, grouped — this page is the
//      HEART of the hub, not its dead end (~170 links come in).
//   4. Visible E-E-A-T: Rohiit Gupta, 16 years, Parashara BPHS,
//      MSME reg, Dwarka address, classical sources, /founder link.
//   5. Anti-fear promise placed where the money decision is made.
//   6. "8 mounts" → "7 mounts" everywhere (CEO decision; Mangal =
//      one parvat with two zones). Dominant-hand FAQ fixed. Fake
//      "90%+ accuracy" removed.
//
//   SCHEMA (retained from v1.2): plain <script type="application/ld+json">
//   rendered from this SERVER component so it lands in the SSR HTML.
//   DO NOT convert back to next/script — strategy="beforeInteractive" is
//   ignored outside the root layout, the schema becomes JS-injected, and
//   AI crawlers (Perplexity, GPTBot) do not execute JS. Verified before
//   the fix: the raw HTML contained ZERO "@type" strings.
//   next/script is for executable JS. JSON-LD is data.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from 'next';
import Link from 'next/link';
import HastRekhaClient from './HastRekhaClient';

const ORG_ID = 'https://trikalvaani.com/#organization';
const PERSON_ID = 'https://trikalvaani.com/#rohiit-gupta';
const PAGE_URL = 'https://trikalvaani.com/hast-rekha-calculator';
const GOLD = '#D4AF37';

const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice/61576946646141/',
  'https://www.linkedin.com/company/trikaal-vaani/',
];

export const metadata: Metadata = {
  title: {
    absolute: 'AI Hast Rekha Calculator — Palm Reading ₹51',
  },
  description:
    'Upload one palm photo and get a reading from the classical text Hastasanjeevanam — past, present and future, home, job or business, studies, marriage and children yoga, the 7 planet seats, 3 BPHS remedies and a PDF, every point with its shloka. Add birth time for marriage timing. ₹51.',
  keywords: [
    // head + body
    'hast rekha', 'palmistry', 'hast rekha calculator', 'palm reading online',
    // long-tail + transactional
    'ai palm reading online india', 'palm reading by photo india', 'buy palm reading report india',
    'palm reading report pdf download', 'palm reading 51 rupees', 'hast rekha calculator online',
    // commercial
    'best ai palmistry app india', 'accurate online palm reading', 'trusted palm reader online',
    // informational
    'samudrika shastra online', 'hast rekha gyan hindi', 'jeevan rekha analysis', 'bhagya rekha meaning',
    // question / 5W1H
    'how to read palm lines', 'which hand to read in palmistry', 'what does my life line mean',
    'why do i have no fate line', 'who reads palms online in india',
    // vernacular / Hinglish
    'hath ki rekha', 'hatheli ki rekha kaise padhe', 'haath dekhna online', 'hast rekha vishleshan',
    'hatheli mein machli ka nishan', 'hatheli ke parvat',
    // entity / Jyotish
    'guru parvat', 'shukra parvat', 'chandra parvat', 'brihat samhita', 'hasta sanjeevani', 'ravan samhita',
    // problem / symptom
    'career not growing palm reading', 'no promotion palm reading', 'marriage delay palm reading',
    'why is my hard work not recognised',
    // comparative
    'ai palm reading vs palmist', 'palmistry vs kundali', 'hast rekha vs jyotish',
    // verification / skeptic
    'is palm reading accurate', 'is palmistry real', 'does palm reading work',
    // definition
    'what is samudrika shastra', 'what is hast rekha',
    // task / action
    'scan my palm', 'upload palm photo for reading', 'check my palm lines online',
    // list
    'types of palm lines', 'seven mounts of the palm', 'lucky signs on palm',
    // emotional / reassurance
    'palm reading without fear', 'honest palm reading', 'no gemstone upsell palm reading',
    // multi-constraint
    'ai palm reading in hindi from mobile photo without birth time',
    // voice
    'ok google read my palm', 'hey google what does my fate line mean',
    // seasonal
    'palm reading 2026', 'hast rekha 2026',
    // misspellings
    'hasth rekha', 'hast rekha calculater', 'palmestry online', 'samudrik shastra',
    // brand
    'trikaal vaani hast rekha', 'trikal vaani palm reading', 'rohiit gupta palmist',
    // price
    'palm reading price in india', 'hast rekha kitne rupaye', 'cheap palm reading online',
    // privacy
    'is my palm photo safe', 'palm reading data privacy',
    // persona
    'palm reading for women', 'palm reading for men', 'palm reading for students',
    // LOCAL (IR-0b)
    'palmist in delhi', 'palm reader near me', 'astrologer in dwarka delhi',
    'hast rekha expert noida', 'palmist gurgaon', 'palmist ghaziabad', 'palm reading delhi ncr',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'AI Hast Rekha Calculator — Samudrika Shastra Reading | Trikaal Vaani',
    description:
      'One palm photo. Past, present and future from the classical text Hastasanjeevanam, with the shloka behind every point, 3 remedies and a PDF. ₹51. No birth time.',
    url: PAGE_URL,
    type: 'website',
    images: [
      {
        url: 'https://trikalvaani.com/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Hast Rekha Calculator — Trikaal Vaani',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Hast Rekha Calculator | Trikaal Vaani',
    description: 'Upload a palm photo → a Hastasanjeevanam reading with shlokas, remedies and a PDF. ₹51. No birth time needed.',
    images: ['https://trikalvaani.com/og-default.jpg'],
  },
  robots: { index: true, follow: true },
};

// ── FAQ data (shared by JSON-LD + the visible accordion in the client) ──
const FAQS = [
  {
    q: 'Samudrika Shastra kya hota hai?',
    a: 'Samudrika Shastra bharat ki prachin vidya hai jisme haath ki rekhaon, parvaton, unglion aur haath ke aakar se vyakti ke swabhav aur pravritti ka vishleshan hota hai. Iska ullekh Brihat Samhita, Hasta Sanjeevani aur Ravan Samhita jaise shastriya granthon mein milta hai.',
  },
  {
    q: 'Hast Rekha Calculator kaun si rekhaen aur parvat analyze karta hai?',
    a: 'Trikaal Vaani ka engine granth Hastasanjeevanam ki chaar mukhya rekhaen padhta hai — Pitr (Gotra) Rekha, Matr (Dhan) Rekha, Aayu Rekha aur Urdhva Rekha (aajkal ki bhagya rekha) — aur granth ke shlok 1.5.9–10 ke anusaar haath ke 7 graha-sthaan batata hai. Saath mein ghar, naukri ya business, padhai, vivah-yog aur santaan-yog — har baat granth ke shlok ke saath.',
  },
  {
    q: 'AI palm reading kitni accurate hoti hai?',
    a: 'Hum koi nakli accuracy percentage ka daava nahi karte. Hamara engine aapki photo mein har rekha naapta hai — kahan se shuru, kis ungli tak, kahin tooti to nahi — aur us haalat ka phal granth Hastasanjeevanam ke shlok se deta hai, har baat ke saath shlok ka ank. Isliye aap report khud jaanch sakte hain. Din ki roshni wali photo se sabse gehri reading milti hai. Aur ek cheez engine insaan se behtar karta hai: wo aapka chehra dekh hi nahi sakta, isliye aapko khush karne ya darane ke liye reading badal nahi sakta.',
  },
  {
    q: 'Hast Rekha report mein kya milega?',
    a: 'Saar, phir beeta samay (Pitr rekha), abhi ka daur (Dhan rekha), aage ka kaam aur bhagya (Urdhva rekha), budhapa (Aayu rekha), haath ke 7 graha-sthaan, aapka sahayak graha aur uske 3 upay (BPHS 85) — har baat ke saath granth ka shlok aur ank. Saath mein "aapke jeevan ke sawaal": apna ghar (3.6.47), naukri ya business (3.5.8–10), padhai (3.2.9, 3.5.9), vivah-yog (3.6.19–20) aur santaan-yog (3.6.4). Janm tithi dein to aane wale shubh varsh (1.8.11–16); janm samay aur sthaan bhi dein to shaadi kab — aapki Kundali se. Downloadable PDF, Hindi, Hinglish ya English mein. Koi score nahi, koi umr nahi.',
  },
  {
    q: 'Kaun sa haath upload karein — seedha ya ulta?',
    a: 'Granth Hastasanjeevanam (3.1.6) ka niyam: purush ka DAAYA (right) aur stri ka BAAYA (left) haath mukhya hai — report usi se padhi jaati hai. Form mein dono haath ke liye alag jagah hai; mukhya haath zaroor bhejein, dono bhejein to aur behtar. Mukhya haath ki photo na mile to report doosre haath se banti hai.',
  },
  {
    q: 'Kya meri palm image save hoti hai?',
    a: 'Aapki photo analysis ke liye hamare apne server par jaati hai aur wahan save nahi hoti — sirf aapki report aur PDF save hoti hai. Ek hi apvaad, aur woh aapki marzi se: form mein ek checkbox hai (pehle se khaali) — aap use chunein tabhi photo, bina naam-number ke, hamare engine ko behtar banane ke liye rakhi jaati hai. Server vyast hone par report dobara banane ke liye photo kuch der surakshit rakhi jaati hai aur report bante hi delete hoti hai. Photo bechna ya share karna — kabhi nahi.',
  },
  {
    q: 'Kya aap bata sakte hain ki meri shaadi kab hogi, ya main kitne saal jiyunga?',
    a: 'Hatheli se — nahi, aur koi imaandaar reader bhi nahi bata sakta. Hatheli par koi tareekh nahi likhi hoti, aur granth Hastasanjeevanam mein vivah ke samay ka koi shlok nahi hai. Isliye hum haath se saal nahi gadhte. Timing ka sahi auzaar Kundali hai — form mein janm tithi, samay aur sthaan dein to ₹51 ki report mein shaadi ka anukool samay aapki janm-kundali (7va bhaav, Shukra-Guru, Vimshottari dasha) se judta hai, aur saaf likha hota hai ki yeh Kundali se hai, haath se nahi. Aur kitne saal jiyenge — yeh hum kabhi nahi batate. Chhoti Jeevan Rekha ka matlab chhoti umr bilkul nahi hota — ye jhooth bharat mein sabse zyada bikta hai aur sabse zyada darr failata hai.',
  },
  {
    q: 'हाथ की रेखा कैसे देखें — शुरुआत कहाँ से करें?',
    a: 'Kram yeh hai: prakritik roshni mein baithiye, dono hatheliyan kholiye halke mod ke saath. Pehle nishkriya haath dekhiye (jisse aap nahi likhte) — yeh janmajaat pravritti hai. Phir sakriya haath, aur DONO KE ANTAR ko notice kijiye — asli reading wahi hai. Uske baad chhe mukhya rekhaayein pehchaniye, phir haath mod kar saat parvaton ka ubhaar dekhiye. Sabse zaroori: rekha aur parvat SAATH padhiye, akele nahi.',
  },
  {
    q: 'एआई हस्तरेखा कैसे काम करती है?',
    a: 'Hamara engine hamare apne server par chalta hai — koi bahari chatbot nahi. Woh photo mein chaar mukhya rekhaen pehchanta hai, naapta hai ki har rekha kahan se shuru hokar kis ungli tak jaati hai aur kahin tootti to nahi — phir granth Hastasanjeevanam mein usi haalat ka shlok dhoondhkar report banata hai. Ek hi photo par hamesha ek hi report. Aur woh aapka chehra dekh hi nahi sakta, isliye aapko khush karne ya darane ke liye reading badal nahi sakta.',
  },
  {
    q: 'क्या हस्त रेखा PDF मुफ्त में मिलेगी?',
    a: 'Haan. "Sampoorna Hast Rekha Gyan" paanch panno ki poori margdarshika bilkul muft hai — na email, na signup, na shulk. Isme do chitra hain (chhe rekhaayein aur saat parvat, hindi mein labelled), har rekha ka imaandar arth, chihnon ki talika, haath padhne ki chhe-charan vidhi, aur woh soochi jo hast rekha NAHI bata sakti. Is page par diye gaye button se seedha download kar lijiye.',
  },
  {
    q: 'भाग्यशाली हस्त रेखा कौन सी होती है?',
    a: 'Koi ek "bhagyashali rekha" hoti hi nahi — shubhta rekha aur parvat ke MEL se banti hai. Parampara mein jo sanyojan shubh maane jaate hain: spasht bhagya rekha ke saath ubhra Shani parvat, mazboot Surya rekha ke saath ubhra Surya parvat, gehri jeevan rekha ke saath bhara Shukra parvat, aur chaturbhuj ka chihn (jo raksha-chihn mana jaata hai). Sabse badi galatfehmi machli ka nishan hai — jise log machli samajhte hain woh aksar dweep hota hai, aur uska arth lagbhag ulta hai.',
  },
  {
    q: 'गरीबी हस्त रेखा जैसी कोई रेखा होती है?',
    a: 'Nahi. Hatheli par "garibi rekha" naam ki koi rekha na shastra mein hai na vyavhaar mein — yeh shabd internet par bana hai aur lagbhag hamesha koi upay, ratna ya puja bechne se theek pehle istemal hota hai. Jo cheezein aarthik asthirta se jodi jaati hain wo rekhaayein nahi, sthitiyan hain, aur koi bhi garibi ki bhavishyavani nahi hai. Aur bhagya rekha ka na hona garibi ka chihn nahi — yeh aksar swanirmit vyakti ka chihn hota hai.',
  },
  {
    q: 'Kya hast rekha se pata chalta hai ki kitni shaadi hogi aur kitne bachche honge?',
    a: 'Granth Hastasanjeevanam ke niyam hain: Left haath mein aayu rekha aur kanishtha ke beech, kinaare se aati aadi rekhaayein jeevansaathi ka yog batati hain (3.6.19–20), aur angoothe ki jad se kalai ki or jaati rekhaayein santaan ka yog (3.6.4). Report aapke haath mein vivah-yog aur santaan-yog granth ke shlok ke saath batati hai. Santaan par sirf paramparik granth-vachan hai — garbh mein shishu ka ling batana nahi; PC-PNDT Act 1994 ke tahat yeh aparaadh hai aur Trikaal Vaani aisa kabhi nahi karta.',
  },
  {
    q: 'Kya report mein apna ghar, naukri ya business aur padhai bhi hai?',
    a: 'Haan, granth ke shlok ke saath. Apna ghar: Left haath mein pitr aur matr rekha shuru mein judi hon to granth (3.6.47, 1.4.13) grihabandh — apna ghar — kehta hai; engine yeh milan photo mein naapta hai. Naukri ya business: urdhva rekha jis ungli tak jaaye — tarjani = adhikaar wali naukri, madhyama = aacharya/visheshagya, anamika = business (3.5.8–10). Padhai: lambi anamika ko granth vidya-bhogi kehta hai (3.2.9), aur madhyama tak jaati urdhva rekha aacharya-yog (3.5.9).',
  },
  {
    q: 'Hast rekha se apna ghar banega ya nahi, kaise pata chalta hai?',
    a: 'Granth Hastasanjeevanam ke anusaar ghar-zameen Left haath se dekhe jaate hain (1.4.13). Left haath mein Pitr rekha aur Matr (Dhan) rekha shuru mein aapas mein judi hon to granth ise grihabandh — apna ghar — kehta hai (3.6.47). Trikaal Vaani ka engine yeh milan aapki photo mein naapta hai aur ₹51 ki report mein shlok ke saath batata hai.',
  },
  {
    q: 'Hast rekha se naukri ya business kaise dekhein?',
    a: 'Kalai se ungliyon ki or jaane wali Urdhva rekha (bhagya rekha) jis ungli tak pahunche, wahi raasta batati hai: tarjani tak — adhikaar wali naukri, madhyama tak — aacharya, visheshagya ya salaahkaar, anamika tak — business, granth ka "saarthvaah" (3.5.8–3.5.10). Kalai se uthi rekha raaj-aashray — badi sanstha ke saath unnati — deti hai.',
  },
  {
    q: 'Aane wale shubh varsh hast rekha se kaise nikalte hain?',
    a: 'Granth (1.8.11–1.8.16) ke anusaar paanchon ungliyon ke 15 parva jeevan ke ek-ek varsh batate hain; jis parva par upar jaati rekha ho, woh varsh shubh — Lakshmi, parivaar mein vriddhi, yash aur sukh. Form mein janm tithi dein to report aapke agle shubh varsh mahine-saal ke saath batati hai.',
  },
  {
    q: 'Photo thodi dhundhli ho to kya report banegi?',
    a: 'Haan. Hamara camera rehnumaai karta hai — roshni, sthirta aur focus teeno hare hote hi photo apne aap — aur engine har photo se poori report banata hai. Jahan photo se padha gaya nateeja anumaanit ho, us hisse ke aage "sanket" likha hota hai, taaki aapko pata rahe kaun si baat pakki naap hai.',
  },
  {
    q: 'Report banne mein kitna samay lagta hai?',
    a: 'Lagbhag ek minute. Engine 8 kadam mein kaam karta hai — hatheli ke 21 bindu, chaar mukhya rekhaayein, ungliyon ke 15 parva, ghar-vivah-santaan ki rekhaayein, granth ke shlok, janm samay diya ho to Kundali se vivah ka samay, aapka sahayak graha aur upay, aur PDF. Report aur PDF hamesha aapke paas rehte hain.',
  },
  {
    q: 'Report ke baad koi puja, ratna ya doosri sitting bechoge?',
    a: 'Nahi. ₹51 ke baad kuch nahi hai — na puja, na ratna, na dhaaga, na follow-up sitting. Jis mandi mein darr dikha kar upay becha jaata hai, usi ki wajah se ye platform bana. Aur ratna kabhi hatheli ke nishan se nahi pehne jaate — wo Kundali se tay hote hain.',
  },
];

// ── Hub interlinking: this page is the HEART of the Hast Rekha hub ──
type HubItem = { href: string; label: string; note: string };

const HUB_LINES: HubItem[] = [
  { href: '/blog/life-line-jeevan-rekha-meaning', label: 'Jeevan Rekha — Life Line', note: 'It is not your lifespan' },
  { href: '/blog/fate-line-bhagya-rekha-meaning', label: 'Bhagya Rekha — Fate Line', note: 'No fate line = self-made' },
  { href: '/blog/heart-line-hriday-rekha-meaning', label: 'Hriday Rekha — Heart Line', note: 'How you attach' },
  { href: '/blog/head-line-mastishk-rekha-meaning', label: 'Mastishk Rekha — Head Line', note: 'Why your job may not fit' },
  { href: '/blog/marriage-line-vivah-rekha-meaning', label: 'Vivah Rekha — Marriage Line', note: 'Two lines ≠ two marriages' },
  { href: '/blog/sun-line-surya-rekha-meaning', label: 'Surya Rekha — Sun Line', note: 'The invisible workhorse' },
];

const HUB_SIGNS: HubItem[] = [
  { href: '/blog/fish-sign-machli-on-palm-meaning', label: 'Machli — Fish Sign', note: 'Most people have an island' },
  { href: '/blog/m-sign-on-palm-meaning', label: 'The M Sign', note: 'It is not rare' },
  { href: '/blog/trishul-sign-on-palm-meaning', label: 'Trishul Sign', note: 'An amplifier, not a promise' },
  { href: '/blog/star-triangle-square-on-palm-meaning', label: 'Star, Triangle, Square', note: 'A square forms over damage' },
  { href: '/blog/island-cross-grille-on-palm-meaning', label: 'Island, Cross, Grille', note: 'The marks you are sold fear about' },
  { href: '/blog/rare-auspicious-signs-on-palm', label: 'Swastik, Shankh, Chakra', note: 'The rarity paradox' },
];

const HUB_STRUCTURE: HubItem[] = [
  { href: '/blog/hast-rekha-gyan-samudrika-shastra-guide', label: 'The Complete Hast Rekha Guide', note: 'Start here — the pillar' },
  { href: '/blog/mounts-on-palm-parvat-meaning', label: 'The Seven Mounts (Parvat)', note: 'Lines are verbs, mounts are nouns' },
  { href: '/blog/which-hand-to-read-palmistry-hand-shapes', label: 'Which Hand? Hand Shapes', note: 'The reading is the difference' },
  { href: '/blog/is-palm-reading-accurate-ai-palmistry', label: 'Is Palm Reading Accurate?', note: 'The honest answer' },
  { href: '/blog/ai-palm-reading-online-hast-rekha', label: 'How the AI Reads a Palm', note: 'What the machine actually sees' },
];

// ── Hindi hub (v2.0) ───────────────────────────────────────────────
// The 18 Hindi palmistry articles. Every one of these already existed in
// Supabase and ranked on its own; NOT ONE was linked from this page before
// v2.0, which is why Radar found three Hindi palmistry keywords stuck at
// 17-19 while the English side of the same hub does fine. The Hindi content
// was never weak — it was orphaned from the money page.
const HUB_HINDI_LINES: HubItem[] = [
  { href: '/blog/jeevan-rekha-life-line-matlab', label: 'जीवन रेखा', note: 'यह आपकी उम्र नहीं बताती' },
  { href: '/blog/bhagya-rekha-fate-line-matlab', label: 'भाग्य रेखा', note: 'न होना भाग्यहीन होना नहीं' },
  { href: '/blog/hriday-rekha-heart-line-matlab', label: 'हृदय रेखा', note: 'आप जुड़ते कैसे हैं' },
  { href: '/blog/mastishk-rekha-head-line-matlab', label: 'मस्तिष्क रेखा', note: 'कितने नहीं, किस तरह के बुद्धिमान' },
  { href: '/blog/vivah-rekha-marriage-line-matlab', label: 'विवाह रेखा', note: 'दो रेखाएँ दो शादियाँ नहीं' },
  { href: '/blog/surya-rekha-sun-line-matlab', label: 'सूर्य रेखा', note: 'प्रतिभा नहीं, पहचान' },
];

const HUB_HINDI_SIGNS: HubItem[] = [
  { href: '/blog/hatheli-mein-machli-fish-sign-matlab', label: 'हथेली में मछली', note: 'ज़्यादातर वह द्वीप होता है' },
  { href: '/blog/hatheli-mein-m-nishan-matlab', label: 'हथेली में M का निशान', note: 'यह दुर्लभ नहीं है' },
  { href: '/blog/hatheli-mein-trishul-matlab', label: 'हथेली में त्रिशूल', note: 'वादा नहीं, प्रवर्धक' },
  { href: '/blog/tara-tribhuj-chaturbhuj-palm-matlab', label: 'तारा, त्रिभुज, चतुर्भुज', note: 'चतुर्भुज क्षति के ऊपर बनता है' },
  { href: '/blog/dweep-cross-grille-palm-matlab', label: 'द्वीप, क्रॉस, जाल', note: 'जिनसे आपको डराया जाता है' },
  { href: '/blog/hatheli-ke-durlabh-shubh-chihn-matlab', label: 'स्वस्तिक, शंख, चक्र', note: 'दुर्लभता का विरोधाभास' },
];

const HUB_HINDI_STRUCTURE: HubItem[] = [
  { href: '/blog/hast-rekha-gyan-samudrik-shastra-margdarshika', label: 'संपूर्ण हस्त रेखा ज्ञान', note: 'यहाँ से शुरू करें — पिलर' },
  { href: '/blog/hatheli-ke-saat-parvat-matlab', label: 'हथेली के सात पर्वत', note: 'पर्वत तय करते हैं रेखाएँ क्या कर सकती हैं' },
  { href: '/blog/kaun-sa-haath-dekhein-palmistry', label: 'कौन सा हाथ देखें?', note: 'असली रीडिंग अंतर में है' },
  { href: '/blog/kya-hast-rekha-sach-hai', label: 'क्या हस्त रेखा सच होती है?', note: 'ईमानदार जवाब' },
  { href: '/blog/ai-hast-rekha-reading-online', label: 'AI हस्त रेखा रीडिंग ऑनलाइन', note: 'मशीन असल में क्या देखती है' },
  { href: '/blog/hast-rekha-near-me-online-hindi', label: 'हस्त रेखा मेरे पास', note: 'ऑनलाइन पाल्मिस्ट्री' },
];

// ── v2.0 Hindi content sections ────────────────────────────────────
// Each h2 is a keyword Google itself surfaced — six from the Radar E3
// content brief and three from Radar Part 5 (ranks 17, 18, 19). All nine
// are Hindi or Hinglish, which is precisely why an English-only page could
// not reach them however good the English was.
type HiSection = { id: string; h2: string; paras: string[] };

const HINDI_SECTIONS: HiSection[] = [
  {
    id: 'hath-ki-rekha-kaise-dekhe',
    h2: 'हाथ की रेखा कैसे देखें — चरण दर चरण',
    paras: [
      'हाथ पढ़ना सीखने के लिए किसी गुरु की जरूरत नहीं — क्रम की जरूरत है। यही क्रम गलत होने से ज्यादातर लोग गलत नतीजे पर पहुँचते हैं।',
      '**पहला कदम:** प्राकृतिक रोशनी में बैठिए, दोनों हथेलियाँ खोलिए, हल्का सा मोड़ रखिए — पूरी तरह तानिए मत, वरना छोटी रेखाएँ खिंचकर गायब हो जाती हैं। **दूसरा:** पहले अपना **निष्क्रिय हाथ** देखिए (जिससे आप नहीं लिखते) — यह जन्मजात प्रवृत्ति दिखाता है। **तीसरा:** अब **सक्रिय हाथ** देखिए और अंतर नोट कीजिए; [असली रीडिंग दोनों के अंतर में है](/blog/kaun-sa-haath-dekhein-palmistry), किसी एक हाथ में नहीं।',
      '**चौथा:** छह मुख्य रेखाएँ पहचानिए — [जीवन](/blog/jeevan-rekha-life-line-matlab), [मस्तिष्क](/blog/mastishk-rekha-head-line-matlab), [हृदय](/blog/hriday-rekha-heart-line-matlab), [भाग्य](/blog/bhagya-rekha-fate-line-matlab), [सूर्य](/blog/surya-rekha-sun-line-matlab) और [विवाह रेखा](/blog/vivah-rekha-marriage-line-matlab)। **पाँचवाँ:** हाथ मोड़कर [सात पर्वतों](/blog/hatheli-ke-saat-parvat-matlab) के उभार देखिए। **छठा, और सबसे जरूरी:** रेखा और पर्वत **साथ** पढ़िए — अकेली रेखा अधूरी जानकारी है।',
    ],
  },
  {
    id: 'online-check-tarika',
    h2: 'हाथ की रेखा ऑनलाइन चेक करने का तरीका',
    paras: [
      'ऑनलाइन जाँचने के लिए बस एक चीज चाहिए — **हथेली की एक साफ फोटो**। न जन्म तिथि, न जन्म समय, न कुंडली। ऊपर वाला कैलकुलेटर उसी फोटो से रेखाएँ, पर्वत और चिह्न पहचानकर समुद्रिक शास्त्र के नियम लगाता है।',
      'फोटो के चार नियम, और ये सचमुच फर्क डालते हैं: **प्राकृतिक रोशनी** में लीजिए, खिड़की के पास — फ्लैश कभी नहीं, वह रेखाएँ धो देता है। **हथेली सीधे कैमरे के सामने**, तिरछी नहीं; फ्रेम में कलाई से उँगलियों के सिरे तक। **हल्का मोड़** रखिए। और हाथ **साफ व सूखा** हो — क्रीम या पसीना चमक बनाकर रेखाएँ छिपा देता है।',
      'हमारा कैमरा खुद बताता है कि रोशनी ठीक है, हाथ स्थिर है और फोटो साफ़ है — सब हरा होते ही फोटो अपने आप। फिर इंजन हर रेखा नापकर ग्रंथ के श्लोक से मिलाता है। मशीन असल में क्या देखती है, यह [AI हस्त रेखा रीडिंग](/blog/ai-hast-rekha-reading-online) में विस्तार से है।',
    ],
  },
  {
    id: 'ai-hast-rekha',
    h2: 'एआई हस्तरेखा — मशीन असल में क्या देखती है',
    paras: [
      '**AI हस्त रेखा** का मतलब जादू नहीं है, और न ही यह कोई भविष्यवाणी करने वाली मशीन है। इंजन वही करता है जो एक अनुभवी पाठक आँख से करता है, पर बिना थके और बिना पक्षपात के: हथेली की तस्वीर में **रेखाओं की दिशा, गहराई, लंबाई, टूट और शाखाएँ** पहचानता है, **पर्वतों का उभार** आँकता है, **चिह्नों** का स्थान तय करता है — और फिर उन पर समुद्रिक शास्त्र के शास्त्रीय नियम लगाता है।',
      'जहाँ मशीन सचमुच बेहतर है, वह एक ही चीज है और वह महत्वपूर्ण है: **वह आपका चेहरा नहीं देख सकती।** आमने-सामने बैठा पाठक आपकी प्रतिक्रिया पढ़कर, अनजाने में भी, रीडिंग नरम या डरावनी कर देता है। इंजन ऐसा नहीं कर सकता — उसके पास खुश करने या डराने की कोई वजह नहीं है।',
      'और जहाँ मनुष्य बेहतर है, वह भी साफ कहना चाहिए: **संदर्भ।** मशीन नहीं जानती कि आप अभी किस दौर से गुजर रहे हैं, आपका सवाल क्या है, या कौन सी बात आपके लिए मायने रखती है। इसीलिए हर रिपोर्ट रोहित गुप्ता की देखरेख के नियमों पर बनती है, और इसीलिए हम कोई **accuracy प्रतिशत का दावा नहीं करते** — जो कोई करे, वह सच नहीं बोल रहा।',
    ],
  },
  {
    id: 'ai-se-kaise-dekhe',
    h2: 'AI से हाथ की रेखा कैसे देखें — तीन कदम',
    paras: [
      'पूरी प्रक्रिया तीन कदम की है और दो मिनट से कम लेती है। **एक:** ऊपर Right या Left हाथ के डिब्बे पर टैप कीजिए — कैमरा खुलेगा और बताएगा कि रोशनी ठीक है और हाथ स्थिर है; सब हरा होते ही फोटो अपने आप। ग्रंथ (३.१.६) के अनुसार पुरुष का दायाँ, स्त्री का बायाँ हाथ मुख्य है। **दो:** हमारा इंजन 1-2 सेकंड में बता देता है कि फोटो ठीक है या नहीं। **तीन:** रिपोर्ट कुछ सेकंड में बन जाती है और PDF के रूप में आपके पास रहती है।',
      'रिपोर्ट में क्या मिलता है: **बीता समय, अभी का दौर, आगे का भाग्य और बुढ़ापा** — चार मुख्य रेखाओं (पितृ, मातृ/धन, ऊर्ध्व, आयु) से, **हाथ के ७ ग्रह-स्थान**, आपका सहायक ग्रह और उसके **३ उपाय** — और हर बात के साथ ग्रंथ **हस्तसंजीवनम्** का श्लोक। हिंदी, अंग्रेज़ी या हिंग्लिश में, जो आप चुनें।',
      'फोटो का क्या होता है, यह भी साफ जान लीजिए: **तस्वीर विश्लेषण के लिए हमारे अपने सर्वर पर जाती है, पर सेव नहीं होती** — केवल आपकी रिपोर्ट सेव होती है ताकि आप उसे दोबारा पा सकें। फोटो केवल तब रखी जाती है जब आप फॉर्म में खुद "हाँ" चुनें (इंजन बेहतर बनाने के लिए, बिना नाम-नंबर के)। न बेची जाती है, न साझा।',
    ],
  },
  {
    id: 'hastrekha-online-dekhen',
    h2: 'हस्तरेखा ऑनलाइन देखें — बिना जन्म कुंडली के',
    paras: [
      'हस्त रेखा की सबसे बड़ी व्यावहारिक खूबी यही है: **इसके लिए जन्म समय नहीं चाहिए।** भारत में बहुत बड़ी संख्या में लोगों को अपना सटीक जन्म समय पता ही नहीं है, और उसके बिना कुंडली आधारित लगभग हर विश्लेषण अनुमान बन जाता है — लग्न ही तय नहीं हो पाता। हथेली उस बाधा को पूरी तरह हटा देती है।',
      'ऑनलाइन देखने का यह भी अर्थ है कि **आपको किसी के सामने बैठकर यह तय नहीं कराना पड़ता कि आप कितना खर्च कर सकते हैं।** रीडिंग वही शास्त्रीय समुद्रिक है, चाहे आप द्वारका में हों, नोएडा सेक्टर 62 में, गुड़गांव, गाजियाबाद, मुंबई, बेंगलुरु या दुबई में। एक फोटो, ₹51, और एक रिपोर्ट जो आपके पास रहती है।',
      'पर एक सीमा भी उतनी ही साफ है: **समय की गणना हथेली से नहीं होती।** विवाह कब, नौकरी कब, परीक्षा का परिणाम क्या — इनके लिए [कुंडली और दशा](/calculators/free-dasha-calculator) चाहिए, और उसके लिए जन्म समय चाहिए। हथेली प्रवृत्ति बताती है, कैलेंडर नहीं। दोनों अलग औज़ार हैं और दोनों की अपनी जगह है।',
    ],
  },
  {
    id: 'pdf-guide',
    h2: 'हाथ की रेखा देखने का तरीका PDF — संपूर्ण हस्त रेखा ज्ञान मुफ्त डाउनलोड',
    paras: [
      'हमने पूरी **संपूर्ण हस्त रेखा ज्ञान** मार्गदर्शिका एक PDF में रख दी है — मुफ्त, बिना ईमेल माँगे, बिना साइनअप। इसमें दो चित्र हैं (छह रेखाएँ और सात पर्वत, हिंदी में लेबल किए हुए), हर रेखा का ईमानदार अर्थ, चिह्नों की तालिका जिसमें "प्रचलित डर" और "ईमानदार अर्थ" अलग-अलग कॉलम में हैं, हाथ पढ़ने की छह-चरण विधि, और वह सूची जो हस्त रेखा **नहीं** बता सकती।',
      '**यह PDF क्यों बनाई गई:** इंटरनेट पर "हस्त रेखा PDF" खोजने पर जो मिलता है वह ज्यादातर बीस साल पुरानी स्कैन की हुई किताबें हैं, जिनमें आधी बातें डर बेचने वाली हैं और कोई नहीं बताता कि हथेली क्या नहीं बता सकती। यह मार्गदर्शिका वही अंतर भरती है — और यह **निःशुल्क है, साझा की जा सकती है, बेचने के लिए नहीं।**',
      'पूरा हस्त रेखा ज्ञान लेख के रूप में पढ़ना हो तो [संपूर्ण हस्त रेखा ज्ञान — समुद्रिक शास्त्र की मार्गदर्शिका](/blog/hast-rekha-gyan-samudrik-shastra-margdarshika) पर है, और अंग्रेज़ी में [The Complete Hast Rekha Guide](/blog/hast-rekha-gyan-samudrika-shastra-guide) पर।',
    ],
  },
  {
    id: 'bhagyashali-rekha',
    h2: 'भाग्यशाली हस्त रेखा — कौन सी रेखा शुभ मानी जाती है',
    paras: [
      'पहले वह बात जो इस सवाल का असली जवाब है: **कोई एक "भाग्यशाली रेखा" नहीं होती।** शुभता किसी एक रेखा के होने से नहीं, बल्कि **रेखा और पर्वत के मेल** से बनती है — और यही वजह है कि दो लोगों की एक जैसी दिखने वाली रेखा का अर्थ अलग हो सकता है।',
      'फिर भी परंपरा में जिन संयोजनों को शुभ माना जाता है वे ये हैं: **स्पष्ट और अटूट भाग्य रेखा** के साथ उभरा हुआ शनि पर्वत — दिशा जल्दी तय होना; **मजबूत सूर्य रेखा** के साथ उभरा सूर्य पर्वत — काम को पहचान मिलना; **गहरी जीवन रेखा** के साथ भरा हुआ शुक्र पर्वत — स्थिर ऊर्जा और सहनशक्ति; और [चतुर्भुज या त्रिभुज का चिह्न](/blog/tara-tribhuj-chaturbhuj-palm-matlab), जिनमें चतुर्भुज विशेष रूप से रक्षा-चिह्न माना जाता है।',
      'और सबसे बड़ी गलतफहमी: **मछली का निशान।** यह सबसे ज्यादा खोजा जाने वाला "शुभ चिह्न" है, पर व्यवहार में जिसे लोग मछली समझते हैं वह अक्सर **द्वीप** होता है — और उसका अर्थ लगभग उल्टा है। फर्क कैसे पहचानें, यह [हथेली में मछली का निशान](/blog/hatheli-mein-machli-fish-sign-matlab) में साफ किया गया है।',
    ],
  },
  {
    id: 'garibi-rekha',
    h2: 'गरीबी हस्त रेखा — कौन सी रेखा बुरा संकेत मानी जाती है',
    paras: [
      'यह सवाल बहुत खोजा जाता है, और इसका ईमानदार जवाब असहज करने वाला है: **हथेली पर "गरीबी रेखा" नाम की कोई रेखा नहीं होती।** न शास्त्र में, न व्यवहार में। यह शब्द इंटरनेट पर बना है और लगभग हमेशा किसी उपाय, रत्न या पूजा बेचने से ठीक पहले इस्तेमाल होता है।',
      'जो चीजें परंपरा में **आर्थिक अस्थिरता** से जोड़ी जाती हैं वे रेखाएँ नहीं, स्थितियाँ हैं: **भाग्य रेखा का बार-बार टूटना** — करियर में बदलाव और आय की अनियमितता; **सपाट शुक्र और बुध पर्वत** — ऊर्जा और व्यापार-बुद्धि दोनों कमजोर; और [जाल (grille) का चिह्न](/blog/dweep-cross-grille-palm-matlab) जब वह धन से जुड़े पर्वत पर हो। पर ध्यान दीजिए — **इनमें से कोई भी गरीबी की भविष्यवाणी नहीं है।** ये प्रवृत्ति के संकेत हैं, नतीजे के नहीं।',
      'और वह बात जो इस पूरे डर को खत्म कर देती है: **भाग्य रेखा का न होना गरीबी का चिह्न नहीं है** — यह अक्सर **स्वनिर्मित व्यक्ति** का चिह्न होता है, जिसे रास्ता बना-बनाया नहीं मिला। बहुत से अत्यंत सफल लोगों की भाग्य रेखा नहीं होती। पूरा तर्क [भाग्य रेखा का मतलब](/blog/bhagya-rekha-fate-line-matlab) में है, और यह सवाल कि यह सब सच भी है या नहीं, [क्या हस्त रेखा सच होती है?](/blog/kya-hast-rekha-sach-hai) में ईमानदारी से लिया गया है।',
    ],
  },

  // ═══ v3.0 (07 Sep 2026) — 42 SECTIONS. See the header note above. ═══

  // ── THE TOOL ITSELF ──────────────────────────────────────────────────────
  {
    id: 'photo-kaisi-ho',
    h2: 'हथेली की फ़ोटो कैसी होनी चाहिए — पूरा तरीक़ा',
    paras: [
      'पूरा विश्लेषण एक ही चीज़ पर टिका है — फ़ोटो की साफ़ी। रेखाएँ दिखेंगी नहीं तो पढ़ी भी नहीं जाएँगी।',
      '**रोशनी** — दिन की रोशनी सबसे अच्छी है, खिड़की के पास। सीधी धूप में मत खींचिए, उससे परछाईं पड़ती है और रेखाएँ गुम हो जाती हैं। रात में खींचनी हो तो सफ़ेद रोशनी के नीचे, फ़्लैश बंद करके।',
      '**कोण और दूरी** — हथेली पूरी खुली, उँगलियाँ थोड़ी फैली हुई, कैमरा सीधा ऊपर से। लगभग 20-25 सेंटीमीटर की दूरी ठीक रहती है। हाथ टेढ़ा हुआ तो रेखाओं की लंबाई ग़लत दिखेगी।',
      '**हथेली** — साफ़ और सूखी। क्रीम या तेल लगा हो तो चमक से रेखाएँ छिप जाती हैं। और फ़ोटो खींचने से पहले हाथ को एक पल आराम दीजिए — कसी हुई हथेली में रेखाएँ दब जाती हैं।',
    ],
  },
  {
    id: 'kaunsa-haath',
    h2: 'कौन से हाथ की फ़ोटो भेजें',
    paras: [
      'सीधा नियम — **पुरुष का दायाँ, स्त्री का बायाँ**, यही परंपरा में मुख्य हाथ माना गया है।',
      'शास्त्रीय आधार ग्रंथ हस्तसंजीवनम् का श्लोक है — *वामभागे तु नारीणां दक्षिणे पुरुषस्य च* (३.१.६): स्त्री का बायाँ, पुरुष का दायाँ। हमारी रिपोर्ट इसी नियम से मुख्य हाथ चुनती है।',
      'दोनों हाथ भेज सकते हैं तो और अच्छा — तुलना से यह पता चलता है कि जन्म की स्थिति और आज की स्थिति में कितना फ़र्क़ आया है।',
      'यह विषय पूरा [कौन सा हाथ देखें](/blog/kaun-sa-haath-dekhein-palmistry) और [Which hand to read](/blog/which-hand-to-read-palmistry-hand-shapes) में खोला गया है।',
    ],
  },
  {
    id: 'photo-saaf-nahi',
    h2: 'फ़ोटो साफ़ नहीं आ रही — तब क्या करें',
    paras: [
      'यह आम दिक़्क़त है और इसके तीन कारण होते हैं।',
      '**एक — रोशनी पीछे से आ रही है।** खिड़की की तरफ़ पीठ करके खींचने से हथेली अँधेरी आती है। खिड़की की तरफ़ मुँह कीजिए।',
      '**दो — कैमरा फ़ोकस नहीं कर पा रहा।** बहुत पास ले जाने पर ऐसा होता है। थोड़ा पीछे हटिए और हथेली पर एक बार टैप करके फ़ोकस लॉक कीजिए।',
      '**तीन — रेखाएँ सच में हल्की हैं।** कुछ लोगों की रेखाएँ स्वाभाविक रूप से बारीक होती हैं। ऐसे में हाथ को एक-दो बार मुट्ठी बनाकर खोलिए — रेखाएँ कुछ देर के लिए उभर आती हैं।',
    ],
  },
  {
    id: 'mehndi-chot',
    h2: 'मेहँदी, चोट या घिसी हुई हथेली — क्या पढ़ी जा सकती है',
    paras: [
      'ये तीनों स्थितियाँ आती हैं और तीनों का उत्तर अलग है।',
      '**मेहँदी** — गहरी मेहँदी में मुख्य रेखाएँ प्रायः फिर भी दिखती हैं, पर बारीक चिह्न — द्वीप, क्रॉस, तारा — छिप जाते हैं। हो सके तो मेहँदी उतरने के बाद भेजिए, वरना विश्लेषण मुख्य रेखाओं तक सीमित रहेगा।',
      '**चोट या निशान** — कटने या जलने का निशान रेखा नहीं है और उसे रेखा नहीं माना जाता। पर वह किसी रेखा को ढक सकता है, और तब उस हिस्से पर कुछ नहीं कहा जाएगा।',
      '**काम से घिसी हथेली** — खेती, मज़दूरी या मशीन का काम करने वालों की हथेली सख़्त होती है और रेखाएँ दबी हुई। शास्त्र में यह कमज़ोरी नहीं मानी जाती। ऐसे में हाथ को थोड़ा आराम देकर, धोकर और थोड़ी नमी के साथ फ़ोटो लीजिए।',
    ],
  },
  {
    id: 'photo-ka-kya-hota',
    h2: 'आपकी फ़ोटो का क्या होता है',
    paras: [
      'यह प्रश्न कम पूछा जाता है और पूछा जाना चाहिए, क्योंकि हथेली की फ़ोटो निजी चीज़ है।',
      'फ़ोटो केवल विश्लेषण बनाने के लिए ली जाती है और सेव नहीं होती — सेव होती है आपकी रिपोर्ट, ताकि आप उसे दोबारा खोल सकें। फोटो तभी रखी जाती है जब आप फॉर्म में खुद "हाँ" चुनें (पहले से खाली रहता है)।',
      '**यह कहीं सार्वजनिक नहीं होती, किसी को बेची नहीं जाती, और किसी विज्ञापन में उपयोग नहीं होती।**',
      'पूरा विवरण [Privacy Policy](/privacy) पर है। और एक व्यावहारिक सलाह — फ़ोटो में केवल हथेली रखिए, चेहरा या कोई और पहचान नहीं।',
    ],
  },
  {
    id: 'report-mein-kya',
    h2: 'रिपोर्ट में क्या-क्या आता है',
    paras: [
      '**सार** — सबसे ऊपर 150-200 शब्दों में आपके हाथ की मुख्य बातें, ग्रंथ के श्लोक के साथ।',
      '**बीता समय, अभी का दौर, आगे का भाग्य, बुढ़ापा** — ग्रंथ हस्तसंजीवनम् (३.३.६) कहता है कि पितृ रेखा बचपन, मातृ (धन) रेखा जवानी और आयु रेखा बुढ़ापा बताती है; ऊर्ध्व रेखा जिस उँगली तक पहुँचे उससे आगे के काम और पद का रास्ता (३.५.८–३.५.११)।',
      '**हाथ के ७ ग्रह-स्थान** (१.५.९–१०) और आपका **सहायक ग्रह**, उसके **३ उपाय** (बृहत् पाराशर होरा शास्त्र, अध्याय ८५) — मंत्र, दान और व्रत।',
      'एक **PDF रिपोर्ट** जो आप रख सकते हैं। कोई अंक नहीं, कोई उम्र या तारीख़ नहीं। फोटो साफ न हो तो **एक बार मुफ्त दोबारा-फोटो**। जन्म समय की कोई ज़रूरत नहीं।',
      '**आपके जीवन के सवाल** — अपना घर (३.६.४७), नौकरी या बिज़नेस (३.५.८–१०), पढ़ाई (३.२.९), विवाह-योग (३.६.१९–२०) और संतान-योग (३.६.४), हर एक ग्रंथ के श्लोक के साथ। जन्म तिथि दें तो **आने वाले शुभ वर्ष**; जन्म समय और स्थान भी दें तो **शादी कब** — आपकी कुंडली से (यह एक हिस्सा हाथ से नहीं, और रिपोर्ट में साफ लिखा होता है)।',
    ],
  },
  {
    id: 'jeevan-ke-sawaal',
    h2: 'हस्त रेखा से शादी, घर, संतान, नौकरी और पढ़ाई — ग्रंथ क्या कहता है',
    paras: [
      'हाथ दिखाते समय लोग रेखाओं के नाम नहीं पूछते — वे पूछते हैं: **अपना घर बनेगा? नौकरी या बिज़नेस? कितनी शादी, कितने बच्चे? पढ़ाई कैसी?** ग्रंथ हस्तसंजीवनम् इन सवालों के नियम देता है, और ₹51 की रिपोर्ट हर जवाब के साथ वही श्लोक लिखती है।',
      '**अपना घर** — बाएँ हाथ में पितृ और मातृ रेखा शुरू में जुड़ी हों तो ग्रंथ (३.६.४७) इसे **गृहबन्ध** कहता है; घर-ज़मीन बाएँ हाथ से देखे जाते हैं (१.४.१३)। **नौकरी या बिज़नेस** — ऊर्ध्व रेखा तर्जनी तक जाए तो अधिकार वाली नौकरी, मध्यमा तक तो आचार्य-विशेषज्ञ, अनामिका तक तो **सार्थवाह** — व्यापार (३.५.८–१०)। **पढ़ाई** — लंबी अनामिका वाला **विद्या-भोगी** (३.२.९)।',
      '**विवाह-योग और संतान-योग** — बाएँ हाथ में आयु रेखा और कनिष्ठा के बीच किनारे से आती आड़ी रेखाएँ जीवनसाथी का योग (३.६.१९–२०), और अँगूठे की जड़ से कलाई की ओर जाती रेखाएँ संतान का योग (३.६.४) — रिपोर्ट दोनों योग श्लोक के साथ बताती है। संतान पर सिर्फ़ पारंपरिक वचन है — **गर्भ में लिंग बताना नहीं**; PC-PNDT Act 1994 के तहत यह अपराध है।',
      '**शादी कब** — इसका श्लोक ग्रंथ में नहीं है, इसलिए हम हाथ से साल नहीं गढ़ते। जन्म तिथि, समय और स्थान दें तो यह हिस्सा आपकी **जन्म-कुंडली** (७वाँ भाव, शुक्र-गुरु, विंशोत्तरी दशा) से जुड़ता है — वही इंजन जो [शादी कब होगी](/calculators/free-shadi-kab-hogi-calculator) कैलकुलेटर में है, जिससे आप दोबारा जाँच सकते हैं। लव या अरेंज के लिए [Love or Arranged Marriage Calculator](/calculators/free-love-or-arranged-marriage-calculator)।',
    ],
  },
  {
    id: 'shaadi-kab-hast-rekha',
    h2: 'हस्त रेखा से शादी कब होगी — रिपोर्ट में कुंडली से समय',
    paras: [
      '**सीधा जवाब:** शादी का समय हथेली से नहीं, जन्म-कुंडली से निकलता है — ग्रंथ हस्तसंजीवनम् में विवाह के समय का श्लोक नहीं है। इसलिए ₹51 की हस्त रेखा रिपोर्ट में जन्म तिथि, समय और स्थान दें तो **शादी का अनुकूल समय और उम्र** आपकी कुंडली (७वाँ भाव, शुक्र-गुरु, विंशोत्तरी दशा) से जुड़ता है — हथेली के विवाह-योग के साथ, एक ही रिपोर्ट में।',
      'यह वही इंजन है जो हमारे मुफ्त [शादी कब होगी कैलकुलेटर](/calculators/free-shadi-kab-hogi-calculator) में चलता है। लव या अरेंज जानना हो तो [Love or Arranged Marriage Calculator](/calculators/free-love-or-arranged-marriage-calculator)। **[₹51 में हथेली + कुंडली की रिपोर्ट बनाएँ](#top)**।',
    ],
  },
  {
    id: 'apna-ghar-yog-hast-rekha',
    h2: 'हाथ में अपना घर का योग — गृहबंध रेखा',
    paras: [
      '**सीधा जवाब:** ग्रंथ हस्तसंजीवनम् कहता है कि घर-ज़मीन **बाएँ हाथ** से देखे जाते हैं (१.४.१३), और बाएँ हाथ में **पितृ रेखा और मातृ (धन) रेखा शुरू में जुड़ी हों** तो यह **गृहबंध** — अपने घर का योग है (३.६.४७)। यही मिलन जीवनसाथी और मित्रों से अच्छे संबंध भी बताता है।',
      'हमारा इंजन आपकी बाएँ हाथ की फोटो में यह मिलन नापता है और रिपोर्ट में श्लोक के साथ बताता है। घर खरीदने का सही समय कुंडली के चौथे भाव से — [Property Yog](/services/property-yog)। **[अपना गृह-योग देखें — ₹51](#top)**।',
    ],
  },
  {
    id: 'naukri-ya-business-hast-rekha',
    h2: 'हस्त रेखा से नौकरी या बिज़नेस — ऊर्ध्व रेखा किस उँगली तक',
    paras: [
      '**सीधा जवाब:** कलाई से ऊपर जाने वाली **ऊर्ध्व रेखा** (आजकल की भाग्य रेखा) जिस उँगली तक पहुँचे, वही रास्ता बताती है — **तर्जनी** तक: अधिकार वाली नौकरी, शासन-प्रशासन; **मध्यमा** तक: आचार्य, विशेषज्ञ, सलाहकार; **अनामिका** तक: **बिज़नेस** — ग्रंथ का "सार्थवाह"; **कनिष्ठा** तक: प्रतिष्ठा और यश (हस्तसंजीवनम् ३.५.८–३.५.१०)।',
      'कलाई से उठी रेखा **राज-आश्रय** देती है — बड़ी संस्था, सरकारी विभाग या बड़ी कंपनी के साथ उन्नति (३.५.८, ३.५.११)। सरकारी नौकरी की तैयारी है तो कुंडली से भी देखें — [IAS / UPSC Calculator](/calculators/free-ias-astrology-calculator)। **[अपना करियर-योग देखें — ₹51](#top)**।',
    ],
  },
  {
    id: 'vidya-yog-hast-rekha',
    h2: 'हस्त रेखा में विद्या योग — पढ़ाई कैसी रहेगी',
    paras: [
      '**सीधा जवाब:** ग्रंथ कहता है — *अनामिकायां दीर्घायां विद्याभोगी भवेन्नरः* (३.२.९): जिसकी **अनामिका लंबी** हो, वह **विद्या-भोगी** होता है — पढ़ाई और ज्ञान से सुख और कमाई। और ऊर्ध्व रेखा **मध्यमा** तक जाए तो ग्रंथ (३.५.९) **आचार्य-योग** कहता है — पढ़ाने, सिखाने या विशेषज्ञ बनने का योग।',
      'रिपोर्ट आपके हाथ में बना विद्या-योग श्लोक के साथ बताती है। विद्यार्थियों और माता-पिता के लिए — **[पढ़ाई का योग देखें — ₹51](#top)**।',
    ],
  },
  {
    id: 'santaan-yog-hast-rekha',
    h2: 'हस्त रेखा में संतान योग — ग्रंथ क्या कहता है',
    paras: [
      '**सीधा जवाब:** ग्रंथ हस्तसंजीवनम् के अनुसार **अँगूठे की जड़ से कलाई (मणिबंध) की ओर** जाती रेखाएँ संतान का योग बताती हैं (३.६.४); परंपरा में लंबी रेखा को पुत्र-योग और छोटी को कन्या-योग कहा गया है (३.६.५)। रिपोर्ट यह योग श्लोक के साथ बताती है।',
      'यह पारंपरिक ग्रंथ-वचन है — **गर्भ में लिंग बताना नहीं**। PC-PNDT Act 1994 के तहत गर्भ-लिंग जाँच या बताना अपराध है, और त्रिकाल वाणी ऐसा कभी नहीं करती। संतान का समय कुंडली से — [Santan Yog Calculator](/calculators/free-santan-yog-calculator)।',
    ],
  },
  {
    id: 'shubh-varsh-hast-rekha',
    h2: 'हथेली से आने वाले शुभ वर्ष — उँगलियों के १५ पर्व',
    paras: [
      '**सीधा जवाब:** ग्रंथ (१.८.११–१.८.१६) के अनुसार पाँचों उँगलियों के **१५ पर्व** जीवन के एक-एक वर्ष बताते हैं; जिस पर्व पर **ऊपर जाती रेखा** हो, वह वर्ष शुभ — *लक्ष्मीः पुत्राद्याप्तिर्यशः सुखम्* (१.८.१२): धन, परिवार में वृद्धि, यश और सुख। पुरुष की गिनती दाएँ हाथ की कनिष्ठा से, स्त्री की बाएँ हाथ के अँगूठे से।',
      'हमारा इंजन हर पर्व पर रेखा नापता है और आपकी जन्म तिथि से गिनकर **अगले शुभ वर्ष महीने-साल के साथ** बताता है — नया काम, घर-ज़मीन या शुभ कार्य शुरू करने के लिए। **[अपने शुभ वर्ष जानें — ₹51](#top)**।',
    ],
  },
  {
    id: 'aath-score',
    h2: 'हर बात के साथ श्लोक — अंक क्यों नहीं',
    paras: [
      'पहले इस रिपोर्ट में आठ क्षेत्रों के अंक आते थे। **अब नहीं आते** — और यह जानबूझकर है।',
      '82 या 64 जैसा अंक देखने में सटीक लगता है, पर ग्रंथ में कहीं अंक नहीं हैं — ग्रंथ रेखा की **हालत** का **फल** बताता है। इसलिए अब रिपोर्ट हर बात के साथ **हस्तसंजीवनम् का श्लोक और उसका अंक** देती है, जैसे (३.५.१०)।',
      'इसका फ़ायदा: आप हर बात **खुद जाँच सकते हैं** — कौन सी रेखा, उसकी कौन सी हालत, और ग्रंथ का कौन सा श्लोक। जो रेखा फोटो में साफ नहीं दिखी, उसके बारे में रिपोर्ट कुछ नहीं जोड़ती।',
    ],
  },

  // ── AI, TRUST, COMPARISON ────────────────────────────────────────────────
  {
    id: 'chatgpt-se-farak',
    h2: 'ChatGPT से हस्तरेखा पढ़वाना — फ़र्क़ क्या है',
    paras: [
      'यह प्रश्न अब बहुत खोजा जाता है, इसलिए सीधा उत्तर — जिसमें वह भी है जो हमारे पक्ष में नहीं जाता।',
      'ChatGPT या Gemini आपकी हथेली की फ़ोटो देख सकते हैं और उस पर बात कर सकते हैं। वे भाषा में अच्छे हैं और मना नहीं करते। **इतना मान लेना चाहिए।**',
      'फ़र्क़ यह है कि वे **किसी शास्त्रीय ढाँचे पर नहीं चलते।** वे इंटरनेट पर जो पढ़ा है उसी से उत्तर बनाते हैं — और उसमें सामुद्रिक शास्त्र भी है, पश्चिमी palmistry भी, और बहुत कुछ जो किसी परंपरा का नहीं। इसलिए वही फ़ोटो दो बार भेजिए तो दो अलग उत्तर मिल सकते हैं।',
      'यहाँ ढाँचा तय है — **ग्रंथ हस्तसंजीवनम् के श्लोक**, चार मुख्य रेखाएँ, सात ग्रह-स्थान, और हर निष्कर्ष के साथ श्लोक का अंक। एक ही फोटो पर हमेशा एक ही रिपोर्ट। इसलिए आप उसे परख सकते हैं और असहमत भी हो सकते हैं।',
    ],
  },
  {
    id: 'scanner-app-se-farak',
    h2: 'Palm reading scanner ऐप और यह पेज — क्या अलग है',
    paras: [
      '"हाथ की रेखा स्कैन करने वाला ऐप" बहुत खोजा जाता है, इसलिए इस पर साफ़ होना चाहिए।',
      'अधिकांश मुफ़्त स्कैनर ऐप दो में से एक काम करते हैं: या तो वे **पहले से लिखा हुआ सामान्य पाठ** दिखाते हैं जो सबके लिए एक ही होता है, या वे विज्ञापन दिखाने के लिए बने होते हैं। कुछ ऐप हथेली की फ़ोटो माँगते हैं और उसका उपयोग साफ़ नहीं बताते।',
      'यहाँ **कोई ऐप डाउनलोड नहीं करना पड़ता।** ब्राउज़र में ही चलता है, फ़ोन में जगह नहीं लेता — बस फ़ोटो के लिए कैमरे की अनुमति, या गैलरी से फ़ोटो।',
      'और सबसे बड़ा फ़र्क़ — **यहाँ हर बात के साथ उसका आधार लिखा होता है।** कौन सी रेखा, कौन सा पर्वत, किस नियम से। सामान्य पाठ में वह कभी नहीं होता।',
    ],
  },
  {
    id: 'kitna-bharosa',
    h2: 'AI की हस्तरेखा पर कितना भरोसा करें',
    paras: [
      'इसका ईमानदार उत्तर दो हिस्सों में है और दोनों कहना ज़रूरी है।',
      '**जो मशीन अच्छा करती है** — रेखाओं की लंबाई, गहराई, कोण, शाखाएँ और चिह्न पहचानना। यह नाप का काम है और उसमें मशीन थकती नहीं, जल्दबाज़ी नहीं करती, और मूड से प्रभावित नहीं होती।',
      '**जो मशीन नहीं कर सकती** — आपके सामने बैठकर आपका हाथ पकड़ना, आपका प्रश्न सुनना, और उस एक चीज़ पर रुकना जो आपके लिए सबसे ज़रूरी है। एक अनुभवी हस्तरेखाविद वह करता है, और उसका मूल्य अलग है।',
      'इसलिए इसे इस रूप में लीजिए: **ग्रंथ के श्लोक से मिलाई गई, नापी हुई रीडिंग — ₹51 में, घर बैठे।** हर बात का आधार लिखा है, ताकि आप खुद परख सकें। और गहरी बात करनी हो तो रोहित गुप्ता से व्यक्तिगत परामर्श भी उपलब्ध है।',
    ],
  },
  {
    id: 'samudrika-shastra',
    h2: 'सामुद्रिक शास्त्र — यह विश्लेषण किस पर टिका है',
    paras: [
      'यह बताना ज़रूरी है, क्योंकि इसी से पता चलता है कि यह अनुमान है या परंपरा।',
      '**सामुद्रिक शास्त्र** भारतीय परंपरा का वह अंग है जो शरीर के चिह्नों से स्वभाव और जीवन-दिशा पढ़ता है — हथेली उसका सबसे विस्तृत हिस्सा है। इसमें छह मुख्य रेखाएँ, सात पर्वत, और उन पर पड़ने वाले चिह्न आते हैं।',
      'हर पर्वत एक ग्रह से जुड़ा है — गुरु से ज्ञान और नेतृत्व, शनि से अनुशासन, सूर्य से यश, बुध से बुद्धि और व्यापार, मंगल से साहस, शुक्र से प्रेम, चंद्र से कल्पना। **यही जोड़ हस्तरेखा को ज्योतिष से जोड़ता है।**',
      'पूरा शास्त्रीय आधार [हस्त रेखा ज्ञान — सामुद्रिक शास्त्र मार्गदर्शिका](/blog/hast-rekha-gyan-samudrik-shastra-margdarshika) में है और अंग्रेज़ी में [Samudrika Shastra guide](/blog/hast-rekha-gyan-samudrika-shastra-guide) पर।',
    ],
  },
  {
    id: 'kya-hast-rekha-sach',
    h2: 'क्या हस्तरेखा सच होती है — संतुलित उत्तर',
    paras: [
      'यह प्रश्न जायज़ है और इसका उत्तर टालना नहीं चाहिए।',
      'जो परंपरा कहती है: हथेली की रेखाएँ **स्वभाव और प्रवृत्ति** दिखाती हैं — आप दबाव में कैसे चलते हैं, निर्णय कैसे लेते हैं, ऊर्जा किस तरफ़ जाती है। इस स्तर पर लोग प्रायः अपने आप को पहचान लेते हैं, और यही इसकी असली उपयोगिता है।',
      'जो इससे आगे का दावा है वह टिकता नहीं: कोई निश्चित घटना, कोई तारीख़, कोई ऐसा उत्तर जिसे बदला न जा सके।',
      'और एक बात जो परंपरा स्वयं कहती है — **रेखाएँ बदलती हैं।** यदि सब कुछ तय होता तो वे बदलतीं क्यों? पूरा विषय [क्या हस्त रेखा सच है](/blog/kya-hast-rekha-sach-hai) और [Is palm reading accurate](/blog/is-palm-reading-accurate-ai-palmistry) पर है।',
    ],
  },
  {
    id: 'kya-nahi-batata',
    h2: 'यह विश्लेषण क्या नहीं बता सकता',
    paras: [
      'यह सीमा इस पेज के अपने व्यापार के ख़िलाफ़ जाती है, पर सबसे ज़रूरी हिस्सा यही है।',
      '**आयु और मृत्यु नहीं।** जीवन रेखा की लंबाई से आयु नहीं निकलती — यह हस्तरेखा की सबसे पुरानी और सबसे नुक़सानदेह ग़लतफ़हमी है। छोटी जीवन रेखा वाले लोग लंबा जीते हैं और उल्टा भी। जो कोई आयु बताए, उससे तुरंत दूर हो जाइए।',
      '**हथेली से कोई तारीख़ नहीं।** "आपकी शादी 2027 में होगी" हथेली से नहीं निकलता। समय का प्रश्न जन्म कुंडली और दशा का है, और उसके लिए जन्म समय चाहिए — इसीलिए जन्म समय देने पर रिपोर्ट का "शादी कब" हिस्सा कुंडली से बनता है, हाथ से नहीं।',
      '**कोई रोग नहीं।** रेखा निदान नहीं है। किसी लक्षण को "रेखा का फल" मानकर जाँच टालना ख़तरनाक है — और इस पेज पर किसी बीमारी का नाम कभी नहीं लिया जाएगा।',
    ],
  },

  // ── GENDER VARIANTS ──────────────────────────────────────────────────────
  {
    id: 'female-palm',
    h2: 'महिलाओं की हस्तरेखा — क्या पढ़ने का तरीक़ा अलग है',
    paras: [
      'यह बहुत खोजा जाता है, इसलिए इस पर सीधा होना चाहिए।',
      '**रेखाओं का अर्थ नहीं बदलता।** हृदय रेखा का मतलब वही है, जीवन रेखा का वही, शुक्र पर्वत का वही — चाहे हाथ किसी का हो।',
      'जो बदलता है वह **मुख्य हाथ** है — परंपरा में स्त्री का बायाँ हाथ मुख्य माना गया है, पुरुष का दायाँ। इसके अलावा महिलाओं की हथेली प्रायः अधिक कोमल होती है और उसमें बारीक रेखाएँ ज़्यादा दिखती हैं, जिससे विश्लेषण में और विस्तार मिलता है।',
      'और वह बात जो साफ़ कहनी चाहिए: **"स्त्री की हथेली में विवाह ही सबसे बड़ा प्रश्न है" — यह शास्त्र नहीं, चलन है।** यहाँ आठों क्षेत्र सबके लिए एक जैसे पढ़े जाते हैं — करियर, धन और शिक्षा भी।',
    ],
  },
  {
    id: 'male-palm',
    h2: 'पुरुषों की हस्तरेखा — किन बातों पर ध्यान',
    paras: [
      'यहाँ भी नियम वही हैं, पर कुछ व्यावहारिक बातें अलग हैं।',
      '**मुख्य हाथ दायाँ** माना जाता है परंपरा में। और पुरुषों की हथेली प्रायः सख़्त होती है, इसलिए रेखाएँ गहरी पर कम संख्या में दिखती हैं।',
      'काम की वजह से घिसी हथेली में मुख्य रेखाएँ तो दिखती हैं पर बारीक चिह्न दब जाते हैं। ऐसे में ऊपर दिया गया तरीक़ा — हाथ धोकर, थोड़ी नमी के साथ, आराम की स्थिति में — फ़र्क़ डालता है।',
      'ध्यान देने योग्य पर्वत: **मंगल** (साहस और प्रतिस्पर्धा), **गुरु** (नेतृत्व) और **सूर्य** (यश)। इनका उभार करियर से जुड़े प्रश्नों में सबसे ज़्यादा बोलता है। पर्वतों का पूरा विषय [हथेली के पर्वत](/blog/mounts-on-palm-parvat-meaning) में है।',
    ],
  },

  // ── TOPIC-SPECIFIC (PASF-DRIVEN, HANDED OFF BY LINK) ────────────────────
  {
    id: 'dhan-ki-rekha',
    h2: 'धन की हस्तरेखा — पैसा हथेली में कहाँ दिखता है',
    paras: [
      'यह सबसे ज़्यादा खोजे जाने वाले प्रश्नों में है, और शास्त्र में इसका उत्तर एक रेखा में नहीं — तीन जगह मिलकर है।',
      '**सूर्य रेखा** — यश, पहचान और उससे आने वाला धन। गहरी और सीधी सूर्य रेखा को धन के लिए सबसे शुभ माना गया है। **भाग्य रेखा** — जीवन की स्थिरता और कर्म से आने वाला फल।',
      '**बुध पर्वत** — व्यापार, गणना और सौदे की क्षमता। उभरा हुआ बुध पर्वत व्यापार से धन का संकेत माना जाता है। साथ में कनिष्ठा उँगली के नीचे की छोटी खड़ी रेखाएँ, जिन्हें कुछ परंपराएँ धन-रेखा कहती हैं।',
      'और एक ज़रूरी सुधार: **कोई एक "धन रेखा" नहीं होती जिसके होने भर से पैसा आ जाए।** जो साइट एक रेखा दिखाकर करोड़पति बता दे, वह चलन बेच रही है। विस्तार से [सूर्य रेखा का मतलब](/blog/surya-rekha-sun-line-matlab) और [भाग्य रेखा](/blog/bhagya-rekha-fate-line-matlab) में।',
    ],
  },
  {
    id: 'vivah-rekha-palm',
    h2: 'विवाह रेखा — हथेली से शादी का प्रश्न',
    paras: [
      '"Free online palm reading for marriage" बहुत खोजा जाता है, इसलिए यह बताना ज़रूरी है कि हथेली इसमें कितना देती है।',
      '**विवाह रेखा** कनिष्ठा उँगली के नीचे, हृदय रेखा के ऊपर की छोटी आड़ी रेखा है। उसकी लंबाई, गहराई और उसका सिरा — तीनों देखे जाते हैं। साथ में **शुक्र पर्वत**, जो प्रेम और आकर्षण का पर्वत है।',
      'जो हथेली देती है: रिश्तों में आपका **स्वभाव** — आप जल्दी जुड़ते हैं या समय लेते हैं, टकराव में क्या करते हैं, और साथ निभाने की प्रवृत्ति कैसी है।',
      'जो हथेली **नहीं** देती: शादी कब होगी। **समय का प्रश्न कुंडली का है, हथेली का नहीं** — और उसके लिए जन्म समय चाहिए। वह जाँच [शादी कब होगी](/calculators/free-shadi-kab-hogi-calculator) पर मुफ़्त है। रेखा का पूरा विषय [विवाह रेखा](/blog/vivah-rekha-marriage-line-matlab) में।',
      'ग्रंथ हस्तसंजीवनम् का नियम भी जान लीजिए: **स्त्री-रेखा बाएँ हाथ में** देखी जाती है (३.६.१९), और आयु रेखा व कनिष्ठा के बीच किनारे से आती जितनी रेखाएँ, उतने जीवनसाथी का योग (३.६.२०)। ₹51 की रिपोर्ट यह गिनने का तरीका और हर गिनती का फल देती है; जन्म समय दें तो उसी रिपोर्ट में शादी का समय भी — कुंडली से।',
    ],
  },
  {
    id: 'videsh-rekha',
    h2: 'विदेश यात्रा की रेखा — हथेली में विदेश का योग',
    paras: [
      'यह प्रश्न बढ़ रहा है और शास्त्र में इसका आधार असली है।',
      '**चंद्र पर्वत** — हथेली के निचले बाहरी हिस्से में, कल्पना और यात्रा का पर्वत। उससे निकलने वाली रेखाएँ, और जीवन रेखा से निकलकर चंद्र पर्वत की ओर जाने वाली शाखा, यात्रा और दूर के स्थान से जोड़ी जाती हैं।',
      '**जीवन रेखा का सिरा** — यदि वह अंत में हथेली के बाहरी किनारे की ओर मुड़ जाए, तो परंपरा उसे जन्मभूमि से दूर बसने का संकेत मानती है।',
      'पर एक साफ़ सीमा: **हथेली यह नहीं बताती कि कौन सा देश या कब।** वह प्रश्न कुंडली के बारहवें और नवम भाव का है, और उसकी जाँच [Foreign Settlement Calculator](/calculators/free-foreign-settlement-calculator) पर मुफ़्त है।',
    ],
  },
  {
    id: 'santan-vidya-rekha',
    h2: 'संतान और विद्या के संकेत हथेली में',
    paras: [
      'ये दोनों प्रश्न आते हैं और दोनों का उत्तर सीमित पर असली है।',
      '**संतान** — विवाह रेखा से ऊपर उठने वाली बारीक खड़ी रेखाएँ परंपरा में संतान से जोड़ी जाती हैं। पर यह हस्तरेखा का सबसे विवादित हिस्सा है और अलग-अलग परंपराएँ अलग कहती हैं। **इसे संकेत मानिए, गिनती नहीं।**',
      'हमारी रिपोर्ट जिस ग्रंथ पर चलती है, उस **हस्तसंजीवनम्** का नियम अलग है: **अँगूठे की जड़ से कलाई (मणिबंध) की ओर** जितनी रेखाएँ, उतनी संतान का योग (३.६.४)। रिपोर्ट यही नियम, गिनने का तरीका और श्लोक देती है — और साफ लिखती है कि यह गर्भ में लिंग बताना नहीं है (PC-PNDT Act 1994)। **विद्या** पर ग्रंथ कहता है: लंबी अनामिका वाला विद्या-भोगी (३.२.९)।',
      '**विद्या** — मस्तिष्क रेखा सबसे ज़्यादा बोलती है। लंबी और सीधी मस्तिष्क रेखा विश्लेषण और गणित की ओर, झुकी हुई कल्पना और कला की ओर। साथ में **बुध पर्वत** और गुरु पर्वत।',
      'दोनों प्रश्नों के लिए कुंडली अधिक स्पष्ट उत्तर देती है — संतान के लिए [Santan Yog Calculator](/calculators/free-santan-yog-calculator), और शिक्षा के लिए [Education Prediction](/learn/education-prediction-astrology). दोनों मुफ़्त।',
    ],
  },
  {
    id: 'career-rekha',
    h2: 'करियर और नौकरी के संकेत',
    paras: [
      'हथेली में करियर का प्रश्न मुख्यतः दो जगह से पढ़ा जाता है।',
      '**भाग्य रेखा** — हथेली के बीच से ऊपर जाने वाली रेखा। उसका आरंभ बिंदु बहुत कुछ बताता है: जीवन रेखा से निकले तो अपने प्रयास से बना करियर, चंद्र पर्वत से निकले तो दूसरों के सहयोग और सार्वजनिक कार्य से।',
      '**गुरु और मंगल पर्वत** — नेतृत्व और प्रतिस्पर्धा। उभरा गुरु पर्वत प्रबंधन और मार्गदर्शन की ओर, उभरा मंगल तकनीकी और प्रतिस्पर्धी क्षेत्रों की ओर।',
      'और यहाँ भी वही सीमा: **कौन सी नौकरी और कब — यह हथेली नहीं बताती।** वह दशम भाव और दशा का प्रश्न है। [Career Prediction Astrology](/learn/career-prediction-astrology) पर पूरा विषय है।',
    ],
  },
  {
    id: 'sehat-rekha',
    h2: 'स्वास्थ्य की रेखा — यहाँ सबसे सख़्त सीमा',
    paras: [
      'यह खंड छोटा है पर इस पूरे पेज का सबसे ज़रूरी नियम यहीं है।',
      'परंपरा में **जीवन रेखा** को जीवन-शक्ति से और **स्वास्थ्य रेखा** (बुध रेखा) को पाचन तथा तंत्रिका से जोड़ा गया है। यह जानकारी शास्त्रीय है।',
      '**पर यह निदान नहीं है, और कभी नहीं हो सकती।** कोई रेखा किसी बीमारी का नाम नहीं बताती। किसी लक्षण को "रेखा का फल" मानकर डॉक्टर के पास जाने में देर करना — यही इस क्षेत्र की सबसे ख़तरनाक ग़लती है।',
      'सीधी बात: **स्वास्थ्य का पहला और आख़िरी रास्ता डॉक्टर है।** यह रिपोर्ट किसी रोग का नाम नहीं लेती, और जो कोई हथेली देखकर बीमारी बताए और उसका उपाय बेचे — उससे तुरंत दूर हो जाइए।',
    ],
  },

  // ── PRACTICAL QUESTIONS ─────────────────────────────────────────────────
  {
    id: 'rekha-badalti-hai',
    h2: 'क्या हथेली की रेखाएँ बदलती हैं',
    paras: [
      'हाँ — और यह हस्तरेखा की सबसे आशा देने वाली बात है।',
      'मुख्य रेखाएँ — जीवन, मस्तिष्क, हृदय — जन्म से रहती हैं और उनका मूल ढाँचा प्रायः वही रहता है। पर **भाग्य रेखा, सूर्य रेखा और बारीक चिह्न बदलते हैं**, और कई लोगों में यह बदलाव कुछ वर्षों में साफ़ दिखता है।',
      'शास्त्र इसे ऐसे कहता है: **हाथ मन का दर्पण है।** जैसे-जैसे सोच, अनुशासन और दिशा बदलती है, हथेली उसे दर्ज करती है। यही कारण है कि दोनों हाथ अलग होते हैं — एक जन्म का, दूसरा बनाया हुआ।',
      'व्यावहारिक अर्थ: **कोई रेखा अंतिम फ़ैसला नहीं है।** और इसीलिए हर दो-तीन साल में दोबारा देखना अर्थ रखता है — पर हर महीने नहीं।',
    ],
  },
  {
    id: 'dono-haath-alag',
    h2: 'दोनों हाथों की रेखाएँ अलग क्यों हैं',
    paras: [
      'यह सबसे ज़्यादा चौंकाने वाली बात होती है जब लोग पहली बार ध्यान से देखते हैं।',
      'परंपरा का उत्तर सीधा है: **एक हाथ वह दिखाता है जो लेकर आए, दूसरा वह जो बनाया।** गैर-मुख्य हाथ जन्म की प्रवृत्ति, और मुख्य हाथ आज की स्थिति।',
      'इसलिए दोनों में **जितना फ़र्क़ है, उतना ही आपने अपने कर्म से बदला है** — और यह शास्त्र में अच्छा माना जाता है, कमी नहीं।',
      'यदि दोनों लगभग एक जैसे हैं तो उसका अर्थ यह माना जाता है कि व्यक्ति अपनी स्वाभाविक दिशा में ही चल रहा है। हमारी रिपोर्ट ग्रंथ के नियम (३.१.६) से मुख्य हाथ पढ़ती है; दूसरा हाथ भेजने से मुख्य हाथ की फोटो कमज़ोर होने पर रिपोर्ट रुकती नहीं।',
    ],
  },
  {
    id: 'umar-nahi-nikalti',
    h2: 'रेखा से उम्र या तारीख़ क्यों नहीं निकलती',
    paras: [
      'यह इस पेज का सबसे ज़रूरी इनकार है और इसे दोहराना ठीक है।',
      'कुछ परंपराएँ जीवन रेखा पर उम्र के निशान लगाती हैं। **पर वे निशान किसी सर्वमान्य पैमाने पर नहीं टिके** — अलग-अलग किताबें अलग जगह पर वही उम्र दिखाती हैं। जो चीज़ हर किताब में अलग हो, उससे किसी की ज़िंदगी की तारीख़ नहीं बताई जा सकती।',
      'इसीलिए यहाँ **हथेली से कोई तारीख़ नहीं दी जाती** — न शादी की, न नौकरी की, और आयु तो बिल्कुल नहीं। शादी का समय चाहिए तो जन्म समय दीजिए — वह हिस्सा कुंडली से बनता है।',
      'समय का प्रश्न वास्तव में **दशा** का है, और दशा जन्म नक्षत्र से निकलती है — यानी उसके लिए जन्म समय चाहिए। वह जाँच [Dasha Calculator](/calculators/free-dasha-calculator) पर मुफ़्त है।',
    ],
  },
  {
    id: 'kitni-baar',
    h2: 'कितनी बार हथेली दिखानी चाहिए',
    paras: [
      'छोटा पर व्यावहारिक प्रश्न।',
      'मुख्य रेखाएँ जल्दी नहीं बदलतीं, इसलिए **दो से तीन साल में एक बार** पर्याप्त है। या तब, जब जीवन में सच में कोई बड़ा मोड़ आया हो।',
      'जो नहीं करना चाहिए: **हर कुछ हफ़्तों में दोबारा देखना।** रेखाएँ उतनी जल्दी नहीं बदलतीं, और बार-बार देखना स्थिति नहीं सुधारता — केवल चिंता बढ़ाता है।',
      'और एक बात जो हमारे अपने पैसे के ख़िलाफ़ जाती है: **यदि आप बार-बार इसलिए देख रहे हैं कि उत्तर बदल जाए, तो वह नहीं बदलेगा।** उस समय ज़रूरत एक और रिपोर्ट की नहीं, किसी से बात करने की है।',
    ],
  },
  {
    id: 'bachchon-ki-hatheli',
    h2: 'बच्चों की हथेली — कब और कितना',
    paras: [
      'माता-पिता यह पूछते हैं और उत्तर संयम वाला होना चाहिए।',
      'छोटे बच्चों की हथेली में **रेखाएँ अभी बन रही होती हैं** — विशेषकर भाग्य और सूर्य रेखा, जो प्रायः किशोरावस्था के बाद स्पष्ट होती हैं। इसलिए बहुत छोटी उम्र में पढ़ना अधूरा रहता है।',
      'जो उस उम्र में भी दिखता है वह **स्वभाव** है — मस्तिष्क रेखा से सीखने का तरीक़ा, हृदय रेखा से भावनात्मक प्रकृति। यह जानकारी माता-पिता के काम की है।',
      'और वह नियम जो सबसे ज़रूरी है: **बच्चे के सामने उसकी हथेली पर चिंता मत जताइए।** बच्चा जो बार-बार सुनता है वही मान लेता है। बच्चे के लिए कुंडली आधारित विश्लेषण अधिक स्पष्ट है — [Child Destiny](/services/child-destiny)।',
    ],
  },
  {
    id: 'kundali-vs-hast',
    h2: 'कुंडली और हस्तरेखा — कौन सा बेहतर है',
    paras: [
      'दोनों अलग औज़ार हैं और अलग प्रश्नों के लिए हैं। यह अंतर जान लेना सबसे उपयोगी है।',
      '**कुंडली समय बताती है** — कौन सा दौर किस चीज़ का है, कब क्या खुलेगा। पर उसके लिए **सटीक जन्म समय** चाहिए, और बहुत लोगों के पास वह नहीं होता।',
      '**हस्तरेखा स्वभाव और प्रवृत्ति बताती है** — आप कैसे हैं, दबाव में क्या करते हैं, ऊर्जा किस तरफ़ जाती है। इसके लिए **कोई जन्म समय नहीं चाहिए** — बस एक फ़ोटो।',
      'इसलिए सही उत्तर "कौन सा बेहतर" नहीं है, बल्कि **"आपका प्रश्न किस तरह का है"** है। "कब" पूछ रहे हैं तो कुंडली; "मैं कैसा हूँ" पूछ रहे हैं तो हथेली।',
    ],
  },
  {
    id: 'dono-milakar',
    h2: 'दोनों मिलाकर देखने से क्या मिलता है',
    paras: [
      'यह वह हिस्सा है जो लगभग कोई नहीं करता और जो सबसे उपयोगी है।',
      'हथेली के **सात पर्वत सीधे सात ग्रहों से जुड़े हैं** — गुरु, शनि, सूर्य, बुध, मंगल, शुक्र, चंद्र। यानी दोनों विधियाँ एक ही भाषा बोलती हैं।',
      'जब कुंडली में कोई ग्रह बलवान हो और हथेली में उसका पर्वत भी उभरा हो, तो वह संकेत **दोगुना मज़बूत** माना जाता है। और जब दोनों उल्टा कहें, तो वहीं असली प्रश्न होता है — प्रायः वह जन्म समय की ग़लती निकलता है।',
      'व्यावहारिक तरीक़ा: **पहले हथेली** (जन्म समय की ज़रूरत नहीं, तुरंत मिल जाती है), फिर कुंडली यदि समय उपलब्ध हो। [Kundali Calculator](/calculators/free-janam-kundali-calculator) मुफ़्त है।',
    ],
  },

  // ── DECISION / CONVERSION ────────────────────────────────────────────────
  {
    id: 'kis-ke-liye',
    h2: 'यह किसके लिए सबसे उपयोगी है',
    paras: [
      '**सबसे ज़्यादा उपयोगी:** जिनके पास **सटीक जन्म समय नहीं है** — और यह भारत में बहुत आम है। हथेली के लिए समय चाहिए ही नहीं, इसलिए यह उनके लिए एकमात्र भरोसेमंद रास्ता है।',
      'और उनके लिए भी जो पहली बार कुछ आज़माना चाहते हैं — बिना जन्म विवरण दिए, बिना साइनअप, बस एक फ़ोटो से।',
      '**कम उपयोगी:** जिनका प्रश्न "कब" है — शादी कब, नौकरी कब, यह दौर कब ख़त्म। वह हथेली नहीं बताती, और यह ऊपर साफ़ लिखा है। (शादी कब का जवाब रिपोर्ट में तभी जुड़ता है जब आप जन्म समय दें — वह कुंडली से आता है।)',
      'और **एक जगह जहाँ यह पेज सही जगह नहीं है:** यदि प्रश्न किसी बीमारी का है। वह डॉक्टर का विषय है, और वहाँ पहला क़दम कोई जाँच नहीं होनी चाहिए।',
    ],
  },
  {
    id: 'report-kaise-padhein',
    h2: 'रिपोर्ट पढ़ने का सही क्रम',
    paras: [
      'रिपोर्ट उसी क्रम में बनी है जिसमें उसे पढ़ना चाहिए।',
      '**पहले "बीता समय"** — बचपन और परिवार। आप इसे खुद जानते हैं; यदि यह हिस्सा आपको सही लगे, तो बाक़ी पर भरोसा करने का आधार बनता है।',
      '**फिर "अभी का समय" और "आगे का समय"** — कमाई का दौर, और ऊर्ध्व रेखा से काम और पद का रास्ता।',
      '**आख़िर में ग्रह-स्थान और उपाय।** और यदि कहीं **कारण समझ न आए**, तो साथ लिखा श्लोक का अंक देखिए — हर बात का आधार इसीलिए लिखा जाता है।',
    ],
  },
  {
    id: 'palmist-near-me',
    h2: 'आसपास कोई हस्तरेखाविद ढूँढ़ रहे हैं',
    paras: [
      '"हस्तरेखाविद near me" और "Best palmist in Noida" जैसी खोजें बहुत होती हैं, इसलिए इस पर ईमानदार होना चाहिए।',
      '**घर बैठे, बिना अपॉइंटमेंट** — त्रिकाल वाणी की रीडिंग वही शास्त्रीय हस्तसंजीवनम् है, चाहे आप द्वारका में हों या नोएडा, गुड़गांव, गाज़ियाबाद में। और आमने-सामने बात करनी हो तो रोहित गुप्ता से व्यक्तिगत परामर्श भी।',
      'जो यह देता है: **कहीं से भी, ₹51 में, और हर निष्कर्ष के साथ उसका आधार लिखा हुआ** — घर, नौकरी-बिज़नेस, पढ़ाई, विवाह-योग, संतान-योग और आने वाले शुभ वर्ष।',
      'और यदि किसी के पास जा रहे हैं तो एक सलाह: **जो आयु या मृत्यु बताए, या डर दिखाकर महँगा उपाय बेचे — वहाँ से उठ जाइए।** यह विषय [हस्त रेखा near me](/blog/hast-rekha-near-me-online) पर विस्तार से है।',
    ],
  },
  {
    id: 'kyun-yahi',
    h2: 'यही पेज क्यों — और क्या फ़र्क़ है',
    paras: [
      '**कोई ऐप नहीं** — ब्राउज़र में चलता है, फ़ोन में जगह नहीं लेता; बस फ़ोटो के लिए कैमरा।',
      '**कोई जन्म समय नहीं** — केवल एक फ़ोटो। यही इस विधि की सबसे बड़ी सुविधा है।',
      '**हर बात के साथ आधार** — कौन सी रेखा, उसकी कौन सी हालत, और ग्रंथ हस्तसंजीवनम् का कौन सा श्लोक। इसलिए आप उसे परख सकते हैं और असहमत भी हो सकते हैं।',
      'और **जो यहाँ नहीं है** — कोई आयु, कोई तारीख़, कोई बीमारी का नाम, कोई डर, और कोई महँगा उपाय। यही एकमात्र दावा है, और उसी पर भरोसा किया जा सकता है।',
    ],
  },
  {
    id: 'do-minute',
    h2: 'दो मिनट — एक फ़ोटो, और आपकी पूरी रिपोर्ट',
    paras: [
      'आप यहाँ तक पढ़ आए हैं, तो प्रश्न मन में है ही।',
      '**ऊपर हथेली की एक फ़ोटो लगाइए।** दिन की रोशनी में, हथेली खुली, कैमरा सीधा ऊपर से। दो मिनट लगेंगे।',
      'बीता समय, अभी का दौर, आगे का भाग्य, ७ ग्रह-स्थान, ३ उपाय और एक PDF रिपोर्ट — हर बात श्लोक के साथ — **₹51 में, लगभग एक मिनट में।** साथ में अपना घर, नौकरी या बिज़नेस, पढ़ाई, विवाह-योग, संतान-योग — और जन्म समय दें तो शादी कब (कुंडली से)। जन्म समय ज़रूरी नहीं, कोई साइनअप नहीं, कोई ऐप नहीं।',
      'और जो मिलेगा वह सच होगा — **उम्र नहीं, तारीख़ नहीं, डर नहीं।** केवल वह जो हथेली सच में कहती है।',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'आगे क्या पढ़ें',
    paras: [
      '**अंग्रेज़ी में हर रेखा** — [Life line](/blog/life-line-jeevan-rekha-meaning), [Head line](/blog/head-line-mastishk-rekha-meaning), [Heart line](/blog/heart-line-hriday-rekha-meaning), [Fate line](/blog/fate-line-bhagya-rekha-meaning), [Sun line](/blog/sun-line-surya-rekha-meaning), [Marriage line](/blog/marriage-line-vivah-rekha-meaning)।',
      '**चिह्न और पर्वत** — [मछली का चिह्न](/blog/fish-sign-machli-on-palm-meaning), [M का निशान](/blog/m-sign-on-palm-meaning), [त्रिशूल](/blog/trishul-sign-on-palm-meaning), [तारा, त्रिभुज, चतुर्भुज](/blog/tara-tribhuj-chaturbhuj-palm-matlab), [द्वीप, क्रॉस, ग्रिल](/blog/dweep-cross-grille-palm-matlab), [हथेली के पर्वत](/blog/mounts-on-palm-parvat-meaning)।',
      '**मुफ़्त जाँच** — [Kundali Calculator](/calculators/free-janam-kundali-calculator), [Dasha Calculator](/calculators/free-dasha-calculator), [शादी कब होगी](/calculators/free-shadi-kab-hogi-calculator), [Santan Yog](/calculators/free-santan-yog-calculator), और [Swapna Shastra](/swapna) — सपनों का विश्लेषण।',
    ],
  },
  {
    id: "ai-palm-reading-online",
    h2: "AI Palm Reading Online — Upload a Photo, No Sign-Up",
    paras: [
      "This page reads your palm from **one photo**: no app to download, no sign-up, and no birth time needed. The report reads your four main lines by the classical text **Hastasanjeevanam** — past, present, future and old age — plus the 7 planet seats of the hand, with the Sanskrit shloka and its number beside every point. The guidance and line-by-line articles on this page are free; the full personal report with three BPHS remedies and a PDF is **₹51**.",
      "Use daylight, an open palm and the camera straight above — the photo guide above explains why most bad readings start with a bad photo. For how this differs from asking ChatGPT or a scanner app, see [ChatGPT से हस्तरेखा](#chatgpt-se-farak), and for an honest view on accuracy, [AI Palm Reading Online](/blog/ai-palm-reading-online-hast-rekha).",
    ],
  },
  {
    id: "male-female-hand",
    h2: "Palm Reading for Male and Female — Which Hand to Show?",
    paras: [
      "Tradition reads the **right hand for men and the left for women** as the main hand. Many palmists today also give weight to the hand you write and work with, because it shows the present while the other shows what you were born with. If you can, upload both — the comparison is the most useful part.",
      "The lines themselves are read the same way for both; what differs is which hand leads. The Hindi detail is in [महिलाओं की हस्तरेखा](#female-palm) and [पुरुषों की हस्तरेखा](#male-palm).",
    ],
  },
  {
    id: "indian-palm-reading-free",
    h2: "Indian Palm Reading Free — Samudrik Shastra, Not Western Palmistry",
    paras: [
      "**Indian palm reading is Samudrik Shastra** — the classical Indian tradition that reads the hand through six lines and seven mounts, each mount tied to a graha (Guru, Shani, Surya, Budh, Shukra, Mangal, Chandra). That planetary link is what separates it from Western palmistry, which grew from Greek and European sources and does not connect the hand to Jyotish. It is also why an Indian reading can be cross-checked against the birth chart.",
      "What is free here: every line-by-line and sign-by-sign guide on this page and in the hub below, in Hindi and English, plus the downloadable PDF guide. What costs ₹51 is the personal reading of **your** photo — four main lines read by Hastasanjeevanam, the 7 planet seats, remedies and a PDF. The classical basis is set out in the [Samudrika Shastra guide](/blog/hast-rekha-gyan-samudrika-shastra-guide).",
    ],
  },
  {
    id: "palm-scanner-online-free",
    h2: "Free Palm Reading Scanner Online — Male, Female and India: What You Actually Get",
    paras: [
      "Most \"free palm scanners\" show the same pre-written text to everyone, or exist to serve ads. This page works differently: **there is no app and no sign-up** — you take one photo in the browser, and the engine reads the actual lines in it, quoting the shloka behind each finding. The rules are identical for men and women; only the traditionally leading hand differs (right for men, left for women), and uploading both hands gives the most useful comparison.",
      "Be clear about one limit before you scan anything, anywhere: **no palm scanner can give a date, an age or a diagnosis**, and a tool that claims to is guessing. Timing questions — marriage, job, a difficult phase — belong to the birth chart, which you can check free with the [Kundali Calculator](/calculators/free-janam-kundali-calculator). For how this compares with asking a chatbot, see [ChatGPT से हस्तरेखा](#chatgpt-se-farak).",
    ],
  },
  {
    id: "hath-ki-rekha-online-check",
    h2: "Hath Ki Rekha Online Check — Photo Ya Scanner Se Kaise Dekhe",
    paras: [
      "Online check ka sabse aasaan tareeka: **apni hatheli ki ek saaf photo** upar upload kijiye — din ki roshni mein, flash band, hatheli khuli, camera seedha upar se, kalai se ungliyon tak poora frame. Koi app download nahi, koi signup nahi, janm samay ki zaroorat nahi. Photo jitni saaf hogi, reading utni behtar — dhundhli photo mein baareek rekhaayein aur nishan chhoot jaate hain.",
      "Photo se reading mein granth Hastasanjeevanam ki **chaar mukhya rekhaayein aur saat graha-sthaan** padhe jaate hain, aur har baat ke saath granth ka shlok aur ank likha hota hai. Kaun sa haath dikhayein, yeh [Palm Reading for Male and Female](#male-female-hand) mein hai; aur khud dekhna seekhna ho to [हाथ की रेखा कैसे देखें](#hath-ki-rekha-kaise-dekhe) wala kram follow kijiye.",
    ],
  },
];

// Tiny markdown-lite renderer for the Hindi sections above (bold + links).
function renderHi(text: string, key: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <Link key={`${key}-l-${i}`} href={link[2]} className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200">
          {link[1]}
        </Link>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${key}-b-${i}`} className="text-amber-200">{part.slice(2, -2)}</strong>;
    }
    return <span key={`${key}-s-${i}`}>{part}</span>;
  });
}

function HubList({ items }: { items: HubItem[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold text-amber-300 group-hover:text-amber-200">{i.label}</span>
            <span className="block text-xs text-slate-400">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function HastRekhaPage() {
  return (
    <>
      {/* ──────────────────────────────────────────────────────────
          JSON-LD — plain <script> from a SERVER component so it lands
          in the SSR HTML. Do NOT convert to next/script. See header.
      ─────────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                '@id': `${PAGE_URL}#app`,
                name: 'AI Hast Rekha Calculator',
                alternateName: ['AI Palmistry Calculator India', 'Samudrika Shastra AI Tool'],
                description:
                  'Indian palmistry calculator running on Trikaal Vaani\'s own vision engine: hand landmark detection, palm line extraction and rules from the classical text Hastasanjeevanam, with the Sanskrit shloka cited for every point. Hast Rekha reports in Hindi, English and Hinglish.',
                url: PAGE_URL,
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'Web, iOS, Android',
                inLanguage: ['hi-IN', 'en-IN'],
                isPartOf: { '@id': 'https://trikalvaani.com/#website' },
                offers: { '@id': `${PAGE_URL}#offer` },
                featureList: [
                  '21-point hand landmark detection on our own server',
                  'Four main lines read by Hastasanjeevanam — Pitr, Matr (Dhan), Urdhva, Aayu',
                  'Past, present, future and old age (Hastasanjeevanam 3.3.6)',
                  '7 planet seats of the hand (Hastasanjeevanam 1.5.9-10)',
                  'Sanskrit shloka and its number beside every point',
                  'Main hand by the text: right for men, left for women (3.1.6)',
                  'Helping planet with 3 remedies from BPHS chapter 85',
                  'Guided camera with a live light, steadiness and focus check',
                  'Downloadable PDF report',
                  'Life questions from the text: own home (3.6.47), job or business (3.5.8-10), studies (3.2.9, 3.5.9), marriage yoga (3.6.19-20), children yoga (3.6.4)',
                  'Optional birth time and place: marriage timing from the birth chart (Swiss Ephemeris, Vimshottari dasha)',
                  'Auspicious coming years from the finger joints (1.8.11-16) with date of birth',
                  'No birth time or birth place required',
                  'Palm photo not stored unless the user opts in',
                  'Hindi, English and Hinglish support',
                ],
                author: { '@id': PERSON_ID },
                publisher: { '@id': ORG_ID },
              },
              {
                '@type': 'Service',
                '@id': `${PAGE_URL}#service`,
                name: 'AI Hast Rekha (Palm Reading) Report',
                serviceType: 'Palmistry Reading',
                description:
                  'A palm reading from the classical text Hastasanjeevanam, generated from a single palm photograph — past, present and future from the four main lines, the 7 planet seats, 3 BPHS remedies and a downloadable PDF report, with the shloka behind every point. No birth time required.',
                url: PAGE_URL,
                provider: { '@id': ORG_ID },
                areaServed: [
                  { '@type': 'Country', name: 'India' },
                  { '@type': 'City', name: 'Delhi' },
                  { '@type': 'City', name: 'Noida' },
                  { '@type': 'City', name: 'Gurgaon' },
                  { '@type': 'City', name: 'Ghaziabad' },
                  { '@type': 'Place', name: 'Worldwide' },
                ],
                audience: { '@type': 'Audience', audienceType: 'People seeking Vedic palmistry guidance' },
                offers: { '@id': `${PAGE_URL}#offer` },
              },
              {
                '@type': 'Offer',
                '@id': `${PAGE_URL}#offer`,
                price: '51',
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
                priceValidUntil: '2027-03-31',
                url: PAGE_URL,
                description:
                  'Full Hast Rekha report from Hastasanjeevanam with PDF — four main lines, 7 planet seats, home, job or business, studies, marriage and children yoga, 3 BPHS remedies, shloka for every point; marriage timing from the birth chart when birth time is given. One photo. No birth time. Photo not stored unless you opt in. No puja, gemstone or follow-up sitting sold afterwards.',
                eligibleRegion: { '@type': 'Place', name: 'Worldwide' },
                seller: { '@id': ORG_ID },
              },
              {
                '@type': 'Person',
                '@id': PERSON_ID,
                name: 'Rohiit Gupta',
                jobTitle: 'Chief Vedic Architect',
                url: 'https://trikalvaani.com/founder',
                image: 'https://trikalvaani.com/Rohiit-Gupta.jpg',
                description:
                  'Founder of Trikaal Vaani. Sixteen years of personal practice in Vedic astrology in the Parashara tradition (Brihat Parashara Hora Shastra), and in Samudrika Shastra.',
                knowsAbout: [
                  'Samudrika Shastra',
                  'Vedic Astrology',
                  'Jyotish Shastra',
                  'Indian Palmistry',
                  'Brihat Parashara Hora Shastra',
                ],
                worksFor: { '@id': ORG_ID },
              },
              {
                '@type': 'Organization',
                '@id': ORG_ID,
                name: 'Trikaal Vaani',
                legalName: 'Trikal Vaani',
                url: 'https://trikalvaani.com',
                logo: 'https://trikalvaani.com/Trikal_Logo.png',
                sameAs: REAL_SAMEAS,
              },
              {
                '@type': 'FAQPage',
                '@id': `${PAGE_URL}#faq`,
                mainEntity: FAQS.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              },
              {
                '@type': 'HowTo',
                '@id': `${PAGE_URL}#howto`,
                name: 'How to get a Hast Rekha reading from a palm photo',
                totalTime: 'PT2M',
                estimatedCost: { '@type': 'MonetaryAmount', currency: 'INR', value: '51' },
                step: [
                  { '@type': 'HowToStep', position: 1, name: 'Photograph your main hand', text: 'Tap Right or Left hand; the guided camera checks light, steadiness and focus and takes the photo itself. Right hand for men, left for women (Hastasanjeevanam 3.1.6).' },
                  { '@type': 'HowToStep', position: 2, name: 'Add your details', text: 'Name and WhatsApp number; date of birth adds your auspicious years, and birth time with place adds marriage timing from your Kundali.' },
                  { '@type': 'HowToStep', position: 3, name: 'Pay ₹51', text: 'Pay securely by Razorpay, PayPal or Google Play.' },
                  { '@type': 'HowToStep', position: 4, name: 'Get your report and PDF', text: 'In about a minute: past, present, future, home, job or business, studies, marriage and children yoga, auspicious years, 3 BPHS remedies — every point with its shloka.' },
                ],
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${PAGE_URL}#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
                  { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
                  { '@type': 'ListItem', position: 3, name: 'AI Hast Rekha Calculator', item: PAGE_URL },
                ],
              },
            ],
          }),
        }}
      />

      <HastRekhaClient faqs={FAQS} />

      {/* ══════════════════════════════════════════════════════════
          SEO / GEO / AEO / E-E-A-T CONTENT BLOCK — server rendered.
          This is what a crawler and an AI answer engine actually read.
          Never move this into a client-only component.
      ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-5 pb-24 pt-6 text-slate-300">

        {/* ── 40–60 WORD DIRECT ANSWER (AEO / GEO extraction target) ── */}
        <div
          className="rounded-2xl border p-6 md:p-7"
          style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(13,17,30,0.85)' }}
        >
          <h2 className="mb-3 font-serif text-xl font-bold" style={{ color: GOLD }}>
            What is the AI Hast Rekha Calculator?
          </h2>
          <p className="text-[15px] leading-relaxed text-slate-200">
            The AI Hast Rekha Calculator reads your palm from one photograph and applies the classical text
            Hastasanjeevanam: your past, present and future, own home, job or business, studies, marriage and
            children yoga, and coming auspicious years — every point with its Sanskrit shloka, plus 3 remedies and
            a PDF, for ₹51. Add birth time for marriage timing from your Kundali.
          </p>
        </div>

        {/* ── WHAT YOU ACTUALLY GET ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          What the ₹51 report actually contains
        </h2>
        <p className="mb-4 leading-relaxed">
          A palmist in Delhi, Noida or Gurgaon charges between ₹500 and ₹2,000 to hold your hand for twenty
          minutes and tell you something you have no way to verify. What you are buying here is the same
          classical tradition, applied by a system that cannot see your face — and that has nothing to sell you
          when it finishes.
        </p>
        <ul className="mb-4 space-y-3 text-[15px]">
          <li>
            <strong className="text-amber-300">Your past, present and future — from the text itself.</strong>{' '}
            Hastasanjeevanam (3.3.6) says the Pitr line tells childhood, the Matr (Dhan) line youth and earning
            years, and the Aayu line old age. The Urdhva line — today&rsquo;s fate line — and the finger it
            reaches set the path of work and position (3.5.8–3.5.11).
          </li>
          <li>
            <strong className="text-amber-300">The 7 planet seats of the hand</strong> (1.5.9–10) and your
            helping planet — the seat your line reaches.
          </li>
          <li>
            <strong className="text-amber-300">The shloka behind every point.</strong> Each statement carries
            the Sanskrit verse and its number, so you can check it yourself.
          </li>
          <li>
            <strong className="text-amber-300">Three remedies for your helping planet</strong> — mantra,
            donation and fast, from Brihat Parashara Hora Shastra chapter 85. Not a shopping list.
          </li>
          <li>
            <strong className="text-amber-300">A downloadable PDF report</strong> that is yours to keep, in
            Hindi, English or Hinglish.
          </li>
          <li>
            <strong className="text-amber-300">Your life questions</strong> — home, job or business, studies,
            marriage and children yoga from the text, and marriage timing from your birth chart if you add your birth
            time. Details just below.
          </li>
        </ul>

        <div className="my-10 text-center">
          <Link
            href="#top"
            className="inline-block rounded-xl px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:brightness-110"
            style={{ background: GOLD }}
          >
            Read my palm — ₹51 →
          </Link>
          <p className="mt-2 text-xs text-slate-500">One photo · Birth time optional · No subscription</p>
        </div>

        {/* ── v3.4: LIFE QUESTIONS — only what the report really contains ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          Your life questions — answered from the shloka, not guessed
        </h2>
        <p className="mb-4 leading-relaxed">
          People do not show their hand to hear about &ldquo;the head line&rdquo;. They ask: will I have my own
          home? Job or business? How many marriages, how many children? When will I marry? The ₹51 report now
          answers each of these — and for each one it shows the verse it stands on, so you can check it.
        </p>
        <ul className="mb-4 space-y-3 text-[15px]">
          <li><strong className="text-amber-300">🏠 Will I own a home?</strong> On the left hand, the Pitr and Matr
            lines joined at their start give <em>grihabandh</em> — a home of your own (3.6.47, read from the left
            hand per 1.4.13). The engine measures that join in your photo.</li>
          <li><strong className="text-amber-300">💼 Job or business?</strong> The finger your Urdhva line reaches:
            index — a job with authority; middle — teacher or expert; ring — business, the <em>sarthavaha</em> (3.5.8–10).</li>
          <li><strong className="text-amber-300">💍 Marriage yoga · 👶 Children yoga</strong> — read from the short lines
            under the little finger (3.6.19–20) and the lines from the thumb root to the wrist (3.6.4), each with its
            verse. On children we give only the traditional saying; we never predict the sex of an unborn child
            (PC-PNDT Act, 1994).</li>
          <li><strong className="text-amber-300">📚 Studies?</strong> A long ring finger makes one a{' '}
            <em>vidya-bhogi</em> — one who prospers through learning (3.2.9).</li>
          <li><strong className="text-amber-300">💒 When will I marry?</strong> The palm text is silent on timing, so
            we do not invent it. Add your birth time and place and this part comes from your birth chart — the same
            engine as our free{' '}
            <Link href="/calculators/free-shadi-kab-hogi-calculator" className="text-amber-300 underline underline-offset-4">
              Shaadi Kab Hogi calculator
            </Link>, which you can use to double-check it.</li>
          <li><strong className="text-amber-300">✨ Your coming auspicious years</strong> from the finger joints
            (1.8.11–16), when you add your date of birth.</li>
        </ul>
        <p className="mb-4 leading-relaxed">
          What stays out, by design: age, death, illness and fear.
        </p>
        <div className="my-8 text-center">
          <Link href="#top" className="inline-block rounded-xl px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:brightness-110"
            style={{ background: GOLD }}>
            Get my life-questions report — ₹51 →
          </Link>
          <p className="mt-2 text-xs text-slate-500">Home · Job or business · Studies · Marriage · Children · Auspicious years</p>
        </div>

        {/* ── v3.5: SALES — value stack (only what the report really contains) ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          Why ₹51 is the easiest yes you will make this year
        </h2>
        <p className="mb-4 leading-relaxed">
          A single sitting with a palmist in Delhi NCR costs ₹500 to ₹2,000, and you walk out with nothing written
          down. For ₹51 you get a report you keep for life — and every line of it names the verse it stands on.
        </p>
        <ul className="mb-4 space-y-2 text-[15px]">
          <li>✅ <strong className="text-amber-300">Seven life answers</strong> — past, present, future, own home, job or business, studies, marriage and children yoga</li>
          <li>✅ <strong className="text-amber-300">Your coming auspicious years</strong> from the 15 finger joints (Hastasanjeevanam 1.8.11–16)</li>
          <li>✅ <strong className="text-amber-300">Marriage timing from your Kundali</strong> — Swiss Ephemeris and Vimshottari dasha — when you add birth time</li>
          <li>✅ <strong className="text-amber-300">Your helping planet and 3 BPHS remedies</strong> — mantra, donation, fast; nothing to buy</li>
          <li>✅ <strong className="text-amber-300">PDF in Hindi, Hinglish or English</strong>, ready to share on WhatsApp</li>
          <li>✅ <strong className="text-amber-300">Read under Rohiit Gupta&rsquo;s rules</strong> — 16+ years of Parashara practice, MSME-registered Trikaal Vaani</li>
        </ul>
        <p className="mb-4 leading-relaxed">
          Stuck on a decision — a house, a job switch, a marriage proposal? The hand has been read for that
          question for centuries. Two minutes and one photo is all it takes to see what yours says.{' '}
          <Link href="#top" className="font-semibold text-amber-300 underline underline-offset-4">Read my palm now →</Link>
        </p>

        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          How the reading works — 8 steps in about a minute
        </h2>
        <ol className="mb-4 space-y-2 text-[15px] list-decimal pl-5">
          <li>21 points of your hand are located on our own server.</li>
          <li>The four main lines — Pitr, Matr (Dhan), Urdhva and Aayu — are measured end to end.</li>
          <li>All 15 finger joints are checked for upward lines — your auspicious years.</li>
          <li>The home, marriage and children lines are read on the left hand.</li>
          <li>Each finding is matched to its verse in Hastasanjeevanam.</li>
          <li>With birth time, your marriage window is computed from your Kundali.</li>
          <li>Your helping planet is chosen and its 3 BPHS remedies attached.</li>
          <li>Your PDF is built — yours to keep and share.</li>
        </ol>

        {/* ── ANTI-FEAR: the differentiator, placed where the wallet is ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          What we will never tell you
        </h2>
        <p className="mb-4 leading-relaxed">
          Most of the Indian palmistry market runs on a single mechanism, and it is worth naming plainly.
          <strong> Find a mark. Name a disaster. Sell the remedy.</strong> Every adult hand carries islands,
          crosses and grilles somewhere — they are the ordinary texture of a lived life — so a reader searching
          for something frightening on your palm will always find it. Then a date gets attached, vague enough
          to survive and specific enough to grip. And then the ₹500 consultation becomes ₹15,000.
        </p>
        <p className="mb-4 leading-relaxed">
          The money is the smaller loss. People make genuinely bad decisions under that pressure — they refuse
          good matches, decline jobs, delay medical care, and carry a dread that shapes years of their life.
        </p>
        <ul className="mb-4 space-y-3 text-[15px]">
          <li>
            <strong className="text-rose-300">We will never tell you when you will die.</strong> No mark on
            your hand predicts lifespan. A short life line does not mean a short life — it never did, and the
            people who told you otherwise frightened you for money.
          </li>
          <li>
            <strong className="text-rose-300">We will never diagnose an illness.</strong> Palmistry cannot do
            this and no honest practitioner claims it can. For any health concern, consult a doctor. If you are
            struggling with your mental health, please speak to a qualified professional — a palm reading is
            not an assessment and not a treatment.
          </li>
          <li>
            <strong className="text-rose-300">We will never predict your divorce.</strong> A downward-curving
            marriage line means the bond cost you something — which describes an enormous number of marriages
            that are still standing. Your hand does not contain a decree.
          </li>
          <li>
            <strong className="text-rose-300">We will never read a date off your palm.</strong> Not a wedding date, not a
            job date. You cannot map forty years of adult life onto a centimetre of skin, and Hastasanjeevanam has no
            verse on timing. Timing is a birth chart question — the 7th house, its lord, the Dasha sequence. So if you
            add your birth time and place, the marriage window in your report is calculated from your{' '}
            <strong>birth chart</strong> and labelled as such — never from a line on your hand.
          </li>
          <li>
            <strong className="text-rose-300">We will never promise you money.</strong> Not from a fish sign,
            not from a Swastik, not from a sun line. Nothing on your hand delivers a sum. When every symbol
            produces the same prediction, the symbols have stopped meaning anything.
          </li>
          <li>
            <strong className="text-rose-300">We will never sell you a remedy for a fear we manufactured.</strong>{' '}
            There is nothing after the ₹51. No puja. No gemstone. No thread. No follow-up sitting. That entire
            business model is the reason this platform exists.
          </li>
        </ul>
        <p className="mb-4 leading-relaxed">
          And a word on gemstones, since that is where most of the money in this industry actually sits:{' '}
          <strong>never wear a stone on the strength of a palm mark.</strong> Remedial stones are prescribed
          from the birth chart, not the hand, and the wrong stone does real harm. Check suitability against your
          actual chart with the{' '}
          <Link href="/calculators/free-gemstone-suitability-calculator" className="text-amber-300 underline underline-offset-4">
            gemstone suitability calculator
          </Link>{' '}
          before spending a rupee.
        </p>

        {/* ── WHY AI — INCLUDING WHERE IT IS WORSE ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          Why an AI reading — and what it does that a palmist across the table cannot
        </h2>
        <p className="mb-4 leading-relaxed">
          Every line in your photo is <strong>measured</strong> — where it starts, which finger it reaches, whether
          it breaks — and matched to the exact verse of Hastasanjeevanam for that condition. The same hand always
          gets the same reading, and every statement carries its verse number, so you can check it yourself.
        </p>
        <p className="mb-4 leading-relaxed">
          Most people in this country do not have a trusted palmist nearby. What they have access to is a market
          with a powerful incentive to frighten them. This report is the opposite: classical, cited, and fear-free.
        </p>
        <p className="mb-4 leading-relaxed">
          And here is the one thing an engine does that a human reader structurally cannot:{' '}
          <strong>cold reading requires a reader.</strong> A palmist watches your face. They see you flinch at
          &ldquo;career trouble&rdquo; and lean in. They see you brighten at &ldquo;creative&rdquo; and expand
          on it. Most do it without any conscious intent to deceive — it is simply what one human does across a
          table from another human who is hoping.
        </p>
        <p className="mb-6 leading-relaxed">
          An engine reading a photograph does none of that. It does not see your face. It does not know your
          age, your job, your anxieties, or which answer would please you. It returns the same reading to
          anyone with the same hand.{' '}
          <strong className="text-amber-300">It is not rooting for you.</strong> That is not a marketing line —
          it is the entire product.
        </p>

        {/* ── HOW IT WORKS + PHOTO GUIDE ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          How to get your reading — and how to take the photo
        </h2>
        <ol className="mb-4 space-y-3 text-[15px]">
          <li>
            <strong className="text-amber-300">1. Photograph your main hand.</strong> The text is clear
            (Hastasanjeevanam 3.1.6): the right hand for men, the left for women. Tap the box for that hand —
            the camera tells you when the light is right and the hand is steady, then takes the photo itself.
            Send both hands if you can.
          </li>
          <li>
            <strong className="text-amber-300">2. Daylight. No flash.</strong> Flash floods the palm and erases
            the fine lines completely — including every marriage line and every small sign. Stand near a
            window. Keep the palm flat and open, fingers slightly apart, camera straight above rather than
            angled, frame filled from wrist to fingertips. Then zoom in and check: if <em>you</em> cannot see
            the fine lines, neither can the engine.
          </li>
          <li>
            <strong className="text-amber-300">3. Pay ₹51.</strong> Our engine reads the four main lines,
            applies the rules of Hastasanjeevanam and returns your report with a downloadable PDF in seconds.
            Your photo is not stored unless you tick the opt-in box — only your report and PDF are kept, so you
            can retrieve them again.
          </li>
        </ol>
        <p className="mb-4 leading-relaxed">
          Two minutes, one photo, ₹51 — and a report you keep for life, with the verse behind every line.{' '}
          <Link href="#top" className="font-semibold text-amber-300 underline underline-offset-4">Start your reading →</Link>
        </p>

        {/* ── E-E-A-T: VISIBLE, NOT JUST MARKUP ── */}
        <div
          className="my-12 rounded-2xl border p-6 md:p-7"
          style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(13,17,30,0.85)' }}
        >
          <h2 className="mb-3 font-serif text-xl font-bold" style={{ color: GOLD }}>
            Who is behind this reading
          </h2>
          <p className="mb-3 text-[15px] leading-relaxed">
            <strong className="text-amber-300">Rohiit Gupta</strong> — Founder and Chief Vedic Architect of
            Trikaal Vaani. Sixteen years of personal practice in Vedic astrology in the{' '}
            <strong>Parashara tradition</strong> (Brihat Parashara Hora Shastra), and in Samudrika Shastra.
            Trikaal Vaani is a registered MSME (UDYAM-DL-10-0119070), based in Dwarka, New Delhi 110075, serving
            clients across India — Delhi, Noida, Gurgaon and Ghaziabad — and worldwide.
          </p>
          <p className="mb-3 text-[15px] leading-relaxed">
            The rules this engine applies are not invented. The report itself is built on{' '}
            <strong>Hastasanjeevanam</strong>, with every point cited by shloka; the wider
            tradition behind this hub includes <strong>Samudrika Shastra</strong>, the Hast Rekha khand of
            the <strong>Ravan Samhita</strong>, and the body-lakshana chapters of Varahamihira&rsquo;s{' '}
            <strong>Brihat Samhita</strong>. Where the tradition is silent — on dates, on lifespan, on disease —{' '}
            <strong>we are silent too.</strong>
          </p>
          <Link href="/founder" className="text-sm font-semibold text-amber-300 underline underline-offset-4">
            More about Rohiit Gupta →
          </Link>
        </div>

        {/* ── HUB INTERLINKING — this page becomes the heart, not a dead end ── */}
        <h2 className="mb-2 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          Learn what your hand is actually saying
        </h2>
        <p className="mb-6 leading-relaxed">
          We have written the most complete honest palmistry library in India — seventeen guides, and not one of
          them will frighten you into buying anything. Read before you decide, or read afterwards to understand
          your report. Both are fine.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3
              className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200"
              style={{ borderColor: 'rgba(212,175,55,0.25)' }}
            >
              The six lines
            </h3>
            <HubList items={HUB_LINES} />
          </div>
          <div>
            <h3
              className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200"
              style={{ borderColor: 'rgba(212,175,55,0.25)' }}
            >
              The signs
            </h3>
            <HubList items={HUB_SIGNS} />
          </div>
          <div>
            <h3
              className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200"
              style={{ borderColor: 'rgba(212,175,55,0.25)' }}
            >
              Structure &amp; truth
            </h3>
            <HubList items={HUB_STRUCTURE} />
          </div>
        </div>

        {/* ═══ v2.0: HINDI HUB — the 18 Hindi articles, previously orphaned ═══ */}
        <h2 className="mb-3 mt-14 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          हिंदी में पूरा हस्त रेखा हब
        </h2>
        <p className="mb-6 leading-relaxed">
          नीचे अठारह विस्तृत लेख हैं — हर रेखा, हर पर्वत और हर चिह्न पर अलग, हिंदी में। जो सवाल आपके मन में है,
          उसका पूरा जवाब उसी लेख में मिलेगा।
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200" style={{ borderColor: 'rgba(212,175,55,0.25)' }}>
              छह रेखाएँ
            </h3>
            <HubList items={HUB_HINDI_LINES} />
          </div>
          <div>
            <h3 className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200" style={{ borderColor: 'rgba(212,175,55,0.25)' }}>
              चिह्न
            </h3>
            <HubList items={HUB_HINDI_SIGNS} />
          </div>
          <div>
            <h3 className="mb-3 border-b pb-2 font-serif text-base font-bold text-slate-200" style={{ borderColor: 'rgba(212,175,55,0.25)' }}>
              संरचना और सच
            </h3>
            <HubList items={HUB_HINDI_STRUCTURE} />
          </div>
        </div>

        {/* ═══ v2.0: PDF LEAD MAGNET — real file at public/hast-rekha-gyan-guide.pdf ═══ */}
        <div
          className="mt-14 rounded-2xl p-6 md:p-8"
          style={{ background: 'rgba(212,175,55,0.08)', border: '2px solid rgba(212,175,55,0.4)' }}
        >
          <h2 className="mb-3 font-serif text-2xl font-bold" style={{ color: GOLD }}>
            संपूर्ण हस्त रेखा ज्ञान — मुफ्त PDF डाउनलोड
          </h2>
          <p className="mb-4 leading-relaxed">
            पाँच पन्नों की पूरी मार्गदर्शिका — <strong>दो चित्र</strong> (छह रेखाएँ और सात पर्वत, हिंदी में लेबल किए हुए),
            हर रेखा का ईमानदार अर्थ, चिह्नों की तालिका जिसमें <em>प्रचलित डर</em> और <em>ईमानदार अर्थ</em> अलग-अलग दिए हैं,
            हाथ पढ़ने की छह-चरण विधि, और वह सूची जो हस्त रेखा <strong>नहीं</strong> बता सकती।
          </p>
          <p className="mb-5 text-sm text-slate-400">
            कोई ईमेल नहीं, कोई साइनअप नहीं, कोई शुल्क नहीं। यह मार्गदर्शिका साझा की जा सकती है — बेचने के लिए नहीं।
          </p>
          <a
            href="/hast-rekha-gyan-guide.pdf"
            download
            className="inline-block rounded-xl px-7 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:brightness-110"
            style={{ background: GOLD }}
          >
            PDF डाउनलोड करें (मुफ्त) →
          </a>
        </div>

        {/* ═══ v2.0: HINDI CONTENT SECTIONS ═══ */}
        {HINDI_SECTIONS.map((sec) => (
          <section key={sec.id} id={sec.id} className="scroll-mt-24">
            <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
              {sec.h2}
            </h2>
            {sec.paras.map((p, i) => (
              <p key={i} className="mb-4 leading-relaxed">
                {renderHi(p, `${sec.id}-${i}`)}
              </p>
            ))}
          </section>
        ))}

        {/* ── WHEN THE PALM IS THE WRONG TOOL ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          When the palm is the wrong instrument
        </h2>
        <p className="mb-4 leading-relaxed">
          We would rather tell you this than take your money for the wrong thing. If your question is{' '}
          <em>when</em> — when will I marry, when will the job come, when does this phase end — the palm cannot
          answer it. That is a birth chart question and it needs your birth time. For marriage, the ₹51 report
          does this for you when you add your birth time and place — from your Kundali, not your palm. For
          everything else on timing:
        </p>
        <ul className="mb-4 space-y-2 text-[15px]">
          <li>
            <Link href="/calculators/free-janam-kundali-calculator" className="text-amber-300 underline underline-offset-4">
              Free Kundali Calculator
            </Link>{' '}
            — for timing, Dasha and the actual structure of your chart.
          </li>
          <li>
            <Link href="/kundali-milan" className="text-amber-300 underline underline-offset-4">
              Kundali Milan
            </Link>{' '}
            — for assessing a specific match. Palmistry reads one hand; it cannot compare two people.
          </li>
          <li>
            <Link href="/calculators/free-gemstone-suitability-calculator" className="text-amber-300 underline underline-offset-4">
              Gemstone Suitability Calculator
            </Link>{' '}
            — before you ever wear a stone, and never on the strength of a palm mark.
          </li>
          <li>
            <Link href="/calculators" className="text-amber-300 underline underline-offset-4">
              All free calculators
            </Link>
          </li>
        </ul>

        {/* ── LOCAL (IR-0b) ── */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-bold" style={{ color: GOLD }}>
          Palm reading in India — and everywhere else
        </h2>
        <p className="mb-4 leading-relaxed">
          Trikaal Vaani is based in <strong>Dwarka, New Delhi</strong>, and a large share of the people who use
          this calculator arrive searching for a <em>palmist near me</em> in Delhi, Noida, Gurgaon or Ghaziabad
          — usually late at night, usually after seeing something on their hand that worried them.
        </p>
        <p className="mb-4 leading-relaxed">
          You do not need to travel, book a slot, or sit across a table from someone quietly deciding how much
          you can afford. The reading is the same classical Samudrika Shastra whether you are in Dwarka, Noida
          Sector 62, Gurgaon, Ghaziabad, Mumbai, Bengaluru or Dubai. One photograph, ₹51, and a report you keep.
        </p>
        <p className="mb-6 leading-relaxed">
          And if your report says something you do not like, read it as a description of{' '}
          <strong>current conditions</strong>, not a sentence passed on your life. The secondary lines of the
          hand change measurably over a lifetime. Yours have already changed. They will change again.{' '}
          <strong>A mark that can vanish was never a fate.</strong>
        </p>

        <div className="mt-10 text-center">
          <Link
            href="#top"
            className="inline-block rounded-xl px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg transition hover:brightness-110"
            style={{ background: GOLD }}
          >
            Read my palm — ₹51 →
          </Link>
          <p className="mt-2 text-xs text-slate-500">
            One photo · Birth time optional · Photo not stored unless you opt in · No puja, no gemstone, no second sitting
          </p>
        </div>
      </section>
    </>
  );
}
