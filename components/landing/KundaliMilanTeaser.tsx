'use client';

// 🔱 TRIKAL VAANI | components/landing/KundaliMilanTeaser.tsx | v1.0
// Owner: Rohiit Gupta, Chief Vedic Architect
// Date: 2026-05-19
// ============================================================================
// PURPOSE:
//   Day 1 "Launching Soon" earning placeholder for Kundali Milan product.
//   Captures pre-launch email waitlist into Supabase `milan_waitlist` table.
//   Goes LIVE as full product on Day 8 (per v2.0 strategy execution plan).
//
// STRATEGIC ROLE:
//   - Opens SEO/GEO indexing window immediately for Kundali Milan content
//   - Builds waitlist of warm leads for Day 8 launch blast
//   - Sets buyer expectation: ₹51 Basic / ₹101 Deep / ₹151 Both Versions
//   - Communicates differentiator: Dos+Don'ts+6 Remedies, PDF+WA sharing
//
// LOCKED (IR-12): This component is EARNING TIER. Cannot be reordered or
// removed from homepage slot #3 without written CEO approval.
//
// BRAND CONSISTENCY:
//   bg: #080B12 (matches calculator + Mahakaal form)
//   gold: #D4AF37
//   form-bg: rgba(13,17,30,0.85)
//   border: rgba(212,175,55,0.18)
// ============================================================================

import { useState } from 'react';
import { Heart, Sparkles, FileText, Share2, ShieldCheck, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function KundaliMilanTeaser() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // Insert into milan_waitlist Supabase table
      const { error } = await supabase
        .from('milan_waitlist')
        .insert({
          email: email.toLowerCase().trim(),
          source: 'homepage_teaser',
          created_at: new Date().toISOString(),
        });

      if (error) {
        // Handle duplicate email gracefully
        if (error.code === '23505') {
          setStatus('success'); // Already on waitlist — show success anyway
        } else {
          throw error;
        }
      } else {
        setStatus('success');
      }
      setEmail('');
    } catch (err) {
      console.error('[KundaliMilanTeaser] Waitlist insert failed:', err);
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <section
      id="kundali-milan-teaser"
      className="py-16 sm:py-20 px-4"
      style={{ background: '#080B12' }}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── HEADER BADGE ────────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full"
            style={{
              color: GOLD,
              border: `1px solid ${GOLD_RGBA(0.3)}`,
              background: GOLD_RGBA(0.06),
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Service · Launching Soon
          </span>
        </div>

        {/* ── HEADLINE ────────────────────────────────────────────────── */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center leading-tight">
          Kundali Milan —{' '}
          <span className="text-gradient-gold">Coming Soon</span>
        </h2>

        <p className="text-center text-slate-400 mt-4 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          Vedic compatibility analysis with personalized remedies. Computed using
          Swiss Ephemeris precision and BPHS classical rules — by Rohiit Gupta,
          Chief Vedic Architect.
        </p>

        {/* ── PRICING PREVIEW CARD ────────────────────────────────────── */}
        <div
          className="mt-10 rounded-2xl p-6 sm:p-8"
          style={{
            background: 'rgba(13,17,30,0.85)',
            border: `1px solid ${GOLD_RGBA(0.18)}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
          }}
        >
          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

            {/* Free Preview */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                Free Preview
              </div>
              <div className="text-2xl font-bold text-white">₹0</div>
              <div className="text-xs text-slate-500 mt-1">36 Guna score</div>
            </div>

            {/* Basic Milan */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: GOLD_RGBA(0.04),
                border: `1px solid ${GOLD_RGBA(0.2)}`,
              }}
            >
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: GOLD_RGBA(0.7) }}>
                Basic Milan
              </div>
              <div className="text-2xl font-bold" style={{ color: GOLD }}>₹51</div>
              <div className="text-xs text-slate-500 mt-1">Full Ashtakoot</div>
            </div>

            {/* Deep Milan — MOST POPULAR */}
            <div
              className="rounded-xl p-4 text-center relative"
              style={{
                background: GOLD_RGBA(0.08),
                border: `1px solid ${GOLD_RGBA(0.4)}`,
              }}
            >
              <span
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: GOLD,
                  color: '#080B12',
                }}
              >
                Most Popular
              </span>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: GOLD_RGBA(0.9) }}>
                Deep Milan
              </div>
              <div className="text-2xl font-bold" style={{ color: GOLD }}>₹101</div>
              <div className="text-xs text-slate-500 mt-1">+ 6 Remedies</div>
            </div>

            {/* Both Versions */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: GOLD_RGBA(0.04),
                border: `1px solid ${GOLD_RGBA(0.2)}`,
              }}
            >
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: GOLD_RGBA(0.7) }}>
                Both Versions
              </div>
              <div className="text-2xl font-bold" style={{ color: GOLD }}>₹151</div>
              <div className="text-xs text-slate-500 mt-1">Couple + Parent</div>
            </div>

          </div>

          {/* ── FEATURE STRIP ─────────────────────────────────────────── */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: GOLD_RGBA(0.1) }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                36 Guna
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                Mangal Dosh
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                Nadi Dosh
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                Dos &amp; Don&apos;ts
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                6 Remedies
              </div>
              <div className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
                PDF + WhatsApp
              </div>
            </div>
          </div>

          {/* ── EMAIL CAPTURE FORM ────────────────────────────────────── */}
          <div className="mt-8">
            {status === 'success' ? (
              <div
                className="rounded-xl p-5 text-center"
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <div className="text-emerald-400 font-semibold text-sm">
                  ✓ You&apos;re on the waitlist
                </div>
                <p className="text-slate-400 text-xs mt-1.5">
                  We&apos;ll notify you the moment Kundali Milan goes live. Mahakaal ka ashirwad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-center text-sm text-slate-300">
                  Get early access — be the first to know when Kundali Milan launches.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                  <div className="relative flex-1">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: GOLD_RGBA(0.5) }}
                    />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'loading'}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                      style={{
                        background: '#0d1120',
                        border: `1px solid ${GOLD_RGBA(0.2)}`,
                      }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                      color: '#080B12',
                    }}
                  >
                    {status === 'loading' ? 'Adding...' : 'Notify Me'}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-center text-xs text-red-400 mt-2">
                    {errorMsg}
                  </p>
                )}
                <p className="text-center text-[11px] text-slate-500 mt-2">
                  No spam. Single notification on launch day. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>

        </div>

        {/* ── TRUST LINE ──────────────────────────────────────────────── */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Reading framework by Rohiit Gupta, Chief Vedic Architect · Delhi NCR ·
          Powered by Swiss Ephemeris &amp; BPHS Classical rules
        </p>

      </div>
    </section>
  );
}

// ============================================================================
// END — components/landing/KundaliMilanTeaser.tsx v1.0
// 🔱 Trikal Vaani | Rohiit Gupta, Chief Vedic Architect
// 🔒 EARNING LOCKED (IR-12) — Day 1 ship → Day 8 product LIVE
// ============================================================================
