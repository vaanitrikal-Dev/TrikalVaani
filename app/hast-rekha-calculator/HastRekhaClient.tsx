'use client';

// app/hast-rekha-calculator/HastRekhaClient.tsx
// Trikaal Vaani — AI Hast Rekha Vishleshan
// Version: 1.0.0

import { useState, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'loading' | 'result';

interface FormState {
  userName: string;
  gender: 'M' | 'F';
  language: 'hi' | 'en' | 'hinglish';
  dob: string;
}

interface PalmImage {
  preview: string;
  b64: string;
}

interface PalmResult {
  success: boolean;
  mp_features: Record<string, any>;
  gemini_data: Record<string, any>;
  scores: Record<string, number>;
  observations: string[];
  report: Record<string, any>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCORE_META: Record<string, { label: string; icon: string }> = {
  vitality:     { label: 'जीवन शक्ति',  icon: '⚡' },
  career:       { label: 'करियर',        icon: '💼' },
  wealth:       { label: 'धन',           icon: '💰' },
  relationship: { label: 'प्रेम-विवाह',  icon: '❤️' },
  leadership:   { label: 'नेतृत्व',      icon: '👑' },
  creativity:   { label: 'सृजन',         icon: '🎨' },
  spirituality: { label: 'अध्यात्म',     icon: '🕉️' },
  health:       { label: 'स्वास्थ्य',    icon: '🌿' },
};

const LOADING_MSGS = [
  'हस्त रेखाएं स्कैन हो रही हैं...',
  'MediaPipe से 21 बिंदु निकाले जा रहे हैं...',
  'समुद्रिक शास्त्र नियम लागू हो रहे हैं...',
  'Trikaal आपकी रिपोर्ट तैयार कर रही है...',
];

const UPLOAD_TIPS = [
  'Natural light mein lein',
  'Poora haath frame mein ho',
  'Ungliyan seedhi khuli hon',
  'Ring/bracelet utaar lein',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fileToB64(file: File, maxWidth = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(1, maxWidth / img.width, maxWidth / img.height);
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
      } catch (e) { reject(e); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = reject;
    img.src = url;
  });
}

function scoreColor(v: number) {
  if (v >= 75) return 'bg-green-500';
  if (v >= 55) return 'bg-amber-500';
  return 'bg-orange-500';
}

function scoreTag(v: number) {
  if (v >= 80) return { label: 'उत्तम',  color: 'text-green-400' };
  if (v >= 65) return { label: 'शुभ',    color: 'text-amber-400' };
  if (v >= 50) return { label: 'मध्यम',  color: 'text-yellow-400' };
  return            { label: 'सुधार',  color: 'text-orange-400' };
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────

function UploadZone({
  image, onFile, label, required, emoji,
}: {
  image: PalmImage | null;
  onFile: (file: File) => void;
  label: string;
  required?: boolean;
  emoji: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-300">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
        {!required && <span className="text-gray-600 ml-1 text-xs">(Optional)</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center
          ${image
            ? 'border-green-600 bg-green-950/20'
            : required
              ? 'border-amber-700/60 bg-amber-950/10 hover:border-amber-500'
              : 'border-gray-700 bg-gray-900/20 hover:border-gray-500'
          }`}
      >
        {image ? (
          <>
            <img src={image.preview} alt={label} className="max-h-44 rounded-lg object-cover mx-auto" />
            <p className="text-green-400 text-sm mt-3">✓ Upload successful</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">{emoji}</div>
            <p className="text-gray-400 text-sm">Click karein ya drag karein</p>
            <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP · Max 10MB</p>
          </>
        )}
        <input ref={ref} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HastRekhaClient() {
  const [step,       setStep]       = useState<Step>('upload');
  const [rightPalm,  setRightPalm]  = useState<PalmImage | null>(null);
  const [leftPalm,   setLeftPalm]   = useState<PalmImage | null>(null);
  const [form,       setForm]       = useState<FormState>({ userName: '', gender: 'M', language: 'hi', dob: '' });
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [result,     setResult]     = useState<PalmResult | null>(null);
  const [error,      setError]      = useState('');

  // File handler
  const handleFile = useCallback(async (file: File, side: 'right' | 'left') => {
    setError('');
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('JPG, PNG ya WebP image upload karein'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image 10MB se chhoti honi chahiye'); return;
    }
    try {
      const preview = URL.createObjectURL(file);
      const b64     = await fileToB64(file);
      if (side === 'right') setRightPalm({ preview, b64 });
      else                  setLeftPalm({ preview, b64 });
    } catch {
      setError('Image process karne mein error — dobara try karein');
    }
  }, []);

  // Submit
  const handleSubmit = async () => {
    if (!rightPalm) { setError('Seedha haath (Right Palm) zaroor upload karein'); return; }

    setStep('loading');
    setError('');
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % LOADING_MSGS.length;
      setLoadingIdx(idx);
    }, 3500);

    try {
      const res = await fetch('/api/palmistry/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          right_palm_b64: rightPalm.b64,
          left_palm_b64:  leftPalm?.b64 ?? null,
          user_name:      form.userName,
          gender:         form.gender,
          language:       form.language,
          dob:            form.dob,
        }),
      });
      const data = await res.json();
      clearInterval(timer);

      if (!res.ok || !data.success) throw new Error(data.error || 'Analysis failed');

      setResult(data);
      setStep('result');
    } catch (err: any) {
      clearInterval(timer);
      setError(err.message || 'Kuch galat hua — dobara try karein');
      setStep('upload');
    }
  };

  const resetAll = () => {
    setStep('upload'); setResult(null);
    setRightPalm(null); setLeftPalm(null); setError('');
  };

  // ── STEP: UPLOAD ────────────────────────────────────────────────────────────
  if (step === 'upload') return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">

      {/* Hero */}
      <section className="py-14 px-4 text-center bg-gradient-to-b from-amber-950/25 to-transparent">
        <p className="text-amber-400 text-xs font-semibold tracking-[0.25em] mb-3">
          SAMUDRIKA SHASTRA × MEDIAPIPE × AI
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          🖐️ AI Hast Rekha Calculator
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          Apni haath ki photo upload karein — Trikaal AI Samudrika Shastra se<br className="hidden md:block" />
          aapki hast rekhaon, parvaton aur unglion ka vishleshan karegi
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {['MediaPipe Hand Analysis', 'OpenCV Line Enhancement', 'Samudrika Rules', '100% Free'].map(t => (
            <span key={t} className="px-3 py-1 bg-amber-900/30 border border-amber-700/30 rounded-full text-amber-300 text-xs">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Instructions */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-4 mb-8">
          <p className="text-amber-400 font-semibold text-sm mb-3">📸 Achhi Photo Ke Liye</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {UPLOAD_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Zones */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <UploadZone image={rightPalm} onFile={f => handleFile(f, 'right')}
            label="Seedha Haath (Right Palm)" required emoji="🖐️" />
          <UploadZone image={leftPalm} onFile={f => handleFile(f, 'left')}
            label="Ulta Haath (Left Palm)" emoji="🤚" />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1.5">Aapka Naam</label>
            <input type="text" placeholder="Name (optional)"
              value={form.userName}
              onChange={e => setForm(p => ({ ...p, userName: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Gender</label>
            <select value={form.gender}
              onChange={e => setForm(p => ({ ...p, gender: e.target.value as 'M' | 'F' }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors">
              <option value="M">Purush (Male)</option>
              <option value="F">Stri (Female)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Report Language</label>
            <select value={form.language}
              onChange={e => setForm(p => ({ ...p, language: e.target.value as any }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors">
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3 mb-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!rightPalm}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all shadow-lg shadow-amber-900/30">
          🔮 Hast Rekha Vishleshan Shuru Karein
        </button>

        <p className="text-center text-gray-600 text-xs mt-3">
          AI-powered by Trikaal · Samudrika Shastra · Data stored nahi hota
        </p>
      </section>

      {/* SEO Section */}
      <section className="max-w-3xl mx-auto px-4 py-16 border-t border-gray-900 mt-12">
        <h2 className="text-xl font-semibold mb-3 text-amber-400">Samudrika Shastra Kya Hai?</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Samudrika Shastra bharat ki prachin vidya hai jisme haath ki rekhaon, parvaton, unglion aur haath ke aakar se
          vyakti ke jeevan ka sampoorna vishleshan kiya jaata hai. Trikaal Vaani ka AI engine MediaPipe se haath ke
          21 mahattvapoorn binduon ko extract karta hai, phir OpenCV se rekhaon ko enhance karta hai, aur ant mein
          Samudrika Shastra ke 40+ niyamon se scores aur report taiyar karta hai.
        </p>
        <h2 className="text-xl font-semibold mb-3 text-amber-400">Kaun Si Rekhaen Padhi Jaati Hain?</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Jeevan Rekha (Life Line), Mastishk Rekha (Head Line), Hriday Rekha (Heart Line), Bhagya Rekha (Fate Line),
          Surya Rekha (Sun Line), aur Budh Rekha (Mercury Line) — saath hi Guru, Shani, Surya, Budh, Shukra, Mangal
          aur Chandra parvaton ka vishleshan.
        </p>
        <h2 className="text-xl font-semibold mb-3 text-amber-400">AI Palmistry Kitni Accurate Hai?</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Hamaari accuracy depend karti hai photo quality par. Achhi lighting aur clear palm photo ke saath
          MediaPipe 90%+ accuracy se haath ke measurements lete hai. Gemini Vision palm lines extract karta hai
          aur Claude Samudrika Shastra niyamon se final report banata hai. Yeh ek AI-assisted reading hai —
          aantim nirnay hamesha aapka hoga.
        </p>
      </section>
    </main>
  );

  // ── STEP: LOADING ───────────────────────────────────────────────────────────
  if (step === 'loading') return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl mb-8 animate-pulse">🔮</div>
      <h2 className="text-2xl font-bold mb-3">Trikaal Vishleshan Kar Rahi Hai...</h2>
      <p className="text-amber-400 max-w-sm min-h-[2rem] transition-all">{LOADING_MSGS[loadingIdx]}</p>
      <div className="flex gap-2 mt-8">
        {LOADING_MSGS.map((_, i) => (
          <div key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === loadingIdx ? 'w-8 bg-amber-400' : 'w-2 bg-gray-800'}`} />
        ))}
      </div>
      <p className="text-gray-600 text-xs mt-8">Isme 20-40 seconds lag sakte hain — please wait karein</p>
    </main>
  );

  // ── STEP: RESULT ────────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const { scores, report, mp_features, observations } = result;

    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white pb-24">

        {/* Header */}
        <section className="py-12 px-4 text-center bg-gradient-to-b from-amber-950/25 to-transparent">
          <p className="text-amber-400 text-xs font-semibold tracking-widest mb-3">JINI KA VISHLESHAN COMPLETE</p>
          <h1 className="text-3xl font-bold mb-3">Aapki Hast Rekha Report</h1>
          {mp_features?.hand_shape && (
            <div className="flex gap-2 justify-center flex-wrap mt-2">
              <span className="px-4 py-1.5 bg-amber-900/40 border border-amber-700/40 rounded-full text-amber-300 text-sm">
                {mp_features.hand_shape} Haath
              </span>
              {mp_features?.thumb_angle && (
                <span className="px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-full text-gray-400 text-sm">
                  Angutha: {mp_features.thumb_angle}°
                </span>
              )}
            </div>
          )}
        </section>

        <div className="max-w-3xl mx-auto px-4 space-y-6">

          {/* Score Grid */}
          <section>
            <h2 className="text-base font-semibold mb-4 text-gray-300">📊 Aapke Samudrika Scores</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(scores).map(([key, val]) => {
                const meta = SCORE_META[key];
                if (!meta) return null;
                const tag = scoreTag(val);
                return (
                  <div key={key} className="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-300 leading-tight">{meta.icon} {meta.label}</span>
                      <span className="text-sm font-bold text-amber-400 shrink-0 ml-2">{val}/100</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full rounded-full ${scoreColor(val)} transition-all`}
                        style={{ width: `${val}%` }} />
                    </div>
                    <span className={`text-xs ${tag.color}`}>{tag.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Hast Parichay */}
          {report?.hast_parichay && (
            <section className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-5">
              <h2 className="text-amber-400 font-semibold mb-3 text-sm">🖐️ Hast Parichay</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{report.hast_parichay}</p>
            </section>
          )}

          {/* Top Strength + Challenge */}
          <div className="grid md:grid-cols-2 gap-4">
            {report?.top_strength && (
              <div className="bg-green-950/20 border border-green-800/30 rounded-xl p-4">
                <p className="text-green-400 text-xs font-semibold mb-2 tracking-wide">💪 AAPKI SABSE BADI SHAKTI</p>
                <p className="text-gray-200 text-sm leading-relaxed">{report.top_strength}</p>
              </div>
            )}
            {report?.top_challenge && (
              <div className="bg-orange-950/20 border border-orange-800/30 rounded-xl p-4">
                <p className="text-orange-400 text-xs font-semibold mb-2 tracking-wide">🎯 DHYAN DENE WALA KSHETRA</p>
                <p className="text-gray-200 text-sm leading-relaxed">{report.top_challenge}</p>
              </div>
            )}
          </div>

          {/* Report Sections */}
          {[
            { key: 'mukhya_rekhaen', title: '〰️ Mukhya Rekhaen (Major Lines)' },
            { key: 'vyaktitva',      title: '🧠 Vyaktitva Vishleshan' },
            { key: 'vyavsay_dhan',   title: '💼 Vyavsay aur Dhan' },
            { key: 'prem_vivah',     title: '❤️ Prem aur Vivah' },
            { key: 'swasthya',       title: '🌿 Swasthya' },
            { key: 'adhyatma',       title: '🕉️ Adhyatma' },
          ].map(({ key, title }) =>
            report?.[key] ? (
              <section key={key} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5">
                <h2 className="font-semibold text-sm mb-3 text-white">{title}</h2>
                <p className="text-gray-300 text-sm leading-relaxed">{report[key]}</p>
              </section>
            ) : null
          )}

          {/* Vishesh Sanket */}
          {report?.vishesh_sanket && (
            <section className="bg-purple-950/20 border border-purple-800/30 rounded-xl p-5">
              <h2 className="text-purple-300 font-semibold text-sm mb-3">⭐ Vishesh Sanket</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{report.vishesh_sanket}</p>
            </section>
          )}

          {/* Upay */}
          {Array.isArray(report?.upay) && report.upay.length > 0 && (
            <section className="bg-indigo-950/20 border border-indigo-800/30 rounded-xl p-5">
              <h2 className="text-indigo-300 font-semibold text-sm mb-3">🕉️ Samudrika Upay</h2>
              <ul className="space-y-2">
                {report.upay.map((u: string, i: number) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-300">
                    <span className="text-indigo-400 shrink-0 mt-0.5">◈</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Shubh Ratna */}
          {report?.shubh_ratna && (
            <section className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-5">
              <h2 className="text-blue-300 font-semibold text-sm mb-2">💎 Shubh Ratna</h2>
              <p className="text-gray-300 text-sm">{report.shubh_ratna}</p>
            </section>
          )}

          {/* Jini Sandesh */}
          {report?.jini_sandesh && (
            <section className="bg-gradient-to-r from-amber-950/30 to-orange-950/30 border border-amber-700/40 rounded-xl p-6 text-center">
              <p className="text-amber-400 text-xs font-semibold tracking-widest mb-3">✨ JINI KA SANDESH</p>
              <p className="text-gray-200 text-sm leading-relaxed italic">{report.jini_sandesh}</p>
            </section>
          )}

          {/* Observations */}
          {observations?.length > 0 && (
            <section className="bg-gray-900/30 border border-gray-800/40 rounded-xl p-5">
              <h2 className="text-gray-500 text-xs font-semibold mb-3 tracking-wide">🔍 SAMUDRIKA OBSERVATIONS</h2>
              <ul className="space-y-1.5">
                {observations.map((obs, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Upsell CTA */}
          <section className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-700/30 rounded-xl p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Gehri Kundali Reading Chahiye?</h3>
            <p className="text-gray-400 text-sm mb-5 max-w-sm mx-auto">
              Janam Kundali se career, vivah timing, dhan yoga aur dasha vishleshan — Trikaal ke saath
            </p>
            <a href="/kundali"
              className="inline-block px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg font-semibold text-sm transition-all">
              Kundali Deep Reading — ₹51 →
            </a>
          </section>

          {/* Retry */}
          <button onClick={resetAll}
            className="w-full py-3 border border-gray-800 hover:border-gray-600 rounded-xl text-gray-500 hover:text-gray-300 text-sm transition-all">
            🔄 Nayi Photo se Dobara Try Karein
          </button>

        </div>
      </main>
    );
  }

  return null;
}
