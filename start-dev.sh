#!/bin/bash

# Development startup script for Laço Eterno
echo "🎵 Starting Laço Eterno Development Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for environment variables
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp .env.example .env.local
    echo "✏️  Please edit .env.local with your Firebase and Spotify credentials"
fi

# Run type checking
echo "🔍 Type checking..."
npm run typecheck

if [ $? -eq 0 ]; then
    echo "✅ Type checking passed!"
    echo "🚀 Starting development server..."
    npm run dev
else
    echo "❌ Type checking failed. Please fix the errors before starting the server."
    exit 1
fi
