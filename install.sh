#!/usr/bin/env bash
# Installs the deckio-site-builder skill into ~/.copilot/skills
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
src="$here/skills/deckio-site-builder"
dest="$HOME/.copilot/skills/deckio-site-builder"

mkdir -p "$HOME/.copilot/skills"
rm -rf "$dest"
mkdir -p "$dest"
( cd "$src" && tar --exclude='node_modules' -cf - . ) | ( cd "$dest" && tar -xf - )

if command -v npm >/dev/null 2>&1; then
  echo "Installing Playwright for scripts/verify.mjs ..."
  ( cd "$dest/scripts" && npm install --no-audit --no-fund --loglevel=error >/dev/null && npx --yes playwright install chromium >/dev/null ) \
    || echo "Playwright setup failed; run 'npm install' in $dest/scripts later." >&2
else
  echo "npm not found. Install Node 20+ and run 'npm install' in $dest/scripts." >&2
fi

echo "Installed to $dest"
echo "In Copilot CLI run: /skills reload   then   /skills list"
