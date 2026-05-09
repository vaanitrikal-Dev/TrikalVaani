/**
 * ============================================================
 * TRIKAL VAANI — Gemini Pro Full Analysis Prompt
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/gemini-prompt-pro.ts
 * VERSION: 1.2 — Dynamic segment + gender + Senior SEO/GEO Architect
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v1.2 vs v1.1:
 *   ✅ dynamicSegment used for personalized 900w analysis
 *   ✅ gender passed for tone + remedy + content calibration
 *   ✅ age used for life-stage accurate advice
 *   ✅ mid_male 50% weight — career/money/property/respect
 *   ✅ SEO: trending 2026 keywords per domain
 *   ✅ GEO: optimized for Google SGE + Perplexity + Gemini + SearchGPT
 *   ✅ Full FAQPage schema answers for Google rich results
 *   ✅ E-E-A-T signals — Rohiit Gupta authority + Swiss Ephemeris trust
 *   ✅ All DOMAIN_SEO keywords preserved from v1.1
 *
 * IRON RULES:
 *   🔒 NEVER import from gemini-prompt.ts (LOCKED)
 *   🔒 NEVER use Flash model in this file
 *   🔒 CEO approval required to change SEO keyword strategy
 *   🔒 E-E-A-T fields MUST always be present
 * ============================================================
 */

import type { KundaliData, BirthData } from './swiss-ephemeris'
import type { DomainConfig }           from './domain-config'
import { getCurrentPeriod }            from './domain-config'
import type { UserContext, TemplateData } from './gemini-prompt'

// ─── DOMAIN SEO KEYWORDS (2026 trending) ─────────────────────────────────────

const DOMAIN_SEO: Record<string, {
  informational: string[]; commercial: string[]; transactional: string[]
  local: string[]; voice: string[]; geoQuestion: string
  faqQuestions: string[]; ctaSpiritual: string; competitorGap: string
}> = {
  mill_karz_mukti: {
    informational:  ['karz mukti ke upay vedic 2026','debt problem astrology solution','loan problem jyotish','6th house debt kundali','rahu saturn debt pattern','karz se mukti kab milegi','financial problem vedic remedy'],
    commercial:     ['best astrologer debt problems India','karz mukti jyotish reading online','financial astrology expert Delhi NCR','debt relief vedic consultation','online karz mukti reading trusted'],
    transactional:  ['karz mukti reading Rs51','book debt astrology now','karz jyotish booking instant','debt problem astrologer today','financial astrology consultation immediately'],
    local:          ['debt astrologer Delhi NCR','karz mukti jyotish Delhi','financial astrologer Noida Gurugram','loan problem astrologer near me Delhi'],
    voice:          ['which planet causes debt vedic astrology','karz mukti ke liye kya karein jyotish','best remedy financial problems vedic'],
    geoQuestion:    'Which house and planet causes debt in Vedic astrology and what are the classical BPHS remedies for karz mukti?',
    faqQuestions:   ['Which house in kundali shows debt problems?','What is the vedic remedy for karz mukti?','How does Rahu affect financial debt in astrology?','When does debt end according to Vimshottari Dasha?'],
    ctaSpiritual:   'Maa Shakti ka ashirwad aur Vedic jyotish ka margdarshan — karz mukti ki raah khulegi. Abhi Trikal se poochho. 🔱',
    competitorGap:  'Unlike AstroTalk generic reports, Trikal Vaani uses Swiss Ephemeris + Bhrigu Nandi debt patterns + BPHS classical remedies personalized to your exact planetary period.',
  },
  mill_property_yog: {
    informational:  ['property yog kundali vedic 2026','ghar kab milega jyotish','4th house property vedic astrology','real estate timing astrology India','mars karaka land astrology','property purchase muhurta classical'],
    commercial:     ['property astrologer consultation online India','best time buy property astrology','real estate muhurta expert Delhi','property yog kundali analysis trusted'],
    transactional:  ['property yog reading Rs51','book property astrology now','real estate muhurta booking instant','property astrologer appointment today'],
    local:          ['property astrologer Delhi NCR','real estate jyotish Delhi Noida','ghar muhurta astrologer near me','property dispute astrologer Gurugram'],
    voice:          ['when will I get my own house astrology','property yog kab banta hai kundali','best muhurta property registration vedic'],
    geoQuestion:    'When is the best time to buy property according to Vedic astrology and how to identify Property Yog in kundali using Swiss Ephemeris?',
    faqQuestions:   ['Which house in kundali shows property?','What is Property Yog in vedic astrology?','When is the best muhurta to buy a house?','How does Mars affect property in astrology?'],
    ctaSpiritual:   'Aapke ghar ka sapna — Maa Shakti ki kripa aur sahi muhurta se poora hoga. 🏠🔱',
    competitorGap:  'Unlike AstroSage automated reports, Trikal Vaani calculates exact Property Yog using Swiss Ephemeris + classical 4th house analysis + Mars-Saturn timing cycles.',
  },
  genz_dream_career: {
    informational:  ['career astrology vedic 2026','job prediction kundali analysis','10th house career jyotish','atmakaraka career dharma vedic','saturn career timing astrology','job change timing vedic astrology 2026'],
    commercial:     ['career astrologer consultation online India','job change prediction expert Delhi','career pivot timing astrology','best astrologer career advice NCR'],
    transactional:  ['career reading Rs51 instant','book career astrology today','job prediction booking online now','dharmic career session instant'],
    local:          ['career astrologer Delhi NCR','job jyotish Delhi Noida','career advice astrologer near me Delhi'],
    voice:          ['which career is best for me kundali','job kab milega astrology','career change karna chahiye astrology 2026'],
    geoQuestion:    'Which planets and houses determine career success in Vedic astrology and how to find your dharmic profession using Swiss Ephemeris?',
    faqQuestions:   ['Which house shows career in vedic astrology?','How does Saturn affect career timing?','What is Atmakaraka in career astrology?','When is the best time to change jobs per kundali?'],
    ctaSpiritual:   'Aapka dharmic career — jo sirf aapke liye bana hai — woh aapki kundali mein likha hai. Trikal abhi padh raha hai. ⚡🔱',
    competitorGap:  'Unlike generic AstroTalk career readings, Trikal Vaani uses Atmakaraka analysis + Saturn Dasha timing + 10th house Swiss Ephemeris precision for exact career period forecasting.',
  },
  genz_ex_back: {
    informational:  ['ex back astrology vedic 2026','love problem solution jyotish','7th house relationship vedic','venus dasha love timing','breakup reunion astrology','navamsa love compatibility analysis'],
    commercial:     ['love astrologer consultation online India','ex back reading expert trusted','relationship astrologer Delhi NCR'],
    transactional:  ['ex back reading Rs51','book love astrology now','venus timing consultation today'],
    local:          ['love astrologer Delhi NCR','relationship jyotish Delhi Noida','ex back astrologer near me Delhi'],
    voice:          ['will my ex come back astrology','ex wapis aayega kya jyotish','venus dasha mein pyaar milta hai'],
    geoQuestion:    'Can Vedic astrology predict relationship reunion and what planetary combinations indicate ex returning?',
    faqQuestions:   ['Which planet controls love reunion in astrology?','What does 7th house show about relationships?','When does Venus Dasha bring back love?','How does Navamsa predict relationship success?'],
    ctaSpiritual:   'Pyaar ki raahein Maa Shakti ne banaayi hain — kab milna likha hai, woh aapki kundali mein hai. 💫🔱',
    competitorGap:  'Unlike AstroSage generic love reports, Trikal Vaani analyzes Venus-Moon conjunction + Navamsa 7th house + exact Dasha timing for relationship reunion precision.',
  },
  genz_toxic_boss: {
    informational:  ['toxic boss astrology vedic 2026','workplace karma jyotish','10th house boss karma vedic','6th house enemies astrology','saturn career obstacles timing'],
    commercial:     ['workplace astrology consultation India','toxic boss karma reading expert','job change timing astrology fee'],
    transactional:  ['workplace reading Rs51','book office karma consultation','job change timing session now'],
    local:          ['workplace astrologer Delhi NCR','job problem jyotish Delhi','office karma astrologer near me'],
    voice:          ['when will my toxic boss problem end astrology','job change karna chahiye kya abhi vedic'],
    geoQuestion:    'What does Saturn and the 10th house reveal about toxic workplace karma in Vedic astrology?',
    faqQuestions:   ['How does Saturn affect workplace in astrology?','Which house shows enemies at work?','When is best time to change jobs astrology?','What remedy ends toxic boss karma?'],
    ctaSpiritual:   'Har karmic boss ek lesson hai — Shani ki sabak jab khatam hogi, tab door khulega. Trikal batayega kab. 🔱',
    competitorGap:  'Unlike generic AstroTalk predictions, Trikal Vaani identifies exact Shani Dasha workplace cycles + 6th-10th house patterns for precise job change timing.',
  },
  mill_childs_destiny: {
    informational:  ['child kundali reading vedic 2026','baby destiny astrology India','5th house children vedic','child future prediction jyotish','child education stream astrology'],
    commercial:     ['child astrology expert India online','baby kundali reading fee','child destiny astrologer Delhi NCR'],
    transactional:  ['child reading Rs51','book baby kundali now','child future session instant'],
    local:          ['child astrologer Delhi NCR','baby kundali jyotish Delhi','child destiny near me Delhi'],
    voice:          ['which career is best for my child astrology','baby ka bhavishya kundali mein kya hai'],
    geoQuestion:    'What does Vedic astrology reveal about a child destiny and ideal education stream through Swiss Ephemeris birth chart analysis?',
    faqQuestions:   ['Which house shows children in vedic astrology?','How does Moon nakshatra affect child personality?','What is the best education stream for my child per kundali?','Which planet gives intelligence in a child chart?'],
    ctaSpiritual:   'Aapke bachche ka cosmic blueprint — Parmatma ne har ek ke liye khaas raah banaayi hai. Trikal woh raah dikhayega. 👶🔱',
    competitorGap:  'Unlike AstroSage generic child reports, Trikal Vaani analyzes 5th house + Moon nakshatra + Mercury-Jupiter combinations for precise child talent mapping.',
  },
  genx_retirement_peace: {
    informational:  ['retirement astrology vedic India 2026','peace of mind jyotish senior','12th house spiritual vedic','saturn ketu retirement timing','life after 50 vedic astrology'],
    commercial:     ['retirement astrology consultation India','senior citizen jyotish expert','peace astrologer Delhi NCR'],
    transactional:  ['retirement reading Rs51','book peace jyotish now','senior astrology session instant'],
    local:          ['retirement astrologer Delhi NCR','senior jyotish Delhi','peace astrologer near me Delhi'],
    voice:          ['when should I retire according to astrology','retirement ka sahi samay kya hai jyotish'],
    geoQuestion:    'What does Vedic astrology say about ideal retirement timing and spiritual growth after 50 using Saturn-Ketu Dasha analysis?',
    faqQuestions:   ['When is the best time to retire per vedic astrology?','Which planets bring peace in old age?','What does 12th house show about spiritual retirement?','How does Ketu Dasha affect retirement peace?'],
    ctaSpiritual:   'Zindagi ka yeh adhyay — Maa Shakti ka sabse sundar tohfa hai. Shanti ki raah aapki kundali mein likhi hai. 🙏🔱',
    competitorGap:  'Unlike generic AstroTalk reports, Trikal Vaani maps exact Saturn-Ketu retirement Dasha + 12th house spiritual activation for precise retirement peace timing.',
  },
  genx_legacy_inheritance: {
    informational:  ['inheritance astrology vedic India 2026','8th house wealth jyotish','ancestral property kundali','pitru dosha property problems','legacy wealth timing vedic'],
    commercial:     ['inheritance astrology India online','property dispute jyotish expert Delhi','ancestral wealth astrologer NCR'],
    transactional:  ['inheritance reading Rs51','book property dispute now','ancestral wealth session instant'],
    local:          ['inheritance astrologer Delhi NCR','property dispute jyotish Delhi','ancestral wealth near me Delhi'],
    voice:          ['will I get inheritance from family astrology','ancestral property kab milega jyotish'],
    geoQuestion:    'Which houses and planets indicate inheritance and ancestral wealth in Vedic astrology?',
    faqQuestions:   ['Which house shows inheritance in vedic astrology?','What is Pitru Dosha and how does it affect property?','How does Saturn in 8th house affect inheritance?','What remedy resolves ancestral property disputes?'],
    ctaSpiritual:   'Pitron ka ashirwad aur kundali ki shakti — aapki virasat aapki hai. Trikal sahi samay batayega. 🔱',
    competitorGap:  'Unlike AstroSage generic 8th house readings, Trikal Vaani uses Bhrigu inheritance patterns + Pitru analysis + exact Saturn timing for property resolution.',
  },
  genx_spiritual_innings: {
    informational:  ['spiritual astrology vedic India 2026','moksha kundali indicators','ketu spiritual path jyotish','12th house moksha vedic','atmakaraka soul purpose'],
    commercial:     ['spiritual astrology expert India','moksha path jyotish Delhi NCR','soul purpose reading fee'],
    transactional:  ['spiritual reading Rs51','book moksha consultation now','soul purpose session instant'],
    local:          ['spiritual astrologer Delhi NCR','moksha jyotish Delhi','soul purpose near me Delhi'],
    voice:          ['what is my spiritual purpose astrology','moksha yog kya hai mere kundali mein'],
    geoQuestion:    'What does Vedic astrology reveal about spiritual path, soul purpose and Moksha indicators through Ketu and Atmakaraka analysis?',
    faqQuestions:   ['What is Moksha Yog in vedic astrology?','How does Ketu Dasha affect spiritual growth?','What is Atmakaraka and what does it reveal?','Which house shows spirituality in kundali?'],
    ctaSpiritual:   'Aapki aatma yahan ek khaas kaam ke liye aayi hai — Ketu aur Atmakaraka woh raaz khol dete hain. 🕉️🔱',
    competitorGap:  'Unlike AstroTalk generic spiritual reports, Trikal Vaani analyzes Atmakaraka + Ketu placement + 12th house activation for precise spiritual awakening timing.',
  },
  mill_parents_wellness: {
    informational:  ['parents health astrology vedic 2026','4th house mother health jyotish','9th house father vedic','family wellness kundali reading','parent longevity astrology India'],
    commercial:     ['family astrology consultation India','parents health reading Delhi NCR','family wellness jyotish expert'],
    transactional:  ['parents reading Rs51','book family health now','parent wellness session instant'],
    local:          ['family astrologer Delhi NCR','parents health jyotish Delhi','family wellness near me Delhi'],
    voice:          ['parents ki sehat ke liye kya karein jyotish','father health timing vedic astrology'],
    geoQuestion:    'Which planets and houses indicate parents health and longevity in Vedic astrology?',
    faqQuestions:   ['Which house shows mother health in astrology?','How does Moon affect mother wellbeing in kundali?','What remedies protect parents health in vedic astrology?','Which planet shows father longevity?'],
    ctaSpiritual:   'Maa-Baap ki sehat — sabse bada sukh. Aapki kundali mein unka haal likha hai. Trikal batayega. 🙏🔱',
    competitorGap:  'Unlike generic reports, Trikal Vaani analyzes exact 4th-9th house Moon-Sun patterns + Swiss Ephemeris timing for parent health period precision.',
  },
  genz_manifestation: {
    informational:  ['manifestation astrology vedic 2026','desire fulfillment kundali','5th house purva punya jyotish','wish fulfillment vedic timing','jupiter blessing manifestation'],
    commercial:     ['manifestation astrology India online','desire fulfillment jyotish expert','abundance reading fee trusted'],
    transactional:  ['manifestation reading Rs51','book abundance consultation now','desire fulfillment session instant'],
    local:          ['manifestation astrologer Delhi NCR','abundance jyotish Delhi','desire fulfillment near me Delhi'],
    voice:          ['when will my wish come true astrology','manifestation ka sahi samay kya hai jyotish'],
    geoQuestion:    'How does Vedic astrology support manifestation and which planetary Dashas help fulfill desires fastest?',
    faqQuestions:   ['Which planet helps manifestation in vedic astrology?','What is Purva Punya and how does it affect desire fulfillment?','When is best muhurta for manifestation rituals?','How does Jupiter Dasha help manifestation?'],
    ctaSpiritual:   'Aapka sapna aur Maa Shakti ki shakti — dono milein toh kuch bhi possible hai. ✨🔱',
    competitorGap:  'Unlike AstroSage generic Jupiter reports, Trikal Vaani identifies exact Purva Punya 5th house activation + Jupiter transit muhurta for desire fulfillment timing.',
  },
}

const DEFAULT_SEO = {
  informational:  ['vedic astrology online India 2026','kundali reading jyotish','accurate astrology prediction','swiss ephemeris astrology','bphs vedic jyotish classical'],
  commercial:     ['vedic astrology consultation India','best kundali reading expert','accurate jyotish reading fee','vedic astrology expert Delhi NCR'],
  transactional:  ['kundali reading Rs51','book astrology now','online jyotish session instant','vedic prediction booking today'],
  local:          ['vedic astrologer Delhi NCR','kundali jyotish near me Delhi','best jyotish Delhi NCR'],
  voice:          ['best vedic astrologer online India','accurate kundali reading kahan milega'],
  geoQuestion:    'How accurate is Vedic astrology and how to get a personalized Swiss Ephemeris kundali reading online in India?',
  faqQuestions:   ['How accurate is vedic astrology?','What is Swiss Ephemeris?','What is the difference between vedic and western astrology?','How does Trikal Vaani calculate kundali?'],
  ctaSpiritual:   'Kaal bada balwan hai — sahi samay, sahi raah. Trikal Vaani pe aapka intezaar hai. 🔱',
  competitorGap:  'Unlike AstroTalk marketplace and AstroSage automated reports, Trikal Vaani uses Swiss Ephemeris + BPHS + Bhrigu Nandi for genuine personalized analysis.',
}

function getSEO(domainId: string) {
  return DOMAIN_SEO[domainId] ?? DEFAULT_SEO
}

// ─── SEGMENT FOCUS MAP (same as flash) ───────────────────────────────────────

const SEGMENT_FOCUS: Record<string, string> = {
  young_male:     'Age 16-29 Male. PRIMARY: Love, confidence, career start. TONE: Energetic older brother. PAIN: Job not matching dreams, love life, competitive pressure.',
  mid_male:       'Age 30-45 Male. PRIMARY (50% WEIGHT): Career stuck, money not growing, property delayed, respect deficit. SECONDARY: EMI burden, business not scaling. TONE: Practical, direct, honor their hustle.',
  senior_male:    'Age 46-55 Male. PRIMARY: Property legacy, health vitality, social respect. TONE: Wise, authoritative.',
  elder_male:     'Age 56-65 Male. PRIMARY: Health, spiritual peace, legacy. TONE: Deep reverence.',
  young_female:   'Age 16-29 Female. PRIMARY: Love, marriage timing, career independence. TONE: Empowering elder sister. PAIN: Marriage pressure, love confusion.',
  mid_female:     'Age 30-45 Female. PRIMARY: Family harmony, career+home balance, health. TONE: Warm, acknowledge dual burden.',
  senior_female:  'Age 46-55 Female. PRIMARY: Family harmony, health, spiritual growth. TONE: Dignified.',
  elder_female:   'Age 56-65 Female. PRIMARY: Health, spiritual peace, family blessings. TONE: Deep devotion.',
  young_general:  'Age 16-29. General youth — career, love, identity. Speed + clarity needed.',
  mid_general:    'Age 30-45. Career, money, family pressure. Practical solutions + hope.',
  senior_general: 'Age 46-55. Legacy, health, property. Wisdom + depth needed.',
  elder_general:  'Age 56-65. Health, spiritual peace. Reverence + calm.',
  millennial_general: 'Age 32-46. EMIs, career, family pressure. Practical solutions + hope + timing.',
}

const LANGUAGE_RULES: Record<string, string> = {
  hindi:    `LANGUAGE: Pure Hindi (देवनागरी). ZERO English. Planets: सूर्य चंद्र मंगल बुध गुरु शुक्र शनि राहु केतु. Tone: Warm senior Jyotishi.`,
  hinglish: `LANGUAGE: Natural Hinglish — Hindi + English mixed. Planets: Surya Chandra Mangal Budh Guru Shukra Shani Rahu Ketu. Tone: Jigri dost + wise Guru.`,
  english:  `LANGUAGE: Pure English. ZERO Hindi/Devanagari. Planets: Sun Moon Mars Mercury Jupiter Venus Saturn Rahu Ketu. Tone: Warm knowledgeable Vedic astrologer.`,
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function buildProPrompt(
  kundali:      KundaliData,
  birthData:    BirthData,
  domain:       DomainConfig,
  userContext:  UserContext,
  templateData?: TemplateData,
): { systemPrompt: string; userMessage: string } {

  const period = getCurrentPeriod()
  const lang   = userContext.language
  const seo    = getSEO(domain.id)

  const dynSeg   = (userContext as any).dynamicSegment as string || userContext.segment || 'mid_general'
  const gender   = (userContext as any).gender as string || ''
  const age      = (userContext as any).age as number || 30
  const segFocus = SEGMENT_FOCUS[dynSeg] || SEGMENT_FOCUS['mid_general']!

  const systemPrompt = `
════════════════════════════════════════════════════════════════
TRIKAL VAANI — PRO DEEP ANALYSIS ENGINE v1.2
SENIOR SEO + GEO ARCHITECT MODE
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════════════

WHO YOU ARE:
Trikal — AI soul of Trikal Vaani by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
You are ALSO a Senior SEO + GEO Architect building content to rank on
Google SGE, Perplexity, Gemini AI, SearchGPT, and traditional Google search.

YOUR JOB:
1. Write 900-word deep personalised analysis — segment + gender calibrated
2. Generate 10 GEO bullets — entity-rich, AI search optimized
3. Complete SEO signals — trending 2026 keywords + FAQPage schema
4. Full E-E-A-T authority — Rohiit Gupta + Swiss Ephemeris + BPHS citations
5. FAQ answers — optimized for Google rich results + AI search extraction

${LANGUAGE_RULES[lang] ?? LANGUAGE_RULES.hinglish}

TODAY: ${period.isoDate} | DOMAIN: ${domain.displayName}
TIER: PAID PREMIUM — Full truth. No suspense hook. Complete analysis.

════════════════════════════════════════════════════════════════
SEGMENT INTELLIGENCE — CRITICAL FOR PERSONALIZATION
════════════════════════════════════════════════════════════════
CLIENT SEGMENT: ${dynSeg}
GENDER: ${gender || 'not specified'}
AGE: ${age}
SEGMENT FOCUS: ${segFocus}

KEY RULE: First 3 paragraphs MUST address this segment's PRIMARY pain.
900 words MUST feel written specifically for a ${dynSeg} client.
Generic advice will fail this person. Specificity = trust = conversions.
════════════════════════════════════════════════════════════════

════════════════════════════════════════════════════════════════
ABSOLUTE RULES
════════════════════════════════════════════════════════════════
RULE 1 — JSON ONLY. First: { Last: }. No markdown.
RULE 2 — situationNote = 60% weight — first 3 sentences = their pain.
RULE 3 — geoBullets = EXACTLY 10 items. 25-40 words each. NO URLs.
RULE 4 — geoDirectAnswer = 3-4 sentences. NO URL. Indexable by AI search.
RULE 5 — simpleSummary.text = EXACTLY 900 WORDS. Count carefully.
RULE 6 — NO suspense hook — paid user deserves full truth.
RULE 7 — ALL seoSignals fields populated with 2026 trending keywords.
RULE 8 — ALL faqAnswers populated — mandatory for FAQPage schema.
RULE 9 — Language = ${lang.toUpperCase()} every single word.
════════════════════════════════════════════════════════════════
`.trim()

  const ctx = {
    name:               birthData.name || 'Friend',
    birthCity:          birthData.cityName || userContext.city || 'India',
    currentCity:        userContext.currentCity || userContext.city || 'India',
    gender:             gender,
    age:                age,
    dynamicSegment:     dynSeg,
    segmentFocus:       segFocus,
    employment:         userContext.employment || 'not specified',
    sector:             userContext.sector || 'not specified',
    relationshipStatus: userContext.relationshipStatus || 'not specified',
    segment:            userContext.segment,
    situationNote:      userContext.situationNote || null,
    dashaOneLiner:      templateData?.dashaOneLiner || `${kundali.currentMahadasha.lord} MD + ${kundali.currentAntardasha.lord} AD`,
    dashaQuality:       templateData?.dashaQuality || 'Madhyam',
    confidenceLabel:    templateData?.confidenceLabel || 'Planetary Support Active',
    lagna:              kundali.lagna,
    nakshatra:          kundali.nakshatra,
    karmicMarker:       templateData?.karmicMarker || false,
    karmicText:         templateData?.karmicText || null,
    strongPlanets:      templateData?.strongPlanets || [],
    weakPlanets:        templateData?.weakPlanets || [],
    bhriguTheme:        templateData?.bhriguTheme || null,
    actionWindowHint:   templateData?.actionWindowHint || null,
    avoidWindowHint:    templateData?.avoidWindowHint || null,
    person2Name:        userContext.person2Name || null,
    currentPeriod:      period.monthYear,
    currentDate:        period.isoDate,
  }

  const mahadasha = kundali.currentMahadasha?.lord ?? 'Rahu'
  const antardasha = kundali.currentAntardasha?.lord ?? 'Jupiter'

  const schema = `{
  "geoDirectAnswer": "3-4 sentences. MUST answer: '${seo.geoQuestion}' Include Rohiit Gupta + Swiss Ephemeris + BPHS citation. Optimized for Google SGE featured snippet + Perplexity direct answer. Start with a strong factual claim. NO URLs.",

  "geoBullets": [
    "Vedic Foundation (BPHS): Classical principle about ${domain.displayName} — entity-rich, cite planet + house number — 25-40 words",
    "Dasha Intelligence: How ${ctx.dashaOneLiner} specifically affects ${domain.displayName} for this ${dynSeg} — 25-40 words",
    "Segment-Specific: Key insight for ${dynSeg} regarding ${domain.displayName} — their reality, their concern — 25-40 words",
    "Planet Analysis: Primary planet controlling ${domain.displayName} + current strength in chart — cite Shadbala — 25-40 words",
    "Timing Window: Most favorable period from dasha + transit analysis — approximate dates — 25-40 words",
    "Caution Period: Time requiring extra care + classical Vedic reason — BPHS basis — 25-40 words",
    "Classical Remedy: Specific BPHS mantra or dana — planet, day, time, count — 25-40 words",
    "FAQ Answer 1: '${seo.faqQuestions[0]}' answered in plain language — 25-40 words",
    "FAQ Answer 2: '${seo.faqQuestions[1]}' answered — cite classical source — 25-40 words",
    "Expert Insight: Rohiit Gupta 15-year Chief Vedic Architect observation about ${domain.displayName} for ${dynSeg} — 25-40 words"
  ],

  "simpleSummary": {
    "text": "WRITE EXACTLY 900 WORDS in ${lang.toUpperCase()}. STRUCTURE: [Para 1-2 (150w): Address ${dynSeg} situation pain DIRECTLY — make them feel deeply understood. Reference their specific life stage and concerns.] [Para 3-4 (150w): Why this is happening — explain 2-3 key planets in simple language. No jargon. Their reality.] [Para 5-6 (150w): What current ${mahadasha} Mahadasha + ${antardasha} Antardasha means for their daily life — plain language, practical meaning.] [Para 7-8 (150w): What is coming — specific timeframe, realistic hope, what to expect. Ground in dasha data.] [Para 9 (100w): THREE priority actions ranked by importance — specific, actionable, doable this week.] [Para 10 (75w): TWO critical things to avoid — with brief classical reasoning.] [Para 11 (75w): Specific remedy — exact mantra with count + day + time. OR exact dana with recipient + day.] [Para 12 (50w): Maa Shakti blessing — warm, spiritual, hopeful close.] Guru voice. Short sentences. NO suspense hook.",
    "keyMessage":    "ONE powerful Guru sentence capturing their ${dynSeg} life truth. Max 25 words. ${lang.toUpperCase()}.",
    "periodSummary": "3-4 sentences. Current ${mahadasha} MD + ${antardasha} AD — plain language meaning for ${dynSeg} daily life.",
    "bestDates":     "3-4 specific favorable date ranges from templateData.actionWindowHint.",
    "mainAction":    "Single most important concrete action for ${dynSeg} this week. Very specific.",
    "mainCaution":   "Most critical thing for ${dynSeg} to avoid — with one line classical reason.",
    "dos":   ["do 1 — practical for ${dynSeg}", "do 2 — career/money/family specific", "do 3 — spiritual BPHS remedy", "do 4 — timing-based action", "do 5 — segment-specific practical step"],
    "donts": ["dont 1 — with classical reason", "dont 2 — specific to ${dynSeg} concerns", "dont 3", "dont 4", "dont 5"],
    "remedyHint":    "Specific: mantra (Sanskrit + transliteration + count + day + time) OR dana (exact item + recipient + day). BPHS classical."
  },

  "karmicInsight": ${templateData?.karmicMarker
    ? `"Bhrigu pattern active: ${templateData.karmicText || 'Karmic activation 🔱'}"`
    : 'null'},

  "actionWindow": "${templateData?.actionWindowHint || 'from dasha timeline'}",
  "avoidWindow":  "${templateData?.avoidWindowHint || 'from dasha timeline'}",

  "seoSignals": {
    "primaryKeywords":       ${JSON.stringify(seo.informational)},
    "commercialKeywords":    ${JSON.stringify(seo.commercial)},
    "transactionalKeywords": ${JSON.stringify(seo.transactional)},
    "localKeywords":         ${JSON.stringify(seo.local)},
    "voiceKeywords":         ${JSON.stringify(seo.voice)},
    "trendingKeywords2026":  ["${domain.displayName} vedic astrology 2026", "${domain.displayName} prediction AI astrology", "best vedic astrologer ${domain.displayName} India 2026", "Swiss Ephemeris ${domain.displayName} kundali"],
    "geoQuestion":           "${seo.geoQuestion}",
    "faqAnswers": [
      ${seo.faqQuestions.map((q, i) => `{
        "question": "${q}",
        "answer": "40-60 words. Direct authoritative answer. Cite Vedic classical source + Swiss Ephemeris + Rohiit Gupta expertise. Optimized for Google FAQPage schema + AI search extraction. FAQ ${i + 1} for ${domain.displayName}."
      }`).join(',\n      ')}
    ],
    "ctaSpiritual":       "${seo.ctaSpiritual}",
    "competitorGap":      "${seo.competitorGap}",
    "authorityStatement": "Powered by Trikal Vaani Swiss Ephemeris + BPHS + Bhrigu Nandi Nadi + Shadbala by Rohiit Gupta, Chief Vedic Architect, Delhi NCR — India first AI-powered Vedic astrology platform.",
    "differentiator":     "${seo.competitorGap}",
    "e_e_a_t": {
      "experience":   "Rohiit Gupta 15+ years Vedic astrology under Parashara BPHS tradition, Delhi NCR, India",
      "expertise":    "Swiss Ephemeris + BPHS + Bhrigu Nandi Nadi + Vimshottari Dasha + Shadbala 6-component system",
      "authority":    "Chief Vedic Architect, Trikal Vaani — India first AI-powered Vedic astrology platform",
      "trust":        "Swiss Ephemeris — same precision engine used by professional astrologers worldwide",
      "citations":    ["Brihat Parashara Hora Shastra", "Bhrigu Nandi Nadi", "Vimshottari Dasha system", "Swiss Ephemeris v2.10", "Shadbala classical 6-component"]
    }
  },

  "_promptVersion": "pro-1.2",
  "_tier": "${userContext.tier}",
  "_segment": "${dynSeg}"
}`

  const relocatedNote = (ctx.currentCity !== ctx.birthCity)
    ? `\nRELOCATION: Born in ${ctx.birthCity} — living in ${ctx.currentCity}. Reference naturally in context.`
    : ''

  const situationReminder = ctx.situationNote
    ? `\n⚠️ PRIORITY (60% FOCUS): "${ctx.situationNote}"\nFirst 3 sentences MUST address this pain directly.`
    : `\nNo situationNote — focus on ${dynSeg} PRIMARY pain for ${domain.displayName}.`

  const karmicNote = templateData?.karmicMarker
    ? `\n🔱 KARMIC ACTIVE: Theme: ${templateData.karmicText || 'Karmic activation'}`
    : ''

  const userMessage = `Generate PAID FULL ANALYSIS for: ${domain.displayName}

CLIENT:
${JSON.stringify(ctx, null, 2)}
${situationReminder}${relocatedNote}${karmicNote}

SEGMENT CALIBRATION:
This is a ${dynSeg} client (${gender || 'gender unspecified'}, age ${age}).
Primary concern: ${segFocus.split('PRIMARY:')[1]?.split('SECONDARY:')[0]?.trim() || 'overall wellbeing'}
Every paragraph of the 900-word summary must resonate with their real life situation.

OUTPUT SCHEMA:
${schema}

CRITICAL REMINDERS:
• simpleSummary.text = EXACTLY 900 WORDS — calibrated for ${dynSeg}
• geoBullets = EXACTLY 10 items. 25-40 words each. NO URLs. Entity-rich.
• geoDirectAnswer = 3-4 sentences. Answers AI search directly. NO URLs.
• ALL faqAnswers populated — FAQPage schema for Google rich results
• trendingKeywords2026 populated — 2026 search trends
• Language = ${lang.toUpperCase()} every single word
• JSON only — { to }
• JAI MAA SHAKTI 🔱 — TRIKAL VAANI PRO v1.2`

  return { systemPrompt, userMessage }
}
