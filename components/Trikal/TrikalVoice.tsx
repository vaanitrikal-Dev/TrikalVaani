'use client';

/**
 * ============================================================
 * TRIKAL VAANI — Trikal Voice Widget
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/Trikal/TrikalVoice.tsx
 * VERSION: 2.0 — REAL STT + REAL TTS + Birth Form + Razorpay Paywall
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.0 CHANGES (May 10, 2026):
 *   - REMOVED: mockTranscript — now real Google STT (hi-IN)
 *   - ADDED: Birth form (name, DOB, TOB, place) before recording
 *   - ADDED: Real 60-second MediaRecorder with countdown timer
 *   - ADDED: Real Google TTS Chirp 3 HD voice playback
 *   - ADDED: Razorpay paywall — ₹11 / ₹51 / ₹101 packs
 *   - ADDED: Voice pack balance check + auto-deduct
 *   - ADDED: 4-step flow: Pack → Form → Record → Listen
 *   - ADDED: SEO-friendly aria labels + structured CTAs
 *
 * FLOW:
 *   1. User taps floating mic (bottom-right)
 *   2. Pricing modal: ₹11 (1Q) / ₹51 (5Q-7d) / ₹101 (12Q-30d)
 *   3. Razorpay payment
 *   4. Birth form: Name, DOB, TOB, Place
 *   5. Record 60s voice question
 *   6. Google STT → Gemini 2.5 Pro → Trikal TTS → Auto-play reply
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ── Brand tokens ──────────────────────────────────────────────
const GOLD       = '#D4AF37';
const GOLD_LIGHT = '#F5D76E';
const GOLD_DARK  = '#A8820A';
const BG_DARK    = '#080B12';
const BG_CARD    = 'rgba(8,11,18,0.97)';

// ── Pack pricing ──────────────────────────────────────────────
type Pack = { id: 'p11' | 'p51' | 'p101'; price: number; questions: number; validityDays: number; label: string; sub: string };

const PACKS: Pack[] = [
  { id: 'p11',  price: 11,  questions: 1,  validityDays: 1,  label: '₹11 — Try Trikal',     sub: '1 voice question'  },
  { id: 'p51',  price: 51,  questions: 5,  validityDays: 7,  label: '₹51 — Sapt Darshan',   sub: '5 questions • 7 days'  },
  { id: 'p101', price: 101, questions: 12, validityDays: 30, label: '₹101 — Trikal Bhakt',  sub: '12 questions • 30 days' },
];

// ── Razorpay typings ──────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// ── Floating taglines ─────────────────────────────────────────
const TAGLINES = [
  'त्रिकाल से पूछें — आवाज़ में उत्तर',
  'Speak. Trikal listens. Trikal answers.',
  'Voice prediction in 60 seconds',
  'सच्चा ज्योतिष • असली आवाज़',
  'Ask anything. In your voice.',
];

// ── Birth form type ───────────────────────────────────────────
type BirthForm = {
  name : string;
  dob  : string;
  tob  : string;
  pob  : string;
};

type Stage = 'closed' | 'pricing' | 'form' | 'record' | 'processing' | 'reply';

export default function TrikalVoice() {
  // ── UI state ────────────────────────────────────────────────
  const [stage, setStage]               = useState<Stage>('closed');
  const [taglineIdx, setTaglineIdx]     = useState(0);
  const [activePack, setActivePack]     = useState<Pack | null>(null);
  const [sessionId, setSessionId]       = useState<string>('');
  const [balance, setBalance]           = useState<number>(0);
  const [validUntil, setValidUntil]     = useState<string>('');

  // ── Form state ──────────────────────────────────────────────
  const [form, setForm] = useState<BirthForm>({ name: '', dob: '', tob: '', pob: '' });

  // ── Recording state ─────────────────────────────────────────
  const [recording, setRecording]       = useState(false);
  const [seconds, setSeconds]           = useState(60);
  const [transcript, setTranscript]     = useState('');
  const [reply, setReply]               = useState('');
  const [audioUrl, setAudioUrl]         = useState('');
  const [error, setError]               = useState('');

  const mediaRecorderRef                = useRef<MediaRecorder | null>(null);
  const chunksRef                       = useRef<Blob[]>([]);
  const timerRef                        = useRef<NodeJS.Timeout | null>(null);

  // ── Init session + restore balance ──────────────────────────
  useEffect(() => {
    let sid = localStorage.getItem('trikal_voice_session');
    if (!sid) {
      sid = `tv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('trikal_voice_session', sid);
    }
    setSessionId(sid);

    // Restore balance from localStorage (server is source of truth on use)
    const savedBal = localStorage.getItem('trikal_voice_balance');
    const savedUntil = localStorage.getItem('trikal_voice_valid_until');
    if (savedBal && savedUntil && new Date(savedUntil) > new Date()) {
      setBalance(parseInt(savedBal, 10));
      setValidUntil(savedUntil);
    }

    // Restore form
    const savedForm = localStorage.getItem('trikal_voice_form');
    if (savedForm) {
      try { setForm(JSON.parse(savedForm)); } catch {}
    }
  }, []);

  // ── Tagline rotation ────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3500);
    return () => clearInterval(t);
  }, []);

  // ── Stop recording (forward declare for callback) ───────────
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  // ── Open widget — check balance first ───────────────────────
  const handleOpen = () => {
    if (balance > 0 && new Date(validUntil) > new Date()) {
      // User has active pack — go straight to form
      setStage('form');
    } else {
      setStage('pricing');
    }
  };

  // ── Razorpay flow ───────────────────────────────────────────
  const handleBuyPack = async (pack: Pack) => {
    setError('');
    setActivePack(pack);

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/voice-pack-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id, sessionId }),
      });

      if (!orderRes.ok) throw new Error('Order creation failed');
      const order = await orderRes.json();

      // 2. Open Razorpay
      const rzp = new window.Razorpay({
        key       : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount    : pack.price * 100,
        currency  : 'INR',
        name      : 'Trikal Vaani',
        description: pack.label,
        order_id  : order.orderId,
        theme     : { color: GOLD },
        handler   : async (response: Record<string, string>) => {
          // 3. Verify on server + add credits
          const verifyRes = await fetch('/api/verify-voice-pack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              packId   : pack.id,
              sessionId,
            }),
          });

          if (!verifyRes.ok) {
            setError('Payment verification failed. Contact support.');
            return;
          }

          const verified = await verifyRes.json();
          setBalance(verified.balance);
          setValidUntil(verified.validUntil);
          localStorage.setItem('trikal_voice_balance',     String(verified.balance));
          localStorage.setItem('trikal_voice_valid_until', verified.validUntil);
          setStage('form');
        },
        modal: {
          ondismiss: () => setError('Payment cancelled'),
        },
        prefill: { name: form.name },
      });

      rzp.open();
    } catch (err) {
      console.error('[TrikalVoice] Pack purchase error:', err);
      setError('Could not start payment. Please try again.');
    }
  };

  // ── Save form + go to recording ─────────────────────────────
  const handleFormSubmit = () => {
    if (!form.name || !form.dob || !form.tob || !form.pob) {
      setError('कृपया सभी details भरें');
      return;
    }
    localStorage.setItem('trikal_voice_form', JSON.stringify(form));
    setError('');
    setStage('record');
  };

  // ── Start recording ─────────────────────────────────────────
  const startRecording = async () => {
    setError('');
    setTranscript('');
    setReply('');
    setAudioUrl('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await processAudio(audioBlob);
      };

      mr.start();
      setRecording(true);
      setSeconds(60);

      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            stopRecording();
            return 0;
          }
          return s - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('[TrikalVoice] Mic error:', err);
      setError('माइक्रोफोन access की permission दीजिए');
    }
  };

  // ── Process audio: STT → Predict → TTS ──────────────────────
  const processAudio = async (audioBlob: Blob) => {
    setStage('processing');

    try {
      // ── 1. Speech-to-Text ─────────────────────────────────
      const fd = new FormData();
      fd.append('audio',     audioBlob, 'voice.webm');
      fd.append('sessionId', sessionId);
      fd.append('language',  'hinglish');

      const sttRes = await fetch('/api/voice-transcribe', { method: 'POST', body: fd });
      if (!sttRes.ok) throw new Error('Transcription failed');

      const sttData = await sttRes.json();
      const userQuestion = sttData.transcription;
      setTranscript(userQuestion);

      // ── 2. Send to Trikal Chat with voice mode ────────────
      const chatRes = await fetch('/api/Trikal-chat', {
        method : 'POST',
        headers: {
          'Content-Type'  : 'application/json',
          'X-Vedic-Engine': 'Rohiit-Gupta-Vedic-Engine-v2',
        },
        body: JSON.stringify({
          message  : userQuestion,
          mode     : 'voice',
          userName : form.name,
          birthData: {
            name : form.name,
            dob  : form.dob,
            tob  : form.tob,
            pob  : form.pob,
          },
          sessionId,
        }),
      });

      if (!chatRes.ok) throw new Error('Prediction failed');
      const chatData = await chatRes.json();
      const trikalReply = chatData.reply || chatData.response || chatData.text || '';
      setReply(trikalReply);

      // ── 3. Decrement balance on server ────────────────────
      await fetch('/api/voice-pack-order', {
        method : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ sessionId, action: 'consume' }),
      });

      const newBal = Math.max(0, balance - 1);
      setBalance(newBal);
      localStorage.setItem('trikal_voice_balance', String(newBal));

      // ── 4. Text-to-Speech ─────────────────────────────────
      const ttsRes = await fetch('/api/voice-tts', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ text: trikalReply, sessionId }),
      });

      if (!ttsRes.ok) throw new Error('Voice synthesis failed');

      const audioBuffer = await ttsRes.blob();
      const url = URL.createObjectURL(audioBuffer);
      setAudioUrl(url);

      setStage('reply');

      // Auto-play reply
      setTimeout(() => {
        const audio = new Audio(url);
        audio.play().catch(() => {});
      }, 400);

    } catch (err) {
      console.error('[TrikalVoice] Process error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStage('record');
    }
  };

  // ── Reset to ask another question ───────────────────────────
  const handleAskAnother = () => {
    if (balance > 0) {
      setTranscript('');
      setReply('');
      setAudioUrl('');
      setStage('record');
    } else {
      setStage('pricing');
    }
  };

  // ── Close ───────────────────────────────────────────────────
  const handleClose = () => {
    stopRecording();
    setStage('closed');
    setError('');
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  // ── Floating button (closed state) ─────────────────────────
  if (stage === 'closed') {
    return (
      <>
        <button
          onClick={handleOpen}
          aria-label="Open Trikal Voice — Ask Vedic astrology by voice"
          className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 group"
          style={{
            background    : `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT})`,
            borderRadius  : '999px',
            padding       : '14px 22px 14px 18px',
            boxShadow     : `0 8px 32px ${GOLD_DARK}66, 0 0 0 2px ${GOLD}33`,
            transition    : 'transform 0.2s ease',
          }}
        >
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            background: BG_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'trikalPulse 2s ease-in-out infinite',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </span>
          <span style={{ color: BG_DARK, fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>
            {TAGLINES[taglineIdx]}
          </span>
        </button>

        <style>{`
          @keyframes trikalPulse {
            0%, 100% { box-shadow: 0 0 0 0 ${GOLD}aa; }
            50%      { box-shadow: 0 0 0 12px ${GOLD}00; }
          }
        `}</style>
      </>
    );
  }

  // ── Modal wrapper ──────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trikal Voice Prediction"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          background: BG_CARD,
          border    : `1px solid ${GOLD}55`,
          boxShadow : `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${GOLD}33`,
          maxHeight : '90vh',
          overflowY : 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${GOLD}22` }}>
          <div>
            <h2 style={{ color: GOLD, fontSize: 18, fontWeight: 700, margin: 0 }}>त्रिकाल वाणी</h2>
            <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>Voice Prediction by Trikal</p>
          </div>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'transparent', color: GOLD, fontSize: 22, cursor: 'pointer', border: 'none' }}>×</button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">

          {/* ── PRICING ─────────────────────────────────────── */}
          {stage === 'pricing' && (
            <>
              <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
                ₹11 में अपनी आवाज़ से सवाल पूछें — Trikal अपनी आवाज़ में जवाब देंगे।
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PACKS.map(pack => (
                  <button
                    key={pack.id}
                    onClick={() => handleBuyPack(pack)}
                    style={{
                      background : `linear-gradient(135deg, ${GOLD_DARK}22, ${GOLD}11)`,
                      border     : `1px solid ${GOLD}55`,
                      borderRadius: 12,
                      padding    : '14px 16px',
                      textAlign  : 'left',
                      cursor     : 'pointer',
                      color      : '#fff',
                    }}
                  >
                    <div style={{ color: GOLD, fontSize: 16, fontWeight: 700 }}>{pack.label}</div>
                    <div style={{ color: '#bbb', fontSize: 12, marginTop: 2 }}>{pack.sub}</div>
                  </button>
                ))}
              </div>
              <p style={{ color: '#777', fontSize: 11, textAlign: 'center', marginTop: 14 }}>
                100% secure • Razorpay • By Rohiit Gupta, Chief Vedic Architect
              </p>
            </>
          )}

          {/* ── FORM ─────────────────────────────────────── */}
          {stage === 'form' && (
            <>
              <p style={{ color: '#fff', fontSize: 13, marginBottom: 12 }}>
                Trikal को आपकी जन्म details चाहिए — accuracy के लिए।
                {balance > 0 && (
                  <span style={{ color: GOLD, fontSize: 12, display: 'block', marginTop: 4 }}>
                    Balance: {balance} question{balance > 1 ? 's' : ''} remaining
                  </span>
                )}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  placeholder="आपका नाम / Your Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={form.dob}
                  onChange={e => setForm({ ...form, dob: e.target.value })}
                  style={inputStyle}
                />
                <input
                  type="time"
                  placeholder="Time of Birth"
                  value={form.tob}
                  onChange={e => setForm({ ...form, tob: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Place of Birth (City, Country)"
                  value={form.pob}
                  onChange={e => setForm({ ...form, pob: e.target.value })}
                  style={inputStyle}
                />
                <button onClick={handleFormSubmit} style={primaryBtnStyle}>Continue → Record</button>
              </div>
            </>
          )}

          {/* ── RECORD ─────────────────────────────────────── */}
          {stage === 'record' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {!recording ? (
                <>
                  <p style={{ color: '#fff', fontSize: 14, marginBottom: 18 }}>
                    Mic button दबाएं और 60 seconds तक अपना सवाल बोलें
                  </p>
                  <button
                    onClick={startRecording}
                    aria-label="Start recording"
                    style={{
                      width: 96, height: 96, borderRadius: '50%', cursor: 'pointer',
                      background: `radial-gradient(circle, ${GOLD}, ${GOLD_DARK})`,
                      border: 'none',
                      boxShadow: `0 0 0 6px ${GOLD}22, 0 8px 32px ${GOLD_DARK}66`,
                      animation: 'trikalPulse 2s ease-in-out infinite',
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BG_DARK} strokeWidth="2" style={{ margin: 'auto' }}>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <p style={{ color: GOLD, fontSize: 13, marginBottom: 10, animation: 'trikalFade 1.5s ease-in-out infinite' }}>
                    Trikal सुन रहे हैं...
                  </p>
                  <div style={{
                    fontSize: 56, fontWeight: 700, color: GOLD,
                    fontVariantNumeric: 'tabular-nums', marginBottom: 18,
                  }}>
                    {String(seconds).padStart(2, '0')}s
                  </div>
                  <button
                    onClick={stopRecording}
                    style={{ ...primaryBtnStyle, background: '#c0392b' }}
                  >
                    ■ Stop & Submit
                  </button>
                </>
              )}
              {error && <p style={{ color: '#e74c3c', fontSize: 12, marginTop: 12 }}>{error}</p>}
            </div>
          )}

          {/* ── PROCESSING ─────────────────────────────────────── */}
          {stage === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: 56, height: 56, margin: 'auto',
                border: `3px solid ${GOLD}33`,
                borderTopColor: GOLD,
                borderRadius: '50%',
                animation: 'trikalSpin 1s linear infinite',
              }} />
              <p style={{ color: '#fff', fontSize: 13, marginTop: 18 }}>
                Trikal आपके सवाल पर ध्यान कर रहे हैं...
              </p>
              {transcript && (
                <p style={{ color: '#888', fontSize: 11, marginTop: 12, fontStyle: 'italic' }}>
                  &quot;{transcript}&quot;
                </p>
              )}
            </div>
          )}

          {/* ── REPLY ─────────────────────────────────────── */}
          {stage === 'reply' && (
            <>
              {transcript && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>आपका सवाल</div>
                  <div style={{ color: '#bbb', fontSize: 13, marginTop: 4, fontStyle: 'italic' }}>&quot;{transcript}&quot;</div>
                </div>
              )}

              <div style={{ borderTop: `1px solid ${GOLD}33`, paddingTop: 14 }}>
                <div style={{ color: GOLD, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  त्रिकाल का उत्तर
                </div>
                <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.7 }}>{reply}</p>
              </div>

              {audioUrl && (
                <audio controls src={audioUrl} style={{ width: '100%', marginTop: 14 }} />
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={handleAskAnother} style={{ ...primaryBtnStyle, flex: 1 }}>
                  {balance > 0 ? `Ask Another (${balance} left)` : 'Buy More Questions'}
                </button>
                <button onClick={handleClose} style={{ ...secondaryBtnStyle, flex: 1 }}>Close</button>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`
        @keyframes trikalPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${GOLD}aa, 0 8px 32px ${GOLD_DARK}66; }
          50%      { box-shadow: 0 0 0 14px ${GOLD}00, 0 8px 32px ${GOLD_DARK}66; }
        }
        @keyframes trikalFade {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes trikalSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Reusable styles ───────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background  : 'rgba(255,255,255,0.05)',
  border      : `1px solid ${GOLD}33`,
  color       : '#fff',
  padding     : '11px 14px',
  borderRadius: 8,
  fontSize    : 14,
  outline     : 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  background  : `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
  color       : BG_DARK,
  border      : 'none',
  padding     : '12px 18px',
  borderRadius: 8,
  fontSize    : 14,
  fontWeight  : 700,
  cursor      : 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  background  : 'transparent',
  color       : GOLD,
  border      : `1px solid ${GOLD}66`,
  padding     : '12px 18px',
  borderRadius: 8,
  fontSize    : 14,
  fontWeight  : 600,
  cursor      : 'pointer',
};
