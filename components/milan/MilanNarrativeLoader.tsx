'use client';
/**
 * ============================================================
 * TRIKAL VAANI — Milan Narrative Loader
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/milan/MilanNarrativeLoader.tsx
 * VERSION: 1.0 (27 Sep 2026)
 * ============================================================
 * Kyun: page ke andar narrative banana 30s limit se takrata tha (6/6 paid
 * Milan readings NULL). Ab browser /api/milan-narrative call karta hai
 * (~35-60s), bante hi page reload hota hai aur reading DB se dikhti hai.
 * Fail ho to ek baar khud retry, phir "Dobara koshish" button + WhatsApp.
 * Copy wahi purani ("Aapki reading taiyaar ho rahi hai...").
 * ============================================================
 */
import { useEffect, useRef, useState } from 'react';

const WHATSAPP = 'https://wa.me/919211804111';

export default function MilanNarrativeLoader({ slug }: { slug: string }) {
  const [failed, setFailed]   = useState(false);
  const [seconds, setSeconds] = useState(0);
  const started = useRef(false);

  const generate = async (attempt = 1): Promise<void> => {
    setFailed(false);
    try {
      const res = await fetch('/api/milan-narrative', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data?.narrative === 'string' && data.narrative.length > 200) {
        window.location.reload();
        return;
      }
      throw new Error(data?.error || `HTTP ${res.status}`);
    } catch {
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 5000));
        return generate(attempt + 1);
      }
      setFailed(true);
    }
  };

  useEffect(() => {
    if (started.current) return;      // React strict-mode double run guard
    started.current = true;
    generate();
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg mb-2">🔱</p>
        <p>Reading banne mein thodi der ho rahi hai.</p>
        <button
          onClick={() => { setSeconds(0); generate(); }}
          className="mt-5 px-6 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] text-[#080B12] font-semibold"
        >
          Dobara koshish karein
        </button>
        <p className="text-sm mt-4 text-gray-500">
          Ya <a href={`${WHATSAPP}?text=${encodeURIComponent('Milan reading: ' + slug)}`} className="text-[#D4AF37] underline">WhatsApp karein</a> — hum turant bhej denge.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-lg mb-2 animate-pulse">🔱</p>
      <p>Aapki reading taiyaar ho rahi hai...</p>
      <p className="text-sm mt-2 text-gray-500">
        Kripya yeh page band na karein — lagbhag 1 minute ({seconds}s)
      </p>
    </div>
  );
}
