/**
 * ============================================================
 * TRIKAL VAANI — BPHS Adhyay 83: पूर्वजन्मशापद्योतनाध्याय
 * File: lib/bphs83-shaap.ts
 * VERSION: 1.0 (1 Oct 2026)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * ============================================================
 * Rohiit, 1 Oct 2026: "pls add these as well — BPHS 83 (purva janm ke shaap,
 * 111 shlok)" Karmic report mein.
 *
 * KYA HAI: BPHS adhyay 83 ke ~80 yog — sarp, pitru, matru, bhratru, matul,
 * brahma, patni aur pret shaap — har ek ka shlok-ank ke saath niyam, aur
 * har shaap ki granth ki shanti. Library (bphs_slokas, chapter 83) ka
 * Sanskrit poora padh kar likha gaya.
 *
 * ⚠️ SANDARBH — granth in shaapon ko SANTAN-HAANI (सुतक्षय) ke kaaran ki
 * tarah kehta hai. Report mein yahi likha jaata hai, ise "saamanya
 * durbhagya" nahi banaya jaata.
 *
 * ⚠️ GHOSHIT MANYATAYEIN (granth seedha nahi kehta, humne maana):
 *   - paap grah = Surya, Mangal, Shani, Rahu, Ketu
 *   - shubh grah = Guru, Shukra, Budh, Chandra (kshina na ho)
 *   - "सौम्य" = Budh (BPHS mein aksar Budh ke liye)
 *   - "कारक" = Guru (putrakaraka) — ye adhyay putra ka hai
 *   - kshina Chandra = Surya se 72° ke andar
 *   - dusthan (दुःस्थ) = 6, 8, 12
 *   - balheen = shadbala isStrong false (Rahu/Ketu par lagu nahi)
 *   - drishti = Parashari poori drishti: sab 7vi; Mangal 4,8; Guru 5,9;
 *     Shani 3,10; Rahu/Ketu sirf 7vi
 *   - ast (लुप्त) = Surya se: Chandra 12°, Mangal 17°, Budh 14°, Guru 11°,
 *     Shukra 10°, Shani 15°
 *   - पितृस्थान = 9va, मातृस्थान = 4tha, भ्रातृस्थान = 3ra, ज्ञाति = 6tha
 *   - JAANCH NAHI: 13, 104 (Mandi chahiye — chart mein nahi), 105
 *     ("वधस्थान" kaunsa ghar, granth saaf nahi karta)
 * ============================================================
 */

type G = 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';

const SIGN_LORD: G[] = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const SIGNS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
const PAAP: G[] = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
const SHUBH: G[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
const AST_DEG: Partial<Record<G, number>> =
  { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };

function signIndexOf(name: string): number {
  const n = String(name || '').toLowerCase();
  const i = SIGNS.findIndex((s) => n.startsWith(s.toLowerCase().slice(0, 4)));
  return i;
}

/** Chart ko engine ke kaam ke roop mein — VM /kundali ke jawab se. */
export function makeChart(kd: any) {
  const graha: Record<string, any> = {};
  for (const g of kd?.grahas ?? []) graha[g.planet] = g;
  const nav: Record<string, any> = {};
  for (const g of kd?.navamsa?.grahas ?? []) nav[g.planet] = g;
  const L = signIndexOf(kd?.lagna?.sign);
  return { graha, nav, L, ok: L >= 0 && Object.keys(graha).length >= 9 };
}

type Chart = ReturnType<typeof makeChart>;

function H(c: Chart) {
  const house = (p: G): number => Number(c.graha[p]?.house ?? 0);
  const lord = (h: number): G => SIGN_LORD[(c.L + h - 1) % 12];
  const signOfHouse = (h: number) => (c.L + h - 1) % 12;
  const sIdx = (p: G): number => {
    const v = c.graha[p]?.sign_index;
    return typeof v === 'number' ? v : signIndexOf(c.graha[p]?.sign);
  };
  const lon = (p: G): number => Number(c.graha[p]?.longitude ?? NaN);
  const inH = (p: G, ...hs: number[]) => hs.includes(house(p));
  const conj = (a: G, b: G) => house(a) > 0 && house(a) === house(b);
  const aspHouse = (from: G, target: number) => {
    const d = ((target - house(from) + 12) % 12) + 1;
    if (d === 7) return true;
    if (from === 'Mars') return d === 4 || d === 8;
    if (from === 'Jupiter') return d === 5 || d === 9;
    if (from === 'Saturn') return d === 3 || d === 10;
    return false;
  };
  const asp = (from: G, to: G) => aspHouse(from, house(to));
  const joinOrSee = (p: G, q: G) => conj(p, q) || asp(q, p);
  const kshinaMoon = () => {
    const d = Math.abs(((lon('Moon') - lon('Sun') + 540) % 360) - 180);
    return Number.isFinite(d) && d <= 72;
  };
  const paap = (): G[] => [...PAAP, ...(kshinaMoon() ? ['Moon' as G] : [])];
  const isPaap = (p: G) => paap().includes(p);
  const paapIn = (h: number) => paap().some((p) => house(p) === h);
  const withPaap = (p: G) => paap().some((q) => q !== p && conj(p, q));
  const seenByPaap = (p: G) => paap().some((q) => q !== p && asp(q, p));
  const hemmed = (h: number) => paapIn(((h - 2 + 12) % 12) + 1) && paapIn((h % 12) + 1);
  const dusthe = (p: G) => inH(p, 6, 8, 12);
  const cls = (p: G) => String(c.graha[p]?.shadbala?.classification ?? '').toLowerCase();
  const neech = (p: G) => cls(p).includes('debil');
  const enemySign = (p: G) => cls(p).includes('enemy');
  const weak = (p: G) => {
    const s = c.graha[p]?.shadbala;
    if (p === 'Rahu' || p === 'Ketu' || !s) return false;
    return s.isStrong === false;
  };
  const navLord = (p: G): string => String(c.nav[p]?.sign_lord ?? '');
  const paapSign = (p: G) => ['Sun', 'Mars', 'Saturn'].includes(SIGN_LORD[sIdx(p)] ?? '');
  const signLordIs = (h: number, g: G) => SIGN_LORD[signOfHouse(h)] === g;
  const ast = (p: G) => {
    const lim = AST_DEG[p]; if (!lim) return false;
    const d = Math.abs(((lon(p) - lon('Sun') + 540) % 360) - 180);
    return Number.isFinite(d) && d <= lim;
  };
  const inOwnSignOf = (p: G, g: G) => SIGN_LORD[sIdx(p)] === g;
  return { house, lord, inH, conj, asp, aspHouse, joinOrSee, kshinaMoon, isPaap,
           paapIn, withPaap, seenByPaap, hemmed, dusthe, neech, enemySign, weak,
           navLord, paapSign, signLordIs, ast, inOwnSignOf };
}

export type ShaapKism = 'saamanya' | 'sarp' | 'pitru' | 'matru' | 'bhratru' | 'matul'
  | 'brahma' | 'patni' | 'pret';

interface Yog { sl: number; kism: ShaapKism; shart: string; test: (h: ReturnType<typeof H>) => boolean }

/* Har yog shlok se — `shart` Trikaal ka arth (Hinglish), test usi ka ganit. */
const YOG: Yog[] = [
  // ── saamanya (7-8)
  { sl: 7, kism: 'saamanya', shart: 'Guru, lagnesh, saptamesh aur panchamesh — chaaron balheen',
    test: (h) => (['Jupiter'] as G[]).concat([h.lord(1), h.lord(7), h.lord(5)]).every((p) => h.weak(p)) },

  // ── SARP SHAAP (9-16)
  { sl: 9, kism: 'sarp', shart: 'Rahu 5ve ghar mein, aur us par Mangal ki drishti ho ya 5va ghar Mangal ki raashi ho',
    test: (h) => h.inH('Rahu', 5) && (h.aspHouse('Mars', 5) || h.signLordIs(5, 'Mars')) },
  { sl: 10, kism: 'sarp', shart: 'Panchamesh Rahu ke saath, Shani 5ve mein, aur Shani par Chandra ki yuti ya drishti',
    test: (h) => h.conj(h.lord(5), 'Rahu') && h.inH('Saturn', 5) && h.joinOrSee('Saturn', 'Moon') },
  { sl: 11, kism: 'sarp', shart: 'Guru (karak) Rahu ke saath, panchamesh balheen, lagnesh Mangal ke saath',
    test: (h) => h.conj('Jupiter', 'Rahu') && h.weak(h.lord(5)) && h.conj(h.lord(1), 'Mars') },
  { sl: 12, kism: 'sarp', shart: 'Guru Mangal ke saath, Rahu lagna mein, panchamesh dusthan mein',
    test: (h) => h.conj('Jupiter', 'Mars') && h.inH('Rahu', 1) && h.dusthe(h.lord(5)) },
  { sl: 14, kism: 'sarp', shart: '5va ghar Mangal ki raashi, panchamesh Rahu ke saath, aur us par Budh ki drishti ya yuti',
    test: (h) => h.signLordIs(5, 'Mars') && h.conj(h.lord(5), 'Rahu') && h.joinOrSee(h.lord(5), 'Mercury') },
  { sl: 15, kism: 'sarp', shart: 'Surya, Shani, Mangal, Rahu, Budh, Guru — sab 5ve mein, aur panchamesh-lagnesh balheen',
    test: (h) => (['Sun', 'Saturn', 'Mars', 'Rahu', 'Mercury', 'Jupiter'] as G[]).every((p) => h.inH(p, 5))
      && h.weak(h.lord(5)) && h.weak(h.lord(1)) },
  { sl: 16, kism: 'sarp', shart: 'Lagnesh Rahu ke saath, aur panchamesh Mangal ke saath (ya Guru Rahu ke saath)',
    test: (h) => h.conj(h.lord(1), 'Rahu') && (h.conj(h.lord(5), 'Mars') || h.conj('Jupiter', 'Rahu')) },

  // ── PITRU SHAAP (20-30)
  { sl: 20, kism: 'pitru', shart: 'Surya 5ve mein neech, Shani ke navansh mein, aur dono taraf paap grah',
    test: (h) => h.inH('Sun', 5) && h.neech('Sun') && h.navLord('Sun') === 'Saturn' && h.hemmed(5) },
  { sl: 21, kism: 'pitru', shart: 'Panchamesh Surya, trikon mein paap ke saath, paapon ke beech, aur paap ki drishti',
    test: (h) => h.lord(5) === 'Sun' && h.inH('Sun', 1, 5, 9) && h.withPaap('Sun')
      && h.hemmed(h.house('Sun')) && h.seenByPaap('Sun') },
  { sl: 22, kism: 'pitru', shart: 'Guru Simha mein, panchamesh Surya ke saath, aur 5ve va lagna mein paap',
    test: (h) => h.inOwnSignOf('Jupiter', 'Sun') && h.conj(h.lord(5), 'Sun') && h.paapIn(5) && h.paapIn(1) },
  { sl: 23, kism: 'pitru', shart: 'Balheen lagnesh 5ve mein, panchamesh Surya ke saath, 5ve va lagna mein paap',
    test: (h) => h.weak(h.lord(1)) && h.inH(h.lord(1), 5) && h.conj(h.lord(5), 'Sun') && h.paapIn(5) && h.paapIn(1) },
  { sl: 24, kism: 'pitru', shart: 'Navamesh 5ve mein ya panchamesh 10ve mein, aur 5ve va lagna mein paap',
    test: (h) => (h.inH(h.lord(9), 5) || h.inH(h.lord(5), 10)) && h.paapIn(5) && h.paapIn(1) },
  { sl: 25, kism: 'pitru', shart: 'Navamesh Mangal, panchamesh ke saath, aur lagna, 5ve va 9ve mein paap',
    test: (h) => h.lord(9) === 'Mars' && h.conj('Mars', h.lord(5)) && h.paapIn(1) && h.paapIn(5) && h.paapIn(9) },
  { sl: 26, kism: 'pitru', shart: 'Navamesh dusthan mein, Guru paap raashi mein, panchamesh-lagnesh paap ke saath',
    test: (h) => h.dusthe(h.lord(9)) && h.paapSign('Jupiter') && h.withPaap(h.lord(5)) && h.withPaap(h.lord(1)) },
  { sl: 27, kism: 'pitru', shart: 'Surya, Mangal, Shani lagna/5ve mein, aur Rahu-Guru 8ve/12ve mein',
    test: (h) => (['Sun', 'Mars', 'Saturn'] as G[]).every((p) => h.inH(p, 1, 5))
      && h.inH('Rahu', 8, 12) && h.inH('Jupiter', 8, 12) },
  { sl: 28, kism: 'pitru', shart: 'Surya 8ve mein, Shani 5ve mein, panchamesh Rahu ke saath, lagna mein paap',
    test: (h) => h.inH('Sun', 8) && h.inH('Saturn', 5) && h.conj(h.lord(5), 'Rahu') && h.paapIn(1) },
  { sl: 29, kism: 'pitru', shart: 'Vyayesh lagna mein, ashtamesh 5ve mein, navamesh 8ve mein',
    test: (h) => h.inH(h.lord(12), 1) && h.inH(h.lord(8), 5) && h.inH(h.lord(9), 8) },
  { sl: 30, kism: 'pitru', shart: 'Shashthesh 5ve mein, navamesh 6the mein, Guru Rahu ke saath',
    test: (h) => h.inH(h.lord(6), 5) && h.inH(h.lord(9), 6) && h.conj('Jupiter', 'Rahu') },

  // ── MATRU SHAAP (34-46)
  { sl: 34, kism: 'matru', shart: 'Panchamesh Chandra neech ya paapon ke beech, aur 4the va 5ve mein paap',
    test: (h) => h.lord(5) === 'Moon' && (h.neech('Moon') || h.hemmed(h.house('Moon'))) && h.paapIn(4) && h.paapIn(5) },
  { sl: 35, kism: 'matru', shart: 'Shani 11ve mein, 4the mein paap, aur Chandra neech hokar 5ve mein',
    test: (h) => h.inH('Saturn', 11) && h.paapIn(4) && h.neech('Moon') && h.inH('Moon', 5) },
  { sl: 36, kism: 'matru', shart: 'Panchamesh dusthan mein, lagnesh neech, Chandra paap ke saath',
    test: (h) => h.dusthe(h.lord(5)) && h.neech(h.lord(1)) && h.withPaap('Moon') },
  { sl: 37, kism: 'matru', shart: 'Panchamesh 8/6/12 mein, Chandra paap navansh mein, lagna va 5ve mein paap',
    test: (h) => h.dusthe(h.lord(5)) && ['Sun', 'Mars', 'Saturn'].includes(h.navLord('Moon'))
      && h.paapIn(1) && h.paapIn(5) },
  { sl: 38, kism: 'matru', shart: 'Panchamesh Chandra, Shani-Rahu-Mangal ke saath, 9ve ya 5ve mein',
    test: (h) => h.lord(5) === 'Moon' && h.conj('Moon', 'Saturn') && h.conj('Moon', 'Rahu')
      && h.conj('Moon', 'Mars') && h.inH('Moon', 9, 5) },
  { sl: 39, kism: 'matru', shart: 'Chaturthesh Mangal, Shani-Rahu ke saath; Chandra-Surya 5ve ya lagna mein',
    test: (h) => h.lord(4) === 'Mars' && h.conj('Mars', 'Saturn') && h.conj('Mars', 'Rahu')
      && h.conj('Moon', 'Sun') && h.inH('Moon', 5, 1) },
  { sl: 40, kism: 'matru', shart: 'Lagnesh-panchamesh 6the mein, chaturthesh 8ve mein, navamesh-ashtamesh lagna mein',
    test: (h) => h.inH(h.lord(1), 6) && h.inH(h.lord(5), 6) && h.inH(h.lord(4), 8)
      && h.inH(h.lord(9), 1) && h.inH(h.lord(8), 1) },
  { sl: 41, kism: 'matru', shart: 'Shashthesh-ashtamesh lagna mein, chaturthesh 12ve mein, Chandra-Guru 5ve mein paap ke saath',
    test: (h) => h.inH(h.lord(6), 1) && h.inH(h.lord(8), 1) && h.inH(h.lord(4), 12)
      && h.inH('Moon', 5) && h.inH('Jupiter', 5) && h.withPaap('Moon') },
  { sl: 42, kism: 'matru', shart: 'Lagna paapon ke beech, kshina Chandra 7ve mein, Rahu-Shani 4the/5ve mein',
    test: (h) => h.hemmed(1) && h.kshinaMoon() && h.inH('Moon', 7) && h.inH('Rahu', 4, 5) && h.inH('Saturn', 4, 5) },
  { sl: 43, kism: 'matru', shart: 'Ashtamesh 5ve mein, panchamesh 8ve mein, Chandra aur chaturthesh dusthan mein',
    test: (h) => h.inH(h.lord(8), 5) && h.inH(h.lord(5), 8) && h.dusthe('Moon') && h.dusthe(h.lord(4)) },
  { sl: 44, kism: 'matru', shart: 'Kark lagna mein Mangal-Rahu, aur Chandra-Shani 5ve mein',
    test: (h) => h.signLordIs(1, 'Moon') && h.inH('Mars', 1) && h.inH('Rahu', 1) && h.inH('Moon', 5) && h.inH('Saturn', 5) },
  { sl: 45, kism: 'matru', shart: 'Mangal lagna, Rahu 5ve, Surya 8ve, Shani 12ve mein; chaturthesh-lagnesh dusthan mein',
    test: (h) => h.inH('Mars', 1) && h.inH('Rahu', 5) && h.inH('Sun', 8) && h.inH('Saturn', 12)
      && h.dusthe(h.lord(4)) && h.dusthe(h.lord(1)) },
  { sl: 46, kism: 'matru', shart: 'Guru 8ve mein Mangal-Rahu ke saath, Shani-Chandra 5ve mein',
    test: (h) => h.inH('Jupiter', 8) && h.conj('Jupiter', 'Mars') && h.conj('Jupiter', 'Rahu')
      && h.inH('Saturn', 5) && h.inH('Moon', 5) },

  // ── BHRATRU SHAAP (52-61)
  { sl: 52, kism: 'bhratru', shart: 'Tritiyesh 5ve mein Mangal-Rahu ke saath, panchamesh-lagnesh 8ve mein',
    test: (h) => h.inH(h.lord(3), 5) && h.conj(h.lord(3), 'Mars') && h.conj(h.lord(3), 'Rahu')
      && h.inH(h.lord(5), 8) && h.inH(h.lord(1), 8) },
  { sl: 53, kism: 'bhratru', shart: 'Mangal-Shani lagna/5ve mein, tritiyesh 9ve mein, Guru 8ve mein',
    test: (h) => h.inH('Mars', 1, 5) && h.inH('Saturn', 1, 5) && h.inH(h.lord(3), 9) && h.inH('Jupiter', 8) },
  { sl: 54, kism: 'bhratru', shart: 'Guru neech hokar 3re mein, Shani 5ve mein, Chandra-Mangal 8ve mein',
    test: (h) => h.inH('Jupiter', 3) && h.neech('Jupiter') && h.inH('Saturn', 5) && h.inH('Moon', 8) && h.inH('Mars', 8) },
  { sl: 55, kism: 'bhratru', shart: 'Lagnesh 12ve mein, Mangal 5ve mein, panchamesh 8ve mein paap ke saath',
    test: (h) => h.inH(h.lord(1), 12) && h.inH('Mars', 5) && h.inH(h.lord(5), 8) && h.withPaap(h.lord(5)) },
  { sl: 56, kism: 'bhratru', shart: 'Lagna aur 5va dono paapon ke beech, lagnesh-panchamesh dusthan mein',
    test: (h) => h.hemmed(1) && h.hemmed(5) && h.dusthe(h.lord(1)) && h.dusthe(h.lord(5)) },
  { sl: 57, kism: 'bhratru', shart: 'Dashamesh 3re mein paap ke saath, aur 5ve mein shubh grah Mangal ke saath',
    test: (h) => h.inH(h.lord(10), 3) && h.withPaap(h.lord(10))
      && SHUBH.some((p) => h.inH(p, 5) && h.conj(p, 'Mars')) },
  { sl: 58, kism: 'bhratru', shart: '5va Budh ki raashi, usmein Shani-Rahu; Budh-Mangal 12ve mein',
    test: (h) => h.signLordIs(5, 'Mercury') && h.inH('Saturn', 5) && h.inH('Rahu', 5)
      && h.inH('Mercury', 12) && h.inH('Mars', 12) },
  { sl: 59, kism: 'bhratru', shart: 'Lagnesh 3re mein, tritiyesh 5ve mein, lagna-3re-5ve mein paap',
    test: (h) => h.inH(h.lord(1), 3) && h.inH(h.lord(3), 5) && h.paapIn(1) && h.paapIn(3) && h.paapIn(5) },
  { sl: 60, kism: 'bhratru', shart: 'Tritiyesh 8ve mein, Guru 5ve mein, aur Guru par Rahu-Shani ki yuti ya drishti',
    test: (h) => h.inH(h.lord(3), 8) && h.inH('Jupiter', 5) && h.joinOrSee('Jupiter', 'Rahu') && h.joinOrSee('Jupiter', 'Saturn') },
  { sl: 61, kism: 'bhratru', shart: 'Ashtamesh 5ve mein tritiyesh ke saath, Mangal-Shani 8ve mein',
    test: (h) => h.inH(h.lord(8), 5) && h.conj(h.lord(8), h.lord(3)) && h.inH('Mars', 8) && h.inH('Saturn', 8) },

  // ── MATUL SHAAP (65-68)
  { sl: 65, kism: 'matul', shart: 'Budh-Guru 5ve mein Mangal-Rahu ke saath, Shani lagna mein',
    test: (h) => h.inH('Mercury', 5) && h.inH('Jupiter', 5) && h.inH('Mars', 5) && h.inH('Rahu', 5) && h.inH('Saturn', 1) },
  { sl: 66, kism: 'matul', shart: 'Lagnesh-panchamesh 5ve mein Budh, Mangal, Shani ke saath',
    test: (h) => h.inH(h.lord(1), 5) && h.inH(h.lord(5), 5) && h.inH('Mercury', 5) && h.inH('Mars', 5) && h.inH('Saturn', 5) },
  { sl: 67, kism: 'matul', shart: 'Panchamesh ast hokar lagna mein, Shani 7ve mein, lagnesh Budh ke saath',
    test: (h) => h.ast(h.lord(5)) && h.inH(h.lord(5), 1) && h.inH('Saturn', 7) && h.conj(h.lord(1), 'Mercury') },
  { sl: 68, kism: 'matul', shart: 'Shashthesh (gyati) lagna mein vyayesh ke saath, Chandra-Budh-Mangal 5ve mein',
    test: (h) => h.inH(h.lord(6), 1) && h.conj(h.lord(6), h.lord(12)) && h.inH('Moon', 5) && h.inH('Mercury', 5) && h.inH('Mars', 5) },

  // ── BRAHMA SHAAP (72-78)
  { sl: 72, kism: 'brahma', shart: 'Rahu Guru ki raashi mein, Guru-Mangal-Shani 5ve mein, navamesh 8ve mein',
    test: (h) => h.inOwnSignOf('Rahu', 'Jupiter') && h.inH('Jupiter', 5) && h.inH('Mars', 5) && h.inH('Saturn', 5) && h.inH(h.lord(9), 8) },
  { sl: 73, kism: 'brahma', shart: 'Navamesh 5ve mein, panchamesh 8ve mein Guru-Mangal-Rahu ke saath',
    test: (h) => h.inH(h.lord(9), 5) && h.inH(h.lord(5), 8) && h.conj(h.lord(5), 'Jupiter') && h.conj(h.lord(5), 'Mars') && h.conj(h.lord(5), 'Rahu') },
  { sl: 74, kism: 'brahma', shart: 'Navamesh neech, vyayesh 5ve mein Rahu ki yuti ya drishti ke saath',
    test: (h) => h.neech(h.lord(9)) && h.inH(h.lord(12), 5) && h.joinOrSee(h.lord(12), 'Rahu') },
  { sl: 75, kism: 'brahma', shart: 'Guru neech, Rahu lagna ya 5ve mein, panchamesh dusthan mein',
    test: (h) => h.neech('Jupiter') && h.inH('Rahu', 1, 5) && h.dusthe(h.lord(5)) },
  { sl: 76, kism: 'brahma', shart: 'Panchamesh Guru 8ve mein paap ke saath, ya panchamesh Surya-Chandra ke saath',
    test: (h) => (h.lord(5) === 'Jupiter' && h.inH('Jupiter', 8) && h.withPaap('Jupiter'))
      || (h.conj(h.lord(5), 'Sun') && h.conj(h.lord(5), 'Moon')) },
  { sl: 77, kism: 'brahma', shart: 'Guru Shani ke navansh mein, Shani aur Mangal ke saath; panchamesh 12ve mein',
    test: (h) => h.navLord('Jupiter') === 'Saturn' && h.conj('Jupiter', 'Saturn') && h.conj('Jupiter', 'Mars') && h.inH(h.lord(5), 12) },
  { sl: 78, kism: 'brahma', shart: 'Guru-Shani lagna mein, aur Rahu 9ve ya 12ve mein',
    test: (h) => h.inH('Jupiter', 1) && h.inH('Saturn', 1) && h.inH('Rahu', 9, 12) },

  // ── PATNI SHAAP (82-92)
  { sl: 82, kism: 'patni', shart: 'Saptamesh 5ve mein, uske navansh ka swami Shani, panchamesh 8ve mein',
    test: (h) => h.inH(h.lord(7), 5) && h.navLord(h.lord(7)) === 'Saturn' && h.inH(h.lord(5), 8) },
  { sl: 83, kism: 'patni', shart: 'Saptamesh 8ve mein, panchamesh 8ve mein, Guru paap ke saath',
    test: (h) => h.inH(h.lord(7), 8) && h.inH(h.lord(5), 8) && h.withPaap('Jupiter') },
  { sl: 84, kism: 'patni', shart: 'Shukra 5ve mein, saptamesh 8ve mein, Guru paap ke saath',
    test: (h) => h.inH('Venus', 5) && h.inH(h.lord(7), 8) && h.withPaap('Jupiter') },
  { sl: 85, kism: 'patni', shart: '2re mein paap, saptamesh 8ve mein, 5ve mein paap',
    test: (h) => h.paapIn(2) && h.inH(h.lord(7), 8) && h.paapIn(5) },
  { sl: 86, kism: 'patni', shart: 'Shukra 9ve mein, saptamesh 8ve mein, lagna va 5ve mein paap',
    test: (h) => h.inH('Venus', 9) && h.inH(h.lord(7), 8) && h.paapIn(1) && h.paapIn(5) },
  { sl: 87, kism: 'patni', shart: 'Navamesh Shukra, panchamesh shatru raashi mein, Guru-lagnesh-saptamesh dusthan mein',
    test: (h) => h.lord(9) === 'Venus' && h.enemySign(h.lord(5)) && h.dusthe('Jupiter') && h.dusthe(h.lord(1)) && h.dusthe(h.lord(7)) },
  { sl: 88, kism: 'patni', shart: '5va Shukra ki raashi, usmein Rahu-Chandra; 12ve, lagna, 2re mein paap',
    test: (h) => h.signLordIs(5, 'Venus') && h.inH('Rahu', 5) && h.inH('Moon', 5) && h.paapIn(12) && h.paapIn(1) && h.paapIn(2) },
  { sl: 89, kism: 'patni', shart: 'Shani-Shukra 7ve mein, ashtamesh Surya 5ve mein, Rahu lagna mein',
    test: (h) => h.inH('Saturn', 7) && h.inH('Venus', 7) && h.lord(8) === 'Sun' && h.inH('Sun', 5) && h.inH('Rahu', 1) },
  { sl: 90, kism: 'patni', shart: 'Mangal 2re, Guru 12ve, Shukra 5ve mein Shani-Rahu ki yuti ya drishti ke saath',
    test: (h) => h.inH('Mars', 2) && h.inH('Jupiter', 12) && h.inH('Venus', 5) && h.joinOrSee('Venus', 'Saturn') && h.joinOrSee('Venus', 'Rahu') },
  { sl: 91, kism: 'patni', shart: 'Dhanesh-saptamesh 8ve mein, Mangal-Shani 5ve/lagna mein, Guru paap ke saath',
    test: (h) => h.inH(h.lord(2), 8) && h.inH(h.lord(7), 8) && h.inH('Mars', 5, 1) && h.inH('Saturn', 5, 1) && h.withPaap('Jupiter') },
  { sl: 92, kism: 'patni', shart: 'Rahu lagna, Shani 5ve, Mangal 9ve mein; panchamesh-saptamesh 8ve mein',
    test: (h) => h.inH('Rahu', 1) && h.inH('Saturn', 5) && h.inH('Mars', 9) && h.inH(h.lord(5), 8) && h.inH(h.lord(7), 8) },

  // ── PRET SHAAP (97-103)
  { sl: 97, kism: 'pret', shart: 'Shani-Surya 5ve mein, kshina Chandra 7ve mein, Rahu-Guru lagna/12ve mein',
    test: (h) => h.inH('Saturn', 5) && h.inH('Sun', 5) && h.kshinaMoon() && h.inH('Moon', 7) && h.inH('Rahu', 1, 12) && h.inH('Jupiter', 1, 12) },
  { sl: 98, kism: 'pret', shart: 'Panchamesh Shani 8ve mein, Mangal lagna mein, Guru 8ve mein',
    test: (h) => h.lord(5) === 'Saturn' && h.inH('Saturn', 8) && h.inH('Mars', 1) && h.inH('Jupiter', 8) },
  { sl: 99, kism: 'pret', shart: 'Lagna mein paap, Surya 12ve, Mangal-Shani-Budh 5ve mein, panchamesh 8ve mein',
    test: (h) => h.paapIn(1) && h.inH('Sun', 12) && h.inH('Mars', 5) && h.inH('Saturn', 5) && h.inH('Mercury', 5) && h.inH(h.lord(5), 8) },
  { sl: 100, kism: 'pret', shart: 'Rahu lagna mein, Shani 5ve mein, Guru 8ve mein',
    test: (h) => h.inH('Rahu', 1) && h.inH('Saturn', 5) && h.inH('Jupiter', 8) },
  { sl: 101, kism: 'pret', shart: 'Rahu lagna mein Shukra-Guru ke saath, Chandra Shani ke saath, lagnesh 8ve mein',
    test: (h) => h.inH('Rahu', 1) && h.inH('Venus', 1) && h.inH('Jupiter', 1) && h.conj('Moon', 'Saturn') && h.inH(h.lord(1), 8) },
  { sl: 102, kism: 'pret', shart: 'Panchamesh neech, Guru neech, aur neech grah ki drishti',
    test: (h) => h.neech(h.lord(5)) && h.neech('Jupiter') },
  { sl: 103, kism: 'pret', shart: 'Shani lagna, Rahu 5ve, Surya 8ve, Mangal 12ve mein',
    test: (h) => h.inH('Saturn', 1) && h.inH('Rahu', 5) && h.inH('Sun', 8) && h.inH('Mars', 12) },
];

/** Har shaap ki granth ki shanti — shlok-ank aur Trikaal arth. */
export const SHANTI: Record<Exclude<ShaapKism, 'saamanya'>, { sl: string; arth: string }> = {
  sarp:    { sl: '83.17-19', arth: 'Naag-pooja; sone ki naag-murti ki pratishtha, aur saamarthya ke anusaar gau, bhoomi, til aur sone ka daan — isse kul badhta hai.' },
  pitru:   { sl: '83.31-33', arth: 'Gaya mein shraddh; das hazaar ya hazaar brahmanon ko bhojan; ya kanya-daan aur go-daan.' },
  matru:   { sl: '83.47-50', arth: 'Setu-snaan, Gayatri ka ek lakh jap, chaandi ke paatra se doodh peekar grah-daan, brahman bhojan, aur peepal ki 1008 parikrama.' },
  bhratru: { sl: '83.62-64', arth: 'Harivansh ka shravan, Kaveri tat par Vishnu ke saamne chaandrayan vrat, peepal ki sthapana, das gau ka daan, aur patni ke haath se phaldaar bhoomi ka daan.' },
  matul:   { sl: '83.69-70', arth: 'Vishnu ki sthapana, aur baawdi, kuan, talab khudwana.' },
  brahma:  { sl: '83.79-81', arth: 'Chaandrayan vrat, teen brahmakrichchh, dakshina sahit gau-daan, sone ke saath panchratna ka daan, aur brahman bhojan.' },
  patni:   { sl: '83.93-95', arth: 'Kanya ho to kanya-daan; na ho to sone ki Lakshmi-Vishnu murti, das gau, shayya, aabhushan aur vastra brahman dampati ko.' },
  pret:    { sl: '83.106-108', arth: 'Gaya mein shraddh, Rudrabhishek, Brahma ki murti ka daan, gau, chaandi ka paatra aur neelmani, aur brahman bhojan.' },
};

export const KISM_NAAM: Record<ShaapKism, string> = {
  saamanya: 'Saamanya (santan-baadha ka yog)', sarp: 'Sarp shaap', pitru: 'Pitru shaap',
  matru: 'Matru shaap', bhratru: 'Bhratru shaap', matul: 'Matul (mama) shaap',
  brahma: 'Brahma shaap', patni: 'Patni shaap', pret: 'Pret shaap',
};

export interface ShaapMila { sl: number; kism: ShaapKism; shart: string }

/** Kundali par BPHS 83 ke saare yog chalao. */
export function bphs83(kd: any): { chal_saka: boolean; mile: ShaapMila[]; jaancha: number;
  jaancha_nahi: number[] } {
  const c = makeChart(kd);
  if (!c.ok) return { chal_saka: false, mile: [], jaancha: 0, jaancha_nahi: [13, 104, 105] };
  const h = H(c);
  const mile: ShaapMila[] = [];
  for (const y of YOG) {
    let ok = false;
    try { ok = !!y.test(h); } catch { ok = false; }
    if (ok) mile.push({ sl: y.sl, kism: y.kism, shart: y.shart });
  }
  return { chal_saka: true, mile, jaancha: YOG.length, jaancha_nahi: [13, 104, 105] };
}
