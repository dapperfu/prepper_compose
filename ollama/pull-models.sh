#!/bin/sh
set -eu

# The base image sets OLLAMA_HOST to 0.0.0.0 so the server is reachable on the
# published port. The client in this build talks to the local server directly.
export OLLAMA_HOST=127.0.0.1:11434

ollama serve &
pid=$!
trap 'kill "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true' EXIT

i=0
until ollama list >/dev/null 2>&1; do
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "ollama serve exited before it was ready" >&2
    exit 1
  fi
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "ollama did not become ready" >&2
    exit 1
  fi
  sleep 1
done

ollama pull qwen2.5:1.5b
ollama pull nemotron3:33b
ollama pull glm-5.3-flash:cloud

list="$(ollama list)"
printf '%s\n' "$list"
for model in qwen2.5:1.5b nemotron3:33b glm-5.3-flash:cloud; do
  printf '%s\n' "$list" | grep -q "^${model}[[:space:]]" || {
    echo "missing model: $model" >&2
    exit 1
  }
done
