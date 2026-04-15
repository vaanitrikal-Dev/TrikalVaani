'use client';

import { MessageCircle, Users, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

type Props = {
  score: number;
  name: string;
};

export default function ShareButtons({ score, name }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `${name.split(' ')[0]} bhai, my Trikal Energy Score today is ${score}%! It's based on 5000 years of Vedic wisdom. Check yours for free at https://trikalvaani.com`;

  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const whatsAppGroupUrl = 'https://wa.me/message/trikalvaani-vip';

  function handleCopy() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="space-y-4">
      <a
        href={whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-3 w-full h-14 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          color: '#fff',
          boxShadow: '0 0 30px rgba(34,197,94,0.3)',
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)' }}
        />
        <MessageCircle className="w-5 h-5 relative z-10" />
        <span className="relative z-10">Share my Luck Score on WhatsApp</span>
      </a>

      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
        }}
      >
        <Share2 className="w-4 h-4 text-green-400/60 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed italic">
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
        href={whatsAppGroupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-3 w-full h-14 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300"
        style={{
          background: 'rgba(76,29,149,0.2)',
          border: '1px solid rgba(76,29,149,0.5)',
          color: '#C4B5FD',
        }}
      >
        <Users className="w-5 h-5" />
        <div className="text-left">
          <div className="text-sm font-semibold leading-tight">Join Trikal VIP WhatsApp Group</div>
          <div className="text-xs opacity-70">Free daily cosmic updates &amp; insights</div>
        </div>
      </a>
    </div>
  );
}
