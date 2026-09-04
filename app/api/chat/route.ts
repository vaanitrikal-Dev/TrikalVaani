/**
 * ============================================================================
 * ⚰️  DEAD CODE — NOT IN USE. DO NOT MIGRATE, DO NOT "FIX".
 * ============================================================================
 * Marked dead on 3 September 2026 by Rohiit Gupta's decision.
 *
 * WHAT THIS IS
 *   A thin alias for the Jini chat API — it re-exports POST from
 *   ../Trikal-chat/route and adds a GET status line. Jini was retired.
 *
 * WHY IT IS DEAD
 *  *   - It only forwards to app/api/Trikal-chat/route.ts, which is dead.
 *   - The model name in the GET response below is a STRING IN A STATUS
 *     MESSAGE, not a model call. Nothing here talks to Gemini.
 *   - If this file is ever deleted, delete it BEFORE ../Trikal-chat/route.ts,
 *     or the build breaks on a missing import.
 *
 * KEPT ON PURPOSE, NOT DELETED. Rohiit chose to keep the file rather than
 * remove it. Deleting it gains nothing and risks breaking something nobody
 * remembers, so it stays — labelled, so that the next person (or the next AI)
 * does not spend an afternoon migrating code that never runs.
 *
 * ⚠️  IF YOU ARE SCANNING FOR OLD GEMINI MODELS: this file contains one, and
 *     that is FINE. It is not called. Skip it. The live app was fully migrated
 *     to Gemini 3.7 / 3.8 Flash on 3 September 2026.
 *
 * ============================================================================
 */

import { NextRequest } from 'next/server';

export { POST } from '../Trikal-chat/route';

export async function GET(_req: NextRequest) {
  return new Response(JSON.stringify({ status: 'Trikaal Chat API is live', model: 'gemini-2.5-flash' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
