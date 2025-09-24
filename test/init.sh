#!/usr/bin/env bash
set -euo pipefail

BODY='{"ping":"init","id":"test-init-1"}'
: "${ELEVEN_INIT_SECRET:?Set ELEVEN_INIT_SECRET in your shell or Replit Secrets}"

SIG=$(printf "%s" "$BODY" | openssl dgst -sha256 -hmac "$ELEVEN_INIT_SECRET" -hex | awk '{print $2}')

curl -sS -X POST "$REPL_HOST/webhooks/eleven/conversation-init" \
  -H "Content-Type: application/json" \
  -H "x-elevenlabs-signature: $SIG" \
  -d "$BODY" | jq .