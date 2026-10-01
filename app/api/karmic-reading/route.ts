/**
 * ============================================================
 * TRIKAL VAANI — Karmic Background Reading — GRANTH SAAR
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/karmic-reading/route.ts
 * VERSION: 2.0 (1 Oct 2026) — AI BAND. Report sirf granth se.
 * ============================================================
 * Rohiit ke nirdesh (1 Oct 2026): "Karmic ka daam Sirf 101 and Yes AI Band
 * and Sirf Granth Saar", "Karmic ka saar 800-1000 words ka", "Option B" (upay
 * granth se), "Prediction of this person as well and tell each and every
 * thing which we are currently publishing", "add BPHS 83 as well".
 *
 * KAHAN SE KYA:
 *   VM /granth/product 'karmic' (calc_varga_map: bhav 1,7,2,11,4,9,8,12;
 *     karak Shukra, Guru, Shani, Ketu) — har bhav ka haal, Ashtakavarga
 *     bindu, swami ki sthiti aur granth-vachan (bhav_phala: BPHS, Jataka
 *     Parijata, Phaladipika, Brihajjataka, Bhrigu Sutra), aur dasha ke daur.
 *   VM /kundali — grahon ki raashi-haalat (uchch/neech/swa/mitra/shatru) —
 *     Phaladipika 14.25 aur BPHS 83/84 ke liye.
 *   Supabase bphs_slokas — mool Sanskrit: Phaladipika 14.24, 14.25, 12.23,
 *     BPHS 84.26 aur BPHS 83 ke jo yog lage. Arth Trikaal ka (Rohiit ne
 *     anumati di, 1 Oct), report par "arth: Trikaal" likha.
 *   lib/bphs83-shaap.ts — BPHS 83 ke 71 yog.
 *
 * DHAANCHA — wahi 6 markers jo KarmicResultClient padhta hai, aur do naye:
 *   7. KAB KYA KHULEGA (prediction)  8. GRANTH KE UPAY
 *   (KarmicResultClient v1.2 dono naye markers padhta hai.)
 *
 * UPAY — BPHS 84.26 "यस्य यश्च यदा दुःस्थः स तं यत्नेन पूजयेत्": sirf wo grah
 *   jo dusthan (6/8/12) mein hain ya neech hain. Har ek ka mantra (84.17-18),
 *   jap-sankhya (84.19-20), samidha (84.21), dakshina (84.25), aur anaaj
 *   (Phaladipika 2.28). BPHS 84.23 ka anna-daan nahi liya (Rahu ke liye
 *   maans likha hai) — baaki chaar granth-vidhi kaafi hain.
 *
 * Kathor vachan jaise hain waise (Rohiit: "prediction can be bitter").
 * Purani reports (gemini_narrative pehle se) jaisi hain waisi.
 * PURANA (v1.4): Gemini 3.8 → 3.7 → Claude polish, Bhrigu prompt.
 * ============================================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient }             from '@supabase/supabase-js';
import { notifyReportReady }        from '@/lib/report-notify';
import { callVM }                   from '@/lib/callVM';
import { bphs83, SHANTI, KISM_NAAM, type ShaapKism } from '@/lib/bphs83-shaap';

const VM_KUNDALI_ENDPOINT =
  process.env.VM_KUNDALI_ENDPOINT ?? 'http://34.47.182.227:8001/kundali';

type Language = 'hinglish' | 'hindi' | 'english';
const VALID_LANGUAGES: Language[] = ['hinglish', 'hindi', 'english'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 120;   // v2.0 — VM do call (~30s) + Supabase; AI nahi

// ── Grah ke naam ───────────────────────────────────────────────
const EN: Record<string, string> = { Surya: 'Sun', Chandra: 'Moon', Mangal: 'Mars', Budh: 'Mercury',
  Guru: 'Jupiter', Shukra: 'Venus', Shani: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu' };
const HI: Record<string, string> = Object.fromEntries(Object.entries(EN).map(([h, e]) => [e, h]));
const SIGN_LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury',
  'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const SIGNS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
// Raashi ki disha (paramparik — Phaladipika 14.24 "तदधिष्ठितर्क्ष दिशं")
const DISHA = ['poorv', 'dakshin', 'paschim', 'uttar'];

// ── BPHS 84 — grah-shanti (shlok se) + Phaladipika 2.28 (anaaj) ─────
const SHANTI84: Record<string, { mantra: string; jap: number; samidha: string; dakshina: string; anaaj: string }> = {
  Sun:     { mantra: 'आकृष्णेन',              jap: 7000,  samidha: 'Aak (arka)',      dakshina: 'gau (dhenu)',      anaaj: 'gehun' },
  Moon:    { mantra: 'इमं देवा',              jap: 11000, samidha: 'Palash',          dakshina: 'shankh',           anaaj: 'chawal' },
  Mars:    { mantra: 'अग्निर्मूर्धा दिवः ककुत्', jap: 10000, samidha: 'Khair (khadir)',  dakshina: 'bail (anadvan)',   anaaj: 'arhar (aadhak)' },
  Mercury: { mantra: 'उद्बुध्यस्व',            jap: 9000,  samidha: 'Apamarg',         dakshina: 'sona (hem)',       anaaj: 'hari moong' },
  Jupiter: { mantra: 'बृहस्पते',              jap: 19000, samidha: 'Peepal',          dakshina: 'vastra',           anaaj: 'chana' },
  Venus:   { mantra: 'अन्नात्परिश्रुतः',        jap: 16000, samidha: 'Gular (udumbar)', dakshina: 'ghoda (haya)',     anaaj: 'nishpav (safed sem)' },
  Saturn:  { mantra: 'शन्नो देवीरभीष्टये',      jap: 23000, samidha: 'Shami',           dakshina: 'kaali gau',        anaaj: 'til' },
  Rahu:    { mantra: 'कया नश्चित्र',           jap: 18000, samidha: 'Doob (durva)',    dakshina: 'loha (ayas)',      anaaj: 'urad (maash)' },
  Ketu:    { mantra: 'केतुं कृण्वन्',           jap: 17000, samidha: 'Kush',            dakshina: 'bakra (chhaag)',   anaaj: 'kulthi (kulattha)' },
};
// BPHS 83.109-110 — grah-janit dosh ki shanti
const DOSH110: Record<string, string> = {
  Mercury: 'Shiv-pooja (83.109)', Venus: 'Shiv-pooja (83.109)',
  Jupiter: 'mantra, yantra aur aushadhi (83.109)', Moon: 'mantra, yantra aur aushadhi (83.109)',
  Rahu: 'kanya-daan (83.110)', Sun: 'Hari-kirtan (83.110)', Ketu: 'go-daan (83.110)',
  Mars: 'Rudra-jap (83.110)', Saturn: 'Rudra-jap (83.110)',
};

const clean = (t: unknown) => String(t ?? '').replace(/।ह्/g, '').replace(/\\-/g, '').replace(/\s+/g, ' ').trim();

async function shlokon(rows: { work: string; ch: number; sl: number }[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(rows.map(async (r) => {
    try {
      const { data } = await supabase.from('bphs_slokas').select('text_deva')
        .eq('work', r.work).eq('chapter', r.ch).eq('sloka', r.sl).limit(1);
      if (data?.[0]?.text_deva) out[`${r.work}.${r.ch}.${r.sl}`] = clean(data[0].text_deva);
    } catch { /* shlok na mile to sirf hawala */ }
  }));
  return out;
}

async function granthProduct(person: any): Promise<any | null> {
  try {
    const r = await callVM('/granth/product', {
      method: 'POST',
      body: JSON.stringify({
        product: 'karmic',
        year: Number(person.dob.slice(0, 4)), month: Number(person.dob.slice(5, 7)),
        day: Number(person.dob.slice(8, 10)), hour: Number(person.tob.slice(0, 2)),
        minute: Number(person.tob.slice(3, 5)),
        latitude: person.latitude ?? person.lat, longitude: person.longitude ?? person.lng,
        timezone: person.timezone ?? 5.5, tier: 'paid',
        ling: person.gender ?? null, bhasha: 'hinglish',
      }),
    });
    if (!r.ok) { console.error('[karmic] granth product', r.status); return null; }
    const j = await r.json();
    if (j?.galti) { console.error('[karmic] granth galti', j.galti); return null; }
    return j;
  } catch (e) { console.error('[karmic] granth fetch', e); return null; }
}

// ── Saar banane ki madad ────────────────────────────────────────
const ve = (n: unknown) => {
  const x = Number(n);
  return !x ? '—' : x === 1 ? '1le' : x === 2 ? '2re' : x === 3 ? '3re' : x === 4 ? '4the' : x === 6 ? '6the' : `${x}ve`;
};
/** Kartaa roop: "9va ghar", "1la ghar" */
const VA = ['', 'pehla', 'doosra', 'teesra', 'chautha', 'paanchva', 'chhatha', 'saatva',
  'aathva', 'nauva', 'dasva', 'gyarahva', 'barahva'];
const va = (n: unknown) => VA[Number(n)] || '—';
const vachan = (rows: any[], n: number) => (rows ?? [])
  .filter((x) => x && x.phal)
  .slice(0, n)
  .map((x) => `${clean(x.phal)} (${x.srot})`);

function bhavPara(b: any, kitne = 3, h?: number): string {
  if (!b) return h ? `${va(h)} ghar ka granth-vivaran is baar engine se nahi aaya.` : '';
  const p = b.parat ?? {};
  const lines = [...vachan(p.apne_chart_se, kitne), ...vachan(p.is_ghar_ke_baare_mein, kitne)].slice(0, kitne);
  const head = `Aapka ${va(b.bhav)} ghar (${b.vishay}) — **${String(b.haal ?? '').toUpperCase()}**`
    + (b.bindu ? `, Ashtakavarga bindu ${b.bindu}` : '') + '. '
    + (b.swami ? `Iska swami ${b.swami} ${ve(b.swami_bhav)} ghar mein hai (${b.swami_haalat ?? '—'}).` : '');
  return head + (lines.length ? ` Granth kehta hai — ${lines.join(' ')}` : ' Is ghar par granth ka koi vishesh vachan is chart par nahi lagta.');
}

function haalat(kd: any, planetEn: string): { cls: string; house: number; sign: number } {
  const g = (kd?.grahas ?? []).find((x: any) => x.planet === planetEn);
  const s = typeof g?.sign_index === 'number' ? g.sign_index
    : SIGNS.findIndex((n) => String(g?.sign ?? '').toLowerCase().startsWith(n.toLowerCase().slice(0, 4)));
  return { cls: String(g?.shadbala?.classification ?? ''), house: Number(g?.house ?? 0), sign: s };
}
function desh1425(cls: string): string {
  const c = cls.toLowerCase();
  if (c.includes('exalt')) return 'devbhoomi (uchch)';
  if (c.includes('debil') || c.includes('enemy')) return 'dvipantar — doosra desh (neech/shatru raashi)';
  if (c) return 'Bharatvarsh (swa/mitra/sam raashi)';
  return '—';
}

function buildKarmic(person: any, gp: any, kd: any, sh: Record<string, string>, b83: ReturnType<typeof bphs83>): string {
  const B: Record<number, any> = {};
  for (const b of gp?.bhav ?? []) B[b.bhav] = b;
  const name = person?.name ?? 'Jatak';
  const L = SIGNS.findIndex((n) => String(kd?.lagna?.sign ?? '').toLowerCase().startsWith(n.toLowerCase().slice(0, 4)));
  const lordOf = (h: number) => (L >= 0 ? SIGN_LORD[(L + h - 1) % 12] : '');
  const out: string[] = [];
  const S = (k: string) => sh[k] ?? '';

  // ── OPENING ── mool shlok
  out.push(`${name} ki Karmic Background Reading — ${gp?.lagna ?? kd?.lagna?.sign ?? ''} lagna. Ye report AI nahi likhta; `
    + 'har vaakya granth se hai, apne shlok ke hawale ke saath.');
  if (S('phaladipika.14.24')) {
    out.push(`${S('phaladipika.14.24')} — Phaladipika 14.24. Arth (Trikaal): 9ve ghar ke swami se pichhla janm, `
      + 'aur 5ve ghar ke swami se agla janm jaana jaata hai; us swami ki jaati, uski raashi ki disha aur uska desh bhi.');
  }

  // ── 1. CORE PERSONALITY ── bhav 1
  out.push('═══ 1. CORE PERSONALITY ═══');
  out.push(bhavPara(B[1], 3, 1));

  // ── 2. FIDELITY ── bhav 7 + Shukra
  out.push('═══ 2. FIDELITY & RELATIONSHIP CONDUCT ═══');
  out.push(bhavPara(B[7], 3, 7));
  const shukra = (gp?.karak ?? []).find((k: any) => k.grah === 'Shukra');
  if (shukra) out.push(`Vivah aur prem ka karak Shukra ${ve(shukra.bhav)} ghar mein, ${shukra.rashi} raashi mein hai`
    + `${shukra.vakri ? ' (vakri)' : ''}${shukra.ch34 ? `; granth (BPHS 34) ise is lagna ke liye ${shukra.ch34} kehta hai` : ''}.`);

  // ── 3. FINANCIAL ── bhav 2, 11 + Guru
  out.push('═══ 3. FINANCIAL BEHAVIOUR ═══');
  out.push(bhavPara(B[2], 2, 2));
  out.push(bhavPara(B[11], 1, 11));

  // ── 4. FAMILY ── bhav 4, 9
  out.push('═══ 4. FAMILY & PARENTAL RESPECT ═══');
  out.push(bhavPara(B[4], 2, 4));
  out.push(bhavPara(B[9], 1, 9));

  // ── 5. HIDDEN & KARMIC BAGGAGE ── bhav 8, 12 + purva janm + BPHS 83
  out.push('═══ 5. HIDDEN TENDENCIES & KARMIC BAGGAGE ═══');
  out.push(bhavPara(B[8], 1, 8));
  out.push(bhavPara(B[12], 1, 12));
  const l9 = lordOf(9), l5 = lordOf(5);
  if (l9) {
    const h9 = haalat(kd, l9), h5 = haalat(kd, l5);
    out.push(`Purva janm (Phaladipika 14.24): 9ve ka swami ${HI[l9] ?? l9} ${ve(h9.house)} ghar mein, `
      + `${SIGNS[h9.sign] ?? '—'} raashi mein (${h9.cls || '—'}) — raashi ki disha ${DISHA[(h9.sign % 4 + 4) % 4] ?? '—'}. `
      + `Phaladipika 14.25 ke anusaar pichhla janm: ${desh1425(h9.cls)}. `
      + `Agla janm: 5ve ka swami ${HI[l5] ?? l5} ${ve(h5.house)} ghar mein, ${SIGNS[h5.sign] ?? '—'} raashi (${h5.cls || '—'}) — `
      + `${desh1425(h5.cls)}.`);
    if (S('phaladipika.14.25')) out.push(`${S('phaladipika.14.25')} — Phaladipika 14.25. Arth (Trikaal): wo swami uchch ho to `
      + 'devbhoomi, neech ya shatru raashi mein ho to doosra desh, apni, mitra ya sam raashi mein ho to Bharatvarsh.');
  }
  if (b83.chal_saka) {
    const shaap = b83.mile.filter((m) => m.kism !== 'saamanya');
    const saam = b83.mile.filter((m) => m.kism === 'saamanya');
    if (shaap.length) {
      out.push(`BPHS adhyay 83 (purva janm ke shaap) ke ${b83.jaancha} yogon mein se ye lage — granth inhe santan-haani `
        + 'ke kaaran ki tarah kehta hai:');
      for (const m of shaap.slice(0, 2)) {
        const t = S(`bphs.83.${m.sl}`);
        out.push(`${KISM_NAAM[m.kism]} — ${t ? t + ' — ' : ''}BPHS 83.${m.sl}. Shart jo lagi (Trikaal): ${m.shart}.`);
      }
    } else {
      out.push(`BPHS adhyay 83 ke ${b83.jaancha} purva-janm-shaap yogon mein se koi shaap-yog is kundali par nahi lagta.`);
    }
    if (saam.length) out.push(`Saamanya yog (BPHS 83.7, shaap nahi): ${saam[0].shart} — granth ise santan mein der ka sanket kehta hai.`);
    out.push(`(Shlok ${b83.jaancha_nahi.join(', ')} jaanche nahi gaye — inke liye Mandi ki sthiti chahiye ya ghar aspasht hai.)`);
  }

  // ── 6. MARRIAGE OUTLOOK & LONGEVITY ── 7 + 8 ke dasha-vachan
  out.push('═══ 6. MARRIAGE OUTLOOK & LONGEVITY ═══');
  // dasha-vachan apni SHART ke saath — warna "in dashaon mein" adhoora lagta hai
  const vs = (rows: any[], n: number) => (rows ?? []).filter((x) => x && x.phal).slice(0, n)
    .map((x) => `${clean(x.phal)}${x.shart ? ` [shart: ${clean(x.shart)}]` : ''} (${x.srot})`);
  const d7 = vs(B[7]?.parat?.dasha_mein_aayega, 2), d8 = vs(B[8]?.parat?.dasha_mein_aayega, 2);
  if (d7.length) out.push(`Vivah (7va ghar) par granth: ${d7.join(' ')}`);
  if (d8.length) out.push(`Aayu aur mangalya (8va ghar) par granth: ${d8.join(' ')}`);
  if (!d7.length && !d8.length) out.push('Vivah aur aayu par granth ka koi samay-vachan is chart par nahi lagta.');

  // ── 7. KAB KYA KHULEGA ── prediction
  out.push('═══ 7. KAB KYA KHULEGA — PREDICTION ═══');
  for (const d of (gp?.kab?.daur ?? []).slice(0, 3)) {
    const g = (d.granth ?? []).filter((x: any) => x.phal).slice(0, 1).map((x: any) => `${clean(x.phal).replace(/\*\*/g, '')} (${x.srot})`);
    out.push(`${d.abhi ? 'Abhi' : 'Aage'} ${d.md}/${d.ad} — ${d.se} se ${d.tak} tak: `
      + `${(d.khule_bhav ?? []).map((h: number) => va(h)).join(', ')} ghar `
      + `${(d.khule_bhav ?? []).length > 1 ? 'khulte hain' : 'khulta hai'}. ${g.join(' ')}`);
  }
  if (!(gp?.kab?.daur ?? []).length && gp?.kab?.agla_daur) {
    const a = gp.kab.agla_daur;
    out.push(`Agla mukhya daur ${a.md}/${a.ad} — ${a.se} se ${a.tak}.`);
  }

  // ── 8. GRANTH KE UPAY ── BPHS 84.26 + BPHS 83 shanti
  out.push('═══ 8. GRANTH KE UPAY ═══');
  if (S('bphs.84.26')) out.push(`${S('bphs.84.26')} — BPHS 84.26. Arth (Trikaal): jo grah dukh-sthaan mein ho, usi ki yatna se pooja karein.`);
  const dushta = Object.keys(SHANTI84).filter((p) => {
    const h = haalat(kd, p);
    return [6, 8, 12].includes(h.house) || h.cls.toLowerCase().includes('debil');
  }).slice(0, 3);
  for (const p of dushta) {
    const s = SHANTI84[p], h = haalat(kd, p);
    out.push(`${HI[p] ?? p} (${ve(h.house)} ghar${h.cls.toLowerCase().includes('debil') ? ', neech' : ''}) — `
      + `mantra "${s.mantra}…" ka ${s.jap.toLocaleString('en-IN')} jap (BPHS 84.17-20), ${s.samidha} ki samidha se havan (84.21), `
      + `dakshina ${s.dakshina} (84.25), aur ${s.anaaj} ka daan (Phaladipika 2.28). Grah-dosh ki shanti: ${DOSH110[p] ?? '—'}.`);
  }
  if (!dushta.length) out.push('Is kundali mein koi grah dusthan (6, 8, 12) mein ya neech nahi — granth vishesh grah-shanti nahi kehta.');
  const kisme = Array.from(new Set(b83.mile.map((m) => m.kism).filter((k) => k !== 'saamanya'))) as Exclude<ShaapKism, 'saamanya'>[];
  for (const k of kisme.slice(0, 2)) out.push(`${KISM_NAAM[k]} ki shanti (BPHS ${SHANTI[k].sl}): ${SHANTI[k].arth}`);
  if (S('phaladipika.12.23')) out.push(`${S('phaladipika.12.23')} — Phaladipika 12.23 (santan adhyay). Arth (Trikaal): janm ke samay `
    + 'dikhne wale dosh anek purva janmon ke karm hain; un grahon ke jap, daan aur shubh karm se unki shanti karein.');

  // ── MAA SHAKTI
  out.push('═══ MAA SHAKTI ═══');
  out.push('Maa Shakti aapke purva karmon ka bojh halka karein aur is janm ka maarg prashast karein.');
  return out.filter(Boolean).join('\n\n');
}

interface KarmicRequest { slug: string }

interface PersonData {
  name:       string;
  dob:        string;
  tob:        string;
  lat?:       number;
  latitude?:  number;
  lng?:       number;
  longitude?: number;
  timezone:   number;
  cityName?:  string;
  place?:     string;
}

function buildKundaliPayload(p: PersonData) {
  return {
    year:      Number(p.dob.slice(0, 4)),
    month:     Number(p.dob.slice(5, 7)),
    day:       Number(p.dob.slice(8, 10)),
    hour:      Number(p.tob.slice(0, 2)),
    minute:    Number(p.tob.slice(3, 5)),
    latitude:  (p.latitude  ?? p.lat)  as number,
    longitude: (p.longitude ?? p.lng)  as number,
    timezone:  p.timezone,
    place:     p.place ?? p.cityName ?? '',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { slug }: KarmicRequest = await req.json();
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }
    const { data: reading, error: loadErr } = await supabase
      .from('karmic_readings').select('*').eq('slug', slug).single();
    if (loadErr || !reading) {
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }
    // Purani reports jaisi hain waisi (Rohiit, 1 Oct 2026)
    if (reading.gemini_narrative && reading.gemini_narrative.length > 200) {
      return NextResponse.json({ success: true, slug, language: reading.language,
        narrative: reading.gemini_narrative, cached: true });
    }
    const language: Language = VALID_LANGUAGES.includes(reading.language as Language)
      ? (reading.language as Language) : 'hinglish';
    const person = reading.person_data as PersonData & { gender?: string };
    if (!person?.dob || !person?.tob) {
      return NextResponse.json({ error: 'Reading data incomplete.' }, { status: 500 });
    }

    // 1) VM /kundali — cache ho to wahi
    let kundaliData: any = reading.kundali_data ?? null;
    if (!kundaliData) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      try {
        const vmRes = await callVM(VM_KUNDALI_ENDPOINT, {
          method: 'POST', body: JSON.stringify(buildKundaliPayload(person)), signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!vmRes.ok) {
          return NextResponse.json({ error: 'Chart engine error. Your payment is safe.' }, { status: 502 });
        }
        kundaliData = await vmRes.json();
        await supabase.from('karmic_readings')
          .update({ kundali_data: kundaliData, updated_at: new Date().toISOString() }).eq('slug', slug);
      } catch {
        clearTimeout(timeout);
        return NextResponse.json({ error: 'Chart engine unreachable. Your payment is safe — please refresh.' }, { status: 502 });
      }
    }

    // 2) VM granth engine — 8 bhav ke granth-vachan aur dasha
    const gp = await granthProduct(person);
    if (!gp) {
      return NextResponse.json({ error: 'Granth engine abhi uplabdh nahi. Payment surakshit hai — thodi der baad refresh karein.' }, { status: 502 });
    }

    // 3) BPHS 83 + library ke shlok
    const b83 = bphs83(kundaliData);
    const want = [
      { work: 'phaladipika', ch: 14, sl: 24 }, { work: 'phaladipika', ch: 14, sl: 25 },
      { work: 'phaladipika', ch: 12, sl: 23 }, { work: 'bphs', ch: 84, sl: 26 },
      ...b83.mile.filter((m) => m.kism !== 'saamanya').slice(0, 2).map((m) => ({ work: 'bphs', ch: 83, sl: m.sl })),
    ];
    const sh = await shlokon(want);
    const finalText = buildKarmic(person, gp, kundaliData, sh, b83);

    const geoAnswer = finalText.split('\n').map((l) => l.trim()).filter(Boolean)
      .find((l) => !l.startsWith('═══')) ?? '';
    await supabase.from('karmic_readings').update({
      gemini_narrative: finalText, geo_answer: geoAnswer.slice(0, 400), updated_at: new Date().toISOString(),
    }).eq('slug', slug);

    await notifyReportReady({
      product: 'Karmic Reading', reportUrl: `https://trikalvaani.com/karmic/${slug}`,
      orderTable: 'karmic_orders', orderId: reading.order_id ?? null,
    });
    return NextResponse.json({ success: true, slug, language, narrative: finalText, cached: false, granth: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    console.error('[Trikal] /api/karmic-reading error:', msg);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
