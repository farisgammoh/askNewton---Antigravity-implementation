#!/usr/bin/env bash
set -euo pipefail

BODY='{"ping":"end","id":"test-end-1"}'
: "${ELEVEN_END_SECRET:?Set ELEVEN_END_SECRET in your shell or Replit Secrets}"

SIG=$(printf "%s" "$BODY" | openssl dgst -sha256 -hmac "$ELEVEN_END_SECRET" -hex | awk '{print $2}')

curl -sS -X POST "$REPL_HOST/webhooks/eleven/conversation-end" \
  -H "Content-Type: application/json" \
  -H "x-elevenlabs-signature: $SIG" \
  -d "$BODY" | jq .