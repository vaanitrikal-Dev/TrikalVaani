// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: app/api/auth/mobile-sync/route.ts
// VERSION: v1.0
// DATE: 2026-05-24
// PURPOSE:
//   After Firebase verifies the phone OTP, this secure endpoint
//   creates or finds the matching profile in Supabase profiles table.
//   Uses service role — server-side only, never exposed to browser.
//   Mobile users land in the SAME profiles table as Gmail users.
// ENV REQUIRED:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mobile, uid } = await request.json();

    if (!mobile || !uid) {
      return NextResponse.json(
        { ok: false, error: 'Missing mobile or uid' },
        { status: 400 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if a profile already exists for this mobile number
    const { data: existing } = await admin
      .from('profiles')
      .select('id, name, tier')
      .eq('mobile', mobile)
      .maybeSingle();

    if (existing) {
      // Returning mobile user — profile already exists
      return NextResponse.json({
        ok: true,
        profileId: existing.id,
        name: existing.name ?? 'Seeker',
        tier: existing.tier ?? 'free',
      });
    }

    // New mobile user — create a profile row
    // Use firebase uid as a stable reference (stored in notes field)
    const { data: created, error } = await admin
      .from('profiles')
      .insert({
        // id must be a UUID — generate one for mobile users
        // since they don't have a Supabase auth.users row
        mobile,
        name: 'Seeker',
        tier: 'free',
        notes: `firebase_uid:${uid}`,
      })
      .select('id, name, tier')
      .single();

    if (error || !created) {
      console.error('[TV-MobileSync] insert error:', error);
      return NextResponse.json(
        { ok: false, error: 'Could not create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      profileId: created.id,
      name: created.name,
      tier: created.tier,
    });
  } catch (err) {
    console.error('[TV-MobileSync] exception:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
