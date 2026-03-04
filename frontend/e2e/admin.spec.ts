/**
 * E2E tests — Admin panel access control
 *
 * Covers:
 *  1. Non-admin users cannot access /admin (redirected to /).
 *  2. Admin users can access the admin panel (requires seeded admin credentials).
 *  3. The admin panel renders a user management table.
 */
import { test, expect } from '@playwright/test';
import { registerUser, loginUser, TEST_USER, ADMIN_USER } from './helpers';

// ---------------------------------------------------------------------------
// 1. Non-admin cannot access /admin
// ---------------------------------------------------------------------------

test('non-admin users are redirected away from /admin', async ({ page }) => {
  // Register a standard (non-admin) user
  const uniqueUser = {
    ...TEST_USER,
    email: `e2e.nonadmin.${Date.now()}@motorsports.test`,
  };
  await registerUser(page, uniqueUser);

  // Attempt to navigate to the admin panel
  await page.goto('/admin');

  // Should be redirected — not on /admin
  await expect(page).not.toHaveURL(/\/admin/);
});

// ---------------------------------------------------------------------------
// 2 & 3. Admin user can access the admin panel (optional — requires seeded admin)
// ---------------------------------------------------------------------------

test('admin user can access the admin panel and see user management table', async ({ page }) => {
  // Skip if no admin credentials are configured in the environment
  if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
    test.skip(true, 'Admin credentials not configured — set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD');
  }

  await loginUser(page, ADMIN_USER.email, ADMIN_USER.password);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin/);

  // The admin panel should show a heading and a users table
  await expect(
    page.getByRole('heading', { name: /admin|user management/i })
  ).toBeVisible({ timeout: 10_000 });

  await expect(
    page.getByRole('table').or(page.getByRole('grid'))
  ).toBeVisible({ timeout: 10_000 });
});

// ---------------------------------------------------------------------------
// 4. Admin panel link is not visible in the navbar for non-admin users
// ---------------------------------------------------------------------------

test('admin nav link is hidden for non-admin users', async ({ page }) => {
  const uniqueUser = {
    ...TEST_USER,
    email: `e2e.navadmin.${Date.now()}@motorsports.test`,
  };
  await registerUser(page, uniqueUser);

  // The "Admin" nav link should not be visible
  await expect(
    page.getByRole('link', { name: /^admin$/i })
  ).not.toBeVisible();
});
