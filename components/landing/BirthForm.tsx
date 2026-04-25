/**
 * ============================================================
 * TRIKAL VAANI — BirthForm handleSubmit patch
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/landing/BirthForm.tsx (handleSubmit only)
 * VERSION: 10.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ REPLACE ONLY THE handleSubmit FUNCTION IN BirthForm.tsx
 *    Everything else in BirthForm.tsx stays exactly as is.
 *
 * v10.0 CHANGES:
 *   - handleSubmit now calls /api/predict after /api/kundali
 *   - Prediction saved to Supabase predictions table
 *   - predictionId passed to result page via URL
 *   - sessionId generated and persisted in localStorage
 *   - All existing URL params preserved — no breaking changes
 * ============================================================
 */

// ─── ADD THESE IMPORTS to the top of BirthForm.tsx ───────────────────────────
// (alongside existing imports)
//
// import {
//   savePrediction,
//   getOrCreateSessionId,
// } from '@/lib/supabase';

// ─── REPLACE handleSubmit FUNCTION ───────────────────────────────────────────
// Find the existing `async function handleSubmit(e: React.FormEvent)`
// and replace the entire function with this:

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  const userValid  = validateForm(form, setErrors);
  let partnerValid = true;
  if (isDualMode) partnerValid = validateForm(partnerForm, setPartnerErrors);
  if (!userValid || !partnerValid) return;

  setLoading(true);
  try {

    // ── Step 1 — Get lat/lng from city ──────────────────────────────────────
    let lat = 28.6139;
    let lng = 77.2090;
    try {
      const geoRes  = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.city)}&format=json&limit=1`
      );
      const geoData = await geoRes.json();
      if (geoData[0]) {
        lat = parseFloat(geoData[0].lat);
        lng = parseFloat(geoData[0].lon);
      }
    } catch {
      console.warn('[Trikal] Geocoding failed — using Delhi default');
    }

    // ── Step 2 — Build birth data ────────────────────────────────────────────
    const birthData = {
      name:     form.name.trim(),
      dob:      form.dob,
      tob:      form.birth_time || '12:00',
      lat,
      lng,
      cityName: form.city.trim(),
    };

    // ── Step 3 — Call /api/kundali (Prokerala server-side) ──────────────────
    const kundaliRes = await fetch('/api/kundali', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(birthData),
    });

    if (!kundaliRes.ok) throw new Error('Kundali API failed');
    const { kundali } = await kundaliRes.json();

    // ── Step 4 — Save submission to Supabase (existing) ──────────────────────
    await saveSubmission({
      name:         form.name.trim(),
      dob:          form.dob,
      birth_time:   form.birth_time,
      city:         form.city.trim(),
      energy_score: kundali.planets['Sun']?.strength ?? 75,
      pillar_scores: {
        wealth:   kundali.planets['Jupiter']?.strength ?? 70,
        career:   kundali.planets['Saturn']?.strength  ?? 70,
        love:     kundali.planets['Venus']?.strength   ?? 70,
        health:   kundali.planets['Sun']?.strength     ?? 70,
        students: kundali.planets['Mercury']?.strength ?? 70,
        peace:    kundali.planets['Moon']?.strength    ?? 70,
      },
    });

    // ── Step 5 — Get session ID (persistent across refreshes) ────────────────
    const sessionId = getOrCreateSessionId();

    // ── Step 6 — Determine domain ID for /api/predict ────────────────────────
    const effectiveQuestion = selectedCategory ?? selectedQuestion;
    const domainId = effectiveQuestion
      ? `${detectedGen ?? 'millennial'}_${effectiveQuestion.id}`
      : null;

    // ── Step 7 — Call /api/predict (Gemini prediction engine) ────────────────
    let predictionId: string | null = null;

    if (domainId) {
      try {
        const predictRes = await fetch('/api/predict', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            // userId — optional, only if logged in via Supabase Auth
            // Uncomment when auth is wired:
            // userId: supabase.auth.getUser()?.data?.user?.id,
            domainId,
            birthData,
            userContext: {
              segment:    detectedGen      ?? 'millennial',
              employment: employment       ?? '',
              sector:     sector           ?? '',
              language:   selectedLang     ?? 'hinglish',
              city:       form.city.trim(),
            },
          }),
        });

        if (predictRes.ok) {
          const prediction = await predictRes.json();

          // ── Step 8 — Save prediction to Supabase ──────────────────────────
          predictionId = await savePrediction({
            sessionId,
            domainId,
            domainLabel:  effectiveQuestion.label,
            personName:   form.name.trim(),
            dob:          form.dob,
            birthCity:    form.city.trim(),
            birthTime:    form.birth_time || undefined,
            lagna:        prediction._meta?.kundali?.lagna     ?? kundali.lagna,
            nakshatra:    prediction._meta?.kundali?.nakshatra ?? kundali.nakshatra,
            mahadasha:    prediction._meta?.kundali?.mahadasha ?? kundali.currentMahadasha?.lord,
            antardasha:   prediction._meta?.kundali?.antardasha ?? kundali.currentAntardasha?.lord,
            tier:         prediction._meta?.tier               ?? 'free',
            language:     selectedLang                         ?? 'hinglish',
            segment:      detectedGen                          ?? 'millennial',
            employment:   employment                           ?? undefined,
            sector:       sector                               ?? undefined,
            chartSource:  prediction._meta?.chartSource,
            prediction,
            processingMs: prediction._meta?.processingMs,
            geminiModel:  prediction._meta?.model,
            searchUsed:   prediction._meta?.searchUsed         ?? false,
          });

          console.log('[Trikal] Prediction saved to Supabase:', predictionId);
        } else {
          console.warn('[Trikal] /api/predict failed — continuing without prediction');
        }
      } catch (predictErr) {
        // Non-fatal — user still goes to result page with kundali data
        console.warn('[Trikal] Prediction error — continuing:', predictErr);
      }
    }

    // ── Step 9 — Navigate to result page ─────────────────────────────────────
    // predictionId and sessionId added to URL params
    // Result page uses these to fetch prediction from Supabase
    const params = new URLSearchParams({
      name:           form.name.trim(),
      dob:            form.dob,
      city:           form.city.trim(),
      tob:            form.birth_time || '12:00',
      lat:            String(lat),
      lng:            String(lng),
      lang:           selectedLang,
      employment,
      sector,
      mobile,
      sessionId,                                    // ✅ NEW v10.0
      ...(predictionId ? { predictionId } : {}),    // ✅ NEW v10.0
      ...(domainId     ? { domainId }     : {}),    // ✅ NEW v10.0
      lagna:          kundali.lagna,
      lagnaLord:      kundali.lagnaLord,
      nakshatra:      kundali.nakshatra,
      nakshatraLord:  kundali.nakshatraLord,
      mahadasha:      kundali.currentMahadasha.lord,
      antardasha:     kundali.currentAntardasha.lord,
      dashaBalance:   kundali.dashaBalance,
      choghadiya:     kundali.panchang.choghadiya.name,
      choghadiyaType: kundali.panchang.choghadiya.type,
      tithi:          kundali.panchang.tithi,
      vara:           kundali.panchang.vara,
      yoga:           kundali.panchang.yoga,
      rahuStart:      kundali.panchang.rahuKaal.start,
      rahuEnd:        kundali.panchang.rahuKaal.end,
      abhijeetStart:  kundali.panchang.abhijeetMuhurta.start,
      abhijeetEnd:    kundali.panchang.abhijeetMuhurta.end,
      planets: JSON.stringify(
        Object.values(kundali.planets).map((p: any) => ({
          name:         p.name,
          rashi:        p.rashi,
          house:        p.house,
          strength:     p.strength,
          isRetrograde: p.isRetrograde,
          nakshatra:    p.nakshatra,
          degree:       p.degree,
        }))
      ),
      ...(kundali.currentPratyantar ? {
        pratayantarLord:    kundali.currentPratyantar.lord,
        pratayantarStart:   kundali.currentPratyantar.startDate instanceof Date
          ? kundali.currentPratyantar.startDate.toISOString()
          : String(kundali.currentPratyantar.startDate),
        pratayantarEnd:     kundali.currentPratyantar.endDate instanceof Date
          ? kundali.currentPratyantar.endDate.toISOString()
          : String(kundali.currentPratyantar.endDate),
        pratayantarDays:    String(kundali.currentPratyantar.durationDays),
        pratayantarQuality: kundali.currentPratyantar.quality,
        pratayantarRemDays: String(kundali.currentPratyantar.remainingDays),
      } : {}),
      ...(kundali.currentSookshma ? {
        sookshmaLord:    kundali.currentSookshma.lord,
        sookshmaStart:   kundali.currentSookshma.startDate instanceof Date
          ? kundali.currentSookshma.startDate.toISOString()
          : String(kundali.currentSookshma.startDate),
        sookshmaEnd:     kundali.currentSookshma.endDate instanceof Date
          ? kundali.currentSookshma.endDate.toISOString()
          : String(kundali.currentSookshma.endDate),
        sookshmaDays:    String(kundali.currentSookshma.durationDays),
        sookshmaQuality: kundali.currentSookshma.quality,
      } : {}),
      ...(kundali.pratyantar?.length ? {
        pratayantarList: JSON.stringify(
          kundali.pratyantar.map((p: any) => ({
            lord:          p.lord,
            startDate:     p.startDate instanceof Date ? p.startDate.toISOString() : p.startDate,
            endDate:       p.endDate instanceof Date ? p.endDate.toISOString() : p.endDate,
            durationDays:  p.durationDays,
            quality:       p.quality,
            remainingDays: p.remainingDays,
          }))
        ),
      } : {}),
      ...(effectiveQuestion ? {
        autoSegment:      effectiveQuestion.id,
        autoSegmentLabel: effectiveQuestion.label,
      } : {}),
      ...(isDualMode && partnerForm.name.trim() ? {
        partnerName:   partnerForm.name.trim(),
        partnerDob:    partnerForm.dob,
        partnerCity:   partnerForm.city.trim(),
        partnerTime:   partnerForm.birth_time,
        partnerGender: gender,
      } : {}),
    });

    router.push(`/result?${params.toString()}`);

  } catch (err) {
    console.error('[Trikal] Form submit error:', err);
    setLoading(false);
  }
}
