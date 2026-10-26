#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
cd "$SCRIPT_DIR"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  printf 'Error: nvm was not found at %s. Install nvm and try again.\n' "$NVM_DIR" >&2
  exit 1
fi
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"
if ! nvm use; then
  printf 'Error: could not select the Node version in .nvmrc.\n' >&2
  exit 1
fi

if [[ ! -x "$SCRIPT_DIR/node_modules/.bin/wrangler" ]]; then
  printf 'Installing Worker dependencies...\n'
  (cd "$SCRIPT_DIR" && npm ci)
fi

SITE_DIR="$(mktemp -d)"
trap 'rm -rf "$SITE_DIR"' EXIT
node "$SCRIPT_DIR/build-site.mjs" "$SITE_DIR"

# Run outside the repo so Wrangler does not pick up worker/wrangler.toml.
(
  cd "$SITE_DIR"
  "$SCRIPT_DIR/node_modules/.bin/wrangler" pages deploy "$SITE_DIR" \
    --project-name=eyob-maths-site --branch=main
)
