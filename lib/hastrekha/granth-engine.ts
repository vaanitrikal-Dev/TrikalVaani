/**
 * File:    lib/hastrekha/granth-engine.ts
 * Version: v1.0 — 24 Oct 2026 — Hast Rekha GRANTH engine (Hastasanjivanam, Meghavijaya)
 *
 * ⭐ YE SHUDDH GANANA-PARAT HAI — photo se rekha pehchanna iska kaam NAHI.
 *    Input  = haath ke naape/pehchane gaye lakshan (PalmFeatures) — VM / reviewer bharega.
 *    Output = granth ke niyam jo lagu hue, har ek shlok-ank ke saath.
 *    Abhi kisi live route se JUDA NAHI — maujooda paid report waisi hi chalti hai.
 *
 * Srot: lib/hastrekha/granth-rules.json (v0.2, 127 rules) ← Supabase bphs_slokas
 *       work='hastasanjivana' edition='chaukhamba-2010' (460 mool shlok, aankh-se-padha).
 *
 * SABSE ZAROORI (3.3.1, 3.4.16-19, chitra-4):
 *   पितृ/गोत्र रेखा = Life line · मातृ/धन रेखा = Head line · आयु रेखा = Heart line
 *   (kanishtha ke neeche se tarjani ki or). Western "heart = emotions" yahan GALAT hai.
 *
 * Suraksha niyam (Rohiit ji ke maujooda niyam, life-span-engine jaisa):
 *   * darr wale niyam (mrityu, vidhva, garbhpaat, rog-bhay, dukh-varsh) → sirf `andar`, customer ko KABHI nahi
 *   * aayu ka KOI saal/number customer ko nahi — sirf band; customer ko sirf DEERGHAYU sanket
 *   * santaan: sirf ginti ka sanket — LING kabhi nahi (PCPNDT)
 *   * bahu-vivah / stri-charitra niyam → sirf `andar`
 */
import RULES_JSON from './granth-rules.json';

// ───────────────────────── Types ─────────────────────────
export type Ling = 'purush' | 'stri';
export type Haath = 'dakshin' | 'vaam';
export type Anguli = 'kanishtha' | 'anamika' | 'madhyama' | 'tarjani' | 'angushtha';
export type Paksha = 'shukla' | 'krishna';
export type ParvaChinh =
  | 'urdhva' | 'chakra' | 'yava'                                   // 1.8.12 shubh
  | 'chhinn' | 'bhinn' | 'vedh' | 'shukti' | 'trutit' | 'bindu';    // 1.8.13 dukh

export interface RuleMeta {
  id: string; ank: string; varg: string; rekha_sthaan: string; sthiti: string;
  phal_saar: string; photo: 'Y' | 'P' | 'N'; darr: boolean; bharosa: 'P' | 'S'; note: string;
}
interface RulesFile { version: string; rules: RuleMeta[] }
const RULES = RULES_JSON as unknown as RulesFile;
const BY_ID: Record<string, RuleMeta> = {};
RULES.rules.forEach((r) => { BY_ID[r.id] = r; });

/** Haath ke lakshan — har field vaikalpik; jo pata nahi wo khaali chhodo (niyam lagega hi nahi). */
export interface PalmFeatures {
  /** Rekhaon ki aam spashtata — 3.3.10-12, 3.6.54 */
  rekha_guna?: 'uttam' | 'madhyam' | 'dosh';
  /** Aayu rekha (Heart line) kahan tak pahunchi — 3.4.16-19 / 3.4.4 */
  ayu_rekha?: { ant?: Anguli | 'tarjani_ke_andar'; akhand?: boolean };
  /** Teeno mukhya rekhayein sampoorn + dosh-rahit — 3.3.2 */
  teeno_sampoorn?: boolean;
  /** Kanishtha ka sira anamika ki antim parva-rekha se — 3.2.12-15 (MediaPipe se naap) */
  kanishtha_vs_anamika?: 'paar' | 'barabar' | 'kam';   // 'kam' par abhi niyam nahi (yava-ginti chahiye)
  /** Dhan/matr rekha (Head line) — 3.5.1-3 */
  dhan_rekha?: { akhand?: boolean; lambi?: boolean; tooti?: boolean; angushtha_pallav?: number };
  /** Gotra/pitr rekha (Life line) — 3.5.5-7 */
  gotra_rekha?: { akhand_avedh?: boolean; pallav_ungli_or?: number; pallav_angushtha_or?: number };
  /** Pitr aur matr/dravya rekha ant mein milti — 3.6.38, 3.6.47 */
  pitr_matr_milan?: boolean;
  /** Urdhva rekha (manibandh se upar) — 3.5.8-12 */
  urdhva_rekha?: { manibandh_se?: boolean; ant?: Anguli; chaaron_ungli_par?: boolean };
  /** Dharma rekha madhyama-mool tak + vajra — 3.6.1-2 */
  dharma_rekha?: { madhyama_mool?: boolean; vajra?: boolean; anamika_vajra?: boolean };
  /** Granth ki bhagya rekha (kanishtha-ant se aayu ki or, avedh) — 3.6.33 */
  bhagya_rekha_avedh?: boolean;
  /** Manibandh par yava-shreni — 3.2.17-18 */
  manibandh_yava_shreni?: 0 | 1 | 2 | 3;
  /** Angushtha par yava — 3.6.34, 3.7.6-10 */
  angushtha_yava?: { upar?: boolean; madhya?: boolean; udar?: boolean; haath?: Haath | 'dono' };
  /** Ungliyon ke beech chhidra — 3.2.3, 3.6.9 */
  ungli_chhidra?: boolean;
  /** Kanishtha-anamika sate — 3.6.8 */
  kanishtha_anamika_sate?: boolean;
  /** Tarjani madhyama ki agra-antim rekha se adhik — 3.2.7 */
  tarjani_adhik?: boolean;
  /** Kanishtha anamika ki antim rekha se adhik — 3.2.6 */
  kanishtha_adhik?: boolean;
  /** Lambi anamika — 3.2.9 */
  anamika_lambi?: boolean;
  /** Santaan rekhayein (ginti) — 3.6.4, 3.6.15 */
  santaan_rekha_ginti?: number;
  /** Bhai-bahan rekhayein — 3.6.13 */
  bhai_bahan?: { sthool?: number; sookshm?: number };
  /** Ungliyon ke siron par chakra (whorl) ginti — 3.8.17 */
  ungli_chakra_ginti?: number;
  /** Mani ke paas tal ki or matsya / makar / shankh — 3.8.2 */
  dhan_chinh?: 'matsya' | 'makar' | 'shankh';
  /** Parva-wise chinh — varsh-phal 1.8.12-13 */
  parva_chinh?: Array<{ haath: Haath; anguli: Anguli; parva: 1 | 2 | 3; chinh: ParvaChinh[] }>;
}

export interface Prashnakarta {
  ling: Ling;
  umr: number;               // poore varsh
  paksha?: Paksha;           // janm-paksha (panchang engine se) — 4.3.1-2
}

export interface Finding {
  rule_id: string;
  ank: string;               // hawala, e.g. "3.4.16-19"
  vishay: string;
  saar: string;              // ANDAR ka Hinglish saar — customer copy NAHI
  darr: boolean;
  bharosa: 'P' | 'S';
}

export interface GranthResult {
  engine: string;
  rules_version: string;
  mukhya_haath: Haath;
  baal_avastha: boolean;                       // umr < 12 → rekha-phal nahi (3.1.9, 4.4.1)
  aayu_band: 'DEERGHAYU' | 'MADHYAYU' | 'ALPAYU' | null;   // ANDAR — customer ko sirf DEERGHAYU
  customer: Finding[];                          // darr-mukt
  andar: Finding[];                             // poora (darr sahit) — sirf review/₹499
  varsh: VarshPhal[];                           // agle varsh (customer ko sirf shubh)
}

export const GRANTH_ENGINE_VERSION = 'hastrekha-granth v1.0 (24 Oct 2026)';

// ───────────────────────── Haath chunav ─────────────────────────
/**
 * Mukhya haath. 3.1.6: purush dakshin, stri vaam.
 * 4.3.1-2 (purush ke vaam-hast adhyay mein): krishna-paksha janm → dakshin, shukla → vaam.
 */
export function mukhyaHaath(p: Prashnakarta): Haath {
  if (p.ling === 'stri') return 'vaam';
  if (p.paksha === 'shukla') return 'vaam';
  return 'dakshin';
}

/** Vishay ke hisaab se haath — 4.2.7-9 (stri), 3.6.28, 1.4.13-14. */
export function vishayHaath(p: Prashnakarta, vishay: string): Haath {
  const v = vishay.toLowerCase();
  if (p.ling === 'stri') {
    if (['ayu', 'vivah', 'dhan', 'gotra', 'pati'].indexOf(v) >= 0) return 'dakshin';      // 4.2.7
    if (['dharma', 'bhagya', 'santan', 'godhan'].indexOf(v) >= 0) return 'vaam';          // 4.2.8-9
    return 'vaam';
  }
  if (['dhan', 'rajyog', 'vahan', 'maata', 'griha'].indexOf(v) >= 0) return 'vaam';        // 3.6.28, 1.4.13
  if (['vidya', 'gyaan', 'aishvarya', 'vansh'].indexOf(v) >= 0) return 'dakshin';           // 3.6.28
  return mukhyaHaath(p);
}

// ───────────────────────── Aayu (andar) ─────────────────────────
/** 3.4.16-19 + 3.4.4 + 3.2.12-15 → band. Saal kabhi bahar nahi jaata. */
export function aayuBand(f: PalmFeatures): GranthResult['aayu_band'] {
  const votes: number[] = [];
  const a = f.ayu_rekha;
  // Granth sirf AKHAND (अविच्छिन्न) rekha ke varsh deta hai — tooti ho to yeh niyam lagu hi nahi
  if (a && a.ant && a.akhand !== false) {
    if (a.ant === 'tarjani_ke_andar') votes.push(108);                  // 3.4.4
    else if (a.ant === 'tarjani') votes.push(100);                      // 3.4.16
    else if (a.ant === 'madhyama') votes.push(80);                      // 3.4.17
    else if (a.ant === 'anamika') votes.push(60);                       // 3.4.18
    else if (a.ant === 'kanishtha') votes.push(25);                     // 3.4.19 (20-30)
  }
  if (f.kanishtha_vs_anamika === 'paar') votes.push(100);              // 3.2.12
  else if (f.kanishtha_vs_anamika === 'barabar') votes.push(60);       // 3.2.12, 3.2.14
  // 'kam' → 3.2.15 yava-maap chahiye (1 yava=50 … 5 yava=10); bina yava-ginti ke niyam nahi lagta
  if (!votes.length) return null;
  const m = Math.min.apply(null, votes);   // dono vidhiyan — savdhani se kam wala
  // BPHS shaastriya seema: alpa ≤32, madhya 33-64, deergha 65+
  if (m >= 65) return 'DEERGHAYU';
  if (m >= 33) return 'MADHYAYU';
  return 'ALPAYU';
}

// ───────────────────────── Varsh-phal (1.8.11-16) ─────────────────────────
const KRAM_SAVYA: Anguli[] = ['kanishtha', 'anamika', 'madhyama', 'tarjani', 'angushtha'];

export interface VarshSthaan { varsh: number; haath: Haath; anguli: Anguli; parva: 1 | 2 | 3 }

/**
 * Umr ka N-va varsh haath ke kis parva par — 1.8.14-15.
 * 15 parva = 15 varsh; purush: 1-15 dakshin, 16-30 vaam, phir baari baari.
 * Stri: vaam se shuru, apasavya (ulta) kram — [S] arth pakka nahi.
 * parva 1 = agra (pothi B 'कनीनिकाग्रपर्वणि') — [S].
 */
export function varshSthaan(varsh: number, ling: Ling): VarshSthaan {
  const n = Math.max(1, Math.floor(varsh));
  const idx = (n - 1) % 15;
  const chakra = Math.floor((n - 1) / 15);
  const pehla: Haath = ling === 'stri' ? 'vaam' : 'dakshin';
  const doosra: Haath = pehla === 'dakshin' ? 'vaam' : 'dakshin';
  const kram = ling === 'stri' ? KRAM_SAVYA.slice().reverse() : KRAM_SAVYA;
  return {
    varsh: n,
    haath: chakra % 2 === 0 ? pehla : doosra,
    anguli: kram[Math.floor(idx / 3)],
    parva: ((idx % 3) + 1) as 1 | 2 | 3,
  };
}

export interface VarshPhal extends VarshSthaan { phal: 'shubh' | 'dukh'; rule_id: 'Y03' | 'Y04'; darr: boolean }

const SHUBH: ParvaChinh[] = ['urdhva', 'chakra', 'yava'];

/** Agle `kitne` varsh ka phal — sirf jin parvon par chinh diya gaya ho. */
export function varshPhal(f: PalmFeatures, p: Prashnakarta, kitne = 5): VarshPhal[] {
  const out: VarshPhal[] = [];
  if (!f.parva_chinh || !f.parva_chinh.length) return out;
  for (let i = 1; i <= kitne; i++) {
    const s = varshSthaan(p.umr + i, p.ling);
    const hit = f.parva_chinh.filter((c) => c.haath === s.haath && c.anguli === s.anguli && c.parva === s.parva);
    if (!hit.length) continue;
    const chinh: ParvaChinh[] = [];
    hit.forEach((h) => h.chinh.forEach((c) => chinh.push(c)));
    const dosh = chinh.some((c) => SHUBH.indexOf(c) < 0);
    const shubh = chinh.some((c) => SHUBH.indexOf(c) >= 0);
    // 3.6.26: prabal lakshan jeetta hai — dono hon to dosh ko savdhani se andar rakho
    if (dosh) out.push({ ...s, phal: 'dukh', rule_id: 'Y04', darr: true });
    else if (shubh) out.push({ ...s, phal: 'shubh', rule_id: 'Y03', darr: false });
  }
  return out;
}

// ───────────────────────── Niyam lagana ─────────────────────────
function f_(id: string, saar: string, vishayOverride?: string): Finding {
  const r = BY_ID[id];
  if (!r) throw new Error('granth-engine: rule ' + id + ' register mein nahi');
  return { rule_id: id, ank: r.ank, vishay: vishayOverride || r.varg, saar, darr: r.darr, bharosa: r.bharosa };
}

export function evaluateGranth(f: PalmFeatures, p: Prashnakarta): GranthResult {
  const all: Finding[] = [];
  const baal = p.umr < 12;
  const haath = p.umr < 15 ? 'vaam' : mukhyaHaath(p);   // 3.1.9 / 4.4.1: 12-15 vaam

  if (!baal) {
    // Guna
    if (f.rekha_guna === 'uttam') all.push(f_('M10', 'Rekhayein sookshm, snigdh, gambhir — shubh phal poora milega'));
    if (f.rekha_guna === 'dosh') all.push(f_('M11', 'Rekhaon mein chhed/pallav/rookshta — phal ghatega'));
    if (f.teeno_sampoorn) all.push(f_('D04', 'Teeno mukhya rekhayein sampoorn — gotra, dhan, jeevan mein vriddhi'));

    // Dhan (matr rekha)
    const d = f.dhan_rekha;
    if (d) {
      if (d.akhand) all.push(f_('W01', 'Dhan rekha akhand — dhan-prad'));
      if (d.lambi) all.push(f_('W05', 'Dhan rekha lambi — dhan-dhaanya prachur'));
      if (d.tooti) all.push(f_('W05', 'Dhan rekha tooti — kharch par niyantran zaroori'));
      if (d.angushtha_pallav && d.angushtha_pallav > 0)
        all.push(f_('W03', 'Angushtha ki or ' + d.angushtha_pallav + ' pallav — utni baar bada dhan-arjan'));
    }
    if (f.ungli_chhidra === true) all.push(f_('W08', 'Ungliyon ke beech chhidra — dhan tikane mein savdhani'));
    if (f.ungli_chhidra === false) all.push(f_('W08', 'Ungliyan sati — dhan-sanchay'));

    // Gotra / parivar
    const g = f.gotra_rekha;
    if (g) {
      if (g.akhand_avedh) all.push(f_('G01', 'Gotra rekha akhand — kul mein mukhya, sabka aashray'));
      if (g.pallav_angushtha_or) all.push(f_('G03', g.pallav_angushtha_or + ' pallav angushtha ki or — madadgaar bhai/swajan'));
      if (g.pallav_ungli_or) all.push(f_('G02', g.pallav_ungli_or + ' pallav ungliyon ki or — pitri-dhan ke hissedar'));
    }
    if (f.pitr_matr_milan === true) all.push(f_('G04', 'Pitr aur dhan rekha ant mein milti — apna ghar (griha-bandh)', 'griha'));
    if (f.kanishtha_anamika_sate === true) all.push(f_('G06', 'Kanishtha-anamika sati — swajan se gehra sneh'));
    if (f.kanishtha_adhik) all.push(f_('G07', 'Kanishtha adhik — dhan-vriddhi, maatri-paksh bada'));
    if (f.tarjani_adhik) all.push(f_('G07', 'Tarjani adhik — pitri-paksh prabal, shri'));

    // Urdhva
    const u = f.urdhva_rekha;
    if (u) {
      if (u.manibandh_se) all.push(f_('U01', 'Urdhva rekha manibandh se — rajaashray, rajya-sukh'));
      const MAP: Record<string, string> = { tarjani: 'U02', madhyama: 'U03', anamika: 'U04', kanishtha: 'U05' };
      const TXT: Record<string, string> = {
        tarjani: 'Urdhva tarjani tak — shasan/mantri-pad yog',
        madhyama: 'Urdhva madhyama tak — acharya, khyati, netritva',
        anamika: 'Urdhva anamika tak — vyapar-neta, dhani',
        kanishtha: 'Urdhva kanishtha tak — pratishtha, mahaayash',
      };
      if (u.ant && MAP[u.ant]) all.push(f_(MAP[u.ant], TXT[u.ant], 'career'));
      if (u.chaaron_ungli_par) all.push(f_('U07', 'Chaaron ungliyon par urdhva — naana bhog-sukh'));
    }

    // Dharma / bhagya / vidya
    const dh = f.dharma_rekha;
    if (dh && dh.madhyama_mool) all.push(f_('B03', dh.vajra ? 'Dharma rekha + vajra — shraddhalu, dharmik' : 'Dharma rekha madhyama-mool tak — dharma-ruchi'));
    if (dh && dh.anamika_vajra) all.push(f_('B04', 'Anamika-mool vajra — pratishtha'));
    if (f.bhagya_rekha_avedh) all.push(f_('B01', 'Granth ki bhagya rekha avedh — sukh-kaarini'));
    if (f.anamika_lambi) all.push(f_('B09', 'Anamika lambi — vidya-bhogi'));

    // Yava / chinh
    if (f.manibandh_yava_shreni === 3) all.push(f_('H11', 'Manibandh par 3 yava-shreni — nripati-tulya yog', 'rajyog'));
    if (f.manibandh_yava_shreni === 2) all.push(f_('H11', 'Manibandh par 2 yava-mala — mantri, dhani, budhimaan', 'rajyog'));
    if (f.manibandh_yava_shreni === 1) all.push(f_('H11', 'Manibandh par 1 yava-pankti — shreshthi, bahu-dhan', 'rajyog'));
    const ay = f.angushtha_yava;
    if (ay) {
      if (ay.upar) all.push(f_('T01', 'Angushtha upar yava — yash'));
      if (ay.madhya) all.push(f_('T03', 'Angushtha madhya yava — vidya, khyaati, vibhuti'));
      if (ay.udar) all.push(f_('T04', 'Angushtha udar yava — bhogi, sada sukhi'));
    }
    if (typeof f.ungli_chakra_ginti === 'number' && f.ungli_chakra_ginti >= 10)
      all.push(f_('C04', 'Dason ungliyon par chakra — raja/yogishwar tulya'));
    if (f.dhan_chinh === 'matsya') all.push(f_('C02', 'Mani ke paas matsya — sahasra-dhan star'));
    if (f.dhan_chinh === 'makar') all.push(f_('C02', 'Mani ke paas makar — das-sahasra dhan star'));
    if (f.dhan_chinh === 'shankh') all.push(f_('C02', 'Mani ke paas shankh — laksh-pati star'));

    // Santaan — sirf ginti, LING kabhi nahi
    if (typeof f.santaan_rekha_ginti === 'number' && f.santaan_rekha_ginti > 0)
      all.push(f_('S02', 'Santaan sukh ke ' + f.santaan_rekha_ginti + ' sanket (ling nahi bataya jaata)'));
    // Bhai-bahan
    const bb = f.bhai_bahan;
    if (bb && ((bb.sthool || 0) + (bb.sookshm || 0)) > 0)
      all.push(f_('K01', 'Bhai-bahan ke ' + ((bb.sthool || 0) + (bb.sookshm || 0)) + ' sanket'));
  }

  // Aayu — andar; customer ko sirf DEERGHAYU
  const band = baal ? null : aayuBand(f);
  if (band) {
    const id = f.ayu_rekha && f.ayu_rekha.ant ? 'A02' : 'A04';
    const fd = f_(id, 'Aayu band: ' + band, 'aayu');
    fd.darr = band !== 'DEERGHAYU';
    if (band === 'DEERGHAYU') fd.saar = 'Deerghaayu sanket';
    all.push(fd);
  }

  const varsh = baal ? [] : varshPhal(f, p, 5);
  return {
    engine: GRANTH_ENGINE_VERSION,
    rules_version: RULES.version,
    mukhya_haath: haath,
    baal_avastha: baal,
    aayu_band: band,
    customer: all.filter((x) => !x.darr),
    andar: all,
    varsh,
  };
}

/** Customer ke liye sirf shubh varsh (dukh-varsh darr hai). */
export function customerVarsh(r: GranthResult): VarshPhal[] {
  return r.varsh.filter((v) => !v.darr);
}

/**
 * Sateekta-jaanch (andar): 3.7.7-9 angushtha-yava se janm-paksha — granth mein DO path.
 * Path-A (3.7.7 + 3.7.8, doosre chhape set mein): vaam angushtha yava → shukla, dakshin → krishna.
 * Path-B (3.7.9, doosre chhape set mein): dakshin → shukla, vaam → krishna.
 * DOB se asli paksha milakar dekho kaun sa path is engine/photo par sahi baithta hai.
 */
export function pakshaJaanch(yavaHaath: Haath, asliPaksha: Paksha): { pathA: boolean; pathB: boolean } {
  const a: Paksha = yavaHaath === 'vaam' ? 'shukla' : 'krishna';
  const b: Paksha = yavaHaath === 'dakshin' ? 'shukla' : 'krishna';
  return { pathA: a === asliPaksha, pathB: b === asliPaksha };
}

/** Register se kisi niyam ka hawala (UI/PDF citation ke liye). */
export function niyam(id: string): RuleMeta | undefined {
  return BY_ID[id];
}
