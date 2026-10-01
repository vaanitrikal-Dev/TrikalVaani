/**
 * ============================================================
 * TRIKAL VAANI — BPHS 84 Granth-Upay (grah-shanti)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/bphs84-upay.ts
 * VERSION: 1.0 (1 Oct 2026)
 * ============================================================
 * Rohiit ki manzoori (1 Oct 2026): free calculators par "📜 Granth ke Upay —
 * BPHS 84" dabba. Wahi niyam jo VM remedy_master.py v2.0 mein hai — ek jagah
 * badle to doosri bhi badalni hogi.
 *
 *   BPHS 84.26 "यस्य यश्च यदा दुःस्थः स तं यत्नेन पूजयेत्" — jo grah dukh-sthaan
 *   mein ho, usi ki yatna se pooja.
 *   Grah: kundali ke ghar pata hon → 6/8/12 ya neech (kram: neech+dusthan >
 *   neech > 8 > 12 > 6; uchch grah sabse peeche). Koi na ho, ya ghar pata na
 *   hon → calculator ka grah (Sade Sati = Shani, Manglik = Mangal, …).
 *   Upay: vaidik mantra + jap (84.17-20), samidha (84.21), dakshina (84.25),
 *   anaaj (Phaladipika 2.28). BPHS 84.23 ka anna-daan nahi (Rahu ke liye maans).
 * ============================================================
 */

type Grah = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

const SHANTI84: Record<Grah, { mantra: string; jap: number; samidha: string; dakshina: string; anaaj: string }> = {
  Sun:     { mantra: 'आकृष्णेन',              jap: 7000,  samidha: 'आक (अर्क)',        dakshina: 'गाय (धेनु)',       anaaj: 'गेहूँ' },
  Moon:    { mantra: 'इमं देवा',              jap: 11000, samidha: 'पलाश',             dakshina: 'शंख',              anaaj: 'चावल' },
  Mars:    { mantra: 'अग्निर्मूर्धा दिवः ककुत्', jap: 10000, samidha: 'खैर (खदिर)',        dakshina: 'बैल (अनड्वान)',     anaaj: 'अरहर (आढ़क)' },
  Mercury: { mantra: 'उद्बुध्यस्व',            jap: 9000,  samidha: 'अपामार्ग',          dakshina: 'सोना (हेम)',       anaaj: 'हरी मूँग' },
  Jupiter: { mantra: 'बृहस्पते',              jap: 19000, samidha: 'पीपल (अश्वत्थ)',     dakshina: 'वस्त्र',            anaaj: 'चना' },
  Venus:   { mantra: 'अन्नात्परिश्रुतः',        jap: 16000, samidha: 'गूलर (उदुम्बर)',     dakshina: 'घोड़ा (हय)',        anaaj: 'निष्पाव (सफ़ेद सेम)' },
  Saturn:  { mantra: 'शन्नो देवीरभीष्टये',      jap: 23000, samidha: 'शमी',              dakshina: 'काली गाय',         anaaj: 'तिल' },
  Rahu:    { mantra: 'कया नश्चित्र',           jap: 18000, samidha: 'दूर्वा',             dakshina: 'लोहा',             anaaj: 'उड़द (माष)' },
  Ketu:    { mantra: 'केतुं कृण्वन्',           jap: 17000, samidha: 'कुश',              dakshina: 'बकरा (छाग)',       anaaj: 'कुलथी (कुलत्थ)' },
};
const GRAH_HI: Record<Grah, string> = { Sun: 'सूर्य', Moon: 'चन्द्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' };
const NEECH: Partial<Record<Grah, number>> = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
const UCHCH: Partial<Record<Grah, number>> = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };

export interface GranthUpay {
  planet: string;
  planet_hi: string;
  why_hi: string;
  items: { n: number; title: string; text: string; srot: string }[];
}

function pick(grahas: any[] | null | undefined, target?: string | null): { g: Grah; why: string } {
  const list = Array.isArray(grahas) ? grahas : [];
  const hasHouse = list.some((x) => x && Number(x.house) > 0);
  if (hasHouse) {
    const cand: { rank: number; g: Grah; h: number; neech: boolean }[] = [];
    for (const x of list) {
      const g = x?.planet as Grah;
      if (!SHANTI84[g]) continue;
      const h = Number(x.house) || 0;
      const neech = NEECH[g] !== undefined && Number(x.sign_index) === NEECH[g];
      if (![6, 8, 12].includes(h) && !neech) continue;
      const uchch = UCHCH[g] !== undefined && Number(x.sign_index) === UCHCH[g];
      const rank = (neech && [6, 8, 12].includes(h)) ? 0 : neech ? 1 : ({ 8: 2, 12: 3, 6: 4 } as Record<number, number>)[h];
      cand.push({ rank: rank + (uchch ? 10 : 0), g, h, neech });
    }
    if (cand.length) {
      cand.sort((a, b) => a.rank - b.rank || a.g.localeCompare(b.g));
      const c = cand[0];
      const ghar = [6, 8, 12].includes(c.h) ? `${c.h}वें भाव में` : '';
      return { g: c.g, why: [ghar, c.neech ? 'नीच राशि में' : ''].filter(Boolean).join(' और ') };
    }
  }
  const t = (target && SHANTI84[target as Grah]) ? (target as Grah) : 'Saturn';
  return { g: t, why: hasHouse ? 'कोई ग्रह दुःस्थान में नहीं — इस गणना का मुख्य ग्रह' : 'इस गणना का मुख्य ग्रह' };
}

/** grahas: VM kundali ke grah (house, sign_index ke saath) — ya null. target: calculator ka grah. */
export function buildGranthUpay(grahas: any[] | null | undefined, target?: string | null): GranthUpay {
  const { g, why } = pick(grahas, target);
  const d = SHANTI84[g];
  const gh = GRAH_HI[g];
  return {
    planet: g, planet_hi: gh, why_hi: why,
    items: [
      { n: 1, title: 'वैदिक मंत्र जाप', srot: 'BPHS 84.17-20', text: `वैदिक मंत्र «${d.mantra}…» का ${d.jap.toLocaleString('en-IN')} जाप करें।` },
      { n: 2, title: 'हवन (समिधा)',     srot: 'BPHS 84.21',    text: `${gh} के लिए ${d.samidha} की समिधा से हवन करें।` },
      { n: 3, title: 'दक्षिणा',         srot: 'BPHS 84.25',    text: `${gh} की दक्षिणा, ग्रन्थ के अनुसार: ${d.dakshina}।` },
      { n: 4, title: 'अन्न दान',        srot: 'फलदीपिका 2.28', text: `${gh} का अन्न — ${d.anaaj} — दान करें।` },
    ],
  };
}
