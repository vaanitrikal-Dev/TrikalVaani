// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════
// File:        app/panchang/[date]/page.tsx
// Version:     v2.1
// Owner:       Rohiit Gupta, Chief Vedic Architect
// Domain:      trikalvaani.com
//
// FIXES vs v2.0:
//   1. No more blank/black screen — shows "coming soon" page if no data
//   2. Festival dates show rich SEO/GEO/AEO content (Shani Jayanti,
//      Guru Purnima, Diwali, Janmashtami, Vat Savitri etc.)
//   3. Festival pages: Significance + Do's + Don'ts + Remedies + FAQ
//   4. Event schema + FAQPage schema added for festival dates
//   5. Everything else identical to v2.0
// ════════════════════════════════════════════════════════════════════

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 86400;
export const dynamicParams = true;

const SITE_URL = "https://trikalvaani.com";
const AUTHOR_NAME = "Rohiit Gupta";
const AUTHOR_TITLE = "Chief Vedic Architect, Trikal Vaani";
const VM_URL = "http://34.14.164.105:8001";

// ── Festival SEO/GEO/AEO content ─────────────────────────────────────
type FestivalInfo = {
  name: string;
  nameHindi: string;
  planet: string;
  geoAnswer: string;
  significance: string;
  dos: string[];
  donts: string[];
  remedies: string[];
  faq: { q: string; a: string }[];
};

const FESTIVALS: Record<string, FestivalInfo> = {
  "2026-05-16": {
    name: "Shani Jayanti 2026", nameHindi: "शनि जयंती", planet: "Saturn (Shani)",
    geoAnswer: "Shani Jayanti 2026 falls on Saturday, 16 May 2026 — the birth anniversary of Lord Shani (Saturn). It is the most powerful day of the year to appease Saturn, remove Shani Dosha, and reduce Sade Sati effects. Observe fast, light mustard oil lamp, donate black sesame and black cloth.",
    significance: "Shani Jayanti is the birth anniversary of Lord Shani Dev — the planet Saturn, lord of karma, discipline, and justice. In Vedic astrology, a strong and appeased Saturn grants longevity, career success, land, property, and spiritual liberation (Moksha). An afflicted Saturn causes delays, obstacles, disease, and poverty. This day is the most powerful annual window to reset your karmic relationship with Saturn — especially critical if you are running Shani Mahadasha, Sade Sati, or have Saturn in the 1st, 4th, 7th, 10th, or 12th house.",
    dos: [
      "Observe Vrat (fast) from sunrise to sunset — consume only fruits and milk",
      "Light a mustard oil lamp (sarso tel ka diya) before Shani's idol at sunset",
      "Donate black sesame seeds, black urad dal, and black cloth to the needy",
      "Chant Shani Beej Mantra 108 times: ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",
      "Visit Shani temple — especially Shingnapur, Thirunallar, or your local Shani mandir",
      "Feed black animals: black dog, black buffalo, black crow",
      "Wear blue or black clothing on this day",
      "Read Shani Chalisa and Shani Stotram in the evening",
    ],
    donts: [
      "Do not consume meat, alcohol, or non-vegetarian food",
      "Do not cut hair or nails on Shani Jayanti",
      "Avoid starting new business ventures or signing contracts today",
      "Do not argue with elders, servants, or labourers",
      "Avoid purchasing iron or metal objects",
      "Do not disrespect crows — they are Shani's vehicle (vahana)",
    ],
    remedies: [
      "Pour mustard oil on a Shani idol or image — clears Saturn's malefic gaze",
      "Wrap black sesame seeds in black cloth and immerse in flowing water",
      "Serve the poor, disabled, and elderly — Saturn is instantly pleased by seva",
      "Recite Shani's 108 names (Ashtottara Shatanamavali) at night",
      "If in Sade Sati: consult Rohiit Gupta for personalised Saturn remedy",
    ],
    faq: [
      { q: "When is Shani Jayanti 2026?", a: "Shani Jayanti 2026 falls on Saturday, 16 May 2026, during Amavasya of Jyeshtha month, Krishna Paksha." },
      { q: "What is the best time to worship Shani on Shani Jayanti?", a: "The best time is at sunrise (Pratah Kaal) and at sunset when you light the mustard oil lamp. Avoid noon for Saturn worship." },
      { q: "Can Shani Jayanti remove Sade Sati effects?", a: "Yes. Fasting, oil lamp, black sesame donation, and Shani mantra on this day significantly reduces the malefic effects of Sade Sati and Shani Dhaiya." },
      { q: "What to donate on Shani Jayanti?", a: "Donate black sesame, black urad dal, black cloth, mustard oil, and iron items. Feeding a black dog is considered especially effective." },
    ],
  },
  "2026-05-27": {
    name: "Vat Savitri Vrat 2026", nameHindi: "वट सावित्री व्रत", planet: "Sun (Surya) + Saturn (Shani)",
    geoAnswer: "Vat Savitri Vrat 2026 falls on Wednesday, 27 May 2026. Observed by married Hindu women for husband's longevity by fasting and tying sacred threads around a banyan tree, praying to Savitri who brought her husband back from Yama.",
    significance: "Vat Savitri Vrat commemorates Savitri's devotion — she followed Yama, the god of death, and through wisdom brought her husband Satyavan back to life. Women fast and worship the Banyan tree (Vat Vriksha) — symbol of longevity, fertility, and eternal bonds.",
    dos: ["Married women observe a day-long fast for husband's longevity", "Worship the Banyan tree — tie red thread around it 108 times", "Offer water, flowers, and sweets to the Banyan tree", "Read or listen to the Savitri-Satyavan katha", "Apply sindoor and wear traditional bridal jewelry as Saubhagya sign"],
    donts: ["Do not consume salt during the fast", "Avoid cutting or damaging any tree", "Do not wash hair on this day", "Widows do not observe this vrat"],
    remedies: ["If husband has health issues — tie 108 threads around Banyan tree while chanting Savitri mantra", "For delayed marriage — touch roots of Banyan tree and pray to Savitri for a worthy partner"],
    faq: [
      { q: "When is Vat Savitri Vrat 2026?", a: "Vat Savitri Vrat 2026 is on Wednesday, 27 May 2026, during Jyeshtha Krishna Paksha Amavasya." },
      { q: "Who observes Vat Savitri Vrat?", a: "Married Hindu women observe this vrat for the long life and prosperity of their husbands. Particularly popular in North India, Maharashtra, and Gujarat." },
    ],
  },
  "2026-07-03": {
    name: "Guru Purnima 2026", nameHindi: "गुरु पूर्णिमा", planet: "Jupiter (Guru/Brihaspati)",
    geoAnswer: "Guru Purnima 2026 falls on Friday, 3 July 2026 — the most sacred day to honour your Guru, teacher, and Jupiter (Brihaspati). Born on this Purnima, Maharishi Veda Vyasa compiled the Vedas. Seek your Guru's blessings, study spiritual texts, and strengthen Jupiter in your kundali.",
    significance: "Guru Purnima is the birthday of Maharishi Veda Vyasa — the compiler of the four Vedas, 18 Puranas, and the Mahabharata. Jupiter (Guru) represents wisdom, dharma, marriage, children, wealth, and liberation. This is the single most powerful day of the year to strengthen Jupiter in your kundali and seek a Guru's blessing.",
    dos: ["Visit your Guru and offer flowers, fruits, and dakshina", "Read Guru Gita, Vishnu Sahasranama, or your Guru's teachings", "Start a new course of study — ideal day to begin learning", "Fast and break only after evening prayers", "Donate yellow items — yellow cloth, sweets, turmeric, gold — to Brahmins", "Chant Brihaspati Beej Mantra 108 times: ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः", "Wear yellow clothing to honour Jupiter"],
    donts: ["Do not criticise or disrespect your teacher, parents, or elders", "Avoid non-vegetarian food and alcohol", "Do not start arguments or legal disputes", "Do not be arrogant about your own knowledge"],
    remedies: ["If Jupiter is weak in kundali: donate yellow moong dal and turmeric to a temple", "For delayed marriage or children: fast and offer bananas to a Vishnu temple", "For wealth and wisdom: study any sacred text for at least 30 minutes"],
    faq: [
      { q: "When is Guru Purnima 2026?", a: "Guru Purnima 2026 is on Friday, 3 July 2026, on the Purnima of Ashadha month." },
      { q: "What is the significance of Guru Purnima in astrology?", a: "Guru Purnima is ruled by Jupiter — the planet of wisdom, dharma, and prosperity. Honouring your Guru on this day strengthens Jupiter, improving marriage, children, wealth, and spiritual growth." },
      { q: "What to donate on Guru Purnima?", a: "Donate yellow items — turmeric, yellow cloth, yellow sweets, bananas, and gold — to your Guru, Brahmins, or a temple. Strengthens Jupiter and removes obstacles in education and prosperity." },
    ],
  },
  "2026-08-22": {
    name: "Janmashtami 2026", nameHindi: "जन्माष्टमी", planet: "Moon (Chandra) + Jupiter (Guru)",
    geoAnswer: "Janmashtami 2026 falls on Saturday, 22 August 2026 — birth anniversary of Lord Krishna, born at midnight on Ashtami of Krishna Paksha in Bhadrapada. Fast until midnight, perform Bal Gopal puja at 12 AM, break fast after Krishna's birth. Most powerful day for Moon and devotion.",
    significance: "Janmashtami celebrates the birth of Lord Krishna — eighth avatar of Vishnu and speaker of the Bhagavad Gita. Krishna is associated with the Moon (mind, emotions) and Jupiter (wisdom, dharma). Worshipping Krishna strengthens the Moon in your kundali, improving mental peace, relationship harmony, and spiritual wisdom.",
    dos: ["Fast from sunrise until midnight", "Decorate a cradle (jhula) for Bal Gopal with flowers and sweets", "At midnight: bathe Krishna idol with panchamrit (milk, curd, honey, ghee, sugar)", "Offer butter, mishri, and tulsi leaves", "Read or listen to Bhagavad Gita — even one chapter", "Chant Hare Krishna Maha Mantra 108 times", "Break fast after midnight puja with panchamrit prasad"],
    donts: ["Do not consume grains during fast — only fruits, milk, sabudana", "Avoid non-vegetarian food and alcohol", "Do not sleep before midnight on Janmashtami"],
    remedies: ["For weak Moon in kundali: bathe Krishna idol with milk and offer white flowers", "For relationship issues: perform midnight puja with your partner", "For mental peace and anxiety: recite the 18th chapter of Bhagavad Gita"],
    faq: [
      { q: "When is Janmashtami 2026?", a: "Janmashtami 2026 is on Saturday, 22 August 2026 — Ashtami of Krishna Paksha in Bhadrapada month." },
      { q: "What time was Krishna born on Janmashtami?", a: "Lord Krishna was born at midnight (Nishita Kaal) — between 12:00 AM and 12:48 AM. This is when the main puja and abhishek of the idol is performed." },
    ],
  },
  "2026-10-21": {
    name: "Diwali 2026", nameHindi: "दीपावली", planet: "Venus (Shukra) + Jupiter (Guru)",
    geoAnswer: "Diwali 2026 falls on Wednesday, 21 October 2026. The festival of lights celebrates Lord Rama's return to Ayodhya and Goddess Lakshmi's annual visit to clean, well-lit homes. Perform Lakshmi-Ganesha puja at Pradosh Kaal (sunset to nightfall), light oil diyas in every corner, open new account books.",
    significance: "Diwali — the festival of lights — is the most celebrated day in the Hindu calendar. Goddess Lakshmi visits homes that are clean, bright with diyas, and filled with devotion. Lord Ganesha removes obstacles so Lakshmi's blessings can flow freely. Diwali night is the most powerful annual window for wealth manifestation, business sanctification, and Lakshmi upasana.",
    dos: ["Deep clean your home before Diwali — Lakshmi does not enter dirty spaces", "Light pure ghee or sesame oil diyas in every corner at sunset", "Perform Lakshmi-Ganesha puja at Pradosh Kaal", "Open new account books (Chopda Puja) for business", "Wear new clothes — red, yellow, or gold colours", "Exchange sweets and gifts with family and employees", "Donate to the poor before puja — Lakshmi blesses generous givers", "Light a diya at the entrance to guide Lakshmi inside"],
    donts: ["Do not gamble — it brings debt, not wealth", "Avoid alcohol and non-vegetarian food on puja day", "Do not sleep during the day", "Do not sweep or throw garbage after sunset on Diwali night", "Avoid arguments and negative emotions — they repel Lakshmi"],
    remedies: ["If facing financial difficulties: place 11 cowrie shells at Lakshmi's feet during puja", "For business growth: write 'Shubh Labh' at your shop entrance in red", "For wealth: keep a gold coin or silver rupee in your puja thali overnight"],
    faq: [
      { q: "When is Diwali 2026?", a: "Diwali 2026 is on Wednesday, 21 October 2026, on Kartik Krishna Paksha Amavasya." },
      { q: "What is the best time for Lakshmi Puja on Diwali 2026?", a: "The Lakshmi Puja Muhurat on Diwali 2026 is at Pradosh Kaal — approximately 6:00 PM to 8:00 PM IST. The exact muhurat varies by city. Get your personalised muhurat from Trikal Vaani." },
      { q: "Why is Diwali celebrated on Amavasya?", a: "Diwali on Amavasya represents lighting the darkness — defeating Adharma with light. The New Moon night is when Goddess Lakshmi is said to walk the Earth and bless homes with lit diyas." },
    ],
  },
  "2026-10-02": {
    name: "Sharad Navratri 2026 Begins", nameHindi: "शारदीय नवरात्रि", planet: "Moon (Chandra) + Venus (Shukra)",
    geoAnswer: "Sharad Navratri 2026 begins on Friday, 2 October 2026 — nine nights of Goddess Durga, Lakshmi, and Saraswati. The most powerful period of the year for feminine energy, wealth manifestation, and spiritual awakening. Fast, worship Devi, and perform Navarna Mantra jaap daily.",
    significance: "Navratri means 'nine nights' — dedicated to the nine forms of Goddess Durga. Ruled by Moon and Venus, this is the most powerful annual period for spiritual energy, protection, and wealth. The veil between worlds is thinnest — prayers have maximum impact. Each day is dedicated to a different form of Devi.",
    dos: ["Fast for all nine days or at minimum on Day 1 and Day 9", "Set up a Devi altar with red cloth, flowers, and a diya", "Recite Durga Saptashati (700 verses) over the nine days", "Chant Navarna Mantra: ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे", "Wear colour of the day: red, royal blue, yellow, green, grey, orange, white, pink, sky blue", "Invite young girls (Kanya Pujan) on Ashtami or Navami"],
    donts: ["Avoid non-vegetarian food and alcohol during all nine days", "Do not consume onion and garlic if doing Navratri vrat", "Avoid haircut, shaving, and nail cutting during Navratri", "Do not engage in negative speech or conflicts"],
    remedies: ["For all obstacles and enemies: recite Durga Kavach daily", "For wealth: worship Lakshmi form on Day 3, 4, and 5", "For knowledge and career: worship Saraswati on Day 7 and 8"],
    faq: [
      { q: "When is Sharad Navratri 2026?", a: "Sharad Navratri 2026 begins on Friday, 2 October 2026 and ends on Saturday, 10 October 2026 (Dussehra)." },
      { q: "What are the nine forms of Durga in Navratri?", a: "The nine forms are: Shailputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri, Mahagauri, and Siddhidatri — each worshipped on one day of Navratri." },
    ],
  },
};

// ── Supabase + VM (same as v2.0) ─────────────────────────────────────
function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

type PanchangRow = {
  date: string; tithi: string; nakshatra: string; yoga: string; karana: string;
  vara: string; sunrise: string; sunset: string; rahu_kaal: string;
  geo_answer: string | null; seo_title: string | null; seo_description: string | null;
  faq_schema: object[] | null; gemini_content: string | null;
};

type VMPanchang = {
  date: string; weekday?: string; vara?: string;
  tithi: { name: string; paksha: string }; nakshatra: { name: string; pada: number };
  yoga: { name: string }; karana: { name: string };
  sunrise: string; sunset: string; rahu_kaal: string;
};

function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  const y = d.getUTCFullYear();
  return y >= 2020 && y <= 2100;
}

function formatHuman(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  });
}

async function fetchFromSupabase(date: string): Promise<PanchangRow | null> {
  try {
    const { data, error } = await getSupabase()
      .from("panchang_daily")
      .select("date,tithi,nakshatra,yoga,karana,vara,sunrise,sunset,rahu_kaal,geo_answer,seo_title,seo_description,faq_schema,gemini_content")
      .eq("date", date).eq("city", "delhi").single();
    if (error || !data) return null;
    return data as PanchangRow;
  } catch { return null; }
}

async function fetchFromVM(date: string): Promise<PanchangRow | null> {
  try {
    const res = await fetch(`${VM_URL}/panchang?date=${date}`, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const vm = (await res.json()) as VMPanchang;
    const human = formatHuman(date);
    return {
      date, tithi: `${vm.tithi.name} (${vm.tithi.paksha})`,
      nakshatra: `${vm.nakshatra.name} Pada ${vm.nakshatra.pada}`,
      yoga: vm.yoga.name, karana: vm.karana.name,
      vara: vm.weekday ?? vm.vara ?? "",
      sunrise: vm.sunrise, sunset: vm.sunset, rahu_kaal: vm.rahu_kaal,
      geo_answer: `On ${human}, Tithi is ${vm.tithi.name} (${vm.tithi.paksha}), Nakshatra is ${vm.nakshatra.name} Pada ${vm.nakshatra.pada}, Yoga ${vm.yoga.name}, Karana ${vm.karana.name}. Sunrise: ${vm.sunrise}, Sunset: ${vm.sunset}, Rahu Kaal: ${vm.rahu_kaal} (Delhi NCR).`,
      seo_title: null, seo_description: null, faq_schema: null, gemini_content: null,
    };
  } catch { return null; }
}

async function getPanchang(date: string): Promise<PanchangRow | null> {
  return (await fetchFromSupabase(date)) ?? (await fetchFromVM(date));
}

// ── Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { date: string } }): Promise<Metadata> {
  const { date } = params;
  if (!isValidDate(date)) return { title: "Panchang Not Found" };
  const festival = FESTIVALS[date];
  const human = formatHuman(date);
  const url = `${SITE_URL}/panchang/${date}`;
  const db = await fetchFromSupabase(date);

  const title = festival
    ? `${festival.name} — Panchang, Rituals, Do's & Don'ts`
    : db?.seo_title?.replace(/\s*\|\s*Trikal Vaani\s*$/i, "")
      ?? `Aaj Ka Panchang ${human} | Tithi, Nakshatra, Rahu Kaal`;

  const description = festival?.geoAnswer
    ?? db?.seo_description
    ?? `Vedic Panchang for ${human}: Tithi, Nakshatra, Yoga, Karana, Rahu Kaal by Swiss Ephemeris. By Rohiit Gupta, Chief Vedic Architect.`;

  return {
    title, description,
    authors: [{ name: AUTHOR_NAME, url: `${SITE_URL}/founder` }],
    alternates: { canonical: url },
    openGraph: { title: `${title} | Trikal Vaani`, description, url, siteName: "Trikal Vaani", type: "article", locale: "en_IN" },
    twitter: { card: "summary_large_image", title: `${title} | Trikal Vaani`, description },
    robots: { index: true, follow: true },
  };
}

// ── Schema builder ────────────────────────────────────────────────────
function buildSchemas(p: PanchangRow | null, date: string, festival: FestivalInfo | undefined, url: string) {
  const human = formatHuman(date);
  const schemas: object[] = [
    {
      "@context": "https://schema.org", "@type": "Article",
      headline: festival ? festival.name : `Aaj Ka Panchang ${human}`,
      description: festival ? festival.geoAnswer : `Vedic Panchang for ${date}`,
      datePublished: date, dateModified: date,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Person", name: AUTHOR_NAME, jobTitle: AUTHOR_TITLE, url: `${SITE_URL}/founder` },
      publisher: { "@type": "Organization", name: "Trikal Vaani", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Panchang", item: `${SITE_URL}/panchang` },
        { "@type": "ListItem", position: 3, name: festival?.name ?? date, item: url },
      ],
    },
  ];

  const faqItems = festival
    ? festival.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
    : p?.faq_schema?.length ? p.faq_schema
    : p ? [
        { "@type": "Question", name: `What is the Tithi on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `${p.tithi}, Swiss Ephemeris, Lahiri Ayanamsha.` } },
        { "@type": "Question", name: `What is Rahu Kaal on ${human}?`, acceptedAnswer: { "@type": "Answer", text: `Rahu Kaal is ${p.rahu_kaal} (Delhi NCR).` } },
      ] : [];

  if (faqItems.length) schemas.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems });

  if (festival) schemas.push({
    "@context": "https://schema.org", "@type": "Event",
    name: festival.name, startDate: date, endDate: date,
    description: festival.significance,
    location: { "@type": "Place", name: "India", address: { "@type": "PostalAddress", addressCountry: "IN" } },
    organizer: { "@type": "Organization", name: "Trikal Vaani", url: SITE_URL },
  });

  return schemas;
}

// ── Page ─────────────────────────────────────────────────────────────
export default async function PanchangDatePage({ params }: { params: { date: string } }) {
  const { date } = params;
  if (!isValidDate(date)) notFound();

  const p = await getPanchang(date);
  const festival = FESTIVALS[date];
  const url = `${SITE_URL}/panchang/${date}`;
  const human = formatHuman(date);

  // FIX: no more black screen — show proper "coming soon" if no data + no festival
  if (!p && !festival) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-20">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="text-5xl mb-6">🔱</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Panchang for {human}</h1>
          <p className="text-gray-600 mb-2">This date's panchang is being computed by our Swiss Ephemeris engine.</p>
          <p className="text-gray-500 text-sm mb-8">Daily panchang is generated at 4:00 AM IST. Please check back shortly.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/panchang" className="rounded-lg bg-amber-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-amber-700">← View Today's Panchang</Link>
            <Link href="/predict" className="rounded-lg border border-amber-300 text-amber-700 px-5 py-2.5 text-sm font-semibold hover:bg-amber-50">Get Personal Reading →</Link>
          </div>
        </div>
      </main>
    );
  }

  const schemas = buildSchemas(p, date, festival, url);
  const geoAnswer = p?.geo_answer ?? festival?.geoAnswer ?? `Vedic Panchang for ${human}. Swiss Ephemeris, Lahiri Ayanamsha.`;

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">

          <nav className="mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-amber-700">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/panchang" className="hover:text-amber-700">Panchang</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{festival ? festival.name : date}</span>
          </nav>

          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {festival ? `${festival.name} (${festival.nameHindi})` : `Aaj Ka Panchang — ${human}`}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {human} · By <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE} ·{" "}
              <span className="text-amber-700">Swiss Ephemeris · Lahiri Ayanamsha</span>
            </p>
            {festival && <p className="mt-1 text-sm text-amber-700 font-medium">Planetary Ruler: {festival.planet}</p>}
          </header>

          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="Quick answer">
            <p className="text-base leading-relaxed text-gray-800">{geoAnswer}</p>
          </section>

          {/* Festival content */}
          {festival && (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Significance</h2>
                <p className="text-gray-700 leading-relaxed">{festival.significance}</p>
              </section>

              <div className="mb-8 grid md:grid-cols-2 gap-6">
                <section className="rounded-xl bg-emerald-50 border border-emerald-200 p-5">
                  <h2 className="text-lg font-bold text-emerald-900 mb-3">✅ Do's — क्या करें</h2>
                  <ul className="space-y-2">
                    {festival.dos.map((d, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-emerald-600 mt-0.5 shrink-0">✓</span>{d}</li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-xl bg-rose-50 border border-rose-200 p-5">
                  <h2 className="text-lg font-bold text-rose-900 mb-3">❌ Don'ts — क्या न करें</h2>
                  <ul className="space-y-2">
                    {festival.donts.map((d, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-rose-500 mt-0.5 shrink-0">✕</span>{d}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="mb-8 rounded-xl bg-purple-50 border border-purple-200 p-5">
                <h2 className="text-lg font-bold text-purple-900 mb-3">🔮 Vedic Remedies</h2>
                <ul className="space-y-2">
                  {festival.remedies.map((r, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-purple-600 mt-0.5 shrink-0">◆</span>{r}</li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Panchang grid */}
          {p && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{festival ? "Panchang for this Day" : "Today's Panchang"}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card label="Tithi" value={p.tithi} />
                <Card label="Nakshatra" value={p.nakshatra} />
                <Card label="Yoga" value={p.yoga} />
                <Card label="Karana" value={p.karana} />
                <Card label="Sunrise" value={p.sunrise} sub="IST" />
                <Card label="Sunset" value={p.sunset} sub="IST" />
                <Card label="Rahu Kaal" value={p.rahu_kaal} sub="Avoid auspicious work" />
                <Card label="Weekday" value={p.vara} />
              </div>
            </section>
          )}

          {p?.gemini_content && (
            <section className="mb-8 prose prose-amber max-w-none">
              <h2 className="text-2xl font-semibold">Vedic Insight for Today</h2>
              <p>{p.gemini_content}</p>
            </section>
          )}

          {!festival && (
            <section className="mb-8 prose prose-amber max-w-none">
              <h2 className="text-2xl font-semibold">Understanding Today's Panchang</h2>
              <p>The Panchang records five cosmic elements — Tithi, Nakshatra, Yoga, Karana, and Vara. Together they reveal the planetary mood of the day and guide auspicious timing (Muhurta) for important decisions.</p>
              {p && <p>On <strong>{human}</strong>, the Moon is in <strong>{p.nakshatra}</strong> and the Tithi is <strong>{p.tithi}</strong>. All calculations use Swiss Ephemeris anchored to Lahiri Ayanamsha — the standard accepted by the Government of India.</p>}
            </section>
          )}

          <section className="mb-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
            <h2 className="text-xl font-bold">
              {festival ? `Get your personal ${festival.name} reading` : "Want a personal reading for today?"}
            </h2>
            <p className="mt-2 text-sm opacity-95">
              {festival
                ? `Know how ${festival.name} affects YOUR kundali specifically.`
                : "Based on your birth chart and today's planetary positions. Free preview, ₹51 for full analysis."}
            </p>
            <Link href="/predict" className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-amber-700 hover:bg-amber-50">
              Start Free Reading →
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            {festival
              ? festival.faq.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)
              : p ? (
                <>
                  <FAQ q={`What is the Tithi on ${human}?`} a={`${p.tithi}, calculated using Swiss Ephemeris with Lahiri Ayanamsha.`} />
                  <FAQ q={`What is the Nakshatra on ${human}?`} a={`${p.nakshatra}.`} />
                  <FAQ q={`What is Rahu Kaal on ${human}?`} a={`Rahu Kaal is ${p.rahu_kaal} (Delhi NCR). Avoid auspicious work during this window.`} />
                  <FAQ q={`What time is sunrise on ${human}?`} a={`Sunrise: ${p.sunrise} IST, Sunset: ${p.sunset} IST (Delhi NCR).`} />
                </>
              ) : null}
          </section>

          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Explore More</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
              <li><Link href="/panchang" className="text-amber-700 hover:underline">Panchang Archive</Link></li>
              <li><Link href="/career" className="text-amber-700 hover:underline">Career Astrology</Link></li>
              <li><Link href="/wealth" className="text-amber-700 hover:underline">Wealth Astrology</Link></li>
              <li><Link href="/marriage" className="text-amber-700 hover:underline">Marriage Astrology</Link></li>
              <li><Link href="/health" className="text-amber-700 hover:underline">Health Astrology</Link></li>
              <li><Link href="/spirituality" className="text-amber-700 hover:underline">Spirituality</Link></li>
            </ul>
          </section>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>🔱 Calculated by <strong>{AUTHOR_NAME}</strong>, {AUTHOR_TITLE}. Engine: Swiss Ephemeris · Ayanamsha: Lahiri · Version: v2.1</p>
            <p className="mt-1 italic">"Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye."</p>
          </footer>

        </div>
      </main>
    </>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-600">{sub}</div>}
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="mb-2 rounded-lg border border-gray-200 bg-white p-4">
      <summary className="cursor-pointer font-medium text-gray-900">{q}</summary>
      <p className="mt-2 text-sm text-gray-700">{a}</p>
    </details>
  );
}
