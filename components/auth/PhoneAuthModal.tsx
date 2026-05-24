'use client';

// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: components/auth/PhoneAuthModal.tsx
// VERSION: v1.0
// DATE: 2026-05-24
// PURPOSE:
//   Mobile OTP login modal. Two steps:
//   Step 1 — Enter mobile number → Send OTP
//   Step 2 — Enter 6-digit OTP → Verify → logged in
//   After success: returns user to SAME page (same as Gmail login).
//   Uses invisible reCAPTCHA (required by Firebase, user never sees it).
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { X, Phone, ArrowRight, RotateCcw } from 'lucide-react';
import {
  setupRecaptcha,
  sendOtp,
  verifyOtpAndSync,
} from '@/lib/firebase-auth';
import type { ConfirmationResult } from 'firebase/auth';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface PhoneAuthModalProps {
  onClose: () => void;
  onSuccess: (mobile: string) => void;
}

export default function PhoneAuthModal({ onClose, onSuccess }: PhoneAuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [countdown]);

  const handleSendOtp = async () => {
    setError('');
    const cleaned = phone.trim().replace(/\s/g, '');
    if (!cleaned || cleaned.length < 10) {
      setError('Please enter a valid mobile number.');
      return;
    }

    // Add +91 if no country code given
    const fullPhone = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;

    setLoading(true);
    try {
      const verifier = setupRecaptcha('tv-recaptcha-container');
      const result = await sendOtp(fullPhone, verifier);
      confirmationRef.current = result;
      setStep('otp');
      setCountdown(30); // 30 second resend cooldown
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    if (!confirmationRef.current) {
      setError('Session expired. Please go back and resend OTP.');
      return;
    }

    setLoading(true);
    try {
      const { success, mobile, error: syncError } = await verifyOtpAndSync(
        confirmationRef.current,
        otp
      );
      if (!success) {
        setError(syncError ?? 'Invalid OTP. Please try again.');
        return;
      }
      onSuccess(mobile ?? phone);
    } catch (err: any) {
      setError(err?.message ?? 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp('');
    setError('');
    setStep('phone');
    setCountdown(0);
    confirmationRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,23,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Invisible reCAPTCHA container — Firebase requires this div */}
      <div id="tv-recaptcha-container" style={{ display: 'none' }} />

      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(11,16,26,0.97)',
          border: `1px solid ${GOLD_RGBA(0.25)}`,
          boxShadow: `0 0 80px ${GOLD_RGBA(0.12)}`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${GOLD_RGBA(0.12)}` }}
        >
          <div>
            <p className="font-serif font-bold text-white">
              {step === 'phone' ? 'Login with Mobile' : 'Enter OTP'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 'phone'
                ? 'We will send a 6-digit code to your number'
                : `OTP sent to +91 ${phone}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === 'phone' ? (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Mobile Number</label>
                <div className="relative">
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                    style={{ color: GOLD }}
                  >
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9211804111"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                    }}
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-3 py-2.5 text-xs text-red-300"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading || phone.length < 10}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                  color: '#080B12',
                }}
              >
                <Phone className="w-4 h-4" />
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">6-Digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-3 rounded-xl text-center text-xl font-bold text-white placeholder:text-slate-700 outline-none tracking-widest"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${GOLD_RGBA(0.15)}`,
                    letterSpacing: '0.5em',
                  }}
                  maxLength={6}
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-xl px-3 py-2.5 text-xs text-red-300"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                  color: '#080B12',
                }}
              >
                <ArrowRight className="w-4 h-4" />
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>

              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className="w-full py-2 text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                style={{ color: countdown > 0 ? '#64748b' : GOLD }}
              >
                <RotateCcw className="w-3 h-3" />
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
