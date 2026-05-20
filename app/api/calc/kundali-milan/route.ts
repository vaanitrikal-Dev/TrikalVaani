// TRIKAL VAANI - Kundali Milan Compute API
// CEO: Rohiit Gupta
// File: app/api/calc/kundali-milan/route.ts
// VERSION: 1.4 - per-person manglik fix (bride.manglik / groom.manglik paths)
//
// CHANGE LOG (v1.3 → v1.4):
//   manglik_data now saves structured per-person + combined via buildManglikData().
//   VM returns bride/groom manglik nested under vmData.bride.manglik + vmData.groom.manglik.
//   Previous save: vmData?.manglik_evaluation only (combined verdict, no per-person).
//   Now: { bride: {is_manglik, strength}, groom: {is_manglik, strength}, combined: {...} }
//   Badge on free result page now shows correct per-person status.
//   All other logic identical to v1.3.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';

const VM_MILAN_ENDPOINT =
  process.env.VM_MILAN_ENDPOINT ?? 'http://34.14.164.105:8001/milan-compute';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function makeSlug(): string {
  const ts  = Date.now().toString(36);
  const rnd = crypto.randomBytes(4).toString('hex');
  return `m-${ts}-${rnd}`;
}

// ── Build structured manglik_data from VM response ────────────
// VM returns per-person manglik nested under:
//   vmData.bride.manglik  → compute_manglik_full for person1
//   vmData.groom.manglik  → compute_manglik_full for person2
//   vmData.manglik_evaluation → combined verdict
function buildManglikData(vmData: any): object | null {
  if (!vmData) return null;

  const combined = vmData?.manglik_evaluation   ?? null;
  const bride    = vmData?.bride?.manglik        ?? null;
  const groom    = vmData?.groom?.manglik        ?? null;

  if (!combined && !bride && !groom) return null;

  return {
    bride: bride ? {
      is_manglik: bride.is_manglik ?? false,
      strength:   bride.strength   ?? 'Not Manglik',
    } : null,
    groom: groom ? {
      is_manglik: groom.is_manglik ?? false,
      strength:   groom.strength   ?? 'Not Manglik',
    } : null,
    combined: combined ? {
      status:         combined.status         ?? 'NONE',
      verdict:        combined.verdict        ?? '',
      verdict_hi:     combined.verdict_hi     ?? '',
      recommendation: combined.recommendation ?? '',
    } : null,
  };
}

// ── Validation schema ─────────────────────────────────────────
const partnerSchema = z
  .object({
    name:      z.string().trim().min(1, 'Name required').max(80),
    gender:    z.enum(['male', 'female']).optional(),
    dob:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
    tob:       z.string().regex(/^\d{2}:\d{2}$/, 'TOB must be HH:MM'),
    place:     z.string().trim().max(160).optional(),
    cityName:  z.string().trim().max(160).optional(),
    latitude:  z.number().min(-90).max(90).optional(),
    lat:       z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    lng:       z.number().min(-180).max(180).optional(),
    timezone:  z.number().min(-12).max(14),
    ayanamsa:  z.string().optional(),
  })
  .passthrough()
  .transform((p) => {
    const latitude  = p.latitude  ?? p.lat;
    const longitude = p.longitude ?? p.lng;
    const place     = p.place     ?? p.cityName ?? '';
    return { ...p, latitude, longitude, place };
  })
  .refine((p) => typeof p.latitude === 'number',  { message: 'latitude/lat required' })
  .refine((p) => typeof p.longitude === 'number', { message: 'longitude/lng required' })
  .refine((p) => p.place.length >= 1,             { message: 'place/cityName required' });

const requestSchema = z
  .object({
    bride:           partnerSchema,
    groom:           partnerSchema,
    audience:        z.enum(['couple', 'parent', 'both']).optional(),
    audienceVersion: z.enum(['couple', 'parent', 'both']).optional(),
    language:        z.enum(['hinglish', 'hindi', 'english']).default('hinglish'),
    tier:            z.string().optional(),
  })
  .passthrough();

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data     = parsed.data;
    const bride    = data.bride;
    const groom    = data.groom;
    const audience = (data.audience ?? data.audienceVersion ?? 'couple') as
      'couple' | 'parent' | 'both';
    const language = data.language;

    const vmPayload = {
      person1: {
        name:      bride.name,
        gender:    bride.gender ?? 'female',
        year:      Number(bride.dob.slice(0, 4)),
        month:     Number(bride.dob.slice(5, 7)),
        day:       Number(bride.dob.slice(8, 10)),
        hour:      Number(bride.tob.slice(0, 2)),
        minute:    Number(bride.tob.slice(3, 5)),
        latitude:  bride.latitude as number,
        longitude: bride.longitude as number,
        timezone:  bride.timezone,
        place:     bride.place,
      },
      person2: {
        name:      groom.name,
        gender:    groom.gender ?? 'male',
        year:      Number(groom.dob.slice(0, 4)),
        month:     Number(groom.dob.slice(5, 7)),
        day:       Number(groom.dob.slice(8, 10)),
        hour:      Number(groom.tob.slice(0, 2)),
        minute:    Number(groom.tob.slice(3, 5)),
        latitude:  groom.latitude as number,
        longitude: groom.longitude as number,
        timezone:  groom.timezone,
        place:     groom.place,
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    let vmRes: Response;
    try {
      vmRes = await fetch(VM_MILAN_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(vmPayload),
        signal:  controller.signal,
        cache:   'no-store',
      });
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] VM /milan-compute fetch failed:', e);
      return NextResponse.json(
        { error: 'Milan engine unreachable. Please try again in a moment.' },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (!vmRes.ok) {
      const txt = await vmRes.text().catch(() => '');
      console.error('[Trikal] VM /milan-compute error:', vmRes.status, txt);
      return NextResponse.json(
        { error: 'Milan engine returned an error.' },
        { status: 502 }
      );
    }

    const vmData = await vmRes.json();

    const ashtakootScore = vmData?.ashtakoot?.total_score          ?? null;
    const manglikStatus  = vmData?.manglik_evaluation?.status       ?? null;

    const previewHook =
      ashtakootScore !== null && ashtakootScore >= 18
        ? 'Aapki rishtedari mein Mahakaal ki rehmat dikhayi de rahi hai. Poori sachhai dekhne ke liye Deep Reading kholiye.'
        : 'Is rishtedari mein kuch chhupe huye sutra hain jo sirf Deep Reading mein khulenge.';

    const slug = makeSlug();

    const brideData = {
      name: bride.name, gender: bride.gender ?? 'female',
      dob: bride.dob, tob: bride.tob,
      latitude: bride.latitude, longitude: bride.longitude,
      timezone: bride.timezone, place: bride.place,
    };
    const groomData = {
      name: groom.name, gender: groom.gender ?? 'male',
      dob: groom.dob, tob: groom.tob,
      latitude: groom.latitude, longitude: groom.longitude,
      timezone: groom.timezone, place: groom.place,
    };

    let savedSlug: string | null = slug;

    const { error: saveErr } = await supabase
      .from('kundali_milan')
      .insert({
        order_id:         null,
        slug,
        tier:             'free',
        audience,
        language,
        bride_data:       brideData,
        groom_data:       groomData,
        ashtakoot_score:  ashtakootScore,
        ashtakoot_data:   vmData?.ashtakoot        ?? null,
        manglik_data:     buildManglikData(vmData),       // v1.4: per-person + combined
        remedies_data:    null,
        gemini_narrative: null,
        pdf_url:          null,
      });

    if (saveErr) {
      console.error('[Trikal] Free Milan save error:', saveErr.message);
      savedSlug = null;
    }

    return NextResponse.json({
      success:  true,
      tier:     'free',
      milanId:  savedSlug,
      slug:     savedSlug,
      audience,
      language,
      preview: {
        ashtakoot_score: ashtakootScore,
        manglik_status:  manglikStatus,
        hook:            previewHook,
      },
      bride: { name: bride.name, place: bride.place, dob: bride.dob, tob: bride.tob },
      groom: { name: groom.name, place: groom.place, dob: groom.dob, tob: groom.tob },
      locked: {
        full_ashtakoot:   false,
        full_manglik:     false,
        remedies:         true,
        gemini_narrative: true,
        pdf_download:     true,
      },
    });

  } catch (err: unknown) {
    console.error('[Trikal] /api/calc/kundali-milan error:', err);
    return NextResponse.json(
      { error: 'Server error during Milan compute.' },
      { status: 500 }
    );
  }
}
