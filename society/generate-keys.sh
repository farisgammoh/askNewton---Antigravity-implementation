#!/bin/bash
# generate-keys.sh - Generate secure API keys for Society service

echo "🔑 Generating 3 secure API keys for Society of Mind..."
echo ""

KEY1=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
KEY2=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
KEY3=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "Key 1 (Main App):  $KEY1"
echo "Key 2 (WhatsApp):  $KEY2"
echo "Key 3 (Internal):  $KEY3"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Comma-separated for API_KEYS environment variable:"
echo ""
echo "$KEY1,$KEY2,$KEY3"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Store these securely in your password manager!"
echo "💡 TIP: Use Key 1 for main app, Key 2 for WhatsApp, Key 3 for internal tools"
echo ""
echo "For Render.com:"
echo "  1. Go to Dashboard → Your Service → Environment"
echo "  2. Set API_KEYS=$KEY1,$KEY2,$KEY3"
echo ""
echo "For Fly.io:"
echo "  fly secrets set API_KEYS=$KEY1,$KEY2,$KEY3"
