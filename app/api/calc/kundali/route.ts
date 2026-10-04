// ============================================================
// File: app/api/calc/kundali/route.ts
// Purpose: VM bridge for Kundali / Nakshatra / Rashi / Lagna /
//          Dasha + Shadbala-based Calculators
// Version: v2.6 — DIMAAG lib/calc-core/kundali.ts mein gaya (MCP programme B1) — 4 Oct 2026
//   * VM kundali, dasha, target graha, upay template, granth upay ab runKundali()
//     mein — website aur VM ka MCP dono EK hi file chalate hain.
//   * Is file mein sirf: field jaanch, usage log, sessionId, jawab.
//   * Output v2.5 se same — Rohiit ke chart ke asli VM jawab par har calcType
//     (12) aur galti ke raaste mila kar jaancha.
// PICHHLA: v2.5 — granth-upay (BPHS 84) bina chhede aage; ratna upay ke grah (lagnesh) ka (1 Oct 2026)
// PICHHLA: v2.4 — storage AWAIT (21 Sep 2026)
// Changelog v2.2 (2026-09-01):
//   SAPTAMSA (D-7) PASSTHROUGH added for the Santan Yog calculator. BPHS Ch.6
//   s.11 judges children in the Saptamsa; the D-9 already exposed here is the
//   marriage varga, so a progeny calculator built on it would be reading the
//   wrong chart. Pure passthrough, null until astro.py patcher #4 has run —
//   callers must guard, exactly as they do for drishti/dasamsa/navamsa.
//
// Changelog v2.1 (2026-09-01):
//   THREE LIVE BUGS FIXED. All three were found by calling this endpoint
//   directly on 1 Sep 2026 with two different births and reading the raw
//   JSON — not by reading code. Both calls returned the identical shape.
//
//   BUG 1 — the full Vimshottari cycle was computed and then thrown away.
//     This route already reads kundaliData.dasha.maha_dasha from the VM
//     (see `const mahaList` below) and walks it to find the current period.
//     But the response only carried the two resolved NAMES:
//         dasha: { mahadasha: "Rahu", antardasha: "Jupiter" }
//     Every start date, every end date and every antar[] was dropped on the
//     way out. free-dasha-calculator reads result.kundali.dasha.maha_dasha
//     to render its two date cards and its "Next 5 Mahadasha Periods"
//     table, so that page has been showing "—" in both cards and hiding
//     the timeline entirely. The data was there the whole time.
//     FIX: `dasha` now also carries `maha_dasha`, passed through RAW from
//     the VM. Raw rather than remapped so that anything the VM adds later
//     — pratyantar, sookshma — arrives without another route change.
//
//   BUG 2 — no `kundali` key was ever returned.
//     Several calculators read result.kundali.* :
//       free-dasha-calculator   → result.kundali.dasha.maha_dasha
//       free-nakshatra-calculator → result.kundali.grahas (Moon lookup)
//     `kundali` did not exist in this response, so those reads were always
//     undefined and those result blocks have always rendered empty.
//     FIX: a `kundali` object is now returned alongside the existing
//     top-level fields. It is a pure back-compat alias holding the raw VM
//     grahas, lagna, dasha and houses. Nothing existing was renamed or
//     removed, so pages reading `planets`, `instant` or `shadbala` are
//     untouched — they keep the exact response they have today.
//
//   BUG 3 — template was null for the default calcType.
//     synthesizeTemplate() only ran when NEW_CALC_TYPES included the
//     calcType. The dasha and nakshatra pages POST without a calcType, so
//     it defaulted to 'kundali', which is not in that list — and when the
//     VM sent no remedies those pages lost their Dos, Don'ts and Remedies
//     blocks completely.
//     FIX: the synthesized fallback now applies to every calcType.
//     `remediesSource` is returned alongside it ('vm' | 'synthesized' |
//     'none') so this is visible rather than silent — if that field starts
//     reading 'synthesized' across the board, the VM's remedy_master has
//     stopped responding and should be looked at directly. The fallback
//     is real classical Parashar data from PLANET_REMEDY, not invented,
//     and it is the same data the newer calculators already receive.
//
//   NOT FIXED HERE, because it is not this file's problem:
//     `houses` comes back as an empty array. This route maps
//     kundaliData.houses faithfully; the VM is returning nothing to map.
//     That needs looking at on the VM side, and is deliberately left
//     visible rather than papered over here.
//
// Changelog v2.0 (2026-08-29):
//   - Passthrough navamsa (D-9) from the VM (astro.py patcher #3).
// Changelog v1.9 (2026-08-29):
//   - Passthrough drishti + dasamsa from the VM (astro.py patcher #2).
//     Needed by the IAS / Foreign Settlement / Foreign Spouse calculators.
//   - ADDITIVE ONLY. No existing field renamed, reshaped or removed, so
//     every current calculator keeps the exact response it has today.
// Changelog v1.8 (2026-06-17):
//   - Pass through planetary DEGREES for the Gemstone Engine v2.1
//     (combustion / astangata): planets[].longitude + degree_in_sign.
//     VM already returns these (confirmed) — pure passthrough.
//   - FIX: VM returns `retrograde` (not `is_retrograde`). The old
//     mapping read g.is_retrograde → always false. Now reads
//     g.retrograde with fallback. Needed for retro combustion limits.
//   - Also passes planets[].sign_en (English sign) for robustness.
//   - Zero change to any other logic / calcType.
// Changelog v1.7:
//   - graha-bal now targets the WEAKEST planet for its remedy/Dos
//     template. Strongest planet still surfaced via `strongestPlanet`.
// Changelog v1.6:
//   - Added calcTypes: graha-bal, lucky-day, weak-planet,
//     kundali-strength, lagna-bal, shadbala, gemstone.
//   - resolveTargetPlanet() resolves strongest/weakest planet.
//   - Passthrough: planets[].strength, planets[].shadbala,
//     top-level shadbala, strongestPlanet, weakestPlanet, strengthAvailable.
//   - SYNTHESIZED REMEDY FALLBACK for new calcTypes only (zero regression).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';
import { runKundali, kundaliBirthError } from '@/lib/calc-core/kundali';
import type { CalcInput, VmCaller } from '@/lib/calc-core/kundali';
import { logUsage, usageBirthFields, usageContextFromRequest } from '@/lib/usage-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Website ka VM raasta — callVM (key apne aap judti hai). */
const vmViaCallVM: VmCaller = (path, body) =>
  callVM(path, { method: 'POST', body: JSON.stringify(body) });

export async function POST(req: NextRequest) {
  try {
    const body: CalcInput = await req.json();

    const missing = kundaliBirthError(body);
    if (missing) {
      return NextResponse.json({ error: missing }, { status: 400 });
    }

    const out = await runKundali(body, vmViaCallVM);
    if (!out.ok) {
      return NextResponse.json({ error: out.error, detail: out.detail }, { status: out.status });
    }

    const sessionId = `calc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // ── usage log — AWAIT (Vercel jawab ke baad function jam kar deta hai).
    try {
      await logUsage({
        ...usageContextFromRequest(req),
        ...usageBirthFields(body as any),
        product_slug : 'calc-kundali',
        product_name : 'Kundali Calculator',
        product_type : 'calculator',
        tier         : 'free',
      });
    } catch { /* logging must never break the calculator */ }

    const { success, ...rest } = out.body;
    return NextResponse.json({ success, sessionId, ...rest }, { status: 200 });
  } catch (err: any) {
    console.error('[kundali] Fatal:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err?.message || err) }, { status: 500 });
  }
}
