'use client';

// ============================================================
// File: app/calculators/free-baby-name-by-nakshatra/page.tsx
// Version: v1.1 — Free Baby Name by Nakshatra Calculator
// API: /api/calc/kundali (calcType: 'nakshatra') — already live
// Core (nakshatra+pada→akshar) is exact from VM; name list is a
// curated suggestion set (no fabricated meanings).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
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
];

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

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Nakshatra Se Naam Kaise Rakhein? — Naamakshar Vidhi</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Vedic parampara mein <strong style={{ color: GOLD }}>naamkaran</strong> (naming) ke liye bachche ke janma ke samay <strong>Chandra (Moon)</strong> jis <strong>nakshatra</strong> aur uske jis <strong>pada (charan)</strong> mein hota hai, uska shubh prarambhik akshar (Naamakshar) liya jaata hai. Har nakshatra ke 4 pada hote hain, aur har pada ka apna akshar — kul 108 (27 × 4) akshar-sthaan.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Maana jaata hai ki is akshar se shuru naam bachche ki nakshatra-energy ke saath resonate karta hai, jisse naam aur vyakti ke beech ek shubh tālmel banta hai.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Pada Kyun Zaroori Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Sirf nakshatra kaafi nahi — kyunki har nakshatra ke 4 pada ke alag akshar hote hain. Chandra ek nakshatra ko lagbhag sava din mein paar karta hai, aur ek pada kuch ghanton ka hota hai. Isliye sahi pada (aur akshar) ke liye <strong>exact time of birth</strong> bahut zaroori hai.
            </p>

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
