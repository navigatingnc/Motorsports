/**
 * E2E tests — Authentication flows
 *
 * Covers:
 *  1. Unauthenticated redirect: visiting a protected route redirects to /login.
 *  2. Registration: a new user can register and is redirected to /vehicles.
 *  3. Login: a registered user can log in with valid credentials.
 *  4. Invalid login: incorrect credentials show an error message.
 *  5. Logout: a logged-in user can sign out and is redirected to /login.
 *  6. Post-logout protection: visiting a protected route after logout redirects to /login.
 */
import { test, expect } from '@playwright/test';
import { registerUser, loginUser, logoutUser, TEST_USER } from './helpers';

// ---------------------------------------------------------------------------
// 1. Unauthenticated redirect
// ---------------------------------------------------------------------------

test('unauthenticated users are redirected to /login when visiting a protected route', async ({
  page,
}) => {
  await page.goto('/vehicles');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// 2. Registration
// ---------------------------------------------------------------------------

test('a new user can register and is redirected to the vehicles page', async ({ page }) => {
  const uniqueUser = {
    ...TEST_USER,
    email: `e2e.reg.${Date.now()}@motorsports.test`,
  };
  await registerUser(page, uniqueUser);
  await expect(page).toHaveURL(/\/vehicles/);
  // Navbar should show the Sign Out button for authenticated users
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// 3. Login
// ---------------------------------------------------------------------------

test('a registered user can log in with valid credentials', async ({ page }) => {
  // First register a fresh account
  const uniqueUser = {
    ...TEST_USER,
    email: `e2e.login.${Date.now()}@motorsports.test`,
  };
  await registerUser(page, uniqueUser);
  // Log out so we can test the login flow
  await logoutUser(page);

  // Now log back in
  await loginUser(page, uniqueUser.email, uniqueUser.password);
  await expect(page).toHaveURL(/\/vehicles/);
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
});

// ---------------------------------------------------------------------------
// 4. Invalid login
// ---------------------------------------------------------------------------

test('invalid credentials show an error message on the login page', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('nobody@example.com');
  await page.getByLabel(/password/i).fill('wrongpassword');
  await page.getByRole('button', { name: /sign in|login/i }).click();

  // Should remain on /login and show an error
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('alert')).toBeVisible();
});

// ---------------------------------------------------------------------------
// 5. Logout
// ---------------------------------------------------------------------------

test('a logged-in user can sign out', async ({ page }) => {
  const uniqueUser = {
    ...TEST_USER,
    email: `e2e.logout.${Date.now()}@motorsports.test`,
  };
  await registerUser(page, uniqueUser);
  await logoutUser(page);
  await expect(page).toHaveURL(/\/login/);
});

// ---------------------------------------------------------------------------
// 6. Post-logout protection
// ---------------------------------------------------------------------------

test('visiting a protected route after logout redirects to /login', async ({ page }) => {
  const uniqueUser = {
    ...TEST_USER,
    email: `e2e.postlogout.${Date.now()}@motorsports.test`,
  };
  await registerUser(page, uniqueUser);
  await logoutUser(page);

  await page.goto('/vehicles');
  await expect(page).toHaveURL(/\/login/);
});
