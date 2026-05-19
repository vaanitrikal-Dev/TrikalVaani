"""
============================================================
  TRIKAL VAANI — Kundali Milan PDF Engine
  File: python-engines/milan_pdf_engine.py
  Author: Rohiit Gupta, Chief Vedic Architect
  Version: 1.0
  ============================================================
  Generates a premium branded PDF for a Kundali Milan reading.

  Pipeline:
    1. Receive slug
    2. Fetch Milan record from Supabase via service-role key
    3. Render HTML template (Devanagari-safe, gold + midnight theme)
    4. Convert HTML → PDF via WeasyPrint
    5. Upload to Supabase Storage bucket `kundali-milan-pdfs`
    6. Return public URL + update kundali_milan.pdf_url
  ============================================================
  Dependencies (installed via setup_vm_pdf.sh):
    - weasyprint
    - supabase-py
    - qrcode[pil]
    - fonts-noto, fonts-noto-cjk, fonts-deva
  ============================================================
"""

import os
import io
import base64
import hashlib
import qrcode
from datetime import datetime
from typing import Dict, Any, Optional
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
from supabase import create_client, Client

# ── Supabase client (server-side, service role) ──────────────
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_BUCKET = "kundali-milan-pdfs"

_supabase: Optional[Client] = None


def _get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise RuntimeError(
                "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars on VM"
            )
        _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase


# ── QR code generator (returns base64 PNG data URL) ──────────
def _make_qr_data_url(url: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#080B12", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


# ── Tier label helper ───────────────────────────────────────
def _tier_label(tier: str) -> str:
    return {
        "basic_51":        "Basic Milan",
        "deep_101_couple": "Deep Reading — Couple",
        "deep_101_parent": "Deep Reading — Parent",
        "both_151":        "Both Versions — Couple + Parent",
    }.get(tier, tier)


# ── Render narrative for HTML (handle BOTH version markers) ──
def _render_narrative_html(narrative: str, audience: str) -> str:
    if not narrative:
        return "<p class='narrative-para'>Reading is being prepared...</p>"

    if audience == "both" and "═══ COUPLE VERSION ═══" in narrative:
        # Split BOTH narrative into 2 sections
        try:
            couple_block, parent_block = narrative.split("═══ PARENT VERSION ═══", 1)
            couple_block = couple_block.replace("═══ COUPLE VERSION ═══", "").strip()
            parent_block = parent_block.strip()
            couple_html = _paragraphs_to_html(couple_block)
            parent_html = _paragraphs_to_html(parent_block)
            return f"""
              <div class="section-title">For The Couple — Hinglish</div>
              {couple_html}
              <div class="page-break"></div>
              <div class="section-title">माता-पिता के लिए — शुद्ध हिन्दी</div>
              {parent_html}
            """
        except ValueError:
            return _paragraphs_to_html(narrative)

    return _paragraphs_to_html(narrative)


def _paragraphs_to_html(text: str) -> str:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    # Single newlines within a paragraph become spaces
    paragraphs = [p.replace("\n", " ") for p in paragraphs]
    return "\n".join(f"<p class='narrative-para'>{_escape_html(p)}</p>" for p in paragraphs)


def _escape_html(s: str) -> str:
    return (
        s.replace("&", "&amp;")
         .replace("<", "&lt;")
         .replace(">", "&gt;")
    )


# ── Build the full HTML template ────────────────────────────
def _build_html(milan: Dict[str, Any], qr_data_url: str) -> str:
    bride = milan.get("bride_data", {}) or {}
    groom = milan.get("groom_data", {}) or {}
    tier = milan.get("tier", "")
    audience = milan.get("audience", "couple")
    ashtakoot_score = milan.get("ashtakoot_score") or 0
    narrative = milan.get("gemini_narrative") or ""
    slug = milan.get("slug", "")
    result_url = f"https://trikalvaani.com/milan/{slug}"
    today_str = datetime.now().strftime("%d %B %Y")

    narrative_html = _render_narrative_html(narrative, audience)
    tier_label = _tier_label(tier)

    # Score interpretation
    if ashtakoot_score >= 28:
        score_band = "Excellent / उत्तम"
    elif ashtakoot_score >= 24:
        score_band = "Very Good / बहुत अच्छा"
    elif ashtakoot_score >= 18:
        score_band = "Acceptable with attention / स्वीकार्य"
    elif ashtakoot_score >= 13:
        score_band = "Needs careful remedies / उपाय आवश्यक"
    else:
        score_band = "Serious doshas — remedies mandatory / गंभीर"

    return f"""<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8">
<title>Trikal Vaani — Kundali Milan — {_escape_html(bride.get('name', ''))} &amp; {_escape_html(groom.get('name', ''))}</title>
</head>
<body>

<!-- ─────────── COVER PAGE ─────────── -->
<section class="cover-page">
  <div class="cover-watermark">माँ शक्ति</div>
  <div class="cover-brand">
    <div class="brand-logo">त्रिकाल वाणी</div>
    <div class="brand-tagline">Trikal Vaani — AI-Powered Vedic Astrology</div>
  </div>
  <div class="cover-title">
    <div class="cover-eyebrow">कुण्डली मिलान — Kundali Milan</div>
    <div class="cover-main">{_escape_html(bride.get('name', ''))}<br><span class="amp">×</span><br>{_escape_html(groom.get('name', ''))}</div>
  </div>
  <div class="cover-meta">
    <div class="cover-meta-row"><span>Bride / कन्या</span><strong>{_escape_html(bride.get('name', ''))} — {_escape_html(bride.get('place', ''))}</strong></div>
    <div class="cover-meta-row"><span>Groom / वर</span><strong>{_escape_html(groom.get('name', ''))} — {_escape_html(groom.get('place', ''))}</strong></div>
    <div class="cover-meta-row"><span>Reading Tier</span><strong>{_escape_html(tier_label)}</strong></div>
    <div class="cover-meta-row"><span>Issued</span><strong>{today_str}</strong></div>
  </div>
  <div class="cover-score-block">
    <div class="cover-score-label">Ashtakoot Milan</div>
    <div class="cover-score-value">{ashtakoot_score} <span class="cover-score-of">/ 36</span></div>
    <div class="cover-score-band">{score_band}</div>
  </div>
  <div class="cover-signature">
    <div class="sig-name">Rohiit Gupta</div>
    <div class="sig-role">Chief Vedic Architect · Trikal Vaani</div>
    <div class="sig-msme">MSME · UDYAM-DL-10-0119070</div>
  </div>
</section>

<div class="page-break"></div>

<!-- ─────────── NARRATIVE PAGES ─────────── -->
<section class="narrative-section">
  <div class="page-header">
    <span class="ph-brand">त्रिकाल वाणी</span>
    <span class="ph-tier">{_escape_html(tier_label)}</span>
  </div>
  <h1 class="reading-title">The Reading / आपका मिलान विश्लेषण</h1>
  <div class="reading-meta">
    {_escape_html(bride.get('name', ''))} &amp; {_escape_html(groom.get('name', ''))}
    · Ashtakoot {ashtakoot_score}/36
  </div>
  {narrative_html}
</section>

<div class="page-break"></div>

<!-- ─────────── CLOSING / VERIFICATION PAGE ─────────── -->
<section class="closing-page">
  <div class="closing-watermark">🔱</div>
  <h2 class="closing-title">Maa Shakti Ki Kripa Banee Rahe<br><span class="closing-sub">माँ शक्ति की कृपा बनी रहे</span></h2>
  <div class="closing-arzi-box">
    <div class="arzi-title">Arzi · Dhanyawad · Wapas Aaiye</div>
    <p>
      Shaadi se pehle Maa ki Arzi karein. Shaadi sampann hone par Dhanyawad arpit karein.
      Trikal Vaani aapka ghar hai. यह चक्र पूर्ण होना अनिवार्य है।
    </p>
  </div>
  <div class="qr-block">
    <img src="{qr_data_url}" class="qr-img" alt="QR" />
    <div class="qr-caption">
      <div>Verify online · इस मिलान को ऑनलाइन देखें</div>
      <div class="qr-url">{result_url}</div>
    </div>
  </div>
  <div class="closing-signature">
    <div class="sig-block">
      <div class="sig-line">Signed</div>
      <div class="sig-name">Rohiit Gupta</div>
      <div class="sig-role">Chief Vedic Architect</div>
      <div class="sig-brand">Trikal Vaani · trikalvaani.com</div>
    </div>
    <div class="sig-disclaimer">
      This reading is based on Vedic Jyotish principles (BPHS, Bhrigu Nadi, Shadbala).
      Remedies are shastra-based suggestions. यह वैदिक शास्त्र पर आधारित है।
    </div>
  </div>
</section>

</body>
</html>"""


# ── Stylesheet (gold + midnight, Devanagari-safe) ───────────
def _build_css() -> str:
    return """
@page {
    size: A4;
    margin: 18mm 14mm 18mm 14mm;
    @bottom-center {
        content: "Trikal Vaani · trikalvaani.com · Page " counter(page) " of " counter(pages);
        font-size: 9pt;
        color: #6b6b6b;
        font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
    }
}

* { box-sizing: border-box; }

body {
    font-family: 'Noto Sans Devanagari', 'Noto Sans', sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    line-height: 1.7;
    font-size: 11pt;
    margin: 0;
    padding: 0;
}

.page-break { page-break-after: always; }

/* ─────────── COVER ─────────── */
.cover-page {
    position: relative;
    height: 247mm;
    background: linear-gradient(170deg, #080B12 0%, #0d1120 60%, #1a1a2e 100%);
    color: #f5f5f5;
    padding: 30mm 22mm 22mm 22mm;
    overflow: hidden;
}
.cover-watermark {
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-18deg);
    font-size: 110pt;
    color: rgba(212, 175, 55, 0.06);
    font-weight: 700;
    pointer-events: none;
    white-space: nowrap;
}
.cover-brand {
    text-align: center;
    margin-bottom: 14mm;
}
.brand-logo {
    font-size: 28pt;
    color: #D4AF37;
    font-weight: 700;
    letter-spacing: 1pt;
}
.brand-tagline {
    font-size: 9pt;
    color: #a0a0a0;
    letter-spacing: 1.5pt;
    text-transform: uppercase;
    margin-top: 2mm;
}
.cover-title {
    text-align: center;
    margin: 18mm 0 14mm 0;
}
.cover-eyebrow {
    font-size: 11pt;
    color: #D4AF37;
    letter-spacing: 4pt;
    text-transform: uppercase;
    margin-bottom: 6mm;
}
.cover-main {
    font-size: 32pt;
    line-height: 1.3;
    color: #ffffff;
    font-weight: 600;
}
.cover-main .amp {
    color: #D4AF37;
    font-size: 24pt;
    font-style: italic;
    display: inline-block;
    margin: 2mm 0;
}
.cover-meta {
    margin: 14mm auto 0 auto;
    width: 100%;
    max-width: 150mm;
    border-top: 1px solid rgba(212, 175, 55, 0.3);
    border-bottom: 1px solid rgba(212, 175, 55, 0.3);
    padding: 6mm 0;
}
.cover-meta-row {
    display: flex;
    justify-content: space-between;
    padding: 2mm 0;
    font-size: 10pt;
    color: #d0d0d0;
}
.cover-meta-row span { color: #888; }
.cover-meta-row strong { color: #ffffff; font-weight: 500; }
.cover-score-block {
    text-align: center;
    margin: 14mm 0 10mm 0;
    padding: 10mm;
    background: rgba(212, 175, 55, 0.08);
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 4mm;
}
.cover-score-label {
    color: #D4AF37;
    font-size: 10pt;
    letter-spacing: 3pt;
    text-transform: uppercase;
}
.cover-score-value {
    font-size: 48pt;
    color: #ffffff;
    font-weight: 700;
    margin: 3mm 0;
}
.cover-score-of {
    color: #D4AF37;
    font-size: 22pt;
    font-weight: 400;
}
.cover-score-band {
    color: #d0d0d0;
    font-size: 11pt;
}
.cover-signature {
    position: absolute;
    bottom: 14mm;
    left: 0;
    right: 0;
    text-align: center;
}
.cover-signature .sig-name {
    font-size: 12pt;
    color: #D4AF37;
    font-weight: 600;
}
.cover-signature .sig-role {
    font-size: 9pt;
    color: #a0a0a0;
    margin-top: 1mm;
}
.cover-signature .sig-msme {
    font-size: 8pt;
    color: #666;
    margin-top: 3mm;
    letter-spacing: 1pt;
}

/* ─────────── NARRATIVE PAGES ─────────── */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #D4AF37;
    padding-bottom: 3mm;
    margin-bottom: 8mm;
    font-size: 9pt;
    color: #6b6b6b;
}
.ph-brand { color: #D4AF37; font-weight: 600; letter-spacing: 1pt; }
.ph-tier  { letter-spacing: 1pt; text-transform: uppercase; }

.reading-title {
    font-size: 20pt;
    color: #080B12;
    margin: 0 0 2mm 0;
    font-weight: 700;
}
.reading-meta {
    font-size: 10pt;
    color: #6b6b6b;
    margin-bottom: 8mm;
    letter-spacing: 1pt;
}

.section-title {
    font-size: 14pt;
    color: #D4AF37;
    font-weight: 700;
    border-left: 3pt solid #D4AF37;
    padding-left: 4mm;
    margin: 8mm 0 5mm 0;
    letter-spacing: 0.5pt;
}

.narrative-para {
    font-size: 11pt;
    line-height: 1.85;
    margin: 0 0 4mm 0;
    text-align: justify;
    text-justify: inter-word;
    orphans: 3;
    widows: 3;
    color: #1a1a1a;
}

/* ─────────── CLOSING PAGE ─────────── */
.closing-page {
    text-align: center;
    padding: 20mm 14mm;
    position: relative;
}
.closing-watermark {
    font-size: 80pt;
    color: rgba(212, 175, 55, 0.15);
    margin-bottom: 8mm;
}
.closing-title {
    font-size: 22pt;
    color: #080B12;
    font-weight: 700;
    line-height: 1.4;
}
.closing-sub {
    font-size: 14pt;
    color: #D4AF37;
    font-weight: 500;
}
.closing-arzi-box {
    margin: 12mm auto;
    max-width: 140mm;
    padding: 8mm;
    background: #fafafa;
    border: 1pt solid #D4AF37;
    border-radius: 3mm;
    text-align: left;
}
.arzi-title {
    color: #D4AF37;
    font-size: 11pt;
    letter-spacing: 2pt;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 4mm;
    font-weight: 600;
}
.closing-arzi-box p {
    font-size: 11pt;
    line-height: 1.8;
    margin: 0;
    color: #1a1a1a;
    text-align: center;
}
.qr-block {
    margin: 10mm auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8mm;
}
.qr-img {
    width: 30mm;
    height: 30mm;
    border: 1pt solid #ddd;
    padding: 2mm;
    background: #fff;
}
.qr-caption {
    text-align: left;
    font-size: 9pt;
    color: #6b6b6b;
}
.qr-caption .qr-url {
    color: #080B12;
    font-weight: 500;
    word-break: break-all;
    margin-top: 1mm;
}
.closing-signature {
    margin-top: 14mm;
    padding-top: 8mm;
    border-top: 1pt solid #D4AF37;
}
.sig-block .sig-line {
    font-size: 8pt;
    color: #999;
    letter-spacing: 2pt;
    text-transform: uppercase;
}
.sig-block .sig-name {
    font-size: 16pt;
    color: #D4AF37;
    font-weight: 700;
    margin-top: 2mm;
}
.sig-block .sig-role {
    font-size: 10pt;
    color: #1a1a1a;
    margin-top: 1mm;
}
.sig-block .sig-brand {
    font-size: 9pt;
    color: #6b6b6b;
    margin-top: 1mm;
}
.sig-disclaimer {
    margin-top: 8mm;
    font-size: 8pt;
    color: #999;
    line-height: 1.5;
    max-width: 130mm;
    margin-left: auto;
    margin-right: auto;
}
"""


# ── Main entry point ────────────────────────────────────────
def generate_milan_pdf(slug: str) -> Dict[str, Any]:
    """
    Generate Milan PDF for the given slug.

    Returns:
        {
          "success": True,
          "pdf_url": "<public Supabase URL>",
          "size_bytes": <int>,
          "slug": <str>,
        }
    """
    if not slug or not isinstance(slug, str):
        raise ValueError("slug required")

    sb = _get_supabase()

    # 1. Load Milan record
    res = (
        sb.table("kundali_milan")
          .select("*")
          .eq("slug", slug)
          .single()
          .execute()
    )

    milan = res.data
    if not milan:
        raise ValueError(f"Milan record not found for slug: {slug}")

    if not milan.get("gemini_narrative"):
        raise ValueError("Milan narrative not yet generated. Run /api/milan-narrative first.")

    # 2. Idempotency: if pdf_url already exists and is fresh, return it
    existing_url = milan.get("pdf_url")
    if existing_url:
        return {
            "success":    True,
            "pdf_url":    existing_url,
            "size_bytes": 0,
            "slug":       slug,
            "cached":     True,
        }

    # 3. Build QR + HTML + CSS
    result_url = f"https://trikalvaani.com/milan/{slug}"
    qr_data_url = _make_qr_data_url(result_url)
    html_str = _build_html(milan, qr_data_url)
    css_str = _build_css()

    # 4. Render PDF with WeasyPrint
    font_config = FontConfiguration()
    pdf_bytes = HTML(string=html_str, base_url=".").write_pdf(
        stylesheets=[CSS(string=css_str, font_config=font_config)],
        font_config=font_config,
    )

    # 5. Upload to Supabase Storage
    file_name = f"{slug}.pdf"
    storage_path = file_name  # flat structure inside bucket

    # Remove if exists (overwrite)
    try:
        sb.storage.from_(SUPABASE_BUCKET).remove([storage_path])
    except Exception:
        pass  # not present yet, fine

    sb.storage.from_(SUPABASE_BUCKET).upload(
        path=storage_path,
        file=pdf_bytes,
        file_options={
            "content-type":  "application/pdf",
            "cache-control": "3600",
            "upsert":        "true",
        },
    )

    # 6. Get public URL
    public_url = sb.storage.from_(SUPABASE_BUCKET).get_public_url(storage_path)
    if public_url.endswith("?"):
        public_url = public_url[:-1]

    # 7. Update kundali_milan.pdf_url
    sb.table("kundali_milan").update({
        "pdf_url":    public_url,
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }).eq("slug", slug).execute()

    return {
        "success":    True,
        "pdf_url":    public_url,
        "size_bytes": len(pdf_bytes),
        "slug":       slug,
        "cached":     False,
    }
