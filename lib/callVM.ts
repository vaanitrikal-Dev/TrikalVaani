// ============================================================
// File: lib/callVM.ts
// Purpose: Single secure gateway for ALL Trikal VM calls.
//          Auto-injects the X-Trikal-Key auth header so the key
//          lives in ONE place (here) for the entire app.
// Version: v1.0
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// ============================================================

// VM base URL. Override via Vercel env VM_ENGINE_URL if it ever moves.
const VM_BASE = process.env.VM_ENGINE_URL || 'http://34.14.164.105:8001';

// Secret key that matches the lock on the VM. Set in Vercel env.
const TRIKAL_VM_KEY = process.env.TRIKAL_VM_KEY || '';

/**
 * Call any VM endpoint with the auth key attached automatically.
 *
 * @param pathOrUrl  Endpoint path ('/kundali') OR a full URL
 *                   (works with your existing VM_*_ENDPOINT env vars).
 * @param init       Standard fetch options (method, body, headers...).
 * @returns          The raw fetch Response (caller handles .ok / .json()).
 *
 * Usage:
 *   import { callVM } from '@/lib/callVM';
 *   const res = await callVM('/kundali', {
 *     method: 'POST',
 *     body: JSON.stringify(payload),
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

  return fetch(url, {
    cache: 'no-store',
    ...init,
    headers,
  });
}

// Exported in case a file needs the raw base URL string.
export const VM_BASE_URL = VM_BASE;
