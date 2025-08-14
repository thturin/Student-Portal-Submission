#!/bin/bash
# setup.sh

echo "🚀 Setting up Student Portal on Linux..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install 2>/dev/null || echo "No root package.json found"

echo "🌐 Installing backend dependencies..."
cd server && npm install && cd ..

echo "⚛️ Installing frontend dependencies..."
cd client && npm install && cd ..

echo "🐍 Installing Python dependencies..."
cd scripts/google-docs
pip3 install -r requirements.txt || pip install -r requirements.txt
cd ../..

echo "✅ All dependencies installed!"
echo ""
echo "🎯 Next steps:"
echo "1. Set up your .env files with proper credentials"
echo "2. Start PostgreSQL database"
echo "3. Run: npm run dev (or your start script)"