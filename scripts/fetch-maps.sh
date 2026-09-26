#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP_MAXZOOM="${MAP_MAXZOOM:-14}"

if [[ ! "$MAP_MAXZOOM" =~ ^[0-9]+$ ]] || (( MAP_MAXZOOM < 1 || MAP_MAXZOOM > 15 )); then
  echo "MAP_MAXZOOM must be an integer from 1 to 15." >&2
  exit 1
fi

cd "$ROOT"
export MAP_MAXZOOM
docker compose build maps
echo "Map tiles are in the maps image."
echo "Start the service with: docker compose up -d"
