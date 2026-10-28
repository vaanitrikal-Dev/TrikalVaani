// ============================================================
// File: app/api/palmistry/validate/route.ts
// Version: 1.1 (28 Oct 2026) — haath_disha | 1.0 (27 Oct 2026) — NAYA
// v1.1: VM engine v2.3 angoothe ki disha se batata hai photo Right haath ki hai ya Left
//   (haath_disha). Client galat haath par photo rokta hai (2 baar ke baad sirf chetavni).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// KYC-camera ke baad photo ki jaanch: VM engine v2.0.0 /palmistry/validate
// (hamara apna MediaPipe — haath mila? hatheli frame mein? dhundhli? roshni?).
// ~1-2 second. Payment se PEHLE, muft. VM na mile to { checked:false } —
// client photo ko rokta nahi (jaanch bonus hai, rukawat nahi).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_B64 = 2_000_000;   // client 1.7M tak compress karta hai

export async function POST(req: NextRequest) {
  try {
    const { image_b64 } = await req.json();
    if (typeof image_b64 !== 'string' || image_b64.length < 1000 || image_b64.length > MAX_B64) {
      return NextResponse.json({ checked: false, error: 'invalid image' }, { status: 400 });
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await callVM('/palmistry/validate', {
        method: 'POST',
        body: JSON.stringify({ image_b64 }),
        cache: 'no-store',
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) return NextResponse.json({ checked: false });
      const d = await res.json();
      return NextResponse.json({
        checked:        true,
        is_valid:       !!d.is_valid,
        reason:         d.reason ?? '',
        hand_detected:  !!d.hand_detected,
        photo_problems: Array.isArray(d.photo_problems) ? d.photo_problems : [],
        haath_disha:    d.haath_disha === 'right' || d.haath_disha === 'left' ? d.haath_disha : null,   // v1.1
      });
    } catch {
      clearTimeout(t);
      return NextResponse.json({ checked: false });
    }
  } catch {
    return NextResponse.json({ checked: false, error: 'bad request' }, { status: 400 });
  }
}
