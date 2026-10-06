#!/bin/bash
# Chessty: Abhängigkeiten für Claude-Code-Websitzungen installieren (Typecheck, Build, Prüfskripte).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# npm install statt npm ci: nutzt den zwischengespeicherten Container-Zustand
npm install --no-audit --no-fund --loglevel=error

# Playwright-Browser liegt vorinstalliert unter /opt/pw-browsers – nichts herunterladen
echo 'export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1' >> "${CLAUDE_ENV_FILE:-/dev/null}"
