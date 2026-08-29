/**
 * ============================================================
 * TRIKAL VAANI — PayPal Checkout Button
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/payment/PayPalCheckout.tsx
 * VERSION: 1.0
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * Drop-in replacement for the Razorpay button when the visitor is
 * outside India. Loads PayPal's SDK only when this component mounts,
 * so Indian visitors never download it.
 *
 * USAGE:
 *   <PayPalCheckout
 *     productKey="deep"
 *     country={country}
 *     onPaid={(proof) => { ...continue your existing paid flow... }}
 *     onError={(msg) => setApiError(msg)}
 *     disabled={!formIsValid}
 *   />
 *
 * onPaid receives:
 *   { paypal_order_id, paypal_capture_id, productKey, usdCents }
 * Hand that to your paid endpoint exactly as you currently hand over the
 * razorpay_* fields.
 * ============================================================
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  PRODUCTS,
  approxLocal,
  formatUsd,
} from '@/lib/pricing-intl';

declare global {
  interface Window {
    paypal?: any;
  }
}

export interface PayPalProof {
  paypal_order_id: string;
  paypal_capture_id: string;
  productKey: string;
  usdCents: number;
}

interface Props {
  productKey: string;
  country?: string | null;
  onPaid: (proof: PayPalProof) => void | Promise<void>;
  onError?: (message: string) => void;
  /** Blocks payment while the form above is incomplete. */
  disabled?: boolean;
  /** Called just before the PayPal window opens — validate your form here. */
  onBeforeCreate?: () => boolean | Promise<boolean>;
}

let sdkPromise: Promise<boolean> | null = null;

function loadPayPalSdk(clientId: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.paypal) return Promise.resolve(true);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<boolean>((resolve) => {
    const src =
      `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}` +
      `&currency=USD&intent=capture&components=buttons&disable-funding=paylater`;

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      sdkPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}

export default function PayPalCheckout({
  productKey,
  country,
  onPaid,
  onError,
  disabled = false,
  onBeforeCreate,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [working, setWorking] = useState(false);

  // Keep the latest props reachable from inside PayPal's callbacks,
  // which are registered once and would otherwise capture stale values.
  const liveProps = useRef({ disabled, onBeforeCreate, onPaid, onError, productKey });
  liveProps.current = { disabled, onBeforeCreate, onPaid, onError, productKey };

  const product = PRODUCTS[productKey];
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !product) return;
    let cancelled = false;

    loadPayPalSdk(clientId).then((ok) => {
      if (cancelled) return;
      if (!ok) {
        onError?.('Could not load PayPal. Please refresh and try again.');
        return;
      }
      if (!containerRef.current || renderedRef.current || !window.paypal) return;

      renderedRef.current = true;
      setReady(true);

      window.paypal
        .Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay', height: 45 },

          onClick: async (_data: any, actions: any) => {
            const p = liveProps.current;
            if (p.disabled) {
              p.onError?.('Please complete the form above first.');
              return actions.reject();
            }
            if (p.onBeforeCreate) {
              const ok = await p.onBeforeCreate();
              if (!ok) return actions.reject();
            }
            return actions.resolve();
          },

          createOrder: async () => {
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productKey: liveProps.current.productKey }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.orderId) {
              throw new Error(data.error || 'Could not start the payment.');
            }
            return data.orderId;
          },

          onApprove: async (data: { orderID: string }) => {
            setWorking(true);
            try {
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                  productKey: liveProps.current.productKey,
                }),
              });
              const result = await res.json().catch(() => ({}));

              if (!res.ok || !result.success) {
                liveProps.current.onError?.(
                  result.error || 'Payment could not be confirmed. Please contact support.'
                );
                return;
              }

              await liveProps.current.onPaid({
                paypal_order_id: result.paypal_order_id,
                paypal_capture_id: result.paypal_capture_id,
                productKey: result.productKey,
                usdCents: result.usdCents,
              });
            } catch {
              liveProps.current.onError?.(
                'Payment went through but confirmation failed. Please contact support before paying again.'
              );
            } finally {
              setWorking(false);
            }
          },

          onError: () => {
            setWorking(false);
            liveProps.current.onError?.('PayPal reported an error. Please try again.');
          },

          onCancel: () => setWorking(false),
        })
        .render(containerRef.current);
    });

    return () => {
      cancelled = true;
    };
    // Render once. Changing props is handled through liveProps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, productKey]);

  if (!clientId) {
    console.error('[Trikal] NEXT_PUBLIC_PAYPAL_CLIENT_ID is not set.');
    return null;
  }
  if (!product) {
    console.error(`[Trikal] Unknown product key: ${productKey}`);
    return null;
  }

  const local = approxLocal(product.usdCents, country);

  return (
    <div className="w-full">
      <div className="mb-3 text-center">
        <div className="text-2xl font-semibold text-[#D4AF37]">
          {formatUsd(product.usdCents)}
          {local && (
            <span className="ml-2 text-sm font-normal text-neutral-400">{local}</span>
          )}
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          Charged in USD. Your bank converts at its own rate.
        </p>
      </div>

      <div
        ref={containerRef}
        className={disabled ? 'pointer-events-none opacity-50' : ''}
        aria-busy={working}
      />

      {!ready && (
        <p className="mt-2 text-center text-xs text-neutral-500">Loading PayPal…</p>
      )}
      {working && (
        <p className="mt-2 text-center text-xs text-neutral-400">
          Confirming your payment — do not close this window.
        </p>
      )}
    </div>
  );
}
