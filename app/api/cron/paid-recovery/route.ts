// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     app/api/cron/paid-recovery/route.ts
// Version:  v1.7 (10 Oct 2026)
// v1.7 (10 Oct 2026) — UPAY REPORT (₹51) juda: notes.product 'upay' → upay_reports
//   mein status 'ready' na ho to lib/upay-report generateUpayReport() se KHUD
//   banata hai (wahi function jo callback chalata hai) — max 2 koshish, phir alert.
// v1.6 (30 Sep 2026)
// v1.6 (30 Sep 2026) — CEO: sirf is cron file mein, lib/alert.ts nahi chhuna. Do
//   system alerts ('Razorpay list fail', 'check errors') 6 ghante wali window par
//   the (din mein 4 baar tak) → ab baaki sab ki tarah 30 din mein EK baar.
// v1.5 (30 Sep 2026) — CEO: "Alert sirf 2 baar". Reading-nahi-bani alert ke
//   subject se MINUTE hataye (har 5 min naya subject → dedupe fail → har run
//   email). Ab subject stable, aur lib/alert v1.1 har subject max 2 baar bhejta hai.
// Owner:    Rohiit Gupta, Chief Vedic Architect
//
// ── v1.4 (29 Sep 2026) — PHASE 3: HAST REKHA RETRY (CEO approved) ────────
//   C. pending_review Hast Rekha (retry_input wali, 5-60 min purani, <6
//      koshish) → private bucket se photo, paid-analyze POST andar hi RETRY
//      mode mein → report + PDF + 1-tap email. Har run max 1, sirf tab jab
//      is run mein koi aur recovery na hui ho (VM 180s + PDF 60s).
//   D. 60 min tak na bani → CEO ko critical alert: "REFUND karein" (CEO
//      faisla: 60 min mein na bane to refund).
//   E. Photo cleanup: 7 din se purani palm-retry photos delete (CEO: storage
//      full nahi karni). Success par route khud turant delete karta hai.
//   Razorpay loop: jis Hast Rekha ka retry chal raha ho (60 min ke andar) us
//   par generic "Paisa aaya, report nahi" alert nahi (pehle 10 min par hi
//   aa jaata tha, retry se pehle).
//
// ── v1.3 (29 Sep 2026) — SURAKSHIT 1-TAP PHASE 2 (CEO: "Yes bhai") ──────
//   CEO ka niyam: har paid customer ko 10 min ke andar WhatsApp report.
//   A. EMAIL RETRY: report_notifications ki jin rows ka email fail hua
//      (emailed_at khaali) — har run mein 5 tak dobara (lib/report-notify
//      retryPendingEmails).
//   B. READING RECOVERY: Milan / Karmic / Child Birth Muhurat ki reading
//      customer ke BROWSER se banti hai — page band = reading kabhi nahi.
//      Ab: jis reading row ko bane 8-60 min ho gaye aur gemini_narrative
//      khaali hai, cron us route ka POST andar hi chalata hai ({slug}) —
//      wahi AI fallback + save + 1-tap email jo browser mein hota. Har run
//      max 1, aur sirf tab jab is run mein Deep recovery na hui ho (300s
//      budget). 60 min tak (≈10 koshish) na bane → CEO ko ek critical alert.
//      Sirf PAID readings (order_id wali) — free Milan rows chhodi jaati hain.
//      Koi Supabase schema change nahi.
//
// ── v1.2 (27 Sep 2026) — REPORT AB SERVER KE ANDAR HI BANTI HAI ───────
//   Pehle chowkidar https://trikalvaani.com/api/predict ko internet se call
//   karta tha. Vercel firewall datacenter IPs ko 403 de raha tha — chowkidar
//   bhi block ho sakta tha. Ab predict route ka POST seedha import karke
//   andar hi chalaya jaata hai: na network, na firewall. Signature check,
//   amount check, Supabase save — sab predict route khud karta hai.
//
// ── v1.1 (27 Sep 2026, deploy se pehle ka self-critique) ─────────────────
//   • WINDOW 26h → 7 din. 30 din ka backtest kiya: 26 real paid payments mein
//     5 leak nikle (Avj, Pandey, Poonam Hast Rekha 5 Sep, Yash duplicate Deep
//     5 Sep, Voice pack 8360321947 19 Sep) — 3 purane the jo 26h window kabhi
//     na pakadti. Alert de-dupe 72h → 30 din, taaki har payment ka email EK baar.
//   • GRACE 5 → 10 min. UPI app se der se lautne wala customer aur cron dono
//     ek hi report na banayein (duplicate Gemini call).
//   • Auto-recovery 2 baar fail → andar hi CRITICAL alert jaata hai; agle run
//     mein wahi payment dobara generic alert nahi bhejta (pehle double email).
//
// ── KYUN BANA ──────────────────────────────────────────────────────────────
// 26-27 Sep 2026: do customers ka paisa Razorpay mein captured, report zero.
//   • Avj (Hast Rekha) — VM ne payment ke BAAD photo "blur" bol ke reject ki.
//   • 9250886991 (Deep Reading) — UPI app se wapas aate hi tab reload,
//     /api/predict kabhi call hi nahi hua.
// Dono baar CEO ko customer ke WhatsApp se pata chala. Report banana poori
// tarah customer ke browser par tika tha, server ke paas koi backup nahi tha.
//
// ── KYA KARTA HAI (har 5 min, vercel.json cron) ────────────────────────────
// 1. Razorpay se pichhle 7 din ke CAPTURED payments laata hai
//    (refunded aur 5 min se naye skip). Test number 9560886116: sirf Deep
//    recovery chalti hai (live testing ke liye), koi alert nahi.
// 2. Har payment ke liye apne table mein dekhta hai ki report/order bana ya nahi.
// 3. Deep Reading + `paid_order_intents` mein birth data mila → report KHUD
//    banata hai (/api/predict, server-computed Razorpay signature ke saath) aur
//    CEO ko link + customer number email karta hai. Ek run mein max 1 recovery,
//    har order par max 2 koshish.
// 4. Baaki har missing case (Hast Rekha, Karmic, Milan, Muhurat, Voice pack,
//    Swapna, purane Deep) → CEO ko CRITICAL alert: kaun, kitna, kab, kya karna.
//    Har payment ka alert sirf EK baar (raiseAlertOnce, 30 din).
//
// ── JAAN-BOOJH KAR MONITOR NAHI ────────────────────────────────────────────
//   • yog calculators (UPSC/Videsh etc.) — result kahin save nahi hota,
//     match karne ko table hi nahi hai → har payment false alarm hota.
//   • ₹11 voice reading (tier 'voice') — storage path verify nahi kiya.
//   • Dakshina — koi report deliver nahi hoti.
//   Yeh `skipped` mein count hote hain, response mein dikhte hain.
//
// ── SECURITY ───────────────────────────────────────────────────────────────
//   CRON_SECRET (Vercel khud Bearer bhejta hai). Manual run = Vercel dashboard
//   → Settings → Cron Jobs → paid-recovery → "Run".
// ════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { raiseAlert, raiseAlertOnce } from '@/lib/alert';
import { POST as predictPOST } from '@/app/api/predict/route'; // v1.2: in-process
import { POST as karmicPOST }  from '@/app/api/karmic-reading/route';   // v1.3
import { POST as milanPOST }   from '@/app/api/milan-narrative/route';  // v1.3
import { POST as muhuratPOST } from '@/app/api/muhurat-paid/route';     // v1.3
import { retryPendingEmails }  from '@/lib/report-notify';              // v1.3
import { POST as palmPOST }    from '@/app/api/palmistry/paid-analyze/route'; // v1.4
import { generateUpayReport }  from '@/lib/upay-report';                    // v1.7

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const CRON_SECRET     = process.env.CRON_SECRET;
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';
const SITE            = 'https://trikalvaani.com';
const TEST_NUMBER     = '9560886116';
const WINDOW_SEC      = 7 * 24 * 3600; // kitna peeche dekhna (v1.1: 26h → 7 din)
const GRACE_SEC       = 10 * 60;     // itna naya payment abhi browser ke paas hai (v1.1: 5 → 10 min)
const MAX_ATTEMPTS    = 2;
const MAX_RECOVERIES_PER_RUN = 1;    // predict ~5-60s leta hai, 300s budget
const ALERT_DEDUPE_HOURS = 30 * 24;  // v1.1: har payment ka alert sirf ek baar
const NARR_GRACE_MIN  = 8;           // v1.3: itni der browser ko reading banane do
const NARR_GIVEUP_MIN = 60;          // v1.3: isse purani ho to cron nahi, alert

// v1.3: browser-generated readings (Milan / Karmic / Muhurat)
const NARRATIVE_JOBS = [
  { table: 'kundali_milan',    label: 'Kundali Milan',       page: 'milan',   run: milanPOST,   api: '/api/milan-narrative' },
  { table: 'karmic_readings',  label: 'Karmic Reading',      page: 'karmic',  run: karmicPOST,  api: '/api/karmic-reading' },
  { table: 'muhurat_readings', label: 'Child Birth Muhurat', page: 'muhurat', run: muhuratPOST, api: '/api/muhurat-paid' },
] as const;

// ── v1.4 — HAST REKHA RETRY ────────────────────────────────────────────────
const PALM_BUCKET      = 'palm-retry';
const PALM_GRACE_MIN   = 5;
const PALM_GIVEUP_MIN  = 60;
const PALM_MAX_TRIES   = 6;
const PALM_PHOTO_DAYS  = 7;

/** Razorpay loop ke liye: is payment ka retry abhi chal raha hai? */
async function palmRetryInProgress(supa: any, paymentId: string): Promise<boolean> {
  const since = new Date(Date.now() - PALM_GIVEUP_MIN * 60_000).toISOString();
  const { data } = await supa.from('palmistry_reports').select('slug')
    .eq('payment_id', paymentId).eq('tier', 'pending_review')
    .not('retry_input', 'is', null).gte('created_at', since).limit(1);
  return (data ?? []).length > 0;
}

/** Ek pending Hast Rekha dobara banao (ya 60 min baad refund alert). */
async function retryOnePalm(supa: any): Promise<string | null> {
  const now = Date.now();
  const { data: rows, error } = await supa.from('palmistry_reports')
    .select('slug, created_at, user_name, user_mobile, gender, language, payment_id, razorpay_order_id, retry_input, retry_count')
    .eq('tier', 'pending_review').not('retry_input', 'is', null)
    .lte('created_at', new Date(now - PALM_GRACE_MIN * 60_000).toISOString())
    .gte('created_at', new Date(now - 24 * 3600_000).toISOString())
    .order('created_at', { ascending: true }).limit(10);
  if (error) throw new Error(`palmistry_reports: ${error.message}`);

  for (const r of rows ?? []) {
    const ageMin = (now - new Date(r.created_at).getTime()) / 60_000;
    const ri = r.retry_input ?? {};
    if (ageMin > PALM_GIVEUP_MIN || (r.retry_count ?? 0) >= PALM_MAX_TRIES || !ri.dominant_path) {
      await raiseAlertOnce({
        severity: 'critical', source: 'paid-recovery',
        subject: `Hast Rekha nahi bani — REFUND karein — ${r.payment_id}`,
        body: `Hast Rekha ${Math.round(ageMin)} min se pending, ${r.retry_count ?? 0} baar dobara koshish fail.\n` +
              `Customer: ${r.user_name ?? '-'} | ${r.user_mobile ?? '-'}\n` +
              `Payment: ${r.payment_id} (order ${r.razorpay_order_id ?? '-'})\n` +
              `ACTION: Razorpay dashboard se ${r.payment_id} REFUND karo (CEO niyam: 60 min mein na bane to refund).`,
      }, ALERT_DEDUPE_HOURS);
      continue;
    }
    const dl = async (path: string | null) => {
      if (!path) return null;
      const { data, error: e } = await supa.storage.from(PALM_BUCKET).download(path);
      if (e || !data) throw new Error(`photo download ${path}: ${e?.message ?? 'empty'}`);
      return await data.text();
    };
    const dominant = await dl(ri.dominant_path);
    const other    = await dl(ri.other_path ?? null);
    const t0 = Date.now();
    const res = await palmPOST(new NextRequest(`${SITE}/api/palmistry/paid-analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id:   r.razorpay_order_id ?? '',
        razorpay_payment_id: r.payment_id ?? '',
        razorpay_signature:  '',
        paypal_order_id:     ri.paypal_order_id ?? null,
        dominant_palm_b64:   dominant, right_palm_b64: dominant,
        other_palm_b64:      other,    left_palm_b64:  other,
        handedness:          ri.handedness ?? 'right',
        user_name:           r.user_name ?? '', user_mobile: r.user_mobile ?? '',
        gender:              r.gender ?? 'M',   language:    r.language ?? 'hi',
        dob:                 ri.dob ?? '',
        _retry_slug:         r.slug,
        _retry_key:          process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
      }),
    }));
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    return `Hast Rekha ${r.slug}: ${res.ok ? 'RECOVERED' : 'retry failed HTTP ' + res.status} (${secs}s, try ${(r.retry_count ?? 0) + 1})`;
  }
  return null;
}

/** 7 din se purani palm-retry photos delete (CEO policy). */
async function cleanupOldPalmPhotos(supa: any): Promise<number> {
  const cutoff = new Date(Date.now() - PALM_PHOTO_DAYS * 24 * 3600_000).toISOString();
  const { data: rows } = await supa.from('palmistry_reports')
    .select('slug, retry_input').not('retry_input', 'is', null)
    .lte('created_at', cutoff).limit(50);
  let n = 0;
  for (const r of rows ?? []) {
    const ri = r.retry_input ?? {};
    if (ri.photos_deleted) continue;
    const paths = [ri.dominant_path, ri.other_path].filter(Boolean);
    if (paths.length) await supa.storage.from(PALM_BUCKET).remove(paths);
    await supa.from('palmistry_reports')
      .update({ retry_input: { ...ri, photos_deleted: new Date().toISOString() } }).eq('slug', r.slug);
    n++;
  }
  return n;
}

/** v1.3: ek khaali reading dhoondh ke server par banao. Result text lautata hai. */
async function recoverOneNarrative(supa: any): Promise<string | null> {
  const now = Date.now();
  const newest = new Date(now - NARR_GRACE_MIN * 60_000).toISOString();
  const oldest = new Date(now - 24 * 3600_000).toISOString();
  for (const job of NARRATIVE_JOBS) {
    // Sirf PAID readings: order_id wali (free Milan rows ka order_id khaali hota hai —
    // live DB check 29 Sep: 2 free Milan rows khaali mili, unpar AI/alert nahi chahiye)
    const { data: rows, error } = await supa.from(job.table)
      .select('slug, created_at, gemini_narrative, order_id')
      .not('order_id', 'is', null)
      .lte('created_at', newest).gte('created_at', oldest)
      .order('created_at', { ascending: true }).limit(20);
    if (error) throw new Error(`${job.table}: ${error.message}`);
    const pending = (rows ?? []).filter((r: any) => !r.gemini_narrative || String(r.gemini_narrative).length < 200);
    for (const r of pending) {
      const ageMin = (now - new Date(r.created_at).getTime()) / 60_000;
      if (ageMin > NARR_GIVEUP_MIN) {
        await raiseAlertOnce({
          severity: 'critical', source: 'paid-recovery',
          subject: `Reading nahi bani — ${job.label} ${r.slug}`,   // v1.5: stable (minute body mein)
          body: `${job.label} ki paid reading ${Math.round(ageMin)} min se khaali hai; cron ki har koshish fail.\n` +
                `Page: ${SITE}/${job.page}/${r.slug}\n` +
                `ACTION: page khol ke "Dobara koshish karein" dabao; na bane to Vercel log mein "${job.api}" dekho ya refund karo.`,
        }, ALERT_DEDUPE_HOURS);
        continue;
      }
      const t0 = Date.now();
      const res = await job.run(new NextRequest(`${SITE}${job.api}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: r.slug }),
      }));
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      return `${job.label} ${r.slug}: ${res.ok ? 'RECOVERED' : 'FAILED HTTP ' + res.status} (${secs}s)`;
    }
  }
  return null;
}

type Product =
  | 'deep' | 'hast_rekha' | 'karmic' | 'milan' | 'muhurat' | 'voice_pack' | 'upay'
  | 'skip_yog' | 'skip_voice' | 'skip_dakshina' | 'skip_unknown';

const LABEL: Record<string, string> = {
  deep: 'Deep Reading / Swapna (₹51)', hast_rekha: 'Hast Rekha',
  karmic: 'Karmic Background Reading', milan: 'Kundali Milan',
  muhurat: 'Muhurat Report', voice_pack: 'Voice Pack', upay: 'Upay Report (₹51)',
};

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function classify(p: any): Product {
  const n = p.notes ?? {};
  const purpose = String(n.purpose ?? '');
  if (n.product === 'hast_rekha')        return 'hast_rekha';
  if (n.product === 'trikal_voice_pack') return 'voice_pack';
  if (n.product === 'yog')               return 'skip_yog';
  if (n.product === 'upay')              return 'upay';      // v1.7
  if (/karmic/i.test(purpose))           return 'karmic';
  if (/milan/i.test(purpose))            return 'milan';
  if (/muhurat/i.test(purpose))          return 'muhurat';
  if (/dakshina/i.test(purpose))         return 'skip_dakshina';
  if (n.tier === 'deep')                 return 'deep';
  if (n.tier === 'voice')                return 'skip_voice';
  return 'skip_unknown';
}

// true = customer ko cheez mil gayi (ya kam se kam order verify ho gaya)
async function isDelivered(supa: any, product: Product, paymentId: string): Promise<boolean> {
  const one = async (table: string, col: string, extra?: (q: any) => any) => {
    let q = supa.from(table).select('*', { count: 'exact', head: true }).eq(col, paymentId);
    if (extra) q = extra(q);
    const { count, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    return (count ?? 0) > 0;
  };
  switch (product) {
    case 'deep':       return one('predictions', 'razorpay_payment_id');
    case 'hast_rekha': return one('palmistry_reports', 'payment_id', q => q.neq('tier', 'pending_review'));
    case 'karmic':     return one('karmic_orders', 'razorpay_payment_id');
    case 'milan':      return one('kundali_milan_orders', 'razorpay_payment_id');
    case 'muhurat':    return one('muhurat_orders', 'razorpay_payment_id');
    case 'voice_pack': return one('voice_packs', 'razorpay_payment_id');
    case 'upay':       return one('upay_reports', 'razorpay_payment_id', q => q.eq('status', 'ready')); // v1.7
    default:           return true;
  }
}

function ist(sec: number): string {
  return new Date(sec * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
}

function waLink(mobile: string): string {
  const d = mobile.replace(/\D/g, '');
  return `https://wa.me/${d.length === 10 ? '91' + d : d}`;
}

// Deep Reading ko saved birth data se dobara banao. Result text lautata hai.
async function recoverDeep(supa: any, p: any): Promise<string> {
  const { data: intent, error } = await supa
    .from('paid_order_intents').select('*')
    .eq('razorpay_order_id', p.order_id).maybeSingle();
  if (error) return `intent read error: ${error.message}`;
  if (!intent) return 'no_intent';
  if (intent.recovered_at) return 'already_recovered';
  if (intent.recovery_attempts >= MAX_ATTEMPTS) return 'attempts_exhausted';

  // Claim: attempts badhao sirf agar kisi aur run ne nahi badhaya
  const { data: claimed } = await supa.from('paid_order_intents')
    .update({ recovery_attempts: intent.recovery_attempts + 1 })
    .eq('razorpay_order_id', p.order_id)
    .eq('recovery_attempts', intent.recovery_attempts)
    .select('razorpay_order_id');
  if (!claimed || claimed.length === 0) return 'claimed_by_other_run';

  // Race check: claim ke beech browser ne report bana di ho?
  if (await isDelivered(supa, 'deep', p.id)) {
    await supa.from('paid_order_intents').update({ last_error: 'browser delivered first' })
      .eq('razorpay_order_id', p.order_id);
    return 'delivered_meanwhile';
  }

  const signature = crypto.createHmac('sha256', RAZORPAY_SECRET)
    .update(`${p.order_id}|${p.id}`).digest('hex');

  const body = {
    ...intent.predict_body,
    predictionTier: 'paid',
    paypalVerification: null,
    paymentVerification: {
      razorpay_order_id:   p.order_id,
      razorpay_payment_id: p.id,
      razorpay_signature:  signature,
      amount:              p.amount,
    },
  };

  const attemptNo = intent.recovery_attempts + 1;
  try {
    // v1.2: no HTTP hop — call the predict handler directly (firewall-proof)
    const res = await predictPOST(new NextRequest(`${SITE}/api/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }));
    const data: any = await res.json().catch(() => ({}));
    const slug = data?._meta?.publicSlug ?? null;
    if (!res.ok || !slug) throw new Error(`predict HTTP ${res.status}: ${String(data?.error ?? 'no slug').slice(0, 200)}`);

    await supa.from('paid_order_intents')
      .update({ recovered_at: new Date().toISOString(), recovered_slug: slug, last_error: null })
      .eq('razorpay_order_id', p.order_id);

    const mobile = intent.customer_mobile || p.contact || '';
    const link = `${SITE}/report/${slug}`;
    await raiseAlert({
      severity: 'warning',
      source:   'paid-recovery',
      subject:  `Report auto-bana — ${intent.customer_name ?? ''} ${mobile} — customer ko link bhejo`,
      body: [
        `Customer ka browser payment ke baad report tak nahi pahuncha. Server ne saved birth data se report bana di hai.`,
        ``,
        `Naam: ${intent.customer_name ?? '-'}`,
        `Mobile: ${mobile}`,
        `Payment: ${p.id} | ₹${p.amount / 100} | ${ist(p.created_at)} IST`,
        `REPORT LINK: ${link}`,
        ``,
        `ACTION: ${waLink(mobile)} kholo aur bhejo —`,
        `"Jai Shri Krishna 🙏 Aapki Trikaal Vaani Deep Reading taiyaar hai: ${link}"`,
      ].join('\n'),
    });
    return `recovered:${slug}`;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supa.from('paid_order_intents').update({ last_error: msg.slice(0, 500) })
      .eq('razorpay_order_id', p.order_id);
    if (attemptNo >= MAX_ATTEMPTS) {
      await raiseAlert({
        severity: 'critical',
        source:   'paid-recovery',
        subject:  `Paisa aaya, report nahi — auto-recovery FAIL — ${p.id}`,
        body: [
          `Deep Reading ki auto-recovery ${MAX_ATTEMPTS} baar fail hui.`,
          `Payment: ${p.id} | ₹${p.amount / 100} | ${ist(p.created_at)} IST | ${intent.customer_mobile ?? p.contact}`,
          `Last error: ${msg}`,
          ``,
          `ACTION: customer ko WhatsApp karo (${waLink(intent.customer_mobile || p.contact || '')}) — report manually banao ya Razorpay se refund karo.`,
        ].join('\n'),
      });
    }
    return `recovery_failed:${msg.slice(0, 120)}`;
  }
}

export async function GET(req: NextRequest) {
  if (CRON_SECRET && req.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!RAZORPAY_SECRET) {
    return NextResponse.json({ error: 'RAZORPAY_KEY_SECRET missing' }, { status: 500 });
  }

  const supa = admin();
  const rzp  = new Razorpay({
    key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: RAZORPAY_SECRET,
  });

  const now  = Math.floor(Date.now() / 1000);
  const summary = { checked: 0, delivered: 0, recovered: [] as string[], alerted: [] as string[],
                    skipped: {} as Record<string, number>, errors: [] as string[], notes: [] as string[] };

  let items: any[] = [];
  try {
    const list: any = await rzp.payments.all({ from: now - WINDOW_SEC, to: now - GRACE_SEC, count: 100 } as any);
    items = list?.items ?? [];
  } catch (e) {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    await raiseAlertOnce({ severity: 'critical', source: 'paid-recovery',
      subject: 'paid-recovery: Razorpay list fail', body: msg.slice(0, 800) }, ALERT_DEDUPE_HOURS); // v1.6
    return NextResponse.json({ ok: false, error: `razorpay list: ${msg}` }, { status: 500 });
  }

  let recoveriesThisRun = 0;
  const runStart = Date.now();

  // v1.3 A — fail hue 1-tap emails dobara
  const emailRetry = await retryPendingEmails(5);
  if (emailRetry.tried) summary.notes.push(`email retry: ${emailRetry.sent}/${emailRetry.tried} sent`);

  for (const p of items) {
    if (p.status !== 'captured' || (p.amount_refunded ?? 0) > 0) continue;
    const product = classify(p);
    if (product.startsWith('skip_')) { summary.skipped[product] = (summary.skipped[product] ?? 0) + 1; continue; }

    // Test number: Deep recovery chalne do (live test isi se hoga), baaki sab skip
    const isTest = String(p.contact ?? '').includes(TEST_NUMBER);
    if (isTest && product !== 'deep') { summary.skipped.test = (summary.skipped.test ?? 0) + 1; continue; }

    summary.checked++;
    try {
      if (await isDelivered(supa, product, p.id)) { summary.delivered++; continue; }

      // Deep → pehle khud banane ki koshish
      if (product === 'deep') {
        if (recoveriesThisRun >= MAX_RECOVERIES_PER_RUN) { summary.notes.push(`${p.id}: next run`); continue; }
        const r = await recoverDeep(supa, p);
        summary.notes.push(`${p.id}: ${r}`);
        if (r.startsWith('recovered') || r.startsWith('recovery_failed') || r === 'delivered_meanwhile') {
          recoveriesThisRun++;
          if (r.startsWith('recovered')) summary.recovered.push(p.id);
          continue;
        }
        // attempts_exhausted → recoverDeep ne critical alert pehle hi bhej diya
        if (r === 'attempts_exhausted') continue;
        // no_intent → neeche generic alert
        if (isTest) { summary.skipped.test = (summary.skipped.test ?? 0) + 1; continue; }
      }

      // v1.7 — Upay Report: server par khud banao (callback wala hi function)
      if (product === 'upay') {
        const { data: ur } = await supa.from('upay_reports').select('attempts')
          .eq('razorpay_order_id', p.order_id).maybeSingle();
        if (ur && (ur.attempts ?? 0) < MAX_ATTEMPTS) {
          if (recoveriesThisRun >= MAX_RECOVERIES_PER_RUN) { summary.notes.push(`${p.id}: upay next run`); continue; }
          recoveriesThisRun++;
          const r = await generateUpayReport(p.order_id, p.id, 'cron');
          summary.notes.push(`${p.id}: upay ${r.ok ? 'recovered:' + r.slug : r.reason + (r.error ? ' ' + r.error.slice(0, 80) : '')}`);
          if (r.ok) { summary.recovered.push(p.id); continue; }
          if (r.reason === 'claimed') continue;
          if ((ur.attempts ?? 0) + 1 < MAX_ATTEMPTS) continue;   // agla run ek aur koshish
        }
        // row hi nahi, ya koshishein khatam → neeche generic critical alert (ek baar)
      }

      // v1.4 — Hast Rekha ka retry chal raha hai to abhi alert nahi (60 min baad retryOnePalm khud bhejega)
      if (product === 'hast_rekha' && await palmRetryInProgress(supa, p.id)) {
        summary.notes.push(`${p.id}: hast rekha retry in progress`);
        continue;
      }

      const res = await raiseAlertOnce({
        severity: 'critical',
        source:   'paid-recovery',
        subject:  `Paisa aaya, report nahi — ${p.id}`,
        body: [
          `Product: ${LABEL[product] ?? product}`,
          `Payment: ${p.id} | ₹${p.amount / 100} | ${p.method} | ${ist(p.created_at)} IST`,
          `Customer: ${p.contact ?? '-'}`,
          `Razorpay description: ${p.description ?? '-'}`,
          ``,
          `Hamare table mein iski report/order nahi mili${product === 'hast_rekha' ? ' (ya pending_review mein atki hai)' : ''}.`,
          `ACTION: ${waLink(p.contact ?? '')} par customer se baat karo — report manually banao ya Razorpay dashboard se ${p.id} refund karo.`,
        ].join('\n'),
      }, ALERT_DEDUPE_HOURS);
      if (!res.suppressed) summary.alerted.push(p.id);
    } catch (e) {
      summary.errors.push(`${p.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // v1.3 B — browser-generated readings (sirf tab jab Deep recovery na hui ho)
  let heavyRan = recoveriesThisRun > 0;
  if (!heavyRan && Date.now() - runStart < 60_000) {
    try {
      const r = await recoverOneNarrative(supa);
      if (r) { summary.notes.push(r); heavyRan = true; }
    } catch (e) {
      summary.errors.push(`narrative: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // v1.4 C/D — Hast Rekha retry / 60-min refund alert (sirf tab jab kuch aur bhaari na chala ho)
  if (!heavyRan && Date.now() - runStart < 45_000) {
    try {
      const r = await retryOnePalm(supa);
      if (r) summary.notes.push(r);
    } catch (e) {
      summary.errors.push(`palm retry: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // v1.4 E — 7 din purani palm photos delete
  try {
    const n = await cleanupOldPalmPhotos(supa);
    if (n) summary.notes.push(`palm photos deleted: ${n}`);
  } catch (e) {
    summary.errors.push(`palm cleanup: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (summary.errors.length) {
    await raiseAlertOnce({ severity: 'warning', source: 'paid-recovery',
      subject: 'paid-recovery: check errors', body: summary.errors.join('\n').slice(0, 1500) }, ALERT_DEDUPE_HOURS); // v1.6
  }

  console.log('[paid-recovery]', JSON.stringify(summary));
  return NextResponse.json({ ok: true, window_hours: WINDOW_SEC / 3600, ...summary });
}

// END — app/api/cron/paid-recovery/route.ts v1.7 | Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
