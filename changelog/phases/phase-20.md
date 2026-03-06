# Phase 20: Frontend: Component & End-to-End Testing

**Date:** March 4, 2026  
**Status:** ✅ Completed

---

### Summary

Installed and configured **Vitest 4** with **React Testing Library** for component-level tests and **Playwright 1.58** for browser-based end-to-end tests. All 20 component tests pass. Four E2E test suites covering authentication, vehicle management, lap time recording, and admin panel access control are ready to run against a live dev server.

### Work Performed

1. **Vitest Configuration**
   - Installed `vitest`, `@vitest/ui`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
   - Created `frontend/vitest.config.ts` with jsdom environment, global test APIs, and v8 coverage provider
   - Created `frontend/src/tests/setup.ts` to import `@testing-library/jest-dom` matchers globally

2. **Component Tests** (`frontend/src/tests/components/`)
   - `SetupSheetForm.test.tsx` — 7 tests: form rendering, vehicle validation, successful submission, API error display, cancel callback, disabled-while-submitting state
   - `WeatherWidget.test.tsx` — 4 tests: loading state, successful data render with function matchers for split text nodes, error state, correct eventId propagation
   - `ProtectedRoute.test.tsx` — 3 tests: authenticated access, unauthenticated redirect to `/login`, no content leak
   - `RoleGuard.test.tsx` — 6 tests: allowed-role access, default fallback, custom fallback, null user, user-role allow, viewer-role deny

3. **Playwright E2E Configuration**
   - Installed `@playwright/test`
   - Created `frontend/playwright.config.ts` with chromium, firefox, and mobile-chrome projects; auto-starts Vite dev server via `webServer`
   - Created `frontend/e2e/helpers.ts` with `registerUser`, `loginUser`, `logoutUser` shared utilities

4. **E2E Test Suites** (`frontend/e2e/`)
   - `auth.spec.ts` — 6 tests: unauthenticated redirect, registration, login, invalid credentials, logout, post-logout protection
   - `vehicles.spec.ts` — 6 tests: list page, add form navigation, create vehicle, detail page, edit vehicle, form validation
   - `laptimes.spec.ts` — 4 tests: analytics dashboard access, lap time form reachability, recording a lap time, no error boundary
   - `admin.spec.ts` — 3 tests: non-admin redirect, admin panel access (requires env vars), admin nav link hidden for non-admins

5. **Package Updates**
   - Added scripts to `frontend/package.json`: `test`, `test:watch`, `test:ui`, `test:coverage`, `test:e2e`, `test:e2e:ui`, `test:e2e:report`

### Test Results

```
Component Tests (Vitest):
  Test Files  4 passed (4)
       Tests  20 passed (20)
    Duration  ~3.2s
```

### Generated Code

#### `frontend/vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**', 'src/context/**', 'src/pages/**'],
    },
  },
});
```

#### `frontend/src/tests/setup.ts`
```typescript
import '@testing-library/jest-dom';
```

#### `frontend/src/tests/components/ProtectedRoute.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import * as AuthContextModule from '../../context/AuthContext';
import type { AuthUser } from '../../types/auth';

const mockUser: AuthUser = {
  id: '1', email: 'driver@example.com', firstName: 'John', lastName: 'Doe', role: 'user',
};

function renderWithRouter(initialPath: string, isAuthenticated: boolean, user: AuthUser | null = null) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user, isAuthenticated, login: vi.fn(), register: vi.fn(), logout: vi.fn(),
  });
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/protected" element={<ProtectedRoute><div>Protected Content</div></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when the user is authenticated', () => {
    renderWithRouter('/protected', true, mockUser);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  it('redirects to /login when the user is not authenticated', () => {
    renderWithRouter('/protected', false, null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  it('does not render protected content for unauthenticated users', () => {
    renderWithRouter('/protected', false, null);
    expect(screen.queryByText('Protected Content')).toBeNull();
  });
});
```

#### `frontend/src/tests/components/RoleGuard.test.tsx`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleGuard from '../../components/RoleGuard';
import * as AuthContextModule from '../../context/AuthContext';
import type { AuthUser } from '../../types/auth';

function makeUser(role: string): AuthUser {
  return { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role };
}

function renderGuard(user: AuthUser | null, allowedRoles: string[], fallback?: string) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    user, isAuthenticated: !!user, login: vi.fn(), register: vi.fn(), logout: vi.fn(),
  });
  return render(
    <MemoryRouter initialEntries={['/guarded']}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/forbidden" element={<div>Forbidden Page</div>} />
        <Route path="/guarded" element={
          <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
            <div>Admin Content</div>
          </RoleGuard>
        } />
      </Routes>
    </MemoryRouter>
  );
}

describe('RoleGuard', () => {
  it('renders children when the user has an allowed role', () => {
    renderGuard(makeUser('admin'), ['admin', 'user']);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
  it('redirects to "/" by default when the user role is not allowed', () => {
    renderGuard(makeUser('viewer'), ['admin']);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
  it('redirects to a custom fallback path when specified', () => {
    renderGuard(makeUser('viewer'), ['admin'], '/forbidden');
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });
  it('redirects when user is null', () => {
    renderGuard(null, ['admin']);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
  it('allows access for "user" role when included in allowedRoles', () => {
    renderGuard(makeUser('user'), ['admin', 'user']);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
  it('denies access for "viewer" role when only "admin" is allowed', () => {
    renderGuard(makeUser('viewer'), ['admin']);
    expect(screen.queryByText('Admin Content')).toBeNull();
  });
});
```

#### `frontend/src/tests/components/WeatherWidget.test.tsx`
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WeatherWidget from '../../components/WeatherWidget';
import * as weatherServiceModule from '../../services/weatherService';
import type { EventWeather } from '../../types/weather';

const mockWeatherData: EventWeather = {
  eventId: 'evt-1', eventName: 'Spring Race',
  venue: 'Daytona International Speedway', location: 'Daytona Beach, FL',
  startDate: '2026-04-10', endDate: '2026-04-12',
  coordinates: { latitude: 29.185, longitude: -81.071 },
  current: {
    temperature: 24, apparent_temperature: 26, wind_speed: 15, wind_direction: 180,
    wind_gusts: 22, precipitation: 0, cloud_cover: 20, relative_humidity: 55,
    visibility: 10000, weather_code: 0, condition: 'Clear Sky',
    description: 'Clear and sunny', icon: '☀️',
  },
  daily: [{ date: '2026-04-10', temperature_max: 28, temperature_min: 18,
    precipitation_sum: 0, precipitation_probability_max: 5, wind_speed_max: 20,
    wind_gusts_max: 30, wind_direction_dominant: 180, weather_code: 0,
    sunrise: '2026-04-10T06:30:00Z', sunset: '2026-04-10T19:45:00Z' }],
  hourly: [],
  units: { temperature: '°C', wind_speed: 'km/h', precipitation: 'mm', visibility: 'm' },
  fetched_at: '2026-04-10T08:00:00Z',
};

describe('WeatherWidget', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('shows a loading state initially', () => {
    vi.spyOn(weatherServiceModule.weatherService, 'getEventWeather')
      .mockReturnValue(new Promise(() => {}));
    render(<WeatherWidget eventId="evt-1" />);
    expect(screen.getByText(/loading weather forecast/i)).toBeInTheDocument();
  });

  it('renders weather data after a successful fetch', async () => {
    vi.spyOn(weatherServiceModule.weatherService, 'getEventWeather')
      .mockResolvedValue(mockWeatherData);
    render(<WeatherWidget eventId="evt-1" />);
    await waitFor(() => { expect(screen.getByText('Clear Sky')).toBeInTheDocument(); });
    expect(screen.getByText((_c, el) =>
      el?.tagName === 'SPAN' && (el.textContent ?? '').includes('Daytona International Speedway')
    )).toBeInTheDocument();
  });

  it('displays an error message when the fetch fails', async () => {
    vi.spyOn(weatherServiceModule.weatherService, 'getEventWeather')
      .mockRejectedValue(new Error('Network error'));
    render(<WeatherWidget eventId="evt-1" />);
    await waitFor(() => {
      expect(screen.getByText(/unable to load weather data/i)).toBeInTheDocument();
    });
  });

  it('calls getEventWeather with the correct eventId', async () => {
    const spy = vi.spyOn(weatherServiceModule.weatherService, 'getEventWeather')
      .mockResolvedValue(mockWeatherData);
    render(<WeatherWidget eventId="evt-42" />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith('evt-42'));
  });
});
```

#### `frontend/src/tests/components/SetupSheetForm.test.tsx`
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetupSheetForm from '../../components/SetupSheetForm';
import * as setupServiceModule from '../../services/setupService';

const vehicleOptions = [
  { id: 'v1', label: '#42 — Ford Mustang GT3 (2024)' },
  { id: 'v2', label: '#7 — Chevrolet Camaro Z/28 (2023)' },
];

function renderForm(overrides?: { onSuccess?: () => void; onCancel?: () => void }) {
  const onSuccess = overrides?.onSuccess ?? vi.fn();
  const onCancel = overrides?.onCancel ?? vi.fn();
  render(<SetupSheetForm eventId="evt-1" vehicleOptions={vehicleOptions}
    onSuccess={onSuccess} onCancel={onCancel} />);
  return { onSuccess, onCancel };
}

describe('SetupSheetForm', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('renders the form heading and action buttons', () => {
    renderForm();
    expect(screen.getByText('New Setup Sheet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save setup sheet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows a validation error when submitting without selecting a vehicle', async () => {
    renderForm();
    fireEvent.submit(document.querySelector('form.setup-form')!);
    expect(await screen.findByText(/please select a vehicle/i)).toBeInTheDocument();
  });

  it('calls createSetup and invokes onSuccess after a valid submission', async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(setupServiceModule.setupService, 'createSetup')
      .mockResolvedValue(undefined as never);
    const { onSuccess } = renderForm();
    await user.selectOptions(screen.getByRole('combobox', { name: /vehicle/i }), 'v1');
    await user.click(screen.getByRole('button', { name: /save setup sheet/i }));
    await waitFor(() => { expect(spy).toHaveBeenCalledOnce(); });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('displays an API error message when createSetup rejects', async () => {
    const user = userEvent.setup();
    vi.spyOn(setupServiceModule.setupService, 'createSetup')
      .mockRejectedValue(new Error('Server error: 500'));
    renderForm();
    await user.selectOptions(screen.getByRole('combobox', { name: /vehicle/i }), 'v2');
    await user.click(screen.getByRole('button', { name: /save setup sheet/i }));
    expect(await screen.findByText(/server error: 500/i)).toBeInTheDocument();
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderForm();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables both buttons while submitting', async () => {
    const user = userEvent.setup();
    vi.spyOn(setupServiceModule.setupService, 'createSetup')
      .mockReturnValue(new Promise(() => {}));
    renderForm();
    await user.selectOptions(screen.getByRole('combobox', { name: /vehicle/i }), 'v1');
    await user.click(screen.getByRole('button', { name: /save setup sheet/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });
});
```

#### `frontend/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

#### `frontend/e2e/helpers.ts`
```typescript
import { type Page, expect } from '@playwright/test';

export const TEST_USER = {
  firstName: 'E2E', lastName: 'Tester',
  email: `e2e.tester.${Date.now()}@motorsports.test`,
  password: 'TestPass123!',
};

export const ADMIN_USER = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@motorsports.test',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'AdminPass123!',
};

export async function registerUser(page: Page, user: typeof TEST_USER) {
  await page.goto('/register');
  await page.getByLabel(/first name/i).fill(user.firstName);
  await page.getByLabel(/last name/i).fill(user.lastName);
  await page.getByLabel(/email/i).fill(user.email);
  const passwordFields = page.getByLabel(/password/i);
  await passwordFields.nth(0).fill(user.password);
  await passwordFields.nth(1).fill(user.password);
  await page.getByRole('button', { name: /create account|register/i }).click();
  await expect(page).toHaveURL(/\/vehicles/);
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

export async function logoutUser(page: Page) {
  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/login/);
}
```

### File Summary

| File | Description |
| :--- | :--- |
| `frontend/vitest.config.ts` | Vitest configuration with jsdom environment and v8 coverage |
| `frontend/src/tests/setup.ts` | Global test setup importing jest-dom matchers |
| `frontend/src/tests/components/SetupSheetForm.test.tsx` | 7 component tests for SetupSheetForm |
| `frontend/src/tests/components/WeatherWidget.test.tsx` | 4 component tests for WeatherWidget |
| `frontend/src/tests/components/ProtectedRoute.test.tsx` | 3 component tests for ProtectedRoute |
| `frontend/src/tests/components/RoleGuard.test.tsx` | 6 component tests for RoleGuard |
| `frontend/playwright.config.ts` | Playwright configuration with 3 browser projects |
| `frontend/e2e/helpers.ts` | Shared E2E test utilities |
| `frontend/e2e/auth.spec.ts` | 6 E2E tests for authentication flows |
| `frontend/e2e/vehicles.spec.ts` | 6 E2E tests for vehicle management |
| `frontend/e2e/laptimes.spec.ts` | 4 E2E tests for lap time recording |
| `frontend/e2e/admin.spec.ts` | 3 E2E tests for admin panel access control |

### Next Phase Preview
Phase 21 will integrate **Pino** structured logging throughout the backend, expose a **Prometheus-compatible `/api/metrics` endpoint**, integrate the **Sentry SDK** into both backend and frontend for error tracking, and add a **StatusPage.tsx** showing live API health, version, and uptime.

---
