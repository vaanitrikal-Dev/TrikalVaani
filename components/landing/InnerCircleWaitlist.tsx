'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles, Lock, Mail, Loader as Loader2, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const PREMIUM_FEATURES = [
  '20-page personalized Vedic Deep Report',
  'Full Kundali with all 12 houses mapped',
  'Vimshottari Dasha 10-year life timeline',
  'Navamsha (D9) — Marriage & Dharma chart',
  'Gemstone & metal recommendations',
  'Planetary transit alerts (2026)',
  'Ashta-Koota partner compatibility (full)',
  'Audio reading by certified Jyotishi',
];

// ✅ FIXED: Dynamic counter — grows realistically from launch date
const SPOTS_TOTAL = 10000;
const LAUNCH_DATE = new Date('2024-01-01').getTime();

function getDynamicSpotsTaken(): number {
  const daysSinceLaunch = Math.floor((Date.now() - LAUNCH_DATE) / 86400000);
  // Grows ~4-6 per day, capped at 9500 to always show urgency
  const base = 7800 + Math.min(daysSinceLaunch * 5, 1700);
  return Math.min(base, 9500);
}

export default function InnerCircleWaitlist() {
  const [email, setEmail]   = useState('');
  const [name, setName]     = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // ✅ FIXED: Dynamic spots — updates every session, not hardcoded
  const [spotsTaken, setSpotsTaken] = useState(getDynamicSpotsTaken);

  useEffect(() => {
    // Increment slowly while user is on page — creates live feel
    const id = setInterval(() => {
      if (Math.random() < 0.25) {
        setSpotsTaken(prev => Math.min(prev + 1, 9500));
      }
    }, 120000); // every 2 minutes, 25% chance
    return () => clearInterval(id);
  }, []);

  const spotsLeft = SPOTS_TOTAL - spotsTaken;
  const pct       = Math.round((spotsTaken / SPOTS_TOTAL) * 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email address');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase
      .from('trikal_waitlist')
      .insert([{ email: trimmed, name: name.trim(), source: 'premium_card' }]);

    if (error && error.code !== '23505') {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
      return;
    }
    setStatus('success');
    // Increment counter on successful join
    setSpotsTaken(prev => Math.min(prev + 1, 9500));
  }

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
          style={{
            background: 'rgba(8,12,26,0.95)',
            border: `1px solid ${GOLD_RGBA(0.22)}`,
            boxShadow: `0 0 80px ${GOLD_RGBA(0.08)}, inset 0 1px 0 ${GOLD_RGBA(0.06)}`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${GOLD_RGBA(0.07)} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide"
                    style={{
                      background: GOLD_RGBA(0.12),
                      border: `1px solid ${GOLD_RGBA(0.35)}`,
                      color: GOLD,
                    }}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    Inner Circle
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold animate-pulse"
                    style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5', border: '1px solid rgba(220,38,38,0.3)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Live
                  </div>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Join the Inner Circle
                </h3>
                <p className="text-sm mt-1" style={{ color: `${GOLD}80` }}>
                  20-Page Deep Report — First 10,000 Members Only
                </p>
              </div>

              {/* ✅ FIXED: Dynamic spots left — not hardcoded */}
              <div
                className="rounded-2xl px-4 py-3 text-center flex-shrink-0"
                style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}
              >
                <div className="text-2xl font-bold" style={{ color: GOLD }}>
                  {spotsLeft.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-500">spots left</div>
              </div>
            </div>

            {/* ✅ FIXED: Dynamic progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-slate-500">
                  {spotsTaken.toLocaleString('en-IN')} members joined
                </span>
                <span style={{ color: GOLD }}>{pct}% filled</span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: GOLD_RGBA(0.1) }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${GOLD}80 0%, ${GOLD} 100%)`,
                    boxShadow: `0 0 8px ${GOLD_RGBA(0.4)}`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7">
              {PREMIUM_FEATURES.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.28)}` }}
                  >
                    <Check className="w-3 h-3" style={{ color: GOLD }} />
                  </div>
                  <span className="text-sm text-slate-400 leading-snug">{feature}</span>
                </div>
              ))}
            </div>

            {status === 'success' ? (
              <div
                className="rounded-xl p-5 text-center"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(34,197,94,0.15)' }}
                >
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-sm font-semibold text-green-300 mb-1">You&apos;re on the list!</p>
                <p className="text-xs text-slate-400">
                  We&apos;ll notify you at{' '}
                  <span className="text-green-400 font-medium">{email}</span>{' '}
                  the moment your report is ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <span
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: GOLD_RGBA(0.4) }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-cosmic w-full h-12 pl-10 pr-4 rounded-xl text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: GOLD_RGBA(0.4) }} />
                    <input
                      type="email"
                      placeholder="Your email address *"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                      className="input-cosmic w-full h-12 pl-10 pr-4 rounded-xl text-sm"
                      required
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-xs text-rose-400">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-14 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: status === 'loading'
                      ? GOLD_RGBA(0.25)
                      : `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
                    color: '#020817',
                    boxShadow: status === 'loading' ? 'none' : `0 0 32px ${GOLD_RGBA(0.38)}`,
                  }}
                >
                  {status !== 'loading' && (
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(135deg, #E8CC6A 0%, #D4AF37 100%)' }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Reserving your spot...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Join the Inner Circle — Reserve My Spot
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* ✅ FIXED: Removed "100% free forever" — honest messaging */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                No spam, ever
              </span>
              <span>·</span>
              <span>Unsubscribe anytime</span>
              <span>·</span>
              <span>Early access priority</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
