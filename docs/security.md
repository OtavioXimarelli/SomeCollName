# Security Guide

This document outlines security best practices and implementations for the SomeCoolName application.

## 🔒 Security Overview

Our application implements multiple layers of security to protect user data and ensure safe operation.

## Authentication & Authorization

### Firebase Authentication
- **Email/Password Authentication**: Secure user registration and login
- **Session Management**: Automatic token refresh and secure session handling
- **Protected Routes**: Client-side route protection with server-side validation

### Implementation Details

```typescript
// Example of protected route implementation
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  if (!user) redirect('/auth')
  
  return <>{children}</>
}
```

## Data Security

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Couple profiles can only be accessed by associated users
    match /couples/{coupleId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.userIds;
    }
    
    // Photos can only be accessed by couple members
    match /photos/{photoId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/couples/$(resource.data.coupleId)) &&
        request.auth.uid in get(/databases/$(database)/documents/couples/$(resource.data.coupleId)).data.userIds;
    }
  }
}
```

### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Photos can only be uploaded/accessed by authenticated users
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

## Input Validation & Sanitization

### Client-Side Validation

```typescript
import { z } from 'zod'

// Validation schemas
export const coupleSchema = z.object({
  partner1Name: z.string().min(1).max(50),
  partner2Name: z.string().min(1).max(50),
  anniversaryDate: z.date(),
  description: z.string().max(500).optional(),
})

export const photoSchema = z.object({
  caption: z.string().max(200).optional(),
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024,
    'File size must be less than 10MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, and WebP images are allowed'
  ),
})
```

### Server-Side Validation

```typescript
// Example server-side validation for API routes
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token)
    
    const body = await request.json()
    const validatedData = coupleSchema.parse(body)
    
    // Proceed with validated data
    
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
```

## Content Security Policy (CSP)

Implemented in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://firebasestorage.googleapis.com https://i.scdn.co;
      connect-src 'self' https://*.googleapis.com https://api.spotify.com wss://*.googleapis.com;
      font-src 'self';
      frame-src 'self' https://accounts.google.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

## Environment Security

### Environment Variables

- **Sensitive Keys**: Never commit API keys or secrets to version control
- **Environment Separation**: Use different Firebase projects for dev/staging/production
- **Key Rotation**: Regularly rotate API keys and tokens

```bash
# .env.local (never committed)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret # Server-side only
```

### Production Checklist

- [ ] Firebase Security Rules are properly configured
- [ ] Environment variables are set on hosting platform
- [ ] HTTPS is enforced
- [ ] CSP headers are configured
- [ ] Rate limiting is implemented
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date
- [ ] Security scanning is enabled

## API Security

### Rate Limiting

```typescript
// Example rate limiting middleware
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function middleware(request: Request) {
  const identifier = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
}
```

### API Authentication

```typescript
// Middleware for API route protection
export async function authenticateRequest(request: Request) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    return decodedToken
  } catch (error) {
    throw new Error('Invalid token')
  }
}
```

## Data Privacy

### GDPR Compliance

1. **Data Minimization**: Only collect necessary data
2. **User Consent**: Clear consent mechanisms for data processing
3. **Data Portability**: Users can export their data
4. **Right to Deletion**: Users can delete their accounts and data
5. **Privacy Policy**: Clear privacy policy explaining data usage

### Data Encryption

- **In Transit**: All data transmitted over HTTPS
- **At Rest**: Firebase automatically encrypts data at rest
- **Client-Side**: Sensitive data is never stored in localStorage/sessionStorage

## Monitoring & Incident Response

### Security Monitoring

```typescript
// Security event logging
export function logSecurityEvent(event: string, details: any, userId?: string) {
  console.log(`[SECURITY] ${event}`, {
    timestamp: new Date().toISOString(),
    event,
    details,
    userId,
    userAgent: navigator.userAgent,
    ip: 'redacted', // Don't log IPs in client-side code
  })
  
  // Send to security monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // analytics.track('security_event', { event, details, userId })
  }
}
```

### Incident Response Plan

1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Determine severity and scope
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threats and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Post-incident review and improvements

## Security Testing

### Automated Security Scanning

```bash
# Dependencies vulnerability scanning
npm audit
npm audit fix

# Code security scanning
npx eslint-plugin-security
npx semgrep --config=auto

# Infrastructure scanning
firebase deploy --only functions:validate
```

### Manual Security Testing

1. **Authentication Testing**: Test login/logout flows
2. **Authorization Testing**: Verify access controls
3. **Input Validation**: Test with malicious inputs
4. **Session Management**: Test session timeout and invalidation
5. **Error Handling**: Ensure no sensitive information leakage

## Best Practices Summary

1. ✅ **Principle of Least Privilege**: Users only have access to their own data
2. ✅ **Defense in Depth**: Multiple security layers (client, server, database)
3. ✅ **Input Validation**: Validate all user inputs client and server-side
4. ✅ **Secure Communication**: HTTPS everywhere
5. ✅ **Error Handling**: Generic error messages to prevent information disclosure
6. ✅ **Logging**: Security events are logged for monitoring
7. ✅ **Regular Updates**: Dependencies are kept up to date
8. ✅ **Security Headers**: Proper HTTP security headers configured

For questions or security concerns, please contact the development team.
