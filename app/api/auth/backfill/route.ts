// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: app/api/auth/backfill/route.ts
// VERSION: v1.0
// DATE: 2026-05-24
// PURPOSE:
//   After a user logs in (Gmail/Google), this secure endpoint
//   claims their anonymous reports. It takes the browser's
//   session_id + the logged-in user's access token, verifies the
//   token server-side, then stamps user_id onto every prediction
//   that has that session_id and is still unclaimed (user_id IS NULL).
//
//   This is done server-side with the service role so it is SAFE:
//   a user can only claim reports tied to a session_id they hold,
//   and only rows that are not already owned by someone else.
//
// ENV REQUIRED (Vercel):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   <-- if your env name differs, change below
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { sessionId, accessToken } = await request.json();

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { ok: false, error: 'Missing sessionId or accessToken' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Service-role client — full access, used ONLY server-side.
    const admin = createClient(url, serviceKey);

    // 1) Verify the access token actually belongs to a real user.
    const { data: userData, error: userErr } = await admin.auth.getUser(accessToken);
    if (userErr || !userData?.user) {
      return NextResponse.json(
        { ok: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // 2) Claim only this session's UNCLAIMED reports.
    //    (user_id IS NULL guard => never steal another user's rows.)
    const { data: claimed, error: updErr } = await admin
      .from('predictions')
      .update({ user_id: userId })
      .eq('session_id', sessionId)
      .is('user_id', null)
      .select('id');

    if (updErr) {
      console.error('[TV-Backfill] update error:', updErr);
      return NextResponse.json(
        { ok: false, error: 'Backfill failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, claimed: claimed?.length ?? 0 });
  } catch (err) {
    console.error('[TV-Backfill] exception:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
