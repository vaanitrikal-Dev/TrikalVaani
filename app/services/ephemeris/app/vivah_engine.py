"""
=============================================================
  TRIKAL VAANI — Vivah (Marriage) Muhurat Engine
  File: app/vivah_engine.py
  Author: Rohiit Gupta, Chief Vedic Architect
  Version: 1.0
  JAI MAA SHAKTI
-------------------------------------------------------------
  Strict-classical Vivah muhurat finder. Time-resolved.
  For each day NOT in a forbidden window, scans the day/night
  for intervals where nakshatra + tithi + vaar + karana(Bhadra)
  + yoga are all vivah-suitable, then tags the lagna quality.

  Forbidden windows (Kharmas, Shukra/Guru Ast, Adhik Maas,
  Chaturmas, Holashtak) are passed IN (DrikPanchang-calibrated,
  stored in Supabase muhurat_windows) — NOT recomputed here.

  Ayanamsa: Lahiri (matches Trikal Vaani system).
=============================================================
"""
import swisseph as swe
import math
from datetime import date, timedelta

swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
_FLAG = swe.FLG_SIDEREAL | swe.FLG_MOSEPH

NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha',
 'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula',
 'Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati']
TITHIS = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami',
 'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima/Amavasya']
KARANAS = ['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti','Shakuni','Chatushpada','Naga','Kimstughna']
NITYA   = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma','Dhriti','Shula','Ganda',
 'Vriddhi','Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha',
 'Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti']
VARA = ['Somvar','Mangalvar','Budhvar','Guruvar','Shukravar','Shanivar','Ravivar']  # Python Mon=0
SIGNS = ['Mesh','Vrishabh','Mithun','Kark','Simha','Kanya','Tula','Vrischik','Dhanu','Makar','Kumbh','Meen']

# Strict-classical vivah sets
V_NAK = {'Rohini','Mrigashira','Magha','Uttara Phalguni','Hasta','Swati','Anuradha','Mula','Uttara Ashadha','Uttara Bhadrapada','Revati'}
V_TIT = {'Dwitiya','Tritiya','Panchami','Saptami','Dashami','Ekadashi','Trayodashi'}
V_VAR = {'Somvar','Budhvar','Guruvar','Shukravar'}
BAD_YOGA = {'Vishkambha','Atiganda','Shula','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'}
# Lagna quality for vivah: sthira best, dwiswabhava ok, chara weak
STHIRA = {1,4,7,10}; DWISWA = {2,5,8,11}; CHARA = {0,3,6,9}

def _sunrise_min(d, lat, lng):
    """Analytical sunrise in minutes from IST midnight (ports panchang.py)."""
    doy = d.timetuple().tm_yday
    decl = 23.45 * math.sin(math.radians((360/365)*(doy-81)))
    cos_h = -math.tan(math.radians(lat))*math.tan(math.radians(decl))
    cos_h = max(-1, min(1, cos_h))
    H = math.degrees(math.acos(cos_h))
    return round((12 - H/15 + 5.5 - lng/15)*60)

def _panchang_at(d, hr_ist):
    jd = swe.julday(d.year, d.month, d.day, hr_ist - 5.5)
    sun = swe.calc_ut(jd, swe.SUN, _FLAG)[0][0]
    moon= swe.calc_ut(jd, swe.MOON, _FLAG)[0][0]
    el = (moon - sun) % 360
    tnum = int(el//12)+1
    return (NAKSHATRAS[int(moon/(360/27))%27], TITHIS[(tnum-1)%15],
            KARANAS[int(el//6)%11], NITYA[int(((sun+moon)%360)/(360/27))%27])

def _lagna_sign(d, hr_ist, lat, lng):
    jd = swe.julday(d.year, d.month, d.day, hr_ist - 5.5)
    asc = swe.houses_ex(jd, lat, lng, b'P', swe.FLG_SIDEREAL)[1][0]
    return int(asc//30)

def _hm(mins):
    t=int(round(mins))%1440; h=t//60; m=t%60
    ap='PM' if h>=12 else 'AM'; hh=h-12 if h>12 else (12 if h==0 else h)
    return f'{hh}:{m:02d} {ap}'

def find_vivah_muhurats(year, month=None, latitude=28.6139, longitude=77.2090,
                        timezone=5.5, forbidden_ranges=None):
    forb = []
    for a,b in (forbidden_ranges or []):
        forb.append((date.fromisoformat(a), date.fromisoformat(b)))
    def banned(dd): return any(a<=dd<=b for a,b in forb)

    months = [month] if month else list(range(1,13))
    out=[]
    for mo in months:
        d = date(year, mo, 1)
        while d.month == mo:
            if not banned(d):
                vaar = VARA[d.weekday()]
                if vaar in V_VAR:
                    sr = _sunrise_min(d, latitude, longitude)
                    samples=[]
                    for k in range(0, 24*12):                 # 5-min steps over 24h from sunrise
                        mins = sr + k*5
                        dd = d + timedelta(days=mins//1440)
                        nak,tit,kar,yog = _panchang_at(dd, (mins%1440)/60.0)
                        ok = (nak in V_NAK) and (tit in V_TIT) and (kar!='Vishti') and (yog not in BAD_YOGA)
                        samples.append((mins, ok, nak, tit))
                    runs=[]; s=None
                    for mins,ok,nak,tit in samples:
                        if ok and s is None: s=(mins,nak,tit)
                        if (not ok) and s is not None: runs.append((s[0],mins,s[1],s[2])); s=None
                    if s is not None: runs.append((s[0],samples[-1][0]+5,s[1],s[2]))
                    if runs:
                        st,en,nak,tit = max(runs, key=lambda r:r[1]-r[0])
                        # lagna at window midpoint
                        mid=(st+en)//2; mdd=d+timedelta(days=mid//1440)
                        lg=_lagna_sign(mdd,(mid%1440)/60.0,latitude,longitude)
                        lq = 'Sthira (best)' if lg in STHIRA else ('Dwiswabhava (good)' if lg in DWISWA else 'Chara (weak)')
                        out.append(dict(date=d.isoformat(), weekday=vaar, nakshatra=nak, tithi=tit,
                                        muhurat_start=_hm(st), muhurat_end=_hm(en),
                                        lagna=SIGNS[lg], lagna_quality=lq))
            d += timedelta(days=1)
    return out

if __name__ == '__main__':
    F=[("2026-01-01","2026-02-17"),("2026-02-23","2026-03-02"),("2026-03-15","2026-04-14"),
       ("2026-05-17","2026-06-15"),("2026-07-25","2026-11-20"),("2026-12-17","2026-12-31")]
    res = find_vivah_muhurats(2026, forbidden_ranges=F)
    print(f"VIVAH 2026 (refined, with lagna): {len(res)} dates\n")
    for r in res:
        print(f"  {r['date']} {r['weekday'][:3]:3s} {r['nakshatra']:18s} {r['muhurat_start']:9s}->{r['muhurat_end']:9s}  {r['lagna']:9s} {r['lagna_quality']}")
