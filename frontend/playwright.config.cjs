const { defineConfig } = require('@playwright/test');
const { existsSync } = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env.test');

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run start -- --configuration=e2e --host=127.0.0.1 --port=4200',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
