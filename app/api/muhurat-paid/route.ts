/**
 * ============================================================
 * TRIKAL VAANI — Child Birth Muhurat Paid Report — Generate API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/muhurat-paid/route.ts
 * VERSION: 2.0 (1 Oct 2026) — AI BAND. Report GRANTH se, engine ke data se.
 * VERSION: 1.5 (30 Sep 2026) — ₹51 single tier (muhurat_51) + half-length report
 * ============================================================
 * CHANGE v2.0 (1 Oct 2026, Rohiit ka nirdesh: "AI ko band karke Granth ko
 * add karenge Saar ke sath"):
 *   * Gemini + Claude polish POORA HATA. Report ab VM /muhurat-paid ke data
 *     se banti hai — wahan engine v2.0 + muhurat_saar v1.3 granth se saar
 *     (Brihat Samhita, Muhurta Chintamani, BPHS), janm-dosh aur bachche ka
 *     bhavishya (BPHS bhav-phal) dete hain. Ek bhi vaakya AI nahi likhta.
 *   * Wahi section markers (═══ SHUBH MUHURAT ═══ ...) — isliye report page
 *     (app/muhurat/[slug]/page.tsx) aur VM ka PDF engine BINA BADLE chalte
 *     hain. Sirf ye file badli.
 *   * Shubh naam ab naam_soochi table se (577 naam, 82 akshar) — Rohiit ka
 *     Vikalp B. Soochi Trikaal ka sankalan hai, granth nahi; report mein
 *     yahi likha jaata hai. Jis akshar ke naam nahi, wahan sirf akshar.
 *   * CHHUPI GALTI THEEK: v1.x `Array.isArray(vm.doshas)` jaanchta tha, par
 *     VM `doshas` ko OBJECT bhejta hai ({doshas:[...], summary}). Yani AI ko
 *     kabhi koi dosh pahuncha hi nahi — har report "No major doshas" kehti
 *     thi. Ab asli list padhi jaati hai.
 *   * BHASHA: saar engine Hinglish deta hai (granth ke vachan Devanagari mein).
 *     AI ke bina anuvaad nahi hota, isliye teeno bhasha ke grahak ko yahi
 *     milta hai. Ghoshit seema.
 *   * Idempotency, VM call, Supabase save, notify, PDF trigger — sab v1.5
 *     jaisa. Purani reports (jinme gemini_narrative pehle se hai) waisi rahengi.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyReportReady } from '@/lib/report-notify';
import { callVM } from '@/lib/callVM';
import { qualityLabel } from '@/lib/muhurat-tiering';

// VM paid-muhurat endpoint (kundali + slot + doshas + 10 remedies)
const VM_MUHURAT_PAID_ENDPOINT =
  process.env.VM_MUHURAT_PAID_ENDPOINT ?? 'http://34.47.182.227:8001/muhurat-paid';

// VM PDF endpoint (generates branded PDF, uploads to Supabase, saves pdf_url)
const VM_MUHURAT_PDF_ENDPOINT =
  process.env.VM_MUHURAT_PDF_ENDPOINT ?? 'http://34.47.182.227:8001/muhurat-pdf';

// v2.0 — AI nahi, isliye lamba samay nahi chahiye: VM ≤120s (poore din ka
// scan paid mein hota hai) + Supabase.
export const maxDuration = 150;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


interface MuhuratPaidRequest {
  slug: string;
}

type MuhuratLanguage = 'hinglish' | 'hindi' | 'english';

// muhurat_readings.language is hinglish|hindi|english (3 options).
// VM /muhurat-paid only accepts hi|en. Map for the VM remedy call only.
function langForVM(lang: string): 'hi' | 'en' {
  return lang === 'english' ? 'en' : 'hi'; // hinglish + hindi -> hi remedies
}

// ── Fire-and-forget PDF generation on the VM ──────────────────
// Called after the narrative is saved. The VM reads the reading row
// (incl. the just-saved narrative) from Supabase, builds the PDF,
// uploads it to the muhurat-pdfs bucket, and writes pdf_url back.
// We do NOT await this — the result page shows immediately, and the
// Download PDF button appears on the next load/refresh.
function triggerMuhuratPdf(slug: string): void {
  try {
    const controller = new AbortController();
    // Generous timeout — WeasyPrint + upload can take a few seconds.
    const timeout = setTimeout(() => controller.abort(), 60000);

    callVM(VM_MUHURAT_PDF_ENDPOINT, {
      method:  'POST',
      body:    JSON.stringify({ slug }),
      signal:  controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeout);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('[Trikal] Muhurat PDF gen non-OK:', res.status, txt.slice(0, 200));
        } else {
          console.log('[Trikal] Muhurat PDF generation triggered OK for', slug);
        }
      })
      .catch((e) => {
        clearTimeout(timeout);
        console.error('[Trikal] Muhurat PDF gen failed (non-fatal):', e);
      });
  } catch (e) {
    // Never let PDF generation break the main report flow.
    console.error('[Trikal] Muhurat PDF trigger error (non-fatal):', e);
  }
}

// ═══════════════════════════════════════════════════════════════════
// v2.0 — REPORT GRANTH SE. Har section markers ke saath, taaki report page
// aur PDF engine bina badle padh sakein. Har line VM ke data se aati hai.
// ═══════════════════════════════════════════════════════════════════
const M = {
  SHUBH:   '═══ SHUBH MUHURAT ═══',
  SWABHAV: "═══ BACHCHE KA SWABHAV (Child's Nature & Potential) ═══",
  YOG:     '═══ JEEVAN KE YOG (Life Path Indications) ═══',
  NAAM:    '═══ NAAMAKSHAR & SHUBH NAAM (Lucky Letter & Name Suggestions) ═══',
  DHYAN:   '═══ DHYAN DENE YOGYA (Points of Awareness) ═══',
  UPAY:    '═══ UPAY (10 Remedies) ═══',
  SHAKTI:  '═══ MAA SHAKTI ═══',
};

function saarLine(l: any): string {
  const t = String(l?.baat ?? '').trim();
  if (!t) return '';
  return l?.srot ? `${t} (${l.srot})` : t;
}

async function namesFor(akshar: string): Promise<{ ladka: string[]; ladki: string[] }> {
  const out = { ladka: [] as string[], ladki: [] as string[] };
  if (!akshar) return out;
  try {
    const { data } = await supabase
      .from('naam_soochi').select('ling,naam').eq('akshar', akshar).limit(40);
    for (const r of data ?? []) {
      if (r.ling === 'ladka') out.ladka.push(r.naam);
      else if (r.ling === 'ladki') out.ladki.push(r.naam);
    }
  } catch (e) {
    console.error('[Trikal] naam_soochi read failed (non-fatal):', e);
  }
  return out;
}

function buildGranthNarrative(params: {
  vm: any;
  quality: string;          // Anukool | Madhyam | Saadharan
  names: { ladka: string[]; ladki: string[] };
}): string {
  const { vm, quality, names } = params;
  const slot  = vm?.chosen_slot ?? {};
  const saar  = (vm?.saar?.lines ?? []) as any[];
  const isWeak = quality === 'Saadharan';
  const out: string[] = [];

  // ── 1. SHUBH MUHURAT ─────────────────────────────────────────────
  out.push(M.SHUBH);
  out.push(`Chuna gaya samay: ${vm?.chosen_time ?? slot?.time ?? ''} · darja: ${quality}.`);
  if (isWeak) {
    out.push('Doctor ke bataye is window mein koi atyant shubh samay nahi mila. Ye samay '
      + 'window mein sabse achha uplabdh hai, par saadharan muhurat hai. Ho sake to doctor '
      + 'se poochiye ki koi aur surakshit samay ya tareekh sambhav hai, aur us window ke liye '
      + 'calculator dobara chalaiye.');
  }
  for (const l of saar) {
    const t = saarLine(l);
    if (t) out.push(t);
  }
  const fd = vm?.poore_din_ka_best?.best_slot;
  if (fd?.time) {
    out.push(`Poore din ka sabse shubh samay (jaankari ke liye): ${fd.time}.`);
  }
  out.push('Ye samay doctor ke bataye surakshit window ke andar hai. Maa aur bachche ki '
    + 'suraksha har muhurat se upar hai.');
  out.push('');

  // ── 2. BACHCHE KA SWABHAV ─ lagna aur Chandra, aur bhavishya ka pehla vachan
  const bh = String(vm?.bhavishya ?? '').trim();
  const parts = bh ? bh.split('।').map((s) => s.trim()).filter(Boolean) : [];
  out.push(M.SWABHAV);
  const lg = vm?.lagna_sign ?? slot?.lagna_sign;
  const mn = slot?.moon_nakshatra;
  if (lg || mn) {
    out.push(`Is samay lagna ${lg ?? '—'} hai, aur Chandra ${mn ?? '—'} nakshatra`
      + `${slot?.moon_pada ? ` ke ${slot.moon_pada} charan` : ''} mein — yahi bachche ka janm nakshatra hoga.`);
  }
  if (parts[0]) {
    out.push(`Granth kehta hai: ${parts[0]}।`);
  } else if (vm?.bhavishya_sandesh) {
    out.push(String(vm.bhavishya_sandesh));
  }
  out.push('');

  // ── 3. JEEVAN KE YOG ─ baaki vachan, srot ke saath
  out.push(M.YOG);
  if (parts.length > 1) {
    out.push(`Granth kehta hai: ${parts.slice(1).join('। ')}।`);
  }
  const srot = (vm?.bhavishya_srot ?? []) as string[];
  if (srot.length) out.push(`Srot: ${srot.join(', ')}.`);
  if (vm?.bhavishya_sandesh && parts[0]) out.push(String(vm.bhavishya_sandesh));
  if (vm?.bhavishya_tippani) out.push(String(vm.bhavishya_tippani));
  out.push('');

  // ── 4. NAAMAKSHAR ─ Chandra se (engine v2.0), naam naam_soochi se
  const ak = String(vm?.naamakshar ?? slot?.naamakshar ?? '').trim();
  out.push(M.NAAM);
  if (ak) {
    out.push(`Naamakshar: "${ak}" — Chandra ke nakshatra-charan se, jaisa parampara mein `
      + 'naam ka pehla akshar nikala jaata hai.');
    if (names.ladka.length) out.push(`Ladke ke liye: ${names.ladka.join(', ')}.`);
    if (names.ladki.length) out.push(`Ladki ke liye: ${names.ladki.join(', ')}.`);
    if (!names.ladka.length && !names.ladki.length) {
      out.push(`"${ak}" akshar se paramparik naam kam milte hain — is akshar se shuru hone `
        + 'wala koi bhi shubh, saarthak naam rakh sakte hain.');
    } else {
      out.push('Naamon ki ye soochi Trikaal ka sankalan hai — akshar granth se, naam parampara se.');
    }
  }
  out.push('');

  // ── 5. DHYAN DENE YOGYA ─ dosh-jaanch (asli list) + janm-dosh ki shanti
  out.push(M.DHYAN);
  const dl = Array.isArray(vm?.doshas?.doshas) ? vm.doshas.doshas
           : Array.isArray(vm?.doshas) ? vm.doshas : [];
  const present = dl.filter((d: any) => d?.present);
  if (present.length) {
    for (const d of present) {
      out.push(`${d.name}${d.severity && d.severity !== 'none' ? ` (${d.severity})` : ''}`
        + `${d.detail ? ` — ${String(d.detail).trim()}` : ''}`);
    }
    out.push('Har dosh ka upay sambhav hai — neeche upay dekhiye.');
  } else {
    out.push('Is samay ki kundali mein koi bada dosh nahi mila.');
  }
  const jd = (slot?.janm_dosh ?? []) as any[];
  if (jd.length) {
    out.push('Is samay par granth janm ki shanti batata hai (BPHS adhyay 86, 87, 92-94) — '
      + 'shanti se ye samay bhi shubh hota hai. Behtar hai ki window mein doosra samay chuna jaye.');
  }
  out.push('');

  // ── 6. UPAY (page ise remedies_data se dikhata hai) + MAA SHAKTI
  out.push(M.UPAY);
  out.push('Aapke chart ke 10 upay neeche diye gaye hain.');
  out.push('');
  out.push(M.SHAKTI);
  out.push('Maa Shakti bachche ko lambi aayu, achhi sehat aur sadbuddhi dein, aur parivar '
    + 'par sada kripa banaye rakhein.');
  return out.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const body: MuhuratPaidRequest = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }

    // Load the reading row (created by verify-muhurat-payment)
    const { data: reading, error: loadErr } = await supabase
      .from('muhurat_readings')
      .select('*')
      .eq('slug', slug)
      .single();

    if (loadErr || !reading) {
      console.error('[Trikal] Muhurat reading row not found:', slug, loadErr?.message);
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }

    // Idempotency: return cached narrative if already generated
    if (reading.gemini_narrative && reading.gemini_narrative.length > 200) {
      // If the narrative exists but the PDF was never made, trigger it now.
      if (!reading.pdf_url) {
        triggerMuhuratPdf(slug);
      }
      return NextResponse.json({
        success:   true,
        slug,
        tier:      reading.tier,
        language:  reading.language,
        narrative: reading.gemini_narrative,
        vmData:    reading.vm_data,
        cached:    true,
      });
    }

    // Resolve language (muhurat_readings stores hi/en, but we want 3-lang polish)
    // muhurat_orders/readings store hi|en per the table; expand: hi->hinglish default unless explicit
    const rawLang = reading.language as string;
    const language: MuhuratLanguage =
      rawLang === 'english' || rawLang === 'en' ? 'english'
      : rawLang === 'hindi' ? 'hindi'
      : rawLang === 'hinglish' ? 'hinglish'
      : 'hinglish';

    const muhuratData = reading.muhurat_data as any;
    if (!muhuratData || muhuratData.day === undefined) {
      return NextResponse.json(
        { error: 'Muhurat data incomplete. Please contact support.' },
        { status: 500 }
      );
    }

    // 1) Call VM /muhurat-paid (kundali + slot + doshas + 10 remedies + saar + bhavishya)
    let vmData: any = reading.vm_data ?? null;

    if (!vmData) {
      const controller = new AbortController();
      // v2.0 — paid mein poore din ka scan bhi hota hai, isliye 120s
      const timeout = setTimeout(() => controller.abort(), 120000);

      let vmRes: Response;
      try {
        vmRes = await callVM(VM_MUHURAT_PAID_ENDPOINT, {
          method:  'POST',
          body:    JSON.stringify({
            year:      muhuratData.year,
            month:     muhuratData.month,
            day:       muhuratData.day,
            hour:      muhuratData.hour,
            minute:    muhuratData.minute,
            latitude:  muhuratData.latitude,
            longitude: muhuratData.longitude,
            timezone:  muhuratData.timezone ?? 5.5,
            lang:      langForVM(language),
          }),
          signal: controller.signal,
        });
      } catch (e: unknown) {
        clearTimeout(timeout);
        console.error('[Trikal] VM /muhurat-paid fetch failed:', e);
        return NextResponse.json(
          { error: 'Muhurat engine unreachable. Please try again — your payment is safe.' },
          { status: 502 }
        );
      }
      clearTimeout(timeout);

      if (!vmRes.ok) {
        const txt = await vmRes.text().catch(() => '');
        console.error('[Trikal] VM /muhurat-paid error:', vmRes.status, txt);
        return NextResponse.json(
          { error: 'Muhurat engine returned an error. Your payment is safe; we will retry.' },
          { status: 502 }
        );
      }

      vmData = await vmRes.json();

      // Persist VM data so a retry never recomputes
      await supabase
        .from('muhurat_readings')
        .update({
          vm_data:       vmData,
          doshas_data:   vmData.doshas ?? null,
          remedies_data: vmData.remedies ?? null,
          updated_at:    new Date().toISOString(),
        })
        .eq('slug', slug);
    }

    // 2) v2.0 — REPORT GRANTH SE. AI nahi.
    const quality: string = muhuratData.quality ?? qualityLabel(vmData?.band, vmData?.score);
    const akshar = String(vmData?.naamakshar ?? vmData?.chosen_slot?.naamakshar ?? '').trim();
    const names = await namesFor(akshar);
    const finalText = buildGranthNarrative({ vm: vmData, quality, names });

    // 5) Extract a GEO answer (first non-marker line) for the page
    const geoAnswer = finalText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .find((l) => !l.startsWith('═══')) ?? '';

    // 6) Save
    const { error: saveErr } = await supabase
      .from('muhurat_readings')
      .update({
        gemini_narrative: finalText,
        geo_answer:       geoAnswer.slice(0, 400),
        updated_at:       new Date().toISOString(),
      })
      .eq('slug', slug);

    if (saveErr) {
      console.error('[Trikal] Muhurat narrative save failed:', saveErr.message);
    } else {
      // v1.4 — Surakshit 1-tap email (never throws)
      await notifyReportReady({
        product:    'Child Birth Muhurat',
        reportUrl:  `https://trikalvaani.com/muhurat/${slug}`,
        orderTable: 'muhurat_orders',
        orderId:    reading.order_id ?? null,
      });
    }

    // 7) Fire-and-forget PDF generation (non-blocking).
    //    The narrative is now saved, so the VM PDF engine will include it.
    //    The Download PDF button appears once pdf_url is written (next load).
    triggerMuhuratPdf(slug);

    return NextResponse.json({
      success:   true,
      slug,
      tier:      reading.tier,
      language,
      narrative: finalText,
      vmData,
      cached:    false,
      granth:    true,   // v2.0 — AI nahi
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Trikal] /api/muhurat-paid error:', msg);
    return NextResponse.json(
      { error: 'Server error generating report.' },
      { status: 500 }
    );
  }
}
