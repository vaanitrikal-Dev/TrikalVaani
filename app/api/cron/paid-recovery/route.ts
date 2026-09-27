// ════════════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER
// ════════════════════════════════════════════════════════════════════════════
// File:     app/api/cron/paid-recovery/route.ts
// Version:  v1.1 (27 Sep 2026)
// Owner:    Rohiit Gupta, Chief Vedic Architect
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

type Product =
  | 'deep' | 'hast_rekha' | 'karmic' | 'milan' | 'muhurat' | 'voice_pack'
  | 'skip_yog' | 'skip_voice' | 'skip_dakshina' | 'skip_unknown';

const LABEL: Record<string, string> = {
  deep: 'Deep Reading / Swapna (₹51)', hast_rekha: 'Hast Rekha',
  karmic: 'Karmic Background Reading', milan: 'Kundali Milan',
  muhurat: 'Muhurat Report', voice_pack: 'Voice Pack',
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
    const res = await fetch(`${SITE}/api/predict`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(250_000),
    });
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
      subject: 'paid-recovery: Razorpay list fail', body: msg.slice(0, 800) }, 6);
    return NextResponse.json({ ok: false, error: `razorpay list: ${msg}` }, { status: 500 });
  }

  let recoveriesThisRun = 0;

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

  if (summary.errors.length) {
    await raiseAlertOnce({ severity: 'warning', source: 'paid-recovery',
      subject: 'paid-recovery: check errors', body: summary.errors.join('\n').slice(0, 1500) }, 6);
  }

  console.log('[paid-recovery]', JSON.stringify(summary));
  return NextResponse.json({ ok: true, window_hours: WINDOW_SEC / 3600, ...summary });
}

// END — app/api/cron/paid-recovery/route.ts v1.1 | Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
