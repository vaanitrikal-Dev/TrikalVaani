"""
=============================================================
  TRIKAL VAANI — Swiss Ephemeris Data Downloader
  File: download_ephe.py
  Run: At Render build time to fetch .se1 ephemeris files
=============================================================
"""

import os
import urllib.request
import zipfile
import io

EPHE_DIR = os.getenv("EPHE_PATH", "/opt/render/project/src/ephe_data")

# Swiss Ephemeris files needed for 1800–2400 CE
# Source: Astrodienst official CDN
EPHE_FILES = [
    "sepl_18.se1",   # Planets 1800–1900
    "sepl_20.se1",   # Planets 1900–2000
    "sepl_24.se1",   # Planets 2000–2400 (covers near future)
    "semo_18.se1",   # Moon 1800–1900
    "semo_20.se1",   # Moon 1900–2000
    "semo_24.se1",   # Moon 2000–2400
    "seas_18.se1",   # Asteroids 1800–1900 (for Chiron etc.)
]

BASE_URL = "https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/"


def download_ephe_files():
    os.makedirs(EPHE_DIR, exist_ok=True)

    for fname in EPHE_FILES:
        dest = os.path.join(EPHE_DIR, fname)
        if os.path.exists(dest):
            print(f"[SKIP] {fname} already exists")
            continue
        url = BASE_URL + fname
        print(f"[DOWNLOAD] {fname} from {url}")
        try:
            urllib.request.urlretrieve(url, dest)
            print(f"[OK] {fname} ({os.path.getsize(dest) // 1024} KB)")
        except Exception as e:
            print(f"[ERROR] Failed to download {fname}: {e}")

    # Also fetch the Leapsec and delta-T files (required)
    for extra in ["seleapsec.txt", "jpl_de436.se1"]:
        dest = os.path.join(EPHE_DIR, extra)
        if not os.path.exists(dest):
            try:
                urllib.request.urlretrieve(BASE_URL + extra, dest)
                print(f"[OK] {extra}")
            except Exception:
                pass  # Not critical for basic Vedic


if __name__ == "__main__":
    download_ephe_files()
    print(f"\n✅ Ephemeris files ready in: {EPHE_DIR}")
    print(f"   Files: {os.listdir(EPHE_DIR)}")
