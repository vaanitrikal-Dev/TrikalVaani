/**
 * ============================================================
 * TRIKAL VAANI — Gemini Lean Summary Prompt Builder
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/gemini-prompt.ts
 * VERSION: 5.0 — Template Engine Architecture
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ARCHITECTURE CHANGE v5.0:
 *   BEFORE: Gemini did EVERYTHING (8000+ token prompt → truncation)
 *   AFTER:  Gemini does ONE job — personalised summary writing
 *           Template Engine (VM) handles all Vedic analysis
 *
 * GEMINI's ONLY JOB NOW:
 *   → Read situationNote (60% weight) — what is client's pain
 *   → Read name + currentCity + employment + relationshipStatus
 *   → Read Dasha summary (3 lines from template engine)
 *   → Read confidence label
 *   → Write personalised summary as Spiritual Guru
 *   → Generate SEO/GEO signals for Google + AI search
 *
 * FREE  → Gemini 2.5 Flash  → 150-200w + SEO + suspense hook
 * PAID  → Gemini 2.5 Pro    → 400-600w + SEO + no suspense hook
 *         + Claude Sonnet 4.6 polish
 *
 * COST:
 *   Free: ~₹0.06/prediction (96% margin on free)
 *   Paid: ~₹2.08/prediction (96% margin on ₹51)
 *
 * SEO/GEO STRATEGY:
 *   Every prediction creates /report/[slug] page
 *   1000 predictions = 1000 indexed SEO pages
 *   AI search engines (Perplexity, SGE, SearchGPT) cite these
 *   This is Trikal Vaani's SEO army
 * ============================================================
 */

import type { KundaliData, BirthData } from './swiss-ephemeris';
import type { DomainConfig }           from './domain-config';
import { getCurrentPeriod }            from './domain-config';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type UserTier = 'free' | 'basic' | 'pro' | 'premium';

export interface UserContext {
  tier:                UserTier;
  language:            'hindi' | 'hinglish' | 'english';
  segment:             'genz' | 'millennial' | 'genx';
  employment:          string;
  sector:              string;
  city?:               string;
  currentCity?:        string;
  relationshipStatus?: string;
  situationNote?:      string;        // 60% weight — client's pain point
  mobile?:             string;
  businessName?:       string;
  person2Name?:        string;
  person2City?:        string;
  person2CurrentCity?: string;
  name?:               string;
}

export interface TemplateData {
  // From VM Template Engine — pre-computed Vedic analysis
  dashaOneLiner:     string;   // "Aap Jupiter MD + Rahu AD mein hain — expansion + upheaval"
  dashaQuality:      string;   // "Shubh" | "Madhyam" | "Ashubh"
  confidenceLabel:   string;   // "Strong Alignment ✓" | "Planetary Support Active" etc.
  confidenceBadge:   string;   // "High Confidence" | "Moderate Confidence" etc.
  karmicMarker:      boolean;
  karmicText?:       string;
  primaryYoga?:      string;   // "Gaja Kesari Yoga" etc.
  actionWindowHint:  string;   // "15 Jun–30 Aug 2026" — best period
  avoidWindowHint:   string;   // "1–20 Sep 2026" — avoid period
  strongPlanets:     string[]; // ["Jupiter", "Venus"]
  weakPlanets:       string[]; // ["Saturn", "Mars"]
  bhriguTheme:       string;   // "Wealth activation" etc.
  domainSignalCount: number;   // How many Bhrigu signals for this domain
}

export interface PromptOutput {
  systemPrompt: string;
  userMessage:  string;
  useSearch:    boolean;
  model:        string;   // 'gemini-2.5-flash' | 'gemini-2.5-pro'
}

// ─── SEO/GEO DOMAIN KEYWORDS — PRO SEO ARCHITECT ─────────────────────────────
// Strategy: Capture ALL 3 intent layers per domain
// Informational → Commercial → Transactional
// Target: Google SGE, Perplexity, SearchGPT, Gemini AI

const DOMAIN_SEO: Record<string, {
  // Informational keywords (top of funnel — blog/GEO content)
  informational: string[];
  // Commercial keywords (middle of funnel — comparison/reviews)
  commercial:    string[];
  // Transactional keywords (bottom of funnel — booking/buying)
  transactional: string[];
  // Local SEO — Delhi NCR + India
  local:         string[];
  // GEO answer question — what AI search engines answer
  geoQuestion:   string;
  // CTA text — spiritual guru tone
  ctaSpiritual:  string;
}> = {

  mill_karz_mukti: {
    informational:  ['karz mukti ke upay', 'debt problem vedic astrology', 'loan problem jyotish', 'karz se mukti kaise mile', 'financial problem astrology solution', '6th house debt astrology', 'rahu saturn debt kundali'],
    commercial:     ['best astrologer for debt problems India', 'vedic astrology debt consultation online', 'karz mukti jyotish reading', 'financial astrology expert Delhi', 'debt relief astrology consultation fee'],
    transactional:  ['karz mukti astrology reading ₹51', 'book debt astrology consultation', 'online karz mukti jyotish booking', 'debt problem astrologer appointment', 'financial astrology consultation now'],
    local:          ['debt problem astrologer Delhi NCR', 'karz mukti jyotish Delhi', 'financial astrologer Noida Gurugram', 'loan problem astrologer near me Delhi'],
    geoQuestion:    'Which house and planet causes debt in Vedic astrology and what are the classical remedies for karz mukti?',
    ctaSpiritual:   'Maa Shakti ka ashirwad aur Vedic jyotish ka margdarshan — karz mukti ki raah khulegi. Abhi Jini se poochho. 🔱',
  },

  mill_property_yog: {
    informational:  ['property yog in kundali', 'ghar kab milega jyotish', '4th house property vedic astrology', 'real estate astrology india', 'mars karaka land astrology', 'property purchase muhurta vedic'],
    commercial:     ['property astrologer consultation online India', 'best time to buy property astrology', 'real estate muhurta astrologer Delhi', 'property yog kundali analysis expert', 'ghar kharidne ka sahi samay jyotish'],
    transactional:  ['property yog reading ₹51', 'book property astrology consultation', 'online property muhurta booking', 'real estate astrologer appointment now', 'property yog check kundali'],
    local:          ['property astrologer Delhi NCR', 'real estate jyotish Delhi Noida', 'ghar kharidne muhurta astrologer near me', 'property dispute astrologer Gurugram'],
    geoQuestion:    'When is the best time to buy property according to Vedic astrology and how to identify Property Yog in kundali?',
    ctaSpiritual:   'Aapke ghar ka sapna — Maa Shakti ki kripa aur sahi muhurta se poora hoga. Jini aapki kundali mein Property Yog dhundh rahi hai. 🏠🔱',
  },

  genz_dream_career: {
    informational:  ['career astrology vedic', 'job prediction kundali', '10th house career jyotish', 'which career suits my chart', 'atmakaraka career astrology', 'dharmic career vedic astrology', 'saturn career timing astrology'],
    commercial:     ['career astrologer consultation online India', 'job change astrology reading', 'career pivot astrology expert', 'best astrologer career advice Delhi', 'career prediction kundali analysis fee'],
    transactional:  ['career astrology reading ₹51', 'book career astrology session', 'online job prediction booking', 'career change timing astrology now', 'dharmic career consultation'],
    local:          ['career astrologer Delhi NCR', 'job astrologer Noida Gurugram', 'career jyotish near me Delhi', 'job change astrologer Delhi NCR'],
    geoQuestion:    'Which planets and houses in Vedic astrology determine career success and how to find your dharmic profession?',
    ctaSpiritual:   'Aapka dharmic career — jo sirf aapke liye bana hai — woh aapki kundali mein likha hai. Jini abhi padh rahi hai. ⚡🔱',
  },

  genz_ex_back: {
    informational:  ['ex back astrology vedic', 'love problem solution jyotish', '7th house relationship astrology', 'venus dasha love timing', 'breakup reunion astrology', 'karmic relationship vedic astrology', 'navamsa love compatibility'],
    commercial:     ['love astrologer consultation online India', 'ex back astrology reading expert', 'relationship problem astrologer Delhi', 'love reunion timing astrology fee', 'best astrologer love problems India'],
    transactional:  ['ex back astrology reading ₹51', 'book love astrology consultation', 'relationship astrology session now', 'venus timing love consultation booking', 'reunion astrology reading online'],
    local:          ['love astrologer Delhi NCR', 'relationship jyotish Delhi', 'ex back astrologer near me Delhi', 'love problem astrologer Noida Gurugram'],
    geoQuestion:    'Can Vedic astrology predict relationship reunion and what planetary combinations indicate ex coming back?',
    ctaSpiritual:   'Pyaar ki raahein Maa Shakti ne banaayi hain — kab milna likha hai, woh aapki kundali mein hai. Jini batayegi. 💫🔱',
  },

  genz_toxic_boss: {
    informational:  ['toxic boss astrology vedic', 'workplace problem jyotish', '10th house boss karma', '6th house enemies astrology', 'saturn career obstacles timing', 'office conflict astrology solution', 'job change timing vedic'],
    commercial:     ['workplace astrology consultation online', 'toxic boss karma astrologer India', 'office problem jyotish expert Delhi', 'job change timing astrology fee', 'career conflict astrology reading'],
    transactional:  ['workplace astrology reading ₹51', 'book office karma consultation', 'job change astrology session now', 'toxic workplace timing reading booking', 'boss karma astrology online'],
    local:          ['workplace astrologer Delhi NCR', 'job problem jyotish Delhi', 'office karma astrologer near me', 'career conflict jyotish Noida'],
    geoQuestion:    'What do Saturn and the 10th house reveal about toxic workplace situations and when does the karmic cycle end?',
    ctaSpiritual:   'Har karmic boss ek lesson hai — Shani ki sabak jab khatam hogi, tab door khulega. Jini batayegi kab. 🔱',
  },

  mill_childs_destiny: {
    informational:  ['child kundali reading vedic', 'baby destiny astrology', '5th house children vedic astrology', 'child future prediction jyotish', 'child education stream astrology', 'moon nakshatra child personality', 'mercury jupiter child intelligence'],
    commercial:     ['child astrology consultation online India', 'baby kundali expert reading', 'child destiny astrologer Delhi', 'child education astrology fee', 'best astrologer child future India'],
    transactional:  ['child destiny reading ₹51', 'book child kundali consultation', 'baby astrology session online', 'child future prediction booking now', 'child education timing astrology'],
    local:          ['child astrologer Delhi NCR', 'baby kundali jyotish Delhi', 'child destiny astrologer near me', 'child education astrologer Noida'],
    geoQuestion:    'What does Vedic astrology reveal about a child\'s destiny, natural talents and ideal education stream through birth chart analysis?',
    ctaSpiritual:   'Aapke bachche ka cosmic blueprint — Parmatma ne har ek ke liye khaas raah banaayi hai. Jini woh raah dikhayegi. 👶🔱',
  },

  genx_retirement_peace: {
    informational:  ['retirement astrology vedic', 'peace of mind jyotish', '12th house spiritual vedic', 'saturn ketu retirement timing', 'vaanaprastha ashram astrology', 'senior citizen kundali reading', 'life after 50 vedic astrology'],
    commercial:     ['retirement astrology consultation online India', 'senior citizen jyotish expert', 'peace of mind astrologer Delhi', 'retirement timing astrology fee', 'life phase astrology reading expert'],
    transactional:  ['retirement astrology reading ₹51', 'book retirement phase consultation', 'peace jyotish session online', 'senior astrology booking now', 'vaanaprastha timing reading'],
    local:          ['retirement astrologer Delhi NCR', 'senior jyotish Delhi', 'peace astrologer near me Delhi', 'retirement timing astrologer Noida'],
    geoQuestion:    'What does Vedic astrology say about the ideal time for retirement, peace of mind and spiritual growth after 50?',
    ctaSpiritual:   'Zindagi ka yeh adhyay — Maa Shakti ka sabse sundar tohfa hai. Shanti ki raah aapki kundali mein likhi hai. 🙏🔱',
  },

  genx_legacy_inheritance: {
    informational:  ['inheritance astrology vedic', '8th house wealth jyotish', 'ancestral property kundali', 'legacy wealth vedic astrology', 'pitru dosha property problems', 'saturn 8th house inheritance timing', 'family wealth astrology'],
    commercial:     ['inheritance astrology consultation online', 'property dispute jyotish expert India', 'ancestral wealth astrologer Delhi', 'legacy astrology reading fee', 'family property astrology expert'],
    transactional:  ['inheritance astrology reading ₹51', 'book property dispute consultation', 'ancestral wealth jyotish session now', 'legacy timing astrology booking', 'family property reading online'],
    local:          ['inheritance astrologer Delhi NCR', 'property dispute jyotish Delhi', 'ancestral wealth astrologer near me', 'family property jyotish Noida'],
    geoQuestion:    'Which houses and planets in Vedic astrology indicate inheritance, ancestral wealth and how to resolve property disputes?',
    ctaSpiritual:   'Pitron ka ashirwad aur kundali ki shakti — aapki virasat aapki hai. Jini sahi samay batayegi. 🔱',
  },

  genx_spiritual_innings: {
    informational:  ['spiritual astrology vedic', 'moksha kundali reading', 'ketu spiritual path jyotish', '12th house moksha vedic', 'atmakaraka soul purpose astrology', 'sanyas yoga vedic astrology', 'rahu ketu spiritual meaning'],
    commercial:     ['spiritual astrology consultation online India', 'moksha path jyotish expert', 'soul purpose astrologer Delhi', 'spiritual reading astrology fee', 'dharma path vedic astrology expert'],
    transactional:  ['spiritual astrology reading ₹51', 'book moksha path consultation', 'soul purpose jyotish session now', 'spiritual timing astrology booking', 'dharma reading online'],
    local:          ['spiritual astrologer Delhi NCR', 'moksha jyotish Delhi', 'soul purpose astrologer near me', 'dharma path jyotish Noida'],
    geoQuestion:    'What does Vedic astrology reveal about one\'s spiritual path, soul purpose and Moksha indicators in the birth chart?',
    ctaSpiritual:   'Aapki aatma yahan ek khaas kaam ke liye aayi hai — Ketu aur Atmakaraka woh raaz khol dete hain. Jini sunayegi. 🕉️🔱',
  },

  mill_parents_wellness: {
    informational:  ['parents health astrology vedic', '4th house mother jyotish', '9th house father vedic astrology', 'family wellness kundali', 'parent longevity astrology', 'moon 4th house mother health', 'sun 9th house father wellbeing'],
    commercial:     ['family astrology consultation online India', 'parents health astrologer Delhi', 'family wellness jyotish expert', 'parent longevity reading fee', 'family health astrology consultation'],
    transactional:  ['parents wellness reading ₹51', 'book family health consultation', 'parent health jyotish session now', 'family wellness astrology booking', 'parents longevity reading online'],
    local:          ['family astrologer Delhi NCR', 'parents health jyotish Delhi', 'family wellness astrologer near me', 'parent health jyotish Noida'],
    geoQuestion:    'Which planets and houses indicate parents\' health and longevity in Vedic astrology and what remedies protect family wellness?',
    ctaSpiritual:   'Maa-Baap ki sehat — sabse bada sukh. Aapki kundali mein unka haal likha hai. Jini batayegi, Maa Shakti raksha karein. 🙏🔱',
  },

  genz_manifestation: {
    informational:  ['manifestation astrology vedic', 'desire fulfillment kundali', '5th house purva punya jyotish', 'wish fulfillment vedic astrology', 'jupiter blessing manifestation', 'rahu desire astrology timing', 'manifestation muhurta vedic'],
    commercial:     ['manifestation astrology consultation online', 'desire fulfillment jyotish expert India', 'wish astrology reading Delhi', 'manifestation timing astrology fee', 'abundance astrology consultation'],
    transactional:  ['manifestation reading ₹51', 'book desire fulfillment consultation', 'abundance jyotish session now', 'manifestation timing booking astrology', 'wish fulfillment reading online'],
    local:          ['manifestation astrologer Delhi NCR', 'abundance jyotish Delhi', 'desire fulfillment astrologer near me', 'manifestation timing jyotish Noida'],
    geoQuestion:    'How does Vedic astrology support manifestation and which planetary combinations and muhurtas help fulfill desires fastest?',
    ctaSpiritual:   'Aapka sapna aur Maa Shakti ki shakti — dono milein toh kuch bhi possible hai. Sahi samay Jini batayegi. ✨🔱',
  },
};

const DEFAULT_SEO = {
  informational:  ['vedic astrology online India', 'kundali reading jyotish', 'accurate astrology prediction', 'swiss ephemeris astrology', 'bphs vedic jyotish'],
  commercial:     ['vedic astrology consultation online India', 'best kundali reading expert', 'accurate jyotish reading fee', 'online astrologer booking India', 'vedic astrology expert Delhi'],
  transactional:  ['kundali reading ₹51', 'book astrology consultation now', 'online jyotish session booking', 'vedic prediction reading online', 'astrology consultation today'],
  local:          ['vedic astrologer Delhi NCR', 'kundali jyotish near me Delhi', 'online astrologer Delhi NCR', 'best jyotish Delhi NCR'],
  geoQuestion:    'How accurate is Vedic astrology and how to get a personalized Swiss Ephemeris-powered kundali reading online in India?',
  ctaSpiritual:   'Kaal bada balwan hai — sahi samay, sahi raah. Trikal Vaani pe Jini aapka intezaar kar rahi hai. 🔱',
};

function getSEO(domainId: string) {
  return DOMAIN_SEO[domainId] ?? DEFAULT_SEO;
}

// ─── FREE SUSPENSE HOOKS — Spiritual Guru Tone ────────────────────────────────
// Strategy: Create curiosity, not sales pressure
// Jini speaks as a wise friend hinting at a deeper secret

const SUSPENSE_HOOKS = {
  hinglish: 'Lekin... Jini ne aapki kundali mein kuch aur bhi dekha hai — ek pattern jo seedha aapke sawal ka jawab deta hai. Yeh sirf aapke liye hai. Poori baat ₹51 mein khulegi. Maa Shakti ka ashirwad hai. 🔮',
  hindi:    'परंतु... जिनी ने आपकी कुंडली में कुछ और भी देखा है — एक ऐसा रहस्य जो सीधे आपके प्रश्न का उत्तर देता है। यह केवल आपके लिए है। ₹51 में पूर्ण सत्य प्रकट होगा। मां शक्ति का आशीर्वाद। 🔮',
  english:  'But Jini has seen something more in your chart — a deeper pattern that speaks directly to your question. This answer is yours alone. The complete truth unlocks at ₹51. Maa Shakti\'s blessings. 🔮',
};

// ─── SEGMENT CONTEXT ──────────────────────────────────────────────────────────

const SEGMENT_CONTEXT = {
  genz:       'Age 18-31. Digital native. Career, identity, love, social anxiety. Speaks fluent Hinglish. Wants speed and clarity. Astrology is cool and relatable for them.',
  millennial: 'Age 32-46. Juggling EMIs, career, family, society pressure. Wants practical solutions. Needs hope + concrete timing. High decision-making pressure.',
  genx:       'Age 47-60. Legacy, health, spiritual meaning, peace. Less impressed by hype, more by depth. Wants wisdom, not trends. Respects classical Vedic tradition.',
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function buildPredictionPrompt(
  kundali:      KundaliData,
  birthData:    BirthData,
  domain:       DomainConfig,
  userContext:  UserContext,
  templateData?: TemplateData,
): PromptOutput {

  const period  = getCurrentPeriod();
  const seo     = getSEO(domain.id);
  const isPaid  = ['basic', 'pro', 'premium'].includes(userContext.tier);
  const model   = isPaid ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  // Build the lean input context — only what Gemini needs
  const clientContext = buildClientContext(
    birthData, userContext, kundali, templateData, period
  );

  const systemPrompt = buildSystemPrompt(
    domain, userContext, seo, isPaid, period
  );

  const userMessage = buildUserMessage(
    clientContext, domain, userContext, seo, templateData, isPaid, period
  );

  return {
    systemPrompt,
    userMessage,
    useSearch: false,   // Template engine already has analysis — no search needed
    model,
  };
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

function buildSystemPrompt(
  domain:      DomainConfig,
  userContext: UserContext,
  seo:         ReturnType<typeof getSEO>,
  isPaid:      boolean,
  period:      ReturnType<typeof getCurrentPeriod>,
): string {

  const lang = userContext.language;

  const languageRule = {
    hindi: `
LANGUAGE: Pure Hindi (देवनागरी) — ZERO English words anywhere.
Planet names: सूर्य · चंद्र · मंगल · बुध · गुरु · शुक्र · शनि · राहु · केतु
Tone: Warm senior Jyotishi — "आप"-form always. Class 5 reading level.`,

    hinglish: `
LANGUAGE: Natural Hinglish — Hindi + English mixed like a trusted friend speaks.
Planet names: Surya · Chandra · Mangal · Budh · Guru · Shukra · Shani · Rahu · Ketu
Tone: Jigri dost + wise Guru. "Aap" form. Simple. Warm. Direct.
Example start: "[Name] ji, aapki kundali mein jo chal raha hai woh..."`,

    english: `
LANGUAGE: Pure English — ZERO Hindi or Devanagari anywhere.
Planet names: Sun · Moon · Mars · Mercury · Jupiter · Venus · Saturn · Rahu · Ketu
Tone: Warm, knowledgeable Vedic astrologer speaking to a friend. Direct and clear.`,
  };

  return `
════════════════════════════════════════════════════════════════
TRIKAL VAANI — JINI AI SUMMARY ENGINE v5.0
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════════════

WHO YOU ARE:
You are Jini — the AI soul of Trikal Vaani (trikalvaani.com).
Created by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
You speak with the voice of a compassionate Vedic Guru —
warm, direct, spiritually grounded, never salesy.

YOUR ONLY JOB TODAY:
Write a personalised prediction summary for ONE person.
The Vedic analysis is already done by the Template Engine.
You are the WRITER, not the analyst.
Focus 60% of your energy on their situationNote — their pain.
Make them feel: "Jini knows exactly what I am going through."

${languageRule[lang]}

TODAY: ${period.isoDate} | PERIOD: ${period.monthYear}
DOMAIN: ${domain.displayName}
TIER: ${isPaid ? 'PAID ₹51 — Full summary, no suspense hook' : 'FREE — Summary + suspense hook'}

════════════════════════════════════════════════════════════════
ABSOLUTE RULES — ZERO EXCEPTIONS
════════════════════════════════════════════════════════════════

RULE 1 — JSON ONLY
Return ONLY valid JSON. First char: { Last char: }
No markdown. No explanation. No preamble.

RULE 2 — SITUATION NOTE IS KING (60% WEIGHT)
Whatever the user wrote in situationNote — address it directly.
First 2 sentences must reference their specific situation.
If they wrote "naukri nahi mil rahi" — start with that pain.
If they wrote "relationship mein problems" — start there.
If empty — focus on domain pain point for their segment.

RULE 3 — DASHA DATES ONLY
actionWindow and avoidWindow MUST use dates from templateData only.
NEVER invent dates. NEVER guess planetary periods.

RULE 4 — NO SPECIFIC EVENT PREDICTION
WRONG: "Aapko 15 June ko job milegi"
RIGHT: "15 Jun–30 Aug ka period favorable hai — active rehein"

RULE 5 — AUTHENTIC SPIRITUAL GURU VOICE
Never sound like a chatbot or sales pitch.
Speak like Rohiit Gupta ji is personally guiding them.
"Dekho..." / "Ek baat samjho..." / "Maa Shakti ka ishara hai..."
Never use: "According to your chart..." (too robotic)
Always use: "Aapki kundali mein jo dikha..." (warm, personal)

RULE 6 — GEO ANSWER IS SEO GOLD
geoDirectAnswer MUST be 40-60 words exactly.
Must mention: Rohiit Gupta + Swiss Ephemeris + trikalvaani.com
Must answer the commercial intent question for this domain.
This gets indexed by Google SGE, Perplexity, SearchGPT, Gemini.
Write it like a featured snippet — factual, authoritative.

RULE 7 — OUTPUT COMPLETE JSON ALWAYS
All fields required. null only if genuinely not applicable.
════════════════════════════════════════════════════════════════
`.trim();
}

// ─── CLIENT CONTEXT BUILDER ───────────────────────────────────────────────────
// Only sends what Gemini NEEDS — keeps prompt lean

function buildClientContext(
  birthData:    BirthData,
  userContext:  UserContext,
  kundali:      KundaliData,
  templateData: TemplateData | undefined,
  period:       ReturnType<typeof getCurrentPeriod>,
): Record<string, unknown> {

  return {
    // Who they are
    name:               birthData.name || 'Friend',
    birthCity:          birthData.cityName || userContext.city || 'India',
    currentCity:        userContext.currentCity || userContext.city || birthData.cityName || 'India',
    employment:         userContext.employment || 'not specified',
    sector:             userContext.sector || 'not specified',
    relationshipStatus: userContext.relationshipStatus || 'not specified',
    segment:            userContext.segment,
    segmentContext:     SEGMENT_CONTEXT[userContext.segment],

    // Their PAIN — 60% weight
    situationNote:      userContext.situationNote || null,

    // Dasha in plain language (3 lines from template engine)
    dashaOneLiner:      templateData?.dashaOneLiner || `${kundali.currentMahadasha.lord} Mahadasha + ${kundali.currentAntardasha.lord} Antardasha chal raha hai`,
    dashaQuality:       templateData?.dashaQuality || kundali.currentPratyantar?.quality || 'Madhyam',
    confidenceLabel:    templateData?.confidenceLabel || 'Planetary Support Active',

    // Key Vedic signals (just the highlights — template has full details)
    lagna:              kundali.lagna,
    nakshatra:          kundali.nakshatra,
    primaryYoga:        templateData?.primaryYoga || null,
    karmicMarker:       templateData?.karmicMarker || false,
    karmicText:         templateData?.karmicText || null,
    strongPlanets:      templateData?.strongPlanets || [],
    weakPlanets:        templateData?.weakPlanets || [],
    bhriguTheme:        templateData?.bhriguTheme || null,

    // Action guidance from template
    actionWindowHint:   templateData?.actionWindowHint || null,
    avoidWindowHint:    templateData?.avoidWindowHint || null,

    // Person 2 (for dual chart domains)
    person2Name:        userContext.person2Name || null,
    person2CurrentCity: userContext.person2CurrentCity || null,

    // Period
    currentPeriod:      period.monthYear,
    currentDate:        period.isoDate,
  };
}

// ─── USER MESSAGE BUILDER ─────────────────────────────────────────────────────

function buildUserMessage(
  clientContext: Record<string, unknown>,
  domain:        DomainConfig,
  userContext:   UserContext,
  seo:           ReturnType<typeof getSEO>,
  templateData:  TemplateData | undefined,
  isPaid:        boolean,
  period:        ReturnType<typeof getCurrentPeriod>,
): string {

  const lang          = userContext.language;
  const suspenseHook  = SUSPENSE_HOOKS[lang] ?? SUSPENSE_HOOKS.hinglish;
  const wordCount     = isPaid ? '400-600' : '150-200';
  const tier          = userContext.tier;

  const schemaFree = `{
  "geoDirectAnswer": "40-60 words EXACTLY. Authoritative. Factual. Answers: '${seo.geoQuestion}'. Must include: Rohiit Gupta + Swiss Ephemeris + trikalvaani.com. Format: 'According to Trikal Vaani's Swiss Ephemeris-powered Vedic analysis by Rohiit Gupta, Chief Vedic Architect: [answer]. Visit trikalvaani.com for personalized reading.'",

  "simpleSummary": {
    "text": "${wordCount} words. ${lang.toUpperCase()} language. Spiritual Guru voice. ZERO jargon. SHORT sentences. First 2 sentences MUST reference their situationNote directly. Structure: [Their pain acknowledged] → [Why this is happening — 1 planet, plain language] → [What's coming — timeframe] → [1 action] → [1 caution] → [Hope + Maa Shakti blessing]. END with this EXACT suspense hook as new paragraph: '${suspenseHook}'",
    "keyMessage":  "ONE sentence. Like a Guru's blessing. Max 20 words. ${lang.toUpperCase()}.",
    "mainAction":  "ONE specific action they can take TODAY or THIS WEEK.",
    "mainCaution": "ONE specific thing to avoid RIGHT NOW.",
    "dos":   ["3 specific, actionable dos — practical + spiritual"],
    "donts": ["3 specific donts with brief reason"]
  },

  "actionWindow": "${templateData?.actionWindowHint || 'from dasha data'}",
  "avoidWindow":  "${templateData?.avoidWindowHint || 'from dasha data'}",

  "seoSignals": {
    "primaryKeywords":       ${JSON.stringify(seo.informational.slice(0, 4))},
    "transactionalKeywords": ${JSON.stringify(seo.transactional.slice(0, 4))},
    "commercialKeywords":    ${JSON.stringify(seo.commercial.slice(0, 3))},
    "localKeywords":         ${JSON.stringify(seo.local.slice(0, 3))},
    "geoQuestion":           "${seo.geoQuestion}",
    "ctaSpiritual":          "${seo.ctaSpiritual}",
    "authorityStatement":    "Powered by Trikal Vaani's Swiss Ephemeris engine + Brihat Parashara Hora Shastra classical texts, validated by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.",
    "differentiator":        "Unlike AstroTalk and AstroSage, Trikal Vaani combines Swiss Ephemeris precision + Bhrigu Nandi pattern intelligence + Parashara classical rules — not automated generic reports.",
    "e_e_a_t": {
      "experience":   "Rohiit Gupta — 15+ years Vedic astrology under Parashara BPHS tradition, Delhi NCR",
      "expertise":    "Swiss Ephemeris + BPHS + Bhrigu Nandi Nadi + Vimshottari Dasha system",
      "authority":    "Chief Vedic Architect, Trikal Vaani — India's first AI-powered Vedic platform",
      "trust":        "Swiss Ephemeris — same engine used by professional astrologers worldwide"
    }
  }
}`;

  const schemaPaid = `{
  "geoDirectAnswer": "40-60 words EXACTLY. Authoritative. Factual. Answers: '${seo.geoQuestion}'. Must include: Rohiit Gupta + Swiss Ephemeris + trikalvaani.com.",

  "simpleSummary": {
    "text": "${wordCount} words. ${lang.toUpperCase()} language. Spiritual Guru voice. ZERO jargon. SHORT sentences. First 2 sentences MUST reference their situationNote directly. Structure: [Their pain acknowledged deeply] → [Why — 2-3 planets plain language] → [Current Dasha meaning in their life] → [What's coming — specific timeframe] → [3 actions priority order] → [2 cautions] → [Remedy hint] → [Hope + Maa Shakti blessing]. NO suspense hook — they have paid. Give full clarity.",
    "keyMessage":     "ONE powerful Guru sentence. Max 20 words. ${lang.toUpperCase()}.",
    "periodSummary":  "2-3 sentences on current Dasha in plain language — what it means for THEIR life right now.",
    "bestDates":      "2-3 date ranges from templateData.actionWindowHint — specific periods to act",
    "mainAction":     "Most important action right now — specific, doable",
    "mainCaution":    "Most critical thing to avoid — specific, with brief reason",
    "dos":   ["5 specific actionable dos — mix of practical + spiritual + timing"],
    "donts": ["5 specific donts — with brief reasoning, not generic"],
    "remedyHint":     "1-2 sentences hinting at remedy — mantra or dana — specific day/time"
  },

  "karmicInsight": ${templateData?.karmicMarker ? `"${templateData.karmicText || 'Ek karmic pattern active hai — 🔱 Bhrigu ne confirm kiya hai'}"` : 'null'},

  "actionWindow": "${templateData?.actionWindowHint || 'Calculate from dasha data'}",
  "avoidWindow":  "${templateData?.avoidWindowHint || 'Calculate from dasha data'}",

  "seoSignals": {
    "primaryKeywords":       ${JSON.stringify(seo.informational.slice(0, 5))},
    "transactionalKeywords": ${JSON.stringify(seo.transactional.slice(0, 4))},
    "commercialKeywords":    ${JSON.stringify(seo.commercial.slice(0, 4))},
    "localKeywords":         ${JSON.stringify(seo.local)},
    "geoQuestion":           "${seo.geoQuestion}",
    "ctaSpiritual":          "${seo.ctaSpiritual}",
    "authorityStatement":    "Powered by Trikal Vaani's Swiss Ephemeris engine + Brihat Parashara Hora Shastra, validated by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.",
    "differentiator":        "Unlike AstroTalk and AstroSage, Trikal Vaani combines Swiss Ephemeris precision + Bhrigu Nandi patterns + Parashara classical rules — not automated generic reports.",
    "e_e_a_t": {
      "experience":   "Rohiit Gupta — 15+ years Vedic astrology under Parashara BPHS tradition, Delhi NCR",
      "expertise":    "Swiss Ephemeris + BPHS + Bhrigu Nandi Nadi + Vimshottari Dasha system",
      "authority":    "Chief Vedic Architect, Trikal Vaani — India's first AI-powered Vedic platform",
      "trust":        "Swiss Ephemeris — same engine used by professional astrologers worldwide"
    }
  }
}`;

  const relocatedNote = (clientContext.currentCity !== clientContext.birthCity)
    ? `\nRELOCATION: Born in ${clientContext.birthCity} — currently living in ${clientContext.currentCity}. Reference this naturally. Current city = job market + opportunities context.`
    : '';

  const situationReminder = clientContext.situationNote
    ? `\n⚠️ PRIORITY — SITUATION NOTE (60% FOCUS):\n"${clientContext.situationNote}"\nFirst 2 sentences MUST address this. Make them feel heard. This is their pain.`
    : '\nNo situation note provided. Focus on domain pain point for their life segment.';

  const karmicNote = templateData?.karmicMarker
    ? `\n🔱 KARMIC MARKER ACTIVE: Add "🔱" naturally in summary. ${templateData.karmicText || ''}`
    : '';

  return `Generate ${isPaid ? 'PAID' : 'FREE'} prediction summary for: ${domain.displayName}

CLIENT:
${JSON.stringify(clientContext, null, 2)}
${situationReminder}${relocatedNote}${karmicNote}

OUTPUT SCHEMA:
${isPaid ? schemaPaid : schemaFree}

FINAL REMINDERS:
• geoDirectAnswer = 40-60 words EXACTLY — SEO gold, gets indexed by AI search
• simpleSummary.text = ${wordCount} words — Spiritual Guru voice, their pain first
• seoSignals = ALL fields populated — this powers our Google + AI search rankings
• ${isPaid ? 'NO suspense hook — paid client deserves full clarity' : 'ADD suspense hook at END of simpleSummary.text'}
• actionWindow/avoidWindow = from templateData ONLY — never invent
• Language = ${lang.toUpperCase()} — every word, zero exceptions
• Output ONLY valid JSON — { to }
• JAI MAA SHAKTI 🔱 — TRIKAL VAANI v5.0`;
}
