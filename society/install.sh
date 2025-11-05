#!/bin/bash
# Install script for AskNewton Society of Mind

echo "📦 Installing Society of Mind dependencies..."
cd "$(dirname "$0")"
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env with your OPENAI_API_KEY"
echo "2. Run: npm run dev"
echo "3. Test: curl http://localhost:4000/health"
