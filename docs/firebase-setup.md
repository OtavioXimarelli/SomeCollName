# Firebase Setup Guide

This guide will walk you through setting up Firebase for your SomeCoolName application.

## 🔥 Firebase Console Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `somecoolname` (or your preferred name)
4. Choose whether to enable Google Analytics (recommended)
5. Wait for project creation to complete

### Step 2: Enable Authentication

1. In your Firebase console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"
3. Optional: Set up email verification in **Authentication** > **Templates**

### Step 3: Create Firestore Database

1. Go to **Firestore Database** in the Firebase console
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location (choose closest to your users)
5. Click "Done"

### Step 4: Set up Firebase Storage

1. Go to **Storage** in the Firebase console
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as your Firestore
5. Click "Done"

### Step 5: Get Web App Configuration

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to "Your apps"
3. Click "Add app" > Web app icon (`</>`)
4. Enter app nickname: "SomeCoolName Web"
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the configuration object - you'll need these values for your `.env.local` file

## 🔧 Environment Variables Setup

### Step 1: Create .env.local file

```bash
cp .env.example .env.local
```

### Step 2: Fill in Firebase Configuration

Open `.env.local` and replace the placeholder values with your Firebase config:

```bash
# From Firebase Console > Project Settings > General > Your apps > Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC... # Your actual API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=yourproject
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 🔐 Security Rules Setup

### Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Couple profiles can only be accessed by associated users
    match /couples/{coupleId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.userIds;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.userIds;
    }
    
    // Photos can only be accessed by couple members
    match /photos/{photoId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/couples/$(resource.data.coupleId)) &&
        request.auth.uid in get(/databases/$(database)/documents/couples/$(resource.data.coupleId)).data.userIds;
      allow create: if request.auth != null && 
        exists(/databases/$(database)/documents/couples/$(request.resource.data.coupleId)) &&
        request.auth.uid in get(/databases/$(database)/documents/couples/$(request.resource.data.coupleId)).data.userIds;
    }
  }
}
```

3. Click "Publish"

### Firebase Storage Security Rules

1. Go to **Storage** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Photos can only be uploaded/accessed by authenticated users who are part of the couple
    match /couples/{coupleId}/photos/{photoId} {
      allow read, write: if request.auth != null &&
        firestore.exists(/databases/(default)/documents/couples/$(coupleId)) &&
        request.auth.uid in firestore.get(/databases/(default)/documents/couples/$(coupleId)).data.userIds;
    }
    
    // File size and type restrictions
    match /{allPaths=**} {
      allow write: if request.auth != null &&
        request.resource.size < 10 * 1024 * 1024 && // 10MB limit
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

3. Click "Publish"

## 🎵 Spotify API Setup

### Step 1: Create Spotify App

1. Go to [Spotify for Developers](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in:
   - App name: "SomeCoolName"
   - App description: "Couple relationship app with music integration"
   - Website: "http://localhost:3000" (for development)
   - Redirect URI: "http://localhost:3000" (not used for our current implementation)
5. Accept terms and click "Create"

### Step 2: Get API Credentials

1. In your app dashboard, note down:
   - Client ID
   - Client Secret (click "Show Client Secret")

### Step 3: Add to Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

## 🚀 Testing Your Setup

### Step 1: Install Dependencies (if not already done)

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Test Authentication

1. Open http://localhost:3000
2. Try signing up with a new email
3. Check Firebase Console > Authentication to see the new user

### Step 4: Test Firestore

1. Create a couple profile
2. Check Firebase Console > Firestore Database to see the data

### Step 5: Test Storage

1. Upload a photo
2. Check Firebase Console > Storage to see the uploaded file

### Step 6: Test Spotify Integration

1. Go to the music tab in a couple profile
2. Search for a song
3. Verify results appear

## 🔧 Troubleshooting

### Common Issues:

1. **Authentication not working**: Check that your API key and auth domain are correct
2. **Firestore permission denied**: Verify your security rules and user authentication
3. **Storage upload failing**: Check storage rules and file size limits
4. **Spotify search not working**: Verify your client ID and check browser network tab for errors

### Debug Mode:

Add this to your `.env.local` for more detailed logging:

```bash
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## 📱 Production Deployment

When deploying to production:

1. Update your Firebase project's authorized domains
2. Set up proper environment variables on your hosting platform
3. Consider enabling Firebase App Check for additional security
4. Update Spotify app settings with production URLs

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Check Firebase Console for any error logs
4. Ensure all Firebase services are enabled in your project
