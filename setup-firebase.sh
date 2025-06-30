#!/bin/bash

# Firebase & Environment Setup Script for SomeCoolName
echo "🔥 Setting up Firebase and Environment for SomeCoolName..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local and add your Firebase and Spotify credentials${NC}"
else
    echo -e "${BLUE}ℹ️  .env.local already exists${NC}"
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}📦 Firebase CLI not found. Installing...${NC}"
    sudo npm install -g firebase-tools
    echo -e "${GREEN}✅ Firebase CLI installed${NC}"
else
    echo -e "${BLUE}ℹ️  Firebase CLI already installed${NC}"
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}🔐 Please log in to Firebase...${NC}"
    firebase login
fi

echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Edit .env.local with your Firebase configuration"
echo "2. Run: firebase init (if not already done)"
echo "3. Set up Firestore and Storage security rules"
echo "4. Get Spotify API credentials"
echo "5. Run: npm run dev"
echo ""
echo -e "${GREEN}📖 Check docs/firebase-setup.md for detailed instructions${NC}"
