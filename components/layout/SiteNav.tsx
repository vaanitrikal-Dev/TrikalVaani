'use client';

// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: components/layout/SiteNav.tsx
// VERSION: v2.8
// DATE: 2026-06-27
// CHANGES:
//   v2.8: NAV CONSISTENCY PASS (style + colour) —
//     - Uniform link colour: every nav link is now the same slate tone and
//       weight. Removed the lone gold "Services" highlight that made the bar
//       look inconsistent. Gold now means ONE thing: hover + current page.
//     - Active-page highlight: the link for the page you're on shows gold
//       (via usePathname) - clear orientation, professional feel.
//     - Removed the email address from the DESKTOP top bar (it cluttered the
//       nav and is already in the footer + Contact). Email kept in the mobile
//       menu where it does not crowd the bar.
//     - Single gold accent on desktop = the "Free Analysis" CTA button.
//     PROTECTED: logo, LangSwitcher, Sign In / My Vault, mobile hamburger,
//       AuthModal, all routes. NAV_LINKS list unchanged except the now-unused
//       `highlight` flag was dropped.
//   v2.7: Removed "Life Pillars" nav link (section still on homepage).
//   v2.6: Added "Vivah Muhurat" nav link.
//   v2.5: IR-0 cleanup - visible logo text "Trikaal Vaani".
//   v2.4: MOBILE HAMBURGER MENU.
//   v2.3: Added "Kundali Milan" + "Karmic Reading" links.
//   v2.2: Removed "Events"; added "Calculators".
// ============================================================

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, User, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/auth/AuthModal';
import { LANG_LABELS, LANG_NAMES, type Lang } from '@/lib/lang';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// Single source of truth for nav links (desktop + mobile share this)
// v2.8: uniform styling - no per-item highlight flag.
const NAV_LINKS: { href: string; label: string }[] = [
  { href: '/services',                 label: 'Services' },
  { href: '/kundali-milan',            label: 'Kundali Milan' },
  { href: '/vivah-muhurat',            label: 'Vivah Muhurat' },
  { href: '/karmic-background-reading', label: 'Karmic Reading' },
  { href: '/panchang',                 label: 'Panchang' },
  { href: '/calculators',              label: 'Calculators' },
  { href: '/blog',                     label: 'Vedic Blog' },
  { href: '/founder',                  label: 'Founder' },
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

export default function SiteNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();
  // Active if exact match or a sub-page of the link (e.g. /services/ex-back-reading)
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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

          {/* -- LOGO -- */}
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
              <Image
                src="/Trikal_Vaani_Logo.svg"
                alt="Trikaal Vaani Logo"
                width={60}
                height={60}
                priority
              />
            </div>
            <span className="font-serif font-bold text-lg text-gradient-gold tracking-wide">
              Trikaal Vaani
            </span>
          </Link>

          {/* -- DESKTOP NAV - v2.8: uniform colour + active-page gold -- */}
          <nav className="hidden sm:flex items-center gap-4">

            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? 'page' : undefined}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(l.href)
                    ? 'text-[#D4AF37]'
                    : 'text-slate-300 hover:text-[#D4AF37]'
                }`}
              >
                {l.label}
              </Link>
            ))}

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

          {/* -- MOBILE: Start button + hamburger -- */}
          <div className="sm:hidden flex items-center gap-2">
            <Link
              href="/#birth-form"
              className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
              onClick={() => setMobileOpen(false)}
            >
              Start
            </Link>
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{
                width: '40px',
                height: '40px',
                color: GOLD,
                border: `1px solid ${GOLD_RGBA(0.25)}`,
                background: GOLD_RGBA(0.06),
              }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* -- MOBILE DROPDOWN MENU -- */}
      {mobileOpen && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', top: '64px' }}
            onClick={() => setMobileOpen(false)}
          />
          {/* panel */}
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
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`py-3.5 text-base transition-colors ${
                    isActive(l.href) ? 'text-[#D4AF37] font-semibold' : 'text-slate-300'
                  }`}
                  style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}` }}
                >
                  {l.label}
                </Link>
              ))}

              {/* Sign In / My Vault */}
              {user ? (
                <Link
                  href="/my-cosmic-records"
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-base flex items-center gap-2"
                  style={{ color: GOLD, fontWeight: 600 }}
                >
                  <User className="w-4 h-4" /> My Vault
                </Link>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); setShowAuth(true); }}
                  className="py-3.5 text-base text-left text-slate-300"
                  style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}` }}
                >
                  Sign In
                </button>
              )}

              {/* Language + email (email kept here - does not crowd the bar) */}
              <div className="flex items-center justify-between pt-4">
                <LangSwitcher lang={lang} setLang={setLang} />
                <a
                  href="mailto:rohiit@trikalvaani.com"
                  className="flex items-center gap-1.5 text-xs text-slate-500"
                >
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
          onSuccess={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
