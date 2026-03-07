# Motorsports Mobile App

React Native (Expo) mobile client for the Motorsports Management platform.

## Technology Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Expo SDK 55 + React Native 0.83 |
| **Language** | TypeScript |
| **Navigation** | React Navigation v7 (Native Stack) |
| **HTTP Client** | Axios with JWT interceptor |
| **Secure Storage** | Expo SecureStore |
| **Auth State** | React Context API |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device (for development)

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and set your backend API URL
# EXPO_PUBLIC_API_URL=http://<your-machine-ip>:3000

# Start the development server
npm start
```

### Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

## Project Structure

```
mobile/
├── App.tsx                  # Entry point – AuthProvider + RootNavigator
├── app.json                 # Expo configuration
├── .env.example             # Environment variable template
└── src/
    ├── context/
    │   └── AuthContext.tsx  # Global auth state (user, login, logout)
    ├── navigation/
    │   ├── types.ts         # Navigator param list types
    │   ├── RootNavigator.tsx# Switches between Auth/App stacks
    │   ├── AuthNavigator.tsx# Login + Register screens
    │   └── AppNavigator.tsx # Authenticated screens (Phase 24+)
    ├── screens/
    │   ├── LoginScreen.tsx  # Email/password login form
    │   ├── RegisterScreen.tsx # New account registration form
    │   └── HomeScreen.tsx   # Placeholder; replaced by tabs in Phase 24
    ├── services/
    │   ├── api.service.ts   # Axios instance + SecureStore token helpers
    │   └── auth.service.ts  # login(), register(), getMe(), logout()
    └── types/
        └── auth.types.ts    # Shared TypeScript interfaces
```

## Authentication Flow

1. On app launch, `AuthContext` checks SecureStore for a persisted JWT.
2. If a token is found, it calls `GET /api/auth/me` to restore the session.
3. `RootNavigator` renders `AuthNavigator` (Login/Register) or `AppNavigator` based on `isAuthenticated`.
4. On successful login/register, the JWT is stored via `expo-secure-store` and the user is navigated to the app.
5. On logout, the token is deleted and the user is returned to the Login screen.

## Phases

| Phase | Description | Status |
| :--- | :--- | :--- |
| **23** | Scaffolding & Auth | ✅ Done |
| **24** | Core Screens (Vehicles, Events, Lap Times) | Upcoming |
