#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
  printf 'Error: nvm was not found at %s. Install nvm 0.40.1 and try again.\n' "$NVM_DIR" >&2
  exit 1
fi
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"
if ! nvm use; then
  printf 'Error: could not select the Node version in .nvmrc.\n' >&2
  exit 1
fi
NODE_VERSION="$(node -p 'process.versions.node')"
NODE_MAJOR="${NODE_VERSION%%.*}"
if (( NODE_MAJOR < 22 )); then
  printf 'Error: Node.js 22 or newer is required; nvm selected %s.\n' "$NODE_VERSION" >&2
  exit 1
fi
if [[ ! -d node_modules ]]; then
  printf 'Installing Worker dependencies...\n'
  npm install
fi

if ! git -C "$REPO_ROOT" check-ignore -q worker/.dev.vars; then
  printf 'Error: worker/.dev.vars is not ignored by Git. Refusing to write local keys.\n' >&2
  exit 1
fi

HISTORY_WAS_ENABLED=false
if [[ "$-" == *h* ]]; then HISTORY_WAS_ENABLED=true; fi
set +x
set +o history
read -r -s -p "Paste GEMINI key (or press Enter to skip): " GEMINI_KEY
printf '\n'
read -r -s -p "Paste GROQ key (or press Enter to skip): " GROQ_KEY
printf '\n'
if [[ -z "$GEMINI_KEY" && -z "$GROQ_KEY" ]]; then
  unset GEMINI_KEY GROQ_KEY
  if [[ "$HISTORY_WAS_ENABLED" == true ]]; then set -o history; fi
  printf 'Error: enter at least one provider key.\n' >&2
  exit 1
fi
umask 077
: > .dev.vars
if [[ -n "$GEMINI_KEY" ]]; then printf 'GEMINI_API_KEY=%s\n' "$GEMINI_KEY" >> .dev.vars; fi
if [[ -n "$GROQ_KEY" ]]; then printf 'GROQ_API_KEY=%s\n' "$GROQ_KEY" >> .dev.vars; fi
chmod 600 .dev.vars
unset GEMINI_KEY GROQ_KEY
if [[ "$HISTORY_WAS_ENABLED" == true ]]; then set -o history; fi
printf 'Starting local Worker. Key values are hidden.\n'
npx wrangler dev
