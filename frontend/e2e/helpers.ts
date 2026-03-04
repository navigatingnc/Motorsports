/**
 * Shared helpers and test fixtures for Playwright E2E tests.
 *
 * These utilities abstract common actions (login, register, navigation) so
 * individual test files stay focused on the scenario under test.
 */
import { type Page, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

export const TEST_USER = {
  firstName: 'E2E',
  lastName: 'Tester',
  email: `e2e.tester.${Date.now()}@motorsports.test`,
  password: 'TestPass123!',
};

export const ADMIN_USER = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@motorsports.test',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'AdminPass123!',
};

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/**
 * Navigate to /register, fill in the form, and submit.
 * Waits for a successful redirect to /vehicles.
 */
export async function registerUser(
  page: Page,
  user: { firstName: string; lastName: string; email: string; password: string }
) {
  await page.goto('/register');
  await page.getByLabel(/first name/i).fill(user.firstName);
  await page.getByLabel(/last name/i).fill(user.lastName);
  await page.getByLabel(/email/i).fill(user.email);
  // Fill password fields — use index to distinguish password from confirm
  const passwordFields = page.getByLabel(/password/i);
  await passwordFields.nth(0).fill(user.password);
  await passwordFields.nth(1).fill(user.password);
  await page.getByRole('button', { name: /create account|register/i }).click();
  await expect(page).toHaveURL(/\/vehicles/);
}

/**
 * Navigate to /login, fill in credentials, and submit.
 * Waits for a successful redirect away from /login.
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * Log out by clicking the Sign Out button in the navbar.
 */
export async function logoutUser(page: Page) {
  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/login/);
}
