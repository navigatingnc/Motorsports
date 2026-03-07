# Phase 23: Mobile App — React Native Scaffolding & Auth

**Date:** March 7, 2026 &nbsp;|&nbsp; **Status:** ✅ Completed  
**Branch:** `phase-23-mobile-app-auth`

---

## Summary

Initialized the `mobile/` directory as a standalone **Expo SDK 55 + React Native 0.83** project with TypeScript. Configured environment variables for the backend API URL, wired up **React Navigation v7** for screen routing, implemented **Login** and **Register** screens that connect to the existing `/api/auth` endpoints, and secured JWT persistence with **Expo SecureStore** alongside a global Axios request interceptor that automatically attaches the Bearer token to every authenticated API call.

---

## Tasks Completed

### 1. Expo Project Initialization (`mobile/`)

- Bootstrapped with `create-expo-app --template blank-typescript`, producing an Expo SDK 55 project targeting React Native 0.83.
- Renamed app from `"mobile"` to `"Motorsports"` in `app.json`.
- Set `userInterfaceStyle` to `"dark"` and splash background to `#0F172A` to match the web app's dark theme.
- Added `expo-secure-store` to the `plugins` array in `app.json` for native module linking.
- Added `extra.apiUrl` field in `app.json` to expose the backend URL via `expo-constants`.

### 2. Environment Variable Configuration

- Created `.env.example` documenting `EXPO_PUBLIC_API_URL=http://localhost:3000`.
- Created `.env` with the same default for local development.
- Added `.env` to `.gitignore` to prevent accidental secret commits.
- `api.service.ts` resolves the URL via `Constants.expoConfig.extra.apiUrl` → `process.env.EXPO_PUBLIC_API_URL` → `http://localhost:3000` (fallback chain).

### 3. Installed Dependencies

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `@react-navigation/native` | ^7.1.33 | Navigation container |
| `@react-navigation/native-stack` | ^7.14.4 | Native stack navigator |
| `@react-navigation/bottom-tabs` | ^7.15.5 | Bottom tab navigator (Phase 24) |
| `axios` | ^1.13.6 | HTTP client |
| `expo-secure-store` | ^55.0.8 | Encrypted native key-value storage |
| `expo-constants` | ^55.0.7 | Access to `app.json` extra config |
| `react-native-screens` | ^4.24.0 | Native screen optimization |
| `react-native-safe-area-context` | ^5.7.0 | Safe area insets |

### 4. API Service & JWT Token Helpers (`src/services/api.service.ts`)

- Created an Axios instance with `baseURL` pointing to `${API_BASE_URL}/api` and a 15-second timeout.
- Implemented `storeToken(token)`, `getToken()`, and `removeToken()` helpers wrapping `expo-secure-store` under the key `motorsports_jwt_token`.
- Added a **request interceptor** that calls `getToken()` before every request and, if a token exists, injects `Authorization: Bearer <token>` into the headers.

### 5. Auth Service (`src/services/auth.service.ts`)

- `login(dto)` — POSTs to `/api/auth/login`, stores the returned JWT, and returns the user profile.
- `register(dto)` — POSTs to `/api/auth/register`, stores the returned JWT, and returns the user profile.
- `getMe()` — GETs `/api/auth/me` to restore a session from a persisted token.
- `logout()` — Deletes the stored JWT via `removeToken()`.

### 6. Auth Context (`src/context/AuthContext.tsx`)

- `AuthProvider` manages `user: AuthUser | null` and `isLoading: boolean` state.
- On mount, checks SecureStore for an existing token and calls `getMe()` to restore the session silently; expired/invalid tokens are cleared without error.
- Exposes `login`, `register`, `logout` callbacks and `isAuthenticated` derived boolean.
- `useAuth()` hook throws a descriptive error if called outside the provider.

### 7. Navigation Architecture (`src/navigation/`)

| File | Description |
| :--- | :--- |
| `types.ts` | `AuthStackParamList` and `AppStackParamList` type definitions |
| `AuthNavigator.tsx` | Native stack: Login → Register (no header chrome) |
| `AppNavigator.tsx` | Native stack: Home placeholder (expanded in Phase 24) |
| `RootNavigator.tsx` | Wraps `NavigationContainer`; renders Auth or App stack based on `isAuthenticated`; shows a full-screen spinner during session restore |

### 8. Login Screen (`src/screens/LoginScreen.tsx`)

- Dark-themed form with email and password fields.
- Client-side validation: required fields, email format check.
- Calls `useAuth().login()` on submit; displays `Alert` with the server's error message on failure.
- Links to `RegisterScreen` via `navigation.navigate('Register')`.
- `KeyboardAvoidingView` + `ScrollView` for proper keyboard handling on both iOS and Android.

### 9. Register Screen (`src/screens/RegisterScreen.tsx`)

- Dark-themed form with first name, last name, email, password, and confirm password fields.
- Client-side validation: all required, email format, minimum 8-character password, password match.
- Calls `useAuth().register()` on submit; displays `Alert` on failure.
- Links back to `LoginScreen`.

### 10. Home Screen Placeholder (`src/screens/HomeScreen.tsx`)

- Displays a welcome message with the authenticated user's name and role.
- Provides a **Sign Out** button that calls `useAuth().logout()`.
- Includes a note that core screens (Vehicles, Events, Lap Times) are coming in Phase 24.

### 11. App Entry Point (`App.tsx`)

- Replaced the default Expo boilerplate with `<AuthProvider>` wrapping `<RootNavigator>`.
- `StatusBar` set to `"light"` style for the dark theme.

### 12. Documentation (`mobile/README.md`)

- Covers prerequisites, setup steps, environment variables, project structure, authentication flow, and phase roadmap.

---

## Generated Code

| File | Type | Description |
| :--- | :--- | :--- |
| `mobile/App.tsx` | Modified | AuthProvider + RootNavigator entry point |
| `mobile/app.json` | Modified | Dark theme, Motorsports branding, extra config, secure-store plugin |
| `mobile/.env.example` | New | Environment variable template |
| `mobile/.env` | New | Local development environment (git-ignored) |
| `mobile/.gitignore` | Modified | Added `.env` to ignored files |
| `mobile/README.md` | New | Full mobile app documentation |
| `mobile/src/types/auth.types.ts` | New | `AuthUser`, `LoginDto`, `RegisterDto`, `AuthResponse`, `ApiError` |
| `mobile/src/services/api.service.ts` | New | Axios instance + SecureStore token helpers + JWT interceptor |
| `mobile/src/services/auth.service.ts` | New | `login`, `register`, `getMe`, `logout` functions |
| `mobile/src/context/AuthContext.tsx` | New | Global auth state provider + `useAuth` hook |
| `mobile/src/navigation/types.ts` | New | Navigator param list type definitions |
| `mobile/src/navigation/AuthNavigator.tsx` | New | Unauthenticated stack (Login, Register) |
| `mobile/src/navigation/AppNavigator.tsx` | New | Authenticated stack (Home placeholder) |
| `mobile/src/navigation/RootNavigator.tsx` | New | Root navigator with session-restore loading state |
| `mobile/src/screens/LoginScreen.tsx` | New | Email/password login form with validation |
| `mobile/src/screens/RegisterScreen.tsx` | New | New account registration form with validation |
| `mobile/src/screens/HomeScreen.tsx` | New | Authenticated placeholder screen with logout |

---

## Next Phase Preview

Phase 24 will build the core mobile screens: a `VehiclesScreen` with pull-to-refresh and `VehicleDetailScreen`, an `EventsScreen` with upcoming/past tabs and `EventDetailScreen` showing weather and setup sheets, a `RecordLapTimeScreen` with a stopwatch UI, and a bottom tab navigator wiring all screens together.

---
