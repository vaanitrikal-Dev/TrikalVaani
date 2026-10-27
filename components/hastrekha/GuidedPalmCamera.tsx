'use client';

// ============================================================
// File: components/hastrekha/GuidedPalmCamera.tsx
// Version: 1.1 (27 Oct 2026) — STHIRTA SUDHAAR | 1.0 (27 Oct 2026) — NAYA
//
// CHANGE v1.1 (Rohiit: "camera stabilisation thik kardo"):
//   1. Hilna ab ek frame se nahi — EMA (smoothed) se mapa jaata hai. Ek jhatka
//      countdown nahi todta; 2 lagaatar hilte frame chahiye.
//   2. Hysteresis: sthir tab maane jab smoothed < 7, sthirta tab tootegi jab > 12
//      (pehle ek hi seema 8 thi → chip hara-safed jhilmilata tha).
//   3. Camera khulne ke pehle 1.2s jaanch nahi (focus/exposure set hone do).
//   4. Countdown 3-2-1 ab 500ms har kadam (~1.5s sthir).
//   5. 7s mein photo apne aap na hui → "button dabaiye" sandesh + shutter chamakta hai.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// KYC jaisa camera (Rohiit faisla 27 Oct 2026, Option B): phone par KOI naya
// app / AI model download nahi. Phone sirf do cheezein live jaanchta hai —
// ROSHNI (chamak) aur STHIR (hilna-dulna), ek chhote canvas par. Teeno chip
// hare hote hi 3-2-1 aur photo apne aap. Haath sahi hai ya nahi, yeh photo ke
// BAAD hamara VM engine (/api/palmistry/validate) 1-2 second mein batata hai.
// Camera na khule (permission / purana phone) → gallery se chunne ka raasta.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';

const GOLD = '#D4AF37';

type Chip = 'ok' | 'wait' | 'bad';

export interface CapturedPhoto { file: File; preview: string; }

export default function GuidedPalmCamera({
  handLabel, onCapture, onClose,
}: {
  handLabel: string;                           // "Right" | "Left"
  onCapture: (p: CapturedPhoto) => void;
  onClose: () => void;
}) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const probeRef  = useRef<HTMLCanvasElement | null>(null);
  const prevRef   = useRef<Uint8ClampedArray | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const goodSince = useRef<number>(0);
  const emaRef    = useRef<number | null>(null);   // v1.1 smoothed hilna
  const steadyRef = useRef(false);                 // v1.1 hysteresis state
  const shakyRun  = useRef(0);                     // v1.1 lagaatar hilte frames
  const openedAt  = useRef<number>(0);             // v1.1 warm-up + manual hint
  const doneRef   = useRef(false);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [camError, setCamError] = useState('');
  const [light, setLight]   = useState<Chip>('wait');
  const [steady, setSteady] = useState<Chip>('wait');
  const [count, setCount]   = useState<number | null>(null);
  const [hint, setHint]     = useState('हथेली खोलकर सुनहरी लाइन के अंदर रखें');
  const [manual, setManual] = useState(false);     // v1.1 7s baad button ka ishaara

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const capture = useCallback(() => {
    const v = videoRef.current;
    if (!v || doneRef.current || !v.videoWidth) return;
    doneRef.current = true;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(blob => {
      if (!blob) { doneRef.current = false; return; }
      const file = new File([blob], `palm-${handLabel.toLowerCase()}.jpg`, { type: 'image/jpeg' });
      stop();
      onCapture({ file, preview: URL.createObjectURL(blob) });
    }, 'image/jpeg', 0.92);
  }, [handLabel, onCapture, stop]);

  // ── Camera kholna ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('nocam');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        openedAt.current = Date.now();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        setCamError('कैमरा नहीं खुल पाया — कोई बात नहीं, गैलरी से फोटो चुनें।');
      }
    })();
    return () => { cancelled = true; stop(); };
  }, [stop]);

  // ── Live jaanch: roshni + sthirta (har 250ms, 64x48 canvas) ──
  useEffect(() => {
    const t = setInterval(() => {
      const v = videoRef.current;
      if (!v || !v.videoWidth || doneRef.current) return;
      if (!probeRef.current) { probeRef.current = document.createElement('canvas'); probeRef.current.width = 64; probeRef.current.height = 48; }
      const ctx = probeRef.current.getContext('2d', { willReadFrequently: true } as any) as CanvasRenderingContext2D;
      ctx.drawImage(v, 0, 0, 64, 48);
      const d = ctx.getImageData(0, 0, 64, 48).data;
      const gray = new Uint8ClampedArray(64 * 48);
      let sum = 0;
      for (let i = 0, j = 0; i < d.length; i += 4, j++) { const g = (d[i] * 3 + d[i + 1] * 6 + d[i + 2]) / 10; gray[j] = g; sum += g; }
      const mean = sum / gray.length;
      let diff = 255;
      if (prevRef.current) { let s = 0; for (let j = 0; j < gray.length; j++) s += Math.abs(gray[j] - prevRef.current[j]); diff = s / gray.length; }
      prevRef.current = gray;

      const now = Date.now();
      if (!openedAt.current) openedAt.current = now;
      const since = now - openedAt.current;
      if (since > 7000 && !manual) setManual(true);

      // v1.1 — smoothed hilna (EMA) + hysteresis + ek jhatka maaf
      if (diff < 255) emaRef.current = emaRef.current === null ? diff : emaRef.current * 0.6 + diff * 0.4;
      const ema = emaRef.current ?? 255;
      if (since < 1200) { setHint('कैमरा तैयार हो रहा है…'); return; }
      if (steadyRef.current) {
        shakyRun.current = ema > 12 ? shakyRun.current + 1 : 0;
        if (shakyRun.current >= 2) steadyRef.current = false;
      } else if (ema < 7) {
        steadyRef.current = true; shakyRun.current = 0;
      }

      const l: Chip = mean < 60 ? 'bad' : mean > 225 ? 'bad' : 'ok';
      const st: Chip = steadyRef.current ? 'ok' : 'wait';
      setLight(l); setSteady(st);
      if (l === 'bad') setHint(mean < 60 ? 'रोशनी कम है — खिड़की के पास या लाइट में आइए' : 'रोशनी बहुत तेज़ है — सीधी धूप/फ्लैश से हटिए');
      else if (st !== 'ok') setHint(since > 7000 ? 'हाथ स्थिर नहीं हो रहा? नीचे गोल बटन दबाकर खुद फोटो लें' : 'कोहनी मेज़ पर टिकाइए, हाथ और फोन स्थिर रखें');
      else setHint('बढ़िया! हिलाइए मत…');

      if (l === 'ok' && st === 'ok') {
        if (!goodSince.current) goodSince.current = now;
        const left = 3 - Math.floor((now - goodSince.current) / 500);
        setCount(left > 0 ? left : 0);
        if (left <= 0) capture();
      } else {
        goodSince.current = 0;
        setCount(null);
      }
    }, 250);
    return () => clearInterval(t);
  }, [capture, manual]);

  const chip = (state: Chip, label: string) => (
    <span className="rounded-full px-3 py-1 text-xs"
      style={state === 'ok'
        ? { background: 'rgba(34,197,94,0.22)', color: '#86EFAC' }
        : state === 'bad'
        ? { background: 'rgba(239,68,68,0.22)', color: '#FCA5A5' }
        : { background: 'rgba(255,255,255,0.12)', color: '#E5E7EB' }}>
      {state === 'ok' ? '✓ ' : '… '}{label}
    </span>
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#05070C' }} role="dialog" aria-modal="true"
      aria-label={`${handLabel} हाथ की फोटो`}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold" style={{ color: GOLD }}>{handLabel} हाथ</span>
        <button type="button" onClick={() => { stop(); onClose(); }}
          className="min-h-[44px] px-4 rounded-lg text-sm text-slate-300" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
          बंद करें
        </button>
      </div>

      <div className="relative flex-1 mx-3 rounded-2xl overflow-hidden" style={{ background: '#1B1F2A' }}>
        {!camError && (
          <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Hatheli ki aakriti */}
        {!camError && (
          <svg aria-hidden="true" viewBox="0 0 200 290" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: '62%', maxWidth: 320, height: 'auto' }}>
            <path d="M60 280 L55 170 L30 120 Q25 105 38 102 Q50 100 58 118 L70 140 L68 40 Q68 25 80 25 Q92 25 92 40 L94 120 L98 18 Q98 4 110 4 Q122 4 122 18 L122 118 L128 30 Q130 16 142 17 Q153 19 152 33 L148 125 L158 62 Q161 50 172 52 Q182 55 180 68 L170 180 L150 280 Z"
              fill="none" stroke={GOLD} strokeWidth="3" strokeDasharray="10 7" />
          </svg>
        )}
        <div className="absolute top-3 left-3 right-3 rounded-xl px-3 py-2.5 text-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="text-[15px] font-bold text-white">अपना <span style={{ color: '#F0CF5A' }}>{handLabel} हाथ</span> दिखाइए</div>
          <div className="text-xs text-slate-300 mt-0.5">{camError || hint}</div>
        </div>
        {count !== null && count > 0 && !camError && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full flex items-center justify-center text-5xl font-bold text-white"
            style={{ border: '6px solid #22C55E', background: 'rgba(0,0,0,0.35)' }} aria-live="polite">{count}</div>
        )}
        {!camError && (
          <div className="absolute bottom-3 left-0 right-0 flex gap-2 justify-center flex-wrap">
            {chip(light, 'रोशनी')}{chip(steady, 'स्थिर')}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <button type="button" onClick={() => galleryRef.current?.click()}
          className="min-h-[44px] px-4 rounded-lg text-sm" style={{ color: GOLD, border: `1px solid rgba(212,175,55,0.4)` }}>
          गैलरी से चुनें
        </button>
        {!camError && (
          <button type="button" onClick={capture} aria-label="फोटो लें"
            className={`w-16 h-16 rounded-full ${manual ? 'animate-pulse' : ''}`}
            style={{ border: `4px solid ${manual ? GOLD : '#fff'}`, background: manual ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.2)' }} />
        )}
        <span className="w-[104px]" aria-hidden="true" />
      </div>
      <p className="text-center text-xs text-slate-500 pb-4 px-4">{manual ? 'अपने आप नहीं हुई? गोल बटन दबाइए — फोटो की जाँच फिर भी होगी' : 'सब हरा होते ही फोटो अपने आप — चाहें तो बटन से खुद लें'}</p>

      <input ref={galleryRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) { stop(); onCapture({ file: f, preview: URL.createObjectURL(f) }); }
        }} />
    </div>
  );
}
