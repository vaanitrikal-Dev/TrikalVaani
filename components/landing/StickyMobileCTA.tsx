'use client';
// ============================================================
// FILE: components/landing/StickyMobileCTA.tsx
// VERSION: v2.0 — DISABLED (June 2026)
// REASON: The fixed bottom bar overlapped the form submit button
//   on mobile (along with the TrikalVoice pill), so clients
//   could not submit. This component now renders NOTHING.
//   It is kept as a no-op on purpose so that any existing
//   `import StickyMobileCTA from ...` lines do NOT break the
//   Vercel build. To bring it back later, restore v1.0 from
//   git history.
// ============================================================

export default function StickyMobileCTA() {
  return null;
}
