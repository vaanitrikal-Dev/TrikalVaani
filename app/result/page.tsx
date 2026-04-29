/**
 * ============================================================
 * TRIKAL VAANI — Result Index Page
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/result/page.tsx
 * VERSION: 7.0 — Redirects to home (all results now at /result/[id])
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

import { redirect } from 'next/navigation';

export default function ResultIndexPage() {
  redirect('/');
}
