'use client';

/**
 * ============================================================
 * TRIKAAL VAANI — My Cosmic Records (My Vault)
 * File:    app/my-cosmic-records/page.tsx
 * VERSION: v2.1 (11 Nov 2026)
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 *
 * v2.1 (11 Nov 2026) — "Report kholein" ab plain <a> (poora page load), <Link>
 *   nahi. Vishal ka vault se report kholna "Application error" de raha tha:
 *   Vercel Skew Protection ka ?dpl= + Next 13.5 [slug] chunk path ko do baar
 *   encode karta hai (%255Bslug%255D → 404 → ChunkLoadError). Live par
 *   headless Chrome se reproduce kiya. Seedha page load par yeh nahi hota.
 *
 * v2.0 (11 Nov 2026) — VAULT AB ASLI READINGS DIKHATA HAI (Rohiit approved
 *   design: "Simple card + Report button").
 *   Pehle yeh page `saved_charts` table padhta tha jo Supabase mein hai hi
 *   nahi — isliye har customer ka vault hamesha khaali tha (Vishal Malhotra,
 *   ₹51 paid, 9 Nov 2026 ki shikayat).
 *   Ab readings `predictions` se aati hain (lib/auth.ts v2.0 getVaultReadings),
 *   jahan user_id = login user. Card par: naam, ₹51 PAID / FREE badge, vishay,
 *   janm vivaran, dasha, tareekh aur "Report kholein" button (/report/<slug>).
 *   Delete button HATAYA — users ke liye delete permission nahi hai, aur
 *   CEO ka NO-DELETE niyam hai.
 *   Naam `profiles` se; "Friend" (trigger default) ho to email ka pehla hissa.
 * ============================================================
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import { supabase } from '@/lib/supabase';
import { getUserProfile, getVaultReadings, type VaultProfile, type VaultReading } from '@/lib/auth';
import { Star, Clock, MapPin, Sparkles, LogOut, User, ScrollText } from 'lucide-react';
import Link from 'next/link';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function fmtDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// dob "YYYY-MM-DD" → "DD-MM-YYYY" (timezone se khiskega nahi)
function fmtDob(dob: string | null): string {
  if (!dob) return '';
  const [y, m, d] = dob.split('-');
  return y && m && d ? `${d}-${m}-${y}` : dob;
}

function fmtTime(t: string | null): string {
  if (!t) return '';
  return t.slice(0, 5);
}

function isPaid(r: VaultReading): boolean {
  return r.prediction_tier === 'paid' || r.payment_verified === true;
}

export default function MyCosmicRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<VaultProfile | null>(null);
  const [readings, setReadings] = useState<VaultReading[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (userId: string) => {
    const [profileData, readingsData] = await Promise.all([
      getUserProfile(userId),
      getVaultReadings(userId),
    ]);
    setProfile(profileData);
    setReadings(readingsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/');
        return;
      }
      setUser(session.user);
      loadData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loadData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent mx-auto mb-4 animate-spin"
            style={{ borderColor: GOLD }}
          />
          <p className="text-slate-400 text-sm">Loading your Cosmic Vault…</p>
        </div>
      </div>
    );
  }

  const profileName = profile?.name?.trim();
  const displayName =
    (profileName && profileName.toLowerCase() !== 'friend' ? profileName.split(' ')[0] : '') ||
    user?.email?.split('@')[0] ||
    'Seeker';

  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />

      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4">

          <div
            className="rounded-2xl px-6 py-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{
              background: `linear-gradient(135deg, ${GOLD_RGBA(0.08)} 0%, rgba(11,16,26,0.95) 100%)`,
              border: `1px solid ${GOLD_RGBA(0.22)}`,
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: GOLD_RGBA(0.14), border: `1px solid ${GOLD_RGBA(0.35)}` }}
              >
                <User className="w-5 h-5" style={{ color: GOLD }} />
              </div>
              <div>
                <p className="font-serif font-bold text-white text-lg">
                  Namaste, {displayName} 🙏
                </p>
                {user?.email && <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                My Cosmic <span style={{ color: GOLD }}>Records</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {readings.length} reading{readings.length !== 1 ? 's' : ''} in your vault
              </p>
            </div>
            <Link
              href="/#birth-form"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
            >
              <Sparkles className="w-4 h-4" />
              New Analysis
            </Link>
          </div>

          {readings.length === 0 ? (
            <div
              className="rounded-2xl py-16 text-center"
              style={{ background: 'rgba(11,16,26,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}
            >
              <Star className="w-10 h-10 mx-auto mb-4 opacity-20" style={{ color: GOLD }} />
              <p className="text-slate-400 text-sm mb-2">Your cosmic vault is empty.</p>
              <p className="text-slate-500 text-xs mb-5 px-6">
                Sign in rehte hue jo reading banayenge, wo yahan apne aap save hogi.
              </p>
              <Link
                href="/#birth-form"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{
                  background: GOLD_RGBA(0.12),
                  border: `1px solid ${GOLD_RGBA(0.3)}`,
                  color: GOLD,
                }}
              >
                Get Your First Reading
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {readings.map((r) => {
                const paid = isPaid(r);
                const dasha = r.mahadasha && r.antardasha && r.mahadasha !== 'unknown' && r.antardasha !== 'unknown'
                  ? `${r.mahadasha} MD · ${r.antardasha} AD`
                  : '';
                return (
                  <div
                    key={r.id}
                    className="rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      background: 'rgba(11,16,26,0.85)',
                      border: `1px solid ${paid ? GOLD_RGBA(0.3) : GOLD_RGBA(0.15)}`,
                    }}
                  >
                    <div
                      className="px-4 py-3 flex items-center justify-between gap-2"
                      style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}`, background: GOLD_RGBA(0.04) }}
                    >
                      <p className="font-serif font-semibold text-white truncate">{r.person_name || 'Reading'}</p>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                        style={paid
                          ? { background: GOLD_RGBA(0.16), color: GOLD }
                          : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                      >
                        {paid ? '⚡ ₹51 PAID' : 'FREE'}
                      </span>
                    </div>
                    <div className="px-4 py-3 space-y-2 flex-1">
                      {r.domain_label && (
                        <p className="text-sm" style={{ color: GOLD_RGBA(0.85) }}>🔮 {r.domain_label}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        {r.dob && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {fmtDob(r.dob)}{r.birth_time ? ` · ${fmtTime(r.birth_time)}` : ''}
                          </span>
                        )}
                        {r.birth_city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {r.birth_city}
                          </span>
                        )}
                      </div>
                      {dasha && <p className="text-xs text-slate-400">{dasha}</p>}
                      <p className="text-xs text-slate-600">{fmtDate(r.created_at)}</p>
                    </div>
                    {r.public_slug && (
                      <div className="px-4 pb-4">
                        {/* v2.1 — plain <a>, NOT <Link>: full page load. Next 13.5 +
                            Vercel Skew Protection (?dpl=) double-encodes the [slug]
                            chunk path (%255B) → 404 → "Application error" on
                            in-app navigation (Vishal, 11 Nov 2026). */}
                        <a
                          href={`/report/${r.public_slug}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                          style={{
                            background: paid ? `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)` : GOLD_RGBA(0.12),
                            color: paid ? '#080B12' : GOLD,
                            border: paid ? 'none' : `1px solid ${GOLD_RGBA(0.3)}`,
                          }}
                        >
                          <ScrollText className="w-4 h-4" />
                          Report kholein →
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
// END — app/my-cosmic-records/page.tsx v2.1
