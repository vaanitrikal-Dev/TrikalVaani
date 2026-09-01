// 🔱 TRIKAAL VAANI | app/swapna/page.tsx | v2.0
// ----------------------------------------------------------------------------
// CHANGE v2.0 (2026-08-31) — Hindi layer + the 62-post blog cluster
//   BASELINE 31 Aug 2026: 1,149 words, 7 H2, 306 Devanagari characters. The
//   page linked to 26 /swapna/ routes but to ZERO of the 62 Swapna blog posts
//   in Supabase (31 English + 31 Hindi) — including
//   swapna-shastra-sapne-ka-matlab-hindi, titled "स्वप्न शास्त्र: सपनों का
//   वैदिक अर्थ गाइड", which is the exact match for the Radar Part 5 rank-20
//   keyword "स्वप्न शास्त्र सपनों का अर्थ". The cluster was never weak; this
//   hub was cut off from it. Same pattern as the palmistry, property and
//   foreign-spouse pages.
//   1. HI_SECTIONS — 5 new Devanagari H2 blocks:
//        • स्वप्न शास्त्र — सपनों का अर्थ कैसे निकाला जाता है   [Part 5, rank 20]
//        • शुभ सपना या अशुभ — पहचान कैसे करें
//        • सबसे ज़्यादा देखे जाने वाले सपने और उनके अर्थ
//        • एक ही सपना, दो लोगों के लिए दो अर्थ — ऐसा क्यों
//        • स्वप्न शास्त्र क्या नहीं बता सकता
//      Devanagari on page: 306 -> ~5,600.
//   2. BLOG_HI / BLOG_EN — 36 cluster links in two columns.
//      Every href verified against the live sitemap on 31 Aug 2026.
//   3. UNCHANGED: metadata, the jsonLd object and its plain <script> emission
//      (already correct here — no next/script bug on this page), SwapnaClient,
//      COMMON_DREAMS, REALMS, SOURCES, FAQS and every existing section.
// ----------------------------------------------------------------------------
// Owner: Rohiit Gupta, Chief Vedic Architect
// Swapna Shastra — Vedic Dream Decoding hub (server component / SEO body)
// ----------------------------------------------------------------------------
// Pattern matches app/page.tsx: server component owns metadata + JSON-LD + all
// static SEO/GEO/AEO/EEAT content; the interactive funnel lives in the client
// component <SwapnaClient/> (app/swapna/SwapnaClient.tsx).
// Free reading = table meaning (Flash). Paid ₹51 = chart overlay (Component 6).
// ----------------------------------------------------------------------------

import type { Metadata } from 'next';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import SwapnaClient from './SwapnaClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Swapna Shastra | Free Vedic Dream Meaning & Interpretation — Trikaal Vaani',
  description:
    "Free Vedic dream interpretation (Swapna Shastra). Decode your dream's symbol instantly, then unlock a personal reading against your birth chart & dasha. By Rohiit Gupta, Chief Vedic Architect.",
  keywords: [
    'swapna shastra', 'dream meaning in hindi', 'vedic dream interpretation',
    'sapne ka matlab', 'saap ka sapna', 'dream astrology', 'swapna phal',
  ],
  alternates: {
    canonical: 'https://trikalvaani.com/swapna',
    languages: {
      'en-IN': 'https://trikalvaani.com/swapna',
      'hi-IN': 'https://trikalvaani.com/hi/swapna',
    },
  },
  openGraph: {
    title: 'Swapna Shastra | Free Vedic Dream Meaning & Interpretation — Trikaal Vaani',
    description:
      "Decode your dream's classical meaning free, then read it against your own birth chart & planetary period. Guided by Rohiit Gupta, Chief Vedic Architect.",
    url: 'https://trikalvaani.com/swapna',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikaal Vaani',
    images: [
      {
        url: 'https://trikalvaani.com/og-swapna.jpg',
        width: 1200,
        height: 630,
        alt: 'Swapna Shastra — Vedic Dream Decoding by Trikaal Vaani',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swapna Shastra | Free Vedic Dream Meaning — Trikaal Vaani',
    description:
      "Decode your dream's classical meaning free, then read it against your own chart & dasha.",
    images: ['https://trikalvaani.com/og-swapna.jpg'],
  },
};

// ── brand palette (matches app/page.tsx) ────────────────────────────────────
const C = {
  night: '#080B12',
  panel: 'rgba(11,16,26,0.7)',
  panel2: '#0E141F',
  gold: '#D4AF37',
  goldDeep: '#A8820A',
  goldLite: '#F0D68A',
  goldSoft: 'rgba(212,175,55,0.55)',
  line: 'rgba(212,175,55,0.14)',
  line2: 'rgba(212,175,55,0.26)',
  s3: '#CBD5E1',
  s4: '#94A3B8',
  s5: '#64748B',
};

// ── data ────────────────────────────────────────────────────────────────────
const COMMON_DREAMS = [
  { href: '/swapna/snake', ic: '🐍', en: 'Snake', hn: 'साँप का सपना' },
  { href: '/swapna/water', ic: '🌊', en: 'Water', hn: 'पानी का सपना' },
  { href: '/swapna/teeth', ic: '🦷', en: 'Teeth falling', hn: 'दाँत टूटना' },
  { href: '/swapna/own_death', ic: '🕯️', en: 'Death', hn: 'मृत्यु का सपना' },
  { href: '/swapna/deceased_relative', ic: '👤', en: 'A deceased loved one', hn: 'मृत स्वजन' },
  { href: '/swapna/falling', ic: '🌀', en: 'Falling', hn: 'गिरना' },
  { href: '/swapna/gold', ic: '🪙', en: 'Gold', hn: 'सोना' },
  { href: '/swapna/deity_general', ic: '🛕', en: 'A deity', hn: 'भगवान के दर्शन' },
  { href: '/swapna/wedding', ic: '💍', en: 'A wedding', hn: 'शादी का सपना' },
  { href: '/swapna/flying', ic: '🕊️', en: 'Flying', hn: 'उड़ना' },
  { href: '/swapna/pregnancy', ic: '🤰', en: 'Pregnancy', hn: 'गर्भ का सपना' },
  { href: '/swapna/fire', ic: '🔥', en: 'Fire', hn: 'आग का सपना' },
];

const REALMS = [
  { href: '/swapna/category/snake', label: '🐍 Serpents', hn: 'सर्प' },
  { href: '/swapna/category/death', label: '🕯️ Death & ancestors', hn: 'मृत्यु' },
  { href: '/swapna/category/deity', label: '🛕 Deities', hn: 'देवता' },
  { href: '/swapna/category/water', label: '🌊 Water', hn: 'जल' },
  { href: '/swapna/category/body', label: '🧍 The body', hn: 'शरीर' },
  { href: '/swapna/category/animal', label: '🦌 Animals', hn: 'पशु' },
  { href: '/swapna/category/conflict', label: '⚔️ Conflict', hn: 'संघर्ष' },
  { href: '/swapna/category/life_event', label: '💍 Life events', hn: 'जीवन-घटनाएँ' },
  { href: '/swapna/category/celestial', label: '☀️ Sky & elements', hn: 'आकाश' },
  { href: '/swapna/category/food', label: '🍚 Food', hn: 'भोजन' },
  { href: '/swapna/category/sexual', label: '❤️ Intimacy', hn: 'निकटता' },
  { href: '/swapna/category/bodily_function', label: '💧 Body signs', hn: 'शारीरिक' },
];

const SOURCES = [
  { t: 'Svapna Cintāmaṇi', d: 'Jagaddeva — the canonical treatise on dream interpretation.' },
  { t: 'Bṛhat Jātaka', d: 'Varāhamihira — dreams read against the individual\'s chart & dasha.' },
  { t: 'Agni & Matsya Purāṇa', d: 'Classical svapna-adhyāyas on auspicious & inauspicious dreams.' },
  { t: 'Atharvaveda · Sushruta', d: 'Vedic dream hymns and the Āyurvedic classification of dreams.' },
];

const FAQS = [
  { q: 'Are dreams really meaningful in Vedic astrology?', a: 'Yes. Texts like the Svapna Cintāmaṇi and passages in the Agni and Matsya Purāṇas treat dreams as symbolic signals, with meaning further shaped by the dreamer\'s own chart and planetary period.' },
  { q: 'Is the free dream meaning accurate?', a: 'The free reading gives the authentic classical meaning of your dream\'s symbol, straight from the tradition — the universal meaning, true for anyone who dreams it.' },
  { q: 'What does the ₹51 personal reading add?', a: 'It reads your dream against your own birth chart — your running dasha, any linked yoga or dosha, and the exact life-area it touches — with a remedy shaped to you. That is the part no free tool can give.' },
  { q: 'Do I need my birth details for the free reading?', a: 'No. The free dream meaning needs only your dream. Birth details (name, date, time, place) are asked only if you choose the ₹51 personal reading.' },
  { q: 'What does it mean to see a snake in a dream?', a: 'In Swapna Shastra a snake often signals a hidden matter or concealed adversary, though a bite can be auspicious and a snake entering the home can point to wealth. The exact reading depends on colour, action and your chart.' },
  { q: 'Why do some dreams come true and others don\'t?', a: 'The tradition weighs the hour of the dream. A dream in the Brahma-muhurta before dawn is considered the most telling; a dream in the early night is held to be lighter.' },
  { q: 'Is my dream and my data private?', a: 'Yes. Your dream is read instantly and privately, with no sign-up required for the free meaning.' },
  { q: 'Who interprets the dreams on Trikaal Vaani?', a: 'Every meaning is traced to a classical source and validated by Rohiit Gupta, Chief Vedic Architect, with sixteen years in the Parashara BPHS tradition — then read against a Swiss Ephemeris chart.' },
];

// ── JSON-LD ──────────────────────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Swapna Shastra — Vedic Dream Meaning & Interpretation',
      url: 'https://trikalvaani.com/swapna',
      inLanguage: ['en-IN', 'hi-IN'],
      about: { '@type': 'Thing', name: 'Vedic dream interpretation (Swapna Shastra)' },
      isPartOf: { '@type': 'WebSite', name: 'Trikaal Vaani', url: 'https://trikalvaani.com' },
    },
    {
      '@type': 'Person',
      name: 'Rohiit Gupta',
      jobTitle: 'Chief Vedic Architect',
      knowsAbout: ['Vedic Astrology', 'Swapna Shastra', 'Parashara BPHS', 'Jyotish'],
      worksFor: { '@type': 'Organization', name: 'Trikaal Vaani' },
    },
    { '@type': 'Organization', name: 'Trikaal Vaani', url: 'https://trikalvaani.com' },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
        { '@type': 'ListItem', position: 2, name: 'Swapna Shastra', item: 'https://trikalvaani.com/swapna' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

// ── page ─────────────────────────────────────────────────────────────────────
// ── v2.0 Hindi content + blog cluster ───────────────────────────────────────
// Radar Part 5 target: "स्वप्न शास्त्र सपनों का अर्थ" at rank 20.
// The page had 306 Devanagari characters and linked to 26 /swapna/ routes but
// to ZERO of the 62 Swapna blog posts sitting in Supabase (31 EN + 31 HI) —
// including swapna-shastra-sapne-ka-matlab-hindi, whose title is the exact
// match for the rank-20 keyword. Same orphaned-cluster pattern found on the
// palmistry, property and foreign-spouse pages.
type SwSection = { id: string; h2: string; paras: string[] };

const HI_SECTIONS: SwSection[] = [
  {
    id: 'sapno-ka-arth',
    h2: 'स्वप्न शास्त्र — सपनों का अर्थ कैसे निकाला जाता है',
    paras: [
      '**स्वप्न शास्त्र** भारत की वह परंपरा है जिसमें सपनों को संयोग नहीं, संकेत माना जाता है। इसका आधार **स्वप्न चिंतामणि** (जगद्देव) और पुराणों के स्वप्न-अध्याय हैं, जहाँ सैकड़ों प्रतीकों के अर्थ दर्ज हैं। पर असली विधि वह नहीं है जो अधिकांश वेबसाइटें बताती हैं — वहाँ सिर्फ शब्दकोश होता है, शास्त्र नहीं।',
      'शास्त्रीय विधि में **तीन चीजें साथ** देखी जाती हैं। **पहला, प्रतीक** — सपने में क्या दिखा, और परंपरा में उसका क्या अर्थ है। **दूसरा, आपकी कुंडली** — वही प्रतीक अलग-अलग लोगों के लिए अलग अर्थ रखता है, क्योंकि उसे आपकी चल रही महादशा और भावों के अनुसार पढ़ा जाता है। **तीसरा, समय** — किस प्रहर में सपना आया।',
      'यही तीसरा हिस्सा सबसे ज्यादा छोड़ा जाता है और सबसे ज्यादा मायने रखता है। परंपरा में **ब्रह्म मुहूर्त** (भोर से ठीक पहले) का सपना सबसे स्पष्ट माना जाता है, और रात के पहले प्रहर का सपना सबसे कम। पूरी विधि [स्वप्न शास्त्र — सपनों का वैदिक अर्थ गाइड](/blog/swapna-shastra-sapne-ka-matlab-hindi) में है, और प्रहर का गणित [सपने का सही समय — ब्रह्म मुहूर्त](/blog/sapne-ka-sahi-samay-brahma-muhurat-astrology) में।',
    ],
  },
  {
    id: 'shubh-ashubh',
    h2: 'शुभ सपना या अशुभ — पहचान कैसे करें',
    paras: [
      'यह सबसे ज्यादा पूछा जाने वाला सवाल है, और इसका जवाब उतना सीधा नहीं जितना लोग चाहते हैं। परंपरा में **कोई सपना अपने आप में अशुभ नहीं होता** — अशुभ वह होता है जो किसी बाधा की ओर इशारा करे, और इशारा चेतावनी है, दंड नहीं।',
      'मोटे तौर पर परंपरा में **शुभ** माने जाते हैं: देवी-देवताओं के दर्शन, बहता साफ पानी, सोना, फल-फूल, हाथी, गाय, और मंदिर। **सावधानी के संकेत** माने जाते हैं: गंदा या रुका हुआ पानी, दाँत गिरना, पीछा किया जाना, और आग का बेकाबू होना। पर यहीं एक ज़रूरी पलटाव है — **मृत्यु का सपना परंपरा में अशुभ नहीं माना जाता।** वह अक्सर किसी पुराने चरण के अंत और नए के आरंभ का संकेत होता है, और यही वह बात है जिससे सबसे ज्यादा लोग बेवजह डरते हैं।',
      'दूसरा नियम जो डर कम करता है: **दोहराव मायने रखता है।** एक बार आया सपना अक्सर दिन भर के विचारों का असर होता है; **बार-बार आने वाला सपना** ही संकेत माना जाता है। पूरी पहचान-सूची [शुभ या अशुभ सपना? पूरी पहचान गाइड](/blog/shubh-ashubh-sapne-ka-matlab-vedic-jyotish) में है।',
    ],
  },
  {
    id: 'sabse-common-sapne',
    h2: 'सबसे ज़्यादा देखे जाने वाले सपने और उनके अर्थ',
    paras: [
      '**साँप** सबसे ज़्यादा खोजा जाने वाला सपना है, और सबसे ज़्यादा गलत समझा जाने वाला भी। परंपरा में साँप कुंडलिनी, गुप्त शक्ति और छिपे हुए शत्रु — तीनों का प्रतीक है, और कौन सा अर्थ लागू होगा यह इस पर निर्भर करता है कि साँप ने क्या किया: [सपने में साँप देखना](/blog/sapne-mein-saanp-dekhna-ka-matlab)।',
      '**मृत स्वजन का दिखना** दूसरा सबसे आम है और सबसे ज़्यादा भावुक। यहाँ शास्त्र बहुत विशिष्ट है — **वे क्या कर रहे थे यह मायने रखता है**: कुछ माँग रहे थे, कुछ दे रहे थे, चुप थे, या नाराज़ थे। हर स्थिति का अलग अर्थ है, और यह [सपने में मृत रिश्तेदार की हरकत](/blog/sapne-mein-mrit-vyakti-ka-kaam-ka-matlab) में खोला गया है। **दाँत गिरना** तीसरा है — इसे परंपरा में परिवार और प्रतिष्ठा से जोड़ा जाता है, न कि किसी की मृत्यु से, जो सबसे आम डर है: [सपने में दाँत गिरना](/blog/sapne-mein-daant-girna-ka-matlab)।',
      'बाकी अक्सर पूछे जाने वाले: [पानी, नदी, गंगा](/blog/sapne-mein-pani-nadi-ganga-dekhne-ka-matlab) · [मृत्यु देखना](/blog/sapne-mein-mrityu-dekhna-ka-matlab) · [गणेश, लक्ष्मी, शिव](/blog/sapne-mein-ganesh-lakshmi-shiv-dekhne-ka-matlab) · [पैसा या सोना](/blog/sapne-mein-paisa-sona-dekhne-ka-matlab) · [पीछा किया जाना](/blog/sapne-mein-peecha-kiya-jana-ka-matlab) · [शादी, सगाई, तलाक़](/blog/sapne-mein-shaadi-sagai-talaaq-ka-matlab) · [गर्भावस्था या बच्चा](/blog/sapne-mein-garbhavastha-bacha-dekhne-ka-matlab)।',
    ],
  },
  {
    id: 'kundali-se-farak',
    h2: 'एक ही सपना, दो लोगों के लिए दो अर्थ — ऐसा क्यों',
    paras: [
      'यह इस पूरे पेज की सबसे ज़रूरी बात है, और वही है जो शब्दकोश और शास्त्र में फर्क करती है। **प्रतीक का अर्थ स्थिर है, पर उसका असर आपकी कुंडली से तय होता है।**',
      'एक उदाहरण से साफ हो जाएगा। सपने में **पानी** — परंपरा में यह मन, भावना और चंद्रमा से जुड़ा है। अब अगर किसी की **चंद्र दशा** चल रही है, तो वही सपना भावनात्मक उथल-पुथल की ओर इशारा करता है। अगर किसी के **चौथे भाव** से जुड़ी दशा चल रही है, तो वही पानी घर, माता और स्थिरता की ओर इशारा करता है। **प्रतीक एक, अर्थ दो** — क्योंकि पढ़ने वाला आकाश अलग है।',
      'इसीलिए ऊपर वाला मुफ्त टूल आपको **शास्त्रीय अर्थ** देता है, और वह अपने आप में उपयोगी है। पर जब सवाल यह हो कि *मेरे लिए* इसका क्या मतलब है, तो उसके लिए जन्म कुंडली और चल रही दशा चाहिए — यही ₹51 वाली रीडिंग करती है। और अगर आपका सवाल सपने का नहीं बल्कि जीवन की दिशा का है, तो [कार्मिक बैकग्राउंड रीडिंग](/karmic-background-reading) ज़्यादा सही औज़ार है।',
    ],
  },
  {
    id: 'prahar-samay',
    h2: 'सपना किस समय आया — प्रहर का नियम',
    paras: [
      'यह वह हिस्सा है जो लगभग हर मुफ्त वेबसाइट छोड़ देती है, और शास्त्र में यह प्रतीक जितना ही ज़रूरी है। **रात को चार प्रहरों में बाँटा गया है**, और परंपरा में माना जाता है कि जैसे-जैसे रात आगे बढ़ती है, सपने का संकेत उतना ही स्पष्ट होता जाता है।',
      '**पहला प्रहर** (लगभग रात 9 से 12) — इस समय के सपने को सबसे कम महत्व दिया जाता है, क्योंकि इसे दिन भर के विचारों और थकान का असर माना जाता है। **दूसरा और तीसरा प्रहर** — संकेत धीरे-धीरे स्पष्ट होता है। **चौथा प्रहर, यानी ब्रह्म मुहूर्त** (भोर से ठीक पहले) — यही वह समय है जिसे परंपरा में सबसे स्पष्ट और सबसे शीघ्र फल देने वाला माना जाता है।',
      'व्यावहारिक अर्थ यह है कि **वही सपना, अलग समय पर, अलग वज़न रखता है।** रात 10 बजे आया साँप का सपना और भोर 4 बजे आया साँप का सपना — प्रतीक एक है, पर शास्त्र दूसरे को कहीं ज़्यादा गंभीरता से लेता है। इसीलिए सपना याद रखने की सबसे उपयोगी आदत यह है कि जागते ही यह भी नोट कर लें कि **लगभग कितना समय था**। पूरा प्रहर-गणित [सपने का सही समय — ब्रह्म मुहूर्त](/blog/sapne-ka-sahi-samay-brahma-muhurat-astrology) में है।',
    ],
  },
  {
    id: 'sapna-kaise-yaad-rakhein',
    h2: 'सपना कैसे याद रखें — और क्या-क्या नोट करें',
    paras: [
      'रीडिंग की गुणवत्ता इस पर टिकी है कि आपको सपना कितना याद है। और सपना भूलना आम है — जागने के कुछ ही मिनटों में अधिकांश विवरण चला जाता है। इसलिए एक सरल आदत सबसे ज़्यादा काम आती है: **जागते ही, उठने से पहले, कुछ शब्द लिख लीजिए।** फोन पर भी चलेगा।',
      'पाँच चीजें नोट करना काफी है। **एक — मुख्य प्रतीक:** क्या दिखा (साँप, पानी, कोई व्यक्ति)। **दो — उसकी क्रिया:** वह क्या कर रहा था; यह प्रतीक जितना ही ज़रूरी है, विशेषकर मृत स्वजन के सपनों में। **तीन — आपकी भावना:** डर, शांति, दुख या तटस्थता — शास्त्र में सपने में महसूस हुआ भाव संकेत का हिस्सा है। **चार — समय:** लगभग कितने बजे। **पाँच — दोहराव:** यह सपना पहली बार आया या पहले भी आ चुका है।',
      'और एक छूट जो राहत देती है: **पूरा सपना याद होना ज़रूरी नहीं।** अक्सर एक स्पष्ट प्रतीक और उससे जुड़ी भावना ही पढ़ने के लिए पर्याप्त होती है। अधूरा याद है, इसलिए मत छोड़िए — ऊपर वाले टूल में जितना याद है उतना डाल दीजिए, वह शास्त्रीय अर्थ वहीं दे देगा।',
    ],
  },
  {
    id: 'kya-nahi-bata-sakta',
    h2: 'स्वप्न शास्त्र क्या नहीं बता सकता',
    paras: [
      'यह सूची इसलिए है क्योंकि इसी जगह सबसे ज़्यादा डर बेचा जाता है। सपने से **नहीं** निकाला जा सकता: किसी की **मृत्यु का समय**, कोई **तारीख**, परीक्षा का परिणाम, या कोई ऐसी घटना जो अभी घटी ही नहीं। जो कोई सपना सुनकर तुरंत तारीख बता दे, वह अनुमान बेच रहा है।',
      'और वह बात जो सबसे ज़्यादा राहत देती है: **बुरा सपना कोई शाप नहीं है, और उसका कोई महँगा उपाय नहीं होता।** परंपरा में अशुभ स्वप्न के उपाय अत्यंत सरल हैं — प्रातः स्नान, इष्ट का स्मरण, और किसी को सपना बता देना। बस इतना। इसके लिए हज़ारों रुपये की पूजा माँगना शास्त्र नहीं, बाज़ार है।',
      'अंत में एक व्यावहारिक बात: **हर सपना संकेत नहीं होता।** शास्त्र स्वयं मानता है कि दिन भर की चिंता, भोजन, बीमारी और थकान से आए सपने अर्थहीन होते हैं — इन्हें अलग श्रेणी में रखा गया है। संकेत वह है जो **स्पष्ट हो, याद रहे, और दोहराए**। बाकी को छोड़ देना ही सही है।',
    ],
  },
];

type SwLink = { href: string; label: string; note: string };

const BLOG_HI: SwLink[] = [
  { href: '/blog/swapna-shastra-sapne-ka-matlab-hindi', label: 'स्वप्न शास्त्र — पूरा गाइड', note: 'यहाँ से शुरू करें' },
  { href: '/blog/shubh-ashubh-sapne-ka-matlab-vedic-jyotish', label: 'शुभ या अशुभ सपना?', note: 'पहचान की पूरी सूची' },
  { href: '/blog/sapne-ka-sahi-samay-brahma-muhurat-astrology', label: 'सपने का सही समय', note: 'ब्रह्म मुहूर्त और प्रहर' },
  { href: '/blog/sapne-mein-saanp-dekhna-ka-matlab', label: 'सपने में साँप', note: 'सबसे ज़्यादा खोजा गया' },
  { href: '/blog/sapne-mein-mrit-vyakti-ka-kaam-ka-matlab', label: 'मृत रिश्तेदार की हरकत', note: 'वे क्या कर रहे थे — यही अर्थ है' },
  { href: '/blog/sapne-mein-mrityu-dekhna-ka-matlab', label: 'सपने में मृत्यु', note: 'यह अशुभ नहीं होता' },
  { href: '/blog/sapne-mein-daant-girna-ka-matlab', label: 'सपने में दाँत गिरना', note: 'परिवार और प्रतिष्ठा' },
  { href: '/blog/sapne-mein-pani-nadi-ganga-dekhne-ka-matlab', label: 'पानी, नदी, गंगा', note: 'मन और चंद्रमा' },
  { href: '/blog/sapne-mein-ganesh-lakshmi-shiv-dekhne-ka-matlab', label: 'गणेश, लक्ष्मी, शिव', note: 'देव-दर्शन का अर्थ' },
  { href: '/blog/sapne-mein-paisa-sona-dekhne-ka-matlab', label: 'पैसा या सोना', note: 'हमेशा धन नहीं' },
  { href: '/blog/sapne-mein-peecha-kiya-jana-ka-matlab', label: 'पीछा किया जाना', note: 'किससे भाग रहे हैं' },
  { href: '/blog/sapne-mein-pariksha-naukri-career-ka-matlab', label: 'परीक्षा, नौकरी, करियर', note: 'दशम भाव का संकेत' },
  { href: '/blog/sapne-mein-shaadi-sagai-talaaq-ka-matlab', label: 'शादी, सगाई, तलाक़', note: 'सप्तम भाव' },
  { href: '/blog/sapne-mein-garbhavastha-bacha-dekhne-ka-matlab', label: 'गर्भावस्था या बच्चा', note: 'पंचम भाव' },
  { href: '/blog/sapne-mein-ghar-makan-dekhne-ka-matlab', label: 'घर या मकान', note: 'चतुर्थ भाव' },
  { href: '/blog/sapne-mein-videsh-jana-videshi-shaadi-ka-matlab', label: 'विदेश या विदेशी शादी', note: 'द्वादश भाव' },
  { href: '/blog/sapne-mein-awaaz-na-nikalna-hil-na-pana-ka-matlab', label: 'हिल न पाना, चिल्ला न पाना', note: 'सबसे डरावना, सबसे कम अशुभ' },
  { href: '/blog/swapna-shastra-near-me-online-hindi', label: 'स्वप्न शास्त्र मेरे पास', note: 'ऑनलाइन व्याख्या' },
];

const BLOG_EN: SwLink[] = [
  { href: '/blog/swapna-shastra-vedic-dream-interpretation-guide', label: 'Swapna Shastra — the full guide', note: 'The pillar' },
  { href: '/blog/shubh-ashubh-dream-meaning-vedic-astrology', label: 'Shubh or ashubh?', note: 'How to tell' },
  { href: '/blog/dream-timing-brahma-muhurat-astrology', label: 'Dream timing', note: 'Why the hour changes the meaning' },
  { href: '/blog/snake-in-dream-meaning-hindu-astrology', label: 'Snake in a dream', note: 'Three meanings, not one' },
  { href: '/blog/dead-relative-dream-actions-meaning-astrology', label: 'A deceased relative', note: 'What their action means' },
  { href: '/blog/death-in-dream-meaning-hindu-astrology', label: 'Death in a dream', note: 'Not the omen you fear' },
  { href: '/blog/water-dreams-meaning-hindu-astrology', label: 'Water dreams', note: 'River, Ganga, flood' },
  { href: '/blog/deity-dreams-meaning-hindu-astrology', label: 'Deity dreams', note: 'Ganesha, Shiva, Lakshmi' },
  { href: '/blog/teeth-falling-out-dream-meaning-vedic-astrology', label: 'Teeth falling out', note: 'Family and standing' },
  { href: '/blog/being-chased-dream-meaning-vedic-astrology', label: 'Being chased', note: 'What you are avoiding' },
  { href: '/blog/money-gold-dream-meaning-vedic-astrology', label: 'Money or gold', note: 'Rarely about money' },
  { href: '/blog/exam-job-career-dream-meaning-vedic-astrology', label: 'Exam, job, career', note: '10th house signals' },
  { href: '/blog/marriage-wedding-dream-meaning-vedic-astrology', label: 'Marriage or wedding', note: '7th house' },
  { href: '/blog/pregnancy-baby-dream-meaning-vedic-astrology', label: 'Pregnancy or baby', note: '5th house' },
  { href: '/blog/house-home-dream-meaning-vedic-astrology', label: 'House or home', note: '4th house' },
  { href: '/blog/body-dreams-meaning-hindu-astrology', label: 'Falling, flying, naked', note: 'Body dreams' },
  { href: '/blog/unable-to-move-speak-scream-dream-meaning-vedic-astrology', label: 'Unable to move or scream', note: 'The most frightening one' },
  { href: '/blog/swapna-shastra-near-me-online', label: 'Swapna Shastra near me', note: 'Reading online' },
];

function SwRich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <a key={`${k}-l-${i}`} href={link[2]} className="font-medium underline underline-offset-2" style={{ color: C.gold }}>
              {link[1]}
            </a>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <b key={`${k}-b-${i}`} className="font-medium text-white">{part.slice(2, -2)}</b>;
        }
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

function SwBlogCol({ items }: { items: SwLink[] }) {
  return (
    <ul className="space-y-2 m-0 p-0" style={{ listStyle: 'none' }}>
      {items.map((i) => (
        <li key={i.href}>
          <a href={i.href} className="block rounded-xl px-3 py-2 transition-colors hover:bg-white/5">
            <span className="block text-[0.92rem] font-medium" style={{ color: C.gold }}>{i.label}</span>
            <span className="block text-[0.8rem]" style={{ color: C.s5 }}>{i.note}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function SwapnaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen" style={{ background: C.night, color: '#fff' }}>
        <SiteNav />
        <main>

          {/* ── HERO + interactive funnel ─────────────────────────────── */}
          <section className="px-4 pt-14 pb-6">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[11.5px] font-bold uppercase mb-6" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>
                स्वप्न शास्त्र <span style={{ color: C.s5 }}>✦</span> Vedic Dream Decoding
              </p>
              <h1 className="font-serif font-medium leading-[1.06] text-white" style={{ fontSize: 'clamp(2.4rem,6vw,4.2rem)' }}>
                Every night, your mind writes in{' '}
                <em className="not-italic" style={{ fontStyle: 'italic', color: C.gold }}>symbols</em>.
                Tonight, let it be read.
              </h1>
              <p className="mt-4 font-serif" style={{ fontSize: 'clamp(1.05rem,3vw,1.5rem)', color: C.s4 }} lang="hi">
                हर रात आपका मन प्रतीकों में लिखता है — आज उसे पढ़ा जाए।
              </p>
              {/* GEO 40–60 word direct answer */}
              <p className="mt-6 max-w-2xl mx-auto text-[1.02rem] leading-relaxed" style={{ color: C.s3 }}>
                In Vedic tradition, a dream is never noise — every symbol carries meaning refined across millennia in
                texts like the <b className="text-white font-medium">Svapna Cintāmaṇi</b> and the Purāṇas. Trikaal Vaani
                decodes your dream&apos;s symbol instantly and <b className="text-white font-medium">free</b>, then reads
                it against your own birth chart and planetary period — decoded under Rohiit Gupta, Chief Vedic Architect.
              </p>
            </div>

            {/* interactive dream box → result → paywall */}
            <div id="try">
              <SwapnaClient />
            </div>
          </section>

          {/* ── HOW IT WORKS (authority / GEO / EEAT) ─────────────────── */}
          <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>The Method</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>
                How a dream is read in the Vedic way
              </h2>
              <p className="text-center mx-auto mt-3 max-w-xl text-[1rem]" style={{ color: C.s4 }}>
                Not a dictionary. Three forces decide what your dream means — this is why a personal reading differs from a generic one.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-9">
                {[
                  { n: '01 · The Symbol', h: 'The image', p: 'Every dream image holds a fixed classical meaning, recorded over millennia in the Svapna Cintāmaṇi and Purāṇas.', hi: 'हर प्रतीक का एक शास्त्रीय अर्थ है।' },
                  { n: '02 · The Chart', h: 'Your sky', p: 'That universal meaning bends to your birth chart and the Mahadasha you are walking — the same dream means different things to different people.', hi: 'वह अर्थ आपकी कुंडली और दशा से आकार लेता है।' },
                  { n: '03 · The Hour', h: 'The prahar', p: 'When you dreamt it matters. A dream in the Brahma-muhurta, the hour before dawn, speaks with the clearest voice.', hi: 'स्वप्न का समय भी मायने रखता है।' },
                ].map((x) => (
                  <div key={x.n} className="rounded-[18px] p-6" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                    <p className="text-[11px] font-semibold uppercase mb-3" style={{ letterSpacing: '0.2em', color: C.gold }}>{x.n}</p>
                    <h3 className="font-serif text-2xl text-white mb-2">{x.h}</h3>
                    <p className="text-[0.95rem]" style={{ color: C.s4 }}>{x.p}</p>
                    <span className="block mt-2 font-serif text-[0.9rem]" style={{ color: C.s5 }} lang="hi">{x.hi}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── COMMON DREAMS (internal-link hub) ─────────────────────── */}
          <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Most-Searched</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>Common dreams, decoded</h2>
              <p className="text-center mx-auto mt-3 max-w-xl text-[1rem]" style={{ color: C.s4 }}>
                Tap any dream for its classical meaning — then read it against your own chart.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-9">
                {COMMON_DREAMS.map((d) => (
                  <a key={d.href} href={d.href} className="rounded-2xl p-5 text-center transition-transform duration-200 hover:-translate-y-1"
                    style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                    <div className="text-[34px]">{d.ic}</div>
                    <div className="font-serif text-lg text-white mt-2.5">{d.en}</div>
                    <div className="font-serif text-[0.92rem] mt-0.5" style={{ color: C.goldSoft }} lang="hi">{d.hn}</div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ── 12 REALMS ─────────────────────────────────────────────── */}
          <section className="px-4 pb-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>The Full Map</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>The twelve realms of dreams</h2>
              <p className="text-center mx-auto mt-3 max-w-xl text-[1rem]" style={{ color: C.s4 }}>
                Every dream lives in one of these families — 192 symbols and counting, each traced to a classical source.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 mt-8">
                {REALMS.map((r) => (
                  <a key={r.href} href={r.href} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.9rem]"
                    style={{ background: C.panel, border: `1px solid ${C.line}`, color: C.s3 }}>
                    {r.label} <span className="font-serif text-[0.85rem]" style={{ color: C.goldSoft }} lang="hi">{r.hn}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ── EEAT: author + sources ────────────────────────────────── */}
          <section className="px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Authority</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>Read by a real tradition, not a generator</h2>

              <div className="flex flex-col md:flex-row gap-6 items-center mt-9 rounded-[20px] p-7" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                <div className="w-[88px] h-[88px] rounded-full flex-shrink-0 flex items-center justify-center text-[34px]"
                  style={{ border: `2px solid ${C.line2}`, background: 'radial-gradient(circle at 50% 35%, #1a2230, #0b101a)', color: C.gold }}>🔱</div>
                <div className="text-center md:text-left">
                  <div className="font-serif text-2xl text-white">Rohiit Gupta</div>
                  <div className="text-[12px] uppercase my-1.5" style={{ letterSpacing: '0.15em', color: C.goldSoft }}>Chief Vedic Architect · Trikaal Vaani</div>
                  <p className="text-[0.96rem]" style={{ color: C.s4 }}>
                    Sixteen years of personal practice in the Parashara BPHS tradition. Every dream meaning on Trikaal Vaani
                    is traced to a classical source and validated by hand — never invented, never auto-generated. Charts are
                    computed on astronomical-grade Swiss Ephemeris.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {SOURCES.map((s) => (
                  <div key={s.t} className="rounded-[14px] p-4" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
                    <div className="font-serif text-lg" style={{ color: C.gold }}>{s.t}</div>
                    <div className="text-[0.86rem] mt-0.5" style={{ color: C.s5 }}>{s.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── POSITIONING ───────────────────────────────────────────── */}
          <section className="px-4 pb-16">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Why Trikaal</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>A dictionary vs your own sky</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-9">
                <div className="rounded-[18px] p-6" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
                  <h4 className="font-serif text-xl mb-3.5" style={{ color: C.s3 }}>A generic dream app or chatbot</h4>
                  <ul className="space-y-1.5">
                    {['One meaning, the same for everyone', 'No idea who you are or when you were born', 'Guesses, often invented, no source', 'No remedy that fits your life'].map((t) => (
                      <li key={t} className="text-[0.94rem] pl-6 relative" style={{ color: C.s4 }}>
                        <span className="absolute left-0" style={{ color: C.s5 }}>—</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[18px] p-6" style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))', border: `1px solid ${C.line2}` }}>
                  <h4 className="font-serif text-xl mb-3.5" style={{ color: C.gold }}>Trikaal Vaani</h4>
                  <ul className="space-y-1.5">
                    {['Classical meaning traced to a named text', 'Read against your birth chart & running dasha', 'Validated by a practising astrologer', 'A remedy shaped to your own chart'].map((t) => (
                      <li key={t} className="text-[0.94rem] pl-6 relative text-white">
                        <span className="absolute left-0" style={{ color: C.gold }}>✦</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── v2.0: HINDI SECTIONS (Radar Part 5, rank 20) ─────────── */}
          <section className="px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>हिंदी में</p>
              {HI_SECTIONS.map((sec) => (
                <div key={sec.id} id={sec.id} className="scroll-mt-24 mt-10 first:mt-6">
                  <h2 className="font-serif font-medium text-white" style={{ fontSize: 'clamp(1.5rem,3.6vw,2.1rem)' }} lang="hi">
                    {sec.h2}
                  </h2>
                  {sec.paras.map((p, i) => (
                    <p key={i} className="mt-3 text-[1rem] leading-relaxed" style={{ color: C.s4 }} lang="hi">
                      <SwRich text={p} k={`${sec.id}-${i}`} />
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* ── v2.0: the 62-post blog cluster this hub was cut off from ── */}
          <section className="px-4 py-16">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Read Deeper</p>
              <h2 className="font-serif font-medium text-center text-white mt-3" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>
                हर सपने पर विस्तृत लेख
              </h2>
              <p className="text-center mx-auto mt-3 max-w-xl text-[1rem]" style={{ color: C.s4 }}>
                Every major dream symbol has its own full guide — in Hindi and in English.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-9">
                <div>
                  <h3 className="font-serif text-xl text-white mb-3 pb-2" style={{ borderBottom: `1px solid ${C.line}` }} lang="hi">हिंदी में</h3>
                  <SwBlogCol items={BLOG_HI} />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white mb-3 pb-2" style={{ borderBottom: `1px solid ${C.line}` }}>In English</h3>
                  <SwBlogCol items={BLOG_EN} />
                </div>
              </div>
            </div>
          </section>

          {/* ── FAQ (AEO) ─────────────────────────────────────────────── */}
          <section className="px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <p className="text-center text-[11.5px] font-bold uppercase" style={{ letterSpacing: '0.4em', color: C.goldSoft }}>Questions, Answered</p>
              <h2 className="font-serif font-medium text-center text-white mt-3 mb-8" style={{ fontSize: 'clamp(1.8rem,4.2vw,2.6rem)' }}>Swapna Shastra FAQ</h2>
              <div>
                {FAQS.map((f, i) => (
                  <div key={i} className="py-5" style={{ borderTop: `1px solid ${C.line}`, borderBottom: i === FAQS.length - 1 ? `1px solid ${C.line}` : undefined }}>
                    <div className="font-serif text-xl" style={{ color: C.gold }}>{f.q}</div>
                    <div className="mt-2 text-[0.97rem]" style={{ color: C.s4 }}>{f.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA BAND ──────────────────────────────────────────────── */}
          <section className="px-4 pb-20">
            <div className="max-w-4xl mx-auto text-center rounded-[24px] px-8 py-11"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03))', border: `1px solid ${C.line2}` }}>
              <h2 className="font-serif font-medium text-white" style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)' }}>Your dream is still speaking.</h2>
              <p className="mx-auto mt-3 max-w-lg" style={{ color: C.s4 }}>Decode its meaning free — then see what it means in your own stars.</p>
              <a href="#try" className="inline-flex items-center gap-2 mt-6 px-8 py-4 rounded-full text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, color: '#100B02', boxShadow: '0 10px 30px rgba(168,130,10,0.35)' }}>
                Read my dream →
              </a>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  );
}

// ============================================================================
// END — app/swapna/page.tsx v1.0 · 🔱 Trikaal Vaani
// ============================================================================
