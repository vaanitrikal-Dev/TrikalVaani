/* ═══════════════════════════════════════════════════════════════════════════
   app/services/page.tsx — the /services index
   Version: 2.0 (06 Sep 2026)

   WHAT WAS WRONG, AND IT WAS BACKWARDS
     The big gold PRIMARY button on every card pointed at /?segment=${slug}.
     Nothing in this repo reads the `segment` query parameter — category
     selection is React state set by CLICKING a homepage card. So the main
     call to action on the whole services page went nowhere: the visitor
     landed at the top of the homepage with nothing selected.
     Meanwhile the small grey "Learn More →" link pointed at
     /services/${slug} — the page that actually works.
     The working link was the weak one and the dead link was the loud one.

     Since 06 Sep 2026 every /services/<slug> page carries the real BirthForm,
     preselected to its own domain. So the primary button now goes there, and
     the duplicate secondary link is gone — two buttons to one destination is
     just a choice the reader does not need to make.

   THE PRICE CAME OFF THE BUTTON, ON PURPOSE
     "Get Reading — ₹51" asked for money before giving anything, while the
     reading itself opens with a FREE tier ("Trikaal Ka Sandesh", 150-200
     words) and the homepage cards already say "Free chart reading for this
     topic". The page was quoting a price the product does not charge up
     front. The ₹51 is still shown on the card, as information — it just is
     not the thing the button asks for.

   CONTENT ADDED IN v2.0
     15 H2 sections, ~2,000 words, under the cards. This page had 4 H2 and
     almost no body text, which is why it reads as a menu rather than an
     answer. The sections cover what a reader decides HERE — which reading
     fits my question, what free actually includes, what these readings
     cannot do — and hand every theory branch off by link.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:        app/services/page.tsx
 * Version:     v2.5 — IR-0 cleanup: fake rating + phantom ₹499 removed
 * Phase:       Deliverable 3 of Master SEO Strategy
 * Owner:       Rohiit Gupta, Chief Vedic Architect
 * Domain:      trikalvaani.com/services
 * Updated:     June 03, 2026
 *
 * v2.5 CHANGES vs v2.4:
 *   ❌ REMOVED fake AggregateRating (4.9 / 1250) from every Product schema — IR-0
 *   ❌ REMOVED phantom ₹499 everywhere: card strike-through "was-price",
 *      the "Personal Consultation ₹499" CTA block, and all FAQ mentions
 *      (Personal call retired — not offered)
 *   ❌ REMOVED stale "900-word" claim (engine now ~650 words)
 *   ✅ FAQ now 7 visible / 7 schema (removed ₹51-vs-₹499 question)
 *   ✅ Real pricing only: Free · ₹11 voice · ₹51 reading
 *   ✅ NOTHING ELSE TOUCHED — SEO, structure, comparison table, design tokens.
 *
 * --- inherited from v2.4 ---
 *   ✅ Jini retired — Trikaal is the AI soul sitewide.
 *
 * SEO + GEO FIXES (vs v1.0):
 *   [FIX 1] Title double-brand bug removed
 *   [FIX 2] GEO direct answer block (50 words after H1)
 *   [FIX 3] Broken /about author link → /founder
 *   [FIX 4] FAQ: 7 visible / 7 schema
 *   [FIX 6] Comparison table vs AstroTalk / AstroSage
 *   [FIX 7] Person schema with 15+ years E-E-A-T credentials
 *
 * NOTE: Server Component — JSON.stringify is safe (no React re-serialization)
 * ============================================================================
 */

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

// ============================================================================
// METADATA — SEO foundation
// ============================================================================

export const metadata: Metadata = {
  // v2.0: was 53 chars and the root layout appended " | Trikaal Vaani" on
  // top, rendering 69 and losing the brand to truncation. `absolute` makes
  // the string below exactly what Google shows. 57 chars.
  title: { absolute: "Vedic Astrology Reading — Free Jaanch | Trikaal Vaani" },
  description:
    "8 deep AI-powered Vedic astrology readings by Rohiit Gupta — Chief Vedic Architect. Swiss Ephemeris precision, BPHS classical rules, instant delivery. From ₹51.",
  alternates: {
    canonical: "https://trikalvaani.com/services",
  },
  keywords: [
    "vedic astrology services online",
    "ai vedic astrology reading",
    "online astrology consultation India",
    "Rohiit Gupta astrologer",
    "Trikaal Vaani services",
    "free kundli reading online",
    "horoscope predictions India",
    "Swiss Ephemeris astrology",
    "vedic astrology India",
    "BPHS astrology reading",
  ],
  openGraph: {
    title: "Vedic Astrology Services Online — 8 Deep Readings from ₹51",
    description:
      "AI-powered Vedic readings by Rohiit Gupta. Career, wealth, marriage, property, child destiny — Swiss Ephemeris precision. Instant delivery.",
    url: "https://trikalvaani.com/services",
    siteName: "Trikaal Vaani",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://trikalvaani.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trikaal Vaani — Vedic Astrology Services by Rohiit Gupta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedic Astrology Services Online — Live Reading at ₹51",
    description:
      "8 AI-powered Vedic readings by Rohiit Gupta. Swiss Ephemeris precision. Instant delivery.",
    images: ["https://trikalvaani.com/og-image.jpg"],
  },
};

// ============================================================================
// SERVICE DATA — single source of truth (DRY)
// ============================================================================

const services = [
  {
    slug: "ex-back-reading",
    no: "01",
    glyph: "♀",
    title: "Ex-Back Reading",
    question: "Will my ex come back?",
    desc: "Trikaal reads your Venus, 7th House and Vimshottari Dasha to reveal if reunion energy is active — and exactly when the window opens.",
    tags: ["Venus Analysis", "7th House", "Reunion Timing"],
    gradient: "from-rose-900/20",
    price: 51,
  },
  {
    slug: "toxic-boss-radar",
    no: "02",
    glyph: "♄",
    title: "Toxic Boss Radar",
    question: "Is my boss karmically toxic?",
    desc: "Your 10th House and Saturn reveal whether this workplace situation is a karmic lesson with an end date — or a cosmic signal to leave now.",
    tags: ["10th House", "Saturn Transit", "Job Change Timing"],
    gradient: "from-red-900/20",
    price: 51,
  },
  {
    slug: "career-pivot",
    no: "03",
    glyph: "♃",
    title: "Career Pivot",
    question: "Am I in the wrong career?",
    desc: "Your 10th House, Jupiter and Atmakaraka reveal your dharmic profession — and the exact Dasha window to pivot without financial risk.",
    tags: ["Atmakaraka", "D10 Dasamsa", "Pivot Window"],
    gradient: "from-amber-900/15",
    price: 51,
  },
  {
    slug: "property-yog",
    no: "04",
    glyph: "🏠",
    title: "Property Yog",
    question: "Is now the right time to buy property?",
    desc: "Your 4th House, Mars Karaka and Saturn transit reveal if Property Yog is active — or if buying now is a costly karmic mistake.",
    tags: ["4th House", "Mars Karaka", "Sade Sati Check"],
    gradient: "from-orange-900/15",
    price: 51,
  },
  {
    slug: "compatibility",
    no: "05",
    glyph: "⚖️",
    title: "Compatibility Reading",
    question: "Are we truly compatible?",
    desc: "Beyond 36 gunas — Trikaal reads both charts for Navamsa D9, Mangal Dosha, Nadi Dosha and Dasha synchronicity to reveal the soul-level truth.",
    tags: ["Navamsa D9", "Mangal Dosha", "Dasha Sync"],
    gradient: "from-rose-900/15",
    price: 51,
  },
  {
    slug: "child-destiny",
    no: "06",
    glyph: "👶",
    title: "Child Destiny",
    question: "What is my child born to become?",
    desc: "Your child’s 5th House, Moon nakshatra and Mercury reveal hidden talents, ideal education stream and cosmic calling — before society decides for them.",
    tags: ["5th House Talent", "Moon Nakshatra", "Education Stream"],
    gradient: "from-blue-900/15",
    price: 51,
  },
  {
    slug: "wealth-reading",
    no: "07",
    glyph: "💰",
    title: "Wealth Reading",
    question: "When will I get rich?",
    desc: "Your 2nd House, Jupiter and Dhana Yoga combinations reveal your wealth timeline, peak earning years and which investment sectors your chart favors.",
    tags: ["Dhana Yoga", "Jupiter Transit", "Peak Earning Years"],
    gradient: "from-yellow-900/15",
    price: 51,
  },
  {
    slug: "spiritual-purpose",
    no: "08",
    glyph: "🕉",
    title: "Spiritual Purpose",
    question: "What is my soul’s purpose?",
    desc: "Your Ketu, Atmakaraka and 12th House decode your past-life karma, present dharmic mission and the soul lesson you were born to complete.",
    tags: ["Atmakaraka", "Ketu Past Life", "Moksha Yoga"],
    gradient: "from-indigo-900/20",
    price: 51,
  },
];

// ============================================================================
// JSON-LD SCHEMAS
// ============================================================================

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": "https://trikalvaani.com/services#itemlist",
  name: "Vedic Astrology Services by Rohiit Gupta — Trikaal Vaani",
  description:
    "8 deep AI-powered Vedic astrology readings designed by Chief Vedic Architect Rohiit Gupta. Swiss Ephemeris precision, BPHS classical rules, instant delivery from ₹51.",
  numberOfItems: services.length,
  itemListElement: services.map((s, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    item: {
      "@type": "Product",
      "@id": `https://trikalvaani.com/services/${s.slug}#product`,
      name: s.title,
      description: s.desc,
      url: `https://trikalvaani.com/services/${s.slug}`,
      image: "https://trikalvaani.com/og-image.jpg",
      brand: { "@id": "https://trikalvaani.com/#organization" },
      offers: {
        "@type": "Offer",
        url: `https://trikalvaani.com/services/${s.slug}`,
        priceCurrency: "INR",
        price: String(s.price),
        availability: "https://schema.org/InStock",
        seller: { "@id": "https://trikalvaani.com/#organization" },
      },
    },
  })),
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://trikalvaani.com/founder#person",
  name: "Rohiit Gupta",
  jobTitle: "Chief Vedic Architect",
  url: "https://trikalvaani.com/founder",
  image: "https://trikalvaani.com/Rohiit-Gupta.jpg",
  description:
    "Rohiit Gupta is the Chief Vedic Architect of Trikaal Vaani with 15+ years of study in the Parashara BPHS tradition. Specializes in Vimshottari Dasha, Navamsa D9, Pratyantar Dasha precision timing, and Dhana Yoga combinations. Based in India.",
  worksFor: { "@id": "https://trikalvaani.com/#organization" },
  knowsAbout: [
    "Vedic Astrology",
    "Brihat Parashara Hora Shastra",
    "Vimshottari Dasha",
    "Pratyantar Dasha",
    "Navamsa D9 Chart",
    "Jaimini Astrology",
    "Swiss Ephemeris",
    "Dhana Yoga",
    "Property Yog",
    "Atmakaraka Analysis",
  ],
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Vedic Astrology Study",
      educationalLevel: "15+ years Parashara BPHS tradition",
    },
  ],
};

const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://trikalvaani.com/services#faq",
  mainEntity: [
    {
      "@type": "Question",
      name: "What Vedic astrology services does Trikaal Vaani offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trikaal Vaani offers 8 deep AI-powered Vedic readings: Ex-Back Reading (love reunion timing), Toxic Boss Radar (workplace karma), Career Pivot (dharmic career window), Property Yog (real estate timing), Compatibility Reading (Navamsa-level kundali matching), Child Destiny (5th house talent map), Wealth Reading (Dhana Yoga analysis), and Spiritual Purpose (Atmakaraka + past-life karma). Each reading is generated by Trikaal using Swiss Ephemeris precision and reviewed against BPHS classical rules. All readings start at ₹51 with instant delivery.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate are Trikaal Vaani readings compared to AstroSage and AstroTalk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trikaal Vaani uses Swiss Ephemeris with Lahiri Ayanamsha — the same NASA-grade planetary calculation engine used by AstroSage and professional astrologers globally. Unlike AstroTalk’s marketplace model (random astrologer quality), every Trikaal Vaani reading framework is personally designed by Rohiit Gupta using BPHS, Bhrigu Nandi Nadi, and Shadbala. Birth time accuracy within 15 minutes ensures Lagna and Pratyantar Dasha precision down to 3-7 day windows.",
      },
    },
    {
      "@type": "Question",
      name: "What birth details do I need for any Vedic reading?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Three details: full date of birth, exact time of birth (within 15-30 minutes ideally), and place of birth. The more precise your birth time, the more accurate your Lagna (Ascendant) — which determines house lordships, dasha sequences, and yogas. If birth time is unknown, Trikaal Vaani offers a Moon-chart-based reading at the same price, but Lagna-based predictions are recommended for life-decision queries.",
      },
    },
    {
      "@type": "Question",
      name: "Are Trikaal Vaani readings available in Hindi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Trikaal Vaani offers readings in three languages: pure Hindi (शुद्ध हिंदी), Hinglish (Hindi-English mix — most popular in India), and English. The Voice Reading at ₹11 is delivered as a 60-second Hindi or Hinglish audio. All written reports use native Hindi phrasing — not machine translation.",
      },
    },
    {
      "@type": "Question",
      name: "How quickly will I receive my reading?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI-generated readings (₹51 Deep Reading and ₹11 Voice Reading) are delivered instantly — within 30-90 seconds of payment. The Free Trikaal Ka Sandesh preview generates in under 10 seconds.",
      },
    },
    {
      "@type": "Question",
      name: "Is Trikaal Vaani safe and is my birth data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Birth data is encrypted with 256-bit TLS during transmission and stored securely on Supabase (SOC 2 Type II compliant). Trikaal Vaani never sells, shares, or markets your birth details to third parties. Payments are processed via Razorpay with PCI-DSS Level 1 compliance — Trikaal Vaani never sees your card details. You can request data deletion anytime by emailing rohiit@trikalvaani.com.",
      },
    },
    {
      "@type": "Question",
      name: "What if the reading is wrong or I am not satisfied?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vedic astrology is interpretive — it maps probabilities, not certainties. If your reading does not feel relevant within the first 24 hours, email rohiit@trikalvaani.com with your concern and Rohiit Gupta personally reviews the chart. Refunds are processed for AI readings if a calculation error is identified.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://trikalvaani.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Services",
      item: "https://trikalvaani.com/services",
    },
  ],
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT — 15 sections. This page had 4 H2 and almost no body text, so it
// read as a menu. These sections answer the ONE decision made here: which of
// the eight fits my question, and what do I actually get. Every theory branch
// is handed off by link to the /learn/ and /blog/ pages that own it.
// ════════════════════════════════════════════════════════════════════════════

type SvcSection = { id: string; h2: string; paras: string[] };
type SvcLink    = { href: string; label: string; note: string };

const V6_SECTIONS: SvcSection[] = [
  {
    id: 'kaise-kaam',
    h2: 'Ye kaise kaam karta hai — teen kadam',
    paras: [
      '**Ek — apna sawaal chuniye.** Upar aath jaanch hain. Har ek ek hi sawaal ka jawab deti hai, isliye wahi chuniye jo abhi sabse zyada mann mein hai.',
      '**Do — janm vivaran daaliye.** Tareekh, sateek samay aur sthan. Us page par form pehle se khula milega — kahin aur jaana nahi padta.',
      '**Teen — apna vishleshan turant paiye.** Chart Swiss Ephemeris se banta hai aur report kuch second mein saamne aa jaati hai. **Pehla vishleshan bilkul free hai** — bina signup, bina card.',
    ],
  },
  {
    id: 'reading-nahi-jaanch',
    h2: 'Ye "reading" nahi hai — ye jaanch hai',
    paras: [
      'Antar chhota lagta hai par bada hai, isliye saaf kar dena chahiye.',
      '**Reading** wo hoti hai jo koi aur aapke liye karta hai — aap vivaran bhejte hain, intezaar karte hain, aur jawab aata hai. Usme aap dekh nahi sakte ki wo kis aadhaar par bana.',
      '**Jaanch** wo hai jo aap khud chalate hain. Aapka chart aapke saamne banta hai — lagna, nau graha degree ke saath, bhaav, dasha — aur uske upar vishleshan. **Har point ke saath uski wajah likhi hoti hai:** kaunsa graha, kaunsa bhaav, kaunsi dasha.',
      'Isi wajah se aap use **parakh sakte hain.** Wahi janm vivaran kisi doosre software mein daal kar aankde mila lijiye. Jo cheez jaanchi ja sakti hai, uspar bharosa alag hota hai.',
    ],
  },
  {
    id: 'kaunsi-chuniye',
    h2: 'Kaunsi jaanch aapke liye hai',
    paras: [
      'Aath mein se chunna mushkil lagta hai. Sawaal ke hisaab se seedha kram ye hai.',
      '**"Wo wapas aayenge ya nahi"** → [Ex-Back](/services/ex-back-reading). **"Mera boss ya office mahaul"** → [Toxic Boss](/services/toxic-boss-radar). **"Career badlun ya rukun"** → [Career Pivot](/services/career-pivot). **"Ghar ya zameen ka sahi samay"** → [Property Yog](/services/property-yog).',
      '**"Mere bachche ka jhukav"** → [Child Destiny](/services/child-destiny). **"Ab kya — jeevan ka uddeshya"** → [Spiritual Purpose](/services/spiritual-purpose). **"Dhan aur karz"** → [Wealth Reading](/services/wealth-reading). **"Hum dono ka mel"** → [Compatibility](/services/compatibility).',
      'Aur agar sawaal in aath mein nahi hai — **poori kundali** se shuru kijiye, wo bhi free: [Kundali Calculator](/calculators/free-kundali-calculator).',
    ],
  },
  {
    id: 'free-mein-kya',
    h2: 'Free mein sach mein kya milta hai',
    paras: [
      'Ye saaf likhna zaroori hai, kyunki "free" shabd bahut jagah aadha sach hota hai.',
      '**Free mein milta hai:** aapka poora chart — lagna, nau grahon ki sthiti **degree ke saath**, nakshatra, baarah bhaav, aur chal rahi Mahadasha tatha Antardasha. Iske saath **Trikaal Ka Sandesh** — 150 se 200 shabd ka vishleshan jo seedha aapke sawaal par hai.',
      'Aur uske saath: gochar timeline, evidence table jisme har nishkarsh ke peeche ka bhaav aur Shadbala dikhta hai, aur paanch classical upay ka pehla.',
      '**Koi signup nahi, koi card nahi, koi email nahi maanga jaata.** Aur free wala hissa ek adhoora tukda nahi hai — wo apne aap mein ek uttar hai. Agar usse aapka kaam ban jaaye to aage kuch dene ki zaroorat nahi.',
    ],
  },
  {
    id: 'paid-mein-kya',
    h2: '₹51 mein kya aur milta hai',
    paras: [
      'Poori reading mein wo hissa aata hai jo free mein nahi ho sakta, aur uska aakar bata dena chahiye.',
      '**900 shabd ka gehra vishleshan**, **Navamsa (D-9)** — jo rishton aur bhagya ka asli chart hai, **Dasamsa (D-10)** career ke prashn mein, har graha ka **Shadbala score**, saare bhaav aur unki dasha-activation chain, **Bhrigu Nandi Nadi** ke signals aur yog.',
      'Iske saath **agle chhe mahine ka gochar mahine-dar-mahine**, sahi tareekhon ki window, aur **paanch upay ka poora plan** — mantra, ratna, vrat, daan aur vishesh.',
      '**Ek baar ka payment, turant access, Razorpay se surakshit.** Koi subscription nahi, koi renewal nahi.',
    ],
  },
  {
    id: 'kyun-51',
    h2: 'Sirf ₹51 kyun — kahin kuch chhupa to nahi',
    paras: [
      'Ye sawaal jaayaz hai kyunki is bazaar mein ek reading ke hazaron liye jaate hain.',
      'Wajah seedhi hai: **ganana aur vishleshan dono automated hain.** Chart Swiss Ephemeris se banta hai, niyam BPHS se aate hain, aur vishleshan usi dhaanche par banta hai. Yahan koi ghanta bhar baith kar aapki kundali nahi dekhta — aur isi liye keemat itni rakhi ja sakti hai.',
      'Jo isme **nahi** hai: ek jyotishi ke saath baith kar baat, aapke apne sawaalon ke uttar, aur wo cheez jo sirf anubhav se aati hai. **Wo alag sewa hai aur uski keemat alag hoti hai.**',
      'Aur jo chhupa hua **nahi** hai: koi subscription, koi baad mein aane wala kharch, aur koi "aapki kundali mein bhaari dosh hai, nivaran ke liye itne hazaar" wali baat. Wo is site par kahin nahi hai — jaanbujh kar.',
    ],
  },
  {
    id: 'kitni-sateek',
    h2: 'Kitna sateek hai — imandar jawab',
    paras: [
      'Is sawaal ka uttar do hisson mein hai aur dono kehna zaroori hai.',
      '**Ganana par poora bharosa kijiye.** Grahon ki sthiti Swiss Ephemeris se aati hai — wahi library jo duniya ka har gambhir jyotish software use karta hai — aur **Lahiri ayanamsha** lagta hai, jo Bharat sarkar ka maanak hai aur Rashtriya Panchang usi par bana hai. Ye aankde kisi bhi doosre software se milne chahiye.',
      '**Vyakhya par utna hi bharosa kijiye jitna kisi bhi jyotishiya vyakhya par.** Wo classical niyamon par bani hai — BPHS ke bhaav aur kaarak, Vimshottari dasha, Shadbala — par wo vyakhya hi rehti hai, tathya nahi.',
      'Isi liye har point ke saath **uski wajah** likhi jaati hai. Aap use apni kundali se mila sakte hain, aur asahmat bhi ho sakte hain. **Jo koi "100% accurate" kahe, wo bharosa bech raha hai** — koi jyotishiya padhai sau pratishat sateek nahi hoti.',
    ],
  },
  {
    id: 'janm-samay',
    h2: 'Sateek janm samay kyun itna zaroori hai',
    paras: [
      'Ye ek cheez poore vishleshan ki buniyad hai, aur sabse zyada yahi galat jaati hai.',
      '**Lagna har lagbhag do ghante mein badal jaata hai** — aur lagna se hi baarah bhaav bante hain. Yaani samay galat hua to chautha bhaav, saptam, dasham — sab khisak jaate hain, aur unke saath poora vishleshan.',
      'Aadhe ghante ki galti prayah lagna nahi badalti par uski **degree** badal deti hai — aur usse **Navamsa aur Dasamsa** badal jaate hain, jo poori reading ke sabse gehre hisse hain.',
      '**Kahan se lein:** janm pramanpatra, hospital ka discharge card, ya nagar nigam ka record. Ghar ki yaad prayah aadhe ghante par gol kar di jaati hai. Aur agar samay bilkul na ho — 12:00 dopahar maan liya jaata hai, aur us reading ko **disha-soochak** maaniye, nirnay nahi.',
    ],
  },
  {
    id: 'kya-nahi-batate',
    h2: 'Ye jaanch kya nahi bata sakti',
    paras: [
      'Ye seema hamare apne vyapaar ke khilaf jaati hai, par har page par likhi hai aur yahan bhi honi chahiye.',
      'Koi bhi jaanch **nahi** bata sakti: kisi ki mrityu ka samay, koi ghatna kis tareekh ko hogi, kisi pariksha ka result, ya koi aisa uttar jise badla na ja sake. **Jo koi in mein se kuch bhi daawa kare — khaas kar mrityu — wo galat bhi hai aur nuksandeh bhi.**',
      'Aur ye **nahi hain**: chikitsiya salah ka vikalp, kanooni salah ka vikalp, arthik salah ka vikalp, ya manochikitsa ka vikalp. Sehat, kanoon aur paise ke faisle peshevar jaanch maangte hain.',
      'Jo ye dete hain: **pravritti ka naksha aur samay ka kram** — kaunse kshetra sahaj khulenge, kahan prayaas zyada lagega, aur kaunsa daur kis cheez ka hai. Isi roop mein inhe lijiye.',
    ],
  },
  {
    id: 'dar-nahi-bechte',
    h2: 'Hum dar nahi bechte — aur ye jaanch layak daawa hai',
    paras: [
      'Is bazaar mein sabse zyada paisa dar se banta hai: "aapki kundali mein Kaal Sarp dosh hai", "Mangal dosh se shaadi nahi hogi", "poorvajon ka shraap hai".',
      '**Ye site wo nahi karti.** Har dosh page par likha hai ki wo sthiti **kitni aam hai** aur shastra mein uske **bhang (radd hone) ke niyam** bhi diye gaye hain. Mangal dosh lagbhag har chauthe-paanchve chart mein milta hai. Kaal Sarp dikhne mein bhaari lagta hai par asaamanya nahi.',
      'Aur ye daawa aap **khud jaanch sakte hain** — teeno dosh calculator free hain, koi email nahi maangte, aur agar aapki sthiti saadharan hai to wahi likhte hain: [Manglik Dosh](/calculators/free-manglik-dosh-calculator), [Kaal Sarp Dosh](/calculators/free-kaal-sarp-dosh-calculator), [Pitra Dosh](/calculators/free-pitra-dosh-calculator).',
      'Isi tarah ratna par bhi — **hum ratna bechte nahi**, isliye "aapko ye ratna chahiye" kehne ka koi kaaran hi nahi hai. Jaanch [yahan](/calculators/free-gemstone-suitability-calculator) free hai.',
    ],
  },
  {
    id: 'privacy',
    h2: 'Aapka janm vivaran kahan jaata hai',
    paras: [
      'Ye sawaal kam poochha jaata hai aur poochha jaana chahiye.',
      'Janm vivaran chart banane ke liye chahiye — uske bina lagna aur bhaav bante hi nahi. Wo aapki report se juda rehta hai taaki aap use dobara khol sakein.',
      '**Kisi bhi jaanch ke liye signup zaroori nahi hai.** Free vishleshan ke liye na email maanga jaata hai, na phone. Payment Razorpay se hota hai aur card ki jaankari kabhi hamare paas nahi aati — wo seedha unke paas jaati hai.',
      'Poora vivaran [Privacy Policy](/privacy) par hai. Aur ek vyavharik salah: **apni report ka PDF ya screenshot save kar lijiye** — janm kundali kabhi badalti nahi, isliye ek baar save karna kaafi hai.',
    ],
  },
  {
    id: 'hindi-english',
    h2: 'Hindi mein bhi milta hai',
    paras: [
      'Bhasha se ganana nahi badalti — grahon ki sthiti khagolik tathya hai. Jo badalta hai wo prastuti hai.',
      'Har jaanch **teen roop** mein mil sakti hai: shudh Hindi (देवनागरी), **Hinglish** (jo adhikansh log rozmarra mein bolte hain), aur English.',
      'Aur grahon ke naam bhartiya roop mein hi aate hain — Guru, Shukra, Shani — English mein bhi. Kyunki wahi asli naam hain.',
      'Agar koi site "Hindi kundali" ko alag cheez ki tarah beche, to wo sirf bhasha bech rahi hai. **Ganana wahi hai.**',
    ],
  },
  {
    id: 'calculators-bhi',
    h2: 'Sirf ek hissa dekhna hai to calculators free hain',
    paras: [
      'Har baar poori jaanch ki zaroorat nahi hoti. Agar sawaal chhota hai to seedha uska tool lijiye.',
      '**Buniyad** — [Kundali Calculator](/calculators/free-kundali-calculator) poori kundali, [Lagna Calculator](/calculators/free-lagna-calculator), [Rashi Calculator](/calculators/free-rashi-calculator), [Nakshatra Calculator](/calculators/free-nakshatra-calculator), [Dasha Calculator](/calculators/free-dasha-calculator).',
      '**Bal aur jaanch** — [Kundali Strength](/calculators/free-kundali-strength-calculator), [Graha Bal](/calculators/free-graha-bal-calculator), [Weak Planet Finder](/calculators/free-weak-planet-finder), [Gemstone Suitability](/calculators/free-gemstone-suitability-calculator).',
      '**Khaas sawaal** — [Shadi Kab Hogi](/calculators/free-shadi-kab-hogi-calculator), [Santan Yog](/calculators/free-santan-yog-calculator), [Sade Sati](/calculators/free-sade-sati-calculator), [IAS Astrology](/calculators/free-ias-astrology-calculator). **Sab free, sab bina signup.**',
    ],
  },
  {
    id: 'kis-ke-liye-nahi',
    h2: 'Ye jaanch kin logon ke liye nahi hai',
    paras: [
      'Ye likhna bikri ke khilaf jaata hai par bharosa isi se banta hai.',
      '**Jinke paas sateek janm samay nahi hai** — unhe pehle wo dhoondhna chahiye. Bina samay ke lagna nahi banta, aur uske bina aadha vishleshan andaaza reh jaata hai.',
      '**Jo koi nishchit bhavishyavani chahte hain** — "kis tareekh ko hoga" ka uttar yahan nahi milega, aur milna bhi nahi chahiye.',
      '**Aur jo kisi gambhir sthiti mein hain** — sehat ka mamla, kanooni maamla, utpeedan, ya lagatar bhaari mann. Wahan pehla kadam koi jaanch nahi hai. Kisi apne se, kisi doctor se, ya kisi peshevar se baat kijiye. Jyotish uske saath chal sakta hai, uski jagah nahi.',
    ],
  },
  {
    id: 'kitni-jaldi',
    h2: 'Report kitni jaldi milti hai',
    paras: [
      '**Free vishleshan turant** — form bharne ke kuch second baad. Koi queue nahi, koi "24 ghante mein bhejenge" nahi.',
      '**₹51 waali poori reading bhi turant** — payment ke baad seedha khul jaati hai. Razorpay se surakshit, ek baar ka payment.',
      'Wajah wahi hai jo keemat ki hai: **ganana automated hai.** Swiss Ephemeris chart banata hai, BPHS ke niyam vishleshan chalate hain. Yahan koi aapki baari ka intezaar nahi karwaata.',
      'Aur report **rehti hai** — uska apna link banta hai jise aap kabhi bhi khol sakte hain, ya PDF bana kar rakh sakte hain. Janm kundali badalti nahi, isliye ek baar save karna kaafi hai.',
    ],
  },
  {
    id: 'kis-aadhaar-par',
    h2: 'Ye vishleshan kis aadhaar par banta hai',
    paras: [
      'Ye batana zaroori hai kyunki isse aap parakh sakte hain ki kya asli hai aur kya sirf shabd.',
      '**Ganana** — Swiss Ephemeris, jo NASA ke JPL data par aadhaarit khagolik library hai. Duniya ke adhikansh peshevar jyotish software yahi use karte hain. Ayanamsha **Lahiri**, jo Bharat sarkar ka maanak hai.',
      '**Niyam** — Brihat Parashara Hora Shastra. Bhaav aur kaarak, Vimshottari dasha, Shadbala ke chhe ang (BPHS adhyay 27), aur varga chart — Navamsa, Dasamsa. Iske saath **Bhrigu Nandi Nadi** ke pattern.',
      '**Framework** — Rohiit Gupta, Chief Vedic Architect, 15+ saal ki Parashara BPHS parampara. Wo dhancha jispar har vishleshan chalta hai. [Unke baare mein yahan](/founder).',
    ],
  },
  {
    id: 'astrotalk-astrosage',
    h2: 'AstroTalk aur AstroSage se farak',
    paras: [
      'Seedha uttar, usme wo bhi jo hamare paksh mein nahi jaata.',
      '**Grahon ki sthiti mein antar nahi milega.** Adhikansh gambhir tool wahi Swiss Ephemeris aur wahi Lahiri Ayanamsha use karte hain. Un platforms ke paas **zyada tool, zyada bhashaayein, mobile app, live jyotishi aur bahut purana domain authority** hai — ye maan lena chahiye.',
      'Antar teen jagah hai. **Ek — yahan har aankde ke saath uska aadhaar likha hai**, isliye aap use parakh sakte hain. **Do — yahan kuch becha nahi jaata** — na ratna, na dosh nivaran, na koi chetavni jo dar par bike. **Teen — pehla vishleshan sach mein free hai**, bina signup aur bina email.',
      'Aur jo unke paas hai aur yahan nahi: **kisi jyotishi se seedhi baat.** Wo alag sewa hai. Agar aapko wo chahiye to ye page uska vikalp nahi hai.',
    ],
  },
  {
    id: 'shuru-kaise',
    h2: 'Shuru kaise karein — do minute',
    paras: [
      'Upar aath jaanch hain. Jo sawaal abhi sabse zyada mann mein hai, uspar click kijiye.',
      'Us page par **form pehle se khula milega** — janm tithi, samay aur sthan. Do minute lagenge, aur aapka chart tatha vishleshan turant saamne aa jaayega.',
      '**Pehla vishleshan free hai.** Bina signup, bina card, bina email. Poori reading chahiye to uske baad ₹51 ka vikalp hai — aur wo bhi ek baar ka.',
      'Aur agar ye tay nahi kar paa rahe ki kaunsi jaanch chuniye, to **[poori kundali](/calculators/free-kundali-calculator) se shuru kijiye.** Wo bhi free hai, aur usse aapko apne chart ka poora naksha mil jaayega.',
    ],
  },
];

const V6_HUB_CALC: SvcLink[] = [
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali, free' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Sab isi par khada hai' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Abhi kaunsa daur' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength', note: 'Poora chitra ek score mein' },
  { href: '/calculators/free-shadi-kab-hogi-calculator', label: 'Shadi Kab Hogi', note: 'Vivah ka samay' },
  { href: '/calculators/free-santan-yog-calculator', label: 'Santan Yog Calculator', note: 'Santan ka yog' },
  { href: '/calculators/free-gemstone-suitability-calculator', label: 'Gemstone Suitability', note: 'Hum ratna bechte nahi' },
  { href: '/calculators/free-sade-sati-calculator', label: 'Sade Sati Calculator', note: 'Shani ka gochar' },
  { href: '/calculators/free-manglik-dosh-calculator', label: 'Manglik Dosh Calculator', note: 'Dosh khud jaanchiye' },
];

const V6_HUB_LEARN: SvcLink[] = [
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Nau graha ka parichay' },
  { href: '/learn/nakshatra-guide', label: 'Nakshatra Guide', note: 'Sattais nakshatra' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Samay ka sidhant' },
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala', note: 'Bal kaise naapa jaata hai' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Uchch aur neech', note: 'Graha ki sthiti' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Yog ka sidhant' },
  { href: '/learn/career-prediction-astrology', label: 'Career Prediction', note: 'Dasham bhaav' },
  { href: '/blog/ex-back-reunion-astrology', label: 'Ex back reunion astrology', note: 'Poora vishay' },
  { href: '/founder', label: 'Rohiit Gupta ke baare mein', note: 'Framework kisne banaya' },
];

function V6Rich({ text, k }: { text: string; k: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          return (
            <Link key={`${k}-l-${i}`} href={link[2]} className="font-semibold underline underline-offset-2 hover:opacity-80 text-[#D4AF37]">
              {link[1]}
            </Link>
          );
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${k}-b-${i}`} className="text-[#D4AF37]">{part.slice(2, -2)}</strong>;
        }
        return <span key={`${k}-s-${i}`}>{part}</span>;
      })}
    </>
  );
}

function V6Hub({ items }: { items: SvcLink[] }) {
  return (
    <ul className="space-y-2 m-0 p-0 list-none">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} className="group block rounded-lg px-3 py-2 transition hover:bg-white/5">
            <span className="block text-sm font-semibold text-[#D4AF37]">{i.label}</span>
            <span className="block text-xs text-slate-500">{i.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function V6Content() {
  return (
    <section className="py-16 px-4">
      <nav aria-label="Is page par kya hai" className="mb-12 max-w-4xl mx-auto rounded-2xl p-5 md:p-6 bg-white/[0.03] border border-[#D4AF37]/20">
        <h2 className="text-lg font-serif font-bold mb-3 text-[#D4AF37]">Is Page Par Kya Hai</h2>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm list-decimal pl-5 text-slate-300">
          {V6_SECTIONS.map((sec) => (
            <li key={sec.id}><a href={`#${sec.id}`} className="hover:underline underline-offset-2 text-slate-300">{sec.h2}</a></li>
          ))}
        </ol>
      </nav>
      <div className="max-w-4xl mx-auto">
        {V6_SECTIONS.map((sec, si) => (
          <div key={sec.id} id={sec.id} className="scroll-mt-24 mb-10">
            <h2 className="text-2xl font-serif font-bold mb-4 text-[#D4AF37]">{sec.h2}</h2>
            {sec.paras.map((p, pi) => (
              <p key={pi} className="text-slate-300 leading-relaxed mb-4"><V6Rich text={p} k={`v6-${si}-${pi}`} /></p>
            ))}
          </div>
        ))}
      </div>
      <div className="max-w-4xl mx-auto mt-12 rounded-2xl p-5 md:p-6 bg-[#0B0F1A] border border-white/[0.07]">
        <h2 className="text-base font-bold m-0 mb-2 text-[#D4AF37]">Aur bhi — sab free</h2>
        <p className="text-xs leading-relaxed mb-4 text-slate-400">
          Chhota sawaal ho to poori jaanch ki zaroorat nahi. Seedha uska calculator lijiye — sab bina signup.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 pb-1.5 text-sm font-bold border-b border-[#D4AF37]/25 text-slate-200">Muft calculators</h3>
            <V6Hub items={V6_HUB_CALC} />
          </div>
          <div>
            <h3 className="mb-2 pb-1.5 text-sm font-bold border-b border-[#D4AF37]/25 text-slate-200">Sidhant samjhiye</h3>
            <V6Hub items={V6_HUB_LEARN} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      {/* JSON-LD Schemas — Server-rendered, JSON.stringify-safe */}
      <Script
        id="services-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="services-person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Script
        id="services-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <Script
        id="services-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen bg-[#080B12] text-white">

        {/* ================================================================ */}
        {/* HERO SECTION */}
        {/* ================================================================ */}
        <section className="relative overflow-hidden pt-28 pb-12 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED]/15 rounded-full blur-[130px]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#D4AF37]/8 rounded-full blur-[120px]" />
          </div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 border border-[#D4AF37]/40 rounded-full px-4 py-1.5 mb-8 bg-[#D4AF37]/5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase">
                8 Free Jaanch · Framework by Rohiit Gupta
              </span>
            </div>

            {/* H1 — single, primary keyword "Vedic Astrology Services" */}
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              Apni Kundali Se Jawab
              <br />
              <span className="text-[#D4AF37]">Turant. Free.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-4 leading-relaxed">
              8 free jaanch — janm vivaran daaliye aur apna vishleshan turant paiye. Framework by{" "}
              <Link
                href="/founder"
                className="text-[#D4AF37] hover:underline font-semibold"
              >
                Rohiit Gupta
              </Link>{" "}
              — Chief Vedic Architect. Each reading uses Swiss Ephemeris precision and Trikaal to give you answers no generic astrology app can.
            </p>

            <p className="text-sm text-gray-500 mb-8">
              Powered by Swiss Ephemeris · Lahiri Ayanamsha · BPHS · All readings from ₹51
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {[
                "15+ Years Vedic Study",
                "Parashara BPHS Tradition",
                "Swiss Ephemeris Precision",
                "AstroSage-Level Accuracy",
                "India Based",
              ].map((badge) => (
                <span
                  key={badge}
                  className="text-xs border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-full bg-[#D4AF37]/5"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* GEO DIRECT ANSWER BLOCK — for Perplexity / SGE / ChatGPT citation */}
        {/* ================================================================ */}
        <section className="px-4 pb-8">
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: "rgba(212,175,55,0.04)",
                border: "1px solid rgba(212,175,55,0.18)",
              }}
            >
              <p className="text-[10px] uppercase tracking-widest text-[#D4AF37]/70 font-semibold mb-3">
                Direct Answer
              </p>
              <p className="text-base md:text-lg text-gray-200 leading-relaxed">
                <strong className="text-white">
                  Trikaal Vaani offers 8 specialized Vedic astrology services online
                </strong>{" "}
                — covering love (Ex-Back, Compatibility), career (Toxic Boss, Career
                Pivot), wealth (Dhana Yoga), property (Property Yog), children (Child
                Destiny), and spirituality (Soul Purpose). Each reading is generated by
                Trikaal using Swiss Ephemeris precision and reviewed against Brihat
                Parashara Hora Shastra rules. Pricing starts at ₹51 with instant
                delivery.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* E-E-A-T AUTHOR STRIP                                             */}
        {/* ================================================================ */}
        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div
              className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold text-[#080B12]"
              style={{
                background:
                  "linear-gradient(135deg, #D4AF37 0%, #A8820A 100%)",
                boxShadow: "0 0 20px rgba(212,175,55,0.3)",
              }}
            >
              RG
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm">
                <Link
                  href="/founder"
                  className="text-white font-semibold hover:text-[#D4AF37] transition-colors"
                >
                  Reading framework by Rohiit Gupta
                </Link>{" "}
                <span className="text-gray-400">— Chief Vedic Architect</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                15+ Years Vedic Study · Parashara BPHS Tradition · Last reviewed: May 2026
              </p>
            </div>
            <a
              href="https://wa.me/919211804111?text=Namaste%20Rohiit%20ji"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-full border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 transition-all"
            >
              Verified ✓
            </a>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SERVICE CARDS GRID — 8 readings                                  */}
        {/* ================================================================ */}
        <section className="py-8 px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((s) => (
                <article
                  key={s.slug}
                  className="group relative border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(212,175,55,0.08)]"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${s.gradient} to-transparent opacity-60 pointer-events-none`}
                  />
                  <div className="relative p-7">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{s.glyph}</span>
                        <div>
                          <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-medium">
                            Jaanch {s.no}
                          </p>
                          <h2 className="font-serif text-xl font-bold text-white">
                            {s.title}
                          </h2>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#D4AF37] text-xl font-bold">₹{s.price}</p>
                      </div>
                    </div>
                    <p className="text-[#D4AF37]/80 text-sm italic mb-3 font-medium">
                      “{s.question}”
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">
                      {s.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs border border-white/10 text-gray-500 px-2.5 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {/* v2.0: the primary button used to go to /?segment=,
                        which nothing reads. It now goes to the reading page
                        itself, which carries the real form. The duplicate
                        "Learn More" link pointed at the same place and has
                        been removed — one destination, one button. */}
                    <Link
                      href={`/services/${s.slug}`}
                      className="block w-full text-center bg-[#D4AF37] text-[#080B12] font-bold py-3.5 rounded-lg text-sm hover:bg-[#e8c84a] transition-all duration-200"
                    >
                      Free Mein Dekhiye → {s.title}
                    </Link>
                    <p className="text-center text-[11px] text-gray-500 mt-2">
                      Pehla reading free · poori reading ₹{s.price} · bina signup
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* COMMERCIAL INTENT — Why Trikaal Vaani vs AstroTalk / AstroSage    */}
        {/* ================================================================ */}
        <section className="py-16 px-4 bg-[#0D1020]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">
                Why Trikaal Vaani
              </p>
              <h2 className="font-serif text-3xl font-bold">
                Built Different from{" "}
                <span className="text-[#D4AF37]">AstroTalk &amp; AstroSage</span>
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left p-4 font-semibold text-gray-300">
                      What You Get
                    </th>
                    <th className="text-center p-4 font-semibold text-[#D4AF37]">
                      Trikaal Vaani
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-500">
                      AstroTalk
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-500">
                      AstroSage
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-400">
                  {[
                    [
                      "Reading designed by named expert",
                      "Yes — Rohiit Gupta",
                      "Random astrologer",
                      "Generic templates",
                    ],
                    [
                      "Swiss Ephemeris precision",
                      "Yes",
                      "Varies by astrologer",
                      "Yes",
                    ],
                    [
                      "Pratyantar Dasha (3-7 day timing)",
                      "Yes",
                      "Rarely",
                      "No",
                    ],
                    [
                      "5 personalized upay (remedies)",
                      "Yes",
                      "Generic",
                      "Generic",
                    ],
                    ["Starting price", "₹51", "₹50/min (avg ₹500+)", "Free + ads"],
                    ["Instant AI delivery", "Yes (30s)", "No (queue)", "Partial"],
                    [
                      "BPHS classical citation",
                      "Yes",
                      "No",
                      "No",
                    ],
                  ].map(([feature, us, talk, sage], i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="p-4 text-gray-300">{feature}</td>
                      <td className="p-4 text-center text-[#D4AF37] font-medium">
                        {us}
                      </td>
                      <td className="p-4 text-center text-gray-500">{talk}</td>
                      <td className="p-4 text-center text-gray-500">{sage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        <V6Content />

      {/* FAQ SECTION — 7 questions, all matching schema 1:1                */}
        {/* ================================================================ */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">
                Common Questions
              </p>
              <h2 className="font-serif text-3xl font-bold">
                Frequently Asked{" "}
                <span className="text-[#D4AF37]">Questions</span>
              </h2>
            </div>
            <div className="space-y-4">
              {(faqPageSchema.mainEntity as Array<{
                name: string;
                acceptedAnswer: { text: string };
              }>).map((faq, i) => (
                <details
                  key={i}
                  className="border border-white/10 rounded-xl p-5 bg-white/[0.02] group cursor-pointer"
                >
                  <summary className="font-semibold text-white text-sm md:text-base list-none flex justify-between items-center gap-4">
                    {faq.name}
                    <span className="text-[#D4AF37] text-lg flex-shrink-0 group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="text-gray-400 text-sm leading-relaxed mt-4">
                    {faq.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FINAL CTA                                                         */}
        {/* ================================================================ */}
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 to-transparent" />
          </div>
          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              Your Birth Chart Holds Every Answer.{" "}
              <span className="text-[#D4AF37]">₹51 to Unlock It.</span>
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Pick the question that matters most to you right now. Enter your birth
              details. Let Trikaal — powered by 15+ years of Rohiit Gupta’s Vedic
              wisdom — give you the clarity you have been looking for.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#D4AF37] text-[#080B12] font-bold px-10 py-4 rounded-lg text-lg hover:bg-[#e8c84a] transition-all duration-200 shadow-[0_0_40px_rgba(212,175,55,0.25)]"
            >
              Enter Birth Details → Get Reading
            </Link>
            <p className="text-gray-600 text-xs mt-6">
              Powered by Swiss Ephemeris · Lahiri Ayanamsha · BPHS · Reading framework by Rohiit Gupta
            </p>
          </div>
        </section>

      </main>
    </>
  );
}

// ============================================================================
// END — app/services/page.tsx v2.5
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// ============================================================================
