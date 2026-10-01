/**
 * ============================================================
 * TRIKAL VAANI — Milan Narrative (Granth Saar) API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/milan-narrative/route.ts
 * VERSION: 2.0 (1 Oct 2026) — AI BAND. Report GRANTH se.
 * ============================================================
 * v2.0 (Rohiit, 1 Oct 2026): "Only Granth Saar - Only 500 words (couple +
 *   parent ke saath)" aur "Saar do add Slokas as well in Sanskrit with Book
 *   name".
 *   * Gemini + Claude polish POORA hata. Report VM milan_engine v2.0 ke data
 *     se banti hai (Muhurta Chintamani, Vivah Prakaran sl.21-37 — har koot
 *     ka ank, shlok, faisla, parihar, Nadi ki teevrata, daan, anumaan).
 *   * SANSKRIT SHLOK aur unka HINDI ARTH Supabase bphs_slokas se — sirf woh
 *     rows jinka bharosa = 'aankh-se-padha' hai (Rohiit ki PDF ke panne
 *     107-114 dekh kar padhe gaye, 1 Oct 2026). OCR wala Sanskrit kabhi nahi.
 *     Shlok code mein nahi likhe — library sudhre to report apne aap sudhre.
 *   * Do hisse, WAHI markers jo report page (app/milan/[slug]/page.tsx)
 *     pehle se padhta hai: ═══ COUPLE VERSION ═══ (Hinglish) aur
 *     ═══ PARENT VERSION ═══ (शुद्ध हिन्दी). Kul ~500 shabd + shlok.
 *   * Single tier milan_51 (₹51/$5, couple + parent). Purani reports
 *     (gemini_narrative pehle se) jaisi hain waisi — Rohiit: "do not touch
 *     old reports".
 *   * Granth ke kathor vachan (maran, santan-haani) JAISE HAIN WAISE —
 *     Rohiit, 1 Oct: "Keep harsh line as it is.... prediction can be bitter".
 *     Saath mein engine ka parihar aur teevrata bhi, taaki poori baat jaaye.
 * PURANA (v1.10): Gemini 3.8/3.7 + Claude polish, 4 tier, 3 prompt files.
 * ============================================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyReportReady } from '@/lib/report-notify';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GRANTH = 'Muhurta Chintamani, Vivah Prakaran';
const GRANTH_HI = 'मुहूर्त चिन्तामणि, विवाह प्रकरण';

const KOOT_HI: Record<string, string> = {
  Varna: 'वर्ण', Vashya: 'वश्य', Tara: 'तारा', Yoni: 'योनि',
  'Graha Maitri': 'ग्रहमैत्री', Gana: 'गण', Bhakoot: 'भकूट', Nadi: 'नाड़ी',
};
const KOOT_ORDER = ['Varna', 'Vashya', 'Tara', 'Yoni', 'Graha Maitri', 'Gana', 'Bhakoot', 'Nadi'];

type Shlok = { deva: string; hindi: string };

/** "MC 6.25-26" -> [25, 26]; "MC 6.34 (Garga)" -> [34] */
function shlokNums(ref: unknown): number[] {
  const m = String(ref ?? '').match(/6\.(\d+)(?:-(\d+))?/);
  if (!m) return [];
  const a = Number(m[1]); const b = m[2] ? Number(m[2]) : a;
  const out: number[] = [];
  for (let i = a; i <= b && i - a < 4; i++) out.push(i);
  return out;
}

/** Engine ek shlok batata hai, par niyam kabhi do mein hota hai: Graha Maitri
 *  ki soochi 27 mein, phal 28 mein; Gan ki soochi 29 mein, phal 30 mein. */
const PURA: Record<string, number[]> = { 'Graha Maitri': [27, 28], Gana: [29, 30] };
const kootShlok = (k: string, ref: unknown) => PURA[k] ?? shlokNums(ref);

async function loadShloks(): Promise<Record<number, Shlok>> {
  const out: Record<number, Shlok> = {};
  try {
    const { data } = await supabase
      .from('bphs_slokas')
      .select('sloka,text_deva,hindi')
      .eq('work', 'muhurtachintamani')
      .eq('chapter', 6)
      .eq('bharosa', 'aankh-se-padha');
    for (const r of data ?? []) {
      if (r.text_deva) out[r.sloka] = { deva: r.text_deva, hindi: r.hindi ?? '' };
    }
  } catch (e) {
    console.error('[Trikal] shlok load failed (non-fatal):', e);
  }
  return out;
}

/** Koot ke saath vadhu-var ke gun — engine jo deta hai wahi */
function gun(k: string, v: any): string {
  if (!v) return '';
  const p = (a: any, b: any) => (a || b) ? ` (vadhu ${a ?? '—'}, var ${b ?? '—'})` : '';
  switch (k) {
    case 'Varna':        return p(v.bride, v.groom);
    case 'Vashya':       return p(v.bride_group, v.groom_group);
    case 'Yoni':         return p(v.bride_yoni, v.groom_yoni);
    case 'Gana':         return p(v.bride_gana, v.groom_gana);
    case 'Nadi':         return p(v.bride_nadi, v.groom_nadi);
    case 'Graha Maitri': return p(v.bride_lord, v.groom_lord);
    case 'Bhakoot':      return Array.isArray(v.doori) ? ` (doori ${v.doori.join('/')})` : '';
    default:             return '';
  }
}

const DAAN_HI: Record<string, string> = {
  swarn: 'स्वर्ण', gau: 'गौ', ann: 'अन्न', aur: 'और', ka: 'का', ki: 'की', daan: 'दान',
  vastra: 'वस्त्र', til: 'तिल', ghee: 'घी', chandi: 'चाँदी', bhojan: 'भोजन',
};
const daanHi = (t: string) => t.split(/(\s+|,)/).map((w) => DAAN_HI[w.toLowerCase()] ?? w).join('');

const n = (x: unknown) => {
  const v = Number(x);
  return Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : v.toFixed(1)) : '—';
};

/** Kaunse koot report mein shlok ke saath khulenge — jahan dosh ya ank aadhe se kam. */
function kamzorKoot(koots: Record<string, any>, bache: string[]): string[] {
  const set = new Set<string>();
  for (const b of bache) {
    const k = KOOT_ORDER.find((x) => x.toUpperCase().replace(' ', '_') === b.toUpperCase()
      || x.toUpperCase() === b.toUpperCase() || x.split(' ')[0].toUpperCase() === b.toUpperCase());
    if (k) set.add(k);
  }
  // bache dosh pehle, phir jinka ank aadhe se kam — sabse badi kami pehle
  const kami = KOOT_ORDER
    .filter((k) => koots?.[k] && Number(koots[k].score) < Number(koots[k].max) / 2)
    .sort((x, y) => (Number(koots[y].max) - Number(koots[y].score))
                  - (Number(koots[x].max) - Number(koots[x].score)));
  const out = [...KOOT_ORDER.filter((k) => set.has(k)), ...kami.filter((k) => !set.has(k))];
  return out.slice(0, 2);   // ~500 shabd ki seema
}

function buildGranthMilan(m: any, sh: Record<number, Shlok>): string {
  const a = m.ashtakoot_data ?? {};
  const koots: Record<string, any> = a.koots ?? {};
  const bride = m.bride_data?.name ?? 'Kanya';
  const groom = m.groom_data?.name ?? 'Var';
  const total = n(a.total_score ?? m.ashtakoot_score);
  const bache: string[] = Array.isArray(a.bache_dosh) ? a.bache_dosh : [];
  const wajah: string[] = Array.isArray(a.faisla_wajah) ? a.faisla_wajah : [];
  const parihar: string[] = Array.isArray(a.parihar) ? a.parihar : [];
  const anumaan: string[] = Array.isArray(a.anumaan) ? a.anumaan : [];
  const daan: string[] = Array.isArray(a.daan) ? a.daan : [];
  const nt = a.nadi_teevrata ?? null;
  const mg = m.manglik_data?.combined ?? null;
  const focus = kamzorKoot(koots, bache);
  const out: string[] = [];

  // ═══════════ COUPLE VERSION (Hinglish) ═══════════
  out.push('═══ COUPLE VERSION ═══');
  out.push(`${groom} aur ${bride} — Ashtakoot gun milan ${total}/36. Granth ke anusaar faisla: `
    + `${a.faisla ?? '—'}.${wajah.length ? ' Wajah: ' + wajah.join('; ') + '.' : ''}`);
  const bm = a.bride_moon ?? {}; const gm = a.groom_moon ?? {};
  if (bm.rashi || gm.rashi) {
    out.push(`Janm Chandra — ${bride}: ${bm.rashi ?? '—'} raashi, ${bm.nakshatra ?? '—'} nakshatra · `
      + `${groom}: ${gm.rashi ?? '—'} raashi, ${gm.nakshatra ?? '—'} nakshatra. `
      + 'Ashtakoot inhi do Chandra se milaya jaata hai.');
  }
  out.push('Aathon koot: ' + KOOT_ORDER.filter((k) => koots[k])
    .map((k) => `${k} ${n(koots[k].score)}/${n(koots[k].max)}${gun(k, koots[k])}`).join(' · ') + '.');
  for (const k of focus) {
    const v = koots[k];
    const nums = kootShlok(k, v?.sloka);
    const deva = nums.map((x) => sh[x]?.deva).filter(Boolean).join(' ');
    out.push(`${k} ${n(v?.score)}/${n(v?.max)}${gun(k, v)}${v?.wajah ? ' — ' + v.wajah : ''}. ${deva ? deva + ` — ${GRANTH}, shlok ${nums.join('-')}.` : `${GRANTH}, shlok ${nums.join('-') || '—'}.`}`);
  }
  if (nt?.teevrata) {
    out.push(`Nadi dosh ki teevrata: ${nt.teevrata}${nt.kispar ? ` (${nt.kispar})` : ''}`
      + `${nt.sloka ? ` — ${nt.sloka}` : ''}.`);
  }
  out.push(parihar.length
    ? `Parihar: ${parihar.join('; ')}.`
    : 'Is jodi par granth ka koi parihar laagu nahi hota.');
  if (mg?.verdict) out.push(`Manglik: ${mg.verdict}.`);
  if (daan.length) out.push(`Granth ka daan: ${daan.join(', ')}.`);
  if (anumaan.length) out.push(`Jahan granth chup hai, wahan kya maana: ${anumaan.join('; ')}.`);
  out.push('');

  // ═══════════ PARENT VERSION (शुद्ध हिन्दी) ═══════════
  out.push('═══ PARENT VERSION ═══');
  out.push(`आदरणीय माता-पिता, ${groom} और ${bride} का अष्टकूट गुण मिलान ${total}/36 है। `
    + `ग्रन्थ के अनुसार निर्णय: ${a.verdict_hi ?? a.faisla ?? '—'}।`);
  out.push('आठों कूट: ' + KOOT_ORDER.filter((k) => koots[k])
    .map((k) => `${KOOT_HI[k] ?? k} ${n(koots[k].score)}/${n(koots[k].max)}`).join(' · ') + '।');
  for (const k of focus) {
    const nums = kootShlok(k, koots[k]?.sloka);
    const hi = nums.map((x) => sh[x]?.hindi).filter(Boolean).join(' ');
    if (hi) out.push(`${KOOT_HI[k] ?? k} कूट पर ग्रन्थ कहता है — "${hi}" (${GRANTH_HI}, श्लोक ${nums.join('-')})`);
  }
  if (parihar.length && sh[32]?.hindi) {
    out.push(`परिहार — ${sh[32].hindi} (${GRANTH_HI}, श्लोक ३२)`);
  } else if (!parihar.length) {
    out.push('इस जोड़ी पर ग्रन्थ का कोई परिहार लागू नहीं होता।');
  }
  if (mg?.verdict_hi) out.push(`मांगलिक: ${mg.verdict_hi}।`);
  if (daan.length) out.push(`ग्रन्थ के अनुसार दान: ${daan.map(daanHi).join(', ')}।`);
  out.push('यह ग्रन्थ का कथन है। अंतिम निर्णय में दोनों परिवारों की समझ, बच्चों की आपसी सहमति '
    + 'और योग्य ज्योतिषी से व्यक्तिगत परामर्श भी उतना ही महत्त्वपूर्ण है।');
  return out.join('\n\n');
}

interface NarrativeRequest { slug: string; }

export async function POST(req: NextRequest) {
  try {
    const { slug }: NarrativeRequest = await req.json();
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }
    const { data: milan, error: loadErr } = await supabase
      .from('kundali_milan').select('*').eq('slug', slug).single();
    if (loadErr || !milan) {
      console.error('[Trikal] Milan record not found:', slug, loadErr?.message);
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }
    // Purani reports jaisi hain waisi (Rohiit, 1 Oct 2026)
    if (milan.gemini_narrative && milan.gemini_narrative.length > 200) {
      return NextResponse.json({
        success: true, slug, tier: milan.tier, audience: milan.audience,
        narrative: milan.gemini_narrative, cached: true,
      });
    }
    if (!milan.ashtakoot_data) {
      console.error('[Trikal] Milan core engine data missing for slug:', slug);
      return NextResponse.json(
        { error: 'Reading data incomplete. Please contact support.' }, { status: 500 });
    }

    const shloks = await loadShloks();
    const finalText = buildGranthMilan(milan, shloks);

    const { error: saveErr } = await supabase
      .from('kundali_milan')
      .update({ gemini_narrative: finalText, updated_at: new Date().toISOString() })
      .eq('slug', slug);
    if (saveErr) {
      console.error('[Trikal] Milan narrative save failed:', saveErr.message);
    } else {
      await notifyReportReady({
        product: 'Kundali Milan',
        reportUrl: `https://trikalvaani.com/milan/${slug}`,
        orderTable: 'kundali_milan_orders',
        orderId: milan.order_id ?? null,
      });
    }
    return NextResponse.json({
      success: true, slug, tier: milan.tier, audience: milan.audience,
      narrative: finalText, cached: false, granth: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Trikal] /api/milan-narrative error:', msg);
    return NextResponse.json({ error: 'Server error generating narrative.' }, { status: 500 });
  }
}
