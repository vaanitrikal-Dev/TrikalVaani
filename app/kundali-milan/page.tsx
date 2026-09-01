// TRIKAL VAANI | app/kundali-milan/page.tsx | v2.0 (31 Aug 2026)
// v2.0: depth + Hindi + cluster interlinking on the money page.
//   BASELINE measured live 31 Aug: 1,260 words, 5 H2, 26 links, and 27
//   Devanagari characters on a page whose entire audience searches in Hindi.
//   Competitors on this cluster, from radar.pages the same day: Bavishyavani
//   3,068 words / 187 links / 19 H2; Clickastro 2,987 / 248 / 30; Astro Vedica
//   five pages averaging ~2,300. This page was the thinnest of them.
//   ORPHANED CLUSTER, the same finding as the palmistry, property, foreign-
//   spouse and swapna pages: 25 marriage blog posts, 8 /learn/ references and
//   144 /compatibility/ rashi-pair pages exist and rank — and this money page
//   linked to NONE of them (0 compatibility links, 0 blog links).
//   1. KM_SECTIONS — 8 Devanagari H2 blocks from radar.keywords.
//   2. KM_HUB — 16 cluster links; KM_PAIRS — 12 verified rashi-pair pages.
//   3. Devanagari 27 -> ~7,800. Links 26 -> 54.
//   KEYWORD SOURCE CAVEAT, stated because it is weaker than the Part 5 pages:
//   these keywords are radar.keywords seed_v2 entries (clusters compat-milan,
//   compat-marriage-timing, compat-rashi-pairs, dosha-mangal), NOT observed
//   PAA/PASF data. /kundali-milan was not in the Radar E3 content brief and is
//   not one of the nine Part 5 rank-11-20 targets.
//   UNCHANGED: the form, all three JSON-LD blocks and their plain <script>
//   emission (already correct — no next/script bug here), IntlPrice, the tier
//   cards, pricing, the Vivah Muhurat banner and every v1.1-v1.4 fix.
//
// v1.4 (29 Aug 2026)
// v1.4: the four visible prices on the tier cards now follow the visitor's
//   country via <IntlPrice>. This page is a SERVER component, so it cannot run
//   the geo check itself; a foreign reader was seeing Rs101 here and $12 at
//   checkout. Metadata, JSON-LD and the FAQ text stay in rupees on purpose —
//   those are indexed for the primary Indian market.
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-06-25
// ============================================================================
// v1.3 CHANGES (interlink — page only, FORM UNTOUCHED):
//   ✅ Added Vivah Muhurat interlink banner after the "What's Included" tier
//      section — natural funnel: once a couple confirms compatibility, the next
//      step is choosing the wedding date. Links to /vivah-muhurat (year-dynamic).
//      No form/schema/pricing change. IR-13 + IR-19 respected.
//
// v1.2 CHANGES (CEO conversion audit — page only, FORM UNTOUCHED):
//   ✅ FIX-1: Tier cards CTA → #milan-form. FIX-2: closing CTA. FIX-3: ₹ symbol.
//   ✅ FIX-4: Service + OfferCatalog JSON-LD (Free/₹51/₹101/₹151).
//
// IRON RULES OBSERVED:
//   - IR-13: KundaliMilanForm v1.0 LOCKED (not modified, only anchor-wrapped)
//   - IR-19: Pricing locked Free/Rs51/Rs101/Rs151
//   - IR-22: PDF + WA/Email/Link sharing as first-class
// ============================================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import KundaliMilanForm from '@/components/landing/KundaliMilanForm'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import IntlPrice from '@/components/payment/IntlPrice'

export const metadata: Metadata = {
  title: 'Kundali Milan - Free 36 Guna Matching & Vedic Compatibility | Trikaal Vaani',
  description:
    'Free Kundali Milan with 36 Guna Ashtakoot, Mangal Dosh, Nadi Dosh check. Rs51 Basic Milan, Rs101 Deep Milan with Dos, Donts & 6 personalized remedies. By Rohiit Gupta, Chief Vedic Architect, India. Swiss Ephemeris + BPHS classical rules.',
  keywords: 'kundali matching, kundli milan, 36 guna milan, free kundali matching, ashtakoot, mangal dosh, nadi dosh, vedic compatibility, marriage matching, jyotish milan',
  alternates: {
    canonical: 'https://trikalvaani.com/kundali-milan',
    languages: {
      'en-IN': 'https://trikalvaani.com/kundali-milan',
      'hi-IN': 'https://trikalvaani.com/hi/kundali-milan',
    },
  },
  openGraph: {
    title: 'Kundali Milan - Free 36 Guna Matching & Vedic Compatibility | Trikaal Vaani',
    description:
      'Free Kundali Milan with 36 Guna Ashtakoot, Mangal Dosh, Nadi Dosh check. Deep Rs101 readings with personalized remedies by Rohiit Gupta.',
    url: 'https://trikalvaani.com/kundali-milan',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Trikaal Vaani',
    images: [{
      url: 'https://trikalvaani.com/og-kundali-milan.jpg',
      width: 1200, height: 630,
      alt: 'Trikaal Vaani Kundali Milan - Free 36 Guna Matching',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kundali Milan - Free 36 Guna Matching | Trikaal Vaani',
    description: 'Free Kundali Milan with 36 Guna, Mangal Dosh, Nadi Dosh. Deep Rs101 readings with remedies.',
    images: ['https://trikalvaani.com/og-kundali-milan.jpg'],
  },
}

const GOLD = '#D4AF37'
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://trikalvaani.com/kundali-milan#faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Kundali Milan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Kundali Milan is the Vedic compatibility analysis between two birth charts using the 36 Guna Ashtakoot system. It computes all 8 koots - Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi - plus Mangal Dosh, Nadi Dosh, and Bhakoot Dosh to determine marriage compatibility.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a good Guna score for marriage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Guna score of 18 or above out of 36 is traditionally considered acceptable for marriage. Scores of 24-36 indicate excellent compatibility. Below 18 suggests significant differences but does not necessarily mean the marriage will fail - many couples with low scores have successful marriages with proper remedies.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can we marry with Mangal Dosh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Mangal Dosh marriages are common and successful. The dosh is neutralized when both partners are Manglik, or when classical exception rules apply (Mars in own sign, certain aspects, after age 28). Trikaal Vaani applies all BPHS cancellation rules during analysis.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if Nadi Dosh is present?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nadi Dosh occurs when both partners share the same Nadi (Aadi, Madhya, or Antya). It traditionally indicates health and progeny concerns. However, multiple cancellation rules exist - same rashi but different nakshatra, same nakshatra but different padas. Personalized remedies are provided in the Rs101 Deep Milan tier.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Trikaal Vaani Kundali Milan work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Enter both partners birth details (date, time, place). Trikaal computes both kundalis using Swiss Ephemeris precision, then matches all 8 Ashtakoot koots, checks Mangal, Nadi, and Bhakoot Dosh, and generates a personalized report. Choose Couple, Parent, or Both narrative styles for Rs101-151.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Basic Rs51 and Deep Rs101 Milan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Basic Rs51 Milan includes full 36 Guna breakdown, all dosha analysis, and compatibility verdict. Deep Rs101 Milan adds personalized Dos and Donts, 6 ritual remedies (mantra, daan, vrat, ratna, pooja, muhurat), Dashakoot analysis, Navamsa D9 chart comparison, and audience-specific narrative (Couple or Parent version).',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get the Kundali Milan report in Hindi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Trikal Vaani offers three language options - Hinglish (Hindi-English mix, default for couples), Pure Hindi (for parent/family version, Sanskrit shloka references included), and English. Choose during the form fill before payment.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is online Kundali Milan reliable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Trikaal Vaani uses the same Swiss Ephemeris engine used by professional astrologers worldwide, validated against Brihat Parashara Hora Shastra (BPHS) classical sutras. Every reading framework is designed by Rohiit Gupta, Chief Vedic Architect with 15+ years of Vedic study under the Parashara tradition.',
      },
    },
    {
      '@type': 'Question',
      name: 'What remedies are provided for low Guna score?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Rs101 Deep Milan tier provides 6 personalized remedies based on detected doshas - specific mantras with count and timing, daan items and recipients, fast days (vrat), gemstones with metal and finger guidance, pujas with location, and exact auspicious muhurat windows for marriage, engagement, and griha pravesh.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is Rohiit Gupta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rohiit Gupta is the Chief Vedic Architect and founder of Trikaal Vaani. He has 15+ years of Vedic astrology study under the Parashara BPHS tradition, is based in India, and personally designs every Kundali Milan reading framework that Trikaal AI applies to your charts.',
      },
    },
  ],
}

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://trikalvaani.com/services' },
    { '@type': 'ListItem', position: 3, name: 'Kundali Milan', item: 'https://trikalvaani.com/kundali-milan' },
  ],
}

// ── v1.2 FIX-4: Service + OfferCatalog schema — AI search extracts pricing
//    (IR-19 prices exact: Free / ₹51 / ₹101 / ₹151) ──────────────────────────
const MILAN_SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': 'https://trikalvaani.com/kundali-milan#service',
  name: 'Trikaal Vaani Kundali Milan',
  serviceType: '36 Guna Ashtakoot Vedic Compatibility Matching',
  url: 'https://trikalvaani.com/kundali-milan',
  provider: {
    '@type': 'Organization',
    '@id': 'https://trikalvaani.com/#organization',
    name: 'Trikaal Vaani',
    url: 'https://trikalvaani.com',
  },
  areaServed: { '@type': 'Country', name: 'India' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Kundali Milan Plans',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Free Milan Preview',
        description: '36 Guna numeric score, dosha flags, emotional teaser',
        price: '0', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Basic Milan',
        description: 'Full 36 Guna breakdown, Mangal + Nadi + Bhakoot analysis, compatibility verdict, PDF download, WhatsApp and Email share',
        price: '51', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Deep Milan',
        description: 'Everything in Basic plus Couple or Parent narrative, personalized Dos and Donts, 6 ritual remedies, Navamsa D9, Dashakoot, auspicious muhurat windows',
        price: '101', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Deep Milan — Both Narratives',
        description: 'Deep Milan with both Couple and Parent narrative versions',
        price: '151', priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    ],
  },
}

// ── v2.0 content ─────────────────────────────────────────────────────────────
// KEYWORD SOURCE, stated plainly because it differs from the calculator pages:
// these are NOT Radar E3 PAA/PASF keywords — /kundali-milan was never in the
// E3 content brief and is not one of the nine Part 5 targets. They come from
// radar.keywords, clusters compat-milan / compat-marriage-timing /
// compat-rashi-pairs / dosha-mangal, all P1 or P0, source seed_v2. Seeds are a
// weaker signal than observed SERP data, so treat the ranking upside here as
// less certain than on the Part 5 pages.
//
// COMPETITIVE BENCHMARK from radar.pages (same crawl):
//   Bavishyavani  3,068 words · 187 internal links · 19 H2
//   Clickastro    2,987 words · 248 internal links · 30 H2
//   Astro Vedica  ~2,300 words · 53 links · 11 H2  (five pages on this cluster)
//   /kundali-milan (live 31 Aug)  1,260 words · 26 links · 5 H2 · 27 Devanagari
// This build targets the top of that range on depth, and beats all of them on
// honesty — none of the competitor pages tell the reader that 36/36 is a
// warning sign or that name-only matching is not Ashtakoot.
type KmSection = { id: string; h2: string; paras: string[] };

const KM_SECTIONS: KmSection[] = [
  {
    id: 'naam-se-kundali-milan',
    h2: 'नाम से कुंडली मिलान — क्या यह सच में काम करता है?',
    paras: [
      'यह इस विषय का सबसे ज़्यादा खोजा जाने वाला सवाल है, और इसका ईमानदार जवाब वह नहीं है जो ज़्यादातर साइटें देती हैं। **सिर्फ नाम से असली अष्टकूट मिलान नहीं हो सकता।** कारण सीधा है: छत्तीसों गुण **चंद्र नक्षत्र** से निकलते हैं, और चंद्र नक्षत्र जन्म तिथि, सटीक जन्म समय और जन्म स्थान के बिना निकाला ही नहीं जा सकता।',
      'फिर नाम वाला तरीका चलता क्यों है? क्योंकि परंपरा में नाम **नक्षत्र के पाद के अक्षर** से रखा जाता था — हर नक्षत्र के चार पाद, हर पाद का एक निश्चित अक्षर, कुल 108। अगर नाम उसी परंपरा से रखा गया हो, तो पहला अक्षर नक्षत्र की ओर **इशारा** कर सकता है। पर यह उल्टी दिशा में चलना है, और **कई अक्षर एक से अधिक नक्षत्रों में आते हैं** — इसलिए जवाब एक नहीं, कई संभावनाएँ होती हैं।',
      'और आज की सबसे बड़ी समस्या: **अधिकांश आधुनिक नाम नक्षत्र देखकर रखे ही नहीं जाते।** ऐसे नाम से नक्षत्र निकालने का कोई अर्थ नहीं बचता। इसलिए हमारा तरीका साफ है — हम नाम से गुण नहीं गिनते। अगर आपके पास जन्म समय नहीं है, तो हम यह कहेंगे, न कि एक बना हुआ आँकड़ा दे देंगे। अक्षर और नक्षत्र का पूरा संबंध [नक्षत्र कैलकुलेटर](/calculators/free-nakshatra-calculator) पर देखा जा सकता है, जो नाम-अक्षर भी गणना करके देता है।',
    ],
  },
  {
    id: 'gun-kitne-hone-chahiye',
    h2: 'गुण मिलान कितने होने चाहिए — और 36/36 क्यों अच्छा संकेत नहीं है',
    paras: [
      'प्रचलित नियम यह है: **18 से कम गुण — विवाह की सलाह नहीं; 18 से 24 — स्वीकार्य; 25 से 32 — बहुत अच्छा; 32 से ऊपर — उत्कृष्ट।** यह सही है, पर अधूरा है, और अधूरा होना यहाँ महँगा पड़ता है।',
      'पहली बात जो कम बताई जाती है: **कुल अंक से ज़्यादा यह मायने रखता है कि अंक कहाँ से आए।** नाड़ी कूट अकेले **8 अंक** का है और भकूट **7** का — यानी इन दोनों से ही 15 अंक बनते हैं। कोई जोड़ी 20 गुण पा सकती है जिसमें नाड़ी के पूरे 8 हों, और दूसरी 22 पा सकती है जिसमें नाड़ी शून्य हो। **दूसरी जोड़ी का अंक ज़्यादा है, पर स्थिति कमजोर है** — क्योंकि नाड़ी दोष अष्टकूट का सबसे भारी दोष माना जाता है। सिर्फ कुल देखकर फैसला करना यही गलती है।',
      'दूसरी बात, जो लगभग कोई नहीं कहता: **36 में से 36 आना आदर्श नहीं, बल्कि सोचने की बात है।** पूर्ण अंक का अर्थ है दोनों कुंडलियाँ लगभग एक जैसी हैं — वही स्वभाव, वही प्रवृत्ति, वही कमज़ोरियाँ। परंपरा में विवाह को पूरकता माना गया है, समानता नहीं; और व्यवहार में 36/36 वाली जोड़ियाँ अक्सर एक ही दिशा में गलती करती हैं क्योंकि दोनों में से कोई दूसरे को संतुलित नहीं कर पाता। **28 से 32 अंक, जिसमें नाड़ी और भकूट साफ हों**, व्यवहार में सबसे टिकाऊ माने जाते हैं। पूरा विभाजन [36 गुण मिलान समझाया गया](/blog/36-guna-milan-explained) में है।',
    ],
  },
  {
    id: 'kundli-match-kaise-kare',
    h2: 'Kundli Match Kaise Kare — पूरी विधि, चरण दर चरण',
    paras: [
      '**पहला कदम — दोनों के जन्म विवरण जुटाइए।** दोनों की जन्म तिथि, **सटीक जन्म समय** और जन्म स्थान। समय पर इतना ज़ोर इसलिए है क्योंकि चंद्रमा एक नक्षत्र लगभग सवा दिन में और एक पाद लगभग छह घंटे में पार करता है — कुछ घंटों की गलती नक्षत्र बदल देती है, और नक्षत्र बदलते ही आठों कूट के अंक बदल जाते हैं। जन्म समय अस्पताल के रिकॉर्ड या जन्म प्रमाणपत्र से लीजिए।',
      '**दूसरा कदम — अष्टकूट।** आठ कूट, कुल 36 अंक: वर्ण (1), वश्य (2), तारा (3), योनि (4), ग्रह मैत्री (5), गण (6), भकूट (7), नाड़ी (8)। ऊपर वाला टूल ये आठों गिनता है और हर कूट का अंक अलग दिखाता है — केवल कुल नहीं, क्योंकि जैसा ऊपर कहा, कुल अकेला भ्रामक है।',
      '**तीसरा कदम, और यही वह है जो अष्टकूट से बाहर है:** दोनों की कुंडलियों में **मांगलिक दोष**, **सप्तम भाव और उसका स्वामी**, और **नवमांश (D-9)** का आपसी मिलान। अष्टकूट केवल चंद्र नक्षत्र पर आधारित है — वह पूरी कुंडली नहीं देखता। इसीलिए 30 गुण वाली जोड़ी में भी एक तरफ प्रबल मांगलिक दोष हो सकता है, और अष्टकूट उसे पकड़ेगा ही नहीं। यही वजह है कि हमारी ₹101 और ₹151 वाली रीडिंग में ये तीनों अलग से देखे जाते हैं।',
    ],
  },
  {
    id: 'ashtakoot-aath-koot',
    h2: 'अष्टकूट के आठ कूट — कौन सा कितना भारी',
    paras: [
      'आठों कूट बराबर नहीं हैं, और यही बात निर्णय बदल देती है। भार इस क्रम में है: **नाड़ी 8, भकूट 7, गण 6, ग्रह मैत्री 5, योनि 4, तारा 3, वश्य 2, वर्ण 1।**',
      '**नाड़ी (8 अंक)** — तीन नाड़ी होती हैं: आदि, मध्य, अंत्य। दोनों की नाड़ी एक होने पर शून्य अंक मिलते हैं और इसे **नाड़ी दोष** कहा जाता है; परंपरा में इसे संतान और स्वास्थ्य से जोड़ा जाता है। पर एक ज़रूरी छूट भी शास्त्र में ही है: **यदि दोनों का जन्म नक्षत्र एक ही हो पर पाद अलग हों, या दोनों की राशि एक हो, तो नाड़ी दोष निष्प्रभावी माना जाता है।** यह छूट अक्सर छिपा ली जाती है क्योंकि दोष बताकर उपाय बेचना आसान है — विस्तार [नाड़ी दोष के उपाय](/blog/nadi-dosh-remedies) में है।',
      '**भकूट (7 अंक)** — दोनों की चंद्र राशियों के बीच की दूरी। 6-8, 9-5 और 2-12 की स्थिति में शून्य अंक मिलते हैं। यहाँ भी शास्त्रीय छूट है: **दोनों राशियों के स्वामी एक ही हों या आपस में मित्र हों, तो भकूट दोष रद्द माना जाता है** — [भकूट दोष समझाया गया](/blog/bhakoot-dosh-explained) देखिए। बाकी कूट — गण (स्वभाव: देव, मनुष्य, राक्षस), ग्रह मैत्री (राशि स्वामियों की मित्रता), योनि (प्राकृतिक अनुकूलता), तारा (जन्म नक्षत्र से गिनती), वश्य और वर्ण — कम भार के हैं और अकेले किसी विवाह को रोकने का आधार नहीं माने जाते।',
    ],
  },
  {
    id: 'manglik-milan',
    h2: 'मांगलिक और गैर-मांगलिक विवाह — अष्टकूट यह नहीं पकड़ता',
    paras: [
      'यह सबसे ज़रूरी चेतावनी है और इसे साफ कहना चाहिए: **36 गुण मिलान मांगलिक दोष नहीं देखता।** अष्टकूट पूरी तरह चंद्र नक्षत्र पर आधारित है; मांगलिक दोष मंगल की भाव-स्थिति से बनता है। इसलिए **30 गुण वाली जोड़ी में भी एक तरफ प्रबल मांगलिक दोष हो सकता है**, और गुण-पत्रक उसका कोई ज़िक्र नहीं करेगा।',
      'शास्त्रीय स्थिति यह है: मंगल का पहले, चौथे, सातवें, आठवें या बारहवें भाव में होना मांगलिक माना जाता है। पर **दोष की तीव्रता बहुत अलग-अलग होती है** — और यहीं सबसे ज़्यादा डर बेचा जाता है। कई शास्त्रीय अपवाद हैं: मंगल का अपनी या उच्च राशि में होना, गुरु की दृष्टि, और सबसे आम — **यदि दोनों पक्ष मांगलिक हों तो दोष परस्पर निरस्त माना जाता है।** मिथक और सच का अलगाव [मांगलिक मिथक](/blog/manglik-myths-hindi) में है, और [मांगलिक और गैर-मांगलिक विवाह](/blog/manglik-non-manglik-marriage-hindi) उसी सवाल को सीधे लेता है।',
      'व्यावहारिक सलाह: **मिलान से पहले दोनों का मांगलिक स्टेटस अलग से जाँच लीजिए** — [मांगलिक दोष कैलकुलेटर](/calculators/free-manglik-dosh-calculator) मुफ्त है और दो मिनट लेता है। अगर दोष निकले तो घबराइए नहीं; [मैं मांगलिक हूँ — अब क्या करूँ](/blog/i-am-manglik-what-to-do-hindi) में शास्त्रीय अपवाद और वास्तविक उपाय दोनों दिए हैं। सप्तम भाव में मंगल की विशेष स्थिति [सातवें भाव में मंगल दोष](/blog/mangal-dosh-7th-house-effects-hindi) में अलग से है।',
    ],
  },
  {
    id: 'online-free-milan',
    h2: 'कुंडली मिलान ऑनलाइन फ्री — और "फ्री" में क्या मिलता है',
    paras: [
      '**मुफ्त में क्या मिलता है:** आठों कूट के अलग-अलग अंक, कुल 36 में से स्कोर, नाड़ी और भकूट की स्थिति, और सीधा निष्कर्ष। इसके लिए न साइनअप चाहिए, न कार्ड। गणना **स्विस एफेमेरिस** और **लाहिड़ी अयनांश** से होती है — वही मानक जो पेशेवर सॉफ्टवेयर इस्तेमाल करते हैं।',
      '**पैसे में क्या जुड़ता है, और क्यों:** ₹51 वाली बेसिक रीडिंग अंकों की व्याख्या देती है। ₹101 वाली डीप रीडिंग वह जोड़ती है जो अष्टकूट में है ही नहीं — **दोनों का मांगलिक विश्लेषण, सप्तम भाव और उसका स्वामी, और नवमांश (D-9) का आपसी मिलान।** यही असली अंतर है, और यही कारण है कि केवल गुण-अंक देखकर लिया गया फैसला अधूरा होता है।',
      'और एक बात जो हम **नहीं** करते: कोई घबराहट पैदा करने वाला संदेश, कोई "आपकी कुंडली में गंभीर दोष है" वाला डर, कोई उलटी गिनती। अगर मिलान कमजोर है तो परिणाम सीधा कहता है कि कमजोर है — और साथ में यह भी कि कौन सा कूट कमजोर है और कोई शास्त्रीय छूट लागू होती है या नहीं। पूरी कीमत सूची [प्राइसिंग पेज](/pricing) पर है।',
    ],
  },
  {
    id: 'shaadi-kab-hogi',
    h2: 'शादी कब होगी — मिलान से यह पता नहीं चलता',
    paras: [
      'बहुत से लोग मिलान इसी उम्मीद से करते हैं, इसलिए साफ कर देना ज़रूरी है: **अष्टकूट समय नहीं बताता।** वह सिर्फ यह बताता है कि दो लोगों की अनुकूलता कैसी है। *कब* का जवाब बिल्कुल अलग जगह से आता है — **चल रही महादशा और अंतर्दशा**, सप्तमेश की स्थिति, और गोचर।',
      'परंपरा में विवाह से सबसे ज़्यादा जुड़ी दशाएँ हैं **शुक्र** (विवाह का नैसर्गिक कारक), **सप्तमेश की दशा**, और **गुरु का सप्तम भाव या चंद्र से गोचर**। अपनी चल रही दशा [दशा कैलकुलेटर](/calculators/free-dasha-calculator) से मुफ्त देखी जा सकती है, और शुक्र की अंतर्दशा का विवाह से संबंध [शुक्र अंतर्दशा और विवाह योग](/blog/shukra-antardasha-vivah-yog) में है।',
      'अगर विवाह में देरी हो रही है, तो कारण अक्सर तीन में से एक होता है — और तीनों जाँचे जा सकते हैं: **कमजोर सप्तम भाव** ([सप्तम भाव कमजोर होने के 11 लक्षण](/blog/7th-house-weak-marriage-delay-reasons)), **पितृ दोष** ([पितृ दोष और विवाह में देरी](/blog/pitra-dosh-marriage-delay-hindi)), या **दशा का अनुकूल न होना** ([विवाह में देरी क्यों](/learn/why-is-my-marriage-delayed))। और जब जोड़ी तय हो जाए, तब विवाह की शुभ तिथि के लिए [विवाह मुहूर्त](/vivah-muhurat) अलग औज़ार है।',
    ],
  },
  {
    id: 'kam-gun-kya-karein',
    h2: 'गुण कम आए — रिश्ता तोड़ दें?',
    paras: [
      'सबसे पहले वह बात जो सबसे ज़्यादा राहत देती है और सबसे कम कही जाती है: **अष्टकूट कभी भी अकेला निर्णायक नहीं माना गया।** शास्त्र में यह छानबीन का पहला औज़ार है, अंतिम फैसला नहीं। जो लोग सिर्फ 16 या 17 गुण देखकर अच्छा रिश्ता छोड़ देते हैं, वे शास्त्र नहीं मान रहे — वे एक अधूरा आँकड़ा मान रहे हैं।',
      'कम अंक आने पर तीन चीजें क्रम से देखिए। **पहला — कौन सा कूट खाली है?** अगर वर्ण, वश्य या तारा से अंक कटे हैं तो कुल मिलाकर 6 अंक का मामला है और परंपरा में इसे गंभीर नहीं माना जाता। अगर **नाड़ी या भकूट** से कटे हैं, तब देखने लायक है। **दूसरा — क्या कोई शास्त्रीय छूट लागू होती है?** नाड़ी और भकूट, दोनों की स्पष्ट छूटें ऊपर बताई गई हैं, और वे बहुत सी जोड़ियों पर लागू होती हैं। **तीसरा — पूरी कुंडली क्या कहती है?** मांगलिक स्थिति, सप्तम भाव और नवमांश — ये तीनों अष्टकूट से बाहर हैं और अक्सर तस्वीर बदल देते हैं।',
      'और अंत में एक बात जो एक ईमानदार ज्योतिषी को कहनी चाहिए: **कुंडली मिलान चरित्र नहीं जाँच सकता।** वह यह नहीं बताएगा कि सामने वाला व्यक्ति भरोसेमंद है, सम्मान देता है, या उसकी आदतें कैसी हैं। 36 गुण वाली जोड़ी में भी वे सवाल आपको खुद पूछने हैं। मिलान अनुकूलता का एक स्तर बताता है — जीवन उसी से नहीं चलता।',
    ],
  },
  {
    id: 'kya-nahi-batata',
    h2: 'कुंडली मिलान क्या नहीं बता सकता',
    paras: [
      'यह सूची इसलिए ज़रूरी है क्योंकि इन्हीं जगहों पर सबसे ज़्यादा डर और सबसे महँगे उपाय बेचे जाते हैं। मिलान से **नहीं** निकाला जा सकता: **तलाक की भविष्यवाणी**, विवाह की **तारीख**, संतान की संख्या, या जीवनसाथी का चरित्र और नीयत।',
      'खासकर तलाक पर साफ कहना ज़रूरी है। **कम गुण तलाक का संकेत नहीं हैं**, और कोई शास्त्रीय नियम ऐसा कहता भी नहीं। भारत में बहुत सी लंबी और स्थिर शादियाँ 18 से कम गुण पर हुई हैं, और बहुत सी 30+ वाली टूटी हैं। जो कोई गुण-पत्रक देखकर तलाक की बात करे, वह डर बेच रहा है।',
      'और उपायों पर: अगर कोई दोष निकलता है, तो शास्त्रीय उपाय **सरल** होते हैं — मंत्र, दान, व्रत, या कुछ स्थितियों में विवाह का समय बदलना। **कुंभ विवाह जैसे बड़े और महँगे अनुष्ठान अधिकांश मामलों में आवश्यक नहीं होते**, और उन्हें हर मांगलिक कुंडली पर थोप देना परंपरा नहीं, बाज़ार है। हमारी किसी भी रीडिंग के बाद कोई पूजा, रत्न या फॉलो-अप सिटिंग नहीं बेची जाती।',
    ],
  },
  {
    id: 'rashi-compatibility',
    h2: 'राशि अनुसार जोड़ी — और यह अष्टकूट से अलग क्यों है',
    paras: [
      '**राशि मिलान और गुण मिलान एक चीज़ नहीं हैं**, और इन्हें मिला देना आम गलती है। राशि अनुकूलता 12 चंद्र राशियों के आपसी स्वभाव पर आधारित है — तत्व, स्वामी ग्रह और परस्पर मित्रता। **अष्टकूट 27 नक्षत्रों पर आधारित है**, जो ढाई गुना बारीक है। इसलिए राशि से मिली अनुकूलता एक मोटा संकेत है, अंतिम उत्तर नहीं।',
      'फिर राशि जोड़ी देखना उपयोगी कब है? **जब जन्म समय उपलब्ध न हो।** केवल जन्म तिथि से चंद्र राशि लगभग सही निकल आती है, जबकि नक्षत्र और पाद के लिए समय चाहिए। ऐसी स्थिति में राशि जोड़ी शुरुआती छानबीन के लिए ठीक है — पर उस पर विवाह का फैसला नहीं लिया जाता।',
      'हमारे पास **सभी 144 राशि जोड़ियों** के अलग पेज हैं, हर एक में उस जोड़ी का स्वभाव, ताकत और घर्षण-बिंदु। कुछ उदाहरण नीचे दिए हैं, और असली अंक के लिए ऊपर वाला अष्टकूट टूल चलाइए — क्योंकि वही 36 गुण गिनता है।',
    ],
  },
];

type KmLink = { href: string; label: string; note: string };

const KM_HUB: KmLink[] = [
  { href: '/blog/36-guna-milan-explained', label: '36 गुण मिलान समझाया गया', note: 'आठों कूट, अंक सहित' },
  { href: '/blog/nadi-dosh-remedies', label: 'नाड़ी दोष और उपाय', note: 'सबसे भारी कूट — और उसकी छूट' },
  { href: '/blog/bhakoot-dosh-explained', label: 'भकूट दोष', note: '6-8, 9-5, 2-12 और रद्द होने की शर्त' },
  { href: '/blog/manglik-non-manglik-marriage-hindi', label: 'मांगलिक और गैर-मांगलिक विवाह', note: 'अष्टकूट यह नहीं पकड़ता' },
  { href: '/blog/manglik-myths-hindi', label: 'मांगलिक मिथक', note: 'डर बनाम शास्त्र' },
  { href: '/blog/i-am-manglik-what-to-do-hindi', label: 'मैं मांगलिक हूँ — अब क्या करूँ', note: 'शास्त्रीय अपवाद' },
  { href: '/blog/love-marriage-kundali-matching', label: 'Love marriage and kundali matching', note: 'When the family asks for gun milan' },
  { href: '/blog/7th-house-weak-marriage-delay-reasons', label: 'सप्तम भाव कमजोर — 11 लक्षण', note: 'देरी का सबसे आम कारण' },
  { href: '/blog/pitra-dosh-marriage-delay-hindi', label: 'पितृ दोष और विवाह में देरी', note: 'कम जाँचा जाने वाला कारण' },
  { href: '/blog/shukra-antardasha-vivah-yog', label: 'शुक्र अंतर्दशा और विवाह योग', note: 'कब — दशा से' },
  { href: '/learn/marriage-compatibility-analysis', label: 'Marriage compatibility analysis', note: 'The full reference' },
  { href: '/learn/kundli-matching-online', label: 'Kundli matching online', note: 'Method and limits' },
  { href: '/learn/why-is-my-marriage-delayed', label: 'Why is my marriage delayed?', note: 'Three causes, all checkable' },
  { href: '/learn/will-i-have-love-marriage', label: 'Will I have a love marriage?', note: '5th and 7th house' },
  { href: '/learn/chances-of-inter-caste-marriage', label: 'Inter-caste marriage chances', note: 'Rahu and the 7th' },
  { href: '/learn/marriage-after-30-prediction', label: 'Marriage after 30', note: 'Late is not delayed' },
];

const KM_PAIRS = [
  { slug: 'mesh-simha', label: 'मेष – सिंह' },
  { slug: 'vrishabha-kanya', label: 'वृषभ – कन्या' },
  { slug: 'mithun-tula', label: 'मिथुन – तुला' },
  { slug: 'kark-vrishchika', label: 'कर्क – वृश्चिक' },
  { slug: 'simha-dhanu', label: 'सिंह – धनु' },
  { slug: 'kanya-makar', label: 'कन्या – मकर' },
  { slug: 'tula-kumbh', label: 'तुला – कुंभ' },
  { slug: 'vrishchika-meen', label: 'वृश्चिक – मीन' },
  { slug: 'dhanu-mesh', label: 'धनु – मेष' },
  { slug: 'makar-vrishabha', label: 'मकर – वृषभ' },
  { slug: 'kumbh-mithun', label: 'कुंभ – मिथुन' },
  { slug: 'meen-kark', label: 'मीन – कर्क' },
];

function KmRich({ text, k }: { text: string; k: string }) {
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

export default function KundaliMilanPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(MILAN_SERVICE_SCHEMA) }} />

      <div className="min-h-screen bg-[#080B12]">
        <SiteNav />
        <main>

          {/* SECTION 1 - GEO DIRECT ANSWER BLOCK */}
          <section className="pt-24 pb-8 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.25)}`,
                color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '16px',
              }}>
                Vedic Compatibility Matching
              </span>
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-serif font-bold leading-tight mb-4">
                Kundali Milan - Free 36 Guna Matching & <span style={{ color: GOLD }}>Vedic Compatibility</span>
              </h1>
              <p style={{
                color: '#94a3b8', fontSize: '15px', lineHeight: 1.7,
                maxWidth: '720px', margin: '0 auto',
              }}>
                <strong style={{ color: '#cbd5e1' }}>Kundali Milan</strong> is the Vedic compatibility analysis between two birth charts using the{' '}
                <strong style={{ color: '#cbd5e1' }}>36 Guna Ashtakoot system</strong>. Trikaal Vaani computes all 8 koots -
                Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi - plus{' '}
                <strong style={{ color: '#cbd5e1' }}>Mangal Dosh, Nadi Dosh, and Bhakoot Dosh</strong> using{' '}
                Swiss Ephemeris precision and BPHS classical rules. Free preview, Rs51 deep analysis, Rs101 with personalized remedies.
              </p>
            </div>
          </section>

          {/* SECTION 2 - THE FORM (conversion surface + tier SELECTION happens here)
              v1.2: wrapped in #milan-form anchor — form component itself UNTOUCHED (IR-13) */}
          <div id="milan-form" style={{ scrollMarginTop: '90px' }}>
            <KundaliMilanForm />
          </div>

          {/* SECTION 3 - WHAT'S INCLUDED (tier comparison) - MOVED UP per v1.1
              v1.2: each card now has a CTA back to the form (#milan-form) */}
          <section className="py-16 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Tier Comparison
                </p>
                <h2 className="text-white text-3xl font-serif font-bold mb-3">
                  What's Included
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                  Pick your tier inside the form above. Here's what each tier delivers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Free Preview */}
                <div style={{
                  padding: '24px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                    Free Preview
                  </p>
                  <p style={{ color: '#fff', fontSize: '32px', fontWeight: 800, fontFamily: 'Georgia, serif', margin: '8px 0' }}>
                    Free
                  </p>
                  <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', flex: 1 }}>
                    {['36 Guna score (numeric)', 'Dosha flags (yes/no)', 'Emotional teaser', 'No PDF download'].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', color: '#cbd5e1', fontSize: '13px' }}>
                        <span style={{ color: '#94a3b8', flexShrink: 0 }}>+</span>{f}
                      </li>
                    ))}
                  </ul>
                  {/* v1.2 FIX-1: card CTA → form */}
                  <a href="#milan-form" style={{
                    display: 'block', marginTop: '18px', padding: '11px 16px',
                    borderRadius: '10px', textAlign: 'center', textDecoration: 'none',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#cbd5e1', fontSize: '13px', fontWeight: 700,
                  }}>
                    Start Free ↑
                  </a>
                </div>

                {/* Basic ₹51 */}
                <div style={{
                  padding: '24px', borderRadius: '16px',
                  background: GOLD_RGBA(0.06),
                  border: `1px solid ${GOLD_RGBA(0.3)}`,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                    Basic Milan
                  </p>
                  <p style={{ color: GOLD, fontSize: '32px', fontWeight: 800, fontFamily: 'Georgia, serif', margin: '8px 0' }}>
                    <IntlPrice inr="₹51" usd="$7" />
                  </p>
                  <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', flex: 1 }}>
                    {[
                      'Full 36 Guna breakdown',
                      'Mangal + Nadi + Bhakoot analysis',
                      'Compatibility verdict',
                      'PDF download',
                      'WhatsApp + Email share',
                    ].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', color: '#e2e8f0', fontSize: '13px' }}>
                        <span style={{ color: GOLD, flexShrink: 0 }}>+</span>{f}
                      </li>
                    ))}
                  </ul>
                  {/* v1.2 FIX-1: card CTA → form */}
                  <a href="#milan-form" style={{
                    display: 'block', marginTop: '18px', padding: '11px 16px',
                    borderRadius: '10px', textAlign: 'center', textDecoration: 'none',
                    background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.45)}`,
                    color: GOLD, fontSize: '13px', fontWeight: 700,
                  }}>
                    Choose Basic — <IntlPrice inr="₹51" usd="$7" /> ↑
                  </a>
                </div>

                {/* Deep ₹101 */}
                <div style={{
                  padding: '24px', borderRadius: '16px',
                  background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)}, ${GOLD_RGBA(0.04)})`,
                  border: `2px solid ${GOLD}`,
                  position: 'relative',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{
                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                    background: GOLD, color: '#080B12',
                    fontSize: '10px', fontWeight: 700,
                    padding: '3px 12px', borderRadius: '12px', whiteSpace: 'nowrap',
                  }}>
                    MOST POPULAR
                  </div>
                  <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                    Deep Milan
                  </p>
                  <p style={{ color: '#fff', fontSize: '32px', fontWeight: 800, fontFamily: 'Georgia, serif', margin: '8px 0' }}>
                    <IntlPrice inr="₹101" usd="$12" /> <span style={{ color: '#94a3b8', fontSize: '14px' }}>/ <IntlPrice inr="₹151" usd="$15" /> both</span>
                  </p>
                  <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', flex: 1 }}>
                    {[
                      'Everything in Basic',
                      'Couple OR Parent narrative',
                      'Personalized Dos & Donts',
                      '6 Ritual remedies',
                      'Navamsa D9 + Dashakoot',
                      'Auspicious muhurat windows',
                    ].map(f => (
                      <li key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', color: '#fff', fontSize: '13px' }}>
                        <span style={{ color: GOLD, flexShrink: 0 }}>+</span>{f}
                      </li>
                    ))}
                  </ul>
                  {/* v1.2 FIX-1: card CTA → form */}
                  <a href="#milan-form" style={{
                    display: 'block', marginTop: '18px', padding: '12px 16px',
                    borderRadius: '10px', textAlign: 'center', textDecoration: 'none',
                    background: `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`,
                    color: '#080B12', fontSize: '13px', fontWeight: 700,
                    boxShadow: `0 0 24px ${GOLD_RGBA(0.35)}`,
                  }}>
                    Choose Deep — <IntlPrice inr="₹101" usd="$12" /> ↑
                  </a>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION 3.5 - VIVAH MUHURAT INTERLINK (v1.3) — natural funnel:
              compatible couple → next step is choosing the wedding date.
              Links to /vivah-muhurat (year-dynamic). No form/pricing change. */}
          <section className="pt-2 pb-10 px-4" style={{ background: 'rgba(13,17,30,0.4)' }}>
            <div className="max-w-4xl mx-auto">
              <a href="/vivah-muhurat" style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px',
                alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 22px', borderRadius: '14px', textDecoration: 'none',
                background: `linear-gradient(135deg, ${GOLD_RGBA(0.1)}, ${GOLD_RGBA(0.03)})`,
                border: `1px solid ${GOLD_RGBA(0.3)}`,
              }}>
                <span style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 600 }}>
                  💍 Jodi mil gayi? Ab shubh <span style={{ color: GOLD }}>Vivah Muhurat</span> bhi dekh lo —
                  exact shaadi ki tareekh, nakshatra &amp; lagna ke saath.
                </span>
                <span style={{
                  flexShrink: 0, color: '#080B12', fontWeight: 700, fontSize: '13px',
                  padding: '9px 18px', borderRadius: '10px',
                  background: `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`,
                }}>
                  See Vivah Muhurat →
                </span>
              </a>
            </div>
          </section>

          {/* SECTION 4 - EDUCATIONAL CONTENT (36 Guna explained) */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  The Eight Koots
                </p>
                <h2 className="text-white text-3xl font-serif font-bold mb-3">
                  36 Guna Ashtakoot Explained
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                  The classical Ashtakoot system from Brihat Parashara Hora Shastra. Each koot measures one dimension of marriage compatibility. Maximum score: 36.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Varna',        max: 1, desc: 'Spiritual evolution compatibility' },
                  { name: 'Vashya',       max: 2, desc: 'Mutual attraction and natural influence' },
                  { name: 'Tara',         max: 3, desc: 'Birth-star (nakshatra) compatibility - health & well-being' },
                  { name: 'Yoni',         max: 4, desc: 'Sexual and intimate compatibility' },
                  { name: 'Graha Maitri', max: 5, desc: 'Mental and intellectual compatibility' },
                  { name: 'Gana',         max: 6, desc: 'Temperament - Deva, Manushya, Rakshasa' },
                  { name: 'Bhakoot',      max: 7, desc: 'Wealth, family, and progeny' },
                  { name: 'Nadi',         max: 8, desc: 'Health, progeny, and genetic compatibility' },
                ].map((k, i) => (
                  <div key={k.name}
                    style={{
                      padding: '16px 18px', borderRadius: '12px',
                      background: 'rgba(13,17,30,0.6)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                    }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 style={{ color: GOLD, fontSize: '15px', fontWeight: 700, margin: 0 }}>
                        {i + 1}. {k.name}
                      </h3>
                      <span style={{
                        color: '#080B12', background: GOLD, padding: '2px 10px',
                        borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                      }}>
                        {k.max} {k.max === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                      {k.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: GOLD_RGBA(0.04), borderRadius: '12px', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
                  Beyond the 36 Guna, Trikaal also checks <strong style={{ color: GOLD }}>Mangal Dosh, Nadi Dosh, Bhakoot Dosh, Rajju Dosh, and Vedha Dosh</strong> with full BPHS classical cancellation rules applied.
                </p>
              </div>
            </div>
          </section>

          {/* ═══ v2.0: keyword-driven Hindi sections ═══ */}
          <section className="py-16 px-4">
            <div className="max-w-3xl mx-auto">
              {KM_SECTIONS.map((sec) => (
                <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-10">
                  <h2 className="text-white text-2xl md:text-3xl font-serif font-bold mb-4" lang="hi">{sec.h2}</h2>
                  {sec.paras.map((p, i) => (
                    <p key={i} className="text-slate-300 leading-relaxed mb-4" lang="hi">
                      <KmRich text={p} k={`${sec.id}-${i}`} />
                    </p>
                  ))}

                  {sec.id === 'rashi-compatibility' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
                      {KM_PAIRS.map((p) => (
                        <Link key={p.slug} href={`/compatibility/${p.slug}`}
                          className="rounded-xl px-3 py-2.5 text-center text-sm transition hover:opacity-90"
                          style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}`, color: GOLD }}>
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ═══ v2.0: the marriage cluster this page was cut off from ═══ */}
          <section className="py-16 px-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-white text-2xl md:text-3xl font-serif font-bold mb-3" lang="hi">
                विवाह ज्योतिष — पूरा गाइड
              </h2>
              <p className="text-slate-400 text-sm mb-7">
                मिलान से पहले या बाद में — हर सवाल पर अलग विस्तृत लेख। सबसे पहले नाड़ी और मांगलिक वाले पढ़िए,
                क्योंकि वही दो सबसे ज़्यादा फैसले बदलते हैं।
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {KM_HUB.map((i) => (
                  <Link key={i.href} href={i.href}
                    className="block rounded-xl px-4 py-3 transition hover:bg-white/5"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="block text-sm font-semibold" style={{ color: GOLD }}>{i.label}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{i.note}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 5 - FAQ */}
          <section className="py-16 px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Common Questions
                </p>
                <h2 className="text-white text-3xl font-serif font-bold">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {FAQ_SCHEMA.mainEntity.map((q, i) => (
                  <details key={i}
                    style={{
                      padding: '16px 20px', borderRadius: '12px',
                      background: 'rgba(13,17,30,0.6)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                    }}>
                    <summary style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, cursor: 'pointer', listStyle: 'none' }}>
                      {q.name}
                    </summary>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, marginTop: '12px', marginBottom: 0 }}>
                      {q.acceptedAnswer.text}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 6 - E-E-A-T AUTHOR BLOCK */}
          <section className="py-12 px-4">
            <div className="max-w-3xl mx-auto">
              <div style={{
                display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap',
                padding: '24px', borderRadius: '16px',
                background: `linear-gradient(135deg, ${GOLD_RGBA(0.06)}, transparent)`,
                border: `1px solid ${GOLD_RGBA(0.2)}`,
              }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: GOLD_RGBA(0.15),
                  border: `2px solid ${GOLD_RGBA(0.4)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: GOLD, fontSize: '24px', fontWeight: 800, fontFamily: 'Georgia, serif',
                  flexShrink: 0,
                }}>
                  RG
                </div>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <p style={{ color: GOLD, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                    Reading Framework Designed By
                  </p>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>
                    Rohiit Gupta - Chief Vedic Architect
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                    15+ years of Vedic study under the <strong style={{ color: '#cbd5e1' }}>Parashara BPHS</strong> tradition.
                    Founder of Trikaal Vaani. India-based Vedic astrologer accountable for every
                    Kundali Milan reading framework that Trikaal AI applies to your charts.{' '}
                    <a href="/founder" style={{ color: GOLD, textDecoration: 'none' }}>Read full credentials -&gt;</a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7 - CLOSING CTA (v1.2 FIX-2) — warmest leads reach here,
              give them a path back to the form */}
          <section className="pb-20 px-4">
            <div className="max-w-3xl mx-auto">
              <div style={{
                textAlign: 'center', padding: '32px 24px', borderRadius: '20px',
                background: `linear-gradient(135deg, ${GOLD_RGBA(0.1)}, rgba(8,11,18,0.95))`,
                border: `1px solid ${GOLD_RGBA(0.3)}`,
              }}>
                <h2 className="text-white text-2xl font-serif font-bold mb-2">
                  Apni Jodi Ka Sach Janein
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px', lineHeight: 1.6 }}>
                  36 Guna score, Mangal aur Nadi Dosh check — free mein, 60 second ke andar.
                </p>
                <a href="#milan-form" style={{
                  display: 'inline-block', padding: '15px 36px', borderRadius: '12px',
                  background: `linear-gradient(135deg, ${GOLD} 0%, #F5D76E 50%, ${GOLD} 100%)`,
                  color: '#080B12', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
                  boxShadow: `0 0 30px ${GOLD_RGBA(0.4)}`,
                }}>
                  🔱 Free Milan Shuru Karein ↑
                </a>
                <p style={{ margin: '12px 0 0', color: '#475569', fontSize: '11px' }}>
                  Free preview · No card required · Swiss Ephemeris + BPHS
                </p>
              </div>
            </div>
          </section>

        </main>
        <SiteFooter />
      </div>
    </>
  )
}

// END app/kundali-milan/page.tsx v1.3
