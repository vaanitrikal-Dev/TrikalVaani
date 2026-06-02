/**
 * ============================================================
 * TRIKAL VAANI — Milan Share Buttons
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/milan/MilanShareButtons.tsx
 * VERSION: 1.1 — Brand flip (Trikaal Vaani in share text)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * v1.1: "Trikaal Vaani" -> "Trikaal Vaani" in WhatsApp + Email share
 * copy (customer-facing text users forward to family). Domain
 * trikalvaani.com + /api/milan-pdf route untouched.
 *
 * First-class sharing per IR-22:
 *   • WhatsApp (wa.me deep link)
 *   • Email (mailto with subject + body)
 *   • Copy Link (clipboard)
 *   • Download PDF (calls /api/milan-pdf, opens result)
 * ============================================================
 */

'use client';

import { useState } from 'react';

interface MilanShareButtonsProps {
  slug:        string;
  brideName:   string;
  groomName:   string;
  ashtakoot:   number | null;
  resultUrl:   string;   // e.g. https://trikalvaani.com/milan/m-xyz
  pdfUrl?:     string | null;  // pre-loaded if available
}

export default function MilanShareButtons({
  slug,
  brideName,
  groomName,
  ashtakoot,
  resultUrl,
  pdfUrl: initialPdfUrl,
}: MilanShareButtonsProps) {

  const [pdfUrl, setPdfUrl]     = useState<string | null>(initialPdfUrl ?? null);
  const [pdfLoading, setLoading] = useState(false);
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ── WhatsApp share ──────────────────────────────────────
  const whatsappText = encodeURIComponent(
    `🙏 Jai Mahakaal!\n\n` +
    `Hamare rishtedari ka Trikaal Vaani Kundali Milan complete ho gaya.\n\n` +
    `${brideName} × ${groomName}\n` +
    (ashtakoot !== null ? `Ashtakoot: ${ashtakoot}/36\n\n` : '\n') +
    `Poori reading dekhein:\n${resultUrl}\n\n` +
    `Trikaal Vaani · trikalvaani.com 🔱`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  // ── Email share ─────────────────────────────────────────
  const emailSubject = encodeURIComponent(
    `Kundali Milan — ${brideName} × ${groomName} — Trikaal Vaani`
  );
  const emailBody = encodeURIComponent(
    `Pranam,\n\n` +
    `Hamne Trikaal Vaani par hamari rishtedari ka Kundali Milan karwaya hai. ` +
    `Aap bhi dekh sakte hain:\n\n` +
    `Bride: ${brideName}\n` +
    `Groom: ${groomName}\n` +
    (ashtakoot !== null ? `Ashtakoot Score: ${ashtakoot}/36\n` : '') +
    `\nPoori reading is link par:\n${resultUrl}\n\n` +
    `Trikaal Vaani — AI-Powered Vedic Astrology\n` +
    `Rohiit Gupta, Chief Vedic Architect\n` +
    `trikalvaani.com 🔱`
  );
  const emailUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  // ── Copy link ───────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      setError('Copy failed. Long-press the link to copy manually.');
    }
  };

  // ── Download PDF ────────────────────────────────────────
  const handlePdf = async () => {
    setError(null);

    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/milan-pdf', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ slug }),
      });
      const data = await res.json();

      if (!res.ok || !data.pdf_url) {
        setError(data.error ?? 'PDF generation failed. Please try again.');
        return;
      }

      setPdfUrl(data.pdf_url);
      window.open(data.pdf_url, '_blank', 'noopener,noreferrer');
    } catch (e: unknown) {
      setError('PDF service unreachable. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#25D366] hover:bg-[#1da851] text-white font-medium shadow-lg transition"
          aria-label="Share on WhatsApp"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.017-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.711.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          WhatsApp
        </a>

        {/* Email */}
        <a
          href={emailUrl}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1a1a2e] hover:bg-[#252542] text-white font-medium shadow-lg transition border border-[#D4AF37]/30"
          aria-label="Share by Email"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Email
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#1a1a2e] hover:bg-[#252542] text-white font-medium shadow-lg transition border border-[#D4AF37]/30"
          aria-label="Copy result link"
        >
          {copied ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy Link
            </>
          )}
        </button>

        {/* PDF Download */}
        <button
          onClick={handlePdf}
          disabled={pdfLoading}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#b8962e] disabled:opacity-60 disabled:cursor-wait text-[#080B12] font-semibold shadow-lg transition"
          aria-label="Download PDF"
        >
          {pdfLoading ? (
            <>
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/>
              </svg>
              Preparing PDF...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {pdfUrl ? 'Open PDF' : 'Download PDF'}
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-center text-sm text-red-400 mt-3" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
