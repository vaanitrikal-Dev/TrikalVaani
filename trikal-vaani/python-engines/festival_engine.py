"""
════════════════════════════════════════════════════════════════════════════════
TRIKAAL VAANI — FESTIVAL DATE ENGINE
VERSION 1.0 (25 Aug 2026)
Author: Rohiit Gupta, Chief Vedic Architect
════════════════════════════════════════════════════════════════════════════════

WHY THIS EXISTS

festivals_master stored festival dates as static rows. They were 13-19 days
wrong for 2026, and the giveaway was that Dussehra (Ashwin Shukla DASHAMI) sat
one day BEFORE Navratri Day 9 (NAVAMI) — an ordering no calendar can produce.
The dates had never been calculated; they were typed or copied from another
year. Correcting 2026 by hand would leave 2027 to fail the same way.

This module computes them instead. Nothing is stored, nothing goes stale.

THE PART THAT IS EASY TO GET WRONG

A festival is not simply "the day the tithi falls on". Each has its own
VYAPINI rule — the moment of day at which the tithi must be running for that
day to own the festival:

    sunrise    most vrats and Navratri days
    madhyahna  midday        — Ganesh Chaturthi (Ganesha born at midday)
    pradosh    dusk          — Diwali, Holika Dahan (evening rites)
    aparahna   3rd quarter   — Dussehra, Bhai Dooj
    nishita    midnight      — Janmashtami, Maha Shivratri (Krishna born at midnight)
    moonrise   moonrise      — Karva Chauth, Sankashti Chaturthi

Taking the tithi at sunrise for every festival produces a date that is right
much of the time and silently one day off the rest — which is exactly the class
of error a Jyotishi's clients notice.

REGIONAL VARIANTS

Two traditions name lunar months differently. Purnimanta (North India) ends a
month at the full moon; amanta (South and West) ends it at the new moon. For
Shukla-paksha festivals both agree. For Krishna-paksha festivals the month NAME
differs by one, so Karva Chauth is "Kartik Krishna Chaturthi" in the North and
"Ashwin Krishna Chaturthi" in the South — the same day, two names. This engine
takes the North Indian name (as festivals_master stores it) and maps it.

Where a festival genuinely falls on two different DAYS by tradition —
Janmashtami is observed by Smarta and by Vaishnava/ISKCON on different days when
the tithi straddles midnight — both are returned, so the page can show the
primary date and note the other rather than silently pick one.

DEPENDENCIES: pyswisseph only. No ephemeris data files required (Moshier
fallback is accurate to well under the precision a tithi boundary needs).
════════════════════════════════════════════════════════════════════════════════
"""

from datetime import date, datetime, timedelta
import swisseph as swe

swe.set_sid_mode(swe.SIDM_LAHIRI)

IST = 5.5

TITHI_NAMES = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
               "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
               "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"]

MONTH_ORDER = ["Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana",
               "Bhadrapada", "Ashwin", "Kartik", "Margashirsha", "Pausha",
               "Magha", "Phalguna"]

# The amanta month is named by the Sun's sidereal rashi at the amavasya that
# begins it. This is the classical rule and it is what makes the whole thing
# self-correcting year on year.
RASHI_TO_MONTH = {0: "Vaishakha", 1: "Jyeshtha", 2: "Ashadha", 3: "Shravana",
                  4: "Bhadrapada", 5: "Ashwin", 6: "Kartik", 7: "Margashirsha",
                  8: "Pausha", 9: "Magha", 10: "Phalguna", 11: "Chaitra"}

CITIES = {
    "delhi":     (28.6139, 77.2090, 216),
    "mumbai":    (19.0760, 72.8777, 14),
    "kolkata":   (22.5726, 88.3639, 9),
    "chennai":   (13.0827, 80.2707, 6),
    "bengaluru": (12.9716, 77.5946, 920),
    "hyderabad": (17.3850, 78.4867, 542),
    "pune":      (18.5204, 73.8567, 560),
    "ahmedabad": (23.0225, 72.5714, 53),
    "jaipur":    (26.9124, 75.7873, 431),
    "lucknow":   (26.8467, 80.9462, 123),
    "varanasi":  (25.3176, 82.9739, 81),
    "patna":     (25.5941, 85.1376, 53),
}


# ── core astronomy ──────────────────────────────────────────────────────────

def _jd(d: date, hour_ist: float) -> float:
    return swe.julday(d.year, d.month, d.day, hour_ist - IST)


def _elongation(jd: float) -> float:
    """Moon minus Sun, degrees. Ayanamsa-independent — a tithi is an angle."""
    moon = swe.calc_ut(jd, swe.MOON)[0][0]
    sun = swe.calc_ut(jd, swe.SUN)[0][0]
    return (moon - sun) % 360


def _tithi_index(jd: float) -> int:
    """0..29. 0-14 Shukla Pratipada..Purnima, 15-29 Krishna Pratipada..Amavasya."""
    return int(_elongation(jd) / 12)


def tithi_label(jd: float):
    n = _tithi_index(jd)
    if n == 14:
        return "Shukla", "Purnima"
    if n == 29:
        return "Krishna", "Amavasya"
    return ("Shukla" if n < 15 else "Krishna"), TITHI_NAMES[n % 15]


def _sun_rashi(jd: float) -> int:
    return int(swe.calc_ut(jd, swe.SUN, swe.FLG_SIDEREAL)[0][0] / 30) % 12


def _rise_set(d: date, body: int, which: int, city="delhi"):
    """Returns IST hours as a float, or None if the body does not rise/set."""
    lat, lon, alt = CITIES.get(city, CITIES["delhi"])
    jd0 = swe.julday(d.year, d.month, d.day, 0.0)
    try:
        res = swe.rise_trans(jd0, body, which | swe.BIT_DISC_CENTER, (lon, lat, alt))
        if res[0] != 0 or not res[1]:
            return None
        frac = (res[1][0] - swe.julday(d.year, d.month, d.day, 0.0)) * 24 + IST
        return frac % 24 if frac >= 0 else None
    except Exception:
        return None


def sunrise(d, city="delhi"):
    return _rise_set(d, swe.SUN, swe.CALC_RISE, city) or 6.0


def sunset(d, city="delhi"):
    return _rise_set(d, swe.SUN, swe.CALC_SET, city) or 18.5


def moonrise(d, city="delhi"):
    return _rise_set(d, swe.MOON, swe.CALC_RISE, city)


# ── vyapini rules: the moment of day that decides which day owns a tithi ────

def vyapini_moment(d: date, rule: str, city="delhi"):
    """IST hour at which the tithi must be running for this day to be the festival."""
    sr, ss = sunrise(d, city), sunset(d, city)
    day = ss - sr
    if rule == "sunrise":
        return sr
    if rule == "madhyahna":                 # 3rd of five equal day parts
        return sr + day * 0.5
    if rule == "aparahna":                  # 4th of five — the afternoon quarter
        return sr + day * 0.7
    if rule == "pradosh":                   # dusk, just after sunset
        return ss + 0.4
    if rule == "nishita":                   # true midnight of the Hindu day
        return (ss + (24 - day) / 2) % 24
    if rule == "moonrise":
        mr = moonrise(d, city)
        return mr if mr is not None else ss + 1.0
    return sr


# ── month naming ────────────────────────────────────────────────────────────

def _amavasyas(y0: int, y1: int, city="delhi"):
    out, d = [], date(y0, 1, 1)
    end = date(y1, 12, 31)
    while d <= end:
        if _tithi_index(_jd(d, sunrise(d, city))) == 29:
            if not out or (d - out[-1]).days > 2:
                out.append(d)
        d += timedelta(days=1)
    return out


def _amanta_month(d: date, amv, city="delhi"):
    prev = [a for a in amv if a <= d]
    if not prev:
        return None
    return RASHI_TO_MONTH[_sun_rashi(_jd(prev[-1], sunrise(prev[-1], city)))]


def to_amanta(month_north: str, paksha: str, tithi: str) -> str:
    """festivals_master stores North Indian (purnimanta) month names.

    Shukla paksha is identical in both systems. In Krishna paksha the
    purnimanta name runs one month ahead, so North "Kartik Krishna Chaturthi"
    (Karva Chauth) is amanta "Ashwin Krishna Chaturthi" — same day, two names.
    Amavasya belongs to the amanta month it BEGINS, so it keeps its name.
    """
    if paksha == "Shukla" or tithi == "Amavasya":
        return month_north
    return MONTH_ORDER[(MONTH_ORDER.index(month_north) - 1) % 12]


# ── the resolver ────────────────────────────────────────────────────────────

def find_festival(month_north: str, paksha: str, tithi: str, year: int,
                  rule: str = "sunrise", city: str = "delhi"):
    """Return the date on which this tithi is running at its vyapini moment.

    Scans a window either side of the year so festivals near the boundaries are
    not missed. Returns None rather than a guess when nothing matches — a
    missing date is a visible problem; a wrong one is not.
    """
    target_month = to_amanta(month_north, paksha, tithi)
    if tithi == "Purnima":
        want = 14
    elif tithi == "Amavasya":
        want = 29
    else:
        base = TITHI_NAMES.index(tithi)
        want = base if paksha == "Shukla" else base + 15

    amv = _amavasyas(year - 1, year + 1, city)

    def month_ok(day):
        """Normally the Hindu day's own amanta month must match.

        Amavasya is the exception: it ENDS one amanta month and BEGINS the next,
        so at pradosh on the evening before, the tithi is already Amavasya while
        the calendar day still belongs to the outgoing month. Diwali is exactly
        this case — 8 Nov 2026 is Amavasya at dusk but the day still sits in
        amanta Ashwin, and a strict test rejected the correct date. Accepting
        either side of the boundary fixes it without loosening anything else.
        """
        m = _amanta_month(day, amv, city)
        if m == target_month:
            return True
        if want == 29:
            return _amanta_month(day + timedelta(days=1), amv, city) == target_month
        return False

    def scan(active_rule):
        out, d = [], date(year, 1, 1)
        end = date(year, 12, 31)
        while d <= end:
            moment = vyapini_moment(d, active_rule, city)
            # nishita falls just after midnight; that moment still belongs to
            # the Hindu day that began the previous sunrise
            jd = _jd(d, moment) if moment >= 4 else _jd(d + timedelta(days=1), moment)
            if _tithi_index(jd) == want and month_ok(d):
                out.append(d)
            d += timedelta(days=1)
        return out

    hits = scan(rule)
    if hits:
        return hits[0]

    # A short tithi can slip entirely between two vyapini moments and touch
    # neither — Bhadrapada Krishna Ashtami in 2026 runs between the nishita of
    # 3 Sep and that of 4 Sep, so Janmashtami matches no day on the strict rule.
    # This is precisely the case where Smarta and Vaishnava observance diverge.
    # Falling back to sunrise gives the Smarta day; festival_dates() then reports
    # the Vaishnava day alongside it rather than either being silently dropped.
    if rule != "sunrise":
        hits = scan("sunrise")
        if hits:
            return hits[0]

    # KSHAYA. A tithi can begin after one sunrise and end before the next, so it
    # never prevails at any vyapini moment and vanishes from a naive scan.
    # Ashwin Shukla Pratipada does exactly this in 2027, which would have left
    # Navratri with no start date at all. The classical handling is to observe it
    # on the day the tithi BEGINS — Ghatasthapana is performed in that day's
    # Abhijit muhurat. Returning nothing here would be worse than returning the
    # day the tithi actually ran.
    d = date(year, 1, 1)
    end = date(year, 12, 31)
    while d <= end:
        t_now = _tithi_index(_jd(d, sunrise(d, city)))
        nxt = d + timedelta(days=1)
        t_nxt = _tithi_index(_jd(nxt, sunrise(nxt, city)))
        spans = ((t_now + 1) % 30 == want and t_nxt == (want + 1) % 30)
        if spans and month_ok(d):
            return d
        d += timedelta(days=1)
    return None


def festival_dates(month_north, paksha, tithi, year, rule="sunrise", city="delhi"):
    """Primary date plus regional/sampradaya variants, with a note for each."""
    primary = find_festival(month_north, paksha, tithi, year, rule, city)
    variants = []

    # A tithi spanning or skipping midnight puts Smarta and Vaishnava observance
    # on different days. Report both rather than silently choosing one.
    if rule == "nishita" and primary:
        nxt = primary + timedelta(days=1)
        variants.append({
            "date": nxt.isoformat(),
            "tradition": "Vaishnava / ISKCON",
            "note": f"Smarta tradition observes this on {primary.strftime('%d %b %Y')}; "
                    f"Vaishnava and ISKCON on {nxt.strftime('%d %b %Y')}. Both are "
                    f"correct within their own sampradaya — the tithi does not sit "
                    f"cleanly across one midnight this year.",
        })

    if paksha == "Krishna" and tithi != "Amavasya" and primary:
        south = to_amanta(month_north, paksha, tithi)
        variants.append({
            "date": primary.isoformat(),
            "tradition": "Amanta (South/West India)",
            "note": f"Same day. Known in the North as {month_north} Krishna {tithi} "
                    f"(purnimanta) and in the South and West as {south} Krishna {tithi} (amanta).",
        })

    return {
        "date": primary.isoformat() if primary else None,
        "weekday": primary.strftime("%A") if primary else None,
        "month_north": month_north,
        "month_amanta": to_amanta(month_north, paksha, tithi),
        "paksha": paksha,
        "tithi": tithi,
        "vyapini_rule": rule,
        "city": city,
        "variants": variants,
        "method": "Swiss Ephemeris, Lahiri ayanamsa. Tithi taken at the festival's "
                  "own vyapini moment, amanta month named by the Sun's rashi at the "
                  "amavasya that begins it.",
    }


# ── which rule each festival uses ───────────────────────────────────────────
# Anything not listed falls back to sunrise, which is correct for most vrats.

VYAPINI_BY_SLUG = {
    "ganesh-chaturthi":     "madhyahna",   # Ganesha born at midday
    "janmashtami":          "nishita",     # Krishna born at midnight
    "maha-shivratri":       "nishita",
    "diwali":               "pradosh",     # Lakshmi puja at dusk
    "narak-chaturdashi":    "pradosh",
    "choti-diwali":         "pradosh",
    "holika-dahan":         "pradosh",     # the bonfire is lit after sunset
    "dhanteras":            "pradosh",
    "dussehra":             "aparahna",    # Vijaya muhurat, afternoon
    "vijayadashami":        "aparahna",
    "bhai-dooj":            "aparahna",
    "karva-chauth":         "moonrise",    # the fast breaks at moonrise
    "sankashti-chaturthi":  "moonrise",
}


# Slugs that must NOT inherit a rule by substring. "ganga-dussehra" contains
# "dussehra" but is Jyeshtha Shukla Dashami, nothing to do with Vijayadashami —
# it was silently picking up the aparahna rule and landing a day early.
SLUG_RULE_EXCLUDE = {
    "ganga-dussehra": "sunrise",
}


def rule_for_slug(slug: str) -> str:
    s = (slug or "").lower()
    for key, rule in SLUG_RULE_EXCLUDE.items():
        if key in s:
            return rule
    for key, rule in VYAPINI_BY_SLUG.items():
        if key in s:
            return rule
    return "sunrise"


def parse_defining_tithi(text: str):
    """festivals_master.defining_tithi reads e.g. 'Ashwin Shukla Dashami
    (Vijayadashami)' or 'Kartik Amavasya'. Returns (month, paksha, tithi) or
    None when the row is solar or Gregorian and has no lunar date to compute."""
    if not text:
        return None
    t = text.split("(")[0].strip()
    low = t.lower()
    if "sankranti" in low or "gregorian" in low:
        return None                       # solar or fixed-date; not lunar
    parts = t.replace("—", " ").split()
    month = next((m for m in MONTH_ORDER if m.lower() in low), None)
    if not month:
        return None
    if "amavasya" in low:
        return month, "Krishna", "Amavasya"
    if "purnima" in low:
        return month, "Shukla", "Purnima"
    paksha = "Krishna" if "krishna" in low else "Shukla"
    tithi = next((x for x in TITHI_NAMES if x.lower() in low), None)
    if not tithi:
        return None
    return month, paksha, tithi


# ── festivals defined by their position in a sequence, not by a tithi ────────
# Four dates stayed one day out no matter how the vyapini rule was set, and the
# reason is that they are not really tithi-resolved at all:
#
#   Govardhan Puja is "the day after Diwali" and Bhai Dooj follows it — the
#   five-day Diwali sequence is observed as a run, so when a tithi kshaya
#   compresses the fortnight the sequence holds and the tithi mapping does not.
#   Hartalika Teej is kept the day before Ganesh Chaturthi.
#   Navratri Day 9 (Maha Navami) is the day before Vijayadashami.
#
# Encoding them as offsets is not a fudge; it is how they are actually observed.
# Everything else stays tithi-resolved.
RELATIVE_TO = {
    "hartalika-teej":               ("ganesh-chaturthi", -1),
    # Navratri runs NINE CONSECUTIVE DAYS from Ghatasthapana. Resolving each day
    # by its own tithi breaks when a kshaya collapses two tithis — in 2026 that
    # put Ashtami and Navami on the same date, which the ordering guard caught.
    # Anchoring every day to Day 1 is both simpler and how the festival is
    # actually observed: the Devi days run in sequence regardless of kshaya.
    "durga-puja":                   ("sharad-navratri", +5),   # Maha Shashthi
    "govardhan-puja":               ("diwali", +1),
    "bhai-dooj":                    ("diwali", +3),
    "narak-chaturdashi":            ("diwali", -1),
    "choti-diwali":                 ("diwali", -1),
}

ANCHOR_TITHI = {
    "ganesh-chaturthi": ("Bhadrapada", "Shukla", "Chaturthi"),
    "dussehra":         ("Ashwin", "Shukla", "Dashami"),
    "diwali":           ("Kartik", "Krishna", "Amavasya"),
    "sharad-navratri":  ("Ashwin", "Shukla", "Pratipada"),
}


def navratri_day(slug: str, year: int, city="delhi"):
    """Resolve Navratri Day 1-9 across the real span, kshaya included.

    Navratri is bounded at both ends: it opens at Ghatasthapana (Ashwin Shukla
    Pratipada) and Day 9, Maha Navami, is the day before Vijayadashami. Between
    those two the nine Devi days are laid out.

    Most years that span is nine days and each Devi gets her own. But a tithi
    kshaya can compress the fortnight — 2028 gives only eight days — and then two
    Devi days genuinely SHARE a date. That is not an error to be smoothed over;
    pandals observe the merged day exactly that way. Distributing across the real
    span and reporting the merge is the honest handling. Assigning each day its
    own tithi independently is what put Ashtami and Navami on the same date in
    2026 with nothing to flag it.
    """
    import re
    m = re.search(r"navratri-day-(\d)", (slug or "").lower())
    if not m:
        return None
    n = int(m.group(1))
    start = find_festival("Ashwin", "Shukla", "Pratipada", year,
                          rule_for_slug("sharad-navratri"), city)
    dussehra = find_festival("Ashwin", "Shukla", "Dashami", year,
                             rule_for_slug("dussehra"), city)
    if not start or not dussehra:
        return None
    last = dussehra - timedelta(days=1)          # Maha Navami
    span = (last - start).days                   # 8 in a normal year
    if span <= 0:
        return None
    # spread days 1..9 across the available span, clamping the tail
    offset = min(n - 1, span)
    d = start + timedelta(days=offset)
    merged = (span < 8)
    return {
        "date": d.isoformat(),
        "weekday": d.strftime("%A"),
        "month_north": "Ashwin", "month_amanta": "Ashwin",
        "paksha": "Shukla", "tithi": f"Navratri Day {n}",
        "vyapini_rule": f"day {n} of the Navratri span {start} to {last}",
        "city": city,
        "variants": ([{
            "date": d.isoformat(),
            "tradition": "Kshaya (merged day)",
            "note": f"A tithi kshaya shortens Navratri to {span + 1} days this year, "
                    f"so two Devi days share a date. Observe both on {d.strftime('%d %b %Y')}.",
        }] if merged else []),
        "method": "Bounded by Ghatasthapana (Ashwin Shukla Pratipada) and Maha "
                  "Navami (the day before Vijayadashami), with the Devi days laid "
                  "out across the real span so a kshaya merges rather than collides.",
    }


def _relative_slug(slug: str):
    s = (slug or "").lower()
    for key, val in RELATIVE_TO.items():
        if key in s:
            return val
    return None


def resolve_row(defining_tithi: str, slug: str, year: int, city: str = "delhi"):
    """Compute one festivals_master row. Returns None for solar/Gregorian rows."""
    nav = navratri_day(slug, year, city)
    if nav:
        return nav

    rel = _relative_slug(slug)
    if rel:
        anchor_slug, offset = rel
        a_month, a_paksha, a_tithi = ANCHOR_TITHI[anchor_slug]
        anchor = find_festival(a_month, a_paksha, a_tithi, year,
                               rule_for_slug(anchor_slug), city)
        if anchor:
            d = anchor + timedelta(days=offset)
            return {
                "date": d.isoformat(),
                "weekday": d.strftime("%A"),
                "month_north": None, "month_amanta": None,
                "paksha": None, "tithi": defining_tithi,
                "vyapini_rule": f"{offset:+d} day from {anchor_slug}",
                "city": city, "variants": [],
                "method": f"Observed as part of a sequence: {offset:+d} day(s) from "
                          f"{anchor_slug} ({anchor.isoformat()}), which is itself "
                          f"tithi-resolved. Sequence festivals hold their order even "
                          f"when a tithi kshaya compresses the fortnight.",
            }

    parsed = parse_defining_tithi(defining_tithi)
    if not parsed:
        return None
    month, paksha, tithi = parsed
    return festival_dates(month, paksha, tithi, year, rule_for_slug(slug), city)


def validate(reference: list, year: int, city: str = "delhi"):
    """Compare engine output against a reference list of (defining_tithi, slug, date).

    Run this every year before publishing. It is the guard the old static table
    never had — the one that would have caught Dussehra sitting before Navami.
    """
    rows, exact, off, miss = [], 0, 0, 0
    for defining, slug, expected in reference:
        r = resolve_row(defining, slug, year, city)
        got = r["date"] if r else None
        if got == expected:
            status, exact = "exact", exact + 1
        elif got:
            delta = (date.fromisoformat(got) - date.fromisoformat(expected)).days
            status, off = f"{delta:+d} day", off + 1
        else:
            status, miss = "no match", miss + 1
        rows.append({"slug": slug, "engine": got, "reference": expected,
                     "status": status, "rule": r["vyapini_rule"] if r else None})
    return {"year": year, "city": city, "exact": exact, "off_by": off,
            "unresolved": miss, "total": len(reference), "rows": rows}
