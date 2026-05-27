import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Dulce Stoc e2e tests.
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Where the test files live
  testDir: './src/tests/e2e',

  // Run tests sequentially (simpler for a homework project)
  workers: 1,

  // Retry a failing test once before marking it as failed
  retries: 1,

  // Nice HTML report generated after every run
  reporter: 'html',

  use: {
    // The dev server URL — adjust the port if yours is different
    baseURL: 'http://localhost:5173',

    // Keep a trace on first retry so you can inspect failures
    trace: 'on-first-retry',

    // Show the browser during the run (set to true to watch tests live)
    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Automatically start the Vite dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true, // reuse if already running
    timeout: 30_000,
  },
})
