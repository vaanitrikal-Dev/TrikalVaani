/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: PDF DOWNLOAD — BRANDED KUNDALI REPORT WITH WATERMARK
 *
 * USES: jsPDF + html2canvas (client-side, no server needed)
 * WATERMARK: Trikal Vaani logo (semi-transparent, diagonal)
 * PRICING: Free basic PDF / ₹99 premium PDF (watermark-free)
 *
 * INSTALL (add to package.json if not present):
 *   npm install jspdf html2canvas
 */

'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

const GOLD      = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Planet = {
  name: string;
  rashi: string;
  house: number;
  strength: number;
  isRetrograde: boolean;
  nakshatra: string;
  degree: number;
};

export type DownloadPDFProps = {
  name: string;
  dob: string;
  city: string;
  lagna: string;
  nakshatra: string;
  mahadasha: string;
  antardasha: string;
  pratayantarLord?: string;
  dashaBalance: string;
  planets: Planet[];
  mainPrediction?: string;
  keyDates?: string;
  actionAdvice?: string;
  lang?: 'hindi' | 'hinglish' | 'english';
  isPremium?: boolean; // ₹99 = no watermark
};

// ─── PLANET STRENGTH LABEL ────────────────────────────────────────────────────
function strengthLabel(s: number): string {
  if (s >= 80) return 'Uchcha';
  if (s >= 65) return 'Balwaan';
  if (s >= 45) return 'Madhyam';
  return 'Neech';
}

// ─── PLANET HINDI NAMES ───────────────────────────────────────────────────────
const PLANET_HI: Record<string, string> = {
  Sun: 'Surya ☀️', Moon: 'Chandra 🌙', Mars: 'Mangal ♂',
  Mercury: 'Budh ☿', Jupiter: 'Guru ♃', Venus: 'Shukra ♀',
  Saturn: 'Shani ♄', Rahu: 'Rahu ☊', Ketu: 'Ketu ☋',
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DownloadPDF({
  name, dob, city, lagna, nakshatra, mahadasha, antardasha,
  pratayantarLord, dashaBalance, planets,
  mainPrediction, keyDates, actionAdvice,
  lang = 'hinglish', isPremium = false,
}: DownloadPDFProps) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);
    try {
      // Dynamic import — only load jsPDF when needed (saves bundle size)
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const W = 210; // A4 width mm
      const H = 297; // A4 height mm
      const margin = 18;
      const contentW = W - margin * 2;
      let y = margin;

      // ── COLORS ──────────────────────────────────────────────────────────────
      const gold     = [212, 175, 55] as [number,number,number];
      const dark     = [8, 11, 18] as [number,number,number];
      const white    = [255, 255, 255] as [number,number,number];
      const slate    = [148, 163, 184] as [number,number,number];
      const purple   = [124, 58, 237] as [number,number,number];
      const green    = [34, 197, 94] as [number,number,number];

      // ── BACKGROUND ──────────────────────────────────────────────────────────
      doc.setFillColor(...dark);
      doc.rect(0, 0, W, H, 'F');

      // ── WATERMARK (diagonal, semi-transparent) ───────────────────────────────
      if (!isPremium) {
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
        doc.setTextColor(212, 175, 55);
        doc.setFontSize(42);
        doc.setFont('helvetica', 'bold');

        // Diagonal watermark — repeat across page
        for (let wx = -20; wx < W + 20; wx += 80) {
          for (let wy = 30; wy < H + 30; wy += 60) {
            doc.saveGraphicsState();
            doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
            // Rotate text
            const rad = -30 * Math.PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            doc.text('TRIKAL VAANI', wx, wy, { angle: 30 });
          }
        }
        doc.restoreGraphicsState();
      }

      // ── HEADER BAND ─────────────────────────────────────────────────────────
      doc.setFillColor(15, 5, 35);
      doc.rect(0, 0, W, 42, 'F');

      // Gold accent line
      doc.setFillColor(...gold);
      doc.rect(0, 40, W, 1.5, 'F');

      // Brand name
      doc.setTextColor(...gold);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('TRIKAL VAANI', margin, 18);

      // Tagline
      doc.setTextColor(...slate);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('त्रिकाल — Past · Present · Future  |  trikalvaani.com', margin, 26);

      // Report label top right
      doc.setTextColor(...gold);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('KUNDALI REPORT', W - margin, 15, { align: 'right' });
      doc.setTextColor(...slate);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, W - margin, 22, { align: 'right' });
      doc.text('Rohiit Gupta · Chief Vedic Architect', W - margin, 29, { align: 'right' });

      y = 52;

      // ── PERSON INFO CARD ────────────────────────────────────────────────────
      doc.setFillColor(20, 10, 50);
      doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentW, 28, 3, 3, 'S');

      doc.setTextColor(...white);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(name, margin + 6, y + 10);

      doc.setTextColor(...slate);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${dob}  ·  ${city}  ·  Trikal Engine V15  ·  Lahiri Ayanamsha`, margin + 6, y + 18);

      // Dasha balance badge
      doc.setFillColor(...gold);
      doc.roundedRect(margin + 6, y + 21, contentW - 12, 5, 1.5, 1.5, 'F');
      doc.setTextColor(...dark);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`⏳  ${dashaBalance}`, margin + 10, y + 24.5);

      y += 36;

      // ── LAGNA / NAKSHATRA / MAHADASHA GRID ──────────────────────────────────
      const col3W = (contentW - 8) / 3;
      const gridItems = [
        { label: 'LAGNA', value: lagna, sub: 'Ascendant' },
        { label: 'NAKSHATRA', value: nakshatra, sub: 'Birth Star' },
        { label: 'MAHADASHA', value: mahadasha, sub: antardasha + (pratayantarLord ? ` · ${pratayantarLord}` : '') },
      ];

      gridItems.forEach((item, i) => {
        const x = margin + i * (col3W + 4);
        doc.setFillColor(10, 5, 28);
        doc.roundedRect(x, y, col3W, 22, 2, 2, 'F');
        doc.setDrawColor(212, 175, 55, 0.3);
        doc.setLineWidth(0.2);
        doc.roundedRect(x, y, col3W, 22, 2, 2, 'S');

        doc.setTextColor(...slate);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text(item.label, x + 4, y + 6);

        doc.setTextColor(...gold);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value, x + 4, y + 14);

        doc.setTextColor(...slate);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(item.sub, x + 4, y + 20);
      });

      y += 30;

      // ── SECTION TITLE: PLANETS ───────────────────────────────────────────────
      doc.setFillColor(...gold);
      doc.rect(margin, y, 2, 8, 'F');
      doc.setTextColor(...gold);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PLANET POSITIONS', margin + 6, y + 6);
      y += 14;

      // Planet table header
      const colW = [40, 35, 25, 30, 30, 28];
      const colX = colW.reduce((acc: number[], w, i) => {
        acc.push(i === 0 ? margin : acc[i - 1]! + colW[i - 1]!);
        return acc;
      }, []);

      const headers = ['Planet', 'Rashi · House', 'Degree', 'Nakshatra', 'Strength', 'Status'];
      doc.setFillColor(20, 10, 50);
      doc.rect(margin, y, contentW, 7, 'F');
      headers.forEach((h, i) => {
        doc.setTextColor(...gold);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text(h, colX[i]! + 2, y + 5);
      });
      y += 9;

      // Planet rows
      planets.slice(0, 9).forEach((p, idx) => {
        const rowBg = idx % 2 === 0 ? [8, 4, 20] : [12, 6, 30];
        doc.setFillColor(...(rowBg as [number,number,number]));
        doc.rect(margin, y, contentW, 8, 'F');

        const cells = [
          PLANET_HI[p.name] ?? p.name,
          `${p.rashi}  H${p.house}`,
          `${p.degree}°`,
          p.nakshatra,
          `${p.strength}%`,
          strengthLabel(p.strength) + (p.isRetrograde ? ' ℞' : ''),
        ];

        cells.forEach((cell, i) => {
          // Color strength column
          if (i === 5) {
            const sColor = p.strength >= 80 ? green : p.strength >= 65 ? gold : p.strength >= 45 ? slate : [239, 68, 68] as [number,number,number];
            doc.setTextColor(...(sColor as [number,number,number]));
          } else {
            doc.setTextColor(...(i === 0 ? white : slate));
          }
          doc.setFontSize(7);
          doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
          doc.text(cell, colX[i]! + 2, y + 5.5);
        });
        y += 9;
      });

      y += 6;

      // ── PREDICTION SECTION ───────────────────────────────────────────────────
      if (mainPrediction) {
        // Section header
        doc.setFillColor(30, 10, 60);
        doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
        doc.setFillColor(...purple);
        doc.roundedRect(margin, y, 3, 8, 1, 1, 'F');
        doc.setTextColor(196, 181, 253);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('🔮  JINI\'S PREDICTION', margin + 8, y + 5.5);
        y += 14;

        // Prediction text — wrap long text
        doc.setTextColor(...white);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(mainPrediction, contentW - 4);
        lines.forEach((line: string) => {
          if (y > H - 40) {
            doc.addPage();
            doc.setFillColor(...dark);
            doc.rect(0, 0, W, H, 'F');
            y = margin;
          }
          doc.text(line, margin + 2, y);
          y += 5.5;
        });
        y += 6;
      }

      // ── KEY DATES ────────────────────────────────────────────────────────────
      if (keyDates) {
        if (y > H - 50) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, W, H, 'F'); y = margin; }

        doc.setFillColor(212, 175, 55, 0.08);
        const kdLines = doc.splitTextToSize(keyDates, contentW - 8);
        const kdH = kdLines.length * 5.5 + 16;
        doc.roundedRect(margin, y, contentW, kdH, 2, 2, 'F');
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y, contentW, kdH, 2, 2, 'S');

        doc.setTextColor(...gold);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('📅  KEY DATES', margin + 4, y + 7);

        doc.setTextColor(...white);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        kdLines.forEach((line: string, i: number) => {
          doc.text(line, margin + 4, y + 14 + i * 5.5);
        });
        y += kdH + 6;
      }

      // ── ACTION ADVICE ────────────────────────────────────────────────────────
      if (actionAdvice) {
        if (y > H - 50) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, W, H, 'F'); y = margin; }

        doc.setFillColor(34, 197, 94, 0.05);
        const aaLines = doc.splitTextToSize(actionAdvice, contentW - 8);
        const aaH = aaLines.length * 5.5 + 16;
        doc.roundedRect(margin, y, contentW, aaH, 2, 2, 'F');
        doc.setDrawColor(...green);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, y, contentW, aaH, 2, 2, 'S');

        doc.setTextColor(...green);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('⚡  ACTION NOW', margin + 4, y + 7);

        doc.setTextColor(...white);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        aaLines.forEach((line: string, i: number) => {
          doc.text(line, margin + 4, y + 14 + i * 5.5);
        });
        y += aaH + 6;
      }

      // ── FOOTER ───────────────────────────────────────────────────────────────
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg);

        // Footer band
        doc.setFillColor(15, 5, 35);
        doc.rect(0, H - 18, W, 18, 'F');
        doc.setFillColor(...gold);
        doc.rect(0, H - 18, W, 0.5, 'F');

        // Tagline
        doc.setTextColor(...gold);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text('"Kaal bada balwan hai — aur aapka Kaal, aapki Kundali mein likha hai"', W / 2, H - 12, { align: 'center' });

        // Page + credits
        doc.setTextColor(...slate);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${pg} of ${totalPages}`, margin, H - 6);
        doc.text('rohiit@trikalvaani.com  ·  trikalvaani.com  ·  Powered by Swiss Ephemeris', W / 2, H - 6, { align: 'center' });
        doc.text('For educational purposes only', W - margin, H - 6, { align: 'right' });

        // Watermark text on each page
        if (!isPremium) {
          doc.setTextColor(212, 175, 55);
          doc.setFontSize(36);
          doc.setFont('helvetica', 'bold');
          doc.saveGraphicsState();
          // jsPDF opacity workaround
          const gState = new (doc as any).GState({ opacity: 0.05 });
          doc.setGState(gState);
          doc.text('TRIKAL VAANI', W / 2, H / 2, { align: 'center', angle: 45 });
          doc.restoreGraphicsState();
        }
      }

      // ── SAVE ─────────────────────────────────────────────────────────────────
      const fileName = `TrikalVaani_${name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

    } catch (err) {
      console.error('[Trikal] PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={loading}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:             8,
        padding:        '10px 20px',
        background:     loading
          ? GOLD_RGBA(0.2)
          : `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
        border:         'none',
        borderRadius:    10,
        cursor:          loading ? 'not-allowed' : 'pointer',
        fontSize:        13,
        fontWeight:      700,
        color:           '#080B12',
        boxShadow:       loading ? 'none' : `0 0 20px ${GOLD_RGBA(0.3)}`,
        transition:      'all 0.2s',
      }}
    >
      {loading ? (
        <>
          <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
          Generating PDF...
        </>
      ) : (
        <>
          <Download style={{ width: 16, height: 16 }} />
          Download Report
          {!isPremium && (
            <span style={{
              fontSize: 9, fontWeight: 700,
              background: 'rgba(8,11,18,0.3)',
              padding: '1px 6px', borderRadius: 10,
            }}>
              FREE
            </span>
          )}
        </>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
