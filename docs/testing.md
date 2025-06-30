# Testing Guide

This guide covers testing strategies and setup for the SomeCoolName application.

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Component Testing**: Storybook
- **Firebase Testing**: Firebase Emulator Suite

## Setup Instructions

### 1. Install Testing Dependencies

```bash
# Unit testing
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# E2E testing
npm install --save-dev @playwright/test

# Component testing
npm install --save-dev @storybook/react @storybook/addon-essentials

# Firebase testing
npm install --save-dev firebase-tools
```

### 2. Jest Configuration

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}))
```

### 3. Sample Tests

#### Component Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthForm } from '@/components/auth/AuthForm'

describe('AuthForm', () => {
  it('renders login form by default', () => {
    render(<AuthForm />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('toggles to signup form', () => {
    render(<AuthForm />)
    fireEvent.click(screen.getByText('Create an account'))
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })
})
```

#### Hook Test Example

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated', delay: 100 })
    expect(result.current).toBe('initial')

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
    })

    expect(result.current).toBe('updated')
  })
})
```

### 4. E2E Testing with Playwright

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

#### Sample E2E Test

```typescript
import { test, expect } from '@playwright/test'

test('user can create and manage a couple profile', async ({ page }) => {
  await page.goto('/')
  
  // Test authentication
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Sign In' }).click()
  
  // Test couple creation
  await page.getByRole('button', { name: 'Create Couple Profile' }).click()
  await page.getByLabel('Partner 1 Name').fill('Alice')
  await page.getByLabel('Partner 2 Name').fill('Bob')
  await page.getByRole('button', { name: 'Create Profile' }).click()
  
  // Verify couple profile was created
  await expect(page.getByText('Alice & Bob')).toBeVisible()
})
```

### 5. Firebase Emulator Testing

Create `firebase.json` with emulator configuration:

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

#### Test with Emulators

```typescript
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

// Setup emulators for testing
if (process.env.NODE_ENV === 'test') {
  const auth = getAuth()
  const firestore = getFirestore()
  const storage = getStorage()
  
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(firestore, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

### 6. Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:emulator": "firebase emulators:start",
    "storybook": "start-storybook -p 6006",
    "build-storybook": "build-storybook"
  }
}
```

### 7. Testing Best Practices

1. **Test Structure**: Follow AAA (Arrange, Act, Assert) pattern
2. **Test Coverage**: Aim for 80%+ coverage for critical paths
3. **Mock External Services**: Always mock Firebase, Spotify API, etc.
4. **Test User Flows**: Focus on testing complete user journeys
5. **Performance Testing**: Test component render times and memory usage
6. **Accessibility Testing**: Use testing-library's accessibility queries
7. **Visual Regression**: Consider tools like Chromatic for visual testing

### 8. CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
      
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

This testing setup ensures your application is reliable, maintainable, and provides confidence when making changes.
