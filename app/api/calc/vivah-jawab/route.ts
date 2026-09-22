/**
 * File:    app/api/calc/vivah-jawab/route.ts
 * Version: v1.1 — 22 Sep 2026 — NAYA NAAM (vivah-feedback ki copy). Ad-blocker
 *          "feedback" wale URL rok dete hain: Rohiit ke browser se click
 *          server tak pahuncha hi nahi, jabki seedha test ok:true + row id 1.
 *          Andar ka code bilkul same.
 * PICHHLA: v1.0 — 22 Sep 2026 (vivah-feedback)
 *
 * Love or Arranged calculator ka "Sach Seekhne Wala" hissa (Rohiit ka design):
 * shaadi-shuda log apni ASLI shaadi ka prakar batate hain → Supabase
 * `vivah_feedback`. NAAM KABHI NAHI. Isi data se parampara ke 10 sanketon ke
 * ank har mahine jaanche/badle jaate hain. Table par RLS band — sirf ye server
 * route (service key) likhta hai.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const JAWAB = new Set(['love', 'arranged', 'love-cum-arranged', 'abhi-nahi']);
const num = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!JAWAB.has(b?.jawab) || !/^\d{4}-\d{2}-\d{2}$/.test(String(b?.date || ''))) {
      return NextResponse.json({ ok: false, error: 'bad input' }, { status: 400 });
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ ok: false }, { status: 503 });
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await sb.from('vivah_feedback').insert({
      dob: b.date,
      tob: typeof b.time === 'string' && b.time ? b.time.slice(0, 8) : null,
      lat: num(b.lat), lon: num(b.lon), tz: num(b.tz),
      gender: ['male', 'female', 'other'].includes(b.gender) ? b.gender : null,
      jawab: b.jawab,
      score: num(b.score),
      band: typeof b.band === 'string' ? b.band.slice(0, 40) : null,
      sanket: Array.isArray(b.sanket) ? b.sanket.slice(0, 12).map((s: unknown) => String(s).slice(0, 60)) : null,
      source_path: '/calculators/free-love-or-arranged-marriage-calculator',
    });
    if (error) {
      console.error('[vivah-feedback]', error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
