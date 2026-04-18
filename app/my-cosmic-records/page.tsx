'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import { supabase } from '@/lib/supabase';
import { getSavedCharts, getUserProfile, deleteChart } from '@/lib/auth';
import { Trash2, Star, Clock, MapPin, Sparkles, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Chart = {
  id: string;
  name: string;
  dob: string;
  birth_time: string;
  city: string;
  energy_score: number;
  pillar_scores: Record<string, number>;
  selected_question: string;
  analysis_summary: string;
  created_at: string;
};

type Profile = {
  display_name: string;
  email: string;
  last_session_context: Record<string, unknown>;
};

export default function MyCosmicRecordsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async (userId: string) => {
    const [profileData, chartsData] = await Promise.all([
      getUserProfile(userId),
      getSavedCharts(userId),
    ]);
    setProfile(profileData as Profile);
    setCharts(chartsData as Chart[]);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loadData]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteChart(id);
    setCharts((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
  };

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

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Seeker';
  const lastContext = profile?.last_session_context as Record<string, string> | null;

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
                {lastContext?.selected_question && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Last session: <span style={{ color: GOLD_RGBA(0.7) }}>{lastContext.selected_question}</span>
                    {lastContext.name && <> for <span className="text-slate-300">{lastContext.name}</span></>}
                  </p>
                )}
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
              <p className="text-slate-500 text-sm mt-1">{charts.length} saved chart{charts.length !== 1 ? 's' : ''} in your vault</p>
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

          {charts.length === 0 ? (
            <div
              className="rounded-2xl py-16 text-center"
              style={{ background: 'rgba(11,16,26,0.8)', border: `1px solid ${GOLD_RGBA(0.1)}` }}
            >
              <Star className="w-10 h-10 mx-auto mb-4 opacity-20" style={{ color: GOLD }} />
              <p className="text-slate-400 text-sm mb-5">Your cosmic vault is empty.</p>
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
              {charts.map((chart) => (
                <div
                  key={chart.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(11,16,26,0.85)',
                    border: `1px solid ${GOLD_RGBA(0.15)}`,
                  }}
                >
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}`, background: GOLD_RGBA(0.04) }}
                  >
                    <p className="font-serif font-semibold text-white">{chart.name}</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: GOLD_RGBA(0.12), color: GOLD }}
                      >
                        {chart.energy_score}
                      </div>
                      <button
                        onClick={() => handleDelete(chart.id)}
                        disabled={deletingId === chart.id}
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {chart.dob}{chart.birth_time ? ` · ${chart.birth_time}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {chart.city}
                      </span>
                    </div>
                    {chart.selected_question && (
                      <p className="text-xs" style={{ color: GOLD_RGBA(0.7) }}>
                        Q: {chart.selected_question}
                      </p>
                    )}
                    {chart.analysis_summary && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{chart.analysis_summary}</p>
                    )}
                    {chart.pillar_scores && Object.keys(chart.pillar_scores).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(chart.pillar_scores).slice(0, 4).map(([key, val]) => (
                          <span
                            key={key}
                            className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
                          >
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-600 pt-1">
                      {new Date(chart.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
