'use client';

// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: app/auth/callback/page.tsx
// VERSION: v1.0
// DATE: 2026-05-24
// PURPOSE:
//   Landing page after Google (Gmail) login. Steps:
//     1. Supabase finishes the login automatically (detects the
//        session from the URL).
//     2. We grab the browser's session_id and the new access token,
//        then call /api/auth/backfill to claim the user's anonymous
//        reports (so the report they made BEFORE logging in becomes
//        theirs).
//     3. Send the user back to the EXACT page they came from (?next).
// ============================================================

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, getOrCreateSessionId } from '@/lib/supabase';

const GOLD = '#D4AF37';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState('Completing your sign-in…');

  useEffect(() => {
    let done = false;

    async function finish(accessToken: string) {
      if (done) return;
      done = true;

      // Claim anonymous reports made before login.
      try {
        const sessionId = getOrCreateSessionId();
        await fetch('/api/auth/backfill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, accessToken }),
        });
      } catch {
        // Non-fatal: login still succeeds even if claiming fails.
      }

      // Return to the page the user started from.
      const nextParam = searchParams.get('next') ?? '/';
      const next = nextParam.startsWith('/') ? nextParam : '/';
      router.replace(next);
    }

    // Session may already be ready, or arrive a moment later.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        finish(session.access_token);
      } else {
        setMsg('Almost there…');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) finish(session.access_token);
      }
    );

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080B12',
        color: GOLD,
        gap: '14px',
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: `3px solid rgba(212,175,55,0.25)`,
          borderTopColor: GOLD,
          borderRadius: '50%',
          animation: 'tvspin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: 14, color: '#cbd5e1' }}>{msg}</p>
      <style>{`@keyframes tvspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
