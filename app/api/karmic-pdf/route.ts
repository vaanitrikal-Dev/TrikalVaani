// TRIKAL VAANI — Karmic Background Reading — PDF Generation API
// CEO: Rohiit Gupta
// File: app/api/karmic-pdf/route.ts
// VERSION: 1.0
// Generates a styled HTML string → uploads to Supabase Storage →
// returns the public URL. Same pattern as Milan PDF.
// Input: { slug }  (the karmic_readings slug, already generated)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DIMENSION_MARKERS = [
  { marker: '═══ 1. CORE PERSONALITY ═══',                   title: 'Core Personality',                 icon: '🪔' },
  { marker: '═══ 2. FIDELITY & RELATIONSHIP CONDUCT ═══',     title: 'Fidelity & Relationship Conduct',  icon: '💗' },
  { marker: '═══ 3. FINANCIAL BEHAVIOUR ═══',                 title: 'Financial Behaviour',              icon: '🪙' },
  { marker: '═══ 4. FAMILY & PARENTAL RESPECT ═══',           title: 'Family & Parental Respect',        icon: '🏠' },
  { marker: '═══ 5. HIDDEN TENDENCIES & KARMIC BAGGAGE ═══',  title: 'Hidden Tendencies & Karmic Baggage', icon: '🌑' },
  { marker: '═══ 6. MARRIAGE OUTLOOK & LONGEVITY ═══',        title: 'Marriage Outlook & Longevity',     icon: '🔱' },
];
const MAA_SHAKTI_MARKER = '═══ MAA SHAKTI ═══';

function parseNarrative(narrative: string) {
  let working   = narrative;
  let maaShakti = '';

  if (working.includes(MAA_SHAKTI_MARKER)) {
    const [before, after] = working.split(MAA_SHAKTI_MARKER);
    working   = before;
    maaShakti = (after ?? '').trim();
  }

  let opening = '';
  const firstMarker = DIMENSION_MARKERS[0].marker;
  if (working.includes(firstMarker)) {
    const [op, rest] = working.split(firstMarker);
    opening = op.trim();
    working = firstMarker + rest;
  }

  const dimensions: { title: string; icon: string; body: string }[] = [];
  for (let i = 0; i < DIMENSION_MARKERS.length; i++) {
    const cur  = DIMENSION_MARKERS[i].marker;
    const next = DIMENSION_MARKERS[i + 1]?.marker;
    if (!working.includes(cur)) continue;
    const afterCur = working.split(cur)[1] ?? '';
    const body = next && afterCur.includes(next) ? afterCur.split(next)[0] : afterCur;
    dimensions.push({ title: DIMENSION_MARKERS[i].title, icon: DIMENSION_MARKERS[i].icon, body: body.trim() });
  }

  return { opening, dimensions, maaShakti };
}

function buildHtml(
  personName: string,
  personPlace: string,
  language: string,
  parsed: ReturnType<typeof parseNarrative>
): string {
  const dimHtml = parsed.dimensions.map((d, i) => `
    <div class="dim">
      <div class="dim-header">
        <span class="dim-icon">${d.icon}</span>
        <h2 class="dim-title">${i + 1}. ${d.title}</h2>
      </div>
      ${d.body.split('\n\n').filter(Boolean).map(p => `<p class="para">${p.trim()}</p>`).join('')}
    </div>
  `).join('');

  const maaHtml = parsed.maaShakti
    ? parsed.maaShakti.split('\n\n').filter(Boolean).map(p => `<p class="maa-para">${p.trim()}</p>`).join('')
    : '<p class="maa-para">Maa Shakti ki kripa banee rahe. Arzi aur Dhanyawad zaroor karein.</p>';

  const openingHtml = parsed.opening
    ? `<div class="opening"><p>${parsed.opening.replace(/\n\n/g, '</p><p>')}</p></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Karmic Background Reading — ${personName} — Trikal Vaani</title>
<style>
  body { font-family: 'Georgia', serif; background: #fff; color: #1a1a2e; margin: 0; padding: 32px; max-width: 760px; margin: 0 auto; }
  .header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 24px; margin-bottom: 32px; }
  .brand { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #D4AF37; margin-bottom: 8px; }
  .person-name { font-size: 28px; font-weight: bold; color: #1a1a2e; margin: 0 0 4px; }
  .person-place { font-size: 13px; color: #666; margin: 0; }
  .product-label { font-size: 11px; color: #999; margin-top: 8px; letter-spacing: 2px; text-transform: uppercase; }
  .opening { background: #faf7ee; border-left: 4px solid #D4AF37; padding: 16px 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0; }
  .opening p { font-size: 15px; line-height: 1.8; color: #2d2d2d; margin: 0 0 10px; }
  .dim { border: 1px solid #e8dbb5; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
  .dim-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f0e6c0; }
  .dim-icon { font-size: 22px; }
  .dim-title { font-size: 16px; font-weight: bold; color: #B8860B; margin: 0; }
  .para { font-size: 14px; line-height: 1.85; color: #333; margin: 0 0 12px; }
  .para:last-child { margin-bottom: 0; }
  .maa { text-align: center; background: #1a1a2e; color: #fff; border-radius: 12px; padding: 28px; margin: 32px 0; }
  .maa-title { font-size: 20px; color: #D4AF37; margin: 0 0 8px; }
  .maa-subtitle { font-size: 13px; color: #D4AF37; opacity: 0.8; margin: 0 0 16px; }
  .maa-para { font-size: 13px; line-height: 1.8; color: #ddd; margin: 0 0 10px; }
  .footer { text-align: center; border-top: 1px solid #e8dbb5; padding-top: 20px; margin-top: 32px; }
  .footer p { font-size: 11px; color: #999; margin: 4px 0; }
  .footer .brand-footer { color: #D4AF37; font-size: 12px; letter-spacing: 3px; }
  .disclaimer { font-size: 10px; color: #bbb; margin-top: 10px; line-height: 1.5; }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">Trikal Vaani · Karmic Background Reading</div>
    <h1 class="person-name">${personName}</h1>
    ${personPlace ? `<p class="person-place">${personPlace}</p>` : ''}
    <p class="product-label">Bhrigu Nandi Nadi · 6 Karmic Dimensions · ₹251</p>
  </div>

  ${openingHtml}
  ${dimHtml}

  <div class="maa">
    <h2 class="maa-title">🔱 Maa Shakti Ki Kripa Banee Rahe</h2>
    <p class="maa-subtitle">माँ शक्ति की कृपा बनी रहे</p>
    ${maaHtml}
  </div>

  <div class="footer">
    <p class="brand-footer">TRIKAL VAANI</p>
    <p>AI-Powered Vedic Astrology · Rohiit Gupta, Chief Vedic Architect</p>
    <p>MSME · UDYAM-DL-10-0119070 · trikalvaani.com</p>
    <p class="disclaimer">This reading reveals karmic patterns from the birth chart for self-understanding and preparation. Trikal reveals patterns — it does not pass judgement on any person. Language: ${language}.</p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });

    // Load reading
    const { data: reading, error: loadErr } = await supabase
      .from('karmic_readings')
      .select('slug, language, person_data, gemini_narrative, pdf_url')
      .eq('slug', slug)
      .single();

    if (loadErr || !reading) {
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }

    // Return cached PDF if already generated
    if (reading.pdf_url) {
      return NextResponse.json({ success: true, pdf_url: reading.pdf_url, cached: true });
    }

    if (!reading.gemini_narrative || reading.gemini_narrative.length < 200) {
      return NextResponse.json({ error: 'Reading not yet generated.' }, { status: 400 });
    }

    const personName  = (reading.person_data as any)?.name  ?? 'This Soul';
    const personPlace = (reading.person_data as any)?.place ?? (reading.person_data as any)?.cityName ?? '';

    const parsed  = parseNarrative(reading.gemini_narrative);
    const html    = buildHtml(personName, personPlace, reading.language, parsed);
    const htmlBuf = Buffer.from(html, 'utf-8');
    const fileName = `karmic-${slug}.html`;

    // Upload to Supabase Storage (karmic-pdfs bucket)
    const { error: uploadErr } = await supabase.storage
      .from('karmic-pdfs')
      .upload(fileName, htmlBuf, {
        contentType: 'text/html; charset=utf-8',
        upsert: true,
      });

    if (uploadErr) {
      console.error('[Trikal] Karmic PDF upload error:', uploadErr.message);
      return NextResponse.json({ error: 'PDF upload failed.' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('karmic-pdfs')
      .getPublicUrl(fileName);

    const pdfUrl = urlData?.publicUrl ?? null;

    if (pdfUrl) {
      await supabase.from('karmic_readings')
        .update({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
        .eq('slug', slug);
    }

    return NextResponse.json({ success: true, pdf_url: pdfUrl, cached: false });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    console.error('[Trikal] /api/karmic-pdf error:', msg);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
