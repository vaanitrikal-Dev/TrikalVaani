// TRIKAL VAANI - Karmic Background Reading - Free Preview API
// CEO: Rohiit Gupta
// File: app/api/karmic-preview/route.ts
// VERSION: 1.1
// Light teaser ONLY: calls VM /kundali, returns Lagna sign + Moon sign.
// NO Gemini, NO save, near-zero cost. Builds trust before the Rs251 unlock.
//
// CHANGE v1.1: VM call routes through lib/callVM.ts so X-Trikal-Key is
// injected automatically. 20s timeout/abort preserved. Logic unchanged.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callVM } from '@/lib/callVM';

const VM_KUNDALI_ENDPOINT =
  process.env.VM_KUNDALI_ENDPOINT ?? 'http://34.14.164.105:8001/kundali';

// Single-person birth input (form sends lat/lng/cityName OR canonical)
const previewSchema = z
  .object({
    name:      z.string().trim().max(80).optional(),
    dob:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
    tob:       z.string().regex(/^\d{2}:\d{2}$/, 'TOB must be HH:MM'),
    place:     z.string().trim().max(160).optional(),
    cityName:  z.string().trim().max(160).optional(),
    latitude:  z.number().min(-90).max(90).optional(),
    lat:       z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    lng:       z.number().min(-180).max(180).optional(),
    timezone:  z.number().min(-12).max(14),
  })
  .passthrough()
  .transform((p) => {
    const latitude  = p.latitude  ?? p.lat;
    const longitude = p.longitude ?? p.lng;
    const place     = p.place     ?? p.cityName ?? '';
    return { ...p, latitude, longitude, place };
  })
  .refine((p) => typeof p.latitude === 'number',  { message: 'latitude/lat required' })
  .refine((p) => typeof p.longitude === 'number', { message: 'longitude/lng required' });

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    const parsed = previewSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const p = parsed.data;

    const vmPayload = {
      year:      Number(p.dob.slice(0, 4)),
      month:     Number(p.dob.slice(5, 7)),
      day:       Number(p.dob.slice(8, 10)),
      hour:      Number(p.tob.slice(0, 2)),
      minute:    Number(p.tob.slice(3, 5)),
      latitude:  p.latitude as number,
      longitude: p.longitude as number,
      timezone:  p.timezone,
      place:     p.place,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let vmRes: Response;
    try {
      vmRes = await callVM(VM_KUNDALI_ENDPOINT, {
        method:  'POST',
        body:    JSON.stringify(vmPayload),
        signal:  controller.signal,
      });
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] Karmic preview VM fetch failed:', e);
      return NextResponse.json(
        { error: 'Chart engine unreachable. Please try again in a moment.' },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (!vmRes.ok) {
      const txt = await vmRes.text().catch(() => '');
      console.error('[Trikal] Karmic preview VM error:', vmRes.status, txt);
      return NextResponse.json(
        { error: 'Chart engine returned an error.' },
        { status: 502 }
      );
    }

    const data = await vmRes.json();

    // Lagna sign — direct from /kundali lagna block
    const lagnaSign   = data?.lagna?.sign    ?? data?.lagna?.sign_en ?? null;
    const lagnaSignEn = data?.lagna?.sign_en ?? data?.lagna?.sign    ?? null;

    // Moon sign — find Moon in grahas list
    // VM field name is `planet` (e.g. "Moon"), with sign + sign_en + nakshatra.
    let moonSign: string | null = null;
    let moonNakshatra: string | null = null;
    if (Array.isArray(data?.grahas)) {
      const moon = data.grahas.find((g: any) => {
        const label = (g?.planet ?? g?.name ?? g?.graha ?? '').toString().toLowerCase();
        return label.startsWith('moon') || label.includes('chandra');
      });
      if (moon) {
        moonSign      = moon.sign ?? moon.sign_en ?? moon.rashi ?? null;
        moonNakshatra = moon.nakshatra ?? null;
      }
    }

    const personName = (p.name ?? '').toString().trim() || null;

    return NextResponse.json({
      success: true,
      preview: {
        name:           personName,
        lagna_sign:     lagnaSign,
        lagna_sign_en:  lagnaSignEn,
        moon_sign:      moonSign,
        moon_nakshatra: moonNakshatra,
      },
      // suspense hook shown under the teaser (Hinglish default; UI can localize)
      hook:
        'Trikal ne aapki kundali mein 6 gehre karmic patterns dekhe hain — ' +
        'personality, nibhaane ki aadat, paisa, parivaar, chhupi pravritti, aur vivah ka bhavishya. ' +
        'Poori sachhai ₹251 mein khulegi.',
    });

  } catch (err: unknown) {
    console.error('[Trikal] /api/karmic-preview error:', err);
    return NextResponse.json(
      { error: 'Server error during preview.' },
      { status: 500 }
    );
  }
}
