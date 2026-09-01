// ═══════════════════════════════════════════════════════════════
// app/hast-rekha-calculator/page.tsx
// AI HAST REKHA CALCULATOR — money page (server component)
// Version: v2.0
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
    absolute: 'AI Hast Rekha Calculator — Palm Reading by Samudrika Shastra (₹51) | Trikaal Vaani',
  },
  description:
    'Upload one palm photo and get a classical Samudrika Shastra reading — all 6 lines and all 7 mounts, 8 life scores, personalised remedies and a PDF report. ₹51. No birth time needed. We will not tell you when you will die, and there is no puja to buy afterwards.',
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
      'One palm photo. 6 lines, 7 mounts, 8 life scores, remedies and a PDF report. ₹51. No birth time. No puja to buy afterwards.',
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
    description: 'Upload a palm photo → classical Samudrika Shastra reading. PDF report ₹51. No birth time needed.',
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
    a: 'Trikaal Vaani ka AI calculator 6 mukhya rekhaen — Jeevan Rekha, Mastishk Rekha, Hriday Rekha, Bhagya Rekha, Surya Rekha aur Vivah Rekha — aur 7 parvat (Guru, Shani, Surya, Budh, Shukra, Mangal, Chandra) ka vishleshan karta hai. Mangal ke do kshetra hote hain, lekin parvat ek hi mana jaata hai.',
  },
  {
    q: 'AI palm reading kitni accurate hoti hai?',
    a: 'Hum koi accuracy percentage ka daava nahi karte — jo bhi aisa daava kare, wo aapko sach nahi bata raha. Hamara engine sirf wahi padhta hai jo photo mein dikhta hai, aur us par Samudrika Shastra ke shastriya niyam lagata hai. Achhi daylight photo se reading behtar hoti hai, dhundhli photo se kamzor. Hum rekhaen bana nahi dete jo hain hi nahi. Aur ek cheez engine insaan se behtar karta hai: wo aapka chehra dekh hi nahi sakta, isliye aapko khush karne ke liye reading badal nahi sakta.',
  },
  {
    q: 'Hast Rekha report mein kya milega?',
    a: '8 dimension scores (career, dhan, swasthya, rishtey, urja, netritva, srijanshakti, adhyatma), haath ka Samudrika parichay, 6 rekhaon aur 7 parvaton ka vishleshan, har nishan uske parvat ke sandarbh mein, vyaktigat Samudrika upay, aur ek downloadable PDF report — Hindi, English ya Hinglish mein.',
  },
  {
    q: 'Kaun sa haath upload karein — seedha ya ulta?',
    a: 'Apna DOMINANT haath upload karein — yaani jis haath se aap likhte hain. Form mein aap select kar sakte hain ki aap right-handed hain ya left-handed, aur upload labels apne aap sahi ho jaate hain. Agar aap left-handed hain toh baaya haath hi pradhan hai, chahe purani "purush ka daya haath" wali reet kuch bhi kahe. Dominant haath dikhata hai jo aapne banaya; non-dominant dikhata hai jo aapko mila. Dono upload karein toh unke beech ka farak bhi padha jaata hai — aur asli reading wahi hai.',
  },
  {
    q: 'Kya meri palm image save hoti hai?',
    a: 'Aapki photo sirf analysis ke liye process hoti hai. Analysis ke liye photo hamare secure server par jaati hai, lekin hum use apne database ya storage mein save nahi karte — humne apna system check karke ye confirm kiya hai. Sirf aapki report aur PDF save hoti hai, taaki aap use dobara paa sakein. Photo bechna, share karna ya training ke liye use karna — kuch nahi hota.',
  },
  {
    q: 'Kya aap bata sakte hain ki meri shaadi kab hogi, ya main kitne saal jiyunga?',
    a: 'Nahi — aur koi imaandaar reader bhi nahi bata sakta. Hatheli par koi tareekh nahi likhi hoti. Chaalis saal ki zindagi ko ek centimetre chamdi par map karke saal batana maapna nahi, natak hai. Chhoti Jeevan Rekha ka matlab chhoti umr bilkul nahi hota — ye jhooth bharat mein sabse zyada bikta hai aur sabse zyada darr failata hai. Timing ka sahi auzaar Kundali hai, hatheli nahi.',
  },
  {
    q: 'हाथ की रेखा कैसे देखें — शुरुआत कहाँ से करें?',
    a: 'Kram yeh hai: prakritik roshni mein baithiye, dono hatheliyan kholiye halke mod ke saath. Pehle nishkriya haath dekhiye (jisse aap nahi likhte) — yeh janmajaat pravritti hai. Phir sakriya haath, aur DONO KE ANTAR ko notice kijiye — asli reading wahi hai. Uske baad chhe mukhya rekhaayein pehchaniye, phir haath mod kar saat parvaton ka ubhaar dekhiye. Sabse zaroori: rekha aur parvat SAATH padhiye, akele nahi.',
  },
  {
    q: 'एआई हस्तरेखा कैसे काम करती है?',
    a: 'AI koi bhavishyavani karne wali machine nahi hai. Engine wahi karta hai jo ek anubhavi paathak aankh se karta hai: photo mein rekhaon ki disha, gehrai, lambai, toot aur shaakhaayein pehchanta hai, parvaton ka ubhaar aankta hai, chihnon ka sthan tay karta hai — phir un par Samudrika Shastra ke shastriya niyam lagata hai. Machine ek cheez mein sachmuch behtar hai: wo aapka chehra dekh hi nahi sakti, isliye aapko khush karne ya darane ke liye reading badal nahi sakti.',
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
      'एक ईमानदार बात जो हमारे ही व्यापार के खिलाफ जाती है: **धुँधली फोटो से रीडिंग कमजोर आएगी।** हम वे रेखाएँ बना नहीं देते जो दिख नहीं रहीं। अगर फोटो ठीक नहीं है तो दोबारा लीजिए — यह पूरी प्रक्रिया की सबसे बड़ी कड़ी है, और [AI कहाँ बेहतर है और कहाँ नहीं](/blog/ai-hast-rekha-reading-online) यह अलग से पढ़ने लायक है।',
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
      'पूरी प्रक्रिया तीन कदम की है और दो मिनट से कम लेती है। **एक:** ऊपर फॉर्म में अपना प्रधान हाथ चुनिए — जिससे आप लिखते हैं। बाएँ हाथ वाले हैं तो बायाँ चुनिए; लेबल अपने आप बदल जाते हैं। **दो:** हथेली की फोटो अपलोड कीजिए, ऊपर बताए फोटो-नियमों के साथ। **तीन:** रिपोर्ट बन जाती है और PDF के रूप में आपके पास रहती है।',
      'रिपोर्ट में क्या मिलता है: **आठ जीवन-क्षेत्रों के स्कोर** (करियर, धन, स्वास्थ्य, रिश्ते, ऊर्जा, नेतृत्व, सृजनशक्ति, अध्यात्म), **छह रेखाओं** और **सात पर्वतों** का विश्लेषण, हर चिह्न उसके पर्वत के संदर्भ में, और व्यक्तिगत समुद्रिक उपाय — हिंदी, अंग्रेज़ी या हिंग्लिश में, जो आप चुनें।',
      'फोटो का क्या होता है, यह भी साफ जान लीजिए: **तस्वीर विश्लेषण के लिए हमारे सर्वर पर जाती है, पर हमारे डेटाबेस या स्टोरेज में सेव नहीं होती** — केवल आपकी रिपोर्ट सेव होती है ताकि आप उसे दोबारा पा सकें। न बेची जाती है, न साझा, न ट्रेनिंग के लिए इस्तेमाल।',
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
                  'AI-powered Indian palmistry calculator using computer vision for hand landmark detection, palm line extraction and Samudrika Shastra rule-based analysis. Personalised Hast Rekha reports in Hindi, English and Hinglish.',
                url: PAGE_URL,
                applicationCategory: 'LifestyleApplication',
                operatingSystem: 'Web, iOS, Android',
                inLanguage: ['hi-IN', 'en-IN'],
                isPartOf: { '@id': 'https://trikalvaani.com/#website' },
                offers: { '@id': `${PAGE_URL}#offer` },
                featureList: [
                  'AI 21-point hand landmark detection',
                  'Palm line extraction — 6 lines and 7 mounts',
                  'Samudrika Shastra rule engine (40+ niyam)',
                  'Every sign read against the mount that carries it',
                  'Dominant-hand reading with left-handed support',
                  '8 life dimension scores',
                  'Personalised classical remedies',
                  'Downloadable PDF report',
                  'No birth time, birth date or birth place required',
                  'Palm photo processed for analysis only — never saved to our database or storage',
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
                  'A classical Samudrika Shastra palm reading generated from a single palm photograph — 6 lines, 7 mounts, 8 life scores, personalised remedies and a downloadable PDF report. No birth time required.',
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
                  'Full Samudrika Shastra Hast Rekha report with PDF — 8 life dimension scores, 6 line and 7 mount analysis, personalised remedies. One photo. No birth time. Photo processed for analysis only, never saved. No puja, gemstone or follow-up sitting sold afterwards.',
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
            The AI Hast Rekha Calculator reads your palm from a single photograph and applies classical
            Samudrika Shastra rules to what it finds — all six major lines and all seven mounts. You receive
            eight life scores, a full classical interpretation, personalised remedies and a downloadable PDF
            report, for ₹51. No birth time, no birth date and no birth place are required.
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
            <strong className="text-amber-300">All six major lines.</strong> Jeevan Rekha (life line), Mastishk
            Rekha (head line), Hriday Rekha (heart line), Bhagya Rekha (fate line), Surya Rekha (sun line) and
            the Vivah Rekha (marriage lines) — each read against the others, never in isolation. A fate line
            means one thing beside a strong sun line and something completely different without one.
          </li>
          <li>
            <strong className="text-amber-300">All seven mounts.</strong> Guru (Jupiter), Shani (Saturn), Surya
            (Sun), Budh (Mercury), Shukra (Venus), Mangal (Mars) and Chandra (Moon). The mounts supply the
            qualities; the lines only describe what is being done with them. Most readings skip the mounts
            entirely — which is precisely why most readings tell you nothing you can use.
          </li>
          <li>
            <strong className="text-amber-300">Every sign, read against the mount that carries it.</strong> A
            star on the Surya Parvat indicates sudden elevation. The same star on the Shani Parvat is
            classically read as a shock. Same symbol, opposite meaning. Placement decides everything, and any
            reading that names a symbol without naming the mount has deleted the shastra.
          </li>
          <li>
            <strong className="text-amber-300">Eight life dimension scores</strong> — career, wealth, health,
            relationships, vitality, leadership, creativity and spirituality.
          </li>
          <li>
            <strong className="text-amber-300">Personalised classical remedies</strong> drawn from the
            Samudrika corpus. Not a generic list. Not a shopping list.
          </li>
          <li>
            <strong className="text-amber-300">A downloadable PDF report</strong> that is yours to keep, in
            Hindi, English or Hinglish.
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
          <p className="mt-2 text-xs text-slate-500">One photo · No birth time · No subscription</p>
        </div>

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
            <strong className="text-rose-300">We will never give you a date.</strong> Not a wedding date, not a
            job date. You cannot map forty years of adult life onto a centimetre of skin. Timing is a birth
            chart question — the 7th house, its lord, the Dasha sequence. That is what Jyotish is for, and we
            would rather send you there than sell you a number.
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
          Why an AI reading — and where it is genuinely worse
        </h2>
        <p className="mb-4 leading-relaxed">We will make the case against ourselves first, because you deserve that.</p>
        <p className="mb-4 leading-relaxed">
          A skilled palmist has one real advantage over any photograph: they can <strong>press your mounts</strong>.
          A mount cannot be assessed by looking at it — it has to be touched. A full <em>spongy</em> Shukra
          Parvat and a full <em>firm</em> one mean opposite things: indulgence versus warmth. Elevation
          photographs well; firmness does not. Skin texture and palm flexibility photograph poorly too. If you
          have access to a genuinely skilled, non-commercial palmist, use them.
        </p>
        <p className="mb-4 leading-relaxed">
          Most people in this country do not. What they have access to is a market with a powerful incentive to
          frighten them.
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
            <strong className="text-amber-300">1. Photograph your dominant hand.</strong> The hand you write
            with — if you are left-handed, that is your left hand, regardless of the old
            &ldquo;right-for-men&rdquo; convention, which is a reading-order tradition and not a difference in
            meaning. Tell the form which hand you write with and the upload labels adjust themselves. The
            dominant hand shows what you built. The non-dominant shows what you were given. Upload
            both if you can: <strong>the difference between them is the reading</strong>, and almost nobody
            performs it.
          </li>
          <li>
            <strong className="text-amber-300">2. Daylight. No flash.</strong> Flash floods the palm and erases
            the fine lines completely — including every marriage line and every small sign. Stand near a
            window. Keep the palm flat and open, fingers slightly apart, camera straight above rather than
            angled, frame filled from wrist to fingertips. Then zoom in and check: if <em>you</em> cannot see
            the fine lines, neither can the engine.
          </li>
          <li>
            <strong className="text-amber-300">3. Upload and pay ₹51.</strong> The engine detects the lines,
            mounts and signs, applies the classical rules, and returns your report with a downloadable PDF.
            Your photo is processed for the analysis only — we never save it to our database or storage, and
            we have verified our own system to confirm this. Only your report and PDF are kept, so you can
            retrieve them again.
          </li>
        </ol>
        <p className="mb-4 leading-relaxed">
          Photo quality is the single largest variable in the accuracy of your reading. Not the engine —{' '}
          <strong>the photo</strong>. That one sentence will improve your result more than anything else on
          this page.
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
            The rules this engine applies are not invented. They are drawn from the classical corpus:{' '}
            <strong>Samudrika Shastra</strong>, the <strong>Hasta Sanjeevani</strong>, the Hast Rekha khand of
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
          answer it, and neither can we. That is a birth chart question and it needs your birth time.
        </p>
        <ul className="mb-4 space-y-2 text-[15px]">
          <li>
            <Link href="/calculators/free-kundali-calculator" className="text-amber-300 underline underline-offset-4">
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
            One photo · No birth time · Photo never saved to our database · No puja, no gemstone, no second sitting
          </p>
        </div>
      </section>
    </>
  );
}
