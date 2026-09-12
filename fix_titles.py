#!/usr/bin/env python3
# ============================================================================
# TRIKAAL VAANI — TITLE FIX PASS  (one deploy, 34 routes)
# ============================================================================
# File:    fix_titles.py   (run from the ROOT of a fresh TrikalVaani clone)
# Version: v1.0 (12 Sep 2026)
# Owner:   Rohiit Gupta, Chief Vedic Architect
#
# WHY THIS EXISTS
#   app/layout.tsx sets  title: { template: "%s | Trikaal Vaani" }.  Any route
#   whose metadata title is a PLAIN STRING gets the brand appended by that
#   template. Dozens of routes also had the brand typed into the string
#   itself, so Google was served the brand TWICE and the title ran past its
#   ~58-character display window — the visible part got cut off.
#
#   Measured live on 12 Sep 2026 by fetching the rendered <title> of every
#   route: 23 pages carried the brand twice (/founder carried it three times,
#   /karmic-background-reading rendered 112 characters), and 11 more were
#   simply too long. /calculators rendered 103. The homepage rendered 76.
#
#   Two ways to fix it: drop the template from layout.tsx, or make every
#   affected route use `title: { absolute }`. This script does the second.
#   Reason: the template is correct for the ~40 routes that are already fine
#   and rely on it; removing it would mean editing those 40 as well, which is
#   more files changed and more that can break.
#
# WHAT IT DOES NOT TOUCH
#   openGraph.title and twitter.title are left alone throughout. Those are for
#   social cards, not search results, and the brand belongs there.
#
# HOW TO RUN  (on the VM — see the companion runbook the assistant gave you)
#   python3 fix_titles.py            # applies and reports
#   python3 fix_titles.py --check    # reports what it WOULD change, no writes
#
# SAFETY
#   Every edit matches one exact string. If a string is not found the script
#   reports it and changes NOTHING in that file — it never guesses a location.
#   Run it only in a throwaway clone, never in ~/trikal-vaani (that folder is
#   on branch master with 20+ uncommitted files).
# ============================================================================

import sys, os, re

CHECK = "--check" in sys.argv

# (path, exact old text, new text, note)
# Titles are sized so the RENDERED title lands at 58 characters or under.
# `{ absolute: ... }` means the layout template adds nothing, so the string
# below is exactly what Google sees.
EDITS = [
 # ── double brand: plain string carrying the brand, template added it again ──
 ("app/astro/page.tsx",
  "  title: 'Start Here — Trikaal Vaani | Free Kundali, Shaadi Milan & Life Answers',",
  "  title: { absolute: 'Start Here — Free Kundali, Milan & Life Answers' },",
  "90 -> 47"),
 ("app/blog/page.tsx",
  "  title: 'Vedic Astrology Blog — Gochar, Kundali & Jyotish | Trikaal Vaani',",
  "  title: { absolute: 'Vedic Astrology Blog — Gochar, Kundali & Jyotish' },",
  "84 -> 48"),
 ("app/contact/page.tsx",
  '  title: "Contact Us | Trikaal Vaani",',
  '  title: { absolute: "Contact Trikaal Vaani — Astrology Support" },',
  "42 double -> 41"),
 ("app/founder/page.tsx",
  '  title: "Rohiit Gupta — Chief Vedic Architect | Trikaal Vaani (Trikaal Vaani)",',
  '  title: { absolute: "Rohiit Gupta — Chief Vedic Architect, Trikaal Vaani" },',
  "84, brand x3 -> 51"),
 ("app/karmic-background-reading/page.tsx",
  "  title: 'Karmic Background Reading — Vedic Personality, Fidelity & Character Patterns | Trikaal Vaani',",
  "  title: { absolute: 'Karmic Background Reading — Personality Patterns' },",
  "112 -> 48"),
 ("app/kundali-milan/page.tsx",
  "export const metadata: Metadata = {\n  title: 'Kundali Milan - Free 36 Guna Matching & Vedic Compatibility | Trikaal Vaani',",
  "export const metadata: Metadata = {\n  title: { absolute: 'Kundali Milan — Free 36 Guna Matching Online' },",
  "95 -> 44"),
 ("app/learn/page.tsx",
  "export const metadata: Metadata = {\n  title: 'Vedic Astrology Knowledge Hub | Trikaal Vaani',",
  "export const metadata: Metadata = {\n  title: { absolute: 'Vedic Astrology Knowledge Hub | Trikaal Vaani' },",
  "61 -> 45"),
 ("app/pricing/page.tsx",
  "  title: 'Pricing — Trikaal Vaani Vedic AI Astrology',",
  "  title: { absolute: 'Pricing — Trikaal Vaani Vedic AI Astrology' },",
  "58 double -> 42"),
 ("app/privacy/page.tsx",
  '  title: "Privacy Policy | Trikaal Vaani",',
  '  title: { absolute: "Privacy Policy | Trikaal Vaani" },',
  "46 double -> 30"),
 ("app/refund/page.tsx",
  '  title: "Refund & Cancellation Policy | Trikaal Vaani",',
  '  title: { absolute: "Refund & Cancellation Policy | Trikaal Vaani" },',
  "64 -> 44"),
 ("app/swapna/page.tsx",
  "export const metadata: Metadata = {\n  title: 'Swapna Shastra | Free Vedic Dream Meaning & Interpretation — Trikaal Vaani',",
  "export const metadata: Metadata = {\n  title: { absolute: 'Swapna Shastra — Free Vedic Dream Meanings' },",
  "94 -> 42"),
 ("app/terms/page.tsx",
  '  title: "Terms of Service | Trikaal Vaani",',
  '  title: { absolute: "Terms of Service | Trikaal Vaani" },',
  "48 double -> 32"),
 ("app/voice-pricing/page.tsx",
  "  title: 'Voice Astrology by Trikaal — ₹11 Voice Predictions in Hindi | Trikaal Vaani',",
  "  title: { absolute: 'Voice Astrology — ₹11 Hindi Voice Predictions' },",
  "91 -> 45"),
 ("app/swapna/reading/page.tsx",
  "  title: 'Your Personal Dream Reading — Trikaal Vaani',",
  "  title: { absolute: 'Your Personal Dream Reading | Trikaal Vaani' },",
  "59 double -> 43"),
 ("app/services/wealth-reading/page.tsx",
  '  title: "Dhana Yoga in Kundali — When Will I Get Rich? | Trikaal Vaani",',
  '  title: { absolute: "Dhana Yoga in Kundali — When Will I Get Rich?" },',
  "77 -> 45"),
 ("app/services/compatibility/page.tsx",
  '  title: "Kundali Matching Beyond Guna Milan — Deep Compatibility Reading | Trikaal Vaani",',
  '  title: { absolute: "Kundali Matching Beyond Guna Milan — Deep Read" },',
  "95 -> 46"),

 # ── calculator layouts: same fault ──
 ("app/calculators/free-sade-sati-calculator/layout.tsx",
  "  title: 'Free Sade Sati Calculator — Check Your Saturn 7.5 Year Period Online | Trikaal Vaani',",
  "  title: { absolute: 'Free Sade Sati Calculator — Saturn 7.5 Year Check' },",
  "100 -> 49"),
 ("app/calculators/free-gemstone-calculator/layout.tsx",
  "  title: 'Free Gemstone Calculator — Your Lucky Ratna by Date of Birth | Trikaal Vaani',",
  "  title: { absolute: 'Free Gemstone Calculator — Lucky Ratna by DOB' },",
  "92 -> 45"),
 ("app/calculators/free-kaal-sarp-dosh-calculator/layout.tsx",
  "  title: 'Free Kaal Sarp Dosh Calculator — Check, Type & Remedies | Trikaal Vaani',",
  "  title: { absolute: 'Free Kaal Sarp Dosh Calculator — Type & Upay' },",
  "91 -> 44"),
 ("app/calculators/free-manglik-dosh-calculator/layout.tsx",
  "  title: 'Free Manglik Dosh Calculator — Check Mangal Dosha Online | Trikaal Vaani',",
  "  title: { absolute: 'Free Manglik Dosh Calculator — Check Online' },",
  "88 -> 43"),
 ("app/calculators/free-nakshatra-calculator/layout.tsx",
  "  title: 'Free Nakshatra Calculator — Find Your Janma Nakshatra Online | Trikaal Vaani',",
  "  title: { absolute: 'Free Nakshatra Calculator — Janma Nakshatra' },",
  "92 -> 43"),
 ("app/calculators/free-pitra-dosh-calculator/layout.tsx",
  "  title: 'Free Pitra Dosh Calculator — Check, Causes & Remedies | Trikaal Vaani',",
  "  title: { absolute: 'Free Pitra Dosh Calculator — Causes & Upay' },",
  "89 -> 42"),
 ("app/calculators/free-ias-astrology-calculator/layout.tsx",
  "export const metadata: Metadata = {\n  title: 'IAS Astrology Calculator — Free & Instant',",
  "export const metadata: Metadata = {\n  title: { absolute: 'IAS Astrology Calculator — Free & Instant' },",
  "61 -> 41"),

 # ── already absolute, only too long ──
 ("app/calculators/page.tsx",
  "    absolute: 'Free Vedic Astrology Calculators — Kundli, Dasha, Nakshatra, Dosha, Gemstone & More | Trikaal Vaani',",
  "    absolute: 'Free Vedic Astrology Calculators — 33 Free Tools',",
  "103 -> 48"),
 ("app/hast-rekha-calculator/page.tsx",
  "    absolute: 'AI Hast Rekha Calculator — Palm Reading by Samudrika Shastra (₹51) | Trikaal Vaani',",
  "    absolute: 'AI Hast Rekha Calculator — Palm Reading ₹51',",
  "82 -> 43"),
 ("app/astrologer-delhi/page.tsx",
  "    absolute: 'Astrologer in Delhi — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',",
  "    absolute: 'Astrologer in Delhi — Rohiit Gupta | Trikaal Vaani',",
  "73 -> 50"),
 ("app/astrologer-noida/page.tsx",
  "    absolute: 'Astrologer in Noida — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',",
  "    absolute: 'Astrologer in Noida — Rohiit Gupta | Trikaal Vaani',",
  "73 -> 50"),
 ("app/astrologer-ghaziabad/page.tsx",
  "    absolute: 'Astrologer in Ghaziabad — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',",
  "    absolute: 'Astrologer in Ghaziabad — Rohiit Gupta | Trikaal Vaani',",
  "77 -> 54"),
 ("app/astrologer-gurgaon/page.tsx",
  "    absolute: 'Astrologer in Gurgaon — Rohiit Gupta, Chief Vedic Architect | Trikaal Vaani',",
  "    absolute: 'Astrologer in Gurgaon — Rohiit Gupta | Trikaal Vaani',",
  "75 -> 52"),
 ("app/calculators/free-dasha-calculator/layout.tsx",
  "  absolute: 'Free Dasha Calculator — Vimshottari Mahadasha & Antardasha Online | Trikaal Vaani',",
  "  absolute: 'Free Dasha Calculator — Vimshottari Mahadasha',",
  "85 -> 45"),
 ("app/page.tsx",
  "export const metadata: Metadata = {\n  title: 'Trikaal Vaani | Free Kundli, Kundali Milan & Accurate AI Vedic Astrology',",
  "export const metadata: Metadata = {\n  title: { absolute: 'Trikaal Vaani — Free Kundli & AI Vedic Astrology' },",
  "homepage 76 -> 48"),

 # ── dynamic routes ──
 ("app/vivah-muhurat/[year]/page.tsx",
  "    title: `Vivah Muhurat ${year} — Shubh Marriage Dates with Time, Nakshatra & Lagna | Trikaal Vaani`,",
  "    title: { absolute: `Vivah Muhurat ${year} — Shubh Dates, Time & Lagna` },",
  "106 -> ~49"),
 ("app/rashifal/[date]/page.tsx",
  "  const title = `Aaj Ka Rashifal ${human} | Daily Horoscope All 12 Signs`;",
  "  const title = `Aaj Ka Rashifal ${human} — 12 Rashi`;",
  "90 -> ~56"),
 ("app/rashifal/[date]/page.tsx",
  "    title,\n    description,",
  "    title: { absolute: title },\n    description,",
  "rashifal: stop the template appending the brand again"),
 ("app/compatibility/[pair]/page.tsx",
  "  return {\n    title:       page.meta_title,\n    description: page.meta_desc,",
  "  return {\n    title:       { absolute: page.meta_title },\n    description: page.meta_desc,",
  "288 pages, 64 -> <=58 (meta_title max is 58)"),
]


def main():
    if not os.path.isdir("app"):
        print("ERROR: run this from the root of the repo clone (no app/ here)")
        sys.exit(1)

    done, missing, skipped = 0, [], 0
    for path, old, new, note in EDITS:
        if not os.path.exists(path):
            missing.append((path, "FILE NOT FOUND"))
            continue
        s = open(path, encoding="utf-8").read()
        if new in s and old not in s:
            print("  = %-58s already done" % path)
            skipped += 1
            continue
        n = s.count(old)
        if n == 0:
            missing.append((path, "text not found: " + old.strip()[:70]))
            continue
        if n > 1:
            missing.append((path, "text found %d times — too risky, skipped" % n))
            continue
        if not CHECK:
            open(path, "w", encoding="utf-8").write(s.replace(old, new, 1))
        print("  %s %-56s %s" % ("?" if CHECK else "OK", path, note))
        done += 1

    print("\n%s %d edits, %d already done, %d problems"
          % ("WOULD APPLY" if CHECK else "APPLIED", done, skipped, len(missing)))
    for p, why in missing:
        print("  !! %-52s %s" % (p, why))
    if missing:
        print("\nNothing was written for the lines above. Send this output back "
              "before pushing — do not hand-edit.")
        sys.exit(2)


if __name__ == "__main__":
    main()
