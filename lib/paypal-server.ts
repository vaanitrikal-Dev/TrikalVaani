/**
 * ============================================================
 * TRIKAL VAANI — PayPal Server Helper
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/paypal-server.ts
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * SERVER ONLY. Never import this into a "use client" component —
 * PAYPAL_SECRET must never reach the browser.
 *
 * ENV REQUIRED (set in Vercel, all three environments):
 *   PAYPAL_CLIENT_ID              (server)
 *   PAYPAL_SECRET                 (server, never exposed)
 *   NEXT_PUBLIC_PAYPAL_CLIENT_ID  (browser, same value as PAYPAL_CLIENT_ID)
 *
 * LIVE by default. Set PAYPAL_ENV=sandbox to point at the sandbox API
 * while testing; anything else (or unset) means live.
 * ============================================================
 */

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

// ── Access token (cached in memory until shortly before expiry) ──
let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error(
      '[Trikal] PayPal credentials missing. Set PAYPAL_CLIENT_ID and PAYPAL_SECRET in Vercel.'
    );
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.value;
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[Trikal] PayPal token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };

  cachedToken = {
    value: data.access_token,
    // Refresh 60s early so we never present an expired token.
    expiresAt: now + Math.max(0, data.expires_in - 60) * 1000,
  };

  return cachedToken.value;
}

// ── Types we actually read back ──────────────────────────────

export interface PayPalCapture {
  id: string;
  status: string;
  amountValue: string; // e.g. "7.00"
  currency: string; // e.g. "USD"
  payerEmail: string | null;
  payerName: string | null;
}

// ── Create an order ──────────────────────────────────────────

export async function createPayPalOrder(opts: {
  usdCents: number;
  description: string;
  referenceId: string;
}): Promise<{ id: string }> {
  const token = await getPayPalAccessToken();
  const value = (opts.usdCents / 100).toFixed(2);

  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: opts.referenceId,
          description: opts.description.slice(0, 127),
          amount: { currency_code: 'USD', value },
        },
      ],
      application_context: {
        brand_name: 'Trikaal Vaani',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[Trikal] PayPal create order failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { id: string };
  return { id: data.id };
}

// ── Capture an order ─────────────────────────────────────────

export async function capturePayPalOrder(orderId: string): Promise<PayPalCapture> {
  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  const data: any = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `[Trikal] PayPal capture failed (${res.status}): ${JSON.stringify(data).slice(0, 400)}`
    );
  }

  return extractCapture(data);
}

// ── Read an order back (used to re-verify server-side later) ──

export async function getPayPalOrder(orderId: string): Promise<PayPalCapture> {
  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  );

  const data: any = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `[Trikal] PayPal get order failed (${res.status}): ${JSON.stringify(data).slice(0, 400)}`
    );
  }

  return extractCapture(data);
}

// ── Shared shape extraction ──────────────────────────────────

function extractCapture(data: any): PayPalCapture {
  const unit = data?.purchase_units?.[0];
  const cap = unit?.payments?.captures?.[0];

  // On a freshly captured order the amount sits on the capture.
  // On a re-read of an order it may sit on the purchase unit instead.
  const amountValue: string =
    cap?.amount?.value ?? unit?.amount?.value ?? '0.00';
  const currency: string =
    cap?.amount?.currency_code ?? unit?.amount?.currency_code ?? 'USD';

  const givenName = data?.payer?.name?.given_name ?? '';
  const surname = data?.payer?.name?.surname ?? '';
  const fullName = `${givenName} ${surname}`.trim();

  return {
    // Prefer the capture id; fall back to the order id.
    id: cap?.id ?? data?.id ?? '',
    status: cap?.status ?? data?.status ?? 'UNKNOWN',
    amountValue,
    currency,
    payerEmail: data?.payer?.email_address ?? null,
    payerName: fullName || null,
  };
}

/** True only when the money is genuinely taken and the amount is exactly right. */
export function isCaptureValid(
  capture: PayPalCapture,
  expectedUsdCents: number
): boolean {
  if (capture.status !== 'COMPLETED') return false;
  if (capture.currency !== 'USD') return false;

  const paidCents = Math.round(parseFloat(capture.amountValue) * 100);
  return Number.isFinite(paidCents) && paidCents === expectedUsdCents;
}
