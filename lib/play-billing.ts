/**
 * ============================================================
 * TRIKAL VAANI — Google Play Billing (BROWSER / APP side)
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/play-billing.ts
 * VERSION: 1.2 (22 Nov 2026) — "You already own this item" fix (Rohiit approved 22 Nov).
 *   purchaseWithPlay() ab payment sheet kholne se PEHLE Google se poochhta hai ki
 *   is product ki koi purani, bina-consume purchase padi hai kya (listPurchases).
 *   Mili to wahi token lauta deta hai — server use verify + consume karta hai.
 *   Pehle: verify ek baar fail hua (jaise 401) to grahak hamesha ke liye atak
 *   jaata tha. Exports aur unka shape BILKUL WAISE HI hain — koi caller nahi badla.
 * Prior: 1.1 (11 Oct 2026) — saare approved product IDs (PLAY_PRODUCTS).
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * KYA KARTA HAI
 *   1. isPlayBillingAvailable() — kya page Play Store app (TWA) ke andar
 *      khula hai? Ye Google ka "Digital Goods API" dekh kar pata chalta hai,
 *      jo SIRF Play se install hui app mein hota hai. Normal Chrome, iPhone,
 *      desktop, ya "Add to Home screen" wali shortcut — sab mein FALSE.
 *   2. purchaseWithPlay() — Google Play ki payment sheet kholta hai aur
 *      "purchase token" lautata hai. Token khud kuch prove nahi karta —
 *      server (app/api/predict v16.2) use Google se verify karta hai.
 *
 * SWITCH
 *   NEXT_PUBLIC_PLAY_BILLING=true na ho to isPlayBillingAvailable() hamesha
 *   false — yani website bilkul pehle jaisi, Razorpay/PayPal wahi.
 *
 * ⚠️ Product ID Play Console ke product se BILKUL milna chahiye aur
 *    lib/play-billing-server.ts ke PLAY_PRODUCT_IDS se bhi.
 * ============================================================
 */

export const PLAY_BILLING_METHOD = 'https://play.google.com/billing';

export const PLAY_PRODUCT_DEEP = 'deep_reading_51'; // ₹51 Deep Reading

// Rohiit ne 11 Oct 2026 ko approve kiye. lib/play-billing-server.ts ke
// PLAY_PRODUCT_IDS se HUBAHU milne chahiye (server wahi verify karta hai).
export const PLAY_PRODUCTS = {
  deep:       'deep_reading_51',
  voice_1q:   'voice_1q_11',
  voice_5q:   'voice_5q_51',
  voice_12q:  'voice_12q_101',
  hast_rekha: 'hast_rekha_51',
  milan:      'milan_51',
  muhurat:    'muhurat_51',
  yog:        'yog_51',
  karmic:     'karmic_101',
  upay:       'upay_51',
} as const;

export function playBillingFlagOn(): boolean {
  return process.env.NEXT_PUBLIC_PLAY_BILLING === 'true';
}

/** True sirf tab jab switch ON ho AUR page Play Store app ke andar ho. Kabhi throw nahi karta. */
export async function isPlayBillingAvailable(): Promise<boolean> {
  if (!playBillingFlagOn()) return false;
  if (typeof window === 'undefined') return false;
  const w = window as any;
  if (typeof w.getDigitalGoodsService !== 'function') return false;
  try {
    const service = await w.getDigitalGoodsService(PLAY_BILLING_METHOD);
    return !!service;
  } catch {
    return false;
  }
}

export type PlayPurchaseResult =
  | { ok: true; purchaseToken: string }
  | { ok: false; cancelled: boolean; error: string };

/**
 * Is product ki koi purani purchase jo abhi consume NAHI hui (Play kehta hai
 * "You already own this item") — uska token. Na mile ya API na ho to null.
 * Kabhi throw nahi karta.
 */
async function findUnconsumedPurchase(productId: string): Promise<string | null> {
  try {
    const w = window as any;
    if (typeof w.getDigitalGoodsService !== 'function') return null;
    const service = await w.getDigitalGoodsService(PLAY_BILLING_METHOD);
    if (!service || typeof service.listPurchases !== 'function') return null;
    const purchases: any[] = (await service.listPurchases()) || [];
    const hit = purchases.find((p) => p && p.itemId === productId && p.purchaseToken);
    return hit ? String(hit.purchaseToken) : null;
  } catch (e: any) {
    console.error('[PlayBilling] listPurchases failed:', e?.name, e?.message);
    return null;
  }
}

/** Google Play payment sheet kholta hai. Kabhi throw nahi karta. */
export async function purchaseWithPlay(productId: string): Promise<PlayPurchaseResult> {
  if (typeof window === 'undefined' || typeof (window as any).PaymentRequest !== 'function') {
    return { ok: false, cancelled: false, error: 'Google Play payment is not available on this device.' };
  }
  // v1.2: pehle se kharida hua par istemaal na hua (pichhla verify fail) —
  // naya payment mat kholo, wahi token server ko do.
  const pending = await findUnconsumedPurchase(productId);
  if (pending) {
    console.log('[PlayBilling] reusing unconsumed purchase for', productId);
    return { ok: true, purchaseToken: pending };
  }
  try {
    const request = new PaymentRequest(
      [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku: productId } }],
      // Google Play asli daam khud dikhata hai; ye "total" sirf API ki shart
      // hai aur Play ise ignore karta hai.
      { total: { label: 'Total', amount: { currency: 'INR', value: '0' } } },
    );
    const response = await request.show();
    const purchaseToken = String((response.details as any)?.purchaseToken ?? '');
    // Sheet band karna zaroori hai. Token ki asli jaanch server karta hai.
    await response.complete(purchaseToken ? 'success' : 'fail');
    if (!purchaseToken) {
      return { ok: false, cancelled: false, error: 'Google Play did not return a purchase. Please try again.' };
    }
    return { ok: true, purchaseToken };
  } catch (e: any) {
    // Customer ne sheet khud band ki — ye galti nahi hai.
    if (e?.name === 'AbortError') return { ok: false, cancelled: true, error: '' };
    console.error('[PlayBilling] purchase failed:', e?.name, e?.message);
    return { ok: false, cancelled: false, error: 'Google Play payment could not be completed. Please try again.' };
  }
}
// END — lib/play-billing.ts v1.2
