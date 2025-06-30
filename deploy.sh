#!/bin/bash

# Production deployment script for SomeCoolName
# This script builds the project and prepares it for deployment

echo "🚀 Starting production build..."

# Check if environment variables are set
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found. Make sure to set up your environment variables before deployment."
    echo "📋 Copy .env.example to .env.local and fill in your values."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running type checks..."
npm run typecheck

# Run linting
echo "🧹 Running linter..."
npm run lint

# Build the project
echo "🏗️  Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "🌟 Your app is ready for deployment!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Deploy to your hosting platform (Vercel, Netlify, etc.)"
    echo "   2. Set up environment variables on your hosting platform"
    echo "   3. Configure Firebase security rules if needed"
    echo "   4. Set up domain and SSL certificate"
    echo ""
    echo "🔗 Useful links:"
    echo "   - Vercel deployment: https://vercel.com/docs/concepts/deployments"
    echo "   - Firebase hosting: https://firebase.google.com/docs/hosting"
    echo "   - Netlify deployment: https://docs.netlify.com/site-deploys/create-deploys/"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi
