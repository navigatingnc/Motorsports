# Phase 7: Frontend: Authentication Flow

**Date:** February 21, 2026  
**Status:** ✅ Completed

---

### Summary
Implemented the complete frontend authentication flow for the Motorsports Management application. This phase delivers a `LoginPage`, a `RegisterPage`, a global `AuthContext` powered by React Context API, a `ProtectedRoute` guard component, and an enhanced Axios interceptor. The JWT token is stored securely in `localStorage` and automatically attached to every outgoing API request. Unauthenticated users are redirected to `/login` and returned to their original destination after a successful sign-in. The navigation bar dynamically reflects the user's authentication state, displaying the user's name, role badge, and a sign-out button when logged in.

### Work Performed

1. **Auth Type Definitions (`src/types/auth.ts`)**
   - Defined `LoginDto`, `RegisterDto`, `AuthUser`, and `AuthResponse` interfaces that mirror the backend's API contract.

2. **Auth Service (`src/services/authService.ts`)**
   - Implemented `login()`, `register()`, `logout()`, `getCurrentUser()`, and `isAuthenticated()` methods.
   - `login()` and `register()` persist the JWT token and serialized user object to `localStorage` on success.
   - `logout()` removes both keys from `localStorage`.

3. **Auth Context (`src/context/AuthContext.tsx`)**
   - Created `AuthProvider` using React Context and `useState` to hold the current `AuthUser | null`.
   - Initializes state from `localStorage` so the session survives page refreshes.
   - Exposes `user`, `isAuthenticated`, `login`, `register`, and `logout` to all descendant components via the `useAuth()` hook.

4. **Protected Route (`src/components/ProtectedRoute.tsx`)**
   - Wraps any route element and redirects unauthenticated visitors to `/login`.
   - Preserves the intended destination in `location.state.from` so the user is forwarded there after login.

5. **Login Page (`src/pages/LoginPage.tsx`)**
   - Email + password form with client-side validation and loading state.
   - On success, navigates to the originally requested route (or `/vehicles` by default).
   - Displays server-side error messages (e.g., "Invalid email or password").

6. **Register Page (`src/pages/RegisterPage.tsx`)**
   - First name, last name, email, password, and confirm-password fields.
   - Client-side password match and minimum-length validation before hitting the API.
   - On success, navigates to `/vehicles`.

7. **Axios Interceptor Update (`src/services/api.ts`)**
   - Request interceptor attaches `Authorization: Bearer <token>` to every request when a token is present.
   - Response interceptor clears `localStorage` and redirects to `/login` on `401 Unauthorized`, with a guard to prevent redirect loops on auth pages.

8. **App.tsx Refactor**
   - Wrapped the application in `<AuthProvider>` (inside `<Router>`).
   - All protected routes (`/vehicles`, `/events`, etc.) are wrapped with `<ProtectedRoute>`.
   - Navbar conditionally renders auth links (Sign In / Register) or the user's name, role, and a Sign Out button.
   - Added `/login` and `/register` as public routes.
   - Added a catch-all `*` route that redirects to `/`.

9. **Entry Point Migration (`src/main.tsx`)**
   - Replaced the default Vite `main.ts` with a proper React entry point (`main.tsx`) that mounts `<App />` inside `<StrictMode>`.
   - Updated `index.html` to reference `main.tsx` and set the page title to "Motorsports Management".

10. **Auth Page Styles (`src/App.css`)**
    - Added `.auth-page`, `.auth-card`, `.auth-form`, `.form-group`, `.form-input`, `.form-row`, `.auth-error`, `.auth-submit-btn`, `.auth-link`, `.auth-footer-text` styles.
    - Added `.nav-user-info`, `.nav-user-name`, `.nav-user-role`, and `.btn-logout` styles for the authenticated navbar state.
    - Added responsive breakpoints for the two-column name row on small screens.

### Code Generated

#### `frontend/src/types/auth.ts`
```typescript
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
```

#### `frontend/src/services/authService.ts`
```typescript
import api from './api';
import type { LoginDto, RegisterDto, AuthResponse } from '../types/auth';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authService = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): AuthResponse['user'] | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AuthResponse['user'];
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
```

#### `frontend/src/context/AuthContext.tsx`
```typescript
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginDto, RegisterDto } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const login = useCallback(async (credentials: LoginDto) => {
    const { user: loggedInUser } = await authService.login(credentials);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (data: RegisterDto) => {
    const { user: registeredUser } = await authService.register(data);
    setUser(registeredUser);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
```

#### `frontend/src/components/ProtectedRoute.tsx`
```typescript
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

#### `frontend/src/pages/LoginPage.tsx`
```typescript
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  from?: { pathname: string };
}

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname ?? '/vehicles';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error ?? 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Welcome back to Motorsports Management</p>
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input id="email" type="email" className="form-input" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              required autoComplete="email" disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" className="form-input" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
              required autoComplete="current-password" disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer-text">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
```

#### `frontend/src/pages/RegisterPage.tsx`
```typescript
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    setIsSubmitting(true);
    try {
      await register({ firstName, lastName, email, password });
      navigate('/vehicles', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error ?? 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the Motorsports Management platform</p>
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input id="firstName" type="text" className="form-input" value={firstName}
                onChange={(e) => setFirstName(e.target.value)} placeholder="John"
                required autoComplete="given-name" disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input id="lastName" type="text" className="form-input" value={lastName}
                onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
                required autoComplete="family-name" disabled={isSubmitting} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input id="email" type="email" className="form-input" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              required autoComplete="email" disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" type="password" className="form-input" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 characters"
              required autoComplete="new-password" disabled={isSubmitting} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input id="confirmPassword" type="password" className="form-input" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password"
              required autoComplete="new-password" disabled={isSubmitting} />
          </div>
          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
```

#### `frontend/src/services/api.ts` (updated)
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### `frontend/src/main.tsx` (new)
```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error('Root element #app not found in the document.');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Build Verification
- `pnpm exec tsc --noEmit` — zero TypeScript errors
- `pnpm build` — production bundle compiled successfully (102 modules, 285 kB JS)

### Next Phase Preview
Phase 8 will implement the backend `SetupSheet` model in Prisma, create relations to `Vehicle` and `Event`, and build protected `/api/setups` CRUD endpoints.


---
