/**
 * ============================================================
 * TRIKAAL VAANI — Next.js 13.5.11 chunk-path patch (postinstall)
 * File:    scripts/patch-next-flight-encoding.js
 * VERSION: v1.0 (11 Nov 2026)
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 *
 * WHY (Rohiit approved "option 2", 11 Nov 2026):
 *   Since the 5 Nov 2026 upgrade to Next 13.5.11 (commit f7c5c40), opening
 *   /report/<slug> or /events/<slug> from INSIDE the site crashed with
 *   "Application error" (ChunkLoadError). The page's JS file was requested
 *   as .../%255Bslug%255D/... (encoded twice) → 404.
 *   Cause: 13.5.11 encodes chunk paths at BUILD time in
 *   flight-manifest-plugin.js, and on this site the browser wrapper in
 *   client/app-webpack.js encodes them AGAIN (it wraps React's loader).
 *   13.5.1 had no build-time encode. This script removes that one
 *   build-time encodeURI so the path is encoded exactly once.
 *
 * SAFE: idempotent (already patched → does nothing), touches one line in
 *   node_modules only, never throws (a failure only prints a warning so a
 *   deploy is never blocked). Remove this script when Next is upgraded.
 * ============================================================
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build',
  'webpack', 'plugins', 'flight-manifest-plugin.js');
const OLD = 'chunks.push(chunkId, encodeURI(file + deploymentIdChunkQuery))';
const NEW = 'chunks.push(chunkId, file + deploymentIdChunkQuery /* TV patch v1.0: no double encode */)';

try {
  if (!fs.existsSync(FILE)) {
    console.warn('[tv-patch] flight-manifest-plugin.js not found — skipped');
    process.exit(0);
  }
  const src = fs.readFileSync(FILE, 'utf8');
  if (src.includes(NEW)) {
    console.log('[tv-patch] Next chunk-path patch already applied');
    process.exit(0);
  }
  const n = src.split(OLD).length - 1;
  if (n !== 1) {
    console.warn(`[tv-patch] WARNING: expected 1 match, found ${n} — NOT patched (Next version changed?)`);
    process.exit(0);
  }
  fs.writeFileSync(FILE, src.replace(OLD, NEW));
  console.log('[tv-patch] Next chunk-path patch APPLIED (13.5.11 double-encode fix)');
} catch (e) {
  console.warn('[tv-patch] WARNING: patch failed —', e && e.message);
}
