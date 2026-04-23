'use client';

import Link from 'next/link';
import { Mail, User, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/auth/AuthModal';
import { LANG_LABELS, LANG_NAMES, type Lang } from '@/lib/lang';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function GoldOwlLogo() {
  return (
    <svg width="43" height="43" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Trikal Vaani owl logo">
      <defs>
        <radialGradient id="owlBodyGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFEF99" />
          <stop offset="60%" stopColor="#E8CC5A" />
          <stop offset="100%" stopColor="#A8820A" />
        </radialGradient>
        <radialGradient id="owlEyeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBE0" />
          <stop offset="100%" stopColor="#FACC15" />
        </radialGradient>
      </defs>
      <path d="M10 29 Q8 22 10 16 Q13 10 17 9 L24 7 L31 9 Q35 10 38 16 Q40 22 38 29 Q24 36 10 29Z" fill="url(#owlBodyGrad)" opacity="0.97" />
      <ellipse cx="24" cy="34" rx="11" ry="9" fill="url(#owlBodyGrad)" opacity="0.9" />
      <path d="M13 10 L10 4 L17 9 Z" fill={GOLD} opacity="0.9" />
      <path d="M35 10 L38 4 L31 9 Z" fill={GOLD} opacity="0.9" />
      <circle cx="18.5" cy="20" r="4.5" fill="rgba(2,8,23,0.92)" />
      <circle cx="29.5" cy="20" r="4.5" fill="rgba(2,8,23,0.92)" />
      <circle cx="18.5" cy="20" r="3" fill="url(#owlEyeGrad)" />
      <circle cx="29.5" cy="20" r="3" fill="url(#owlEyeGrad)" />
      <circle cx="19.5" cy="19.2" r="1.1" fill="rgba(2,8,23,0.88)" />
      <circle cx="30.5" cy="19.2" r="1.1" fill="rgba(2,8,23,0.88)" />
      <circle cx="20" cy="18.5" r="0.5" fill="rgba(255,255,255,0.75)" />
      <circle cx="31" cy="18.5" r="0.5" fill="rgba(255,255,255,0.75)" />
      <path d="M22 24 L24 22.5 L26 24 L24 26.5 Z" fill="#A8862A" opacity="0.95" />
    </svg>
  );
}

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: GOLD_RGBA(0.8), border: `1px solid ${GOLD_RGBA(0.15)}` }}
      >
        {LANG_LABELS[lang]}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[110px]"
          style={{ background: 'rgba(11,16,26,0.98)', border: `1px solid ${GOLD_RGBA(0.2)}`, boxShadow: `0 8px 32px rgba(0,0,0,0.5)` }}
        >
          {(Object.entries(LANG_NAMES) as [Lang, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setLang(key); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5"
              style={{ color: lang === key ? GOLD : '#94a3b8' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4"
        style={{
          background: 'rgba(2,8,23,0.82)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${GOLD_RGBA(0.1)}`,
        }}
      >
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                width: '52px',
                height: '52px',
                background: `radial-gradient(circle, ${GOLD_RGBA(0.16)} 0%, rgba(2,8,23,0.5) 100%)`,
                border: `1px solid ${GOLD_RGBA(0.35)}`,
                boxShadow: `0 0 22px ${GOLD_RGBA(0.38)}, 0 0 8px ${GOLD_RGBA(0.55)}`,
                animation: 'owlPulse 3s ease-in-out infinite',
              }}
            >
              <GoldOwlLogo />
            </div>
            <span className="font-serif font-bold text-lg text-gradient-gold tracking-wide">
              Trikal Vaani
            </span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden sm:flex items-center gap-4">

            <Link href="/#pillars" className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200">
              Life Pillars
            </Link>

            {/* ── SERVICES LINK (NEW) ── */}
            <Link
              href="/services"
              className="text-sm font-semibold transition-colors duration-200"
              style={{ color: GOLD_RGBA(0.85) }}
            >
              Services
            </Link>

            <Link href="/blog" className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200">
              Vedic Blog
            </Link>

            <Link href="/upcoming-events" className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200">
              Events
            </Link>

            <Link href="/founder" className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200">
              Founder
            </Link>

            <a
              href="mailto:rohiit@trikalvaani.com"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
            >
              <Mail className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.5) }} />
              <span>rohiit@trikalvaani.com</span>
            </a>

            <LangSwitcher lang={lang} setLang={setLang} />

            {user ? (
              <Link
                href="/my-cosmic-records"
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: GOLD_RGBA(0.1),
                  border: `1px solid ${GOLD_RGBA(0.28)}`,
                  color: GOLD,
                }}
              >
                <User className="w-3.5 h-3.5" />
                My Vault
              </Link>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                }}
              >
                Sign In
              </button>
            )}

            <Link
              href="/#birth-form"
              className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
            >
              Free Analysis
            </Link>
          </nav>

          {/* ── MOBILE NAV ── */}
          <div className="sm:hidden flex items-center gap-2">
            <Link
              href="/services"
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200"
              style={{
                color: GOLD_RGBA(0.9),
                border: `1px solid ${GOLD_RGBA(0.25)}`,
                background: GOLD_RGBA(0.06),
              }}
            >
              Services
            </Link>
            <LangSwitcher lang={lang} setLang={setLang} />
            <Link
              href="/#birth-form"
              className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
            >
              Start
            </Link>
          </div>

        </div>
      </header>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
