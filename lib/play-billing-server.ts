/**
 * ============================================================
 * TRIKAL VAANI — Google Play Billing (SERVER side)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/play-billing-server.ts   (NEW FILE)
 * VERSION: 1.0 (11 Oct 2026)
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

// ── Play Console product IDs ─────────────────────────────────────────────
// ⚠️ Play Console mein product BILKUL ISI ID se banana hai. Ek baar banne ke
// baad Google ID badalne nahi deta. Daam Play Console mein set hote hain —
// website jaisa hi (Rohiit ka faisla, 11 Oct 2026: same daam, Google ka
// 15% Trikaal Vaani uthayega).
export const PLAY_PRODUCT_IDS = {
  deep: 'deep_reading_51', // ₹51 Deep Reading
} as const;

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
// END — lib/play-billing-server.ts v1.0
