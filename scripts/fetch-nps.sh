#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ROOT
exec python3 - "$@" <<'PY'
import os
import re
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(os.environ["ROOT"])
PARKS = ROOT / "content" / "nps-parks.txt"
DEST = ROOT / "data" / "files" / "nps"
PAGES = (
    "planyourvisit/park-brochure.htm",
    "planyourvisit/parkbrochure.htm",
    "planyourvisit/brochures.htm",
    "planyourvisit/maps.htm",
)


def fetch(url):
    result = subprocess.run(
        ["curl", "-fsSL", "--max-time", "40", "-A", "offline-library", "-o", "-", url],
        capture_output=True,
    )
    if result.returncode != 0:
        return None
    return result.stdout


def pdf_hrefs(page_url, html):
    text = html.decode("utf-8", errors="ignore")
    found = []
    for href in re.findall(r'href=["\']([^"\']+\.pdf[^"\']*)["\']', text, flags=re.I):
        found.append(urljoin(page_url, href))
    return found


def prefer(urls):
    ranked = sorted(urls, key=lambda url: (
        0 if re.search(r"brochure|unigrid", url, re.I) else 1,
        0 if re.search(r"map", url, re.I) else 1,
        url,
    ))
    return ranked[0] if ranked else None


def is_pdf(path):
    data = path.read_bytes()[:5]
    return data == b"%PDF-"


def main():
    parks = []
    for line in PARKS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        code, _, name = line.partition(" ")
        parks.append((code, name or code))
    DEST.mkdir(parents=True, exist_ok=True)
    saved = []
    skipped = []
    for code, name in parks:
        target = DEST / f"{code}.pdf"
        if target.exists() and is_pdf(target):
            print(f"Keeping {name}")
            saved.append(name)
            continue
        chosen = None
        for page in PAGES:
            page_url = f"https://www.nps.gov/{code}/{page}"
            html = fetch(page_url)
            if not html:
                continue
            chosen = prefer(pdf_hrefs(page_url, html))
            if chosen:
                break
        if not chosen:
            print(f"Skipped {name}: no brochure PDF link")
            skipped.append(name)
            time.sleep(0.2)
            continue
        print(f"Downloading {name}")
        result = subprocess.run(
            ["curl", "-fL", "--max-time", "90", "-A", "offline-library", "-o", str(target), chosen]
        )
        if result.returncode != 0 or not target.exists() or not is_pdf(target):
            target.unlink(missing_ok=True)
            print(f"Skipped {name}: download was not a PDF")
            skipped.append(name)
        else:
            target.chmod(0o644)
            saved.append(name)
        time.sleep(0.2)
    print(f"Saved {len(saved)} brochure(s) in {DEST}")
    if skipped:
        print("Skipped: " + ", ".join(skipped))
    return 0 if saved else 1


sys.exit(main())
PY
