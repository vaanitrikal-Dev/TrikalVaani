'use client';

/**
 * ============================================================
 * TRIKAL VAANI — Jini Voice Widget
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/jini/JiniVoice.tsx
 * VERSION: 1.0 — Floating Voice Widget (RIGHT side)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * FEATURES:
 *   → Floating RIGHT side widget (separate from JiniChat)
 *   → Dynamic rotating taglines (8 taglines, fade animation)
 *   → Compelling cosmic mic icon with pulse animation
 *   → 60 second recording with countdown timer
 *   → "Jini sun rahi hai..." live animation during recording
 *   → Auto-submit at 60s or manual stop
 *   → Language: Hindi / Hinglish / English (user selected)
 *   → Mobile: bottom sheet | Desktop: floating card
 *
 * TAGLINES (rotate every 3 seconds):
 *   "Kuch dil ki baatein type nahi ki jaati"
 *   "Bol do Jini ko — woh sun rahi hai"
 *   "Dil ki baat — sirf ek minute mein"
 *   + 5 more rotating taglines
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const GOLD        = '#D4AF37';
const GOLD_LIGHT  = '#F5D76E';
const GOLD_DARK   = '#A8820A';
const BG_DARK     = '#080B12';
const BG_CARD     = 'rgba(8,11,18,0.97)';

// Dynamic rotating taglines — emotional hooks
const TAGLINES = [
  'Kuch dil ki baatein type nahi ki jaati',
  'Bol do Jini ko — woh sun rahi hai',
  'Dil ki baat — sirf ek minute mein',
  'Jini sun rahi hai — bas shuru karo',
  'Jo dil mein hai — woh bol do',
  'Apni awaaz, apni kahani — Jini ke saath',
  'Type mat karo — feel karo',
  'Ek minute — aur Jini samjh jayegi',
];

const RECORDING_STATES = {
  idle:       'idle',
  recording:  'recording',
  processing: 'processing',
  done:       'done',
} as const;

type RecordingState = typeof RECORDING_STATES[keyof typeof RECORDING_STATES];

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface JiniVoiceProps {
  onVoiceSubmit?: (transcription: string, audioBlob: Blob) => void;
  language?:      'hindi' | 'hinglish' | 'english';
}

// ─── COSMIC MIC ICON ─────────────────────────────────────────────────────────

function CosmicMicIcon({ isRecording, size = 28 }: { isRecording: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mic body */}
      <rect
        x="9" y="2" width="10" height="16"
        rx="5"
        fill={isRecording ? '#ef4444' : GOLD}
        style={{ transition: 'fill 0.3s ease' }}
      />
      {/* Mic detail line */}
      <rect x="11" y="7" width="6" height="1.5" rx="0.75" fill={BG_DARK} opacity="0.4" />
      <rect x="11" y="10" width="6" height="1.5" rx="0.75" fill={BG_DARK} opacity="0.4" />

      {/* Mic stand arc */}
      <path
        d="M6 14 C6 20 22 20 22 14"
        stroke={isRecording ? '#ef4444' : GOLD}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={{ transition: 'stroke 0.3s ease' }}
      />
      {/* Stand pole */}
      <line x1="14" y1="20" x2="14" y2="25" stroke={isRecording ? '#ef4444' : GOLD} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 0.3s ease' }} />
      {/* Base */}
      <line x1="9" y1="25" x2="19" y2="25" stroke={isRecording ? '#ef4444' : GOLD} strokeWidth="2" strokeLinecap="round" style={{ transition: 'stroke 0.3s ease' }} />

      {/* Cosmic sparkle top */}
      <circle cx="14" cy="1.5" r="1.5" fill={GOLD_LIGHT} opacity="0.8" />
      <circle cx="25" cy="6" r="1" fill={GOLD_LIGHT} opacity="0.5" />
      <circle cx="3" cy="8" r="1" fill={GOLD_LIGHT} opacity="0.5" />
    </svg>
  );
}

// ─── SOUND WAVE ANIMATION ──────────────────────────────────────────────────

function SoundWave({ active }: { active: boolean }) {
  const bars = [3, 5, 8, 5, 3, 7, 4, 6, 3, 5];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: active ? `${h + Math.random() * 8}px` : '3px',
            background: `linear-gradient(to top, ${GOLD_DARK}, ${GOLD_LIGHT})`,
            borderRadius: '2px',
            transition: active ? 'none' : 'height 0.3s ease',
            animation: active ? `waveBar${i % 3} ${0.4 + i * 0.1}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar0 { from { height: 4px; } to { height: 18px; } }
        @keyframes waveBar1 { from { height: 8px; } to { height: 22px; } }
        @keyframes waveBar2 { from { height: 6px; } to { height: 14px; } }
      `}</style>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function JiniVoice({ onVoiceSubmit, language = 'hinglish' }: JiniVoiceProps) {
  const [isOpen,          setIsOpen]         = useState(false);
  const [recordingState,  setRecordingState]  = useState<RecordingState>('idle');
  const [countdown,       setCountdown]       = useState(60);
  const [currentTagline,  setCurrentTagline]  = useState(0);
  const [taglineFading,   setTaglineFading]   = useState(false);
  const [transcript,      setTranscript]      = useState('');
  const [isMobile,        setIsMobile]        = useState(false);
  const [pulseRing,       setPulseRing]       = useState(false);

  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const chunksRef         = useRef<Blob[]>([]);
  const countdownRef      = useRef<NodeJS.Timeout | null>(null);
  const taglineRef        = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Rotating taglines — fade in/out every 3.5s
  useEffect(() => {
    const rotate = () => {
      setTaglineFading(true);
      setTimeout(() => {
        setCurrentTagline(prev => (prev + 1) % TAGLINES.length);
        setTaglineFading(false);
      }, 500);
    };
    taglineRef.current = setInterval(rotate, 3500);
    return () => { if (taglineRef.current) clearInterval(taglineRef.current); };
  }, []);

  // Pulse ring animation on idle
  useEffect(() => {
    const pulse = setInterval(() => {
      setPulseRing(true);
      setTimeout(() => setPulseRing(false), 1000);
    }, 3000);
    return () => clearInterval(pulse);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        setRecordingState('processing');

        // Simulate STT transcription (will be replaced with Google STT)
        setTimeout(() => {
          const mockTranscript = 'Voice input captured — processing with Jini...';
          setTranscript(mockTranscript);
          setRecordingState('done');
          if (onVoiceSubmit) onVoiceSubmit(mockTranscript, audioBlob);
        }, 1500);
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setCountdown(60);

      // 60 second countdown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Microphone access needed. Please allow mic permission and try again.');
    }
  }, [onVoiceSubmit]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Reset
  const reset = () => {
    setRecordingState('idle');
    setCountdown(60);
    setTranscript('');
  };

  const isRecording   = recordingState === 'recording';
  const isProcessing  = recordingState === 'processing';
  const isDone        = recordingState === 'done';

  // ── FLOATING TRIGGER BUTTON ──────────────────────────────────────────────

  const TriggerButton = () => (
    <button
      onClick={() => setIsOpen(true)}
      style={{
        position:     'fixed',
        right:        '20px',
        bottom:       isMobile ? '90px' : '100px',
        width:        '60px',
        height:       '60px',
        borderRadius: '50%',
        background:   `linear-gradient(135deg, ${GOLD_DARK} 0%, ${GOLD} 50%, ${GOLD_LIGHT} 100%)`,
        border:       'none',
        cursor:       'pointer',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        boxShadow:    `0 0 20px rgba(212,175,55,0.5), 0 4px 20px rgba(0,0,0,0.4)`,
        zIndex:       999,
        transition:   'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 35px rgba(212,175,55,0.7), 0 4px 25px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px rgba(212,175,55,0.5), 0 4px 20px rgba(0,0,0,0.4)`;
      }}
      title="Jini se baat karo 🎙️"
    >
      {/* Pulse ring */}
      {pulseRing && (
        <div style={{
          position:     'absolute',
          width:        '60px',
          height:       '60px',
          borderRadius: '50%',
          border:       `2px solid ${GOLD}`,
          animation:    'pulseRingAnim 1s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}
      <CosmicMicIcon isRecording={false} size={28} />
      <style>{`
        @keyframes pulseRingAnim {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </button>
  );

  // ── TAGLINE TOOLTIP (shows on hover near button) ──────────────────────────

  const TaglineTooltip = () => (
    <div style={{
      position:     'fixed',
      right:        '88px',
      bottom:       isMobile ? '105px' : '115px',
      background:   BG_CARD,
      border:       `1px solid rgba(212,175,55,0.3)`,
      borderRadius: '12px',
      padding:      '8px 14px',
      zIndex:       998,
      maxWidth:     '220px',
      backdropFilter: 'blur(10px)',
      boxShadow:    '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      {/* Arrow */}
      <div style={{
        position:    'absolute',
        right:       '-6px',
        top:         '50%',
        transform:   'translateY(-50%)',
        width:       '12px',
        height:      '12px',
        background:  BG_CARD,
        border:      `1px solid rgba(212,175,55,0.3)`,
        borderLeft:  'none',
        borderBottom: 'none',
        transform:   'translateY(-50%) rotate(45deg)',
      }} />
      <p style={{
        color:      GOLD,
        fontSize:   '11px',
        fontWeight: 600,
        margin:     0,
        opacity:    taglineFading ? 0 : 1,
        transition: 'opacity 0.5s ease',
        lineHeight: 1.4,
      }}>
        🎙️ {TAGLINES[currentTagline]}
      </p>
    </div>
  );

  // ── VOICE PANEL ───────────────────────────────────────────────────────────

  const VoicePanel = () => (
    <div style={{
      position:     'fixed',
      right:        '20px',
      bottom:       isMobile ? '0' : '100px',
      width:        isMobile ? '100vw' : '320px',
      maxHeight:    isMobile ? '85vh' : 'auto',
      background:   BG_CARD,
      borderRadius: isMobile ? '24px 24px 0 0' : '20px',
      border:       `1px solid rgba(212,175,55,0.25)`,
      boxShadow:    `0 0 60px rgba(212,175,55,0.15), 0 20px 60px rgba(0,0,0,0.6)`,
      zIndex:       1000,
      overflow:     'hidden',
      backdropFilter: 'blur(20px)',
      animation:    'slideUp 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)`,
        borderBottom: `1px solid rgba(212,175,55,0.15)`,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Jini avatar orb */}
          <div style={{
            width:        '36px',
            height:       '36px',
            borderRadius: '50%',
            background:   `radial-gradient(circle at 35% 35%, ${GOLD_LIGHT}, ${GOLD_DARK})`,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            boxShadow:    `0 0 12px rgba(212,175,55,0.4)`,
            fontSize:     '16px',
            animation:    isRecording ? 'breathe 1s ease-in-out infinite' : 'none',
          }}>
            🔮
          </div>
          <div>
            <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Jini Voice
            </p>
            <p style={{ margin: 0, color: `rgba(212,175,55,0.7)`, fontSize: '10px', fontWeight: 500, letterSpacing: '0.05em' }}>
              {isRecording ? 'SUN RAHI HAI... 🎙️' : isProcessing ? 'SAMAJH RAHI HAI...' : isDone ? 'HO GAYA ✓' : 'TRIKAL VAANI'}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setIsOpen(false); reset(); }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border:     '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color:      '#94a3b8',
            cursor:     'pointer',
            padding:    '4px 10px',
            fontSize:   '12px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 20px' }}>

        {/* Rotating tagline */}
        <p style={{
          textAlign:  'center',
          color:      GOLD,
          fontSize:   '13px',
          fontWeight: 600,
          fontStyle:  'italic',
          margin:     '0 0 20px',
          opacity:    taglineFading ? 0 : 1,
          transition: 'opacity 0.5s ease',
          minHeight:  '36px',
          lineHeight: 1.4,
        }}>
          "{TAGLINES[currentTagline]}"
        </p>

        {/* Main recording area */}
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          gap:            '20px',
          marginBottom:   '24px',
        }}>

          {/* Big mic button */}
          {!isDone && !isProcessing && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width:        '100px',
                height:       '100px',
                borderRadius: '50%',
                background:   isRecording
                  ? 'radial-gradient(circle, #dc2626 0%, #991b1b 100%)'
                  : `radial-gradient(circle, ${GOLD_LIGHT} 0%, ${GOLD_DARK} 100%)`,
                border:       'none',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                boxShadow:    isRecording
                  ? '0 0 40px rgba(220,38,38,0.5), 0 0 80px rgba(220,38,38,0.2)'
                  : `0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.15)`,
                transition:   'all 0.3s ease',
                position:     'relative',
              }}
            >
              {/* Outer pulse rings when recording */}
              {isRecording && (
                <>
                  <div style={{
                    position:     'absolute',
                    width:        '100%',
                    height:       '100%',
                    borderRadius: '50%',
                    border:       '2px solid rgba(220,38,38,0.4)',
                    animation:    'pulseRingAnim 1.5s ease-out infinite',
                  }} />
                  <div style={{
                    position:     'absolute',
                    width:        '100%',
                    height:       '100%',
                    borderRadius: '50%',
                    border:       '2px solid rgba(220,38,38,0.2)',
                    animation:    'pulseRingAnim 1.5s ease-out infinite 0.5s',
                  }} />
                </>
              )}
              <CosmicMicIcon isRecording={isRecording} size={42} />
            </button>
          )}

          {/* Processing spinner */}
          {isProcessing && (
            <div style={{
              width:        '100px',
              height:       '100px',
              borderRadius: '50%',
              background:   `radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)`,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              position:     'relative',
            }}>
              <div style={{
                position:     'absolute',
                width:        '90px',
                height:       '90px',
                borderRadius: '50%',
                border:       `2px solid transparent`,
                borderTop:    `2px solid ${GOLD}`,
                animation:    'spinSlow 1s linear infinite',
              }} />
              <span style={{ fontSize: '32px' }}>🔮</span>
            </div>
          )}

          {/* Done state */}
          {isDone && (
            <div style={{
              width:           '100px',
              height:          '100px',
              borderRadius:    '50%',
              background:      'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              border:          '2px solid rgba(34,197,94,0.3)',
              boxShadow:       '0 0 30px rgba(34,197,94,0.2)',
            }}>
              <span style={{ fontSize: '42px' }}>✓</span>
            </div>
          )}

          {/* Sound wave (during recording) */}
          {isRecording && <SoundWave active={true} />}

          {/* Countdown */}
          {isRecording && (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color:      countdown <= 10 ? '#ef4444' : GOLD,
                fontSize:   '28px',
                fontWeight: 800,
                margin:     0,
                fontFamily: 'Georgia, serif',
                transition: 'color 0.3s',
              }}>
                {countdown}s
              </p>
              <p style={{ color: '#64748b', fontSize: '11px', margin: '4px 0 0' }}>
                baat karo — Jini sun rahi hai
              </p>
            </div>
          )}

          {/* Status messages */}
          {recordingState === 'idle' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                🎙️ Mic button dabao aur apni baat kaho
              </p>
              <p style={{ color: '#475569', fontSize: '11px', margin: '4px 0 0' }}>
                Max 1 minute · Hindi / Hinglish / English
              </p>
            </div>
          )}

          {isProcessing && (
            <p style={{ color: GOLD, fontSize: '13px', margin: 0, textAlign: 'center', fontStyle: 'italic' }}>
              Jini aapki baat samajh rahi hai...
            </p>
          )}

          {isDone && (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <p style={{ color: '#22c55e', fontSize: '13px', margin: '0 0 12px', fontWeight: 600 }}>
                ✓ Jini ne sun liya!
              </p>
              {transcript && (
                <div style={{
                  background:   'rgba(255,255,255,0.04)',
                  border:       '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding:      '10px 12px',
                  marginBottom: '12px',
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
                    {transcript}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {isRecording && (
            <button
              onClick={stopRecording}
              style={{
                flex:         1,
                padding:      '12px',
                background:   'rgba(239,68,68,0.1)',
                border:       '1px solid rgba(239,68,68,0.3)',
                borderRadius: '12px',
                color:        '#ef4444',
                fontSize:     '13px',
                fontWeight:   600,
                cursor:       'pointer',
              }}
            >
              ⏹ Roko
            </button>
          )}

          {isDone && (
            <>
              <button
                onClick={reset}
                style={{
                  flex:         1,
                  padding:      '12px',
                  background:   'rgba(255,255,255,0.04)',
                  border:       '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color:        '#94a3b8',
                  fontSize:     '13px',
                  cursor:       'pointer',
                }}
              >
                🔄 Dobara
              </button>
              <button
                style={{
                  flex:         2,
                  padding:      '12px',
                  background:   `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT})`,
                  border:       'none',
                  borderRadius: '12px',
                  color:        BG_DARK,
                  fontSize:     '13px',
                  fontWeight:   700,
                  cursor:       'pointer',
                }}
              >
                🔮 Jini se jawab lo
              </button>
            </>
          )}
        </div>

        {/* Bottom CTA — spiritual */}
        <div style={{
          marginTop:    '20px',
          paddingTop:   '16px',
          borderTop:    '1px solid rgba(255,255,255,0.06)',
          textAlign:    'center',
        }}>
          <p style={{
            color:      `rgba(212,175,55,0.6)`,
            fontSize:   '11px',
            margin:     0,
            lineHeight: 1.5,
          }}>
            🔱 Maa Shakti ka ashirwad har awaaz mein hai
          </p>
          <p style={{
            color:    '#334155',
            fontSize: '10px',
            margin:   '4px 0 0',
          }}>
            trikalvaani.com · Rohiit Gupta, Chief Vedic Architect
          </p>
        </div>
      </div>
    </div>
  );

  // ── RENDER ─────────────────────────────────────────────────────────────────

  if (isOpen) {
    return (
      <>
        {/* Backdrop on mobile */}
        {isMobile && (
          <div
            onClick={() => { setIsOpen(false); reset(); }}
            style={{
              position:   'fixed',
              inset:      0,
              background: 'rgba(0,0,0,0.5)',
              zIndex:     999,
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
        <VoicePanel />
      </>
    );
  }

  return (
    <>
      <TaglineTooltip />
      <TriggerButton />
    </>
  );
}
