#!/bin/bash

# Quick Environment Setup for SomeCoolName
echo "🔧 Setting up your .env.local file..."

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Creating backup..."
    cp .env.local .env.local.backup
fi

# Copy from example
cp .env.example .env.local

echo ""
echo "📝 Please provide your Firebase configuration:"
echo "   (Get these from Firebase Console > Project Settings > Your apps > Config)"
echo ""

read -p "Firebase API Key: " firebase_api_key
read -p "Firebase Auth Domain (yourproject.firebaseapp.com): " firebase_auth_domain
read -p "Firebase Project ID: " firebase_project_id
read -p "Firebase Storage Bucket (yourproject.appspot.com): " firebase_storage_bucket
read -p "Firebase Messaging Sender ID: " firebase_messaging_sender_id
read -p "Firebase App ID: " firebase_app_id

echo ""
echo "🎵 Spotify API Configuration:"
read -p "Spotify Client ID: " spotify_client_id
read -p "Spotify Client Secret: " spotify_client_secret

# Update .env.local with provided values
sed -i "s/your_firebase_api_key_here/$firebase_api_key/g" .env.local
sed -i "s/your_project_id.firebaseapp.com/$firebase_auth_domain/g" .env.local
sed -i "s/your_project_id_here/$firebase_project_id/g" .env.local
sed -i "s/your_project_id.appspot.com/$firebase_storage_bucket/g" .env.local
sed -i "s/your_messaging_sender_id_here/$firebase_messaging_sender_id/g" .env.local
sed -i "s/your_firebase_app_id_here/$firebase_app_id/g" .env.local
sed -i "s/your_spotify_client_id_here/$spotify_client_id/g" .env.local
sed -i "s/your_spotify_client_secret_here/$spotify_client_secret/g" .env.local

echo ""
echo "✅ .env.local has been configured!"
echo "🚀 You can now run: npm run dev"
