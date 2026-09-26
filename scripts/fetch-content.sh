#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ROOT
exec python3 - "$@" <<'PY'
import json
import os
import re
import subprocess
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(os.environ["ROOT"])
CATALOG = ROOT / "content" / "catalog.yml"
DEST = Path(os.environ.get("ZIM_DIR", ROOT / "data" / "zim"))
BASE = "https://download.kiwix.org/zim"
MANIFEST_PATH = DEST / "manifest.json"


def parse_scalar(value):
    if value in ("true", "false"):
        return value == "true"
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
        return value[1:-1]
    return value


def parse_catalog(text):
    entries = []
    current = None
    mode = None
    for raw in text.splitlines():
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if raw.startswith("  - "):
            current = {}
            entries.append(current)
            mode = None
            body = raw.strip()[2:]
            if ":" in body:
                key, value = body.split(":", 1)
                current[key.strip()] = parse_scalar(value.strip())
            continue
        if current is None:
            continue
        if mode and raw.startswith("      - "):
            current.setdefault(mode, [])
            current[mode].append(parse_scalar(raw.strip()[2:]))
            continue
        if raw.startswith("    ") and ":" in raw:
            key, value = raw.strip().split(":", 1)
            value = value.strip()
            if value == "":
                mode = key
                current[key] = []
            else:
                mode = None
                current[key] = parse_scalar(value)
    return entries


def human(size):
    value = float(size)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if value < 1024 or unit == "TB":
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{size} B"


def curl_text(args):
    return subprocess.check_output(["curl", *args], text=True, stderr=subprocess.DEVNULL)


def list_names(base, directory, cache):
    key = f"{base}/{directory}"
    if key in cache:
        return cache[key]
    url = f"{key}/"
    try:
        html = curl_text(["-fsSL", "--max-time", "120", "-A", "offline-library", url])
    except subprocess.CalledProcessError:
        cache[key] = None
        return None
    names = []
    for href in re.findall(r'href="([^"]+\.zim)"', html, flags=re.I):
        names.append(urllib.parse.unquote(href.split("/")[-1]))
    cache[key] = names
    return names


def content_length(url):
    try:
        headers = curl_text(["-fsSIL", "--max-time", "90", "-A", "offline-library", url])
    except subprocess.CalledProcessError:
        return None
    lengths = re.findall(r"(?im)^content-length:\s*(\d+)\s*$", headers)
    if not lengths:
        return None
    return int(lengths[-1])


def load_manifest():
    if not MANIFEST_PATH.is_file():
        return {}
    try:
        data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def save_manifest(manifest):
    DEST.mkdir(parents=True, exist_ok=True)
    temporary = MANIFEST_PATH.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    temporary.replace(MANIFEST_PATH)


def local_record(entry, manifest):
    record = manifest.get(entry["id"])
    if not isinstance(record, dict):
        return None
    name = record.get("file")
    size = record.get("size")
    if not isinstance(name, str) or not isinstance(size, int):
        return None
    dest = DEST / name
    if dest.is_file() and dest.stat().st_size == size:
        return {"file": name, "size": size}
    return None


def bases_for(entry):
    bases = [BASE]
    extra = entry.get("base")
    if isinstance(extra, str) and extra.strip():
        extra = extra.rstrip("/")
        if extra not in bases:
            bases.append(extra)
    return bases


def resolve(entry, cache):
    pattern = re.compile(entry["pattern"])
    directories = entry.get("directories") or [entry.get("directory")]
    chosen = None
    for base in bases_for(entry):
        for directory in directories:
            if not directory:
                continue
            names = list_names(base, directory, cache)
            if not names:
                continue
            matches = sorted(name for name in names if pattern.search(name))
            if not matches:
                continue
            name = matches[-1]
            if chosen is None or name > chosen[0]:
                chosen = (name, base, directory)
    if not chosen:
        return None
    name, base, directory = chosen
    url = f"{base}/{directory}/{urllib.parse.quote(name)}"
    return name, url, content_length(url)


def drop_older(pattern, chosen):
    if not DEST.is_dir():
        return
    for path in DEST.glob("*.zim"):
        if path.name != chosen and pattern.search(path.name):
            print(f"Removing older archive {path.name}")
            path.unlink()


def main():
    args = sys.argv[1:]
    if "-h" in args or "--help" in args:
        print("Usage: scripts/fetch-content.sh [--yes]")
        print("Prints the full-archive download plan. Add --yes to download into data/zim/.")
        print("Wikipedia and Wikibooks are the picture editions. Gutenberg is the full English archive.")
        return 0
    if "--profile" in args or os.environ.get("PROFILE") not in (None, "", "full"):
        print("This script always downloads the full archives.", file=sys.stderr)
        return 1
    download = "--yes" in args

    entries = parse_catalog(CATALOG.read_text(encoding="utf-8"))
    manifest = load_manifest()
    cache = {}
    plan = []
    missing_required = False
    print("Profile: full")
    for entry in entries:
        title = entry.get("title", entry.get("id", "archive"))
        pattern = re.compile(entry["pattern"])
        saved = local_record(entry, manifest)
        remote = resolve(entry, cache)
        if remote and remote[2]:
            name, url, size = remote
        elif remote and saved and saved["file"] == remote[0]:
            name, url, size = remote[0], remote[1], saved["size"]
        elif saved and not remote:
            name, url, size = saved["file"], None, saved["size"]
        elif remote:
            name, url, size = remote
        else:
            label = "optional, not in the current catalog" if entry.get("optional") else "MISSING"
            print(f"  - {title}: {label}")
            if not entry.get("optional"):
                missing_required = True
            continue
        plan.append((entry["id"], title, name, url, size, pattern))
        size_label = human(size) if size else "unknown size"
        print(f"  - {title}: {name} ({size_label})")

    known = [item[4] for item in plan if item[4]]
    if known:
        print(f"Known total: {human(sum(known))}")
    print("Map tiles are built by docker compose build. Khan Academy and park brochures are separate and are not included above.")
    if missing_required:
        print("A required archive was not found. Nothing was downloaded.", file=sys.stderr)
        return 1
    if not download:
        print("Dry run only. Re-run with --yes to download.")
        return 0

    DEST.mkdir(parents=True, exist_ok=True)
    for entry_id, title, name, url, size, pattern in plan:
        dest = DEST / name
        if dest.is_file() and size and dest.stat().st_size == size:
            print(f"Already complete: {name}")
        elif not url:
            print(f"Already complete: {name}")
        else:
            print(f"Downloading {title}")
            subprocess.run(
                ["curl", "-fL", "--retry", "5", "--retry-delay", "2", "-C", "-", "--output", str(dest), url],
                check=True,
            )
            if size and dest.stat().st_size != size:
                print(f"{name} is incomplete ({dest.stat().st_size} of {size} bytes).", file=sys.stderr)
                return 1
        dest.chmod(0o644)
        manifest[entry_id] = {"file": name, "size": dest.stat().st_size}
        save_manifest(manifest)
        drop_older(pattern, name)
    print(f"Archives are in {DEST}")
    return 0


sys.exit(main())
PY
