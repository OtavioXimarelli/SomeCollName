# 💕 Laço Eterno - Couples Memory App

A beautiful and modern couples' memory-sharing application built with Next.js, TypeScript, Firebase, and Spotify integration. Create a private digital space for you and your partner to store memories, share photos, and curate your love soundtrack.

## ✨ Features

### 🔐 **Secure Authentication System**
- Firebase Authentication with email/password and Google Sign-in
- Protected routes ensuring only authenticated users can access features
- User profile management with avatar support
- Session persistence across browser refreshes

### 📱 **Responsive Design**
- Mobile-first approach with beautiful responsive layouts
- Smooth animations and transitions using CSS and Tailwind
- Glass morphism effects and modern UI components
- Touch-friendly interface for mobile devices
- Desktop optimization with hover effects and larger layouts

### 📸 **Advanced Photo Upload**
- Firebase Storage integration for secure photo hosting
- Real-time upload progress indicators
- File validation (type, size limits up to 10MB)
- AI-powered caption suggestions using Google's Gemini AI
- Photo gallery with lightbox view and date stamps
- Lazy loading and image optimization for performance

### 🎵 **Spotify Integration**
- Search and add tracks directly from Spotify's catalog
- Real-time search with debounced API calls
- Album cover displays and artist information
- Embedded Spotify players for each track
- Playlist management with drag-and-drop reordering
- Track preview functionality

### 🎨 **Enhanced UX/UI**
- Modern gradient backgrounds and animations
- Intuitive tab-based navigation for different features
- Loading states and skeleton screens
- Error boundaries with friendly error messages
- Toast notifications for user feedback
- Smooth page transitions and micro-interactions

### 📊 **Relationship Features**
- Relationship day counter with milestone celebrations
- QR code generation for easy sharing
- Couple profile customization
- Memory timeline with photo chronology
- Anniversary and special date tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication, Firestore, and Storage enabled
- Spotify Developer account (optional, for music features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SomeCoolName
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Spotify Configuration (optional)
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```

4. **Start the development server**
   ```bash
   # Using the provided script
   ./start-dev.sh
   
   # Or manually
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002`

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **APIs**: Spotify Web API, Google Gemini AI
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context for authentication
- **Performance**: Image optimization, lazy loading, debounced searches

### **Project Structure**
```
src/
├── app/                    # Next.js App Router pages
│   ├── couple/[id]/       # Dynamic couple pages
│   └── globals.css        # Global styles and animations
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── couple/           # Couple-specific features
│   ├── layout/           # Layout components
│   └── ui/               # Base UI components (Radix)
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
└── types/                # TypeScript type definitions
```

### **Key Components**

#### Authentication System
- `AuthContext`: Manages authentication state
- `AuthForm`: Login/signup component with validation
- `ProtectedRoute`: Route protection wrapper

#### Photo Management
- `PhotoUploadForm`: File upload with progress and validation
- `PhotoGallery`: Responsive grid with lightbox view
- Firebase Storage integration with automatic cleanup

#### Music Integration
- `SpotifyTrackPicker`: Search and select tracks
- `MusicPlayer`: Embedded Spotify player
- Real-time search with caching

#### Core Features
- `EditCouplePageClient`: Main editing interface
- `RelationshipCounter`: Anniversary tracking
- `QRCodeDisplay`: Shareable couple page links

## 🎨 Design System

### **Color Palette**
- **Primary**: Pink and Fuchsia gradients (#ec4899, #d946ef)
- **Secondary**: Rose and warm tones (#f43f5e, #fb7185)
- **Accent**: Soft pastels for backgrounds
- **Text**: High contrast for accessibility

### **Typography**
- **Headlines**: Alegreya (elegant serif)
- **Body**: Belleza (clean sans-serif)
- **Responsive sizes**: Mobile-first scaling

### **Animations**
- Fade-in effects for page loads
- Hover animations for interactive elements
- Loading states with spinners and progress bars
- Smooth transitions between states

## 🔧 Performance Optimizations

### **Frontend Performance**
- Image optimization with Next.js Image component
- Lazy loading for photos and components
- Debounced search inputs to reduce API calls
- Component code splitting and tree shaking

### **API Optimizations**
- Firebase connection pooling
- Cached Spotify search results
- Optimized image upload with compression
- Background uploads with progress tracking

### **Monitoring**
- Firebase Analytics integration
- Performance tracking for page loads
- Error boundary with crash reporting
- User interaction analytics

## 📱 Mobile Experience

### **Responsive Design**
- Touch-optimized interface
- Swipe gestures for photo gallery
- Mobile-first CSS with breakpoints
- Optimized keyboard interactions

### **Performance on Mobile**
- Reduced image sizes for mobile
- Touch-friendly buttons and inputs
- Efficient loading states
- Offline-first approach where possible

## 🚀 Deployment

### **Production Build**
```bash
npm run build
npm start
```

### **Firebase Hosting** (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🔒 Security Features

### **Authentication Security**
- Firebase Authentication with secure tokens
- Session management with automatic refresh
- Protected API routes
- CSRF protection

### **Data Security**
- Firestore security rules for user data isolation
- Firebase Storage rules for authenticated uploads
- Input validation and sanitization
- XSS protection

## 🧪 Testing

### **Type Safety**
```bash
npm run typecheck
```

### **Linting**
```bash
npm run lint
```

### **Component Testing** (Future)
- Jest and React Testing Library setup ready
- Component isolation testing
- Integration tests for key workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Credits

- **UI Components**: Radix UI and shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Alegreya, Belleza)
- **Animations**: Custom CSS with Tailwind
- **Music**: Spotify Web API
- **AI**: Google Gemini AI for photo captions

---

**Made with 💕 for couples who want to preserve their beautiful memories together**
