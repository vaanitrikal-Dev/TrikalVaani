// ============================================================
// File: lib/callVM.ts
// Version: v1.1 — Cache conflict fix (Claude audit June 2026)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
// CHANGES vs v1.0 (CEO-approved):
//   ✅ FIX: cache: 'no-store' removed as hardcoded default.
//      v1.0 always sent cache: 'no-store' which conflicted with
//      callers that pass next: { revalidate: N } — Next.js build
//      warning: "specified cache: no-store and revalidate: 86400,
//      only one should be specified."
//      FIX: cache behaviour now controlled entirely by the caller
//      via init options. Dynamic endpoints (no revalidate) get
//      no-store from their own call. ISR pages get revalidate: N.
//      If caller passes nothing, fetch uses Next.js default (force-cache).
//   PROTECTED (untouched): VM_BASE, TRIKAL_VM_KEY, X-Trikal-Key
//      header injection, Content-Type, URL resolution logic.
// ============================================================

// VM base URL. Override via Vercel env VM_ENGINE_URL if it ever moves.
const VM_BASE = process.env.VM_ENGINE_URL || 'http://34.47.182.227:8001';

// Secret key that matches the lock on the VM. Set in Vercel env.
const TRIKAL_VM_KEY = process.env.TRIKAL_VM_KEY || '';

/**
 * Call any VM endpoint with the auth key attached automatically.
 *
 * @param pathOrUrl  Endpoint path ('/kundali') OR a full URL
 *                   (works with your existing VM_*_ENDPOINT env vars).
 * @param init       Standard fetch options (method, body, headers,
 *                   cache, next...). Caller controls caching behaviour:
 *                   - Dynamic/real-time: pass { cache: 'no-store' }
 *                   - ISR pages: pass { next: { revalidate: N } }
 *                   - Default (no option): Next.js force-cache applies
 * @returns          The raw fetch Response (caller handles .ok / .json()).
 *
 * Usage examples:
 *   // Dynamic — always fresh (predictions, readings):
 *   const res = await callVM('/kundali', {
 *     method: 'POST',
 *     body: JSON.stringify(payload),
 *     cache: 'no-store',
 *   });
 *
 *   // ISR — revalidate daily (city panchang pages):
 *   const res = await callVM('/panchang/today?lat=28.6&lon=77.2', {
 *     method: 'GET',
 *     next: { revalidate: 86400 },
 *   });
 */
export async function callVM(
  pathOrUrl: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${VM_BASE}${pathOrUrl}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Trikal-Key': TRIKAL_VM_KEY,
    ...((init.headers as Record<string, string>) || {}),
  };

  // v1.1: cache behaviour controlled by caller — no default override
  return fetch(url, {
    ...init,
    headers,
  });
}

// Exported in case a file needs the raw base URL string.
export const VM_BASE_URL = VM_BASE;
