'use client';

import { Users, Copy, Check } from 'lucide-react';
import { useState } from 'react';

type Props = {
  score: number;
  name: string;
  segmentWhatsapp?: string;
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function ShareButtons({ score, name, segmentWhatsapp }: Props) {
  const [copied, setCopied] = useState(false);

  const defaultText = `${name.split(' ')[0]}'s Trikal Energy Score is ${score}/100 today — powered by 5000 years of Vedic wisdom. Check yours free at TrikalVaani.com`;
  const shareText = segmentWhatsapp || defaultText;
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="space-y-3">
      <a
        href={whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-3 w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          color: '#fff',
          boxShadow: '0 0 28px rgba(34,197,94,0.28)',
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)' }}
        />
        <svg className="w-5 h-5 relative z-10 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="relative z-10">Share on WhatsApp</span>
      </a>

      <div
        className="rounded-xl p-3.5 flex items-start gap-3"
        style={{
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.18)',
        }}
      >
        <p className="flex-1 text-xs text-slate-400 leading-relaxed italic">
          &ldquo;{shareText}&rdquo;
        </p>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
          style={{
            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          title="Copy message"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>

      <a
        href="https://wa.me/message/trikalvaani-vip"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          background: GOLD_RGBA(0.07),
          border: `1px solid ${GOLD_RGBA(0.25)}`,
          color: GOLD,
        }}
      >
        <Users className="w-4 h-4" />
        <div className="text-left">
          <div className="text-sm font-semibold leading-tight">Join Trikal VIP Community</div>
          <div className="text-xs opacity-60">Free daily cosmic updates &amp; live Guru Q&amp;A</div>
        </div>
      </a>
    </div>
  );
}
