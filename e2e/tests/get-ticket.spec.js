import { expect, test } from '@playwright/test';
import {
  addTicketsToday,
  countTicketsToday,
  removeAllServices,
  removeService,
  resetDatabase,
  waitingNumbers,
} from '../test-db.js';

// The Get ticket scenarios from docs/e2e-scenarios.md, one test each (S1, S2, ...).
// Every test starts from the same place: no tickets yet, and the 6 sample services.
// It's put back the same way afterwards, so the other test files find it as expected.

const SHIPPING = 1;
const BILL_PAYMENT = 2;

test.beforeEach(() => {
  resetDatabase();
});

test.afterEach(() => {
  resetDatabase();
});

const openServices = (page) => page.goto('/select-service');

const pickService = (page, name) => page.getByRole('button', { name }).click();

const ticketCode = (page) => page.locator('.ticket-number');

// A customer walks up to the kiosk, picks a service and comes back to the start.
const getTicket = async (page, name) => {
  await openServices(page);
  await pickService(page, name);
  const code = await ticketCode(page).textContent();
  await page.getByRole('button', { name: 'Ok' }).click();
  return code.trim();
};

test.describe('Main flow', () => {
  test('S1. The customer sees the services', async ({ page }) => {
    await openServices(page);

    await expect(page.getByText('What service do you need?')).toBeVisible();
    await expect(page.locator('.service-name')).toHaveText([
      'Accounts',
      'Bill payment',
      'Money transfer',
      'Pensions',
      'Registered mail pickup',
      'Shipping',
    ]);
  });

  test('S2. The customer gets a ticket', async ({ page }) => {
    await openServices(page);
    await pickService(page, 'Bill payment');

    await expect(page.getByText('Your ticket')).toBeVisible();
    await expect(ticketCode(page)).toHaveText('P-001');
  });

  test('S3. The customer goes back to the services', async ({ page }) => {
    await openServices(page);
    await pickService(page, 'Bill payment');
    await expect(ticketCode(page)).toHaveText('P-001');

    await page.getByRole('button', { name: 'Ok' }).click();

    await expect(page).toHaveURL(/\/select-service$/);
    await expect(page.getByText('What service do you need?')).toBeVisible();
  });
});

test.describe('Unique codes', () => {
  test('S4. Two customers of the same service get different codes', async ({ page }) => {
    expect(await getTicket(page, 'Bill payment')).toBe('P-001');
    expect(await getTicket(page, 'Bill payment')).toBe('P-002');
  });

  test('S5. Each service counts on its own', async ({ page }) => {
    expect(await getTicket(page, 'Bill payment')).toBe('P-001');
    expect(await getTicket(page, 'Shipping')).toBe('S-001');
  });

  test("S6. Reloading the ticket page doesn't give a new ticket", async ({ page }) => {
    await openServices(page);
    await pickService(page, 'Bill payment');
    await expect(ticketCode(page)).toHaveText('P-001');

    await page.reload();

    await expect(ticketCode(page)).toHaveText('P-001');
    expect(countTicketsToday()).toBe(1);
    await page.getByRole('button', { name: 'Ok' }).click();
    expect(await getTicket(page, 'Bill payment')).toBe('P-002');
  });
});

test.describe('Queue update', () => {
  test('S7. A new ticket joins the end of its queue', async ({ page }) => {
    await getTicket(page, 'Shipping');
    await getTicket(page, 'Shipping');

    expect(await getTicket(page, 'Shipping')).toBe('S-003');
    expect(waitingNumbers(SHIPPING)).toEqual([1, 2, 3]);
    expect(waitingNumbers(BILL_PAYMENT)).toEqual([]);
  });
});

test.describe('Error cases', () => {
  test('S8. No services set up yet', async ({ page }) => {
    removeAllServices();

    await openServices(page);

    await expect(page.getByText('No services are available at the moment.')).toBeVisible();
  });

  test('S9. The server is down', async ({ page }) => {
    // Stopping the real server would break the other tests, so the request is made to fail instead.
    await page.route('**/api/services', (route) => route.abort());

    await openServices(page);

    await expect(page.getByText('Unable to reach the server.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('S10. The ticket page is opened without picking a service', async ({ page }) => {
    await page.goto('/show-ticket');

    await expect(page.getByText('No service selected.')).toBeVisible();
    expect(countTicketsToday()).toBe(0);
  });

  test("S11. The service doesn't exist anymore", async ({ page }) => {
    await openServices(page);
    await expect(page.getByRole('button', { name: 'Bill payment' })).toBeVisible();
    // The page already shows the service, then the office stops offering it.
    removeService(BILL_PAYMENT);

    await pickService(page, 'Bill payment');

    await expect(page.getByText('This service is no longer available.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toHaveCount(0);
    expect(countTicketsToday()).toBe(0);
  });

  // New rule from the professor: after the last number of the day (999), numbering starts again from 001.
  // The server still refuses ticket 1000 (409), so this test is on hold until the server is updated.
  test.fixme('S12. The numbering starts again after the last ticket of the day', async ({ page }) => {
    addTicketsToday(BILL_PAYMENT, 999);

    await openServices(page);
    await pickService(page, 'Bill payment');

    await expect(ticketCode(page)).toHaveText('P-001');
  });
});
