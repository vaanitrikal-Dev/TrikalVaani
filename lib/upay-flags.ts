// ============================================================
// File: lib/upay-flags.ts   (NEW FILE)
// Version: v1.1 — 11 Oct 2026
//   v1.1: UPAY_PAID_ON = true — report v2 (Hindi + Hinglish, 7-12 upay, ratna,
//         graha shanti, ek-grah report) taiyaar; ₹51 bikri wapas chalu.
//   v1.0: pehla version (bikri band).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// Upay Calculator ke chhote, browser-safe niyam — client aur server dono
// yahin se padhte hain (is file mein koi secret ya server import nahi).
//
// 1. UPAY_PAID_ON — ₹51 Upay Report ki bikri (Rohiit, 11 Oct 2026):
//    report ki tagging aur dhaancha theek hone tak BAND. Free calculator chalta
//    rahega. Wapas chalu karne ke liye sirf `true` karein.
// 2. isCrisisText — grahak "apni baat" mein aatmhatya / khud ko nuksaan /
//    gehra mansik sankat likhe to report sabse upar helpline dikhati hai,
//    ₹499 ka message hat jaata hai, aur CEO email URGENT jaata hai.
//    Jaan-boojh kar zyada pakadta hai — galti se helpline dikh jaana theek hai,
//    chhoot jaana nahi.
// ============================================================

export const UPAY_PAID_ON = true;

const CRISIS_RE = new RegExp(
  [
    // English
    'suicid', 'kill (my|him|her)self', 'self[- ]?harm', 'end (my|his|her) life', 'overdose', 'want to die',
    'depress',
    // Hinglish
    'aatm ?hat', 'atm ?hat', 'aatmahat', 'khud ?kushi', 'khudkhushi', 'khud ko (nuksaan|nuksan|maar|khatam)',
    'jaan (de|dena|dene|le|lena)', 'mar(na|ne) (chahta|chahti|chahte)', 'jeena nahi', 'jina nahi',
    'nas kaat', 'zeher (kha|pi)', 'jahar (kha|pi)', 'fansi', 'phansi',
    // Hindi (Devanagari)
    'आत्महत्या', 'खुदकुशी', 'ख़ुदकुशी', 'जान दे', 'जान ले', 'मरना चाह', 'जीना नहीं', 'डिप्रेशन', 'अवसाद',
    'फाँसी', 'फांसी', 'ज़हर', 'जहर',
  ].join('|'),
  'i',
);

export function isCrisisText(t?: string | null): boolean {
  return !!t && CRISIS_RE.test(String(t));
}

export const CRISIS_HELP = {
  teleManas: '14416',
  teleManasAlt: '1-800-891-4416',
  emergency: '112',
};
// END — lib/upay-flags.ts v1.1
