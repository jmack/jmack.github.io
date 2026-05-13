#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8765}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$REPO_ROOT"
echo "Serving $REPO_ROOT at http://127.0.0.1:$PORT/ (Ctrl+C to stop)"
python3 -m http.server "$PORT"
