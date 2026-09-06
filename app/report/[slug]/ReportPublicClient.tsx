'use client'

/**
 * ============================================================
 * TRIKAAL VAANI — Public SEO Report Client
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/report/[slug]/ReportPublicClient.tsx
 * VERSION: 10.2 (29 Aug 2026) — Dasamsa (D10) card
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v10.2 (29 Aug 2026) — DASAMSA D10
 *   The report has shown the Navamsa for a while, but BPHS Ch.6 reads
 *   PROFESSION in the Dasamsa, not in the rasi chart — so every career
 *   paragraph rested on a chart that was never meant to answer that question.
 *   DasamsaCard deliberately mirrors NavamsaCard down to the star marker and
 *   the note box, so the two read as one pair rather than two designers' work.
 *   The star means vargottama in D9 and same-sign-as-D1 in D10; both say the
 *   same thing in their own varga, which is why the same mark is used.
 *   Paid tier only, like the D9 card.
 *
 * v10.1 (24 Aug 2026) — two language leaks
 *   1. The shared-lord suspense line joined house names with a hardcoded ' aur ',
 *      so the English reading said "Your 12th house aur 11th house share the
 *      SAME lord". The joiner now follows the chosen language.
 *   2. LockedSection was the last hardcoded-Hinglish block. An English reader's
 *      final pitch — the one asking for ₹51 — was written in a language they had
 *      not chosen. Title, teaser, all eight feature lines and the CTA now follow
 *      the `language` column.
 *
 * v10.0 (24 Aug 2026) — SUSPENSE, not a shorter report
 *   v9.3 gated the right sections but every remaining one was still COMPLETE and
 *   CLOSED — a full mantra, both gemstone prescriptions, two dated windows. A
 *   reader with all that has what they came for. And the locked teaser was a
 *   feature list ("Navamsa (D9)", "Shadbala score") — a spec sheet creates no
 *   pull, because a stranger cannot want what they cannot picture.
 *   v10.0 instead states something TRUE and SPECIFIC about this person's own
 *   chart and stops halfway: "Jupiter is Vargottama in your D9", "your 11th and
 *   12th share the SAME lord, and it is debilitated", "Bhrigu found 2 signals,
 *   1 active now". Every fact comes from the engine — nothing is invented, only
 *   the consequence is withheld. Free sections now END on an open question
 *   (Cliff) rather than a full stop: one action window instead of two, the
 *   mantra alone instead of three complete upay.
 *
 *   DAKSHINA LADDER REMOVED ENTIRELY. The dakshina table held two rows since
 *   launch, both from July — it earned effectively nothing while ₹101 →
 *   ₹1,08,000 sat under the ₹51 CTA competing with it, and on a free page asked
 *   for money before the reader had reason to trust anything. Deleted rather
 *   than hidden. Razorpay still powers the ₹51 unlock.
 *
 * v9.3 (24 Aug 2026) — PAYWALL, which v9.0-9.2 quietly removed
 *   Those versions added the evidence table, D9, gochar timeline, Bhrigu signals,
 *   monthly outlook and remedy levels — and gated NONE of them. A free reader was
 *   getting all nine Shadbala scores, the full D9 chart, six months of forecast
 *   and every remedy level, while the ₹51 box on the same page promised exactly
 *   those items. There was no reason left to pay.
 *   Free now keeps what proves the chart is genuinely theirs: the D1 chart, the
 *   planet table (no Shadbala figures), two evidence rows, the past three months,
 *   the verdict card, confidence, and remedy levels 1-2 — the two that cost
 *   nothing to act on. Everything below stays paid, and LockedTeaser names it
 *   honestly instead of promising what the reader has already seen.
 *
 * v9.2 (23 Aug 2026) — the last of the hardcoded headings
 *   v9.0 and v9.1 translated the NEW sections but left every pre-existing one in
 *   Hinglish, so a Hindi report still mixed registers: Devanagari prose under
 *   "KYA KAREIN", "Graha Vishleshan", "Dasha Ka Arth", "Action Windows". All of
 *   them now follow the `language` column.
 *
 * v9.1 (23 Aug 2026) — the half I shipped out of order
 *   v9.0 of this file was written BEFORE route v15.0 existed, so the two fields
 *   that version generates had nowhere to render: seven months of real Hindi
 *   monthlyOutlook and a Hindi navamsaNote sat unused in the DB. Both now render.
 *   Language wiring is also finished — v9.0 translated the section headings but
 *   left the evidence-table internals ("Swami X — 10th bhav mein", "Is bhav mein
 *   koi graha nahi") and the remedy level names in Hinglish/English, so a Hindi
 *   report still mixed three registers on one page.
 *
 * v9.0 (23 Aug 2026) — CONSOLIDATED. Everything pending for this file, once:
 *   #3 VerdictCard   : the answer FIRST. The page opened with engine badges and
 *                      credentials while the client's real question was answered
 *                      two screens down — machinery explained before value proven.
 *   #1 GocharTimeline: 3 months back + 6 forward from real sidereal transits,
 *                      with the running Vimshottari period per month, plus best
 *                      and caution month. Slow nodes shown as background rather
 *                      than marking all nine months identically.
 *   #2 NavamsaCard   : D9 divisional chart with dignity and Vargottama marks.
 *   #6 RemedyLevels  : four ordered levels — Practical, Behavioural, Spiritual,
 *                      Seva. Five flat spiritual upay made "chant 108x" read as
 *                      the answer to debt; classically remedies support effort.
 *   #4 Panchang      : restored, now computed from today's real Sun/Moon
 *                      longitudes. Gated on _source === 'swiss-ephemeris', so the
 *                      old day-of-year fabrication can never render again.
 *   #9 Language      : section headings follow the `language` column
 *                      (hinglish / hindi / english). A Hindi reader was getting
 *                      Devanagari prose under Hinglish headings.
 *
 * CHANGES v8.2 -> v8.3 (CEO approved):
 *   ✅ FIX-1 (BUG): UpayCards upsell "Get Full Reading — ₹51" linked
 *      to "/" (homepage) — user had to refill the ENTIRE birth form
 *      to pay. Now links to /upgrade?slug={slug}&tier=basic (same as
 *      LockedSection). UpayCards now receives slug prop.
 *   ✅ FIX-2: STICKY UPGRADE BAR (free tier only) — slim fixed bottom
 *      bar with "🔓 Full Reading ₹51" CTA → /upgrade. The LockedSection
 *      sits below chart/table/dasha/upay/panchang; many free users
 *      never scrolled that far. Now the unlock CTA is always visible.
 *      className="no-print" → hidden in PDF. Extra bottom padding
 *      added for free tier so the bar never covers content.
 *   ✅ FIX-3: LockedSection PERSONALIZED — generic teaser replaced
 *      with the user's own {mahadasha} Mahadasha + {domainLabel}
 *      ("Aapki Shani Mahadasha mein Trikaal ne kuch aur dekha hai...").
 *      Personal curiosity converts; generic blur does not.
 *   ✅ ALL v8.2 functionality preserved 100% (Razorpay dakshina,
 *      5 upay, kundali chart, planet table, dasha, action windows,
 *      panchang, PDF, share, schemas untouched server-side).
 *
 * v8.4 (23 Aug 2026) — THE REPORT FINALLY SHOWS ITS EVIDENCE
 *   The engines were computing house lords, Shadbala ratios, Parashari yogas,
 *   Bhrigu themes and dasha activation links; the report displayed none of it,
 *   so a paying client saw conclusions with no visible chart reasoning. Adds:
 *     - WhyYouAreHere  : recognition hook built on REAL Antardasha/Pratyantar dates
 *     - EvidenceTable  : "why this prediction" — house, sign, lord, where the lord
 *                        sits, occupants, Shadbala, plus the reading's meaning line
 *     - EngineSignals  : Parashari yogas + Bhrigu Nandi (the page-1 badge has
 *                        claimed Bhrigu since launch while showing none of it)
 *     - ConfidenceCard : separate confidence per horizon, honestly
 *     - Shadbala numbers in the planet table; Rahu/Ketu show "—", not a fake dot
 *     - Sookshma (L4) row REMOVED — never computed, was hardcoded "Venus"
 *   PDF needs no separate work: PDFBtn() is window.print(), so the PDF is this
 *   same page. Site and PDF are one file.
 *
 * v8.4.1 (23 Aug 2026) — HOTFIX
 *   v8.4 shipped with yogas typed as string[]. astro.py actually returns
 *   {name, present, description} objects, so React threw "Objects are not valid
 *   as a React child" and every report page returned __next_error__. Both yoga
 *   sources now pass through yogaName(); present:false yogas are dropped.
 *
 * v8.4.2 (23 Aug 2026) — FIRST PAID REPORT AUDIT
 *   - geoBullets can arrive as [{item:"..."}]. The string-only filter dropped all
 *     ten and the page rendered two generic fallback lines instead ("2 INSIGHTS"
 *     on a paid report) while ten real Hindi bullets sat in the DB. bulletText()
 *     now unwraps both shapes.
 *   - Bhrigu: the live /synthesize returns enriched.bhrigu.signals[], not
 *     bhrigu_points/current_life_theme. Signals are now unwrapped and rendered,
 *     so the Bhrigu Nandi badge on page 1 is finally backed by visible output.
 *
 * v8.5 (23 Aug 2026) — PANCHANG REMOVED
 *   The "Aaj Ka Panchang" card was populated by panchang_today(), which computes
 *   tithi and nakshatra as TITHIS[(d*13)%15] from the day of the year — pure
 *   arithmetic, no ephemeris. Every reading showed invented panchang values. The
 *   card and the paid feature-list promise are both removed until the section is
 *   wired to the real panchang engine or the Supabase panchang_daily table.
 *
 * CHANGES v8.1 -> v8.2 (retained): brand flip Trikaal, Delhi NCR
 *   removed, persona names flipped. Domain/links/logic untouched.
 * ============================================================
 */

import Link from 'next/link'
import SiteNav    from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowLeft, Lock, Download, Sparkles } from 'lucide-react'

const GOLD    = '#D4AF37'
const RAZORPAY_BLUE = '#3395FF'
const G       = (a: number) => `rgba(212,175,55,${a})`
const BG_DARK = '#080B12'
const BG_CARD = 'rgba(6,10,22,0.95)'

const PLANET_GLYPH: Record<string,string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿',
  Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
}
const PLANET_HI: Record<string,string> = {
  Sun:'सूर्य', Moon:'चंद्र', Mars:'मंगल', Mercury:'बुध',
  Jupiter:'गुरु', Venus:'शुक्र', Saturn:'शनि', Rahu:'राहु', Ketu:'केतु',
}
const RASHI_LIST = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena',
]

interface SeoMeta { title:string; description:string; canonical:string }
interface ReportPublicClientProps {
  report: Record<string,unknown>
  slug:   string
  meta:   SeoMeta
}
interface PlanetRow {
  planet:string; planet_hi:string; rashi:string; house:number
  degree:number; nakshatra:string; retrograde:boolean
  dignity:string; shadbala:number; strength:string; domain_note:string
}
interface ActionWindow { window:string; strength:string; reason:string; days?:number; level?:string; lord?:string; active_now?:boolean }

// v8.4: engine-computed evidence. template_engine v2.2 produces all of this and
// predict route v14.17 finally forwards it; until now the report displayed none
// of it, so a paying client saw conclusions with no visible chart reasoning.
interface EvidenceHouse {
  factor:string; house_number?:number; sign?:string; lord?:string
  lord_house?:number; lord_rashi?:string; lord_dignity?:string
  lord_shadbala?:number|null; occupants?:string[]
}
interface ChartEvidence {
  lagna?:string; lagna_lord?:string
  houses?:EvidenceHouse[]
  key_planets?:{planet:string;rashi:string;house:number;nakshatra:string;dignity:string;shadbala:number|null;strength:string|null;retrograde:boolean}[]
  activation?:{ mahadasha?:{lord?:string;start?:string;end?:string}; antardasha?:{lord?:string;start?:string;end?:string}; pratyantar?:{lord?:string;start?:string;end?:string}; domain_links?:{planet:string;house:string}[]; linked?:boolean }|null
  yogas?:unknown[]     // string | {name, present, description} — see yogaName()
}
interface WhyHere { text?:string; possibleManifestations?:string[]; recognitionLine?:string }
interface ReadingConfidence { recentPast?:string; next3Months?:string; months4to6?:string; basis?:string }

interface UpayItem {
  upay_number: number
  type: 'mantra'|'gemstone'|'vrat'|'dana'|'special'
  planet?: string; mantra?: string; count?: string; time?: string; day?: string
  focus?: string; special?: string
  lagna_stone?: { stone:string; metal:string; finger:string; day:string; for:string; note:string }
  dasha_stone?: { stone:string; substitute:string; metal:string; finger:string; day:string; for:string; note:string }
  name?: string; deity?: string; prasad?: string; yantra?: string; yantra_placement?: string
  items?: string; recipient?: string; note?: string
  text?: string; domain?: string; timing?: string; blessing?: string
}

interface RemedyItem {
  planet:string; mantra:string; count:string
  dana:string; vrat:string; priority?:string
}

// ── v9.0 LANGUAGE-AWARE LABELS ───────────────────────────────────────────────
// Every section heading was hardcoded Hinglish. A Hindi reader received pages of
// Devanagari prose under headings like "AAP YAHAN KYUN HAIN", and an English
// reader got Hinglish headings over English text. The `language` column already
// records the choice (hinglish / hindi / english) — it was simply never used.
type Lang = 'hinglish'|'hindi'|'english'
const L: Record<string, Record<Lang,string>> = {
  verdict:      {hinglish:'🎯 60 Second Mein Aapka Jawab', hindi:'🎯 ६० सेकंड में आपका उत्तर',        english:'🎯 Your Answer in 60 Seconds'},
  whyHere:      {hinglish:'🔍 Aap Yahan Kyun Hain',        hindi:'🔍 आप यहाँ क्यों हैं',                english:'🔍 Why You Are Here'},
  whyManif:     {hinglish:'Yeh phase in tareeko se dikh sakta tha', hindi:'यह चरण इन रूपों में दिख सकता था', english:'This phase could have shown up as'},
  evidence:     {hinglish:'🔎 Yeh Prediction Kyun — Aapki Kundali Se', hindi:'🔎 यह भविष्यवाणी क्यों — आपकी कुंडली से', english:'🔎 Why This Prediction — From Your Chart'},
  evidenceSub:  {hinglish:'har row aapke chart se nikli hai, koi general baat nahi', hindi:'हर पंक्ति आपकी कुंडली से निकली है, कोई सामान्य बात नहीं', english:'every row is derived from your own chart, nothing generic'},
  lord:         {hinglish:'Swami',      hindi:'स्वामी',        english:'Lord'},
  inHouse:      {hinglish:'bhav mein',  hindi:'भाव में',       english:'house'},
  occupants:    {hinglish:'Is bhav mein', hindi:'इस भाव में',   english:'Occupied by'},
  noOccupants:  {hinglish:'Is bhav mein koi graha nahi', hindi:'इस भाव में कोई ग्रह नहीं', english:'No planets in this house'},
  activation:   {hinglish:'⏳ Dasha Activation', hindi:'⏳ दशा सक्रियता', english:'⏳ Dasha Activation'},
  signals:      {hinglish:'🔯 Yogas aur Bhrigu Signals', hindi:'🔯 योग और भृगु संकेत', english:'🔯 Yogas and Bhrigu Signals'},
  confidence:   {hinglish:'📊 Prediction Confidence', hindi:'📊 भविष्यवाणी की विश्वसनीयता', english:'📊 Prediction Confidence'},
  confPast:     {hinglish:'Pichhle kuch mahine', hindi:'पिछले कुछ महीने', english:'Recent past'},
  confNext3:    {hinglish:'Agle 3 mahine',       hindi:'अगले ३ महीने',    english:'Next 3 months'},
  conf46:       {hinglish:'Mahina 4-6',          hindi:'महीना ४-६',       english:'Months 4-6'},
  timeline:     {hinglish:'📆 9 Mahine Ki Timeline — Gochar', hindi:'📆 ९ महीने की समय-रेखा — गोचर', english:'📆 9-Month Timeline — Transits'},
  tlPast:       {hinglish:'Pichhle 3 mahine',    hindi:'पिछले ३ महीने',   english:'Past 3 months'},
  tlNow:        {hinglish:'Abhi',                hindi:'अभी',             english:'Now'},
  tlNext:       {hinglish:'Agle 6 mahine',       hindi:'अगले ६ महीने',    english:'Next 6 months'},
  // v-fix 06 Sep 2026: these two chips read off gocharTimeline (TRANSITS).
  // The Action Windows card lower down reads off actionWindows (PRATYANTAR
  // DASHA). They are different measurements and will often name different
  // months — which looked like the report contradicting itself. Saying which
  // system each one comes from costs two words and removes the confusion.
  bestMonth:    {hinglish:'Sabse sahaayak mahina (gochar)', hindi:'सबसे सहायक महीना (गोचर)', english:'Most supportive month (transit)'},
  cautionMonth: {hinglish:'Sabse savdhaani wala (gochar)', hindi:'सबसे सावधानी वाला (गोचर)', english:'Most cautious month (transit)'},
  background:   {hinglish:'Poore daur mein sthir', hindi:'पूरे दौर में स्थिर', english:'Constant through the window'},
  navamsa:      {hinglish:'🕉️ Navamsa (D9) — Divisional Chart', hindi:'🕉️ नवांश (D9) — वर्ग कुंडली', english:'🕉️ Navamsa (D9) — Divisional Chart'},
  navLagna:     {hinglish:'D9 Lagna',   hindi:'नवांश लग्न',    english:'D9 Lagna'},
  vargottama:   {hinglish:'Vargottama (D1 aur D9 mein ek hi rashi — vishesh bal)', hindi:'वर्गोत्तम (D1 और D9 में एक ही राशि — विशेष बल)', english:'Vargottama (same sign in D1 and D9 — special strength)'},
  remedyLevels: {hinglish:'🪜 Upay Ka Kram — Pehle Vyavaharik',  hindi:'🪜 उपाय का क्रम — पहले व्यावहारिक', english:'🪜 Remedy Order — Practical First'},
  panchang:     {hinglish:'📅 Aaj Ka Panchang', hindi:'📅 आज का पंचांग',  english:'📅 Today\'s Panchang'},
  tithi:        {hinglish:'Tithi', hindi:'तिथि', english:'Tithi'},
  vara:         {hinglish:'Vara',  hindi:'वार',  english:'Weekday'},
  nak:          {hinglish:'Nakshatra', hindi:'नक्षत्र', english:'Nakshatra'},
  yoga:         {hinglish:'Yoga',  hindi:'योग',  english:'Yoga'},
  monthly:      {hinglish:'🗓 Mahine-Dar-Mahine Outlook', hindi:'🗓 महीने-दर-महीने आउटलुक', english:'🗓 Month-by-Month Outlook'},
  mTheme:       {hinglish:'Theme',  hindi:'भाव',    english:'Theme'},
  mMoney:       {hinglish:'Paisa',  hindi:'धन',     english:'Money'},
  mAction:      {hinglish:'Karein', hindi:'करें',   english:'Do'},
  mAvoid:       {hinglish:'Bachein',hindi:'बचें',   english:'Avoid'},
  navNote:      {hinglish:'D9 Ka Matlab', hindi:'नवांश का अर्थ', english:'What D9 Adds'},
  dasamsa:      {hinglish:'💼 Dasamsa (D10) — Karma Kundali', hindi:'💼 दशांश (D10) — कर्म कुंडली', english:'💼 Dasamsa (D10) — Career Chart'},
  dasLagna:     {hinglish:'D10 Lagna', hindi:'दशांश लग्न', english:'D10 Lagna'},
  dasTenth:     {hinglish:'D10 Ka 10th Bhav', hindi:'दशांश का दशम भाव', english:'D10 10th House'},
  dasConfirmed: {hinglish:'D1 aur D10 dono mein same rashi — karma mein pushti', hindi:'D1 और D10 दोनों में एक ही राशि — कर्म में पुष्टि', english:'Same sign in D1 and D10 — confirmed in career'},
  dasNote:      {hinglish:'D10 Ka Matlab', hindi:'दशांश का अर्थ', english:'What D10 Adds'},
  // v9.2: the remaining hardcoded headings. v9.0/9.1 translated the new sections
  // but left every pre-existing one in Hinglish, so a Hindi report still carried
  // "KYA KAREIN" and "Graha Vishleshan" over Devanagari content.
  sandesh:      {hinglish:'✨ Trikaal Ka Sandesh',  hindi:'✨ त्रिकाल का संदेश',  english:'✨ Trikaal\'s Message'},
  coreMsg:      {hinglish:'🔑 Core Message',        hindi:'🔑 मुख्य संदेश',      english:'🔑 Core Message'},
  doNow:        {hinglish:'✓ ABHI KAREIN',          hindi:'✓ अभी करें',          english:'✓ DO NOW'},
  avoidNow:     {hinglish:'✗ BACHEIN',              hindi:'✗ बचें',              english:'✗ AVOID'},
  premium:      {hinglish:'Trikaal Ka Poora Sandesh — Premium Analysis', hindi:'त्रिकाल का पूरा संदेश — प्रीमियम विश्लेषण', english:'Trikaal\'s Full Message — Premium Analysis'},
  dashaArth:    {hinglish:'⏰ Dasha Ka Arth',       hindi:'⏰ दशा का अर्थ',       english:'⏰ What This Dasha Means'},
  shubhDates:   {hinglish:'🗓 Sabse Shubh Dates',   hindi:'🗓 सबसे शुभ तिथियाँ',  english:'🗓 Most Auspicious Dates'},
  kyaKarein:    {hinglish:'✓ KYA KAREIN',           hindi:'✓ क्या करें',          english:'✓ WHAT TO DO'},
  kyaNaKarein:  {hinglish:'✗ KYA NA KAREIN',        hindi:'✗ क्या न करें',        english:'✗ WHAT NOT TO DO'},
  upayHint:     {hinglish:'🕉️ Upay Hint',           hindi:'🕉️ उपाय संकेत',        english:'🕉️ Remedy Hint'},
  karmic:       {hinglish:'🔱 Karmic Insight — Bhrigu Pattern', hindi:'🔱 कार्मिक अंतर्दृष्टि — भृगु पैटर्न', english:'🔱 Karmic Insight — Bhrigu Pattern'},
  janmaKundali: {hinglish:'🪐 Janma Kundali — North Indian Chart', hindi:'🪐 जन्म कुंडली — उत्तर भारतीय चक्र', english:'🪐 Birth Chart — North Indian Style'},
  grahaVish:    {hinglish:'⚡ Graha Vishleshan — All 9 Planets', hindi:'⚡ ग्रह विश्लेषण — सभी ९ ग्रह', english:'⚡ Planetary Analysis — All 9 Grahas'},
  dashaKaal:    {hinglish:'⏰ Dasha Kaal — Vimshottari System', hindi:'⏰ दशा काल — विंशोत्तरी पद्धति', english:'⏰ Dasha Periods — Vimshottari System'},
  actionWin:    {hinglish:'🗓 Action Windows — Trikaal Precision', hindi:'🗓 कार्य अवधि — त्रिकाल परिशुद्धता', english:'🗓 Action Windows — Trikaal Precision'},
  upayTitle:    {hinglish:'🙏 Upay — 5 Classical Remedies (BPHS)', hindi:'🙏 उपाय — ५ शास्त्रीय उपाय (बीपीएचएस)', english:'🙏 Remedies — 5 Classical Upay (BPHS)'},
  lockedMore:   {hinglish:'🔒 Trikaal ne aur bhi dekha hai', hindi:'🔒 त्रिकाल ने और भी देखा है', english:'🔒 Trikaal has seen more'},
  unlock51:     {hinglish:'🔓 Poora sach — ₹51',  hindi:'🔓 पूरा सच — ₹५१',  english:'🔓 The full answer — ₹51'},
  tzMonths:     {hinglish:'…aur aage ke 6 mahine?', hindi:'…और आगे के ६ महीने?', english:'…and the next 6 months?'},
  tzWindow:     {hinglish:'…doosri window kab khulti hai?', hindi:'…दूसरी अवधि कब खुलती है?', english:'…when does the next window open?'},
  tzUpay:       {hinglish:'…aapke Lagna ka ratna kaun sa hai?', hindi:'…आपके लग्न का रत्न कौन सा है?', english:'…which gemstone is for your Lagna?'},
  moreHouses:   {hinglish:'aur bhav', hindi:'और भाव', english:'more houses'},
  lockedD9:     {hinglish:'Navamsa (D9) — har graha ka andaruni bal', hindi:'नवांश (D9) — हर ग्रह का आंतरिक बल', english:'Navamsa (D9) — the inner strength of each graha'},
  lockedFuture: {hinglish:'Agle 6 mahine ka gochar + mahine-dar-mahine plan', hindi:'अगले ६ महीने का गोचर + महीने-दर-महीने योजना', english:'Next 6 months of transits + month-by-month plan'},
  lockedBhrigu: {hinglish:'Bhrigu Nandi signals aur yogas', hindi:'भृगु नंदी संकेत और योग', english:'Bhrigu Nandi signals and yogas'},
  lockedShad:   {hinglish:'Har graha ka Shadbala score', hindi:'हर ग्रह का षड्बल स्कोर', english:'Shadbala score for every graha'},
  lockedRows:   {hinglish:'Baaki bhav, dasha activation aur poore upay', hindi:'शेष भाव, दशा सक्रियता और पूरे उपाय', english:'Remaining houses, dasha activation and the full remedies'},
  // v10.1: LockedSection was the last hardcoded-Hinglish block — an English
  // reader saw "Aapki Saturn Mahadasha mein... har graha ka andaruni bal" as the
  // final pitch, in a language they had not chosen.
  lockTitle:    {hinglish:'Trikaal Ne Aur Bhi Dekha Hai', hindi:'त्रिकाल ने और भी देखा है', english:'Trikaal Has Seen More'},
  lockTease:    {hinglish:'Complete analysis, yogas, 5 upay aur 900-word deep reading taiyaar hai.', hindi:'पूरा विश्लेषण, योग, ५ उपाय और ९०० शब्दों की गहन रीडिंग तैयार है।', english:'The complete analysis, yogas, 5 upay and a 900-word deep reading are ready.'},
  lockCta:      {hinglish:'🔓 Unlock Full Report — ₹51 Only', hindi:'🔓 पूरी रिपोर्ट खोलें — केवल ₹५१', english:'🔓 Unlock Full Report — ₹51 Only'},
  lockSub:      {hinglish:'One-time · Instant access · Razorpay secure', hindi:'एक बार · तुरंत उपलब्ध · Razorpay सुरक्षित', english:'One-time · Instant access · Razorpay secure'},
  f1:{hinglish:'✓ Navamsa (D9) — har graha ka andaruni bal', hindi:'✓ नवांश (D9) — हर ग्रह का आंतरिक बल', english:'✓ Navamsa (D9) — the inner strength of each graha'},
  f2:{hinglish:'✓ Agle 6 mahine ka gochar, mahine-dar-mahine', hindi:'✓ अगले ६ महीने का गोचर, महीने-दर-महीने', english:'✓ Next 6 months of transits, month by month'},
  f3:{hinglish:'✓ Har graha ka Shadbala score', hindi:'✓ हर ग्रह का षड्बल स्कोर', english:'✓ Shadbala score for every graha'},
  f4:{hinglish:'✓ Saare bhav + dasha activation chain', hindi:'✓ सभी भाव + दशा सक्रियता श्रृंखला', english:'✓ All houses + the dasha activation chain'},
  f5:{hinglish:'✓ Bhrigu Nandi signals aur yogas', hindi:'✓ भृगु नंदी संकेत और योग', english:'✓ Bhrigu Nandi signals and yogas'},
  f6:{hinglish:'✓ Poora 5-upay plan (mantra+ratna+vrat+dana+vishesh)', hindi:'✓ पूरा ५-उपाय प्लान (मंत्र+रत्न+व्रत+दान+विशेष)', english:'✓ The full 5-upay plan (mantra+gemstone+vrat+dana+special)'},
  f7:{hinglish:'✓ 900-word deep analysis', hindi:'✓ ९०० शब्दों का गहन विश्लेषण', english:'✓ 900-word deep analysis'},
  f8:{hinglish:'✓ Chaaron upay levels — vyavaharik se seva tak', hindi:'✓ चारों उपाय स्तर — व्यावहारिक से सेवा तक', english:'✓ All four remedy levels — practical through seva'},
  vedicAnalysis:{hinglish:'🔮 Vedic Analysis — Trikaal Ka Sandesh', hindi:'🔮 वैदिक विश्लेषण — त्रिकाल का संदेश', english:'🔮 Vedic Analysis — Trikaal\'s Message'},
  lvlPractical:   {hinglish:'Vyavaharik',  hindi:'व्यावहारिक',  english:'Practical'},
  lvlBehavioural: {hinglish:'Anushasan',   hindi:'अनुशासन',     english:'Behavioural'},
  lvlSpiritual:   {hinglish:'Adhyatmik',   hindi:'आध्यात्मिक',  english:'Spiritual'},
  lvlSeva:        {hinglish:'Seva',        hindi:'सेवा',        english:'Seva'},
}
// v9.1: template_engine emits level names in English only. Translating the four
// known names here keeps the engine language-neutral and the report consistent.
const LEVEL_KEY: Record<string,string> = {
  Practical:'lvlPractical', Behavioural:'lvlBehavioural', Spiritual:'lvlSpiritual', Seva:'lvlSeva',
}
function lbl(key:string, lang:Lang):string { return L[key]?.[lang] ?? L[key]?.hinglish ?? key }

function s(v:unknown, fb='—'):string {
  return typeof v==='string' && v.trim() ? v.trim() : fb
}
function safeArr<T>(v:unknown):T[] { return Array.isArray(v) ? v as T[] : [] }
function safeObj(v:unknown):Record<string,unknown> {
  return v&&typeof v==='object'&&!Array.isArray(v) ? v as Record<string,unknown> : {}
}
// v8.4.1: a yoga may arrive as "Gajakesari Yoga" or as
// {name, present, description}. Anything else is discarded rather than rendered.
function yogaName(y:unknown):string {
  if (typeof y === 'string') return y.trim()
  if (y && typeof y === 'object') {
    const o = y as Record<string, unknown>
    if (o.present === false) return ''
    const n = o.name ?? o.yoga ?? o.title
    return typeof n === 'string' ? n.trim() : ''
  }
  return ''
}

// v8.4.2: a geo bullet may be "text" or {item|text|bullet|content|value:"text"}.
function bulletText(b:unknown):string {
  if (typeof b === 'string') return b.trim()
  if (b && typeof b === 'object') {
    const o = b as Record<string, unknown>
    const t = o.item ?? o.text ?? o.bullet ?? o.content ?? o.value
    return typeof t === 'string' ? t.trim() : ''
  }
  return ''
}

function ordinal(n:number):string {
  if(n===1) return '1st'; if(n===2) return '2nd'; if(n===3) return '3rd'
  return `${n}th`
}

function splitGeoToBullets(text:string, isPaid:boolean, pj?:Record<string,unknown>): string[] {
  const bullets: string[] = []
  const maxBullets = isPaid ? 10 : 5
  if (pj) {
    // v8.4.2: Gemini sometimes returns geoBullets as [{item:"..."}]. The old
    // string-only filter dropped all ten and the page fell back to two generic
    // marketing lines — a paid client saw "(2 INSIGHTS)" while ten real Hindi
    // bullets sat unused in the DB. route v14.18 normalises new rows; this
    // handles rows already saved with the object shape.
    const geoBullets = safeArr<unknown>(pj.geoBullets).map(bulletText)
    geoBullets.filter(b=>b.length>15).slice(0,maxBullets).forEach(b=>bullets.push(b))
  }
  if (bullets.length < maxBullets && text && text !== '—') {
    const cleaned = text.replace(/trikalvaani\.\s*\n?\s*com/gi,'trikalvaani.com').replace(/Visit\s+trikalvaani\.com[^.]*\./gi,'').trim()
    const sentences = cleaned.match(/[^.!?]+(?:[.!?](?!\s*com|\s*in|\s*org))+/g) ?? []
    sentences.map(s=>s.replace(/^[.!?,;\s]+/,'').trim()).filter(s=>s.length>20&&!s.toLowerCase().includes('trikalvaani.com')).slice(0,maxBullets-bullets.length).forEach(s=>{if(bullets.length<maxBullets)bullets.push(s)})
  }
  if (isPaid && pj && bullets.length < maxBullets) {
    const seo = safeObj(pj.seoSignals)
    const authority = seo.authorityStatement as string
    if (authority && authority!=='—' && bullets.length<maxBullets) bullets.push(authority)
    const diff = seo.differentiator as string
    if (diff && diff!=='—' && bullets.length<maxBullets) bullets.push(diff)
  }
  if (bullets.length === 0) return ['Trikaal Vaani — Rohiit Gupta ji ki Swiss Ephemeris powered Vedic analysis aapke liye taiyaar hai.']
  return bullets.slice(0,maxBullets)
}

function KundaliChart({lagna,planets}:{lagna:string;planets:PlanetRow[]}) {
  const lagnaIdx = RASHI_LIST.findIndex(r=>r.toLowerCase()===lagna.toLowerCase()||lagna.toLowerCase().startsWith(r.toLowerCase().slice(0,4)))
  if(lagnaIdx<0) return null
  const houseMap:Record<number,string[]> = {}
  planets.forEach(p=>{if(!houseMap[p.house])houseMap[p.house]=[];houseMap[p.house].push(PLANET_HI[p.planet]?.slice(0,3)||p.planet.slice(0,3))})
  const cells:[number,number,number,number,number][] = [[12,0,0,100,100],[1,100,0,200,100],[2,300,0,100,100],[11,0,100,100,200],[3,300,100,100,200],[10,0,300,100,100],[9,100,300,200,100],[8,300,300,100,100],[4,100,100,100,100],[5,200,100,100,100],[6,100,200,100,100],[7,200,200,100,100]]
  const houseToRashi = (h:number) => RASHI_LIST[(lagnaIdx+h-1)%12]
  return (
    <div style={{display:'flex',justifyContent:'center'}}>
      <svg width="360" height="360" viewBox="0 0 400 400" style={{maxWidth:'100%',background:'#0A0F1E',borderRadius:'10px',border:`1px solid ${G(0.35)}`}}>
        <line x1="100" y1="100" x2="200" y2="200" stroke={G(0.3)} strokeWidth="1.5"/>
        <line x1="300" y1="100" x2="200" y2="200" stroke={G(0.3)} strokeWidth="1.5"/>
        <line x1="100" y1="300" x2="200" y2="200" stroke={G(0.3)} strokeWidth="1.5"/>
        <line x1="300" y1="300" x2="200" y2="200" stroke={G(0.3)} strokeWidth="1.5"/>
        {cells.map(([h,x,y,w,ht])=>{
          const isLagna=h===1; const planetsHere=houseMap[h]??[]; const rashi=houseToRashi(h)
          return (<g key={h}><rect x={x} y={y} width={w} height={ht} fill={isLagna?G(0.15):'rgba(10,15,30,0.6)'} stroke={G(isLagna?0.6:0.25)} strokeWidth={isLagna?2:1}/><text x={x+7} y={y+15} fill={G(0.55)} fontSize="11" fontFamily="Georgia,serif" fontWeight={isLagna?'700':'400'}>{h}</text><text x={x+w-6} y={y+15} fill={G(0.35)} fontSize="9" textAnchor="end" fontFamily="Georgia,serif">{rashi.slice(0,3)}</text>{isLagna&&<text x={x+w/2} y={y+ht-10} fill={GOLD} fontSize="12" textAnchor="middle" fontWeight="700" fontFamily="Georgia,serif">L</text>}{planetsHere.map((pl,i)=>(<text key={`${h}-${pl}-${i}`} x={x+w/2} y={y+ht/2+(i-(planetsHere.length-1)/2)*15} fill={isLagna?GOLD:'#e2e8f0'} fontSize="11" textAnchor="middle" fontWeight={isLagna?'700':'500'} fontFamily="Georgia,serif">{pl}</text>))}</g>)
        })}
        <text x="200" y="396" fill={G(0.4)} fontSize="10" textAnchor="middle" fontFamily="Georgia,serif">{lagna} Lagna</text>
      </svg>
    </div>
  )
}

// ── v8.4 WHY YOU ARE HERE ─────────────────────────────────────────────────────
// The trust hook. A client does not arrive curious about the future — something
// already happened. This card names the real dasha segment that began, then
// offers possible manifestations the reader can recognise OR dismiss. It never
// asserts an event occurred; Gemini is instructed to give possibilities only.
function WhyYouAreHere({ why, activation, lang }:{ why:WhyHere; activation?:ChartEvidence['activation']; lang:Lang }) {
  const text = s(why?.text as string)
  const mans = safeArr<string>(why?.possibleManifestations)
  const rec  = s(why?.recognitionLine as string)
  if (text==='—' && mans.length===0) return null
  const ad = activation?.antardasha
  const pd = activation?.pratyantar
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.22)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 12px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('whyHere',lang)}</p>
      {text!=='—' && <p style={{margin:'0 0 14px',color:'#e2e8f0',fontSize:'14px',lineHeight:1.75}}>{text}</p>}
      {(ad?.lord || pd?.lord) && (
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'14px'}}>
          {ad?.lord && ad?.start && <span style={{padding:'6px 11px',borderRadius:'8px',background:G(0.08),border:`1px solid ${G(0.2)}`,color:'#cbd5e1',fontSize:'12px'}}>{ad.lord} Antardasha · {ad.start} → {ad.end}</span>}
          {pd?.lord && pd?.start && <span style={{padding:'6px 11px',borderRadius:'8px',background:G(0.08),border:`1px solid ${G(0.2)}`,color:'#cbd5e1',fontSize:'12px'}}>{pd.lord} Pratyantar · {pd.start} → {pd.end}</span>}
        </div>
      )}
      {mans.length>0 && (
        <>
          <p style={{margin:'0 0 8px',color:G(0.6),fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{lbl('whyManif',lang)}</p>
          <ul style={{margin:'0 0 12px',padding:'0 0 0 18px',color:'#cbd5e1',fontSize:'13px',lineHeight:1.9}}>
            {mans.map((m,i)=>(<li key={i}>{m}</li>))}
          </ul>
        </>
      )}
      {rec!=='—' && <p style={{margin:0,color:'#94a3b8',fontSize:'12px',fontStyle:'italic',lineHeight:1.7}}>{rec}</p>}
    </div>
  )
}

// ── v8.4 EVIDENCE TABLE ───────────────────────────────────────────────────────
// Every row is a lookup into Parashara + Shadbala engine output. The numbers come
// from the engine; only the "matlab" line is written by the reading. This is what
// turns an assertion into something the client can follow and check.
function EvidenceTable({ ev, meanings, lang, isPaid, slug }:{ ev:ChartEvidence; meanings:{house?:number;meaning?:string}[]; lang:Lang; isPaid:boolean; slug:string }) {
  // v9.3: free gets the same two rows the free prompt was given — enough to prove
  // the reading is from THIS chart, not the whole evidence layer.
  const allRows = safeArr<EvidenceHouse>(ev?.houses)
  const rows = isPaid ? allRows : allRows.slice(0, 2)
  if (rows.length===0) return null
  const meaningFor = (hn?:number) => {
    if (hn===undefined) return ''
    const m = meanings.find(x => Number(x?.house)===Number(hn))
    return s(m?.meaning as string)!=='—' ? String(m?.meaning) : ''
  }
  const links = isPaid ? safeArr<{planet:string;house:string}>(ev?.activation?.domain_links) : []
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.15)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 6px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('evidence',lang)}</p>
      <p style={{margin:'0 0 16px',color:'#64748b',fontSize:'11px'}}>
        Lagna {s(ev?.lagna)} · {lbl('lord',lang)} {s(ev?.lagna_lord)} — {lbl('evidenceSub',lang)}
      </p>
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {rows.map((r,i)=>{
          const mean = meaningFor(r.house_number)
          return (
            <div key={i} style={{padding:'13px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <p style={{margin:'0 0 5px',color:'#fff',fontSize:'13px',fontWeight:700}}>
                {r.factor}{r.sign?` · ${r.sign}`:''}
              </p>
              <p style={{margin:'0 0 5px',color:'#cbd5e1',fontSize:'12.5px',lineHeight:1.7}}>
                {lbl('lord',lang)} <strong style={{color:GOLD}}>{s(r.lord)}</strong>
                {r.lord_house?<> — {ordinal(r.lord_house)} {lbl('inHouse',lang)}{r.lord_rashi?` (${r.lord_rashi})`:''}{r.lord_dignity?`, ${r.lord_dignity}`:''}{typeof r.lord_shadbala==='number'?`, Shadbala ${r.lord_shadbala.toFixed(2)}`:''}</>:null}
                {safeArr<string>(r.occupants).length>0 ? <> · {lbl('occupants',lang)}: {safeArr<string>(r.occupants).join(', ')}</> : <> · {lbl('noOccupants',lang)}</>}
              </p>
              {mean && <p style={{margin:0,color:'#94a3b8',fontSize:'12.5px',lineHeight:1.7}}>→ {mean}</p>}
            </div>
          )
        })}
      </div>
      {links.length>0 && (
        <div style={{marginTop:'14px',padding:'12px 14px',borderRadius:'10px',background:G(0.06),border:`1px solid ${G(0.18)}`}}>
          <p style={{margin:'0 0 6px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{lbl('activation',lang)}</p>
          <p style={{margin:0,color:'#cbd5e1',fontSize:'12.5px',lineHeight:1.8}}>
            {links.map((l,i)=>(<span key={i}>{l.planet} → {l.house}{i<links.length-1?' · ':''}</span>))}
          </p>
        </div>
      )}
      {!isPaid && allRows.length > rows.length && (
        <Cliff slug={slug} text={`…${allRows.length - rows.length} ${lbl('moreHouses',lang)}`}/>
      )}
      <p style={{margin:'12px 0 0',color:'#475569',fontSize:'11px'}}>Parashara BPHS house lords + Shadbala · Swiss Ephemeris</p>
    </div>
  )
}

// ── v8.4 ENGINE SIGNALS (yogas + Bhrigu) ──────────────────────────────────────
// The badge on page 1 has always claimed Bhrigu Nandi; until now the report never
// showed a single Bhrigu output. This renders it only when the engine actually
// returned something — an empty claim is worse than no claim.
function EngineSignals({ yogas, bhriguTheme, bhriguPoints, signals, lang }:{ yogas:string[]; bhriguTheme:string; bhriguPoints:number; signals:{desc:string;timing:string;rel:boolean}[]; lang:Lang }) {
  const hasY = yogas.length>0
  const hasB = bhriguTheme!=='—' || bhriguPoints>0 || signals.length>0
  if (!hasY && !hasB) return null
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('signals',lang)}</p>
      {hasY && (
        <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:hasB?'14px':0}}>
          {yogas.map((y,i)=>(<span key={i} style={{padding:'7px 12px',borderRadius:'8px',background:G(0.08),border:`1px solid ${G(0.22)}`,color:'#e2e8f0',fontSize:'12.5px',fontWeight:600}}>{y}</span>))}
        </div>
      )}
      {hasB && (
        <div style={{padding:'12px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
          <p style={{margin:'0 0 4px',color:G(0.6),fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>Bhrigu Nandi Nadi{bhriguPoints>0?` · ${bhriguPoints} points`:''}</p>
          {bhriguTheme!=='—' && <p style={{margin:'0 0 8px',color:'#cbd5e1',fontSize:'13px',lineHeight:1.7}}>{bhriguTheme}</p>}
          {signals.length>0 && (
            <ul style={{margin:0,padding:'0 0 0 18px',color:'#cbd5e1',fontSize:'12.5px',lineHeight:1.8}}>
              {signals.map((sg,i)=>(<li key={i}>{sg.desc}{sg.timing?<span style={{color:'#64748b'}}> · {sg.timing}</span>:null}</li>))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ── v8.4 CONFIDENCE ───────────────────────────────────────────────────────────
// Astrology should not pretend every horizon carries equal certainty. Near-term
// rests on exact Vimshottari dates; months 4-6 are directional. Saying so is a
// credibility gain, not a weakness.
function ConfidenceCard({ c, lang }:{ c:ReadingConfidence; lang:Lang }) {
  const rows = [
    {label:lbl('confPast',lang),  v:s(c?.recentPast as string)},
    {label:lbl('confNext3',lang), v:s(c?.next3Months as string)},
    {label:lbl('conf46',lang),    v:s(c?.months4to6 as string)},
  ].filter(r=>r.v!=='—')
  if (rows.length===0) return null
  const col = (v:string) => /high/i.test(v)?'#22c55e':/moder/i.test(v)?GOLD:'#94a3b8'
  const dot = (v:string) => /high/i.test(v)?'🟢':/moder/i.test(v)?'🟡':'⚪'
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('confidence',lang)}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'10px'}}>
        {rows.map(r=>(
          <div key={r.label} style={{padding:'12px',borderRadius:'10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
            <p style={{margin:'0 0 4px',color:'#64748b',fontSize:'11px'}}>{r.label}</p>
            <p style={{margin:0,color:col(r.v),fontSize:'13.5px',fontWeight:700}}>{dot(r.v)} {r.v}</p>
          </div>
        ))}
      </div>
      {s(c?.basis as string)!=='—' && <p style={{margin:'12px 0 0',color:'#475569',fontSize:'11px',lineHeight:1.6}}>{s(c?.basis as string)}</p>}
    </div>
  )
}

// ── v9.0 VERDICT CARD — the answer, before anything else ─────────────────────
// GPT's audit: page 1 opened with credentials and engine badges while the
// client's actual question ("when does this end?") appeared on page 2-3. The
// machinery was being explained before the value was proven. This card carries
// no new data — it re-orders what the engines already produced so the answer
// comes first and the reasoning follows.
function VerdictCard({ lang, coreMsg, mahadasha, antardasha, pratyantar, best, caution, conf, doNow, avoidNow }:{
  lang:Lang; coreMsg:string; mahadasha:string; antardasha:string; pratyantar:string
  best:string|null; caution:string|null; conf:ReadingConfidence; doNow:string; avoidNow:string
}) {
  if (coreMsg==='—' && !best && !caution) return null
  const chip = (label:string, value:string, tone:'g'|'r'|'n') => (
    <div style={{padding:'11px 13px',borderRadius:'10px',
      background: tone==='g'?'rgba(34,197,94,0.08)':tone==='r'?'rgba(239,68,68,0.07)':G(0.06),
      border:`1px solid ${tone==='g'?'rgba(34,197,94,0.25)':tone==='r'?'rgba(239,68,68,0.22)':G(0.18)}`}}>
      <p style={{margin:'0 0 3px',color:'#64748b',fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p>
      <p style={{margin:0,color: tone==='g'?'#86efac':tone==='r'?'#fca5a5':'#fff',fontSize:'13.5px',fontWeight:700}}>{value}</p>
    </div>
  )
  return (
    <div style={{background:`linear-gradient(135deg,${G(0.14)},rgba(8,11,18,0.96))`,border:`1px solid ${G(0.32)}`,borderRadius:'18px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('verdict',lang)}</p>
      {coreMsg!=='—' && <p style={{margin:'0 0 16px',color:'#fff',fontSize:'16px',fontWeight:600,fontFamily:'Georgia,serif',lineHeight:1.65}}>{coreMsg}</p>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'9px',marginBottom:'12px'}}>
        {mahadasha!=='—' && chip('Dasha', `${mahadasha} / ${antardasha}${pratyantar!=='—'?` / ${pratyantar}`:''}`, 'n')}
        {best    && chip(lbl('bestMonth',lang),    best,    'g')}
        {caution && chip(lbl('cautionMonth',lang), caution, 'r')}
        {s(conf?.next3Months as string)!=='—' && chip(lbl('confNext3',lang), String(conf.next3Months), 'n')}
      </div>
      {(doNow!=='—'||avoidNow!=='—') && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'9px'}}>
          {doNow!=='—'   && <div style={{padding:'11px',borderRadius:'9px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.18)'}}><p style={{margin:'0 0 4px',color:'#22c55e',fontSize:'10px',fontWeight:700}}>✓</p><p style={{margin:0,color:'#86efac',fontSize:'12.5px',lineHeight:1.5}}>{doNow}</p></div>}
          {avoidNow!=='—'&& <div style={{padding:'11px',borderRadius:'9px',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.18)'}}><p style={{margin:'0 0 4px',color:'#ef4444',fontSize:'10px',fontWeight:700}}>✗</p><p style={{margin:0,color:'#fca5a5',fontSize:'12.5px',lineHeight:1.5}}>{avoidNow}</p></div>}
        </div>
      )}
    </div>
  )
}

// ── v9.0 GOCHAR TIMELINE ─────────────────────────────────────────────────────
// Real sidereal transits per month, mapped onto natal houses, with the running
// Vimshottari period for each month. Tone is RELATIVE to this window — the slow
// nodes hold one house for 18 months and would otherwise mark all nine months
// identically, so they are shown separately as background.
interface GMonth { ym:string; label:string; is_past:boolean; is_current:boolean
  antardasha:string|null; pratyantar:string|null; tone:string; marker:string
  domain_hits:{planet:string;house:number;nature:string}[] }
function GocharTimeline({ g, lang, isPaid, slug }:{ g:Record<string,unknown>; lang:Lang; isPaid:boolean; slug:string }) {
  // v9.3: the past three months are the recognition hook and stay free; the six
  // months AHEAD are the thing worth paying for.
  const past = safeArr<GMonth>(g.past), future = isPaid ? safeArr<GMonth>(g.future) : []
  const cur  = safeObj(g.current) as unknown as GMonth
  if (past.length===0 && future.length===0) return null
  const bg = safeArr<{planet:string;house:number;nature:string}>(g.background)
  const dot = (m:string) => m==='green'?'🟢':m==='red'?'🔴':'🟡'
  const Row = ({m,highlight}:{m:GMonth;highlight?:boolean}) => (
    <div style={{padding:'11px 13px',borderRadius:'10px',marginBottom:'7px',
      background: highlight?G(0.1):'rgba(255,255,255,0.03)',
      border:`1px solid ${highlight?G(0.3):'rgba(255,255,255,0.06)'}`}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'4px'}}>
        <span style={{fontSize:'13px',fontWeight:700,color:'#fff'}}>{dot(m.marker)} {m.label}</span>
        {(m.antardasha||m.pratyantar) && <span style={{color:'#64748b',fontSize:'11px'}}>{m.antardasha ?? '—'}{m.pratyantar?` / ${m.pratyantar}`:''}</span>}
      </div>
      <p style={{margin:0,color:'#94a3b8',fontSize:'12px',lineHeight:1.6}}>
        {safeArr<{planet:string;house:number;nature:string}>(m.domain_hits)
          .filter(h=>!bg.some(b=>b.planet===h.planet))
          .map(h=>`${h.planet} → ${ordinal(h.house)}`).join(' · ') || '—'}
      </p>
    </div>
  )
  const Head = ({t}:{t:string}) => (<p style={{margin:'14px 0 8px',color:G(0.6),fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em'}}>{t}</p>)
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.15)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 4px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('timeline',lang)}</p>
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'6px'}}>
        {s(g.best_month as string)!=='—'    && <span style={{padding:'5px 10px',borderRadius:'8px',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.25)',color:'#86efac',fontSize:'11.5px',fontWeight:600}}>🟢 {lbl('bestMonth',lang)}: {String(g.best_month)}</span>}
        {s(g.caution_month as string)!=='—' && <span style={{padding:'5px 10px',borderRadius:'8px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.22)',color:'#fca5a5',fontSize:'11.5px',fontWeight:600}}>🔴 {lbl('cautionMonth',lang)}: {String(g.caution_month)}</span>}
      </div>
      {bg.length>0 && <p style={{margin:'0 0 6px',color:'#64748b',fontSize:'11px'}}>{lbl('background',lang)}: {bg.map(b=>`${b.planet} → ${ordinal(b.house)}`).join(' · ')}</p>}
      {past.length>0 && <><Head t={lbl('tlPast',lang)}/>{past.map(m=><Row key={m.ym} m={m}/>)}</>}
      {cur?.label   && <><Head t={lbl('tlNow',lang)}/><Row m={cur} highlight/></>}
      {future.length>0 && <><Head t={lbl('tlNext',lang)}/>{future.map(m=><Row key={m.ym} m={m}/>)}</>}
      {!isPaid && <Cliff slug={slug} text={lbl('tzMonths',lang)}/>}
      <p style={{margin:'10px 0 0',color:'#475569',fontSize:'11px',lineHeight:1.5}}>{s(g.disclaimer as string,'')}</p>
    </div>
  )
}

// ── v9.0 NAVAMSA (D9) ────────────────────────────────────────────────────────
function NavamsaCard({ nv, lang, note }:{ nv:Record<string,unknown>; lang:Lang; note:string }) {
  const rows = safeArr<Record<string,unknown>>(nv.planets)
  if (rows.length===0) return null
  const vg = safeArr<string>(nv.vargottama_planets)
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 6px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('navamsa',lang)}</p>
      {s(nv.navamsa_lagna as string)!=='—' && <p style={{margin:'0 0 12px',color:'#94a3b8',fontSize:'12px'}}>{lbl('navLagna',lang)}: <strong style={{color:'#fff'}}>{String(nv.navamsa_lagna)}</strong></p>}
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
          <thead><tr style={{borderBottom:`1px solid ${G(0.15)}`}}>{['Graha','D1','D9','House','Dignity'].map(h=>(<th key={h} style={{padding:'8px 6px',color:GOLD,fontWeight:600,textAlign:'left',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>))}</tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:i%2===0?G(0.02):'transparent'}}>
                <td style={{padding:'10px 6px',color:'#fff',fontWeight:600}}><span style={{color:GOLD,marginRight:'5px'}}>{PLANET_GLYPH[String(r.planet)]??'✦'}</span>{s(r.planet_hi as string, String(r.planet))}{r.vargottama?<span style={{color:'#22c55e',fontSize:'10px',marginLeft:'5px'}}>★</span>:null}</td>
                <td style={{padding:'10px 6px',color:'#94a3b8',fontSize:'12px'}}>{s(r.d1_rashi as string)}</td>
                <td style={{padding:'10px 6px',color:'#e2e8f0'}}>{s(r.navamsa_rashi as string)}</td>
                <td style={{padding:'10px 6px',color:'#e2e8f0'}}>{r.navamsa_house?ordinal(Number(r.navamsa_house)):'—'}</td>
                <td style={{padding:'10px 6px',color:'#94a3b8',fontSize:'12px'}}>{s(r.dignity_d9 as string)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {vg.length>0 && <p style={{margin:'10px 0 0',color:'#22c55e',fontSize:'11.5px'}}>★ {lbl('vargottama',lang)}: {vg.join(', ')}</p>}
      {note!=='—' && (
        <div style={{marginTop:'12px',padding:'12px 14px',borderRadius:'10px',background:G(0.06),border:`1px solid ${G(0.18)}`}}>
          <p style={{margin:'0 0 5px',color:G(0.65),fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{lbl('navNote',lang)}</p>
          <p style={{margin:0,color:'#cbd5e1',fontSize:'13px',lineHeight:1.7}}>{note}</p>
        </div>
      )}
      <p style={{margin:'8px 0 0',color:'#475569',fontSize:'11px'}}>{s(nv.note as string,'')}</p>
    </div>
  )
}

// ── v9.4 DASAMSA (D10) ───────────────────────────────────────────────────────
// BPHS Ch.6 reads PROFESSION in the Dasamsa, not in the rasi chart. The report
// has shown D9 for a while; without D10 every career paragraph rested on the
// rasi chart alone. Deliberately mirrors NavamsaCard so the two read as a pair
// rather than as two different designers' work.
function DasamsaCard({ ds, lang, note }:{ ds:Record<string,unknown>; lang:Lang; note:string }) {
  const rows = safeArr<Record<string,unknown>>(ds.planets)
  if (rows.length===0) return null
  const conf = safeArr<string>(ds.confirmed_planets)
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 6px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('dasamsa',lang)}</p>
      <div style={{margin:'0 0 12px',display:'flex',flexWrap:'wrap',gap:'14px'}}>
        {s(ds.dasamsa_lagna as string)!=='—' && <p style={{margin:0,color:'#94a3b8',fontSize:'12px'}}>{lbl('dasLagna',lang)}: <strong style={{color:'#fff'}}>{String(ds.dasamsa_lagna)}</strong></p>}
        {s(ds.dasamsa_10th_sign as string)!=='—' && <p style={{margin:0,color:'#94a3b8',fontSize:'12px'}}>{lbl('dasTenth',lang)}: <strong style={{color:'#fff'}}>{String(ds.dasamsa_10th_sign)}</strong></p>}
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
          <thead><tr style={{borderBottom:`1px solid ${G(0.15)}`}}>{['Graha','D1','D10','House','Dignity'].map(h=>(<th key={h} style={{padding:'8px 6px',color:GOLD,fontWeight:600,textAlign:'left',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{h}</th>))}</tr></thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:i%2===0?G(0.02):'transparent'}}>
                <td style={{padding:'10px 6px',color:'#fff',fontWeight:600}}><span style={{color:GOLD,marginRight:'5px'}}>{PLANET_GLYPH[String(r.planet)]??'✦'}</span>{s(r.planet_hi as string, String(r.planet))}{r.same_as_d1?<span style={{color:'#22c55e',fontSize:'10px',marginLeft:'5px'}}>★</span>:null}</td>
                <td style={{padding:'10px 6px',color:'#94a3b8',fontSize:'12px'}}>{s(r.d1_rashi as string)}</td>
                <td style={{padding:'10px 6px',color:'#e2e8f0'}}>{s(r.dasamsa_rashi as string)}</td>
                <td style={{padding:'10px 6px',color:'#e2e8f0'}}>{r.dasamsa_house?ordinal(Number(r.dasamsa_house)):'—'}</td>
                <td style={{padding:'10px 6px',color:'#94a3b8',fontSize:'12px'}}>{s(r.dignity_d10 as string)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {conf.length>0 && <p style={{margin:'10px 0 0',color:'#22c55e',fontSize:'11.5px'}}>★ {lbl('dasConfirmed',lang)}: {conf.join(', ')}</p>}
      {note!=='—' && (
        <div style={{marginTop:'12px',padding:'12px 14px',borderRadius:'10px',background:G(0.06),border:`1px solid ${G(0.18)}`}}>
          <p style={{margin:'0 0 5px',color:G(0.65),fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{lbl('dasNote',lang)}</p>
          <p style={{margin:0,color:'#cbd5e1',fontSize:'13px',lineHeight:1.7}}>{note}</p>
        </div>
      )}
      <p style={{margin:'8px 0 0',color:'#475569',fontSize:'11px'}}>{s(ds.note as string,'')}</p>
    </div>
  )
}

// ── v9.0 REMEDY HIERARCHY ────────────────────────────────────────────────────
// All five upay were spiritual and presented flat, so "chant 108x" read as the
// answer to debt. Classical position is the reverse: remedies support effort.
function RemedyLevels({ h, lang, isPaid }:{ h:Record<string,unknown>; lang:Lang; isPaid:boolean }) {
  // v9.3: free gets the practical and behavioural levels — the two that cost
  // nothing to act on. The spiritual and seva levels are part of the paid upay.
  const levels = isPaid ? safeArr<Record<string,unknown>>(h.levels) : safeArr<Record<string,unknown>>(h.levels).slice(0, 2)
  if (levels.length===0) return null
  const COL = ['#22c55e','#60a5fa',GOLD,'#a78bfa']
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.15)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('remedyLevels',lang)}</p>
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {levels.map((lv,i)=>{
          const c = COL[i%COL.length]!
          return (
            <div key={i} style={{padding:'13px 14px',borderRadius:'10px',background:`${c}08`,border:`1px solid ${c}25`}}>
              <p style={{margin:'0 0 4px',color:c,fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em'}}>Level {String(lv.level)} — {LEVEL_KEY[String(lv.name)] ? lbl(LEVEL_KEY[String(lv.name)]!, lang) : s(lv.name as string)}</p>
              <p style={{margin:'0 0 7px',color:'#64748b',fontSize:'11.5px',lineHeight:1.55}}>{s(lv.why as string,'')}</p>
              <ul style={{margin:0,padding:'0 0 0 17px',color:'#e2e8f0',fontSize:'13px',lineHeight:1.75}}>
                {safeArr<string>(lv.actions).map((a,j)=>(<li key={j}>{a}</li>))}
              </ul>
            </div>
          )
        })}
      </div>
      {s(h.order_note as string)!=='—' && <p style={{margin:'12px 0 0',color:'#94a3b8',fontSize:'11.5px',fontStyle:'italic',lineHeight:1.6}}>{String(h.order_note)}</p>}
      {s(h.disclaimer as string)!=='—' && <p style={{margin:'6px 0 0',color:'#475569',fontSize:'11px',lineHeight:1.55}}>{String(h.disclaimer)}</p>}
    </div>
  )
}

// ── v9.1 MONTH-BY-MONTH OUTLOOK ──────────────────────────────────────────────
// route v15.0 generates monthlyOutlook[] from the gochar timeline — theme, money,
// action and avoid per month, in the client's language. v9.0 of this file was
// written BEFORE that route version existed, so seven months of real Hindi
// content sat in the DB unrendered. This is the reader-facing half of GPT's
// "next 6 months, month-wise" request; GocharTimeline above is the evidence half.
interface MOut { month?:string; theme?:string; money?:string; action?:string; avoid?:string }
function MonthlyOutlook({ rows, lang }:{ rows:MOut[]; lang:Lang }) {
  const list = rows.filter(r => s(r?.month as string)!=='—')
  if (list.length===0) return null
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.15)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('monthly',lang)}</p>
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {list.map((r,i)=>(
          <div key={i} style={{padding:'13px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'9px',flexWrap:'wrap',marginBottom:'7px'}}>
              <span style={{color:'#fff',fontSize:'13.5px',fontWeight:700}}>{s(r.month as string)}</span>
              {s(r.theme as string)!=='—' && <span style={{padding:'3px 9px',borderRadius:'7px',background:G(0.1),border:`1px solid ${G(0.22)}`,color:GOLD,fontSize:'11.5px',fontWeight:600}}>{s(r.theme as string)}</span>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
              {s(r.money as string)!=='—'  && <p style={{margin:0,color:'#cbd5e1',fontSize:'12.5px',lineHeight:1.6}}>💰 <span style={{color:'#64748b'}}>{lbl('mMoney',lang)}:</span> {s(r.money as string)}</p>}
              {s(r.action as string)!=='—' && <p style={{margin:0,color:'#86efac',fontSize:'12.5px',lineHeight:1.6}}>✓ <span style={{color:'#64748b'}}>{lbl('mAction',lang)}:</span> {s(r.action as string)}</p>}
              {s(r.avoid as string)!=='—'  && <p style={{margin:0,color:'#fca5a5',fontSize:'12.5px',lineHeight:1.6}}>✗ <span style={{color:'#64748b'}}>{lbl('mAvoid',lang)}:</span> {s(r.avoid as string)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── v10.2 PAYWALL LEAK FIX (06 Sep 2026) ────────────────────────────────────
// Two places in the FREE report were handing over the paid finding.
//
//   1. EvidenceTable's cut-off printed the names of the withheld houses:
//      "…2 aur bhav — 11th house, 12th house → ₹51". With the planet table
//      sitting directly above it, naming the houses lets the reader work out
//      the lords themselves. Now only the count is shown.
//
//   2. LockedTeaser's repeated-lord line printed the planet, its dignity, and
//      declared it the root cause: "…dono ka swami ek hi grah hai: Saturn, aur
//      woh neech ka hai. Yahi aapki sthiti ki sabse badi jad hai." That IS the
//      answer the ₹51 reading is sold on. It now states the SHAPE of the
//      finding — two houses, one lord, and that lord's condition is the root —
//      without naming which houses or which planet.
//
// Nothing else changed: the vargottama, best-month and Bhrigu teasers already
// withheld their consequence and were left as they were.
//
// ── v9.3 PAYWALL TEASER ──────────────────────────────────────────────────────
// v9.0-9.2 added evidence, D9, gochar, Bhrigu and remedy levels but gated NONE of
// them, while the ₹51 lock box went on promising "Complete planetary analysis",
// "Bhrigu Nandi pattern insights" and "Chart evidence — house lords + Shadbala"
// — all of which the free reader could already read on the same page. Free tier
// now sees enough to know the chart was genuinely read; the depth stays paid.
function LockedTeaser({ lines, slug, lang }:{ lines:string[]; slug:string; lang:Lang }) {
  if (lines.length===0) return null
  return (
    <div style={{background:`linear-gradient(135deg,${G(0.1)},rgba(8,11,18,0.9))`,border:`1px solid ${G(0.35)}`,borderRadius:'14px',padding:'18px',marginBottom:'14px'}}>
      <p style={{margin:'0 0 10px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em'}}>{lbl('lockedMore',lang)}</p>
      <div style={{display:'flex',flexDirection:'column',gap:'9px',marginBottom:'14px'}}>
        {lines.map((l,i)=>(
          <p key={i} style={{margin:0,color:'#e2e8f0',fontSize:'13px',lineHeight:1.7}}>{l}</p>
        ))}
      </div>
      <Link href={`/upgrade?slug=${slug}&tier=basic`} style={{display:'inline-block',padding:'12px 24px',borderRadius:'10px',background:`linear-gradient(135deg,${GOLD},#F5D76E,${GOLD})`,color:'#080B12',fontSize:'14px',fontWeight:700,textDecoration:'none',boxShadow:`0 0 24px ${G(0.35)}`}}>
        {lbl('unlock51',lang)}
      </Link>
    </div>
  )
}

// ── v10.0 INLINE CLIFFHANGER ─────────────────────────────────────────────────
// A section that simply STOPS reads as "the free version is complete". A section
// that stops mid-sentence reads as "there is more, and it is about me". This
// short line closes each free section on an open question rather than a full stop.
function Cliff({ text, slug }:{ text:string; slug:string }) {
  return (
    <Link href={`/upgrade?slug=${slug}&tier=basic`} style={{display:'block',marginTop:'10px',padding:'10px 13px',borderRadius:'9px',background:G(0.07),border:`1px dashed ${G(0.3)}`,color:GOLD,fontSize:'12.5px',fontWeight:600,textDecoration:'none',lineHeight:1.6}}>
      {text} <span style={{opacity:0.85}}>→ ₹51</span>
    </Link>
  )
}

function PDFBtn() {
  const handle = () => {
    const st = document.createElement('style'); st.id='tv-print'
    st.textContent=`@media print {nav,footer,.site-nav,.site-footer,.no-print{display:none!important}body{background:#fff!important}*{color:#000!important;border-color:#ccc!important;background:transparent!important}}`
    document.head.appendChild(st); window.print()
    setTimeout(()=>{const e=document.getElementById('tv-print');if(e)e.remove()},1500)
  }
  return (<button onClick={handle} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 18px',borderRadius:'10px',background:G(0.08),border:`1px solid ${G(0.25)}`,color:GOLD,fontSize:'13px',fontWeight:600,cursor:'pointer'}}><Download size={14}/>PDF Download</button>)
}

// ─── STICKY UPGRADE BAR — v8.3 NEW (free tier only) ──────────────────────────
// The LockedSection sits far down the page; free users often bounce before
// reaching it. This slim bar keeps the ₹51 unlock visible at all times.

function StickyUpgradeBar({slug}:{slug:string}) {
  return (
    <div
      className="no-print"
      style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:50,
        background:'rgba(8,11,18,0.97)',
        borderTop:`1px solid ${G(0.35)}`,
        backdropFilter:'blur(12px)',
        padding:'10px 14px',
        boxShadow:`0 -8px 30px rgba(0,0,0,0.5)`,
      }}
    >
      <div style={{maxWidth:'700px',margin:'0 auto',display:'flex',alignItems:'center',gap:'12px',justifyContent:'space-between'}}>
        <div style={{minWidth:0}}>
          <p style={{margin:0,color:'#fff',fontSize:'13px',fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Trikaal ne aur bhi dekha hai 🔱</p>
          <p style={{margin:0,color:'#94a3b8',fontSize:'11px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>900-word analysis · 5 upay · exact dates</p>
        </div>
        <Link
          href={`/upgrade?slug=${slug}&tier=basic`}
          style={{
            flexShrink:0,
            padding:'11px 20px', borderRadius:'10px',
            background:`linear-gradient(135deg,${GOLD},#F5D76E,${GOLD})`,
            color:'#080B12', fontSize:'13px', fontWeight:700,
            textDecoration:'none', whiteSpace:'nowrap',
            boxShadow:`0 0 22px ${G(0.4)}`,
          }}
        >
          🔓 Unlock — ₹51
        </Link>
      </div>
    </div>
  )
}

// ─── MAA SHAKTI DAKSHINA — v8.1 RAZORPAY ─────────────────────────────────────

// ─── 5 UPAY CARDS — v8.3 (slug prop added, upsell link fixed) ────────────────

function UpayCards({ remedies, isPaid, slug, lang }: { remedies: UpayItem[]; isPaid: boolean; slug: string; lang: Lang }) {
  // v10.0: free showed three complete upay — mantra, both gemstones, vrat, yantra
  // and prasad. A reader with a full mantra AND two gemstone prescriptions has
  // what they came for. Free now sees the mantra only.
  const visibleCount = isPaid ? 5 : 1
  const visible = remedies.slice(0, visibleCount)

  const UPAY_CONFIG = [
    { type: 'mantra',   icon: '🕉️', label: 'Mantra Sadhana',    color: '#60a5fa' },
    { type: 'gemstone', icon: '💎', label: 'Ratna Therapy',      color: '#f472b6' },
    { type: 'vrat',     icon: '🪔', label: 'Vrat aur Upasana',   color: GOLD      },
    { type: 'dana',     icon: '🌾', label: 'Dana aur Seva',       color: '#34d399' },
    { type: 'special',  icon: '🔱', label: 'Vishesh Upay',       color: '#a78bfa' },
  ]

  return (
    <div style={{ background: BG_CARD, border: `1px solid ${G(0.12)}`, borderRadius: '16px', padding: '22px', marginBottom: '14px' }}>
      <p style={{ margin: '0 0 16px', color: GOLD, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {lbl('upayTitle',lang)}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {visible.map((upay, i) => {
          const cfg = UPAY_CONFIG.find(c => c.type === upay.type) ?? UPAY_CONFIG[0]!
          return (
            <div key={i} style={{ padding: '14px', background: `${cfg.color}08`, border: `1px solid ${cfg.color}25`, borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>{cfg.icon}</span>
                <div>
                  <p style={{ margin: 0, color: cfg.color, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Upay {upay.upay_number} — {cfg.label}
                  </p>
                  {upay.planet && <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '11px' }}>Planet: {upay.planet}</p>}
                </div>
              </div>

              {upay.type === 'mantra' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p style={{ margin: 0, color: '#e2e8f0', fontSize: '14px', fontWeight: 600, fontFamily: 'Georgia,serif' }}>{upay.mantra}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {upay.count && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>🔢 {upay.count}</span>}
                    {upay.time  && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>⏰ {upay.time}</span>}
                    {upay.day   && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>📅 {upay.day}</span>}
                  </div>
                  {upay.focus   && <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>🎯 Focus: {upay.focus}</p>}
                  {upay.special && <p style={{ margin: '2px 0 0', color: GOLD, fontSize: '12px', fontStyle: 'italic' }}>✨ {upay.special}</p>}
                </div>
              )}

              {upay.type === 'gemstone' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upay.lagna_stone && (
                    <div style={{ padding: '10px 12px', background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 4px', color: '#f472b6', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>💍 {upay.lagna_stone.for}</p>
                      <p style={{ margin: '0 0 4px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>{upay.lagna_stone.stone}</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>
                        {upay.lagna_stone.metal} · {upay.lagna_stone.finger} · {upay.lagna_stone.day}
                      </p>
                      {upay.lagna_stone.note && <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>{upay.lagna_stone.note}</p>}
                    </div>
                  )}
                  {upay.dasha_stone && (
                    <div style={{ padding: '10px 12px', background: 'rgba(212,175,55,0.06)', border: `1px solid ${G(0.2)}`, borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 4px', color: GOLD, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>⚡ {upay.dasha_stone.for}</p>
                      <p style={{ margin: '0 0 2px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>{upay.dasha_stone.stone}</p>
                      <p style={{ margin: '0 0 2px', color: '#94a3b8', fontSize: '11px' }}>
                        {upay.dasha_stone.metal} · {upay.dasha_stone.finger} · {upay.dasha_stone.day}
                      </p>
                      {upay.dasha_stone.substitute && <p style={{ margin: '2px 0', color: '#64748b', fontSize: '11px' }}>Substitute: {upay.dasha_stone.substitute}</p>}
                      {upay.dasha_stone.note && <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>{upay.dasha_stone.note}</p>}
                    </div>
                  )}
                </div>
              )}

              {upay.type === 'vrat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {upay.name   && <span style={{ padding: '4px 10px', borderRadius: '6px', background: `${GOLD}15`, color: GOLD, fontSize: '12px', fontWeight: 600 }}>{upay.name}</span>}
                    {upay.day    && <span style={{ padding: '4px 10px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '12px' }}>📅 {upay.day}</span>}
                    {upay.deity  && <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontSize: '12px' }}>🙏 {upay.deity}</span>}
                  </div>
                  {upay.prasad  && <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>🌸 Prasad: {upay.prasad}</p>}
                  {upay.yantra  && <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '12px' }}>🔯 Yantra: {upay.yantra} — {upay.yantra_placement}</p>}
                  {upay.special && <p style={{ margin: '4px 0 0', color: GOLD, fontSize: '12px', fontStyle: 'italic' }}>✨ {upay.special}</p>}
                </div>
              )}

              {upay.type === 'dana' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {upay.items    && <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px' }}>🌾 {upay.items}</p>}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {upay.day       && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>📅 {upay.day}</span>}
                    {upay.recipient && <span style={{ padding: '3px 8px', borderRadius: '6px', background: `${cfg.color}15`, color: cfg.color, fontSize: '11px' }}>👤 {upay.recipient}</span>}
                  </div>
                  {upay.note && <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '11px', fontStyle: 'italic' }}>{upay.note}</p>}
                </div>
              )}

              {upay.type === 'special' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {upay.text    && <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: 1.6 }}>{upay.text}</p>}
                  {upay.focus   && <p style={{ margin: '4px 0 0', color: '#a78bfa', fontSize: '12px' }}>🎯 Focus: {upay.focus}</p>}
                  {upay.timing  && <p style={{ margin: '2px 0 0', color: GOLD, fontSize: '11px' }}>⏰ {upay.timing}</p>}
                  {upay.blessing && <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>{upay.blessing}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!isPaid && remedies.length > visibleCount && (
        <div style={{ marginTop: '12px', padding: '12px', background: G(0.06), border: `1px solid ${G(0.2)}`, borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', color: GOLD, fontSize: '12px', fontWeight: 600 }}>{lbl('tzUpay',lang)}</p>
          {/* v8.3 FIX-1: was href="/" (homepage — user had to refill the form). Now goes straight to upgrade. */}
          <Link href={`/upgrade?slug=${slug}&tier=basic`} style={{ color: GOLD, fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>⚡ Get Full Reading — ₹51</Link>
        </div>
      )}

      <p style={{ margin: '12px 0 0', color: '#475569', fontSize: '11px' }}>
        All remedies from Brihat Parashara Hora Shastra · Swiss Ephemeris precision · Rohiit Gupta, Chief Vedic Architect
      </p>
    </div>
  )
}

// ─── LOCKED SECTION — v8.3 PERSONALIZED ──────────────────────────────────────

function LockedSection({slug, mahadasha, domainLabel, lang}:{slug:string; mahadasha:string; domainLabel:string; lang:Lang}) {
  // v9.3: this list used to promise things the free page already showed —
  // "Complete planetary analysis", "Bhrigu Nandi pattern insights", "Chart
  // evidence — house lords + Shadbala". A reader who had just read all three had
  // no reason to pay. Every line below is now something genuinely withheld.
  const features = ['f1','f2','f3','f4','f5','f6','f7','f8'].map(k=>lbl(k,lang))
  // v8.3 FIX-3: teaser personalized with the user's own dasha + domain
  const hasMd = mahadasha && mahadasha !== '—'
  const teaserLine = lang==='english'
    ? (hasMd ? `In your ${mahadasha} Mahadasha, Trikaal has seen more about ${domainLabel}...`
             : `Trikaal has seen more about ${domainLabel}...`)
    : lang==='hindi'
    ? (hasMd ? `आपकी ${mahadasha} महादशा में ${domainLabel} को लेकर त्रिकाल ने और भी देखा है...`
             : `${domainLabel} को लेकर त्रिकाल ने और भी देखा है...`)
    : (hasMd ? `Aapki ${mahadasha} Mahadasha mein ${domainLabel} ko lekar Trikaal ne kuch aur bhi dekha hai...`
             : `${domainLabel} ko lekar Trikaal ne kuch aur bhi dekha hai...`)
  return (
    <div style={{position:'relative',borderRadius:'16px',overflow:'hidden',marginBottom:'16px',border:`1px solid ${G(0.15)}`}}>
      <div style={{padding:'20px',filter:'blur(5px)',pointerEvents:'none',userSelect:'none',background:BG_CARD}}>
        <p style={{color:GOLD,fontSize:'12px',fontWeight:700,marginBottom:'8px',textTransform:'uppercase'}}>📊 Complete Analysis</p>
        <p style={{color:'#e2e8f0',fontSize:'14px',margin:'0 0 8px'}}>{lbl('lockTease',lang)}</p>
        <p style={{color:'#22c55e',fontSize:'12px',fontWeight:600}}>💎 Gemstone + 4 Action Windows...</p>
      </div>
      <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',background:'linear-gradient(to bottom,rgba(8,11,18,0.1) 0%,rgba(8,11,18,0.98) 28%)'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'50%',background:G(0.1),border:`1px solid ${G(0.35)}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <Lock size={22} style={{color:GOLD}}/>
          </div>
          <p style={{margin:'0 0 4px',color:'#fff',fontSize:'18px',fontWeight:700,fontFamily:'Georgia,serif'}}>{lbl('lockTitle',lang)}</p>
          <p style={{margin:'0 0 14px',color:'#94a3b8',fontSize:'13px',lineHeight:1.6,maxWidth:'300px'}}>{teaserLine} {lbl('lockTease',lang)}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'18px',maxWidth:'340px',margin:'0 auto 18px',textAlign:'left'}}>
            {features.map((f,i)=>(<p key={i} style={{margin:0,color:'#94a3b8',fontSize:'12px',lineHeight:1.5}}>{f}</p>))}
          </div>
          <Link href={`/upgrade?slug=${slug}&tier=basic`} style={{display:'block',padding:'15px 36px',borderRadius:'12px',background:`linear-gradient(135deg,${GOLD},#F5D76E,${GOLD})`,color:'#080B12',fontSize:'15px',fontWeight:700,textDecoration:'none',boxShadow:`0 0 30px ${G(0.4)}`,marginBottom:'10px'}}>
            {lbl('lockCta',lang)}
          </Link>
          <p style={{margin:'6px 0 0',color:'#475569',fontSize:'11px'}}>{lbl('lockSub',lang)}</p>
        </div>
      </div>
    </div>
  )
}

function PaidFullSummary({ summaryText, periodSummary, bestDates, dosList, dontsList, remedyHint, karmicInsight, lang }: {
  summaryText:string; periodSummary:string; bestDates:string;
  dosList:string[]; dontsList:string[]; remedyHint:string; karmicInsight:string; lang:Lang;
}) {
  return (
    <div style={{background:BG_CARD,border:`1px solid ${G(0.2)}`,borderRadius:'16px',padding:'24px',marginBottom:'14px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
        <Sparkles size={16} style={{color:GOLD}}/>
        <p style={{margin:0,color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('premium',lang)}</p>
      </div>
      {summaryText && summaryText!=='—' && (
        <div style={{background:G(0.05),border:`1px solid ${G(0.15)}`,borderRadius:'12px',padding:'18px',marginBottom:'16px'}}>
          <p style={{margin:0,color:'#e2e8f0',fontSize:'14px',lineHeight:1.9,whiteSpace:'pre-line'}}>{summaryText}</p>
        </div>
      )}
      {periodSummary && periodSummary!=='—' && (
        <div style={{padding:'14px',background:'rgba(96,165,250,0.06)',border:'1px solid rgba(96,165,250,0.2)',borderRadius:'10px',marginBottom:'12px'}}>
          <p style={{margin:'0 0 4px',color:'#60a5fa',fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>{lbl('dashaArth',lang)}</p>
          <p style={{margin:0,color:'#bfdbfe',fontSize:'13px',lineHeight:1.6}}>{periodSummary}</p>
        </div>
      )}
      {bestDates && bestDates!=='—' && (
        <div style={{padding:'14px',background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'10px',marginBottom:'12px'}}>
          <p style={{margin:'0 0 4px',color:'#22c55e',fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>{lbl('shubhDates',lang)}</p>
          <p style={{margin:0,color:'#86efac',fontSize:'13px',lineHeight:1.6}}>{bestDates}</p>
        </div>
      )}
      {(dosList.length>0||dontsList.length>0) && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          {dosList.length>0 && (
            <div>
              <p style={{margin:'0 0 10px',color:'#22c55e',fontSize:'11px',fontWeight:700,textTransform:'uppercase'}}>{lbl('kyaKarein',lang)}</p>
              {dosList.map((d,i)=>(<div key={i} style={{display:'flex',gap:'8px',marginBottom:'8px'}}><span style={{color:'#22c55e',fontSize:'12px',flexShrink:0}}>✓</span><p style={{margin:0,color:'#e2e8f0',fontSize:'13px',lineHeight:1.5}}>{d}</p></div>))}
            </div>
          )}
          {dontsList.length>0 && (
            <div>
              <p style={{margin:'0 0 10px',color:'#ef4444',fontSize:'11px',fontWeight:700,textTransform:'uppercase'}}>{lbl('kyaNaKarein',lang)}</p>
              {dontsList.map((d,i)=>(<div key={i} style={{display:'flex',gap:'8px',marginBottom:'8px'}}><span style={{color:'#ef4444',fontSize:'12px',flexShrink:0}}>✗</span><p style={{margin:0,color:'#e2e8f0',fontSize:'13px',lineHeight:1.5}}>{d}</p></div>))}
            </div>
          )}
        </div>
      )}
      {remedyHint && remedyHint!=='—' && (
        <div style={{padding:'14px',background:G(0.06),border:`1px solid ${G(0.2)}`,borderRadius:'10px',marginBottom:'12px'}}>
          <p style={{margin:'0 0 4px',color:GOLD,fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>{lbl('upayHint',lang)}</p>
          <p style={{margin:0,color:'#fde68a',fontSize:'13px',lineHeight:1.6}}>{remedyHint}</p>
        </div>
      )}
      {karmicInsight && karmicInsight!=='—' && (
        <div style={{padding:'14px',background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'10px'}}>
          <p style={{margin:'0 0 4px',color:'#a78bfa',fontSize:'10px',fontWeight:700,textTransform:'uppercase'}}>{lbl('karmic',lang)}</p>
          <p style={{margin:0,color:'#c4b5fd',fontSize:'13px',lineHeight:1.6}}>{karmicInsight}</p>
        </div>
      )}
    </div>
  )
}

export default function ReportPublicClient({report,slug,meta}:ReportPublicClientProps) {
  const domainLabel = s(report.domain_label,'Vedic Reading')
  const birthCity   = s(report.birth_city,'India')

  // ── v-fix 06 Sep 2026: SHOW THE BIRTH DATA THE CHART WAS BUILT FROM ────────
  // On 06 Sep 2026 a report was analysed in detail — chart maths verified row
  // by row, all twelve checks passing — before anyone noticed it had been
  // computed from the WRONG birth date. The header showed only
  // "New Delhi · Meena Lagna · Swati Nakshatra", so there was nothing on the
  // page to compare against. The reader could not see it and neither could we.
  //
  // The row already carries `dob`; it was simply never rendered. Showing it
  // makes a wrong entry visible in one second instead of six conversations.
  // `birth_time` exists in the `predictions` table but is NOT exposed by
  // public_report_view, so it cannot be shown until that view is altered —
  // see the SQL in the handover note. Time matters most here, because lagna
  // and nakshatra both hinge on it.
  const birthDob = (() => {
    const raw = s(report.dob, '')
    if (!raw || raw === '—') return null
    const d = new Date(raw)
    if (isNaN(d.getTime())) return raw            // show whatever is stored
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  })()
  const birthTime = s((report as Record<string, unknown>).birth_time as string, '')
  const birthLine = [birthDob, (birthTime && birthTime !== '—') ? birthTime : null, birthCity]
    .filter(Boolean).join(' · ')
  const nakshatra   = s(report.nakshatra)
  const tier        = s(report.tier,'free')
  const isPaid      = tier==='premium'||tier==='paid'||tier==='basic'||tier==='standard'
  const pj          = safeObj(report.prediction_json)
  const lagna       = s(report.lagna)!=='—' ? s(report.lagna) : s((pj as any)?.lagnaRashi ?? (pj as any)?.lagna?.sign)
  const dashaTL     = safeObj(pj.dashaTimeline)
  const mdObj       = safeObj(dashaTL.mahadasha)
  const adObj       = safeObj(dashaTL.antardasha)
  const ptObj       = safeObj(dashaTL.pratyantar)
  // v8.4: Sookshma (L4) is not computed upstream — see the Dasha Kaal block below.
  const mahadasha   = s(mdObj.lord)!=='—'?s(mdObj.lord):s(report.mahadasha)
  const antardasha  = s(adObj.lord)!=='—'?s(adObj.lord):s(report.antardasha)
  const pratyantar  = s(ptObj.lord)
  const geoObj      = safeObj(pj.geoDirectAnswer)
  const geoText     = s(geoObj.text as string)!=='—' ? s(geoObj.text as string) : typeof pj.geoDirectAnswer==='string' ? s(pj.geoDirectAnswer as string) : s(report.geo_answer as string)
  const geoBullets  = splitGeoToBullets(geoText, isPaid, pj)
  const summaryText = s(pj.summaryText as string)!=='—' ? s(pj.summaryText as string) : s(safeObj(pj.simpleSummary).text as string)
  const keyMessage  = s(pj.keyMessage as string)!=='—' ? s(pj.keyMessage as string) : s(safeObj(pj.simpleSummary).keyMessage as string)
  const mainAction  = s(pj.mainAction as string)!=='—' ? s(pj.mainAction as string) : s(safeObj(pj.simpleSummary).mainAction as string)
  const mainCaution = s(pj.mainCaution as string)!=='—' ? s(pj.mainCaution as string) : s(safeObj(pj.simpleSummary).mainCaution as string)
  const coreMessage = s(pj.coreMessage as string)
  const doAction    = s(pj.doAction as string)
  const avoidAction = s(pj.avoidAction as string)
  const periodSummary = s(pj.periodSummary as string)!=='—' ? s(pj.periodSummary as string) : s(safeObj(pj.simpleSummary).periodSummary as string)
  const bestDates   = s(pj.bestDates as string)!=='—' ? s(pj.bestDates as string) : s(safeObj(pj.simpleSummary).bestDates as string)
  const remedyHint  = s(pj.remedyHint as string)!=='—' ? s(pj.remedyHint as string) : s(safeObj(pj.simpleSummary).remedyHint as string)
  const karmicInsight = s(pj.karmicInsight as string)
  const dosList     = safeArr<string>(pj.dosList).length>0 ? safeArr<string>(pj.dosList) : safeArr<string>(safeObj(pj.simpleSummary).dos)
  const dontsList   = safeArr<string>(pj.dontsList).length>0 ? safeArr<string>(pj.dontsList) : safeArr<string>(safeObj(pj.simpleSummary).donts)
  const planetTable = safeArr<PlanetRow>(pj.planetTable)
  const actionWindows = safeArr<ActionWindow>(pj.actionWindows)

  const remedyPlan  = safeObj(pj.remedyPlan)
  const upayItems   = safeArr<UpayItem>(remedyPlan.remedies)
  const genRem      = safeObj(remedyPlan.general)

  const oldRemedies = safeArr<RemedyItem>(remedyPlan.remedies as any)
  const hasNewUpay  = upayItems.length > 0 && upayItems[0]?.upay_number !== undefined

  // v8.5: panchang intentionally not read — the upstream value is fabricated.

  // ── v8.4: engine evidence now forwarded by predict route v14.17 ────────────
  const chartEv     = safeObj(pj.chartEvidence) as unknown as ChartEvidence
  const whyHere     = safeObj(pj.whyYouAreHere) as unknown as WhyHere
  const evMeanings  = safeArr<{house?:number;meaning?:string}>(pj.evidenceMeanings)
  const confidence  = safeObj(pj.readingConfidence) as unknown as ReadingConfidence
  // v8.4.2: live /synthesize returns {status, enriched:{bhrigu:{signals:[...]}}}
  // — unwrap "enriched" before reading, and read signals[] rather than the
  // bhrigu_points/current_life_theme fields the repo copy suggested.
  const engineRaw   = safeObj(pj.engineSignals)
  const engineSig   = Object.keys(safeObj(engineRaw.enriched)).length
                        ? {...safeObj(engineRaw.enriched), ...engineRaw}
                        : engineRaw
  const bhriguObj   = safeObj(engineSig.bhrigu)
  const bhriguSignals = safeArr<Record<string,unknown>>(bhriguObj.signals)
    .filter(x=>typeof x?.description==='string')
    .slice(0,5)
    .map(x=>({desc:String(x.description), timing:s(x.timing as string,''), rel:x.domain_relevant===true}))
  // v8.4.1 FIX: astro.py returns yogas as OBJECTS {name, present, description},
  // not strings. v8.4 typed chartEvidence.yogas as string[] and rendered them
  // directly, which threw "Objects are not valid as a React child" and took the
  // whole report page down. Both sources are now funnelled through yogaName(),
  // and yogas explicitly marked present:false are dropped.
  const allYogas    = Array.from(new Set([
    ...safeArr<unknown>(chartEv?.yogas),
    ...safeArr<unknown>(safeObj(engineSig.parashara).yogas),
  ].map(yogaName).filter(y => y !== '')))
  const bhriguTheme = s(bhriguObj.current_life_theme as string)
  const bhriguPts   = Number(bhriguObj.bhrigu_points ?? 0) ||
    safeArr<Record<string,unknown>>(bhriguObj.signals).reduce((t,x)=>t+(Number(x?.confidence_points)||0),0)
  const hasEvidence = safeArr<EvidenceHouse>(chartEv?.houses).length > 0

  // ── v9.0 ───────────────────────────────────────────────────────────────────
  const rawLang     = s(report.language,'hinglish').toLowerCase()
  const lang: Lang  = rawLang==='hindi' ? 'hindi' : rawLang==='english' ? 'english' : 'hinglish'
  const gochar      = safeObj(pj.gocharTimeline)
  const navamsa     = safeObj(pj.navamsaChart)
  const remedyLvls  = safeObj(remedyPlan.hierarchy)
  const panchang    = safeObj(pj.panchang)     // v3.0 engine — real, or {} when unavailable
  const monthlyOut  = safeArr<MOut>(pj.monthlyOutlook)
  const navNote     = s(pj.navamsaNote as string)
  const dasamsa     = safeObj(pj.dasamsaChart)
  const dasNote     = s(pj.dasamsaNote as string)
  const bestMonth   = s(gochar.best_month as string)!=='—' ? String(gochar.best_month) : null

  // ── v10.0 SUSPENSE LINES ───────────────────────────────────────────────────
  // Each line names a real finding from THIS chart and withholds what it means.
  // A free reader cannot look any of this up; it is only in their own kundali.
  const suspenseLines: string[] = (() => {
    if (isPaid) return []
    const out: string[] = []
    const vg = safeArr<string>(navamsa.vargottama_planets)
    if (vg.length > 0) {
      out.push(lang==='hindi'
        ? `आपके नवांश में ${vg.join(', ')} वर्गोत्तम है — जन्म कुंडली और D9 दोनों में एक ही राशि। यह विशेष बल आपके लिए कब और कैसे काम करता है, वह पूरी रीडिंग में है।`
        : lang==='english'
        ? `In your D9, ${vg.join(', ')} is Vargottama — the same sign in both charts. What that rare strength does for you, and when it activates, is inside.`
        : `Aapke Navamsa mein ${vg.join(', ')} vargottama hai — janm kundali aur D9 dono mein ek hi rashi. Yeh vishesh bal aapke liye kab aur kaise kaam karta hai, woh poori reading mein hai.`)
    }
    // the repeated-lord finding is genuinely striking when it occurs
    const lords = safeArr<EvidenceHouse>(chartEv?.houses).map(h=>h.lord).filter(Boolean) as string[]
    const dup = lords.find((l,i)=>lords.indexOf(l)!==i)
    if (dup) {
      const rows = safeArr<EvidenceHouse>(chartEv?.houses).filter(h=>h.lord===dup)
      // v10.1: was hardcoded ' aur ', which leaked Hinglish into the English
      // reading — "Your 12th house aur 11th house share the SAME lord".
      const joiner = lang==='english' ? ' and ' : lang==='hindi' ? ' और ' : ' aur '
      const hs = rows.map(h=>h.factor).join(joiner)
      const dig = rows[0]?.lord_dignity
      out.push(lang==='hindi'
        ? `आपकी कुंडली में दो भाव ऐसे हैं जिनका स्वामी एक ही ग्रह है — और उस एक ग्रह की स्थिति ही आपकी पूरी स्थिति की जड़ है। कौन से भाव, कौन सा ग्रह, और उसका क्या असर है — वह पूरी रीडिंग में है।`
        : lang==='english'
        ? `Two houses in your chart share the SAME lord — and the condition of that one planet is the root of your situation. Which houses, which planet, and what it means, is inside.`
        : `Aapki kundali mein do bhaav aise hain jinka swami ek hi grah hai — aur us ek grah ki sthiti hi aapki poori sthiti ki jad hai. Kaunse bhaav, kaunsa grah, aur uska kya asar hai — woh poori reading mein hai.`)
    }
    if (bestMonth) {
      out.push(lang==='hindi'
        ? `${bestMonth} आपका सबसे सहायक महीना है — लेकिन उससे पहले के महीनों में क्या सँभालना है, और उस महीने में ठीक क्या करना है, वह अंदर है।`
        : lang==='english'
        ? `${bestMonth} is your most supportive month — but what to protect before it, and exactly what to do during it, is inside.`
        : `${bestMonth} aapka sabse sahaayak mahina hai — lekin usse pehle ke mahino mein kya sambhalna hai, aur us mahine mein theek kya karna hai, woh andar hai.`)
    }
    if (bhriguSignals.length > 0) {
      const activeN = bhriguSignals.filter(x=>/active/i.test(x.timing)).length
      out.push(lang==='hindi'
        ? `भृगु नंदी नाड़ी ने आपकी कुंडली में ${bhriguSignals.length} संकेत पकड़े${activeN?`, जिनमें ${activeN} अभी सक्रिय है`:''} — वे क्या कह रहे हैं, वह पूरी रीडिंग में खुलता है।`
        : lang==='english'
        ? `Bhrigu Nandi Nadi found ${bhriguSignals.length} signals in your chart${activeN?`, ${activeN} of them active right now`:''} — what they say opens in the full reading.`
        : `Bhrigu Nandi Nadi ne aapke chart mein ${bhriguSignals.length} signal pakde${activeN?`, jinme se ${activeN} abhi active hai`:''} — woh kya keh rahe hain, woh poori reading mein khulta hai.`)
    }
    return out.slice(0, 4)
  })()
  const cautionMon  = s(gochar.caution_month as string)!=='—' ? String(gochar.caution_month) : null
  const hasSummaryText = summaryText!=='—'
  const hasCoreMessage = coreMessage!=='—'
  const hasDoAvoid     = doAction!=='—'||avoidAction!=='—'
  const hasKeyMessage  = keyMessage!=='—'

  return (
    <div style={{minHeight:'100vh',background:BG_DARK}}>
      <SiteNav/>
      {/* v8.3: extra bottom padding for free tier so StickyUpgradeBar never covers content */}
      <main style={{paddingTop:'96px',paddingBottom:isPaid?'80px':'150px',padding:isPaid?'96px 16px 80px':'96px 16px 150px'}}>
        <div style={{maxWidth:'700px',margin:'0 auto'}}>

          <nav aria-label="breadcrumb" style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'20px'}}>
            <Link href="/" style={{color:'#64748b',fontSize:'13px',textDecoration:'none'}}>Home</Link>
            <span style={{color:'#334155'}}>›</span>
            <Link href="/services" style={{color:'#64748b',fontSize:'13px',textDecoration:'none'}}>Readings</Link>
            <span style={{color:'#334155'}}>›</span>
            <span style={{color:'#94a3b8',fontSize:'13px'}}>{domainLabel}</span>
          </nav>

          <div style={{background:`linear-gradient(135deg,${G(0.1)},rgba(8,11,18,0.95))`,border:`1px solid ${G(0.2)}`,borderRadius:'20px',padding:'26px 22px',marginBottom:'14px',textAlign:'center'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',marginBottom:'14px'}}>
              <div style={{height:'1px',flex:1,background:`linear-gradient(to right,transparent,${G(0.3)})`}}/>
              <span style={{color:GOLD,fontSize:'12px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',whiteSpace:'nowrap'}}>🔱 Mahakaal Ka Ashirwad</span>
              <div style={{height:'1px',flex:1,background:`linear-gradient(to left,transparent,${G(0.3)})`}}/>
            </div>
            <p style={{margin:'0 0 6px',color:G(0.6),fontSize:'12px',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase'}}>Vedic Astrology Analysis · {domainLabel}</p>
            <h1 style={{margin:'0 0 6px',color:'#fff',fontSize:'22px',fontFamily:'Georgia,serif',fontWeight:700}}>{mahadasha} Mahadasha · {antardasha} Antardasha</h1>
            <p style={{margin:'0 0 4px',color:'#94a3b8',fontSize:'14px'}}>{birthLine}</p>
            <p style={{margin:'0 0 16px',color:'#64748b',fontSize:'12.5px'}}>{lagna} Lagna · {nakshatra} Nakshatra · <span style={{color:'#475569'}}>ye vivaran galat ho to reading dobara banayein</span></p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',justifyContent:'center',marginBottom:'12px'}}>
              {[{icon:'⚡',label:'Swiss Ephemeris',color:'#60a5fa'},{icon:'📖',label:'BPHS Classical',color:'#a78bfa'},{icon:'🔮',label:'Bhrigu Nandi',color:'#f472b6'},{icon:'⚖️',label:'Shadbala',color:'#34d399'}].map(b=>(<span key={b.label} style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'5px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:600,background:`${b.color}15`,border:`1px solid ${b.color}30`,color:b.color}}>{b.icon} {b.label}</span>))}
            </div>
            {geoBullets.length>0 && (
              <div style={{background:G(0.06),border:`1px solid ${G(0.15)}`,borderRadius:'14px',padding:'16px',marginTop:'14px',textAlign:'left'}}>
                <p style={{margin:'0 0 12px',color:G(0.65),fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('vedicAnalysis',lang)} {isPaid && <span style={{color:G(0.4),marginLeft:'8px',fontSize:'10px'}}>({geoBullets.length} insights)</span>}</p>
                <ul style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:'10px'}}>
                  {geoBullets.map((pt,i)=>(<li key={i} style={{display:'flex',gap:'10px',alignItems:'flex-start'}}><span style={{color:GOLD,fontSize:'14px',flexShrink:0,marginTop:'2px'}}>{['🔱','✦','◆','▸','🪐','✧','🔮','⚡','🌟','🕉️'][i%10]}</span><p style={{margin:0,color:'#e2e8f0',fontSize:'14px',lineHeight:1.8}}>{pt.replace(/^[.!?,;\s]+/,'').trim()}</p></li>))}
                </ul>
                <p style={{margin:'12px 0 0',color:'#475569',fontSize:'11px'}}>By Rohiit Gupta, Chief Vedic Architect · trikalvaani.com</p>
              </div>
            )}
          </div>

          {!isPaid && (hasCoreMessage||hasKeyMessage||hasDoAvoid) && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('sandesh',lang)}</p>
              {(hasCoreMessage||hasKeyMessage) && (
                <div style={{background:`linear-gradient(135deg,${G(0.12)},${G(0.04)})`,border:`1px solid ${G(0.3)}`,borderRadius:'10px',padding:'14px 16px',marginBottom:'12px'}}>
                  <p style={{margin:'0 0 4px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase'}}>{lbl('coreMsg',lang)}</p>
                  <p style={{margin:0,color:'#fff',fontSize:'15px',fontWeight:600,fontFamily:'Georgia,serif',lineHeight:1.6}}>{hasCoreMessage?coreMessage:keyMessage}</p>
                </div>
              )}
              {hasDoAvoid && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  {(doAction!=='—'||mainAction!=='—') && (<div style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'10px',padding:'13px'}}><p style={{margin:'0 0 5px',color:'#22c55e',fontSize:'10px',fontWeight:700}}>{lbl('doNow',lang)}</p><p style={{margin:0,color:'#86efac',fontSize:'13px',lineHeight:1.5}}>{doAction!=='—'?doAction:mainAction}</p></div>)}
                  {(avoidAction!=='—'||mainCaution!=='—') && (<div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'13px'}}><p style={{margin:'0 0 5px',color:'#ef4444',fontSize:'10px',fontWeight:700}}>{lbl('avoidNow',lang)}</p><p style={{margin:0,color:'#fca5a5',fontSize:'13px',lineHeight:1.5}}>{avoidAction!=='—'?avoidAction:mainCaution}</p></div>)}
                </div>
              )}
              {hasSummaryText && (<div style={{marginTop:'14px',paddingTop:'14px',borderTop:`1px solid rgba(255,255,255,0.06)`}}><p style={{margin:0,color:'#94a3b8',fontSize:'13px',lineHeight:1.8,whiteSpace:'pre-line'}}>{summaryText}</p></div>)}
            </div>
          )}

          {/* v9.0: the answer comes FIRST. Engine badges and credentials used to
              occupy the top of the page while the client's actual question was
              answered two screens down. */}
          <VerdictCard lang={lang} coreMsg={hasCoreMessage?coreMessage:keyMessage}
            mahadasha={mahadasha} antardasha={antardasha} pratyantar={pratyantar}
            best={bestMonth} caution={cautionMon} conf={confidence}
            doNow={doAction!=='—'?doAction:mainAction} avoidNow={avoidAction!=='—'?avoidAction:mainCaution}/>

          {/* v8.4: "why you are here" sits high — recognition builds trust before
              the client is asked to absorb any planetary detail. */}
          <WhyYouAreHere why={whyHere} activation={chartEv?.activation} lang={lang}/>

          {isPaid && <PaidFullSummary summaryText={summaryText} periodSummary={periodSummary} bestDates={bestDates} dosList={dosList} dontsList={dontsList} remedyHint={remedyHint} karmicInsight={karmicInsight} lang={lang}/>}

          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px',marginBottom:'14px'}}>
            {[{label:'Lagna',value:lagna},{label:'Nakshatra',value:nakshatra},{label:'Mahadasha',value:mahadasha},{label:'Antardasha',value:antardasha}].map(({label,value})=>(<div key={label} style={{padding:'11px 14px',borderRadius:'10px',background:G(0.08),border:`1px solid ${G(0.2)}`,textAlign:'center'}}><p style={{margin:'0 0 3px',color:G(0.6),fontSize:'10px',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>{label}</p><p style={{margin:0,color:'#fff',fontSize:'14px',fontWeight:700}}>{value}</p></div>))}
          </div>

          {planetTable.length>0&&lagna!=='—'&&(
            <div style={{background:BG_CARD,border:`1px solid ${G(0.15)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('janmaKundali',lang)}</p>
              <KundaliChart lagna={lagna} planets={planetTable}/>
              <p style={{textAlign:'center',color:'#64748b',fontSize:'11px',margin:'10px 0 0'}}>Lahiri Ayanamsha · Swiss Ephemeris · BPHS classical</p>
            </div>
          )}

          {planetTable.length>0&&(
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('grahaVish',lang)}</p>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'13px'}}>
                  <thead><tr style={{borderBottom:`1px solid ${G(0.15)}`}}>{['Graha','Rashi','House','Nakshatra','Dignity','Strength'].map(h=>(<th key={h} style={{padding:'9px 6px',color:GOLD,fontWeight:600,textAlign:'left',fontSize:'11px',letterSpacing:'0.06em',textTransform:'uppercase'}}>{h}</th>))}</tr></thead>
                  <tbody>
                    {planetTable.map((p,i)=>{
                      // v8.4: Rahu/Ketu carry no Shadbala — show "—", never a dot
                      // implying a measured strength that was never computed.
                      const hasSb = typeof p.shadbala==='number' && p.strength
                      const sc=!hasSb?'#64748b':p.strength==='Very Strong'?'#22c55e':p.strength==='Strong'?'#86efac':p.strength==='Moderate'?GOLD:'#ef4444'
                      const sd=!hasSb?'':p.strength==='Very Strong'?'●●':p.strength==='Strong'?'●':p.strength==='Moderate'?'◐':'○'
                      return (<tr key={p.planet} style={{borderBottom:'1px solid rgba(255,255,255,0.04)',background:i%2===0?G(0.02):'transparent'}}><td style={{padding:'11px 6px',color:'#fff',fontWeight:600}}><span style={{color:GOLD,marginRight:'5px'}}>{PLANET_GLYPH[p.planet]??'✦'}</span>{p.planet_hi||PLANET_HI[p.planet]||p.planet}{p.retrograde&&<span style={{color:'#f59e0b',fontSize:'10px',marginLeft:'4px'}}>® Vakri</span>}</td><td style={{padding:'11px 6px',color:'#e2e8f0'}}>{p.rashi}</td><td style={{padding:'11px 6px',color:'#e2e8f0'}}>{ordinal(p.house)}</td><td style={{padding:'11px 6px',color:'#94a3b8',fontSize:'12px'}}>{p.nakshatra}</td><td style={{padding:'11px 6px',color:'#94a3b8',fontSize:'12px'}}>{p.dignity}</td><td style={{padding:'11px 6px'}}><span style={{color:sc,fontSize:'12px',fontWeight:700}}>{hasSb?<>{sd} {p.strength}{isPaid && <span style={{color:'#64748b',fontWeight:500}}> ({p.shadbala.toFixed(2)})</span>}</>:'—'}</span></td></tr>)
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{margin:'10px 0 0',color:'#475569',fontSize:'11px'}}>⚖️ Shadbala classical 6-component system (BPHS Ch.27) · Swiss Ephemeris</p>
            </div>
          )}

          {/* v8.4: evidence, yogas/Bhrigu and confidence sit right after the planet
              table — the client reads the chart, then immediately reads why it
              matters for them, before the dasha timeline. */}
          {isPaid && Object.keys(navamsa).length>0 && <NavamsaCard nv={navamsa} lang={lang} note={navNote}/>}
          {isPaid && Object.keys(dasamsa).length>0 && <DasamsaCard ds={dasamsa} lang={lang} note={dasNote}/>}

          {hasEvidence && <EvidenceTable ev={chartEv} meanings={evMeanings} lang={lang} isPaid={isPaid} slug={slug}/>}
          {isPaid && <EngineSignals yogas={allYogas} bhriguTheme={bhriguTheme} bhriguPoints={bhriguPts} signals={bhriguSignals} lang={lang}/>}
          {Object.keys(gochar).length>0 && <GocharTimeline g={gochar} lang={lang} isPaid={isPaid} slug={slug}/>}
          {isPaid && <MonthlyOutlook rows={monthlyOut} lang={lang}/>}

          {/* v10.0: the v9.3 teaser was a FEATURE LIST — "Navamsa (D9)", "Shadbala
              score" — which reads like a spec sheet and creates no pull. These
              lines instead state something TRUE and SPECIFIC about this person's
              own chart and stop halfway. The facts come straight from the engine,
              so nothing is invented; only the consequence is withheld. */}
          {!isPaid && (
            <LockedTeaser slug={slug} lang={lang} lines={suspenseLines}/>
          )}
          <ConfidenceCard c={confidence} lang={lang}/>

          <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
            <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('dashaKaal',lang)}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {/* v8.4: Sookshma (L4) removed. astro.py's _vimshottari() nests only three
                  levels — maha, antar, pratyantar — so L4 was never computed. The old
                  template engine hardcoded "Venus" for it, meaning every client saw the
                  same fake Sookshma lord. An absent level is better than an invented one. */}
              {[{label:'Mahadasha',lord:mahadasha,color:'#60a5fa',lv:'L1'},{label:'Antardasha',lord:antardasha,color:'#a78bfa',lv:'L2'},{label:'Pratyantar',lord:pratyantar,color:GOLD,lv:'L3'}].map(({label,lord,color,lv})=>(<div key={label} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.06)'}}><div style={{width:'30px',height:'30px',borderRadius:'50%',background:`${color}20`,border:`1px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color,fontSize:'11px',fontWeight:700}}>{lv}</div><div style={{flex:1}}><p style={{margin:0,color:'#64748b',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p><p style={{margin:'2px 0 0',color:'#fff',fontSize:'15px',fontWeight:700}}>{lord}</p></div></div>))}
            </div>
          </div>

          {actionWindows.length>0&&(
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('actionWin',lang)}</p>
              {/* v10.0: free sees ONE window. Two dated windows read as a finished
                  answer; one window plus "when does the next open?" does not. */}
              {(isPaid?actionWindows:actionWindows.slice(0,1)).map((w,i)=>{const hi=w.strength==='High';return(<div key={i} style={{padding:'13px',background:hi?'rgba(34,197,94,0.06)':G(0.04),border:`1px solid ${hi?'rgba(34,197,94,0.2)':G(0.15)}`,borderRadius:'10px',marginBottom:'8px'}}><div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px'}}><span style={{color:hi?'#22c55e':GOLD,fontSize:'13px',fontWeight:700}}>{hi?'🟢':'🟡'} {w.window}</span><span style={{padding:'2px 8px',borderRadius:'10px',background:hi?'rgba(34,197,94,0.15)':G(0.1),color:hi?'#22c55e':GOLD,fontSize:'11px',fontWeight:600}}>{w.strength}</span></div><p style={{margin:0,color:'#e2e8f0',fontSize:'13px',lineHeight:1.5}}>{w.reason}</p></div>)})}
              {!isPaid && actionWindows.length>1 && <Cliff slug={slug} text={lbl('tzWindow',lang)}/>}
            </div>
          )}

          {hasNewUpay ? (
            <UpayCards remedies={upayItems} isPaid={isPaid} slug={slug} lang={lang}/>
          ) : oldRemedies.length > 0 && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>🙏 Upay — Remedy Plan (BPHS Classical)</p>
              {oldRemedies.slice(0,1).map((r:any,i:number)=>(
                <div key={i} style={{display:'grid',gap:'10px'}}>
                  {[{icon:'🕉️',label:'Mantra',value:r.mantra,sub:r.count,color:'#60a5fa'},{icon:'🌾',label:'Dana',value:r.dana,sub:'As prescribed',color:'#34d399'},{icon:'🪔',label:'Vrat',value:r.vrat,sub:'Classical',color:GOLD}].map(({icon,label,value,sub,color})=>(<div key={label} style={{display:'flex',gap:'12px',padding:'13px',background:G(0.04),border:`1px solid ${G(0.12)}`,borderRadius:'10px'}}><span style={{fontSize:'24px',flexShrink:0}}>{icon}</span><div><p style={{margin:'0 0 2px',color,fontSize:'11px',fontWeight:700,textTransform:'uppercase'}}>{label}</p><p style={{margin:'0 0 2px',color:'#e2e8f0',fontSize:'13px'}}>{value}</p><p style={{margin:0,color:'#64748b',fontSize:'11px'}}>{sub}</p></div></div>))}
                </div>
              ))}
              {s(genRem.daily as string)!=='—'&&<p style={{margin:'12px 0 0',color:'#64748b',fontSize:'12px'}}>🕯️ Daily: {s(genRem.daily as string)}</p>}
            </div>
          )}

          {Object.keys(remedyLvls).length>0 && <RemedyLevels h={remedyLvls} lang={lang} isPaid={isPaid}/>}

          {/* v9.0: Panchang RESTORED — template_engine v3.0 now computes it from
              today's real Sun/Moon longitudes through the VM's panchang engine.
              The `_source` guard means the fabricated day-of-year version can
              never render again: no verified source, no section. */}
          {panchang._source==='swiss-ephemeris' && s(panchang.tithi as string)!=='—' && (
            <div style={{background:BG_CARD,border:`1px solid ${G(0.12)}`,borderRadius:'16px',padding:'22px',marginBottom:'14px'}}>
              <p style={{margin:'0 0 14px',color:GOLD,fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>{lbl('panchang',lang)}</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'10px'}}>
                {[{label:lbl('tithi',lang),value:`${s(panchang.tithi as string)}${s(panchang.tithiPaksha as string)!=='—'?` (${s(panchang.tithiPaksha as string)})`:''}`},
                  {label:lbl('vara',lang), value:s(panchang.vara as string)!=='—'?s(panchang.vara as string):s(panchang.weekday as string)},
                  {label:lbl('nak',lang),  value:s(panchang.nakshatra as string)},
                  {label:lbl('yoga',lang), value:s(panchang.yoga as string)}].map(({label,value})=>(
                  <div key={label} style={{padding:'10px',background:'rgba(255,255,255,0.03)',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.06)'}}>
                    <p style={{margin:'0 0 2px',color:'#64748b',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{label}</p>
                    <p style={{margin:0,color:'#e2e8f0',fontSize:'14px',fontWeight:600}}>{value}</p>
                  </div>))}
              </div>
              {s(panchang.rahu_kaal as string)!=='—'&&(<div style={{padding:'10px 13px',background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:'8px'}}><span style={{color:'#ef4444',fontSize:'13px',fontWeight:600}}>🕐 Rahu Kaal: </span><span style={{color:'#fca5a5',fontSize:'13px'}}>{s(panchang.rahu_kaal as string)}</span></div>)}
              <p style={{margin:'8px 0 0',color:'#475569',fontSize:'11px'}}>Swiss Ephemeris · {s(panchang._computed_for as string,'')}</p>
            </div>
          )}

          {!isPaid&&<LockedSection slug={slug} mahadasha={mahadasha} domainLabel={domainLabel} lang={lang}/>}

          {/* v10.0: MaaShakti dakshina ladder REMOVED. Two rows in the dakshina
              table since launch, both in July — it earned effectively nothing,
              while ₹101 → ₹1,08,000 sat directly under the ₹51 call to action and
              competed with it. On a free page it also asked for money before the
              reader had any reason to trust the product. The component and the
              amount arrays are deleted rather than hidden, so they cannot drift
              back in. Razorpay is untouched — it still powers the ₹51 unlock. */}

          <div style={{background:'rgba(8,14,28,0.95)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'14px',padding:'18px',marginBottom:'14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
              <div style={{width:'46px',height:'46px',borderRadius:'50%',overflow:'hidden',flexShrink:0,border:`1px solid ${G(0.35)}`,background:G(0.1)}}>
                <img src="/images/founder.png" alt="Rohiit Gupta — Chief Vedic Architect" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
              </div>
              <div>
                <p style={{margin:0,color:'#fff',fontSize:'14px',fontWeight:700}}>Rohiit Gupta</p>
                <p style={{margin:0,color:'#64748b',fontSize:'12px'}}>Chief Vedic Architect · Trikaal Vaani</p>
              </div>
            </div>
            <p style={{margin:'0 0 12px',color:'#94a3b8',fontSize:'13px',lineHeight:1.6}}>This analysis is powered by Swiss Ephemeris — the same engine used by professional astrologers worldwide — combined with Brihat Parashara Hora Shastra, Bhrigu Nandi Nadi patterns, and Shadbala calculations. Payments secured by <strong style={{color: RAZORPAY_BLUE}}>Razorpay</strong>.</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {['15+ Years Vedic Study','Parashara BPHS','Swiss Ephemeris','Razorpay Secured'].map(t=>(<span key={t} style={{padding:'4px 9px',borderRadius:'6px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color: t==='Razorpay Secured' ? RAZORPAY_BLUE : '#64748b',fontSize:'11px', fontWeight: t==='Razorpay Secured' ? 600 : 400}}>{t}</span>))}
            </div>
          </div>

          <div style={{textAlign:'center',marginBottom:'24px'}}>
            <div style={{display:'flex',gap:'10px',justifyContent:'center',flexWrap:'wrap',marginBottom:'16px'}}>
              <a href={`https://wa.me/?text=Maine%20Trikaal%20Vaani%20pe%20kundali%20padhi%20—%20bahut%20accurate!%20${encodeURIComponent('https://trikalvaani.com/report/'+slug)}`} target="_blank" rel="noopener noreferrer" style={{padding:'11px 20px',borderRadius:'10px',background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.25)',color:'#25D366',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>📱 WhatsApp Share</a>
              <PDFBtn/>
              <Link href="/" style={{padding:'11px 20px',borderRadius:'10px',background:G(0.08),border:`1px solid ${G(0.25)}`,color:GOLD,fontSize:'13px',fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:'6px'}}><ArrowLeft size={14}/>Apni Reading Karein</Link>
            </div>
            <p style={{margin:0,color:'#1e293b',fontSize:'11px',lineHeight:1.5}}>🔱 Trikaal Vaani — Kaal bada balwan hai, sabko nach nachaye<br/>trikalvaani.com · Rohiit Gupta, Chief Vedic Architect</p>
          </div>

        </div>
      </main>

      {/* v8.3 FIX-2: always-visible ₹51 unlock bar — free tier only */}
      {!isPaid && <StickyUpgradeBar slug={slug}/>}

      <SiteFooter/>
    </div>
  )
}
