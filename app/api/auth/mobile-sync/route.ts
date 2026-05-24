// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: app/api/auth/mobile-sync/route.ts
// VERSION: v1.1
// DATE: 2026-05-24
// FIX: v1.1 — generate UUID for new mobile user profiles.
//      profiles.id has no default, must be supplied on insert.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

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

    // Check if profile already exists for this mobile number
    const { data: existing } = await admin
      .from('profiles')
      .select('id, name, tier')
      .eq('mobile', mobile)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        ok: true,
        profileId: existing.id,
        name: existing.name ?? 'Seeker',
        tier: existing.tier ?? 'free',
      });
    }

    // New mobile user — generate UUID and create profile
    const newId = randomUUID();

    const { data: created, error } = await admin
      .from('profiles')
      .insert({
        id: newId,
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
