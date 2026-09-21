/**
 * ============================================================================
 * FILE   : lib/usage-log.ts
 * VERSION: v1.2 — logUsage() ab Promise lautata hai, taaki route AWAIT kar sake (21 Sep 2026)
 * PICHHLA: v1.1
 * DATE   : 18 September 2026  (v1.1 — usageBirthFields helper added)
 * ============================================================================
 *
 * WHAT THIS IS
 *   One tiny helper that records every use of every Trikaal Vaani product
 *   into the Supabase table `public.product_usage`.
 *
 *   Before this existed, 31 free calculators + Hast Rekha + Swapna + Voice
 *   logged NOTHING, so nobody could answer "did anyone actually use it?".
 *
 * THE ONE RULE THAT MATTERS
 *   Logging must NEVER break a product. Every call is wrapped in try/catch and
 *   returns void. If Supabase is down, the key is missing, or the row is
 *   rejected, the calculator still answers the customer normally. A failure is
 *   printed to the server log and then swallowed on purpose.
 *
 *   For the same reason logUsage() is called WITHOUT `await` at the call site
 *   (fire-and-forget), so it never adds latency to a customer's request.
 *
 * SAFE TO ADD
 *   This file imports nothing from the existing codebase and is imported by
 *   nothing yet. Deploying it alone changes zero behaviour.
 *
 * USED BY (added one line at a time, see the plan)
 *   app/api/calc/kundali/route.ts, calc/doshas, calc/sade-sati, calc/yog,
 *   calc/manglik-dosh, calc/muhurat, palmistry/analyze,
 *   palmistry/paid-analyze, dream, voice-pack-order
 *
 * ENV (already set in Vercel — same two every other route uses)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Null when env is missing, so logUsage can no-op instead of throwing. */
const usageClient =
  supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

export type UsageTier = 'free' | 'paid';

export type UsageProductType =
  | 'calculator'
  | 'reading'
  | 'service'
  | 'voice'
  | 'milan'
  | 'muhurat'
  | 'karmic';

export interface UsageEvent {
  /** Required. URL-style id, e.g. 'free-sade-sati-calculator', 'hast-rekha'. */
  product_slug: string;
  /** Human name shown in reports, e.g. 'Sade Sati Calculator'. */
  product_name?: string;
  product_type?: UsageProductType;
  /** Defaults to 'free'. */
  tier?: UsageTier;

  /** Money. Smallest unit: paise for INR, cents for USD. Free = 0. */
  amount_paise?: number;
  currency?: string;
  payment_id?: string;
  payment_status?: 'completed' | 'failed' | 'pending';

  /** Where the visitor came from — this is what decides widget placement. */
  source_path?: string;
  referrer?: string;
  session_id?: string;
  device?: string;

  /** Who. Rohiit's call 18 Sep 2026: captured for his own tracking. */
  person_name?: string;
  dob?: string;          // 'YYYY-MM-DD'
  birth_time?: string;
  birth_city?: string;
  gender?: string;
  age?: number;
  phone?: string;
  email?: string;
  language?: string;

  /** Small result summary — score, verdict, dosha found. Keep it small. */
  result_meta?: Record<string, unknown>;

  status?: 'completed' | 'failed';
  error_message?: string;
}

/**
 * Record one product use. Fire-and-forget — do NOT await this.
 *
 *   logUsage({ product_slug: 'free-sade-sati-calculator', ... });
 *
 * Never throws. Never blocks. Never returns an error to the caller.
 */
export function logUsage(event: UsageEvent): Promise<void> {
  try {
    if (!usageClient) {
      console.warn('[usage-log] Supabase env missing — skipping');
      return Promise.resolve();
    }
    if (!event?.product_slug) {
      console.warn('[usage-log] product_slug missing — skipping');
      return Promise.resolve();
    }

    const row = {
      product_slug  : event.product_slug,
      product_name  : event.product_name  ?? null,
      product_type  : event.product_type  ?? null,
      tier          : event.tier          ?? 'free',

      amount_paise  : event.amount_paise  ?? 0,
      currency      : event.currency      ?? 'INR',
      payment_id    : event.payment_id    ?? null,
      payment_status: event.payment_status ?? null,

      source_path   : event.source_path   ?? null,
      referrer      : event.referrer      ?? null,
      session_id    : event.session_id    ?? null,
      device        : event.device        ?? null,

      person_name   : event.person_name   ?? null,
      dob           : event.dob           ?? null,
      birth_time    : event.birth_time    ?? null,
      birth_city    : event.birth_city    ?? null,
      gender        : event.gender        ?? null,
      age           : event.age           ?? null,
      phone         : event.phone         ?? null,
      email         : event.email         ?? null,
      language      : event.language      ?? null,

      result_meta   : event.result_meta   ?? null,
      status        : event.status        ?? 'completed',
      error_message : event.error_message ?? null,
    };

    // ⭐ 21 Sep 2026 — AB PROMISE LAUTTA HAI.
    // 🔴 Pehle yahan "void usageClient.insert(...)" tha — fire-and-forget.
    // Lambe chalne wale server par wo theek hai, par VERCEL SERVERLESS par
    // galat: jawab lautte hi function JAM jaata hai aur beech ka Supabase
    // request mar jaata hai. Natija — 16 calculator wale calc-kundali par
    // 3 din mein sirf 13 rows, aur santan/vivah/doshas/manglik par 0.
    // Saboot: kundali-milan/route.ts apna insert AWAIT karta hai aur
    // hamesha chala hai.
    // Ab jo route ise AWAIT karega uska likhna pakka hoga. Jo route bina
    // await ke bulata hai (baaki 5 calc route), uske liye byavhaar WAISA HI
    // hai jaisa pehle tha — kuch nahi tootta. Rohiit ka niyam (20 Sep):
    // "jab us calculator ki file waise bhi badle, tabhi save jodna."
    // Supabase ka .then() PromiseLike deta hai, asli Promise nahi —
    // Promise.resolve() use asli Promise banata hai (tsc ne pakda, 21 Sep).
    return Promise.resolve(usageClient
      .from('product_usage')
      .insert(row)
      .then(({ error }) => {
        if (error) console.error('[usage-log] insert failed:', error.message);
      }, (e: unknown) => {
        console.error('[usage-log] insert threw (ignored):', e);
      }));
  } catch (err) {
    console.error('[usage-log] unexpected error (ignored):', err);
    return Promise.resolve();
  }
}

/**
 * Turn the birth fields every /api/calc/* route already receives into the
 * columns product_usage stores. Kept here so each route stays a single block
 * and every calculator records the visitor the same way.
 *
 * Every field is optional and anything missing simply stays null.
 * NOTE: the calculators never receive a phone or email, so those two columns
 * are always null for calculator rows — that is expected, not a bug.
 */
export function usageBirthFields(b: {
  year?: number; month?: number; day?: number;
  hour?: number; minute?: number;
  name?: string | null;
  gender?: string | null;
}): Partial<UsageEvent> {
  const pad = (n: number) => String(n).padStart(2, '0');

  const dob =
    typeof b?.year === 'number' && typeof b?.month === 'number' && typeof b?.day === 'number'
      ? `${b.year}-${pad(b.month)}-${pad(b.day)}`
      : undefined;

  const birth_time =
    typeof b?.hour === 'number' && typeof b?.minute === 'number'
      ? `${pad(b.hour)}:${pad(b.minute)}`
      : undefined;

  return {
    dob,
    birth_time,
    person_name: b?.name ?? undefined,
    gender: b?.gender ?? undefined,
  };
}

/**
 * Pull source_path / referrer / device out of an incoming Next.js Request.
 * Every field is optional — a missing header just means a null column.
 */
export function usageContextFromRequest(req: Request): Partial<UsageEvent> {
  try {
    const h = req.headers;
    const referrer = h.get('referer') ?? h.get('referrer') ?? undefined;

    let source_path: string | undefined;
    if (referrer) {
      try {
        source_path = new URL(referrer).pathname;
      } catch {
        /* malformed referrer — leave undefined */
      }
    }

    const ua = h.get('user-agent') ?? '';
    const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop';

    return { source_path, referrer, device };
  } catch {
    return {};
  }
}
