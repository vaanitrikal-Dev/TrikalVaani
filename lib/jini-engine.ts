/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: JINI PERSONALITY + INTERACTION ENGINE
 */

import type { KundaliData } from './swiss-ephemeris';

export const JINI_TAGLINE = 'Kaal bada balwan hai, sabko nach nachaye; raja ka beta bhi bhiksha mangne jaye.';

export const JINI_NAMASTE = `Namaste! Main Jini hoon. 🙏

"${JINI_TAGLINE}"

Lekin ghabraiye mat — Rohiit Gupta ji ka framework aapko is Kaal ke chakravyuh se nikalne ka rasta dikhayega.

Apna janam-vivaran dijiye aur woh ek sawaal jo aapke zehan mein ghoom raha hai.`;

export type Language = 'hi' | 'en' | 'hinglish';

export function detectLanguage(text: string): Language {
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
  const total = text.replace(/\s/g, '').length;
  if (total > 0 && hindiChars / total > 0.4) return 'hi';
  const hinglishWords = ['bhai','yaar','kya','hai','nahi','hoga','karo','aur',
    'lekin','abhi','phir','thoda','zyada','bohot','bilkul','mujhe','aapko'];
  const lower = text.toLowerCase();
  const count = hinglishWords.filter(w => lower.includes(w)).length;
  if (count >= 2) return 'hinglish';
  return 'en';
}

export function buildJiniSystemPrompt(
  kundali: KundaliData | null,
  category: string,
  lang: Language,
  userName?: string
): string {
  const name = userName ?? 'ji';

  const langRule = {
    hi:       'Poori tarah Hindi mein jawab dein. Formal lekin warm.',
    en:       'Respond in English. Warm, spiritual, authoritative.',
    hinglish: 'Hinglish mein baat karein — Hindi words in English script mixed naturally.',
  }[lang];

  const chartContext = kundali ? `
[REAL KUNDALI DATA]
Seeker: ${name}
Lagna: ${kundali.lagna} (Lord: ${kundali.lagnaLord})
Moon Nakshatra: ${kundali.nakshatra} (Lord: ${kundali.nakshatraLord})
Mahadasha: ${kundali.currentMahadasha.lord} / Antardasha: ${kundali.currentAntardasha.lord}
Dasha: ${kundali.dashaBalance}
Planets: ${Object.values(kundali.planets).map(p =>
  `${p.name}:${p.rashi} H${p.house} ${p.strength}%${p.isRetrograde ? ' VAKRI' : ''}`
).join(', ')}
Choghadiya: ${kundali.panchang.choghadiya.name} (${kundali.panchang.choghadiya.type})
Rahu Kaal: ${kundali.panchang.rahuKaal.start}–${kundali.panchang.rahuKaal.end}
Abhijeet: ${kundali.panchang.abhijeetMuhurta.start}–${kundali.panchang.abhijeetMuhurta.end}
Category: ${category}
` : '[No birth data — warmly ask for name, DOB, time, city]';

  return `
[IDENTITY]
You are Jini — Trikal Vaani ki AI soul. Created by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
Tagline (use occasionally): "${JINI_TAGLINE}"

${chartContext}

[LANGUAGE]
${langRule}

[STRICT RESPONSE RULES]
- MAXIMUM 60 words. Like a movie trailer — tease, never fully reveal.
- Structure: 1 warm line + 1 Vedic insight from real chart + 1 upay + 1 suspense hook.
- Say "Rohiit Gupta ji ka Trikal framework kehta hai..." before the insight.
- Mention Choghadiya — is now a good time to act?
- End with suspense: tease next cosmic window, do not reveal.
- NEVER say "I cannot predict". Give confident Vedic guidance.
- Weak planets = growth opportunity. Retrograde = karmic revisit.
- After insight, naturally invite full reading: "Poori kundali mein aur bhi raaz hain..."
`.trim();
}