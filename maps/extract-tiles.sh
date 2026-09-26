#!/bin/sh
set -eu

MAP_MAXZOOM="${MAP_MAXZOOM:-14}"
case "$MAP_MAXZOOM" in
  ''|*[!0-9]*)
    echo "MAP_MAXZOOM must be an integer from 1 to 15." >&2
    exit 1
    ;;
esac
if [ "$MAP_MAXZOOM" -lt 1 ] || [ "$MAP_MAXZOOM" -gt 15 ]; then
  echo "MAP_MAXZOOM must be an integer from 1 to 15." >&2
  exit 1
fi

mkdir -p /maps

latest=""
builds_html="$(curl -fsSL --max-time 60 "https://maps.protomaps.com/builds/" || true)"
latest="$(printf '%s' "$builds_html" | grep -oE '20[0-9]{6}\.pmtiles' | sort -u | tail -n 1 || true)"
if [ -z "$latest" ]; then
  offset=0
  while [ "$offset" -le 21 ]; do
    day="$(date -u -d "$offset days ago" +%Y%m%d)"
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 -I "https://build.protomaps.com/${day}.pmtiles" || true)"
    if [ "$code" = "200" ]; then
      latest="${day}.pmtiles"
      break
    fi
    offset=$((offset + 1))
  done
fi

if [ -z "$latest" ]; then
  echo "Could not find a current Protomaps build." >&2
  exit 1
fi

source_url="https://build.protomaps.com/${latest}"
echo "Source: $source_url"
echo "Regional detail: zoom ${MAP_MAXZOOM}. World overview: zoom 6."

extract() {
  name="$1"
  zoom="$2"
  bbox="${3:-}"
  dest="/maps/${name}.pmtiles"
  attempt=1
  max_attempts=5
  while [ "$attempt" -le "$max_attempts" ]; do
    # Cloudflare resets parallel range requests. Start below the old 8-thread
    # setting and fall back further after each failure.
    case "$attempt" in
      1) threads=4 ;;
      2) threads=2 ;;
      *) threads=1 ;;
    esac
    rm -f "$dest"
    echo "Extracting ${name} (attempt ${attempt}/${max_attempts}, ${threads} download threads)"
    if pmtiles extract "$source_url" "$dest" --maxzoom="$zoom" ${bbox:+--bbox="$bbox"} --download-threads="$threads" \
      && [ -s "$dest" ]; then
      return 0
    fi
    echo "Extract of ${name} failed." >&2
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "Giving up on ${name} after ${max_attempts} attempts." >&2
      exit 1
    fi
    wait_s=$((attempt * 15))
    echo "Retrying ${name} in ${wait_s}s." >&2
    sleep "$wait_s"
    attempt=$((attempt + 1))
  done
}

extract world 6
extract north-america "$MAP_MAXZOOM" "-170,14,-52,72"
extract europe "$MAP_MAXZOOM" "-25,34,45,71"
extract oceania "$MAP_MAXZOOM" "110,-50,180,0"

echo "Map tiles:"
ls -lh /maps
