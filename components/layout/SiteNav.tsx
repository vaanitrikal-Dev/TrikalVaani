'use client';

// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: components/layout/SiteNav.tsx
// VERSION: v2.7
// DATE: 2026-05-25
// CHANGES:
//   v2.7: ✅ Brand wordmark flipped "Trikal Vaani" → "Trikaal Vaani" (visible).
//         ✅ Logo alt flipped to "Trikaal Vaani Logo".
//         ✅ Added SiteNavigationElement JSON-LD (built from NAV_LINKS) to
//            help Google map site structure / earn sitelinks.
//         🔒 UNCHANGED: rohiit@trikalvaani.com email, /Trikal_Vaani_Logo.svg
//            logo path, all nav hrefs, all auth/vault logic.
//   v2.6: Nav detects BOTH login types (Gmail Supabase + Mobile OTP Firebase).
//   v2.5: "My Vault" dropdown with Sign Out.
//   v2.4: Mobile hamburger menu.
// ============================================================

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Mail, User, ChevronDown, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { signOutMobile, getMobileUser } from '@/lib/firebase-auth';
import AuthModal from '@/components/auth/AuthModal';
import { LANG_LABELS, LANG_NAMES, type Lang } from '@/lib/lang';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const NAV_LINKS: { href: string; label: string; highlight?: boolean }[] = [
  { href: '/#pillars',                  label: 'Life Pillars' },
  { href: '/services',                  label: 'Services', highlight: true },
  { href: '/kundali-milan',             label: 'Kundali Milan' },
  { href: '/karmic-background-reading', label: 'Karmic Reading' },
  { href: '/panchang',                  label: 'Panchang' },
  { href: '/calculators',               label: 'Calculators' },
  { href: '/blog',                      label: 'Vedic Blog' },
  { href: '/founder',                   label: 'Founder' },
];

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

function VaultMenu({ onSignOut }: { onSignOut: () => void }) {
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
        className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
        style={{
          background: GOLD_RGBA(0.1),
          border: `1px solid ${GOLD_RGBA(0.28)}`,
          color: GOLD,
        }}
      >
        <User className="w-3.5 h-3.5" />
        My Vault
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[150px]"
          style={{ background: 'rgba(11,16,26,0.98)', border: `1px solid ${GOLD_RGBA(0.2)}`, boxShadow: `0 8px 32px rgba(0,0,0,0.5)` }}
        >
          <Link
            href="/my-cosmic-records"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
            style={{ color: GOLD }}
          >
            <User className="w-3.5 h-3.5" /> My Vault
          </Link>
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
            style={{ color: '#94a3b8', borderTop: `1px solid ${GOLD_RGBA(0.1)}` }}
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default function SiteNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mobileLoggedIn, setMobileLoggedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check Supabase session (Gmail login)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // Check Firebase mobile session (localStorage)
    const mobileUser = getMobileUser();
    setMobileLoggedIn(!!mobileUser);

    return () => subscription.unsubscribe();
  }, []);

  // Either Gmail or mobile = logged in
  const isLoggedIn = !!user || mobileLoggedIn;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    // Sign out from whichever session is active
    if (user) await signOut();
    if (mobileLoggedIn) await signOutMobile();
    setUser(null);
    setMobileLoggedIn(false);
    setMobileOpen(false);
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  return (
    <>
      {/* ── SiteNavigationElement schema — helps Google map site structure ──
          Built from NAV_LINKS so it stays in sync if nav items change.
          @id is unique; URLs stay on trikalvaani.com (domain unchanged). */}
      <Script
        id="sitenav-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            '@id': 'https://trikalvaani.com/#sitenav',
            name: NAV_LINKS.map((l) => l.label),
            url: NAV_LINKS.map((l) =>
              l.href.startsWith('http')
                ? l.href
                : `https://trikalvaani.com${l.href}`
            ),
          }),
        }}
      />

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
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div
              className="rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden"
              style={{
                width: '52px',
                height: '52px',
                background: `radial-gradient(circle, ${GOLD_RGBA(0.16)} 0%, rgba(2,8,23,0.5) 100%)`,
                border: `1px solid ${GOLD_RGBA(0.35)}`,
                boxShadow: `0 0 22px ${GOLD_RGBA(0.38)}, 0 0 8px ${GOLD_RGBA(0.55)}`,
              }}
            >
              <Image src="/Trikal_Vaani_Logo.svg" alt="Trikaal Vaani Logo" width={60} height={60} priority />
            </div>
            <span className="font-serif font-bold text-lg text-gradient-gold tracking-wide">
              Trikaal Vaani
            </span>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden sm:flex items-center gap-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm transition-colors duration-200"
                style={l.highlight ? { color: GOLD_RGBA(0.85), fontWeight: 600 } : { color: '#94a3b8' }}
              >
                {l.label}
              </Link>
            ))}

            <a
              href="mailto:rohiit@trikalvaani.com"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
            >
              <Mail className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.5) }} />
              <span>rohiit@trikalvaani.com</span>
            </a>

            <LangSwitcher lang={lang} setLang={setLang} />

            {isLoggedIn ? (
              <VaultMenu onSignOut={handleSignOut} />
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

          {/* ── MOBILE: Start + hamburger ── */}
          <div className="sm:hidden flex items-center gap-2">
            <Link
              href="/#birth-form"
              className="text-sm font-medium px-4 py-2 rounded-full"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}
              onClick={() => setMobileOpen(false)}
            >
              Start
            </Link>
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{ width: '40px', height: '40px', color: GOLD, border: `1px solid ${GOLD_RGBA(0.25)}`, background: GOLD_RGBA(0.06) }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* ── MOBILE DROPDOWN MENU ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 sm:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', top: '64px' }}
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="fixed left-0 right-0 z-40 sm:hidden px-4 pb-6 pt-2"
            style={{
              top: '64px',
              background: 'rgba(2,8,23,0.98)',
              backdropFilter: 'blur(16px)',
              borderBottom: `1px solid ${GOLD_RGBA(0.15)}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
            }}
          >
            <div className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-base transition-colors"
                  style={{
                    color: l.highlight ? GOLD : '#cbd5e1',
                    fontWeight: l.highlight ? 600 : 400,
                    borderBottom: `1px solid ${GOLD_RGBA(0.08)}`,
                  }}
                >
                  {l.label}
                </Link>
              ))}

              {isLoggedIn ? (
                <>
                  <Link
                    href="/my-cosmic-records"
                    onClick={() => setMobileOpen(false)}
                    className="py-3.5 text-base flex items-center gap-2"
                    style={{ color: GOLD, fontWeight: 600, borderBottom: `1px solid ${GOLD_RGBA(0.08)}` }}
                  >
                    <User className="w-4 h-4" /> My Vault
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="py-3.5 text-base text-left flex items-center gap-2"
                    style={{ color: '#cbd5e1', borderBottom: `1px solid ${GOLD_RGBA(0.08)}` }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); setShowAuth(true); }}
                  className="py-3.5 text-base text-left"
                  style={{ color: '#cbd5e1', borderBottom: `1px solid ${GOLD_RGBA(0.08)}` }}
                >
                  Sign In
                </button>
              )}

              <div className="flex items-center justify-between pt-4">
                <LangSwitcher lang={lang} setLang={setLang} />
                <a href="mailto:rohiit@trikalvaani.com" className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.5) }} />
                  rohiit@trikalvaani.com
                </a>
              </div>
            </div>
          </nav>
        </>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); setMobileLoggedIn(!!getMobileUser()); }}
        />
      )}
    </>
  );
}

// ============================================================
// END — components/layout/SiteNav.tsx v2.7
// 🔱 Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect
// Brand wordmark=Trikaal · email/logo-path/hrefs=unchanged
// ============================================================
