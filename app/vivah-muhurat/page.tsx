// ============================================================
//  Trikaal Vaani — Vivah Muhurat (index)
//  File: app/vivah-muhurat/page.tsx
//  Redirects to the current year's page. v2.0 — dynamic year.
// ============================================================
import { redirect } from 'next/navigation';

const VIVAH_START = 2026;

// always compute the live current year (no stale build-time year)
export const dynamic = 'force-dynamic';

export default function VivahMuhuratIndex() {
  const y = Math.max(VIVAH_START, new Date().getFullYear());
  redirect(`/vivah-muhurat/${y}`);
}
