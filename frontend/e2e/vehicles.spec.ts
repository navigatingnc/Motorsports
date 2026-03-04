/**
 * E2E tests — Vehicle management flows
 *
 * Covers:
 *  1. Vehicle list page renders after login.
 *  2. A user can navigate to the "Add Vehicle" form.
 *  3. A user can create a new vehicle and see it in the list.
 *  4. A user can navigate to a vehicle detail page.
 *  5. A user can edit an existing vehicle.
 *  6. Form validation prevents submission with missing required fields.
 */
import { test, expect } from '@playwright/test';
import { registerUser, TEST_USER } from './helpers';

// ---------------------------------------------------------------------------
// Shared setup — register and log in once per test (isolated state)
// ---------------------------------------------------------------------------

async function loginFreshUser(page: import('@playwright/test').Page) {
  const uniqueUser = {
    ...TEST_USER,
    email: `e2e.vehicle.${Date.now()}@motorsports.test`,
  };
  await registerUser(page, uniqueUser);
  return uniqueUser;
}

// ---------------------------------------------------------------------------
// 1. Vehicle list page
// ---------------------------------------------------------------------------

test('vehicle list page is accessible after login', async ({ page }) => {
  await loginFreshUser(page);
  await page.goto('/vehicles');
  await expect(page).toHaveURL(/\/vehicles/);
  // The page heading or a recognisable element should be visible
  await expect(
    page.getByRole('heading', { name: /vehicles/i }).or(page.getByText(/no vehicles/i))
  ).toBeVisible({ timeout: 10_000 });
});

// ---------------------------------------------------------------------------
// 2. Navigate to Add Vehicle form
// ---------------------------------------------------------------------------

test('user can navigate to the Add Vehicle form', async ({ page }) => {
  await loginFreshUser(page);
  await page.goto('/vehicles/new');
  await expect(page).toHaveURL(/\/vehicles\/new/);
  // The form should have a Make input
  await expect(page.getByLabel(/make/i)).toBeVisible();
});

// ---------------------------------------------------------------------------
// 3. Create a new vehicle
// ---------------------------------------------------------------------------

test('user can create a new vehicle and it appears in the list', async ({ page }) => {
  await loginFreshUser(page);
  await page.goto('/vehicles/new');

  const uniqueMake = `TestMake-${Date.now()}`;
  await page.getByLabel(/make/i).fill(uniqueMake);
  await page.getByLabel(/model/i).fill('E2E Racer');
  await page.getByLabel(/year/i).fill('2024');

  // Select a category if the dropdown exists
  const categorySelect = page.getByLabel(/category/i);
  if (await categorySelect.isVisible()) {
    await categorySelect.selectOption({ index: 1 });
  }

  await page.getByRole('button', { name: /save|create|add vehicle/i }).click();

  // Should redirect to vehicle list or detail
  await expect(page).toHaveURL(/\/vehicles/);
  // The new vehicle's make should be visible somewhere on the page
  await expect(page.getByText(uniqueMake)).toBeVisible({ timeout: 10_000 });
});

// ---------------------------------------------------------------------------
// 4. Navigate to vehicle detail
// ---------------------------------------------------------------------------

test('user can view a vehicle detail page', async ({ page }) => {
  await loginFreshUser(page);

  // Create a vehicle first
  await page.goto('/vehicles/new');
  const uniqueMake = `DetailMake-${Date.now()}`;
  await page.getByLabel(/make/i).fill(uniqueMake);
  await page.getByLabel(/model/i).fill('Detail Model');
  await page.getByLabel(/year/i).fill('2023');
  const categorySelect = page.getByLabel(/category/i);
  if (await categorySelect.isVisible()) {
    await categorySelect.selectOption({ index: 1 });
  }
  await page.getByRole('button', { name: /save|create|add vehicle/i }).click();
  await expect(page).toHaveURL(/\/vehicles/);

  // Click the vehicle to go to detail
  await page.getByText(uniqueMake).click();
  await expect(page).toHaveURL(/\/vehicles\/[^/]+$/);
  await expect(page.getByText(uniqueMake)).toBeVisible();
});

// ---------------------------------------------------------------------------
// 5. Edit an existing vehicle
// ---------------------------------------------------------------------------

test('user can edit an existing vehicle', async ({ page }) => {
  await loginFreshUser(page);

  // Create a vehicle first
  await page.goto('/vehicles/new');
  const originalMake = `EditMake-${Date.now()}`;
  await page.getByLabel(/make/i).fill(originalMake);
  await page.getByLabel(/model/i).fill('Original Model');
  await page.getByLabel(/year/i).fill('2022');
  const categorySelect = page.getByLabel(/category/i);
  if (await categorySelect.isVisible()) {
    await categorySelect.selectOption({ index: 1 });
  }
  await page.getByRole('button', { name: /save|create|add vehicle/i }).click();
  await expect(page).toHaveURL(/\/vehicles/);

  // Navigate to the vehicle detail page
  await page.getByText(originalMake).click();
  await expect(page).toHaveURL(/\/vehicles\/[^/]+$/);

  // Click the Edit button
  const editButton = page.getByRole('link', { name: /edit/i }).or(
    page.getByRole('button', { name: /edit/i })
  );
  await editButton.click();
  await expect(page).toHaveURL(/\/vehicles\/[^/]+\/edit/);

  // Update the model field
  const updatedModel = `Updated-${Date.now()}`;
  await page.getByLabel(/model/i).clear();
  await page.getByLabel(/model/i).fill(updatedModel);
  await page.getByRole('button', { name: /save|update/i }).click();

  // Should navigate back and show updated data
  await expect(page).toHaveURL(/\/vehicles/);
  await expect(page.getByText(updatedModel)).toBeVisible({ timeout: 10_000 });
});

// ---------------------------------------------------------------------------
// 6. Form validation
// ---------------------------------------------------------------------------

test('vehicle form shows validation errors for missing required fields', async ({ page }) => {
  await loginFreshUser(page);
  await page.goto('/vehicles/new');

  // Submit without filling any fields
  await page.getByRole('button', { name: /save|create|add vehicle/i }).click();

  // Should remain on the form page
  await expect(page).toHaveURL(/\/vehicles\/new/);
});
