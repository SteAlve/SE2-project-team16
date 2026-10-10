import { defineConfig, devices } from '@playwright/test';

// `npm run e2e` starts the server and the client, waits until both answer, runs the tests
// in a browser, then stops everything.
export default defineConfig({
  testDir: './tests',
  // One test at a time: they all share the same database.
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node start-server.js',
      url: 'http://localhost:3001/api/services',
      // Don't reuse a server that's already running: it would be using your normal database.
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      cwd: '../client',
      url: 'http://localhost:5173',
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
