#!/usr/bin/env python3
"""
════════════════════════════════════════════════════════════════════════════════
TRIKAAL VAANI — FESTIVAL DATE REFRESH
VERSION 1.0 (25 Aug 2026)
════════════════════════════════════════════════════════════════════════════════

Recomputes every lunar festival date in festivals_master from festival_engine
and writes the result back to Supabase.

WHY THIS RUNS INSTEAD OF SOMEONE TYPING DATES

The 2026 rows were 13-19 days wrong, and the tell was that Dussehra (Ashwin
Shukla DASHAMI) sat one day BEFORE Navratri Day 9 (NAVAMI). No calendar can
produce that ordering, so the dates had never been computed — they were typed or
copied from another year. Correcting them by hand fixes 2026 and leaves 2027 to
fail identically. This closes that loop.

WHAT IT WILL NOT TOUCH

  - Solar festivals (Makar Sankranti, Baisakhi) and fixed-date ones (Republic
    Day, Christmas). They have no tithi, the engine returns None, and the row is
    left exactly as it is.
  - Any column other than `date`, `regional_note` and `updated_at`. All of the
    content — gemini_content, seo_title, offerings, mantra, puja_vidhi — is
    untouched.

SAFETY

Dry run is the default. Nothing is written until you pass --apply. Every run
prints the full before/after list first, and refuses to write if the internal
ordering check fails (Navami before Dashami, Diwali before Govardhan).

USAGE
    python3 refresh_festival_dates.py --year 2027                 # dry run
    python3 refresh_festival_dates.py --year 2027 --apply         # write
    python3 refresh_festival_dates.py --year 2027 --city mumbai

SETUP (once)
    pip install pyswisseph supabase
    export SUPABASE_URL="https://<project>.supabase.co"
    export SUPABASE_SERVICE_KEY="<service_role key>"

CRON — first of every December, prepares the coming year well in advance:
    0 3 1 12 * cd /home/vaanitrikal/trikal-vaani/python-engines && \
      /home/vaanitrikal/trikal-env/bin/python refresh_festival_dates.py \
      --year $(date -d "+1 year" +%Y) --apply >> ~/festival_refresh.log 2>&1
════════════════════════════════════════════════════════════════════════════════
"""

import argparse
import json
import os
import sys
from datetime import date

try:
    import festival_engine as fe
except ImportError:
    sys.exit("festival_engine.py must sit beside this script.")


# ── ordering rules that must hold in any real Hindu calendar ────────────────
# These are the checks that would have caught the original bug before a client
# ever saw it. A pair is only checked when both slugs are present.
# ("earlier", "later", strict)
# strict=False allows the two to share a date. That matters for the Devi days:
# a tithi kshaya can shorten Navratri — 2028 gives eight days for nine Devis — and
# two days then legitimately merge. Merging is real observance; going BACKWARDS
# never is, which is why every boundary below stays strict.
ORDERING_RULES = [
    ("navratri-day-1", "navratri-day-2", False),
    ("navratri-day-2", "navratri-day-3", False),
    ("navratri-day-3", "navratri-day-4", False),
    ("navratri-day-4", "navratri-day-5", False),
    ("navratri-day-5", "navratri-day-6", False),
    ("navratri-day-6", "navratri-day-7", False),
    ("navratri-day-7", "navratri-day-8", False),
    ("navratri-day-8", "navratri-day-9", False),
    ("navratri-day-9", "dussehra",       True),   # Navami MUST precede Dashami
    ("dhanteras",      "diwali",         True),
    ("diwali",         "govardhan-puja", True),
    ("govardhan-puja", "bhai-dooj",      True),
    ("hartalika-teej", "ganesh-chaturthi", True),
]


def _client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_KEY first.")
    try:
        from supabase import create_client
    except ImportError:
        sys.exit("pip install supabase")
    return create_client(url, key)


def check_ordering(computed: dict):
    """computed: slug -> ISO date. Returns a list of violations."""
    def find(fragment):
        for slug, d in computed.items():
            if fragment in slug and d:
                return slug, d
        return None, None

    problems = []
    for earlier, later, strict in ORDERING_RULES:
        s1, d1 = find(earlier)
        s2, d2 = find(later)
        if not (d1 and d2):
            continue
        if d1 > d2 or (strict and d1 == d2):
            word = "BEFORE" if strict else "on or before"
            problems.append(f"{s1} ({d1}) must fall {word} {s2} ({d2})")
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--year", type=int, required=True)
    ap.add_argument("--city", default="delhi")
    ap.add_argument("--apply", action="store_true",
                    help="write to Supabase; without this it is a dry run")
    args = ap.parse_args()

    sb = _client()
    rows = (sb.table("festivals_master")
              .select("id,festival_slug,festival_name,defining_tithi,date")
              .eq("year", args.year).execute().data or [])
    if not rows:
        sys.exit(f"No festivals_master rows for year {args.year}.")

    print(f"\nFestival date refresh — year {args.year}, city {args.city}")
    print(f"{'FESTIVAL':34} {'STORED':12} {'COMPUTED':12} {'CHANGE':>7}  RULE")
    print("-" * 92)

    updates, skipped, computed = [], 0, {}
    for r in rows:
        slug = r["festival_slug"]
        res = fe.resolve_row(r.get("defining_tithi"), slug, args.year, args.city)
        if not res or not res.get("date"):
            skipped += 1
            print(f"{r['festival_name'][:32]:34} {str(r['date']):12} {'—':12} "
                  f"{'—':>7}  solar or fixed date, left untouched")
            continue

        new = res["date"]
        computed[slug] = new
        old = str(r["date"]) if r.get("date") else None
        delta = ""
        if old and old != new:
            delta = f"{(date.fromisoformat(new) - date.fromisoformat(old)).days:+d}d"
        note = ""
        if res.get("variants"):
            note = " | ".join(v["note"] for v in res["variants"])
        if old != new or note:
            updates.append({"id": r["id"], "slug": slug, "date": new, "note": note})
        print(f"{r['festival_name'][:32]:34} {str(old):12} {new:12} "
              f"{(delta or 'same'):>7}  {res['vyapini_rule']}")
        for v in res.get("variants", []):
            print(f"{'':34} └─ {v['tradition']}: {v['date']}")

    problems = check_ordering(computed)
    print(f"\ncomputed {len(computed)} · unchanged-or-skipped {skipped} · to update {len(updates)}")

    if problems:
        print("\nORDERING CHECK FAILED — refusing to write:")
        for p in problems:
            print("   ✗", p)
        print("\nThis is the check the old static table never had. Fix the rule in")
        print("festival_engine.py (VYAPINI_BY_SLUG or RELATIVE_TO) and run again.")
        sys.exit(1)
    print("ordering check passed — Navami before Dashami, Diwali before Govardhan, etc.")

    if not args.apply:
        print("\nDRY RUN. Nothing written. Re-run with --apply once the dates look right.")
        return

    for u in updates:
        payload = {"date": u["date"], "updated_at": "now()"}
        if u["note"]:
            payload["regional_note"] = u["note"]
        sb.table("festivals_master").update(payload).eq("id", u["id"]).execute()
    print(f"\nwritten: {len(updates)} rows updated in festivals_master.")


if __name__ == "__main__":
    main()
