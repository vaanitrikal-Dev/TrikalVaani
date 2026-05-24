// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: app/api/auth/mobile-sync/route.ts
// VERSION: v2.0 — PROPER FIX
// DATE: 2026-05-24
// PURPOSE:
//   After Firebase verifies the phone OTP, create a REAL Supabase
//   auth user (in auth.users) for this mobile number — same as
//   Gmail users. The existing handle_new_user trigger then auto-
//   creates the matching profiles row.
//
//   This makes mobile users first-class: their user_id is a valid
//   auth.users id, so predictions.user_id foreign key passes and
//   their reports save correctly into the Vault.
//
//   Returning mobile users: we find their existing auth user by
//   phone and reuse it (no duplicate).
//
// ENV REQUIRED:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mobile, uid } = await request.json();

    if (!mobile) {
      return NextResponse.json(
        { ok: false, error: 'Missing mobile' },
        { status: 400 }
      );
    }

    // Normalize phone to E.164 (Supabase stores without leading +)
    // mobile comes in like "+919560886116"
    const phoneE164 = mobile.startsWith('+') ? mobile : `+${mobile}`;
    const phoneNoPlus = phoneE164.replace('+', '');

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1) Check if an auth user already exists for this phone.
    //    (Returning mobile user — reuse their id.)
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id, name, tier')
      .eq('mobile', phoneNoPlus)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({
        ok: true,
        profileId: existingProfile.id,
        name: existingProfile.name ?? 'Seeker',
        tier: existingProfile.tier ?? 'free',
      });
    }

    // Also check by the +prefixed form (in case stored differently)
    const { data: existingProfilePlus } = await admin
      .from('profiles')
      .select('id, name, tier')
      .eq('mobile', phoneE164)
      .maybeSingle();

    if (existingProfilePlus) {
      return NextResponse.json({
        ok: true,
        profileId: existingProfilePlus.id,
        name: existingProfilePlus.name ?? 'Seeker',
        tier: existingProfilePlus.tier ?? 'free',
      });
    }

    // 2) New mobile user — create a REAL Supabase auth user.
    //    phone_confirm:true because Firebase already verified the OTP.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      phone: phoneNoPlus,
      phone_confirm: true,
      user_metadata: {
        full_name: 'Seeker',
        login_method: 'firebase_phone',
        firebase_uid: uid ?? null,
      },
    });

    if (createErr || !created?.user) {
      // If user already exists in auth but not in profiles, recover gracefully.
      console.error('[TV-MobileSync v2.0] createUser error:', createErr?.message);
      return NextResponse.json(
        { ok: false, error: 'Could not create auth user' },
        { status: 500 }
      );
    }

    const newUserId = created.user.id;

    // 3) The handle_new_user trigger auto-creates the profiles row.
    //    We update it with the mobile number (trigger uses NEW.phone
    //    which is set, but ensure tier + mobile are correct).
    await admin
      .from('profiles')
      .update({ mobile: phoneNoPlus, name: 'Seeker', tier: 'free' })
      .eq('id', newUserId);

    return NextResponse.json({
      ok: true,
      profileId: newUserId,
      name: 'Seeker',
      tier: 'free',
    });
  } catch (err) {
    console.error('[TV-MobileSync v2.0] exception:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
