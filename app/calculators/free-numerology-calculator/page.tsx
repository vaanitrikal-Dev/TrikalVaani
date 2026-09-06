'use client';

// ============================================================
// File: app/calculators/free-numerology-calculator/page.tsx
// Version: v2.0 (05 Sep 2026) — Free Numerology Calculator (Mulank / Bhagyank / Naamank)
// NO VM, NO API — pure client-side date/name math (Cheiro / Vedic numerology)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v2.0 (2026-09-05) — Keyword-driven content build from Radar E3 PASF.
//        ~700 -> ~5,200 words, 3 H2 -> 36, TOC added, FAQs 8 -> 15,
//        new layout.tsx title. The form, NUM_DATA, the number-to-planet
//        table and the JSON-LD are untouched.
//   v1.1 (2026-06-02) — Gold-standard JSON-LD: swapped inline 4-node
//        @graph for buildCalcJsonLd() helper (8 @id-linked nodes:
//        Organization+real sameAs, WebSite, linkable Person /founder,
//        WebPage isPartOf #website [no longer dangling], BreadcrumbList,
//        WebApplication, HowTo, FAQPage). HowTo uses name+DOB only (no
//        time/place). No logic/UI/form change.
//   v1.0 — initial build.
// ============================================================

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface NumInfo {
  planet: string;
  planet_hi: string;
  traits: string;
  colors: string;
  days: string;
  lucky: string;
  friends: number[];
}

// Number → planet + lucky data (Cheiro / Indian numerology)
const NUM_DATA: Record<number, NumInfo> = {
  1: { planet: 'Sun',     planet_hi: 'सूर्य', traits: 'Leadership, independence, confidence, ambition', colors: 'Gold, Orange, Yellow', days: 'Sunday, Monday', lucky: '1, 10, 19, 28', friends: [1, 2, 3, 9] },
  2: { planet: 'Moon',    planet_hi: 'चंद्र', traits: 'Sensitive, intuitive, caring, diplomatic',        colors: 'White, Cream, Light Green', days: 'Monday, Friday', lucky: '2, 11, 20, 29', friends: [1, 2, 4, 7] },
  3: { planet: 'Jupiter', planet_hi: 'गुरु',  traits: 'Wisdom, optimism, creativity, discipline',         colors: 'Yellow, Golden',          days: 'Thursday',         lucky: '3, 12, 21, 30', friends: [3, 6, 9] },
  4: { planet: 'Rahu',    planet_hi: 'राहु',  traits: 'Unconventional, hard-working, practical, rebel',    colors: 'Blue, Grey, Khaki',       days: 'Sunday, Saturday', lucky: '4, 13, 22, 31', friends: [1, 5, 7, 8] },
  5: { planet: 'Mercury', planet_hi: 'बुध',   traits: 'Communicative, adaptable, witty, business-minded',  colors: 'Green, Light tones',      days: 'Wednesday, Friday', lucky: '5, 14, 23',     friends: [1, 3, 5, 6, 9] },
  6: { planet: 'Venus',   planet_hi: 'शुक्र', traits: 'Loving, artistic, luxurious, harmonious',           colors: 'White, Pink, Pastels',    days: 'Friday, Wednesday', lucky: '6, 15, 24',     friends: [3, 6, 9] },
  7: { planet: 'Ketu',    planet_hi: 'केतु',  traits: 'Spiritual, intuitive, researcher, mystical',        colors: 'White, Light Green, Smoke', days: 'Sunday, Monday', lucky: '7, 16, 25',     friends: [1, 2, 4, 7] },
  8: { planet: 'Saturn',  planet_hi: 'शनि',   traits: 'Disciplined, karmic, persistent, just',             colors: 'Black, Dark Blue, Purple', days: 'Saturday',        lucky: '8, 17, 26',     friends: [4, 5, 8] },
  9: { planet: 'Mars',    planet_hi: 'मंगल',  traits: 'Energetic, courageous, determined, protective',     colors: 'Red, Crimson',            days: 'Tuesday',          lucky: '9, 18, 27',     friends: [3, 6, 9] },
};

// Chaldean letter values (no 9 in Chaldean)
const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

function reduceToSingle(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

function calcMulank(day: number): number {
  return reduceToSingle(day);
}

function calcBhagyank(y: number, m: number, d: number): number {
  const allDigits = `${y}${m}${d}`.split('').reduce((s, ch) => s + Number(ch), 0);
  return reduceToSingle(allDigits);
}

function calcNaamank(name: string): number | null {
  const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters) return null;
  const sum = letters.split('').reduce((s, ch) => s + (CHALDEAN[ch] || 0), 0);
  if (sum === 0) return null;
  return reduceToSingle(sum);
}

const FAQS = [
  { q: 'Mulank (Root Number) kya hota hai?', a: 'Mulank aapki birth date (sirf tareekh, 1-31) ko ek single digit (1-9) mein reduce karke milta hai. Jaise 23 ko born ho → 2+3 = 5, to Mulank 5. Yeh aapke core nature aur day-to-day vyaktitva ko represent karta hai. Indian numerology mein ise "Driver" number bhi kehte hain.' },
  { q: 'Bhagyank (Destiny Number) kya hota hai?', a: 'Bhagyank aapki poori date of birth (DD + MM + YYYY) ke saare digits jodkar single digit mein reduce karne se milta hai. Yeh aapke life-path, destiny aur long-term direction ko darshaata hai. Ise "Conductor" ya "Life Path" number bhi kehte hain.' },
  { q: 'Lucky number kaise pata chalta hai?', a: 'Aapke Mulank ke aadhar par lucky numbers, lucky days aur lucky colors fix hote hain. Calculator aapke Mulank ka ruling planet (jaise Mulank 1 = Sun) aur uske shubh numbers/colors/days turant batata hai.' },
  { q: 'Naamank (Name Number) kya hai?', a: 'Naamank aapke naam ke akshar ko Chaldean numerology values se jodkar nikalta hai. Yeh batata hai ki aapka naam kis energy ke saath resonate karta hai. Mulank aur Naamank ka tālmel (harmony) achha ho to results behtar mane jaate hain.' },
  { q: 'Mulank aur Bhagyank mein konsa zyada important hai?', a: 'Dono important hain — Mulank rozmarra ke swabhav ko, aur Bhagyank life-path ko dikhata hai. Jab dono numbers friendly hon to jeevan mein flow aur tālmel achha rehta hai. Conflict ho to remedies aur awareness se balance kiya jaata hai.' },
  { q: 'Har number ka apna planet kyun hota hai?', a: 'Indian/Cheiro numerology mein har ank (1-9) ek graha se juda hai: 1-Sun, 2-Moon, 3-Jupiter, 4-Rahu, 5-Mercury, 6-Venus, 7-Ketu, 8-Saturn, 9-Mars. Isi se number ke traits, lucky colors aur days nikalte hain — yeh numerology aur jyotish ko jodta hai.' },
  { q: 'Kya ye Numerology Calculator free hai?', a: 'Haan, 100% free. Mulank, Bhagyank, Naamank (naam se), ruling planet, lucky numbers, lucky colors, lucky days aur friendly numbers — sab bilkul free, turant.' },
  { q: 'Numerology kitna accurate hai?', a: 'Numerology ek paramparik (traditional) vidya hai jo numbers aur unke planetary associations par aadharit hai — yeh astronomical calculation nahi, balki ek symbolic system hai. Trikaal Vaani classical Cheiro/Vedic numerology rules follow karta hai. Ise guidance ki tarah lein, aur important faisle apne vivek se karein.' },
  { q: 'Mulank kaise nikale — poora tarika?', a: 'Sirf janm ki tareekh lijiye, mahina aur saal nahi. Agar tareekh 1 se 9 ke beech hai to wahi aapka mulank hai. 10 se 31 ke beech hai to ankon ko jodte jaaiye jab tak ek ank na bache. Jaise 29 ka mulank: 2 + 9 = 11, phir 1 + 1 = 2. To 29 ka mulank 2 hua.' },
  { q: 'Mulank aur bhagyank mein kya antar hai?', a: 'Mulank sirf tareekh se banta hai aur rozmarra ke swabhav ko darshata hai — aap kaise pratikriya dete hain, kya sahaj lagta hai. Bhagyank poori janm tithi se banta hai — tareekh, mahina aur saal, sab jod kar — aur jeevan ki badi disha se joda jaata hai. Dono alag hain aur ek doosre ki jagah nahi lete.' },
  { q: 'Naam se mulank kaise nikale?', a: 'Naam se jo nikalta hai use naamank kehte hain, mulank nahi. Naam ke har akshar ko Chaldean paddhati mein ek ank diya jaata hai, sab jod kar ek ank tak laaya jaata hai. Mulank hamesha tareekh se hi banta hai — naam se nahi. Ye do alag sankhyaayein hain aur inhe mila dena aam galti hai.' },
  { q: 'Chaldean aur Pythagorean paddhati mein kya antar hai?', a: 'Dono naam ke aksharon ko ank dete hain par kram alag hai. Pythagorean seedha A=1, B=2, C=3 chalta hai aur 1 se 9 tak. Chaldean dhwani par aadhaarit hai, 1 se 8 tak jaata hai (9 ko pavitra maan kar chhod deta hai), aur Bharatiya paramapara mein prayah yahi use hoti hai. Isi liye do site alag naamank de sakti hain — dono galat nahi, paddhati alag hai.' },
  { q: 'Kya numerology jyotish ka hissa hai?', a: 'Nahi, ye alag vidya hai. Jyotish khagolik ganana par chalta hai — grahon ki asli sthiti par. Numerology ankon ke symbolic arth par chalti hai. Dono ko jodne ki paramapara zaroor hai (har ank ko ek graha se joda jaata hai), par ye jodi paramparik hai, khagolik nahi. Is page par ye antar chhupaya nahi jaata.' },
  { q: 'Kya naam badalne se bhagya badal jaata hai?', a: 'Numerology ki apni paramapara mein naam ke ank badalne ki salah di jaati hai, aur bahut si jagah iske naam par mehnga paisa liya jaata hai. Imandari se: naamank badalne se aapki janm tithi nahi badalti, aur mulank tatha bhagyank wahi rehte hain. Naam badalna ek vyaktigat chunav ho sakta hai — par use bhagya ki guarantee ki tarah bechna theek nahi.' },
  { q: 'Mobile number ya gaadi ka number numerology se chunna chahiye?', a: 'Ye bahut poochha jaata hai. Paramapara mein aise ankon ko apne mulank se mel khata hua chunne ki salah hai. Par iski koi shastriya ya jaanchi hui buniyad nahi hai, aur is naam par "lucky number" bech kar paisa lena aam ho gaya hai. Agar aap ise pasand ki tarah chunte hain to theek hai; agar iske liye paisa de rahe hain to rukna chahiye.' },
];


// ════════════════════════════════════════════════════════════════════════════
// v2.0 CONTENT (05 Sep 2026)
//
// BASELINE (Radar E2 + GSC, both 05 Sep 2026)
//   ~700 words · 3 H2 · 21 internal links · 387 lines — the shortest page in
//   the thin-calculator batch.
//   GSC 3 months to 4 Sep 2026: 86 impressions, 1 click, CTR 1.16%,
//   average position 33.93.
//
// WHERE THE H2s COME FROM — Radar E3, live SERP PASF, checked 05 Sep 2026,
// cluster calc-rashi-numerology. Both tracked keywords have our_rank = null:
//     numerology calculator by date of birth free ... AIO recommends_tool
//     मूलांक कैसे निकाले ............................... AIO partial
//
//   PASF harvested and answered below:
//     Mulank kaise nikale calculator · 29 ka mulank kaise nikale
//     Mera mulank kya hai · Mulank aur bhagyank
//     Mulank or bhagyank kya hota hai · मूलांक और भाग्यांक में क्या अंतर है
//     Name se bhagyank kaise nikale · नाम से मूलांक कैसे निकाले
//     मूलांक, भाग्यांक नामांक Calculator · जन्म मूलांक कैसे निकाले
//     Numerology Calculator by name · Numerology name calculator free
//     Lucky name numerology calculator · Best numerology calculator
//     Numerology birth date 1 to 9 · Numerology chart by date of birth
//     Numerology calculator by date of birth and time
//     Numerology calculator by date of birth mobile number
//
// KEYWORD SPLIT — deliberate, do not undo
//   Radar files rashi, numerology and lucky-day in ONE cluster, but the site
//   has separate pages. This page owns mulank, bhagyank and naamank ONLY.
//     /calculators/free-rashi-calculator     — Chandra Rashi (jyotish)
//     /calculators/free-lucky-day-calculator — lucky days
//     /calculators/free-nakshatra-calculator — nakshatra and pada
//   Rashi and lucky-day are handed over by link, never given H2s here.
//
// THE HONEST CORE OF THIS PAGE
//   Numerology is not Jyotish. It is a symbolic tradition, not an
//   astronomical calculation, and the number-to-planet mapping is a
//   traditional association rather than a measured one. The v1.1 page already
//   carried a one-line note saying so; v2.0 gives that its own sections and
//   extends it to the two places where money changes hands — paid name
//   changes and "lucky" mobile or vehicle numbers. Both are declined in
//   plain language rather than sold.
//
// EVERY INTERNAL LINK WAS CHECKED against radar.pages (tier=self) on
// 05 Sep 2026. No href here is guessed.
// ════════════════════════════════════════════════════════════════════════════

type NmSection = { id: string; h2: string; paras: string[] };

const SECTIONS: NmSection[] = [
  {
    id: 'kaise-kaam',
    h2: 'Numerology Calculator — kaam kaise karta hai',
    paras: [
      'Aap **janm tithi** dete hain, aur chaho to **naam** bhi. Calculator teen sankhyaayein nikaalta hai: **mulank** (sirf tareekh se), **bhagyank** (poori janm tithi se), aur **naamank** (naam ke aksharon se).',
      'Har sankhya ke saath uska **graha**, anukool **rang**, anukool **din**, aur us ank se jude swabhav ke sanket bhi aate hain. Teeno alag hain aur teeno alag baat kehte hain — inhe mila dena is vishay ki sabse aam galti hai.',
      'Ganana turant hoti hai aur poori tarah free hai. Koi signup nahi, koi payment nahi, aur na hi koi hissa chhupa kar rakha jaata hai.',
    ],
  },
  {
    id: 'numerology-jyotish-nahi',
    h2: 'Pehle ek imandar baat — numerology jyotish nahi hai',
    paras: [
      'Ye sabse pehle kah dena zaroori hai, kyunki iske bina baaki poora page bharam paida karega — aur baaki site jyotish ki hai.',
      '**Jyotish khagolik ganana par chalta hai.** Wahan grahon ki asli sthiti naapi jaati hai, Swiss Ephemeris se, degree tak. **Numerology ankon ke symbolic arth par chalti hai.** Wahan koi khagolik naap nahi hoti — janm tithi ke ank jode jaate hain, bas.',
      'Aur jo jodi banayi jaati hai — 1 ka Surya, 2 ka Chandra, 3 ka Guru — wo **paramparik sambandh** hai, koi maapa hua rishta nahi. Iska matlab ye nahi ki numerology bemaani hai; iska matlab itna hai ki **ise us tarah nahi padha ja sakta jaise kundali padhi jaati hai.** Jo koi dono ko ek jaisa bataye, wo saaf nahi bol raha.',
    ],
  },
  {
    id: 'mulank-kaise-nikale',
    h2: 'Mulank kaise nikale — poora tarika',
    paras: [
      'Ye is page ka sabse zyada poochha jaane wala prashn hai, aur tarika itna saral hai ki aap khud kar sakte hain.',
      '**Sirf janm ki tareekh lijiye** — mahina aur saal nahi. Agar tareekh **1 se 9** ke beech hai to wahi aapka mulank hai. Agar **10 se 31** ke beech hai to ankon ko jodiye jab tak ek ank na bache.',
      'Udaharan se saaf hoga. Tareekh **7** — mulank 7. Tareekh **14** — 1 + 4 = 5. Tareekh **23** — 2 + 3 = 5. Tareekh **29** — 2 + 9 = 11, phir 1 + 1 = **2**. Tareekh **31** — 3 + 1 = 4.',
      'Ek galti jo aksar hoti hai: **mahina aur saal mat jodiye.** Wo bhagyank ka tarika hai, mulank ka nahi. Mulank hamesha akeli tareekh se banta hai.',
    ],
  },
  {
    id: 'bhagyank-kaise',
    h2: 'Bhagyank kaise nikale — aur wo mulank se alag kyun hai',
    paras: [
      'Bhagyank ka tarika mulank se lamba hai par utna hi seedha.',
      '**Poori janm tithi ke saare ank jodiye** — tareekh, mahina aur saal, sab. Phir jodte jaaiye jab tak ek ank na bache. Udaharan: **15 August 1990** — 1+5+8+1+9+9+0 = 33, phir 3+3 = **6**. To bhagyank 6 hua.',
      'Antar arth mein hai. **Mulank rozmarra ka swabhav** batata hai — aap kaise pratikriya dete hain, kya sahaj lagta hai, pehla prabhav kaisa padta hai. **Bhagyank badi disha** se joda jaata hai — jeevan kis taraf mudta hai, kis tarah ke kaam ki taraf khinchav rehta hai.',
      'Isi liye dono ek doosre ki jagah nahi le sakte, aur dono alag ho to wo virodh nahi hai — wo bahut aam hai. Prayah wahi log jinke dono alag hote hain, apne swabhav aur apni disha ke beech ek khinchav mehsoos karte hain.',
    ],
  },
  {
    id: 'naamank',
    h2: 'Naamank — naam se nikalne wala teesra ank',
    paras: [
      'Naamank teesri sankhya hai aur ise mulank samajh liya jaata hai. Ye alag hai.',
      'Tarika: **naam ke har akshar ko ek ank diya jaata hai**, sab jod kar ek ank tak laaya jaata hai. Kaunsa akshar kaunsa ank — ye paddhati par nirbhar karta hai, aur do mukhya paddhatiyaan hain (agla section dekhiye).',
      'Kaunsa naam lena chahiye — ye prashn hi asli uljhan hai. Paramapara kehti hai **wo naam jisse log aapko sach mein bulate hain**, kaagaz wala poora naam nahi. Par ismein bhi mat-bhed hai: kuch paddhatiyaan poora likha hua naam maangti hain. Isi liye do jagah alag naamank aana bahut aam hai — aur ye kisi ki galti nahi.',
      'Ek baat pukki hai: **naamank mulank ko nahi badalta.** Mulank aapki tareekh se banta hai aur wo tathya hai; naam badalne se wo waisa hi rahega.',
    ],
  },
  {
    id: 'chaldean-pythagorean',
    h2: 'Chaldean aur Pythagorean — do paddhatiyon ka antar',
    paras: [
      'Do site alag naamank kyun dikhati hain — iska poora uttar yahi hai, aur ye jaan lena bharam khatm kar deta hai.',
      '**Pythagorean** paddhati seedhi hai: A=1, B=2, C=3, aage isi kram mein, aur 9 ke baad wapas 1 se. Paashchatya numerology prayah yahi use karti hai. **Chaldean** paddhati dhwani par aadhaarit hai — akshar ka ank uske uchcharan se juda hai, kram se nahi — aur wo **1 se 8 tak hi jaati hai**, kyunki 9 ko pavitra maan kar naam mein nahi diya jaata.',
      'Bharatiya paramapara mein prayah **Chaldean** chalti hai, aur yahi is page par bhi hai.',
      'Iska matlab: **do site ka naamank alag aana saamanya hai** aur usme koi galti nahi. Par mulank aur bhagyank dono paddhatiyon mein **ek hi aayenge**, kyunki wo naam se nahi, tareekh se bante hain. Isliye agar kahin mulank alag mile to wahan sach mein galti hai.',
    ],
  },
  {
    id: 'ank-graha-jodi',
    h2: 'Har ank ka graha — ye jodi kahan se aayi',
    paras: [
      'Result mein har ank ke saath ek graha dikhta hai. Ye jodi kahan se aayi, ye jaan lena chahiye.',
      'Kram ye hai: **1 — Surya. 2 — Chandra. 3 — Guru. 4 — Rahu. 5 — Budh. 6 — Shukra. 7 — Ketu. 8 — Shani. 9 — Mangal.** Ye kram Bharatiya paramapara mein sthir hai aur Cheiro ki paddhati mein bhi yahi milta hai.',
      'Par ek baat saaf honi chahiye: **ye jodi paramparik hai, ganitiya nahi.** Iska matlab ye nahi ki aapke mulank ka graha aapki kundali mein balwan hai — dono ka koi seedha rishta nahi hai. Agar aap sach mein jaanna chahte hain ki koi graha aapki kundali mein kitna balwan hai, to wo alag ganana hai aur [Graha Bal Calculator](/calculators/free-graha-bal-calculator) uske liye free hai.',
    ],
  },
  {
    id: 'ank-1-2-3',
    h2: 'Mulank 1, 2 aur 3 — swabhav ke sanket',
    paras: [
      '**Mulank 1 — Surya.** Netritva, pahal aur apni raah chalne ka jhukav. Aise log aadesh lene se zyada dene mein sahaj hote hain, aur akele kaam karna prayah pasand karte hain. Kamzori ki taraf: zid aur doosron ki baat na sunna.',
      '**Mulank 2 — Chandra.** Sanvedansheelta, sahyog aur doosron ke mann ko padh lena. Ye log samuh mein sahaj hote hain aur beech-bachav mein achhe. Kamzori: nirnay mein der aur doosron ki raay par zyada nirbharta.',
      '**Mulank 3 — Guru.** Gyaan, abhivyakti aur seekhne-sikhane ka jhukav. Ye log baat rakhne mein sahaj hote hain aur salah dene mein bhi. Kamzori: bikhraav — ek saath bahut cheezein shuru kar dena.',
      'Yaad rahiye: **ye sanket hain, vyaktitva ka naksha nahi.** Duniya ke har nauve vyakti ka mulank aapka hi hai, aur unka swabhav aapke jaisa nahi hai.',
    ],
  },
  {
    id: 'ank-4-5-6',
    h2: 'Mulank 4, 5 aur 6 — swabhav ke sanket',
    paras: [
      '**Mulank 4 — Rahu.** Alag soch, niyam se hat kar chalna, aur wo dekh lena jo doosre nahi dekhte. Ye log paramparik raste par asahaj rehte hain. Kamzori: asthirta aur achanak faisle.',
      '**Mulank 5 — Budh.** Gati, sanvaad, vyapaar aur lachilapan. Ye log jaldi seekhte hain aur badlaav mein sahaj rehte hain. Kamzori: ek jagah tikne mein dikkat aur beech mein chhod dena.',
      '**Mulank 6 — Shukra.** Saundarya, sambandh, kala aur sukh. Ye log logon ko jodne mein sahaj hote hain aur ghar-parivaar ko vazan dete hain. Kamzori: aaram ki taraf jhukav aur takrav se bachna.',
      'Ek baar phir: **ye jodi paramparik hai.** Agar aapko ye sanket apne se mel khaate nahi lagte, to usme kuch galat nahi — mulank ek ank hai, aap ek vyakti hain.',
    ],
  },
  {
    id: 'ank-7-8-9',
    h2: 'Mulank 7, 8 aur 9 — swabhav ke sanket',
    paras: [
      '**Mulank 7 — Ketu.** Antar-drishti, ekaanth aur gehrai. Ye log bheed mein kam aur apne vichaaron mein zyada rehte hain, aur adhyayan ya adhyatm ki taraf khinchav rakhte hain. Kamzori: doori aur apni hi duniya mein simat jaana.',
      '**Mulank 8 — Shani.** Mehnat, anushasan aur dheeraj. Ye log lambe raste par chalne mein saksham hote hain, par phal der se milta hai. Kamzori: bhaari-pan aur khud par zyada sakhti.',
      '**Mulank 9 — Mangal.** Urja, saahas aur ladne ki kshamata. Ye log pahal karne mein aage rehte hain. Kamzori: jaldbaazi aur gussa.',
      'Aur ek baat jo dohrayi jaani chahiye: **8 ko "ashubh" batana bahut aam hai aur wo galat hai.** Shani der karta hai, mana nahi karta — aur yahi baat ank 8 par bhi lagu hoti hai. Is dar par bahut kuch becha jaata hai.',
    ],
  },
  {
    id: 'lucky-number',
    h2: 'Lucky number — ye kaise nikalta hai aur kitna maanein',
    paras: [
      'Result mein anukool ank, rang aur din aate hain. Unka aadhaar kya hai, ye jaan lena chahiye.',
      'Aadhaar aapke **mulank ka graha** hai. Us graha ke mitra grahon ke ank anukool maane jaate hain, shatru grahon ke ank kam. Isi tarah us graha ka rang aur us graha ka vaar anukool maana jaata hai — jaise mulank 1 ke liye Ravivar aur laal-narangi, mulank 2 ke liye Somwar aur safed.',
      'Kitna vazan dena chahiye — imandari se, **bahut zyada nahi.** Ye sahayak sanket hain, niyam nahi. Anukool rang pehanne ya anukool din chunne se koi bada badlav nahi aata; ye ek chhota sa sahara hai, samadhan nahi. Aur agar koi is aadhaar par mehnga saamaan bech raha hai, to wahan rukna chahiye.',
    ],
  },
  {
    id: 'mobile-gaadi-number',
    h2: 'Mobile ya gaadi ka "lucky" number — yahan saaf baat',
    paras: [
      'Ye is vishay ka sabse zyada becha jaane wala hissa hai, isliye is par saaf hona zaroori hai.',
      'Paramapara mein salah ye hai ki mobile number, gaadi ka number ya ghar ka number apne mulank se mel khata hua chuna jaaye — ankon ko jod kar ek ank tak laaya jaata hai aur dekha jaata hai ki wo aapke mulank ka mitra hai ya nahi.',
      'Imandar sthiti: **iski koi shastriya buniyad nahi hai** — ye adhunik numerology ka vistaar hai, prachin granth ka niyam nahi. Aur is naam par "lucky number" ke liye achhi-khasi keemat maangi jaati hai.',
      'Isliye salah seedhi hai: **agar aapko koi number pasand hai to le lijiye — usme koi harj nahi.** Par uske liye paisa dena, ya kisi ke kehne par mehnga number kharidna, is page ki salah nahi hai.',
    ],
  },
  {
    id: 'naam-badalna',
    h2: 'Naam badal kar bhagya badalna — kitna sach hai',
    paras: [
      'Ye doosri jagah hai jahan is vidya ke naam par paisa liya jaata hai, isliye seedha uttar zaroori hai.',
      'Numerology ki apni paramapara mein naam ke ank ko "sudhaarne" ki salah milti hai — ek akshar jod dena, hijje badal dena, taaki naamank mulank se mel khaaye. Bahut se log ye karte hain aur unhe achha bhi lagta hai.',
      'Jo saaf hona chahiye: **naam badalne se aapki janm tithi nahi badalti.** Mulank aur bhagyank wahi rehte hain, kyunki wo tareekh se bante hain. Sirf naamank badalta hai — teen mein se ek.',
      'Isliye: **agar naam badalna aapka apna chunav hai, to wo aapka haq hai.** Par jo koi ise bhagya badalne ki guarantee ki tarah beche, aur uske liye badi keemat maange, wo asha bech raha hai. Is page par wo nahi bikta.',
    ],
  },
  {
    id: 'bachche-ka-naam',
    h2: 'Numerology se baby name rakhna — kya dhyan rakhein',
    paras: [
      'Ye prashn nayi maa-baap ke liye asli hai, aur do paramparaein aamne-saamne aa jaati hain.',
      '**Nakshatra wali paramapara** jyotish ki hai: bachche ke janm nakshatra ka pada dekha jaata hai, us pada ka nishchit shubh syllable liya jaata hai, aur usi se naam shuru hota hai. Iska aadhaar khagolik hai — Chandra ki asli sthiti.',
      '**Ank wali paramapara** numerology ki hai: naam ke aksharon ka jod bachche ke mulank se mel khaana chahiye. Iska aadhaar symbolic hai.',
      'Imandar salah: **agar dono mein se ek chunna hai to nakshatra wali chuniye**, kyunki uska aadhaar ganana hai aur wo Bharatiya naamkaran ki mool paramapara bhi hai. Sahi pada aur akshar [Baby Name by Nakshatra](/calculators/free-baby-name-by-nakshatra) par milta hai, aur nakshatra [Nakshatra Calculator](/calculators/free-nakshatra-calculator) par — dono free.',
    ],
  },
  {
    id: 'mulank-bhagyank-mel',
    h2: 'Mulank aur bhagyank alag hain — kya ye samasya hai',
    paras: [
      'Ye bahut poochha jaata hai aur uttar raahat dene wala hai: **nahi, ye samasya nahi hai — ye aam hai.**',
      'Ganit dekhiye. Mulank 9 mein se ek hai aur bhagyank bhi 9 mein se ek. Dono ka barabar aana **nau mein ek baar** hi hoga. Yaani lagbhag 89% logon ke dono alag hain.',
      'Arth ye lagaya jaata hai: **jab dono ek hon to swabhav aur disha ek hi taraf khinchte hain** — raah saaf lagti hai. **Jab alag hon to beech mein ek khinchav rehta hai** — jo aapko sahaj lagta hai aur jis taraf jeevan le jaata hai, wo alag hote hain. Bahut se log isi khinchav ko apni sabse badi seekh batate hain.',
      'Isliye alag hone ko kami maanne ki zaroorat nahi. Aur agar koi ise "dosh" keh kar upay beche, to wo galat bech raha hai.',
    ],
  },
  {
    id: 'sankhya-11-22',
    h2: 'Master numbers 11 aur 22 — Bharatiya paddhati mein kya sthiti hai',
    paras: [
      'Paashchatya numerology mein 11, 22 aur kabhi 33 ko **master numbers** kaha jaata hai aur unhe ek ank tak nahi ghataya jaata.',
      '**Bharatiya paramapara mein ye niyam nahi hai.** Yahan sab kuch 1 se 9 tak ghataya jaata hai — 29 ka mulank 11 nahi, 2 hai. Isi liye is page par bhi wahi kiya jaata hai.',
      'Iska matlab ye nahi ki paashchatya paddhati galat hai — wo alag paddhati hai apne apne niyamon ke saath. Par **do paddhatiyon ko mila kar padhna** galat nishkarsh deta hai, aur yahi aksar hota hai jab log alag-alag site ke result jodne lagte hain. Ek paddhati chuniye aur usi par rahiye.',
    ],
  },
  {
    id: 'do-site-alag',
    h2: 'Alag-alag jagah alag naamank — teen wajah',
    paras: [
      'Ye shikayat aam hai. Wajah teen hain aur unhe isi kram mein jaanchiye.',
      '**Ek — naamank ki paddhati.** Chaldean aur Pythagorean alag ank dete hain. Ye sabse aam wajah hai, aur koi galti nahi.',
      '**Do — kaunsa naam liya gaya.** Pukaarne wala naam, kaagaz wala poora naam, ya surname ke saath — teeno alag naamank denge.',
      '**Teen — master numbers.** Agar ek site 11 ko 2 mein ghata rahi hai aur doosri nahi, to aankda alag aayega.',
      'Par ek cheez pukki hai: **mulank aur bhagyank har jagah ek hi aane chahiye**, kyunki unme koi paddhati ka chunav nahi hai — sirf jodna hai. Agar wo alag mil rahe hain to kahin sach mein galti hai, aur wo prayah janm tithi galat daalne se hoti hai.',
    ],
  },
  {
    id: 'kya-nahi-bata-sakta',
    h2: 'Ye calculator kya nahi bata sakta',
    paras: [
      'Ye seema is page ke apne vyapaar ke khilaf jaati hai, par likhni chahiye.',
      'Ye **nahi** bata sakta: koi ghatna kab hogi, kaunsa nirnay sahi hai, kaunsa vyakti aapke liye theek hai, ya aapka bhavishya kaisa rahega. Numerology mein samay ki koi ganana hai hi nahi — na dasha, na gochar. Sirf sthir ank hain.',
      'Jo ye bata sakta hai: **aapke teen ank kya hain, unse jude paramparik swabhav-sanket kya hain, aur unke anukool rang aur din kya maane jaate hain.** Bas itna.',
      'Agar aapka prashn **samay** ka hai — kab hoga, kitne din mein — to uske liye jyotish ki dasha paddhati hai, aur wo alag cheez hai. [Dasha Calculator](/calculators/free-dasha-calculator) us prashn ke liye free hai.',
    ],
  },
  {
    id: 'jyotish-se-tulna',
    h2: 'Numerology aur jyotish — kaunsa kab dekhein',
    paras: [
      'Dono is site par hain, isliye antar saaf kar dena upyogi hai — aur ye antar aapka samay bachata hai.',
      '**Numerology dekhiye** jab prashn saral aur symbolic ho: mera ank kya hai, kaunsa rang anukool maana jaata hai, naam ka ank kya banta hai. Ye halki, dilchasp aur turant milne wali jaankari hai.',
      '**Jyotish dekhiye** jab prashn sach mein mayne rakhta ho: shaadi kab hogi, career kis taraf jaana chahiye, ye daur bhaari kyun lag raha hai, kaunsa graha kamzor hai. In prashnon ka uttar khagolik ganana se aata hai — janm tithi ke ank jodne se nahi.',
      'Shuruat ke liye [Kundali Calculator](/calculators/free-kundali-calculator) free hai, aur apni Chandra rashi ke liye [Rashi Calculator](/calculators/free-rashi-calculator). Dono is page se zyada gehra uttar dete hain.',
    ],
  },
  {
    id: 'kitna-bharosa',
    h2: 'Numerology par kitna bharosa karein',
    paras: [
      'Is prashn ka uttar seedha hona chahiye, chahe wo page ke haq mein na jaaye.',
      '**Numerology ek paramparik symbolic vidya hai.** Uske peeche na khagolik ganana hai, na koi jaanchi hui buniyad. Uske swabhav-sanket vyapak hain — itne vyapak ki adhikansh log unme apne aap ko dekh lete hain. Ye us vidya ki khoobi bhi hai aur uski seema bhi.',
      'Iska matlab ye nahi ki ise chhod dena chahiye. Bahut logon ke liye apna ank jaanna ek achha shuruaati bindu hota hai — apne baare mein sochne ka ek tarika. **Usi roop mein ise lijiye.**',
      'Jo nahi karna chahiye: **numerology ke aadhaar par bade faisle lena** — naukri, shaadi, ghar, ya paisa. Aur is naam par kisi ko paisa dena to bilkul nahi. Ye page free hai aur free hi rahega, isi liye.',
    ],
  },
  {
    id: 'kya-free-hai',
    h2: 'Yahan free kya milta hai, aur kya nahi bikta',
    paras: [
      'Poora page free hai. Free mein milta hai: **mulank**, **bhagyank**, **naamank**, teeno ka **graha**, anukool **rang** aur **din**, aur har ank ke paramparik swabhav-sanket.',
      'Koi signup nahi, koi card nahi, koi hissa chhupa kar nahi rakha jaata, aur koi "premium report" ka darwaza nahi.',
      'Aur ek baat jo is page par jaanbujh kar **nahi** hai: koi paid numerology service, koi naam-sudhaar ki peshkash, koi lucky number ki bikri. Kyunki upar likhi wajahon se hum unhe sahi nahi maante.',
    ],
  },
  {
    id: 'numerology-chart',
    h2: 'Numerology chart by date of birth — poora chart kya hota hai',
    paras: [
      'Log "numerology chart" dhoondhte hain aur prayah unhe sirf ek ank milta hai. Poora chart isse zyada hai.',
      'Ek poore chart mein aate hain: **mulank** (tareekh se), **bhagyank** (poori tithi se), **naamank** (naam se), aur unke saath **wo saare ank jo aapki janm tithi mein maujood hain** — kyunki paramapara mein har ank ki apni upasthiti maani jaati hai.',
      'Chaar sankhyaayein aur unka aapsi rishta hi asli chart hai, ek ank nahi. Isi liye ye page teeno alag dikhata hai aur unka mel bhi — taaki aap dekh sakein kahan sahmati hai aur kahan khinchav.',
    ],
  },
  {
    id: 'lo-shu-grid',
    h2: 'Lo Shu grid — janm tithi ka naksha',
    paras: [
      'Ye numerology ka wo hissa hai jo dikhne mein sabse dilchasp hai aur samajhne mein sabse saral.',
      'Tarika: teen-teen ka ek **grid** banaya jaata hai jisme 1 se 9 tak ke ank apni tay jagah par baithe hote hain. Phir aapki poori janm tithi ke jitne ank hain, unhe apni-apni jagah par likh diya jaata hai. Jaise 15-08-1990 mein 1 do baar, 9 do baar, 5, 8 aur 0 — 0 grid mein nahi aata.',
      'Padha kya jaata hai: **kaunse ank bar-bar aaye** (unhe prabal maana jaata hai) aur **kaunse bilkul nahi aaye** (unhe "missing" kaha jaata hai). Ye ek naksha hai, koi bhavishyavani nahi — aur isi roop mein ise lena chahiye.',
    ],
  },
  {
    id: 'missing-numbers',
    h2: 'Missing numbers — jo ank aapki tithi mein hain hi nahi',
    paras: [
      'Ye sawaal bahut aata hai aur uske naam par dar bhi becha jaata hai, isliye seedha uttar zaroori hai.',
      'Adhikansh janm tithiyon mein **char se paanch ank maujood hote hain aur baaki nahi.** Ye ganit hai — aath ankon ki tithi mein nau alag ank aa hi nahi sakte. Yaani **missing numbers hona bilkul saamanya hai**, kisi kami ka sanket nahi.',
      'Paramapara mein missing ank ko us kshetra mein abhyaas ki zaroorat se joda jaata hai — jaise 4 na ho to vyavastha par kaam karna. Ye ek soch ka tarika ho sakta hai.',
      'Jo saaf hona chahiye: **missing number ke liye koi upay, ratna ya paid remedy nahi khareedni chahiye.** Ye ek ank ka na hona hai, koi dosh nahi. Is naam par bikne wali har cheez se door rehna behtar hai.',
    ],
  },
  {
    id: 'repeating-numbers',
    h2: 'Bar-bar aane wale ank — kya matlab lagaya jaata hai',
    paras: [
      'Missing ka ulta bhi dekha jaata hai — jo ank aapki janm tithi mein **do ya teen baar** aaye.',
      'Paramapara mein use us ank ka gun **prabal** hone se joda jaata hai. Jaise 1 do baar aaye to netritva aur apni raah chalne ka jhukav zyada, 8 do baar aaye to mehnat aur dheeraj zyada.',
      'Aur ek soch ye bhi hai ki **bahut zyada dohraav ek taraf jhuka deta hai** — teen baar aaya ank us gun ko itna badha deta hai ki wo kamzori ban jaata hai. Jaise teen baar 5 — chapalta itni ki kahin tikna mushkil.',
      'Yaad rahiye ye vyakhya hai, maap nahi. **Do logon ki janm tithi mein ek jaise dohraav ho sakte hain aur swabhav bilkul alag.**',
    ],
  },
  {
    id: 'samay-mayne',
    h2: 'Numerology mein janm ka samay kyun nahi maanga jaata',
    paras: [
      'Ye antar jyotish se aane wale logon ko chaunkata hai, isliye saaf kar dena chahiye.',
      '**Numerology mein samay ka koi sthaan nahi hai.** Ganana janm tithi ke ankon par hoti hai — tareekh, mahina, saal. Ghanta aur minute kahin nahi aate. Isi liye ye page samay nahi maangta.',
      '**Jyotish mein samay sabse zaroori cheez hai**, kyunki lagna har do ghante badalta hai aur uske saath poora chart. Yahi dono vidyaon ka sabse bada dhanchagat antar hai.',
      'Iska ek vyavharik natija bhi hai: **ek hi din paida hue do logon ka mulank aur bhagyank bilkul ek hoga**, par unki kundali alag hogi. Yahi batata hai ki ye do alag paimane hain — aur gehri jaankari kis taraf hai.',
    ],
  },
  {
    id: 'mitra-shatru-ank',
    h2: 'Mitra aur shatru ank — kaunsa ank kis se milta hai',
    paras: [
      'Ye jodi ankon ke grahon se aati hai, ankon se nahi — aur yahi samajh lena isse arth deta hai.',
      'Kyunki har ank ek graha se juda hai, ankon ki mitrata bhi **grahon ki mitrata** se nikalti hai. Surya (1) aur Guru (3) mitra hain, isliye 1 aur 3 anukool maane jaate hain. Shani (8) aur Surya (1) shastra mein shatru hain, isliye 8 aur 1 ka mel jatil maana jaata hai.',
      'Iska upyog: anukool ank wale din, tareekhein aur log sahaj lagte hain — aisa maana jaata hai.',
      'Aur iski seema: **ye grahon ki shastriya mitrata hai, jo aapki kundali mein us graha ke asli bal se alag baat hai.** Shani aapke chart mein bahut balwan ho sakta hai chahe aapka mulank 1 ho. Asli bal dekhna ho to [Graha Bal Calculator](/calculators/free-graha-bal-calculator) free hai.',
    ],
  },
  {
    id: 'vivah-milan',
    h2: 'Mulank se jodi milana — kitna maanein',
    paras: [
      'Ye prashn gambhir hai kyunki log iske aadhaar par bade faisle lete hain, isliye uttar bhi gambhir hona chahiye.',
      'Paramapara mein do logon ke mulank aur bhagyank ka mel dekha jaata hai — anukool, tatasth ya virodhi. Ye ek saral chitra deta hai.',
      '**Par vivah ke prashn ka ye uttar nahi hai.** Jyotish mein iske liye poori paddhati hai — Ashtakoot Milan, jisme aath koot aur 36 gun dekhe jaate hain, aur wo nakshatra tatha grahon ki asli sthiti par tikti hai. Do ankon ka mel uske saamne bahut halka hai.',
      'Aur wo baat jo dono paddhatiyon par lagu hai: **koi bhi milan vivah ka faisla nahi hai.** Bahut se "anukool" jodde nahi chalte aur bahut se "virodhi" achhe chalte hain. Vivah se jude asli prashnon ke liye [Shadi Kab Hogi Calculator](/calculators/free-shadi-kab-hogi-calculator) aur [Manglik Dosh Calculator](/calculators/free-manglik-dosh-calculator) hain.',
    ],
  },
  {
    id: 'personal-year',
    h2: 'Personal year number — saal ka ank',
    paras: [
      'Numerology mein samay ka ek hi tarika hai, aur wo yahi hai — halka par jaan lene layak.',
      'Tarika: **apni janm tareekh + janm mahina + chalta hua saal** jodiye aur ek ank tak laaiye. Jaise 15 August aur saal 2026 — 1+5+8+2+0+2+6 = 24, phir 2+4 = **6**. To wo aapka personal year 6 hua.',
      'Har ank ke saath us saal ka ek swabhav joda jaata hai — 1 ko shuruat ka saal, 4 ko mehnat ka, 9 ko poora hone ka. Ek chakra nau saal ka hota hai.',
      'Seema saaf: **ye jyotish ki dasha nahi hai.** Dasha aapke janm nakshatra se nikalti hai, har vyakti ki alag hoti hai aur saalon-saal chalti hai. Personal year sirf ek jod hai, aur ek hi din paida hue sab logon ka ek hi hoga. Asli samay ke liye [Dasha Calculator](/calculators/free-dasha-calculator).',
    ],
  },
  {
    id: 'mulank-career',
    h2: 'Mulank aur career — kitna vazan dena chahiye',
    paras: [
      'Internet par "aapke mulank ke liye best career" jaisi soochiyaan bhari padi hain. Unka aadhaar kamzor hai aur wajah samajh leni chahiye.',
      'Paramapara jo kehti hai: mulank ka graha aapke jhukav mein dikhta hai — 5 (Budh) sanvaad aur vyapaar ki taraf, 8 (Shani) lambe anushasit kaam ki taraf, 3 (Guru) shiksha aur salah ki taraf. Ek mota sanket, aur bas.',
      'Jo saaf hona chahiye: **duniya ke har nauve vyakti ka mulank aapka hi hai.** Agar mulank se career tay hota to karodon log ek hi kaam kar rahe hote. Career ka asli vishleshan **dasham bhaav, uska swami, Dasamsa (D-10) aur chal rahi dasha** se hota hai — aur wo har vyakti ka alag hai. Uske liye [Career Prediction Astrology](/learn/career-prediction-astrology) aur [Best career from your birth chart](/learn/best-career-birth-chart) hain.',
    ],
  },
  {
    id: 'mulank-sehat',
    h2: 'Mulank aur sehat — yahan seema sabse sakht',
    paras: [
      'Kuch jagah mulank ko shareer ke angon se joda jaata hai, isliye is par saaf hona zaroori hai.',
      'Paramapara mein ye jodi mulank ke **graha** se aati hai — 1 (Surya) ko hriday aur aankh, 2 (Chandra) ko mann aur tarl, 8 (Shani) ko haddi aur naadi. Ye ankon ka nahi, grahon ka classical kaarakattva hai jo yahan udhaar liya gaya hai.',
      '**Aur ise swasthya ke faisle mein bilkul istemaal nahi karna chahiye.** Numerology ke paas na koi khagolik naap hai, na koi chikitsiya aadhaar. Kisi ank ke aadhaar par jaanch taalna, dawa band karna ya kisi lakshan ko "ank ka phal" maan lena nuksan ka rasta hai.',
      'Seedhi baat: **sehat ke prashn doctor ke paas jaate hain.** Ye page us kaam ke liye nahi hai, aur koi bhi jyotishiya ya ank-shastriya salah chikitsiya salah ka vikalp nahi hai.',
    ],
  },
  {
    id: 'cheiro-itihas',
    h2: 'Cheiro aur Bharatiya numerology — ye paddhati aayi kahan se',
    paras: [
      'Is vidya ka itihas jaanna uski seema samajhne mein madad karta hai.',
      'Aaj Bharat mein jo numerology chalti hai, uska bada hissa **Cheiro** (Count Louis Hamon, 19vi–20vi sadi) ki likhi paddhati se aata hai — jisme Chaldean akshar-ank aur ank-graha ki jodi dono hain. Cheiro ne Bharat ki yatra ki thi aur unki kitabein yahan bahut padhi gayin.',
      'Uske saath Bharat ki apni **ank-vidya** ki paramapara bhi hai, jo Vastu aur kuch tantrik granthon mein milti hai. Aaj jo prachalit hai wo prayah dono ka mel hai.',
      'Jo saaf kah dena chahiye: **ye Vedanga Jyotish ka hissa nahi hai.** Brihat Parashara Hora Shastra jaise granthon mein mulank-bhagyank ki koi ganana nahi hai. Isliye ise "Vedic numerology" kehna prachalit to hai, par sateek nahi.',
    ],
  },
  {
    id: 'best-numerology-calculator',
    h2: 'Best numerology calculator kaunsa hai — imandar tulna',
    paras: [
      'Ye keyword bar-bar dhoondha jaata hai, isliye seedha uttar dena theek hai — aur usme wo bhi jo hamare paksh mein nahi jaata.',
      '**Mulank aur bhagyank har jagah ek hi aane chahiye.** Usme koi kaushal nahi hai — sirf ankon ka jod hai, aur har calculator wahi karega. Isliye is hisse mein "best" jaisa kuch hota hi nahi.',
      '**Naamank mein antar aayega**, kyunki paddhati alag ho sakti hai (Chaldean ya Pythagorean) aur naam ka roop alag liya ja sakta hai. Yahan bhi koi galat nahi — bas alag maanak.',
      'To antar kahan hai? **Prastuti aur imandari mein.** Adhikansh site ank de kar aage paid report, naam-sudhaar ya lucky number bechne lagti hain. Yahan wo nahi hai — aur upar wale sections mein saaf likha hai ki hum unhe kyun sahi nahi maante. Yahi ek daawa hai; baaki tulna aap khud kar lijiye.',
    ],
  },
  {
    id: 'business-naam',
    h2: 'Business ka naam ank se rakhna — kya salah hai',
    paras: [
      'Ye prashn vyaparik logon se aata hai aur uske naam par consultancy fees li jaati hai, isliye saaf hona zaroori hai.',
      'Paramapara mein kaha jaata hai ki business ka naamank maalik ke mulank se mel khaana chahiye, aur kuch ank vyapaar ke liye anukool maane jaate hain.',
      'Imandar sthiti: **iska koi shastriya aadhaar nahi hai aur na koi jaanchi hui buniyad.** Business chalta hai product, keemat, sewa aur mehnat se. Naam ka ank us list mein kahin nahi aata.',
      'Isliye salah: **naam aisa rakhiye jo yaad rahe, bolne mein aasan ho aur aapke kaam se mel khaaye.** Agar uske baad ank bhi mel kha jaaye to achha lage — par uske liye alag se paisa dena zaroori nahi hai, aur ye page wo sewa nahi bechta.',
    ],
  },
  {
    id: 'kis-liye-nahi',
    h2: 'Ye page kis liye nahi hai',
    paras: [
      'Ye likh dena zaroori hai taaki koi galat umeed le kar na jaaye.',
      'Ye page **nahi** batata: kab kya hoga, kaunsa nirnay sahi hai, kaunsa vyakti aapke liye theek hai, sehat kaisi rahegi, ya paisa kab aayega. Numerology mein samay ki ganana hai hi nahi — na dasha, na gochar. Sirf sthir ank hain.',
      'Aur ye page **nahi bechta**: naam badalne ki sewa, lucky mobile ya gaadi number, missing number ka upay, ya koi paid numerology report. Teeno is vidya ke naam par sabse zyada beche jaate hain aur teeno ke peeche koi thos aadhaar nahi hai.',
      'Jo ye deta hai: **teen ank, unke paramparik arth, aur ek imandar tasveer ki wo kitne bharose ke hain.** Agar aapko isse gehra uttar chahiye to wo jyotish ki taraf hai — aur wo bhi is site par free hai.',
    ],
  },
  {
    id: 'aage-kya',
    h2: 'Ankon ke baad — kahan jaayein',
    paras: [
      'Agar aapko **shubh din** ke prashn mein ruchi hai to [Lucky Day Calculator](/calculators/free-lucky-day-calculator) uske liye alag bana hai aur free hai.',
      'Agar aap **jyotish** ki taraf jaana chahte hain — jo isse gehra uttar deta hai — to [Kundali Calculator](/calculators/free-kundali-calculator) se shuru kijiye, apni Chandra rashi [Rashi Calculator](/calculators/free-rashi-calculator) se dekhiye, aur nakshatra [Nakshatra Calculator](/calculators/free-nakshatra-calculator) se.',
      'Aur agar prashn kisi khaas kshetra ka hai — kaunsa graha kamzor hai [Weak Planet Finder](/calculators/free-weak-planet-finder), kundali kitni mazboot hai [Kundali Strength Calculator](/calculators/free-kundali-strength-calculator), ya kaunsi dasha chal rahi hai [Dasha Calculator](/calculators/free-dasha-calculator) — sab free hain. Sidhant ke liye [Planets in Astrology](/learn/planets-in-astrology).',
    ],
  },
];

type NmLink = { href: string; label: string; note: string };

const HUB_CALC: NmLink[] = [
  { href: '/calculators/free-lucky-day-calculator', label: 'Lucky Day Calculator', note: 'Shubh din' },
  { href: '/calculators/free-rashi-calculator', label: 'Rashi Calculator', note: 'Jyotish waali rashi' },
  { href: '/calculators/free-nakshatra-calculator', label: 'Nakshatra Calculator', note: 'Nakshatra aur pada' },
  { href: '/calculators/free-baby-name-by-nakshatra', label: 'Baby Name by Nakshatra', note: 'Naam ka shubh akshar' },
  { href: '/calculators/free-kundali-calculator', label: 'Kundali Calculator', note: 'Poori kundali free' },
  { href: '/calculators/free-lagna-calculator', label: 'Lagna Calculator', note: 'Aapka lagna' },
  { href: '/calculators/free-dasha-calculator', label: 'Dasha Calculator', note: 'Samay ka prashn' },
  { href: '/calculators/free-weak-planet-finder', label: 'Weak Planet Finder', note: 'Kaunsa graha kamzor' },
  { href: '/calculators/free-kundali-strength-calculator', label: 'Kundali Strength Calculator', note: 'Poora chitra' },
];

const HUB_LEARN: NmLink[] = [
  { href: '/learn/planets-in-astrology', label: 'Planets in Astrology', note: 'Graha ka asli kaarakattva' },
  { href: '/learn/nakshatra-guide', label: 'Nakshatra Guide', note: 'Naamkaran ka asli aadhaar' },
  { href: '/learn/mahadasha-explained', label: 'Mahadasha explained', note: 'Samay jyotish se aata hai' },
  { href: '/learn/shadbala-planetary-strength-vedic-astrology', label: 'Shadbala', note: 'Graha ka maapa hua bal' },
  { href: '/learn/planetary-dignity-exaltation-debilitation', label: 'Dignity — uchch aur neech', note: 'Graha ki sthiti' },
  { href: '/learn/raj-yoga', label: 'Raj Yoga', note: 'Yog ka sidhant' },
  { href: '/learn/gemstone-astrology-vedic', label: 'Gemstone Astrology', note: 'Ratna ka aadhaar' },
  { href: '/learn/how-to-wear-gemstone-vedic', label: 'Ratna pehanne ki vidhi', note: 'Faisle ke baad' },
  { href: '/learn/child-birth-prediction', label: 'Child Birth Prediction', note: 'Bachche se jude prashn' },
];

function NmRich({ text, k }: { text: string; k: string }) {
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

function NmHub({ items }: { items: NmLink[] }) {
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

export default function FreeNumerologyCalculatorPage() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'Date of birth is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const [y, m, d] = date.split('-').map(Number);
    const mulank = calcMulank(d);
    const bhagyank = calcBhagyank(y, m, d);
    const naamank = name.trim() ? calcNaamank(name) : null;

    setResult({ mulank, bhagyank, naamank, name: name.trim() });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, [name, date]);

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0',
    colorScheme: 'dark' as const,
  });

  const mulank = result?.mulank as number | undefined;
  const bhagyank = result?.bhagyank as number | undefined;
  const naamank = result?.naamank as number | null | undefined;
  const mInfo = mulank ? NUM_DATA[mulank] : null;
  const bInfo = bhagyank ? NUM_DATA[bhagyank] : null;
  const harmony = (mulank && bhagyank)
    ? (mulank === bhagyank
        ? { txt: 'Mulank aur Bhagyank same hain — strong, focused energy.', color: '#86EFAC' }
        : (NUM_DATA[mulank].friends.includes(bhagyank)
            ? { txt: 'Mulank aur Bhagyank friendly hain — achha tālmel aur natural flow.', color: '#86EFAC' }
            : { txt: 'Mulank aur Bhagyank thode different hain — awareness aur balance se behtar results.', color: GOLD }))
    : null;

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-numerology-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Numerology Calculator — Mulank, Bhagyank & Lucky Number',
    description:
      'Find your Mulank (root number), Bhagyank (destiny number) and Naamank from your date of birth & name, with ruling planet, lucky numbers, colors & days. Free numerology calculator by Trikaal Vaani.',
    breadcrumbName: 'Free Numerology Calculator',
    aboutEntities: ['Numerology', 'Mulank', 'Bhagyank', 'Naamank'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Numerology', 'Cheiro Numerology'],
    howToName: 'How to find your Mulank, Bhagyank and lucky number',
    howToSteps: [
      { name: 'Enter name and date of birth', text: 'Enter your full name (optional, for Naamank) and your date of birth.' },
      { name: 'Calculate the numbers', text: 'The calculator reduces your date of birth and name using classical Cheiro / Vedic numerology rules.' },
      { name: 'Get your result', text: 'See your Mulank, Bhagyank and Naamank with ruling planet, lucky numbers, colors and days.' },
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
            <span style={{ color: GOLD }}>Free Numerology Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Numerology Calculator — Mulank, Bhagyank &amp; Lucky Number
          </h1>

          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              <strong style={{ color: GOLD }}>Numerology</strong> mein aapka <strong style={{ color: GOLD }}>Mulank</strong> (birth date se) aur <strong style={{ color: GOLD }}>Bhagyank</strong> (poori DOB se) aapke swabhav aur life-path ko darshaate hain. <strong style={{ color: GOLD }}>Trikaal Vaani ka Free Numerology Calculator</strong> date of birth se Mulank, Bhagyank, ruling planet, lucky number, lucky color aur lucky day turant batata hai — naam se Naamank bhi.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Method: Cheiro / Vedic Numerology · Number-Planet System</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Calculate Your Numbers (Free)</h2>
            <div className="grid gap-5">
              <div>
                <label htmlFor="tv-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-slate-500 text-xs">(optional — for Naamank)</span></label>
                <input id="tv-name" type="text" placeholder="Enter your full name"
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(false)} />
              </div>

              <div>
                <label htmlFor="tv-dob" className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth <span className="text-yellow-400">*</span></label>
                <input id="tv-dob" type="date" value={date}
                  onChange={e => { setDate(e.target.value); setErrors({}); }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                <p className="text-slate-500 text-xs mt-1">Sirf date of birth chahiye — time/place ki zaroorat nahi.</p>
              </div>

              <button onClick={handleSubmit}
                className="w-full py-4 rounded-xl font-bold transition-all duration-300"
                style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                🔢 Calculate My Numbers
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Cheiro / Vedic Numerology</p>
            </div>
          </div>

          {/* RESULT */}
          {result && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* CORE NUMBERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mInfo && (
                  <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Mulank (Root Number)</div>
                    <div className="text-6xl font-serif font-bold mb-1" style={{ color: GOLD }}>{mulank}</div>
                    <div className="text-sm text-slate-300">Ruling Planet: <span style={{ color: GOLD }} className="font-bold">{mInfo.planet} ({mInfo.planet_hi})</span></div>
                  </div>
                )}
                {bInfo && (
                  <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: `linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(2,8,23,0.6) 100%)`, border: `1px solid rgba(96,165,250,0.35)` }}>
                    <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Bhagyank (Destiny Number)</div>
                    <div className="text-6xl font-serif font-bold mb-1" style={{ color: '#93C5FD' }}>{bhagyank}</div>
                    <div className="text-sm text-slate-300">Ruling Planet: <span style={{ color: '#93C5FD' }} className="font-bold">{bInfo.planet} ({bInfo.planet_hi})</span></div>
                  </div>
                )}
              </div>

              {/* HARMONY */}
              {harmony && (
                <div className="rounded-xl p-4 text-center text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}`, color: harmony.color }}>
                  {harmony.txt}
                </div>
              )}

              {/* NAAMANK */}
              {naamank && (
                <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <div className="text-xs uppercase tracking-widest text-slate-400 mb-1">Naamank (Name Number) — {result.name}</div>
                  <div className="text-4xl font-serif font-bold mb-1" style={{ color: GOLD }}>{naamank}</div>
                  <div className="text-sm text-slate-400">Ruling Planet: {NUM_DATA[naamank].planet} ({NUM_DATA[naamank].planet_hi}) · Chaldean method</div>
                </div>
              )}

              {/* MULANK DETAIL */}
              {mInfo && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>Mulank {mulank} — Aapke Lucky Factors</h3>
                  <p className="text-sm text-slate-300 mb-4 italic">{mInfo.traits}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <DetailCell icon="🔢" label="Lucky Numbers" value={mInfo.lucky} />
                    <DetailCell icon="🎨" label="Lucky Colors" value={mInfo.colors} />
                    <DetailCell icon="📅" label="Lucky Days" value={mInfo.days} />
                    <DetailCell icon="🤝" label="Friendly Numbers" value={mInfo.friends.join(', ')} />
                  </div>
                </div>
              )}

              {/* BHAGYANK DETAIL */}
              {bInfo && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(96,165,250,0.2)` }}>
                  <h3 className="text-xl font-serif font-bold mb-4" style={{ color: '#93C5FD' }}>Bhagyank {bhagyank} — Aapka Life-Path</h3>
                  <p className="text-sm text-slate-300 mb-4 italic">{bInfo.traits}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <DetailCell icon="🔢" label="Lucky Numbers" value={bInfo.lucky} />
                    <DetailCell icon="🎨" label="Lucky Colors" value={bInfo.colors} />
                    <DetailCell icon="📅" label="Lucky Days" value={bInfo.days} />
                    <DetailCell icon="🤝" label="Friendly Numbers" value={bInfo.friends.join(', ')} />
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl p-5 md:p-6 text-center" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <p className="text-base text-slate-200 mb-3">Apni janma-kundali ke planets se gehri jaankari chahiye?</p>
                <Link href="/calculators/free-lucky-day-calculator"
                  className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg,rgba(212,175,55,0.85) 0%,${GOLD} 100%)`, color: '#080B12' }}>
                  Lucky Day Calculator try karein →
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
                    <NmRich text={p} k={`s${si}-p${pi}`} />
                  </p>
                ))}
              </div>
            ))}
          </section>

          {/* number -> planet table — kept from v1.x, unchanged */}
          <section className="mt-4 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Number → Planet Mapping</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Number</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Planet</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Lucky Colors</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Traits</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <tr key={n} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <td className="p-3 font-semibold" style={{ color: GOLD }}>{n}</td>
                      <td className="p-3">{NUM_DATA[n].planet} ({NUM_DATA[n].planet_hi})</td>
                      <td className="p-3">{NUM_DATA[n].colors}</td>
                      <td className="p-3">{NUM_DATA[n].traits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Apne Numbers Ka Upyog Kaise Karein</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Important kaam apne lucky number, lucky day aur lucky color ke saath plan karein. Apne Mulank ke friendly numbers wale logon ke saath partnership achhi chalti hai. Naamank ko Mulank ke saath harmony mein laane ke liye kabhi-kabhi naam ki spelling adjust ki jaati hai (numerologist ki salaah se).
            </p>
            <p className="text-slate-400 leading-relaxed mb-4 text-sm">
              <strong>Note:</strong> Numerology ek paramparik symbolic vidya hai, astronomical calculation nahi. Ise guidance ki tarah lein.
            </p>
          </section>

          {/* ── v2.0: hand-off to the jyotish side of the site ── */}
          <section className="mt-12 rounded-2xl p-5 md:p-6" style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>Ank ke aage — jyotish waale calculators</h2>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
              Numerology symbolic hai. Agar prashn samay ka hai — kab hoga, kya hoga — to uska uttar jyotish ki taraf hai. Sab free.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Aur bhi free calculators</h3>
                <NmHub items={HUB_CALC} />
              </div>
              <div>
                <h3 className="mb-2 pb-1.5 text-sm font-bold border-b" style={{ color: '#e2e8f0', borderColor: 'rgba(212,175,55,0.25)' }}>Sidhant samjhiye</h3>
                <NmHub items={HUB_LEARN} />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions — Numerology</h2>
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
                { slug: 'free-lucky-day-calculator', name: 'Lucky Day Calculator' },
                { slug: 'free-kundali-strength-calculator', name: 'Kundali Strength' },
                { slug: 'free-graha-bal-calculator', name: 'Graha Bal Calculator' },
                { slug: 'free-kaal-sarp-dosh-calculator', name: 'Kaal Sarp Dosh' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati Calculator' },
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
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

function DetailCell({ icon, label, value }: { icon: string; label: string; value: any }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><span>{icon}</span><span>{label}</span></div>
      <div className="font-bold text-sm" style={{ color: GOLD }}>{value ?? '—'}</div>
    </div>
  );
}
