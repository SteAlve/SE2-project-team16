import { expect, test } from '@playwright/test';

// A first, simple check that the whole setup works: the client opens in the browser,
// and it can reach the server and its seeded database.

test('the app opens in the browser', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Office Queue');
});

test('the client reaches the server and the seeded services', async ({ page }) => {
  // Goes through the client (port 5173), which forwards /api to the server (port 3001).
  const response = await page.request.get('/api/services');

  expect(response.status()).toBe(200);
  expect(await response.json()).toHaveLength(6);
});
