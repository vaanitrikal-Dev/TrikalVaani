/**
 * ============================================================
 * TRIKAL VAANI — Google Play Billing (SERVER side)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/play-billing-server.ts
 * VERSION: 1.1 (11 Oct 2026) — saare approved product IDs + "ek order = ek
 *   fulfilment" helper (verifyAndClaimPlay / finishPlay / releasePlay) jo
 *   Supabase table public.play_purchases par chalta hai. v1.0 ke saare
 *   exports (predict v16.2 jo use karta hai) BILKUL WAISE HI hain.
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * KYA KARTA HAI
 *   Play Store app (TWA) ke andar customer Google Play se pay karta hai.
 *   Browser ko ek "purchase token" milta hai. Token khud kuch prove NAHI
 *   karta — isliye server yahan se SEEDHA Google se poochta hai:
 *     1. getPlayPurchase()     — kya ye token asli, PAID aur abhi tak
 *                                istemaal na hua (not consumed) hai?
 *     2. consumePlayPurchase() — report ban jaane ke BAAD token ko
 *                                "consume" karta hai, taaki (a) wahi token
 *                                dobara free report na de sake, aur
 *                                (b) customer agli baar dobara khareed sake.
 *
 * KILL-SWITCH
 *   PLAY_BILLING_ENABLED=true na ho to playBillingEnabled() false deta hai
 *   aur har Play payment mana ho jaata hai. Razorpay / PayPal par is file
 *   ka koi asar nahi — wo ise import hi nahi karte.
 *
 * ENV (Vercel par, sirf server — koi NEXT_PUBLIC_ nahi):
 *   PLAY_BILLING_ENABLED              = true            (switch)
 *   PLAY_PACKAGE_NAME                 = Play app ka package, jaise com.trikalvaani.app
 *   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON  = service account ki POORI JSON key
 *                                       (Play Console mein us account ko
 *                                       "View financial data" + "Manage
 *                                       orders" permission chahiye)
 *
 * KOI NAYI npm PACKAGE NAHI — Google ka access token Node ke apne crypto se
 * banta hai (RS256 JWT -> oauth2.googleapis.com/token).
 * ============================================================
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ── Play Console product IDs ─────────────────────────────────────────────
// ⚠️ Play Console mein product BILKUL ISI ID se banana hai. Ek baar banne ke
// baad Google ID badalne nahi deta. Daam Play Console mein set hote hain —
// website jaisa hi (Rohiit ka faisla, 11 Oct 2026: same daam, Google ka
// 15% Trikaal Vaani uthayega).
// IDs Rohiit ne 11 Oct 2026 ko approve kiye ("IDs approved").
export const PLAY_PRODUCT_IDS = {
  deep:       'deep_reading_51', // ₹51  Deep Reading (Swapna reading bhi)
  voice_1q:   'voice_1q_11',     // ₹11  Trikaal Voice — 1 sawaal
  voice_5q:   'voice_5q_51',     // ₹51  Trikaal Voice — Sapt Darshan, 5 sawaal
  voice_12q:  'voice_12q_101',   // ₹101 Trikaal Voice — Trikaal Bhakt, 12 sawaal
  hast_rekha: 'hast_rekha_51',   // ₹51  AI Hast Rekha Report
  milan:      'milan_51',        // ₹51  Kundali Milan
  muhurat:    'muhurat_51',      // ₹51  Muhurat Report (Child Birth bhi)
  yog:        'yog_51',          // ₹51  Yog Report (IAS / Videsh / Vivah / Santan …)
  karmic:     'karmic_101',      // ₹101 Karmic Background Reading
  upay:       'upay_51',         // ₹51  Upay Report
} as const;

export type PlayProductKey = keyof typeof PLAY_PRODUCT_IDS;

// India mein grahak kitna deta hai (paise) — sirf payment_amount record karne
// ke liye. Asli daam Play Console tay karta hai; ye website ke daam ka aaina hai
// (lib/pricing-intl.ts). Bahar ke desh mein Google local daam leta hai, isliye
// wahan amount null + currency 'PLAY' likha jaata hai.
const INDIA_PRICE_PAISE: Record<PlayProductKey, number> = {
  deep: 5100, voice_1q: 1100, voice_5q: 5100, voice_12q: 10100,
  hast_rekha: 5100, milan: 5100, muhurat: 5100, yog: 5100,
  karmic: 10100, upay: 5100,
};

/** productId -> key (ulta naksha). Anjaan ID par null. */
export function playKeyForProductId(productId: string): PlayProductKey | null {
  const hit = (Object.keys(PLAY_PRODUCT_IDS) as PlayProductKey[])
    .find(k => PLAY_PRODUCT_IDS[k] === productId);
  return hit ?? null;
}

const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';

export function playBillingEnabled(): boolean {
  return process.env.PLAY_BILLING_ENABLED === 'true';
}

function packageName(): string {
  const p = (process.env.PLAY_PACKAGE_NAME ?? '').trim();
  if (!p) throw new Error('PLAY_PACKAGE_NAME missing in env');
  return p;
}

// ── Service-account access token (cached until ~1 min before expiry) ──────
let cached: { token: string; exp: number } | null = null;

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.token;

  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON ?? '';
  if (!raw.trim()) throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON missing in env');
  const sa = JSON.parse(raw) as { client_email?: string; private_key?: string };
  if (!sa.client_email || !sa.private_key) {
    throw new Error('Service account JSON lacks client_email / private_key');
  }
  // Vercel par paste karte waqt \n kabhi kabhi literal "\\n" ban jaata hai.
  const privateKey = sa.private_key.replace(/\\n/g, '\n');

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = b64url(signer.sign(privateKey));
  const assertion = `${header}.${claims}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Google token ${res.status}: ${t.slice(0, 200)}`);
  }
  const j = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!j.access_token) throw new Error('Google token response without access_token');
  cached = { token: j.access_token, exp: now + Number(j.expires_in ?? 3600) };
  return cached.token;
}

// ── Purchase lookup ───────────────────────────────────────────────────────
export interface PlayPurchase {
  orderId: string | null;
  purchaseState: number | null;      // 0 = Purchased, 1 = Canceled, 2 = Pending
  consumptionState: number | null;   // 0 = Yet to be consumed, 1 = Consumed
  acknowledgementState: number | null;
  regionCode: string | null;         // jaise 'IN'
  purchaseTimeMillis: string | null;
}

/** Google se seedha poochta hai. Network/permission galti par THROW karta hai. */
export async function getPlayPurchase(productId: string, purchaseToken: string): Promise<PlayPurchase> {
  const token = await getAccessToken();
  const url =
    `${API_BASE}/${encodeURIComponent(packageName())}/purchases/products/` +
    `${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Play purchases.products.get ${res.status}: ${t.slice(0, 200)}`);
  }
  const j = (await res.json()) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' ? v : v == null ? null : Number(v));
  return {
    orderId: typeof j.orderId === 'string' ? j.orderId : null,
    purchaseState: num(j.purchaseState),
    consumptionState: num(j.consumptionState),
    acknowledgementState: num(j.acknowledgementState),
    regionCode: typeof j.regionCode === 'string' ? j.regionCode : null,
    purchaseTimeMillis: typeof j.purchaseTimeMillis === 'string' ? j.purchaseTimeMillis : null,
  };
}

/** Asli, paid, abhi tak istemaal na hua purchase? */
export function isPlayPurchaseUsable(p: PlayPurchase): boolean {
  return p.purchaseState === 0 && p.consumptionState === 0 && !!p.orderId;
}

/**
 * Report ban jaane ke BAAD bulao. KABHI THROW NAHI KARTA — consume fail hone
 * se customer ki report nahi rukni chahiye. Fail hua to false + error log.
 */
export async function consumePlayPurchase(productId: string, purchaseToken: string): Promise<boolean> {
  try {
    const token = await getAccessToken();
    const url =
      `${API_BASE}/${encodeURIComponent(packageName())}/purchases/products/` +
      `${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:consume`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error(`[PlayBilling] consume FAILED ${res.status}: ${t.slice(0, 200)} | product:${productId}`);
      return false;
    }
    return true;
  } catch (e: any) {
    console.error(`[PlayBilling] consume threw: ${e?.message} | product:${productId}`);
    return false;
  }
}
// ══════════════════════════════════════════════════════════════════════════
// v1.1 — "EK PLAY ORDER = EK FULFILMENT" (har product ke liye ek hi raasta)
// ══════════════════════════════════════════════════════════════════════════
// Table: public.play_purchases (order_id PRIMARY KEY). Har product route:
//   1. const gate = await verifyAndClaimPlay('milan', token, 'milan_orders')
//      if (!gate.ok) return NextResponse.json({error:gate.error, code:gate.code,
//                                    existingRef:gate.existingRef}, {status:gate.status})
//   2. ...apna kaam (order paid mark, report banana)...
//   3a. Kaam safal:  await finishPlay(gate, '<row id / slug>')   -> consume bhi
//   3b. Kaam fail:   await releasePlay(gate)  -> customer wahi payment se dobara
//                    koshish kar sake (token consume NAHI hota; Google 3 din mein
//                    consume na hua to khud refund karta hai)
// Ek hi order se do baar kaam kabhi nahi hota: order_id PRIMARY KEY hai, aur
// 'fulfilled' order dobara aaye to 409 PLAY_ALREADY_USED + purana ref.


const CLAIM_STALE_MS = 15 * 60 * 1000; // 15 min se purana 'claimed' = atka hua, dobara le sakte hain

function playAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export type PlayGateOk = {
  ok: true;
  orderId: string;
  productKey: PlayProductKey;
  productId: string;
  purchaseToken: string;
  regionCode: string | null;
  amountPaise: number | null;   // India mein website ka daam, warna null
  currency: 'INR' | 'PLAY';
};
export type PlayGateFail = {
  ok: false;
  status: number;
  code: 'PLAY_DISABLED' | 'PLAY_BAD_REQUEST' | 'PLAY_NOT_VALID' | 'PLAY_ALREADY_USED' | 'PLAY_IN_PROGRESS' | 'PLAY_DB_ERROR';
  error: string;
  existingRef?: string | null;
};
export type PlayGateResult = PlayGateOk | PlayGateFail;

/**
 * Google se verify + play_purchases mein "claim". Kabhi throw nahi karta.
 * refTable: kis table ka kaam hai (sirf record ke liye, jaise 'milan_orders').
 */
export async function verifyAndClaimPlay(
  productKey: PlayProductKey,
  purchaseToken: unknown,
  refTable: string,
): Promise<PlayGateResult> {
  if (!playBillingEnabled()) {
    return { ok: false, status: 503, code: 'PLAY_DISABLED', error: 'App payments are not active yet. Please try again later.' };
  }
  const token = typeof purchaseToken === 'string' ? purchaseToken : '';
  if (!token || token.length > 4096) {
    return { ok: false, status: 402, code: 'PLAY_BAD_REQUEST', error: 'Payment verification required.' };
  }
  const productId = PLAY_PRODUCT_IDS[productKey];
  if (!productId) {
    return { ok: false, status: 400, code: 'PLAY_BAD_REQUEST', error: 'Unknown product.' };
  }

  let p: PlayPurchase;
  try {
    p = await getPlayPurchase(productId, token);
  } catch (e: any) {
    console.error(`[PlayBilling] verify threw | ${productKey}: ${e?.message}`);
    return { ok: false, status: 400, code: 'PLAY_NOT_VALID', error: 'Payment could not be verified. Please contact support.' };
  }
  if (!isPlayPurchaseUsable(p) || !p.orderId) {
    console.error(`[PlayBilling] not usable | ${productKey} | state:${p.purchaseState} consumed:${p.consumptionState} order:${p.orderId}`);
    return { ok: false, status: 400, code: 'PLAY_NOT_VALID', error: 'Payment could not be verified.' };
  }

  const isIN = p.regionCode === 'IN';
  const gate: PlayGateOk = {
    ok: true,
    orderId: p.orderId,
    productKey,
    productId,
    purchaseToken: token,
    regionCode: p.regionCode,
    amountPaise: isIN ? INDIA_PRICE_PAISE[productKey] : null,
    currency: isIN ? 'INR' : 'PLAY',
  };

  const db = playAdmin();
  const { error: insErr } = await db.from('play_purchases').insert({
    order_id: gate.orderId,
    product_key: productKey,
    product_id: productId,
    purchase_token: token,
    status: 'claimed',
    region_code: gate.regionCode,
    amount_paise: gate.amountPaise,
    currency: gate.currency,
    ref_table: refTable,
  });
  if (!insErr) return gate;

  // 23505 = order pehle se table mein hai
  if ((insErr as any).code !== '23505') {
    console.error(`[PlayBilling] claim insert failed | ${gate.orderId}: ${insErr.message}`);
    return { ok: false, status: 503, code: 'PLAY_DB_ERROR', error: 'Payment is verified but could not be recorded right now. Please retry in a minute — you will not be charged again.' };
  }
  const { data: row, error: selErr } = await db
    .from('play_purchases')
    .select('status, ref_id, claimed_at, product_key')
    .eq('order_id', gate.orderId)
    .maybeSingle();
  if (selErr || !row) {
    console.error(`[PlayBilling] claim re-read failed | ${gate.orderId}: ${selErr?.message}`);
    return { ok: false, status: 503, code: 'PLAY_DB_ERROR', error: 'Payment is verified but could not be recorded right now. Please retry in a minute — you will not be charged again.' };
  }
  if (row.product_key !== productKey) {
    // Ek product ka token doosre product par chalane ki koshish
    console.error(`[PlayBilling] product mismatch on reuse | ${gate.orderId}: row=${row.product_key} asked=${productKey}`);
    return { ok: false, status: 400, code: 'PLAY_NOT_VALID', error: 'Payment could not be verified.' };
  }
  if (row.status === 'fulfilled') {
    return { ok: false, status: 409, code: 'PLAY_ALREADY_USED', error: 'This payment has already been used.', existingRef: row.ref_id ?? null };
  }
  const claimedAt = row.claimed_at ? new Date(row.claimed_at).getTime() : 0;
  if (row.status === 'claimed' && Date.now() - claimedAt < CLAIM_STALE_MS) {
    return { ok: false, status: 409, code: 'PLAY_IN_PROGRESS', error: 'Your report is already being prepared. Please wait a minute and refresh.' };
  }
  // 'failed' ya atka hua 'claimed' — dobara le lo (sirf tab jab abhi bhi wahi haalat ho)
  const { data: reclaimed, error: updErr } = await db
    .from('play_purchases')
    .update({ status: 'claimed', claimed_at: new Date().toISOString() })
    .eq('order_id', gate.orderId)
    .eq('status', row.status)
    .eq('claimed_at', row.claimed_at)
    .select('order_id');
  if (updErr || !reclaimed || reclaimed.length !== 1) {
    return { ok: false, status: 409, code: 'PLAY_IN_PROGRESS', error: 'Your report is already being prepared. Please wait a minute and refresh.' };
  }
  return gate;
}

/** Kaam safal hone ke BAAD: record 'fulfilled' + token consume. Kabhi throw nahi karta. */
export async function finishPlay(gate: PlayGateOk, refId: string | null): Promise<void> {
  try {
    const db = playAdmin();
    const { error } = await db.from('play_purchases')
      .update({ status: 'fulfilled', ref_id: refId, fulfilled_at: new Date().toISOString() })
      .eq('order_id', gate.orderId);
    if (error) console.error(`[PlayBilling] mark fulfilled failed | ${gate.orderId}: ${error.message}`);
    const consumed = await consumePlayPurchase(gate.productId, gate.purchaseToken);
    if (consumed) {
      await db.from('play_purchases')
        .update({ consumed: true, consumed_at: new Date().toISOString() })
        .eq('order_id', gate.orderId);
    }
    console.log(`[PlayBilling] finished | ${gate.productKey} | order:${gate.orderId} | ref:${refId} | consumed:${consumed}`);
  } catch (e: any) {
    console.error(`[PlayBilling] finishPlay threw | ${gate.orderId}: ${e?.message}`);
  }
}

/** Kaam fail hua: claim chhod do taaki wahi payment dobara chal sake. Kabhi throw nahi karta. */
export async function releasePlay(gate: PlayGateOk): Promise<void> {
  try {
    const { error } = await playAdmin().from('play_purchases')
      .update({ status: 'failed' })
      .eq('order_id', gate.orderId)
      .eq('status', 'claimed');
    if (error) console.error(`[PlayBilling] release failed | ${gate.orderId}: ${error.message}`);
  } catch (e: any) {
    console.error(`[PlayBilling] releasePlay threw | ${gate.orderId}: ${e?.message}`);
  }
}
// END — lib/play-billing-server.ts v1.1

