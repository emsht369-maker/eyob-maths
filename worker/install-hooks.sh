#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
git -C "$REPO_ROOT" config core.hooksPath .githooks
printf 'Git will use the repository .githooks directory for hooks.\n'
