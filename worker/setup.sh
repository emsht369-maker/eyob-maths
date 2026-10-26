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

SITE_ORIGIN="https://eyob-maths-site.pages.dev"
sed -i -E "s|^ALLOWED_ORIGIN = .*|ALLOWED_ORIGIN = \"${SITE_ORIGIN}\"|" wrangler.toml
printf 'Tutor access limited to %s\n' "$SITE_ORIGIN"

WHOAMI_OUTPUT=""
if ! WHOAMI_OUTPUT="$(npx wrangler whoami 2>&1)" ||
  grep -Eqi 'not authenticated|run .?wrangler login|not logged in' <<< "$WHOAMI_OUTPUT"; then
  if [[ -n "$WHOAMI_OUTPUT" ]]; then printf '%s\n' "$WHOAMI_OUTPUT"; fi
  printf 'Wrangler is not logged in. Opening Cloudflare login...\n'
  if ! npx wrangler login; then
    printf 'Error: Cloudflare login did not complete. Run "npx wrangler login" from this terminal, then rerun this setup script.\n' >&2
    exit 1
  fi
  if ! WHOAMI_OUTPUT="$(npx wrangler whoami 2>&1)" ||
    grep -Eqi 'not authenticated|run .?wrangler login|not logged in' <<< "$WHOAMI_OUTPUT"; then
    if [[ -n "$WHOAMI_OUTPUT" ]]; then printf '%s\n' "$WHOAMI_OUTPUT"; fi
    printf 'Error: Wrangler is still not authenticated. Complete "npx wrangler login" in an interactive terminal, then rerun this script. Alternatively, set CLOUDFLARE_API_TOKEN in your own shell before running setup.\n' >&2
    exit 1
  fi
fi
printf '%s\n' "$WHOAMI_OUTPUT"

printf 'Deploying the Worker...\n'
if ! DEPLOY_OUTPUT="$(npx wrangler deploy 2>&1)"; then
  printf '%s\n' "$DEPLOY_OUTPUT" >&2
  printf 'Error: Worker deployment failed.\n' >&2
  exit 1
fi
WORKER_ADDRESS="$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[A-Za-z0-9.-]+\.workers\.dev' | head -n 1 || true)"
if [[ -z "$WORKER_ADDRESS" ]]; then
  printf '%s\n' "$DEPLOY_OUTPUT" >&2
  printf 'Error: deployment succeeded, but no workers.dev address was found in the output.\n' >&2
  exit 1
fi
printf 'Worker deployed at %s\n' "$WORKER_ADDRESS"

HISTORY_WAS_ENABLED=false
if [[ "$-" == *h* ]]; then
  HISTORY_WAS_ENABLED=true
fi
set +x
set +o history
read -r -s -p "Paste GEMINI key (or press Enter to skip): " GEMINI_KEY
printf '\n'
read -r -s -p "Paste GROQ key (or press Enter to skip): " GROQ_KEY
printf '\n'
if [[ -n "$GEMINI_KEY" ]]; then
  if ! printf '%s' "$GEMINI_KEY" | npx wrangler secret put GEMINI_API_KEY >/dev/null; then
    unset GEMINI_KEY GROQ_KEY
    if [[ "$HISTORY_WAS_ENABLED" == true ]]; then set -o history; fi
    printf 'Error: could not save the Gemini secret to Cloudflare.\n' >&2
    exit 1
  fi
fi
if [[ -n "$GROQ_KEY" ]]; then
  if ! printf '%s' "$GROQ_KEY" | npx wrangler secret put GROQ_API_KEY >/dev/null; then
    unset GEMINI_KEY GROQ_KEY
    if [[ "$HISTORY_WAS_ENABLED" == true ]]; then set -o history; fi
    printf 'Error: could not save the Groq secret to Cloudflare.\n' >&2
    exit 1
  fi
fi
unset GEMINI_KEY GROQ_KEY
if [[ "$HISTORY_WAS_ENABLED" == true ]]; then set -o history; fi

LIVE_BODY='{"mode":"ask","studentQuestion":"What does a variable represent in algebra?","topic":"Algebra","level":"GCSE"}'
if LIVE_RESPONSE="$(curl -sS --max-time 45 -X POST \
  -H "Origin: ${SITE_ORIGIN}" \
  -H 'Content-Type: application/json' \
  --data "$LIVE_BODY" \
  -w $'\n%{http_code}' \
  "${WORKER_ADDRESS}/api/tutor")"; then
  LIVE_STATUS="${LIVE_RESPONSE##*$'\n'}"
  LIVE_JSON="${LIVE_RESPONSE%$'\n'*}"
  LIVE_SUMMARY="$(printf '%s' "$LIVE_JSON" | node -e '
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", part => { input += part; });
    process.stdin.on("end", () => {
      try {
        const result = JSON.parse(input);
        const text = String(result.text || "").replace(/[\r\n]/g, " ").slice(0, 120);
        const error = String(result.error || "").replace(/[\r\n]/g, " ").slice(0, 160);
        const provider = String(result.provider || "").replace(/[\r\n]/g, " ").slice(0, 40);
        process.stdout.write(JSON.stringify({ ok: result.ok === true, provider, text, error }));
      } catch {
        process.stdout.write(JSON.stringify({ ok: false, text: "" }));
      }
    });
  ')"
else
  LIVE_STATUS=000
  LIVE_SUMMARY='{"ok":false,"text":""}'
fi
printf 'Allowed-origin POST: HTTP %s; %s\n' "$LIVE_STATUS" "$LIVE_SUMMARY"
if [[ "$LIVE_STATUS" == 200 && "$LIVE_SUMMARY" == *'"ok":true'* ]]; then
  printf 'PASS: allowed-origin tutor request\n'
else
  printf 'FAIL: allowed-origin tutor request\n'
fi

if WRONG_STATUS="$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' -X POST \
  -H 'Origin: https://example.com' \
  -H 'Content-Type: application/json' \
  --data '{}' \
  "${WORKER_ADDRESS}/api/tutor")"; then
  printf 'Wrong-origin POST: HTTP %s\n' "$WRONG_STATUS"
else
  WRONG_STATUS=000
  printf 'Wrong-origin POST: HTTP %s\n' "$WRONG_STATUS"
fi
if [[ "$WRONG_STATUS" == 403 ]]; then
  printf 'PASS: wrong origin rejected\n'
else
  printf 'FAIL: wrong origin rejected\n'
fi

if OPTIONS_STATUS="$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' -X OPTIONS \
  -H "Origin: ${SITE_ORIGIN}" \
  -H 'Access-Control-Request-Method: POST' \
  "${WORKER_ADDRESS}/api/tutor")"; then
  printf 'OPTIONS preflight: HTTP %s\n' "$OPTIONS_STATUS"
else
  OPTIONS_STATUS=000
  printf 'OPTIONS preflight: HTTP %s\n' "$OPTIONS_STATUS"
fi
if [[ "$OPTIONS_STATUS" == 204 ]]; then
  printf 'PASS: OPTIONS preflight\n'
else
  printf 'FAIL: OPTIONS preflight\n'
fi

if [[ "$LIVE_STATUS" != 200 || "$LIVE_SUMMARY" != *'"ok":true'* ]]; then
  printf '\nError: the live tutor check failed. Check the provider key and Worker logs with "cd worker && npx wrangler tail".\n' >&2
  exit 1
fi

printf '\n+--------------------------------------------------------------+\n'
printf '| Worker address: %-43s |\n' "$WORKER_ADDRESS"
printf '+--------------------------------------------------------------+\n'
printf 'The live site uses this Worker automatically: %s\n' "$WORKER_ADDRESS"
