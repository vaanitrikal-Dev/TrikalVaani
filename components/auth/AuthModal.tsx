'use client';

// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikal Vaani
// FILE: components/auth/AuthModal.tsx
// VERSION: v3.0
// DATE: 2026-05-24
// CHANGES:
//   v3.0: Added "Login with Mobile" button (Firebase Phone OTP).
//         Opens PhoneAuthModal when clicked. After mobile login
//         success, user returns to same page. Both Google + Mobile
//         login options now visible side by side.
//   v2.0: Added "Continue with Google" button.
//   v1.0: Email/password login only.
// ============================================================

import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import PhoneAuthModal from './PhoneAuthModal';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error: err } = await signInWithGoogle();
      if (err) {
        setError(err.message);
        setGoogleLoading(false);
      }
    } catch {
      setError('Could not start Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { error: err } = await signInWithEmail(email, password);
        if (err) { setError(err.message); return; }
      } else {
        if (!name.trim()) { setError('Please enter your name.'); return; }
        const { error: err } = await signUpWithEmail(email, password, name);
        if (err) { setError((err as Error).message ?? String(err)); return; }
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  // Show PhoneAuthModal on top when mobile login clicked
  if (showPhone) {
    return (
      <PhoneAuthModal
        onClose={() => setShowPhone(false)}
        onSuccess={(mobile) => {
          setShowPhone(false);
          onSuccess();
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,23,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
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
              {mode === 'login' ? 'Welcome Back, Seeker' : 'Begin Your Journey'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login' ? 'Sign in to your Cosmic Vault' : 'Create your free cosmic account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 pt-5 space-y-3">

          {/* ── CONTINUE WITH GOOGLE ── */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#ffffff', color: '#1f2937' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
            </svg>
            {googleLoading ? 'Connecting…' : 'Continue with Google'}
          </button>

          {/* ── LOGIN WITH MOBILE (Firebase OTP) ── */}
          <button
            type="button"
            onClick={() => setShowPhone(true)}
            disabled={googleLoading || loading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'transparent',
              border: `1px solid ${GOLD_RGBA(0.35)}`,
              color: GOLD,
            }}
          >
            <Phone className="w-4 h-4" />
            Login with Mobile OTP
          </button>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px" style={{ background: GOLD_RGBA(0.12) }} />
            <span className="text-[11px] text-slate-500">or with email</span>
            <div className="flex-1 h-px" style={{ background: GOLD_RGBA(0.12) }} />
          </div>
        </div>

        {/* ── EMAIL / PASSWORD FORM ── */}
        <form onSubmit={handle} className="px-6 pb-5 pt-3 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GOLD_RGBA(0.15)}` }}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GOLD_RGBA(0.15)}` }}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GOLD_RGBA(0.15)}` }}
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-3 py-2.5 text-xs text-red-300"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
              color: '#080B12',
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-slate-500">
            {mode === 'login' ? "Don't have an account?" : 'Already a seeker?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="font-semibold transition-colors hover:text-white"
              style={{ color: GOLD }}
            >
              {mode === 'login' ? 'Register Free' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
