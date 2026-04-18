'use client';

import { useEffect, useState } from 'react';
import { Users, Sparkles } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Dubai', 'London', 'Toronto', 'Sydney',
  'Singapore', 'New York', 'Austin', 'Vancouver', 'Auckland', 'Nairobi',
];

const ACTIONS = [
  'just unlocked their Career Remedy',
  'revealed their Ex-Back karmic score',
  'activated their Wealth Yog report',
  'uncovered their Toxic Boss pattern',
  'checked their Daily Energy Score',
  'received their Nakshatra insight',
  'unlocked their full Life Report',
  'viewed their Dasha timeline',
];

type Toast = {
  id: number;
  city: string;
  action: string;
};

export default function LiveTrustBar() {
  const [count, setCount] = useState(10666);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);

  useEffect(() => {
    const counterInterval = setInterval(() => {
      if (Math.random() < 0.6) {
        setCount((c) => c + 1);
      }
    }, 45000);

    return () => clearInterval(counterInterval);
  }, []);

  useEffect(() => {
    const showToast = () => {
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      const id = Date.now();

      setToastId((prev) => prev + 1);
      setToasts((prev) => [...prev.slice(-2), { id, city, action }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    showToast();
    const interval = setInterval(showToast, 12000 + Math.random() * 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="py-3 px-4"
        style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}`, background: 'rgba(8,11,18,0.6)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
            />
            <span className="text-xs text-slate-400">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
            <span className="text-xs font-semibold text-white">
              {count.toLocaleString('en-IN')}+
            </span>
            <span className="text-xs text-slate-500">seekers analysed</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.6) }} />
            <span className="text-xs text-slate-500">4.9 ★ average rating</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-5 left-4 z-[100] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={`${toast.id}-${toastId}`}
            className="flex items-start gap-3 px-4 py-3 rounded-2xl max-w-xs animate-slide-up"
            style={{
              background: 'rgba(11,16,26,0.96)',
              border: `1px solid ${GOLD_RGBA(0.2)}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 16px ${GOLD_RGBA(0.08)}`,
              backdropFilter: 'blur(16px)',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.25)}` }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: GOLD }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-snug">
                Seeker from {toast.city}
              </p>
              <p className="text-xs text-slate-400 leading-snug mt-0.5">{toast.action}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
