/**
 * ============================================================================
 * FILE   : open-next.config.ts  (repo root)
 * VERSION: v1.1
 * DATE   : 24 Nov 2026
 * OWNER  : Rohiit Gupta, Chief Vedic Architect
 *
 * WHAT: OpenNext (Cloudflare adapter) settings.
 *   incrementalCache : page cache (ISR) in R2 bucket "trikalvaani-opennext-cache"
 *   queue            : v1.1 — memory queue, so time-based ISR pages (panchang,
 *                      blog, events...) actually refresh after their revalidate
 *                      time. Without it they were never regenerated.
 *   tagCache         : v1.1 — D1 "trikalvaani-tag-cache", so /api/revalidate
 *                      (revalidatePath / revalidateTag from the Supabase webhook)
 *                      really clears pages. Without it those calls did nothing.
 *   Bindings live in wrangler.jsonc (v1.2).
 * ============================================================================
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default defineCloudflareConfig({
	incrementalCache: r2IncrementalCache,
	queue: memoryQueue,
	tagCache: d1NextTagCache,
});
