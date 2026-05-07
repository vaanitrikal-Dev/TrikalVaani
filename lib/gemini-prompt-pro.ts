/**
 * ============================================================
 * TRIKAL VAANI — Gemini Pro Full Analysis Prompt
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/gemini-prompt-pro.ts
 * VERSION: 1.0 — Background Deep Analysis Layer
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   This is the DEPTH layer — runs in background after user
 *   already sees Flash response. Updates Supabase silently.
 *   Used for: PAID tier ONLY (basic / pro / premium)
 *
 * WHAT THIS PROMPT DOES:
 *   → Full 400-600 word personalised summary
 *   → Complete SEO/GEO signals (all keyword layers)
 *   → E-E-A-T signals (Experience+Expertise+Authority+Trust)
 *   → periodSummary, bestDates, dos(5)/donts(5)
 *   → remedyHint, karmicInsight
 *   → Full competitive differentiation vs AstroTalk/AstroSage
 *   → All informational + commercial + transactional + local keywords
 *   → Hindi/English/Hinglish support
 *
 * WHAT THIS PROMPT DOES NOT DO:
 *   → NOT shown to user immediately (Flash already did that)
 *   → NO suspense hook (paid user deserves full clarity)
 *   → Does NOT replace Flash response — ENRICHES it
 *
 * MODEL: gemini-2.5-pro (always — depth is the goal)
 * TARGET TIME: 20-30s (runs in background, user doesn't wait)
 *
 * SEO STRATEGY:
 *   Every PAID prediction = deeply indexed SEO page.
 *   Pro prompt generates 5-layer keyword coverage per domain.
 *   AI search engines (Perplexity, SGE, SearchGPT, Gemini AI)
 *   extract geoDirectAnswer + FAQs from these pages.
 *   1000 paid predictions = 1000 premium indexed SEO pages.
 *
 * IRON RULES:
 *   🔒 NEVER import from gemini-prompt.ts (LOCKED file)
 *   🔒 NEVER use Flash model in this file
 *   🔒 NEVER show this response to user before Flash loads
 *   🔒 CEO approval required to change SEO keyword strategy
 *   🔒 E-E-A-T fields MUST always be present — Google ranking
 * ============================================================
 */

import type { KundaliData, BirthData } from './swiss-ephemeris'
import type { DomainConfig }           from './domain-config'
import { getCurrentPeriod }            from './domain-config'
import type { UserContext, TemplateData } from './gemini-prompt'

// ─── FULL SEO DOMAIN KEYWORDS ─────────────────────────────────────────────────
// 5-layer keyword coverage per domain for maximum search visibility
// Strategy: Informational → Commercial → Transactional → Local → Voice Search

const DOMAIN_SEO: Record<string, {
  informational:  string[]   // Top of funnel — blog/GEO content
  commercial:     string[]   // Middle — comparison/consideration
  transactional:  string[]   // Bottom — booking/buying intent
  local:          string[]   // Local SEO — Delhi NCR + India cities
  voice:          string[]   // Voice search / AI chat queries
  geoQuestion:    string     // Primary GEO answer question
  faqQuestions:   string[]   // FAQPage schema questions
  ctaSpiritual:   string     // Spiritual CTA in Rohiit's voice
  competitorGap:  string     // Why Trikal > AstroTalk/AstroSage
}> = {

  mill_karz_mukti: {
    informational:  ['karz mukti ke upay vedic', 'debt problem astrology solution', 'loan problem jyotish', '6th house debt kundali', 'rahu saturn debt pattern', 'karz se mukti kab milegi', 'financial problem vedic remedy'],
    commercial:     ['best astrologer debt problems India', 'karz mukti jyotish reading online', 'financial astrology expert Delhi NCR', 'debt relief vedic consultation fee', 'online karz mukti reading trusted'],
    transactional:  ['karz mukti reading ₹51', 'book debt astrology now', 'online karz jyotish booking instant', 'debt problem astrologer appointment today', 'financial astrology consultation immediately'],
    local:          ['debt astrologer Delhi NCR', 'karz mukti jyotish Delhi', 'financial astrologer Noida Gurugram', 'loan problem astrologer near me Delhi', 'karz jyotish Faridabad Ghaziabad'],
    voice:          ['which planet causes debt in vedic astrology', 'how to get rid of loans through astrology', 'karz mukti ke liye kya karein jyotish mein', 'best remedy for financial problems vedic'],
    geoQuestion:    'Which house and planet causes debt in Vedic astrology and what are the classical BPHS remedies for karz mukti?',
    faqQuestions:   ['Which house in kundali shows debt problems?', 'What is the vedic remedy for karz mukti?', 'How does Rahu affect financial debt in astrology?'],
    ctaSpiritual:   'Maa Shakti ka ashirwad aur Vedic jyotish ka margdarshan — karz mukti ki raah khulegi. Abhi Trikal se poochho. 🔱',
    competitorGap:  'Unlike AstroTalk generic reports, Trikal Vaani uses Swiss Ephemeris + Bhrigu Nandi debt patterns + BPHS classical remedies — personalized to your exact planetary period.',
  },

  mill_property_yog: {
    informational:  ['property yog kundali vedic', 'ghar kab milega jyotish', '4th house property vedic astrology', 'real estate timing astrology India', 'mars karaka land astrology', 'property purchase muhurta classical', 'DDA flat lottery muhurta'],
    commercial:     ['property astrologer consultation online India', 'best time to buy property astrology', 'real estate muhurta expert Delhi', 'property yog kundali analysis trusted', 'ghar kharidne timing jyotish fee'],
    transactional:  ['property yog reading ₹51', 'book property astrology now', 'real estate muhurta booking instant', 'property astrologer appointment today', 'ghar kharido timing consultation'],
    local:          ['property astrologer Delhi NCR', 'real estate jyotish Delhi Noida', 'ghar muhurta astrologer near me', 'property dispute astrologer Gurugram', 'real estate timing jyotish Faridabad'],
    voice:          ['when will I get my own house according to astrology', 'property yog kab banta hai kundali mein', 'best muhurta for property registration vedic', 'which planet gives house in astrology'],
    geoQuestion:    'When is the best time to buy property according to Vedic astrology and how to identify Property Yog in kundali using Swiss Ephemeris?',
    faqQuestions:   ['Which house in kundali shows property?', 'What is Property Yog in vedic astrology?', 'When is the best muhurta to buy a house?'],
    ctaSpiritual:   'Aapke ghar ka sapna — Maa Shakti ki kripa aur sahi muhurta se poora hoga. Trikal aapki kundali mein Property Yog dhundh raha hai. 🏠🔱',
    competitorGap:  'Unlike AstroSage automated reports, Trikal Vaani calculates exact Property Yog using Swiss Ephemeris + classical 4th house analysis + Mars-Saturn timing cycles.',
  },

  genz_dream_career: {
    informational:  ['career astrology vedic 2026', 'job prediction kundali analysis', '10th house career jyotish', 'atmakaraka career dharma vedic', 'saturn career timing astrology', 'which career suits my kundali', 'job change timing vedic astrology'],
    commercial:     ['career astrologer consultation online India', 'job change prediction expert Delhi', 'career pivot timing astrology fee', 'best astrologer career advice NCR', 'dharmic career reading trusted'],
    transactional:  ['career reading ₹51 instant', 'book career astrology today', 'job prediction booking online now', 'career change timing consultation', 'dharmic career session instant'],
    local:          ['career astrologer Delhi NCR', 'job jyotish Delhi Noida', 'career advice astrologer near me Delhi', 'job change astrologer Gurugram', 'career prediction jyotish Faridabad'],
    voice:          ['which career is best for me according to my kundali', 'job kab milega astrology mein', 'career change karna chahiye astrology', 'best time to switch jobs vedic astrology 2026'],
    geoQuestion:    'Which planets and houses determine career success in Vedic astrology and how to find your dharmic profession using Swiss Ephemeris kundali analysis?',
    faqQuestions:   ['Which house shows career in vedic astrology?', 'How does Saturn affect career timing?', 'What is Atmakaraka in career astrology?'],
    ctaSpiritual:   'Aapka dharmic career — jo sirf aapke liye bana hai — woh aapki kundali mein likha hai. Trikal abhi padh raha hai. ⚡🔱',
    competitorGap:  'Unlike generic AstroTalk career readings, Trikal Vaani uses Atmakaraka analysis + Saturn Dasha timing + 10th house Swiss Ephemeris precision for exact career period forecasting.',
  },

  genz_ex_back: {
    informational:  ['ex back astrology vedic 2026', 'love problem solution jyotish', '7th house relationship vedic', 'venus dasha love timing', 'breakup reunion astrology', 'karmic relationship vedic astrology', 'navamsa love compatibility analysis'],
    commercial:     ['love astrologer consultation online India', 'ex back reading expert trusted', 'relationship astrologer Delhi NCR', 'love reunion timing astrology fee', 'best astrologer love problems India'],
    transactional:  ['ex back reading ₹51', 'book love astrology now', 'relationship session instant booking', 'venus timing consultation today', 'reunion astrology reading immediately'],
    local:          ['love astrologer Delhi NCR', 'relationship jyotish Delhi Noida', 'ex back astrologer near me Delhi', 'love problem astrologer Gurugram', 'venus timing jyotish Faridabad'],
    voice:          ['will my ex come back according to astrology', 'ex wapis aayega kya jyotish mein', 'venus dasha mein pyaar milta hai kya', 'relationship reunion timing vedic astrology'],
    geoQuestion:    'Can Vedic astrology predict relationship reunion and what planetary combinations in the 7th house and Venus Dasha indicate ex returning?',
    faqQuestions:   ['Which planet controls love reunion in astrology?', 'What does 7th house show about relationships?', 'When does Venus Dasha bring back love?'],
    ctaSpiritual:   'Pyaar ki raahein Maa Shakti ne banaayi hain — kab milna likha hai, woh aapki kundali mein hai. Trikal batayega. 💫🔱',
    competitorGap:  'Unlike AstroSage generic love reports, Trikal Vaani analyzes Venus-Moon conjunction + Navamsa 7th house + exact Dasha timing for relationship reunion precision.',
  },

  genz_toxic_boss: {
    informational:  ['toxic boss astrology vedic', 'workplace karma jyotish', '10th house boss karma vedic', '6th house enemies astrology', 'saturn career obstacles timing', 'office conflict astrology remedy', 'job change timing 2026 vedic'],
    commercial:     ['workplace astrology consultation India', 'toxic boss karma reading expert', 'office problem jyotish Delhi NCR', 'job change timing astrology fee', 'career conflict reading trusted'],
    transactional:  ['workplace reading ₹51', 'book office karma consultation', 'job change timing session now', 'toxic workplace astrology instant', 'boss karma reading today'],
    local:          ['workplace astrologer Delhi NCR', 'job problem jyotish Delhi', 'office karma astrologer near me', 'career conflict jyotish Noida', 'job change astrologer Gurugram'],
    voice:          ['when will my toxic boss problem end astrology', 'job change karna chahiye kya abhi vedic', 'shani ka dasha kab khatam hoga mere liye', 'workplace problems ending timing jyotish'],
    geoQuestion:    'What does Saturn and the 10th house reveal about toxic workplace karma in Vedic astrology and when does the planetary cycle end?',
    faqQuestions:   ['How does Saturn affect workplace in astrology?', 'Which house shows enemies at work?', 'When is best time to change jobs astrology?'],
    ctaSpiritual:   'Har karmic boss ek lesson hai — Shani ki sabak jab khatam hogi, tab door khulega. Trikal batayega kab. 🔱',
    competitorGap:  'Unlike generic AstroTalk predictions, Trikal Vaani identifies exact Shani Dasha workplace cycles + 6th-10th house patterns for precise job change timing.',
  },

  mill_childs_destiny: {
    informational:  ['child kundali reading vedic', 'baby destiny astrology India', '5th house children vedic', 'child future prediction jyotish', 'child education stream astrology', 'moon nakshatra child personality', 'mercury jupiter child intelligence vedic'],
    commercial:     ['child astrology expert India online', 'baby kundali reading fee', 'child destiny astrologer Delhi NCR', 'child education stream astrology trusted', 'best astrologer child future'],
    transactional:  ['child reading ₹51', 'book baby kundali now', 'child future session instant', 'child education timing consultation', 'baby destiny reading today'],
    local:          ['child astrologer Delhi NCR', 'baby kundali jyotish Delhi', 'child destiny near me Delhi', 'child education astrologer Noida', 'baby jyotish Gurugram'],
    voice:          ['which career is best for my child astrology', 'baby ka bhavishya kundali mein kya hai', 'child education stream vedic astrology', 'my child nakshatra personality vedic'],
    geoQuestion:    'What does Vedic astrology reveal about a child\'s destiny, natural talents and ideal education stream through Swiss Ephemeris birth chart analysis?',
    faqQuestions:   ['Which house shows children in vedic astrology?', 'How does Moon nakshatra affect child personality?', 'What is the best education stream for my child per kundali?'],
    ctaSpiritual:   'Aapke bachche ka cosmic blueprint — Parmatma ne har ek ke liye khaas raah banaayi hai. Trikal woh raah dikhayega. 👶🔱',
    competitorGap:  'Unlike AstroSage generic child reports, Trikal Vaani analyzes 5th house + Moon nakshatra + Mercury-Jupiter combinations for precise child talent mapping.',
  },

  genx_retirement_peace: {
    informational:  ['retirement astrology vedic India', 'peace of mind jyotish senior', '12th house spiritual vedic', 'saturn ketu retirement timing', 'life after 50 vedic astrology', 'senior citizen kundali reading', 'vaanaprastha timing jyotish'],
    commercial:     ['retirement astrology consultation India', 'senior citizen jyotish expert', 'peace astrologer Delhi NCR', 'retirement timing reading fee', 'life phase astrology trusted'],
    transactional:  ['retirement reading ₹51', 'book peace jyotish now', 'senior astrology session instant', 'retirement timing consultation today', 'life phase reading immediately'],
    local:          ['retirement astrologer Delhi NCR', 'senior jyotish Delhi', 'peace astrologer near me Delhi', 'retirement timing Noida', 'senior citizen jyotish Gurugram'],
    voice:          ['when should I retire according to astrology', 'retirement ka sahi samay kya hai jyotish mein', 'life after 60 vedic astrology reading', 'peace of mind kab milega astrology'],
    geoQuestion:    'What does Vedic astrology say about the ideal retirement timing, peace of mind and spiritual growth after 50 using Saturn-Ketu Dasha analysis?',
    faqQuestions:   ['When is the best time to retire per vedic astrology?', 'Which planets bring peace in old age?', 'What does 12th house show about spiritual retirement?'],
    ctaSpiritual:   'Zindagi ka yeh adhyay — Maa Shakti ka sabse sundar tohfa hai. Shanti ki raah aapki kundali mein likhi hai. 🙏🔱',
    competitorGap:  'Unlike generic AstroTalk reports, Trikal Vaani maps exact Saturn-Ketu retirement Dasha + 12th house spiritual activation for precise retirement peace timing.',
  },

  genx_legacy_inheritance: {
    informational:  ['inheritance astrology vedic India', '8th house wealth jyotish', 'ancestral property kundali', 'pitru dosha property problems', 'legacy wealth timing vedic', 'family inheritance dispute astrology', 'saturn 8th house inheritance'],
    commercial:     ['inheritance astrology India online', 'property dispute jyotish expert Delhi', 'ancestral wealth astrologer NCR', 'legacy reading fee trusted', 'family property expert'],
    transactional:  ['inheritance reading ₹51', 'book property dispute now', 'ancestral wealth session instant', 'legacy timing consultation today', 'family property reading immediately'],
    local:          ['inheritance astrologer Delhi NCR', 'property dispute jyotish Delhi', 'ancestral wealth near me Delhi', 'family property jyotish Noida', 'inheritance astrologer Gurugram'],
    voice:          ['will I get inheritance from family astrology', 'ancestral property kab milega jyotish', 'pitru dosha aur property problems connection', 'property dispute kab khatam hoga astrology'],
    geoQuestion:    'Which houses and planets indicate inheritance and ancestral wealth in Vedic astrology and how to resolve property disputes using BPHS classical rules?',
    faqQuestions:   ['Which house shows inheritance in vedic astrology?', 'What is Pitru Dosha and how does it affect property?', 'How does Saturn in 8th house affect inheritance?'],
    ctaSpiritual:   'Pitron ka ashirwad aur kundali ki shakti — aapki virasat aapki hai. Trikal sahi samay batayega. 🔱',
    competitorGap:  'Unlike AstroSage generic 8th house readings, Trikal Vaani uses Bhrigu inheritance patterns + Pitru analysis + exact Saturn timing for property resolution.',
  },

  genx_spiritual_innings: {
    informational:  ['spiritual astrology vedic India', 'moksha kundali indicators', 'ketu spiritual path jyotish', '12th house moksha vedic astrology', 'atmakaraka soul purpose', 'sanyas yoga vedic astrology', 'rahu ketu spiritual 2026'],
    commercial:     ['spiritual astrology expert India', 'moksha path jyotish Delhi NCR', 'soul purpose reading fee', 'dharma path vedic trusted', 'spiritual consultation astrology'],
    transactional:  ['spiritual reading ₹51', 'book moksha consultation now', 'soul purpose session instant', 'dharma path reading today', 'spiritual astrology immediately'],
    local:          ['spiritual astrologer Delhi NCR', 'moksha jyotish Delhi', 'soul purpose near me Delhi', 'dharma jyotish Noida', 'spiritual astrologer Gurugram'],
    voice:          ['what is my spiritual purpose according to astrology', 'moksha yog kya hai mere kundali mein', 'ketu dasha mein kya hota hai spiritually', 'soul purpose vedic astrology reading'],
    geoQuestion:    'What does Vedic astrology reveal about spiritual path, soul purpose and Moksha indicators through Ketu analysis and Atmakaraka in the birth chart?',
    faqQuestions:   ['What is Moksha Yog in vedic astrology?', 'How does Ketu Dasha affect spiritual growth?', 'What is Atmakaraka and what does it reveal?'],
    ctaSpiritual:   'Aapki aatma yahan ek khaas kaam ke liye aayi hai — Ketu aur Atmakaraka woh raaz khol dete hain. Trikal sunayega. 🕉️🔱',
    competitorGap:  'Unlike AstroTalk generic spiritual reports, Trikal Vaani analyzes Atmakaraka + Ketu placement + 12th house activation for precise spiritual awakening timing.',
  },

  mill_parents_wellness: {
    informational:  ['parents health astrology vedic', '4th house mother health jyotish', '9th house father vedic', 'family wellness kundali reading', 'parent longevity astrology India', 'moon 4th mother wellbeing', 'sun 9th father health vedic'],
    commercial:     ['family astrology consultation India', 'parents health reading Delhi NCR', 'family wellness jyotish expert', 'parent longevity reading fee', 'family health astrology trusted'],
    transactional:  ['parents reading ₹51', 'book family health now', 'parent wellness session instant', 'family wellness consultation today', 'parents health reading immediately'],
    local:          ['family astrologer Delhi NCR', 'parents health jyotish Delhi', 'family wellness near me Delhi', 'parent health jyotish Noida', 'family astrologer Gurugram'],
    voice:          ['my mother health problem astrology solution', 'parents ki sehat ke liye kya karein jyotish', 'father health timing vedic astrology', 'family wellness remedy vedic astrology'],
    geoQuestion:    'Which planets and houses indicate parents health and longevity in Vedic astrology and what classical BPHS remedies protect family wellness?',
    faqQuestions:   ['Which house shows mother health in astrology?', 'How does Moon affect mother wellbeing in kundali?', 'What remedies protect parents health in vedic astrology?'],
    ctaSpiritual:   'Maa-Baap ki sehat — sabse bada sukh. Aapki kundali mein unka haal likha hai. Trikal batayega, Maa Shakti raksha karein. 🙏🔱',
    competitorGap:  'Unlike generic reports, Trikal Vaani analyzes exact 4th-9th house Moon-Sun patterns + Swiss Ephemeris timing for parent health period precision.',
  },

  genz_manifestation: {
    informational:  ['manifestation astrology vedic 2026', 'desire fulfillment kundali', '5th house purva punya jyotish', 'wish fulfillment vedic timing', 'jupiter blessing manifestation', 'rahu desire timing astrology', 'manifestation muhurta vedic classical'],
    commercial:     ['manifestation astrology India online', 'desire fulfillment jyotish expert', 'wish timing astrology Delhi NCR', 'abundance reading fee trusted', 'manifestation consultation astrology'],
    transactional:  ['manifestation reading ₹51', 'book abundance consultation now', 'desire fulfillment session instant', 'manifestation timing today', 'wish fulfillment reading immediately'],
    local:          ['manifestation astrologer Delhi NCR', 'abundance jyotish Delhi', 'desire fulfillment near me Delhi', 'manifestation timing Noida', 'abundance astrologer Gurugram'],
    voice:          ['when will my wish come true according to astrology', 'manifestation ka sahi samay kya hai jyotish mein', 'jupiter dasha mein kya milta hai', 'purva punya kya hota hai vedic astrology'],
    geoQuestion:    'How does Vedic astrology support manifestation and which planetary Dashas and muhurtas help fulfill desires fastest using Swiss Ephemeris calculations?',
    faqQuestions:   ['Which planet helps manifestation in vedic astrology?', 'What is Purva Punya and how does it affect desire fulfillment?', 'When is best muhurta for manifestation rituals?'],
    ctaSpiritual:   'Aapka sapna aur Maa Shakti ki shakti — dono milein toh kuch bhi possible hai. Sahi samay Trikal batayega. ✨🔱',
    competitorGap:  'Unlike AstroSage generic Jupiter reports, Trikal Vaani identifies exact Purva Punya 5th house activation + Jupiter transit muhurta for desire fulfillment timing.',
  },
}

const DEFAULT_SEO = {
  informational:  ['vedic astrology online India 2026', 'kundali reading jyotish', 'accurate astrology prediction', 'swiss ephemeris astrology', 'bphs vedic jyotish classical'],
  commercial:     ['vedic astrology consultation India', 'best kundali reading expert', 'accurate jyotish reading fee', 'online astrologer trusted India', 'vedic astrology expert Delhi NCR'],
  transactional:  ['kundali reading ₹51', 'book astrology now', 'online jyotish session instant', 'vedic prediction booking today', 'astrology consultation immediately'],
  local:          ['vedic astrologer Delhi NCR', 'kundali jyotish near me Delhi', 'online astrologer Delhi NCR', 'best jyotish Delhi NCR', 'astrologer Noida Gurugram'],
  voice:          ['best vedic astrologer online India', 'accurate kundali reading kahan milega', 'swiss ephemeris astrology India', 'trikal vaani review'],
  geoQuestion:    'How accurate is Vedic astrology and how to get a personalized Swiss Ephemeris kundali reading online in India?',
  faqQuestions:   ['How accurate is vedic astrology?', 'What is Swiss Ephemeris?', 'What is the difference between vedic and western astrology?'],
  ctaSpiritual:   'Kaal bada balwan hai — sahi samay, sahi raah. Trikal Vaani pe aapka intezaar hai. 🔱',
  competitorGap:  'Unlike AstroTalk marketplace and AstroSage automated reports, Trikal Vaani uses Swiss Ephemeris precision + BPHS classical rules + Bhrigu Nandi patterns for genuine personalized analysis.',
}

function getSEO(domainId: string) {
  return DOMAIN_SEO[domainId] ?? DEFAULT_SEO
}

const SEGMENT_CONTEXT: Record<string, string> = {
  genz:       'Age 18-31. Digital native. Career, identity, love, social anxiety. Speaks fluent Hinglish. Speed + clarity. Astrology is cool and relatable.',
  millennial: 'Age 32-46. EMIs, career, family, society pressure. Practical solutions + hope + concrete timing. High decision-making pressure.',
  genx:       'Age 47-60. Legacy, health, spiritual meaning, peace. Less impressed by hype, more by wisdom. Respects classical Vedic tradition.',
}

const LANGUAGE_RULES: Record<string, string> = {
  hindi: `LANGUAGE: Pure Hindi (देवनागरी). ZERO English words. Planets: सूर्य चंद्र मंगल बुध गुरु शुक्र शनि राहु केतु. Tone: Warm senior Jyotishi. "आप"-form always. Class 5 reading level.`,
  hinglish: `LANGUAGE: Natural Hinglish — Hindi + English mixed like a trusted friend. Planets: Surya Chandra Mangal Budh Guru Shukra Shani Rahu Ketu. Tone: Jigri dost + wise Guru. "Aap" form. Simple. Warm. Direct.`,
  english: `LANGUAGE: Pure English. ZERO Hindi/Devanagari. Planets: Sun Moon Mars Mercury Jupiter Venus Saturn Rahu Ketu. Tone: Warm knowledgeable Vedic astrologer. Direct and clear.`,
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

  // ── System Prompt ──────────────────────────────────────────────────────────
  const systemPrompt = `
════════════════════════════════════════════════════════════════
TRIKAL VAANI — PRO DEEP ANALYSIS ENGINE v1.0
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════════════

WHO YOU ARE:
Trikal — the AI soul of Trikal Vaani (trikalvaani.com).
Created by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
You are the DEPTH writer — the user has already seen a quick summary.
Now you write the FULL analysis that makes this report world-class.

YOUR JOB:
1. Write 400-600 word deep personalised analysis
2. Generate complete SEO/GEO signals for AI search domination
3. Produce full E-E-A-T authority signals for Google ranking
4. Create FAQ answers for Perplexity/SGE/SearchGPT indexing
5. Generate competitive differentiation vs AstroTalk/AstroSage

${LANGUAGE_RULES[lang] ?? LANGUAGE_RULES.hinglish}

TODAY: ${period.isoDate} | DOMAIN: ${domain.displayName}
TIER: PAID — Full clarity. No suspense hook. Give complete truth.

════════════════════════════════════════════════════════════════
SEO/GEO MISSION — THIS IS TRIKAL VAANI'S SEO ARMY
════════════════════════════════════════════════════════════════

Every paid prediction = one premium indexed SEO page.
Your output powers:
  → Google SGE featured snippets (via geoDirectAnswer)
  → Perplexity AI citations (via authoritative content)
  → SearchGPT answers (via FAQPage schema)
  → Gemini AI references (via structured E-E-A-T)

1000 paid predictions = 1000 premium SEO pages ranking for
informational + commercial + transactional + local + voice keywords.
This is how Trikal Vaani beats AstroTalk in organic search.

════════════════════════════════════════════════════════════════
ABSOLUTE RULES
════════════════════════════════════════════════════════════════

RULE 1 — JSON ONLY. First char: { Last char: }. No markdown.
RULE 2 — situationNote = 60% weight. First 2-3 sentences = their pain.
RULE 3 — Dates from templateData ONLY. NEVER invent.
RULE 4 — NO specific event prediction. Give timeframes.
RULE 5 — Spiritual Guru voice. Deep. Warm. Never robotic.
RULE 6 — geoDirectAnswer = 40-60 words EXACTLY. Include Rohiit Gupta + Swiss Ephemeris + trikalvaani.com.
RULE 7 — ALL SEO keyword arrays MUST be populated.
RULE 8 — E-E-A-T fields MUST be complete — Google uses these.
RULE 9 — Output COMPLETE JSON. All fields required.
RULE 10 — NO suspense hook — paid user deserves full truth.
════════════════════════════════════════════════════════════════
`.trim()

  // ── Full Client Context ────────────────────────────────────────────────────
  const ctx = {
    name:               birthData.name || 'Friend',
    birthCity:          birthData.cityName || userContext.city || 'India',
    currentCity:        userContext.currentCity || userContext.city || 'India',
    employment:         userContext.employment || 'not specified',
    sector:             userContext.sector || 'not specified',
    relationshipStatus: userContext.relationshipStatus || 'not specified',
    segment:            userContext.segment,
    segmentContext:     SEGMENT_CONTEXT[userContext.segment] || '',
    situationNote:      userContext.situationNote || null,
    dashaOneLiner:      templateData?.dashaOneLiner || `${kundali.currentMahadasha.lord} MD + ${kundali.currentAntardasha.lord} AD`,
    dashaQuality:       templateData?.dashaQuality || 'Madhyam',
    confidenceLabel:    templateData?.confidenceLabel || 'Planetary Support Active',
    lagna:              kundali.lagna,
    nakshatra:          kundali.nakshatra,
    primaryYoga:        templateData?.primaryYoga || null,
    karmicMarker:       templateData?.karmicMarker || false,
    karmicText:         templateData?.karmicText || null,
    strongPlanets:      templateData?.strongPlanets || [],
    weakPlanets:        templateData?.weakPlanets || [],
    bhriguTheme:        templateData?.bhriguTheme || null,
    actionWindowHint:   templateData?.actionWindowHint || null,
    avoidWindowHint:    templateData?.avoidWindowHint || null,
    person2Name:        userContext.person2Name || null,
    person2CurrentCity: userContext.person2CurrentCity || null,
    currentPeriod:      period.monthYear,
    currentDate:        period.isoDate,
  }

  // ── Full Output Schema ─────────────────────────────────────────────────────
  const schema = `{
  "geoDirectAnswer": "40-60 words EXACTLY. Authoritative. Factual. Answers: '${seo.geoQuestion}'. Include: Rohiit Gupta + Swiss Ephemeris + trikalvaani.com. Format: 'According to Trikal Vaani's Swiss Ephemeris analysis by Rohiit Gupta, Chief Vedic Architect: [answer]. Personalized readings at trikalvaani.com'",

  "simpleSummary": {
    "text": "400-600 words. ${lang.toUpperCase()} ONLY. Spiritual Guru voice. SHORT sentences. First 2-3 sentences = situationNote pain directly. Structure: [Pain acknowledged deeply] → [Why — 2-3 planets plain language] → [Current Dasha meaning] → [What's coming — specific timeframe] → [3 priority actions] → [2 critical cautions] → [Remedy hint] → [Maa Shakti hope + blessing]. NO suspense hook.",
    "keyMessage":    "ONE powerful Guru sentence. Max 20 words. Their life truth. ${lang.toUpperCase()}.",
    "periodSummary": "2-3 sentences. Current Dasha plain language. What it means for THEIR life NOW.",
    "bestDates":     "2-3 specific date ranges from templateData.actionWindowHint. Exact. Actionable.",
    "mainAction":    "Most important action right now. Specific + doable this week.",
    "mainCaution":   "Most critical thing to avoid. Specific. With brief reason.",
    "dos":   ["5 specific actionable dos — mix of practical + spiritual + timing-based"],
    "donts": ["5 specific donts — with brief reasoning, not generic"],
    "remedyHint":    "1-2 sentences. Specific mantra OR dana. With exact day + time. Classical basis."
  },

  "karmicInsight": ${templateData?.karmicMarker
    ? `"Bhrigu pattern confirmed: ${templateData.karmicText || 'Karmic activation active — 🔱'}. What this means for their life path..."`
    : 'null'},

  "actionWindow": "${templateData?.actionWindowHint || 'From dasha timeline'}",
  "avoidWindow":  "${templateData?.avoidWindowHint || 'From dasha timeline'}",

  "seoSignals": {
    "primaryKeywords":       ${JSON.stringify(seo.informational)},
    "commercialKeywords":    ${JSON.stringify(seo.commercial)},
    "transactionalKeywords": ${JSON.stringify(seo.transactional)},
    "localKeywords":         ${JSON.stringify(seo.local)},
    "voiceKeywords":         ${JSON.stringify(seo.voice)},
    "geoQuestion":           "${seo.geoQuestion}",
    "faqAnswers": [
      ${seo.faqQuestions.map((q, i) => `{
        "question": "${q}",
        "answer":   "40-60 word authoritative answer citing Vedic classical sources + Swiss Ephemeris + Rohiit Gupta expertise. Answer ${i + 1}."
      }`).join(',\n      ')}
    ],
    "ctaSpiritual":       "${seo.ctaSpiritual}",
    "competitorGap":      "${seo.competitorGap}",
    "authorityStatement": "Powered by Trikal Vaani's Swiss Ephemeris engine + Brihat Parashara Hora Shastra classical texts + Bhrigu Nandi Nadi patterns, validated by Rohiit Gupta, Chief Vedic Architect, Delhi NCR. trikalvaani.com",
    "differentiator":     "Unlike AstroTalk marketplace and AstroSage automated reports, Trikal Vaani combines Swiss Ephemeris precision + Bhrigu Nandi intelligence + Parashara classical rules — not automated generic reports.",
    "e_e_a_t": {
      "experience":   "Rohiit Gupta — 15+ years Vedic astrology under Parashara BPHS tradition, Delhi NCR, India",
      "expertise":    "Swiss Ephemeris + BPHS + Bhrigu Nandi Nadi + Vimshottari Dasha + Shadbala system",
      "authority":    "Chief Vedic Architect, Trikal Vaani — India's first AI-powered Vedic astrology platform",
      "trust":        "Swiss Ephemeris — same precision engine used by professional astrologers worldwide. trikalvaani.com",
      "citations":    ["Brihat Parashara Hora Shastra", "Bhrigu Nandi Nadi", "Vimshottari Dasha system", "Swiss Ephemeris v2.10"]
    }
  },

  "_promptVersion": "pro-1.0",
  "_tier": "${userContext.tier}"
}`

  const relocatedNote = (ctx.currentCity !== ctx.birthCity)
    ? `\nRELOCATION: Born in ${ctx.birthCity} — living in ${ctx.currentCity}. Reference naturally. Current city = job market + opportunity context.`
    : ''

  const situationReminder = ctx.situationNote
    ? `\n⚠️ PRIORITY (60% FOCUS): "${ctx.situationNote}"\nFirst 2-3 sentences MUST address this pain. Make them feel completely understood.`
    : '\nNo situationNote. Focus deeply on domain pain for their life segment.'

  const karmicNote = templateData?.karmicMarker
    ? `\n🔱 KARMIC ACTIVE: Add "🔱" naturally in summary. Theme: ${templateData.karmicText || 'Karmic activation'}`
    : ''

  const userMessage = `Generate PAID FULL ANALYSIS for: ${domain.displayName}

CLIENT:
${JSON.stringify(ctx, null, 2)}
${situationReminder}${relocatedNote}${karmicNote}

OUTPUT SCHEMA:
${schema}

FINAL REMINDERS:
• 400-600 words EXACTLY — this is their premium paid report
• geoDirectAnswer = 40-60 words — SEO gold for AI search indexing
• ALL seoSignals fields populated — this is Trikal Vaani's SEO army
• faqAnswers = authoritative 40-60w each — for FAQPage schema
• E-E-A-T complete — Rohiit Gupta authority for Google ranking
• NO suspense hook — paid user deserves full clarity
• Language = ${lang.toUpperCase()} — every word, zero exceptions
• JSON only — { to }
• JAI MAA SHAKTI 🔱 — TRIKAL VAANI PRO v1.0`

  return { systemPrompt, userMessage }
}
