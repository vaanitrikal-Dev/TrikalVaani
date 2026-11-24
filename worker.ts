/**
 * ============================================================================
 * FILE   : worker.ts  (repo root)
 * VERSION: v1.1
 * DATE   : 24 Nov 2026
 * OWNER  : Rohiit Gupta, Chief Vedic Architect
 *
 * v1.1 (24 Nov 2026): VM HOST REWRITE. Cloudflare blocks fetch() to a bare IP
 *   (error 1003). 18 files + some secrets call the VM as 34.47.182.227. Instead
 *   of editing them all, every outgoing fetch to that IP is sent to
 *   mcp.trikalvaani.com (A record -> same VM, same port/path/protocol).
 *   Tested 24 Nov 2026: http://mcp.trikalvaani.com:8001/health -> 200 from a Worker.
 *   NOTE for domain switch: the "mcp" DNS record must stay DNS-only (grey cloud).
 *
 * WHAT: Cloudflare Worker entry for trikalvaani.com (OpenNext).
 *   - fetch  : the normal Next.js site, unchanged (.open-next/worker.js).
 *   - scheduled : the 3 crons that vercel.json ran on Vercel. Each cron calls its
 *     own /api/cron/* route through the self-reference binding with
 *     "Authorization: Bearer CRON_SECRET" (secret never leaves Cloudflare).
 *
 * SAFETY SWITCH (Rohiit approved 24 Nov 2026):
 *   Crons do NOTHING unless the secret CRON_ENABLED = "1". It is set only on the
 *   domain-switch day, when Vercel crons stop — so paid-recovery never runs
 *   twice (Vercel + Cloudflare) at the same time.
 *
 * Schedules live in wrangler.jsonc "triggers.crons" (UTC, same as vercel.json).
 * ============================================================================
 */
// @ts-ignore — generated at build time by `opennextjs-cloudflare build`
import { default as handler } from "./.open-next/worker.js";

// ── v1.1 VM host rewrite ─────────────────────────────────────────────────────
const VM_IP = "34.47.182.227";
const VM_HOST = "mcp.trikalvaani.com";
const nativeFetch = globalThis.fetch.bind(globalThis);
function rewriteVm(u: string): string {
  try {
    const url = new URL(u);
    if (url.hostname === VM_IP) { url.hostname = VM_HOST; return url.toString(); }
  } catch { /* relative or invalid URL — leave as is */ }
  return u;
}
globalThis.fetch = ((input: any, init?: any) => {
  if (typeof input === "string") return nativeFetch(rewriteVm(input), init);
  if (input instanceof URL) return nativeFetch(rewriteVm(input.toString()), init);
  if (input instanceof Request) {
    const nu = rewriteVm(input.url);
    return nativeFetch(nu === input.url ? input : new Request(nu, input), init);
  }
  return nativeFetch(input, init);
}) as typeof fetch;

// cron expression (UTC) -> route
const CRON_ROUTES: Record<string, string> = {
  "30 20 * * *": "/api/cron/panchang-generate", // daily 02:00 IST
  "0 1 * * 1": "/api/cron/festival-generate",   // Monday 06:30 IST
  "*/5 * * * *": "/api/cron/paid-recovery",     // every 5 min
};

export default {
  fetch: handler.fetch,

  async scheduled(event: any, env: any, ctx: any) {
    const path = CRON_ROUTES[event.cron];
    if (!path) {
      console.log(`[cron] no route for "${event.cron}"`);
      return;
    }
    if (env.CRON_ENABLED !== "1") {
      console.log(`[cron] skip ${path} — CRON_ENABLED not set (Vercel still live)`);
      return;
    }
    const req = new Request(`https://trikalvaani.com${path}`, {
      method: "GET",
      headers: { authorization: `Bearer ${env.CRON_SECRET}`, "user-agent": "trikalvaani-cf-cron" },
    });
    ctx.waitUntil(
      env.WORKER_SELF_REFERENCE.fetch(req).then(
        (r: Response) => console.log(`[cron] ${path} -> ${r.status}`),
        (e: unknown) => console.log(`[cron] ${path} failed: ${String(e)}`),
      ),
    );
  },
};

// Durable Object classes used by OpenNext must be re-exported from the entry.
// @ts-ignore
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";
