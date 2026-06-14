'use client';

/**
 * ============================================================
 * TRIKAL VAANI — Trikaal Voice Widget
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/Trikal/TrikalVoice.tsx
 * VERSION: 2.8 — Details mic single-button fix (release now stops record)
 * DATE: 2026-06-14
 * CHANGES:
 *   v2.8: ROOT-CAUSE FIX for details voice-fill not stopping on release.
 *         The details mic was TWO swapped blocks (button → div) — on
 *         record-start the captured <button> unmounted, so pointerup had
 *         no target and recording never stopped. Now ONE persistent
 *         button (gold↔red by state), matching the question recorder.
 *         Added onLostPointerCapture as a safety stop on both buttons.
 *   v2.7: Shared-phone safety (voice-fill = full field reset + confirm).
 *   v2.6: setPointerCapture PTT fix — finger drift no longer cuts record.
 *   v2.5: Voice-fill birth details (Option A) + "Session required" race fix.
 *   v2.4: PTT (Press & Hold) mic — WhatsApp style.
 *         onPointerDown → start; onPointerUp/Cancel/Leave → stop + submit.
 *         touch-action: none on mic button (mobile scroll fix).
 *   v2.2: Kill switch (NEXT_PUBLIC_ENABLE_VOICE) — unchanged.
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const GOLD       = '#D4AF37';
const GOLD_LIGHT = '#F5D76E';
const GOLD_DARK  = '#A8820A';
const BG_DARK    = '#080B12';
const BG_CARD    = 'rgba(8,11,18,0.97)';

type Pack = { id: 'p11' | 'p51' | 'p101'; price: number; questions: number; validityDays: number; label: string; sub: string };

const PACKS: Pack[] = [
  { id: 'p11',  price: 11,  questions: 1,  validityDays: 1,  label: '₹11 — Try Trikaal',    sub: '1 voice question'      },
  { id: 'p51',  price: 51,  questions: 5,  validityDays: 7,  label: '₹51 — Sapt Darshan',   sub: '5 questions • 7 days'  },
  { id: 'p101', price: 101, questions: 12, validityDays: 30, label: '₹101 — Trikaal Bhakt', sub: '12 questions • 30 days' },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const TAGLINES = [
  'त्रिकाल से पूछें — आवाज़ में उत्तर',
  'Speak. Trikaal listens. Trikaal answers.',
  'Voice prediction in 60 seconds',
  'सच्चा ज्योतिष • असली आवाज़',
  'Ask anything. In your voice.',
];

type BirthForm = { name: string; dob: string; tob: string; pob: string };
type Stage = 'closed' | 'pricing' | 'form' | 'record' | 'processing' | 'reply';
type RecordPurpose = 'question' | 'details';
type FillStatus = 'idle' | 'parsing' | 'done' | 'partial';

export default function TrikalVoice() {

  // ── KILL SWITCH ─────────────────────────────────────────────
  if (process.env.NEXT_PUBLIC_ENABLE_VOICE !== 'true') return null;

  const [stage, setStage]           = useState<Stage>('closed');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [activePack, setActivePack] = useState<Pack | null>(null);
  const [sessionId, setSessionId]   = useState<string>('');
  const [balance, setBalance]       = useState<number>(0);
  const [validUntil, setValidUntil] = useState<string>('');
  const [form, setForm]             = useState<BirthForm>({ name: '', dob: '', tob: '', pob: '' });

  const [recording, setRecording]   = useState(false);
  const [seconds, setSeconds]       = useState(0);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply]           = useState('');
  const [audioUrl, setAudioUrl]     = useState('');
  const [error, setError]           = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Voice-fill state
  const [fillStatus, setFillStatus] = useState<FillStatus>('idle');
  const [voiceFilled, setVoiceFilled] = useState(false);  // true after a voice-fill (shared-phone safety)

  // Refs
  const pttStateRef      = useRef<'idle' | 'starting' | 'recording'>('idle');
  const recordPurposeRef = useRef<RecordPurpose>('question');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const timerRef         = useRef<NodeJS.Timeout | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const mimeTypeRef      = useRef<string>('');
  const sessionIdRef     = useRef<string>('');   // synchronous — fixes "Session required" race

  // ── Init session + restore balance ──────────────────────────
  useEffect(() => {
    let sid = localStorage.getItem('trikal_voice_session');
    if (!sid) {
      sid = `tv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('trikal_voice_session', sid);
    }
    sessionIdRef.current = sid;   // available immediately, no render wait
    setSessionId(sid);

    const savedBal   = localStorage.getItem('trikal_voice_balance');
    const savedUntil = localStorage.getItem('trikal_voice_valid_until');
    if (savedBal && savedUntil && new Date(savedUntil) > new Date()) {
      setBalance(parseInt(savedBal, 10));
      setValidUntil(savedUntil);
    }

    const savedForm = localStorage.getItem('trikal_voice_form');
    if (savedForm) { try { setForm(JSON.parse(savedForm)); } catch {} }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────
  const getSupportedMimeType = (): string => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', ''];
    return types.find(t => t === '' || MediaRecorder.isTypeSupported(t)) ?? '';
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  // ── PTT state machine: 'idle' → 'starting' → 'recording' ────
  //    setPointerCapture locks the pointer to the button so the
  //    recording does NOT cut when the finger drifts off the edge.
  //    pttStateRef guards the async getUserMedia gap (release-early).
  const handlePttDown = useCallback(async (e: React.PointerEvent, purpose: RecordPurpose) => {
    e.preventDefault();
    if (pttStateRef.current !== 'idle') return;

    // Lock pointer to this button — finger can move anywhere, only
    // a real pointerup/cancel on THIS element will stop the record.
    const targetEl = e.currentTarget as HTMLElement;
    const pid      = e.pointerId;
    try { targetEl.setPointerCapture(pid); } catch {}

    pttStateRef.current      = 'starting';
    recordPurposeRef.current = purpose;
    setError('');
    setMicPermissionDenied(false);

    if (purpose === 'question') {
      setTranscript('');
      setReply('');
      setAudioUrl('');
    } else {
      // Option A: voice-fill = FULL RESET. A spoken fill signals a
      // (possibly different) person on a shared phone. Wipe any
      // pre-filled localStorage data so old details never mix in.
      setForm({ name: '', dob: '', tob: '', pob: '' });
      setVoiceFilled(true);
      setFillStatus('idle');
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Browser microphone support नहीं है');
        setMicPermissionDenied(true);
        pttStateRef.current = 'idle';
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // User may have RELEASED during the await — abort cleanly.
      if (pttStateRef.current !== 'starting') {
        stream.getTracks().forEach(t => t.stop());
        pttStateRef.current = 'idle';
        return;
      }
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const options: MediaRecorderOptions = { audioBitsPerSecond: 128000 };
      if (mimeType) options.mimeType = mimeType;

      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (ev) => { if (ev.data?.size > 0) chunksRef.current.push(ev.data); };

      mr.onerror = () => {
        setError('Recording failed. Please try again.');
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        pttStateRef.current = 'idle';
      };

      mr.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });
        if (blob.size < 3000) {
          setError('Bahut chhota — button thoda zyada der dabaye rakhein aur saaf bolein.');
          if (recordPurposeRef.current === 'details') setFillStatus('idle');
          return;
        }
        if (recordPurposeRef.current === 'question') await processAudio(blob);
        else                                          await processDetailsAudio(blob);
      };

      mr.start(250);
      pttStateRef.current = 'recording';
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 59) {
            if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            pttStateRef.current = 'idle';
            setRecording(false);
            return 60;
          }
          return s + 1;
        });
      }, 1000);

    } catch (err: unknown) {
      const ex = err as DOMException;
      pttStateRef.current = 'idle';
      setMicPermissionDenied(true);
      if (ex.name === 'NotAllowedError' || ex.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Browser settings में microphone Allow करें।');
      } else if (ex.name === 'NotFoundError') {
        setError('कोई microphone नहीं मिला / No microphone found');
      } else {
        setError(`Microphone error: ${ex.message || 'Unknown'}`);
      }
    }
  }, []);

  // ── PTT: pointer UP / CANCEL → stop + submit ────────────────
  const handlePttUp = useCallback((e?: React.PointerEvent) => {
    // Release the pointer capture if we have it
    if (e) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    }

    // Released DURING startup (before recording actually began) →
    // mark idle; the down-handler's guard will tear down the stream.
    if (pttStateRef.current === 'starting') {
      pttStateRef.current = 'idle';
      return;
    }
    if (pttStateRef.current !== 'recording') return;

    pttStateRef.current = 'idle';
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); // → mr.onstop → process
    }
    setRecording(false);
  }, []);

  // ── Voice-fill: STT → parse → auto-fill form ────────────────
  const processDetailsAudio = async (blob: Blob) => {
    setFillStatus('parsing');
    try {
      // 1. OpenAI STT (accurate — same engine as questions)
      const fd = new FormData();
      fd.append('audio',     blob, 'details.webm');
      fd.append('sessionId', sessionIdRef.current);
      fd.append('language',  'hinglish');

      const sttRes = await fetch('/api/voice-transcribe', { method: 'POST', body: fd });
      if (!sttRes.ok) throw new Error('Sun nahi paaye — dobara bolein');
      const sttData = await sttRes.json();
      const spoken = sttData.transcription;
      if (!spoken) throw new Error('Kuch samajh nahi aaya — dobara try karein');

      // 2. Gemini parse → structured JSON
      const parseRes = await fetch('/api/voice-parse-details', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ transcript: spoken, sessionId: sessionIdRef.current }),
      });
      if (!parseRes.ok) throw new Error('Details nikaal nahi paaye — manually bhar dein');
      const { fields, filledCount } = await parseRes.json();

      // Fields were already cleared on voice-fill start (Option A),
      // so set spoken values directly. Anything not spoken stays ''
      // — user sees the blank and fills it. NO old data carries over.
      setForm({
        name: fields.name || '',
        dob : fields.dob  || '',
        tob : fields.tob  || '',
        pob : fields.pob  || '',
      });

      setFillStatus(filledCount >= 4 ? 'done' : 'partial');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice fill failed');
      setFillStatus('idle');
    }
  };

  // ── Process question audio (STT → Predict → TTS) ────────────
  const processAudio = async (audioBlob: Blob) => {
    setStage('processing');
    try {
      const fd = new FormData();
      fd.append('audio',     audioBlob, 'voice.webm');
      fd.append('sessionId', sessionIdRef.current);
      fd.append('language',  'hinglish');

      const sttRes = await fetch('/api/voice-transcribe', { method: 'POST', body: fd });
      if (!sttRes.ok) {
        const d = await sttRes.json().catch(() => ({}));
        throw new Error(d.error || 'Transcription failed');
      }
      const sttData = await sttRes.json();
      const userQuestion = sttData.transcription;
      if (!userQuestion) throw new Error('Could not understand audio. Please speak clearly.');
      setTranscript(userQuestion);

      const chatRes = await fetch('/api/voice-predict', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Vedic-Engine': 'Rohiit-Gupta-Vedic-Engine-v2' },
        body   : JSON.stringify({
          message  : userQuestion,
          mode     : 'voice',
          userName : form.name,
          birthData: { name: form.name, dob: form.dob, tob: form.tob, pob: form.pob },
          sessionId: sessionIdRef.current,
        }),
      });
      if (!chatRes.ok) throw new Error('Prediction failed');
      const chatData    = await chatRes.json();
      const trikalReply = chatData.prediction || chatData.reply || chatData.text || '';
      if (!trikalReply) throw new Error('Empty prediction');
      setReply(trikalReply);

      const ttsRes = await fetch('/api/voice-tts', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ text: trikalReply, sessionId: sessionIdRef.current, packId: activePack?.id || 'p11' }),
      });
      let finalAudioUrl = '';
      if (ttsRes.ok) {
        const b = await ttsRes.blob();
        finalAudioUrl = URL.createObjectURL(b);
        setAudioUrl(finalAudioUrl);
      }

      await fetch('/api/voice-pack-order', {
        method : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ sessionId: sessionIdRef.current, action: 'consume' }),
      });
      const newBal = Math.max(0, balance - 1);
      setBalance(newBal);
      localStorage.setItem('trikal_voice_balance', String(newBal));

      setStage('reply');
      if (finalAudioUrl) setTimeout(() => { new Audio(finalAudioUrl).play().catch(() => {}); }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStage('record');
    }
  };

  // ── Payment ──────────────────────────────────────────────────
  const handleBuyPack = async (pack: Pack) => {
    setError('');
    setActivePack(pack);
    try {
      const orderRes = await fetch('/api/voice-pack-order', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ packId: pack.id, sessionId: sessionIdRef.current }),
      });
      if (!orderRes.ok) throw new Error('Order creation failed');
      const order = await orderRes.json();

      const rzp = new window.Razorpay({
        key        : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount     : pack.price * 100,
        currency   : 'INR',
        name       : 'Trikaal Vaani',
        description: pack.label,
        order_id   : order.orderId,
        theme      : { color: GOLD },
        handler    : async (response: Record<string, string>) => {
          const verifyRes = await fetch('/api/verify-voice-pack', {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({ ...response, packId: pack.id, sessionId: sessionIdRef.current }),
          });
          if (!verifyRes.ok) { setError('Payment verification failed. Contact support.'); return; }
          const verified = await verifyRes.json();
          setBalance(verified.balance);
          setValidUntil(verified.validUntil);
          localStorage.setItem('trikal_voice_balance',     String(verified.balance));
          localStorage.setItem('trikal_voice_valid_until', verified.validUntil);
          setStage('form');
        },
        modal  : { ondismiss: () => setError('Payment cancelled') },
        prefill: { name: form.name },
      });
      rzp.open();
    } catch {
      setError('Could not start payment. Please try again.');
    }
  };

  const handleOpen = () => {
    if (balance > 0 && new Date(validUntil) > new Date()) setStage('form');
    else setStage('pricing');
  };

  const handleFormSubmit = () => {
    if (!form.name || !form.dob || !form.tob || !form.pob) {
      setError('कृपया सभी details भरें / Please fill all details');
      return;
    }
    localStorage.setItem('trikal_voice_form', JSON.stringify(form));
    setError('');
    setFillStatus('idle');
    setVoiceFilled(false);
    setStage('record');
  };

  const handleAskAnother = () => {
    setTranscript(''); setReply(''); setAudioUrl(''); setError('');
    if (balance > 0) setStage('record');
    else setStage('pricing');
  };

  const handleClose = () => {
    handlePttUp();
    stopStream();
    setStage('closed');
    setError('');
    setFillStatus('idle');
    setVoiceFilled(false);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  if (stage === 'closed') {
    return (
      <>
        <button
          onClick={handleOpen}
          aria-label="Open Trikaal Voice — Ask Vedic astrology by voice"
          className="fixed bottom-6 right-6 flex items-center gap-3"
          style={{
            zIndex      : 9998,
            background  : `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT})`,
            borderRadius: '999px',
            padding     : '14px 22px 14px 18px',
            boxShadow   : `0 8px 32px ${GOLD_DARK}66, 0 0 0 2px ${GOLD}33`,
            border      : 'none',
            cursor      : 'pointer',
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
          <span style={{ color: BG_DARK, fontWeight: 700, fontSize: 14 }}>
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

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Trikaal Voice Prediction"
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          background: BG_CARD,
          border    : `1px solid ${GOLD}55`,
          boxShadow : `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${GOLD}33`,
          maxHeight : '95vh',
          overflowY : 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${GOLD}22` }}>
          <div>
            <h2 style={{ color: GOLD, fontSize: 18, fontWeight: 700, margin: 0 }}>त्रिकाल वाणी</h2>
            <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>Voice Prediction by Trikaal</p>
          </div>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'transparent', color: GOLD, fontSize: 28, cursor: 'pointer', border: 'none', padding: 0, lineHeight: 1 }}>×</button>
        </div>

        <div className="px-5 py-5">

          {/* ── PRICING ── */}
          {stage === 'pricing' && (
            <>
              <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
                ₹11 में अपनी आवाज़ से सवाल पूछें — Trikaal अपनी आवाज़ में जवाब देंगे।
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PACKS.map(pack => (
                  <button
                    key={pack.id}
                    onClick={() => handleBuyPack(pack)}
                    style={{
                      background  : `linear-gradient(135deg, ${GOLD_DARK}22, ${GOLD}11)`,
                      border      : `1px solid ${GOLD}55`,
                      borderRadius: 12,
                      padding     : '14px 16px',
                      textAlign   : 'left',
                      cursor      : 'pointer',
                      color       : '#fff',
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
              {error && <p style={errorStyle}>{error}</p>}
            </>
          )}

          {/* ── FORM (with voice-fill) ── */}
          {stage === 'form' && (
            <>
              <p style={{ color: '#fff', fontSize: 13, marginBottom: 12 }}>
                Trikaal को आपकी जन्म details चाहिए — accuracy के लिए।
                {balance > 0 && (
                  <span style={{ color: GOLD, fontSize: 12, display: 'block', marginTop: 4 }}>
                    Balance: {balance} question{balance > 1 ? 's' : ''} remaining
                  </span>
                )}
              </p>

              {/* Voice-fill card */}
              <div style={{
                background  : `linear-gradient(135deg, ${GOLD_DARK}1a, ${GOLD}0d)`,
                border      : `1px dashed ${GOLD}66`,
                borderRadius: 12,
                padding     : '14px',
                marginBottom: 16,
                textAlign   : 'center',
              }}>
                {/* Instructional text — switches by state, but the BUTTON below stays mounted */}
                {!recording && fillStatus !== 'parsing' && (
                  <>
                    <p style={{ color: GOLD, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                      🎙️ टाइप नहीं करना? बोलकर भरें
                    </p>
                    <p style={{ color: '#aaa', fontSize: 11, marginBottom: 12 }}>
                      Button दबाकर रखें और बोलें: नाम, जन्म तारीख, समय, और जगह
                    </p>
                  </>
                )}
                {recording && recordPurposeRef.current === 'details' && (
                  <p style={{ color: GOLD, fontSize: 13, marginBottom: 12, animation: 'trikalFade 1.5s ease-in-out infinite' }}>
                    🎙️ सुन रहे हैं... बोलते रहें ({String(seconds).padStart(2, '0')}s)
                  </p>
                )}

                {/* SINGLE persistent button — never unmounts while held,
                    so setPointerCapture + release work reliably. */}
                {fillStatus !== 'parsing' && (
                  <button
                    onPointerDown={(e) => handlePttDown(e, 'details')}
                    onPointerUp={(e) => handlePttUp(e)}
                    onPointerCancel={(e) => handlePttUp(e)}
                    onLostPointerCapture={() => handlePttUp()}
                    aria-label={recording ? 'Release to fill details' : 'Hold to speak your birth details'}
                    style={{
                      width: 64, height: 64, borderRadius: '50%', margin: '0 auto',
                      background: (recording && recordPurposeRef.current === 'details')
                        ? 'radial-gradient(circle, #c0392b, #922b21)'
                        : `radial-gradient(circle, ${GOLD}, ${GOLD_DARK})`,
                      border: (recording && recordPurposeRef.current === 'details')
                        ? '3px solid #e74c3c'
                        : `3px solid ${GOLD_LIGHT}`,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: (recording && recordPurposeRef.current === 'details')
                        ? '0 0 0 8px rgba(192,57,43,0.25)'
                        : `0 0 0 5px ${GOLD}22`,
                      animation: (recording && recordPurposeRef.current === 'details')
                        ? 'trikalPulseRed 0.8s ease-in-out infinite' : 'none',
                      userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                      stroke={(recording && recordPurposeRef.current === 'details') ? '#fff' : BG_DARK}
                      strokeWidth="2.2" style={{ pointerEvents: 'none' }}>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>
                )}

                {!recording && fillStatus !== 'parsing' && (
                  <p style={{ color: '#666', fontSize: 10, marginTop: 8 }}>
                    e.g. &quot;मेरा नाम रोहित है, 15 अगस्त 1990, सुबह साढ़े पाँच बजे, दिल्ली&quot;
                  </p>
                )}
                {recording && recordPurposeRef.current === 'details' && (
                  <p style={{ color: '#888', fontSize: 10, marginTop: 8 }}>Release करें जब बोल चुकें</p>
                )}

                {fillStatus === 'parsing' && (
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ width: 32, height: 32, margin: 'auto', border: `3px solid ${GOLD}33`, borderTopColor: GOLD, borderRadius: '50%', animation: 'trikalSpin 1s linear infinite' }} />
                    <p style={{ color: '#fff', fontSize: 12, marginTop: 10 }}>Details समझ रहे हैं...</p>
                  </div>
                )}

                {fillStatus === 'done' && (
                  <p style={{ color: '#2ecc71', fontSize: 12, fontWeight: 600 }}>
                    ✓ भर दिया — नीचे check करें और ज़रूरत हो तो ठीक करें
                  </p>
                )}
                {fillStatus === 'partial' && (
                  <p style={{ color: GOLD, fontSize: 12, fontWeight: 600 }}>
                    कुछ details भर दीं — बाकी नीचे खुद भरें या दोबारा बोलें
                  </p>
                )}
              </div>

              {/* Manual / verify form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Your Name / आपका नाम</label>
                  <input type="text" placeholder="e.g. Rohit Gupta" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth / जन्म तिथि</label>
                  <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Time of Birth / जन्म समय</label>
                  <input type="time" value={form.tob} onChange={e => setForm({ ...form, tob: e.target.value })} style={inputStyle} />
                  <span style={hintStyle}>Approx time also OK / लगभग समय भी ठीक है</span>
                </div>
                <div>
                  <label style={labelStyle}>Place of Birth / जन्म स्थान</label>
                  <input type="text" placeholder="e.g. Delhi, India" value={form.pob} onChange={e => setForm({ ...form, pob: e.target.value })} style={inputStyle} />
                </div>
                {voiceFilled && (
                  <p style={{ color: GOLD, fontSize: 11, textAlign: 'center', lineHeight: 1.5, marginTop: 2 }}>
                    ⚠️ Confirm karein: ye details <strong>aapki apni</strong> hain?
                    <br/>
                    <span style={{ color: '#999' }}>Galat janm-details = galat bhavishyavani.</span>
                  </p>
                )}
                <button onClick={handleFormSubmit} style={primaryBtnStyle}>Continue → Record</button>
                {error && <p style={errorStyle}>{error}</p>}
              </div>
            </>
          )}

          {/* ── RECORD — question PTT ── */}
          {stage === 'record' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>

              {!recording && !micPermissionDenied && (
                <>
                  <p style={{ color: '#ccc', fontSize: 13, marginBottom: 4 }}>
                    नीचे button को <strong style={{ color: GOLD }}>दबाकर रखें</strong> और बोलते रहें
                  </p>
                  <p style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>
                    Hold the button while speaking — release to submit
                  </p>
                  <p style={{ color: '#666', fontSize: 10, marginBottom: 22 }}>
                    (जैसे WhatsApp voice message)
                  </p>
                </>
              )}

              {recording && recordPurposeRef.current === 'question' && (
                <>
                  <p style={{ color: GOLD, fontSize: 13, marginBottom: 6, animation: 'trikalFade 1.5s ease-in-out infinite' }}>
                    🎙️ Trikaal सुन रहे हैं... बोलते रहें
                  </p>
                  <p style={{ color: '#888', fontSize: 11, marginBottom: 10 }}>Release button when done</p>
                  <div style={{ fontSize: 44, fontWeight: 700, color: GOLD, fontVariantNumeric: 'tabular-nums', marginBottom: 20 }}>
                    {String(seconds).padStart(2, '0')}s
                  </div>
                </>
              )}

              {!micPermissionDenied && (
                <button
                  onPointerDown={(e) => handlePttDown(e, 'question')}
                  onPointerUp={(e) => handlePttUp(e)}
                  onPointerCancel={(e) => handlePttUp(e)}
                  onLostPointerCapture={() => handlePttUp()}
                  aria-label={recording ? 'Release to submit' : 'Hold to record'}
                  style={{
                    width: 104, height: 104, borderRadius: '50%', cursor: 'pointer',
                    background: recording
                      ? 'radial-gradient(circle, #c0392b, #922b21)'
                      : `radial-gradient(circle, ${GOLD}, ${GOLD_DARK})`,
                    border: recording ? '4px solid #e74c3c' : `4px solid ${GOLD_LIGHT}`,
                    boxShadow: recording
                      ? '0 0 0 10px rgba(192,57,43,0.25), 0 8px 32px rgba(192,57,43,0.4)'
                      : `0 0 0 8px ${GOLD}22, 0 8px 32px ${GOLD_DARK}66`,
                    animation: recording ? 'trikalPulseRed 0.8s ease-in-out infinite' : 'trikalPulse 2s ease-in-out infinite',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                    userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
                    transition: 'background 0.15s ease, border 0.15s ease',
                  }}
                >
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={recording ? '#fff' : BG_DARK} strokeWidth="2.2" style={{ pointerEvents: 'none' }}>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8"  y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
              )}

              <p style={{ color: '#555', fontSize: 10, marginTop: 16 }}>Max 60 seconds</p>

              {micPermissionDenied && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c44', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                    <p style={{ color: '#e74c3c', fontSize: 13, margin: 0 }}>{error}</p>
                  </div>
                  <p style={{ color: '#bbb', fontSize: 12, marginBottom: 14 }}>
                    Address bar के बगल में 🔒 tap करें → Site Settings → Microphone → Allow
                  </p>
                  <button onClick={() => { setMicPermissionDenied(false); setError(''); }} style={primaryBtnStyle}>Try Again</button>
                </div>
              )}

              {error && !micPermissionDenied && <p style={errorStyle}>{error}</p>}
            </div>
          )}

          {/* ── PROCESSING ── */}
          {stage === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 56, height: 56, margin: 'auto', border: `3px solid ${GOLD}33`, borderTopColor: GOLD, borderRadius: '50%', animation: 'trikalSpin 1s linear infinite' }} />
              <p style={{ color: '#fff', fontSize: 13, marginTop: 18 }}>Trikaal आपके सवाल पर ध्यान कर रहे हैं...</p>
              {transcript && <p style={{ color: '#888', fontSize: 11, marginTop: 12, fontStyle: 'italic' }}>&quot;{transcript}&quot;</p>}
            </div>
          )}

          {/* ── REPLY ── */}
          {stage === 'reply' && (
            <>
              {transcript && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>आपका सवाल</div>
                  <div style={{ color: '#bbb', fontSize: 13, marginTop: 4, fontStyle: 'italic' }}>&quot;{transcript}&quot;</div>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${GOLD}33`, paddingTop: 14 }}>
                <div style={{ color: GOLD, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>त्रिकाल का उत्तर</div>
                <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.7 }}>{reply}</p>
              </div>
              {audioUrl && <audio controls src={audioUrl} style={{ width: '100%', marginTop: 14 }} />}
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
          0%, 100% { box-shadow: 0 0 0 8px ${GOLD}22, 0 8px 32px ${GOLD_DARK}66; }
          50%      { box-shadow: 0 0 0 18px ${GOLD}00, 0 8px 32px ${GOLD_DARK}66; }
        }
        @keyframes trikalPulseRed {
          0%, 100% { box-shadow: 0 0 0 10px rgba(192,57,43,0.25), 0 8px 32px rgba(192,57,43,0.4); }
          50%      { box-shadow: 0 0 0 22px rgba(192,57,43,0),    0 8px 32px rgba(192,57,43,0.4); }
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

const labelStyle: React.CSSProperties = {
  display: 'block', color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: 0.3,
};
const hintStyle: React.CSSProperties = {
  display: 'block', color: '#777', fontSize: 10, marginTop: 4, fontStyle: 'italic',
};
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${GOLD}33`,
  color: '#fff', padding: '11px 14px', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const primaryBtnStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: BG_DARK, border: 'none',
  padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%',
};
const secondaryBtnStyle: React.CSSProperties = {
  background: 'transparent', color: GOLD, border: `1px solid ${GOLD}66`,
  padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
const errorStyle: React.CSSProperties = {
  color: '#e74c3c', fontSize: 12, marginTop: 12, padding: 10,
  background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c44', borderRadius: 6,
};
