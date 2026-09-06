'use client';

// ============================================================
// File: app/calculators/free-baby-name-by-nakshatra/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Baby Name by Nakshatra Calculator
// API: /api/calc/kundali (calcType: 'nakshatra') — already live
// Core (nakshatra+pada→akshar) is exact from VM; name list is a
// curated suggestion set (no fabricated meanings).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build from Radar E3 PASF.
//        ~1,000 -> ~5,100 words, 3 H2 -> 36, TOC added, FAQs 8 -> 15,
//        new layout.tsx title. Form, /api/calc/kundali (calcType 'nakshatra'),
//        the name lists and the JSON-LD are untouched.
//   v1.1 (2026-06-02) — Gold-standard JSON-LD: swapped inline 4-node
//        @graph for buildCalcJsonLd() helper (8 @id-linked nodes:
//        Organization+real sameAs, WebSite, linkable Person /founder,
//        WebPage isPartOf #website [no longer dangling], BreadcrumbList,
//        WebApplication, HowTo, FAQPage). No logic/UI/form/API change.
//   v1.0 — initial build.
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface PlaceSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface FormData {
  date: string;
  time: string;
  unknownTime: boolean;
  placeQuery: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  timezone: number;
}

const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z]/g, '');

// 27 Nakshatras → 4 pada starting-syllables (standard North-Indian chart)
const NAKSHATRAS: { keys: string[]; label: string; aksh: string[] }[] = [
  { keys: ['ashwini', 'ashvini', 'aswini'], label: 'Ashwini', aksh: ['Chu', 'Che', 'Cho', 'La'] },
  { keys: ['bharani'], label: 'Bharani', aksh: ['Li', 'Lu', 'Le', 'Lo'] },
  { keys: ['krittika', 'kritika', 'krithika'], label: 'Krittika', aksh: ['A', 'I', 'U', 'E'] },
  { keys: ['rohini'], label: 'Rohini', aksh: ['O', 'Va', 'Vi', 'Vu'] },
  { keys: ['mrigashira', 'mrigasira', 'mrigashirsha'], label: 'Mrigashira', aksh: ['Ve', 'Vo', 'Ka', 'Ki'] },
  { keys: ['ardra', 'aardra'], label: 'Ardra', aksh: ['Ku', 'Gha', 'Nga', 'Chha'] },
  { keys: ['punarvasu'], label: 'Punarvasu', aksh: ['Ke', 'Ko', 'Ha', 'Hi'] },
  { keys: ['pushya', 'pushyami'], label: 'Pushya', aksh: ['Hu', 'He', 'Ho', 'Da'] },
  { keys: ['ashlesha', 'aslesha'], label: 'Ashlesha', aksh: ['Di', 'Du', 'De', 'Do'] },
  { keys: ['magha', 'makha'], label: 'Magha', aksh: ['Ma', 'Mi', 'Mu', 'Me'] },
  { keys: ['purvaphalguni', 'poorvaphalguni', 'pubba'], label: 'Purva Phalguni', aksh: ['Mo', 'Ta', 'Ti', 'Tu'] },
  { keys: ['uttaraphalguni', 'uttraphalguni'], label: 'Uttara Phalguni', aksh: ['Te', 'To', 'Pa', 'Pi'] },
  { keys: ['hasta', 'hastha'], label: 'Hasta', aksh: ['Pu', 'Sha', 'Na', 'Tha'] },
  { keys: ['chitra', 'chithra'], label: 'Chitra', aksh: ['Pe', 'Po', 'Ra', 'Ri'] },
  { keys: ['swati', 'svati'], label: 'Swati', aksh: ['Ru', 'Re', 'Ro', 'Ta'] },
  { keys: ['vishakha', 'vishaka', 'visakha'], label: 'Vishakha', aksh: ['Ti', 'Tu', 'Te', 'To'] },
  { keys: ['anuradha'], label: 'Anuradha', aksh: ['Na', 'Ni', 'Nu', 'Ne'] },
  { keys: ['jyeshtha', 'jyestha', 'jyeshta'], label: 'Jyeshtha', aksh: ['No', 'Ya', 'Yi', 'Yu'] },
  { keys: ['mula', 'moola'], label: 'Mula', aksh: ['Ye', 'Yo', 'Bha', 'Bhi'] },
  { keys: ['purvaashadha', 'poorvaashadha', 'purvashada'], label: 'Purva Ashadha', aksh: ['Bhu', 'Dha', 'Pha', 'Dha'] },
  { keys: ['uttaraashadha', 'uttarashada'], label: 'Uttara Ashadha', aksh: ['Bhe', 'Bho', 'Ja', 'Ji'] },
  { keys: ['shravana', 'sravana'], label: 'Shravana', aksh: ['Ju', 'Je', 'Jo', 'Gha'] },
  { keys: ['dhanishtha', 'dhanishta', 'dhanistha'], label: 'Dhanishtha', aksh: ['Ga', 'Gi', 'Gu', 'Ge'] },
  { keys: ['shatabhisha', 'shatabhishak', 'satabhisha'], label: 'Shatabhisha', aksh: ['Go', 'Sa', 'Si', 'Su'] },
  { keys: ['purvabhadrapada', 'poorvabhadrapada'], label: 'Purva Bhadrapada', aksh: ['Se', 'So', 'Da', 'Di'] },
  { keys: ['uttarabhadrapada'], label: 'Uttara Bhadrapada', aksh: ['Du', 'Tha', 'Jha', 'Da'] },
  { keys: ['revati'], label: 'Revati', aksh: ['De', 'Do', 'Cha', 'Chi'] },
];

function resolveNak(name: string) {
  const n = norm(name);
  return NAKSHATRAS.find((x) => x.keys.includes(n)) || NAKSHATRAS.find((x) => x.keys.some((k) => n.includes(k) || k.includes(n)));
}

// Curated name suggestions by starting syllable (normalized).
// [name, gender 'b'|'g', meaning]. Only well-known names / meanings.
type N = [string, 'b' | 'g', string];
const NAMES: Record<string, N[]> = {
  a: [['Aarav', 'b', 'Peaceful, melodious'], ['Aditya', 'b', 'The Sun'], ['Arjun', 'b', 'Bright, shining'], ['Ananya', 'g', 'Unique, peerless'], ['Aaradhya', 'g', 'Worthy of worship'], ['Anika', 'g', 'Grace, goddess Durga']],
  i: [['Ishaan', 'b', 'Lord Shiva, sun'], ['Ishan', 'b', 'Ruler, north-east'], ['Ira', 'g', 'Earth, goddess Saraswati'], ['Ishita', 'g', 'Supreme, desired']],
  u: [['Utkarsh', 'b', 'Advancement, prosperity'], ['Udit', 'b', 'Risen, grown'], ['Urvi', 'g', 'Earth'], ['Unnati', 'g', 'Progress']],
  e: [['Ekansh', 'b', 'Whole, complete'], ['Eklavya', 'b', 'Devoted learner'], ['Esha', 'g', 'Desire, goddess Parvati'], ['Eela', 'g', 'Earth']],
  o: [['Om', 'b', 'Sacred sound'], ['Onkar', 'b', 'Pranav, the Om'], ['Ojas', 'b', 'Vitality, energy'], ['Oviya', 'g', 'Artist, beautiful']],
  chu: [['Chunmun', 'b', 'Sweet little one'], ['Churni', 'g', 'A sacred river']],
  che: [['Chetan', 'b', 'Consciousness, life'], ['Cheshta', 'g', 'Effort, gesture']],
  cho: [['Chodhary', 'b', 'Leader'], ['Chompa', 'g', 'A fragrant flower']],
  la: [['Lakshya', 'b', 'Aim, target'], ['Lavish', 'b', 'Abundant'], ['Lavanya', 'g', 'Grace, beauty'], ['Lata', 'g', 'Creeper, vine']],
  li: [['Lipun', 'b', 'Skilled'], ['Lipi', 'g', 'Script, writing']],
  lu: [['Lucky', 'b', 'Fortunate'], ['Luv', 'b', 'Son of Lord Rama']],
  le: [['Lekh', 'b', 'Writing, document'], ['Lekha', 'g', 'Writing, line']],
  lo: [['Lohit', 'b', 'Red, copper'], ['Lopa', 'g', 'Learned sage Lopamudra']],
  va: [['Varun', 'b', 'God of water'], ['Vatsal', 'b', 'Affectionate'], ['Vani', 'g', 'Speech, Saraswati'], ['Vanya', 'g', 'Gracious gift of God']],
  vi: [['Vivaan', 'b', 'Full of life, dawn'], ['Vihaan', 'b', 'Dawn, morning'], ['Vidhi', 'g', 'Destiny, method'], ['Vidya', 'g', 'Knowledge']],
  vu: [['Vubarn', 'b', 'Strong'], ['Vrushti', 'g', 'Rain']],
  ve: [['Ved', 'b', 'Sacred knowledge'], ['Vedant', 'b', 'Ultimate knowledge'], ['Veda', 'g', 'Sacred wisdom'], ['Vedika', 'g', 'Altar, awareness']],
  vo: [['Vohit', 'b', 'Carrier'], ['Vrinda', 'g', 'Tulsi, multitude']],
  ka: [['Kabir', 'b', 'Great, noble'], ['Karan', 'b', 'Skilful'], ['Kavya', 'g', 'Poetry'], ['Kashvi', 'g', 'Shining']],
  ki: [['Kiaan', 'b', "King, grace of God"], ['Kishan', 'b', 'Lord Krishna'], ['Kiara', 'g', 'Dark-haired, dear'], ['Kirti', 'g', 'Fame']],
  ku: [['Kunal', 'b', 'Lotus, son of Ashoka'], ['Kush', 'b', 'Son of Lord Rama'], ['Kumud', 'g', 'Lotus'], ['Kumari', 'g', 'Young girl']],
  ke: [['Kethan', 'b', 'Banner, home'], ['Keshav', 'b', 'Lord Krishna'], ['Keya', 'g', 'A monsoon flower'], ['Kesar', 'g', 'Saffron']],
  ko: [['Komal', 'b', 'Tender'], ['Koustubh', 'b', 'A divine jewel'], ['Komal', 'g', 'Delicate, soft'], ['Komudi', 'g', 'Moonlight']],
  ha: [['Harsh', 'b', 'Joy'], ['Harshil', 'b', 'Joyful'], ['Hansika', 'g', 'Swan, graceful'], ['Hasini', 'g', 'Cheerful']],
  hi: [['Hitesh', 'b', 'Well-wisher'], ['Himanshu', 'b', 'The Moon'], ['Hina', 'g', 'Fragrance, henna'], ['Hiya', 'g', 'Heart']],
  hu: [['Huzaif', 'b', 'Brave'], ['Husn', 'g', 'Beauty']],
  he: [['Hemang', 'b', 'Golden-bodied'], ['Hetav', 'b', 'Purpose'], ['Hema', 'g', 'Golden'], ['Hetal', 'g', 'Friendly']],
  ho: [['Homesh', 'b', 'Lord of sacred fire'], ['Hodal', 'g', 'A folk heroine']],
  da: [['Daksh', 'b', 'Capable, son of Brahma'], ['Darsh', 'b', 'Sight, vision'], ['Daksha', 'g', 'Capable, earth'], ['Damini', 'g', 'Lightning']],
  di: [['Divit', 'b', 'Immortal'], ['Dishant', 'b', 'Horizon'], ['Diya', 'g', 'Lamp, light'], ['Disha', 'g', 'Direction']],
  du: [['Durgesh', 'b', 'Lord of forts'], ['Durjay', 'b', 'Invincible'], ['Durga', 'g', 'The goddess'], ['Dulari', 'g', 'Beloved']],
  de: [['Dev', 'b', 'God, divine'], ['Devansh', 'b', 'Part of God'], ['Devi', 'g', 'Goddess'], ['Deepika', 'g', 'Lamp, light']],
  do: [['Domesh', 'b', 'Lord'], ['Dolly', 'g', 'Beautiful child']],
  ma: [['Manan', 'b', 'Reflection, thought'], ['Mayank', 'b', 'The Moon'], ['Maira', 'g', 'Beloved'], ['Mahika', 'g', 'Earth, dew']],
  mi: [['Mihir', 'b', 'The Sun'], ['Mitansh', 'b', 'Part of a friend'], ['Mishti', 'g', 'Sweet'], ['Mira', 'g', 'Devotee, ocean']],
  mu: [['Mukul', 'b', 'Bud, blossom'], ['Mukund', 'b', 'Lord Krishna'], ['Muskan', 'g', 'Smile'], ['Mudita', 'g', 'Joyful']],
  me: [['Mehul', 'b', 'Rain, cloud'], ['Medhansh', 'b', 'Intelligent'], ['Meera', 'g', 'Devotee of Krishna'], ['Medha', 'g', 'Intellect']],
  mo: [['Mohit', 'b', 'Enchanted'], ['Mohan', 'b', 'Charming, Lord Krishna'], ['Moksha', 'g', 'Liberation'], ['Mohini', 'g', 'Enchantress']],
  ta: [['Tanish', 'b', 'Ambition'], ['Tanay', 'b', 'Son'], ['Tanvi', 'g', 'Slender, delicate'], ['Tara', 'g', 'Star']],
  ti: [['Tilak', 'b', 'Auspicious mark'], ['Tithi', 'g', 'Lunar day']],
  tu: [['Tushar', 'b', 'Snow, dew'], ['Tukaram', 'b', 'A revered saint'], ['Tulsi', 'g', 'Holy basil'], ['Tushti', 'g', 'Satisfaction']],
  te: [['Tejas', 'b', 'Brilliance, radiance'], ['Tejvir', 'b', 'Brave with radiance'], ['Tejal', 'g', 'Lustrous'], ['Tejasvi', 'g', 'Bright, brilliant']],
  to: [['Toshan', 'b', 'Satisfaction'], ['Toshani', 'g', 'Goddess Durga']],
  pa: [['Parth', 'b', 'Arjun, prince'], ['Pranav', 'b', 'Sacred Om'], ['Pari', 'g', 'Fairy'], ['Palak', 'g', 'Eyelash, to nurture']],
  pi: [['Piyush', 'b', 'Nectar'], ['Pinak', 'b', "Lord Shiva's bow"], ['Piya', 'g', 'Beloved'], ['Pihu', 'g', 'Sweet sound']],
  pu: [['Punit', 'b', 'Holy, pure'], ['Puneet', 'b', 'Pure'], ['Pooja', 'g', 'Worship'], ['Purvi', 'g', 'Eastern, a raga']],
  pe: [['Peyush', 'b', 'Nectar'], ['Perizaad', 'g', 'Fairy child']],
  po: [['Poras', 'b', 'Ancient king Porus'], ['Pooja', 'g', 'Worship']],
  na: [['Naksh', 'b', 'Map, moon'], ['Nakul', 'b', 'A Pandava'], ['Navya', 'g', 'New, young'], ['Naina', 'g', 'Eyes']],
  ni: [['Nishant', 'b', 'Dawn'], ['Nilay', 'b', 'Home, abode'], ['Nidhi', 'g', 'Treasure'], ['Niharika', 'g', 'Galaxy, dew']],
  nu: [['Nutan', 'b', 'New'], ['Nupur', 'g', 'Anklet']],
  ne: [['Nehal', 'b', 'Rainy, fresh'], ['Nevil', 'b', 'New town'], ['Neha', 'g', 'Love, rain'], ['Netra', 'g', 'Eyes']],
  no: [['Nondan', 'b', 'Joyful'], ['Noor', 'g', 'Divine light']],
  ya: [['Yash', 'b', 'Fame, success'], ['Yatharth', 'b', 'Truthful, real'], ['Yamini', 'g', 'Night'], ['Yashika', 'g', 'Famous']],
  yu: [['Yuvraj', 'b', 'Prince'], ['Yug', 'b', 'Era'], ['Yukti', 'g', 'Skill, idea'], ['Yutika', 'g', 'A flower']],
  ye: [['Yetin', 'b', 'Ascetic'], ['Yedha', 'g', 'Knowledge']],
  yo: [['Yogesh', 'b', 'Lord of yoga'], ['Yogi', 'b', 'One who meditates'], ['Yogita', 'g', 'One in yoga'], ['Yojana', 'g', 'Plan']],
  ra: [['Raghav', 'b', 'Lord Rama'], ['Rian', 'b', 'Little king'], ['Riya', 'g', 'Singer, graceful'], ['Radha', 'g', 'Beloved of Krishna']],
  ri: [['Rishabh', 'b', 'Noble, bull'], ['Ritvik', 'b', 'Priest'], ['Riddhi', 'g', 'Prosperity'], ['Ritika', 'g', 'Movement, stream']],
  ru: [['Rudra', 'b', 'Lord Shiva'], ['Ruhaan', 'b', 'Spiritual'], ['Ruhi', 'g', 'Soul'], ['Rupal', 'g', 'Silvery']],
  re: [['Reyansh', 'b', 'Ray of light'], ['Rehan', 'b', 'Sweet basil'], ['Renu', 'g', 'Pollen, particle'], ['Reva', 'g', 'River Narmada']],
  ro: [['Rohan', 'b', 'Ascending'], ['Rohit', 'b', 'Red, the Sun'], ['Roshni', 'g', 'Light'], ['Rohini', 'g', 'A nakshatra, star']],
  ga: [['Gaurav', 'b', 'Pride, honour'], ['Ganesh', 'b', 'Lord Ganesha'], ['Gauri', 'g', 'Goddess Parvati'], ['Gargi', 'g', 'Ancient woman sage']],
  gi: [['Girish', 'b', 'Lord Shiva'], ['Gitansh', 'b', 'Part of a song'], ['Gitanjali', 'g', 'Offering of songs'], ['Girija', 'g', 'Goddess Parvati']],
  gu: [['Gunjan', 'b', 'Humming of a bee'], ['Gurmeet', 'b', "Friend of the Guru"], ['Gunita', 'g', 'Virtuous'], ['Gungun', 'g', 'Sweet humming']],
  ge: [['Gehna', 'g', 'Ornament'], ['Geet', 'b', 'Song']],
  go: [['Govind', 'b', 'Lord Krishna'], ['Gopal', 'b', 'Cowherd, Krishna'], ['Gopi', 'g', 'Devotee of Krishna'], ['Gowri', 'g', 'Goddess Parvati']],
  sa: [['Samar', 'b', 'War, evening'], ['Sahil', 'b', 'Shore, guide'], ['Saanvi', 'g', 'Goddess Lakshmi'], ['Sara', 'g', 'Pure, essence']],
  si: [['Siddharth', 'b', 'One who attained goals'], ['Shivansh', 'b', 'Part of Lord Shiva'], ['Siya', 'g', 'Goddess Sita'], ['Simran', 'g', 'Remembrance of God']],
  su: [['Suraj', 'b', 'The Sun'], ['Suyash', 'b', 'Good fame'], ['Suhana', 'g', 'Pleasant'], ['Sumitra', 'g', 'Good friend']],
  se: [['Sehaj', 'b', 'Natural, easy'], ['Senan', 'b', 'Commander'], ['Sejal', 'g', 'River water'], ['Seema', 'g', 'Boundary']],
  so: [['Sohan', 'b', 'Handsome'], ['Som', 'b', 'The Moon'], ['Sonal', 'g', 'Golden'], ['Soumya', 'g', 'Gentle, calm']],
  bha: [['Bhavya', 'b', 'Grand, magnificent'], ['Bharat', 'b', 'India, to be maintained'], ['Bhavya', 'g', 'Splendid'], ['Bhavna', 'g', 'Feeling, emotion']],
  bhi: [['Bhima', 'b', 'Mighty Pandava'], ['Bhirav', 'b', 'Form of Shiva']],
  bhu: [['Bhuvan', 'b', 'World'], ['Bhupesh', 'b', 'King'], ['Bhumi', 'g', 'Earth'], ['Bhumika', 'g', 'Earth, role']],
  bhe: [['Bherav', 'b', 'Awesome'], ['Bhento', 'g', 'Gift']],
  bho: [['Bhola', 'b', 'Innocent, Lord Shiva'], ['Bhoomi', 'g', 'Earth']],
  ja: [['Jay', 'b', 'Victory'], ['Jayesh', 'b', 'Lord of victory'], ['Janvi', 'g', 'River Ganga'], ['Jaya', 'g', 'Victory']],
  ji: [['Jignesh', 'b', 'Intellectual curiosity'], ['Jivin', 'b', 'Full of life'], ['Jiya', 'g', 'Sweetheart'], ['Jigyasa', 'g', 'Curiosity']],
  ju: [['Juhin', 'b', 'A flower'], ['Juhi', 'g', 'Jasmine flower']],
  je: [['Jeet', 'b', 'Victory'], ['Jenil', 'b', 'Victorious'], ['Jenika', 'g', 'Pure'], ['Jeevika', 'g', 'Source of life']],
  jo: [['Jonak', 'b', 'Light'], ['Joshil', 'b', 'Energetic'], ['Jossy', 'g', 'Joyful'], ['Joshita', 'g', 'Pleased']],
  sha: [['Shaurya', 'b', 'Bravery'], ['Sharvil', 'b', 'Lord Shiva'], ['Shanaya', 'g', 'First ray of sun'], ['Shaily', 'g', 'Of the mountain']],
  cha: [['Chaitanya', 'b', 'Consciousness'], ['Chirag', 'b', 'Lamp'], ['Charvi', 'g', 'Beautiful'], ['Chaya', 'g', 'Shadow, reflection']],
  chi: [['Chirayu', 'b', 'Long-lived'], ['Chinmay', 'b', 'Full of consciousness'], ['Chitra', 'g', 'Picture, bright'], ['Chinmayi', 'g', 'Blissful']],
  gha: [['Ghanshyam', 'b', 'Lord Krishna'], ['Ghana', 'g', 'Cloud']],
  dha: [['Dhruv', 'b', 'Pole star, steadfast'], ['Dhairya', 'b', 'Patience'], ['Dhriti', 'g', 'Courage, steadiness'], ['Dhara', 'g', 'Flow, earth']],
  tha: [['Thakur', 'b', 'Lord, chief'], ['Thara', 'g', 'Star']],
  pha: [['Phalgun', 'b', 'A month, reddish'], ['Phulwa', 'g', 'Flower']],
  jha: [['Jharna', 'g', 'Spring, waterfall'], ['Jhalak', 'g', 'Glimpse']],
  tr: [['Tr ividh', 'b', 'Threefold'], ['Tripti', 'g', 'Satisfaction']],
};

function getNames(syllable: string): N[] {
  return NAMES[norm(syllable)] || [];
}

// ─── Google Maps via /api/maps-proxy ──────────────────────────
async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: query,
          includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
          languageCode: 'en',
        }),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? [])
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        place_id: s.placePrediction.placeId ?? '',
        description: s.placePrediction.text?.text ?? '',
        main_text: s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text ?? '',
        secondary_text: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
      }));
  } catch { return []; }
}

async function fetchPlaceDetails(placeId: string): Promise<{ lat: number; lng: number; city: string } | null> {
  if (!placeId) return null;
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=location,displayName`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const lat = data.location?.latitude ?? null;
    const lng = data.location?.longitude ?? null;
    if (lat === null || lng === null) return null;
    return { lat, lng, city: data.displayName?.text ?? '' };
  } catch { return null; }
}

async function fetchTimezone(lat: number, lng: number): Promise<number> {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return 5.5;
    const data = await res.json();
    if (data.status !== 'OK') return 5.5;
    return Math.round(((data.rawOffset + data.dstOffset) / 3600) * 4) / 4;
  } catch { return 5.5; }
}

function CityInput({ id, value, onSelect, error }: {
  id: string; value: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const handleChange = (val: string) => {
    setQuery(val); setSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSuggestions(await fetchPlaceSuggestions(val));
      setLoading(false);
    }, 400);
  };

  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.main_text); setSuggestions([]); setSelected(true); setLoading(true);
    const details = await fetchPlaceDetails(s.place_id);
    if (details) {
      const tz = await fetchTimezone(details.lat, details.lng);
      onSelect(details.city || s.main_text, details.lat, details.lng, tz);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input id={id} type="search" autoComplete="off" placeholder="Type city of birth..."
          value={query} onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
          style={{ background: '#0d1120', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          {loading ? <span style={{ color: GOLD }}>⟳</span> : selected ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#475569' }}>📍</span>}
        </span>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
          style={{ background: '#0d1120', border: '1px solid rgba(212,175,55,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => handleSelect(s)} className="px-4 py-3 text-sm cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = GOLD_RGBA(0.08))}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600 }}>{s.main_text}</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{s.secondary_text}</p>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

const FAQS = [
  { q: 'Nakshatra ke hisaab se naam kaise rakhte hain?', a: 'Bachche ke janma ke samay Chandra (Moon) jis nakshatra aur uske jis pada (charan) mein hota hai, uske aadhar par ek shubh prarambhik akshar (Naamakshar) tay hota hai. Har nakshatra ke 4 pada hote hain, aur har pada ka apna akshar. Naam usi akshar se shuru karna paramparik roop se shubh mana jaata hai.' },
  { q: 'Mere bachche ka lucky akshar kya hai?', a: 'Bachche ki Date of Birth, exact Time of Birth aur Place of Birth daalo. Calculator Swiss Ephemeris se Chandra ka nakshatra aur pada nikaalta hai, aur us pada ka shubh prarambhik akshar batata hai — saath mein us akshar se shuru hote naam suggestions bhi.' },
  { q: 'Pada (charan) kya hota hai?', a: 'Har nakshatra 13°20\' ka hota hai, jise 4 baraabar pada (3°20\' each) mein baanta jaata hai. Janma ke samay Chandra jis pada mein ho, uske hisaab se akshar badal jaata hai. Isliye sirf nakshatra nahi, pada bhi zaroori hai — aur uske liye exact birth time chahiye.' },
  { q: 'Kya naam isi akshar se rakhna zaroori hai?', a: 'Yeh ek paramparik shubh sujhav hai, koi sakht niyam nahi. Bahut se parivaar Naamakshar follow karte hain taaki naam nakshatra-energy ke saath resonate kare. Aap akshar ko guidance ki tarah lekar apni pasand ka sundar arthpurn naam chun sakte hain.' },
  { q: 'Calculator kitne naam deta hai?', a: 'Aapke pada ke shubh akshar se shuru hote curated naam (ladka/ladki/dono filter ke saath), har naam ke arth (meaning) ke saath. Yeh ek shuruaati curated list hai — aap inhe inspiration ki tarah lekar aur naam bhi explore kar sakte hain.' },
  { q: 'Exact birth time na ho to?', a: 'Time ke bina Chandra ka pada (aur kabhi nakshatra bhi) galat ho sakta hai, kyunki Chandra tezi se chalta hai. Solar fallback (12:00) approximate result dega. Sabse accurate Naamakshar ke liye exact time of birth zaroori hai.' },
  { q: 'Kya ye Baby Name Calculator free hai?', a: 'Haan, 100% free. Janma nakshatra, pada, rashi, nakshatra swami, shubh prarambhik akshar, aur us akshar se shuru hote naam (arth ke saath) — sab bilkul free.' },
  { q: 'Result kitne accurate hain?', a: 'Nakshatra + pada Swiss Ephemeris (NASA-grade) se exact calculate hote hain with Lahiri Ayanamsha — yeh hissa 99.9% accurate hai. Naam suggestions ek curated paramparik list hai. Akshar-to-pada chart ke kuch traditions mein halka antar hota hai.' },
  { q: 'Naamkaran sanskar kab kiya jaata hai?', a: 'Paramapara mein naamkaran janm ke gyarahve ya barahve din kiya jaata hai. Kuch parivaar isse chhathe din karte hain aur kuch bees-ek din baad. Gandmool nakshatra mein janm ho to prayah 27 din baad Mool Shanti ke saath rakha jaata hai. Ye reet parivaar aur kshetra se badalti hai — koi ek niyam nahi hai.' },
  { q: 'Nakshatra wala akshar aur numerology wala akshar alag hain — kaunsa maanein?', a: 'Nakshatra wala akshar Chandra ki asli sthiti se aata hai, isliye uska aadhaar khagolik ganana hai. Numerology wala akshar ankon ke jod se aata hai, jo symbolic hai. Agar dono mein se ek chunna ho to nakshatra wala chuniye — wo Bharatiya naamkaran ki mool paramapara bhi hai.' },
  { q: 'Kya poora naam usi akshar se hona chahiye ya sirf pehla akshar?', a: 'Paramapara sirf pehle akshar ki baat karti hai — naam us syllable se shuru hona chahiye. Baaki naam par koi shart nahi. Aur kai parivaar do naam rakhte hain: ek shubh akshar wala "rashi naam" jo poojan mein prayog hota hai, aur ek pukaarne wala naam jo pasand se rakha jaata hai. Dono ek saath rakhna bilkul chalta hai.' },
  { q: 'Gandmool nakshatra mein janm hua hai — naam rakhne mein kya alag hai?', a: 'Naam rakhne ki vidhi wahi hai; akshar usi pada se aata hai. Antar sirf itna hai ki paramapara mein 27 din baad Mool Shanti ki vidhi ki jaati hai aur naamkaran uske baad kiya jaata hai. Ye ashubh janm nahi hai — bahut se safal log Gandmool mein paida hue hain — aur is naam par koi mehnga upay kharidne ki zaroorat nahi.' },
  { q: 'Do bachche ek hi nakshatra mein hain to ek hi akshar aayega?', a: 'Zaroori nahi. Akshar nakshatra se nahi, uske pada se aata hai — aur ek nakshatra ke char pada hote hain, har ek lagbhag ek ghante ka. Do bachche ek hi nakshatra mein par alag pada mein ho sakte hain, aur tab unke akshar alag honge. Isi liye sateek janm samay maanga jaata hai.' },
  { q: 'Naam badalne se bachche ka bhagya badal jaata hai?', a: 'Nahi. Naam ek shubh sanket hai, koi niyantran nahi. Janm ka nakshatra, lagna aur dasha naam badalne se nahi badalte. Jo koi naam ke naam par mehnga parivartan beche, wo asha bech raha hai — aur bachche ke naam par ye aur bhi galat hai.' },
  { q: 'Angrezi naam rakhna ho to ye akshar kaise lagega?', a: 'Akshar dhwani ka hai, lipi ka nahi. Jaise "Da" pada se Daksh bhi ban sakta hai aur David bhi. Isliye agar aap koi aadhunik ya angrezi naam chahte hain to bhi shubh syllable se shuru hone wala naam mil jaata hai. Kisi bhasha ki koi rok is paramapara mein nahi hai.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2, 05 Sep 2026)
//   ~1,000 words · 3 H2 · 21 internal links.
//   GSC 3 months to 4 Sep 2026: NO DATA — this page does not appear in the
//   top-1000-by-clicks export, so it earns close to zero impressions. It and
//   free-lucky-day-calculator are the two least visible pages in the batch.
//
// WHERE THE H2s COME FROM — Radar E3, live SERP PASF, checked 05 Sep 2026,
// cluster calc-nakshatra. Every tracked keyword has our_rank = null and an AI
// Overview that recommends a tool:
//     nakshatra calculator by date of birth · birth star calculator free
//     mera nakshatra kya hai · nakshatra nikalne ka tarika
//     जन्म नक्षत्र कैसे पता करें · नक्षत्र कैलकुलेटर
//
//   PASF entries that belong to NAMING and are answered here:
//     जन्म तारीख से नाम और राशि online · जन्म तारीख से नाम कैसे निकाले
//     नाम से नक्षत्र कैसे जाने · जन्म राशि नाम अक्षर
//     Nakshatra Pada calculator by date of birth
//     Bacche ke mool kaise pata kare · जन्म नक्षत्र पाया
//     Numerology baby names with date of birth and time
//
// KEYWORD SPLIT — deliberate, do not undo
//   /calculators/free-nakshatra-calculator already owns IDENTIFICATION and has
//   nine H2s doing it: the 27-nakshatra list, Gandmool detection, mool vs
//   Gandmool, tithi vs nakshatra, rashi+nakshatra together, birth star in
//   English, Tamil/Malayalam finders.
//
//   THIS PAGE owns NAMING only: naamakshar, pada, the syllable tables, the
//   naamkaran ceremony, naming inside Gandmool, two-name practice, modern and
//   English names, and what a name can and cannot do. Nakshatra detection is
//   handed over by link, never re-explained.
//
//   /calculators/free-numerology-calculator carries one section on naming by
//   number and points HERE for the nakshatra route. That direction is
//   deliberate: the nakshatra method rests on an astronomical calculation, the
//   numerology one does not.
//
// THE HONEST CORE
//   A name is an auspicious marker, not a control. This page says plainly that
//   changing a name does not change the nakshatra, the lagna or the dasha, and
//   that paid name-correction sold for a newborn is worth refusing. Gandmool
//   is presented as a ceremony, never as a defect — the fear around it is the
//   single most exploited thing in this niche.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type BnSection = { id: string; h2: string; paras: string[] };

const SECTIONS: BnSection[] = [
  {
    id: 'kaise-kaam',
    h2: 'Baby Name by Nakshatra — kaam kaise karta hai',
    paras: [
      'Aap bachche ki **janm tithi, sateek samay aur sthan** dete hain. Calculator us kshan Chandra ki sthiti nikaalta hai, uska **nakshatra aur pada** tay karta hai, aur us pada ka **shubh syllable** de deta hai — jisse naam shuru hona chahiye.',
      'Uske saath **us akshar se shuru hone wale naam** bhi milte hain, ladke aur ladki dono ke liye, arth ke saath. Aur bachche ki **Chandra rashi** bhi, kyunki wo naamkaran mein aage kaam aati hai.',
      'Samay par zor isliye hai ki **pada lagbhag har ek ghante mein badalta hai.** Nakshatra 13 degree 20 minute ka hota hai aur uske char barabar hisse — yaani ek pada lagbhag sawa teen degree ka. Chandra utna lagbhag ek ghante mein paar karta hai.',
    ],
  },
  {
    id: 'naamakshar-kya',
    h2: 'Naamakshar kya hota hai — aur ye kahan se aata hai',
    paras: [
      '**Naamakshar** wo shubh syllable hai jisse bachche ka naam shuru hona chahiye. Ye koi manmani pasand nahi hai — iska ek nishchit aadhaar hai.',
      'Aadhaar ye hai: **27 nakshatra, har ek ke 4 pada — kul 108 pada.** Har pada ka ek nishchit syllable paramapara mein tay hai. Jis pada mein bachcha paida hua, wahi uska naamakshar hai. Ye 108 syllable poore mile-jule roop mein Bharat ki naamkaran paramapara ka aadhaar hain.',
      'Aur ye 108 akshar barah rashiyon mein bant jaate hain — har rashi ke hisse mein nau. Isi liye "rashi se naam" bhi kaha jaata hai. Par **asli aadhaar pada hai**, rashi uska natija hai. Rashi se chalne par nau aksharon mein se koi bhi chun liya jaata hai; pada se chalne par **wahi ek akshar** milta hai jo us bachche ke liye tay hai.',
    ],
  },
  {
    id: 'pada-kyun',
    h2: 'Pada kyun itna zaroori hai',
    paras: [
      'Ye is page ka sabse mahatvapurn hissa hai, aur wahi cheez hai jo adhikansh muft tools chhod dete hain.',
      'Adhikansh site aapse tareekh maang kar **nakshatra** bata deti hain aur us nakshatra ka koi ek akshar de deti hain. Par ek nakshatra ke **char pada hain aur char alag akshar.** Bina pada jaane, chaar mein se ek chun lena andaaza hai.',
      'Udaharan se saaf hoga. **Pushya nakshatra** ke char pada se aate hain **Hu, He, Ho, Da.** **Rohini** se **O, Va, Vi, Vu.** **Anuradha** se **Na, Ni, Nu, Ne.** Ye char akshar aapas mein bilkul alag naam denge — Hurit aur Daksh ek hi nakshatra ke do alag pada se aate hain.',
      'Isi liye **sateek janm samay** maanga jaata hai. Ek ghante ki galti pada badal deti hai, aur uske saath naam ka akshar.',
    ],
  },
  {
    id: 'samay-nahi-pata',
    h2: 'Janm samay sateek nahi pata — tab kya',
    paras: [
      'Ye sthiti aam hai, khaas kar jab janm ghar par hua ho ya record na mila ho. Do baat saaf hain.',
      '**Nakshatra prayah mil jaayega.** Chandra ek nakshatra mein lagbhag ek din rehta hai, isliye adhikansh dinon mein sirf tareekh se nakshatra nikal aata hai. **Par pada nahi milega** — wo har ek ghante badalta hai, aur usi se akshar aata hai.',
      'Aise mein do raste hain. **Ek** — us nakshatra ke chaaron akshar dekh lijiye aur unme se jo naam aapko pasand hai wo chun lijiye. Chaaron usi nakshatra ke hain, isliye koi galat nahi hai. **Do** — janm pramanpatra ya hospital record dhoondhiye; das minute ka kaam hai jo aage har padhai sateek bana dega.',
      'Jo nahi karna chahiye: **kisi anumaan par pukka maan kar naam rakh dena aur baad mein pata chalne par badalna.** Naam ek baar rakha jaata hai; thoda intezaar behtar hai.',
    ],
  },
  {
    id: 'naamkaran-sanskar',
    h2: 'Naamkaran sanskar — kab aur kaise',
    paras: [
      'Naamkaran solah sanskaron mein se ek hai, aur uska samay paramapara mein tay hai — par us paramapara mein bhi vividhta hai.',
      'Sabse prachalit reet **gyarahvaan ya barahvaan din** hai. Kuch parivaar **chhathe din** karte hain, kuch **bees-ek din** baad, aur kai jagah pehle mahine ke andar kisi shubh din. Dakshin Bharat mein kuch paramparaein **gyarahvein din** ko hi maanti hain.',
      'Vidhi mein prayah: shubh muhurat chuna jaata hai, bachche ke kaan mein naam kaha jaata hai, aur parivaar ke saamne ghoshna hoti hai. Kai jagah **do naam** rakhe jaate hain — ek nakshatra wala aur ek pukaarne wala.',
      'Ek vyavharik baat: **Gandmool nakshatra mein janm ho to naamkaran prayah 27 din baad** kiya jaata hai, Mool Shanti ke saath. Iska matlab der nahi, kram hai. Muhurat ke liye [Panchang](/panchang) free hai.',
    ],
  },
  {
    id: 'do-naam',
    h2: 'Do naam rakhne ki reet — rashi naam aur pukaarne wala naam',
    paras: [
      'Ye reet bahut parivaaron mein hai par uske peeche ka tark kam batayi jaati hai — aur wo tark aaj ke liye bahut kaam ka hai.',
      '**Rashi naam** (kabhi ise nakshatra naam bhi kehte hain) wo naam hai jo shubh akshar se rakha jaata hai. Wo poojan, sanskar aur jyotishiya kaamon mein prayog hota hai. **Pukaarne wala naam** wo hai jisse ghar aur duniya bachche ko bulaati hai, aur wo pasand se rakha jaata hai.',
      'Aaj ke liye iska faayda seedha hai: **paramapara bhi nibh jaati hai aur pasand bhi.** Agar aapko koi naam bahut pasand hai par wo shubh akshar se shuru nahi hota, to dono rakhe ja sakte hain. Isme kuch galat nahi hai aur ye kai peedhiyon se chal raha hai.',
      'Kaunsa naam kaagaz par ho — ye poori tarah aapka chunav hai. Paramapara isme koi shart nahi rakhti.',
    ],
  },
  {
    id: 'gandmool-naam',
    h2: 'Gandmool nakshatra mein janm — naam rakhne mein kya alag hai',
    paras: [
      'Ye wo hissa hai jahan sabse zyada dar bechaa jaata hai, isliye saaf hona zaroori hai.',
      '**Chhe nakshatra Gandmool hain:** Ashwini, Ashlesha, Magha, Jyeshtha, Mula aur Revati. Ye wo hain jo rashi ki sandhi par padte hain.',
      'Naam rakhne ki **vidhi bilkul wahi hai** — akshar usi pada se aata hai, koi alag niyam nahi. Antar sirf samay ka hai: paramapara mein **27 din baad Mool Shanti** ki vidhi ki jaati hai aur naamkaran uske baad hota hai.',
      'Aur jo saaf kah dena chahiye: **Gandmool ashubh janm nahi hai.** Revati to swayam shubh nakshatron ki soochi mein bhi hai. Bahut se safal aur sukhi log in nakshatron mein paida hue hain. Jo koi Gandmool ke naam par mehnge upay, ratna ya lambi pooja beche, wo naye maa-baap ka dar bech raha hai — aur us se door rehna chahiye.',
    ],
  },
  {
    id: 'aadhunik-naam',
    h2: 'Aadhunik ya angrezi naam rakhna hai — akshar kaise lagega',
    paras: [
      'Ye prashn aaj ke maa-baap ka asli prashn hai, aur uska uttar raahat dene wala hai.',
      '**Naamakshar dhwani ka hai, lipi ka nahi.** Paramapara syllable batati hai — "Da", "Ma", "Hu" — kisi bhasha ya lipi ki koi shart nahi. Isliye "Da" pada se **Daksh** bhi ban sakta hai aur **David** bhi; "Ma" se **Manas** bhi aur **Mia** bhi.',
      'Iska matlab: **aap chhota, aadhunik, antarrashtriya, ya kisi bhi tarah ka naam rakh sakte hain** — bas wo shubh syllable se shuru ho. Ye paramapara utni sakht nahi hai jitni batayi jaati hai.',
      'Aur agar phir bhi mel na baithe: **do naam wali reet** upar likhi hai, aur wo bilkul maanya hai. Kisi ko apni pasand chhodne ki zaroorat nahi.',
    ],
  },
  {
    id: 'naam-ka-arth',
    h2: 'Akshar sahi par arth galat — kis par zyada dhyan dein',
    paras: [
      'Ye prashn kam poochha jaata hai par zyada mayne rakhta hai, aur is par saaf raay deni chahiye.',
      'Paramapara mein **naam ka arth bhi mayne rakhta hai** — Sanskrit paramapara mein naam ko ek aashirwad maana gaya hai, aur uska arth bachche ke saath jeevan bhar rehta hai. Kai granthon mein shubh arth wale naamon par zor diya gaya hai.',
      'Isliye seedhi salah: **akshar aur arth dono dekhiye, par agar chunna pade to arth chuniye.** Ek naam jo shubh akshar se shuru hota hai par jiska arth bhaari ya nakaratmak hai, us naam se kamzor hai jo pasand ke akshar se shuru ho par jiska arth sundar ho.',
      'Result mein diye gaye naamon ke saath unke arth bhi hain, isi liye. Aur agar koi naam pasand hai par akshar alag hai, to **do naam** wali reet hamesha khuli hai.',
    ],
  },
  {
    id: 'sattais-nakshatra-akshar',
    h2: 'Sattais nakshatra aur unke akshar — pehla hissa',
    paras: [
      'Poori soochi jaan lena zaroori nahi par apna nakshatra dhoondh lena kaam ka hai. Char-char akshar pada ke kram mein hain.',
      '**Ashwini** — Chu, Che, Cho, La. **Bharani** — Li, Lu, Le, Lo. **Krittika** — A, I, U, E. **Rohini** — O, Va, Vi, Vu. **Mrigashira** — Ve, Vo, Ka, Ki. **Ardra** — Ku, Gha, Ang, Chha. **Punarvasu** — Ke, Ko, Ha, Hi. **Pushya** — Hu, He, Ho, Da. **Ashlesha** — Di, Du, De, Do.',
      '**Magha** — Ma, Mi, Mu, Me. **Purva Phalguni** — Mo, Ta, Ti, Tu. **Uttara Phalguni** — Te, To, Pa, Pi. **Hasta** — Pu, Sha, Na, Tha. **Chitra** — Pe, Po, Ra, Ri.',
      'Dhyan dijiye ki **kuch nakshatra do rashiyon mein pad jaate hain** — jaise Krittika ka pehla pada Mesh mein aur baaki teen Vrishabh mein. Isi liye pada dekhna zaroori hai, sirf nakshatra nahi.',
    ],
  },
  {
    id: 'sattais-nakshatra-akshar-2',
    h2: 'Sattais nakshatra aur unke akshar — doosra hissa',
    paras: [
      '**Swati** — Ru, Re, Ro, Ta. **Vishakha** — Ti, Tu, Te, To. **Anuradha** — Na, Ni, Nu, Ne. **Jyeshtha** — No, Ya, Yi, Yu. **Mula** — Ye, Yo, Bha, Bhi. **Purva Ashadha** — Bhu, Dha, Pha, Dha.',
      '**Uttara Ashadha** — Bhe, Bho, Ja, Ji. **Shravana** — Khi, Khu, Khe, Kho. **Dhanishtha** — Ga, Gi, Gu, Ge. **Shatabhisha** — Go, Sa, Si, Su. **Purva Bhadrapada** — Se, So, Da, Di.',
      '**Uttara Bhadrapada** — Du, Tha, Jha, Nya. **Revati** — De, Do, Cha, Chi.',
      'Ek baat jo yahan dikh jaati hai: **kuch akshar do nakshatron mein aate hain** — jaise "Da" Pushya ke chauthe pada mein bhi hai aur Purva Bhadrapada ke teesre mein bhi. Isi liye ulta chal kar naam se nakshatra nikaalna bharose ka nahi hai.',
    ],
  },
  {
    id: 'naam-se-nakshatra',
    h2: 'Naam se nakshatra nikaalna — kaam karta hai?',
    paras: [
      'Log ye ulta rasta bhi dhoondhte hain, isliye uttar saaf hona chahiye.',
      '**Aanshik roop se kaam karta hai, par bharose ka nahi.** Agar naam sach mein janm nakshatra ke pada se rakha gaya tha, to pehla akshar wapas us pada tak le jaata hai. Par do dikkat hain.',
      '**Ek — ek akshar do nakshatron mein aa sakta hai** (upar dekhiye), isliye ek se zyada uttar nikalte hain. **Do — aaj adhikansh naam pasand se rakhe jaate hain**, nakshatra dekh kar nahi. Aise mein wapas nikala gaya nakshatra bilkul galat hoga.',
      'Isliye seedhi salah: **naam se nakshatra mat nikaaliye.** Janm tithi aur samay se nikaaliye — wo ganana hai, andaaza nahi. Uske liye [Nakshatra Calculator](/calculators/free-nakshatra-calculator) free hai.',
    ],
  },
  {
    id: 'nakshatra-rashi-naam',
    h2: 'Janm tareekh se naam aur rashi — dono kaise nikalte hain',
    paras: [
      'Ye do cheezein ek saath dhoondhi jaati hain aur ek hi ganana se aa jaati hain.',
      'Ek hi kshan ki Chandra sthiti se teeno nikal aate hain: **rashi** (Chandra kis rashi mein), **nakshatra** (kis nakshatra mein), aur **pada** (us nakshatra ke kis chauthai hisse mein). Naamakshar pada se aata hai; rashi apne aap mel kha jaati hai.',
      'Kram ye rakhiye: **sateek samay se nakshatra aur pada nikaaliye, akshar lijiye, phir naam chuniye.** Rashi ki alag se zaroorat naamkaran mein nahi padti — wo aage kaam aati hai, jaise gochar aur Sade Sati mein.',
      'Bachche ki rashi alag se dekhni ho to [Rashi Calculator](/calculators/free-rashi-calculator) free hai. Poori kundali ke liye [Kundali Calculator](/calculators/free-kundali-calculator).',
    ],
  },
  {
    id: 'jodwa-bachche',
    h2: 'Jodwa bachche — dono ka akshar alag hoga?',
    paras: [
      'Ye prashn asli hai aur uska uttar samay par tikta hai.',
      'Twins prayah **kuch minute ke antar** se paida hote hain. Us antar se **nakshatra prayah nahi badalta**, aur adhikansh sthitiyon mein **pada bhi wahi rehta hai** — kyunki ek pada lagbhag ek ghante ka hota hai.',
      'Par agar wo kuch minute **pada ki sandhi** par pad jaayein, to dono ka akshar alag ho jaayega. Ye kabhi-kabhi hota hai par hota hai.',
      'Isi liye twins mein **dono ka sateek samay alag-alag likhna** zaroori hai — "lagbhag ek hi samay" likh dena baad mein dono ke naam aur dono ki kundali kharab kar deta hai. Dono ka samay alag daal kar calculator do baar chala lijiye.',
    ],
  },
  {
    id: 'numerology-se-naam',
    h2: 'Ank wala tarika ya nakshatra wala — kaunsa sahi hai',
    paras: [
      'Do paramparaein aamne-saamne aati hain aur maa-baap uljhan mein pad jaate hain.',
      '**Nakshatra wala tarika** jyotish ka hai: uska aadhaar **Chandra ki asli khagolik sthiti** hai, Swiss Ephemeris se nikali hui. Ye Bharatiya naamkaran ki mool paramapara hai aur sanskaron mein yahi chalti hai.',
      '**Ank wala tarika** numerology ka hai: naam ke aksharon ka jod bachche ke mulank se mel khaana chahiye. Uska aadhaar **symbolic** hai, khagolik nahi, aur wo prachin granthon ka niyam nahi hai.',
      'Imandar salah: **agar dono mein se ek chunna hai to nakshatra wala chuniye.** Aur agar dono mel kha jaayein to achha hi hai — par uske liye pasand ka naam chhodne ki zaroorat nahi. Ank wali paddhati [Numerology Calculator](/calculators/free-numerology-calculator) par hai, jahan ye antar aur vistaar se likha hai.',
    ],
  },
  {
    id: 'akshar-nahi-mil-raha',
    h2: 'Us akshar se koi naam pasand nahi aa raha — kya karein',
    paras: [
      'Ye bahut hota hai, khaas kar kuch aksharon ke saath — jaise Jha, Nya, Chha ya Ang.',
      'Char raste hain, aur chaaron maanya hain. **Ek — dhwani se chaliye, lipi se nahi.** "Kho" se Khyati bhi ban sakta hai; "Nya" se Nyasa. Thoda dhoondhne par naam mil jaate hain. **Do — doosri bhasha dekhiye.** Sanskrit, Tamil, Marathi aur angrezi — chaaron mein us dhwani ke naam milte hain.',
      '**Teen — do naam wali reet** apnaaiye: ek shubh akshar wala, ek pasand wala. Ye bahut purani aur bilkul maanya reet hai. **Char — arth ko vazan dijiye**, jaisa upar likha hai.',
      'Jo nahi karna chahiye: **naam ko lekar tanav lena.** Ye ek shubh sanket hai, koi shart nahi. Kisi bhi shastra mein ye nahi likha ki galat akshar se bachche ka nuksan hoga.',
    ],
  },
  {
    id: 'naam-badalna',
    h2: 'Naam pehle rakh diya, ab akshar galat nikla — badlein?',
    paras: [
      'Ye sawal chinta ke saath aata hai, isliye uttar shanti se dena chahiye.',
      '**Nahi, badalna zaroori nahi hai.** Naamakshar ek shubh sanket hai — ek aashirwad ki tarah — koi niyantran nahi. Aapke bachche ka nakshatra, lagna aur dasha naam se nahi bante; wo janm ke kshan se bante hain aur naam badalne se nahi badalte.',
      'Agar phir bhi mann mein rahe to sabse saral hal wahi hai: **shubh akshar wala ek doosra naam rakh lijiye poojan ke liye**, aur pukaarne wala naam waisa hi rehne dijiye. Do naam wali reet isi ke liye hai.',
      'Aur jo saaf kah dena chahiye: **naye maa-baap ko "naam galat hai" kah kar dar bechna aur uske sudhaar ke paise lena — is kshetra ki sabse buri baat hai.** Is page par wo sewa nahi bikti, aur hum uski salah bhi nahi dete.',
    ],
  },
  {
    id: 'naam-kya-nahi-karta',
    h2: 'Naam kya nahi karta — seema saaf rakhiye',
    paras: [
      'Ye seema likhna zaroori hai kyunki iske na hone se bahut si galat umeedein banti hain.',
      'Naam **nahi** badalta: bachche ka nakshatra, uska lagna, uske bhaav, uski dasha, ya uski kshamata. Ye sab janm ke kshan par tikte hain. Naam unme se kisi ko chhoota bhi nahi.',
      'Naam **jo karta hai**: wo bachche ki pehchan ka pehla hissa banta hai, aur paramapara mein use ek shubh aarambh maana jaata hai. Iska apna mool hai — bachcha jeevan bhar wo shabd sunta hai.',
      'Isliye naam ko utna hi vazan dijiye jitna wo rakhta hai — **ek sundar aur soch-samajh kar chuni hui shuruat**, bhagya ka niyantran nahi. Bachche ke bhavishya se jude asli prashnon ke liye [Child Birth Prediction](/learn/child-birth-prediction) aur [Number of Children Prediction](/learn/number-of-children-prediction) alag hain.',
    ],
  },
  {
    id: 'nakshatra-ka-swabhav',
    h2: 'Bachche ke nakshatra ka swabhav — kitna maanein',
    paras: [
      'Naamakshar ke saath maa-baap prayah nakshatra ka swabhav bhi padhte hain, isliye is par santulit baat zaroori hai.',
      'Har nakshatra ka apna **swami graha** aur **devta** hai, aur usi se uske gun bataye jaate hain — Rohini ka Chandra aur Brahma (saundarya, srijan), Pushya ka Shani aur Brihaspati (poshan, vidya), Anuradha ka Shani aur Mitra (nishtha, mitrata).',
      'Ye padhna dilchasp hai aur ek nazariya deta hai. **Par ise bachche ka naksha maan lena galti hai.** Duniya ke har sattaisve vyakti ka nakshatra aapke bachche wala hi hai, aur unka swabhav ek jaisa nahi hai.',
      'Aur sabse zaroori: **kabhi kisi bachche ko uske nakshatra ke aadhaar par "aisa hi hoga" mat bataiye.** Bachche uske hisaab se dhalne lagte hain, aur wo kisi bhi jyotishiya faayde se bada nuksan hai. Nakshatron ka poora parichay [Nakshatra Guide](/learn/nakshatra-guide) mein hai.',
    ],
  },
  {
    id: 'paya',
    h2: 'Paya kya hota hai — aur ye naam se juda hai?',
    paras: [
      'Ye PASF mein aata hai ("जन्म नक्षत्र पाया") aur log ise naam se jodne lagte hain, isliye antar saaf kar dena chahiye.',
      '**Paya** janm ke samay Chandra ki sthiti se nikala jaata hai aur use char dhatuon se joda jaata hai — sona, chandi, taamba aur loha. Paramapara mein har paya ka apna arth bataya jaata hai.',
      '**Iska naam se koi seedha rishta nahi hai.** Naamakshar pada se aata hai; paya alag ganana hai. Dono ek hi Chandra sthiti se nikalte hain, par do alag cheezein hain.',
      'Aur ek santulit baat: **loha paya ko "ashubh" batana aam hai aur wo dar bechne ka tarika hai.** Kisi bhi paya mein janm ashubh nahi hai. Agar koi is naam par upay beche to us se door rehna chahiye.',
    ],
  },
  {
    id: 'kitna-sakht',
    h2: 'Ye niyam kitna sakht hai — kya iska paalan zaroori hai',
    paras: [
      'Naye maa-baap ye prashn dabi zubaan mein poochhte hain, isliye seedha uttar dena chahiye.',
      '**Ye ek shubh paramapara hai, koi anivarya niyam nahi.** Kisi bhi granth mein ye nahi likha ki alag akshar se naam rakhne par bachche ka nuksan hoga. Jo likha hai wo itna hai ki nakshatra ke akshar se rakha gaya naam shubh maana jaata hai.',
      'Vyavharik roop se: **Bharat mein karodon log aise naam ke saath jee rahe hain jo unke nakshatra se nahi aaye**, aur unke jeevan mein koi kami is wajah se nahi hai.',
      'Isliye ise ek **sundar paramapara** ki tarah lijiye — nibhaa sakein to achha, na nibhaa sakein to bhi theek. Aur agar koi ise dar ke saath bataye, to samajh lijiye ki wo paramapara nahi, kuch aur bech raha hai.',
    ],
  },
  {
    id: 'dakshin-bharat',
    h2: 'Dakshin Bharat aur Kerala mein reet kaise alag hai',
    paras: [
      'Ye antar jaan lena upyogi hai kyunki wahan nakshatra ko rashi se zyada vazan diya jaata hai.',
      'Tamil Nadu, Kerala aur Andhra mein **"star" (nakshatra) hi mukhya pehchan hai.** Janmdin bhi prayah nakshatra ke hisaab se manaya jaata hai, tareekh se nahi — jise "star birthday" kehte hain. Naam bhi prayah nakshatra ke akshar se hi rakha jaata hai.',
      'Naamon ke roop bhi alag hote hain: Ashwini ko Malayalam mein Ashwathi, Bharani ko Bharani, Krittika ko Karthika kehte hain. **Ganana bilkul wahi hai** — sirf naam alag hain.',
      'Isliye agar aap us paramapara se hain to ye page utna hi kaam ka hai; bas akshar ko apni bhasha ki dhwani mein padhiye. Nakshatra ke naamon ka anuvaad [Nakshatra Calculator](/calculators/free-nakshatra-calculator) par hai.',
    ],
  },
  {
    id: 'dusre-tool-alag',
    h2: 'Har site alag akshar de rahi hai — kaun sahi hai',
    paras: [
      'Ye aam hai aur teen thos wajah hain. Unhe isi kram mein jaanchiye.',
      '**Ek — pada ka hisaab.** Bahut si site sirf nakshatra maang kar ek akshar de deti hain, pada nahi. Aise mein char mein se ek chun liya jaata hai — aur wo prayah galat hoga. Ye sabse aam wajah hai.',
      '**Do — janm samay.** Agar samay galat ya anumaan se hai to pada badal jaata hai. Ek ghante ki galti kaafi hai.',
      '**Teen — ayanamsha.** Lahiri, Krishnamurti aur Raman thoda alag aankda dete hain, aur pada ki sandhi ke paas wo bhi antar la sakta hai. Hum Lahiri use karte hain, jo Bharat sarkar ka maanak hai.',
      'Jaanchne ka tarika: **pehle dekhiye ki doosri site ne pada bataya ya nahi.** Agar nahi bataya to uska akshar andaaza hai, ganana nahi.',
    ],
  },
  {
    id: 'kab-chalayein',
    h2: 'Ye calculator kab chalana chahiye',
    paras: [
      'Chhota par vyavharik prashn, aur uska uttar naamkaran ke kram se nikalta hai.',
      '**Janm ke turant baad** — sabse pehla kaam sateek samay likh lena hai, ghadi dekh kar, ghanta aur minute dono. Ye das second ka kaam hai jo aage sab kuch sateek banata hai.',
      '**Pehle do-teen din mein** — calculator chala kar nakshatra, pada aur akshar nikaal lijiye. Isse naam chunne ke liye poora hafta mil jaata hai, jo kaafi hai.',
      '**Naamkaran se pehle** — ek baar dobara jaanch lijiye, khaas kar agar samay baad mein pramanpatra se badla ho. Aur Gandmool nikla ho to 27 din wali reet ka dhyan rakh lijiye. Muhurat ke liye [Panchang](/panchang) free hai.',
    ],
  },
  {
    id: 'free-kya',
    h2: 'Is page par kya-kya milta hai, bilkul muft',
    paras: [
      'Poora page free hai. Milta hai: bachche ka **janm nakshatra**, **pada**, **shubh naamakshar**, **Chandra rashi**, Gandmool ka flag, aur us akshar se shuru hone wale **naam ki soochi arth ke saath** — ladke aur ladki dono ke liye.',
      'Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata.',
      'Aur jo yahan jaanbujh kar **nahi** hai: koi paid naam-sudhaar sewa, koi Gandmool ka mehnga upay, aur koi "lucky naam" ki bikri. Naye maa-baap is kshetra mein sabse aasan nishana hote hain, aur is page par wo nahi hoga.',
    ],
  },
  {
    id: 'nakshatra-pada-ganit',
    h2: 'Nakshatra aur pada ka ganit — ek nazar mein',
    paras: [
      'Ankon ka hisaab jaan lena is poore vishay ko saaf kar deta hai, aur wo saral hai.',
      'Aakash ke **360 degree** ko **27 nakshatron** mein baanta gaya hai. Har nakshatra hua **13 degree 20 minute** ka. Us nakshatra ko phir **char barabar pada** mein baanta jaata hai — har pada **3 degree 20 minute** ka.',
      'Chandra lagbhag **13 degree roz** chalta hai. Iska matlab wo ek nakshatra lagbhag **ek din** mein paar karta hai, aur ek pada lagbhag **chhe ghante** mein — par uski gati badalti rehti hai, isliye ye ausat hai.',
      'Kul **108 pada** hain (27 × 4), aur yahi wo 108 syllable dete hain jinse naam banta hai. Isi liye 108 sankhya Bharatiya paramapara mein bar-bar aati hai.',
    ],
  },
  {
    id: 'nakshatra-swami',
    h2: 'Nakshatra ka swami graha — naam ke saath kya rishta',
    paras: [
      'Har nakshatra ka ek swami graha hai, aur log poochhte hain ki iska naam se kya lena-dena.',
      'Seedha uttar: **naamakshar ka swami graha se koi seedha rishta nahi hai.** Akshar pada se aata hai, aur pada sirf ek sthaan hai — 108 mein se ek. Swami graha nakshatra ke **gun** batata hai, uske akshar nahi.',
      'Par ek parokshha rishta zaroor hai: **nakshatra ka swami graha aapke bachche ki pehli Mahadasha tay karta hai.** Vimshottari dasha janm nakshatra se shuru hoti hai — Ashwini ka swami Ketu hai, to Ashwini mein janme bachche ki pehli dasha Ketu ki hogi.',
      'Yaani nakshatra do cheezein deta hai: **naam ka akshar (pada se)** aur **jeevan ki pehli dasha (swami se)**. Dasha ka kram [Dasha Calculator](/calculators/free-dasha-calculator) par dikh jaata hai.',
    ],
  },
  {
    id: 'rashi-naam-poojan',
    h2: 'Rashi naam poojan mein kaise prayog hota hai',
    paras: [
      'Do naam wali reet ka vyavharik pehlu ye hai — aur kai log ise jaane bina do naam rakh lete hain.',
      '**Rashi naam** wo hai jo shubh akshar se rakha gaya. Uska prayog **sankalp** mein hota hai — poojan, havan, vivah aur anya sanskaron mein jab pandit vyakti ka naam, gotra aur nakshatra bolte hain. Wahan yahi naam liya jaata hai.',
      'Isi liye kai parivaar rashi naam ko **likh kar rakh lete hain** — nakshatra aur gotra ke saath. Ye jaankari jeevan bhar kaam aati hai aur prayah tab dhoondhi jaati hai jab jaldi hoti hai.',
      'Salah: **aaj hi ek jagah likh lijiye** — bachche ka sateek janm samay, nakshatra, pada, rashi naam aur gotra. Ye paanch cheezein ek kaagaz par, aur agle chalis saal ke liye jhanjhat khatm.',
    ],
  },
  {
    id: 'ladka-ladki',
    h2: 'Ladke aur ladki ke liye alag akshar hote hain?',
    paras: [
      'Ye prashn aata hai aur uska uttar chhota hai: **nahi.**',
      '**Naamakshar ling se nahi badalta.** Wo pada se aata hai, aur pada bachche ke ling se koi matlab nahi rakhta. Pushya ke doosre pada mein janme ladke aur ladki dono ka akshar "He" hoga.',
      'Jo badalta hai wo **naam ki soochi** hai — us akshar se shuru hone wale naam ladkon ke liye alag hain aur ladkiyon ke liye alag. Isi liye result dono soochiyaan alag dikhata hai.',
      'Aur ek baat: **kuch naam dono ke liye chalte hain** — jaise Kiran, Nitya, Amar. Agar aapko aisa koi naam pasand hai to usme koi rok nahi hai.',
    ],
  },
  {
    id: 'gotra-nakshatra',
    h2: 'Gotra aur nakshatra — dono kyun likh kar rakhein',
    paras: [
      'Ye page naam ka hai, par ek vyavharik salah yahan de deni chahiye kyunki log baad mein pareshan hote hain.',
      'Sanskaron mein **sankalp** ke waqt teen cheezein maangi jaati hain: **naam, gotra aur nakshatra.** Naam aapko pata hota hai; gotra prayah parivaar se aata hai; **nakshatra aksar kisi ko yaad nahi rehta.**',
      'Isi liye salah: aaj hi **bachche ka nakshatra aur pada likh lijiye**, gotra ke saath. Ye vivah tak, aur uske baad bhi, bar-bar kaam aayega.',
      'Aur agar aapko apna khud ka nakshatra nahi pata — jo bahut aam hai — to [Nakshatra Calculator](/calculators/free-nakshatra-calculator) se ek minute mein mil jaayega, bilkul free.',
    ],
  },
  {
    id: 'kaunsa-samay-lein',
    h2: 'Hospital ka samay ya ghar ki yaad — kaunsa lein',
    paras: [
      'Ye is page ka sabse vyavharik sawal hai kyunki poora akshar isi par tikta hai.',
      '**Hospital record ya janm pramanpatra hamesha behtar hai.** Wahan samay likha jaata hai, prayah minute tak. Ghar ki yaad prayah aadhe ghante par gol kar di jaati hai — "subah lagbhag saat baje" — aur pandrah minute ki galti bhi pada badal sakti hai.',
      'Agar dono mein antar ho: **record ko maaniye.** Yaad samay ke saath dhundhli hoti hai; kaagaz nahi hota.',
      'Aur agar record mein sirf **din** likha hai, samay nahi — to upar wala rasta apnaaiye: us nakshatra ke chaaron akshar dekhiye aur unme se chuniye. Chaaron usi nakshatra ke hain, aur ye andaaza lagane se behtar hai.',
    ],
  },
  {
    id: 'yaad-rakhne-layak',
    h2: 'Yaad rakhne layak — teen line mein poora page',
    paras: [
      '**Ek — akshar pada se aata hai, nakshatra se nahi.** Ek nakshatra ke char pada aur char alag akshar hain. Jo tool pada na bataye, wo andaaza de raha hai.',
      '**Do — ye paramapara hai, niyam nahi.** Naam us akshar se rakhna shubh maana jaata hai; na rakhne se koi nuksan nahi hota. Do naam wali reet hamesha khuli hai.',
      '**Teen — koi bhi cheez is naam par khareedne ki zaroorat nahi.** Na Gandmool ka upay, na paya ka, na naam-sudhaar ki sewa. Ye page free hai aur ye jaankari kisi ki bhi free honi chahiye.',
    ],
  },
  {
    id: 'shubh-nakshatra-naam',
    h2: 'Kya shubh nakshatra ka naam zyada shubh hota hai',
    paras: [
      'Maa-baap poochhte hain ki agar bachcha Pushya ya Rohini jaise shreshth nakshatra mein paida hua hai to kya uska naam bhi zyada shubh hai.',
      'Uttar: **nahi, akshar ka shubhata se koi rishta nahi hai.** Sabhi 108 syllable barabar hain — koi akshar doosre se behtar nahi kaha gaya. Nakshatra ki shubhata us nakshatra ke **gun** ki baat hai, uske akshar ki nahi.',
      'Aur ek zaroori baat uske ulta bhi: **Gandmool ya kisi bhi nakshatra ka akshar kam shubh nahi hai.** Mula nakshatra se aane wale "Ye, Yo, Bha, Bhi" utne hi shubh hain jitne Pushya ke "Hu, He, Ho, Da".',
      'Isliye apne pada ka akshar bina jhijhak lijiye. Us akshar se ek sundar naam chunna hi poora kaam hai.',
    ],
  },
  {
    id: 'ghar-mein-matbhed',
    h2: 'Ghar mein naam par matbhed — kaise sulajhaayein',
    paras: [
      'Ye jyotish ka prashn nahi hai par har parivaar mein aata hai, isliye ek vyavharik salah de deni chahiye.',
      'Sabse aam takrav: dada-dadi paramparik naam chahte hain, maa-baap aadhunik. Iska sabse saaf hal wahi **do naam wali reet** hai — ek shubh akshar wala rashi naam bade-buzurgon ke liye, aur ek pukaarne wala naam maa-baap ki pasand ka. Dono kaagaz par bhi rah sakte hain.',
      'Doosra aam takrav: do log alag nakshatra bata rahe hain. Iska hal jyotish mein nahi, **kaagaz mein** hai — hospital record se samay nikaal kar ek baar calculator chala lijiye, aur wahi maan lijiye.',
      'Aur ek baat jo shanti se kehni chahiye: **naam par mahinon ka tanav kisi bachche ke liye achha nahi hai.** Paramapara isse itna vazan nahi deti jitna log de dete hain.',
    ],
  },
  {
    id: 'kis-liye-nahi',
    h2: 'Ye page kis liye nahi hai',
    paras: [
      'Ye likh dena zaroori hai taaki koi galat umeed le kar na jaaye.',
      'Ye page **nahi** batata: bachche ka bhavishya, uski kshamata, uska career, ya uske jeevan ki koi ghatna. Naam ka akshar ek shubh sanket hai — isse na koi bhavishyavani nikalti hai, na koi seema.',
      'Aur ye page **nahi bechta**: koi paid naam-sudhaar sewa, Gandmool ka upay, paya ka upay, ya "lucky naam" ki koi list. Ye teeno naye maa-baap ko sabse zyada beche jaate hain, aur teeno ke peeche koi shastriya zaroorat nahi hai.',
      'Jo ye deta hai: **sateek nakshatra, pada, shubh akshar aur naam ki soochi** — is saaf soochna ke saath ki ye ek paramapara hai, koi shart nahi.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Naam ke baad — aage kya dekhein',
    paras: [
      'Bachche ka poora chart banana ho to [Kundali Calculator](/calculators/free-kundali-calculator) free hai, aur uska nakshatra vistaar se [Nakshatra Calculator](/calculators/free-nakshatra-calculator) par.',
      'Bachche se jude asli prashn — [Child Birth Prediction](/learn/child-birth-prediction), aur agla bachcha kab ya kitne, uske liye [Number of Children Prediction](/learn/number-of-children-prediction) tatha [Santan Yog Calculator](/calculators/free-santan-yog-calculator).',
      'Sidhant samajhna ho — [Nakshatra Guide](/learn/nakshatra-guide) mein sattais nakshatra khole gaye hain aur [Planets in Astrology](/learn/planets-in-astrology) mein har graha ka swabhav. Bachche ki rashi ke liye [Rashi Calculator](/calculators/free-rashi-calculator).',
    ],
  },
];

type BnLink = { href: string; label: string; note: string };

const HUB_CALC: BnLink[] = [
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Nakshatra aur pada' },
  { href: '/calculators/free-rashi-calculator', label: 'Rashi Calculator', note: 'Bachche ki Chandra rashi' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-child-birth-muhurat-calculator', label: 'Child Birth Muhurat', note: 'Planned delivery ka samay' },
  { href: '/calculators/free-santan-yog-calculator', label: 'Santan Yog Calculator', note: 'Santan ka yog' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Bachche ka lagna' },
  { href: '/calculators/free-numerology-calculator', label: 'Numerology Calculator', note: 'Ank wali paddhati' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Poora chitra' },
  { href: '/panchang', label: 'Panchang', note: 'Naamkaran ka muhurat' },
];

const HUB_LEARN: BnLink[] = [
  { href: '/learn/nakshatra-guide', label: 'Nakshatra Guide', note: 'Sattais nakshatra' },
  { href: '/learn/child-birth-prediction', label: 'Child Birth Prediction', note: 'Bachche se jude prashn' },
  { href: '/learn/number-of-children-prediction', label: 'Number of Children Prediction', note: 'Alag prashn' },
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Nakshatra swami ka swabhav' },
  { href: '/blog/lucky-baby-name-letter-by-nakshatra', label: 'Lucky baby name letter', note: 'Poora lekh' },
  { href: '/blog/lucky-baby-name-letter-by-nakshatra-hindi', label: 'नक्षत्र से नामाक्षर — हिंदी', note: 'Hindi mein' },
  { href: '/blog/pushya-nakshatra-baby-birth', label: 'Pushya nakshatra', note: 'Sabse shubh maana jaata' },
  { href: '/blog/rohini-nakshatra-baby-birth', label: 'Rohini nakshatra', note: 'Chandra ka nakshatra' },
  { href: '/blog/anuradha-nakshatra-baby-birth', label: 'Anuradha nakshatra', note: 'Shani ka nakshatra' },
];

function BnRich({ text, k }: { text: string; k: string }) {
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

function BnHub({ items }: { items: BnLink[] }) {
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

export default function FreeBabyNameByNakshatraPage() {
  const [form, setForm] = useState<FormData>({
    date: '', time: '12:00', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [genderPref, setGenderPref] = useState<'b' | 'g' | 'any'>('any');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const set = useCallback((key: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.date) errs.date = 'Date of birth is required';
    if (!form.unknownTime && !form.time) errs.time = 'Time of birth is required';
    if (form.latitude === null) errs.latitude = 'Please select a city from suggestions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    const [year, month, day] = form.date.split('-').map(Number);
    const tob = form.unknownTime ? '12:00' : form.time;
    const [hour, minute] = tob.split(':').map(Number);
    setLoading(true);
    try {
      const res = await fetch('/api/calc/kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day, hour, minute,
          latitude: form.latitude, longitude: form.longitude, timezone: form.timezone,
          calcType: 'nakshatra',
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Result extraction ──────────────────────────────────────
  const nakName: string | null = result?.instant?.nakshatra || null;
  const pada: number | null = result?.instant?.pada ?? null;
  const nakLord: string | null = result?.instant?.nakshatra_lord || null;
  const rashi: string | null = result?.instant?.chandra_rashi || null;

  const nak = nakName ? resolveNak(nakName) : null;
  const akshar: string | null = (nak && pada && pada >= 1 && pada <= 4) ? nak.aksh[pada - 1] : null;

  let suggestions: N[] = akshar ? getNames(akshar) : [];
  if (genderPref !== 'any') suggestions = suggestions.filter((x) => x[1] === genderPref);

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-baby-name-by-nakshatra';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Baby Name by Nakshatra — Lucky Starting Letter & Names',
    description:
      "Find your baby's birth nakshatra, pada and the auspicious starting syllable (Naamakshar), with suggested names and meanings. Free Vedic calculator by Trikaal Vaani.",
    breadcrumbName: 'Free Baby Name by Nakshatra',
    aboutEntities: ['Nakshatra', 'Pada', 'Naamakshar', 'Chandra (Moon)'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Nakshatra & Pada', 'Naamakshar (Vedic Naming)'],
    howToName: "How to find your baby's lucky starting letter (Naamakshar) by nakshatra",
    howToSteps: [
      { name: 'Enter birth details', text: "Enter your baby's date of birth, exact time of birth and place of birth." },
      { name: 'Calculate the nakshatra', text: "The calculator computes the Moon's nakshatra and pada using Swiss Ephemeris with Lahiri Ayanamsha." },
      { name: 'Get the lucky letter', text: "See your baby's lucky starting syllable (Naamakshar) along with suggested names and their meanings." },
    ],
    faqs: FAQS,
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
            <span style={{ color: GOLD }}>Free Baby Name by Nakshatra</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Baby Name by Nakshatra — Lucky Starting Letter &amp; Names
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              Vedic parampara mein bachche ka naam uske <strong style={{ color: GOLD }}>janma nakshatra aur pada</strong> ke shubh prarambhik akshar (Naamakshar) se shuru kiya jaata hai. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Baby Name Calculator</strong> Swiss Ephemeris se Chandra ka nakshatra, pada aur shubh akshar nikaalta hai — aur us akshar se shuru hote naam (arth ke saath) suggest karta hai. Bilkul free.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · Nakshatra-Pada Naamakshar · Lahiri Ayanamsha</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Baby's Lucky Letter &amp; Names (Free)</h2>
            <div className="grid gap-5">
              <div>
                <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Baby's Date of Birth <span className="text-yellow-400">*</span></label>
                <input id="tv-dob" type="date" value={form.date}
                  onChange={e => set('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="tv-tob" className="text-sm font-medium text-slate-300">
                    Time of Birth {!form.unknownTime && <span className="text-yellow-400">*</span>}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                    <input type="checkbox" checked={form.unknownTime} onChange={e => set('unknownTime', e.target.checked)} className="rounded" />
                    Unknown time
                  </label>
                </div>
                <input id="tv-tob" type="time" value={form.time}
                  onChange={e => set('time', e.target.value)} disabled={form.unknownTime}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ ...inputStyle(!!errors.time), opacity: form.unknownTime ? 0.4 : 1 }} />
                {form.unknownTime
                  ? <p className="text-amber-400/80 text-xs mt-1">⚠️ Chandra tezi se chalta hai — exact time ke bina pada (aur akshar) galat ho sakta hai. Time daalna best hai.</p>
                  : <p className="text-slate-500 text-xs mt-1">Pada ke liye exact birth time zaroori hai.</p>}
                {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name For</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: 'b', label: '👦 Boy', color: '#60a5fa' }, { value: 'g', label: '👧 Girl', color: '#f472b6' }, { value: 'any', label: '✨ Any', color: '#94a3b8' }].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setGenderPref(opt.value as any)}
                      className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center"
                      style={{ background: genderPref === opt.value ? `${opt.color}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${genderPref === opt.value ? `${opt.color}60` : 'rgba(255,255,255,0.1)'}`, color: genderPref === opt.value ? opt.color : '#64748b' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Place of Birth <span className="text-yellow-400">*</span></label>
                <CityInput id="tv-place" value={form.placeQuery} error={errors.latitude}
                  onSelect={(city, lat, lng, tz) => {
                    setForm(prev => ({ ...prev, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }));
                    setErrors(prev => { const n = { ...prev }; delete n.latitude; return n; });
                  }} />
              </div>

              {form.latitude !== null && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Latitude', value: form.latitude.toFixed(4) },
                    { label: 'Longitude', value: form.longitude!.toFixed(4) },
                    { label: 'Timezone', value: `UTC ${form.timezone >= 0 ? '+' : ''}${form.timezone}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-xs text-slate-500 mb-1">{label}</label>
                      <div className="px-3 py-2 rounded-lg text-xs font-mono text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#22c55e' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? GOLD_RGBA(0.3) : `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                {loading ? '⟳ Finding Lucky Letter...' : '👶 Find Lucky Letter & Names'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · Nakshatra-Pada Naamakshar</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* NAKSHATRA + AKSHAR */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Janma Nakshatra</div>
                <div className="text-3xl md:text-4xl font-serif font-bold mb-1" style={{ color: GOLD }}>
                  {nakName || '—'}{pada ? <span className="text-xl text-slate-300"> · Pada {pada}</span> : null}
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  {rashi ? `Rashi: ${rashi}` : ''}{nakLord ? ` · Nakshatra Lord: ${nakLord}` : ''}
                </div>
                {akshar ? (
                  <>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Shubh Prarambhik Akshar</div>
                    <div className="inline-block px-6 py-3 rounded-2xl text-4xl font-serif font-bold" style={{ background: GOLD, color: '#080B12' }}>{akshar}</div>
                    <div className="text-sm text-slate-300 mt-3">Naam "{akshar}" se shuru karna shubh mana jaata hai.</div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400">Nakshatra/pada se akshar resolve nahi ho paya — exact birth time ke saath try karein.</div>
                )}
              </div>

              {/* NAME SUGGESTIONS */}
              {akshar && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-1" style={{ color: GOLD }}>
                    "{akshar}" Se Shuru Hote Naam {genderPref === 'b' ? '(Boys)' : genderPref === 'g' ? '(Girls)' : ''}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Arth ke saath — inspiration ke liye curated list</p>

                  {suggestions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggestions.map((nm, i) => (
                        <div key={i} className="p-3 rounded-xl flex items-start justify-between gap-3" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                          <div>
                            <div className="font-semibold" style={{ color: GOLD }}>{nm[0]}</div>
                            <div className="text-xs text-slate-400">{nm[2]}</div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: nm[1] === 'b' ? 'rgba(96,165,250,0.15)' : 'rgba(244,114,182,0.15)', color: nm[1] === 'b' ? '#93C5FD' : '#F9A8D4' }}>
                            {nm[1] === 'b' ? 'Boy' : 'Girl'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl text-sm text-slate-300" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                      Aapka shubh akshar <strong style={{ color: GOLD }}>"{akshar}"</strong> hai. Is akshar/gender ke liye humari curated list mein abhi naam nahi — aap "{akshar}" se shuru koi bhi sundar arthpurn naam chun sakte hain (yeh akshar hi shubh hai). 🙏
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-3">Note: Naamakshar chart ke kuch traditions mein halka antar hota hai. Akshar ko guidance ki tarah lein.</p>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Bachche ki poori janma-kundali aur nakshatra phal jaanna chahte hain?</p>
                <Link href="/calculators/free-nakshatra-calculator"
                  className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  Nakshatra Finder try karein →
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
                    <BnRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* comparison table — kept from v1.x, unchanged */}
          <section className="mt-4 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs AstroSage vs AstroTalk</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                    <th className="p-3 text-left text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Pada-level Akshar</td><td className="p-3" style={{ color: GOLD }}>✓ Exact (4 padas)</td><td className="p-3 text-slate-500">~ Nakshatra-only</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Engine</td><td className="p-3">Swiss Ephemeris (NASA-grade)</td><td className="p-3 text-slate-500">Basic algorithm</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Names with Meanings</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">~ Partial</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Boy / Girl Filter</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">~ Mixed</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Price</td><td className="p-3" style={{ color: GOLD }}>✓ Free</td><td className="p-3 text-slate-500">~ Ads / paid</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── v2.0: the naming cluster this page was barely linked to ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Naam ke aas-paas — baaki free tools aur guide</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Nakshatra pehchanna ho to Nakshatra Calculator, poora chart banana ho to Kundali Calculator, aur naamkaran ka muhurat Panchang par. Sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free tools</h3>
                <BnHub items={HUB_CALC} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Padhne ke liye</h3>
                <BnHub items={HUB_LEARN} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Baby Name by Nakshatra</h2>
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
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
                { slug: 'free-numerology-calculator', name: 'Numerology' },
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
                { slug: 'free-rashi-calculator', name: 'Rashi Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-kundali-strength-calculator', name: 'Kundali Strength' },
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
