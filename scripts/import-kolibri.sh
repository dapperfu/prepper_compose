#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: scripts/import-kolibri.sh CHANNEL_ID" >&2
  echo "Look up the channel id in Kolibri Studio while this machine is online." >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
docker compose exec kolibri kolibri manage importchannel network "$1"
docker compose exec kolibri kolibri manage importcontent network "$1"
echo "Channel $1 imported into data/kolibri."
