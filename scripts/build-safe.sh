#!/usr/bin/env bash
# Serialize + clean Next builds so concurrent agents cannot corrupt .next
set -euo pipefail
cd "$(dirname "$0")/.."
LOCK="${BUILD_LOCK:-/tmp/clinic-followup-desk.build.lock}"
export PATH="$(pwd)/node_modules/.bin:$PATH"
flock -x "$LOCK" bash -c '
  set -euo pipefail
  cd "'$(pwd)'"
  export PATH="$(pwd)/node_modules/.bin:$PATH"
  rm -rf .next
  exec next build
'
