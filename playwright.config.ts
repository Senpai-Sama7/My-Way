import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 60 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3000',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    headless: true,
    viewport: { width: 1400, height: 900 },
    actionTimeout: 30 * 1000,
    navigationTimeout: 60 * 1000,
  },
  webServer: {
    command: 'bun run dev:server',
    url: process.env.BASE_URL || 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
